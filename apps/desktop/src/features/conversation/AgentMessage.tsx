import React from "react";
import type { Message } from "@perlica/contracts";

interface AgentMessageProps {
  message: Message;
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start gap-3 w-full animate-fade-in">
      <div className="w-8 h-8 rounded-xl overflow-hidden border border-accent/40 bg-surface shadow-sm shrink-0 mt-0.5 select-none ring-1 ring-accent/20">
        <img
          src="/perlica_chat_img.jpg"
          alt="Perlica"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex-1 max-w-2xl rounded-2xl px-4 py-2.5 bg-surface/80 border border-border/80 text-foreground/95 text-sm shadow-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};
