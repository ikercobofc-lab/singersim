/**
 * newsEngine.ts — Sistema dinámico de noticias musicales
 *
 * Genera noticias realistas basadas en acontecimientos reales del juego:
 * - Descubrimiento de artistas emergentes
 * - Canciones que empiezan a sonar
 * - Parones de actividad (6+ meses sin publicar)
 * - Regresos después de ausencias
 * - Entradas y ascensos en charts
 * - Hitos de reproducciones
 * - Viralidad y crecimiento acelerado
 *
 * Principios:
 * - No regala fama ni inventa datos
 * - Evita repeticiones mediante historial de eventos cubiertos
 * - Calcula umbrales adaptativos según popularidad previa
 * - Genera titulares variados sin repetir la misma estructura
 * - Las noticias surgen de eventos reales, no al azar
 */

import { Singer, Song, NewsArticle, SpotifyChartEntry } from '../types';

// ─── TIPOS ────────────────────────────────────────────────────────────────

export interface NewsGenerationContext {
  singer: Singer;
  discography: Song[];
  currentWeek: number;
  currentYear: number;
  globalCharts: SpotifyChartEntry[];
  countryCharts: Record<string, SpotifyChartEntry[]>;
  existingNews: NewsArticle[];
  coveredMilestones: Set<string>; // Para evitar duplicados
}

interface NewsEvent {
  type: 'discovery' | 'song_growth' | 'chart_entry' | 'chart_rise' | 'hiatus' | 'comeback' | 'viral' | 'milestone' | 'number_one';
  songId?: string;
  songTitle?: string;
  country?: string;
  streams?: number;
  chartPosition?: number;
  previousPosition?: number;
  monthsSinceLastRelease?: number;
  milestoneType?: 'platinum' | 'gold' | 'streams_1M' | 'streams_10M' | 'top10' | 'number1';
}

// ─── PLANTILLAS DE TITULARES ─────────────────────────────────────────────

const DISCOVERY_HEADLINES = [
  '¿Quién es {artist}? El artista que lo está petando con "{song}"',
  'De desconocido a fenómeno: {artist} empieza a conquistar las listas con "{song}"',
  'La canción de {artist} que cada vez escucha más gente',
  '"{song}" se vuelve viral y pone a {artist} en el radar',
  'Cada vez se habla más de {artist}: ¿estamos ante el próximo gran descubrimiento?',
  'El artista revelación que está sorprendiendo con "{song}"',
  '{artist} empieza a hacerse un hueco en la escena musical',
  'De artista emergente a nombre a seguir: el ascenso de {artist}',
  'Las cifras de "{song}" empiezan a llamar la atención',
  '¿El próximo éxito inesperado? {artist} gana popularidad con "{song}"',
  'Atención a {artist}: "{song}" rompe expectativas',
  '{artist} llega para quedarse con "{song}"',
  'El fenómeno {artist} no deja de crecer con "{song}"',
  '"{song}" pone a {artist} en el mapa musical',
  'Descubre a {artist}, el artista del que todos hablan por "{song}"',
  'Nuevo talento emergente: {artist} sorprende con "{song}"',
  '{artist} es el nombre que debes conocer gracias a "{song}"',
  'Ojo con {artist}: su "{song}" no para de sumar oyentes',
  'El artista que está en boca de todos: {artist} y su "{song}"',
  '¿Quién hay detrás de "{song}"? Conoce a {artist}',
];

const SONG_GROWTH_HEADLINES = [
  '"{song}" de {artist} no para de crecer en reproducciones',
  'El impulso imparable de "{song}": {artist} se dispara',
  '"{song}" se convierte en el tema del momento para {artist}',
  'Las cifras de "{song}" explotan: {artist} en ascenso',
  'Crecimiento acelerado: "{song}" de {artist} gana tracción',
  '"{song}" se vuelve viral y {artist} lo celebra',
  'El éxito inesperado de "{song}" sorprende a la industria',
  '{artist} ve cómo "{song}" se dispara en streaming',
  '"{song}": la canción de {artist} que no deja de sumar oyentes',
  'Momentum imparable para "{song}" de {artist}',
  '{artist} rompe récords propios con "{song}"',
  'Crecimiento explosivo: "{song}" multiplica sus cifras',
  '"{song}" se convierte en fenómeno inesperado',
  'El hit de {artist} que no deja de crecer: "{song}"',
  'Las reproducciones de "{song}" se disparan',
];

const CHART_ENTRY_HEADLINES = [
  '{artist} entra en el Top 50 de {country} con "{song}"',
  '"{song}" de {artist} debuta en el puesto #{position} de {country}',
  'Oficial: {artist} conquista el Top 50 de {country} con "{song}"',
  '{artist} logra su primera entrada en listas con "{song}"',
  'El Top 50 de {country} da la bienvenida a {artist} con "{song}"',
  '"{song}" coloca a {artist} en el puesto #{position} de {country}',
  'Debut triunfal: {artist} entra en el Top 50 de {country}',
  '{artist} se estrena en listas: "{song}" entra directa al Top 50',
  'Primera vez en el Top 50: {artist} lo consigue con "{song}"',
  '{artist} marca hito entrando en el Top 50 de {country}',
  '"{song}" hace historia: {artist} en el Top 50 de {country}',
  'El sueño cumplido: {artist} entra en listas con "{song}"',
];

const CHART_RISE_HEADLINES = [
  '{artist} sube al Top {position} de {country} con "{song}"',
  'Imparable: "{song}" de {artist} alcanza el puesto #{position}',
  '{artist} asciende en {country}: "{song}" llega al Top {position}',
  '"{song}" no se detiene: {artist} ya está en el puesto #{position}',
  'Ascenso meteórico: {artist} alcanza el #{position} con "{song}"',
  '{artist} se consolida en el Top {position} de {country}',
  'Top {position} para {artist}: "{song}" sigue escalando',
  '{artist} conquista el puesto #{position} con "{song}"',
  '"{song}" escala al Top {position} en {country}',
  'Ascenso imparable: {artist} ya está en el #{position}',
];

const NUMBER_ONE_HEADLINES = [
  '{artist} alcanza el #1 en {country} con "{song}"',
  'Número uno: {artist} corona el Top 50 de {country} con "{song}"',
  '"{song}" de {artist} llega a lo más alto en {country}',
  'Histórico: {artist} consigue su primer #1 con "{song}"',
  '{artist} domina {country}: "{song}" es número uno',
  'El reinado de {artist}: "{song}" alcanza el #1',
  '{artist} en la cima: "{song}" es lo más escuchado de {country}',
];

const HIATUS_HEADLINES = [
  '{artist} lleva {months} meses sin publicar música: ¿qué está pasando?',
  '{months} meses de silencio para {artist}: sus fans esperan nueva música',
  '¿Está preparando algo? {artist} lleva tiempo alejado de los lanzamientos',
  'Los seguidores de {artist} esperan noticias tras {months} meses sin estrenos',
  'Después de {months} meses sin novedades, crecen las dudas sobre {artist}',
  '{artist} en el radar: {months} meses sin música nueva',
  'La ausencia de {artist}: {months} meses sin lanzamientos',
  '¿Dónde está {artist}? {months} meses sin nuevas canciones',
  '{artist}: {months} meses sin novedades musicales',
  'El silencio de {artist} se alarga: {months} meses sin publicar',
  'Fans de {artist} preguntan: ¿cuándo volverá? Ya son {months} meses',
  'La espera se hace larga: {artist} cumple {months} meses sin música',
];

const COMEBACK_HEADLINES = [
  '{artist} regresa tras {months} meses con "{song}"',
  'El esperado regreso de {artist}: "{song}" ya está aquí',
  'Después de {months} meses, {artist} vuelve con "{song}"',
  '{artist} rompe el silencio: nueva música después de {months} meses',
  'Regreso triunfal: {artist} lanza "{song}" tras {months} meses',
  '{artist} está de vuelta con "{song}" después de una larga ausencia',
  'La espera terminó: {artist} regresa con "{song}"',
  'Por fin: {artist} vuelve a la música con "{song}"',
  '{artist} pone fin a {months} meses de ausencia con "{song}"',
  'El comeback del año: {artist} regresa con "{song}"',
  'Después de {months} meses, {artist} sorprende con "{song}"',
];

const VIRAL_HEADLINES = [
  '"{song}" de {artist} se vuelve viral a nivel mundial',
  'Fenómeno global: "{song}" de {artist} arrasa en redes',
  '{artist} conquista el mundo con el éxito viral de "{song}"',
  '"{song}" se convierte en la canción más hablada del momento',
  'Viral imparable: "{song}" de {artist} rompe internet',
  '"{song}" se viraliza y pone a {artist} en el mapa global',
  'Éxito viral: {artist} arrasa con "{song}"',
  '{artist} protagoniza fenómeno viral con "{song}"',
  '"{song}": el hit viral de {artist} que arrasa',
  'Toda la industria habla de "{song}" de {artist}',
];

const MILESTONE_HEADLINES = [
  '{artist} supera el millón de reproducciones con "{song}"',
  '"{song}" de {artist} alcanza cifras históricas',
  'Hito para {artist}: "{song}" consigue disco de oro',
  '{artist} celebra el éxito de "{song}": disco de platino',
  '"{song}" supera todas las expectativas: {streams} reproducciones',
  '{artist} marca récord con "{song}": ya son {streams} streams',
];

// ─── FUENTES DE NOTICIAS ─────────────────────────────────────────────────

const NEWS_SOURCES = [
  'MondoSonoro',
  'Jenesaispop',
  'Billboard España',
  'Rolling Stone',
  'Los 40',
  'Cadena SER',
  'El País Música',
  'Spotify Charts',
  'Apple Music News',
  'Music Weekly',
];

// ─── UTILIDADES ──────────────────────────────────────────────────────────

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.floor(num / 1_000)}K`;
  return num.toString();
}

function getMilestoneKey(type: string, songId?: string, detail?: string): string {
  return `${type}_${songId || 'global'}_${detail || 'default'}`;
}

function replacePlaceholders(template: string, vars: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// ─── DETECCIÓN DE EVENTOS ────────────────────────────────────────────────

/**
 * Detecta si una canción merece una noticia de descubrimiento.
 * Criterios:
 * - Artista relativamente desconocido (< 50K oyentes antes)
 * - Canción con crecimiento significativo
 * - Supera umbrales de reproducciones
 */
function detectDiscoveryEvent(
  song: Song,
  singer: Singer,
  context: NewsGenerationContext
): NewsEvent | null {
  // No generar noticias de descubrimiento si ya es famoso
  const listeners = singer.fame?.monthlyListeners || 0;
  if (listeners > 150_000) return null;

  // Calcular si la canción está creciendo significativamente
  const streams = song.streamsThisWeek || 0;
  const totalStreams = song.streamsTotal || 0;

  // Umbrales adaptativos basados en popularidad previa
  const isNewSong = (context.currentWeek - (song.releaseWeek || 0)) <= 4;
  const isVeryNewArtist = listeners < 5_000;
  
  // Umbrales más bajos para artistas completamente desconocidos
  const minStreamsWeekly = isVeryNewArtist ? 10_000 : 50_000;
  const minTotal = isVeryNewArtist ? 30_000 : 100_000;

  // La canción debe tener tracción real
  if (streams < minStreamsWeekly || totalStreams < minTotal) return null;

  // Verificar que no se haya cubierto ya este hito
  const milestoneKey = getMilestoneKey('discovery', song.id, 'initial');
  if (context.coveredMilestones.has(milestoneKey)) return null;

  return {
    type: 'discovery',
    songId: song.id,
    songTitle: song.title,
    streams: totalStreams,
  };
}

/**
 * Detecta si una canción tiene un crecimiento acelerado.
 */
function detectSongGrowthEvent(
  song: Song,
  singer: Singer,
  context: NewsGenerationContext
): NewsEvent | null {
  const currentStreams = song.streamsThisWeek || 0;
  const peakStreams = song.streamsPeakWeek || 0;
  const totalStreams = song.streamsTotal || 0;

  // Debe tener un crecimiento notable (50%+) y volumen significativo
  const hasSignificantGrowth = currentStreams > peakStreams * 1.5;
  const hasVolume = currentStreams > 75_000;
  
  if (!hasSignificantGrowth || !hasVolume) return null;

  // Verificar que no se haya cubierto recientemente
  const milestoneKey = getMilestoneKey('growth', song.id, `week_${context.currentWeek}`);
  if (context.coveredMilestones.has(milestoneKey)) return null;

  return {
    type: 'song_growth',
    songId: song.id,
    songTitle: song.title,
    streams: currentStreams,
  };
}

/**
 * Detecta entrada o ascenso significativo en charts.
 */
function detectChartEvents(
  song: Song,
  context: NewsGenerationContext
): NewsEvent[] {
  const events: NewsEvent[] = [];

  // Revisar todos los charts disponibles
  const allCharts = {
    'Global': context.globalCharts,
    ...context.countryCharts,
  };

  for (const [country, charts] of Object.entries(allCharts)) {
    const chartEntry = charts.find(e => e.songTitle === song.title && e.isPlayerSong);
    if (!chartEntry) continue;

    const position = chartEntry.rank;
    const prevPosition = chartEntry.previousRank;
    const weeksOnChart = chartEntry.weeksOnChart || 0;

    // NÚMERO UNO
    if (position === 1) {
      const milestoneKey = getMilestoneKey('number_one', song.id, country);
      if (!context.coveredMilestones.has(milestoneKey)) {
        events.push({
          type: 'number_one',
          songId: song.id,
          songTitle: song.title,
          country,
          chartPosition: 1,
        });
        context.coveredMilestones.add(milestoneKey);
      }
    }

    // NUEVA ENTRADA AL TOP 50
    if (weeksOnChart === 1 && position <= 50) {
      const milestoneKey = getMilestoneKey('chart_entry', song.id, country);
      if (!context.coveredMilestones.has(milestoneKey)) {
        events.push({
          type: 'chart_entry',
          songId: song.id,
          songTitle: song.title,
          country,
          chartPosition: position,
        });
        context.coveredMilestones.add(milestoneKey);
      }
    }

    // ASCENSO SIGNIFICATIVO (10+ posiciones o entrada al Top 10)
    if (prevPosition && position < prevPosition) {
      const climb = prevPosition - position;
      const enteredTop10 = prevPosition > 10 && position <= 10;
      const enteredTop5 = prevPosition > 5 && position <= 5;

      if (climb >= 10 || enteredTop10 || enteredTop5) {
        const tier = position <= 5 ? 'top5' : position <= 10 ? 'top10' : 'top20';
        const milestoneKey = getMilestoneKey('chart_rise', song.id, `${country}_${tier}`);
        
        if (!context.coveredMilestones.has(milestoneKey)) {
          events.push({
            type: 'chart_rise',
            songId: song.id,
            songTitle: song.title,
            country,
            chartPosition: position,
            previousPosition: prevPosition,
          });
          context.coveredMilestones.add(milestoneKey);
        }
      }
    }
  }

  return events;
}

/**
 * Detecta artistas con más de 6 meses sin publicar.
 */
function detectHiatusEvent(
  singer: Singer,
  discography: Song[],
  context: NewsGenerationContext
): NewsEvent | null {
  // Encontrar el último lanzamiento
  const releasedSongs = discography.filter(s => s.status === 'released' && s.releaseWeek);
  if (releasedSongs.length === 0) return null; // No hay canciones aún

  const lastSong = releasedSongs.reduce((latest, song) => 
    (song.releaseWeek || 0) > (latest.releaseWeek || 0) ? song : latest
  );

  const weeksInactive = context.currentWeek - (lastSong.releaseWeek || 0);
  const monthsInactive = Math.floor(weeksInactive / 4);

  // Detectar parón de 6+ meses
  if (monthsInactive >= 6) {
    // Generar noticia solo en hitos específicos (6, 9, 12, 18, 24 meses)
    const milestoneMonths = [6, 9, 12, 18, 24, 36];
    const shouldReport = milestoneMonths.some(m => 
      monthsInactive >= m && monthsInactive < m + 1
    );

    if (!shouldReport) return null;

    const milestoneKey = getMilestoneKey('hiatus', 'player', `months_${monthsInactive}`);
    if (context.coveredMilestones.has(milestoneKey)) return null;

    // Solo generar si el artista tiene cierta relevancia (al menos 5K oyentes)
    const listeners = singer.fame?.monthlyListeners || 0;
    if (listeners < 5_000) return null;

    return {
      type: 'hiatus',
      monthsSinceLastRelease: monthsInactive,
    };
  }

  return null;
}

/**
 * Detecta regreso tras ausencia prolongada.
 */
function detectComebackEvent(
  song: Song,
  singer: Singer,
  discography: Song[],
  context: NewsGenerationContext
): NewsEvent | null {
  // Esta canción debe ser un lanzamiento reciente
  const isNewRelease = (context.currentWeek - (song.releaseWeek || 0)) <= 1;
  if (!isNewRelease) return null;

  // Buscar penúltimo lanzamiento
  const releasedSongs = discography
    .filter(s => s.status === 'released' && s.releaseWeek && s.id !== song.id)
    .sort((a, b) => (b.releaseWeek || 0) - (a.releaseWeek || 0));

  if (releasedSongs.length === 0) return null; // Es el primer lanzamiento

  const previousSong = releasedSongs[0];
  const weeksSince = (song.releaseWeek || 0) - (previousSong.releaseWeek || 0);
  const monthsSince = Math.floor(weeksSince / 4);

  // Solo considerar comeback si han pasado 6+ meses
  if (monthsSince < 6) return null;

  const milestoneKey = getMilestoneKey('comeback', song.id, 'return');
  if (context.coveredMilestones.has(milestoneKey)) return null;

  return {
    type: 'comeback',
    songId: song.id,
    songTitle: song.title,
    monthsSinceLastRelease: monthsSince,
  };
}

/**
 * Detecta canciones virales (crecimiento explosivo + volumen alto).
 */
function detectViralEvent(
  song: Song,
  singer: Singer,
  context: NewsGenerationContext
): NewsEvent | null {
  const currentStreams = song.streamsThisWeek || 0;
  const totalStreams = song.streamsTotal || 0;
  const peakStreams = song.streamsPeakWeek || 0;

  // Crecimiento explosivo (3x o más) + volumen alto
  const isExplosive = currentStreams > peakStreams * 3;
  const hasHighVolume = currentStreams > 500_000;

  if (!isExplosive || !hasHighVolume) return null;

  const milestoneKey = getMilestoneKey('viral', song.id, 'explosion');
  if (context.coveredMilestones.has(milestoneKey)) return null;

  return {
    type: 'viral',
    songId: song.id,
    songTitle: song.title,
    streams: currentStreams,
  };
}

/**
 * Detecta hitos de reproducciones.
 */
function detectMilestoneEvent(
  song: Song,
  context: NewsGenerationContext
): NewsEvent | null {
  const totalStreams = song.streamsTotal || 0;

  // Hitos: 1M, 5M, 10M, 50M, 100M
  const milestones = [
    { threshold: 1_000_000, key: '1M' },
    { threshold: 5_000_000, key: '5M' },
    { threshold: 10_000_000, key: '10M' },
    { threshold: 50_000_000, key: '50M' },
    { threshold: 100_000_000, key: '100M' },
  ];

  for (const milestone of milestones) {
    if (totalStreams >= milestone.threshold) {
      const milestoneKey = getMilestoneKey('milestone', song.id, milestone.key);
      if (!context.coveredMilestones.has(milestoneKey)) {
        context.coveredMilestones.add(milestoneKey);
        return {
          type: 'milestone',
          songId: song.id,
          songTitle: song.title,
          streams: totalStreams,
          milestoneType: milestone.key as any,
        };
      }
    }
  }

  return null;
}

// ─── GENERACIÓN DE NOTICIAS ──────────────────────────────────────────────

function createNewsArticle(event: NewsEvent, singer: Singer): NewsArticle {
  const artistName = singer.artistName;
  let headline = '';
  let snippet = '';
  let category: NewsArticle['category'] = 'ranking';
  let sentiment: NewsArticle['sentiment'] = 'positive';

  const vars: Record<string, any> = {
    artist: artistName,
    song: event.songTitle || 'Nueva Canción',
    country: event.country || 'Global',
    position: event.chartPosition || 0,
    months: event.monthsSinceLastRelease || 0,
    streams: formatNumber(event.streams || 0),
  };

  switch (event.type) {
    case 'discovery':
      headline = replacePlaceholders(pickRandom(DISCOVERY_HEADLINES), vars);
      snippet = `${artistName} empieza a sonar con fuerza. "${event.songTitle}" acumula ${vars.streams} reproducciones y el nombre del artista empieza a circular por la industria.`;
      category = 'lanzamiento';
      sentiment = 'positive';
      break;

    case 'song_growth':
      headline = replacePlaceholders(pickRandom(SONG_GROWTH_HEADLINES), vars);
      snippet = `Las cifras de "${event.songTitle}" no dejan de crecer. ${artistName} ve cómo su tema gana tracción semana tras semana.`;
      category = 'ranking';
      sentiment = 'positive';
      break;

    case 'chart_entry':
      headline = replacePlaceholders(pickRandom(CHART_ENTRY_HEADLINES), vars);
      snippet = `${artistName} logra entrar en el Top 50 de ${event.country} con "${event.songTitle}", debutando en el puesto #${event.chartPosition}.`;
      category = 'ranking';
      sentiment = 'positive';
      break;

    case 'chart_rise':
      headline = replacePlaceholders(pickRandom(CHART_RISE_HEADLINES), vars);
      snippet = `"${event.songTitle}" de ${artistName} continúa su ascenso y ya ocupa el puesto #${event.chartPosition} en ${event.country}.`;
      category = 'ranking';
      sentiment = 'viral';
      break;

    case 'number_one':
      headline = replacePlaceholders(pickRandom(NUMBER_ONE_HEADLINES), vars);
      snippet = `Histórico: ${artistName} alcanza el número uno en ${event.country} con "${event.songTitle}". Un logro que marca su carrera.`;
      category = 'ranking';
      sentiment = 'viral';
      break;

    case 'hiatus':
      headline = replacePlaceholders(pickRandom(HIATUS_HEADLINES), vars);
      snippet = `Ya han pasado ${event.monthsSinceLastRelease} meses desde el último lanzamiento de ${artistName}. Sus seguidores esperan noticias sobre nueva música.`;
      category = 'rumores';
      sentiment = 'neutral';
      break;

    case 'comeback':
      headline = replacePlaceholders(pickRandom(COMEBACK_HEADLINES), vars);
      snippet = `Después de ${event.monthsSinceLastRelease} meses sin publicar, ${artistName} regresa con "${event.songTitle}". El regreso que muchos esperaban.`;
      category = 'lanzamiento';
      sentiment = 'positive';
      break;

    case 'viral':
      headline = replacePlaceholders(pickRandom(VIRAL_HEADLINES), vars);
      snippet = `"${event.songTitle}" de ${artistName} se convierte en fenómeno viral con ${vars.streams} reproducciones y crecimiento explosivo.`;
      category = 'ranking';
      sentiment = 'viral';
      break;

    case 'milestone':
      headline = replacePlaceholders(pickRandom(MILESTONE_HEADLINES), vars);
      snippet = `"${event.songTitle}" alcanza un hito histórico para ${artistName}: ${vars.streams} reproducciones totales.`;
      category = 'ranking';
      sentiment = 'positive';
      break;
  }

  return {
    id: `news_${event.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    headline,
    source: pickRandom(NEWS_SOURCES),
    snippet,
    timeAgo: 'Ahora mismo',
    category,
    sentiment,
    relatedSongId: event.songId,
  };
}

/**
 * Genera noticias para la semana actual basándose en eventos reales.
 */
export function generateNewsForWeek(context: NewsGenerationContext): NewsArticle[] {
  const { singer, discography } = context;
  const news: NewsArticle[] = [];

  // 1. Detectar eventos de hiatus (solo si no hay lanzamientos recientes)
  const hiatusEvent = detectHiatusEvent(singer, discography, context);
  if (hiatusEvent) {
    news.push(createNewsArticle(hiatusEvent, singer));
  }

  // 2. Procesar cada canción del catálogo
  for (const song of discography.filter(s => s.status === 'released')) {
    // Comeback (si es nuevo lanzamiento tras ausencia)
    const comebackEvent = detectComebackEvent(song, singer, discography, context);
    if (comebackEvent) {
      news.push(createNewsArticle(comebackEvent, singer));
      continue; // Priorizar comeback sobre otros eventos
    }

    // Viral
    const viralEvent = detectViralEvent(song, singer, context);
    if (viralEvent) {
      news.push(createNewsArticle(viralEvent, singer));
    }

    // Eventos de charts (pueden ser múltiples: Global + países)
    const chartEvents = detectChartEvents(song, context);
    for (const chartEvent of chartEvents) {
      news.push(createNewsArticle(chartEvent, singer));
    }

    // Crecimiento acelerado
    const growthEvent = detectSongGrowthEvent(song, singer, context);
    if (growthEvent) {
      news.push(createNewsArticle(growthEvent, singer));
    }

    // Descubrimiento (para artistas emergentes)
    const discoveryEvent = detectDiscoveryEvent(song, singer, context);
    if (discoveryEvent) {
      news.push(createNewsArticle(discoveryEvent, singer));
    }

    // Hitos de streams
    const milestoneEvent = detectMilestoneEvent(song, context);
    if (milestoneEvent) {
      news.push(createNewsArticle(milestoneEvent, singer));
    }
  }

  // Limitar a máximo 3 noticias por semana para evitar saturación
  return news.slice(0, 3);
}

/**
 * Actualiza los timestamps de las noticias existentes.
 */
export function updateNewsTimestamps(news: NewsArticle[], weeksElapsed: number): NewsArticle[] {
  return news.map(article => {
    const currentTime = article.timeAgo;
    
    if (currentTime === 'Ahora mismo') {
      return { ...article, timeAgo: `Hace ${weeksElapsed} semana${weeksElapsed > 1 ? 's' : ''}` };
    }
    
    // Parsear tiempo existente
    const match = currentTime.match(/Hace (\d+) semana/);
    if (match) {
      const weeks = parseInt(match[1]) + weeksElapsed;
      if (weeks >= 4) {
        const months = Math.floor(weeks / 4);
        return { ...article, timeAgo: `Hace ${months} mes${months > 1 ? 'es' : ''}` };
      }
      return { ...article, timeAgo: `Hace ${weeks} semana${weeks > 1 ? 's' : ''}` };
    }
    
    return article;
  });
}
