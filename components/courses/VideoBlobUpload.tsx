"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { inspectVideoFile } from "@/lib/video-file";

export interface UploadedBlobVideo {
  url: string;
  pathname: string;
  contentType: string;
  durationMinutes: number;
  durationSeconds: number;
}

interface VideoBlobUploadProps {
  disabled?: boolean;
  hasVideo?: boolean;
  onUploaded: (video: UploadedBlobVideo) => void;
  onError?: (message: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onProgressChange?: (progress: number | null) => void;
}

const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
const allowedVideoTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
]);

function safeBlobName(fileName: string) {
  const cleaned = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-180);
  return `${crypto.randomUUID()}-${cleaned}`;
}

export function VideoBlobUpload({
  disabled,
  hasVideo,
  onUploaded,
  onError,
  onUploadingChange,
  onProgressChange,
}: VideoBlobUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const setUploadState = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadState(true);
    setProgress(0);
    onProgressChange?.(0);

    try {
      if (!allowedVideoTypes.has(file.type)) {
        throw new Error("Selecione um vídeo MP4, WebM ou OGG válido.");
      }
      if (file.size <= 0 || file.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error("O vídeo precisa ter entre 1 byte e 5 GB.");
      }

      const metadata = await inspectVideoFile(file);
      const pathname = `courses/videos/${safeBlobName(file.name)}`;
      const blob = await uploadPresigned(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob/videos",
        contentType: file.type,
        multipart: true,
        onUploadProgress: ({ percentage }) => {
          const nextProgress = Math.round(percentage);
          setProgress(nextProgress);
          onProgressChange?.(nextProgress);
        },
      });

      onUploaded({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        durationMinutes: metadata.durationMinutes,
        durationSeconds: metadata.durationSeconds,
      });
      setProgress(100);
      onProgressChange?.(100);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao enviar o vídeo.";
      onError?.(message);
      setProgress(0);
    } finally {
      setUploadState(false);
      window.setTimeout(() => onProgressChange?.(null), 600);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      <label
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E9E0E2] bg-white px-4 py-2 text-xs font-bold text-[#641C32] transition hover:bg-[#F5EFEC] ${disabled || isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {isUploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <UploadCloud size={16} />
        )}
        {isUploading
          ? `Enviando ${progress}%`
          : hasVideo
            ? "Alterar vídeo"
            : "Selecionar vídeo"}
        <input
          type="file"
          accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg"
          disabled={disabled || isUploading}
          onChange={async (event) => {
            await handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {isUploading && (
        <div className="mt-2 h-2 w-full min-w-48 overflow-hidden rounded-full bg-[#E9E0E2]">
          <div
            className="h-full rounded-full bg-[#7D2943] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
