# Live Application State Summary (Pre-Flight Manifest)
*Generated at: 2026-10-07T05:48:39.866Z*

## 1. Environment & Runtime
- **Application:** `tangent-sfr` v`1.0.0`
- **Node Version:** `v24.18.0`
- **Git Branch:** `main` (Has Uncommitted Changes: `true`)

## 2. Route Topology
- **Top-Level React Routes:** 33 registered in `src/App.jsx`
- **Story Foundry Sub-Routes:** 31 registered in `FoundryApp.jsx`
- **Total Page Modules:** 189 components cataloged under `src/pages/`

## 3. Schemas & Models
- **Canonical Element Schemas:** `src/pages/Foundry/ElementForge/elementSchemas.js` (33594 bytes)
- **Firestore Rules:** `firestore.rules` (11540 bytes)
- **Total Model/Schema Files Detected:** 21

## 4. Working Tree Status
```text
 .gitattributes                                     |  27 +---
 .github/workflows/ci.yml                           |   4 +-
 app_state_manifest.json                            | 160 +++++++++----------
 app_state_summary.md                               |  29 +++-
 docs/APP_INSPECTOR_REPORT_2026-10-06.md            |  32 +---
 package.json                                       |   4 +-
 scripts/extract-app-context.mjs                    |  10 +-
 scripts/mcp-app-inspector.mjs                      | 175 +++++++++------------
 src/App.jsx                                        |  10 +-
 src/components/routing/RouteRedirects.jsx          |  20 ---
 src/components/routing/redirectTargets.js          |  35 -----
 src/engine/index.ts                                |   2 +-
 src/engine/migration/legacyElementAdapters.js      |   2 +-
 src/engine/migration/migrate_omnicortex_schema.mjs |   2 +-
 src/engines/__tests__/tangentEntityEngines.test.js |  10 +-
 .../__tests__/tangentIdentityEngine.test.js        |  24 ---
 .../tangentRulesAdjudicatorService.test.js         |   6 +-
 src/engines/tangentIdentityEngine.js               |  19 ++-
 src/pages/Foundry/ElementForge/elementSchemas.js   |  11 +-
 src/pages/Foundry/FoundryApp.jsx                   |  25 ++-
 tests/engine/appInspector.test.mjs                 |  84 ----------
 tests/engine/elementSchemaRegistry.test.mjs        |  46 ------
 tests/engine/routeRedirectsAndDeepLinks.test.mjs   |  64 +++-----
 23 files changed, 268 inserti
```

> [!NOTE]
> To generate the full AI synthesis with Gemini 2.5 Pro, configure `GEMINI_API_KEY` in your environment or `.env` and re-run `node scripts/extract-app-context.mjs`.