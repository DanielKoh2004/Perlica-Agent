import { useAgent } from "../features/agent/agent-context.js";
import type { Message } from "@perlica/contracts";

export interface UseConversationResult {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
}

/**
 * Hook providing message history and sending capability for the active session.
 */
export function useConversation(): UseConversationResult {
  const { messages, sendMessage } = useAgent();
  return { messages, sendMessage };
}
