import type { Session, Task, Message, AgentEvent } from "@perlica/contracts";
import {
  type AgentClient,
  type SendMessageParams,
  type ResolveApprovalParams,
} from "./agent-client.js";
import { MockEventStream } from "../events/mock-event-stream.js";
import { StorageService } from "../../../lib/storage/storage-service.js";

const DEMO_SEEDED_SESSIONS: Session[] = [
  {
    id: "demo-session-1",
    title: "Project debugging",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago (Today)
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "active",
  },
  {
    id: "demo-session-2",
    title: "Find something to watch",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago (Today)
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "active",
  },
  {
    id: "demo-session-3",
    title: "Daily planning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago (Today)
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: "active",
  },
  {
    id: "demo-session-4",
    title: "Research assistant",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago (Yesterday)
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: "active",
  },
];

export class MockAgentClient implements AgentClient {
  private sessions: Session[] = [];
  private eventStream: MockEventStream;

  constructor() {
    this.eventStream = new MockEventStream();
    this.initializeSessions();
  }

  private initializeSessions(): void {
    const isDemo = StorageService.getDemoMode();
    if (isDemo) {
      this.sessions = [...DEMO_SEEDED_SESSIONS];
    } else {
      this.sessions = [];
    }
  }

  async getSessions(): Promise<Session[]> {
    return [...this.sessions];
  }

  async createSession(title?: string): Promise<Session> {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: title || "New conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };
    this.sessions.unshift(newSession);
    return newSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }

  async sendMessage(
    params: SendMessageParams
  ): Promise<{ task: Task; userMessage: Message }> {
    const { sessionId, content, scenario = "STANDARD_SUCCESS" } = params;

    // 1. Update session title if default
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session && session.title === "New conversation") {
      session.title = content.length > 28 ? `${content.slice(0, 28)}...` : content;
      session.updatedAt = new Date().toISOString();
    }

    // 2. Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sessionId,
      type: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    // 3. Create initial Task
    const task: Task = {
      id: `task-${Date.now()}`,
      sessionId,
      title: content.length > 32 ? `${content.slice(0, 32)}...` : content,
      status: "created",
      currentStep: "Starting request...",
      progress: 0,
      steps: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Trigger the mock scenario asynchronously
    setTimeout(() => {
      this.eventStream.startScenario(sessionId, task, content, scenario);
    }, 50);

    return { task, userMessage };
  }

  subscribeToEvents(
    sessionId: string,
    callback: (event: AgentEvent) => void
  ): () => void {
    return this.eventStream.subscribe(sessionId, callback);
  }

  async resolveApproval(params: ResolveApprovalParams): Promise<void> {
    this.eventStream.resolveApproval(params.taskId, params.approvalId, params.approved);
  }

  async cancelTask(taskId: string): Promise<void> {
    this.eventStream.cancelTask(taskId);
  }
}
