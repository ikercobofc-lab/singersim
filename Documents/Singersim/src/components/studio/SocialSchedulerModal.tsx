import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { 
  Share2, 
  Calendar, 
  Clock, 
  Globe, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  X, 
  Send,
  Flame,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleProposed: string;
  projectType: 'cancion' | 'album' | 'ep';
  onScheduledSuccess?: (week: number, time: string, hypeBonus: number) => void;
}

export const SocialSchedulerModal: React.FC<SocialSchedulerModalProps> = ({
  isOpen,
  onClose,
  titleProposed,
  projectType,
  onScheduledSuccess
}) => {
  const { singer } = useGame();

  const [scheduledWeeksAhead, setScheduledWeeksAhead] = useState(2);
  const [baseTime, setBaseTime] = useState('00:00'); // Spain time 00:00 midnight
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'twitter'>('instagram');
  const [customCaption, setCustomCaption] = useState(
    `🚨 OFICIAL: Mi próximo ${projectType === 'cancion' ? 'single' : projectType.toUpperCase()} "${titleProposed}" sale a la luz. Disponible en todas las plataformas a nivel mundial. ¿Listos para el nuevo sonido? Pre-save en la bio 🔗💿`
  );

  if (!isOpen || !singer) return null;

  // Calculate synchronized international timezones based on Spain 00:00 CET
  const targetWeek = singer.careerWeek + scheduledWeeksAhead;

  const timezoneConversions = [
    { country: 'España', flag: '🇪🇸', zone: 'CET', time: '00:00 (Medianoche)', diff: 'Hora Base' },
    { country: 'Argentina', flag: '🇦🇷', zone: 'ART', time: '20:00 (Jueves noche)', diff: '-4h' },
    { country: 'México', flag: '🇲🇽', zone: 'CST', time: '17:00 (Tarde)', diff: '-7h' },
    { country: 'Colombia', flag: '🇨🇴', zone: 'COT', time: '18:00 (Tarde)', diff: '-6h' },
    { country: 'Estados Unidos (NY)', flag: '🇺🇸', zone: 'EST', time: '18:00 (Tarde)', diff: '-6h' },
    { country: 'Chile', flag: '🇨🇱', zone: 'CLT', time: '19:00 (Noche)', diff: '-5h' }
  ];

  const handleLaunchCampaign = () => {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (onScheduledSuccess) {
      onScheduledSuccess(targetWeek, `Viernes ${baseTime} CET`, 35);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-2xl w-full bg-[#14141e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative text-white space-y-5 overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Programador y Anuncio Mundial en Redes
              </h2>
              <p className="text-xs text-slate-400">
                Sincroniza los horarios con tus mayores bases de fans en el mundo y genera expectación masiva.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timing Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Fecha de Estreno en el Calendario
            </label>
            <select
              value={scheduledWeeksAhead}
              onChange={(e) => setScheduledWeeksAhead(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e2c] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value={1}>Próxima Semana (Semana {singer.careerWeek + 1})</option>
              <option value={2}>En 2 Semanas (Semana {singer.careerWeek + 2}) - Hype Óptimo</option>
              <option value={3}>En 3 Semanas (Semana {singer.careerWeek + 3}) - Campaña Internacional</option>
              <option value={4}>En 1 Mes (Semana {singer.careerWeek + 4}) - Máxima Expectación</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Hora Central de Estreno (CET España)
            </label>
            <select
              value={baseTime}
              onChange={(e) => setBaseTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e2c] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="00:00">00:00 (Medianoche Viernes - Estándar Spotify)</option>
              <option value="18:00">18:00 (Prime Time Redes)</option>
              <option value="20:00">20:00 (Noche Española)</option>
            </select>
          </div>
        </div>

        {/* 🌍 SYNCHRONIZED INTERNATIONAL TIMEZONES */}
        <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Horarios Sincronizados en los Países Donde Más Te Siguen</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">Lanzamiento Simultáneo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timezoneConversions.map(tz => (
              <div key={tz.country} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span>{tz.flag}</span>
                  <span className="text-xs font-bold text-white truncate">{tz.country}</span>
                </div>
                <p className="font-mono text-xs font-black text-purple-300">{tz.time}</p>
                <span className="text-[10px] text-slate-500 block">{tz.zone} ({tz.diff})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Announcement Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Anuncio Oficial en Redes Sociales
            </label>

            <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
              {(['instagram', 'tiktok', 'twitter'] as const).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    platform === p ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'twitter' ? 'X / Twitter' : p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={customCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
          />

          {/* Social mockup preview */}
          <div className="p-3.5 rounded-xl bg-[#1a1a26] border border-white/10 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{singer.avatarIcon}</span>
              <div>
                <span className="font-extrabold text-white text-xs">{singer.artistName}</span>
                <span className="text-[10px] text-purple-400 ml-1 font-semibold">✓ Verificado</span>
              </div>
            </div>
            <p className="text-slate-300 text-xs italic">
              "{customCaption}"
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-400" /> 48.2K Me gusta
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> 1,420 comentarios
              </span>
              <span className="text-emerald-400 font-bold ml-auto">
                +35% Pre-Release Hype
              </span>
            </div>
          </div>
        </div>

        {/* CTA Launch */}
        <button
          type="button"
          onClick={handleLaunchCampaign}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          <span>Publicar Anuncio Oficial & Activar Campaña de Pre-Save</span>
        </button>
      </div>
    </div>
  );
};
