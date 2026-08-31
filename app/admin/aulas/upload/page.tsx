import Link from "next/link";
import BunnyVideoUpload from "@/components/courses/BunnyVideoUpload";

export default function BunnyUploadPage() {
  return (
    <main className="min-h-screen bg-[#faf7f4] px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/admin/cursos" className="text-sm font-medium text-[#681b34]">← Voltar aos cursos</Link>
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Upload de vídeo · Bunny Stream</h1>
          <p className="text-stone-600">Envio direto e autorizado, com progresso e tentativas automáticas em caso de instabilidade.</p>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Integração da Fase 2: esta página valida o envio para a biblioteca. O vínculo com as aulas e o player serão integrados em uma próxima etapa. O editor atual continua funcionando.
          </p>
        </header>
        <BunnyVideoUpload />
      </div>
    </main>
  );
}
