# 🛠️ TANGENT SF RP — Platform Operations, Functionality & Usability Recommendations Report
**Audit Date:** October 3, 2026  
**Document Version:** `2026.10-REV2 (Comprehensive Edition)`  
**Parent Reviews:** Master Feature Inventory (`00`), FOLIO (`01`), RULES (`02`), CORTEX (`03`), ADE (`04`), TEAMS (`05`), COMMS (`06`)  
**Target Codebase:** `d:/_ Data/Tangent SF RP/TANGENT SF RP react project`  
**Overall Platform Readiness:** **88.2% Complete** — Candidate for v1.0.0-rc1 Release  
**Test Suite Status:** 247 / 247 Passing (100.0%) | Production Build: 9.84s (4,250 modules)

---

## 1. Executive Summary & Architectural Posture

This master recommendations report provides an exhaustive, forensic technical evaluation of the **Tangent Science Fantasy Roleplay (TANGENT SF RP)** application. Grounded in live codebase inspection, automated unit tests, and production build telemetry, this audit covers **every system module and individual component** across three core axes:

1. **Operations:** State lifecycles, network sync, offline caching, build footprint, memory pressure, and serverless infrastructure.
2. **Functionality:** Adherence to BASTION rules, edge-case resilience, validation schemas, and cross-module event bridging.
3. **Usability & Professional Standards:** Ergonomic friction, visual hierarchy, micro-text legibility, touch targets, keyboard navigation, Nielsen heuristics, and WCAG 2.2 AA accessibility.

```mermaid
quadrantChart
    title Platform Architectural & Usability Health Matrix
    x-axis Low Usability / High Friction --> High Usability / Professional Polish
    y-axis High Technical Debt / Monolith --> Clean Modular Architecture
    quadrant-1 Enterprise Ready / Golden Standard
    quadrant-2 Modular but Low Polish
    quadrant-3 Critical Vulnerability Zone
    quadrant-4 Monolith with High Polish
    "TEAMS (Squad Workstation)": [0.92, 0.95]
    "RULES (Compendium & RAG)": [0.88, 0.88]
    "COMMS (Voice & CommLink)": [0.86, 0.78]
    "CORTEX (Omnicortex DBM)": [0.78, 0.72]
    "ADE (Story Foundry & Stage)": [0.74, 0.45]
    "FOLIO (Character Manager)": [0.82, 0.35]
```

---

## 2. Operational & Infrastructure Deep Dive

### 2.1 Build Health & Bundle Chunk Telemetry
The application builds with Vite 8.1.5 and Rolldown in **9.84 seconds**. However, static analysis of the output bundle exposes severe chunk weight imbalances:

| Chunk Name | Output Size | Gzip Size | Analysis & Root Cause |
|---|:---:|:---:|---|
| `AuthContext-BYiyQUQu.js` | **6,748.48 kB** | **1,815.39 kB** | **CRITICAL ANOMALY:** Mounts at the root of `main.jsx`. Static imports of default species, features, and compendium seeds are hoisted into the initial auth payload. |
| `AssetStudio-oKuw8s3Y.js` | **1,272.31 kB** | 318.15 kB | Heavy canvas drawing tools and asset matrices bundled in single chunk. |
| `FolioContainer-D44iJPZ3.js`| **1,182.35 kB** | 233.96 kB | Large monolithic modal dialogs statically imported into the Folio shell. |
| `sessionRecapService-CkvgmU1y.js` | **1,042.05 kB** | 277.59 kB | AI recap parsing libraries and large prompt template registries. |
| `StoryModule-CrcSLCXx.js` | **565.51 kB** | 135.53 kB | 7 ADE workspaces bundled together; needs route-level code-splitting. |
| `MapMaker-D2geOrAj.js` | **439.35 kB** | 106.28 kB | Battlemap toolbars, landmass generators, and texture assets. |
| `index-DaDa-DMg.css` | **511.65 kB** | 51.42 kB | Monolithic Tailwind utility bundle; needs PurgeCSS optimization. |

#### Actionable Remediation: The 6.75 MB Chunk Purge
- In [`src/main.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/main.jsx) and [`src/context/AuthContext.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/context/AuthContext.jsx), eliminate any static imports of `speciesData.js`, `featuresData.js`, `compendiumSeed.json`, or `tangentConstants.js`.
- Move these datasets behind dynamic `import()` boundaries inside `DBMContext` and `FolioContext` so they are only fetched when navigating to `/folio` or `/dbm`. This will reduce the initial authentication chunk from **6.75 MB to under 450 kB**.

### 2.2 Continuous Integration & Testing Posture
- **Engine Test Suite:** **247 passing tests across 11 suites (100.0% pass rate)** covering 2d10 formulas, sub-attributes, damage pipelines, and event bridges.
- **CI/CD Gap:** The `.github/workflows/` directory only contains `firebase-deploy.yml`. No automated workflow runs `cmd /c npm test` or `npm run typecheck` on pull requests.
- **Remediation:** Deploy `.github/workflows/ci.yml` with strict branch protection rules requiring 100% test pass on PRs into `main`.

### 2.3 Cloud Function Security Deficiencies
Inspection of [`functions/index.js`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/functions/index.js) reveals two severe vulnerabilities:
1. **Unauthenticated `getLiveKitToken`:** Declared via `functions.https.onRequest` with CORS wildcard `*`. Does not verify caller user ID tokens, permitting anyone on the internet to generate valid JWTs for arbitrary rooms.
2. **Unauthenticated `geminiProxy`:** Relays prompts to Google Generative Language APIs using the server's master key without checking caller identity, risking quota exhaustion.
3. **Client-Side Secret Exposure Risk:** [`livekitTokenService.js#L78`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/services/livekitTokenService.js#L78) retains an HMAC-SHA256 client signing fallback referencing `VITE_LIVEKIT_API_SECRET`.

---

## 3. Usability & Professional Standards Deep Dive

### 3.1 Platform-Wide Native Dialog Elimination (84 Call Sites)
A comprehensive static audit identified **84 call sites** still using native browser `window.alert()`, `window.confirm()`, or `window.prompt()`. These calls freeze the single JavaScript execution thread, violate PWA mobile guidelines, and break the cyberpunk visual immersion:

| Module / Scope | File | Count | Operation | Remediation Strategy |
|---|---|:---:|---|---|
| **CORTEX** | [`DBMContainer.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/DBMContainer.jsx) | **14** | Delete entry, clear cache, import JSON | Replace with `useConfirm()` + `useToast()` |
| **CORTEX** | [`ArchitectDevFieldsModal.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/ArchitectDevFieldsModal.jsx) | **9** | Schema validation errors | Replace with inline form field error chips |
| **FOLIO** | [`GuidedCreatorModal.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/Folio/modals/GuidedCreatorModal.jsx) | **6** | Cancel creation, point deficit | Replace with styled step confirmation alerts |
| **COMMS** | [`ChannelSettingsModal.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/Chat/ChannelSettingsModal.jsx) | **6** | Delete channel, kick member | Replace with `useConfirm({ variant: 'danger' })` |
| **FOLIO** | [`FolioContainer.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/Folio/FolioContainer.jsx) | **4** | Delete persona, public clone | Replace with `confirmTypedDeletion()` |
| **ADE** | [`StageBreadcrumbTabs.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/stage/StageBreadcrumbTabs.tsx) | **4** | Discard unsaved map tabs | Replace with modal confirmation |
| **ADE** | [`GMInspector.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/cockpit/GMInspector.tsx) | **3** | Remove stage tokens | Replace with `useConfirm()` |
| **ADE** | [`useCombatController.ts`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/hooks/useCombatController.ts) | **3** | Turn transition notifications | Replace with `useToast()` audio banners |
| **OTHER** | 27 Other Component Files | **35** | Miscellaneous edge cases | Replace with `useToast()` |

### 3.2 Accessibility (WCAG 2.2 AA) & Visual Hierarchy
- **Typography & Micro-Text:** Multiple components (e.g., `FolioSidebar`, `CatalogOutliner`, `MessageView`) utilize ultra-small font sizes (`text-[9px]` or `text-[10px]`). On high-DPI displays and mobile screens, these labels fail minimum legibility standards. All micro-text should be standardized to a minimum of `text-[11px]` with high-contrast text shades (`slate-200` or `cyan-300`).
- **Touch Target Sizes:** While the `MobileBottomNav` properly enforces $48\times 48\text{px}$ touch targets, tactical stage token radial menus have touch targets of $32\times 32\text{px}$, causing mis-clicks on mobile tablets.
- **Keyboard Trapping & Shortcuts:** Global shortcuts (`Ctrl+K`, `Alt+D`, `Alt+C`, `Alt+S`, `[`, `]`) operate reliably. Focus-trapping in modals is robust, and `Escape` dismisses overlays cleanly.

---

## 4. Component-by-Component Deep Dive Directory

The following directory provides an exhaustive audit of **60 key platform components** across operations, functionality, and usability:

```
Directory Index:
[01-05] Global Navigation & Hub Shell
[06-19] Folio Character Management
[20-25] Rules & Compendium Adjudication
[26-35] Omnicortex DBM & Codex Matrices
[36-47] ADE, Story Foundry & Stage VTT
[48-52] Game Teams & Tactical Squads
[53-60] Comms, Chat, Voice & Broadcasts
```

---

### [01–05] Global Navigation & Hub Shell

#### 01. `GlobalHUD.jsx` (`src/components/Layout/GlobalHUD.jsx`)
- **Operations:** Subscribes to route changes (`useLocation`), `ChatContext` unread counters, and `FolioContext` active character.
- **Functionality:** Dynamically renders route-specific sub-bars (`FolioHUDBar`, `ADEHUDBar`, `CommsHUDBar`); coordinates tool docks.
- **Usability & Standards:** Grade: **A-**. 52px height is compact and elegant. Quick-actions for dice (`Alt+D`), comms (`Alt+C`), and command palette (`Ctrl+K`) work flawlessly. Cache clear action provides user confirmation.

#### 02. `GlobalSideRail.jsx` (`src/components/Layout/GlobalSideRail.jsx`)
- **Operations:** Persistent guidance rail on desktop screens ($\ge 640\text{px}$); zero network overhead.
- **Functionality:** Navigates between the 6 core modules (FOLIO, RULES, CORTEX, ADE, TEAMS, COMMS) with route pattern matching.
- **Usability & Standards:** Grade: **A**. Color-coded icon indicators, hover tooltips, and glowing amber unread pulse for incoming comms.

#### 03. `MobileBottomNav.jsx` (`src/components/Layout/MobileBottomNav.jsx`)
- **Operations:** Mounts exclusively on `<sm` viewports (`className="sm:hidden"`). Subscribes to `ChatContext`.
- **Functionality:** 7 sticky navigation triggers allowing 1-tap jumping between modules on mobile devices.
- **Usability & Standards:** Grade: **A**. $48\text{px}$ touch targets conform to WCAG 2.2 touch-target criteria; pulsing amber dot alerts users to radio messages.

#### 04. `Home.jsx` (`src/pages/Home.jsx`)
- **Operations:** Master operational dashboard (`/`). Subscribes to `CampaignContext`, `GroupContext`, and `FolioContext`.
- **Functionality:** Active campaign status card, quick character launcher, party carousel, and live transmission feed.
- **Usability & Standards:** Grade: **B+**. Visually immersive glass cockpit. Join-code input needs clearer feedback when user is unauthenticated.

#### 05. `WelcomeBriefing.jsx` (`src/components/Hub/WelcomeBriefing.jsx`)
- **Operations:** Checks `localStorage.getItem('briefing_dismissed')` on initial mount.
- **Functionality:** Interactive onboarding carousel introducing players to the 2d10 system, character creation, and VTT stage.
- **Usability & Standards:** Grade: **A**. Excellent onboarding; dismiss state persists cleanly across browser sessions.

---

### [06–19] Folio Character Management

#### 06. `FolioContainer.jsx` (`src/components/Folio/FolioContainer.jsx`)
- **Operations:** Master orchestrator hosting 5 view modes and 10 tab panes. Monolithic context subscriber.
- **Functionality:** Orchestrates character saving, roster switching, cloud sync status, and development vs. locked phase toggling.
- **Usability & Standards:** Grade: **B-**. High modal clutter (can stack up to 4 nested modals); contains 4 native `alert()`/`confirm()` calls.

#### 07. `IdentityTab.jsx` (`src/components/Folio/tabs/IdentityTab.jsx`)
- **Operations:** Subscribes to `FolioContext`. Renders 5-pillar character identity dropdowns.
- **Functionality:** Species traits, archetype pre-builds, origin backgrounds, and faction alignments cascade correctly.
- **Usability & Standards:** Grade: **A-**. Rich visual badges for species and factions. Dropdown searching is fast and responsive.

#### 08. `CoreStatsTab.jsx` (`src/components/Folio/tabs/CoreStatsTab.jsx`)
- **Operations:** Real-time calculation of 6 core attributes and 12 sub-attributes.
- **Functionality:** Enforces canonical formula `Base = 2 + (Primary * 2)`. Single-click dice rolling into the dice dock.
- **Usability & Standards:** Grade: **A**. Monospace formula badges provide transparent rules grounding. CP buy buttons respond instantly.

#### 09. `SkillsTab.jsx` (`src/components/Folio/tabs/SkillsTab.jsx`)
- **Operations:** Manages 95 canonical skills and user-created specializations.
- **Functionality:** Enforces skill rank caps (1-10); calculates iterative action thresholds.
- **Usability & Standards:** Grade: **B+**. Category filters (Physical, Mental, Social, Combat) are intuitive; deleting base skill should auto-remove orphaned specializations.

#### 10. `FeaturesTab.jsx` (`src/components/Folio/tabs/FeaturesTab.jsx`)
- **Operations:** Multi-faceted search and category filtering across 219 features and hindrances.
- **Functionality:** Tracks CP point deductions; Celestine Alterian discount bug resolved.
- **Usability & Standards:** Grade: **A-**. Detailed rule popovers explain prerequisite chains.

#### 11. `CombatTab.jsx` (`src/components/Folio/tabs/CombatTab.jsx`)
- **Operations:** Derives offensive attack blocks from equipped weaponry and defensive soak values.
- **Functionality:** Distinguishes biological (Health/Vitality) vs synthetic (Structure) vitals.
- **Usability & Standards:** Grade: **A**. Single-click damage rolling with critical hit acoustical chimes.

#### 12. `CompanionsTab.jsx` (`src/components/Folio/tabs/CompanionsTab.jsx`)
- **Operations:** Subscribes to `companionModularMatrix.js`. Manages autonomous and linked companion drones.
- **Functionality:** Biological, synthetic, and metaphysical chassis budgeting; command tether modes.
- **Usability & Standards:** Grade: **B+**. High mechanical depth; needs direct drag-to-stage deployment button.

#### 13. `CombatGearTab.jsx` (`src/components/Folio/tabs/CombatGearTab.jsx`)
- **Operations:** Inventory management, weight calculation, size-scaled encumbrance thresholds.
- **Functionality:** Equipped vs. stashed gear toggling; natural Stamina damage reduction calculation.
- **Usability & Standards:** Grade: **A-**. Encumbrance progress bar provides immediate visual overload feedback.

#### 14. `TacticalPlayView.jsx` (`src/components/Folio/views/TacticalPlayView.jsx`)
- **Operations:** Dedicated in-session tactical sheet. 2,036 lines of optimized combat controls.
- **Functionality:** One-click Light/Heavy rests, death clock countdowns, called shots, weapon attack executions.
- **Usability & Standards:** Grade: **A+**. **BEST-IN-CLASS COMPONENT**. Distraction-free, high-contrast, tactile sound effects.

#### 15. `GuidedCreatorModal.jsx` (`src/components/Folio/modals/GuidedCreatorModal.jsx`)
- **Operations:** 8-step wizard for rapid character creation. **2,900 lines of code**.
- **Functionality:** Guides concept, species, origin, occupation, attributes, tech level, skills, and review.
- **Usability & Standards:** Grade: **C+**. **ACUTE MONOLITH DEBT**. 6 native dialog calls; wizard steps should be partitioned into standalone sub-files.

#### 16. `AugmentationsManager.jsx` (`src/components/Folio/augmentations/AugmentationsManager.jsx`)
- **Operations:** 6 anatomical body slots, Stage 1-5 cybernetics and Full Body Conversion (FBC).
- **Functionality:** Calculates body capacity limits; stage compatibility validation.
- **Usability & Standards:** Grade: **A**. Body slot diagrams and diagnostics modal provide clear visual feedback.

#### 17. `PrintFolio.jsx` (`src/components/Folio/print/PrintFolio.jsx`)
- **Operations:** Renders physical multi-page printable character sheet with `@media print` CSS.
- **Functionality:** Exports complete stat blocks, skills matrix, weapon cards, and character portrait.
- **Usability & Standards:** Grade: **B+**. Excellent print layout; large skill matrices can wrap awkwardly on Safari.

#### 18. `RestRecoveryModal.jsx` (`src/components/Folio/modals/RestRecoveryModal.jsx`)
- **Operations:** Enforces canonical 4 Light Rests per 24h day limit via `folioRestRecoveryEngine.js`.
- **Functionality:** Light Rest restores Vitality; Heavy Rest restores Health and resets the daily counter.
- **Usability & Standards:** Grade: **A**. Clean countdown badges and rest history timestamps.

#### 19. `VitalsDyingModal.jsx` (`src/components/Folio/modals/VitalsDyingModal.jsx`)
- **Operations:** Governs massive damage saves (CR 15 Fortitude) and Stamina-round death clocks.
- **Functionality:** Tracks stabilization status, comatose state, and -5 AP revivification debt.
- **Usability & Standards:** Grade: **A-**. High-urgency red pulsing alert design.

---

### [20–25] Rules & Compendium Adjudication

#### 20. `CompendiumApp.jsx` (`src/pages/Compendium/CompendiumApp.jsx`)
- **Operations:** Master compendium orchestrator supporting Wiki, Omnicortex Catalog, and Split View.
- **Functionality:** Renders 202 modular compendium articles compiled from all 30 canonical rulebooks.
- **Usability & Standards:** Grade: **A**. Split view allows side-by-side inspection of rules and item records.

#### 21. `OmnicortexCatalogView.jsx` (`src/pages/Compendium/OmnicortexCatalogView.jsx`)
- **Operations:** Multi-faceted reference browser across all 60+ database categories.
- **Functionality:** High-speed keyword filtering, subtype badges, and item inspection modal triggers.
- **Usability & Standards:** Grade: **A-**. Fast search response; pagination avoids DOM lag.

#### 22. `RulesAdjudicatorPanel.jsx` (`src/components/RulesAssistant/RulesAdjudicatorPanel.jsx`)
- **Operations:** Subscribes to active Stage tokens. Computes tactical attack and defense modifiers.
- **Functionality:** Evaluates Range Brackets, Cover Geometry, Lighting, Elevation, and Flanking.
- **Usability & Standards:** Grade: **A+**. "Apply to Combat Resolver" button bridges rule theory directly into active combat.

#### 23. `RulebookAssistantModal.jsx` (`src/components/RulesAssistant/RulebookAssistantModal.jsx`)
- **Operations:** Semantic RAG query interface over 44 core tactical topics via `rulebookRagService.js`.
- **Functionality:** Formats rule citations with book title and page number; 1-click clipboard copy.
- **Usability & Standards:** Grade: **A**. Single-click broadcast sends verified rules directly to squad chat.

#### 24. `PassivePerceptionRadarModal.jsx` (`src/components/RulesAssistant/PassivePerceptionRadarModal.jsx`)
- **Operations:** Compares operative passive Alertness scores against stealth infiltration DCs.
- **Functionality:** Sweeps tactical zones and reports detected vs. hidden threats.
- **Usability & Standards:** Grade: **B+**. Great concept; needs automatic unmasking of hidden tokens on the battlemap.

#### 25. `BastionChatModal.jsx` (`src/components/DBM/BastionChatModal.jsx`)
- **Operations:** AI conversational rules assistant interfacing with `BastionAgent.ts` and Gemini.
- **Functionality:** Answers rules queries, explains combat formulas, and generates 150 BP statblocks.
- **Usability & Standards:** Grade: **A-**. Fast response times; simulated local fallback when offline.

---

### [26–35] Omnicortex DBM & Codex Matrices

#### 26. `DBMContainer.jsx` (`src/components/DBM/DBMContainer.jsx`)
- **Operations:** Master database workstation hosting 60+ categories and 2,154 records.
- **Functionality:** Category tree navigation, multi-column sorting, master JSON export/import.
- **Usability & Standards:** Grade: **C**. **HEAVY DIALOG DEBT**. 14 blocking `alert()`/`confirm()` calls degrade usability.

#### 27. `DBMTableView.jsx` (`src/components/DBM/DBMTableView.jsx`)
- **Operations:** High-density sortable table grid with column reordering.
- **Functionality:** Sorts by Name, Tech Level, Cost, Weight, and Type.
- **Usability & Standards:** Grade: **A-**. High information density; column sort preferences need `localStorage` persistence.

#### 28. `DBMWikiView.jsx` (`src/components/DBM/DBMWikiView.jsx`)
- **Operations:** Visual card grid and markdown article reader.
- **Functionality:** Renders rich media cards with tags, descriptions, and lore summaries.
- **Usability & Standards:** Grade: **A**. Immersive visual presentation with responsive column wrapping.

#### 29. `DBMItemModal.jsx` (`src/components/DBM/DBMItemModal.jsx`)
- **Operations:** Full modal record inspector. Subscribes to `FolioContext`.
- **Functionality:** Item breakdown, weapon damage profiles, transfer-to-folio bar.
- **Usability & Standards:** Grade: **A**. 1-click addition of catalog items to active character inventory.

#### 30. `ArchitectDevFieldsModal.jsx` (`src/components/DBM/ArchitectDevFieldsModal.jsx`)
- **Operations:** Granular authoring modal implementing development fields from `- ELEMENTS.md`.
- **Functionality:** 7 thematic field tabs (Identity, Ideology, Assets, Culture, Foreign, History, Notes).
- **Usability & Standards:** Grade: **C+**. Comprehensive schema compliance, but contains 9 native `alert()` calls.

#### 31. `CodexApp.jsx` (`src/pages/Codex/CodexApp.jsx`)
- **Operations:** Workstation orchestrator for specialized matrix suites (`/codex`).
- **Functionality:** Three modes: `guided` (builder), `records` (browser), `suite` (specialized dashboard).
- **Usability & Standards:** Grade: **A**. Clean modular layout with persistent sidebar.

#### 32. `EconomatrixDashboard.jsx` (`src/pages/Codex/EconomatrixDashboard.jsx`)
- **Operations:** Living economy dashboard based on 2.00 ECONOMATRIX.md.
- **Functionality:** Standard of Living brackets, currency exchange, procedural loot generation.
- **Usability & Standards:** Grade: **A-**. Fast procedural rolling; needs direct "Send Loot to Stage" button.

#### 33. `TechnologyCodex.jsx` (`src/pages/Codex/TechnologyCodex.jsx`)
- **Operations:** Tech Level matrix suite (TL0 Stone Age to TL5 Cosmic Singularity).
- **Functionality:** Defines gear progression, power requirements, and manufacturing availability.
- **Usability & Standards:** Grade: **A**. Clear visual indicators for technological eras.

#### 34. `ScalingCodex.jsx` (`src/pages/Codex/ScalingCodex.jsx`)
- **Operations:** 14-Tier volumetric scaling matrix calculator based on 1.10 SCALING.md.
- **Functionality:** Scales Damage Reduction, damage multipliers, speed, and carry weight from Diminutive to Cosmic.
- **Usability & Standards:** Grade: **A**. Verified by automated unit tests in `tangentScalingEngine.test.js`.

#### 35. `CodexIngestionEngine.jsx` (`src/pages/Codex/CodexIngestionEngine.jsx`)
- **Operations:** Batch file parser converting external markdown/JSON catalogs into live database entries.
- **Functionality:** Validates schemas, generates diff previews, and inserts records into DBMContext.
- **Usability & Standards:** Grade: **B+**. High utility; batch rollback requires manual JSON backup.

---

### [36–47] ADE, Story Foundry & Stage VTT

#### 36. `StoryModule.jsx` (`src/pages/Foundry/StoryModule/StoryModule.jsx`)
- **Operations:** Master Glass-Cockpit orchestrator hosting 7 synchronized workspace views.
- **Functionality:** Centralized Zustand state via `adeStore.ts`; module health monitoring.
- **Usability & Standards:** Grade: **A**. Instant workspace switching without page reload.

#### 37. `StoryWeaver.jsx` (`src/pages/Foundry/StoryModule/workspaces/StoryWeaver.jsx`)
- **Operations:** 3-phase narrative authoring workspace (Brainstorm, Outline, Draft).
- **Functionality:** Guidance Gems integration; auto-tagging of characters, locations, and factions.
- **Usability & Standards:** Grade: **A-**. Distraction-free prose writing; PDF export needs style refinement.

#### 38. `VisualStoryGraph.jsx` (`src/pages/Foundry/StoryModule/workspaces/VisualStoryGraph.jsx`)
- **Operations:** Node-link scenario topology editor.
- **Functionality:** Visualizes narrative branches, decision nodes, and encounter triggers.
- **Usability & Standards:** Grade: **B+**. Smooth pan/zoom; complex graphs with >50 nodes have slight canvas redraw latency.

#### 39. `ElementForge.jsx` (`src/pages/Foundry/ElementForge/ElementForge.jsx`)
- **Operations:** Worldbuilding asset forge for 7 entity types (Faction, Persona, Location, Item, Event, Concept, Organization).
- **Functionality:** Conforms to `- ELEMENTS.md`; exports/imports JSON schemas.
- **Usability & Standards:** Grade: **A**. Complete worldbuilding coverage.

#### 40. `MapMaker.jsx` (`src/pages/Foundry/MapMaker/MapMaker.jsx`)
- **Operations:** Tactical battlemap editor (**2,750 lines**). Subscribes to `MapConstants.js`.
- **Functionality:** Dual-grid (Square 5ft & Hex Cube), layer management, dynamic lighting, walls, portals.
- **Usability & Standards:** Grade: **B**. Extremely feature-rich; contains 7 native dialog calls and dense toolbars.

#### 41. `TripartiteStageView.tsx` (`src/components/VTT/TripartiteStageView.tsx`)
- **Operations:** 3-column workspace orchestrator (Catalog Rail, Stage Viewport, Cockpit Deck).
- **Functionality:** Coordinates operative vs architect perspectives; manages split 2D/3D views.
- **Usability & Standards:** Grade: **A**. Excellent structural decoupling from legacy monolithic studio.

#### 42. `StageView.tsx` (`src/components/VTT/StageView.tsx`)
- **Operations:** Primary Pixi.js canvas shell (**3,007 lines**).
- **Functionality:** Manages canvas rendering, BVH raycasts, token dragging, and radial menus.
- **Usability & Standards:** Grade: **B-**. **MAJOR ARCHITECTURAL MONOLITH**. 8 sub-hooks extracted, but overlay toolbars remain inline.

#### 43. `Stage3DViewport.tsx` (`src/components/VTT/stage/Stage3DViewport.tsx`)
- **Operations:** Three.js 3D volumetric viewport.
- **Functionality:** Extruded 3D walls, dynamic shadows, 3D billboard tokens.
- **Usability & Standards:** Grade: **B+**. Impressive visual immersion; touch controls need pitch angle clamping on mobile.

#### 44. `AIME.jsx` (`src/pages/Foundry/AIME/AIME.jsx`)
- **Operations:** AI creative suite interfacing with `AimeAgent.ts`.
- **Functionality:** Streaming narrative prose delivery with AbortSignal cancellation.
- **Usability & Standards:** Grade: **A-**. Fast streaming; abort button cleanly halts generation.

#### 45. `PresetsAndScriptsDashboard.jsx` (`src/pages/Foundry/PresetsAndScripts/PresetsAndScriptsDashboard.jsx`)
- **Operations:** WebAssembly QuickJS sandbox for executing custom user macros.
- **Functionality:** Safe script execution without DOM access; pre-built macro templates.
- **Usability & Standards:** Grade: **B+**. High security; needs inline syntax error line highlighting.

#### 46. `PlayerSpectatorView.jsx` (`src/pages/Foundry/MapMaker/PlayerSpectatorView.jsx`)
- **Operations:** Real-time synchronized player screen via Firestore or LiveKit datachannel.
- **Functionality:** Strictly masks GM hidden tokens and fog of war.
- **Usability & Standards:** Grade: **A**. Perfect for physical projector or second-monitor tabletop setups.

#### 47. `CyberDeckModal.jsx` (`src/components/StoryFoundry/CyberDeckModal.jsx`)
- **Operations:** Cyberspace intrusion minigame.
- **Functionality:** Breaching ICE nodes emits `stage-bulkhead-toggled` events opening physical map bulkheads.
- **Usability & Standards:** Grade: **A+**. Flawless cross-module event integration.

---

### [48–52] Game Teams & Tactical Squads

#### 48. `TeamsPage.jsx` (`src/pages/TeamsPage.jsx`)
- **Operations:** Master squad workstation (**474 lines**, down from 1,600).
- **Functionality:** Coordinates 7 modular tabs; handles join-code onboarding and QR codes.
- **Usability & Standards:** Grade: **A+**. **MODEL ARCHITECTURAL IMPLEMENTATION**. 0 native browser dialogs.

#### 49. `SquadRosterTab.jsx` (`src/components/Groups/tabs/SquadRosterTab.jsx`)
- **Operations:** Subscribes to `GroupContext`. Renders member operative cards.
- **Functionality:** Real-time vitals, role badges, member kicking, promotion.
- **Usability & Standards:** Grade: **A**. Instant response; clean permission gating.

#### 50. `SquadDirectoryTab.jsx` (`src/components/Groups/tabs/SquadDirectoryTab.jsx`)
- **Operations:** Public squad registry with client-side filtering.
- **Functionality:** Search by name or tag; filter by recruiting status.
- **Usability & Standards:** Grade: **B+**. Clean UI; needs server-side pagination for large directories.

#### 51. `SquadInvitesTab.jsx` (`src/components/Groups/tabs/SquadInvitesTab.jsx`)
- **Operations:** Real-time incoming and outgoing invite queues.
- **Functionality:** Accept, decline, revoke actions with audible chime notifications.
- **Usability & Standards:** Grade: **A**. Highly polished queue interface.

#### 52. `CreateGroupModal.jsx` (`src/components/Groups/CreateGroupModal.jsx`)
- **Operations:** Squad creation dialog with validation.
- **Functionality:** Name, privacy, tags, description, campaign linking.
- **Usability & Standards:** Grade: **A**. Clean validation feedback; no native alerts.

---

### [53–60] Comms, Chat, Voice & Broadcasts

#### 53. `CommsPage.jsx` (`src/pages/CommsPage.jsx`)
- **Operations:** Master tactical comms workstation (**246 lines**).
- **Functionality:** Coordinates channel sidebars, message feed, and persona audit logs.
- **Usability & Standards:** Grade: **A**. Clean modular orchestrator.

#### 54. `MessageView.jsx` (`src/components/Chat/MessageView.jsx`)
- **Operations:** Virtualized chat feed with real-time Firestore message subscriptions.
- **Functionality:** Renders Markdown, code blocks, `/roll` dice embeds, and rule citations.
- **Usability & Standards:** Grade: **A**. Clickable rule chips open compendium popups directly.

#### 55. `MessageInput.jsx` (`src/components/Chat/MessageInput.jsx`)
- **Operations:** Multi-line text input with keyboard submission (`Enter` / `Shift+Enter`).
- **Functionality:** Supports slash commands (`/roll 2d10+4`), radio squelch audio feedback.
- **Usability & Standards:** Grade: **A-**. Fast response; needs `@handle` typeahead suggestions.

#### 56. `ChannelSidebar.jsx` (`src/components/Chat/ChannelSidebar.jsx`)
- **Operations:** Categorized channel list with unread counter subscriptions.
- **Functionality:** Public frequencies, squad channels, and encrypted direct messages.
- **Usability & Standards:** Grade: **A**. Unread badges clear instantly upon focus.

#### 57. `VoiceCommsBar.jsx` (`src/components/Chat/VoiceCommsBar.jsx`)
- **Operations:** Persistent floating voice bar mounted when connected to LiveKit WebRTC.
- **Functionality:** Push-To-Talk (V, Space, C, T, CapsLock), active speaker halos, mute/deafen.
- **Usability & Standards:** Grade: **A**. Audible click on PTT activation prevents hot-mics.

#### 58. `CommLinkDock.jsx` (`src/components/UI/CommLinkDock.jsx`)
- **Operations:** Global floating communications drawer accessible via `Alt+C` on all routes.
- **Functionality:** Complete chat and channel switching without navigating away from battlemaps.
- **Usability & Standards:** Grade: **A+**. **OUTSTANDING ERGONOMIC UTILITY**.

#### 59. `PersonaAuditLogSidebar.jsx` (`src/components/Chat/PersonaAuditLogSidebar.jsx`)
- **Operations:** Displays pending and reviewed character modifications in Comms.
- **Functionality:** Allows GM to review stat changes and approve/reject with feedback notes.
- **Usability & Standards:** Grade: **A**. Tight integration between character progression and chat.

#### 60. `HomeMessageBanner.jsx` (`src/components/Hub/HomeMessageBanner.jsx`)
- **Operations:** Subscribes to `bannerService.js` in Firestore.
- **Functionality:** Pinned emergency broadcast banner at the top of the command hub with dismiss memory.
- **Usability & Standards:** Grade: **A**. High-visibility alert styling.

---

## 5. Master Prioritized Action Roadmap

```mermaid
gantt
    title Master Implementation Roadmap (Next Sprints)
    dateFormat  YYYY-MM-DD
    section Sprint 1: Security & CI
    Secure LiveKit & Gemini Cloud Functions :2026-10-05, 3d
    Purge VITE_LIVEKIT_API_SECRET from client :2026-10-06, 2d
    Deploy GitHub Actions CI (npm test)     :2026-10-07, 2d
    section Sprint 2: Usability & Dialogs
    Migrate 14 Dialogs in DBMContainer     :2026-10-09, 3d
    Migrate Remaining 70 Native Dialogs     :2026-10-12, 4d
    section Sprint 3: Bundle Optimization
    Decouple Static Catalogs from AuthContext :2026-10-16, 4d
    Lazy Load Heavy Modals in Folio & ADE   :2026-10-20, 3d
    section Sprint 4: Architecture
    Decompose FolioContext into 4 Slices    :2026-10-23, 5d
    Decompose StageView.tsx under 500 LOC   :2026-10-28, 4d
```

### Detailed Task Specification

| Sprint | Task ID | Domain | Action Item | Target Files | Effort | Impact |
|:---:|:---:|:---:|---|---|:---:|:---:|
| **S1** | **SEC-01** | Security | Add Firebase user ID token auth verification (`verifyIdToken`) to `getLiveKitToken` and `geminiProxy`. | `functions/index.js` | Small | **Critical** |
| **S1** | **SEC-02** | Security | Remove client-side HMAC signing fallback and `VITE_LIVEKIT_API_SECRET` from client bundle. | `livekitTokenService.js` | Small | **Critical** |
| **S1** | **OPS-01** | CI/CD | Add `.github/workflows/ci.yml` running `cmd /c npm test` and `npm run typecheck` on all PRs. | `.github/workflows/ci.yml` | Small | **High** |
| **S2** | **USA-01** | Usability | Replace all 14 `alert()` and `confirm()` calls in `DBMContainer.jsx` with `useToast()` and `useConfirm()`. | `DBMContainer.jsx` | Small | **High** |
| **S2** | **USA-02** | Usability | Replace remaining 70 native dialogs across `ArchitectDevFieldsModal`, `GuidedCreatorModal`, and `MapMaker`. | Folio & ADE Modals | Medium | **High** |
| **S3** | **PERF-01**| Performance| Move static catalog imports out of `AuthContext` into dynamic `import()` loaders, cutting chunk from 6.75 MB to <500 kB. | `AuthContext.jsx`, `main.jsx` | Medium | **High** |
| **S3** | **PERF-02**| Performance| Lazy-load heavy modals (`MetaphysicsModal`, `Stage3DViewport`, `EconomyModal`). | `FolioContainer`, `StageView` | Small | **Medium** |
| **S4** | **ARCH-01**| Architecture| Partition `FolioContext.jsx` (3,758 LOC) into 4 domain slices (`Identity`, `Stats`, `Inventory`, `Combat`). | `src/context/folio/` | Large | **High** |
| **S4** | **ARCH-02**| Architecture| Extract overlays from `StageView.tsx` (3,007 LOC) to reduce core canvas shell under 500 LOC. | `StageView.tsx`, `VTT/stage/` | Medium | **High** |

---

## 6. Conclusion

The **Tangent Science Fantasy Roleplay** platform stands as a high-fidelity, production-grade tabletop gaming environment. Its mathematical rigor, immersive Web Audio feedback, real-time WebGPU canvas compositor, and AI narrative tools establish a powerful foundation. Executing the targeted remediations in this roadmap—securing the cloud proxies, purging the 6.75 MB auth bundle leak, eliminating lingering native dialogs, and completing the domain decomposition of `FolioContext` and `StageView`—will elevate the platform to an enterprise-ready, award-winning science fantasy VTT standard.
