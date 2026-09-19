import React from "react";
import { ArrowUpRight } from "lucide-react";

export interface SuggestedAction {
  id: string;
  title: string;
  description?: string;
  prompt: string;
}

interface SuggestionCardProps {
  action: SuggestedAction;
  onSelect: (prompt: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ action, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(action.prompt)}
      className="group flex flex-col justify-between text-left p-3.5 rounded-xl bg-surface/70 hover:bg-surface-secondary/80 border border-border/80 hover:border-accent/30 transition-all duration-150 shadow-sm active:scale-[0.99] w-full"
    >
      <div className="flex items-start justify-between w-full gap-2">
        <h3 className="text-xs font-medium text-foreground/90 group-hover:text-accent transition-colors">
          {action.title}
        </h3>
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0" />
      </div>
      {action.description && (
        <p className="text-[11px] text-muted-foreground/75 mt-1 line-clamp-2">
          {action.description}
        </p>
      )}
    </button>
  );
};
