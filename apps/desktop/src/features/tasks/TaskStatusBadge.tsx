import React from "react";
import type { TaskStatus } from "@perlica/contracts";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, Loader2 } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "running":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/15 text-accent border border-accent/25">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Running
        </span>
      );
    case "verifying":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Verifying
        </span>
      );
    case "waiting":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/15 text-warning border border-warning/25 animate-pulse">
          <ShieldAlert className="w-2.5 h-2.5" />
          Waiting for You
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success border border-success/25">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Completed
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/15 text-destructive border border-destructive/25">
          <AlertCircle className="w-2.5 h-2.5" />
          Failed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
          Cancelled
        </span>
      );
    case "created":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-secondary text-muted-foreground border border-border">
          <Clock className="w-2.5 h-2.5" />
          Starting
        </span>
      );
  }
};
