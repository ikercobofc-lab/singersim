import React, { createContext, useContext, useEffect, useState } from 'react';
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
  NPCArtist
} from '../types';
import { INITIAL_GLOBAL_CHARTS, generateCountryCharts } from '../data/initialCharts';
import { FAMOUS_ARTISTS, FAMOUS_PRODUCERS, getArtistDialogue } from '../data/artists';
import { RANDOM_DECISION_EVENTS } from '../data/events';
import { calculateSongSuccess, evaluateAlbumSuccess, checkGrammysEligibility } from '../utils/simulationEngine';
import { 
  getPlayerFameTier, 
  checkBzrpEligibility, 
  checkCrossoverOrWSoundEligibility, 
  evaluateCollabPermission 
} from '../utils/collabRules';
import { useAuth } from './AuthContext';
import { saveCareerToFirestore, loadCareerFromFirestore } from '../firebase/firestoreService';

interface GameContextType {
  singer: Singer | null;
  createSinger: (data: Partial<Singer>) => void;
  discography: Song[];
  scheduledSongs: Song[];
  albums: Album[];
  news: NewsArticle[];
  rumors: RumorItem[];
  globalCharts: SpotifyChartEntry[];
  countryCharts: SpotifyChartEntry[];
  selectedCountry: string;
  setSelectedCountry: (countryName: string) => void;
  inbox: CollaborationProposal[];
  unlockedProducers: { id: string; name: string; avatar: string; fameTier: string }[];
  activeDecisionEvent: DecisionEvent | null;
  dismissDecisionEvent: () => void;
  resolveDecision: (choiceIndex: number) => void;
  activeCollabOffer: CollaborationProposal | null;
  setActiveCollabOffer: (offer: CollaborationProposal | null) => void;
  respondToCollaboration: (proposalId: string, accept: boolean, ownership?: 'player' | 'collaborator', targetAlbumId?: string) => void;
  proposeCollaboration: (artistId: string | string[], format: 'single' | 'album' | 'remix', albumId?: string, originalSongId?: string) => { success: boolean; message: string };
  createSongRemix: (originalSong: Song, guestArtistName: string) => void;
  releaseSingle: (songDraft: any) => any;
  scheduleSongRelease: (songDraft: any) => void;
  createAlbum: (title: string, genre: Singer['genre'], projectType?: 'album' | 'ep') => void;
  addTrackToAlbum: (albumId: string, trackDraft: any) => void;
  releaseAlbum: (albumId: string, strategy: any, budget: number) => void;
  bzrpEligible: boolean;
  isBzrpOpen: boolean;
  setIsBzrpOpen: (open: boolean) => void;
  triggerBzrpSession: (trackDetails: { title: string; style: string; punchlineFocus: string }) => void;
  isOvyOpen: boolean;
  setIsOvyOpen: (open: boolean) => void;
  triggerOvyWSound: (trackDetails: { vibe: string; mood: string }) => void;
  isBigOneOpen: boolean;
  setIsBigOneOpen: (open: boolean) => void;
  triggerBigOneCrossover: (trackDetails: { title: string; partnerArtist: string; vibe: string; crossoverNumber?: number }) => void;
  advanceTime: () => void;
  awards: Award[];
  eurovisionModalOpen: boolean;
  setEurovisionModalOpen: (open: boolean) => void;
  participateInEurovision: (song: Song) => EurovisionResult;
  saveGame: () => Promise<void>;
  isSaving: boolean;
  activeTab: 'home' | 'studio' | 'charts' | 'metrics' | 'messages' | 'news' | 'awards';
  setActiveTab: (tab: 'home' | 'studio' | 'charts' | 'metrics' | 'messages' | 'news' | 'awards') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [singer, setSinger] = useState<Singer | null>(null);
  const [discography, setDiscography] = useState<Song[]>([]);
  const [scheduledSongs, setScheduledSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [rumors, setRumors] = useState<RumorItem[]>([]);
  const [globalCharts, setGlobalCharts] = useState<SpotifyChartEntry[]>(INITIAL_GLOBAL_CHARTS);
  const [countryCharts, setCountryCharts] = useState<SpotifyChartEntry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('España');
  const [inbox, setInbox] = useState<CollaborationProposal[]>([]);
  const [unlockedProducers, setUnlockedProducers] = useState<{ id: string; name: string; avatar: string; fameTier: string }[]>([
    { id: 'home-studio-bro', name: 'Kike Beats (Colega del barrio)', avatar: '🎧', fameTier: 'Amigo de confianza' },
    { id: 'self-produced', name: 'Home Studio Propio (Auto-producido)', avatar: '🎙️', fameTier: 'Independiente' }
  ]);
  const [activeDecisionEvent, setActiveDecisionEvent] = useState<DecisionEvent | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  
  // Special Milestones Modals
  const [isBzrpOpen, setIsBzrpOpen] = useState(false);
  const [isOvyOpen, setIsOvyOpen] = useState(false);
  const [isBigOneOpen, setIsBigOneOpen] = useState(false);
  const [eurovisionModalOpen, setEurovisionModalOpen] = useState(false);
  const [activeCollabOffer, setActiveCollabOffer] = useState<CollaborationProposal | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'studio' | 'charts' | 'metrics' | 'messages' | 'news' | 'awards'>('home');

  // Load game on start
  useEffect(() => {
    const loadGame = async () => {
      const loaded = await loadCareerFromFirestore(currentUser?.uid);
      if (loaded && loaded.singer) {
        setSinger(loaded.singer);
        const disco = loaded.discography || [];
        setDiscography(disco);
        setAlbums(loaded.albums || []);
        setAwards(loaded.awards || []);
        setNews(loaded.news || []);
        if (disco.length === 0) {
          setInbox([]);
        }
      }
    };
    loadGame();
  }, [currentUser]);

  // Update country charts when country selection changes
  useEffect(() => {
    setCountryCharts(generateCountryCharts(selectedCountry));
  }, [selectedCountry]);

  // Check BZRP eligibility (Must be emergente, leyenda or artista del momento)
  // BZRP no se desbloquea desde un menú: sus requisitos solo determinan si puede llegar una invitación.
  const bzrpEligible = !!(
    singer &&
    !singer.bzrpSessionCompleted &&
    checkBzrpEligibility(singer, discography, globalCharts, countryCharts).eligible
  );

  const createSinger = (data: Partial<Singer>) => {
    const newSinger: Singer = {
      id: 'singer_' + Date.now(),
      artistName: data.artistName || 'Nuevo Artista',
      realName: data.realName || 'Cantante Anónimo',
      age: data.age || 19,
      nationality: data.nationality || 'España',
      genre: data.genre || 'Urbano / Reggaeton',
      stats: {
        voice: 55,
        composition: 50,
        flow: 52,
        charisma: 60,
        energy: 100,
        reputation: 15,
        fans: 0,
        money: 1500
      },
      avatarIcon: data.avatarIcon || '🎤',
      bio: 'Iniciando mi carrera musical desde abajo hacia el Top 50 Mundial.',
      bzrpSessionCompleted: false,
      ovyWSoundCompleted: false,
      eurovisionParticipationCount: 0,
      careerWeek: 1,
      careerYear: 2026
    };

    setSinger(newSinger);
    setSelectedCountry(newSinger.nationality);
    setCountryCharts(generateCountryCharts(newSinger.nationality));

    // Welcome news
    const welcomeNews: NewsArticle = {
      id: 'news_init',
      headline: `¡Nace una nueva promesa! ${newSinger.artistName} entra en la escena musical`,
      source: 'MondoSonoro',
      snippet: `${newSinger.artistName}, joven cantante de ${newSinger.nationality} con raíces en el ${newSinger.genre}, comienza a sonar con fuerza.`,
      timeAgo: 'Hace 1 hora',
      category: 'lanzamiento',
      sentiment: 'positive'
    };
    setNews([welcomeNews]);

    // Initial state: 0 released music means 0 collaborations in inbox!
    setInbox([]);

    // Initial fan speculation
    const initialRumor: RumorItem = {
      id: 'rumor_init',
      title: 'Rumor: Nuevo talento descubierto en redes',
      leakSnippet: `Cuentas de TikTok dedicadas a descubrir artistas urbanos comparten los primeros audios de ${newSinger.artistName}.`,
      source: 'TikTok Discover',
      timeAgo: 'Semana 1',
      hypeBonus: 10,
      artistInvolved: newSinger.artistName,
      verified: false
    };
    setRumors([initialRumor]);
  };

  const saveGame = async () => {
    if (!singer) return;
    setIsSaving(true);
    await saveCareerToFirestore(currentUser?.uid || 'guest_user', {
      singer,
      discography,
      albums,
      awards,
      news
    });
    setTimeout(() => setIsSaving(false), 500);
  };

  // Immediate Single Release
  const releaseSingle = (songDraft: any) => {
    if (!singer) return;

    const cost = songDraft.budget || 500;
    if (singer.stats.money < cost) {
      alert('No tienes suficiente dinero para esta producción y marketing.');
      return;
    }

    const res = calculateSongSuccess(singer, songDraft, globalCharts);

    const updatedSinger: Singer = {
      ...singer,
      stats: {
        ...singer.stats,
        money: singer.stats.money - cost + res.revenue,
        fans: singer.stats.fans + res.fansGained,
        reputation: Math.min(100, singer.stats.reputation + res.reputationGained),
        energy: Math.max(10, singer.stats.energy - 15)
      }
    };
    setSinger(updatedSinger);

    const finalSong: Song = {
      ...res.song,
      melodyConfig: songDraft.melodyConfig
    };
    setDiscography(prev => [finalSong, ...prev]);

    // Update charts
    if (res.chartPositionGlobal > 0 && res.chartPositionGlobal <= 20) {
      setGlobalCharts(prev => {
        const newCharts = [...prev];
        const playerEntry: SpotifyChartEntry = {
          rank: res.chartPositionGlobal,
          previousRank: 0,
          songTitle: finalSong.title,
          artistName: singer.artistName,
          streams: res.initialStreams,
          isPlayerSong: true,
          peakRank: res.chartPositionGlobal,
          weeksOnChart: 1,
          country: 'Global'
        };
        newCharts.splice(res.chartPositionGlobal - 1, 0, playerEntry);
        return newCharts
          .sort((a, b) => b.streams - a.streams)
          .slice(0, 20)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }

    // News
    const newArticle: NewsArticle = {
      id: 'news_' + Date.now(),
      headline: res.isViral
        ? `🔥 ¡BOMBAZO VIRAL! "${finalSong.title}" de ${singer.artistName} revienta las redes`
        : `Nuevo lanzamiento: ${singer.artistName} presenta su single "${finalSong.title}"`,
      source: res.isViral ? 'Billboard Global' : 'Rolling Stone',
      snippet: `Con ${res.initialStreams.toLocaleString()} reproducciones en su primer impacto, el tema con producción en ${songDraft.melodyConfig?.musicalKey || 'estudio'} empieza a escalar playlists.`,
      timeAgo: `Semana ${singer.careerWeek}`,
      category: 'lanzamiento',
      sentiment: res.isViral ? 'viral' : 'positive'
    };
    setNews(prev => [newArticle, ...prev]);

    return res;
  };

  // Schedule a Song Release for a future week
  const scheduleSongRelease = (songDraft: any) => {
    if (!singer) return;

    const scheduledSong: Song = {
      id: 'scheduled_' + Date.now(),
      title: songDraft.title,
      genre: songDraft.genre,
      theme: songDraft.theme,
      quality: 75 + Math.floor(Math.random() * 20),
      producer: songDraft.producerName,
      featuredArtists: songDraft.featuredArtists || [],
      streamsTotal: 0,
      streamsWeekly: 0,
      releaseWeek: songDraft.scheduledWeek,
      releaseYear: singer.careerYear,
      isSingle: true,
      coverColor: 'from-purple-600 to-indigo-700',
      melodyConfig: songDraft.melodyConfig,
      isScheduled: true,
      scheduledWeek: songDraft.scheduledWeek,
      scheduledTime: songDraft.scheduledTime || 'Viernes 00:00 (Medianoche)',
      preReleaseHype: 25
    };

    setScheduledSongs(prev => [...prev, scheduledSong]);

    // Fan anticipation news & rumor
    const newsItem: NewsArticle = {
      id: 'news_sched_' + Date.now(),
      headline: `📅 ANUNCIO OFICIAL: ${singer.artistName} estrenará "${scheduledSong.title}" en la Semana ${songDraft.scheduledWeek}`,
      source: 'MondoSonoro',
      snippet: `El tema saldrá a las ${scheduledSong.scheduledTime}. Los fans ya han iniciado la campaña de pre-guardado en Spotify.`,
      timeAgo: `Semana ${singer.careerWeek}`,
      category: 'lanzamiento',
      sentiment: 'positive'
    };
    setNews(prev => [newsItem, ...prev]);

    const rumor: RumorItem = {
      id: 'rumor_sched_' + Date.now(),
      title: `Especulación sobre "${scheduledSong.title}"`,
      leakSnippet: `Se filtra que el tema cuenta con un tempo de ${songDraft.melodyConfig?.bpm || 98} BPM y sonido ${songDraft.melodyConfig?.musicalKey || 'moderno'}. La expectación es máxima en TikTok.`,
      source: 'TikTok Leak Club',
      timeAgo: `Semana ${singer.careerWeek}`,
      hypeBonus: 20,
      artistInvolved: singer.artistName,
      verified: true
    };
    setRumors(prev => [rumor, ...prev]);
  };

  const createAlbum = (title: string, genre: Singer['genre'], projectType: 'album' | 'ep' = 'album') => {
    const newAlbum: Album = {
      id: 'album_' + Date.now(),
      title,
      projectType,
      genre,
      tracklist: [],
      status: 'recording',
      marketingBudget: 0,
      coverGradient: projectType === 'ep' ? 'from-cyan-600 via-blue-600 to-indigo-800' : 'from-purple-700 via-pink-600 to-amber-500'
    };
    setAlbums(prev => [newAlbum, ...prev]);

    // Fan theory on new album
    const albumRumor: RumorItem = {
      id: 'rumor_album_' + Date.now(),
      title: `Los fans descubren el registro del álbum "${title}"`,
      leakSnippet: `Fans en foros descubren el registro en la SGAE/ASCAP del título "${title}". Especulan sobre qué colaboraciones secretas tendrá dentro.`,
      source: 'Reddit /r/urbanmusic',
      timeAgo: 'Hace unos momentos',
      hypeBonus: 30,
      artistInvolved: singer?.artistName || '',
      verified: false
    };
    setRumors(prev => [albumRumor, ...prev]);
  };

  const addTrackToAlbum = (albumId: string, trackDraft: any) => {
    if (!singer) return;
    const res = calculateSongSuccess(singer, { ...trackDraft, isSingle: false, budget: 0 }, globalCharts);
    const albumTrack: Song = { 
      ...res.song, 
      albumId,
      melodyConfig: trackDraft.melodyConfig
    };

    setAlbums(prev => prev.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          tracklist: [...album.tracklist, albumTrack]
        };
      }
      return album;
    }));

    setSinger(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.max(5, prev.stats.energy - 8),
        composition: Math.min(100, prev.stats.composition + 1)
      }
    } : null);
  };

  const releaseAlbum = (albumId: string, strategy: any, budget: number) => {
    if (!singer) return;
    const targetAlbum = albums.find(a => a.id === albumId);
    if (!targetAlbum || targetAlbum.tracklist.length === 0) return;

    const evaluation = evaluateAlbumSuccess(targetAlbum, singer);

    setAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        return {
          ...a,
          status: 'released',
          releaseYear: singer.careerYear,
          criticScore: evaluation.criticScore,
          marketingBudget: budget,
          marketingStrategy: strategy
        };
      }
      return a;
    }));

    setDiscography(prev => [...targetAlbum.tracklist, ...prev]);

    setSinger(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        money: prev.stats.money - budget + evaluation.revenue,
        fans: prev.stats.fans + evaluation.fansGained,
        reputation: Math.min(100, prev.stats.reputation + 10),
        energy: Math.max(10, prev.stats.energy - 25)
      }
    } : null);

    const albumNews: NewsArticle = {
      id: 'news_album_' + Date.now(),
      headline: `💿 ESTRENO MUNDIAL: ${singer.artistName} lanza su nuevo álbum "${targetAlbum.title}"`,
      source: 'Pitchfork',
      snippet: `La crítica puntúa el trabajo con un ${evaluation.criticScore}/100. Acumula ${evaluation.firstWeekStreams.toLocaleString()} streams en su debut mundial.`,
      timeAgo: `Semana ${singer.careerWeek}`,
      category: 'lanzamiento',
      sentiment: evaluation.criticScore > 75 ? 'positive' : 'neutral'
    };
    setNews(prev => [albumNews, ...prev]);
  };

  // Legendary BZRP Session Trigger
  const triggerBzrpSession = (trackDetails: { title: string; style: string; punchlineFocus: string }) => {
    if (!singer || singer.bzrpSessionCompleted) return;

    const bzrpSessionNumber = Math.floor(Math.random() * 20) + 62;
    const sessionTitle = `${singer.artistName} || BZRP Music Sessions #${bzrpSessionNumber}`;
    const streamsTotal = 16000000 + Math.floor(Math.random() * 9000000);
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.5);
    const fansGained = Math.floor(streamsTotal * 0.14);

    const bzrpSong: Song = {
      id: 'bzrp_session_' + Date.now(),
      title: sessionTitle,
      genre: 'Trap / Hip-Hop',
      theme: 'Protesta / Venganza',
      quality: 99,
      producer: 'Bizarrap',
      featuredArtists: ['Bizarrap'],
      streamsTotal,
      streamsWeekly: streamsTotal,
      releaseWeek: singer.careerWeek,
      releaseYear: singer.careerYear,
      isSingle: true,
      peakChartPosition: 1,
      currentChartPosition: 1,
      coverColor: 'from-cyan-400 via-blue-600 to-indigo-900',
      certification: 'Diamante'
    };

    setDiscography(prev => [bzrpSong, ...prev]);

    // Push directly to #1 on Spotify Global!
    setGlobalCharts(prev => [
      {
        rank: 1,
        previousRank: 0,
        songTitle: sessionTitle,
        artistName: `${singer.artistName}, Bizarrap`,
        streams: streamsTotal,
        isPlayerSong: true,
        peakRank: 1,
        weeksOnChart: 1,
        country: 'Global'
      },
      ...prev.slice(0, 19).map((item, idx) => ({ ...item, rank: idx + 2 }))
    ]);

    setSinger(prev => prev ? {
      ...prev,
      bzrpSessionCompleted: true,
      stats: {
        ...prev.stats,
        fans: prev.stats.fans + fansGained,
        money: prev.stats.money + revenue,
        reputation: 99,
        flow: Math.min(100, prev.stats.flow + 15),
        charisma: Math.min(100, prev.stats.charisma + 15)
      }
    } : null);

    const bzrpNews: NewsArticle = {
      id: 'news_bzrp_' + Date.now(),
      headline: `🌐 HISTORIA MUNDIAL: La BZRP Session de ${singer.artistName} (#${bzrpSessionNumber}) es #1 GLOBAL`,
      source: 'Billboard Hot 100',
      snippet: `El mundo entero colapsa con el junte en Buenos Aires con Bizarrap. La barra sobre "${trackDetails.punchlineFocus}" se convierte en el mayor viral del año.`,
      timeAgo: '¡AHORA MISMO!',
      category: 'lanzamiento',
      sentiment: 'viral'
    };
    setNews(prev => [bzrpNews, ...prev]);
    setIsBzrpOpen(false);
  };

  // Legendary Ovy On The Drums W Sound Trigger
  const triggerOvyWSound = (trackDetails: { vibe: string; mood: string }) => {
    if (!singer || singer.ovyWSoundCompleted) return;

    const sessionTitle = `${singer.artistName} - W Sound #01 (Prod. Ovy On The Drums)`;
    const streamsTotal = 12000000 + Math.floor(Math.random() * 6000000);
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.5);
    const fansGained = Math.floor(streamsTotal * 0.10);

    const ovySong: Song = {
      id: 'ovy_w_sound_' + Date.now(),
      title: sessionTitle,
      genre: 'Urbano / Reggaeton',
      theme: 'Fiesta / Flex',
      quality: 97,
      producer: 'Ovy On The Drums',
      featuredArtists: ['Ovy On The Drums'],
      streamsTotal,
      streamsWeekly: streamsTotal,
      releaseWeek: singer.careerWeek,
      releaseYear: singer.careerYear,
      isSingle: true,
      peakChartPosition: 2,
      currentChartPosition: 2,
      coverColor: 'from-amber-400 via-yellow-500 to-orange-500',
      certification: 'Platino'
    };

    setDiscography(prev => [ovySong, ...prev]);

    setSinger(prev => prev ? {
      ...prev,
      ovyWSoundCompleted: true,
      stats: {
        ...prev.stats,
        fans: prev.stats.fans + fansGained,
        money: prev.stats.money + revenue,
        reputation: Math.min(100, prev.stats.reputation + 15),
        charisma: Math.min(100, prev.stats.charisma + 10)
      }
    } : null);

    const ovyNews: NewsArticle = {
      id: 'news_ovy_' + Date.now(),
      headline: `✨ O-O-OVY ON THE DRUMS: ${singer.artistName} estrena la W Sound #01`,
      source: 'Rolling Stone en Español',
      snippet: `Grabado en Medellín con la firma inconfundible de Ovy. Con ritmo ${trackDetails.vibe}, el tema debuta en los primeros puestos mundiales.`,
      timeAgo: '¡AHORA MISMO!',
      category: 'lanzamiento',
      sentiment: 'viral'
    };
    setNews(prev => [ovyNews, ...prev]);
    setIsOvyOpen(false);
  };

  const triggerBigOneCrossover = (trackDetails: { 
    title: string; 
    partnerArtist: string; 
    vibe: string; 
    crossoverNumber?: number 
  }) => {
    if (!singer) return;

    const num = trackDetails.crossoverNumber || 8;
    const formattedNum = num < 10 ? `0${num}` : `${num}`;
    const crossoverTitle = `Big One - ${trackDetails.title} (Crossover #${formattedNum}) [con ${singer.artistName} & ${trackDetails.partnerArtist}]`;
    const streamsTotal = 14000000 + Math.floor(Math.random() * 6000000);
    const revenue = Math.floor(streamsTotal * 0.0035 * 0.45);
    const fansGained = Math.floor(streamsTotal * 0.09);

    const crossoverSong: Song = {
      id: 'bigone_crossover_' + Date.now(),
      title: crossoverTitle,
      genre: 'Urbano / Reggaeton',
      theme: 'Fiesta / Flex',
      quality: 98,
      producer: 'Big One',
      featuredArtists: ['Big One', trackDetails.partnerArtist],
      streamsTotal,
      streamsWeekly: streamsTotal,
      releaseWeek: singer.careerWeek,
      releaseYear: singer.careerYear,
      isSingle: true,
      peakChartPosition: 1,
      currentChartPosition: 1,
      coverColor: 'from-indigo-600 via-blue-600 to-teal-500',
      certification: 'Platino'
    };

    setDiscography(prev => [crossoverSong, ...prev]);

    setUnlockedProducers(prev => {
      if (!prev.some(p => p.name === 'Big One')) {
        return [...prev, {
          id: 'big-one',
          name: 'Big One',
          avatar: '🎛️',
          fameTier: 'Superestrella'
        }];
      }
      return prev;
    });

    setSinger(prev => prev ? {
      ...prev,
      bigOneCrossoverCompleted: true,
      stats: {
        ...prev.stats,
        fans: prev.stats.fans + fansGained,
        money: prev.stats.money + revenue,
        reputation: Math.min(100, prev.stats.reputation + 16),
        charisma: Math.min(100, prev.stats.charisma + 12)
      }
    } : null);

    const crossoverNews: NewsArticle = {
      id: 'news_crossover_' + Date.now(),
      headline: `🔥 ¡NÚMERO 1 MUNDIAL! Big One estrena el Crossover #${formattedNum} con ${singer.artistName} y ${trackDetails.partnerArtist}`,
      source: 'Billboard Latin',
      snippet: `Con la mítica frase "Si este no es el Crossover...", el junte entre ${singer.artistName} y ${trackDetails.partnerArtist} bajo la batuta de Big One revienta todas las plataformas de streaming.`,
      timeAgo: '¡AHORA MISMO!',
      category: 'lanzamiento',
      sentiment: 'viral'
    };
    setNews(prev => [crossoverNews, ...prev]);
    setIsBigOneOpen(false);
  };

  // Responding to Collaborations
  const respondToCollaboration = (
    proposalId: string, 
    accept: boolean, 
    ownership: 'player' | 'collaborator' = 'player', 
    targetAlbumId?: string
  ) => {
    const proposal = inbox.find(p => p.id === proposalId);
    if (!proposal || !singer) return;

    // Special Milestones (BZRP Session, Ovy W Sound, Big One Crossover) are strictly 1 in career!
    const isSpecialMilestone = proposal.specialType === 'bzrp' || proposal.specialType === 'w_sound' || proposal.specialType === 'crossover';

    if (isSpecialMilestone) {
      // Mark as completed/consumed so it NEVER repeats in the career, whether accepted or rejected!
      setSinger(prev => {
        if (!prev) return null;
        return {
          ...prev,
          bzrpSessionCompleted: prev.bzrpSessionCompleted || proposal.specialType === 'bzrp',
          ovyWSoundCompleted: prev.ovyWSoundCompleted || proposal.specialType === 'w_sound',
          bigOneCrossoverCompleted: prev.bigOneCrossoverCompleted || proposal.specialType === 'crossover'
        };
      });

      setInbox(prev => prev.map(p => p.id === proposalId ? { ...p, status: accept ? 'accepted' : 'rejected' } : p));
      
      // The dedicated modal (BzrpSessionModal, OvySoundModal, BigOneCrossoverModal) will handle the recording
      return;
    }

    if (accept) {
      if (ownership === 'collaborator') {
        // TEMA SUYO (Lanzamiento del colaborador, cobras adelanto en efectivo y ganas fans masivos)
        const advance = proposal.advancePayment || 30000;
        const newFans = Math.floor(proposal.fromArtist.followers * 0.075);

        setSinger(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            money: prev.stats.money + advance,
            fans: prev.stats.fans + newFans,
            reputation: Math.min(100, prev.stats.reputation + 10)
          }
        } : null);

        const newsCollab: NewsArticle = {
          id: 'news_collab_' + Date.now(),
          headline: `🌟 ${proposal.fromArtist.name} estrena nuevo tema contando con ${singer.artistName} como estrella invitada`,
          source: 'Billboard Latin',
          snippet: `El artista internacional recluta a ${singer.artistName} para un junte estelar que ya es tendencia #1 en TikTok y YouTube.`,
          timeAgo: `Semana ${singer.careerWeek}`,
          category: 'colaboracion',
          sentiment: 'viral'
        };
        setNews(prev => [newsCollab, ...prev]);
        alert(`🤝 ¡Tema grabado para ${proposal.fromArtist.name}! Has cobrado un adelanto de ${advance.toLocaleString()} € y sumado +${newFans.toLocaleString()} nuevos fans.`);

      } else {
        // TEMA MÍO (Lanzamiento propio, se suma a tu catálogo o a tu álbum/EP)
        const allArtists = proposal.multipleArtists && proposal.multipleArtists.length > 0 
          ? [proposal.fromArtist.name, ...proposal.multipleArtists]
          : [proposal.fromArtist.name];

        const collabSong: Song = {
          id: 'collab_' + Date.now(),
          title: `${proposal.songTitleProposed} (feat. ${allArtists.join(' & ')})`,
          genre: proposal.genre,
          theme: 'Fiesta / Flex',
          quality: Math.min(98, singer.stats.voice + 18),
          producer: proposal.role === 'producer' ? proposal.fromArtist.name : 'Estudio Profesional',
          featuredArtists: allArtists,
          streamsTotal: Math.floor(proposal.fromArtist.followers * 0.14) + 800000,
          streamsWeekly: Math.floor(proposal.fromArtist.followers * 0.07),
          releaseWeek: singer.careerWeek,
          releaseYear: singer.careerYear,
          isSingle: !targetAlbumId,
          albumId: targetAlbumId,
          coverColor: 'from-amber-500 via-rose-500 to-purple-700',
          certification: 'Oro'
        };

        if (proposal.role === 'producer' || proposal.fromArtist.isProducer) {
          setUnlockedProducers(prev => {
            if (!prev.some(p => p.name === proposal.fromArtist.name)) {
              return [...prev, {
                id: proposal.fromArtist.id,
                name: proposal.fromArtist.name,
                avatar: proposal.fromArtist.avatar,
                fameTier: proposal.fromArtist.fameTier
              }];
            }
            return prev;
          });
        }

        if (targetAlbumId) {
          setAlbums(prev => prev.map(a => {
            if (a.id === targetAlbumId) {
              return {
                ...a,
                tracklist: [...a.tracklist, collabSong]
              };
            }
            return a;
          }));
          alert(`✓ ¡Pista añadida a tu álbum "${albums.find(a => a.id === targetAlbumId)?.title}"!`);
        } else {
          setDiscography(prev => [collabSong, ...prev]);
          alert(`✓ ¡"${collabSong.title}" publicado en tu discografía oficial!`);
        }

        setSinger(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            fans: prev.stats.fans + Math.floor(proposal.fromArtist.followers * 0.04),
            reputation: Math.min(100, prev.stats.reputation + 9)
          }
        } : null);

        const newsCollab: NewsArticle = {
          id: 'news_collab_' + Date.now(),
          headline: `🤝 ¡JUNTE HISTÓRICO! ${singer.artistName} estrena "${collabSong.title}"`,
          source: 'Spotify Daily',
          snippet: targetAlbumId 
            ? `Se confirma como pieza clave en el nuevo proyecto discográfico de ${singer.artistName}.`
            : `El tema acumula miles de reproducciones por minuto y escala en los charts globales.`,
          timeAgo: `Semana ${singer.careerWeek}`,
          category: 'colaboracion',
          sentiment: 'positive'
        };
        setNews(prev => [newsCollab, ...prev]);
      }
    }

    setInbox(prev => prev.map(p => p.id === proposalId ? { ...p, status: accept ? 'accepted' : 'rejected' } : p));
  };

  // Player-initiated proposals create pending DMs. The song is only created after acceptance.
  const proposeCollaboration = (
    artistId: string | string[],
    format: 'single' | 'album' | 'remix',
    albumId?: string,
    originalSongId?: string
  ): { success: boolean; message: string } => {
    if (!singer) return { success: false, message: 'No hay cantante activo.' };
    const artistIds = Array.isArray(artistId) ? artistId : [artistId];
    const targets = artistIds.map(id => FAMOUS_ARTISTS.find(a => a.id === id)).filter(Boolean) as NPCArtist[];
    if (!targets.length) return { success: false, message: 'No se encontraron artistas seleccionados.' };
    if (singer.stats.energy < 15 || singer.stats.money < 6000) {
      return { success: false, message: 'Necesitas 15 de energía y 6.000 € para enviar una propuesta.' };
    }
    const originalSong = originalSongId ? discography.find(song => song.id === originalSongId) : undefined;
    if (format === 'remix' && !originalSong) return { success: false, message: 'Selecciona la canción del remix.' };

    const eligibleTargets = targets.filter(target => evaluateCollabPermission(singer, discography, target, inbox).canPropose);
    if (!eligibleTargets.length) return { success: false, message: 'No puedes proponer a los artistas seleccionados por tu estatus actual.' };
    const now = Date.now();
    const proposals: CollaborationProposal[] = eligibleTargets.map((target, index) => ({
      id: `proposal_out_${now}_${index}`,
      fromArtist: { ...target, name: singer.artistName, id: singer.id },
      songTitleProposed: originalSong ? `${originalSong.title} (Remix)` : `${singer.artistName} - Nueva colaboración`,
      genre: target.genre,
      role: 'feat',
      splitOffer: 50,
      budgetOffered: 6000,
      advancePayment: 0,
      message: `${singer.artistName} te propone grabar un ${format === 'remix' ? 'remix' : 'tema conjunto'}. Si aceptas, se abrirá el creador de canciones.`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isRemixOffer: format === 'remix',
      targetAlbumId: albumId,
      artistOrigin: target.origin
    }));
    setInbox(prev => [...proposals, ...prev]);
    setSinger(prev => prev ? { ...prev, stats: { ...prev.stats, energy: prev.stats.energy - 15, money: prev.stats.money - 6000 } } : null);
    return { success: true, message: `Propuesta enviada a ${eligibleTargets.length} artista${eligibleTargets.length === 1 ? '' : 's'}. La canción se creará cuando acepten.` };
  };

  // Official Song Remix Creator
  const createSongRemix = (originalSong: Song, guestArtistName: string) => {
    if (!singer) return;
    const remixTitle = `${originalSong.title} (Remix Oficial) [feat. ${guestArtistName}]`;
    const bonusStreams = Math.floor(originalSong.streamsTotal * 1.6);
    const revenue = Math.floor(bonusStreams * 0.0035 * 0.7);
    const fansGained = Math.floor(bonusStreams * 0.06);

    const remixSong: Song = {
      ...originalSong,
      id: 'remix_' + Date.now(),
      title: remixTitle,
      isRemix: true,
      originalSongTitle: originalSong.title,
      featuredArtists: [...(originalSong.featuredArtists || []), guestArtistName],
      streamsTotal: bonusStreams,
      streamsWeekly: Math.floor(bonusStreams * 0.4),
      releaseWeek: singer.careerWeek,
      releaseYear: singer.careerYear,
      isSingle: true,
      currentChartPosition: Math.floor(Math.random() * 8) + 1,
      certification: 'Platino'
    };

    setDiscography(prev => [remixSong, ...prev]);
    setSinger(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        money: prev.stats.money + revenue,
        fans: prev.stats.fans + fansGained,
        reputation: Math.min(100, prev.stats.reputation + 8)
      }
    } : null);

    const remixNews: NewsArticle = {
      id: 'news_remix_' + Date.now(),
      headline: `🔥 ¡REMIX OFICIAL BOMBA! ${singer.artistName} y ${guestArtistName} reviven "${originalSong.title}"`,
      source: 'Billboard Latin',
      snippet: `El remix oficial le da una segunda vida explosiva a la canción, disparándose directamente a los primeros puestos mundiales.`,
      timeAgo: `Semana ${singer.careerWeek}`,
      category: 'lanzamiento',
      sentiment: 'viral'
    };
    setNews(prev => [remixNews, ...prev]);
    alert(`🚀 ¡Remix Oficial de "${originalSong.title}" estrenado! +${bonusStreams.toLocaleString()} streams generados.`);
  };

  // Eurovision (Emergent Trigger)
  const participateInEurovision = (song: Song): EurovisionResult => {
    if (!singer) throw new Error('No singer');

    const points = Math.floor(Math.random() * 320) + 140;
    const finalRank = points > 390 ? 1 : points > 290 ? 3 : points > 210 ? 6 : 12;

    const res: EurovisionResult = {
      year: singer.careerYear,
      songTitle: song.title,
      finalRank,
      points,
      winnerCountry: finalRank === 1 ? singer.nationality : 'Suecia'
    };

    if (finalRank <= 3) {
      setAwards(prev => [
        {
          id: 'eurovision_' + singer.careerYear,
          name: 'Eurovision Song Contest',
          category: `Podio Eurovisión (#${finalRank})`,
          year: singer.careerYear,
          songOrAlbumTitle: song.title,
          won: true,
          trophyIcon: '🎙️'
        },
        ...prev
      ]);
    }

    setSinger(prev => prev ? {
      ...prev,
      eurovisionParticipationCount: prev.eurovisionParticipationCount + 1,
      stats: {
        ...prev.stats,
        fans: prev.stats.fans + (finalRank === 1 ? 600000 : 250000),
        reputation: Math.min(100, prev.stats.reputation + (finalRank === 1 ? 25 : 12)),
        energy: Math.max(10, prev.stats.energy - 30)
      }
    } : null);

    const euroNews: NewsArticle = {
      id: 'news_eurovision_' + Date.now(),
      headline: finalRank === 1 
        ? `🏆 ¡CAMPEÓN DE EUROVISIÓN! ${singer.artistName} GANA PARA ${singer.nationality.toUpperCase()}`
        : `Eurovisión: ${singer.artistName} logra el puesto #${finalRank} en la Gran Final`,
      source: 'Eurovision.tv',
      snippet: `Con ${points} puntos del jurado y televoto, "${song.title}" conquistó a Europa.`,
      timeAgo: `Semana ${singer.careerWeek}`,
      category: 'premios',
      sentiment: finalRank <= 3 ? 'positive' : 'neutral'
    };
    setNews(prev => [euroNews, ...prev]);

    return res;
  };

  // Advance Time (Week / Calendar progression)
  const advanceTime = () => {
    if (!singer) return;

    const nextWeek = singer.careerWeek + 1;
    const isNewYear = nextWeek % 52 === 0;
    const currentYear = isNewYear ? singer.careerYear + 1 : singer.careerYear;

    // Check if any scheduled songs should be released this week
    const readyToRelease = scheduledSongs.filter(s => (s.scheduledWeek || 0) <= nextWeek);
    const stillScheduled = scheduledSongs.filter(s => (s.scheduledWeek || 0) > nextWeek);

    if (readyToRelease.length > 0) {
      readyToRelease.forEach(s => {
        // Calculate streams with hype bonus
        const streams = Math.floor((singer.stats.fans * 0.4 + 200000) * (1 + (s.preReleaseHype || 20) / 100));
        const releasedSong: Song = {
          ...s,
          isScheduled: false,
          streamsTotal: streams,
          streamsWeekly: streams,
          currentChartPosition: Math.floor(Math.random() * 15) + 1
        };
        setDiscography(prev => [releasedSong, ...prev]);

        const dropNews: NewsArticle = {
          id: 'news_drop_' + Date.now(),
          headline: `🔥 ¡YA DISPONIBLE! "${releasedSong.title}" de ${singer.artistName} sale a la luz`,
          source: 'Spotify Release Radar',
          snippet: `El estreno programado cumple con las expectativas y acumula ${streams.toLocaleString()} reproducciones en sus primeras horas.`,
          timeAgo: `Semana ${nextWeek}`,
          category: 'lanzamiento',
          sentiment: 'positive'
        };
        setNews(prev => [dropNews, ...prev]);
      });
      setScheduledSongs(stillScheduled);
    }

    // Passive streaming royalties
    const catalogueStreams = discography.reduce((acc, s) => acc + Math.floor(s.streamsTotal * 0.04), 0);
    const weeklyRoyalties = Math.floor(catalogueStreams * 0.0035);
    const restoredEnergy = Math.min(100, singer.stats.energy + 22);

    setSinger(prev => prev ? {
      ...prev,
      careerWeek: nextWeek,
      careerYear: currentYear,
      stats: {
        ...prev.stats,
        money: prev.stats.money + weeklyRoyalties,
        energy: restoredEnergy
      }
    } : null);

    // 🏆 Check Grammys if new year
    if (isNewYear) {
      const newAwards = checkGrammysEligibility(discography, albums, singer.careerYear);
      if (newAwards.length > 0) {
        setAwards(prev => [...newAwards, ...prev]);
        const grammyNews: NewsArticle = {
          id: 'news_grammy_' + Date.now(),
          headline: `🏆 NOCHE DE GRAMMYS: ${singer.artistName} triunfa en la alfombra roja`,
          source: 'Recording Academy',
          snippet: `Se lleva a casa el galardón por "${newAwards[0].songOrAlbumTitle}". Aplausos en pie de la industria.`,
          timeAgo: 'Semana 52',
          category: 'premios',
          sentiment: 'positive'
        };
        setNews(prev => [grammyNews, ...prev]);
      }
    }

    // ⚡ PROPOSAL 1: BZRP Music Session (strictly ONE in career - Emergent Popup)
    // Rule: Debes ser emergente, leyenda o el artista del momento
    const bzrpCheck = checkBzrpEligibility(singer, discography, globalCharts, countryCharts);
    const hasHadBzrp = singer.bzrpSessionCompleted || inbox.some(m => m.specialType === 'bzrp');
    if (bzrpCheck.eligible && !hasHadBzrp) {
      if (Math.random() > 0.35) {
        const bzrpProposal: CollaborationProposal = {
          id: 'dm_bzrp_' + Date.now(),
          fromArtist: FAMOUS_PRODUCERS[0], // Bizarrap
          songTitleProposed: 'BZRP Music Session',
          genre: 'Trap / Hip-Hop',
          role: 'producer',
          splitOffer: 50,
          budgetOffered: 50000,
          advancePayment: 60000,
          message: `¿Qué onda hermano? Vengo siguiendo tus palos y la estás rompiendo mal wacho. Te tengo el beat perfecto acá en el estudio de Buenos Aires. ¿Te venís y grabamos la session?`,
          timestamp: `Semana ${nextWeek}`,
          status: 'pending',
          specialType: 'bzrp',
          isImportant: true,
          artistOrigin: 'Argentina'
        };
        setInbox(prev => [bzrpProposal, ...prev]);
        setActiveCollabOffer(bzrpProposal); // Triggers emergent popup!
      }
    }

    // ⚡ PROPOSAL 2: Ovy On The Drums "W Sound" (strictly ONE in career - Emergent Popup)
    // Rule: Debes ser top en tu país o internacionalmente
    const wSoundCheck = checkCrossoverOrWSoundEligibility(singer, discography, globalCharts, countryCharts);
    const hasHadWsound = singer.ovyWSoundCompleted || inbox.some(m => m.specialType === 'w_sound');
    if (wSoundCheck.eligible && !hasHadWsound) {
      if (Math.random() > 0.38) {
        const ovyProposal: CollaborationProposal = {
          id: 'dm_ovy_' + Date.now(),
          fromArtist: FAMOUS_PRODUCERS[2], // Ovy On The Drums
          songTitleProposed: 'W Sound #01',
          genre: 'Urbano / Reggaeton',
          role: 'producer',
          splitOffer: 50,
          budgetOffered: 40000,
          advancePayment: 45000,
          message: `¡Dímelo parce! Tienes un color de voz increíble. Tengo una pista con los W Sounds de Medellín que va a ser un palo mundial. Vamos a romperla en el estudio.`,
          timestamp: `Semana ${nextWeek}`,
          status: 'pending',
          specialType: 'w_sound',
          isImportant: true,
          artistOrigin: 'Colombia'
        };
        setInbox(prev => [ovyProposal, ...prev]);
        setActiveCollabOffer(ovyProposal); // Triggers emergent popup!
      }
    }

    // ⚡ PROPOSAL 3: Big One "Crossover #[número]" (strictly ONE in career - Emergent Popup)
    // Rule: Debes ser top en tu país o internacionalmente
    const crossoverCheck = checkCrossoverOrWSoundEligibility(singer, discography, globalCharts, countryCharts);
    const hasHadCrossover = singer.bigOneCrossoverCompleted || inbox.some(m => m.specialType === 'crossover');
    if (crossoverCheck.eligible && !hasHadCrossover) {
      if (Math.random() > 0.38) {
        const partners = ['Tiago PZK', 'FMK', 'Ke Personajes', 'Luck Ra', 'Callejero Fino'];
        const partner = partners[Math.floor(Math.random() * partners.length)];
        const crossoverNum = 8;
        const bigOneProducer = FAMOUS_PRODUCERS.find(p => p.id === 'big-one') || FAMOUS_PRODUCERS[0];

        const bigOneProposal: CollaborationProposal = {
          id: 'dm_bigone_' + Date.now(),
          fromArtist: bigOneProducer,
          songTitleProposed: `Crossover #0${crossoverNum}`,
          genre: 'Urbano / Reggaeton',
          role: 'producer',
          splitOffer: 50,
          budgetOffered: 50000,
          advancePayment: 55000,
          message: `¡Qué onda ${singer.artistName}! Vengo siguiendo tus canciones y tu timbre de voz encaja perfecto para el próximo Crossover oficial de la saga. Ya tengo a ${partner} adentro del proyecto. Si este no es el Crossover... ¿entonces cuál es? ¿Te sumás a romperlo?`,
          timestamp: `Semana ${nextWeek}`,
          status: 'pending',
          specialType: 'crossover',
          crossoverNumber: crossoverNum,
          crossoverPartner: partner,
          multipleArtists: [partner],
          isImportant: true,
          artistOrigin: 'Argentina'
        };
        setInbox(prev => [bigOneProposal, ...prev]);
        setActiveCollabOffer(bigOneProposal); // Triggers emergent popup!
      }
    }

    // 🎛️ REGULAR PRODUCER COLLABORATIONS (Ovy On The Drums, Big One, BZRP)
    // When they want to collaborate again, they propose producing an album track or a simple feat/single!
    if (discography.length >= 2 && singer.stats.fans >= 150000 && Math.random() > 0.60) {
      const candidateProducers: string[] = [];
      if (hasHadWsound && !inbox.some(m => m.fromArtist.id === 'ovy-on-the-drums' && m.status === 'pending')) {
        candidateProducers.push('ovy');
      }
      if (hasHadCrossover && !inbox.some(m => m.fromArtist.id === 'big-one' && m.status === 'pending')) {
        candidateProducers.push('big-one');
      }
      if (hasHadBzrp && !inbox.some(m => m.fromArtist.id === 'bizarrap' && m.status === 'pending')) {
        candidateProducers.push('bzrp');
      }

      if (candidateProducers.length > 0) {
        const chosen = candidateProducers[Math.floor(Math.random() * candidateProducers.length)];
        const recordingAlbum = albums.find(a => a.status === 'recording');

        if (chosen === 'ovy') {
          const hasThird = Math.random() > 0.45;
          const guest = hasThird ? (Math.random() > 0.5 ? 'Blessd' : 'Feid (Ferxxo)') : undefined;
          const albumMsg = recordingAlbum 
            ? `¡Dímelo parce! Me encantaría producirte un tema exclusivo para tu nuevo álbum "${recordingAlbum.title}". Tengo una pista con guitarras y dembow que quedaría durísima.`
            : `¡Qué hubo parce! Tengo una pista lista en Medellín. ¿Hacemos un sencillo juntos o te produzco una canción para tu próximo proyecto?`;
          const finalMsg = guest 
            ? `¡Qué hubo parce! Estoy en el estudio produciendo un tema con ${guest} y queremos invitarte a tirar el coro y un verso en este junte. ¿Le montamos?`
            : albumMsg;

          const prop: CollaborationProposal = {
            id: 'dm_ovy_reg_' + Date.now(),
            fromArtist: FAMOUS_PRODUCERS.find(p => p.id === 'ovy-on-the-drums') || FAMOUS_PRODUCERS[2],
            songTitleProposed: guest ? 'Medallo en el Mapa' : (recordingAlbum ? 'Fuego Lento' : 'Peligrosa'),
            genre: 'Urbano / Reggaeton',
            role: 'producer',
            splitOffer: 50,
            budgetOffered: 35000,
            advancePayment: 40000,
            message: finalMsg,
            timestamp: `Semana ${nextWeek}`,
            status: 'pending',
            isImportant: hasThird,
            artistOrigin: 'Colombia',
            multipleArtists: guest ? [guest] : undefined
          };
          setInbox(prev => [prop, ...prev]);
          if (hasThird) setActiveCollabOffer(prop);
        } else if (chosen === 'big-one') {
          const albumMsg = recordingAlbum
            ? `¡Qué onda hermano! Ya rompimos antes. Te tengo armada una instrumental de cumbia/trap impecable para meter en tu álbum "${recordingAlbum.title}". ¿La incluimos en el disco o la soltamos de single?`
            : `¡Qué onda hermano! Te armé un beat tremendo en el estudio. ¿Nos mandamos un feat mano a mano o un tema producido por mí?`;

          const prop: CollaborationProposal = {
            id: 'dm_bigone_reg_' + Date.now(),
            fromArtist: FAMOUS_PRODUCERS.find(p => p.id === 'big-one') || FAMOUS_PRODUCERS[0],
            songTitleProposed: recordingAlbum ? 'Bajo la Luna' : 'La Madrugada',
            genre: 'Urbano / Reggaeton',
            role: 'producer',
            splitOffer: 50,
            budgetOffered: 45000,
            advancePayment: 50000,
            message: albumMsg,
            timestamp: `Semana ${nextWeek}`,
            status: 'pending',
            isImportant: false,
            artistOrigin: 'Argentina'
          };
          setInbox(prev => [prop, ...prev]);
        } else if (chosen === 'bzrp') {
          const albumMsg = recordingAlbum
            ? `¿Qué onda hermano? Tras la Session la vibra quedó intacta. Armé una instrumental pesadísima que quedaría perfecta para tu próximo álbum "${recordingAlbum.title}". ¿La sumamos al tracklist?`
            : `¿Qué onda hermano? Armé un beat con unos 808s demoledores en el estudio. ¿Te pinta que hagamos un single juntos?`;

          const prop: CollaborationProposal = {
            id: 'dm_bzrp_reg_' + Date.now(),
            fromArtist: FAMOUS_PRODUCERS[0],
            songTitleProposed: 'Frecuencias Ocultas',
            genre: 'Trap / Hip-Hop',
            role: 'producer',
            splitOffer: 50,
            budgetOffered: 50000,
            advancePayment: 55000,
            message: albumMsg,
            timestamp: `Semana ${nextWeek}`,
            status: 'pending',
            isImportant: false,
            artistOrigin: 'Argentina'
          };
          setInbox(prev => [prop, ...prev]);
        }
      }
    }

    // 🇪🇺 EUROVISION: Emergent Invitation (Only when song is a massive hit and player is famous, MAX 2 times)
    const hasBigHit = discography.some(s => s.streamsTotal > 1500000 || (s.currentChartPosition || 99) <= 5);
    if (hasBigHit && singer.stats.fans > 200000 && singer.eurovisionParticipationCount < 2 && !eurovisionModalOpen) {
      if (Math.random() > 0.8) {
        const eurovisionDecision: DecisionEvent = {
          id: 'eurovision_invite_' + Date.now(),
          title: `¡Invitación Oficial de la Televisión Pública para Eurovisión!`,
          category: 'eurovision',
          description: `Tras el enorme éxito de tus canciones en el país, la delegación nacional te ha seleccionado para representar a ${singer.nationality} en la Gran Final de Eurovisión ante más de 200 millones de espectadores. (Participación ${singer.eurovisionParticipationCount + 1} de 2 permitidas en tu carrera).`,
          choices: [
            {
              text: 'Aceptar la invitación y preparar el show en directo',
              impactDescription: 'Subirás al escenario europeo a competir por el Micrófono de Cristal.',
              consequences: {
                newsHeadline: `¡CONFIRMADO! ${singer.artistName} será el representante oficial en Eurovisión`,
                newsSource: 'Eurovision RTVE/RAI'
              }
            },
            {
              text: 'Declinar: prefiero enfocarme en mi gira de conciertos',
              impactDescription: 'Conservas energía y sigues tu propio calendario de lanzamientos.',
              consequences: {
                energy: 10,
                newsHeadline: `${singer.artistName} rechaza ir a Eurovisión para centrarse en su nuevo disco`,
                newsSource: 'Prensa Nacional'
              }
            }
          ]
        };
        setActiveDecisionEvent(eurovisionDecision);
      }
    }

    // 🎤 REALISTIC ARTIST COLLABORATIONS (Gated by popularity rules)
    const playerTier = getPlayerFameTier(singer, discography);
    const hasTraction = discography.some(s => s.streamsTotal >= 35000) || singer.stats.fans >= 12000;
    const hasHitSong = discography.some(s => s.streamsTotal >= 500000 || (s.currentChartPosition || 99) <= 20);
    const hasBomba = discography.some(s => s.streamsTotal >= 1200000 || (s.currentChartPosition || 99) <= 10);

    if (hasTraction && Math.random() > 0.50) {
      let candidateArtists: typeof FAMOUS_ARTISTS = [];
      let isBigArtistReachingOutToSmall = false;

      if (playerTier === 'Promesa' || playerTier === 'Emergente') {
        // Artistas de su misma popularidad aproximada (Promesas / Emergentes)
        const peerArtists = FAMOUS_ARTISTS.filter(a => a.fameTier === 'Promesa' || a.fameTier === 'Emergente');

        // Si además sacó una BOMBA: artistas más grandes quieren sacar un feat a su nombre o un remix
        if ((hasHitSong || hasBomba) && Math.random() > 0.45) {
          const bigArtists = FAMOUS_ARTISTS.filter(a => 
            a.fameTier === 'Famoso' || (hasBomba && (a.fameTier === 'Superestrella' || a.fameTier === 'Leyenda'))
          );
          if (bigArtists.length > 0) {
            candidateArtists = bigArtists;
            isBigArtistReachingOutToSmall = true;
          } else {
            candidateArtists = peerArtists;
          }
        } else {
          candidateArtists = peerArtists;
        }
      } else {
        // Player is Famoso / Superestrella / Leyenda
        if (Math.random() > 0.35) {
          candidateArtists = FAMOUS_ARTISTS.filter(a => a.fameTier === 'Famoso' || a.fameTier === 'Superestrella' || a.fameTier === 'Leyenda');
        } else {
          // Artistas más pequeños que buscan una oportunidad / mentor
          candidateArtists = FAMOUS_ARTISTS.filter(a => a.fameTier === 'Promesa' || a.fameTier === 'Emergente');
        }
      }

      if (candidateArtists.length > 0) {
        const primaryArtist = candidateArtists[Math.floor(Math.random() * candidateArtists.length)];
        
        // Check for REMIX offer:
        const eligibleHits = discography.filter(s => s.streamsTotal >= 100000 && !s.isRemix);
        const isRemixOffer = (isBigArtistReachingOutToSmall || Math.random() > 0.55) && eligibleHits.length > 0;
        const targetSong = isRemixOffer 
          ? eligibleHits[Math.floor(Math.random() * eligibleHits.length)]
          : null;

        const songTitle = isRemixOffer && targetSong
          ? targetSong.title
          : ['Noche en Candela', 'Perreo Espacial', 'Eclipse Lunar', 'Diamantes en el Club', 'De Vuelta a Casa', 'Bajo la Luna', 'Flow Exclusivo'][Math.floor(Math.random() * 7)];

        let multipleArtists: string[] | undefined = undefined;
        if (singer.stats.fans >= 250000 && Math.random() > 0.75) {
          const secondArtist = candidateArtists.find(a => a.id !== primaryArtist.id);
          if (secondArtist) multipleArtists = [secondArtist.name];
        }

        const advancePayment = Math.floor(primaryArtist.followers * 0.0015) + (isRemixOffer ? 30000 : 15000);
        const authenticMessage = isBigArtistReachingOutToSmall && !isRemixOffer
          ? `¡Qué onda ${singer.artistName}! Escuché tu bomba en la radio y tienes un flow brutal. Estoy armando mi nuevo disco y quiero que te montes como feat en un tema mío. Cobras un buen adelanto y rompemos juntos. ¿Le damos?`
          : getArtistDialogue(primaryArtist, singer.artistName, songTitle, isRemixOffer);

        const isImportant = primaryArtist.fameTier === 'Superestrella' || primaryArtist.fameTier === 'Leyenda' || isRemixOffer || isBigArtistReachingOutToSmall;

        const proposal: CollaborationProposal = {
          id: 'prop_' + Date.now(),
          fromArtist: primaryArtist,
          songTitleProposed: songTitle,
          genre: primaryArtist.genre,
          role: 'feat',
          splitOffer: 50,
          budgetOffered: 20000,
          advancePayment,
          message: authenticMessage,
          timestamp: `Semana ${nextWeek}`,
          status: 'pending',
          isImportant,
          artistOrigin: primaryArtist.origin,
          isRemixOffer,
          multipleArtists
        };

        setInbox(prev => [proposal, ...prev]);

        // Record in contactedArtistIds so player has this artist unlocked in directory
        setSinger(prev => {
          if (!prev) return null;
          const current = prev.contactedArtistIds || [];
          if (!current.includes(primaryArtist.id)) {
            return { ...prev, contactedArtistIds: [...current, primaryArtist.id] };
          }
          return prev;
        });

        if (isImportant) {
          setActiveCollabOffer(proposal);
        }
      }
    }

    // Random Rumors & Fan Theories
    if (Math.random() > 0.60) {
      const rumorTemplates = [
        {
          title: `Avistamiento en estudio de grabación`,
          snippet: `Varios fans afirman haber visto a ${singer.artistName} saliendo a altas horas de la noche con productores reconocidos.`,
          source: 'X / Twitter PopCrave',
          bonus: 15
        },
        {
          title: `Fragmento filtrado de nueva canción en TikTok`,
          snippet: `Un vídeo con un audio de 15 segundos con la voz inconfundible de ${singer.artistName} se vuelve viral con más de 2 millones de visitas.`,
          source: 'TikTok Viral Leaks',
          bonus: 25
        },
        {
          title: `Especulaciones sobre el próximo tracklist`,
          snippet: `Los fans elaboran una lista de posibles pistas y descifran los códigos de las historias de Instagram de ${singer.artistName}.`,
          source: 'Comunidad de Reddit',
          bonus: 10
        }
      ];
      const selected = rumorTemplates[Math.floor(Math.random() * rumorTemplates.length)];
      const newRumor: RumorItem = {
        id: 'rumor_' + Date.now(),
        title: selected.title,
        leakSnippet: selected.snippet,
        source: selected.source,
        timeAgo: `Semana ${nextWeek}`,
        hypeBonus: selected.bonus,
        artistInvolved: singer.artistName,
        verified: Math.random() > 0.5
      };
      setRumors(prev => [newRumor, ...prev.slice(0, 15)]);
    }

    // Random moral/media decision event
    if (Math.random() > 0.70 && !activeDecisionEvent) {
      const randomEvent = RANDOM_DECISION_EVENTS[Math.floor(Math.random() * RANDOM_DECISION_EVENTS.length)];
      setActiveDecisionEvent(randomEvent);
    }
  };

  const resolveDecision = (choiceIndex: number) => {
    if (!activeDecisionEvent || !singer) return;
    const choice = activeDecisionEvent.choices[choiceIndex];

    // If it's the Eurovision acceptance, open the Eurovision modal!
    if (activeDecisionEvent.category === 'eurovision' && choiceIndex === 0) {
      setEurovisionModalOpen(true);
    }

    const c = choice.consequences;

    setSinger(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        money: Math.max(0, prev.stats.money + (c.money || 0)),
        fans: Math.max(100, prev.stats.fans + (c.fans || 0)),
        reputation: Math.min(100, Math.max(0, prev.stats.reputation + (c.reputation || 0))),
        energy: Math.min(100, Math.max(0, prev.stats.energy + (c.energy || 0))),
        voice: Math.min(100, Math.max(0, prev.stats.voice + (c.voice || 0))),
        flow: Math.min(100, Math.max(0, prev.stats.flow + (c.flow || 0))),
        composition: Math.min(100, Math.max(0, prev.stats.composition + (c.composition || 0))),
        charisma: Math.min(100, Math.max(0, prev.stats.charisma + (c.charisma || 0)))
      }
    } : null);

    if (c.newsHeadline) {
      const newsItem: NewsArticle = {
        id: 'news_' + Date.now(),
        headline: c.newsHeadline,
        source: c.newsSource || 'Prensa Musical',
        snippet: `Tras los últimos acontecimientos, la comunidad artística comenta la postura de ${singer.artistName}.`,
        timeAgo: 'Hace unos momentos',
        category: 'polemica',
        sentiment: (c.reputation || 0) >= 0 ? 'positive' : 'negative'
      };
      setNews(prev => [newsItem, ...prev]);
    }

    setActiveDecisionEvent(null);
  };

  const dismissDecisionEvent = () => {
    setActiveDecisionEvent(null);
  };

  return (
    <GameContext.Provider value={{
      singer,
      createSinger,
      discography,
      scheduledSongs,
      albums,
      news,
      rumors,
      globalCharts,
      countryCharts,
      selectedCountry,
      setSelectedCountry,
      inbox,
      unlockedProducers,
      activeDecisionEvent,
      dismissDecisionEvent,
      resolveDecision,
      activeCollabOffer,
      setActiveCollabOffer,
      respondToCollaboration,
      proposeCollaboration,
      createSongRemix,
      releaseSingle,
      scheduleSongRelease,
      createAlbum,
      addTrackToAlbum,
      releaseAlbum,
      bzrpEligible,
      isBzrpOpen,
      setIsBzrpOpen,
      triggerBzrpSession,
      isOvyOpen,
      setIsOvyOpen,
      triggerOvyWSound,
      isBigOneOpen,
      setIsBigOneOpen,
      triggerBigOneCrossover,
      advanceTime,
      awards,
      eurovisionModalOpen,
      setEurovisionModalOpen,
      participateInEurovision,
      saveGame,
      isSaving,
      activeTab,
      setActiveTab
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
