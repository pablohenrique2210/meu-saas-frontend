'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// --- BANCO DE DADOS FALSO (Com estilos visuais integrados) ---
const trilhas = [
  {
    id: 1,
    title: 'Inteligência Emocional',
    subtitle: 'Liderar de dentro para fora',
    author: 'Dra. Sofia Almeida',
    duration: '45 min',
    lessons: 3,
    progress: 66,
    status: 'em_andamento',
    xp: 120,
    // Cores calmas e premium para a capa (Gradiente)
    gradient: 'from-[#5F7D65] to-[#8A9B8E]',
    tag: 'Recomendado'
  },
  {
    id: 2,
    title: 'Gestão de Tempo e Foco',
    subtitle: 'Reduz a sobrecarga diária',
    author: 'Prof. Carlos Mendes',
    duration: '1h 10 min',
    lessons: 4,
    progress: 100,
    status: 'concluido',
    xp: 350,
    gradient: 'from-[#7C8B99] to-[#A6B5C2]', // Azul suave/Cinza
    tag: 'Concluído'
  },
  {
    id: 3,
    title: 'Comunicação Empática',
    subtitle: 'Construir relações de confiança',
    author: 'Mariana Costa',
    duration: '50 min',
    lessons: 4,
    progress: 0,
    status: 'nao_iniciado',
    xp: 200,
    gradient: 'from-[#D4A373] to-[#E9C46A]', // Areia/Amarelo suave
    tag: 'Novo'
  },
  {
    id: 4,
    title: 'Prevenção de Burnout',
    subtitle: 'Sinais, limites e recuperação',
    author: 'Dr. João Silva',
    duration: '1h 20 min',
    lessons: 5,
    progress: 0,
    status: 'nao_iniciado',
    xp: 400,
    gradient: 'from-[#B68CB8] to-[#D5B8D5]', // Roxo/Lilás muito suave
    tag: 'Em Alta'
  }
];

export default function TrilhasPremium() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Lógica de filtragem
  const trilhasFiltradas = trilhas.filter((trilha) => {
    const matchesFilter = activeFilter === 'todos' || trilha.status === activeFilter;
    const matchesSearch = trilha.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const emAndamento = trilhas.filter(t => t.status === 'em_andamento');

  return (
    <div className="min-h-screen bg-[#F4F8F4] font-sans text-[#2D3A31] selection:bg-[#5F7D65] selection:text-white pb-32">
      
      {/* =========================================
          1. HEADER PREMIUM
          ========================================= */}
      <header className="bg-white border-b border-[#E3EBE4] pt-12 pb-10 px-6 lg:px-12 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          
          <div className="flex-1">
            <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-[#8A9B8E] hover:text-[#5F7D65] transition-colors flex items-center gap-2 mb-4 w-fit">
              ← Voltar ao Espaço
            </Link>
            <h1 className="font-serif text-4xl lg:text-5xl text-[#1C2B23] tracking-tight mb-2">Sua jornada de aprendizado</h1>
            <p className="text-lg text-[#5C6E60]">Desenvolva habilidades para uma vida profissional mais saudável.</p>
          </div>

          {/* Campo de Busca */}
          <div className="w-full md:w-80 relative">
            <input 
              type="text" 
              placeholder="O que procuras hoje?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F9FAF9] border border-[#E3EBE4] rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#5F7D65] focus:ring-1 focus:ring-[#5F7D65] transition-all placeholder:text-[#8A9B8E]"
            />
            <svg className="absolute left-4 top-3.5 text-[#8A9B8E]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        {/* Filtros (Pills) */}
        <div className="max-w-7xl mx-auto mt-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['todos', 'em_andamento', 'nao_iniciado', 'concluido'].map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                ${activeFilter === filter 
                  ? 'bg-[#1C2B23] text-white shadow-md' 
                  : 'bg-[#EEF3EC] text-[#5C6E60] hover:bg-[#E3EBE4] hover:text-[#1C2B23]'}`}
            >
              {filter === 'todos' ? 'Todos os Módulos' : 
               filter === 'em_andamento' ? 'Em Andamento' : 
               filter === 'nao_iniciado' ? 'Novos' : 'Concluídos'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 space-y-16">

        {/* =========================================
            2. SECÇÃO: CONTINUE DE ONDE PAROU
            ========================================= */}
        {emAndamento.length > 0 && activeFilter === 'todos' && searchQuery === '' && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="font-serif text-3xl text-[#1C2B23] mb-6 flex items-center gap-3">
              <span className="text-[#5F7D65]">▶</span> Continue a sua evolução
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {emAndamento.map((curso) => (
                <CourseCard key={curso.id} curso={curso} isMain />
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            3. SECÇÃO: CATÁLOGO GERAL (Grelha)
            ========================================= */}
        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl text-[#1C2B23]">
              {activeFilter === 'todos' ? 'Recomendados para ti' : 'Resultados'}
            </h2>
            <span className="text-sm font-bold text-[#8A9B8E]">{trilhasFiltradas.length} cursos</span>
          </div>

          {trilhasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {trilhasFiltradas.map((curso) => (
                <CourseCard key={curso.id} curso={curso} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center bg-white rounded-3xl border border-[#E3EBE4]">
               <span className="text-5xl mb-4 opacity-50">🍃</span>
               <h3 className="font-serif text-2xl text-[#1C2B23] mb-2">Nenhum curso encontrado</h3>
               <p className="text-[#5C6E60]">Tenta ajustar a tua pesquisa ou os filtros.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

// =========================================
// COMPONENTE ISOLADO: CARTÃO DE CURSO
// (Estilo Netflix / Masterclass)
// =========================================
function CourseCard({ curso, isMain = false }: { curso: any, isMain?: boolean }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] border border-[#E3EBE4] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(95,125,101,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full">
      
      {/* 🎨 TOPO: Capa Editorial (Estilo Masterclass) */}
      <div className={`relative w-full bg-gradient-to-br ${curso.gradient} p-6 flex flex-col justify-between overflow-hidden
        ${isMain ? 'aspect-[4/3] md:aspect-video' : 'aspect-[4/5] sm:aspect-square'}`}
      >
        {/* Textura de ruído / Overlay para dar o aspeto premium */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay opacity-50 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Badges de Topo */}
        <div className="relative z-10 flex justify-between items-start">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
            {curso.tag}
          </span>
          {curso.status === 'concluido' && (
            <div className="bg-white text-[#5F7D65] w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
          )}
        </div>

        {/* Títulos Grandes (Editorial) */}
        <div className="relative z-10 mt-auto transform group-hover:translate-y-[-4px] transition-transform duration-500">
          <p className="text-white/80 font-medium text-xs md:text-sm mb-1">{curso.subtitle}</p>
          <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-2 text-shadow-sm">
            {curso.title}
          </h3>
          <p className="text-white/90 text-xs md:text-sm font-semibold flex items-center gap-2">
            <span className="w-4 h-0.5 bg-white/50 rounded-full"></span> {curso.author}
          </p>
        </div>
        
        {/* Botão Play Hover (Aparece ao passar o rato) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      {/* 🧾 INFERIOR: Informações e Gamificação */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        
        {/* Metadados da Aula */}
        <div className="flex items-center gap-3 text-xs font-bold text-[#8A9B8E] uppercase tracking-wider mb-5">
          <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {curso.duration}</span>
          <span>•</span>
          <span>{curso.lessons} Aulas</span>
        </div>

        {/* Área de Progresso e Ação */}
        <div className="mt-auto">
          {curso.status === 'em_andamento' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#1C2B23]">
                <span>A continuar...</span>
                <span className="text-[#5F7D65]">{curso.progress}%</span>
              </div>
              <div className="w-full bg-[#EEF3EC] rounded-full h-2 overflow-hidden relative">
                <div className="bg-[#5F7D65] h-full rounded-full transition-all duration-1000" style={{ width: `${curso.progress}%` }}></div>
              </div>
            </div>
          ) : curso.status === 'concluido' ? (
             <div className="flex items-center gap-2 text-[#5F7D65] font-bold text-sm bg-[#EEF3EC] px-4 py-2.5 rounded-xl justify-center border border-[#D5E0D7]">
               <span>🏅</span> Curso Finalizado
             </div>
          ) : (
            <div className="flex items-center justify-between border-t border-[#F4F8F4] pt-4">
               <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C6E60]">
                 <span className="text-[#5F7D65]">⭐</span> +{curso.xp} XP
               </div>
               <span className="text-sm font-bold text-[#1C2B23] group-hover:text-[#5F7D65] transition-colors flex items-center gap-1">
                 Começar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </span>
            </div>
          )}
        </div>
        
      </div>
      
      {/* Link invisível cobrindo o card todo */}
      <Link href="/aula" className="absolute inset-0 z-30"><span className="sr-only">Acessar curso {curso.title}</span></Link>
    </div>
  );
}