import React from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { 
  Flame, 
  Coins, 
  BatteryCharging, 
  Trophy, 
  Disc3, 
  BarChart3, 
  Mail, 
  Newspaper, 
  FastForward, 
  Save, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { 
    singer, 
    advanceTime, 
    saveGame, 
    isSaving, 
    inbox, 
    activeTab, 
    setActiveTab, 
    setEurovisionModalOpen
  } = useGame();
  const { currentUser, isFirebaseLive } = useAuth();

  if (!singer) return null;

  const pendingDms = inbox.filter(m => m.status === 'pending').length;
  const hasUnreadDms = pendingDms > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#121216]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Singer Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 border border-white/20">
            {singer.avatarIcon || '🎤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">{singer.artistName}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                {singer.genre}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {singer.nationality} • {singer.age} años • Año {singer.careerYear}, Sem. {singer.careerWeek}
            </p>
          </div>

          {/* Mobile FastForward */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={advanceTime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Avanzar</span>
            </button>
          </div>
        </div>

        {/* Live Career Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto text-xs">
          {/* Oyentes / Fans */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Oyentes</p>
              <p className="font-extrabold text-white text-sm">{formatNumber(singer.stats.fans)}</p>
            </div>
          </div>

          {/* Dinero */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dinero</p>
              <p className="font-extrabold text-emerald-400 text-sm">{formatCurrency(singer.stats.money)}</p>
            </div>
          </div>

          {/* Reputación / Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</p>
              <p className="font-extrabold text-purple-300 text-sm">{singer.stats.reputation}/100</p>
            </div>
          </div>

          {/* Energía */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Energía</p>
              <p className="font-extrabold text-cyan-300 text-sm">{singer.stats.energy}%</p>
            </div>
          </div>
        </div>

        {/* Action Controls & FastForward */}
        <div className="hidden md:flex items-center gap-2">
          {/* Advance Time Button */}
          <button
            onClick={advanceTime}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
            title="Avanza 1 semana de tiempo en el juego"
          >
            <FastForward className="w-4 h-4" />
            <span>Pasar Semana</span>
          </button>

          {/* Cloud Save Button */}
          <button
            onClick={saveGame}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition"
            title="Guardar partida en Firebase Firestore"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>

          {/* Auth Button */}
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

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto mt-3 flex items-center justify-between border-t border-white/5 pt-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'home' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🏠 Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'studio' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Estudio & Álbumes</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'charts' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Top 50 Spotify</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'metrics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📊 Métricas DSPs</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
              activeTab === 'messages' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Mensajes DMs</span>
            {hasUnreadDms && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-bounce" aria-label={`${pendingDms} mensajes pendientes`}>
                {pendingDms}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'news' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Prensa & X</span>
          </button>

          <button
            onClick={() => setActiveTab('awards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'awards' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Premios & Grammys</span>
          </button>
        </div>

        {/* Mobile quick save / status */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={saveGame}
            className="p-1.5 rounded-lg bg-white/10 text-slate-300"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
