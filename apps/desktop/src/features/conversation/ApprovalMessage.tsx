import React from "react";
import type { Message } from "@perlica/contracts";
import { ShieldAlert, Check, X } from "lucide-react";
import { useCurrentTask } from "../../hooks/useCurrentTask.js";

interface ApprovalMessageProps {
  message: Message;
}

export const ApprovalMessage: React.FC<ApprovalMessageProps> = ({ message }) => {
  const { resolveApproval } = useCurrentTask();
  const app = message.approval;

  if (!app) return null;

  return (
    <div className="pl-9 w-full max-w-xl animate-fade-in my-2">
      <div className="p-4 rounded-2xl bg-warning-soft border border-warning/30 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-warning font-semibold text-xs">
          <ShieldAlert className="w-4 h-4" />
          <span>Authorization Required</span>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-foreground">{app.action}</h4>
          {app.target && (
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Target: {app.target}
            </p>
          )}
          <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
            {app.consequence}
          </p>
        </div>

        {app.status === "pending" ? (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => resolveApproval(app.approvalId, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-warning text-warning-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Approve Action
            </button>
            <button
              onClick={() => resolveApproval(app.approvalId, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-elevated text-foreground rounded-lg hover:bg-surface-secondary border border-border transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </div>
        ) : (
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                app.status === "approved"
                  ? "bg-success/15 text-success border border-success/25"
                  : "bg-destructive/15 text-destructive border border-destructive/25"
              }`}
            >
              {app.status === "approved" ? "Approved by User" : "Declined by User"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
