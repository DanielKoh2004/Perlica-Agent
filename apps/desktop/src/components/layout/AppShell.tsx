import React, { useState } from "react";
import { Header } from "./Header.js";
import { SessionSidebar } from "../../features/sessions/SessionSidebar.js";
import { TaskSidebar } from "../../features/tasks/TaskSidebar.js";
import { HomeView } from "../../features/home/HomeView.js";
import { ConversationView } from "../../features/conversation/ConversationView.js";
import { TalkToPerlica } from "../../features/input/TalkToPerlica.js";
import { DevToolbar } from "../../features/dev/DevToolbar.js";
import { useConversation } from "../../hooks/useConversation.js";
import { useCurrentTask } from "../../hooks/useCurrentTask.js";

export const AppShell: React.FC = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const { messages, sendMessage } = useConversation();
  const { currentTask } = useCurrentTask();

  const isTaskRunning =
    currentTask?.status === "running" || currentTask?.status === "verifying";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Top Header */}
      <Header
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
      />

      {/* Main 3-Column Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Sessions Sidebar */}
        {leftSidebarOpen && <SessionSidebar />}

        {/* Center: Main Workspace */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
          {messages.length === 0 ? (
            <HomeView onSelectSuggestion={(prompt) => sendMessage(prompt)} />
          ) : (
            <ConversationView messages={messages} />
          )}

          {/* Primary Input */}
          <TalkToPerlica onSendMessage={sendMessage} disabled={isTaskRunning} />
        </main>

        {/* Right: Ongoing Task Sidebar */}
        {rightSidebarOpen && <TaskSidebar />}
      </div>

      {/* Developer scenario switcher */}
      <DevToolbar />
    </div>
  );
};
