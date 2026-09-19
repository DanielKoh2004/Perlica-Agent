import React from "react";
import type { Message } from "@perlica/contracts";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

interface ResultMessageProps {
  message: Message;
}

export const ResultMessage: React.FC<ResultMessageProps> = ({ message }) => {
  const res = message.result;
  if (!res) return null;

  return (
    <div className="pl-9 w-full max-w-xl animate-fade-in my-2">
      <div className="p-4 rounded-2xl bg-surface/90 border border-accent/30 shadow-md space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-accent font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Perlica Recommendation</span>
          </div>

          {res.verification && res.verification.status === "passed" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-soft text-success border border-success/30">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Title & summary */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{res.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {res.summary}
          </p>
        </div>

        {/* Action buttons */}
        {res.actions && res.actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {res.actions.map((act) => (
              <button
                key={act.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-secondary hover:bg-surface-elevated text-foreground border border-border/80 transition-colors shadow-sm active:scale-95"
              >
                <span>{act.label}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
