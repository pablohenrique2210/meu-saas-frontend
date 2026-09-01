"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  downloadCourseReport,
  getCourseReportPreview,
  listReportCourses,
  type CourseReportPreview,
  type ReportCourse,
} from "@/lib/reports-api";
import { userFacingError } from "@/lib/user-facing-error";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
}

export default function ReportGeneratorModal({
  isOpen,
  onClose,
  companyId,
}: Props) {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState<ReportCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [preview, setPreview] = useState<CourseReportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sessão não forneceu um token de acesso.");
        const availableCourses = await listReportCourses(
          token,
          controller.signal,
          companyId,
        );
        setCourses(availableCourses);
        setSelectedCourseId((current) => current || availableCourses[0]?.id || "");
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(userFacingError(loadError, "Os cursos estão temporariamente indisponíveis."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })(), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [companyId, getToken, isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedCourseId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sessão não forneceu um token de acesso.");
        setPreview(
          await getCourseReportPreview(
            token,
            selectedCourseId,
            controller.signal,
            companyId,
          ),
        );
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(userFacingError(loadError, "O diagnóstico estará disponível em instantes."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })(), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [companyId, getToken, isOpen, selectedCourseId]);

  const handleDownload = async () => {
    if (!selectedCourseId) return;
    setIsDownloading(true);
    setError(null);
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      const { blob, filename } = await downloadCourseReport(
        token,
        selectedCourseId,
        companyId,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(userFacingError(downloadError, "Não foi possível preparar o PDF agora."));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
          <motion.button
            type="button"
            aria-label="Fechar gerador de relatórios"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#241A1D]/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-[#E9E0E2] bg-[#FAF7F4] shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-[#E9E0E2] bg-white px-6 py-5 sm:px-8 sm:py-6">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8F3651]">
                  Inteligência de aprendizagem
                </p>
                <h2 className="font-serif text-3xl text-[#241A1D]">
                  Relatórios e diagnósticos
                </h2>
                <p className="mt-2 text-sm text-[#776A6E]">
                  Acompanhe aulas, módulos, avaliações e evolução individual em um único PDF.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#776A6E] transition hover:bg-[#F5EFEC]"
              >
                <span className="sr-only">Fechar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="overflow-y-auto p-5 sm:p-8">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#776A6E]">
                Curso analisado
              </label>
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                disabled={isLoading && courses.length === 0}
                className="w-full rounded-2xl border border-[#E9E0E2] bg-white px-4 py-3.5 text-sm font-semibold text-[#241A1D] outline-none transition focus:border-[#641C32]"
              >
                {courses.length === 0 && <option value="">Nenhum curso cadastrado</option>}
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} — {course.collaboratorsAssigned} colaborador(es)
                  </option>
                ))}
              </select>

              {error && (
                <div className="mt-5 rounded-2xl border border-[#E9E0E2] bg-white px-4 py-3 text-sm text-[#776A6E]">
                  {error}
                </div>
              )}

              {isLoading && !preview ? (
                <div className="flex min-h-72 items-center justify-center text-sm font-medium text-[#776A6E]">
                  Preparando diagnóstico...
                </div>
              ) : preview ? (
                <div className="mt-7 space-y-7">
                  {preview.summary.collaboratorsAssigned === 0 && (
                    <div className="rounded-2xl border border-[#E8D7B9] bg-[#FFF9ED] px-4 py-3 text-sm text-[#765A2B]">
                      Este curso ainda não foi disponibilizado a nenhum colaborador desta empresa. O diagnóstico pode ser baixado, mas permanecerá sem dados de aproveitamento até que um acesso seja atribuído.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      ["Progresso médio", `${preview.summary.averageProgress}%`],
                      ["Colaboradores", String(preview.summary.collaboratorsAssigned)],
                      ["Iniciaram", String(preview.summary.collaboratorsStarted)],
                      ["Concluíram", String(preview.summary.collaboratorsCompleted)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-[#E9E0E2] bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#776A6E]">{label}</p>
                        <p className="mt-2 font-serif text-3xl text-[#641C32]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <section className="rounded-[22px] border border-[#E9E0E2] bg-white p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-[#241A1D]">Progresso por módulo</h3>
                          <p className="mt-1 text-xs text-[#776A6E]">Aulas concluídas pelos colaboradores atribuídos</p>
                        </div>
                        <span className="rounded-full bg-[#F5EFEC] px-3 py-1 text-xs font-bold text-[#641C32]">
                          {preview.summary.totalModules} módulos
                        </span>
                      </div>
                      <div className="space-y-4">
                        {preview.modules.map((module, index) => (
                          <div key={module.id}>
                            <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                              <span className="truncate font-semibold text-[#241A1D]">{index + 1}. {module.title}</span>
                              <span className="font-bold text-[#641C32]">{module.averageProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#E9E0E2]">
                              <div className="h-full rounded-full bg-[#8F3651] transition-all" style={{ width: `${module.averageProgress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[22px] bg-[#241A1D] p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9B8C2]">Leitura do diagnóstico</p>
                      <div className="mt-5 space-y-4">
                        {preview.insights.map((insight) => (
                          <div key={insight} className="flex gap-3 text-sm leading-relaxed text-[#FAF7F4]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C59A62]" />
                            <p>{insight}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="rounded-[22px] border border-[#E9E0E2] bg-white p-5">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#241A1D]">Desempenho nas avaliações</h3>
                        <p className="mt-1 text-xs text-[#776A6E]">Resultados enviados pelos jogos ao concluir cada módulo</p>
                      </div>
                      <span className="rounded-full bg-[#F5EFEC] px-3 py-1 text-xs font-bold text-[#641C32]">
                        {preview.summary.evaluationParticipationRate}% de participação
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {preview.modules.filter((module) => module.evaluation).map((module) => (
                        <div key={module.id} className="rounded-2xl bg-[#FAF7F4] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#241A1D]">{module.title}</p>
                              <p className="mt-1 text-xs text-[#776A6E]">{module.evaluation?.completedCount} resultado(s)</p>
                            </div>
                            <span className="font-serif text-2xl text-[#641C32]">{module.evaluation?.averageScore} pts</span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9E0E2]">
                            <div className="h-full rounded-full bg-[#2E6B57]" style={{ width: `${module.evaluation?.participationRate ?? 0}%` }} />
                          </div>
                        </div>
                      ))}
                      {preview.summary.evaluationsConfigured === 0 && (
                        <p className="text-sm text-[#776A6E]">Ainda não existem avaliações configuradas neste curso.</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-[22px] border border-[#E9E0E2] bg-white p-5">
                    <h3 className="font-semibold text-[#241A1D]">Visão dos colaboradores</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {preview.collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="rounded-2xl bg-[#FAF7F4] p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#241A1D]">{collaborator.name}</p>
                              <p className="mt-1 truncate text-xs text-[#776A6E]">{collaborator.position || "Cargo não informado"}</p>
                            </div>
                            <span className="font-serif text-2xl text-[#641C32]">{collaborator.overallProgress}%</span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9E0E2]">
                            <div className="h-full rounded-full bg-[#641C32]" style={{ width: `${collaborator.overallProgress}%` }} />
                          </div>
                        </div>
                      ))}
                      {preview.collaborators.length === 0 && (
                        <p className="text-sm text-[#776A6E]">Nenhum colaborador atribuído a este curso.</p>
                      )}
                    </div>
                  </section>
                </div>
              ) : !isLoading && courses.length === 0 ? (
                <div className="mt-6 rounded-[22px] border border-dashed border-[#D9C9CD] bg-white p-10 text-center">
                  <p className="font-semibold text-[#241A1D]">Ainda não há cursos cadastrados.</p>
                  <p className="mt-2 text-sm text-[#776A6E]">Crie ou importe um curso e volte a esta área.</p>
                </div>
              ) : null}
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-[#E9E0E2] bg-white px-6 py-4 sm:px-8">
              <p className="hidden text-xs text-[#776A6E] sm:block">PDF confidencial, restrito à empresa autenticada.</p>
              <div className="ml-auto flex gap-3">
                <button type="button" onClick={onClose} className="rounded-full border border-[#E9E0E2] px-5 py-3 text-sm font-semibold text-[#776A6E] hover:bg-[#FAF7F4]">
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={!preview || isDownloading}
                  className="rounded-full bg-[#641C32] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(100,28,50,0.2)] transition hover:bg-[#7D2943] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDownloading ? "Gerando PDF..." : "Baixar diagnóstico em PDF"}
                </button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
