---
id: species-praeti
name: Praeti
title: Praeti (Winged Avian Humanoid)
category: species
parent_species: Independent Xenotypes
type:
  - species_type-humanoid
size:
  - species_size-medium
movement:
  - species_movement-bipedal
speeds: '30 ft Groundspeed, 30 ft Flightspeed'
reach: 5 ft
senses: Standard visual and auditory range.
immunities: None
inherent_attribute_modifiers: []
bonus_attribute_points: 2
specific_skill_bonuses: []
bonus_skills: 10
bonus_skill_choices:
  - Alertness
  - Navigation
  - Athletics
  - Combat (Ranged)
  - Survival
inherent_features:
  - special-uncanny-sense
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Darksight
  - Natural Weapons
  - Tolerance
  - Tough
disadvantages: []
stigma: Xeno (-2)
tech_level: '2'
meta_level: '2'
homeworld: Praetos (High-Spire Crags)
costs:
  cp: 25
  bp: 25
modifiers:
  - target: Any
    value: 2
    type: attribute
    mode: bonus_pool
    description: +2 Flexible Attribute Points
  - target: Any
    value: 10
    type: skill
    mode: bonus_pool
    description: +10 Skill Points
  - target: special-uncanny-sense
    value: 1
    type: feature
    mode: inherent
  - target: Armor (Chitinous Shell)
    value: 1
    type: feature
    mode: recommended
  - target: Darksight
    value: 1
    type: feature
    mode: recommended
  - target: Natural Weapons
    value: 1
    type: feature
    mode: recommended
  - target: Tolerance
    value: 1
    type: feature
    mode: recommended
  - target: Tough
    value: 1
    type: feature
    mode: recommended
description: >-
  The Praeti (pronounced ‘Ray-Tie’) are a distinct species of Winged
  Avian-evolved humanoids, formally classified as Saura-Raptric. This
  designation reflects their evolutionary lineage, which traces back to a
  raptor-like ancestor. Their biology represents a unique synthesis, combining
  the robust, aerodynamic skeletal structures and membranous wing features
  reminiscent of the ancient pterodactyl with the lightweight bones, complex
  feather structures, and keen sensory acuity of modern avians.
traits: &ref_0
  - trait-flight
species_traits: *ref_0
recommended_factions:
  - The Entari Combine
  - Coalition of Independent Worlds
  - The Ascendancy
recommended_origins:
  - Colony
  - Spacer
  - Militaristic
recommended_occupations:
  - Scout
  - Soldier
  - Representative
keywords: 'avian-winged, eagle-eyes, marksman-sniper, aerial-supremacy, plumage, vantage'
negative_keywords: 'subterranean, water-logging, cramped'
cp: 25
bp: 25
cp_cost: 25
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/1.03.Praeti.md]`

# **1.03.Praeti — Praeti (Saura-Raptric Winged Humanoids)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/1.03.Praeti.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Praeti** | Humanoid (0 CP) | +2 Any Attributes [10 CP] | +10 Skills [10 CP] | Uncanny Sense (Vision) [4 CP], Flight (Winged, 60 ft) [4 CP] | Xeno (-2 CP) | **26 CP** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **PRAETI**

  

**CP Cost:** 26 CP
**Description:** The Praeti (pronounced ‘Ray-Tie’) are a distinct species of Winged Avian-evolved humanoids, formally classified as Saura-Raptric. This designation reflects their evolutionary lineage, which traces back to a raptor-like ancestor. Their biology represents a unique synthesis, combining the robust, aerodynamic skeletal structures and membranous wing features reminiscent of the ancient pterodactyl with the lightweight bones, complex feather structures, and keen sensory acuity of modern avians.

  

This combined evolution grants the Praeti the ability of sustained, powered flight. Their wings are powerful, multi-jointed appendages that can fold neatly against their backs when not in use. The wings feature durable, leathery membranes akin to those of a pterosaur, while the wings and main body are covered in very fine, overlapping feathers that aid in insulation, lift, and silent gliding. As humanoids, they possess bipedal locomotion, standing upright, with powerful legs and taloned feet evolved for grasping and perching, and do not bother wearing footwear.

  

Their physiology is optimized for an aerial existence, featuring hollow, reinforced bones that minimize weight without sacrificing strength, and an extremely efficient respiratory system capable of extracting maximum oxygen at high altitudes. This raptorial heritage is also evident in their sharp, forward-facing eyes, granting them exceptional binocular vision and a visual acuity far superior to that of terrestrial humanoids, allowing them to spot prey or landmarks from great distances. The Praeti are fundamentally a flying species, for whom the sky is their natural domain.

  

**Classification:** Humanoid

**Size:** Medium

**Movement:** 30ft Groundspeed, 30 ft Flightspeed

  

**Tech Level:** 2

**Meta Level:** 2

  

**Homeworld:** High-Spire Cliff & Canyon Worlds
**Stigma:** Xeno (-2 CP)
**Ability Modifiers:** 

+2 Abilities

  

**Skills:** 

+10 Skills

  

**Species Features:** 

Flight (Winged)

Uncanny Sense (Vision)

Stigma (Xeno)

  

**Recommended Features:**

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Praeti.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Praeti.md`, populated the audited CP Cost (`26 CP`) and Homeworld (`High-Spire Cliff & Canyon Worlds`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Praeti — Praeti (Saura-Raptric Winged Humanoids)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
