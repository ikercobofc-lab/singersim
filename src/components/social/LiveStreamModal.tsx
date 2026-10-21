import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  X,
  Radio,
  Camera,
  Video,
  Mic,
  MessageCircle,
  Users,
  TrendingUp,
  Music,
  Sparkles,
} from 'lucide-react';
import { LiveStreamPlatform, LiveStreamType, StatementType, ProjectTeaser } from '../../types';
import confetti from 'canvas-confetti';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LIVE_STREAM_TYPES: Array<{ value: LiveStreamType; label: string; icon: string }> = [
  { value: 'casual_chat', label: 'Charla Casual', icon: '💬' },
  { value: 'studio_session', label: 'Sesión de Estudio', icon: '🎵' },
  { value: 'qa', label: 'Preguntas y Respuestas', icon: '❓' },
  { value: 'teaser_reveal', label: 'Revelar Adelanto', icon: '🔥' },
  { value: 'announcement', label: 'Anuncio Importante', icon: '📢' },
  { value: 'comeback_special', label: 'Especial de Regreso', icon: '🎉' },
];

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose }) => {
  const { singer, albums, discography, startLiveStream, endLiveStream, activeLiveStream } = useGame();

  const [platform, setPlatform] = useState<LiveStreamPlatform>('instagram');
  const [type, setType] = useState<LiveStreamType>('casual_chat');
  const [duration, setDuration] = useState(30);
  const [title, setTitle] = useState('');

  // Declaración
  const [showStatementSection, setShowStatementSection] = useState(false);
  const [statementText, setStatementText] = useState('');
  const [statementType, setStatementType] = useState<StatementType>('working_hint');
  const [selectedProject, setSelectedProject] = useState('');

  // Adelanto
  const [showTeaserSection, setShowTeaserSection] = useState(false);
  const [teaserType, setTeaserType] = useState<ProjectTeaser['type']>('audio_snippet');
  const [teaserContent, setTeaserContent] = useState('');

  const [isStreaming, setIsStreaming] = useState(false);

  if (!isOpen || !singer) return null;

  const handleStart = () => {
    if (!title.trim()) {
      alert('Por favor, añade un título al directo');
      return;
    }

    const statements = showStatementSection && statementText.trim()
      ? [{ type: statementType, text: statementText, relatedProjectId: selectedProject || undefined }]
      : undefined;

    const teasers: ProjectTeaser[] | undefined =
      showTeaserSection && teaserContent.trim()
        ? [{
            id: Date.now().toString(),
            type: teaserType,
            content: teaserContent,
            songId: selectedProject || undefined,
            revealedAtWeek: 0, // Will be set by the engine
            source: platform === 'instagram' ? 'instagram_live' : 'youtube_live',
            viralityScore: 0, // Will be calculated
            publicReaction: 'interested' // Default
          }]
        : undefined;

    try {
      const result = startLiveStream({
        platform,
        type,
        title,
        duration,
        statementsToCreate: statements,
        teasersToShow: teasers,
      });

      setIsStreaming(true);

      // Simular finalización del directo después de unos segundos
      setTimeout(() => {
        endLiveStream();
        setIsStreaming(false);

        // Mostrar confetti si fue exitoso
        if (result.hypeGenerated > 50) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        // Resetear form
        setTitle('');
        setStatementText('');
        setTeaserContent('');
        setShowStatementSection(false);
        setShowTeaserSection(false);

        onClose();
      }, 3000);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (isStreaming && activeLiveStream) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-2xl font-black text-white uppercase tracking-wider">EN DIRECTO</span>
            </div>

            <h2 className="text-3xl font-black text-white">{activeLiveStream.title}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-xl">
                <Users className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-3xl font-black text-white">{activeLiveStream.peakViewers.toLocaleString()}</p>
                <p className="text-xs text-white/70">Espectadores</p>
              </div>

              <div className="bg-black/40 p-4 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-3xl font-black text-emerald-400">{activeLiveStream.hypeGenerated}</p>
                <p className="text-xs text-white/70">Hype Generado</p>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-xl max-h-40 overflow-y-auto space-y-2">
              <p className="text-xs font-bold text-white/70 uppercase">Chat en vivo:</p>
              {activeLiveStream.topComments.map((comment, idx) => (
                <p key={idx} className="text-sm text-white">
                  <span className="font-bold text-cyan-400">Usuario{idx + 1}:</span> {comment}
                </p>
              ))}
            </div>

            <p className="text-sm text-white/70">Finalizando directo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161f] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#16161f] border-b border-white/10 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Radio className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Hacer un Directo</h2>
              <p className="text-xs text-slate-400">Conecta con tu audiencia en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Platform */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Plataforma</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform('instagram')}
                className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                  platform === 'instagram'
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <Camera className="w-6 h-6 text-pink-500" />
                <div className="text-left">
                  <p className="font-bold text-white">Instagram Live</p>
                  <p className="text-xs text-slate-400">3% de tus seguidores</p>
                </div>
              </button>

              <button
                onClick={() => setPlatform('youtube')}
                className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                  platform === 'youtube'
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <Video className="w-6 h-6 text-red-500" />
                <div className="text-left">
                  <p className="font-bold text-white">YouTube Live</p>
                  <p className="text-xs text-slate-400">2% de tus suscriptores</p>
                </div>
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Tipo de Directo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LiveStreamType)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
            >
              {LIVE_STREAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Título del Directo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Hablando con vosotros 💜 / Anuncio importante / Q&A"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Duración: {duration} minutos
            </label>
            <input
              type="range"
              min={10}
              max={120}
              step={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Statement Section */}
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <button
              onClick={() => setShowStatementSection(!showStatementSection)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white">Hacer una Declaración</span>
              </div>
              <span className="text-white">{showStatementSection ? '−' : '+'}</span>
            </button>

            {showStatementSection && (
              <div className="mt-4 space-y-3">
                <select
                  value={statementType}
                  onChange={(e) => setStatementType(e.target.value as StatementType)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="working_hint">Estoy trabajando en algo</option>
                  <option value="project_tease">Preparando algo especial</option>
                  <option value="album_hint">Pista sobre un álbum</option>
                  <option value="album_promise">Promesa de álbum</option>
                  <option value="album_announcement">Anuncio de álbum</option>
                  <option value="release_date">Confirmar fecha</option>
                </select>

                <textarea
                  value={statementText}
                  onChange={(e) => setStatementText(e.target.value)}
                  placeholder="Escribe lo que quieres decir..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                {albums.length > 0 && (
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  >
                    <option value="">Sin relacionar con proyecto</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Teaser Section */}
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <button
              onClick={() => setShowTeaserSection(!showTeaserSection)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">Mostrar Adelanto</span>
              </div>
              <span className="text-white">{showTeaserSection ? '−' : '+'}</span>
            </button>

            {showTeaserSection && (
              <div className="mt-4 space-y-3">
                <select
                  value={teaserType}
                  onChange={(e) => setTeaserType(e.target.value as ProjectTeaser['type'])}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="audio_snippet">Fragmento de Audio</option>
                  <option value="lyrics_snippet">Fragmento de Letra</option>
                  <option value="collab_hint">Pista de Colaboración</option>
                  <option value="title_hint">Pista del Título</option>
                </select>

                <textarea
                  value={teaserContent}
                  onChange={(e) => setTeaserContent(e.target.value)}
                  placeholder="Describe el adelanto que vas a mostrar..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Prediction */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-xs font-bold text-purple-300 uppercase mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Predicción de Audiencia
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Espectadores pico:</p>
                <p className="font-bold text-white">
                  {Math.floor(singer.fame.followers * (platform === 'instagram' ? 0.03 : 0.02)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Hype estimado:</p>
                <p className="font-bold text-emerald-400">
                  {type === 'announcement' || type === 'comeback_special' ? 'Alto' : type === 'teaser_reveal' ? 'Muy Alto' : 'Moderado'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <Radio className="w-5 h-5" />
              Empezar Directo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
