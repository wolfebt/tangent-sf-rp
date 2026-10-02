---
name: app-inspector
description: Extracts architectural state, React SPA routes, Story Foundry element schemas, runtime diagnostics, and uncommitted git diffs for live development applications. Use when inspecting active routes, schemas, runtime status, or git diffs.
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
   - Returns package versions, Node.js runtime information, and active Git branch state.
4. **`fetch_workspace_diff`**:
   - Retrieves staged or unstaged Git diffs, diffstats, or single-file diffs.

## Execution Workflow

1. **Baseline Diagnostics:** Call `get_runtime_diagnostics` to establish active frameworks, package versions, and Git branch clean/dirty status.
2. **Route Topology:** Call `inspect_routes` to catalog active entry points, Story Foundry sub-routes, and page components.
3. **Data Schemas:** Call `inspect_models_and_schemas` to parse Story Foundry element schemas and Firestore rules.
4. **Active Workspace Changes:** Call `fetch_workspace_diff` to review unstaged drafts, modified files, and in-progress refactors.
5. **Synthesis:** Consolidate these inputs into an architectural manifest, noting any discrepancies between schemas, route parameters, and component dependencies.
