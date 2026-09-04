import React from 'react';
import { Song } from '../../types';
import { formatNumber, formatCurrency, getCertificationBadge } from '../../utils/formatters';
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  X, 
  Music, 
  Sparkles, 
  Share2, 
  Award,
  DollarSign
} from 'lucide-react';

interface SongMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onLaunchRemix?: (song: Song) => void;
}

export const SongMetricsModal: React.FC<SongMetricsModalProps> = ({
  isOpen,
  onClose,
  song,
  onLaunchRemix
}) => {
  if (!isOpen || !song) return null;

  const total = song.streamsTotal;
  const daily = Math.floor(total * 0.04) + 420;
  const revenue = Math.floor(total * 0.0035);
  const cert = getCertificationBadge(total);

  // Country stream estimates
  const countryBreakdown = [
    { country: 'España', flag: '🇪🇸', pct: 36, streams: Math.floor(total * 0.36) },
    { country: 'México', flag: '🇲🇽', pct: 28, streams: Math.floor(total * 0.28) },
    { country: 'Argentina', flag: '🇦🇷', pct: 18, streams: Math.floor(total * 0.18) },
    { country: 'Colombia', flag: '🇨🇴', pct: 12, streams: Math.floor(total * 0.12) },
    { country: 'Estados Unidos', flag: '🇺🇸', pct: 6, streams: Math.floor(total * 0.06) }
  ];

  const playlistTags = [
    'Éxitos España',
    'Viva Latino',
    'Novedades Viernes',
    'Mansión Reggaetón',
    'Top 50 Viral'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full bg-[#14141e] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-white space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${song.coverColor || 'from-emerald-500 to-teal-700'} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              🎵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white truncate max-w-[240px]">{song.title}</h2>
                {cert.label && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-gradient-to-r ${cert.color}`}>
                    {cert.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Prod. {song.producer} • {song.genre} • Año {song.releaseYear}
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

        {/* Global KPIs */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Streams Totales</span>
            <span className="text-base font-black text-white">{formatNumber(total)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Streams Diarios</span>
            <span className="text-base font-black text-emerald-400">{formatNumber(daily)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingresos Tema</span>
            <span className="text-base font-black text-cyan-400">{formatCurrency(revenue)}</span>
          </div>
        </div>

        {/* Breakdown by Country */}
        <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Distribución Geográfica de Oyentes</span>
          </h3>

          <div className="space-y-2">
            {countryBreakdown.map(item => (
              <div key={item.country} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{item.flag}</span>
                    <span>{item.country}</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatNumber(item.streams)} ({item.pct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playlists in which the track appears */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Playlists Oficiales con Presencia Activa
          </span>
          <div className="flex flex-wrap gap-1.5">
            {playlistTags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[11px] font-semibold">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Remix Action */}
        {onLaunchRemix && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                onClose();
                onLaunchRemix(song);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>🚀 Preparar Remix Oficial de "{song.title}" (+150% Hype)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
