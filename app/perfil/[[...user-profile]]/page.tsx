"use client";

import { UserProfile as ClerkUserProfile, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api-config";
import type { UserProfile as PlatformUserProfile } from "@/lib/users-api";
import { lilianClerkAppearance } from "../../clerkAppearance";

interface ProfileLesson {
  id: string;
  duration: number;
}

interface ProfileModule {
  id: string;
  title: string;
  lessons: ProfileLesson[];
}

interface ProfileCourse {
  id: string;
  title: string;
  description: string | null;
  modules: ProfileModule[];
}

interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  lastTime: number;
  updatedAt: string;
}

interface CourseSummary {
  id: string;
  title: string;
  description: string | null;
  modules: number;
  completedLessons: number;
  totalLessons: number;
  remainingLessons: number;
  progress: number;
  status: "Não iniciado" | "Em andamento" | "Concluído";
  lastActivity: string | null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "US";
  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)?.[0] : ""}`.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function roleLabel(role: PlatformUserProfile["role"]) {
  if (role === "ADMIN") return "Administrador";
  if (role === "HR_MANAGER") return "Gestor de RH";
  return "Colaborador";
}

export default function ProfilePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [profile, setProfile] = useState<PlatformUserProfile | null>(null);
  const [courses, setCourses] = useState<ProfileCourse[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [dataError, setDataError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      setDataError("");
      try {
        if (!isSignedIn) throw new Error("Inicie sessão para ver o perfil.");
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sessão não forneceu um token de acesso.");
        const headers = { Authorization: `Bearer ${token}` };
        const [profileResponse, coursesResponse, progressResponse] =
          await Promise.all([
            fetch(apiUrl("/api/users/me"), {
              cache: "no-store",
              headers,
              signal: controller.signal,
            }),
            fetch(apiUrl("/api/courses"), {
              cache: "no-store",
              headers,
              signal: controller.signal,
            }),
            fetch(apiUrl("/api/courses/user-progress"), {
              cache: "no-store",
              headers,
              signal: controller.signal,
            }),
          ]);

        if (!profileResponse.ok || !coursesResponse.ok || !progressResponse.ok) {
          throw new Error(
            `Não foi possível consultar o perfil (${profileResponse.status}/${coursesResponse.status}/${progressResponse.status}).`,
          );
        }

        setProfile((await profileResponse.json()) as PlatformUserProfile);
        setCourses((await coursesResponse.json()) as ProfileCourse[]);
        setLessonProgress(
          (await progressResponse.json()) as LessonProgress[],
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDataError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do perfil.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [getToken, isLoaded, isSignedIn]);

  const progressByLesson = new Map(
    lessonProgress.map((progress) => [progress.lessonId, progress]),
  );
  const courseSummaries: CourseSummary[] = courses.map((course) => {
    const lessons = course.modules.flatMap((module) => module.lessons);
    const progresses = lessons
      .map((lesson) => progressByLesson.get(lesson.id))
      .filter((progress) => progress !== undefined);
    const completedLessons = progresses.filter(
      (progress) => progress.isCompleted,
    ).length;
    const totalLessons = lessons.length;
    const hasStarted = progresses.some(
      (progress) => progress.isCompleted || progress.lastTime > 0,
    );
    const lastActivity = progresses.reduce<string | null>(
      (latest, progress) =>
        !latest || new Date(progress.updatedAt) > new Date(latest)
          ? progress.updatedAt
          : latest,
      null,
    );
    const progress = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      modules: course.modules.length,
      completedLessons,
      totalLessons,
      remainingLessons: Math.max(0, totalLessons - completedLessons),
      progress,
      status:
        totalLessons > 0 && completedLessons === totalLessons
          ? "Concluído"
          : hasStarted
            ? "Em andamento"
            : "Não iniciado",
      lastActivity,
    };
  });
  const totalLessons = courseSummaries.reduce(
    (total, course) => total + course.totalLessons,
    0,
  );
  const completedLessons = courseSummaries.reduce(
    (total, course) => total + course.completedLessons,
    0,
  );
  const remainingLessons = Math.max(0, totalLessons - completedLessons);
  const overallProgress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#FAF7F4] px-4 py-6 text-[#241A1D] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#776A6E] transition-colors hover:text-[#641C32]"
            >
              <ArrowLeft size={16} /> Voltar ao meu espaço
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8F3651]">
              Perfil corporativo
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              Minha jornada
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#776A6E] sm:text-base">
              Seus dados profissionais, cursos atribuídos e progresso de aprendizagem em um só lugar.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9E0E2] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7D2943]">
            <ShieldCheck size={16} /> Conta protegida
          </div>
        </header>

        {isLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#E9E0E2] bg-white px-5 py-4 text-sm font-semibold text-[#776A6E]">
            <Loader2 size={18} className="animate-spin text-[#641C32]" />
            Carregando empresa, cursos e progresso...
          </div>
        )}

        {dataError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {dataError} A área de segurança continua disponível abaixo.
          </div>
        )}

        {profile && (
          <>
            <section className="overflow-hidden rounded-[28px] border border-[#E9E0E2] bg-white shadow-[0_12px_40px_rgba(36,26,29,0.05)]">
              <div className="bg-gradient-to-br from-[#641C32] to-[#2F2027] p-6 text-white sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 font-serif text-2xl shadow-xl">
                    {initials(profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                      {roleLabel(profile.role)}
                    </p>
                    <h2 className="mt-1 truncate font-serif text-3xl sm:text-4xl">
                      {profile.name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-white/70">
                      {profile.email}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Progresso total
                    </p>
                    <p className="mt-1 font-serif text-3xl">{overallProgress}%</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-[#E9E0E2] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Empresa", profile.company.name, Building2],
                  ["Cargo", profile.position || "Não informado", BriefcaseBusiness],
                  ["Departamento", profile.department || "Não informado", Building2],
                  ["Admissão", formatDate(profile.hireDate), CalendarDays],
                ].map(([label, value, Icon]) => {
                  const InfoIcon = Icon as typeof Building2;
                  return (
                    <div key={String(label)} className="bg-white p-5">
                      <div className="flex items-center gap-2 text-[#8F3651]">
                        <InfoIcon size={16} />
                        <p className="text-[10px] font-bold uppercase tracking-wider">{String(label)}</p>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold">{String(value)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4 border-t border-[#E9E0E2] px-5 py-4 text-xs text-[#776A6E] sm:px-8">
                <span className="flex items-center gap-2"><Mail size={14} className="text-[#8F3651]" /> {profile.email}</span>
                <span className="flex items-center gap-2"><Phone size={14} className="text-[#8F3651]" /> {profile.phone || "Telefone não informado"}</span>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Cursos atribuídos", courseSummaries.length],
                ["Total de aulas", totalLessons],
                ["Aulas concluídas", completedLessons],
                ["Aulas restantes", remainingLessons],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-[22px] border border-[#E9E0E2] bg-white p-4 shadow-[0_8px_28px_rgba(36,26,29,0.03)] sm:p-5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#776A6E] sm:text-[10px]">{label}</p>
                  <p className="mt-3 font-serif text-3xl text-[#641C32] sm:text-4xl">{value}</p>
                </div>
              ))}
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">Aprendizagem</p>
                  <h2 className="mt-1 font-serif text-3xl">Meus cursos</h2>
                </div>
                <Link href="/trilhas" className="text-xs font-bold text-[#641C32] hover:underline">Ver jornadas</Link>
              </div>

              {courseSummaries.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {courseSummaries.map((course) => (
                    <Link key={course.id} href={`/aula/${course.id}`} className="group rounded-[24px] border border-[#E9E0E2] bg-white p-5 shadow-[0_8px_30px_rgba(36,26,29,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(36,26,29,0.08)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${course.status === "Concluído" ? "bg-emerald-50 text-emerald-700" : course.status === "Em andamento" ? "bg-[#F8EDEF] text-[#641C32]" : "bg-[#F5EFEC] text-[#776A6E]"}`}>{course.status}</span>
                          <h3 className="mt-3 truncate text-base font-bold group-hover:text-[#641C32]">{course.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#776A6E]">{course.description || "Curso disponibilizado pela sua empresa."}</p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F5EFEC] text-[#641C32] transition group-hover:bg-[#641C32] group-hover:text-white"><ChevronRight size={18} /></span>
                      </div>
                      <div className="mt-5 flex items-center justify-between text-[10px] font-semibold text-[#776A6E]">
                        <span className="flex items-center gap-1"><BookOpen size={13} /> {course.modules} módulos</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={13} /> {course.completedLessons}/{course.totalLessons}</span>
                        <span className="flex items-center gap-1"><Clock3 size={13} /> {course.remainingLessons} restantes</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E9E0E2]"><div className="h-full rounded-full bg-[#641C32]" style={{ width: `${course.progress}%` }} /></div>
                        <strong className="text-xs text-[#641C32]">{course.progress}%</strong>
                      </div>
                      <p className="mt-3 text-[10px] text-[#9B8D91]">Última atividade: {formatDate(course.lastActivity)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#D9C9CD] bg-white p-10 text-center">
                  <BookOpen size={28} className="mx-auto text-[#8F3651]" />
                  <p className="mt-3 font-semibold">Nenhum curso atribuído.</p>
                  <p className="mt-1 text-sm text-[#776A6E]">Quando o RH liberar uma jornada, ela aparecerá aqui.</p>
                </div>
              )}
            </section>
          </>
        )}

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">Privacidade e acesso</p>
            <h2 className="mt-1 font-serif text-3xl">Conta e segurança</h2>
            <p className="mt-2 text-sm text-[#776A6E]">Gerencie sua foto, dados de acesso, senha e dispositivos conectados.</p>
          </div>
          <div aria-label="Gerenciamento da conta" className="overflow-hidden rounded-[28px]">
            <ClerkUserProfile path="/perfil" routing="path" appearance={lilianClerkAppearance} />
          </div>
        </section>
      </div>
    </main>
  );
}
