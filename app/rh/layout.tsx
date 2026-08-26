import type { ReactNode } from "react";
import RhAccessBoundary from "@/components/RhAccessBoundary";

export default function RhLayout({ children }: { children: ReactNode }) {
  return <RhAccessBoundary redirectPath="/rh">{children}</RhAccessBoundary>;
}
