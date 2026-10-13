"use client";

import { Play, Pause, SkipBack, SkipForward, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "./utils";
import type { SourceKind } from "./constants";

type CollapsedViewProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  displayTitle: string;
  kind: SourceKind | null;
  playerReady: boolean;
  playerError: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  progressPct: number;
  onTogglePlay: () => void;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onSeek: (value: number) => void;
  onToggleCollapsed: () => void;
};

export function CollapsedView({
  containerRef,
  displayTitle,
  kind,
  playerReady,
  playerError,
  playing,
  currentTime,
  duration,
  progressPct,
  onTogglePlay,
  onSkipPrev,
  onSkipNext,
  onSeek,
  onToggleCollapsed,
}: CollapsedViewProps) {
  const disabledPlay = !playerReady || playerError;
  const disabledSkip = disabledPlay || kind !== "playlist";

  return (
    <div className="flex items-center gap-3 w-full h-24 px-3">
      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border bg-background shadow-sm">
        <div ref={containerRef} className="w-full h-full pointer-events-none" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium truncate block leading-tight flex-1 min-w-0">
            {displayTitle}
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
            {formatTime(currentTime)}/{formatTime(duration)}
          </span>
        </div>

        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            onSeek(pct * duration);
          }}
          className="w-full h-1 rounded-full bg-muted overflow-hidden"
          aria-label="Progresso"
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </button>

        <div className="flex items-center justify-between gap-0.5">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onSkipPrev}
              disabled={disabledSkip}
              aria-label="Anterior"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onTogglePlay}
              disabled={disabledPlay}
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
              onClick={onSkipNext}
              disabled={disabledSkip}
              aria-label="Próxima"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapsed}
            aria-label="Expandir"
            className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
