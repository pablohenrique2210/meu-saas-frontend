'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// O "Cérebro" do nosso componente
const insightsDictionary = {
  rh_alert: {
    title: "Análise Preditiva de Risco",
    observation: "Observamos um aumento de 18% nos indicadores de exaustão na equipe de Vendas nos últimos 7 dias.",
    interpretation: "Esse padrão correlaciona-se com picos de demanda e aumenta o risco de turnover em 40%.",
    action: "Recomendamos intervenção preventiva com a trilha 'Recuperação Emocional' e revisão das metas mensais."
  },
  personal_fatigue: {
    title: "Insight Pessoal",
    observation: "Identificamos sinais moderados de sobrecarga nas tuas últimas interações.",
    interpretation: "Este estado pode impactar a tua capacidade de foco profundo ao longo da semana.",
    action: "Recomendamos focar em pausas estruturadas de 5 minutos a cada hora. Vê o módulo de Gestão de Estresse."
  },
  gamification_streak: {
    title: "Evolução Comportamental",
    observation: "A tua consistência na plataforma está melhor do que 82% dos colaboradores do teu departamento.",
    interpretation: "Manter este ritmo consolida vias neurais associadas à resiliência ao stress.",
    action: "Continua o excelente trabalho. O teu próximo marco de XP desbloqueia uma insígnia exclusiva."
  }
};

export default function SmartInsight({ type = 'rh_alert', delay = 1500 }: { type: keyof typeof insightsDictionary, delay?: number }) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const data = insightsDictionary[type];

  // A magia do "Fake Loading"
  useEffect(() => {
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, delay); // Fica a "pensar" durante 1.5 segundos
    return () => clearTimeout(timer);
  }, [type, delay]);

  return (
    <div className="w-full bg-gradient-to-r from-indigo-50/50 to-violet-50/50 border border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      
      {/* Efeito de brilho de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          // ==========================================
          // ESTADO 1: O FAKE LOADING (Espera Inteligente)
          // ==========================================
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-xl">
                ⚙️
              </motion.span>
            </div>
            <div className="space-y-2.5 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-indigo-900">A processar milhões de pontos de dados...</p>
              </div>
              {/* Skeleton Bars animadas */}
              <div className="h-2 w-3/4 bg-indigo-200/50 rounded-full overflow-hidden">
                 <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/2 bg-indigo-300 rounded-full" />
              </div>
            </div>
          </motion.div>
        ) : (
          // ==========================================
          // ESTADO 2: O INSIGHT ENTREGUE (Uau!)
          // ==========================================
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex gap-4 items-start relative z-10"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-indigo-100 shrink-0 text-indigo-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">{data.title}</h4>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Automático</span>
              </div>
              
              <div className="text-sm leading-relaxed space-y-2">
                {/* 1. Observação */}
                <p className="text-slate-700 font-medium">{data.observation}</p>
                {/* 2. Interpretação */}
                <p className="text-slate-600 italic">"{data.interpretation}"</p>
                {/* 3. Ação (Destaque visual forte) */}
                <div className="mt-3 bg-white/60 p-3 rounded-xl border border-indigo-50 flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">👉</span>
                  <p className="font-bold text-indigo-950">{data.action}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}