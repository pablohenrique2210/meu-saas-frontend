import "server-only";
import { randomUUID } from "node:crypto";
import { issueSignedToken, BlobAccessError, BlobStoreNotFoundError, BlobStoreSuspendedError } from "@vercel/blob";
import { z } from "zod";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-config";

export const runtime = "nodejs";

const MAX_ASSET_SIZE_BYTES = 500 * 1024 * 1024;
const ASSET_PATHNAME =
  /^courses\/assets\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(pdf|docx?|jpe?g|png|webp|gif|xlsx?|csv|pptx?|zip|rar|7z|txt)$/i;
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "text/plain",
  "application/octet-stream",
];

class MaterialUploadError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

const uploadEvent = z.object({
  type: z.literal("blob.generate-presigned-url"),
  payload: z.object({
    pathname: z.string().regex(ASSET_PATHNAME),
    multipart: z.boolean().optional(),
    clientPayload: z.string().max(4096).nullable().optional(),
  }),
});

async function requireCourseManager(frontendOrigin: string) {
  const session = await auth();
  if (!session.userId) throw new MaterialUploadError(401, "SESSION_REQUIRED", "Entre novamente na plataforma para enviar o material.");

  const clerkToken = await session.getToken();
  if (!clerkToken) throw new MaterialUploadError(401, "SESSION_REQUIRED", "Não foi possível obter sua sessão. Entre novamente na plataforma.");

  let response: Response;
  try {
    response = await fetch(apiUrl("/api/users/me/rh-access"), {
    headers: {
      Authorization: `Bearer ${clerkToken}`,
      Origin: frontendOrigin,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    redirect: "error",
    });
  } catch {
    throw new MaterialUploadError(503, "PERMISSION_SERVICE_UNAVAILABLE", "O backend não respondeu à verificação de acesso. Tente novamente; nenhum arquivo foi enviado.");
  }
  if (response.status === 401) throw new MaterialUploadError(401, "BACKEND_SESSION_REJECTED", "O backend não aceitou sua sessão. Entre novamente e confira a integração Clerk do Railway.");
  if (response.status === 403) throw new MaterialUploadError(403, "BACKEND_ACCESS_DENIED", "O backend recusou a verificação de acesso. Confira a permissão da conta e a origem deste deployment no Railway.");
  if (!response.ok) throw new MaterialUploadError(503, "PERMISSION_SERVICE_UNAVAILABLE", "Não foi possível verificar sua permissão no backend. Tente novamente mais tarde.");

  const result = (await response.json().catch(() => null)) as {
    allowed?: boolean;
  } | null;
  if (result?.allowed !== true) throw new MaterialUploadError(403, "COURSE_MANAGER_REQUIRED", "Apenas administradores e gestores autorizados podem enviar materiais.");
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const respond = (body: Record<string, unknown>, status = 200) => NextResponse.json(
    { ...body, requestId }, { status, headers: { "Cache-Control": "no-store" } },
  );
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      throw new MaterialUploadError(415, "JSON_REQUIRED", "Envie somente os metadados como JSON. O arquivo deve ir diretamente ao Blob.");
    }
    const frontendOrigin = new URL(request.url).origin;
    let body: HandleUploadPresignedBody;
    try { body = await request.json(); } catch {
      throw new MaterialUploadError(400, "INVALID_JSON", "Os metadados enviados não são um JSON válido.");
    }
    if (body?.type !== "blob.upload-completed") {
      const parsed = uploadEvent.safeParse(body);
      if (!parsed.success) return respond({ code: "INVALID_UPLOAD_METADATA", error: "Confira o nome e o formato do material. Atualize a página e selecione o arquivo novamente.",
        details: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
      }, 422);
      await requireCourseManager(frontendOrigin);
    }
    if (!process.env.BLOB_WEBHOOK_PUBLIC_KEY?.trim()) {
      throw new MaterialUploadError(503, "BLOB_WEBHOOK_KEY_MISSING", "Falta BLOB_WEBHOOK_PUBLIC_KEY no ambiente deste deployment. Conecte o Blob ao projeto Vercel e publique novamente.");
    }
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!ASSET_PATHNAME.test(pathname)) {
          throw new MaterialUploadError(422, "INVALID_MATERIAL_PATH", "O nome ou formato do material não é permitido.");
        }

        const validUntil = Date.now() + 4 * 60 * 60 * 1000;
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_ASSET_SIZE_BYTES,
          validUntil,
        });

        return {
          token,
          urlOptions: {
            validUntil,
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_ASSET_SIZE_BYTES,
            addRandomSuffix: false,
            allowOverwrite: false,
            cacheControlMaxAge: 60 * 60,
          },
        };
      },
    });

    return respond(jsonResponse);
  } catch (error) {
    let failure = error instanceof MaterialUploadError ? error : null;
    if (!failure && (error instanceof BlobAccessError || error instanceof BlobStoreNotFoundError)) {
      failure = new MaterialUploadError(503, "BLOB_ACCESS_CONFIGURATION", "O Blob não autorizou este deployment. Confira a conexão do armazenamento ao projeto e ao ambiente Production/Preview na Vercel.");
    }
    if (!failure && error instanceof BlobStoreSuspendedError) {
      failure = new MaterialUploadError(503, "BLOB_STORE_SUSPENDED", "O armazenamento Blob está suspenso. Confira os limites e o estado do armazenamento no painel da Vercel.");
    }
    const message = error instanceof Error ? error.message : "";
    if (!failure && /OIDC is enabled for this project, but not for this token's environment/.test(message)) {
      failure = new MaterialUploadError(503, "BLOB_ACCESS_CONFIGURATION", "O ambiente deste deployment não está autorizado no Blob. Confira Production/Preview na conexão do armazenamento ao projeto Vercel.");
    }
    if (!failure && /No blob credentials found|No read-write token found|Invalid `BLOB_READ_WRITE_TOKEN`|no storeId was found/.test(message)) {
      failure = new MaterialUploadError(503, "BLOB_CREDENTIALS_MISSING", "As credenciais do Blob estão ausentes ou inválidas neste deployment. Confira BLOB_STORE_ID com OIDC ou BLOB_READ_WRITE_TOKEN na Vercel, sem expor chaves no frontend.");
    }
    if (!failure && /quota exceeded|storage limit/i.test(message)) {
      failure = new MaterialUploadError(503, "BLOB_QUOTA_EXCEEDED", "A quota do Vercel Blob foi atingida. Confira o armazenamento no painel; reenviar o arquivo não libera espaço.");
    }
    if (!failure && /Missing callback signature|Invalid callback signature/.test(message)) {
      failure = new MaterialUploadError(403, "INVALID_CALLBACK_SIGNATURE", "Assinatura de confirmação do Blob inválida.");
    }
    failure ??= new MaterialUploadError(502, "BLOB_UPLOAD_UNAVAILABLE", "Não foi possível autorizar o material no Blob. Consulte os logs da Vercel usando a referência desta solicitação.");
    // Never log credentials, signed URLs, backend bodies or raw SDK messages.
    console.error("Material upload authorization failed", { requestId, code: failure.code, status: failure.status });
    return respond({ code: failure.code, error: failure.message }, failure.status);
  }
}
