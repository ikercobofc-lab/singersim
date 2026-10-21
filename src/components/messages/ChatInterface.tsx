import React, { useState, useRef, useEffect } from 'react';
import { ConversationMessage, ConversationIntent, NPCArtist, Song, FameProfile, CareerState, ArtistSkills, PrivateProject } from '../../types';
import { generateNPCResponse, classifyIntent, extractEntities } from '../../utils/intentEngine';

// Definir NPCResponse localmente ya que está en intentEngine.ts
interface NPCResponse {
  text: string;
  intent: ConversationIntent;
  pendingProposal?: {
    type: 'collab' | 'remix' | 'demo_review';
    summary: string;
    suggestedSongTitle?: string;
    suggestedGenre?: string;
    suggestedRole?: string;
    suggestedRoyalty?: number;
    requiresConfirmation: boolean;
  };
  suggestedAction?: string;
}

interface ChatInterfaceProps {
  npc: NPCArtist;
  conversationHistory: ConversationMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onProposalResponse?: (response: NPCResponse) => void;
  playerName?: string;
  playerSongs?: Song[];
  playerFame?: Partial<FameProfile>;
  playerCareer?: Partial<CareerState>;
  playerSkills?: Partial<ArtistSkills>;
  playerProjects?: PrivateProject[];
  relationshipScore?: number;
  pendingProposals?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  npc,
  conversationHistory,
  onSendMessage,
  onProposalResponse,
  playerName = 'Tú',
  playerSongs = [],
  playerFame = {},
  playerCareer = {},
  playerSkills = {},
  playerProjects = [],
  relationshipScore = 0,
  pendingProposals = 0
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<ConversationIntent | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    // Detectar intención
    const intent = classifyIntent(message);
    setDetectedIntent(intent);
    
    // Extraer entidades (con arrays vacíos si no hay datos)
    const knownArtists = [npc]; // Solo el NPC actual por ahora
    const entities = extractEntities(message, playerSongs, knownArtists);
    
    console.log('Mensaje enviado:', { message, intent, entities });
    
    // Enviar mensaje al contexto
    setIsLoading(true);
    try {
      await onSendMessage(message);
      
      // Crear contexto con valores por defecto para evitar errores de tipo
      const context = {
        npc,
        playerName,
        playerFame: {
          monthlyListeners: playerFame.monthlyListeners || 50000,
          followers: playerFame.followers || 50000,
          industryPrestige: playerFame.industryPrestige || 0,
          criticalReputation: playerFame.criticalReputation || 0,
          streetCred: playerFame.streetCred || 0,
          commercialAppeal: playerFame.commercialAppeal || 0,
          culturalImpact: playerFame.culturalImpact || 0,
          longevityScore: playerFame.longevityScore || 0
        } as FameProfile,
        playerCareer: {
          careerWeek: playerCareer.careerWeek || 0,
          careerYear: playerCareer.careerYear || 0,
          stage: playerCareer.stage || 'rising',
          momentum: playerCareer.momentum || 0,
          energy: playerCareer.energy || 100
        } as CareerState,
        playerSkills: {
          voice: playerSkills.voice || 50,
          flow: playerSkills.flow || 50,
          composition: playerSkills.composition || 50,
          production: playerSkills.production || 50,
          mixing: playerSkills.mixing || 50,
          performance: playerSkills.performance || 50,
          charisma: playerSkills.charisma || 50,
          negotiation: playerSkills.negotiation || 50,
          promotion: playerSkills.promotion || 50
        } as ArtistSkills,
        playerSongs,
        playerProjects,
        relationshipScore,
        conversationHistory: conversationHistory.slice(-5),
        pendingProposals
      };
      
      // Generar respuesta de NPC
      const npcResponse = generateNPCResponse(message, intent, entities, context);
      
      // Si hay propuesta pendiente, notificar al componente padre
      if (npcResponse.pendingProposal && onProposalResponse) {
        onProposalResponse(npcResponse);
      }
      
      // Enviar respuesta del NPC automáticamente
      if (npcResponse.text) {
        setTimeout(async () => {
          await onSendMessage(npcResponse.text);
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (sentAtWeek: number) => {
    const nowWeek = playerCareer.careerWeek || 0;
    const weekDiff = nowWeek - sentAtWeek;
    
    if (weekDiff === 0) return 'Ahora';
    if (weekDiff === 1) return 'Hace 1 semana';
    return `Hace ${weekDiff} semanas`;
  };

  const renderIntentBadge = (intent: ConversationIntent) => {
    const intentColors: Record<string, string> = {
      greeting: 'bg-blue-100 text-blue-800',
      collab_proposal: 'bg-green-100 text-green-800',
      remix_proposal: 'bg-indigo-100 text-indigo-800',
      demo_share: 'bg-teal-100 text-teal-800',
      negotiation: 'bg-amber-100 text-amber-800',
      studio_invite: 'bg-cyan-100 text-cyan-800',
      availability_check: 'bg-lime-100 text-lime-800',
      small_talk: 'bg-slate-100 text-slate-800',
      feedback_request: 'bg-violet-100 text-violet-800',
      unknown: 'bg-gray-100 text-gray-800'
    };

    const intentLabels: Record<string, string> = {
      greeting: 'Saludo',
      collab_proposal: '🎵 Solicitud de colaboración',
      remix_proposal: '🎧 Propuesta de remix',
      demo_share: '🎼 Compartir demo',
      negotiation: '🤝 Negociación de condiciones',
      studio_invite: '🎙️ Invitación al estudio',
      availability_check: '📅 Disponibilidad',
      small_talk: '💬 Charla casual',
      feedback_request: '📝 Feedback musical',
      unknown: '❓ Intención desconocida'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${intentColors[intent] || 'bg-gray-100 text-gray-800'}`}>
        {intentLabels[intent] || intent}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {npc.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{npc.name}</h3>
              <p className="text-sm text-gray-600">{npc.origin || 'España'} • {npc.genre}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Relación: <span className="font-medium">{relationshipScore >= 20 ? 'Cálida' : relationshipScore <= -10 ? 'Fría' : 'Neutral'}</span>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {conversationHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">💬</div>
            <p>Inicia una conversación con {npc.name}</p>
            <p className="text-sm mt-1">La IA detectará automáticamente tus intenciones y generará respuestas realistas</p>
          </div>
        ) : (
          conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.from === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${msg.from === 'player'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.from === 'player' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatTime(msg.sentAtWeek)} • {msg.from === 'player' ? playerName : npc.name}
                </div>
                
                {/* Mostrar intención detectada en mensajes del jugador */}
                {msg.from === 'player' && msg.intent && (
                  <div className="mt-1">
                    {renderIntentBadge(msg.intent)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Mensaje de carga */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="p-4 border-t border-gray-200">
        {/* Indicador de intención detectada */}
        {detectedIntent && (
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Intención detectada:</span>
              {renderIntentBadge(detectedIntent)}
            </div>
            <button
              onClick={() => setDetectedIntent(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sugerencias de mensajes */}
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { text: '¡Hola! ¿Cómo estás?', intent: 'greeting' },
            { text: '¿Te interesaría colaborar en un tema?', intent: 'collab_proposal' },
            { text: '¿Qué opinas de la escena musical actual?', intent: 'small_talk' },
            { text: '¿Tienes algún proyecto nuevo?', intent: 'feedback_request' }
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInputMessage(suggestion.text);
                const intent = classifyIntent(suggestion.text);
                setDetectedIntent(intent as ConversationIntent);
              }}
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {suggestion.text}
            </button>
          ))}
        </div>

        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Escribe un mensaje para ${npc.name}...`}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <p>💡 La IA analizará tu mensaje y generará una respuesta realista basada en la personalidad, origen y relación con {npc.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;