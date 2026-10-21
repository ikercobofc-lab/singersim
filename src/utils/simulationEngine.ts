/**
 * simulationEngine.ts — v2
 *
 * Realistic music career simulation math.
 * Principles:
 * - Diminishing returns on fan base size
 * - Quality + skill + timing matter more than raw fan count
 * - No instant stardom: big streams require big existing audience
 * - Market competition caps chart positions
 * - Skills grow through use, not through arbitrary events
 */

import {
  Singer,
  Song,
  Album,
  ArtistSkills,
  FameProfile,
  CareerStage,
  SpotifyChartEntry,
  Award,
  NPCSong,
  PlayerFameTier,
  CareerState,
} from '../types';

// ─── CAREER STAGE ──────────────────────────────────────────────────────────

/**
 * Derives career stage from multiple signals.
 * Requires SUSTAINED performance, not just a single spike.
 */
export function deriveCareerStage(
  fame: FameProfile,
  career: CareerState,
  catalogSize: number,
  albumCount: number
): CareerStage {
  const { monthlyListeners, followers, culturalImpact, longevityScore } = fame;
  const years = career.yearsActive;

  // Legend: exceptional, multi-year, cultural impact
  if (
    culturalImpact >= 70 &&
    longevityScore >= 60 &&
    monthlyListeners >= 8_000_000 &&
    years >= 5 &&
    catalogSize >= 20 &&
    albumCount >= 2
  ) return 'legend';

  // Global: world-class
  if (
    monthlyListeners >= 3_000_000 &&
    followers >= 2_000_000 &&
    years >= 3 &&
    catalogSize >= 10
  ) return 'global';

  // International
  if (
    monthlyListeners >= 800_000 &&
    followers >= 500_000 &&
    catalogSize >= 6
  ) return 'international';

  // National
  if (
    monthlyListeners >= 200_000 &&
    followers >= 100_000 &&
    catalogSize >= 4
  ) return 'national';

  // Regional
  if (
    monthlyListeners >= 30_000 &&
    followers >= 15_000 &&
    catalogSize >= 2
  ) return 'regional';

  // Local
  if (monthlyListeners >= 5_000 || followers >= 2_000) return 'local';

  return 'bedroom';
}

/**
 * Human-readable label for career stage.
 */
export function careerStageLabel(stage: CareerStage): string {
  const labels: Record<CareerStage, string> = {
    bedroom: 'Underground / Bedroom',
    local: 'Promesa Local',
    regional: 'Emergente Regional',
    national: 'Artista Nacional',
    international: 'Estrella Internacional',
    global: 'Artista Global',
    legend: 'Leyenda',
  };
  return labels[stage];
}

// ─── PLAYER FAME TIER ─────────────────────────────────────────────────────

export function getPlayerFameTier(
  fame: FameProfile,
  career: CareerState,
  discographySize: number
): PlayerFameTier {
  const stage = deriveCareerStage(fame, career, discographySize, 0);
  if (stage === 'legend') return 'Leyenda';
  if (stage === 'global') return 'Superestrella';
  if (stage === 'international' || stage === 'national') return 'Famoso';
  if (stage === 'regional') return 'Emergente';
  if (stage === 'local') return 'Promesa';
  return 'Underground';
}

// ─── SKILL GROWTH ─────────────────────────────────────────────────────────

/**
 * How much a skill grows from using it.
 * Growth rate slows as skill approaches 100 (diminishing returns).
 * @param currentValue - current skill value 0–100
 * @param activityIntensity - 0–1 (how hard did they work at it)
 */
export function calculateSkillGrowth(
  currentValue: number,
  activityIntensity: number
): number {
  if (currentValue >= 100) return 0;
  const headroom = (100 - currentValue) / 100;
  const baseGrowth = activityIntensity * 2.5 * headroom;
  const noise = (Math.random() - 0.5) * 0.3;
  return Math.max(0, Math.min(1.5, baseGrowth + noise));
}

/**
 * Apply skill growth after a release or studio session.
 * Returns updated skills (partial).
 */
export function applySkillsFromRelease(
  skills: ArtistSkills,
  path: Singer['career']['path'],
  songQuality: number
): Partial<ArtistSkills> {
  const intensity = songQuality / 100;
  const growth: Partial<ArtistSkills> = {};

  if (path === 'artist') {
    growth.voice = calculateSkillGrowth(skills.voice, intensity * 0.7);
    growth.composition = calculateSkillGrowth(skills.composition, intensity * 0.8);
    growth.flow = calculateSkillGrowth(skills.flow, intensity * 0.6);
    growth.promotion = calculateSkillGrowth(skills.promotion, intensity * 0.3);
  } else if (path === 'producer') {
    growth.production = calculateSkillGrowth(skills.production, intensity * 0.9);
    growth.mixing = calculateSkillGrowth(skills.mixing, intensity * 0.7);
    growth.composition = calculateSkillGrowth(skills.composition, intensity * 0.5);
  } else if (path === 'dj') {
    growth.performance = calculateSkillGrowth(skills.performance, intensity * 0.9);
    growth.production = calculateSkillGrowth(skills.production, intensity * 0.4);
    growth.charisma = calculateSkillGrowth(skills.charisma, intensity * 0.6);
  }

  return growth;
}

// ─── SONG QUALITY CALCULATION ─────────────────────────────────────────────

export interface SongQualityInput {
  singerSkills: ArtistSkills;
  careerPath: Singer['career']['path'];
  producerBonus: number;   // 0–40: how good is the producer
  featureBonus: number;    // per collaborator
  budgetSpent: number;
  genreMatch: boolean;     // player's genre vs song genre
}

export function calculateSongQuality(input: SongQualityInput): number {
  const { singerSkills, careerPath, producerBonus, featureBonus, budgetSpent, genreMatch } = input;

  let baseQuality = 0;

  if (careerPath === 'artist') {
    baseQuality =
      singerSkills.voice * 0.30 +
      singerSkills.composition * 0.30 +
      singerSkills.flow * 0.20 +
      singerSkills.charisma * 0.10 +
      singerSkills.performance * 0.10;
  } else if (careerPath === 'producer') {
    baseQuality =
      singerSkills.production * 0.45 +
      singerSkills.mixing * 0.30 +
      singerSkills.composition * 0.25;
  } else if (careerPath === 'dj') {
    baseQuality =
      singerSkills.performance * 0.40 +
      singerSkills.production * 0.30 +
      singerSkills.charisma * 0.30;
  }

  // Producer bonus: capped contribution
  const producerEffect = Math.min(15, producerBonus * 0.4);

  // Feature bonus: diminishing per collaborator
  const featureEffect = Math.min(10, featureBonus * 3);

  // Budget: log scale, max +8
  const budgetEffect = Math.min(8, Math.log10(Math.max(1, budgetSpent)) * 2);

  // Genre alignment
  const genreEffect = genreMatch ? 3 : 0;

  // Random variance ±6
  const noise = (Math.random() - 0.5) * 12;

  return Math.max(10, Math.min(99, Math.round(baseQuality + producerEffect + featureEffect + budgetEffect + genreEffect + noise)));
}

// ─── STREAM CALCULATION ───────────────────────────────────────────────────

export interface StreamsInput {
  quality: number;                  // 0–100
  monthlyListeners: number;         // current
  followers: number;
  careerStage: CareerStage;
  momentum: number;                 // 0–100
  marketingBudget: number;
  isViral: boolean;
  viralMultiplier: number;          // 1.0–4.0
  collabPrestigeBonus: number;      // 0–50: from featured artists
  isRemix: boolean;
  originalSongStreams: number;      // for remix: base off original
  scheduledRelease: boolean;        // pre-release hype
  preReleaseHype: number;           // 0–100
  npcChartStrength: number;         // 0–100: how competitive the current market is
}

/**
 * Calculates initial weekly streams for a new release.
 * Uses tiered, realistic projections with market competition.
 */
export function calculateInitialStreams(input: StreamsInput): number {
  const {
    quality, monthlyListeners, followers, careerStage,
    momentum, marketingBudget, isViral, viralMultiplier,
    collabPrestigeBonus, isRemix, originalSongStreams,
    scheduledRelease, preReleaseHype, npcChartStrength
  } = input;

  // Fan engagement rate: what % of followers actually stream a new release
  // Decreases as audience grows (large audiences have lower per-capita engagement)
  const engagementRate = getEngagementRate(followers, careerStage);
  const fanStreams = Math.floor(followers * engagementRate);

  // Discovery streams: based on quality + momentum + budget
  const discoveryFactor = (quality / 100) * (1 + momentum / 200) * (1 + Math.log10(Math.max(1, marketingBudget)) / 8);
  const discoveryBase = getDiscoveryBase(careerStage);
  const discoveryStreams = Math.floor(discoveryBase * discoveryFactor);

  // Collab boost: limited, realistic
  const collabBoost = Math.floor((collabPrestigeBonus / 50) * discoveryBase * 0.4);

  // Pre-release hype bonus (scheduled releases)
  const hypeMultiplier = scheduledRelease ? 1 + (preReleaseHype / 100) * 0.3 : 1.0;

  // Remix: borrows momentum from original, capped
  let remixFactor = 1.0;
  if (isRemix && originalSongStreams > 0) {
    // A remix typically does 20–60% of original's peak, not 160%
    remixFactor = 0.25 + Math.random() * 0.35;
    const remixBase = Math.floor(originalSongStreams * remixFactor);
    return Math.max(500, Math.floor(remixBase * (1 + momentum / 300) * hypeMultiplier));
  }

  // Base calculation
  let baseStreams = (fanStreams + discoveryStreams + collabBoost) * hypeMultiplier;

  // Market competition: strong competition reduces discoverability
  const competitionPenalty = 1 - (npcChartStrength / 100) * 0.3;
  baseStreams *= competitionPenalty;

  // Viral multiplier: only applies when truly viral
  if (isViral) {
    baseStreams *= viralMultiplier;
  }

  // Hard floors and ceilings per stage
  const [floor, ceiling] = getStreamBounds(careerStage, isViral);
  return Math.max(floor, Math.min(ceiling, Math.floor(baseStreams)));
}

function getEngagementRate(followers: number, stage: CareerStage): number {
  // Smaller artists have higher per-fan engagement
  if (stage === 'bedroom' || stage === 'local') return 0.50 + Math.random() * 0.20;
  if (stage === 'regional') return 0.35 + Math.random() * 0.15;
  if (stage === 'national') return 0.20 + Math.random() * 0.10;
  if (stage === 'international') return 0.12 + Math.random() * 0.06;
  if (stage === 'global') return 0.07 + Math.random() * 0.04;
  return 0.05 + Math.random() * 0.02; // legend: massive base, lower %
}

function getDiscoveryBase(stage: CareerStage): number {
  // Base discovery streams by stage (weekly)
  const bases: Record<CareerStage, number> = {
    bedroom: 200,
    local: 1_500,
    regional: 8_000,
    national: 35_000,
    international: 120_000,
    global: 400_000,
    legend: 1_200_000,
  };
  return bases[stage];
}

function getStreamBounds(stage: CareerStage, isViral: boolean): [number, number] {
  // [floor, ceiling] for initial weekly streams
  const bounds: Record<CareerStage, [number, number]> = {
    bedroom:       [200,        15_000],
    local:         [800,        60_000],
    regional:      [5_000,      250_000],
    national:      [30_000,     800_000],
    international: [150_000,    3_000_000],
    global:        [600_000,    8_000_000],
    legend:        [2_000_000,  18_000_000],
  };
  const [floor, ceil] = bounds[stage];
  // Viral ceiling is 3× normal ceiling, but still realistic
  return [floor, isViral ? Math.min(ceil * 3, 25_000_000) : ceil];
}

/**
 * Weekly stream decay for a released song.
 * Songs naturally fade — some faster, some slower.
 */
export function calculateWeeklyStreamDecay(
  currentStreams: number,
  weeksOnChart: number,
  quality: number,
  chartMomentum: number // -1 to +1
): number {
  // Base decay rate: higher quality songs decay slower
  const baseDecayRate = 0.12 - (quality / 100) * 0.06; // 6–12% per week

  // Momentum adjustment: viral/trending songs decay slower
  const momentumAdjust = chartMomentum * 0.04;

  // Age factor: songs older than 8 weeks decay faster
  const ageFactor = weeksOnChart > 8 ? 1.3 : 1.0;

  const decayRate = Math.max(0.03, Math.min(0.35, baseDecayRate - momentumAdjust) * ageFactor);

  const noise = (Math.random() - 0.5) * 0.04;
  const newStreams = currentStreams * (1 - decayRate + noise);

  return Math.max(0, Math.floor(newStreams));
}

/**
 * Viral event check — rare, not guaranteed.
 */
export function checkViralEvent(
  quality: number,
  charisma: number,
  promotion: number,
  marketingBudget: number,
  momentum: number,
  careerStage: CareerStage
): { isViral: boolean; multiplier: number; reason: string } {
  // Base viral probability: very low early career, slightly higher with investment
  const stageBase: Record<CareerStage, number> = {
    bedroom: 0.012,
    local: 0.025,
    regional: 0.040,
    national: 0.055,
    international: 0.040, // harder to go "viral" at scale
    global: 0.025,
    legend: 0.015,
  };

  const base = stageBase[careerStage];
  const qualityBonus = (quality / 100) * 0.03;
  const charismaBonus = (charisma / 100) * 0.02;
  const promotionBonus = (promotion / 100) * 0.015;
  const budgetBonus = Math.min(0.02, Math.log10(Math.max(1, marketingBudget)) / 200);
  const momentumBonus = (momentum / 100) * 0.01;

  const viralChance = base + qualityBonus + charismaBonus + promotionBonus + budgetBonus + momentumBonus;

  const isViral = Math.random() < viralChance;

  if (!isViral) return { isViral: false, multiplier: 1.0, reason: '' };

  // Viral multiplier: 1.5–4.0 depending on quality
  const multiplier = 1.5 + (quality / 100) * 2.5;

  const reasons = [
    'El estribillo se convirtió en un sonido viral de TikTok',
    'Una influencer con millones de seguidores usó el tema',
    'El vídeo oficial superó el millón de reproducciones en 24h',
    'La canción sonó en un clip deportivo que se hizo global',
    'Un famoso lo usó de fondo en una historia viral',
  ];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];

  return { isViral, multiplier, reason };
}

// ─── CHART POSITION CALCULATION ───────────────────────────────────────────

/**
 * Determines if a song enters the charts and at what position.
 * Competes against NPC songs with their own stream counts.
 */
export function calculateChartPosition(
  songStreams: number,
  npcSongs: NPCSong[],
  country: string
): { position: number | null; displacement: string[] } {
  // Get active NPC songs for this country, sorted by streams
  const activeSongs = npcSongs
    .filter(s => s.isActive)
    .sort((a, b) => b.currentStreams - a.currentStreams);

  // Find where player's song fits
  const entryPosition = activeSongs.findIndex(s => songStreams > s.currentStreams);

  if (entryPosition === -1 && activeSongs.length >= 50) {
    // Song is below top 50
    return { position: null, displacement: [] };
  }

  const position = entryPosition === -1 ? activeSongs.length + 1 : entryPosition + 1;
  const displaced = position <= 50 ? activeSongs.slice(Math.min(position - 1, 49)).map(s => s.title).slice(0, 3) : [];

  return {
    position: position <= 50 ? position : null,
    displacement: displaced,
  };
}

// ─── FAME UPDATES ─────────────────────────────────────────────────────────

export function calculateFameGrowth(
  currentFame: FameProfile,
  songStreams: number,
  quality: number,
  isViral: boolean,
  chartPosition: number | null,
  weeksActive: number
): Partial<FameProfile> {
  const updates: Partial<FameProfile> = {};

  // Monthly listeners: more volatile than followers
  const listenerGain = Math.floor(songStreams * (isViral ? 0.08 : 0.03));
  updates.monthlyListeners = Math.max(0, currentFame.monthlyListeners + listenerGain);

  // Followers: grow slower, based on quality and chart performance
  const followerConvRate = chartPosition !== null ? 0.018 : 0.008;
  const followerGain = Math.floor(songStreams * followerConvRate * (quality / 80));
  updates.followers = currentFame.followers + followerGain;

  // Industry prestige: grows with quality, crits, awards — not just streams
  const prestigeDelta = quality > 80 ? 0.4 : quality > 65 ? 0.2 : quality > 50 ? 0.05 : 0;
  updates.industryPrestige = Math.min(100, currentFame.industryPrestige + prestigeDelta);

  // Critical reputation: high-quality releases grow it; commercial sellouts can hurt
  const critDelta = quality > 85 ? 0.6 : quality > 70 ? 0.3 : quality > 55 ? 0.1 : -0.05;
  updates.criticalReputation = Math.min(100, Math.max(0, currentFame.criticalReputation + critDelta));

  // Commercial appeal: chart positions drive this
  if (chartPosition !== null) {
    const commercialDelta = chartPosition <= 5 ? 1.5 : chartPosition <= 20 ? 0.8 : 0.3;
    updates.commercialAppeal = Math.min(100, currentFame.commercialAppeal + commercialDelta);
  }

  // Cultural impact: very slow accumulation over years
  const impactDelta = (quality / 100) * 0.05 * (weeksActive / 52);
  updates.culturalImpact = Math.min(100, currentFame.culturalImpact + impactDelta);

  // Longevity: increases with sustained quality over time
  const longevityDelta = quality > 70 ? 0.03 : -0.01;
  updates.longevityScore = Math.min(100, Math.max(0, currentFame.longevityScore + longevityDelta));

  return updates;
}

/**
 * Monthly listeners decay — they go down if you don't release.
 */
export function applyListenerDecay(
  monthlyListeners: number,
  weeksSinceLastRelease: number
): number {
  if (weeksSinceLastRelease <= 2) return monthlyListeners;
  // After 2 weeks without release, listeners start to drift
  const decayRate = 0.03 + Math.max(0, (weeksSinceLastRelease - 2)) * 0.005;
  const decayed = monthlyListeners * (1 - Math.min(0.25, decayRate));
  return Math.max(0, Math.floor(decayed));
}

// ─── ALBUM EVALUATION ─────────────────────────────────────────────────────

export function evaluateAlbumSuccess(
  album: Album,
  singer: Singer
): { criticScore: number; firstWeekStreams: number; revenue: number; fansGained: number } {
  const tracks = album.tracklist;
  if (tracks.length === 0) {
    return { criticScore: 45, firstWeekStreams: 0, revenue: 0, fansGained: 0 };
  }

  const avgQuality = tracks.reduce((acc, t) => acc + t.quality, 0) / tracks.length;
  const bestTrackQuality = Math.max(...tracks.map(t => t.quality));
  const trackCount = tracks.length;
  const isEP = album.projectType === 'ep';

  // Critic score: weighted avg quality + cohesion bonus
  const cohesionBonus = Math.min(8, trackCount > 8 ? 5 : trackCount > 5 ? 3 : 1);
  const criticScore = Math.min(99, Math.max(35,
    Math.round(avgQuality * 0.7 + bestTrackQuality * 0.2 + cohesionBonus + (Math.random() * 14 - 7))
  ));

  // Marketing strategy multiplier
  const strategyMultipliers: Record<string, number> = {
    'Tiktok viral': 1.3,
    'Entrevista exclusiva': 1.2,
    'Vallas y publicidad': 1.15,
    'Polémica calculada': 1.35,
  };
  const strategyMult = strategyMultipliers[album.marketingStrategy || ''] || 1.1;

  // First week streams: fan base × engagement × track count bonus
  const stage = deriveCareerStage(singer.fame, singer.career, tracks.length, 1);
  const baseStreams = getDiscoveryBase(stage) * (trackCount * 0.4) + singer.fame.followers * getEngagementRate(singer.fame.followers, stage);
  const firstWeekStreams = Math.floor(baseStreams * strategyMult * (criticScore / 70));

  // Revenue: streaming + album sales equivalent
  const streamRevenue = Math.floor(firstWeekStreams * 0.0035);
  const albumBonus = isEP ? 500 : 2000;
  const revenue = streamRevenue + albumBonus + Math.floor(album.marketingBudget * 0.3);

  // Fans gained
  const fansGained = Math.floor(firstWeekStreams * (criticScore > 75 ? 0.04 : 0.02));

  return { criticScore, firstWeekStreams, revenue, fansGained };
}

// ─── AWARDS ELIGIBILITY ───────────────────────────────────────────────────

export function checkGrammysEligibility(
  discography: Song[],
  albums: Album[],
  currentYear: number,
  fame: FameProfile
): Award[] {
  const awards: Award[] = [];
  const songsThisYear = discography.filter(s => s.releaseYear === currentYear && s.status === 'released');
  const albumsThisYear = albums.filter(a => a.status === 'released' && a.releaseYear === currentYear);

  // Song of the Year: requires substantial critical AND commercial success
  if (songsThisYear.length > 0) {
    const topSong = [...songsThisYear].sort((a, b) => b.streamsTotal - a.streamsTotal)[0];
    const critQualifies = topSong.quality >= 80;
    const streamQualifies = topSong.streamsTotal > 5_000_000;
    const prestigeQualifies = fame.industryPrestige >= 40;

    if (critQualifies && streamQualifies && prestigeQualifies) {
      const nominationChance = 0.4 + (fame.industryPrestige / 100) * 0.3;
      const nominated = Math.random() < nominationChance;
      if (nominated) {
        const winChance = fame.culturalImpact > 50 ? 0.4 : 0.25;
        const won = Math.random() < winChance;
        awards.push({
          id: 'grammy_song_' + currentYear,
          name: 'Latin Grammy',
          category: 'Canción del Año',
          year: currentYear,
          songOrAlbumTitle: topSong.title,
          won,
          nominated: true,
          trophyIcon: '🏆',
        });
      }
    }
  }

  // Album of the Year
  if (albumsThisYear.length > 0) {
    const topAlbum = albumsThisYear.sort((a, b) => (b.criticScore || 0) - (a.criticScore || 0))[0];
    if ((topAlbum.criticScore || 0) >= 78 && fame.industryPrestige >= 50) {
      const won = Math.random() > 0.55;
      awards.push({
        id: 'grammy_album_' + currentYear,
        name: 'Grammy Awards',
        category: 'Álbum del Año',
        year: currentYear,
        songOrAlbumTitle: topAlbum.title,
        won,
        nominated: true,
        trophyIcon: '📀',
      });
    }
  }

  return awards;
}

// ─── COLLAB OUTCOME ───────────────────────────────────────────────────────

export interface CollabOutcomeInput {
  playerFame: FameProfile;
  playerSkills: ArtistSkills;
  npcFollowers: number;
  npcFameTier: string;
  relationshipScore: number;  // -100 to +100
  proposalQuality: number;    // 0–100: how good is the pitch
}

/**
 * Calculates whether an NPC accepts a collaboration proposal.
 * Returns probability of acceptance and reason if rejected.
 */
export function calculateCollabAcceptanceProbability(
  input: CollabOutcomeInput
): { probability: number; rejectReason?: string } {
  const { playerFame, npcFollowers, npcFameTier, relationshipScore, proposalQuality, playerSkills } = input;

  // Tier difference penalty: bigger NPC = harder to reach
  const tierWeights: Record<string, number> = {
    Promesa: 0, Emergente: 1, Independiente: 2, Famoso: 3, Superestrella: 4, Leyenda: 5,
  };
  const playerTierWeight = tierWeights[getPlayerFameTier(playerFame, { stage: 'bedroom', path: 'artist', careerWeek: 1, careerYear: 2026, careerStartYear: 2026, yearsActive: 0, energy: 100, momentum: 50, hasSigned: false, consecutiveHits: 0, consecutiveFlops: 0, milestonesCompleted: [] } as CareerState, 5)] ?? 0;
  const npcTierWeight = tierWeights[npcFameTier] ?? 2;
  const tierGap = Math.max(0, npcTierWeight - playerTierWeight);

  // Tier gap penalty: -20% per tier level gap
  const tierPenalty = tierGap * 0.20;

  // Relationship bonus: known collaborators are easier
  const relBonus = Math.max(-0.20, Math.min(0.30, relationshipScore / 100 * 0.30));

  // Proposal quality
  const qualityBonus = (proposalQuality / 100) * 0.25;

  // Player credibility
  const credBonus = Math.min(0.20, (playerFame.industryPrestige / 100) * 0.20);

  // Audience ratio: NPC doesn't want someone who reaches 1% of their audience
  const audienceRatio = playerFame.monthlyListeners / Math.max(1, npcFollowers);
  const audiencePenalty = audienceRatio < 0.05 ? -0.30 : audienceRatio < 0.15 ? -0.15 : 0;

  // Base probability
  let probability = 0.35 + relBonus + qualityBonus + credBonus - tierPenalty + audiencePenalty;
  probability = Math.max(0.02, Math.min(0.90, probability));

  // Generate rejection reason if probably rejected
  let rejectReason: string | undefined;
  if (probability < 0.35) {
    if (tierGap >= 3) {
      rejectReason = `${npcFameTier === 'Leyenda' ? 'Las leyendas' : 'Los artistas de este nivel'} raramente colaboran con artistas que no estén en su liga. Construye tu catálogo y fama primero.`;
    } else if (audiencePenalty < -0.15) {
      rejectReason = 'Aprecian el talento pero necesitan un colaborador con mayor alcance para justificar el proyecto.';
    } else if (relationshipScore < -20) {
      rejectReason = 'Hay tensiones pasadas que hace difícil llegar a un acuerdo profesional ahora mismo.';
    } else {
      rejectReason = 'No es el momento adecuado en su agenda. Inténtalo de nuevo cuando tengas más tracción.';
    }
  }

  return { probability, rejectReason };
}

// ─── REMIX DUPLICATE DETECTION ────────────────────────────────────────────

/**
 * Generates a canonical remix identity key.
 * Used to detect if an equivalent remix already exists.
 */
export function buildRemixIdentityKey(
  originalSongId: string,
  participantIds: string[],
  versionType: string
): string {
  const sortedIds = [...participantIds].sort().join('|');
  return `${originalSongId}::${sortedIds}::${versionType}`;
}

export function findDuplicateRemix(
  projects: import('../types').PrivateProject[],
  discography: Song[],
  originalSongId: string,
  participantIds: string[],
  versionType: string
): { exists: boolean; duplicateId?: string; duplicateTitle?: string; source: 'project' | 'song' | null } {
  const key = buildRemixIdentityKey(originalSongId, participantIds, versionType);

  // Check private projects
  for (const p of projects) {
    if (p.remixIdentity) {
      const pKey = buildRemixIdentityKey(
        p.remixIdentity.originalSongId,
        p.remixIdentity.participantIds,
        p.remixIdentity.versionType
      );
      if (pKey === key && !p.isArchived) {
        return { exists: true, duplicateId: p.id, duplicateTitle: p.workingTitle, source: 'project' };
      }
    }
  }

  // Check published discography
  for (const s of discography) {
    if (s.remixIdentity) {
      const sKey = buildRemixIdentityKey(
        s.remixIdentity.originalSongId,
        s.remixIdentity.participantIds,
        s.remixIdentity.versionType
      );
      if (sKey === key) {
        return { exists: true, duplicateId: s.id, duplicateTitle: s.title, source: 'song' };
      }
    }
  }

  return { exists: false, source: null };
}

// ─── REVENUE CALCULATION ──────────────────────────────────────────────────

export interface WeeklyRevenueInput {
  discography: Song[];            // all released songs
  albumsReleased: Album[];
  labelSharePercent: number;      // 0 if indie
  managementFeePercent: number;   // 0 if no manager
  showsThisWeek: number;          // concerts, DJ sets
  showFeePerEvent: number;
  productionCommissions: number;  // producer: fees received this week
  licensingDeals: number;         // sync licensing
}

export function calculateWeeklyRevenue(input: WeeklyRevenueInput): {
  gross: number;
  net: number;
  breakdown: {
    streaming: number;
    shows: number;
    production: number;
    licensing: number;
    labelDeduction: number;
    managementDeduction: number;
  };
} {
  // Streaming royalties: sum of all songs' weekly decay streams × rate
  const streamingGross = input.discography.reduce((acc, song) => {
    if (song.status !== 'released') return acc;
    // Each song has its own weekly stream count that decays
    return acc + Math.floor(song.streamsThisWeek * 0.0035);
  }, 0);

  const showsRevenue = input.showsThisWeek * input.showFeePerEvent;
  const productionRevenue = input.productionCommissions;
  const licensingRevenue = input.licensingDeals;

  const gross = streamingGross + showsRevenue + productionRevenue + licensingRevenue;

  // Deductions
  const labelDeduction = Math.floor(gross * (input.labelSharePercent / 100));
  const managementDeduction = Math.floor((gross - labelDeduction) * (input.managementFeePercent / 100));
  const net = gross - labelDeduction - managementDeduction;

  return {
    gross,
    net,
    breakdown: {
      streaming: streamingGross,
      shows: showsRevenue,
      production: productionRevenue,
      licensing: licensingRevenue,
      labelDeduction,
      managementDeduction,
    },
  };
}

// ─── MOMENTUM CALCULATION ─────────────────────────────────────────────────

/**
 * Recalculates career momentum based on recent events.
 * Momentum affects the next release's performance.
 */
export function recalculateMomentum(
  currentMomentum: number,
  recentEvents: {
    type: 'hit' | 'flop' | 'viral' | 'award' | 'collab' | 'inactivity' | 'scandal';
    weight?: number;
  }[]
): number {
  let delta = 0;
  for (const event of recentEvents) {
    const w = event.weight ?? 1;
    switch (event.type) {
      case 'hit':        delta += 8 * w; break;
      case 'flop':       delta -= 12 * w; break;
      case 'viral':      delta += 20 * w; break;
      case 'award':      delta += 10 * w; break;
      case 'collab':     delta += 5 * w; break;
      case 'inactivity': delta -= 4 * w; break;
      case 'scandal':    delta -= 8 * w; break;
    }
  }

  // Momentum decays toward 50 (neutral) each week
  const decayToNeutral = (currentMomentum - 50) * 0.1;
  const newMomentum = currentMomentum + delta - decayToNeutral;
  return Math.max(0, Math.min(100, Math.round(newMomentum)));
}

// ─── CERTIFICATION LEVELS ─────────────────────────────────────────────────

export function getCertification(
  streamsTotal: number
): 'Oro' | 'Platino' | 'Multi-Platino' | 'Diamante' | undefined {
  if (streamsTotal >= 50_000_000) return 'Diamante';
  if (streamsTotal >= 20_000_000) return 'Multi-Platino';
  if (streamsTotal >= 10_000_000) return 'Platino';
  if (streamsTotal >= 5_000_000) return 'Oro';
  return undefined;
}
