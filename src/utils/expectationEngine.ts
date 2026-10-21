/**
 * expectationEngine.ts — Sistema de Expectación del Público y Memoria Histórica
 *
 * Gestiona:
 * - Declaraciones públicas y su memoria histórica
 * - Expectación acumulada por proyectos
 * - Directos de Instagram/YouTube
 * - Adelantos y pistas musicales
 * - Rumores y teorías de fans
 * - Recuperación de declaraciones antiguas
 * - Reacciones de la comunidad
 *
 * Principios:
 * - La expectación se construye gradualmente
 * - Las declaraciones antiguas pueden ser recordadas
 * - El silencio genera teorías solo con indicios suficientes
 * - Los artistas NPC también tienen expectación
 * - Los resultados dependen de la popularidad y contexto
 */

import {
  Singer,
  Album,
  Song,
  PublicStatement,
  ProjectExpectation,
  ProjectTeaser,
  LiveStreamEvent,
  NewsArticle,
  RumorItem,
  StatementType,
  StatementCommitmentLevel,
  ProjectAnnouncementStatus,
  ProjectExpectationLevel,
  LiveStreamType,
  LiveStreamPlatform,
} from '../types';

// ─── UTILIDADES ───────────────────────────────────────────

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ─── CREACIÓN DE DECLARACIONES ───────────────────────────

export interface CreateStatementParams {
  artistId: string;
  artistName: string;
  type: StatementType;
  text: string;
  currentWeek: number;
  currentYear: number;
  context: string;
  relatedProjectId?: string;
  relatedSongId?: string;
  relatedAlbumId?: string;
  mentionedArtists?: string[];
  followers: number; // Para calcular reacción
}

export function createPublicStatement(params: CreateStatementParams): PublicStatement {
  // Determinar nivel de compromiso basándose en el tipo
  let commitmentLevel: StatementCommitmentLevel = 'vague';
  
  if (params.type === 'release_date' || params.type === 'tracklist_reveal') {
    commitmentLevel = 'confirmed';
  } else if (params.type === 'album_announcement' || params.type === 'single_announcement') {
    commitmentLevel = 'committed';
  } else if (params.type === 'album_promise' || params.type === 'album_hint') {
    commitmentLevel = 'promising';
  } else if (params.type === 'project_tease' || params.type === 'collab_hint') {
    commitmentLevel = 'suggestive';
  }
  
  // Calcular reacción pública basada en seguidores y tipo
  let baseReaction = Math.min(100, Math.log(params.followers + 1) * 8);
  
  if (commitmentLevel === 'confirmed') baseReaction *= 1.5;
  else if (commitmentLevel === 'committed') baseReaction *= 1.3;
  else if (commitmentLevel === 'vague') baseReaction *= 0.5;
  
  const publicReactionScore = Math.min(100, Math.floor(baseReaction));
  
  return {
    id: generateId('statement'),
    artistId: params.artistId,
    artistName: params.artistName,
    type: params.type,
    commitmentLevel,
    text: params.text,
    madeAtWeek: params.currentWeek,
    madeAtYear: params.currentYear,
    context: params.context,
    relatedProjectId: params.relatedProjectId,
    relatedSongId: params.relatedSongId,
    relatedAlbumId: params.relatedAlbumId,
    mentionedArtists: params.mentionedArtists,
    isFulfilled: false,
    wasCancelled: false,
    publicReactionScore,
    timesReferenced: 0,
  };
}

// ─── GESTIÓN DE EXPECTACIÓN DE PROYECTOS ─────────────────

export interface InitProjectExpectationParams {
  projectId: string;
  projectType: 'album' | 'ep' | 'mixtape' | 'single' | 'collaboration';
  projectName?: string;
  artistId: string;
  artistName: string;
  currentWeek: number;
  initialStatementId?: string;
}

export function initProjectExpectation(params: InitProjectExpectationParams): ProjectExpectation {
  return {
    projectId: params.projectId,
    projectType: params.projectType,
    projectName: params.projectName,
    artistId: params.artistId,
    artistName: params.artistName,
    announcementStatus: params.initialStatementId ? 'hinted' : 'unannounced',
    expectationLevel: 'no_expectation',
    firstMentionWeek: params.currentWeek,
    lastUpdateWeek: params.currentWeek,
    statementIds: params.initialStatementId ? [params.initialStatementId] : [],
    teasersShown: [],
    hypeScore: 0,
    communityInterest: 0,
    mediaAttention: 0,
    fanTheories: [],
  };
}

/**
 * Actualiza la expectación de un proyecto basándose en nuevos acontecimientos.
 */
export function updateProjectExpectation(
  expectation: ProjectExpectation,
  event: {
    type: 'statement' | 'teaser' | 'announcement' | 'delay' | 'cancellation' | 'release';
    data?: any;
    currentWeek: number;
  }
): ProjectExpectation {
  const updated = { ...expectation, lastUpdateWeek: event.currentWeek };
  
  switch (event.type) {
    case 'statement':
      // Nueva declaración sobre el proyecto
      if (event.data?.statementId) {
        updated.statementIds.push(event.data.statementId);
        updated.hypeScore = Math.min(100, updated.hypeScore + 5);
        updated.communityInterest = Math.min(100, updated.communityInterest + 8);
        
        // Actualizar nivel de expectación
        if (updated.statementIds.length >= 3 && updated.expectationLevel === 'no_expectation') {
          updated.expectationLevel = 'curiosity';
        }
      }
      break;
      
    case 'teaser':
      // Adelanto mostrado
      if (event.data?.teaser) {
        updated.teasersShown.push(event.data.teaser);
        updated.hypeScore = Math.min(100, updated.hypeScore + 15);
        updated.communityInterest = Math.min(100, updated.communityInterest + 12);
        updated.mediaAttention = Math.min(100, updated.mediaAttention + 10);
        
        if (updated.announcementStatus === 'hinted') {
          updated.announcementStatus = 'teased';
        }
        
        if (updated.expectationLevel === 'curiosity' || updated.expectationLevel === 'no_expectation') {
          updated.expectationLevel = 'interest';
        }
      }
      break;
      
    case 'announcement':
      // Anuncio oficial
      updated.announcementStatus = event.data?.hasDate ? 'dated' : 'announced';
      updated.hypeScore = Math.min(100, updated.hypeScore + 25);
      updated.communityInterest = Math.min(100, updated.communityInterest + 20);
      updated.mediaAttention = Math.min(100, updated.mediaAttention + 25);
      
      if (event.data?.hasDate) {
        updated.expectationLevel = 'hype';
        updated.expectedReleaseWeek = event.data.releaseWeek;
      } else {
        updated.expectationLevel = 'high_anticipation';
      }
      break;
      
    case 'delay':
      // Retraso anunciado
      updated.announcementStatus = 'delayed';
      updated.hypeScore = Math.max(0, updated.hypeScore - 15);
      updated.communityInterest = Math.max(0, updated.communityInterest - 10);
      updated.expectationLevel = 'anticipation';
      if (event.data?.newReleaseWeek) {
        updated.expectedReleaseWeek = event.data.newReleaseWeek;
      }
      break;
      
    case 'cancellation':
      // Proyecto cancelado
      updated.announcementStatus = 'cancelled';
      updated.hypeScore = 0;
      updated.expectationLevel = 'no_expectation';
      break;
      
    case 'release':
      // Proyecto finalmente lanzado
      updated.announcementStatus = 'released';
      updated.actualReleaseWeek = event.currentWeek;
      updated.expectationLevel = 'no_expectation'; // Ya no hay expectación
      
      // Evaluar si cumplió expectativas
      if (event.data?.initialStreams && event.data?.quality) {
        const expectedPerformance = updated.hypeScore * 1000; // Expectativas en streams
        const actualPerformance = event.data.initialStreams;
        const ratio = actualPerformance / Math.max(1, expectedPerformance);
        
        updated.metExpectations = ratio >= 0.7;
        updated.performanceVsHype = Math.max(-1, Math.min(1, (ratio - 1)));
      }
      break;
  }
  
  return updated;
}

/**
 * Calcula el decay natural de expectación con el tiempo.
 */
export function decayExpectation(
  expectation: ProjectExpectation,
  currentWeek: number
): ProjectExpectation {
  const weeksSinceUpdate = currentWeek - expectation.lastUpdateWeek;
  
  if (weeksSinceUpdate <= 0) return expectation;
  
  // Decay progresivo
  const decayRate = 0.02; // 2% por semana
  const decay = Math.pow(1 - decayRate, weeksSinceUpdate);
  
  return {
    ...expectation,
    hypeScore: Math.floor(expectation.hypeScore * decay),
    communityInterest: Math.floor(expectation.communityInterest * decay * 0.95),
    mediaAttention: Math.floor(expectation.mediaAttention * decay * 0.9),
  };
}

// ─── DETECCIÓN DE TEORÍAS Y RUMORES ──────────────────────

export interface TheoryDetectionContext {
  artist: Singer;
  statements: PublicStatement[];
  expectations: ProjectExpectation[];
  weeksSinceLastRelease: number;
  currentWeek: number;
  existingRumors: RumorItem[];
}

/**
 * Detecta si el silencio del artista debe generar teorías.
 */
export function detectSilenceTheories(context: TheoryDetectionContext): RumorItem[] {
  const theories: RumorItem[] = [];
  
  // Solo generar teorías si hay suficientes indicios
  const recentStatements = context.statements.filter(
    s => s.artistId === 'player' && 
    context.currentWeek - s.madeAtWeek < 24 && // últimos 6 meses
    !s.isFulfilled
  );
  
  const hasUnfulfilledPromises = recentStatements.some(
    s => s.commitmentLevel === 'promising' || s.commitmentLevel === 'committed'
  );
  
  const hasActiveExpectation = context.expectations.some(
    e => e.artistId === 'player' && 
    e.expectationLevel !== 'no_expectation' &&
    e.announcementStatus !== 'released' &&
    e.announcementStatus !== 'cancelled'
  );
  
  // Condiciones para generar teorías
  const shouldGenerateTheories = 
    context.weeksSinceLastRelease >= 6 && // 6+ meses sin publicar
    (hasUnfulfilledPromises || hasActiveExpectation) &&
    context.artist.fame.followers >= 5000; // Mínimo de seguidores
  
  if (!shouldGenerateTheories) return theories;
  
  // Evitar duplicar teorías recientes
  const recentTheoryAboutSilence = context.existingRumors.some(
    r => r.title.includes('silencio') || r.title.includes('preparando') &&
    r.timeAgo.includes('Semana') &&
    parseInt(r.timeAgo.match(/\d+/)?.[0] || '999') < context.currentWeek - 4
  );
  
  if (recentTheoryAboutSilence) return theories;
  
  // Seleccionar tipo de teoría basándose en el contexto
  const theoreyTemplates = [];
  
  if (hasUnfulfilledPromises) {
    const oldStatement = recentStatements.find(s => s.commitmentLevel === 'promising');
    if (oldStatement) {
      theoreyTemplates.push({
        title: `Los fans recuperan lo que ${context.artist.artistName} prometió hace meses`,
        snippet: `"${oldStatement.text}" - Una declaración de hace ${Math.floor((context.currentWeek - oldStatement.madeAtWeek) / 4)} meses vuelve a circular en redes mientras el silencio continúa.`,
        hype: 15,
      });
    }
  }
  
  if (hasActiveExpectation) {
    const expectation = context.expectations.find(e => e.artistId === 'player');
    if (expectation && expectation.projectType === 'album') {
      theoreyTemplates.push({
        title: `¿Se acerca el álbum de ${context.artist.artistName}? Las pistas empiezan a cobrar sentido`,
        snippet: `Después de ${context.weeksSinceLastRelease} meses sin música nueva, los fans analizan cada detalle buscando señales del proyecto prometido.`,
        hype: 18,
      });
    }
  }
  
  // Teorías generales
  theoreyTemplates.push(
    {
      title: `¿Qué está preparando ${context.artist.artistName}? El misterio crece`,
      snippet: `Han pasado ${context.weeksSinceLastRelease} meses y la comunidad empieza a especular sobre lo que podría estar trabajando en silencio.`,
      hype: 12,
    },
    {
      title: `Las teorías sobre el próximo proyecto de ${context.artist.artistName} se multiplican`,
      snippet: `Fans y medios buscan pistas en publicaciones antiguas mientras el silencio musical continúa.`,
      hype: 14,
    }
  );
  
  const selectedTheory = pickRandom(theoreyTemplates);
  
  theories.push({
    id: generateId('theory'),
    title: selectedTheory.title,
    leakSnippet: selectedTheory.snippet,
    source: pickRandom(['Reddit', 'Twitter / X', 'TikTok', 'Foros de música', 'Discord de fans']),
    timeAgo: `Semana ${context.currentWeek}`,
    hypeBonus: selectedTheory.hype,
    artistInvolved: context.artist.artistName,
    verified: false,
  });
  
  return theories;
}

/**
 * Genera teorías basadas en un adelanto o pista.
 */
export function generateTeaserTheories(
  teaser: ProjectTeaser,
  artist: Singer,
  expectation: ProjectExpectation,
  currentWeek: number
): RumorItem[] {
  const theories: RumorItem[] = [];
  
  const templates = [];
  
  if (teaser.type === 'audio_snippet') {
    templates.push(
      {
        title: `Fans intentan identificar la canción del adelanto de ${artist.artistName}`,
        snippet: `El fragmento compartido ha generado cientos de teorías sobre qué proyecto podría ser. "${teaser.content}"`,
        hype: 20,
      },
      {
        title: `¿Era eso del álbum? El adelanto de ${artist.artistName} enciende las redes`,
        snippet: `La comunidad analiza cada segundo del audio compartido buscando pistas sobre el proyecto prometido.`,
        hype: 22,
      }
    );
  } else if (teaser.type === 'collab_hint') {
    templates.push({
      title: `¿Con quién colabora ${artist.artistName}? La especulación crece`,
      snippet: `Una pista sobre una posible colaboración ha disparado las teorías. Los fans intentan adivinar la identidad del artista invitado.`,
      hype: 18,
    });
  } else if (teaser.type === 'title_hint') {
    templates.push({
      title: `Posible título revelado: fans descifran la pista de ${artist.artistName}`,
      snippet: `"${teaser.content}" - La comunidad debate si esto confirma el nombre del próximo proyecto.`,
      hype: 16,
    });
  }
  
  if (templates.length === 0) return theories;
  
  const selected = pickRandom(templates);
  
  theories.push({
    id: generateId('teaser_theory'),
    title: selected.title,
    leakSnippet: selected.snippet,
    source: pickRandom(['Twitter / X', 'TikTok', 'Reddit', 'Instagram']),
    timeAgo: `Semana ${currentWeek}`,
    hypeBonus: selected.hype,
    artistInvolved: artist.artistName,
    verified: teaser.viralityScore > 60,
  });
  
  return theories;
}

// ─── DIRECTOS / LIVE STREAMS ─────────────────────────────

export interface CreateLiveStreamParams {
  artistId: string;
  artistName: string;
  platform: LiveStreamPlatform;
  type: LiveStreamType;
  title: string;
  duration: number; // minutos
  currentWeek: number;
  followers: number;
  monthlyListeners: number;
  // Contenido del directo
  topics?: string[];
  statementsToCreate?: Array<{
    type: StatementType;
    text: string;
    relatedProjectId?: string;
  }>;
  teasersToShow?: Omit<ProjectTeaser, 'id' | 'revealedAtWeek'>[];
  songsToPlay?: string[];
}

export function simulateLiveStream(params: CreateLiveStreamParams): LiveStreamEvent {
  const baseAudience = Math.min(params.followers, params.monthlyListeners * 0.05);
  
  // Multiplicadores por plataforma
  const platformMultiplier: Record<LiveStreamPlatform, number> = {
    instagram: 0.03, // 3% de seguidores típicamente
    youtube: 0.02,   // 2% de suscriptores
    twitch: 0.08,    // 8% si tiene comunidad activa
  };
  
  // Multiplicadores por tipo
  const typeMultiplier: Record<LiveStreamType, number> = {
    casual_chat: 0.8,
    studio_session: 1.2,
    qa: 1.0,
    listening_party: 1.3,
    teaser_reveal: 1.8,
    announcement: 2.0,
    comeback_special: 2.5,
  };
  
  const peakViewers = Math.floor(
    baseAudience *
    platformMultiplier[params.platform] *
    typeMultiplier[params.type] *
    (0.8 + Math.random() * 0.4) // variación
  );
  
  const averageViewers = Math.floor(peakViewers * (0.6 + Math.random() * 0.2));
  const totalViews = Math.floor(peakViewers * (3 + Math.random() * 5)); // vistas posteriores
  
  // Engagement
  const engagementRate = Math.min(0.15, Math.max(0.03, Math.random() * 0.1));
  const likes = Math.floor(totalViews * engagementRate);
  const comments = Math.floor(totalViews * engagementRate * 0.4);
  const shares = Math.floor(totalViews * engagementRate * 0.1);
  
  // Sentiment basado en tipo y contenido
  let sentiment: LiveStreamEvent['sentiment'] = 'positive';
  if (params.teasersToShow && params.teasersToShow.length > 0) {
    sentiment = 'very_positive';
  } else if (params.type === 'casual_chat') {
    sentiment = Math.random() > 0.7 ? 'neutral' : 'positive';
  }
  
  // Comentarios simulados
  const topComments = generateLiveStreamComments(params, peakViewers);
  
  // Hype generado
  let hypeGenerated = 10;
  if (params.statementsToCreate && params.statementsToCreate.length > 0) {
    hypeGenerated += params.statementsToCreate.length * 8;
  }
  if (params.teasersToShow && params.teasersToShow.length > 0) {
    hypeGenerated += params.teasersToShow.length * 15;
  }
  if (params.type === 'announcement' || params.type === 'teaser_reveal') {
    hypeGenerated *= 1.5;
  }
  
  const followersGained = Math.floor(peakViewers * 0.15 * (hypeGenerated / 30));
  const viralClips = hypeGenerated > 40 ? Math.floor(Math.random() * 5) + 1 : 0;
  const newsGenerated = hypeGenerated > 50 || viralClips > 2;
  
  return {
    id: generateId('livestream'),
    artistId: params.artistId,
    artistName: params.artistName,
    platform: params.platform,
    type: params.type,
    title: params.title,
    scheduledWeek: params.currentWeek,
    duration: params.duration,
    topics: params.topics || [],
    statementsM: [], // Se llenarán después
    teasersShown: [], // Se llenarán después
    songsPlayed: params.songsToPlay || [],
    peakViewers,
    averageViewers,
    totalViews,
    likes,
    comments,
    shares,
    sentiment,
    topComments,
    hypeGenerated: Math.min(100, hypeGenerated),
    followersGained,
    viralClips,
    newsGenerated,
  };
}

function generateLiveStreamComments(
  params: CreateLiveStreamParams,
  viewers: number
): string[] {
  const comments: string[] = [];
  
  if (viewers < 100) {
    comments.push(
      'Por fin un directo! 🔥',
      'Llevaba esperando esto',
      'Qué buena vibra'
    );
  } else if (viewers < 1000) {
    comments.push(
      '¡Estamos aquí! 🙌',
      'Cuándo sale la nueva música?',
      'Este directo está increíble',
      'Más gente tiene que ver esto'
    );
  } else {
    comments.push(
      'TODO EL MUNDO ESTÁ AQUÍ 🔥🔥🔥',
      'Esto es historia',
      'Los números no paran de subir',
      'La expectación es real',
      'Por favor dinos algo sobre el álbum'
    );
  }
  
  if (params.statementsToCreate && params.statementsToCreate.length > 0) {
    comments.push(
      '¿QUÉ ACABA DE DECIR?',
      'CONFIRMADO??? 👀',
      'Esto se viene grande',
      'Ya era hora que dijera algo'
    );
  }
  
  if (params.teasersToShow && params.teasersToShow.length > 0) {
    comments.push(
      'ESE ADELANTO 😱😱😱',
      'NECESITO LA CANCIÓN COMPLETA YA',
      'Esto va a ser BRUTAL',
      'El snippet es una locura'
    );
  }
  
  return comments.slice(0, Math.min(8, comments.length));
}

// ─── EXPORTACIONES ────────────────────────────────────────

export {
  generateId,
  pickRandom,
};
