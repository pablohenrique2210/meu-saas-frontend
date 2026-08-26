"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

// ==========================================
// 1. COMPONENTES AUXILIARES (Livre de Erros de Hooks)
// ==========================================

const AnimatedNumber = ({
  end,
  duration = 2,
}: {
  end: number;
  duration?: number;
}) => {
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

  return <>{count}</>;
};

// ==========================================
// 2. COMPONENTE PRINCIPAL: MODAL DE PERFIL
// ==========================================

export default function ProfileModal({
  isOpen = true,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [platformProgress, setPlatformProgress] = useState(0);
  const [activeCourse, setActiveCourse] = useState<{
    id: string;
    title: string;
    module: string;
    progress: number;
  } | null>(null);
  const [profileDataError, setProfileDataError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserData = async () => {
      if (!user || !isOpen) return;
      setProfileDataError(null);

      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token de acesso.");
        const headers = { Authorization: `Bearer ${token}` };
        const [coursesRes, progRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/courses/user-progress`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!coursesRes.ok || !progRes.ok) {
          throw new Error(
            `A API respondeu ${coursesRes.status}/${progRes.status}.`,
          );
        }

        if (coursesRes.ok && progRes.ok) {
          const courses = await coursesRes.json();
          const progress = await progRes.json();

          const completedLessons = progress.filter((p: any) => p.isCompleted);
          let allLessonsCount = 0;
          courses.forEach((c: any) => {
            allLessonsCount +=
              c.modules?.flatMap((m: any) => m.lessons).length || 0;
          });
          const platProg =
            allLessonsCount === 0
              ? 0
              : Math.round((completedLessons.length / allLessonsCount) * 100);

          let lastActiveCourse = null;
          let lastProgressDate = 0;

          courses.forEach((c: any) => {
            const lessonIds =
              c.modules?.flatMap((m: any) => m.lessons.map((l: any) => l.id)) ||
              [];
            const courseProg = progress.filter((p: any) =>
              lessonIds.includes(p.lessonId),
            );

            if (courseProg.length > 0) {
              const latest = courseProg.sort(
                (a: any, b: any) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              )[0];
              const time = new Date(latest.updatedAt).getTime();

              if (time > lastProgressDate) {
                lastProgressDate = time;
                const completedInCourse = courseProg.filter(
                  (p: any) => p.isCompleted,
                ).length;

                let moduleName = "Módulo 1";
                c.modules?.forEach((m: any, idx: number) => {
                  if (m.lessons.some((l: any) => l.id === latest.lessonId))
                    moduleName = `Módulo ${idx + 1}`;
                });

                lastActiveCourse = {
                  id: c.id,
                  title: c.title,
                  module: moduleName,
                  progress: Math.round(
                    (completedInCourse / lessonIds.length) * 100,
                  ),
                };
              }
            }
          });

          setPlatformProgress(platProg);
          setActiveCourse(lastActiveCourse);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setProfileDataError(
          error instanceof TypeError
            ? "Não foi possível conectar ao servidor. Confirme se o backend está ativo na porta 4000."
            : "Não foi possível carregar os dados do perfil.",
        );
      }
    };

    void fetchUserData();
    return () => controller.abort();
  }, [getToken, isOpen, user]);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#FAF7F4] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white text-slate-600 rounded-full backdrop-blur-md transition-colors shadow-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto no-scrollbar">
              <div className="relative pt-12 pb-8 px-8 bg-gradient-to-br from-[#F5EFEC] to-[#E9E0E2] border-b border-white/50">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#641C32] to-[#776A6E] p-1 shadow-lg shadow-[#641C32]/20">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                        {isLoaded && user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">👨‍💻</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                      <div className="w-4 h-4 bg-[#7D2943] rounded-full border-2 border-white" />
                    </div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-[#241A1D]">
                      {isLoaded
                        ? user?.firstName + " " + user?.lastName
                        : "A carregar..."}
                    </h2>
                    <p className="text-[#776A6E] font-medium text-sm mb-3">
                      {user?.primaryEmailAddress?.emailAddress ??
                        "Perfil autenticado"}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm">
                      <span className="text-lg">👏</span>
                      <p className="text-sm font-semibold text-[#241A1D]">
                        {platformProgress > 0
                          ? `Progresso atual: ${platformProgress}%`
                          : "Nenhum progresso registrado até o momento."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {profileDataError && (
                  <div className="md:col-span-12 flex items-center justify-between gap-4 rounded-2xl border border-[#FAD2CF] bg-[#FCE8E6]/60 px-5 py-4 text-sm font-semibold text-[#A50E0E]">
                    <span>{profileDataError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDataError(null);
                        onClose?.();
                      }}
                      className="shrink-0 underline underline-offset-2"
                    >
                      Fechar
                    </button>
                  </div>
                )}

                <div className="md:col-span-12 space-y-6">
                  <motion.div
                    variants={itemVars}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-bold text-slate-800">
                        Conclusão da Plataforma
                      </h3>
                      {/* E finalmente aqui! */}
                      <span className="font-black text-[#641C32] text-xl">
                        <AnimatedNumber end={platformProgress} />%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex gap-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${platformProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-[#641C32] h-full"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVars}>
                    <h3 className="font-bold text-slate-800 mb-4 px-1">
                      Continuar a aprender
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeCourse ? (
                        <Link
                          href={`/aula/${activeCourse.id}`}
                          className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#E9E0E2] transition-all cursor-pointer flex flex-col justify-between h-32"
                        >
                          <div>
                            <p className="text-[10px] font-bold text-[#776A6E] uppercase tracking-wider mb-1">
                              {activeCourse.module}
                            </p>
                            <h4 className="font-bold text-slate-800 group-hover:text-[#641C32] transition-colors truncate">
                              {activeCourse.title}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex-1 mr-4">
                              <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                                <span>Progresso</span>
                                <span>{activeCourse.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${activeCourse.progress}%`,
                                  }}
                                  transition={{ duration: 1 }}
                                  className="bg-[#641C32] h-full"
                                />
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#F5EFEC] flex items-center justify-center text-[#641C32] group-hover:bg-[#641C32] group-hover:text-white transition-colors shrink-0">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col justify-center items-center text-center h-32">
                          <span className="text-xl mb-1 opacity-50">🍃</span>
                          <p className="text-sm font-bold text-slate-400">
                            Nenhum curso iniciado.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 justify-center">
                        <Link
                          href="/trilhas"
                          className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all text-sm flex justify-center"
                        >
                          Explorar Cursos
                        </Link>
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
