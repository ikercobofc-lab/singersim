// ============================================================
// SINGER SIMULATOR — TYPE SYSTEM v2
// Deep, realistic, long-term music industry simulation
// ============================================================

// ─── CAREER PATHS ─────────────────────────────────────────
export type CareerPath = 'artist' | 'producer' | 'dj';

export type CareerStage =
  | 'bedroom'        // Starting out, no audience
  | 'local'          // Known in local/online circles
  | 'regional'       // Regional recognition
  | 'national'       // National artist
  | 'international'  // Cross-border recognition
  | 'global'         // World-class presence
  | 'legend';        // Exceptional, sustained, multi-decade impact

export type MusicGenre =
  | 'Urbano / Reggaeton'
  | 'Trap / Hip-Hop'
  | 'Pop / Electropop'
  | 'R&B / Neo-Soul'
  | 'Rock / Indie'
  | 'Balada / Latino'
  | 'Dancehall / Afrobeats'
  | 'Electrónica / House'
  | 'Drill'
  | 'Fusión';

export type MusicSubgenre = string; // free-form for user customization

// ─── SKILLS ───────────────────────────────────────────────
/**
 * Skills grow through experience and deliberate practice.
 * They do NOT share a scale with popularity/fame.
 */
export interface ArtistSkills {
  // Core craft
  voice: number;          // 0–100: technical vocal ability
  composition: number;    // 0–100: songwriting quality
  flow: number;           // 0–100: rhythmic delivery, rap/melody phrasing
  production: number;     // 0–100: beat-making, arrangement
  mixing: number;         // 0–100: mixing/mastering quality
  // Live / performance
  performance: number;    // 0–100: live presence, energy
  charisma: number;       // 0–100: stage persona, brand appeal
  // Business
  negotiation: number;    // 0–100: deal-making, contract reading
  promotion: number;      // 0–100: marketing instincts, networking
}

export type SkillKey = keyof ArtistSkills;

// ─── FAME & REPUTATION ────────────────────────────────────
/**
 * Separate dimensions — none replaces the others.
 */
export interface FameProfile {
  // Audience
  monthlyListeners: number;   // Active monthly listeners (fluctuates)
  followers: number;          // Cumulative social/platform followers
  // Prestige
  industryPrestige: number;   // 0–100: respect from industry insiders
  criticalReputation: number; // 0–100: critical/press standing
  streetCred: number;         // 0–100: authenticity perception
  // Commercial
  commercialAppeal: number;   // 0–100: mainstream marketability
  // Historical
  culturalImpact: number;     // 0–100: accumulated over years, very slow-moving
  longevityScore: number;     // 0–100: sustained quality over time
}

// ─── CAREER STATE ─────────────────────────────────────────
export interface CareerState {
  path: CareerPath;
  stage: CareerStage;
  careerWeek: number;   // current week number (cumulative)
  careerYear: number;   // in-game calendar year
  careerStartYear: number;
  yearsActive: number;  // derived: careerYear - careerStartYear
  energy: number;       // 0–100: burnout mechanic
  // Momentum: affects how the next release performs
  momentum: number;     // 0–100: recent-activity boost/drag
  // Flags
  hasSigned: boolean;
  labelName?: string;
  labelTier?: 'indie' | 'mid' | 'major';
  managerName?: string;
  // Streak counters
  consecutiveHits: number;   // releases that charted
  consecutiveFlops: number;  // releases that underperformed
  // Special milestones — tracked to prevent repetition
  milestonesCompleted: string[]; // e.g. 'bzrp_session', 'eurovision_2026'
}

// ─── ECONOMY ──────────────────────────────────────────────
export interface EconomyState {
  balance: number;          // current €
  weeklyIncome: number;     // last week's gross income
  weeklyExpenses: number;   // last week's gross expenses
  totalEarned: number;      // lifetime gross
  totalSpent: number;       // lifetime expenses
  // Breakdown of last week
  royaltiesStreaming: number;
  royaltiesPublishing: number;
  incomeFromShows: number;
  incomeFromProduction: number; // producer: beat sales, commissions
  incomeFromDJSets: number;
  incomeFromLicensing: number;
  advancesReceived: number;
  // Expenses
  studioRentCost: number;
  promotionCost: number;
  distributionFee: number;
  managementFee: number;     // % of income to manager
  labelShare: number;        // % taken by label if signed
}

// ─── SINGER / PLAYER CHARACTER ────────────────────────────
export interface Singer {
  id: string;
  artistName: string;
  realName: string;
  age: number;
  nationality: string;
  genre: MusicGenre;
  subgenre?: MusicSubgenre;
  avatarIcon: string;
  bio: string;
  // Career
  career: CareerState;
  // Skills
  skills: ArtistSkills;
  // Fame
  fame: FameProfile;
  // Economy
  economy: EconomyState;
  // Relationships: artistId → relationship score (-100 to +100)
  relationships: Record<string, number>;
  // Contacted artist IDs (opened a channel, even if no collab yet)
  contactedArtistIds: string[];
  // Awards won
  awardIds: string[];

  // ── Legacy compatibility shims ────────────────────────────────────────────
  // Old components read singer.stats.fans, singer.stats.money, singer.careerWeek etc.
  // These optional fields are populated by GameContext for backward compat.
  stats?: {
    voice: number;
    composition: number;
    flow: number;
    charisma: number;
    energy: number;
    reputation: number;
    fans: number;
    money: number;
  };
  careerWeek?: number;   // mirrors career.careerWeek
  careerYear?: number;   // mirrors career.careerYear
  bzrpSessionCompleted?: boolean;
  ovyWSoundCompleted?: boolean;
  bigOneCrossoverCompleted?: boolean;
  eurovisionParticipationCount?: number;
}

// ─── SONG TYPES ───────────────────────────────────────────
export type SongTheme =
  | 'Amor'
  | 'Desamor'
  | 'Fiesta / Flex'
  | 'Calle / Real'
  | 'Reflexión'
  | 'Protesta / Venganza'
  | 'Identidad'
  | 'Introspección';

export type SongStatus =
  | 'idea'         // just an idea/note
  | 'demo'         // recorded demo, private
  | 'in_production'// being worked on
  | 'ready'        // finished, not yet published
  | 'scheduled'    // queued for release
  | 'released';    // publicly released

export type VersionContribution = {
  participantId: string; // 'player' or NPC artist id
  role: 'vocalist' | 'rapper' | 'producer' | 'dj' | 'composer' | 'mixing_engineer' | 'other';
  description: string;
  deliveredAt?: number; // careerWeek when delivered
};

export interface SongVersion {
  versionId: string;
  label: string;         // e.g. "v1 - primera demo", "v2 - estribillo cambiado"
  createdAtWeek: number;
  contributions: VersionContribution[];
  melodyConfig?: MelodyCustomization;
  qualityScore: number;  // 0–100
  notes: string;
}

export interface MelodyCustomization {
  musicalKey: string;
  bpm: number;
  melodyInstrument: string;
  bassType: string;
  drumPattern: string;
  vocalStyle: string;
  swing?: number;        // 0–100
  reverbWet?: number;    // 0–100
  structure?: string;    // e.g. "Intro-Verso-Coro-Verso-Coro-Bridge-Coro-Outro"
}

/**
 * Remix identity key: used to detect duplicate remixes.
 * Two remix projects are "equivalent" if they share the same
 * originalSongId, sorted participant set, and versionType.
 */
export interface RemixIdentity {
  originalSongId: string;
  participantIds: string[];  // sorted alphabetically
  versionType: 'official_remix' | 'alternate' | 'acoustic' | 'extended' | 'instrumental';
}

export interface Song {
  id: string;
  title: string;
  genre: MusicGenre;
  subgenre?: string;
  theme: SongTheme;
  status: SongStatus;

  // Authorship
  ownerIds: string[];          // IDs of rights holders (player='player')
  producerId: string;          // 'player' or NPC id
  producerName: string;        // Display name of producer
  featuredArtists: string[];   // display names of featured artists
  collaboratorIds: string[];   // IDs of all collaborators for rules checks
  royaltySplits: Record<string, number>; // id → % (must sum to ~100)

  // Quality
  quality: number;  // 0–100

  // Remix metadata
  isRemix: boolean;
  remixIdentity?: RemixIdentity;
  originalSongId?: string;
  originalSongTitle?: string;

  // Release info
  releaseWeek?: number;
  releaseYear?: number;
  scheduledWeek?: number;
  scheduledTime?: string;
  preReleaseHype?: number;

  // Performance (only meaningful for 'released' songs)
  streamsTotal: number;
  streamsThisWeek: number;
  streamsPeakWeek: number;
  weeksOnChart: number;
  peakChartPosition?: number;
  currentChartPosition?: number;
  chartMomentum: number;  // -1 to +1: falling, stable, rising

  // Certification
  certification?: 'Oro' | 'Platino' | 'Multi-Platino' | 'Diamante';

  // Visual
  coverColor: string;

  // Content
  lyrics?: { verse: string; chorus: string; punchline: string };
  melodyConfig?: MelodyCustomization;

  // Project workspace
  versions: SongVersion[];
  albumId?: string;
  isSingle: boolean;

  // Country breakdown (for released songs)
  countryStreams?: Record<string, number>;
  playlistPlacements?: string[];
  tiktokCreations?: number;
}

// ─── PRIVATE PROJECT ──────────────────────────────────────
export type ProjectPermission = 'private' | 'collaborators' | 'invite_only';

export interface ProjectActivity {
  actorId: string;     // 'player' or NPC id
  actorName: string;
  action: string;      // human-readable description
  week: number;
}

export interface CollabInvite {
  inviteId: string;
  toArtistId: string;
  toArtistName: string;
  role: VersionContribution['role'];
  message: string;
  royaltyOffered: number;  // %
  sentAtWeek: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOffer?: { royalty: number; message: string };
}

export interface PrivateProject {
  id: string;
  workingTitle: string;
  genre: MusicGenre;
  theme: SongTheme;
  permission: ProjectPermission;
  ownerIds: string[];        // always includes 'player'
  invites: CollabInvite[];
  versions: SongVersion[];
  currentVersionId: string;
  activity: ProjectActivity[];
  isArchived: boolean;
  // Relations
  sourceProjectId?: string;  // if duplicated from another project
  linkedSongId?: string;     // if published, points to Song.id
  // Remix check
  remixIdentity?: RemixIdentity;
  // Metadata
  createdAtWeek: number;
  updatedAtWeek: number;
  notes: string;
  tags: string[];
}

// ─── ALBUM ────────────────────────────────────────────────
export interface Album {
  id: string;
  title: string;
  projectType: 'album' | 'ep' | 'mixtape' | 'compilation';
  genre: MusicGenre;
  tracklist: Song[];
  status: 'planning' | 'recording' | 'scheduled' | 'released';
  scheduledReleaseWeek?: number;
  scheduledTime?: string;
  releaseYear?: number;
  marketingBudget: number;
  marketingStrategy?: 'Tiktok viral' | 'Entrevista exclusiva' | 'Vallas y publicidad' | 'Polémica calculada';
  criticScore?: number;
  coverGradient: string;
  preReleaseRumors?: string[];
  totalStreams?: number;
  
  // Expectación y seguimiento
  expectationId?: string; // ID en ProjectExpectation
  meaningfulName?: string; // Nombre significativo para el artista
  meaningBackground?: string; // Historia detrás del nombre
  announcedAtWeek?: number;
  teasersReleased?: number;
  preOrderCount?: number;
}

// ─── NPC ARTISTS ──────────────────────────────────────────
export type NPCFameTier =
  | 'Promesa'
  | 'Emergente'
  | 'Independiente'
  | 'Famoso'
  | 'Superestrella'
  | 'Leyenda';

export type NPCAvailability = 'available' | 'busy' | 'on_tour' | 'hiatus' | 'retired';

export interface NPCArtist {
  id: string;
  name: string;
  genre: MusicGenre;
  fameTier: NPCFameTier;
  followers: number;
  monthlyListeners: number;
  chemistryRequired: number;  // minimum relationship score for collab
  avatar: string;
  isProducer?: boolean;
  isDJ?: boolean;
  specialType?: 'standard' | 'bzrp' | 'w_sound' | 'crossover';
  origin?: string;
  // Dynamic state (mutates during game)
  availability: NPCAvailability;
  currentProjects: string[]; // project IDs they're involved in
  recentReleases: number;    // songs released in last 4 weeks
  interests: MusicGenre[];   // genres they're open to
  collab_preferences: {
    minPartnerMonthlyListeners: number;  // won't collab with < this
    maxProjectsSimultaneous: number;
    preferredRoyaltySplit: number; // % they expect
    openToRemix: boolean;
    openToFeature: boolean;
    openToProduction: boolean;
  };
  // Personality affects response style
  personality: 'professional' | 'artistic' | 'streetwise' | 'commercial' | 'experimental';
  // Relationship memory: remember past interactions
  conversationMemory: ConversationMemory[];
}

// ─── CONVERSATION SYSTEM ──────────────────────────────────
export type ConversationIntent =
  | 'greeting'
  | 'collab_proposal'
  | 'remix_proposal'
  | 'demo_share'
  | 'negotiation'
  | 'studio_invite'
  | 'availability_check'
  | 'small_talk'
  | 'feedback_request'
  | 'unknown';

export interface ExtractedEntities {
  artists?: string[];
  songs?: string[];
  genres?: string[];
  dates?: string[];
  collabType?: 'feature' | 'production' | 'remix' | 'joint_project';
  roles?: VersionContribution['role'][];
  royaltyMentioned?: number;
  budgetMentioned?: number;
}

export interface ConversationMessage {
  id: string;
  from: 'player' | string; // 'player' or NPC id
  text: string;
  sentAtWeek: number;
  intent?: ConversationIntent;
  entities?: ExtractedEntities;
  // If this message led to a pending proposal
  pendingProposalId?: string;
}

export interface ConversationMemory {
  week: number;
  summary: string; // compressed memory of what was discussed
}

export interface ArtistConversation {
  id: string;
  npcArtistId: string;
  messages: ConversationMessage[];
  openProposalId?: string;    // if there's an active proposal from this chat
  relationshipScore: number;  // local cache of player↔artist relationship
  lastUpdatedWeek: number;
}

// ─── COLLABORATION PROPOSAL ───────────────────────────────
export type ProposalStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'expired'
  | 'cancelled';

export interface CollaborationProposal {
  id: string;
  fromArtistId: string;
  fromArtist: NPCArtist;
  toArtistId: string; // 'player' or NPC id
  songTitleProposed: string;
  genre: MusicGenre;
  role: 'feat' | 'producer' | 'dj' | 'composer' | 'remix';
  splitOffer: number;          // % royalties offered to recipient
  budgetOffered: number;
  advancePayment: number;
  message: string;
  timestamp: string;
  sentAtWeek: number;
  expiresAtWeek: number;       // proposals expire after ~4 weeks
  status: ProposalStatus;
  rejectionReason?: string;
  counterOffer?: {
    splitCounter: number;
    advanceCounter: number;
    message: string;
  };
  specialType?: 'standard' | 'bzrp' | 'w_sound' | 'crossover';
  crossoverNumber?: number;
  crossoverPartner?: string;
  targetAlbumId?: string;
  ownership?: 'player' | 'collaborator';
  isImportant?: boolean;
  artistOrigin?: string;
  isRemixOffer?: boolean;
  multipleArtists?: string[];
  // Linked to a private project once accepted
  linkedProjectId?: string;
}

// ─── CONTRACT ─────────────────────────────────────────────
export type ContractType = 'label' | 'distribution' | 'management' | 'booking' | 'licensing';

export interface Contract {
  id: string;
  type: ContractType;
  partyName: string;
  signedWeek: number;
  durationWeeks: number;
  expiresAtWeek: number;
  terms: {
    advanceAmount?: number;         // upfront payment
    royaltyRate?: number;           // % to artist per stream
    labelSharePercent?: number;     // % label takes
    managementFeePercent?: number;  // % manager takes
    exclusivity: boolean;           // prevents signing with others
    minimumReleases?: number;       // required deliverables
    territories?: string[];
  };
  status: 'active' | 'expired' | 'breached' | 'renegotiated' | 'terminated';
  notes: string;
}

// ─── CHART ENTRY ──────────────────────────────────────────
export interface SpotifyChartEntry {
  rank: number;
  previousRank: number;
  songTitle: string;
  artistName: string;
  streams: number;
  isPlayerSong: boolean;
  peakRank: number;
  weeksOnChart: number;
  country: string;
  // For realistic momentum (optional for backward compat with initialCharts.ts)
  momentum?: number;    // weekly stream delta %
  entryReason?: string; // e.g. "viral_tiktok", "playlist_placement", "new_release"
  exitReason?: string;  // e.g. "faded", "replaced", "controversy"
}

// ─── CHART SNAPSHOT (weekly history) ──────────────────────
export interface ChartSnapshot {
  week: number;
  year: number;
  country: string;
  entries: SpotifyChartEntry[];
}

// ─── NPC COMPETITOR SONG ──────────────────────────────────
/** NPC songs that compete in charts independently of player */
export interface NPCSong {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: MusicGenre;
  releaseWeek: number;
  releaseYear: number;
  // Performance model
  peakStreams: number;       // max weekly streams it will reach
  currentStreams: number;    // this week
  weeksOnChart: number;
  peakPosition: number;
  currentPosition: number;
  decayRate: number;         // 0–1: % streams lost each week after peak
  entryMomentum: number;    // 0–3: viral multiplier at entry
  isActive: boolean;         // still on charts?
}

// ─── AWARDS ───────────────────────────────────────────────
export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  songOrAlbumTitle: string;
  won: boolean;
  nominated: boolean;
  trophyIcon: string;
}

// ─── EUROVISION ───────────────────────────────────────────
export interface EurovisionResult {
  year: number;
  songTitle: string;
  finalRank: number;
  points: number;
  winnerCountry: string;
}

// ─── NEWS / RUMORS ────────────────────────────────────────
export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  snippet: string;
  timeAgo: string;
  category: 'lanzamiento' | 'colaboracion' | 'polemica' | 'premios' | 'ranking' | 'rumores' | 'industria' | 'contrato';
  sentiment: 'positive' | 'neutral' | 'negative' | 'viral';
  relatedSongId?: string;
  relatedArtistId?: string;
}

export interface RumorItem {
  id: string;
  title: string;
  leakSnippet: string;
  source: string;
  timeAgo: string;
  hypeBonus: number;
  artistInvolved: string;
  verified: boolean;
}

// ─── PUBLIC STATEMENTS & HISTORICAL MEMORY ────────────────────────────────

export type StatementType =
  | 'casual_mention'      // Comentario casual sobre música
  | 'working_hint'        // "Estoy trabajando en algo"
  | 'project_tease'       // "Preparando algo especial"
  | 'album_hint'          // Insinuación sobre un álbum
  | 'album_promise'       // "Este año quiero sacar un álbum"
  | 'collab_hint'         // Mención de colaboración
  | 'single_announcement' // Anuncio de single
  | 'album_announcement'  // Anuncio oficial de álbum
  | 'release_date'        // Fecha confirmada
  | 'tracklist_reveal'    // Revelación de tracklist
  | 'collab_reveal';      // Revelación de colaborador

export type StatementCommitmentLevel =
  | 'vague'        // Muy impreciso, sin compromiso
  | 'suggestive'   // Sugiere algo pero no confirma
  | 'promising'    // Promete algo sin fecha
  | 'committed'    // Compromiso claro
  | 'confirmed';   // Oficialmente confirmado

export interface PublicStatement {
  id: string;
  artistId: string; // 'player' o NPC id
  artistName: string;
  type: StatementType;
  commitmentLevel: StatementCommitmentLevel;
  text: string;  // Lo que se dijo exactamente
  madeAtWeek: number;
  madeAtYear: number;
  context: string; // 'instagram_live' | 'youtube_live' | 'interview' | 'social_post' | 'dm'
  // Referencias
  relatedProjectId?: string;
  relatedSongId?: string;
  relatedAlbumId?: string;
  mentionedArtists?: string[]; // Artistas mencionados en la declaración
  // Estado
  isFulfilled: boolean;
  fulfilledAtWeek?: number;
  wasCancelled: boolean;
  cancelledAtWeek?: number;
  // Repercusión
  publicReactionScore: number; // 0-100: cuánto interés generó
  timesReferenced: number; // Cuántas veces se ha mencionado después
}

// ─── PROJECT EXPECTATION & TRACKING ───────────────────────────────────────

export type ProjectExpectationLevel =
  | 'no_expectation'    // El público no espera nada
  | 'curiosity'         // Cierta curiosidad por declaraciones vagas
  | 'interest'          // Interés moderado por pistas
  | 'anticipation'      // Anticipación por declaraciones repetidas
  | 'high_anticipation' // Alta anticipación por anuncios
  | 'hype'              // Hype extremo, fecha confirmada
  | 'release_imminent'; // Lanzamiento inminente

export type ProjectAnnouncementStatus =
  | 'unannounced'    // No se ha mencionado públicamente
  | 'hinted'         // Solo pistas vagas
  | 'rumored'        // Rumores basados en pistas
  | 'teased'         // Adelantos mostrados
  | 'announced'      // Anuncio oficial sin fecha
  | 'dated'          // Fecha confirmada
  | 'delayed'        // Retrasado oficialmente
  | 'released'       // Ya publicado
  | 'cancelled';     // Cancelado

export interface ProjectExpectation {
  projectId: string; // Album ID o identificador de proyecto
  projectType: 'album' | 'ep' | 'mixtape' | 'single' | 'collaboration';
  projectName?: string; // Puede no tener nombre aún
  artistId: string;
  artistName: string;
  
  // Estado
  announcementStatus: ProjectAnnouncementStatus;
  expectationLevel: ProjectExpectationLevel;
  
  // Seguimiento temporal
  firstMentionWeek: number;
  lastUpdateWeek: number;
  expectedReleaseWeek?: number;
  actualReleaseWeek?: number;
  
  // Declaraciones relacionadas
  statementIds: string[]; // IDs de PublicStatement relacionados
  
  // Adelantos y pistas
  teasersShown: ProjectTeaser[];
  
  // Métricas de expectación
  hypeScore: number; // 0-100: nivel de expectación acumulado
  communityInterest: number; // 0-100: interés de la comunidad
  mediaAttention: number; // 0-100: atención de medios
  
  // Predicciones de fans
  fanTheories: string[]; // Teorías de los fans
  
  // Resultado (después del lanzamiento)
  metExpectations?: boolean; // ¿Cumplió las expectativas?
  performanceVsHype?: number; // -1 a 1: decepción vs superó expectativas
}

export interface ProjectTeaser {
  id: string;
  type: 'audio_snippet' | 'lyrics_snippet' | 'visual' | 'collab_hint' | 'title_hint' | 'tracklist_hint';
  content: string; // Descripción del adelanto
  revealedAtWeek: number;
  source: 'instagram_live' | 'youtube_live' | 'social_post' | 'interview';
  songId?: string; // Si está relacionado con una canción específica
  viralityScore: number; // 0-100: cuánto se compartió
  publicReaction: 'excited' | 'interested' | 'confused' | 'disappointed' | 'mixed';
}

// ─── LIVE STREAMS ─────────────────────────────────────────────────────────

export type LiveStreamPlatform = 'instagram' | 'youtube' | 'twitch';

export type LiveStreamType =
  | 'casual_chat'           // Charla casual
  | 'studio_session'        // Sesión de estudio
  | 'qa'                    // Preguntas y respuestas
  | 'listening_party'       // Escucha de música
  | 'teaser_reveal'         // Revelación de adelanto
  | 'announcement'          // Anuncio importante
  | 'comeback_special';     // Especial de regreso

export interface LiveStreamEvent {
  id: string;
  artistId: string;
  artistName: string;
  platform: LiveStreamPlatform;
  type: LiveStreamType;
  title: string;
  scheduledWeek: number;
  duration: number; // minutos
  
  // Contenido
  topics: string[]; // Temas tratados
  statementsM: string[]; // IDs de PublicStatement creados durante el stream
  teasersShown: string[]; // IDs de ProjectTeaser mostrados
  songsPlayed: string[]; // IDs de canciones reproducidas (fragmentos)
  
  // Métricas
  peakViewers: number;
  averageViewers: number;
  totalViews: number; // incluyendo después del directo
  likes: number;
  comments: number;
  shares: number;
  
  // Reacción
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'mixed' | 'negative';
  topComments: string[]; // Comentarios destacados simulados
  
  // Consecuencias
  hypeGenerated: number; // 0-100
  followersGained: number;
  viralClips: number; // Clips compartidos
  newsGenerated: boolean; // ¿Generó noticias?
}

// ─── SOCIAL MEDIA ACTIVITY ───────────────────────────────────────────────

export interface SocialPost {
  id: string;
  artistId: string;
  platform: 'instagram' | 'twitter' | 'tiktok';
  type: 'photo' | 'video' | 'story' | 'tweet' | 'tiktok';
  caption: string;
  postedAtWeek: number;
  
  // Contenido
  isTeaser: boolean;
  relatedProjectId?: string;
  relatedSongId?: string;
  
  // Engagement
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  
  // Efectos
  hypeBonus: number;
  viralityScore: number; // 0-100
}

// ─── DECISION EVENTS ──────────────────────────────────────
export interface DecisionConsequences {
  money?: number;
  monthlyListeners?: number;
  followers?: number;
  energy?: number;
  skills?: Partial<ArtistSkills>;
  fame?: Partial<FameProfile>;
  momentum?: number;
  relationship?: { artistId: string; delta: number };
  newsHeadline?: string;
  newsSource?: string;
  // Legacy flat fields used by events.ts (kept for backward compat)
  fans?: number;
  reputation?: number;
  voice?: number;
  composition?: number;
  flow?: number;
  charisma?: number;
  production?: number;
  mixing?: number;
  performance?: number;
  promotion?: number;
  negotiation?: number;
}

export interface DecisionChoice {
  text: string;
  impactDescription: string;
  consequences: DecisionConsequences;
}

export interface DecisionEvent {
  id: string;
  title: string;
  category: 'media' | 'scandal' | 'opportunity' | 'rivalry' | 'lifestyle' | 'eurovision' | 'contract' | 'industry';
  description: string;
  choices: DecisionChoice[];
}

// ─── STEP SEQUENCER (Beat Sequencer) ──────────────────────
export interface StepSequencerPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  bass808: boolean[];
  melody: boolean[];
}

// ─── PLAYER FAME TIER (derived) ───────────────────────────
export type PlayerFameTier =
  | 'Underground'
  | 'Promesa'
  | 'Emergente'
  | 'Famoso'
  | 'Superestrella'
  | 'Leyenda';

// ─── DJ SYSTEMS: PLAYLISTS & MASHUPS ──────────────────────────────────────

/**
 * DJ Playlist: Una secuencia curada de canciones propias y de otros artistas
 * Los DJs usan playlists para sets de clubes, radio shows, y eventos.
 */
export interface DJPlaylist {
  id: string;
  title: string;
  description: string;
  createdAtWeek: number;
  updatedAtWeek: number;
  
  // Tracks en la playlist
  tracks: DJPlaylistTrack[];
  
  // Metadatos
  totalDuration: number; // minutos
  averageBPM: number;
  dominantGenre: MusicGenre;
  tags: string[]; // 'club', 'radio', 'festival', 'warmup', 'peak', 'closing'
  
  // Rendimiento
  timesPlayed: number; // Veces que se usó en gigs
  audienceFeedback: number; // 0-100 promedio de reacción
  status: 'draft' | 'active' | 'archived';
}

export interface DJPlaylistTrack {
  id: string;
  position: number; // Orden en la playlist
  songId: string; // ID de canción (propia o NPC)
  songTitle: string;
  artistName: string;
  bpm: number;
  key: string;
  duration: number; // segundos
  
  // Configuración DJ
  startCuePoint?: number; // segundo donde empieza
  endCuePoint?: number; // segundo donde termina
  transitionType?: 'cut' | 'fade' | 'beatmatch' | 'slam'; // Tipo de transición
  notes?: string; // Notas del DJ sobre cuándo usar esta transición
}

/**
 * DJ Mashup: Combinación de 2 canciones en una nueva versión
 * Requiere compatibilidad de BPM y key. Genera un nuevo track.
 */
export interface DJMashup {
  id: string;
  title: string;
  createdAtWeek: number;
  
  // Canciones fuente (exactamente 2)
  sourceA: DJMashupSource;
  sourceB: DJMashupSource;
  
  // Configuración técnica
  mixStyle: 'overlay' | 'alternating' | 'breakdown' | 'acapella_instrumental';
  bpmAdjustment: number; // % de ajuste aplicado a sourceB
  keyAdjustment: number; // semitonos de ajuste
  
  // Resultado
  quality: number; // 0-100: calidad técnica del mashup
  creativity: number; // 0-100: originalidad de la combinación
  danceability: number; // 0-100: qué tan bailable quedó
  
  // Performance como canción
  status: 'draft' | 'completed' | 'released';
  linkedSongId?: string; // Si se publicó como canción
  performanceStats?: {
    streamsTotal: number;
    timesPlayedLive: number;
    audienceReaction: number; // 0-100
  };
}

export interface DJMashupSource {
  songId: string;
  songTitle: string;
  artistName: string;
  originalBPM: number;
  originalKey: string;
  sectionsUsed: ('intro' | 'verse' | 'chorus' | 'breakdown' | 'drop' | 'outro')[]; // Qué partes se usan
}

/**
 * Compatibilidad BPM/Key para mashups
 */
export interface MashupCompatibility {
  bpmCompatible: boolean; // BPMs están dentro de ±10%
  keyCompatible: boolean; // Keys son compatibles armónicamente
  genreCompatible: boolean; // Géneros funcionan juntos
  overallScore: number; // 0-100: score total de compatibilidad
  warnings: string[]; // Advertencias si algo no es compatible
  suggestions: string[]; // Sugerencias de ajuste
}
