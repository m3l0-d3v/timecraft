"use client";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import {
  ListMusic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

const STORAGE_KEY = "timecraft:playlist-url";
const COLLAPSED_KEY = "timecraft:playlist-collapsed";
const VOLUME_KEY = "timecraft:playlist-volume";
const EXPANDED_KEY = "timecraft:playlist-expanded";

type SourceKind = "playlist" | "video";

type ParsedSource = {
  kind: SourceKind;
  url: string;
  id: string;
};

function parseYouTubeUrl(input: string): ParsedSource | null {
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

type InternalPlayer = {
  nextVideo?: () => void;
  previousVideo?: () => void;
  setVolume?: (v: number) => void;
  getVolume?: () => number;
  mute?: () => void;
  unMute?: () => void;
};

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function toNumber(value: number | readonly number[]): number {
  if (typeof value === "number") return value;
  return value[0] ?? 0;
}

export default function Playlist() {
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<SourceKind | null>(null);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const internalPlayerRef = useRef<InternalPlayer | null>(null);
  const playerRef = useRef<React.ComponentRef<typeof ReactPlayer>>(null);

  useEffect(() => {
    const storedUrl = localStorage.getItem(STORAGE_KEY);
    const storedCollapsed = localStorage.getItem(COLLAPSED_KEY);
    const storedVolume = localStorage.getItem(VOLUME_KEY);
    const storedExpanded = localStorage.getItem(EXPANDED_KEY);

    if (storedUrl) {
      const parsed = parseYouTubeUrl(storedUrl);
      if (parsed) {
        setUrl(parsed.url);
        setKind(parsed.kind);
      }
    }
    if (storedCollapsed === "false") setCollapsed(false);
    if (storedVolume) {
      const v = parseFloat(storedVolume);
      if (!Number.isNaN(v) && v >= 0 && v <= 1) setVolume(v);
    }
    if (storedExpanded === "true") setExpanded(true);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (url) localStorage.setItem(STORAGE_KEY, url);
    else localStorage.removeItem(STORAGE_KEY);
  }, [url, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(EXPANDED_KEY, String(expanded));
  }, [expanded, mounted]);

  useEffect(() => {
    const player = internalPlayerRef.current;
    if (!player) return;
    if (typeof player.setVolume === "function") {
      player.setVolume(volume * 100);
    }
    if (muted) {
      player.mute?.();
    } else {
      player.unMute?.();
    }
  }, [volume, muted]);

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error("Cole um link do YouTube", {
        description: "Playlist ou vídeo. Ex.: youtube.com/watch?v=…",
      });
      return;
    }

    const parsed = parseYouTubeUrl(trimmed);
    if (!parsed) {
      toast.error("Link inválido", {
        description: "Use uma URL do YouTube (playlist ou vídeo).",
      });
      return;
    }

    setUrl(parsed.url);
    setKind(parsed.kind);
    setDraft("");
    setPlaying(false);
    internalPlayerRef.current = null;

    toast.success(
      parsed.kind === "playlist" ? "Playlist carregada" : "Vídeo carregado",
      {
        description:
          parsed.kind === "playlist"
            ? "Boa sessão de foco."
            : "Vídeo pronto para tocar.",
      },
    );
  };

  const clear = () => {
    setUrl("");
    setKind(null);
    setPlaying(false);
    internalPlayerRef.current = null;
  };

  const togglePlay = () => setPlaying((p) => !p);
  const toggleMute = () => setMuted((m) => !m);
  const toggleExpanded = () => setExpanded((e) => !e);

  const handleReady = () => {
    const player = (
      playerRef.current as unknown as {
        getInternalPlayer?: () => InternalPlayer;
      }
    )?.getInternalPlayer?.();
    if (player) {
      internalPlayerRef.current = player;
      if (typeof player.setVolume === "function") {
        player.setVolume(volume * 100);
      }
      if (muted) player.mute?.();
      else player.unMute?.();
    }
  };

  const handleError = () => {
    toast.error("Não foi possível carregar a mídia", {
      description:
        "Verifique se o vídeo ou playlist está público e tente novamente.",
    });
    setPlaying(false);
  };

  const skipNext = () => internalPlayerRef.current?.nextVideo?.();
  const skipPrev = () => internalPlayerRef.current?.previousVideo?.();

  const hasSource = url && kind;
  const panelWidth = expanded ? "36rem" : "18rem";

  if (!mounted) {
    return (
      <aside className="hidden xl:flex fixed bottom-20 left-0 z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="hidden xl:flex fixed bottom-20 left-0 z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir playlist"
            className="text-muted-foreground hover:text-foreground"
          >
            <ListMusic />
          </Button>
          {hasSource && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePlay}
              aria-label={playing ? "Pausar" : "Reproduzir"}
              className={`${
                playing ? "text-primary" : "text-muted-foreground"
              } hover:text-foreground`}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="hidden xl:flex fixed bottom-20 left-6 z-30 flex-col transition-[width] duration-200"
      style={{ width: panelWidth }}
    >
      <div className="flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur p-5 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">
              {kind === "video" ? "Vídeo" : "Playlist"}
            </h2>
            {expanded && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                2x
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {hasSource && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleExpanded}
                aria-label={expanded ? "Reduzir" : "Ampliar"}
                title={expanded ? "Reduzir" : "Ampliar 2x"}
                className="text-muted-foreground hover:text-foreground"
              >
                {expanded ? <Minimize2 /> : <Maximize2 />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(true)}
              aria-label="Colapsar"
              className="text-muted-foreground hover:text-foreground"
            >
              <ListMusic />
            </Button>
          </div>
        </div>

        {!hasSource ? (
          <div className="flex flex-col gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              placeholder="Cole o link do YouTube…"
              className="h-10 rounded-md border border-border bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
            <Button
              variant="outline"
              onClick={save}
              className="h-10 rounded-md"
            >
              Carregar
            </Button>
          </div>
        ) : (
          <>
            <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-background">
              <ReactPlayer
                ref={playerRef}
                src={url}
                playing={playing}
                volume={volume}
                muted={muted}
                controls={false}
                width="100%"
                height="100%"
                onReady={handleReady}
                onError={handleError}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={togglePlay}
                  aria-label={playing ? "Pausar" : "Reproduzir"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {playing ? <Pause /> : <Play />}
                </Button>

                {kind === "playlist" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={skipPrev}
                      aria-label="Anterior"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <SkipBack />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={skipNext}
                      aria-label="Próxima"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <SkipForward />
                    </Button>
                  </>
                )}

                <Popover>
                  <PopoverTrigger
                    className={iconButtonClass}
                    aria-label="Volume"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-48 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Volume
                      </span>
                      <button
                        onClick={toggleMute}
                        className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        {muted ? "Ativar" : "Silenciar"}
                      </button>
                    </div>
                    <Slider
                      value={[muted ? 0 : volume * 100]}
                      onValueChange={(v) => {
                        const next = toNumber(v) / 100;
                        setVolume(next);
                        if (next > 0) setMuted(false);
                      }}
                      max={100}
                      step={1}
                    />
                    <span className="text-[10px] tabular-nums text-muted-foreground text-right">
                      {Math.round((muted ? 0 : volume) * 100)}%
                    </span>
                  </PopoverContent>
                </Popover>
              </div>

              <button
                onClick={clear}
                className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Trocar
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
