# HANDOFF SPEC: [Short Feature or Fix Title]

- **Project:** Tangent SF RP
- **Drive Handoff Hub:** My Drive/_ANTIGRAVITY (Folder ID: 1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd)
- **Workspace Root:** d:\_ Data\Tangent SF RP
- **App / Git Repo Root:** d:\_ Data\Tangent SF RP\TANGENT SF RP react project
- **Target Git Branch:** [e.g., feat/handoff-update or main]
- **Date:** [YYYY-MM-DD]
- **Status:** READY_FOR_AGENT

---

## 1. Objective Summary
[1 to 3 sentences stating the exact outcome required and why this change is being made.]

## 2. Context and Architectural Guardrails
- **Framework / Stack Rules:** React 19, Vite 8, TypeScript (mixed JSX/TSX), Tailwind CSS v4, PixiJS v8 / Three.js rendering constraints, Zustand v5 stores, Firebase v12 (Firestore/Storage/Functions), LiveKit/Yjs realtime sync, Zod v4 schemas. In Story Foundry, refer to UI panels, modules, sub-components, widgets, and tools as **elements**.
- **Data & State Boundaries:** [List affected Zustand stores (e.g., `src/pages/Foundry/store/adeStore.ts`, VTT/stage stores), React Contexts (`CampaignContext`, `DBMContext`), Firestore collections, or canonical data bundles.]
- **Explicit Constraints:**
  - Keep all documentation, formulas, units, and logs in 100 percent plain-text Markdown without LaTeX delimiters.
  - Run all `git`, `npm`, `node`, `vitest`, `playwright`, and `firebase` commands from `TANGENT SF RP react project`.
  - Any `firestore.rules` edit must be delegated to `firestore-rules-author` and verified with `npm run test:security`.
  - [Add task-specific rules decided in Gemini Chat]

## 3. Actionable File Targets
All relative paths below are relative to `TANGENT SF RP react project/` unless prefixed with workspace-root paths.

### Create
- `src/path/to/new-file.ts` — [Purpose, exported functions/elements, and expected inputs/outputs]

### Modify
- `src/path/to/existing-file.tsx` — [Specific functions, UI elements, store actions, or logic to update]

### Read-Only / Protected Paths (Do Not Modify)
- `.env`, `functions/.env`, `.firebaserc` — Environment secrets and Firebase project config
- `firestore.rules`, `storage.rules` — Security rules (do not alter unless explicitly scoped above)
- `docs/game_rules/**` — Canonical BASTION / Tangent SF RP rules SSOT
- `src/pages/Foundry/ElementForge/elementSchemas.js` — Canonical Story Foundry element schemas (reference only unless explicitly scoped)
- `../tangent archive/**` — Historical archive (read-only)
- [Add any task-specific protected paths]

## 4. Execution Sequence and Acceptance Criteria
1. [Step 1: e.g., Scaffold data types, Zod schemas, or Zustand store actions]
2. [Step 2: e.g., Wire UI elements or service integration]
3. [Step 3: e.g., Run Tangent SF RP verification checks and confirm zero regressions]

**Verification Check (run in `TANGENT SF RP react project`):**
- Command / Test: `[Choose applicable: npm run lint | npm run typecheck:strict | npm run build | npm test | npm run test:stores | npm run test:security | npm run test:e2e:smoke]`
- Expected Signal: [Observable UI behavior, passing test counts, or clean exit code 0]

---

## 5. Agent Completion Log (Filled by Antigravity)
- **Completed Timestamp:** [Pending]
- **Agent / Model:** [Pending]
- **Files Created or Modified:**
  - [Pending]
- **Verification Results:**
  - [Pending]
- **Open Questions / Next Pass for Gemini Chat:**
  - [Pending]
