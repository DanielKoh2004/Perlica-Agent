import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Session, Task, Message, AgentEvent } from "@perlica/contracts";
import { AgentClient, MockScenarioType } from "./api/agent-client.js";
import { MockAgentClient } from "./api/mock-agent-client.js";
import {
  SessionState,
  createInitialSessionState,
  reduceAgentEvent,
} from "./state/agent-state.js";
import { StorageService, UserProfile } from "../../lib/storage/storage-service.js";

interface AgentContextValue {
  client: AgentClient;
  sessions: Session[];
  activeSessionId: string | null;
  activeSession: Session | null;
  userProfile: UserProfile;
  selectedScenario: MockScenarioType;
  setSelectedScenario: (scenario: MockScenarioType) => void;
  updateUserProfile: (profile: UserProfile) => void;
  setActiveSessionId: (id: string | null) => void;
  createSession: (title?: string) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  resolveApproval: (approvalId: string, approved: boolean) => Promise<void>;
  cancelCurrentTask: () => Promise<void>;
  currentTask: Task | null;
  messages: Message[];
  agentStatus: SessionState["agentStatus"];
  waitingApproval: SessionState["waitingApproval"];
  refreshSessions: () => Promise<void>;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useMemo(() => new MockAgentClient(), []);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(() =>
    StorageService.getActiveSessionId()
  );
  const [sessionStates, setSessionStates] = useState<Record<string, SessionState>>({});
  const [userProfile, setUserProfileState] = useState<UserProfile>(() =>
    StorageService.getUserProfile()
  );
  const [selectedScenario, setSelectedScenario] =
    useState<MockScenarioType>("STANDARD_SUCCESS");

  // Load sessions on mount
  const refreshSessions = useCallback(async () => {
    const list = await client.getSessions();
    setSessions(list);
    // If activeSessionId is not in list, fallback to first or null
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

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
    StorageService.setUserProfile(profile);
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

  // Subscribe to events for active session
  useEffect(() => {
    if (!activeSessionId) return;

    const unsubscribe = client.subscribeToEvents(activeSessionId, (event: AgentEvent) => {
      setSessionStates((prev) => {
        const current = prev[activeSessionId] || createInitialSessionState();
        const updated = reduceAgentEvent(current, event);
        return {
          ...prev,
          [activeSessionId]: updated,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [client, activeSessionId]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const currentSessionState = useMemo(() => {
    if (!activeSessionId) return createInitialSessionState();
    return sessionStates[activeSessionId] || createInitialSessionState();
  }, [activeSessionId, sessionStates]);

  const sendMessage = useCallback(
    async (content: string) => {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        const newSession = await client.createSession();
        targetSessionId = newSession.id;
        await refreshSessions();
        setActiveSessionId(targetSessionId);
      }

      const { userMessage } = await client.sendMessage({
        sessionId: targetSessionId,
        content,
        scenario: selectedScenario,
      });

      // Immediately append user message to local state projection
      setSessionStates((prev) => {
        const current = prev[targetSessionId!] || createInitialSessionState();
        return {
          ...prev,
          [targetSessionId!]: {
            ...current,
            messages: [...current.messages, userMessage],
          },
        };
      });
      await refreshSessions();
    },
    [activeSessionId, client, selectedScenario, refreshSessions, setActiveSessionId]
  );

  const resolveApproval = useCallback(
    async (approvalId: string, approved: boolean) => {
      if (!activeSessionId || !currentSessionState.currentTask) return;
      await client.resolveApproval({
        taskId: currentSessionState.currentTask.id,
        approvalId,
        approved,
      });
    },
    [activeSessionId, client, currentSessionState.currentTask]
  );

  const cancelCurrentTask = useCallback(async () => {
    if (!currentSessionState.currentTask) return;
    await client.cancelTask(currentSessionState.currentTask.id);
  }, [client, currentSessionState.currentTask]);

  return (
    <AgentContext.Provider
      value={{
        client,
        sessions,
        activeSessionId,
        activeSession,
        userProfile,
        selectedScenario,
        setSelectedScenario,
        updateUserProfile,
        setActiveSessionId,
        createSession,
        deleteSession,
        sendMessage,
        resolveApproval,
        cancelCurrentTask,
        currentTask: currentSessionState.currentTask,
        messages: currentSessionState.messages,
        agentStatus: currentSessionState.agentStatus,
        waitingApproval: currentSessionState.waitingApproval,
        refreshSessions,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export function useAgent(): AgentContextValue {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
