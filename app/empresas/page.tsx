import React from 'react';
import Link from 'next/link';

export default function ParaEmpresas() {
  return (
    <div className="min-h-screen bg-[#F9FAF9] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white">
      
      {/* =========================================
          1. NAVBAR (Versão B2B)
          ========================================= */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-[#1C2B23] text-white p-2 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#5F7D65]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="font-serif text-2xl tracking-tight text-[#1C2B23]">Sereno <span className="text-[#8A9B8E] text-lg font-sans tracking-normal">Business</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/rh" className="text-sm font-semibold text-[#1C2B23] hover:text-[#5F7D65] transition-colors">
            Login RH
          </Link>
          <button className="bg-[#1C2B23] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#2D3A31] transition-colors shadow-sm">
            Agendar Demo
          </button>
        </div>
      </header>

      {/* =========================================
          2. HERO SECTION CORPORATIVO
          ========================================= */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Elemento visual de fundo */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#EEF3EC] rounded-l-[100px] -z-10 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#E3EBE4] px-4 py-1.5 rounded-full text-xs font-bold text-[#4A6551] mb-6 uppercase tracking-wider">
              Para Gestores e RH
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1C2B23] leading-[1.1] tracking-tight mb-6">
              Proteja o maior ativo da sua empresa: <span className="text-[#5F7D65] italic">as pessoas.</span>
            </h1>
            <p className="text-lg text-[#5C6E60] leading-relaxed mb-10 max-w-lg">
              Reduza o turnover, previna o burnout e garanta a conformidade com as normas de saúde mental no trabalho através da nossa plataforma baseada em dados e gamificação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#5F7D65] text-white px-8 py-4 rounded-full font-bold hover:bg-[#4A6551] transition-all shadow-lg shadow-[#5F7D65]/20 flex items-center justify-center gap-2">
                Falar com um Consultor
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          {/* Imagem/Mockup do Dashboard RH (Abstrato) */}
          <div className="flex-1 w-full relative">
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#E3EBE4] relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-[#F4F8F4] pb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A9B8E] uppercase tracking-wider">Score da Empresa</span>
                  <span className="font-serif text-3xl font-bold text-[#1C2B23]">78/100</span>
                </div>
                <div className="bg-[#EEF3EC] text-[#4A6551] text-xs font-bold px-3 py-1.5 rounded-md">
                  +5% este mês
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-[#F4F8F4] rounded-full w-3/4"></div>
                <div className="h-4 bg-[#F4F8F4] rounded-full w-1/2"></div>
                <div className="flex gap-2 pt-4">
                  <div className="h-20 bg-[#EEF3EC] rounded-xl flex-1 border border-[#D5E0D7]"></div>
                  <div className="h-20 bg-rose-50 rounded-xl flex-1 border border-rose-100"></div>
                  <div className="h-20 bg-[#EEF3EC] rounded-xl flex-1 border border-[#D5E0D7]"></div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-[#B8CBBF]/20 rounded-3xl blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* =========================================
          3. PROPOSTA DE VALOR (FEATURES)
          ========================================= */}
      <section className="py-24 bg-white border-t border-[#E3EBE4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl text-[#1C2B23] tracking-tight mb-4">Métricas que geram impacto real</h2>
            <p className="text-[#5C6E60] text-lg">A Sereno transforma dados comportamentais em planos de ação claros para a sua equipa de Gestão de Pessoas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[#F4F8F4] border border-[#E3EBE4]">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-[#D5E0D7] mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold text-[#1C2B23] mb-3">Mapeamento de Riscos</h3>
              <p className="text-[#5C6E60] leading-relaxed">
                Identifique departamentos em risco de burnout ou stresse antes que se torne um problema. As nossas avaliações psicossociais são baseadas em ciência.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[#F4F8F4] border border-[#E3EBE4]">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-[#D5E0D7] mb-6">
                🎓
              </div>
              <h3 className="text-xl font-bold text-[#1C2B23] mb-3">Educação e Engajamento</h3>
              <p className="text-[#5C6E60] leading-relaxed">
                Trilhas de aprendizagem curtas e gamificadas que os colaboradores realmente querem fazer. Promovemos inteligência emocional de forma acessível.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[#F4F8F4] border border-[#E3EBE4]">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-[#D5E0D7] mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-[#1C2B23] mb-3">Conformidade e ESG</h3>
              <p className="text-[#5C6E60] leading-relaxed">
                Gere relatórios automatizados para demonstrar as ações da sua empresa na proteção da saúde mental, fortalecendo a sua cultura e relatórios ESG.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          4. CALL TO ACTION FINAL
          ========================================= */}
      <section className="py-24 bg-[#1C2B23] text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl text-white mb-6">Pronto para transformar o clima da sua empresa?</h2>
          <p className="text-[#B8CBBF] text-lg mb-10">
            Junte-se às organizações que priorizam o bem-estar como estratégia de crescimento.
          </p>
          <div className="flex justify-center">
            <button className="bg-white text-[#1C2B23] px-10 py-4 rounded-full font-bold hover:bg-[#EEF3EC] transition-all flex items-center gap-2">
              Agendar uma Demonstração Gratuita
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}