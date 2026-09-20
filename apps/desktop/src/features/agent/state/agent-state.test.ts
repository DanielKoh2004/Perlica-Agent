import { describe, it, expect, vi } from "vitest";
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

  it("projects tool.started and updates with tool.completed (success and failure)", () => {
    const state = createInitialSessionState();

    // 1. tool.started
    const startedEvent: AgentEvent = {
      id: "evt-t1",
      timestamp: "2026-09-19T00:00:06.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "tool.started",
      call: {
        id: "call-1",
        toolName: "search_db",
        arguments: { q: "test" },
        timestamp: "2026-09-19T00:00:06.000Z",
      },
    };

    const stateWithTool = reduceAgentEvent(state, startedEvent);
    expect(stateWithTool.messages.length).toBe(1);
    const msg1 = stateWithTool.messages[0];
    expect(msg1.type).toBe("activity");
    expect(msg1.activity?.toolCallId).toBe("call-1");
    expect(msg1.activity?.toolName).toBe("search_db");
    expect(msg1.activity?.status).toBe("running");

    // 2. tool.completed (success)
    const completedEvent: AgentEvent = {
      id: "evt-t2",
      timestamp: "2026-09-19T00:00:07.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "tool.completed",
      result: {
        callId: "call-1",
        toolName: "search_db",
        success: true,
        durationMs: 350,
        timestamp: "2026-09-19T00:00:07.000Z",
      },
    };

    const stateCompleted = reduceAgentEvent(stateWithTool, completedEvent);
    expect(stateCompleted.messages.length).toBe(1);
    const msgCompleted = stateCompleted.messages[0];
    expect(msgCompleted.content).toBe("Completed search_db");
    expect(msgCompleted.activity?.status).toBe("completed");
    expect(msgCompleted.activity?.durationMs).toBe(350);

    // 3. tool.completed with failure on another tool
    const failedStarted: AgentEvent = {
      id: "evt-t3",
      timestamp: "2026-09-19T00:00:08.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "tool.started",
      call: {
        id: "call-2",
        toolName: "fetch_remote",
        arguments: {},
        timestamp: "2026-09-19T00:00:08.000Z",
      },
    };
    const stateWithTool2 = reduceAgentEvent(stateCompleted, failedStarted);
    expect(stateWithTool2.messages.length).toBe(2);

    const failedCompleted: AgentEvent = {
      id: "evt-t4",
      timestamp: "2026-09-19T00:00:09.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "tool.completed",
      result: {
        callId: "call-2",
        toolName: "fetch_remote",
        success: false,
        error: "Connection timeout",
        durationMs: 1200,
        timestamp: "2026-09-19T00:00:09.000Z",
      },
    };
    const stateFailed = reduceAgentEvent(stateWithTool2, failedCompleted);
    expect(stateFailed.messages.length).toBe(2);
    const msgFailed = stateFailed.messages[1];
    expect(msgFailed.content).toContain("Failed fetch_remote: Connection timeout");
    expect(msgFailed.activity?.status).toBe("failed");
    expect(msgFailed.activity?.durationMs).toBe(1200);
  });

  it("projects verification.started and updates with verification.completed (passed and failed)", () => {
    const state = createInitialSessionState();

    // 1. verification.started
    const startedEvent: AgentEvent = {
      id: "evt-v1",
      timestamp: "2026-09-19T00:00:10.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.started",
      verificationId: "verif-1",
      rule: "check_signature",
    };

    const stateWithVerify = reduceAgentEvent(state, startedEvent);
    expect(stateWithVerify.messages.length).toBe(1);
    const msg1 = stateWithVerify.messages[0];
    expect(msg1.type).toBe("activity");
    expect(msg1.activity?.verificationId).toBe("verif-1");
    expect(msg1.activity?.status).toBe("running");
    expect(msg1.activity?.step).toBe("Verify: check_signature");

    // 2. verification.completed (passed)
    const completedEvent: AgentEvent = {
      id: "evt-v2",
      timestamp: "2026-09-19T00:00:11.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.completed",
      verificationId: "verif-1",
      result: {
        status: "passed",
        rule: "check_signature",
        durationMs: 150,
        timestamp: "2026-09-19T00:00:11.000Z",
      },
    };

    const statePassed = reduceAgentEvent(stateWithVerify, completedEvent);
    expect(statePassed.messages.length).toBe(1);
    const msgPassed = statePassed.messages[0];
    expect(msgPassed.content).toBe("Verified: check_signature");
    expect(msgPassed.activity?.status).toBe("completed");
    expect(msgPassed.activity?.durationMs).toBe(150);

    // 3. verification.completed (failed)
    const startedFail: AgentEvent = {
      id: "evt-v3",
      timestamp: "2026-09-19T00:00:12.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.started",
      verificationId: "verif-2",
      rule: "file_exists",
    };
    const stateWithVerify2 = reduceAgentEvent(statePassed, startedFail);
    expect(stateWithVerify2.messages.length).toBe(2);

    const completedFail: AgentEvent = {
      id: "evt-v4",
      timestamp: "2026-09-19T00:00:13.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.completed",
      verificationId: "verif-2",
      result: {
        status: "failed",
        rule: "file_exists",
        details: "Target path does not exist",
        durationMs: 80,
        timestamp: "2026-09-19T00:00:13.000Z",
      },
    };
    const stateVerifyFailed = reduceAgentEvent(stateWithVerify2, completedFail);
    expect(stateVerifyFailed.messages.length).toBe(2);
    const msgVerifyFail = stateVerifyFailed.messages[1];
    expect(msgVerifyFail.content).toContain(
      "Verification failed for file_exists: Target path does not exist"
    );
    expect(msgVerifyFail.activity?.status).toBe("failed");
    expect(msgVerifyFail.activity?.durationMs).toBe(80);
  });

  it("ignores and warns on orphan tool.completed without tool.started", () => {
    const state = createInitialSessionState();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const orphanEvent: AgentEvent = {
      id: "evt-orphan-t",
      timestamp: "2026-09-19T00:00:14.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "tool.completed",
      result: {
        callId: "non-existent-call",
        toolName: "orphan_tool",
        success: true,
        timestamp: "2026-09-19T00:00:14.000Z",
      },
    };

    const next = reduceAgentEvent(state, orphanEvent);
    expect(next).toBe(state);
    expect(next.messages).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Dropping orphan tool.completed event")
    );

    warnSpy.mockRestore();
  });

  it("ignores and warns on orphan verification.completed without verification.started", () => {
    const state = createInitialSessionState();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const orphanEvent: AgentEvent = {
      id: "evt-orphan-v",
      timestamp: "2026-09-19T00:00:15.000Z",
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.completed",
      verificationId: "non-existent-verif",
      result: {
        status: "passed",
        rule: "orphan_rule",
        timestamp: "2026-09-19T00:00:15.000Z",
      },
    };

    const next = reduceAgentEvent(state, orphanEvent);
    expect(next).toBe(state);
    expect(next.messages).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Dropping orphan verification.completed event")
    );

    warnSpy.mockRestore();
  });
});
