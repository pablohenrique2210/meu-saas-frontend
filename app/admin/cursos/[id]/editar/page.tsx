"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiAssetUrl, apiUrl } from "@/lib/api-config";
import { inspectVideoFile } from "@/lib/video-file";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  FileUp,
  Zap,
  BarChart3,
  Loader2,
  GripVertical,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  Paperclip,
  AlertCircle,
  Video,
} from "lucide-react";

interface Attachment {
  id: string;
  title: string;
  type: string;
  url: string;
}
interface UploadedMaterial {
  url: string;
  originalName: string;
  mimeType: string;
  materialType: string;
}

interface UploadChunkResponse extends Partial<UploadedMaterial> {
  complete: boolean;
}

interface UploadSessionResponse {
  uploadId: string;
  uploadToken: string;
  expiresInSeconds: number;
}

async function apiErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
    code?: string;
  } | null;
  const message = Array.isArray(payload?.message)
    ? payload.message.join(", ")
    : payload?.message;
  return `${message || fallback} (HTTP ${response.status})`;
}
interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number;
  minimumWatchSeconds: number;
  videoMode: string;
  contentUrl: string;
  published: boolean;
  quizConfigText: string;
  attachments: Attachment[];
}
interface Module {
  id: string;
  title: string;
  gameType: "" | "DILEMA" | "INSPECAO" | "CORRIDA";
  gameConfigText: string;
  lessons: Lesson[];
}

interface CourseApiResponse {
  title: string;
  description?: string | null;
  category: string;
  author?: string | null;
  coverUrl?: string | null;
  isPublished: boolean;
  modules?: Array<{
    id: string;
    title: string;
    gameType?: Module["gameType"] | null;
    gameConfig?: unknown;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      minimumWatchSeconds?: number | null;
      contentUrl?: string | null;
      isPublished?: boolean;
      quizConfig?: unknown;
      attachments?: Attachment[];
    }>;
  }>;
}

const steps = [
  { id: "info", name: "Informações", icon: FileText },
  { id: "capa", name: "Capa e Visual", icon: ImageIcon },
  { id: "conteudo", name: "Módulos e Aulas", icon: LayoutGrid },
];
const categories = [
  { value: "STRESS_BURNOUT", label: "Gestão do Estresse e Burnout" },
  {
    value: "MENTAL_HEALTH_CLIMATE",
    label: "Saúde Mental e Clima Organizacional",
  },
  { value: "POSITIVE_PSYCHOLOGY", label: "Psicologia Positiva no Trabalho" },
];
const materialTypes = [
  ["FILE", "📄 Outro arquivo"],
  ["PDF", "📕 PDF"],
  ["WORD", "🟦 Word"],
  ["IMAGE", "🖼️ Imagem"],
  ["SPREADSHEET", "📊 Planilha"],
  ["PRESENTATION", "📽️ Apresentação"],
  ["ARCHIVE", "📦 Compactado"],
  ["LINK", "🌐 Link"],
];
const materialAccept = (type: string) =>
  ({
    PDF: ".pdf",
    WORD: ".doc,.docx",
    IMAGE: "image/*",
    SPREADSHEET: ".xls,.xlsx,.csv",
    PRESENTATION: ".ppt,.pptx",
    ARCHIVE: ".zip,.rar,.7z",
  })[type] ||
  ".pdf,.doc,.docx,image/*,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z,.txt";

interface CourseEditorProps {
  courseId?: string | null;
  embedded?: boolean;
  onClose?: () => void;
  onSaved?: () => void | Promise<void>;
}

export function CourseEditor({
  courseId: courseIdProp,
  embedded = false,
  onClose,
  onSaved,
}: CourseEditorProps) {
  const { getToken } = useAuth();
  const params = useParams();
  const courseId =
    courseIdProp === undefined ? (params.id as string) : courseIdProp;
  const isCreating = !courseId;

  const [currentStep, setCurrentStep] = useState("info");
  const [savingStatus, setSavingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(Boolean(courseId));
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const showToast = (message: string, type: "error" | "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "STRESS_BURNOUT",
    author: "",
    coverUrl: "",
    isPublished: false,
  });
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token");
        const res = await fetch(apiUrl(`/api/courses/${courseId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Curso não encontrado");
        const data = (await res.json()) as CourseApiResponse;

        setFormData({
          title: data.title,
          description: data.description || "",
          category: data.category,
          author: data.author || "",
          coverUrl: data.coverUrl || "",
          isPublished: data.isPublished,
        });

        if (data.modules) {
          const loadedModules: Module[] = data.modules.map((m) => ({
            id: m.id,
            title: m.title,
            gameType: m.gameType || "",
            gameConfigText: m.gameConfig
              ? JSON.stringify(m.gameConfig, null, 2)
              : "",
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              minimumWatchSeconds: l.minimumWatchSeconds ?? l.duration * 60,
              videoMode:
                l.contentUrl?.includes("http") &&
                !l.contentUrl?.includes("uploads")
                  ? "LINK"
                  : "UPLOAD",
              contentUrl: l.contentUrl || "",
              published: l.isPublished ?? true,
              quizConfigText: l.quizConfig
                ? JSON.stringify(l.quizConfig, null, 2)
                : "",
              attachments: l.attachments
                ? l.attachments.map((a) => ({
                    id: a.id,
                    title: a.title,
                    type: a.type,
                    url: a.url,
                  }))
                : [],
            })),
          }));
          setModules(loadedModules);
        }
      } catch {
        showToast("Erro ao carregar o curso.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, getToken]);

  // 🚀 O SEGREDO DOS IDs TEMPORÁRIOS: O Backend sabe que se começar com 'temp_', é para CRIAR do zero!
  const addModule = () =>
    setModules([
      ...modules,
      {
        id: `temp_mod_${Date.now()}`,
        title: "",
        gameType: "",
        gameConfigText: "",
        lessons: [],
      },
    ]);
  const removeModule = (modId: string) =>
    setModules(modules.filter((m) => m.id !== modId));
  const updateModuleTitle = (modId: string, title: string) =>
    setModules(modules.map((m) => (m.id === modId ? { ...m, title } : m)));
  const updateModuleGame = (
    modId: string,
    field: "gameType" | "gameConfigText",
    value: string,
  ) =>
    setModules(
      modules.map((m) => (m.id === modId ? { ...m, [field]: value } : m)),
    );

  const addLesson = (modId: string) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `temp_les_${Date.now()}`,
                  title: "",
                  type: "VIDEO",
                  videoMode: "UPLOAD",
                  duration: 0,
                  minimumWatchSeconds: 0,
                  contentUrl: "",
                  published: true,
                  quizConfigText: "",
                  attachments: [],
                },
              ],
            }
          : m,
      ),
    );
  const removeLesson = (modId: string, lessonId: string) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m,
      ),
    );
  const updateLesson = <Field extends keyof Lesson>(
    modId: string,
    lessonId: string,
    field: Field,
    value: Lesson[Field],
  ) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l,
              ),
            }
          : m,
      ),
    );

  const addAttachment = (modId: string, lessonId: string) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      attachments: [
                        ...l.attachments,
                        {
                          id: `temp_att_${Date.now()}`,
                          title: "",
                          type: "FILE",
                          url: "",
                        },
                      ],
                    }
                  : l,
              ),
            }
          : m,
      ),
    );
  const updateAttachment = <Field extends keyof Attachment>(
    modId: string,
    lessonId: string,
    attId: string,
    field: Field,
    value: Attachment[Field],
  ) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      attachments: l.attachments.map((a) =>
                        a.id === attId ? { ...a, [field]: value } : a,
                      ),
                    }
                  : l,
              ),
            }
          : m,
      ),
    );
  const applyAttachmentUpload = (
    modId: string,
    lessonId: string,
    attId: string,
    upload: UploadedMaterial,
  ) =>
    setModules((current) =>
      current.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      attachments: l.attachments.map((a) =>
                        a.id === attId
                          ? {
                              ...a,
                              url: upload.url,
                              type: upload.materialType,
                              title:
                                a.title.trim() ||
                                upload.originalName.replace(/\.[^.]+$/, ""),
                            }
                          : a,
                      ),
                    }
                  : l,
              ),
            }
          : m,
      ),
    );
  const removeAttachment = (modId: string, lessonId: string, attId: string) =>
    setModules(
      modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      attachments: l.attachments.filter((a) => a.id !== attId),
                    }
                  : l,
              ),
            }
          : m,
      ),
    );

  const handleFileUpload = async (
    file: File | undefined,
  ): Promise<UploadedMaterial | null> => {
    if (!file) return null;
    setIsUploadingFiles(true);
    setUploadProgress(0);
    showToast(`A carregar ${file.name}...`, "success");
    try {
      const chunkSize = 2 * 1024 * 1024;

      const freshToken = async () => {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sua sessão expirou. Entre novamente.");
        return token;
      };

      let data: UploadedMaterial;
      if (file.size <= chunkSize) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch(apiUrl("/api/courses/upload"), {
          method: "POST",
          headers: { Authorization: `Bearer ${await freshToken()}` },
          body: form,
        });
        if (!response.ok) {
          throw new Error(
            await apiErrorMessage(response, "Erro ao enviar o arquivo"),
          );
        }
        data = (await response.json()) as UploadedMaterial;
        setUploadProgress(100);
      } else {
        const sessionResponse = await fetch(
          apiUrl("/api/courses/upload/session"),
          {
            method: "POST",
            headers: { Authorization: `Bearer ${await freshToken()}` },
          },
        );
        if (!sessionResponse.ok) {
          throw new Error(
            await apiErrorMessage(
              sessionResponse,
              "Não foi possível iniciar o upload",
            ),
          );
        }
        const { uploadId, uploadToken } =
          (await sessionResponse.json()) as UploadSessionResponse;
        if (!uploadId || !uploadToken) {
          throw new Error("O servidor não criou uma sessão de upload válida.");
        }
        const totalChunks = Math.ceil(file.size / chunkSize);
        let completedUpload: UploadChunkResponse | null = null;

        for (let index = 0; index < totalChunks; index += 1) {
          const start = index * chunkSize;
          const chunk = file.slice(
            start,
            Math.min(start + chunkSize, file.size),
          );
          let response: Response | null = null;
          for (let attempt = 1; attempt <= 3; attempt += 1) {
            const form = new FormData();
            form.append("file", chunk, file.name);
            form.append("uploadId", uploadId);
            form.append("chunkIndex", String(index));
            form.append("totalChunks", String(totalChunks));
            form.append("originalName", file.name);
            form.append("mimeType", file.type || "application/octet-stream");

            response = await fetch(apiUrl("/api/courses/upload/chunk"), {
              method: "POST",
              headers: { "X-Upload-Token": uploadToken },
              body: form,
            }).catch(() => null);
            if (response?.ok) break;
            if (attempt < 3) {
              await new Promise((resolve) =>
                setTimeout(resolve, attempt * 700),
              );
            }
          }

          if (!response) throw new Error("O servidor interrompeu o upload.");
          if (!response.ok) {
            throw new Error(
              await apiErrorMessage(
                response,
                "Erro ao enviar parte do arquivo",
              ),
            );
          }
          completedUpload = (await response.json()) as UploadChunkResponse;
          setUploadProgress(Math.round(((index + 1) / totalChunks) * 100));
        }

        if (
          !completedUpload?.complete ||
          !completedUpload.url ||
          !completedUpload.originalName ||
          !completedUpload.mimeType ||
          !completedUpload.materialType
        ) {
          throw new Error("O servidor não concluiu a montagem do arquivo.");
        }
        data = completedUpload as UploadedMaterial;
      }

      showToast(`Upload concluído!`, "success");
      return data;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Falha no upload.",
        "error",
      );
      return null;
    } finally {
      setIsUploadingFiles(false);
      setUploadProgress(null);
    }
  };

  const handleVideoUpload = async (
    modId: string,
    lessonId: string,
    file: File | undefined,
  ) => {
    if (!file) return;
    try {
      const metadata = await inspectVideoFile(file);
      const upload = await handleFileUpload(file);
      if (!upload) return;
      setModules((current) =>
        current.map((module) =>
          module.id === modId
            ? {
                ...module,
                lessons: module.lessons.map((lesson) =>
                  lesson.id === lessonId
                    ? {
                        ...lesson,
                        contentUrl: upload.url,
                        duration: metadata.durationMinutes,
                        minimumWatchSeconds: metadata.durationSeconds,
                      }
                    : lesson,
                ),
              }
            : module,
        ),
      );
      showToast(`Vídeo válido: ${metadata.durationMinutes} min.`, "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Vídeo inválido.",
        "error",
      );
    }
  };

  const handleSave = async () => {
    if (!formData.title)
      return showToast("O curso precisa de um título!", "error");
    setSavingStatus("saving");

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author: formData.author,
        coverUrl: formData.coverUrl,
        isPublished: formData.isPublished,
        modules: modules.map((m) => ({
          ...(!isCreating && { id: m.id }),
          title: m.title,
          gameType: m.gameType || null,
          gameConfig: m.gameType ? JSON.parse(m.gameConfigText) : null,
          lessons: m.lessons.map((l) => ({
            ...(!isCreating && { id: l.id }),
            title: l.title,
            type: l.type,
            duration: Number(l.duration),
            minimumWatchSeconds:
              l.type === "VIDEO" && l.videoMode === "UPLOAD"
                ? Math.max(
                    0,
                    Number(l.minimumWatchSeconds) || Number(l.duration) * 60,
                  )
                : 0,
            contentUrl: l.contentUrl,
            published: l.published,
            quizConfig: l.quizConfigText.trim()
              ? JSON.parse(l.quizConfigText)
              : null,
            attachments: l.attachments
              .filter((a) => a.url.trim())
              .map((a) => ({
                ...(!isCreating && { id: a.id }),
                title: a.title,
                type: a.type,
                url: a.url,
              })),
          })),
        })),
      };

      const response = await fetch(
        apiUrl(isCreating ? "/api/courses" : `/api/courses/${courseId}`),
        {
          method: isCreating ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(
          await apiErrorMessage(response, "Falha ao salvar o curso"),
        );
      }

      setSavingStatus("saved");
      showToast(
        isCreating
          ? "Curso criado com sucesso!"
          : "Curso atualizado com sucesso!",
        "success",
      );
      await onSaved?.();
      if (embedded && onClose) setTimeout(onClose, 700);
      else setTimeout(() => setSavingStatus("idle"), 3000);
    } catch (error) {
      setSavingStatus("error");
      showToast(
        error instanceof Error
          ? error.message
          : "Erro ao gravar as alterações.",
        "error",
      );
    }
  };

  if (isLoading)
    return (
      <div
        className={`${embedded ? "fixed inset-0 z-[120]" : "min-h-screen"} bg-[#F5EFEC] flex items-center justify-center`}
      >
        <Loader2 className="animate-spin text-[#641C32]" size={40} />
      </div>
    );

  return (
    <div
      className={`${embedded ? "fixed inset-0 z-[120] overflow-y-auto" : "min-h-screen"} bg-[#FAF7F4] pb-24 font-sans text-[#241A1D] sm:pb-32`}
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed left-1/2 top-3 z-[180] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 transform sm:top-6 sm:w-auto"
          >
            <div
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-md sm:items-center sm:px-6 sm:py-3.5 sm:text-sm ${toast.type === "error" ? "border-rose-400 bg-rose-500/95 text-white" : "border-[#241A1D] bg-[#241A1D]/95 text-white"}`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} className="text-[#776A6E]" />
              )}{" "}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-3 shadow-sm backdrop-blur-lg sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {embedded ? (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Voltar para a lista de cursos"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Link
              href="/admin/cursos"
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <h1 className="max-w-[40vw] truncate font-sans text-sm font-bold tracking-tight text-slate-900 sm:max-w-[50vw] sm:text-xl">
            {isCreating
              ? "Criar novo curso"
              : `A editar: ${formData.title || "Curso"}`}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {isUploadingFiles && (
            <span className="hidden items-center gap-2 text-sm font-bold text-amber-600 sm:flex">
              <Loader2 className="animate-spin" size={16} /> Enviando
              {uploadProgress !== null ? ` ${uploadProgress}%` : "..."}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={savingStatus === "saving" || isUploadingFiles}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#641C32] px-3 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#7D2943] disabled:opacity-60 sm:px-6 sm:text-sm"
          >
            {savingStatus === "saving" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}{" "}
            <span className="hidden sm:inline">
              {isCreating ? "Criar curso" : "Salvar alterações"}
            </span>
            <span className="sm:hidden">{isCreating ? "Criar" : "Salvar"}</span>
          </button>
        </div>
      </header>

      <nav className="fixed left-0 right-0 top-20 z-40 flex h-16 items-center justify-start overflow-hidden border-b border-slate-200 bg-white/95 px-2 shadow-sm backdrop-blur-md sm:justify-center">
        <div className="scrollbar-hide flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`group relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:gap-2.5 sm:px-6 sm:text-sm ${currentStep === step.id ? "text-[#241A1D]" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <step.icon
                size={16}
                className={
                  currentStep === step.id ? "text-[#641C32]" : "text-slate-400"
                }
              />{" "}
              {step.name}
              {currentStep === step.id && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute inset-0 bg-[#F5EFEC] border-[#E9E0E2] rounded-full -z-10"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-3 pt-44 sm:gap-8 sm:px-6 sm:pt-48 lg:px-12 xl:grid-cols-[minmax(0,1fr),360px]">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentStep === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:space-y-8 sm:rounded-[2rem] sm:p-8 md:p-10"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Informações Essenciais
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Título do Curso
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-[#FAF7F4] border border-slate-200 rounded-2xl py-4 px-5 text-lg font-medium outline-none focus:border-[#641C32]"
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Autor
                    </label>
                    <input
                      type="text"
                      value={formData.author || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full bg-[#FAF7F4] border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:border-[#641C32]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Categoria da IA
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-[#FAF7F4] border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:border-[#641C32] font-medium text-slate-700"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-[#FAF7F4] border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:border-[#641C32] resize-none"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === "capa" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8 md:p-10"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Capa do Curso
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#641C32] bg-[#FAF7F4] hover:bg-[#F5EFEC] transition-colors rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer aspect-video">
                    <FileUp size={32} className="text-[#641C32] mb-3" />
                    <span className="font-bold text-slate-700">
                      Clique para alterar a imagem
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const upload = await handleFileUpload(
                          e.target.files?.[0],
                        );
                        if (upload)
                          setFormData({ ...formData, coverUrl: upload.url });
                      }}
                    />
                  </label>
                  <div>
                    {formData.coverUrl ? (
                      <img
                        src={apiAssetUrl(formData.coverUrl)}
                        alt="Preview"
                        className="w-full aspect-video object-cover rounded-2xl border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                        Sem imagem
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🚀 ABA DESBLOQUEADA! A Edição Profunda de Módulos */}
            {currentStep === "conteudo" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Estrutura do Curso
                  </h2>
                  <button
                    onClick={addModule}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E9E0E2] bg-[#F5EFEC] px-5 py-2.5 font-bold text-[#241A1D] hover:bg-[#E9E0E2]"
                  >
                    <PlusCircle size={18} /> Adicionar Módulo
                  </button>
                </div>

                {modules.map((mod, mIndex) => (
                  <div
                    key={mod.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
                  >
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-[#FAF7F4] p-4 sm:gap-4 sm:p-5">
                      <GripVertical
                        size={20}
                        className="hidden text-slate-300 sm:block"
                      />
                      <input
                        type="text"
                        value={mod.title || ""}
                        onChange={(e) =>
                          updateModuleTitle(mod.id, e.target.value)
                        }
                        placeholder={`Nome do Módulo ${mIndex + 1}`}
                        className="min-w-0 flex-1 bg-transparent py-1 text-base font-bold outline-none focus:border-b sm:text-lg"
                      />
                      <button
                        onClick={() => removeModule(mod.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => addLesson(mod.id)}
                        className="order-last flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50 sm:order-none sm:w-auto"
                      >
                        <PlusCircle size={16} /> Aula
                      </button>
                    </div>

                    <div className="border-b border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Avaliação do módulo
                        </label>
                        <select
                          value={mod.gameType}
                          onChange={(e) =>
                            updateModuleGame(mod.id, "gameType", e.target.value)
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                        >
                          <option value="">Sem avaliação</option>
                          <option value="DILEMA">O Dilema do Gestor</option>
                          <option value="INSPECAO">Inspeção de Risco</option>
                          <option value="CORRIDA">
                            Corrida do Conhecimento
                          </option>
                        </select>
                      </div>
                      {mod.gameType && (
                        <textarea
                          required
                          value={mod.gameConfigText}
                          onChange={(e) =>
                            updateModuleGame(
                              mod.id,
                              "gameConfigText",
                              e.target.value,
                            )
                          }
                          placeholder="Cole aqui a configuração JSON com as perguntas, cenários ou pontos de risco."
                          className="mt-3 min-h-36 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-[#641C32]"
                        />
                      )}
                    </div>

                    <div className="space-y-4 p-3 sm:p-4">
                      {mod.lessons.map((lesson, lIndex) => (
                        <div
                          key={lesson.id}
                          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                        >
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <span className="font-bold text-slate-400 text-sm">
                              Aula {lIndex + 1}
                            </span>
                            <input
                              type="text"
                              value={lesson.title || ""}
                              onChange={(e) =>
                                updateLesson(
                                  mod.id,
                                  lesson.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Título da Aula"
                              className="min-w-[180px] flex-1 py-1 font-bold text-slate-800 outline-none focus:border-b"
                            />
                            <button
                              onClick={() => removeLesson(mod.id, lesson.id)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                              <select
                                value={lesson.type}
                                onChange={(e) =>
                                  updateLesson(
                                    mod.id,
                                    lesson.id,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                              >
                                <option value="VIDEO">Vídeo Principal</option>
                                <option value="TEXT">
                                  Documento Principal
                                </option>
                              </select>
                              {lesson.type === "VIDEO" && (
                                <select
                                  value={lesson.videoMode}
                                  onChange={(e) =>
                                    updateLesson(
                                      mod.id,
                                      lesson.id,
                                      "videoMode",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                                >
                                  <option value="UPLOAD">
                                    📁 Upload (MP4)
                                  </option>
                                  <option value="LINK">
                                    🌐 Link (Externo)
                                  </option>
                                </select>
                              )}
                              <input
                                aria-label="Duração estimada em minutos"
                                type="number"
                                min="0"
                                value={lesson.duration || ""}
                                onChange={(e) =>
                                  updateLesson(
                                    mod.id,
                                    lesson.id,
                                    "duration",
                                    Number(e.target.value),
                                  )
                                }
                                placeholder="Duração (min)"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm outline-none"
                              />
                              {lesson.type === "VIDEO" &&
                                lesson.videoMode === "UPLOAD" && (
                                  <input
                                    aria-label="Tempo mínimo obrigatório em minutos"
                                    title="Tempo que o colaborador precisa assistir antes de concluir"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={
                                      lesson.minimumWatchSeconds
                                        ? lesson.minimumWatchSeconds / 60
                                        : ""
                                    }
                                    onChange={(e) =>
                                      updateLesson(
                                        mod.id,
                                        lesson.id,
                                        "minimumWatchSeconds",
                                        Math.round(Number(e.target.value) * 60),
                                      )
                                    }
                                    placeholder="Mínimo (min)"
                                    className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm font-semibold text-[#641C32] outline-none"
                                  />
                                )}
                            </div>

                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
                              {lesson.type === "VIDEO" &&
                              lesson.videoMode === "UPLOAD" ? (
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-2">
                                    <Video
                                      size={18}
                                      className="text-[#641C32]"
                                    />
                                    <span className="text-sm font-bold text-slate-700">
                                      {lesson.contentUrl
                                        ? "✅ Vídeo já enviado. Alterar:"
                                        : "Selecione o vídeo:"}
                                    </span>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg"
                                    onChange={async (e) => {
                                      await handleVideoUpload(
                                        mod.id,
                                        lesson.id,
                                        e.target.files?.[0],
                                      );
                                      e.target.value = "";
                                    }}
                                    className="w-full min-w-0 text-xs text-slate-500 file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#F5EFEC] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#641C32] hover:file:bg-[#E9E0E2] sm:w-auto sm:text-sm"
                                  />
                                </div>
                              ) : lesson.type === "VIDEO" &&
                                lesson.videoMode === "LINK" ? (
                                <div className="w-full flex items-center gap-2">
                                  <LinkIcon
                                    size={16}
                                    className="text-slate-400"
                                  />
                                  <input
                                    type="text"
                                    value={lesson.contentUrl || ""}
                                    onChange={(e) =>
                                      updateLesson(
                                        mod.id,
                                        lesson.id,
                                        "contentUrl",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Cole o Link (ex: Youtube)"
                                    className="w-full bg-transparent outline-none text-sm font-medium"
                                  />
                                </div>
                              ) : (
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-2">
                                    <Paperclip
                                      size={18}
                                      className="text-[#641C32]"
                                    />
                                    <span className="text-sm font-bold text-slate-700">
                                      {lesson.contentUrl
                                        ? "✅ Documento enviado. Alterar:"
                                        : "Documento Principal:"}
                                    </span>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,image/*,.xls,.xlsx,.csv,.ppt,.pptx,.txt"
                                    onChange={async (e) => {
                                      const upload = await handleFileUpload(
                                        e.target.files?.[0],
                                      );
                                      if (upload)
                                        updateLesson(
                                          mod.id,
                                          lesson.id,
                                          "contentUrl",
                                          upload.url,
                                        );
                                    }}
                                    className="w-full min-w-0 text-xs text-slate-500 file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#F5EFEC] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#641C32] hover:file:bg-[#E9E0E2] sm:w-auto sm:text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#641C32]">
                                  Quiz ao final da aula
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  O colaborador responde antes de liberar a
                                  próxima aula.
                                </p>
                              </div>
                              {lesson.quizConfigText.trim() && (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                  Configurado
                                </span>
                              )}
                            </div>
                            <textarea
                              value={lesson.quizConfigText}
                              onChange={(event) =>
                                updateLesson(
                                  mod.id,
                                  lesson.id,
                                  "quizConfigText",
                                  event.target.value,
                                )
                              }
                              placeholder='{"title":"Quiz da aula","questions":[...]}'
                              className="min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-[#641C32]"
                            />
                          </div>

                          {/* Materiais Complementares */}
                          <div className="-mx-4 -mb-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-4 pb-2 pt-4 sm:-mx-5 sm:px-5">
                            <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">
                                Materiais Complementares
                              </span>
                              <button
                                onClick={() => addAttachment(mod.id, lesson.id)}
                                className="text-xs font-bold text-[#641C32] hover:underline"
                              >
                                + Adicionar Material
                              </button>
                            </div>
                            {lesson.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:p-2"
                              >
                                <select
                                  value={att.type}
                                  onChange={(e) =>
                                    updateAttachment(
                                      mod.id,
                                      lesson.id,
                                      att.id,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                  className="text-xs font-bold text-slate-600 bg-slate-100 rounded-md py-2 px-3 outline-none border-none"
                                >
                                  {materialTypes.map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={att.title || ""}
                                  onChange={(e) =>
                                    updateAttachment(
                                      mod.id,
                                      lesson.id,
                                      att.id,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Nome"
                                  className="w-full border-[#641C32] px-2 text-xs font-medium outline-none focus:border-b md:w-1/4"
                                />
                                <div className="w-full min-w-0 flex-1">
                                  {att.type !== "LINK" ? (
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2">
                                      <Paperclip
                                        size={14}
                                        className="text-slate-400"
                                      />
                                      <input
                                        type="file"
                                        accept={materialAccept(att.type)}
                                        onChange={async (e) => {
                                          const upload = await handleFileUpload(
                                            e.target.files?.[0],
                                          );
                                          if (upload)
                                            applyAttachmentUpload(
                                              mod.id,
                                              lesson.id,
                                              att.id,
                                              upload,
                                            );
                                        }}
                                        className="min-w-0 flex-1 text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:font-bold file:bg-[#F5EFEC] file:text-[#641C32]"
                                      />
                                      {att.url && (
                                        <a
                                          href={apiAssetUrl(att.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="shrink-0 text-[10px] font-bold text-[#641C32] hover:underline"
                                        >
                                          Abrir
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3">
                                      <LinkIcon
                                        size={14}
                                        className="text-slate-400 mr-2"
                                      />
                                      <input
                                        type="text"
                                        value={att.url || ""}
                                        onChange={(e) =>
                                          updateAttachment(
                                            mod.id,
                                            lesson.id,
                                            att.id,
                                            "url",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="https://..."
                                        className="w-full text-xs outline-none bg-transparent py-1.5"
                                      />
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    removeAttachment(mod.id, lesson.id, att.id)
                                  }
                                  className="text-slate-300 hover:text-rose-500 p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="sticky top-28 space-y-6">
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2.5">
              <BarChart3 size={18} className="text-[#641C32]" /> Resumo do Curso
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF7F4] p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Módulos
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {modules.length}
                </p>
              </div>
              <div className="bg-[#FAF7F4] p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Aulas
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {modules.flatMap((m) => m.lessons).length}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Estado</span>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    isPublished: !formData.isPublished,
                  })
                }
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${formData.isPublished ? "bg-[#F5EFEC] text-[#7D2943] border border-[#E9E0E2]" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
              >
                {formData.isPublished ? "🌍 Publicado" : "📝 Rascunho"}
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function TelaDeEdicao() {
  return <CourseEditor />;
}
