"use client";

import { ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "./status-icon";
import type { Task } from "./constants";

type CollapsedViewProps = {
  tasks: Task[];
  doneCount: number;
  onExpand: () => void;
};

export function CollapsedView({
  tasks,
  doneCount,
  onExpand,
}: CollapsedViewProps) {
  const visible = tasks.slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onExpand}
        aria-label="Expandir tarefas"
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronsRight />
      </Button>

      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground mt-1">
        {doneCount}/{tasks.length}
      </span>

      <div className="flex flex-col items-center gap-1.5 mt-1">
        {tasks.length === 0 && (
          <span className="w-7 h-7 rounded-md border border-dashed border-border" />
        )}
        {visible.map((task) => (
          <span
            key={task.id}
            title={task.title}
            className="w-7 h-7 rounded-md flex items-center justify-center border border-border bg-transparent text-muted-foreground"
          >
            <StatusIcon status={task.status} className="w-3.5 h-3.5" />
          </span>
        ))}
        {tasks.length > 8 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            +{tasks.length - 8}
          </span>
        )}
      </div>
    </div>
  );
}
