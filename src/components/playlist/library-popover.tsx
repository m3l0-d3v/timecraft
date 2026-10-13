"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ListMusic, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SavedSource } from "./constants";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type LibraryPopoverProps = {
  library: SavedSource[];
  activeUrl: string;
  onPlay: (item: SavedSource) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
};

export function LibraryPopover({
  library,
  activeUrl,
  onPlay,
  onRemove,
  onRename,
}: LibraryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const startEditing = (item: SavedSource) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              const active = activeUrl === item.url;
              const isEditing = editingId === item.id;
              return (
                <li key={item.id} className="group flex items-center gap-1">
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-1 px-1 py-0.5">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
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
                      onClick={() => {
                        onPlay(item);
                        setOpen(false);
                      }}
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
                        onClick={() => onRemove(item.id)}
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
  );
}
