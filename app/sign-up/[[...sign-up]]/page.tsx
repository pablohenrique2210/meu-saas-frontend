import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import BrandLogo from "../../BrandLogo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#DED4D7] selection:text-[#241A1D]">
      {/* ESQUERDA: Branding Lilian Arruda */}
      <div className="md:w-1/2 bg-[#641C32] text-white p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Efeito de brilho subtil no fundo para dar profundidade */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#776A6E] rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none" />

        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 w-fit drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)] transition-transform hover:-translate-y-0.5"
        >
          <BrandLogo priority className="h-[68px] max-w-[270px]" />
        </Link>

        {/* Texto Central */}
        <div className="max-w-md relative z-10 my-20">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-serif leading-[1.1] mb-6 tracking-tight">
            Cuidar de você também faz parte do trabalho.
          </h1>
          <p className="text-[#E9E0E2] text-lg leading-relaxed font-medium">
            Comece a sua jornada de desenvolvimento, inteligência emocional e
            bem-estar corporativo. A sua evolução começa aqui.
          </p>
        </div>

        {/* Footer */}
        <div className="text-sm font-medium text-[#DED4D7] relative z-10">
          © 2026 Lilian Arruda • Saúde Corporativa
        </div>
      </div>

      {/* DIREITA: Formulário Clerk (Registo) */}
      <div className="md:w-1/2 bg-[#FAF7F4] flex items-center justify-center p-6 lg:p-10 relative">
        {/* Podes adicionar o componente do Clerk aqui */}
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#241A1D] hover:bg-black text-white",
              footerActionLink:
                "text-[#641C32] hover:text-[#7D2943] font-semibold",
            },
          }}
        />
      </div>
    </div>
  );
}
