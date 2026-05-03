'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SmartInsight from './SmartInsight';
import DailyCheckIn from './DailyCheckIn';

// ==========================================
// 1. FUNÇÕES E COMPONENTES AUXILIARES
// ==========================================

// Hook para animar números (Efeito Apple Fitness)
function useCountUp(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

// Círculo de Progresso Animado
const CircularProgress = ({ value, max, color }: { value: number, max: number, color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        {/* Fundo do Círculo */}
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        {/* Círculo Animado */}
        <motion.circle
          cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900">{useCountUp(value)}</span>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENTE PRINCIPAL: MODAL DE PERFIL
// ==========================================

export default function ProfileModal({ isOpen = true, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  // Valores simulados
  const score = 78;
  const xp = 540;
  const streak = 7;
  const platformProgress = 35;

  // Variantes de cascata para os itens aparecerem um a um
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  // 👇 Aqui está a correção do TypeScript: adicionado o "as const" no type: "spring"
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar Botão */}
            <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white text-slate-600 rounded-full backdrop-blur-md transition-colors shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            <div className="overflow-y-auto no-scrollbar">
              
              {/* 1. HERO DO PERFIL */}
              <div className="relative pt-12 pb-8 px-8 bg-gradient-to-br from-[#EEF3EC] to-[#E3EBE4] border-b border-white/50">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
                  {/* Avatar com status */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#5F7D65] to-[#8A9B8E] p-1 shadow-lg shadow-[#5F7D65]/20">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                        👨‍💻
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                  </div>

                  {/* Info e Mensagem Dinâmica */}
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-[#1C2B23]">João Silva</h2>
                    <p className="text-[#5C6E60] font-medium text-sm mb-3">Product Designer • Equipa de Produto</p>
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm">
                      <span className="text-lg">👏</span>
                      <p className="text-sm font-semibold text-[#2D3A31]">Estás a evoluir muito bem esta semana!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID DE CONTEÚDO */}
              <motion.div 
                variants={containerVars} initial="hidden" animate="show"
                className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* COLUNA ESQUERDA (Score e Gamificação) */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* 2. SCORE PESSOAL */}
                  <motion.div variants={itemVars} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Score de Bem-Estar</h3>
                    <CircularProgress value={score} max={100} color="#5F7D65" />
                    <p className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Excelente estado</p>
                  </motion.div>

                  {/* 3. GAMIFICAÇÃO */}
                  <motion.div variants={itemVars} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tua Jornada</h3>
                    <div className="space-y-4">
                      {/* Streak */}
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl animate-pulse">🔥</span>
                          <span className="font-semibold text-slate-700">Streak Atual</span>
                        </div>
                        <span className="font-bold text-orange-600">{useCountUp(streak)} Dias</span>
                      </div>
                      {/* XP */}
                      <div className="p-3 bg-[#F4F8F4] rounded-xl border border-[#EEF3EC]">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            <span className="font-semibold text-slate-700">XP Total</span>
                          </div>
                          <span className="font-bold text-[#5F7D65]">{useCountUp(xp)}</span>
                        </div>
                        <div className="w-full bg-[#E3EBE4] h-1.5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.5 }} className="bg-[#5F7D65] h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-right mt-1 text-[#8A9B8E] font-medium">Nível 4 (Faltam 260 XP)</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* COLUNA DIREITA (Insights, Check-in, Cursos) */}
                <div className="md:col-span-8 space-y-6">
                  
                  <motion.div variants={itemVars}>
                    <DailyCheckIn />
                  </motion.div>

                  <motion.div variants={itemVars}>
                    <SmartInsight type="personal_fatigue" delay={1500} />
                  </motion.div>

                  {/* 5. PROGRESSO GERAL DA PLATAFORMA */}
                  <motion.div variants={itemVars} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-bold text-slate-800">Conclusão da Plataforma</h3>
                      <span className="font-black text-[#5F7D65] text-xl">{useCountUp(platformProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex gap-0.5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${platformProgress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-[#5F7D65] h-full" />
                    </div>
                  </motion.div>

                  {/* 4. CURSOS EM ANDAMENTO */}
                  <motion.div variants={itemVars}>
                    <h3 className="font-bold text-slate-800 mb-4 px-1">Continuar a aprender</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card de Curso */}
                      <div className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#D5E0D7] transition-all cursor-pointer flex flex-col justify-between h-32">
                        <div>
                          <p className="text-[10px] font-bold text-[#8A9B8E] uppercase tracking-wider mb-1">Módulo 2</p>
                          <h4 className="font-bold text-slate-800 group-hover:text-[#5F7D65] transition-colors">Gestão de Tempo e Foco</h4>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex-1 mr-4">
                            <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium"><span>Progresso</span><span>60%</span></div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#5F7D65] h-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#F4F8F4] flex items-center justify-center text-[#5F7D65] group-hover:bg-[#5F7D65] group-hover:text-white transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação Rápida */}
                      <div className="flex flex-col gap-3 justify-center">
                        <button className="w-full bg-[#1C2B23] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-black transition-all flex justify-center items-center gap-2">
                          Nova Avaliação <span className="text-xl">🌱</span>
                        </button>
                        <button className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all text-sm">
                          Ver Histórico Completo
                        </button>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}