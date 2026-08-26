import { UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { lilianClerkAppearance } from "../../clerkAppearance";

export default async function ProfilePage() {
  await auth.protect();

  return (
    <main className="min-h-screen bg-[#FAF7F4] px-4 py-8 text-[#241A1D] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#776A6E] transition-colors hover:text-[#641C32]"
            >
              <span aria-hidden="true">←</span> Voltar ao meu espaço
            </Link>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Sua conta</h1>
            <p className="mt-2 max-w-2xl text-[#776A6E]">
              Atualize seus dados pessoais, formas de acesso e configurações de segurança.
            </p>
          </div>
          <div className="rounded-full border border-[#E9E0E2] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7D2943]">
            Conta protegida
          </div>
        </header>

        <section aria-label="Gerenciamento da conta" className="overflow-hidden rounded-[28px]">
          <UserProfile
            path="/perfil"
            routing="path"
            appearance={lilianClerkAppearance}
          />
        </section>
      </div>
    </main>
  );
}
