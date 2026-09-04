import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Play, 
  Share2, 
  Headphones, 
  Tv, 
  Radio, 
  Sparkles,
  Award
} from 'lucide-react';

export const PlatformMetrics: React.FC = () => {
  const { singer, discography } = useGame();
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'spotify' | 'apple' | 'youtube' | 'tiktok'>('all');

  if (!singer) return null;

  const totalStreams = discography.reduce((acc, s) => acc + s.streamsTotal, 0);
  const monthlyListeners = singer.stats.fans * 4 + 18500;
  const dailyStreams = Math.floor(monthlyListeners * 0.16);

  // Platform shares breakdown
  const spotifyStreams = Math.floor(totalStreams * 0.52);
  const appleStreams = Math.floor(totalStreams * 0.22);
  const youtubeViews = Math.floor(totalStreams * 0.38) + 150000;
  const tiktokCreations = Math.floor(singer.stats.fans * 0.12) + 450;
  const tiktokViews = tiktokCreations * 8400;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 via-[#14141e] to-[#14141e] border border-blue-500/20 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/30">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Métricas Oficiales Multi-Plataforma</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Panel unificado con el rendimiento en Spotify, Apple Music, YouTube Music y TikTok Sounds.
            </p>
          </div>
        </div>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'all', label: 'Todas las Plataformas' },
            { id: 'spotify', label: 'Spotify' },
            { id: 'apple', label: 'Apple Music' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'tiktok', label: 'TikTok Sounds' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPlatform === p.id ? 'bg-white text-black font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Quick KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#181824] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">Oyentes Mensuales</span>
          <span className="font-extrabold text-white text-lg sm:text-xl">{formatNumber(monthlyListeners)}</span>
          <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.8% este mes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181824] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">Streams Diarios</span>
          <span className="font-extrabold text-emerald-400 text-lg sm:text-xl">{formatNumber(dailyStreams)}</span>
          <span className="text-[10px] text-slate-400 block">En todas las DSPs</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181824] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">Vídeos en TikTok</span>
          <span className="font-extrabold text-pink-400 text-lg sm:text-xl">{formatNumber(tiktokCreations)}</span>
          <span className="text-[10px] text-slate-400 block">{formatNumber(tiktokViews)} reproducciones</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181824] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">Ingresos Estimados</span>
          <span className="font-extrabold text-cyan-400 text-lg sm:text-xl">
            {formatCurrency(Math.floor(totalStreams * 0.0035))}
          </span>
          <span className="text-[10px] text-slate-400 block">Royalties brutos</span>
        </div>
      </div>

      {/* Detailed Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SPOTIFY FOR ARTISTS */}
        {(selectedPlatform === 'all' || selectedPlatform === 'spotify') && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c2415] to-[#121218] border border-emerald-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🟢</span>
                <div>
                  <h3 className="font-extrabold text-white text-base">Spotify for Artists</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">52% de tu cuota de streaming</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                {formatNumber(spotifyStreams)} streams
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Ratio de Guardado (Save Rate)</span>
                <span className="font-bold text-white text-sm">34.2%</span>
                <p className="text-[10px] text-emerald-400 mt-0.5">Alto engagement de fans</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Seguidores de Perfil</span>
                <span className="font-bold text-white text-sm">{formatNumber(Math.floor(singer.stats.fans * 0.85))}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Notificados en Release Radar</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Playlists Editoriales Activas</p>
              <div className="flex flex-wrap gap-1.5">
                {['Viva Latino', "Today's Top Hits", 'Éxitos España', 'Mansión Reggaetón', 'Fuego'].map(pl => (
                  <span key={pl} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                    ✓ {pl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPLE MUSIC */}
        {(selectedPlatform === 'all' || selectedPlatform === 'apple') && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#240c14] to-[#121218] border border-rose-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🍎</span>
                <div>
                  <h3 className="font-extrabold text-white text-base">Apple Music</h3>
                  <span className="text-[10px] text-rose-400 font-bold">22% de tu cuota de streaming</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-xs">
                {formatNumber(appleStreams)} streams
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Audio Espacial (Dolby Atmos)</span>
                <span className="font-bold text-white text-sm">88.5%</span>
                <p className="text-[10px] text-rose-300 mt-0.5">Calidad Lossless recomendada</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Top Ciudades Apple Music</span>
                <span className="font-bold text-white text-sm">Madrid, CDMX, Miami</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Top 100 Urbano Latino</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Presencia en Radio Apple Music 1</p>
              <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                Sonando en rotación continua con menciones de Zane Lowe en el programa estelar de novedades urbanas.
              </p>
            </div>
          </div>
        )}

        {/* YOUTUBE MUSIC & CLIPS */}
        {(selectedPlatform === 'all' || selectedPlatform === 'youtube') && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#240c0c] to-[#121218] border border-red-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📺</span>
                <div>
                  <h3 className="font-extrabold text-white text-base">YouTube Music & Videoclips</h3>
                  <span className="text-[10px] text-red-400 font-bold">Canal Oficial de Artista</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-extrabold text-xs">
                {formatNumber(youtubeViews)} views
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Suscriptores al Canal</span>
                <span className="font-bold text-white text-sm">{formatNumber(Math.floor(singer.stats.fans * 0.65))}</span>
                <p className="text-[10px] text-red-400 mt-0.5">Placa de Plata en camino</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Retención Media de Vídeo</span>
                <span className="font-bold text-white text-sm">74.1%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Muy alta fidelidad visual</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tendencias de YouTube</p>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 text-xs font-bold inline-block">
                #3 en Tendencias Musicales de Videoclips
              </span>
            </div>
          </div>
        )}

        {/* TIKTOK SOUNDS */}
        {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1e0c24] to-[#121218] border border-pink-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎵</span>
                <div>
                  <h3 className="font-extrabold text-white text-base">TikTok Sounds & Virality</h3>
                  <span className="text-[10px] text-pink-400 font-bold">Motor Viral de Crecimiento</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-xs">
                {formatNumber(tiktokViews)} views
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Vídeos Creados con tu Audio</span>
                <span className="font-bold text-white text-sm">{formatNumber(tiktokCreations)} UGC</span>
                <p className="text-[10px] text-pink-400 mt-0.5">Trends y coreografías</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Sonido Viral Oficial</span>
                <span className="font-bold text-white text-sm">Top 15 Viral Sounds</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Impulso diario a Spotify</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Comportamiento del Algoritmo</p>
              <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                El estribillo de tus temas genera miles de reproducciones diarias en la pestaña "Para Ti" (FYP), convirtiendo usuarios en oyentes activos de Spotify.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
