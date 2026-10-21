import React from 'react';
import { useGame } from '../../context/GameContext';
import { AlertCircle, HelpCircle, ChevronRight, X } from 'lucide-react';

export const DecisionPopup: React.FC = () => {
  const { activeDecisionEvent, resolveDecision, dismissDecisionEvent } = useGame();

  if (!activeDecisionEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="max-w-lg w-full bg-[#181822] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Glow indicator */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Decisión de Carrera Crucial
              </span>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                {activeDecisionEvent.title}
              </h3>
            </div>
          </div>
          <button
            onClick={dismissDecisionEvent}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Description */}
        <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
          {activeDecisionEvent.description}
        </p>

        {/* Choices */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Qué decides hacer?</p>
          {activeDecisionEvent.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => resolveDecision(index)}
              className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-left transition group active:scale-[0.99] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition">
                  {choice.text}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Consecuencia estimada: <span className="text-slate-300">{choice.impactDescription}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
