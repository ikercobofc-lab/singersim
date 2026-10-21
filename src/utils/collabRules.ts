/**
 * collabRules.ts — v2
 *
 * Collaboration permission and probability system.
 * Rules are now probabilistic, not binary — every collab has a chance,
 * but big artists require much more effort to reach.
 */

import {
  Singer,
  Song,
  SpotifyChartEntry,
  NPCArtist,
  CollaborationProposal,
  FameProfile,
  CareerState,
  ArtistSkills,
  PlayerFameTier,
} from '../types';
import { getPlayerFameTier, calculateCollabAcceptanceProbability } from './simulationEngine';

// ─── PLAYER TIER DERIVATION ────────────────────────────────────────────────

export { getPlayerFameTier } from './simulationEngine';

// ─── COLLAB PERMISSION ────────────────────────────────────────────────────

export interface CollabProposalPermission {
  canPropose: boolean;
  probability: number;  // 0–1 chance of acceptance if proposed
  relationType: 'mentor_small' | 'peer' | 'unlocked_famous' | 'blocked_unreached' | 'blocked_no_traction' | 'blocked_no_channel';
  badgeText: string;
  badgeColor: string;
  explanation: string;
  rejectReasonIfRefused?: string;
}

/**
 * Evaluates whether the player can propose a collaboration and how likely it is to succeed.
 */
export function evaluateCollabPermission(
  singer: Singer,
  discography: Song[],
  targetArtist: NPCArtist,
  inbox: CollaborationProposal[]
): CollabProposalPermission {
  const { fame, skills, career, relationships } = singer;

  const tierWeights: Record<string, number> = {
    Underground: 0, Promesa: 1, Emergente: 2, Famoso: 3, Superestrella: 4, Leyenda: 5,
  };

  const playerTier = getPlayerFameTier(fame, career, discography.length);
  const pWeight = tierWeights[playerTier] ?? 0;
  const tWeight = tierWeights[targetArtist.fameTier] ?? 2;

  const relScore = relationships[targetArtist.id] ?? 0;
  const hasHistory = inbox.some(m => m.fromArtistId === targetArtist.id) ||
                     (singer.contactedArtistIds || []).includes(targetArtist.id);

  const hasTraction = discography.some(s => s.streamsTotal >= 35_000) || fame.followers >= 12_000;
  const hasHit = discography.some(s => s.streamsTotal >= 500_000 || (s.currentChartPosition || 99) <= 20);
  const releasedCount = discography.filter(s => s.status === 'released').length;

  // ── CASE 0: Underground with zero traction ──
  if (playerTier === 'Underground' && !hasTraction) {
    return {
      canPropose: false,
      probability: 0,
      relationType: 'blocked_no_traction',
      badgeText: 'Sin tracción',
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      explanation: 'Lanza al menos una canción que empiece a sonar antes de proponer colaboraciones.',
    };
  }

  // ── CASE 1: Not enough catalog ──
  if (releasedCount < 1) {
    return {
      canPropose: false,
      probability: 0,
      relationType: 'blocked_no_traction',
      badgeText: 'Sin catálogo',
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      explanation: 'Necesitas al menos 1 canción publicada para proponer colaboraciones.',
    };
  }

  // ── Probability calculation ──
  const { probability, rejectReason } = calculateCollabAcceptanceProbability({
    playerFame: fame,
    playerSkills: skills,
    npcFollowers: targetArtist.followers,
    npcFameTier: targetArtist.fameTier,
    relationshipScore: relScore,
    proposalQuality: Math.min(100, skills.promotion * 0.6 + skills.negotiation * 0.4),
  });

  // ── CASE 2: Player can mentor a smaller artist ──
  if (pWeight >= 3 && tWeight < pWeight) {
    return {
      canPropose: true,
      probability: 0.75 + (relScore / 100) * 0.2,
      relationType: 'mentor_small',
      badgeText: 'Apadrinar',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      explanation: `Como ${playerTier}, puedes proponer colaborar con ${targetArtist.name} para impulsarle.`,
    };
  }

  // ── CASE 3: Existing relationship unlocks bigger artist ──
  if (tWeight > pWeight + 1 && hasHistory) {
    return {
      canPropose: true,
      probability: Math.max(0.30, probability),
      relationType: 'unlocked_famous',
      badgeText: 'Contacto Desbloqueado',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      explanation: `${targetArtist.name} ya conoce tu trabajo. Hay una relación previa que facilita la propuesta.`,
    };
  }

  // ── CASE 4: Peers (similar tier) ──
  if (Math.abs(pWeight - tWeight) <= 1) {
    return {
      canPropose: true,
      probability,
      relationType: 'peer',
      badgeText: 'Nivel Similar',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      explanation: `Tienen popularidad similar. Una buena propuesta tiene posibilidades reales.`,
    };
  }

  // ── CASE 5: Big artist, no existing channel ──
  if (tWeight > pWeight + 1) {
    // Need a hit to even be considered
    if (!hasHit) {
      return {
        canPropose: false,
        probability: 0,
        relationType: 'blocked_no_traction',
        badgeText: 'Fuera de alcance',
        badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        explanation: `Para atraer la atención de ${targetArtist.name} necesitas al menos una canción que haya explotado.`,
        rejectReasonIfRefused: rejectReason,
      };
    }

    // Has a hit but no prior relationship — very hard
    return {
      canPropose: true,  // can TRY, but low probability
      probability: Math.min(0.20, probability),
      relationType: 'blocked_unreached',
      badgeText: 'Difícil Acceso',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      explanation: hasHit
        ? `${targetArtist.name} es un artista de alto nivel. Tu hit llama su atención, pero la probabilidad es baja sin una relación previa.`
        : `Para contactar con artistas de este nivel necesitas un hit comprobado y reputación industrial.`,
      rejectReasonIfRefused: rejectReason,
    };
  }

  // ── DEFAULT: Low probability generic case ──
  return {
    canPropose: probability > 0.1,
    probability,
    relationType: 'peer',
    badgeText: 'Posible',
    badgeColor: 'bg-white/10 text-slate-300 border-white/20',
    explanation: 'La propuesta es posible pero sin garantías. Mejora tu reputación para aumentar las probabilidades.',
  };
}

/**
 * Simulates whether an NPC actually accepts a proposal.
 * Returns the outcome and, if rejected, a reason.
 */
export function resolveCollabProposal(
  permission: CollabProposalPermission,
  npcArtist: NPCArtist,
  proposedRoyalty: number
): { accepted: boolean; reason: string; counterOffer?: { royalty: number; message: string } } {
  // Expired or unavailable artist
  if (npcArtist.availability === 'retired' || npcArtist.availability === 'hiatus') {
    return { accepted: false, reason: `${npcArtist.name} está en un período de descanso y no acepta propuestas ahora mismo.` };
  }

  // Too many simultaneous projects
  if (npcArtist.currentProjects.length >= npcArtist.collab_preferences.maxProjectsSimultaneous) {
    return {
      accepted: false,
      reason: `${npcArtist.name} ya tiene demasiados proyectos en marcha. Inténtalo en unas semanas.`,
    };
  }

  // Royalty negotiation
  const preferredRoyalty = npcArtist.collab_preferences.preferredRoyaltySplit;
  if (proposedRoyalty < preferredRoyalty * 0.7) {
    // Counter-offer instead of outright reject
    return {
      accepted: false,
      reason: `La propuesta económica está por debajo de sus expectativas habituales.`,
      counterOffer: {
        royalty: preferredRoyalty,
        message: `Aprecio el proyecto, pero necesito al menos un ${preferredRoyalty}% para hacer esto bien. ¿Lo valoramos?`,
      },
    };
  }

  // Random outcome based on probability
  const roll = Math.random();
  if (roll < permission.probability) {
    return {
      accepted: true,
      reason: `${npcArtist.name} acepta la propuesta.`,
    };
  }

  // Rejected — give a contextual reason
  const genericReasons = [
    `${npcArtist.name} está enfocado en su propio proyecto ahora mismo.`,
    `No ve suficiente sintonía musical con el concepto propuesto.`,
    `Prefiere esperar a conocerte mejor antes de comprometerse.`,
    `Sus representantes no dieron el visto bueno en este momento.`,
    `Tiene dudas sobre la dirección artística del proyecto.`,
  ];

  const reason = permission.rejectReasonIfRefused ||
                 genericReasons[Math.floor(Math.random() * genericReasons.length)];

  return { accepted: false, reason };
}

// ─── LEGACY: BZRP / CROSSOVER CHECKS ─────────────────────────────────────
// These are now in careerEngine.ts — re-exported here for backward compat.
export { checkBzrpEligibility, checkCrossoverEligibility } from './careerEngine';

// ─── RELATIONSHIP DELTA ───────────────────────────────────────────────────

/**
 * How much the relationship score changes after an interaction.
 */
export function calculateRelationshipDelta(
  event: 'collab_success' | 'collab_fail' | 'rejection_sent' | 'rejection_received' | 'collab_abandoned' | 'good_conversation' | 'bad_conversation' | 'award_together'
): number {
  const deltas: Record<typeof event, number> = {
    collab_success: 15,
    collab_fail: -8,
    rejection_sent: -5,
    rejection_received: -3,
    collab_abandoned: -12,
    good_conversation: 4,
    bad_conversation: -6,
    award_together: 10,
  };
  return deltas[event] ?? 0;
}
