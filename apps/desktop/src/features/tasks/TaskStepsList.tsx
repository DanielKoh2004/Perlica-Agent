import React from "react";
import type { TaskStep } from "@perlica/contracts";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface TaskStepsListProps {
  steps: TaskStep[];
}

export const TaskStepsList: React.FC<TaskStepsListProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        Plan & Steps
      </div>
      <div className="space-y-1">
        {steps.map((step) => {
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
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                {isRunning && (
                  <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                )}
                {isFailed && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
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
  );
};
