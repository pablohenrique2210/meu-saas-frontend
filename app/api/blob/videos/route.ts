import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-config";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
const VIDEO_PATHNAME =
  /^courses\/videos\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(mp4|webm|ogg)$/i;

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
            "Apenas administradores autorizados podem enviar vídeos.",
          );
        }
        if (!VIDEO_PATHNAME.test(pathname)) {
          throw new Error(
            "O caminho do vídeo é inválido. Use MP4, WebM ou OGG dentro de courses/videos.",
          );
        }

        const validUntil = Date.now() + 4 * 60 * 60 * 1000;
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: ["video/mp4", "video/webm", "video/ogg"],
          maximumSizeInBytes: MAX_VIDEO_SIZE_BYTES,
          validUntil,
        });

        return {
          token,
          urlOptions: {
            validUntil,
            allowedContentTypes: ["video/mp4", "video/webm", "video/ogg"],
            maximumSizeInBytes: MAX_VIDEO_SIZE_BYTES,
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
            : "Não foi possível autorizar o upload.",
      },
      { status: 400 },
    );
  }
}
