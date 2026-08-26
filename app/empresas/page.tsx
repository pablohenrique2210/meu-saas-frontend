import Image from "next/image";
import Link from "next/link";
import BrandLogo from "../BrandLogo";

// URL para o WhatsApp
const whatsappUrl =
  "https://wa.me/5511943874070?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20as%20solu%C3%A7%C3%B5es%20para%20empresas.";

// Listas de dados para as secções da página
const expertise = [
  "Educação Corporativa aplicada à realidade da indústria",
  "Saúde corporativa humanizada com impacto real",
  "Metodologias ativas e simulação realística em treinamentos",
  "Integração entre saúde emocional e performance no trabalho",
  "Consultoria estratégica em saúde integral corporativa",
];

const services = [
  [
    "01",
    "Diagnóstico de riscos",
    "Leitura técnica do ambiente organizacional para identificar fatores relacionados à saúde mental, liderança, clima e processos de trabalho.",
  ],
  [
    "02",
    "GRO psicossocial",
    "Organização das evidências e dos processos necessários para uma gestão consistente dos riscos psicossociais.",
  ],
  [
    "03",
    "Plano de ação NR-1",
    "Direcionamento personalizado para transformar o diagnóstico em prioridades, responsabilidades e acompanhamento prático.",
  ],
  [
    "04",
    "Treinamentos corporativos",
    "Capacitação de gestores e equipes com linguagem acessível, aplicação prática e conexão com a realidade do negócio.",
  ],
  [
    "05",
    "Palestras e SIPAT",
    "Conteúdos para calendários de saúde, campanhas internas, prevenção e fortalecimento da cultura do cuidado.",
  ],
  [
    "06",
    "Programa contínuo",
    "Monitoramento recorrente para acompanhar planos de ação, desenvolver pessoas e sustentar a evolução da organização.",
  ],
];

const solutions = [
  [
    "Diagnóstico de riscos psicossociais",
    "Avaliação do ambiente organizacional, da saúde mental, do clima, da liderança e dos processos de trabalho.",
  ],
  [
    "Consultoria e plano de ação",
    "Estruturação personalizada das prioridades e do direcionamento necessário para uma implementação consistente.",
  ],
  [
    "Treinamentos e palestras",
    "Desenvolvimento de lideranças e equipes com foco em prevenção, saúde emocional e cultura organizacional.",
  ],
];

export default function ParaEmpresas() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF7F4] font-sans text-[#241A1D] selection:bg-[#641C32] selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="relative z-50 border-b border-[#E9E0E2]/80 bg-[#FAF7F4]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
          <Link href="/" className="flex items-center">
            <BrandLogo
              priority
              className="h-[46px] max-w-[138px] sm:h-[62px] sm:max-w-[245px]"
            />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#776A6E] lg:flex">
            <a href="#sobre" className="transition-colors hover:text-[#641C32]">
              Sobre Lilian
            </a>
            <a
              href="#atuacao"
              className="transition-colors hover:text-[#641C32]"
            >
              Atuação
            </a>
            <a
              href="#solucoes"
              className="transition-colors hover:text-[#641C32]"
            >
              Soluções
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/rh"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#641C32] px-4 text-sm font-bold text-[#641C32] transition-all hover:-translate-y-0.5 hover:bg-[#641C32] hover:text-white sm:h-11 sm:px-5"
            >
              Login RH
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden h-11 items-center justify-center rounded-full bg-[#641C32] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-12px_rgba(100,28,50,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#7D2943] xl:inline-flex xl:px-7"
            >
              Falar com a especialista
            </a>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main>
        
        {/* SECÇÃO 1: HERO */}
        <section className="relative">
          <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(circle_at_15%_10%,rgba(197,154,98,0.14),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(100,28,50,0.09),transparent_40%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DED4D7] bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7D2943] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#C59A62]" />
                Consultoria • Educação • Saúde Corporativa
              </div>
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[76px]">
                Pessoas saudáveis. Empresas mais{" "}
                <span className="italic text-[#641C32]">fortes.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#776A6E] sm:text-xl">
                Estratégia, educação e cuidado conectados para desenvolver
                lideranças, fortalecer equipes e construir ambientes de trabalho
                mais seguros, conscientes e humanizados.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#641C32] px-8 py-4 font-bold text-white shadow-[0_18px_36px_-16px_rgba(100,28,50,0.75)] transition-all hover:-translate-y-1 hover:bg-[#7D2943]"
                >
                  Solicitar diagnóstico <span aria-hidden="true">↗</span>
                </a>
                <a
                  href="#sobre"
                  className="inline-flex items-center justify-center rounded-full border border-[#DED4D7] bg-white/60 px-8 py-4 font-bold transition-colors hover:bg-white"
                >
                  Conheça a consultora
                </a>
              </div>
              <div className="mt-12 flex items-center gap-5 border-t border-[#E9E0E2] pt-7">
                <strong className="font-serif text-4xl font-normal text-[#641C32]">
                  +16
                </strong>
                <p className="max-w-[250px] text-sm leading-5 text-[#776A6E]">
                  anos de experiência em desenvolvimento humano, saúde e
                  ambientes corporativos.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[570px] lg:mx-0 lg:ml-auto">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#E9E0E2] shadow-[0_32px_80px_-30px_rgba(36,26,29,0.38)]">
                <Image
                  src="/consultora/lilian-arruda-consultoria.jpg"
                  alt="Lilian Arruda em ambiente corporativo"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/35 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-7 -left-3 max-w-[280px] rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur-xl sm:-left-8 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7D2943]">
                  Lilian Arruda
                </p>
                <p className="mt-2 font-serif text-2xl leading-tight">
                  Gestão em Educação &amp; Saúde Corporativa
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO 2: SOBRE */}
        <section id="sobre" className="bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div className="relative mx-auto w-full max-w-[470px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] bg-[#F5EFEC]">
                <Image
                  src="/consultora/lilian-arruda-retrato.jpg"
                  alt="Retrato profissional de Lilian Arruda"
                  fill
                  sizes="(max-width: 1024px) 90vw, 38vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -right-3 h-28 w-28 rounded-full border-[14px] border-white bg-[#641C32] sm:-right-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7D2943]">
                Sobre a especialista
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                Técnica na saúde. Estratégica na educação. Humana na condução.
              </h2>
              <div className="mt-7 space-y-5 text-lg leading-8 text-[#776A6E]">
                <p>
                  Lilian Arruda é enfermeira, especialista em Educação
                  Corporativa e Enfermagem do Trabalho, com mais de 16 anos de
                  experiência dedicados ao desenvolvimento humano e à promoção
                  da saúde nas organizações.
                </p>
                <p>
                  Sua atuação integra saúde ocupacional, estratégias
                  educacionais e abordagem comportamental para fortalecer
                  lideranças, desenvolver equipes e apoiar culturas mais
                  conscientes e acolhedoras.
                </p>
              </div>
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {expertise.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] p-4 text-sm font-semibold leading-6 text-[#4A3D41]"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#641C32] text-[10px] text-white">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO 3: ATUAÇÃO */}
        <section id="atuacao" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7D2943]">
                  Áreas de atuação
                </p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                  Da identificação do risco à transformação da cultura.
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-[#776A6E]">
                Soluções conectadas à realidade de cada empresa, com
                conhecimento técnico, educação aplicada e acompanhamento.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map(([number, title, description]) => (
                <article
                  key={number}
                  className="rounded-[2rem] border border-[#E9E0E2] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(100,28,50,0.45)] sm:p-8"
                >
                  <span className="font-serif text-3xl text-[#C59A62]">
                    {number}
                  </span>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-[#776A6E]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECÇÃO 4: DESTAQUE ESCRITÓRIO */}
        <section className="bg-[#241A1D] py-24 text-white sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">

            <div className="relative min-h-[560px] overflow-hidden rounded-[2.5rem]">
              <Image
                src="/consultora/lilian-arruda-executiva.jpg"
                alt="Lilian Arruda em atuação profissional"
                fill
                sizes="(max-width: 1024px) 95vw, 58vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/70 via-transparent to-transparent" />
              <p className="absolute bottom-8 left-8 max-w-lg font-serif text-3xl leading-tight sm:bottom-10 sm:left-10 sm:text-4xl">
                Conhecimento que se transforma em cuidado, decisão e resultado.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">

              <div className="relative min-h-[270px] overflow-hidden rounded-[2.5rem]">
                <Image
                  src="/consultora/lilian-arruda-escritorio.jpg"
                  alt="Lilian Arruda em ambiente de consultoria"
                  fill
                  sizes="(max-width: 1024px) 48vw, 36vw"
                  // 🚀 A MAGIA ACONTECE AQUI: Em vez de usar top ou center,
                  // controlamos exatamente a percentagem vertical para descer um pouco
                  className="object-cover object-[center_25%]"
                />
              </div>

              <div className="flex min-h-[270px] flex-col justify-between rounded-[2.5rem] bg-[#641C32] p-8 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                  Visão integrada
                </p>
                <p className="font-serif text-3xl leading-tight sm:text-4xl">
                  Saúde, comportamento e performance de forma estratégica e
                  humanizada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO 5: SOLUÇÕES */}
        <section id="solucoes" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7D2943]">
                Soluções para sua empresa
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                Preparação para a NR-1 com clareza e aplicação prática.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#776A6E]">
                Uma jornada estruturada para reconhecer riscos psicossociais,
                orientar a gestão e capacitar quem conduz as equipes.
              </p>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {solutions.map(([title, description], index) => (
                <article
                  key={title}
                  className="rounded-[2rem] bg-[#F5EFEC] p-8 sm:p-9"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-serif text-xl text-[#641C32] shadow-sm">
                    {index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-4 leading-7 text-[#776A6E]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECÇÃO 6: CONTACTO */}
        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] bg-[#641C32] px-7 py-14 text-white sm:px-14 sm:py-16 lg:px-20 lg:py-20">
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border-[70px] border-white/[0.05]" />
            <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                  Fale com a especialista
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
                  Vamos analisar a realidade da sua empresa?
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
                  Receba orientação para identificar riscos, fortalecer sua
                  equipe e construir uma atuação preventiva e sustentável.
                </p>
                <div className="mt-8 flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:gap-8">
                  <a
                    href="mailto:contato@lilianarruda.com.br"
                    className="transition-colors hover:text-white"
                  >
                    contato@lilianarruda.com.br
                  </a>
                  <a
                    href="tel:+5511943874070"
                    className="transition-colors hover:text-white"
                  >
                    (11) 9 4387-4070
                  </a>
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 font-bold text-[#641C32] shadow-xl transition-all hover:-translate-y-1 hover:bg-[#FAF7F4] sm:w-auto"
              >
                Solicitar atendimento
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-[#E9E0E2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center text-sm text-[#776A6E] sm:px-8 md:flex-row md:text-left">
          <BrandLogo className="h-11 max-w-[175px]" />
          <p>
            © {new Date().getFullYear()} Lilian Arruda • Educação e Saúde
            Corporativa
          </p>
          <a
            href="https://lilianarruda.com.br/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#641C32] hover:text-[#7D2943]"
          >
            Site oficial ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
