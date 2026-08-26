import { API_BASE_URL } from "./api-config";

export type UserRole = "USER" | "ADMIN" | "HR_MANAGER";

export interface UserProfile {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  position: string | null;
  department: string | null;
  phone: string | null;
  hireDate: string | null;
  isActive: boolean;
}

export interface CreateUserInput {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  position?: string;
  department?: string;
  phone?: string;
  hireDate?: string;
}

export type EmployeeInviteStatus =
  "PENDING" | "CLAIMED" | "REVOKED" | "EXPIRED";

export interface EmployeeProgram {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
}

export interface EmployeeInvitation {
  id: string;
  name: string;
  email: string;
  cpfMasked: string;
  role: UserRole;
  position: string | null;
  department: string | null;
  phone: string | null;
  hireDate: string | null;
  status: EmployeeInviteStatus;
  expiresAt: string;
  createdAt: string;
  programs: EmployeeProgram[];
}

export interface CreateEmployeeInvitationInput {
  name: string;
  email: string;
  cpf: string;
  role?: UserRole;
  position?: string;
  department?: string;
  phone?: string;
  hireDate?: string;
  courseIds: string[];
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  position?: string;
  department?: string;
  phone?: string;
  hireDate?: string;
  isActive?: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export interface DeleteUserResult {
  id: string;
  deleted: true;
  authenticationAccountDeleted: boolean;
}

export interface RhAccessResult {
  allowed: boolean;
}

export function buildWhatsAppActivationUrl(
  invitation: EmployeeInvitation,
  activationUrl: string,
) {
  const rawPhone = invitation.phone?.replace(/\D/g, "") ?? "";
  const phone =
    rawPhone.length === 10 || rawPhone.length === 11
      ? `55${rawPhone}`
      : rawPhone;
  const programNames = invitation.programs
    .map((program) => program.title)
    .filter(Boolean)
    .join(", ");
  const message = [
    `Olá, ${invitation.name}!`,
    "O RH liberou seu acesso à plataforma Lilian Arruda.",
    programNames
      ? `Programa${invitation.programs.length === 1 ? "" : "s"}: ${programNames}.`
      : null,
    `Ative seu perfil por este link: ${activationUrl}`,
    "Na ativação, confirme o mesmo CPF informado ao RH.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export class UsersApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "UsersApiError";
  }
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return fallback;
  }

  const { message } = payload as { message?: unknown };
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  return fallback;
}

async function fetchWithConnectionRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (!(error instanceof TypeError) || init.signal?.aborted) throw error;

    // O Nest em modo watch fecha a porta por alguns instantes ao recompilar.
    await new Promise((resolve) => setTimeout(resolve, 650));
    return fetch(url, init);
  }
}

async function usersRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithConnectionRetry(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new UsersApiError(
      readErrorMessage(payload, "Não foi possível concluir a solicitação."),
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function getMyProfile(token: string, signal?: AbortSignal) {
  return usersRequest<UserProfile>("/api/users/me", token, { signal });
}

export function getMyRhAccess(token: string, signal?: AbortSignal) {
  return usersRequest<RhAccessResult>("/api/users/me/rh-access", token, {
    signal,
  });
}

export function updateMyProfile(token: string, data: UpdateProfileInput) {
  return usersRequest<UserProfile>("/api/users/me", token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function listUsers(token: string, signal?: AbortSignal) {
  return usersRequest<UserProfile[]>("/api/users", token, { signal });
}

export function createUser(token: string, data: CreateUserInput) {
  return usersRequest<UserProfile>("/api/users", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listEmployeePrograms(token: string, signal?: AbortSignal) {
  return usersRequest<EmployeeProgram[]>("/api/users/programs", token, {
    signal,
  });
}

export function listEmployeeInvitations(token: string, signal?: AbortSignal) {
  return usersRequest<EmployeeInvitation[]>("/api/users/invitations", token, {
    signal,
  });
}

export function createEmployeeInvitation(
  token: string,
  data: CreateEmployeeInvitationInput,
) {
  return usersRequest<EmployeeInvitation>("/api/users/invitations", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function revokeEmployeeInvitation(token: string, id: string) {
  return usersRequest<EmployeeInvitation>(
    `/api/users/invitations/${encodeURIComponent(id)}/revoke`,
    token,
    { method: "POST" },
  );
}

export function getEmployeeInvitationLink(token: string, id: string) {
  return usersRequest<{ url: string }>(
    `/api/users/invitations/${encodeURIComponent(id)}/link`,
    token,
  );
}

export function claimEmployeeInvitation(token: string, cpf: string) {
  return usersRequest<UserProfile>("/api/users/claim", token, {
    method: "POST",
    body: JSON.stringify({ cpf }),
  });
}

export function getUser(token: string, id: string, signal?: AbortSignal) {
  return usersRequest<UserProfile>(
    `/api/users/${encodeURIComponent(id)}`,
    token,
    { signal },
  );
}

export function updateUser(token: string, id: string, data: UpdateUserInput) {
  return usersRequest<UserProfile>(
    `/api/users/${encodeURIComponent(id)}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteUser(token: string, id: string) {
  return usersRequest<DeleteUserResult>(
    `/api/users/${encodeURIComponent(id)}`,
    token,
    { method: "DELETE" },
  );
}
