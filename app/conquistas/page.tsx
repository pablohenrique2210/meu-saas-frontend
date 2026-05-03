import React from 'react';
import Link from 'next/link';

// 1. BANCO DE DADOS FALSO (Mock Data) de Medalhas
const conquistas = [
  { id: 1, name: 'Primeiro Passo', desc: 'Concluíste a tua primeira aula.', icon: '🌱', unlocked: true },
  { id: 2, name: 'Mente Focada', desc: 'Atingiste um streak de 3 dias seguidos.', icon: '🔥', unlocked: true },
  { id: 3, name: 'Sábio do Stress', desc: 'Concluíste a trilha de Inteligência Emocional.', icon: '🧠', unlocked: true },
  { id: 4, name: 'Voz Ativa', desc: 'Concluíste o curso de Comunicação Não Violenta.', icon: '💬', unlocked: false },
  { id: 5, name: 'Hábito Saudável', desc: 'Atingiste um streak de 14 dias seguidos.', icon: '📅', unlocked: false },
  { id: 6, name: 'Mestre Sereno', desc: 'Completaste todas as avaliações do trimestre.', icon: '👑', unlocked: false },
  { id: 7, name: 'Guardião da Paz', desc: 'Ajudaste a manter o score da equipa alto.', icon: '🛡️', unlocked: false },
  { id: 8, name: 'Foco Inabalável', desc: 'Concluíste a trilha de Gestão de Tempo.', icon: '⏳', unlocked: false },
];

export default function TelaDeConquistas() {
  return (
    <div className="min-h-screen bg-[#F4F8F4] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white pb-20">
      
      {/* =========================================
          1. CABEÇALHO E NAVEGAÇÃO
          ========================================= */}
      <header className="px-6 pt-12 pb-6 max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-sm font-medium text-[#8A9B8E] hover:text-[#5F7D65] transition-colors flex items-center gap-2 mb-6 w-fit">
          ← Voltar ao Meu Espaço
        </Link>
        <h1 className="font-serif text-4xl text-[#1C2B23] tracking-tight mb-2">As Tuas Conquistas</h1>
        <p className="text-lg text-[#5C6E60]">Acompanha a tua evolução e celebra cada passo rumo ao bem-estar.</p>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* =========================================
            2. PAINEL DE DESTAQUE (STREAK E XP)
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card: Streak Atual */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#5F7D65] to-[#4A6551] rounded-3xl p-8 text-white shadow-[0_12px_30px_rgb(95,125,101,0.2)] relative overflow-hidden flex items-center justify-between">
            {/* Efeito visual de fundo */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-[#B8CBBF] font-bold uppercase tracking-widest text-sm mb-2">Ofensiva Atual</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-serif text-6xl font-bold">5</span>
                <span className="text-xl text-[#D5E0D7] font-medium">dias seguidos</span>
              </div>
              <p className="text-sm text-[#E3EBE4] max-w-sm">
                Estás no caminho certo! Faltam apenas 2 dias para desbloqueares a medalha de "Foco Semanal".
              </p>
            </div>
            
            {/* Ícone de Fogo Grande */}
            <div className="relative z-10 hidden sm:flex w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-6xl shadow-inner">
              🔥
            </div>
          </div>

          {/* Card: Total de XP */}
          <div className="bg-white rounded-3xl p-8 border border-[#E3EBE4] shadow-[0_8px_30px_rgb(95,125,101,0.04)] flex flex-col justify-center items-center text-center">
            <h3 className="text-[#8A9B8E] font-bold uppercase tracking-widest text-sm mb-4">Experiência Total</h3>
            <div className="w-20 h-20 bg-[#EEF3EC] rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-[#D5E0D7] mb-4">
              💚
            </div>
            <span className="font-serif text-4xl text-[#1C2B23] font-bold mb-1">1.250</span>
            <span className="text-sm font-bold text-[#5F7D65]">XP Acumulado</span>
          </div>

        </div>

        {/* =========================================
            3. GRELHA DE MEDALHAS (BADGES)
            ========================================= */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-[#E3EBE4] pb-4">
            <h2 className="font-serif text-2xl text-[#1C2B23]">Mural de Medalhas</h2>
            <span className="text-sm font-bold text-[#8A9B8E]">3 de 8 desbloqueadas</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {conquistas.map((conquista) => (
              <div 
                key={conquista.id} 
                className={`p-6 rounded-3xl flex flex-col items-center text-center transition-all duration-300
                  ${conquista.unlocked 
                    ? 'bg-white border border-[#E3EBE4] shadow-[0_8px_20px_rgb(95,125,101,0.06)] hover:-translate-y-1' 
                    : 'bg-transparent border border-dashed border-[#D5E0D7] opacity-60 grayscale'
                  }`}
              >
                {/* Ícone da Medalha */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner
                  ${conquista.unlocked ? 'bg-[#EEF3EC] border border-[#D5E0D7]' : 'bg-slate-100'}`}
                >
                  {conquista.unlocked ? conquista.icon : '🔒'}
                </div>
                
                <h3 className={`font-bold mb-2 leading-tight ${conquista.unlocked ? 'text-[#1C2B23]' : 'text-[#8A9B8E]'}`}>
                  {conquista.name}
                </h3>
                
                <p className={`text-xs ${conquista.unlocked ? 'text-[#5C6E60]' : 'text-[#8A9B8E]'}`}>
                  {conquista.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}