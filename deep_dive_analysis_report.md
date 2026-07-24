# Tangent SFF RPG - Comprehensive System Deep Dive & Audit Report

## 1. Executive Summary & Architecture Overview

The **Tangent Science Fantasy Roleplaying Game (SFF RPG)** application is a multi-tool digital tabletop suite built on a modern frontend and backend stack comprising **React 19**, **Vite 8**, **Tailwind CSS 4**, **Firebase 12** (Firestore & Auth), **Konva 10** (2D Canvas Map Engine), **React-Quill-New 3** (Rich Text Editor), and **Google Gemini AI** (BASTION AI Copilot).

The system is organized into three major primary modules, complemented by the BASTION AI copilot:

1. **OMNICORTEX (Database Manager / DBM)**: The central rulebook and data architecture repository for rules, mechanics, species, factions, equipment, powers, body enhancements, and worldbuilding pillars.
2. **Persona Folio (Character Sheet & Creation Suite)**: Interactive character management, point-buy character builder, multi-tab sheet views, and character export/print capabilities.
3. **Story Foundry (Campaign & Battlemap Builder)**: A split-pane campaign design suite integrating a 2D Konva map engine element, procedural landmass generator element, combat initiative tracker element, scenario outline tree element, and rich-text story elements.
4. **BASTION AI Copilot**: A tactical AI assistant offering global chat, context-aware content generation, and `/roll` dice parsing.

> [!NOTE]
> **Story Foundry Terminology Standard**: Per project workspace conventions, all UI panels, modules, sub-components, widgets, and tools within Story Foundry are strictly designated as **elements** (e.g., Map Pane element, Scenario Outline element, Bastion Drawer element, Map Toolbar element, Map Tools element, Map Layers element, Map Key element, Map Metadata element, Landmass Generator element, Map Asset Manager element, Combat Initiative Tracker element).

---

## 2. Module 1: OMNICORTEX (Database Manager / DBM)

### 2.1 Current Functionality & Strengths
* **Dynamic Category Configuration**: Powered by `categoryConfig.js`, managing 25+ categories and 30+ subcategories with uniform field mapping (`text`, `number`, `select`, `multiselect`, `json_list`, `textarea`, `readonlytext`).
* **Game Mode vs. Dev Mode & RBAC**: Enforces read-only states in Game Mode to prevent accidental mid-session edits while granting full CRUD and administrative ("OTHER") access in Dev Mode.
* **Rules Codex Wiki**: Two-panel rich text editor in `DBMWikiView.jsx` with Quill integration and automatic inline `[[Article Name]]` hyperlinking.
* **Calculated Mechanics Engines**: Dynamic Design DC summation and CP total calculation for equipment, weaponry, and species options.
* **Batch Import/Export**: JSON export and batch import with Firestore 500-doc chunking (`useFirestoreSync.js`).

### 2.2 Functional Gaps & Technical Issues
1. **Firestore Category Isolation in Relational Selectors**:
   * *Issue*: `useFirestoreSync(currentKey)` only opens a real-time listener for the currently active database category. When editing complex records (e.g., Species, Features, Origins) in `DBMItemModal.jsx` and opening `UnifiedRelationalSelectorModal.jsx` to choose prerequisites or modifiers, categories other than `currentKey` rely on non-reactive background fallback queries or may display empty selection lists if unvisited.
2. **Modal Sub-Navigation Context**:
   * *Issue*: Creating an inline record via `UnifiedRelationalSelectorModal.jsx` during nested record creation (e.g., creating a *Modifier* from within a *Species* form) does not maintain a full edit-stack state, running a risk of lost unsaved state when closing nested dialogs.
3. **Complex Category Form Layout Density**:
   * *Issue*: Categories like **Species** contain over 30 individual fields (skill points breakdown, feature points breakdown across physical, mental, social, combat, meta, karma, exotic). Displaying all fields in a single scrolling modal (`DBMItemModal.jsx`) leads to visual fatigue and input clutter.
4. **Table View Filtering & Search Boundaries**:
   * *Issue*: `DBMTableView.jsx` filtering only checks `name`, `description`, and `type`. There is currently no multi-attribute filtering (e.g., filtering Weaponry by Tech Level, Availability, or Damage Type).

### 2.3 Revision & Refactoring Guidance
* **Refactor `useFirestoreSync.js`**: Implement a background pre-fetching cache for referenced relational collections (e.g., `features`, `modifiers`, `skills`, `origin`) so `UnifiedRelationalSelectorModal.jsx` always has instant access to cross-category option pools.
* **Refactor `DBMItemModal.jsx` Layout**: Introduce logical tabbed navigation tabs (*General Info*, *Attribute & Skill Bonuses*, *Feature Points*, *Subcategories*) for dense categories like Species, Factions, and Origins.
* **Enhance `DBMTableView.jsx`**: Add filter chip bars for Tech Level (TL 0-5), Meta Level (ML 0-5), and subcategory filters to support fast GM queries mid-session.

---

## 3. Module 2: Persona Folio (Character Sheet & Suite)

### 3.1 Current Functionality & Strengths
* **Structured State Management**: Driven by `FolioContext.jsx` with Zod schema validation (`schema.js`), providing real-time local storage persistence (`personaFolioData`) and Firestore cloud sync.
* **Granular Tabbed Layout**: 6 dedicated tabs (`Identity`, `Core Stats`, `Abilities`, `Skills`, `Combat & Gear`, `Other / Notes`) with custom skill addition (clamped 0-20), specializations (clamped 0-10), and starting CP allocation (default 150 CP).
* **PDF & Print Exporting**: Clean print styling and export pipeline for tabletop play.

### 3.2 Functional Gaps & Technical Issues
1. **Derived Stat Automation**:
   * *Issue*: Health (default 30), Vitality (default 30), and Karma (default 3) are set as static default values in `FolioContext.jsx`. They do not automatically calculate or adjust based on physical attribute scores (e.g., Might/Fortitude), species traits, or augmentations.
2. **CP Expenditure Tracking & Validation**:
   * *Issue*: While `CoreStatsTab.jsx` tracks spent CP for attributes, CP deductions for selected features, disadvantages, augmentations, and specializations are not unified into a real-time budget indicator bar on the main folio header.
3. **Multi-Character Roster Management**:
   * *Issue*: `FolioContext.jsx` stores a single active character in local state. There is no dedicated Character Selection Roster modal allowing GMs or players to manage, duplicate, switch between, or delete multiple saved character folios.
4. **Equipment Encumbrance & Durability Tracking**:
   * *Issue*: Weapons, armoring, and gear can be added to inventory in `CombatGearTab.jsx`, but total weight/encumbrance is not computed, nor is durability degradation tracked during play.

### 3.3 Revision & Refactoring Guidance
* **Update `FolioContext.jsx` with Formula Solvers**: Add dynamic computed getters for derived stats:
  * $\text{Health} = 30 + (\text{Might} \times 2) + (\text{Fortitude} \times 3)$
  * $\text{Vitality} = 30 + (\text{Willpower} \times 2) + (\text{Endurance} \times 3)$
  * $\text{Karma} = 3 + \lfloor \frac{\text{Intuition}}{2} \rfloor$
* **Implement Real-time CP Budget Bar**: Sum attribute costs, skill costs, feature costs, and specialization costs against `starting-cp` in `FolioContainer.jsx` header.
* **Add Portfolio Roster Modal**: Build `CharacterRosterModal.jsx` integrated with `FolioContext.jsx` to list, switch, create, and clone saved character profiles.

---

## 4. Module 3: Story Foundry (Campaign & Battlemap Suite)

### 4.1 Current Functionality & Strengths
* **Split-Pane Workspace Architecture**: Seamless multi-pane layout using `React-Split` combining the Map Canvas element (`MapPane.jsx`), Scenario Outline element (`ScenarioPane.jsx`), and BASTION AI drawer element (`BastionDrawer.jsx`).
* **2D Konva Canvas Map Engine**: Feature-rich battlemap element featuring grid snapping (Square/Hex), fog of war, status gem overlays element (`StatusGemsModal.jsx`), procedural landmass generator element (`LandmassGeneratorModal.jsx`), asset manager element (`MapAssetManagerModal.jsx`), map tools element (`MapToolsPanel.jsx`), toolbar element (`MapToolbar.jsx`), layers element (`MapLayersPanel.jsx`), key element (`MapKeyPanel.jsx`), metadata element (`MapMetadataPanel.jsx`), and combat initiative tracker element (`MapCombatTracker.jsx`).
* **Hierarchical Scenario Outline Element**: Drag-and-drop tree navigation in `ScenarioPane.jsx` for story arcs, chapters, scenes, NPCs, encounters, and locations with Markdown and PDF export.

### 4.2 Functional Gaps & Technical Issues
1. **Map Canvas Texture Memory & Re-rendering**:
   * *Issue*: Large battlemap elements loading multiple high-resolution textures (`MapTextures.js`, `MapAssetManagerModal.jsx`) can trigger canvas re-render lag during pan/zoom operations if texture image instances are not memoized (`useMemo` / cached offscreen image loaders in `MapPane.jsx` & `MapObjectNode.jsx`).
2. **Scenario Outline Tree Sibling Reordering UX**:
   * *Issue*: `TreeNode` drag-and-drop in the Scenario Outline element (`ScenarioPane.jsx`) handles nesting items into children, but lacks precise visual drop-indicators (top/bottom highlight bars) for reordering siblings at the same depth level.
3. **Multi-Map Campaign Tab Switcher**:
   * *Issue*: Story Foundry currently manages one active map canvas element per campaign context. Switching between regional maps, city maps, and encounter maps requires overwriting or re-uploading canvas data.
4. **Combat Initiative Tracker Element & OMNICORTEX Data Unification**:
   * *Issue*: The combat initiative tracker element (`MapCombatTracker.jsx`) allows adding combatant tokens to canvas, but stats (HP, Armor, Defense) must be entered manually instead of pulling directly from existing OMNICORTEX species or faction records.

### 4.3 Revision & Refactoring Guidance
* **Texture & Asset Caching Optimization**: Refactor pattern and image loader logic in `MapPane.jsx` and `MapObjectNode.jsx` using an image element caching pool to prevent re-creation of HTML Image objects on Konva layer redrawn cycles.
* **Enhanced Drag-and-Drop in `ScenarioPane.jsx`**: Add top/bottom insertion drop-indicator lines in `TreeNode` within the Scenario Outline element to explicitly distinguish sibling position reordering from parent element nesting.
* **Multi-Map Canvas Tab Element**: Extend `MapPane.jsx` to support an array of map canvases (e.g. *World*, *Region*, *Tactical Encounter*) with a top tab bar element for rapid context switching.
* **OMNICORTEX Token Import in `MapCombatTracker.jsx`**: Connect the combat initiative tracker element to `useFirestoreSync` to enable selecting combatants directly from OMNICORTEX NPC, Species, or Faction documents.
* **Canvas Hotkey Shortcuts Manager Element**: Implement a global hotkey listener element in `MapPane.jsx` (`G` toggle grid, `F` toggle fog, `V` select tool, `H` pan tool, `Del` delete selected object) with an accessible visual shortcuts legend element.

---

## 5. Module 4: BASTION AI Copilot

### 5.1 Current Functionality & Strengths
* **Dual-Mode Integration**: Operates both as a global chat drawer element (`BastionDrawer.jsx` in Story Foundry and Folio) / modal element (`BastionChatModal.jsx` in DBM) and as a selective field content generator (`generateSelectiveFields`) for Story Foundry elements and DBM records.
* **Tactical Fallback Engine**: Provides full simulated cognition responses when no Gemini API key is configured, preventing application crashes.
* **Built-in Command Interceptor**: `/roll` parser handling dice expressions like `/roll 2d10+4` or `/roll d20`.

### 5.2 Functional Gaps & Technical Issues
1. **API Key Diagnostic Error Messaging**:
   * *Issue*: When an invalid or expired API key is passed to `fetchGeminiContent`, error notifications in the chat drawer/modal element can be verbose. Direct inline prompts to open Settings would improve user recovery.
2. **Broad Campaign Context Ingestion**:
   * *Issue*: In selective field generation, BASTION receives the element prompt and active field state, but does not automatically inspect surrounding scenario outline nodes (e.g., active campaign Tech Level or regional faction allegiances).

### 5.3 Revision & Refactoring Guidance
* **Inline Key Settings Trigger**: Catch Gemini API authentication errors and display an interactive prompt button directly within `BastionDrawer.jsx` and `BastionChatModal.jsx` triggering `UserSettingsModal.jsx`.
* **Context Ingestion Pipeline**: Enrich AI prompts in `generateSelectiveFields` with active scenario node hierarchy and campaign metadata (Tech Level, Meta Level, Faction Context) from `CampaignContext.jsx`.

---

## 6. Comprehensive Recommendations Matrix

| Priority | Module / Area | Recommendation & Proposed Solution | Target Files | Expected Impact |
| :--- | :--- | :--- | :--- | :--- |
| **HIGH** | **OMNICORTEX (DBM)** | **Global Firestore Pre-fetching & Cache**: Expand `useFirestoreSync` to preload non-active collection reference lists (Skills, Features, Modifiers) in the background for instant availability in `UnifiedRelationalSelectorModal.jsx`. | [useFirestoreSync.js](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/hooks/useFirestoreSync.js)<br>[UnifiedRelationalSelectorModal.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/UnifiedRelationalSelectorModal.jsx) | Eliminates empty dropdowns in relational selectors; guarantees 100% field linkage parity. |
| **HIGH** | **OMNICORTEX (DBM)** | **Tabbed/Collapsible Form Sections**: Refactor `DBMItemModal.jsx` for dense categories (Species, Factions, Origins) into logical tabbed sub-forms (e.g., *General Info*, *Attribute & Skill Bonuses*, *Feature Points*, *Subcategories*). | [DBMItemModal.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/DBMItemModal.jsx) | Significantly improves usability and eliminates form scrolling clutter. |
| **HIGH** | **Story Foundry** | **Canvas Asset & Texture Caching Element**: Wrap Konva texture pattern loads in `MapPane.jsx` and `MapObjectNode.jsx` map elements with an image caching pool (`useMemo` / pre-rendered offscreen canvas). | [MapPane.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/MapPane.jsx)<br>[MapObjectNode.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/map/MapObjectNode.jsx) | Resolves canvas frame drops and memory spikes on large battlemaps. |
| **HIGH** | **Persona Folio** | **Derived Stats & Real-Time CP Budget Bar**: Implement dynamic auto-calculation for Health/Vitality/Karma and add a visual CP budget bar tracking spent vs. remaining CP across all character tabs. | [FolioContext.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/context/FolioContext.jsx)<br>[FolioContainer.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/Folio/FolioContainer.jsx) | Prevents illegal character builds; automates core math for players. |
| **MEDIUM** | **Story Foundry** | **Visual Drop-Indicators in Scenario Tree Element**: Add top/bottom line indicators during drag-and-drop in `ScenarioPane.jsx` element to distinguish sibling reordering from parent nesting. | [ScenarioPane.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/ScenarioPane.jsx) | Eliminates accidental element nesting during scenario outline editing. |
| **MEDIUM** | **Persona Folio** | **Character Selection Roster Modal**: Build a character portfolio selector modal allowing users to save, duplicate, switch, and delete multiple character folios. | [FolioContainer.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/Folio/FolioContainer.jsx)<br>[FolioContext.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/context/FolioContext.jsx) | Enables GMs and players to manage full parties or multiple personas seamlessly. |
| **MEDIUM** | **Story Foundry** | **Multi-Map Campaign Tab Switcher Element**: Introduce map canvas tabs in `MapPane.jsx` element allowing campaign builders to switch between World, Sector, and Encounter maps instantly. | [MapPane.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/MapPane.jsx) | Multiplies GM productivity and campaign worldbuilding capabilities. |
| **MEDIUM** | **OMNICORTEX (DBM)** | **Multi-Attribute Table Filtering**: Add filter chips in `DBMTableView.jsx` for Tech Level (TL 0-5), Meta Level (ML 0-5), and subcategory types. | [DBMTableView.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/DBM/DBMTableView.jsx) | Allows GMs to quickly locate level-appropriate gear, spells, and foes mid-session. |
| **LOW** | **BASTION AI** | **Enhanced Context Ingestion**: Inject active campaign Tech Level, Meta Level, and parent scenario node context into `generateSelectiveFields` prompts. | [BastionDrawer.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/BastionDrawer.jsx) | Improves AI output relevance and lore consistency. |
| **LOW** | **Story Foundry** | **Canvas Keyboard Shortcuts Manager Element**: Add standard hotkeys (`G` for Grid, `F` for Fog, `V` for Select, `H` for Pan, `Del` for Delete) with a visible shortcut legend element. | [MapPane.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/MapPane.jsx)<br>[MapToolbar.jsx](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/StoryFoundry/map/MapToolbar.jsx) | Accelerates map building speed for power users. |

---

## 7. Implementation Roadmap & Execution Phases

### Phase 1: Core Stability & Relational Data Sync
1. **Firestore Relational Pre-fetching**:
   * Update `useFirestoreSync.js` to maintain a pre-fetched dictionary of key relational collections (`skills`, `features`, `modifiers`, `origins`).
   * Ensure `UnifiedRelationalSelectorModal.jsx` consumes cached relational options without layout flicker.
2. **Form Layout Ergonomics in OMNICORTEX**:
   * Add sub-tab header navigation inside `DBMItemModal.jsx` for 30+ field categories like Species and Factions.

### Phase 2: Persona Folio Mechanics & Portfolio Roster
1. **Derived Stat Math Engine**:
   * Implement automated recalculation of Health, Vitality, and Karma based on attributes inside `FolioContext.jsx`.
2. **Real-Time CP Budget Tracker**:
   * Display total starting CP, spent CP, and remaining CP in `FolioContainer.jsx`.
3. **Character Portfolio Roster**:
   * Build roster selector UI allowing players and GMs to store multiple persona documents in LocalStorage/Firestore.

### Phase 3: Story Foundry Elements & Canvas Performance
1. **Konva Texture Caching Engine**:
   * Implement image texture memoization in `MapPane.jsx` and `MapObjectNode.jsx`.
2. **Scenario Outline Tree Sibling Reordering**:
   * Upgrade drag-and-drop handlers in `ScenarioPane.jsx` to render precise horizontal insertion indicators for sibling reordering vs. child element nesting.
3. **Multi-Map Campaign Switcher Element**:
   * Enable multiple canvas instances in `MapPane.jsx` with tab bar switching.
4. **OMNICORTEX Combat Tracker Integration**:
   * Connect `MapCombatTracker.jsx` to Firestore database to pull stats directly into initiative tokens.
