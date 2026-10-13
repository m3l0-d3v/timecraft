"use client";

import {
  ListMusic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  ExternalLink,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryPopover } from "./library-popover";
import { VolumePopover } from "./volume-popover";
import { formatTime } from "./utils";
import type { SavedSource, SourceKind } from "./constants";

type ExpandedViewProps = {
  kind: SourceKind | null;
  expanded: boolean;
  hasSource: boolean;
  playerReady: boolean;
  playerError: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  progressPct: number;
  volume: number;
  muted: boolean;
  library: SavedSource[];
  draft: string;
  url: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onTogglePlay: () => void;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onSeek: (value: number) => void;
  onToggleExpanded: () => void;
  onToggleCollapsed: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
  onOpenInYouTube: () => void;
  onStop: () => void;
  onPlaySaved: (item: SavedSource) => void;
  onRemoveSaved: (id: string) => void;
  onRenameSaved: (id: string, title: string) => void;
};

export function ExpandedView({
  kind,
  expanded,
  hasSource,
  playerReady,
  playerError,
  playing,
  currentTime,
  duration,
  progressPct,
  volume,
  muted,
  library,
  draft,
  url,
  onDraftChange,
  onSave,
  onTogglePlay,
  onSkipPrev,
  onSkipNext,
  onSeek,
  onToggleExpanded,
  onToggleCollapsed,
  onToggleMute,
  onVolumeChange,
  onOpenInYouTube,
  onStop,
  onPlaySaved,
  onRemoveSaved,
  onRenameSaved,
}: ExpandedViewProps) {
  const disabledPlay = !playerReady || playerError;
  const disabledSkip = disabledPlay || kind !== "playlist";

  return (
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
          <LibraryPopover
            library={library}
            activeUrl={url}
            onPlay={onPlaySaved}
            onRemove={onRemoveSaved}
            onRename={onRenameSaved}
          />

          {hasSource && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onOpenInYouTube}
                aria-label="Abrir no YouTube"
                title="Abrir no YouTube"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleExpanded}
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
            onClick={onToggleCollapsed}
            aria-label="Colapsar"
            title="Modo compacto"
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
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
            }}
            placeholder="Cole o link do YouTube…"
            className="h-10 rounded-md border border-border bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
          />
          <Button
            variant="outline"
            onClick={onSave}
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
                onClick={onOpenInYouTube}
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
                onSeek(pct * duration);
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
                onClick={onTogglePlay}
                disabled={disabledPlay}
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
                    onClick={onSkipPrev}
                    disabled={disabledSkip}
                    aria-label="Anterior"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipBack />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onSkipNext}
                    disabled={disabledSkip}
                    aria-label="Próxima"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward />
                  </Button>
                </>
              )}

              <VolumePopover
                volume={volume}
                muted={muted}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
              />
            </div>

            <button
              onClick={onStop}
              aria-label="Remover playlist"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
