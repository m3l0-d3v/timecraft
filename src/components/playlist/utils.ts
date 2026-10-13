import type { ParsedSource } from "./constants";

export function parseYouTubeUrl(input: string): ParsedSource | null {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const isYouTube =
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com";

  if (!isYouTube) return null;

  const list = parsed.searchParams.get("list");
  if (list) return { kind: "playlist", url: input, id: list };

  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = parsed.pathname.slice(1) || null;
  } else if (parsed.pathname === "/watch") {
    videoId = parsed.searchParams.get("v");
  } else if (parsed.pathname.startsWith("/embed/")) {
    videoId = parsed.pathname.split("/embed/")[1] || null;
  } else if (parsed.pathname.startsWith("/shorts/")) {
    videoId = parsed.pathname.split("/shorts/")[1] || null;
  }

  if (!videoId) return null;
  return { kind: "video", url: input, id: videoId };
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultTitle(parsed: ParsedSource): string {
  return parsed.kind === "playlist"
    ? `Playlist ${parsed.id.slice(0, 4)}`
    : `Vídeo ${parsed.id.slice(0, 4)}`;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function toNumber(value: number | readonly number[]): number {
  if (typeof value === "number") return value;
  return value[0] ?? 0;
}
