import { useAgent } from "../features/agent/agent-context.js";
import type { AgentClient } from "../features/agent/api/agent-client.js";

/**
 * Hook providing access to the canonical AgentClient instance.
 */
export function useAgentClient(): AgentClient {
  const { client } = useAgent();
  return client;
}
