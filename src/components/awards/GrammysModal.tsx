import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Award as AwardIcon, Sparkles, Star } from 'lucide-react';

export const GrammysModal: React.FC = () => {
  const { awards, singer } = useGame();

  if (!singer) return null;

  return (
    <div className="space-y-6">
      {/* Trophy Showcase Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#181822] to-[#181822] border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 text-black">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Vitrina de Premios & Grammys</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                Gala Anual
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Las estatuillas que certifican tu impacto en la historia musical mundial. Los Grammys se celebran cada final de año (Semana 52).
            </p>
          </div>
        </div>

        <div className="text-right bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
          <span className="text-xs text-slate-400 block font-bold">Total Galardones</span>
          <span className="text-xl font-black text-amber-400">{awards.length} Trofeos</span>
        </div>
      </div>

      {/* Trophy Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tus Galardones Oficiales</h3>

        {awards.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-2">
            <Trophy className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
            <p className="text-sm text-slate-300 font-semibold">Tu vitrina de trofeos está vacía por ahora.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Lanza canciones con millones de streams y álbumes con altas puntuaciones de la crítica. Al finalizar el año musical, competirás en los Grammys y Latin Grammys.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map(award => (
              <div
                key={award.id}
                className="bg-[#1a1a24] border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                    {award.trophyIcon}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                      Año {award.year}
                    </span>
                    <h4 className="font-extrabold text-sm text-white">{award.name}</h4>
                    <p className="text-xs text-purple-300 font-semibold">{award.category}</p>
                  </div>
                </div>

                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                  <span>Obra galardonada:</span>
                  <strong className="text-white truncate max-w-[150px]">"{award.songOrAlbumTitle}"</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Milestones */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>Hitos y Leyendas Musicales</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-slate-400 block text-[10px]">Sesión con Bizarrap</span>
            <span className={`font-bold text-sm ${singer.bzrpSessionCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
              {singer.bzrpSessionCompleted ? '✅ Grabada y #1 Global' : '⏳ Pendiente de Fama'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-slate-400 block text-[10px]">Álbumes Publicados</span>
            <span className="font-bold text-sm text-purple-400">
              {singer.careerWeek > 0 ? `${awards.length} Galardones Ganados` : '0'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-slate-400 block text-[10px]">Status en la Industria</span>
            <span className="font-bold text-sm text-cyan-400">
              {singer.stats.reputation >= 80 ? '👑 Leyenda Viva' : singer.stats.reputation >= 50 ? '🌟 Estrella Consagrada' : '🎤 Artista Promesa'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
