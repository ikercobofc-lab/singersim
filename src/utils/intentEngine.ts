/**
 * intentEngine.ts — v2
 *
 * Local intent detection and NPC response generation.
 * This is NOT a generative AI — it's a rule-based engine that:
 * 1. Classifies player message intent
 * 2. Extracts structured entities
 * 3. Generates contextually appropriate NPC responses
 * 4. Presents pending proposals for player confirmation before acting
 *
 * If an external AI API is configured, it delegates to that layer.
 * If not, the local engine handles everything without pretending to be smarter.
 */

import {
  ConversationIntent,
  ExtractedEntities,
  ConversationMessage,
  NPCArtist,
  Song,
  PrivateProject,
  FameProfile,
  CareerState,
  ArtistSkills,
} from '../types';

// ─── INTENT CLASSIFICATION ────────────────────────────────────────────────

/** Keywords that signal each intent */
const INTENT_PATTERNS: Record<ConversationIntent, RegExp[]> = {
  greeting: [
    /^(hola|buenos|ey|qué tal|qué pasa|saludos|hey|hi|what'?s up|dímelo|quiubo|illo)/i,
  ],
  collab_proposal: [
    /colabor|junte|feat|featuring|grabar|hacer\s+un\s+tema|un\s+tema\s+juntos|nueva\s+canción|single\s+juntos/i,
    /te\s+(gustaría|mola|apetece|interesa)\s+(hacer|grabar|sacar)/i,
    /quiero\s+(que\s+(hagas|vengas|te\s+montes)|hacer\s+algo\s+contigo)/i,
    /podríamos\s+(hacer|grabar|sacar)/i,
  ],
  remix_proposal: [
    /remix|remezcla|versión\s+nueva|nueva\s+versión|versión\s+alternativa/i,
    /quiero\s+(que\s+hagas?\s+el\s+remix|remezclar)/i,
    /te\s+(gustaría|mola)\s+(hacer|montar|grabar)\s+el\s+remix/i,
  ],
  demo_share: [
    /demo|maqueta|beat|instrumental|fragmento|preview|adelanto|te\s+mando|te\s+envío|comparto/i,
    /tengo\s+(un\s+beat|una\s+demo|algo\s+que|un\s+tema)/i,
    /escucha\s+(esto|esta\s+demo|este\s+beat)/i,
  ],
  negotiation: [
    /porcentaje|royalt|split|advance|adelanto|contrato|condiciones|deal|pago|cobr|honorar/i,
    /cuánto|qué\s+ofr|cuál\s+es\s+tu\s+tarifa/i,
  ],
  studio_invite: [
    /estudio|studio|sesión\s+de\s+grabación|ven\s+a\s+grabar|grabamos\s+juntos|en\s+el\s+estudio/i,
    /cuando\s+(entras|grabas|tienes\s+hueco)/i,
  ],
  availability_check: [
    /disponible|disponibilidad|libre|agenda|tienes\s+(tiempo|hueco|espacio)|cuándo\s+puedes/i,
    /estás\s+(libre|ocupado|en\s+gira)/i,
  ],
  small_talk: [
    /qué\s+estás\s+(haciendo|escuchando|trabajando)|cómo\s+(te\s+va|vas|está)/i,
    /nuevo\s+(proyecto|disco|álbum|ep)|qué\s+(hay\s+de|tienes\s+de)\s+nuevo/i,
  ],
  feedback_request: [
    /qué\s+(te\s+parece|opinas|piensas)|dame\s+tu\s+(opinión|feedback)|cómo\s+ves\s+(esto|el\s+tema)/i,
  ],
  unknown: [],
};

/**
 * Classifies the intent of a player message.
 * Returns the best matching intent, or 'unknown'.
 */
export function classifyIntent(message: string): ConversationIntent {
  const text = message.toLowerCase().trim();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent === 'unknown') continue;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return intent as ConversationIntent;
      }
    }
  }

  return 'unknown';
}

// ─── ENTITY EXTRACTION ────────────────────────────────────────────────────

/**
 * Extracts structured information from the message.
 * Used to pre-fill collaboration proposals without full forms.
 */
export function extractEntities(
  message: string,
  knownSongs: Song[],
  knownArtists: NPCArtist[]
): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const text = message.toLowerCase();

  // Genre detection
  const genres = [
    'reggaeton', 'trap', 'hip-hop', 'pop', 'r&b', 'drill',
    'dancehall', 'electrónica', 'house', 'techno', 'balada',
    'flamenco', 'cumbia', 'corrido', 'banda'
  ];
  const foundGenres = genres.filter(g => text.includes(g));
  if (foundGenres.length > 0) entities.genres = foundGenres;

  // Collab type detection
  if (/feat|featuring|invitado|colaborad/.test(text)) entities.collabType = 'feature';
  if (/produc|beat|instrumental/.test(text)) entities.collabType = 'production';
  if (/remix|remezcla/.test(text)) entities.collabType = 'remix';
  if (/proyecto\s+conjunto|joint\s+project|álbum\s+colaborativo/.test(text)) entities.collabType = 'joint_project';

  // Role detection
  const roles: ExtractedEntities['roles'] = [];
  if (/coro|estribillo|hook/.test(text)) roles.push('vocalist');
  if (/verso|rap|barra/.test(text)) roles.push('rapper');
  if (/produc|beat|ritmo/.test(text)) roles.push('producer');
  if (/mezcla|master/.test(text)) roles.push('mixing_engineer');
  if (roles.length > 0) entities.roles = roles;

  // Royalty percentage detection
  const royaltyMatch = text.match(/(\d+)\s*%/);
  if (royaltyMatch) entities.royaltyMentioned = parseInt(royaltyMatch[1]);

  // Budget detection
  const budgetMatch = text.match(/(\d[\d.]*)\s*(€|euro|k\s+euro|mil)/);
  if (budgetMatch) {
    const value = parseFloat(budgetMatch[1].replace('.', ''));
    entities.budgetMentioned = budgetMatch[2].includes('k') ? value * 1000 : value;
  }

  // Song title detection (check against known songs)
  const mentionedSongs: string[] = [];
  for (const song of knownSongs) {
    if (text.includes(song.title.toLowerCase())) {
      mentionedSongs.push(song.title);
    }
  }
  if (mentionedSongs.length > 0) entities.songs = mentionedSongs;

  // Artist name detection
  const mentionedArtists: string[] = [];
  for (const artist of knownArtists) {
    if (text.includes(artist.name.toLowerCase())) {
      mentionedArtists.push(artist.name);
    }
  }
  if (mentionedArtists.length > 0) entities.artists = mentionedArtists;

  return entities;
}

// ─── NPC RESPONSE GENERATION ──────────────────────────────────────────────

export interface NPCResponseContext {
  npc: NPCArtist;
  playerName: string;
  playerFame: FameProfile;
  playerCareer: CareerState;
  playerSkills: ArtistSkills;
  playerSongs: Song[];
  playerProjects: PrivateProject[];
  relationshipScore: number;
  conversationHistory: ConversationMessage[];
  pendingProposals: number; // how many open proposals exist
}

export interface NPCResponse {
  text: string;
  intent: ConversationIntent;
  // If a proposal was detected, surface it for player confirmation
  pendingProposal?: {
    type: 'collab' | 'remix' | 'demo_review';
    summary: string;
    suggestedSongTitle?: string;
    suggestedGenre?: string;
    suggestedRole?: string;
    suggestedRoyalty?: number;
    requiresConfirmation: boolean;
  };
  // Action the player should be prompted about
  suggestedAction?: string;
}

/**
 * Generates an NPC response to a player message.
 * Takes into account personality, relationship, and game state.
 * Does NOT auto-execute any game actions — only returns text + proposal data.
 */
export function generateNPCResponse(
  playerMessage: string,
  intent: ConversationIntent,
  entities: ExtractedEntities,
  ctx: NPCResponseContext
): NPCResponse {
  const { npc, playerName, playerFame, relationshipScore } = ctx;
  const origin = npc.origin || 'España';
  const personality = npc.personality || 'professional';

  // Greeting prefix based on origin
  const greetings: Record<string, string> = {
    Argentina: `¡Che ${playerName}!`,
    Colombia: `¡Quiubo ${playerName}, parcero!`,
    'Puerto Rico': `Dímelo ${playerName}.`,
    México: `¡Qué onda ${playerName}!`,
    España: `Illo ${playerName},`,
    default: `Hey ${playerName},`,
  };
  const greeting = greetings[origin] || greetings.default;

  // Is artist available?
  const isAvailable = npc.availability === 'available';
  const isBusy = npc.availability === 'busy' || npc.availability === 'on_tour';
  const hasOpenProposals = ctx.pendingProposals > 0;

  // Relationship-based warmth
  const isWarm = relationshipScore > 20;
  const isCold = relationshipScore < -10;

  switch (intent) {
    case 'greeting': {
      if (isCold) {
        return { text: `${greeting} ...¿Qué quieres?`, intent };
      }
      if (isWarm) {
        return { text: `${greeting} ¡qué alegría! ¿Cómo te va todo? ¿Qué me traes por aquí?`, intent };
      }
      return { text: `${greeting} ¿qué tal? ¿Hay algo en lo que pueda ayudarte?`, intent };
    }

    case 'collab_proposal': {
      if (!isAvailable && isBusy) {
        return {
          text: `${greeting} ahora mismo estoy en medio de varias cosas y no puedo comprometerme con nada nuevo. Escríbeme en unas semanas cuando tenga el calendario más libre.`,
          intent,
        };
      }
      if (hasOpenProposals) {
        return {
          text: `${greeting} ya tenemos una propuesta pendiente de resolver. Antes de abrir otra, ¿qué hacemos con esa?`,
          intent,
        };
      }

      const genre = entities.genres?.[0] || npc.genre;
      const role = entities.roles?.[0] || 'vocalist';
      const royalty = entities.royaltyMentioned || npc.collab_preferences.preferredRoyaltySplit;

      // Assess if the player is in range for this NPC
      const audienceRatio = playerFame.monthlyListeners / Math.max(1, npc.monthlyListeners);
      if (audienceRatio < 0.02 && npc.fameTier === 'Leyenda') {
        return {
          text: `${greeting} mira, te soy sincero. Me llega mucha gente proponiendo juntes. Ahora mismo necesito que el proyecto sea con alguien que ya tenga un nombre. Sigue currando y cuando tengas más trayectoria, volvemos a hablar.`,
          intent,
        };
      }

      const text = isWarm
        ? `${greeting} me interesa lo que me propones. Cuéntame más sobre el concepto. Si el sonido encaja, podemos hablarlo en serio.`
        : `${greeting} suena interesante. ¿De qué estilo estamos hablando exactamente? Dame más detalles del proyecto.`;

      return {
        text,
        intent,
        pendingProposal: {
          type: 'collab',
          summary: `Colaboración de ${role} en género ${genre}`,
          suggestedGenre: genre,
          suggestedRole: role,
          suggestedRoyalty: royalty,
          requiresConfirmation: true,
        },
        suggestedAction: 'Enviar propuesta formal de colaboración',
      };
    }

    case 'remix_proposal': {
      if (!npc.collab_preferences.openToRemix) {
        return {
          text: `${greeting} ahora mismo no estoy haciendo remixes. Me gusta enfocarme en proyectos originales.`,
          intent,
        };
      }

      const mentionedSong = entities.songs?.[0];
      if (!mentionedSong) {
        return {
          text: `${greeting} me interesa, pero ¿de qué canción estamos hablando? Cuéntame qué tienes en mente.`,
          intent,
          suggestedAction: 'Especificar qué canción quieres remixar',
        };
      }

      return {
        text: `${greeting} "${mentionedSong}" es un temazo. El remix podría funcionar bien. Dame detalles de lo que necesitas de mi parte.`,
        intent,
        pendingProposal: {
          type: 'remix',
          summary: `Remix de "${mentionedSong}"`,
          suggestedSongTitle: mentionedSong,
          requiresConfirmation: true,
        },
        suggestedAction: 'Preparar propuesta de remix',
      };
    }

    case 'demo_share': {
      if (!isAvailable) {
        return {
          text: `${greeting} ahora mismo no tengo tiempo de revisar demos. Dame un tiempo y me las mandas.`,
          intent,
        };
      }
      return {
        text: `${greeting} puedes compartirme la demo. La escucho y te doy mi opinión honesta. No prometo nada, pero si encaja con lo que estoy haciendo, lo hablamos.`,
        intent,
        pendingProposal: {
          type: 'demo_review',
          summary: 'Compartir demo privada para revisión',
          requiresConfirmation: true,
        },
        suggestedAction: 'Enviar demo privada para revisión',
      };
    }

    case 'negotiation': {
      const royaltyMentioned = entities.royaltyMentioned;
      const preferredRoyalty = npc.collab_preferences.preferredRoyaltySplit;

      if (!royaltyMentioned) {
        return {
          text: `${greeting} para hablar de condiciones necesito saber qué propones exactamente. ¿De qué porcentaje y qué tipo de proyecto estamos hablando?`,
          intent,
        };
      }

      if (royaltyMentioned >= preferredRoyalty) {
        return {
          text: `${greeting} esas condiciones me parecen razonables. Si el proyecto es sólido, podemos seguir adelante.`,
          intent,
        };
      } else {
        return {
          text: `${greeting} con un ${royaltyMentioned}% no me cuadra. Lo mínimo que necesito para este tipo de trabajo es un ${preferredRoyalty}%. ¿Podemos ajustarlo?`,
          intent,
          pendingProposal: {
            type: 'collab',
            summary: `Contraoferta: ${preferredRoyalty}% royalties`,
            suggestedRoyalty: preferredRoyalty,
            requiresConfirmation: true,
          },
        };
      }
    }

    case 'studio_invite': {
      if (!isAvailable) {
        return {
          text: `${greeting} ahora mismo no puedo meterme en el estudio. Tengo la agenda cerrada. Escríbeme en unos días.`,
          intent,
        };
      }
      return {
        text: `${greeting} me apetece la idea. ¿Cuándo tienes en mente? Dime fechas y lo miramos.`,
        intent,
        suggestedAction: 'Proponer fecha de sesión de estudio',
      };
    }

    case 'availability_check': {
      const statusMsg: Record<typeof npc.availability, string> = {
        available: `${greeting} sí, ahora tengo algo de tiempo libre. ¿Qué tienes en mente?`,
        busy: `${greeting} estoy bastante ocupado ahora mismo, pero dependiendo de lo que sea, podría hueco.`,
        on_tour: `${greeting} estoy de gira hasta dentro de unas semanas. No puedo comprometerme con nada nuevo por ahora.`,
        hiatus: `${greeting} estoy tomando un descanso del estudio. No acepto proyectos nuevos en este momento.`,
        retired: `${greeting} ya me he retirado de la industria activa. No hago nuevos proyectos.`,
      };
      return { text: statusMsg[npc.availability] || statusMsg.available, intent };
    }

    case 'small_talk': {
      const smallTalkResponses = [
        `${greeting} bien, trabajando en cosas nuevas. ¿Tú cómo llevas el ritmo?`,
        `${greeting} acabo de salir del estudio. Tengo algo entre manos que creo que va a sonar bien.`,
        `${greeting} en modo creativo total. ¿Qué hay de nuevo por tu lado?`,
      ];
      return {
        text: smallTalkResponses[Math.floor(Math.random() * smallTalkResponses.length)],
        intent,
      };
    }

    case 'feedback_request': {
      const playerSongCount = ctx.playerSongs.filter(s => s.status === 'released').length;
      if (playerSongCount === 0) {
        return {
          text: `${greeting} todavía no he escuchado nada tuyo. Mándame algo concreto y te doy mi opinión.`,
          intent,
        };
      }
      return {
        text: `${greeting} he escuchado algunas de tus cosas. Tienes un sonido interesante. Creo que podrías trabajar más la estructura de los estribillos, pero el flow va bien.`,
        intent,
      };
    }

    default: {
      return {
        text: `${greeting} no estoy seguro de entender exactamente qué me propones. ¿Puedes ser más concreto?`,
        intent: 'unknown',
      };
    }
  }
}

// ─── MISSING INFORMATION DETECTOR ────────────────────────────────────────

/**
 * Given an intent and extracted entities, returns what's still missing
 * to form a complete proposal.
 */
export function getMissingProposalFields(
  intent: ConversationIntent,
  entities: ExtractedEntities
): string[] {
  const missing: string[] = [];

  if (intent === 'collab_proposal') {
    if (!entities.genres || entities.genres.length === 0) missing.push('género musical');
    if (!entities.collabType) missing.push('tipo de colaboración (feat, producción, proyecto conjunto)');
  }

  if (intent === 'remix_proposal') {
    if (!entities.songs || entities.songs.length === 0) missing.push('canción que quieres remixar');
  }

  if (intent === 'negotiation') {
    if (!entities.royaltyMentioned) missing.push('porcentaje de royalties');
  }

  return missing;
}

// ─── MESSAGE COMPRESSION (for memory) ────────────────────────────────────

/**
 * Creates a concise summary of a conversation for the NPC's memory.
 * Used to prevent context from growing too large.
 */
export function compressConversationToMemory(
  messages: ConversationMessage[],
  npcName: string
): string {
  if (messages.length === 0) return '';

  const intents = messages
    .filter(m => m.intent && m.intent !== 'unknown')
    .map(m => m.intent as string);

  const uniqueIntents = [...new Set(intents)];

  const mentionedSongs = messages
    .flatMap(m => m.entities?.songs || [])
    .filter(Boolean);

  const mentionedGenres = messages
    .flatMap(m => m.entities?.genres || [])
    .filter(Boolean);

  const parts: string[] = [`Conversación con ${npcName}.`];
  if (uniqueIntents.length > 0) parts.push(`Temas: ${uniqueIntents.join(', ')}.`);
  if (mentionedSongs.length > 0) parts.push(`Canciones mencionadas: ${[...new Set(mentionedSongs)].join(', ')}.`);
  if (mentionedGenres.length > 0) parts.push(`Géneros: ${[...new Set(mentionedGenres)].join(', ')}.`);

  return parts.join(' ');
}
