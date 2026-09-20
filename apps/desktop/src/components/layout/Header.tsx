import React from "react";
import { PanelLeft, PanelRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle.js";
import { UserProfileBadge } from "./UserProfileBadge.js";

interface HeaderProps {
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Header layout component composing navigation toggles, brand emblem,
 * user profile badge, and theme switcher.
 */
export const Header: React.FC<HeaderProps> = ({
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
}) => {
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
          <div className="w-6 h-6 rounded-full overflow-hidden border border-accent/40 flex items-center justify-center bg-surface shrink-0 ring-1 ring-accent/20">
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
        <UserProfileBadge />
        <ThemeToggle />

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
