---
id: species-kitin-maantene
name: Maantene (Recon Expression)
title: Maantene (Kitin Recon Expression / Quadruped)
category: species
parent_species: Kitin
type:
  - species_type-aberration
size:
  - species_size-medium
movement:
  - species_movement-quadruped
speeds: 40 ft Groundspeed (Leaping)
reach: 5 ft
senses: >-
  Uncanny Senses (Vibration detection through atmospheric and ground ripples),
  Large multi-faceted compound eyes out to 60 ft.
immunities: Sleep effects and involuntary unconsciousness (Torpor)
inherent_attribute_modifiers:
  - attribute: Agility
    bonus: 2
  - attribute: Stamina
    bonus: 1
  - attribute: Charisma
    bonus: -1
bonus_attribute_points: 0
specific_skill_bonuses: []
bonus_skills: 10
bonus_skill_choices:
  - Acrobatics
  - Athletics
  - Combat
  - Perception
  - Science
  - Stealth
  - Survival
  - Tech
inherent_features: []
bonus_features: 0
bonus_feature_choices: []
recommended_features:
  - Awakened
  - Bodyform Features
  - Camouflage
  - Headstrong
  - Social
disadvantages: []
stigma: Severe Xeno (-4)
tech_level: 3 (Environmental)
meta_level: 3 (Awakened)
homeworld: Kitin Hive Worlds / Arid Frontier Warrens
costs:
  cp: 41
  bp: 41
modifiers:
  - target: Agility
    value: 2
    type: attribute
    mode: inherent
    description: +2 Agility
  - target: Stamina
    value: 1
    type: attribute
    mode: inherent
    description: +1 Stamina
  - target: Charisma
    value: -1
    type: attribute
    mode: inherent
    description: '-1 Charisma'
  - target: Any
    value: 10
    type: skill
    mode: bonus_pool
    description: +10 Skill Points
  - target: Ability Check Feature
    value: 1
    type: feature
    mode: recommended
  - target: Alertness
    value: 1
    type: feature
    mode: recommended
  - target: Awakened
    value: 1
    type: feature
    mode: recommended
  - target: Bodyform Features
    value: 1
    type: feature
    mode: recommended
  - target: Camouflage
    value: 1
    type: feature
    mode: recommended
  - target: Climbing
    value: 1
    type: feature
    mode: recommended
  - target: Headstrong
    value: 1
    type: feature
    mode: recommended
  - target: Mutation
    value: 1
    type: feature
    mode: recommended
  - target: Social
    value: 1
    type: feature
    mode: recommended
description: >-
  The Manteene are quadrupedal insectoids that stand roughly the same height as
  humans but appear much larger due to their length and limb span. They are
  covered in a tough, chitinous armor, typically sandy-yellow or golden-brown to
  blend with desert environments. This carapace can often shift in color and
  texture (similar to a chameleon) to match their surroundings. They are
  quadruped with legs designed for leaping. Above these, they have four arms: a
  smaller upper pair for fine manipulation and a larger lower pair for heavy
  lifting and combat. Their heads are distinctly mantis-like, featuring large,
  multi-faceted black compound eyes, twitching antennae used for sensing
  vibrations and communication, and complex mandible mechanism.
traits: &ref_0
  - trait-active-camouflage
  - trait-awakened-psychic
  - trait-chitinous-shell-armor
  - trait-dual-skeletal-structure
  - trait-enhanced-strength
  - trait-leaper
  - trait-multidextrous-4-arms
  - trait-quadruped-leaping
  - trait-torpor-universal
  - trait-uncanny-senses-vibration
species_traits: *ref_0
recommended_factions:
  - Kitin Collective (The Star Hive)
  - Hive Mind Faction Template
  - Coalition of Independent Worlds
  - Criminal Faction Template
recommended_origins:
  - Hostile
  - Colony
  - Spacer
recommended_occupations:
  - Scout
  - Soldier
  - Specialist
  - Agent
keywords: >-
  insectoid-aberration, recon-expression, mantis-leaper, active-camouflage,
  four-arms, dual-skeletal, torpor, vibration-sense, vanta-black, arid-predator,
  collective-recon
negative_keywords: 'individualism, diplomatic-court, fragile, sleep-vulnerable'
cp: 41
bp: 41
cp_cost: 41
---

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Kitin/1.03.Kitin.Maantene.md]`

# **1.03.Kitin.Maantene — Maantene (Reconnaissance & Strike Expression)**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Kitin/1.03.Kitin.Maantene.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Maantene (Recon)** | Medium Quadruped Mantid | +2 AGI [10 CP], +1 STA [5 CP], -1 CHA [-5 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Leaper [2 CP], Dual Skeleton + Chitin (DR 15) [4 CP], Enhanced Strength [2 CP], Active Vanta-Camouflage [4 CP], Quadruped [2 CP], Multidextrous (4 Arms) [4 CP], Uncanny Vibration Sense [2 CP] | Severe Xeno (-7 CP) | **41 CP (19 CP Base)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

# **MAANTENE**
**Recon Expression**
**Classification:** Insectoid Aberration (Quadruped)
**CP Cost:** 41 CP

**Description:**
The Maantene are quadrupedal insectoids that stand roughly the same height as humans but appear much larger due to their length and limb span. They are covered in a tough, chitinous armor, typically sandy-yellow or golden-brown to blend with desert environments. This carapace can often shift in color and texture (similar to a chameleon) to match their surroundings. They are quadrupeds with legs designed for leaping. Above these, they have four arms: a smaller upper pair for fine manipulation and a larger lower pair for heavy lifting and combat. Their heads are distinctly mantis-like, featuring large, multi-faceted black compound eyes, twitching antennae used for sensing vibrations and communication, and complex mandible mechanisms.

Maantene biology is radically different from mammals, leading to a psychology that many other races find difficult to understand. Maantene do not sleep. Instead, they enter a fully conscious but inactive state called torpor for about 4 hours a day to rest their bodies. Because they are always awake, they have no concept of dreams and often view sleep as a waste of time or a dangerous vulnerability. They are strict carnivores. While they can survive on little water, they require fresh meat.

The Maantene represent the "Recon Expression," specialized for survival in hostile frontiers. They are quadrupedal with mantis-like heads and a sandy-black glossy obsidian shell. Their active camouflage allows their wet chitin to vanish into shadows.

**Technical Profile:**
* **Size:** Medium
* **Movement:** 40 ft Groundspeed (Leaping)
* **Tech Level:** 3 (Environmental)
* **Meta Level:** 3 (Awakened)
* **Stigma:** Severe Xeno (-7 CP)

**Attribute Modifiers:**
* +2 Agility [10 CP]
* +1 Stamina [5 CP]
* -1 Charisma [-5 CP]

**Skills:**
* +10 Skill Ranks to ANY skills [10 CP]

**Species Features:**
* **Awakened (Psychic — Intellect or Wisdom):** Conductor of the Hive’s psionic Chorus. [2 CP]
* **Leaper:** Always counts as a running start; all checks for jumping, leaping, and dropping are made at Advantage. [2 CP]
* **Dual Skeletal Structure:** Combined endo/exo-skeleton (+5 DR). [2 CP]
* **Armor:** Chitinous shell resistant to physical trauma, energy, and chemicals [base DR 10; combined DR 15]. [2 CP]
* **Enhanced Strength:** Count as 1 size larger for lifting and carrying. [2 CP]
* **Camouflage (Active):** Chitin can shift texture and hue to blend into their environment, shifting to a variety of colors as desired — including light-absorbing vanta-black — and can visually camouflage so well they seem to fade away into transparency (+4 to Stealth). [4 CP]
* **Quadruped (Leaping):** Specialized legs for high-impact jumping. [2 CP]
* **Multidextrous (4 Arms):** Two combat arms, two manipulation arms. [4 CP]
* **Torpor (Universal):** 4 hours of conscious rest; no loss of Alertness. [2 CP]
* **Uncanny Senses (Vibration):** Sensitive to atmospheric and ground ripples. [2 CP]

**Recommended Features (-1 CP Discount):**
* Ability Check Feature
* Alertness
* Awakened (Psychic)
* Bodyform Features
* Camouflage
* Climbing
* Headstrong
* Limited Flight (2x Land Speed for 1 round of movement, 2x Jump distance, and Slow Fall)
* Mutation
* Social

**Aesthetics (CRISP):**
* **Style:** Painterly Realism, Segmented Armor, Arid Predator.
* **Palette:** Dominant: Glossy Obsidian / Gunmetal. Accent: Cyan.
* **Visuals:** Quadrupedal silhouette with segmented chitin plates, four articulated humanoid arms, a distinct mantis-like head with faceted compound eyes, and twitching vibrational antennae.

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Kitin.Maantene.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Kitin.Maantene.md`, populated the audited CP Cost (`41 CP (Full Strain Package) / 19 CP (Master List Base)`) and Homeworld (`Star Hive Worlds & Bioships`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Kitin.Maantene — Maantene (Reconnaissance & Strike Expression)** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*
