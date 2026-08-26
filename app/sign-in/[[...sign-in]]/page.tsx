import { SignIn } from "@clerk/nextjs";
import BrandLogo from "../../BrandLogo";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF7F4]">
      {/* 🌿 Lado Esquerdo - Emocional (Oculto no Mobile) */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 lg:p-24 overflow-hidden bg-[#641C32]">
        {/* Elementos Decorativos Abstratos (Luz e Natureza) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#641C32] to-[#7D2943] z-0"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#F5EFEC] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-16 w-fit animate-in drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)] fade-in slide-in-from-left-4 duration-1000">
            <BrandLogo priority className="h-[68px] max-w-[270px]" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
            Cuidar de você também
            <br />
            faz parte do trabalho.
          </h1>
          <p className="text-lg text-white/80 font-light max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
            Continue sua jornada de desenvolvimento, inteligência emocional e
            bem-estar corporativo.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm animate-in fade-in duration-1000 delay-500 fill-mode-both">
          © {new Date().getFullYear()} Lilian Arruda • Saúde Corporativa
        </div>
      </div>

      {/* 🔐 Lado Direito - Funcional (Login Clerk Customizado) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#FAF7F4] relative">
        {/* Efeito de brilho suave atrás do card */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-[#F5EFEC] to-transparent opacity-50 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-7 hidden text-center md:block">
            <h2 className="font-serif text-3xl text-[#241A1D]">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-[#776A6E]">
              Entre para continuar sua jornada de desenvolvimento.
            </p>
          </div>

          {/* Header Mobile (Aparece apenas quando o lado esquerdo é ocultado) */}
          <div className="md:hidden mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandLogo compact className="mx-auto mb-5 h-14" />
            <h1 className="text-2xl font-serif text-[#241A1D] mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-[#6B7280] text-sm">
              Acesse sua jornada de saúde mental.
            </p>
          </div>

          <SignIn
            appearance={{
              options: {
                socialButtonsPlacement: "top", // Mantém o Google em cima
                showOptionalFields: false,
              },
              elements: {
                // Removemos os fundos e estilizamos o card inteiro
                rootBox: "w-full",
                card: "bg-white shadow-2xl shadow-[#641C32]/5 border border-[#F5EFEC] rounded-2xl p-6 sm:p-8",

                // Esconde os títulos padrão do Clerk no mobile (já criamos os nossos acima)
                headerTitle: "hidden",
                headerSubtitle: "hidden",

                // Botão do Google Clean e Elegante
                socialButtonsBlockButton:
                  "border border-gray-200 bg-white hover:bg-[#F5EFEC]/50 text-gray-700 font-medium rounded-xl py-3.5 transition-all duration-300 hover:border-[#641C32]/30",
                socialButtonsBlockButtonText: "font-medium",

                // Divisor "ou"
                dividerLine: "bg-gray-100",
                dividerText: "text-[#6B7280] text-xs font-medium",

                // Inputs do formulário (Highlight verde no foco)
                formFieldLabel: "text-[#6B7280] font-medium mb-1.5 text-sm",
                formFieldInput:
                  "w-full rounded-xl border-gray-200 bg-[#FAF7F4] px-4 py-3.5 text-gray-900 focus:bg-white focus:border-[#641C32] focus:ring-2 focus:ring-[#641C32]/20 transition-all duration-300 outline-none placeholder:text-gray-400",

                // Botão "Continuar" com elevação
                formButtonPrimary:
                  "w-full bg-[#641C32] hover:bg-[#7D2943] text-white text-sm font-medium rounded-xl py-3.5 mt-2 transition-all duration-300 shadow-md shadow-[#641C32]/20 hover:shadow-lg hover:-translate-y-0.5",

                // Rodapé (Criar conta)
                footerActionText: "text-[#6B7280]",
                footerActionLink:
                  "text-[#641C32] hover:text-[#7D2943] font-semibold transition-colors",

                // Modos de edição (caso a pessoa troque de email)
                identityPreviewText: "text-gray-700 font-medium",
                identityPreviewEditButtonIcon:
                  "text-[#641C32] hover:text-[#7D2943]",

                // Mensagens de erro mais suaves
                formFieldErrorText: "text-red-500 text-xs mt-1 font-medium",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
