"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SignUp, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BrandLogo from "../BrandLogo";
import {
  claimEmployeeInvitation,
  getMyProfile,
  UsersApiError,
} from "@/lib/users-api";

function formatCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function ActivationGate() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [accountState, setAccountState] = useState<
    "checking" | "active" | "unprovisioned" | "error"
  >("checking");
  const [checkAttempt, setCheckAttempt] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const checkAccount = async () => {
      setAccountState("checking");
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token.");
        await getMyProfile(token, controller.signal);
        setAccountState("active");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (
          error instanceof UsersApiError &&
          (error.status === 403 || error.status === 404)
        ) {
          setAccountState("unprovisioned");
          return;
        }
        setAccountState("error");
      }
    };

    void checkAccount();
    return () => controller.abort();
  }, [checkAttempt, getToken]);

  if (accountState === "checking") {
    return <p className="text-sm text-[#776A6E]">A verificar sua conta...</p>;
  }

  if (accountState === "unprovisioned") return <ActivationForm />;

  if (accountState === "error") {
    return (
      <div className="w-full max-w-md rounded-[30px] border border-[#E9E0E2] bg-white p-8 text-center shadow-[0_24px_70px_rgba(36,26,29,0.08)]">
        <h1 className="font-serif text-3xl text-[#241A1D]">
          Não foi possível verificar a conta
        </h1>
        <p className="mt-3 text-sm text-[#776A6E]">
          Confirme se o backend está ativo e tente novamente.
        </p>
        <button
          type="button"
          onClick={() => setCheckAttempt((current) => current + 1)}
          className="mt-6 rounded-full bg-[#641C32] px-6 py-3 text-sm font-semibold text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const currentEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="w-full max-w-md rounded-[30px] border border-[#E9E0E2] bg-white p-8 shadow-[0_24px_70px_rgba(36,26,29,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">
        Conta já vinculada
      </p>
      <h1 className="mt-2 font-serif text-4xl text-[#241A1D]">
        Troque de conta
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#776A6E]">
        Você abriu o convite usando uma conta que já possui acesso
        {currentEmail ? ` (${currentEmail})` : ""}. O CPF não é verificado para
        contas já ativadas.
      </p>
      <div className="mt-5 rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] p-4 text-sm text-[#776A6E]">
        Saia desta conta e entre com o mesmo e-mail que recebeu o convite do RH.
      </div>
      <button
        type="button"
        disabled={isSigningOut}
        onClick={async () => {
          setIsSigningOut(true);
          await signOut({ redirectUrl: window.location.href });
        }}
        className="mt-6 w-full rounded-full bg-[#641C32] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(100,28,50,0.2)] transition hover:bg-[#7D2943] disabled:cursor-wait disabled:opacity-60"
      >
        {isSigningOut ? "A sair..." : "Sair e usar a conta convidada"}
      </button>
    </div>
  );
}

function ActivationForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("A sessão não forneceu um token de acesso.");
      await claimEmployeeInvitation(token, cpf);
      router.replace("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof UsersApiError ||
          submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível ativar o acesso.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[30px] border border-[#E9E0E2] bg-white p-8 shadow-[0_24px_70px_rgba(36,26,29,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">
        Última etapa
      </p>
      <h1 className="mt-2 font-serif text-4xl text-[#241A1D]">
        Ative seu acesso
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#776A6E]">
        Confirme o CPF informado pelo RH. Depois disso, sua conta será vinculada
        à empresa e ao Programa Líder em Ação.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
            CPF
          </span>
          <input
            required
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            value={cpf}
            onChange={(event) => setCpf(formatCpf(event.target.value))}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 outline-none transition focus:border-[#641C32] focus:ring-2 focus:ring-[#641C32]/10"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-[#FAD2CF] bg-[#FCE8E6]/50 px-4 py-3 text-sm font-semibold text-[#A50E0E]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || cpf.length !== 14}
          className="w-full rounded-full bg-[#641C32] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(100,28,50,0.2)] transition hover:bg-[#7D2943] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "A ativar..." : "Ativar e acessar programa"}
        </button>
      </form>
    </div>
  );
}

export default function ActivateAccessPage() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <main className="min-h-screen bg-[#FAF7F4] px-6 py-10">
      <div className="mx-auto mb-10 flex max-w-5xl justify-center md:justify-start">
        <BrandLogo priority className="h-[58px] max-w-[220px]" />
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        {!isLoaded ? (
          <p className="text-sm text-[#776A6E]">A preparar seu convite...</p>
        ) : !isSignedIn ? (
          <div className="space-y-5 text-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8F3651]">
                Convite corporativo
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#241A1D]">
                Crie sua conta para continuar
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[#776A6E]">
                Use o mesmo e-mail que recebeu o convite do RH.
              </p>
            </div>
            <SignUp
              routing="hash"
              forceRedirectUrl="/ativar-acesso"
              signInForceRedirectUrl="/ativar-acesso"
            />
          </div>
        ) : (
          <ActivationGate />
        )}
      </div>
    </main>
  );
}
