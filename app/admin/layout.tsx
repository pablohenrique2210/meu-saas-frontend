import type { ReactNode } from "react";
import RhAccessBoundary from "@/components/RhAccessBoundary";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RhAccessBoundary redirectPath="/admin/cursos">
      {children}
    </RhAccessBoundary>
  );
}
