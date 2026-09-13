import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "../BrandLogo";
import WhatsAppLink from "@/components/WhatsAppLink";

export const metadata: Metadata = {
  title: "Continue o atendimento",
  description:
    "Continue a conversa com a equipe de Lilian Arruda pelo WhatsApp.",
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <main className="flex min-h-[100dvh] items-center bg-[#FAF7F4] px-5 py-12 text-[#241A1D] sm:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[#E9E0E2] bg-white p-7 text-center shadow-[0_28px_80px_-48px_rgba(100,28,50,0.45)] sm:p-12">
        <BrandLogo priority className="mx-auto h-14 max-w-[220px]" />
        <p className="mt-10 text-sm font-bold text-[#7D2943]">
          Próximo passo
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          Continue a conversa no WhatsApp.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#776A6E] sm:text-lg">
          Se o WhatsApp já abriu, envie a mensagem preparada. Caso contrário,
          use o botão abaixo para iniciar o atendimento.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <WhatsAppLink
            placement="pagina_obrigado"
            redirectAfterClick={false}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#641C32] px-6 py-3 font-bold text-white hover:bg-[#7D2943] active:translate-y-px"
          >
            Abrir WhatsApp
          </WhatsAppLink>
          <Link
            href="/empresas"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#B9A7AD] px-6 py-3 font-bold text-[#641C32] hover:bg-[#F5EFEC] active:translate-y-px"
          >
            Voltar às soluções
          </Link>
        </div>
      </section>
    </main>
  );
}

