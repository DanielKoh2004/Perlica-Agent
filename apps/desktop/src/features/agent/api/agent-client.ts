import type { Session, Task, Message, AgentEvent } from "@perlica/contracts";

export type MockScenarioType =
  | "STANDARD_SUCCESS"
  | "SLOW_TASK"
  | "TOOL_FAILURE"
  | "VERIFICATION_FAILURE"
  | "APPROVAL_REQUIRED"
  | "TASK_CANCELLATION"
  | "MULTI_STEP";

export interface SendMessageParams {
  sessionId: string;
  content: string;
  scenario?: MockScenarioType;
}

export interface ResolveApprovalParams {
  taskId: string;
  approvalId: string;
  approved: boolean;
}

/**
 * AgentClient defines the canonical frontend contract for interacting with the agent runtime.
 * Phase 1 uses MockAgentClient. Later, a RealAgentClient (via Tauri IPC or HTTP/WebSocket)
 * will implement this exact interface without requiring UI changes.
 */
export interface AgentClient {
  getSessions(): Promise<Session[]>;
  createSession(title?: string): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  sendMessage(params: SendMessageParams): Promise<{ task: Task; userMessage: Message }>;
  subscribeToEvents(sessionId: string, callback: (event: AgentEvent) => void): () => void;
  resolveApproval(params: ResolveApprovalParams): Promise<void>;
  cancelTask(taskId: string): Promise<void>;
}
