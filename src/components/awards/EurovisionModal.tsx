import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Song, EurovisionResult } from '../../types';
import { Sparkles, Trophy, X, Radio, ChevronRight, Music } from 'lucide-react';
import confetti from 'canvas-confetti';

export const EurovisionModal: React.FC = () => {
  const { 
    singer, 
    discography, 
    eurovisionModalOpen, 
    setEurovisionModalOpen, 
    participateInEurovision 
  } = useGame();

  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [isCompeting, setIsCompeting] = useState(false);
  const [votingStep, setVotingStep] = useState<string>('');
  const [competitionResult, setCompetitionResult] = useState<EurovisionResult | null>(null);

  if (!eurovisionModalOpen || !singer) return null;

  const handleStartEurovision = () => {
    const song = discography.find(s => s.id === selectedSongId);
    if (!song) {
      alert('Debes seleccionar una canción de tu catálogo para representar a tu país.');
      return;
    }

    setIsCompeting(true);
    setVotingStep('Actuación en directo sobre el escenario europeo ante 200 millones de espectadores...');

    setTimeout(() => {
      setVotingStep('Votación del Jurado Profesional: "12 points go to..."');
    }, 1500);

    setTimeout(() => {
      setVotingStep('Televoto del público europeo abriendo líneas...');
    }, 3000);

    setTimeout(() => {
      const res = participateInEurovision(song);
      setCompetitionResult(res);
      setIsCompeting(false);
      if (res.finalRank <= 3) {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    }, 4500);
  };

  const handleClose = () => {
    setEurovisionModalOpen(false);
    setCompetitionResult(null);
    setIsCompeting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-[#12111d] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-3">
            <span>🇪🇺 Invitación Oficial de la Televisión Pública • Eurovisión</span>
          </div>
          <div className="text-4xl mb-1">✨ 🎙️ 🌟</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Representa a {singer.nationality} en Eurovisión
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            Has pegado un gran hit y tu país te ha seleccionado para la Gran Final de Eurovisión.
            <strong className="block text-amber-300 mt-1">
              Participación #{singer.eurovisionParticipationCount + 1} de 2 permitidas en toda tu carrera.
            </strong>
          </p>
        </div>

        {/* Result view */}
        {competitionResult ? (
          <div className="space-y-5 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3">
              <div className="text-5xl">
                {competitionResult.finalRank === 1 ? '🏆' : competitionResult.finalRank <= 3 ? '🥈' : '🎖️'}
              </div>
              <h3 className="text-xl font-black text-white">
                {competitionResult.finalRank === 1
                  ? `¡CAMPEÓN DE EUROVISIÓN!`
                  : `Puesto Final: #${competitionResult.finalRank}`}
              </h3>
              <p className="text-sm text-purple-300 font-semibold">
                Obtuviste un total de <strong className="text-white">{competitionResult.points} puntos</strong> con tu interpretación de "{competitionResult.songTitle}".
              </p>
              <div className="pt-2 text-xs text-slate-400">
                País Ganador: <strong className="text-white">{competitionResult.winnerCountry}</strong>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30"
            >
              Volver a la Carrera
            </button>
          </div>
        ) : isCompeting ? (
          /* Live voting animation */
          <div className="py-12 text-center space-y-4">
            <Radio className="w-10 h-10 text-purple-400 animate-pulse mx-auto" />
            <h3 className="text-lg font-bold text-white">En directo desde la Gran Final</h3>
            <p className="text-xs text-purple-300 animate-bounce font-medium">{votingStep}</p>
          </div>
        ) : (
          /* Selection Screen */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                Selecciona la Canción de tu Catálogo para Participar
              </label>

              {discography.length === 0 ? (
                <div className="p-5 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-400">
                  Aún no has publicado ninguna canción. Ve al Estudio y estrena al menos un single para poder llevarlo a Eurovisión.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {discography.map(song => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => setSelectedSongId(song.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                        selectedSongId === song.id
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Music className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="font-bold text-white">{song.title}</p>
                          <p className="text-[10px] text-slate-400">{song.genre} • Calidad: {song.quality}/100</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {(song.streamsTotal / 1000).toFixed(0)}k streams
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartEurovision}
                disabled={!selectedSongId || discography.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition disabled:opacity-50 active:scale-[0.99]"
              >
                <span>Subir al Escenario de Eurovisión</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
