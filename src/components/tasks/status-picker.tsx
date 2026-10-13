"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusIcon } from "./status-icon";
import { STATUSES, STATUS_MAP, type TaskStatus } from "./constants";

type StatusPickerProps = {
  currentStatus: TaskStatus;
  counts: Record<TaskStatus, number>;
  onSelect: (status: TaskStatus) => void;
};

export function StatusPicker({
  currentStatus,
  counts,
  onSelect,
}: StatusPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = STATUS_MAP[currentStatus];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATUSES;
    return STATUSES.filter((status) => status.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlighted(0);
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const status = filtered[highlighted];
        if (status) {
          onSelect(status.value);
          setOpen(false);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filtered, highlighted, onSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Mudar status"
        className={cn(
          "shrink-0 flex items-center justify-center w-5 h-5 rounded-sm transition-colors hover:bg-accent",
          config.color,
        )}
      >
        <StatusIcon status={currentStatus} className="w-4 h-4" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-56 p-0 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="px-3 py-2 border-b border-border/60">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mudar status…"
            className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <ul className="flex flex-col p-1 max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-[11px] text-muted-foreground text-center">
              Nenhum status encontrado.
            </li>
          )}

          {filtered.map((status, index) => {
            const active = status.value === currentStatus;
            const highlightedRow = index === highlighted;
            const count = counts[STATUS_MAP[status.value].value] ?? 0;

            return (
              <li key={status.value}>
                <button
                  onClick={() => {
                    onSelect(status.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors",
                    highlightedRow && "bg-accent",
                  )}
                >
                  <StatusIcon
                    status={status.value}
                    className={cn("w-3.5 h-3.5 shrink-0", status.color)}
                  />
                  <span className="flex-1 truncate">{status.label}</span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground w-4 text-right">
                    {count}
                  </span>
                  {active && (
                    <Check className="w-3 h-3 shrink-0 text-foreground" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
