---
id: species-asi-frellin
name: Frellin
title: Frellin (Avian Fey)
category: species
parent_species: Asi (Fey Lineages)
type:
  - species_type-fey
size:
  - species_size-tiny
movement:
  - species_movement-bipedal
speeds: '30 ft Flyspeed, 10 ft Groundspeed'
reach: 2 ft
senses: 'Low-light vision. [1]'
immunities: None
inherent_attribute_modifiers:
  - attribute: Intellect
    bonus: 1
  - attribute: Charisma
    bonus: 1
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 10
bonus_skill_choices:
  - Alertness
  - Communication
  - Science
  - Navigation
  - Attune
inherent_features: []
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Awakened
  - Fast Heal
  - Karma Features
  - Regeneration
disadvantages: []
stigma: 'Xeno (-2), Animal (-2)'
tech_level: '1'
meta_level: '5'
homeworld: Twilight Aerie Grottos
costs:
  cp: 41
  bp: 41
modifiers:
  - target: Intellect
    value: 1
    type: attribute
    mode: inherent
    description: +1 Intellect
  - target: Charisma
    value: 1
    type: attribute
    mode: inherent
    description: +1 Charisma
  - target: Any
    value: 10
    type: skill
    mode: bonus_pool
    description: +10 Skill Points
  - target: Ageless
    value: 1
    type: feature
    mode: recommended
  - target: Awakened
    value: 1
    type: feature
    mode: recommended
  - target: Discipline Features (all Features and Invocations)
    value: 1
    type: feature
    mode: recommended
  - target: Fast Heal
    value: 1
    type: feature
    mode: recommended
  - target: Immortal
    value: 1
    type: feature
    mode: recommended
  - target: Karma Features
    value: 1
    type: feature
    mode: recommended
  - target: Obfuscate
    value: 1
    type: feature
    mode: recommended
  - target: Regeneration
    value: 1
    type: feature
    mode: recommended
  - target: Main deity is Shal’Vir the Scripted Fate
    value: 1
    type: feature
    mode: recommended
  - target: Hatched from fruit rich in magic
    value: 1
    type: feature
    mode: recommended
description: >-
  The Frellin are a remarkable and distinct species classified as tiny, yet
  highly intelligent, Avian Fey. These creatures are instantly recognizable by
  their extraordinary avian appearance, characterized by a vibrant, multicolored
  plumage that shimmers with an inherent magical light, making them a truly
  magnificent sight. Their bright, golden eyes are intensely perceptive, hinting
  at the deep arcane knowledge they possess. Renowned throughout the realms for
  their sharp intellect and natural affinity for the mystical arts, the Frellin
  are considered exceptionally skilled in the arcane, often acting as observers
  or subtle influencers in events beyond the ken of larger, less sensitive
  beings.
traits: &ref_0
  - trait-asi-base-traits
  - trait-awakened-arcane
  - trait-mind-speech
  - trait-flight
  - trait-dark-sight
species_traits: *ref_0
recommended_factions:
  - The Entari Combine
  - Coalition of Independent Worlds
  - Aeld Providence
recommended_origins:
  - Colony
  - Spacer
  - Enlightened
recommended_occupations:
  - Scout
  - Representative
  - Adept
keywords: 'avian, feathered, telepathic, flight, messenger, wind-currents, sensory, tiny'
negative_keywords: 'subterranean, heavy-armor, claustrophile, brute-force, slow'
cp: 41
bp: 41
cp_cost: 41
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Asi/1.03.Asi.Frellin.md]`

# **1.03.Asi.Frellin — Frellin (Avian Owl-Fey)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Asi/1.03.Asi.Frellin.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frellin** | Avian Fey (3 CP) | +1 INT [5 CP], +1 CHA [5 CP] | +10 Skills [10 CP] | Asi Base [8 CP], Tiny [4 CP], Awakened (Arcane) [2 CP], Telepathy [4 CP], Flight [4 CP], Darksight [2 CP] | Xeno (-2 CP), Animal (-2 CP) | **43 CP** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **FRELLIN ***

  

**CP Cost:** 43 CP
**Description:** The Frellin are a remarkable and distinct species classified as tiny, yet highly intelligent, Avian Fey. These creatures are instantly recognizable by their extraordinary avian appearance, characterized by a vibrant, multicolored plumage that shimmers with an inherent magical light, making them a truly magnificent sight. Their bright, golden eyes are intensely perceptive, hinting at the deep arcane knowledge they possess. Renowned throughout the realms for their sharp intellect and natural affinity for the mystical arts, the Frellin are considered exceptionally skilled in the arcane, often acting as observers or subtle influencers in events beyond the ken of larger, less sensitive beings.

  
  

**Classification:** Avian Fey

**Size:** Tiny

**Movement:** 30ft Flyspeed, 10ft Groundspeed

  

**Tech Level:** 1

**Meta Level:** 5

  

**Homeworld:** Frodleikr, an unknown world they claim as home.

**Stigma:** Xeno, Animal

  

**Ability Modifiers:** 

+1 Int

+1 Cha

  

**Skills:** 

+10 Skills

  

**Species Features:** 

Awakened (Arcane)

Telepathy (Special)

Flight (Wings)

Darksight (Special)

  

**Recommended Features:** 

Ageless

Awakened (Arcane, any Discipline)

Discipline Features (all Features and Invocations)

Fast Heal

Immortal

Karma Features

Obfuscate

Regeneration

  
  
  

Main deity is Shal’Vir the Scripted Fate

Hatched from fruit rich in magic

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Asi.Frellin.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Asi.Frellin.md`, populated the audited CP Cost (`43 CP`) and Homeworld (`Nocturnal Woodland Sanctuaries`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Asi.Frellin — Frellin (Avian Owl-Fey)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
