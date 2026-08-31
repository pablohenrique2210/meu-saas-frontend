import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  fileName: z.string().trim().min(1).max(255),
  fileType: z.enum(["video/mp4", "video/webm", "video/quicktime"]),
  fileSize: z.number().int().positive().max(5 * 1024 ** 3),
}).strict();
const types: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};
const permittedAdmins = new Set([
  "pablohenrique2210@gmail.com", "consultoria@lilianarruda.com.br",
]);

function configuration() {
  const libraryId = process.env.BUNNY_LIBRARY_ID?.trim();
  const apiKey = process.env.BUNNY_API_KEY?.trim();
  const origins = (process.env.BUNNY_UPLOAD_ALLOWED_ORIGINS ?? "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  const details: Array<{ field: string; message: string }> = [];
  if (!libraryId) {
    details.push({ field: "BUNNY_LIBRARY_ID", message: "Ausente ou vazia no ambiente deste deployment da Vercel." });
  } else if (!/^[1-9]\d*$/.test(libraryId)) {
    details.push({ field: "BUNNY_LIBRARY_ID", message: "Use somente o número positivo da biblioteca, sem aspas, URL ou nome." });
  }
  if (!apiKey) {
    details.push({ field: "BUNNY_API_KEY", message: "Ausente ou vazia na Vercel. Use a API Key de escrita da biblioteca; a Read-only não substitui esta variável." });
  }
  if (!origins.length) {
    details.push({ field: "BUNNY_UPLOAD_ALLOWED_ORIGINS", message: "Ausente ou vazia. Informe as origens autorizadas com https://, separadas por vírgula." });
  }
  try {
    for (const origin of origins) {
      const url = new URL(origin);
      if (origin.includes("*") || url.origin !== origin || (url.protocol !== "https:" &&
          !(url.protocol === "http:" && url.hostname === "localhost"))) {
        throw new Error("Invalid origin configuration");
      }
    }
  } catch {
    details.push({ field: "BUNNY_UPLOAD_ALLOWED_ORIGINS", message: "Use apenas https://dominio, sem barra final, caminho /admin/cursos, aspas ou *. Separe várias origens por vírgula." });
  }
  if (details.length || !libraryId || !apiKey) return { ok: false as const, details };
  // Trust only Vercel's server-side deployment metadata, never request headers.
  // Each deployment gets a new hostname; other previews remain unauthorized.
  const deploymentHost = process.env.VERCEL_URL;
  if (process.env.VERCEL === "1" && deploymentHost &&
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(deploymentHost)) {
    origins.push(`https://${deploymentHost}`);
  }
  return { ok: true as const, libraryId, apiKey, origins };
}

// Read only bounded JSON metadata. Video bytes never pass through this route.
async function readMetadata(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const respond = (body: Record<string, unknown>, status: number) =>
    Response.json({ ...body, requestId }, {
      status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  try {
    const config = configuration();
    if (!config.ok) {
      // Only field names and static hints: never serialize environment values.
      console.error("Bunny configuration invalid", { requestId, fields: config.details.map((item) => item.field) });
      return respond({
        code: "BUNNY_CONFIG_INVALID",
        error: "Configuração Bunny incompleta ou inválida na Vercel. Corrija as variáveis no ambiente deste deployment e publique novamente.",
        details: config.details,
      }, 503);
    }
    const origin = request.headers.get("origin");
    if (!origin || !config.origins.includes(origin)) {
      return respond({ error: "Origem não autorizada para upload." }, 403);
    }
    const { userId } = await auth();
    if (!userId) return respond({ error: "Entre na sua conta para enviar vídeos." }, 401);
    const user = await currentUser();
    const email = user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId);
    if (!user || user.id !== userId || email?.verification?.status !== "verified" ||
        !permittedAdmins.has(email.emailAddress.trim().toLowerCase())) {
      return respond({ error: "Somente os administradores autorizados podem enviar vídeos." }, 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return respond({ error: "Envie os metadados como application/json." }, 415);
    }
    const raw = await readMetadata(request);
    if (raw === null) return respond({ error: "Metadados excedem o limite de 8 KB." }, 413);
    let payload: unknown;
    try { payload = JSON.parse(raw); }
    catch { return respond({ error: "JSON inválido." }, 400); }
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return respond({
      error: "Confira os metadados do vídeo.",
      details: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    }, 422);
    const extension = parsed.data.fileName.split(".").pop()?.toLowerCase() ?? "";
    if (types[extension] !== parsed.data.fileType) {
      return respond({ error: "A extensão não corresponde ao tipo do vídeo (MP4, WebM ou MOV)." }, 422);
    }

    const response = await fetch(`https://video.bunnycdn.com/library/${config.libraryId}/videos`, {
      method: "POST", cache: "no-store", redirect: "error",
      headers: { AccessKey: config.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ title: parsed.data.title }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.error("Bunny create rejected", { requestId, status: response.status });
      return respond({ error: "O Bunny não autorizou a criação do vídeo. Verifique a configuração da biblioteca." }, 502);
    }
    const video = z.object({ guid: z.uuid() }).safeParse(await response.json());
    if (!video.success) return respond({ error: "Resposta inválida do serviço de vídeo." }, 502);
    const expirationTime = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
    const signature = createHash("sha256")
      .update(`${config.libraryId}${config.apiKey}${expirationTime}${video.data.guid}`, "utf8")
      .digest("hex");
    return respond({ videoId: video.data.guid, libraryId: config.libraryId, expirationTime, signature }, 201);
  } catch (error) {
    // Never log raw upstream responses, credentials, or signatures.
    console.error("Bunny create failed", { requestId, type: error instanceof Error ? error.name : "Unknown" });
    return respond({ error: "Não foi possível iniciar o upload. Tente novamente mais tarde." }, 500);
  }
}
