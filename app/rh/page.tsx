"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  BookOpen,
  Building2,
  ChevronRight,
  Clock3,
  FileBarChart,
  GraduationCap,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import ProfileModal from "../ProfileModal";
import BrandLogo from "../BrandLogo";
import EmployeeManagerModal from "./EmployeeManagerModal";
import ReportGeneratorModal from "./ReportGeneratorModal";
import {
  buildWhatsAppActivationUrl,
  getMyProfile,
  getEmployeeInvitationLink,
  getUser,
  listEmployeeInvitations,
  listUsers,
  revokeEmployeeInvitation,
  type EmployeeInvitation,
  type UserProfile,
  UsersApiError,
} from "@/lib/users-api";
import {
  getCourseReportPreview,
  listReportCourses,
  type CourseReportPreview,
} from "@/lib/reports-api";

interface EmployeeLearningSummary {
  courses: Array<{
    id: string;
    title: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  completedLessons: number;
  totalLessons: number;
  remainingLessons: number;
  overallProgress: number;
  lastActivity: string | null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "US";
  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)?.[0] : ""}`.toUpperCase();
}

function formatLastActivity(value: string | null) {
  if (!value) return "Ainda não iniciou";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardRH() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<EmployeeInvitation[]>([]);
  const [courseReports, setCourseReports] = useState<CourseReportPreview[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [learningError, setLearningError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(
    null,
  );
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isReportGeneratorOpen, setIsReportGeneratorOpen] = useState(false);
  const [openingEmployeeId, setOpeningEmployeeId] = useState<string | null>(
    null,
  );
  const [copyingInvitationId, setCopyingInvitationId] = useState<string | null>(
    null,
  );
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(
    null,
  );
  const [sharingInvitationId, setSharingInvitationId] = useState<string | null>(
    null,
  );

  const canManageUsers =
    profile?.role === "ADMIN" || profile?.role === "HR_MANAGER";

  const loadUsers = useCallback(
    async (signal?: AbortSignal) => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setIsUsersLoading(false);
        setUsersError("Inicie sessão para consultar os colaboradores.");
        return;
      }

      setIsUsersLoading(true);
      setUsersError(null);
      setLearningError(null);

      try {
        const token = await getToken({ skipCache: true });
        if (!token)
          throw new Error("A sessão não forneceu um token de acesso.");

        const currentProfile = await getMyProfile(token, signal);
        setProfile(currentProfile);

        if (
          currentProfile.role === "ADMIN" ||
          currentProfile.role === "HR_MANAGER"
        ) {
          const [companyUsers, companyInvitations, reportCourses] = await Promise.all([
            listUsers(token, signal),
            listEmployeeInvitations(token, signal),
            listReportCourses(token, signal),
          ]);
          setEmployees(companyUsers);
          setInvitations(companyInvitations);
          try {
            const reports = await Promise.all(
              reportCourses.map((course) =>
                getCourseReportPreview(token, course.id, signal),
              ),
            );
            setCourseReports(reports);
          } catch (reportError) {
            if (reportError instanceof DOMException && reportError.name === "AbortError") {
              return;
            }
            setCourseReports([]);
            setLearningError(
              "Os colaboradores foram carregados, mas os dados de aprendizagem não puderam ser atualizados.",
            );
          }
        } else {
          setEmployees([]);
          setInvitations([]);
          setCourseReports([]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        setUsersError(
          error instanceof UsersApiError || error instanceof Error
            ? error.message
            : "Não foi possível carregar os colaboradores.",
        );
      } finally {
        if (!signal?.aborted) setIsUsersLoading(false);
      }
    },
    [getToken, isLoaded, isSignedIn],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadUsers(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadUsers]);

  const handleViewEmployee = async (employee: UserProfile) => {
    setOpeningEmployeeId(employee.id);
    setUsersError(null);

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      setSelectedEmployee(await getUser(token, employee.id));
    } catch (error) {
      setUsersError(
        error instanceof UsersApiError || error instanceof Error
          ? error.message
          : "Não foi possível carregar este perfil.",
      );
    } finally {
      setOpeningEmployeeId(null);
    }
  };

  const handleEmployeeSaved = async () => {
    await loadUsers();
    setSelectedEmployee(null);
  };

  const handleRevokeInvitation = async (inviteId: string) => {
    setUsersError(null);
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      await revokeEmployeeInvitation(token, inviteId);
      await loadUsers();
    } catch (error) {
      setUsersError(
        error instanceof UsersApiError || error instanceof Error
          ? error.message
          : "Não foi possível cancelar o convite.",
      );
    }
  };

  const handleCopyInvitationLink = async (inviteId: string) => {
    setCopyingInvitationId(inviteId);
    setUsersError(null);
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      const { url } = await getEmployeeInvitationLink(token, inviteId);
      await navigator.clipboard.writeText(url);
      setCopiedInvitationId(inviteId);
      window.setTimeout(() => setCopiedInvitationId(null), 3000);
    } catch (error) {
      setUsersError(
        error instanceof UsersApiError || error instanceof Error
          ? error.message
          : "Não foi possível copiar o link do convite.",
      );
    } finally {
      setCopyingInvitationId(null);
    }
  };

  const handleShareInvitationWhatsApp = async (
    invitation: EmployeeInvitation,
  ) => {
    const whatsappWindow = window.open("", "_blank");
    setSharingInvitationId(invitation.id);
    setUsersError(null);

    try {
      if (!whatsappWindow) {
        throw new Error(
          "O navegador bloqueou a abertura do WhatsApp. Permita pop-ups e tente novamente.",
        );
      }

      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      const { url } = await getEmployeeInvitationLink(token, invitation.id);
      whatsappWindow.opener = null;
      whatsappWindow.location.href = buildWhatsAppActivationUrl(
        invitation,
        url,
      );
    } catch (error) {
      whatsappWindow?.close();
      setUsersError(
        error instanceof UsersApiError || error instanceof Error
          ? error.message
          : "Não foi possível abrir o WhatsApp.",
      );
    } finally {
      setSharingInvitationId(null);
    }
  };

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "PENDING",
  );

  const displayName = profile?.name || "Utilizador";
  const displayInitials = getInitials(displayName);
  const activeEmployees = employees.filter(
    (employee) => employee.isActive,
  ).length;
  const learningByEmployee = useMemo(() => {
    const summaries = new Map<string, EmployeeLearningSummary>();

    courseReports.forEach((report) => {
      report.collaborators.forEach((collaborator) => {
        const current = summaries.get(collaborator.id) ?? {
          courses: [],
          completedLessons: 0,
          totalLessons: 0,
          remainingLessons: 0,
          overallProgress: 0,
          lastActivity: null,
        };
        current.courses.push({
          id: report.course.id,
          title: report.course.title,
          progress: collaborator.overallProgress,
          completedLessons: collaborator.completedLessons,
          totalLessons: collaborator.totalLessons,
        });
        current.completedLessons += collaborator.completedLessons;
        current.totalLessons += collaborator.totalLessons;
        current.remainingLessons += Math.max(
          0,
          collaborator.totalLessons - collaborator.completedLessons,
        );
        if (
          collaborator.lastActivity &&
          (!current.lastActivity ||
            new Date(collaborator.lastActivity) > new Date(current.lastActivity))
        ) {
          current.lastActivity = collaborator.lastActivity;
        }
        current.overallProgress = current.totalLessons
          ? Math.round((current.completedLessons / current.totalLessons) * 100)
          : 0;
        summaries.set(collaborator.id, current);
      });
    });

    return summaries;
  }, [courseReports]);
  const companyName =
    profile?.company.name ?? courseReports[0]?.company.name ?? "Empresa vinculada";
  const companyCompletedLessons = Array.from(learningByEmployee.values()).reduce(
    (total, summary) => total + summary.completedLessons,
    0,
  );
  const companyTotalLessons = Array.from(learningByEmployee.values()).reduce(
    (total, summary) => total + summary.totalLessons,
    0,
  );
  const companyAverageProgress = companyTotalLessons
    ? Math.round((companyCompletedLessons / companyTotalLessons) * 100)
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex h-screen bg-[#FAF7F4] font-sans text-[#241A1D] antialiased selection:bg-[#641C32] selection:text-white overflow-hidden">
      {/* SIDEBAR CORPORATIVA */}
      <aside className="z-20 hidden w-64 flex-col justify-between border-r border-[#E9E0E2] bg-white shadow-[4px_0_24px_rgb(0,0,0,0.02)] lg:flex">
        <div className="p-6">
          <Link href="/" className="group mb-12 flex items-center">
            <BrandLogo priority className="h-[52px] max-w-[190px]" />
          </Link>

          <nav className="flex flex-col space-y-2">
            <Link
              href="/rh"
              className="bg-[#F5EFEC] text-[#641C32] px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold border border-[#E9E0E2]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              Educação Corporativa
            </Link>
            <Link
              href="/admin/cursos"
              className="px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold text-[#776A6E] transition-colors hover:bg-[#FAF7F4] hover:text-[#641C32]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
              Importar / criar cursos
            </Link>
          </nav>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E9E0E2] bg-[#FAF7F4]/80 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 text-[13px] text-[#776A6E] font-medium">
            <Link href="/" className="mr-1 lg:hidden">
              <BrandLogo compact className="h-9" />
            </Link>
            <span className="hidden sm:inline">Workspace</span>
            <svg
              className="hidden sm:block"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="hidden text-[#241A1D] bg-white px-3 py-1.5 rounded-lg border border-[#E9E0E2] shadow-sm sm:inline-flex">
              Inteligência Estratégica
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/cursos"
              className="inline-flex items-center gap-2 rounded-full border border-[#E9E0E2] bg-white px-3 py-2 text-xs font-bold text-[#641C32] shadow-sm transition-colors hover:bg-[#F5EFEC] sm:px-4 sm:text-sm"
            >
              <span aria-hidden="true">＋</span>
              <span className="hidden sm:inline">Gerenciar cursos</span>
              <span className="sm:hidden">Cursos</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label={`Abrir perfil de ${displayName}`}
              title={displayName}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#641C32] text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-[#7D2943]"
            >
              {displayInitials}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-[1000px] mx-auto"
          >
            <motion.section variants={item} className="mb-10">
              <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E9E0E2] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8F3651] shadow-sm">
                    <Building2 size={14} /> {companyName}
                  </div>
                  <h1 className="font-serif text-4xl text-[#241A1D] md:text-5xl">
                    Gestão de pessoas
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#776A6E] sm:text-base">
                    Pessoas, cursos e evolução da empresa em uma visão operacional para o RH.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#241A1D] px-4 py-3 text-white shadow-lg sm:min-w-48">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                    Progresso geral
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-serif text-3xl">{companyAverageProgress}%</span>
                    <span className="pb-1 text-[11px] text-white/60">
                      {companyCompletedLessons}/{companyTotalLessons} aulas
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-[#D8AEBB] transition-[width]"
                      style={{ width: `${companyAverageProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Colaboradores",
                    value: employees.length,
                    detail: `${activeEmployees} ativos`,
                    icon: Users,
                  },
                  {
                    label: "Cursos registrados",
                    value: courseReports.length,
                    detail: "disponíveis à empresa",
                    icon: BookOpen,
                  },
                  {
                    label: "Aulas concluídas",
                    value: companyCompletedLessons,
                    detail: `${Math.max(0, companyTotalLessons - companyCompletedLessons)} restantes`,
                    icon: GraduationCap,
                  },
                  {
                    label: "Aguardando ativação",
                    value: pendingInvitations.length,
                    detail: "convites pendentes",
                    icon: Clock3,
                  },
                ].map(({ label, value, detail, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-[#E9E0E2] bg-white p-4 shadow-[0_8px_30px_rgba(36,26,29,0.03)] sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#776A6E] sm:text-[10px]">
                        {label}
                      </p>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F5EFEC] text-[#641C32]">
                        <Icon size={16} />
                      </span>
                    </div>
                    <p className="mt-3 font-serif text-3xl text-[#641C32] sm:text-4xl">
                      {isUsersLoading ? "—" : value}
                    </p>
                    <p className="mt-1 text-[10px] text-[#776A6E] sm:text-xs">{detail}</p>
                  </div>
                ))}
              </div>
              {learningError && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                  {learningError}
                </p>
              )}
            </motion.section>

            {/* ==========================================
                NOVA SECÇÃO: LISTA DE COLABORADORES (TABELA)
                ========================================== */}
            <motion.div variants={item} className="mt-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-[22px] font-semibold text-[#241A1D] tracking-tight">
                    Colaboradores
                  </h2>
                  {/* Documentação: Mostra o total de colaboradores que vieram do Backend */}
                  <span className="bg-[#F5EFEC] border border-[#E9E0E2] text-[#641C32] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {employees.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                  {canManageUsers && (
                    <button
                      type="button"
                      onClick={() => setIsReportGeneratorOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C5CB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#641C32] transition hover:bg-[#F5EFEC] sm:rounded-full"
                    >
                      <FileBarChart size={16} /> Relatórios
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void loadUsers()}
                    disabled={isUsersLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9E0E2] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#641C32] transition-colors hover:bg-[#F5EFEC] disabled:cursor-wait disabled:opacity-50 sm:rounded-full sm:border-0 sm:bg-transparent sm:px-2"
                  >
                    <RefreshCw size={15} className={isUsersLoading ? "animate-spin" : ""} />
                    {isUsersLoading ? "Atualizando" : "Atualizar"}
                  </button>
                  {canManageUsers && (
                    <button
                      type="button"
                      onClick={() => setIsCreateEmployeeOpen(true)}
                      className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#641C32] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_5px_14px_rgba(100,28,50,0.18)] transition hover:bg-[#7D2943] sm:col-auto sm:rounded-full"
                    >
                      <UserPlus size={16} /> Novo colaborador
                    </button>
                  )}
                </div>
              </div>

              {pendingInvitations.length > 0 && (
                <div className="mb-5 rounded-[22px] border border-[#E9E0E2] bg-[#FAF7F4] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#241A1D]">
                        Aguardando ativação
                      </p>
                      <p className="mt-1 text-xs text-[#776A6E]">
                        O acesso só é criado após a confirmação do e-mail e CPF.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#641C32]">
                      {pendingInvitations.length} pendente
                      {pendingInvitations.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="rounded-2xl border border-[#E9E0E2] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#241A1D]">
                              {invitation.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#776A6E]">
                              {invitation.email}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#F8EDEF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#641C32]">
                            Convite enviado
                          </span>
                        </div>
                        <div className="mt-3 border-t border-[#F5EFEC] pt-3">
                          <p className="text-xs text-[#776A6E]">
                            {invitation.programs
                              .map((program) => program.title)
                              .join(", ")}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-[#776A6E]">
                              CPF final {invitation.cpfMasked.slice(-4)}
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={sharingInvitationId === invitation.id}
                                onClick={() =>
                                  void handleShareInvitationWhatsApp(invitation)
                                }
                                className="rounded-full bg-[#1F7A4D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#17623D] disabled:cursor-wait disabled:opacity-60"
                              >
                                {sharingInvitationId === invitation.id
                                  ? "Preparando..."
                                  : "Enviar pelo WhatsApp"}
                              </button>
                              <button
                                type="button"
                                disabled={copyingInvitationId === invitation.id}
                                onClick={() =>
                                  void handleCopyInvitationLink(invitation.id)
                                }
                                className="text-xs font-semibold text-[#641C32] hover:underline disabled:cursor-wait disabled:opacity-60"
                              >
                                {copyingInvitationId === invitation.id
                                  ? "A copiar..."
                                  : copiedInvitationId === invitation.id
                                    ? "Link copiado"
                                    : "Copiar link de acesso"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleRevokeInvitation(invitation.id)
                                }
                                className="text-xs font-semibold text-[#A50E0E] hover:underline"
                              >
                                Cancelar convite
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUsersLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {[0, 1].map((itemIndex) => (
                    <div
                      key={itemIndex}
                      className="h-72 animate-pulse rounded-[24px] border border-[#E9E0E2] bg-white"
                    />
                  ))}
                </div>
              ) : usersError ? (
                <div className="rounded-[24px] border border-[#F2CDCD] bg-white p-10 text-center">
                  <p className="mb-3 text-sm font-semibold text-[#A50E0E]">
                    {usersError}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadUsers()}
                    className="text-[13px] font-semibold text-[#641C32] hover:underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : !canManageUsers ? (
                <div className="rounded-[24px] border border-[#E9E0E2] bg-white p-10 text-center text-sm text-[#776A6E]">
                  O seu perfil não possui permissão para gerir colaboradores.
                </div>
              ) : employees.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {employees.map((emp) => {
                    const learning = learningByEmployee.get(emp.id) ?? {
                      courses: [],
                      completedLessons: 0,
                      totalLessons: 0,
                      remainingLessons: 0,
                      overallProgress: 0,
                      lastActivity: null,
                    };

                    return (
                      <article
                        key={emp.id}
                        className="group overflow-hidden rounded-[24px] border border-[#E9E0E2] bg-white shadow-[0_8px_30px_rgba(36,26,29,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(36,26,29,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-4 border-b border-[#F1E8EA] p-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#641C32] font-serif text-lg text-white shadow-md shadow-[#641C32]/15">
                              {getInitials(emp.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#241A1D] sm:text-base">
                                {emp.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#776A6E]">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${emp.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {emp.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-[#FAF7F4] p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A7D81]">Empresa</p>
                              <p className="mt-1 truncate font-semibold text-[#241A1D]">{emp.company.name}</p>
                            </div>
                            <div className="rounded-xl bg-[#FAF7F4] p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A7D81]">Cargo / Área</p>
                              <p className="mt-1 truncate font-semibold text-[#241A1D]">
                                {emp.position || emp.department || "Não informado"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#776A6E]">Jornada de aprendizagem</p>
                                <p className="mt-1 text-xs text-[#776A6E]">
                                  {learning.courses.length
                                    ? `${learning.courses.length} curso${learning.courses.length === 1 ? "" : "s"} atribuído${learning.courses.length === 1 ? "" : "s"}`
                                    : "Nenhum curso atribuído"}
                                </p>
                              </div>
                              <span className="font-serif text-3xl text-[#641C32]">{learning.overallProgress}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9E0E2]">
                              <div
                                className="h-full rounded-full bg-[#641C32] transition-[width]"
                                style={{ width: `${learning.overallProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {learning.courses.map((course) => (
                              <span
                                key={course.id}
                                title={`${course.completedLessons}/${course.totalLessons} aulas concluídas`}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E9E0E2] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#641C32]"
                              >
                                <BookOpen size={12} />
                                <span className="max-w-48 truncate">{course.title}</span>
                                <strong>{course.progress}%</strong>
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 grid grid-cols-3 divide-x divide-[#E9E0E2] rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] py-3 text-center">
                            <div className="px-2">
                              <p className="font-serif text-xl text-[#641C32]">{learning.courses.length}</p>
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#776A6E]">Cursos</p>
                            </div>
                            <div className="px-2">
                              <p className="font-serif text-xl text-[#641C32]">{learning.completedLessons}</p>
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#776A6E]">Concluídas</p>
                            </div>
                            <div className="px-2">
                              <p className="font-serif text-xl text-[#641C32]">{learning.remainingLessons}</p>
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#776A6E]">Restantes</p>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F1E8EA] pt-4">
                            <p className="flex min-w-0 items-center gap-2 text-[11px] text-[#776A6E]">
                              <Activity size={14} className="shrink-0 text-[#8F3651]" />
                              <span className="truncate">Última atividade: {formatLastActivity(learning.lastActivity)}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => void handleViewEmployee(emp)}
                              disabled={openingEmployeeId === emp.id}
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#641C32] transition hover:gap-2 disabled:cursor-wait disabled:opacity-50"
                            >
                              {openingEmployeeId === emp.id ? "Abrindo" : "Gerir perfil"}
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#D9C9CD] bg-white p-10 text-center">
                  <Users size={28} className="mx-auto mb-3 text-[#8F3651]" />
                  <p className="font-semibold text-[#241A1D]">Ainda não existem colaboradores registados nesta empresa.</p>
                  <p className="mt-2 text-sm text-[#776A6E]">Crie um convite para começar a acompanhar a jornada da equipe.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>

        <EmployeeManagerModal
          key={selectedEmployee?.id ?? "employee-editor-closed"}
          isOpen={Boolean(selectedEmployee)}
          employee={selectedEmployee}
          managerRole={profile?.role ?? "USER"}
          managerUserId={profile?.id}
          onClose={() => setSelectedEmployee(null)}
          onSaved={handleEmployeeSaved}
        />

        <EmployeeManagerModal
          key={
            isCreateEmployeeOpen
              ? "employee-create-open"
              : "employee-create-closed"
          }
          isOpen={isCreateEmployeeOpen}
          managerRole={profile?.role ?? "USER"}
          managerUserId={profile?.id}
          onClose={() => setIsCreateEmployeeOpen(false)}
          onSaved={handleEmployeeSaved}
        />

        <ReportGeneratorModal
          isOpen={isReportGeneratorOpen}
          onClose={() => setIsReportGeneratorOpen(false)}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </div>
  );
}
