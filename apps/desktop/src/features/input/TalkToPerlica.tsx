import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic } from "lucide-react";

interface TalkToPerlicaProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export const TalkToPerlica: React.FC<TalkToPerlicaProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative flex flex-col bg-surface/90 border border-border/80 hover:border-accent/40 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/20 rounded-2xl shadow-lg transition-all backdrop-blur-md">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Talk to Perlica..."
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[44px] max-h-[140px]"
        />

        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Voice capability placeholder */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            title="Voice input (coming in a future milestone)"
            aria-label="Voice input placeholder"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
            className={`p-1.5 rounded-xl transition-all ${
              content.trim() && !disabled
                ? "bg-accent text-accent-foreground shadow-sm hover:opacity-90 active:scale-95"
                : "bg-surface-secondary text-muted-foreground/40 cursor-not-allowed"
            }`}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-center text-muted-foreground/50 mt-1.5 select-none font-mono">
        Perlica actions are controlled by verified safety policies. Press Enter to send,
        Shift+Enter for new line.
      </p>
    </div>
  );
};
