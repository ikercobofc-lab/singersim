import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Radio, Music, Flame, Award, Users, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BigOneCrossoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  crossoverNumber?: number;
  suggestedPartner?: string;
}

const PARTNER_OPTIONS = [
  { name: 'Tiago PZK', avatar: '🎙️', tag: 'Melodía & Sentimiento' },
  { name: 'FMK', avatar: '✍️', tag: 'Letrista & Flow Romántico' },
  { name: 'Ke Personajes (Emanuel Noir)', avatar: '🧢', tag: 'Cumbia Sentida & Desgarradora' },
  { name: 'Luck Ra', avatar: '🍾', tag: 'Cuarteto Pop de Fiesta' },
  { name: 'Callejero Fino', avatar: '⚡', tag: 'RKT Callejero & Discoteca' }
];

const VIBES = [
  { id: 'cumbia', label: 'Cumbia / RKT Sentimental', desc: 'Bajo envolvente, güiro cumbiero y gancho romántico desgarrador' },
  { id: 'cuarteto', label: 'Cuarteto Pop / Fiesta', desc: 'Piano veloz, ritmo bailable de Córdoba y estribillo eufórico' },
  { id: 'trap', label: 'Trap Melódico & Nostalgia', desc: '808s profundos, sintetizadores nocturnos y barras introspectivas' }
];

export const BigOneCrossoverModal: React.FC<BigOneCrossoverModalProps> = ({
  isOpen,
  onClose,
  crossoverNumber = 8,
  suggestedPartner
}) => {
  const { singer, triggerBigOneCrossover } = useGame();

  const [title, setTitle] = useState('');
  const [partnerArtist, setPartnerArtist] = useState(suggestedPartner || PARTNER_OPTIONS[0].name);
  const [selectedVibe, setSelectedVibe] = useState(VIBES[0].id);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen || !singer) return null;

  const handleRecordCrossover = () => {
    if (!title.trim()) {
      alert('Por favor, ingresa el título del tema para el Crossover.');
      return;
    }

    setIsRecording(true);
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 }
    });

    setTimeout(() => {
      triggerBigOneCrossover({
        title: title.trim(),
        partnerArtist,
        vibe: selectedVibe,
        crossoverNumber
      });
      setIsRecording(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-[#13121d] border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(99,102,241,0.3)] relative text-white space-y-6 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>BIG ONE • ESTUDIO EXCLUSIVO</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
              CROSSOVER #{crossoverNumber < 10 ? `0${crossoverNumber}` : crossoverNumber}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Hero */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🎛️
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Big One te invita a su Crossover Oficial</h2>
            <p className="text-xs text-indigo-300 font-semibold mt-0.5">
              "Si este no es el Crossover... ¿entonces cuál es?"
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              La saga de juntes más exitosa de la música latina. Un junte estelar único en tu carrera con otro cantante de élite.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Song Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Título del Crossover *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Un Finde, En la Intimidad, Lágrimas, Mentiras..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-semibold transition"
            />
          </div>

          {/* Partner Artist Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cantante Coprotagonista (Junte en Pareja)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PARTNER_OPTIONS.map(p => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setPartnerArtist(p.name)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition text-xs ${
                    partnerArtist === p.name
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{p.avatar}</span>
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-indigo-300 truncate">{p.tag}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Musical Vibe Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Estilo de Beat & Ritmo Big One</span>
            </label>
            <div className="space-y-1.5">
              {VIBES.map(v => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setSelectedVibe(v.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                    selectedVibe === v.id
                      ? 'bg-blue-600/25 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{v.label}</p>
                    <p className="text-[10px] text-slate-400">{v.desc}</p>
                  </div>
                  {selectedVibe === v.id && (
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRecordCrossover}
            disabled={isRecording}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition active:scale-95"
          >
            <Flame className="w-4 h-4" />
            <span>
              {isRecording 
                ? 'Grabando con Big One en el Estudio...' 
                : `¡Grabar y Estrenar Crossover #${crossoverNumber < 10 ? `0${crossoverNumber}` : crossoverNumber}!`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
