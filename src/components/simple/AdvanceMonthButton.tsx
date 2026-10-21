import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { 
  formatGameTime, 
  getNextMonthButtonLabel, 
  generateMonthlyDecisions,
  applyDecision,
  simulateMonthProgress
} from '../../utils/simpleMonthlySystem';
import { Calendar, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';

const AdvanceMonthButton: React.FC = () => {
  const { singer, advanceTime } = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!singer) return null;

  const currentTime = formatGameTime(singer.career.careerWeek, singer.career.careerStartYear);
  const nextMonthLabel = getNextMonthButtonLabel(singer.career.careerWeek);
  const monthlyDecisions = generateMonthlyDecisions(singer);
  
  // Simular progreso del próximo mes
  const nextMonthPreview = simulateMonthProgress(singer);

  const handleAdvanceMonth = async () => {
    if (monthlyDecisions.length > 0) {
      setIsModalOpen(true);
    } else {
      await advanceMonthDirectly();
    }
  };

  const advanceMonthDirectly = async () => {
    setIsProcessing(true);
    
    // Avanzar 4 semanas (1 mes)
    for (let i = 0; i < 4; i++) {
      await advanceTime();
      // Pequeño delay entre semanas
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsProcessing(false);
  };

  const handleDecisionSelect = (decisionId: string, optionId: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
  };

  const handleApplyDecisionsAndAdvance = async () => {
    setIsProcessing(true);
    
    // Aplicar decisiones seleccionadas
    let updatedSinger = { ...singer };
    Object.entries(selectedDecisions).forEach(([decisionId, optionId]) => {
      // Esto sería mejor en el contexto, pero para demo:
      console.log(`Aplicando decisión ${decisionId}, opción ${optionId}`);
    });
    
    // Avanzar mes
    await advanceMonthDirectly();
    
    setIsModalOpen(false);
    setSelectedDecisions({});
    setIsProcessing(false);
  };

  const hasEnoughResources = () => {
    // Verificar si tiene recursos para las decisiones seleccionadas
    // Implementación simplificada
    return true;
  };

  return (
    <>
      {/* Botón principal */}
      <button
        onClick={handleAdvanceMonth}
        disabled={isProcessing}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Calendar className="w-4 h-4" />
        <span>{isProcessing ? 'Avanzando...' : nextMonthLabel}</span>
      </button>

      {/* Modal de decisiones mensuales */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141d] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Decisiones para {nextMonthLabel}
                  </h2>
                  <p className="text-slate-400">
                    Actualmente: {currentTime} • {singer.fame.monthlyListeners.toLocaleString()} oyentes
                  </p>
                </div>
              </div>
            </div>

            {/* Previsión del próximo mes */}
            <div className="p-6 border-b border-white/10">
              <h3 className="font-bold text-white mb-3">Previsión del próximo mes:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-bold">Nuevos oyentes</span>
                  </div>
                  <div className="text-lg font-black">+{nextMonthPreview.listenersGained.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-bold">Balance estimado</span>
                  </div>
                  <div className="text-lg font-black">
                    {nextMonthPreview.moneyEarned - nextMonthPreview.moneySpent >= 0 ? '+' : ''}
                    {nextMonthPreview.moneyEarned - nextMonthPreview.moneySpent}€
                  </div>
                </div>
              </div>
            </div>

            {/* Decisiones */}
            {monthlyDecisions.length > 0 ? (
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-white">Decisiones estratégicas:</h3>
                
                {monthlyDecisions.map(decision => (
                  <div key={decision.id} className="border border-white/10 rounded-xl p-4">
                    <h4 className="font-bold text-white mb-2">{decision.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">{decision.description}</p>
                    
                    <div className="space-y-2">
                      {decision.options.map(option => {
                        const isSelected = selectedDecisions[decision.id] === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleDecisionSelect(decision.id, option.id)}
                            className={`w-full p-3 rounded-lg text-left transition ${
                              isSelected
                                ? 'bg-purple-500/20 border border-purple-500/50'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white">{option.label}</span>
                              {option.cost.money > 0 && (
                                <span className="text-xs text-amber-400">
                                  {option.cost.money}€ • {option.cost.energy} energía
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs text-slate-400 space-y-1">
                              {option.effects.skills.length > 0 && (
                                <div className="text-emerald-400">
                                  Mejora: {option.effects.skills.join(', ')}
                                </div>
                              )}
                              {option.effects.risks.length > 0 && (
                                <div className="text-rose-400">
                                  Riesgos: {option.effects.risks.join(', ')}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-slate-300">
                  No hay decisiones importantes este mes. Sigue trabajando en tu música.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {Object.keys(selectedDecisions).length === 0 ? (
                    'Selecciona opciones o continúa sin decisiones'
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{Object.keys(selectedDecisions).length} decisión(es) seleccionada(s)</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition"
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApplyDecisionsAndAdvance}
                    disabled={isProcessing || !hasEnoughResources()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span> Avanzando...
                      </span>
                    ) : (
                      'Avanzar Mes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvanceMonthButton;