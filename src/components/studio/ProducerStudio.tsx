/**
 * ProducerStudio.tsx
 *
 * Career-specific studio view for PRODUCERS.
 * A producer's workflow:
 *   - Create beats/instrumentals (private projects)
 *   - Sell / license beats to incoming commissions
 *   - Produce songs for artist collaborators (credit system)
 *   - Build catalog of produced tracks (discography shows credits, not own releases)
 *   - Track royalty income per produced track
 *   - Build reputation through quality, not streams
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProjectWorkspace } from './ProjectWorkspace';
import { BeatSequencer } from './BeatSequencer';
import {
  Sliders, DollarSign, Music2, Award, TrendingUp,
  Package, Users, CheckCircle2, XCircle, Clock, ChevronRight
} from 'lucide-react';

type ProducerTab = 'overview' | 'beats' | 'commissions' | 'catalog';

export const ProducerStudio: React.FC = () => {
  const { singer, beatCommissions, acceptBeatCommission, discography, privateProjects, setActiveTab } = useGame();
  const [tab, setTab] = useState<ProducerTab>('overview');
  const [bpm, setBpm] = useState(95);

  if (!singer) return null;

  const pendingCommissions = beatCommissions.filter(c => c.status === 'pending');
  const acceptedCommissions = beatCommissions.filter(c => c.status === 'accepted' || c.status === 'delivered');
  const producedSongs = discography.filter(s => s.producerId === 'player' || s.collaboratorIds?.includes('player'));
  const totalProductionIncome = singer.economy.incomeFromProduction;

  const tabItems: { id: ProducerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Panel', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'beats', label: 'Crear Beats', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'commissions', label: `Encargos (${pendingCommissions.length})`, icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'catalog', label: 'Catálogo', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">

      {/* Career path header */}
      <div className="bg-gradient-to-r from-cyan-900/30 via-[#181824] to-[#14141d] border border-cyan-500/20 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-3xl border border-cyan-500/30">
            🎛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Productor Musical</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {singer.career.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tu negocio es el sonido. Builds beats, gets credits, earns royalties.
            </p>
          </div>
        </div>

        {/* Producer-specific stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Producción / Mezcla</p>
            <p className="text-xl font-black text-cyan-400">{Math.round(singer.skills.production)}/{Math.round(singer.skills.mixing)}</p>
            <p className="text-[10px] text-slate-500">Producción / Mezcla</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Ingresos producción</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(totalProductionIncome)}</p>
            <p className="text-[10px] text-slate-500">Total acumulado</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Canciones producidas</p>
            <p className="text-xl font-black text-white">{producedSongs.length}</p>
            <p className="text-[10px] text-slate-500">Con crédito tuyo</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Encargos activos</p>
            <p className="text-xl font-black text-amber-400">{pendingCommissions.length}</p>
            <p className="text-[10px] text-slate-500">Esperando respuesta</p>
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
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
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

          {/* Skill growth guide */}
          <div className="bg-[#181822] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Cómo crecer como productor</h3>
            <div className="space-y-2 text-xs text-slate-300">
              {[
                { step: '1', text: 'Crea beats en el Secuenciador y guárdalos como proyectos privados', done: privateProjects.length > 0 },
                { step: '2', text: 'Acepta encargos de artistas (ganas dinero + crédito en sus canciones)', done: acceptedCommissions.length > 0 },
                { step: '3', text: 'Propón producción a artistas en el panel de Mensajes', done: producedSongs.length > 0 },
                { step: '4', text: 'Acumula créditos en canciones con streams para generar royalties pasivos', done: totalProductionIncome > 5000 },
                { step: '5', text: 'Con prestigio suficiente, los artistas grandes empezarán a buscarte', done: singer.fame.industryPrestige > 40 },
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

          {/* Pending commissions preview */}
          {pendingCommissions.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Encargos Pendientes ({pendingCommissions.length})
                </h3>
                <button onClick={() => setTab('commissions')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {pendingCommissions.slice(0, 2).map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-white">{c.requestingArtistName}</p>
                    <p className="text-slate-400">{c.genre} · {formatCurrency(c.budget)} · {c.royaltyRate}% royalties</p>
                  </div>
                  <button
                    onClick={() => acceptBeatCommission(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition"
                  >
                    Aceptar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Projects shortcut */}
          <div className="bg-[#181822] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">Proyectos & Demos</p>
              <p className="text-xs text-slate-400">{privateProjects.filter(p => !p.isArchived).length} proyectos activos</p>
            </div>
            <button
              onClick={() => setTab('beats')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Music2 className="w-3.5 h-3.5" />
              Ir al estudio
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: BEATS / SEQUENCER ── */}
      {tab === 'beats' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            Crea el beat con el secuenciador y guárdalo como proyecto privado. Cada beat guardado puede convertirse en un encargo para artistas o ser licenciado.
          </p>
          <BeatSequencer
            initialBpm={bpm}
            onApplyBeat={(_, newBpm) => {
              setBpm(newBpm);
            }}
          />
          <div className="border-t border-white/10 pt-4">
            <ProjectWorkspace />
          </div>
        </div>
      )}

      {/* ── TAB: COMMISSIONS ── */}
      {tab === 'commissions' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Los artistas te encargan beats. Aceptar un encargo te da dinero inmediato y royalties futuros de la canción. 
            Tu nombre aparece en los créditos.
          </p>

          {beatCommissions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
              <Package className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-bold">Sin encargos por ahora.</p>
              <p className="text-xs text-slate-500 mt-1">
                Mejora tu Producción y Prestigio Industrial para atraer más encargos. Avanza semanas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {beatCommissions.map(c => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    c.status === 'pending' ? 'bg-[#181822] border-amber-500/30' :
                    c.status === 'accepted' ? 'bg-emerald-950/20 border-emerald-500/20' :
                    'bg-white/5 border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{c.requestingArtistName}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                        c.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                        c.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-white/10 text-slate-400'
                      }`}>
                        {c.status === 'pending' ? 'ESPERANDO' : c.status === 'accepted' ? 'ACEPTADO' : c.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Género: {c.genre} · Pago: <strong className="text-emerald-400">{formatCurrency(c.budget)}</strong> · Royalty: {c.royaltyRate}%
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Plazo: Sem. {c.deadline} {c.deadline <= (singer.careerWeek ?? 1) ? '⚠️ Vencido' : ''}
                    </p>
                  </div>

                  {c.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptBeatCommission(c.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aceptar
                      </button>
                    </div>
                  )}

                  {c.status === 'accepted' && (
                    <div className="text-right text-xs">
                      <p className="text-emerald-400 font-bold">+{formatCurrency(c.budget)}</p>
                      <p className="text-slate-500">Cobrado</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CATALOG ── */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Canciones en las que figuran tus créditos como productor. Cada una genera royalties pasivos.
          </p>

          {producedSongs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
              <Award className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-bold">Sin canciones producidas aún.</p>
              <p className="text-xs text-slate-500 mt-1">
                Acepta encargos o propón producción a artistas para acumular créditos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 bg-[#181822] border border-white/10 rounded-2xl overflow-hidden">
              {producedSongs.map(song => (
                <div key={song.id} className="p-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${song.coverColor} flex items-center justify-center text-base shrink-0`}>
                      🎵
                    </div>
                    <div>
                      <p className="font-bold text-white">{song.title}</p>
                      <p className="text-slate-400">{song.genre} · Q: {song.quality}/100</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-white">{formatNumber(song.streamsTotal)}</p>
                    <p className="text-[10px] text-emerald-400">+{formatCurrency(Math.floor(song.streamsTotal * 0.0035 * (song.royaltySplits?.['player'] || 40) / 100))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
