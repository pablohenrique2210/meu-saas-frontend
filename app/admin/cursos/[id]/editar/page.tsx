"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/lib/api-config";
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
interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number;
  minimumWatchSeconds: number;
  videoMode: string;
  contentUrl: string;
  published: boolean;
  attachments: Attachment[];
}
interface Module {
  id: string;
  title: string;
  gameType: "" | "DILEMA" | "INSPECAO" | "CORRIDA";
  gameConfigText: string;
  lessons: Lesson[];
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
        const data = await res.json();

        setFormData({
          title: data.title,
          description: data.description || "",
          category: data.category,
          author: data.author || "",
          coverUrl: data.coverUrl || "",
          isPublished: data.isPublished,
        });

        if (data.modules) {
          const loadedModules = data.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            gameType: m.gameType || "",
            gameConfigText: m.gameConfig
              ? JSON.stringify(m.gameConfig, null, 2)
              : "",
            lessons: m.lessons.map((l: any) => ({
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
              contentUrl: l.contentUrl,
              published: l.isPublished ?? true,
              attachments: l.attachments
                ? l.attachments.map((a: any) => ({
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
      } catch (err) {
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
  const updateLesson = (
    modId: string,
    lessonId: string,
    field: keyof Lesson,
    value: any,
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
  const updateAttachment = (
    modId: string,
    lessonId: string,
    attId: string,
    field: keyof Attachment,
    value: any,
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
    showToast(`A carregar ${file.name}...`, "success");
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(apiUrl("/api/courses/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Erro no upload");
      const data = (await res.json()) as UploadedMaterial;
      setIsUploadingFiles(false);
      showToast(`Upload concluído!`, "success");
      return data;
    } catch (err) {
      setIsUploadingFiles(false);
      showToast("Falha no upload.", "error");
      return null;
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
      if (!response.ok) throw new Error("Falha na API");

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
      showToast("Erro ao gravar as alterações.", "error");
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
      className={`${embedded ? "fixed inset-0 z-[120] overflow-y-auto" : "min-h-screen"} bg-[#FAF7F4] font-sans text-[#241A1D] pb-32`}
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]"
          >
            <div
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm border backdrop-blur-md ${toast.type === "error" ? "bg-rose-500/90 border-rose-400 text-white" : "bg-[#241A1D]/95 border-[#241A1D] text-white"}`}
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

      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50 px-6 lg:px-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
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
          <h1 className="font-sans text-xl font-bold text-slate-900 tracking-tight">
            {isCreating
              ? "Criar novo curso"
              : `A editar: ${formData.title || "Curso"}`}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isUploadingFiles && (
            <span className="text-sm font-bold text-amber-500 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Processando
              arquivo...
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={savingStatus === "saving" || isUploadingFiles}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#641C32] hover:bg-[#7D2943] shadow-md transition-all"
          >
            {savingStatus === "saving" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}{" "}
            {isCreating ? "Criar curso" : "Salvar alterações"}
          </button>
        </div>
      </header>

      <nav className="fixed top-20 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-center shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`group flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all relative ${currentStep === step.id ? "text-[#241A1D]" : "text-slate-500 hover:bg-slate-50"}`}
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

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-48 grid grid-cols-1 xl:grid-cols-[1fr,360px] gap-8 items-start">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentStep === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm space-y-8"
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
                <div className="grid grid-cols-2 gap-8">
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
                className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm"
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
                        src={formData.coverUrl}
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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Estrutura do Curso
                  </h2>
                  <button
                    onClick={addModule}
                    className="flex gap-2 items-center px-5 py-2.5 rounded-xl font-bold text-[#241A1D] bg-[#F5EFEC] border border-[#E9E0E2] hover:bg-[#E9E0E2]"
                  >
                    <PlusCircle size={18} /> Adicionar Módulo
                  </button>
                </div>

                {modules.map((mod, mIndex) => (
                  <div
                    key={mod.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-5 bg-[#FAF7F4] border-b border-slate-200 flex gap-4 items-center">
                      <GripVertical size={20} className="text-slate-300" />
                      <input
                        type="text"
                        value={mod.title || ""}
                        onChange={(e) =>
                          updateModuleTitle(mod.id, e.target.value)
                        }
                        placeholder={`Nome do Módulo ${mIndex + 1}`}
                        className="flex-1 font-bold text-lg bg-transparent outline-none focus:border-b border-slate-400 py-1"
                      />
                      <button
                        onClick={() => removeModule(mod.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => addLesson(mod.id)}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50"
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

                    <div className="p-4 space-y-4">
                      {mod.lessons.map((lesson, lIndex) => (
                        <div
                          key={lesson.id}
                          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4"
                        >
                          <div className="flex items-center gap-4">
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
                              className="flex-1 font-bold text-slate-800 outline-none focus:border-b py-1"
                            />
                            <button
                              onClick={() => removeLesson(mod.id, lesson.id)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
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
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-slate-700"
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
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-slate-700"
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
                                    e.target.value,
                                  )
                                }
                                placeholder="Duração (min)"
                                className="w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center outline-none"
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
                                    className="w-36 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-center font-semibold text-[#641C32] outline-none"
                                  />
                                )}
                            </div>

                            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                              {lesson.type === "VIDEO" &&
                              lesson.videoMode === "UPLOAD" ? (
                                <div className="w-full flex items-center justify-between">
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
                                    accept="video/*"
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
                                    className="text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#F5EFEC] file:text-[#641C32] file:cursor-pointer hover:file:bg-[#E9E0E2]"
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
                                <div className="w-full flex items-center justify-between">
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
                                    className="text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#F5EFEC] file:text-[#641C32] file:cursor-pointer hover:file:bg-[#E9E0E2]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Materiais Complementares */}
                          <div className="pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 px-5 pb-2 -mb-2 rounded-b-2xl">
                            <div className="flex justify-between items-center mb-3">
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
                                className="flex items-center gap-3 mb-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
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
                                  className="w-1/4 text-xs font-medium outline-none px-2 focus:border-b border-[#641C32]"
                                />
                                <div className="flex-1">
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
                                          href={att.url}
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
