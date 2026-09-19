# Perlica Agent

> A desktop-first personalized AI agent harness.

This repository is organized as an **npm workspaces monorepo** adhering to strict architectural boundaries defined in [`AGENT.md`](./AGENT.md) and [`Frontend.md`](./Frontend.md).

---

## Monorepo Architecture & Responsibilities

```text
/
├── package.json                   # Root orchestrator (repo-wide lifecycle only)
├── apps/
│   └── desktop/                   # Desktop presentation shell (React + Vite + Tauri v2)
│       ├── package.json
│       ├── src/                   # Pure React UI (sessions, conversation, task monitor)
│       └── src-tauri/             # Native Tauri v2 capability boundary
└── packages/
    └── contracts/                 # Shared data contracts & runtime Zod schemas
        ├── package.json
        └── src/                   # Pure data schemas (no behavior, no business logic)
```

### Strict Monorepo Purity Invariants

1. **No God Manifests**: The root `package.json` owns **only repo-wide lifecycle commands** (`dev`, `build`, `typecheck`, `test`, `lint`, `format`). It does not accumulate sub-app specific tool aliases.
2. **Sub-App Tool Isolation**: App-specific tools (such as `tauri` or `vite`) belong exclusively inside `apps/desktop/package.json`.
3. **Canonical Function Ownership**: Every function, hook, and component across the codebase has exactly ONE owner.
4. **No Dumping-Ground Files**: Generic filenames (`utils.ts`, `helpers.ts`, `common.ts`, `manager.ts`, etc.) are forbidden.
5. **Runtime Validation**: All data crossing process or service boundaries must be validated by Zod schemas in `@perlica/contracts`.

---

## How to Run & Develop

### 1. Standalone Browser Development (Recommended for Fast UI Work)
Runs the React UI inside Chrome/Edge with instant hot-module replacement (HMR):

```bash
npm run dev
```
*(Runs Vite on `http://localhost:1420`)*

---

### 2. Native Tauri Desktop Development
Launches the native Windows desktop application window using Tauri v2:

```bash
# Option A: Run via npm workspace flag from repository root
npm --workspace=@perlica/desktop run tauri dev

# Option B: Navigate into the desktop package directly
cd apps/desktop
npm run tauri dev
```

---

### 3. Quality Gates & Architecture Verification

All architectural invariants and code quality gates are enforced locally:

```bash
# Verify architecture invariants (no god files, no duplicate exports, root purity)
npm run verify:architecture

# Run ESLint + Architecture Verification
npm run lint

# Check TypeScript across all workspaces
npm run typecheck

# Verify Prettier code formatting
npm run format:check

# Run unit and contract tests (Vitest)
npm test

# Build all packages for production
npm run build
```
