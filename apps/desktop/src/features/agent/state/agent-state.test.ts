import { describe, it, expect } from "vitest";
import { createInitialSessionState, reduceAgentEvent } from "./agent-state.js";
import type { AgentEvent } from "@perlica/contracts";

describe("Agent State Projection Reducer", () => {
  it("initializes with empty session state", () => {
    const state = createInitialSessionState();
    expect(state.currentTask).toBeNull();
    expect(state.messages).toEqual([]);
    expect(state.agentStatus).toBe("idle");
    expect(state.waitingApproval).toBeNull();
  });

  it("handles task.created event", () => {
    const state = createInitialSessionState();
    const event: AgentEvent = {
      id: "evt-1",
      timestamp: "2026-09-19T00:00:00.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "task.created",
      title: "Analyze codebase",
      steps: [{ id: "s1", title: "Read config", status: "pending" }],
    };

    const next = reduceAgentEvent(state, event);
    expect(next.currentTask?.id).toBe("task-1");
    expect(next.currentTask?.title).toBe("Analyze codebase");
    expect(next.currentTask?.status).toBe("created");
    expect(next.agentStatus).toBe("executing");
  });

  it("handles task.updated event", () => {
    const state = {
      ...createInitialSessionState(),
      currentTask: {
        id: "task-1",
        sessionId: "session-1",
        title: "Analyze codebase",
        status: "created" as const,
        steps: [],
        startedAt: "2026-09-19T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
    };

    const event: AgentEvent = {
      id: "evt-2",
      timestamp: "2026-09-19T00:00:01.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "task.updated",
      status: "running",
      currentStep: "Reading config",
      progress: 50,
    };

    const next = reduceAgentEvent(state, event);
    expect(next.currentTask?.status).toBe("running");
    expect(next.currentTask?.currentStep).toBe("Reading config");
    expect(next.currentTask?.progress).toBe(50);
  });

  it("handles approval.requested and approval.resolved events", () => {
    const state = createInitialSessionState();
    const reqEvent: AgentEvent = {
      id: "evt-3",
      timestamp: "2026-09-19T00:00:02.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "approval.requested",
      approvalId: "appr-1",
      action: "Send email",
      consequence: "An external email will be sent",
    };

    const waitingState = reduceAgentEvent(state, reqEvent);
    expect(waitingState.agentStatus).toBe("waiting");
    expect(waitingState.waitingApproval?.approvalId).toBe("appr-1");
    expect(waitingState.waitingApproval?.action).toBe("Send email");

    const resEvent: AgentEvent = {
      id: "evt-4",
      timestamp: "2026-09-19T00:00:03.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "approval.resolved",
      approvalId: "appr-1",
      approved: true,
    };

    const resolvedState = reduceAgentEvent(waitingState, resEvent);
    expect(resolvedState.waitingApproval).toBeNull();
  });

  it("handles message.created and deduplicates identical IDs", () => {
    const state = createInitialSessionState();
    const event: AgentEvent = {
      id: "evt-5",
      timestamp: "2026-09-19T00:00:04.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "message.created",
      message: {
        id: "msg-1",
        sessionId: "session-1",
        type: "agent",
        content: "Hello Daniel!",
        createdAt: "2026-09-19T00:00:04.000Z",
      },
    };

    const next1 = reduceAgentEvent(state, event);
    expect(next1.messages.length).toBe(1);

    // Same message event again
    const next2 = reduceAgentEvent(next1, event);
    expect(next2.messages.length).toBe(1);
  });

  it("handles task.completed event", () => {
    const state = {
      ...createInitialSessionState(),
      currentTask: {
        id: "task-1",
        sessionId: "session-1",
        title: "Analyze codebase",
        status: "running" as const,
        steps: [],
        startedAt: "2026-09-19T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
      agentStatus: "executing" as const,
    };

    const event: AgentEvent = {
      id: "evt-6",
      timestamp: "2026-09-19T00:00:05.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "task.completed",
      result: {
        title: "Completed Analysis",
        summary: "Analysis verified successfully",
        actions: [],
      },
      completedAt: "2026-09-19T00:00:05.000Z",
    };

    const next = reduceAgentEvent(state, event);
    expect(next.currentTask?.status).toBe("completed");
    expect(next.currentTask?.progress).toBe(100);
    expect(next.agentStatus).toBe("idle");
  });
});
