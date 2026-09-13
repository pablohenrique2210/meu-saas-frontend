import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/empresas", "/politica-de-privacidade"],
      disallow: [
        "/admin/",
        "/api/",
        "/ativar-acesso/",
        "/aula/",
        "/avaliacao/",
        "/conquistas/",
        "/dashboard/",
        "/obrigado/",
        "/perfil/",
        "/rh/",
        "/sign-in/",
        "/sign-up/",
        "/trilhas/",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

