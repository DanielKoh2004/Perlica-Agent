import { useSessionContext } from "../features/sessions/session-context.js";
import type { Session } from "@perlica/contracts";

export interface UseCurrentSessionResult {
  activeSessionId: string | null;
  activeSession: Session | null;
  setActiveSessionId: (id: string | null) => void;
}

/**
 * Canonical hook providing active session state and selection.
 */
export function useCurrentSession(): UseCurrentSessionResult {
  const { activeSessionId, activeSession, setActiveSessionId } = useSessionContext();
  return { activeSessionId, activeSession, setActiveSessionId };
}
