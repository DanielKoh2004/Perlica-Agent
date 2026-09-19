import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "created",
  "running",
  "waiting",
  "verifying",
  "completed",
  "failed",
  "cancelled",
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskStepStatusSchema = z.enum(["pending", "running", "completed", "failed"]);
export type TaskStepStatus = z.infer<typeof TaskStepStatusSchema>;

export const TaskStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: TaskStepStatusSchema,
  startedAt: z.string().datetime().or(z.string().min(1)).optional(),
  completedAt: z.string().datetime().or(z.string().min(1)).optional(),
});
export type TaskStep = z.infer<typeof TaskStepSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  title: z.string().min(1),
  status: TaskStatusSchema,
  currentStep: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  steps: z.array(TaskStepSchema).default([]),
  startedAt: z.string().datetime().or(z.string().min(1)),
  updatedAt: z.string().datetime().or(z.string().min(1)),
  completedAt: z.string().datetime().or(z.string().min(1)).optional(),
  error: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;
