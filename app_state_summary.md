# Live Application State Summary (Pre-Flight Manifest)
*Generated at: 2026-10-03T02:54:40.587Z*

## 1. Environment & Runtime
- **Application:** `tangent-sfr` v`1.0.0`
- **Node Version:** `v24.18.0`
- **Git Branch:** `main` (Has Uncommitted Changes: `true`)

## 2. Route Topology
- **Top-Level React Routes:** 29 registered in `src/App.jsx`
- **Story Foundry Sub-Routes:** 29 registered in `FoundryApp.jsx`
- **Total Page Modules:** 139 components cataloged under `src/pages/`

## 3. Schemas & Models
- **Canonical Element Schemas:** `src/pages/Foundry/ElementForge/elementSchemas.js` (38274 bytes)
- **Firestore Rules:** `firestore.rules` (11540 bytes)
- **Total Model/Schema Files Detected:** 20

## 4. Working Tree Status
```text
 src/context/ChatContext.jsx | 28 ++++++++++++++--------------
 src/main.jsx                | 21 ++++++++++++---------
 src/pages/Home.jsx          | 10 +++++-----
 3 files changed, 31 insertions(+), 28 deletions(-)

```

> [!NOTE]
> To generate the full AI synthesis with Gemini 2.5 Pro, configure `GEMINI_API_KEY` in your environment or `.env` and re-run `node scripts/extract-app-context.mjs`.