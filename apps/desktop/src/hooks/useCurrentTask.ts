import { useAgentRuntimeContext } from "../features/agent/agent-runtime-context.js";
import type { Task } from "@perlica/contracts";
import type { SessionState } from "../features/agent/state/agent-state.js";

export interface UseCurrentTaskResult {
  currentTask: Task | null;
  agentStatus: SessionState["agentStatus"];
  waitingApproval: SessionState["waitingApproval"];
  resolveApproval: (approvalId: string, approved: boolean) => Promise<void>;
  cancelCurrentTask: () => Promise<void>;
}

/**
 * Canonical hook for observing ongoing task state, handling approvals, and cancellation.
 */
export function useCurrentTask(): UseCurrentTaskResult {
  const {
    currentTask,
    agentStatus,
    waitingApproval,
    resolveApproval,
    cancelCurrentTask,
  } = useAgentRuntimeContext();

  return {
    currentTask,
    agentStatus,
    waitingApproval,
    resolveApproval,
    cancelCurrentTask,
  };
}
