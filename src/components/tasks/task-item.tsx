"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPicker } from "./status-picker";
import type { Task, TaskStatus } from "./constants";

type TaskItemProps = {
  task: Task;
  counts: Record<TaskStatus, number>;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRemove: (id: string) => void;
};

export function TaskItem({
  task,
  counts,
  onStatusChange,
  onRemove,
}: TaskItemProps) {
  return (
    <li className="group">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors hover:bg-accent/40">
        <StatusPicker
          currentStatus={task.status}
          counts={counts}
          onSelect={(status) => onStatusChange(task.id, status)}
        />

        <span
          className={cn(
            "truncate flex-1 min-w-0",
            task.status === "done" && "line-through text-muted-foreground",
            task.status === "canceled" && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </span>

        <button
          onClick={() => onRemove(task.id)}
          aria-label="Remover tarefa"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}
