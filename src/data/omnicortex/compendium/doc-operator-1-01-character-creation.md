---
id: "doc-operator-1-01-character-creation"
name: "1.01 CHARACTER CREATION"
fileName: "1.01 CHARACTER CREATION.md"
relPath: "operator/1.01 CHARACTER CREATION.md"
isMasterDoc: true
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 4
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","1.01 character creation","mechanics"]
updatedAt: "2026-11-04T09:33:29.343Z"
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

# 1.01 CHARACTER CREATION

* **Focus Statement:** The master index and foundational overview of the **Tangent SF RP** Operator creation pipeline, establishing the three-part Character Concept framework, the **150 Character Point (CP)** starting budget (`80-CP Archetype Chassis + 70-CP Customization Budget`), the **60 Background Skill Ranks** (`20 SP Faction + 20 SP Origin + 20 SP Occupation`), and the complete directory index for `./character_creation/`.

## Overview & Mechanical Authority Block

Every rule, formula, and character creation procedure in **Volume I: The Operator's Manual** (`operator/`) is governed by these canonical mechanical invariants:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.
* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep the highest 2 dice) or Disadvantage (keep the lowest 2 dice). Opposing stacks cancel 1-for-1.
* **Critical Hit & Fumble Resolution:**
  * **Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19`, `18`):** `2x Base Weapon Damage Dice + 30 to Attack Score + Weapon/Elemental Critical Effect`.
  * **Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3`, `4`):** `-10 to Attack/Check Score + Situational Complication`.
* **Character Point (CP) Economy (`150 CP` Starting Budget):** Starting Operators receive **150 Character Points (CP)**, structured as an **80-CP Archetype Chassis** plus a **70-CP Customization Budget** (or allocated via full custom point-buy):
  * **Primary Attribute at `+3`:** `15 CP` (`+5 CP` per `+1`)
  * **Secondary Attribute at `+2`:** `10 CP` (`+5 CP` per `+1`)
  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)
  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)
  * **2 Signature Traits (`1 CP` each) + 3 Recommended Core Features (`9 CP`):** `13 CP`
  * **Customization Budget:** `70 CP`
* **Background Allocations (`60 SP` at `0 CP`):** `20 SP Faction + 20 SP Origin + 20 SP Occupation = 60 Skill Ranks`, `4 Recommended Features`, and `4 Traits` at `0 CP` (`Extra Traits = 1 CP` each).
* **Universal Straight Pricing:** `+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, and `1 CP` per `1` Skill Rank (`5 CP` per `5` Skill Ranks) across both Species Packages and post-species customization (zero package discount).
* **Vitality, Health & Structure Pools (Zero Stamina Scaling):** Biological characters start with **Base 30 Vitality** and **Base 30 Health**; Synthetic/Construct characters combine both into **Base 60 Structure Points (SP)**. Pools scale strictly at **`+5 points per 1 CP`** spent (Suggested Max: `60` each / `120 SP`; **NEVER scaled by Stamina**). The **Stamina Modifier** serves as **Base Toughness**, subtracting point-for-point from incoming wound damage after Armor DR.
* **Personal Hindrance Cap (`+10 CP` Maximum):** Personal character Hindrances grant at most **`+10 CP`** during creation. **Species-level hindrances and cybernetic/xeno Stigmas are exempt from this 10-point cap.**

## Part I — Alignment & Summary Matrix Table

| Pipeline Stage / Subsystem | Canonical Module Reference | Core Allocation / Formula | Primary Role in Operator Creation |
| :--- | :--- | :--- | :--- |
| **1. Concept & Identity** | `operator/1.01 CHARACTER CREATION.md` | Narrative Background, Personality, and Operational Role | Defines the Operator's dramatic premise, squad niche, and factional anchor. |
| **2. Character Points (CP)** | `operator/1.01 CHARACTER CREATION.md` | `150 CP` (`80-CP Chassis` + `70-CP Customization`) | Establishes the universal point-buy currency across all creation stages. |
| **3. Pipeline I: Identity** | `character_creation/1.01.PipelineIdentity.md` | `Ability Scores` (`5 CP/+1`), `Species`, `Faction (20 SP)`, `Origin (20 SP)`, `Occupation (20 SP)` | Locks in biological heritage and grants `60 SP`, `4 Features`, and `4 Traits` at `0 CP`. |
| **4. Pipeline II: Capabilities** | `character_creation/1.01.PipelineCapabilities.md` | `Tech Level (TL 3 = 0 CP)`, `Pools (+5/CP)`, `Hindrances (+10 CP cap)`, `Features (3/2 CP)`, `Skills (1 CP/Rank)`, `Augmentations` | Configures technological era, survivability buffers, flaws, talents, and cybernetics. |
| **5. Pipeline III: Wealth & Meta** | `character_creation/1.01.StartingWealthAndMeta.md` | `Starting WS`, `Golden Rule (CR <= WS)`, `Liquidity Gap`, `Awakened & Invocations` | Equips the Operator via EUFT Wealth leverage and unlocks Metaphysic Disciplines. |
| **6. Attributes & Saves** | `character_creation/1.01.Attributes.md` | `STR (Might)`, `AGI (Reflex)`, `STA (Fortitude)`, `INT (Reason)`, `WIS (Willpower)`, `CHA (Etiquette)` | Governs raw capability checks, active/passive Saving Throws (`2d10 + 2 + 2*Attr`), and Skill Synergy. |
| **7. Perception & Detection** | `character_creation/1.01.Perception.md` | `Perception Base = INT + WIS` + `Alertness / Attune / Insight / Knowledge (Tech)` | Resolves environmental awareness, metaphysical sensing, social reading, and technical scanning. |
| **8. Vitality, Health & Structure** | `character_creation/1.01.VitalityHealthStructure.md` | `Base 30 Vitality / 30 Health` (`60 SP`) + `5 per 1 CP`; `STA = Base Toughness` | Separates non-lethal grazing/fatigue from lethal trauma with zero Stamina pool scaling. |
| **9. Karma & Plot Points** | `character_creation/1.01.Karma.md` | `Base 3 Karma Points` (Session Reset) \| `Negative Karma Limit = CHA + 1` | Provides meta-currency for Advantage (`I Got This`), rerolls, condition relief, and heroic feats. |
| **10. Movement Modes** | `character_creation/1.01.Movement.md` | `Ground (30 ft)`, `Flying (2x)`, `Swimming (1/2x)`, `Climbing`, `Burrowing`, `Flicker` | Standardizes tactical paces, subtlety penalties, aerial maneuverability, and fatigue checks. |
| **11. Rest, Death & Dying** | `character_creation/1.01.RestAndDying.md` | `Full Rest (6–8 hrs)`, `Light Rest (1–3 hrs)`, `Stability = STA + 5`, `Revivification (-5 AP Debt)` | Manages resource recovery, the Unified Mortality State at `0 Health`, and resuscitation penalties. |
| **12. Experience & Tiers** | `character_creation/1.01.Experience.md` | `1 AP = 1 CP` (`+1 Increment Rule`) \| `Tier 1 (150 CP)` to `Tier 4 (450+ CP)` | Tracks Session/Story Awards and long-term progression across the four Power Scale Tiers. |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Introduction to Character Creation

Players embark on a thrilling, customizable adventure across the Tangent universe where they hold the power to shape their character's capabilities, allegiances, and destiny. This customization system grants players the freedom to craft unique and unforgettable characters that resonate with their playstyles and preferences.

A diverse range of species awaits players, each possessing distinct attributes and abilities that influence the course of their journey. From Humans, known for their adaptability and resilience, to mystical Alterian Elves with an innate affinity for magic and the Resonance, the choice of species sets the biological and cultural foundation for a character's strengths and weaknesses.

Furthermore, players can delve into a rich array of planetary and habitat origins, uncovering the profound impact of their character's past on their present and guiding their future. Whether raised in a bustling urban metropolis, a serene agricultural village, a nomadic spacer flotilla, or an enlightened enclave, each origin bestows unique advantages, formative traits, recommended features, and skills that shape a character's journey.

The game further immerses players in a vibrant galaxy populated by various competing factions and diverse occupations. Aligning with a faction grants access to exclusive resources, cultural aesthetics, training, and missions, allowing players to forge alliances and shape the interstellar political landscape. Additionally, choosing an occupation provides specialized skills, career traits, and baseline wealth tailored to specific playstyles. From skilled warriors to cunning covert operatives and wise scholars, each occupation offers a distinct path toward character development.

Players have the ability to create characters that are not only powerful and effective in the field but also possess intriguing personalities and captivating backstories. Every decision made during character creation has a lasting mechanical and narrative impact, ensuring that each character is truly unique and memorable. Every character is a reflection of the player's creativity and strategic thinking, making the journey through this immersive world a truly personal and unforgettable experience.

### 2. Concept

To start the character creation process, players should first envision a general concept for their character. This involves thinking about several key aspects that will shape their character's identity and operational role in the game:

* **Background:** What is the character's background and upbringing? This includes their family, social status, education, and life experiences. Background will shape the character's personality, skills, and worldview.
* **Personality:** What kind of person is the character? Are they brave, analytical, cunning, compassionate, or something else entirely? Personality traits will guide the character's decisions and interactions with others.
* **Role:** What role will the character play in the game world and within their squad? Will they be a hero, a villain, a supporting specialist, a diplomat, a front-line vanguard, a technomancer, or something else? This will influence the character's goals, motivations, and the types of challenges they will face.

* **Walkthrough Example (Concept):**
  > *Xy'larra is from a merchant clan of Alterian Elves; she is a seasoned diplomat with a thirst for exploration. She is driven by a deep curiosity about the vastness of the galaxy and a desire to forge connections with newly contacted cultures.*

### 3. Character Points (`150 CP` Starting Budget)

Players are given **150 Character Points (CP)** at the start of character creation—which may be allocated freely via custom point-buy or structured via an **80-CP Playable Archetype Chassis (`1.02 ARCHETYPES.md`) + 70-CP Customization Budget**—in addition to the foundational **60 Skill Ranks, 4 Recommended Features, and 4 Traits** gained at **0 CP** from the character's Faction, Origin, and Occupation packages. These points are used to purchase various aspects of their character from any section they choose, including:

* **Ability Scores (`5 CP` per `+1` / `-5 CP` per `-1`):** The six basic ability scores (*Strength, Agility, Stamina, Intellect, Wisdom, Charisma*), with human averages of `+0`. Both inside a **Species Package** (`1.03 SPECIES.md`) and during post-species customization, raising an Ability Score costs a straight **5 CP per +1** and penalties refund **-5 CP per -1** (zero package discount; maximum starting raw score of `+4` before species or augmentation modifiers; racial paragon ceiling is `5 + Species Modifier`).
* **Vitality, Health & Structure (`1 CP` per `+5` Points — Zero Stamina Scaling):** Biological characters begin with a flat base of **30 Vitality** and **30 Health** (Synthetics and Constructs combine both into **Base 60 Structure Points [SP]**), increased strictly at a rate of **+5 points per 1 CP spent** (Suggested Starting Maximum: **60 Vitality / 60 Health**, or **120 SP**). **Stamina NEVER increases Vitality or Health pools;** instead, the Stamina Modifier subtracts point-for-point from incoming wound damage as **Base Toughness** after Armor DR.
* **Species Package (`Variable CP`):** This includes the base species and any associated biological abilities, traits, attribute adjustments (`+5 CP` per `+1` / `-5 CP` per `-1`), and species skill ranks (`1 CP` per `1 Rank` / `5 CP` per `5 Ranks`) (`1.03 SPECIES.md`). CP cost of a Species package is variable.
* **Faction, Origin and Occupation (`0 CP`):** These do not cost Character Points, but grant foundational skills, features, and traits. In total, they grant **60 Skill Ranks** (`20 SP Faction + 20 SP Origin + 20 SP Occupation`), **4 Recommended Features**, and **4 Traits** at **0 CP** to ground the character with baseline competencies; these are not "bonus" features, but foundational capabilities the character has gained from being established in the galaxy. Extra traits beyond the four free selections cost **1 CP each**.
* **Technology (`0 CP` at `TL 3`):** No CP cost at the galactic baseline of **Tech Level 3 (Space Age)**; costs more to hail from a more advanced era (**+10 CP for TL 4**, **+20 CP for TL 5**) or grants **+10 CP per Tech Level under 3** (`-10 CP` at TL 2, `-20 CP` at TL 1, `-30 CP` at TL 0).
* **Skills (`1 CP` per `1 Rank` / `5 CP` per `5 Ranks`):** These represent a character's learned abilities and expertise (`1.07 SKILLS.md`). Skills cost a straight **1 CP per 1 Skill Rank** (`5 CP` per `5 Ranks` — zero package discount; maximum starting rank at creation is **Rank 11 [Expert]**).
* **Features (`3 CP` Standard / `2 CP` Recommended):** These are special abilities, talents, or enhancements that can be acquired through various means (`1.08 FEATURES.md`). Features have a base cost of **3 CP**, adjusted by `-1 CP` (to **2 CP**) when listed as a **Recommended Feature** by the character's Species, Faction, Origin, Occupation, or Archetype (minimum cost of **1 CP** per feature).
* **Hindrances (`Up to +10 CP Maximum`):** Personal flaws and drawbacks of a character (`1.09 HINDRANCES.md`) taken to gain bonus Character Points, up to a strict maximum of **+10 CP** during creation. **Species-level hindrances and Xeno/Cybernetic Stigmas are exempt from this 10-point cap.**
* **Augmentations (`3 CP` Augmented Feature + CP/Node Costs):** Enhanced with permanent cybernetic, bioware, or meta-tech modifications (`2.00.Augmentations.md`). The **Augmented** Feature (*Augmented, Heavy, Extreme*) is required depending on the stage of invasive augmentation (3 CP per tier, granting a 6 CP augmentation credit per tier) alongside anatomical **Node** capacity (while commonplace civilian implants cost `0 CP` and `0 Nodes`).
* **Meta Discipline (`Awakened` Feature + Skill/Invocation CP):** Developing metaphysical capabilities, such as magic or psychic powers (`4.00 METAPHYSICS.md`). The **Awakened** Feature is required to access **Attune** and the Metafocus Disciplines, while the **Special Ability** Feature allows a character to use specific invocation effects without deep discipline training (regardless of the source).
* **Property (`Wealth Score`, `Credits`, `Crafting`, `Conjuration`, or `Benefit`):** Equipped with essential tools and belongings (`2.00 ECONOMATRIX.md`). Property is obtained via the **Wealth Score (WS)** (secured auto-buy transaction against the character's worth when `Item CR <= WS`), **Credits** (in-game liquid currency for paying the `Liquidity Gap = Value[Item CR] - Value[WS]`), **Crafting** items with the character's or allies' skills and materials via the Productivity Engine, **Conjuration** using Metafocus arts to create a temporary or permanent item (if temporary, there is `0 CP` cost and it fades away at the end of the scene or sooner; permanent conjured items kept on the character folio require CP purchase), or the **Benefit** Feature.

* **Walkthrough Example (Character Points):**
  > *Xy'larra has **150 CP** to spend throughout the character creation pipeline, alongside her 60 free Background Skill Ranks, 4 Recommended Features, and 4 Background Traits.*

### 4. Character Creation & Core Stats Directory Index

* **[Pipeline Part I: Identity & Background](./character_creation/1.01.PipelineIdentity.md)** — *Ability Scores, Species Package, Faction (`20 SP`), Origin (`20 SP`), and Occupation (`20 SP`) Selection (with full Xy'larra walkthrough)*
* **[Pipeline Part II: Capabilities, Vitality & Loadout](./character_creation/1.01.PipelineCapabilities.md)** — *Technology Level, CP-Scaled Vitality/Health/Structure Pools (`Base 30 + 5/CP`), Personal Hindrances (`+10 CP` cap), Recommended Features, Skills, and Augmentations*
* **[Pipeline Part III: Property, Starting Wealth & Meta](./character_creation/1.01.StartingWealthAndMeta.md)** — *Property Acquisition, Starting Wealth Score, The Golden Rule, Liquidity Gap, Financial Status Hierarchy, and Meta Awakening*

Detailed rules and reference tables for Attributes, Saving Throws, Perception, Vitality/Health/Structure, Karma, Movement Modes, Rest/Dying, and Experience Advancement are organized in `./character_creation/`:

* **[Attributes & Saving Throws](./character_creation/1.01.Attributes.md)** — *Attribute costs (`5 CP` per `+1`), general checks, active/passive saving throws (`2d10 + 2 + 2*Attr` / `CR 12 + 2*Attr`), all 5 Skill Synergy examples (`+1` per `5` points over `CR 10`), and full unabridged profiles for Strength (Might), Agility (Reflex), Stamina (Fortitude), Intellect (Reason), Wisdom (Willpower), and Charisma (Etiquette)*
* **[Perception & Detection](./character_creation/1.01.Perception.md)** — *Derived Perception base (`INT + WIS`), default `Alertness` detection checks, focused sensory types (`Attune`, `Insight`, `Knowledge [Technology]`), and environmental modifiers*
* **[Vitality, Health & Structure](./character_creation/1.01.VitalityHealthStructure.md)** — *CP-scaled pools (`Base 30 Vitality / 30 Health / 60 SP`, `+5` per `1 CP`, suggested max `60/120`, zero Stamina pool scaling), Stamina point-for-point Base Toughness reduction, and 50/50 Concussive damage splitting*
* **[Karma & Plot Points](./character_creation/1.01.Karma.md)** — *Karma Pool basics, session reset, spending Karma (`I Got This`, `Not What I Meant`, `Shake it Off`, `Second Wind`, `So Mote it Be`, `By Will Alone`), Plot Points, and Negative Karma (`CHA + 1` debt limit)*
* **[Movement Modes](./character_creation/1.01.Movement.md)** — *Ground (`Walk`, `Jog`, `Running`, `Sprinting`, `Crawl`, `Slow Crawl`), Flying (`Flight`, `Sail`, `Surge`, `Diving`, `Gliding`, `Hover`), Swimming (`Swimming`, `Glide`, `Stroke`, `Treading`), Climbing (`Climbing`, `Scaling`, `Fast Ascent`, `Fast Descent`), Burrowing, Flicker, and Movement Fatigue rules*
* **[Rest, Death & Dying](./character_creation/1.01.RestAndDying.md)** — *Full Rest, Light Rest tiers (`Nap`, `Lounging`, `Light Duty`), The Unified Mortality State (`Stability Points = STA + 5`, losing 1 per turn at `0 Health`), Stabilization (`CR 15 Medicine`), and The High Cost of Dying (`-5 AP Debt` and loss of all Karma)*
* **[Experience & Advancement](./character_creation/1.01.Experience.md)** — *Story Awards, Session Awards, Epic Actions, Award Points (`1 AP = 1 CP`), the `+1` Increment Rule, and The Power Scale Table (Tiers 1–4)*

## Part III — Discrepancy & Restoration Ledger

* **DISC-101 (Introductory Prose & Directory Index Restoration):** Restored all 5 narrative introduction paragraphs, the 3-pillar Concept section, and the complete Character Points overview from Codex `1.01 CHARACTER CREATION` (`1Uk0LzvpBhTSr0X4o4sFMGFbK7c90y8C4RxBlbyTdmTQ`), integrated with the canonical `./character_creation/` directory index.
* **DISC-102 (Mechanical Normalization & Zero Stamina Scaling):** Enforced the `150 CP` starting budget (`80-CP Archetype Chassis + 70-CP Customization Budget`), `60 Background SP` (`20 SP Faction + 20 SP Origin + 20 SP Occupation`), straight attribute (`+5 CP` per `+1`, `-5 CP` per `-1`) and skill (`1 CP` per `1 Rank`) pricing, `Base 30 Vitality / 30 Health` (`+5` per `1 CP`, never scaled by Stamina; `Stamina Mod = Base Toughness`), `+10 CP` Personal Hindrance Cap, and replaced all occurrences of "Recommended Features" with "Recommended Features".

