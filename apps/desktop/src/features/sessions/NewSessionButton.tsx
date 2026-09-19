import React from "react";
import { Plus } from "lucide-react";

interface NewSessionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const NewSessionButton: React.FC<NewSessionButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-surface-secondary hover:bg-surface-elevated text-foreground/90 hover:text-foreground border border-border/80 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
    >
      <Plus className="w-3.5 h-3.5 text-accent" />
      <span>New Session</span>
    </button>
  );
};
