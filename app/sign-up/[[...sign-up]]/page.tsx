import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#B8CBBF] selection:text-[#1C2B23]">
      
      {/* ESQUERDA: Branding (Verde Sereno) */}
      <div className="md:w-1/2 bg-[#5F7D65] text-white p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Efeito de brilho subtil no fundo para dar profundidade */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8A9B8E] rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity relative z-10">
          <div className="w-8 h-8 bg-white text-[#5F7D65] flex items-center justify-center rounded shadow-sm font-serif font-bold text-lg">
            S
          </div>
          <span className="font-serif text-2xl tracking-tight">Sereno</span>
        </Link>

        {/* Texto Central */}
        <div className="max-w-md relative z-10 my-20">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-serif leading-[1.1] mb-6 tracking-tight">
            Cuidar de você também faz parte do trabalho.
          </h1>
          <p className="text-[#D5E0D7] text-lg leading-relaxed font-medium">
            Comece a sua jornada de desenvolvimento, inteligência emocional e bem-estar corporativo. A sua evolução começa aqui.
          </p>
        </div>

        {/* Footer */}
        <div className="text-sm font-medium text-[#B8CBBF] relative z-10">
          © 2026 Sereno • Espaço de Equilíbrio
        </div>
      </div>

      {/* DIREITA: Formulário Clerk (Registo) */}
      <div className="md:w-1/2 bg-[#F9FAF9] flex items-center justify-center p-6 lg:p-10 relative">
        {/* Podes adicionar o componente do Clerk aqui */}
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#1C2B23] hover:bg-black text-white",
              footerActionLink: "text-[#5F7D65] hover:text-[#4A6551] font-semibold"
            }
          }}
        />
      </div>

    </div>
  );
}