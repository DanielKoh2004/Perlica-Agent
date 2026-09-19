import React from "react";
import { CheckCircle2 } from "lucide-react";

export const TaskEmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="w-10 h-10 rounded-xl bg-surface-secondary/70 border border-border/60 flex items-center justify-center text-muted-foreground/50 mb-3">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-medium text-foreground/90">Nothing running</h4>
      <p className="text-[11px] text-muted-foreground/70 mt-1 max-w-[180px]">
        Perlica is ready when you are.
      </p>
    </div>
  );
};
