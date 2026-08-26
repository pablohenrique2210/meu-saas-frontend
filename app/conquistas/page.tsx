import Link from "next/link";
import BrandLogo from "../BrandLogo";

export default function ConquistasPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F4] px-6 py-10 text-[#241A1D]">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center">
          <BrandLogo priority className="h-[52px] max-w-[190px]" />
        </Link>
        <section className="mt-16 rounded-[32px] border border-[#E9E0E2] bg-white px-6 py-16 text-center shadow-[0_12px_40px_rgba(36,26,29,0.04)] sm:px-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5EFEC] text-[#641C32]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
            </svg>
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8F3651]">
            Conquistas
          </p>
          <h1 className="mt-3 font-serif text-4xl">
            Nenhuma conquista registrada
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#776A6E] sm:text-base">
            Medalhas, pontos e sequências aparecerão aqui somente quando o
            sistema de gamificação estiver conectado a registros reais.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-full bg-[#641C32] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7D2943]"
          >
            Voltar ao meu espaço
          </Link>
        </section>
      </div>
    </main>
  );
}
