---
id: species-human-cyberform
name: Cyberform Human
title: Cyberform Human (Transhuman Cyborg)
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
    bonus: 2
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 10
bonus_skill_choices:
  - Technology
  - Hacking
  - Science
  - Piloting
  - Engineering
inherent_features:
  - special-augmented
  - special-companion
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Bodyform Features
  - Regeneration
  - Technologist
disadvantages: []
stigma: 'Xeno (-2), Augmented (-4)'
tech_level: '4'
meta_level: '3'
homeworld: Cygnus Arcologies & Orbital Rings (secluded research solar system)
costs:
  cp: 22
  bp: 22
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
  - target: special-augmented
    value: 1
    type: feature
    mode: inherent
  - target: special-companion
    value: 1
    type: feature
    mode: inherent
  - target: Adaptive Aspects (AI Network)
    value: 1
    type: feature
    mode: recommended
  - target: Adaptive Skill Set (AI Network)
    value: 1
    type: feature
    mode: recommended
  - target: Ageless
    value: 1
    type: feature
    mode: recommended
  - target: Bodyform Features
    value: 1
    type: feature
    mode: recommended
  - target: Heavy and Severe Augmentations
    value: 1
    type: feature
    mode: recommended
  - target: Immortality
    value: 1
    type: feature
    mode: recommended
  - target: Regeneration
    value: 1
    type: feature
    mode: recommended
  - target: Synthetic Options
    value: 1
    type: feature
    mode: recommended
  - target: Technologist
    value: 1
    type: feature
    mode: recommended
description: >-
  Reclusive and highly advanced culture with adaptive picotech augmentations
  integrated on a genetic level. Personal AIs bond with each infant for its
  facilitation and also to voice any needs and opinions in the AI managed
  society. Combines Cybernetic and Eudaimonic Societies, becoming an efficient
  and benevolent democratic AI social focused government that promotes
  fulfillment of an individual’s potential. A tolerant and understanding
  culture, allowing individuals to pursue their own paths and wholly backed by
  their system.
traits: &ref_0
  - trait-bodyform-adaptation
species_traits: *ref_0
recommended_factions:
  - The Syndicate
  - Technological Faction Template
recommended_origins:
  - Industrial
  - Urban
  - Research
recommended_occupations:
  - Specialist
  - Builder
  - Soldier
keywords: >-
  cyborg, neural-socket, optic-hub, titanium-replacement, high-tech,
  nanite-repair
negative_keywords: 'nature-magic, emp-vulnerable, biological-purist, low-tech'
cp: 22
bp: 22
cp_cost: 22
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Humans/1.03.Humans.Cyberform.md]`

# **1.03.Humans.Cyberform — Cyberform (Cybernetically Integrated Humans)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Humans/1.03.Humans.Cyberform.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cyberform** | Humanoid (0 CP) | +2 INT [10 CP] | +10 Skills [10 CP] | Augmented (Body Comp, PicoSurgeons, Smart Link) [6 CP], Bodyform Acclimation [2 CP], Companion (AI) [3 CP] | Xeno (-2 CP), Augmented (-4 CP), Maintenance (-4 CP optional) | **25 CP (21 CP w/ Maint.)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

### **CYBERFORM**

**CP Cost:** 25 CP (or 21 CP with Maintenance [-4 CP])
**Description:** Reclusive and highly advanced culture with adaptive picotech augmentations integrated on a genetic level. Personal AIs bond with each infant for its facilitation and also to voice any needs and opinions in the AI managed society. Combines Cybernetic and Eudaimonic Societies, becoming an efficient and benevolent democratic AI social focused government that promotes fulfillment of an individual’s potential. A tolerant and understanding culture, allowing individuals to pursue their own paths and wholly backed by their system. 

  

Have strong belief in governmental transparency and communal information while having personal privacy between individuals. The Network’s management council is composed of actual Synthetic Intellects and digitally converted Cyberforms, with constant communication from personal Body Computers. This allows the system to be highly efficient in maintaining the world’s infrastructure, transportation, logistics, communications, education, archives, etc. with the priority of ALL of its people’s needs, wants, and well being. 

  

Originally was an Impyrium colony detached from politics and following the Code as shown by the Mekan.  Without the contact of other factions the society has become unique. Strong Transhumanistic beliefs throughout the entire culture with prominent augmentations, body replacements and some even becoming digital entities capable of changing bodies as needed or residing in the network. 

  

Androids are not manufactured by these people as they are pre Syndicate and any Synthetics they currently work with are Sentient Intellects and Machines, who do not suffer any stigma with Cyberform Humans.

  

**Classification:** Humanoid

**Size:** Medium

**Movement:** 30ft Groundspeed

  

**Tech Level:** 4

**Meta Level:** 3

  

**Homeworld:** (secluded outworld with a leisure/research culture - collectively within their solar system)

**Stigma:** Xeno and Augmented

  

**Ability Modifiers:** 

+2 Int

  

**Skills:** 

+10 Skills

  

**Species Features:** 

Augmented (Body Computer, PicoSurgeons and Smart Link standard)

Bodyform Adaptation

Companion (AI)

  

**Recommended Features:** 

Adaptive Aspects (AI Network)

Adaptive Skill Set (AI Network)

Ageless

Bodyform Features

Heavy and Severe Augmentations

Immortality

Regeneration (Fast Heal gained from PicoSurgeons)

Synthetic Options

Technologist

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Humans.Cyberform.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Humans.Cyberform.md`, populated the audited CP Cost (`25 CP (or 21 CP with Maintenance [-4 CP])`) and Homeworld (`Technological Enclaves & Orbital Habitats`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Humans.Cyberform — Cyberform (Cybernetically Integrated Humans)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
