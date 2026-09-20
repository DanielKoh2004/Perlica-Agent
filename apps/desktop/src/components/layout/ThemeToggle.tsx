import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../lib/theme/theme-context.js";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
      title={`Theme: ${theme} (click to toggle)`}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
    >
      {theme === "dark" && <Moon className="w-3.5 h-3.5" />}
      {theme === "light" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
      {theme === "system" && <Monitor className="w-3.5 h-3.5" />}
    </button>
  );
};
