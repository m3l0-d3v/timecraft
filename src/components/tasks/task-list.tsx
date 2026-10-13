"use client";

import { TaskItem } from "./task-item";
import type { Task, TaskStatus } from "./constants";

type TaskListProps = {
  tasks: Task[];
  counts: Record<TaskStatus, number>;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRemove: (id: string) => void;
};

export function TaskList({
  tasks,
  counts,
  onStatusChange,
  onRemove,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
        Nenhuma tarefa ainda.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 max-h-[30vh] overflow-y-auto pr-1">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          counts={counts}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
