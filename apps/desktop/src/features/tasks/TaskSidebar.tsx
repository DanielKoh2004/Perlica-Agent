import React from "react";
import { useCurrentTask } from "../../hooks/useCurrentTask.js";
import { TaskEmptyState } from "./TaskEmptyState.js";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import type { TaskStatus } from "@perlica/contracts";

export const TaskSidebar: React.FC = () => {
  const { currentTask, waitingApproval, resolveApproval, cancelCurrentTask } =
    useCurrentTask();

  const getStatusBadge = (status: TaskStatus) => {
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

  return (
    <aside className="w-72 h-full bg-surface/50 border-l border-border/60 flex flex-col select-none shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/70">
          Ongoing Task
        </span>
        {currentTask && getStatusBadge(currentTask.status)}
      </div>

      {/* Task Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {!currentTask ? (
          <TaskEmptyState />
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Task Title & Current Step */}
            <div>
              <h3 className="text-xs font-semibold text-foreground leading-snug">
                {currentTask.title}
              </h3>
              {currentTask.currentStep && (
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {currentTask.currentStep}
                </p>
              )}
            </div>

            {/* Progress bar */}
            {typeof currentTask.progress === "number" && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground/80 font-mono">
                  <span>Progress</span>
                  <span>{currentTask.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-accent transition-all duration-300 rounded-full"
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Approval Required Card if waiting */}
            {waitingApproval && (
              <div className="p-3 rounded-xl bg-warning-soft border border-warning/30 space-y-2">
                <div className="flex items-center gap-1.5 text-warning font-medium text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Approval Required</span>
                </div>
                <p className="text-[11px] text-foreground/90 font-medium">
                  {waitingApproval.action}
                </p>
                {waitingApproval.target && (
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    Target: {waitingApproval.target}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {waitingApproval.consequence}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => resolveApproval(waitingApproval.approvalId, true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-warning text-warning-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => resolveApproval(waitingApproval.approvalId, false)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-surface-elevated text-foreground rounded-lg hover:bg-surface-secondary border border-border transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Failure state alert with retry */}
            {currentTask.status === "failed" && (
              <div className="p-3 rounded-xl bg-destructive-soft border border-destructive/30 space-y-2">
                <div className="flex items-center gap-1.5 text-destructive font-medium text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Task Failed</span>
                </div>
                <p className="text-[11px] text-foreground/90">
                  {currentTask.error || "Unable to complete operation."}
                </p>
                <button
                  onClick={cancelCurrentTask}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-medium bg-surface-elevated text-foreground rounded-lg hover:bg-surface-secondary border border-border transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                  Dismiss / Reset
                </button>
              </div>
            )}

            {/* Step checklist */}
            {currentTask.steps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Plan & Steps
                </div>
                <div className="space-y-1">
                  {currentTask.steps.map((step) => {
                    const isDone = step.status === "completed";
                    const isRunning = step.status === "running";
                    const isFailed = step.status === "failed";

                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                          isRunning
                            ? "bg-accent/10 border border-accent/20 text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          )}
                          {isRunning && (
                            <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                          )}
                          {isFailed && (
                            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                          )}
                          {!isDone && !isRunning && !isFailed && (
                            <div className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center" />
                          )}
                        </div>
                        <span
                          className={`text-[11px] ${
                            isDone ? "text-foreground/80 line-through opacity-70" : ""
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancel Task button while running */}
            {(currentTask.status === "running" || currentTask.status === "verifying") && (
              <div className="pt-2">
                <button
                  onClick={cancelCurrentTask}
                  className="w-full py-1 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive-soft rounded border border-border transition-colors"
                >
                  Cancel Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
