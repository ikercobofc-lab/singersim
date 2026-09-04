import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import { Mail, Check, X, Sparkles, MessageSquare, Disc, Radio, Volume2 } from 'lucide-react';

export const InboxModal: React.FC = () => {
  const { 
    inbox, 
    discography,
    albums, 
    respondToCollaboration, 
    setIsBzrpOpen, 
    setIsOvyOpen,
    setIsBigOneOpen 
  } = useGame();

  const [selectedAlbumForCollab, setSelectedAlbumForCollab] = useState<Record<string, string>>({});

  const pendingMessages = inbox.filter(m => m.status === 'pending');
  const pastMessages = inbox.filter(m => m.status !== 'pending');
  const inProgressAlbums = albums.filter(a => a.status === 'recording');

  const handleAcceptMineSingle = (proposalId: string, specialType?: 'standard' | 'bzrp' | 'w_sound' | 'crossover') => {
    if (specialType === 'bzrp') {
      setIsBzrpOpen(true);
      respondToCollaboration(proposalId, true, 'player');
    } else if (specialType === 'w_sound') {
      setIsOvyOpen(true);
      respondToCollaboration(proposalId, true, 'player');
    } else if (specialType === 'crossover') {
      setIsBigOneOpen(true);
      respondToCollaboration(proposalId, true, 'player');
    } else {
      respondToCollaboration(proposalId, true, 'player');
    }
  };

  const handleAcceptMineAlbum = (proposalId: string) => {
    const albumId = selectedAlbumForCollab[proposalId] || (inProgressAlbums[0] ? inProgressAlbums[0].id : undefined);
    if (!albumId) {
      alert('Debes tener un álbum en preparación en el Estudio para poder incluir esta colaboración.');
      return;
    }
    respondToCollaboration(proposalId, true, 'player', albumId);
  };

  const handleAcceptTheirs = (proposalId: string) => {
    respondToCollaboration(proposalId, true, 'collaborator');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Bandeja de Mensajes Directos (DMs)</h2>
            <p className="text-xs text-slate-400">
              Conforme ganas fama y oyentes, cantantes y productores te proponen colaboraciones. Puedes lanzarlas como singles o sumarlas a tu álbum.
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
          {pendingMessages.length} Pendientes
        </span>
      </div>

      {/* Pending Messages List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Propuestas Recibidas ({pendingMessages.length})
        </h3>

        {discography.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-xl">
              🎙️
            </div>
            <p className="text-sm text-white font-bold">Aún no has publicado ninguna canción</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Necesitas al menos <strong>5 canciones publicadas</strong> y que <strong>una de ellas haya explotado</strong> (500K+ streams) para que otros artistas y productores se interesen en ti. ¡Entra al Estudio y empieza a crear!
            </p>
          </div>
        ) : discography.length < 5 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto text-xl">
              📈
            </div>
            <p className="text-sm text-white font-bold">Necesitas más catálogo</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Llevas <strong>{discography.length} canción{discography.length !== 1 ? 'es' : ''}</strong> publicada{discography.length !== 1 ? 's' : ''}. Sigue sacando música hasta llegar a <strong>5</strong> y conseguir que al menos <strong>una explote</strong> para que te lleguen propuestas.
            </p>
          </div>
        ) : !discography.some(s => s.streamsTotal >= 500000 || (s.currentChartPosition || 99) <= 20) ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto text-xl">
              🔥
            </div>
            <p className="text-sm text-white font-bold">Necesitas que una canción explote</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Tienes <strong>{discography.length} canciones</strong>, ¡bien! Pero ninguna ha alcanzado aún los <strong>500K streams</strong> ni entrado al top 20. Sigue promocionando y mejorando tus temas hasta conseguir ese primer gran hit.
            </p>
          </div>
        ) : pendingMessages.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
            <p className="text-sm text-slate-300 font-semibold">No tienes mensajes directos pendientes en este momento.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sigue sacando singles, acumulando oyentes y aumentando tu status. Conforme tus canciones crezcan, te escribirán nuevos cantantes y productores.
            </p>
          </div>
        ) : (
          pendingMessages.map(prop => {
            const isBzrp = prop.specialType === 'bzrp';
            const isOvy = prop.specialType === 'w_sound';
            const isBigOne = prop.specialType === 'crossover';

            return (
              <div 
                key={prop.id} 
                className={`border rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden transition ${
                  isBzrp 
                    ? 'bg-gradient-to-br from-[#061826] to-[#0c121e] border-cyan-400/50 shadow-cyan-500/10'
                    : isOvy
                    ? 'bg-gradient-to-br from-[#241c08] to-[#141208] border-amber-400/50 shadow-amber-500/10'
                    : isBigOne
                    ? 'bg-gradient-to-br from-[#0e0d22] to-[#0a0a14] border-indigo-500/50 shadow-indigo-500/15'
                    : 'bg-[#181822] border-white/10'
                }`}
              >
                {/* Special Milestone Banner */}
                {isBzrp && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Propuesta Exclusiva • BZRP Music Session (Única en la carrera)</span>
                  </div>
                )}
                {isOvy && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Propuesta Exclusiva • Ovy On The Drums W Sound (Única en la carrera)</span>
                  </div>
                )}
                {isBigOne && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                    <span>Propuesta Exclusiva • Big One Crossover #{prop.crossoverNumber || 8} (Único en la carrera)</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-2xl border border-white/20 shadow-md">
                      {prop.fromArtist.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-white">{prop.fromArtist.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                          {prop.fromArtist.fameTier}
                        </span>
                      </div>
                      <p className="text-xs text-purple-300 font-medium">{prop.timestamp} • {prop.role === 'feat' ? 'Propuesta de Featuring' : 'Producción'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-extrabold block">+{formatCurrency(prop.budgetOffered)}</span>
                    <span className="text-[10px] text-slate-400">{prop.splitOffer}% Royalties</span>
                  </div>
                </div>

                {/* Message Quote */}
                <div className="p-3.5 rounded-xl bg-white/5 text-xs text-slate-200 leading-relaxed border border-white/5 italic">
                  "{prop.message}"
                </div>

                {/* Proposed Song details */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
                  <span>Pista propuesta: <strong className="text-white">"{prop.songTitleProposed}"</strong></span>
                  <span>Género: <strong className="text-white">{prop.genre}</strong></span>
                </div>

                {/* Decision Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => respondToCollaboration(prop.id, false)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rechazar</span>
                  </button>

                  {/* Accept as Album Track option (if not special bzrp/w_sound) */}
                  {!isBzrp && !isOvy && inProgressAlbums.length > 0 && (
                    <div className="flex items-center gap-1">
                      {inProgressAlbums.length > 1 && (
                        <select
                          value={selectedAlbumForCollab[prop.id] || inProgressAlbums[0].id}
                          onChange={(e) => setSelectedAlbumForCollab({ ...selectedAlbumForCollab, [prop.id]: e.target.value })}
                          className="px-2 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                        >
                          {inProgressAlbums.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => handleAcceptMineAlbum(prop.id)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition active:scale-95"
                      >
                        <Disc className="w-3.5 h-3.5" />
                        <span>Aceptar en mi Álbum</span>
                      </button>
                    </div>
                  )}

                  {/* Accept as Standalone Single (Tema Mío) */}
                  <button
                    onClick={() => handleAcceptMineSingle(prop.id, prop.specialType)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                      isBzrp
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-black shadow-cyan-500/30'
                        : isOvy
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/30'
                        : isBigOne
                        ? 'bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 text-white shadow-indigo-500/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {isBzrp 
                        ? 'Grabar BZRP Session' 
                        : isOvy 
                        ? 'Grabar W Sound' 
                        : isBigOne 
                        ? 'Grabar Big One Crossover' 
                        : 'Aceptar como Single Mío'}
                    </span>
                  </button>

                  {/* Accept as Collaborator's Track (Tema Suyo - Cash Advance) */}
                  {!isBzrp && !isOvy && !isBigOne && (
                    <button
                      onClick={() => handleAcceptTheirs(prop.id)}
                      className="px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
                    >
                      <span>Cobrar Adelanto (+{formatCurrency(prop.advancePayment || 25000)})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Past Messages History */}
      {pastMessages.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historial de Conversaciones</h3>
          <div className="space-y-1.5">
            {pastMessages.map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-white/5 text-xs flex items-center justify-between opacity-75">
                <div className="flex items-center gap-2">
                  <span>{m.fromArtist.avatar}</span>
                  <span className="font-semibold text-white">{m.fromArtist.name}</span>
                  <span className="text-slate-400">- {m.songTitleProposed}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  m.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {m.status === 'accepted' ? 'Colaboración Grabada' : 'Rechazada'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
