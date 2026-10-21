import { MelodyCustomization, StepSequencerPattern } from '../types';

let audioCtx: AudioContext | null = null;
let activeTimeouts: number[] = [];
let sequencerInterval: number | null = null;
let previewInterval: number | null = null;
let isLoopRunning = false;
let isPreviewRunning = false;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const stopAudioPreview = () => {
  activeTimeouts.forEach(t => clearTimeout(t));
  activeTimeouts = [];
  if (previewInterval !== null) {
    clearInterval(previewInterval);
    previewInterval = null;
  }
  isPreviewRunning = false;
  stopSequencerLoop();
};

// ----------------------------------------------------
// NOTE FREQUENCIES (Hz)
// ----------------------------------------------------
export const NOTES = {
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, C6: 1046.50
};

// ----------------------------------------------------
// DISTINCT INSTRUMENT SOUND SYNTHESIZER
// ----------------------------------------------------
export const playInstrumentNote = (instrumentName: string, freq: number, duration: number = 0.35) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (instrumentName.includes('Guitarra')) {
    // 🎸 Guitarra Española Acústica: Triangle wave + bright transient pluck + fast warm decay
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Fast acoustic pluck filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.15);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // Subtle transient click on string pluck
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(freq * 3, now);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.03);

  } else if (instrumentName.includes('Piano')) {
    // 🎹 Piano Melancólico: Rich dual-oscillator (sine fundamental + harmonic overtone) with gentle sustain
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    gain1.gain.setValueAtTime(0.55, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + duration * 1.2);
    osc2.start(now);
    osc2.stop(now + duration * 0.4);

  } else if (instrumentName.includes('Pluck')) {
    // 🌴 Pluck Trap Caribeño: Ultra-percussive, short pitch-dive sine/square with high resonance
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq * 1.2, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.5, now);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

  } else if (instrumentName.includes('Cuerdas')) {
    // 🎻 Cuerdas Orquestales Cinemáticas: Dual detuned sawtooth with soft attack & long lush body
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.008, now); // Warm chorus detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // Soft orchestral attack
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + duration * 1.4);
    osc2.start(now);
    osc2.stop(now + duration * 1.4);

  } else {
    // 🎛️ Sintetizador 80s: Vintage analog sawtooth with sweeping filter
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
};

// ----------------------------------------------------
// DISTINCT BASS SYNTHESIZER
// ----------------------------------------------------
export const playBassNote = (bassType: string, noteFreq: number) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const baseFreq = noteFreq || 55;

  if (bassType.includes('Slap')) {
    // 🎸 Bajo Eléctrico Slap: Square wave with high-mid resonant bite
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

  } else if (bassType.includes('Moog')) {
    // 🎹 Moog Bassline: Punchy sawtooth with snappy resonant envelope
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);

  } else if (bassType.includes('Subgrave')) {
    // 🔊 Subgrave Limpio 40Hz: Deep fundamental pure sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.min(65, baseFreq), now);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

  } else {
    // 💥 808 Glide Distorsionado: Classic trap sliding 808 with punch and mild saturation
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.09);

    gain.gain.setValueAtTime(0.95, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }
};

// ----------------------------------------------------
// DRUM SOUNDS (KICK, SNARE, HIHAT)
// ----------------------------------------------------
export const playDrumSound = (type: 'kick' | 'snare' | 'hihat' | 'bass808' | 'melody', noteFreq?: number) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (type) {
    case 'kick': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    }

    case 'snare': {
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.18);

      // Body snap
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }

    case 'hihat': {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / buffer.length);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      break;
    }

    case 'bass808': {
      playBassNote('808 Glide Distorsionado', noteFreq || 55);
      break;
    }

    case 'melody': {
      playInstrumentNote('Sintetizador Analógico 80s', noteFreq || 440);
      break;
    }
  }
};

// ----------------------------------------------------
// 16-STEP FL STUDIO SEQUENCER ENGINE (LOOP PLAYBACK)
// ----------------------------------------------------
export const startSequencerLoop = (
  pattern: StepSequencerPattern,
  bpm: number,
  melodyNotes: number[] = [NOTES.C4, NOTES.Eb4, NOTES.G4, NOTES.Bb4],
  onStepChange: (currentStep: number) => void
) => {
  stopAudioPreview();
  isLoopRunning = true;

  const secondsPerBeat = 60 / bpm;
  const stepDurationMs = (secondsPerBeat / 4) * 1000;
  let currentStep = 0;

  const stepFunction = () => {
    if (!isLoopRunning) return;

    onStepChange(currentStep);

    if (pattern.kick[currentStep]) {
      playDrumSound('kick');
    }
    if (pattern.snare[currentStep]) {
      playDrumSound('snare');
    }
    if (pattern.hihat[currentStep]) {
      playDrumSound('hihat');
    }
    if (pattern.bass808[currentStep]) {
      const bassRoots = [NOTES.C2, NOTES.Ab2, NOTES.Eb2, NOTES.Bb2];
      const bassNote = bassRoots[Math.floor(currentStep / 4) % bassRoots.length];
      playBassNote('808 Glide', bassNote);
    }
    if (pattern.melody[currentStep]) {
      const note = melodyNotes[currentStep % melodyNotes.length];
      playInstrumentNote('Pluck Trap Caribeño', note, 0.22);
    }

    currentStep = (currentStep + 1) % 16;
  };

  stepFunction();
  sequencerInterval = window.setInterval(stepFunction, stepDurationMs);
};

export const stopSequencerLoop = () => {
  isLoopRunning = false;
  if (sequencerInterval !== null) {
    clearInterval(sequencerInterval);
    sequencerInterval = null;
  }
};

// ----------------------------------------------------
// DIVERSE REALISTIC MUSICAL RIFFS & RHYTHMS PER KEY & GENRE
// ----------------------------------------------------
interface KeyPreset {
  bassRoot: number;
  // Unique melody note sequence
  riffs: {
    dembow: number[];
    drill: number[];
    pop: number[];
    classic: number[];
  };
}

const MUSICAL_KEY_DATA: Record<string, KeyPreset> = {
  'Do Menor (Melancólico)': {
    bassRoot: NOTES.C2,
    riffs: {
      dembow: [NOTES.C4, NOTES.Eb4, NOTES.G4, NOTES.C5, NOTES.Bb4, NOTES.G4],
      drill: [NOTES.C5, NOTES.Eb5, NOTES.D5, NOTES.Bb4, NOTES.G4, NOTES.C4],
      pop: [NOTES.C4, NOTES.G4, NOTES.Eb4, NOTES.Bb4, NOTES.C5, NOTES.Eb5],
      classic: [NOTES.C4, NOTES.Eb4, NOTES.G4, NOTES.Bb4, NOTES.Ab4, NOTES.G4]
    }
  },
  'La Menor (Tristeza Profunda)': {
    bassRoot: NOTES.A2,
    riffs: {
      dembow: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.A4, NOTES.G4, NOTES.E4],
      drill: [NOTES.A4, NOTES.C5, NOTES.B4, NOTES.G4, NOTES.F4, NOTES.E4],
      pop: [NOTES.A3, NOTES.E4, NOTES.C4, NOTES.G4, NOTES.A4, NOTES.C5],
      classic: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.F4, NOTES.E4, NOTES.D4]
    }
  },
  'Sol Mayor (Enérgico / Épico)': {
    bassRoot: NOTES.G2,
    riffs: {
      dembow: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.G4, NOTES.E4, NOTES.D4],
      drill: [NOTES.G4, NOTES.B4, NOTES.A4, NOTES.E4, NOTES.D4, NOTES.G3],
      pop: [NOTES.G3, NOTES.D4, NOTES.B3, NOTES.E4, NOTES.G4, NOTES.B4],
      classic: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.E4, NOTES.G4, NOTES.A4]
    }
  },
  'Re Menor (Oscuro / Trap)': {
    bassRoot: NOTES.D2,
    riffs: {
      dembow: [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5, NOTES.C5, NOTES.A4],
      drill: [NOTES.D5, NOTES.F5, NOTES.E5, NOTES.C5, NOTES.Bb4, NOTES.A4],
      pop: [NOTES.D4, NOTES.A4, NOTES.F4, NOTES.C5, NOTES.D5, NOTES.F5],
      classic: [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.Bb4, NOTES.A4, NOTES.F4]
    }
  },
  'Mi Menor (Pop / Bailable)': {
    bassRoot: NOTES.E2,
    riffs: {
      dembow: [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5, NOTES.D5, NOTES.B4],
      drill: [NOTES.E5, NOTES.G5, NOTES.F5 || NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4],
      pop: [NOTES.E4, NOTES.B4, NOTES.G4, NOTES.D5, NOTES.E5, NOTES.G5],
      classic: [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.D5, NOTES.C5, NOTES.B4]
    }
  }
};

// ----------------------------------------------------
// FULL DYNAMIC & REACTIVE PREVIEW PLAYER
// ----------------------------------------------------
export const playMelodyPreview = (
  config: MelodyCustomization,
  onComplete?: () => void
) => {
  stopAudioPreview();
  const ctx = getAudioContext();

  const secondsPerBeat = 60 / config.bpm;
  const sixteenth = secondsPerBeat / 4;

  const keyData = MUSICAL_KEY_DATA[config.musicalKey] || MUSICAL_KEY_DATA['Do Menor (Melancólico)'];

  // Select genre riff according to drum pattern
  const isDembow = config.drumPattern.includes('Dembow');
  const isDrill = config.drumPattern.includes('Drill');
  const isPop = config.drumPattern.includes('Four-on-the-Floor');

  const activeRiff = isDembow 
    ? keyData.riffs.dembow 
    : isDrill 
    ? keyData.riffs.drill 
    : isPop 
    ? keyData.riffs.pop 
    : keyData.riffs.classic;

  // Schedule the 16-step bar
  for (let step = 0; step < 16; step++) {
    const stepTime = step * sixteenth * 1000;

    const t = window.setTimeout(() => {
      // 1. DRUMS (Rhythm varies completely by chosen style)
      if (isDembow) {
        // Authentic Dembow 3-3-2: Kicks on 0, 4, 8, 12; Snares on 3, 6, 11, 14
        if (step % 4 === 0) playDrumSound('kick');
        if (step === 3 || step === 6 || step === 11 || step === 14) playDrumSound('snare');
        if (step % 2 === 0) playDrumSound('hihat');
      } else if (isDrill) {
        // Drill: Kicks on 0, 8; Snares on 6, 14; Triplet hats
        if (step === 0 || step === 8) playDrumSound('kick');
        if (step === 6 || step === 14) playDrumSound('snare');
        if (step % 2 === 0 || step === 7 || step === 15) playDrumSound('hihat');
      } else if (isPop) {
        // 4-on-the-floor: Kick on every quarter beat, clap on 4 & 12
        if (step % 4 === 0) playDrumSound('kick');
        if (step === 4 || step === 12) playDrumSound('snare');
        if (step % 2 === 1) playDrumSound('hihat');
      } else {
        // Boom-Bap 90s: Kick on 0, 10; Snare on 4, 12; Swung hats
        if (step === 0 || step === 10) playDrumSound('kick');
        if (step === 4 || step === 12) playDrumSound('snare');
        if (step % 2 === 0) playDrumSound('hihat');
      }

      // 2. BASS (Uses specific selected bass sound + melodic root movement)
      if (isDembow) {
        // Dembow bass follows the syncopation (0, 3, 8, 11)
        if (step === 0 || step === 3 || step === 8 || step === 11) {
          const pitch = step >= 8 ? keyData.bassRoot * 1.33 : keyData.bassRoot;
          playBassNote(config.bassType, pitch);
        }
      } else if (isDrill) {
        // Drill deep sliding 808
        if (step === 0 || step === 8) {
          playBassNote(config.bassType, keyData.bassRoot);
        }
      } else {
        // Pop / Classic walking bassline
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          const root = step >= 8 ? keyData.bassRoot * 1.25 : keyData.bassRoot;
          playBassNote(config.bassType, root);
        }
      }

      // 3. MELODY (Uses exact selected instrument timbre and rhythmic placement!)
      if (isDembow) {
        // Dembow melody syncopates with the groove (steps 0, 3, 6, 8, 11, 14)
        if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
          const noteIndex = Math.floor(step / 3) % activeRiff.length;
          playInstrumentNote(config.melodyInstrument, activeRiff[noteIndex], 0.25);
        }
      } else if (isDrill) {
        // Drill melody plays eerie accents (steps 0, 4, 7, 10, 13)
        if (step === 0 || step === 4 || step === 7 || step === 10 || step === 13) {
          const noteIndex = Math.floor(step / 3) % activeRiff.length;
          playInstrumentNote(config.melodyInstrument, activeRiff[noteIndex], 0.35);
        }
      } else if (isPop) {
        // Pop arpeggio runs on every 16th or 8th note
        if (step % 2 === 0) {
          const noteIndex = (step / 2) % activeRiff.length;
          playInstrumentNote(config.melodyInstrument, activeRiff[noteIndex], 0.2);
        }
      } else {
        // Classic melody
        if (step === 0 || step === 3 || step === 6 || step === 10 || step === 14) {
          const noteIndex = Math.floor(step / 3) % activeRiff.length;
          playInstrumentNote(config.melodyInstrument, activeRiff[noteIndex], 0.3);
        }
      }

    }, stepTime);

    activeTimeouts.push(t);
  }

  // Complete after 16-step bar finishes
  const totalDurationMs = 16 * sixteenth * 1000 + 200;
  const finishTimeout = window.setTimeout(() => {
    if (onComplete) onComplete();
  }, totalDurationMs);
  activeTimeouts.push(finishTimeout);
};

// ----------------------------------------------------
// AI VOCAL SINGING ENGINE (SYNTHESIZES VOICE OVER BEAT)
// ----------------------------------------------------
export const singLyricsWithBeat = (
  lyricsText: string,
  config: MelodyCustomization,
  onComplete?: () => void
) => {
  stopAudioPreview();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. Play the music beat in the background
  playMelodyPreview(config);

  // 2. Synthesize singing vocal over the track
  if ('speechSynthesis' in window && lyricsText.trim().length > 0) {
    const utterance = new SpeechSynthesisUtterance(lyricsText);
    
    // Choose Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES')) || voices[0];
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    // Dynamic pitch and rate based on BPM and musical key
    const pitchMap: Record<string, number> = {
      'Do Menor (Melancólico)': 0.95,
      'La Menor (Tristeza Profunda)': 0.88,
      'Sol Mayor (Enérgico / Épico)': 1.25,
      'Re Menor (Oscuro / Trap)': 0.82,
      'Mi Menor (Pop / Bailable)': 1.15
    };
    utterance.pitch = pitchMap[config.musicalKey] || 1.0;
    utterance.rate = Math.max(0.85, Math.min(1.3, config.bpm / 105)); // Follows BPM

    utterance.onend = () => {
      if (onComplete) onComplete();
    };
    utterance.onerror = () => {
      if (onComplete) onComplete();
    };

    // Delay vocal by half a bar so the beat drops first!
    const delay = ((60 / config.bpm) * 2) * 1000;
    const vocalTimer = window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, delay);
    activeTimeouts.push(vocalTimer);
  } else {
    if (onComplete) onComplete();
  }
};

