# Perlica Frontend — `frontend.md`

## 0. Purpose

This document is the authoritative specification for the **Perlica desktop frontend**.

The frontend is the first implementation phase of the Personal Agent project.

The goal of this phase is to build a polished, personalized, Perlica-themed desktop experience that can later connect to the real agent harness without requiring a frontend rewrite.

The frontend must initially operate using mocked data and simulated agent events.

The frontend must already represent the concepts that the eventual harness will provide:

* Sessions
* Current conversation
* User identity
* Current task
* Agent activity
* Task status
* Recommendations
* Memory/context indicators
* Agent responses
* Ongoing operations

The frontend must not implement the actual agent reasoning during this phase.

---

# 1. Product Identity

## 1.1 Name

The personal agent is:

**Perlica**

Perlica is presented as a personalized AI companion/agent rather than a generic chatbot.

The user should feel that they are interacting with **their own Perlica**, not with an interchangeable AI interface.

---

# 2. Primary User Experience

When the user opens the application for the first time or has no active session, the home view must immediately communicate:

```text
Hi, {name}

How should Perlica help you today?
```

Below the greeting, display several suggested actions.

Example:

```text
Hi, Daniel

How should Perlica help you today?

[ Help me get started ]
[ Find something I'd enjoy ]
[ Continue where I left off ]
[ Organize my day ]
```

The suggestions are examples.

They must be represented as reusable recommendation cards rather than hard-coded individually into the page.

---

# 3. Primary Input

Below the recommendation area, provide the primary interaction:

```text
Talk to Perlica
```

This should be the most prominent interaction control on the home screen.

The initial frontend may support:

* text input,
* submit/send,
* microphone button visually,
* disabled/placeholder voice capability where voice is not implemented.

The UI should be designed so voice can be added later without redesigning the entire interaction model.

---

# 4. Core Layout

The application uses a **three-region desktop layout**:

```text
┌──────────────────────────────────────────────────────────────────────┐
│                              PERLICA                                 │
├───────────────┬──────────────────────────────────────┬───────────────┤
│               │                                      │               │
│   Sessions    │              Main Area               │  Ongoing Task │
│   Sidebar     │                                      │    Sidebar    │
│               │  Greeting / conversation / input     │               │
│               │                                      │               │
│               │                                      │               │
│               │                                      │               │
└───────────────┴──────────────────────────────────────┴───────────────┘
```

The three regions have distinct responsibilities.

### Left sidebar

Session/navigation context.

### Center

Primary interaction with Perlica.

### Right sidebar

Current/ongoing agent task state.

Do not combine these responsibilities into one component.

---

# 5. Left Sidebar — Sessions

The left sidebar represents the user's conversations/sessions.

It should contain:

```text
PERLICA

+ New Session

Recent
────────────────
Today
  Project debugging
  Find something to watch
  Daily planning

Yesterday
  Research assistant
  Personal notes

Earlier
  ...
```

The sidebar should make it obvious which session is currently active.

Each session item should support:

* selection,
* active state,
* title,
* timestamp or relative time,
* optional status indicator.

Potential future actions:

* rename,
* archive,
* delete.

These actions do not need to be implemented in the initial UI unless required for the prototype.

---

# 6. Session Model

A session is a conversation/task context.

Conceptually:

```ts
type Session = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: SessionStatus;
};
```

Do not use the conversation message array itself as the session identity.

Sessions must have stable IDs.

---

# 7. Session Sidebar Rules

The left sidebar must:

* preserve session order,
* highlight the active session,
* visually distinguish active/inactive states,
* support long session titles without breaking the layout,
* avoid unnecessary visual noise.

Use truncation where necessary.

Do not allow long titles to change sidebar dimensions.

---

# 8. Center Area — Home State

When there is no active conversation or when the user is on the Perlica home state, display:

```text
Hi, {name}

How should Perlica help you today?
```

followed by recommendation cards.

The center area should have substantial whitespace.

It should feel calm and intentional, not like a dashboard overloaded with widgets.

---

# 9. Recommendation Cards

Recommendations should be presented as compact action cards.

Example:

```text
┌──────────────────────────────┐
│ Find something I'd enjoy     │
│ Let Perlica learn your taste │
└──────────────────────────────┘
```

Each recommendation must contain:

```text
title
optional description
action
```

Recommendations must be data-driven.

Example:

```ts
type SuggestedAction = {
  id: string;
  title: string;
  description?: string;
  prompt: string;
};
```

Do not hard-code individual recommendation JSX directly in the home component.

---

# 10. Recommendation Philosophy

The recommendations are not intended to be the main feature.

They are:

* onboarding,
* discovery,
* examples of what Perlica can eventually do.

They should communicate capability without overwhelming the user.

Avoid displaying a large grid of feature categories.

The user should understand:

> "I can simply tell Perlica what I want."

---

# 11. Talk to Perlica Input

The main input component should communicate:

```text
Talk to Perlica
```

rather than:

```text
Enter message
```

or:

```text
Ask anything
```

The product is Perlica, so the interaction should feel personal.

Suggested structure:

```text
┌────────────────────────────────────────────────────┐
│ Talk to Perlica...                          🎙  ↑   │
└────────────────────────────────────────────────────┘
```

The exact placeholder may evolve, but the interaction must remain clearly centered around talking to Perlica.

---

# 12. Conversation State

Once the user sends a request, the center area changes from the home state into a conversation/task state.

Example:

```text
User
Find something I would enjoy tonight.

Perlica
I'll look at what you've enjoyed recently and find something appropriate.

[activity]
Retrieving relevant preferences
Searching candidates
Checking availability

Perlica
I found something that looks like a good fit.
```

The frontend must support agent activity without exposing private chain-of-thought.

---

# 13. Agent Activity

Activity should display **operational status**, not internal reasoning.

Allowed:

```text
Retrieving relevant context
Searching
Checking availability
Running tool
Verifying result
Waiting for approval
Completed
```

Do not display private model reasoning such as:

```text
I think the user probably...
Maybe I should...
I'm uncertain whether...
```

unless it is deliberately surfaced as a user-facing explanation.

---

# 14. Center Conversation Components

The conversation area should support distinct message types:

```text
UserMessage
AgentMessage
ActivityMessage
SystemMessage
ApprovalMessage
ResultMessage
```

These must not all be rendered using one giant conditional component.

Each message type should have a clear rendering responsibility.

---

# 15. Right Sidebar — Ongoing Task

The right sidebar shows what Perlica is currently doing.

It should answer:

> **What is Perlica working on right now?**

Example:

```text
ONGOING TASK

Find something you'll enjoy

✓ Read relevant preferences
✓ Checked recent activity
→ Finding candidates
○ Verify availability
○ Present result
```

The sidebar should update as mock agent events occur.

---

# 16. Ongoing Task Empty State

When no task is active:

```text
ONGOING TASK

Nothing running

Perlica is ready when you are.
```

Do not hide the right sidebar completely.

The persistent location gives the user a stable mental model.

---

# 17. Task Progress

Tasks should have explicit states:

```text
created
running
waiting
verifying
completed
failed
cancelled
```

The frontend should render these states visually.

Do not infer task state by parsing arbitrary text from an agent response.

---

# 18. Task Data Model

The frontend should use a structured task contract.

Example:

```ts
type TaskStatus =
  | "created"
  | "running"
  | "waiting"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

type Task = {
  id: string;
  sessionId: string;
  title: string;
  status: TaskStatus;
  currentStep?: string;
  progress?: number;
  startedAt?: string;
  updatedAt: string;
};
```

The actual contract belongs in the shared contracts package rather than being independently defined in multiple UI files.

---

# 19. Right Sidebar Task Details

The task panel may show:

```text
Task title
Status
Current step
Progress
Elapsed time
Relevant tool activity
Verification state
```

Do not dump the complete execution trace into the sidebar.

Detailed traces belong in an expandable task/activity view.

---

# 20. Completed Tasks

When a task completes, the right sidebar should show:

```text
TASK COMPLETE

✓ Find something you'll enjoy

Completed just now
```

Optionally show:

```text
Verification passed
```

The sidebar should then remain available for inspection until another task becomes active.

---

# 21. Failed Tasks

Failures must be visually distinct without becoming visually aggressive.

Example:

```text
TASK FAILED

Unable to complete the request.

Reason:
Music service unavailable.

[Retry]
```

The frontend should show actionable information.

Do not display raw stack traces to the normal user interface.

---

# 22. Approval Tasks

When an action requires user approval:

```text
TASK WAITING

Perlica needs your approval

Send this message to Alice?

[Cancel] [Approve]
```

The right sidebar should indicate:

```text
WAITING FOR YOU
```

The approval UI should clearly communicate the action and consequence.

---

# 23. Global Visual Direction

The visual identity should be **Perlica-themed**, not generic "AI SaaS".

Target aesthetic:

```text
calm
personal
premium
minimal
slightly futuristic
soft
clean
intelligent
```

Avoid:

```text
generic purple AI gradient
excessive glassmorphism
neon cyberpunk
overly rounded consumer-app aesthetic
dashboard clutter
large marketing-style illustrations
```

---

# 24. Color System

The initial color system should be defined centrally.

Do not hard-code arbitrary colors inside components.

Use semantic tokens such as:

```text
background
surface
surface-secondary
border
text-primary
text-secondary
text-muted
accent
accent-soft
success
warning
error
```

Perlica's visual identity should come from these tokens rather than scattered hex values.

The exact palette should be defined in the global theme file.

---

# 25. Typography

Typography should prioritize:

* readability,
* calm hierarchy,
* strong title treatment,
* understated metadata.

Use a clear scale:

```text
Display
Heading
Subheading
Body
Caption
Label
```

Do not manually specify font sizes independently in dozens of components.

Use centralized typography tokens/classes.

---

# 26. Borders and Surfaces

Prefer:

* subtle borders,
* restrained shadows,
* layered surfaces,
* consistent radii.

Avoid excessive cards.

Not everything needs to be inside a bordered rectangle.

The central conversation area should feel more open than the sidebars.

---

# 27. Spacing

Use a consistent spacing scale.

Do not randomly use:

```text
13px
17px
21px
29px
```

without reason.

Use the project's spacing system.

Spacing should visually separate:

```text
navigation
content
interaction
metadata
task state
```

---

# 28. Icons

Use one consistent icon library.

Do not mix unrelated icon sets.

Icons must support the interface rather than become decoration.

Every icon-only interactive control must have an accessible label.

---

# 29. Animation

Animation should communicate state.

Appropriate examples:

```text
task started
task progress
message appearing
sidebar transition
status change
```

Avoid:

* excessive bouncing,
* constant motion,
* decorative animations,
* animations that delay interaction.

Motion should be fast and subtle.

---

# 30. Responsive Behavior

The primary target is desktop.

The layout should support:

```text
wide desktop
standard laptop
smaller desktop
```

At smaller widths:

```text
Right task sidebar → collapsible panel
Left session sidebar → collapsible/navigation drawer
```

Do not allow the three-column layout to become unusably compressed.

Mobile is not the initial target.

---

# 31. Desktop Window Behavior

The application should behave like a desktop productivity application.

The interface should preserve:

* persistent session navigation,
* persistent task visibility,
* consistent header,
* stable input area.

Avoid excessive modal usage.

---

# 32. Frontend Technology

Use:

```text
Tauri
React
TypeScript
Tailwind CSS
shadcn/ui
```

Optional client state management:

```text
Zustand
```

Use Zustand only for state that genuinely benefits from client-side shared state.

Do not automatically put every component's state into a global store.

---

# 33. Application Structure

Recommended frontend structure:

```text
apps/
└── desktop/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── state/
    │   ├── hooks/
    │   ├── lib/
    │   └── styles/
    │
    └── src-tauri/
```

---

# 34. Feature Structure

Organize frontend code around responsibilities/features.

Example:

```text
src/
├── features/
│   ├── home/
│   ├── sessions/
│   ├── conversation/
│   ├── tasks/
│   ├── activity/
│   └── settings/
│
├── components/
│   ├── ui/
│   └── layout/
│
├── state/
├── hooks/
├── lib/
└── styles/
```

Feature modules should own their feature-specific UI logic.

---

# 35. Component Responsibilities

Example:

```text
AppShell
SessionSidebar
MainWorkspace
TaskSidebar

HomeView
Greeting
SuggestionList
SuggestionCard
TalkToPerlica

ConversationView
ConversationMessage
AgentActivity
ResultCard

TaskPanel
TaskHeader
TaskProgress
TaskEventList
TaskStatus
```

Each component must have a clear responsibility.

Do not create a single:

```text
PerlicaDashboard.tsx
```

containing the entire application.

---

# 36. Component Size Rule

A component should remain easy to understand.

When a component begins handling:

```text
layout
API calls
state management
business logic
formatting
animation
task management
```

split those responsibilities.

Presentation components should remain primarily presentational.

---

# 37. No Duplicate Components

Before creating a new component, search for existing components serving an equivalent purpose.

Do not create:

```text
TaskCard
CurrentTaskCard
OngoingTaskCard
ActiveTaskCard
```

when these are effectively the same component.

Prefer:

```text
TaskCard
```

with variants or props where appropriate.

---

# 38. No Duplicate Hooks

Before creating hooks, search for equivalent behavior.

Forbidden:

```text
useSessions()
useUserSessions()
useSessionList()
```

when they all retrieve the same data.

Create one canonical hook.

---

# 39. No Duplicate State

There must be one canonical source of truth for important domain state.

For example, do not keep:

```text
activeTask
```

simultaneously in:

```text
TaskSidebar local state
Conversation local state
global Zustand state
```

unless the values intentionally represent different concepts.

Prefer:

```text
Task State
    ↓
Task Sidebar
Conversation
Activity
```

all consuming the same state.

---

# 40. UI State vs Domain State

UI state:

```text
isSidebarOpen
selectedTab
inputDraft
isExpanded
```

Domain state:

```text
session
task
task.status
agent.status
message
tool event
verification result
```

Keep these conceptually separate.

---

# 41. Shared Contracts

Frontend data structures that represent domain concepts must come from:

```text
packages/contracts
```

Examples:

```text
Task
TaskStatus
AgentEvent
ToolCall
ToolResult
VerificationResult
Session
Message
MemoryRecord
```

Do not redefine the same domain type inside multiple frontend files.

---

# 42. Mock Backend Requirement

Until the real agent backend exists, use a mock implementation.

Example:

```text
MockAgentClient
    ↓
MockAgentEventStream
    ↓
React UI
```

The UI must consume the same interfaces that the future real agent client will implement.

Example:

```ts
interface AgentClient {
  createSession(): Promise<Session>;
  sendMessage(input: SendMessageInput): Promise<Task>;
  subscribeToTask(taskId: string): AgentEventStream;
}
```

The initial frontend uses:

```text
MockAgentClient
```

Later:

```text
RealAgentClient
```

The UI should not know which one is being used.

---

# 43. Mock Event System

Mock events should simulate a realistic task.

Example:

```text
task.created

agent.status_changed → running

context.started
context.completed

tool.started
tool.completed

verification.started
verification.completed

task.completed
```

The UI should update from events rather than manually changing five unrelated state variables.

---

# 44. Event-Driven Frontend Rule

The frontend should be built around structured events.

Do not make the UI infer:

```text
"Perlica is working"
```

from:

```text
responseText !== ""
```

Instead use:

```text
AgentStatus
TaskStatus
AgentEvent
```

as the authoritative state.

---

# 45. Mocking Rules

Mocks are permitted during frontend development.

Mocks must:

* follow real interfaces,
* use realistic timing,
* produce structured data,
* simulate success and failure,
* be replaceable without UI changes.

Do not build fake business logic inside visual components.

---

# 46. Loading States

Every asynchronous UI state must have a designed state.

At minimum:

```text
idle
loading
success
empty
error
```

For agent operations:

```text
created
running
waiting
verifying
completed
failed
```

Avoid generic spinners everywhere.

Use contextual status where possible.

---

# 47. Empty States

Empty states should feel intentional.

Example:

```text
No sessions yet.

Start a conversation with Perlica.
```

Not:

```text
No data.
```

Empty states should guide the user toward the next action.

---

# 48. Error States

Error messages should be concise and actionable.

Good:

```text
Perlica couldn't connect to the agent service.

[Retry]
```

Bad:

```text
Error: AxiosError ECONNREFUSED 127.0.0.1:3000
```

Developer details belong in logs/debug tools.

---

# 49. Accessibility

The frontend must support:

* keyboard navigation,
* visible focus state,
* semantic HTML,
* accessible labels,
* sufficient text contrast,
* screen-reader-compatible controls where applicable.

Icon-only buttons require accessible labels.

---

# 50. Keyboard Interaction

At minimum:

```text
Enter → send message
Shift + Enter → new line
Esc → close transient panel/modal
```

The exact shortcuts can evolve.

The UI should not require a mouse for basic interaction.

---

# 51. State Persistence

During the mocked phase, persistence may use local storage or a lightweight client store.

However, the persistence abstraction must remain replaceable.

Do not scatter:

```ts
localStorage.setItem(...)
```

throughout the UI.

Create one appropriate persistence boundary.

---

# 52. No Direct External API Calls

Frontend components must not directly call:

* Spotify APIs,
* anime APIs,
* GitHub APIs,
* model APIs,
* arbitrary web services.

The frontend communicates with the application/agent boundary.

Preferred:

```text
Component
 ↓
Frontend Client
 ↓
Application / Agent API
```

Not:

```text
Component
 ↓
Spotify
```

---

# 53. No Agent Logic in Components

Do not write:

```ts
if (userAskedForMusic) {
  ...
}
```

inside React components.

The UI displays state and sends user intent.

Agent reasoning belongs to the backend/harness.

---

# 54. No Business Logic in Styling Files

Styling files must not contain:

* task decisions,
* business rules,
* API communication,
* state transitions.

Keep visual logic and application logic separate.

---

# 55. Frontend Function Ownership

Every frontend function must have one canonical owner.

Examples:

```text
sendMessage()
```

must not exist independently in:

```text
ChatInput
ConversationView
HomeView
TaskPanel
```

Instead:

```text
AgentClient.sendMessage()
```

should be the canonical application operation.

UI components call it through the appropriate client/hook.

---

# 56. Frontend Hook Ownership

Hooks should represent a coherent reusable behavior.

Good:

```text
useSessions()
useCurrentTask()
useAgentEvents()
useAgentClient()
```

Bad:

```text
usePerlicaStuff()
useAgentHelper()
useDashboardLogic()
```

Generic hooks become dumping grounds.

---

# 57. Frontend Service Ownership

Services should represent application/domain operations.

Examples:

```text
SessionService
AgentClient
TaskService
```

Do not create:

```text
FrontendService
PerlicaService
AppManager
UIService
```

without a precise responsibility.

---

# 58. Styling Architecture

Centralize:

```text
colors
spacing
typography
radii
shadows
transitions
breakpoints
```

Use design tokens.

Components should consume tokens rather than inventing their own visual language.

---

# 59. Perlica Theme Requirement

The Perlica identity must remain consistent across:

```text
home
conversation
sessions
tasks
settings
empty states
loading states
error states
```

Do not allow each feature to establish its own styling system.

---

# 60. Visual Hierarchy

The interface should communicate this priority:

```text
1. Talk to Perlica
2. Current conversation/result
3. Current ongoing task
4. Sessions
5. Secondary information
```

Do not let sidebars overpower the central interaction.

---

# 61. Home Screen Hierarchy

The initial screen should visually follow:

```text
Hi, {name}
        ↓
How should Perlica help you today?
        ↓
Suggested actions
        ↓
Talk to Perlica
```

The greeting should be immediately visible.

The input should remain easy to find.

Do not make the user search for how to start.

---

# 62. Personalization Visibility

The UI should imply that Perlica knows the user without becoming intrusive.

Appropriate:

```text
Hi, Daniel

Based on what you've been working on...
```

or:

```text
Continue where you left off
```

when there is genuine context.

Avoid displaying invasive behavioral analytics on the main page.

---

# 63. Activity Transparency

The user should be able to understand important actions Perlica is taking.

For example:

```text
Perlica
│
├── Retrieving relevant context
├── Searching
├── Running action
└── Verifying
```

This provides trust without exposing private reasoning.

---

# 64. Task Sidebar Persistence

The right sidebar should remain stable while the current task changes.

Do not rebuild the entire layout every time the task state changes.

Only the relevant task content should update.

---

# 65. Session Switching

When switching sessions:

```text
selected session
        ↓
load session state
        ↓
update center conversation
        ↓
update corresponding task context
```

Do not mix messages or tasks from unrelated sessions.

---

# 66. Session Isolation

A task must belong to a session.

Conceptually:

```text
Session A
├── Messages
├── Task A
└── Activity A

Session B
├── Messages
├── Task B
└── Activity B
```

Switching sessions must not leak task/activity state across sessions.

---

# 67. Current Task vs Historical Activity

Right sidebar:

```text
CURRENT / ONGOING
```

Left sidebar:

```text
SESSION HISTORY
```

Activity history:

```text
WHAT HAPPENED
```

These concepts must not be mixed together.

---

# 68. Future Integration Compatibility

The frontend must eventually support capabilities without redesign.

Examples:

```text
coding
research
calendar
music
anime
browser
files
```

The interface should represent them as agent actions/results rather than building a completely separate UI for every capability.

Specialized result components are allowed when they genuinely improve usability.

---

# 69. Capability Result Pattern

A capability result should generally have:

```text
result type
title
summary
actions
metadata
verification state
```

Example:

```text
Result
────────────────
Found 3 relevant items.

[Open] [Save]
```

The result renderer may specialize based on result type.

---

# 70. Desktop Shell Boundary

Tauri is responsible for desktop-specific capabilities.

React is responsible for UI.

The frontend must communicate with Tauri through a controlled bridge.

Do not expose unrestricted native functionality to arbitrary React components.

---

# 71. Native Capability Rule

Future native operations should be exposed through specific commands.

Prefer:

```text
getActiveWindow()
readApprovedFile()
showNotification()
```

over:

```text
executeAnything()
```

The frontend should not receive unrestricted operating-system access.

---

# 72. Performance

Avoid unnecessary global re-renders.

Particularly:

* session updates should not rerender unrelated components,
* task events should update task UI rather than the entire app,
* conversation state should remain localized where possible.

Do not optimize prematurely.

Measure before introducing complexity.

---

# 73. No Premature Component Abstraction

Do not create a component framework for hypothetical future needs.

Create abstractions when:

* functionality is reused,
* a visual pattern is genuinely shared,
* the responsibility is stable.

Avoid abstractions such as:

```text
UniversalCard
UniversalPanel
UniversalAgentThing
GenericContainer
BasePerlicaComponent
```

unless they have a concrete purpose.

---

# 74. File Responsibility Rule

Every frontend file must have one clear primary responsibility.

Bad:

```text
PerlicaDashboard.tsx
```

containing:

* session logic,
* task state,
* API calls,
* recommendation generation,
* styling,
* persistence.

Good:

```text
SessionSidebar.tsx
TaskSidebar.tsx
HomeView.tsx
TalkToPerlica.tsx
useSessions.ts
useCurrentTask.ts
agent-client.ts
```

Each owns a defined responsibility.

---

# 75. Duplicate Function Prevention

Before creating a function:

```text
1. Search exact name.
2. Search similar names.
3. Search equivalent behavior.
4. Identify the current owner.
5. Reuse if appropriate.
```

Do not create function aliases merely because a component needs a different name.

---

# 76. Duplicate Component Prevention

Before creating a component:

```text
1. Search existing components.
2. Check whether a prop/variant solves the requirement.
3. Check whether the component belongs to an existing feature.
4. Create a new component only when responsibility is genuinely distinct.
```

---

# 77. Duplicate API/Client Prevention

Only one canonical frontend client should perform a given application operation.

For example:

```text
AgentClient.sendMessage()
```

not:

```text
HomeApi.sendMessage()
ChatApi.sendMessage()
TaskApi.sendMessage()
```

if they all perform the same operation.

---

# 78. Frontend Testing

Every feature should have appropriate tests.

Minimum:

```text
component tests
state tests
client tests
interaction tests
```

Critical flows:

```text
open application
create session
send message
receive agent activity
task updates
task completes
switch session
handle failure
```

---

# 79. Visual Testing

Important UI states should be visually testable.

At minimum:

```text
home
active session
running task
waiting for approval
completed task
failed task
empty sessions
empty task
long session names
long messages
narrow desktop width
```

---

# 80. Mock Scenarios

The mock agent should support predefined scenarios.

Examples:

```text
success
slow task
tool failure
verification failure
approval required
task cancellation
multiple steps
```

This allows the UI to be designed against realistic agent behavior.

---

# 81. First Frontend Milestone

The first milestone is complete when the following workflow works entirely with mocked data:

```text
OPEN APP
    ↓
Hi, {name}
    ↓
How should Perlica help you today?
    ↓
Suggested actions
    ↓
Talk to Perlica
    ↓
Create/select session
    ↓
Send request
    ↓
Agent activity appears
    ↓
Ongoing task appears in right sidebar
    ↓
Mock task progresses
    ↓
Task completes
    ↓
Result appears
    ↓
Task state becomes completed
    ↓
Session remains in left sidebar
```

No real AI model is necessary for this milestone.

---

# 82. Definition of Done

The frontend is not considered complete merely because it visually resembles the design.

The frontend must satisfy:

```text
[ ] Perlica identity is visually consistent
[ ] Greeting contains user name
[ ] Main prompt is "How should Perlica help you today?"
[ ] Suggestions are data-driven
[ ] Talk to Perlica input works
[ ] Sessions exist in left sidebar
[ ] Active session is visually clear
[ ] Ongoing task exists in right sidebar
[ ] Task states are represented
[ ] Agent activity is represented
[ ] Mock agent events update the UI
[ ] Session switching works
[ ] Loading/empty/error states exist
[ ] Components have clear responsibilities
[ ] No duplicate components
[ ] No duplicate hooks
[ ] No duplicate application operations
[ ] No external API calls from components
[ ] No agent/business logic in UI components
[ ] Shared domain types use shared contracts
[ ] Desktop-native access is isolated
[ ] Relevant tests exist
[ ] No unrelated functionality was added
```

---

# 83. Engineering Rules

The following rules are mandatory:

```text
1. Desktop-first.
2. React + TypeScript.
3. Tauri is the desktop shell.
4. UI is separate from agent logic.
5. UI is separate from external integrations.
6. UI consumes structured state/events.
7. Mock implementations must use real contracts.
8. One responsibility per component/file.
9. One canonical implementation per operation.
10. Search before creating.
11. Reuse before duplicating.
12. Do not create duplicate functions under different names.
13. Do not create duplicate hooks for the same behavior.
14. Do not create duplicate components for the same purpose.
15. Do not duplicate domain state across unrelated stores.
16. Do not call external APIs directly from UI components.
17. Do not implement agent reasoning in the frontend.
18. Do not create generic dumping-ground utilities.
19. Do not create premature abstractions.
20. Keep the frontend replaceable independently from the harness.
```

---

# 84. First Screen Specification

The initial screen must contain the following hierarchy:

```text
┌──────────────────────────────────────────────────────────────────────┐
│                              PERLICA                                 │
├───────────────┬──────────────────────────────────────┬───────────────┤
│ Sessions      │                                      │ Ongoing Task  │
│               │                                      │               │
│ + New Session │           Hi, {name}                 │ Nothing       │
│               │                                      │ running       │
│ Recent        │   How should Perlica help you today? │               │
│               │                                      │               │
│ Session 1     │   ┌─────────┐ ┌─────────┐            │ Perlica is    │
│ Session 2     │   │Suggest  │ │Suggest  │            │ ready when    │
│ Session 3     │   │   A     │ │   B     │            │ you are.      │
│               │   └─────────┘ └─────────┘            │               │
│               │                                      │               │
│               │   ┌──────────────────────────────┐   │               │
│               │   │ Talk to Perlica...       🎙 ↑│   │               │
│               │   └──────────────────────────────┘   │               │
│               │                                      │               │
└───────────────┴──────────────────────────────────────┴───────────────┘
```

This is the baseline composition.

The visual implementation should refine the aesthetics without changing the core information hierarchy without an explicit product decision.

---

# 85. Final Principle

The frontend should make Perlica feel like:

> **A personal agent that is present, aware, and ready to act.**

Not:

> **A ChatGPT clone with a different color palette.**

The interface should communicate three things immediately:

```text
Perlica knows who I am.
Perlica can do things.
I can see what Perlica is doing.
```

The actual intelligence, tools, memory, verification, and behavioral learning will be implemented later by the harness.

The frontend must therefore be built as a **clean client of those future systems**, not as a substitute for them.
