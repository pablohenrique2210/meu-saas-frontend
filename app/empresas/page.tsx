import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BrandLogo from "../BrandLogo";
import WhatsAppLink from "@/components/WhatsAppLink";
import MobileWhatsAppCta from "@/components/MobileWhatsAppCta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Saúde Corporativa e NR-1 para Empresas",
  description:
    "Consultoria em riscos psicossociais, NR-1, treinamentos e desenvolvimento de lideranças para empresas.",
  alternates: { canonical: "/empresas" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/empresas",
    title: "Saúde Corporativa e NR-1 para Empresas",
    description:
      "Consultoria em riscos psicossociais, NR-1, treinamentos e desenvolvimento de lideranças para empresas.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lilian Arruda, consultoria, educação e saúde corporativa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saúde Corporativa e NR-1 para Empresas",
    description:
      "Consultoria em riscos psicossociais, NR-1, treinamentos e desenvolvimento de lideranças para empresas.",
    images: ["/opengraph-image"],
  },
};

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

const successCases = [
  {
    company: "Tecnoarames",
    title: "Circuito do Cuidado no Setembro Amarelo",
    description:
      "Uma experiência de reflexão, escuta e acolhimento para transformar informação sobre saúde mental em atitude no ambiente de trabalho.",
    media: "/cases/tecnoarames-setembro-amarelo.mp4",
    mediaType: "video",
    alt: "Ação do Circuito do Cuidado realizada na Tecnoarames durante o Setembro Amarelo",
  },
  {
    company: "TekniPlex",
    title: "Saúde mental e prevenção ao assédio na SIPAT",
    description:
      "Três encontros com colaboradores para fortalecer uma cultura de informação, respeito, acolhimento e responsabilidade no trabalho.",
    media: "/cases/tekniplex-sipat.mp4",
    mediaType: "video",
    alt: "Palestra sobre saúde mental e prevenção ao assédio realizada na SIPAT da TekniPlex",
  },
  {
    company: "BEX Consultoria",
    title: "Soluções construídas a partir da escuta",
    description:
      "Alinhamento estratégico para compreender a cultura, identificar desafios e planejar ações de saúde corporativa conectadas às necessidades da empresa.",
    media: "/cases/bex-consultoria.jpg",
    mediaType: "image",
    alt: "Lilian Arruda durante uma ação corporativa de saúde e segurança do trabalho",
  },
] as const;

const faqs = [
  {
    question: "Como funciona o diagnóstico de riscos psicossociais?",
    answer:
      "O trabalho considera fatores ligados à saúde mental, liderança, clima e processos de trabalho. O escopo é alinhado à realidade e às necessidades da empresa.",
  },
  {
    question: "Como a consultoria apoia a preparação relacionada à NR-1?",
    answer:
      "Os achados do diagnóstico são organizados em prioridades, responsabilidades e ações acompanháveis para apoiar a gestão dos riscos psicossociais.",
  },
  {
    question: "A solução serve para qualquer tipo de empresa?",
    answer:
      "O formato é definido conforme o contexto, o porte e as necessidades da organização. A conversa inicial ajuda a avaliar o melhor escopo para cada caso.",
  },
  {
    question: "Quanto tempo dura o diagnóstico ou o programa?",
    answer:
      "O prazo depende do porte da empresa, do escopo e da disponibilidade das equipes. O cronograma é definido depois do entendimento inicial da necessidade.",
  },
  {
    question: "É possível manter acompanhamento depois do diagnóstico?",
    answer:
      "Sim. Quando previsto no escopo, o trabalho pode incluir monitoramento do plano de ação, capacitação de gestores e acompanhamento contínuo da evolução.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.url}/empresas#consultoria`,
      name: "Lilian Arruda - Educação e Saúde Corporativa",
      url: `${siteConfig.url}/empresas`,
      logo: `${siteConfig.url}/brand/lilian-arruda-logo-transparent.png`,
      image: [
        `${siteConfig.url}/consultora/lilian-arruda-consultoria.jpg`,
        `${siteConfig.url}/consultora/lilian-arruda-retrato.jpg`,
      ],
      description: siteConfig.description,
      email: siteConfig.email,
      telephone: siteConfig.phoneE164,
      areaServed: { "@type": "Country", name: "Brasil" },
      founder: {
        "@type": "Person",
        name: "Lilian Arruda",
        jobTitle: "Consultora em Educação e Saúde Corporativa",
      },
      serviceType: [
        "Diagnóstico de riscos psicossociais",
        "Consultoria e plano de ação NR-1",
        "Treinamentos corporativos",
        "Palestras e SIPAT",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function ParaEmpresas() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#FAF7F4] pb-24 font-sans text-[#241A1D] selection:bg-[#641C32] selection:text-white md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      
      {/* --- HEADER --- */}
      <header className="relative z-50 border-b border-[#E9E0E2]/80 bg-[#FAF7F4]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8">
          <Link href="/" className="flex items-center">
            <BrandLogo
              priority
              className="h-[46px] max-w-[138px] sm:h-[52px] sm:max-w-[215px]"
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
            <a href="#cases" className="transition-colors hover:text-[#641C32]">
              Cases
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/rh"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#641C32] px-4 text-sm font-bold text-[#641C32] transition-all hover:-translate-y-0.5 hover:bg-[#641C32] hover:text-white sm:h-11 sm:px-5"
            >
              Login RH
            </Link>
            <WhatsAppLink
              placement="cabecalho"
              className="hidden h-11 items-center justify-center rounded-full bg-[#641C32] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-12px_rgba(100,28,50,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#7D2943] xl:inline-flex xl:px-7"
            >
              Falar com a especialista
            </WhatsAppLink>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main>
        
        {/* SECÇÃO 1: HERO */}
        <section className="relative">
          <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(circle_at_15%_10%,rgba(197,154,98,0.14),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(100,28,50,0.09),transparent_40%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-20 lg:pt-14">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center rounded-full border border-[#DED4D7] bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7D2943] shadow-sm">
                Consultoria para saúde e educação corporativa
              </div>
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[54px] xl:text-[56px]">
                <span className="block">Pessoas saudáveis.</span>
                <span className="block">
                  Empresas mais{" "}
                  <span className="italic text-[#641C32]">fortes.</span>
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#776A6E] sm:text-xl">
                Estratégia, educação e cuidado conectados para desenvolver
                lideranças, fortalecer equipes e construir ambientes de trabalho
                mais seguros, conscientes e humanizados.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <WhatsAppLink
                  id="whatsapp-hero-cta"
                  placement="hero"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#641C32] px-8 py-4 font-bold text-white shadow-[0_18px_36px_-16px_rgba(100,28,50,0.75)] transition-all hover:-translate-y-1 hover:bg-[#7D2943]"
                >
                  Falar com a especialista <span aria-hidden="true">↗</span>
                </WhatsAppLink>
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
                  Consultoria em Educação &amp; Saúde Corporativa
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
                Saúde, educação e estratégia conduzidas com proximidade.
              </h2>
              <div className="mt-7 space-y-5 text-lg leading-8 text-[#776A6E]">
                <p>
                  Lilian Arruda é enfermeira, especialista em Educação
                  Corporativa e Enfermagem do Trabalho, com mais de 16 anos de
                  experiência dedicados à saúde, ao desenvolvimento humano e à
                  educação dentro das organizações.
                </p>
                <p>
                  Cada projeto começa com escuta e compreensão da cultura da
                  empresa. A partir desse diagnóstico, Lilian constrói soluções
                  personalizadas para fortalecer lideranças, desenvolver
                  equipes e apoiar ambientes de trabalho mais saudáveis.
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

        <section id="cases" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                Cuidado que acontece dentro das empresas.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#776A6E]">
                Experiências reais de educação, prevenção e saúde corporativa,
                construídas de acordo com cada contexto.
              </p>
            </div>

            <article className="mt-14 grid overflow-hidden rounded-[2.5rem] bg-white shadow-[0_24px_70px_rgba(100,28,50,0.10)] lg:grid-cols-[1.18fr_0.82fr]">
              <div className="aspect-[4/5] overflow-hidden bg-[#EDE6E7] sm:aspect-video lg:aspect-auto lg:min-h-[570px]">
                <video
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={successCases[0].alt}
                >
                  <source src={successCases[0].media} type="video/mp4" />
                  Seu navegador não oferece suporte à reprodução deste vídeo.
                </video>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                <p className="text-sm font-bold text-[#7D2943]">
                  {successCases[0].company}
                </p>
                <h3 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
                  {successCases[0].title}
                </h3>
                <p className="mt-6 text-lg leading-8 text-[#776A6E]">
                  {successCases[0].description}
                </p>
              </div>
            </article>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {successCases.slice(1).map((caseItem) => (
                <article
                  key={caseItem.company}
                  className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_55px_rgba(100,28,50,0.08)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE6E7]">
                    {caseItem.mediaType === "video" ? (
                      <video
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                        aria-label={caseItem.alt}
                      >
                        <source src={caseItem.media} type="video/mp4" />
                        Seu navegador não oferece suporte à reprodução deste
                        vídeo.
                      </video>
                    ) : (
                      <Image
                        src={caseItem.media}
                        alt={caseItem.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-8 sm:p-10">
                    <p className="text-sm font-bold text-[#7D2943]">
                      {caseItem.company}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl leading-tight">
                      {caseItem.title}
                    </h3>
                    <p className="mt-5 leading-7 text-[#776A6E]">
                      {caseItem.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="duvidas" className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                Dúvidas frequentes
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#776A6E]">
                Informações iniciais para ajudar sua empresa a avaliar o melhor
                caminho.
              </p>
            </div>
            <div className="border-t border-[#D9CDD1]">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-[#D9CDD1] py-1"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-bold marker:content-none">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="text-2xl font-normal text-[#641C32] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-12 leading-7 text-[#776A6E]">
                    {faq.answer}
                  </p>
                </details>
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
                    href={`mailto:${siteConfig.email}`}
                    className="transition-colors hover:text-white"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href="tel:+5511943874070"
                    className="transition-colors hover:text-white"
                  >
                    (11) 9 4387-4070
                  </a>
                </div>
              </div>
              <WhatsAppLink
                placement="contato_final"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 font-bold text-[#641C32] shadow-xl transition-all hover:-translate-y-1 hover:bg-[#FAF7F4] sm:w-auto"
              >
                Falar com a especialista
              </WhatsAppLink>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-[#E9E0E2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center text-sm text-[#776A6E] sm:px-8 md:flex-row md:text-left">
          <BrandLogo className="h-11 max-w-[175px]" />
          <p>© {new Date().getFullYear()} Lilian Arruda</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold text-[#641C32]">
            <Link href="/politica-de-privacidade" className="hover:text-[#7D2943]">
              Política de Privacidade
            </Link>
            <a
              href="https://lilianarruda.com.br/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#7D2943]"
            >
              Site oficial ↗
            </a>
          </div>
        </div>
      </footer>

      <MobileWhatsAppCta observedElementId="whatsapp-hero-cta" />
    </div>
  );
}
