import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations/pt-BR";
import { GlobalAccountAccess } from "./AccountButton";
import { lilianClerkAppearance } from "./clerkAppearance";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Lilian Arruda | Saúde Corporativa",
    template: "%s | Lilian Arruda",
  },
  description:
    "Inteligência e educação corporativa para prevenir riscos psicossociais e desenvolver pessoas.",
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
          {children}
          <GlobalAccountAccess />
        </body>
      </html>
    </ClerkProvider>
  );
}
