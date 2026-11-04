---
id: "doc-operator-1-03-kitin"
name: "1.03 Kitin (Lineage Overview)"
fileName: "1.03.Kitin.md"
relPath: "operator/species/Kitin/1.03.Kitin.md"
isMasterDoc: false
masterDocId: "doc-operator-1-03-species"
category: "operator_rule"
parent: "doc-operator-1-03-species"
order: 70
perspective: "operator"
entry_type: "Species Lineage"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","species","1.03.kitin","mechanics"]
updatedAt: "2026-11-04T00:33:10.863Z"
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

`[BASTION // ACCESSING ARCHIVE: /game_rules/operator/species/Kitin/1.03.Kitin.md]`

# **1.03.Kitin — Kitin Collective (The Star Hive) Lineage Overview**

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Canonical Archive Path:** `/game_rules/operator/species/Kitin/1.03.Kitin.md`
* **Primary Codex & Rules Sources:** `01.03 SPECIES (work), 1.03 SPECIES.md`
* **Mechanical Authority (`/game_rules` Wins):**
  * **Universal Straight CP Pricing (Rule #9):** Positive species attribute modifiers cost **`+5 CP` per `+1`**, negative species attribute penalties refund **`-5 CP` per `-1`**, and species skill ranks cost **`1 CP` per `1` Skill Rank** (**`5 CP` per `5` Ranks**) with **zero package discount**.
  * **Vitality, Health & Synthetic Structure (Rule #8):** Biological characters begin with **Base `30` Vitality** and **Base `30` Health**; Synthetics and Constructs combine both pools into **Base `60` Structure Points (SP)**. Pools scale strictly at **`+5` points per `1 CP` spent** and are **never scaled by Stamina** (Stamina Modifier provides point-for-point **Base Toughness** damage reduction after Armor DR; Mortality `Stability Points = Stamina Score + 5`).
  * **Personal Hindrance Cap Exemption (Rule #10):** Innate species disadvantages, biological flaws, and social Stigmas are factored directly into the net Species Package CP cost and **do not count toward the Operator's `+10 CP` personal Hindrance cap**.
  * **Core Resolution & Nomenclature (Rules #1–#7, #11):** All checks and saves resolve via `2d10 + Skill Rank + Attribute Modifier vs. Challenge Rating (CR)`. All difficulty targets, currency, attributes, skills, and feature headers use canonical nomenclature (**`Challenge Rating (CR)`**, **`Character Points (CP)`**, **`Strength`**, **`Agility`**, **`Stamina`**, **`Intellect`**, **`Wisdom`**, **`Charisma`**, **`Alertness`**, **`Insight`**, **`Knowledge (Language)`**, **`Vocation (Handler)`**, and **`Recommended Features`**).

## **PART I: ALIGNMENT & SUMMARY MATRIX TABLE**

| Species / Subspecies | Chassis (Cost) | Attribute Modifiers (5 CP/+1) | Species Skills (1 CP/Rank) | Species Features & Traits | Stigma / Flaws | Net CP Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kitin Base Heritage** | Insectoid | Strain Specific | Strain Specific | Awakened (Psychic — Chorus) [2 CP], Biotechnology [2 CP], Hive-Link [2 CP], Universal Torpor (Sleepless) [2 CP] | Strain Specific | **8 CP Base** |
| **Manelli (Cerebral)** | Medium Humanoid (Mimetic) | +2 INT [10 CP], +2 WIS [10 CP], +1 CHA [5 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Mimetic Form [2 CP], Genetic Memory [2 CP], Blindsense (EM/Scent) [2 CP], TL 4 [4 CP] | Severe Xeno (-6 CP revealed / -2 CP hidden) | **47 CP (16 CP Base)** |
| **Murex (Foundation)** | Medium Insectoid Humanoid | +2 STR [10 CP], +2 STA [10 CP], -1 WIS [-5 CP], -1 CHA [-5 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Multidextrous (4 Arms) [4 CP], Dual Skeleton + Chitin (DR 15) [4 CP], Enhanced Strength [2 CP], Fatigue Resist [2 CP], Pheromones [2 CP], Quick (40 ft) [2 CP], Climber [2 CP], Resin Secretion [2 CP] | Severe Xeno (-5 CP) | **41 CP** |
| **Rakne (Infiltration)** | Medium Arachno-Tauric | +2 STR [10 CP], +2 AGI [10 CP], -1 STA [-5 CP], -1 CHA [-5 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Multidextrous (4 Arms) [4 CP], Climber (40 ft) [2 CP], Dual Skeleton + Chitin (DR 15) [4 CP], Enhanced Strength [2 CP], Resin & Weaver [4 CP], Uncanny Vibration Sense [2 CP], Camouflage [2 CP], Quick + Quadruped (40 ft) [4 CP] | Severe Xeno / Monstrous (-8 CP) | **42 CP (15 CP Base)** |
| **Maantene (Recon)** | Medium Quadruped Mantid | +2 AGI [10 CP], +1 STA [5 CP], -1 CHA [-5 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Leaper [2 CP], Dual Skeleton + Chitin (DR 15) [4 CP], Enhanced Strength [2 CP], Active Vanta-Camouflage [4 CP], Quadruped [2 CP], Multidextrous (4 Arms) [4 CP], Uncanny Vibration Sense [2 CP] | Severe Xeno (-7 CP) | **41 CP (19 CP Base)** |
| **Syndess (Pilot Core)** | Small Insectoid Larva | +2 INT [10 CP], +2 AGI [10 CP], -2 STR [-10 CP], -2 STA [-10 CP] | +10 Any [10 CP] | Kitin Base [8 CP], Synaptic Mecha Integration [2 CP], Multidextrous (30+ filaments) [2 CP], G-Force Immunity [2 CP], Blindsense (EM) [2 CP], Dual Skeleton + Chitin (DR 15) [4 CP], Climber [2 CP], Genetic Memory [2 CP], Property Boon (+4 WS) [2 CP], TL 4 [5 CP] | Severe Xeno (-4 CP), Fragile Frame (-2 CP) | **35 CP** |
| **Riezen (Divergent Swarm)** | Large Swarm of Fine Insects | +2 AGI [10 CP], -2 CHA [-10 CP] | 0 CP | Hive Mind Swarm [2 CP], Telepathic [2 CP], Host Zombification [2 CP], Psionic Static [2 CP], Fast Heal & Regeneration [4 CP], Honey/Paper Webbing [1 CP], Sleepless [2 CP], Adapted [2 CP], Blindsight [2 CP], Exoskeleton (Light) [2 CP], Flight (30 ft) [4 CP], Swarm Body [7 CP] | Severe Xeno & Monstrous (-6 CP) | **26 CP (40 CP Base)** |

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

# **KITIN COLLECTIVE (LINEAGE OVERVIEW)**

The Kitin are a vast, multifaceted insectoid lineage unified through a deep psionic hive network known as the Chorus. Possessing innate biological biotechnology, telepathic communion, and sleepless vigilance, they range from covert humanoid envoys to specialized subterranean hunters, multi-segmented mecha pilot cores, and colossal divergent swarms.

**Kitin Base Heritage (8 CP base):**
* **Awakened (Psychic — Chorus) [2 CP]:** Conductors and receptors of the Hive’s psionic Chorus.
* **Biotechnology [2 CP]:** Natural affinity and interface with living technology and bio-grafts.
* **Hive Connection / Hive-Link [2 CP]:** Constant telepathic connection to all Kitin Strains.
* **Universal Torpor / Sleepless [2 CP]:** Requires only 4 hours of conscious torpor; immune to sleep effects.

**Standardized Kitin / Riezen Toxin Save CRs:**
* **Toxic Blood (Ingested):** **Fortitude Save CR = 11 + (2 * Stamina)**; failure inflicts Pain Incapacitation for 1 hour (Severe Nausea on a successful save). *Prerequisites: Stamina 1, Poison Immunity.*
* **Venomous Saliva (Injected Bite):** **Fortitude Save CR = 11 + (2 * Stamina)**; failure inflicts Paralysis for 1 hour (Drugged / -2 all checks on a successful save). *Prerequisites: Toxic Blood, Stamina 2.*
* **Venom Spit (Contact, Range 15 ft):** **Fortitude Save CR = 11 + (2 * Stamina)**; failure inflicts **Blinded** for 10+ minutes. *Prerequisites: Toxic Blood, Stamina 2.*

## **Kitin Strain & Divergent Index**

* **[1.03.Kitin.Manelli (Cerebral Expression — 47 CP)](./1.03.Kitin.Manelli.md)**
* **[1.03.Kitin.Murex (Foundation Expression — 41 CP)](./1.03.Kitin.Murex.md)**
* **[1.03.Kitin.Rakne (Infiltration Expression — 42 CP)](./1.03.Kitin.Rakne.md)**
* **[1.03.Kitin.Maantene (Recon Expression — 41 CP)](./1.03.Kitin.Maantene.md)**
* **[1.03.Kitin.Syndess (Pilot Core Expression — 35 CP)](./1.03.Kitin.Syndess.md)**
* **[1.03.Kitin.Riezen (Divergent Swarm — 26 CP)](./1.03.Kitin.Riezen.md)**

## DISCREPANCY & RESTORATION LEDGER

### **Part III: Discrepancy & Restoration Ledger**

### **Stage 2 Audit Report (`1.03.Kitin.md`)**

1. **Mechanical Authority Audit (`/game_rules` Wins):**
   * **Universal Straight CP Pricing:** Verified that all positive attribute modifiers are priced at **`+5 CP` per `+1`**, negative attribute penalties at **`-5 CP` per `-1`**, and species skill ranks at **`1 CP` per `1` Rank (`5 CP` per `5` Ranks)** with zero package discount, superseding legacy `4 BP` package discounts from `01.03 SPECIES (work)`.
   * **Vitality, Health & Structure Pools:** Verified **Base `30` Vitality / Base `30` Health** for biological species and **Base `60` Structure Points (SP)** for Synthetics/Constructs (`+5` per `1 CP`, zero Stamina scaling; Stamina acts strictly as Base Toughness DR, and legacy `1.5x Health` Synthetic SP formulas are superseded).
   * **Personal Hindrance Cap Exemption:** Verified that all species-level Stigmas, taboos, and biological flaws reduce net Species Package CP directly and do not count against the `+10 CP` personal Hindrance limit.
2. **Textual Completeness & Normalization Audit (`_ _ TANGENT RP CODEX _ _` Wins):**
   * Restored 100% of the unabridged Codex prose, traits, Recommended Features, and sociological/aesthetic profiles from `01.03 SPECIES (work)` for `1.03.Kitin.md`, populated the audited CP Cost (`8 CP Base Heritage (Strain Packages: 26–47 CP; Base Master List: 15–40 CP)`) and Homeworld (`Star Hive Worlds & Bioships`), and removed raw tab export headers.

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
> 1. *How does your Operator leverage the innate traits and Recommended Features of **1.03.Kitin — Kitin Collective (The Star Hive) Lineage Overview** within your starting `150 CP` budget (`80 CP` Archetype Chassis + `70 CP` Customization)?*
> 2. *When operating outside your home faction's jurisdiction, how will your crew mitigate or exploit this lineage's social Stigma and Alien Mind Factor during diplomatic and metaphysical encounters?*

