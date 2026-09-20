import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface TaskFailureAlertProps {
  error?: string;
  onDismiss: () => void;
}

export const TaskFailureAlert: React.FC<TaskFailureAlertProps> = ({
  error,
  onDismiss,
}) => {
  return (
    <div className="p-3 rounded-xl bg-destructive-soft border border-destructive/30 space-y-2">
      <div className="flex items-center gap-1.5 text-destructive font-medium text-xs">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Task Failed</span>
      </div>
      <p className="text-[11px] text-foreground/90">
        {error || "Unable to complete operation."}
      </p>
      <button
        onClick={onDismiss}
        className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-medium bg-surface-elevated text-foreground rounded-lg hover:bg-surface-secondary border border-border transition-colors"
      >
        <RotateCcw className="w-3 h-3 text-muted-foreground" />
        Dismiss / Reset
      </button>
    </div>
  );
};
