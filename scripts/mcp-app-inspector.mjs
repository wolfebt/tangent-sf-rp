import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import http from "http";
import { execSync, spawnSync } from "child_process";

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

          // Exclude tests, mocks, raw markdown, UI components, and non-schema files
          if (
            base.includes(".test.") ||
            base.includes(".spec.") ||
            relPath.includes("/__tests__/") ||
            relPath.includes("/__mocks__/") ||
            (ext === ".jsx" && !base.includes("schema"))
          ) {
            continue;
          }

          const isSchemaPath = relPath.includes("/schemas/") || relPath.includes("/models/");
          const isSchemaFile =
            base.includes("schema") ||
            base.endsWith(".proto") ||
            base.endsWith(".d.ts") ||
            base.endsWith("types.ts") ||
            base.endsWith("model.ts") ||
            base.endsWith("model.js") ||
            /(?:^|[._-])(schema|schemas|model|models|types)(?:[._-]|$)/i.test(base);

          const isFalsePositive =
            base.includes("archetype") ||
            base.includes("species") ||
            base.includes("identity") ||
            base.includes("traitsdata");

          if ((isSchemaPath || isSchemaFile) && !isFalsePositive) {
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

    // Extract Playwright Information
    let playwrightInfo = {
      isInstalled: Boolean(packageInfo.devDependencies?.["@playwright/test"]),
      version: packageInfo.devDependencies?.["@playwright/test"] || "unspecified",
      configFile: null,
      testDir: "./tests/e2e",
      specFilesCount: 0,
      projects: [],
      webServer: null,
    };

    const pwConfigCandidate = path.join(rootDir, "playwright.config.ts");
    if (fs.existsSync(pwConfigCandidate)) {
      playwrightInfo.configFile = "playwright.config.ts";
      try {
        const pwContent = fs.readFileSync(pwConfigCandidate, "utf-8");
        const projects = [];
        const projectRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
        let pMatch;
        while ((pMatch = projectRegex.exec(pwContent)) !== null) {
          if (!projects.includes(pMatch[1])) projects.push(pMatch[1]);
        }
        playwrightInfo.projects = projects;
        const testDirMatch = pwContent.match(/testDir:\s*['"`]([^'"`]+)['"`]/);
        if (testDirMatch) playwrightInfo.testDir = testDirMatch[1];

        const webServerMatch = pwContent.match(/webServer:\s*\{([^}]+)\}/s);
        if (webServerMatch) {
          const wsStr = webServerMatch[1];
          const cmd = wsStr.match(/command:\s*['"`]([^'"`]+)['"`]/)?.[1];
          const url = wsStr.match(/url:\s*['"`]([^'"`]+)['"`]/)?.[1];
          playwrightInfo.webServer = { command: cmd, url };
        }

        const resolvedDir = path.resolve(rootDir, playwrightInfo.testDir);
        if (fs.existsSync(resolvedDir)) {
          playwrightInfo.specFilesCount = fs
            .readdirSync(resolvedDir)
            .filter((f) => /\.(spec|test)\./.test(f)).length;
        }
      } catch (err) {
        playwrightInfo.parseError = err.message;
      }
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
      playwright: playwrightInfo,
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
      return {
        appRoot: rootDir,
        stagedOnly: isStaged,
        statusOrDiff: output,
        diffStat: statOutput || undefined,
      };
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

  inspect_e2e_tests: async (args = {}) => {
    const configCandidates = [
      path.join(rootDir, "playwright.config.ts"),
      path.join(rootDir, "playwright.config.js"),
      path.join(rootDir, "playwright.config.mjs"),
    ];
    let configFile = null;
    let configContent = "";
    for (const cand of configCandidates) {
      if (fs.existsSync(cand)) {
        configFile = cand;
        configContent = fs.readFileSync(cand, "utf-8");
        break;
      }
    }

    const testDirSetting = args.testDir || configContent.match(/testDir:\s*['"`]([^'"`]+)['"`]/)?.[1] || "./tests/e2e";
    const resolvedTestDir = path.resolve(rootDir, testDirSetting);
    const baseURL = configContent.match(/baseURL:\s*['"`]([^'"`]+)['"`]/)?.[1] || "http://127.0.0.1:4173";
    const timeout = parseInt(configContent.match(/timeout:\s*(\d+)/)?.[1] || "45000", 10);

    const projects = [];
    const projectRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
    let pMatch;
    while ((pMatch = projectRegex.exec(configContent)) !== null) {
      if (!projects.includes(pMatch[1])) {
        projects.push(pMatch[1]);
      }
    }

    const webServerMatch = configContent.match(/webServer:\s*\{([^}]+)\}/s);
    let webServer = null;
    if (webServerMatch) {
      const wsStr = webServerMatch[1];
      const cmd = wsStr.match(/command:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const url = wsStr.match(/url:\s*['"`]([^'"`]+)['"`]/)?.[1];
      webServer = { command: cmd, url };
    }

    const specFiles = [];
    let totalTestsCount = 0;

    if (fs.existsSync(resolvedTestDir)) {
      const scanDir = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== "node_modules") {
            scanDir(fullPath);
          } else if (entry.isFile() && /\.(spec|test)\.(ts|js|mjs|tsx|jsx)$/.test(entry.name)) {
            const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
            const fileStat = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");

            const suites = [];
            let currentSuite = { title: "Root", line: 1, tests: [] };

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const suiteMatch = line.match(/test\.describe(?:\.(?:only|skip))?\s*\(\s*['"`]([^'"`]+)['"`]/);
              if (suiteMatch) {
                if (currentSuite.tests.length > 0 || currentSuite.title !== "Root") {
                  suites.push(currentSuite);
                }
                currentSuite = { title: suiteMatch[1], line: i + 1, tests: [] };
                continue;
              }

              const isTest = /(?:^|[^\w$.])test(?:\.(?:only|skip))?\s*\(\s*['"`]([^'"`]+)['"`]/.exec(line);
              if (isTest && !line.includes("test.describe") && !line.includes("before") && !line.includes("after")) {
                const isOnly = line.includes("test.only");
                const isSkip = line.includes("test.skip");
                currentSuite.tests.push({
                  title: isTest[1],
                  line: i + 1,
                  mode: isOnly ? "only" : isSkip ? "skip" : "default",
                });
                totalTestsCount++;
              }
            }
            if (currentSuite.tests.length > 0 || suites.length === 0) {
              suites.push(currentSuite);
            }

            specFiles.push({
              file: relPath,
              fileName: entry.name,
              sizeBytes: fileStat.size,
              lastModified: fileStat.mtime.toISOString(),
              suiteCount: suites.length,
              testCount: suites.reduce((acc, s) => acc + s.tests.length, 0),
              suites,
            });
          }
        }
      };
      scanDir(resolvedTestDir);
    }

    const reportDir = path.join(rootDir, "playwright-report");
    let htmlReport = null;
    if (fs.existsSync(reportDir)) {
      const indexPath = path.join(reportDir, "index.html");
      if (fs.existsSync(indexPath)) {
        const stat = fs.statSync(indexPath);
        htmlReport = {
          exists: true,
          path: path.relative(rootDir, indexPath).replace(/\\/g, "/"),
          lastGenerated: stat.mtime.toISOString(),
        };
      }
    }

    const testResultsDir = path.join(rootDir, "test-results");
    let artifactsCount = 0;
    if (fs.existsSync(testResultsDir)) {
      const countArtifacts = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) countArtifacts(full);
          else if (entry.isFile()) artifactsCount++;
        }
      };
      countArtifacts(testResultsDir);
    }

    return {
      appRoot: rootDir,
      configFile: configFile ? path.relative(rootDir, configFile).replace(/\\/g, "/") : null,
      config: {
        testDir: testDirSetting,
        baseURL,
        timeout,
        projects: projects.length > 0 ? projects : ["default"],
        webServer,
      },
      totalSpecFiles: specFiles.length,
      totalTestsCount,
      specFiles,
      artifacts: {
        htmlReport,
        testResultsDirExists: fs.existsSync(testResultsDir),
        totalArtifactFiles: artifactsCount,
      },
    };
  },

  run_e2e_inspection: async (args = {}) => {
    const cliPath = path.join(rootDir, "node_modules", "@playwright", "test", "cli.js");
    if (!fs.existsSync(cliPath)) {
      return {
        error: "@playwright/test CLI not found in node_modules. Run npm install first.",
        appRoot: rootDir,
      };
    }

    const cliArgs = ["test"];

    if (args.spec) {
      cliArgs.push(args.spec);
    }
    if (args.project) {
      cliArgs.push("--project", args.project);
    }
    if (args.grep) {
      cliArgs.push("--grep", args.grep);
    }
    if (args.timeout) {
      cliArgs.push("--timeout", String(args.timeout));
    }
    if (args.updateSnapshots) {
      cliArgs.push("--update-snapshots");
    }

    cliArgs.push("--reporter=json");

    let stdout = "";
    let stderr = "";
    let exitCode = 0;

    const startTime = Date.now();
    try {
      const res = spawnSync(process.execPath, [cliPath, ...cliArgs], {
        cwd: rootDir,
        encoding: "utf-8",
        maxBuffer: 15 * 1024 * 1024,
        env: { ...process.env, CI: "1" },
      });
      stdout = res.stdout || "";
      stderr = res.stderr || "";
      exitCode = res.status ?? 0;
    } catch (err) {
      return {
        appRoot: rootDir,
        status: "EXECUTION_ERROR",
        error: `Failed to spawn Playwright runner: ${err.message}`,
        durationMs: Date.now() - startTime,
      };
    }

    const executionDurationMs = Date.now() - startTime;

    // Parse JSON report
    const firstBrace = stdout.indexOf("{");
    const lastBrace = stdout.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return {
        appRoot: rootDir,
        status: exitCode === 0 ? "PASSED" : "FAILED",
        exitCode,
        durationMs: executionDurationMs,
        rawStdout: stdout.slice(0, 3000),
        rawStderr: stderr.slice(0, 3000),
      };
    }

    try {
      const raw = JSON.parse(stdout.slice(firstBrace, lastBrace + 1));
      const passedTests = [];
      const failedTests = [];
      const skippedTests = [];

      const walkSuites = (suite, file = "") => {
        const currentFile = suite.file || file;
        for (const spec of suite.specs || []) {
          for (const testItem of spec.tests || []) {
            for (const res of testItem.results || []) {
              const entry = {
                file: currentFile,
                suite: suite.title || "Root",
                title: spec.title,
                project: testItem.projectName,
                status: res.status,
                durationMs: res.duration,
                errors: (res.errors || []).map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e))),
              };
              if (res.status === "passed") {
                passedTests.push(entry);
              } else if (res.status === "skipped") {
                skippedTests.push(entry);
              } else {
                failedTests.push(entry);
              }
            }
          }
        }
        for (const childSuite of suite.suites || []) {
          walkSuites(childSuite, currentFile);
        }
      };

      for (const topSuite of raw.suites || []) {
        walkSuites(topSuite);
      }

      return {
        appRoot: rootDir,
        status: failedTests.length === 0 && exitCode === 0 ? "PASSED" : "FAILED",
        exitCode,
        durationSeconds: (executionDurationMs / 1000).toFixed(2),
        summary: {
          total: passedTests.length + failedTests.length + skippedTests.length,
          passed: passedTests.length,
          failed: failedTests.length,
          skipped: skippedTests.length,
          flaky: raw.stats?.flaky || 0,
        },
        passedTests: passedTests.map((p) => ({
          file: p.file,
          title: p.title,
          project: p.project,
          durationMs: p.durationMs,
        })),
        failedTests: failedTests.map((f) => ({
          file: f.file,
          title: f.title,
          project: f.project,
          durationMs: f.durationMs,
          errors: f.errors,
        })),
        globalErrors: raw.errors || [],
      };
    } catch (parseErr) {
      return {
        appRoot: rootDir,
        status: exitCode === 0 ? "PASSED" : "FAILED",
        exitCode,
        parseError: parseErr.message,
        durationMs: executionDurationMs,
        rawStdout: stdout.slice(0, 3000),
        rawStderr: stderr.slice(0, 3000),
      };
    }
  },

  inspect_live_page: async (args = {}) => {
    let chromium;
    try {
      const pw = await import("@playwright/test");
      chromium = pw.chromium;
    } catch (e) {
      return {
        error: `Could not load Playwright chromium module: ${e.message}`,
        appRoot: rootDir,
      };
    }

    const route = args.route || "/";
    const baseURL = args.baseURL || "http://127.0.0.1:4173";
    const targetUrl = args.url || (baseURL.replace(/\/$/, "") + (route.startsWith("/") ? route : "/" + route));
    const timeout = args.timeout || 15000;

    const isServerReachable = await new Promise((resolve) => {
      try {
        const parsed = new URL(targetUrl);
        const req = http.get(
          {
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
            path: parsed.pathname,
            timeout: 2000,
          },
          (res) => {
            resolve(true);
            res.resume();
          }
        );
        req.on("error", () => resolve(false));
        req.on("timeout", () => {
          req.destroy();
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });

    if (!isServerReachable) {
      return {
        appRoot: rootDir,
        targetUrl,
        serverReachable: false,
        status: "UNREACHABLE",
        message: `Local server at ${targetUrl} is not responding. Ensure preview or dev server is active, or run 'run_e2e_inspection' which automatically manages webServer lifecycle.`,
      };
    }

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          "--enable-webgl",
          "--ignore-gpu-blocklist",
          "--use-gl=angle",
          "--use-angle=swiftshader",
        ],
      });

      const context = await browser.newContext({
        viewport: args.viewport || { width: 1280, height: 720 },
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        window.localStorage.setItem("userHandle", "Inspector Agent");
        window.localStorage.setItem("hasDismissedWelcome", "true");
        window.localStorage.setItem("audioMuted", "true");
      });

      const consoleLogs = [];
      page.on("console", (msg) => {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text(),
        });
      });

      const pageErrors = [];
      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      const response = await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout,
      });

      if (args.waitForSelector) {
        await page.waitForSelector(args.waitForSelector, { timeout: 5000 }).catch(() => {});
      } else {
        await page.waitForTimeout(500);
      }

      const pageTitle = await page.title();
      const httpStatus = response ? response.status() : null;

      const domMetrics = await page.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll("canvas")).map((c, i) => {
          const gl = c.getContext("webgl2") || c.getContext("webgl");
          return {
            index: i,
            width: c.width,
            height: c.height,
            clientWidth: c.clientWidth,
            clientHeight: c.clientHeight,
            hasWebGL: !!gl,
            isContextLost: gl ? gl.isContextLost() : false,
          };
        });

        const dialogs = Array.from(document.querySelectorAll('dialog, [role="dialog"]')).map((d) => ({
          tagName: d.tagName.toLowerCase(),
          ariaModal: d.getAttribute("aria-modal"),
          visible: d.offsetWidth > 0 && d.offsetHeight > 0,
        }));

        return {
          mainExists: !!document.querySelector("main"),
          headingText: document.querySelector("h1, h2, [role='heading']")?.innerText?.slice(0, 100) || null,
          canvases,
          dialogs,
          elementCounts: {
            buttons: document.querySelectorAll("button").length,
            inputs: document.querySelectorAll("input").length,
            links: document.querySelectorAll("a").length,
            images: document.querySelectorAll("img").length,
          },
        };
      });

      let screenshotResult = null;
      if (args.takeScreenshot) {
        const screenshotsDir = path.join(rootDir, "inspection-screenshots");
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        const sanitizedRoute = route.replace(/[^a-z0-9]/gi, "_") || "root";
        const screenshotFile = args.screenshotName || `inspect_${sanitizedRoute}_${Date.now()}.png`;
        const screenshotPath = path.join(screenshotsDir, screenshotFile);
        await page.screenshot({ path: screenshotPath, fullPage: args.fullPage || false });
        screenshotResult = {
          file: path.relative(rootDir, screenshotPath).replace(/\\/g, "/"),
          sizeBytes: fs.statSync(screenshotPath).size,
        };
      }

      await browser.close();

      return {
        appRoot: rootDir,
        targetUrl,
        httpStatus,
        pageTitle,
        serverReachable: true,
        status: "LOADED",
        domMetrics,
        consoleErrors: consoleLogs.filter((c) => c.type === "error"),
        pageErrors,
        consoleWarnings: consoleLogs.filter((c) => c.type === "warning").slice(0, 10),
        screenshot: screenshotResult,
      };
    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      return {
        appRoot: rootDir,
        targetUrl,
        status: "ERROR",
        error: err.message,
      };
    }
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
      {
        name: "inspect_e2e_tests",
        description:
          "Catalogs all Playwright E2E test suites, test specs, browser projects, and recent test artifacts/reports.",
        inputSchema: {
          type: "object",
          properties: {
            testDir: {
              type: "string",
              description: "Optional custom test directory relative to project root",
            },
          },
        },
      },
      {
        name: "run_e2e_inspection",
        description:
          "Executes Playwright E2E tests and returns structured inspection results, pass/fail status, duration, and error traces.",
        inputSchema: {
          type: "object",
          properties: {
            spec: {
              type: "string",
              description: "Optional specific test spec file to execute (e.g. tests/e2e/smoke.spec.ts)",
            },
            project: {
              type: "string",
              description: "Optional browser/device project to test (e.g. chromium-webgl, mobile-tablet)",
            },
            grep: {
              type: "string",
              description: "Optional regex or pattern to filter test titles",
            },
            timeout: {
              type: "number",
              description: "Optional timeout in milliseconds per test",
            },
            updateSnapshots: {
              type: "boolean",
              description: "Whether to update visual regression snapshots",
            },
          },
        },
      },
      {
        name: "inspect_live_page",
        description:
          "Launches a headless Playwright browser to inspect a live route, verifying DOM mounting, canvas/WebGL integrity, and collecting console/page errors.",
        inputSchema: {
          type: "object",
          properties: {
            route: {
              type: "string",
              description: "Application route to inspect (e.g. /stage, /folio, /dbm, default: /)",
            },
            url: {
              type: "string",
              description: "Full URL to inspect (overrides route)",
            },
            takeScreenshot: {
              type: "boolean",
              description: "Whether to capture a PNG screenshot into inspection-screenshots/",
            },
            screenshotName: {
              type: "string",
              description: "Custom filename for the screenshot",
            },
            waitForSelector: {
              type: "string",
              description: "Optional CSS selector to await before evaluating the page",
            },
            timeout: {
              type: "number",
              description: "Navigation timeout in milliseconds (default: 15000)",
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
    const e2e = await toolHandlers.inspect_e2e_tests();
    console.log(JSON.stringify({ diagnostics, routes, schemas, diff, e2e }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Dump failed:", err);
    process.exit(1);
  }
} else if (isTestMode) {
  console.log("=== Running Antigravity App Inspector Standalone Self-Test ===\n");
  console.log(`Resolved App Root: ${rootDir}`);

  try {
    console.log("\n[1/6] Testing inspect_routes...");
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

    console.log("\n[2/6] Testing inspect_models_and_schemas...");
    const schemas = await toolHandlers.inspect_models_and_schemas();
    console.log(`  Total Schemas & Model files detected: ${schemas.totalSchemasDetected}`);
    for (const s of schemas.detectedSchemas.slice(0, 6)) {
      console.log(`   - ${s.file} (${s.priority || "detected"}, ${s.totalBytes} bytes)`);
    }

    console.log("\n[3/6] Testing get_runtime_diagnostics...");
    const diagnostics = await toolHandlers.get_runtime_diagnostics();
    console.log(`  App Name: ${diagnostics.appName} v${diagnostics.appVersion}`);
    console.log(`  Node: ${diagnostics.nodeVersion} (${diagnostics.platform})`);
    console.log(`  Git Branch: ${diagnostics.git.branch} (Uncommitted changes: ${diagnostics.git.hasUncommittedChanges})`);
    console.log(`  Playwright: Installed=${diagnostics.playwright?.isInstalled}, Config=${diagnostics.playwright?.configFile}, SpecFiles=${diagnostics.playwright?.specFilesCount}`);

    console.log("\n[4/6] Testing fetch_workspace_diff...");
    const diff = await toolHandlers.fetch_workspace_diff();
    const statusLines = diff.statusOrDiff.trim().split("\n").filter(Boolean);
    console.log(`  Uncommitted changes count: ${statusLines.length}`);

    console.log("\n[5/6] Testing inspect_e2e_tests...");
    const e2e = await toolHandlers.inspect_e2e_tests();
    console.log(`  E2E Spec Files detected: ${e2e.totalSpecFiles} (${e2e.totalTestsCount} total tests)`);
    for (const spec of e2e.specFiles) {
      console.log(`   - ${spec.file} (${spec.testCount} tests across ${spec.suiteCount} suites)`);
    }

    console.log("\n[6/6] Testing inspect_live_page probe...");
    const liveProbe = await toolHandlers.inspect_live_page({ route: "/" });
    console.log(`  Live route check status: ${liveProbe.status} (Reachable: ${liveProbe.serverReachable})`);

    console.log("\n✅ All 6 tools executed cleanly without errors!");
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
