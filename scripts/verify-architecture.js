import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const FORBIDDEN_FILENAMES = new Set([
  "utils.ts",
  "utils.tsx",
  "helpers.ts",
  "helpers.tsx",
  "common.ts",
  "common.tsx",
  "misc.ts",
  "misc.tsx",
  "manager.ts",
  "services.ts",
]);

let violationCount = 0;

function reportViolation(rule, message, filePath) {
  console.error(`\x1b[31m[ARCHITECTURE VIOLATION]\x1b[0m [${rule}] ${message}`);
  if (filePath) {
    console.error(`  at: ${path.relative(ROOT_DIR, filePath)}`);
  }
  violationCount++;
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "src-tauri" ||
        entry.name === ".git"
      ) {
        continue;
      }
      getAllFiles(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log("\x1b[36m>>> Checking Architecture Invariants (AGENT.md & Frontend.md)...\x1b[0m");

const sourceFiles = [
  ...getAllFiles(path.join(ROOT_DIR, "apps", "desktop", "src")),
  ...getAllFiles(path.join(ROOT_DIR, "packages", "contracts", "src")),
];

// 0. Check root package.json for script pollution (Strict Monorepo Purity)
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
const ALLOWED_ROOT_SCRIPTS = new Set([
  "dev",
  "build",
  "typecheck",
  "test",
  "verify:architecture",
  "lint",
  "format:check",
  "format",
]);
for (const scriptName of Object.keys(rootPkg.scripts || {})) {
  if (!ALLOWED_ROOT_SCRIPTS.has(scriptName)) {
    reportViolation(
      "AGENT.md §29/§30 - Root Manifest Purity",
      `Root package.json must not contain package-specific tool script '${scriptName}'. Sub-app tools must remain isolated inside their own package.json. Invoke via 'npm --workspace=<pkg> run <cmd>'.`,
      path.join(ROOT_DIR, "package.json")
    );
  }
}

// 1. Check for forbidden dumping-ground files (AGENT.md §37)
for (const file of sourceFiles) {
  const baseName = path.basename(file);
  if (FORBIDDEN_FILENAMES.has(baseName.toLowerCase())) {
    reportViolation(
      "AGENT.md §37 - No God Files",
      `Forbidden generic dumping-ground file '${baseName}' detected. Name the file after its specific canonical responsibility (e.g. cn.ts, theme-context.tsx).`,
      file
    );
  }
}

// 2. Check for duplicate function and hook names (AGENT.md §32, §33, Frontend.md §38, §55, §56)
const exportedFunctions = new Map(); // functionName -> filePath

const EXPORT_FUNC_REGEX = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/g;
const EXPORT_CONST_FUNC_REGEX =
  /export\s+const\s+([a-zA-Z0-9_]+)\s*[:=]\s*(?:<[^>]+>)?\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g;
const EXPORT_COMPONENT_REGEX = /export\s+const\s+([A-Z][a-zA-Z0-9_]+)\s*:\s*React\.FC/g;

for (const file of sourceFiles) {
  if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;

  const content = fs.readFileSync(file, "utf8");

  const matches = [
    ...content.matchAll(EXPORT_FUNC_REGEX),
    ...content.matchAll(EXPORT_CONST_FUNC_REGEX),
    ...content.matchAll(EXPORT_COMPONENT_REGEX),
  ];

  for (const match of matches) {
    const fnName = match[1];
    if (exportedFunctions.has(fnName)) {
      const existingFile = exportedFunctions.get(fnName);
      reportViolation(
        "AGENT.md §32/§33 & Frontend.md §55/§75 - Canonical Function Ownership",
        `Duplicate canonical operation/component/hook '${fnName}' found. Already declared in ${path.relative(
          ROOT_DIR,
          existingFile
        )}. Each function must have exactly one canonical owner.`,
        file
      );
    } else {
      exportedFunctions.set(fnName, file);
    }
  }
}

// 3. Syntax-aware check: useAgent() is deprecated and banned from components
const USE_AGENT_IMPORT_REGEX = /import\s+\{[^}]*\buseAgent\b[^}]*\}\s+from\s+/;
for (const file of sourceFiles) {
  if (file.endsWith("agent-provider.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  if (USE_AGENT_IMPORT_REGEX.test(content)) {
    reportViolation(
      "Frontend.md §38 & Architecture Refactoring §1 - Deprecated Facade Ban",
      `Importing deprecated 'useAgent' is forbidden outside agent-provider.tsx. Use domain-specific hooks (useUserProfile, useScenario, useConversation, useCurrentTask, useSessions, useCurrentSession, useAgentClient).`,
      file
    );
  }
}

// 4. Deterministic src/lib/ foundation allowlist
const libDir = path.join(ROOT_DIR, "apps", "desktop", "src", "lib");
if (fs.existsSync(libDir)) {
  const ALLOWED_LIB_ENTRIES = new Set(["cn.ts", "storage", "theme"]);
  const entries = fs.readdirSync(libDir);
  for (const entry of entries) {
    if (!ALLOWED_LIB_ENTRIES.has(entry)) {
      reportViolation(
        "AGENT.md §37 & Architecture Refactoring §7 - Foundation Purity",
        `Unauthorized entry '${entry}' in apps/desktop/src/lib/. Only domain-agnostic foundation primitives (cn.ts, storage, theme) are permitted. Business and agent domain logic must live in features/.`,
        path.join(libDir, entry)
      );
    }
  }
}

// 5. Contracts purity: data definitions only, zero behavioral functions/classes
const CONTRACT_FORBIDDEN_EXPORT_FUNC = /export\s+(?:async\s+)?function\s+/;
const CONTRACT_FORBIDDEN_EXPORT_ARROW =
  /export\s+const\s+[a-zA-Z0-9_]+\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/;
const CONTRACT_FORBIDDEN_CLASS = /export\s+class\s+/;

for (const file of sourceFiles) {
  if (file.includes(path.join("packages", "contracts"))) {
    if (file.endsWith(".test.ts")) continue;
    const content = fs.readFileSync(file, "utf8");

    if (
      CONTRACT_FORBIDDEN_EXPORT_FUNC.test(content) ||
      CONTRACT_FORBIDDEN_EXPORT_ARROW.test(content)
    ) {
      reportViolation(
        "AGENT.md §30 - Contracts Purity",
        "packages/contracts must only export data schemas and TypeScript types. Functions and behavioral execution logic are strictly prohibited in contracts.",
        file
      );
    }
    if (CONTRACT_FORBIDDEN_CLASS.test(content)) {
      reportViolation(
        "AGENT.md §30 - Contracts Purity",
        "packages/contracts must not export classes. Contracts are data definitions only.",
        file
      );
    }
  }
}

// 6. React component / hook size thresholds (>200 lines warning, >350 lines failure)
for (const file of sourceFiles) {
  const isReactFile =
    file.endsWith(".tsx") || file.includes(path.join("src", "hooks"));
  if (isReactFile) {
    const lines = fs.readFileSync(file, "utf8").split("\n").length;
    if (lines > 350) {
      reportViolation(
        "Frontend.md §38 - Component Responsibility Limit",
        `React component/hook exceeds 350 lines (${lines} lines). Decompose into single-responsibility subcomponents.`,
        file
      );
    } else if (lines > 200) {
      console.warn(
        `\x1b[33m[ARCHITECTURE WARNING]\x1b[0m [Maintainability] Component/hook exceeds 200 lines (${lines} lines). Consider decomposing:\n  at: ${path.relative(
          ROOT_DIR,
          file
        )}`
      );
    }
  }
}

// 7. Architectural dependency boundaries (AGENT.md §39, Frontend.md §52)
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  const isContracts = file.includes(path.join("packages", "contracts"));
  const isComponent = file.includes(path.join("apps", "desktop", "src", "components"));
  const isFeature = file.includes(path.join("apps", "desktop", "src", "features"));
  const isLib = file.includes(path.join("apps", "desktop", "src", "lib"));

  // Contracts must never import from apps or relative paths outside contracts
  if (isContracts) {
    if (
      content.includes("from \"../") ||
      content.includes("from '@perlica/desktop'") ||
      content.includes("from \"@perlica/desktop\"")
    ) {
      reportViolation(
        "AGENT.md §30/§39 - Contracts Boundary",
        "packages/contracts must remain dependency-light and must never import from apps or runtime implementations.",
        file
      );
    }
  }

  // Foundations (src/lib) must never import from features or components
  if (isLib) {
    if (content.includes("/features/") || content.includes("/components/")) {
      reportViolation(
        "AGENT.md §39 - Foundation Dependency Inversion",
        "src/lib must remain domain-agnostic foundation primitives and must never import from features/ or components/.",
        file
      );
    }
  }

  // UI components must not directly import mock implementation (must use hooks or context)
  if (isComponent && !file.endsWith("DevToolbar.tsx")) {
    if (content.includes("mock-agent-client") || content.includes("MockAgentClient")) {
      reportViolation(
        "Frontend.md §42/§70 - Agent Transport Boundary",
        "UI components must not directly import or instantiate MockAgentClient. Use useAgentClient() or domain hooks instead.",
        file
      );
    }
  }

  // No direct localStorage in components or features (must use StorageService)
  if ((isComponent || isFeature) && !file.includes("storage-service.ts")) {
    if (content.includes("localStorage.")) {
      reportViolation(
        "Frontend.md §51 - Storage Boundary",
        "Direct localStorage access is forbidden outside StorageService. Use StorageService to preserve clean persistence boundaries.",
        file
      );
    }
  }
}

if (violationCount > 0) {
  console.error(
    `\n\x1b[31mFound ${violationCount} architecture violation(s). Fix them to preserve architectural invariants.\x1b[0m\n`
  );
  process.exit(1);
} else {
  console.log(
    `\x1b[32m✔ All architecture invariants verified successfully across ${sourceFiles.length} source files!\x1b[0m\n`
  );
  process.exit(0);
}
