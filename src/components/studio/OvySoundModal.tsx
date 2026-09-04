import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Zap, Flame, X, Disc, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OvySoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OvySoundModal: React.FC<OvySoundModalProps> = ({ isOpen, onClose }) => {
  const { singer, triggerOvyWSound } = useGame();

  const [beatVibe, setBeatVibe] = useState('Reggaeton Melódico Medellín (Estilo Provenza / Cairo)');
  const [vocalMood, setVocalMood] = useState('Letra de desamor con nostalgia y ritmo bailable');
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen || !singer) return null;

  const handleRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      triggerOvyWSound({
        vibe: beatVibe,
        mood: vocalMood
      });
      confetti({
        particleCount: 200,
        spread: 110,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#ffffff']
      });
      setIsRecording(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-[#121008] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden text-white">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3">
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Medellín Hit Studio • Los W Sounds</span>
          </div>

          <div className="text-4xl mb-2">🥁 🎧 ✨</div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400">
            OVY ON THE DRUMS: W SOUND #01
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Ovy On The Drums te ha invitado formalmente a grabar su legendaria serie exclusiva <strong>"W Sound"</strong> con el mítico tag <em>"O-O-Ovy On The Drums"</em>.
            <strong className="text-amber-400 block mt-1">¡Solo puedes grabar esta sesión de productor una única vez en toda tu carrera!</strong>
          </p>
        </div>

        <div className="space-y-4">
          {/* Beat Selection */}
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              1. Selecciona el Sonido W con Ovy
            </label>
            <div className="space-y-2">
              {[
                { name: 'Reggaeton Melódico Medellín (Estilo Provenza / Cairo)', desc: 'Baterías limpias, guitarra playera y estribillo inolvidable para el verano' },
                { name: 'Afrobeat Urbano y Sintetizadores', desc: 'Bajo envolvente y ritmo internacional bailable de discoteca' },
                { name: 'Pop Electrónico Acelerado', desc: 'Sintetizadores eufóricos y drop bailable para estadios' }
              ].map(b => (
                <button
                  type="button"
                  key={b.name}
                  onClick={() => setBeatVibe(b.name)}
                  className={`w-full p-3 rounded-xl border text-left transition ${
                    beatVibe === b.name
                      ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold">{b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              2. Dirección Vocal & Sentimiento
            </label>
            <div className="space-y-1.5">
              {[
                'Letra de desamor con nostalgia y ritmo bailable',
                'Historia de amor de verano con gancho pegajoso',
                'Fiesta nocturna descontrolada en Medellín'
              ].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setVocalMood(m)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition ${
                    vocalMood === m
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ {m}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-3">
            <button
              onClick={handleRecord}
              disabled={isRecording}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-300 text-black font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition active:scale-[0.99]"
            >
              {isRecording ? (
                <>
                  <Disc className="w-5 h-5 animate-spin" />
                  <span>"O-O-Ovy On The Drums"... Grabando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-black" />
                  <span>Grabar la W Sound Oficial con Ovy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
