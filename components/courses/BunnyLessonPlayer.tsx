"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/lib/api-config";

type Player = {
  on: (event: string, callback: (data?: unknown) => void) => void;
  off: (event: string) => void;
  setCurrentTime: (seconds: number) => void;
};
type PlayerWindow = Window & { playerjs?: { Player: new (iframe: HTMLIFrameElement) => Player } };
type Playback = { url: string; lastTime: number };

export default function BunnyLessonPlayer({ lessonId, title, onTime }: {
  lessonId: string; title: string; onTime: (seconds: number, force?: boolean) => void;
}) {
  const { getToken } = useAuth();
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [message, setMessage] = useState("Autorizando reprodução…");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [scriptReady, setScriptReady] = useState(false);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const callback = useRef(onTime);
  useEffect(() => { callback.current = onTime; }, [onTime]);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;
    async function load() {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Não foi possível iniciar esta aula agora.");
        const response = await fetch(apiUrl(`/api/courses/lessons/${encodeURIComponent(lessonId)}/playback`), {
          headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error("Não foi possível iniciar esta aula agora.");
        if (body?.status === "processing") {
          setMessage("O Bunny está preparando o vídeo. A reprodução será liberada quando o processamento terminar.");
          if (++polls < 20) timer = setTimeout(() => void load(), 15_000);
          else setFailed(true);
          return;
        }
        if (body?.status !== "ready" || typeof body.url !== "string" ||
          !/^https:\/\/iframe\.mediadelivery\.net\/embed\/[1-9]\d*\/[a-f0-9-]{36}\?/.test(body.url)) {
          throw new Error("Não foi possível iniciar esta aula agora.");
        }
        setPlayback({ url: body.url, lastTime: Number.isFinite(body.lastTime) ? Math.max(0, body.lastTime) : 0 });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Video playback unavailable", error);
          setMessage("Não foi possível iniciar esta aula agora.");
          setFailed(true);
        }
      }
    }
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [lessonId, getToken, attempt]);

  useEffect(() => {
    const library = (window as PlayerWindow).playerjs;
    if (!iframe || !playback || !scriptReady || !library) return;
    let active = true;
    let seconds = playback.lastTime;
    const player = new library.Player(iframe);
    const timeout = setTimeout(() => {
      if (active) { setMessage("Não foi possível iniciar esta aula agora."); setFailed(true); }
    }, 30_000);
    player.on("ready", () => {
      if (!active) return;
      clearTimeout(timeout);
      if (seconds > 0) player.setCurrentTime(seconds);
      callback.current(seconds);
      player.on("timeupdate", (event) => {
        if (!active) return;
        let data: unknown = event;
        if (typeof data === "string") { try { data = JSON.parse(data); } catch { return; } }
        if (!data || typeof data !== "object" || !("seconds" in data) || typeof data.seconds !== "number" ||
          !Number.isFinite(data.seconds) || data.seconds < 0) return;
        seconds = data.seconds;
        callback.current(seconds);
      });
      for (const event of ["pause", "ended"]) player.on(event, () => { if (active) callback.current(seconds, true); });
      player.on("error", () => {
        if (active) { setMessage("Não foi possível iniciar esta aula agora."); setFailed(true); }
      });
    });
    return () => {
      active = false; clearTimeout(timeout);
      for (const event of ["ready", "timeupdate", "pause", "ended", "error"]) player.off(event);
    };
  }, [iframe, playback, scriptReady]);

  return <div className="relative h-full w-full bg-black text-white">
    <Script src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js" strategy="afterInteractive"
      onReady={() => setScriptReady(true)} onError={() => { setMessage("Não foi possível iniciar esta aula agora."); setFailed(true); }} />
    {playback && scriptReady && !failed ? <iframe ref={setIframe} src={playback.url} title={title}
      className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> :
      <div role="status" className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center text-sm">
        <p>{message}</p>
        {failed && <button type="button" className="rounded-full border border-white/40 px-5 py-2"
          onClick={() => { setPlayback(null); setFailed(false); setMessage("Autorizando reprodução…"); setAttempt((value) => value + 1); }}>Tentar novamente</button>}
      </div>}
  </div>;
}
