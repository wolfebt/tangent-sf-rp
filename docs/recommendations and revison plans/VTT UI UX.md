# **Tab 3**

# **Implementation Plan: Tripartite Virtual Tabletop (VTT) Interface (Tangent SF RP Revision)**

This implementation plan is an architectural blueprint and execution specification for **Google Antigravity**. It operationalizes the IDE-style tripartite VTT architecture—Left Module Catalog, Center WebGPU Stage with Two-Tier Breadcrumb Tabs, and Right Operational Cockpit/Dynamic Inspector—into a modular, agent-executable software enhancement.

> [!IMPORTANT]
> **PRIMARY ARCHITECTURAL DIRECTIVE: COMPLETE FUNCTIONALITY PRESERVATION**  
> All existing Tangent SF RP platform features, systems, and engines MUST BE PRESERVED WITHOUT EXCEPTION:
> 1. **WebGPU / Pixi Compositor**: 8 Z-axis composite layers (`LayerCompositor`), `FrustumChunkManager`, and `CoordinateEngine` (Square and Hex, Encounter/Tactical/Strategic scale tiers).
> 2. **Vision & Compute Kernels**: WGSL compute shaders (`Fused Vision` line-of-sight, `SDF CSG` dynamic geometry, `Elemental Fluid` hazard physics, `Boids Swarm` AI), and `BVHBuilder` raycasting.
> 3. **In-Situ Architect Cartography Studio**: Wall drawing tools (single, chain, room), terrain painting (organic and hex), dynamic lighting and atmosphere presets, hazard volume simulation, interactive object managers, procedural landmass generation, underlay calibration, and UVTT ingestion.
> 4. **Tangent SF RP Rules System**: Action Point (AP) economy, 12 Attributes (Primary + Sub-attributes), Skill Ranks (Untrained to Grandmaster), Called Shots & Trauma thresholds, Armor Damage Reduction (DR), Damage Types (Kinetic, Energy, Thermal, Cryo, Toxic), Essence Economy, and Mecha/Cyberware Sockets.
> 5. **State & Network Backbone**: `CampaignContext` (Story Foundry, Scenarios, Maps), `FolioContext` (Characters, Roster, CP Economy), `DBMContext` (Omnicortex SQLite WASM via OPFS), `ChatContext`, `DiceContext` (AST dice parser), and `LiveKitClient` (WebRTC audio/video and remote cursor telemetry).

---

## **1. Architecture & Antigravity Workflow Context**

In Google Antigravity’s agent-first paradigm, complex full-stack web applications are delivered through the **Planning $\rightarrow$ Execution $\rightarrow$ Verification** lifecycle.

* **Agent Mode:** Planning Mode (generates `task.md` and `implementation_plan.md` artifact prior to automated code execution).
* **Execution Strategy:** Parent agent delegates tasks across isolated subagents (`vtt-shell`, `catalog-engine`, `cockpit-inspector`) working in focused modules, synchronizing back to the primary workspace without disturbing existing production engines.
* **Verification Loop:** The Antigravity `/browser` subagent launches a headless/interactive Chrome instance to run Playwright end-to-end tests, inspect 60 FPS WebGPU canvas telemetry, capture layout screenshots, and output the final `walkthrough.md` artifact.

---

## **2. Technical Stack & Dependencies**

| Layer | Technology | Status in Project | Justification |
| :--- | :--- | :--- | :--- |
| **Runtime & Build** | Vite 8 + React 19 + TypeScript | Active | High-performance HMR, strict type safety, zero-overhead bundle optimization. |
| **Canvas & Compute Engine** | PixiJS v8 + WebGPU WGSL Kernels | Active (`src/engine/`) | Hardware-accelerated 8-layer compositor, spatial container graphs, WGSL Fused Vision LoS, and BVH raycasting. |
| **State Management** | Zustand v5 + Immer + React Contexts | Active | Decoupled reactive sharded stores (`VolatileSharder`, `CampaignContext`, `FolioContext`, `DBMContext`) preventing unnecessary UI re-renders during 60 FPS canvas updates. |
| **Relational Database & OPFS** | SQLite WASM (`@sqlite.org/sqlite-wasm`) + OPFS Worker | Active (`src/engine/database/`) | Local-first high-speed relational storage for Omnicortex compendiums, bestiary, and campaign elements. |
| **Network & Telemetry** | LiveKit Client (`livekit-client`) + Yjs CRDT | Active (`src/engine/network/`) | Real-time WebRTC audio/video, remote cursor streaming, and multi-user scene state synchronization. |
| **Virtual Outliner** | `@tanstack/react-virtual` | Integration Target | High-efficiency DOM virtualization for massive campaign modules containing thousands of lore entries, items, and NPCs. |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/utilities` | Integration Target | Accessible pointer-event drag-and-drop bridging catalog outliner nodes directly to PixiJS/WebGPU stage coordinates. |
| **Component Primitives** | Tailwind CSS v4 + Lucide Icons | Active | Native dark-glassmorphism design system, sci-fi cyber styling, accessible panels. |
| **Command Palette** | `CommandPalette` (extending `cmdk`) | Active | Global `Cmd+K` / `Ctrl+K` fuzzy search across maps, actors, environmental presets, and dice triggers. |

---

## **3. Workspace Directory Structure**

The tripartite architecture organizes cleanly into the existing project without destroying or displacing current systems:

```
src/
├── components/
│   ├── Layout/
│   │   ├── GlobalHUD.jsx                  # Persistent Top HUD with module routing & quick tools
│   │   └── AppShell.jsx
│   ├── UI/
│   │   ├── DiceRollerDock.jsx             # Persistent Alt+D Dice Dock (preserved)
│   │   ├── CommLinkDock.jsx               # Persistent Alt+C LiveKit Comms Dock (preserved)
│   │   └── CommandPalette.jsx             # Persistent Cmd+K Global Search
│   └── VTT/                               # Core VTT Module
│       ├── StageView.tsx                  # WebGPU/Pixi Compositor & In-Situ Cartography Studio (PRESERVED)
│       ├── ArchitectDesignPalette.tsx     # In-Situ Map Maker Design Palette (PRESERVED)
│       ├── StageTopToolbar.tsx            # Stage Controls & Toggles (PRESERVED)
│       ├── TokenRadialMenu.tsx            # Radial Action Menu (PRESERVED)
│       ├── TripartiteLayout.tsx           # NEW: 3-column responsive shell & collapse orchestration
│       ├── catalog/                       # NEW: Left Zone (Module Catalog)
│       │   ├── ModuleCatalogRail.tsx      # 48px vertical category icon strip
│       │   ├── CatalogOutliner.tsx        # Virtualized nested tree outliner
│       │   ├── CatalogNodeItem.tsx        # Outliner row with player visibility toggle & drag handle
│       │   ├── CatalogSearchFilter.tsx    # Fuzzy filter & tag selector
│       │   └── CatalogDragBridge.tsx      # @dnd-kit sensor to WebGPU coordinate converter
│       ├── stage/                         # NEW: Center Zone (Stage Viewport Wrapper)
│       │   ├── StageViewportWrapper.tsx   # Embeds StageView.tsx with breadcrumb header
│       │   ├── StageBreadcrumbTabs.tsx    # Two-tier breadcrumb & scene tab bar
│       │   └── TokenContextualPill.tsx    # Floating on-canvas token action pill
│       ├── cockpit/                       # NEW: Right Zone (Player Cockpit & GM Inspector)
│       │   ├── CockpitContainer.tsx       # Dynamic switcher (Player Cockpit vs GM Inspector)
│       │   ├── ActionVitalsBar.tsx        # Pinned HP, Trauma, DR, AP, Wound status
│       │   ├── TangentActionDeck.tsx      # AP attacks, Called Shots, Damage Pipeline rolls
│       │   ├── MechaCompanionDeck.tsx     # Cyberware, mecha chassis sockets, summons
│       │   ├── GMInspector.tsx            # Selected token inspector & full stat block
│       │   ├── MultiSelectCard.tsx        # Batch operations (mass damage, condition sync)
│       │   └── PartySummaryCard.tsx       # Default GM view: full party vitals overview
│       └── shared/
│           ├── PopoutPortal.tsx           # Multi-window detached OS window portal
│           └── ContextMenu.tsx            # Right-click contextual actions
├── context/
│   ├── CampaignContext.jsx                # Story Foundry, Scenarios, Maps, Universe State (PRESERVED)
│   ├── FolioContext.jsx                   # Characters, Roster, Attributes, CP Economy (PRESERVED)
│   ├── DBMContext.jsx                     # Omnicortex SQLite WASM bridge (PRESERVED)
│   ├── ChatContext.jsx                    # Chat logs & roll cards (PRESERVED)
│   └── DiceContext.jsx                    # Dice roller state & AST integration (PRESERVED)
└── engine/                                # Tangent Core Simulation Engine (PRESERVED)
    ├── canvas/                            # RendererContext, LayerCompositor, FrustumChunkManager
    ├── vision/                            # BVHBuilder, WGSL Fused Vision LoS compute shaders
    ├── rules/                             # CombatArbitrator, DamagePipeline, CharacterBuilder, EssenceTracker
    ├── state/                             # VolatileSharder (useEngineStore, FusedToken)
    ├── database/                          # OPFSDatabaseWorker (SQLite WASM)
    └── network/                           # LiveKitClient, YjsProviderBridge, FirestoreDebouncer
```

---

## **4. Core System Subsystems & Implementation Mechanics**

### **4.1. Left Zone: Module Catalog & Outliner (`/components/VTT/catalog/`)**

* **Seven Primary Taxonomies:** The 48px `ModuleCatalogRail.tsx` provides instant category switching:
  1. **Story Arcs & Quests**: Universe scenarios, acts, story cards, narrative beats (from `CampaignContext`).
  2. **Scenes & Tactical Maps**: All battlemaps and regional maps (from `universeState.maps` and `mapsCatalog`).
  3. **Dramatis Personae**: Player characters, NPCs, and Bestiary entries (from `FolioContext` and Omnicortex).
  4. **Encounters & Hazards**: Pre-built combat squads, ambush triggers, and hazard fields (`HazardParticleSimulator`).
  5. **Factions & Relations**: Factions database entries, allegiance ratings, and NPC relationship webs.
  6. **Lore, Clues & Handouts**: Investigative clues, epistolary handouts, secrets, and historical codices.
  7. **Compendium & Armory**: Weapons, armoring, items, augmentations, and mecha sockets (from Omnicortex SQLite).
* **Virtualized Outliner (`CatalogOutliner.tsx`):** Powered by `@tanstack/react-virtual` to handle thousands of entities without layout lag. Each row features:
  * Drag handle for canvas placement.
  * Inline player-visibility toggle (Eye icon) updating document permissions in real time.
  * Right-click contextual menu for duplicate, archive, export, and inspect.
* **Canvas Drag-and-Drop Bridge (`CatalogDragBridge.tsx`):**
  * Uses `@dnd-kit/core`. When an Encounter, Persona, or Bestiary node is dragged, an active ghost token floats over the DOM.
  * Dropping onto the center stage converts DOM `clientX/Y` $\rightarrow$ WebGPU stage `worldX/Y` and calls `useEngineStore.getState().loadStaticEntity()` or spawns the token into `StageView`.
  * Dropping an Armory item or Clue onto the Right Cockpit transfers it directly to the active character's inventory or journal in `FolioContext`.

### **4.2. Center Zone: Stage Viewport & Scene Tabs (`/components/VTT/stage/`)**

* **Two-Tiered Breadcrumb Bar (`StageBreadcrumbTabs.tsx`):**
  * *Macro Hierarchy (Tier 1):* Renders campaign depth (e.g., `Universe > Cygnus Reach > Outpost Epsilon`).
  * *Micro Scene Tabs (Tier 2):* Displays active maps open in memory. Tabs feature:
    * Scene title with double-click inline renaming.
    * **PartyPin**: Visual badge showing which tab currently contains the player party tokens.
    * **CombatPulse**: Amber/Red pulsing indicator on tabs where turn tracking or combat is live.
    * **PreloadDot**: Indicator showing whether map textures and LoS vectors are cached in GPU memory.
    * Close button with unsaved-changes confirmation.
* **Preserved Canvas & Cartography Core (`StageView.tsx`):**
  * Seamlessly wrapped inside `StageViewportWrapper.tsx`.
  * **Compositor Integrity:** 8 Z-axis layers (Background Underlay, Procedural Terrain, Grid Layer, Object Layer, Token Layer, Hazard Particles, Fused Vision LoS, Tactical HUD).
  * **In-Situ Architect Studio:** Preserves full access to `ArchitectDesignPalette.tsx`: point-to-point wall drawing (single, chain, room), organic/hex terrain painting, light source manager, atmospheric presets, underlay calibration, procedural landmass generation, and UVTT import without requiring modal navigation away from the tactical view.
  * **Movement & AP Waypoint Ruler:** Token dragging projects an interactive polyline showing movement distance in feet and AP cost, with Alt-key private GM pathing.

### **4.3. Right Zone: Player Cockpit & Dynamic Inspector (`/components/VTT/cockpit/`)**

* **Role-Aware Dynamic Switching:**
  * **Player Role:** Renders `PlayerCockpit`, pinned to the user's active character in `FolioContext`.
  * **GM Role:** Renders `GMInspector`. If no token is selected on canvas, defaults to `PartySummaryCard`. Selecting any token loads its full stat block. Selecting multiple tokens activates `MultiSelectCard`.
* **Player Cockpit Components (Tangent SF RP Rules):**
  * `ActionVitalsBar.tsx`: Pinned, non-scrolling header with:
    * Health bar (Current/Max HP) and Wound Threshold indicators.
    * Armor Damage Reduction (Kinetic DR and Energy DR).
    * Action Points (AP): Live AP pool (e.g., 4 AP base) with spent/remaining counters.
    * Trauma Tracker: Critical wounds, called shot penalties, and death clock counters.
    * Active Conditions: Badges with turn duration counters.
  * `TangentActionDeck.tsx`: Categorized action cards built strictly on Tangent SF RP mechanics:
    * *Attacks & Weapons*: AP cost, Range category, Accuracy modifiers, Damage equations, and Called Shot target selector (Head, Torso, Limbs, Chassis).
    * *Tactical Maneuvers*: Cover, Dodge, Aim, Overcharge, Disengage, First Aid.
    * *Metaphysics & Invocations*: Essence pool spend, casting checks, ongoing spell effects (`EssenceTracker`).
    * *Skills & Special Operations*: 1-click skill rolls factoring in Skill Rank bonuses (`untrained` to `grandmaster`).
  * `MechaCompanionDeck.tsx`: Cyberware augmentations, mecha chassis sockets (`MechaSocketManager`), and companion/drone stat blocks.
  * `PlayerInventoryNotes.tsx`: Weight capacity meters, consumable ammo counters, discovered clues, and private notes.
* **GM Dynamic Inspector (`GMInspector.tsx`):**
  * Single-token inspection: Full 12-attribute matrix, armor DR, weapon profiles, called shot vulnerability, and tactical notes.
  * `MultiSelectCard.tsx`: Multi-token selection batch station for uniform damage/healing through `DamagePipeline`, mass AP reset, and synchronized condition toggles.
  * `PartySummaryCard.tsx`: Real-time squad overview displaying all party members' health, AP, passive awareness, and active conditions at a glance.

### **4.4. Cross-Cutting Systems**

* **Global Command Palette (`Cmd+K` / `Ctrl+K`):** Powered by `CommandPalette.jsx`. Quick actions:
  * `go: <map name>` (Switch active stage map).
  * `spawn: <entity name>` (Spawn token at viewport center).
  * `light: <mode>` / `weather: <preset>` (Adjust lighting and atmospheric weather).
  * `roll: <AST expression>` (Execute Tangent dice expression).
* **Pop-out Window Engine (`PopoutPortal.tsx`):** Uses modern web multi-window capabilities (`window.open` + React Portals). Allows GMs or players to detach the Left Module Catalog or Right Station into native OS windows across secondary monitors while maintaining shared Zustand and React Context state bridges.
* **Ergonomic Panel Collapse:** Left and Right rails collapse smoothly via hotkeys (`[` and `]`) or boundary chevron handles, expanding the central WebGPU stage to 100% viewport width for tactical focus.
* **Persistent Docks:** Bottom docks (`DiceRollerDock` via `Alt+D`, `CommLinkDock` via `Alt+C`) remain accessible across all views.

---

## **5. TypeScript Data Contracts (Tangent SF RP Engine)**

```typescript
// types/catalog.types.ts
export type CatalogCategory = 
  | 'story' 
  | 'scenes' 
  | 'personae' 
  | 'encounters' 
  | 'factions' 
  | 'lore' 
  | 'armory';

export interface CatalogNode {
  id: string;
  parentId: string | null;
  category: CatalogCategory;
  title: string;
  subtitle?: string;
  isVisibleToPlayers: boolean;
  metadata: Record<string, unknown>;
  children?: CatalogNode[];
}

// types/scene.types.ts
export interface SceneMap {
  id: string;
  title: string;
  hierarchyPath: string[]; // ['Universe', 'Cygnus Sector', 'Outpost Epsilon']
  imageUrl?: string;
  gridType: 'square' | 'hex';
  gridSize: number;
  gridScaleTier: 'encounter' | 'tactical' | 'strategic';
  hasPlayerParty: boolean;
  isCombatActive: boolean;
  lightingEnabled: boolean;
  weatherPreset?: string;
  walls: Array<{ id: string; p1: [number, number]; p2: [number, number]; wallType: string }>;
}

// types/tokens.types.ts (Aligned with VolatileSharder.ts)
export interface TokenInstance {
  id: string;
  entityId: string; // Links back to Folio Persona or Omnicortex Bestiary
  sceneId: string;
  x: number;
  y: number;
  z: number;
  elevation_ft: number;
  facing_degrees: number;
  current_hp: number;
  max_hp: number;
  armor_dr: number;
  ap_current: number;
  ap_max: number;
  active_conditions: string[];
  is_selected: boolean;
  is_hidden: boolean;
}

// types/action.types.ts (Tangent SF RP Combat Arbitration)
export interface TangentCombatAction {
  id: string;
  name: string;
  apCost: number;
  actionType: 'attack' | 'maneuver' | 'invocation' | 'skill';
  rangeCategory: 'melee' | 'close' | 'medium' | 'long' | 'extreme';
  calledShotTarget?: 'head' | 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'chassis';
  damageExpression?: string;
  damageType?: 'kinetic' | 'energy' | 'thermal' | 'cryo' | 'toxic';
  essenceCost?: number;
}
```

---

## **6. Phased Antigravity Task Breakdown (`task.md`)**

* [ ] **Phase 1: Shell Architecture & Layout State**
  * [ ] Create `uiLayoutStore.ts` for managing left/right sidebar collapse states, active catalog category, active cockpit tab, and popout window handles.
  * [ ] Build `TripartiteLayout.tsx` providing responsive 3-column CSS Grid with smooth collapse transitions and keyboard shortcuts (`[`, `]`, `F`).
  * [ ] Integrate the tripartite layout into the main application routing (`/stage` and `/vtt`) while keeping existing routes (`/foundry/*`, `/folio`, `/compendium`, `/dbm`) fully operational.

* [ ] **Phase 2: Center Stage Engine & Breadcrumb Tabs**
  * [ ] Build `StageBreadcrumbTabs.tsx` featuring macro campaign breadcrumbs and micro scene tabs with `PartyPin`, `CombatPulse`, and texture cache indicators.
  * [ ] Mount the existing `StageView.tsx` engine inside `StageViewportWrapper.tsx`, ensuring 100% preservation of all 8 compositor layers, WebGPU shaders, and in-situ cartography tools.
  * [ ] Construct `TokenContextualPill.tsx` for floating on-canvas token vitals (HP, AP, conditions, visibility) to minimize lateral mouse travel.

* [ ] **Phase 3: Left Zone Module Catalog Engine**
  * [ ] Implement `ModuleCatalogRail.tsx` with icons for all 7 taxonomies (Story, Scenes, Personae, Encounters, Factions, Lore, Armory).
  * [ ] Build `CatalogOutliner.tsx` using `@tanstack/react-virtual`, connecting directly to `CampaignContext` (scenarios and maps) and `DBMContext`/`FolioContext` (personae and items).
  * [ ] Integrate inline player-visibility eye toggles and right-click context menus.
  * [ ] Implement `@dnd-kit` drag sources bridging outliner nodes to WebGPU canvas drop coordinates for instant token spawning.
  * [ ] Build catalog search and tag-filtering bar.

* [ ] **Phase 4: Right Zone Player Cockpit & Dynamic Inspector**
  * [ ] Construct `ActionVitalsBar.tsx` for persistent Tangent HP, Trauma, Armor DR, and AP pool display.
  * [ ] Build `TangentActionDeck.tsx` categorizing AP weapon attacks, Called Shots target selector, Tactical Maneuvers, and Essence invocations with AST dice triggers.
  * [ ] Implement `MechaCompanionDeck.tsx` for cyberware, mecha chassis sockets, and drone control.
  * [ ] Build `GMInspector.tsx` supporting single-token inspection, `PartySummaryCard`, and `MultiSelectCard` batch management.
  * [ ] Integrate `PopoutPortal.tsx` to detach the right cockpit or left catalog into native OS windows via React Portals.

* [ ] **Phase 5: Global Coordination & Command Palette**
  * [ ] Extend `CommandPalette.jsx` (`Cmd+K`) with fuzzy commands for maps (`go:`), tokens (`spawn:`), lighting presets (`light:`), and dice macros (`roll:`).
  * [ ] Ensure seamless inter-dock communication between `DiceRollerDock` (`Alt+D`), `CommLinkDock` (`Alt+C`), and the active stage.

* [ ] **Phase 6: Automated Verification & Walkthrough Generation**
  * [ ] Run Playwright E2E tests validating 60 FPS WebGPU viewport navigation, drag-and-drop token spawning from Left Catalog to Stage, and panel collapsing.
  * [ ] Test multi-window state synchronization between detached PopoutPortals and the primary WebGPU stage.
  * [ ] Verify Tangent SF RP rules execution (AP spend, Called Shot trauma pipeline, Armor DR calculation).
  * [ ] Compile execution results and screenshots into `walkthrough.md`.

---

## **7. Verification & Quality Assurance Strategy**

1. **Canvas Performance Telemetry:**
   * Run the browser subagent with Chrome Performance DevTools attached.
   * Verify that viewport panning, cursor-anchored zooming, and rendering 50 animated tokens on the 8-layer compositor maintains $\ge$ 58 FPS.
2. **Cross-Zone Drag-and-Drop Integrity:**
   * Drag a Persona or Bestiary node from the Left Catalog onto the active stage grid tile.
   * Assert that `useEngineStore` registers the new token at the correct world coordinates and that the Right Inspector loads the entity's Tangent stat block.
3. **Multi-Window Synchronization Test:**
   * Detach the Player Cockpit into a secondary window via `PopoutPortal`.
   * Spend Action Points or take damage in the detached window; verify that the primary stage canvas token health/AP indicators update within 16ms across the shared store.
4. **Artifact Deliverable:**
   * Upon completion, Antigravity generates `walkthrough.md` documenting test results, component interaction benchmarks, and annotated screenshots of the completed tripartite layout.

# **Tab 2**

lets envision the stage in the center (our primary map view, with tabs for multiple maps within the module \- from single shot adventure to epic campaign setting)  
on the right we will have the player's assets (character sheets, companions, notes...)  
on the left we will have the entire module catalog tabbed for each category and listing all elements within the module (including story arcs, adventures, personas, scenes, factions, encounters, items, clues, etc)

---

Envisioning your VTT through this tripartite layout adopts an **Integrated Development Environment (IDE) / Digital Studio Paradigm** (similar to professional spatial applications like Unreal Engine, Blender, or VS Code). Rather than cluttering the screen with detached, overlapping floating windows, this architecture anchors key workflows into three persistent, coordinated zones:

* **Left Column (Information Engine):** The authoritative Module Catalog and Campaign Codex.  
*   
* **Center Stage (Spatial Viewport):** The WebGL tactical/regional map canvas with hierarchical scene tabs.  
*   
* **Right Column (Operational Cockpit):** Player characters, companions, active entity inspector, and personal notes.  
* 

Structuring these three zones effectively requires addressing spatial economy, cognitive load, and cross-panel interaction design.

### **1\. Left Zone: The Module Catalog (Hierarchical Information Architecture)**

The module catalog serves as the campaign's structural backbone. When a campaign spans from a single-session dungeon crawler to an epic multi-arc sandbox, a simple linear list will fail. To prevent visual fatigue and endless scrolling, organize this column into a **Category Rail \+ Nested Outliner** pattern.

#### **Primary Information Taxonomies**

Group the catalog into distinct functional categories:

* **Narrative Flow:** Story Arcs $\\rightarrow$ Quests / Acts $\\rightarrow$ Milestones.  
*   
* **Locations & Scenes:** World Map $\\rightarrow$ Regions $\\rightarrow$ Settlements $\\rightarrow$ Tactical Battlemaps.  
*   
* **Dramatis Personae & Factions:** Faction trees, NPC relationship maps, and individual persona stat blocks.  
*   
* **Encounters & Hazards:** Pre-configured combat groupings, dynamic ambushes, puzzles, and trap triggers.  
*   
* **Lore, Clues & Handouts:** Investigatory evidence, epistolary handouts, secrets, and historical records.  
*   
* **Compendium & Armory:** Magic items, regional equipment, spells, and environmental hazard rules.  
* 

#### **Interaction Mechanics**

* **Search & Faceted Filtering:** At the top of the rail, a fast fuzzy-filter input allows typing \#clue or @faction to instantly narrow the catalog across categories.  
*   
* **Direct Canvas Drag-and-Drop:**  
* 

  * *Drag an NPC or Encounter onto the Stage:* Spawns their tokens at the drop coordinates, pre-linked to their stat block and lighting settings.  
  *   
  * *Drag a Scene/Map entry onto the Stage:* Either switches the active canvas or opens that scene in a new stage tab.  
  *   
  * *Drag a Clue or Item to the Right Column:* Directly transfers ownership of an item or clue handout into a player's inventory or journal.  
  *   
* **Dual-State Visibility Toggles:** Each catalog item features an inline visibility eye icon. Unchecked items are visible only to the GM (rendered at 50% opacity); toggling them instantly reveals them to player viewports or pushes them as a handout card into the chat log.  
* 

### **2\. Center Zone: The Map Stage & Multi-Map Tab Navigation**

The center canvas is your primary spatial viewport. In a long campaign, managing dozens of locations requires moving beyond simple browser-style horizontal tabs, which overflow and become unreadable.

#### **Hierarchical Breadcrumb Navigation & Stage Tabs**

Replace flat tab bars with a **Two-Tiered Breadcrumb Tab Bar** along the top margin of the stage:

* **Tier 1 (Contextual Breadcrumbs):** Tracks macro location hierarchy, for example:  
* Epic Campaign \> Region: Sword Coast \> Location: Sunless Citadel  
*   
* **Tier 2 (Sub-Scene / Map Tabs):** Displays the active tactical levels or related views for that location:  
* \[Overworld Approach\] | \[Fortress Level 1 (Active)\] | \[Fortress Level 2\] | \[Under-Crypts\]  
*   
* **Tab State Badges:**  
* 

  * *Player Party Pin:* An icon indicating which tab currently hosts the player party tokens, ensuring the GM never loses track of where active encounters are running.  
  *   
  * *Encounter/Combat Badge:* A red pulsed indicator on tabs where combat or turn tracking is currently live.  
  *   
  * *Pre-load Indicator:* A subtle dot indicating whether map assets, lighting vectors, and tokens for that tab are fully cached into GPU memory for instant zero-latency switching.  
  * 

#### **Canvas Ergonomics**

* **Unrestricted Canvas Pan & Zoom:** Maps render on an infinite WebGL surface, allowing GMs to place off-map ambush assets and tokens outside the battlemap boundary without clipping. Zooming anchors strictly to the cursor position.  
*   
* **Quick Stage Switcher (**Cmd+P **/** Ctrl+P**):** For fast traversal across massive campaign modules without clicking through the left catalog, a quick-open palette allows the GM to type a map name and switch views instantly.  
* 

### **3\. Right Zone: Player Assets & Active Entity Station**

The right panel must balance two different needs depending on whether a player or a GM is looking at the screen: for players, it is their character cockpit; for GMs, it functions as a live inspector.

#### **For Players: The Operational Cockpit**

Players should not have to navigate a multi-page PDF replica during active encounters. The right column organizes their operational data using **Progressive Disclosure**:

* **Top Sub-Panel (Action Vitals):** Pinned, non-scrolling health bar, temporary hit points, armor class, passive perception, inspiration, and active status conditions (with remaining turn counters).  
*   
* **Middle Sub-Panel (Categorized Asset Tabs):**  
* 

  * *Actions & Spells:* Categorized by resource economy (Standard Actions, Bonus Actions, Reactions, Free Actions), complete with one-click roll buttons that stream interactive action cards to chat.  
  *   
  * *Companions / Summons / Mounts:* Secondary stat blocks for animal companions, familiars, or controlled vehicles, allowing players to manipulate them without separate sheets.  
  *   
  * *Inventory & Equipment:* Weight capacity meters, attuned magic items, consumable counters (rations, potions, ammunition), and equipped gear.  
  *   
  * *Notes & Quest Log:* Private scratchpad, revealed module clues, and tracked party objectives.  
  * 

#### **For the Game Master: The Dynamic Inspector**

When the GM clicks any token on the center stage (or any persona in the left catalog), the right panel switches to the **Inspector View**:

* Displays the full stat block, spell lists, legendary actions, and tactical GM notes for the selected entity.  
*   
* Enables multi-selection: selecting four goblin tokens shifts the right panel into a batch-management card (bulk-rolling initiative, applying uniform damage, or synchronizing conditions).  
*   
* A pinned switch allows the GM to quickly toggle the right panel between inspecting the selected enemy and monitoring the full party's summary vitals (party health overview, passive scores, and spell slots).  
* 

### **Ergonomic Layout and Responsive Orchestration**

To maintain spatial situational awareness on different monitor sizes, the three-column layout must adapt smoothly:

| Screen Zone | Default Width | Collapse / Minimize State | Primary Hotkey | Key UX Responsibility |
| :---- | :---- | :---- | :---- | :---- |
| **Left Rail (Module Catalog)** | 280px – 320px | Collapses to a 48px vertical icon strip; auto-expands on hover or pin | \[ or Cmd+1 | Campaign navigation, entity staging, lore lookups, and clue distribution.  |
| **Center Stage (Map Viewport)** | Flexible (Remaining Space) | Maximize Canvas: temporarily hides both side rails for full tactical focus | F or Space+F | Multi-tiered map rendering, dynamic lighting, token movement, and measurement.  |
| **Right Rail (Player / Inspector)** | 320px – 380px | Collapses to a compact vitals bar or detaches into a secondary OS window | \] or Cmd+2 | Action execution, resource tracking, sheet inspection, and companion control.  |

#### **Preventing Visual Claustrophobia**

* **Quick-Collapse Toggles:** Both sidebars should feature single-click collapse arrows on their inner borders. When tactical combat intensifies, collapsing both panels expands the central map to 100% of the screen width.  
*   
* **Detachable Secondary Windows:** Support native pop-out functionality (via browser windows or modern web APIs). Users running multi-monitor setups can pop the entire Module Catalog or Character Station onto a secondary display, leaving the primary screen purely for the map stage.  
*   
* **Contextual Overlays Over Floating Modals:** Keep character modifications (such as editing HP or toggling a status condition) inside inline editors within the right panel or via compact floating pills on the map token itself, completely eliminating modal popup windows that block the center stage.

# **Tab 1**

# **Ergonomic Canvas Architectures and Human Factors Engineering in Virtual Tabletop Systems**

Virtual Tabletop (VTT) systems occupy an unusually complex niche within human-computer interaction. They sit at the confluence of multi-user spatial whiteboards, computer-aided design software, real-time networking engines, and rules-dense role-playing simulations1. The fundamental tension in virtual tabletop user experience stems from an architectural origin error: the historical impulse to translate analog artifacts—specifically static grid mats, physical multi-page paper character sheets, and polyhedral dice—directly into flat, digital skeuomorphs1. When an interface attempts to replicate the physical constraints of paper within a web browser, it introduces severe operational friction, fragmented task flows, and visual claustrophobia1.  
Modern virtual tabletop interface design requires moving away from the recreation of physical tabletops toward the engineering of specialized spatial operating environments1. Achieving high usability across both Game Masters (GMs) and players demands a systematic appraisal of existing interaction paradigms, the elimination of extraneous cognitive load, and the integration of proven canvas design patterns drawn from contemporary digital creative tools1.

## **Comparative Typology of Virtual Tabletop Design Paradigms**

Existing virtual tabletop platforms approach spatial allocation, rule simulation, and interface chrome through divergent architectural philosophies. Understanding these paradigms reveals how different software models resolve or exacerbate cognitive friction.

| Platform | Architectural Paradigm | Spatial Strategy | Interaction Model | Primary Usability Bottleneck |
| :---- | :---- | :---- | :---- | :---- |
| **Foundry VTT** (v12–v14) | Extensible Spatial Operating System7 | Full-bleed WebGL canvas with collapsible peripheral cabinets and detached multi-windowing8 | Hierarchical vertical tool strips, radial token HUDs, and programmatic document sheets7 | Tool selection mode friction, dense nested configuration menus, and modifier-key cognitive burden11 |
| **Roll20** (Jumpgate Engine) | Modernized Hybrid WebGL Canvas12 | Top and left anchored interface chrome, floating chat sidebar, and unrestricted pan boundaries12 | Right-click context menus, legacy tool palette, and modal sheet overlays12 | Legacy modal layer switching ("Photoshop layer syndrome") and deeply nested sheet configurations15 |
| **Owlbear Rodeo** (v2.x) | Minimalist Collaborative Canvas17 | Full-bleed map viewport, floating unified bottom dock, and transient action bars18 | Contextual toolbars pinned to object selection with touch-first gesture support18 | Absence of native character sheet automation; vertical scene management challenges15 |
| **Fantasy Grounds Unity** | Relational Database Simulation Engine4 | Multiple internal floating sub-windows layered across a static background4 | Deeply nested radial menus, drag-and-drop numerical linking, and strict data trees15 | Extreme window sprawl, non-standard navigation paradigms, and steep initial learning curve15 |
| **Alchemy RPG** | Cinematic Narrative Media17 | Full-bleed environmental artwork, ambient motion overlays, and collapsed spatial grids17 | Panel-driven narrative tracking, integrated streaming audio HUD, and theater-of-the-mind focus17 | Inflexible for granular tactical combat, cover mechanics, or complex spatial maneuvers17 |
| **TaleSpire / Sigil** | Fully Volumetric 3D Environment24 | 3D perspective and orthographic camera views with manual elevation navigation24 | 3D transform gizmos, vertical cut-planes, and spatial asset manipulation26 | High asset preparation overhead, camera occlusion in multi-level structures, and hardware limits24 |

Minimalist platforms like Owlbear Rodeo and Cauldron treat the digital surface as a direct analogue for a physical vinyl grid mat4. By deliberately omitting character sheet management, deep rules calculation, and dynamic wall networks, they preserve the entire viewport for visual navigation4. This dramatically reduces onboarding friction, as participants interact with the system via basic spatial gestures: dragging tokens, drawing sketches, and clearing fog shapes15. The structural limitation of this paradigm emerges during complex tactical play, where participants must maintain external browser tabs, character builders, and dice logs, shifting the burden of synchronization onto human memory1.  
At the opposite end of the spectrum, platforms such as Foundry VTT and Fantasy Grounds Unity conceptualize the tabletop as a comprehensive rules engine wrapped inside an application runtime4. Foundry exposes low-level rendering layers through PixiJS and data modeling via its ApplicationV2 framework, allowing GMs to automate condition tracking, line-of-sight calculation, and dynamic sound occlusion8. However, this modularity places significant operational demands on the GM11. The interface must accommodate hundreds of divergent tools, often resulting in deeply stacked vertical toolbars and complex modifier-key requirements that cause frequent mode errors during active play7.  
Roll20’s Jumpgate engine represents an intermediate evolutionary path: an architectural modernization designed to eliminate legacy web performance bottlenecks12. Jumpgate transitioned the platform from standard DOM-heavy canvas rendering to an optimized WebGL pipeline, decoupling map movement from strict page bounds, introducing smooth cursor-anchored scaling, and cutting campaign memory footprints12. Nevertheless, Roll20 retains historical UI paradigms, notably a legacy modal layer system that causes frequent interaction failures when GMs inadvertently attempt to manipulate tokens from the background or lighting layers11.  
Cinematic platforms like Alchemy RPG depart from the tactical grid entirely, prioritizing atmospheric immersion through full-bleed scenic illustrations, ambient environmental audio, and minimalist narrative tracking17. While this successfully eliminates tactical bookkeeping for story-focused games, it cannot support spatial wargaming or complex geometric spells17. Meanwhile, 3D engines such as TaleSpire and Sigil introduce full volumetric verticality, cut-plane slicing, and spatial lighting24. These benefits, however, carry high preparation costs and camera navigation complexities that can disorient players during fast-paced encounters24.

## **Spatial Viewport Architecture and Peripheral Information Design**

The primary mandate of virtual tabletop layout design is the preservation of spatial situational awareness1. When non-spatial interface chrome—such as character sheets, combat trackers, chat streams, and asset drawers—intrudes permanently into the main viewport, the user experiences visual clutter that breaks immersion and hampers tactical appraisal10.  
Spatial canvas ergonomics require that the map viewport occupy the entire browser display area, with all peripheral controls rendered as floating, non-destructive surface overlays10. Foundry VTT’s transition to its Theme V2 and ApplicationV2 architecture demonstrates this principle: the right-hand sidebar was re-engineered as a full-height, collapsible cabinet that draws attention to the map canvas when closed while remaining easily accessible for reference8. Furthermore, ApplicationV2 natively supports detaching applications into dedicated operating system windows9. This multi-window capability allows multi-monitor users to offload text-heavy journal compendiums, rules indexes, and character sheets entirely onto secondary displays, keeping the primary game canvas uncluttered9.  
The visual competition between static toolbars and the canvas can be further minimized through transient contextual controls18. Owlbear Rodeo 2.2 exemplifies this by replacing fragmented interface buttons with a single unified bottom dock that houses maps, tokens, and scene assets in a single slide-out tray18. When not actively dragged into the scene, this dock remains collapsed, leaving the viewport clear18. Similarly, individual token manipulations should not depend on static, far-flung toolbars7. Using contextual action bars that appear directly above an active token reduces pointer travel and respects Fitts's Law, surfacing relevant adjustments—such as health toggles, elevation numbers, and condition badges—precisely where visual attention is focused18.  
A long-standing usability pitfall in VTT design is the reliance on the "Photoshop layer" metaphor11. In systems that enforce rigid global modes—such as a discrete Map Layer, Token Layer, and Lighting Layer—users must manually switch their operational context before clicking an asset12. When a GM inadvertently remains on the Map Layer and attempts to manipulate an NPC token, the interface fails to respond or drags the entire background map, causing significant user frustration11.  
Modern canvas architectures resolve this through an object-oriented, tag-filtered entity pipeline18. Rather than forcing the GM to change application-wide modes, every placed element exists as an interactive entity governed by internal lock states and contextual visibility flags9. Large background illustrations and environmental textures automatically adopt a locked state upon placement, making them click-transparent and allowing marquee selection boxes to target tokens without shifting the terrain beneath18. If a GM needs to conceal an entity, they do not migrate it to a separate "GM Layer"; they simply toggle the entity's player-visibility state via its contextual action bar, leaving it visible to the GM at reduced opacity18. For complex multi-tiered scenes, a structured placeables outliner provides a central search tree to filter, isolate, and batch-edit elements across vertical levels without altering the global interaction mode of the canvas18.  
The integration of dice rolling, operational character states, and chat logging demands similar streamlining1. Forcing players to inspect a multi-page modal sheet to look up combat statistics replicates analog limitations rather than utilizing digital efficiencies1. Players engage in "find-and-use" tasks during tactical moments: discovering a specific modifier, checking a remaining spell slot, or executing a damage roll1. This operational loop is best served by a dedicated action HUD or macro hotbar pinned to the bottom margin, exposing high-frequency actions directly10. Clicking an ability should resolve immediately, streaming a clear, self-contained action card into the chat log10. Where 3D physical dice simulations are integrated, they must operate via non-blocking rendering pipelines: dice trajectories rendered across the screen provide emotional satisfaction but must never intercept pointer inputs intended for the canvas below, nor should mechanical resolution stall while physics simulations complete11.

## **Environmental Manipulation: Dynamic Lighting, Occlusion, and Calibration**

Environmental subsystems transform a flat background illustration into an interactive, tactical problem space. However, poorly implemented environmental tools represent one of the largest drains on GM session preparation time.

| Environmental Subsystem | Legacy Implementation Model | Modern Ergonomic Solution | Operational Impact on Workflow |
| :---- | :---- | :---- | :---- |
| **Fog of War** | Bitmap mask painting; manual cutting and uncutting of polygon regions15. | Unified raycast dynamic line of sight integrated with token vision12. | Eliminates manual GM fog reveals during combat; maintains persistent explored memory automatically12. |
| **Wall Placement** | Manual segment-by-segment drawing; frequent switching between six or more wall sub-types11. | Native Universal Virtual Tabletop (.uvtt) vector parsing and node snapping38. | Reduces map prep time from hours to seconds; automates door, window, and lighting placement41. |
| **Grid Alignment** | Numeric pixel trial-and-error; manual adjustment of canvas dimensions via numeric dialogs35. | Visual 3-point calibration box overlay with automatic X/Y origin detection19. | Prevents cumulative pixel drift and scaling mismatches across large battlemaps36. |
| **Movement & Ruler** | Separate linear measurement tool; clears instantly upon mouse release11. | Integrated Token Drag Measurement with waypoint tracking and private Alt routing8. | Unifies range measurement directly with movement intent, eliminating tool-switching overhead8. |

Dynamic lighting depends on 2D raycasting projected from a token's sensory origin against vector occlusion segments38. An effective user experience requires the rendering pipeline to differentiate between three visual states:

> 1. Active Line of Sight: An illuminated, continuously updated field containing dynamic tokens, visual effects, and environmental animations12.  
> 2. Explored Memory: Regions previously observed but no longer in direct view, rendered in a subdued, monochromatic, or sepia wash that displays static terrain while concealing dynamic entities4.  
> 3. Unexplored Darkness: An opaque masking layer that conceals geometry, hazards, and unvisited regions38.

Ergonomic friction in environmental controls typically stems from scattered configuration settings12. In legacy platforms, configuring vision required moving between global scene settings, dynamic lighting tabs, and individual token ownership menus12. Modern engines consolidate these controls into an environmental palette that updates the scene in real time as the GM adjusts lighting radius, luminosity, and darkness thresholds, eliminating round-trip menu navigation12.  
A notable quality-of-life advancement in recent engine revisions—such as Foundry v13 and Roll20 Jumpgate—is the implementation of Token Drag Measurement8. Historically, a player had to activate a ruler tool, measure a route around obstacles, deselect the tool, select their miniature, and execute the move8. Integrated drag measurement combines these steps into a single action: dragging a token projects a live ruler trajectory highlighted in the user's accent color, allowing them to tap keys (such as the spacebar) to place intermediate pathing waypoints around corners8. Crucially, holding a modifier key like Alt enables private measurement, allowing a participant or GM to calculate reach, cover, and line of sight without revealing their intended path to the rest of the table8.  
Grid calibration represents another major source of prep friction35. When maps contain pre-printed grid lines, small discrepancies between the software's mathematical grid and the image's raster lines accumulate across a large canvas, leading to tokens drifting off-center35. Asking a GM to manually type pixel measurements (such as testing 70px vs 100px vs 140px) is an outdated approach35. The optimal interface pattern is a visual 3-point calibration tool, where the GM drags a semi-transparent 3x3 square over any nine grid cells on the graphic, allowing the engine to calculate scale and offset coordinates automatically19. Furthermore, native integration of the Universal Virtual Tabletop (.uvtt / .dd2vtt) standard eliminates manual alignment entirely by parsing background images, grid scales, dynamic light placements, and wall vectors directly upon import38.

## **Cognitive Ergonomics and Usability Friction**

Tabletop gaming places substantial demands on working memory, requiring players and GMs to interpret game rules, follow narrative developments, and manage social interactions simultaneously1. When a virtual tabletop introduces extraneous cognitive load—forcing mental effort toward operating the software interface rather than playing the game—overall engagement drops and decision fatigue sets in1.  
A major usability challenge arises when digital interfaces attempt to replicate physical paper character sheets directly on screen1. Physical sheets are designed for analog flexibility, allowing players to scan a page, jot notes in margins, and track resources with an eraser1. When translated verbatim into a browser window, this layout creates large, static modals that obscure the battlemap and require excessive clicking to locate core combat actions1. Digital environments excel when they provide dynamic filtering and progressive disclosure: the interface should surface contextual action buttons and relevant resource counters during encounters, reserving expansive reference sheets for out-of-combat management and leveling1.  
Game Masters carry a particularly heavy cognitive load1. While managing pacing, narration, and tactical adversaries, GMs cannot afford to memorize obscure, system-specific interface conventions1. A frequent criticism of advanced platforms like Foundry VTT is the heavy reliance on complex modifier keys for map preparation: remembering whether to hold Ctrl, Alt, or Shift to draw curved walls, toggle snapping, or set directional sight lines adds unnecessary friction11. If a GM only runs sessions every few weeks, these non-standard shortcuts are easily forgotten, requiring a frustrating re-learning curve before every session11.  
On the player side, the most common usability failures involve selection confusion and unclear iconography11. Novice players frequently encounter input deadlocks—such as being unable to move their tokens because the canvas background was accidentally clicked, an active text entry box held cursor focus, or an uncommitted tool remained selected on the toolbar11. Furthermore, VTTs often employ abstract, idiosyncratic icons for critical functions, such as obscure symbols for journal notes, condition toggles, or vision modes8. Without explicit text labels or clear contextual affordances, players experience decision paralysis, requiring constant GM intervention to complete basic mechanical tasks11.

## **Asymmetric Role-Based Interface Architecture**

A virtual tabletop is inherently asymmetrical: GMs and players share the same spatial canvas, but their goals, permissions, and operational rhythms are fundamentally different1. An interface that presents the same global chrome to both roles, merely disabling unavailable features with grayed-out buttons, introduces visual clutter and degrades usability for players7.

| Dimension | Game Master (Administrative Host) | Player (Operational Participant) |
| :---- | :---- | :---- |
| **Primary Objective** | Scene orchestration, pacing, encounter balancing, and hidden state management1. | Tactical positioning, character immersion, resource tracking, and action execution1. |
| **Information Scope** | Omniscient: full visibility of hidden entities, unexplored fog, lighting boundaries, and secret notes12. | Restricted: vision limited strictly to owned token sightlines and revealed handouts12. |
| **Interface Needs** | High-density administrative controls, placeables outliners, scene trees, and global command palettes6. | Minimalist canvas view, persistent action trays, non-intrusive dice rollers, and direct token HUDs20. |
| **Interaction Cadence** | Multi-entity management, rapid switching between scene configurations, and real-time rule lookups1. | Focused on a single actor, turn-based action triggers, and reactive dice checks1. |

Handling this asymmetry cleanly requires a three-layer adaptive interface design that reshapes the UI based on authorization and context46.  
The first layer is permission-based structural adaptation46. Elements that a player lacks authority to use must be removed entirely from the Document Object Model rather than simply deactivated7. A player should never see inactive scene navigation bars, wall drawing tools, ambient light controls, or hidden monster indicators marked with slashed-eye icons; their interface must remain clean and uncluttered by administrative chrome8.  
The second layer is role-based functional adaptation46. The workspace layout should reorganize around the primary responsibilities of the role46. The GM's interface should prioritize staging utilities: a persistent placeables outliner, scene navigation drawers, and multi-window docks for combat tracking and compendiums9. Conversely, the player’s view should boot into an uncluttered canvas focused on their assigned token, accompanied by an operational character tray pinned along the bottom margin for rapid ability execution18.  
The third layer is behavior-based contextual adaptation46. The application should adjust its visible tools based on the current state of play46. When an encounter begins, the interface smoothly transitions into a Combat State: the initiative order surfaces, active combatants are subtly highlighted on the canvas, and out-of-combat utilities (such as drawing tools and map configuration drawers) minimize automatically10. Once the encounter concludes, the system reverts to an Exploration State, bringing movement measurement, journal pins, and ambient interactions back to the foreground10.

## **Modern Interaction Patterns for Canvas-Centric Systems**

Modern web-based creative applications—including Figma, Miro, Linear, and tldraw—have established intuitive patterns for working within infinite 2D spaces2. Integrating these proven canvas interaction standards significantly improves the virtual tabletop user experience3.

| Interaction Pattern | Underlying Human Factors Principle | Virtual Tabletop Implementation |
| :---- | :---- | :---- |
| **Command Palette** (Cmd+K)6 | Eliminates hierarchical menu navigation detours; turns intent directly into action6. | Global fuzzy search allowing GMs to spawn monsters, adjust lighting, change scenes, and trigger rolls instantly6. |
| **Floating Contextual Pills** \[cite: 18, 20\] | Fitts's Law optimization: minimizes mouse travel distance to interactive controls7. | Contextual actions (HP meters, conditions, elevation, visibility) anchored directly above selected tokens18. |
| **Cursor-Anchored Zooming** \[cite: 12, 14\] | Prevents focal displacement and spatial disorientation during viewport scaling12. | Mouse wheel zooming scales centered on the cursor position rather than the viewport center12. |
| **Infinite Margin Pan** \[cite: 12, 14\] | Prevents viewport edge clipping and provides functional staging space14. | Canvas pans smoothly beyond image boundaries, offering GM staging areas for hidden assets12. |
| **Touch Gesture Disambiguation** \[cite: 10, 14, 50\] | Eliminates mode confusion on multi-touch tablets and digital table screens10. | Distinguishes between single-finger panning, two-finger pinch-zooming, and deliberate token translation10. |

As digital tabletops accumulate features, traditional nested menus struggle to scale efficiently46. Providing a global Command Palette accessible via Cmd+K or Ctrl+K gives power users a direct shortcut to any tool or asset6. Instead of hunting through compendium folders or multi-tiered settings menus, a GM can simply type fuzzy search strings—such as typing "Goblin" to summon a monster directly under the cursor, typing "Darkness" to dim ambient lighting, or typing "Short Rest" to reset party resources6. This preserves operational momentum and prevents administrative tasks from interrupting session pacing6.  
Spatial menu ergonomics also require careful consideration of where tools appear11. While radial menus (pie menus) offer rapid muscle-memory selection for small option sets, they scale poorly beyond six to eight items and can create visual clutter when nested12. Floating linear action bars positioned adjacent to selected tokens offer a cleaner alternative18. By displaying clear icons and tooltips right beside the selected entity, they drastically reduce pointer travel across large high-resolution monitors without obscuring adjacent map tiles18.  
Viewport navigation must also align with modern digital expectations12. In legacy systems that lock the camera strictly to the background image dimensions, tokens placed near the edges often have their status rings, nameplates, and contextual menus clipped by the browser boundary12. Providing an infinite canvas buffer around the battlemap allows users to center any portion of the play space comfortably, while giving GMs a convenient staging ground to organize enemy reinforcements and ambushes outside player sightlines12. Furthermore, scroll-wheel zooming must anchor to the pointer's coordinates rather than the screen center, ensuring users can inspect tactical details without losing their visual focus12.  
Finally, accommodating tablets and touch-screen gaming tables requires dedicated touch ergonomics38. Interfaces must maintain minimum interactive touch targets of 44x44 CSS pixels and eliminate reliance on hover-dependent states2. Gesture pipelines must cleanly distinguish between viewport navigation (such as single-finger panning and two-finger pinch zooming) and object interaction10. Implementing a small touch-hold threshold (such as 150ms) before initiating a token drag prevents players from accidentally moving figures across the board when they simply intended to pan their view10.

## **Usability Heuristics and Interface Design Blueprint**

Synthesizing human factors engineering principles, cognitive load theory, and the technical patterns of successful canvas applications yields a set of core usability heuristics specifically tailored for virtual tabletop design.

| Heuristic Principle | Human Factors Focus | Concrete Implementation Mechanism |
| :---- | :---- | :---- |
| **Visibility of System Status** \[cite: 3\] | Non-intrusive ambient awareness of critical state3. | Subtle, non-blocking UI indicators for network latency8, world pause states10, active measurement units, and player-hidden entity opacity7. |
| **Recognition Over Recall** \[cite: 3\] | Contextual affordances that eliminate memorized inputs3. | Interactive drag handles and contextual action bars that display actions directly, avoiding hidden modifier-key combos11. |
| **State Preservation & Resilience** \[cite: 37\] | Protection against accidental session interruptions37. | Encounter state, active initiative orders, and camera coordinates continuously saved to room metadata to survive browser refreshes37. |
| **Error Prevention and Forgiveness** \[cite: 3, 12\] | Non-destructive edits and comprehensive undo pipelines8. | Multi-level scene-specific Undo/Redo (Cmd+Z / Cmd+Y) covering object movement and fog cuts, with confirmation guards for combat deletions8. |
| **Progressive Disclosure** \[cite: 46\] | Balancing beginner simplicity with power-user depth46. | Minimalist default HUDs for basic play, with advanced lighting, geometry, and macro scripting accessible via command search or secondary panels6. |

Translating these heuristics into an actionable system architecture requires a clean division between the spatial canvas, the contextual chrome layer, and the environmental data pipeline.  
The spatial foundation must be built on an unrestricted WebGL viewport that occupies the entire browser display, surrounded by an infinite pan margin12. The rendering engine should treat all elements—background art, tokens, overhead tiles, dynamic light emitters, and sensory boundaries—as classified entities within an object-oriented canvas rather than splitting interaction across rigid global modal layers9. Background imagery and structural tiles should automatically default to a locked state upon placement, making them click-transparent and allowing marquee selections to target tokens smoothly without shifting the underlying battlemap18.  
Interface chrome must avoid permanent screen clutter by adopting transient, selection-driven layouts7. Persistent chrome should be restricted to a slim, semi-transparent top utility strip containing scene navigation, vertical level selection, and the global command search trigger8. Static sidebars and tool columns should be replaced with a collapsible cabinet dock along the right boundary for chat and compendiums, paired with a unified asset tray at the bottom that slides out only during active staging10. Primary entity management occurs directly on the canvas: selecting a token summons a compact floating action pill providing instant adjustments for hit points, conditions, elevation, and player visibility without requiring lateral round-trips to distant toolbars18. For keyboard-first administration, a global Cmd+K command palette enables GMs to spawn creatures, trigger environmental adjustments, and change maps with minimal menu navigation6.  
For players, the interface should strip away all GM-specific administrative chrome, providing an unobstructed view of the battlefield paired with an operational character bar pinned along the bottom margin18. This bar presents high-frequency combat actions, resource meters, and primary abilities in a clear, single-click format34. Activating an action sends structured cards into the chat log while rendering 3D dice across the screen using click-transparent overlays that resolve instantly without blocking tactical play11.  
Environmental management should prioritize automation and fast calibration41. The map importer should natively parse .uvtt data to extract pixel dimensions, dynamic lights, and wall occlusion polygons instantly upon file drop38. When importing ungridded raster images, a visual 3-point alignment box allows the GM to calibrate scale and offsets in seconds, avoiding manual numeric entry19. Dynamic raycast lighting and fog of war should function within a unified visibility system, smoothly updating active lines of sight while preserving visited areas in a subtle, persistent memory wash12. Finally, movement should incorporate native Token Drag Measurement, projecting clear distances and path waypoints directly during token translation, complete with an Alt key toggle for private route planning8.  
By abandoning the skeuomorphic constraints of analog paper sheets and modal raster layers, this architecture aligns virtual tabletop software with modern spatial interaction standards1. It minimizes extraneous cognitive load, giving Game Masters fast, flexible control over their worlds while providing players with an intuitive, immersive window into the adventure1.

#### **Works cited**

> 1. It's now easier to make a VTT than it is to use a VTT. : r/VTT \- Reddit, [https://www.reddit.com/r/VTT/comments/1vizeeo/its\_now\_easier\_to\_make\_a\_vtt\_than\_it\_is\_to\_use\_a/](https://www.reddit.com/r/VTT/comments/1vizeeo/its_now_easier_to_make_a_vtt_than_it_is_to_use_a/)  
> 2. UI/UX Design Foundations Explained | PDF | Usability \- Scribd, [https://www.scribd.com/document/969451649/UI-UX-Design-Handbook-Updated](https://www.scribd.com/document/969451649/UI-UX-Design-Handbook-Updated)  
> 3. When the canvas starts acting, who's really in control? \- UX Collective, [https://uxdesign.cc/when-the-canvas-starts-acting-whos-really-in-control-0128f641223c](https://uxdesign.cc/when-the-canvas-starts-acting-whos-really-in-control-0128f641223c)  
> 4. VTT overview \- Reddit, [https://www.reddit.com/r/VTT/comments/1paew00/vtt\_overview/](https://www.reddit.com/r/VTT/comments/1paew00/vtt_overview/)  
> 5. Cognitive Load | Laws of UX, [https://lawsofux.com/cognitive-load/](https://lawsofux.com/cognitive-load/)  
> 6. The 10 UI/UX Trends Everyone Is Copying in 2026 \- Medium, [https://medium.com/@designstudiouiux/the-10-ui-ux-trends-everyone-is-copying-in-2026-dbe5bc275efb](https://medium.com/@designstudiouiux/the-10-ui-ux-trends-everyone-is-copying-in-2026-dbe5bc275efb)  
> 7. Phils UI Tweaks | Foundry Virtual Tabletop, [https://foundryvtt.com/packages/phils-foundry-ui-tweaks](https://foundryvtt.com/packages/phils-foundry-ui-tweaks)  
> 8. Release 13.332 | Foundry Virtual Tabletop, [https://foundryvtt.com/releases/13.332](https://foundryvtt.com/releases/13.332)  
> 9. Release 14.349 \- Foundry Virtual Tabletop, [https://foundryvtt.com/releases/14.349](https://foundryvtt.com/releases/14.349)  
> 10. Release 13.341 \- Foundry Virtual Tabletop, [https://foundryvtt.com/releases/13.341](https://foundryvtt.com/releases/13.341)  
> 11. My Problems with the UX (User Experience) : r/FoundryVTT \- Reddit, [https://www.reddit.com/r/FoundryVTT/comments/15pdsxm/my\_problems\_with\_the\_ux\_user\_experience/](https://www.reddit.com/r/FoundryVTT/comments/15pdsxm/my_problems_with_the_ux_user_experience/)  
> 12. VTT Quality of Life & Feature Improvements \- Roll20 Help Center, [https://help.roll20.net/hc/en-us/articles/25289127045143-VTT-Quality-of-Life-Feature-Improvements](https://help.roll20.net/hc/en-us/articles/25289127045143-VTT-Quality-of-Life-Feature-Improvements)  
> 13. Roll20's Improved Tabletop Engine, [https://pages.roll20.net/redesign](https://pages.roll20.net/redesign)  
> 14. The Jumpgate Beta for Pro Users Has Arrived\! \- Roll20, [https://app.roll20.net/forum/post/11843344/the-jumpgate-beta-for-pro-users-has-arrived](https://app.roll20.net/forum/post/11843344/the-jumpgate-beta-for-pro-users-has-arrived)  
> 15. My experience with popular D\&D VTT tools : r/rpg \- Reddit, [https://www.reddit.com/r/rpg/comments/1mp17wx/my\_experience\_with\_popular\_dd\_vtt\_tools/](https://www.reddit.com/r/rpg/comments/1mp17wx/my_experience_with_popular_dd_vtt_tools/)  
> 16. Announcing the New Character Sheet for D\&D 2024 \- Roll20, [https://app.roll20.net/forum/permalink/11942473/](https://app.roll20.net/forum/permalink/11942473/)  
> 17. The Best Roll20 Alternatives in 2026: An Honest Roundup, [https://erpg.app/blog/best-roll20-alternatives-2026/](https://erpg.app/blog/best-roll20-alternatives-2026/)  
> 18. Owlbear Rodeo 2.2 Release Notes, [https://blog.owlbear.rodeo/owlbear-rodeo-2-2-release-notes/](https://blog.owlbear.rodeo/owlbear-rodeo-2-2-release-notes/)  
> 19. Owlbear Rodeo 2.1 Release Notes, [https://blog.owlbear.rodeo/owlbear-rodeo-2-1-release-notes/](https://blog.owlbear.rodeo/owlbear-rodeo-2-1-release-notes/)  
> 20. Anyway to hide the little pop-up token menu? : r/OwlbearRodeo, [https://www.reddit.com/r/OwlbearRodeo/comments/1h2z712/anyway\_to\_hide\_the\_little\_popup\_token\_menu/](https://www.reddit.com/r/OwlbearRodeo/comments/1h2z712/anyway_to_hide_the_little_popup_token_menu/)  
> 21. Layers / levels plugin? : r/OwlbearRodeo \- Reddit, [https://www.reddit.com/r/OwlbearRodeo/comments/180bpfm/layers\_levels\_plugin/](https://www.reddit.com/r/OwlbearRodeo/comments/180bpfm/layers_levels_plugin/)  
> 22. Any really good looking 5e FGU Themes? : r/FantasyGrounds \- Reddit, [https://www.reddit.com/r/FantasyGrounds/comments/nqsl9l/any\_really\_good\_looking\_5e\_fgu\_themes/](https://www.reddit.com/r/FantasyGrounds/comments/nqsl9l/any_really_good_looking_5e_fgu_themes/)  
> 23. Am I alone in wanting a crazy simple VTT over a complex one? : r/rpg, [https://www.reddit.com/r/rpg/comments/1ems8pn/am\_i\_alone\_in\_wanting\_a\_crazy\_simple\_vtt\_over\_a/](https://www.reddit.com/r/rpg/comments/1ems8pn/am_i_alone_in_wanting_a_crazy_simple_vtt_over_a/)  
> 24. Damning review of the new Wizards 3D virtual table top from Polygon, [https://www.reddit.com/r/dndnext/comments/1j9kwzy/damning\_review\_of\_the\_new\_wizards\_3d\_virtual/](https://www.reddit.com/r/dndnext/comments/1j9kwzy/damning_review_of_the_new_wizards_3d_virtual/)  
> 25. TaleSpire.CameraToolsPlugin 3.3.0 \- NuGet, [https://www.nuget.org/packages/TaleSpire.CameraToolsPlugin/3.3.0](https://www.nuget.org/packages/TaleSpire.CameraToolsPlugin/3.3.0)  
> 26. Height slider does not go above 45 tiles in orthographic view, [https://feedback.talespire.com/p/height-slider-does-not-go-above-45-tiles-in-orthographic-view](https://feedback.talespire.com/p/height-slider-does-not-go-above-45-tiles-in-orthographic-view)  
> 27. The Ultimate Player's Guide to Talespire \- Tales Tavern, [https://talestavern.com/the-ultimate-players-guide-to-talespire/](https://talestavern.com/the-ultimate-players-guide-to-talespire/)  
> 28. My "How does Talespire work" post \- Reddit, [https://www.reddit.com/r/talespire/comments/18u0qvv/my\_how\_does\_talespire\_work\_post/](https://www.reddit.com/r/talespire/comments/18u0qvv/my_how_does_talespire_work_post/)  
> 29. Tired of Roll20? 5 Alternatives Worth Trying in 2026 \- StoryRoll, [https://storyroll.app/blog/tired-of-roll20-alternatives](https://storyroll.app/blog/tired-of-roll20-alternatives)  
> 30. Introduction to Development | Foundry Virtual Tabletop, [https://foundryvtt.com/article/intro-development/](https://foundryvtt.com/article/intro-development/)  
> 31. ApplicationV2 | Foundry VTT Community Wiki, [https://foundryvtt.wiki/en/development/api/applicationv2](https://foundryvtt.wiki/en/development/api/applicationv2)  
> 32. Jumpgate Beta, Shared Dice Rolls on Roll20 Characters, [https://blog.roll20.net/posts/roll20-march-change-log-jumpgate-beta-shared-dice-rolls-on-roll20-characters/](https://blog.roll20.net/posts/roll20-march-change-log-jumpgate-beta-shared-dice-rolls-on-roll20-characters/)  
> 33. Year in Review: Sixth Anniversary Edition | Foundry Virtual Tabletop, [https://foundryvtt.com/article/year-in-review-2026/](https://foundryvtt.com/article/year-in-review-2026/)  
> 34. Solo Narrative RPG Design Research \- Kenny's Thinking Garden, [https://slightintent.com/research/Solo-Narrative-RPG-Design-Research](https://slightintent.com/research/Solo-Narrative-RPG-Design-Research)  
> 35. Foundry VTT Battle Map Setup in 5 Minutes (2026 Guide), [https://www.texttotabletop.com/blog/foundry-vtt-battle-map-setup](https://www.texttotabletop.com/blog/foundry-vtt-battle-map-setup)  
> 36. Release 0.5.6 | Foundry Virtual Tabletop, [https://foundryvtt.com/releases/5.69](https://foundryvtt.com/releases/5.69)  
> 37. ervwalter/swade-initiative-tracker \- GitHub, [https://github.com/ervwalter/swade-initiative-tracker](https://github.com/ervwalter/swade-initiative-tracker)  
> 38. screen-as-table, minis on acrylic, dynamic lighting, with offline play, [https://www.reddit.com/r/DnDIY/comments/1vn83fb/i\_built\_a\_free\_vtt\_specifically\_for\_physical/](https://www.reddit.com/r/DnDIY/comments/1vn83fb/i_built_a_free_vtt_specifically_for_physical/)  
> 39. Release 14.353 \- Foundry Virtual Tabletop, [https://foundryvtt.com/releases/14.353](https://foundryvtt.com/releases/14.353)  
> 40. Release 14.364 \- Foundry Virtual Tabletop, [https://foundryvtt.com/releases/14.364](https://foundryvtt.com/releases/14.364)  
> 41. Roll20 vs Foundry for Busy DMs: setup time, cost, learning curve, [https://gmcrafttavern.com/roll20-vs-foundry-busy-dms-setup-cost-learning-curve/](https://gmcrafttavern.com/roll20-vs-foundry-busy-dms-setup-cost-learning-curve/)  
> 42. Release Notes | dddice, [https://dddice.com/changelog](https://dddice.com/changelog)  
> 43. Partnerships | Foundry Virtual Tabletop, [https://foundryvtt.com/article/partnerships/](https://foundryvtt.com/article/partnerships/)  
> 44. Missed opportunity with maps : r/dndbeyond \- Reddit, [https://www.reddit.com/r/dndbeyond/comments/1tk4kwi/missed\_opportunity\_with\_maps/](https://www.reddit.com/r/dndbeyond/comments/1tk4kwi/missed_opportunity_with_maps/)  
> 45. 2025 Change Log \- Roll20 Help Center, [https://help.roll20.net/hc/en-us/articles/38597501957015-2025-Change-Log](https://help.roll20.net/hc/en-us/articles/38597501957015-2025-Change-Log)  
> 46. 7 SaaS UI Design Trends for 2026, Shown With Real Screens, [https://www.saasui.design/blog/7-saas-ui-design-trends-2026](https://www.saasui.design/blog/7-saas-ui-design-trends-2026)  
> 47. Minimalist UX Design: How Design Minimalism Boost Web Visibility, [https://thefinch.design/minimalism-in-ux-design/](https://thefinch.design/minimalism-in-ux-design/)  
> 48. Design Resources — 511 Free Tools for UI/UX Designers (2026), [https://www.sakshamux.com/](https://www.sakshamux.com/)  
> 49. How Miro AI Supercharges Product Design and Team Workflows, [https://www.upwork.com/resources/what-is-miro-ai](https://www.upwork.com/resources/what-is-miro-ai)  
> 50. TouchVTT | Foundry Virtual Tabletop, [https://foundryvtt.com/packages/touch-vtt](https://foundryvtt.com/packages/touch-vtt)  
> 51. Touchscreen & Foundry Basics | Level Up Crafting | Land of Prova, [https://www.youtube.com/watch?v=CQyGp-w3iDM](https://www.youtube.com/watch?v=CQyGp-w3iDM)  
> 52. Rolling the dice: Jayme Boucher on Roll20's mission to empower, [https://www.mojo-nation.com/rolling-the-dice-jayme-boucher-on-roll20s-mission-to-empower-gamers-everywhere/](https://www.mojo-nation.com/rolling-the-dice-jayme-boucher-on-roll20s-mission-to-empower-gamers-everywhere/)  
> 53. Best Virtual Tabletops for D\&D in 2026: Every VTT Compared, [https://storyroll.app/blog/best-virtual-tabletops-dnd-2026](https://storyroll.app/blog/best-virtual-tabletops-dnd-2026)