import { z } from "zod";

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ThemeModeSchema = z.enum(["dark", "light", "system"]);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
