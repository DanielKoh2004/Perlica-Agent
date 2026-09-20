import { describe, it, expect } from "vitest";
import {
  SessionSchema,
  TaskSchema,
  AgentEventSchema,
  MessageSchema,
  VerificationResultSchema,
  ToolCallSchema,
  ToolResultSchema,
  UserProfileSchema,
  ThemeModeSchema,
} from "./index.js";

describe("Contracts Runtime Validation", () => {
  it("validates a valid session", () => {
    const raw = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Session",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };
    const parsed = SessionSchema.parse(raw);
    expect(parsed.title).toBe("Test Session");
    expect(parsed.status).toBe("active");
  });

  it("rejects an invalid session status", () => {
    const raw = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Session",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "invalid_status",
    };
    expect(() => SessionSchema.parse(raw)).toThrow();
  });

  it("validates a task with steps", () => {
    const task = {
      id: "task-1",
      sessionId: "session-1",
      title: "Find something to watch",
      status: "running",
      currentStep: "Finding candidates",
      progress: 40,
      steps: [
        { id: "step-1", title: "Read preferences", status: "completed" },
        { id: "step-2", title: "Find candidates", status: "running" },
      ],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const parsed = TaskSchema.parse(task);
    expect(parsed.steps.length).toBe(2);
    expect(parsed.status).toBe("running");
  });

  it("validates discriminated AgentEvent types", () => {
    const event1 = {
      id: "evt-1",
      timestamp: new Date().toISOString(),
      sessionId: "session-1",
      taskId: "task-1",
      type: "task.created",
      title: "Research task",
      steps: [],
    };
    const parsedEvent1 = AgentEventSchema.parse(event1);
    expect(parsedEvent1.type).toBe("task.created");

    const event2 = {
      id: "evt-2",
      timestamp: new Date().toISOString(),
      sessionId: "session-1",
      taskId: "task-1",
      type: "approval.requested",
      approvalId: "appr-1",
      action: "Send email to Alice",
      consequence: "An external email will be sent with your signature",
    };
    const parsedEvent2 = AgentEventSchema.parse(event2);
    expect(parsedEvent2.type).toBe("approval.requested");
  });

  it("validates message contracts", () => {
    const message = {
      id: "msg-1",
      sessionId: "session-1",
      type: "activity",
      content: "Scanned files",
      createdAt: new Date().toISOString(),
    };
    const parsed = MessageSchema.parse(message);
    expect(parsed.type).toBe("activity");
  });

  it("validates tool call and result contracts", () => {
    const call = {
      id: "call-1",
      toolName: "filesystem.read",
      arguments: { path: "./test.txt" },
      timestamp: new Date().toISOString(),
    };
    const parsedCall = ToolCallSchema.parse(call);
    expect(parsedCall.toolName).toBe("filesystem.read");

    const result = {
      callId: "call-1",
      toolName: "filesystem.read",
      success: true,
      timestamp: new Date().toISOString(),
    };
    const parsedResult = ToolResultSchema.parse(result);
    expect(parsedResult.success).toBe(true);
  });

  it("validates verification contracts", () => {
    const verification = {
      status: "passed",
      rule: "check_presence",
      expected: "file exists",
      observed: "file exists",
      timestamp: new Date().toISOString(),
    };
    const parsed = VerificationResultSchema.parse(verification);
    expect(parsed.status).toBe("passed");
  });

  it("validates verification events with verificationId and durationMs", () => {
    const started = {
      id: "evt-v1",
      timestamp: new Date().toISOString(),
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.started",
      verificationId: "verif-123",
      rule: "integrity_check",
    };
    const parsedStarted = AgentEventSchema.parse(started);
    expect(parsedStarted.type).toBe("verification.started");
    if (parsedStarted.type === "verification.started") {
      expect(parsedStarted.verificationId).toBe("verif-123");
    }

    const completed = {
      id: "evt-v2",
      timestamp: new Date().toISOString(),
      sessionId: "session-1",
      taskId: "task-1",
      type: "verification.completed",
      verificationId: "verif-123",
      result: {
        status: "passed",
        rule: "integrity_check",
        durationMs: 45,
        timestamp: new Date().toISOString(),
      },
    };
    const parsedCompleted = AgentEventSchema.parse(completed);
    expect(parsedCompleted.type).toBe("verification.completed");
    if (parsedCompleted.type === "verification.completed") {
      expect(parsedCompleted.verificationId).toBe("verif-123");
      expect(parsedCompleted.result.durationMs).toBe(45);
    }
  });

  it("validates UserProfile and ThemeMode schemas", () => {
    const validProfile = {
      name: "Alice",
      avatarUrl: "https://example.com/alice.png",
    };
    const parsedProfile = UserProfileSchema.parse(validProfile);
    expect(parsedProfile.name).toBe("Alice");
    expect(parsedProfile.avatarUrl).toBe("https://example.com/alice.png");

    expect(ThemeModeSchema.parse("dark")).toBe("dark");
    expect(ThemeModeSchema.parse("light")).toBe("light");
    expect(ThemeModeSchema.parse("system")).toBe("system");
    expect(() => ThemeModeSchema.parse("neon")).toThrow();
  });
});
