import { z } from "zod";
import { TaskStatusSchema, TaskStepSchema } from "./task.js";
import { ToolCallSchema, ToolResultSchema } from "./tool.js";
import { VerificationResultSchema } from "./verification.js";
import { MessageSchema, ResultDetailsSchema } from "./message.js";

const BaseEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime().or(z.string().min(1)),
  sessionId: z.string().min(1),
  taskId: z.string().min(1),
});

export const TaskCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("task.created"),
  title: z.string().min(1),
  steps: z.array(TaskStepSchema).default([]),
});
export type TaskCreatedEvent = z.infer<typeof TaskCreatedEventSchema>;

export const TaskUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("task.updated"),
  status: TaskStatusSchema,
  currentStep: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});
export type TaskUpdatedEvent = z.infer<typeof TaskUpdatedEventSchema>;

export const AgentStatusChangedEventSchema = BaseEventSchema.extend({
  type: z.literal("agent.status_changed"),
  status: z.enum([
    "idle",
    "thinking",
    "executing",
    "waiting",
    "verifying",
    "done",
    "error",
  ]),
  message: z.string().optional(),
});
export type AgentStatusChangedEvent = z.infer<typeof AgentStatusChangedEventSchema>;

export const ToolStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("tool.started"),
  call: ToolCallSchema,
});
export type ToolStartedEvent = z.infer<typeof ToolStartedEventSchema>;

export const ToolCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("tool.completed"),
  result: ToolResultSchema,
});
export type ToolCompletedEvent = z.infer<typeof ToolCompletedEventSchema>;

export const VerificationStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("verification.started"),
  rule: z.string().min(1),
});
export type VerificationStartedEvent = z.infer<typeof VerificationStartedEventSchema>;

export const VerificationCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("verification.completed"),
  result: VerificationResultSchema,
});
export type VerificationCompletedEvent = z.infer<typeof VerificationCompletedEventSchema>;

export const ApprovalRequestedEventSchema = BaseEventSchema.extend({
  type: z.literal("approval.requested"),
  approvalId: z.string().min(1),
  action: z.string().min(1),
  target: z.string().optional(),
  consequence: z.string().min(1),
});
export type ApprovalRequestedEvent = z.infer<typeof ApprovalRequestedEventSchema>;

export const ApprovalResolvedEventSchema = BaseEventSchema.extend({
  type: z.literal("approval.resolved"),
  approvalId: z.string().min(1),
  approved: z.boolean(),
});
export type ApprovalResolvedEvent = z.infer<typeof ApprovalResolvedEventSchema>;

export const MessageCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("message.created"),
  message: MessageSchema,
});
export type MessageCreatedEvent = z.infer<typeof MessageCreatedEventSchema>;

export const TaskCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("task.completed"),
  result: ResultDetailsSchema,
  completedAt: z.string().datetime().or(z.string().min(1)),
});
export type TaskCompletedEvent = z.infer<typeof TaskCompletedEventSchema>;

export const TaskFailedEventSchema = BaseEventSchema.extend({
  type: z.literal("task.failed"),
  error: z.string().min(1),
  retryable: z.boolean().default(false),
});
export type TaskFailedEvent = z.infer<typeof TaskFailedEventSchema>;

export const AgentEventSchema = z.discriminatedUnion("type", [
  TaskCreatedEventSchema,
  TaskUpdatedEventSchema,
  AgentStatusChangedEventSchema,
  ToolStartedEventSchema,
  ToolCompletedEventSchema,
  VerificationStartedEventSchema,
  VerificationCompletedEventSchema,
  ApprovalRequestedEventSchema,
  ApprovalResolvedEventSchema,
  MessageCreatedEventSchema,
  TaskCompletedEventSchema,
  TaskFailedEventSchema,
]);
export type AgentEvent = z.infer<typeof AgentEventSchema>;
export type AgentEventType = AgentEvent["type"];
