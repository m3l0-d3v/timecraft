"use client";

import { Volume2, Volume1, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { toNumber } from "./utils";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type VolumePopoverProps = {
  volume: number;
  muted: boolean;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
};

export function VolumePopover({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}: VolumePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger className={iconButtonClass} aria-label="Volume">
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
          <span className="text-xs text-muted-foreground">Volume</span>
          <button
            onClick={onToggleMute}
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {muted ? "Ativar" : "Silenciar"}
          </button>
        </div>
        <Slider
          value={[muted ? 0 : volume * 100]}
          onValueChange={(v) => {
            const next = toNumber(v) / 100;
            onVolumeChange(next);
            if (next > 0 && muted) onToggleMute();
          }}
          max={100}
          step={1}
        />
        <span className="text-[10px] tabular-nums text-muted-foreground text-right">
          {Math.round((muted ? 0 : volume) * 100)}%
        </span>
      </PopoverContent>
    </Popover>
  );
}
