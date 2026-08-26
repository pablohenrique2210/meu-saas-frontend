"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  LayoutGrid,
  X,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/lib/api-config";
import { CourseEditor } from "./[id]/editar/page";

interface Course {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  _count: { modules: number };
}

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editorCourseId, setEditorCourseId] = useState<
    string | null | undefined
  >(undefined);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // 🚀 ESTADO DO NOSSO NOVO MODAL PREMIUM
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const fetchCourses = async () => {
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const res = await fetch(apiUrl("/api/courses"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Falha ao carregar");
      setCourses(await res.json());
    } catch (err) {
      showToast("Erro ao carregar os cursos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 🚀 FUNÇÃO QUE CONFIRMA A EXCLUSÃO
  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Sessão sem token");
      const res = await fetch(apiUrl(`/api/courses/${courseToDelete.id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao apagar");
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      showToast("Curso excluído com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao excluir o curso.", "error");
    } finally {
      setCourseToDelete(null); // Fecha o modal
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#FAF7F4] font-sans text-[#241A1D] pb-32">
      {editorCourseId !== undefined && (
        <CourseEditor
          key={editorCourseId ?? "new-course"}
          courseId={editorCourseId}
          embedded
          onClose={() => setEditorCourseId(undefined)}
          onSaved={fetchCourses}
        />
      )}

      {/* 🚀 MODAL PREMIUM DE CONFIRMAÇÃO */}
      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCourseToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <button
                onClick={() => setCourseToDelete(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                <Trash2 size={28} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Excluir Curso?
              </h3>
              <p className="text-slate-500 mb-8">
                Tem a certeza que deseja excluir permanentemente o curso{" "}
                <strong className="text-slate-800">
                  "{courseToDelete.title}"
                </strong>
                ? O progresso dos alunos neste curso será perdido.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 py-3.5 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 px-4 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/rh"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E9E0E2] bg-white text-[#641C32] transition-colors hover:bg-[#F5EFEC]"
            aria-label="Voltar para o RH"
          >
            ←
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#241A1D]">
              Gestão de Cursos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Crie, edite, publique e visualize os cursos da plataforma.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditorCourseId(null)}
          className="flex items-center gap-2 bg-[#641C32] text-white px-6 py-3 rounded-full font-bold hover:bg-[#7D2943] transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Criar Novo Curso
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-10">
        <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center flex-1 px-4">
            <Search size={20} className="text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Pesquisar curso pelo título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none py-3 font-medium text-slate-700"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#641C32]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${course.isPublished ? "bg-[#F5EFEC] text-[#7D2943] border-[#E9E0E2]" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                  >
                    {course.isPublished ? "Publicado" : "Rascunho"}
                  </div>
                  {/* EM VEZ DE DELETAR DIRETO, ABRE O MODAL */}
                  <button
                    onClick={() =>
                      setCourseToDelete({ id: course.id, title: course.title })
                    }
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#241A1D] mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  {course.category.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6 pt-6 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <LayoutGrid size={14} /> {course._count?.modules || 0}{" "}
                    Módulos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />{" "}
                    {new Date(course.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link
                    href={`/aula/${course.id}`}
                    className="flex items-center justify-center gap-2 bg-[#FAF7F4] text-slate-600 border border-slate-200 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <Eye size={16} /> Ver
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditorCourseId(course.id)}
                    className="flex items-center justify-center gap-2 bg-[#F5EFEC] text-[#241A1D] border border-[#E9E0E2] py-2.5 rounded-xl font-bold text-sm hover:bg-[#E9E0E2] transition-colors"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
