import {
  UserProfileSchema,
  UserProfile,
  ThemeModeSchema,
  ThemeMode,
} from "@perlica/contracts";

export type { UserProfile, ThemeMode };

const STORAGE_KEYS = {
  THEME: "perlica_theme_mode",
  PROFILE: "perlica_user_profile",
  ACTIVE_SESSION_ID: "perlica_active_session_id",
  DEMO_MODE: "perlica_demo_mode",
} as const;

/**
 * StorageService provides a centralized boundary for client-side persistence.
 * Prevents direct localStorage calls from leaking into UI components.
 * Validates all persisted data across storage boundaries using @perlica/contracts.
 */
export const StorageService = {
  getThemeMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      const parsed = ThemeModeSchema.safeParse(saved);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return "system";
  },

  setThemeMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch {
      // Ignore write errors in restricted environments
    }
  },

  getUserProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        const validated = UserProfileSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    } catch {
      // Fallback on invalid or corrupt storage data
    }
    return {
      name: "Endministrator",
      avatarUrl: "/endministrator_chat_img.jpg",
    };
  },

  setUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch {
      return null;
    }
  },

  setActiveSessionId(sessionId: string | null): void {
    try {
      if (sessionId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, sessionId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      }
    } catch {
      // Ignore
    }
  },

  getDemoMode(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (saved !== null) {
        return saved === "true";
      }
    } catch {
      // Fallback
    }
    // Default to environment variable if present, otherwise false
    return import.meta.env.VITE_DEMO_MODE === "true";
  },

  setDemoMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(enabled));
    } catch {
      // Ignore
    }
  },
};
