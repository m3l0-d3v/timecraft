import { Command } from "lucide-react";

export default function Header() {
  return (
    <header className="shrink-0 w-full border-b border-border/60 bg-background/70">
      <div className="w-full flex items-center justify-between px-6 lg:px-10 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Command className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold tracking-tight text-[15px]">
            Timecraft
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-1">
            v1
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Pronto para começar</span>
        </div>
      </div>
    </header>
  );
}
