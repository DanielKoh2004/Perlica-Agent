import React from "react";
import { useCurrentTask } from "../../hooks/useCurrentTask.js";
import { TaskEmptyState } from "./TaskEmptyState.js";
import { TaskStatusBadge } from "./TaskStatusBadge.js";
import { TaskProgressBar } from "./TaskProgressBar.js";
import { TaskApprovalCard } from "./TaskApprovalCard.js";
import { TaskFailureAlert } from "./TaskFailureAlert.js";
import { TaskStepsList } from "./TaskStepsList.js";

/**
 * Coordinator component for the ongoing task sidebar.
 * Composes status, progress, approval, failure, and step subcomponents.
 */
export const TaskSidebar: React.FC = () => {
  const { currentTask, waitingApproval, resolveApproval, cancelCurrentTask } =
    useCurrentTask();

  return (
    <aside className="w-72 h-full bg-surface/50 border-l border-border/60 flex flex-col select-none shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/70">
          Ongoing Task
        </span>
        {currentTask && <TaskStatusBadge status={currentTask.status} />}
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
              <TaskProgressBar progress={currentTask.progress} />
            )}

            {/* Approval Required Card if waiting */}
            {waitingApproval && (
              <TaskApprovalCard approval={waitingApproval} onResolve={resolveApproval} />
            )}

            {/* Failure state alert with retry */}
            {currentTask.status === "failed" && (
              <TaskFailureAlert error={currentTask.error} onDismiss={cancelCurrentTask} />
            )}

            {/* Step checklist */}
            <TaskStepsList steps={currentTask.steps} />

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
