"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { AccountButton } from "./AccountButton";
import BrandLogo from "./BrandLogo";

const navigationLinks = [
  { name: "Meu Espaço", mobileName: "Espaço", path: "/dashboard" },
  { name: "Jornadas", mobileName: "Jornadas", path: "/trilhas" },
  { name: "Para empresas", mobileName: "Empresas", path: "/empresas" },
];

/**
 * ============================================================
 * LILIAN ARRUDA — IDENTIDADE PREMIUM
 * ============================================================
 * Paleta:
 *   primary:     #641C32  (bordô profundo)
 *   secondary:   #7D2943  (vinho)
 *   light:       #8F3651  (vinho claro)
 *   background:  #FAF7F4  (ivory)
 *   gold:        #C59A62  (uso muito pontual)
 *
 * Tipografia:
 *   Headings -> Instrument Serif / Playfair Display (font-serif)
 *   Interface -> Manrope / Plus Jakarta Sans (font-sans)
 *
 * NOTA DE SETUP: este componente assume que `font-serif` e
 * `font-sans` foram remapeados no tailwind.config (ou via
 * next/font) para Instrument Serif / Playfair Display e
 * Manrope / Plus Jakarta Sans, respectivamente. Exemplo:
 *
 *   // tailwind.config.ts
 *   fontFamily: {
 *     serif: ["var(--font-display)", "serif"],
 *     sans: ["var(--font-body)", "sans-serif"],
 *   }
 *
 *   // fonts.ts (next/font/google)
 *   import { Instrument_Serif, Manrope } from "next/font/google";
 *   export const display = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-display" });
 *   export const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
 * ============================================================
 */

// ==========================================
// 1. NAVBAR — leve, premium, item ativo em bordô
// ==========================================
export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 p-1.5 bg-white/70 backdrop-blur-xl border border-white shadow-[0_4px_24px_rgba(100,28,50,0.04)] rounded-full">
      {navigationLinks.map((link) => {
        const isActive =
          pathname === link.path || pathname.startsWith(link.path + "/");
        return (
          <Link
            key={link.path}
            href={link.path}
            className="relative px-5 py-2 text-sm font-semibold transition-colors duration-300 rounded-full group"
          >
            {isActive && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-[#641C32] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                isActive
                  ? "text-white"
                  : "text-[#776A6E] group-hover:text-[#641C32]"
              }`}
            >
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavigationMenu() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="mb-5 grid grid-cols-3 gap-1 rounded-2xl border border-white bg-white/75 p-1.5 shadow-[0_8px_28px_rgba(100,28,50,0.08)] backdrop-blur-xl sm:mb-6 lg:hidden"
    >
      {navigationLinks.map((link) => {
        const isActive =
          pathname === link.path || pathname.startsWith(`${link.path}/`);

        return (
          <Link
            key={link.path}
            href={link.path}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-xl px-2 py-2.5 text-center text-xs font-bold transition-colors sm:text-sm ${
              isActive
                ? "bg-[#641C32] text-white shadow-sm"
                : "text-[#776A6E] hover:bg-[#F5EFEC] hover:text-[#641C32]"
            }`}
          >
            {link.mobileName}
          </Link>
        );
      })}
    </nav>
  );
}

// ==========================================
// 2. LANDING PAGE
// ==========================================
export default function LilianArrudaLandingPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.1 },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 26 },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] font-sans text-[#241A1D] selection:bg-[#641C32] selection:text-white overflow-hidden relative">
      {/* Glows extremamente sutis — assinatura vinho, não preenchimento */}
      <div className="absolute top-[-12%] left-[-8%] w-[520px] h-[520px] bg-gradient-to-br from-[#641C32]/[0.06] to-[#8F3651]/[0.04] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-6%] w-[560px] h-[560px] bg-[#F5EFEC] rounded-full blur-[130px] opacity-80 pointer-events-none" />

      {/* CABEÇALHO */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-40 w-full"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-5 sm:py-6">
            <Link href="/" className="group flex items-center">
              <BrandLogo
                priority
                className="h-[52px] max-w-[180px] sm:h-[62px] sm:max-w-[245px]"
              />
            </Link>

            <NavigationMenu />

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-5">
              {isLoaded && !isSignedIn && (
                <>
                  <Link
                    href="/sign-in"
                    className="hidden text-sm font-bold text-[#776A6E] transition-colors hover:text-[#241A1D] sm:inline-flex"
                  >
                    Entrar
                  </Link>
                  <Link href="/sign-up">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full bg-[#641C32] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(100,28,50,0.55)] transition-all hover:bg-[#7D2943] sm:px-6"
                    >
                      <span className="sm:hidden">Entrar</span>
                      <span className="hidden sm:inline">
                        Entrar no meu espaço
                      </span>
                    </motion.button>
                  </Link>
                </>
              )}

              {isLoaded && isSignedIn && (
                <>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full bg-[#641C32] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(100,28,50,0.55)] transition-all hover:bg-[#7D2943] sm:px-6"
                    >
                      <span className="sm:hidden">Espaço</span>
                      <span className="hidden sm:inline">O Meu Espaço</span>
                    </motion.button>
                  </Link>
                  <div className="ml-2 border-l border-[#E9E0E2] pl-4">
                    <AccountButton />
                  </div>
                </>
              )}
            </div>
          </div>
          <MobileNavigationMenu />
        </div>
      </motion.header>

      {/* HERO */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-5 pb-20 pt-10 sm:px-6 sm:pt-16 md:flex-row md:gap-16 md:pb-24 md:pt-28">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex-1 max-w-2xl"
        >
          <motion.div
            variants={itemVars}
            className="inline-flex items-center gap-2 bg-white border border-[#E9E0E2] px-4 py-2 rounded-full text-xs font-bold tracking-wide text-[#7D2943] mb-8 shadow-[0_2px_10px_rgba(100,28,50,0.05)]"
          >
            <span className="text-[#C59A62]">●</span> Inteligência corporativa
            para cuidado humano
          </motion.div>

          <motion.h1
            variants={itemVars}
            className="mb-6 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-[#241A1D] sm:text-5xl md:text-6xl lg:text-[68px]"
          >
            Cuidar das pessoas.
            <br />
            <span className="italic text-[#641C32]">Fortalecer</span> o negócio.
          </motion.h1>

          <motion.p
            variants={itemVars}
            className="text-lg md:text-xl text-[#776A6E] font-medium mb-10 leading-relaxed max-w-lg"
          >
            Uma plataforma de inteligência e educação corporativa para prevenir
            riscos psicossociais, desenvolver pessoas e transformar o cuidado em
            estratégia.
          </motion.p>

          <motion.div
            variants={itemVars}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            {isLoaded && !isSignedIn && (
              <Link href="/sign-up" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#641C32] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_18px_36px_-14px_rgba(100,28,50,0.55)] transition-shadow hover:shadow-[0_18px_44px_-12px_rgba(100,28,50,0.65)]"
                >
                  Continuar jornada
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>
            )}

            {isLoaded && isSignedIn && (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#641C32] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_18px_36px_-14px_rgba(100,28,50,0.55)] transition-shadow hover:shadow-[0_18px_44px_-12px_rgba(100,28,50,0.65)]"
                >
                  Continuar jornada
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>
            )}

            <Link href="/trilhas" className="w-full sm:w-auto">
              <motion.button
                whileHover={{
                  backgroundColor: "#F5EFEC",
                  borderColor: "#8F3651",
                }}
                transition={{ duration: 0.25 }}
                className="w-full bg-transparent border border-[#DED4D7] text-[#241A1D] px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                Ver módulos
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* CARD "SEU MOMENTO" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
          className="w-full md:w-[420px] flex justify-center md:justify-end relative"
        >
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white p-8 rounded-[28px] shadow-[0_40px_80px_-30px_rgba(100,28,50,0.22)] border border-[#E9E0E2] w-full max-w-md z-20"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] font-black tracking-widest text-[#776A6E] uppercase">
                Aprendizagem corporativa
              </span>
              <div className="bg-[#F5EFEC] border border-[#E9E0E2] text-[#7D2943] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                Dados conectados
              </div>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#241A1D] mb-2 tracking-tight">
              Evolução visível para pessoas e RH
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-[#776A6E]">
              Cursos, módulos, aulas e relatórios alimentados pelos registros
              reais da plataforma.
            </p>

            <div className="space-y-3">
              {[
                "Progresso por curso e módulo",
                "Acompanhamento individual",
                "Diagnósticos em PDF para o RH",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] px-4 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#641C32] shadow-sm">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-[#241A1D]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 0.92, 1], opacity: [0.18, 0.08, 0.18] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 left-10 right-10 h-10 bg-[#641C32] rounded-[100%] blur-2xl z-10"
          />
        </motion.div>
      </main>
    </div>
  );
}
