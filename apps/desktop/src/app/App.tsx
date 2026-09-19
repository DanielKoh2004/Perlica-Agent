import React from "react";
import { ThemeProvider } from "../lib/theme/theme-context.js";
import { AgentProvider } from "../features/agent/agent-context.js";
import { AppShell } from "../components/layout/AppShell.js";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AgentProvider>
        <AppShell />
      </AgentProvider>
    </ThemeProvider>
  );
};
