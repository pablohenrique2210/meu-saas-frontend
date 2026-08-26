import { API_BASE_URL } from "./api-config";

export type ModuleGameType = "DILEMA" | "INSPECAO" | "CORRIDA";

export type GameMetricValue =
  | string
  | number
  | boolean
  | null
  | GameMetricValue[]
  | { [key: string]: GameMetricValue };

export interface GameResultPayload {
  employeeId: string;
  moduleId: string;
  gameType: ModuleGameType;
  finalScore: number;
  timeSpentSeconds: number;
  metrics: Record<string, GameMetricValue>;
}

export interface GameDiagnosticResult extends GameResultPayload {
  id: string;
  completedAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    position: string | null;
  };
  module: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
  };
}

export interface ModuleGameDefinition {
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseTitle: string;
  gameType: ModuleGameType;
  config: Record<string, GameMetricValue>;
  completedResult: {
    finalScore: number;
    timeSpentSeconds: number;
    completedAt: string;
  } | null;
}

export async function submitGameResult(
  token: string,
  payload: GameResultPayload,
) {
  const response = await fetch(`${API_BASE_URL}/api/game-results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(errorPayload?.message)
      ? errorPayload.message.join(", ")
      : errorPayload?.message;
    throw new Error(message || "Não foi possível registrar a avaliação.");
  }

  return (await response.json()) as GameDiagnosticResult;
}

export async function listGameResultsForHR(
  token: string,
  filters: {
    employeeId?: string;
    moduleId?: string;
    gameType?: ModuleGameType;
  } = {},
  signal?: AbortSignal,
) {
  const search = new URLSearchParams();
  if (filters.employeeId) search.set("employeeId", filters.employeeId);
  if (filters.moduleId) search.set("moduleId", filters.moduleId);
  if (filters.gameType) search.set("gameType", filters.gameType);
  const query = search.size > 0 ? `?${search.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/game-results${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os resultados dos minigames.");
  }

  return (await response.json()) as GameDiagnosticResult[];
}

export async function getModuleGame(
  token: string,
  moduleId: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/game-results/modules/${encodeURIComponent(moduleId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message;
    throw new Error(message || "Não foi possível abrir a avaliação.");
  }

  return (await response.json()) as ModuleGameDefinition;
}
