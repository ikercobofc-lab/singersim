import { Singer, Song, SpotifyChartEntry, NPCArtist, CollaborationProposal } from '../types';

export type PlayerFameTier = 'Underground' | 'Promesa' | 'Emergente' | 'Famoso' | 'Superestrella' | 'Leyenda';

export function getPlayerFameTier(singer: Singer, discography: Song[]): PlayerFameTier {
  const fans = singer.stats.fans;
  const rep = singer.stats.reputation;
  const maxStreams = discography.length > 0 ? Math.max(...discography.map(s => s.streamsTotal)) : 0;

  const catalogSize = discography.length;
  if (catalogSize >= 12 && fans >= 5000000 && rep >= 90 && maxStreams >= 10000000) return 'Leyenda';
  if (catalogSize >= 8 && fans >= 1500000 && rep >= 78 && maxStreams >= 3000000) return 'Superestrella';
  if (catalogSize >= 5 && fans >= 500000 && rep >= 58 && maxStreams >= 1000000) return 'Famoso';
  if (catalogSize >= 3 && (fans >= 75000 || maxStreams >= 750000) && rep >= 35) return 'Emergente';
  if (catalogSize >= 1 && (fans >= 15000 || maxStreams >= 75000) && rep >= 20) return 'Promesa';
  return 'Underground';
}

/**
 * REGLA BZRP SESSION:
 * Debes ser emergente, leyenda o el artista del momento.
 */
export function checkBzrpEligibility(
  singer: Singer,
  discography: Song[],
  globalCharts: SpotifyChartEntry[],
  countryCharts: SpotifyChartEntry[]
): { eligible: boolean; reason: string; category?: 'emergente' | 'leyenda' | 'momento' } {
  if (singer.bzrpSessionCompleted) {
    return { eligible: false, reason: 'Ya grabaste tu BZRP Session histórica (única en tu carrera).' };
  }
  if (discography.length < 3) {
    return { eligible: false, reason: 'Necesitas al menos 3 canciones publicadas en tu catálogo.' };
  }

  const hasHit = discography.some(s => s.streamsTotal >= 500000 || (s.currentChartPosition || 99) <= 20);
  if (!hasHit) {
    return { eligible: false, reason: 'Necesitas al menos una canción que haya explotado (500K+ streams o Top 20).' };
  }

  // 1. ¿Es el artista del momento?
  // Top 3 en su país o Top 5 Global, o un tema con más de 2M streams en su punto álgido
  const isArtistaDelMomento = countryCharts.some(e => e.isPlayerSong && e.rank <= 3) ||
                             globalCharts.some(e => e.isPlayerSong && e.rank <= 5) ||
                             discography.some(s => s.streamsTotal >= 2000000 && (s.currentChartPosition || 99) <= 5);

  if (isArtistaDelMomento) {
    return { eligible: true, reason: '¡Eres el artista del momento liderando los charts!', category: 'momento' };
  }

  // 2. ¿Es leyenda?
  const isLeyenda = singer.stats.fans >= 5000000 && singer.stats.reputation >= 90 && discography.length >= 12;
  if (isLeyenda) {
    return { eligible: true, reason: 'Estatus de Leyenda: trayectoria respetada mundialmente.', category: 'leyenda' };
  }

  // 3. ¿Es talento emergente? (entre 20k y 250k fans con un tema viral / sonido fresco)
  const isEmergente = singer.stats.fans >= 20000 && singer.stats.fans <= 250000 && hasHit;
  if (isEmergente) {
    return { eligible: true, reason: 'Talento Emergente: Bizarrap vio tu sonido fresco y tu primer hit.', category: 'emergente' };
  }

  return {
    eligible: false,
    reason: 'Bizarrap solo convoca a talentos emergentes con sonido fresco, leyendas consagradas o al artista del momento en el top de los charts.'
  };
}

/**
 * REGLA CROSSOVER (BIG ONE) O W SOUND (OVY ON THE DRUMS):
 * Debes ser top en tu país o internacionalmente.
 */
export function checkCrossoverOrWSoundEligibility(
  singer: Singer,
  discography: Song[],
  globalCharts: SpotifyChartEntry[],
  countryCharts: SpotifyChartEntry[]
): { eligible: boolean; reason: string; isTopCountry: boolean; isTopGlobal: boolean } {
  if (discography.length < 3) {
    return { eligible: false, reason: 'Necesitas al menos 3 canciones publicadas en tu carrera.', isTopCountry: false, isTopGlobal: false };
  }

  // Top en tu país: cancion en el Top 10 nacional o > 350.000 fans
  const isTopCountry = countryCharts.some(e => e.isPlayerSong && e.rank <= 10) ||
                       discography.some(s => (s.currentChartPosition || 99) <= 10) ||
                       (singer.stats.fans >= 350000 && singer.stats.reputation >= 50);

  // Top internacionalmente: cancion en el Top 20 Global o > 900.000 fans
  const isTopGlobal = globalCharts.some(e => e.isPlayerSong && e.rank <= 10) ||
                      (singer.stats.fans >= 1500000 && singer.stats.reputation >= 70 && discography.length >= 6);

  if (isTopCountry || isTopGlobal) {
    return {
      eligible: true,
      reason: isTopGlobal 
        ? '¡Eres Top Internacional en las listas globales de Spotify!' 
        : `¡Eres Top Nacional consolidado en ${singer.nationality}!`,
      isTopCountry,
      isTopGlobal
    };
  }

  return {
    eligible: false,
    reason: 'Solo colaboran con artistas Top en su país (Top 10 nacional) o Top Internacionalmente (Top 20 Global).',
    isTopCountry: false,
    isTopGlobal: false
  };
}

/**
 * REGLAS DE COLABORACIÓN GENERAL (Colabo):
 */
export interface CollabProposalPermission {
  canPropose: boolean;
  relationType: 'mentor_small' | 'peer' | 'unlocked_famous' | 'blocked_unreached' | 'blocked_no_traction';
  badgeText: string;
  badgeColor: string;
  explanation: string;
}

export function evaluateCollabPermission(
  singer: Singer,
  discography: Song[],
  targetArtist: NPCArtist,
  inbox: CollaborationProposal[]
): CollabProposalPermission {
  const playerTier = getPlayerFameTier(singer, discography);
  const targetTier = targetArtist.fameTier;

  const hasHistory = inbox.some(m => m.fromArtist.id === targetArtist.id) || 
                     (singer.contactedArtistIds || []).includes(targetArtist.id);

  const hasTraction = discography.some(s => s.streamsTotal >= 35000) || singer.stats.fans >= 12000;
  const hasBomba = discography.some(s => s.streamsTotal >= 500000 || (s.currentChartPosition || 99) <= 20);

  const tierWeight: Record<string, number> = {
    'Underground': 0,
    'Promesa': 1,
    'Emergente': 2,
    'Famoso': 3,
    'Superestrella': 4,
    'Leyenda': 5
  };

  const pWeight = tierWeight[playerTier] ?? 0;
  const tWeight = tierWeight[targetTier] ?? 2;

  // CASO 0: Underground sin ninguna tracción
  if (playerTier === 'Underground' && !hasTraction) {
    return {
      canPropose: false,
      relationType: 'blocked_no_traction',
      badgeText: 'Sin tracción',
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      explanation: 'Aún estás en el underground sin canciones que hayan sonado. Debes ser una promesa que empieza a sonar o sacar una bomba para colaborar.'
    };
  }

  // CASO 1: Jugador ya es Famoso / Superestrella / Leyenda (pWeight >= 3)
  if (pWeight >= 3) {
    // Si el artista es más pequeño que el jugador (apadrinar)
    if (tWeight < pWeight) {
      return {
        canPropose: true,
        relationType: 'mentor_small',
        badgeText: 'Apadrinar (Ayudar a crecer)',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        explanation: `Como artista ${playerTier}, puedes pedir colaboración a ${targetArtist.name} (${targetTier}) para impulsarle y ayudarle a crecer en la industria.`
      };
    }

    // Si el artista es del mismo nivel o mayor
    if (hasHistory) {
      return {
        canPropose: true,
        relationType: 'unlocked_famous',
        badgeText: 'Contacto Desbloqueado',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        explanation: `¡Contacto disponible! ${targetArtist.name} ya te ha escrito previamente y existe sintonía mutua para lanzar un junte.`
      };
    } else {
      return {
        canPropose: false,
        relationType: 'blocked_unreached',
        badgeText: 'Requiere propuesta previa',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        explanation: `Para pedir colaboración a ${targetArtist.name} (${targetTier}), debes haber recibido primero una propuesta o contacto suyo. ¡Sigue sonando fuerte para que te descubra!`
      };
    }
  }

  // CASO 2: Jugador es pequeño o emergente (Promesa / Emergente, pWeight <= 2)
  // Artistas de popularidad similar (Promesas / Emergentes)
  if (Math.abs(pWeight - tWeight) <= 1 && tWeight <= 2) {
    return {
      canPropose: true,
      relationType: 'peer',
      badgeText: 'Misma Popularidad (Pares)',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      explanation: `Tienen popularidad similar (${playerTier} y ${targetTier}). Pueden colaborar de igual a igual para sumar fans y romper juntos.`
    };
  }

  // Artistas más grandes (Famosos, Superestrellas, Leyendas)
  if (tWeight >= 3) {
    if (hasHistory) {
      return {
        canPropose: true,
        relationType: 'unlocked_famous',
        badgeText: 'Contacto Desbloqueado',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        explanation: `¡Increíble! ${targetArtist.name} ya se puso en contacto contigo antes. Puedes proponerle cerrar el tema.`
      };
    }

    return {
      canPropose: false,
      relationType: 'blocked_unreached',
      badgeText: 'Fuera de alcance directo',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      explanation: hasBomba
        ? `${targetArtist.name} es un artista consagrado. Aunque tu bomba ya suena, debes esperar a que descubra tu música y te contacte él/ella primero.`
        : `Para que un artista consagrado como ${targetArtist.name} se interese en ti, primero debes sacar una bomba o convertirte en promesa que empiece a sonar.`
    };
  }

  return {
    canPropose: false,
    relationType: 'blocked_no_traction',
    badgeText: 'No disponible',
    badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    explanation: 'Aún no cumples los requisitos de popularidad para colaborar con este artista.'
  };
}
