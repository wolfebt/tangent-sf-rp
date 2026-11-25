---
trigger: always_on
description: Two-way Google Drive handoff protocol bridging Gemini Chat specs with Antigravity agents for Tangent SF RP via the _ANTIGRAVITY folder.
---

# Google Drive Bridge Rule (_ANTIGRAVITY — Tangent SF RP)

## Standing Instruction
Before executing new feature tasks (or whenever asked to check the latest handoff spec), automatically query the `_ANTIGRAVITY` Google Drive folder (`1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd`) via `gdrive readonly ls 1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd` for the matching `TANGENT_` project spec—never ask the user to paste the folder ID again. When finished with the task and verification checks, write an execution summary back to the spec's **Agent Completion Log** (or output the full Markdown block in chat if Drive write access is not authorized) and update its `Status`.

## 1. Shared Handoff Hub & Workspace Mapping
- **Drive Location:** Root folder named `_ANTIGRAVITY` in Google Drive (`My Drive/_ANTIGRAVITY`), Folder ID: `1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd`.
- **Lookup Rule:** Query Folder ID `1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd` directly (`gdrive readonly ls 1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd`) without searching by name or asking the user for the ID again. Only fall back to `gdrive readonly search --name-exact "_ANTIGRAVITY"` (verifying `My Drive` root parent) if that ID fails.
- **Tooling (CLI, not MCP):** Access Google Drive and Google Docs using the installed `gdrive` and `gdocs` plugin CLIs (run `<skill>/scripts/gdrive.cmd --version` or `gdocs.cmd --version` once per session if not on PATH, then invoke bare `gdrive` / `gdocs`). Use `gdrive readonly ...` for discovery, listing, downloading uploaded `.md` files, or exporting Google Docs; use `gdocs readonly read <DOC_ID>` for native Google Docs.
- **Project Prefix Mapping:** Match handoff documents strictly to the active Tangent SF RP prefix:
  - `TANGENT_` for Tangent SF RP tasks (e.g., `TANGENT_HANDOFF.md`, `TANGENT_HANDOFF`, `TANGENT_SPEC.md`, `TANGENT_REVIEW.md`).
  - Ignore handoff files belonging to other projects (e.g., non-`TANGENT_` prefixes).
- **Separation from Canonical Lore/Rules Drive Folders:** `_ANTIGRAVITY` is the active engineering handoff hub. Do not confuse it with the read-only canonical game-rules Drive archives documented in `.agents/skills/bastion-arbiter/references/drive-routing-and-crisp.md` (Primary `/game_rules`: `1ODaKql4LvEyTj_z8RxvPSlFrqRYsKHQS`, `/rules_archive`: `11f-YEfzysnmNlMSy-2XaYZuOE9S7V4FA`, `_ _ TANGENT RP CODEX _ _`: `1MqtYtmVOpSq6vCl7iwkGQRFN66vufIPj`). Never mutate canonical rules folders.
- **Local Workspace & Git Topology:**
  - Antigravity Workspace Root (non-Git): `d:\_ Data\Tangent SF RP`
  - Application & Git Repository Root: `d:\_ Data\Tangent SF RP\TANGENT SF RP react project`
  - Run all `git`, `npm`, `node`, `firebase`, `vitest`, and `playwright` commands inside `TANGENT SF RP react project`.
  - Keep `.agents/rules/drive-bridge.md` mirrored between the workspace root and the React repo root if updated.

## 2. Pre-Execution Intake Protocol
When instructed to check the latest handoff, pull a Gemini Chat spec, or begin a feature with a matching `TANGENT_` document in `_ANTIGRAVITY`:
1. **Fetch Full Handoff:** List `My Drive/_ANTIGRAVITY` directly with `gdrive readonly ls 1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd` and read the complete content of the matching `TANGENT_*` handoff file (`gdrive readonly download` for `.md` or `gdocs readonly read` / `gdrive readonly export --format md` for native Docs) before modifying any local code.
2. **Verify Git Branch & Working Tree Hygiene:** Inspect `git -C "d:\_ Data\Tangent SF RP\TANGENT SF RP react project" status -sb` and confirm the active branch matches the handoff's **Target Git Branch**. If unrelated uncommitted changes exist on the current branch, STOP and confirm with the user before switching branches, stashing, or editing overlapping files.
3. **Respect Protected Paths & Domain Conventions:**
   - Never edit, move, or reformat any path listed under **Read-Only / Protected Paths** in the handoff without explicit user approval in chat.
   - Default Tangent SF RP protected / restricted paths unless explicitly scoped in the handoff:
     - `.env`, `functions/.env`, `.firebaserc` (credentials and project bindings)
     - `firestore.rules`, `storage.rules` (security rules; any Firestore rules edit MUST be delegated to the `firestore-rules-author` subagent and verified with `npm run test:security`)
     - `docs/game_rules/**` (canonical BASTION / Tangent SF RP rules SSOT)
     - `src/pages/Foundry/ElementForge/elementSchemas.js` and `scripts/syncMasterCanonicalCompendium.mjs` (canonical schemas and compendium sync pipeline)
     - `tangent archive/**` (historical archive)
   - Follow Story Foundry terminology: UI panels, modules, sub-components, widgets, and tools in Story Foundry are referred to as **elements**.
4. **Pre-Edit Summary:** Summarize the parsed file targets, protected boundaries, and acceptance/verification criteria in 3 to 5 concise lines before executing multi-file edits.

## 3. Formatting and Output Guardrails
- Use 100 percent plain-text Markdown for all technical notes, formulas, units, and logs. Never insert LaTeX math delimiters.
- Never truncate code blocks or redact file paths in status reports or completion logs.

## 4. Post-Task Completion Log
After implementation and Tangent SF RP verification checks pass (e.g., `npm run lint`, `npm run build`, `npm test`, or handoff-specified Vitest/Playwright/security suites inside `TANGENT SF RP react project`):
- Write an execution summary (completed timestamp, agent/model, files created or modified, verification results, and open questions) back to the **Agent Completion Log** section at the bottom of the active `TANGENT_` spec in `_ANTIGRAVITY` (`1-Zg5nFK6iRaXhq8mYbsytXUrsCkw0tLd`) if the user has authorized Drive writes (`gdrive mutate update` for `.md` files or `gdocs mutate` for native Google Docs), OR output the completed Markdown log block directly in chat so it can be pasted back into Drive for Gemini Chat review.
- Update the document `Status` field from `READY_FOR_AGENT` to `COMPLETED` (or `BLOCKED` with exact unredacted error output if a check fails).
