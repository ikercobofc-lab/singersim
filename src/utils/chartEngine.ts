/**
 * chartEngine.ts — Sistema dinámico de rankings musicales
 *
 * Genera Top 50 actualizados con rotación natural:
 * - Rankings basados en rendimiento reciente, no acumulativo histórico
 * - Nuevas canciones pueden entrar si tienen suficiente impulso
 * - Canciones antiguas caen cuando pierden popularidad
 * - Charts por país con mezclas realistas
 * - Ascensos, descensos y movimientos explicables
 *
 * Principios:
 * - Los rankings se calculan sobre ventanas temporales (semanal, mensual, anual)
 * - El impulso reciente pesa más que el historial total
 * - Los charts son deterministas pero permiten variación natural
 * - No hay saltos extremos sin justificación
 */

import { Song, NPCSong, SpotifyChartEntry } from '../types';

// ─── TIPOS ────────────────────────────────────────────────────────────────

export interface ChartSong {
  id: string;
  title: string;
  artistName: string;
  isPlayerSong: boolean;
  
  // Datos de rendimiento
  streamsThisWeek: number;
  streamsLastWeek: number;
  streamsPeak: number;
  totalStreams: number;
  
  // Contexto temporal
  releaseWeek: number;
  weeksOnChart: number;
  weeksSinceRelease: number;
  
  // Momentum y contexto
  isNewRelease: boolean;
  isViral: boolean;
  hasPlaylistSupport: boolean;
  
  // Chart history (para calcular movimiento)
  previousRank?: number;
}

export interface ChartConfig {
  country: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  currentWeek: number;
  currentYear: number;
}

// ─── CÁLCULO DE PUNTUACIÓN ───────────────────────────────────────────────

/**
 * Calcula la puntuación de una canción para el ranking.
 * 
 * Factores:
 * - Streams recientes (ventana temporal según el periodo)
 * - Momentum (crecimiento o caída)
 * - Freshness (penaliza antigüedad extrema)
 * - Viral boost (si está creciendo explosivamente)
 * - Playlist support (colocación en playlists editoriales)
 */
function calculateChartScore(song: ChartSong, config: ChartConfig): number {
  const { period, currentWeek } = config;
  
  // Streams base (ajustado por periodo)
  let baseStreams = song.streamsThisWeek;
  if (period === 'monthly') {
    // Para mensual, considerar las últimas 4 semanas
    baseStreams = song.streamsThisWeek * 4; // simplificado
  } else if (period === 'yearly') {
    // Para anual, total acumulado pero con decay
    baseStreams = song.totalStreams * 0.1; // reducimos peso histórico
  }
  
  // Momentum: crecimiento semana a semana
  const momentum = song.streamsLastWeek > 0 
    ? song.streamsThisWeek / song.streamsLastWeek
    : 1.5; // boost para nuevas entradas
  
  const momentumMultiplier = Math.min(2.0, Math.max(0.5, momentum));
  
  // Freshness penalty: canciones muy antiguas pierden relevancia
  const freshnessPenalty = song.weeksSinceRelease > 52 
    ? 0.7 // -30% para canciones de más de 1 año
    : song.weeksSinceRelease > 26
    ? 0.85 // -15% para canciones de más de 6 meses
    : 1.0;
  
  // Viral boost: crecimiento explosivo reciente
  const viralBoost = song.isViral ? 1.3 : 1.0;
  
  // Playlist boost
  const playlistBoost = song.hasPlaylistSupport ? 1.15 : 1.0;
  
  // New release boost (primeras 2 semanas)
  const newReleaseBoost = song.isNewRelease ? 1.2 : 1.0;
  
  // Calcular score final
  const score = baseStreams 
    * momentumMultiplier 
    * freshnessPenalty 
    * viralBoost 
    * playlistBoost 
    * newReleaseBoost;
  
  return Math.floor(score);
}

/**
 * Determina si una canción es viral basándose en su crecimiento.
 */
function isViralSong(song: ChartSong): boolean {
  if (song.streamsLastWeek === 0) return false;
  
  const growth = song.streamsThisWeek / song.streamsLastWeek;
  const hasHighStreams = song.streamsThisWeek > 500_000;
  
  return growth >= 2.0 && hasHighStreams;
}

// ─── CONSTRUCCIÓN DE CHARTS ──────────────────────────────────────────────

/**
 * Convierte canciones del jugador en ChartSongs.
 */
function preparePlayerSongs(
  songs: Song[],
  currentWeek: number,
  previousChart: SpotifyChartEntry[]
): ChartSong[] {
  return songs
    .filter(s => s.status === 'released' && s.releaseWeek)
    .map(song => {
      const weeksSinceRelease = currentWeek - (song.releaseWeek || 0);
      const isNewRelease = weeksSinceRelease <= 2;
      
      const prevEntry = previousChart.find(
        e => e.songTitle === song.title && e.isPlayerSong
      );
      
      const chartSong: ChartSong = {
        id: song.id,
        title: song.title,
        artistName: song.ownerIds?.map(id => id === 'player' ? 'Tú' : id).join(', ') || 'Artista',
        isPlayerSong: true,
        streamsThisWeek: song.streamsThisWeek || 0,
        streamsLastWeek: prevEntry?.streams || song.streamsPeakWeek || 0,
        streamsPeak: song.streamsPeakWeek || song.streamsThisWeek || 0,
        totalStreams: song.streamsTotal || 0,
        releaseWeek: song.releaseWeek || 0,
        weeksOnChart: song.weeksOnChart || 0,
        weeksSinceRelease,
        isNewRelease,
        isViral: false,
        hasPlaylistSupport: (song.playlistPlacements?.length || 0) > 0,
        previousRank: prevEntry?.rank,
      };
      
      chartSong.isViral = isViralSong(chartSong);
      
      return chartSong;
    });
}

/**
 * Convierte canciones NPC en ChartSongs.
 */
function prepareNPCSongs(
  npcSongs: NPCSong[],
  currentWeek: number,
  previousChart: SpotifyChartEntry[]
): ChartSong[] {
  return npcSongs
    .filter(s => s.isActive)
    .map(song => {
      const weeksSinceRelease = currentWeek - song.releaseWeek;
      const isNewRelease = weeksSinceRelease <= 2;
      
      const prevEntry = previousChart.find(
        e => e.songTitle === song.title && !e.isPlayerSong
      );
      
      // Estimar streams de la semana pasada
      const streamsLastWeek = prevEntry?.streams || song.currentStreams * 1.1;
      
      const chartSong: ChartSong = {
        id: song.id,
        title: song.title,
        artistName: song.artistName,
        isPlayerSong: false,
        streamsThisWeek: song.currentStreams,
        streamsLastWeek,
        streamsPeak: song.peakStreams,
        totalStreams: song.currentStreams * song.weeksOnChart,
        releaseWeek: song.releaseWeek,
        weeksOnChart: song.weeksOnChart,
        weeksSinceRelease,
        isNewRelease,
        isViral: false,
        hasPlaylistSupport: Math.random() > 0.7, // simplificado
        previousRank: prevEntry?.rank,
      };
      
      chartSong.isViral = isViralSong(chartSong);
      
      return chartSong;
    });
}

/**
 * Genera un Top 50 completo con rankings, movimientos y metadata.
 */
export function buildTop50Chart(
  playerSongs: Song[],
  npcSongs: NPCSong[],
  config: ChartConfig,
  previousChart: SpotifyChartEntry[] = []
): SpotifyChartEntry[] {
  // 1. Preparar todas las canciones elegibles
  const playerChartSongs = preparePlayerSongs(playerSongs, config.currentWeek, previousChart);
  const npcChartSongs = prepareNPCSongs(npcSongs, config.currentWeek, previousChart);
  
  const allSongs = [...playerChartSongs, ...npcChartSongs];
  
  // 2. Calcular scores y ordenar
  const scoredSongs = allSongs.map(song => ({
    song,
    score: calculateChartScore(song, config),
  }));
  
  scoredSongs.sort((a, b) => b.score - a.score);
  
  // 3. Construir entradas del chart
  const chartEntries: SpotifyChartEntry[] = scoredSongs.slice(0, 50).map((entry, index) => {
    const rank = index + 1;
    const song = entry.song;
    
    // Calcular movimiento
    let previousRank = song.previousRank || rank + Math.floor(Math.random() * 10);
    if (song.isNewRelease && !song.previousRank) {
      previousRank = 999; // nueva entrada
    }
    
    const movement = previousRank - rank;
    let momentum: number;
    if (movement > 5) momentum = 1; // subiendo
    else if (movement < -5) momentum = -1; // bajando
    else momentum = 0; // estable
    
    // Determinar razón de entrada
    let entryReason: string | undefined;
    if (song.isNewRelease && song.weeksOnChart <= 1) {
      entryReason = 'new_release';
    } else if (song.isViral) {
      entryReason = 'viral_tiktok';
    } else if (song.hasPlaylistSupport && movement > 10) {
      entryReason = 'playlist_placement';
    }
    
    return {
      rank,
      previousRank: previousRank === 999 ? rank : previousRank,
      songTitle: song.title,
      artistName: song.artistName,
      streams: song.streamsThisWeek,
      isPlayerSong: song.isPlayerSong,
      peakRank: song.previousRank && song.previousRank < rank ? song.previousRank : rank,
      weeksOnChart: song.weeksOnChart + 1,
      country: config.country,
      momentum,
      entryReason,
    };
  });
  
  return chartEntries;
}

/**
 * Genera charts específicos por país con mezclas realistas.
 * 
 * Lógica:
 * - Éxitos globales aparecen en todos los países
 * - Artistas locales tienen ventaja en sus mercados
 * - Géneros tienen diferentes popularidades por región
 */
export function buildCountryChart(
  playerSongs: Song[],
  npcSongs: NPCSong[],
  config: ChartConfig,
  previousChart: SpotifyChartEntry[] = []
): SpotifyChartEntry[] {
  const { country } = config;
  
  // Filtros y ajustes por país
  const countryModifiers: Record<string, {
    preferredGenres: string[];
    localBoost: number;
    languageBoost: number;
  }> = {
    'España': {
      preferredGenres: ['Urbano / Reggaeton', 'Trap / Hip-Hop', 'Pop / Electropop'],
      localBoost: 1.3,
      languageBoost: 1.2,
    },
    'Italia': {
      preferredGenres: ['Pop / Electropop', 'R&B / Neo-Soul', 'Rock / Indie'],
      localBoost: 1.4,
      languageBoost: 1.1,
    },
    'Francia': {
      preferredGenres: ['Trap / Hip-Hop', 'R&B / Neo-Soul', 'Pop / Electropop'],
      localBoost: 1.3,
      languageBoost: 1.15,
    },
    'Estados Unidos': {
      preferredGenres: ['Trap / Hip-Hop', 'Pop / Electropop', 'R&B / Neo-Soul'],
      localBoost: 1.1,
      languageBoost: 1.0,
    },
    'Global': {
      preferredGenres: [],
      localBoost: 1.0,
      languageBoost: 1.0,
    },
  };
  
  const modifier = countryModifiers[country] || countryModifiers['Global'];
  
  // Construir chart base
  let chart = buildTop50Chart(playerSongs, npcSongs, config, previousChart);
  
  // Aplicar modificadores por país (simplificado)
  // En una implementación completa, esto requeriría datos de género por canción
  // y análisis de lenguaje/origen del artista
  
  return chart;
}

/**
 * Actualiza los datos de las canciones después de calcular el chart.
 * Incrementa weeksOnChart, actualiza posiciones, etc.
 */
export function updateSongsFromChart(
  songs: Song[],
  chart: SpotifyChartEntry[]
): Song[] {
  return songs.map(song => {
    const entry = chart.find(e => e.songTitle === song.title && e.isPlayerSong);
    
    if (!entry) return song;
    
    return {
      ...song,
      currentChartPosition: entry.rank,
      peakChartPosition: Math.min(song.peakChartPosition || entry.rank, entry.rank),
      weeksOnChart: entry.weeksOnChart,
      chartMomentum: entry.momentum || 0,
    };
  });
}

/**
 * Genera un snapshot histórico del chart para análisis posterior.
 */
export interface ChartSnapshot {
  week: number;
  year: number;
  country: string;
  entries: SpotifyChartEntry[];
  timestamp: number;
}

export function createChartSnapshot(
  chart: SpotifyChartEntry[],
  config: ChartConfig
): ChartSnapshot {
  return {
    week: config.currentWeek,
    year: config.currentYear,
    country: config.country,
    entries: chart,
    timestamp: Date.now(),
  };
}

/**
 * Compara dos charts y devuelve canciones que entraron, salieron o se movieron significativamente.
 */
export function analyzeChartChanges(
  currentChart: SpotifyChartEntry[],
  previousChart: SpotifyChartEntry[]
): {
  newEntries: SpotifyChartEntry[];
  bigMovers: Array<{ entry: SpotifyChartEntry; movement: number }>;
  droppedOut: SpotifyChartEntry[];
} {
  const newEntries = currentChart.filter(
    curr => !previousChart.some(prev => prev.songTitle === curr.songTitle)
  );
  
  const bigMovers = currentChart
    .map(entry => {
      const prevEntry = previousChart.find(p => p.songTitle === entry.songTitle);
      if (!prevEntry) return null;
      
      const movement = prevEntry.rank - entry.rank;
      if (Math.abs(movement) >= 10) {
        return { entry, movement };
      }
      return null;
    })
    .filter((item): item is { entry: SpotifyChartEntry; movement: number } => item !== null);
  
  const droppedOut = previousChart.filter(
    prev => !currentChart.some(curr => curr.songTitle === prev.songTitle) && prev.rank <= 50
  );
  
  return { newEntries, bigMovers, droppedOut };
}
