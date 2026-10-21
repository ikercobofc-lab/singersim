import React from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { careerStageLabel } from '../../utils/simulationEngine';
import {
  Flame, Coins, BatteryCharging, Trophy, Disc3, BarChart3,
  Mail, Newspaper, FastForward, Save, User as UserIcon,
  Sparkles, FolderOpen, Headphones, Sliders, Mic2
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

// Studio tab label + icon per career path
const STUDIO_CONFIG = {
  artist:   { label: 'Estudio & Álbumes', icon: <Mic2 className="w-3.5 h-3.5" /> },
  producer: { label: 'Estudio Productor',  icon: <Sliders className="w-3.5 h-3.5" /> },
  dj:       { label: 'DJ Dashboard',       icon: <Headphones className="w-3.5 h-3.5" /> },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const {
    singer, advanceTime, saveGame, isSaving,
    inbox, activeTab, setActiveTab,
    bzrpEligible, setIsBzrpOpen,
  } = useGame();
  const { currentUser } = useAuth();

  if (!singer) return null;

  const pendingDms = inbox.filter(m => m.status === 'pending').length;
  const path = singer.career.path;
  const studioConfig = STUDIO_CONFIG[path] || STUDIO_CONFIG.artist;

  // Compact display values
  const displayListeners = formatNumber(singer.fame?.monthlyListeners ?? singer.stats?.fans ?? 0);
  const displayBalance   = formatCurrency(singer.economy?.balance ?? singer.stats?.money ?? 0);
  const displayPrestige  = Math.round(singer.fame?.industryPrestige ?? singer.stats?.reputation ?? 0);
  const displayEnergy    = Math.round(singer.career?.energy ?? singer.stats?.energy ?? 100);
  const weekNum          = singer.career?.careerWeek ?? singer.careerWeek ?? 1;
  const yearNum          = singer.career?.careerYear ?? singer.careerYear ?? 2026;

  return (
    <header className="sticky top-0 z-40 bg-[#121216]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 border border-white/20">
            {singer.avatarIcon || '🎤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">{singer.artistName}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold hidden sm:inline-flex">
                {careerStageLabel(singer.career?.stage ?? 'bedroom')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {singer.nationality} • {singer.age}a • {yearNum}, Sem.{weekNum}
            </p>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={advanceTime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Avanzar</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Oyentes</p>
              <p className="font-extrabold text-white text-sm">{displayListeners}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Balance</p>
              <p className="font-extrabold text-emerald-400 text-sm">{displayBalance}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Prestigio</p>
              <p className="font-extrabold text-purple-300 text-sm">{displayPrestige}/100</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Energía</p>
              <p className={`font-extrabold text-sm ${
                displayEnergy > 60 ? 'text-cyan-300' : displayEnergy > 30 ? 'text-amber-400' : 'text-rose-400'
              }`}>{displayEnergy}%</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="hidden md:flex items-center gap-2">
          {bzrpEligible && (
            <button
              onClick={() => setIsBzrpOpen(true)}
              className="animate-pulse flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:scale-105 transition"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>BZRP SESSION</span>
            </button>
          )}
          <button
            onClick={advanceTime}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
            title="Avanza 1 semana"
          >
            <FastForward className="w-4 h-4" />
            <span>Pasar Semana</span>
          </button>
          <button
            onClick={saveGame}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition"
            title="Guardar partida"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              currentUser
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{currentUser ? currentUser.email?.split('@')[0] : 'Cuenta'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mt-3 flex items-center border-t border-white/5 pt-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'home' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏠 Resumen
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {studioConfig.icon}
            {studioConfig.label}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'projects' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Demos
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'charts' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Top 50
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'metrics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Métricas
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative whitespace-nowrap ${
              activeTab === 'messages' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            DMs
            {pendingDms > 0 && (
              <span className="px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                {pendingDms}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'news' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Prensa
          </button>

          <button
            onClick={() => setActiveTab('awards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'awards' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Premios
          </button>
        </div>

        {/* Mobile save */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <button onClick={saveGame} className="p-1.5 rounded-lg bg-white/10 text-slate-300">
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
