export type MusicGenre = 
  | 'Urbano / Reggaeton'
  | 'Trap / Hip-Hop'
  | 'Pop / Electropop'
  | 'R&B / Neo-Soul'
  | 'Rock / Indie'
  | 'Balada / Latino';

export interface SingerStats {
  voice: number;        // 0 - 100
  composition: number;  // 0 - 100
  flow: number;         // 0 - 100
  charisma: number;     // 0 - 100
  energy: number;       // 0 - 100
  reputation: number;   // 0 - 100 (Underground to Global Icon)
  fans: number;         // Monthly listeners / followers
  money: number;        // Euro/Dollar balance
}

export interface Singer {
  id: string;
  artistName: string;
  realName: string;
  age: number;
  nationality: string;
  genre: MusicGenre;
  stats: SingerStats;
  avatarIcon: string;
  bio: string;
  recordLabel?: string;
  bzrpSessionCompleted: boolean;
  ovyWSoundCompleted: boolean;
  bigOneCrossoverCompleted?: boolean;
  eurovisionParticipationCount: number; // Max 2 times in career
  careerWeek: number;
  careerYear: number;
}

export type SongTheme = 'Amor' | 'Desamor' | 'Fiesta / Flex' | 'Calle / Real' | 'Reflexión' | 'Protesta / Venganza';

export interface MelodyCustomization {
  musicalKey: string;      // e.g. "Do Menor (Melancólico)", "Sol Mayor (Enérgico)"
  bpm: number;             // e.g. 95 BPM, 128 BPM
  melodyInstrument: string;// e.g. "Sintetizador 80s", "Guitarra Española", "Piano Melancólico"
  bassType: string;        // e.g. "808 Glide Distorsionado", "Bajo Eléctrico Slap"
  drumPattern: string;     // e.g. "Dembow Perreo Clásico", "Drill Triplet Hats"
  vocalStyle: string;      // e.g. "Autotune Futurista 100%", "Voz Rasgada y Cruda"
}

export interface Song {
  id: string;
  title: string;
  genre: MusicGenre;
  theme: SongTheme;
  quality: number; // 0 - 100
  producer: string;
  featuredArtists: string[];
  streamsTotal: number;
  streamsWeekly: number;
  releaseWeek: number;
  releaseYear: number;
  albumId?: string;
  isSingle: boolean;
  peakChartPosition?: number;
  currentChartPosition?: number;
  coverColor: string;
  certification?: 'Oro' | 'Platino' | 'Multi-Platino' | 'Diamante';
  melodyConfig?: MelodyCustomization;
  isScheduled?: boolean;
  scheduledWeek?: number;
  scheduledTime?: string; // e.g. "Viernes 00:00 (Medianoche)"
  preReleaseHype?: number; // Accumulates before release
  lyrics?: { verse: string; chorus: string; punchline: string };
  isRemix?: boolean;
  originalSongTitle?: string;
  countryStreams?: { spain: number; mexico: number; argentina: number; colombia: number; usa: number };
  playlistPlacements?: string[];
  dailyStreams?: number;
  tiktokCreations?: number;
}

export interface StepSequencerPattern {
  kick: boolean[];     // 16 steps
  snare: boolean[];    // 16 steps
  hihat: boolean[];    // 16 steps
  bass808: boolean[];  // 16 steps
  melody: boolean[];   // 16 steps
}

export interface Album {
  id: string;
  title: string;
  projectType: 'album' | 'ep'; // Distinguishes between full Album (LP) or Extended Play (EP)
  genre: MusicGenre;
  tracklist: Song[];
  status: 'planning' | 'recording' | 'scheduled' | 'released';
  scheduledReleaseWeek?: number;
  scheduledTime?: string;
  releaseYear?: number;
  marketingBudget: number;
  marketingStrategy?: 'Tiktok viral' | 'Entrevista exclusiva' | 'Vallas y publicidad' | 'Polémica calculada';
  criticScore?: number; // 0 - 100
  coverGradient: string;
  preReleaseRumors?: string[];
}

export interface NPCArtist {
  id: string;
  name: string;
  genre: MusicGenre;
  fameTier: 'Emergente' | 'Famoso' | 'Superestrella' | 'Leyenda';
  followers: number;
  chemistryRequired: number;
  avatar: string;
  isProducer?: boolean;
  specialType?: 'standard' | 'bzrp' | 'w_sound' | 'crossover';
  origin?: 'España' | 'Argentina' | 'Colombia' | 'México' | 'Puerto Rico' | 'Estados Unidos';
}

export interface CollaborationProposal {
  id: string;
  fromArtist: NPCArtist;
  songTitleProposed: string;
  genre: MusicGenre;
  role: 'feat' | 'producer';
  splitOffer: number; // % royalties offered to player e.g. 50
  budgetOffered: number;
  advancePayment: number; // Cash advance if it's the collaborator's track
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
  specialType?: 'standard' | 'bzrp' | 'w_sound' | 'crossover';
  crossoverNumber?: number; // e.g. 8 for Crossover #08
  crossoverPartner?: string; // e.g. "Tiago PZK" or "Ke Personajes"
  targetAlbumId?: string; // If player chooses to include it in their upcoming album
  ownership?: 'player' | 'collaborator';
  isImportant?: boolean;
  artistOrigin?: string;
  isRemixOffer?: boolean;
  multipleArtists?: string[]; // Multiple artists collaborating together e.g. ["Saiko", "Quevedo"]
}

export interface DecisionChoice {
  text: string;
  impactDescription: string;
  consequences: {
    money?: number;
    fans?: number;
    reputation?: number;
    energy?: number;
    voice?: number;
    flow?: number;
    composition?: number;
    charisma?: number;
    newsHeadline?: string;
    newsSource?: string;
  };
}

export interface DecisionEvent {
  id: string;
  title: string;
  category: 'media' | 'scandal' | 'opportunity' | 'rivalry' | 'lifestyle' | 'eurovision';
  description: string;
  choices: DecisionChoice[];
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  snippet: string;
  timeAgo: string;
  category: 'lanzamiento' | 'colaboracion' | 'polemica' | 'premios' | 'ranking' | 'rumores';
  sentiment: 'positive' | 'neutral' | 'negative' | 'viral';
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

export interface SpotifyChartEntry {
  rank: number;
  previousRank: number;
  songTitle: string;
  artistName: string;
  streams: number;
  isPlayerSong: boolean;
  peakRank: number;
  weeksOnChart: number;
  country: string; // 'Global' or country name
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  songOrAlbumTitle: string;
  won: boolean;
  trophyIcon: string;
}

export interface EurovisionResult {
  year: number;
  songTitle: string;
  finalRank: number;
  points: number;
  winnerCountry: string;
}
