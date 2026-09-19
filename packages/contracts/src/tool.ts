import { z } from "zod";

export const ToolCallSchema = z.object({
  id: z.string().min(1),
  toolName: z.string().min(1),
  arguments: z.record(z.unknown()).default({}),
  timestamp: z.string().datetime().or(z.string().min(1)),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResultSchema = z.object({
  callId: z.string().min(1),
  toolName: z.string().min(1),
  result: z.unknown().optional(),
  success: z.boolean(),
  error: z.string().optional(),
  durationMs: z.number().nonnegative().optional(),
  timestamp: z.string().datetime().or(z.string().min(1)),
});
export type ToolResult = z.infer<typeof ToolResultSchema>;
