"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const STORAGE_KEY = "laevolui:analytics-consent";

type Consent = "accepted" | "rejected" | null;

export default function ConsentAnalytics({
  measurementId,
}: {
  measurementId?: string;
}) {
  const [consent, setConsent] = useState<Consent>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedConsent = window.localStorage.getItem(STORAGE_KEY);
      if (savedConsent === "accepted" || savedConsent === "rejected") {
        setConsent(savedConsent);
      }
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!measurementId || !isReady) return null;

  function saveConsent(nextConsent: Exclude<Consent, null>) {
    window.localStorage.setItem(STORAGE_KEY, nextConsent);
    setConsent(nextConsent);
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {consent === null && (
        <aside
          role="dialog"
          aria-label="Preferências de privacidade"
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-[#E9E0E2] bg-white p-5 text-[#241A1D] shadow-[0_24px_70px_-24px_rgba(36,26,29,0.45)] sm:flex sm:items-center sm:gap-6 sm:p-6"
        >
          <p className="text-sm leading-6 text-[#5F5357]">
            Usamos dados de navegação apenas com sua autorização para entender
            o uso do site e melhorar a experiência. Saiba mais na{" "}
            <Link
              href="/politica-de-privacidade"
              className="font-bold text-[#641C32] underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
            <button
              type="button"
              onClick={() => saveConsent("rejected")}
              className="rounded-full border border-[#CDBFC3] px-4 py-2.5 text-sm font-bold text-[#4A3D41] hover:bg-[#F5EFEC] active:translate-y-px"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => saveConsent("accepted")}
              className="rounded-full bg-[#641C32] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7D2943] active:translate-y-px"
            >
              Aceitar
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
