import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { COUNTRIES } from '../../data/countries';
import { MusicGenre, ArtistSkills } from '../../types';
import { CAREER_PATH_CONFIGS } from '../../utils/careerEngine';
import { Mic, Sparkles, Music, Globe, ChevronRight, Headphones, Sliders, Radio } from 'lucide-react';

const GENRES: { name: MusicGenre; icon: string; desc: string }[] = [
  { name: 'Urbano / Reggaeton', icon: '🔥', desc: 'Dembow, perreo, ganchos pegadizos.' },
  { name: 'Trap / Hip-Hop', icon: '⚡', desc: 'Barras crudas, 808s, flow callejero.' },
  { name: 'Pop / Electropop', icon: '✨', desc: 'Melodías universales, radios globales.' },
  { name: 'R&B / Neo-Soul', icon: '🎙️', desc: 'Técnica vocal, armonías, elegancia.' },
  { name: 'Rock / Indie', icon: '🎸', desc: 'Guitarras, identidad alternativa.' },
  { name: 'Balada / Latino', icon: '🌹', desc: 'Desamor épico, pasión generacional.' },
  { name: 'Drill', icon: '🖤', desc: 'Oscuro, sliding 808s, flow amenazante.' },
  { name: 'Electrónica / House', icon: '🎛️', desc: 'Drops, síntesis, festivales.' },
];

const AVATARS = ['🎤', '🧢', '🕶️', '👑', '🎧', '🎸', '🌟', '💎', '🔥', '🦁'];

const CAREER_ICONS: Record<string, React.ReactNode> = {
  artist: <Mic className="w-6 h-6" />,
  producer: <Sliders className="w-6 h-6" />,
  dj: <Headphones className="w-6 h-6" />,
};

const FOCUS_STATS: { id: keyof ArtistSkills; label: string; icon: string; forPaths: string[] }[] = [
  { id: 'voice', label: 'Voz & Afinación', icon: '🎤', forPaths: ['artist'] },
  { id: 'composition', label: 'Composición / Letra', icon: '✍️', forPaths: ['artist', 'producer'] },
  { id: 'flow', label: 'Flow & Ritmo', icon: '⚡', forPaths: ['artist'] },
  { id: 'charisma', label: 'Carisma & Imagen', icon: '✨', forPaths: ['artist', 'dj'] },
  { id: 'production', label: 'Producción', icon: '🎛️', forPaths: ['producer', 'dj'] },
  { id: 'mixing', label: 'Mezcla & Mastering', icon: '🔊', forPaths: ['producer'] },
  { id: 'performance', label: 'Performance en Directo', icon: '🎭', forPaths: ['artist', 'dj'] },
  { id: 'promotion', label: 'Promoción & Redes', icon: '📱', forPaths: ['artist', 'dj', 'producer'] },
];

export const CharacterCreator: React.FC = () => {
  const { createSinger } = useGame();

  const [step, setStep] = useState<'career' | 'identity' | 'music' | 'focus'>('career');
  const [artistName, setArtistName] = useState('');
  const [realName, setRealName] = useState('');
  const [age, setAge] = useState(19);
  const [nationality, setNationality] = useState('España');
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('Urbano / Reggaeton');
  const [selectedAvatar, setSelectedAvatar] = useState('🎤');
  const [selectedPath, setSelectedPath] = useState<'artist' | 'producer' | 'dj'>('artist');
  const [focusStat, setFocusStat] = useState<keyof ArtistSkills>('voice');

  const pathConfigs = Object.values(CAREER_PATH_CONFIGS);
  const availableFocusStats = FOCUS_STATS.filter(s => s.forPaths.includes(selectedPath));

  const handleSubmit = () => {
    if (!artistName.trim()) return;
    createSinger({
      artistName: artistName.trim(),
      realName: realName.trim() || artistName.trim(),
      age: Number(age),
      nationality,
      genre: selectedGenre,
      avatarIcon: selectedAvatar,
      careerPath: selectedPath,
      focusStat,
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-[#16161d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Singer Simulator — Carrera Musical Realista</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Crea Tu Carrera Musical</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Cada decisión importa. No hay atajos. La industria es dura y el camino es largo — pero vale la pena.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-7">
          {(['career', 'identity', 'music', 'focus'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition ${
                step === s ? 'bg-emerald-500 text-black' :
                ['career', 'identity', 'music', 'focus'].indexOf(step) > i ? 'bg-emerald-500/30 text-emerald-400' :
                'bg-white/10 text-slate-500'
              }`}>
                {i + 1}
              </div>
              {i < 3 && <div className="w-6 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: CAREER PATH ── */}
        {step === 'career' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3">
              ¿Cuál es tu camino en la industria?
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {pathConfigs.map(config => (
                <button
                  key={config.path}
                  type="button"
                  onClick={() => {
                    setSelectedPath(config.path as any);
                    // Reset focus stat to first valid one for this path
                    const firstFocus = FOCUS_STATS.find(s => s.forPaths.includes(config.path));
                    if (firstFocus) setFocusStat(firstFocus.id);
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-4 ${
                    selectedPath === config.path
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    selectedPath === config.path ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    {CAREER_ICONS[config.path]}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">{config.label}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{config.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {config.primarySkills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
                      💰 {config.primaryIncomeSource}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Inicio: {config.startingBalance.toLocaleString()} € · {config.startingListeners.toLocaleString()} oyentes iniciales
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('identity')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 mt-4 transition"
            >
              <span>Continuar como {CAREER_PATH_CONFIGS[selectedPath].label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: IDENTITY ── */}
        {step === 'identity' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3">Tu Identidad</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nombre Artístico *
                </label>
                <div className="relative">
                  <Mic className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Young Ray, Lunay, Nova..."
                    value={artistName}
                    onChange={e => setArtistName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nombre Real
                </label>
                <input
                  type="text"
                  placeholder="Ej. Carlos Martínez..."
                  value={realName}
                  onChange={e => setRealName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Edad: <span className="text-emerald-400">{age} años</span>
                </label>
                <input
                  type="range" min={16} max={30} value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nacionalidad
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1d1d26] border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Icono</label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a} type="button" onClick={() => setSelectedAvatar(a)}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition border ${
                      selectedAvatar === a
                        ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep('career')} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10">
                Atrás
              </button>
              <button
                onClick={() => artistName.trim() && setStep('music')}
                disabled={!artistName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Continuar</span><ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: MUSIC ── */}
        {step === 'music' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3">Tu Estilo Musical</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GENRES.map(g => (
                <div
                  key={g.name}
                  onClick={() => setSelectedGenre(g.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedGenre === g.name
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500 shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{g.icon}</div>
                  <h3 className="font-bold text-xs text-white">{g.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{g.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep('identity')} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10">
                Atrás
              </button>
              <button
                onClick={() => setStep('focus')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Continuar</span><ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: FOCUS ── */}
        {step === 'focus' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-1">Punto Fuerte Inicial</h2>
            <p className="text-xs text-slate-400 mb-3">
              Recibes +12 puntos extra en esta habilidad al empezar. Las demás crecen con la experiencia.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableFocusStats.map(stat => (
                <button
                  type="button"
                  key={stat.id}
                  onClick={() => setFocusStat(stat.id)}
                  className={`px-3 py-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1.5 transition ${
                    focusStat === stat.id
                      ? 'bg-emerald-500 text-black border-emerald-500 font-extrabold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-center leading-tight">{stat.label}</span>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-3 text-xs space-y-1.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Resumen de tu carrera</p>
              <div className="flex justify-between"><span className="text-slate-400">Nombre artístico:</span><span className="text-white font-bold">{artistName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Carrera:</span><span className="text-emerald-400 font-bold">{CAREER_PATH_CONFIGS[selectedPath].label}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Género:</span><span className="text-white font-bold">{selectedGenre}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Punto fuerte:</span><span className="text-white font-bold">{FOCUS_STATS.find(s => s.id === focusStat)?.label}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Inicio con:</span><span className="text-emerald-400 font-bold">{CAREER_PATH_CONFIGS[selectedPath].startingBalance.toLocaleString()} €</span></div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep('music')} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10">
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition"
              >
                <span>Comenzar Carrera</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
