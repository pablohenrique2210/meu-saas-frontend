"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";
import { API_BASE_URL, apiAssetUrl } from "@/lib/api-config";

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

interface ApiLesson {
  id: string;
  duration?: number | string | null;
}

interface ApiModule {
  lessons?: ApiLesson[];
}

interface ApiCourse {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  author?: string | null;
  coverUrl?: string;
  modules?: ApiModule[];
}

interface ApiProgress {
  lessonId: string;
  isCompleted?: boolean;
  lastTime?: number;
}

const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    STRESS_BURNOUT: "from-rose-500 to-rose-700",
    MENTAL_HEALTH_CLIMATE: "from-[#641C32] to-[#8F3651]",
    POSITIVE_PSYCHOLOGY: "from-amber-400 to-orange-500",
    LEADERSHIP_DEVELOPMENT: "from-[#641C32] to-[#241A1D]",
  };
  return gradients[category] || "from-[#641C32] to-[#241A1D]";
};

const getCategoryLabel = (category: string) =>
  ({
    STRESS_BURNOUT: "Estresse e Burnout",
    MENTAL_HEALTH_CLIMATE: "Saúde Mental",
    POSITIVE_PSYCHOLOGY: "Psicologia Positiva",
    LEADERSHIP_DEVELOPMENT: "Capacitação de Líderes",
  })[category] ?? category.replace(/_/g, " ");

export default function TrilhasPremium() {
  const { getToken, isSignedIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [trilhas, setTrilhas] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        const coursesData = (await coursesRes.json()) as ApiCourse[];
        const progressData = progressRes.ok
          ? ((await progressRes.json()) as ApiProgress[])
          : [];

        const formattedCourses: Course[] = coursesData.map((course) => {
          // 🚀 2. MATEMÁTICA À PROVA DE BALAS PARA STATUS E MÓDULOS
          const modulesCount = course.modules?.length || 0;
          const courseLessonIds =
            course.modules?.flatMap((module) =>
              (module.lessons ?? []).map((lesson) => lesson.id),
            ) || [];
          const totalMinutes =
            course.modules
              ?.flatMap((module) => module.lessons ?? [])
              .reduce(
                (total, lesson) => total + (Number(lesson.duration) || 0),
                0,
              ) || 0;
          const totalLessons = courseLessonIds.length;

          const courseProgress = progressData.filter((progress) =>
            courseLessonIds.includes(progress.lessonId),
          );
          const completedLessons = courseProgress.filter(
            (progress) => progress.isCompleted,
          ).length;
          const hasStarted = courseProgress.some(
            (progress) => (progress.lastTime ?? 0) > 0 || progress.isCompleted,
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
      } catch (loadError) {
        console.warn("Course catalog unavailable", loadError);
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8">
                  {trilhasFiltradas.map((curso) => (
                    <CourseCard key={curso.id} curso={curso} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center bg-white rounded-3xl border border-[#E9E0E2]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] text-[#641C32]">
                    <BookOpen size={24} strokeWidth={1.7} aria-hidden="true" />
                  </div>
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
  const hasValidUrl = Boolean(curso.coverUrl?.trim());
  const normalizedTitle = curso.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const isLeadershipProgram = normalizedTitle.includes("lider em acao");
  const coverSrc =
    !imgError && hasValidUrl
      ? apiAssetUrl(curso.coverUrl)
      : isLeadershipProgram
        ? "/courses/lider-em-acao-cover.png"
        : null;
  const description = isLeadershipProgram
    ? "Aprenda a liderar com empatia e resiliência, promovendo um ambiente de trabalho saudável e de alto desempenho para você e sua equipe."
    : curso.subtitle?.trim() ||
      "Conhecimento aplicado para transformar o cuidado com as pessoas em resultados consistentes.";
  const instructorName = curso.author?.trim() || "Lilian Arruda";
  const instructorRole = getCategoryLabel(curso.category);
  const tags = isLeadershipProgram
    ? ["Bem-estar", "Performance", "Empatia"]
    : [getCategoryLabel(curso.category), "Desenvolvimento"];

  const getButtonText = () => {
    if (curso.status === "concluido") return "Rever";
    if (curso.status === "em_andamento") return "Continuar";
    return "Acessar";
  };

  return (
    <article
      className={`group relative isolate flex h-full min-h-[530px] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_18px_55px_rgba(51,34,39,0.12)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_28px_75px_rgba(100,28,50,0.22)] ${isMain ? "md:min-h-[510px]" : ""}`}
    >
      <div className="pointer-events-none absolute -inset-24 -z-10 rounded-full bg-[#A43B5D]/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex min-h-[335px] flex-1 flex-col overflow-hidden px-6 pb-7 pt-6 sm:px-7">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`Capa do curso ${curso.title}`}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(curso.category)}`}
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(25,17,20,0.96)_0%,rgba(38,20,27,0.88)_48%,rgba(36,26,29,0.2)_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(125deg,transparent_0%,transparent_47%,rgba(255,255,255,.26)_47.3%,transparent_47.8%,transparent_65%,rgba(221,177,93,.4)_65.3%,transparent_65.8%)] [background-size:170px_170px] transition-transform duration-700 group-hover:translate-x-2" />

        <div className="relative z-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/85 sm:text-[10px]">
          {tags.map((tag, index) => (
            <React.Fragment key={tag}>
              {index > 0 && <span className="text-[#E0B965]">|</span>}
              <span>{tag}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="relative z-10 mt-auto max-w-[92%] translate-y-0 transition-transform duration-500 group-hover:-translate-y-1">
          <h3 className="mb-4 font-serif text-[2rem] leading-[0.98] text-white drop-shadow-sm sm:text-[2.35rem]">
            {curso.title}
          </h3>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-white/90 sm:text-[15px]">
            {description}
          </p>
        </div>
      </div>

      <div className="relative flex flex-col bg-white px-6 pb-5 pt-5 sm:px-7">
        {curso.progress > 0 && (
          <div className="absolute left-0 right-0 top-0 h-1 bg-[#EEE6E8]">
            <div
              className="h-full bg-gradient-to-r from-[#641C32] to-[#B35C76] transition-all duration-1000 ease-out"
              style={{ width: `${curso.progress}%` }}
            />
          </div>
        )}

        <div className="flex min-w-0 items-center gap-3 border-b border-[#EEE7E4] pb-4">
          <img
            src="/consultora/lilian-arruda-retrato.jpg"
            alt="Lilian Arruda"
            className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover object-top shadow-[0_3px_12px_rgba(36,26,29,.16)]"
          />
          <p className="min-w-0 text-[13px] leading-snug text-[#594C50]">
            <strong className="font-bold text-[#241A1D]">
              {instructorName}
            </strong>
            <span className="mx-1 text-[#B9ADB0]">|</span>
            <span>{instructorRole}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#776A6E]">
            <span className="flex items-center gap-1.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
              {curso.modulesCount} módulos
            </span>
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#C7BABD]"
            />
            <span>{curso.lessonsCount} aulas</span>
            {curso.progress > 0 && <span>{curso.progress}% concluído</span>}
          </div>

          <span className="relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#641C32] px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_22px_rgba(100,28,50,.25)] transition-all duration-300 group-hover:bg-[#7A223E] group-hover:shadow-[0_12px_28px_rgba(100,28,50,.34)]">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{getButtonText()} conteúdo</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>

      <Link
        href={`/aula/${curso.id}`}
        className="absolute inset-0 z-30 rounded-[2rem] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#641C32]"
      >
        <span className="sr-only">
          {getButtonText()} conteúdo de {curso.title}
        </span>
      </Link>
    </article>
  );
}
