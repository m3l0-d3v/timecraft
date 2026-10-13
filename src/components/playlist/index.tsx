"use client";

import { useEffect, useRef, useState } from "react";
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
  Trash2,
  Plus,
  Check,
  Pencil,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

const URL_KEY = "timecraft:playlist-url";
const COLLAPSED_KEY = "timecraft:playlist-collapsed";
const VOLUME_KEY = "timecraft:playlist-volume";
const EXPANDED_KEY = "timecraft:playlist-expanded";
const LIBRARY_KEY = "timecraft:playlist-library";

type SourceKind = "playlist" | "video";

type ParsedSource = {
  kind: SourceKind;
  url: string;
  id: string;
};

type SavedSource = {
  id: string;
  url: string;
  title: string;
  kind: SourceKind;
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

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getVideoData?: () => { title?: string; video_id?: string };
};

type YTPlayerOptions = {
  videoId?: string;
  playerVars?: Record<string, unknown>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onError?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
};

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        options: YTPlayerOptions,
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function toNumber(value: number | readonly number[]): number {
  if (typeof value === "number") return value;
  return value[0] ?? 0;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultTitle(parsed: ParsedSource): string {
  return parsed.kind === "playlist"
    ? `Playlist ${parsed.id.slice(0, 4)}`
    : `Vídeo ${parsed.id.slice(0, 4)}`;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [library, setLibrary] = useState<SavedSource[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiLoadedRef = useRef(false);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const storedUrl = localStorage.getItem(URL_KEY);
    const storedCollapsed = localStorage.getItem(COLLAPSED_KEY);
    const storedVolume = localStorage.getItem(VOLUME_KEY);
    const storedExpanded = localStorage.getItem(EXPANDED_KEY);
    const storedLibrary = localStorage.getItem(LIBRARY_KEY);

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
    if (storedLibrary) {
      try {
        const parsed = JSON.parse(storedLibrary) as SavedSource[];
        if (Array.isArray(parsed)) setLibrary(parsed);
      } catch {}
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (url) localStorage.setItem(URL_KEY, url);
    else localStorage.removeItem(URL_KEY);
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
    if (!mounted) return;
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  }, [library, mounted]);

  useEffect(() => {
    if (!url || !kind) return;
    if (playerRef.current) return;

    const createPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      const parsed = parseYouTubeUrl(url);
      if (!parsed) return;

      const playerVars: Record<string, unknown> = {
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        showinfo: 0,
      };

      if (parsed.kind === "playlist") {
        playerVars.listType = "playlist";
        playerVars.list = parsed.id;
      }

      const options: YTPlayerOptions = {
        playerVars,
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            setPlayerError(false);
            event.target.setVolume(volumeRef.current * 100);
            if (mutedRef.current) event.target.mute();
            else event.target.unMute();
          },
          onError: () => {
            setPlayerError(true);
            setPlaying(false);
            toast.error("Não foi possível carregar a mídia", {
              description:
                "Verifique se o vídeo ou playlist está público e tente novamente.",
            });
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              try {
                const data = playerRef.current?.getVideoData?.();
                if (data?.title) setVideoTitle(data.title);
              } catch {}
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setPlaying(false);
            }
          },
        },
      };

      if (parsed.kind === "video") {
        options.videoId = parsed.id;
      }

      playerRef.current = new window.YT.Player(containerRef.current, options);
    };

    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }

      if (!apiLoadedRef.current) {
        apiLoadedRef.current = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode?.insertBefore(tag, firstScript);
      }

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    };

    loadAPI();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, [url, kind]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    const id = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const t = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration();
        setCurrentTime(t);
        setDuration(d);
        const data = playerRef.current.getVideoData?.();
        if (data?.title && data.title !== videoTitle) {
          setVideoTitle(data.title);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, [playerReady, videoTitle]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      playerRef.current.setVolume(volume * 100);
    } catch {}
  }, [volume, playerReady]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (muted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {}
  }, [muted, playerReady]);

  const loadSource = (source: ParsedSource) => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    }
    setPlayerReady(false);
    setPlayerError(false);
    setUrl(source.url);
    setKind(source.kind);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoTitle("");
  };

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

    loadSource(parsed);
    setDraft("");

    const already = library.some((item) => item.url === parsed.url);
    if (!already) {
      setLibrary((l) => [
        ...l,
        {
          id: makeId(),
          url: parsed.url,
          title: defaultTitle(parsed),
          kind: parsed.kind,
        },
      ]);
    }

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

  const stop = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    }
    setPlayerReady(false);
    setPlayerError(false);
    setUrl("");
    setKind(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoTitle("");
  };

  const playSaved = (item: SavedSource) => {
    const parsed = parseYouTubeUrl(item.url);
    if (!parsed) {
      toast.error("Playlist inválida", {
        description: "Remova e adicione novamente.",
      });
      return;
    }
    loadSource(parsed);
    setLibraryOpen(false);
    setVideoTitle(item.title);
    toast.success(
      parsed.kind === "playlist" ? "Playlist carregada" : "Vídeo carregado",
    );
  };

  const removeSaved = (id: string) => {
    setLibrary((l) => l.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const startEditing = (item: SavedSource) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setLibrary((l) =>
        l.map((item) =>
          item.id === editingId ? { ...item, title: trimmed } : item,
        ),
      );
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {}
  };

  const toggleMute = () => setMuted((m) => !m);
  const toggleExpanded = () => setExpanded((e) => !e);
  const toggleCollapsed = () => setCollapsed((c) => !c);

  const skipNext = () => {
    if (!playerRef.current || !playerReady) return;
    if (kind === "playlist") {
      try {
        playerRef.current.nextVideo();
        setCurrentTime(0);
      } catch {}
    }
  };

  const skipPrev = () => {
    if (!playerRef.current || !playerReady) return;
    if (kind === "playlist") {
      try {
        playerRef.current.previousVideo();
        setCurrentTime(0);
      } catch {}
    }
  };

  const seek = (value: number) => {
    if (!playerRef.current || !playerReady || !duration) return;
    try {
      playerRef.current.seekTo(value, true);
      setCurrentTime(value);
    } catch {}
  };

  const openInYouTube = () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasSource = url && kind;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTitle = videoTitle || (kind === "video" ? "Vídeo" : "Playlist");

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-4 w-full">
        <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border border-border bg-card/70 backdrop-blur transition-[width] duration-200 ${
        expanded && !collapsed ? "w-[36rem]" : "w-full"
      }`}
    >
      <div
        className={
          collapsed ? "relative w-full h-24" : "relative w-full aspect-video"
        }
      >
        <div
          className={
            collapsed
              ? "absolute left-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-lg overflow-hidden border border-border bg-background shadow-sm"
              : "absolute inset-0 w-full h-full overflow-hidden rounded-t-xl bg-background"
          }
        >
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          {collapsed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" />
          )}
        </div>

        {collapsed && (
          <>
            <div className="absolute left-24 right-3 top-4 flex items-center gap-2">
              <span className="text-xs font-medium truncate block leading-tight flex-1 min-w-0">
                {displayTitle}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>
            </div>

            <div className="absolute left-24 right-3 bottom-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    seek(pct * duration);
                  }}
                  className="flex-1 h-1 rounded-full bg-muted overflow-hidden"
                  aria-label="Progresso"
                >
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-0.5">
                <div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={skipPrev}
                    disabled={
                      !playerReady || playerError || kind !== "playlist"
                    }
                    aria-label="Anterior"
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <SkipBack className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={togglePlay}
                    disabled={!playerReady || playerError}
                    aria-label={playing ? "Pausar" : "Reproduzir"}
                    className="text-foreground hover:bg-accent h-8 w-8"
                  >
                    {playing ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={skipNext}
                    disabled={
                      !playerReady || playerError || kind !== "playlist"
                    }
                    aria-label="Próxima"
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleCollapsed}
                  aria-label="Expandir"
                  className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="flex flex-col p-4 gap-4">
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
              <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
                <PopoverTrigger
                  className={`${iconButtonClass} relative`}
                  aria-label="Playlists salvas"
                  title="Playlists salvas"
                >
                  <ListMusic className="h-4 w-4" />
                  {library.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center px-1">
                      {library.length}
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="end"
                  className="w-72 p-2 flex flex-col gap-1"
                >
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Playlists salvas
                  </div>
                  {library.length === 0 ? (
                    <div className="px-2 py-6 text-xs text-muted-foreground text-center">
                      Nenhuma playlist salva ainda.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                      {library.map((item) => {
                        const active = url === item.url;
                        const isEditing = editingId === item.id;
                        return (
                          <li
                            key={item.id}
                            className="group flex items-center gap-1"
                          >
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-1 px-1 py-0.5">
                                <input
                                  value={editingTitle}
                                  onChange={(e) =>
                                    setEditingTitle(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitEditing();
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  autoFocus
                                  className="flex-1 h-8 rounded-md border border-border bg-background/60 px-2 text-sm focus:outline-none focus:border-foreground/30"
                                />
                                <button
                                  onClick={commitEditing}
                                  aria-label="Salvar"
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => playSaved(item)}
                                className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors min-w-0 ${
                                  active
                                    ? "bg-accent/40 text-foreground"
                                    : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                                }`}
                              >
                                {active ? (
                                  <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="truncate">{item.title}</span>
                              </button>
                            )}

                            {!isEditing && (
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditing(item)}
                                  aria-label="Renomear"
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeSaved(item.id)}
                                  aria-label="Remover"
                                  className="p-1 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </PopoverContent>
              </Popover>

              {hasSource && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={openInYouTube}
                    aria-label="Abrir no YouTube"
                    title="Abrir no YouTube"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink />
                  </Button>
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
                </>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expandir" : "Colapsar"}
                title={collapsed ? "Modo compacto" : "Modo expandido"}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronDown />
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
                className="h-10 rounded-md w-full"
              >
                <Plus className="w-4 h-4" />
                Carregar
              </Button>
            </div>
          ) : (
            <>
              {playerError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive flex flex-col gap-2">
                  <span>Não foi possível carregar a mídia aqui.</span>
                  <button
                    onClick={openInYouTube}
                    className="self-start underline underline-offset-2 hover:no-underline"
                  >
                    Abrir no YouTube
                  </button>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">
                  {formatTime(currentTime)}
                </span>
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    seek(pct * duration);
                  }}
                  className="flex-1 h-1 rounded-full bg-muted overflow-hidden"
                  aria-label="Progresso"
                >
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </button>
                <span className="text-[10px] tabular-nums text-muted-foreground w-8">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={togglePlay}
                    disabled={!playerReady || playerError}
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
                        disabled={!playerReady || playerError}
                        aria-label="Anterior"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <SkipBack />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={skipNext}
                        disabled={!playerReady || playerError}
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
                  onClick={stop}
                  aria-label="Remover playlist"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
