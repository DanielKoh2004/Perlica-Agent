import { useSessionContext } from "../features/sessions/session-context.js";
import type { Session } from "@perlica/contracts";

export interface UseSessionsResult {
  sessions: Session[];
  createSession: (title?: string) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

/**
 * Canonical hook providing session list access and lifecycle operations.
 */
export function useSessions(): UseSessionsResult {
  const { sessions, createSession, deleteSession, refreshSessions } = useSessionContext();
  return { sessions, createSession, deleteSession, refreshSessions };
}
