/**
 * DJPlaylistCreator.tsx
 * 
 * Interfaz para que los DJs creen playlists personalizadas
 * seleccionando canciones propias y de otros artistas,
 * ordenándolas y configurando transiciones.
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DJPlaylist, DJPlaylistTrack, Song, NPCSong } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { 
  ListMusic, Plus, Trash2, ChevronUp, ChevronDown, 
  Save, Music2, Clock, Activity, CheckCircle2, X 
} from 'lucide-react';

interface DJPlaylistCreatorProps {
  onClose: () => void;
  existingPlaylist?: DJPlaylist;
}

export const DJPlaylistCreator: React.FC<DJPlaylistCreatorProps> = ({ onClose, existingPlaylist }) => {
  const { singer, discography, npcSongs } = useGame();
  
  const [title, setTitle] = useState(existingPlaylist?.title || '');
  const [description, setDescription] = useState(existingPlaylist?.description || '');
  const [selectedTracks, setSelectedTracks] = useState<DJPlaylistTrack[]>(existingPlaylist?.tracks || []);
  const [selectedTag, setSelectedTag] = useState<string>('club');
  const [showSongPicker, setShowSongPicker] = useState(false);
  
  if (!singer) return null;
  
  // Todas las canciones disponibles (propias + NPCs)
  const availableSongs = [
    ...discography.filter(s => s.status === 'released'),
    ...npcSongs
  ];
  
  const addTrackToPlaylist = (song: Song | NPCSong) => {
    const isNPC = 'artistName' in song;
    const newTrack: DJPlaylistTrack = {
      id: `track_${Date.now()}_${Math.random()}`,
      position: selectedTracks.length + 1,
      songId: song.id,
      songTitle: song.title,
      artistName: isNPC ? song.artistName : (song as Song).producerName,
      bpm: (song as any).melodyConfig?.bpm || 120,
      key: (song as any).melodyConfig?.musicalKey || 'C',
      duration: 180, // Duración por defecto 3 min
      transitionType: 'fade',
      notes: '',
    };
    
    setSelectedTracks([...selectedTracks, newTrack]);
    setShowSongPicker(false);
  };
  
  const removeTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.id !== trackId));
  };
  
  const moveTrack = (trackId: string, direction: 'up' | 'down') => {
    const index = selectedTracks.findIndex(t => t.id === trackId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedTracks.length - 1) return;
    
    const newTracks = [...selectedTracks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTracks[index], newTracks[targetIndex]] = [newTracks[targetIndex], newTracks[index]];
    
    // Reajustar posiciones
    newTracks.forEach((track, i) => {
      track.position = i + 1;
    });
    
    setSelectedTracks(newTracks);
  };
  
  const updateTransition = (trackId: string, transitionType: DJPlaylistTrack['transitionType']) => {
    setSelectedTracks(selectedTracks.map(t => 
      t.id === trackId ? { ...t, transitionType } : t
    ));
  };
  
  const calculatePlaylistStats = () => {
    if (selectedTracks.length === 0) return { duration: 0, avgBPM: 0 };
    
    const totalDuration = selectedTracks.reduce((sum, t) => sum + t.duration, 0);
    const avgBPM = Math.round(
      selectedTracks.reduce((sum, t) => sum + t.bpm, 0) / selectedTracks.length
    );
    
    return {
      duration: Math.round(totalDuration / 60), // minutos
      avgBPM
    };
  };
  
  const savePlaylist = () => {
    if (!title.trim() || selectedTracks.length < 2) {
      alert('La playlist necesita un título y al menos 2 canciones.');
      return;
    }
    
    const stats = calculatePlaylistStats();
    
    const playlist: DJPlaylist = {
      id: existingPlaylist?.id || `playlist_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      createdAtWeek: existingPlaylist?.createdAtWeek || singer.career.careerWeek,
      updatedAtWeek: singer.career.careerWeek,
      tracks: selectedTracks,
      totalDuration: stats.duration,
      averageBPM: stats.avgBPM,
      dominantGenre: discography[0]?.genre || 'Electrónica / House',
      tags: [selectedTag],
      timesPlayed: existingPlaylist?.timesPlayed || 0,
      audienceFeedback: existingPlaylist?.audienceFeedback || 50,
      status: 'active',
    };
    
    // TODO: Añadir al GameContext
    console.log('Playlist guardada:', playlist);
    alert(`✅ Playlist "${title}" guardada con ${selectedTracks.length} tracks!`);
    onClose();
  };
  
  const stats = calculatePlaylistStats();
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14141d] border border-purple-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <ListMusic className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {existingPlaylist ? 'Editar Playlist' : 'Nueva Playlist DJ'}
                </h2>
                <p className="text-xs text-slate-400">
                  Crea una secuencia de canciones para tus sets
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Form básico */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Título de la Playlist
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Club Warmup Set, Festival Main Stage..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para qué tipo de evento es este set..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Tag
              </label>
              <div className="flex gap-2">
                {['club', 'festival', 'radio', 'warmup', 'peak', 'closing'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedTag === tag
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        {selectedTracks.length > 0 && (
          <div className="px-6 py-4 bg-purple-950/20 border-b border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  <span className="font-bold text-white">{selectedTracks.length}</span> tracks
                </span>
                <span className="text-slate-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  <span className="font-bold text-white">{stats.duration}</span> min
                </span>
                <span className="text-slate-400">
                  <Activity className="w-3 h-3 inline mr-1" />
                  <span className="font-bold text-white">{stats.avgBPM}</span> BPM promedio
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Tracks list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {selectedTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-bold mb-1">No hay tracks en la playlist</p>
              <p className="text-xs text-slate-500">
                Añade canciones para empezar a construir tu set
              </p>
            </div>
          ) : (
            selectedTracks.map((track, index) => (
              <div
                key={track.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
              >
                {/* Position */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveTrack(track.id, 'up')}
                    disabled={index === 0}
                    className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="text-xs font-black text-slate-500 text-center">{track.position}</span>
                  <button
                    onClick={() => moveTrack(track.id, 'down')}
                    disabled={index === selectedTracks.length - 1}
                    className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{track.songTitle}</p>
                  <p className="text-xs text-slate-400">
                    {track.artistName} · {track.bpm} BPM · {track.key}
                  </p>
                </div>
                
                {/* Transition selector */}
                <select
                  value={track.transitionType}
                  onChange={(e) => updateTransition(track.id, e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white"
                >
                  <option value="fade">Fade</option>
                  <option value="cut">Cut</option>
                  <option value="beatmatch">Beatmatch</option>
                  <option value="slam">Slam</option>
                </select>
                
                {/* Remove */}
                <button
                  onClick={() => removeTrack(track.id)}
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
          
          {/* Add track button */}
          <button
            onClick={() => setShowSongPicker(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-400 hover:text-purple-300 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Añadir canción
          </button>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-bold text-sm transition"
          >
            Cancelar
          </button>
          
          <button
            onClick={savePlaylist}
            disabled={!title.trim() || selectedTracks.length < 2}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="w-4 h-4" />
            {existingPlaylist ? 'Actualizar Playlist' : 'Guardar Playlist'}
          </button>
        </div>
      </div>
      
      {/* Song Picker Modal */}
      {showSongPicker && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-white">Seleccionar Canción</h3>
              <button onClick={() => setShowSongPicker(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableSongs.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  No hay canciones disponibles. Lanza tu primera canción primero.
                </p>
              ) : (
                availableSongs.map(song => {
                  const alreadyInPlaylist = selectedTracks.some(t => t.songId === song.id);
                  return (
                    <button
                      key={song.id}
                      onClick={() => !alreadyInPlaylist && addTrackToPlaylist(song)}
                      disabled={alreadyInPlaylist}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between ${
                        alreadyInPlaylist
                          ? 'bg-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{song.title}</p>
                        <p className="text-xs text-slate-400">
                          {('artistName' in song && (song as unknown as NPCSong).artistName) || (song as Song).producerName} · {(song as any).melodyConfig?.bpm || 120} BPM · {song.genre}
                        </p>
                      </div>
                      {alreadyInPlaylist && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
