import React, { useState } from "react";
import { Terminal, ChevronDown, ChevronUp, Database, Play } from "lucide-react";
import { useScenario } from "../agent/client-context.js";
import { useConversation } from "../../hooks/useConversation.js";
import { StorageService } from "../../lib/storage/storage-service.js";
import type { MockScenarioType } from "../agent/api/agent-client.js";

const SCENARIOS: { id: MockScenarioType; label: string }[] = [
  { id: "STANDARD_SUCCESS", label: "Standard Success (Tool + Verification)" },
  { id: "APPROVAL_REQUIRED", label: "Approval Required (Pause & Ask)" },
  { id: "SLOW_TASK", label: "Slow Task (Multi-second Progress)" },
  { id: "TOOL_FAILURE", label: "Tool Failure (Retryable Error)" },
  { id: "VERIFICATION_FAILURE", label: "Verification Failure (Integrity Mismatch)" },
  { id: "TASK_CANCELLATION", label: "Task Cancellation (Abort Flow)" },
  { id: "MULTI_STEP", label: "Multi-Step Research Flow" },
];

export const DevToolbar: React.FC = () => {
  // Only render in dev builds
  if (!import.meta.env.DEV) return null;

  const { selectedScenario, setSelectedScenario } = useScenario();
  const { sendMessage } = useConversation();
  const [collapsed, setCollapsed] = useState(true);
  const [demoMode, setDemoModeState] = useState(() => StorageService.getDemoMode());

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoModeState(next);
    StorageService.setDemoMode(next);
    window.location.reload(); // Reload to re-initialize with mock data or clean state
  };

  const handleRunPreset = async () => {
    switch (selectedScenario) {
      case "APPROVAL_REQUIRED":
        await sendMessage("Please prepare an external project update for our team lead.");
        break;
      case "TOOL_FAILURE":
        await sendMessage("Connect to external media catalog and query library.");
        break;
      case "VERIFICATION_FAILURE":
        await sendMessage("Export project audit report to disk and verify integrity.");
        break;
      case "SLOW_TASK":
        await sendMessage("Run comprehensive workspace dependency indexing.");
        break;
      case "TASK_CANCELLATION":
        await sendMessage("Start long background processing.");
        break;
      case "MULTI_STEP":
        await sendMessage("Synthesize research documentation across modules.");
        break;
      case "STANDARD_SUCCESS":
      default:
        await sendMessage("Find something I would enjoy watching tonight.");
        break;
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none">
      <div className="bg-surface-elevated/95 border border-border shadow-2xl rounded-xl backdrop-blur-md overflow-hidden transition-all text-xs">
        {/* Toggle header */}
        <div
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer hover:bg-surface-secondary/80 text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-1.5 font-mono font-semibold text-[11px] text-accent">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEV / SCENARIO ENGINE</span>
          </div>
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>

        {/* Expanded controls */}
        {!collapsed && (
          <div className="p-3 border-t border-border/60 space-y-3 w-80">
            {/* Scenario dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                Active Mock Scenario
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as MockScenarioType)}
                className="w-full bg-surface-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick run button */}
            <button
              onClick={handleRunPreset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent font-medium rounded-lg border border-accent/30 transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>Trigger Scenario Request</span>
            </button>

            {/* Demo Mode toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Database className="w-3.5 h-3.5" />
                <span className="text-[11px]">Demo Mode (Seeded History)</span>
              </div>
              <button
                onClick={handleToggleDemoMode}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  demoMode
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-surface-secondary text-muted-foreground border border-border"
                }`}
              >
                {demoMode ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
