export const STORAGE_KEY = "timecraft:tasks";
export const COLLAPSED_KEY = "timecraft:tasks-collapsed";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "done"
  | "canceled"
  | "duplicate";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
};

export type StatusConfig = {
  value: TaskStatus;
  label: string;
  shortcut: string;
  color: string;
};

export const STATUSES: StatusConfig[] = [
  {
    value: "backlog",
    label: "Backlog",
    shortcut: "1",
    color: "text-muted-foreground",
  },
  {
    value: "todo",
    label: "A fazer",
    shortcut: "2",
    color: "text-foreground",
  },
  {
    value: "in_progress",
    label: "Em andamento",
    shortcut: "3",
    color: "text-amber-500",
  },
  {
    value: "done",
    label: "Concluído",
    shortcut: "4",
    color: "text-violet-500",
  },
  {
    value: "canceled",
    label: "Cancelado",
    shortcut: "5",
    color: "text-muted-foreground",
  },
  {
    value: "duplicate",
    label: "Duplicado",
    shortcut: "6",
    color: "text-muted-foreground",
  },
];

export const STATUS_MAP: Record<TaskStatus, StatusConfig> = STATUSES.reduce(
  (acc, status) => {
    acc[status.value] = status;
    return acc;
  },
  {} as Record<TaskStatus, StatusConfig>,
);
