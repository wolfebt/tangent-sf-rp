# Tangent SF RP — Application Inspector State Report

| | |
| :--- | :--- |
| **Generated** | 2026-11-10 06:55 (-06:00) |
| **App root** | `D:\_ Data\Tangent SF RP\TANGENT SF RP react project` |
| **Git HEAD** | `main` @ `3cab6c54` (HEAD) |
| **Canonical Rules SSOT** | `docs/game_rules` (318 canonical Markdown files across `operator/` and `architect/`) |
| **Omnicortex SSOT** | `src/data/omnicortex` (15 hydrated entity domains · 1,561 1-to-1 verified Markdown & JS bundle records) |
| **Verification Suite** | `node scripts/validateDataIntegrity.mjs` (**83/83 passed, 100%**), Engine & Unit Suites (**731+ passed, 100%**), Playwright E2E (**26/26 passed, 100%**), `npm.cmd run lint` / `tsc --noEmit` (**clean, 0 errors**) |

> [!NOTE]
> This report reflects the live production state of `tangent-sfr` as of November 10, 2026 (`3cab6c54`), following the canonical `docs/game_rules` Single Source of Truth (SSOT) migration, 100% Omnicortex Markdown-to-Bundle body hydration, 5-stage Guided Element Forge deployment, ADE-to-Cortex Asset Bridge consolidation, and itemized EUFT property build cost validation.

---

## 1. Executive Summary

| Category | Result | Notes |
| :--- | :--- | :--- |
| **Runtime** | Node `v24.18.0`, `win32 x64`, ESM | `tangent-sfr` v1.0.0 · React 19.2 · PixiJS v8 · Konva 10 · Three.js · Firebase 12 · Zod 4 |
| **Git Baseline** | `main` @ `3cab6c54` | Includes full November 2026 SSOT rulebook & Omnicortex synchronization, Guided Element Forge, Weaver Graph, and EUFT Cost Validator |
| **Rulebook Vault (`docs/game_rules`)** | ✅ **318 / 318 Canonical Files** | Protected SSOT vault (`operator/` & `architect/`) with Vite hot-reload watcher and BASTION RAG indexing |
| **Data Integrity Suite (`test:data`)** | ✅ **83 / 83** (100.0%) | 18 bundle count checks + 30 relational cross-reference checks + 6 modifier checks + 7 cost checks + 7 BASTION mechanics checks + 15 SSOT `.md <-> Data.js` 100% body hydration checks |
| **Co-located & Engine Tests (`test:engine`)** | ✅ **731+ Passed** (100.0%) | Complete coverage of 2d10 AST dice, BASTION combat, EUFT property valuation, Marching Squares, PCG algorithms, and VTT exporters |
| **Playwright E2E Suite (`test:e2e`)** | ✅ **26 / 26 Passed** | Verified across `chromium-webgl` and `mobile-tablet` (`smoke.spec.ts`, `user-journeys.spec.ts`, `dice-roller.spec.ts`, `accessibility-and-pwa.spec.ts`, `canvas-visual-regression.spec.ts`) |
| **Static Typecheck & Build** | ✅ **Pass** (`tsc && vite build`) | 0 TypeScript compilation errors; clean Vite Rollup `manualChunks` production bundle |

---

## 2. Key Architectural Milestones Landed (Oct – Nov 2026)

1. **Canonical Rulebook Vault & SSOT Markdown Pipeline (`4d9c1a5f`, `e1cebd17`, `82fd48a8`):**
   - Migrated all 318 canonical rulebooks into `docs/game_rules/` (`operator/` and `architect/`).
   - Established 1-to-1 parity between `src/data/omnicortex/<category>/*.md` and compiled runtime bundles (`src/data/*Data.js`), verified across all **1,561** records (`84` species, `42` factions, `11` origins, `13` occupations, `100` archetypes, `241` features, `106` weaponry, `52` armoring, `56` gear, `90` mecha, `19` architecture, `16` other_property, `208` augmentations, `137` invocations, and `266` CRISP visual synthesis matrices).
2. **Itemized Property Build Cost Validator & EUFT Formula Sync (`3cab6c54`, `a853a94e`):**
   - Implemented deterministic itemized property build cost validation, EUFT formula synchronization (`Value = 10 * 4^(Base_5_CR / 5) * Linear Micro-Modifier`), and bottom-rail valuation telemetry cards across Codex, DBM, and Persona Folio.
   - Consolidated personal property taxonomy (`weaponry`, `armoring`, `gear`, `augmentations`, `mecha`, `architecture`, `other_property`) and hardened custom persistence against seed overwrites.
3. **5-Stage Guided Element Forge & ADE Asset Bridge Consolidation (`ceecb224`, `58f2eb22`, `6e39bd42`):**
   - Introduced the 5-stage Guided Element Forge with AI playbooks and `adeStore` integration.
   - Consolidated the Cortex-to-ADE Asset Bridge (`src/services/cortexAdeAssetBridge.js`) with automatic CRISP Visual Synthesis descriptor embedding, upgraded the Visual Story Weaver graph, and modernized the Artist Hub framework (`HIFI CHROMA` & `HI-FI SKETCH`).
4. **Persona Folio & DBM Wiki Experience Refinements (`b7bf3463`, `c53cc2ba`):**
   - Standardized Persona Folio navigation (`Catalog` vs. `Active Folio` tabs), stripped internal discrepancy ledgers from user-facing DBM Wiki views, and enhanced Operator/Architect perspective pill styling.

---

## 3. NPM Scripts & Verification Commands

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `vite` | Local development server with `docs/game_rules` hot-reload watcher |
| `build` | `tsc && vite build` | Production TypeScript verification and Vite bundle compilation |
| `typecheck` / `lint` | `tsc --noEmit` | Static TypeScript & ESM validation |
| `build:data` | `node scripts/buildAllBundles.mjs` | Rebuilds all Omnicortex & Compendium JS/JSON bundles from SSOT Markdown |
| `sync:staging` | `node scripts/ingestStagedMarkdown.mjs` | Ingests staged Markdown dropzone updates into SSOT vaults |
| `test:data` | `node scripts/validateDataIntegrity.mjs` | Runs all 83 relational, cost, BASTION, and SSOT hydration integrity checks |
| `test:engine` | `node --test "tests/engine/*.test.mjs" "src/engines/__tests__/*.test.js" "src/services/*.test.mjs" "src/schemas/*.test.mjs"` | Executes engine, service, and schema unit test suites |
| `test` | `npm run test:engine && node scripts/validateDataIntegrity.mjs` | Full unified regression test suite |
| `test:e2e` | `playwright test` | End-to-end Playwright browser verification across desktop & tablet profiles |

---

## 4. Documentation Directory Structure (`docs/`)

Following the November 2026 repository cleanup and compression-safety audit, `docs/` is organized cleanly with zero leading dashes (`-`) or non-ASCII filename characters:

```text
TANGENT SF RP react project/docs/
├── game_rules/                              <-- Canonical Rulebook SSOT Vault (318 files — DO NOT MODIFY)
├── plan/
│   ├── MAP_GEN_WORKFLOW_CHECKLIST.md        <-- Cartography & Map Generation Integration Matrix
│   └── MASTER_IMPLEMENTATION_PLAN.md        <-- Canonical ADE Cartography & PCG Implementation Plan
├── 2d10 Analysis.md                         <-- 2d10 Resolution Engine & Triangular Probability Analysis
├── APP_INSPECTOR_STATE_REPORT.md            <-- Current Application Inspector & Verification Report
├── HIFI CHROMA.md                           <-- HIFI CHROMA, HI-FI SKETCH & CRISP Visual Prompt Framework
└── TILE_SPECIFICATIONS_AND_REQUIREMENTS.md  <-- Multi-Scale Tile, Marching Squares & .dd2vtt Specification
```
