# 🚀 TANGENT SF ADE: Master Implementation Plan (Cartography & Map Generation)

**Document Path:** `docs/plan/MAP GEN – MASTER_IMPLEMENTATION_PLAN.md`  
**Workspace:** `TANGENT SF RP react project` (`tangent-sfr` v1.0.0)  
**Last Revised:** October 7, 2026  
**Status:** Live Architectural Roadmap — Aligned with Production State  
**Core Philosophy:** **Zero AI Image Generation.** 100% deterministic Procedural Content Generation (PCG), LLM-driven JSON logic scripting, Human-in-the-Loop semantic painting, and Native VTT metadata export.

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Current State Audit](#1-executive-summary--current-state-audit)
2. [Target Directory Structure (Production Alignment)](#2-target-directory-structure-production-alignment)
3. [Core Tech Stack (Production Baseline)](#3-core-tech-stack-production-baseline)
4. [Data Architecture: The "Units Data" Polymorphic Schema & Property Matrix](#4-data-architecture-the-units-data-polymorphic-schema--property-matrix)
5. [Phase 1: Units Data Catalog & Universal Asset Tree UI](#5-phase-1-units-data-catalog--universal-asset-tree-ui)
6. [Phase 2: External Sourcing, Ingestion Pipeline & Asset Studio ("Tile & Asset Forge")](#6-phase-2-external-sourcing-ingestion-pipeline--asset-studio-tile--asset-forge)
7. [Phase 3: Canvas & Semantic Painting Engine (Stage Viewport)](#7-phase-3-canvas--semantic-painting-engine-stage-viewport)
8. [Phase 4: The PCG Math Engine](#8-phase-4-the-pcg-math-engine)
9. [Phase 5: LLM Logic Co-Pilot & Scripting Executor](#9-phase-5-llm-logic-co-pilot--scripting-executor)
10. [Phase 6: Complex Entities, Vehicles & Zone Freezing](#10-phase-6-complex-entities-vehicles--zone-freezing)
11. [Phase 7: Native VTT Exporting (.dd2vtt & Foundry VTT)](#11-phase-7-native-vtt-exporting-dd2vtt--foundry-vtt)
12. [Phase 8: Legacy MapMaker Convergence & Sunsetting Plan](#12-phase-8-legacy-mapmaker-convergence--sunsetting-plan)
13. [AI Agent Execution & Verification Protocol](#13-ai-agent-execution--verification-protocol)

---

## 🔍 1. Executive Summary & Current State Audit

The **Adventure Development Environment (ADE)** within Tangent SF RP unites narrative authoring, Omnicortex database entities, and tactical Virtual Tabletop (VTT) map creation into a unified "Glass-Cockpit" workspace. 

Earlier drafts of this plan assumed a greenfield `/tangent-ade` project using generic frameworks (Next.js/Vue, OpenAI/Anthropic SDKs). This revision grounds the plan in the **actual live production codebase** (`tangent-sfr` v1.0.0) where substantial foundational infrastructure is already operational and verified across 635 automated test assertions.

### 1.1 Capability Audit: Built vs In-Progress

| Domain / Subsystem | Current Codebase Status | Key Source Files | Gap / Remaining Work |
| :--- | :--- | :--- | :--- |
| **Stage 2D Canvas** | ✅ **Operational (PixiJS v8)** | `src/components/VTT/StageView.tsx`<br>`src/engine/canvas/RendererContext.ts`<br>`src/engine/canvas/LayerCompositor.ts` | Complete migration of legacy Konva tools; finalize auto-tile shaders |
| **Z-Layer Compositing** | ✅ **Operational (9 Z-Layers)** | `src/engine/canvas/LayerCompositor.ts` (`ZLayer`) | Ensure decal/underlay flattening pipeline for export |
| **Grid & Transforms** | ✅ **Operational** | `src/engine/math/CoordinateEngine.ts`<br>`src/components/VTT/hooks/useStageGestures.ts` | Connect world-to-grid change throttles to semantic zone brushes |
| **Line-of-Sight & BVH** | ✅ **Operational** | `src/engine/vision/BVHBuilder.ts`<br>`src/schemas/vttWallSchema.ts`<br>`src/services/raycastVisionService.ts` | Collinear segment reduction for VTT export optimization |
| **Dynamic Lighting** | ✅ **Operational** | `src/engine/vision/LightSourceManager.ts`<br>`src/engine/3d/lighting/Lighting3DManager.ts` | Multi-source emission compiler for Universal VTT (.dd2vtt) |
| **External Ingestion & Sourcing** | 🔄 **Partially Built** | `src/pages/Foundry/MapMaker/map/MapAssetManagerModal.jsx`<br>`src/engine/assets/FoundryIngestion.ts`<br>`src/engine/assets/OPFSCacheWorker.ts` | Universal batch importer, sprite sheet slicer, alpha cleaner & OPFS local storage |
| **Asset & Tile Studio ("Forge")** | 🔄 **Partially Built** | `src/pages/Foundry/MapMaker/map/AssetDrawingStudio.jsx`<br>`src/pages/Foundry/ElementForge/` | In-situ polygon collision editor, light/seat placer, and PixiJS tint customizer |
| **Units Data Schema** | 🔄 **Partially Built** | `src/pages/Foundry/ElementForge/elementSchemas.js`<br>`src/components/VTT/ArchitectDesignPalette.tsx` | Formalize polymorphic `AssetUnit` schema + dynamic `tree_path` parser |
| **PCG: BSP Deckplans** | ✅ **Operational** | `src/engine/cartography/BSPDeckplanGenerator.ts` | Expose BSP room/corridor parameters to LLM script executor |
| **PCG: Noise & Tectonics** | ✅ **Operational** | `src/pages/Foundry/MapMaker/map/landmassGenerator.js` | Extract Simplex noise & Cellular Automata into pure engine module (`src/engine/pcg/`) |
| **PCG: WFC & Walk** | ⏳ **Planned** | *None* | Implement Wave Function Collapse (WFC) & Drunkard's Walk modules |
| **PCG: Node Graphing** | ⏳ **Planned** | *None* | Implement functional node flowchart solver (Airlock → Medbay → Core) |
| **LLM Gateway** | ✅ **Operational (Gemini)** | `src/engine/ai/VertexAIGateway.ts`<br>`src/engine/ai/AimeAgent.ts`<br>`src/engine/ai/MapWallingProcessor.ts` | Build `MapContextAggregator` & map-decoration prompt pipeline |
| **Script Execution** | ✅ **Operational (QuickJS)** | `src/engine/scripting/QuickJSSandbox.ts` | Build `PCGExecutor` connecting LLM JSON actions to canvas state |
| **Vehicle Logistics** | 🔄 **Partially Built** | `src/engine/rules/MechaSocketManager.ts` | Live token coordinate childing to moving multi-tile vehicle hulls |
| **VTT Export** | 🔄 **Partially Built** | `src/engine/compilers/FoundryVttJsonExporter.ts`<br>`src/utils/deployVttPackage.ts` | Full Universal VTT (`.dd2vtt`) packager with WebP image compilation |
| **Legacy MapMaker** | ⚠️ **Legacy Technical Debt** | `src/pages/Foundry/MapMaker/` (52 files, Konva) | Planned phase-out; converge all cartography tools into `StageView.tsx` |

---

## 📂 2. Target Directory Structure (Production Alignment)

All cartography, asset ingestion, and map generation subsystems must integrate directly into the production layout of `TANGENT SF RP react project`:

```text
TANGENT SF RP react project/
├── docs/
│   └── plan/
│       ├── MAP GEN – MASTER_IMPLEMENTATION_PLAN.md  <-- (Canonical Map Gen Plan)
│       ├── MASTER_IMPLEMENTATION_PLAN.md            <-- (Mirror / Primary Ref)
│       └── -map gen.md                              <-- (Taxonomy & concept research)
├── src/
│   ├── components/
│   │   └── VTT/
│   │       ├── StageView.tsx                       <-- Primary Next-Gen Stage & Cartography Studio
│   │       ├── TripartiteStageView.tsx             <-- Multi-viewport split stage
│   │       ├── ArchitectDesignPalette.tsx          <-- In-situ tool rail & asset drawer
│   │       ├── stage/                              <-- Stage viewport wrappers & drawer bridges
│   │       ├── hooks/                              <-- Stage gestures, hotkeys, canvas listeners
│   │       ├── tree/                               <-- NEW: Universal Asset Tree UI
│   │       │   ├── UniversalAssetTree.tsx          <-- Dynamic path-based folder accordion
│   │       │   └── AssetSearchFilterBar.tsx        <-- Debounced tag & category filtering
│   │       ├── ingestion/                          <-- NEW: External Asset Ingestion Suite
│   │       │   ├── AssetIngestionModal.tsx         <-- Batch directory/file/zip importer
│   │       │   ├── SpriteSheetCutterModal.tsx      <-- Visual grid slicer & cell extractor
│   │       │   └── ChromaKeyTool.tsx               <-- Transparent background keyer & defringer
│   │       ├── studio/                             <-- NEW: In-Situ Asset Studio & Tile Forge
│   │       │   ├── AssetStudioModal.tsx            <-- Master tile editor & property inspector
│   │       │   ├── CollisionHullEditor.tsx         <-- Visual polygon collider & LoS vector drawer
│   │       │   ├── LightEmitterPlacer.tsx          <-- Visual dynamic light source pin locator
│   │       │   ├── PassengerNodePlacer.tsx         <-- Vehicle seat & hardpoint socket pin locator
│   │       │   └── ShaderTintCustomizer.tsx        <-- HSL / RGB / normal map visual previewer
│   │       └── store/
│   │           └── uiLayoutStore.ts                <-- Drawer widths, dock states, tool selections
│   ├── engine/
│   │   ├── canvas/
│   │   │   ├── RendererContext.ts                  <-- PixiJS v8 / WebGPU application lifecycle
│   │   │   ├── LayerCompositor.ts                  <-- 9-tier Z-Layer hierarchy & render groups
│   │   │   ├── FrustumChunkManager.ts              <-- Spatial chunk culling & viewport bounds
│   │   │   ├── MarchingSquaresAutoTiler.ts         <-- NEW: 4-bit / 8-bit auto-tile bitmask engine
│   │   │   └── AssetCustomizerShader.ts            <-- NEW: WebGL/PixiJS dynamic tint & state shader
│   │   ├── assets/
│   │   │   ├── AssetIngestionPipeline.ts           <-- NEW: Validates, sanitizes & stores external assets
│   │   │   ├── SpriteSheetSlicer.ts                <-- NEW: Extracts frames into OPFS blobs
│   │   │   ├── OPFSCacheWorker.ts                  <-- Local high-speed asset cache worker
│   │   │   ├── FoundryIngestion.ts                 <-- Remote scene manifest fetcher
│   │   │   └── TangentPackager.ts                  <-- NEW: .tangent-pack ZIP bundle exporter/importer
│   │   ├── cartography/
│   │   │   ├── BSPDeckplanGenerator.ts             <-- Binary Space Partitioning room/corridor carver
│   │   │   ├── AstrogationGenerator.ts            <-- Stellar sector & jump route generator
│   │   │   └── NVectorCalculator.ts                <-- Navigational grid vector calculations
│   │   ├── pcg/                                    <-- NEW: Dedicated PCG algorithm suite
│   │   │   ├── WaveFunctionCollapse.ts             <-- WFC solver for modular sci-fantasy rooms
│   │   │   ├── CellularAutomataCaverns.ts          <-- Cave smoothing & organic cavern generator
│   │   │   ├── DrunkardsWalkTunnel.ts              <-- Random-walk mine shafts & tunnels
│   │   │   └── NodeGraphLayoutSolver.ts            <-- Translates functional flowcharts into layouts
│   │   ├── executor/                               <-- NEW: LLM & Script Execution Engine
│   │   │   ├── PCGExecutor.ts                      <-- Translates LLM script JSON into stage entities
│   │   │   ├── CollisionClearanceTester.ts         <-- Safe placement & doorway clearance validation
│   │   │   └── SemanticZoneMask.ts                 <-- 2D spatial grid truth-map of painted biomes
│   │   ├── ai/
│   │   │   ├── VertexAIGateway.ts                  <-- Google GenAI (Gemini 1.5/2.0) interface
│   │   │   ├── AimeAgent.ts                        <-- Narrative co-pilot with two-tier grounding
│   │   │   ├── MapWallingProcessor.ts              <-- Gemini Vision battlemap auto-walling
│   │   │   └── MapContextAggregator.ts             <-- NEW: Compiles canvas state into LLM prompts
│   │   ├── compilers/
│   │   │   ├── FoundryVttJsonExporter.ts           <-- Foundry v11/v12 compendium package compiler
│   │   │   ├── UniversalVttPackager.ts             <-- NEW: .dd2vtt binary/JSON bundle generator
│   │   │   └── MapGraphicsCompiler.ts              <-- NEW: Offscreen WebP layer flattener
│   │   ├── vision/
│   │   │   ├── BVHBuilder.ts                       <-- 2D bounding volume hierarchy for walls
│   │   │   └── LightSourceManager.ts               <-- Point, spot & animated dynamic lights
│   │   ├── rules/
│   │   │   └── MechaSocketManager.ts               <-- Vehicle hardpoints & passenger node mechanics
│   │   └── store/
│   │       └── engineStore.ts                      <-- Fused tokens, stage entities, live combat
│   ├── schemas/
│   │   ├── assetUnitSchema.ts                      <-- NEW: Canonical polymorphic Zod/TS schema
│   │   ├── vttWallSchema.ts                        <-- Door states, wall durability, LoS vectors
│   │   └── sharedSchemas.ts                        <-- Tokens, entities, folio representations
│   └── data/
│       ├── omnicortex/                             <-- Canon game database & element taxonomies
│       └── seed_units/                             <-- NEW: JSON seed bundles for Units Data catalog
```

---

## 🏗️ 3. Core Tech Stack (Production Baseline)

The tech stack is fully locked in and validated in production:

* **Frontend Framework:** **React 19** (`react` ^19.2.7, `react-dom` ^19.2.7) with **TypeScript ~6.0** in strict mode, bundled via **Vite 8** (`@vitejs/plugin-react` ^6.0.3).
* **Canvas Rendering:** **PixiJS v8** (`pixi.js` ^8.20.1) hardware-accelerated 2D WebGPU/WebGL pipeline with strict `RenderGroup` optimizations (`LayerCompositor.ts`). Three.js (`three` ^0.185.1) for 3D stage elevation, volumetric lighting, and camera fly-throughs.
* **State Management:** **Zustand v5** (`zustand` ^5.0.15) with **Immer** (`immer` ^11.1.15) for immutable canvas state updates (`uiLayoutStore.ts`, `engineStore.ts`, `adeStore.ts`) + **Yjs** (`yjs` ^13.6.32) for multiplayer CRDT state synchronization.
* **UI Controls & Docking:** Tailwind CSS v4 (`@tailwindcss/vite` ^4.3.3) for styling; Lucide React (`lucide-react` ^1.31.0) for iconography; custom dockable panels (`uiLayoutStore.ts`) flanked by collapsible tool rails.
* **LLM Engine & Agent Layer:** Google GenAI SDK (`@google/genai` ^2.25.0) via `VertexAIGateway.ts` with structured JSON schema outputs (`gemini-1.5-flash` / `gemini-2.0`), Model Context Protocol (`@modelcontextprotocol/sdk` ^1.31.0), and QuickJS WASM sandbox (`QuickJSSandbox.ts`).
* **Database & Persistence:** Firebase Cloud Firestore (`firebase` ^12.16.0) + in-browser SQLite WASM (`@sqlite.org/sqlite-wasm` ^3.53.0-build1) with OPFS backing for high-speed local rulebook and asset indexing.

---

## 🧩 4. Data Architecture: The "Units Data" Polymorphic Schema & Property Matrix

Every asset placed on the canvas—terrain brushes, doodads, tokens, creatures, vehicles, and hazards—must conform to the polymorphic **`AssetUnit`** schema. This schema supports external sourcing, custom user tiles, and an exhaustive property matrix covering tactical, visual, physical, and lighting behaviors.

### 4.1 TypeScript Interface (`src/schemas/assetUnitSchema.ts`)

```typescript
export type AssetCategory = 
  | 'terrain_brush' 
  | 'doodad' 
  | 'token' 
  | 'creature' 
  | 'vehicle' 
  | 'hazard'
  | 'wall_portal';

export type AutoTileAlgorithm = 
  | 'none'
  | 'marching_squares_4bit' 
  | 'marching_squares_8bit' 
  | 'wang_tiles';

export type StageZLayerName = 
  | 'background_map'      // ZLayer 0 (terrain, base textures)
  | 'underlay_debris'     // ZLayer 10 (floor decals, spent brass, blood)
  | 'interactive_objects' // ZLayer 15 (crates, terminals, doors, consoles)
  | 'tokens'              // ZLayer 20 (operatives, monsters, mecha)
  | 'roof_canopy'         // ZLayer 30 (see-through ceilings)
  | 'dynamic_fx'          // ZLayer 40 (weather particles, fluid shaders)
  | 'lighting_darkness'   // ZLayer 50 (dynamic lights & shadows)
  | 'fog_of_war'          // ZLayer 60 (exploration fog)
  | 'foreground_ui';      // ZLayer 70 (rulers, selection rings)

export type SurfaceMaterialType = 
  | 'metal_deck' 
  | 'stone_masonry' 
  | 'dirt_packed' 
  | 'sand_loose' 
  | 'water_shallow' 
  | 'water_deep' 
  | 'ice_slick' 
  | 'organic_flesh' 
  | 'plasma_fluid' 
  | 'acid_corrosive' 
  | 'glass_translucent';

export type CoverRating = 'none' | 'quarter_cover' | 'half_cover' | 'three_quarters' | 'full_cover';

export interface VisualVariants {
  thumbnail: string;                     // Primary preview URI / blob
  baseTexture: string;                   // Primary texture URI
  variants: string[];                    // Array of organic texture alternatives
  normalMap?: string;                    // PBR normal texture for 3D lighting
  roughnessMap?: string;                 // PBR roughness texture
  auto_tile?: AutoTileAlgorithm;
  
  // Customization & State Overrides
  customization?: {
    tintColor?: string;                  // Hex tint (e.g. "#00ffcc")
    hueRotation?: number;                // 0 to 360 degrees
    saturation?: number;                 // 0.0 to 2.0
    brightness?: number;                 // 0.0 to 2.0
    contrast?: number;                   // 0.0 to 2.0
  };
  
  // Dynamic In-Game State Textures
  stateTextures?: {
    pristine?: string;
    damaged?: string;                   // Swapped when HP < 50%
    destroyed?: string;                 // Swapped when HP = 0
    overgrown?: string;                 // Nature / xeno contamination
    corrupted?: string;                 // Technomagic / void warp
  };
}

export interface TerrainProperties {
  material: SurfaceMaterialType;
  movementCost: number;                  // 1 = normal, 2 = difficult, 0 = impassable
  slipperyFriction: number;              // 1.0 = standard, 0.2 = ice
  footstepSfxCategory: string;           // Maps to spatialAudioService (e.g. "footstep_metal")
  elevationOffsetFt?: number;            // Step height (e.g. +2 ft)
}

export interface DoodadProperties {
  cover: CoverRating;
  isDestructible: boolean;
  structureHp?: number;
  armorDr?: { kinetic: number; energy: number };
  breakDc?: number;
  isContainer: boolean;
  containerDetails?: {
    isLocked: boolean;
    lockType?: 'physical' | 'electronic' | 'biometric';
    hackDc?: number;
    lootTableId?: string;                // Links to Omnicortex DBM item pool
  };
  interactionTrigger?: {
    type: 'trap' | 'terminal' | 'switch' | 'lore_station';
    dcCheck?: number;
    actionEvent?: string;
    gmSecretNotes?: string;
  };
}

export interface WallPortalProperties {
  wallType: 'solid_titanium' | 'blast_bulkhead' | 'reinforced_glass' | 'energy_shield' | 'mesh_grate';
  isDoor: boolean;
  doorType?: 'sliding' | 'swinging' | 'iris' | 'portcullis';
  doorState?: 'open' | 'closed' | 'locked' | 'jammed';
  blocksLight: boolean;
  blocksSensors: boolean;                // Thermal / Radar blocking
  blocksMovement: boolean;
  soundMuffleFactor: number;             // 0.0 (transparent) to 1.0 (anechoic)
}

export interface DynamicLightProperties {
  emits: boolean;
  color: string;                         // Hex color
  intensity: number;                     // 0.0 to 2.0
  radiusBrightFt: number;                // Full illumination
  radiusDimFt: number;                   // Partial illumination
  castsShadows: boolean;
  animation: 'solid' | 'torch_flicker' | 'pulse' | 'emergency_strobe' | 'fluorescent_flicker' | 'plasma_churn';
  offsetCoords?: [number, number];       // Pixel offset from sprite anchor
}

export interface HazardProperties {
  hazardType: 'thermal_fire' | 'acid_corrosive' | 'plasma_leak' | 'radiation_leak' | 'biohazard_spore' | 'vacuum';
  damageFormula: string;                 // Canonical dice formula: e.g. "2d10+4 plasma"
  triggerTiming: 'on_enter' | 'on_turn_start' | 'on_turn_end' | 'continuous';
  saveDc?: { attribute: string; target: number };
  particlePreset?: string;               // HazardParticleSimulator preset key
}

export interface VehicleHullProperties {
  hullDr: { kinetic: number; energy: number };
  structureMaxHp: number;
  speedMph: number;
  handlingModifier: number;
  passengerNodes: Array<{
    id: string;
    role: 'pilot' | 'copilot' | 'gunner' | 'passenger' | 'cargo';
    cellOffset: [number, number];        // [col, row] relative to vehicle top-left
    zOverride?: StageZLayerName;
  }>;
  hardpointSockets: Array<{
    slotId: string;
    tier: 'node' | 'socket' | 'mount' | 'module';
    relativeCoords: [number, number];
    arcFacingDegrees: number;
  }>;
}

export interface TokenEntityProperties {
  dbmId?: string;                        // Links to canonical Omnicortex actor
  sizeCategory: 'Fine' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
  visionCone: {
    type: 'standard' | 'darkvision' | 'thermal' | 'omni';
    rangeFt: number;
    arcDegrees: number;                  // 360 for omni, 90 for directional
  };
  disposition: 'friendly' | 'neutral' | 'hostile' | 'secret';
  standeeElevationHeight3d?: number;     // Vertical extrusion height in Three.js
}

export interface AssetUnit {
  unit_id: string;                       // e.g. "ter_martian_regolith", "prop_plasma_leak", "veh_mech_01"
  name: string;
  category: AssetCategory;
  tree_path: string[];                   // e.g. ["Environments", "Xeno-Biomes", "Desert", "Martian Surface"]
  tags: string[];                        // e.g. ["cyberpunk", "broken", "cover_half", "scatter", "flammable"]
  dimensions: [number, number];           // [width, height] in standard grid cells (e.g. [1, 1], [2, 2])
  anchorPoint?: [number, number];        // [0.5, 0.5] = center, [0, 0] = top-left
  
  // Provenance & Source Metadata
  provenance: {
    source: 'preset' | 'custom_upload' | 'dlc_pack' | 'omnicortex_dbm';
    author?: string;
    packId?: string;
    license?: string;
    dateAdded: string;
  };
  
  // Visuals & Variants
  visuals: VisualVariants;
  
  // Base VTT Spatial Properties
  vtt_properties: {
    blocks_movement: boolean;
    blocks_vision: boolean;
    z_index_layer: StageZLayerName;
    customCollisionPolygon?: Array<[number, number]>; // Custom polygon vertices relative to unit bounds
    
    // Category Specific Sub-Properties
    terrain?: TerrainProperties;
    doodad?: DoodadProperties;
    wallPortal?: WallPortalProperties;
    dynamicLighting?: DynamicLightProperties;
    hazard?: HazardProperties;
    vehicleHull?: VehicleHullProperties;
    tokenEntity?: TokenEntityProperties;
  };
  
  // Algorithmic Placement Rules for PCG & LLM Scripter
  scatter_rules?: {
    allow_rotation: boolean;
    scale_variance: [number, number];     // e.g. [0.85, 1.15]
    avoid_center: boolean;                // Push toward walls/corners
    cluster_affinity: boolean;            // Spawn near similar tags
    clearance_radius_cells?: number;      // Minimum clearance to maintain around doors/pathways
  };
}
```

---

## 🛠️ 5. Phase 1: Units Data Catalog & Universal Asset Tree UI

**Objective:** Transform `ArchitectDesignPalette.tsx` from static item arrays into a dynamically populated, searchable asset tree powered by `AssetUnit.tree_path`.

### 5.1 Dynamic Universal Tree Generator
* Build `src/components/VTT/tree/UniversalAssetTree.tsx`.
* Ingest all registered `AssetUnit` records (seed bundles, custom imported assets from OPFS, and Omnicortex DBM).
* Dynamically construct nested folder accordions:
  ```typescript
  interface TreeNode {
    name: string;
    fullPath: string[];
    children: Map<string, TreeNode>;
    items: AssetUnit[];
  }
  ```
* Ensure adding any asset from an external pack or user upload automatically generates corresponding folder accordions without requiring code changes.

### 5.2 Search & Tag Filter Matrix
* Add an instant-filtering search input with debounced tag matching (e.g., `#cover_half`, `#scifi`, `#hazard`, `#technomagic`).
* Provide category toggle chips: `[All] [Terrain] [Doodads] [Tokens] [Creatures] [Vehicles] [Hazards] [Custom]`.

### 5.3 Dockable UI Framework (`uiLayoutStore.ts`)
* Flank the central stage with two collapsible docking columns:
  * **Left Drawer:** Universal Asset Tree, Biomes, Drawing Tools, Ingestion Studio.
  * **Right Drawer:** LLM Logic Co-Pilot, Map Layers, Dynamic Lighting, Combat Radar.
* Implement tab drag-and-drop between left and right docks, updating `uiLayoutStore.ts`.

---

## 📥 6. Phase 2: External Sourcing, Ingestion Pipeline & Asset Studio ("Tile & Asset Forge")

**Objective:** Provide a professional, integrated pipeline to import external art assets (PNG/WebP/SVG/ZIP/SpriteSheets), slice modular tile sets, configure comprehensive properties, and customize visual variants with shaders.

### 6.1 External Asset Ingestion Suite (`src/components/VTT/ingestion/`)
* **Batch Importer (`AssetIngestionModal.tsx`):**
  * Supports drag-and-drop for single images, folders of PNGs/WebPs, and `.zip` asset bundles.
  * Ingests third-party art packs (Forgotten Adventures, Tom Cartos, 2-Minute Tabletop, custom sci-fi/cyberpunk packs).
  * Auto-generates high-efficiency WebP thumbnails and stores master binaries in the browser's **Origin Private File System (OPFS)** via `OPFSCacheWorker.ts` for zero-latency local caching.
* **Sprite Sheet & Tile Sheet Slicer (`SpriteSheetCutterModal.tsx`):**
  * Visual interactive grid overlay: 32x32, 64x64, 128x128, 256x256 px or custom cell bounds.
  * Smart transparent margin auto-detection: detects individual sprite bounding boxes automatically.
  * Batch extraction: slices an entire sheet into individual `AssetUnit` records with assigned categories and tags in one click.
* **Chroma Key & Alpha Cleaner (`ChromaKeyTool.tsx`):**
  * Allows users to click on solid background colors (e.g. green screen, magenta, pure black) to key out background pixels to clean alpha.
  * Edge feathering, anti-aliasing, and defringing sliders.

### 6.2 In-Situ Asset Studio & Property Forge (`src/components/VTT/studio/AssetStudioModal.tsx`)
* A dedicated modal/workspace for editing any asset's full metadata:
  1. **Visual Transform Studio:**
     * Non-destructive cropping, 90° rotation, horizontal/vertical flipping.
     * Anchor / Pivot point selector (Top-Left, Center, Bottom-Center for standees).
  2. **Collision & LoS Hull Editor (`CollisionHullEditor.tsx`):**
     * Click-to-add polygon points directly over the asset preview to define custom collision geometry.
     * Choose boundary type: *Impassable Wall*, *Half-Cover*, *Window / Glass (blocks movement, allows vision)*, or *Ethereal*.
  3. **Light Source Pin Locator (`LightEmitterPlacer.tsx`):**
     * Click to place one or more light emission pins directly on the asset graphic (e.g., lantern tip, console screen, glowing crystal).
     * Configure color, bright/dim radius, and flicker animation per pin.
  4. **Vehicle Seat & Hardpoint Locator (`PassengerNodePlacer.tsx`):**
     * Click to place pilot, gunner, and passenger seats on multi-tile vehicle hulls.
     * Assign UDU hardpoint tiers (Node, Socket, Mount, Module).
  5. **Dynamic Visual Shader Customizer (`ShaderTintCustomizer.tsx`):**
     * Adjust live HSL (Hue, Saturation, Lightness), contrast, and hex color tinting via WebGL/PixiJS shaders (`AssetCustomizerShader.ts`).
     * Instantly create biome variations of a single tile (e.g., clean steel -> rusted hull -> toxic acid stained -> cyber neon).
  6. **Dynamic State Variant Assignment:**
     * Link alternate textures for in-game state transitions: *Pristine*, *Damaged (<50% HP)*, *Destroyed (0% HP)*, *Overgrown*, *Corrupted*.
  7. **Portable Pack Bundler (`TangentPackager.ts`):**
     * Export custom user assets into portable `.tangent-pack` archives (JSON manifest + textures) for backup, campaign transfer, or community sharing.

---

## 🖌️ 7. Phase 3: Canvas & Semantic Painting Engine (Stage Viewport)

**Objective:** Empower the Game Master (GM) to rapidly paint terrain, place assets, and define semantic zones with zero latency on the PixiJS v8 stage.

### 7.1 Brush State Machine
* Implement active brush state in `useDesignModeController.ts`:
  ```typescript
  interface ActiveBrushState {
    mode: 'paint_terrain' | 'erase_terrain' | 'fill_bucket' | 'stamp_doodad' | 'draw_wall';
    selectedUnit: AssetUnit | null;
    brushSize: 1 | 3 | 5; // Cell radius
    isEngaged: boolean;
  }
  ```
* Render a translucent snapping cursor on the `ForegroundUI` layer displaying the footprint and texture preview.

### 7.2 Event Throttling & Coordinate Optimization
* On `pointerMove`, convert mouse `(X, Y)` to grid coordinates `[col, row]` via `CoordinateEngine.worldToGrid`.
* **Critical Optimization:** Check if `[col, row]` matches the last painted cell. If identical, abort immediately. Only dispatch updates to `engineStore` when the cursor crosses into a new grid cell.
* Commit continuous brush strokes as single atomic transactions on `pointerUp` for the Undo/Redo history stack.

### 7.3 Auto-Tiling Bitmask Engine (Marching Squares)
* Create `src/engine/canvas/MarchingSquaresAutoTiler.ts`.
* For biomes configured with `auto_tile: "marching_squares_4bit"` or `"marching_squares_8bit"`:
  * Evaluate the 4 cardinal (or 8 surrounding) neighbors of a painted cell.
  * Calculate the standard bitmask index: `index = N*1 + E*2 + S*4 + W*8`.
  * Select the appropriate transitional edge/corner sprite from `AssetUnit.visuals.variants` to seamlessly blend biomes (e.g., acid swamp bleeding into industrial steel deck).

### 7.4 Semantic Zone Mask (`SemanticZoneMask.ts`)
* Maintain a parallel 2D byte-array mask representing the functional semantics of the map:
  * `0x00: Empty Space / Void`
  * `0x01: Walkable Floor / Deck`
  * `0x02: Impassable Wall / Bulkhead`
  * `0x04: Environmental Hazard (Acid, Plasma, Fire)`
  * `0x08: Cover Zone (Crates, Low Barriers)`
  * `0x10: Chokepoint / Doorway Threshold`
* This mask serves as the ground-truth data passed to the PCG math engine and LLM decorator scripts.

---

## ⚙️ 8. Phase 4: The PCG Math Engine

**Objective:** Build a modular, 100% deterministic Procedural Content Generation engine in `src/engine/pcg/` that creates map layouts in milliseconds without any AI image generation.

### 8.1 Binary Space Partitioning (BSP) — Starships & Outposts
* **Existing Foundation:** `src/engine/cartography/BSPDeckplanGenerator.ts`.
* Recursively partitions bounding rectangles into rooms and hallways.
* **Enhancement:** Expose room padding, aspect ratio constraints, and corridor width controls to the UI toolbar and LLM scripting parameters.

### 8.2 Cellular Automata — Organic Caves & Alien Hives
* Extract the proven Perlin/Simplex noise and smoothing passes from `landmassGenerator.js` into `src/engine/pcg/CellularAutomataCaverns.ts`.
* Standard 4-5 simulation loop:
  1. Initialize grid with random rock fill ratio (e.g., 45%).
  2. Run 4–5 smoothing iterations: cell becomes rock if ≥5 neighbors are rock, floor if ≤3.
  3. Flood-fill connectivity check: carve tunnels to connect isolated cavern pockets.

### 8.3 Wave Function Collapse (WFC) — Modular Facilities & Chambers
* Create `src/engine/pcg/WaveFunctionCollapse.ts`.
* Define tile prototypes with 4-sided socket connection rules:
  * e.g., `CORRIDOR_T`, `CORRIDOR_CROSS`, `CORRIDOR_STRAIGHT`, `HAB_POD`, `SECURITY_AIRLOCK`.
* Maintain entropy array across grid cells; iteratively collapse minimum-entropy cells until the grid is solved, guaranteeing zero disconnected or broken geometry.

### 8.4 Drunkard's Walk — Tunnels & Natural Mine Shafts
* Create `src/engine/pcg/DrunkardsWalkTunnel.ts`.
* Launch a randomized agent from a start coordinate that carves floor tiles step-by-step with momentum bias, creating winding, narrow subterranean shafts and alien burrows.

### 8.5 Node-Based Graph Layout Solver
* Create `src/engine/pcg/NodeGraphLayoutSolver.ts`.
* Allow GMs to define high-level story flowcharts:
  `[Airlock] -> [Decontamination] -> [Engineering Bay] -> [Reactor Core]`
* The solver assigns bounding boxes to each functional node based on requested dimensions, places them spatially, and invokes the corridor router with A* pathfinding to connect them according to the graph edges.

---

## 🧠 9. Phase 5: LLM Logic Co-Pilot & Scripting Executor

**Objective:** Decouple AI from image generation. Leverage Gemini 1.5/2.0 via `VertexAIGateway.ts` strictly as an interior decorator, encounter scripter, and spatial logic engine.

### 9.1 Map Context Aggregator (`MapContextAggregator.ts`)
* Translates the active stage state into a token-efficient JSON/text spatial context:
  ```json
  {
    "map_dimensions": [30, 20],
    "theme": "Derelict Corporate Research Facility",
    "rooms": [
      { "id": "room_1", "bounds": [2, 2, 12, 10], "type": "medical_lab", "hazard_tiles": 6 },
      { "id": "room_2", "bounds": [14, 2, 28, 18], "type": "cryo_containment", "breached": true }
    ],
    "doors": [{ "coords": [13, 6], "status": "locked" }]
  }
  ```

### 9.2 Structured Prompt Schema
* Send user instructions alongside the spatial matrix using Gemini Structured Outputs (`responseSchema`):
  ```json
  {
    "type": "object",
    "properties": {
      "atmosphere_lighting": {
        "type": "object",
        "properties": {
          "ambient_color": { "type": "string" },
          "weather": { "type": "string", "enum": ["none", "sparks", "smoke", "acid_rain"] }
        },
        "required": ["ambient_color", "weather"]
      },
      "execute_scripts": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "action": { "type": "string", "enum": ["place_central", "scatter", "place_hazard", "wall_perimeter"] },
            "query_tags": { "type": "array", "items": { "type": "string" } },
            "zone": { "type": "array", "items": { "type": "number" } },
            "density": { "type": "number" },
            "limit": { "type": "number" }
          },
          "required": ["action", "query_tags"]
        }
      }
    },
    "required": ["atmosphere_lighting", "execute_scripts"]
  }
  ```

### 9.3 The PCG Executor Engine (`src/engine/executor/PCGExecutor.ts`)
* Parses the LLM's structured output.
* Queries the Units Data catalog matching `query_tags`.
* Executes deterministic spatial placement:
  * **`place_central`**: Calculates center of room bounds, verifies that `blocks_movement` does not trap existing tokens.
  * **`scatter`**: Iterates through candidate cells, respecting `scatter_rules.avoid_center`, checking that cells are not door thresholds or wall boundaries.
  * **`place_hazard`**: Injects fluid tiles, spawns hazard particles (`HazardParticleSimulator.ts`), and configures reactive triggers.
* Updates `engineStore.ts` atomically.

---

## 🧩 10. Phase 6: Complex Entities, Vehicles & Zone Freezing

**Objective:** Implement multi-tile entities, vehicle logistics, and region-locking mechanics.

### 10.1 Multi-Tile Vehicle Hulls & Passenger Geometry
* Integrate with `MechaSocketManager.ts`.
* Vehicles occupy multi-cell bounding footprints (e.g. 2x2, 4x6).
* When a Token is dragged onto a vehicle's `passenger_nodes` coordinate:
  * Child the token's coordinate matrix to the vehicle.
  * When the vehicle is translated or rotated on the Stage, all child passenger tokens move synchronously.

### 10.2 Strict Z-Axis Enforcement (`LayerCompositor.ts`)
* Enforce rigid rendering order:
  `BackgroundMap (0) < UnderlayDebris (10) < InteractiveObjects (15) < Tokens (20) < RoofCanopy (30) < DynamicFX (40) < LightingDarkness (50) < FogOfWar (60) < ForegroundUI (70)`
* Prevent decals (e.g., blood splatter) from rendering on top of elevated props (e.g., tactical consoles).

### 10.3 Iterative Freezing (Lasso Tool)
* Add a **Freeze / Lock Tool** to the Stage design palette.
* GM can draw a bounding polygon or select rooms to mark them as `isFrozen: true`.
* During subsequent PCG re-rolls or LLM decoration passes, frozen cells are mathematically protected and skipped by the executor.

---

## 📦 11. Phase 7: Native VTT Exporting (.dd2vtt & Foundry VTT)

**Objective:** Package the live tactical map into production-ready VTT formats with complete line-of-sight and dynamic lighting metadata.

### 11.1 Map Graphics Compiler (`MapGraphicsCompiler.ts`)
* Uses an offscreen PixiJS render-texture to flatten Z-Layers 0 (Terrain) and 10 (Underlay/Decals) into a single optimized WebP base image.
* Props, Tokens, and Doors remain discrete, movable objects.

### 11.2 Universal VTT (.dd2vtt) Packager (`UniversalVttPackager.ts`)
* Compiles the standard `.dd2vtt` JSON structure:
  ```json
  {
    "format": 0.2,
    "resolution": { "map_origin": { "x": 0, "y": 0 }, "map_size": { "x": 30, "y": 20 }, "pixels_per_grid": 100 },
    "image": "<base64_encoded_webp>",
    "line_of_sight": [
      [{"x": 2.0, "y": 2.0}, {"x": 12.0, "y": 2.0}],
      [{"x": 12.0, "y": 2.0}, {"x": 12.0, "y": 10.0}]
    ],
    "portals": [
      { "position": { "x": 13.0, "y": 6.0 }, "bounds": [{ "x": 13.0, "y": 5.5 }, { "x": 13.0, "y": 6.5 }], "closed": true, "freemove": false }
    ],
    "lights": [
      { "position": { "x": 7.0, "y": 6.0 }, "range": 20.0, "color": "00ffcc", "intensity": 0.8 }
    ]
  }
  ```
* Implements collinear segment reduction: merges adjacent collinear wall segments into continuous single vectors to minimize VTT rendering overhead.

### 11.3 Foundry VTT Compendium Exporter (`FoundryVttJsonExporter.ts`)
* **Existing Foundation:** `src/engine/compilers/FoundryVttJsonExporter.ts`.
* Exports complete Foundry v11/v12 compendium packs containing:
  * Scenes (with grid alignment, walls, and ambient lights).
  * Actors (operatives and adversaries with canonical stats and armor DR).
  * Items (weapons, cyberware, equipment).
  * Journals (scenario briefings linked via `@UUID`).

---

## 🔄 12. Phase 8: Legacy MapMaker Convergence & Sunsetting Plan

**Current Reality:** The codebase currently contains a legacy, 52-file `MapMaker` module (`src/pages/Foundry/MapMaker/`) built on `react-konva`. In parallel, `src/components/VTT/StageView.tsx` implements the next-generation PixiJS v8 / WebGPU engine.

### Convergence Strategy:
1. **Feature Extraction:** All high-value domain logic in `MapMaker/` (e.g. `landmassGenerator.js`, `MapConstants.js`, `UvttImportModal.jsx`, `CombatTracker.jsx`) is already being ported to the engine and Stage.
2. **Route Canonicalization:** Update `FoundryApp.jsx` so `/foundry/map` routes to the integrated Stage Cartography Studio (`StageView.tsx` with `mode="architect"`), maintaining backwards compatibility.
3. **Safe Archival:** Once the Universal Tree and Marching Squares auto-tiler are operational in `StageView.tsx`, relocate legacy Konva components to `src/pages/Foundry/_archive/MapMaker.legacy/` to reduce bundle weight and maintenance surface area.

---

## 🤖 13. AI Agent Execution & Verification Protocol

### Strict Directives for AI Agents Working on Map Gen:
1. **Zero Hallucinated Graphics:** Do not generate images. All visuals rely on pre-existing textures, shaders, procedural geometry, or placeholder SVG/WebP assets.
2. **Domain-Driven Separation of Concerns:**
   * **UI Components** (`src/components/VTT/`) must never calculate spatial geometry or run raw PCG algorithms.
   * UI components dispatch user intent to the **Executor** or **Store**.
   * The **PCG Engine** (`src/engine/pcg/`) is composed of pure TypeScript classes with zero React dependencies.
   * The **LLM Co-Pilot** (`src/engine/ai/`) emits structured JSON intent only.
3. **Mandatory Step 0 Pre-Flight Order:**
   * Verify git working tree status (`git status`).
   * Verify test suite baseline before making changes.
4. **Automated Verification Harness:**
   * Run the full engine test suite: `npm.cmd test` (includes `test:engine` and `test:data`).
   * Run co-located engine tests: `node --test src/engines/__tests__/*.test.js`.
   * Run production build typecheck: `npm.cmd run build`.
   * All 635+ automated tests must pass with 0 regressions before committing.

---
*End of Master Implementation Plan — Tangent SF ADE*