/**
 * newsEngine.test.ts — Pruebas básicas del sistema de noticias
 *
 * Verifica que:
 * 1. Las noticias se generan basándose en acontecimientos reales
 * 2. No se duplican noticias del mismo hito
 * 3. Los umbrales son coherentes
 * 4. Los titulares varían correctamente
 */

import { generateNewsForWeek, NewsGenerationContext } from './newsEngine';
import { Singer, Song, CareerState, FameProfile, ArtistSkills, EconomyState } from '../types';

// Helper: Crear un singer de prueba
function createTestSinger(overrides: Partial<Singer> = {}): Singer {
  const career: CareerState = {
    path: 'artist',
    stage: 'bedroom',
    careerWeek: 10,
    careerYear: 2026,
    careerStartYear: 2026,
    yearsActive: 0,
    energy: 100,
    momentum: 0,
    hasSigned: false,
    consecutiveHits: 0,
    consecutiveFlops: 0,
    milestonesCompleted: [],
  };

  const fame: FameProfile = {
    monthlyListeners: 5000,
    followers: 2000,
    industryPrestige: 10,
    criticalReputation: 10,
    streetCred: 20,
    commercialAppeal: 15,
    culturalImpact: 5,
    longevityScore: 0,
  };

  const skills: ArtistSkills = {
    voice: 40,
    composition: 35,
    flow: 38,
    production: 20,
    mixing: 15,
    performance: 30,
    charisma: 35,
    negotiation: 10,
    promotion: 20,
  };

  const economy: EconomyState = {
    balance: 5000,
    weeklyIncome: 0,
    weeklyExpenses: 0,
    totalEarned: 0,
    totalSpent: 0,
    royaltiesStreaming: 0,
    royaltiesPublishing: 0,
    incomeFromShows: 0,
    incomeFromProduction: 0,
    incomeFromDJSets: 0,
    incomeFromLicensing: 0,
    advancesReceived: 0,
    studioRentCost: 0,
    promotionCost: 0,
    distributionFee: 0,
    managementFee: 0,
    labelShare: 0,
  };

  return {
    id: 'test_singer_1',
    artistName: 'Test Artist',
    realName: 'Test Real Name',
    age: 22,
    nationality: 'España',
    genre: 'Urbano / Reggaeton',
    avatarIcon: '🎤',
    bio: 'Test bio',
    career,
    skills,
    fame,
    economy,
    relationships: {},
    contactedArtistIds: [],
    awardIds: [],
    ...overrides,
  };
}

// Helper: Crear una canción de prueba
function createTestSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'test_song_1',
    title: 'Test Song',
    genre: 'Urbano / Reggaeton',
    theme: 'Fiesta / Flex',
    status: 'released',
    ownerIds: ['player'],
    producerId: 'player',
    featuredArtists: [],
    collaboratorIds: [],
    royaltySplits: { player: 100 },
    quality: 65,
    isRemix: false,
    releaseWeek: 8,
    releaseYear: 2026,
    streamsTotal: 150000,
    streamsThisWeek: 50000,
    streamsPeakWeek: 50000,
    weeksOnChart: 2,
    chartMomentum: 0.5,
    coverColor: '#FF5733',
    versions: [],
    isSingle: true,
    ...overrides,
  };
}

describe('Sistema de Noticias Dinámicas', () => {
  test('Debería generar noticia de descubrimiento para artista emergente con canción exitosa', () => {
    const singer = createTestSinger({
      fame: {
        monthlyListeners: 15000,
        followers: 5000,
        industryPrestige: 15,
        criticalReputation: 12,
        streetCred: 25,
        commercialAppeal: 18,
        culturalImpact: 8,
        longevityScore: 2,
      },
    });

    const song = createTestSong({
      streamsTotal: 180000,
      streamsThisWeek: 60000,
      releaseWeek: 8,
    });

    const context: NewsGenerationContext = {
      singer,
      discography: [song],
      currentWeek: 10,
      currentYear: 2026,
      globalCharts: [],
      countryCharts: {},
      existingNews: [],
      coveredMilestones: new Set(),
    };

    const news = generateNewsForWeek(context);
    
    // Debería generar al menos una noticia de descubrimiento
    expect(news.length).toBeGreaterThan(0);
    const discoveryNews = news.find(n => n.category === 'lanzamiento' || n.category === 'ranking');
    expect(discoveryNews).toBeDefined();
    expect(discoveryNews?.headline).toContain(singer.artistName);
  });

  test('No debería generar noticias duplicadas del mismo hito', () => {
    const singer = createTestSinger();
    const song = createTestSong();

    const milestoneKey = `discovery_${song.id}_initial`;
    const coveredMilestones = new Set([milestoneKey]);

    const context: NewsGenerationContext = {
      singer,
      discography: [song],
      currentWeek: 10,
      currentYear: 2026,
      globalCharts: [],
      countryCharts: {},
      existingNews: [],
      coveredMilestones,
    };

    const news = generateNewsForWeek(context);
    
    // No debería generar noticia de descubrimiento si ya fue cubierta
    const discoveryNews = news.filter(n => n.category === 'lanzamiento');
    expect(discoveryNews.length).toBe(0);
  });

  test('Debería generar noticia de parón después de 6 meses sin publicar', () => {
    const singer = createTestSinger({
      career: {
        path: 'artist',
        stage: 'local',
        careerWeek: 40, // 10 meses después
        careerYear: 2027,
        careerStartYear: 2026,
        yearsActive: 1,
        energy: 100,
        momentum: 0,
        hasSigned: false,
        consecutiveHits: 1,
        consecutiveFlops: 0,
        milestonesCompleted: [],
      },
      fame: {
        monthlyListeners: 25000,
        followers: 10000,
        industryPrestige: 25,
        criticalReputation: 20,
        streetCred: 30,
        commercialAppeal: 25,
        culturalImpact: 15,
        longevityScore: 5,
      },
    });

    // Última canción hace 6 meses (24 semanas)
    const oldSong = createTestSong({
      releaseWeek: 16, // hace 24 semanas
      status: 'released',
    });

    const context: NewsGenerationContext = {
      singer,
      discography: [oldSong],
      currentWeek: 40,
      currentYear: 2027,
      globalCharts: [],
      countryCharts: {},
      existingNews: [],
      coveredMilestones: new Set(),
    };

    const news = generateNewsForWeek(context);
    
    // Debería generar noticia de parón
    const hiatusNews = news.find(n => n.category === 'industria' && n.headline.includes('meses'));
    expect(hiatusNews).toBeDefined();
  });

  test('Debería generar noticia de regreso después de una ausencia prolongada', () => {
    const singer = createTestSinger({
      career: {
        path: 'artist',
        stage: 'regional',
        careerWeek: 50,
        careerYear: 2027,
        careerStartYear: 2026,
        yearsActive: 1,
        energy: 100,
        momentum: 0,
        hasSigned: false,
        consecutiveHits: 2,
        consecutiveFlops: 0,
        milestonesCompleted: [],
      },
    });

    const oldSong = createTestSong({
      id: 'old_song',
      releaseWeek: 20, // hace 30 semanas (~7.5 meses)
      status: 'released',
    });

    const newSong = createTestSong({
      id: 'comeback_song',
      title: 'Comeback Track',
      releaseWeek: 50, // recién lanzada
      status: 'released',
      streamsTotal: 80000,
      streamsThisWeek: 80000,
    });

    const context: NewsGenerationContext = {
      singer,
      discography: [oldSong, newSong],
      currentWeek: 50,
      currentYear: 2027,
      globalCharts: [],
      countryCharts: {},
      existingNews: [],
      coveredMilestones: new Set(),
    };

    const news = generateNewsForWeek(context);
    
    // Debería generar noticia de regreso
    const comebackNews = news.find(n => 
      n.headline.includes('regresa') || n.headline.includes('vuelve') || n.headline.includes('regreso')
    );
    expect(comebackNews).toBeDefined();
  });

  test('No debería generar noticias de descubrimiento para artistas ya famosos', () => {
    const singer = createTestSinger({
      fame: {
        monthlyListeners: 500000, // ya es famoso
        followers: 200000,
        industryPrestige: 60,
        criticalReputation: 55,
        streetCred: 50,
        commercialAppeal: 65,
        culturalImpact: 40,
        longevityScore: 30,
      },
    });

    const song = createTestSong({
      streamsTotal: 200000,
      streamsThisWeek: 80000,
    });

    const context: NewsGenerationContext = {
      singer,
      discography: [song],
      currentWeek: 10,
      currentYear: 2026,
      globalCharts: [],
      countryCharts: {},
      existingNews: [],
      coveredMilestones: new Set(),
    };

    const news = generateNewsForWeek(context);
    
    // No debería generar noticia de "descubrimiento" para un artista famoso
    const discoveryNews = news.find(n => 
      n.headline.includes('¿Quién es') || n.headline.includes('desconocido')
    );
    expect(discoveryNews).toBeUndefined();
  });
});

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTestSinger,
    createTestSong,
  };
}
