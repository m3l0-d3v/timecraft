"use client";

import {
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  CircleSlash,
} from "lucide-react";
import type { TaskStatus } from "./constants";

export function StatusIcon({
  status,
  className = "w-4 h-4",
}: {
  status: TaskStatus;
  className?: string;
}) {
  switch (status) {
    case "backlog":
      return <Circle className={className} strokeDasharray="2 3" />;
    case "todo":
      return <Circle className={className} />;
    case "in_progress":
      return <CircleDot className={className} />;
    case "done":
      return <CheckCircle2 className={className} />;
    case "canceled":
      return <XCircle className={className} />;
    case "duplicate":
      return <CircleSlash className={className} />;
    default:
      return <Circle className={className} />;
  }
}
