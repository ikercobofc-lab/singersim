import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MusicGenre, SongTheme, MelodyCustomization, StepSequencerPattern } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { playMelodyPreview, stopAudioPreview, singLyricsWithBeat } from '../../utils/audioSynth';
import { BeatSequencer } from './BeatSequencer';
import { SocialSchedulerModal } from './SocialSchedulerModal';
import { 
  Music2, 
  Sparkles, 
  Send, 
  Disc, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Calendar, 
  Clock, 
  Flame,
  Radio,
  Share2,
  Cpu,
  Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SongCreatorProps {
  onSongCreated?: () => void;
  albumId?: string; // If provided, adds track to an album instead of releasing as single
}

const THEMES: SongTheme[] = [
  'Amor', 
  'Desamor', 
  'Fiesta / Flex', 
  'Calle / Real', 
  'Reflexión', 
  'Protesta / Venganza'
];

const MUSICAL_KEYS = [
  'Do Menor (Melancólico)',
  'La Menor (Tristeza Profunda)',
  'Sol Mayor (Enérgico / Épico)',
  'Re Menor (Oscuro / Trap)',
  'Mi Menor (Pop / Bailable)'
];

const INSTRUMENTS = [
  'Sintetizador Analógico 80s',
  'Guitarra Española Acústica',
  'Piano Melancólico con Reverb',
  'Pluck Trap Caribeño',
  'Cuerdas Orquestales Cinemáticas'
];

const BASS_TYPES = [
  '808 Glide Distorsionado (Bajos profundos)',
  'Bajo Eléctrico Slap Funk',
  'Subgrave Limpio 40Hz',
  'Sintetizador Moog Bassline'
];

const DRUM_PATTERNS = [
  'Dembow Perreo Clásico (Puro ritmo bailable)',
  'Drill Triplet Hats & Snare deslizante',
  'Four-on-the-Floor Pop / Club',
  'Boom-Bap 90s Clásico',
  'Acústico Orgánico con Cajón'
];

const VOCAL_STYLES = [
  'Autotune Notorio al 100% (Efecto futurista)',
  'Voz Rasgada, Natural y Cruda',
  'Reverb de Catedral con Segundas Voces Armónicas',
  'Acústico Íntimo Susurrado'
];

export const SongCreator: React.FC<SongCreatorProps> = ({ onSongCreated, albumId }) => {
  const { singer, releaseSingle, scheduleSongRelease, addTrackToAlbum, unlockedProducers } = useGame();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<MusicGenre>(singer?.genre || 'Urbano / Reggaeton');
  const [theme, setTheme] = useState<SongTheme>('Fiesta / Flex');
  const [selectedProducer, setSelectedProducer] = useState<string>('Kike Beats (Colega del barrio)');
  
  // Production Mode (Guided vs FL Studio Advanced Sequencer)
  const [productionMode, setProductionMode] = useState<'guided' | 'fl_studio'>('guided');

  // Melody & Sound Customization
  const [musicalKey, setMusicalKey] = useState(MUSICAL_KEYS[0]);
  const [bpm, setBpm] = useState(98);
  const [melodyInstrument, setMelodyInstrument] = useState(INSTRUMENTS[0]);
  const [bassType, setBassType] = useState(BASS_TYPES[0]);
  const [drumPattern, setDrumPattern] = useState(DRUM_PATTERNS[0]);
  const [vocalStyle, setVocalStyle] = useState(VOCAL_STYLES[0]);

  // Audio preview playing state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSingingAi, setIsSingingAi] = useState(false);

  // Custom Lyrics
  const [chorusLyrics, setChorusLyrics] = useState('Bebé ya no me llames más, que esta noche salgo a vacilar con to la banda');
  const [verseLyrics, setVerseLyrics] = useState('En la nave fumando mirando la ciudad, tú querías amor pero yo buscaba lealtad');

  // Multiple Collaborators & Remix
  const [featuredArtistsInput, setFeaturedArtistsInput] = useState('');
  const [isRemix, setIsRemix] = useState(false);

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledWeeksAhead, setScheduledWeeksAhead] = useState(1);
  const [scheduledTime, setScheduledTime] = useState('Viernes 00:00 (Medianoche)');
  const [isSocialSchedulerOpen, setIsSocialSchedulerOpen] = useState(false);

  // Marketing
  const [marketingBudget, setMarketingBudget] = useState(600);
  const [isReleasing, setIsReleasing] = useState(false);
  const [lastReleaseResult, setLastReleaseResult] = useState<any>(null);

  useEffect(() => {
    return () => {
      stopAudioPreview();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!singer) return null;

  const currentMelodyConfig: MelodyCustomization = {
    musicalKey,
    bpm,
    melodyInstrument,
    bassType,
    drumPattern,
    vocalStyle
  };

  // Live reactive audio: whenever any sound parameter changes while listening, immediately play the new sound & rhythm!
  useEffect(() => {
    if (isPlayingPreview && !isSingingAi) {
      stopAudioPreview();
      playMelodyPreview(currentMelodyConfig, () => {
        setIsPlayingPreview(false);
      });
    }
  }, [musicalKey, bpm, melodyInstrument, bassType, drumPattern]);

  const togglePlayAudio = () => {
    if (isPlayingPreview) {
      stopAudioPreview();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingPreview(false);
      setIsSingingAi(false);
    } else {
      setIsPlayingPreview(true);
      setIsSingingAi(false);
      playMelodyPreview(currentMelodyConfig, () => {
        setIsPlayingPreview(false);
      });
    }
  };

  const toggleSingLyrics = () => {
    if (isSingingAi) {
      stopAudioPreview();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSingingAi(false);
      setIsPlayingPreview(false);
    } else {
      setIsSingingAi(true);
      setIsPlayingPreview(true);
      const textToSing = `${chorusLyrics}. ${verseLyrics}`;
      singLyricsWithBeat(textToSing, currentMelodyConfig, () => {
        setIsSingingAi(false);
        setIsPlayingPreview(false);
      });
    }
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, indica el título de la canción.');
      return;
    }

    if (!albumId && singer.stats.money < marketingBudget) {
      alert('No tienes suficientes fondos para este presupuesto de producción.');
      return;
    }

    const featuredArtists = featuredArtistsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const finalTitle = isRemix && !title.toLowerCase().includes('remix')
      ? `${title.trim()} (Remix Oficial)`
      : title.trim();

    setIsReleasing(true);
    stopAudioPreview();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingPreview(false);
    setIsSingingAi(false);

    setTimeout(() => {
      if (albumId) {
        addTrackToAlbum(albumId, {
          title: finalTitle,
          genre,
          theme,
          producerName: selectedProducer,
          featuredArtists,
          melodyConfig: currentMelodyConfig,
          lyrics: { verse: verseLyrics, chorus: chorusLyrics, punchline: '' },
          isRemix
        });
        alert(`¡Pista añadida al álbum! Has preparado "${finalTitle}" sin sacarla aún.`);
        setTitle('');
        if (onSongCreated) onSongCreated();
      } else if (isScheduled) {
        const targetWeek = singer.careerWeek + scheduledWeeksAhead;
        scheduleSongRelease({
          title: finalTitle,
          genre,
          theme,
          producerName: selectedProducer,
          featuredArtists,
          budget: marketingBudget,
          melodyConfig: currentMelodyConfig,
          scheduledWeek: targetWeek,
          scheduledTime,
          lyrics: { verse: verseLyrics, chorus: chorusLyrics, punchline: '' },
          isRemix
        });
        alert(`📅 ¡Estreno programado! "${finalTitle}" se publicará en la Semana ${targetWeek} a las ${scheduledTime}.`);
        setTitle('');
        if (onSongCreated) onSongCreated();
      } else {
        const result = releaseSingle({
          title: finalTitle,
          genre,
          theme,
          producerName: selectedProducer,
          featuredArtists,
          isSingle: true,
          budget: marketingBudget,
          melodyConfig: currentMelodyConfig,
          lyrics: { verse: verseLyrics, chorus: chorusLyrics, punchline: '' },
          isRemix
        });

        if (result) {
          setLastReleaseResult(result);
          confetti({
            particleCount: result.isViral ? 140 : 70,
            spread: 75,
            origin: { y: 0.6 }
          });
          setTitle('');
          if (onSongCreated) onSongCreated();
        }
      }
      setIsReleasing(false);
    }, 600);
  };

  return (
    <div className="bg-[#181822] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Music2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {albumId ? 'Grabar Pista Exclusiva para el Álbum' : 'Estudio de Producción Musical'}
            </h2>
            <p className="text-xs text-slate-400">
              {albumId 
                ? 'Compón la melodía, escribe la letra y guárdala en el tracklist del álbum sin publicarla aún.' 
                : 'Diseña el beat, escribe tus barras, prueba las voces con IA y programa el estreno internacional.'}
            </p>
          </div>
        </div>

        {/* Audio Buttons: Melody Preview & AI Singing Vocoder */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlayAudio}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition border ${
              isPlayingPreview && !isSingingAi
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isPlayingPreview && !isSingingAi ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingPreview && !isSingingAi ? 'Parar' : '▶ Escuchar Beat'}</span>
          </button>

          <button
            type="button"
            onClick={toggleSingLyrics}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition border ${
              isSingingAi
                ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isSingingAi ? '⏹ Parar Voz IA' : '🎙️ ▶ Cantar con Voz IA'}</span>
          </button>
        </div>
      </div>

      {/* Production Mode Switcher: Guided vs FL Studio Sequencer */}
      <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-2xl border border-white/10">
        <span className="text-xs font-bold text-slate-400 pl-2">Modo de Producción:</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setProductionMode('guided')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              productionMode === 'guided' 
                ? 'bg-white text-black shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Modo Guiado (Sonido & Melodía)</span>
          </button>

          <button
            type="button"
            onClick={() => setProductionMode('fl_studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              productionMode === 'fl_studio' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/25' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Modo FL Studio (Step Sequencer 16 Steps)</span>
          </button>
        </div>
      </div>

      {/* FL Studio Advanced Sequencer Block if active */}
      {productionMode === 'fl_studio' && (
        <BeatSequencer
          initialBpm={bpm}
          onApplyBeat={(_, newBpm) => {
            setBpm(newBpm);
            alert(`✓ ¡Beat de 16 pasos guardado para "${title || 'tu tema'}" a ${newBpm} BPM!`);
          }}
        />
      )}

      <form onSubmit={handleRelease} className="space-y-6">
        
        {/* Title & Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Título de la Canción *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Noche en Medellín, Llorando en el Club, Eclipse..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-semibold transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Género
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as MusicGenre)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20202c] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Urbano / Reggaeton">Urbano / Reggaeton</option>
                <option value="Trap / Hip-Hop">Trap / Hip-Hop</option>
                <option value="Pop / Electropop">Pop / Electropop</option>
                <option value="R&B / Neo-Soul">R&B / Neo-Soul</option>
                <option value="Rock / Indie">Rock / Indie</option>
                <option value="Balada / Latino">Balada / Latino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Temática Lírica
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as SongTheme)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20202c] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {THEMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 📝 TALLER DE LETRAS & VOZ CANTADA CON IA */}
        <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <span>Taller de Letras & Voz Cantada con IA</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-400 self-center mr-1">Inspiración:</span>
              <button
                type="button"
                onClick={() => {
                  setChorusLyrics('Bebé ya no me llames más, que esta noche salgo a vacilar y borrar los recuerdos');
                  setVerseLyrics('En la nave mirando la ciudad, tú querías amor pero yo buscaba lealtad');
                }}
                className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold text-purple-300 transition"
              >
                💔 Desamor
              </button>
              <button
                type="button"
                onClick={() => {
                  setChorusLyrics('To lo que tengo me lo he ganao, sonando en la radio y en to los laos');
                  setVerseLyrics('Desde abajo sin frenos rompiendo la carretera, ahora to los sellos hacen cola en la acera');
                }}
                className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold text-purple-300 transition"
              >
                💎 Flex / Calle
              </button>
              <button
                type="button"
                onClick={() => {
                  setChorusLyrics('Pégate más que la noche está que arde, hasta abajo sin miedo que ya es tarde');
                  setVerseLyrics('Con el ritmo que retumba en to la discoteca, los vasos arriba que aquí nadie peca');
                }}
                className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold text-purple-300 transition"
              >
                🔥 Perreo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Estribillo / Coro (Hook Principal)
              </label>
              <textarea
                rows={2}
                value={chorusLyrics}
                onChange={(e) => setChorusLyrics(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1d1c28] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Escribe el estribillo de tu tema..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Verso 1 / Barras
              </label>
              <textarea
                rows={2}
                value={verseLyrics}
                onChange={(e) => setVerseLyrics(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1d1c28] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Escribe las barras del verso..."
              />
            </div>
          </div>
        </div>

        {/* 🤝 COLABORACIONES MÚLTIPLES & REMIX OFICIAL */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Artistas Invitados (Colaboraciones Múltiples)
            </label>
            <span className="text-[10px] text-slate-400">Separa con comas si son 2 o más (ej. Saiko, Quevedo)</span>
          </div>

          <input
            type="text"
            placeholder="Ej. Saiko, Quevedo o Duki"
            value={featuredArtistsInput}
            onChange={(e) => setFeaturedArtistsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#20202c] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remixCheck"
              checked={isRemix}
              onChange={(e) => setIsRemix(e.target.checked)}
              className="accent-purple-500 w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="remixCheck" className="text-xs text-purple-300 font-bold cursor-pointer flex items-center gap-1.5">
              <span>🚀 Es un Remix Oficial (+150% Hype y revivir reproducciones de catálogo)</span>
            </label>
          </div>
        </div>

        {/* 🎛️ GUIDED SOUND & MELODY CUSTOMIZATION SECTION */}
        {productionMode === 'guided' && (
          <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Personalización Sonora & Rítmica</span>
              </h3>
              <span className="text-[11px] text-slate-400">Reactivo en directo al escuchar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Key / Scale */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tonalidad & Escala Musical</label>
                <select
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs font-semibold"
                >
                  {MUSICAL_KEYS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {/* BPM Tempo Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">Tempo / Velocidad:</span>
                  <span className="font-extrabold text-emerald-400">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={155}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>70 (Balada/R&B)</span>
                  <span>95 (Dembow)</span>
                  <span>124 (Pop Club)</span>
                  <span>150 (Trap/Drill)</span>
                </div>
              </div>

              {/* Melody Instrument */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Instrumento Melódico Principal</label>
                <select
                  value={melodyInstrument}
                  onChange={(e) => setMelodyInstrument(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                >
                  {INSTRUMENTS.map(ins => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              {/* Bass / 808 */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Línea de Bajo / 808</label>
                <select
                  value={bassType}
                  onChange={(e) => setBassType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                >
                  {BASS_TYPES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Drum Pattern */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Patrón de Batería & Percusión</label>
                <select
                  value={drumPattern}
                  onChange={(e) => setDrumPattern(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                >
                  {DRUM_PATTERNS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Vocal Processing */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tratamiento Vocal en el Estudio</label>
                <select
                  value={vocalStyle}
                  onChange={(e) => setVocalStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                >
                  {VOCAL_STYLES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Producer Selection (Only unlocked or friends) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Productor de Estudio (Equipo de Confianza)
            </label>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {unlockedProducers.length} Disponible(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {unlockedProducers.map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedProducer(p.name)}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition text-xs ${
                  selectedProducer === p.name
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{p.avatar}</span>
                <div className="truncate">
                  <p className="truncate font-semibold text-white">{p.name}</p>
                  <p className="text-[10px] text-emerald-400">{p.fameTier}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 📅 SCHEDULED RELEASE OR INSTANT DROP */}
        {!albumId && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Modalidad de Publicación</span>
              </span>
              <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !isScheduled ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Drop Sorpresa (Inmediato)
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isScheduled ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Programar Estreno
                </button>
              </div>
            </div>

            {isScheduled && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Semana de Estreno
                    </label>
                    <select
                      value={scheduledWeeksAhead}
                      onChange={(e) => setScheduledWeeksAhead(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                    >
                      <option value={1}>Próxima Semana (Semana {singer.careerWeek + 1})</option>
                      <option value={2}>En 2 Semanas (Semana {singer.careerWeek + 2}) - Más hype</option>
                      <option value={3}>En 3 Semanas (Semana {singer.careerWeek + 3}) - Campaña masiva</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Hora y Momento de Lanzamiento
                    </label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#22222e] border border-white/10 text-white text-xs"
                    >
                      <option value="Viernes 00:00 (Medianoche)">Viernes 00:00 (Medianoche - Tradicional España/Latam)</option>
                      <option value="Jueves 20:00 (Prime Time)">Jueves 20:00 (Prime Time Redes)</option>
                      <option value="Viernes 14:00 (Lanzamiento Global)">Viernes 14:00 (Lanzamiento Global New York)</option>
                    </select>
                  </div>
                </div>

                {/* Social Announcement Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsSocialSchedulerOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>📢 Anunciar en Redes con Horarios Mundiales (España, México, Argentina, Colombia, USA)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Marketing Budget */}
        {!albumId && (
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Presupuesto Videoclip & Snippets TikTok: <span className="text-emerald-400 font-bold">{formatCurrency(marketingBudget)}</span>
              </label>
              <span className="text-slate-400">Saldo actual: {formatCurrency(singer.stats.money)}</span>
            </div>
            <input
              type="range"
              min={200}
              max={Math.max(2000, Math.min(singer.stats.money, 60000))}
              step={200}
              value={marketingBudget}
              onChange={(e) => setMarketingBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isReleasing}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] ${
            albumId 
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : isScheduled
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white shadow-lg shadow-purple-600/30'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black shadow-lg shadow-emerald-500/25'
          }`}
        >
          {albumId ? (
            <>
              <Disc className="w-4 h-4" />
              <span>Añadir Canción al Tracklist del Álbum</span>
            </>
          ) : isScheduled ? (
            <>
              <Calendar className="w-4 h-4" />
              <span>Programar Estreno para Semana {singer.careerWeek + scheduledWeeksAhead}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isReleasing ? 'Lanzando al Mundo...' : 'Lanzar Single Inmediato (Drop Sorpresa)'}</span>
            </>
          )}
        </button>
      </form>

      {/* Result feedback */}
      {lastReleaseResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>¡"{lastReleaseResult.song.title}" ya está en todas las plataformas!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-black/40 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Streams Debut</span>
              <span className="font-extrabold text-white text-sm">{formatNumber(lastReleaseResult.initialStreams)}</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Ingresos</span>
              <span className="font-extrabold text-emerald-400 text-sm">+{formatCurrency(lastReleaseResult.revenue)}</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Nuevos Fans</span>
              <span className="font-extrabold text-white text-sm">+{formatNumber(lastReleaseResult.fansGained)}</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Puesto Top 50</span>
              <span className="font-extrabold text-cyan-400 text-sm">
                {lastReleaseResult.chartPositionGlobal > 0 ? `#${lastReleaseResult.chartPositionGlobal} Global` : 'Bubbling Under'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Social Scheduler Modal if opened */}
      {isSocialSchedulerOpen && (
        <SocialSchedulerModal
          isOpen={true}
          onClose={() => setIsSocialSchedulerOpen(false)}
          titleProposed={title || 'Nueva Música'}
          projectType="cancion"
          onScheduledSuccess={(week, time, hypeBonus) => {
            setIsScheduled(true);
            setScheduledWeeksAhead(week - singer.careerWeek);
            setScheduledTime(time);
            alert(`📢 ¡Campaña publicada en redes! Horarios sincronizados activados para "${title || 'tu tema'}". +${hypeBonus}% Hype.`);
            setIsSocialSchedulerOpen(false);
          }}
        />
      )}
    </div>
  );
};
