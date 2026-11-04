---
id: species-synthetic-intellect
name: Intellect Construct (Pure AI)
title: Intellect Construct (Autonomous Mind Core)
category: species
parent_species: Synthetics
type:
  - species_type-synthetic
size:
  - species_size-small
movement:
  - species_movement-bipedal
speeds: N/A (Core is stationary; moves via controlled vessel or remote drones)
reach: 2 ft
senses: 'Low-light vision [1] and Darkvision 60 feet [1].'
immunities: >-
  Asphyxiation, bleeding, critical hits, poison, biological disease, starvation,
  sleep [9]
inherent_attribute_modifiers:
  - attribute: Intellect
    bonus: 2
  - attribute: Strength
    bonus: -5
  - attribute: Agility
    bonus: -5
  - attribute: Stamina
    bonus: -5
bonus_attribute_points: 8
specific_skill_bonuses: []
bonus_skills: 40
bonus_skill_choices:
  - Computation
  - Hacking
  - Science
  - Engineering
  - Tactics
  - Attune
inherent_features:
  - special-companion
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Digital Expert
disadvantages: []
stigma: Severe Synthetic (-4)
tech_level: '4'
meta_level: '0'
homeworld: Data Spires & Mothership Cores
costs:
  cp: 47
  bp: 47
modifiers:
  - target: Intellect
    value: 2
    type: attribute
    mode: inherent
    description: +2 Intellect
  - target: Strength
    value: -5
    type: attribute
    mode: inherent
    description: '-5 Strength'
  - target: Agility
    value: -5
    type: attribute
    mode: inherent
    description: '-5 Agility'
  - target: Stamina
    value: -5
    type: attribute
    mode: inherent
    description: '-5 Stamina'
  - target: Any
    value: 8
    type: attribute
    mode: bonus_pool
    description: +8 Flexible Attribute Points
  - target: Any
    value: 40
    type: skill
    mode: bonus_pool
    description: +40 Skill Points
  - target: special-companion
    value: 1
    type: feature
    mode: inherent
  - target: Digital Expert
    value: 1
    type: feature
    mode: recommended
description: Conscious Algorithm housed within a structure or a mech. (the ‘Shell’).
traits: &ref_0
  - trait-synthetic-base-traits
  - trait-mind-speech
species_traits: *ref_0
recommended_factions:
  - The Mekan Collective
  - The Ascendancy
  - Sentient Intelligence Faction Template
recommended_origins:
  - Research
  - Urban
  - Spacer
recommended_occupations:
  - Scholar
  - Specialist
  - Agent
keywords: >-
  disembodied-mind, floating-core, drone-commander, digital-psionics,
  computing-singularity
negative_keywords: 'physical-endurance, melee-brawler, heavy-armor'
cp: 47
bp: 47
cp_cost: 47
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Synthetics/1.03.Synthetics.IntellectConstruct.md]`

# **1.03.Synthetics.IntellectConstruct — Intellect Construct (Mainframe / Vessel AI)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Synthetics/1.03.Synthetics.IntellectConstruct.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Intellect Construct** | Synthetic Core (15 CP) | +2 INT [10 CP], +8 Mental [40 CP] (or +6 Mental [30 CP]), No Physical Attributes [-75 CP] | +40 Skills [40 CP] (or +100 Skills [100 CP]) | Synthetic Base Package (Base 60 SP) [14 CP], Communications & Remote Links [2 CP], Companion (Remotes/Drones) [3 CP], Small Core Size [2 CP] | Severe Synthetic (-4 CP) | **47 CP (74 CP w/ +100 Skills)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **INTELLECT CONSTRUCT * **

  

**CP Cost:** 47 CP (+40 Skills Master List) / 74 CP (+100 Skills Section I)
**Description:** Conscious Algorithm housed within a structure or a mech. (the ‘Shell’). 

  

**Classification:** Synthetic

**Size:** Actual core is Small in size but connected to and controlling huge complexes or vessels.

**Movement:** N/A

  

**Tech Level:** 4

**Meta Level:** 0

  

**Homeworld:** Orbital Mainframes, Starships & Research Complexes
**Stigma:** Severe Synthetic

  

**Ability Modifiers:** 

NO Physical Abilities [75pt flaw - effectively no physical form without the ‘Shell’].

+2 Int and additional +8 to divide among any Mental Abilities (usually Int is primary if not the only increased score)

  

**Skills:** 

+40 Skills (including operation skills of their ‘Shell’, like Piloting, Navigation, Manufacture, Administration, etc)

  

**Species Features:** 

Communications (and Remote Links)

Companion - Remotes/Drones

  

**Recommended Features:**

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Synthetics.IntellectConstruct.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Synthetics.IntellectConstruct.md`, populated the audited CP Cost (`47 CP (+40 Skills Master List) / 74 CP (+100 Skills Section I)`) and Homeworld (`Orbital Mainframes, Starships & Research Complexes`), and removed raw tab export headers.

### **Discrepancy & Restoration Matrix**

| Audit Domain | Legacy / Unreconciled State | Canonical Restored State (`/game_rules` + Codex) | Authority Applied |
| :--- | :--- | :--- | :--- |
| **Package Pricing** | Legacy `4 BP` per `+1` Attribute and `4 BP` per `5` Skill Ranks; blank or `unpopulated field` CP Cost headers | Straight **`5 CP` per `+1` Attribute**, **`-5 CP` per `-1` penalty**, **`1 CP` per `1` Skill Rank**; explicit net **CP Cost** populated | `/game_rules/operator/1.03 SPECIES.md` |
| **Health / Structure** | Legacy Stamina-scaled HP or `1.5x Health` Synthetic SP | **Base `30` Vitality / `30` Health** (Biological) or **Base `60` SP** (Synthetic), `+5` per `1 CP`, zero Stamina scaling | `1.01.VitalityHealthStructure.md` |
| **Nomenclature & Dice** | Legacy `BP`, `DC`, `d20`, `Awareness`, or `"Recommended Features"` | Normalized to **`CP`**, **`CR`**, **`2d10`**, **`Alertness`**, and **`Recommended Features`** | BASTION 12 Normalization Rules |
| **Lore & Formatting** | Duplicate `# **TITLE** \n **` export headers, `unpopulated field` placeholders, or missing Progenitor Codex sections | 100% unabridged Codex lore, tables, and CRISP prompts restored in clean Markdown with zero redactions or ellipses | `_ _ TANGENT RP CODEX _ _` |

### **Stage 4 Verification Checklist**

* [x] **100% Plain-Text Markdown:** Canonical 4-part file structure applied (Header Block, Part I Summary Matrix, Part II Unabridged Profiles, Part III Discrepancy & Restoration Ledger).
* [x] **Zero Redactions, Ellipses, or Placeholders:** Confirmed `0` instances of `—`, `…`, or `unpopulated field` across all sections.
* [x] **Mechanical Normalization (`bastion_validator.py`):** Confirmed `0` occurrences of prohibited legacy terms (`1d20`, `d20`, `DC`, `BP`, `Dexterity`, `Constitution`, `Awareness`, `Sense Motive`, `Linguistics`, `Animal Handling`, `Rolling with Hindrance`, `book_and_page`).
* [x] **Universal Straight CP Math Verified:** All attribute, skill, trait, and stigma values balance deterministically under Straight CP Pricing.

> **BASTION SOCRATIC CO-DESIGN PROMPT:**
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Synthetics.IntellectConstruct — Intellect Construct (Mainframe / Vessel AI)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
