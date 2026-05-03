'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ==========================================
// MOCK DATA
// ==========================================
const quizQuestions = [
  {
    id: 1,
    question: "Nas últimas duas semanas, com que frequência te sentiste esgotado(a) no final do dia?",
    options: ["Nunca ou quase nunca", "Alguns dias", "Mais da metade dos dias", "Quase todos os dias"]
  },
  {
    id: 2,
    question: "Sentes que o teu ambiente de trabalho te permite expressar opiniões sem medo?",
    options: ["Sempre", "Na maioria das vezes", "Raramente", "Nunca"]
  },
  {
    id: 3,
    question: "Com que frequência sentes que o teu trabalho é reconhecido?",
    options: ["Frequentemente", "Às vezes", "Raramente", "Nunca"]
  }
];

// ==========================================
// TELA PRINCIPAL (Avaliação Gamificada)
// ==========================================
export default function AvaliacaoPsicossocial() {
  // Estados da jornada
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  // Estados de Gamificação (Memória simulada)
  const [xp, setXp] = useState(540); 
  const [streak, setStreak] = useState(4); 
  const [earnedXp, setEarnedXp] = useState(0);

  // Animação de XP Flutuante
  const [floatingXp, setFloatingXp] = useState<{ id: number, val: number }[]>([]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / quizQuestions.length) * 100;

  // FUNÇÃO DE AVANÇAR COM RECOMPENSA (DOPAMINA IMEDIATA)
  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    // 1. Gera a recompensa (+30 XP)
    const xpReward = 30;
    setXp(prev => prev + xpReward);
    setEarnedXp(prev => prev + xpReward);
    
    // Dispara animação de XP flutuante na tela
    const newFloat = { id: Date.now(), val: xpReward };
    setFloatingXp(prev => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingXp(prev => prev.filter(f => f.id !== newFloat.id));
    }, 1500);

    // 2. Avança ou finaliza (com um pequeno delay para a animação respirar)
    setTimeout(() => {
      if (currentQuestionIndex === quizQuestions.length - 1) {
        setStreak(prev => prev + 1); // Aumenta o Streak ao finalizar!
        setIsFinished(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      }
    }, 300);
  };

  // ==========================================
  // TELA 2: CELEBRAÇÃO (Efeito Duolingo / Headspace)
  // ==========================================
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#F4F8F4] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        {/* Efeito de Glow ao fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5F7D65]/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-6xl mb-8 shadow-xl shadow-[#5F7D65]/20 border-4 border-[#EEF3EC] z-10"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            🌱
          </motion.div>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-4xl text-[#1C2B23] mb-2 z-10"
        >
          Avaliação Concluída!
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-[#5C6E60] max-w-md mb-8 z-10"
        >
          Mais um passo em direção ao teu bem-estar.
        </motion.p>

        {/* CARTÃO DE RECOMPENSAS (GAMIFICAÇÃO) */}
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-[#D5E0D7] w-full max-w-sm mb-10 flex gap-4 z-10"
        >
          <div className="flex-1 bg-orange-50 rounded-2xl p-4 flex flex-col items-center border border-orange-100">
            <span className="text-2xl mb-1">🔥</span>
            <span className="text-xl font-bold text-orange-600">{streak}</span>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Dias Seguidos</span>
          </div>
          <div className="flex-1 bg-[#EEF3EC] rounded-2xl p-4 flex flex-col items-center border border-[#D5E0D7]">
            <span className="text-2xl mb-1">✨</span>
            <span className="text-xl font-bold text-[#5F7D65]">+{earnedXp}</span>
            <span className="text-xs font-bold text-[#8A9B8E] uppercase tracking-wider">XP Ganho</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="z-10 w-full max-w-sm"
        >
          <Link href="/dashboard" className="block w-full bg-[#5F7D65] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#4A6551] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#5F7D65]/30">
            Continuar Jornada
          </Link>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // TELA 1: O QUIZ (Com HUD Gamificado)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F4F8F4] font-sans flex flex-col selection:bg-[#5F7D65] selection:text-white relative overflow-hidden">
      
      {/* ANIMAÇÃO DE XP FLUTUANTE GLOBAL */}
      <AnimatePresence>
        {floatingXp.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 50, scale: 0.5, x: '-50%' }}
            animate={{ opacity: 1, y: -100, scale: 1.2, x: '-50%' }}
            exit={{ opacity: 0, y: -150 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 z-50 text-2xl font-black text-[#5F7D65] drop-shadow-md pointer-events-none"
          >
            +{f.val} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* HUD (HEAD-UP DISPLAY) GAMIFICADO */}
      <header className="w-full max-w-3xl mx-auto px-6 py-6 sticky top-0 bg-[#F4F8F4]/80 backdrop-blur-md z-40">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#8A9B8E] hover:text-[#5F7D65] hover:shadow-sm border border-[#D5E0D7] transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </Link>
          
          <div className="flex gap-3">
            {/* STREAK */}
            <div className="flex items-center gap-1.5 bg-white border border-[#D5E0D7] px-3 py-1.5 rounded-full shadow-sm">
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-orange-500 text-lg drop-shadow-sm"
              >
                🔥
              </motion.span>
              <span className="font-bold text-slate-700 text-sm">{streak}</span>
            </div>
            
            {/* XP TOTAL (Pisca quando ganha XP) */}
            <motion.div 
              key={xp}
              initial={{ scale: 1.2, backgroundColor: '#E3EBE4' }}
              animate={{ scale: 1, backgroundColor: '#ffffff' }}
              className="flex items-center gap-1.5 border border-[#D5E0D7] px-3 py-1.5 rounded-full shadow-sm"
            >
              <span className="text-[#5F7D65] text-lg drop-shadow-sm">✨</span>
              <span className="font-bold text-[#5F7D65] text-sm">{xp} XP</span>
            </motion.div>
          </div>
        </div>
        
        {/* PROGRESS BAR ANIMADA */}
        <div className="w-full bg-[#E3EBE4] rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#5F7D65] h-full rounded-full relative"
          >
            {/* Reflexo de luz na barra (Efeito Premium) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-full" />
          </motion.div>
        </div>
      </header>

      {/* ÁREA DA PERGUNTA */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <h2 className="font-serif text-2xl md:text-3xl text-[#1C2B23] mb-8 leading-tight text-center">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-10">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;

                return (
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full text-left p-5 rounded-2xl transition-all flex items-center justify-between group
                      ${isSelected 
                        ? 'border-2 border-[#5F7D65] bg-[#EEF3EC] shadow-md' 
                        : 'border-2 border-transparent bg-white shadow-sm hover:border-[#D5E0D7]'
                      }`}
                  >
                    <span className={`text-lg ${isSelected ? 'text-[#1C2B23] font-bold' : 'text-[#5C6E60] font-medium'}`}>
                      {option}
                    </span>
                    
                    {/* Checkbox Animado */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'bg-[#5F7D65]' 
                        : 'bg-[#F4F8F4] border-2 border-[#D5E0D7] group-hover:border-[#8A9B8E]'
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.svg 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            exit={{ scale: 0 }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5"/>
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOTÃO DE AVANÇAR FLUTUANTE (Aparece apenas quando responde) */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-40 pointer-events-none">
          <AnimatePresence>
            {selectedOption !== null && (
              <motion.button 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="pointer-events-auto px-10 py-4 rounded-2xl font-bold text-lg text-white bg-[#5F7D65] hover:bg-[#4A6551] shadow-xl shadow-[#5F7D65]/30 flex items-center gap-3 transition-colors"
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finalizar' : 'Continuar'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}