import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Music, 
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface MonthlyDecision {
  id: string;
  title: string;
  description: string;
  type: 'career_growth' | 'financial_investment' | 'personal_development' | 
        'creative_direction' | 'industry_relationship' | 'audience_expansion';
  options: Array<{
    id: string;
    label: string;
    description: string;
    cost?: { money: number; energy: number; timeMonths: number };
    risks: string[];
    rewards: string[];
  }>;
}

interface MonthlyDecisionModalProps {
  decisions: MonthlyDecision[];
  currentMonth: number;
  currentYear: number;
  singerStats: {
    balance: number;
    energy: number;
    monthlyListeners: number;
  };
  onDecisionMade: (decisionId: string, optionId: string) => void;
  onClose: () => void;
}

const MonthlyDecisionModal: React.FC<MonthlyDecisionModalProps> = ({
  decisions,
  currentMonth,
  currentYear,
  singerStats,
  onDecisionMade,
  onClose
}) => {
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'career_growth': return <TrendingUp className="w-4 h-4" />;
      case 'financial_investment': return <DollarSign className="w-4 h-4" />;
      case 'personal_development': return <Target className="w-4 h-4" />;
      case 'creative_direction': return <Music className="w-4 h-4" />;
      case 'industry_relationship': return <Users className="w-4 h-4" />;
      case 'audience_expansion': return <Users className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'career_growth': return 'bg-green-500/20 text-green-400';
      case 'financial_investment': return 'bg-yellow-500/20 text-yellow-400';
      case 'personal_development': return 'bg-blue-500/20 text-blue-400';
      case 'creative_direction': return 'bg-purple-500/20 text-purple-400';
      case 'industry_relationship': return 'bg-pink-500/20 text-pink-400';
      case 'audience_expansion': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleOptionSelect = (decisionId: string, optionId: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Aplicar cada decisión
    Object.entries(selectedDecisions).forEach(([decisionId, optionId]) => {
      onDecisionMade(decisionId, optionId);
    });
    
    // Pequeño delay para feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    onClose();
  };

  const calculateTotalCost = () => {
    let totalMoney = 0;
    let totalEnergy = 0;
    let totalTime = 0;

    Object.entries(selectedDecisions).forEach(([decisionId, optionId]) => {
      const decision = decisions.find(d => d.id === decisionId);
      if (decision) {
        const option = decision.options.find(o => o.id === optionId);
        if (option?.cost) {
          totalMoney += option.cost.money;
          totalEnergy += option.cost.energy;
          totalTime += option.cost.timeMonths;
        }
      }
    });

    return { totalMoney, totalEnergy, totalTime };
  };

  const { totalMoney, totalEnergy, totalTime } = calculateTotalCost();
  const hasEnoughResources = 
    singerStats.balance >= totalMoney && 
    singerStats.energy >= totalEnergy;

  if (decisions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#14141d] border border-white/15 rounded-3xl max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <p className="text-slate-300 mb-6">
            No hay decisiones importantes este mes. Sigue trabajando en tu música y preparándote para el próximo mes.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14141d] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#14141d] border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  Decisiones de {monthNames[currentMonth]} {currentYear}
                </h2>
                <p className="text-slate-400">
                  Toma decisiones estratégicas que afectarán tu carrera este mes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Dinero disponible</span>
                <DollarSign className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {singerStats.balance.toLocaleString()}€
                {totalMoney > 0 && (
                  <span className={`text-sm ml-2 ${totalMoney > singerStats.balance ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ({totalMoney > 0 ? '-' : ''}{totalMoney}€)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Energía</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {singerStats.energy}/100
                {totalEnergy > 0 && (
                  <span className={`text-sm ml-2 ${totalEnergy > singerStats.energy ? 'text-rose-400' : 'text-amber-400'}`}>
                    ({totalEnergy > 0 ? '-' : ''}{totalEnergy})
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Oyentes</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {singerStats.monthlyListeners.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Decisions */}
        <div className="p-6 space-y-6">
          {decisions.map(decision => (
            <div key={decision.id} className="border border-white/10 rounded-2xl overflow-hidden">
              {/* Decision Header */}
              <div className="p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${getTypeColor(decision.type)}`}>
                      {getTypeIcon(decision.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{decision.title}</h3>
                      <p className="text-sm text-slate-400">{decision.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTypeColor(decision.type)}`}>
                    {decision.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 bg-[#0f0f15]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {decision.options.map(option => {
                    const isSelected = selectedDecisions[decision.id] === option.id;
                    const canAfford = option.cost ? 
                      singerStats.balance >= option.cost.money && 
                      singerStats.energy >= option.cost.energy : true;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(decision.id, option.id)}
                        disabled={!canAfford}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10'
                            : canAfford
                            ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            : 'border-white/5 bg-white/3 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white">{option.label}</h4>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>

                        <p className="text-sm text-slate-300 mb-3">{option.description}</p>

                        {option.cost && (
                          <div className="space-y-1.5 mb-3">
                            {option.cost.money > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Coste:</span>
                                <span className={`font-bold ${option.cost.money > singerStats.balance ? 'text-rose-400' : 'text-white'}`}>
                                  {option.cost.money}€
                                </span>
                              </div>
                            )}
                            {option.cost.energy > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Energía:</span>
                                <span className={`font-bold ${option.cost.energy > singerStats.energy ? 'text-rose-400' : 'text-amber-400'}`}>
                                  -{option.cost.energy}
                                </span>
                              </div>
                            )}
                            {option.cost.timeMonths > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Tiempo:</span>
                                <span className="font-bold text-slate-300">
                                  {option.cost.timeMonths} mes{option.cost.timeMonths !== 1 ? 'es' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-bold text-emerald-400 mb-1">Ventajas:</div>
                            <ul className="text-xs text-slate-300 space-y-0.5">
                              {option.rewards.slice(0, 2).map((reward, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">✓</span> {reward}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-rose-400 mb-1">Riesgos:</div>
                            <ul className="text-xs text-slate-300 space-y-0.5">
                              {option.risks.slice(0, 2).map((risk, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">⚠</span> {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#14141d] border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {Object.keys(selectedDecisions).length === 0 ? (
                'Selecciona al menos una opción por decisión'
              ) : !hasEnoughResources ? (
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>No tienes suficientes recursos para estas decisiones</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Listo para avanzar el mes</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white font-semibold hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedDecisions).length === 0 || !hasEnoughResources || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold transition ${
                  Object.keys(selectedDecisions).length > 0 && hasEnoughResources
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span> Avanzando mes...
                  </span>
                ) : (
                  `Avanzar a ${monthNames[(currentMonth + 1) % 12]}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDecisionModal;