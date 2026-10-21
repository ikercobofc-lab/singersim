import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Mail, Lock, LogIn, UserPlus, LogOut, X, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginWithEmail, registerWithEmail, logout, isFirebaseLive } = useAuth();
  const { saveGame, isSaving } = useGame();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    const action = isRegisterMode ? registerWithEmail : loginWithEmail;
    const res = await action(email.trim(), password);

    if (res.success) {
      // Auto save game after login
      await saveGame();
      onClose();
    } else {
      setErrorMessage(res.error || 'Error al autenticar en Firebase');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full bg-[#181822] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 relative text-white">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Auth • singersim-4ca37</span>
          </div>
          <h3 className="text-2xl font-black">
            {currentUser ? 'Cuenta de Artista' : isRegisterMode ? 'Crear Cuenta en la Nube' : 'Iniciar Sesión'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser 
              ? 'Tus partidas y carreras se sincronizan automáticamente con Cloud Firestore.'
              : 'Guarda tus canciones, premios y estadísticas en la nube mediante Email/Password.'}
          </p>
        </div>

        {/* Firebase Live status info */}
        {!isFirebaseLive && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="block font-bold">Modo Local Activo (Fallback)</strong>
              Puedes jugar y guardar de forma local. Para conectar a tu proyecto real <code>singersim-4ca37</code>, introduce tus credenciales en el archivo <code>.env</code>.
            </div>
          </div>
        )}

        {/* If logged in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UID Firebase:</span>
                <span className="font-mono text-slate-300">{currentUser.uid.slice(0, 12)}...</span>
              </div>
            </div>

            <button
              onClick={saveGame}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition"
            >
              {isSaving ? 'Guardando en Firestore...' : 'Sincronizar Partida Ahora con Firestore'}
            </button>

            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          /* Login/Register Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="artista@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.99]"
            >
              {isRegisterMode ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>
                {isSubmitting ? 'Conectando...' : isRegisterMode ? 'Registrar y Guardar Carrera' : 'Iniciar Sesión'}
              </span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {isRegisterMode
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate gratis con tu email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
