/**
 * ProjectWorkspace.tsx
 *
 * Private project manager — the "Mis Demos / Proyectos" workspace.
 * Lets players create, manage, version, share and publish private projects
 * without them ever going public automatically.
 *
 * Shared across all career paths:
 *  - Artist: demos, WIP songs
 *  - Producer: beats, instrumentals in progress
 *  - DJ: remix projects, sets in progress
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PrivateProject, MusicGenre, SongTheme } from '../../types';
import { formatNumber } from '../../utils/formatters';
import {
  FolderOpen, Plus, Archive, Copy, Edit3, Share2,
  Send, Lock, Unlock, Clock, ChevronDown, ChevronUp,
  Music2, Layers, CheckCircle2, AlertCircle, Tag, X
} from 'lucide-react';

const GENRES: MusicGenre[] = [
  'Urbano / Reggaeton', 'Trap / Hip-Hop', 'Pop / Electropop',
  'R&B / Neo-Soul', 'Rock / Indie', 'Balada / Latino',
  'Drill', 'Electrónica / House', 'Dancehall / Afrobeats', 'Fusión',
];

const THEMES: SongTheme[] = [
  'Amor', 'Desamor', 'Fiesta / Flex', 'Calle / Real',
  'Reflexión', 'Protesta / Venganza', 'Identidad', 'Introspección',
];

export const ProjectWorkspace: React.FC = () => {
  const {
    singer, privateProjects,
    createPrivateProject, publishProject, archiveProject,
    duplicateProject, renameProject,
  } = useGame();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState<MusicGenre>('Urbano / Reggaeton');
  const [newTheme, setNewTheme] = useState<SongTheme>('Fiesta / Flex');
  const [newNotes, setNewNotes] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishBudget, setPublishBudget] = useState(800);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [publishResult, setPublishResult] = useState<{ message: string; success: boolean } | null>(null);

  if (!singer) return null;

  const activeProjects = privateProjects.filter(p => !p.isArchived);
  const archivedProjects = privateProjects.filter(p => p.isArchived);

  const displayed = filter === 'all' ? privateProjects
    : filter === 'active' ? activeProjects
    : archivedProjects;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPrivateProject({
      workingTitle: newTitle.trim(),
      genre: newGenre,
      theme: newTheme,
      notes: newNotes.trim() || undefined,
    });
    setNewTitle('');
    setNewNotes('');
    setIsCreating(false);
  };

  const handlePublish = (project: PrivateProject) => {
    if (!singer || singer.economy.balance < publishBudget) {
      setPublishResult({ success: false, message: 'Saldo insuficiente para publicar.' });
      return;
    }
    const result = publishProject(project.id, publishBudget);
    setPublishResult({
      success: result.success,
      message: result.success
        ? `✅ "${project.workingTitle}" publicado con ${formatNumber(result.streams || 0)} streams iniciales.`
        : result.error || 'Error al publicar.',
    });
    setPublishingId(null);
    setTimeout(() => setPublishResult(null), 4000);
  };

  const handleDuplicate = (projectId: string) => {
    const copy = duplicateProject(projectId);
    setExpandedId(copy.id);
  };

  const handleRenameSubmit = (projectId: string) => {
    if (!renameValue.trim()) return;
    renameProject(projectId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const currentVersion = (p: PrivateProject) =>
    p.versions.find(v => v.versionId === p.currentVersionId) || p.versions[p.versions.length - 1];

  const qualityColor = (q: number) =>
    q >= 80 ? 'text-emerald-400' : q >= 60 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            Mis Proyectos & Demos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeProjects.length} proyecto{activeProjects.length !== 1 ? 's' : ''} activo{activeProjects.length !== 1 ? 's' : ''} •
            Nada aquí se publica automáticamente ni aumenta tus streams.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-2 transition shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Publish result feedback */}
      {publishResult && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          publishResult.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {publishResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {publishResult.message}
        </div>
      )}

      {/* Create form */}
      {isCreating && (
        <div className="bg-[#14141d] border border-purple-500/40 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider">Nuevo Proyecto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Título de trabajo *</label>
              <input
                type="text"
                placeholder="Ej. Beat oscuro sin título, Demo verano, Idea para collab..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Género</label>
              <select
                value={newGenre}
                onChange={e => setNewGenre(e.target.value as MusicGenre)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1d1d28] border border-white/10 text-white text-xs font-semibold"
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Temática</label>
              <select
                value={newTheme}
                onChange={e => setNewTheme(e.target.value as SongTheme)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1d1d28] border border-white/10 text-white text-xs font-semibold"
              >
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Notas iniciales</label>
              <input
                type="text"
                placeholder="Ideas, referencia de sonido, BPM objetivo..."
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black transition"
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1.5">
        {(['active', 'all', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'active' ? `Activos (${activeProjects.length})` :
             f === 'archived' ? `Archivados (${archivedProjects.length})` :
             `Todos (${privateProjects.length})`}
          </button>
        ))}
      </div>

      {/* Project list */}
      {displayed.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
          <Music2 className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-300 font-bold">
            {filter === 'archived' ? 'No tienes proyectos archivados.' : 'No tienes proyectos en curso.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Haz clic en "Nuevo Proyecto" para guardar una idea sin publicarla.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(project => {
            const version = currentVersion(project);
            const isExpanded = expandedId === project.id;
            const isPublishing = publishingId === project.id;
            const isRenaming = renamingId === project.id;

            return (
              <div
                key={project.id}
                className={`rounded-2xl border transition ${
                  project.isArchived
                    ? 'bg-[#10101a] border-white/5 opacity-60'
                    : 'bg-[#181822] border-white/10 hover:border-white/15'
                }`}
              >
                {/* Project header row */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                      project.isArchived ? 'bg-white/5 text-slate-500' :
                      project.linkedSongId ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {project.isArchived ? '📦' : project.linkedSongId ? '✅' : '🎛️'}
                    </div>

                    <div className="min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(project.id)}
                            className="px-2 py-1 rounded-lg bg-white/10 border border-purple-500 text-white text-sm focus:outline-none w-48"
                          />
                          <button onClick={() => handleRenameSubmit(project.id)} className="text-emerald-400 hover:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setRenamingId(null)} className="text-slate-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h4 className="font-bold text-white text-sm truncate">{project.workingTitle}</h4>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span>{project.genre}</span>
                        <span>·</span>
                        <span>{project.theme}</span>
                        {version && (
                          <>
                            <span>·</span>
                            <span className={`font-bold ${qualityColor(version.qualityScore)}`}>
                              Q: {version.qualityScore}/100
                            </span>
                          </>
                        )}
                        {project.linkedSongId && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">PUBLICADO</span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          Sem. {project.createdAtWeek}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!project.isArchived && !project.linkedSongId && (
                      <button
                        onClick={() => {
                          setPublishingId(isPublishing ? null : project.id);
                          setExpandedId(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 transition"
                        title="Publicar como single"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Publicar</span>
                      </button>
                    )}
                    {!project.isArchived && (
                      <>
                        <button
                          onClick={() => { setRenamingId(project.id); setRenameValue(project.workingTitle); }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title="Renombrar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(project.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => archiveProject(project.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 transition"
                          title="Archivar"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Publish panel */}
                {isPublishing && !project.isArchived && !project.linkedSongId && (
                  <div className="mx-4 mb-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Publicar como Single</p>
                    <p className="text-[11px] text-slate-400">
                      Esto publicará "{project.workingTitle}" en tu discografía oficial. El presupuesto cubre producción final y marketing inicial.
                    </p>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Presupuesto de publicación</span>
                        <span className="text-emerald-400 font-black">{publishBudget.toLocaleString()} €</span>
                      </div>
                      <input
                        type="range"
                        min={200}
                        max={Math.min(50000, singer.economy.balance)}
                        step={200}
                        value={publishBudget}
                        onChange={e => setPublishBudget(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>200 € (mínimo)</span>
                        <span>Saldo: {singer.economy.balance.toLocaleString()} €</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setPublishingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handlePublish(project)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition"
                      >
                        ✅ Confirmar publicación
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    {/* Versions */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Versiones ({project.versions.length})
                      </p>
                      <div className="space-y-1.5">
                        {project.versions.map(v => (
                          <div
                            key={v.versionId}
                            className={`p-2.5 rounded-xl flex items-center justify-between text-[11px] ${
                              v.versionId === project.currentVersionId
                                ? 'bg-purple-500/15 border border-purple-500/30'
                                : 'bg-white/5 border border-white/5'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-white">{v.label}</span>
                              {v.versionId === project.currentVersionId && (
                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-black uppercase">ACTUAL</span>
                              )}
                              <p className="text-slate-400 mt-0.5">Sem. {v.createdAtWeek} • {v.contributions.length} contribución{v.contributions.length !== 1 ? 'es' : ''}</p>
                            </div>
                            <span className={`font-black text-sm ${qualityColor(v.qualityScore)}`}>
                              {v.qualityScore}/100
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity log */}
                    {project.activity.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Actividad</p>
                        <div className="space-y-1">
                          {project.activity.slice(-5).reverse().map((a, i) => (
                            <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                              <span className="text-slate-500 shrink-0">Sem. {a.week}</span>
                              <span>{a.actorName}: {a.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {project.notes && (
                      <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-slate-300 italic">
                        "{project.notes}"
                      </div>
                    )}

                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-semibold flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
