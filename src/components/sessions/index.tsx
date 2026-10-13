"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STORAGE_KEY = "timecraft:sessions-collapsed";

export default function Sessions({
  cycles,
  totalCycles,
}: {
  cycles: number;
  totalCycles: number;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") setCollapsed(false);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, mounted]);

  const progressPct = (cycles / totalCycles) * 100;

  if (!mounted) {
    return (
      <aside className="hidden lg:flex fixed top-0 right-0 h-full z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-3 w-8 rounded-sm mt-1" />
          <div className="flex flex-col items-center gap-1.5 mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-md" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="hidden lg:flex fixed top-0 right-0 h-full z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir sessões"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronsLeft />
          </Button>

          <div className="flex flex-col items-center gap-1.5 mt-1">
            {Array.from({ length: totalCycles }).map((_, i) => {
              const done = i < cycles;
              const active = i === cycles;
              return (
                <span
                  key={i}
                  title={`Sessão ${i + 1}`}
                  className={`w-7 h-7 rounded-md flex items-center justify-center border text-[10px] font-semibold tabular-nums transition-colors ${
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : active
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-transparent text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex fixed top-0 right-0 h-full z-30 flex-col items-end justify-center px-6">
      <div className="flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur p-6 w-72">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Sessões</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {cycles}/{totalCycles}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(true)}
            aria-label="Colapsar sessões"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronsRight />
          </Button>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-6">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="flex flex-col gap-2">
          {Array.from({ length: totalCycles }).map((_, i) => {
            const done = i < cycles;
            const active = i === cycles;
            return (
              <li
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
                  done
                    ? "border-primary/20 bg-primary/5 text-foreground"
                    : active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 bg-transparent text-muted-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-transparent"
                    }`}
                  >
                    {done && <Check className="w-3 h-3" />}
                  </span>
                  <span>Sessão {i + 1}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider">
                  {done ? "feita" : active ? "agora" : "—"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
          Cada ciclo completo soma 25 minutos de foco. Complete 8 para fechar o
          dia.
        </div>
      </div>
    </aside>
  );
}
