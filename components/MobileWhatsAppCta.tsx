"use client";

import { useEffect, useState } from "react";
import WhatsAppLink from "./WhatsAppLink";

export default function MobileWhatsAppCta({
  observedElementId,
}: {
  observedElementId: string;
}) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const observedElement = document.getElementById(observedElementId);
    if (!observedElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShouldShow(!entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElementId]);

  return (
    <WhatsAppLink
      placement="cta_fixo_mobile"
      aria-label="Falar com a especialista pelo WhatsApp"
      className={`fixed inset-x-4 bottom-4 z-40 inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-[#641C32] px-6 text-sm font-bold text-white shadow-[0_18px_42px_-12px_rgba(100,28,50,0.75)] transition-[transform,opacity] active:translate-y-px md:hidden ${
        shouldShow
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      Falar com a especialista
    </WhatsAppLink>
  );
}

