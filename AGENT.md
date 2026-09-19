# Personal Agent Harness — `agent.md`

## 0. Purpose

This document is the authoritative product and engineering specification for the project.

The project is a **desktop-first personalized AI agent harness**.

The core product is not a music player, anime recommender, chatbot, coding assistant, or browser automation tool.

The core product is the **agent runtime and infrastructure that allows an LLM to operate as a personalized agent on behalf of the user through controlled capabilities**.

The system must provide:

* Natural-language interaction
* Agent reasoning and execution
* Task orchestration
* Context management
* Tool execution
* Task state
* Long-term memory
* Behavioral evidence
* Preference inference
* Permissions and policies
* Verification
* Telemetry
* Evaluation
* Controlled access to the user's desktop and external services

Future capabilities such as music playback, anime recommendations, coding assistance, browser automation, productivity, and other integrations must be implemented on top of the harness rather than becoming part of the harness itself.

---

# 1. Product Definition

## 1.1 Core Product

The product is a personal agent that can:

```text
Understand
    ↓
Decide
    ↓
Act
    ↓
Observe
    ↓
Verify
    ↓
Learn
    ↓
Act better later
```

The agent should eventually be capable of handling requests such as:

```text
"Find something I would enjoy."

"Organize these files."

"Fix this issue in my project."

"Research this topic."

"Remind me about this later."

"Play something I'd like."
```

These are examples of capabilities, not the definition of the product.

---

# 2. Core Product Goal

The goal is to create a **reliable personalized agent environment** in which:

* the model is replaceable,
* capabilities are modular,
* actions are controlled,
* meaningful outcomes are verified,
* user behavior can become evidence,
* preferences can evolve,
* and the entire system remains maintainable as capabilities grow.

The product must not rely on the assumption that a more capable LLM automatically produces a reliable agent.

Reliability must come from the combination of:

```text
Model
+
Harness
+
Tools
+
State
+
Memory
+
Policy
+
Verification
+
Evaluation
```

---

# 3. Product Philosophy

## 3.1 The model is a replaceable reasoning component

The harness must not be architecturally tied to one LLM provider.

The system must support a provider-neutral model interface.

Conceptually:

```text
Model Adapter
├── Provider A
├── Provider B
├── Provider C
└── Local Model
```

Changing the LLM must not require rewriting:

* memory,
* tools,
* policy,
* verification,
* telemetry,
* UI,
* or domain services.

---

## 3.2 The harness owns control

The LLM may propose actions.

The harness controls:

* available tools,
* argument validation,
* permissions,
* execution,
* state,
* retries,
* timeouts,
* verification,
* telemetry,
* task lifecycle.

The model must never bypass the harness.

---

## 3.3 Evidence over assumption

The system must distinguish:

```text
Observation
    ↓
Evidence
    ↓
Inference
    ↓
Preference
```

Observed behavior must not automatically be stored as a permanent preference.

---

## 3.4 Verification over self-assertion

The agent must not declare an action successful solely because:

* it generated a response,
* it requested a tool,
* a tool accepted the request,
* or the model believes the task is complete.

Whenever practical, meaningful actions must be independently verified.

---

## 3.5 Current user intent takes precedence

Long-term memory and inferred preferences are contextual information.

They must not override explicit current user instructions.

---

## 3.6 User agency

The agent assists rather than silently taking consequential decisions away from the user.

Actions with meaningful external consequences must have appropriate approval requirements.

---

# 4. Primary Scope

V1 focuses on the **harness itself**.

Core V1 scope:

```text
1. Desktop interface
2. Agent runtime
3. Agent loop
4. Task orchestration
5. Model adapter
6. Context management
7. Tool framework
8. Tool registry
9. Task state
10. Policy and permissions
11. Verification
12. Structured telemetry
13. Memory foundation
14. Evidence foundation
15. Evaluation framework
16. Desktop capability boundary
```

The first milestone must prove the harness architecture using a small controlled capability.

---

# 5. Secondary / Future Capabilities

The following are deliberately **not core V1 product functionality**:

```text
Music control
Anime recommendation
Anime streaming
YouTube control
Spotify control
Browser automation
Calendar
Email
Discord
Smart home
Coding agent
File organization
Research automation
Shopping
Other external applications
```

These are future capabilities implemented as independent tools and integrations.

The core harness must function correctly even when all of these integrations are absent.

---

# 6. Desktop-First Product Boundary

The product should be distributed as a desktop application.

The desktop application is the **user-facing shell and local capability boundary**.

The desktop layer may provide controlled access to:

* local filesystem,
* applications,
* processes,
* notifications,
* local browser interaction,
* system information,
* local media,
* device state,
* global shortcuts,
* other explicitly authorized operating-system capabilities.

The desktop shell must not contain the core business logic of the agent.

---

# 7. Desktop Technology

The initial desktop stack should be:

```text
Tauri
+
React
+
TypeScript
```

The frontend remains a conventional web UI rendered inside the desktop shell.

Native functionality must be exposed through a controlled capability boundary.

The desktop layer must not become a dumping ground for agent logic.

Conceptually:

```text
Desktop Shell
├── React UI
├── Desktop capability bridge
└── Native capability boundary

        ↓

Agent Harness
```

---

# 8. Core Architectural Principle

The system must maintain a strict distinction between:

```text
Desktop Shell
Agent Harness
Capabilities
External Integrations
```

The dependency direction should resemble:

```text
                Desktop UI
                    ↓
              Application API
                    ↓
             Agent Harness
                    ↓
              Tool System
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
  Local Capabilities      External Integrations
```

The harness must not depend on any specific capability.

---

# 9. High-Level Architecture

```text
┌──────────────────────────────────────────┐
│              Desktop Application         │
│                                          │
│  React + TypeScript + Tauri              │
│                                          │
│  UI / Activity / Task / Memory / Settings│
└───────────────────┬──────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│           Application Boundary           │
└───────────────────┬──────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│             Agent Harness                │
│                                          │
│  Runtime                                 │
│  Orchestrator                            │
│  Context                                 │
│  State                                   │
│  Model Adapter                            │
│  Tool Registry                            │
│  Policy                                  │
│  Verification                            │
└───────────────────┬──────────────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
       Domain Services     Tools
           │                 │
       ┌───┼────┐       ┌────┼────────┐
       ▼   ▼    ▼       ▼    ▼        ▼
    Memory Evidence Preferences Local External
                                Capability Integration
```

---

# 10. Core Components

## 10.1 Desktop UI

Responsible for:

* user interaction,
* task display,
* current agent activity,
* results,
* approvals,
* memory visibility,
* settings,
* connection management.

The UI must not directly implement:

* agent reasoning,
* business logic,
* memory inference,
* tool execution,
* external API calls,
* policy enforcement.

---

## 10.2 Application Layer

Responsible for:

* translating UI requests into application operations,
* validating application-level input,
* invoking domain services,
* returning structured results/events.

The application layer must not become a second agent orchestrator.

---

## 10.3 Agent Runtime

Responsible for:

* invoking the model,
* providing current context,
* handling model decisions,
* requesting tool actions,
* receiving observations,
* continuing the loop.

The runtime must be independent of any specific external capability.

---

## 10.4 Orchestrator

Owns the lifecycle of a task.

Responsibilities:

* task creation,
* state transitions,
* iteration control,
* retries,
* timeouts,
* cancellation,
* approval pauses,
* replanning,
* termination.

The orchestrator coordinates other components.

It must not contain domain-specific logic such as:

```text
if anime:
    use provider X
```

or:

```text
if Spotify:
    ...
```

---

## 10.5 Model Adapter

Provides a stable interface to an LLM.

The rest of the application must depend on the adapter contract rather than a provider SDK.

Provider-specific code belongs under:

```text
model/providers/
```

---

## 10.6 Tool System

The tool system exposes controlled capabilities to the agent.

Tools must be:

* narrow,
* typed,
* validated,
* permission-aware,
* observable,
* testable,
* independently replaceable.

Examples:

```text
filesystem.read
filesystem.write

web.search

memory.search

music.play
```

Music is an example of a future tool, not a core dependency.

---

# 11. Tool Registry

The registry owns tool discovery and metadata.

It should manage:

```text
tool identity
tool schema
tool description
tool permissions
tool availability
tool handler
verification metadata
```

The registry must not become a giant implementation class.

---

# 12. Tool Execution Pipeline

Every agent tool request must pass through:

```text
Model
 ↓
Tool Registry
 ↓
Schema Validation
 ↓
Policy Check
 ↓
Tool Execution
 ↓
Result Normalization
 ↓
Telemetry
 ↓
Observation
 ↓
Agent
```

The model must never directly call an external API.

---

# 13. Tool Design Rules

A tool must perform one coherent capability.

Good:

```text
filesystem.read
filesystem.write
web.search
web.open
```

Bad:

```text
doAnything
executeAction
generalTool
performTask
agentHelper
```

Catch-all tools are prohibited because they prevent proper:

* validation,
* authorization,
* logging,
* testing,
* verification,
* evaluation.

---

# 14. Context Management

Context management determines what the model needs to know for the current task.

Possible context sources:

```text
current request
task state
recent conversation
relevant memory
relevant preferences
tool results
system constraints
available capabilities
```

Context must be:

* relevant,
* bounded,
* traceable,
* reproducible where practical.

Do not send the entire memory store or conversation history by default.

---

# 15. Context Retrieval vs Context Construction

These are separate responsibilities.

```text
Memory Retrieval
        ↓
Preference Retrieval
        ↓
Task State Retrieval
        ↓
Context Assembly
        ↓
Model Request
```

Do not place all context logic inside one giant prompt-building function.

---

# 16. Task State

Task state describes what is happening **right now**.

Example:

```text
taskId
goal
status
currentStep
selectedEntities
toolResults
retryCount
approvalState
verificationState
```

Task state must not become permanent memory.

---

# 17. Memory

Memory represents durable information that may remain useful across future tasks.

Examples:

```text
stable preferences
persistent user context
approved memories
historical decisions
```

Memory records must support appropriate metadata such as:

```text
source
timestamp
confidence
provenance
freshness
```

Memory must remain distinct from raw interaction history.

---

# 18. Evidence

Evidence records observable events or facts.

Examples:

```text
user explicitly stated preference
user selected item
user completed media
user skipped item
user corrected agent
task succeeded
task failed
```

Evidence should retain:

```text
source
timestamp
context
event type
```

Evidence must not be silently rewritten simply because its interpretation changes.

---

# 19. Preference Inference

Preference inference converts evidence into inferred user preferences.

Pipeline:

```text
Evidence
 ↓
Signal Extraction
 ↓
Aggregation
 ↓
Inference
 ↓
Confidence
 ↓
Preference
```

Preference inference must not directly operate external tools.

It produces information for the agent.

---

# 20. Behavioral Learning

Behavioral learning may eventually use signals such as:

```text
selection
completion
abandonment
skipping
repetition
rewatching
re-engagement
explicit feedback
recency
frequency
context
```

The system must distinguish:

```text
user behavior
```

from:

```text
interpretation of user behavior
```

A single weak observation must not permanently define a preference.

---

# 21. Telemetry

Telemetry records what the system actually did.

Examples:

```text
task.started
task.completed
task.failed

tool.started
tool.completed

verification.started
verification.completed

approval.requested

user.corrected_agent
```

Telemetry must be structured.

Telemetry must not become an uncontrolled collection of unrelated personal activity.

Only data necessary for product behavior, debugging, evaluation, and explicitly supported personalization should be collected.

---

# 22. Telemetry vs Evidence

These are distinct.

### Telemetry

What did the system do?

```text
music.play executed
```

### Evidence

What observable fact can support a conclusion?

```text
track played for 237 seconds
```

Not every telemetry event should become preference evidence.

---

# 23. Verification

Verification answers:

> Did the action or task actually produce the expected outcome?

Every meaningful action should define, where practical:

```text
Expected State
Observed State
Verification Rule
Verification Result
```

Example:

```text
Expected:
requested file created

Observed:
file exists at expected location

Result:
PASS
```

Verification logic belongs in the verification subsystem, not in UI components or arbitrary tool handlers.

---

# 24. Policy

Policy determines whether an action is:

```text
ALLOW
ASK
BLOCK
```

Examples:

```text
memory.search → ALLOW
web.search → ALLOW
filesystem.write → ALLOW within approved workspace
filesystem.delete → ASK
purchase → ASK
credential extraction → BLOCK
```

Policy must be enforced independently from model instructions.

---

# 25. Desktop Capability Security

Local desktop capabilities must be explicitly scoped.

The agent should not receive unrestricted system access merely because the application is a desktop application.

Examples:

```text
filesystem.read
    allowed paths only

filesystem.write
    approved workspace only

process.execute
    restricted commands / sandbox where appropriate

notifications
    approved application scope
```

The desktop shell acts as an additional permission boundary, not as an unrestricted bridge to the operating system.

---

# 26. Secrets and Credentials

Secrets must not normally enter model context.

Preferred architecture:

```text
Agent
 ↓
Tool
 ↓
Integration
 ↓
Credential Provider
 ↓
External Service
```

The model should know that a capability exists without receiving the credential used to access it.

---

# 27. External Integrations

External providers must live behind integration boundaries.

Example:

```text
integrations/
├── music/
├── browser/
├── github/
└── ...
```

An integration may know:

* provider API formats,
* authentication,
* provider-specific errors,
* provider-specific limitations.

It must not own:

* agent reasoning,
* user preference inference,
* task orchestration,
* UI state,
* global policy.

---

# 28. Future Music/Anime Architecture

When music or anime functionality is eventually implemented, the relationship must be:

```text
Core Harness
      ↓
Tool System
      ↓
Capability
      ↓
External Integration
```

Example:

```text
Agent
 ↓
music.play
 ↓
PlaybackService
 ↓
MusicProviderIntegration
```

The core harness must remain fully functional without this capability.

---

# 29. Folder Structure

Use a monorepo structure with clear application and package boundaries.

```text
/
├── apps/
│   ├── desktop/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── state/
│   │   │   └── lib/
│   │   └── src-tauri/
│   │
│   └── agent/
│       └── src/
│
├── packages/
│   ├── contracts/
│   ├── harness/
│   ├── model/
│   ├── tools/
│   ├── policy/
│   ├── verification/
│   ├── memory/
│   ├── evidence/
│   ├── preferences/
│   ├── telemetry/
│   ├── evaluation/
│   └── shared/
│
├── integrations/
│   └── [future providers]
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── evaluation/
│
└── docs/
```

The exact directory layout may evolve.

The responsibility boundaries may not be casually ignored.

---

# 30. Package Responsibilities

## `apps/desktop`

Desktop shell and user interface.

Owns:

* React components,
* UI state,
* Tauri integration,
* presentation.

Does not own agent business logic.

---

## `apps/agent`

Application entry point for the agent process/runtime.

Owns:

* application startup,
* dependency wiring,
* service composition,
* API/event transport.

Does not own every domain implementation.

---

## `packages/contracts`

Shared interfaces, DTOs, schemas, and event contracts.

Examples:

```text
AgentEvent
Task
ToolCall
ToolResult
VerificationResult
MemoryRecord
EvidenceEvent
```

This package must remain dependency-light.

---

## `packages/harness`

Core agent runtime and orchestration.

Owns:

* agent loop,
* orchestration,
* lifecycle,
* execution coordination.

---

## `packages/model`

Provider-neutral model abstractions.

Owns:

* model interfaces,
* request/response normalization,
* provider adapters.

---

## `packages/tools`

Tool abstractions and registrations.

Owns:

* tool contracts,
* tool registry,
* generic tool execution infrastructure.

Individual domain tool implementations should remain separate.

---

## `packages/policy`

Permissions and execution policies.

---

## `packages/verification`

Verification rules and verification services.

---

## `packages/memory`

Memory entities, repositories, retrieval, and memory services.

---

## `packages/evidence`

Observable event/evidence structures and services.

---

## `packages/preferences`

Preference inference and preference services.

---

## `packages/telemetry`

Structured telemetry and trace infrastructure.

---

## `packages/evaluation`

Evaluation datasets, runners, and reporting.

---

## `integrations`

Provider-specific implementations.

Examples:

```text
integrations/
├── spotify/
├── anilist/
├── github/
└── ...
```

Integrations are optional.

---

# 31. Single Responsibility Rule

Every file must have one clear primary responsibility.

A file may contain multiple related functions only when they belong to the same responsibility.

Good:

```text
playback-service.ts
```

containing playback-related operations.

Bad:

```text
agent-utils.ts
```

containing:

```text
playMusic()
saveMemory()
searchWeb()
calculatePreference()
formatCurrency()
buildContext()
```

Unrelated functionality must be separated.

---

# 32. Function Ownership Rule

Every function must have exactly one canonical owner.

Before creating a function:

```text
1. Search the repository.
2. Search for equivalent names.
3. Search for equivalent behavior.
4. Identify the existing owner.
5. Reuse or extend that implementation if appropriate.
```

Do not create duplicate functionality merely because a different name sounds cleaner.

---

# 33. Duplicate Function Rule

These are duplicates if they perform substantially the same operation:

```text
getUserPreferences()
loadUserPreferences()
fetchUserPreferences()
retrieveUserPreferences()
```

Creating a differently named duplicate is still a violation of the architecture.

There must be one canonical operation.

---

# 34. Canonical Operation Rule

Important domain operations must have a single canonical implementation.

Examples:

```text
MemoryService.search()

PreferenceService.getRelevantPreferences()

TaskService.create()

TelemetryService.record()

VerificationService.verify()
```

Other modules must consume these operations instead of recreating their logic.

---

# 35. Before Creating a New Function

The developer or coding agent must ask:

```text
Does this already exist?

Does an equivalent operation already exist?

What module owns this responsibility?

Can the existing implementation be reused?

Will this introduce duplicate logic?
```

If an equivalent function exists, reuse it.

---

# 36. Before Creating a New File

The developer or coding agent must be able to explain:

```text
What responsibility does this file own?

Why does no existing file own it?

Which layer should depend on it?

Does this create overlapping responsibility?
```

A new file must have a justified responsibility.

---

# 37. No God Files

Files named:

```text
utils.ts
helpers.ts
common.ts
manager.ts
services.ts
agent.ts
```

must not become dumping grounds for unrelated functionality.

Generic naming does not justify generic responsibility.

---

# 38. No God Classes

Do not create one class that manages:

```text
model
agent
tools
memory
database
policy
verification
external APIs
UI
```

Responsibilities must remain separated.

---

# 39. Dependency Rules

Preferred:

```text
UI
 ↓
Application
 ↓
Harness / Domain
 ↓
Infrastructure
```

Avoid:

```text
UI → Database
UI → Provider API
Domain → UI
Integration → UI
Memory → Provider-specific service
```

Circular dependencies are prohibited.

---

# 40. Storage Boundary

Persistent storage must be accessed through dedicated repositories/data-access modules.

Preferred:

```text
Domain Service
 ↓
Repository
 ↓
Database
```

Do not scatter direct database access across:

* UI,
* tools,
* integrations,
* agent runtime,
* arbitrary utility modules.

---

# 41. Error Architecture

Errors must be structured and classifiable.

Examples:

```text
INVALID_ARGUMENT
TOOL_NOT_FOUND
PERMISSION_DENIED
AUTH_REQUIRED
NOT_FOUND
TIMEOUT
RATE_LIMITED
SERVICE_UNAVAILABLE
VERIFICATION_FAILED
INTERNAL_ERROR
```

Errors must support:

* recovery,
* logging,
* telemetry,
* user messaging,
* evaluation.

---

# 42. Retry Architecture

Retries must be bounded.

Every retryable operation should define:

```text
max retries
timeout
backoff
retryable error classes
```

Infinite retry loops are prohibited.

---

# 43. Idempotency

Operations that create side effects should support idempotency where possible.

Particularly:

```text
message sending
record creation
external mutations
purchases
other repeatable actions
```

A timeout must not automatically result in duplicate external effects.

---

# 44. State Machine

Task execution must use explicit task states.

Example:

```text
CREATED
   ↓
RUNNING
   ↓
WAITING_FOR_APPROVAL
   ↓
RUNNING
   ↓
VERIFYING
   ↓
COMPLETED
```

Alternative terminal states:

```text
FAILED
CANCELLED
BLOCKED
TIMEOUT
```

Invalid state transitions must be rejected by the orchestrator.

---

# 45. Human Approval

Actions classified as requiring approval must pause the task.

The approval request must explain:

```text
what action will occur
what target it affects
important consequence
```

The task resumes only after a valid authorization response.

---

# 46. Verification and Approval are Different

Approval answers:

```text
"May the agent do this?"
```

Verification answers:

```text
"Did the action actually succeed?"
```

Both may be required.

---

# 47. Evaluation

Evaluation must determine whether the system is actually improving.

Metrics may include:

```text
task success
first-attempt success
recovery success
tool efficiency
latency
cost
human intervention
verification success
memory accuracy
preference adherence
```

Avoid using one undifferentiated "agent score" as the only quality measure.

---

# 48. Baseline Requirement

Before adding major harness features, establish a baseline where practical.

Example:

```text
Model
 ↓
Model + tools
 ↓
Model + tools + state
 ↓
Model + state + memory
 ↓
Model + verification
```

Measure the effect of each layer.

Do not assume a more complicated architecture is automatically better.

---

# 49. Model Evaluation

The harness should allow multiple models to be tested against the same tasks.

Possible providers may include:

```text
Gemini
Claude
GPT
Muse
Other providers
```

The evaluation system should measure performance on real workloads rather than relying exclusively on public benchmarks.

---

# 50. Capability Evaluation

Every future capability should have its own evaluation criteria.

A capability must define:

```text
inputs
outputs
permissions
errors
verification
telemetry
tests
```

Adding a capability must not require changes to unrelated core systems.

---

# 51. Coding-Agent Support

Coding assistance is a future capability, not the definition of the harness.

When eventually implemented, coding should use the same infrastructure:

```text
Agent
 ↓
Tools
 ↓
Filesystem / Shell / Git
 ↓
Observation
 ↓
Verification
 ↓
Task Completion
```

It must not create a separate agent framework inside the project.

---

# 52. Media Support

Music and anime may eventually demonstrate personalized external actions.

They must remain optional capability modules.

Example:

```text
Core Harness
      ↓
Recommendation Tool
      ↓
Preference System
      ↓
Media Integration
```

Removing media integrations must not break:

* orchestration,
* memory,
* state,
* policy,
* verification,
* evaluation.

---

# 53. Behavioral Observation Boundary

The system must only observe activity that has a defined product purpose.

Examples of scoped future telemetry:

```text
media playback events
recommendation interactions
agent task outcomes
tool execution
explicit user feedback
```

The system must not silently collect unrelated personal activity merely because the desktop application technically can access it.

---

# 54. Privacy Boundary

The system must clearly distinguish:

```text
data required to operate the agent
data required for personalization
data collected for evaluation
optional telemetry
```

Each category should have a defined purpose.

Avoid collecting data simply because it is technically available.

---

# 55. Interface Architecture

The UI should provide visibility into the agent without exposing private model reasoning.

Important UI concepts:

```text
Current task
Agent activity
Tool activity
Approval requests
Verification state
Results
Recent activity
Memory
Settings
```

The UI should expose operational events such as:

```text
Retrieving relevant context
Searching
Running tool
Verifying result
Waiting for approval
Completed
```

Do not expose private chain-of-thought.

---

# 56. Event-Driven Interface

The interface should consume structured agent events.

Examples:

```text
task.created
task.updated
agent.status_changed

tool.started
tool.completed

verification.started
verification.completed

memory.updated

approval.requested

task.completed
task.failed
```

The GUI should render these events rather than containing knowledge of internal agent implementation details.

---

# 57. Frontend State Boundary

UI state:

```text
sidebarOpen
selectedTab
inputValue
panelExpanded
```

Domain/task state:

```text
task.status
currentTask
selectedTool
verificationStatus
playbackState
memory
```

Do not put domain state into random UI components simply because it is convenient.

---

# 58. Contracts

Frontend and backend communication must use shared contracts.

Examples:

```text
Task
AgentEvent
ToolCall
ToolResult
VerificationResult
MemoryRecord
EvidenceEvent
```

Contracts should be versionable and validated.

The frontend must not independently invent its own representation of backend data.

---

# 59. Desktop Capability Boundary

Tauri commands or native capabilities should be narrowly scoped.

A capability should expose a specific operation rather than unrestricted access.

Prefer:

```text
filesystem.readApprovedFile()
```

over:

```text
executeAnything()
```

Prefer:

```text
system.getActiveWindow()
```

over:

```text
runArbitraryOSCommand()
```

The narrower the interface, the easier it is to:

* secure,
* test,
* authorize,
* audit,
* replace.

---

# 60. No Hidden Business Logic in Native Layer

The native Tauri layer should not become a second application backend.

Native code should provide controlled operating-system capabilities.

Business decisions remain in the appropriate application/domain layers.

---

# 61. Testing Requirements

Every major component must have tests appropriate to its responsibility.

Required categories:

```text
Unit Tests
Integration Tests
Tool Tests
Verification Tests
Policy Tests
Agent Behavior Tests
Evaluation Tests
```

Do not rely exclusively on end-to-end tests.

---

# 62. Code Change Protocol

Before modifying code:

```text
1. Inspect the repository.
2. Identify the owning module.
3. Search for existing equivalent functionality.
4. Understand the dependency boundary.
5. Determine the smallest correct change.
```

During modification:

```text
6. Modify only relevant files.
7. Preserve module boundaries.
8. Reuse existing operations.
9. Avoid unrelated refactoring.
10. Add or update tests.
```

After modification:

```text
11. Run verification.
12. Inspect the final diff.
13. Search again for duplicate functionality.
14. Confirm no unrelated files changed.
15. Confirm no architectural boundary was bypassed.
```

---

# 63. AI Coding Agent Rules

Any coding agent working on this repository must follow this document.

The agent must search before creating.

The agent must reuse before duplicating.

The agent must preserve module ownership.

The agent must not create multiple implementations of the same operation.

The agent must not add unrelated functions to an existing file merely because the file is convenient.

The agent must not create unnecessary abstraction.

The agent must not bypass the harness's tool/policy/verification boundaries.

The agent must not declare completion without applicable verification.

---

# 64. New Function Checklist

Before adding a function:

```text
[ ] Repository searched
[ ] Equivalent function searched
[ ] Equivalent business logic searched
[ ] Correct owner identified
[ ] Existing implementation cannot be reused
[ ] Responsibility is specific
[ ] Function name is canonical
```

---

# 65. New File Checklist

Before adding a file:

```text
[ ] Single clear responsibility
[ ] Correct architectural layer
[ ] Existing file cannot own the responsibility
[ ] No duplicate implementation
[ ] Dependency direction is valid
[ ] File name clearly communicates responsibility
```

---

# 66. New Dependency Checklist

Before adding a dependency:

```text
[ ] Concrete requirement exists
[ ] Existing dependency cannot solve it
[ ] Maintenance cost is justified
[ ] Security implications considered
[ ] Bundle/runtime impact considered
[ ] Dependency does not violate architecture
```

---

# 67. New Capability Checklist

Before adding a capability:

```text
[ ] Capability is domain-specific
[ ] Tool interface defined
[ ] Permissions defined
[ ] Errors defined
[ ] Verification defined
[ ] Telemetry defined
[ ] Tests defined
[ ] Integration isolated
[ ] Core harness remains domain-agnostic
```

---

# 68. Refactoring Rule

When duplicate functionality is discovered:

```text
1. Find all implementations.
2. Determine the correct owner.
3. Select one canonical implementation.
4. Move/refactor shared logic there.
5. Update all callers.
6. Remove obsolete duplicates.
7. Run tests.
```

Do not knowingly leave competing implementations of the same operation.

---

# 69. Architecture Change Rule

Significant architecture changes must identify:

```text
Problem
Current limitation
Proposed boundary
Affected modules
Dependency impact
Migration impact
Testing impact
```

Do not introduce architectural complexity merely because a pattern appears more sophisticated.

---

# 70. Maintainability Standard

A developer unfamiliar with the project should be able to locate these quickly:

```text
Agent loop
Orchestrator
Model adapter
Tool registry
Policy
Verification
Task state
Memory
Evidence
Preference inference
Telemetry
Desktop capability layer
External integrations
```

If ownership becomes unclear, architecture must be corrected.

---

# 71. Modularity Standard

A major subsystem should be replaceable without rewriting unrelated systems.

Examples:

```text
Gemini → Claude
```

should primarily affect:

```text model/
```

A storage implementation change should primarily affect:

```text memory/repository/
```

Adding Spotify should primarily affect:

```text integrations/
+
music capability
```

Changing the desktop UI should not require modifications to:

```text memory
policy
verification
agent reasoning
preference inference
```

---

# 72. V1 Vertical Slice

The first full system demonstration should prove the harness itself.

A simple capability must demonstrate:

```text
Desktop UI
 ↓
Application Boundary
 ↓
Task Creation
 ↓
Context
 ↓
Model
 ↓
Tool Selection
 ↓
Policy
 ↓
Tool Execution
 ↓
Observation
 ↓
Verification
 ↓
Task Completion
 ↓
Telemetry / Trace
```

The specific capability used for this demonstration is secondary.

---

# 73. Implementation Order

Build in this order:

```text
1. Desktop UI shell
2. Shared contracts
3. Application boundary
4. Task state model
5. Agent loop
6. Model adapter
7. Tool contract
8. Tool registry
9. Policy engine
10. Orchestrator
11. Verification
12. Telemetry
13. Persistent task state
14. Memory foundation
15. Evidence system
16. Preference inference
17. Evaluation
18. External capabilities
```

Do not build numerous external integrations before the core harness works.

---

# 74. First Milestone

The first milestone is complete when the application can:

```text
receive a user request
        ↓
create a task
        ↓
invoke a model
        ↓
request a tool
        ↓
enforce policy
        ↓
execute the tool
        ↓
observe the result
        ↓
verify the outcome
        ↓
update task state
        ↓
show the result in the desktop UI
        ↓
record a trace
```

At this point the harness exists.

Everything beyond this is capability expansion.

---

# 75. Final Engineering Rules

These rules are mandatory:

```text
1. The harness is the core product.
2. The desktop application is the primary user-facing shell.
3. External capabilities are modular additions.
4. The model is replaceable.
5. One responsibility per module.
6. One canonical implementation per operation.
7. Search before creating.
8. Reuse before duplicating.
9. Do not create duplicate functions under different names.
10. Do not mix unrelated functionality in one file.
11. Keep provider-specific logic behind adapters.
12. Keep integrations outside the core harness.
13. Keep UI separate from business logic.
14. Keep storage behind repositories.
15. Keep policy outside the model.
16. Verify meaningful actions independently.
17. Preserve evidence separately from inference.
18. Keep task state separate from long-term memory.
19. Keep telemetry separate from preference inference.
20. Bound retries, costs, timeouts, and execution.
21. Avoid unnecessary abstractions.
22. Avoid god files and god classes.
23. Avoid circular dependencies.
24. Do not silently collect unrelated user activity.
25. Do not declare success without evidence when verification is possible.
26. Add capabilities without modifying unrelated core systems.
27. Prefer maintainability over cleverness.
28. Prefer explicit ownership over convenience.
29. Prefer one source of truth over parallel implementations.
30. Keep the system understandable as it grows.
```

---

# 76. Product Hierarchy

The final product hierarchy is:

```text
                       PERSONAL AGENT
                              │
              ┌───────────────┴────────────────┐
              │                                │
        DESKTOP INTERFACE                 AGENT HARNESS
              │                                │
              │              ┌─────────────────┼─────────────────┐
              │              │                 │                 │
              │            Model             Tools             State
              │              │                 │                 │
              │              │                 │                 │
              │          Context            Policy            Memory
              │                                │                 │
              │                         Verification         Evidence
              │                                                  │
              │                                           Preferences
              │
              └──────────────────────┬───────────────────────────┘
                                     │
                              CAPABILITIES
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                  Local          External         Future
               Capabilities     Integrations     Capabilities
```

The harness must remain useful even if every future capability is removed.

Music and anime are examples of future capabilities that can eventually demonstrate the system's ability to **act in the real world, observe what happens, and learn from the user's behavior**.

They are not the reason the harness exists.

---

# 77. Final Definition

The project can be summarized as:

> **A desktop-first personal AI agent harness that provides an LLM with controlled capabilities, persistent context, memory, verification, behavioral evidence, and a secure execution environment.**

The system should make the model **more useful, more controllable, more observable, and more personalized** without making the model itself the architecture.
