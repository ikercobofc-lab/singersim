/**
 * ArtistStudio.tsx
 *
 * Career-specific studio view for ARTISTS.
 * Wraps SongCreator, AlbumManager, ProjectWorkspace and a performance/live tab
 * with the career context visible at all times.
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import { SongCreator } from './SongCreator';
import { AlbumManager } from './AlbumManager';
import { ProjectWorkspace } from './ProjectWorkspace';
import {
  Mic2, Disc, FolderOpen, Radio, TrendingUp,
  Music, Zap, ChevronRight, Star
} from 'lucide-react';

type ArtistTab = 'single' | 'albums' | 'projects' | 'live';

export const ArtistStudio: React.FC = () => {
  const { singer, discography, albums, setActiveTab } = useGame();
  const [tab, setTab] = useState<ArtistTab>('single');

  if (!singer) return null;

  const releasedCount = discography.filter(s => s.status === 'released').length;
  const albumCount = albums.filter(a => a.status === 'released').length;
  const avgQuality = releasedCount > 0
    ? Math.round(discography.filter(s => s.status === 'released').reduce((a, s) => a + s.quality, 0) / releasedCount)
    : 0;

  const tabItems: { id: ArtistTab; label: string; icon: React.ReactNode }[] = [
    { id: 'single', label: 'Grabar Single', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { id: 'albums', label: 'Álbumes & EPs', icon: <Disc className="w-3.5 h-3.5" /> },
    { id: 'projects', label: 'Demos', icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { id: 'live', label: 'Directo & Giras', icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">

      {/* Career header */}
      <div className="bg-gradient-to-r from-emerald-900/30 via-[#181824] to-[#14141d] border border-emerald-500/20 rounded-3xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl border border-emerald-500/30">
            🎤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Artista</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {singer.career.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tu voz es tu marca. Cada lanzamiento construye o destruye tu reputación.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Voz / Composición</p>
            <p className="text-xl font-black text-emerald-400">{Math.round(singer.skills.voice)}/{Math.round(singer.skills.composition)}</p>
            <p className="text-[10px] text-slate-500">skills actuales</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Catálogo</p>
            <p className="text-xl font-black text-white">{releasedCount}</p>
            <p className="text-[10px] text-slate-500">canciones publicadas</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Calidad media</p>
            <p className={`text-xl font-black ${avgQuality >= 75 ? 'text-emerald-400' : avgQuality >= 55 ? 'text-amber-400' : 'text-rose-400'}`}>
              {avgQuality > 0 ? `${avgQuality}/100` : '—'}
            </p>
            <p className="text-[10px] text-slate-500">de tu catálogo</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Álbumes</p>
            <p className="text-xl font-black text-white">{albumCount}</p>
            <p className="text-[10px] text-slate-500">publicados</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {tabItems.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.id
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      {tab === 'single' && <SongCreator />}
      {tab === 'albums' && <AlbumManager />}
      {tab === 'projects' && <ProjectWorkspace />}
      {tab === 'live' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#181822] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-rose-400" />
              <h3 className="font-black text-white">Conciertos & Giras</h3>
            </div>
            <p className="text-xs text-slate-400">
              Los conciertos llegan como eventos especiales (decisiones emergentes) o mediante contratos de booking.
              Por ahora, los artistas reciben propuestas de actuación a través del sistema de eventos aleatorios.
            </p>

            {/* Performance skill */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Performance en Directo</span>
                <span className="text-rose-400 font-black">{Math.round(singer.skills.performance)}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full"
                  style={{ width: `${singer.skills.performance}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Mejora con cada actuación. Influye en el efecto de conciertos y en el carisma percibido.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-black/30 rounded-xl p-3 text-xs space-y-1.5">
              <p className="text-slate-300 font-bold">Para conseguir más actuaciones:</p>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li>Mantén momentum alto lanzando música regularmente</li>
                <li>Acepta propuestas de festival cuando aparezcan como eventos de decisión</li>
                <li>Con más de 200K oyentes empiezan a llegar invitaciones de gira</li>
                <li>Tener un manager (próximamente) multiplica las oportunidades</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
