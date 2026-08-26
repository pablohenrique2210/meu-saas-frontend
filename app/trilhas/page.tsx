"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

// 🚀 1. INTERFACE CORRIGIDA (Separamos Módulos de Aulas)
interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  author: string | null;
  modulesCount: number;
  lessonsCount: number; // Agora temos os dois!
  progress: number;
  status: "em_andamento" | "concluido" | "nao_iniciado";
  totalMinutes: number;
  coverUrl?: string;
}

const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    STRESS_BURNOUT: "from-rose-500 to-rose-700",
    MENTAL_HEALTH_CLIMATE: "from-[#641C32] to-[#8F3651]",
    POSITIVE_PSYCHOLOGY: "from-amber-400 to-orange-500",
  };
  return gradients[category] || "from-[#641C32] to-[#241A1D]";
};

const getCategoryLabel = (category: string) =>
  ({
    STRESS_BURNOUT: "Estresse e Burnout",
    MENTAL_HEALTH_CLIMATE: "Saúde Mental",
    POSITIVE_PSYCHOLOGY: "Psicologia Positiva",
  })[category] ?? category.replace(/_/g, " ");

export default function TrilhasPremium() {
  const { getToken, isSignedIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [trilhas, setTrilhas] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      if (!isSignedIn) return;
      setIsLoading(true);
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token");
        const headers = { Authorization: `Bearer ${token}` };
        const coursesRes = await fetch(`${API_BASE_URL}/api/courses`, {
          headers,
        });
        const progressRes = await fetch(
          `${API_BASE_URL}/api/courses/user-progress`,
          { headers },
        );

        if (!coursesRes.ok) throw new Error("Falha ao carregar");

        const coursesData = await coursesRes.json();
        const progressData = progressRes.ok ? await progressRes.json() : [];

        const formattedCourses: Course[] = coursesData.map((course: any) => {
          // 🚀 2. MATEMÁTICA À PROVA DE BALAS PARA STATUS E MÓDULOS
          const modulesCount = course.modules?.length || 0;
          const courseLessonIds =
            course.modules?.flatMap((m: any) =>
              m.lessons.map((l: any) => l.id),
            ) || [];
          const totalMinutes =
            course.modules
              ?.flatMap((m: any) => m.lessons)
              .reduce(
                (total: number, lesson: any) =>
                  total + (Number(lesson.duration) || 0),
                0,
              ) || 0;
          const totalLessons = courseLessonIds.length;

          const courseProgress = progressData.filter((p: any) =>
            courseLessonIds.includes(p.lessonId),
          );
          const completedLessons = courseProgress.filter(
            (p: any) => p.isCompleted,
          ).length;
          const hasStarted = courseProgress.some(
            (p: any) => p.lastTime > 0 || p.isCompleted,
          );

          let status: "nao_iniciado" | "em_andamento" | "concluido" =
            "nao_iniciado";
          let progressPercent = 0;

          if (totalLessons > 0) {
            progressPercent = Math.round(
              (completedLessons / totalLessons) * 100,
            );

            // Lógica de Status Imbatível:
            if (completedLessons === totalLessons) {
              status = "concluido";
              progressPercent = 100;
            } else if (hasStarted || completedLessons > 0) {
              status = "em_andamento";
            }
          }

          return {
            id: course.id,
            title: course.title,
            subtitle: course.description || null,
            category: course.category,
            author: course.author || null,
            modulesCount: modulesCount, // Quantidade real de módulos
            lessonsCount: totalLessons, // Quantidade real de aulas
            progress: progressPercent, // % correta
            status: status, // Status corrigido!
            totalMinutes,
            coverUrl: course.coverUrl,
          };
        });

        setTrilhas(formattedCourses);
      } catch (err) {
        setError(
          "Não foi possível carregar o catálogo. O servidor está ligado?",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, [getToken, isSignedIn]);

  // 🚀 3. PESQUISA INTELIGENTE (Não quebra e pesquisa em todo o lado)
  const trilhasFiltradas = trilhas.filter((trilha) => {
    const matchesFilter =
      activeFilter === "todos" || trilha.status === activeFilter;

    // Tratamento seguro do texto de pesquisa
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      search === "" ||
      (trilha.title && trilha.title.toLowerCase().includes(search)) ||
      trilha.subtitle?.toLowerCase().includes(search) ||
      (trilha.category && trilha.category.toLowerCase().includes(search));

    return matchesFilter && matchesSearch;
  });

  const emAndamento = trilhas.filter((t) => t.status === "em_andamento");

  return (
    <div className="min-h-screen bg-[#FAF7F4] font-sans text-[#241A1D] selection:bg-[#641C32] selection:text-white pb-32">
      <header className="bg-white border-b border-[#E9E0E2] pt-12 pb-10 px-6 lg:px-12 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-widest text-[#776A6E] hover:text-[#641C32] transition-colors flex items-center gap-2 mb-4 w-fit"
            >
              ← Voltar ao Espaço
            </Link>
            <h1 className="font-serif text-4xl lg:text-5xl text-[#241A1D] tracking-tight mb-2">
              Sua jornada de aprendizado
            </h1>
            <p className="text-lg text-[#776A6E]">
              Desenvolva habilidades para uma vida profissional mais saudável.
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Pesquisar cursos ou temas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F4] border border-[#E9E0E2] rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#641C32] focus:ring-1 focus:ring-[#641C32] transition-all placeholder:text-[#776A6E]"
            />
            <svg
              className="absolute left-4 top-3.5 text-[#776A6E]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {["todos", "em_andamento", "nao_iniciado", "concluido"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeFilter === filter ? "bg-[#241A1D] text-white shadow-md" : "bg-[#F5EFEC] text-[#776A6E] hover:bg-[#E9E0E2] hover:text-[#241A1D]"}`}
              >
                {filter === "todos"
                  ? "Todos os Cursos"
                  : filter === "em_andamento"
                    ? "Em Andamento"
                    : filter === "nao_iniciado"
                      ? "Novos"
                      : "Concluídos"}
              </button>
            ),
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 space-y-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold">Erro de conexão</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-slate-200/50 rounded-[2rem] border border-slate-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {emAndamento.length > 0 &&
              activeFilter === "todos" &&
              searchQuery === "" && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <h2 className="font-serif text-3xl text-[#241A1D] mb-6 flex items-center gap-3">
                    <span className="text-[#641C32]">▶</span> Continue a sua
                    evolução
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {emAndamento.map((curso) => (
                      <CourseCard key={curso.id} curso={curso} isMain />
                    ))}
                  </div>
                </section>
              )}

            <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-3xl text-[#241A1D]">
                  {activeFilter === "todos"
                    ? "Catálogo Completo"
                    : "Resultados"}
                </h2>
                <span className="text-sm font-bold text-[#776A6E]">
                  {trilhasFiltradas.length} cursos
                </span>
              </div>
              {trilhasFiltradas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {trilhasFiltradas.map((curso) => (
                    <CourseCard key={curso.id} curso={curso} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center bg-white rounded-3xl border border-[#E9E0E2]">
                  <span className="text-5xl mb-4 opacity-50">🍃</span>
                  <h3 className="font-serif text-2xl text-[#241A1D] mb-2">
                    Nenhum curso encontrado
                  </h3>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function CourseCard({
  curso,
  isMain = false,
}: {
  curso: Course;
  isMain?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const hasValidUrl = curso.coverUrl && curso.coverUrl.startsWith("http");

  const getButtonText = () => {
    if (curso.status === "concluido") return "Rever Curso";
    if (curso.status === "em_andamento") return "Continuar";
    return "Acessar";
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] border border-[#E9E0E2] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(100,28,50,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full">
      <div
        className={`relative w-full p-6 flex flex-col justify-between overflow-hidden ${isMain ? "aspect-[4/3] md:aspect-video" : "aspect-[4/5] sm:aspect-[4/3]"}`}
      >
        {!imgError && hasValidUrl ? (
          <img
            src={curso.coverUrl}
            alt={curso.title}
            onError={() => setImgError(true)}
            // 🚀 AJUSTE AQUI: Adicionado "object-top" para manter o rosto sempre visível e não cortar a testa!
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(curso.category)}`}
          ></div>
        )}
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay opacity-50 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

        <div className="relative z-10 flex justify-between items-start">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">{getCategoryLabel(curso.category)}</span>
        </div>

        <div className="relative z-10 mt-auto transform group-hover:translate-y-[-4px] transition-transform duration-500">
          {curso.subtitle && (
            <p className="text-white/80 font-medium text-xs md:text-sm mb-1 line-clamp-1">
              {curso.subtitle}
            </p>
          )}
          <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-2 text-shadow-sm line-clamp-2">
            {curso.title}
          </h3>
          {curso.author && (
            <p className="text-white/90 text-xs md:text-sm font-semibold flex items-center gap-2">
              <span className="w-4 h-0.5 bg-white/50 rounded-full"></span>{" "}
              {curso.author}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 bg-white relative">
        {curso.progress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-[#641C32] transition-all duration-1000 ease-out"
              style={{ width: `${curso.progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-[#776A6E] uppercase tracking-wider mb-5 mt-2">
          {/* MÓDULOS REAIS */}
          <span className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>{" "}
            {curso.modulesCount} Módulos
          </span>
          {/* PROGRESSO OU AULAS */}
          <span>
            {curso.progress > 0
              ? `${curso.progress}% Concluído`
              : `${curso.lessonsCount} Aulas`}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between border-t border-[#F5EFEC] pt-4">
            <div className="text-xs font-bold text-[#776A6E]">
              {curso.totalMinutes > 0
                ? `${curso.totalMinutes} min cadastrados`
                : null}
            </div>
            <span
              className={`text-sm font-bold transition-colors flex items-center gap-1 ${curso.status === "concluido" ? "text-amber-500" : "text-[#241A1D] group-hover:text-[#641C32]"}`}
            >
              {getButtonText()}{" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <Link href={`/aula/${curso.id}`} className="absolute inset-0 z-30">
        <span className="sr-only">Acessar curso</span>
      </Link>
    </div>
  );
}
