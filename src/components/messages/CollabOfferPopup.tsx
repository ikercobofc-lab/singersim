import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CollaborationProposal } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { 
  Sparkles, 
  Disc, 
  DollarSign, 
  X, 
  Users, 
  Flame, 
  CheckCircle2, 
  Radio, 
  Music,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CollabOfferPopupProps {
  proposal: CollaborationProposal | null;
  onClose: () => void;
}

export const CollabOfferPopup: React.FC<CollabOfferPopupProps> = ({ proposal, onClose }) => {
  const { albums, respondToCollaboration, setIsBzrpOpen, setIsOvyOpen, setIsBigOneOpen } = useGame();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');

  if (!proposal) return null;

  const inProgressAlbums = albums.filter(a => a.status === 'recording');
  const isBzrp = proposal.specialType === 'bzrp';
  const isOvy = proposal.specialType === 'w_sound';
  const isBigOne = proposal.specialType === 'crossover';
  const isRemix = proposal.isRemixOffer;

  const handleAcceptMine = (albumId?: string) => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 }
    });

    if (isBzrp) {
      setIsBzrpOpen(true);
      respondToCollaboration(proposal.id, true, 'player');
    } else if (isOvy) {
      setIsOvyOpen(true);
      respondToCollaboration(proposal.id, true, 'player');
    } else if (isBigOne) {
      setIsBigOneOpen(true);
      respondToCollaboration(proposal.id, true, 'player');
    } else {
      respondToCollaboration(proposal.id, true, 'player', albumId);
    }
    onClose();
  };

  const handleAcceptTheirs = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });

    respondToCollaboration(proposal.id, true, 'collaborator');
    onClose();
  };

  const handleReject = () => {
    respondToCollaboration(proposal.id, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-[#12111a] border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.3)] relative text-white space-y-5 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-black" />
              <span>PROPUESTA ESTELAR EMERGENTE</span>
            </span>

            {isRemix && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase">
                REMIX OFICIAL
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artist Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg border border-white/20 shrink-0">
            {proposal.fromArtist.avatar}
          </div>

          <div className="flex-1 truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white truncate">{proposal.fromArtist.name}</h3>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                {proposal.fromArtist.fameTier}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {formatNumber(proposal.fromArtist.followers)} seguidores • {proposal.artistOrigin || 'Internacional'}
            </p>

            {proposal.multipleArtists && proposal.multipleArtists.length > 0 && (
              <p className="text-[11px] text-amber-300 font-bold mt-1">
                Junte múltiple con: {proposal.multipleArtists.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Authentic Message Body */}
        <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 text-xs text-slate-200 leading-relaxed italic relative">
          "{proposal.message}"
        </div>

        {/* Proposal Details Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
          <span>Canción propuesta: <strong className="text-white">"{proposal.songTitleProposed}"</strong></span>
          <span className="text-emerald-400 font-bold">Género: {proposal.genre}</span>
        </div>

        {/* Ownership Decisions (Tema Mío vs Tema Suyo) */}
        <div className="space-y-2.5 pt-2">
          {isBzrp || isOvy || isBigOne ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/40 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Oportunidad Histórica Única en tu Carrera</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {isBzrp 
                  ? 'Entra al estudio de Bizarrap para grabar tu Music Session oficial personalizada. Solo se presenta 1 vez en tu trayectoria.' 
                  : isOvy 
                  ? 'Viaja a Medellín para grabar la W Sound #01 con Ovy On The Drums. Una sesión irrepetible en tu carrera.' 
                  : 'Súmate al Crossover oficial de Big One junto a otro cantante de renombre. Solo 1 Crossover en tu carrera.'}
              </p>
              <button
                onClick={() => handleAcceptMine()}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-xl ${
                  isBzrp
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-black shadow-cyan-500/30'
                    : isOvy
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/30'
                    : 'bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 text-white shadow-indigo-500/30'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>
                  {isBzrp ? '🎙️ Entrar y Grabar BZRP Music Session' : isOvy ? '🎹 Entrar y Grabar W Sound #01' : '🎛️ Entrar y Grabar Big One Crossover'}
                </span>
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                Decisión de Propiedad y Contrato Musical
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* OPTION 1: TEMA MÍO (ALBUM O SINGLE) */}
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-300 font-extrabold text-xs">
                      <Disc className="w-4 h-4 text-purple-400" />
                      <span>Tema Mío (Mi Álbum / Single)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      Sale bajo tu nombre como artista principal. Puedes incluirlo como pista producida en tu Álbum o lanzarlo como Single.
                    </p>
                  </div>

                  {inProgressAlbums.length > 0 ? (
                    <div className="space-y-1.5 pt-2">
                      <select
                        value={selectedAlbumId}
                        onChange={(e) => setSelectedAlbumId(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#222230] border border-white/10 text-white text-[11px]"
                      >
                        <option value="">Lanzar como Single Mío</option>
                        {inProgressAlbums.map(a => (
                          <option key={a.id} value={a.id}>Añadir a mi {a.projectType === 'ep' ? 'EP' : 'Álbum'} "{a.title}"</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAcceptMine(selectedAlbumId || undefined)}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition active:scale-95 shadow-md shadow-purple-600/30"
                      >
                        Aceptar como Tema Mío
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptMine()}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition active:scale-95 shadow-md shadow-purple-600/30 mt-2"
                    >
                      Aceptar como Single Mío
                    </button>
                  )}
                </div>

                {/* OPTION 2: TEMA SUYO */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Tema Suyo (Colaborador)</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/20">
                        +{formatCurrency(proposal.advancePayment || 25000)} Cash
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      Apareces como artista invitado (`feat. Tú`). El colaborador financia el videoclip y te abona un adelanto en efectivo inmediato. Gran arrastre de nuevos fans.
                    </p>
                  </div>

                  <button
                    onClick={handleAcceptTheirs}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black font-black text-xs transition active:scale-95 shadow-md shadow-emerald-500/20 mt-2"
                  >
                    Cobrar Adelanto y Grabar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Decline button */}
          <button
            onClick={handleReject}
            className="w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition"
          >
            Rechazar propuesta con respeto
          </button>
        </div>
      </div>
    </div>
  );
};
