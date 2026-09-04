import React, { useState, useEffect } from 'react';
import { StepSequencerPattern } from '../../types';
import { 
  startSequencerLoop, 
  stopSequencerLoop, 
  playDrumSound 
} from '../../utils/audioSynth';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Disc, 
  Volume2, 
  Wand2 
} from 'lucide-react';

interface BeatSequencerProps {
  initialBpm?: number;
  onApplyBeat?: (pattern: StepSequencerPattern, bpm: number) => void;
}

const PRESETS: Record<string, StepSequencerPattern> = {
  'Reggaeton 2026 (Dembow)': {
    kick:    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare:   [false, false, false, true, false, false, true, false, false, false, false, true, false, false, true, false],
    hihat:   [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    bass808: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
    melody:  [true, false, false, true, false, true, false, false, true, false, false, true, false, true, false, false]
  },
  'Trap Pesado (808s & Hats)': {
    kick:    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    snare:   [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat:   [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    bass808: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    melody:  [true, false, false, false, false, true, false, false, false, false, true, false, false, false, true, false]
  },
  'Pop / Club (Four-on-Floor)': {
    kick:    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare:   [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat:   [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    bass808: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    melody:  [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false]
  },
  'Boom Bap 90s Clásico': {
    kick:    [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
    snare:   [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat:   [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    bass808: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
    melody:  [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
  }
};

export const BeatSequencer: React.FC<BeatSequencerProps> = ({ initialBpm = 96, onApplyBeat }) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);

  const [pattern, setPattern] = useState<StepSequencerPattern>(PRESETS['Reggaeton 2026 (Dembow)']);

  // Stop loop on unmount
  useEffect(() => {
    return () => {
      stopSequencerLoop();
    };
  }, []);

  const toggleStep = (track: keyof StepSequencerPattern, stepIndex: number) => {
    setPattern(prev => {
      const updatedTrack = [...prev[track]];
      updatedTrack[stepIndex] = !updatedTrack[stepIndex];
      // Audition on activation
      if (updatedTrack[stepIndex]) {
        playDrumSound(track);
      }
      return {
        ...prev,
        [track]: updatedTrack
      };
    });
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopSequencerLoop();
      setIsPlaying(false);
      setActiveStep(-1);
    } else {
      setIsPlaying(true);
      startSequencerLoop(pattern, bpm, [261.63, 311.13, 392.00, 466.16], (step) => {
        setActiveStep(step);
      });
    }
  };

  // Restart loop if playing when pattern or BPM changes
  useEffect(() => {
    if (isPlaying) {
      startSequencerLoop(pattern, bpm, [261.63, 311.13, 392.00, 466.16], (step) => {
        setActiveStep(step);
      });
    }
  }, [pattern, bpm]);

  const loadPreset = (presetName: string) => {
    if (PRESETS[presetName]) {
      setPattern(PRESETS[presetName]);
    }
  };

  const clearPattern = () => {
    setPattern({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      bass808: Array(16).fill(false),
      melody: Array(16).fill(false)
    });
  };

  const tracks: { key: keyof StepSequencerPattern; label: string; icon: string; color: string }[] = [
    { key: 'kick', label: 'Kick / Bombo', icon: '🥁', color: 'bg-orange-500' },
    { key: 'snare', label: 'Clap / Caja', icon: '👏', color: 'bg-rose-500' },
    { key: 'hihat', label: 'Hi-Hats', icon: '🎩', color: 'bg-yellow-400' },
    { key: 'bass808', label: 'Sub 808 Bass', icon: '🔊', color: 'bg-cyan-400' },
    { key: 'melody', label: 'Synth Melodía', icon: '🎹', color: 'bg-emerald-400' }
  ];

  return (
    <div className="bg-[#12121a] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
            🎛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">FL Studio Mode • Step Sequencer 16 Steps</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                Avanzado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Programa tus propios ritmos golpe a golpe, activa pads y escucha tu patrón en loop continuo.
            </p>
          </div>
        </div>

        {/* Master Play / Stop & BPM */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePlayToggle}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition active:scale-95 shadow-lg ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-black" />}
            <span>{isPlaying ? 'Detener Loop' : '▶ Reproducir Loop'}</span>
          </button>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400 font-bold">BPM:</span>
            <input
              type="number"
              min={60}
              max={160}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-14 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-center font-mono font-bold text-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/30 p-2.5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Presets:
          </span>
          {Object.keys(PRESETS).map(name => (
            <button
              type="button"
              key={name}
              onClick={() => loadPreset(name)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/5 transition"
            >
              {name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={clearPattern}
          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-bold transition flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpiar Matriz</span>
        </button>
      </div>

      {/* Step Indicator Bar (1..16) */}
      <div className="space-y-2">
        <div className="grid grid-cols-16 gap-1 pl-32 sm:pl-40 pr-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all text-center ${
                activeStep === i
                  ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                  : i % 4 === 0
                  ? 'bg-white/30'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* 16-Step Channel Matrix */}
        <div className="space-y-2.5">
          {tracks.map(track => (
            <div key={track.key} className="flex items-center gap-2">
              
              {/* Track Audition Header */}
              <button
                type="button"
                onClick={() => playDrumSound(track.key)}
                className="w-32 sm:w-40 px-2.5 py-2 rounded-xl bg-black/50 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition shrink-0 group"
                title="Haz clic para probar este sonido"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{track.icon}</span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate">
                    {track.label}
                  </span>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </button>

              {/* 16 Step Pads */}
              <div className="grid grid-cols-16 gap-1 flex-1">
                {pattern[track.key].map((isOn, stepIndex) => {
                  const isBeatStart = stepIndex % 4 === 0;
                  const isCurrent = activeStep === stepIndex;

                  return (
                    <button
                      type="button"
                      key={stepIndex}
                      onClick={() => toggleStep(track.key, stepIndex)}
                      className={`h-9 rounded-lg transition-all border flex items-center justify-center relative ${
                        isOn
                          ? `${track.color} border-white shadow-md scale-95`
                          : isBeatStart
                          ? 'bg-[#1e1e2c] border-white/15 hover:border-white/30'
                          : 'bg-[#161622] border-white/5 hover:border-white/20'
                      } ${
                        isCurrent ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-black' : ''
                      }`}
                    >
                      {isOn && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Apply Button */}
      {onApplyBeat && (
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            ✓ Los cambios en este beat se incorporarán al sonido final de tu canción.
          </p>

          <button
            type="button"
            onClick={() => onApplyBeat(pattern, bpm)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Aplicar Beat Personalizado a la Canción</span>
          </button>
        </div>
      )}
    </div>
  );
};
