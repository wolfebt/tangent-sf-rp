---
name: app-inspector
description: Extracts architectural state, React SPA routes, Story Foundry element schemas, Playwright E2E test suites, live DOM/canvas diagnostics, and uncommitted git diffs for live development applications. Use when inspecting active routes, schemas, runtime status, Playwright tests, or git diffs.
---

# Antigravity Application Inspector Skill

This skill guides Antigravity agents and subagents in extracting, inspecting, and synthesizing live application state across the Tangent SF RP workspace.

## Available MCP Tools

When the `app-inspector` plugin is active, the following MCP tools are available:

1. **`inspect_routes`**:
   - Parses React Router definitions in `src/App.jsx` and `src/pages/Foundry/FoundryApp.jsx`.
   - Catalogs all page modules under `src/pages/`.
   - Discovers API and Cloud Function handlers in `functions/`.
2. **`inspect_models_and_schemas`**:
   - Locates canonical schemas like `src/pages/Foundry/ElementForge/elementSchemas.js` and `firestore.rules`.
   - Scans for model, schema, traits data, and TypeScript type definition files.
3. **`get_runtime_diagnostics`**:
   - Returns package versions, Node.js runtime information, Git branch state, and Playwright configuration status.
4. **`fetch_workspace_diff`**:
   - Retrieves staged or unstaged Git diffs, diffstats, or single-file diffs.
5. **`inspect_e2e_tests`**:
   - Scans and catalogs all Playwright E2E test suites, individual `test(...)` cases, and tags under `tests/e2e/`.
   - Extracts browser/device project definitions (`chromium-webgl`, `mobile-tablet`) and webServer configuration from `playwright.config.ts`.
   - Reports on the existence and timestamps of test artifacts and HTML reports.
6. **`run_e2e_inspection`**:
   - Programmatically executes Playwright tests with automatic webServer lifecycle management and JSON reporting.
   - Supports filtering by spec file (`spec`), project (`project`), or test name regex (`grep`).
   - Returns structured test summaries, pass/fail status, duration, and detailed error messages.
7. **`inspect_live_page`**:
   - Launches a headless Playwright Chromium instance with WebGL hardware/SwiftShader emulation.
   - Navigates to a live application route (e.g. `/`, `/stage`, `/folio`, `/dbm`, `/story-foundry`).
   - Evaluates DOM health, `<main>` visibility, and canvas WebGL context health (`isContextLost()`).
   - Traps and reports browser console logs and uncaught page runtime exceptions.
   - Optionally captures a visual screenshot to `inspection-screenshots/`.

## Execution Workflow

1. **Baseline Diagnostics:** Call `get_runtime_diagnostics` to establish active frameworks, package versions, Git branch clean/dirty status, and Playwright readiness.
2. **Route Topology:** Call `inspect_routes` to catalog active entry points, Story Foundry sub-routes, and page components.
3. **Data Schemas:** Call `inspect_models_and_schemas` to parse Story Foundry element schemas and Firestore rules.
4. **Active Workspace Changes:** Call `fetch_workspace_diff` to review unstaged drafts, modified files, and in-progress refactors.
5. **E2E Test Inventory:** Call `inspect_e2e_tests` to audit automated verification suites and identify relevant test coverage.
6. **Functional & Visual Validation:**
   - Execute `run_e2e_inspection` for automated verification of critical user journeys or recent changes.
   - Execute `inspect_live_page` to probe live DOM mounting, WebGL canvas health, and console errors on active routes.
7. **Synthesis:** Consolidate these inputs into an architectural manifest, noting any discrepancies between schemas, route parameters, component dependencies, and test coverage.
