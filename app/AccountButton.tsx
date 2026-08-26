"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { lilianClerkAppearance } from "./clerkAppearance";

type AccountButtonProps = {
  showName?: boolean;
};

export function AccountButton({ showName = false }: AccountButtonProps) {
  return (
    <>
      <ClerkLoading>
        <div
          aria-label="Carregando perfil"
          className="h-10 w-10 animate-pulse rounded-full bg-[#E9E0E2]"
        />
      </ClerkLoading>
      <ClerkLoaded>
        <UserButton
          showName={showName}
          userProfileMode="navigation"
          userProfileUrl="/perfil"
          appearance={lilianClerkAppearance}
        />
      </ClerkLoaded>
    </>
  );
}

const routesWithInlineAccountAccess = [
  "/",
  "/dashboard",
  "/perfil",
  "/sign-in",
  "/sign-up",
];

export function GlobalAccountAccess() {
  const pathname = usePathname();
  const hasInlineAccess = routesWithInlineAccountAccess.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

  if (hasInlineAccess) return null;

  return (
    <div className="fixed right-6 top-6 z-50 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-lg backdrop-blur-md">
      <AccountButton />
    </div>
  );
}
