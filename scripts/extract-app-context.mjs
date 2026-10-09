import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { toolHandlers } from "./mcp-app-inspector.mjs";

// Helper: load key from .env if process.env does not have it
function resolveApiKey(rootDir) {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;

  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const [key, ...valParts] = line.split("=");
      const val = valParts.join("=").trim().replace(/^['"]|['"]$/g, "");
      if (val && (key === "GEMINI_API_KEY" || key === "VITE_GEMINI_API_KEY" || key === "GOOGLE_API_KEY")) {
        return val;
      }
    }
  }
  return null;
}

async function runApplicationExtraction() {
  console.log("=== Extracting Live Workspace State ===");

  // 1. Collect live data using inspector handlers
  console.log("[1/5] Gathering runtime diagnostics...");
  const diagnostics = await toolHandlers.get_runtime_diagnostics();
  const rootDir = diagnostics.appRoot;

  console.log("[2/5] Inspecting route topology...");
  const routes = await toolHandlers.inspect_routes();

  console.log("[3/5] Parsing model schemas and rules...");
  const schemas = await toolHandlers.inspect_models_and_schemas();

  console.log("[4/5] Cataloging Playwright E2E test suites...");
  const e2e = await toolHandlers.inspect_e2e_tests();

  console.log("[5/5] Fetching working tree diffs...");
  const diff = await toolHandlers.fetch_workspace_diff();

  const manifest = {
    generatedAt: new Date().toISOString(),
    diagnostics,
    routes: {
      reactAppRoutes: routes.reactAppRoutes,
      foundryRoutes: routes.foundryRoutes,
      totalPageModules: routes.pageModules.length,
      pageModulesSample: routes.pageModules.slice(0, 15),
    },
    schemas: {
      totalSchemasDetected: schemas.totalSchemasDetected,
      summary: schemas.detectedSchemas.map((s) => ({
        file: s.file,
        priority: s.priority,
        bytes: s.totalBytes,
      })),
    },
    e2eTests: {
      totalSpecFiles: e2e.totalSpecFiles,
      totalTestsCount: e2e.totalTestsCount,
      projects: e2e.config?.projects || [],
      specFiles: e2e.specFiles.map((s) => ({
        file: s.file,
        testCount: s.testCount,
        suites: s.suites.map((st) => st.title),
      })),
    },
    gitDiff: diff,
  };

  const manifestPath = path.join(rootDir, "app_state_manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Saved structured state manifest to: ${manifestPath}`);

  // 2. Prepare prompt for Gemini
  const prompt = [
    "You are an expert software architect analyzing an application currently under active development.",
    "Below is the current workspace metadata extracted live from the repository:\n",
    `Application: ${diagnostics.appName} v${diagnostics.appVersion} (${diagnostics.platform}, Node ${diagnostics.nodeVersion})`,
    `Active Git Branch: ${diagnostics.git.branch} (Uncommitted Changes: ${diagnostics.git.hasUncommittedChanges})`,
    "",
    "=== Active React & Foundry Routes ===",
    JSON.stringify(routes.reactAppRoutes.slice(0, 12), null, 2),
    "",
    "=== Story Foundry & Database Schemas ===",
    JSON.stringify(manifest.schemas.summary.slice(0, 10), null, 2),
    "",
    "=== Playwright E2E Test Suite & Test Coverage ===",
    JSON.stringify(manifest.e2eTests, null, 2),
    "",
    "=== Working Tree Changes Summary ===",
    diff.diffStat || diff.statusOrDiff.slice(0, 2000),
    "",
    "Provide a structured architectural assessment covering:",
    "1. Key frameworks, UI architectures, and operational runtime requirements.",
    "2. Scope and implications of recent modifications based on modified files.",
    "3. Alignment between Story Foundry element schemas and routed application views.",
    "4. Recommended verification checks and E2E test executions to prevent regression before committing.",
  ].join("\n");

  // 3. Check for API Key
  const apiKey = resolveApiKey(rootDir);

  const outputPath = path.join(rootDir, "app_state_summary.md");

  if (!apiKey) {
    console.warn("\n⚠️  No GEMINI_API_KEY detected in environment or .env.");
    console.warn("Generating pre-flight architectural manifest template without remote API call.");

    const fallbackSummary = [
      "# Live Application State Summary (Pre-Flight Manifest)",
      `*Generated at: ${manifest.generatedAt}*`,
      "",
      "## 1. Environment & Runtime",
      `- **Application:** \`${diagnostics.appName}\` v\`${diagnostics.appVersion}\``,
      `- **Node Version:** \`${diagnostics.nodeVersion}\``,
      `- **Git Branch:** \`${diagnostics.git.branch}\` (Has Uncommitted Changes: \`${diagnostics.git.hasUncommittedChanges}\`)`,
      "",
      "## 2. Route Topology",
      `- **Top-Level React Routes:** ${routes.reactAppRoutes.length} registered in \`src/App.jsx\``,
      `- **Story Foundry Sub-Routes:** ${routes.foundryRoutes.length} registered in \`FoundryApp.jsx\``,
      `- **Total Page Modules:** ${routes.pageModules.length} components cataloged under \`src/pages/\``,
      "",
      "## 3. Schemas & Models",
      `- **Canonical Element Schemas:** \`src/pages/Foundry/ElementForge/elementSchemas.js\` (${schemas.detectedSchemas.find(s => s.file.includes("elementSchemas"))?.totalBytes || 0} bytes)`,
      `- **Firestore Rules:** \`firestore.rules\` (${schemas.detectedSchemas.find(s => s.file.includes("firestore.rules"))?.totalBytes || 0} bytes)`,
      `- **Total Model/Schema Files Detected:** ${schemas.totalSchemasDetected}`,
      "",
      "## 4. Playwright E2E Test Suite",
      `- **Total Spec Files:** ${e2e.totalSpecFiles}`,
      `- **Total Tests:** ${e2e.totalTestsCount} configured across all suites`,
      `- **Target Projects:** ${(e2e.config?.projects || []).join(", ") || "default"}`,
      ...e2e.specFiles.map((s) => `  - \`${s.file}\` (${s.testCount} tests)`),
      "",
      "## 5. Working Tree Status",
      "```text",
      diff.diffStat ? diff.diffStat.slice(0, 1500) : diff.statusOrDiff.slice(0, 1500),
      "```",
      "",
      "> [!NOTE]",
      "> To generate the full AI synthesis with Gemini 2.5 Pro, configure `GEMINI_API_KEY` in your environment or `.env` and re-run `node scripts/extract-app-context.mjs`.",
    ].join("\n");

    fs.writeFileSync(outputPath, fallbackSummary, "utf-8");
    console.log(`Saved pre-flight summary to: ${outputPath}`);
    return;
  }

  // 4. Remote Gemini API Generation
  console.log("\nInvoking Gemini API (gemini-2.5-pro)...");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    console.log("\n=== Gemini Application State Analysis ===\n");
    console.log(response.text);

    fs.writeFileSync(outputPath, response.text, "utf-8");
    console.log("\nSaved AI summary to: " + outputPath);
  } catch (err) {
    console.error("Gemini API call failed:", err.message);
    console.log("Fallback: Manifest and diffs are preserved in app_state_manifest.json");
  }
}

runApplicationExtraction()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Extraction error:", err);
    process.exit(1);
  });
