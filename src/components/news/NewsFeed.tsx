import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { 
  Newspaper, 
  Flame, 
  MessageCircle, 
  Share2, 
  Heart, 
  AlertCircle, 
  Radio, 
  Sparkles, 
  Search
} from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const { news, rumors, singer } = useGame();
  const [activeSubTab, setActiveSubTab] = useState<'press' | 'rumors'>('press');

  if (!singer) return null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Prensa Musical, Redes & Rumores</h2>
            <p className="text-xs text-slate-400">
              Titulares de medios internacionales y especulaciones de fans sobre tus próximos proyectos.
            </p>
          </div>
        </div>

        {/* Subtab Toggle */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('press')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'press' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Prensa Oficial ({news.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rumors')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'rumors' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Rumores & Filtraciones ({rumors.length})</span>
          </button>
        </div>
      </div>

      {/* PRESS ARTICLES TAB */}
      {activeSubTab === 'press' ? (
        <div className="space-y-3">
          {news.map((item) => {
            const isViral = item.sentiment === 'viral';
            const isControversial = item.sentiment === 'negative';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition shadow-lg relative overflow-hidden ${
                  isViral
                    ? 'bg-gradient-to-br from-cyan-950/40 to-[#161622] border-cyan-500/40 shadow-cyan-500/10'
                    : isControversial
                    ? 'bg-[#1a1418] border-rose-500/30'
                    : 'bg-[#181822] border-white/10 hover:border-white/20'
                }`}
              >
                {isViral && (
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-cyan-400 text-black text-[10px] font-black uppercase tracking-wider rounded-bl-xl flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-black" />
                    <span>VIRAL MUNDIAL</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="font-extrabold text-white px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {item.source}
                  </span>
                  <span className="text-slate-400">• {item.timeAgo}</span>
                  <span className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.category === 'lanzamiento' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.category === 'colaboracion' ? 'bg-purple-500/20 text-purple-400' :
                    item.category === 'premios' ? 'bg-amber-500/20 text-amber-400' :
                    item.category === 'rumores' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <h3 className="font-black text-base sm:text-lg text-white mb-1.5 leading-snug">
                  {item.headline}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.snippet}
                </p>

                {/* Social interaction mockup */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer transition">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{(Math.floor(singer.stats.fans * 0.05) + 420).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer transition">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comentarios</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* RUMORS & FAN SPECULATION TAB */
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-3">
            <Radio className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              Los foros de música, hilos de Reddit y cuentas de TikTok analizan cada uno de tus movimientos. Los rumores aumentan el <strong>Pre-Release Hype</strong> de tus futuros lanzamientos.
            </p>
          </div>

          {rumors.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-400">
              No hay rumores circulando todavía. Cuando prepares álbumes o colabores con productores, los fans empezarán a especular.
            </div>
          ) : (
            rumors.map(rumor => (
              <div key={rumor.id} className="p-5 rounded-2xl bg-[#181822] border border-amber-500/20 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/30">
                      Filtración / Especulación
                    </span>
                    <span className="text-slate-400">{rumor.source} • {rumor.timeAgo}</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-xs">
                    +{rumor.hypeBonus}% Hype
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white">
                  {rumor.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 italic">
                  "{rumor.leakSnippet}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Artista involucrado: <strong className="text-white">{rumor.artistInvolved}</strong></span>
                  <span className="text-amber-400 font-semibold">
                    {rumor.verified ? '✓ Rumor con alta credibilidad' : '🔥 Teoría de fans en TikTok'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
