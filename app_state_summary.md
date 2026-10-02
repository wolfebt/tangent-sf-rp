# Live Application State Summary (Pre-Flight Manifest)
*Generated at: 2026-10-01T17:47:04.598Z*

## 1. Environment & Runtime
- **Application:** `tangent-sfr` v`1.0.0`
- **Node Version:** `v24.18.0`
- **Git Branch:** `main` (Has Uncommitted Changes: `true`)

## 2. Route Topology
- **Top-Level React Routes:** 29 registered in `src/App.jsx`
- **Story Foundry Sub-Routes:** 29 registered in `FoundryApp.jsx`
- **Total Page Modules:** 131 components cataloged under `src/pages/`

## 3. Schemas & Models
- **Canonical Element Schemas:** `src/pages/Foundry/ElementForge/elementSchemas.js` (38274 bytes)
- **Firestore Rules:** `firestore.rules` (11540 bytes)
- **Total Model/Schema Files Detected:** 20

## 4. Working Tree Status
```text
 ade_comprehensive_review.md                        |  614 -------
 docs/ADE_Comprehensive_Review.md                   |  614 -------
 docs/teams-comms-review.md                         |  118 --
 package-lock.json                                  | 1117 +++++++++++-
 package.json                                       |    2 +
 src/App.jsx                                        |   56 +-
 src/components/Chat/CommsVttPanel.jsx              |    2 +-
 src/components/Folio/FolioContainer.jsx            |   48 +-
 src/components/Folio/FolioSidebar.jsx              |  400 ++--
 .../Folio/augmentations/AugmentationsManager.jsx   |  342 +---
 src/components/Folio/modals/EconomyModal.jsx       |   25 +-
 src/components/Folio/shared/FolioTooltip.jsx       |   81 +
 src/components/Folio/tabs/CombatTab.jsx            |  304 ++--
 src/components/Folio/tabs/CoreStatsTab.jsx         |   42 +
 src/components/Folio/tabs/FeaturesTab.jsx          |   57 +-
 src/components/Folio/tabs/IdentityTab.jsx          | 1921 +++++++++++++-------
 src/components/Folio/tabs/SkillsTab.jsx            |  820 +++++----
 src/components/Folio/views/TacticalPlayView.jsx    |   30 +-
 src/components/Layout/GlobalSideRail.jsx           |    2 +-
 src/components/Layout/hud/ADEHUDBar.jsx            |   45 +-
 .../StoryFoundry/Cronicle/CronicleDeckModal.jsx    | 1189 ++----------
 src/components/VTT/StageView.tsx                   |  297 +--
 src/components/VTT/TripartiteStageView.tsx         |   36 +-
 .../VTT/stage/
```

> [!NOTE]
> To generate the full AI synthesis with Gemini 2.5 Pro, configure `GEMINI_API_KEY` in your environment or `.env` and re-run `node scripts/extract-app-context.mjs`.