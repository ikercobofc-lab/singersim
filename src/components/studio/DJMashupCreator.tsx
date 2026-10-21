/**
 * DJMashupCreator.tsx
 * 
 * Interfaz para que los DJs creen mashups combinando exactamente 2 canciones.
 * Verifica compatibilidad de BPM y key, sugiere ajustes necesarios.
 */

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DJMashup, DJMashupSource, Song, NPCSong, MashupCompatibility } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { 
  Shuffle, Music2, X, AlertCircle, CheckCircle2, 
  Zap, Activity, Music, Save, Sparkles
} from 'lucide-react';

interface DJMashupCreatorProps {
  onClose: () => void;
}

export const DJMashupCreator: React.FC<DJMashupCreatorProps> = ({ onClose }) => {
  const { singer, discography, npcSongs } = useGame();
  
  const [songA, setSongA] = useState<Song | null>(null);
  const [songB, setSongB] = useState<Song | null>(null);
  const [title, setTitle] = useState('');
  const [mixStyle, setMixStyle] = useState<DJMashup['mixStyle']>('overlay');
  const [showSongPicker, setShowSongPicker] = useState<'A' | 'B' | null>(null);
  
  if (!singer) return null;
  
  // Todas las canciones disponibles (propias + NPCs)
  const availableSongs = [
    ...discography.filter(s => s.status === 'released'),
    ...npcSongs
  ];
  
  const selectSong = (song: Song | NPCSong, slot: 'A' | 'B') => {
    if (slot === 'A') setSongA(song as Song);
    else setSongB(song as Song);
    setShowSongPicker(null);
    
    // Auto-generar título
    if (!title && songA && songB) {
      const otherSong = slot === 'A' ? songB : songA;
      const songArtist = 'artistName' in song ? song.artistName : (song as Song).producerName;
      const otherArtist = 'artistName' in otherSong ? (otherSong as unknown as NPCSong).artistName : (otherSong as Song).producerName;
      setTitle(`${song.title} x ${otherSong.title}`);
    }
  };
  
  const checkCompatibility = (): MashupCompatibility => {
    if (!songA || !songB) {
      return {
        bpmCompatible: false,
        keyCompatible: false,
        genreCompatible: false,
        overallScore: 0,
        warnings: ['Selecciona ambas canciones primero'],
        suggestions: []
      };
    }
    
    const bpmA = (songA as any).melodyConfig?.bpm || 120;
    const bpmB = (songB as any).melodyConfig?.bpm || 120;
    const bpmDiff = Math.abs(bpmA - bpmB);
    const bpmDiffPercent = (bpmDiff / Math.max(bpmA, bpmB)) * 100;
    
    const bpmCompatible = bpmDiffPercent <= 10; // Máximo 10% de diferencia
    
    // Keys compatibles (simplificado - deberías usar círculo de quintas)
    const compatibleKeys: Record<string, string[]> = {
      'C': ['C', 'Am', 'G', 'Em', 'F', 'Dm'],
      'G': ['G', 'Em', 'D', 'Bm', 'C', 'Am'],
      'D': ['D', 'Bm', 'A', 'F#m', 'G', 'Em'],
      'A': ['A', 'F#m', 'E', 'C#m', 'D', 'Bm'],
      'E': ['E', 'C#m', 'B', 'G#m', 'A', 'F#m'],
      'F': ['F', 'Dm', 'C', 'Am', 'Bb', 'Gm'],
    };
    
    const keyA = (songA as any).melodyConfig?.musicalKey || 'C';
    const keyB = (songB as any).melodyConfig?.musicalKey || 'C';
    const keyCompatible = compatibleKeys[keyA]?.includes(keyB) || keyA === keyB;
    
    // Géneros
    const genreA = songA.genre;
    const genreB = songB.genre;
    const genreCompatible = genreA === genreB || 
      ['Electrónica / House', 'Pop / Electropop', 'Urbano / Reggaeton'].includes(genreA) &&
      ['Electrónica / House', 'Pop / Electropop', 'Urbano / Reggaeton'].includes(genreB);
    
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    if (!bpmCompatible) {
      warnings.push(`BPMs muy diferentes: ${bpmA} vs ${bpmB} (${bpmDiffPercent.toFixed(1)}% diferencia)`);
      suggestions.push(`Ajusta el BPM de "${songB.title}" a ${bpmA} para mejor sincronización`);
    }
    
    if (!keyCompatible) {
      warnings.push(`Keys incompatibles: ${keyA} y ${keyB}`);
      suggestions.push('Considera transponer una de las canciones');
    }
    
    if (!genreCompatible) {
      warnings.push(`Géneros muy distintos: ${genreA} y ${genreB}`);
      suggestions.push('Los mashups cross-genre pueden sonar experimentales');
    }
    
    const compatibilityCount = [bpmCompatible, keyCompatible, genreCompatible].filter(Boolean).length;
    const overallScore = Math.round((compatibilityCount / 3) * 100);
    
    return {
      bpmCompatible,
      keyCompatible,
      genreCompatible,
      overallScore,
      warnings,
      suggestions
    };
  };
  
  const createMashup = () => {
    if (!songA || !songB || !title.trim()) {
      alert('Necesitas seleccionar 2 canciones y un título');
      return;
    }
    
    const compatibility = checkCompatibility();
    
    if (compatibility.overallScore < 33) {
      const proceed = confirm(
        `⚠️ Compatibilidad baja (${compatibility.overallScore}%). ` +
        `El mashup puede no sonar bien. ¿Continuar de todas formas?`
      );
      if (!proceed) return;
    }
    
    // Calcular calidad basada en skills y compatibilidad
    const mixingSkill = singer.skills.mixing;
    const productionSkill = singer.skills.production;
    
    const skillFactor = (mixingSkill + productionSkill) / 2;
    const quality = Math.min(100, Math.round(
      (skillFactor * 0.6) + (compatibility.overallScore * 0.4)
    ));
    
    const creativity = Math.min(100, Math.round(
      60 + (Math.random() * 20) + (compatibility.genreCompatible ? 0 : 15)
    ));
    
    const danceability = Math.min(100, Math.round(
      (quality * 0.5) + (compatibility.bpmCompatible ? 30 : 10) + (Math.random() * 20)
    ));
    
    const sourceA: DJMashupSource = {
      songId: songA.id,
      songTitle: songA.title,
      artistName: ('artistName' in songA ? songA.artistName : (songA as Song).producerName) as string,
      originalBPM: (songA as any).melodyConfig?.bpm || 120,
      originalKey: (songA as any).melodyConfig?.musicalKey || 'C',
      sectionsUsed: ['verse', 'chorus']
    };
    
    const sourceB: DJMashupSource = {
      songId: songB.id,
      songTitle: songB.title,
      artistName: ('artistName' in songB ? songB.artistName : (songB as Song).producerName) as string,
      originalBPM: (songB as any).melodyConfig?.bpm || 120,
      originalKey: (songB as any).melodyConfig?.musicalKey || 'C',
      sectionsUsed: ['intro', 'breakdown', 'drop']
    };
    
    const mashup: DJMashup = {
      id: `mashup_${Date.now()}`,
      title: title.trim(),
      createdAtWeek: singer.career.careerWeek,
      sourceA,
      sourceB,
      mixStyle,
      bpmAdjustment: 0,
      keyAdjustment: 0,
      quality,
      creativity,
      danceability,
      status: 'completed',
    };
    
    // TODO: Añadir al GameContext
    console.log('Mashup creado:', mashup);
    alert(
      `✅ Mashup "${title}" creado!\n\n` +
      `Calidad: ${quality}/100\n` +
      `Creatividad: ${creativity}/100\n` +
      `Danceability: ${danceability}/100\n\n` +
      `Ahora puedes usarlo en tus sets DJ.`
    );
    onClose();
  };
  
  const compatibility = checkCompatibility();
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14141d] border border-violet-500/30 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Crear Mashup DJ</h2>
                <p className="text-xs text-slate-400">
                  Combina 2 canciones en una nueva versión
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Song Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Song A */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Canción A
              </label>
              {songA ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Music2 className="w-5 h-5 text-emerald-400" />
                    <button
                      onClick={() => setSongA(null)}
                      className="text-xs text-slate-400 hover:text-rose-400"
                    >
                      Cambiar
                    </button>
                  </div>
                  <p className="font-bold text-white text-sm mb-1">{songA.title}</p>
                  <p className="text-xs text-slate-400">
                    {('artistName' in songA && (songA as unknown as NPCSong).artistName) || (songA as Song).producerName}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{(songA as any).melodyConfig?.bpm || 120} BPM</span>
                    <span>{(songA as any).melodyConfig?.musicalKey || 'C'}</span>
                    <span>{songA.genre}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSongPicker('A')}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-violet-500/5 text-slate-400 hover:text-violet-300 font-bold text-sm flex flex-col items-center justify-center gap-2 transition"
                >
                  <Music className="w-6 h-6" />
                  Seleccionar canción A
                </button>
              )}
            </div>
            
            {/* Song B */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Canción B
              </label>
              {songB ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Music2 className="w-5 h-5 text-cyan-400" />
                    <button
                      onClick={() => setSongB(null)}
                      className="text-xs text-slate-400 hover:text-rose-400"
                    >
                      Cambiar
                    </button>
                  </div>
                  <p className="font-bold text-white text-sm mb-1">{songB.title}</p>
                  <p className="text-xs text-slate-400">
                    {('artistName' in songB && (songB as unknown as NPCSong).artistName) || (songB as Song).producerName}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{(songB as any).melodyConfig?.bpm || 120} BPM</span>
                    <span>{(songB as any).melodyConfig?.musicalKey || 'C'}</span>
                    <span>{songB.genre}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSongPicker('B')}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-violet-500/5 text-slate-400 hover:text-violet-300 font-bold text-sm flex flex-col items-center justify-center gap-2 transition"
                >
                  <Music className="w-6 h-6" />
                  Seleccionar canción B
                </button>
              )}
            </div>
          </div>
          
          {/* Compatibility Check */}
          {songA && songB && (
            <div className={`p-4 rounded-xl border ${
              compatibility.overallScore >= 67 ? 'bg-emerald-950/20 border-emerald-500/30' :
              compatibility.overallScore >= 33 ? 'bg-amber-950/20 border-amber-500/30' :
              'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {compatibility.overallScore >= 67 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="font-black text-white">
                  Compatibilidad: {compatibility.overallScore}%
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`p-2 rounded-lg ${compatibility.bpmCompatible ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  <p className={`text-xs font-bold ${compatibility.bpmCompatible ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {compatibility.bpmCompatible ? '✓' : '✗'} BPM
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${compatibility.keyCompatible ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  <p className={`text-xs font-bold ${compatibility.keyCompatible ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {compatibility.keyCompatible ? '✓' : '✗'} Key
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${compatibility.genreCompatible ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  <p className={`text-xs font-bold ${compatibility.genreCompatible ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {compatibility.genreCompatible ? '✓' : '✗'} Género
                  </p>
                </div>
              </div>
              
              {compatibility.warnings.length > 0 && (
                <div className="space-y-1 mb-2">
                  {compatibility.warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-amber-300">⚠️ {warning}</p>
                  ))}
                </div>
              )}
              
              {compatibility.suggestions.length > 0 && (
                <div className="space-y-1">
                  {compatibility.suggestions.map((suggestion, i) => (
                    <p key={i} className="text-xs text-slate-400">💡 {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Config */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Título del Mashup
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={songA && songB ? `${songA.title} x ${songB.title}` : 'Ej: Summer Vibes Mashup'}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Estilo de Mix
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'overlay', label: 'Overlay', desc: 'Ambas canciones simultáneas' },
                  { value: 'alternating', label: 'Alternado', desc: 'Alterna entre A y B' },
                  { value: 'breakdown', label: 'Breakdown', desc: 'A en breakdown, B en drop' },
                  { value: 'acapella_instrumental', label: 'A Capella + Instrumental', desc: 'Vocal de A sobre beat de B' },
                ].map(style => (
                  <button
                    key={style.value}
                    onClick={() => setMixStyle(style.value as any)}
                    className={`p-3 rounded-xl text-left transition ${
                      mixStyle === style.value
                        ? 'bg-violet-500/20 border border-violet-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-bold text-white text-xs">{style.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
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
            onClick={createMashup}
            disabled={!songA || !songB || !title.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Sparkles className="w-4 h-4" />
            Crear Mashup
          </button>
        </div>
      </div>
      
      {/* Song Picker Modal */}
      {showSongPicker && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-violet-500/30 rounded-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-white">Seleccionar Canción {showSongPicker}</h3>
              <button onClick={() => setShowSongPicker(null)} className="text-slate-400 hover:text-white">
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
                  const alreadySelected = 
                    (showSongPicker === 'A' && songB?.id === song.id) ||
                    (showSongPicker === 'B' && songA?.id === song.id);
                    
                  return (
                    <button
                      key={song.id}
                      onClick={() => !alreadySelected && selectSong(song, showSongPicker!)}
                      disabled={alreadySelected}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between ${
                        alreadySelected
                          ? 'bg-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{song.title}</p>
                        <p className="text-xs text-slate-400">
                          {('artistName' in song && (song as unknown as NPCSong).artistName) || (song as Song).producerName} · {(song as any).melodyConfig?.bpm || 120} BPM · {(song as any).melodyConfig?.musicalKey || 'C'} · {song.genre}
                        </p>
                      </div>
                      {alreadySelected && (
                        <span className="text-xs text-amber-400">Ya seleccionada</span>
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
