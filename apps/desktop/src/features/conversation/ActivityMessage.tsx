import React, { useState } from "react";
import type { Message } from "@perlica/contracts";
import { ChevronRight, Wrench, CheckCircle2, Clock } from "lucide-react";

interface ActivityMessageProps {
  message: Message;
}

export const ActivityMessage: React.FC<ActivityMessageProps> = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  const act = message.activity;

  return (
    <div className="pl-9 w-full animate-fade-in my-1">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/40 hover:bg-surface-secondary/70 border border-border/50 text-xs text-muted-foreground transition-colors cursor-pointer select-none"
      >
        <ChevronRight
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        <CheckCircle2 className="w-3.5 h-3.5 text-success/80" />
        <span className="text-foreground/80 font-medium">
          {act?.step || message.content}
        </span>
        {act?.durationMs && (
          <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {act.durationMs}ms
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-1.5 ml-5 p-2.5 rounded-lg bg-surface-secondary/50 border border-border/50 text-[11px] text-muted-foreground space-y-1 max-w-md animate-fade-in font-mono">
          <div className="flex items-center gap-1.5 text-foreground/80 font-sans">
            <Wrench className="w-3 h-3 text-accent" />
            <span>Operational Detail</span>
          </div>
          {act?.toolName && (
            <div>
              <span className="text-muted-foreground/60">Tool: </span>
              <span className="text-accent">{act.toolName}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground/60">Status: </span>
            <span className="text-success">{act?.status || "completed"}</span>
          </div>
          <p className="font-sans text-muted-foreground/80 pt-0.5">{message.content}</p>
        </div>
      )}
    </div>
  );
};
