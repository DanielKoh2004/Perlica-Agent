import React, { useEffect, useRef } from "react";
import type { Message } from "@perlica/contracts";
import { UserMessage } from "./UserMessage.js";
import { AgentMessage } from "./AgentMessage.js";
import { ActivityMessage } from "./ActivityMessage.js";
import { ApprovalMessage } from "./ApprovalMessage.js";
import { ResultMessage } from "./ResultMessage.js";
import { Info } from "lucide-react";

interface ConversationViewProps {
  messages: Message[];
}

export const ConversationView: React.FC<ConversationViewProps> = ({ messages }) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.map((message) => {
        switch (message.type) {
          case "user":
            return <UserMessage key={message.id} message={message} />;
          case "agent":
            return <AgentMessage key={message.id} message={message} />;
          case "activity":
            return <ActivityMessage key={message.id} message={message} />;
          case "approval":
            return <ApprovalMessage key={message.id} message={message} />;
          case "result":
            return <ResultMessage key={message.id} message={message} />;
          case "system":
          default:
            return (
              <div
                key={message.id}
                className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-muted-foreground/75 select-none"
              >
                <Info className="w-3 h-3 text-muted-foreground/60" />
                <span>{message.content}</span>
              </div>
            );
        }
      })}
      <div ref={scrollEndRef} />
    </div>
  );
};
