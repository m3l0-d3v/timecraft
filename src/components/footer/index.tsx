"use client";

import {
  EyeOff,
  History,
  User,
  Settings,
  Puzzle,
  Timer as TimerIcon,
  Clock as ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../theme-toggle";

type Tool = "timer" | "clock";

export default function Footer({
  tool,
  onToolChange,
}: {
  tool: Tool;
  onToolChange: (t: Tool) => void;
}) {
  return (
    <footer className="shrink-0 w-full border-t border-border/60 bg-background/70">
      <div className="relative w-full flex items-center justify-between px-6 lg:px-10 py-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Modo oculto">
            <EyeOff />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            PT
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Histórico">
            <History />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Perfil">
            <User />
          </Button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full border border-border p-0.5">
          <button
            onClick={() => onToolChange("timer")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs transition-colors ${
              tool === "timer"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TimerIcon className="w-3.5 h-3.5" />
            Timer
          </button>
          <button
            onClick={() => onToolChange("clock")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs transition-colors ${
              tool === "clock"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            Clock
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Configurações">
              <Settings />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Extensões">
              <Puzzle />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
