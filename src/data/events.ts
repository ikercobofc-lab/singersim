import { DecisionEvent } from '../types';

// Decisiones progresivas según el nivel de carrera
export const RANDOM_DECISION_EVENTS: DecisionEvent[] = [
  // ═══════════════════════════════════════════════════════════
  // NIVEL PRINCIPIANTE (< 50K oyentes)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'upgrade_equipment',
    title: 'Mejorar el Equipo de Grabación',
    category: 'opportunity',
    description: 'Tu micrófono actual graba con mucho ruido de fondo. Un colega te ofrece su viejo Shure SM58 por 120€. Suena mucho mejor, pero es dinero que podrías invertir en promoción.',
    choices: [
      {
        text: 'Comprar el micrófono (Mejor calidad de grabación)',
        impactDescription: '-120€, +5 Voz, +3 Producción',
        consequences: {
          money: -120,
          voice: 5,
          production: 3,
        }
      },
      {
        text: 'Seguir con el equipo actual y ahorrar',
        impactDescription: 'Mantener el dinero, sin mejora de calidad',
        consequences: {
          money: 0,
        }
      }
    ]
  },
  {
    id: 'friend_promo',
    title: 'Tu Amigo Puede Promocionarte',
    category: 'opportunity',
    description: 'Un amigo con 12K seguidores en Instagram se ofrece a subir una historia con tu última canción. No te cobrará nada, pero te pide que le des crédito en una futura colaboración.',
    choices: [
      {
        text: 'Aceptar la ayuda (Exposición gratis)',
        impactDescription: '+800 Oyentes, +5 Carisma, promesa de colaboración futura',
        consequences: {
          fans: 800,
          charisma: 5,
        }
      },
      {
        text: 'Rechazar y crecer de forma totalmente orgánica',
        impactDescription: '+5 Reputación de artista independiente',
        consequences: {
          reputation: 5,
        }
      }
    ]
  },
  {
    id: 'genre_experiment',
    title: 'Experimentar con Otro Género',
    category: 'opportunity',
    description: 'Has notado que el género que haces tiene mucha competencia. Podrías probar con un estilo diferente que tiene menos artistas, pero perderías tu identidad actual.',
    choices: [
      {
        text: 'Mantener tu género y estilo propio',
        impactDescription: '+10 Composición, crecimiento más lento pero auténtico',
        consequences: {
          composition: 10,
          reputation: 8,
        }
      },
      {
        text: 'Cambiar a un género más popular',
        impactDescription: '+1.500 Oyentes, -5 Reputación, -5 Composición',
        consequences: {
          fans: 1500,
          reputation: -5,
          composition: -5,
        }
      }
    ]
  },
  {
    id: 'learn_skill',
    title: 'Aprender Producción con un Amigo',
    category: 'opportunity',
    description: 'Un colega productor te ofrece enseñarte lo básico de FL Studio durante un mes. Tendrás que dedicarle 3 tardes por semana, pero aprenderás mucho.',
    choices: [
      {
        text: 'Aprender producción (Tiempo invertido)',
        impactDescription: '+12 Producción, +8 Mixing, -10 Energía',
        consequences: {
          production: 12,
          mixing: 8,
          energy: -10,
        }
      },
      {
        text: 'Agradecer pero seguir centrándote en cantar',
        impactDescription: '+8 Voz, +5 Energía conservada',
        consequences: {
          voice: 8,
          energy: 5,
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // NIVEL EMERGENTE (50K - 500K oyentes)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'twitter_beef_rival',
    title: 'Tiradera y Beef en Redes Sociales',
    category: 'rivalry',
    description: 'Un rapero rival publica una historia en Instagram burlándose de tu último videoclip, diciendo que usas autotune falso y que te escribe las letras tu primo.',
    choices: [
      {
        text: 'Responder con una tiradera demoledora en directo',
        impactDescription: '+80.000 Oyentes por morbo, +10 Flow, -20 Reputación, -15 Energía',
        consequences: {
          fans: 80000,
          flow: 10,
          reputation: -15,
          energy: -15,
          newsHeadline: 'Incendio en la escena urbana tras la respuesta a las provocaciones',
          newsSource: 'Marca Urbana'
        }
      },
      {
        text: 'Ignorarlo con elegancia y sacar un adelanto de tu nueva canción',
        impactDescription: '+20 Carisma, +10 Composición, +30.000 Oyentes fieles',
        consequences: {
          charisma: 20,
          composition: 10,
          fans: 30000,
          newsHeadline: 'Lección de madurez: responde al ataque anunciando nueva música de calidad',
          newsSource: 'Rolling Stone España'
        }
      }
    ]
  },
  {
    id: 'viral_tiktok_trend',
    title: 'Trend de TikTok con tu estribillo',
    category: 'media',
    description: 'Una influencer con 15 millones de seguidores en TikTok ha usado un fragmento de tu canción para un baile viral. Tienes la oportunidad de subirte a la ola.',
    choices: [
      {
        text: 'Grabar el baile con ella y pagar campaña de boost',
        impactDescription: '-10.000€, +350.000 Oyentes rápidos, -5 Reputación Underground',
        consequences: {
          money: -10000,
          fans: 350000,
          reputation: -5,
          charisma: 10,
          newsHeadline: 'El nuevo fenómeno de TikTok rompe todos los récords de streams',
          newsSource: 'GenZ Beats'
        }
      },
      {
        text: 'Dejar que el tema crezca de forma orgánica sin involucrarte',
        impactDescription: '+120.000 Oyentes, +10 Reputación limpia',
        consequences: {
          fans: 120000,
          reputation: 10,
          newsHeadline: 'Éxito genuino: cómo una canción llegó a las listas sin artificios',
          newsSource: 'Jenesaispop'
        }
      }
    ]
  },
  {
    id: 'la_resistencia_interview',
    title: 'Invitación a programa de máxima audiencia (La Revuelta / El Hormiguero)',
    category: 'media',
    description: 'Te invitan a la televisión nacional en prime time para ser entrevistado y promocionar tu música ante millones de televidentes.',
    choices: [
      {
        text: 'Aceptar y cantar un acústico en directo para demostrar tu voz real',
        impactDescription: '+200.000 Oyentes, +15 Voz, +15 Carisma, -10 Energía',
        consequences: {
          fans: 200000,
          voice: 15,
          charisma: 15,
          energy: -10,
          newsHeadline: 'Brutal directo en televisión deja a la audiencia sin palabras',
          newsSource: 'RTVE Play'
        }
      },
      {
        text: 'Hacer el gamberro y responder con humor y vaciles',
        impactDescription: '+300.000 Oyentes por viralidad, -10 Voz técnica, +20 Carisma',
        consequences: {
          fans: 300000,
          charisma: 20,
          energy: -10,
          newsHeadline: 'Los mejores momentos de la entrevista más surrealista del año',
          newsSource: 'Viralizate TV'
        }
      }
    ]
  },
  {
    id: 'festival_headliner_crisis',
    title: 'Emergencia en Festival Internacional (Coachella / Primavera Sound)',
    category: 'opportunity',
    description: 'El cabeza de cartel del festival ha cancelado a última hora por afonía. La organización te llama desesperada: tienes 4 horas para preparar un show de 50 minutos ante 60.000 personas.',
    choices: [
      {
        text: 'Subir al escenario con toda la energía y dejarlo todo',
        impactDescription: '+45.000€, +400.000 Oyentes, +20 Carisma, -30 Energía',
        consequences: {
          money: 45000,
          fans: 400000,
          charisma: 20,
          energy: -30,
          reputation: 25,
          newsHeadline: 'Consagración histórica: salva el festival con un show para el recuerdo',
          newsSource: 'Billboard'
        }
      },
      {
        text: 'Rechazar: no tienes el show suficientemente pulido y prefieres no arriesgar',
        impactDescription: '+10 Energía conservada, -20.000 Oyentes potenciales perdidos',
        consequences: {
          energy: 10,
          newsHeadline: 'El artista rechazó sustituir a la estrella: prefiere esperar su momento',
          newsSource: 'Pitchfork'
        }
      }
    ]
  }
];
