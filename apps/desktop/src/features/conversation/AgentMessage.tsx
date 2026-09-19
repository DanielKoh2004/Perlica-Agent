import React from "react";
import type { Message } from "@perlica/contracts";
import { Sparkles } from "lucide-react";

interface AgentMessageProps {
  message: Message;
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start gap-3 w-full animate-fade-in">
      <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 max-w-2xl rounded-2xl px-4 py-2.5 bg-surface/80 border border-border/80 text-foreground/95 text-sm shadow-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};
