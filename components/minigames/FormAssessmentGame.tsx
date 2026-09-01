"use client";

import { useState } from "react";
import type { AssessmentQuestion } from "@/components/courses/AssessmentBuilder";
import type {
  GameDiagnosticResult,
  GameMetricValue,
  ModuleGameType,
} from "@/lib/game-results-api";
import { useGameResultSubmission } from "./useGameResultSubmission";

interface FormAnswer {
  questionId: string;
  selectedOptionIds: string[];
  correct: boolean;
}

const labels: Record<ModuleGameType, string> = {
  DILEMA: "O Dilema do Gestor",
  INSPECAO: "Inspeção de Risco",
  CORRIDA: "Corrida do Conhecimento",
};

function sameIds(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((id) => expected.has(id));
}

export function FormAssessmentGame({
  moduleId,
  gameType,
  questions,
  onSubmitted,
}: {
  moduleId: string;
  gameType: ModuleGameType;
  questions: AssessmentQuestion[];
  onSubmitted?: (result: GameDiagnosticResult) => void;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [checked, setChecked] = useState(false);
  const { finishGame, status, submissionError } = useGameResultSubmission(
    moduleId,
    gameType,
    onSubmitted,
  );
  const question = questions[questionIndex];
  const currentCorrectIds =
    question?.options
      .filter((option) => option.correct)
      .map((option) => option.id) ?? [];
  const correct = checked && sameIds(selectedIds, currentCorrectIds);
  const feedback = checked
    ? question?.options.find(
        (option) => selectedIds.includes(option.id) && option.feedback,
      )?.feedback ||
      question?.options.find((option) => option.correct && option.feedback)
        ?.feedback
    : "";

  if (!question) {
    return (
      <p className="rounded-2xl border border-[#E9E0E2] bg-white p-5 text-sm text-[#776A6E]">
        Esta avaliação ainda não possui perguntas.
      </p>
    );
  }

  const selectOption = (optionId: string) => {
    if (checked || status !== "playing") return;
    if (question.type === "multiple") {
      setSelectedIds((current) =>
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const checkAnswer = () => {
    if (selectedIds.length === 0) return;
    setChecked(true);
  };

  const advance = async () => {
    const answer = {
      questionId: question.id,
      selectedOptionIds: selectedIds,
      correct: sameIds(selectedIds, currentCorrectIds),
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    if (questionIndex === questions.length - 1) {
      await finishGame(
        nextAnswers.filter((item) => item.correct).length * 100,
        {
          correctAnswers: nextAnswers.filter((item) => item.correct).length,
          totalQuestions: questions.length,
          answers: nextAnswers.map((item): GameMetricValue => ({
            questionId: item.questionId,
            selectedOptionIds: item.selectedOptionIds,
            correct: item.correct,
          })),
          wrongQuestionIds: nextAnswers
            .filter((item) => !item.correct)
            .map((item) => item.questionId),
        },
      );
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedIds([]);
    setChecked(false);
  };

  return (
    <section className="rounded-[28px] border border-[#E9E0E2] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8F3651]">
          {labels[gameType]}
        </p>
        <span className="rounded-full bg-[#FAF7F4] px-3 py-2 text-xs font-bold text-[#776A6E]">
          {questionIndex + 1}/{questions.length}
        </span>
      </div>
      {question.category && (
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#8F3651]">
          {question.category}
        </p>
      )}
      <h2 className="mt-2 font-serif text-2xl text-[#241A1D]">
        {question.prompt}
      </h2>
      <p className="mt-2 text-sm text-[#776A6E]">
        {question.type === "multiple"
          ? "Selecione todas as alternativas corretas."
          : "Selecione uma alternativa."}
      </p>
      <div className="mt-5 grid gap-3">
        {question.options.map((option) => {
          const selected = selectedIds.includes(option.id);
          const optionIsCorrect = checked && option.correct;
          const optionIsWrong = checked && selected && !option.correct;
          return (
            <button
              key={option.id}
              type="button"
              disabled={checked || status !== "playing"}
              onClick={() => selectOption(option.id)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left font-semibold transition ${optionIsCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-800" : optionIsWrong ? "border-rose-400 bg-rose-50 text-rose-800" : selected ? "border-[#8F3651] bg-[#F7EEF1] text-[#641C32]" : "border-[#E9E0E2] hover:border-[#641C32] hover:bg-[#FAF7F4]"}`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center border-2 border-current ${question.type === "multiple" ? "rounded-md" : "rounded-full"}`}
              >
                {selected && (
                  <span className="h-2.5 w-2.5 rounded-sm bg-current" />
                )}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      {checked && (
        <div
          className={`mt-5 rounded-2xl p-4 text-sm ${correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}
        >
          <p className="font-bold">
            {correct ? "Resposta correta." : "Resposta incorreta."}
          </p>
          {feedback && <p className="mt-1">{feedback}</p>}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!checked ? (
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={checkAnswer}
            className="rounded-full bg-[#641C32] px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() => void advance()}
            className="rounded-full bg-[#241A1D] px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {questionIndex === questions.length - 1
              ? "Finalizar avaliação"
              : "Próxima pergunta"}
          </button>
        )}
      </div>
      {submissionError && (
        <p className="mt-4 text-sm text-[#776A6E]">{submissionError}</p>
      )}
    </section>
  );
}
