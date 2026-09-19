import React, { useMemo } from "react";
import type { Session } from "@perlica/contracts";
import { NewSessionButton } from "./NewSessionButton.js";
import { SessionItem } from "./SessionItem.js";
import { useSessions } from "../../hooks/useSessions.js";
import { useCurrentSession } from "../../hooks/useCurrentSession.js";
import { Clock } from "lucide-react";

export const SessionSidebar: React.FC = () => {
  const { sessions, createSession, deleteSession } = useSessions();
  const { activeSessionId, setActiveSessionId } = useCurrentSession();

  const groupedSessions = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const twoDays = 48 * 60 * 60 * 1000;

    const today: Session[] = [];
    const yesterday: Session[] = [];
    const earlier: Session[] = [];

    sessions.forEach((s) => {
      const createdTime = new Date(s.createdAt).getTime();
      const diff = now - createdTime;

      if (diff < oneDay) {
        today.push(s);
      } else if (diff < twoDays) {
        yesterday.push(s);
      } else {
        earlier.push(s);
      }
    });

    return { today, yesterday, earlier };
  }, [sessions]);

  return (
    <aside className="w-64 h-full bg-surface/50 border-r border-border/60 flex flex-col select-none shrink-0">
      {/* Top action */}
      <div className="p-3 border-b border-border/40">
        <NewSessionButton onClick={() => createSession()} />
      </div>

      {/* Session list or empty state */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center px-4 py-8 text-muted-foreground">
            <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-xs font-medium text-foreground/80">No sessions yet</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Start a conversation with Perlica to begin.
            </p>
          </div>
        ) : (
          <>
            {groupedSessions.today.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
                  Today
                </div>
                {groupedSessions.today.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={setActiveSessionId}
                    onDelete={deleteSession}
                  />
                ))}
              </div>
            )}

            {groupedSessions.yesterday.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
                  Yesterday
                </div>
                {groupedSessions.yesterday.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={setActiveSessionId}
                    onDelete={deleteSession}
                  />
                ))}
              </div>
            )}

            {groupedSessions.earlier.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
                  Earlier
                </div>
                {groupedSessions.earlier.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={setActiveSessionId}
                    onDelete={deleteSession}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
