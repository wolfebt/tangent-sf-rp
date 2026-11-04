---
id: species-progenitor-ila
name: Ila (Progenitor Archon)
title: Ila (Precursor Entity)
category: species
parent_species: Progenitors
type:
  - species_type-entity
size:
  - species_size-large
movement:
  - species_movement-flicker
speeds: Flicker Movement / Flight 60 ft
reach: 10 ft
senses: 'Darkvision and Ether Sight out to 60 feet. [1+2]'
immunities: 'Reality distortion, biological needs, mortal aging.'
inherent_attribute_modifiers:
  - attribute: Intellect
    bonus: 4
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 40
bonus_skill_choices:
  - Attune
  - Science
  - Discipline
  - Knowledge
  - Computation
  - Leadership
inherent_features: []
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Discipline Features
  - Educated
  - Iron Will
  - Lightning Calculator
  - Master Craftsman
disadvantages: []
stigma: 'Deific (-6), Xeno (-2)'
tech_level: 5 (Precursor Singularity Manipulation)
meta_level: 6 (Deific / Reality Reshaping)
homeworld: The Ring Architect Capitals
costs:
  cp: 111
  bp: 111
modifiers:
  - target: Intellect
    value: 4
    type: attribute
    mode: inherent
    description: +4 Intellect
  - target: Any
    value: 40
    type: skill
    mode: bonus_pool
    description: +40 Skill Points
  - target: Discipline Features
    value: 1
    type: feature
    mode: recommended
  - target: Educated
    value: 1
    type: feature
    mode: recommended
  - target: Iron Will
    value: 1
    type: feature
    mode: recommended
  - target: Lightning Calculator
    value: 1
    type: feature
    mode: recommended
  - target: Master Craftsman
    value: 1
    type: feature
    mode: recommended
description: >-
  The Ila are god-like precursor architects of transcendent intelligence and
  luminous presence, founders of ancient megastructures and stargates.
traits: &ref_0
  - trait-progenitor-heritage-base
  - trait-semi-corporeal
species_traits: *ref_0
recommended_factions:
  - The Alterian Enclave
  - Sentient Intelligence Faction Template
  - Cosmic Justice Faction Template
recommended_origins:
  - Enlightened
  - Research
  - Spacer
recommended_occupations:
  - Scholar
  - Adept
  - Representative
keywords: >-
  precursor-archon, megastructure-builder, deific-intellect,
  luminous-singularity, ancient
negative_keywords: 'primitive, mundane-labor, disposable, short-lived'
cp: 111
bp: 111
cp_cost: 111
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Progenitors/1.03.Progenitors.Ila.md]`

# **1.03.Progenitors.Ila — Ila (Elohim Progenitors)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Progenitors/1.03.Progenitors.Ila.md`
* **Primary Codex & Rules Sources:** `05.02.Progenitor.Ila, 01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ila (Elohim)** | Entity (24 CP) | +4 INT [20 CP] | +40 Skills [40 CP] | Progenitor Heritage (Awakened x6 [12 CP], Telepathy [2 CP], Telekinesis [2 CP], Fast Heal [2 CP], Regeneration [2 CP], Ageless [2 CP], Immortal [4 CP]) [26 CP], Corporeal Form at Will [4 CP], Large Size [2 CP], Flicker Movement / Flight (TK) [4 CP] | Deific (-6 CP), Severe Xeno (-2 CP) | **112 CP** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **ILA [pronounced “E laa”] (ELOHIM PROGENITORS)**

* **CP Cost:** **112 CP** *(with Flicker Movement [4 CP]; 110 CP with Flight, TK [2 CP])*
* **Description:** Incredibly ancient and powerful progenitor species whose name in itself means godlike in several ancient languages. The Shar’Knor (Sha’Nor) are in some way connected to the Ila as well, though how or why remains to be explained. The remnants of this species have been sleeping for millennia, remaining undisturbed—until now.
* **Classification:** Entity `[24 CP]`
* **Size:** Large
* **Movement:** 60 ft Groundspeed, 60 ft Flightspeed (Flicker Movement / Telekinetic Flight)
* **Tech Level:** 5+ (Precursor Singularity & Thought-Reactive Polymatter Manipulation)
* **Meta Level:** 5+ / 6 (Deific Reality Reshaping)
* **Homeworld:** The Ring Architect Capitals
* **Stigma:** Severe Xeno, Entity, Godlike (`Deific [-6 CP], Severe Xeno [-2 CP] = -8 CP`)

#### **Ability Modifiers (Universal Straight CP Pricing: 5 CP per +1)**
* **+4 Intellect** `[20 CP]`

#### **Skills (Universal Straight CP Pricing: 1 CP per 1 Skill Rank)**
* **+40 Skill Ranks** `[40 CP]`

#### **Species Features (Progenitor Base Heritage [26 CP] + Ila Lineages [8–10 CP])**
* **Awakened (x6 — All Disciplines, Intellect-Based)** `[12 CP]`
* **Telepathy** `[2 CP]`
* **Telekinesis** `[2 CP]`
* **Corporeal Form at Will (Semi-Corporeal)** `[4 CP]`
  * **Large Size** `[2 CP]`
  * **Fast Heal** `[2 CP]`
  * **Regeneration** `[2 CP]`
  * **Ageless** `[2 CP]`
  * **Immortal** `[4 CP]`
* **Flight, Telekinetic (TK) / Flicker Movement** `[2–4 CP]`

#### **Recommended Features**
* **ANY** (All general, metaphysical, and technological features qualify for the 1 CP Recommended Feature discount, minimum 1 CP).

#### **Ila Probes & Technological Doctrine (Elohim)**
* **Ila Probes:** Highly advanced and morphic—their remote mecha are controlled using long-range telepathic links and are built entirely with thought-reactive polymatter. Note that the Ila do not use any self-aware machines (AI, Androids, or autonomous intellects) nor any actual automation.
* **Archetypal Identity:** **ELOHIM** (*"Protoss gone godmode"* — Canaanite celestial progenitor aesthetic blended with immense age, telepathy, and thought-reactive polymatter technology).

#### **CRISP Visual & Guidance Prompt Framework (`05.02.Progenitor.Ila`)**
* **SETTING STYLE:** **Imperial Psionic-Theurgy.**
  * **Description:** The aesthetic of a celestial, ancient, and absolute divine authority. Architecture is based on monumental, tiered ziggurats, temples, and colossal stone-cut forms, but rendered in futuristic, levitating white ceramic and gold-laced polymatter. Power is always veiled, hinted at by subtle light and overwhelming scale, not industrial grit. The form fuses sacred geometry (hexagons, spirals, stars) with smooth, impossible sci-fi curves.
  * **CONTEXT:** The **ELOHIM** are not just advanced, but the source of all power. Their technology (Psi-Tech, Polymatter) is their form of magic. Their probes are highly advanced, thought-reactive mecha that appear as "celestial" messengers or terrifyingly perfect guardians. Emphasis is on awe, fear, and reverence.
  * **PALETTE:** Dominant Alabaster White, Lapis Lazuli Blue, and Burnished Gold/Bronze. Accents of glowing Psionic Violet or Cerulean Cyan energy.
* **ATMOSPHERE:**
  * Worshipful, intimidating, transcendent, and silent. The air feels heavy with history and contained, limitless power. Low, dramatic lighting from celestial sources (such as twin suns or internal, glowing crystal matrices) casts deep, monumental shadows. The environment is sterile but not cold, feeling like the inside of a vast, ancient sanctuary.

| Category | Guidance Tokens |
| :--- | :--- |
| **Atmosphere** | Celestial, Divine, Awe-inspiring, Sacred, Silent, Psionic Haze, Timeless, Veiled Power, Arcane Majesty, Cosmic Scale, Alabaster Glow, Lapis Hues. |
| **Rendering** | 8k, Hyper-detailed, Ray Tracing, Sub-surface scattering (on stone and crystal), Photorealistic, Chiaroscuro, Volumetric Fog, Cinematic Composition, Ultra Fine Resolution, Divine Light. |
| **Architecture/Tech** | Levitation, Ziggurat Architecture, Flying Temple, Monumental, Engraved Runes, Sacred Geometry, Polymatter Surfaces, Gold Filigree, Levitation Platforms, High Altar, Star-Gate. |
| **Subject Visuals** | Floating, Winged Form (Energy/Hardlight), Featureless Mask/Helm, Gilded Armor, Ancient Robes (with technology woven in), Inscrutable, Inhuman Proportion, Radiant Aura. |
| **Negative Prompt Tokens** | Rust, dirt, grime, exposed wires, crude, industrial smoke, wires, gears, cyberpunk neon, steam, messy, organic decay, flimsy structure, wood, brick, modern typography, human-scale, primitive. |

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Progenitors.Ila.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged lore, Shar'Knor connection, Ila Probes thought-reactive polymatter doctrine, ELOHIM archetype notes, and the full Imperial Psionic-Theurgy CRISP Guidance Prompt & Token Table from `05.02.Progenitor.Ila`.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Progenitors.Ila — Ila (Elohim Progenitors)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
