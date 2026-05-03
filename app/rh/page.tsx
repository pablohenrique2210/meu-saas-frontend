'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DailyCheckIn from '../DailyCheckIn';
import ProfileModal from '../ProfileModal'; 
import SmartInsight from '../SmartInsight'; 

// ==========================================
// 1. O NOVO CARD DE ALERTA INTELIGENTE (PREMIUM)
// ==========================================
function SmartAlertCard({ team, risk, metrics, insight, onAction }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(225, 29, 72, 0.15)" }}
      className="relative bg-white border border-rose-200/80 rounded-[20px] p-6 overflow-hidden group transition-all duration-300"
    >
      {/* Efeito de Pulse (Atenção Urgente mas Elegante) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse pointer-events-none" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">{team}</h3>
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {risk}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
      </div>

      {/* Métricas Essenciais (Subinfo) */}
      <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-sm font-black ${m.alert ? 'text-rose-600' : 'text-slate-700'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Fake AI Insight (O que vende o software) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-inner relative z-10">
        <span className="text-amber-400 text-lg mt-0.5 animate-bounce">✨</span>
        <p className="text-xs text-slate-200 font-medium leading-relaxed">
          <span className="text-white font-bold">Insight Automático:</span> {insight}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 relative z-10">
        <button 
          onClick={onAction} 
          className="flex-1 bg-rose-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-[0_4px_14px_0_rgba(225,29,72,0.3)] active:scale-95 flex items-center justify-center gap-2"
        >
          Recomendar Trilha
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
          Ver Detalhes
        </button>
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================
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
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}


// ==========================================
// 3. TELA PRINCIPAL (DASHBOARD)
// ==========================================
export default function DashboardRH() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isPlanApplied, setIsPlanApplied] = useState(false);

  const healthScore = useCountUp(78, 2.5);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  
  // 👇 AQUI ESTÁ A CORREÇÃO: "as const" adicionado ao type: "spring"
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

  const handleApplyPlan = () => {
    setIsPlanApplied(true);
    setTimeout(() => {
      setIsAlertModalOpen(false);
      setIsPlanApplied(false); 
    }, 4000); 
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col justify-between z-20">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-10 px-2 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="font-semibold text-white tracking-tight text-lg">Mente<span className="text-slate-400 font-normal">Saudável</span></span>
          </div>
          <nav className="flex flex-col space-y-1">
            <Link href="/rh" className="bg-white/10 text-white px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium border border-white/5 shadow-sm backdrop-blur-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              Saúde Organizacional
            </Link>
          </nav>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">
        
        {/* HEADER TRANSLÚCIDO */}
        <header className="sticky top-0 h-16 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-30">
           <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
             <span>Workspace</span> 
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
             <span className="text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">Dashboard Executivo</span>
           </div>
           
           <button 
             onClick={() => setIsProfileOpen(true)}
             className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5F7D65] to-[#8A9B8E] text-white flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-transform"
           >
             JS
           </button>
        </header>

        <main className="flex-1 p-8 pb-24">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto">
            
            {/* HERO SECTION GIGANTE (SCORE) */}
            <motion.div variants={item} className="relative overflow-hidden bg-white border border-slate-200/60 rounded-[32px] p-10 shadow-sm mb-10 group">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                    Estável, com <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-700">riscos emergentes.</span>
                  </h1>
                  <p className="text-slate-500 font-medium text-lg max-w-md mt-4">
                    O bem-estar geral está bom, mas a nossa Inteligência detetou focos urgentes que exigem ação.
                  </p>
                </div>
                {/* Score */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner min-w-[200px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score Organizacional</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-7xl font-black tracking-tighter text-slate-900">{healthScore}</span>
                    <span className="text-xl font-bold text-slate-400">/100</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* O CÉREBRO DA IA APARECE AQUI */}
            <motion.div variants={item} className="mb-10">
              <SmartInsight type="rh_alert" delay={1800} />
            </motion.div>

            {/* 👇 AQUI ESTÁ A CORREÇÃO: Removidos os parâmetros do DailyCheckIn */}
            <motion.div variants={item} className="mb-10">
              <DailyCheckIn /> 
            </motion.div>

            {/* SEÇÃO DE ALERTAS INTELIGENTES */}
            <motion.div variants={item}>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Alertas da Inteligência</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartAlertCard 
                  team="Equipe de Vendas"
                  risk="Alto Risco de Burnout"
                  metrics={[
                    { label: "Engajamento", value: "-18%", alert: true },
                    { label: "Carga Horária", value: "Alta", alert: true },
                    { label: "Recuperação", value: "Baixa", alert: true }
                  ]}
                  insight="A Equipe está muito acima da média de carga emocional da empresa. Detectamos um aumento consistente de sinais de exaustão e falta de pausas estruturadas nos últimos 7 dias."
                  onAction={() => setIsAlertModalOpen(true)}
                />

                <SmartAlertCard 
                  team="Apoio ao Cliente"
                  risk="Fadiga Moderada"
                  metrics={[
                    { label: "Ansiedade", value: "+12%", alert: true },
                    { label: "Satisfação", value: "Estável", alert: false },
                    { label: "Turnos", value: "Irregulares", alert: true }
                  ]}
                  insight="Padrões irregulares de sono reportados cruzam com excesso de tickets complexos. Recomendamos revisão da escala do fim de semana."
                  onAction={() => setIsAlertModalOpen(true)}
                />
              </div>
            </motion.div>

          </motion.div>
        </main>

        {/* =========================================
            MODAL DE INTERVENÇÃO (MOMENTO WOW)
            ========================================= */}
        <AnimatePresence>
          {isAlertModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isPlanApplied && setIsAlertModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white w-full max-w-xl rounded-[28px] shadow-2xl overflow-hidden"
              >
                {!isPlanApplied ? (
                  <>
                    <div className="bg-slate-50 p-8 border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v10l4.5 4.5M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z"/></svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Plano de Intervenção</h2>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        A nossa IA estruturou um plano imediato para a <strong className="text-slate-900">Equipe de Vendas</strong> focado na redução rápida de Burnout.
                      </p>
                    </div>

                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Diagnóstico Principal</h3>
                        <div className="flex gap-2">
                          <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-rose-100">Sobrecarga Emocional</span>
                          <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-rose-100">Falta de Pausas Estruturadas</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Trilhas Recomendadas</h3>
                        <div className="space-y-3">
                          {["Gestão de Estresse (15 min/dia)", "Inteligência Emocional (Módulo Expresso)", "Equilíbrio Vida-Trabalho (Masterclass)"].map((trilha, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                              </div>
                              <span className="font-bold text-indigo-950 text-sm">{trilha}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsAlertModalOpen(false)} className="px-5 py-4 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                          Salvar Rascunho
                        </button>
                        <button onClick={handleApplyPlan} className="flex-1 px-5 py-4 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-black shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2">
                          Aplicar para Equipe
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-12 text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                      <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></motion.svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Plano Aplicado!</h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xs mx-auto">
                      Acompanharemos a evolução da equipe nos próximos dias. Notificações foram enviadas.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        
      </div>
    </div>
  );
}