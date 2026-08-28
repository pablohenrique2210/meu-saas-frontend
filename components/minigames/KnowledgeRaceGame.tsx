"use client";

import { useState } from "react";
import type { GameDiagnosticResult } from "@/lib/game-results-api";
import { useGameResultSubmission } from "./useGameResultSubmission";

export interface RaceOption {
  id: string;
  label: string;
}

export interface RaceQuestion {
  id: string;
  prompt: string;
  options: RaceOption[];
  correctOptionId?: string;
  basePoints?: number;
  sectionTitle?: string;
  feedback?: string;
  isReflection?: boolean;
}

interface RaceAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean | null;
  isReflection: boolean;
  multiplier: number;
  awardedPoints: number;
}

interface KnowledgeRaceGameProps {
  moduleId: string;
  questions: RaceQuestion[];
  onSubmitted?: (result: GameDiagnosticResult) => void;
}

export function KnowledgeRaceGame({
  moduleId,
  questions,
  onSubmitted,
}: KnowledgeRaceGameProps) {
  // Injete `questions` dinamicamente a partir do banco de conteúdo do curso.
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<RaceAnswer[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const { finishGame, status, submissionError } = useGameResultSubmission(
    moduleId,
    "CORRIDA",
    onSubmitted,
  );
  const question = questions[questionIndex];
  const currentAnswer = answers[answers.length - 1];
  const totalScore = answers.reduce(
    (total, answer) => total + answer.awardedPoints,
    0,
  );

  const selectAnswer = (optionId: string) => {
    if (!question || selectedOptionId || status !== "playing") return;
    const isReflection = question.isReflection || !question.correctOptionId;
    const correct = isReflection ? null : optionId === question.correctOptionId;
    const nextCombo = isReflection ? combo : correct ? combo + 1 : 0;
    const multiplier =
      correct === true ? Math.min(3, 1 + Math.floor(nextCombo / 3) * 0.5) : 1;
    const awardedPoints =
      correct === true
        ? Math.round((question.basePoints ?? 100) * multiplier)
        : 0;
    const answer = {
      questionId: question.id,
      selectedOptionId: optionId,
      correct,
      isReflection,
      multiplier,
      awardedPoints,
    };

    setSelectedOptionId(optionId);
    setAnswers((current) => [...current, answer]);
    setCombo(nextCombo);
    setMaxCombo((current) => Math.max(current, nextCombo));
  };

  const submit = async (finalAnswers: RaceAnswer[]) => {
    setFinished(true);
    await finishGame(
      finalAnswers.reduce((total, answer) => total + answer.awardedPoints, 0),
      {
        correctAnswers: finalAnswers.filter((answer) => answer.correct === true)
          .length,
        totalQuestions: questions.filter(
          (questionItem) => !questionItem.isReflection,
        ).length,
        maxCombo,
        wrongQuestionIds: finalAnswers
          .filter((answer) => answer.correct === false)
          .map((answer) => answer.questionId),
        diagnosticResponses: finalAnswers
          .filter((answer) => answer.isReflection)
          .map((answer) => {
            const answeredQuestion = questions.find(
              (questionItem) => questionItem.id === answer.questionId,
            );
            return {
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
              selectedLabel:
                answeredQuestion?.options.find(
                  (option) => option.id === answer.selectedOptionId,
                )?.label ?? "",
            };
          }),
        answers: finalAnswers.map((answer) => ({ ...answer })),
      },
    );
  };

  const advance = () => {
    if (!selectedOptionId) return;
    if (questionIndex === questions.length - 1) {
      void submit(answers);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedOptionId(null);
  };

  if (!question) {
    return (
      <p className="rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">
        Nenhuma pergunta foi configurada para a Corrida do Conhecimento.
      </p>
    );
  }

  return (
    <section className="rounded-[28px] border border-[#E9E0E2] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8F3651]">
          Corrida do Conhecimento
        </p>
        <div className="flex gap-2 text-xs font-bold">
          <span className="rounded-full bg-[#FAF7F4] px-3 py-2">
            {totalScore} pts
          </span>
          <span className="rounded-full bg-[#641C32] px-3 py-2 text-white">
            Combo x{combo}
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-[#776A6E]">
        Pergunta {questionIndex + 1} de {questions.length}
      </p>
      {question.sectionTitle && (
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8F3651]">
          {question.sectionTitle}
        </p>
      )}
      <h2 className="mt-2 font-serif text-2xl text-[#241A1D]">
        {question.prompt}
      </h2>
      <div className="mt-5 grid gap-3">
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          const correct =
            selectedOptionId && option.id === question.correctOptionId;
          const reflectionSelected = selected && question.isReflection;
          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(selectedOptionId) || finished}
              onClick={() => selectAnswer(option.id)}
              className={`rounded-2xl border p-4 text-left font-semibold transition ${correct ? "border-emerald-500 bg-emerald-50 text-emerald-800" : reflectionSelected ? "border-[#641C32] bg-[#F7EEF1] text-[#641C32]" : selected ? "border-rose-400 bg-rose-50 text-rose-800" : "border-[#E9E0E2] hover:border-[#641C32] hover:bg-[#FAF7F4]"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedOptionId && !finished && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p
              className={`text-sm font-bold ${currentAnswer?.isReflection ? "text-[#641C32]" : currentAnswer?.correct ? "text-emerald-700" : "text-rose-700"}`}
            >
              {currentAnswer?.isReflection
                ? "Resposta registrada para o seu diagnóstico."
                : currentAnswer?.correct
                  ? `Correto! +${currentAnswer.awardedPoints} pontos`
                  : "Resposta incorreta. O combo foi reiniciado."}
            </p>
            {question.feedback && (
              <p className="mt-1 max-w-2xl text-sm font-medium text-[#776A6E]">
                {question.feedback}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={advance}
            className="rounded-full bg-[#241A1D] px-5 py-3 text-sm font-bold text-white"
          >
            {questionIndex === questions.length - 1 ? "Finalizar" : "Próxima"}
          </button>
        </div>
      )}

      {status === "submitting" && (
        <p className="mt-4 text-sm text-[#776A6E]">Enviando resultado...</p>
      )}
      {status === "submitted" && (
        <p className="mt-4 text-sm font-bold text-emerald-700">
          Resultado enviado ao RH.
        </p>
      )}
      {submissionError && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          <span>{submissionError}</span>
          <button
            type="button"
            onClick={() => void submit(answers)}
            className="underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </section>
  );
}
