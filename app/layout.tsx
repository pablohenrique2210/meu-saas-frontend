import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations/pt-BR";
import { GlobalAccountAccess } from "./AccountButton";
import { lilianClerkAppearance } from "./clerkAppearance";
import EmployeeActivationBoundary from "@/components/EmployeeActivationBoundary";
import ConsentAnalytics from "@/components/ConsentAnalytics";
import { siteConfig } from "@/lib/site-config";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: "La Evolui",
  title: {
    default: "Lilian Arruda | Saúde Corporativa",
    template: "%s | Lilian Arruda",
  },
  description:
    "Inteligência e educação corporativa para prevenir riscos psicossociais e desenvolver pessoas.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.shortName,
    title: "Lilian Arruda | Educação e Saúde Corporativa",
    description: siteConfig.description,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lilian Arruda, consultoria, educação e saúde corporativa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lilian Arruda | Educação e Saúde Corporativa",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={lilianClerkAppearance} localization={ptBR}>
      <html lang="pt-BR">
        <body
          className={`${manrope.variable} ${playfair.variable} relative bg-[#FAF7F4] font-sans antialiased`}
        >
          <EmployeeActivationBoundary>{children}</EmployeeActivationBoundary>
          <GlobalAccountAccess />
          <ConsentAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
        </body>
      </html>
    </ClerkProvider>
  );
}
