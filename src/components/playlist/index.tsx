"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  COLLAPSED_KEY,
  EXPANDED_KEY,
  LIBRARY_KEY,
  URL_KEY,
  VOLUME_KEY,
  type ParsedSource,
  type SavedSource,
  type SourceKind,
} from "./constants";
import { defaultTitle, makeId, parseYouTubeUrl } from "./utils";
import { useYouTubePlayer } from "./use-youtube-player";
import { CollapsedView } from "./collapsed-view";
import { ExpandedView } from "./expanded-view";

export default function Playlist() {
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<SourceKind | null>(null);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [library, setLibrary] = useState<SavedSource[]>([]);

  const player = useYouTubePlayer({
    url,
    kind,
    volume,
    muted,
    parse: parseYouTubeUrl,
  });

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

  const loadSource = useCallback(
    (source: ParsedSource) => {
      player.destroy();
      setUrl(source.url);
      setKind(source.kind);
    },
    [player],
  );

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
    player.destroy();
    setUrl("");
    setKind(null);
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
    player.setVideoTitle(item.title);
    toast.success(
      parsed.kind === "playlist" ? "Playlist carregada" : "Vídeo carregado",
    );
  };

  const removeSaved = (id: string) => {
    setLibrary((l) => l.filter((item) => item.id !== id));
  };

  const renameSaved = (id: string, title: string) => {
    setLibrary((l) =>
      l.map((item) => (item.id === id ? { ...item, title } : item)),
    );
  };

  const toggleMute = () => setMuted((m) => !m);
  const toggleExpanded = () => setExpanded((e) => !e);
  const toggleCollapsed = () => setCollapsed((c) => !c);
  const openInYouTube = () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasSource = Boolean(url && kind);
  const progressPct =
    player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;
  const displayTitle =
    player.videoTitle || (kind === "video" ? "Vídeo" : "Playlist");

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
            ref={player.containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>

        {collapsed && (
          <CollapsedView
            containerRef={player.containerRef}
            displayTitle={displayTitle}
            kind={kind}
            playerReady={player.playerReady}
            playerError={player.playerError}
            playing={player.playing}
            currentTime={player.currentTime}
            duration={player.duration}
            progressPct={progressPct}
            onTogglePlay={player.togglePlay}
            onSkipPrev={() => player.skipPrev(kind)}
            onSkipNext={() => player.skipNext(kind)}
            onSeek={player.seek}
            onToggleCollapsed={toggleCollapsed}
          />
        )}
      </div>

      {!collapsed && (
        <ExpandedView
          kind={kind}
          expanded={expanded}
          hasSource={hasSource}
          playerReady={player.playerReady}
          playerError={player.playerError}
          playing={player.playing}
          currentTime={player.currentTime}
          duration={player.duration}
          progressPct={progressPct}
          volume={volume}
          muted={muted}
          library={library}
          draft={draft}
          url={url}
          onDraftChange={setDraft}
          onSave={save}
          onTogglePlay={player.togglePlay}
          onSkipPrev={() => player.skipPrev(kind)}
          onSkipNext={() => player.skipNext(kind)}
          onSeek={player.seek}
          onToggleExpanded={toggleExpanded}
          onToggleCollapsed={toggleCollapsed}
          onToggleMute={toggleMute}
          onVolumeChange={setVolume}
          onOpenInYouTube={openInYouTube}
          onStop={stop}
          onPlaySaved={playSaved}
          onRemoveSaved={removeSaved}
          onRenameSaved={renameSaved}
        />
      )}
    </div>
  );
}
