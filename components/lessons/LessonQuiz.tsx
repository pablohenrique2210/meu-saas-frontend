"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { apiUrl } from "@/lib/api-config";

interface QuizOption {
  id: string;
  label: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

interface LessonQuizDefinition {
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  completedResult: {
    finalScore: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null;
}

interface LessonQuizProps {
  lessonId: string;
  isNightMode: boolean;
  onCompleted: () => void | Promise<void>;
  onClose: () => void;
}

async function responseMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  if (Array.isArray(payload?.message)) return payload.message.join(", ");
  return payload?.message || fallback;
}

export function LessonQuiz({
  lessonId,
  isNightMode,
  onCompleted,
  onClose,
}: LessonQuizProps) {
  const { getToken } = useAuth();
  const [definition, setDefinition] = useState<LessonQuizDefinition | null>(
    null,
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] =
    useState<LessonQuizDefinition["completedResult"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sua sessão expirou.");
        const response = await fetch(
          apiUrl(`/api/courses/lessons/${lessonId}/quiz`),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            await responseMessage(response, "Não foi possível abrir o quiz."),
          );
        }
        const data = (await response.json()) as LessonQuizDefinition;
        setDefinition(data);
        setResult(data.completedResult);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        )
          return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível abrir o quiz.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [getToken, lessonId]);

  const question = definition?.questions[questionIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;

  const submit = async () => {
    if (!definition) return;
    setIsSubmitting(true);
    setError("");
    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sua sessão expirou.");
      const response = await fetch(
        apiUrl(`/api/courses/lessons/${lessonId}/quiz`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: definition.questions.map((questionItem) => ({
              questionId: questionItem.id,
              selectedOptionId: answers[questionItem.id],
            })),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await responseMessage(response, "Não foi possível enviar o quiz."),
        );
      }
      setResult(
        (await response.json()) as NonNullable<
          LessonQuizDefinition["completedResult"]
        >,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar o quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const advance = () => {
    if (!definition || !question || !selectedOptionId) return;
    if (questionIndex === definition.questions.length - 1) {
      void submit();
      return;
    }
    setQuestionIndex((current) => current + 1);
  };

  const panelClass = isNightMode
    ? "border-white/10 bg-[#241E29] text-white"
    : "border-[#E9E0E2] bg-white text-[#241A1D]";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section
        className={`max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border p-5 shadow-2xl sm:rounded-[32px] sm:p-8 ${panelClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B7637C]">
              Atividade da aula
            </p>
            <h2 className="mt-2 font-serif text-3xl">
              {definition?.title || "Quiz da aula"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar quiz"
            className="rounded-full border border-current/15 p-2 opacity-70 transition hover:opacity-100"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading && (
          <div className="flex min-h-64 items-center justify-center gap-3">
            <Loader2 className="animate-spin" /> Preparando atividade...
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {result ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <p className="mt-4 text-sm font-bold uppercase tracking-wider text-emerald-600">
              Quiz concluído
            </p>
            <p className="mt-3 font-serif text-4xl">
              {result.correctAnswers} de {result.totalQuestions} corretas
            </p>
            <button
              type="button"
              onClick={() => void onCompleted()}
              className="mt-8 w-full rounded-2xl bg-[#641C32] px-6 py-4 font-bold text-white sm:w-auto sm:rounded-full"
            >
              Concluir aula e continuar
            </button>
          </div>
        ) : (
          definition &&
          question && (
            <div className="mt-7">
              <div className="flex items-center justify-between text-xs font-bold opacity-60">
                <span>
                  Pergunta {questionIndex + 1} de {definition.questions.length}
                </span>
                <span>
                  {Math.round(
                    ((questionIndex + 1) / definition.questions.length) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-current/10">
                <div
                  className="h-full rounded-full bg-[#8F3651] transition-all"
                  style={{
                    width: `${((questionIndex + 1) / definition.questions.length) * 100}%`,
                  }}
                />
              </div>
              <h3 className="mt-7 font-serif text-2xl leading-snug">
                {question.prompt}
              </h3>
              <div className="mt-5 grid gap-3">
                {question.options.map((option) => {
                  const selected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.id,
                        }))
                      }
                      className={`rounded-2xl border p-4 text-left font-semibold transition ${selected ? "border-[#8F3651] bg-[#F7EEF1] text-[#641C32]" : isNightMode ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-[#E9E0E2] hover:border-[#8F3651] hover:bg-[#FAF7F4]"}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={!selectedOptionId || isSubmitting}
                onClick={advance}
                className="mt-7 flex w-full items-center justify-center rounded-2xl bg-[#641C32] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-full"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : questionIndex === definition.questions.length - 1 ? (
                  "Finalizar quiz"
                ) : (
                  "Próxima pergunta"
                )}
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}
