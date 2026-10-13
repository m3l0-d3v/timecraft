"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now ? now.getHours().toString().padStart(2, "0") : "--";
  const minutes = now ? now.getMinutes().toString().padStart(2, "0") : "--";
  const seconds = now ? now.getSeconds().toString().padStart(2, "0") : "--";

  const dateLabel = now
    ? now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-[min(280px,34vh)] h-[min(280px,34vh)] flex items-center justify-center rounded-full border border-border bg-card/40">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2.5">
            Hora atual
          </span>
          <div className="text-[clamp(1.75rem,6.5vh,3.5rem)] font-bold tabular-nums tracking-tight leading-none">
            {hours}:{minutes}
            <span className="text-[0.5em] text-muted-foreground ml-1.5">
              {seconds}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground capitalize mt-2.5">
            {dateLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
