import React from "react";
import { ThemeProvider } from "../lib/theme/theme-context.js";
import { AgentRootProvider } from "../features/agent/agent-provider.js";
import { AppShell } from "../components/layout/AppShell.js";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AgentRootProvider>
        <AppShell />
      </AgentRootProvider>
    </ThemeProvider>
  );
};
