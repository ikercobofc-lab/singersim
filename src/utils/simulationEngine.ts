import { Singer, Song, Album, SpotifyChartEntry, Award } from '../types';

export interface ReleaseSongResult {
  song: Song;
  initialStreams: number;
  chartPositionGlobal: number; // 0 if not ranked, or 1-50
  chartPositionLocal: number;  // 1-50
  revenue: number;
  fansGained: number;
  reputationGained: number;
  isViral: boolean;
}

export const calculateSongSuccess = (
  singer: Singer,
  songDraft: {
    title: string;
    genre: Singer['genre'];
    theme: Song['theme'];
    producerName: string;
    featuredArtists: string[];
    isSingle: boolean;
    budget: number;
  },
  currentGlobalCharts: SpotifyChartEntry[]
): ReleaseSongResult => {
  // Quality rating based on singer skills
  const baseSkill = (singer.stats.voice * 0.3) + 
                    (singer.stats.composition * 0.3) + 
                    (singer.stats.flow * 0.2) + 
                    (singer.stats.charisma * 0.2);

  // Producer bonus
  let producerBonus = 0;
  if (songDraft.producerName.includes('Bizarrap')) producerBonus = 40;
  else if (songDraft.producerName.includes('Tainy') || songDraft.producerName.includes('Ovy')) producerBonus = 25;
  else if (songDraft.producerName.includes('Sky')) producerBonus = 20;

  // Features bonus
  let featureBonus = songDraft.featuredArtists.length * 15;

  // Marketing impact
  const marketingBonus = Math.min(25, Math.floor(Math.log10(songDraft.budget + 1) * 5));

  // RNG Factor (chance of becoming a viral TikTok hit - rare early on, higher with charisma and marketing)
  const viralThreshold = 0.95 - (singer.stats.charisma * 0.0005) - (Math.min(20, Math.log10(songDraft.budget + 1) * 3) * 0.002);
  const isViral = Math.random() > Math.max(0.85, viralThreshold);
  const viralMultiplier = isViral ? (2.5 + Math.random() * 2.0) : 1.0;

  const qualityScore = Math.min(100, Math.round(baseSkill + (producerBonus * 0.2) + (featureBonus * 0.2) + (marketingBonus * 0.3) + (Math.random() * 8 - 4)));

  // Realistic tier-based streams calculation
  let baseOrganicStreams = 0;
  if (singer.stats.fans < 25000) {
    // Tier 1: Underground (1,200 - 8,500 streams)
    const fanTurnout = Math.floor(singer.stats.fans * (0.35 + Math.random() * 0.25));
    const discoveryStreams = Math.floor(qualityScore * (15 + Math.random() * 20)) + (songDraft.budget * 2);
    baseOrganicStreams = Math.max(800, fanTurnout + discoveryStreams);
  } else if (singer.stats.fans < 150000) {
    // Tier 2: Emergente (25,000 - 180,000 streams)
    const fanTurnout = Math.floor(singer.stats.fans * (0.4 + Math.random() * 0.3));
    const discoveryStreams = Math.floor(qualityScore * 450) + (songDraft.budget * 4);
    baseOrganicStreams = fanTurnout + discoveryStreams;
  } else if (singer.stats.fans < 600000) {
    // Tier 3: Estrella Nacional (250,000 - 1,800,000 streams)
    const fanTurnout = Math.floor(singer.stats.fans * (0.5 + Math.random() * 0.35));
    const discoveryStreams = Math.floor(qualityScore * 4500) + (producerBonus * 15000) + (songDraft.budget * 8);
    baseOrganicStreams = fanTurnout + discoveryStreams;
  } else {
    // Tier 4: Superestrella Global (2,000,000 - 14,000,000 streams)
    const fanTurnout = Math.floor(singer.stats.fans * (0.6 + Math.random() * 0.4));
    const discoveryStreams = Math.floor(qualityScore * 35000) + (producerBonus * 80000) + (featureBonus * 70000);
    baseOrganicStreams = fanTurnout + discoveryStreams;
  }

  const initialStreams = Math.floor(baseOrganicStreams * viralMultiplier);

  // Realistic Industry Royalty (~0.0035 € per stream gross, 70% net to artist on independent release)
  const revenue = Math.floor(initialStreams * 0.0032);
  const fansGained = Math.max(25, Math.floor(initialStreams * (isViral ? 0.06 : 0.025)));
  const reputationGained = isViral ? 5 : (qualityScore > 75 ? 2 : 1);

  // Determine chart position based on lowest streams in top 20
  let chartPositionGlobal = 0;
  for (let i = 0; i < currentGlobalCharts.length; i++) {
    if (initialStreams > currentGlobalCharts[i].streams) {
      chartPositionGlobal = i + 1;
      break;
    }
  }

  const chartPositionLocal = chartPositionGlobal > 0 ? Math.max(1, chartPositionGlobal - 3) : (initialStreams > 50000 ? Math.floor(Math.random() * 20) + 1 : 0);

  const colors = [
    'from-rose-500 to-indigo-700',
    'from-emerald-400 to-cyan-600',
    'from-amber-400 to-pink-600',
    'from-violet-600 to-fuchsia-700',
    'from-blue-600 to-teal-500',
    'from-lime-400 to-emerald-700'
  ];

  const song: Song = {
    id: 'song_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    title: songDraft.title,
    genre: songDraft.genre,
    theme: songDraft.theme,
    quality: qualityScore,
    producer: songDraft.producerName,
    featuredArtists: songDraft.featuredArtists,
    streamsTotal: initialStreams,
    streamsWeekly: initialStreams,
    releaseWeek: singer.careerWeek,
    releaseYear: singer.careerYear,
    isSingle: songDraft.isSingle,
    peakChartPosition: chartPositionGlobal > 0 ? chartPositionGlobal : undefined,
    currentChartPosition: chartPositionGlobal > 0 ? chartPositionGlobal : undefined,
    coverColor: colors[Math.floor(Math.random() * colors.length)]
  };

  return {
    song,
    initialStreams,
    chartPositionGlobal,
    chartPositionLocal,
    revenue,
    fansGained,
    reputationGained,
    isViral
  };
};

export const evaluateAlbumSuccess = (
  album: Album,
  singer: Singer
): { criticScore: number; firstWeekStreams: number; revenue: number; fansGained: number } => {
  const avgTrackQuality = album.tracklist.length > 0 
    ? Math.round(album.tracklist.reduce((acc, t) => acc + t.quality, 0) / album.tracklist.length)
    : 70;

  // Critic score
  const criticScore = Math.min(99, Math.max(45, Math.round(avgTrackQuality + (Math.random() * 16 - 8))));

  // Marketing boost
  const promoMultiplier = album.marketingStrategy === 'Tiktok viral' ? 1.4 :
                          album.marketingStrategy === 'Polémica calculada' ? 1.5 : 1.25;

  const firstWeekStreams = Math.floor((singer.stats.fans * 0.85 + (avgTrackQuality * 60000)) * promoMultiplier);
  const revenue = Math.floor(firstWeekStreams * 0.0038) + Math.floor(album.marketingBudget * 0.4);
  const fansGained = Math.floor(firstWeekStreams * 0.05);

  return {
    criticScore,
    firstWeekStreams,
    revenue,
    fansGained
  };
};

export const checkGrammysEligibility = (
  discography: Song[],
  albums: Album[],
  currentYear: number
): Award[] => {
  const awards: Award[] = [];
  const songsThisYear = discography.filter(s => s.releaseYear === currentYear);
  const albumsThisYear = albums.filter(a => a.status === 'released' && a.releaseYear === currentYear);

  if (songsThisYear.length > 0) {
    const topSong = [...songsThisYear].sort((a, b) => b.streamsTotal - a.streamsTotal)[0];
    if (topSong.streamsTotal > 2000000) {
      const won = Math.random() > 0.4;
      awards.push({
        id: 'grammy_song_' + currentYear,
        name: 'Latin Grammy',
        category: 'Canción del Año',
        year: currentYear,
        songOrAlbumTitle: topSong.title,
        won,
        trophyIcon: '🏆'
      });
    }
  }

  if (albumsThisYear.length > 0) {
    const topAlbum = albumsThisYear[0];
    if ((topAlbum.criticScore || 0) > 75) {
      const won = Math.random() > 0.5;
      awards.push({
        id: 'grammy_album_' + currentYear,
        name: 'Grammy Awards',
        category: 'Álbum del Año',
        year: currentYear,
        songOrAlbumTitle: topAlbum.title,
        won,
        trophyIcon: '📀'
      });
    }
  }

  return awards;
};
