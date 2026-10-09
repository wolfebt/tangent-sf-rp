# Tangent SF RP — Application Inspector State Report

| | |
| :--- | :--- |
| **Generated** | 2026-10-09 15:52 (-05:00) |
| **App root** | `D:\_ Data\Tangent SF RP\TANGENT SF RP react project` |
| **Git HEAD** | `main` @ `cba054e` (HEAD) |
| **Working tree** | **Hardened & Verified** (3 uncommitted stability and DOM hierarchy fixes) |
| **Tools run** | `get_runtime_diagnostics`, `inspect_routes`, `inspect_models_and_schemas`, `fetch_workspace_diff`, `inspect_e2e_tests`, `run_e2e_inspection` (via Playwright test runner) |
| **Verification run** | `npm.cmd test` (684/684), `node scripts/validateDataIntegrity.mjs` (32/32, 100%), Playwright E2E (18/18, 100%), `npm.cmd run lint` (clean), `npm.cmd run build` (clean, 4.64s) |

> [!NOTE]
> Every metric and figure in this report is grounded in direct execution of the `app-inspector` toolset and live test runners. All 18 automated Playwright E2E integration tests, 684 engine unit tests, 32 data integrity tests, and production TypeScript builds executed with a 100.0% pass rate.

---

## 1. Executive Summary

| Category | Result | Notes |
| :--- | :--- | :--- |
| **Runtime** | Node `v24.18.0`, `win32 x64`, ESM | `tangent-sfr` v1.0.0 · 26 runtime dependencies · 15 devDependencies |
| **Git** | `main` @ `cba054e`, 3 modified files | Commits `50db7d5`, `6cef0b0`, `cba054e` landed; local stability hardening in working tree |
| **Top-level routes** (`App.jsx`) | **33** | 13 component routes · 20 redirects |
| **Foundry sub-routes** (`FoundryApp.jsx`) | **31** | 11 component routes · 20 redirects |
| **Page modules** (`src/pages/**`) | **188** | Fully cataloged across 14 directories |
| **Schema / model files** | **11** detected | 2 canonical (`elementSchemas.js`, `firestore.rules`) · 9 domain schemas (0 false positives) |
| **Firestore rules** | **47** `match` blocks | 31 reference collections · 15 app/user blocks · 1 catch-all deny |
| **Cloud Functions** | 1 file | `functions/index.js` (server-side claims and token security verified) |
| **Source files** (`src/`, excl. `_archive`) | 744 | `.jsx` 380 · `.js` 196 · `.ts` 106 · `.tsx` 53 · `.mjs` 9 |
| **`npm.cmd test`** | ✅ **684 / 684** (61 suites, 18.88 s) | 0 failures, 0 skipped, 0 cancelled |
| **Data integrity** | ✅ **32 / 32** (100.0%) | 390/390 (100.0%) archetype skills; 19 baseline species architecture documented |
| **Co-located engine tests** | ✅ **317 / 317** (44 suites) | Unit level physics, AST, dice, and state machine validation |
| **Playwright E2E** | ✅ **18 / 18 passed** (48.6 s) | 8/8 `smoke.spec.ts` + 2/2 `dice-roller.spec.ts` + 8/8 `user-journeys.spec.ts` |
| **Lint / Typecheck** | ✅ **Pass** (`tsc --noEmit`) | 0 TypeScript or ESM compilation errors |
| **Production build** | ✅ **Pass** — 4.64 s, 4,315 modules | `tsc` clean · PWA precache 12 entries / 6,195.20 KiB |

### Key Observations & Remediations Applied During Inspection

> [!TIP]
> **1. DOM Semantic Hierarchy & Playwright Strict-Mode Collision Resolved:**
> - Inspection identified that `/dbm` mounted a nested `<main>` tag inside `DBMContainer.jsx` while `App.jsx` already enclosed the route in a top-level `<main>`.
> - Replaced the container in `DBMContainer.jsx` with a semantic `<section className="flex-1 flex flex-col ...">`, adhering strictly to HTML5 single-main specification and eliminating strict-mode locator collisions in Playwright tests.
> - Hardened `smoke.spec.ts` locator selector to `page.locator('main').first()`.

> [!TIP]
> **2. PixiJS v8 Ticker Null-Safety on WebGL Fallback:**
> - When running under headless SwiftShader or when graphics contexts fail WebGPU probing, PixiJS reinitializes `Application`.
> - Guarded `app.ticker.add(...)` in `src/components/VTT/StageView.tsx` with `if (app?.ticker)`, preventing unhandled `Cannot read properties of undefined (reading 'add')` exceptions.

> [!TIP]
> **3. Canvas Bounding Box Layout Stabilization:**
> - Wrapped bounding box layout checks in `tests/e2e/smoke.spec.ts` inside `await expect(async () => { ... }).toPass({ timeout: 10000 })`, ensuring Playwright waits for DOM reflow and canvas dimension calculation before evaluating.

---

## 2. Runtime Diagnostics (`get_runtime_diagnostics`)

- **Application:** `tangent-sfr` v1.0.0, `"type": "module"`
- **Node Runtime:** `v24.18.0`, `win32 x64`
- **Memory Footprint:** RSS ≈ 79.2 MB, heapUsed ≈ 21.4 MB
- **Git Context:** branch `main` @ commit `cba054e`
- **Playwright Configuration:** `playwright.config.ts`, 3 spec files, 2 projects (`chromium-webgl`, `mobile-tablet`)

### 2.1 npm Scripts (18)

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `vite` | Local development server |
| `build` | `tsc && vite build` | Full production TypeScript check and Vite bundle compilation |
| `typecheck` | `tsc --noEmit` | Static type checking and verification |
| `lint` | `tsc --noEmit` | Alias for lint / type validation |
| `preview` | `vite preview` | Local production bundle preview server |
| `deploy` | `npm run build && firebase deploy --only hosting` | Firebase Hosting deployment |
| `deploy:rules` | `firebase deploy --only firestore:rules` | Target deployment for Firestore security rules |
| `deploy:all` | `npm run build && firebase deploy` | Full deployment of hosting, rules, and functions |
| `sync:species` | `node scripts/syncOmnicortexSpecies.mjs` | Omnicortex species catalog synchronization |
| `sync:species-traits` | `node scripts/syncSpeciesTraits.mjs` | Species trait catalog synchronization |
| `sync:species-disadvantages` | `node scripts/syncSpeciesDisadvantages.mjs` | Species disadvantages catalog synchronization |
| `build:data` | `node scripts/buildAllBundles.mjs` | Core JSON data bundle compilation |
| `test:data` | `node scripts/validateDataIntegrity.mjs` | Data integrity & relational cross-reference suite |
| `test:engine` | `node --test "tests/engine/*.test.mjs" "src/engines/__tests__/*.test.js" "src/services/*.test.mjs" "src/schemas/*.test.mjs"` | Engine unit test runner |
| `test:e2e` | `playwright test` | Full Playwright end-to-end integration suite |
| `test:e2e:smoke` | `playwright test tests/e2e/smoke.spec.ts` | Targeted E2E smoke tests |
| `test:e2e:journeys` | `playwright test tests/e2e/user-journeys.spec.ts` | Targeted E2E user journey tests |
| `test` | `npm run test:engine && node scripts/validateDataIntegrity.mjs` | Unified regression test command |

### 2.2 Dependencies Matrix

**Runtime Dependencies (26):**
`@google/genai` ^2.25.0 · `@modelcontextprotocol/sdk` ^1.31.0 · `@sqlite.org/sqlite-wasm` ^3.53.0-build1 · `dompurify` ^3.4.13 · `firebase` ^12.16.0 · `glob` ^13.0.6 · `gray-matter` ^4.0.3 · `immer` ^11.1.15 · `konva` ^10.3.0 · `livekit-client` ^2.22.2 · `lucide-react` ^1.31.0 · `marked` ^18.0.9 · `pixi.js` ^8.20.1 · `react` ^19.2.7 · `react-dom` ^19.2.7 · `react-konva` ^19.2.5 · `react-markdown` ^10.1.0 · `react-quill-new` ^3.8.3 · `react-router-dom` ^7.18.1 · `react-split` ^2.0.14 · `remark-gfm` ^4.0.1 · `three` ^0.185.1 · `uuid` ^14.0.1 · `yjs` ^13.6.32 · `zod` ^4.4.3 · `zustand` ^5.0.15

**Dev Dependencies (15):**
`@playwright/test` ^1.51.0 · `@tailwindcss/vite` ^4.3.3 · `@types/react-dom` ^19.2.5 · `@types/three` ^0.185.4 · `@vitejs/plugin-react` ^6.0.3 · `firebase-admin` ^14.2.0 · `tailwindcss` ^4.3.3 · `typescript` ~6.0.2 · `vite` ^8.1.1 · `vite-plugin-pwa` ^1.3.0 · `workbox-core` ^7.4.1 · `workbox-precaching` ^7.4.1 · `workbox-routing` ^7.4.1 · `workbox-strategies` ^7.4.1 · `workbox-window` ^7.4.1

---

## 3. Route Topology (`inspect_routes`)

### 3.1 Top-Level Routes: `src/App.jsx` (33)

**Component Routes (13)**

| Path | Element | Purpose |
| :--- | :--- | :--- |
| `/` | `<Dashboard />` | Master campaign overview and telemetry hub |
| `/network`, `/network/*` | `<NetworkPage />` | Real-time comms, chat channels, and squads |
| `/codex`, `/codex/*` | `<CodexApp />` | Interactive lore database and worldbuilder |
| `/compendium`, `/compendium/*` | `<Compendium />` | Rules compendium and articles |
| `/dbm` | `<DBM />` | Omnicortex database manager and item forge |
| `/folio` | `<Folio />` | Character creation, persona vitals, and Bastion combat |
| `/stage` | `<StageView defaultRole="architect" />` | Tactical VTT stage with full GM tooling |
| `/vtt` | `<StageView defaultRole="operative" />` | Player tactical grid and VTT interface |
| `/spectator/:mapId` | `<PlayerSpectatorView />` | Read-only spectator broadcast view |
| `/foundry/*` | `<FoundryApp />` | Story Foundry element forge and narrative DAG |

**Redirect Routes (20)**

| Source Path(s) | Target / Resolution |
| :--- | :--- |
| `/dashboard` | `SearchPreservingRedirect to="/"` |
| `/comms`, `/chat` | `NetworkRedirect defaultView="comms"` |
| `/teams`, `/groups`, `/squads` | `NetworkRedirect defaultView="squads"` |
| `/rules`, `/rules/*` | `SearchPreservingRedirect to="/compendium"` |
| `/roster` | `SearchPreservingRedirect to="/folio"` |
| `/live-studio`, `/ade-stage` | `SearchPreservingRedirect to="/foundry/live"` |
| `/map-maker`, `/mapmaker` | `SearchPreservingRedirect to="/foundry/map"` |
| `/vtt-ops` | `VttOpsRedirect` (dynamic search forwarder) |
| `/ade`, `/ade/*`, `/ade-studio`, `/ade-studio/*`, `/story-foundry`, `/campaign-builder` | `SearchPreservingRedirect to="/foundry"` |

### 3.2 Foundry Sub-Routes: `src/pages/Foundry/FoundryApp.jsx` (31)

**Component Sub-Routes (11)**

| Path | Element | Description |
| :--- | :--- | :--- |
| `/` (index), `ade`, `story` | `<StoryModule />` | Primary narrative node DAG editor |
| `stage` | `<ADEStage />` | Integrated scenario stage sandbox |
| `catalog` | `<Dashboard />` | Element catalog dashboard |
| `map`, `map-maker`, `map-maker-legacy` | `<MapMaker />` | 2D/3D dungeon and sector map cartography |
| `aime` | `<AIME />` | AI Narrative Engine interface |
| `view/:mapId`, `spectator/:mapId` | `<PlayerSpectatorView />` | Embedded player view |

**Redirect Sub-Routes (20) → `FoundryRouteRedirect` (or `VttOptionsRedirect`)**

| Path Aliases | Resolved View & Tab Parameters |
| :--- | :--- |
| `mission-control`, `dashboard`, `hub` | `view="mission_control"` |
| `live`, `live-studio`, `ade-stage`, `live-studio-standalone` | `view="stage" tab="run"` |
| `scripts`, `presets`, `automation` | `view="stage" tab="scripts"` |
| `tactical`, `control-panel` | `view="stage" tab="encounters"` |
| `interactive` | `view="scenarios" tab="play"` |
| `gems` | `view="scenarios" tab="gems"` |
| `narrative` | `view="scenarios" tab="write"` |
| `graph` | `view="scenarios" tab="graph"` |
| `assets`, `elements`, `gallery` | `view="elements"` |
| `vtt-options` | `VttOptionsRedirect` |

### 3.3 Topology Diagram

```mermaid
flowchart TD
    App["App.jsx (33 routes)"] --> Dash["/ Dashboard"]
    App --> Net["/network/* NetworkPage"]
    App --> Codex["/codex/* CodexApp"]
    App --> Comp["/compendium/* Compendium"]
    App --> DBM["/dbm DBM"]
    App --> Folio["/folio Folio"]
    App --> StageA["/stage StageView architect"]
    App --> StageO["/vtt StageView operative"]
    App --> Spec["/spectator/:mapId"]
    App --> F["/foundry/* FoundryApp (31)"]

    F --> SM["index, ade, story: StoryModule"]
    F --> ADE["stage: ADEStage"]
    F --> MM["map, map-maker: MapMaker"]
    F --> AIME["aime: AIME"]
    F --> Cat["catalog: Dashboard"]
    F --> FR["20 FoundryRouteRedirect aliases"]

    FR --> V1["view=mission_control"]
    FR --> V2["view=stage (run / scripts / encounters)"]
    FR --> V3["view=scenarios (play / gems / write / graph)"]
    FR --> V4["view=elements"]
```

### 3.4 Page Modules by Directory (188 Total)

| Directory | Count | Key Components |
| :--- | ---: | :--- |
| `src/pages/Foundry/MapMaker` | 50 | Cartography tools, tile brushes, layer inspectors |
| `src/pages/Foundry/StoryModule` | 43 | Narrative DAG, node inspectors, graph canvases |
| `src/pages/Codex` | 39 | Omnicortex codex articles, taxonomy viewers |
| `src/pages/Foundry/PresetsAndScripts` | 11 | Scenario automation, quick macros, dice tables |
| `src/pages/Foundry/Stage` | 11 | Encounter controllers, combat state runners |
| `src/pages/Foundry/ElementForge` | 10 | Element creation forms, canonical schema bindings |
| `src/pages` (root) | 8 | `CommsPage`, `Compendium`, `DBM`, `Folio`, `Home`, `NetworkPage`, `SquadsPage`, `TeamsPage` |
| `src/pages/Foundry/Weaver` | 5 | Branching timeline generation & plot weaver |
| `src/pages/Foundry/Dashboard` | 3 | Module overview, project telemetry |
| `src/pages/Compendium` | 2 | Catalog lists and markdown reader |
| `src/pages/Foundry/AIME` | 2 | GenAI copilot prompt interfaces |
| `src/pages/Foundry` (top level) | 2 | `FoundryApp.jsx`, `FoundryNav.jsx` |
| `src/pages/Foundry/hooks` | 1 | Foundry state synchronization hooks |
| `src/pages/Foundry/store` | 1 | Global Story Foundry Zustand store |
| **Total Page Modules** | **188** | |

---

## 4. Data Models & Schemas (`inspect_models_and_schemas`)

### 4.1 Canonical and Domain Schema Files (11)

Following word-boundary tightening in the inspector script, exactly **11 domain schema contracts** are cataloged with 0 false positives:

| File | Bytes | Priority | Role & Domain Authority |
| :--- | ---: | :---: | :--- |
| `src/pages/Foundry/ElementForge/elementSchemas.js` | 33,594 | **Canonical** | Story Foundry & AIME Layer 2 creative input schemas (`AIME_CORE_MODULES`, `ELEMENT_SCHEMAS`) |
| `firestore.rules` | 13,210 | **Canonical** | Cloud Firestore database security & validation schema (47 `match` blocks) |
| `src/components/Folio/schema.js` | 14,751 | Detected | Folio Operative Zod validation schemas (`inventoryItemSchema`, `attackSchema`, `companionSchema`) |
| `src/engine/migration/migrate_omnicortex_schema.mjs` | 4,821 | Detected | Stage 8 Omnicortex & Folio data migration schema runner |
| `src/engine/migration/tangentSchemaAdapters.js` | 236 | Detected | Legacy schema adapter re-exports |
| `src/pages/Foundry/Stage/stageTypes.ts` | 2,731 | Detected | TypeScript interfaces for ADE Stage manifests, anchors, triggers, and macros |
| `src/schemas/assetUnitSchema.ts` | 11,954 | Detected | Polymorphic AssetUnit Zod schema for Cartography, terrain, and tokens |
| `src/schemas/sharedSchemas.js` | 15,879 | Detected | Cross-module translation schema (DBM Item ↔ Story Element ↔ Folio Character ↔ VTT Token) |
| `src/schemas/vttWallSchema.js` | 6,082 | Detected | VTT barrier geometry, door state machine, and raycast obstruction schema |
| `src/services/aimeVttSchemaService.ts` | 19,402 | Detected | Gemini structured JSON schema contracts for generative .persona and .scene generation |
| `src/utils/tangentSchemaAdapters.js` | 19,133 | Detected | Omnicortex property item normalization & UDU hardware economy schema adapter |

---

## 5. Firestore Security Rules

`firestore.rules`: 320 lines, **47 `match` blocks**.

| Group | Blocks | Read Permission | Write / Mutate Permission |
| :--- | ---: | :--- | :--- |
| Root `databases/{database}/documents` | 1 | n/a | n/a |
| **Omnicortex reference collections** | 31 | Public (`if true`) | `isAdmin()` |
| `system_settings/{settingId}` | 1 | Public (`if true`) | `isAdmin()` |
| `lft_personas/{listingId}` | 1 | Any authenticated user | Owner (`request.auth.uid == listingId`) or `isAdmin()` |
| `users/{userId}` | 1 | Any authenticated user | Owner or `isAdmin()` |
| `game_groups/{groupId}` | 1 | Authenticated, or `isPublic` | Create: authenticated; Update: member, creator, or admin; Delete: creator or admin |
| `group_invites/{inviteId}` | 1 | Sender, recipient, or admin | Create: authenticated; Update/Delete: sender, recipient, or admin |
| `users/{userId}/personas/{personaId}` | 1 | Owner, `isPublic`, or admin | Owner or admin |
| `/{path=**}/personas/{personaId}` (collection group) | 1 | `isPublic`, or `ownerUid` match, or admin | `ownerUid` match or admin |
| `characters/{charId}` | 1 | Authenticated + (owner, `isPublic`, or admin) | Create: owner fields; Update/Delete: owner or admin |
| `user_stories/{storyId}` | 1 | `isPublic`, or owner/creator, or admin | Create: owner/creator; Update/Delete: owner/creator or admin |
| `story_elements/{elementId}` | 1 | `isPublic`, or author/creator, or admin | Same pattern |
| `story_maps/{mapId}` | 1 | Authenticated, or `isPublic` | Create: author/creator; Update/Delete: author/creator or admin |
| `universe/{document=**}` | 1 | Any authenticated user | `isAdmin()` |
| `channels/{channelId}` | 1 | Public, or member, or creator, or admin | Create: authenticated; Update: creator, admin, or member join/leave; Delete: creator/admin |
| `channels/{channelId}/messages/{messageId}` | 1 | Via parent channel (`canAccessChannel`) | Create: authenticated + sender match (`senderId == auth.uid`) + member/public; Update/Delete: sender or admin |
| Catch-all `/{document=**}` | 1 | **Deny** | **Deny** |

---

## 6. Workspace Changes (`fetch_workspace_diff`)

Current diffstat across the working tree:

```
 src/components/DBM/DBMContainer.jsx |  4 +--
 src/components/VTT/StageView.tsx    | 52 +++++++++++++++++++------------------
 tests/e2e/smoke.spec.ts             | 12 +++++----
 3 files changed, 36 insertions(+), 32 deletions(-)
```

### Detailed Breakdown of Active Changes

1. **`src/components/DBM/DBMContainer.jsx`:**
   - Replaced `<main className="...">` and `</main>` with `<section className="...">` and `</section>`.
   - **Rationale:** Resolves HTML5 specification violation where multiple `<main>` tags were present on `/dbm` (via `App.jsx` layout wrapper). Eliminates strict-mode locator ambiguities in automated test runners.

2. **`src/components/VTT/StageView.tsx`:**
   - Wrapped `app.ticker.add(...)` with `if (app?.ticker) { ... }`.
   - **Rationale:** During SwiftShader headless emulation or dynamic graphics device recovery, PixiJS `Application` initialization fallback can briefly reconstruct the application instance before ticker binding. The null-check prevents unhandled runtime exceptions.

3. **`tests/e2e/smoke.spec.ts`:**
   - Updated DBM smoke test locator from `page.locator('main')` to `page.locator('main').first()`.
   - Replaced immediate `await canvas.boundingBox()` call with `await expect(async () => { ... }).toPass({ timeout: 10000 })`.
   - **Rationale:** Ensures Playwright waits for asynchronous canvas layout stabilization and avoids race conditions during initial DOM mount.

---

## 7. Verification & Telemetry

### 7.1 Engine Test Suite (`npm.cmd test`)

```
ℹ tests 684
ℹ suites 61
ℹ pass 684
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18883.76
```

- **61 suites, 684 tests executed**, all passing cleanly in 18.88 s.
- Validates mathematical dice mechanics (2d10), QuickJS sandbox isolation, AST variable parsing, BVH collision culling, line-of-sight raycasting, and combat damage soak pipelines.
- **Co-located engine tests:** 317 tests across 44 suites pass in 1.64 s.

### 7.2 Data Integrity Suite (`node scripts/validateDataIntegrity.mjs`)

```
================================================================
  TANGENT SF RP — DATA INTEGRITY & INTERCONNECTIVITY TEST SUITE
================================================================

[1/5] Checking Runtime Data Bundle Counts... [PASS] (13/13)
[2/5] Testing Relational Cross-Reference Resolution Rates... [PASS]
      - Species -> Size resolution: 81/81 (100.0%)
      - Species -> Type resolution: 81/81 (100.0%)
      - Species -> Movement resolution: 101/101 (100.0%)
      - Archetype -> Essential Skills resolution: 390/390 (100.0%)
[3/5] Testing Modifier & Cost Integrity... [PASS]
      - Celestine BP cost correctly resolved to 26
      - Species Modifier Population Rate: 62/81 (76.5% - canonical baseline parity verified)
[4/5] Testing Equipment & Invocation Cost Integrity... [PASS]
      - Weaponry cost coverage: 75/75 items
      - Invocations strain cost coverage: 137/137 items
[5/5] Testing BASTION Mechanics Dataset Integrity... [PASS] (7/7)
================================================================
TEST RESULTS: 32/32 tests passed (100.0%)
================================================================
```

### 7.3 Playwright E2E Integration Suite

Executed across `chromium-webgl` and `mobile-tablet` with 4 parallel workers:

```powershell
npx.cmd playwright test
```

| Suite | Spec File | Project | Tests | Passed | Duration |
| :--- | :--- | :--- | :---: | :---: | ---: |
| Smoke Suite | `tests/e2e/smoke.spec.ts` | `chromium-webgl` | 4 | 4 | 11.6 s |
| Smoke Suite | `tests/e2e/smoke.spec.ts` | `mobile-tablet` | 4 | 4 | 8.5 s |
| Dice Roller | `tests/e2e/dice-roller.spec.ts` | `chromium-webgl` | 1 | 1 | 13.6 s |
| Dice Roller | `tests/e2e/dice-roller.spec.ts` | `mobile-tablet` | 1 | 1 | 26.9 s |
| User Journeys | `tests/e2e/user-journeys.spec.ts` | `chromium-webgl` | 4 | 4 | 4.4 s |
| User Journeys | `tests/e2e/user-journeys.spec.ts` | `mobile-tablet` | 4 | 4 | 6.0 s |
| **Total** | **3 Spec Files** | **2 Projects** | **18** | **18 (100%)** | **48.6 s** |

**Verified User Flows:**
- Core application boot, dashboard telemetry, and route transitions.
- Tactical Stage (VTT) WebGL canvas mounting, 2D/3D viewport switching, and token selection.
- Screen reader accessibility companion feed mounting (`[aria-label^="Tactical Accessibility Feed"]`).
- Persona Folio roster navigation, vital stat healing, and Bastion drawer toggle.
- Omnicortex DBM compendium searching and category filtering.
- DiceRollerDock interaction, formula submission, 2d10 dice evaluation, and telemetry event generation.
- WebGL context loss recovery sentinel detection and diagnostic reporting.

### 7.4 TypeScript Static Typecheck (`npm.cmd run lint`)

```powershell
npx.cmd tsc --noEmit
```

- **Status:** Clean execution, exit code 0.
- 0 TypeScript compiler errors, 0 invalid module resolution imports.

### 7.5 Production Build (`npm.cmd run build`)

```powershell
tsc && vite build
```

- **Build Duration:** 4.64 s.
- **Transformed Modules:** 4,315 modules.
- **PWA Service Worker:** `dist/sw.js` and `dist/workbox-835c8c05.js` generated.
- **Precache Manifest:** 12 entries (6,195.20 KiB total).

**Top Production Asset Bundles (≥ 500 kB):**

| Bundle Chunk | Size | gzip Size | Role / Contents |
| :--- | ---: | ---: | :--- |
| `data-compendium-seed-D44Xtj9J.js` | 4,577.39 kB | 1,425.62 kB | Complete Omnicortex compendium seed dataset |
| `folio-bastion-drawer-C5Iei71e.js` | 1,176.89 kB | 329.91 kB | BASTION tactical combat drawer & action point manager |
| `vendor-codex-studio-DFt2du5H.js` | 1,029.50 kB | 229.54 kB | Codex studio rendering engine and editors |
| `StoryModule-BvBzQi95.js` | 944.61 kB | 219.41 kB | Story Foundry graph editor & narrative nodes |
| `data-omnicortex-misc-BycqPu58.js` | 683.75 kB | 176.80 kB | Miscellaneous Omnicortex tables & catalogs |
| `index-OBgZW2-Y.css` | 579.83 kB | 56.80 kB | Compiled Tailwind CSS utility bundle |
| `vendor-three-CtCO1WZU.js` | 570.02 kB | 144.12 kB | Three.js WebGL/WebGPU 3D rendering library |
| `TripartiteStageView-B7b35X_y.js` | 566.77 kB | 146.45 kB | Tripartite VTT layout and multi-rail controls |
| `data-species-traits-D-N-eNSA.js` | 557.98 kB | 51.38 kB | Species trait definitions and modifiers |
| `vendor-pixi-DNSUYshx.js` | 523.57 kB | 150.70 kB | PixiJS v8 2D canvas and WebGPU compositor |
| `vendor-livekit-Dnjh7Tpf.js` | 514.48 kB | 133.41 kB | LiveKit real-time audio/video & cursor sync |

---

## 8. Defect Remediation & Hardening Audit

| Target Area | Defect / Vulnerability Identified | Remediation Applied | Verification |
| :--- | :--- | :--- | :---: |
| **Semantic HTML** | Nested `<main>` tag inside `DBMContainer.jsx` violated single-main rule | Replaced `<main>` with `<section>` in `DBMContainer.jsx` | Playwright DBM test passed (6.4s) |
| **Graphics Pipeline** | Unhandled exception `Cannot read properties of undefined (reading 'add')` in `StageView.tsx` | Added null guard `if (app?.ticker)` around ticker addition | Zero uncaught page crashes on VTT mount |
| **E2E Flakiness** | Immediate bounding box query failed during canvas reflow | Replaced with `expect(...).toPass({ timeout: 10000 })` polling | Canvas mount test passed in 9.8s |
| **Firestore Security** | Missing rules for `system_settings` and `lft_personas` | Added explicit `match` blocks and admin/owner write restrictions | Verified in `firestore.rules` (47 blocks) |
| **Data Integrity** | Typo in The Magus essential skills (`"Dimension)"`) | Corrected to `"Dimension"` in `archetypesData.js` | 390/390 (100.0%) skill resolution |

---

## 9. Reproducing Verification Commands

To reproduce the complete audit and verification suite locally:

```powershell
cd "D:\_ Data\Tangent SF RP\TANGENT SF RP react project"

# 1. Execute Antigravity App Inspector standalone self-test
node scripts/mcp-app-inspector.mjs --test

# 2. Run engine unit tests and data integrity validation
npm.cmd test

# 3. Perform static TypeScript type checking
npm.cmd run lint

# 4. Execute full Playwright E2E integration test suite
npx.cmd playwright test

# 5. Compile production build and verify bundle sizes
npm.cmd run build
```

---
*Report generated and validated via the Antigravity `app-inspector` toolset.*
