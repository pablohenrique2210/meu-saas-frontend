import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "../BrandLogo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda como a plataforma La Evolui trata dados pessoais e protege a privacidade de visitantes, colaboradores e gestores.",
  alternates: { canonical: "/politica-de-privacidade" },
};

const sections = [
  {
    title: "1. A quem este aviso se aplica",
    paragraphs: [
      "Este aviso se aplica aos visitantes do site, colaboradores convidados para programas de capacitação e gestores que utilizam as áreas administrativas da plataforma La Evolui.",
    ],
  },
  {
    title: "2. Dados que podem ser tratados",
    paragraphs: [
      "Conforme o tipo de acesso, podemos tratar dados de identificação e contato, como nome, e-mail, telefone, empresa, cargo e departamento. O CPF informado na ativação é usado para validar o convite de acesso.",
      "Durante o uso da plataforma, também podem ser registrados cursos disponibilizados, progresso, conclusão de aulas, respostas em avaliações e jogos, além de registros técnicos necessários para segurança e funcionamento do serviço.",
    ],
  },
  {
    title: "3. Para que usamos os dados",
    paragraphs: [
      "Os dados são usados para validar convites, autenticar usuários, disponibilizar conteúdos, registrar a jornada de aprendizagem, gerar relatórios para o RH autorizado, prestar suporte, proteger a plataforma e enviar comunicações relacionadas ao acesso.",
    ],
  },
  {
    title: "4. Compartilhamento e fornecedores",
    paragraphs: [
      "Usamos fornecedores de tecnologia para operar a plataforma, incluindo serviços de autenticação, hospedagem, banco de dados, vídeo, armazenamento e envio de e-mails. Esses fornecedores recebem somente os dados necessários para executar suas funções.",
      "O WhatsApp é aberto apenas quando a própria pessoa escolhe iniciar uma conversa. O tratamento realizado pelo WhatsApp segue também os termos e políticas desse serviço.",
    ],
  },
  {
    title: "5. Cookies e dados de navegação",
    paragraphs: [
      "Cookies estritamente necessários podem ser usados para autenticação, segurança e manutenção da sessão. Métricas de navegação só são ativadas quando houver uma ferramenta configurada e o visitante autorizar esse uso.",
    ],
  },
  {
    title: "6. Armazenamento e segurança",
    paragraphs: [
      "Adotamos controles técnicos e organizacionais compatíveis com a operação para reduzir riscos de acesso indevido, alteração, perda ou divulgação de dados. Os dados são mantidos pelo período necessário às finalidades informadas e às obrigações aplicáveis.",
    ],
  },
  {
    title: "7. Direitos do titular",
    paragraphs: [
      "Nos limites previstos pela Lei Geral de Proteção de Dados, você pode solicitar confirmação de tratamento, acesso, correção, informação sobre compartilhamento e, quando aplicável, eliminação, oposição ou revogação do consentimento.",
    ],
  },
  {
    title: "8. Contato sobre privacidade",
    paragraphs: [
      `Para dúvidas ou solicitações relacionadas aos seus dados, escreva para ${siteConfig.email}. Para proteger sua conta, poderemos pedir informações adicionais antes de atender a solicitação.`,
    ],
  },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF7F4] text-[#241A1D]">
      <header className="border-b border-[#E9E0E2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Ir para a página inicial">
            <BrandLogo priority className="h-12 max-w-[190px]" />
          </Link>
          <Link
            href="/empresas"
            className="whitespace-nowrap text-sm font-bold text-[#641C32] hover:text-[#7D2943]"
          >
            Voltar ao site
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-bold text-[#7D2943]">Privacidade e LGPD</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
          Política de Privacidade
        </h1>
        <p className="mt-5 text-base leading-7 text-[#776A6E] sm:text-lg">
          Este aviso explica, em linguagem direta, como os dados pessoais são
          tratados no site e na plataforma La Evolui.
        </p>
        <p className="mt-3 text-sm text-[#776A6E]">
          Última atualização: 11 de setembro de 2026.
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl sm:text-3xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-[#5F5357]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-12 rounded-2xl border border-[#E9E0E2] bg-white p-6 text-sm leading-6 text-[#5F5357]">
          Este texto descreve a operação atual da plataforma e deve ser revisado
          sempre que houver mudança relevante de finalidade, fornecedor ou tipo
          de dado tratado.
        </aside>
      </article>
    </main>
  );
}

