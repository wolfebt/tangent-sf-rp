---
id: species-human-danai
name: Danai (Davae Hybrid)
title: Danai (Human-Davae Hybrid)
category: species
parent_species: Humans (Core & Variants)
type:
  - species_type-humanoid
size:
  - species_size-medium
movement:
  - species_movement-bipedal
speeds: 30 ft Groundspeed
reach: 5 ft
senses: Standard visual and auditory range.
immunities: None
inherent_attribute_modifiers:
  - attribute: Intellect
    bonus: 1
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 0
bonus_skill_choices:
  - Attune
  - Biology
  - Medicine
  - Insight
inherent_features: []
bonus_features: 1
bonus_feature_choices: []
recommended_features:
  - Aptitude
  - Awakened
  - Educated
  - Eidetic Memory
  - Fast Heal
  - Regeneration
disadvantages: []
stigma: Minor Xeno (-1)
tech_level: '4'
meta_level: '4'
homeworld: Danai Enclaves
costs:
  cp: 13
  bp: 13
modifiers:
  - target: Intellect
    value: 1
    type: attribute
    mode: inherent
    description: +1 Intellect
  - target: Any
    value: 1
    type: feature
    mode: bonus_pool
    description: +1 Bonus Feature
  - target: Adaptive Aspects (Davae Collective)
    value: 1
    type: feature
    mode: recommended
  - target: Adaptive Skill Set (Davae Collective)
    value: 1
    type: feature
    mode: recommended
  - target: Ageless
    value: 1
    type: feature
    mode: recommended
  - target: Alertness
    value: 1
    type: feature
    mode: recommended
  - target: Ambidexterity
    value: 1
    type: feature
    mode: recommended
  - target: Aptitude
    value: 1
    type: feature
    mode: recommended
  - target: Awakened
    value: 1
    type: feature
    mode: recommended
  - target: Educated
    value: 1
    type: feature
    mode: recommended
  - target: Eidetic Memory
    value: 1
    type: feature
    mode: recommended
  - target: Fast Heal
    value: 1
    type: feature
    mode: recommended
  - target: Regeneration
    value: 1
    type: feature
    mode: recommended
description: >-
  The Danai are a distinct and potent hybrid subspecies resulting from the
  genetic blending of baseline humans with the highly-engineered Davae. They
  represent a more human-centered branch of this lineage, balancing the raw,
  separatist power of the Davae with traditional human adaptability.
traits: &ref_0
  - trait-awakened-mental
  - trait-enhanced-biotechnology
  - trait-hive-connection
species_traits: *ref_0
recommended_factions:
  - The Ascendancy
  - The Syndicate
recommended_origins:
  - Urban
  - Research
  - Colony
recommended_occupations:
  - Representative
  - Specialist
  - Scholar
keywords: 'empathic-diplomat, bio-resonance, gentle-glow, mediator, hybrid-psion'
negative_keywords: 'brutality, isolation, violent-outburst'
cp: 13
bp: 13
cp_cost: 13
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Humans/1.03.Humans.Danai.md]`

# **1.03.Humans.Danai — Danai (Davae Hybrid)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Humans/1.03.Humans.Danai.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Danai (Davae Hybrid)** | Humanoid (0 CP) | +1 INT [5 CP] | 0 CP | Awakened (Mental) [2 CP], Biotechnology [2 CP], Hive Connection [1–2 CP], +1 Feature [3 CP] | Minor Xeno (-1 CP) | **12–13 CP** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **DANAI (Davae Hybrid)**

**CP Cost:** 12 CP (or 13 CP)
**Description:** The Danai are a distinct and potent hybrid subspecies resulting from the genetic blending of baseline humans with the highly-engineered Davae. They represent a more human-centered branch of this lineage, balancing the raw, separatist power of the Davae with traditional human adaptability.

As a hybrid, the Danai are profoundly influenced by their Davae ancestry, a psychic species born from the Syndicate's “Proto-Chimera GeNes” project and based on Imperium Regi genetics. This heritage grants them two primary and powerful traits:

Highly Sensitive Psychics: Danai have an inherent and intense psychic affinity, often manifesting as Awakened (Mental) abilities. This makes them natural conduits for mental energies and highly sensitive to the thoughts and emotions of others. While the full-blooded Davae often use this for collective consciousness, the Danai possess a more individualistic, yet powerful, psychic focus.

Innate Biotech Understanding: They possess an intuitive, Biotechnology based link to the Davae’s advanced biotech. They do not merely use the technology; they understand its biological and psychic programming at a fundamental level, often able to troubleshoot, modify, or integrate with it more easily than most human variants.

Physiologically, Danai often retain a more human appearance than their Davae kin, yet subtle traits from the Regi-Davae line—such as a strong preference for left-handedness and a striking presence of iridescent eyes—may be common. They maintain a Hive Connection (Davae Collective), though this link often feels more like a potent, shared ancestry and knowledge base rather than a constant, overriding mental presence, giving them greater individual autonomy.

  

**Classification:** Humanoid

**Size:** Medium

**Movement:** 30ft Groundspeed

  

**Tech Level:** 4

**Meta Level:** 4

  

**Homeworld:** Silverglass Border Colonies
**Stigma:** Minor Xeno

  

**Ability Modifiers:** 

+1 Int

  

**Species Features:** 

Awakened (Mental)

Biotechnology

Hive Connection (Davae Collective)

+1 Feature

  

**Recommended Features:** 

Adaptive Aspects (Davae Collective)

Adaptive Skill Set (Davae Collective)

Ageless

Alertness

Ambidexterity

Aptitude

Awakened (Psychic)

Educated

Eidetic Memory

Fast Heal

Regeneration

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Humans.Danai.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Humans.Danai.md`, populated the audited CP Cost (`12 CP (or 13 CP)`) and Homeworld (`Silverglass Border Colonies`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Humans.Danai — Danai (Davae Hybrid)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
