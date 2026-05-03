"use client"; 

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion"; 
// 👇 Trocamos o SignedIn/SignedOut pelo poderoso useAuth!
import { useAuth, UserButton } from "@clerk/nextjs"; 

// ==========================================
// 1. MENU DE NAVEGAÇÃO PREMIUM (Estilo Vercel/Apple)
// ==========================================
export function NavigationMenu() {
  const pathname = usePathname();

  const links = [
    { name: "Meu Espaço", path: "/dashboard" },
    { name: "Módulos", path: "/trilhas" },
    { name: "Avaliação", path: "/avaliacao" },
    { name: "Para empresas", path: "/empresas" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-full">
      {links.map((link) => {
        const isActive = pathname === link.path || pathname.startsWith(link.path + "/");
        return (
          <Link
            key={link.path}
            href={link.path}
            className="relative px-5 py-2 text-sm font-semibold transition-colors duration-300 rounded-full group"
          >
            {isActive && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white shadow-sm border border-[#E3EBE4] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? "text-[#1C2B23]" : "text-[#8A9B8E] group-hover:text-[#5F7D65]"}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ==========================================
// 2. LANDING PAGE IMPACTANTE
// ==========================================
export default function SerenoLandingPage() {
  // 👇 Aqui ativamos a "memória" do Clerk para saber o estado do utilizador
  const { isLoaded, isSignedIn } = useAuth(); 

  // Variantes para animação em cascata (Stagger effect)
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    // 👇 Adicionámos o "as const" logo a seguir à palavra "spring"!
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F4] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white overflow-hidden relative">
      
      {/* 🌟 Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E3EBE4] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#EEF3EC] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 pointer-events-none" />

      {/* CABEÇALHO */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-40 w-full"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          
          {/* Logo animada */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="bg-gradient-to-tr from-[#5F7D65] to-[#4A6551] text-white p-2 rounded-xl shadow-md flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </motion.div>
            <span className="font-serif text-2xl tracking-tight text-[#1C2B23] font-bold">Sereno</span>
          </Link>

          <NavigationMenu />

          {/* Botões de Ação Dinâmicos (Com Hook do Clerk) */}
          <div className="flex items-center gap-5 min-w-[150px] justify-end">
            
            {/* Se ainda estiver a carregar, não mostramos nada para não piscar */}
            {isLoaded && !isSignedIn && (
              <>
                <Link href="/sign-in" className="text-sm font-bold text-[#5C6E60] hover:text-[#1C2B23] transition-colors">
                  Entrar
                </Link>
                <Link href="/sign-up">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#1C2B23] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-[0_4px_14px_0_rgba(28,43,35,0.3)]"
                  >
                    Começar
                  </motion.button>
                </Link>
              </>
            )}

            {isLoaded && isSignedIn && (
              <>
                <Link href="/dashboard">
                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="bg-[#5F7D65] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#4A6551] transition-all shadow-sm"
                   >
                     O Meu Espaço
                   </motion.button>
                </Link>
                <div className="ml-2 border-l border-[#D5E0D7] pl-4">
<UserButton />                </div>
              </>
            )}

          </div>
        </div>
      </motion.header>

      {/* CONTEÚDO PRINCIPAL (HERO) */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* ESQUERDA: Textos Animados */}
        <motion.div variants={containerVars} initial="hidden" animate="show" className="flex-1 max-w-2xl">
          <motion.div variants={itemVars} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#D5E0D7] px-4 py-2 rounded-full text-xs font-bold tracking-wide text-[#5C6E60] mb-8 shadow-sm">
            <span className="animate-pulse text-[#5F7D65]">✨</span> Plataforma Nº1 de Bem-Estar Corporativo
          </motion.div>

          <motion.h1 variants={itemVars} className="font-serif text-5xl md:text-6xl lg:text-[72px] leading-[1.05] text-[#1C2B23] mb-6 tracking-tight">
            Cuidar das pessoas é <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A6551] to-[#5F7D65] italic">também</span> cuidar do negócio.
          </motion.h1>

          <motion.p variants={itemVars} className="text-lg md:text-xl text-[#5C6E60] font-medium mb-10 leading-relaxed max-w-lg">
            A plataforma de educação corporativa que previne riscos psicossociais com inteligência, avaliação e gamificação diária.
          </motion.p>

          <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Dinâmica do botão principal com base no login */}
            {isLoaded && !isSignedIn && (
              <Link href="/sign-up" className="w-full sm:w-auto">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-[#5F7D65] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(95,125,101,0.4)] transition-shadow hover:shadow-[0_8px_30px_rgba(95,125,101,0.6)]">
                  Começar gratuitamente
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </motion.button>
              </Link>
            )}

            {isLoaded && isSignedIn && (
               <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-[#5F7D65] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(95,125,101,0.4)] transition-shadow hover:shadow-[0_8px_30px_rgba(95,125,101,0.6)]">
                  Continuar Jornada
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </motion.button>
              </Link>
            )}

            <Link href="/trilhas" className="w-full sm:w-auto">
              <motion.button whileHover={{ backgroundColor: "rgba(255,255,255,0.6)" }} className="w-full bg-white/40 backdrop-blur-md border border-[#D5E0D7] text-[#2D3A31] px-8 py-4 rounded-full font-bold text-lg hover:border-[#8A9B8E] transition-all shadow-sm">
                Ver módulos
              </motion.button>
            </Link>

          </motion.div>
        </motion.div>

        {/* DIREITA: Card de Gamificação */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full md:w-[420px] flex justify-center md:justify-end relative perspective-1000"
        >
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white/90 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_30px_60px_rgb(95,125,101,0.15)] border border-white w-full max-w-md z-20"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] font-black tracking-widest text-[#8A9B8E] uppercase">Sua Jornada</span>
              <div className="bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                Streak 7d <span className="text-lg">🔥</span>
              </div>
            </div>

            <h3 className="font-serif text-3xl font-bold text-[#1C2B23] mb-2 tracking-tight">Inteligência Emocional</h3>
            <p className="text-sm font-bold text-[#8A9B8E] mb-8">Aula 2 de 3 • 15 min</p>

            <div className="w-full bg-[#E3EBE4] rounded-full h-3 mb-8 overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: '66%' }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-[#5F7D65] to-[#4A6551] h-3 rounded-full relative"
              >
                <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/30 blur-[4px]"></div>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.03, y: -2 }} className="flex items-center gap-4 bg-[#F4F8F4] p-4 rounded-2xl border border-[#D5E0D7] cursor-pointer">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border border-[#EEF3EC]">
                💚
              </div>
              <div>
                <p className="text-base font-black text-[#2D3A31]">+120 XP</p>
                <p className="text-xs font-bold text-[#8A9B8E] uppercase tracking-wider mt-0.5">Recompensa final</p>
              </div>
            </motion.div>
          </motion.div>
          <motion.div animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-10 left-10 right-10 h-10 bg-[#5F7D65] rounded-[100%] blur-2xl z-10" />
        </motion.div>

      </main>
    </div>
  );
}