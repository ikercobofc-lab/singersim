import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Zap, Flame, X, Disc, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BzrpSessionModal: React.FC = () => {
  const { singer, isBzrpOpen, setIsBzrpOpen, triggerBzrpSession } = useGame();

  const [beatStyle, setBeatStyle] = useState('Trap Pesado 808s');
  const [punchlineFocus, setPunchlineFocus] = useState('Tiradera a haters y a los que no creyeron');
  const [isRecording, setIsRecording] = useState(false);

  if (!isBzrpOpen || !singer) return null;

  const handleRecordSession = () => {
    setIsRecording(true);
    setTimeout(() => {
      triggerBzrpSession({
        title: `BZRP Music Session`,
        style: beatStyle,
        punchlineFocus
      });
      confetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#00d2ff', '#39ff14', '#ffffff']
      });
      setIsRecording(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-[#0a0c10] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,210,255,0.25)] relative overflow-hidden text-white">
        
        {/* Neon blue and green studio lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsBzrpOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with BZRP Vibe */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-widest uppercase mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Estudio BZRP • Buenos Aires</span>
          </div>

          <div className="text-4xl mb-2">🧢 🕶️ 🎛️</div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
            BIZARRAP MUSIC SESSION
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Has alcanzado el estatus de superestrella. Bizarrap te ha invitado a su mítico home studio azul para grabar la session que definirá tu carrera.
            <strong className="text-cyan-300 block mt-1">¡Solo tienes una oportunidad en toda tu carrera para este evento histórico!</strong>
          </p>
        </div>

        <div className="space-y-4">
          {/* Beat Selection */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
              1. Selecciona el Tipo de Beat con Bizarrap
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'Trap Pesado 808s', desc: 'Bajos que revientan altavoces y bombo seco clásico' },
                { name: 'EDM / Dance Drop', desc: 'Sintetizadores eufóricos listos para festivales globales' },
                { name: 'Boombap Freestyle', desc: 'Rima cruda noventera para puristas de las letras' },
                { name: 'Reggaeton Oscuro', desc: 'Bajo envolvente para romper discotecas a las 4 AM' }
              ].map(b => (
                <button
                  type="button"
                  key={b.name}
                  onClick={() => setBeatStyle(b.name)}
                  className={`p-3 rounded-xl border text-left transition ${
                    beatStyle === b.name
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold">{b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Lyrics Theme */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
              2. Enfoque de las Barras & Tiradera
            </label>
            <div className="space-y-1.5">
              {[
                'Tiradera a haters y a los que no creyeron en mis inicios',
                'Desahogo visceral sobre desamor y traición personal',
                'Crítica feroz a los contratos abusivos de la industria musical',
                'Ego-trip monumental: soy el número uno y nadie me frena'
              ].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPunchlineFocus(p)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition ${
                    punchlineFocus === p
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ {p}
                </button>
              ))}
            </div>
          </div>

          {/* Record CTA */}
          <div className="pt-3">
            <button
              onClick={handleRecordSession}
              disabled={isRecording}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,210,255,0.4)] transition active:scale-[0.99]"
            >
              {isRecording ? (
                <>
                  <Disc className="w-5 h-5 animate-spin" />
                  <span>Grabando y Masterizando con Biza...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black" />
                  <span>Soltar las Barras y Romper el Mundo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
