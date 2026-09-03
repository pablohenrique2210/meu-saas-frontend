"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  createEmployeeInvitation,
  deleteUser,
  listEmployeePrograms,
  updateUser,
  type EmployeeProgram,
  type ManagedCompany,
  type UserProfile,
  type UserRole,
} from "@/lib/users-api";
import { userFacingError } from "@/lib/user-facing-error";

interface EmployeeManagerModalProps {
  isOpen: boolean;
  employee?: UserProfile | null;
  managerRole: UserRole;
  managerUserId?: string;
  companyId?: string;
  companies: ManagedCompany[];
  onClose: () => void;
  onSaved: (companyId?: string) => void | Promise<void>;
}

interface EmployeeFormState {
  companyId: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  position: string;
  department: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  courseIds: string[];
}

function createInitialState(
  employee?: UserProfile | null,
  companyId?: string,
): EmployeeFormState {
  return {
    companyId: employee?.companyId ?? companyId ?? "",
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    cpf: "",
    role: employee?.role ?? "USER",
    position: employee?.position ?? "",
    department: employee?.department ?? "",
    phone: employee?.phone ?? "",
    hireDate: employee?.hireDate?.slice(0, 10) ?? "",
    isActive: employee?.isActive ?? true,
    courseIds:
      employee?.courseAccesses?.map((access) => access.course.id) ?? [],
  };
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function EmployeeManagerModal({
  isOpen,
  employee,
  managerRole,
  managerUserId,
  companyId,
  companies,
  onClose,
  onSaved,
}: EmployeeManagerModalProps) {
  const { getToken } = useAuth();
  const [form, setForm] = useState(() =>
    createInitialState(employee, companyId),
  );
  const [programs, setPrograms] = useState<EmployeeProgram[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(employee);
  const canAssignRoles = managerRole === "ADMIN";
  const canDelete =
    isEditing &&
    employee?.id !== managerUserId &&
    (managerRole === "ADMIN" || employee?.role === "USER");

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const loadPrograms = async () => {
      setIsLoadingPrograms(true);
      setError(null);
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sessão não forneceu um token de acesso.");
        const availablePrograms = await listEmployeePrograms(
          token,
          controller.signal,
        );
        setPrograms(availablePrograms);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError")
          return;
        setError(userFacingError(loadError, "Os programas estão temporariamente indisponíveis."));
      } finally {
        if (!controller.signal.aborted) setIsLoadingPrograms(false);
      }
    };

    void loadPrograms();
    return () => controller.abort();
  }, [getToken, isOpen]);

  const setField = <Key extends keyof EmployeeFormState>(
    key: Key,
    value: EmployeeFormState[Key],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const toggleProgram = (courseId: string) => {
    setForm((current) => ({
      ...current,
      courseIds: current.courseIds.includes(courseId)
        ? current.courseIds.filter((id) => id !== courseId)
        : [...current.courseIds, courseId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");

      if (isEditing) {
        await updateUser(token, employee!.id, {
          name: form.name.trim(),
          position: form.position.trim(),
          department: form.department.trim(),
          phone: form.phone.trim(),
          ...(form.hireDate ? { hireDate: form.hireDate } : {}),
          isActive: form.isActive,
          ...(form.role === "USER" ? { courseIds: form.courseIds } : {}),
          ...(canAssignRoles ? { role: form.role } : {}),
        });
      } else {
        await createEmployeeInvitation(token, {
          companyId: form.companyId,
          name: form.name.trim(),
          email: form.email.trim(),
          cpf: form.cpf,
          position: form.position.trim() || undefined,
          department: form.department.trim() || undefined,
          phone: form.phone.trim() || undefined,
          hireDate: form.hireDate || undefined,
          courseIds: form.courseIds,
          ...(canAssignRoles ? { role: form.role } : {}),
        });
      }

      await onSaved(isEditing ? employee?.companyId : form.companyId);
      onClose();
    } catch (submissionError) {
      setError(userFacingError(submissionError, "Não foi possível guardar o colaborador agora."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employee || !canDelete || deleteConfirmation.trim() !== "EXCLUIR") {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");

      await deleteUser(token, employee.id);
      await onSaved();
      onClose();
    } catch (deletionError) {
      setError(userFacingError(deletionError, "Não foi possível excluir o perfil agora."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Fechar gestão do colaborador"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#241A1D]/45 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#E9E0E2] bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E9E0E2] bg-[#FAF7F4] p-7">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">
                  Gestão de pessoas
                </p>
                <h2 className="font-serif text-3xl text-[#241A1D]">
                  {isEditing ? "Editar colaborador" : "Convidar colaborador"}
                </h2>
                <p className="mt-2 text-sm text-[#776A6E]">
                  {isEditing
                    ? "Atualize os dados corporativos e o acesso deste perfil."
                    : "Pré-autorize o vínculo e envie o acesso ao programa por e-mail."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#776A6E] transition-colors hover:bg-white hover:text-[#241A1D]"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 p-7 sm:grid-cols-2"
            >
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  Nome completo
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32] focus:ring-2 focus:ring-[#641C32]/10"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  E-mail corporativo
                </span>
                <input
                  type="email"
                  required
                  disabled={isEditing}
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32] disabled:bg-[#FAF7F4] disabled:text-[#776A6E]"
                />
              </label>

              {!isEditing && (
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                    Empresa
                  </span>
                  <select
                    required
                    value={form.companyId}
                    onChange={(event) =>
                      setField("companyId", event.target.value)
                    }
                    className="w-full rounded-xl border border-[#E9E0E2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                  >
                    <option value="" disabled>
                      Selecione a empresa do colaborador
                    </option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <span className="mt-2 block text-xs leading-relaxed text-[#776A6E]">
                    O perfil, os relatórios e os convites ficarão vinculados a
                    esta empresa.
                  </span>
                </label>
              )}

              {!isEditing && (
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                    CPF para validação do vínculo
                  </span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    maxLength={14}
                    value={form.cpf}
                    onChange={(event) =>
                      setField("cpf", formatCpf(event.target.value))
                    }
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32] focus:ring-2 focus:ring-[#641C32]/10"
                  />
                  <span className="mt-2 block text-xs leading-relaxed text-[#776A6E]">
                    Usado uma única vez para confirmar o convite. O número não é
                    guardado em formato legível.
                  </span>
                </label>
              )}

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  Cargo
                </span>
                <input
                  value={form.position}
                  onChange={(event) => setField("position", event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  Departamento
                </span>
                <input
                  value={form.department}
                  onChange={(event) =>
                    setField("department", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  Telefone
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                  Data de admissão
                </span>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(event) => setField("hireDate", event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                />
              </label>

              {canAssignRoles && (
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                    Papel de acesso
                  </span>
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setField("role", event.target.value as UserRole)
                    }
                    className="w-full rounded-xl border border-[#E9E0E2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#641C32]"
                  >
                    <option value="USER">Colaborador</option>
                    <option value="HR_MANAGER">Gestor de RH</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </label>
              )}

              {form.role === "USER" && (
                <fieldset className="sm:col-span-2">
                  <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-[#776A6E]">
                    Cursos visíveis para este colaborador
                  </legend>
                  <div className="space-y-3">
                    {isLoadingPrograms ? (
                      <div className="rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] p-4 text-sm text-[#776A6E]">
                        A carregar programas...
                      </div>
                    ) : programs.length > 0 ? (
                      programs.map((program) => {
                        const selected = form.courseIds.includes(program.id);
                        return (
                          <label
                            key={program.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                              selected
                                ? "border-[#641C32] bg-[#F8EDEF]"
                                : "border-[#E9E0E2] bg-white hover:bg-[#FAF7F4]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleProgram(program.id)}
                              className="mt-0.5 h-5 w-5 accent-[#641C32]"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-[#241A1D]">
                                {program.title}
                              </span>
                              <span className="mt-1 block text-xs text-[#776A6E]">
                                {program.description ||
                                  "Jornada de desenvolvimento corporativo."}
                              </span>
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-[#FAD2CF] bg-[#FCE8E6]/50 p-4 text-sm text-[#A50E0E]">
                        Nenhum programa foi encontrado. Cadastre o curso antes de
                        liberar o acesso.
                      </div>
                    )}
                  </div>
                </fieldset>
              )}

              {isEditing && (
                <label className="flex items-center justify-between rounded-xl border border-[#E9E0E2] bg-[#FAF7F4] px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-[#241A1D]">
                      Acesso ativo
                    </span>
                    <span className="text-xs text-[#776A6E]">
                      Permitir entrada na plataforma
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setField("isActive", event.target.checked)
                    }
                    className="h-5 w-5 accent-[#641C32]"
                  />
                </label>
              )}

              {canDelete && isConfirmingDelete && (
                <section className="rounded-2xl border border-[#E7A9A4] bg-[#FFF6F5] p-5 sm:col-span-2">
                  <h3 className="text-base font-bold text-[#8F1D18]">
                    Excluir este perfil definitivamente?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#776A6E]">
                    Esta ação remove o perfil corporativo, os acessos aos
                    cursos e todo o progresso de {employee?.name}. Ela não pode
                    ser desfeita.
                  </p>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8F1D18]">
                      Digite EXCLUIR para confirmar
                    </span>
                    <input
                      autoComplete="off"
                      value={deleteConfirmation}
                      onChange={(event) =>
                        setDeleteConfirmation(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#E7A9A4] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setDeleteConfirmation("");
                      }}
                      className="rounded-full border border-[#E9E0E2] px-5 py-2.5 text-sm font-semibold text-[#776A6E] hover:bg-white disabled:opacity-60"
                    >
                      Manter perfil
                    </button>
                    <button
                      type="button"
                      disabled={
                        isDeleting || deleteConfirmation.trim() !== "EXCLUIR"
                      }
                      onClick={() => void handleDelete()}
                      className="rounded-full bg-[#B3261E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F1D18] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
                    </button>
                  </div>
                </section>
              )}

              {error && (
                <div className="rounded-xl border border-[#FAD2CF] bg-[#FCE8E6]/50 px-4 py-3 text-sm font-semibold text-[#A50E0E] sm:col-span-2">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-[#E9E0E2] pt-5 sm:col-span-2">
                {canDelete && !isConfirmingDelete && (
                  <button
                    type="button"
                    disabled={isSaving || isDeleting}
                    onClick={() => {
                      setError(null);
                      setIsConfirmingDelete(true);
                    }}
                    className="mr-auto rounded-full border border-[#E7A9A4] px-6 py-3 text-sm font-semibold text-[#B3261E] transition hover:bg-[#FFF6F5] disabled:opacity-60"
                  >
                    Excluir perfil
                  </button>
                )}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onClose}
                  className="rounded-full border border-[#E9E0E2] px-6 py-3 text-sm font-semibold text-[#776A6E] hover:bg-[#FAF7F4] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    isDeleting ||
                    isConfirmingDelete ||
                    (form.role === "USER" &&
                      (isLoadingPrograms || form.courseIds.length === 0))
                  }
                  className="rounded-full bg-[#641C32] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(100,28,50,0.2)] transition hover:bg-[#7D2943] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSaving
                    ? "A guardar..."
                    : isEditing
                      ? "Guardar alterações"
                      : "Enviar convite"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
