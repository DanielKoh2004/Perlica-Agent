import type { AgentEvent, Task, TaskStep, ResultDetails } from "@perlica/contracts";
import type { MockScenarioType } from "../api/agent-client.js";

type EventListener = (event: AgentEvent) => void;

interface ActiveStream {
  taskId: string;
  scenario: MockScenarioType;
  timerIds: ReturnType<typeof setTimeout>[];
  cancelled: boolean;
  waitingApprovalId?: string;
  resumeApprovalCallback?: (approved: boolean) => void;
}

export class MockEventStream {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private activeStreams: Map<string, ActiveStream> = new Map();

  subscribe(sessionId: string, callback: EventListener): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)!.add(callback);

    return () => {
      const set = this.listeners.get(sessionId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(sessionId);
        }
      }
    };
  }

  emit(sessionId: string, event: AgentEvent): void {
    const sessionListeners = this.listeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error("Error in event listener:", err);
        }
      });
    }
  }

  cancelTask(taskId: string): void {
    for (const [sessionId, stream] of this.activeStreams.entries()) {
      if (stream.taskId === taskId) {
        stream.cancelled = true;
        stream.timerIds.forEach(clearTimeout);
        stream.timerIds = [];

        this.emit(sessionId, {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId,
          type: "task.updated",
          status: "cancelled",
          error: "Task cancelled by user",
        });

        this.emit(sessionId, {
          id: `evt-${Date.now()}-msg`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId,
          type: "message.created",
          message: {
            id: `msg-${Date.now()}`,
            sessionId,
            taskId,
            type: "system",
            content: "Task was cancelled.",
            createdAt: new Date().toISOString(),
          },
        });

        this.activeStreams.delete(sessionId);
        break;
      }
    }
  }

  resolveApproval(taskId: string, approvalId: string, approved: boolean): void {
    for (const [sessionId, stream] of this.activeStreams.entries()) {
      if (stream.taskId === taskId && stream.waitingApprovalId === approvalId) {
        this.emit(sessionId, {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId,
          type: "approval.resolved",
          approvalId,
          approved,
        });

        if (stream.resumeApprovalCallback) {
          stream.resumeApprovalCallback(approved);
          stream.resumeApprovalCallback = undefined;
          stream.waitingApprovalId = undefined;
        }
        break;
      }
    }
  }

  startScenario(
    sessionId: string,
    task: Task,
    userPrompt: string,
    scenario: MockScenarioType = "STANDARD_SUCCESS"
  ): void {
    const stream: ActiveStream = {
      taskId: task.id,
      scenario,
      timerIds: [],
      cancelled: false,
    };
    this.activeStreams.set(sessionId, stream);

    const schedule = (ms: number, fn: () => void) => {
      const timer = setTimeout(() => {
        if (!stream.cancelled) {
          fn();
        }
      }, ms);
      stream.timerIds.push(timer);
    };

    switch (scenario) {
      case "APPROVAL_REQUIRED":
        this.runApprovalRequiredScenario(sessionId, task, stream, schedule);
        break;
      case "TOOL_FAILURE":
        this.runToolFailureScenario(sessionId, task, stream, schedule);
        break;
      case "VERIFICATION_FAILURE":
        this.runVerificationFailureScenario(sessionId, task, stream, schedule);
        break;
      case "SLOW_TASK":
        this.runSlowTaskScenario(sessionId, task, stream, schedule);
        break;
      case "TASK_CANCELLATION":
        this.runCancellationScenario(sessionId, task, stream, schedule);
        break;
      case "MULTI_STEP":
        this.runMultiStepScenario(sessionId, task, stream, schedule);
        break;
      case "STANDARD_SUCCESS":
      default:
        this.runStandardSuccessScenario(sessionId, task, userPrompt, stream, schedule);
        break;
    }
  }

  // --- Scenario Implementations ---

  private runStandardSuccessScenario(
    sessionId: string,
    task: Task,
    userPrompt: string,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    const steps: TaskStep[] = [
      { id: "step-1", title: "Read relevant preferences", status: "pending" },
      { id: "step-2", title: "Check recent activity", status: "pending" },
      { id: "step-3", title: "Find candidates", status: "pending" },
      { id: "step-4", title: "Verify availability", status: "pending" },
      { id: "step-5", title: "Present recommendation", status: "pending" },
    ];

    // 1. task.created
    schedule(100, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps,
      });
    });

    // 2. Agent reply acknowledging intent
    schedule(350, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "agent",
          content:
            "I'll review what you've enjoyed recently and find something tailored for you.",
          createdAt: new Date().toISOString(),
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-status`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "agent.status_changed",
        status: "executing",
        message: "Reading preferences",
      });
    });

    // 3. Step 1: Read preferences
    schedule(800, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "tool.started",
        call: {
          id: `call-1`,
          toolName: "memory.search_preferences",
          arguments: { query: userPrompt },
          timestamp: new Date().toISOString(),
        },
      });
    });

    schedule(1200, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "tool.completed",
        result: {
          callId: `call-1`,
          toolName: "memory.search_preferences",
          success: true,
          durationMs: 400,
          timestamp: new Date().toISOString(),
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-act1`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "activity",
          content: "Retrieved relevant preferences and history",
          createdAt: new Date().toISOString(),
          activity: {
            step: "Read relevant preferences",
            status: "completed",
            toolName: "memory.search_preferences",
            durationMs: 400,
          },
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-up1`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "running",
        currentStep: "Checking recent activity",
        progress: 25,
      });
    });

    // 4. Step 2 & 3: Find candidates
    schedule(1800, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-act2`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "activity",
          content: "Evaluated 5 candidates matching your taste",
          createdAt: new Date().toISOString(),
          activity: {
            step: "Find candidates",
            status: "completed",
            toolName: "catalog.search",
            durationMs: 600,
          },
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-up2`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "verifying",
        currentStep: "Verifying candidate availability",
        progress: 75,
      });
    });

    // 5. Step 4: Verification
    schedule(2300, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-v1`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "verification.started",
        rule: "check_candidate_availability",
      });
    });

    schedule(2700, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-v2`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "verification.completed",
        result: {
          status: "passed",
          rule: "check_candidate_availability",
          expected: "Item is accessible in current region and library",
          observed: "Available in high definition",
          details: "Verification rule passed successfully.",
          timestamp: new Date().toISOString(),
        },
      });
    });

    // 6. Step 5: Completed
    schedule(3200, () => {
      const result: ResultDetails = {
        title: "Starlight Echoes (2024)",
        summary:
          "A thoughtful sci-fi journey with a resonant ambient soundtrack, matching your high rating for atmospheric narratives.",
        actions: [
          { id: "act-1", label: "Play Now", actionType: "play" },
          { id: "act-2", label: "Save to Watchlist", actionType: "save" },
        ],
        verification: {
          status: "passed",
          rule: "check_candidate_availability",
          observed: "Available and ready",
          timestamp: new Date().toISOString(),
        },
      };

      this.emit(sessionId, {
        id: `evt-${Date.now()}-comp`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.completed",
        result,
        completedAt: new Date().toISOString(),
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-resmsg`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "result",
          content: "Here is what I selected for you:",
          createdAt: new Date().toISOString(),
          result,
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-done`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "agent.status_changed",
        status: "idle",
      });

      this.activeStreams.delete(sessionId);
    });
  }

  private runApprovalRequiredScenario(
    sessionId: string,
    task: Task,
    stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    const approvalId = `appr-${Date.now()}`;
    stream.waitingApprovalId = approvalId;

    schedule(150, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps: [
          { id: "step-1", title: "Analyze request", status: "completed" },
          {
            id: "step-2",
            title: "Awaiting approval to execute external action",
            status: "running",
          },
          { id: "step-3", title: "Dispatch notification", status: "pending" },
        ],
      });
    });

    schedule(700, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "approval.requested",
        approvalId,
        action: "Send email summary to team lead",
        target: "lead@perlica.local",
        consequence:
          "An external email containing your project status will be transmitted immediately.",
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-msg`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "approval",
          content:
            "Perlica prepared the update but requires your permission before sending external communications.",
          createdAt: new Date().toISOString(),
          approval: {
            approvalId,
            action: "Send email summary to team lead",
            target: "lead@perlica.local",
            consequence:
              "An external email containing your project status will be transmitted immediately.",
            status: "pending",
          },
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-up`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "waiting",
        currentStep: "Waiting for user approval",
        progress: 50,
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-agent`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "agent.status_changed",
        status: "waiting",
        message: "Approval required",
      });
    });

    // Callback when user approves or rejects in UI
    stream.resumeApprovalCallback = (approved: boolean) => {
      if (approved) {
        this.emit(sessionId, {
          id: `evt-${Date.now()}-res`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId: task.id,
          type: "task.updated",
          status: "running",
          currentStep: "Dispatching authorized communication",
          progress: 80,
        });

        setTimeout(() => {
          this.emit(sessionId, {
            id: `evt-${Date.now()}-comp`,
            timestamp: new Date().toISOString(),
            sessionId,
            taskId: task.id,
            type: "task.completed",
            result: {
              title: "Update Dispatched Successfully",
              summary:
                "The status email was sent to lead@perlica.local with your authorization.",
              actions: [{ id: "a1", label: "View Sent Log", actionType: "view_log" }],
            },
            completedAt: new Date().toISOString(),
          });

          this.emit(sessionId, {
            id: `evt-${Date.now()}-resmsg`,
            timestamp: new Date().toISOString(),
            sessionId,
            taskId: task.id,
            type: "message.created",
            message: {
              id: `msg-${Date.now()}`,
              sessionId,
              taskId: task.id,
              type: "result",
              content: "Action executed with your approval.",
              createdAt: new Date().toISOString(),
              result: {
                title: "Update Dispatched",
                summary: "Status report sent successfully to lead@perlica.local.",
                actions: [],
              },
            },
          });

          this.activeStreams.delete(sessionId);
        }, 1200);
      } else {
        this.emit(sessionId, {
          id: `evt-${Date.now()}-rej`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId: task.id,
          type: "task.updated",
          status: "cancelled",
          error: "Action was declined by user",
        });

        this.emit(sessionId, {
          id: `evt-${Date.now()}-rejmsg`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId: task.id,
          type: "message.created",
          message: {
            id: `msg-${Date.now()}`,
            sessionId,
            taskId: task.id,
            type: "system",
            content: "Action cancelled per your request.",
            createdAt: new Date().toISOString(),
          },
        });

        this.activeStreams.delete(sessionId);
      }
    };
  }

  private runToolFailureScenario(
    sessionId: string,
    task: Task,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    schedule(150, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps: [
          { id: "s1", title: "Initialize service connection", status: "running" },
          { id: "s2", title: "Query target library", status: "pending" },
        ],
      });
    });

    schedule(600, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "tool.started",
        call: {
          id: "call-err",
          toolName: "network.connect_service",
          arguments: { service: "media-provider" },
          timestamp: new Date().toISOString(),
        },
      });
    });

    schedule(1400, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "tool.completed",
        result: {
          callId: "call-err",
          toolName: "network.connect_service",
          success: false,
          error:
            "Service unavailable (503 Service Unavailable). Connection timed out after 3 retries.",
          durationMs: 800,
          timestamp: new Date().toISOString(),
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-fail`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.failed",
        error:
          "Media service is currently unreachable. Please check your internet connection or retry shortly.",
        retryable: true,
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-failmsg`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "system",
          content:
            "Task failed: Media service unavailable (503). You can retry this request.",
          createdAt: new Date().toISOString(),
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-agent`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "agent.status_changed",
        status: "error",
      });

      this.activeStreams.delete(sessionId);
    });
  }

  private runVerificationFailureScenario(
    sessionId: string,
    task: Task,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    schedule(200, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps: [
          { id: "s1", title: "Generate report file", status: "completed" },
          { id: "s2", title: "Verify file presence and integrity", status: "running" },
        ],
      });
    });

    schedule(1000, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "verification.started",
        rule: "verify_file_exists_on_disk",
      });
    });

    schedule(1800, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "verification.completed",
        result: {
          status: "failed",
          rule: "verify_file_exists_on_disk",
          expected: "File present at ./output/report.pdf with size > 0 bytes",
          observed: "Target path does not exist",
          details:
            "Verification rule failed: Independent check could not confirm output integrity.",
          timestamp: new Date().toISOString(),
        },
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-fail`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.failed",
        error:
          "Verification failed: The expected outcome was not independently confirmed on disk.",
        retryable: true,
      });

      this.emit(sessionId, {
        id: `evt-${Date.now()}-msg`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "message.created",
        message: {
          id: `msg-${Date.now()}`,
          sessionId,
          taskId: task.id,
          type: "system",
          content:
            "Verification failed: Perlica could not verify that the expected file was written to disk.",
          createdAt: new Date().toISOString(),
        },
      });

      this.activeStreams.delete(sessionId);
    });
  }

  private runSlowTaskScenario(
    sessionId: string,
    task: Task,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    const steps: TaskStep[] = [
      { id: "s1", title: "Indexing workspace files", status: "pending" },
      { id: "s2", title: "Scanning dependency tree", status: "pending" },
      { id: "s3", title: "Analyzing architectural boundaries", status: "pending" },
      { id: "s4", title: "Synthesizing report", status: "pending" },
    ];

    schedule(200, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps,
      });
    });

    [1, 2, 3, 4].forEach((stepIndex) => {
      schedule(stepIndex * 1500, () => {
        const step = steps[stepIndex - 1];
        step.status = "completed";

        this.emit(sessionId, {
          id: `evt-${Date.now()}-${stepIndex}`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId: task.id,
          type: "task.updated",
          status: stepIndex === 4 ? "completed" : "running",
          currentStep: stepIndex < 4 ? steps[stepIndex].title : "Complete",
          progress: stepIndex * 25,
        });

        this.emit(sessionId, {
          id: `evt-${Date.now()}-act-${stepIndex}`,
          timestamp: new Date().toISOString(),
          sessionId,
          taskId: task.id,
          type: "message.created",
          message: {
            id: `msg-${Date.now()}`,
            sessionId,
            taskId: task.id,
            type: "activity",
            content: `Completed: ${step.title}`,
            createdAt: new Date().toISOString(),
            activity: {
              step: step.title,
              status: "completed",
              durationMs: 1200,
            },
          },
        });
      });
    });

    schedule(6500, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-comp`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.completed",
        result: {
          title: "Comprehensive Workspace Audit",
          summary:
            "Indexed 1,420 files across 12 packages. Zero boundary violations detected.",
          actions: [],
        },
        completedAt: new Date().toISOString(),
      });

      this.activeStreams.delete(sessionId);
    });
  }

  private runCancellationScenario(
    sessionId: string,
    task: Task,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    schedule(200, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps: [
          { id: "s1", title: "Long computation step 1", status: "running" },
          { id: "s2", title: "Long computation step 2", status: "pending" },
        ],
      });
    });

    // Automatically cancel after 2 seconds to simulate quick user abort
    schedule(2000, () => {
      this.cancelTask(task.id);
    });
  }

  private runMultiStepScenario(
    sessionId: string,
    task: Task,
    _stream: ActiveStream,
    schedule: (ms: number, fn: () => void) => void
  ) {
    const steps = [
      { id: "s1", title: "Gathering sources from docs", status: "pending" as const },
      {
        id: "s2",
        title: "Cross-referencing technical specifications",
        status: "pending" as const,
      },
      {
        id: "s3",
        title: "Validating against safety policies",
        status: "pending" as const,
      },
      { id: "s4", title: "Formatting final output", status: "pending" as const },
    ];

    schedule(150, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.created",
        title: task.title,
        steps,
      });
    });

    schedule(900, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "running",
        currentStep: steps[1].title,
        progress: 30,
      });
    });

    schedule(1800, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "running",
        currentStep: steps[2].title,
        progress: 60,
      });
    });

    schedule(2700, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.updated",
        status: "verifying",
        currentStep: steps[3].title,
        progress: 90,
      });
    });

    schedule(3500, () => {
      this.emit(sessionId, {
        id: `evt-${Date.now()}-done`,
        timestamp: new Date().toISOString(),
        sessionId,
        taskId: task.id,
        type: "task.completed",
        result: {
          title: "Multi-Source Research Report",
          summary:
            "Successfully analyzed 4 documentation sources and aligned with technical standards.",
          actions: [],
        },
        completedAt: new Date().toISOString(),
      });

      this.activeStreams.delete(sessionId);
    });
  }
}
