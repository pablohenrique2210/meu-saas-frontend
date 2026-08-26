import React from "react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// 🚀 IMPORT CORRIGIDO: O "../" faz o código sair da pasta dashboard e encontrar o botão na pasta app!
import BotaoPerfil from "../BotaoPerfil";
import BrandLogo from "../BrandLogo";
import { apiUrl } from "@/lib/api-config";

interface DashboardLesson {
  id: string;
  title: string;
}

interface DashboardModule {
  gameType: "DILEMA" | "INSPECAO" | "CORRIDA" | null;
  gameResults: Array<{ gameType: "DILEMA" | "INSPECAO" | "CORRIDA" }>;
  lessons: DashboardLesson[];
}

interface DashboardCourse {
  id: string;
  title: string;
  modules?: DashboardModule[];
}

interface DashboardProgress {
  lessonId: string;
  isCompleted: boolean;
  updatedAt: string;
}

export default async function DashboardColaborador() {
  // =========================================
  // 1. AUTENTICAÇÃO
  // =========================================
  const authState = await auth();
  const { userId } = authState;
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // =========================================
  // 2. BUSCANDO DADOS REAIS DO NESTJS
  // =========================================
  let courses: DashboardCourse[] = [];
  let progress: DashboardProgress[] = [];
  let connectionError = false;

  try {
    const token = await authState.getToken();
    if (!token) throw new Error("Sessão sem token");
    const headers = { Authorization: `Bearer ${token}` };
    // Busca os cursos
    const coursesRes = await fetch(apiUrl("/api/courses"), {
      cache: "no-store",
      headers,
    });
    if (coursesRes.ok) courses = (await coursesRes.json()) as DashboardCourse[];

    // Busca o progresso deste utilizador
    const progressRes = await fetch(
      apiUrl("/api/courses/user-progress"),
      { cache: "no-store", headers },
    );
    if (progressRes.ok)
      progress = (await progressRes.json()) as DashboardProgress[];
  } catch {
    connectionError = true;
  }

  // =========================================
  // 3. MATEMÁTICA REAL DO DASHBOARD
  // =========================================

  const totalAulasConcluidas = progress.filter(
    (item) => item.isCompleted,
  ).length;

  // Cursos Concluídos e Curso em Andamento
  let completedCoursesCount = 0;
  let cursoEmAndamento: {
    id: string;
    title: string;
    lessonTitle: string;
  } | null = null;
  let dataUltimoAcesso = 0;

  for (const course of courses) {
    const courseLessonIds =
      course.modules?.flatMap((module) =>
        module.lessons.map((lesson) => lesson.id),
      ) || [];
    const totalLessons = courseLessonIds.length;

    if (totalLessons === 0) continue;

    const courseProgress = progress.filter((item) =>
      courseLessonIds.includes(item.lessonId),
    );
    const completedLessons = courseProgress.filter(
      (item) => item.isCompleted,
    ).length;
    const configuredEvaluations =
      course.modules?.filter((module) => module.gameType) ?? [];
    const completedEvaluations = configuredEvaluations.filter((module) =>
      module.gameResults.some((result) => result.gameType === module.gameType),
    ).length;
    const isCourseCompleted =
      completedLessons === totalLessons &&
      completedEvaluations === configuredEvaluations.length;

    // Verifica se concluiu o curso
    if (isCourseCompleted && totalLessons > 0) {
      completedCoursesCount++;
    }
    // Verifica se está em andamento para colocar em destaque
    else if (courseProgress.length > 0) {
      // Descobre qual foi a última aula assistida deste curso
      const lastProgress = courseProgress.sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      )[0];
      const tempoDesseAcesso = new Date(lastProgress.updatedAt).getTime();

      // Se for o curso mexido mais recentemente, guarda-o como destaque!
      if (tempoDesseAcesso > dataUltimoAcesso) {
        dataUltimoAcesso = tempoDesseAcesso;

        // Encontra o título da aula exata
        let tituloDaAula = "Continuar aula";
        course.modules?.forEach((module) => {
          const aulaEncontrada = module.lessons.find(
            (lesson) => lesson.id === lastProgress.lessonId,
          );
          if (aulaEncontrada) tituloDaAula = aulaEncontrada.title;
        });

        cursoEmAndamento = {
          id: course.id,
          title: course.title,
          lessonTitle: tituloDaAula,
        };
      }
    }
  }

  // =========================================
  // INTERFACE PREMIUM
  // =========================================
  return (
    <div className="flex h-screen bg-[#FAF7F4] font-sans text-[#241A1D] selection:bg-[#641C32] selection:text-white">
      {/* 1. MENU LATERAL */}
      <aside className="z-10 hidden w-72 flex-col border-r border-[#E9E0E2] bg-white p-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:flex">
        <Link href="/" className="group mb-12 flex items-center">
          <BrandLogo priority className="h-[58px] max-w-[205px]" />
        </Link>

        <nav className="flex flex-col space-y-3 font-medium flex-1">
          <Link
            href="/dashboard"
            className="text-[#241A1D] bg-[#F5EFEC] px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm border border-[#E9E0E2]"
          >
            <span className="text-[#641C32]">🏠</span> Meu Espaço
          </Link>
          <Link
            href="/trilhas"
            className="text-[#776A6E] hover:bg-[#FAF7F4] hover:text-[#241A1D] px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-colors"
          >
            <span className="opacity-70">📚</span> Trilhas de Estudo
          </Link>
        </nav>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8 lg:p-12 xl:p-16">
        <Link href="/" className="mb-8 block w-fit lg:hidden">
          <BrandLogo priority className="h-[52px] max-w-[190px]" />
        </Link>

        {connectionError && (
          <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3">
            <span>⚠️</span> O servidor do banco de dados (NestJS) parece estar
            desligado. As tuas estatísticas podem não estar atualizadas.
          </div>
        )}

        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
          <div>
            <h2 className="font-serif text-4xl text-[#241A1D] tracking-tight mb-2">
              Olá, {user.firstName || "Colaborador"}.
            </h2>
            <p className="text-lg text-[#776A6E]">
              Bem-vindo de volta ao teu espaço de evolução e foco.
            </p>
          </div>

          {/* Acesso ao perfil */}
          <div className="flex items-center gap-4">
            <BotaoPerfil />
          </div>
        </header>

        {/* Indicadores Reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Estado / Aulas */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(100,28,50,0.06)] border border-[#E9E0E2] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#F5EFEC] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-[#776A6E] text-xs font-bold uppercase tracking-widest mb-4 relative z-10">
              Aulas Finalizadas
            </h3>
            <p className="font-serif text-4xl text-[#241A1D] relative z-10 mb-2">
              {totalAulasConcluidas}
            </p>
            <p className="text-sm text-[#641C32] font-bold relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#641C32] animate-pulse"></span>{" "}
              Em constante evolução
            </p>
          </div>

          {/* Card 2: Progresso Global */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(100,28,50,0.06)] border border-[#E9E0E2]">
            <h3 className="text-[#776A6E] text-xs font-bold uppercase tracking-widest mb-4">
              Cursos Concluídos
            </h3>
            <p className="font-serif text-4xl text-[#241A1D] mb-4">
              {completedCoursesCount}{" "}
              <span className="text-[#776A6E] text-2xl font-sans">
                / {courses.length}
              </span>
            </p>
            <div className="w-full bg-[#F5EFEC] rounded-full h-2.5 overflow-hidden border border-[#E9E0E2]">
              <div
                className="bg-[#641C32] h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${courses.length > 0 ? (completedCoursesCount / courses.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Card 3: Cursos realmente disponibilizados */}
          <div className="bg-[#641C32] p-8 rounded-3xl shadow-[0_12px_30px_rgba(100,28,50,0.2)] text-white flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
              <h3 className="text-[#DED4D7] text-xs font-bold uppercase tracking-widest mb-2">
                Cursos disponíveis
              </h3>
              <p className="font-serif text-4xl mb-1">{courses.length}</p>
            </div>
            <Link
              href="/trilhas"
              className="inline-flex items-center gap-2 text-sm font-bold hover:text-[#F5EFEC] transition-colors mt-4 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20"
            >
              Ver cursos{" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Dinâmica: Trilha de Aprendizado Destacada */}
        <section className="mb-12">
          <h3 className="font-serif text-2xl text-[#241A1D] mb-6">
            Continuar a tua jornada
          </h3>

          {cursoEmAndamento ? (
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(100,28,50,0.06)] border border-[#E9E0E2] flex flex-col md:flex-row justify-between items-center gap-6 transform transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#F5EFEC] flex items-center justify-center text-3xl shadow-inner border border-[#E9E0E2]">
                  🚀
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-serif text-2xl text-[#241A1D] mb-1 truncate">
                    {cursoEmAndamento.title}
                  </h4>
                  <p className="text-[#641C32] font-bold text-sm truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#641C32]"></span>
                    Próxima parada:{" "}
                    <span className="text-[#776A6E] font-medium">
                      {cursoEmAndamento.lessonTitle}
                    </span>
                  </p>
                </div>
              </div>
              <Link
                href={`/aula/${cursoEmAndamento.id}`}
                className="w-full md:w-auto bg-[#241A1D] border border-[#241A1D] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 shrink-0"
              >
                Retomar aula
              </Link>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E9E0E2] flex flex-col items-center justify-center text-center py-12">
              <div className="text-4xl mb-4 opacity-50">🌱</div>
              <h4 className="font-serif text-xl text-[#241A1D] mb-2">
                Tudo em dia!
              </h4>
              <p className="text-[#776A6E] mb-6">
                Não tens nenhum curso a meio. Que tal começares a explorar novos
                conhecimentos?
              </p>
              <Link
                href="/trilhas"
                className="bg-[#641C32] text-white px-8 py-3 rounded-full font-bold hover:bg-[#7D2943] transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
