import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Task, Message, AgentEvent } from "@perlica/contracts";
import { useAgentClientContext, useScenario } from "./client-context.js";
import { useSessionContext } from "../sessions/session-context.js";
import {
  SessionState,
  createInitialSessionState,
  reduceAgentEvent,
} from "./state/agent-state.js";

export interface AgentRuntimeContextValue {
  messages: Message[];
  currentTask: Task | null;
  agentStatus: SessionState["agentStatus"];
  waitingApproval: SessionState["waitingApproval"];
  sendMessage: (content: string) => Promise<void>;
  resolveApproval: (approvalId: string, approved: boolean) => Promise<void>;
  cancelCurrentTask: () => Promise<void>;
}

const AgentRuntimeContext = createContext<AgentRuntimeContextValue | null>(null);

export const AgentRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { client } = useAgentClientContext();
  const { selectedScenario } = useScenario();
  const { activeSessionId, setActiveSessionId, refreshSessions } = useSessionContext();
  const [sessionStates, setSessionStates] = useState<Record<string, SessionState>>({});

  // Subscribe to agent event stream for active session
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
    <AgentRuntimeContext.Provider
      value={{
        messages: currentSessionState.messages,
        currentTask: currentSessionState.currentTask,
        agentStatus: currentSessionState.agentStatus,
        waitingApproval: currentSessionState.waitingApproval,
        sendMessage,
        resolveApproval,
        cancelCurrentTask,
      }}
    >
      {children}
    </AgentRuntimeContext.Provider>
  );
};

export function useAgentRuntimeContext(): AgentRuntimeContextValue {
  const context = useContext(AgentRuntimeContext);
  if (!context) {
    throw new Error("useAgentRuntimeContext must be used within an AgentRuntimeProvider");
  }
  return context;
}
