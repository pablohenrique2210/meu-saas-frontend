import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={`${inter.variable} ${playfair.variable} font-sans relative bg-[#F9FAF9]`}>
          
          {/* O site carrega instantaneamente no servidor (Zero Piscar!) */}
          {children}

          {/* Ocultamos apenas o botão de perfil enquanto o Clerk verifica o login */}
          <div className="fixed top-6 right-8 z-50">
            <ClerkLoading>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            </ClerkLoading>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </div>

        </body>
      </html>
    </ClerkProvider>
  );
}