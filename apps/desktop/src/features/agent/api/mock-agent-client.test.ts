import { describe, it, expect } from "vitest";
import { MockAgentClient } from "./mock-agent-client.js";

describe("MockAgentClient", () => {
  it("creates and manages sessions", async () => {
    const client = new MockAgentClient();
    const session = await client.createSession("Custom debugging session");

    expect(session.id).toBeDefined();
    expect(session.title).toBe("Custom debugging session");
    expect(session.status).toBe("active");

    const list = await client.getSessions();
    expect(list.some((s) => s.id === session.id)).toBe(true);

    await client.deleteSession(session.id);
    const afterDelete = await client.getSessions();
    expect(afterDelete.some((s) => s.id === session.id)).toBe(false);
  });

  it("sends message and returns initial task and user message", async () => {
    const client = new MockAgentClient();
    const session = await client.createSession();

    const { task, userMessage } = await client.sendMessage({
      sessionId: session.id,
      content: "Find something to watch tonight",
      scenario: "STANDARD_SUCCESS",
    });

    expect(userMessage.content).toBe("Find something to watch tonight");
    expect(userMessage.type).toBe("user");
    expect(task.sessionId).toBe(session.id);
    expect(task.status).toBe("created");
  });

  it("dispatches events via subscription", async () => {
    const client = new MockAgentClient();
    const session = await client.createSession();

    const receivedEvents: string[] = [];
    const unsubscribe = client.subscribeToEvents(session.id, (event) => {
      receivedEvents.push(event.type);
    });

    await client.sendMessage({
      sessionId: session.id,
      content: "Start test scenario",
      scenario: "STANDARD_SUCCESS",
    });

    // Wait a short moment for initial async event emission
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(receivedEvents.length).toBeGreaterThan(0);
    expect(receivedEvents).toContain("task.created");

    unsubscribe();
  });
});
