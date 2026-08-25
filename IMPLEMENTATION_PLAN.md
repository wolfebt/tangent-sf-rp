# Landing Page Refresh, Card Styling & Center Drawer Architecture
## Comprehensive Implementation Plan & Progress Checklist

---

## 📋 Progress Checklist

### Phase 1: Landing Page Transparency & Card Border Upgrades
- [x] **Page Background**: Set outer page overlay in `Home.jsx` to fully transparent (`bg-transparent` / ultra-subtle tint) so the space wallpaper renders cleanly without heavy dark tint.
- [x] **Card Default Transparency (80% transparent / 20% opacity)**: Update all Hub cards (`ModuleLauncherCard`, `CampaignOpsWidget`, `GameSquadsWidget`, `CommCenterWidget`, Compendium & Matrices Frame, `LandingDrawerArea`) to use `bg-.../20` (or `rgba(..., 0.2)`).
- [x] **Card Hover State (20% transparent / 80% opacity)**: Add smooth hover transition on cards to `hover:bg-slate-900/80` (or theme-matched `hover:bg-.../80`).
- [x] **Card Hover Shadow**: Add dynamic border-highlighting ambient glow on hover (e.g. `hover:shadow-[0_0_24px_rgba(theme_color,0.35)]`).
- [x] **Static Card Content**: Ensure card borders, badges, text, and icons stay static while background opacity and shadow smoothly transition on hover.
- [x] **Card Border Thickness**: Upgrade all card borders across the Hub to **`border-2`** (2px thick) with high-contrast theme styling matching Omnicortex and Codex (`border-2 border-[theme]-500/70`).

---

### Phase 2: Left Column Navigation Reordering
- [x] Reorder modules in `Home.jsx` (`renderModuleCards`):
  1. **Persona Folio** (Hero Builder & Operative Roster)
  2. **Compendium & Matrices Block** (Omnicortex & Codex inside the framed compendium border)
  3. **Story Foundry** (Campaigns & World Engine with 4 sub-options: Scenarios, Elements, Maps, AIME)
- [x] Upgrade the Compendium & Matrices outer frame border to `border-2 border-slate-700/80` with matching transparency and hover effect.

---

### Phase 3: Collapsible Left & Right Column Drawers & Full Browser View
- [x] **Collapsible State**: Add `isLeftCollapsed` and `isRightCollapsed` state hooks to `Home.jsx` (**open by default** on desktop).
- [x] **Slide-Out & Smooth Transitions**: When a column is collapsed, animate it sliding out of view and display a slim, floating side drawer toggle tab on the screen edge.
- [x] **Dynamic Center Expansion**: Center View area dynamically stretches from ~60% up to 100% full width when one or both side columns are collapsed.
- [x] **Full Browser View Controls**: Add a "Full Browser View" action icon/button to the Center Drawer header allowing the user to expand or navigate directly to full-screen standalone views (`/folio`, `/dbm`, `/codex`, `/foundry/...`).

---

### Phase 4: Thin Compact "Gem-Like" Vertical Stacked List Displays
- [x] **Folio Operatives Catalog (`FolioRosterDrawer.jsx`)**:
  - Replace large multi-row grid cards with sleek, horizontally compact "gem-like" stacked entries.
  - Display: Operative initial gem, Operative Name, Species & Faction pills, CP / TL summary, and quick action buttons (Open Sheet in Center, Clone, Share, Delete).
- [x] **Story Scenarios Catalog (`ScenariosDrawer.jsx`)**:
  - Replace bulky cards with thin compact rows featuring purple gem pill, Scenario Title, Node count, Map count, and Loaded status.
- [x] **Element Forge Catalog (`ElementsDrawer.jsx`)**:
  - Replace cards with thin compact rows featuring emerald type gem pill, Element Title, Parent Path, and Edit/Delete actions.
- [x] **Tactical Battlemaps Catalog (`MapsDrawer.jsx`)**:
  - Replace cards with thin compact rows featuring cyan map gem pill, Map Name, Dimensions, Object count, Spectator link copy, and Launch VTT button.
- [x] **AIME Creative Engine Drawer (`AimeDrawer.jsx`)**:
  - Convert generated idea cards and guidance gems into compact gem-like list rows.

---

### Phase 5: Center Drawer Full Modules (Folio, Omnicortex, Codex, Foundry)
- [x] **Create `OmnicortexDrawer.jsx`**:
  - Embed full Omnicortex `DBMContainer` inside the Center Drawer with a top control bar (Full Browser View `/dbm`, sidebar toggle, and dismiss button).
- [x] **Create `CodexDrawer.jsx`**:
  - Embed full Codex Matrix Suite (`CodexApp`: 14 Matrices, Builder, Synthesizer, Economatrix, Tech Codex) inside the Center Drawer with top control bar (Full Browser View `/codex` and dismiss button).
- [x] **Create `FolioSheetDrawer.jsx`**:
  - Embed full interactive `FolioContainer` character sheet editor in the Center Drawer with options to toggle back to the Operative Roster or open full browser `/folio`.
- [x] **Create `FoundryWorkspaceDrawer.jsx`**:
  - Embed Foundry sub-tools (Scenarios / `StoryModule`, `ElementForge`, `MapMaker`, `AIME`) directly into the Center Drawer with Full Browser View navigation buttons.
- [x] **Update `LandingDrawerArea.jsx`**:
  - Wire all new drawer keys (`omnicortex`, `codex`, `persona-sheet`, `foundry-scenarios-workspace`, `foundry-elements-workspace`, `foundry-maps-workspace`, `foundry-aime-workspace`).
  - Add standardized center drawer container styling with `border-2 border-slate-800/90`, `bg-slate-900/30 backdrop-blur-md`, and full-width expand controls.

---

### Phase 6: Build & Integration Verification
- [x] Run build test (`npm run build` / Vite build check) to verify zero syntax, bundle, or JSX errors.
- [x] Verify background transparency and hover animations in the browser.
- [x] Verify left and right column collapse/expand drawers and full browser view transitions.
- [x] Verify gem-like compact list layouts across all catalogs.
- [x] Verify that Persona Folio, Omnicortex, Codex, and Foundry tools launch and function properly inside the Center Drawer.

---

## 📐 Detailed Architecture & Design Specifications

### 1. Landing Page Transparency & Card Borders

```
+----------------------------------------------------------------------------------------------------+
|  Background: Transparent Space Backdrop (No dark heavy overlay)                                    |
|                                                                                                    |
|  +---------------------------+  +---------------------------------------+  +---------------------+  |
|  | LEFT COLUMN (~20%)        |  | CENTER VIEW AREA (~60% -> 100%)       |  | RIGHT COLUMN (~20%) |  |
|  | [Collapse Button <]       |  | [Full Browser Option] [Expand < >]    |  | [Collapse Button >] |  |
|  |                           |  |                                       |  |                     |  |
|  | 1. PERSONA FOLIO (border-2|  | Active Drawer View:                   |  | CAMPAIGN OPS        |  |
|  |    bg-20% -> hover:bg-80%)|  | - Gem-like Catalog Lists              |  | (border-2, bg-20%)  |  |
|  |                           |  | - Embedded Persona Sheet              |  |                     |  |
|  | 2. COMPENDIUM & MATRICES  |  | - Embedded Omnicortex (DBM)           |  | GAME SQUADS         |  |
|  |    - OMNICORTEX           |  | - Embedded Codex (14 Matrices)        |  | (border-2, bg-20%)  |  |
|  |    - CODEX                |  | - Embedded Story Foundry Workspace    |  |                     |  |
|  |                           |  |                                       |  | COMM CENTER         |  |
|  | 3. STORY FOUNDRY          |  |                                       |  | (border-2, bg-20%)  |  |
|  |    - Scenarios            |  |                                       |  |                     |  |
|  |    - Elements             |  |                                       |  |                     |  |
|  |    - Maps / VTT           |  |                                       |  |                     |  |
|  |    - AIME                 |  |                                       |  |                     |  |
|  +---------------------------+  +---------------------------------------+  +---------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### 2. Card Styling Rules

| Element | Default State (Static) | Hover State |
| :--- | :--- | :--- |
| **Border** | `border-2 border-[theme]-500/70` | Static (remains `border-2 border-[theme]-500/70`) |
| **Background** | 80% Transparent (`bg-.../20` / `rgba(..., 0.2)`) | 20% Transparent (`hover:bg-slate-900/80` / `rgba(..., 0.8)`) |
| **Shadow** | Subtle ambient (`shadow-[0_0_15px_rgba(...,0.1)]`) | High-glow border highlight (`hover:shadow-[0_0_24px_rgba(theme,0.35)]`) |
| **Content/Text** | Static text, icons, badges | Static text, icons, badges (crisp and readable) |

---

### 3. Gem-Like Compact List Row Format

```
+--------------------------------------------------------------------------------------------------+
| [💎 ICON/AVATAR]  ITEM TITLE / OPERATIVE NAME    [SPECIES/TAG] [FACTION/STATUS]   CP: 150   [ACTION BUTTONS] |
+--------------------------------------------------------------------------------------------------+
```
- **Height**: Compact ~38px - 44px per row.
- **Visuals**: Distinct neon gem tag/indicator per category, high-density metadata pills, and quick action triggers.

---

## 🛠️ Target Files

| Action | File Path |
| :--- | :--- |
| **MODIFY** | `src/pages/Home.jsx` |
| **MODIFY** | `src/components/Hub/ModuleLauncherCard.jsx` |
| **MODIFY** | `src/components/Hub/CampaignOpsWidget.jsx` |
| **MODIFY** | `src/components/Hub/GameSquadsWidget.jsx` |
| **MODIFY** | `src/components/Hub/CommCenterWidget.jsx` |
| **MODIFY** | `src/components/Hub/LandingDrawerArea.jsx` |
| **MODIFY** | `src/components/Hub/drawers/FolioRosterDrawer.jsx` |
| **MODIFY** | `src/components/Hub/drawers/ScenariosDrawer.jsx` |
| **MODIFY** | `src/components/Hub/drawers/ElementsDrawer.jsx` |
| **MODIFY** | `src/components/Hub/drawers/MapsDrawer.jsx` |
| **MODIFY** | `src/components/Hub/drawers/AimeDrawer.jsx` |
| **NEW** | `src/components/Hub/drawers/OmnicortexDrawer.jsx` |
| **NEW** | `src/components/Hub/drawers/CodexDrawer.jsx` |
| **NEW** | `src/components/Hub/drawers/FolioSheetDrawer.jsx` |
| **NEW** | `src/components/Hub/drawers/FoundryWorkspaceDrawer.jsx` |
