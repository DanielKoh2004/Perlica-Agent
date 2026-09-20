import React from "react";

interface TaskProgressBarProps {
  progress: number;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ progress }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground/80 font-mono">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden border border-border/40">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
