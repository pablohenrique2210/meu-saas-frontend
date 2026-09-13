const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "Lilian Arruda | Educação e Saúde Corporativa",
  shortName: "Lilian Arruda",
  description:
    "Consultoria, educação e saúde corporativa para prevenir riscos psicossociais, desenvolver lideranças e fortalecer equipes.",
  url: (configuredSiteUrl || "https://app.laevolui.education").replace(/\/$/, ""),
  email: "consultoria@lilianarruda.com.br",
  phoneDisplay: "(11) 9 4387-4070",
  phoneE164: "+5511943874070",
  whatsappNumber: "5511943874070",
} as const;

export const whatsappMessage =
  "Olá, gostaria de conhecer as soluções para empresas.";

export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
