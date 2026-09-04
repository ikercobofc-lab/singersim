import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, getCertificationBadge } from '../../utils/formatters';
import { 
  Flame, 
  Disc, 
  Music, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  Mail, 
  ChevronRight, 
  Radio, 
  Zap, 
  Sliders,
  BarChart2
} from 'lucide-react';
import { SongMetricsModal } from '../studio/SongMetricsModal';
import { Song } from '../../types';

export const HomeDashboard: React.FC = () => {
  const { 
    singer, 
    discography, 
    albums, 
    setActiveTab, 
    bzrpEligible, 
    setIsBzrpOpen, 
    setEurovisionModalOpen, 
    inbox, 
    news 
  } = useGame();

  const [selectedSongForMetrics, setSelectedSongForMetrics] = useState<Song | null>(null);

  if (!singer) return null;

  const pendingDms = inbox.filter(m => m.status === 'pending');
  const recentSongs = discography.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Artist Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900/40 via-[#181824] to-[#14141d] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-emerald-500/20 border-2 border-white/20 shrink-0">
              {singer.avatarIcon || '🎤'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  {singer.genre}
                </span>
                <span className="text-xs text-slate-400">
                  {singer.nationality} • {singer.age} años
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {singer.artistName}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2">
                "{singer.bio}"
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {bzrpEligible && (
              <button
                onClick={() => setIsBzrpOpen(true)}
                className="animate-bounce-short px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>GRABAR BZRP SESSION</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('studio')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Music className="w-4 h-4" />
              <span>Grabar Nuevo Single</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-xs flex items-center gap-2 transition"
            >
              <span>🎧 Rankings Spotify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats and Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Musical Skills Breakdown */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Habilidades Vocales & Artísticas</span>
            </h3>
            <span className="text-xs text-slate-400">Nivel de Talento</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Voice */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-300">Voz & Afinación Técnica</span>
                <span className="text-emerald-400">{singer.stats.voice}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${singer.stats.voice}%` }} />
              </div>
            </div>

            {/* Composition */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-300">Composición & Letras</span>
                <span className="text-cyan-400">{singer.stats.composition}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${singer.stats.composition}%` }} />
              </div>
            </div>

            {/* Flow & Rhythm */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-300">Flow & Métrica Rítmica</span>
                <span className="text-purple-400">{singer.stats.flow}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${singer.stats.flow}%` }} />
              </div>
            </div>

            {/* Charisma */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-300">Carisma & Puesta en Escena</span>
                <span className="text-amber-400">{singer.stats.charisma}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${singer.stats.charisma}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Collabs and News Digest */}
        <div className="space-y-4">
          {/* Pending Collaboration Card */}
          {pendingDms.length > 0 ? (
            <div className="bg-gradient-to-br from-purple-950/40 to-[#181824] border border-purple-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg border border-purple-500/30">
                  {pendingDms[0].fromArtist.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{pendingDms[0].fromArtist.name} te ha escrito</h4>
                  <p className="text-xs text-purple-300">Propuesta de featuring pendiente en tus DMs</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
              >
                Ver DM
              </button>
            </div>
          ) : (
            <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Bandeja de DMs al día</h4>
                  <p className="text-xs text-slate-400">No tienes propuestas de colaboraciones pendientes.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Abrir buzón
              </button>
            </div>
          )}

          {/* Quick News Headline */}
          {news.length > 0 && (
            <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-cyan-400">Última Noticia de Prensa</span>
                <span>{news[0].timeAgo}</span>
              </div>
              <p className="font-bold text-sm text-white line-clamp-2">
                {news[0].headline}
              </p>
              <div className="pt-1 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{news[0].source}</span>
                <button
                  onClick={() => setActiveTab('news')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Leer prensa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discography Preview */}
      <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Últimos Lanzamientos ({discography.length} Canciones)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('studio')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>Ir al Estudio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSongs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Aún no has lanzado canciones. Entra al Estudio para estrenar tu primer sencillo.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentSongs.map(song => {
              const cert = getCertificationBadge(song.streamsTotal);
              return (
                <div key={song.id} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${song.coverColor} flex items-center justify-center text-base shrink-0 shadow-md`}>
                      🎵
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate text-sm">{song.title}</span>
                        {cert.label && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-gradient-to-r ${cert.color}`}>
                            {cert.label}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">
                        {song.genre} • Prod. por {song.producer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-white text-sm block">
                        {formatNumber(song.streamsTotal)} streams
                      </span>
                      <span className="text-[10px] text-cyan-400 block">
                        {song.currentChartPosition ? `#${song.currentChartPosition} en Top 50` : 'Indie'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSongForMetrics(song)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                      title="Ver métricas detalladas por país y remix"
                    >
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Song Metrics Modal */}
      <SongMetricsModal
        isOpen={!!selectedSongForMetrics}
        song={selectedSongForMetrics}
        onClose={() => setSelectedSongForMetrics(null)}
        onLaunchRemix={(song) => {
          setSelectedSongForMetrics(null);
          setActiveTab('studio');
        }}
      />
    </div>
  );
};
