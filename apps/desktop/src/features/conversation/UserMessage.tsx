import React from "react";
import type { Message } from "@perlica/contracts";

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-end w-full animate-fade-in">
      <div className="max-w-xl rounded-2xl px-4 py-2.5 bg-accent/15 border border-accent/25 text-foreground text-sm shadow-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};
