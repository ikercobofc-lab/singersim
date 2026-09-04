import { DecisionEvent } from '../types';

export const RANDOM_DECISION_EVENTS: DecisionEvent[] = [
  {
    id: 'label_offer_major',
    title: 'Propuesta de Discográfica Multinacional (Sony / Universal)',
    category: 'opportunity',
    description: 'Un A&R de una multinacional te cita en una azotea de lujo. Te ofrecen un adelanto millonario de 250.000€, pero se quedan con el 80% de tus masters y exigen supervisión creativa.',
    choices: [
      {
        text: 'Firmar el contrato multinacional (Dinero y apoyo masivo)',
        impactDescription: '+250.000€, +150.000 Oyentes, -15 Composición/Libertad, -10 Reputación indie',
        consequences: {
          money: 250000,
          fans: 150000,
          reputation: -10,
          composition: -15,
          newsHeadline: '¡Vendió su alma! Firma contrato millonario con una gran multinacional',
          newsSource: 'MondoSonoro'
        }
      },
      {
        text: 'Rechazar la oferta y seguir 100% Independiente',
        impactDescription: '+25 Reputación, +10 Carisma, -30.000€ que podrías haber ganado',
        consequences: {
          reputation: 25,
          charisma: 10,
          fans: 40000,
          newsHeadline: 'Declara la guerra a la industria: "Mis canciones y mis masters son míos"',
          newsSource: 'El País Cultura'
        }
      }
    ]
  },
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
