import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SongCreator } from './SongCreator';
import { SocialSchedulerModal } from './SocialSchedulerModal';
import { Album, MusicGenre } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { 
  Disc, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  Share2, 
  Layers, 
  Music, 
  Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AlbumManager: React.FC = () => {
  const { singer, albums, scheduledSongs, createAlbum, releaseAlbum } = useGame();

  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumGenre, setNewAlbumGenre] = useState<MusicGenre>(singer?.genre || 'Urbano / Reggaeton');
  const [newProjectType, setNewProjectType] = useState<'album' | 'ep'>('album');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [activeRecordingAlbumId, setActiveRecordingAlbumId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'Tiktok viral' | 'Entrevista exclusiva' | 'Vallas y publicidad' | 'Polémica calculada'>('Tiktok viral');
  const [albumBudget, setAlbumBudget] = useState(3000);

  // Social scheduler modal state
  const [schedulerTargetAlbum, setSchedulerTargetAlbum] = useState<Album | null>(null);

  if (!singer) return null;

  const handleCreateNewAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    createAlbum(newAlbumTitle.trim(), newAlbumGenre, newProjectType);
    setNewAlbumTitle('');
    setIsCreatingAlbum(false);
  };

  const handleLaunchAlbum = (albumId: string) => {
    const alb = albums.find(a => a.id === albumId);
    if (!alb || alb.tracklist.length === 0) {
      alert('Debes preparar al menos 1 canción antes de lanzar este trabajo.');
      return;
    }

    const minTracks = alb.projectType === 'ep' ? 2 : 4;
    if (alb.tracklist.length < minTracks) {
      const confirmLow = window.confirm(
        `Un ${alb.projectType === 'ep' ? 'EP suele tener al menos 3' : 'Álbum suele tener al menos 6'} canciones. Actualmente tienes ${alb.tracklist.length}. ¿Deseas lanzarlo de todas formas?`
      );
      if (!confirmLow) return;
    }

    if (singer.stats.money < albumBudget) {
      alert('No tienes suficiente saldo para esta campaña de marketing.');
      return;
    }

    releaseAlbum(albumId, selectedStrategy, albumBudget);
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 }
    });
  };

  const inProgressAlbums = albums.filter(a => a.status === 'recording');
  const releasedAlbums = albums.filter(a => a.status === 'released');

  return (
    <div className="space-y-6">
      
      {/* Top Banner & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1a1a24] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-purple-400" />
              <span>Gestor de Álbumes y EPs (Track por Track)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prepara cada pista sin publicarla aún, añade colaboraciones de tus mensajes y programa el lanzamiento con horarios mundiales.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingAlbum(!isCreatingAlbum)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Nuevo Proyecto (Álbum o EP)</span>
        </button>
      </div>

      {/* 📅 SCHEDULED SONGS BANNER */}
      {scheduledSongs && scheduledSongs.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950/40 via-[#181824] to-[#181824] border border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Estrenos Programados ({scheduledSongs.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Los fans ya esperan estos drops</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scheduledSongs.map(song => (
              <div key={song.id} className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">{song.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Prod. por {song.producer} • {song.genre}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 mt-1 font-semibold">
                    <Clock className="w-3 h-3" />
                    Estreno: Semana {song.scheduledWeek} ({song.scheduledTime})
                  </span>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                    Hype: +{song.preReleaseHype || 15}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Project Creation Form (Album or EP) */}
      {isCreatingAlbum && (
        <form onSubmit={handleCreateNewAlbum} className="bg-[#14141d] p-5 sm:p-6 rounded-3xl border border-purple-500/40 space-y-5 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider">
              Configurar Nuevo Proyecto Discográfico
            </h3>
            <span className="text-xs text-slate-400">Elige el formato de publicación</span>
          </div>

          {/* Format Picker: EP vs LP Album */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Formato del Trabajo *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewProjectType('album')}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                  newProjectType === 'album'
                    ? 'bg-purple-600/20 border-purple-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">💿</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white">Álbum Completo (LP)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-bold uppercase">Mayor Hype</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    De 7 a 16 canciones. Proyecto de gran impacto mediático, elegible para disco del año y Grammys.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewProjectType('ep')}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                  newProjectType === 'ep'
                    ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">💽</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white">Extended Play (EP)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-bold uppercase">Rápido & Dinámico</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    De 3 a 6 canciones. Ideal para mantener relevancia entre discos, menor coste de campaña y producción ágil.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Título del {newProjectType === 'ep' ? 'EP' : 'Álbum'} *
              </label>
              <input
                type="text"
                required
                placeholder={newProjectType === 'ep' ? "Ej. 'Verano en Miami EP', 'Las 4 Estaciones'..." : "Ej. 'Donde Mueren las Estrellas', 'Data 2'..."}
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Género Principal</label>
              <select
                value={newAlbumGenre}
                onChange={(e) => setNewAlbumGenre(e.target.value as MusicGenre)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d28] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="Urbano / Reggaeton">Urbano / Reggaeton</option>
                <option value="Trap / Hip-Hop">Trap / Hip-Hop</option>
                <option value="Pop / Electropop">Pop / Electropop</option>
                <option value="R&B / Neo-Soul">R&B / Neo-Soul</option>
                <option value="Rock / Indie">Rock / Indie</option>
                <option value="Balada / Latino">Balada / Latino</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreatingAlbum(false)}
              className="px-3.5 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-md shadow-purple-600/30"
            >
              Crear {newProjectType === 'ep' ? 'EP' : 'Álbum'} en el Estudio
            </button>
          </div>
        </form>
      )}

      {/* Recording Sub-Studio if active */}
      {activeRecordingAlbumId && (
        <div className="relative">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-purple-400">
              Grabando para: {albums.find(a => a.id === activeRecordingAlbumId)?.title}
            </span>
            <button
              onClick={() => setActiveRecordingAlbumId(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Cerrar grabación de pista
            </button>
          </div>
          <SongCreator
            albumId={activeRecordingAlbumId}
            onSongCreated={() => setActiveRecordingAlbumId(null)}
          />
        </div>
      )}

      {/* In-Progress Albums & EPs List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Proyectos en Producción ({inProgressAlbums.length})
        </h3>

        {inProgressAlbums.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
            <Disc className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-slate-300 font-bold">No tienes ningún Álbum o EP en preparación actualmente.</p>
            <p className="text-xs text-slate-500 mt-1">Haz clic en "Iniciar Nuevo Proyecto" para preparar tu próximo lanzamiento.</p>
          </div>
        ) : (
          inProgressAlbums.map(album => {
            const isEp = album.projectType === 'ep';

            return (
              <div key={album.id} className="bg-[#181822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${album.coverGradient} flex items-center justify-center text-2xl shadow-md`}>
                      {isEp ? '💽' : '💿'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-white">{album.title}</h4>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase border ${
                          isEp 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' 
                            : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                        }`}>
                          {isEp ? 'EP (Extended Play)' : 'Álbum Completo (LP)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{album.genre} • {album.tracklist.length} pistas preparadas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Social Media Announcer Button */}
                    <button
                      type="button"
                      onClick={() => setSchedulerTargetAlbum(album)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Anunciar en Redes</span>
                    </button>

                    <button
                      onClick={() => setActiveRecordingAlbumId(activeRecordingAlbumId === album.id ? null : album.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Grabar Pista para Este {isEp ? 'EP' : 'Disco'}</span>
                    </button>
                  </div>
                </div>

                {/* Tracklist table */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tracklist Actual (Sin Publicar)
                  </p>
                  {album.tracklist.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-white/5 rounded-xl">
                      Aún no has añadido canciones. Graba pistas o acepta colaboraciones de tus DMs para integrarlas aquí.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {album.tracklist.map((track, idx) => (
                        <div key={track.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-500 font-bold w-4 text-center">{idx + 1}</span>
                            <div>
                              <span className="font-bold text-white">{track.title}</span>
                              {track.featuredArtists.length > 0 && (
                                <span className="text-purple-300 ml-1 text-[11px]">(feat. {track.featuredArtists.join(', ')})</span>
                              )}
                              <p className="text-[10px] text-slate-400">Prod. por {track.producer} • {track.theme}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                            Calidad: {track.quality}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Launch Settings & Campaign */}
                {album.tracklist.length > 0 && (
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Estrategia de Lanzamiento</label>
                        <select
                          value={selectedStrategy}
                          onChange={(e) => setSelectedStrategy(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#20202c] border border-white/10 text-white text-xs"
                        >
                          <option value="Tiktok viral">Campaña TikTok Viral (Máximo Hype Joven)</option>
                          <option value="Entrevista exclusiva">Entrevistas Exclusivas & Portada</option>
                          <option value="Vallas y publicidad">Vallas en Grandes Ciudades</option>
                          <option value="Polémica calculada">Polémica Calculada en Redes</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300 uppercase">Presupuesto Campaña</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(albumBudget)}</span>
                        </div>
                        <input
                          type="range"
                          min={1000}
                          max={Math.max(5000, Math.min(singer.stats.money, 80000))}
                          step={500}
                          value={albumBudget}
                          onChange={(e) => setAlbumBudget(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchAlbum(album.id)}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                        isEp
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black shadow-cyan-500/20'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white shadow-purple-600/30'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        Lanzar {isEp ? `EP "${album.title}"` : `Álbum "${album.title}"`} Completo ({album.tracklist.length} Pistas)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Released Albums & EPs Catalog */}
      {releasedAlbums.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Discografía Publicada ({releasedAlbums.length} Proyectos)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {releasedAlbums.map(alb => (
              <div key={alb.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${alb.coverGradient} flex items-center justify-center text-lg`}>
                    {alb.projectType === 'ep' ? '💽' : '📀'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">{alb.title}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold uppercase">
                        {alb.projectType === 'ep' ? 'EP' : 'LP'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{alb.tracklist.length} canciones • Año {alb.releaseYear}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Crítica: {alb.criticScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Scheduler Modal if open for an album */}
      {schedulerTargetAlbum && (
        <SocialSchedulerModal
          isOpen={true}
          onClose={() => setSchedulerTargetAlbum(null)}
          titleProposed={schedulerTargetAlbum.title}
          projectType={schedulerTargetAlbum.projectType}
          onScheduledSuccess={(week, time, hypeBonus) => {
            alert(`📢 ¡Campaña publicada en redes! Horarios sincronizados activados para "${schedulerTargetAlbum.title}". +${hypeBonus}% Hype.`);
            setSchedulerTargetAlbum(null);
          }}
        />
      )}
    </div>
  );
};
