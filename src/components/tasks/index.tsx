"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsLeft, ChevronsRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type Task = {
  id: string;
  title: string;
  done: boolean;
};

const STORAGE_KEY = "timecraft:tasks";
const COLLAPSED_KEY = "timecraft:tasks-collapsed";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    const storedCollapsed = localStorage.getItem(COLLAPSED_KEY);

    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
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
    setTasks((t) => [...t, { id: crypto.randomUUID(), title, done: false }]);
    setDraft("");
  };

  const toggleTask = (id: string) => {
    setTasks((t) =>
      t.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks((t) => t.filter((task) => task.id !== id));
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const visibleTasks = tasks.slice(0, 8);

  if (!mounted) {
    return (
      <aside className="hidden lg:flex fixed top-0 left-0 h-full z-30 flex-col items-center justify-center w-20">
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
      <aside className="hidden lg:flex fixed top-0 left-0 h-full z-30 flex-col items-center justify-center w-20">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur p-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(false)}
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
            {visibleTasks.map((task) => (
              <span
                key={task.id}
                title={task.title}
                className={`w-7 h-7 rounded-md flex items-center justify-center border transition-colors ${
                  task.done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground"
                }`}
              >
                {task.done ? <Check className="w-3.5 h-3.5" /> : null}
              </span>
            ))}
            {tasks.length > 8 && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                +{tasks.length - 8}
              </span>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-full z-30 flex-col items-start justify-center px-6">
      <div className="flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur p-6 w-72">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Tarefas</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {doneCount}/{tasks.length}
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

        <div className="flex items-center gap-2 mb-5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            placeholder="Nova tarefa…"
            className="flex-1 h-10 rounded-md border border-border bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={addTask}
            aria-label="Adicionar tarefa"
            className="h-10 w-10 rounded-md"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <ul className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {tasks.length === 0 && (
            <li className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
              Nenhuma tarefa ainda.
            </li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                task.done
                  ? "border-primary/20 bg-primary/5 text-muted-foreground"
                  : "border-border/60 bg-transparent text-foreground"
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center border ${
                    task.done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-transparent"
                  }`}
                >
                  {task.done && <Check className="w-3 h-3" />}
                </span>
                <span className={`truncate ${task.done ? "line-through" : ""}`}>
                  {task.title}
                </span>
              </button>
              <button
                onClick={() => removeTask(task.id)}
                aria-label="Remover tarefa"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
          Organize o que vai focar em cada sessão. Pressione Enter para
          adicionar.
        </div>
      </div>
    </aside>
  );
}
