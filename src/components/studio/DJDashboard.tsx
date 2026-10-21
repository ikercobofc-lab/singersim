/**
 * DJDashboard.tsx
 *
 * Career-specific panel for DJs.
 * A DJ's workflow:
 *   - Accept gig offers (clubs, festivals, residencies)
 *   - Build reputation through live performances
 *   - Create remix projects
 *   - Develop their own productions / originals
 *   - Track income from sets and residencies
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProjectWorkspace } from './ProjectWorkspace';
import { DJPlaylistCreator } from './DJPlaylistCreator';
import { DJMashupCreator } from './DJMashupCreator';
import {
  Headphones, Calendar, MapPin, Users, TrendingUp,
  DollarSign, CheckCircle2, Clock, Music2, Zap, ChevronRight, Award, ListMusic, Shuffle
} from 'lucide-react';
import { DJGig } from '../../utils/careerEngine';

type DJTab = 'overview' | 'gigs' | 'remixes' | 'originals' | 'playlists' | 'mashups';

export const DJDashboard: React.FC = () => {
  const {
    singer, djGigs, acceptDJGig, discography,
    privateProjects, setActiveTab
  } = useGame();
  const [tab, setTab] = useState<DJTab>('overview');
  const [isPlaylistCreatorOpen, setIsPlaylistCreatorOpen] = useState(false);
  const [isMashupCreatorOpen, setIsMashupCreatorOpen] = useState(false);

  if (!singer) return null;

  const offeredGigs = djGigs.filter(g => g.status === 'offered');
  const completedGigs = djGigs.filter(g => g.status === 'completed');
  const totalShowIncome = singer.economy.incomeFromDJSets + singer.economy.incomeFromShows;
  const remixProjects = privateProjects.filter(p => !p.isArchived && p.tags?.includes('remix'));
  const originalTracks = discography.filter(s => s.status === 'released');

  const gigTypeIcon: Record<DJGig['type'], string> = {
    club: '🎧',
    festival: '🎪',
    private_event: '🏠',
    residency_session: '🔁',
    online: '💻',
  };

  const gigTypeLabel: Record<DJGig['type'], string> = {
    club: 'Club',
    festival: 'Festival',
    private_event: 'Evento Privado',
    residency_session: 'Residencia',
    online: 'Online',
  };

  const tabItems: { id: DJTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Panel', icon: <Headphones className="w-3.5 h-3.5" /> },
    { id: 'gigs', label: `Actuaciones (${offeredGigs.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-3.5 h-3.5" /> },
    { id: 'mashups', label: 'Mashups', icon: <Shuffle className="w-3.5 h-3.5" /> },
    { id: 'remixes', label: 'Remixes', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'originals', label: 'Originales', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">

      {/* Career path header */}
      <div className="bg-gradient-to-r from-violet-900/30 via-[#181824] to-[#14141d] border border-violet-500/20 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl border border-violet-500/30">
            🎧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">DJ</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                {singer.career.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              El directo es tu escenario. Cada set suma reputación. Cada remix, alcance.
            </p>
          </div>
        </div>

        {/* DJ-specific stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Performance / Carisma</p>
            <p className="text-xl font-black text-violet-400">{Math.round(singer.skills.performance)}/{Math.round(singer.skills.charisma)}</p>
            <p className="text-[10px] text-slate-500">Actuación / Imagen</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Ingresos directos</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(totalShowIncome)}</p>
            <p className="text-[10px] text-slate-500">Sets + residencias</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Sets completados</p>
            <p className="text-xl font-black text-white">{completedGigs.length}</p>
            <p className="text-[10px] text-slate-500">En toda la carrera</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Gigs disponibles</p>
            <p className="text-xl font-black text-amber-400">{offeredGigs.length}</p>
            <p className="text-[10px] text-slate-500">Esperando confirmación</p>
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
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-4">

          {/* Growth guide */}
          <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Cómo crecer como DJ</h3>
            <div className="space-y-2 text-xs text-slate-300">
              {[
                { step: '1', text: 'Acepta gigs en clubes pequeños — el performance crece con cada set', done: completedGigs.length > 0 },
                { step: '2', text: 'Consigue una residencia en un club para ingresos estables', done: completedGigs.some(g => g.type === 'residency_session') },
                { step: '3', text: 'Crea remixes de canciones populares para aparecer en charts', done: remixProjects.length > 0 },
                { step: '4', text: 'Toca en tu primer festival con +3.000 personas', done: completedGigs.some(g => g.type === 'festival') },
                { step: '5', text: 'Lanza una producción original bajo tu nombre', done: originalTracks.length > 0 },
              ].map(({ step, text, done }) => (
                <div key={step} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                    done ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    {done ? '✓' : step}
                  </div>
                  <span className={done ? 'line-through text-slate-500' : ''}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming gigs */}
          {offeredGigs.length > 0 && (
            <div className="bg-violet-950/20 border border-violet-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Gigs Disponibles ({offeredGigs.length})
                </h3>
                <button onClick={() => setTab('gigs')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {offeredGigs.slice(0, 2).map(g => (
                <div key={g.id} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{gigTypeIcon[g.type]}</span>
                    <div>
                      <p className="font-bold text-white">{g.venueName}</p>
                      <p className="text-slate-400">{gigTypeLabel[g.type]} · {g.venueCapacity.toLocaleString()} personas · Sem. {g.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-400">{formatCurrency(g.fee)}</span>
                    <button
                      onClick={() => acceptDJGig(g.id)}
                      className="px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white font-black text-xs transition"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed gigs recent */}
          {completedGigs.length > 0 && (
            <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Actuaciones recientes</h3>
              {completedGigs.slice(-3).reverse().map(g => (
                <div key={g.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <span>{gigTypeIcon[g.type]}</span>
                    <span className="text-white font-semibold">{g.venueName}</span>
                    <span className="text-slate-400">· {g.audienceReached.toLocaleString()} personas</span>
                  </div>
                  <span className="text-emerald-400 font-bold">+{formatCurrency(g.fee)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: GIGS ── */}
      {tab === 'gigs' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Los gigs llegan según tu reputación y habilidades de performance. Un set exitoso mejora tu posición para conseguir mejores venues.
          </p>

          {djGigs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-bold">Sin gigs disponibles.</p>
              <p className="text-xs text-slate-500 mt-1">
                Avanza semanas para recibir ofertas. Mejora tu Performance para conseguir venues más grandes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...djGigs].reverse().map(g => (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    g.status === 'offered' ? 'bg-[#181822] border-violet-500/30' :
                    g.status === 'completed' ? 'bg-emerald-950/10 border-emerald-500/15 opacity-80' :
                    'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <div className="text-3xl shrink-0 mt-0.5">{gigTypeIcon[g.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-white">{g.venueName}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                        g.status === 'offered' ? 'bg-amber-500/20 text-amber-300' :
                        g.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-white/10 text-slate-400'
                      }`}>
                        {g.status === 'offered' ? 'DISPONIBLE' : g.status === 'completed' ? 'COMPLETADO' : g.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.venueCapacity.toLocaleString()} cap.</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gigTypeLabel[g.type]}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Sem. {g.date}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{g.reputationGain} prestigio</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black text-emerald-400 text-lg">{formatCurrency(g.fee)}</p>
                    {g.status === 'offered' && (
                      <button
                        onClick={() => acceptDJGig(g.id)}
                        className="mt-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmar
                      </button>
                    )}
                    {g.status === 'completed' && (
                      <p className="text-[10px] text-slate-500">{g.audienceReached.toLocaleString()} personas alcanzadas</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: REMIXES ── */}
      {tab === 'remixes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300">
            <p className="font-bold text-violet-300 mb-1">💡 Cómo crear remixes como DJ</p>
            <p>Ve a la pestaña de <strong>Mensajes</strong> para contactar con artistas y proponer un remix de su canción. También puedes iniciar un remix desde las métricas de una canción.</p>
          </div>
          {/* Show remix projects */}
          <ProjectWorkspace />
        </div>
      )}

      {/* ── TAB: PLAYLISTS ── */}
      {tab === 'playlists' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300">
            <p className="font-bold text-purple-300 mb-1">🎧 Playlists DJ</p>
            <p>Crea secuencias de canciones para tus sets. Ordena tracks, configura transiciones, y úsalas en gigs.</p>
          </div>
          
          <button
            onClick={() => setIsPlaylistCreatorOpen(true)}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-300 font-black text-sm flex items-center justify-center gap-2 transition"
          >
            <ListMusic className="w-5 h-5" />
            Crear Nueva Playlist
          </button>
          
          <div className="p-8 text-center text-slate-500">
            <p className="text-xs">
              Las playlists creadas aparecerán aquí. Podrás usarlas en tus gigs para mejorar la reacción del público.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB: MASHUPS ── */}
      {tab === 'mashups' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300">
            <p className="font-bold text-violet-300 mb-1">🎛️ Mashups DJ</p>
            <p>Combina 2 canciones en una nueva versión. El sistema verifica compatibilidad de BPM y key.</p>
          </div>
          
          <button
            onClick={() => setIsMashupCreatorOpen(true)}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/5 text-violet-300 font-black text-sm flex items-center justify-center gap-2 transition"
          >
            <Shuffle className="w-5 h-5" />
            Crear Nuevo Mashup
          </button>
          
          <div className="p-8 text-center text-slate-500">
            <p className="text-xs">
              Los mashups completados aparecerán aquí. Podrás lanzarlos como canciones propias o usarlos solo en sets.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB: ORIGINALS ── */}
      {tab === 'originals' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Como DJ puedes lanzar producciones originales bajo tu nombre. Ve al Estudio principal para grabar un tema o usar el secuenciador.
          </p>
          {originalTracks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
              <Zap className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-bold">Sin lanzamientos propios aún.</p>
              <p className="text-xs text-slate-500 mt-1">
                Graba tu primera producción original en el Estudio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 bg-[#181822] border border-white/10 rounded-2xl overflow-hidden">
              {originalTracks.map(song => (
                <div key={song.id} className="p-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${song.coverColor} flex items-center justify-center text-base shrink-0`}>
                      🎵
                    </div>
                    <div>
                      <p className="font-bold text-white">{song.title}</p>
                      <p className="text-slate-400">{song.genre} · Q: {song.quality}/100{song.isRemix ? ' · REMIX' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-white">{formatNumber(song.streamsTotal)}</p>
                    {song.currentChartPosition && (
                      <p className="text-[10px] text-cyan-400">#{song.currentChartPosition}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Modals */}
      {isPlaylistCreatorOpen && (
        <DJPlaylistCreator onClose={() => setIsPlaylistCreatorOpen(false)} />
      )}
      
      {isMashupCreatorOpen && (
        <DJMashupCreator onClose={() => setIsMashupCreatorOpen(false)} />
      )}
    </div>
  );
};
