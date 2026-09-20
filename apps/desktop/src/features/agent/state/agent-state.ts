import type { AgentEvent, Task, Message } from "@perlica/contracts";

export interface SessionState {
  currentTask: Task | null;
  messages: Message[];
  agentStatus:
    "idle" | "thinking" | "executing" | "waiting" | "verifying" | "done" | "error";
  waitingApproval: {
    approvalId: string;
    action: string;
    target?: string;
    consequence: string;
  } | null;
}

export function createInitialSessionState(): SessionState {
  return {
    currentTask: null,
    messages: [],
    agentStatus: "idle",
    waitingApproval: null,
  };
}

/**
 * Pure projection reducer that transitions session state based on domain events.
 */
export function reduceAgentEvent(state: SessionState, event: AgentEvent): SessionState {
  switch (event.type) {
    case "task.created": {
      const newTask: Task = {
        id: event.taskId,
        sessionId: event.sessionId,
        title: event.title,
        status: "created",
        steps: event.steps || [],
        startedAt: event.timestamp,
        updatedAt: event.timestamp,
      };
      return {
        ...state,
        currentTask: newTask,
        agentStatus: "executing",
      };
    }

    case "task.updated": {
      if (!state.currentTask || state.currentTask.id !== event.taskId) {
        return state;
      }
      return {
        ...state,
        currentTask: {
          ...state.currentTask,
          status: event.status,
          currentStep: event.currentStep ?? state.currentTask.currentStep,
          progress: event.progress ?? state.currentTask.progress,
          error: event.error ?? state.currentTask.error,
          updatedAt: event.timestamp,
        },
      };
    }

    case "agent.status_changed": {
      return {
        ...state,
        agentStatus: event.status,
      };
    }

    case "tool.started": {
      const toolActivityMessage: Message = {
        id: `msg-tool-${event.call.id}`,
        sessionId: event.sessionId,
        taskId: event.taskId,
        type: "activity",
        content: `Executing ${event.call.toolName}`,
        createdAt: event.timestamp,
        activity: {
          step: event.call.toolName,
          status: "running",
          toolName: event.call.toolName,
          toolCallId: event.call.id,
        },
      };

      return {
        ...state,
        messages: [...state.messages, toolActivityMessage],
      };
    }

    case "tool.completed": {
      const existingIdx = state.messages.findIndex(
        (m) => m.type === "activity" && m.activity?.toolCallId === event.result.callId
      );

      if (existingIdx === -1) {
        if (import.meta.env.DEV) {
          console.warn(
            `[AgentState] Dropping orphan tool.completed event: no matching in-flight activity found for callId '${event.result.callId}'`
          );
        }
        return state;
      }

      const updatedMessages = [...state.messages];
      const prevMsg = updatedMessages[existingIdx];
      updatedMessages[existingIdx] = {
        ...prevMsg,
        content: event.result.success
          ? `Completed ${prevMsg.activity?.toolName || "tool"}`
          : `Failed ${prevMsg.activity?.toolName || "tool"}: ${event.result.error || "Execution error"}`,
        activity: {
          ...prevMsg.activity!,
          status: event.result.success ? ("completed" as const) : ("failed" as const),
          durationMs: event.result.durationMs,
        },
      };

      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case "verification.started": {
      const verifyActivityMessage: Message = {
        id: `msg-verify-${event.verificationId}`,
        sessionId: event.sessionId,
        taskId: event.taskId,
        type: "activity",
        content: `Verify: ${event.rule}`,
        createdAt: event.timestamp,
        activity: {
          step: `Verify: ${event.rule}`,
          status: "running",
          verificationId: event.verificationId,
        },
      };

      return {
        ...state,
        messages: [...state.messages, verifyActivityMessage],
      };
    }

    case "verification.completed": {
      const existingIdx = state.messages.findIndex(
        (m) =>
          m.type === "activity" && m.activity?.verificationId === event.verificationId
      );

      if (existingIdx === -1) {
        if (import.meta.env.DEV) {
          console.warn(
            `[AgentState] Dropping orphan verification.completed event: no matching in-flight activity found for verificationId '${event.verificationId}'`
          );
        }
        return state;
      }

      const updatedMessages = [...state.messages];
      const prevMsg = updatedMessages[existingIdx];
      const isPassed = event.result.status === "passed";

      updatedMessages[existingIdx] = {
        ...prevMsg,
        content: isPassed
          ? `Verified: ${event.result.rule}`
          : `Verification failed for ${event.result.rule}: ${event.result.details || "Check failed"}`,
        activity: {
          ...prevMsg.activity!,
          status: isPassed ? ("completed" as const) : ("failed" as const),
          durationMs: event.result.durationMs,
        },
      };

      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case "approval.requested": {
      return {
        ...state,
        agentStatus: "waiting",
        waitingApproval: {
          approvalId: event.approvalId,
          action: event.action,
          target: event.target,
          consequence: event.consequence,
        },
      };
    }

    case "approval.resolved": {
      // Update any approval messages in the feed
      const updatedMessages = state.messages.map((m) => {
        if (m.type === "approval" && m.approval?.approvalId === event.approvalId) {
          return {
            ...m,
            approval: {
              ...m.approval,
              status: event.approved ? ("approved" as const) : ("rejected" as const),
            },
          };
        }
        return m;
      });

      return {
        ...state,
        waitingApproval: null,
        messages: updatedMessages,
      };
    }

    case "message.created": {
      // Prevent duplicate messages by ID
      if (state.messages.some((m) => m.id === event.message.id)) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, event.message],
      };
    }

    case "task.completed": {
      if (!state.currentTask || state.currentTask.id !== event.taskId) {
        return state;
      }
      return {
        ...state,
        currentTask: {
          ...state.currentTask,
          status: "completed",
          progress: 100,
          completedAt: event.completedAt,
          updatedAt: event.timestamp,
        },
        agentStatus: "idle",
        waitingApproval: null,
      };
    }

    case "task.failed": {
      if (!state.currentTask || state.currentTask.id !== event.taskId) {
        return state;
      }
      return {
        ...state,
        currentTask: {
          ...state.currentTask,
          status: "failed",
          error: event.error,
          updatedAt: event.timestamp,
        },
        agentStatus: "error",
        waitingApproval: null,
      };
    }

    default:
      return state;
  }
}
