import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import { FAMOUS_ARTISTS } from '../../data/artists';
import { 
  getPlayerFameTier, 
  checkBzrpEligibility, 
  checkCrossoverOrWSoundEligibility, 
  evaluateCollabPermission 
} from '../../utils/collabRules';
import { NPCArtist } from '../../types';
import { 
  Mail, 
  Check, 
  X, 
  Sparkles, 
  MessageSquare, 
  Disc, 
  Radio, 
  Volume2, 
  Users, 
  Send, 
  Lock, 
  HelpCircle, 
  Flame, 
  Award,
  Search,
  CheckCircle2
} from 'lucide-react';

export const InboxModal: React.FC = () => {
  const { 
    singer,
    inbox, 
    discography,
    albums, 
    globalCharts,
    countryCharts,
    respondToCollaboration, 
    proposeCollaboration,
    setIsBzrpOpen, 
    setIsOvyOpen,
    setIsBigOneOpen 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'inbox' | 'directory' | 'rules'>('inbox');
  const [selectedAlbumForCollab, setSelectedAlbumForCollab] = useState<Record<string, string>>({});
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'can_propose' | 'peer' | 'mentor' | 'unlocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for proposing collab to an artist
  const [targetArtistForModal, setTargetArtistForModal] = useState<NPCArtist | null>(null);
  const [proposeFormat, setProposeFormat] = useState<'single' | 'album' | 'remix'>('single');
  const [targetAlbumId, setTargetAlbumId] = useState<string>('');
  const [originalSongId, setOriginalSongId] = useState<string>('');

  if (!singer) return null;

  const playerTier = getPlayerFameTier(singer, discography);
  const bzrpStatus = checkBzrpEligibility(singer, discography, globalCharts, countryCharts);
  const crossoverStatus = checkCrossoverOrWSoundEligibility(singer, discography, globalCharts, countryCharts);

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

  const handleSendProposal = () => {
    if (!targetArtistForModal) return;
    const albumIdToUse = (proposeFormat === 'album' || proposeFormat === 'remix') ? (targetAlbumId || inProgressAlbums[0]?.id) : undefined;
    
    if (proposeFormat === 'album' && !albumIdToUse) {
      alert('Debes tener un álbum en grabación en el Estudio para seleccionar esta opción.');
      return;
    }

    if (proposeFormat === 'remix' && !originalSongId) {
      alert('Selecciona la canción que quieres convertir en remix.');
      return;
    }

    const res = proposeCollaboration(targetArtistForModal.id, proposeFormat, albumIdToUse, originalSongId || undefined);
    alert(res.message);
    if (res.success) {
      setTargetArtistForModal(null);
    }
  };

  // Filtered artists in directory
  const filteredArtists = FAMOUS_ARTISTS.filter(artist => {
    if (searchQuery && !artist.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    const perm = evaluateCollabPermission(singer, discography, artist, inbox);
    if (directoryFilter === 'can_propose') return perm.canPropose;
    if (directoryFilter === 'peer') return perm.relationType === 'peer';
    if (directoryFilter === 'mentor') return perm.relationType === 'mentor_small';
    if (directoryFilter === 'unlocked') return perm.relationType === 'unlocked_famous';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Centro de Colaboraciones & DMs
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {playerTier}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Consulta tu status y gestiona las invitaciones que recibas en tus DMs.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Bandeja DMs</span>
            {pendingMessages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Proponer Colaboración</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'rules'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ver reglas de colaboración"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reglas</span>
          </button>
        </div>
      </div>

      {/* Popularity & Milestones Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Player Status Card */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tu Estatus de Popularidad</p>
            <p className="text-base font-black text-white">{playerTier}</p>
            <p className="text-[11px] text-slate-400">{singer.stats.fans.toLocaleString()} oyentes • {discography.length} canciones</p>
          </div>
          <span className="text-2xl">🔥</span>
        </div>

        {/* BZRP Session Status Card */}
        <div className={`p-3.5 rounded-2xl border transition ${
          bzrpStatus.eligible 
            ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300'
            : singer.bzrpSessionCompleted
            ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
            : 'bg-white/5 border-white/10 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">BZRP Music Session</span>
            <Radio className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-bold text-white mt-1">
            {singer.bzrpSessionCompleted 
              ? '✓ Session Realizada' 
              : bzrpStatus.eligible 
              ? '📩 Puede llegar una invitación de Bizarrap' 
              : 'A la espera de que Bizarrap te descubra'}
          </p>
          <p className="text-[10px] opacity-80 truncate">{bzrpStatus.reason}</p>
        </div>

        {/* Crossover / W Sound Status Card */}
        <div className={`p-3.5 rounded-2xl border transition ${
          crossoverStatus.eligible 
            ? 'bg-amber-500/10 border-amber-400/40 text-amber-300'
            : (singer.ovyWSoundCompleted && singer.bigOneCrossoverCompleted)
            ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
            : 'bg-white/5 border-white/10 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">Crossover & W Sound</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-bold text-white mt-1">
            {crossoverStatus.eligible 
              ? '🌟 ¡Top Nacional / Global Conquistado!' 
              : 'Requiere Top en tu País o Global'}
          </p>
          <p className="text-[10px] opacity-80 truncate">{crossoverStatus.reason}</p>
        </div>
      </div>

      {/* TAB 1: BANDEJA DE DMs */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
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
                Tienes <strong>{discography.length} canciones</strong>, ¡bien! Pero ninguna ha alcanzado aún los <strong>500K streams</strong> ni entrado al top 20. Sigue promocionando y mejorando tus temas hasta conseguir ese primer gran hit que llame la atención de otros artistas.
              </p>
            </div>
          ) : pendingMessages.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
              <p className="text-sm text-slate-300 font-semibold">No tienes mensajes directos pendientes en este momento.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sigue sacando canciones y avanzando semanas. Si eres emergente y sacas una bomba, ¡artistas grandes te escribirán para remixes o temas suyos! También puedes usar la pestaña <strong>"Proponer Colaboración"</strong>.
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
                          <h4 className="font-extrabold text-white text-base">{prop.fromArtist.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            {prop.fromArtist.fameTier}
                          </span>
                          {prop.artistOrigin && (
                            <span className="text-[10px] text-slate-400">({prop.artistOrigin})</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Propone tema: <strong className="text-white">"{prop.songTitleProposed}"</strong> • {prop.genre}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">{prop.timestamp}</span>
                  </div>

                  {/* Message body */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed italic">
                    "{prop.message}"
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => respondToCollaboration(prop.id, false)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>

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

                    <button
                      onClick={() => handleAcceptMineSingle(prop.id, prop.specialType)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                        isBzrp
                          ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-black shadow-cyan-500/30 font-black'
                          : isOvy
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/30 font-black'
                          : isBigOne
                          ? 'bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 text-white shadow-indigo-500/30 font-black'
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

                    {!isBzrp && !isOvy && !isBigOne && (
                      <button
                        onClick={() => handleAcceptTheirs(prop.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        <span>Cobrar Adelanto (+{formatCurrency(prop.advancePayment || 25000)})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

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
      )}

      {/* TAB 2: DIRECTORIO DE ARTISTAS & PROPONER COLABORACIÓN */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar artista por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setDirectoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  directoryFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({FAMOUS_ARTISTS.length})
              </button>
              <button
                onClick={() => setDirectoryFilter('can_propose')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  directoryFilter === 'can_propose' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Disponibles Hoy
              </button>
              <button
                onClick={() => setDirectoryFilter('peer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  directoryFilter === 'peer' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Mismo Nivel (Pares)
              </button>
              <button
                onClick={() => setDirectoryFilter('mentor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  directoryFilter === 'mentor' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Para Apadrinar
              </button>
              <button
                onClick={() => setDirectoryFilter('unlocked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  directoryFilter === 'unlocked' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Desbloqueados
              </button>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredArtists.map(artist => {
              const perm = evaluateCollabPermission(singer, discography, artist, inbox);

              return (
                <div
                  key={artist.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    perm.canPropose
                      ? 'bg-[#151520] border-white/10 hover:border-purple-500/50 shadow-lg'
                      : 'bg-[#101017] border-white/5 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                          {artist.avatar}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            {artist.name}
                            {artist.origin && (
                              <span className="text-[10px] text-slate-400 font-normal">({artist.origin})</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {artist.genre} • {(artist.followers / 1000000).toFixed(1)}M seguidores
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                        {artist.fameTier}
                      </span>
                    </div>

                    {/* Rule Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${perm.badgeColor}`}>
                        {perm.canPropose ? '✓ ' : '🔒 '}{perm.badgeText}
                      </span>
                    </div>

                    {/* Explanation */}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {perm.explanation}
                    </p>
                  </div>

                  {/* Propose Action */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {perm.canPropose ? 'Listo para entrar al estudio' : 'Acceso restringido por estatus'}
                    </span>

                    {perm.canPropose ? (
                      <button
                        onClick={() => {
                          setTargetArtistForModal(artist);
                          setProposeFormat('single');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Proponer Colaboración</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold flex items-center gap-1 cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Bloqueado</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REGLAS DE COLABORACIÓN */}
      {activeTab === 'rules' && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Reglas Oficiales de la Industria Musical</h3>
              <p className="text-xs text-slate-400">Cómo funciona el sistema de colaboraciones, respeto y fama en el juego.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule 1: BZRP */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Radio className="w-4 h-4" />
                <span>Colaboración en una BZRP Session</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para que Bizarrap te invite a su estudio de Buenos Aires a grabar una sesión histórica, debes cumplir <strong>al menos una</strong> de estas 3 condiciones:
              </p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li><strong>Emergente con talento fresco:</strong> Entre 20K y 250K oyentes y al menos 1 tema que haya explotado (500K+ streams o Top 20).</li>
                <li><strong>Leyenda consagrada:</strong> Gran trayectoria (+1.5M oyentes o reputación &gt;= 80).</li>
                <li><strong>El Artista del Momento:</strong> Tener actualmente un tema en el Top 3 nacional o Top 5 Global.</li>
              </ul>
            </div>

            {/* Rule 2: Crossover & W Sound */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Crossover (Big One) y W Sound (Ovy)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tanto Big One como Ovy On The Drums arman sus proyectos saga con figuras consolidadas. Debes ser:
              </p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li><strong>Top en tu país:</strong> Canción en el Top 10 del Spotify nacional de tu país, o más de 350K oyentes consolidados.</li>
                <li><strong>Top Internacionalmente:</strong> Canción en el Top 20 Global de Spotify o más de 900K oyentes internacionales.</li>
              </ul>
            </div>

            {/* Rule 3: Colabos si eres Famoso */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Colaboraciones si ya eres Famoso</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cuando ya tienes nombre en la industria:
              </p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li><strong>Con artistas más pequeños:</strong> Puedes pedirles colaboración tú mismo para apadrinarlos y ayudarlos a crecer en su carrera.</li>
                <li><strong>Con artistas iguales o mayores:</strong> Debes haber recibido previamente una propuesta o contacto suyo para poder proponerles tú un tema.</li>
              </ul>
            </div>

            {/* Rule 4: Colabos si eres Emergente */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>Colaboraciones si eres Pequeño o Emergente</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                En tus primeros pasos en la música:
              </p>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li><strong>Pares de tu mismo nivel:</strong> Puedes recibir y proponer colaboraciones con artistas emergentes y promesas similares.</li>
                <li><strong>Conseguir que los grandes se fijen en ti:</strong> Debes sacar una <strong>bomba</strong> (canción viral que supere los 500K o 1M de streams). Esto hará que artistas consagrados te ofrezcan remixes de tu tema o canciones a su nombre contigo como feat.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROPOSE COLLAB TO SELECTED ARTIST */}
      {targetArtistForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141d] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl border border-white/20">
                  {targetArtistForModal.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Proponer Junte a {targetArtistForModal.name}</h3>
                  <p className="text-xs text-slate-400">{targetArtistForModal.fameTier} • {targetArtistForModal.genre}</p>
                </div>
              </div>
              <button
                onClick={() => setTargetArtistForModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">¿Dónde lanzar el tema?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setProposeFormat('single')}
                  className={`p-3 rounded-xl border text-left transition ${
                    proposeFormat === 'single'
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">Single Oficial</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sale directo a tu discografía</p>
                </button>

                <button
                  onClick={() => setProposeFormat('remix')}
                  disabled={discography.length === 0}
                  className={`p-3 rounded-xl border text-left transition ${
                    discography.length === 0
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5'
                      : proposeFormat === 'remix'
                      ? 'bg-cyan-600/20 border-cyan-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">Remix de una canción</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {discography.length === 0 ? 'No tienes canciones publicadas' : 'Elige qué tema remezclar'}
                  </p>
                </button>

                <button
                  onClick={() => setProposeFormat('album')}
                  disabled={inProgressAlbums.length === 0}
                  className={`p-3 rounded-xl border text-left transition ${
                    inProgressAlbums.length === 0 
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5' 
                      : proposeFormat === 'album'
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">Track de Álbum/EP</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {inProgressAlbums.length === 0 ? 'No tienes álbum en grabación' : 'Sumar a tu próximo disco'}
                  </p>
                </button>
              </div>

              {proposeFormat === 'remix' && discography.length > 0 && (
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Seleccionar canción para el remix:</label>
                  <select
                    value={originalSongId || discography[0].id}
                    onChange={(e) => setOriginalSongId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  >
                    {discography.map(song => (
                      <option key={song.id} value={song.id}>{song.title} · {song.streamsTotal.toLocaleString()} streams</option>
                    ))}
                  </select>
                </div>
              )}

              {(proposeFormat === 'album' || proposeFormat === 'remix') && inProgressAlbums.length > 0 && (
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Seleccionar Álbum de destino:</label>
                  <select
                    value={targetAlbumId || inProgressAlbums[0].id}
                    onChange={(e) => setTargetAlbumId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  >
                    {inProgressAlbums.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.tracklist.length} canciones)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Budget and Impact Preview */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Coste de producción en estudio:</span>
                <strong className="text-white">{proposeFormat === 'single' ? '10.000 €' : '6.000 €'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Energía requerida:</span>
                <strong className="text-amber-400">15 Energía</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Previsión de nuevos oyentes:</span>
                <strong className="text-emerald-400">+{(Math.floor(targetArtistForModal.followers * 0.04) + 15000).toLocaleString()} oyentes</strong>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTargetArtistForModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendProposal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-1.5 active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Grabar Junte</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
