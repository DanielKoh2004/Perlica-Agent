import { useAgent } from "../features/agent/agent-context.js";
import type { Session } from "@perlica/contracts";

export interface UseCurrentSessionResult {
  activeSessionId: string | null;
  activeSession: Session | null;
  setActiveSessionId: (id: string | null) => void;
}

/**
 * Hook providing access to the currently selected active session.
 */
export function useCurrentSession(): UseCurrentSessionResult {
  const { activeSessionId, activeSession, setActiveSessionId } = useAgent();
  return { activeSessionId, activeSession, setActiveSessionId };
}
