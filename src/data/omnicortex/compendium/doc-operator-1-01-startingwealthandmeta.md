---
id: "doc-operator-1-01-startingwealthandmeta"
name: "1.01 Pipeline III: Starting Wealth, Property & Meta"
fileName: "1.01.StartingWealthAndMeta.md"
relPath: "operator/character_creation/1.01.StartingWealthAndMeta.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 6
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.startingwealthandmeta","mechanics"]
updatedAt: "2026-11-04T00:33:10.528Z"
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

# 1.01.03 CHARACTER CREATION PIPELINE III: PROPERTY, STARTING WEALTH & META

* **Focus Statement:** Step-by-step Operator creation rules for **Property & Equipment Acquisition**, **Starting Wealth Score (`WS`) Calculation**, **The Golden Rule (`Item CR <= WS`)**, **The Liquidity Gap**, **The 12-Tier Financial Status Hierarchy**, and **Metaphysical Capabilities (`Awakened`, `Disciplines`, `Invocations`, `Essence`)**, complete with Xy'larra's property and metaphysical walkthrough.

## Overview & Mechanical Authority Block

Every rule, formula, and character creation procedure in **Volume I: The Operator's Manual** (`operator/`) is governed by these canonical mechanical invariants:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.
* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep the highest 2 dice) or Disadvantage (keep the lowest 2 dice). Opposing stacks cancel 1-for-1.
* **Critical Hit & Fumble Resolution:**
  * **Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19`, `18`):** `2x Base Weapon Damage Dice + 30 to Attack Score + Weapon/Elemental Critical Effect`.
  * **Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3`, `4`):** `-10 to Attack/Check Score + Situational Complication`.
* **Character Point (CP) Economy (`150 CP` Starting Budget):** Starting Operators receive **150 Character Points (CP)**, structured as an **80-CP Archetype Chassis** plus a **70-CP Customization Budget** (or allocated via full custom point-buy):
  * **Primary Attribute at `+3`:** `15 CP` (`+5 CP` per `+1`)
  * **Secondary Attribute at `+2`:** `10 CP` (`+5 CP` per `+1`)
  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)
  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)
  * **2 Signature Traits (`1 CP` each) + 3 Recommended Core Features (`9 CP`):** `13 CP`
  * **Customization Budget:** `70 CP`
* **Background Allocations (`60 SP` at `0 CP`):** `20 SP Faction + 20 SP Origin + 20 SP Occupation = 60 Skill Ranks`, `4 Recommended Features`, and `4 Traits` at `0 CP` (`Extra Traits = 1 CP` each).
* **Universal Straight Pricing:** `+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, and `1 CP` per `1` Skill Rank (`5 CP` per `5` Skill Ranks) across both Species Packages and post-species customization (zero package discount).
* **Vitality, Health & Structure Pools (Zero Stamina Scaling):** Biological characters start with **Base 30 Vitality** and **Base 30 Health**; Synthetic/Construct characters combine both into **Base 60 Structure Points (SP)**. Pools scale strictly at **`+5 points per 1 CP`** spent (Suggested Max: `60` each / `120 SP`; **NEVER scaled by Stamina**). The **Stamina Modifier** serves as **Base Toughness**, subtracting point-for-point from incoming wound damage after Armor DR.
* **Personal Hindrance Cap (`+10 CP` Maximum):** Personal character Hindrances grant at most **`+10 CP`** during creation. **Species-level hindrances and cybernetic/xeno Stigmas are exempt from this 10-point cap.**

## Part I — Alignment & Summary Matrix Table

| Subsystem / Table | Canonical Reference | Core Equation / Parameter | Primary Operational Role |
| :--- | :--- | :--- | :--- |
| **1. Property & Loadout** | `2.00 ECONOMATRIX.md` | `Wealth Score`, `Credits`, `Crafting`, `Conjuration`, `Benefit` | Equips Operators with weapons, armor (single-domain DR cap), gear, vehicles, and starships. |
| **2. Starting Wealth Score** | `02 ECONOMY AND WEALTH.md` | `WS = Occupation Base + Origin + Faction + TL + Vocation Bonus` | Quantifies composite economic leverage, credit access, and auto-buy purchasing power. |
| **3. Golden Rule & Gap** | `02 ECONOMY AND WEALTH.md` | Auto-Buy if `Item CR <= WS` \| `Gap = Value(CR) - Value(WS)` | Eliminates bookkeeping for routine gear while pricing high-CR acquisitions via `10 * 4^(CR/5)`. |
| **4. Financial Hierarchy** | `2.00 ECONOMATRIX.md` | `WS 0` (*Indebted*, `-5 CP`) to `WS 80+` (*Faction Ruler*, `160 CP`) | Maps Wealth Score tiers to CP investment, auto-buy limits, net worth, and lifestyle. |
| **5. Meta Capabilities** | `1.06 METAPHYSICS.md` | `Awakened (3/2 CP)` + `Attune` + `6 Disciplines (12 Foci)` + `Invocations` | Unlocks Resonance channeling, Discipline Focus skills, Invocations (`1 CP/Rank`), and Essence pools. |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Property

The **Property** stage of character creation in Tangent (`2.00 ECONOMATRIX.md`) involves equipping your character with the necessary tools, armaments, and belongings for their adventures. This includes:

* **Weapons:** Choose melee, ranged, ballistic, or energy weapons that suit your character's combat style and preferences, considering factors such as their skill proficiencies, available funds (`Wealth Score`), and the Technology Level of the setting.
* **Armor:** Select protective clothing, tactical vests, battlesuits, or field generators that provide adequate Damage Resistance (`DR`) without hindering your character's movement or abilities. Consider the character's occupation and the types of threats they are likely to face. *(Per the Armor Layering Cap, DR does not stack across biological, cybernetic, and wearable domains; only the single highest DR applies).*
* **Gear:** Acquire gear that supports your character's occupation and lifestyle. This includes multi-devices, medkits, tools, supplies, communication devices, or other equipment that aids them in their endeavors.
* **Mecha or Mounts:** Depending on the setting and your character's background, they may have access to personal vehicles, walkers, mecha, starships, or biological mounts that facilitate travel and exploration.

Characters begin with simple possessions appropriate for their skills, abilities, background, and Tech Level. This includes basic personal items, clothing, and tools needed for any applicable skills. A character's access to and the quality of their possessions is affected by their Technology Level. For example, a character from a low-tech background (`TL 0–1`) may only have access to simple tools and archaic weapons, while a character from a high-tech faction (`TL 3–5`) has access to advanced weaponry and equipment.

If a character wants additional or special equipment, weapons, armor, mecha, or mounts, they have four acquisition pathways:

1. **Increase or Utilize Their Wealth Score (`WS`):** Use the **Golden Rule** (`Item CR <= WS` costs `0` liquid Credits) or pay/finance the **Liquidity Gap** (`Value[Item CR] - Value[WS]`) in liquid Credits.
2. **Acquire the Benefit Feature (`1–3 CP`):** This grants institutional, factional, or hereditary access to replaceable high-tier equipment, which can range from enhanced signature gear to a scout starship.
3. **Crafting via the Productivity Engine:** Fabricate items using personal or ally crafting skills and raw materials (`50%` Pristine Material cost, or `10%` Scavenged Scrap requiring `5x` Item Credit Value in unrefined scrap mass).
4. **Metaphysic Conjuration:** Use Metafocus arts to conjure temporary or permanent items (if temporary, there is `0 CP` cost and the item fades away at the end of the scene or sooner; permanent conjured items kept on the character folio require CP purchase).

#### Walkthrough Example: Xy'larra (Property & Loadout)

> *As a diplomat and explorer, Xy'larra carries equipment tailored to her professional needs and nomadic lifestyle. She utilizes a secure, long-range **Diplomatic Comm-Link (`CR 10`)**, wears a stylish, **Light-Weave Armored Garment (`CR 10`)** that provides subtle protection, and carries a versatile **Morphic Multi-Device (`CR 14`)** used for data analysis and field repairs (personal **Wealth Score [WS 14]** used for typical needs). Additionally, she has been granted access to a sleek, **Scout-Class Star Yacht** for her diplomatic missions and explorations via the **Benefit** Feature.*

### 2. Determining Starting Wealth Score (`WS`)

A character's economic leverage is quantified by their **Wealth Score (WS)**—a composite rating summing income, prestige, credit standing, active investments, and social capital:

```text
Starting Wealth Score (WS) = Occupation Base + Origin Modifier + Faction Modifier + Tech Level Modifier + Vocation Skill Bonus
```

#### A. Occupation Wealth Base

| Occupation | Base WS | Occupation | Base WS |
| :--- | :---: | :--- | :---: |
| **Adept** | `4` | **Merchant** | `5` |
| **Agent** | `2` | **Representative** | `6` |
| **Builder** | `3` | **Scholar** | `3` |
| **Citizen** | `2` | **Scout** | `1` |
| **Criminal** | `4` | **Soldier** | `1` |
| **Drifter** | `1` | **Specialist** | `3` |
| **Entertainer** | `5` | — | — |

#### B. Origin Wealth Modifiers

| Origin | WS Modifier | Origin | WS Modifier |
| :--- | :---: | :--- | :---: |
| **Agricultural** | `+0` | **Industrial** | `+2` |
| **Aquatic** | `+1` | **Leisure** | `+3` |
| **Colony** | `+0` | **Militaristic** | `+0` |
| **Enlightened** | `+2` | **Research** | `+2` |
| **Hostile** | `+0` | **Spacer** | `+1` |
| **Urban** | `+1` | **Others / Custom** | `+0 to +3` |

#### C. Faction Wealth Modifiers

| Faction | WS Modifier | Faction | WS Modifier |
| :--- | :---: | :--- | :---: |
| **Alterian Enclave** | `+3` | **Impyrium Dominion** | `+3` |
| **Auluran / Kitin** | `+2` | **Radiant Impyrium** | `+5` |
| **Ascendancy** | `+4` | **Mekan Collective** | `+6` *(Special)* |
| **Coalition** | `+0` | **Syndicate** | `+4` |
| **Dracon Dynasty** | `+2` | **Outworlds / Independent** | `+0` |
| **Entari Combine** | `+3` | **Others / Custom** | `+0 to +3` |

#### D. Tech Level (`TL`) Wealth Modifiers

| Tech Level | Era | WS Modifier |
| :--- | :--- | :---: |
| **TL 0** | Stone Age (Primitive) | `-4` |
| **TL 1** | Metal Age (Industrial) | `-2` |
| **TL 2** | Data Age (Digital) | `+0` |
| **TL 3** | Space Age (Galactic Baseline) | `+2` |
| **TL 4** | Stellar Age (Enhanced) | `+4` |
| **TL 5** | Galactic Age (Advanced) | `+8` |

#### E. Skill Ranks in Trade & Vocations

* **Primary Vocation Skill:** Grants **+1 WS per Skill Stage** actively practiced to earn income:
  * **Novice (Ranks 1–5):** `+1 WS`
  * **Trained (Ranks 6–10):** `+2 WS`
  * **Expert (Ranks 11–15):** `+3 WS`
  * **Master (Ranks 16–19):** `+4 WS`
  * **Pinnacle (Rank 20+):** `+5 WS`
* **Associated Trade Skills:** One additional supporting skill at **Rank 6+ (Trained)** may be counted per Stage of the Primary Vocation skill, granting **+1 WS per associated skill**.
* **High-Value Profession Multipliers:**
  * **Expression (Performance) Skills:** Double (`x2`) the listed stage bonus when practiced professionally.
  * **Knowledge (Medicine — Practicing Physician):** Double (`x2`) the listed stage bonus (triple [`x3`] in high-demand scarcity sectors).
  * **Metafocus Discipline Skills:** Commercial metaphysical services pay double (`x2`) the listed stage bonus.
  * **Piloting & Combat Skills:** Standard (`x1`) to double (`x2`) bonus when regular mercenary, security, or transport employment is maintained.

### 3. The Golden Rule, Liquidity Gap & Financial Status Hierarchy

* **The Golden Rule of Tangent Wealth:** A character may automatically purchase any personal-use item with a Crafting CR equal to or less than their Wealth Score (`Purchase CR <= WS`) without depleting liquid Credits or reducing their baseline Wealth Score.
* **The Liquidity Gap (`Crafting CR > WS`):** When an item's Crafting CR exceeds the character's Wealth Score, the difference is `Liquidity Gap = Value(Item CR) - Value(Character WS)`, priced on the EUFT curve (`Value = 10 * 4^[CR/5] * Linear Micro-Modifier`). The character may either pay the Liquidity Gap in liquid Credits or roll a **Wealth Check (`2d10 + WS vs. Item Cost CR`)** to finance the gap as cycle debt (suffering a `-2 WS` delinquent debt penalty if unpaid at rollover).

| Wealth Score (WS) | Financial Status | CP Cost | Auto-Buy Limit | Est. Net Worth | Lifestyle Description |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **0** | **Indebted** | `-5 CP` *(Flaw)* | `0 Cr` | Negative | Debt slavery or prison. Zero assets; survival depends on others. |
| **1 – 4** | **Impoverished** | `0 CP` | `10 – 30 Cr` | `< 500 Cr` | Homeless or squatter. Scavenges for food and scrap. |
| **5 – 9** | **Struggling** | `2 CP` | `40 – 150 Cr` | `~2,000 Cr` | Shared room in a slum. Public transit; processed rations. |
| **10 – 14** | **Middle Class** | `5 CP` | `160 – 600 Cr` | `~25,000 Cr` | Private apartment, steady wage, consumer vehicle. |
| **15 – 19** | **Affluent** | `10 CP` | `640 – 2,500 Cr` | `~200,000 Cr` | High-end condo, quality personal vehicle, professional services. |
| **20 – 29** | **Wealthy** | `20 CP` | `2,500 – 40,000 Cr` | `~5 Million Cr` | Large estate, servants, minor corporate investor. |
| **30 – 39** | **Hegemon** | `35 CP` | `41K – 650K Cr` | `~100 Million Cr` | Skyscraper penthouse, owns small corporation, private shuttle. |
| **40 – 49** | **Industrialist** | `50 CP` | `650K – 10M Cr` | `~2 Billion Cr` | Megacorp executive, owns Corvettes, influences planetary law. |
| **50 – 59** | **Dynastic** | `70 CP` | `10M – 167M Cr` | `~50 Billion Cr` | Minor nobility or Megacorp CEO; owns stations and private fleets. |
| **60 – 69** | **System Lord** | `95 CP` | `167M – 2.6B Cr` | `~500 Billion Cr` | Rules a solar system; funds colonization; owns Cruisers. |
| **70 – 79** | **Sector Ruler** | `125 CP` | `2.6B – 42B Cr` | `~10 Trillion Cr` | Rules a star cluster; personal flagship is a Dreadnought. |
| **80+** | **Faction Ruler** | `160 CP` | `42B – 600B+ Cr` | `~1 Quadrillion Cr` | Sovereign Emperor; post-scarcity; builds Dyson-scale megastructures. |

### 4. Meta (Metaphysical Capabilities)

The **Meta** stage of character creation in Tangent (`1.06 METAPHYSICS.md`) focuses on developing the metaphysical capabilities of characters who have access to magic, psychic powers, or other supernatural abilities channeled through the Resonance:

* **Awakened Feature (`3 CP` Standard / `2 CP` Recommended):** This feature is a prerequisite for accessing Discipline skills, which govern the use of metaphysical abilities. The first purchase unlocks **Attune** (the universal activation skill for Meta Disciplines) plus one chosen Discipline and its two Focus Skills; each subsequent purchase unlocks an additional Discipline.
* **Discipline Skills (`1 CP` per Rank):** These skills represent specific areas of expertise within the metaphysical realm across the six canonical Schools and their twelve Focus Skills:
  1. **Dimension:** *Summoning* and *Teleport*
  2. **Energy:** *Elemental* and *Force*
  3. **Entropy:** *Chaos* and *Order*
  4. **Illusion:** *Phantasm* and *Shadow*
  5. **Matter:** *Enhancement* and *Transmutation*
  6. **Mental:** *Projection* and *Sense*
* **Invocations (`1 CP` per Rank):** These are specific codified skills or abilities within a chosen Discipline, representing spells, psychic techniques, or other supernatural manifestations. Invocations are treated as separate skills and can be improved independently.
* **Specialization or Special Ability (`1 CP` per Rank):** Invocations can be learned either as a **Specialization** within a Discipline Focus skill (allowing the caster to **Take 10** and adding the Invocation Rank to the check) or separately as a **Special Ability** Feature, with each rank costing **1 Character Point (CP)**.
* **Essence Pool:** `Essence Pool = (Sum of all 6 Attribute Scores) + Attune Skill Rank + Total Ranks in all known Discipline Focus Skills`.

#### Walkthrough Example: Xy'larra (Meta Summary)

> *Meta Features and Discipline Skills already known by Xy'larra as listed across her pipeline stages:*
> * *Discipline Feature of **Awakened** taken **3 times** (for the **Mental**, **Entropy**, and **Dimension** Disciplines).*
> * *Has access to the Discipline Focus skills of **Summoning** and **Teleport** (Dimension); **Projection** and **Sense** (Mental); **Chaos** and **Order** (Entropy); and **Attune** (the activation skill for Meta Disciplines).*
> * *Current starting Metaphysic skills: **Attune 5** and **Mental (Sense) 10**.*

Remember, character creation in Tangent is designed to be highly flexible, and these steps can be adapted to fit your character concept, preferences, and the Architect's campaign guidelines.

## DISCREPANCY & RESTORATION LEDGER

* **DISC-103A (Property, Wealth & Meta Unabridged Codex Restoration):** Restored all Codex `1.01 CHARACTER CREATION` prose and Xy'larra walkthrough examples for Property and Meta, combined with the full Starting Wealth Score calculation tables (`Occupation Base`, `Origin`, `Faction`, `Tech Level`, `Trade/Vocation Multipliers`) and the 12-Tier Financial Status Hierarchy.
* **DISC-103B (EUFT & Metaphysic School Alignment):** Linked Property acquisition to the canonical EUFT curve (`Value = 10 * 4^[CR/5]`), Golden Rule (`Item CR <= WS`), Liquidity Gap (`Value[Item CR] - Value[WS]`), and Armor Layering Cap, and mapped legacy school examples to the 6 canonical Metaphysic Disciplines (`Dimension`, `Energy`, `Entropy`, `Illusion`, `Matter`, `Mental`).

