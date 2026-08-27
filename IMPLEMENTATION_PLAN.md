# 🌌 Tangent SFF RP: Comprehensive 4-Pillar Master Implementation Plan & Progress Checklist
### *Complete RPG Game Engine, Pair Game Master (Co-GM), Real-Time Rules Assistant & Content Co-Creator*

---

## 🧭 Master Architecture & Progress Dashboard

```
+---------------------------------------------------------------------------------------------------------+
|                                TANGENT SFF RP 4-PILLAR ROADMAP (100% COMPLETE)                         |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [PILLAR 1: SIMULATION & COMBAT ENGINE]       [PILLAR 2: PAIR GAME MASTER / CO-GM]                      |
|  - [x] 1.1 Closed-Loop Combat Resolution       - [x] 2.1 Live Encounter Tension Gauge                   |
|  - [x] 1.2 Action Economy & Ammo/Essence       - [x] 2.2 Behavioral Adversary AI (Roles & Bosses)       |
|  - [x] 1.3 Starship & Vehicle Bridge           - [x] 2.3 1-Click Session Auto-Recap Synthesizer         |
|                                                                                                         |
|  [PILLAR 3: RULES ASSISTANT & ADJUDICATOR]    [PILLAR 4: CONTENT CO-CREATOR & FORGE]                    |
|  - [x] 3.1 Semantic Rulebook RAG (/askrule)   - [x] 4.1 1-Click UDU Facility Floorplan Generator       |
|  - [x] 3.2 Passive Perception & Secret Radar   - [x] 4.2 Economatrix Loot, Salvage & Cargo Drops        |
|  - [x] 3.3 Advancement & AP/Karma Ledger       - [x] 4.3 Faction Clocks & Living World Simulation       |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 📋 Comprehensive Checklist by Pillar & Stage

---

### 🛡️ PILLAR 1: Tactical Resolution & Simulation Engine (✅ Completed)

#### ✅ Stage 1.1: Tactical Combat Resolution Modal (`CombatResolutionModal.jsx`)
- [x] **Attacker & Target Selector**: Interactive dropdown connecting battlemap tokens and linked Folio characters.
- [x] **2d10 Dual-Resolution Attack Engine**: Rolls `2d10 + Skill + Attribute + Situational + Aim (+2) + Point Blank (+2)` with Advantage/Disadvantage.
- [x] **Critical Detection**: Double-10s (+30) Critical Triumph and Double-1s (-10) Critical Fumble.
- [x] **Dynamic Defense DC**: Incorporates Target Base Defense DC + Cover (None +0, Half +2, Full +4) + Evasive Stance (+2 / -2).
- [x] **Hit Location & Armor DR Soak**: Targeted Shot & Random d100 location determination (Head 1.5x Dmg, Torso, Left/Right Arm, Left/Right Leg) with location DR and Base Toughness (STA) soak.
- [x] **Canonical Damage Classification & Routing**:
  - [x] **🔵 Non-Lethal Damage (Vitality)**: Environmental stress, fatigue, subdual strikes, and mental exhaustion.
  - [x] **🔴 Lethal Damage (Health)**: Cuts, burns, bullet trauma, shrapnel, and penetrating wounds.
  - [x] **🤖 Synthetic Structure Immunity**: Synthetics use unified **Structure** and are **completely IMMUNE to non-lethal damage**.
  - [x] **Vitality Spillover**: Excess non-lethal exhaustion beyond remaining Vitality spills into Health (causing incapacitation).
  - [x] **Massive Damage**: Lethal damage to Health $\ge$ Stamina prompts instant DC 15 Fortitude Save vs. death.
  - [x] **Death Clock**: Health reduced to 0 initiates Stamina-round death countdown.
- [x] **Integration into `MapCombatTracker.jsx`**: Added `⚔️ Strike` header action and `⚔️ Atk` row buttons with synchronized floating battle text, Web Audio SFX, and CommLink broadcast.

#### ✅ Stage 1.2: Action Economy, Ammo & Essence Burn Tracker (`MapActionEconomyDrawer.jsx`)
- [x] **Turn Action Budget**: Tracks 1 Standard Action, 1 Move Action, 1 Reaction, and Free Actions per round with 1-click toggles and auto-reset.
- [x] **Ammo & Battery Depletion**: Real-time magazine count and battery charge deduction per single (-1 rd), burst (-3 rds), and auto-suppression (-6 rds) with reload actions and dry-fire alerts.
- [x] **Metaphysical Essence Burn**: Tracks Essence channeling points (-2 EP, -4 EP), Meditate restoration, and fatigue stages (Fresh, Fatigued -1, Exhausted -2, Overburn).
- [x] **Folio & Token Synchronization**: Live action indicators rendered on active token bases in VTT and integrated with `CombatResolutionModal`.

#### ✅ Stage 1.3: Vehicle & Starship Subsystem Combat Bridge (`StarshipBridgeModal.jsx`)
- [x] **Crew Station Assignments**: 4 active bridge stations:
  - [x] **Helm / Pilot**: Evasive Maneuvers (+2 Defense DC), Vector Boost (Double Pace), Intercept/Ramming vector.
  - [x] **Tactical / Gunner**: Spinal Battery Volleys (4d10+12 AP 8), Point-Defense Flak Intercept.
  - [x] **Engineering**: Power Unit (PU) routing (Shields +15 SP, Weapons +4 Dmg, Thruster Overcharge).
  - [x] **Science / EWAR**: Sensor Jammer ECM shroud (-2 enemy lock penalty), Cyber-Breach firewall hack.
- [x] **Targeted Subsystem Damage**: Interactive 6-node condition matrix (Bridge, Thrusters, Shields, Weapons, Reactor Core, Life Support) with Operational / Damaged / Destroyed degradation tiers.
- [x] **Mecha & Starship Archetypes**: Scale 2 Mecha Walkers, Scale 3 Corvettes, Scale 4 Destroyers.
- [x] **VTT Integration**: Dedicated `🚀 Bridge` header action in `MapCombatTracker` with floating text, SFX, and CommLink relay broadcasts.

---

### 🎭 PILLAR 2: Pair Game Master (Co-GM) & Encounter Director (✅ Completed)

#### ✅ Stage 2.1: Live Encounter Tension Gauge & Complication Engine (`EncounterTensionWidget.jsx`)
- [x] **Real-Time Tension Telemetry**: Dynamic 0–100% tension score computed from party health/vitality deficit, enemy count, round number, and critical conditions (Death's Door, Bleeding, Stunned).
- [x] **Dynamic Tension Tiers**: Routine Skirmish (0–35%), Active Engagement (35–60%), High Stakes (60–85%), and Catastrophic Climax (85–100%).
- [x] **1-Click Narrative Complications**: Injects Reinforcement Incursions, Environmental Hazards, Tactical Curveballs, Adversary Morale Breaks, Parley/Surrender offers, and Catastrophic Meltdowns directly into CommLink and on-screen floating text.
- [x] **Bastion Heuristic Tactical Advice**: Live advisory prompts providing pacing and tactical recommendations for the GM.

#### ✅ Stage 2.2: Adversary Behavioral AI Engine (`adversaryAiService.js`)
- [x] **Competency Role Routines**: Automated tactical moves for Minions (Swarm & Flank), Skirmishers (Fire & Fade), Bruisers (Close & Pin), Snipers (Aimed Headshot), and Commanders.
- [x] **Multi-Phase Boss Scripts**: Phase 1 (Tactical Focus Fire), Phase 2 (<65% HP: Kinetic Wards & Drop-Pod Escorts), and Phase 3 (<35% HP: Enraged AoE Meltdown Salvo).

#### ✅ Stage 2.3: Automated Session Logger & Chrono-Recap Synthesizer (`sessionRecapService.js` & `SessionRecapModal.jsx`)
- [x] **Live Event Logger**: Automatically logs strikes, criticals, stabilization, and complications into `SessionJournal`.
- [x] **1-Click Episodic Recap Generator**: Generates formatted Markdown recaps ("Previously on Tangent SFF...") with chapter headings, chronological milestones, and MVP metrics.
- [x] **Recap Modal Actions**: 1-click Copy Markdown, Download `.md` file, or direct broadcast to CommLink relay.

---

### ⚖️ PILLAR 3: Real-Time Rules Assistant & System Adjudicator (✅ Completed)

#### ✅ Stage 3.1: Semantic Rulebook Engine & `/askrule` RAG Index (`rulebookRagService.js` & `RulebookAssistantModal.jsx`)
- [x] **44-Rulebook Search Index**: Comprehensive semantic rule knowledge indexed across all 44 Operator & Architect rulebooks.
- [x] **Global `/askrule` Modal**: Instant lookup with cited rulebook names and page numbers (Combat, Damage Pools, Massive Damage, Cover DC, Essence Burn, Economatrix pricing $V=10\cdot 4^{DC/5}$, Starship Bridge).
- [x] **Rule Actions**: 1-click Copy Rule Text and direct Broadcast to CommLink chat relay.

#### ✅ Stage 3.2: Passive Perception & Secret GM Radar (`PassivePerceptionRadarModal.jsx`)
- [x] **Party Passive Radar**: Real-time summary of Physical Alertness, Metaphysical/Psionic Sense, Tech & Sensor Scan, and Social Insight/Empathy across all operatives.
- [x] **Hidden DC Auto-Detection**: Flags which operatives passively detect traps, ambushes, concealed doors, and deceit without metagaming dice rolls.

#### ✅ Stage 3.3: Automated Progression, Award Points (AP) & Karma Ledger (`ProgressionKarmaLedgerModal.jsx`)
- [x] **AP Allocation & Tier Status**: Tracks earned AP, available AP, spent AP, and Tiers (Novice $\rightarrow$ Expert $\rightarrow$ Master $\rightarrow$ Legend).
- [x] **Experience Debt Automation**: Automatically manages -5 AP debt repayment following death revivification.
- [x] **Batch Party Operations**: 1-click Batch Mission AP awards and full party Karma recharge.

---

### 🌌 PILLAR 4: Content Co-Creator & Procedural World Forge (✅ Completed)

#### ✅ Stage 4.1: 1-Click UDU Facility & Dungeon Floorplan Generator (`UduFacilityGeneratorModal.jsx`)
- [x] **Procedural Facility Generator**: Generates sci-fi facilities (Derelict Starship Hulks, Subterranean Cyber-Vaults, Bio-Lab Outposts, Black-Market Bazaars) using UDU Module footprints.
- [x] **Direct VTT Canvas Export**: Generates interactive rooms with bulkheads, security terminals, hazards (plasma conduits, gas leaks), and supply crates with 1-click broadcast.

#### ✅ Stage 4.2: Economatrix TSC Loot & Salvage Drop Generator (`EconomatrixLootGeneratorModal.jsx`)
- [x] **Encounter Salvage Generator**: Drops based on Threat Tier (Tier 1 Scavenger $\rightarrow$ Tier 5 Transcendent) and Tech Level (TL1–TL5).
- [x] **TSC Economic Valuation**: Calculates exact market credit value via $V = 10 \cdot 4^{\frac{\text{DC}}{5}}$ modified by planetary trade codes (Industrial, Agricultural, High-Tech, Barren).

#### ✅ Stage 4.3: Living World Faction Clocks & Agendas Engine (`FactionClocksModal.jsx`)
- [x] **Interactive Progress Clocks**: 4/6/8-tick clocks for rival megacorps, syndicates, and factions.
- [x] **"Advance Faction Turn"**: Background simulation of faction moves and market shifts between campaign sessions, triggering crisis alerts upon completion.

---

## 🧭 MASTER ROADMAP MATRIX & MULTI-TRACK PROGRESS

```
+-------------------------------------------------------------------------------------------------------------------+
|                                 TANGENT SFF RP MULTI-TRACK ROADMAP & STATUS DASHBOARD                              |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|  [PILLAR 1: COMBAT & SIMULATION ENGINE] (✅ 100%)       [PILLAR 2: PAIR GAME MASTER / CO-GM] (✅ 100%)              |
|  - [x] 1.1 Closed-Loop Dual-2d10 Combat Modal          - [x] 2.1 Live Tension Gauge & Complications               |
|  - [x] 1.2 Action Economy & Ammo/Essence Tracker       - [x] 2.2 Adversary Behavioral AI Roles & Bosses           |
|  - [x] 1.3 Starship & Subsystem Combat Bridge          - [x] 2.3 1-Click Chrono-Recap Synthesizer                 |
|                                                                                                                   |
|  [PILLAR 3: RULES ASSISTANT & RAG] (✅ 100%)            [PILLAR 4: CONTENT CO-CREATOR & FORGE] (✅ 100%)            |
|  - [x] 3.1 44-Rulebook Semantic RAG (/askrule)         - [x] 4.1 1-Click UDU Facility Generator                  |
|  - [x] 3.2 Passive Perception Party Radar              - [x] 4.2 Economatrix Loot, Salvage & Cargo Drops          |
|  - [x] 3.3 AP, Karma & Death Debt Ledger               - [x] 4.3 Faction Clocks & Living World Simulation         |
|                                                                                                                   |
|  [OPTION A: BATTLEMAP VTT CANVAS PLAY] (READY)         [OPTION B: SECURITY & PERFORMANCE] (READY)                 |
|  - [ ] A.1 Interactive Destructible Objects & Nodes    - [ ] B.1 Firestore Security Rules Catch-All Patch         |
|  - [ ] A.2 Hazmat Volume Visual Overlays & Ticks       - [ ] B.2 Serverless Proxy / Secure API Key Routing        |
|  - [ ] A.3 1-Click Autonomous Combat Turn Button       - [ ] B.3 Gemini 'systemInstruction' Protocol Migration    |
|  - [ ] A.4 Multi-Spectrum Sensor Vision Modes          - [ ] B.4 CampaignContext Debounced Auto-Save Cascade      |
|  - [ ] A.5 Scenario Objectives & Wave Spawn HUD        - [ ] B.5 DBM Route Lazy-Loading & Batch Chunking          |
|                                                                                                                   |
|  [OPTION C: AI VIRTUAL CO-GM & SOCIAL] (READY)         [OPTION D: ARCHITECTURE & SCHEMAS] (READY)                 |
|  - [ ] C.1 Live Combat Event Narration HUD             - [ ] D.1 Context Decomposition (Campaign & Folio)         |
|  - [ ] C.2 Dynamic Social Disposition & Negotiation    - [ ] D.2 Unified Cross-Module Schema Adapter              |
|  - [ ] C.3 Contextual Tactical Radio Chatter Barks     - [ ] D.3 Shared UI Component Library (Design Tokens)      |
|  - [ ] C.4 Compendium Grounded Interrogation Engine    - [ ] D.4 Discord Relay & Modular Expansion Packs (Void)   |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 📋 Comprehensive Checklists by Option & Track

---

### 🕹️ OPTION A: Battlemap VTT Canvas & Interactive Grid Play

#### 🚀 Stage A.1: Interactive Destructible Objects & Map Nodes (`interactiveObjectService.js`)
- [ ] **Canvas Object Node Rendering**:
  - [ ] Render interactive map nodes on the Konva layer (Blast Doors, Security Terminals, Explosive Canisters, Power Conduits).
  - [ ] Display overhead health bars and visual state transitions (Pristine $\rightarrow$ Damaged $\rightarrow$ Destroyed / Breached).
- [ ] **Interactive Context Modal (`InteractiveObjectModal.jsx`)**:
  - [ ] 1-Click Breach action (Athletics / Explosives check).
  - [ ] 1-Click Slice action (Tech hacking check vs. Security DC).
  - [ ] Blast door Open / Lock / Seal toggle with sound effect triggers.
- [ ] **Detonation & Chain Reaction Engine**:
  - [ ] Explosive canisters trigger automatic 3-hex radius 3d10 damage + condition tick on destruction.

#### ☢️ Stage A.2: Dynamic Hazmat Volumes & Environmental Overlays (`hazmatVolumeService.js`)
- [ ] **Canvas Polygon Hazard Overlay**:
  - [ ] Render translucent colored hazard polygons (Radiation: Yellow, Toxic Gas: Green, Vacuum Breach: Violet, Plasma: Orange).
  - [ ] Subtle pulsing animation for active danger sectors.
- [ ] **Hazard Manager Modal (`HazmatVolumeManagerModal.jsx`)**:
  - [ ] GM tool to draw custom hazard zones, assign Save DC, tick damage frequency, and applied condition.
- [ ] **Automated Turn-Start & Movement Trigger**:
  - [ ] Tokens entering or ending turns inside hazard volumes automatically prompt Fortitude/Stamina checks and apply conditions via `ConditionManagerModal`.

#### 🤖 Stage A.3: 1-Click Autonomous NPC Combat Turn Execution (`autoCombatResolver.js`)
- [ ] **Combat Tracker Integration (`MapCombatTracker.jsx`)**:
  - [ ] Add `🤖 Auto-Turn` action button on enemy combatant rows.
  - [ ] Evaluates tactical behavior profile (Swarm, Tactical, Guardian, Coward).
  - [ ] Automatically computes line-of-sight, cover, optimal weapon action, and resolves 2d10 attack roll.
  - [ ] Deducts ammo / battery charges and applies damage / conditions to target with floating combat text.

#### 👁️ Stage A.4: Multi-Spectrum Sensor Vision Modes (`sensorVisionService.js`)
- [ ] **HUD Sensor Mode Selector**:
  - [ ] Standard Optical, Night Vision, Thermal / Infrared, Cyber Radar, and Meta-Attunement.
- [ ] **Dynamic Token & Fog-of-War Filtering**:
  - [ ] Thermal reveals biological tokens behind light barriers.
  - [ ] Cyber Radar detects mechanical and armored units through walls within 12 hexes.
  - [ ] Meta-Attunement highlights psionic / essence anomalies.

#### 🏁 Stage A.5: Scenario Objective HUD & Wave Spawn Triggers (`scenarioEngineService.js`)
- [ ] **Scenario Objectives HUD Bar**:
  - [ ] Displays live mission goals (Extraction, Assassination, Holdout Defense, Data Retrieval) and completion progress.
- [ ] **Automated Reinforcement Incursions**:
  - [ ] Spawns reinforcement tokens at designated drop zones when round thresholds or alarms trigger.

---

### 🛡️ OPTION B: Security, Authentication & Performance Hardening

#### 🔒 Stage B.1: Firestore Security Rules Catch-All Patch (`firestore.rules`)
- [ ] **Collection-Specific Ownership Rules**:
  - [ ] Add explicit read/write rules for `story_elements/{docId}` and `story_maps/{docId}` requiring user authentication and owner verification.
- [ ] **Strict Deny-All Default**:
  - [ ] Replace permissive wildcard catch-all with a secure fallback that blocks unauthorized access to unlisted collections.

#### 🔑 Stage B.2: Serverless Proxy / Secure API Key Architecture
- [ ] **Eliminate URL Query Param API Keys**:
  - [ ] Route Gemini API calls through Firebase Cloud Functions or secure backend endpoint, removing exposed keys from client network traffic.
- [ ] **Environment Variable Hardening**:
  - [ ] Verify production client builds do not leak sensitive service credentials.

#### 🤖 Stage B.3: Gemini `systemInstruction` Protocol Migration (`bastionService.js`, `aimeService.js`)
- [ ] **Top-Level `systemInstruction` Migration**:
  - [ ] Move system prompts out of the user prompt string into the native Gemini API `systemInstruction` field.
- [ ] **Context Window Sliding History**:
  - [ ] Implement token-budget sliding window (keep last 20 messages + summary) to prevent context overflow.
- [ ] **API Rate Limiting & Exponential Backoff**:
  - [ ] Throttling queue with automatic backoff retry on HTTP 429 status.

#### ⚡ Stage B.4: CampaignContext Debounced Auto-Save & Throttling (`CampaignContext.jsx`)
- [ ] **Auto-Save Cascade Elimination**:
  - [ ] Route continuous state updates through the 1.5s debounced save trigger instead of writing to 3 documents and running batch writes on every keystroke.
- [ ] **Chunked Batch Writes**:
  - [ ] Chunk `saveAllElementsIndependently` into 450-operation batches to protect against Firestore's 500-operation limit.

#### 🗄️ Stage B.5: DBM Route Lazy-Loading & State Rollback Fix (`DBMContext.jsx`)
- [ ] **Lazy Collection Subscriptions**:
  - [ ] Activate the 40+ Firestore collection listeners only when navigating to `/dbm` rather than globally at app root.
- [ ] **Stale Closure Rollback Fix**:
  - [ ] Replace closure snapshot with `useRef` for reliable rollback on save failure.

---

### 🧠 OPTION C: AI Virtual Co-GM, Social Agents & Narrative Director

#### 🎙️ Stage C.1: Live Combat Event Narration HUD (`AimeNarrationHud.jsx` & `aimeDirectorService.js`)
- [ ] **Live Telemetry Event Listener**:
  - [ ] Monitors Combat Tracker events (Critical Triumphs, Fumbles, Massive Damage, Terminal Hacks, Token Deaths).
- [ ] **Atmospheric Narrative Synthesis**:
  - [ ] Generates 1–2 sentence cyber-noir / space-opera flavor text broadcast directly to a floating HUD banner and CommLink.
- [ ] **Dynamic Tension Audio Transitions**:
  - [ ] Dynamically shifts background synthesizer tension based on encounter threat score.

#### 🤝 Stage C.2: Dynamic NPC Social Disposition & Negotiation Matrix (`npcSocialEngine.js`)
- [ ] **Dynamic Disposition Meter**:
  - [ ] Real-time 0–100% meter (Hostile $\rightarrow$ Suspicious $\rightarrow$ Neutral $\rightarrow$ Cooperative).
- [ ] **Interactive Negotiation Checks**:
  - [ ] Intimidation check (rapid disposition shift vs. panic / hostility risk).
  - [ ] Persuasion / Parley check (gradual trust building through common ground).
  - [ ] Economatrix Bribery (credits / cargo trade for passage or codes).
- [ ] **Automated Combat State Alterations**:
  - [ ] High disposition unlocks mid-combat surrender, truce, or faction defection.

#### 📻 Stage C.3: Contextual In-Character Radio Battle Barks (`tacticalBarksService.js`)
- [ ] **Contextual Radio Chatter**:
  - [ ] NPCs emit authentic faction barks into CommLink ("Hostile acquired!", "Heavy suppression!", "Command is down!").
- [ ] **Waveform Audio Effect**:
  - [ ] Visual audio waveform indicator in CommLink chat for incoming radio relays.

#### 🔍 Stage C.4: Compendium-Grounded Interrogation Engine (`NpcInterrogationModal.jsx`)
- [ ] **Interactive Interrogation Console**:
  - [ ] Chat interface with captured NPCs grounded in Omnicortex faction lore.
  - [ ] Social check rolls reveal verified intel, access codes, or deceptive red herrings based on roll margin.

---

### 🏗️ OPTION D: Architecture Modernization, Data Schemas & Modular Expansions

#### 🧩 Stage D.1: Monolithic Context Decomposition
- [ ] **Split `CampaignContext.jsx` (1,500 lines)**:
  - [ ] `StoryCatalogContext`: Catalog browsing and scenario CRUD.
  - [ ] `UniverseStateContext`: Active project and scenario state.
  - [ ] `MapContext`: Tactical map state and token management.
- [ ] **Split `FolioContext.jsx` (1,170 lines)**:
  - [ ] `RosterContext`: Character roster and active selection.
  - [ ] `CharacterStatsContext`: CP economy and derived stat calculations.

#### 🔄 Stage D.2: Canonical Cross-Module Schema Adapter (`sharedSchemas.js`)
- [ ] **Schema Harmonization**:
  - [ ] Reconcile field naming differences (`char-name` vs `name`, relational species links).
  - [ ] Bidirectional adapters converting between DBM items, Story Foundry elements, and Folio characters.

#### 🎨 Stage D.3: Shared UI Component Library & Design Tokens
- [ ] **Reusable UI Primitives (`src/components/UI/`)**:
  - [ ] `Button.jsx`, `Modal.jsx`, `Input.jsx`, `Select.jsx`, `Badge.jsx`, `Toast.jsx`.
- [ ] **Design Token Unification**:
  - [ ] Consolidate `:root` custom properties and Tailwind tokens in `design-tokens.css`.
  - [ ] WCAG AA color contrast updates for `--text-muted` and full ARIA keyboard navigation.

#### 🌌 Stage D.4: Modular Expansion Packs (*Void Crash*) & Discord Webhook Relay
- [ ] **Expansion Pack Ingestion Pipeline**:
  - [ ] Support loading standalone expansion datasets (*e.g., Void Crash*) without schema conflicts.
- [ ] **Discord Webhook Bot Relay**:
  - [ ] Bidirectional relay transmitting rolls, session recaps, and CommLink transmissions to Discord channels.

