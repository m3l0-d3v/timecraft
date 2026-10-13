"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Playlist from "../playlist";
import { CollapsedView } from "./collapsed-view";
import { StatusFilter } from "./status-filter";
import { TaskList } from "./task-list";
import {
  COLLAPSED_KEY,
  STATUSES,
  STORAGE_KEY,
  type Task,
  type TaskStatus,
} from "./constants";

export type { Task } from "./constants";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<TaskStatus>>(
    () => new Set(),
  );
  const skipFirstSave = useRef(true);

  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    const storedCollapsed = localStorage.getItem(COLLAPSED_KEY);

    if (storedTasks) {
      try {
        const parsed = JSON.parse(storedTasks) as Array<
          Partial<Task> & { done?: boolean }
        >;
        const migrated: Task[] = parsed.map((t) => {
          const status: TaskStatus =
            typeof t.status === "string"
              ? (t.status as TaskStatus)
              : t.done
                ? "done"
                : "todo";
          return {
            id: t.id ?? crypto.randomUUID(),
            title: t.title ?? "",
            status,
          };
        });
        setTasks(migrated);
      } catch {}
    }
    if (storedCollapsed === "false") setCollapsed(false);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed, mounted]);

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), title, status: "todo" }]);
    setDraft("");
  };

  const changeStatus = (id: string, status: TaskStatus) => {
    setTasks((t) =>
      t.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks((t) => t.filter((task) => task.id !== id));
  };

  const toggleFilter = (status: TaskStatus) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
  };

  const counts = useMemo(() => {
    const base = STATUSES.reduce(
      (acc, status) => {
        acc[status.value] = 0;
        return acc;
      },
      {} as Record<TaskStatus, number>,
    );
    for (const task of tasks) base[task.status] += 1;
    return base;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilters.size === 0) return tasks;
    return tasks.filter((task) => activeFilters.has(task.status));
  }, [tasks, activeFilters]);

  const filteredCounts = useMemo(() => {
    const base = STATUSES.reduce(
      (acc, status) => {
        acc[status.value] = 0;
        return acc;
      },
      {} as Record<TaskStatus, number>,
    );
    for (const task of filteredTasks) base[task.status] += 1;
    return base;
  }, [filteredTasks]);

  const doneCount = counts.done;
  const totalCount = tasks.length;

  const hiddenCount = tasks.length - filteredTasks.length;

  if (!mounted) {
    return (
      <aside className="hidden xl:flex fixed top-0 left-0 h-full z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-3 w-8 rounded-sm mt-1" />
          <div className="flex flex-col items-center gap-1.5 mt-1">
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="hidden xl:flex fixed top-0 left-0 h-full z-30 flex-col items-center justify-center w-20">
        <CollapsedView
          tasks={tasks}
          doneCount={doneCount}
          onExpand={() => setCollapsed(false)}
        />
      </aside>
    );
  }

  return (
    <aside className="hidden xl:flex fixed top-0 left-0 h-full z-30 flex-col justify-center px-6">
      <div className="flex flex-col gap-4 w-72">
        <div className="flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Tarefas</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {doneCount}/{totalCount}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(true)}
              aria-label="Colapsar tarefas"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronsLeft />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
              placeholder="Nova tarefa…"
              className="flex-1 h-9 rounded-md border border-border bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={addTask}
              aria-label="Adicionar tarefa"
              className="h-9 w-9 rounded-md"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <StatusFilter
              activeFilters={activeFilters}
              counts={counts}
              onToggle={toggleFilter}
              onClear={clearFilters}
            />
          </div>

          <TaskList
            tasks={filteredTasks}
            counts={filteredCounts}
            onStatusChange={changeStatus}
            onRemove={removeTask}
          />

          {activeFilters.size > 0 && hiddenCount > 0 && (
            <div className="mt-3 text-[10px] text-muted-foreground text-center tabular-nums">
              {hiddenCount} oculta{hiddenCount === 1 ? "" : "s"} pelo filtro
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
            Clique no ícone ao lado da tarefa para alterar o status.
          </div>
        </div>

        <Playlist />
      </div>
    </aside>
  );
}
