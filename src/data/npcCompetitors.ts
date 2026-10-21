/**
 * npcCompetitors.ts
 *
 * NPC songs that compete dynamically in the charts.
 * They have their own momentum, decay, and release cycles —
 * the player's songs compete against a living market.
 */

import { NPCSong, MusicGenre } from '../types';

// ─── SEED POOL OF NPC SONGS ───────────────────────────────────────────────
// These are the "market" — they enter, peak, and fade like real songs.
// The engine generates new ones periodically; these are the initial batch.

export const INITIAL_NPC_SONGS: NPCSong[] = [
  // High-tier: currently dominating
  {
    id: 'npc_001', title: 'Birds of a Feather', artistId: 'billie-eilish', artistName: 'Billie Eilish',
    genre: 'Pop / Electropop', releaseWeek: -16, releaseYear: 2025,
    peakStreams: 9_200_000, currentStreams: 8_940_000, weeksOnChart: 16,
    peakPosition: 1, currentPosition: 1, decayRate: 0.06, entryMomentum: 2.5, isActive: true,
  },
  {
    id: 'npc_002', title: 'Espresso', artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter',
    genre: 'Pop / Electropop', releaseWeek: -20, releaseYear: 2025,
    peakStreams: 8_900_000, currentStreams: 8_520_000, weeksOnChart: 20,
    peakPosition: 1, currentPosition: 2, decayRate: 0.07, entryMomentum: 2.3, isActive: true,
  },
  {
    id: 'npc_003', title: 'Not Like Us', artistId: 'kendrick-lamar', artistName: 'Kendrick Lamar',
    genre: 'Trap / Hip-Hop', releaseWeek: -18, releaseYear: 2025,
    peakStreams: 8_500_000, currentStreams: 7_810_000, weeksOnChart: 18,
    peakPosition: 1, currentPosition: 3, decayRate: 0.08, entryMomentum: 3.0, isActive: true,
  },
  {
    id: 'npc_004', title: 'Good Luck, Babe!', artistId: 'chappell-roan', artistName: 'Chappell Roan',
    genre: 'Pop / Electropop', releaseWeek: -14, releaseYear: 2025,
    peakStreams: 7_500_000, currentStreams: 7_120_000, weeksOnChart: 14,
    peakPosition: 4, currentPosition: 4, decayRate: 0.06, entryMomentum: 2.1, isActive: true,
  },
  {
    id: 'npc_005', title: 'A Bar Song (Tipsy)', artistId: 'shaboozey', artistName: 'Shaboozey',
    genre: 'Pop / Electropop', releaseWeek: -22, releaseYear: 2025,
    peakStreams: 7_300_000, currentStreams: 6_840_000, weeksOnChart: 22,
    peakPosition: 2, currentPosition: 5, decayRate: 0.05, entryMomentum: 1.8, isActive: true,
  },
  {
    id: 'npc_006', title: 'Si Antes Te Hubiera Conocido', artistId: 'karol-g', artistName: 'Karol G',
    genre: 'Urbano / Reggaeton', releaseWeek: -10, releaseYear: 2025,
    peakStreams: 6_900_000, currentStreams: 6_410_000, weeksOnChart: 10,
    peakPosition: 5, currentPosition: 6, decayRate: 0.07, entryMomentum: 2.4, isActive: true,
  },
  {
    id: 'npc_007', title: 'Gata Only', artistId: 'floymenor-crismj', artistName: 'FloyyMenor, Cris Mj',
    genre: 'Urbano / Reggaeton', releaseWeek: -26, releaseYear: 2025,
    peakStreams: 6_500_000, currentStreams: 5_930_000, weeksOnChart: 26,
    peakPosition: 3, currentPosition: 7, decayRate: 0.04, entryMomentum: 2.8, isActive: true,
  },
  {
    id: 'npc_008', title: 'LUNA', artistId: 'feid', artistName: 'Feid, ATL Jacob',
    genre: 'Urbano / Reggaeton', releaseWeek: -30, releaseYear: 2025,
    peakStreams: 5_800_000, currentStreams: 5_420_000, weeksOnChart: 30,
    peakPosition: 4, currentPosition: 8, decayRate: 0.04, entryMomentum: 1.9, isActive: true,
  },
  {
    id: 'npc_009', title: 'Taste', artistId: 'sabrina-carpenter-2', artistName: 'Sabrina Carpenter',
    genre: 'Pop / Electropop', releaseWeek: -5, releaseYear: 2026,
    peakStreams: 5_600_000, currentStreams: 5_110_000, weeksOnChart: 5,
    peakPosition: 2, currentPosition: 9, decayRate: 0.08, entryMomentum: 2.6, isActive: true,
  },
  {
    id: 'npc_010', title: 'I Had Some Help', artistId: 'post-malone', artistName: 'Post Malone, Morgan Wallen',
    genre: 'Pop / Electropop', releaseWeek: -24, releaseYear: 2025,
    peakStreams: 5_200_000, currentStreams: 4_790_000, weeksOnChart: 24,
    peakPosition: 1, currentPosition: 10, decayRate: 0.05, entryMomentum: 1.7, isActive: true,
  },
  // Mid-tier
  {
    id: 'npc_011', title: 'Lose Control', artistId: 'teddy-swims', artistName: 'Teddy Swims',
    genre: 'R&B / Neo-Soul', releaseWeek: -42, releaseYear: 2025,
    peakStreams: 4_800_000, currentStreams: 4_320_000, weeksOnChart: 42,
    peakPosition: 6, currentPosition: 11, decayRate: 0.03, entryMomentum: 1.5, isActive: true,
  },
  {
    id: 'npc_012', title: 'MILLION DOLLAR BABY', artistId: 'tommy-richman', artistName: 'Tommy Richman',
    genre: 'R&B / Neo-Soul', releaseWeek: -19, releaseYear: 2025,
    peakStreams: 4_600_000, currentStreams: 4_180_000, weeksOnChart: 19,
    peakPosition: 2, currentPosition: 12, decayRate: 0.06, entryMomentum: 2.0, isActive: true,
  },
  {
    id: 'npc_013', title: 'MONACO', artistId: 'bad-bunny-2', artistName: 'Bad Bunny',
    genre: 'Urbano / Reggaeton', releaseWeek: -48, releaseYear: 2025,
    peakStreams: 4_300_000, currentStreams: 3_890_000, weeksOnChart: 48,
    peakPosition: 1, currentPosition: 13, decayRate: 0.03, entryMomentum: 2.2, isActive: true,
  },
  {
    id: 'npc_014', title: 'Beautiful Things', artistId: 'benson-boone', artistName: 'Benson Boone',
    genre: 'Pop / Electropop', releaseWeek: -35, releaseYear: 2025,
    peakStreams: 3_800_000, currentStreams: 3_280_000, weeksOnChart: 35,
    peakPosition: 1, currentPosition: 14, decayRate: 0.04, entryMomentum: 1.6, isActive: true,
  },
  {
    id: 'npc_015', title: 'Bzrp Music Sessions, Vol. 53', artistId: 'bzrp-shakira', artistName: 'Bizarrap, Shakira',
    genre: 'Trap / Hip-Hop', releaseWeek: -78, releaseYear: 2024,
    peakStreams: 9_000_000, currentStreams: 3_450_000, weeksOnChart: 78,
    peakPosition: 1, currentPosition: 15, decayRate: 0.02, entryMomentum: 3.5, isActive: true,
  },
  {
    id: 'npc_016', title: 'Too Sweet', artistId: 'hozier', artistName: 'Hozier',
    genre: 'Rock / Indie', releaseWeek: -25, releaseYear: 2025,
    peakStreams: 4_000_000, currentStreams: 2_980_000, weeksOnChart: 25,
    peakPosition: 1, currentPosition: 16, decayRate: 0.05, entryMomentum: 1.8, isActive: true,
  },
  {
    id: 'npc_017', title: 'PERRO NEGRO', artistId: 'bad-bunny-feid', artistName: 'Bad Bunny, Feid',
    genre: 'Urbano / Reggaeton', releaseWeek: -40, releaseYear: 2025,
    peakStreams: 3_600_000, currentStreams: 3_120_000, weeksOnChart: 40,
    peakPosition: 4, currentPosition: 17, decayRate: 0.03, entryMomentum: 1.9, isActive: true,
  },
  {
    id: 'npc_018', title: 'Cruel Summer', artistId: 'taylor-swift', artistName: 'Taylor Swift',
    genre: 'Pop / Electropop', releaseWeek: -92, releaseYear: 2024,
    peakStreams: 6_000_000, currentStreams: 2_840_000, weeksOnChart: 92,
    peakPosition: 1, currentPosition: 18, decayRate: 0.02, entryMomentum: 1.4, isActive: true,
  },
  {
    id: 'npc_019', title: 'BADGYAL', artistId: 'saiko', artistName: 'Saiko, JC Reyes, Dei V',
    genre: 'Urbano / Reggaeton', releaseWeek: -12, releaseYear: 2026,
    peakStreams: 3_200_000, currentStreams: 2_900_000, weeksOnChart: 12,
    peakPosition: 1, currentPosition: 19, decayRate: 0.07, entryMomentum: 2.3, isActive: true,
  },
  {
    id: 'npc_020', title: 'Columbia', artistId: 'quevedo', artistName: 'Quevedo',
    genre: 'Urbano / Reggaeton', releaseWeek: -45, releaseYear: 2025,
    peakStreams: 5_000_000, currentStreams: 2_690_000, weeksOnChart: 45,
    peakPosition: 1, currentPosition: 20, decayRate: 0.03, entryMomentum: 2.1, isActive: true,
  },
];

// ─── NPC SONG GENERATOR ───────────────────────────────────────────────────

interface NPCSongTemplate {
  titleParts: string[];
  artistParts: string[];
  genre: MusicGenre;
  tier: 'low' | 'mid' | 'high';
}

const NPC_SONG_POOL: NPCSongTemplate[] = [
  { titleParts: ['La Noche', 'El Cielo', 'Sin Ti', 'Contigo', 'Fuego'], artistParts: ['Artista Nuevo', 'Voz Urbana', 'Flow Real'], genre: 'Urbano / Reggaeton', tier: 'low' },
  { titleParts: ['Freestyle', 'Barras', 'Flow', 'Letras', 'Calle'], artistParts: ['MC Underground', 'Rapero Local', 'Trap Kid'], genre: 'Trap / Hip-Hop', tier: 'low' },
  { titleParts: ['Vibes', 'Summer', 'Dance', 'Tonight', 'Neon'], artistParts: ['Pop Star', 'Melody', 'Nova Sound'], genre: 'Pop / Electropop', tier: 'mid' },
  { titleParts: ['Amor Real', 'Contigo Siempre', 'Latidos', 'Alma'], artistParts: ['Soul Voice', 'Neo Feeling', 'R&B King'], genre: 'R&B / Neo-Soul', tier: 'mid' },
  { titleParts: ['Dembow', 'Perreo', 'La Playa', 'Vacaciones'], artistParts: ['Reggaeton Star', 'Urban King', 'Flow Latino'], genre: 'Urbano / Reggaeton', tier: 'high' },
  { titleParts: ['808s', 'Trilla', 'En La Cima', 'Pandilla'], artistParts: ['Trap Dios', 'Flow Master', 'El Barrio'], genre: 'Trap / Hip-Hop', tier: 'high' },
];

const PEAK_STREAMS_BY_TIER: Record<string, [number, number]> = {
  low: [50_000, 300_000],
  mid: [300_000, 2_000_000],
  high: [2_000_000, 7_000_000],
};

export function generateNewNPCSong(week: number, year: number): NPCSong {
  const template = NPC_SONG_POOL[Math.floor(Math.random() * NPC_SONG_POOL.length)];
  const titleWord = template.titleParts[Math.floor(Math.random() * template.titleParts.length)];
  const artistWord = template.artistParts[Math.floor(Math.random() * template.artistParts.length)];

  const [peakMin, peakMax] = PEAK_STREAMS_BY_TIER[template.tier];
  const peakStreams = peakMin + Math.floor(Math.random() * (peakMax - peakMin));
  const entryStreams = Math.floor(peakStreams * (0.5 + Math.random() * 0.5));

  return {
    id: `npc_gen_${week}_${Date.now()}`,
    title: titleWord,
    artistId: `npc_artist_${Date.now()}`,
    artistName: artistWord,
    genre: template.genre,
    releaseWeek: week,
    releaseYear: year,
    peakStreams,
    currentStreams: entryStreams,
    weeksOnChart: 0,
    peakPosition: 99,   // will be set by chart engine
    currentPosition: 99,
    decayRate: 0.06 + Math.random() * 0.08,
    entryMomentum: 1.0 + Math.random() * 2.0,
    isActive: true,
  };
}

/**
 * Advances all NPC songs by one week.
 * Songs decay naturally and eventually fall off the chart.
 */
export function advanceNPCSongs(
  songs: NPCSong[]
): NPCSong[] {
  return songs.map(song => {
    if (!song.isActive) return song;

    const weeksOnChart = song.weeksOnChart + 1;

    // Calculate new streams
    let momentum = song.entryMomentum;
    // Momentum fades after peak
    if (weeksOnChart > 3) {
      momentum = Math.max(1.0, momentum * 0.95);
    }

    // Apply decay
    const decayMultiplier = 1 - song.decayRate;
    const noise = 1 + (Math.random() - 0.5) * 0.1;
    const newStreams = Math.floor(song.currentStreams * decayMultiplier * noise);

    // Song falls off after dropping too low or being active too long
    const isActive = newStreams > 50_000 && weeksOnChart < 80;

    return {
      ...song,
      currentStreams: Math.max(0, newStreams),
      weeksOnChart,
      entryMomentum: momentum,
      isActive,
    };
  }).filter(s => s.isActive || s.weeksOnChart < 5); // keep recent inactive for display
}

/**
 * Generates the Top 50 chart from NPC songs + player songs.
 * Returns sorted entries with rank, movement, and explanation.
 */
export function buildChartFromSongs(
  npcSongs: NPCSong[],
  playerSongs: Array<{ id: string; title: string; artistName: string; streams: number; weeksOnChart: number; prevStreams?: number }>,
  country: string
): import('../types').SpotifyChartEntry[] {
  // Combine NPC and player entries
  type RawEntry = {
    id: string;
    title: string;
    artist: string;
    streams: number;
    weeksOnChart: number;
    isPlayer: boolean;
    momentum: number;
    entryReason?: string;
  };

  const allEntries: RawEntry[] = [
    ...npcSongs
      .filter(s => s.isActive && s.currentStreams > 100_000)
      .map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artistName,
        streams: s.currentStreams,
        weeksOnChart: s.weeksOnChart,
        isPlayer: false,
        momentum: s.weeksOnChart <= 2 ? 1 : s.weeksOnChart <= 4 ? 0 : -1,
        entryReason: s.entryMomentum > 2.0 ? 'new_entry' : undefined,
      })),
    ...playerSongs.map(p => ({
      id: p.id,
      title: p.title,
      artist: p.artistName,
      streams: p.streams,
      weeksOnChart: p.weeksOnChart,
      isPlayer: true,
      momentum: p.prevStreams ? (p.streams > p.prevStreams ? 1 : p.streams < p.prevStreams * 0.9 ? -1 : 0) : 0,
    })),
  ];

  // Sort by streams
  allEntries.sort((a, b) => b.streams - a.streams);

  // Build chart entries (top 50)
  return allEntries.slice(0, 50).map((entry, idx) => ({
    rank: idx + 1,
    previousRank: idx + 2, // simplified; real prev rank needs history
    songTitle: entry.title,
    artistName: entry.artist,
    streams: entry.streams,
    isPlayerSong: entry.isPlayer,
    peakRank: idx + 1,
    weeksOnChart: entry.weeksOnChart,
    country,
    momentum: entry.momentum,
    entryReason: entry.weeksOnChart <= 1 ? 'new_release' : undefined,
  }));
}
