import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { COUNTRIES } from '../../data/countries';
import { MusicGenre } from '../../types';
import { Mic, Sparkles, Flame, Music, Globe, ChevronRight } from 'lucide-react';

const GENRES: { name: MusicGenre; icon: string; desc: string; vibe: string }[] = [
  { name: 'Urbano / Reggaeton', icon: '🔥', desc: 'Ritmos bailables, perreo, ganchos pegadizos y dominación del Top 50.', vibe: 'Bailes virales y discotecas' },
  { name: 'Trap / Hip-Hop', icon: '⚡', desc: 'Barras crudas, 808s potentes, actitud callejera y rimas afiladas.', vibe: 'Tiraderas, freestyle y flow' },
  { name: 'Pop / Electropop', icon: '✨', desc: 'Melodías universales, sintetizadores pulidos y proyección en radios globales.', vibe: 'Estadios y festivales pop' },
  { name: 'R&B / Neo-Soul', icon: '🎙️', desc: 'Gran técnica vocal, elegancia, armonías emotivas y respeto de la crítica.', vibe: 'Voces de oro y sentimiento' },
  { name: 'Rock / Indie', icon: '🎸', desc: 'Guitarras distorsionadas, letras profundas e identidad alternativa rebelde.', vibe: 'Festivales indie y culto' },
  { name: 'Balada / Latino', icon: '🌹', desc: 'Desamor desgarrador, orquestaciones épicas y pasión que emociona a generaciones.', vibe: 'Canciones para cantar a gritos' }
];

const AVATARS = ['🎤', '🧢', '🕶️', '👑', '🎧', '🎸', '🌟', '💎', '🔥', '🦁'];

export const CharacterCreator: React.FC = () => {
  const { createSinger } = useGame();

  const [artistName, setArtistName] = useState('');
  const [realName, setRealName] = useState('');
  const [age, setAge] = useState(19);
  const [nationality, setNationality] = useState('España');
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('Urbano / Reggaeton');
  const [selectedAvatar, setSelectedAvatar] = useState('🎤');
  const [focusStat, setFocusStat] = useState<'voice' | 'composition' | 'flow' | 'charisma'>('voice');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim()) {
      alert('Por favor, ingresa tu Nombre Artístico');
      return;
    }

    createSinger({
      artistName: artistName.trim(),
      realName: realName.trim() || artistName.trim(),
      age: Number(age),
      nationality,
      genre: selectedGenre,
      avatarIcon: selectedAvatar
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-[#16161d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador de Cantante Profesional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Crea Tu Estrella Musical</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Personaliza tu identidad, elige tu estilo musical y prepárate para escalar desde maquetas caseras hasta el #1 de Spotify y los Grammys.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nombre Artístico (Stage Name) *
              </label>
              <div className="relative">
                <Mic className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Young Ray, Lunay, Bella, Nova..."
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nombre Real (Civil)
              </label>
              <input
                type="text"
                placeholder="Ej. Carlos Martínez, Lucía Gómez..."
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Age & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Edad al Iniciar: <span className="text-emerald-400">{age} años</span>
              </label>
              <input
                type="range"
                min={16}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nacionalidad y País Origen
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1d1d26] border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium transition"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name} ({c.favoriteGenre})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Icono de Artista
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(avatar => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition border ${
                    selectedAvatar === avatar
                      ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Music Genre Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Género Musical Principal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GENRES.map(g => (
                <div
                  key={g.name}
                  onClick={() => setSelectedGenre(g.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left relative overflow-hidden ${
                    selectedGenre === g.name
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{g.icon}</div>
                  <h3 className="font-bold text-sm text-white">{g.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Starting Focus */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Punto Fuerte Inicial (+10 extra)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'voice', label: 'Voz & Afinación', icon: '🎤' },
                { id: 'composition', label: 'Composición / Letra', icon: '✍️' },
                { id: 'flow', label: 'Flow & Ritmo', icon: '⚡' },
                { id: 'charisma', label: 'Carisma & Imagen', icon: '✨' }
              ].map(stat => (
                <button
                  type="button"
                  key={stat.id}
                  onClick={() => setFocusStat(stat.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 justify-center transition ${
                    focusStat === stat.id
                      ? 'bg-emerald-500 text-black border-emerald-500 font-extrabold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition active:scale-[0.99]"
            >
              <span>Comenzar Carrera Musical</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
