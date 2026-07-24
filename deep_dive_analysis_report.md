# Tangent SFF RPG - Comprehensive System Deep Dive & Audit Report

## 1. Executive Summary & Architecture Overview

The **Tangent Science Fantasy Roleplaying Game (SFF RPG)** application is a multi-tool digital tabletop suite built on a modern stack comprising **React 19**, **Vite 8**, **Tailwind CSS 4**, **Firebase 12** (Firestore & Auth), **Konva 10** (2D Canvas Map Engine), **React-Quill-New 3** (Rich Text Editor), and **Google Gemini AI** (BASTION AI Copilot).

The system is organized into three major primary modules, complemented by the BASTION AI copilot:

1. **OMNICORTEX (Database Manager / DBM)**: The central rulebook and data architecture repository for rules, mechanics, species, factions, equipment, powers, body enhancements, and worldbuilding pillars.
2. **Persona Folio (Character Sheet & Creation Suite)**: Interactive character management, point-buy character builder, multi-tab sheet views, and character export/print capabilities.
3. **Story Foundry (Campaign & Battlemap Builder)**: A split-pane campaign design suite integrating a 2D Konva map engine, procedural terrain generators, combat initiative trackers, scenario outline trees, and rich-text story elements.
4. **BASTION AI Copilot**: A tactical AI assistant offering global chat, context-aware content generation, and `/roll` dice parsing.

> [!NOTE]
> **Story Foundry Terminology Standard**: Per project conventions, all UI panels, modules, sub-components, widgets, and tools within Story Foundry are strictly designated as **elements**.

---

## 2. Module 1: OMNICORTEX (Database Manager / DBM)

### 2.1 Current Functionality & Strengths
* **Dynamic Category Configuration**: Powered by `categoryConfig.js`, managing 25+ categories and 30+ subcategories with uniform field mapping (`text`, `number`, `select`, `multiselect`, `json_list`, `textarea`, `readonlytext`).
* **Game Mode vs. Dev Mode & RBAC**: Enforces read-only states in Game Mode to prevent accidental mid-session edits while granting full CRUD and administrative ("OTHER") access in Dev Mode.
* **Rules Codex Wiki**: Two-panel rich text editor with Quill integration and automatic inline `[[Article Name]]` hyperlinking.
* **Calculated Mechanics Engines**: Dynamic Design DC summation and CP total calculation for equipment, weaponry, and species options.
* **Batch Import/Export**: JSON export and batch import with Firestore 500-doc chunking (`useFirestoreSync.js`).

### 2.2 Functional Gaps & Technical Issues
1. **Firestore Category Isolation in Relational Selectors**:
   * *Issue*: `useFirestoreSync(currentKey)` only opens a real-time listener for the currently active database category. When editing complex records (e.g., Species, Features, Origins) in `DBMItemModal.jsx` and opening `UnifiedRelationalSelectorModal.jsx` to choose prerequisites or modifiers, categories other than `currentKey` rely on non-reactive background fallback queries or may display empty selection lists if unvisited.
2. **Modal Sub-Navigation Context**:
   * *Issue*: In the original vanilla implementation, multi-tier nested creation (e.g., creating a *Modifier* from within a *Species* form) maintained a `navigationContext` stack with a back button. In the React implementation, creating an inline record via `UnifiedRelationalSelectorModal` does not maintain a full edit-stack state, running a risk of lost unsaved state when closing nested dialogs.
3. **Complex Category Form Layout Density**:
   * *Issue*: Categories like **Species** contain over 30 individual fields (skill points breakdown, feature points breakdown across physical, mental, social, combat, meta, karma, exotic). Displaying all fields in a single scrolling modal (`DBMItemModal.jsx`) leads to visual fatigue and input clutter.
4. **Table View Filtering & Search Boundaries**:
   * *Issue*: `DBMTableView` filtering only checks `name`, `description`, and `type`. There is currently no multi-attribute filtering (e.g., filtering Weaponry by Tech Level, Availability, or Damage Type).

---

## 3. Module 2: Persona Folio (Character Sheet & Suite)

### 3.1 Current Functionality & Strengths
* **Structured State Management**: Driven by `FolioContext.jsx` with Zod schema validation (`schema.js`), providing real-time local storage persistence (`personaFolioData`) and Firestore cloud sync.
* **Granular Tabbed Layout**: 6 dedicated tabs (`Identity`, `Core Stats`, `Abilities`, `Skills`, `Combat & Gear`, `Other / Notes`) with custom skill addition (clamped 0-20), specializations (clamped 0-10), and starting CP allocation (default 150 CP).
* **PDF & Print Exporting**: Clean print styling and export pipeline for tabletop play.

### 3.2 Functional Gaps & Technical Issues
1. **Derived Stat Automation**:
   * *Issue*: Health (30), Vitality (30), and Karma (3) are set as static default values. They do not automatically calculate or adjust based on physical attribute scores (e.g., Might/Fortitude), species traits, or augmentations.
2. **CP Expenditure Tracking & Validation**:
   * *Issue*: While `CoreStatsTab.jsx` tracks spent CP for attributes, CP deductions for selected features, disadvantages, augmentations, and specializations are not unified into a real-time budget indicator bar on the main folio header.
3. **Multi-Character Roster Management**:
   * *Issue*: `FolioContext` stores a single active character in local state. There is no dedicated Character Selection Roster screen allowing GMs or players to manage multiple saved character folios simultaneously.
4. **Equipment Encumbrance & Durability Tracking**:
   * *Issue*: Weapons, armoring, and gear can be added to inventory, but total weight/encumbrance is not computed, nor is durability degradation tracked during play.

---

## 4. Module 3: Story Foundry (Campaign & Battlemap Suite)

### 4.1 Current Functionality & Strengths
* **Split-Pane Workspace Architecture**: Seamless multi-pane layout using `React-Split` combining the Map Canvas element (`MapPane.jsx`), Scenario Outline element (`ScenarioPane.jsx`), and BASTION AI drawer element (`BastionDrawer.jsx`).
* **2D Konva Canvas Map Engine**: Feature-rich battlemap element featuring grid snapping (Square/Hex), fog of war, status gem overlays, procedural landmass generation (`landmassGenerator.js`), asset catalogs, and combat initiative tracking.
* **Hierarchical Scenario Outline**: Drag-and-drop tree navigation for story arcs, chapters, scenes, NPCs, encounters, and locations with Markdown and PDF export.

### 4.2 Functional Gaps & Technical Issues
1. **Map Canvas Texture Memory & Re-rendering**:
   * *Issue*: Large battlemaps loading multiple high-resolution textures (`MapTextures.js`, `MapAssetManagerModal.jsx`) can trigger canvas re-render lag during pan/zoom operations if texture image instances are not memoized (`useMemo` / cached image loaders).
2. **Scenario Outline Tree Sibling Reordering UX**:
   * *Issue*: `TreeNode` drag-and-drop in `ScenarioPane.jsx` handles nesting items into children, but lacks precise visual drop-indicators (top/bottom highlight bars) for reordering siblings at the same depth level.
3. **Multi-Map Campaign Tab Switcher**:
   * *Issue*: Story Foundry currently manages one active map canvas per campaign context. Switching between regional maps, city maps, and encounter maps requires overwriting or re-uploading canvas data.
4. **Combat Initiative Tracker & OMNICORTEX Data Unification**:
   * *Issue*: `MapCombatTracker.jsx` allows adding combatant tokens to canvas, but stats (HP, Armor, Defense) must be entered manually instead of pulling directly from existing OMNICORTEX species or faction records.

---

## 5. Module 4: BASTION AI Copilot

### 5.1 Current Functionality & Strengths
* **Dual-Mode Integration**: Operates both as a global chat drawer/modal and as a selective field content generator (`generateSelectiveFields`) for Story Foundry elements and DBM records.
* **Tactical Fallback Engine**: Provides full simulated cognition responses when no Gemini API key is configured, preventing application crashes.
* **Built-in Command Interceptor**: `/roll` parser handling dice expressions like `/roll 2d10+4` or `/roll d20`.

### 5.2 Functional Gaps & Technical Issues
1. **API Key Diagnostic Error Messaging**:
   * *Issue*: When an invalid or expired API key is passed to `fetchGeminiContent`, error notifications in the chat modal can be verbose. Direct inline prompts to open Settings would improve user recovery.
2. **Broad Campaign Context Ingestion**:
   * *Issue*: In selective field generation, BASTION receives the element prompt and active field state, but does not automatically inspect surrounding scenario outline nodes (e.g., active campaign Tech Level or regional faction allegiances).

---

## 6. Comprehensive Recommendations Matrix

| Priority | Module / Area | Recommendation & Proposed Solution | Expected Impact |
| :--- | :--- | :--- | :--- |
| **HIGH** | **OMNICORTEX (DBM)** | **Global Firestore Pre-fetching & Cache**: Expand `useFirestoreSync` to preload non-active collection reference lists (Skills, Features, Modifiers) in the background for instant availability in `UnifiedRelationalSelectorModal`. | Eliminates empty dropdowns in relational selectors; guarantees 100% field linkage parity. |
| **HIGH** | **OMNICORTEX (DBM)** | **Tabbed/Collapsible Form Sections**: Refactor `DBMItemModal.jsx` for dense categories (Species, Factions, Origins) into logical tabbed sub-forms (e.g., *General Info*, *Attribute & Skill Bonuses*, *Feature Points*, *Subcategories*). | Significantly improves usability and eliminates form scrolling clutter. |
| **HIGH** | **Story Foundry** | **Canvas Asset & Texture Caching**: Wrap Konva texture pattern loads in `MapPane.jsx` and `MapObjectNode.jsx` with an image caching pool (`useMemo` / pre-rendered offscreen canvas). | Resolves canvas frame drops and memory spikes on large battlemaps. |
| **HIGH** | **Persona Folio** | **Derived Stats & Real-Time CP Budget Bar**: Implement dynamic auto-calculation for Health/Vitality and add a visual CP budget bar tracking spent vs. remaining CP across all character tabs. | Prevents illegal character builds; automates core math for players. |
| **MEDIUM** | **Story Foundry** | **Visual Drop-Indicators in Scenario Tree**: Add top/bottom line indicators during drag-and-drop in `ScenarioPane.jsx` to distinguish sibling reordering from parent nesting. | Eliminates accidental element nesting during scenario outline editing. |
| **MEDIUM** | **Persona Folio** | **Character Selection Roster Modal**: Build a character portfolio selector modal allowing users to save, duplicate, switch, and delete multiple character folios. | Enables GMs and players to manage full parties or multiple personas seamlessly. |
| **MEDIUM** | **Story Foundry** | **Multi-Map Campaign Tab Switcher**: Introduce map canvas tabs in `MapPane.jsx` allowing campaign builders to switch between World, Sector, and Encounter maps instantly. | Multiplies GM productivity and campaign worldbuilding capabilities. |
| **MEDIUM** | **OMNICORTEX (DBM)** | **Multi-Attribute Table Filtering**: Add filter chips in `DBMTableView` for Tech Level (TL 0-5), Meta Level (ML 0-5), and subcategory types. | Allows GMs to quickly locate level-appropriate gear, spells, and foes mid-session. |
| **LOW** | **BASTION AI** | **Enhanced Context Ingestion**: Inject active campaign Tech Level, Meta Level, and parent scenario node context into `generateSelectiveFields` prompts. | Improves AI output relevance and lore consistency. |
| **LOW** | **Story Foundry** | **Canvas Keyboard Shortcuts Manager**: Add standard hotkeys (`G` for Grid, `F` for Fog, `V` for Select, `H` for Pan, `Del` for Delete) with a visible shortcut legend. | Accelerates map building speed for power users. |

---

## 7. Next Steps & Implementation Roadmap

1. **Phase 1 (Core Stability & Relational Data)**:
   * Implement pre-fetching in `useFirestoreSync.js` for relational cross-references.
   * Add tabbed layout sections inside `DBMItemModal.jsx`.
2. **Phase 2 (Persona Folio & Automation)**:
   * Connect derived stat formulas (Health, Vitality, CP Budgeting) in `FolioContext.jsx`.
   * Implement Character Portfolio Roster Manager.
3. **Phase 3 (Story Foundry & Canvas Optimization)**:
   * Optimize Konva canvas image loading and texture caching.
   * Add visual drop-indicators to `ScenarioPane.jsx` tree drag-and-drop.
   * Add multi-map tab switching in `MapPane.jsx`.
