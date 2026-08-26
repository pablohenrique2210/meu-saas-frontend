"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BrandLogo from "@/app/BrandLogo";
import { getMyRhAccess } from "@/lib/users-api";

export default function RhAccessBoundary({
  children,
  redirectPath,
}: {
  children: ReactNode;
  redirectPath: string;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("Validando seu acesso ao RH...");

  useEffect(() => {
    if (!isLoaded) return;
    const controller = new AbortController();

    async function validateAccess() {
      if (!isSignedIn) {
        router.replace(
          `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`,
        );
        return;
      }

      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Sessão sem token de acesso.");
        const access = await getMyRhAccess(token, controller.signal);

        if (!access.allowed) {
          router.replace("/dashboard?rh=acesso-negado");
          return;
        }

        setAllowed(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("Não foi possível validar o acesso. Tente entrar novamente.");
        window.setTimeout(
          () => router.replace("/dashboard?rh=acesso-negado"),
          1800,
        );
      }
    }

    void validateAccess();
    return () => controller.abort();
  }, [getToken, isLoaded, isSignedIn, redirectPath, router]);

  if (allowed) return children;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F4] px-6 text-center text-[#241A1D]">
      <div className="flex max-w-md flex-col items-center gap-5 rounded-3xl border border-[#E9E0E2] bg-white p-10 shadow-[0_18px_55px_rgba(100,28,50,0.08)]">
        <BrandLogo priority className="h-[58px] max-w-[220px]" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E0E2] border-t-[#641C32]" />
        <p className="text-sm text-[#776A6E]">{message}</p>
      </div>
    </main>
  );
}
