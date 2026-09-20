import { useAgentClientContext } from "../features/agent/client-context.js";
import type { AgentClient } from "../features/agent/api/agent-client.js";

/**
 * Canonical hook providing the shared AgentClient transport.
 */
export function useAgentClient(): AgentClient {
  const { client } = useAgentClientContext();
  return client;
}
