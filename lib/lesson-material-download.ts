const BLOB_HOST = /^[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com$/i;
const MATERIAL_PATH = /^\/courses\/assets\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(pdf|docx?|jpe?g|png|webp|gif|xlsx?|csv|pptx?|zip|rar|7z|txt)$/i;

/** Only lesson assets use this path. Videos (Bunny or legacy Blob) are not downloads. */
export function lessonMaterialBlobDownloadUrl(value: string): string | null {
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  const host = BLOB_HOST.exec(url.hostname);
  if (!host) return null;
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error("O endereço do material no Blob é inválido.");
  }
  if (host[1].toLowerCase() !== "public") {
    throw new Error("Este material usa um Blob privado e precisa de uma rota de download autorizada. Contate o administrador.");
  }
  if (!MATERIAL_PATH.test(url.pathname)) {
    throw new Error("Este endereço não corresponde a um material de aula permitido. Vídeos não são baixados por este botão.");
  }
  // Vercel's downloadUrl contract: Content-Disposition attachment, without buffering the file in JS.
  url.searchParams.set("download", "1");
  url.hash = "";
  return url.toString();
}
