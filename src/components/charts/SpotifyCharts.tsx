import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { COUNTRIES } from '../../data/countries';
import { generateDynamicCharts } from '../../data/initialCharts';
import { formatNumber, getCertificationBadge } from '../../utils/formatters';
import { Globe, TrendingUp, TrendingDown, Minus, Sparkles, BarChart2 } from 'lucide-react';
import { SpotifyChartEntry } from '../../types';
import { PlatformMetrics } from './PlatformMetrics';

export const SpotifyCharts: React.FC = () => {
  const { 
    selectedCountry, 
    setSelectedCountry, 
    discography,
    singer 
  } = useGame();

  const [chartViewMode, setChartViewMode] = useState<'charts' | 'metrics'>('charts');
  const [activeChartType, setActiveChartType] = useState<'global' | 'country'>('global');
  const [timeframe, setTimeframe] = useState<'diario' | 'semanal' | 'mensual' | 'anual'>('semanal');

  // Compute the interval-specific chart list dynamically
  const displayedList = useMemo(() => {
    const targetCountry = activeChartType === 'global' ? 'Global' : selectedCountry;
    const baseDynamic = generateDynamicCharts(targetCountry, timeframe, singer?.careerWeek || 1);

    // Merge in player songs that are currently charted
    const chartingPlayerSongs = discography.filter(s => (s.currentChartPosition || 0) > 0);
    if (chartingPlayerSongs.length === 0) {
      return baseDynamic;
    }

    const merged = [...baseDynamic];
    chartingPlayerSongs.forEach(song => {
      const pos = (song.currentChartPosition || 1) - 1;
      if (pos >= 0 && pos < merged.length) {
        // Multiplier for streams according to interval
        const multiplier = timeframe === 'diario' ? 0.16 : timeframe === 'mensual' ? 4.2 : timeframe === 'anual' ? 48.0 : 1.0;
        const playerEntry: SpotifyChartEntry = {
          rank: pos + 1,
          previousRank: Math.max(1, pos + 2),
          songTitle: song.title,
          artistName: singer?.artistName || 'Tú',
          streams: Math.floor(song.streamsTotal * multiplier * 0.45),
          isPlayerSong: true,
          peakRank: song.peakChartPosition || pos + 1,
          weeksOnChart: song.releaseWeek ? Math.max(1, (singer?.careerWeek || 1) - song.releaseWeek) : 1,
          country: targetCountry
        };
        merged.splice(pos, 0, playerEntry);
      }
    });

    return [...merged]
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 20)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1
      }));
  }, [activeChartType, selectedCountry, timeframe, singer?.careerWeek, discography, singer?.artistName]);

  const playerSongsInChart = discography.filter(s => (s.currentChartPosition || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Subnavigation: Charts vs Multi-Platform Analytics */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setChartViewMode('charts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartViewMode === 'charts'
              ? 'bg-[#1DB954] text-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <span>🎧 Spotify Charts Oficiales (Top 50)</span>
        </button>

        <button
          onClick={() => setChartViewMode('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartViewMode === 'metrics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>📊 Métricas Multi-Plataforma (Spotify, Apple, YouTube, TikTok)</span>
        </button>
      </div>

      {chartViewMode === 'metrics' ? (
        <PlatformMetrics />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#121216] to-[#121216] border border-emerald-500/20 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1DB954] flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-emerald-500/20">
            🎧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Spotify Charts Oficiales</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1DB954] border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                Listas en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rankings actualizados y diferenciados por territorio. Observa cómo suben o bajan tus canciones en cada lista.
            </p>
          </div>
        </div>

        {/* Global vs Country Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveChartType('global')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeChartType === 'global'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Top 50 Global</span>
          </button>

          <button
            onClick={() => setActiveChartType('country')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeChartType === 'country'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Top 50 por País</span>
          </button>
        </div>
      </div>

      {/* Country & Timeframe Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#16161f] p-3.5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {activeChartType === 'country' && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.name}>
                  {c.flag} Top 50 {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Timeframe Selector (Diario, Semanal, Mensual, Anual) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['diario', 'semanal', 'mensual', 'anual'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  timeframe === tf
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Streams en intervalo: <strong className="text-white capitalize">{timeframe}</strong> (Semana {singer?.careerWeek || 1})
        </span>
      </div>

      {/* Player Songs in Charts Banner */}
      {playerSongsInChart.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
          <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tus Canciones en el Top 50 Mundial</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {playerSongsInChart.map(song => (
              <div key={song.id} className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs truncate">{song.title}</p>
                  <p className="text-[10px] text-slate-400">{formatNumber(song.streamsTotal)} streams acumulados</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-xs">
                    #{song.currentChartPosition}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Peak: #{song.peakChartPosition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Ranking Table */}
      <div className="bg-[#16161f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 px-4 py-3.5 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-1 text-center">Mov.</div>
          <div className="col-span-6 sm:col-span-7">Canción / Artista</div>
          <div className="col-span-4 sm:col-span-3 text-right">Streams ({timeframe})</div>
        </div>

        <div className="divide-y divide-white/5">
          {displayedList.map((entry) => {
            const movement = entry.previousRank === 0 ? 'NEW' : entry.previousRank - entry.rank;
            const cert = getCertificationBadge(entry.streams);

            return (
              <div
                key={`${entry.rank}_${entry.songTitle}_${timeframe}`}
                className={`grid grid-cols-12 px-4 py-3.5 items-center text-xs transition ${
                  entry.isPlayerSong
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/20 font-bold border-l-4 border-l-[#1DB954]'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank Number */}
                <div className="col-span-1 text-center font-mono font-black text-sm text-slate-300">
                  {entry.rank <= 3 ? (
                    <span className="text-amber-400 font-extrabold">{entry.rank}</span>
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Trend Movement */}
                <div className="col-span-1 text-center flex items-center justify-center">
                  {movement === 'NEW' ? (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 uppercase">
                      NEW
                    </span>
                  ) : typeof movement === 'number' && movement > 0 ? (
                    <span className="flex items-center text-emerald-400 text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3 mr-0.5" />+{movement}
                    </span>
                  ) : typeof movement === 'number' && movement < 0 ? (
                    <span className="flex items-center text-rose-400 text-[10px] font-bold">
                      <TrendingDown className="w-3 h-3 mr-0.5" />{movement}
                    </span>
                  ) : (
                    <Minus className="w-3 h-3 text-slate-500" />
                  )}
                </div>

                {/* Song & Artist Details */}
                <div className="col-span-6 sm:col-span-7 pr-2 truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate text-sm">
                      {entry.songTitle}
                    </span>
                    {entry.isPlayerSong && (
                      <span className="px-1.5 py-0.2 rounded bg-[#1DB954] text-black text-[9px] font-black uppercase shrink-0">
                        TU TEMA
                      </span>
                    )}
                    {cert.label && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-gradient-to-r ${cert.color} shrink-0`}>
                        {cert.label}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs truncate mt-0.5">
                    {entry.artistName}
                  </p>
                </div>

                {/* Streams Count */}
                <div className="col-span-4 sm:col-span-3 text-right">
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">
                    {formatNumber(entry.streams)}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Peak: #{entry.peakRank} • {entry.weeksOnChart} sem.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
