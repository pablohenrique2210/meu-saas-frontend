"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { GameDiagnosticResult } from "@/lib/game-results-api";
import { useGameResultSubmission } from "./useGameResultSubmission";

export interface RiskHotspot {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
  points: number;
}

interface RiskInspectionGameProps {
  moduleId: string;
  scenarioImageUrl: string;
  hotspots: RiskHotspot[];
  timeLimitSeconds?: number;
  onSubmitted?: (result: GameDiagnosticResult) => void;
}

export function RiskInspectionGame({
  moduleId,
  scenarioImageUrl,
  hotspots,
  timeLimitSeconds = 60,
  onSubmitted,
}: RiskInspectionGameProps) {
  // Injete a imagem e os hotspots a partir da configuração do módulo.
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const foundIdsRef = useRef<string[]>([]);
  const [remainingTime, setRemainingTime] = useState(timeLimitSeconds);
  const remainingTimeRef = useRef(timeLimitSeconds);
  const [gameOver, setGameOver] = useState(false);
  const finishing = useRef(false);
  const { finishGame, status, submissionError } = useGameResultSubmission(
    moduleId,
    "INSPECAO",
    onSubmitted,
  );

  const finish = useCallback(
    async (ids: string[], finishedBy: "all_found" | "timeout") => {
      if (finishing.current || status === "submitted") return;
      finishing.current = true;
      setGameOver(true);

      const found = hotspots.filter((hotspot) => ids.includes(hotspot.id));
      const missed = hotspots.filter((hotspot) => !ids.includes(hotspot.id));
      const result = await finishGame(
        found.reduce((total, hotspot) => total + hotspot.points, 0) +
          remainingTime * 5,
        {
          foundErrorIds: found.map((hotspot) => hotspot.id),
          missedErrorIds: missed.map((hotspot) => hotspot.id),
          accuracyPercent:
            hotspots.length > 0
              ? Math.round((found.length / hotspots.length) * 100)
              : 100,
          finishedBy,
        },
      );
      if (!result) finishing.current = false;
    }, [finishGame, hotspots, remainingTime, status]);

  useEffect(() => {
    if (gameOver || status !== "playing") return;

    const interval = window.setInterval(() => {
      const next = Math.max(0, remainingTimeRef.current - 1);
      remainingTimeRef.current = next;
      setRemainingTime(next);
      if (next === 0) {
        window.clearInterval(interval);
        void finish(foundIdsRef.current, "timeout");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [finish, gameOver, status]);

  const inspect = (event: MouseEvent<HTMLButtonElement>) => {
    if (gameOver || status !== "playing") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const hit = hotspots.find((hotspot) => {
      if (foundIdsRef.current.includes(hotspot.id)) return false;
      return Math.hypot(x - hotspot.xPercent, y - hotspot.yPercent) <= hotspot.radiusPercent;
    });
    if (!hit) return;

    const nextFoundIds = [...foundIdsRef.current, hit.id];
    foundIdsRef.current = nextFoundIds;
    setFoundIds(nextFoundIds);
    if (nextFoundIds.length === hotspots.length) {
      void finish(nextFoundIds, "all_found");
    }
  };

  return (
    <section className="rounded-[28px] border border-[#E9E0E2] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8F3651]">
            Inspeção de Risco
          </p>
          <p className="mt-1 text-sm text-[#776A6E]">
            Encontrados: {foundIds.length}/{hotspots.length}
          </p>
        </div>
        <span className="rounded-full bg-[#641C32] px-4 py-2 text-sm font-bold text-white">
          {remainingTime}s
        </span>
      </div>

      <button
        type="button"
        aria-label="Cenário para inspeção de riscos"
        onClick={inspect}
        disabled={gameOver}
        className="relative block w-full cursor-crosshair overflow-hidden rounded-2xl bg-[#241A1D] text-left disabled:cursor-default"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scenarioImageUrl}
          alt="Cenário da inspeção"
          className="block h-auto w-full select-none"
          draggable={false}
        />
        {hotspots
          .filter((hotspot) => foundIds.includes(hotspot.id))
          .map((hotspot) => (
            <span
              key={hotspot.id}
              title={hotspot.label}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-emerald-400 bg-emerald-400/25 text-sm font-black text-white"
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
                width: `${hotspot.radiusPercent * 2}%`,
                aspectRatio: "1",
              }}
            >
              ✓
            </span>
          ))}
      </button>

      {gameOver && (
        <p className="mt-4 text-sm font-semibold text-[#241A1D]">
          Inspeção encerrada. {foundIds.length} risco(s) identificado(s).
        </p>
      )}
      {status === "submitting" && <p className="mt-3 text-sm text-[#776A6E]">Enviando resultado...</p>}
      {status === "submitted" && <p className="mt-3 text-sm font-bold text-emerald-700">Resultado enviado ao RH.</p>}
      {submissionError && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#776A6E]">
          <span>{submissionError}</span>
          <button type="button" onClick={() => void finish(foundIds, remainingTime === 0 ? "timeout" : "all_found")} className="underline">
            Tentar novamente
          </button>
        </div>
      )}
    </section>
  );
}
