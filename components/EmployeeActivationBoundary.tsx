"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { getEmployeeActivationStatus } from "@/lib/users-api";

const protectedPrefixes = [
  "/dashboard", "/trilhas", "/aula", "/avaliacao", "/conquistas", "/perfil",
  "/rh", "/admin",
];

function requiresCorporateAccess(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Redirects a signed-in invitee back to CPF activation before protected pages load. */
export default function EmployeeActivationBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !requiresCorporateAccess(pathname)) return;
    const controller = new AbortController();

    void (async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) return;
        const status = await getEmployeeActivationStatus(token, controller.signal);
        if (status.requiresActivation) router.replace("/ativar-acesso");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          // Existing page-level handling remains responsible for backend outages.
        }
      }
    })();

    return () => controller.abort();
  }, [getToken, isLoaded, isSignedIn, pathname, router]);

  return children;
}
