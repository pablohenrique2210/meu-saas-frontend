"use client";
import BunnyLessonPlayer from "@/components/courses/BunnyLessonPlayer";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  Paperclip,
  LayoutGrid,
  DownloadCloud,
  Lock,
  X,
  MessageCircle,
  Mail,
  Moon,
  Sun,
  ChevronDown,
  RotateCcw,
  RotateCw,
  NotebookPen,
  Menu,
  Save,
} from "lucide-react";
import { API_BASE_URL, apiAssetUrl, apiUrl } from "@/lib/api-config";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { lessonMaterialBlobDownloadUrl, legacyMaterialFilename, legacyMaterialDownloadError } from "@/lib/lesson-material-download";
import { userFacingError } from "@/lib/user-facing-error";
import { getMyProfile, type UserRole } from "@/lib/users-api";

interface Attachment {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number;
  minimumWatchSeconds: number;
  contentUrl: string;
  order: number;
  isPublished: boolean;
  attachments: Attachment[];
}
interface Module {
  id: string;
  title: string;
  order: number;
  availableAt: string | null;
  gameType: "DILEMA" | "INSPECAO" | "CORRIDA" | null;
  gameResults: Array<{ gameType: "DILEMA" | "INSPECAO" | "CORRIDA" }>;
  lessons: Lesson[];
}
interface Course {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  modules: Module[];
}

interface LessonProgressResponse {
  lessonId?: string;
  lastTime: number;
  watchedSeconds: number;
  isCompleted: boolean;
  minimumWatchSeconds: number;
  remainingSeconds: number;
  canComplete: boolean;
  quizRequired: boolean;
  quizCompleted: boolean;
}

interface LessonProgressSummary {
  lessonId: string;
  isCompleted: boolean;
}

// ---------------------------------------------------------------------
// CONTATO DA CONSULTORA (Lilian Arruda) — fonte: lilianarruda.com.br
// ---------------------------------------------------------------------
const CONSULTANT_NAME = "Lilian Arruda";
const CONSULTANT_ROLE = "Consultora de Educação e Saúde Corporativa";
const CONSULTANT_WHATSAPP_NUMBER = "5511943874070";
const CONSULTANT_EMAIL = "contato@lilianarruda.com.br";
const CONSULTANT_WHATSAPP_MESSAGE =
  "Olá, Lilian! Estou com uma dúvida sobre um curso na plataforma.";
const CONSULTANT_WHATSAPP_URL = `https://wa.me/${CONSULTANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  CONSULTANT_WHATSAPP_MESSAGE,
)}`;
const CONSULTANT_EMAIL_URL = `mailto:${CONSULTANT_EMAIL}?subject=${encodeURIComponent(
  "Dúvida sobre um curso na plataforma",
)}`;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function effectiveMinimumWatchSeconds(lesson: Lesson) {
  if (lesson.type !== "VIDEO") return 0;
  const configured = Math.max(0, Number(lesson.minimumWatchSeconds) || 0);
  if (configured > 0) return configured;
  return Math.max(0, (Number(lesson.duration) || 0) * 60);
}

function isModuleAvailable(module: Module, now = Date.now()) {
  if (!module.availableAt) return true;
  return new Date(module.availableAt).getTime() <= now;
}

function formatModuleAvailability(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function responseMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  if (typeof payload?.message === "string") return payload.message;
  if (Array.isArray(payload?.message)) return payload.message.join(", ");
  return fallback;
}

export default function TelaDeAula() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useUser();
  const { getToken } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [viewerRole, setViewerRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [minimumWatchSeconds, setMinimumWatchSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [quizRequired, setQuizRequired] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(true);
  const [isLessonQuizOpen, setIsLessonQuizOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [mediaReloadKey, setMediaReloadKey] = useState(0);
  const [downloadingMaterial, setDownloadingMaterial] = useState<string | null>(
    null,
  );
  const [isNightMode, setIsNightMode] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [lessonNotes, setLessonNotes] = useState("");
  const [notesStatus, setNotesStatus] = useState<
    "idle" | "loading" | "saving" | "saved" | "error"
  >("idle");
  const [playbackRate, setPlaybackRate] = useState(1);

  // 🚀 Modal de contato com a consultora (botão "Dúvidas?")
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // 🚀 NOVO ESTADO: Lista de IDs de aulas que o aluno já terminou
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const bunnyTime = useRef(0);
  const lastSavedTime = useRef(0);
  const isSavingProgress = useRef(false);

  useEffect(() => {
    if (!activeLesson || !user) return;
    const controller = new AbortController();
    const lessonId = activeLesson.id;
    const frame = requestAnimationFrame(() => {
      setLessonNotes("");
      setNotesStatus("loading");
      setIsNotesOpen(false);
      setPlaybackRate(1);
    });
    void (async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token");
        const response = await fetch(
          apiUrl(`/api/courses/lessons/${lessonId}/note`),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Não foi possível carregar a nota.");
        const data = (await response.json()) as { content?: string };
        const localBackup = localStorage.getItem(`lesson-notes:${lessonId}`);
        const content = data.content || localBackup || "";
        setLessonNotes(content);
        setNotesStatus(data.content ? "saved" : "idle");
      } catch {
        if (controller.signal.aborted) return;
        setLessonNotes(localStorage.getItem(`lesson-notes:${lessonId}`) ?? "");
        setNotesStatus("error");
      }
    })();
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, [activeLesson, getToken, user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lesson-color-theme");
    const frame = requestAnimationFrame(() => {
      setIsNightMode(savedTheme === "dark");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleNightMode = () => {
    setIsNightMode((current) => {
      const nextMode = !current;
      localStorage.setItem("lesson-color-theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  const updateLessonNotes = (value: string) => {
    setLessonNotes(value);
    setNotesStatus("idle");
    if (activeLesson) {
      localStorage.setItem(`lesson-notes:${activeLesson.id}`, value);
    }
  };

  const saveLessonNotes = async () => {
    if (!activeLesson || !user || notesStatus === "saving") return;
    setNotesStatus("saving");
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const response = await fetch(
        apiUrl(`/api/courses/lessons/${activeLesson.id}/note`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: lessonNotes }),
        },
      );
      if (!response.ok) throw new Error("Não foi possível salvar a nota.");
      localStorage.removeItem(`lesson-notes:${activeLesson.id}`);
      setNotesStatus("saved");
    } catch {
      localStorage.setItem(`lesson-notes:${activeLesson.id}`, lessonNotes);
      setNotesStatus("error");
    }
  };

  const seekVideo = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const duration = Number.isFinite(video.duration)
      ? video.duration
      : Infinity;
    video.currentTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds),
    );
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const downloadMaterial = async (url: string, title: string) => {
    setDownloadingMaterial(url);
    setProgressError("");
    try {
      const blobDownloadUrl = lessonMaterialBlobDownloadUrl(url);
      if (blobDownloadUrl) {
        const link = document.createElement("a");
        link.href = blobDownloadUrl;
        link.download = "";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // Preserve existing external resources and authenticated legacy material downloads.
      const filename = legacyMaterialFilename(url, API_BASE_URL);
      if (!filename) {
        const external = new URL(url);
        if (!["https:", "http:"].includes(external.protocol)) {
          throw new Error("O endereço deste material é inválido.");
        }
        window.open(external.toString(), "_blank", "noopener,noreferrer");
        return;
      }
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token de acesso.");
      const response = await fetch(
        `${API_BASE_URL}/api/courses/materials/${encodeURIComponent(filename)}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        throw new Error(
          legacyMaterialDownloadError(response.status) ?? await responseMessage(
            response,
            "Não foi possível baixar o material.",
          ),
        );
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const responseName = disposition.match(
        /filename\*?=(?:UTF-8''|\")?([^";]+)/i,
      )?.[1];
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = responseName
        ? decodeURIComponent(responseName.replace(/"/g, ""))
        : title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      setProgressError(
        userFacingError(
          downloadError,
          "Este material estará disponível em instantes.",
        ),
      );
    } finally {
      setDownloadingMaterial(null);
    }
  };

  // 1. CARREGAR O CURSO E O PROGRESSO TOTAL DO ALUNO
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!user) return;
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token");
        const headers = { Authorization: `Bearer ${token}` };
        // Busca o curso e o progresso ao mesmo tempo para ser mais rápido!
        const [courseRes, progRes, profile] = await Promise.all([
          fetch(apiUrl(`/api/courses/${courseId}`), { headers }),
          fetch(apiUrl("/api/courses/user-progress"), { headers }),
          getMyProfile(token),
        ]);

        if (!courseRes.ok) throw new Error("Curso não encontrado");

        const courseData = (await courseRes.json()) as Course;
        setCourse(courseData);
        setViewerRole(profile.role);

        // Guarda as aulas concluídas
        if (progRes.ok) {
          const progData = (await progRes.json()) as LessonProgressSummary[];
          const completedIds = progData
            .filter((progress) => progress.isCompleted)
            .map((progress) => progress.lessonId);
          setCompletedLessonIds(completedIds);
        }

        if (
          courseData.modules?.length > 0 &&
          courseData.modules[0].lessons?.length > 0
        ) {
          const firstAvailableModule = courseData.modules.find(
            (courseModule) =>
              (profile.role === "ADMIN" ||
                profile.role === "HR_MANAGER" ||
                isModuleAvailable(courseModule)) &&
              courseModule.lessons.length > 0,
          );
          if (firstAvailableModule) {
            setActiveModule(firstAvailableModule);
            setActiveLesson(firstAvailableModule.lessons[0]);
            setVideoError("");
          } else {
            setActiveModule(null);
            setActiveLesson(null);
          }
        }
      } catch (courseError) {
        console.warn("Lesson unavailable", courseError);
        setError("unavailable");
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId && user) fetchCourseAndProgress();
  }, [courseId, getToken, user]);

  // 2. BUSCAR O TEMPO EXATO DO VÍDEO ATUAL
  useEffect(() => {
    let cancelled = false;

    const fetchVideoTime = async () => {
      if (!user || !activeLesson) return;

      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token");
        const response = await fetch(
          apiUrl(`/api/courses/progress/${activeLesson.id}`),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) {
          throw new Error(
            await responseMessage(
              response,
              "Não foi possível carregar o progresso desta aula.",
            ),
          );
        }

        const data = (await response.json()) as LessonProgressResponse;
        if (cancelled) return;

        setIsCompleted(data.isCompleted);
        setWatchedSeconds(data.watchedSeconds);
        setMinimumWatchSeconds(data.minimumWatchSeconds);
        setRemainingSeconds(data.remainingSeconds);
        setCanComplete(data.canComplete);
        setQuizRequired(data.quizRequired);
        setQuizCompleted(data.quizCompleted);
        setProgressError("");
        lastSavedTime.current = data.lastTime;

        if (activeLesson.type === "VIDEO" && data.lastTime > 0) {
          const restoreTime = () => {
            if (videoRef.current) videoRef.current.currentTime = data.lastTime;
          };
          if ((videoRef.current?.readyState ?? 0) >= 1) restoreTime();
          else
            videoRef.current?.addEventListener("loadedmetadata", restoreTime, {
              once: true,
            });
        }
      } catch (progressLoadError) {
        if (cancelled) return;
        setProgressError(
          userFacingError(
            progressLoadError,
            "Seu progresso será sincronizado automaticamente.",
          ),
        );
      }
    };

    void fetchVideoTime();
    return () => {
      cancelled = true;
    };
  }, [activeLesson, getToken, user]);

  const saveProgressToCloud = async (
    time: number,
    force = false,
    requestCompletion = false,
  ) => {
    if (!user || !activeLesson || isSavingProgress.current) return false;
    if (!force && Math.abs(time - lastSavedTime.current) < 4) return false;

    isSavingProgress.current = true;
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const response = await fetch(apiUrl("/api/courses/progress"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          lastTime: time,
          ...(requestCompletion ? { isCompleted: true } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (Partial<LessonProgressResponse> & {
            message?: string | string[];
          })
        | null;

      if (!response.ok) {
        if (typeof payload?.remainingSeconds === "number") {
          setRemainingSeconds(payload.remainingSeconds);
        }
        if (typeof payload?.watchedSeconds === "number") {
          setWatchedSeconds(payload.watchedSeconds);
        }
        const message = Array.isArray(payload?.message)
          ? payload.message.join(", ")
          : payload?.message;
        throw new Error(message || "Não foi possível salvar o progresso.");
      }

      const data = payload as LessonProgressResponse;
      lastSavedTime.current = data.lastTime;
      setWatchedSeconds(data.watchedSeconds);
      setMinimumWatchSeconds(data.minimumWatchSeconds);
      setRemainingSeconds(data.remainingSeconds);
      setCanComplete(data.canComplete);
      setQuizRequired(data.quizRequired);
      setQuizCompleted(data.quizCompleted);
      setIsCompleted(data.isCompleted);
      setProgressError("");

      if (data.isCompleted) {
        setCompletedLessonIds((current) =>
          current.includes(activeLesson.id)
            ? current
            : [...current, activeLesson.id],
        );
      }
      return true;
    } catch (progressSaveError) {
      setProgressError(
        userFacingError(
          progressSaveError,
          "Seu progresso será sincronizado automaticamente.",
        ),
      );
      return false;
    } finally {
      isSavingProgress.current = false;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      void saveProgressToCloud(videoRef.current.currentTime);
    }
  };

  // 🚀 AÇÃO DE CONCLUIR AULA E DESTRANCAR A PRÓXIMA
  const handleMarkAsCompleted = async () => {
    if (!user || !activeLesson) return;
    if (quizRequired && !quizCompleted) {
      setIsLessonQuizOpen(true);
      return;
    }
    setIsCompleting(true);
    await saveProgressToCloud(
      videoRef.current ? videoRef.current.currentTime : bunnyTime.current,
      true,
      true,
    );
    setIsCompleting(false);
  };

  const handleLessonQuizCompleted = async () => {
    if (!activeLesson) return;
    setQuizCompleted(true);
    setIsCompleting(true);
    const completed = await saveProgressToCloud(
      videoRef.current ? videoRef.current.currentTime : bunnyTime.current || lastSavedTime.current,
      true,
      true,
    );
    setIsCompleting(false);
    if (completed) setIsLessonQuizOpen(false);
  };

  const handleNextLesson = () => {
    if (!course || !activeModule || !activeLesson || !isCompleted) return;

    const currentModIndex = course.modules.findIndex(
      (m) => m.id === activeModule.id,
    );
    const currentLessIndex = activeModule.lessons.findIndex(
      (l) => l.id === activeLesson.id,
    );

    if (
      currentLessIndex === activeModule.lessons.length - 1 &&
      activeModule.gameType &&
      !activeModule.gameResults.some(
        (result) => result.gameType === activeModule.gameType,
      )
    ) {
      router.push(`/avaliacao?moduleId=${activeModule.id}`);
      return;
    }

    if (currentLessIndex < activeModule.lessons.length - 1) {
      handleLessonChange(
        activeModule,
        activeModule.lessons[currentLessIndex + 1],
      );
    } else if (currentModIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModIndex + 1];
      if (nextModule.lessons.length > 0) {
        handleLessonChange(nextModule, nextModule.lessons[0]);
      }
    } else {
      router.push("/dashboard");
    }
  };

  // === LÓGICA DE BLOQUEIO (CADEADO) ===
  // Cria uma lista linear com todas as aulas do curso para sabermos quem é a "aula anterior"
  const allLessons = course?.modules.flatMap((m) => m.lessons) || [];
  const hasFullModuleAccess =
    viewerRole === "ADMIN" || viewerRole === "HR_MANAGER";

  const isLessonUnlocked = (lessonId: string) => {
    if (hasFullModuleAccess) return true;
    if (!allLessons.length) return true;
    const index = allLessons.findIndex((l) => l.id === lessonId);
    const scheduledModule = course?.modules.find((courseModule) =>
      courseModule.lessons.some((lesson) => lesson.id === lessonId),
    );
    if (scheduledModule && !isModuleAvailable(scheduledModule)) return false;

    // A primeira aula está sempre destrancada!
    if (index === 0) return true;

    // Se a aula imediatamente anterior estiver concluída, esta está destrancada!
    const previousLesson = allLessons[index - 1];
    if (!completedLessonIds.includes(previousLesson.id)) return false;

    const previousModule = course?.modules.find((courseModule) =>
      courseModule.lessons.some((lesson) => lesson.id === previousLesson.id),
    );
    const currentModule = course?.modules.find((courseModule) =>
      courseModule.lessons.some((lesson) => lesson.id === lessonId),
    );
    if (
      previousModule &&
      currentModule &&
      previousModule.id !== currentModule.id &&
      previousModule.gameType
    ) {
      return previousModule.gameResults.some(
        (result) => result.gameType === previousModule.gameType,
      );
    }

    return true;
  };

  const isNativeVideo = (url: string) =>
    Boolean(
      url &&
      (/\/uploads\//i.test(url) ||
        /\.(mp4|webm|ogg|mov|m4v)(?:[?#]|$)/i.test(url)),
    );
  const getEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace(/^www\./, "");
      if (hostname === "youtu.be") {
        return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
      }
      if (hostname.endsWith("youtube.com")) {
        const videoId =
          parsed.searchParams.get("v") ||
          parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (hostname.endsWith("vimeo.com")) {
        const videoId = parsed.pathname.match(/\/(\d+)(?:$|\/)/)?.[1];
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
      }
    } catch {
      return url;
    }
    return url;
  };

  useEffect(() => {
    if (
      !activeLesson?.contentUrl ||
      activeLesson.type !== "VIDEO" ||
      !isNativeVideo(activeLesson.contentUrl)
    ) {
      return;
    }
    const controller = new AbortController();
    const assetUrl = apiAssetUrl(activeLesson.contentUrl);
    void fetch(assetUrl, {
      headers: { Range: "bytes=0-0" },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) {
          setVideoError("Esta aula está temporariamente indisponível.");
          return;
        }
        if (!response.ok && response.status !== 206) {
          setVideoError("Esta aula está temporariamente indisponível.");
          return;
        }
        setVideoError("");
      })
      .catch((mediaError) => {
        if (
          mediaError instanceof DOMException &&
          mediaError.name === "AbortError"
        ) {
          return;
        }
        setVideoError("Esta aula está temporariamente indisponível.");
      });
    return () => controller.abort();
  }, [activeLesson, mediaReloadKey]);

  const handleLessonChange = (mod: Module, less: Lesson) => {
    if (!isLessonUnlocked(less.id)) {
      setProgressError("Conclua a aula anterior antes de avançar.");
      return;
    }
    setActiveModule(mod);
    setActiveLesson(less);
    setVideoError("");
    setMediaReloadKey(0);
    setIsCompleted(completedLessonIds.includes(less.id));
    setWatchedSeconds(0);
    const requiredSeconds = effectiveMinimumWatchSeconds(less);
    setMinimumWatchSeconds(requiredSeconds);
    setRemainingSeconds(requiredSeconds);
    setCanComplete(less.type !== "VIDEO" || requiredSeconds === 0);
    setQuizRequired(false);
    setQuizCompleted(true);
    setIsLessonQuizOpen(false);
    setProgressError("");
    setIsMobileSidebarOpen(false);
    lastSavedTime.current = 0;
    bunnyTime.current = 0;
  };

  const watchProgressPercent =
    minimumWatchSeconds > 0
      ? Math.min(100, (watchedSeconds / minimumWatchSeconds) * 100)
      : 100;
  const isLastLessonOfModule = Boolean(
    activeModule &&
    activeLesson &&
    activeModule.lessons[activeModule.lessons.length - 1]?.id ===
      activeLesson.id,
  );
  const hasPendingModuleGame = Boolean(
    activeModule?.gameType &&
    !activeModule.gameResults.some(
      (result) => result.gameType === activeModule.gameType,
    ),
  );
  const completedCourseLessons = allLessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;
  const courseProgressPercent = allLessons.length
    ? Math.round((completedCourseLessons / allLessons.length) * 100)
    : 0;

  if (isLoading)
    return (
      <div className="h-screen w-screen bg-[#F5EFEC] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#641C32] mb-4" />{" "}
        <p className="text-[#776A6E] font-bold">A carregar a experiência...</p>
      </div>
    );
  if (error || !course)
    return (
      <div className="h-screen w-screen bg-[#F5EFEC] flex flex-col items-center justify-center">
        <PlayCircle size={36} className="mb-4 text-[#8F3651]" />
        <p className="mb-4 font-serif text-2xl text-[#241A1D]">
          Conteúdo temporariamente indisponível
        </p>
        <Link href="/trilhas" className="text-[#641C32] hover:underline">
          Voltar às Trilhas
        </Link>
      </div>
    );

  return (
    <div
      className={`flex h-screen font-sans selection:bg-[#641C32] selection:text-white overflow-hidden transition-colors duration-300 ${isNightMode ? "bg-[#211B26] text-[#F7F1EE]" : "bg-[#FAF7F4] text-[#241A1D]"}`}
    >
      {/* MODAL: FALE COM A CONSULTORA */}
      <AnimatePresence>
        {isSupportOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupportOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md rounded-3xl border p-8 shadow-2xl transition-colors ${isNightMode ? "border-white/10 bg-[#2B2430]" : "border-[#E9E0E2] bg-white"}`}
            >
              <button
                onClick={() => setIsSupportOpen(false)}
                className={`absolute right-4 top-4 rounded-full p-2 transition-colors ${isNightMode ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-[#776A6E] hover:bg-[#F5EFEC] hover:text-[#241A1D]"}`}
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${isNightMode ? "border-white/10 bg-white/10 text-rose-200" : "border-[#E9E0E2] bg-[#F5EFEC] text-[#641C32]"}`}
                >
                  {CONSULTANT_NAME.split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3
                    className={`font-serif text-xl leading-tight ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
                  >
                    {CONSULTANT_NAME}
                  </h3>
                  <p
                    className={`mt-0.5 text-xs ${isNightMode ? "text-white/55" : "text-[#776A6E]"}`}
                  >
                    {CONSULTANT_ROLE}
                  </p>
                </div>
              </div>

              <p
                className={`mb-6 text-sm ${isNightMode ? "text-white/65" : "text-[#776A6E]"}`}
              >
                Ficou com alguma dúvida sobre o curso ou o conteúdo? Fala
                diretamente com a consultora por um dos canais:
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={CONSULTANT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#1F7A4D] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#17623D]"
                >
                  <MessageCircle size={18} /> Falar pelo WhatsApp
                </a>
                <a
                  href={CONSULTANT_EMAIL_URL}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition ${isNightMode ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-[#E9E0E2] bg-[#FAF7F4] text-[#241A1D] hover:bg-[#F5EFEC]"}`}
                >
                  <Mail size={18} /> Enviar e-mail
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVEGAÇÃO MÓVEL DE MÓDULOS E AULAS */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[160] md:hidden">
            <motion.button
              type="button"
              aria-label="Fechar menu de aulas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-[#241A1D]/55 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 330, damping: 34 }}
              className={`relative flex h-full w-[86vw] max-w-[320px] flex-col border-r shadow-2xl transition-colors ${isNightMode ? "border-white/10 bg-[#19151E] text-white" : "border-[#E9E0E2] bg-white text-[#241A1D]"}`}
            >
              <div
                className={`border-b p-5 ${isNightMode ? "border-white/10" : "border-[#F1E8EA]"}`}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <Link
                    href="/trilhas"
                    className={`flex items-center gap-2 text-xs font-bold transition ${isNightMode ? "text-white/60 hover:text-white" : "text-[#776A6E] hover:text-[#641C32]"}`}
                  >
                    <ArrowLeft size={15} /> Voltar às trilhas
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label="Fechar módulos e aulas"
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${isNightMode ? "bg-white/10 text-white" : "bg-[#F5EFEC] text-[#641C32]"}`}
                  >
                    <X size={17} />
                  </button>
                </div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isNightMode ? "text-rose-200" : "text-[#8F3651]"}`}
                >
                  Conteúdo do curso
                </p>
                <h2
                  className={`mt-2 font-serif text-xl leading-tight ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
                >
                  {course.title}
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`h-1.5 flex-1 overflow-hidden rounded-full ${isNightMode ? "bg-white/10" : "bg-[#E9E0E2]"}`}
                  >
                    <div
                      className="h-full rounded-full bg-[#641C32]"
                      style={{ width: `${courseProgressPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${isNightMode ? "text-rose-200" : "text-[#641C32]"}`}
                  >
                    {courseProgressPercent}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-8">
                {course.modules.map((modulo, moduleIndex) => (
                  <section key={modulo.id}>
                    <h3
                      className={`mb-2 px-2 text-[10px] font-bold uppercase tracking-wider ${isNightMode ? "text-white/45" : "text-[#776A6E]"}`}
                    >
                      Módulo {moduleIndex + 1}: {modulo.title}
                    </h3>
                    {!isModuleAvailable(modulo) && modulo.availableAt && (
                      <p className="mb-2 px-2 text-[10px] font-semibold text-[#8F3651]">
                        Liberação em {formatModuleAvailability(modulo.availableAt)}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {modulo.lessons.map((lesson, lessonIndex) => {
                        const isCurrent = activeLesson?.id === lesson.id;
                        const isUnlocked = isLessonUnlocked(lesson.id);
                        const isDone = completedLessonIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() =>
                              isUnlocked && handleLessonChange(modulo, lesson)
                            }
                            disabled={!isUnlocked}
                            className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                              isCurrent
                                ? isNightMode
                                  ? "border-white/15 bg-white/10 shadow-sm"
                                  : "border-[#E2D1D6] bg-[#F5EFEC] shadow-sm"
                                : isUnlocked
                                  ? isNightMode
                                    ? "border-transparent hover:bg-white/5"
                                    : "border-transparent hover:bg-[#FAF7F4]"
                                  : "cursor-not-allowed border-transparent opacity-45"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                                isDone
                                  ? "border-[#8F3651] bg-[#8F3651] text-white"
                                  : isCurrent
                                    ? isNightMode
                                      ? "border-rose-200 bg-[#2B2430] text-rose-200"
                                      : "border-[#641C32] bg-white text-[#641C32]"
                                    : isNightMode
                                      ? "border-white/20 text-white/45"
                                      : "border-[#E9E0E2] text-[#9B8D91]"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 size={12} strokeWidth={3} />
                              ) : !isUnlocked ? (
                                <Lock size={10} />
                              ) : (
                                lessonIndex + 1
                              )}
                            </span>
                            <span className="min-w-0">
                              <strong
                                className={`block truncate text-sm ${isCurrent ? (isNightMode ? "text-white" : "text-[#241A1D]") : isNightMode ? "text-white/65" : "text-[#776A6E]"}`}
                              >
                                {lesson.title}
                              </strong>
                              <span
                                className={`mt-0.5 flex items-center gap-1 text-[11px] ${isNightMode ? "text-white/40" : "text-[#9B8D91]"}`}
                              >
                                {lesson.type === "VIDEO" ? (
                                  <PlayCircle size={11} />
                                ) : (
                                  <FileText size={11} />
                                )}
                                {lesson.duration} min
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      {(hasFullModuleAccess || isModuleAvailable(modulo)) &&
                        modulo.gameType &&
                        modulo.lessons.every((lesson) =>
                          completedLessonIds.includes(lesson.id),
                        ) && (
                          <Link
                            href={`/avaliacao?moduleId=${modulo.id}`}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="mt-2 flex items-center justify-center rounded-2xl bg-[#641C32] px-4 py-3 text-xs font-bold text-white"
                          >
                            {modulo.gameResults.some(
                              (result) => result.gameType === modulo.gameType,
                            )
                              ? "✓ Avaliação concluída"
                              : "Iniciar avaliação do módulo"}
                          </Link>
                        )}
                    </div>
                  </section>
                ))}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR (MÓDULOS E AULAS COM CADEADOS) */}
      <aside
        className={`z-20 hidden flex-col border-r shadow-[4px_0_24px_rgba(0,0,0,0.08)] transition-all duration-500 ease-in-out md:flex ${isNightMode ? "border-white/10 bg-[#19151E] text-white" : "border-[#E9E0E2] bg-white text-[#241A1D]"} ${isSidebarOpen ? "w-72 translate-x-0 opacity-100" : "w-0 -translate-x-full overflow-hidden opacity-0"}`}
      >
        <div className="w-72 h-full flex flex-col">
          <div
            className={`border-b p-6 ${isNightMode ? "border-white/10" : "border-[#F5EFEC]"}`}
          >
            <Link
              href="/trilhas"
              className={`mb-6 flex w-fit items-center gap-2 text-sm font-bold transition-colors ${isNightMode ? "text-white/55 hover:text-white" : "text-[#776A6E] hover:text-[#641C32]"}`}
            >
              <ArrowLeft size={16} /> Voltar às Trilhas
            </Link>
            <h2
              className={`line-clamp-2 font-serif text-xl leading-tight ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
              title={course.title}
            >
              {course.title}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {course.modules.map((modulo, mIndex) => (
              <div key={modulo.id} className="space-y-2">
                <h3
                  className={`px-2 text-xs font-bold uppercase tracking-wider ${isNightMode ? "text-white/45" : "text-[#776A6E]"}`}
                >
                  Módulo {mIndex + 1}: {modulo.title}
                </h3>
                {!isModuleAvailable(modulo) && modulo.availableAt && (
                  <p className="px-2 text-[10px] font-semibold text-[#8F3651]">
                    Liberação em {formatModuleAvailability(modulo.availableAt)}
                  </p>
                )}
                <div className="space-y-1">
                  {modulo.lessons.map((lesson, lIndex) => {
                    const isCurrent = activeLesson?.id === lesson.id;
                    const isUnlocked = isLessonUnlocked(lesson.id);
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() =>
                          isUnlocked && handleLessonChange(modulo, lesson)
                        }
                        disabled={!isUnlocked} // 👈 Impede o clique se estiver trancado
                        className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all duration-300
                          ${
                            isCurrent
                              ? isNightMode
                                ? "border border-white/15 bg-white/10 shadow-sm"
                                : "border border-[#E9E0E2] bg-[#F5EFEC] shadow-sm"
                              : isUnlocked
                                ? isNightMode
                                  ? "cursor-pointer border border-transparent hover:bg-white/5"
                                  : "cursor-pointer border border-transparent hover:bg-[#FAF7F4]"
                                : "cursor-not-allowed border border-transparent opacity-50 grayscale"
                          }`}
                      >
                        <div
                          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2
                          ${
                            isCurrent
                              ? isNightMode
                                ? "border-rose-200 bg-[#2B2430] text-rose-200"
                                : "border-[#641C32] bg-white text-[#641C32]"
                              : isDone
                                ? "border-[#641C32] bg-[#641C32] text-white" // Checkmark de concluído!
                                : isUnlocked
                                  ? isNightMode
                                    ? "border-white/20 bg-transparent text-white/45"
                                    : "border-[#E9E0E2] bg-transparent text-[#E9E0E2]"
                                  : isNightMode
                                    ? "border-white/10 bg-white/5 text-white/30"
                                    : "border-slate-200 bg-slate-100 text-slate-400"
                          }`} // Cinza se trancado
                        >
                          {isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-[#641C32] animate-pulse"></div>
                          ) : isDone ? (
                            <CheckCircle2 size={12} strokeWidth={3} />
                          ) : isUnlocked ? (
                            <span className="text-[10px] font-bold">
                              {lIndex + 1}
                            </span>
                          ) : (
                            <Lock size={10} />
                          )}
                        </div>
                        <div>
                          <h4
                            className={`text-sm leading-snug ${isCurrent ? (isNightMode ? "font-bold text-white" : "font-bold text-[#241A1D]") : isUnlocked ? (isNightMode ? "font-medium text-white/65" : "font-medium text-[#776A6E]") : isNightMode ? "font-medium text-white/30" : "font-medium text-slate-400"}`}
                          >
                            {lesson.title}
                          </h4>
                          <p
                            className={`mt-0.5 flex items-center gap-1 text-xs ${isUnlocked ? (isNightMode ? "text-white/40" : "text-[#776A6E]") : isNightMode ? "text-white/25" : "text-slate-400"}`}
                          >
                            {lesson.type === "VIDEO" ? (
                              <PlayCircle size={10} />
                            ) : (
                              <FileText size={10} />
                            )}{" "}
                            {lesson.duration} min
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {(hasFullModuleAccess || isModuleAvailable(modulo)) &&
                    modulo.gameType &&
                    modulo.lessons.every((lesson) =>
                      completedLessonIds.includes(lesson.id),
                    ) && (
                      <Link
                        href={`/avaliacao?moduleId=${modulo.id}`}
                        className={`mt-2 flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          modulo.gameResults.some(
                            (result) => result.gameType === modulo.gameType,
                          )
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#641C32] bg-[#641C32] text-white"
                        }`}
                      >
                        {modulo.gameResults.some(
                          (result) => result.gameType === modulo.gameType,
                        )
                          ? "✓ Avaliação concluída"
                          : "Iniciar avaliação do módulo"}
                      </Link>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL (IGUAL) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        <header
          className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md transition-colors md:px-8 md:py-4 ${isNightMode ? "border-white/10 bg-[#2B2430]/90" : "border-[#E9E0E2]/60 bg-[#F5EFEC]/90"}`}
        >
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`hidden h-10 w-10 items-center justify-center rounded-full transition-colors md:flex ${isNightMode ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-[#776A6E] hover:bg-[#E9E0E2]"}`}
            >
              <ChevronRight
                size={20}
                className={
                  isSidebarOpen
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Abrir módulos e aulas"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition md:hidden ${isNightMode ? "bg-white/10 text-white" : "bg-white text-[#641C32] shadow-sm"}`}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <span
                className={`inline-flex max-w-[50vw] truncate rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm md:text-xs ${isNightMode ? "border-white/10 bg-white/10 text-white/75" : "border-[#E9E0E2] bg-white text-[#776A6E]"}`}
              >
                {activeModule?.title || "Aula"}
              </span>
              <p
                className={`mt-1 hidden max-w-[55vw] truncate text-xs font-semibold sm:block md:hidden ${isNightMode ? "text-white/60" : "text-[#776A6E]"}`}
              >
                {course.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleNightMode}
              aria-label={
                isNightMode ? "Desativar modo noturno" : "Ativar modo noturno"
              }
              title={
                isNightMode ? "Desativar modo noturno" : "Ativar modo noturno"
              }
              aria-pressed={isNightMode}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${isNightMode ? "border-white/10 bg-white/10 text-amber-200 hover:bg-white/15" : "border-[#E9E0E2] bg-white text-[#641C32] hover:bg-[#F5EFEC]"}`}
            >
              {isNightMode ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <UserButton />
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full px-4 md:px-12 pt-6 md:pt-8 pb-44 md:pb-36">
          {activeLesson ? (
            <>
              <p
                className={`mb-2 text-[11px] font-bold uppercase tracking-[0.16em] md:text-xs ${isNightMode ? "text-white/55" : "text-[#776A6E]"}`}
              >
                {course.title}
              </p>
              <h1
                className={`font-serif text-[2rem] leading-tight md:text-4xl mb-3 tracking-tight ${isNightMode ? "text-[#FFF9F5]" : "text-[#241A1D]"}`}
              >
                {activeLesson.title}
              </h1>
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`h-1.5 flex-1 overflow-hidden rounded-full ${isNightMode ? "bg-white/10" : "bg-[#E9E0E2]"}`}
                >
                  <div
                    className="h-full rounded-full bg-[#7D2943] transition-[width] duration-500"
                    style={{ width: `${courseProgressPercent}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold tabular-nums ${isNightMode ? "text-white/55" : "text-[#776A6E]"}`}
                >
                  {courseProgressPercent}%
                </span>
              </div>

              {activeLesson.type === "VIDEO" ? (
                <div
                  className={`transition-all duration-500 bg-black overflow-hidden flex items-center justify-center ${isFullscreen ? "fixed inset-0 z-50 w-screen h-screen" : "w-full aspect-video rounded-[1.4rem] md:rounded-[2rem] relative shadow-[0_20px_50px_rgba(100,28,50,0.15)] mb-3 group"}`}
                >
                  {activeLesson.contentUrl &&
                  activeLesson.contentUrl.trim() !== "" ? (
                    activeLesson.contentUrl.startsWith("bunny://") ? (
                      <BunnyLessonPlayer key={`${activeLesson.id}:${activeLesson.contentUrl}`} lessonId={activeLesson.id} title={activeLesson.title}
                        onTime={(seconds, force) => {
                          bunnyTime.current = seconds;
                          void saveProgressToCloud(seconds, force);
                        }} />
                    ) : isNativeVideo(activeLesson.contentUrl) ? (
                      <video
                        key={`${activeLesson.id}:${mediaReloadKey}`}
                        ref={videoRef}
                        src={`${apiAssetUrl(activeLesson.contentUrl)}${apiAssetUrl(activeLesson.contentUrl).includes("?") ? "&" : "?"}reload=${mediaReloadKey}`}
                        preload="metadata"
                        controls
                        controlsList="nodownload"
                        onLoadedMetadata={() => {
                          setVideoError("");
                          if (videoRef.current) {
                            videoRef.current.playbackRate = playbackRate;
                          }
                        }}
                        onError={() =>
                          setVideoError("Esta aula está temporariamente indisponível.")
                        }
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => {
                          if (videoRef.current) {
                            void saveProgressToCloud(
                              videoRef.current.currentTime,
                              true,
                            );
                          }
                        }}
                        className="w-full h-full object-contain outline-none bg-black"
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(activeLesson.contentUrl)}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )
                  ) : (
                    <div className="text-white text-center flex flex-col items-center justify-center h-full max-w-md px-6">
                      <PlayCircle
                        size={48}
                        className="mb-4 opacity-50 text-rose-400"
                      />
                      <p className="font-bold text-lg">Vídeo Indisponível</p>
                      <p className="mt-2 text-sm text-white/60">
                        O conteúdo em vídeo ainda não foi publicado nesta aula.
                      </p>
                    </div>
                  )}
                  {videoError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 px-8 text-center text-white">
                      <div className="max-w-md">
                        <PlayCircle
                          size={44}
                          className="mx-auto mb-4 text-rose-300"
                        />
                        <p className="font-bold">
                          Conteúdo temporariamente indisponível
                        </p>
                        <p className="mt-2 text-sm text-white/75">
                          {videoError}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoError("");
                            setMediaReloadKey((current) => current + 1);
                          }}
                          className="mt-5 rounded-full border border-white/25 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                        >
                          Tentar carregar novamente
                        </button>
                      </div>
                    </div>
                  )}
                  {!isNativeVideo(activeLesson.contentUrl || "") && (
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/20 transition-colors z-10"
                    >
                      <LayoutGrid size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`mb-10 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[2rem] border p-10 text-center shadow-sm transition-colors ${isNightMode ? "border-white/10 bg-white/5" : "border-[#E9E0E2] bg-white"}`}
                >
                  <FileText
                    size={48}
                    className={`mb-4 ${isNightMode ? "text-rose-200" : "text-[#641C32]"}`}
                  />
                  <h3
                    className={`mb-2 text-xl font-bold ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
                  >
                    Material de Leitura
                  </h3>
                  {activeLesson.contentUrl &&
                  activeLesson.contentUrl.trim() !== "" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void downloadMaterial(
                            activeLesson.contentUrl,
                            activeLesson.title,
                          )
                        }
                        disabled={
                          downloadingMaterial === activeLesson.contentUrl
                        }
                        className="bg-[#641C32] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-[#7D2943] transition-colors flex items-center gap-2"
                      >
                        <DownloadCloud size={18} />{" "}
                        {downloadingMaterial === activeLesson.contentUrl
                          ? "Baixando..."
                          : "Baixar documento"}
                      </button>
                    </>
                  ) : (
                    <div className="mt-4 max-w-md rounded-xl border border-[#E9E0E2] bg-white p-4">
                      <p className="text-sm text-[#776A6E]">
                        Material complementar em preparação.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeLesson.type === "VIDEO" &&
                isNativeVideo(activeLesson.contentUrl || "") &&
                !videoError && (
                  <div
                    className={`mb-4 flex items-center justify-between rounded-2xl border px-3 py-2.5 ${isNightMode ? "border-white/10 bg-white/5" : "border-[#E9E0E2] bg-white"}`}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => seekVideo(-10)}
                        className={`flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-bold transition ${isNightMode ? "text-white/75 hover:bg-white/10" : "text-[#641C32] hover:bg-[#F5EFEC]"}`}
                        aria-label="Voltar 10 segundos"
                      >
                        <RotateCcw size={17} /> 10s
                      </button>
                      <button
                        type="button"
                        onClick={() => seekVideo(10)}
                        className={`flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-bold transition ${isNightMode ? "text-white/75 hover:bg-white/10" : "text-[#641C32] hover:bg-[#F5EFEC]"}`}
                        aria-label="Avançar 10 segundos"
                      >
                        10s <RotateCw size={17} />
                      </button>
                    </div>
                    <label
                      className={`flex items-center gap-2 text-xs font-bold ${isNightMode ? "text-white/65" : "text-[#776A6E]"}`}
                    >
                      <span className="hidden sm:inline">Velocidade</span>
                      <select
                        value={playbackRate}
                        onChange={(event) =>
                          changePlaybackRate(Number(event.target.value))
                        }
                        className={`rounded-lg border px-2 py-1.5 outline-none ${isNightMode ? "border-white/10 bg-[#2B2430] text-white" : "border-[#E9E0E2] bg-[#FAF7F4] text-[#241A1D]"}`}
                      >
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}x
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

              <section
                className={`mb-8 overflow-hidden rounded-2xl border transition-colors ${isNightMode ? "border-white/10 bg-white/5" : "border-[#E9E0E2] bg-white"}`}
              >
                <button
                  type="button"
                  onClick={() => setIsNotesOpen((current) => !current)}
                  className={`flex w-full items-center justify-between px-4 py-4 text-left text-sm font-bold ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
                  aria-expanded={isNotesOpen}
                >
                  <span className="flex items-center gap-2">
                    <NotebookPen
                      size={18}
                      className={
                        isNightMode ? "text-rose-200" : "text-[#641C32]"
                      }
                    />
                    Notas da aula
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${isNotesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isNotesOpen && (
                  <div className="px-4 pb-4">
                    <textarea
                      value={lessonNotes}
                      onChange={(event) =>
                        updateLessonNotes(event.target.value)
                      }
                      rows={5}
                      placeholder="Registre aqui os principais aprendizados desta aula..."
                      className={`w-full resize-y rounded-xl border p-3 text-sm leading-relaxed outline-none transition focus:border-[#7D2943] ${isNightMode ? "border-white/10 bg-black/15 text-white placeholder:text-white/35" : "border-[#E9E0E2] bg-[#FAF7F4] text-[#241A1D] placeholder:text-[#9B8D91]"}`}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={`text-[11px] ${isNightMode ? "text-white/45" : "text-[#776A6E]"}`}
                      >
                        {notesStatus === "loading"
                          ? "Carregando suas anotações..."
                          : notesStatus === "saving"
                            ? "Salvando na sua conta..."
                            : notesStatus === "saved"
                              ? "Anotações salvas na sua conta."
                              : notesStatus === "error"
                                ? "Falha ao sincronizar. Mantivemos uma cópia neste dispositivo."
                                : "Há alterações ainda não salvas."}
                      </p>
                      <button
                        type="button"
                        onClick={() => void saveLessonNotes()}
                        disabled={
                          notesStatus === "saving" || notesStatus === "loading"
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#641C32] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#7D2943] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {notesStatus === "saving" ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Save size={15} />
                        )}
                        Salvar anotações
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {activeLesson.attachments &&
                activeLesson.attachments.length > 0 && (
                  <div className="mb-12">
                    <h3
                      className={`mb-4 flex items-center gap-2 font-bold ${isNightMode ? "text-white" : "text-[#241A1D]"}`}
                    >
                      <Paperclip
                        size={18}
                        className={
                          isNightMode ? "text-white/55" : "text-[#776A6E]"
                        }
                      />{" "}
                      Materiais Complementares
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeLesson.attachments.map((att) => (
                        <button
                          type="button"
                          key={att.id}
                          onClick={() =>
                            att.url &&
                            void downloadMaterial(
                              att.url,
                              att.title || "material",
                            )
                          }
                          disabled={!att.url || downloadingMaterial === att.url}
                          className={`group flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all ${isNightMode ? "bg-white/5" : "bg-white"} ${!att.url ? "cursor-not-allowed border-rose-200 opacity-60" : isNightMode ? "border-white/10 hover:bg-white/10 hover:shadow-md" : "border-[#E9E0E2] hover:shadow-md"}`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isNightMode ? "bg-white/10 text-rose-200" : "bg-[#F5EFEC] text-[#641C32]"}`}
                          >
                            {att.type === "LINK" ? (
                              <LinkIcon size={18} />
                            ) : (
                              <DownloadCloud size={18} />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4
                              className={`truncate text-sm font-bold transition-colors ${isNightMode ? "text-white group-hover:text-rose-200" : "text-[#241A1D] group-hover:text-[#641C32]"}`}
                            >
                              {att.title || "Material"}
                            </h4>
                            <p
                              className={`mt-0.5 text-xs ${isNightMode ? "text-white/45" : "text-[#776A6E]"}`}
                            >
                              {downloadingMaterial === att.url
                                ? "Baixando..."
                                : att.type === "LINK"
                                  ? "Abrir link"
                                  : "Baixar arquivo"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center py-20">
              <Lock
                size={34}
                className="mx-auto mb-4 text-[#8F3651]"
              />
              <p
                className={`font-medium ${isNightMode ? "text-white/55" : "text-[#776A6E]"}`}
              >
                {!hasFullModuleAccess && course.modules.some(
                  (courseModule) => !isModuleAvailable(courseModule),
                )
                  ? "O próximo módulo será liberado na data programada."
                  : "Selecione uma aula no menu lateral para começar."}
              </p>
            </div>
          )}
        </div>

        {isLessonQuizOpen && activeLesson && (
          <LessonQuiz
            lessonId={activeLesson.id}
            isNightMode={isNightMode}
            onCompleted={handleLessonQuizCompleted}
            onClose={() => setIsLessonQuizOpen(false)}
          />
        )}

        {/* 3. BARRA INFERIOR */}
        <div
          className={`fixed bottom-0 right-0 z-40 flex items-stretch justify-between gap-3 border-t p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 md:items-center md:p-6 md:px-12 ${isNightMode ? "border-white/10 bg-[#2B2430]" : "border-[#E9E0E2] bg-white"} ${isSidebarOpen ? "left-0 md:left-72" : "left-0"}`}
        >
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className={`flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold transition-colors md:rounded-full md:px-6 ${isNightMode ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10" : "border-[#E9E0E2] bg-[#FAF7F4] text-[#776A6E] hover:text-[#241A1D]"}`}
          >
            <MessageCircle size={17} />{" "}
            <span className="hidden min-[355px]:inline">Dúvidas?</span>
          </button>

          {!activeLesson ? (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right text-sm font-semibold text-[#641C32]">
              <Lock size={17} />
              Aguardando a liberação programada
            </div>
          ) : !isCompleted ? (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
              {minimumWatchSeconds > 0 && (
                <div className="hidden w-52 sm:block">
                  <div
                    className={`mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide ${isNightMode ? "text-white/55" : "text-[#776A6E]"}`}
                  >
                    <span>Tempo obrigatório</span>
                    <span>
                      {canComplete
                        ? "Cumprido"
                        : `Faltam ${formatTime(remainingSeconds)}`}
                    </span>
                  </div>
                  <div
                    className={`h-2 overflow-hidden rounded-full ${isNightMode ? "bg-white/10" : "bg-[#E9E0E2]"}`}
                  >
                    <div
                      className="h-full rounded-full bg-[#641C32] transition-[width] duration-500"
                      style={{ width: `${watchProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1 text-right md:flex-none">
                {progressError && (
                  <p className="mb-1 max-w-xs text-xs text-[#776A6E]">
                    {progressError}
                  </p>
                )}
                <button
                  onClick={handleMarkAsCompleted}
                  disabled={isCompleting || !canComplete}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#641C32] px-4 py-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-[#641C32]/20 transition-all hover:bg-[#7D2943] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:rounded-full md:px-8 md:text-base"
                >
                  {isCompleting
                    ? "A concluir..."
                    : canComplete
                      ? quizRequired && !quizCompleted
                        ? "Responder quiz da aula"
                        : "Marcar como Concluída"
                      : `Assista mais ${formatTime(remainingSeconds)}`}{" "}
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-4 animate-in slide-in-from-right-4 fade-in duration-500">
              <div
                className={`hidden items-center gap-2 rounded-full border px-4 py-2 font-bold sm:flex ${isNightMode ? "border-white/10 bg-white/10 text-rose-200" : "border-[#E9E0E2] bg-[#F5EFEC] text-[#7D2943]"}`}
              >
                <span>✓</span> Progresso salvo
              </div>
              <button
                onClick={handleNextLesson}
                className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all md:w-auto md:rounded-full md:px-8 md:text-base ${isNightMode ? "bg-[#8F3651] hover:bg-[#A84663]" : "bg-[#241A1D] hover:bg-black"}`}
              >
                {isLastLessonOfModule && hasPendingModuleGame
                  ? "Iniciar Avaliação"
                  : "Próxima Aula"}{" "}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
