"use client";

import { useMemo, useState } from "react";
import type { GameDiagnosticResult } from "@/lib/game-results-api";
import { useGameResultSubmission } from "./useGameResultSubmission";

export interface DilemmaIndicators {
  morale: number;
  budget: number;
}

export interface DilemmaChoice {
  id: string;
  label: string;
  nextNodeId?: string;
  score: number;
  effects: Partial<DilemmaIndicators>;
}

export interface DilemmaNode {
  id: string;
  title: string;
  situation: string;
  choices: DilemmaChoice[];
}

interface DilemmaManagerGameProps {
  moduleId: string;
  initialNodeId: string;
  nodes: DilemmaNode[];
  initialIndicators?: DilemmaIndicators;
  onSubmitted?: (result: GameDiagnosticResult) => void;
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function DilemmaManagerGame({
  moduleId,
  initialNodeId,
  nodes,
  initialIndicators = { morale: 50, budget: 50 },
  onSubmitted,
}: DilemmaManagerGameProps) {
  // Injete `nodes` dinamicamente a partir do conteúdo cadastrado para o módulo.
  const nodesById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);
  const [indicators, setIndicators] = useState(initialIndicators);
  const [path, setPath] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const { finishGame, status, submissionError } = useGameResultSubmission(
    moduleId,
    "DILEMA",
    onSubmitted,
  );
  const currentNode = nodesById.get(currentNodeId);

  const choose = async (choice: DilemmaChoice) => {
    if (!currentNode || status !== "playing") return;

    const nextIndicators = {
      morale: clamp(indicators.morale + (choice.effects.morale ?? 0)),
      budget: clamp(indicators.budget + (choice.effects.budget ?? 0)),
    };
    const nextPath = [...path, `${currentNode.id}:${choice.id}`];
    const nextScore = score + choice.score;

    setIndicators(nextIndicators);
    setPath(nextPath);
    setScore(nextScore);

    if (choice.nextNodeId && nodesById.has(choice.nextNodeId)) {
      setCurrentNodeId(choice.nextNodeId);
      return;
    }

    await finishGame(nextScore, {
      decisionPath: nextPath,
      finalIndicators: nextIndicators,
      decisionsTaken: nextPath.length,
    });
  };

  if (!currentNode) {
    return (
      <p className="rounded-2xl border border-[#E9E0E2] bg-white p-5 text-sm text-[#776A6E]">
        Esta atividade está em preparação.
      </p>
    );
  }

  return (
    <section className="rounded-[28px] border border-[#E9E0E2] bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-3">
        <Indicator label="Moral" value={indicators.morale} />
        <Indicator label="Orçamento" value={indicators.budget} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8F3651]">
        O Dilema do Gestor
      </p>
      <h2 className="mt-2 font-serif text-3xl text-[#241A1D]">
        {currentNode.title}
      </h2>
      <p className="mt-3 leading-relaxed text-[#776A6E]">
        {currentNode.situation}
      </p>
      <div className="mt-6 grid gap-3">
        {currentNode.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={status !== "playing"}
            onClick={() => void choose(choice)}
            className="rounded-2xl border border-[#E9E0E2] p-4 text-left font-semibold text-[#241A1D] transition hover:border-[#641C32] hover:bg-[#FAF7F4] disabled:opacity-50"
          >
            {choice.label}
          </button>
        ))}
      </div>
      <SubmissionMessage status={status} error={submissionError} />
    </section>
  );
}

function Indicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-[#FAF7F4] p-3">
      <div className="flex justify-between text-xs font-bold text-[#776A6E]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E9E0E2]">
        <div className="h-full bg-[#641C32]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SubmissionMessage({
  status,
  error,
}: {
  status: "playing" | "submitting" | "submitted";
  error: string;
}) {
  if (status === "submitting")
    return <p className="mt-4 text-sm text-[#776A6E]">Enviando resultado...</p>;
  if (status === "submitted")
    return <p className="mt-4 text-sm font-bold text-emerald-700">Resultado enviado ao RH.</p>;
  if (error)
    return <p className="mt-4 text-sm text-[#776A6E]">{error}</p>;
  return null;
}
