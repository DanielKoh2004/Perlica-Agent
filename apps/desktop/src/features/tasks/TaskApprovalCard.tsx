import React from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import type { SessionState } from "../agent/state/agent-state.js";

interface TaskApprovalCardProps {
  approval: NonNullable<SessionState["waitingApproval"]>;
  onResolve: (approvalId: string, approved: boolean) => void;
}

export const TaskApprovalCard: React.FC<TaskApprovalCardProps> = ({
  approval,
  onResolve,
}) => {
  return (
    <div className="p-3 rounded-xl bg-warning-soft border border-warning/30 space-y-2">
      <div className="flex items-center gap-1.5 text-warning font-medium text-xs">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Approval Required</span>
      </div>
      <p className="text-[11px] text-foreground/90 font-medium">{approval.action}</p>
      {approval.target && (
        <p className="text-[10px] text-muted-foreground font-mono truncate">
          Target: {approval.target}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">{approval.consequence}</p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onResolve(approval.approvalId, true)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-warning text-warning-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Check className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={() => onResolve(approval.approvalId, false)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-surface-elevated text-foreground rounded-lg hover:bg-surface-secondary border border-border transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Decline
        </button>
      </div>
    </div>
  );
};
