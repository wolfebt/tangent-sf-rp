# Live Application State Summary (Pre-Flight Manifest)
*Generated at: 2026-10-09T18:06:12.556Z*

## 1. Environment & Runtime
- **Application:** `tangent-sfr` v`1.0.0`
- **Node Version:** `v24.18.0`
- **Git Branch:** `main` (Has Uncommitted Changes: `true`)

## 2. Route Topology
- **Top-Level React Routes:** 33 registered in `src/App.jsx`
- **Story Foundry Sub-Routes:** 31 registered in `FoundryApp.jsx`
- **Total Page Modules:** 188 components cataloged under `src/pages/`

## 3. Schemas & Models
- **Canonical Element Schemas:** `src/pages/Foundry/ElementForge/elementSchemas.js` (33594 bytes)
- **Firestore Rules:** `firestore.rules` (13210 bytes)
- **Total Model/Schema Files Detected:** 11

## 4. Playwright E2E Test Suite
- **Total Spec Files:** 3
- **Total Tests:** 9 configured across all suites
- **Target Projects:** chromium-webgl, mobile-tablet
  - `tests/e2e/dice-roller.spec.ts` (1 tests)
  - `tests/e2e/smoke.spec.ts` (4 tests)
  - `tests/e2e/user-journeys.spec.ts` (4 tests)

## 5. Working Tree Status
```text
 .agents/plugins/app-inspector/plugin.json |   2 +-
 .agents/skills/app-inspector/SKILL.md     |  26 +-
 .agents/subagents/app-inspector.md        |  10 +-
 app_state_manifest.json                   | 148 +++----
 app_state_summary.md                      |  47 +--
 scripts/extract-app-context.mjs           |  34 +-
 scripts/mcp-app-inspector.mjs             | 632 +++++++++++++++++++++++++++++-
 src/components/UI/DiceRollerDock.jsx      |   7 +-
 8 files changed, 781 insertions(+), 125 deletions(-)

```

> [!NOTE]
> To generate the full AI synthesis with Gemini 2.5 Pro, configure `GEMINI_API_KEY` in your environment or `.env` and re-run `node scripts/extract-app-context.mjs`.