---
id: "doc-operator-1-02-archetypes"
name: "1.02 ARCHETYPES"
fileName: "1.02 ARCHETYPES.md"
relPath: "operator/1.02 ARCHETYPES.md"
isMasterDoc: true
masterDocId: "doc-operator-1-02-archetypes"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 14
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","1.02 archetypes","mechanics"]
updatedAt: "2026-11-02T22:49:15.602Z"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

# **1.02 ARCHETYPES**

This document serves as a comprehensive reference for both Operators (Players) and Architects (Game Masters). Archetypes are designed to bridge the gap between abstract **Character Points (CP)** and a functional narrative role. For players, they provide a guided roadmap for initial creation and future progression; for Architects, they function as high-fidelity stat templates for NPCs that remain consistent with the system's core physics.

**Philosophy (Mechanical Gravity):** In a classless, point-buy system like **Tangent SF RP**, unlimited freedom can easily cause analysis paralysis among new players or create severe power disparities between hyper-optimized builds and thematic concepts. Archetypes provide necessary **"Mechanical Gravity."** Each entry defines a thematic **80-CP Chassis**—a pre-calculated set of prioritized attributes, essential skills at the Trained and Novice tiers, and signature traits/features that embody a specific gameplay fantasy. While the system allows for infinite customization, archetypes ensure that every character is mathematically viable and narratively focused from the start. They do not dictate a character's destiny, but they define their starting momentum.

When an Operator selects an Archetype, they immediately apply this pre-calculated **80-CP block**. They then spend their remaining **70 CP** (from the starting **150 CP** budget) to select their Species (`1.03 SPECIES.md`), customize their Saving Throws, increase their Vitality/Health pools (`Base 30` each, scaled strictly at `+5 points per 1 CP`), and fine-tune their Skills, Features, and Gear, alongside their **60 free Background Skill Ranks** (`20 SP` Faction + `20 SP` Origin + `20 SP` Occupation), **4 Background Features**, and **4 Background Traits** at `0 CP`.

---

## **1. Archetype Chassis Allocation Formula (`80 CP`)**

Every playable Archetype package allocates **80 Character Points (CP)** as follows:

* **Primary Attribute at `+3`:** **15 CP** (`5 CP` per `+1`)
* **Secondary Attribute at `+2`:** **10 CP** (`5 CP` per `+1`)
* **Trained & Novice Skill Foundation:** **42 CP**
  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)
  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)
* **Signature Traits & Core Features:** **13 CP**
  * **2 Recommended Signature Traits:** `2 CP` (`1 CP` each in the Traits category)
  * **3 Recommended Core Features:** `9 CP` (`3 CP` each Standard, or `6–9 CP` with Recommended `-1 CP` discounts; any remaining `2 CP` applied to skill/trait rounding)

**Starting Budget Note:** Player characters start with **150 CP total** (`80 CP` Archetype Chassis + `70 CP` Free Customization), plus `60 Skill Ranks`, `4 Features`, and `4 Traits` from their Faction, Origin, and Occupation packages (`0 CP`). For NPCs of other Threat Tiers, scale via `../architect/99. MODULAR CHARACTER MATRIX.md`.

---

## **2. Archetype Standardization Errata (Across All 100 Archetypes)**

When referencing the four Archetype compendiums, apply these canonical Occupation, Skill, and Discipline mappings:

| Archetype Entry | Legacy / Shorthand Term | Canonical Tangent SF RP Term |
| :--- | :--- | :--- |
| **The Armorer (`1.02.Sentinels.md`)** | Master Vocation skillsman | **Master Craftsman** (*Skill Feature*) |
| **The Muscle (`1.02.Sentinels.md`)** | Endurance *(listed in Skills)* | **Athletics** *(Endurance is a General Feature)* |
| **The Maintenance Chief (`1.02.Sentinels.md`)** | Vocation (Management) | **Vocation (Administrator)** |
| **The Acrobat (`1.02.Operatives.md`)** | Animal Handling | **Vocation (Handler)** |
| **The Thespian / Shadow-Stepper (`1.02.Operatives.md`)** | Spy *(Occupation)* | **Agent** (*Occupation*) |
| **The Oracle / The Mystic (`1.02.Visionaries.md`)** | Discipline (Divination) | **Discipline: Mental (Sense)** |
| **The Envoy / Aristocrat / Senator (`1.02.Visionaries.md`)** | Noble *(Occupation)* | **Representative** or **Citizen (Elite)** |
| **The Commander / Officer / Tactician** | Officer *(Occupation)* | **Soldier (Officer)** or **Representative** |
| **The Relic Hunter / Planetologist (`1.02.Savants.md`)** | Explorer *(Occupation)* | **Scout** (*Occupation*) |
| **The Cyberneticist / Pathologist (`1.02.Savants.md`)** | Doctor / Engineer *(Occupation)* | **Specialist (Doctor)** / **Builder (Engineer)** |
| **The Xenologist (`1.02.Savants.md`)** | Diplomat / Linguistics | **Representative** / **Knowledge (Language)** |

---

## **3. ARCHETYPES DIRECTORY INDEX**

All 100 character and NPC Archetypes are organized into four temperament divisions (plus their Signature Features reference) in the `./archetypes/` directory:

* **[Sentinels — The Stabilizers (`_S_J`)](./archetypes/1.02.Sentinels.md)** — *25 Archetypes focused on Logistics, Protection, Tradition, and Economy (The Bureaucrat through The Beast-Handler)*
* **[Operatives — The Artisans (`_SP`)](./archetypes/1.02.Operatives.md)** — *25 Archetypes focused on Finesse, Mobility, Infiltration, and Performance (The Thespian through The Combat-Saboteur)*
* **[Visionaries — The Idealists (`_NF_`)](./archetypes/1.02.Visionaries.md)** — *25 Archetypes focused on Leadership, Diplomacy, Faith, and Social Influence (The Activist through The Philosopher)*
* **[Savants — The Rationals (`_NT_`)](./archetypes/1.02.Savants.md)** — *25 Archetypes focused on Science, Technology, Strategy, and Metaphysics (The Strategist through The Xeno-Surveyor)*
* **[Archetype Signature Traits & Features](./archetypes/1.02.SignatureFeatures.md)** — *Master reference list of Signature Traits/Features for all 100 Archetypes, the 100-Feature Mechanized Table (`1.08` layout), and detailed Signature Feature mechanics*

---

## **4. DISCREPANCY & RESTORATION LEDGER**

* **DISC-304 (1.02 Archetypes Philosophy & Formula Merge):** Restored the full "Mechanical Gravity" design philosophy from `/game rules/operator/1.02 ARCHETYPES.md` and `TANGENT RP Signature Features Alignment`, combined with the Nov 2 `80-CP Chassis Allocation Formula` and `Archetype Standardization Errata` table.

