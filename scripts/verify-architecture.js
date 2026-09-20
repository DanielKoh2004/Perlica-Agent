import fs from "fs";
import path from "path";
import ts from "typescript";

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

console.log("\x1b[36m>>> Checking Architecture Invariants with TypeScript AST (AGENT.md & Frontend.md)...\x1b[0m");

const sourceFiles = [
  ...getAllFiles(path.join(ROOT_DIR, "apps", "desktop", "src")),
  ...getAllFiles(path.join(ROOT_DIR, "packages", "contracts", "src")),
];

// Helper: Parse source file into TypeScript AST
function parseAST(filePath, content) {
  return ts.createSourceFile(
    path.basename(filePath),
    content,
    ts.ScriptTarget.Latest,
    true
  );
}

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

// 2. Deterministic src/lib/ foundation allowlist
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

// 3. React component / hook size thresholds (>200 lines warning, >350 lines failure)
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

// 4. AST-based checks: Canonical exports, useAgent import ban, contracts purity, import boundaries
const declaredExportNames = new Map(); // exportName -> filePath

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  const sf = parseAST(file, content);

  const isTestFile = file.endsWith(".test.ts") || file.endsWith(".test.tsx");
  const isContracts = file.includes(path.join("packages", "contracts"));
  const isComponent = file.includes(path.join("apps", "desktop", "src", "components"));
  const isFeature = file.includes(path.join("apps", "desktop", "src", "features"));
  const isLib = file.includes(path.join("apps", "desktop", "src", "lib"));
  const isAgentProvider = file.endsWith("agent-provider.tsx");

  for (const stmt of sf.statements) {
    const isExported =
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

    // A. Check for duplicate canonical function/component declarations
    if (isExported && !isTestFile) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        const fnName = stmt.name.text;
        if (declaredExportNames.has(fnName)) {
          const existingFile = declaredExportNames.get(fnName);
          reportViolation(
            "AGENT.md §32/§33 & Frontend.md §55/§75 - Canonical Function Ownership",
            `Duplicate canonical operation/component/hook '${fnName}' declared. Already declared in ${path.relative(
              ROOT_DIR,
              existingFile
            )}. Each function must have exactly one canonical owner.`,
            file
          );
        } else {
          declaredExportNames.set(fnName, file);
        }
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const varName = decl.name.text;
            // Check if variable is a function, arrow function, or React.FC
            const isFn =
              decl.initializer &&
              (ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer));
            const isComponentType =
              decl.type && decl.type.getText(sf).includes("React.FC");

            if (isFn || isComponentType) {
              if (declaredExportNames.has(varName)) {
                const existingFile = declaredExportNames.get(varName);
                reportViolation(
                  "AGENT.md §32/§33 & Frontend.md §55/§75 - Canonical Function Ownership",
                  `Duplicate canonical operation/component/hook '${varName}' declared. Already declared in ${path.relative(
                    ROOT_DIR,
                    existingFile
                  )}. Each function must have exactly one canonical owner.`,
                  file
                );
              } else {
                declaredExportNames.set(varName, file);
              }
            }
          }
        }
      }
    }

    // B. Check contracts purity (no exported functions or classes)
    if (isContracts && !isTestFile) {
      if (isExported) {
        if (ts.isFunctionDeclaration(stmt)) {
          reportViolation(
            "AGENT.md §30 - Contracts Purity",
            `packages/contracts must only export data schemas and TypeScript types. Function declaration '${stmt.name?.text || "anonymous"}' is prohibited.`,
            file
          );
        }
        if (ts.isClassDeclaration(stmt)) {
          reportViolation(
            "AGENT.md §30 - Contracts Purity",
            `packages/contracts must not export classes. Class '${stmt.name?.text || "anonymous"}' is prohibited.`,
            file
          );
        }
        if (ts.isVariableStatement(stmt)) {
          for (const decl of stmt.declarationList.declarations) {
            if (
              decl.initializer &&
              (ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer))
            ) {
              reportViolation(
                "AGENT.md §30 - Contracts Purity",
                `packages/contracts must not export behavioral functions. Function '${decl.name.getText(sf)}' is prohibited.`,
                file
              );
            }
          }
        }
      }
    }

    // C. Check imports: useAgent ban, contracts boundary, lib boundary, component mock boundary
    if (ts.isImportDeclaration(stmt)) {
      const modulePath = stmt.moduleSpecifier.text;

      // Check useAgent import ban outside agent-provider.tsx
      if (!isAgentProvider && stmt.importClause?.namedBindings) {
        if (ts.isNamedImports(stmt.importClause.namedBindings)) {
          for (const elem of stmt.importClause.namedBindings.elements) {
            const importedName = elem.propertyName?.text || elem.name.text;
            if (importedName === "useAgent") {
              reportViolation(
                "Frontend.md §38 & Architecture Refactoring §1 - Deprecated Facade Ban",
                "Importing deprecated 'useAgent' is forbidden outside agent-provider.tsx. Use domain-specific hooks (useUserProfile, useScenario, useConversation, useCurrentTask, useSessions, useCurrentSession, useAgentClient).",
                file
              );
            }
          }
        }
      }

      // Contracts must never import from apps or relative paths going outside contracts
      if (isContracts) {
        if (
          modulePath.startsWith("../") ||
          modulePath.includes("@perlica/desktop")
        ) {
          reportViolation(
            "AGENT.md §30/§39 - Contracts Boundary",
            `packages/contracts must remain dependency-light and must never import from apps or runtime implementations: '${modulePath}'.`,
            file
          );
        }
      }

      // Foundations (src/lib) must never import from features or components
      if (isLib) {
        if (
          modulePath.includes("/features/") ||
          modulePath.includes("/components/") ||
          modulePath.startsWith("@perlica/desktop/features") ||
          modulePath.startsWith("@perlica/desktop/components")
        ) {
          reportViolation(
            "AGENT.md §39 - Foundation Dependency Inversion",
            `src/lib must remain domain-agnostic foundation primitives and must never import from features/ or components/: '${modulePath}'.`,
            file
          );
        }
      }

      // UI components must not directly import mock implementation (must use hooks or context)
      if (isComponent && !file.endsWith("DevToolbar.tsx")) {
        if (
          modulePath.includes("mock-agent-client") ||
          modulePath.includes("MockAgentClient")
        ) {
          reportViolation(
            "Frontend.md §42/§70 - Agent Transport Boundary",
            `UI components must not directly import or instantiate MockAgentClient: '${modulePath}'. Use useAgentClient() or domain hooks instead.`,
            file
          );
        }
      }
    }
  }

  // D. Check for direct localStorage access outside StorageService using AST traversal
  if ((isComponent || isFeature) && !file.includes("storage-service.ts")) {
    function visitNode(node) {
      if (ts.isPropertyAccessExpression(node)) {
        if (node.expression.getText(sf) === "localStorage") {
          reportViolation(
            "Frontend.md §51 - Storage Boundary",
            "Direct localStorage access is forbidden outside StorageService. Use StorageService to preserve clean persistence boundaries.",
            file
          );
        }
      }
      ts.forEachChild(node, visitNode);
    }
    visitNode(sf);
  }
}

if (violationCount > 0) {
  console.error(
    `\n\x1b[31mFound ${violationCount} architecture violation(s). Fix them to preserve architectural invariants.\x1b[0m\n`
  );
  process.exit(1);
} else {
  console.log(
    `\x1b[32m✔ All architecture invariants verified successfully via TypeScript AST across ${sourceFiles.length} source files!\x1b[0m\n`
  );
  process.exit(0);
}
