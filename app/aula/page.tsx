'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const modulos = [
  { id: 1, title: "O que é Inteligência Emocional?", duration: "12 min", status: "completed" },
  { id: 2, title: "Identificando os teus Gatilhos", duration: "15 min", status: "current" },
  { id: 3, title: "Técnicas de Regulação Rápida", duration: "10 min", status: "locked" },
  { id: 4, title: "Comunicação sob Pressão", duration: "18 min", status: "locked" },
];

export default function TelaDeAula() {
  // --- STATES (Memória da Tela) ---
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  
  // 👇 NOVOS ESTADOS: Controle da Interface
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCompleteLesson = () => {
    setIsCompleted(true);
  };

  return (
    <div className="flex h-screen bg-[#F4F8F4] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white overflow-hidden">
      
      {/* =========================================
          1. SIDEBAR (Agora com opção de recolher)
          ========================================= */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-[#E3EBE4] z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out
          ${isSidebarOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden'}`}
      >
        <div className="w-80 h-full flex flex-col"> {/* Wrapper fixo para não esmagar o conteúdo ao fechar */}
          <div className="p-6 border-b border-[#F4F8F4]">
            <Link href="/trilhas" className="text-sm font-bold text-[#8A9B8E] hover:text-[#5F7D65] transition-colors flex items-center gap-2 mb-6 w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Voltar às Trilhas
            </Link>
            <h2 className="font-serif text-2xl text-[#1C2B23] leading-tight">Inteligência Emocional</h2>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-[#5C6E60] mb-2 uppercase tracking-wider">
                <span>Progresso</span><span>25%</span>
              </div>
              <div className="w-full bg-[#E3EBE4] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#5F7D65] h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {modulos.map((modulo, index) => (
              <div key={modulo.id} className={`p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 ${modulo.status === 'current' ? 'bg-[#EEF3EC] border border-[#D5E0D7] shadow-sm scale-[1.02]' : modulo.status === 'locked' ? 'opacity-50 grayscale' : 'hover:bg-[#F9FAF9] cursor-pointer'}`}>
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${modulo.status === 'completed' ? 'bg-[#5F7D65] border-[#5F7D65] text-white' : modulo.status === 'current' ? 'border-[#5F7D65] bg-white text-[#5F7D65]' : 'border-[#D5E0D7] bg-transparent text-[#D5E0D7]'}`}>
                  {modulo.status === 'completed' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  {modulo.status === 'current' && <div className="w-2 h-2 rounded-full bg-[#5F7D65] animate-pulse"></div>}
                  {modulo.status === 'locked' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                </div>
                <div>
                  <p className={`text-xs font-bold mb-1 ${modulo.status === 'current' ? 'text-[#5F7D65]' : 'text-[#8A9B8E]'}`}>AULA {index + 1}</p>
                  <h3 className={`text-sm font-medium leading-snug ${modulo.status === 'current' ? 'text-[#1C2B23] font-bold' : 'text-[#5C6E60]'}`}>{modulo.title}</h3>
                  <p className="text-xs text-[#8A9B8E] mt-1">{modulo.duration}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-[#F4F8F4] bg-white flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-bold border border-orange-100">
              <span>🔥</span> 5 dias
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EEF3EC] text-[#5F7D65] rounded-full text-sm font-bold border border-[#D5E0D7]">
              <span>💚</span> 1.250 XP
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          2. ÁREA PRINCIPAL
          ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        
        {/* Header Global (Com Botão de Toggle da Sidebar) */}
        <header className="sticky top-0 bg-[#F4F8F4]/80 backdrop-blur-md z-30 px-8 py-5 flex items-center justify-between border-b border-[#E3EBE4]/50">
          <div className="flex items-center gap-4">
             {/* 👇 BOTÃO DE RECOLHER/EXPANDIR A SIDEBAR */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#E3EBE4] transition-colors text-[#5C6E60]"
               title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 {isSidebarOpen ? <path d="M9 18l-6-6 6-6M21 18l-6-6 6-6"/> : <path d="M15 18l6-6-6-6M3 18l6-6-6-6"/>}
               </svg>
             </button>
             
             <span className="text-xs font-bold text-[#8A9B8E] uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-[#E3EBE4]">Aula 2 de 4</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-[#5C6E60]">15 min restantes</span>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A9B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full px-6 md:px-12 pt-8 pb-32">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1C2B23] mb-6 tracking-tight">Identificando os teus Gatilhos</h1>

          {/* =========================================
              🎬 PLAYER DE VÍDEO (Com Lógica de Tela Cheia)
              ========================================= */}
          <div 
            className={`transition-all duration-500 bg-gradient-to-br from-[#1C2B23] to-[#2D3A31] overflow-hidden group cursor-pointer border border-[#4A6551]/30 flex items-center justify-center
              ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' : 'w-full aspect-video rounded-[2rem] relative shadow-[0_20px_50px_rgb(95,125,101,0.15)] mb-10'}`}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium border border-white/10">
                Retomar: 04:12 / 15:00
              </div>
              
              {/* 👇 BOTÃO DE TELA CHEIA (FULLSCREEN) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Evita dar play no vídeo acidentalmente
                  setIsFullscreen(!isFullscreen);
                }}
                className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/20 transition-colors border border-white/10"
                title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isFullscreen ? (
                    <> <polyline points="8 3 8 8 3 8"/> <polyline points="16 3 16 8 21 8"/> <polyline points="8 21 8 16 3 16"/> <polyline points="16 21 16 16 21 16"/> </>
                  ) : (
                    <> <polyline points="15 3 21 3 21 9"/> <polyline points="9 21 3 21 3 15"/> <line x1="21" y1="3" x2="14" y2="10"/> <line x1="3" y1="21" x2="10" y2="14"/> </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* ... (O restante do conteúdo abaixo do player continua exatamente igual) ... */}
          
          <div className="bg-white border border-[#E3EBE4] rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#F59E0B]"></div>
             <h3 className="text-lg font-bold text-[#1C2B23] mb-2 flex items-center gap-2"><span className="text-[#F59E0B]">⚡</span> Verificação Rápida</h3>
             <p className="text-[#5C6E60] mb-6">Segundo o vídeo, qual é a primeira reação física comum quando um gatilho emocional é ativado?</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {[
                 { id: 1, text: "Aumento da frequência cardíaca", correct: true },
                 { id: 2, text: "Vontade de dormir", correct: false }
               ].map((option) => (
                 <button 
                   key={option.id} onClick={() => setQuizAnswered(option.id)}
                   className={`p-4 rounded-xl border text-left font-medium transition-all duration-300 ${quizAnswered === option.id ? (option.correct ? 'bg-[#EEF3EC] border-[#5F7D65] text-[#1C2B23]' : 'bg-rose-50 border-rose-300 text-rose-900') : 'bg-[#F9FAF9] border-[#D5E0D7] text-[#5C6E60] hover:border-[#8A9B8E]'}`}
                 >
                   {option.text}
                 </button>
               ))}
             </div>
             {quizAnswered === 1 && (
               <div className="mt-4 text-sm font-bold text-[#5F7D65] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                 <span>🎉</span> Excelente! Estás a prestar atenção aos detalhes.
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-[#E3EBE4] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#EEF3EC] text-[#5F7D65] rounded-xl flex items-center justify-center text-xl mb-4">🧠</div>
              <h3 className="font-bold text-[#1C2B23] mb-3">Resumo da Aula</h3>
              <p className="text-sm text-[#5C6E60] leading-relaxed">Nesta aula, exploramos como o nosso cérebro reage ao estresse corporativo. Identificar o gatilho é o passo número um antes de tentar aplicar qualquer técnica de relaxamento.</p>
            </div>
            <div className="bg-[#FFF6F5] p-6 rounded-3xl border border-[#FFE4E1] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-white text-rose-500 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm border border-[#FFE4E1]">❗</div>
              <h3 className="font-bold text-rose-900 mb-3">Sinais de Alerta (Burnout)</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-rose-700/80"><span className="text-rose-400 mt-0.5">•</span> Irritabilidade repentina com os colegas.</li>
                <li className="flex items-start gap-2 text-sm text-rose-700/80"><span className="text-rose-400 mt-0.5">•</span> Sensação de "nevoeiro mental" após as 15h.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* =========================================
            3. BARRA DE AÇÃO FLUTUANTE
            ========================================= */}
        <div className={`fixed bottom-0 right-0 bg-white border-t border-[#E3EBE4] p-4 md:p-6 px-6 md:px-12 flex items-center justify-between z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] transition-all duration-500
          ${isSidebarOpen ? 'left-0 lg:left-80' : 'left-0'}`}>
          <button className="text-sm font-bold text-[#8A9B8E] hover:text-[#2D3A31] transition-colors bg-[#F9FAF9] px-6 py-3 rounded-full border border-[#E3EBE4]">Rever conteúdo</button>
          {!isCompleted ? (
            <button onClick={handleCompleteLesson} className="bg-[#5F7D65] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#4A6551] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#5F7D65]/20 flex items-center gap-2">
              Marcar como Concluída <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
          ) : (
            <div className="flex items-center gap-4 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="hidden sm:flex items-center gap-2 bg-[#EEF3EC] text-[#4A6551] px-4 py-2 rounded-full font-bold border border-[#D5E0D7]"><span>🎉</span> +50 XP Ganho!</div>
              <button className="bg-[#1C2B23] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black hover:-translate-y-0.5 transition-all shadow-xl shadow-black/10 flex items-center gap-2">
                Próxima Aula <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}