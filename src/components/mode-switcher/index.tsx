"use client";

import { Zap, Coffee, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Mode = "work" | "short" | "long";

const MODES: {
  key: Mode;
  label: string;
  duration: string;
  icon: LucideIcon;
}[] = [
  { key: "work", label: "Foco", duration: "25 min", icon: Zap },
  { key: "short", label: "Pausa curta", duration: "5 min", icon: Coffee },
  { key: "long", label: "Pausa longa", duration: "15 min", icon: Moon },
];

export default function ModeSwitcher({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {MODES.map((m) => {
        const active = value === m.key;
        const Icon = m.icon;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`flex items-center gap-3 rounded-full border px-7 py-3.5 transition-colors ${
              active
                ? "border-foreground/70 bg-foreground/5 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex items-baseline gap-2.5">
              <span className="text-base font-medium tracking-tight">
                {m.label}
              </span>
              <span className="text-xs tabular-nums opacity-60">
                {m.duration}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
