import React from "react";
import { UserProfileProvider, useUserProfile } from "../profile/profile-context.js";
import {
  AgentClientProvider,
  useAgentClientContext,
  useScenario,
} from "./client-context.js";
import { SessionProvider, useSessionContext } from "../sessions/session-context.js";
import { AgentRuntimeProvider, useAgentRuntimeContext } from "./agent-runtime-context.js";

export const AgentRootProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <UserProfileProvider>
      <AgentClientProvider>
        <SessionProvider>
          <AgentRuntimeProvider>{children}</AgentRuntimeProvider>
        </SessionProvider>
      </AgentClientProvider>
    </UserProfileProvider>
  );
};

/**
 * @deprecated Transitional compatibility facade. Do NOT use in components.
 * Import domain-specific hooks instead:
 * - `useUserProfile()`
 * - `useAgentClient()`
 * - `useScenario()`
 * - `useSessions()`
 * - `useCurrentSession()`
 * - `useConversation()`
 * - `useCurrentTask()`
 */
export function useAgent() {
  const { userProfile, updateUserProfile } = useUserProfile();
  const { client } = useAgentClientContext();
  const { selectedScenario, setSelectedScenario } = useScenario();
  const {
    sessions,
    activeSessionId,
    activeSession,
    setActiveSessionId,
    createSession,
    deleteSession,
    refreshSessions,
  } = useSessionContext();
  const {
    messages,
    sendMessage,
    agentStatus,
    currentTask,
    waitingApproval,
    resolveApproval,
    cancelCurrentTask,
  } = useAgentRuntimeContext();

  return {
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
    currentTask,
    messages,
    agentStatus,
    waitingApproval,
    refreshSessions,
  };
}
