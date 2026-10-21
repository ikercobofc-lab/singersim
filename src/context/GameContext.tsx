/**
 * GameContext.tsx — v2
 *
 * Central game state and all game actions.
 * Connects simulation engine, career engine, collab rules,
 * intent engine, NPC competition and economy.
 *
 * Principles:
 * - No action grants instant fame/legend status
 * - All probability outcomes are surfaced to the player before committing
 * - Private projects never auto-publish
 * - Remix duplicate detection runs before creating any remix
 * - NPC charts update every week with real decay
 * - Skills grow through use, not arbitrary awards
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Singer,
  Song,
  Album,
  NewsArticle,
  SpotifyChartEntry,
  CollaborationProposal,
  DecisionEvent,
  Award,
  EurovisionResult,
  RumorItem,
  PrivateProject,
  ArtistConversation,
  ConversationMessage,
  FameProfile,
  CareerState,
  ArtistSkills,
  EconomyState,
  Contract,
  NPCSong,
  NPCArtist,
  MusicGenre,
  SongTheme,
  MelodyCustomization,
  ProjectActivity,
  SongVersion,
  PublicStatement,
  ProjectExpectation,
  ProjectTeaser,
  LiveStreamEvent,
  StatementType,
  LiveStreamPlatform,
  LiveStreamType,
} from '../types';

import { FAMOUS_ARTISTS, FAMOUS_PRODUCERS, getArtistDialogue } from '../data/artists';
import { RANDOM_DECISION_EVENTS } from '../data/events';
import { INITIAL_NPC_SONGS, advanceNPCSongs, generateNewNPCSong, buildChartFromSongs } from '../data/npcCompetitors';
import { COUNTRY_SPECIFIC_CHARTS } from '../data/initialCharts';

import {
  deriveCareerStage,
  calculateSongQuality,
  calculateInitialStreams,
  checkViralEvent,
  calculateWeeklyStreamDecay,
  calculateFameGrowth,
  applyListenerDecay,
  evaluateAlbumSuccess,
  checkGrammysEligibility,
  calculateWeeklyRevenue,
  recalculateMomentum,
  getCertification,
  findDuplicateRemix,
  buildRemixIdentityKey,
  careerStageLabel,
  getPlayerFameTier,
} from '../utils/simulationEngine';

import {
  buildInitialCareerState,
  buildInitialSkills,
  buildInitialFame,
  CAREER_PATH_CONFIGS,
  advanceWeek as advanceWeekCareer,
  checkBzrpEligibility,
  checkCrossoverEligibility,
  checkEurovisionEligibility,
  generateBeatCommission,
  generateDJGig,
  BeatCommission,
  DJGig,
} from '../utils/careerEngine';

import { evaluateCollabPermission, resolveCollabProposal, calculateRelationshipDelta } from '../utils/collabRules';
import { classifyIntent, extractEntities, generateNPCResponse } from '../utils/intentEngine';
import { generateNewsForWeek, updateNewsTimestamps, NewsGenerationContext } from '../utils/newsEngine';
import { buildTop50Chart, buildCountryChart, ChartConfig, updateSongsFromChart, createChartSnapshot, ChartSnapshot } from '../utils/chartEngine';
import {
  createPublicStatement,
  initProjectExpectation,
  updateProjectExpectation,
  decayExpectation,
  detectSilenceTheories,
  generateTeaserTheories,
  simulateLiveStream,
  CreateStatementParams,
  CreateLiveStreamParams,
} from '../utils/expectationEngine';

import { useAuth } from './AuthContext';
import { saveCareerToFirestore, loadCareerFromFirestore } from '../firebase/firestoreService';

// ─── HELPERS ──────────────────────────────────────────────────────────────

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────

interface GameContextType {
  // ── State ──
  singer: Singer | null;
  discography: Song[];          // published songs
  scheduledSongs: Song[];       // queued for release
  privateProjects: PrivateProject[]; // demos, WIPs, unreleased
  albums: Album[];
  news: NewsArticle[];
  rumors: RumorItem[];
  globalCharts: SpotifyChartEntry[];
  countryCharts: SpotifyChartEntry[];
  selectedCountry: string;
  inbox: CollaborationProposal[];
  conversations: ArtistConversation[];
  contracts: Contract[];
  npcSongs: NPCSong[];           // live NPC chart competitors
  beatCommissions: BeatCommission[];  // producer-specific
  djGigs: DJGig[];               // dj-specific
  unlockedProducers: { id: string; name: string; avatar: string; fameTier: string }[];
  activeDecisionEvent: DecisionEvent | null;
  activeCollabOffer: CollaborationProposal | null;
  awards: Award[];
  isBzrpOpen: boolean;
  isOvyOpen: boolean;
  isBigOneOpen: boolean;
  eurovisionModalOpen: boolean;
  isSaving: boolean;
  activeTab: TabId;
  weeksSinceLastRelease: number;
  
  // ── Expectation System ──
  publicStatements: PublicStatement[];
  projectExpectations: ProjectExpectation[];
  liveStreamHistory: LiveStreamEvent[];
  activeLiveStream: LiveStreamEvent | null;

  // ── Derived/Computed ──
  bzrpEligible: boolean;

  // ── Character Creation ──
  createSinger: (data: Partial<Singer> & {
    careerPath: Singer['career']['path'];
    focusStat: keyof ArtistSkills;
  }) => void;

  // ── Navigation ──
  setActiveTab: (tab: TabId) => void;
  setSelectedCountry: (country: string) => void;

  // ── Studio: Songs ──
  /** Creates a private project/demo — does NOT publish */
  createPrivateProject: (draft: ProjectDraft) => PrivateProject;
  /** Publishes a finished private project as a single */
  publishProject: (projectId: string, budget: number) => PublishResult;
  /** Instant release (no project step) — kept for quick studio flow */
  releaseSingle: (draft: SongDraft) => ReleaseSingleResult | null;
  scheduleSongRelease: (draft: SongDraft & { scheduledWeek: number; scheduledTime: string }) => void;
  archiveProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => PrivateProject;
  renameProject: (projectId: string, newTitle: string) => void;
  addVersionToProject: (projectId: string, version: Omit<SongVersion, 'versionId'>) => void;

  // ── Studio: Remix ──
  /** Creates a remix project with duplicate-detection */
  createRemixProject: (originalSong: Song, guestArtistId: string, versionType: string) => RemixCreateResult;

  // ── Albums ──
  createAlbum: (title: string, genre: MusicGenre, projectType?: Album['projectType']) => void;
  addTrackToAlbum: (albumId: string, draft: SongDraft) => void;
  releaseAlbum: (albumId: string, strategy: Album['marketingStrategy'], budget: number) => void;

  // ── Collaborations ──
  respondToCollaboration: (
    proposalId: string,
    accept: boolean,
    counterRoyalty?: number,
    targetAlbumId?: string
  ) => void;
  proposeCollaboration: (artistId: string, format: 'single' | 'album', albumId?: string) => ProposeResult;

  // ── Conversations (DMs) ──
  sendMessage: (npcId: string, text: string) => MessageResult;
  getConversation: (npcId: string) => ArtistConversation | undefined;

  // ── Special milestones ──
  setIsBzrpOpen: (v: boolean) => void;
  setIsOvyOpen: (v: boolean) => void;
  setIsBigOneOpen: (v: boolean) => void;
  triggerBzrpSession: (details: { title: string; style: string; punchlineFocus: string }) => void;
  triggerOvyWSound: (details: { vibe: string; mood: string }) => void;
  triggerBigOneCrossover: (details: { title: string; partnerArtist: string; vibe: string; crossoverNumber?: number }) => void;

  // ── Time ──
  advanceTime: () => void;

  // ── Eurovision ──
  setEurovisionModalOpen: (v: boolean) => void;
  participateInEurovision: (song: Song) => EurovisionResult;

  // ── Decision events ──
  dismissDecisionEvent: () => void;
  resolveDecision: (choiceIndex: number) => void;
  setActiveCollabOffer: (offer: CollaborationProposal | null) => void;

  // ── Economy ──
  acceptBeatCommission: (commissionId: string) => void;
  acceptDJGig: (gigId: string) => void;
  
  // ── Expectation & Hype ──
  makePublicStatement: (type: StatementType, text: string, relatedProjectId?: string) => PublicStatement;
  startLiveStream: (params: Omit<CreateLiveStreamParams, 'artistId' | 'artistName' | 'followers' | 'monthlyListeners' | 'currentWeek'>) => LiveStreamEvent;
  endLiveStream: () => void;
  announceAlbum: (albumId: string, hasDate?: boolean, releaseWeek?: number) => void;
  showTeaser: (projectId: string, type: ProjectTeaser['type'], content: string, songId?: string) => void;
  getProjectExpectation: (projectId: string) => ProjectExpectation | undefined;

  // ── Persistence ──
  saveGame: () => Promise<void>;
}

type TabId = 'home' | 'studio' | 'charts' | 'metrics' | 'messages' | 'news' | 'awards' | 'projects';

// ── Param types ──────────────────────────────────────────────────────────

export interface SongDraft {
  title: string;
  genre: MusicGenre;
  theme: SongTheme;
  producerName: string;
  producerId?: string;
  featuredArtists: string[];
  collaboratorIds?: string[];
  isSingle: boolean;
  budget: number;
  melodyConfig?: MelodyCustomization;
  lyrics?: { verse: string; chorus: string; punchline: string };
  isRemix?: boolean;
}

export interface ProjectDraft {
  workingTitle: string;
  genre: MusicGenre;
  theme: SongTheme;
  notes?: string;
  tags?: string[];
  melodyConfig?: MelodyCustomization;
}

export interface PublishResult {
  success: boolean;
  song?: Song;
  streams?: number;
  revenue?: number;
  fansGained?: number;
  isViral?: boolean;
  viralReason?: string;
  chartPosition?: number | null;
  error?: string;
}

export interface ReleaseSingleResult {
  song: Song;
  initialStreams: number;
  chartPositionGlobal: number | null;
  revenue: number;
  fansGained: number;
  isViral: boolean;
  viralReason?: string;
  skillsGained: Partial<ArtistSkills>;
}

export interface ProposeResult {
  success: boolean;
  message: string;
  accepted?: boolean;
  counterOffer?: { royalty: number; message: string };
  probability?: number;
}

export interface MessageResult {
  npcResponse: string;
  intent: string;
  pendingProposal?: {
    type: string;
    summary: string;
    requiresConfirmation: boolean;
    suggestedGenre?: string;
    suggestedRole?: string;
    suggestedRoyalty?: number;
  };
  suggestedAction?: string;
}

export interface RemixCreateResult {
  success: boolean;
  projectId?: string;
  message: string;
  duplicateId?: string;
  duplicateTitle?: string;
  duplicateSource?: 'project' | 'song' | null;
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────

const GameContext = createContext<GameContextType | undefined>(undefined);

// ─── PROVIDER ────────────────────────────────────────────────────────────

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // ── Core state ──
  const [singer, setSinger] = useState<Singer | null>(null);
  const [discography, setDiscography] = useState<Song[]>([]);
  const [scheduledSongs, setScheduledSongs] = useState<Song[]>([]);
  const [privateProjects, setPrivateProjects] = useState<PrivateProject[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [rumors, setRumors] = useState<RumorItem[]>([]);
  const [npcSongs, setNpcSongs] = useState<NPCSong[]>(INITIAL_NPC_SONGS);
  const [inbox, setInbox] = useState<CollaborationProposal[]>([]);
  const [conversations, setConversations] = useState<ArtistConversation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [beatCommissions, setBeatCommissions] = useState<BeatCommission[]>([]);
  const [djGigs, setDjGigs] = useState<DJGig[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [weeksSinceLastRelease, setWeeksSinceLastRelease] = useState(0);
  const [coveredNewsMilestones, setCoveredNewsMilestones] = useState<Set<string>>(new Set());
  const [chartSnapshots, setChartSnapshots] = useState<ChartSnapshot[]>([]);
  
  // ── Expectation system state ──
  const [publicStatements, setPublicStatements] = useState<PublicStatement[]>([]);
  const [projectExpectations, setProjectExpectations] = useState<ProjectExpectation[]>([]);
  const [liveStreamHistory, setLiveStreamHistory] = useState<LiveStreamEvent[]>([]);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStreamEvent | null>(null);

  // UI state
  const [selectedCountry, setSelectedCountry] = useState('España');
  const [unlockedProducers, setUnlockedProducers] = useState([
    { id: 'home-studio-bro', name: 'Kike Beats (Colega del barrio)', avatar: '🎧', fameTier: 'Amigo de confianza' },
    { id: 'self-produced', name: 'Home Studio Propio', avatar: '🎙️', fameTier: 'Independiente' },
  ]);
  const [activeDecisionEvent, setActiveDecisionEvent] = useState<DecisionEvent | null>(null);
  const [activeCollabOffer, setActiveCollabOffer] = useState<CollaborationProposal | null>(null);
  const [isBzrpOpen, setIsBzrpOpen] = useState(false);
  const [isOvyOpen, setIsOvyOpen] = useState(false);
  const [isBigOneOpen, setIsBigOneOpen] = useState(false);
  const [eurovisionModalOpen, setEurovisionModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // ── Sync legacy shims whenever singer changes ──────────────────────────────
  useEffect(() => {
    if (!singer) return;
    const shims = {
      careerWeek: singer.career.careerWeek,
      careerYear: singer.career.careerYear,
      bzrpSessionCompleted: singer.career.milestonesCompleted.includes('bzrp_session'),
      ovyWSoundCompleted: singer.career.milestonesCompleted.includes('ovy_wsound'),
      bigOneCrossoverCompleted: singer.career.milestonesCompleted.includes('bigone_crossover'),
      eurovisionParticipationCount: singer.career.milestonesCompleted.filter(m => m.startsWith('eurovision_')).length,
      stats: {
        voice: singer.skills.voice,
        composition: singer.skills.composition,
        flow: singer.skills.flow,
        charisma: singer.skills.charisma,
        energy: singer.career.energy,
        reputation: singer.fame.industryPrestige,
        fans: singer.fame.followers,
        money: singer.economy.balance,
      },
    };
    // Only update if something actually changed (avoid infinite loop)
    if (
      singer.careerWeek !== shims.careerWeek ||
      singer.stats?.fans !== shims.stats.fans ||
      singer.stats?.money !== shims.stats.money
    ) {
      setSinger(prev => prev ? { ...prev, ...shims } : null);
    }
  }, [
    singer?.career.careerWeek,
    singer?.fame.followers,
    singer?.economy.balance,
    singer?.career.milestonesCompleted.length,
  ]);

  // ── Derived charts usando el nuevo sistema ──
  const chartConfig: ChartConfig = {
    country: 'Global',
    period: 'weekly',
    currentWeek: singer?.career.careerWeek || 1,
    currentYear: singer?.career.careerYear || 2026,
  };

  const globalCharts: SpotifyChartEntry[] = singer ? buildTop50Chart(
    discography,
    npcSongs,
    chartConfig,
    chartSnapshots.find(s => s.country === 'Global' && s.week === chartConfig.currentWeek - 1)?.entries || []
  ) : [];

  const countryChartConfig: ChartConfig = {
    ...chartConfig,
    country: selectedCountry,
  };

  const countryCharts: SpotifyChartEntry[] = singer ? buildCountryChart(
    discography,
    npcSongs,
    countryChartConfig,
    chartSnapshots.find(s => s.country === selectedCountry && s.week === chartConfig.currentWeek - 1)?.entries || []
  ) : [];

  // ── BZRP eligibility ──
  const bzrpEligible = singer ? (() => {
    const hasTopNational = countryCharts.some(e => e.isPlayerSong && e.rank <= 3);
    const hasTopGlobal = globalCharts.some(e => e.isPlayerSong && e.rank <= 5);
    return checkBzrpEligibility(singer.fame, singer.career, discography, hasTopNational, hasTopGlobal).available;
  })() : false;

  // ── Load game ──
  useEffect(() => {
    const loadGame = async () => {
      const loaded = await loadCareerFromFirestore(currentUser?.uid);
      if (loaded?.singer) {
        setSinger(loaded.singer);
        setDiscography(loaded.discography || []);
        setAlbums(loaded.albums || []);
        setAwards(loaded.awards || []);
        setNews(loaded.news || []);
        if ((loaded as any).privateProjects) setPrivateProjects((loaded as any).privateProjects);
        if ((loaded as any).inbox) setInbox((loaded as any).inbox);
        if ((loaded as any).npcSongs) setNpcSongs((loaded as any).npcSongs);
        if ((loaded as any).conversations) setConversations((loaded as any).conversations);
        if ((loaded as any).contracts) setContracts((loaded as any).contracts);
        // Cargar nuevos datos del sistema de noticias y charts
        if ((loaded as any).coveredNewsMilestones) {
          setCoveredNewsMilestones(new Set((loaded as any).coveredNewsMilestones));
        }
        if ((loaded as any).chartSnapshots) {
          setChartSnapshots((loaded as any).chartSnapshots);
        }
        if (typeof (loaded as any).weeksSinceLastRelease === 'number') {
          setWeeksSinceLastRelease((loaded as any).weeksSinceLastRelease);
        }
        // Cargar datos del sistema de expectación
        if ((loaded as any).publicStatements) {
          setPublicStatements((loaded as any).publicStatements);
        }
        if ((loaded as any).projectExpectations) {
          setProjectExpectations((loaded as any).projectExpectations);
        }
        if ((loaded as any).liveStreamHistory) {
          setLiveStreamHistory((loaded as any).liveStreamHistory);
        }
      }
    };
    loadGame();
  }, [currentUser]);

  // ─────────────────────────────────────────────────────────────────────
  // CHARACTER CREATION
  // ─────────────────────────────────────────────────────────────────────

  const createSinger = (data: Partial<Singer> & {
    careerPath: Singer['career']['path'];
    focusStat: keyof ArtistSkills;
  }) => {
    const path = data.careerPath || 'artist';
    const focus = data.focusStat || 'voice';
    const startYear = 2026;

    const career = buildInitialCareerState(path, startYear);
    const skills = buildInitialSkills(path, focus);
    const fame = buildInitialFame(path);
    const config = CAREER_PATH_CONFIGS[path];

    const economy: EconomyState = {
      balance: config.startingBalance,
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

    const newSinger: Singer = {
      id: 'singer_' + Date.now(),
      artistName: data.artistName || 'Nuevo Artista',
      realName: data.realName || 'Artista Anónimo',
      age: data.age || 19,
      nationality: data.nationality || 'España',
      genre: data.genre || 'Urbano / Reggaeton',
      avatarIcon: data.avatarIcon || '🎤',
      bio: `Iniciando mi carrera como ${config.label} desde cero.`,
      career,
      skills,
      fame,
      economy,
      relationships: {},
      contactedArtistIds: [],
      awardIds: [],
      // Legacy shims for backward compat with old components
      careerWeek: career.careerWeek,
      careerYear: career.careerYear,
      bzrpSessionCompleted: false,
      ovyWSoundCompleted: false,
      bigOneCrossoverCompleted: false,
      eurovisionParticipationCount: 0,
      stats: {
        voice: skills.voice,
        composition: skills.composition,
        flow: skills.flow,
        charisma: skills.charisma,
        energy: career.energy,
        reputation: fame.industryPrestige,
        fans: fame.followers,
        money: economy.balance,
      },
    };

    setSinger(newSinger);
    setSelectedCountry(newSinger.nationality);
    setDiscography([]);
    setPrivateProjects([]);
    setAlbums([]);
    setInbox([]);
    setConversations([]);
    setNpcSongs(INITIAL_NPC_SONGS);
    setWeeksSinceLastRelease(0);

    // NO generar noticia inicial - las noticias aparecerán cuando haya logros reales
    setNews([]);
  };

  // ─────────────────────────────────────────────────────────────────────
  // SAVE GAME
  // ─────────────────────────────────────────────────────────────────────

  const saveGame = async () => {
    if (!singer) return;
    setIsSaving(true);
    await saveCareerToFirestore(currentUser?.uid || 'guest_user', {
      singer,
      discography,
      albums,
      awards,
      news,
      privateProjects,
      inbox,
      npcSongs,
      conversations,
      contracts,
      coveredNewsMilestones: Array.from(coveredNewsMilestones),
      chartSnapshots: chartSnapshots.slice(0, 10), // guardar últimos 10 snapshots
      weeksSinceLastRelease,
      // Expectation system data
      publicStatements: publicStatements.slice(0, 100),
      projectExpectations,
      liveStreamHistory: liveStreamHistory.slice(0, 20),
    } as any);
    setTimeout(() => setIsSaving(false), 500);
  };

  // ─────────────────────────────────────────────────────────────────────
  // PRIVATE PROJECTS
  // ─────────────────────────────────────────────────────────────────────

  const createPrivateProject = (draft: ProjectDraft): PrivateProject => {
    if (!singer) throw new Error('No singer');

    const versionId = 'v1_' + Date.now();
    const firstVersion: SongVersion = {
      versionId,
      label: 'v1 - idea inicial',
      createdAtWeek: singer.career.careerWeek,
      contributions: [{
        participantId: 'player',
        role: singer.career.path === 'producer' ? 'producer' : singer.career.path === 'dj' ? 'dj' : 'vocalist',
        description: 'Creación inicial',
        deliveredAt: singer.career.careerWeek,
      }],
      melodyConfig: draft.melodyConfig,
      qualityScore: Math.floor(
        (singer.skills.composition + singer.skills.voice) / 2 * 0.6 + Math.random() * 20
      ),
      notes: draft.notes || '',
    };

    const project: PrivateProject = {
      id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
      workingTitle: draft.workingTitle,
      genre: draft.genre,
      theme: draft.theme,
      permission: 'private',
      ownerIds: ['player'],
      invites: [],
      versions: [firstVersion],
      currentVersionId: versionId,
      activity: [{
        actorId: 'player',
        actorName: singer.artistName,
        action: 'Proyecto creado',
        week: singer.career.careerWeek,
      }],
      isArchived: false,
      createdAtWeek: singer.career.careerWeek,
      updatedAtWeek: singer.career.careerWeek,
      notes: draft.notes || '',
      tags: draft.tags || [],
    };

    setPrivateProjects(prev => [project, ...prev]);
    return project;
  };

  const archiveProject = (projectId: string) => {
    setPrivateProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, isArchived: true } : p
    ));
  };

  const duplicateProject = (projectId: string): PrivateProject => {
    const source = privateProjects.find(p => p.id === projectId);
    if (!source || !singer) throw new Error('Project not found');

    const copy: PrivateProject = {
      ...source,
      id: 'proj_copy_' + Date.now(),
      workingTitle: source.workingTitle + ' (copia)',
      sourceProjectId: source.id,
      linkedSongId: undefined,
      createdAtWeek: singer.career.careerWeek,
      updatedAtWeek: singer.career.careerWeek,
      activity: [{
        actorId: 'player',
        actorName: singer.artistName,
        action: `Duplicado de "${source.workingTitle}"`,
        week: singer.career.careerWeek,
      }],
      versions: source.versions.map(v => ({ ...v, versionId: 'vc_' + v.versionId })),
    };

    setPrivateProjects(prev => [copy, ...prev]);
    return copy;
  };

  const renameProject = (projectId: string, newTitle: string) => {
    setPrivateProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, workingTitle: newTitle } : p
    ));
  };

  const addVersionToProject = (projectId: string, version: Omit<SongVersion, 'versionId'>) => {
    if (!singer) return;
    const versionId = 'v_' + Date.now();
    const fullVersion: SongVersion = { ...version, versionId };

    setPrivateProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const activity: ProjectActivity = {
        actorId: 'player',
        actorName: singer.artistName,
        action: `Nueva versión añadida: ${version.label}`,
        week: singer.career.careerWeek,
      };
      return {
        ...p,
        versions: [...p.versions, fullVersion],
        currentVersionId: versionId,
        updatedAtWeek: singer.career.careerWeek,
        activity: [...p.activity, activity],
      };
    }));
  };

  // ─────────────────────────────────────────────────────────────────────
  // PUBLISH A PROJECT
  // ─────────────────────────────────────────────────────────────────────

  const publishProject = (projectId: string, budget: number): PublishResult => {
    if (!singer) return { success: false, error: 'No hay artista activo.' };

    const project = privateProjects.find(p => p.id === projectId);
    if (!project) return { success: false, error: 'Proyecto no encontrado.' };
    if (project.isArchived) return { success: false, error: 'El proyecto está archivado.' };
    if (project.linkedSongId) return { success: false, error: 'Este proyecto ya fue publicado.' };
    if (singer.economy.balance < budget) return { success: false, error: 'Saldo insuficiente.' };

    const currentVersion = project.versions.find(v => v.versionId === project.currentVersionId)
      || project.versions[project.versions.length - 1];
    if (!currentVersion) return { success: false, error: 'El proyecto no tiene versiones.' };

    return _performRelease({
      title: project.workingTitle,
      genre: project.genre,
      theme: project.theme,
      producerName: 'Home Studio Propio',
      producerId: 'self-produced',
      featuredArtists: [],
      collaboratorIds: project.ownerIds.filter(id => id !== 'player'),
      isSingle: true,
      budget,
      melodyConfig: currentVersion.melodyConfig,
      lyrics: undefined,
      isRemix: false,
    }, projectId);
  };

  // ─────────────────────────────────────────────────────────────────────
  // CORE RELEASE LOGIC (shared by releaseSingle + publishProject)
  // ─────────────────────────────────────────────────────────────────────

  const _performRelease = (
    draft: SongDraft,
    linkedProjectId?: string
  ): PublishResult & { song?: Song } => {
    if (!singer) return { success: false, error: 'No hay artista activo.' };

    // Deduct cost
    const cost = draft.budget;
    if (singer.economy.balance < cost) {
      return { success: false, error: 'Saldo insuficiente para producción y marketing.' };
    }

    // Quality calculation
    const producerBonus =
      draft.producerName.includes('Bizarrap') ? 35 :
      draft.producerName.includes('Tainy') || draft.producerName.includes('Ovy') ? 22 :
      draft.producerName.includes('Sky') ? 18 :
      draft.producerName.includes('Big One') ? 20 :
      unlockedProducers.some(p => p.name === draft.producerName && p.fameTier !== 'Amigo de confianza') ? 12 : 5;

    const quality = calculateSongQuality({
      singerSkills: singer.skills,
      careerPath: singer.career.path,
      producerBonus,
      featureBonus: draft.featuredArtists.length,
      budgetSpent: cost,
      genreMatch: draft.genre === singer.genre,
    });

    // Viral check
    const { isViral, multiplier: viralMultiplier, reason: viralReason } = checkViralEvent(
      quality,
      singer.skills.charisma,
      singer.skills.promotion,
      cost,
      singer.career.momentum,
      singer.career.stage,
    );

    // Stream calculation
    const npcStrength = Math.min(100, npcSongs.filter(s => s.isActive).length * 2);
    const initialStreams = calculateInitialStreams({
      quality,
      monthlyListeners: singer.fame.monthlyListeners,
      followers: singer.fame.followers,
      careerStage: singer.career.stage,
      momentum: singer.career.momentum,
      marketingBudget: cost,
      isViral,
      viralMultiplier,
      collabPrestigeBonus: draft.featuredArtists.length > 0 ? 20 : 0,
      isRemix: draft.isRemix || false,
      originalSongStreams: 0,
      scheduledRelease: false,
      preReleaseHype: 0,
      npcChartStrength: npcStrength,
    });

    // Chart position
    const chartPos = globalCharts.findIndex(e => initialStreams > e.streams);
    const chartPosition: number | null = chartPos === -1 ? null : chartPos + 1;

    // Revenue
    const royaltyRate = singer.career.hasSigned
      ? 0.0035 * (1 - (singer.career.labelTier === 'major' ? 0.80 : 0.50))
      : 0.0035;
    const revenue = Math.floor(initialStreams * royaltyRate) - Math.floor(cost * 0.1); // net of dist fees
    const realRevenue = Math.max(0, revenue);

    // Fans & fame
    const fameDelta = calculateFameGrowth(
      singer.fame,
      initialStreams,
      quality,
      isViral,
      chartPosition,
      singer.career.careerWeek
    );

    // Skills growth (inline version of applySkillsFromRelease)
    const _intensity = quality / 100;
    const _path = singer.career.path;
    const skillDelta: Partial<ArtistSkills> = {};
    const _grow = (cur: number, w: number) => Math.max(0, Math.min(1.2, ((100 - cur) / 100) * w * _intensity * 2 + (Math.random() - 0.5) * 0.3));
    if (_path === 'artist') {
      skillDelta.voice = _grow(singer.skills.voice, 0.7);
      skillDelta.composition = _grow(singer.skills.composition, 0.8);
      skillDelta.flow = _grow(singer.skills.flow, 0.6);
      skillDelta.promotion = _grow(singer.skills.promotion, 0.3);
    } else if (_path === 'producer') {
      skillDelta.production = _grow(singer.skills.production, 0.9);
      skillDelta.mixing = _grow(singer.skills.mixing, 0.7);
      skillDelta.composition = _grow(singer.skills.composition, 0.5);
    } else {
      skillDelta.performance = _grow(singer.skills.performance, 0.9);
      skillDelta.production = _grow(singer.skills.production, 0.4);
      skillDelta.charisma = _grow(singer.skills.charisma, 0.6);
    }

    // Certification
    const certification = getCertification(initialStreams);

    const songId = 'song_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    const coverColors = [
      'from-rose-500 to-indigo-700', 'from-emerald-400 to-cyan-600',
      'from-amber-400 to-pink-600', 'from-violet-600 to-fuchsia-700',
      'from-blue-600 to-teal-500', 'from-lime-400 to-emerald-700',
    ];

    const newSong: Song = {
      id: songId,
      title: draft.title,
      genre: draft.genre,
      theme: draft.theme,
      status: 'released',
      ownerIds: ['player', ...(draft.collaboratorIds || [])],
      producerId: draft.producerId || 'self-produced',
      producerName: draft.producerName || 'Home Studio Propio',
      featuredArtists: draft.featuredArtists,
      collaboratorIds: draft.collaboratorIds || [],
      royaltySplits: { player: 100 - draft.featuredArtists.length * 20 },
      quality,
      isRemix: draft.isRemix || false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal: initialStreams,
      streamsThisWeek: initialStreams,
      streamsPeakWeek: initialStreams,
      weeksOnChart: chartPosition !== null ? 1 : 0,
      peakChartPosition: chartPosition ?? undefined,
      currentChartPosition: chartPosition ?? undefined,
      chartMomentum: isViral ? 1 : 0,
      certification,
      coverColor: coverColors[Math.floor(Math.random() * coverColors.length)],
      lyrics: draft.lyrics,
      melodyConfig: draft.melodyConfig,
      versions: [],
      isSingle: draft.isSingle,
    };

    // Update state
    setDiscography(prev => [newSong, ...prev]);
    setWeeksSinceLastRelease(0);

    // Mark linked project as published
    if (linkedProjectId) {
      setPrivateProjects(prev => prev.map(p =>
        p.id === linkedProjectId ? { ...p, linkedSongId: songId } : p
      ));
    }

    // Update singer state
    setSinger(prev => {
      if (!prev) return null;
      const newFame: FameProfile = { ...prev.fame, ...fameDelta };
      const newSkills: ArtistSkills = {
        ...prev.skills,
        ...Object.fromEntries(
          Object.entries(skillDelta).map(([k, v]) => [k, Math.min(100, (prev.skills as any)[k] + (v as number))])
        ),
      };
      const newEconomy: EconomyState = {
        ...prev.economy,
        balance: prev.economy.balance - cost + realRevenue,
        totalEarned: prev.economy.totalEarned + realRevenue,
        totalSpent: prev.economy.totalSpent + cost,
        royaltiesStreaming: prev.economy.royaltiesStreaming + realRevenue,
        promotionCost: prev.economy.promotionCost + cost,
      };
      const newCareer: CareerState = {
        ...prev.career,
        energy: Math.max(10, prev.career.energy - 12),
        momentum: recalculateMomentum(prev.career.momentum, [
          { type: isViral ? 'viral' : (quality > 70 ? 'hit' : 'flop') }
        ]),
        consecutiveHits: quality > 60 ? prev.career.consecutiveHits + 1 : 0,
        consecutiveFlops: quality <= 50 ? prev.career.consecutiveFlops + 1 : 0,
      };
      // Re-derive stage after update
      newCareer.stage = deriveCareerStage(
        newFame,
        newCareer,
        discography.length + 1,
        albums.filter(a => a.status === 'released').length
      );

      return { ...prev, fame: newFame, skills: newSkills, economy: newEconomy, career: newCareer };
    });

    // News
    const newsItem: NewsArticle = {
      id: 'news_' + Date.now(),
      headline: isViral
        ? `🔥 VIRAL: "${newSong.title}" de ${singer.artistName} revienta las plataformas`
        : `Nuevo lanzamiento: ${singer.artistName} presenta "${newSong.title}"`,
      source: isViral ? 'Billboard Global' : 'Rolling Stone',
      snippet: `Con ${initialStreams.toLocaleString()} reproducciones iniciales${chartPosition ? ` y entrando en el #${chartPosition}` : ''}.`,
      timeAgo: `Semana ${singer.career.careerWeek}`,
      category: 'lanzamiento',
      sentiment: isViral ? 'viral' : quality > 70 ? 'positive' : 'neutral',
      relatedSongId: songId,
    };
    setNews(prev => [newsItem, ...prev]);

    const fansGained = (fameDelta.followers || singer.fame.followers) - singer.fame.followers;

    return {
      success: true,
      song: newSong,
      streams: initialStreams,
      revenue: realRevenue,
      fansGained: Math.max(0, fansGained),
      isViral,
      viralReason,
      chartPosition,
    };
  };

  // ─────────────────────────────────────────────────────────────────────
  // QUICK SINGLE RELEASE (Studio → immediate)
  // ─────────────────────────────────────────────────────────────────────

  const releaseSingle = (draft: SongDraft): ReleaseSingleResult | null => {
    if (!singer) return null;
    const result = _performRelease(draft);
    if (!result.success || !result.song) return null;

    return {
      song: result.song,
      initialStreams: result.streams || 0,
      chartPositionGlobal: result.chartPosition || null,
      revenue: result.revenue || 0,
      fansGained: result.fansGained || 0,
      isViral: result.isViral || false,
      viralReason: result.viralReason,
      skillsGained: {},
    };
  };

  // ─────────────────────────────────────────────────────────────────────
  // SCHEDULED RELEASE
  // ─────────────────────────────────────────────────────────────────────

  const scheduleSongRelease = (draft: SongDraft & { scheduledWeek: number; scheduledTime: string }) => {
    if (!singer) return;

    const coverColors = ['from-purple-600 to-indigo-700', 'from-teal-500 to-cyan-700'];
    const scheduledSong: Song = {
      id: 'scheduled_' + Date.now(),
      title: draft.title,
      genre: draft.genre,
      theme: draft.theme,
      status: 'scheduled',
      ownerIds: ['player'],
      producerId: draft.producerId || 'self-produced',
      producerName: draft.producerName || 'Home Studio Propio',
      featuredArtists: draft.featuredArtists,
      collaboratorIds: [],
      royaltySplits: { player: 100 },
      quality: Math.floor(
        (singer.skills.voice + singer.skills.composition) / 2 * 0.6 + 30
      ),
      isRemix: false,
      releaseWeek: draft.scheduledWeek,
      releaseYear: singer.career.careerYear,
      scheduledWeek: draft.scheduledWeek,
      scheduledTime: draft.scheduledTime,
      preReleaseHype: 20,
      streamsTotal: 0,
      streamsThisWeek: 0,
      streamsPeakWeek: 0,
      weeksOnChart: 0,
      chartMomentum: 0,
      coverColor: coverColors[Math.floor(Math.random() * coverColors.length)],
      melodyConfig: draft.melodyConfig,
      versions: [],
      isSingle: true,
    };

    setScheduledSongs(prev => [...prev, scheduledSong]);

    const newsItem: NewsArticle = {
      id: 'news_sched_' + Date.now(),
      headline: `📅 ANUNCIO: ${singer.artistName} anuncia "${draft.title}" para la semana ${draft.scheduledWeek}`,
      source: 'MondoSonoro',
      snippet: `El estreno programado a las ${draft.scheduledTime} ya acumula expectación.`,
      timeAgo: `Semana ${singer.career.careerWeek}`,
      category: 'lanzamiento',
      sentiment: 'positive',
    };
    setNews(prev => [newsItem, ...prev]);
  };

  // ─────────────────────────────────────────────────────────────────────
  // REMIX PROJECT (with duplicate detection)
  // ─────────────────────────────────────────────────────────────────────

  const createRemixProject = (
    originalSong: Song,
    guestArtistId: string,
    versionType: string
  ): RemixCreateResult => {
    if (!singer) return { success: false, message: 'No hay artista activo.' };

    const participantIds = ['player', guestArtistId].sort();
    const duplicate = findDuplicateRemix(
      privateProjects,
      discography,
      originalSong.id,
      participantIds,
      versionType
    );

    if (duplicate.exists) {
      return {
        success: false,
        message: duplicate.source === 'song'
          ? `Ya existe un remix publicado de "${originalSong.title}" con estos participantes.`
          : `Ya tienes un proyecto de remix de "${originalSong.title}" en curso. ¿Quieres continuarlo o duplicarlo?`,
        duplicateId: duplicate.duplicateId,
        duplicateTitle: duplicate.duplicateTitle,
        duplicateSource: duplicate.source,
      };
    }

    const guestArtist = [...FAMOUS_ARTISTS, ...FAMOUS_PRODUCERS].find(a => a.id === guestArtistId);
    const guestName = guestArtist?.name || guestArtistId;

    const identityKey = buildRemixIdentityKey(originalSong.id, participantIds, versionType);
    const versionId = 'v1_remix_' + Date.now();

    const project: PrivateProject = {
      id: 'remix_proj_' + Date.now(),
      workingTitle: `${originalSong.title} (Remix) [feat. ${guestName}]`,
      genre: originalSong.genre,
      theme: originalSong.theme,
      permission: 'collaborators',
      ownerIds: ['player'],
      invites: [],
      versions: [{
        versionId,
        label: 'v1 - base remix',
        createdAtWeek: singer.career.careerWeek,
        contributions: [{
          participantId: 'player',
          role: 'vocalist',
          description: 'Base vocal del remix',
          deliveredAt: singer.career.careerWeek,
        }],
        melodyConfig: originalSong.melodyConfig,
        qualityScore: originalSong.quality,
        notes: `Remix de "${originalSong.title}"`,
      }],
      currentVersionId: versionId,
      activity: [{
        actorId: 'player',
        actorName: singer.artistName,
        action: `Remix de "${originalSong.title}" iniciado`,
        week: singer.career.careerWeek,
      }],
      isArchived: false,
      sourceProjectId: originalSong.id,
      remixIdentity: {
        originalSongId: originalSong.id,
        participantIds,
        versionType: versionType as any,
      },
      createdAtWeek: singer.career.careerWeek,
      updatedAtWeek: singer.career.careerWeek,
      notes: `Remix de "${originalSong.title}"`,
      tags: ['remix', originalSong.genre],
    };

    setPrivateProjects(prev => [project, ...prev]);

    return {
      success: true,
      projectId: project.id,
      message: `Proyecto de remix creado. Invita a ${guestName} para que entregue su parte.`,
    };
  };

  // ─────────────────────────────────────────────────────────────────────
  // ALBUMS
  // ─────────────────────────────────────────────────────────────────────

  const createAlbum = (
    title: string,
    genre: MusicGenre,
    projectType: Album['projectType'] = 'album'
  ) => {
    const newAlbum: Album = {
      id: 'album_' + Date.now(),
      title,
      projectType,
      genre,
      tracklist: [],
      status: 'recording',
      marketingBudget: 0,
      coverGradient: projectType === 'ep'
        ? 'from-cyan-600 via-blue-600 to-indigo-800'
        : 'from-purple-700 via-pink-600 to-amber-500',
    };
    setAlbums(prev => [newAlbum, ...prev]);
  };

  const addTrackToAlbum = (albumId: string, draft: SongDraft) => {
    if (!singer) return;

    const quality = calculateSongQuality({
      singerSkills: singer.skills,
      careerPath: singer.career.path,
      producerBonus: 5,
      featureBonus: draft.featuredArtists.length,
      budgetSpent: 0,
      genreMatch: draft.genre === singer.genre,
    });

    const track: Song = {
      id: 'track_' + Date.now(),
      title: draft.title,
      genre: draft.genre,
      theme: draft.theme,
      status: 'in_production',
      ownerIds: ['player'],
      producerId: draft.producerId || 'self-produced',
      producerName: draft.producerName || 'Home Studio Propio',
      featuredArtists: draft.featuredArtists,
      collaboratorIds: [],
      royaltySplits: { player: 100 },
      quality,
      isRemix: false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal: 0,
      streamsThisWeek: 0,
      streamsPeakWeek: 0,
      weeksOnChart: 0,
      chartMomentum: 0,
      coverColor: 'from-slate-700 to-slate-900',
      melodyConfig: draft.melodyConfig,
      lyrics: draft.lyrics,
      albumId,
      versions: [],
      isSingle: false,
    };

    setAlbums(prev => prev.map(a =>
      a.id === albumId ? { ...a, tracklist: [...a.tracklist, track] } : a
    ));

    setSinger(prev => prev ? {
      ...prev,
      skills: {
        ...prev.skills,
        composition: Math.min(100, prev.skills.composition + 0.5),
      },
      career: {
        ...prev.career,
        energy: Math.max(5, prev.career.energy - 8),
      },
    } : null);
  };

  const releaseAlbum = (albumId: string, strategy: Album['marketingStrategy'], budget: number) => {
    if (!singer) return;
    const album = albums.find(a => a.id === albumId);
    if (!album || album.tracklist.length === 0) return;

    const eval_ = evaluateAlbumSuccess({ ...album, marketingStrategy: strategy, marketingBudget: budget }, singer);

    const releasedTracks = album.tracklist.map(t => ({
      ...t,
      status: 'released' as const,
      streamsTotal: Math.floor(eval_.firstWeekStreams / album.tracklist.length),
      streamsThisWeek: Math.floor(eval_.firstWeekStreams / album.tracklist.length),
      streamsPeakWeek: Math.floor(eval_.firstWeekStreams / album.tracklist.length),
    }));

    setAlbums(prev => prev.map(a =>
      a.id === albumId ? {
        ...a,
        status: 'released',
        releaseYear: singer.career.careerYear,
        criticScore: eval_.criticScore,
        marketingBudget: budget,
        marketingStrategy: strategy,
        tracklist: releasedTracks,
        totalStreams: eval_.firstWeekStreams,
      } : a
    ));

    setDiscography(prev => [...releasedTracks, ...prev]);
    setWeeksSinceLastRelease(0);

    const fameDelta = calculateFameGrowth(
      singer.fame,
      eval_.firstWeekStreams,
      album.tracklist.reduce((acc, t) => acc + t.quality, 0) / album.tracklist.length,
      false,
      null,
      singer.career.careerWeek
    );

    setSinger(prev => prev ? {
      ...prev,
      fame: { ...prev.fame, ...fameDelta, followers: prev.fame.followers + eval_.fansGained },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance - budget + eval_.revenue,
        totalEarned: prev.economy.totalEarned + eval_.revenue,
        totalSpent: prev.economy.totalSpent + budget,
      },
      career: {
        ...prev.career,
        energy: Math.max(10, prev.career.energy - 25),
        momentum: recalculateMomentum(prev.career.momentum, [
          { type: eval_.criticScore > 75 ? 'hit' : 'flop' }
        ]),
      },
    } : null);

    const albumNews: NewsArticle = {
      id: 'news_album_' + Date.now(),
      headline: `💿 ${singer.artistName} lanza "${album.title}" — Crítica: ${eval_.criticScore}/100`,
      source: 'Pitchfork',
      snippet: `${eval_.firstWeekStreams.toLocaleString()} streams en su primera semana. ${eval_.criticScore > 75 ? 'Trabajo muy valorado por la crítica.' : 'Recepción mixta.'}`,
      timeAgo: `Semana ${singer.career.careerWeek}`,
      category: 'lanzamiento',
      sentiment: eval_.criticScore > 75 ? 'positive' : 'neutral',
    };
    setNews(prev => [albumNews, ...prev]);
  };

  // ─────────────────────────────────────────────────────────────────────
  // COLLABORATIONS
  // ─────────────────────────────────────────────────────────────────────

  const respondToCollaboration = (
    proposalId: string,
    accept: boolean,
    counterRoyalty?: number,
    targetAlbumId?: string
  ) => {
    const proposal = inbox.find(p => p.id === proposalId);
    if (!proposal || !singer) return;

    // Special milestones open their dedicated modals
    if (proposal.specialType === 'bzrp' && accept) { setIsBzrpOpen(true); }
    if (proposal.specialType === 'w_sound' && accept) { setIsOvyOpen(true); }
    if (proposal.specialType === 'crossover' && accept) { setIsBigOneOpen(true); }

    // Mark proposal as handled
    setInbox(prev => prev.map(p =>
      p.id === proposalId ? {
        ...p,
        status: accept ? 'accepted' : (counterRoyalty ? 'countered' : 'rejected'),
        counterOffer: counterRoyalty ? { splitCounter: counterRoyalty, advanceCounter: 0, message: '' } : undefined,
      } : p
    ));

    if (!accept) {
      // Update relationship: rejection hurts a bit
      const delta = calculateRelationshipDelta('rejection_received');
      setSinger(prev => prev ? {
        ...prev,
        relationships: {
          ...prev.relationships,
          [proposal.fromArtistId]: (prev.relationships[proposal.fromArtistId] || 0) + delta,
        },
      } : null);
      return;
    }

    if (proposal.specialType) return; // handled by dedicated modals

    // Accept: create the collab song
    const allFeatArtists = [
      proposal.fromArtist.name,
      ...(proposal.multipleArtists || []),
    ];

    const collabQuality = Math.min(98, Math.floor(
      (singer.skills.voice * 0.4 + singer.skills.composition * 0.3 + singer.skills.flow * 0.3) +
      (proposal.fromArtist.fameTier === 'Leyenda' ? 15 :
       proposal.fromArtist.fameTier === 'Superestrella' ? 10 :
       proposal.fromArtist.fameTier === 'Famoso' ? 6 : 3)
    ));

    // Collab stream estimate based on combined reach
    const combinedListeners = singer.fame.monthlyListeners + proposal.fromArtist.monthlyListeners;
    const collabStreams = Math.floor(
      calculateInitialStreams({
        quality: collabQuality,
        monthlyListeners: combinedListeners * 0.4,
        followers: singer.fame.followers + proposal.fromArtist.followers * 0.3,
        careerStage: singer.career.stage,
        momentum: singer.career.momentum,
        marketingBudget: 5000,
        isViral: false,
        viralMultiplier: 1,
        collabPrestigeBonus: allFeatArtists.length * 10,
        isRemix: proposal.isRemixOffer || false,
        originalSongStreams: 0,
        scheduledRelease: false,
        preReleaseHype: 0,
        npcChartStrength: 50,
      })
    );

    const songId = 'collab_' + Date.now();
    const collabSong: Song = {
      id: songId,
      title: `${proposal.songTitleProposed} (feat. ${allFeatArtists.join(' & ')})`,
      genre: proposal.genre,
      theme: 'Fiesta / Flex',
      status: 'released',
      ownerIds: proposal.ownership === 'collaborator'
        ? [proposal.fromArtistId]
        : ['player', proposal.fromArtistId],
      producerId: proposal.role === 'producer' ? proposal.fromArtistId : 'self-produced',
      producerName: proposal.role === 'producer' ? proposal.fromArtist.name : 'Home Studio Propio',
      featuredArtists: allFeatArtists,
      collaboratorIds: [proposal.fromArtistId],
      royaltySplits: {
        player: proposal.splitOffer,
        [proposal.fromArtistId]: 100 - proposal.splitOffer,
      },
      quality: collabQuality,
      isRemix: proposal.isRemixOffer || false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal: collabStreams,
      streamsThisWeek: collabStreams,
      streamsPeakWeek: collabStreams,
      weeksOnChart: 1,
      chartMomentum: 0.5,
      coverColor: 'from-amber-500 via-rose-500 to-purple-700',
      versions: [],
      albumId: targetAlbumId,
      isSingle: !targetAlbumId,
    };

    if (targetAlbumId) {
      setAlbums(prev => prev.map(a =>
        a.id === targetAlbumId ? { ...a, tracklist: [...a.tracklist, collabSong] } : a
      ));
    } else {
      setDiscography(prev => [collabSong, ...prev]);
    }

    // Revenue split
    const grossRevenue = Math.floor(collabStreams * 0.0035);
    const playerRevenue = Math.floor(grossRevenue * (proposal.splitOffer / 100));

    // Unlock producer if they produced
    if (proposal.role === 'producer' && !unlockedProducers.some(p => p.id === proposal.fromArtistId)) {
      setUnlockedProducers(prev => [...prev, {
        id: proposal.fromArtistId,
        name: proposal.fromArtist.name,
        avatar: proposal.fromArtist.avatar,
        fameTier: proposal.fromArtist.fameTier,
      }]);
    }

    // Relationship improves
    const relDelta = calculateRelationshipDelta('collab_success');
    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        followers: prev.fame.followers + Math.floor(collabStreams * 0.015),
        monthlyListeners: prev.fame.monthlyListeners + Math.floor(collabStreams * 0.04),
      },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + playerRevenue,
        totalEarned: prev.economy.totalEarned + playerRevenue,
      },
      relationships: {
        ...prev.relationships,
        [proposal.fromArtistId]: (prev.relationships[proposal.fromArtistId] || 0) + relDelta,
      },
      contactedArtistIds: prev.contactedArtistIds.includes(proposal.fromArtistId)
        ? prev.contactedArtistIds
        : [...prev.contactedArtistIds, proposal.fromArtistId],
    } : null);

    const collabNews: NewsArticle = {
      id: 'news_collab_' + Date.now(),
      headline: `🤝 ${singer.artistName} colabora con ${proposal.fromArtist.name} en "${collabSong.title}"`,
      source: 'Billboard Latin',
      snippet: `${collabStreams.toLocaleString()} reproducciones en su debut.`,
      timeAgo: `Semana ${singer.career.careerWeek}`,
      category: 'colaboracion',
      sentiment: 'positive',
    };
    setNews(prev => [collabNews, ...prev]);
  };

  const proposeCollaboration = (
    artistId: string,
    format: 'single' | 'album',
    albumId?: string
  ): ProposeResult => {
    if (!singer) return { success: false, message: 'No hay artista activo.' };

    const targetArtist = [...FAMOUS_ARTISTS, ...FAMOUS_PRODUCERS].find(a => a.id === artistId);
    if (!targetArtist) return { success: false, message: 'Artista no encontrado.' };

    if (singer.career.energy < 15) {
      return { success: false, message: 'Necesitas al menos 15 de energía para entrar al estudio.' };
    }

    const perm = evaluateCollabPermission(singer, discography, targetArtist, inbox);
    if (!perm.canPropose) {
      return { success: false, message: perm.explanation };
    }

    // Cost check
    const cost = format === 'single' ? 8_000 : 5_000;
    if (singer.economy.balance < cost) {
      return { success: false, message: `Necesitas al menos ${cost.toLocaleString()} € para producir la colaboración.` };
    }

    // Resolve: does the NPC actually accept?
    const outcome = resolveCollabProposal(perm, targetArtist, 50);

    if (outcome.counterOffer) {
      return {
        success: false,
        message: outcome.reason,
        counterOffer: outcome.counterOffer,
        probability: perm.probability,
      };
    }

    if (!outcome.accepted) {
      // Deduct cost of attempt (studio time, etc.) — but much less
      setSinger(prev => prev ? {
        ...prev,
        economy: {
          ...prev.economy,
          balance: prev.economy.balance - Math.floor(cost * 0.2),
        },
        career: { ...prev.career, energy: prev.career.energy - 5 },
      } : null);

      return {
        success: false,
        message: outcome.reason,
        accepted: false,
        probability: perm.probability,
      };
    }

    // Accepted — create the song
    const collabSong: Song = {
      id: 'collab_out_' + Date.now(),
      title: `${targetArtist.name.split(' ')[0]} & ${singer.artistName} - Conexión (feat. ${targetArtist.name})`,
      genre: targetArtist.genre,
      theme: 'Fiesta / Flex',
      status: 'released',
      ownerIds: ['player', artistId],
      producerId: 'self-produced',
      producerName: 'Home Studio Propio',
      featuredArtists: [targetArtist.name],
      collaboratorIds: [artistId],
      royaltySplits: { player: 50, [artistId]: 50 },
      quality: Math.min(99, Math.floor((singer.skills.voice + singer.skills.composition) / 2) + 10),
      isRemix: false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal: 0,
      streamsThisWeek: 0,
      streamsPeakWeek: 0,
      weeksOnChart: 0,
      chartMomentum: 0,
      coverColor: 'from-fuchsia-600 via-purple-700 to-indigo-900',
      versions: [],
      isSingle: !albumId,
      albumId,
    };

    const result = _performRelease({
      title: collabSong.title,
      genre: collabSong.genre,
      theme: collabSong.theme,
      producerName: targetArtist.name,
      producerId: artistId,
      featuredArtists: [targetArtist.name],
      collaboratorIds: [artistId],
      isSingle: !albumId,
      budget: cost,
      isRemix: false,
    });

    const relDelta = calculateRelationshipDelta('collab_success');
    setSinger(prev => prev ? {
      ...prev,
      contactedArtistIds: prev.contactedArtistIds.includes(artistId)
        ? prev.contactedArtistIds
        : [...prev.contactedArtistIds, artistId],
      relationships: {
        ...prev.relationships,
        [artistId]: (prev.relationships[artistId] || 0) + relDelta,
      },
    } : null);

    return {
      success: true,
      accepted: true,
      message: `¡Colaboración con ${targetArtist.name} grabada y publicada! (${Math.floor(perm.probability * 100)}% probabilidad → aceptado)`,
      probability: perm.probability,
    };
  };

  // ─────────────────────────────────────────────────────────────────────
  // CONVERSATIONS (DMs)
  // ─────────────────────────────────────────────────────────────────────

  const getConversation = (npcId: string): ArtistConversation | undefined => {
    return conversations.find(c => c.npcArtistId === npcId);
  };

  const sendMessage = (npcId: string, text: string): MessageResult => {
    if (!singer) return { npcResponse: 'Error: no singer.', intent: 'unknown' };

    const npcArtist = [...FAMOUS_ARTISTS, ...FAMOUS_PRODUCERS].find(a => a.id === npcId);
    if (!npcArtist) return { npcResponse: 'Artista no encontrado.', intent: 'unknown' };

    const relScore = singer.relationships[npcId] || 0;
    const convo = conversations.find(c => c.npcArtistId === npcId);
    const history = convo?.messages || [];
    const pendingProposals = inbox.filter(p => p.fromArtistId === npcId && p.status === 'pending').length;

    // Classify intent and extract entities
    const intent = classifyIntent(text);
    const entities = extractEntities(text, discography, [...FAMOUS_ARTISTS, ...FAMOUS_PRODUCERS]);

    // Generate NPC response
    const response = generateNPCResponse(text, intent, entities, {
      npc: npcArtist,
      playerName: singer.artistName,
      playerFame: singer.fame,
      playerCareer: singer.career,
      playerSkills: singer.skills,
      playerSongs: discography,
      playerProjects: privateProjects,
      relationshipScore: relScore,
      conversationHistory: history,
      pendingProposals,
    });

    // Build message objects
    const playerMsg: ConversationMessage = {
      id: 'msg_p_' + Date.now(),
      from: 'player',
      text,
      sentAtWeek: singer.career.careerWeek,
      intent,
      entities,
    };

    const npcMsg: ConversationMessage = {
      id: 'msg_n_' + Date.now(),
      from: npcId,
      text: response.text,
      sentAtWeek: singer.career.careerWeek,
      intent,
    };

    // Update conversation state
    setConversations(prev => {
      const existing = prev.find(c => c.npcArtistId === npcId);
      if (existing) {
        return prev.map(c => c.npcArtistId === npcId ? {
          ...c,
          messages: [...c.messages, playerMsg, npcMsg],
          relationshipScore: relScore,
          lastUpdatedWeek: singer.career.careerWeek,
        } : c);
      } else {
        const newConvo: ArtistConversation = {
          id: 'convo_' + npcId + '_' + Date.now(),
          npcArtistId: npcId,
          messages: [playerMsg, npcMsg],
          relationshipScore: relScore,
          lastUpdatedWeek: singer.career.careerWeek,
        };
        return [newConvo, ...prev];
      }
    });

    // Small relationship boost for good conversation
    if (intent !== 'unknown' && relScore < 50) {
      setSinger(prev => prev ? {
        ...prev,
        relationships: {
          ...prev.relationships,
          [npcId]: relScore + calculateRelationshipDelta('good_conversation'),
        },
        contactedArtistIds: prev.contactedArtistIds.includes(npcId)
          ? prev.contactedArtistIds
          : [...prev.contactedArtistIds, npcId],
      } : null);
    }

    return {
      npcResponse: response.text,
      intent,
      pendingProposal: response.pendingProposal,
      suggestedAction: response.suggestedAction,
    };
  };

  // ─────────────────────────────────────────────────────────────────────
  // SPECIAL MILESTONES
  // ─────────────────────────────────────────────────────────────────────

  const triggerBzrpSession = (details: { title: string; style: string; punchlineFocus: string }) => {
    if (!singer || singer.career.milestonesCompleted.includes('bzrp_session')) return;

    // Realistic BZRP streams: big, but not instant legend-maker
    // Ranges: 3M–12M initial (based on current career stage)
    const stageMultipliers: Record<string, number> = {
      bedroom: 2_000_000, local: 4_000_000, regional: 6_000_000,
      national: 8_000_000, international: 10_000_000, global: 12_000_000, legend: 15_000_000,
    };
    const baseStreams = stageMultipliers[singer.career.stage] || 4_000_000;
    const streamsTotal = baseStreams + Math.floor(Math.random() * 2_000_000);
    const sessionNum = Math.floor(Math.random() * 20) + 62;
    const sessionTitle = `${singer.artistName} || BZRP Music Sessions #${sessionNum}`;
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.45); // 50/50 split, 70% net
    const fansGained = Math.floor(streamsTotal * 0.06); // realistic fan conversion

    const bzrpSong: Song = {
      id: 'bzrp_' + Date.now(),
      title: sessionTitle,
      genre: 'Trap / Hip-Hop',
      theme: 'Protesta / Venganza',
      status: 'released',
      ownerIds: ['player', 'bizarrap'],
      producerId: 'bizarrap',
      producerName: 'Bizarrap',
      featuredArtists: ['Bizarrap'],
      collaboratorIds: ['bizarrap'],
      royaltySplits: { player: 50, bizarrap: 50 },
      quality: 94 + Math.floor(Math.random() * 5),
      isRemix: false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal,
      streamsThisWeek: streamsTotal,
      streamsPeakWeek: streamsTotal,
      weeksOnChart: 1,
      chartMomentum: 1,
      coverColor: 'from-cyan-400 via-blue-600 to-indigo-900',
      versions: [],
      isSingle: true,
    };

    setDiscography(prev => [bzrpSong, ...prev]);
    setWeeksSinceLastRelease(0);

    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        followers: prev.fame.followers + fansGained,
        monthlyListeners: prev.fame.monthlyListeners + Math.floor(fansGained * 3),
        industryPrestige: Math.min(100, prev.fame.industryPrestige + 8),
        criticalReputation: Math.min(100, prev.fame.criticalReputation + 5),
      },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + revenue,
        totalEarned: prev.economy.totalEarned + revenue,
      },
      career: {
        ...prev.career,
        milestonesCompleted: [...prev.career.milestonesCompleted, 'bzrp_session'],
        momentum: Math.min(100, prev.career.momentum + 25),
      },
      relationships: {
        ...prev.relationships,
        bizarrap: (prev.relationships['bizarrap'] || 0) + 20,
      },
    } : null);

    const bzrpNews: NewsArticle = {
      id: 'news_bzrp_' + Date.now(),
      headline: `⚡ ${singer.artistName} || BZRP Music Sessions #${sessionNum} — El mundo lo descubre`,
      source: 'Billboard Global',
      snippet: `${streamsTotal.toLocaleString()} streams iniciales. La sesión se posiciona rápidamente en los charts globales.`,
      timeAgo: 'Ahora mismo',
      category: 'lanzamiento',
      sentiment: 'viral',
    };
    setNews(prev => [bzrpNews, ...prev]);
    setIsBzrpOpen(false);
  };

  const triggerOvyWSound = (details: { vibe: string; mood: string }) => {
    if (!singer || singer.career.milestonesCompleted.includes('ovy_wsound')) return;

    const stageMultipliers: Record<string, number> = {
      bedroom: 1_500_000, local: 3_000_000, regional: 5_000_000,
      national: 7_000_000, international: 9_000_000, global: 11_000_000, legend: 13_000_000,
    };
    const streamsTotal = (stageMultipliers[singer.career.stage] || 3_000_000) + Math.floor(Math.random() * 1_500_000);
    const title = `${singer.artistName} - W Sound #01 (Prod. Ovy On The Drums)`;
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.45);
    const fansGained = Math.floor(streamsTotal * 0.05);

    const ovySong: Song = {
      id: 'ovy_' + Date.now(),
      title,
      genre: 'Urbano / Reggaeton',
      theme: 'Fiesta / Flex',
      status: 'released',
      ownerIds: ['player', 'ovy-on-the-drums'],
      producerId: 'ovy-on-the-drums',
      producerName: 'Ovy On The Drums',
      featuredArtists: ['Ovy On The Drums'],
      collaboratorIds: ['ovy-on-the-drums'],
      royaltySplits: { player: 50, 'ovy-on-the-drums': 50 },
      quality: 93 + Math.floor(Math.random() * 5),
      isRemix: false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal,
      streamsThisWeek: streamsTotal,
      streamsPeakWeek: streamsTotal,
      weeksOnChart: 1,
      chartMomentum: 0.8,
      coverColor: 'from-amber-400 via-yellow-500 to-orange-500',
      versions: [],
      isSingle: true,
    };

    setDiscography(prev => [ovySong, ...prev]);
    setWeeksSinceLastRelease(0);
    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        followers: prev.fame.followers + fansGained,
        monthlyListeners: prev.fame.monthlyListeners + Math.floor(fansGained * 2.5),
        industryPrestige: Math.min(100, prev.fame.industryPrestige + 6),
      },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + revenue,
        totalEarned: prev.economy.totalEarned + revenue,
      },
      career: {
        ...prev.career,
        milestonesCompleted: [...prev.career.milestonesCompleted, 'ovy_wsound'],
        momentum: Math.min(100, prev.career.momentum + 18),
      },
    } : null);

    setNews(prev => [{
      id: 'news_ovy_' + Date.now(),
      headline: `✨ ${singer.artistName} x Ovy On The Drums: W Sound #01 ya disponible`,
      source: 'Rolling Stone en Español',
      snippet: `${streamsTotal.toLocaleString()} streams en su debut.`,
      timeAgo: 'Ahora mismo',
      category: 'lanzamiento',
      sentiment: 'viral',
    }, ...prev]);
    setIsOvyOpen(false);
  };

  const triggerBigOneCrossover = (details: { title: string; partnerArtist: string; vibe: string; crossoverNumber?: number }) => {
    if (!singer || singer.career.milestonesCompleted.includes('bigone_crossover')) return;

    const num = details.crossoverNumber || 8;
    const fmt = num < 10 ? `0${num}` : `${num}`;
    const title = `Big One - ${details.title} (Crossover #${fmt}) [con ${singer.artistName} & ${details.partnerArtist}]`;

    const stageMultipliers: Record<string, number> = {
      bedroom: 1_800_000, local: 3_500_000, regional: 5_500_000,
      national: 8_000_000, international: 10_500_000, global: 13_000_000, legend: 15_000_000,
    };
    const streamsTotal = (stageMultipliers[singer.career.stage] || 3_500_000) + Math.floor(Math.random() * 2_000_000);
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.40);
    const fansGained = Math.floor(streamsTotal * 0.045);

    const crossoverSong: Song = {
      id: 'crossover_' + Date.now(),
      title,
      genre: 'Urbano / Reggaeton',
      theme: 'Fiesta / Flex',
      status: 'released',
      ownerIds: ['player', 'big-one'],
      producerId: 'big-one',
      producerName: 'Big One',
      featuredArtists: ['Big One', details.partnerArtist],
      collaboratorIds: ['big-one'],
      royaltySplits: { player: 40, 'big-one': 35, partner: 25 },
      quality: 94 + Math.floor(Math.random() * 4),
      isRemix: false,
      releaseWeek: singer.career.careerWeek,
      releaseYear: singer.career.careerYear,
      streamsTotal,
      streamsThisWeek: streamsTotal,
      streamsPeakWeek: streamsTotal,
      weeksOnChart: 1,
      chartMomentum: 0.9,
      coverColor: 'from-indigo-600 via-blue-600 to-teal-500',
      versions: [],
      isSingle: true,
    };

    setDiscography(prev => [crossoverSong, ...prev]);
    setWeeksSinceLastRelease(0);
    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        followers: prev.fame.followers + fansGained,
        monthlyListeners: prev.fame.monthlyListeners + Math.floor(fansGained * 2.8),
        industryPrestige: Math.min(100, prev.fame.industryPrestige + 7),
      },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + revenue,
        totalEarned: prev.economy.totalEarned + revenue,
      },
      career: {
        ...prev.career,
        milestonesCompleted: [...prev.career.milestonesCompleted, 'bigone_crossover'],
        momentum: Math.min(100, prev.career.momentum + 20),
      },
    } : null);

    setNews(prev => [{
      id: 'news_crossover_' + Date.now(),
      headline: `🔥 Big One - Crossover #${fmt} con ${singer.artistName} y ${details.partnerArtist} — Debut explosivo`,
      source: 'Billboard Latin',
      snippet: `${streamsTotal.toLocaleString()} streams en su primera semana.`,
      timeAgo: 'Ahora mismo',
      category: 'lanzamiento',
      sentiment: 'viral',
    }, ...prev]);
    setIsBigOneOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────
  // ADVANCE TIME
  // ─────────────────────────────────────────────────────────────────────

  const advanceTime = () => {
    if (!singer) return;

    const wasActive = weeksSinceLastRelease === 0;
    const weekResult = advanceWeekCareer(
      singer.career,
      singer.fame,
      discography.length,
      albums.filter(a => a.status === 'released').length,
      wasActive
    );

    // ── Decay all released songs ──
    setDiscography(prev => {
      const updatedSongs = prev.map(song => {
        if (song.status !== 'released') return song;
        const newWeeklyStreams = calculateWeeklyStreamDecay(
          song.streamsThisWeek,
          song.weeksOnChart + 1,
          song.quality,
          song.chartMomentum
        );
        return {
          ...song,
          streamsThisWeek: newWeeklyStreams,
          streamsTotal: song.streamsTotal + newWeeklyStreams,
          weeksOnChart: song.weeksOnChart + 1,
          chartMomentum: Math.max(-1, song.chartMomentum - 0.1),
          certification: getCertification(song.streamsTotal + newWeeklyStreams) || song.certification,
        };
      });
      
      // Actualizar con datos de charts
      return updateSongsFromChart(updatedSongs, globalCharts);
    });

    // ── NPC songs advance ──
    const advancedNPC = advanceNPCSongs(npcSongs);
    // Occasionally spawn a new NPC song
    if (Math.random() < 0.35) {
      advancedNPC.push(generateNewNPCSong(weekResult.newCareerWeek, weekResult.newCareerYear));
    }
    setNpcSongs(advancedNPC);

    // ── Monthly listener decay if inactive ──
    const newListeners = applyListenerDecay(singer.fame.monthlyListeners, weeksSinceLastRelease + 1);

    // ── Weekly revenue ──
    const activeContract = contracts.find(c => c.status === 'active' && c.type === 'label');
    const managementContract = contracts.find(c => c.status === 'active' && c.type === 'management');

    const revenueCalc = calculateWeeklyRevenue({
      discography: discography.filter(s => s.status === 'released'),
      albumsReleased: albums.filter(a => a.status === 'released'),
      labelSharePercent: activeContract?.terms.labelSharePercent || 0,
      managementFeePercent: managementContract?.terms.managementFeePercent || 0,
      showsThisWeek: 0,
      showFeePerEvent: 0,
      productionCommissions: 0,
      licensingDeals: 0,
    });

    // ── Expire old inbox proposals ──
    setInbox(prev => prev.map(p =>
      p.status === 'pending' && p.expiresAtWeek <= weekResult.newCareerWeek
        ? { ...p, status: 'expired' }
        : p
    ));

    // ── Check scheduled releases ──
    const readyToRelease = scheduledSongs.filter(
      s => (s.scheduledWeek || 0) <= weekResult.newCareerWeek
    );
    const stillScheduled = scheduledSongs.filter(
      s => (s.scheduledWeek || 0) > weekResult.newCareerWeek
    );

    if (readyToRelease.length > 0) {
      readyToRelease.forEach(song => {
        const result = _performRelease({
          title: song.title,
          genre: song.genre,
          theme: song.theme,
          producerName: 'Home Studio Propio',
          producerId: song.producerId,
          featuredArtists: song.featuredArtists,
          isSingle: true,
          budget: 0,
          melodyConfig: song.melodyConfig,
        });
      });
      setScheduledSongs(stillScheduled);
    }

    // ── Grammy check (new year) ──
    if (weekResult.newCareerYear > singer.career.careerYear) {
      const newAwards = checkGrammysEligibility(
        discography, albums, singer.career.careerYear, singer.fame
      );
      if (newAwards.length > 0) {
        setAwards(prev => [...newAwards, ...prev]);
        const grammyWinner = newAwards.find(a => a.won);
        if (grammyWinner) {
          setNews(prev => [{
            id: 'news_grammy_' + Date.now(),
            headline: `🏆 ${singer.artistName} gana el Grammy por "${grammyWinner.songOrAlbumTitle}"`,
            source: 'Recording Academy',
            snippet: `Noche histórica para ${singer.artistName} en la gala de los Grammy.`,
            timeAgo: `Año ${singer.career.careerYear}`,
            category: 'premios',
            sentiment: 'positive',
          }, ...prev]);
        }
      }
    }

    // ── Producer: generate beat commissions ──
    if (singer.career.path === 'producer') {
      const commission = generateBeatCommission(singer.fame, singer.skills, weekResult.newCareerWeek);
      if (commission) setBeatCommissions(prev => [commission, ...prev]);
    }

    // ── DJ: generate gig opportunities ──
    if (singer.career.path === 'dj') {
      const gig = generateDJGig(singer.fame, singer.skills, weekResult.newCareerWeek);
      if (gig) setDjGigs(prev => [gig, ...prev]);
    }

    // ── Incoming NPC collab proposals ──
    _maybeGenerateCollabProposal(singer, weekResult.newCareerWeek);

    // ── Random decision event (PROGRESIVO basado en popularidad) ──
    if (Math.random() > 0.72 && !activeDecisionEvent) {
      const listeners = singer.fame.monthlyListeners;
      const followers = singer.fame.followers;
      
      // Filtrar eventos según el nivel de carrera
      let eligibleEvents = RANDOM_DECISION_EVENTS.filter(evt => {
        // Eventos para principiantes (< 50K oyentes)
        if (listeners < 50_000) {
          return ['upgrade_equipment', 'friend_promo', 'genre_experiment', 'learn_skill'].includes(evt.id);
        }
        // Eventos para emergentes (50K - 500K)
        else if (listeners < 500_000) {
          return ['twitter_beef_rival', 'viral_challenge', 'local_tour'].includes(evt.id);
        }
        // Eventos para establecidos (500K - 5M)
        else if (listeners < 5_000_000) {
          return ['la_resistencia_interview', 'international_collab'].includes(evt.id);
        }
        // Eventos para estrellas (5M+)
        else {
          return ['festival_headliner_crisis', 'world_tour'].includes(evt.id);
        }
      });
      
      // Si no hay eventos elegibles para este nivel, permitir todos
      if (eligibleEvents.length === 0) {
        eligibleEvents = RANDOM_DECISION_EVENTS;
      }
      
      const evt = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
      setActiveDecisionEvent(evt);
    }

    // ── Random rumors ──
    if (Math.random() > 0.55) {
      const rumorTexts = [
        { title: 'Avistamiento en estudio', snippet: `Fans ven a ${singer.artistName} salir de un estudio a altas horas.`, source: 'X / Twitter', bonus: 12 },
        { title: 'Audio filtrado en TikTok', snippet: `Un fragmento de 15 segundos con la voz de ${singer.artistName} se viraliza.`, source: 'TikTok', bonus: 22 },
        { title: 'Especulación sobre próximo proyecto', snippet: `La comunidad descifra pistas en las historias de ${singer.artistName}.`, source: 'Reddit', bonus: 8 },
      ];
      const r = rumorTexts[Math.floor(Math.random() * rumorTexts.length)];
      setRumors(prev => [{
        id: 'rumor_' + Date.now(),
        title: r.title,
        leakSnippet: r.snippet,
        source: r.source,
        timeAgo: `Semana ${weekResult.newCareerWeek}`,
        hypeBonus: r.bonus,
        artistInvolved: singer.artistName,
        verified: Math.random() > 0.5,
      }, ...prev.slice(0, 14)]);
    }

    // ── NUEVO: Generar noticias dinámicas basadas en acontecimientos reales ──
    const newsContext: NewsGenerationContext = {
      singer,
      discography,
      currentWeek: weekResult.newCareerWeek,
      currentYear: weekResult.newCareerYear,
      globalCharts,
      countryCharts: { [selectedCountry]: countryCharts },
      existingNews: news,
      coveredMilestones: coveredNewsMilestones,
    };

    const newNews = generateNewsForWeek(newsContext);
    if (newNews.length > 0) {
      setNews(prev => [...newNews, ...updateNewsTimestamps(prev, 1)].slice(0, 50));
      setCoveredNewsMilestones(newsContext.coveredMilestones);
    } else {
      // Solo actualizar timestamps si no hay noticias nuevas
      setNews(prev => updateNewsTimestamps(prev, 1));
    }

    // ── Decay de expectación y detección de teorías ──
    setProjectExpectations(prev =>
      prev.map(e => decayExpectation(e, weekResult.newCareerWeek))
    );

    // Detectar teorías por silencio
    const silenceTheories = detectSilenceTheories({
      artist: singer,
      statements: publicStatements,
      expectations: projectExpectations,
      weeksSinceLastRelease: weeksSinceLastRelease + 1,
      currentWeek: weekResult.newCareerWeek,
      existingRumors: rumors,
    });

    if (silenceTheories.length > 0) {
      setRumors(prev => [...silenceTheories, ...prev].slice(0, 50));
    }

    // ── Guardar snapshots de charts para comparación futura ──
    const globalSnapshot = createChartSnapshot(globalCharts, chartConfig);
    const countrySnapshot = createChartSnapshot(countryCharts, countryChartConfig);
    setChartSnapshots(prev => [globalSnapshot, countrySnapshot, ...prev].slice(0, 20)); // mantener últimas 20 semanas

    // ── Update singer ──
    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        monthlyListeners: newListeners,
      },
      career: {
        ...prev.career,
        careerWeek: weekResult.newCareerWeek,
        careerYear: weekResult.newCareerYear,
        yearsActive: weekResult.newYearsActive,
        stage: weekResult.newStage,
        energy: weekResult.energyRestored,
        momentum: recalculateMomentum(prev.career.momentum + weekResult.momentumDelta, []),
      },
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + revenueCalc.net,
        weeklyIncome: revenueCalc.gross,
        weeklyExpenses: revenueCalc.breakdown.labelDeduction + revenueCalc.breakdown.managementDeduction,
        royaltiesStreaming: prev.economy.royaltiesStreaming + revenueCalc.breakdown.streaming,
      },
    } : null);

    setWeeksSinceLastRelease(prev => prev + 1);
  };

  // ─── COLLAB PROPOSAL GENERATOR ────────────────────────────────────────

  const _maybeGenerateCollabProposal = (currentSinger: Singer, nextWeek: number) => {
    const hasTraction = discography.some(s => s.streamsTotal >= 35_000) || currentSinger.fame.followers >= 12_000;
    const hasHit = discography.some(s => s.streamsTotal >= 500_000 || (s.currentChartPosition || 99) <= 20);

    if (!hasTraction) return;
    if (Math.random() > 0.50) return;

    const allArtists = [...FAMOUS_ARTISTS, ...FAMOUS_PRODUCERS];
    const playerTier = getPlayerFameTier(currentSinger.fame, currentSinger.career, discography.length);

    const tierWeights: Record<string, number> = {
      Underground: 0, Promesa: 1, Emergente: 2, Famoso: 3, Superestrella: 4, Leyenda: 5,
    };
    const pWeight = tierWeights[playerTier] || 0;

    // Select candidate
    let candidates = allArtists.filter(a => {
      const aWeight = tierWeights[a.fameTier] || 0;
      if (pWeight <= 2) return Math.abs(aWeight - pWeight) <= 1; // peers
      if (hasHit && pWeight >= 3) return aWeight <= pWeight + 1; // player is big, any level
      return aWeight <= pWeight;
    });

    if (candidates.length === 0) return;

    // Avoid spamming same artist
    const recentFromIds = inbox.slice(0, 5).map(p => p.fromArtistId);
    candidates = candidates.filter(a => !recentFromIds.includes(a.id));

    if (candidates.length === 0) return;

    const artist = candidates[Math.floor(Math.random() * candidates.length)];
    const isRemixOffer = hasHit && Math.random() > 0.6;
    const eligibleHits = discography.filter(s => s.streamsTotal >= 100_000 && !s.isRemix);
    const targetSong = isRemixOffer && eligibleHits.length > 0
      ? eligibleHits[Math.floor(Math.random() * eligibleHits.length)]
      : null;

    const songTitle = targetSong ? targetSong.title
      : ['Noche en Candela', 'Eclipse Lunar', 'Diamantes', 'De Vuelta a Casa', 'Flow Exclusivo'][
          Math.floor(Math.random() * 5)
        ];

    const expiresAtWeek = nextWeek + 4;
    const proposal: CollaborationProposal = {
      id: 'prop_' + Date.now(),
      fromArtistId: artist.id,
      fromArtist: artist,
      toArtistId: 'player',
      songTitleProposed: songTitle,
      genre: artist.genre,
      role: 'feat',
      splitOffer: 50,
      budgetOffered: 15_000,
      advancePayment: Math.floor(artist.followers * 0.0008) + 5_000,
      message: getArtistDialogue(artist, currentSinger.artistName, songTitle, isRemixOffer),
      timestamp: `Semana ${nextWeek}`,
      sentAtWeek: nextWeek,
      expiresAtWeek,
      status: 'pending',
      isRemixOffer: isRemixOffer || false,
      isImportant: artist.fameTier === 'Superestrella' || artist.fameTier === 'Leyenda',
      artistOrigin: artist.origin,
    };

    setInbox(prev => [proposal, ...prev]);

    // Track contact
    setSinger(prev => {
      if (!prev || prev.contactedArtistIds.includes(artist.id)) return prev;
      return { ...prev, contactedArtistIds: [...prev.contactedArtistIds, artist.id] };
    });

    if (proposal.isImportant) setActiveCollabOffer(proposal);
  };

  // ─────────────────────────────────────────────────────────────────────
  // EUROVISION
  // ─────────────────────────────────────────────────────────────────────

  const participateInEurovision = (song: Song): EurovisionResult => {
    if (!singer) throw new Error('No singer');

    const points = Math.floor(Math.random() * 320) + 140;
    const finalRank = points > 390 ? 1 : points > 290 ? 3 : points > 210 ? 6 : 12;
    const milestoneKey = `eurovision_${singer.career.careerYear}`;

    const res: EurovisionResult = {
      year: singer.career.careerYear,
      songTitle: song.title,
      finalRank,
      points,
      winnerCountry: finalRank === 1 ? singer.nationality : 'Suecia',
    };

    if (finalRank <= 3) {
      setAwards(prev => [{
        id: 'eurovision_' + singer.career.careerYear,
        name: 'Eurovision Song Contest',
        category: `Podio Eurovisión (#${finalRank})`,
        year: singer.career.careerYear,
        songOrAlbumTitle: song.title,
        won: true,
        nominated: true,
        trophyIcon: '🎙️',
      }, ...prev]);
    }

    const fansGained = finalRank === 1 ? 400_000 : finalRank <= 3 ? 150_000 : 60_000;
    setSinger(prev => prev ? {
      ...prev,
      fame: {
        ...prev.fame,
        followers: prev.fame.followers + fansGained,
        monthlyListeners: prev.fame.monthlyListeners + fansGained * 2,
        commercialAppeal: Math.min(100, prev.fame.commercialAppeal + (finalRank === 1 ? 15 : 8)),
      },
      career: {
        ...prev.career,
        milestonesCompleted: [...prev.career.milestonesCompleted, milestoneKey],
        energy: Math.max(10, prev.career.energy - 30),
      },
    } : null);

    setNews(prev => [{
      id: 'news_eur_' + Date.now(),
      headline: finalRank === 1
        ? `🏆 ¡${singer.artistName} GANA EUROVISIÓN para ${singer.nationality.toUpperCase()}!`
        : `Eurovisión: ${singer.artistName} logra el puesto #${finalRank} con "${song.title}"`,
      source: 'Eurovision.tv',
      snippet: `${points} puntos. ${fansGained.toLocaleString()} nuevos seguidores.`,
      timeAgo: `Año ${singer.career.careerYear}`,
      category: 'premios',
      sentiment: finalRank <= 3 ? 'positive' : 'neutral',
    }, ...prev]);

    return res;
  };

  // ─────────────────────────────────────────────────────────────────────
  // DECISION EVENTS
  // ─────────────────────────────────────────────────────────────────────

  const dismissDecisionEvent = () => setActiveDecisionEvent(null);

  const resolveDecision = (choiceIndex: number) => {
    if (!activeDecisionEvent || !singer) return;
    const choice = activeDecisionEvent.choices[choiceIndex];

    if (activeDecisionEvent.category === 'eurovision' && choiceIndex === 0) {
      setEurovisionModalOpen(true);
    }

    const c = choice.consequences;
    setSinger(prev => {
      if (!prev) return null;
      const newFame: FameProfile = {
        ...prev.fame,
        followers: Math.max(0, prev.fame.followers + (c.followers || 0)),
        monthlyListeners: Math.max(0, prev.fame.monthlyListeners + (c.monthlyListeners || 0)),
        ...(c.fame || {}),
      };
      const newSkills: ArtistSkills = {
        ...prev.skills,
        ...Object.fromEntries(
          Object.entries(c.skills || {}).map(([k, v]) => [
            k, Math.min(100, Math.max(0, (prev.skills as any)[k] + (v as number)))
          ])
        ),
      };
      return {
        ...prev,
        fame: newFame,
        skills: newSkills,
        economy: {
          ...prev.economy,
          balance: Math.max(0, prev.economy.balance + (c.money || 0)),
        },
        career: {
          ...prev.career,
          energy: Math.min(100, Math.max(0, prev.career.energy + (c.energy || 0))),
          momentum: Math.min(100, Math.max(0, prev.career.momentum + (c.momentum || 0))),
        },
        relationships: c.relationship ? {
          ...prev.relationships,
          [c.relationship.artistId]: (prev.relationships[c.relationship.artistId] || 0) + c.relationship.delta,
        } : prev.relationships,
      };
    });

    if (c.newsHeadline) {
      setNews(prev => [{
        id: 'news_dec_' + Date.now(),
        headline: c.newsHeadline!,
        source: c.newsSource || 'Prensa Musical',
        snippet: `Decisión tomada por ${singer.artistName}.`,
        timeAgo: 'Hace momentos',
        category: 'polemica',
        sentiment: (c.followers || 0) >= 0 ? 'positive' : 'negative',
      }, ...prev]);
    }

    setActiveDecisionEvent(null);
  };

  // ─────────────────────────────────────────────────────────────────────
  // ECONOMY ACTIONS
  // ─────────────────────────────────────────────────────────────────────

  const acceptBeatCommission = (commissionId: string) => {
    if (!singer) return;
    const commission = beatCommissions.find(c => c.id === commissionId);
    if (!commission || commission.status !== 'pending') return;

    setBeatCommissions(prev => prev.map(c =>
      c.id === commissionId ? { ...c, status: 'accepted' } : c
    ));

    setSinger(prev => prev ? {
      ...prev,
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + commission.budget,
        totalEarned: prev.economy.totalEarned + commission.budget,
        incomeFromProduction: prev.economy.incomeFromProduction + commission.budget,
      },
      skills: {
        ...prev.skills,
        production: Math.min(100, prev.skills.production + 0.8),
        negotiation: Math.min(100, prev.skills.negotiation + 0.3),
      },
    } : null);
  };

  const acceptDJGig = (gigId: string) => {
    if (!singer) return;
    const gig = djGigs.find(g => g.id === gigId);
    if (!gig || gig.status !== 'offered') return;

    setDjGigs(prev => prev.map(g =>
      g.id === gigId ? { ...g, status: 'completed' } : g
    ));

    setSinger(prev => prev ? {
      ...prev,
      economy: {
        ...prev.economy,
        balance: prev.economy.balance + gig.fee,
        totalEarned: prev.economy.totalEarned + gig.fee,
        incomeFromDJSets: prev.economy.incomeFromDJSets + gig.fee,
        incomeFromShows: prev.economy.incomeFromShows + gig.fee,
      },
      fame: {
        ...prev.fame,
        monthlyListeners: prev.fame.monthlyListeners + Math.floor(gig.audienceReached * 0.1),
        followers: prev.fame.followers + Math.floor(gig.audienceReached * 0.03),
        industryPrestige: Math.min(100, prev.fame.industryPrestige + gig.reputationGain * 0.1),
      },
      skills: {
        ...prev.skills,
        performance: Math.min(100, prev.skills.performance + 1.2),
        charisma: Math.min(100, prev.skills.charisma + 0.5),
      },
      career: {
        ...prev.career,
        energy: Math.max(5, prev.career.energy - 20),
      },
    } : null);
  };

  // ─────────────────────────────────────────────────────────────────────
  // EXPECTATION & HYPE SYSTEM
  // ─────────────────────────────────────────────────────────────────────

  const makePublicStatement = (
    type: StatementType,
    text: string,
    relatedProjectId?: string
  ): PublicStatement => {
    if (!singer) throw new Error('No singer available');

    const statement = createPublicStatement({
      artistId: 'player',
      artistName: singer.artistName,
      type,
      text,
      currentWeek: singer.career.careerWeek,
      currentYear: singer.career.careerYear,
      context: 'social_post',
      relatedProjectId,
      followers: singer.fame.followers,
    });

    setPublicStatements(prev => [statement, ...prev]);

    // Si está relacionado con un proyecto, actualizar su expectación
    if (relatedProjectId) {
      setProjectExpectations(prev => {
        const existing = prev.find(e => e.projectId === relatedProjectId);
        if (existing) {
          return prev.map(e =>
            e.projectId === relatedProjectId
              ? updateProjectExpectation(e, {
                  type: 'statement',
                  data: { statementId: statement.id },
                  currentWeek: singer.career.careerWeek,
                })
              : e
          );
        } else {
          const newExpectation = initProjectExpectation({
            projectId: relatedProjectId,
            projectType: 'album',
            artistId: 'player',
            artistName: singer.artistName,
            currentWeek: singer.career.careerWeek,
            initialStatementId: statement.id,
          });
          return [...prev, newExpectation];
        }
      });
    }

    // Generar noticia si importante
    if (type === 'album_announcement' || type === 'release_date') {
      const newsHeadline =
        type === 'album_announcement'
          ? `${singer.artistName} anuncia oficialmente su nuevo álbum`
          : `${singer.artistName} confirma fecha de lanzamiento`;

      setNews(prev => [
        {
          id: `news_statement_${statement.id}`,
          headline: newsHeadline,
          source: 'Billboard',
          snippet: `"${text}"`,
          timeAgo: 'Hace unas horas',
          category: 'lanzamiento',
          sentiment: 'positive',
          relatedArtistId: 'player',
        },
        ...prev,
      ]);
    }

    return statement;
  };

  const startLiveStream = (
    params: Omit<CreateLiveStreamParams, 'artistId' | 'artistName' | 'followers' | 'monthlyListeners' | 'currentWeek'>
  ): LiveStreamEvent => {
    if (!singer) throw new Error('No singer available');

    const liveStream = simulateLiveStream({
      ...params,
      artistId: 'player',
      artistName: singer.artistName,
      followers: singer.fame.followers,
      monthlyListeners: singer.fame.monthlyListeners,
      currentWeek: singer.career.careerWeek,
    });

    setActiveLiveStream(liveStream);
    setSinger(prev =>
      prev
        ? { ...prev, fame: { ...prev.fame, followers: prev.fame.followers + liveStream.followersGained } }
        : null
    );

    return liveStream;
  };

  const endLiveStream = () => {
    if (!activeLiveStream) return;
    setLiveStreamHistory(prev => [activeLiveStream, ...prev].slice(0, 20));

    if (activeLiveStream.newsGenerated) {
      setNews(prev => [
        {
          id: `news_live_${activeLiveStream.id}`,
          headline: `El directo de ${activeLiveStream.artistName} genera expectación`,
          source: 'Complex',
          snippet: `${activeLiveStream.peakViewers.toLocaleString()} espectadores en directo.`,
          timeAgo: 'Hace unas horas',
          category: 'lanzamiento',
          sentiment: 'positive',
          relatedArtistId: 'player',
        },
        ...prev,
      ]);
    }

    setActiveLiveStream(null);
  };

  const announceAlbum = (albumId: string, hasDate = false, releaseWeek?: number) => {
    if (!singer) return;
    const album = albums.find(a => a.id === albumId);
    if (!album) return;

    setAlbums(prev =>
      prev.map(a =>
        a.id === albumId
          ? { ...a, announcedAtWeek: singer.career.careerWeek, scheduledReleaseWeek: releaseWeek }
          : a
      )
    );

    setProjectExpectations(prev => {
      const existing = prev.find(e => e.projectId === albumId);
      if (existing) {
        return prev.map(e =>
          e.projectId === albumId
            ? updateProjectExpectation(e, {
                type: 'announcement',
                data: { hasDate, releaseWeek },
                currentWeek: singer.career.careerWeek,
              })
            : e
        );
      }
      return prev;
    });

    setNews(prev => [
      {
        id: `news_album_${albumId}`,
        headline: `${singer.artistName} anuncia "${album.title}"`,
        source: 'Billboard',
        snippet: hasDate ? `Llegará en la semana ${releaseWeek}` : 'La comunidad reacciona con entusiasmo',
        timeAgo: 'Hace unas horas',
        category: 'lanzamiento',
        sentiment: 'viral',
        relatedArtistId: 'player',
      },
      ...prev,
    ]);
  };

  const showTeaser = (
    projectId: string,
    type: ProjectTeaser['type'],
    content: string,
    songId?: string
  ) => {
    if (!singer) return;

    const teaser: ProjectTeaser = {
      id: `teaser_${Date.now()}`,
      type,
      content,
      revealedAtWeek: singer.career.careerWeek,
      source: 'social_post',
      songId,
      viralityScore: Math.floor(Math.random() * 50) + 30,
      publicReaction: 'interested',
    };

    setProjectExpectations(prev =>
      prev.map(e =>
        e.projectId === projectId
          ? updateProjectExpectation(e, {
              type: 'teaser',
              data: { teaser },
              currentWeek: singer.career.careerWeek,
            })
          : e
      )
    );
  };

  const getProjectExpectation = (projectId: string) => {
    return projectExpectations.find(e => e.projectId === projectId);
  };

  // ─────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────

  return (
    <GameContext.Provider value={{
      singer,
      discography,
      scheduledSongs,
      privateProjects,
      albums,
      news,
      rumors,
      globalCharts,
      countryCharts,
      selectedCountry,
      setSelectedCountry,
      inbox,
      conversations,
      contracts,
      npcSongs,
      beatCommissions,
      djGigs,
      unlockedProducers,
      activeDecisionEvent,
      dismissDecisionEvent,
      resolveDecision,
      activeCollabOffer,
      setActiveCollabOffer,
      awards,
      isBzrpOpen,
      setIsBzrpOpen,
      isOvyOpen,
      setIsOvyOpen,
      isBigOneOpen,
      setIsBigOneOpen,
      eurovisionModalOpen,
      setEurovisionModalOpen,
      isSaving,
      activeTab,
      setActiveTab,
      weeksSinceLastRelease,
      bzrpEligible,
      createSinger,
      createPrivateProject,
      publishProject,
      releaseSingle,
      scheduleSongRelease,
      archiveProject,
      duplicateProject,
      renameProject,
      addVersionToProject,
      createRemixProject,
      createAlbum,
      addTrackToAlbum,
      releaseAlbum,
      respondToCollaboration,
      proposeCollaboration,
      sendMessage,
      getConversation,
      triggerBzrpSession,
      triggerOvyWSound,
      triggerBigOneCrossover,
      advanceTime,
      participateInEurovision,
      acceptBeatCommission,
      acceptDJGig,
      // Expectation system
      publicStatements,
      projectExpectations,
      liveStreamHistory,
      activeLiveStream,
      makePublicStatement,
      startLiveStream,
      endLiveStream,
      announceAlbum,
      showTeaser,
      getProjectExpectation,
      saveGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
