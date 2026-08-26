"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import BrandLogo from "../BrandLogo";
import {
  DilemmaManagerGame,
  KnowledgeRaceGame,
  RiskInspectionGame,
  type DilemmaIndicators,
  type DilemmaNode,
  type RaceQuestion,
  type RiskHotspot,
} from "@/components/minigames";
import {
  getModuleGame,
  type GameDiagnosticResult,
  type ModuleGameDefinition,
} from "@/lib/game-results-api";

interface DilemmaConfig {
  initialNodeId: string;
  nodes: DilemmaNode[];
  initialIndicators?: DilemmaIndicators;
}

interface InspectionConfig {
  scenarioImageUrl: string;
  hotspots: RiskHotspot[];
  timeLimitSeconds?: number;
}

interface RaceConfig {
  questions: RaceQuestion[];
}

export default function EvaluationClient() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const { getToken } = useAuth();
  const [definition, setDefinition] = useState<ModuleGameDefinition | null>(null);
  const [completedResult, setCompletedResult] = useState<ModuleGameDefinition["completedResult"]>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(moduleId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!moduleId) return;
    const controller = new AbortController();

    void (async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token de acesso.");
        const game = await getModuleGame(token, moduleId, controller.signal);
        setDefinition(game);
        setCompletedResult(game.completedResult);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Não foi possível abrir a avaliação.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [getToken, moduleId]);

  const handleSubmitted = (result: GameDiagnosticResult) => {
    setCompletedResult({
      finalScore: result.finalScore,
      timeSpentSeconds: result.timeSpentSeconds,
      completedAt: result.completedAt,
    });
    setIsReplaying(false);
  };

  const renderGame = () => {
    if (!definition) return null;

    if (definition.gameType === "DILEMA") {
      const config = definition.config as unknown as DilemmaConfig;
      if (!config.initialNodeId || !Array.isArray(config.nodes)) return <ConfigurationError />;
      return (
        <DilemmaManagerGame
          moduleId={definition.moduleId}
          initialNodeId={config.initialNodeId}
          nodes={config.nodes}
          initialIndicators={config.initialIndicators}
          onSubmitted={handleSubmitted}
        />
      );
    }

    if (definition.gameType === "INSPECAO") {
      const config = definition.config as unknown as InspectionConfig;
      if (!config.scenarioImageUrl || !Array.isArray(config.hotspots)) return <ConfigurationError />;
      return (
        <RiskInspectionGame
          moduleId={definition.moduleId}
          scenarioImageUrl={config.scenarioImageUrl}
          hotspots={config.hotspots}
          timeLimitSeconds={config.timeLimitSeconds}
          onSubmitted={handleSubmitted}
        />
      );
    }

    const config = definition.config as unknown as RaceConfig;
    if (!Array.isArray(config.questions)) return <ConfigurationError />;
    return (
      <KnowledgeRaceGame
        moduleId={definition.moduleId}
        questions={config.questions}
        onSubmitted={handleSubmitted}
      />
    );
  };

  return (
    <main className="min-h-screen bg-[#FAF7F4] px-5 py-8 text-[#241A1D] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <BrandLogo priority className="h-[50px] max-w-[190px]" />
          </Link>
          {definition && (
            <Link href={`/aula/${definition.courseId}`} className="rounded-full border border-[#E9E0E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#776A6E]">
              Voltar ao curso
            </Link>
          )}
        </div>

        {!moduleId && <EmptyState message="Conclua um módulo dentro do curso para liberar sua avaliação." />}
        {isLoading && <EmptyState message="Preparando sua avaliação..." />}
        {error && <EmptyState message={error} error />}

        {definition && !isLoading && !error && (
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8F3651]">{definition.courseTitle}</p>
            <h1 className="mt-2 font-serif text-4xl">Avaliação · {definition.moduleTitle}</h1>
            <p className="mb-7 mt-3 text-sm text-[#776A6E]">Seu resultado será enviado ao diagnóstico do RH ao finalizar.</p>

            {completedResult && !isReplaying ? (
              <section className="rounded-[28px] border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Avaliação concluída</p>
                <p className="mt-3 font-serif text-5xl text-[#241A1D]">{completedResult.finalScore} pontos</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href={`/aula/${definition.courseId}`} className="rounded-full bg-[#241A1D] px-6 py-3 text-sm font-bold text-white">Continuar curso</Link>
                  <button type="button" onClick={() => setIsReplaying(true)} className="rounded-full border border-[#E9E0E2] px-6 py-3 text-sm font-bold text-[#776A6E]">Refazer avaliação</button>
                </div>
              </section>
            ) : renderGame()}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <section className={`mt-14 rounded-[28px] border bg-white p-10 text-center ${error ? "border-rose-200 text-rose-700" : "border-[#E9E0E2] text-[#776A6E]"}`}>
      <p className="font-semibold">{message}</p>
    </section>
  );
}

function ConfigurationError() {
  return <EmptyState error message="A configuração desta avaliação está incompleta. Solicite a revisão do curso ao administrador." />;
}
