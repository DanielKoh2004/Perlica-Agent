import { z } from "zod";

export const SessionStatusSchema = z.enum(["active", "archived"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(1),
  createdAt: z.string().datetime().or(z.string().min(1)),
  updatedAt: z.string().datetime().or(z.string().min(1)),
  status: SessionStatusSchema,
});
export type Session = z.infer<typeof SessionSchema>;
