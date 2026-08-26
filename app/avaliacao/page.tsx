import { Suspense } from "react";
import EvaluationClient from "./EvaluationClient";

export default function AvaliacoesPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#FAF7F4] text-[#776A6E]">
          Carregando avaliação...
        </main>
      }
    >
      <EvaluationClient />
    </Suspense>
  );
}
