import { useAgentRuntimeContext } from "../features/agent/agent-runtime-context.js";
import type { Message } from "@perlica/contracts";
import type { SessionState } from "../features/agent/state/agent-state.js";

export interface UseConversationResult {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  agentStatus: SessionState["agentStatus"];
}

/**
 * Canonical hook for reading conversation messages and sending user prompts.
 */
export function useConversation(): UseConversationResult {
  const { messages, sendMessage, agentStatus } = useAgentRuntimeContext();
  return { messages, sendMessage, agentStatus };
}
