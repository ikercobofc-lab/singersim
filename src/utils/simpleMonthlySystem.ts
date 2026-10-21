import { Singer, Song } from '../types';

// Sistema simple de progresión mensual que trabaja con weeks

export interface MonthlyProgress {
  monthNumber: number; // Meses desde el inicio
  currentMonth: number; // 0-11 (Enero-Diciembre)
  currentYear: number;
  decisionsAvailable: boolean;
  decisions: MonthlyDecision[];
  summary: MonthlySummary;
}

export interface MonthlyDecision {
  id: string;
  title: string;
  description: string;
  category: 'equipment' | 'promotion' | 'creative' | 'financial' | 'networking';
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  label: string;
  cost: {
    money: number;
    energy: number;
    weeks: number; // Tiempo que toma en semanas
  };
  effects: {
    listeners: number; // +/- oyentes
    money: number; // +/- dinero mensual
    skills: string[]; // Habilidades que mejora
    risks: string[];
  };
}

export interface MonthlySummary {
  listenersGained: number;
  moneyEarned: number;
  moneySpent: number;
  skillsImproved: string[];
  importantEvents: string[];
}

// Convertir semanas a meses (4 semanas = 1 mes)
export function weeksToMonths(weeks: number): number {
  return Math.floor(weeks / 4);
}

export function getCurrentMonth(weeks: number): number {
  const months = weeksToMonths(weeks);
  return months % 12; // 0-11
}

export function getCurrentYear(weeks: number, startYear: number): number {
  const months = weeksToMonths(weeks);
  return startYear + Math.floor(months / 12);
}

// Generar decisiones basadas en el progreso del jugador
export function generateMonthlyDecisions(singer: Singer): MonthlyDecision[] {
  const monthsActive = weeksToMonths(singer.career.careerWeek);
  const listeners = singer.fame.monthlyListeners;
  const balance = singer.economy.balance;
  
  const decisions: MonthlyDecision[] = [];
  
  // DECISIONES PARA 0 OYENTES (primeros 3 meses)
  if (listeners < 100 && monthsActive < 3) {
    decisions.push({
      id: 'first_equipment',
      title: 'Tu primer equipo de grabación',
      description: 'Tienes 0 oyentes y grabas con el móvil. ¿Inviertes en equipo básico?',
      category: 'equipment',
      options: [
        {
          id: 'cheap_usb',
          label: 'Micrófono USB barato (50€)',
          cost: { money: 50, energy: 5, weeks: 0 },
          effects: {
            listeners: 0,
            money: 0,
            skills: ['voice +5'],
            risks: ['Calidad aún amateur']
          }
        },
        {
          id: 'decent_xlr',
          label: 'Kit semi-profesional (300€)',
          cost: { money: 300, energy: 15, weeks: 1 },
          effects: {
            listeners: 50,
            money: -300,
            skills: ['voice +15', 'production +5'],
            risks: ['Gasto significativo sin garantía']
          }
        },
        {
          id: 'keep_phone',
          label: 'Seguir con el móvil (0€)',
          cost: { money: 0, energy: 0, weeks: 2 },
          effects: {
            listeners: 0,
            money: 0,
            skills: ['composition +10'],
            risks: ['Calidad baja aleja oyentes']
          }
        }
      ]
    });
    
    decisions.push({
      id: 'learn_basics',
      title: '¿Cómo aprender producción?',
      description: 'Necesitas conocimientos básicos para grabar y mezclar.',
      category: 'creative',
      options: [
        {
          id: 'youtube_free',
          label: 'Tutoriales gratis (lento)',
          cost: { money: 0, energy: 20, weeks: 8 },
          effects: {
            listeners: 0,
            money: 0,
            skills: ['production +10', 'mixing +8'],
            risks: ['Progreso muy lento', 'Malos hábitos']
          }
        },
        {
          id: 'online_course',
          label: 'Curso online (100€)',
          cost: { money: 100, energy: 15, weeks: 4 },
          effects: {
            listeners: 0,
            money: -100,
            skills: ['production +20', 'mixing +15'],
            risks: ['Dinero que podrías usar para equipo']
          }
        },
        {
          id: 'friend_help',
          label: 'Que un amigo te enseñe',
          cost: { money: 0, energy: 10, weeks: 12 },
          effects: {
            listeners: 0,
            money: 0,
            skills: ['production +15'],
            risks: ['Amigo puede no ser buen profesor']
          }
        }
      ]
    });
  }
  
  // DECISIONES PARA PRIMERA CANCIÓN (100-1000 oyentes)
  if (listeners >= 100 && listeners < 1000 && monthsActive >= 1) {
    decisions.push({
      id: 'first_release',
      title: 'Estrategia para tu primer lanzamiento',
      description: '¿Cómo vas a publicar tu primera canción?',
      category: 'promotion',
      options: [
        {
          id: 'soundcloud_free',
          label: 'Subir gratis a SoundCloud',
          cost: { money: 0, energy: 5, weeks: 0 },
          effects: {
            listeners: 25,
            money: 0,
            skills: [],
            risks: ['Posiblemente nadie lo escuche']
          }
        },
        {
          id: 'distribute_spotify',
          label: 'Distribuir a Spotify (20€/año)',
          cost: { money: 20, energy: 10, weeks: 0 },
          effects: {
            listeners: 150,
            money: -20,
            skills: [],
            risks: ['Sin promoción, difícil destacar']
          }
        },
        {
          id: 'wait_improve',
          label: 'Esperar y mejorar calidad',
          cost: { money: 0, energy: 15, weeks: 8 },
          effects: {
            listeners: 0,
            money: 0,
            skills: ['production +8', 'mixing +8', 'composition +5'],
            risks: ['Perder impulso inicial']
          }
        }
      ]
    });
  }
  
  // DECISIONES PARA CRECIMIENTO (1K-10K oyentes)
  if (listeners >= 1000 && listeners < 10000) {
    decisions.push({
      id: 'social_presence',
      title: 'Presencia en redes sociales',
      description: 'Necesitas estar más presente donde está tu audiencia.',
      category: 'networking',
      options: [
        {
          id: 'tiktok_focus',
          label: 'Enfocarte en TikTok (energía alta)',
          cost: { money: 0, energy: 30, weeks: 4 },
          effects: {
            listeners: 500,
            money: 0,
            skills: ['charisma +10'],
            risks: ['Burnout por contenido diario']
          }
        },
        {
          id: 'instagram_organic',
          label: 'Instagram orgánico (constante)',
          cost: { money: 0, energy: 20, weeks: 8 },
          effects: {
            listeners: 300,
            money: 0,
            skills: ['promotion +8'],
            risks: ['Algoritmo cambiante']
          }
        },
        {
          id: 'paid_ads',
          label: 'Anuncios pagados (50€)',
          cost: { money: 50, energy: 10, weeks: 2 },
          effects: {
            listeners: 800,
            money: -50,
            skills: [],
            risks: ['Dinero perdido si no funciona']
          }
        }
      ]
    });
  }
  
  return decisions.slice(0, 2); // Máximo 2 decisiones por mes
}

// Aplicar decisión
export function applyDecision(singer: Singer, decisionId: string, optionId: string): Singer {
  const decisions = generateMonthlyDecisions(singer);
  const decision = decisions.find(d => d.id === decisionId);
  
  if (!decision) return singer;
  
  const option = decision.options.find(o => o.id === optionId);
  if (!option) return singer;
  
  const updatedSinger = { ...singer };
  
  // Aplicar coste
  updatedSinger.economy.balance -= option.cost.money;
  updatedSinger.career.energy = Math.max(0, updatedSinger.career.energy - option.cost.energy);
  
  // Aplicar efectos
  updatedSinger.fame.monthlyListeners = Math.max(0, 
    updatedSinger.fame.monthlyListeners + option.effects.listeners
  );
  
  // Añadir semanas por tiempo de la decisión
  updatedSinger.career.careerWeek += option.cost.weeks;
  
  return updatedSinger;
}

// Calcular progresión mensual automática
export function simulateMonthProgress(singer: Singer): MonthlySummary {
  const baseListeners = singer.fame.monthlyListeners;
  
  // Crecimiento orgánico (muy lento al inicio)
  let growthRate = 0.05; // 5% mensual base
  
  if (baseListeners < 100) growthRate = 0.02; // 2% si tienes <100
  if (baseListeners < 1000) growthRate = 0.03; // 3% si tienes <1000
  if (baseListeners < 10000) growthRate = 0.04; // 4% si tienes <10000
  
  // Variación aleatoria
  growthRate *= (0.8 + Math.random() * 0.4); // 80-120% del rate
  
  const listenersGained = Math.floor(baseListeners * growthRate);
  
  // Ingresos mensuales
  const moneyEarned = calculateMonthlyEarnings(singer);
  const moneySpent = calculateMonthlyExpenses(singer);
  
  // Eventos aleatorios
  const importantEvents = generateRandomMonthlyEvents(singer);
  
  // Mejoras de habilidades por uso
  const skillsImproved = getSkillsImprovement(singer);
  
  return {
    listenersGained,
    moneyEarned,
    moneySpent,
    skillsImproved,
    importantEvents
  };
}

function calculateMonthlyEarnings(singer: Singer): number {
  const listeners = singer.fame.monthlyListeners;
  
  if (listeners < 100) {
    // Prácticamente 0 ingresos
    return Math.floor(Math.random() * 10); // 0-10€
  }
  
  if (listeners < 1000) {
    // Ingresos mínimos
    return Math.floor(listeners * 0.02 * (0.5 + Math.random())); // 0.01-0.03€ por oyente
  }
  
  if (listeners < 10000) {
    // Ingresos modestos
    return Math.floor(listeners * 0.05 * (0.7 + Math.random() * 0.6)); // 0.035-0.08€ por oyente
  }
  
  // Ingresos decentes
  return Math.floor(listeners * 0.1 * (0.8 + Math.random() * 0.4)); // 0.08-0.12€ por oyente
}

function calculateMonthlyExpenses(singer: Singer): number {
  const baseExpenses = 200; // Costes de vida básicos
  
  // Equipos/instrumentos
  const equipmentCost = singer.skills.production > 40 ? 100 : 50;
  
  // Software/subscripciones
  const softwareCost = 50;
  
  // Promoción si está activo
  const promoCost = singer.career.momentum > 30 ? 100 : 50;
  
  return baseExpenses + equipmentCost + softwareCost + promoCost;
}

function generateRandomMonthlyEvents(singer: Singer): string[] {
  const events: string[] = [];
  const listeners = singer.fame.monthlyListeners;
  
  // Eventos positivos
  if (Math.random() < 0.2) { // 20% chance
    if (listeners < 1000) {
      events.push('Un blog local mencionó tu música');
    } else if (listeners < 10000) {
      events.push('Te contactó una radio universitaria');
    } else {
      events.push('Un medio digital escribió sobre ti');
    }
  }
  
  // Eventos negativos
  if (Math.random() < 0.15) { // 15% chance
    if (listeners < 1000) {
      events.push('Problemas técnicos retrasaron tu trabajo');
    } else {
      events.push('Un show fue cancelado por baja asistencia');
    }
  }
  
  // Eventos neutrales
  if (Math.random() < 0.25) { // 25% chance
    events.push('Conociste a otros músicos en un evento');
  }
  
  return events;
}

function getSkillsImprovement(singer: Singer): string[] {
  const improvements: string[] = [];
  
  // Mejora por práctica general
  if (Math.random() < 0.8) improvements.push('voice +1');
  if (Math.random() < 0.7) improvements.push('composition +1');
  
  // Mejora por actividad específica
  if (singer.fame.monthlyListeners > singer.fame.followers * 0.8) {
    // Si tiene buena retención
    if (Math.random() < 0.6) improvements.push('charisma +1');
  }
  
  if (singer.career.momentum > 50) {
    // Si tiene buen momentum
    if (Math.random() < 0.5) improvements.push('performance +1');
  }
  
  return improvements;
}

// UI Helper: Mostrar tiempo en formato mes/año
export function formatGameTime(weeks: number, startYear: number): string {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const months = weeksToMonths(weeks);
  const currentMonth = monthNames[months % 12];
  const currentYear = startYear + Math.floor(months / 12);
  
  return `${currentMonth} ${currentYear}`;
}

// Helper: Convertir 4 semanas a 1 mes para UI
export function getNextMonthButtonLabel(weeks: number): string {
  const nextMonthIndex = (getCurrentMonth(weeks) + 1) % 12;
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return `Avanzar a ${monthNames[nextMonthIndex]}`;
}