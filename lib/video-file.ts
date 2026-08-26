export interface VideoFileMetadata {
  durationSeconds: number;
  durationMinutes: number;
}

const supportedVideoExtension = /\.(mp4|webm|ogg)$/i;

export function inspectVideoFile(file: File): Promise<VideoFileMetadata> {
  if (!supportedVideoExtension.test(file.name)) {
    return Promise.reject(
      new Error("Use um vídeo MP4 (H.264), WebM ou OGG. Converta arquivos MOV/HEVC antes de enviar."),
    );
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Não foi possível analisar o vídeo. Converta-o para MP4 com codec H.264."));
    }, 20_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      const durationSeconds = Math.ceil(video.duration);
      cleanup();
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        reject(new Error("O arquivo não possui uma duração de vídeo válida."));
        return;
      }
      resolve({
        durationSeconds,
        durationMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
      });
    };
    video.onerror = () => {
      cleanup();
      reject(
        new Error("Este vídeo não é compatível com o navegador. Converta-o para MP4 com codec H.264 e áudio AAC."),
      );
    };
    video.src = objectUrl;
    video.load();
  });
}
