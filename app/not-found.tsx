import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center bg-[#FAF7F4] px-5 py-12 text-[#241A1D] sm:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-[#E9E0E2] bg-white p-7 shadow-[0_28px_80px_-48px_rgba(100,28,50,0.45)] sm:p-12 lg:grid lg:grid-cols-[0.65fr_1.35fr] lg:items-center lg:gap-14">
        <div className="mb-10 lg:mb-0">
          <BrandLogo priority className="h-14 max-w-[220px]" />
          <p className="mt-8 font-serif text-7xl text-[#641C32] sm:text-8xl">
            404
          </p>
        </div>

        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Esta página não foi encontrada.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#776A6E] sm:text-lg">
            O endereço pode ter mudado ou sido digitado incorretamente. Escolha
            um caminho abaixo para continuar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#641C32] px-6 py-3 font-bold text-white hover:bg-[#7D2943] active:translate-y-px"
            >
              Voltar ao início
            </Link>
            <Link
              href="/empresas"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#B9A7AD] px-6 py-3 font-bold text-[#641C32] hover:bg-[#F5EFEC] active:translate-y-px"
            >
              Conhecer soluções
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

