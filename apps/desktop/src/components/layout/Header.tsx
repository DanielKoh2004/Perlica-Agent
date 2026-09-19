import React, { useState } from "react";
import { Sun, Moon, Monitor, PanelLeft, PanelRight, Check, X } from "lucide-react";
import { useTheme } from "../../lib/theme/theme-context.js";
import { useAgent } from "../../features/agent/agent-context.js";

interface HeaderProps {
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
}) => {
  const { theme, setTheme } = useTheme();
  const { userProfile, updateUserProfile } = useAgent();
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      updateUserProfile({ ...userProfile, name: tempName.trim() });
    }
    setEditingProfile(false);
  };

  return (
    <header className="h-12 border-b border-border/60 bg-surface/80 backdrop-blur-md px-3 flex items-center justify-between select-none z-10">
      {/* Left section: Toggle & Brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLeftSidebarOpen((prev) => !prev)}
          className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors ${
            !leftSidebarOpen ? "opacity-60" : ""
          }`}
          title="Toggle Sessions Sidebar"
          aria-label="Toggle Sessions Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-1">
          <div className="w-6 h-6 rounded-md overflow-hidden border border-accent/40 flex items-center justify-center bg-surface shrink-0 ring-1 ring-accent/20">
            <img
              src="/perlica_chat_img.jpg"
              alt="Perlica"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <span className="font-semibold text-xs tracking-widest uppercase text-foreground/90">
            Perlica
          </span>
          <span className="text-[10px] text-accent font-mono px-1.5 py-0.2 rounded bg-accent/10 border border-accent/20">
            v0.1
          </span>
        </div>
      </div>

      {/* Right section: User profile & controls */}
      <div className="flex items-center gap-2">
        {/* Profile indicator */}
        {editingProfile ? (
          <div className="flex items-center gap-1 bg-surface-secondary px-2 py-0.5 rounded-md border border-border">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveProfile();
                if (e.key === "Escape") setEditingProfile(false);
              }}
              className="w-28 bg-transparent text-xs text-foreground focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveProfile}
              className="text-success hover:text-success/80 p-0.5"
              aria-label="Save name"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEditingProfile(false)}
              className="text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setTempName(userProfile.name);
              setEditingProfile(true);
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface-secondary transition-colors"
            title="Click to edit your name"
          >
            <div className="w-5 h-5 rounded-md overflow-hidden border border-border shrink-0">
              <img
                src="/endministrator_chat_img.jpg"
                alt="Endministrator"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <span className="font-medium text-foreground/90">{userProfile.name}</span>
          </button>
        )}

        {/* Theme mode button */}
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

        {/* Right sidebar toggle */}
        <button
          onClick={() => setRightSidebarOpen((prev) => !prev)}
          className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors ${
            !rightSidebarOpen ? "opacity-60" : ""
          }`}
          title="Toggle Ongoing Task Sidebar"
          aria-label="Toggle Ongoing Task Sidebar"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
