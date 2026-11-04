---
id: "doc-operator-1-03-humans"
name: "1.03 Humans (Lineage Overview)"
fileName: "1.03.Humans.md"
relPath: "operator/species/Humans/1.03.Humans.md"
isMasterDoc: false
masterDocId: "doc-operator-1-03-species"
category: "operator_rule"
parent: "doc-operator-1-03-species"
order: 43
perspective: "operator"
entry_type: "Species Lineage"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","species","1.03.humans","mechanics"]
updatedAt: "2026-11-04T00:33:10.853Z"
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

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Humans/1.03.Humans.md]`

# **1.03.Humans — Human Lineages, Offshoots & Gen-E Strains Overview**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Humans/1.03.Humans.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Humans (Base)** | Humanoid (0 CP) | +0 Baseline | +10 Skills [10 CP] | +1 Feature of Choice [2–3 CP] (Karma Feature recommended) | None (0 CP) | **12–13 CP** |
| **Aquarian** | Humanoid (0 CP) | +1 Any [5 CP] | 0 CP | Adapted (Aquatic) [1 CP], Amphibious [1 CP], Aquatic Strength [2 CP], Specialized Senses [2 CP], Swimming [2 CP], +1 Feature [3 CP] | Aquatic Xeno (-3 CP), Tiburon Taboo (-5 CP) | **8 CP (13 CP w/o Taboo)** |
| **Argynt** | Humanoid (0 CP) | +1 INT [5 CP], +1 STA [5 CP] (or +1 INT [5 CP]) | +5 Skills [5 CP] | Improved Great Fortitude [2 CP] | Blue Skin (-1 CP) | **16 CP (or 11 CP)** |
| **B'Dren** | Humanoid (0 CP) | +1 AGI [5 CP], +1 Any [5 CP] | 0 CP | Low-Light Vision [1 CP], Quick [2 CP] | Minor Xeno (-2 CP or 0 CP) | **11–13 CP** |
| **Brae** | Humanoid (0 CP) | +1 AGI [5 CP], +1 Any [5 CP] | +10 Skills [10 CP] | Small Size [2 CP], Climber [2 CP] | None (0 CP) | **24 CP** |
| **Changeling** | Humanoid (0 CP) | +1 CHA [5 CP] | +5 Skills [5 CP] | Alter Form (Minor) [1–2 CP] | Shifter (-2 CP) | **9–10 CP** |
| **Cyberform** | Humanoid (0 CP) | +2 INT [10 CP] | +10 Skills [10 CP] | Augmented (Body Comp, PicoSurgeons, Smart Link) [6 CP], Bodyform Acclimation [2 CP], Companion (AI) [3 CP] | Xeno (-2 CP), Augmented (-4 CP), Maintenance (-4 CP) | **21–25 CP** |
| **Danai** | Humanoid (0 CP) | +1 INT [5 CP] | 0 CP | Awakened (Mental) [2 CP], Biotechnology [2 CP], Hive Connection [1–2 CP], +1 Feature [3 CP] | Minor Xeno (-1 CP) | **12–13 CP** |
| **Draconic** | Humanoid (0 CP) | +1 Any [5 CP] | 0 CP | Dragonkin Traits [6 CP], Status (Dynasty) [3 CP], +1 Feature [3 CP] | Draconic (-2 CP) | **15 CP** |
| **Dwerg** | Humanoid (0 CP) | +1 STR [5 CP], +1 STA [5 CP] | +10 Vocation [10 CP] | Mighty Surge [2 CP], Low-Light Vision [1 CP], Stability [1 CP] | Minor Xeno (-1 CP) | **21–23 CP** |
| **Kheen** | Humanoid (0 CP) | +2 Any [10 CP] | +5 Skills [5 CP] | Low-Light Vision [1 CP] | None (0 CP) | **16 CP** |
| **Lin** | Humanoid (0 CP) | +1 INT [5 CP] | +10 Skills [10 CP] | Adapted (Arboreal) [1 CP], Awakened (Nature Psychic) [2 CP], Biotechnology [2 CP], Climber [2 CP], Prehensile Tail [1 CP] | Xeno (-2 CP) | **21 CP** |
| **Nian** | Humanoid (0 CP) | +1 STR [5 CP], +1 STA [5 CP], -1 CHA [-5 CP] | 0 CP | Brutal [2 CP], Exoskeleton (Partial) [1 CP] | None (0 CP) | **8 CP** |
| **Premian** | Humanoid (0 CP) | +1 Any [5 CP] | +10 Skills [10 CP] | +1 Recommended Feature Discount [1 CP] | None (0 CP) | **15–16 CP** |
| **Rautha** | Humanoid (0 CP) | +2 AGI [10 CP], +2 STA [10 CP] | +10 Skills [10 CP] | Fast (40 ft) [2 CP], Jumper [1 CP], Low-Light Vision [1 CP], Prehensile Tail [1 CP], Scent [1 CP] | Xeno (-2 CP) | **34 CP** |
| **Risakin** | Humanoid (0 CP) | +2 STR [10 CP], +2 STA [10 CP] | +10 Skills [10 CP] | Large Size [2 CP], +2 Features [4–6 CP] | Xeno (-2 CP), Giant (-2 to -3 CP) | **31–34 CP** |
| **Varen** | Humanoid (0 CP) | +1 INT [5 CP], +1 Any [5 CP] | +10 Skills [10 CP] | Awakened (Dimension) [2 CP], Indomitable Will [2 CP], Teleportal & Homing [4–6 CP] | None (0 CP) | **28–30 CP** |
| **Gen-E (Base)** | Humanoid (0 CP) | +2 Any [10 CP] | +5 Skills [5 CP] | +1 Feature [3 CP] | Engineered (-6 CP / Variable) | **12 CP (18 CP un-stigmatized)** |
| **Aquatican** | Humanoid (0 CP) | +1 Any [5 CP] | +5 Skills [5 CP] | Adapted (Aquatic) [1 CP], Amphibious [1 CP], Swim Speed [2 CP], Swimmer [2 CP] | Aquatic Xeno (-3 CP) | **11–13 CP** |
| **Chimera** | Humanoid (0 CP) | +2 Any [10 CP] | +5 Skills [5 CP] | +2 Species Features [4 CP], Mutation [3 CP] | Genetic (-2 CP), Bestial (-2 CP), Unstable (-11 CP) | **7 CP (18 CP stable)** |
| **Davae** | Humanoid (0 CP) | +1 INT [5 CP], +1 Any [5 CP] | +5 Focus [5 CP] | Awakened (Psychic) [2 CP], Telepathy [2–4 CP], Biotechnology [2 CP], Hive Connection [1–2 CP], +2 Features [6 CP] | Xeno (-2 CP) | **20–29 CP** |
| **Digon** | Humanoid (0 CP) | +1 STR, +1 AGI, +1 STA [15 CP], -1 INT, -1 CHA [-10 CP] | +5 Skills [5 CP] | Brutal [2 CP], Exoskeleton (Partial) [1 CP], Rage [3 CP] | Xeno (-2 CP), Savage (-2 to -4 CP) | **10–12 CP** |
| **Impyrium Psion** | Humanoid (0 CP) | +1 WIS [5 CP], +1 Any [5 CP] | +10 Skills [10 CP] | Awakened (Psychic) [2 CP], Status (Impyrium) [3 CP] | None (0 CP) | **25 CP** |
| **Impyrium Regi** | Humanoid (0 CP) | +2 INT [10 CP] | +20 Skills [20 CP] | Adaptive Aspects [2 CP], Awakened (Psychic) [2 CP], Status (Nobility) [3 CP] | None (0 CP) | **37 CP** |
| **Janissary** | Humanoid (0 CP) | +2 Any [10 CP], -1 CHA [-5 CP] | +20 Combat [20 CP] | Augmented [3 CP], Combat Reflexes/Conditioning [2 CP] | Clone Servitude (-5 CP) / Xeno (-2 CP) | **22–28 CP** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

# **HUMANS (LINEAGE OVERVIEW)**

Humans and their numerous environmental, cybernetic, and genetically engineered offshoots represent one of the most widespread and adaptable humanoid lineages across the known territories—populating the Dracon Dynasty, Incorporated Planetary Syndication, Impyrium, Coalition of Independent Worlds, and Outworlds.

While baseline Humans possess no innate biological species traits, they receive **+10 Skill Ranks [10 CP]** and **+1 Feature of Choice [2–3 CP]** (typically a Karma Feature), allowing exceptional versatility across all archetypes and occupations. Across many non-human territories, Humans carry varying degrees of diplomatic or social stigma due to the historical legacy of the Impyrium's aggressive expansion and colonization campaigns.

## **Human Lineage & Offshoot Index**

### **Baseline Humanity**
* **Humans (Base) [12–13 CP]:** Humanoid (0) | Skills: +10 [10 CP] | Features: +1 Feature of Choice [2–3 CP] | Stigma: —

### **Environmental, Cultural & Hybrid Offshoots**
* **Aquarian [8 CP *(13 CP w/o Taboo)*]:** Humanoid (0) | +1 Any Attribute [5 CP] | *Adapted (Aquatic)* [1 CP], *Amphibious* [1 CP], *Aquatic Strength* [2 CP], *Specialized Senses* [2 CP], *Swimming* [2 CP], +1 Feature [3 CP] | Stigma: Aquatic Xeno (-3 CP), *Tiburon Syndrome Taboo* (-5 CP)
* **Argynt [16 CP]:** Humanoid (0) | +1 INT [5 CP], +1 STA [5 CP] | +5 Skills [5 CP] | *Improved Great Fortitude* [2 CP] | Stigma: Blue Skin (-1 CP)
* **B’Dren [11 CP]:** Humanoid (0) | +1 AGI [5 CP], +1 Any Attribute [5 CP] | *Low-Light Vision* [1 CP], *Quick* [2 CP] | Stigma: Minor Xeno (-2 CP)
* **Brae [24 CP]:** Humanoid (0) | +1 AGI [5 CP], +1 Any Attribute [5 CP] | +10 Skills [10 CP] | *Small Size* [2 CP], *Climber* [2 CP]
* **Changeling [10 CP *(9 CP Base)*]:** Humanoid (0) | +1 CHA [5 CP] | +5 Skills [5 CP] | *Alter Form (Minor)* [2 CP] | Stigma: Shifter (-2 CP)
* **Cyberform [21 CP *(25 CP w/o Maintenance)*]:** Humanoid (0) | +2 INT [10 CP] | +10 Skills [10 CP] | *Augmented (Body Comp, PicoSurgeons, Smart Link)* [6 CP], *Bodyform Acclimation* [2 CP], *Companion (AI)* [3 CP] | Stigma: Xeno (-2 CP), Augmented (-4 CP), Maintenance (-4 CP)
* **Danai [12 CP]:** Humanoid (0) | +1 INT [5 CP] | *Awakened (Mental)* [2 CP], *Biotechnology* [2 CP], *Hive Connection* [1 CP], +1 Feature [3 CP] | Stigma: Minor Xeno (-1 CP)
* **Draconic [15 CP *(9 CP Base)*]:** Humanoid (0) | +1 Any Attribute [5 CP] | *Dragonkin Traits* [6 CP], *Status (Dynasty)* [3 CP], +1 Feature [3 CP] | Stigma: Draconic (-2 CP)
* **Dwerg [23 CP]:** Humanoid (0) | +1 STR [5 CP], +1 STA [5 CP] | +10 Vocation Skills [10 CP] | *Mighty Surge* [2 CP], *Low-Light Vision* [1 CP], *Stability* [1 CP] | Stigma: Minor Xeno (-1 CP)
* **Kheen [16 CP *(13 CP Base)*]:** Humanoid (0) | +2 Any Attributes [10 CP] | +5 Skills [5 CP] | *Low-Light Vision* [1 CP]
* **Lin [21 CP]:** Humanoid (0) | +1 INT [5 CP] | +10 Skills [10 CP] | *Adapted (Arboreal)* [1 CP], *Awakened (Nature/Psychic)* [2 CP], *Biotechnology* [2 CP], *Climber* [2 CP], *Prehensile Tail* [1 CP] | Stigma: Xeno (-2 CP)
* **Nian [8 CP *(21 CP w/ Heavy Traits)*]:** Humanoid (0) | +1 STR [5 CP], +1 STA [5 CP], -1 CHA [-5 CP] | *Brutal* [2 CP], *Exoskeleton (Partial)* [1 CP]
* **Premian [15–16 CP]:** Humanoid (0) | +1 Any Attribute [5 CP] | +10 Skills [10 CP] | +1 Recommended Feature Discount [1 CP]
* **Rautha [34–36 CP]:** Humanoid (0) | +2 AGI [10 CP], +2 STA [10 CP] | +10 Skills [10 CP] | *Fast* [2 CP], *Jumper* [1 CP], *Low-Light Vision* [1 CP], *Prehensile Tail* [1 CP], *Scent* [1 CP] | Stigma: Xeno (-2 CP)
* **Risakin [31–34 CP]:** Humanoid (0) | +2 STR [10 CP], +2 STA [10 CP] | +10 Skills [10 CP] | *Large* [2 CP], +2 Features [4 CP] | Stigma: Xeno (-2 CP), Giant (-3 CP)
* **Varen (Gatekeepers) [28–30 CP]:** Humanoid (0) | +1 INT [5 CP], +1 Any Attribute [5 CP] | +10 Skills [10 CP] | *Awakened (Dimension/Psychic)* [2 CP], *Indomitable Will* [2 CP], *Teleportal (Special Ability)* [3 CP], *Homing (Special Ability)* [3 CP]

### **Engineered Humans (Gen-E Strains)**
* **Gen-E (Base Engineered) [12 CP *(18 CP un-stigmatized)*]:** Humanoid (0) | +2 Any Attributes [10 CP] | +5 Skills [5 CP] | +1 Feature [3 CP] | Stigma: Engineered (-6 CP)
* **Aquatican [11–13 CP]:** Humanoid (0) | +1 Any Attribute [5 CP] | +5 Skills [5 CP] | *Adapted (Aquatic)* [1 CP], *Amphibious* [1 CP], *Natural Swim Speed* [2 CP], *Swimmer* [2 CP] | Stigma: Aquatic Xeno (-3 CP)
* **Chimera [7 CP *(18–19 CP stable)*]:** Humanoid (0) | +2 Any Attributes [10 CP] | +5 Skills [5 CP] | +2 Species/Special Features [4 CP], *Mutation* [3 CP] | Stigma: Genetic (-2 CP), Bestial (-2 CP), Unstable (-11 CP)
* **Davae [20 CP]:** Humanoid (0) | +1 INT [5 CP], +1 Any Attribute [5 CP] | +5 Focus Skills [5 CP] | *Awakened (Psychic)* [2 CP], *Telepathy* [2 CP], *Biotechnology* [2 CP], *Hive Connection* [1 CP] | Stigma: Xeno (-2 CP)
* **Digon [12 CP *(8 CP w/ Severe Savage)*]:** Humanoid (0) | +1 STR, +1 AGI, +1 STA [15 CP], -1 INT, -1 CHA [-10 CP] | +5 Skills [5 CP] | *Brutal* [2 CP], *Exoskeleton (Partial)* [1 CP], *Rage* [3 CP] | Stigma: Xeno (-2 CP), Savage (-2 CP)
* **Impyrium Psion [25 CP]:** Humanoid (0) | +1 WIS [5 CP], +1 Any Attribute [5 CP] | +10 Skills [10 CP] | *Awakened (Psychic)* [2 CP], *Status (Impyrium)* [3 CP]
* **Impyrium Regi [37 CP]:** Humanoid (0) | +2 INT [10 CP] | +20 Skills [20 CP] | *Adaptive Aspects* [2 CP], *Awakened (Psychic)* [2 CP], *Status (Nobility)* [3 CP]
* **Janissary [22 CP]:** Humanoid (0) | +2 Any Attributes [10 CP], -1 CHA [-5 CP] | +20 Combat Skills [20 CP] | *Combat Conditioning* [2 CP] | Stigma: Clone Servitude (-5 CP)

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Humans.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Humans.md`, populated the audited CP Cost (`12–13 CP Baseline (Offshoots & Strains: 7–37 CP)`) and Homeworld (`Terra / Core Faction Worlds (Dynasty, Syndicate, Impyrium, Coalition)`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Humans — Human Lineages, Offshoots & Gen-E Strains Overview** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*

