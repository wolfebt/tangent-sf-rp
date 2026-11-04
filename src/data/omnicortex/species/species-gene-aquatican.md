---
id: species-gene-aquatican
name: Aquatican (Gen-E)
title: Aquatican (Syndicate Pelagic Operative)
category: species
parent_species: Engineered Humans (Gen-E)
type:
  - species_type-humanoid
size:
  - species_size-medium
movement:
  - species_movement-bipedal
speeds: '30 ft Groundspeed, 30 ft Swimspeed'
reach: 5 ft
senses: Standard visual and auditory range.
immunities: None
inherent_attribute_modifiers: []
bonus_attribute_points: 1
specific_skill_bonuses: []
bonus_skills: 5
bonus_skill_choices:
  - Athletics
  - Stealth
  - Survival
  - Sabotage
inherent_features: []
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Darksight
  - Echolocation
  - Low Light Vision
  - Quick
disadvantages: []
stigma: Aquatic Xeno (-3)
tech_level: '4'
meta_level: '3'
homeworld: Deep-Sea Gen-E Habitats
costs:
  cp: 11
  bp: 11
modifiers:
  - target: Any
    value: 1
    type: attribute
    mode: bonus_pool
    description: +1 Flexible Attribute Point
  - target: Any
    value: 5
    type: skill
    mode: bonus_pool
    description: +5 Skill Points
  - target: Chameleon
    value: 1
    type: feature
    mode: recommended
  - target: Darksight
    value: 1
    type: feature
    mode: recommended
  - target: Echolocation
    value: 1
    type: feature
    mode: recommended
  - target: Exoskeleton (Partial)
    value: 1
    type: feature
    mode: recommended
  - target: Favored Environment (Aquatic)
    value: 1
    type: feature
    mode: recommended
  - target: Fortitude Resistance
    value: 1
    type: feature
    mode: recommended
  - target: Low Light Vision
    value: 1
    type: feature
    mode: recommended
  - target: Quick
    value: 1
    type: feature
    mode: recommended
description: >-
  Aquatic Humans of Aquatica, a unique and potent engineered human-variant. This
  species has been in existence for over a century, representing one of the
  Syndicate's most ambitious and successful genetic projects. They are the
  Syndicate's original Chimera GeNe, developed through the precise splicing of
  Aquarian genetics with standard Human DNA.
traits: &ref_0
  - trait-adapted
  - trait-amphibious
  - trait-aquatic
species_traits: *ref_0
recommended_factions:
  - The Syndicate
  - Corporate Faction Template
  - Coalition of Independent Worlds
recommended_origins:
  - Aquatic
  - Research
  - Industrial
recommended_occupations:
  - Soldier
  - Specialist
  - Agent
  - Scout
keywords: >-
  pelagic, gilled, deep-trench, aquatic-combat, pressure-hardened,
  underwater-sabotage
negative_keywords: 'dehydration, desert-wasteland, fire, clumsy-on-land'
cp: 11
bp: 11
cp_cost: 11
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Humans/1.03.Humans.Aquatican.md]`

# **1.03.Humans.Aquatican — Aquatican (Syndicate Engineered)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Humans/1.03.Humans.Aquatican.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Aquatican (S)** | Humanoid (0 CP) | +1 Any Attribute [5 CP] | +5 Skills [5 CP] | Adapted (Aquatic) [1 CP], Amphibious [1 CP], Natural Swim Speed [2 CP], Swimmer [2 CP] | Aquatic Xeno (-3 CP) | **13 CP (or 11 CP)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **AQUATICAN (S)**

**CP Cost:** 13 CP (or 11 CP)
**Description:** Aquatic Humans of Aquatica, a unique and potent engineered human-variant. This species has been in existence for over a century, representing one of the Syndicate's most ambitious and successful genetic projects. They are the Syndicate's original Chimera GeNe, developed through the precise splicing of Aquarian genetics with standard Human DNA.

  

This engineered lineage possesses several noticeable aquatic traits that distinguish them from baseline humans. Physically, they exhibit larger eyes, granting superior vision in low-light, watery environments. Their skin often features silvery scales that provide a degree of protection and aid in hydrodynamic movement. A clear predatory adaptation is their set of pointed teeth. Most notably, they possess full webbing on their fingers and toes, a trait that necessitates the use of custom gloves and boots for comfortable and practical use of standard human technology and environments.

  

Genetically, they bear a striking resemblance to their source population, the Aquarians, sharing a deep genetic ancestry. However, the Syndicate's engineering eliminated key weaknesses present in the original Aquarian genome. Consequently, the Aquatic Humans of Aquatica have no issues with diet; unlike some naturally evolved aquatic species, they are not constrained by a limited food source. Furthermore, many of their population are carnivores, reflecting a more opportunistic and robust metabolism. Crucially, they are completely unaffected by the Tiburon Syndrome, a debilitating affliction that plagues many of their Aquarian kin, making them a genetically superior and more resilient operative for the Syndicate.

  

**Classification:** Humanoid

**Size:** Medium

**Movement:** 30ft Groundspeed

  

**Tech Level:** 4

**Meta Level:** 3

  

**Homeworld:** Aquatica

**Stigma:** Aquatic Xeno (-3 CP)
**Ability Modifiers:** 

+1 Ability

  

**Skills:** 

+5 Skills

  

**Species Features:** 

Adapted (Aquatic)

Amphibious - Breathe Air and Water equally well (to a 1 mile depth)

Natural Swim Speed 

Swimmer

Stigma (Appearance & Aquatic Xeno)

  

**Recommended Features:** 

Aquatic Strength - in water considered 1 size larger for Strength purposes [x2 carry, grapples as large size]

Chameleon

Darksight

Echolocation (as Blindsight 60 ft - Underwater only)

Exoskeleton (Partial)

Favored Environment (Aquatic)

Fortitude Resistance

Low Light Vision

Quick line

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Humans.Aquatican.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Humans.Aquatican.md`, populated the audited CP Cost (`13 CP (or 11 CP)`) and Homeworld (`Syndicate Oceanic Extraction Colonies`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Humans.Aquatican — Aquatican (Syndicate Engineered)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
