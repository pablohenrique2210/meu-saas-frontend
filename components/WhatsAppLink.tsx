"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { whatsappUrl } from "@/lib/site-config";

type AnalyticsWindow = Window & {
  gtag?: (
    command: "event",
    eventName: string,
    parameters: Record<string, string>,
  ) => void;
};

interface WhatsAppLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  children: ReactNode;
  placement: string;
  redirectAfterClick?: boolean;
}

export default function WhatsAppLink({
  children,
  placement,
  redirectAfterClick = true,
  onClick,
  ...props
}: WhatsAppLinkProps) {
  return (
    <a
      {...props}
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        (window as AnalyticsWindow).gtag?.("event", "whatsapp_click", {
          cta_position: placement,
        });

        if (redirectAfterClick) {
          window.setTimeout(() => {
            window.location.assign(
              `/obrigado?origem=${encodeURIComponent(placement)}`,
            );
          }, 250);
        }
      }}
    >
      {children}
    </a>
  );
}

