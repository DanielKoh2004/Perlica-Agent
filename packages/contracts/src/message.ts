import { z } from "zod";
import { VerificationResultSchema } from "./verification.js";

export const MessageTypeSchema = z.enum([
  "user",
  "agent",
  "activity",
  "system",
  "approval",
  "result",
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ApprovalDetailsSchema = z.object({
  approvalId: z.string().min(1),
  action: z.string().min(1),
  target: z.string().optional(),
  consequence: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});
export type ApprovalDetails = z.infer<typeof ApprovalDetailsSchema>;

export const ResultActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  actionType: z.string().min(1),
  payload: z.unknown().optional(),
});
export type ResultAction = z.infer<typeof ResultActionSchema>;

export const ResultDetailsSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  actions: z.array(ResultActionSchema).optional().default([]),
  verification: VerificationResultSchema.optional(),
  data: z.unknown().optional(),
});
export type ResultDetails = z.infer<typeof ResultDetailsSchema>;

export const ActivityDetailsSchema = z.object({
  step: z.string().min(1),
  status: z.enum(["running", "completed", "failed"]).default("completed"),
  toolName: z.string().optional(),
  durationMs: z.number().nonnegative().optional(),
});
export type ActivityDetails = z.infer<typeof ActivityDetailsSchema>;

export const MessageSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  taskId: z.string().optional(),
  type: MessageTypeSchema,
  content: z.string(),
  createdAt: z.string().datetime().or(z.string().min(1)),
  activity: ActivityDetailsSchema.optional(),
  approval: ApprovalDetailsSchema.optional(),
  result: ResultDetailsSchema.optional(),
});
export type Message = z.infer<typeof MessageSchema>;
