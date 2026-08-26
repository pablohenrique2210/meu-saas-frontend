"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "US";
  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)?.[0] : ""}`.toUpperCase();
}

export default function DashboardRH() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<EmployeeInvitation[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
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
          const [companyUsers, companyInvitations] = await Promise.all([
            listUsers(token, signal),
            listEmployeeInvitations(token, signal),
          ]);
          setEmployees(companyUsers);
          setInvitations(companyInvitations);
        } else {
          setEmployees([]);
          setInvitations([]);
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
            <span className="text-[#241A1D] bg-white px-3 py-1.5 rounded-lg border border-[#E9E0E2] shadow-sm">
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
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-[#641C32] text-white flex items-center justify-center text-sm font-semibold shadow-sm hover:bg-[#7D2943] hover:scale-105 transition-all"
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
            <motion.section variants={item} className="mb-12">
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8F3651]">
                  Dados da empresa
                </p>
                <h1 className="mt-2 font-serif text-4xl text-[#241A1D] md:text-5xl">
                  Gestão de pessoas
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#776A6E] sm:text-base">
                  Os indicadores abaixo são calculados exclusivamente a partir
                  dos colaboradores e convites registrados no backend.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Colaboradores cadastrados", employees.length],
                  ["Colaboradores ativos", activeEmployees],
                  ["Aguardando ativação", pendingInvitations.length],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-[24px] border border-[#E9E0E2] bg-white p-6 shadow-[0_8px_30px_rgba(36,26,29,0.03)]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#776A6E]">
                      {label}
                    </p>
                    <p className="mt-3 font-serif text-4xl text-[#641C32]">
                      {isUsersLoading ? "—" : value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ==========================================
                NOVA SECÇÃO: LISTA DE COLABORADORES (TABELA)
                ========================================== */}
            <motion.div variants={item} className="mt-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[22px] font-semibold text-[#241A1D] tracking-tight">
                    Colaboradores
                  </h2>
                  {/* Documentação: Mostra o total de colaboradores que vieram do Backend */}
                  <span className="bg-[#F5EFEC] border border-[#E9E0E2] text-[#641C32] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {employees.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {canManageUsers && (
                    <button
                      type="button"
                      onClick={() => setIsReportGeneratorOpen(true)}
                      className="inline-flex rounded-full border border-[#D8C5CB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#641C32] transition hover:bg-[#F5EFEC]"
                    >
                      Relatórios
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void loadUsers()}
                    disabled={isUsersLoading}
                    className="text-[13px] font-semibold text-[#641C32] hover:text-[#7D2943] transition-colors disabled:cursor-wait disabled:opacity-50"
                  >
                    {isUsersLoading ? "A atualizar..." : "Atualizar"}
                  </button>
                  {canManageUsers && (
                    <button
                      type="button"
                      onClick={() => setIsCreateEmployeeOpen(true)}
                      className="rounded-full bg-[#641C32] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_5px_14px_rgba(100,28,50,0.18)] transition hover:bg-[#7D2943]"
                    >
                      + Novo colaborador
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

              <div className="bg-white border border-[#E9E0E2] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F4] border-b border-[#E9E0E2]">
                        <th className="p-5 text-[11px] font-bold text-[#776A6E] uppercase tracking-widest">
                          Colaborador
                        </th>
                        <th className="p-5 text-[11px] font-bold text-[#776A6E] uppercase tracking-widest">
                          Cargo / Departamento
                        </th>
                        <th className="p-5 text-[11px] font-bold text-[#776A6E] uppercase tracking-widest">
                          Status
                        </th>
                        <th className="p-5 text-[11px] font-bold text-[#776A6E] uppercase tracking-widest">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isUsersLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-[#776A6E] text-sm"
                          >
                            A carregar colaboradores...
                          </td>
                        </tr>
                      ) : usersError ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center">
                            <p className="text-[#A50E0E] text-sm font-semibold mb-3">
                              {usersError}
                            </p>
                            <button
                              type="button"
                              onClick={() => void loadUsers()}
                              className="text-[#641C32] text-[13px] font-semibold hover:underline"
                            >
                              Tentar novamente
                            </button>
                          </td>
                        </tr>
                      ) : !canManageUsers ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-[#776A6E] text-sm"
                          >
                            O seu perfil não possui permissão para gerir
                            colaboradores.
                          </td>
                        </tr>
                      ) : employees.length > 0 ? (
                        employees.map((emp) => (
                          <tr
                            key={emp.id}
                            className="border-b border-[#E9E0E2] last:border-none hover:bg-[#FAF7F4]/50 transition-colors"
                          >
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                {/* Avatar Criativo com as iniciais */}
                                <div className="w-10 h-10 rounded-full bg-[#F5EFEC] border border-[#E9E0E2] text-[#641C32] flex items-center justify-center font-bold text-sm shadow-sm">
                                  {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#241A1D] text-sm">
                                    {emp.name}
                                  </p>
                                  <p className="text-[#776A6E] text-[13px] mt-0.5">
                                    {emp.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <p className="font-medium text-[#241A1D] text-sm">
                                {emp.position || "Não definido"}
                              </p>
                              <p className="text-[#776A6E] text-[13px] mt-0.5">
                                {emp.department || "-"}
                              </p>
                            </td>
                            <td className="p-5">
                              {emp.isActive ? (
                                <span className="inline-flex items-center gap-1.5 bg-[#F8EDEF]/50 border border-[#F1DFE4] text-[#641C32] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#641C32]"></span>{" "}
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-[#FCE8E6]/50 border border-[#FAD2CF] text-[#A50E0E] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#A50E0E]"></span>{" "}
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td className="p-5">
                              <button
                                type="button"
                                onClick={() => void handleViewEmployee(emp)}
                                disabled={openingEmployeeId === emp.id}
                                className="text-[#641C32] text-[13px] font-semibold hover:underline"
                              >
                                {openingEmployeeId === emp.id
                                  ? "A abrir..."
                                  : "Gerir perfil"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-[#776A6E] text-sm"
                          >
                            Ainda não existem colaboradores registados nesta
                            empresa.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
