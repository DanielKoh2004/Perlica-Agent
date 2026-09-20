import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Session } from "@perlica/contracts";
import { useAgentClientContext } from "../agent/client-context.js";
import { StorageService } from "../../lib/storage/storage-service.js";

export interface SessionContextValue {
  sessions: Session[];
  activeSessionId: string | null;
  activeSession: Session | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (title?: string) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { client } = useAgentClientContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(() =>
    StorageService.getActiveSessionId()
  );

  const refreshSessions = useCallback(async () => {
    const list = await client.getSessions();
    setSessions(list);
    if (list.length > 0) {
      setActiveSessionIdState((prev) => {
        if (prev && list.some((s) => s.id === prev)) {
          return prev;
        }
        return list[0].id;
      });
    }
  }, [client]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const setActiveSessionId = useCallback((id: string | null) => {
    setActiveSessionIdState(id);
    StorageService.setActiveSessionId(id);
  }, []);

  const createSession = useCallback(
    async (title?: string) => {
      const session = await client.createSession(title);
      await refreshSessions();
      setActiveSessionId(session.id);
      return session;
    },
    [client, refreshSessions, setActiveSessionId]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await client.deleteSession(id);
      await refreshSessions();
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [client, refreshSessions, activeSessionId, sessions, setActiveSessionId]
  );

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        setActiveSessionId,
        createSession,
        deleteSession,
        refreshSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
