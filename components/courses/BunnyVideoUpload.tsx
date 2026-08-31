"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { DetailedError, Upload } from "tus-js-client";
import { z } from "zod";

const credentialsSchema = z.object({
  videoId: z.uuid(), libraryId: z.string().regex(/^[1-9]\d*$/),
  signature: z.string().regex(/^[a-f0-9]{64}$/), expirationTime: z.number().int().positive(),
});
const mimeTypes: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};
export type BunnyUploadedVideo = { bunnyVideoId: string; bunnyLibraryId: string };

export default function BunnyVideoUpload({ onUploaded }: {
  onUploaded?: (video: BunnyUploadedVideo) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BunnyUploadedVideo | null>(null);
  const uploadRef = useRef<Upload | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const active = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestRef.current?.abort();
      void uploadRef.current?.abort().catch(() => undefined);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current) return;
    setError(""); setResult(null);
    const extension = file?.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType = mimeTypes[extension];
    if (!file || !fileType || !file.size || file.size > 5 * 1024 ** 3) {
      setError("Escolha um vídeo MP4, WebM ou MOV de até 5 GB, não vazio."); return;
    }
    if (!title.trim()) { setError("Informe o título da aula."); return; }
    active.current = true; setBusy(true); setProgress(0);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch("/api/bunny/create", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), fileName: file.name, fileType, fileSize: file.size }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) {
        const details = Array.isArray(body.details)
          ? body.details.map((item: { field: string; message: string }) => `${item.field}: ${item.message}`).join("; ") : "";
        throw new Error(`${body.error || "Não foi possível autorizar o upload."} ${details}${body.requestId ? ` Referência: ${body.requestId}` : ""}`);
      }
      const parsed = credentialsSchema.safeParse(body);
      if (!parsed.success || parsed.data.expirationTime <= Date.now() / 1000) {
        throw new Error("A autorização de upload é inválida ou expirou. Tente novamente.");
      }
      if (!mounted.current) return;
      const credentials = parsed.data;
      const upload = new Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        chunkSize: 8 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        // A new authorization creates a new video; do not reuse another video's fingerprint.
        storeFingerprintForResuming: false,
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expirationTime),
          LibraryId: credentials.libraryId, VideoId: credentials.videoId,
        },
        metadata: { filetype: fileType, title: title.trim() },
        onShouldRetry: (failure) => {
          const status = failure.originalResponse?.getStatus() ?? 0;
          return [0, 409, 423, 429].includes(status) || status >= 500;
        },
        onProgress: (sent, total) => {
          if (mounted.current) setProgress(total ? Math.min(100, Math.round(sent / total * 100)) : 0);
        },
        onError: (failure) => {
          active.current = false;
          if (!mounted.current) return;
          setBusy(false);
          const status = failure instanceof DetailedError ? failure.originalResponse?.getStatus() : undefined;
          setError(status === 401 || status === 403
            ? "A autorização do Bunny expirou ou foi recusada. Inicie um novo envio."
            : "O envio foi interrompido após as tentativas automáticas. Confira sua conexão e tente novamente.");
        },
        onSuccess: () => {
          active.current = false;
          if (!mounted.current) return;
          const video = { bunnyVideoId: credentials.videoId, bunnyLibraryId: credentials.libraryId };
          setProgress(100); setBusy(false); setResult(video);
          onUploaded?.(video);
        },
      });
      uploadRef.current = upload;
      upload.start();
    } catch (failure) {
      active.current = false;
      if (!mounted.current) return;
      setBusy(false);
      setError(failure instanceof Error ? failure.message : "Não foi possível iniciar o envio.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8" aria-busy={busy}>
      <label className="block space-y-2 font-medium">
        <span>Título da aula</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required disabled={busy}
          className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>
      <label className="block space-y-2 font-medium">
        <span>Arquivo de vídeo</span>
        <input type="file" accept=".mp4,.webm,.mov" required disabled={busy}
          className="block w-full min-w-0 rounded-xl border border-stone-300 p-3 text-sm"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected); setResult(null); setProgress(0); setError("");
            if (selected && !title.trim()) setTitle(selected.name.replace(/\.[^.]+$/, "").slice(0, 200));
          }} />
        <span className="block text-sm font-normal text-stone-600">MP4, WebM ou MOV · até 5 GB. Mantenha esta página aberta durante o envio.</span>
      </label>
      <button type="submit" disabled={busy || !file} className="w-full rounded-full bg-[#681b34] px-6 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto">
        {busy ? "Enviando vídeo…" : "Enviar para o Bunny"}
      </button>
      {(busy || result) && <div role="status" className="space-y-2">
        <label htmlFor="bunny-upload-progress">{progress}% enviado{busy && progress === 100 ? " — confirmando recebimento…" : ""}</label>
        <progress id="bunny-upload-progress" max={100} value={progress} className="block h-3 w-full accent-[#681b34]" />
      </div>}
      {error && <p role="alert" className="break-words rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {result && <div className="space-y-2 break-words rounded-xl bg-green-50 p-4 text-sm text-green-900">
        <p>Arquivo recebido. O Bunny ainda precisa processar o vídeo antes da reprodução.</p>
        <p>ID do vídeo: <code>{result.bunnyVideoId}</code></p>
        <p>Biblioteca: <code>{result.bunnyLibraryId}</code></p>
        <p>Esta tela não vincula o vídeo a uma aula nem publica o conteúdo no catálogo.</p>
      </div>}
    </form>
  );
}
