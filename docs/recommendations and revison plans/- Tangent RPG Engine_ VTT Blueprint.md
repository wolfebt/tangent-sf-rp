# **Next-Gen VTT Module & DBM Integration Blueprint**

# **Next-Gen VTT Module & DBM Integration Blueprint**

## **Project Context: Evolution to an Expansive Game Engine**

This document outlines the exhaustive architectural, technical, and UX/UI blueprint for the Next-Generation Virtual Tabletop (VTT). This module is specifically engineered to supersede standalone web platforms and integrate directly into the existing Tangent RPG ecosystem, specifically the Tangent DBM (Database Manager) (https://tangent-rpg-dbm.web.app/) and the broader **Story Foundry** components.  
Rather than functioning as an isolated application, this VTT is engineered as the **Tactical & Presentation Module** of a broader, holistic Game Engine. It operates symbiotically with the Tangent DBM and dynamically ingests content from the Story Foundry to form a "Holy Trinity" of campaign management:

1. **Tangent DBM (The Brain):** Retains absolute, singular authority over the global ruleset, campaign state, inventory permutations, mathematical modifiers, and character progression.  
2. **Story Foundry (The Heart):** Manages the narrative modules, scene metadata, interconnected lore databases, and heavy media assets.  
3. **VTT Module (The Hands & Eyes):** Acts strictly as a real-time, spatial presentation layer. It handles volatile, high-frequency session data (cursor positions, drag-and-drop actions, live line-of-sight calculations) and visually renders the environments authored in the Foundry using the math dictated by the DBM.

This decoupled, serverless architecture relies entirely on the Google Cloud Platform ecosystem (Firebase/Firestore, Vertex AI, Google Cloud Storage, Cloud Run) and is formatted with strict declarative parameters for automated generation via the Antigravity agentic framework.

## **Target Platform Archetypes for Benchmarking & Technical Debt Avoidance**

To engineer the definitive module for the Tangent Engine, the Antigravity framework must rigorously evaluate legacy archetypes to explicitly avoid their architectural pitfalls, technical debt, and scalability ceilings:

1. **Engine-Grade Platforms (Foundry VTT, Fantasy Grounds Unity):** Highly capable, but fundamentally flawed for web-scale deployment due to CPU-bound main-thread processing, monolithic document databases that trigger massive payload syncs on minor edits, and extremely steep learning curves.  
2. **Web-Native SaaS Platforms (Roll20, Shard Tabletop):** Highly accessible, but severely bottlenecked by legacy Canvas 2D API limitations, DOM-heavy UI rendering that causes browser thrashing, and high garbage collection (GC) overhead during complex combat scenarios.  
3. **Micro-VTTs (Owlbear Rodeo 2.0):** Excellent zero-friction onboarding, but fundamentally lack the mechanical depth, schema validation, and persistent state management required for a full-scale RPG Engine integration.  
4. **Cinematic/Narrative Platforms (Alchemy RPG):** Exceptional atmospheric value, but utility breaks down for the rigorous tactical grid-based mechanics and precise spatial tracking required by the Tangent Engine.  
5. **3D Simulators (TaleSpire):** High visual fidelity, but they introduce an immense GM prep burden, rigid closed asset pipelines, and hardware exclusion for users on low-end devices.

## **Complete Catalog of Engine & VTT Capabilities (Antigravity Implementation Plans)**

The following subsystem definitions have been expanded into strict **Implementation Plans** for the Antigravity agentic coding framework. Each dictates execution steps, target architecture, and strict failure states.

### **Subsystem 1: Canvas & Rendering Engine (VTT Module)**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: CORE\_CANVAS\_RENDERER**  
**Objective:** Deploy a PixiJS v8 rendering pipeline backed by WebGPU, featuring an infinite chunking spatial hash map, explicit Z-axis/elevation tracking, and rigid memory lifecycle management.  
**Target File Structure:**

* src/engine/canvas/RendererContext.ts  
* src/engine/canvas/LayerCompositor.ts  
* src/engine/math/CoordinateEngine.ts  
* src/engine/memory/GCMonitor.ts

**Implementation Steps:**

1. **WebGPU Context Initialization:** Instantiate @pixi/webgpu. Write a silent fallback hook that catches navigator.gpu initialization failures and gracefully downgrades to @pixi/webgl.  
2. **Layer Compositing Tree:** Construct a strict PIXI.Container hierarchy. Instantiate exactly: BackgroundMap (z:0) \-\> UnderlayDebris (z:10) \-\> TokenLayer (z:20) \-\> RoofCanopy (z:30, attach Alpha masking based on active token coords) \-\> DynamicFX (z:40) \-\> LightingDarkness (z:50) \-\> FogOfWar (z:60) \-\> ForegroundUI (z:70).  
3. **Hex/Square Coordinate Translators:** Implement CoordinateEngine.ts.  
   * Define CubeCoord {q: number, r: number, s: number}.  
   * Write grid conversion function: q \+ r \+ s \= 0\.  
   * Write distance mathematical utility: max(|a.q \- b.q|, |a.r \- b.r|, |a.s \- b.s|).  
   * Map Tangent movement (30ft) to grid units based on the active scene's pixels-per-cell scale.  
4. **Z-Axis Rendering:** Extend the Token class to include an elevation\_ft property. Implement a PixiJS filter that casts a drop shadow from the token; bind the shadow's distance and blur properties to dynamically scale based on the elevation\_ft multiplier.  
5. **Infinite Canvas Chunk Manager:** Implement Frustum Culling. Monitor the camera's X/Y bounds. Divide the world into 2048x2048 pixel chunks. Only instantiate PIXI.Sprite objects for assets intersecting the active viewport \+ a 1-chunk padding radius.  
6. **Explicit Garbage Collection Overrides:** Intercept the scene unmount lifecycle. Call container.destroy(true, true) on all child nodes, explicitly severing GPU bindings and flushing VRAM before loading the next Story Foundry scene.

**Failure States to Avoid:** Never store game state (HP, modifiers) on the PixiJS Sprite object. The canvas must strictly read from the Zustand/DBM state.

### **Subsystem 2: Vision, Occlusion & Dynamic Lighting**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: WGSL\_COMPUTE\_VISION**  
**Objective:** Bypass the CPU for all line-of-sight and lighting math by deploying fused WGSL (WebGPU Shading Language) compute shaders, supported by a Bounding Volume Hierarchy (BVH) for pre-culling.  
**Target File Structure:**

* src/engine/vision/WGSLComputeContext.ts  
* src/engine/vision/shaders/fused\_vision.wgsl  
* src/engine/vision/BVHBuilder.ts

**Implementation Steps:**

1. **BVH Constructor (CPU-side):** Implement a two-level Bounding Volume Hierarchy (TLAS/BLAS). When the scene loads, process all Wall and Door vectors into the BVH. On each frame, query the BVH using the observer token's vision radius to extract *only* the relevant occluders, drastically reducing the array size sent to the GPU.  
2. **WGSL Uniform Buffer Alignment:** Write a strictly typed data serializer. WebGPU requires exact 16-byte padding for structs. Serialize the active Light Sources and Wall Segments into Float32Array buffers, manually injecting 0.0 padding values to prevent memory corruption across diverse GPU architectures.  
3. **Kernel Fusion (WGSL):** Author fused\_vision.wgsl using @compute @workgroup\_size(64). Do not write separate shaders for raycasting, lighting, and shadow blurring. Fuse the ray-wall intersection math, inverse-square attenuation, and additive color blending into a single dispatch pass to eliminate CPU-to-GPU sync overhead.  
4. **Fog of War Frame Buffer Objects (FBO):**  
   * Allocate a persistent GPU texture for the Explored Memory state (greyscale, 50% opacity).  
   * Allocate an ephemeral stencil buffer for the Active LoS state. Use the output of the compute shader to update the stencil mask dynamically based on the active token.

**Failure States to Avoid:** Do not attempt WebGPU dispatch calls for tokens that have not moved since the last frame. Cache the output mask and only invalidate/recompute if coordinates or light source states mutate.

### **Subsystem 3: Tangent DBM Integration & Actor Pipeline**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: DBM\_ACTOR\_SCHEMA\_SYNC**  
**Objective:** Federate data securely between the global OMNICORTEX (DBM) and the volatile VTT session without triggering massive document rewrites. Implement an isolated WASM macro sandbox.  
**Target File Structure:**

* src/engine/state/DBMBridge.ts  
* src/engine/state/VolatileSharder.ts  
* src/engine/mechanics/DiceASTParser.ts  
* src/engine/mechanics/QuickJSSandbox.ts

**Implementation Steps:**

1. **Schema Sharding Engine:**  
   * Establish read-only Firestore listeners to /Campaigns/{id}/Actors/{id} for base stats.  
   * Establish read/write listeners to /Sessions/{id}/Tokens/{id} for ephemeral data (X/Y coords, current HP, active conditions).  
   * Merge these two streams locally in Zustand to form a unified ITokenState object for the renderer.  
2. **Dice AST Lexer/Parser:** Build an Abstract Syntax Tree parser capable of resolving complex Tangent notations (e.g., (((2d20kh1 \+ @abilities.str.mod) \* 2\) \+ 1d4\[fire\])).  
   * Hook the parser to the Zustand store to dynamically resolve @ variables.  
   * Override all RNG to use crypto.getRandomValues() instead of Math.random().  
3. **WASM Macro Sandbox:** Instantiate QuickJS compiled to WebAssembly within a dedicated Web Worker.  
   * Establish a strictly typed communication bridge (postMessage) between the main thread and the sandbox.  
   * Enforce hard limits within the WASM environment: max 64MB memory heap, and insert execution instruction counters to forcefully terminate the worker if a script exceeds 500ms (preventing infinite loop ReDoS attacks).

**Failure States to Avoid:** Never execute user-generated macro JavaScript on the main browser thread via eval() or new Function(). This is a critical security vulnerability.

### **Subsystem 4: Media, Audio & Asset Pipeline (Story Foundry Integration)**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: STORY\_FOUNDRY\_ASSET\_PIPELINE**  
**Objective:** Ingest rich narrative content directly from the Story Foundry. Offload heavy media to local WASM-backed storage, and implement spatial audio occlusion.  
**Target File Structure:**

* src/engine/assets/FoundryIngestion.ts  
* src/engine/assets/OPFSCacheWorker.ts  
* src/engine/audio/SpatialAudioGraph.ts

**Implementation Steps:**

1. **Foundry Manifest Ingestion:** Write a GraphQL/REST client that securely fetches the SceneManifest.json from the Story Foundry backend. Parse this to extract all necessary asset URLs, NPC linkages, and map pin lore entries.  
2. **OPFS SQLite Caching:** Implement a Web Worker running SQLite over the Origin Private File System (OPFS).  
   * Intercept outgoing requests for heavy map WebP images and ambient audio files.  
   * Cache the raw binary data in OPFS.  
   * On subsequent scene loads, serve the binary payload directly from the local SQLite WASM layer, bypassing the network completely for instant loads.  
3. **Spatial Audio Panner Setup:** Initialize the Web Audio API Context.  
   * Map sound sources (e.g., "Fireplace\_Loop.mp3") to PannerNode objects.  
   * Bind the PannerNode X/Y/Z coordinates directly to the spatial coordinates on the PixiJS canvas.  
   * Dynamically update the AudioContext.listener position based on the currently selected observer token, calculating distance-based falloff and panning (HRTF).

**Failure States to Avoid:** Do not block the main thread waiting for massive map files to download. Assets must stream asynchronously, with a blurry placeholder (low-res mipmap) rendered immediately.

### **Subsystem 5: Networking, State Sync & Security**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: HYBRID\_NETWORK\_ARCHITECTURE**  
**Objective:** Deploy a dual-channel architecture using a LiveKit SFU for high-frequency volatile data and Yjs CRDTs for authoritative document synchronization.  
**Target File Structure:**

* src/engine/network/LiveKitClient.ts  
* src/engine/network/YjsProviderBridge.ts  
* src/engine/network/FirestoreDebouncer.ts

**Implementation Steps:**

1. **LiveKit SFU Initialization:** Integrate livekit-client.  
   * Initialize a Room connection.  
   * Bind WebRTC microphone and camera inputs to the SFU for native voice chat (routing the audio streams into the Subsystem 4 PannerNodes for positional voice chat).  
2. **Volatile State DataChannels (Binary):** Do not send JSON strings over the WebRTC data channel.  
   * Implement FlatBuffers or Protocol Buffers serialization schemas for cursor coordinates, ping interactions, and dragging token ghosts.  
   * Broadcast these binary payloads at 60Hz via the LiveKit SFU to bypass the severe upload bottlenecks of traditional P2P mesh topologies.  
3. **Yjs CRDT Document Sync:** Wrap the character sheet and initiative tracker states in Yjs maps/arrays.  
   * Encode CRDT state updates (Y.encodeStateAsUpdate) into binary format.  
   * Transmit these binary updates over the LiveKit reliable data channel to all connected peers, allowing simultaneous, conflict-free multi-user editing of the same DBM character sheet.  
4. **Firestore Write Debouncing:** To respect GCP/Firestore write limits (1 write/second/document):  
   * Implement FirestoreDebouncer.ts.  
   * Observe the final resolved Yjs state.  
   * Batch and delay persistent mutations (like a token settling on a final grid space or taking permanent damage), executing a single definitive updateDoc() to the Tangent DBM only after the user's action ceases for \>500ms.

**Failure States to Avoid:** Never use the LiveKit data channel for permanent game state that must be stored. The SFU is purely for ephemeral session synchronization; Firestore is the definitive database of record.

## **Next-Gen Dynamic Dashboard Blueprint**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: UI\_DASHBOARD\_ENGINE**  
**Objective:** Architect a decoupled, data-driven HTML/React overlay utilizing a grid system, enabling users to persist highly customized HUD layouts while maintaining context-aware responsiveness to the underlying game state.  
**Target File Structure:**

* src/engine/ui/DashboardOverlay.tsx  
* src/engine/ui/WidgetRegistry.ts  
* src/engine/ui/widgets/ContextActionBar.tsx  
* src/engine/ui/layout/FirestoreProfileSync.ts  
* src/engine/ui/layout/ResponsiveGridConfig.ts

**Implementation Steps:**

1. **Canvas Decoupling & Overlay Root:** Establish DashboardOverlay.tsx as an absolute-positioned React Portal or strictly elevated z-index layer covering the PixiJS canvas. Enforce pointer-events: none on the container so canvas interactions pass through, explicitly applying pointer-events: auto only to the rendered widget bodies.  
2. **Widget Manifest & Registry:** Create WidgetRegistry.ts. Define a strict interface IWidgetDefinition (enforcing id, defaultWidth, defaultHeight, min/max constraints, and the ReactComponent). Register core widgets: DBMBrowserWidget, StoryFoundryManagerWidget, CombatTrackerWidget, MacroActionBarWidget, and PhysicsDiceTrayWidget.  
3. **React-Grid-Layout Integration:** Implement react-grid-layout (specifically the ResponsiveWeb variant) in ResponsiveGridConfig.ts.  
   * Define distinct dimensional breakpoints (lg, md, sm) to handle desktop vs. tablet layouts.  
   * Map the UI Zustand layoutState directly to the layout prop of the grid.  
4. **Context-Aware Binding:** Wire ContextActionBar.tsx via Zustand selectors to observe the selectedToken array.  
   * When a token is selected, trigger a read from the local DBM sharded state to fetch the actor's current equipped items and active states.  
   * Dynamically re-render the action bar to surface relevant macros (e.g., Selecting an archer populates a bow attack macro, ammo decrement counter, and applicable Tangent movement modifiers).  
5. **Profile Serialization:** Implement a debounce function in FirestoreProfileSync.ts.  
   * When the react-grid-layout triggers a final onLayoutChange event (after a user finishes dragging or resizing a widget), serialize the coordinate array (\[{ i: 'combat\_tracker', x: 0, y: 0, w: 3, h: 5 }\]) into a lightweight JSON payload.  
   * Push this payload to the user's specific Tangent Engine Profile document in Firestore (/Users/{userId}/Preferences/ui\_layout) to ensure their custom HUD persists across browser sessions and devices.

**Failure States to Avoid:** Never trigger a full DOM/Grid re-render when a single widget's internal data updates (e.g., a timer ticking inside the Combat Tracker). Utilize strict React memoization and targeted Zustand selectors to prevent the React lifecycle from causing micro-stutters in the PixiJS canvas render loop beneath it.

## **High-Value AI Differentiators (Google Ecosystem)**

**ANTIGRAVITY\_AGENT\_DIRECTIVE: DUAL\_AGENT\_AI\_ARCHITECTURE**  
**Objective:** Architect a decoupled, dual-agent system utilizing Vertex AI and Gemini models to prevent context contamination. Connect **BASTION** (strict rules parsing, math validation, map analysis) and **AIME** (creative narrative synthesis) via secure API tool-calling, integrating deeply with the DBM and Story Foundry pipelines.  
**Target File Structure:**

* src/engine/ai/VertexAIGateway.ts  
* src/engine/ai/agents/BastionAgent.ts  
* src/engine/ai/agents/AimeAgent.ts  
* src/engine/ai/tools/DBMFunctionRegistry.ts  
* src/engine/ai/rag/VectorSearchClient.ts  
* src/engine/ai/vision/MapWallingProcessor.ts

**Implementation Steps:**

1. **Vertex AI Secure Orchestration:** Implement VertexAIGateway.ts as a server-side Cloud Function (or secure Node.js backend) to proxy all Gemini requests. **Client-side exposure of Vertex AI keys is strictly prohibited.** Validate user sessions via Firebase App Check before processing prompts.  
2. **BASTION Initialization (DBM/OMNICORTEX Specialist):**  
   * **System Prompt Configuration:** Hard-code BASTION to operate exclusively in analytical, mechanical, and JSON-output modes. Explicitly forbid narrative generation or conversational filler.  
   * **Statblock Ingestion (Gemini Vision):** Pass OCR data of monster statblocks (PDF/images) to BASTION. Force strict adherence to the DBM JSON Schema via responseMimeType: "application/json".  
   * **Mathematical Determinism:** Implement a middleware function that intercepts BASTION's output and recalculates derived stats (e.g., verifying HP \== Hit Dice \* CON mod). If the math fails, automatically trigger a reprompt to correct the hallucination before committing to the DBM.  
   * **Map Walling Processor:** Pass uploaded battlemap WebP buffers to BASTION Vision. Prompt for structural analysis, returning a strict array of vector coordinates: \[{x1, y1, x2, y2, type: 'wall|door'}\]. Map these directly into BVHBuilder.ts (Subsystem 2).  
   * **Semantic RAG Pipeline:** Synchronize Tangent core rules into Firebase/Vertex Vector Search. Initialize VectorSearchClient.ts. When rules are queried, retrieve the specific text embeddings and inject them as strict grounding context into BASTION's prompt.  
3. **AIME Initialization (Story Foundry Narrative Specialist):**  
   * **System Prompt Configuration:** Initialize AimeAgent.ts as a creative storytelling partner. Instruct AIME to focus on atmospheric descriptions, NPC motives, dialogue, and lore generation. Explicitly instruct AIME *not* to invent game mechanics or math.  
   * **Context Binding:** Dynamically feed the current Story Foundry SceneManifest (active NPCs, location metadata, environmental weather) into AIME's sliding context window to maintain narrative continuity.  
4. **Inter-Agent Tool Calling (The API Bridge):**  
   * Develop DBMFunctionRegistry.ts utilizing the Gemini API tools/functionDeclarations spec.  
   * Expose tools to AIME such as query\_bastion\_for\_encounter(cr\_target: number, environment: string).  
   * **Workflow Execution:** When a GM asks AIME to "generate a tense encounter with fire-based enemies in this volcano room," AIME generates the narrative setup, then internally calls the query\_bastion function. The Gateway intercepts this, pings BASTION/DBM for mathematically balanced fire-elemental statblocks, and returns the strict DBM IDs back to AIME. AIME then synthesizes the final response, bridging creative storytelling with valid mechanical execution.

**Failure States to Avoid:** Never allow AIME to hallucinate game stats or mechanics directly; it must always defer to BASTION via tool calling. Never allow BASTION to generate lore or flavor text. Context windows for both agents must be heavily sanitized to enforce their respective domains.

## **Engine Integration Roadmap**

| Phase | Capability Domain | Antigravity Implementation Task | Core Technologies |
| :---- | :---- | :---- | :---- |
| **Phase 1 (Engine Core)** | DBM & Foundry Sync | Connect legacy Web App logic to new Firebase sharded schema. Decouple static DBM/Foundry data from volatile session data. Implement unified authentication. | Firestore, React 18, Zustand, GCS |
| **Phase 1 (MVP VTT)** | Core Canvas & UI | Execute Canvas Renderer Implementation Plan (WebGPU). Deploy react-grid-layout for dynamic dashboard serialization. | WebGPU, PixiJS, Zustand |
| **Phase 2 (Sync)** | Dual-Channel Network | Execute Network Implementation Plan. Deploy self-hosted LiveKit SFU for volatile state (cursors, pings); use Yjs CRDTs for DBM sync. | WebRTC (LiveKit), Yjs, Firebase |
| **Phase 3 (Lighting)** | Vision Compute | Execute WGSL Implementation Plan. Develop fused compute kernels for TLAS/BLAS raycasting and Fog of War FBO logic. | WebGPU, WGSL |
| **Phase 4 (Logic)** | Macro Sandbox | Execute Actor Pipeline Plan. Embed QuickJS WASM runtime. Map engine hooks to DBM item actions and implement OPFS caching. | QuickJS, WASM, OPFS, SQLite |
| **Phase 5 (AI Tooling)** | Dual-Agent Integration | Execute AI Architecture Plan. Configure Vertex AI Gateway. Deploy BASTION for DBM validation and AIME for Story Foundry narrative generation with Inter-AI Tool Calling. | Gemini Flash, Vertex AI |

# **CLOUD INTEGRATION & INGESTION WALKTHROUGH**

# **CLOUD INTEGRATION & INGESTION WALKTHROUGH**

This comprehensive guide covers linking your Google Cloud credits to your Firebase/Firestore backend, configuring your environment, running the schema normalization migration scripts, and executing the BASTION/SPARK AI parsing pipelines for the **TANGENT SF RP** game engine.

## **STAGE 1: Activating Google Cloud Credits for Firebase**

Because Firebase is built on Google Cloud Platform (GCP), your Google Cloud promotional credits or startup credits can cover all Firebase services (Firestore, Cloud Functions, Authentication, and Hosting) once you upgrade your project to the **Blaze (Pay as you go)** plan.

### **Step 1.1: Link GCP Billing Account to Firebase**

1. Open the [Google Cloud Console Billing Page](https://console.cloud.google.com/billing).  
2. Ensure you are signed into the Google account that holds your promotional credits.  
3. If you haven't already, create a **Billing Account** and apply your credit code under the "Promotions" or "Billing" tab.  
4. Navigate to the [Firebase Console](https://console.firebase.google.com/).  
5. Open your OMNICORTEX project.  
6. In the bottom-left corner of the sidebar, click the **Upgrade** button next to the Spark (Free) plan to switch to the **Blaze (Pay as you go)** plan.  
7. Select the Google Cloud billing account where your credits reside.

*Note: As long as your usage stays within your credit balance, you will not be charged out of pocket. Firestore has a generous free tier anyway, so your credits will stretch significantly across your rulebook datasets.*

## **STAGE 2: Environment & Migration Setup**

Before ingesting new parsed data, ensure your local development environment is synced with the updated schema architecture (tech\_level, meta\_level, 7-tier ordering, and widget mapping).

### **Step 2.1: Verify Required Modules**

Ensure your project contains the core adaptation scripts discussed in your architecture update:

* tangentSchemaAdapters.js: Contains normalizeOmnicortexItem and exportOmnicortexItem.  
* categoryConfig.js: Houses the 7-tier master ordering (getSortedCategoryFieldKeys) and field definitions.  
* migrate\_omnicortex\_schema.mjs: The bulk migration runner.

### **Step 2.2: Run the Bulk Schema Migration Script**

If you have legacy files in your local data store using old keys (tl, ml, techLevel, gameMechanics), run the migration script to normalize them to the new schema:

node migrate\_omnicortex\_schema.mjs

**What this script does:**

1. Scans all dataset directories (architecture, armoring, augmentations, gear, mecha, weaponry, factions, species, etc.).  
2. Normalizes legacy keys (tl, ml, techLevel, metaLevel) into the standardized numeric tech\_level and meta\_level keys.  
3. Strips deprecated legacy keys upon export to maintain strict database cleanliness.

## **STAGE 3: Using BASTION / SPARK AI Parsers**

To ingest new raw rulebook text, lore, or gear manuals into OMNICORTEX, route your raw text through the updated **SPARK Prompts** provided in your project workspace.

### **Step 3.1: Ingestion Workflow**

1. **Chunk the Source Text:** Do not paste an entire 300-page rulebook into the AI at once. Break it down by logical categories (e.g., Chapter 3: Weaponry, Chapter 4: Lineages).  
2. **Select the Correct Prompt:** Match your content to the corresponding SPARK Prompt (A through N, covering Species, Features, Skills, Factions, Weaponry, Armoring, Mecha, Architecture, etc.).  
3. **Execute via BASTION/SPARK:** Feed the system instructions, schema, and raw text into your AI runner.  
4. **Enforce Formatting Constraints:**  
   * **No LaTeX:** Ensure no inline $ or display $$ symbols are generated. Use standard plain text for math (e.g., 2d8+3).  
   * **Strict JSON Output:** The AI must return a valid JSON array matching the exact schema keys (e.g., using tech\_level, meta\_level, and nested costs or modifiers widgets).

## **STAGE 4: Database Validation & Injection**

Once SPARK outputs the JSON array, run the automated validation gates before committing to Firestore.

### **Step 4.1: Validation Checklist**

* **JSON Linter Check:** Pass the output through a quick linter to ensure no trailing commas or unescaped quotes exist.  
* **Adapter Sanitization:** Pass the parsed items through normalizeOmnicortexItem() in your ingestion script:  
  import { normalizeOmnicortexItem } from './tangentSchemaAdapters.js';

  const rawParsedItems \= /\* AI output JSON \*/;  
  const verifiedItems \= rawParsedItems.map(item \=\> normalizeOmnicortexItem(item));

* **Batch Commit to Firestore:** Group your documents into batches of up to 500 records to safely commit them to your Firestore collections (weaponry, armoring, species, factions, etc.) utilizing your active Google Cloud credit backing.

### **Step 4.2: UI Verification**

1. Launch your local or hosted OMNICORTEX interface.  
2. Open the **DBMTableView** or category modals.  
3. Verify that the 7-tier master ordering (getSortedCategoryFieldKeys) correctly displays fields and that badge filters for tech\_level and meta\_level index your newly injected data seamlessly.

# **OMNICORTEX PARSER PROMPTS**

# **OMNICORTEX PARSER PROMPTS**

## **PART 1: COMPREHENSIVE IMPLEMENTATION PLAN & WORKFLOW CHECKLIST**

To ensure BASTION/SPARK can accurately parse, verify, and inject data into the Omnicortex Firestore database using the new schema (including the tech\_level/meta\_level normalization and the 7-tier master ordering), we must implement a multi-stage ingestion pipeline.

### **Stage 1: Pre-Processing & Data Preparation**

*Objective: Prepare raw text for optimal AI comprehension.*

* \[ \] **Document Chunking:** Break raw rulebooks and lore documents into logical chunks (e.g., one species per chunk, one weapon category per chunk) to prevent LLM context-window hallucination.  
* \[ \] **Formatting Sanitization:** Strip out complex tables or unreadable PDF artifacts. Convert them to standardized markdown lists before feeding them to the AI.  
* \[ \] **Categorization:** Tag each chunk with its intended Omnicortex category (e.g., \[Category: Weaponry\]) to route it to the correct Prompt parser.

### **Stage 2: AI Parsing & Structuring (BASTION/SPARK Generation)**

*Objective: Extract and map data to the strict JSON schemas.*

* \[ \] **Prompt Assignment:** Route the text to the corresponding revised system prompt (Prompts A-N below).  
* \[ \] **Widget Assembly:** Ensure the AI constructs complex fields (like costs\_map, modifiers\_list, sockets\_group, and critical\_details) as nested JSON objects/arrays, rather than flat strings.  
* \[ \] **Schema Adherence Check:** The AI must ensure no legacy keys (tl, ml, techLevel, gameMechanics) are used. It must strictly use the unified keys (tech\_level, meta\_level, mechanic, etc.).

### **Stage 3: Verification & Validation Gate (Automated Checks)**

*Objective: Catch errors before database injection.*

* \[ \] **JSON Linter:** Run the AI output through a strict JSON parser. Reject and re-prompt if malformed.  
* \[ \] **Type Checking:** Verify that tech\_level and meta\_level are output as numbers (or properly formatted strings that the system can cast to numbers).  
* \[ \] **Required Field Validation:** Check that mandatory fields (e.g., name) are not null or empty.  
* \[ \] **LaTeX Strip Check:** Scan strings to ensure no inline $ or display $$ characters are present. Convert to plain text mathematical notation.

### **Stage 4: Injection & Database Commit**

*Objective: Write the verified data to Firebase/Firestore.*

* \[ \] **Normalization Script:** Run the payload through normalizeOmnicortexItem (from tangentSchemaAdapters.js) as a final safeguard to catch any rogue legacy fields.  
* \[ \] **Batch Writes:** Group writes into Firestore batches (e.g., 500 documents per batch) to ensure transaction safety during massive ingestion.  
* \[ \] **Self-Contained Enforcement:** Ensure that sub-species and variants have their parent lineage lore directly embedded into their document, preventing the need for future relational joins.

### **Stage 5: UI Integration & Omnicortex Revision (Post-Injection)**

*Objective: Ensure data is editable and visible in the Omnicortex UI.*

* \[ \] **DBMTableView Sync:** Verify that the 7-tier master ordering (getSortedCategoryFieldKeys) correctly displays the injected fields in the UI modals.  
* \[ \] **Facet Generation:** Ensure the tech\_level and meta\_level badges and filters accurately index the newly injected data.  
* \[ \] **Manual Revision Gate:** Flag newly ingested items with a status: "draft" or status: "needs\_review" tag so GMs and developers can manually review the AI's work inside the Omnicortex before pushing to players.

## **PART 2: REVISED BASTION / SPARK AI PARSER PROMPTS**

*Note for AI Agent: All schemas have been updated to reflect the latest Omnicortex master field architecture. Legacy keys have been purged. Complex data points are now represented as structured JSON objects (Widgets) rather than flat strings.*

### **SPARK PROMPT A: SPECIES & LINEAGES PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX SPECIES PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist. Your job is to parse raw, hierarchical RPG lore and mechanical text into a flat, self-contained JSON schema optimized for a NoSQL Firebase/Firestore database.

\*\*TASK:\*\* Extract information detailing "Species" and "Sub-species" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
Every species/sub-species must strictly adhere to the following schema. Use exact keys. Do not add or remove keys.

\[  
  {  
    "name": "String (Species / Lineage Name. Required.)",  
    "title": "String or null (Formal Subspecies Title / Taxon)",  
    "parent\_species": "String or null (Parent Lineage / Taxon Family)",  
    "type": \["String"\] (Array of Biological / Synthetic Types),  
    "size": \["String"\] (Array of Species Size & Dimensions),  
    "movement": \["String"\] (Array of Locomotion Profiles),  
    "homeworld": "String or null (Origin Planet / System)",  
    "stigma": "String or null (Societal Reaction Penalty)",  
    "tech\_level": Number (Native Tech Level, 0-5),  
    "meta\_level": Number (Native Meta Level, 0-5),  
    "prerequisite": "String or null (Prerequisite Condition Gates)",  
    "trait": \["String"\] (Array of Inherent Biological Traits),  
    "costs": {  
      "bp": Number (Base BP Chassis Cost)  
    },  
    "modifiers": \[  
      { "target": "String (Attribute/Skill)", "value": "String (e.g., '+1')" }  
    \],  
    "description": "String (Executive Summary / High-level Overview)",  
    "body": "String (Full Lore Markdown, Sociological Profile & Semiotics. Embed parent lore here if this is a sub-species.)",  
    "mechanic": "String (BASTION Racial Rules & Scaling Formulae)",  
    "note": "String or null (Architect / Design Notes)",  
    "tags": \["String"\] (Array of Compendium Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Self-Contained Documents:\*\* Embed parent lineage lore directly into the \`body\` field of sub-species. Do not rely on relational joins.  
2\. \*\*Formatting:\*\* NO LaTeX formatting (do not use $ or $$). Use standard text for mathematical notation. Remove markdown bold/italics from inside JSON string values. Escape strings properly.  
3\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT B: INVOCATIONS & SPECIAL ABILITIES PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX INVOCATIONS PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist. 

\*\*TASK:\*\* Extract information detailing "Invocations & Special Abilities" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Spell / Power Name. Required.)",  
    "discipline": "String or null (Metaphysical Discipline School)",  
    "meta\_skill": "String or null (Invoking Meta Skill)",  
    "meta\_level": Number (Invocation Rank / Meta Level, 0-5),  
    "tech\_level": Number (Required Tech Level, 0-5),  
    "prerequisite": "String or null (Prerequisites & Power Gates)",  
    "cast\_time": "String or null (Activation Speed)",  
    "duration": "String or null (Sustained, Scene, Instantaneous)",  
    "range": \["String"\] (Array of Tactical Ranges),  
    "area": \["String"\] (Array of Area Patterns),  
    "target": \["String"\] (Array of Target Restrictions),  
    "effect": \["String"\] (Array of Damage & Energy Types),  
    "design\_dc": "String or null (Crafting / Casting DC Benchmark)",  
    "costs": {  
      "ap": Number or null,  
      "focus": Number or null,  
      "bp": Number or null,  
      "strain": Number or null  
    },  
    "critical\_details": {  
      "success": "String or null (Critical triggers)",  
      "failure": "String or null (Backlash fumbles)"  
    },  
    "modifiers": \[  
      { "target": "String (Stat/Skill)", "value": "String (Bonus amount)" }  
    \],  
    "sockets": {  
      "capacity": Number or null,  
      "displacement": "String or null"  
    },  
    "description": "String (Visual Manifestation, Sensory Flavor & Incantation)",  
    "mechanic": "String (Precise BASTION Mechanical Resolution)",  
    "note": "String or null (Architect Notes)",  
    "tags": \["String"\] (Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Remove markdown bold/italics from inside strings.  
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT C: WEAPONRY PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX WEAPONRY PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing "Weaponry" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Weapon Model / Designation. Required.)",  
    "classification": "String or null (e.g., Melee Slashing, Ranged Ballistic)",  
    "quality": "String or null (e.g., Standard, Mastercrafted)",  
    "wielding": "String or null (e.g., One-Handed, Two-Handed)",  
    "faction\_skin": "String or null (Manufacturer Aesthetic / Faction Origin)",  
    "creator": \["String"\] (Corporate Megacorp / Artisan Foundry),  
    "origin": \["String"\] (Cultural Origin),  
    "availability": "String or null (Market Legality & Procurement Rarity)",  
    "tech\_level": Number (Tech Level, 0-5),  
    "meta\_level": Number (Meta Level, 0-5),  
    "prerequisite": "String or null (Strength / Skill Requirements)",  
    "skill": "String or null (Governing Combat Skill)",  
    "damage": "String or null (Damage Formula: e.g. 2d8+3)",  
    "damage\_type": "String or null (e.g., Kinetic, Thermal)",  
    "ap": "String or null (Armor Penetration Rating)",  
    "accuracy": "String or null (Inherent Accuracy Bonus)",  
    "attack\_rate": "String or null (Rate of Fire)",  
    "modes": \["String"\] (Firing Modes \- Single, Burst, Auto),  
    "range": "String or null (Tactical Range)",  
    "area": \["String"\] (Blast Radius / Cone),  
    "target": \["String"\] (Target Restrictions),  
    "ammunition": "String or null (Magazine / Battery Capacity)",  
    "power\_source": "String or null (Power Cell Requirements)",  
    "special": \["String"\] (Inherent Weapon Qualities),  
    "weight": "String or null (Weight in kg)",  
    "durability": "String or null (Structure Points / Durability)",  
    "size": \["String"\] (Creature Size Compatibility),  
    "design\_dc": "String or null (Manufacturing Crafting DC / WS)",  
    "costs": {  
      "credits": Number or null,  
      "bp": Number or null  
    },  
    "sockets": {  
      "total": Number or null,  
      "used": Number or null  
    },  
    "modifications": \["String"\] (Installed Scopes, Silencers, etc.),  
    "critical\_details": {  
      "threat\_score": "String or null (e.g., 19-20)",  
      "effect": "String or null (Crit Strike Effects)"  
    },  
    "modifiers": \[  
      { "target": "String", "value": "String" }  
    \],  
    "component": \["String"\] (Internal Modular Sub-Assemblies),  
    "design": \["String"\] (Blueprint Schematics),  
    "description": "String (Visual Aesthetic, History & Semiotics)",  
    "mechanic": "String (Special Rules & Combat Edge Cases)",  
    "note": "String or null (Design / Balancing Notes)",  
    "tags": \["String"\] (Search & Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Standard text only.  
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT D: ARMORING & DEFENSIVE GEAR PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX ARMORING PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing "Armoring & Defensive Gear" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Armor Suit / Shield Designation. Required.)",  
    "category": "String or null (Lightweight, Mediumweight, Heavyweight, Shield)",  
    "coverage": "String or null (Partial, Standard, Sealed, Bulwark)",  
    "quality": "String or null (Bad, Standard, Mastercrafted)",  
    "faction\_skin": "String or null (Manufacturer Cultural Skin)",  
    "creator": \["String"\] (Armor Foundries),  
    "availability": "String or null (Procurement Rarity)",  
    "tech\_level": Number (Tech Level, 0-5),  
    "meta\_level": Number (Meta Level, 0-5),  
    "prerequisite": "String or null (Strength Minimums)",  
    "skill": "String or null (Governing Armor Skill)",  
    "dr": "String or null (Damage Resistance Rating)",  
    "sp": "String or null (Structure Points / Armor Health)",  
    "max\_dex": "String or null (Max Agility / Dexterity Bonus Allowed)",  
    "mobility\_penalty": "String or null (Armor Check / Mobility Penalty)",  
    "resistance": \["String"\] (Energy / Kinetic Damage Resistances),  
    "body\_locations": \["String"\] (Protected Anatomical Slots),  
    "carried\_shield": "String or null (Integrated Shield/Force-Field)",  
    "modes": \["String"\] (Operational Modes \- Sealed, Camo),  
    "weight": "String or null (Armor Mass in kg)",  
    "size": \["String"\] (Creature Size Profile),  
    "material": \["String"\] (Alloys, Polymers, Composites),  
    "design\_dc": "String or null (Fabrication DC / WS)",  
    "costs": {  
      "credits": Number or null,  
      "bp": Number or null  
    },  
    "sockets": {  
      "total": Number or null,  
      "used": Number or null  
    },  
    "modifications": \["String"\] (Reinforced Plates, Sensors, Seals),  
    "critical\_details": {  
      "deflection": "String or null (Deflection Saves)",  
      "armor\_break": "String or null (Armor Break Rules)"  
    },  
    "modifiers": \[  
      { "target": "String", "value": "String" }  
    \],  
    "classification": \["String"\] (Role Classifications),  
    "design": \["String"\] (Schematics),  
    "description": "String (Visual Aesthetic, Ergonomics & Materials Lore)",  
    "mechanic": "String (Environmental Protection & Vacuum Rules)",  
    "note": "String or null (Design Notes)",  
    "tags": \["String"\] (Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Standard text only.  
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT E: AUGMENTATIONS & CYBERNETICS PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX AUGMENTATIONS PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing "Augmentations & Cybernetics" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Augmentation Designation. Required.)",  
    "type": "String or null (Cybernetic, Neural, Bioware, Sensory, Esoteric)",  
    "location": \["String"\] (Anatomical Installation Slots),  
    "classification": \["String"\] (Medical / Tactical Classifications),  
    "creator": \["String"\] (Cybernetics Megacorp),  
    "stigma": "String or null (None, Minor, Moderate, Severe Visibility)",  
    "tech\_level": Number (Tech Level, 0-5),  
    "meta\_level": Number (Meta Level, 0-5),  
    "prerequisite": "String or null (Biological & Neural Compatibility Prereqs)",  
    "dr": "String or null (Integrated Armor DR)",  
    "sp": "String or null (Structure Points)",  
    "design\_dc": "String or null (Installation / Surgery DC & Wealth Score)",  
    "costs": {  
      "credits": Number or null,  
      "strain": Number or null,  
      "nodes": Number or null,  
      "bp": Number or null  
    },  
    "sockets": {  
      "capacity": Number or null  
    },  
    "modifiers": \[  
      { "target": "String (Attribute/Skill)", "value": "String (Bonus)" }  
    \],  
    "critical\_details": {  
      "malfunction": "String or null (EMP Vulnerability Triggers)"  
    },  
    "component": \["String"\] (Internal Hardware Components),  
    "design": \["String"\] (Neuro-link Blueprints),  
    "description": "String (Surgical Implantation Profile & Visual Aesthetic)",  
    "mechanic": "String (Rules, Overcharge Triggers & System Strain)",  
    "note": "String or null (Architect Notes)",  
    "tags": \["String"\] (Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Standard text only.  
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT F: FACTIONS & GEOPOLITICAL ENTITIES PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX FACTIONS PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing 'Factions & Geopolitical Entities' from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Faction Name. Required.)",  
    "archetype": "String or null (Militaristic, Corporate, Cult, Syndicate)",  
    "society": "String or null (Parent Societal Profile)",  
    "tech\_level": Number (Faction Average Tech Level, 0-5),  
    "meta\_level": Number (Faction Average Meta Level, 0-5),  
    "motto": "String or null (Official Creed / Motto)",  
    "symbol\_sigil": "String or null (Symbol / Heraldic Sigil)",  
    "driving\_mandate": "String or null (Supreme Geopolitical Agenda)",  
    "leadership": "String or null (Ruling Body / Supreme Figurehead)",  
    "government\_type": "String or null (Autocracy, Meritocracy, Direct Democracy)",  
    "succession": "String or null (Succession Laws & Transfer of Power)",  
    "core\_beliefs": "String or null (Cultural & Spiritual Ideology)",  
    "social\_structure": "String or null (Class Stratification & Demographics)",  
    "economic\_model": "String or null (Capitalism, Post-Scarcity, Barter)",  
    "primary\_exports": "String or null (Key Trade Commodities)",  
    "law\_order": "String or null (Judiciary, Law Enforcement & Penal Codes)",  
    "outsider\_view": "String or null (Diplomatic Stance on Outsiders)",  
    "colloquialisms": "String or null (Dialects, Slang & Cultural Idioms)",  
    "military\_doctrine": "String or null (Combat & Fleet Strategy)",  
    "key\_units": "String or null (Elite Ground / Boarding Formations)",  
    "naval\_assets": "String or null (Capital Fleets & Orbital Defense Grids)",  
    "attitude": "String or null (Diplomatic Demeanor)",  
    "goals": "String or null (Short & Long-term Milestones)",  
    "social\_strengths": "String or null (Geopolitical Advantages)",  
    "social\_weaknesses": "String or null (Systemic Vulnerabilities)",  
    "prerequisite": "String or null (Membership Prerequisites)",  
    "modifiers": \[  
      { "target": "String (Universal Faction Bonus)", "value": "String" }  
    \],  
    "description": "String (Executive Summary & Overview)",  
    "design\_language": "String or null (Industrial & Graphic Design Aesthetic)",  
    "architecture": "String or null (Urban & Habitat Building Aesthetic)",  
    "gear\_aesthetic": "String or null (Uniform, Armor & Equipment Semiotics)",  
    "lighting\_mood": "String or null (Environmental Visual Atmosphere)",  
    "image\_prompt": "String or null (Diffusion AI Art Prompt Guide)",  
    "mechanic": "String or null (BASTION Faction Standing Rules)",  
    "note": "String or null (GM Notes)",  
    "tags": \["String"\] (Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Escape string values (using \\n for paragraphs).  
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPT G: MODULAR CHARACTERS & ADVERSARIES PARSER**

\# SYSTEM INSTRUCTIONS: OMNICORTEX MODULAR CHARACTERS PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing "Modular Characters & Adversaries" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
\[  
  {  
    "name": "String (Operative / Adversary Name. Required.)",  
    "designation": "String or null (Adversary, Ally, Companion, Neutral)",  
    "threatTier": Number or null (Threat Tier: 0 to 20),  
    "bossType": "String or null (Minion, Standard, Boss, Mastermind)",  
    "competencyRole": "String or null (Tank, Striker, Assassin, Controller, Healer, Commander)",  
    "sizeCategory": "String or null (Diminutive to Colossal)",  
    "isSynthetic": Boolean (true if Synthetic / Cybernetic Chassis),  
    "tech\_level": Number (Tech Level, 0-5),  
    "meta\_level": Number (Meta Level, 0-5),  
    "craft\_dc": "String or null (Threat / Encounter DC)",  
    "tacticalBehaviors": \["String"\] (AI Behavioral Scripts & Attack Priorities),  
    "description": "String (Appearance, AI Personality & Combat Motives)",  
    "mechanic": "String (Combat Actions, Reactions, Special Traits & Loot Drops)",  
    "note": "String or null (GM Encounter & Scaling Notes)",  
    "tags": \["String"\] (NPC Classification Tags)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Formatting:\*\* NO LaTeX formatting. Escape strings properly.   
2\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

### **SPARK PROMPTS H-N (FEATURES, SKILLS, DISADVANTAGES, GEAR, MECHA, ARCHITECTURE, OTHER)**

*(For the remaining categories, use this unified structure optimized for the new schema, adapting the specific fields to the category context.)*

\# SYSTEM INSTRUCTIONS: OMNICORTEX \[CATEGORY NAME\] PARSER

\*\*ROLE:\*\* You are BASTION, an expert data engineer and RPG system archivist.

\*\*TASK:\*\* Extract information detailing "\[Category Name\]" from the Tangent SF RP system and output a perfectly formatted JSON array of objects.

\*\*JSON SCHEMA:\*\*  
Every item must strictly adhere to the following schema structure. Replace legacy fields (like tl, ml, gameMechanics) with the fields provided below. Do not add or remove keys.

\[  
  {  
    "name": "String (Name of the entity. Required.)",  
    "type": "String or null (Classification or Category Type)",  
    "tech\_level": Number (Technical/Technology Level, 0-5),  
    "meta\_level": Number (Meta/Power Level, 0-5),  
    "prerequisite": "String or null (Requirements to use, equip, or acquire)",  
    "costs": {  
      "credits": Number or null,  
      "bp": Number or null,  
      "cp": Number or null  
    },  
    "modifiers": \[  
       { "target": "String (Mechanical Numeric Bonus/Penalty Target)", "value": "String" }  
    \],  
    "description": "String (The flavorful narrative description)",  
    "mechanic": "String (The detailed rules of how it functions in play. Replaces 'gameMechanics')",  
    "note": "String or null (Any additional edge cases, restrictions, or table notes)",  
    "tags": \["String"\] (Classification Tags)  
      
    // ADD CONTEXT-SPECIFIC FIELDS HERE BASED ON CATEGORY (e.g., 'isMultipleSelection' for Features, 'operationDomain' for Mecha, 'architecturalStyle' for Architecture)  
  }  
\]

\*\*PARSING HEURISTICS & RULES:\*\*  
1\. \*\*Normalization:\*\* Map all \`tl\` and \`ml\` text to the numeric \`tech\_level\` and \`meta\_level\` fields. Group all numeric mechanical modifiers into the \`modifiers\` array.  
2\. \*\*Formatting:\*\* NO LaTeX formatting. Remove markdown bold/italics from within JSON values.   
3\. \*\*Output Requirement:\*\* Output ONLY the valid JSON block.

