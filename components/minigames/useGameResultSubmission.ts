"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  submitGameResult,
  type GameDiagnosticResult,
  type GameMetricValue,
  type ModuleGameType,
} from "@/lib/game-results-api";

export function useGameResultSubmission(
  moduleId: string,
  gameType: ModuleGameType,
  onSubmitted?: (result: GameDiagnosticResult) => void,
) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const startedAt = useRef<number | null>(null);
  const submissionInFlight = useRef(false);
  const [status, setStatus] = useState<"playing" | "submitting" | "submitted">(
    "playing",
  );
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const finishGame = useCallback(
    async (
      finalScore: number,
      metrics: Record<string, GameMetricValue>,
    ) => {
      if (!user || submissionInFlight.current || status === "submitted") {
        return null;
      }

      submissionInFlight.current = true;
      setStatus("submitting");
      setSubmissionError("");

      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("A sessão não forneceu um token de acesso.");

        const result = await submitGameResult(token, {
          employeeId: user.id,
          moduleId,
          gameType,
          finalScore: Math.max(0, Math.round(finalScore)),
          timeSpentSeconds: Math.max(
            1,
            Math.round(
              (Date.now() - (startedAt.current ?? Date.now())) / 1000,
            ),
          ),
          metrics,
        });

        setStatus("submitted");
        onSubmitted?.(result);
        return result;
      } catch (error) {
        setStatus("playing");
        setSubmissionError(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o resultado.",
        );
        return null;
      } finally {
        submissionInFlight.current = false;
      }
    }, [gameType, getToken, moduleId, onSubmitted, status, user]);

  return { finishGame, status, submissionError };
}
