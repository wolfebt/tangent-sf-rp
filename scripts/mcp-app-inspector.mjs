import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 1. Resolve Application Root Directory
let rootDir = process.env.APP_ROOT ? path.resolve(process.env.APP_ROOT) : process.cwd();
if (!fs.existsSync(path.join(rootDir, "package.json"))) {
  const candidate = path.join(rootDir, "TANGENT SF RP react project");
  if (fs.existsSync(path.join(candidate, "package.json"))) {
    rootDir = candidate;
  }
}

// 2. Define Tool Handlers
export const toolHandlers = {
  inspect_routes: async (args = {}) => {
    const subDirectory = args.subDirectory || "src";
    const targetDir = path.resolve(rootDir, subDirectory);
    const results = {
      appRoot: rootDir,
      reactAppRoutes: [],
      foundryRoutes: [],
      pageModules: [],
      detectedRouteFiles: [],
      cloudFunctions: [],
    };

    // Helper: Parse React Router JSX routes from a file
    const parseRouteFile = (filePath) => {
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, "utf-8");
      const routes = [];
      const routeRegex = /<Route\b/g;
      let match;
      while ((match = routeRegex.exec(content)) !== null) {
        let idx = match.index + match[0].length;
        let braceDepth = 0;
        let inQuotes = null;
        let tagEnd = -1;
        while (idx < content.length) {
          const ch = content[idx];
          if (inQuotes) {
            if (ch === inQuotes && content[idx - 1] !== "\\") {
              inQuotes = null;
            }
          } else if (ch === '"' || ch === "'" || ch === "`") {
            inQuotes = ch;
          } else if (ch === "{") {
            braceDepth++;
          } else if (ch === "}") {
            braceDepth--;
          } else if (braceDepth === 0 && ch === ">") {
            tagEnd = idx;
            break;
          }
          idx++;
        }
        if (tagEnd !== -1) {
          const rawTag = content.slice(match.index, tagEnd + 1);
          const pathMatch = /path=["']([^"']+)["']/.exec(rawTag);
          let element = "unspecified";
          const elemIdx = rawTag.indexOf("element={");
          if (elemIdx !== -1) {
            let start = elemIdx + "element={".length;
            let depth = 1;
            let i = start;
            while (i < rawTag.length && depth > 0) {
              if (rawTag[i] === "{") depth++;
              else if (rawTag[i] === "}") depth--;
              i++;
            }
            if (depth === 0) {
              element = rawTag.slice(start, i - 1).trim();
            }
          }
          if (pathMatch) {
            routes.push({
              path: pathMatch[1],
              element,
            });
          }
        }
      }
      return routes;
    };

    // A. Parse src/App.jsx
    const appJsx = path.join(rootDir, "src", "App.jsx");
    if (fs.existsSync(appJsx)) {
      results.reactAppRoutes = parseRouteFile(appJsx);
    }

    // B. Parse src/pages/Foundry/FoundryApp.jsx
    const foundryAppJsx = path.join(rootDir, "src", "pages", "Foundry", "FoundryApp.jsx");
    if (fs.existsSync(foundryAppJsx)) {
      results.foundryRoutes = parseRouteFile(foundryAppJsx);
    }

    // C. Catalog src/pages/
    const pagesDir = path.join(rootDir, "src", "pages");
    if (fs.existsSync(pagesDir) && args.includePages !== false) {
      const scanPages = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "_archive") {
            scanPages(fullPath);
          } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
            results.pageModules.push(path.relative(rootDir, fullPath).replace(/\\/g, "/"));
          }
        }
      };
      scanPages(pagesDir);
    }

    // D. Scan for files with route, controller, api in name
    if (fs.existsSync(targetDir)) {
      const codeExts = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);
      const scanGenericRoutes = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
            scanGenericRoutes(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (codeExts.has(ext)) {
              const lower = entry.name.toLowerCase();
              if (lower.includes("route") || lower.includes("controller") || lower.includes("api")) {
                results.detectedRouteFiles.push(path.relative(rootDir, fullPath).replace(/\\/g, "/"));
              }
            }
          }
        }
      };
      scanGenericRoutes(targetDir);
    }

    // E. Catalog Firebase Functions if present
    const functionsDir = path.join(rootDir, "functions");
    if (fs.existsSync(functionsDir)) {
      const scanFunctions = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== "node_modules") {
            scanFunctions(fullPath);
          } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
            results.cloudFunctions.push(path.relative(rootDir, fullPath).replace(/\\/g, "/"));
          }
        }
      };
      scanFunctions(functionsDir);
    }

    return results;
  },

  inspect_models_and_schemas: async (args = {}) => {
    const searchTarget = args.schemaPath
      ? path.resolve(rootDir, args.schemaPath)
      : path.join(rootDir, "src");
    const maxSnippetLength = args.maxSnippetLength || 3000;
    const schemaFiles = [];

    // Prioritized Canonical Files
    const priorityFiles = [
      path.join(rootDir, "src", "pages", "Foundry", "ElementForge", "elementSchemas.js"),
      path.join(rootDir, "firestore.rules"),
    ];

    for (const pFile of priorityFiles) {
      if (fs.existsSync(pFile)) {
        const content = fs.readFileSync(pFile, "utf-8");
        schemaFiles.push({
          file: path.relative(rootDir, pFile).replace(/\\/g, "/"),
          priority: "canonical",
          totalBytes: fs.statSync(pFile).size,
          snippet: content.slice(0, maxSnippetLength),
        });
      }
    }

    const codeExtensions = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".rules", ".proto"]);

    // Traverse directory for schema/model/types files
    const scanSchemas = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "_archive") {
          scanSchemas(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!codeExtensions.has(ext)) continue;

          const base = entry.name.toLowerCase();
          const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
          if (schemaFiles.some((s) => s.file === relPath)) continue;

          if (
            base.includes("schema") ||
            base.includes("model") ||
            base.includes("types") ||
            base.includes("entity") ||
            base.includes("traitsdata") ||
            base.endsWith(".proto") ||
            base.endsWith(".d.ts")
          ) {
            try {
              const fileContent = fs.readFileSync(fullPath, "utf-8");
              schemaFiles.push({
                file: relPath,
                priority: "detected",
                totalBytes: fs.statSync(fullPath).size,
                snippet: fileContent.slice(0, maxSnippetLength),
              });
            } catch (err) {
              schemaFiles.push({
                file: relPath,
                error: `Read failure: ${err.message}`,
              });
            }
          }
        }
      }
    };

    scanSchemas(searchTarget);

    return {
      appRoot: rootDir,
      totalSchemasDetected: schemaFiles.length,
      detectedSchemas: schemaFiles,
    };
  },

  get_runtime_diagnostics: async () => {
    const packagePath = path.join(rootDir, "package.json");
    let packageInfo = {};
    if (fs.existsSync(packagePath)) {
      try {
        packageInfo = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
      } catch (e) {
        packageInfo = { parseError: e.message };
      }
    }

    // Extract Git Information
    let gitInfo = {
      isRepo: false,
      branch: "unknown",
      lastCommit: "unknown",
      hasUncommittedChanges: false,
    };

    try {
      const branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: rootDir,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      const lastCommit = execSync('git log -1 --format="%h - %s (%ci)"', {
        cwd: rootDir,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      const status = execSync("git status --porcelain", {
        cwd: rootDir,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      gitInfo = {
        isRepo: true,
        branch,
        lastCommit,
        hasUncommittedChanges: status.length > 0,
      };
    } catch {
      gitInfo.isRepo = false;
    }

    return {
      appRoot: rootDir,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      appName: packageInfo.name || "unspecified",
      appVersion: packageInfo.version || "0.0.0",
      type: packageInfo.type || "commonjs",
      scripts: Object.keys(packageInfo.scripts || {}),
      dependencies: packageInfo.dependencies || {},
      devDependencies: packageInfo.devDependencies || {},
      git: gitInfo,
      memoryUsageMB: {
        rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      },
    };
  },

  fetch_workspace_diff: async (args = {}) => {
    let output = "";
    let statOutput = "";
    const isStaged = Boolean(args.stagedOnly);
    const targetFile = args.filePath ? ` -- "${args.filePath}"` : "";

    try {
      if (args.statOnly) {
        const cmd = isStaged ? `git diff --cached --stat${targetFile}` : `git diff --stat${targetFile}`;
        output = execSync(cmd, { cwd: rootDir, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      } else if (args.filePath) {
        const cmd = isStaged ? `git diff --cached${targetFile}` : `git diff${targetFile}`;
        output = execSync(cmd, { cwd: rootDir, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      } else {
        const cmd = isStaged ? "git diff --cached --stat" : "git status --short";
        output = execSync(cmd, { cwd: rootDir, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
        const statCmd = isStaged ? "git diff --cached --stat" : "git diff --stat";
        statOutput = execSync(statCmd, { cwd: rootDir, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      }
    } catch (err) {
      output = "Git inspection failed or not inside a valid repository: " + err.message;
    }

    return {
      appRoot: rootDir,
      stagedOnly: isStaged,
      statusOrDiff: output,
      diffStat: statOutput || undefined,
    };
  },
};

// 3. Initialize MCP Server Instance
export const server = new Server(
  {
    name: "antigravity-app-inspector",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 4. Register ListTools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "inspect_routes",
        description:
          "Scans project directories and JSX definitions to catalog all active React Router SPA routes, Foundry sub-routes, page modules, and Cloud Functions.",
        inputSchema: {
          type: "object",
          properties: {
            subDirectory: {
              type: "string",
              description: "Target directory relative to project root (default: src)",
            },
            includePages: {
              type: "boolean",
              description: "Whether to catalog all page component files under src/pages/ (default: true)",
            },
          },
        },
      },
      {
        name: "inspect_models_and_schemas",
        description:
          "Parses database schemas, Firestore rules, Story Foundry element schemas, and TypeScript interface definitions.",
        inputSchema: {
          type: "object",
          properties: {
            schemaPath: {
              type: "string",
              description: "Path to schema definitions or types directory (default: src)",
            },
            maxSnippetLength: {
              type: "number",
              description: "Maximum character length for each file snippet (default: 3000)",
            },
          },
        },
      },
      {
        name: "get_runtime_diagnostics",
        description:
          "Extracts package versions, active Git branch, platform runtime flags, and local build status.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "fetch_workspace_diff",
        description:
          "Returns uncommitted git status, diff stats, or file-specific unified diffs for applications currently in development.",
        inputSchema: {
          type: "object",
          properties: {
            stagedOnly: {
              type: "boolean",
              description: "Limit diff to staged changes only",
            },
            filePath: {
              type: "string",
              description: "Optional specific file path relative to root to inspect diff for",
            },
            statOnly: {
              type: "boolean",
              description: "Return diffstat summary instead of full unified diff",
            },
          },
        },
      },
    ],
  };
});

// 5. Register CallTool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments || {};

  if (!toolHandlers[toolName]) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Unknown tool requested: ${toolName}`,
        },
      ],
    };
  }

  try {
    const result = await toolHandlers[toolName](args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Execution failed for tool ${toolName}: ${error.message}`,
        },
      ],
    };
  }
});

// 6. Execution Lifecycle / Standalone Self-Test Mode
const isTestMode = process.argv.includes("--test") || process.argv.includes("-t");
const isDumpMode = process.argv.includes("--dump") || process.argv.includes("--json");

if (isDumpMode) {
  try {
    const diagnostics = await toolHandlers.get_runtime_diagnostics();
    const routes = await toolHandlers.inspect_routes();
    const schemas = await toolHandlers.inspect_models_and_schemas();
    const diff = await toolHandlers.fetch_workspace_diff();
    console.log(JSON.stringify({ diagnostics, routes, schemas, diff }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Dump failed:", err);
    process.exit(1);
  }
} else if (isTestMode) {
  console.log("=== Running Antigravity App Inspector Standalone Self-Test ===\n");
  console.log(`Resolved App Root: ${rootDir}`);

  try {
    console.log("\n[1/4] Testing inspect_routes...");
    const routes = await toolHandlers.inspect_routes();
    console.log(`  React Routes detected in App.jsx: ${routes.reactAppRoutes.length}`);
    for (const r of routes.reactAppRoutes.slice(0, 8)) {
      console.log(`   - ${r.path} => ${r.element}`);
    }
    console.log(`  Foundry Routes detected: ${routes.foundryRoutes.length}`);
    for (const r of routes.foundryRoutes.slice(0, 5)) {
      console.log(`   - ${r.path} => ${r.element}`);
    }
    console.log(`  Page Modules detected: ${routes.pageModules.length}`);

    console.log("\n[2/4] Testing inspect_models_and_schemas...");
    const schemas = await toolHandlers.inspect_models_and_schemas();
    console.log(`  Total Schemas & Model files detected: ${schemas.totalSchemasDetected}`);
    for (const s of schemas.detectedSchemas.slice(0, 6)) {
      console.log(`   - ${s.file} (${s.priority || "detected"}, ${s.totalBytes} bytes)`);
    }

    console.log("\n[3/4] Testing get_runtime_diagnostics...");
    const diagnostics = await toolHandlers.get_runtime_diagnostics();
    console.log(`  App Name: ${diagnostics.appName} v${diagnostics.appVersion}`);
    console.log(`  Node: ${diagnostics.nodeVersion} (${diagnostics.platform})`);
    console.log(`  Git Branch: ${diagnostics.git.branch} (Uncommitted changes: ${diagnostics.git.hasUncommittedChanges})`);

    console.log("\n[4/4] Testing fetch_workspace_diff...");
    const diff = await toolHandlers.fetch_workspace_diff();
    const statusLines = diff.statusOrDiff.trim().split("\n").filter(Boolean);
    console.log(`  Uncommitted changes count: ${statusLines.length}`);

    console.log("\n✅ All 4 tools executed cleanly without errors!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Self-test failed:", err);
    process.exit(1);
  }
} else {
  // Production Stdio Transport Boot
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
