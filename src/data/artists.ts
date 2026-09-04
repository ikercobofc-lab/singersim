import { NPCArtist } from '../types';

export const FAMOUS_ARTISTS: NPCArtist[] = [
  // LEYENDAS Y SUPERESTRELLAS GLOBALES (>600k fans required)
  {
    id: 'bad-bunny',
    name: 'Bad Bunny (Benito)',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Leyenda',
    followers: 82000000,
    chemistryRequired: 85,
    avatar: '🐰',
    origin: 'Puerto Rico'
  },
  {
    id: 'rosalia',
    name: 'Rosalía',
    genre: 'Pop / Electropop',
    fameTier: 'Leyenda',
    followers: 45000000,
    chemistryRequired: 80,
    avatar: '🏍️',
    origin: 'España'
  },
  {
    id: 'duki',
    name: 'Duki',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Superestrella',
    followers: 28000000,
    chemistryRequired: 70,
    avatar: '⚡',
    origin: 'Argentina'
  },
  {
    id: 'quevedo',
    name: 'Quevedo',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Superestrella',
    followers: 34000000,
    chemistryRequired: 75,
    avatar: '🏝️',
    origin: 'España'
  },
  {
    id: 'feid',
    name: 'Feid (Ferxxo)',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Superestrella',
    followers: 48000000,
    chemistryRequired: 78,
    avatar: '💚',
    origin: 'Colombia'
  },
  {
    id: 'aitana',
    name: 'Aitana',
    genre: 'Pop / Electropop',
    fameTier: 'Superestrella',
    followers: 22000000,
    chemistryRequired: 65,
    avatar: '✨',
    origin: 'España'
  },
  {
    id: 'peso-pluma',
    name: 'Peso Pluma',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Superestrella',
    followers: 32000000,
    chemistryRequired: 75,
    avatar: '🪶',
    origin: 'México'
  },

  // FAMOSOS NACIONALES (150k - 600k fans required)
  {
    id: 'saiko',
    name: 'Saiko',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Famoso',
    followers: 15000000,
    chemistryRequired: 50,
    avatar: '🌌',
    origin: 'España'
  },
  {
    id: 'trueno',
    name: 'Trueno',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Famoso',
    followers: 19000000,
    chemistryRequired: 55,
    avatar: '🔥',
    origin: 'Argentina'
  },
  {
    id: 'mora',
    name: 'Mora',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Famoso',
    followers: 18000000,
    chemistryRequired: 55,
    avatar: '🪐',
    origin: 'Puerto Rico'
  },
  {
    id: 'milo-j',
    name: 'Milo J',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Famoso',
    followers: 14000000,
    chemistryRequired: 48,
    avatar: '🌧️',
    origin: 'Argentina'
  },
  {
    id: 'blessd',
    name: 'Blessd (El Bendito)',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Famoso',
    followers: 12000000,
    chemistryRequired: 45,
    avatar: '👑',
    origin: 'Colombia'
  },

  // ARTISTAS EMERGENTES (25k - 150k fans required)
  {
    id: 'reks-underground',
    name: 'Reks The Kid',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Emergente',
    followers: 45000,
    chemistryRequired: 15,
    avatar: '🧢',
    origin: 'España'
  },
  {
    id: 'clara-sol',
    name: 'Clara Sol',
    genre: 'R&B / Neo-Soul',
    fameTier: 'Emergente',
    followers: 85000,
    chemistryRequired: 20,
    avatar: '🎙️',
    origin: 'España'
  },
  {
    id: 'facu-flow',
    name: 'Facu Flow',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Emergente',
    followers: 65000,
    chemistryRequired: 18,
    avatar: '🎧',
    origin: 'Argentina'
  },
  {
    id: 'juanfe-medallo',
    name: 'Juanfe de Medallo',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Emergente',
    followers: 110000,
    chemistryRequired: 22,
    avatar: '🌴',
    origin: 'Colombia'
  },

  // PROMESAS QUE EMPIEZAN A SONAR (<25k fans)
  {
    id: 'dani-boy',
    name: 'Dani Boy',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Promesa',
    followers: 12000,
    chemistryRequired: 10,
    avatar: '🛹',
    origin: 'España'
  },
  {
    id: 'luana-v',
    name: 'Luana V',
    genre: 'R&B / Neo-Soul',
    fameTier: 'Promesa',
    followers: 18000,
    chemistryRequired: 12,
    avatar: '🌸',
    origin: 'Argentina'
  },
  {
    id: 'neo-pol',
    name: 'Neo Pol',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Promesa',
    followers: 21000,
    chemistryRequired: 14,
    avatar: '🔥',
    origin: 'Colombia'
  }
];

export const FAMOUS_PRODUCERS: NPCArtist[] = [
  {
    id: 'bizarrap',
    name: 'Bizarrap (BZRP)',
    genre: 'Trap / Hip-Hop',
    fameTier: 'Leyenda',
    followers: 55000000,
    chemistryRequired: 80,
    avatar: '🧢',
    isProducer: true,
    origin: 'Argentina'
  },
  {
    id: 'tainy',
    name: 'Tainy',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Leyenda',
    followers: 24000000,
    chemistryRequired: 75,
    avatar: '🎹',
    isProducer: true,
    origin: 'Puerto Rico'
  },
  {
    id: 'ovy-on-the-drums',
    name: 'Ovy On The Drums',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Superestrella',
    followers: 18000000,
    chemistryRequired: 68,
    avatar: '🥁',
    isProducer: true,
    origin: 'Colombia'
  },
  {
    id: 'sky-rompiendo',
    name: 'Sky Rompiendo',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Superestrella',
    followers: 12000000,
    chemistryRequired: 60,
    avatar: '☁️',
    isProducer: true,
    origin: 'Colombia'
  },
  {
    id: 'big-one',
    name: 'Big One',
    genre: 'Urbano / Reggaeton',
    fameTier: 'Superestrella',
    followers: 22000000,
    chemistryRequired: 65,
    avatar: '🎛️',
    isProducer: true,
    specialType: 'crossover',
    origin: 'Argentina'
  }
];

// Generates varied, authentic slang dialogues by country
export const getArtistDialogue = (
  artist: NPCArtist,
  singerName: string,
  songTitle: string,
  isRemix: boolean = false
): string => {
  const origin = artist.origin || 'España';

  if (isRemix) {
    if (origin === 'Argentina') {
      return `¡Che ${singerName}! Vengo escuchando en repeat tu tema "${songTitle}". La rompiste toda. Tengo unas barras durísimas escritas para sumarme al Remix Oficial. Decime si lo sacamos con mi disquera o te lo quedás vos.`;
    } else if (origin === 'Colombia') {
      return `¡Quiubo ${singerName}, parcero! Ese tema "${songTitle}" está sonando en toda la calle de Medellín. Quiero montarme en el Remix con un verso bien prendido. ¿Hacemos el junte ya?`;
    } else if (origin === 'Puerto Rico') {
      return `Dímelo ${singerName}. Ese palo "${songTitle}" tiene to los códigos de la calle. Me tripea montarme en el Remix oficial pa romper to las plataformas.`;
    } else if (origin === 'México') {
      return `¡Qué onda carnal ${singerName}! Traes ese tema "${songTitle}" bien pegado acá en México. Me late armar un remix con todo mi piquete, avísame y soltamos el tiro.`;
    } else {
      return `Illo ${singerName}, qué pasa hermano. He escuchao "${songTitle}" y es un temazo histórico. Le he tirao unas barras que encajan perfecto para hacer el Remix Oficial. Tú decides si lo sacas tú o lo saco yo.`;
    }
  }

  // Original song proposal dialogues
  if (origin === 'Argentina') {
    return `¿Qué onda ${singerName}? Vengo siguiendo tus palos y la estás rompiendo mal wacho. Te tengo un beat y unas barras acá en el estudio que van a detonar todo. ¿Armamos el junte?`;
  } else if (origin === 'Colombia') {
    return `¡Quiubo parce ${singerName}! Tienes una vibra muy chimba y ese color de voz es una locura. Tengo un perreo que va a reventar Medellín y el mundo entero. Montemos este junte ya.`;
  } else if (origin === 'Puerto Rico') {
    return `Dímelo pai, ${singerName}. Estás sonando durísimo en to la isla y en el bloque. Tengo un ritmo de reggaeton pesao que está pidiendo tu flow. Vamos a soltarlo.`;
  } else if (origin === 'México') {
    return `¡Qué onda compa ${singerName}! Traes un estilazo bien bélico y diferente. Hay que aventarnos un junte con todo para reventar las listas de México y el mundo.`;
  } else {
    return `Illo qué pasa ${singerName}. He visto cómo estás subiendo y el respeto que te estás ganando en la escena. Tengo una idea en mente con la que nos quedamos con el verano entero. ¿Le damos?`;
  }
};
