# **ANTIGRAVITY EXECUTION DAG: STAGED IMPLEMENTATION PLAN (EXPANDED ARCHITECTURE)**

**ORCHESTRATOR DIRECTIVE:** This document serves as the absolute, non-negotiable execution sequence for the Antigravity multi-agent framework. Execution is strictly staged and topologically sorted. A node (software component) cannot be initiated until its prerequisite node has passed automated verification via the Python SDK gRPC channel.

**Failure Protocol:** If any Verification Gate fails (e.g., performance drops below 60fps, memory leaks are detected, or CRDTs fail to merge), the Orchestrator will automatically trigger a rollback to the previous stable commit, flush the active worker memory, and issue a highly specific error diagnostic to the responsible sub-agent for a mandatory rewrite.

## **STAGE 1: Data Topology & Network Sync (CORE\_STATE\_ENGINE)**

**Prerequisites:** Node environment initialized, Firebase project active, Local Daemon agyd running with OS Power Assertions active.

**Assigned Agent:** Backend Specialist Agent

* **1.1 src/engine/database/OPFSDatabaseWorker.ts**  
  * **Objective:** Establish the local-first relational core with synchronous disk access.  
  * **Implementation:** Instantiate a dedicated Web Worker. Import SQLite WASM with the Origin Private File System (OPFS) Virtual File System (VFS) backend. Request a FileSystemSyncAccessHandle via the OPFS API. Expose an asynchronous messaging bus for SQL queries using SharedArrayBuffer for zero-copy memory transfers between the main thread and the worker. Implement Write-Ahead Logging (WAL) checkpoints to prevent log bloat during heavy I/O operations.  
  * **Verification Gate:** Agent must successfully insert 10,000 complex, heavily indexed mock rows into OPFS, perform a 3-table JOIN query, and read the results back to the main thread in under 50ms using the headless Playwright tester.  
* **1.2 src/engine/state/VolatileSharder.ts**  
  * **Objective:** Unify static relational data and dynamic ephemeral state.  
  * **Implementation:** Initialize a Zustand store utilizing the Immer middleware for immutable state drafts. Create memoized selectors that merge static entity data (from OPFS, like base Mecha stats) with highly volatile X/Y/Z token data. Ensure mutations to this store bypass the standard React reconciliation engine to prevent global DOM re-renders, utilizing transient updates (api.subscribe) where necessary.  
  * **Verification Gate:** React component successfully reads merged data; a simulated loop of 1,000 rapid state mutations registers exactly zero unnecessary DOM re-renders in the React Profiler.  
* **1.3 src/engine/state/DBMBridge.ts**  
  * **Objective:** Firebase/Firestore listener setup and offline persistence caching.  
  * **Implementation:** Implement paginated onSnapshot listeners to /Campaigns/{id}/Actors. Pipe incoming DBM data directly into the OPFS database to keep the local client updated with global rules. Handle network jitter by implementing a local queue that caches incoming snapshots if the OPFS worker is temporarily locked.  
  * **Verification Gate:** Mock Firestore update triggers a successful OPFS row update, and simulating a 5-second network drop results in a successful queued catch-up without dropped packets.  
* **1.4 src/engine/network/LiveKitClient.ts**  
  * **Objective:** High-frequency WebRTC telemetry for zero-latency awareness.  
  * **Implementation:** Connect to a self-hosted LiveKit SFU (Selective Forwarding Unit). Establish an unreliable binary DataChannel. Serialize cursor coordinates, ruler measurements, and token drag ghosting using a strict Flatbuffers schema to minimize payload size. Set broadcast rate to 60Hz. Implement client-side linear extrapolation to smooth out jitter from dropped UDP packets.  
  * **Verification Gate:** Two headless browser instances successfully exchange binary ping data at \< 20ms latency while artificially dropping 5% of packets, maintaining visual smoothness.  
* **1.5 src/engine/network/YjsProviderBridge.ts**  
  * **Objective:** Conflict-free state resolution for documents and collaborative arrays.  
  * **Implementation:** Initialize Y.Doc. Map Character sheets to Y.Map and the tactical board state to Y.Array. Connect the Y.Doc updates to the LiveKit *reliable* data channel. Implement aggressive garbage collection for Yjs tombstones to prevent document size from ballooning over long campaigns. Encode state updates into binary arrays before transmission.  
  * **Verification Gate:** Simultaneous contradictory edits applied by three headless instances (e.g., all trying to edit the same HP value) mathematically resolve to an identical deterministic state without data corruption.  
* **1.6 src/engine/network/FirestoreDebouncer.ts**  
  * **Objective:** GCP rate-limit protection and catastrophic data-loss prevention.  
  * **Implementation:** Observe the Y.Doc state changes via Y.Doc.on('update'). On mutation, trigger a timeout sequence. If no mutations occur for 500ms, batch the resulting final state, encode it, and execute a single updateDoc() to Firestore. Implement a beforeunload event listener that forces an immediate synchronous flush to Firestore if the user accidentally closes the browser tab.  
  * **Verification Gate:** 100 rapid CRDT mutations over 3 seconds result in exactly 1 Firestore write after the timeout. Tab-close simulation successfully catches and writes the final payload.

## **STAGE 2: Canvas & Rendering Engine (CORE\_CANVAS\_RENDERER)**

**Prerequisites:** Stage 1 completion (Zustand state must be available for mapping).

**Assigned Agent:** Graphics & Compute Agent

* **2.1 src/engine/canvas/RendererContext.ts**  
  * **Objective:** WebGPU initialization, adapter management, and fault tolerance.  
  * **Implementation:** Call navigator.gpu.requestAdapter() prioritizing high-performance discrete GPUs. Initialize @pixi/webgpu Application. Implement a try/catch fallback to @pixi/webgl if the device fails the adapter request (e.g., older mobile hardware). Write event hooks to handle device.lost events, automatically rebuilding the graphics pipeline if the OS temporarily suspends the GPU.  
  * **Verification Gate:** Headless Chrome with \--enable-unsafe-webgpu boots the canvas without throwing WebGPU context errors, and a simulated context loss successfully triggers the recovery loop.  
* **2.2 src/engine/canvas/LayerCompositor.ts**  
  * **Objective:** Z-Axis hierarchy enforcement and render grouping.  
  * **Implementation:** Instantiate the strict PIXI.Container tree (z:0 Background through z:70 UI). Utilize PixiJS RenderGroup instructions to prevent the engine from recalculating transforms for static layers (like the background map). Expose methods for adding sprites strictly by layer enum, preventing Z-fighting. Implement alpha-masking channels for the Roof layer, linking transparency to the active token's coordinates.  
  * **Verification Gate:** Sprites added dynamically out of order successfully render in the correct Z-index based on container parent, and static layers consume 0ms of CPU transform time.  
* **2.3 src/engine/canvas/FrustumChunkManager.ts**  
  * **Objective:** Infinite canvas spatial hashing and aggressive culling.  
  * **Implementation:** Read camera X/Y bounds and zoom ratio. Divide the infinite world into a 2048x2048 spatial hash grid. Only set renderable \= true for PIXI sprites whose AABB (Axis-Aligned Bounding Box) intersects the active viewport chunks. Implement hysteresis (a 1-chunk padding radius) to load textures asynchronously just *before* they enter the screen to prevent edge-flicker during rapid panning.  
  * **Verification Gate:** 50,000 sprites instantiated across a massive map; FPS remains locked at 144hz because only the 100 sprites currently on-screen are dispatched to the GPU.  
* **2.4 src/engine/math/CoordinateEngine.ts**  
  * **Objective:** Grid mathematics and pathfinding integration.  
  * **Implementation:** Implement Cube Coordinates (q, r, s) for Hex grids and axial coordinates for square grids. Map PixiJS pixel coordinates to Tangent 30ft scale mechanics based on Scene PPI (Pixels Per Inch). Mitigate floating-point precision errors by snapping final token coordinates to strict integer grid intersections. Provide distance-heuristic functions for future A\* pathfinding.  
  * **Verification Gate:** Token pixel movement accurately translates to exactly 1 Hex movement across all 6 directional axes without mathematical drift.  
* **2.5 src/engine/memory/GCMonitor.ts**  
  * **Objective:** Prevent VRAM leaks during scene transitions.  
  * **Implementation:** Hook into React/Pixi unmount lifecycles. Recursively call destroy(true, true) on all children to explicitly sever WebGPU buffer bindings and flush textures from GPU memory on scene change. Monitor texture atlas saturation and dynamically prune unused WebP assets from VRAM if memory pressure exceeds 80%.  
  * **Verification Gate:** Memory snapshot profile via Chrome DevTools protocol after 5 heavy scene loads shows flatline VRAM usage, confirming no cumulative leaks.

## **STAGE 3: Vision, Physics & Compute Shaders (WGSL\_COMPUTE\_VISION)**

**Prerequisites:** Stage 2 completion.

**Assigned Agent:** Graphics & Compute Agent

* **3.1 src/engine/vision/WGSLComputeContext.ts**  
  * **Objective:** WebGPU compute pipeline configuration and memory alignment.  
  * **Implementation:** Establish GPUDevice.createComputePipeline. Map wall vector data into Float32Array. Crucially: pad struct data strictly to 16-byte alignments to satisfy the WebGPU uniform buffer spec (preventing silent memory corruption). Cache compiled pipelines to prevent shader recompilation stutters during gameplay.  
  * **Verification Gate:** Compute shader compiles successfully without buffer misalignment warnings in the console.  
* **3.2 src/engine/vision/BVHBuilder.ts**  
  * **Objective:** Pre-culling geometry via Bounding Volume Hierarchies.  
  * **Implementation:** Construct a CPU-side BVH tree for walls using a Surface Area Heuristic (SAH) to optimize node splits. Flatten the tree into a linear array structure optimized for GPU consumption. Query the BVH using a token's radius before dispatching arrays to the GPU, separating static walls from dynamic occluders (like moving vehicles).  
  * **Verification Gate:** A complex map of 10,000 walls is reduced to 50 relevant walls in \< 1ms CPU time based on a radial query, drastically reducing the GPU payload.  
* **3.3 src/engine/vision/shaders/fused\_vision.wgsl**  
  * **Objective:** Line of Sight, soft shadows, and Fog of War rendering.  
  * **Implementation:** Write WGSL utilizing @compute @workgroup\_size(64). Evaluate ray-wall intersection. Implement Cone Tracing algorithms to calculate realistic soft shadow penumbras based on light source radius and distance to occluder. Write the final visibility mask to an ephemeral stencil buffer FBO (Frame Buffer Object) to dynamically mask the Fog of War layer.  
  * **Verification Gate:** Shader outputs correct 2D shadow geometry with mathematically accurate soft gradients matching test occluders.  
* **3.4 src/engine/vision/shaders/sdf\_csg\_core.wgsl**  
  * **Objective:** Dynamic environment geometry and boolean math.  
  * **Implementation:** Implement length, max, and min distance functions to mathematically define geometry (spheres, boxes). Combine them via Constructive Solid Geometry (CSG). Implement polynomial smooth minimum functions (smin) to allow organic blending between geometric shapes. Utilize domain repetition (mod math) to generate infinite grids of pillars or bulkheads without extra memory overhead.  
  * **Verification Gate:** Boolean subtraction of two SDF shapes successfully compiles and evaluates distances correctly, rendering a perfect archway.  
* **3.5 src/engine/physics/shaders/elemental\_fluid.wgsl**  
  * **Objective:** Pyro/Corrosive physics simulation.  
  * **Implementation:** Hybrid Eulerian/Lagrangian solver. Read particle velocity/position, apply gravity/wind vectors. Detect SDF collision, calculate bounce vectors using calculated surface normals and restitution coefficients. Implement a bitonic sort on the GPU to order particles by depth for correct alpha blending of fire and smoke.  
  * **Verification Gate:** 1,000,000 particle simulation runs at \>60 FPS on GPU, correctly bouncing off SDF walls.  
* **3.6 src/engine/physics/shaders/boids\_swarm.wgsl**  
  * **Objective:** Swarm automation and emergent flocking behavior.  
  * **Implementation:** Calculate cohesion, separation, and alignment vectors per-thread based on neighbor proximity. To avoid O(N^2) complexity, implement a GPU-side spatial grid hashing algorithm, allowing each boid to only check neighbors within its immediate grid cell.  
  * **Verification Gate:** 5,000 swarm agents navigate around SDF obstacles autonomously while maintaining flock cohesion at 144 FPS.

## **STAGE 4: Media, Assets & Cartography (STORY\_FOUNDRY\_ASSET\_PIPELINE)**

**Prerequisites:** Stages 1 & 2 completion.

**Assigned Agent:** Frontend Architect Agent / Backend Specialist

* **4.1 src/engine/assets/FoundryIngestion.ts**  
  * **Objective:** Cloud payload retrieval and dependency resolution.  
  * **Implementation:** Authenticated fetch to Story Foundry GCP endpoints. Parse the returned SceneManifest.json. Resolve all relative vs. absolute deep links. Pre-warm the browser cache for critical assets (like the background map and player tokens) before dropping the loading screen.  
  * **Verification Gate:** Successfully extracts image URLs and metadata strings from a mock manifest and completes pre-warming without hanging.  
* **4.2 src/engine/assets/OPFSCacheWorker.ts**  
  * **Objective:** Binary caching and aggressive network mitigation.  
  * **Implementation:** Intercept fetch requests for .webp and .mp3 files via a Service Worker. Write the ArrayBuffer to OPFS. Implement a Least Recently Used (LRU) eviction policy to ensure the OPFS quota does not exceed browser limits. Serve from OPFS on subsequent requests, falling back to network only on cache miss.  
  * **Verification Gate:** Second load of a 100MB map resolves in \< 50ms from local cache without triggering a network request.  
* **4.3 src/engine/audio/SpatialAudioGraph.ts**  
  * **Objective:** 3D Audio and physical occlusion.  
  * **Implementation:** Initialize AudioContext. Map PannerNode X/Y coordinates directly to the PixiJS token coordinates. Link listener position to the selected token. Implement Head-Related Transfer Functions (HRTF) for accurate binaural panning. Apply dynamic low-pass Biquad filters if the BVH builder detects a wall between the audio source and the listener.  
  * **Verification Gate:** Audio pan shifts cleanly Left/Right, and audio becomes visibly muffled (frequencies cut) when the token moves behind a concrete wall.  
* **4.4 src/engine/cartography/NVectorCalculator.ts**  
  * **Objective:** Spherical geodesy and orbital mechanics math.  
  * **Implementation:** Ditch Haversine formulas due to polar singularity crashes. Implement 3D Cartesian conversions \[nx, ny, nz\]. Calculate Great Circle distance using cross/dot products. Expose functions to calculate cross-track distances for orbital intercepts (checking if a linear path intersects a specific point radius).  
  * **Verification Gate:** Distance calculation directly over a planetary pole evaluates correctly without division-by-zero errors.  
* **4.5 src/engine/cartography/AstrogationGenerator.ts**  
  * **Objective:** Procedural universe mapping.  
  * **Implementation:** Generate points via Poisson Disk Sampling driven by a 3D Perlin noise density map (creating galactic arms). Perform Delaunay Triangulation. Reduce edges using Kruskal's MST to define Translux hyperlanes. Translate the resulting mathematical graph into precise PixiJS vector drawing instructions.  
  * **Verification Gate:** Generates a fully connected graph of 2,000 stars clumped into distinct galactic arms with no overlapping hyperlane edges.  
* **4.6 src/engine/cartography/BSPDeckplanGenerator.ts**  
  * **Objective:** Algorithmic interior map generation.  
  * **Implementation:** Binary Space Partitioning algorithm dividing bounds recursively to create rooms. Implement an A\* pathfinding algorithm to drill corridors through the BSP tree, connecting sibling nodes. Pass the final room and corridor bounds directly to the WGSL shader as CSG union instructions.  
  * **Verification Gate:** Outputs valid CSG instructions for the WGSL shader generating a 50-room dungeon without overlapping or inaccessible room geometry.

## **STAGE 5: Rules Engine & Tactical Automation (MECHANICS\_PIPELINE)**

**Prerequisites:** Stage 1 completion (Requires SQLite / Zustand state).

**Assigned Agent:** Backend Specialist / Rules Arbitrator Agent

* **5.1 src/engine/mechanics/QuickJSSandbox.ts**  
  * **Objective:** Secure macro execution and ReDoS prevention.  
  * **Implementation:** Instantiate a WASM QuickJS worker to act as an isolated sandbox. Establish strict watchdog timers (500ms timeout) and hard memory limits (64MB). Use postMessage to pass AST trees. Explicitly strip access to the DOM, fetch, or any global variables inside the sandbox environment.  
  * **Verification Gate:** A malicious infinite loop macro (while(true) {}) injected into the engine is successfully killed by the watchdog without freezing the main browser thread.  
* **5.2 src/engine/mechanics/DiceASTParser.ts**  
  * **Objective:** Tangent notation parsing and resolution.  
  * **Implementation:** Build a custom lexer/parser to tokenize strings like (((2d20kh1 \+ @str) \* 2\) \+ 1d4\[fire\]). Enforce standard mathematical operator precedence. Hook into Zustand to resolve @ variables dynamically. Implement "exploding dice" logic where a max roll triggers an additional recursive roll.  
  * **Verification Gate:** AST tokenizes and evaluates complex nested equations correctly based on mocked Zustand actor data.  
* **5.3 src/engine/rules/CharacterBuilder.ts**  
  * **Objective:** 150 BP Economy and bounded accuracy enforcement.  
  * **Implementation:** Build a reactive DAG. Validate max \+4/+5 Parity Caps based on selected species templates. Apply occupational discount modifiers dynamically. Ensure Hindrance arbitrage refunds hard-cap at 152 BP total. Check for cyclical dependencies (e.g., Feature A requires Feature B, which requires Feature A).  
  * **Verification Gate:** Attempting to buy a 153rd BP throws a specific rule-validation error; attempting to raise a non-templated attribute to \+5 is rejected.  
* **5.4 src/engine/rules/CombatArbitrator.ts**  
  * **Objective:** Action scaling and size physics.  
  * **Implementation:** Track the action index per turn. Calculate Iterative MAP based on Rank thresholds (e.g., Pinnacle \-2/-4/-6). Apply Attacker/Target Size Modifiers mathematically (Target Size Mod \- Attacker Size Mod). Expose a state machine hook that resets the action index at the "End of Turn" phase.  
  * **Verification Gate:** 3rd attack from a Rank 12 (Expert) character correctly applies a \-10 MAP penalty; a Colossal turret firing at a Medium infantry applies a \-16 scale penalty.  
* **5.5 src/engine/rules/DamagePipeline.ts**  
  * **Objective:** Armor caps, penetration, and localized trauma.  
  * **Implementation:** Calculate D\_net by finding Math.max() of layered DR sources, subtracting Armor Penetration (AP). Track the 33.3% Max Health threshold for Called Shots. If the threshold is breached, push the appropriate "Disabled Limb" or "KO" flag directly to the Yjs CRDT status array to synchronize with all clients.  
  * **Verification Gate:** Layered DR 20 and DR 15 correctly resolves as DR 20 against an attack; an arm taking 34% damage automatically applies the disabled status and halves movement speed.  
* **5.6 src/engine/rules/MechaSocketManager.ts**  
  * **Objective:** Chassis logistics and hardware rejection.  
  * **Implementation:** Enforce Mount scaling (Size Multiplier \= Mounts required). Differentiate TL3 (EMP Vulnerable) vs TL4 (Immune/Fast Heal). Calculate Node limits. If nodes are exceeded, trigger Cellular Rejection, permanently capping max Vitality until hardware is removed. Recursively unmount child weapons if a parent Mount is destroyed.  
  * **Verification Gate:** Attempting to place an EMP burst on a TL4 augmentation returns no effect; exceeding node capacity successfully triggers the Vitality cap penalty.  
* **5.7 src/engine/rules/EssenceEconomyTracker.ts**  
  * **Objective:** Magic taxation and physics entropy.  
  * **Implementation:** Deduct 0 Essence if Attune DC \<= 14\. Deduct 1+ if DC \>= 15\. Link Sustained effects to the Combat Tracker turn progression for automatic deduction. Implement the Degradation Protocol: automatically roll 1d10 and subtract it from ongoing status effect DCs at the end of every round.  
  * **Verification Gate:** Spell with DC 13 costs 0 Essence; a Sustained portal successfully drains 1 Essence per round; a Freeze effect DC drops by a rolled 1d10 value autonomously.

## **STAGE 6: UI/UX & Dashboard Environment (UI\_DASHBOARD\_ENGINE)**

**Prerequisites:** All prior stages.

**Assigned Agent:** Frontend Architect Agent

* **6.1 src/engine/ui/DashboardOverlay.tsx**  
  * **Objective:** Canvas decoupling and input masking.  
  * **Implementation:** Render a React Portal taking up 100% of the viewport. Enforce pointer-events: none on the primary container, enabling map interaction through negative space. Apply pointer-events: auto strictly to the rendered widget bodies. Sync the UI's zoom/pan state with the WebGPU camera to keep contextual tooltips anchored to tokens.  
  * **Verification Gate:** Clicks pass through the empty overlay space directly into the PixiJS canvas interactions without highlighting invisible divs.  
* **6.2 src/engine/ui/layout/ResponsiveGridConfig.ts**  
  * **Objective:** Golden Layout framework and viewport scaling.  
  * **Implementation:** Configure react-grid-layout. Define breakpoints (lg, md, sm). Map layout props to Zustand. Manage Z-indexes aggressively to ensure active dragging panels always render above stationary docked panels.  
  * **Verification Gate:** Panels can be dragged, snapped, and resized without grid crashing or overflowing the viewport bounds.  
* **6.3 src/engine/ui/layout/FirestoreProfileSync.ts**  
  * **Objective:** Profile persistence and cross-device reconciliation.  
  * **Implementation:** Add onLayoutChange listener, debounce it aggressively (2000ms), serialize the layout object to JSON, and push to GCP /Users/{id}/Preferences/ui\_layout. Implement reconciliation logic: if a user loads their desktop layout on a mobile device, safely downgrade to the sm breakpoint layout without corrupting their desktop save data.  
  * **Verification Gate:** Refreshing the browser successfully re-fetches and applies the saved customized layout; simulating a mobile viewport loads the correct fallback.  
* **6.4 src/engine/ui/WidgetRegistry.ts**  
  * **Objective:** Standardize panels and enforce rendering boundaries.  
  * **Implementation:** Define interface IWidgetDefinition. Enforce strict min/max width boundaries for all dockable UI elements. Implement React Error Boundaries around every widget to ensure a crash in the Dice Tray doesn't take down the entire application UI. Lazy load heavy widgets (like the rulebook compendium) only when opened.  
  * **Verification Gate:** Attempting to resize the Combat Tracker below its minimum width constraint fails gracefully; a forced JS error inside a widget is caught and displays a fallback UI instead of a white screen.  
* **6.5 src/engine/ui/widgets/ContextActionBar.tsx**  
  * **Objective:** Context-aware macros mapped to active loadouts.  
  * **Implementation:** Listen to selectedToken array in Zustand. Dynamically render buttons (e.g., Mag-Rifle attack if token has it equipped). Read the item's modes array (e.g., Single, Burst) and render sub-menus. Utilize strict memoization to prevent re-rendering the entire bar when the token's HP changes.  
  * **Verification Gate:** Selecting token A shows bow macro; selecting token B shows spell macro; clicking the macro triggers the exact AST string configured for that weapon.  
* **6.6 src/engine/ui/widgets/CombatTrackerWidget.tsx**  
  * **Objective:** Initiative, state machine progression, and hooks.  
  * **Implementation:** Manage turn order via Yjs sorting. Emit "Turn Start" and "Turn End" events triggering the Essence Sustained Tax and Degradation protocol in the Rules Engine. Visually highlight the active token and automatically pan the WebGPU camera to center on them if they are off-screen.  
  * **Verification Gate:** Ending a turn fires a webhook event caught by the Rules Engine, successfully rolling the 1d10 degradation protocol for active effects.  
* **6.7 src/engine/ui/widgets/MechaFoundryWidget.tsx**  
  * **Objective:** Drag & drop CAD UI for vehicle management.  
  * **Implementation:** Map out Sockets/Mounts visually. Utilize HTML5 Drag and Drop API. Allow dragging weapon objects into visual slots. Provide visual feedback (red/green highlighting) during the hover state by querying MechaSocketManager validation *before* the drop occurs.  
  * **Verification Gate:** Dropping a weapon into a valid slot deducts capacity; attempting to drop an oversized weapon into a restricted slot highlights red and reverts the drag on release.

## **STAGE 7: AI Agent Ecosystem (DUAL\_AGENT\_AI\_ARCHITECTURE)**

**Prerequisites:** Firebase enabled, Vertex AI API enabled.

**Assigned Agent:** Backend Specialist Agent / AI Architect

* **7.1 src/engine/ai/VertexAIGateway.ts**  
  * **Objective:** Secure LLM Proxy and prompt sanitization.  
  * **Implementation:** Write a Firebase Cloud Function. Validate Firebase App Check token to prevent API abuse. Proxy the prompt to Gemini APIs, obscuring API keys from the client. Implement rate limiting and input sanitization to prevent prompt-injection attacks.  
  * **Verification Gate:** Unauthorized request without App Check token is rejected with HTTP 403; prompt injection attempt is caught and neutralized.  
* **7.2 src/engine/ai/agents/BastionAgent.ts**  
  * **Objective:** DBM Specialist and mathematical parser.  
  * **Implementation:** Utilize the Gemini "Structured Outputs" API to lock response to application/json conforming strictly to the Tangent schemas. Provide a strict system prompt forbidding narrative. Implement math validation middleware: if Bastion outputs a Mecha with 100 SP but a chassis that only supports 50, the middleware intercepts it and automatically forces a re-prompt for correction.  
  * **Verification Gate:** Agent successfully parses a messy OCR PDF of a weapon into the strict Weaponry JSON schema, and the math middleware successfully catches and corrects an artificial error.  
* **7.3 src/engine/ai/agents/AimeAgent.ts**  
  * **Objective:** Narrative partner and lore synthesis.  
  * **Implementation:** Load Story Foundry context. Manage context window limits by implementing a sliding window for chat history. Inject the persona via system instructions to focus on dialogue and atmosphere. Stream the response chunks back to the client for immediate UI feedback.  
  * **Verification Gate:** Prompt asking for an enemy generates thematic lore, dialogue, and defers all mechanical stat generation to Bastion.  
* **7.4 src/engine/ai/tools/DBMFunctionRegistry.ts**  
  * **Objective:** Inter-AI Tool Calling and orchestration.  
  * **Implementation:** Expose functionDeclarations to AIME so it can query BASTION for encounters. Define exact parameter typings (e.g., cr\_target, environment). Write the execution loop: Model requests tool \-\> Gateway executes query to Bastion \-\> Result returned to Aime \-\> Aime synthesizes final response.  
  * **Verification Gate:** AIME autonomously halts text generation, invokes query\_bastion\_for\_encounter, waits for the valid DBM IDs, and successfully completes the narrative response integrating the returned data.  
* **7.5 src/engine/ai/rag/VectorSearchClient.ts**  
  * **Objective:** Semantic rules grounding via RAG.  
  * **Implementation:** Utilize Gecko/Text-Embedding models to embed the Tangent Core Rulebooks. Store in Vertex Vector Search. When a user asks a mechanics question, perform a nearest-neighbor search, extract the top 3 relevant rule chunks, and inject them as system context into BASTION's prompt before generation.  
  * **Verification Gate:** Querying "How do I target a leg?" retrieves the specific "Called Shot" rules and BASTION answers accurately using the provided context rather than hallucinating generic RPG rules.  
* **7.6 src/engine/ai/vision/MapWallingProcessor.ts**  
  * **Objective:** Auto-walling via multi-modal analysis.  
  * **Implementation:** Send map WebP to Gemini Vision. Prompt explicitly for an array of bounding boxes and line segments identifying architectural walls. Normalize the returned 0.0-1.0 coordinates, scale them up to the active PixiJS canvas pixel dimensions, and pipe the output directly into BVHBuilder.ts.  
  * **Verification Gate:** Floorplan image returns a valid JSON array of coordinate lines that perfectly map to the visual walls on the VTT canvas.

## **STAGE 8: Migration & Ingestion Utilities (GCP\_BOOTSTRAP)**

**Prerequisites:** Raw Omnicortex data directories.

**Assigned Agent:** Backend Specialist Agent

* **8.1 tangentSchemaAdapters.js**  
  * **Objective:** Data sanitization and deep mapping.  
  * **Implementation:** Write normalizeOmnicortexItem() utilizing a schema validation library like Zod. Perform deep object mapping, stripping out legacy rich-text formats and converting string-based numbers to strict integers.  
  * **Verification Gate:** Payload with legacy tl key is successfully re-mapped to tech\_level, and a string "15" is correctly cast to integer 15\.  
* **8.2 categoryConfig.js**  
  * **Objective:** 7-Tier UI sorting enforcement.  
  * **Implementation:** Define getSortedCategoryFieldKeys array. Enforce this array as the master truth for how properties are ordered when rendered in the UI, ensuring backward compatibility fallbacks if a new field is introduced.  
  * **Verification Gate:** UI correctly sorts a complex item, placing name and tech\_level at the top, regardless of the order they appear in the raw JSON payload.  
* **8.3 migrate\_omnicortex\_schema.mjs**  
  * **Objective:** Bulk data update and Firestore transaction limits.  
  * **Implementation:** Node.js script. Read local JSON directories, apply adapters. Manage Firestore's hard limit of 500 writes per batch. Implement cursor pagination and exponential backoff retry logic to handle rate-limit errors gracefully. Log all failed migrations to an errors.log file.  
  * **Verification Gate:** Script processes 1,500 files, correctly splitting them into exactly four batched commits, writing all successful entries and logging one artificially corrupted file to the error log.  
* **8.4 task\_list.json & agy\_daemon\_config.yml**  
  * **Objective:** Antigravity configuration and IPC bridging.  
  * **Implementation:** Define DAG nodes. Enforce OS Power Assertions (SetThreadExecutionState on Windows, caffeinate on Mac) to prevent sleep during compiles. Configure the gRPC IPC bridge between the local daemon and the Python SDK for telemetry streaming. Define memory heap allocations for the isolated Docker workers.  
  * **Verification Gate:** Local daemon launches, connects via gRPC, successfully prevents OS sleep mode, and reports a stable memory allocation back to the orchestrator terminal.