import Link from "next/link";
import BunnyVideoUpload from "@/components/courses/BunnyVideoUpload";
import { ArrowLeft } from "lucide-react";

export default function BunnyUploadPage() {
  return (
    <main className="min-h-screen bg-[#faf7f4] px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/admin/cursos" className="inline-flex items-center gap-2 text-sm font-medium text-[#681b34]">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar aos cursos
        </Link>
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Upload de vídeo · Bunny Stream</h1>
          <p className="text-stone-600">Envio direto e autorizado, com progresso e tentativas automáticas em caso de instabilidade.</p>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Para enviar e vincular um vídeo diretamente à aula, use o editor do curso e escolha Upload no Bunny. Esta tela avulsa também permite enviar: depois copie a referência gerada para o campo Link da aula e salve o curso.
          </p>
        </header>
        <BunnyVideoUpload />
      </div>
    </main>
  );
}
