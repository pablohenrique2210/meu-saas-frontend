import { issueSignedToken } from "@vercel/blob";
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

async function canManageCourses(frontendOrigin: string) {
  const session = await auth();
  if (!session.userId) return false;

  const clerkToken = await session.getToken();
  if (!clerkToken) return false;

  const response = await fetch(apiUrl("/api/users/me/rh-access"), {
    headers: {
      Authorization: `Bearer ${clerkToken}`,
      Origin: frontendOrigin,
    },
    cache: "no-store",
  });
  if (!response.ok) return false;

  const result = (await response.json().catch(() => null)) as {
    allowed?: boolean;
  } | null;
  return result?.allowed === true;
}

export async function POST(request: Request) {
  try {
    const frontendOrigin = new URL(request.url).origin;
    const body = (await request.json()) as HandleUploadPresignedBody;
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!(await canManageCourses(frontendOrigin))) {
          throw new Error(
            "Apenas administradores autorizados podem enviar materiais.",
          );
        }
        if (!ASSET_PATHNAME.test(pathname)) {
          throw new Error("O nome ou formato do material não é permitido.");
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

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível autorizar o envio do material.",
      },
      { status: 400 },
    );
  }
}
