import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, getCertificationBadge } from '../../utils/formatters';
import { careerStageLabel } from '../../utils/simulationEngine';
import { CAREER_PATH_CONFIGS } from '../../utils/careerEngine';
import { LiveStreamModal } from '../social/LiveStreamModal';
import AdvanceMonthButton from '../simple/AdvanceMonthButton';
import {
  Flame, Disc, Music, Sparkles, TrendingUp, Trophy,
  Mail, ChevronRight, Zap, Sliders, BarChart2,
  Clock, Star, DollarSign, Users, Activity, Mic2, Radio
} from 'lucide-react';
import { SongMetricsModal } from '../studio/SongMetricsModal';
import { Song } from '../../types';

export const HomeDashboard: React.FC = () => {
  const {
    singer, discography, albums, setActiveTab,
    bzrpEligible, setIsBzrpOpen, inbox, news,
    weeksSinceLastRelease,
  } = useGame();

  const [selectedSongForMetrics, setSelectedSongForMetrics] = useState<Song | null>(null);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);

  if (!singer) return null;

  const pendingDms = inbox.filter(m => m.status === 'pending');
  const recentSongs = discography.slice(0, 5);
  const pathConfig = CAREER_PATH_CONFIGS[singer.career.path];
  const stageLabel = careerStageLabel(singer.career.stage);
  const yearsActive = singer.career.yearsActive;

  // Quick stats for the hero bar
  const totalStreams = discography.reduce((acc, s) => acc + s.streamsTotal, 0);
  const releasedCount = discography.filter(s => s.status === 'released').length;

  return (
    <div className="space-y-6">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900/40 via-[#181824] to-[#14141d] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-emerald-500/20 border-2 border-white/20 shrink-0">
              {singer.avatarIcon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  {pathConfig.label}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {stageLabel}
                </span>
                <span className="text-xs text-slate-400">
                  {singer.nationality} • {singer.age} años • Año {singer.career.careerYear}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {singer.artistName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {yearsActive === 0 ? 'Primer año' : `${yearsActive} año${yearsActive !== 1 ? 's' : ''} de carrera`}
                </span>
                <span className="flex items-center gap-1">
                  <Disc className="w-3.5 h-3.5" />
                  {releasedCount} lanzamiento{releasedCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Semana {singer.career.careerWeek}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Monthly advance button */}
            <AdvanceMonthButton />
            
            {bzrpEligible && (
              <button
                onClick={() => setIsBzrpOpen(true)}
                className="animate-pulse px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>BZRP SESSION DISPONIBLE</span>
              </button>
            )}
            {singer.fame.followers >= 1000 && (
              <button
                onClick={() => setIsLiveStreamOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
              >
                <Radio className="w-4 h-4" />
                <span>HACER DIRECTO</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('studio')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Music className="w-4 h-4" />
              <span>Estudio</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-xs flex items-center gap-2 transition"
            >
              <span>🎧 Rankings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CAREER STATS GRID ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Monthly Listeners */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oyentes Mensuales</span>
          </div>
          <p className="text-2xl font-black text-white">{formatNumber(singer.fame.monthlyListeners)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {singer.fame.followers > 0 ? `${formatNumber(singer.fame.followers)} seguidores` : 'Sin seguidores aún'}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(singer.economy.balance)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            +{formatCurrency(singer.economy.weeklyIncome)}/semana
          </p>
        </div>

        {/* Industry Prestige */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prestigio Industrial</span>
          </div>
          <p className="text-2xl font-black text-white">{Math.round(singer.fame.industryPrestige)}/100</p>
          <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${singer.fame.industryPrestige}%` }}
            />
          </div>
        </div>

        {/* Momentum */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Momentum</span>
          </div>
          <p className="text-2xl font-black text-white">{singer.career.momentum}/100</p>
          <p className="text-[11px] mt-1">
            <span className={
              singer.career.momentum > 60 ? 'text-emerald-400' :
              singer.career.momentum > 40 ? 'text-amber-400' : 'text-rose-400'
            }>
              {singer.career.momentum > 70 ? '🔥 En racha' :
               singer.career.momentum > 50 ? '📈 Subiendo' :
               singer.career.momentum > 30 ? '➡️ Estable' : '📉 Bajando'}
            </span>
          </p>
        </div>
      </div>

      {/* ── SKILLS & FAME GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* Musical Skills */}
        <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Habilidades</span>
            </h3>
            <span className="text-xs text-slate-400 italic">Crecen con la experiencia</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {(singer.career.path === 'artist' ? [
              { key: 'voice', label: 'Voz & Afinación', color: 'from-emerald-500 to-teal-400' },
              { key: 'composition', label: 'Composición', color: 'from-cyan-500 to-blue-400' },
              { key: 'flow', label: 'Flow & Ritmo', color: 'from-purple-500 to-pink-500' },
              { key: 'charisma', label: 'Carisma', color: 'from-amber-400 to-yellow-500' },
              { key: 'performance', label: 'Performance', color: 'from-rose-500 to-pink-400' },
            ] : singer.career.path === 'producer' ? [
              { key: 'production', label: 'Producción', color: 'from-emerald-500 to-teal-400' },
              { key: 'mixing', label: 'Mezcla & Mastering', color: 'from-cyan-500 to-blue-400' },
              { key: 'composition', label: 'Composición', color: 'from-purple-500 to-pink-500' },
              { key: 'negotiation', label: 'Negociación', color: 'from-amber-400 to-yellow-500' },
            ] : [
              { key: 'performance', label: 'Performance', color: 'from-emerald-500 to-teal-400' },
              { key: 'production', label: 'Producción', color: 'from-cyan-500 to-blue-400' },
              { key: 'charisma', label: 'Carisma', color: 'from-purple-500 to-pink-500' },
              { key: 'promotion', label: 'Promoción', color: 'from-amber-400 to-yellow-500' },
            ]).map(({ key, label, color }) => {
              const val = (singer.skills as any)[key] || 0;
              return (
                <div key={key}>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-white">{Math.round(val)}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fame Dimensions + Inbox/News */}
        <div className="space-y-4">
          {/* Fame */}
          <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Reputación (dimensiones independientes)</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: 'Prestigio Industrial', val: singer.fame.industryPrestige, color: 'text-purple-400' },
                { label: 'Reputación Crítica', val: singer.fame.criticalReputation, color: 'text-cyan-400' },
                { label: 'Street Cred', val: singer.fame.streetCred, color: 'text-emerald-400' },
                { label: 'Atractivo Comercial', val: singer.fame.commercialAppeal, color: 'text-amber-400' },
                { label: 'Impacto Cultural', val: singer.fame.culturalImpact, color: 'text-rose-400' },
                { label: 'Longevidad', val: singer.fame.longevityScore, color: 'text-blue-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-black ${color}`}>{Math.round(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending collab */}
          {pendingDms.length > 0 ? (
            <div className="bg-gradient-to-br from-purple-950/40 to-[#181824] border border-purple-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg border border-purple-500/30">
                  {pendingDms[0].fromArtist.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{pendingDms[0].fromArtist.name} te escribió</h4>
                  <p className="text-xs text-purple-300">{pendingDms.length} propuesta{pendingDms.length !== 1 ? 's' : ''} pendiente{pendingDms.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('messages')} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                Ver DMs
              </button>
            </div>
          ) : (
            <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Sin propuestas pendientes</h4>
                  <p className="text-xs text-slate-400">
                    {weeksSinceLastRelease > 3
                      ? `Llevas ${weeksSinceLastRelease} semanas sin lanzar música — los contactos se enfrían.`
                      : 'Sigue lanzando música para atraer colaboraciones.'}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveTab('messages')} className="text-xs text-slate-400 hover:text-white underline">
                Directorio
              </button>
            </div>
          )}

          {/* News */}
          {news.length > 0 && (
            <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-cyan-400">Última Noticia</span>
                <span>{news[0].timeAgo}</span>
              </div>
              <p className="font-bold text-sm text-white line-clamp-2">{news[0].headline}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{news[0].source}</span>
                <button onClick={() => setActiveTab('news')} className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                  <span>Ver noticias</span><ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ENERGY BAR ── */}
      <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Energía
          </span>
          <span className={`text-xs font-black ${
            singer.career.energy > 60 ? 'text-emerald-400' :
            singer.career.energy > 30 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {singer.career.energy}/100 — {
              singer.career.energy > 70 ? 'En plena forma' :
              singer.career.energy > 40 ? 'Cansado pero activo' :
              singer.career.energy > 15 ? 'Agotado' : '⚠️ Al límite'
            }
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              singer.career.energy > 60 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              singer.career.energy > 30 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
              'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
            style={{ width: `${singer.career.energy}%` }}
          />
        </div>
        {singer.career.energy < 20 && (
          <p className="text-xs text-rose-400 mt-1.5 font-semibold">
            ⚠️ Con tan poca energía, la calidad de tus lanzamientos se resiente. Avanza una semana para recuperarte.
          </p>
        )}
      </div>

      {/* ── DISCOGRAPHY PREVIEW ── */}
      <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Últimos Lanzamientos ({releasedCount})
            </h3>
          </div>
          <button onClick={() => setActiveTab('studio')} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
            <span>Estudio</span><ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSongs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Aún no has lanzado canciones. Ve al Estudio para grabar tu primer tema.
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
                          <span className={`text-[9px] px-1.5 rounded font-bold uppercase bg-gradient-to-r ${cert.color}`}>
                            {cert.label}
                          </span>
                        )}
                        {song.isRemix && (
                          <span className="text-[9px] px-1.5 rounded font-bold bg-purple-500/20 text-purple-300">REMIX</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">
                        {song.genre} • Q:{song.quality}/100
                        {song.weeksOnChart > 0 && ` • ${song.weeksOnChart} sem. en charts`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-white text-sm block">{formatNumber(song.streamsTotal)}</span>
                      <span className="text-[10px] text-cyan-400 block">
                        {song.currentChartPosition ? `#${song.currentChartPosition}` : 'Sin posición'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSongForMetrics(song)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                      title="Ver métricas"
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
        onLaunchRemix={() => {
          setSelectedSongForMetrics(null);
          setActiveTab('studio');
        }}
      />

      {/* Live Stream Modal */}
      <LiveStreamModal
        isOpen={isLiveStreamOpen}
        onClose={() => setIsLiveStreamOpen(false)}
      />
    </div>
  );
};
