import React, { createContext, useContext, useMemo, useState } from "react";
import { AgentClient, MockScenarioType } from "./api/agent-client.js";
import { MockAgentClient } from "./api/mock-agent-client.js";

export interface AgentClientContextValue {
  client: AgentClient;
  selectedScenario: MockScenarioType;
  setSelectedScenario: (scenario: MockScenarioType) => void;
}

const AgentClientContext = createContext<AgentClientContextValue | null>(null);

export const AgentClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = useMemo(() => new MockAgentClient(), []);
  const [selectedScenario, setSelectedScenario] =
    useState<MockScenarioType>("STANDARD_SUCCESS");

  return (
    <AgentClientContext.Provider
      value={{
        client,
        selectedScenario,
        setSelectedScenario,
      }}
    >
      {children}
    </AgentClientContext.Provider>
  );
};

export function useAgentClientContext(): AgentClientContextValue {
  const context = useContext(AgentClientContext);
  if (!context) {
    throw new Error("useAgentClientContext must be used within an AgentClientProvider");
  }
  return context;
}

export function useScenario(): {
  selectedScenario: MockScenarioType;
  setSelectedScenario: (scenario: MockScenarioType) => void;
} {
  const context = useAgentClientContext();
  return {
    selectedScenario: context.selectedScenario,
    setSelectedScenario: context.setSelectedScenario,
  };
}
