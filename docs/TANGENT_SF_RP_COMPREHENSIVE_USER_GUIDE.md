# 🌌 Tangent Science Fantasy Roleplay (TANGENT SFF RP)
## Comprehensive System User Guide & Technical Manual (v2.1)

---

## 🧭 System Overview & Architecture

**Tangent Science Fantasy Roleplay (TANGENT SFF RP)** is an integrated, cyberpunk/space-opera Virtual Tabletop (VTT), character management suite, rules compendium, and narrative worldbuilding engine.

Built with **React 18, Vite, Tailwind CSS, Google Firebase (Firestore + Authentication), and Web Audio API**, Tangent SFF RP delivers an offline-first, high-performance tactical environment for game masters (Architects) and players (Operators).

```mermaid
graph TD
    HUB["⚡ Operations Hub (/)"] --> FOLIO["📜 Persona Folio (/folio)"]
    HUB --> DBM["🧠 Omnicortex DBM (/dbm)"]
    HUB --> CODEX["🔮 Codex & Economatrix (/codex)"]
    HUB --> FOUNDRY["🛠️ Story Foundry (/foundry)"]
    HUB --> COMMS["📡 CommLink Relay (/comms)"]

    FOUNDRY --> WEAVER["📖 Story Weaver Scenario Tree"]
    FOUNDRY --> MAPS["🗺️ Tactical Map Maker & VTT"]
    FOUNDRY --> AIME["✨ AIME Creative Suite"]
    FOUNDRY --> FORGE["🧩 Element Forge Lore DB"]

    CODEX --> INGEST["📥 Codex Ingestion Engine"]
    CODEX --> SCALING["📐 Scaling Codex & Multipliers"]
    CODEX --> PROMPTS["🤖 Prompt Registry & AI System"]

    subgraph GLOBAL ["Global App Shell (Available Across All Views)"]
        HUD["🛰️ Persistent HUD (56px)"]
        PALETTE["⌨️ Spotlight Command Palette (Ctrl+K)"]
        DICE["🎲 Polyhedral Dice Roller Dock (Alt+D)"]
        AUDIO["🔊 Procedural Web Audio API SFX"]
        STORAGE["💾 IndexedDB Offline Cache + Firestore Sync"]
    end
```

---

## 📑 Table of Contents

1. [Chapter 1: Operations Hub & Global HUD Ergonomics](#chapter-1-operations-hub--global-hud-ergonomics)
2. [Chapter 2: Persona Folio & Character Architecture](#chapter-2-persona-folio--character-architecture)
3. [Chapter 3: Omnicortex DBM Compendium & Catalog Architecture](#chapter-3-omnicortex-dbm-compendium--catalog-architecture)
4. [Chapter 4: Codex Matrix Suite, Economatrix & Ingestion](#chapter-4-codex-matrix-suite-economatrix--ingestion)
5. [Chapter 5: Story Foundry & Story Weaver Scenario Engine](#chapter-5-story-foundry--story-weaver-scenario-engine)
6. [Chapter 6: Tactical Map Maker & Virtual Tabletop (VTT)](#chapter-6-tactical-map-maker--virtual-tabletop-vtt)
7. [Chapter 7: AIME Creative Suite & Element Forge Lore Architect](#chapter-7-aime-creative-suite--element-forge-lore-architect)
8. [Chapter 8: CommLink Quantum Relay & In-Chat Rolls](#chapter-8-commlink-quantum-relay--in-chat-rolls)
9. [Chapter 9: Polyhedral Dice Engine, Hotkeys & System Tools](#chapter-9-polyhedral-dice-engine-hotkeys--system-tools)
10. [Chapter 10: Tangent Dual Resolution Mechanics & Combat Reference](#chapter-10-tangent-dual-resolution-mechanics--combat-reference)
11. [Chapter 11: Locomotion, Rest, Survival & Advancement Systems](#chapter-11-locomotion-rest-survival--advancement-systems)

---

## Chapter 1: Operations Hub & Global HUD Ergonomics

The **Command Operations Hub (`/`)** is the primary mission dashboard and nerve center of Tangent SFF RP.

### 1.1 Core Telemetry & Widgets
- **Active Campaign Tracker (`CampaignOpsWidget`)**: Displays current campaign title, active scenario count, linked sector maps, and quick navigation into Story Foundry.
- **Game Squads & Multiplayer (`GameSquadsWidget`)**: Manages multiplayer game squads, active member rosters, and one-click invite join codes (`?join=GRP-XXXXXX`).
- **Party at a Glance (`PartyStatusWidget`)**: Renders characters loaded from your active Persona Folio roster with live Health and Vitality bars, species lineage badges, Tech Levels, and Build Point (BP/CP) legality status.
- **CommCenter & Transmission Feed (`CommCenterWidget`)**: Live stream of Quantum Relay broadcasts, private operative comms, and dice check rolls with direct reply capabilities.
- **Interactive Preview Drawers (`LandingDrawerArea`)**: Clicking module cards dynamically unfolds operative sheets, scenario trees, map libraries, or lore elements directly on the dashboard without route transitions.

### 1.2 Persistent Global HUD Ergonomics
The 56px top HUD persists across all routes, providing instant access to mission-critical utilities:
- **Spotlight Omni-Search (`Ctrl+K` / `Cmd+K`)**: Global search index over heroes, species, weapons, scenarios, lore items, and `/roll` commands.
- **Dice Roller Dock (`Alt+D`)**: Floating polyhedral dice dock with one-click polyhedrals (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`), custom expression input, advantage/disadvantage toggles, and channel broadcast.
- **CommLink Quick Dock (`Alt+C`)**: Slides out the live transmission stream for fast in-game banter without leaving your tactical map.
- **Procedural Web Audio API**: Zero-external-dependency audio synthesizer generating tactile clicks, terminal chirps, dice rolls, and dramatic critical fanfare.

---

## Chapter 2: Persona Folio & Character Architecture

The **Persona Folio (`/folio`)** is the official digital operative sheet manager and character generation suite.

### 2.1 The 150 Build Point (BP / CP) Economy
Characters in Tangent SFF RP are created using a strict **150 Build Point (BP)** budget:
- **Starting Budget**: 150 BP (customizable by the Architect for high-powered campaigns).
- **Legality Enforcement**: When expenditures exceed available points, the header flashes an **ILLEGAL BUILD** warning. Clicking the point meter opens a complete line-item ledger.
- **Point Allocations**:
  - **Ability Scores**: 5 BP per +1 attribute bonus.
  - **Attribute Check Bonuses**: 1 BP per +1 check score.
  - **Skills & Specializations**: Purchase additional skill ranks beyond background packages.
  - **Features & Augmentations**: Special perks, biological modifications, and cyberware.
  - **Hindrances & Flaws**: Select character flaws to receive point rebates back into your pool.

### 2.2 The Three 20-Point Background Skill Pools
In addition to the 150 BP starting budget, every character receives **three dedicated 20-point Skill Pools** during creation:
1. **Faction Skill Pool (20 SP)**: Ranks allocated strictly among proficiencies granted by the character's primary faction allegiance.
2. **Origin Skill Pool (20 SP)**: Ranks granted by the character's homeworld, habitat, or environmental upbringing.
3. **Occupation Skill Pool (20 SP)**: Ranks defining the operative's career training, professional trade, or tactical specialty.

### 2.3 The 7 Folio Tabs
- **1. Identity Tab**: Operative name, biological species selection (with automated trait modifiers), origin archetype, background occupation, physical metrics, portrait URL, and cybernetic augmentation slots.
- **2. Core Stats & Vitals**: The 6 core attributes (STR, AGI, STA, INT, WIS, CHA) and their linked sub-attributes (Might, Reflex, Fortitude, Reason, Willpower, Etiquette). Automatically derives:
  - **Health Pool**: Structural integrity (`30 + Fortitude`).
  - **Vitality Pool**: Stamina, poise, and energy buffer (`30 + Willpower`).
  - **Base Toughness**: Stamina score (direct damage soak).
  - **Defense Value**: Reaction and armor evasion threshold.
  - **Carry Capacity**: STR-based encumbrance thresholds.
- **3. Skills & Specializations**: Master skill matrix categorized across Combat, Technical, Social, Psionic, and Scientific domains with Novice, Expert, Master, and Legend rank tiers.
- **4. Abilities, Features & Flaws**: Positive feats, racial gifts, meta-tech powers, psychic invocations, and hindrance flaws with CP tracking.
- **5. Combat Loadout & Inventory**: Weaponry (strike bonus, damage dice, rate of fire, range, AP), armor suits (coverage zones, DR rating), and equipment tracking.
- **6. 31-Field Narrative Story Writer**: Four structured narrative categories (**Biography, Psychology, Factions, Logistics**) with **🤖 Bastion AI** auto-drafting to flesh out deep character backstories.
- **7. Notes & Property**: Starship shares, contacts, safehouses, and field mission logs.

### 2.4 Guided Creator Wizard & Persona Bridge
- **Guided Creator (`GuidedCreatorModal`)**: An 8-step wizard walking new players through Concept, Species, Origin, Faction, Occupation, Attributes, Skills, and Gear.
- **Persona Bridge (`personaBridge.js`)**: Real-time synchronization layer ensuring changes to character stats immediately propagate to the Tactical Map Maker tokens and CommLink chat identity.

---

## Chapter 3: Omnicortex DBM Compendium & Catalog Architecture

The **Omnicortex DBM (`/dbm`)** is the relational database and rules compendium of Tangent SFF RP.

### 3.1 Architectural Subdomains
The Omnicortex catalog is organized into specialized architectural domains:
- **Architecture**: Facility scales, modular room blueprints, defense stations, and power grids.
- **Armoring**: Personal armor, hazard suits, energy shielding, coverage zones, and damage reduction (DR).
- **Augmentations**: Cyberware, bioware, neural coprocessors, sensory shunts, and essence costs.
- **Mecha & Vehicles**: Combat walkers, grav-tanks, speeders, starfighters, frame weight classes, and hardpoint mounts.
- **Weaponry**: Melee weapons, slugthrowers, lasers, plasma arms, heavy artillery, and exotic beam casters.
- **Gear & Tools**: Field equipment, medical kits, scanners, communication nodes, and utility harnesses.
- **Invocations**: Metaphysical disciplines (Dimension, Energy, Entropy, Illusion, Matter, Mental) and manifestation parameters.
- **Occupations & Origins**: Complete career paths and homeworld cultural packages.
- **Species & Lineages**: Canonical biological profiles, synthetic frames, awakened creatures, and alien taxonomies.
- **Traits & Disadvantages**: Granular species trait catalog (Basic, Advanced, Elite, Bodyforms) and disadvantage point rebates.
- **Compendium Volumes**: Complete operator and architect rulebook texts.

### 3.2 Operating Modes & Data Pipelines
- **Game Mode (Read-Only)**: Streamlined, high-contrast interface designed for lightning-fast search during live gameplay without risk of accidental data modification.
- **Architect Dev Mode**: Unlocks in-place schema editing, item creation, field modification, and balance overrides.
- **Automated Sync Scripts**: Node.js maintenance scripts (`syncOmnicortexSpecies.mjs`, `syncOmnicortexEquipment.mjs`, `syncOmnicortexFeatures.mjs`) synchronizing local markdown files with Firestore collections in 450-operation batches to avoid quota bottlenecks.

---

## Chapter 4: Codex Matrix Suite, Economatrix & Ingestion

The **Codex (`/codex`)** provides 14 engineering calculators, economic simulation models, and automated data ingestion.

### 4.1 Engineering Matrices & Builders
1. **Species Forge Engine (`calculateSpeciesBP`)**: Live species creator with budget tracking (Standard 0 BP, Advanced 10 BP, Monster 20+ BP), size sizing modifiers, movement modes, and trait calculators.
2. **Architecture Blueprint Configurator**: Facility budgets, defense turrets, atmospheric life support, and structural Integrity.
3. **Armor Coverage Matrix**: Detailed hit-location coverage (Head, Torso, Arms, Legs), hardness ratings, and weight penalties.
4. **Augmentation Nodes Matrix**: Hardware capacity, socket limits, neural strain, and essence thresholds.
5. **Companion Package Builder**: Drones, synthetic companions, cyber-hounds, and combat beasts with form/function modules.
6. **Invocation Matrix**: DC calculation, essence channeling costs, area-of-effect templates, and spell duration multipliers.
7. **Mecha Chassis Builder**: Weight classes (Light Skimmer to Super-Heavy Titan), hardpoint weapon bays, and armor layering.
8. **Meta-Tech Imbuement**: Artifact crafting formulas, metamaterial bonding, and supernatural enhancement sockets.
9. **Modular Stat Blocks**: Threat Tier 1–10 automated NPC and creature generator with role templates (Striker, Tank, Controller, Elite Boss).
10. **Planetary Design Matrix**: World generation including gravity, biomes, atmospheric toxicity, tech capacity, and trade routes.
11. **UDU Capacity Meter**: Unified Difficulty Units measuring adventure hazard levels and party survival expectations.
12. **Weapon Mod Stacker**: Modular rail attachments, barrel extensions, energy coils, and balance adjustments.

### 4.2 Unified Scaling Codex (`ScalingCodex.jsx`)
Provides real-time damage, armor DR, and structural conversion across 8 scale tiers:
`Personal (1x) → Heavy Exo (2x) → Light Vehicle (5x) → Medium Mecha (10x) → Heavy MBT (20x) → Super Heavy Mech (50x) → Capital Starship (100x) → Planetary (1000x)`.

### 4.3 Multi-Dataset Codex Ingestion Engine & Prompt Registry
- **Codex Ingestion Engine (`CodexIngestionEngine.jsx`)**: Tool for importing and consolidating external markdown matrices, rules volumes, and JSON datasets directly into active game memory and Firestore.
- **Prompt Registry (`codexPromptRegistry.js`)**: Standardized system prompts for AI Architect generation, scenario drafting, and procedural NPC dialogue.

---

## Chapter 5: Story Foundry & Story Weaver Scenario Engine

The **Story Foundry (`/foundry`)** is an integrated narrative suite for campaign management, scene planning, and lore authoring.

### 5.1 Hierarchical Scenario Tree Editor
- **Tree Structure**: Organize campaigns into Acts, Chapters, Scenes, and Encounters with drag-and-drop hierarchy restructuring.
- **8 Element Types**: Characters, Locations, Factions, Relics, Events, Lore Docs, Session Prep, and Custom Schema.
- **Bi-Directional Relational Links**: Link NPC cards directly to location nodes and factions with live relational badges.
- **Destructive Deletion Safeguards**: Requires typing the exact element name to confirm deletion of critical plot nodes.

### 5.2 Conflict Resolution & Cloud Sync
- **Debounced Firestore Writes**: 1.5-second debouncing prevents Firestore quota exhaustion during rapid typing.
- **Sync Conflict Modal**: Identifies divergence between local IndexedDB timestamps and remote cloud data, offering side-by-side branch comparison or merging.
- **Multi-Format Export**: Export your complete campaign or isolated chapters to Markdown (`.md`), HTML, PDF, or JSON.

---

## Chapter 6: Tactical Map Maker & Virtual Tabletop (VTT)

The **Tactical Map Maker (`/foundry/map-maker`)** is a hardware-accelerated battlemap canvas powered by React Konva.

### 6.1 Battlemap Canvas & Grids
- **Multi-Grid Canvas**: Switch seamlessly between Square (5ft / 1.5m), Pointy-Topped Hex, Flat-Topped Hex, and Isometric grid modes with customizable grid opacity and snap-to-grid movement.
- **Biome Painting**: Textured brushes for sci-fi arcology decking, volcanic rock, sand wastelands, toxic waterways, and neon streets.
- **Fog of War**: Paintable reveal/hide masks allowing the GM to uncover dungeon chambers as characters explore.

### 6.2 Token Drawer, Status Gems & Floating Combat Text
- **Folio Hero Token Drawer (`FolioHeroTokenDrawer`)**: Slides out the active party roster. Drag and drop operative tokens directly onto the tactical map with live Health/Vitality rings.
- **Status Gems Modal (`StatusGemsModal`)**: Assign visual condition gems (Stunned, Bleeding, Burning, Concealed, Prone, Exhausted) directly to token bases.
- **Floating Combat Text (`FloatingCombatText`)**: Displays real-time animated scrolling text for damage taken, armor deflected, health healed, and critical strikes.
- **Player Spectator View (`/spectator/:mapId`)**: Clean, secondary-monitor projection route stripping GM hidden layers, private tokens, and secret notes for player viewing.

---

## Chapter 7: AIME Creative Suite & Element Forge Lore Architect

The **AIME Creative Suite (`/foundry/aime`)** (Artificial Intellect Master Entity) and **Element Forge (`/foundry/elements`)** provide narrative prose writing and structured worldbuilding databases.

### 7.1 The 3-Stage AIME Manuscript Engine
1. **Stage 1 — Brainstorm**: Synthesize active campaign lore elements and creative Guidance Gems to brainstorm scene premises and unexpected twists.
2. **Stage 2 — Outline**: Formulate narrative beats, pacing ladders, and dramatic turning points.
3. **Stage 3 — Draft & Floating Toolbar**: Full-featured prose editor equipped with floating AI tools: *Expand, Rephrase, Tighten, Polish,* and *Shift Tone*.

### 7.2 Element Forge & Draggable Co-Pilot
- **Element Forge**: Schema-backed database for creating rich world encyclopedias (Planets, Megacorps, Ancient Relics, Biological Anomalies).
- **Draggable AIME Co-Pilot**: Persistent floating chat assistant accessible across the entire Foundry suite, providing instant Bastion AI rules lookup and verified `/roll` execution.

---

## Chapter 8: CommLink Quantum Relay & In-Chat Rolls

The **CommLink Relay (`/comms`)** provides real-time encrypted communications and dispatch operations.

### 8.1 Channels & Direct Comms
- **Public & Faction Frequencies**: Open planetary Holonet channels, localized squad channels, and encrypted corporate bands.
- **Direct Operative Frequencies**: Private 1-on-1 comm channels between operatives or between a player and the GM for covert rolls and secret instructions.
- **In-Chat Dice Rolls**: Type `/roll 2d10+4` or `/roll d20+6` directly into chat to broadcast verified, cryptographically seeded rolls to the squad.

---

## Chapter 9: Polyhedral Dice Engine, Hotkeys & System Tools

### 9.1 Global Keyboard Shortcuts
| Keybinding | Action Description | Scope |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Toggle Spotlight Omni-Search & Command Palette | Global |
| `Alt + D` | Toggle Floating Polyhedral Dice Roller Dock | Global |
| `Alt + C` | Toggle CommLink Quick Chat Dock | Global |
| `Esc` | Close any active modal, drawer, or palette | Global |

### 9.2 Dice Formula Parsing & Evaluation
- Standard notation: `XdY + Z` (e.g. `2d10+5`, `1d20+3`, `4d6-2`).
- Advantage / Disadvantage: Rolls twice and automatically takes the higher or lower total.
- In-memory roll history with reroll and copy-result actions.

---

## Chapter 10: Tangent Dual Resolution Mechanics & Combat Reference

Tangent SFF RP utilizes a **Dual Resolution Architecture**:
1. **Trained Skills**: `2d10 + Attribute Modifier + Skill Rank vs Target Number (TN)`.
2. **Attribute Checks & Saving Throws**: `d20 + Base Check Score + Modifiers vs Challenge Rating (CR)`.

### 10.1 Trained Skills Resolution & Target Numbers (TN)
```
Skill Roll = 2d10 + Linked Attribute + Skill Rank + Situational Mods
```
- **TN 10 (Routine / Simple)**: Tasks achievable under minor pressure.
- **TN 15 (Challenging / Trained)**: Standard combat-stress actions and technical repairs.
- **TN 20 (Formidable / Expert)**: Actions requiring elite training or high-tier equipment.
- **TN 25+ (Heroic / Legendary)**: Universe-altering feats of mastery.

#### Numeric Criticals on 2d10
- **Critical Success (Double 10s)**: Rolled value becomes **30** (`Total = 30 + Modifiers`), guaranteeing an extraordinary triumph and maximum margin of success.
- **Critical Fumble (Double 1s)**: Rolled value becomes **-10** (`Total = -10 + Modifiers`), resulting in catastrophic misfire, weapon jam, or severe hazard.

### 10.2 Core Attributes & Attribute Checks
```
Base Check Score = 2 + (Attribute Score × 2)
Check Roll = d20 + Base Check Score + Situational Modifiers
```
| Attribute | Linked Check | Primary Application |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Heavy lifting, door breaching, grappling, melee force |
| **Agility (AGI)** | **Reflex Check** | Dodging explosions, evasion, acrobatic balance, initiative |
| **Stamina (STA)** | **Fortitude Check** | Resisting neurotoxins, disease, vacuum exposure, wound shock |
| **Intellect (INT)** | **Reason Check** | Pure logic, cipher cracking, technical deduction, computation |
| **Wisdom (WIS)** | **Willpower Check** | Resisting psionic domination, fear, emotional composure |
| **Charisma (CHA)** | **Etiquette Check** | Social diplomacy, bartering, persuasion, de-escalation |

> [!NOTE]
> **Attribute Checks vs Saving Throws**: General Checks are proactive actions not covered by a specialized skill. Saving Throws are reactive defenses against environmental hazards or attacks. Relevant skills provide synergy bonuses to saves (e.g. Medicine aids Fortitude vs poison; Athletics aids Reflex vs falls).

### 10.3 Perception Sub-Ability & Detection Checks
**Base Perception** is derived from a character's mental acuity:
```
Base Perception = Intellect + Wisdom
```
- **Alertness Check** (`Perception + Alertness`): Spotting visual/auditory cues, noticing hidden traps, concealed doors, detecting ambushes.
- **Meta Perception** (`Perception + Attune`): Sensing magic, psychic powers, planar energies, and Metafocus aura signatures.
- **Social Perception** (`Perception + Insight`): Reading micro-expressions, vocal shifts, deceit detection, and assessing emotional motives.
- **Technical Perception** (`Perception + Technology`): Interpreting electronic sensors, locating hardware vulnerabilities, and detecting electronic counter-measures.

### 10.4 Vitality, Health, Toughness & Damage Resolution
- **Vitality Pool (`30 + Willpower`)**: Stamina, luck, deflection, and minor scrapes. Absorbs incoming damage first.
- **Health Pool (`30 + Fortitude`)**: Deep physical trauma, organ integrity, and cellular vitality. Depleted only when Vitality reaches 0, or directly via Critical Hits and armor-piercing effects.
- **Base Toughness (`Stamina Score`)**: Inherent physiological damage soak deducted from physical impacts.
- **Concussive Damage Split**: Blunt force and blast shock divide incoming damage between Vitality and Health pools based on impact energy.
- **Armor Damage Reduction (DR)**: Absorbs damage prior to pool subtraction based on hit location coverage.

### 10.5 Death Clock, Massive Damage & Revivification
- **The Death Clock**: When a character's Health reaches **0**, they fall unconscious and initiate their **Death Clock**, equal to their **Stamina score in rounds** (minimum 1 round).
- **Advancing the Clock**: Each combat round that passes without medical stabilization ticks down the Death Clock by 1. If the clock reaches 0, the character suffers clinical death.
- **Massive Damage**: If a character takes damage in a single strike equal to or exceeding their Stamina score directly to Health, they must immediately pass a DC 15 Fortitude check or instantly die.
- **Stabilization**: A successful **Medicine (DC 15)** check, trauma kit application, or medical nano-injector immediately stops the Death Clock.
- **Revivification ("The High Cost of Dying")**: Returning from clinical death requires TL5 medical tech or rare metaphysical invocations. Revived operatives suffer severe trauma:
  1. **Forfeit all remaining Karma Points**.
  2. Incur a permanent **-5 Experience Debt**, which must be paid off 1-for-1 with future Award Points (AP) or an immediate trait score reduction.

---

## Chapter 11: Locomotion, Rest, Survival & Advancement Systems

### 11.1 Movement Rules & Tactical Paces
Characters traverse battlefields and planetary sectors across standardized movement paces based on their **Base Movement Speed (typically 30 ft / 6 sq)**:
- **Walk (1x Speed)**: Standard tactical maneuver; allows performing a standard action without penalty.
- **Hustle (2x Speed)**: Double-time movement; consumes standard action.
- **Run (3x Speed)**: Fast sprint; imposes a -2 penalty to passive perception checks.
- **Sprint (4x Speed)**: Maximum physical exertion in a straight line; imposes a -4 penalty to defense and requires fatigue checks over extended duration.

#### Locomotion Modes
- **Bipedal / Quadruped**: Standard ground locomotion.
- **Climbing**: Base Climbing (1/2 speed), Scaling (2x speed, DC 15 Athletics), Fast Ascent (3x speed, DC 18 Athletics), Fast Descent (6x speed, DC 20 Athletics).
- **Aerial Flight**:
  - **Hover / Controlled Descent**: Half speed or less; requires DC 15 Acrobatics check to maintain altitude.
  - **Sail & Soar**: High-speed gliding using thermal currents; grants the **High Ground (+2 Strike / +2 Crit)** combat bonus.
  - **Dive & Ramming**: High-speed impact causing `+1d` damage per flight stage and `+1 impact damage per 10 ft of speed` to both attacker and target.
- **Swimming, Slithering & Treads**: Specialized movement with terrain-specific hazard resistance.
- **Zero-G & Vacuum**: Requires magnetic boots or reaction thrusters; inertia drift rules apply on sudden course changes.

### 11.2 Rest & Recovery Engine
Resource and ability recovery depends on proper rest cycles:
- **Full Rest (6–8 Hours)**:
  - Required sleep cycle for standard biological species to reset all exhaustion, heal vitality, and restore daily ability uses.
  - **Physiological Exceptions**: Synthetics, Fae, and Insect species do not experience traditional sleep; a brief period of Light Rest fully restores their systems. Alterians and Mondi engage in deep structured meditative states counting as Full Rest.
- **Light Rest (Up to 4 Times per Day)**:
  - **Nap / Meditation (1 Hour)**: Deepest relaxation; optimal for resetting single-encounter traits.
  - **Lounging (2 Hours)**: Casual observation and reading; non-laborious activities allowed.
  - **Light Duty (3 Hours)**: Minimal maintenance and casual guard duty.
- **Rest Interruption & Deterioration**: Performing strenuous activity (combat, sprinting, heavy physical labor) immediately degrades rest quality (e.g. from Nap to Lounging to Light Duty to Interrupted/Failed).

#### Movement Fatigue Rules
- **Trigger**: A character sprinting for **5 consecutive combat rounds** or maintaining hurried travel for **10 minutes** must make a **DC 15 Stamina Fortitude Check**.
- **Failure**: The character suffers **5 points of non-lethal Vitality damage**. If Vitality is depleted, they take **2 points of physical Health damage** and gain the **Exhausted** condition (-2 to all active checks, half movement speed) until receiving a Light Rest.

### 11.3 Unified Scaling Multipliers (Personal to Planetary)
Combat damage, armor penetration, and structural resilience scale exponentially across 8 distinct size and vehicle tiers:

| Scale Tier | Multiplier | Typical Entities | Damage Scale | Armor DR Scale |
| :--- | :---: | :--- | :---: | :---: |
| **Personal** | **1×** | Humanoids, beasts, standard infantry weapons | 1× | 1× |
| **Heavy Exo** | **2×** | Power armor suits, heavy exo-rigs, crew-served guns | 2× | 2× |
| **Light Vehicle** | **5×** | Hoverbikes, light buggies, scout combat walkers | 5× | 5× |
| **Medium Mecha** | **10×** | Mainline combat walkers, armored personnel carriers | 10× | 10× |
| **Heavy MBT** | **20×** | Main battle tanks, heavy siege walkers | 20× | 20× |
| **Super Heavy** | **50×** | Super-heavy assault mecha, titan chassis | 50× | 50× |
| **Capital Ship** | **100×** | Corvettes, frigates, orbital defense batteries | 100× | 100× |
| **Planetary** | **1000×** | Orbital bombardment lasers, dreadnoughts, world-busters | 1000× | 1000× |

### 11.4 Experience & Advancement (Award Points & The Increment Rule)
Character progression in Tangent SFF RP is organic, story-driven, and non-linear.
- **Award Points (AP) Economy**: `1 AP = 1 BP`. Standard pacing awards **1 to 3 AP per session**.
- **Story Awards**: Concluding narrative acts (5–10 AP); overcoming major nemeses or syndicates (1–3 AP).
- **Session Awards**: Consistent mechanics handling (0–2 AP); deep roleplaying in character (0–2 AP).
- **Epic & Ad-Hoc Awards**: Brilliant tactical gambits or outsmarting the Architect (1–5 AP).

#### ⚠️ The Increment Rule (CRITICAL)
Award Points are spent on character enhancements on a 1-for-1 basis identical to Build Points, subject to the **Increment Rule**:
> **Any ability score, skill rank, or trait may ONLY BE INCREASED BY 1 POINT PER EXPERIENCE AWARD.**
Players cannot pool 10 AP and immediately dump all 10 points into a single skill or attribute in one advancement phase. Progression must be distributed incrementally across multiple areas or advanced across multiple distinct downtime sessions.
