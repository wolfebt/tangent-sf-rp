---
id: species-synthetic-skin
name: Skin (Infiltrator Synthetic)
title: Skin (Synthetic Replicant / Infiltrator)
category: species
parent_species: Synthetics
type:
  - species_type-synthetic
size:
  - species_size-medium
movement:
  - species_movement-bipedal
speeds: 30 ft Groundspeed
reach: 5 ft
senses: 'Low-light vision [1] and Darkvision 60 feet [1].'
immunities: >-
  Asphyxiation, bleeding, critical hits, poison, biological disease, starvation,
  sleep [9]
inherent_attribute_modifiers:
  - attribute: Intellect
    bonus: 2
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 10
bonus_skill_choices:
  - Deception
  - Insight
  - Persuasion
  - Stealth
  - Technology
inherent_features: []
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Camouflage
  - Deceitful
  - Stealthy
disadvantages: []
stigma: Secret (-6) / Severe if Exposed
tech_level: '4'
meta_level: '1'
homeworld: Covert Black Labs
costs:
  cp: 46
  bp: 46
modifiers:
  - target: Intellect
    value: 2
    type: attribute
    mode: inherent
    description: +2 Intellect
  - target: Any
    value: 10
    type: skill
    mode: bonus_pool
    description: +10 Skill Points
  - target: Camouflage
    value: 1
    type: feature
    mode: recommended
  - target: Deceitful
    value: 1
    type: feature
    mode: recommended
  - target: Jack of all trades
    value: 1
    type: feature
    mode: recommended
  - target: Stealthy
    value: 1
    type: feature
    mode: recommended
description: >-
  Experimental design to be more Human like in form and function, for various
  reasons including infiltration. No obvious distinguishable traits showing
  mechanical nature. Casual observation will not show any sign of being a
  Synthetic, a cursory exam will require CR 30, Technical Scanner with a CR 25
  and Biomed Scanners with a CR 20 - medical treatment will also reveal nature
  to the physician (although wounds would outwardly be ‘normal’ with loss of
  fluids included [limited blood simulation]).
traits: &ref_0
  - trait-synthetic-base-traits
  - trait-alter-form-basic
  - trait-adaptive-features
species_traits: *ref_0
recommended_factions:
  - The Syndicate
  - Corporate Faction Template
recommended_origins:
  - Urban
  - Research
recommended_occupations:
  - Agent
  - Entertainer
  - Criminal
keywords: >-
  synthetic-flesh, emotional-emulator, infiltrator-android, social-mimic,
  sleeper-unit
negative_keywords: 'clunky-metal, obvious-robot, conspicuous'
cp: 46
bp: 46
cp_cost: 46
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Synthetics/1.03.Synthetics.Skins.md]`

# **1.03.Synthetics.Skins — Skins (Bio-Mimetic Infiltrator Androids)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Synthetics/1.03.Synthetics.Skins.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Skin (Infiltrator)** | Synthetic (15 CP) | +2 INT / Any [10 CP] | +10 Skills [10 CP] | Synthetic Base Package (Base 60 SP) [14 CP], Alter Form (Basic Humanoid Disguise +10) & Adaptive Aspects [2 CP] | Secret Infiltrator (-6 CP if discovered) | **45 CP (29 CP Section I)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **SKINS **

  

**CP Cost:** 45 CP (Master List w/ 15 CP Type) / 29 CP (Section I Compact Table)
**Description:** Experimental design to be more Human like in form and function, for various reasons including infiltration. No obvious distinguishable traits showing mechanical nature. Casual observation will not show any sign of being a Synthetic, a cursory exam will require CR 30, Technical Scanner with a CR 25 and Biomed Scanners with a CR 20 - medical treatment will also reveal nature to the physician (although wounds would outwardly be ‘normal’ with loss of fluids included [limited blood simulation]).

  

*Heals as a typical human, with repair using nanotechnology.* 

*May take any Features as if organic and Synthetic Features as well, may incorporate Biotech Augmentations as if organic.*

  
  

**Classification:** Synthetic Humanoid

**Size:** Medium

**Movement:** 30 ft Groundspeed

  

**Tech Level:** 4

**Meta Level:** 1

  

**Homeworld:** Classified Syndicate & Intelligence Facilities
**Stigma:** Special - Stigma (Infiltrator) IF Discovered and obvious other implications of an infiltrator

  

**Ability Modifiers:** 

+2 Intellect

  

**Skills:** 

  

**Species Features:** 

Alter Form (Basic only, Humanoid Disguise +10)

Adaptive Aspects

  

**Recommended Features:**

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Synthetics.Skins.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Synthetics.Skins.md`, populated the audited CP Cost (`45 CP (Master List w/ 15 CP Type) / 29 CP (Section I Compact Table)`) and Homeworld (`Classified Syndicate & Intelligence Facilities`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Synthetics.Skins — Skins (Bio-Mimetic Infiltrator Androids)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
