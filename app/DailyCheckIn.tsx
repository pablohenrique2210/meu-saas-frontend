'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock de dados para o gráfico (últimos 7 dias)
const mockTimelineData = [
  { day: 'Seg', mood: 'good', score: 3 },
  { day: 'Ter', mood: 'good', score: 3 },
  { day: 'Qua', mood: 'neutral', score: 2 },
  { day: 'Qui', mood: 'tired', score: 1 },
  { day: 'Sex', mood: 'neutral', score: 2 },
  { day: 'Sáb', mood: 'good', score: 3 },
  // O dia de hoje será injetado dinamicamente no gráfico
];

export default function DailyCheckIn() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedMood, setSelectedMood] = useState<'good' | 'neutral' | 'tired' | null>(null);

  // Ação de Check-in com Fake Delay para simular processamento de IA
  const handleCheckIn = (mood: 'good' | 'neutral' | 'tired') => {
    setSelectedMood(mood);
    setStatus('loading');
    
    // O Micro Delay Mágico de 1.2 segundos
    setTimeout(() => {
      setStatus('success');
    }, 1200);
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden relative">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 text-lg">O teu estado hoje</h3>
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
               <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">+10 XP <span className="text-sm">✨</span></span>
               <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">Streak 8 <span className="text-sm animate-pulse">🔥</span></span>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ==========================================
              ESTADO 1: A PERGUNTA (RITUAL)
              ========================================== */}
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
              className="flex justify-between gap-4"
            >
              <button onClick={() => handleCheckIn('good')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-all group">
                <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }} className="text-5xl drop-shadow-sm group-hover:drop-shadow-md transition-all">😊</motion.div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Bem</span>
              </button>
              
              <button onClick={() => handleCheckIn('neutral')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent hover:border-amber-100 hover:bg-amber-50/50 transition-all group">
                <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }} className="text-5xl drop-shadow-sm group-hover:drop-shadow-md transition-all">😐</motion.div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-amber-700">Neutro</span>
              </button>

              <button onClick={() => handleCheckIn('tired')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent hover:border-rose-100 hover:bg-rose-50/50 transition-all group">
                <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }} className="text-5xl drop-shadow-sm group-hover:drop-shadow-md transition-all">😞</motion.div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-700">Cansado</span>
              </button>
            </motion.div>
          )}

          {/* ==========================================
              ESTADO 2: O FAKE LOADING (ANSIEDADE BOA)
              ========================================== */}
          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500 animate-pulse">A cruzar o teu estado com o histórico...</p>
            </motion.div>
          )}

          {/* ==========================================
              ESTADO 3: O RESULTADO (LINHA DO TEMPO + IA)
              ========================================== */}
          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              {/* Gráfico SVG de Curva Premium */}
              <div className="w-full h-32 mb-6 relative">
                {/* Linhas de fundo (Grid) */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 z-0">
                   <div className="w-full border-t border-slate-100 border-dashed" />
                   <div className="w-full border-t border-slate-100 border-dashed" />
                   <div className="w-full border-t border-slate-100 border-dashed" />
                </div>
                
                {/* A Linha animada usando SVG */}
                <svg className="w-full h-full absolute inset-0 z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <motion.path 
                    d={`M 0,${selectedMood === 'tired' ? 80 : 20} C 20,20 40,50 60,80 S 80,20 100,${selectedMood === 'good' ? 20 : selectedMood === 'neutral' ? 50 : 80}`}
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor={selectedMood === 'good' ? '#10b981' : selectedMood === 'neutral' ? '#f59e0b' : '#f43f5e'} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Pontos de dados diários */}
                <div className="absolute bottom-0 w-full flex justify-between px-1 text-[10px] font-bold text-slate-400">
                  <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span className="text-indigo-600">Hoje</span>
                </div>
              </div>

              {/* Insight Automático Personalizado */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-indigo-500 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Padrão Detetado</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {selectedMood === 'tired' 
                      ? "Apresentas uma queda de energia em relação à média da semana passada. Como amanhã é sexta-feira, recomendamos reduzires o trabalho após as 18h para garantires a recuperação."
                      : selectedMood === 'neutral' 
                      ? "O teu estado tem-se mantido estável nos últimos 3 dias. Estás num ponto ótimo de equilíbrio cognitivo."
                      : "O teu pico de energia acompanhou a conclusão daquele módulo! Manter este ritmo melhora os teus indicadores a longo prazo."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}