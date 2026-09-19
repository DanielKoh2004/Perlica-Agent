import { useAgent } from "../features/agent/agent-context.js";
import type { Session } from "@perlica/contracts";

export interface UseSessionsResult {
  sessions: Session[];
  createSession: (title?: string) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook providing session list access and lifecycle operations.
 */
export function useSessions(): UseSessionsResult {
  const { sessions, createSession, deleteSession, refreshSessions } = useAgent();
  return { sessions, createSession, deleteSession, refreshSessions };
}
