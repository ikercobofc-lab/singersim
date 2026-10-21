/**
 * careerEngine.ts — v2
 *
 * Manages career-specific logic for each path (Artist, Producer, DJ).
 * Each path has distinct skill priorities, income sources, and progression gates.
 */

import {
  Singer,
  CareerPath,
  CareerStage,
  ArtistSkills,
  FameProfile,
  CareerState,
  Song,
  Album,
  PrivateProject,
  NPCArtist,
} from '../types';
import { deriveCareerStage, careerStageLabel } from './simulationEngine';

// ─── CAREER PATH DEFINITIONS ──────────────────────────────────────────────

export interface CareerPathConfig {
  path: CareerPath;
  label: string;
  description: string;
  primarySkills: (keyof ArtistSkills)[];
  primaryIncomeSource: string;
  startingSkillBonus: Partial<ArtistSkills>;
  startingBalance: number;
  startingListeners: number;
  availableActions: string[];
  successConditions: string[];
}

export const CAREER_PATH_CONFIGS: Record<CareerPath, CareerPathConfig> = {
  artist: {
    path: 'artist',
    label: 'Artista',
    description: 'Compón, graba y lanza canciones. Construye una identidad, actúa en directo y desarrolla una base de fans leal.',
    primarySkills: ['voice', 'composition', 'flow', 'charisma', 'performance'],
    primaryIncomeSource: 'Streaming, conciertos, royalties',
    startingSkillBonus: { voice: 5, composition: 5, flow: 5 },
    startingBalance: 1_500,
    startingListeners: 0,
    availableActions: ['record_single', 'record_album', 'perform_live', 'collab_feat', 'promote', 'tour'],
    successConditions: [
      'Lanzar 3 canciones con calidad ≥ 65',
      'Superar 10.000 oyentes mensuales',
      'Obtener una reseña positiva de prensa',
      'Entrar al Top 50 nacional',
    ],
  },

  producer: {
    path: 'producer',
    label: 'Productor',
    description: 'Crea beats, produce para otros artistas, licencia instrumentales y construye reputación como productor de referencia.',
    primarySkills: ['production', 'mixing', 'composition', 'negotiation'],
    primaryIncomeSource: 'Beats vendidos, comisiones, royalties de producción',
    startingSkillBonus: { production: 8, mixing: 6, composition: 4 },
    startingBalance: 2_500,
    startingListeners: 0,    // producers don't have "listeners" in the same way
    availableActions: ['create_beat', 'sell_beat', 'license_beat', 'produce_for_artist', 'open_studio', 'teach_workshop'],
    successConditions: [
      'Vender o licenciar 5 beats',
      'Producir para 3 artistas distintos',
      'Acumular 50.000 € en comisiones',
      'Obtener crédito en una canción con 1M+ streams',
    ],
  },

  dj: {
    path: 'dj',
    label: 'DJ',
    description: 'Actúa en clubes, festivales y eventos. Construye reputación en directo, produce remixes y desarrolla una identidad musical única.',
    primarySkills: ['performance', 'production', 'charisma', 'promotion'],
    primaryIncomeSource: 'Cachés de actuaciones, residencias, remixes',
    startingSkillBonus: { performance: 8, charisma: 6, production: 3 },
    startingBalance: 3_000,
    startingListeners: 0,
    availableActions: ['dj_set', 'create_remix', 'residency', 'festival_slot', 'produce_original', 'collaborate_artist'],
    successConditions: [
      'Realizar 5 sesiones de DJ',
      'Conseguir una residencia en un club',
      'Producir un remix con 100K+ streams',
      'Tocar en un festival con +5.000 asistentes',
    ],
  },
};

// ─── CAREER PATH INITIAL STATE ────────────────────────────────────────────

export function buildInitialCareerState(
  path: CareerPath,
  startYear: number
): CareerState {
  return {
    path,
    stage: 'bedroom',
    careerWeek: 1,
    careerYear: startYear,
    careerStartYear: startYear,
    yearsActive: 0,
    energy: 100,
    momentum: 40,
    hasSigned: false,
    consecutiveHits: 0,
    consecutiveFlops: 0,
    milestonesCompleted: [],
  };
}

export function buildInitialSkills(
  path: CareerPath,
  focusStat: keyof ArtistSkills
): ArtistSkills {
  const base: ArtistSkills = {
    voice: 35,
    composition: 30,
    flow: 30,
    production: 20,
    mixing: 15,
    performance: 25,
    charisma: 35,
    negotiation: 20,
    promotion: 25,
  };

  // Apply path bonus
  const config = CAREER_PATH_CONFIGS[path];
  for (const [k, v] of Object.entries(config.startingSkillBonus)) {
    (base as any)[k] = Math.min(60, (base as any)[k] + (v as number));
  }

  // Apply focus stat bonus (+12)
  base[focusStat] = Math.min(65, base[focusStat] + 12);

  return base;
}

export function buildInitialFame(path: CareerPath): FameProfile {
  const config = CAREER_PATH_CONFIGS[path];
  return {
    monthlyListeners: config.startingListeners,
    followers: Math.floor(config.startingListeners * 0.6),
    industryPrestige: 5,
    criticalReputation: 5,
    streetCred: path === 'dj' ? 15 : path === 'artist' ? 10 : 8,
    commercialAppeal: 5,
    culturalImpact: 0,
    longevityScore: 0,
  };
}

// ─── OPPORTUNITY GATES ────────────────────────────────────────────────────

/**
 * Returns whether a special opportunity (BZRP, Eurovision, etc.) is available.
 * Each milestone can only be earned once in a career.
 */
export interface OpportunityCheck {
  available: boolean;
  alreadyCompleted: boolean;
  reason: string;
  category?: 'emergente' | 'leyenda' | 'momento' | 'top_nacional' | 'top_global';
}

export function checkBzrpEligibility(
  fame: FameProfile,
  career: CareerState,
  discography: Song[],
  hasTopNationalSong: boolean,
  hasTopGlobalSong: boolean
): OpportunityCheck {
  if (career.milestonesCompleted.includes('bzrp_session')) {
    return { available: false, alreadyCompleted: true, reason: 'Ya grabaste tu BZRP Session histórica.' };
  }
  if (career.path !== 'artist') {
    return { available: false, alreadyCompleted: false, reason: 'Bizarrap trabaja principalmente con artistas vocales.' };
  }
  if (discography.filter(s => s.status === 'released').length < 3) {
    return { available: false, alreadyCompleted: false, reason: 'Necesitas al menos 3 canciones publicadas.' };
  }
  const hasHit = discography.some(s => s.streamsTotal >= 500_000 || (s.currentChartPosition || 99) <= 20);
  if (!hasHit) {
    return { available: false, alreadyCompleted: false, reason: 'Necesitas un tema que haya explotado (500K+ streams o Top 20).' };
  }

  // Artista del momento
  if (hasTopNationalSong || hasTopGlobalSong) {
    return { available: true, alreadyCompleted: false, reason: '¡Eres el artista del momento en los charts!', category: 'momento' };
  }

  // Leyenda
  if (fame.monthlyListeners >= 1_500_000 || fame.industryPrestige >= 80) {
    return { available: true, alreadyCompleted: false, reason: 'Estatus de Leyenda reconocido mundialmente.', category: 'leyenda' };
  }

  // Talento emergente con sonido fresco
  if (fame.monthlyListeners >= 20_000 && fame.monthlyListeners <= 250_000 && hasHit) {
    return { available: true, alreadyCompleted: false, reason: 'Talento emergente con primer hit y sonido fresco.', category: 'emergente' };
  }

  return {
    available: false,
    alreadyCompleted: false,
    reason: 'Bizarrap busca emergentes con su primer hit, leyendas consagradas o el artista del momento.',
  };
}

export function checkCrossoverEligibility(
  fame: FameProfile,
  career: CareerState,
  discography: Song[],
  hasTopNationalSong: boolean,
  hasTopGlobalSong: boolean
): OpportunityCheck {
  if (career.milestonesCompleted.includes('bigone_crossover')) {
    return { available: false, alreadyCompleted: true, reason: 'Ya grabaste tu Crossover oficial.' };
  }
  if (discography.filter(s => s.status === 'released').length < 3) {
    return { available: false, alreadyCompleted: false, reason: 'Necesitas al menos 3 canciones publicadas.' };
  }

  if (hasTopGlobalSong) {
    return { available: true, alreadyCompleted: false, reason: '¡Eres Top Internacional en las listas globales!', category: 'top_global' };
  }
  if (hasTopNationalSong || fame.monthlyListeners >= 350_000) {
    return { available: true, alreadyCompleted: false, reason: '¡Top Nacional consolidado!', category: 'top_nacional' };
  }

  return {
    available: false,
    alreadyCompleted: false,
    reason: 'Big One trabaja con artistas top en su país (Top 10 nacional) o internacionalmente (Top 20 global).',
  };
}

export function checkEurovisionEligibility(
  fame: FameProfile,
  career: CareerState,
  discography: Song[]
): OpportunityCheck {
  const participations = career.milestonesCompleted.filter(m => m.startsWith('eurovision_')).length;
  if (participations >= 2) {
    return { available: false, alreadyCompleted: true, reason: 'Has representado a tu país 2 veces. Se permite un máximo de 2 participaciones en una carrera.' };
  }

  const bigHit = discography.some(s => s.streamsTotal > 1_500_000 || (s.currentChartPosition || 99) <= 5);
  if (!bigHit) {
    return { available: false, alreadyCompleted: false, reason: 'Necesitas un hit importante antes de representar a tu país.' };
  }
  if (fame.followers < 200_000) {
    return { available: false, alreadyCompleted: false, reason: 'Se necesita al menos 200.000 seguidores para que la televisión pública te considere.' };
  }

  return { available: true, alreadyCompleted: false, reason: `Participación ${participations + 1} de 2 permitidas en tu carrera.` };
}

// ─── WEEKLY PROGRESSION ───────────────────────────────────────────────────

export interface WeeklyProgressionResult {
  newCareerYear: number;
  newCareerWeek: number;
  newYearsActive: number;
  newStage: CareerStage;
  stageChanged: boolean;
  previousStage: CareerStage;
  energyRestored: number;
  momentumDelta: number;
}

export function advanceWeek(
  career: CareerState,
  fame: FameProfile,
  catalogSize: number,
  albumCount: number,
  wasActiveThisWeek: boolean   // did the player release/perform something?
): WeeklyProgressionResult {
  const newWeek = career.careerWeek + 1;
  const isNewYear = newWeek % 52 === 0;
  const newYear = isNewYear ? career.careerYear + 1 : career.careerYear;
  const newYearsActive = newYear - career.careerStartYear;

  const previousStage = career.stage;
  const newStage = deriveCareerStage(fame, career, catalogSize, albumCount);
  const stageChanged = newStage !== previousStage;

  // Energy restores each week (sleep, recovery)
  const energyRestored = Math.min(100, career.energy + 20);

  // Momentum decays toward neutral when inactive
  const momentumDelta = wasActiveThisWeek ? 0 : -3;

  return {
    newCareerYear: newYear,
    newCareerWeek: newWeek,
    newYearsActive,
    newStage,
    stageChanged,
    previousStage,
    energyRestored,
    momentumDelta,
  };
}

// ─── PRODUCER-SPECIFIC LOGIC ──────────────────────────────────────────────

export interface BeatCommission {
  id: string;
  requestingArtistId: string;
  requestingArtistName: string;
  genre: string;
  budget: number;         // artist pays this
  royaltyRate: number;    // % producer gets from song revenue
  deadline: number;       // careerWeek deadline
  status: 'pending' | 'accepted' | 'delivered' | 'rejected' | 'expired';
  deliveredProjectId?: string;
}

export function generateBeatCommission(
  producerFame: FameProfile,
  producerSkills: ArtistSkills,
  week: number
): BeatCommission | null {
  // Commissions come in based on producer reputation
  const commissionChance = 0.1 + (producerFame.industryPrestige / 100) * 0.5;
  if (Math.random() > commissionChance) return null;

  const budgets = [500, 1000, 2000, 5000, 10000, 25000];
  const skillLevel = producerSkills.production;
  const budgetTier = Math.min(budgets.length - 1, Math.floor(skillLevel / 20));
  const budget = budgets[budgetTier] * (0.8 + Math.random() * 0.4);

  const artists = [
    { id: 'commission_artist_1', name: 'Artista Emergente Local' },
    { id: 'commission_artist_2', name: 'Rapero Regional' },
    { id: 'commission_artist_3', name: 'Cantante Urbano' },
    { id: 'commission_artist_4', name: 'Cantante Pop Independiente' },
  ];
  const artist = artists[Math.floor(Math.random() * artists.length)];

  return {
    id: `commission_${week}_${Date.now()}`,
    requestingArtistId: artist.id,
    requestingArtistName: artist.name,
    genre: 'Trap / Hip-Hop',
    budget: Math.floor(budget),
    royaltyRate: 2 + Math.floor(Math.random() * 8),
    deadline: week + 3,
    status: 'pending',
  };
}

// ─── DJ-SPECIFIC LOGIC ────────────────────────────────────────────────────

export interface DJGig {
  id: string;
  venueName: string;
  venueCapacity: number;
  fee: number;
  date: number;  // careerWeek
  type: 'club' | 'festival' | 'private_event' | 'residency_session' | 'online';
  status: 'offered' | 'accepted' | 'completed' | 'rejected' | 'cancelled';
  audienceReached: number;
  reputationGain: number;
}

export function generateDJGig(
  djFame: FameProfile,
  djSkills: ArtistSkills,
  week: number
): DJGig | null {
  const gigChance = 0.15 + (djFame.industryPrestige / 100) * 0.5 + (djSkills.performance / 100) * 0.2;
  if (Math.random() > gigChance) return null;

  const stage = djFame.monthlyListeners < 5000 ? 'bedroom' :
                djFame.monthlyListeners < 30000 ? 'local' :
                djFame.monthlyListeners < 200000 ? 'regional' : 'national';

  interface GigTier {
    type: DJGig['type'];
    capacity: number;
    feeRange: [number, number];
    reputationGain: number;
  }

  const gigTiers: Record<string, GigTier[]> = {
    bedroom: [
      { type: 'online', capacity: 500, feeRange: [0, 50], reputationGain: 1 },
      { type: 'club', capacity: 150, feeRange: [50, 200], reputationGain: 2 },
    ],
    local: [
      { type: 'club', capacity: 300, feeRange: [200, 800], reputationGain: 3 },
      { type: 'private_event', capacity: 200, feeRange: [300, 1000], reputationGain: 2 },
    ],
    regional: [
      { type: 'club', capacity: 800, feeRange: [500, 2000], reputationGain: 4 },
      { type: 'residency_session', capacity: 600, feeRange: [800, 3000], reputationGain: 5 },
      { type: 'festival', capacity: 3000, feeRange: [1000, 5000], reputationGain: 7 },
    ],
    national: [
      { type: 'festival', capacity: 10000, feeRange: [3000, 15000], reputationGain: 10 },
      { type: 'residency_session', capacity: 1500, feeRange: [2000, 8000], reputationGain: 8 },
    ],
  };

  const tiers = gigTiers[stage] || gigTiers.local;
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const fee = tier.feeRange[0] + Math.floor(Math.random() * (tier.feeRange[1] - tier.feeRange[0]));

  const venues: Record<string, string[]> = {
    online: ['Twitch Live Session', 'SoundCloud Live', 'IG Live Set'],
    club: ['Club Razzmatazz', 'Sala Apolo', 'Room 92', 'Fabrik', 'Teatre Victoria', 'Pacha Ibiza'],
    festival: ['Primavera Sound', 'Mad Cool', 'Arenal Sound', 'Tomavistas', 'Sonar'],
    private_event: ['Evento Corporativo', 'Boda VIP', 'Fiesta Privada'],
    residency_session: ['Residencia Mensual Fabrik', 'Residencia Pacha', 'Residencia Club XS'],
  };
  const venueList = venues[tier.type] || venues.club;
  const venueName = venueList[Math.floor(Math.random() * venueList.length)];

  return {
    id: `gig_${week}_${Date.now()}`,
    venueName,
    venueCapacity: tier.capacity,
    fee,
    date: week,
    type: tier.type,
    status: 'offered',
    audienceReached: Math.floor(tier.capacity * (0.6 + Math.random() * 0.4)),
    reputationGain: tier.reputationGain,
  };
}
