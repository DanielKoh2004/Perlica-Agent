import { useAgent } from "../features/agent/agent-context.js";
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
 * Hook providing access to ongoing task progress, verification state, and approvals.
 */
export function useCurrentTask(): UseCurrentTaskResult {
  const {
    currentTask,
    agentStatus,
    waitingApproval,
    resolveApproval,
    cancelCurrentTask,
  } = useAgent();

  return {
    currentTask,
    agentStatus,
    waitingApproval,
    resolveApproval,
    cancelCurrentTask,
  };
}
