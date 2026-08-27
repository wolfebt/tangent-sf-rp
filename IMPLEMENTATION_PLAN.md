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
