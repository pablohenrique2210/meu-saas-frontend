import { API_BASE_URL } from "./api-config";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ReportCourse {
  id: string;
  title: string;
  description: string | null;
  category: string;
  collaboratorsAssigned: number;
  totalModules: number;
  totalLessons: number;
}

export interface CourseReportPreview {
  generatedAt: string;
  company: { id: string; name: string };
  course: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    author: string | null;
  };
  summary: {
    collaboratorsAssigned: number;
    collaboratorsStarted: number;
    collaboratorsCompleted: number;
    averageProgress: number;
    completionRate: number;
    totalModules: number;
    totalLessons: number;
    totalEstimatedMinutes: number;
    evaluationsConfigured: number;
    evaluationsCompleted: number;
    evaluationParticipationRate: number;
    averageEvaluationScore: number;
  };
  modules: Array<{
    id: string;
    title: string;
    order: number;
    totalLessons: number;
    averageProgress: number;
    completionRate: number;
    evaluation: {
      gameType: "DILEMA" | "INSPECAO" | "CORRIDA";
      completedCount: number;
      participationRate: number;
      averageScore: number;
      averageTimeSpentSeconds: number;
    } | null;
    lessons: Array<{
      id: string;
      title: string;
      startedCount: number;
      completedCount: number;
      completionRate: number;
    }>;
  }>;
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    position: string | null;
    department: string | null;
    isActive: boolean;
    completedLessons: number;
    totalLessons: number;
    overallProgress: number;
    status: ProgressStatus;
    lastActivity: string | null;
    modules: Array<{
      moduleId: string;
      title: string;
      completedLessons: number;
      totalLessons: number;
      progress: number;
      status: ProgressStatus;
      evaluation: {
        gameType: "DILEMA" | "INSPECAO" | "CORRIDA";
        finalScore: number;
        timeSpentSeconds: number;
        completedAt: string;
      } | null;
    }>;
  }>;
  insights: string[];
}

export class ReportsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ReportsApiError";
  }
}

function withCompany(path: string, companyId?: string) {
  return companyId
    ? `${path}?companyId=${encodeURIComponent(companyId)}`
    : path;
}

function errorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return "Não foi possível gerar o diagnóstico.";
  }
  const message = (payload as { message?: unknown }).message;
  return Array.isArray(message)
    ? message.join(", ")
    : typeof message === "string"
      ? message
      : "Não foi possível gerar o diagnóstico.";
}

async function fetchWithConnectionRetry(url: string, init: RequestInit) {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (!(error instanceof TypeError) || init.signal?.aborted) throw error;
    await new Promise((resolve) => setTimeout(resolve, 650));
    return fetch(url, init);
  }
}

async function reportRequest<T>(path: string, token: string, signal?: AbortSignal) {
  const response = await fetchWithConnectionRetry(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new ReportsApiError(errorMessage(payload), response.status);
  }
  return (await response.json()) as T;
}

export function listReportCourses(
  token: string,
  signal?: AbortSignal,
  companyId?: string,
) {
  return reportRequest<ReportCourse[]>(
    withCompany("/api/reports/courses", companyId),
    token,
    signal,
  );
}

export function getCourseReportPreview(
  token: string,
  courseId: string,
  signal?: AbortSignal,
  companyId?: string,
) {
  return reportRequest<CourseReportPreview>(
    withCompany(
      `/api/reports/courses/${encodeURIComponent(courseId)}/preview`,
      companyId,
    ),
    token,
    signal,
  );
}

export async function downloadCourseReport(
  token: string,
  courseId: string,
  companyId?: string,
) {
  const response = await fetchWithConnectionRetry(
    `${API_BASE_URL}${withCompany(`/api/reports/courses/${encodeURIComponent(courseId)}/pdf`, companyId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new ReportsApiError(errorMessage(payload), response.status);
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const matchedName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: await response.blob(),
    filename: matchedName ?? "diagnostico-de-aprendizagem.pdf",
  };
}
