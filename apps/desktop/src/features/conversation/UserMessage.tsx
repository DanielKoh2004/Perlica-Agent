import React from "react";
import type { Message } from "@perlica/contracts";

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start justify-end gap-3 w-full animate-fade-in">
      <div className="max-w-xl rounded-2xl px-4 py-2.5 bg-accent/15 border border-accent/30 text-foreground text-sm shadow-sm leading-relaxed">
        {message.content}
      </div>
      <div className="w-8 h-8 rounded-xl overflow-hidden border border-border/80 bg-surface shadow-sm shrink-0 mt-0.5 select-none ring-1 ring-border">
        <img
          src="/endministrator_chat_img.jpg"
          alt="Endministrator"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};
