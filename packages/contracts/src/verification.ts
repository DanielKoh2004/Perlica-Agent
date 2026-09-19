import { z } from "zod";

export const VerificationStatusSchema = z.enum([
  "pending",
  "running",
  "passed",
  "failed",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const VerificationResultSchema = z.object({
  status: VerificationStatusSchema,
  rule: z.string().min(1),
  expected: z.string().optional(),
  observed: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.string().datetime().or(z.string().min(1)),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
