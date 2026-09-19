import React from "react";
import type { Session } from "@perlica/contracts";
import { MessageSquare, Trash2 } from "lucide-react";

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
        isActive
          ? "bg-accent/10 text-foreground font-medium border border-accent/25"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-secondary/70 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-6">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? "text-accent" : "text-muted-foreground/60"
          }`}
        />
        <span className="truncate block" title={session.title}>
          {session.title}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-surface-elevated rounded transition-opacity"
        title="Delete session"
        aria-label={`Delete session ${session.title}`}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};
