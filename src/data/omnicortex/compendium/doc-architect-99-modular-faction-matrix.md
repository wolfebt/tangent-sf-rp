---
id: "doc-architect-99-modular-faction-matrix"
name: "MODULAR FACTION MATRIX"
fileName: "99. MODULAR FACTION MATRIX.md"
relPath: "architect/99. MODULAR FACTION MATRIX.md"
isMasterDoc: true
masterDocId: "doc-architect-99-modular-faction-matrix"
category: "architect_matrix"
parent: "5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)"
order: 17
perspective: "architect"
entry_type: "Architect Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","source-of-truth","99. modular faction matrix","matrix"]
updatedAt: "2026-11-04T09:33:29.243Z"
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

# **99. MODULAR FACTION MATRIX**

## Overview & Mechanical Authority Block

Every rule, formula, and procedural matrix in this master compendium is governed by these canonical **Tangent SF RP** mechanical invariants:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.
* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep the highest 2 dice) or Disadvantage (keep the lowest 2 dice). Opposing stacks cancel 1-for-1.
* **Critical Hit & Fumble Resolution:** Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19`, `18`) equals `Rolled Dice + 10` (`20 -> 30`, `19 -> 29`) + `2x Base Weapon Damage Dice` + `Weapon/Elemental Critical Effect`. Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3`, `4`) converts the rolled dice into a flat `-10` (`Base Score - 10`) + `Situational Complication`.
* **Character Point (CP) Economy:** `150 CP` starting Operator budget divided into an **80-CP Archetype Chassis** (`15 CP` Primary Attribute at `+3`, `10 CP` Secondary Attribute at `+2`, `24 CP` for 4 Essential Skills at Rank 6, `18 CP` for 6 Supporting Skills at Rank 3, and `13 CP` for 2 Signature Traits at `1 CP` each plus 3 Recommended Core Features at `9 CP`) and a **70-CP Customization Budget**.
* **Background Skill Ranks:** `60 Background Skill Ranks` allocated at `0 CP` as `20 SP Faction` + `20 SP Origin` + `20 SP Occupation`, alongside `4 Recommended Features` (`-1 CP` discount: `2 CP` instead of `3 CP`, minimum `1 CP`) and `4 Traits` at `0 CP` (`Extra Traits = 1 CP` each).
* **Universal Straight Pricing:** `+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, and `1 CP` per `1` Skill Rank (`5 CP` per `5` Skill Ranks) across all creation, species, companion, and bestiary packages.
* **Vitality, Health & Structure Pools (Zero Stamina Scaling):** Biological characters start with **Base 30 Vitality** and **Base 30 Health**; Synthetic/Construct entities combine both into **Base 60 Structure Points (SP)**. Pools scale strictly at **`+5 points per 1 CP`** spent (Suggested Max: `60` each / `120 SP`; **NEVER scaled by Stamina**). Stamina Modifier subtracts point-for-point from incoming damage as **Base Toughness** after Armor DR (`Armor Layering Cap`: only the single highest DR across bio, cyber, and worn armor applies).
* **Personal Hindrance Cap:** Standard personal character hindrances have a `+10 CP` maximum limit; **Species-level hindrances and cybernetic Stigmas do NOT count toward the 10-point standard hindrance limit**.
* **Economic Unified Field Theory (EUFT) & UDU Hierarchy:** Base 5-CR intervals follow `Value (Credits) = 10 * 4^(CR / 5)` modified by Linear Micro-Modifiers (`+1 CR = x1.30`, `+2 CR = x1.75`, `+3 CR = x2.30`, `+4 CR = x3.00`, `-1 CR Flaw = x0.75`). Pristine crafting materials cost `50%` of Credit Value; Scavenged Scrap retains `10%` value (`5x Item Credit Value` in unrefined scrap mass). UDU capacity scales at `10 Usable Nodes (Tier 0) = 1 Socket (Tier 1)`, `10 Sockets = 1 Mount (Tier 2)`, and `10 Mounts = 1 Module (Tier 3)` (`Garaging: 1 Mount = 1 Scale Multiplier`; vehicle table SP is pre-calculated).

## Part I — Alignment & Summary Matrix Table

| Phase / Section | Matrix Component | Core Mechanical & Sociological Parameters |
| :--- | :--- | :--- |
| **Phase 1: Archetype Selection** | Sociological Chassis | Defines governmental structure, ideological mandate, and galactic role. |
| **Phase 2: Mechanical Skeleton** | `TL`, `ML`, `WS`, `20 SP` | Sets Tech Level (`TL 0–5`), Meta Level (`ML 0–5`), Wealth Modifier (`-2` to `+8 WS`), and `20 SP` package. |
| **Phase 3–4: Narrative & Aesthetics** | Kinetic Semiotics | Establishes palette, lighting, shape language, and gear aesthetics. |
| **Part II: Master Faction Template** | Standardized Dossier | Sections I–VIII including CRISP Image Synthesis and Asset Databases (Architecture & Mecha). |

## Part II — Complete Unabridged Profiles & Rules Entries

## **Introduction: The Sociological Chassis**

In the Tangent universe, a Faction is not merely a political boundary; it is a **Sociological Chassis** that defines a character's worldview, resources, and operational parameters. Just as a Species defines biological capabilities, the Faction defines cultural software: education, prejudices, equipment standards, and economic standing.

This framework synthesizes **Narrative Architecture**, **Game Mechanics (Skills, Recommended Features, and Wealth)**, and **Visual Semiotics (CRISP AI Prompts)** into a unified design document. It ensures that every faction entry serves as a functional "Source of Truth" for World Building and Character Creation (`operator/1.04 FACTIONS.md`).

## **PART I: THE CONSTRUCTION PROTOCOL**

To ensure consistency across the Tangent Universe, all factions must be built using this four-phase protocol. This ensures that a "Militaristic" faction in one sector functions mechanically similarly to one in another, even if their flavor differs.

### **PHASE 1: ARCHETYPE SELECTION**

*Select one primary archetype to define the faction's mechanical baseline. This determines their Skill Package focus and default Recommended Features:*

| Archetype | Focus | Key Skill Groups | Implied Wealth Modifier |
| :--- | :--- | :--- | :--- |
| **Militaristic** | Conquest / Defense | Combat (Any), Tactics, Leadership | Moderate (+1 to +2) |
| **Corporate / Mercantile** | Profit / Efficiency | Administration, Diplomacy, Vocation | High (+3 to +4) |
| **Religious / Cult** | Dogma / Purity | Academics (Theology), Insight, Social | Variable (0 to +4) |
| **Technological** | Innovation / Logic | Science, Engineering, Computers | High (+2 to +6) |
| **Criminal / Syndicate** | Illicit Gain / Control | Streetwise, Stealth, Intimidate | Variable (Black Market) |
| **Exploration / Academic** | Discovery / Knowledge | Piloting, Survival, Sciences | Moderate (+1 to +2) |
| **Agrarian / Colony** | Survival / Growth | Nature, Vocation, Fortitude | Low (0 to +1) |
| **Isolationist / Alien** | Preservation / Vigilance | Stealth, Alertness, Culture | Variable |

### **PHASE 2: MECHANICAL SKELETON**

#### **1. Technological Level (TL)**

*Reference: `architect/99. TECHNOLOGY.md`*

- **TL 0 (Primitive):** Pre-industrial. *(Wealth Modifier: -4)*
- **TL 1 (Archaic / Metal Age):** Steam, foundries, early mechanical. *(Wealth Modifier: -2)*
- **TL 2 (Industrial / Data Age):** Combustion engines, cased firearms, digital networks. *(Wealth Modifier: 0)*
- **TL 3 (Space Age — Standard):** FTL (Translux), Mag-weapons, standard shields. *(Wealth Modifier: +2)*
- **TL 4 (Stellar Age — Enhanced):** Anti-grav, Nanotech, Bioware, Psi-Tech/Magi-Tech. *(Wealth Modifier: +4)*
- **TL 5 (Galactic Age — Post-Scarcity):** Polymatter, Holophotonics, Quantum Entanglement. *(Wealth Modifier: +8)*

#### **2. Economic Standing (Faction Wealth Modifier)**

*Reference: `architect/02 ECONOMY AND WEALTH.md`*

Determine the faction's global Wealth Modifier. This bonus is applied to the starting Wealth Score of characters belonging to this faction:

- **Struggling (+0):** Coalition, Outworlds, Refugees, Scavengers.
- **Stable (+1 to +2):** Dracon Dynasty, Auluran Clans, Kitin Collective, Standard Colonies.
- **Affluent (+3):** Alterian Enclave, Impyrium Dominion, Entari Combine.
- **Hyper-Wealthy (+4 to +6):** Syndicate (+4), Ascendancy (+4), Radiant Impyrium (+5), Mekan Collective (+6).

#### **3. Faction Skill Package (20 Skill Points)**

*Reference: `operator/1.04 FACTIONS.md` & `operator/1.07 SKILLS.md`*

- **Rule:** Curate a list of eligible faction skills representing cultural and institutional "Basic Training." Operators receive **20 Skill Points (SP)** to distribute among these skills during character creation (combining with Origin 20 SP + Occupation 20 SP = **60 Skill Ranks, 4 Features, and 4 Traits at 0 CP**).
- **Example (Militaristic):** Ballistics (5), Knowledge (Tactics) (5), Athletics (5), Defense (5).

#### **4. Faction Recommended Features (1 CP Discount)**

*Reference: `operator/1.08 FEATURES.md`*

- **Rule:** Curate **10 Recommended Features** emblematic of the faction's training and privileges. Characters belonging to this faction purchase any of these Recommended Features at a **1 CP discount** (2 CP instead of 3 CP, down to the 1 CP minimum).
- **Examples:** *Authority*, *Security Clearance*, *Benefit (Wealth/Equipment)*, *Contacts*, *Awakened*, *Augmented*.

### **PHASE 3: NARRATIVE ARCHITECTURE**

*Define the "Cultural Software" and governance:*

- **Governance:** How do they rule? (e.g., Corporatocracy, Feudal Monarchy, Consensus Technocracy, Hive Mind).
- **Law Level:** How strict is social control? (0 Lawless Frontier to 10 Algorithmic Totalitarianism).
- **Sociological Hooks:** What defines daily life? (e.g., *"Subscription Reality"* for the Syndicate, *"Feudal Caste Protocol"* for the Dynasty).

### **PHASE 4: KINETIC SEMIOTICS (AESTHETICS)**

*Define the physical look of the faction using the "Chassis & Skin" philosophy:*

- **Architecture:** Defining structural geometries (e.g., Hexagonal Hives, Crystalline Spires, Brutalist Monoliths, Grown Arcologies).
- **Materials:** Signature physical substrates (e.g., White Psycholith Ceramic, Weathered Durasteel, Living Iron-Wood, Obsidian Basalt).
- **Lighting & Mood:** Atmospheric palette (e.g., Clinical Cyan Neon, Golden Chiaroscuro, Bioluminescent Amber).

## **PART II: THE FACTION TEMPLATE (MASTER)**

*Copy this block when authoring a new faction entry:*

# **[FACTION NAME]**

## **I. CORE IDENTITY**
* **Official Designation:** [Name]
* **Colloquialisms:** [Slang Terms]
* **Archetype:** [e.g., Militaristic / Corporate]
* **Symbol / Sigil:** [Visual Description]
* **Driving Mandate:** [One-sentence summary of goal]
* **Motto:** "[Public Slogan]"

## **II. SOCIOLOGICAL PROFILE**
* **Ideology & Culture:**
  * **Core Beliefs:** [Philosophy]
  * **Social Structure:** [Hierarchy description]
  * **View on Outsiders:** [Hostile / Neutral / Welcoming]
  * **Law & Order:** [Law Level & Enforcement Style]
* **Governance:**
  * **Government Type:** [e.g., Technocracy]
  * **Leadership:** [Who rules?]
  * **Succession:** [How is power transferred?]

## **III. STRATEGIC ASSETS**
* **Economy & Tech:**
  * **Tech Level / Meta Level:** [TL 0–5 / ML 0–5]
  * **Wealth Modifier:** [e.g., +3]
  * **Primary Exports:** [Goods/Services]
  * **Economic Model:** [Capitalist / Planned / Post-Scarcity / Barter]
* **Military Profile:**
  * **Doctrine:** [e.g., Drone Swarms, Elite Infantry, Orbital Bombardment]
  * **Key Units:** [Specific soldier types]
  * **Naval Assets:** [Starship classes and hull aesthetics]

## **IV. MECHANICS (GAME DATA)**
* **Faction Skill Package (20 Skill Points):** [List eligible skills]
* **Recommended Features (1 CP Discount — Select from 10):** [List 10 Recommended Features]

## **V. VISUAL SEMIOTICS (AESTHETICS)**
* **Design Language:** [Keywords: e.g., Sleek, Industrial, Organic]
* **Architecture:** [Building styles]
* **Gear Aesthetic:** [Weapon/Armor look]
* **Lighting / Mood:** [Color palette]

## **VI. IMAGE SYNTHESIS GUIDANCE (CRISP)**
* **Subject:** [List 3–4 Representative Archetypes]
* **Setting Style:** "[Short Evocative Phrase]"
* **Architecture / Tech:** [Specific materials and shapes]
* **Atmosphere Tokens:** [Mood Keywords]
* **Lighting:** [Lighting description]
* **Rendering Prompt:** Photorealistic Cinematic Art, 8k raw imagery, lineless rendering, volumetric form, painterly realism, hyper-realistic texture, lifelike imagery, realistic anatomy, detailed musculature, heavy fabric physics, tailored clothing, intricate material definition, chiaroscuro, low-key lighting, visible light beams, volumetric fog, deep color blocking, rich blacks, soft shadow transitions, deep indigo shadows, colored rim lighting, backlighting, kicker light, film grain, subsurface scattering, cinematic composition, rule of thirds, anamorphic bokeh.
* **Negative Prompt:** outlines, black lines, borders, ink strokes, contour lines, hatching, cross-hatching, line art, line weight, illustration, cartoon, sketch, 3d render, gradient mesh, fuzzy, blurry, messy, watermark, text, anime, cel shaded, toon shading, hard edges, capes, banners, extra fabric, excess cables, distorted hands, plastic skin, waxy texture, airbrushed, smooth, doll-like.

### **VII. ASSET APPENDICES (DATABASES)**

Every canonical faction entry houses structured data tables for its signature architectural, vehicular, and mecha assets:

#### **A. Architectural Database (Buildings & Installations)**

| Structure Name | Scale / Footprint | Height | Structure Points (SP) | Base DR | Primary Function & Installed Modules |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Marshal Garrison (Exemplar)** | Small (`40x40 ft`) | 2-Story | `1,000 SP` | `DR 20` | Holding Cells, Armory, Comms Array (`20 Modules`) |

#### **B. Vehicular & Mecha Database**

| Vehicle / Mecha Name | Classification / Size | Structure Points (SP) | Base DR | Primary Loadout, Propulsion & Installed Mounts |
| :--- | :--- | :---: | :---: | :--- |
| **"Ironback" Walker (Exemplar)** | Frontier Cavalry / Large (`x2` Scale) | `120 SP` | `DR 15` | "Peacemaker" Heavy Mag-Rail, Shoulder MG / Bipedal Walker |

### **VIII. EXPANSION MODULES (DEEP-DIVE LORE & VIGNETTES)**

- **A. Technical & Lore Expansion:** Detailed mechanical and lore breakdowns of proprietary faction systems (e.g., *The Mesh*, *Psi-Tech*, *Biomorphic Fabrication*, *The Chorus*).
- **B. Historical Archive:** Chronicled timeline of major eras, wars, schisms, and structural transitions (e.g., *The Age of Radiance*, *The Severance*, *The Great Neglect*).
- **C. Common Personas (Narrative Archetypes):** Evocative character profiles detailing signature roles within the faction's daily life, including behavioral traits and visual signifiers.
- **D. Narrative Scene Vignettes:** Atmospheric storyboards and in-universe scenes illustrating the faction's setting, cultural friction, and architectural mood in action.

## Part III — Discrepancy & Restoration Ledger

- **File Target:** `architect/99. MODULAR FACTION MATRIX.md`
- **Restoration Pass (Three-Way Merge):**
  - Restored 100% of Part I (4-Phase Construction Protocol) and Part II (Master Faction Template & CRISP Image Synthesis Guidance) from `/game rules/architect/99. MODULAR FACTION MATRIX.md` and the Nov 2 revision.
- **Mechanical Normalization Pass (12 Global Rules):**
  - Normalized `Alertness` -> `Alertness` and integrated the `20 SP Faction + 20 SP Origin + 20 SP Occupation = 60 Skill Ranks, 4 Features, 4 Traits at 0 CP` background allocation rule.

