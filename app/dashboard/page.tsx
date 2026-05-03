import React from 'react';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardColaborador() {
  // =========================================
  // LÓGICA DE AUTENTICAÇÃO E BACKEND
  // =========================================
  const { getToken, userId } = await auth();
  const user = await currentUser();

  // Proteção: Se não estiver logado, atira para o login
  if (!userId || !user) {
    redirect('/sign-in');
  }

  const token = await getToken();
  
  // Tentativa de comunicação com o Backend NestJS
  let companies = [];
  let backendStatus = "Aguardando conexão...";

  try {
    const response = await fetch("http://localhost:3333/companies", {
      headers: {
        Authorization: `Bearer ${token}`, // Enviando o passaporte!
      },
      cache: "no-store",
    });

    if (response.ok) {
      companies = await response.json();
      backendStatus = "✅ Conectado com sucesso!";
    } else {
      backendStatus = `❌ Bloqueado: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    backendStatus = "⚠️ Backend desligado ou inacessível (Verifica o NestJS).";
  }

  // =========================================
  // INTERFACE PREMIUM
  // =========================================
  return (
    <div className="flex h-screen bg-[#F4F8F4] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white">
      
      {/* 1. MENU LATERAL (Sidebar) */}
      <aside className="w-72 bg-white border-r border-[#E3EBE4] p-8 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <Link href="/" className="flex items-center gap-3 mb-12 group">
          <div className="bg-[#5F7D65] text-white p-2 rounded-full flex items-center justify-center group-hover:bg-[#4A6551] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="font-serif text-3xl tracking-tight text-[#1C2B23]">Sereno</span>
        </Link>
        
        <nav className="flex flex-col space-y-3 font-medium flex-1">
          <Link href="/dashboard" className="text-[#1C2B23] bg-[#EEF3EC] px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm border border-[#D5E0D7]">
            <span className="text-[#5F7D65]">🏠</span> Meu Espaço
          </Link>
          <Link href="/trilhas" className="text-[#5C6E60] hover:bg-[#F9FAF9] hover:text-[#1C2B23] px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-colors">
            <span className="opacity-70">📚</span> Trilhas de Estudo
          </Link>
          <Link href="/avaliacao" className="text-[#5C6E60] hover:bg-[#F9FAF9] hover:text-[#1C2B23] px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-colors">
            <span className="opacity-70">📝</span> Avaliações
          </Link>
          <Link href="/rh" className="text-[#5C6E60] hover:bg-[#F9FAF9] hover:text-[#1C2B23] px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-colors mt-auto border border-dashed border-[#D5E0D7]">
            <span className="opacity-70">👔</span> Visão do RH (Teste)
          </Link>
        </nav>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-10 md:p-16 overflow-y-auto">
        
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
          <div>
            {/* Nome Dinâmico vindo do Clerk */}
            <h2 className="font-serif text-4xl text-[#1C2B23] tracking-tight mb-2">
              Olá, {user.firstName || 'Colaborador'}.
            </h2>
            <p className="text-lg text-[#5C6E60]">Que bom ter-te de volta ao teu espaço de equilíbrio.</p>
          </div>
          
          <div className="bg-white border border-[#D5E0D7] px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm">
            <span className="text-[#5F7D65] text-lg">🔥</span>
            <span className="font-bold text-[#1C2B23]">5 dias</span>
            <span className="text-sm font-medium text-[#8A9B8E]">de foco contínuo</span>
          </div>
        </header>

        {/* Indicadores Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Avaliação */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(95,125,101,0.06)] border border-[#E3EBE4] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#EEF3EC] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-[#8A9B8E] text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Estado Mental</h3>
            <p className="font-serif text-3xl text-[#1C2B23] relative z-10 mb-1">Sereno</p>
            <p className="text-sm text-[#5F7D65] font-medium relative z-10 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#5F7D65]"></span> Baixo risco
            </p>
          </div>
          
          {/* Card 2: Progresso */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(95,125,101,0.06)] border border-[#E3EBE4]">
            <h3 className="text-[#8A9B8E] text-xs font-bold uppercase tracking-widest mb-4">Cursos Concluídos</h3>
            <p className="font-serif text-3xl text-[#1C2B23] mb-4">3 de 10</p>
            <div className="w-full bg-[#E3EBE4] rounded-full h-2 overflow-hidden">
              <div className="bg-[#5F7D65] h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          
          {/* Card 3: Ação Rápida */}
          <div className="bg-[#5F7D65] p-8 rounded-3xl shadow-[0_12px_30px_rgb(95,125,101,0.2)] text-white flex flex-col justify-between">
            <div>
              <h3 className="text-[#B8CBBF] text-xs font-bold uppercase tracking-widest mb-2">Próximo Passo</h3>
              <p className="font-serif text-2xl mb-1">Avaliação Mensal</p>
            </div>
            <Link href="/avaliacao" className="inline-flex items-center gap-2 text-sm font-bold hover:text-[#EEF3EC] transition-colors mt-4">
              Realizar agora <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        {/* Trilha de Aprendizado Destacada */}
        <section className="mb-12">
           <h3 className="font-serif text-2xl text-[#1C2B23] mb-6">Continuar a tua jornada</h3>
           <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(95,125,101,0.06)] border border-[#E3EBE4] flex flex-col md:flex-row justify-between items-center gap-6 transform transition-transform hover:-translate-y-1 duration-300">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-[#EEF3EC] flex items-center justify-center text-3xl shadow-inner border border-[#D5E0D7]">
                 🧠
               </div>
               <div>
                 <h4 className="font-serif text-2xl text-[#1C2B23] mb-1">Inteligência Emocional</h4>
                 <p className="text-[#5C6E60] font-medium">Aula 2: Identificando gatilhos no trabalho</p>
               </div>
             </div>
             <Link href="/aula" className="w-full md:w-auto bg-[#F9FAF9] border border-[#D5E0D7] text-[#2D3A31] px-8 py-3.5 rounded-full font-semibold hover:bg-[#EEF3EC] hover:border-[#B8CBBF] transition-all flex items-center justify-center gap-2">
               Retomar aula
             </Link>
           </div>
        </section>

        {/* =========================================
            3. CAIXA DE DIAGNÓSTICO DO BACKEND
            ========================================= */}
        {/*<div className="bg-[#1C2B23] p-6 rounded-2xl border border-[#2D3A31] text-sm font-mono mt-8">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${backendStatus.includes('✅') ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-[#B8CBBF] font-bold">Diagnóstico de Conexão com o NestJS</span>
          </div>
          <p className="text-white mb-2">Status: <span className={backendStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>{backendStatus}</span></p>
          <p className="text-[#8A9B8E]">Dados recebidos da rota /companies:</p>
          <pre className="bg-black/50 p-4 rounded-xl text-green-400 mt-2 overflow-x-auto">
            {JSON.stringify(companies, null, 2)}
          </pre>
        </div>*/}

      </main>
    </div>
  );
}