---
id: "doc-operator-1-01-perception"
name: "1.01 Perception"
fileName: "1.01.Perception.md"
relPath: "operator/character_creation/1.01.Perception.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 8
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.perception","mechanics"]
updatedAt: "2026-11-04T00:33:10.523Z"
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

# 1.01.05 PERCEPTION & DETECTION

* **Focus Statement:** Complete rules for the derived **Perception Base Score (`INT + WIS`)**, the default **Alertness** detection roll, the three Focused Perception modalities (**Meta [`Attune`]**, **Social [`Insight`]**, **Technical [`Knowledge (Technology)`]**), and environmental detection modifiers.

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

| Perception Mode | Governing Skill | Active Roll Formula | Passive Detection Threshold | Primary Observational Domain |
| :--- | :--- | :--- | :--- | :--- |
| **Default Detection** | **Alertness** | `2d10 + (INT + WIS) + Alertness + Mods` | `10 + (INT + WIS) + Alertness` | General environmental awareness, spotting traps, ambushes, and sensory cues. |
| **Meta Perception** | **Attune** | `2d10 + (INT + WIS) + Attune + Mods` | `10 + (INT + WIS) + Attune` | Detecting Resonance phenomena, arcane weaves, psionic activity, and dimensional rifts. |
| **Social Perception** | **Insight** | `2d10 + (INT + WIS) + Insight + Mods` | `10 + (INT + WIS) + Insight` | Reading body language, vocal cadence, emotional subtext, hidden motives, and lies. |
| **Technical Perception** | **Knowledge (Technology)** | `2d10 + (INT + WIS) + Knowledge (Tech) + Mods` | `10 + (INT + WIS) + Knowledge (Tech)` | Analyzing machinery, electronics, structural weak points, and technological sensors. |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Perception Base Score (`INT + WIS`)

**Perception** is a sub-ability derived from a character's **Intellect (`INT`)** and **Wisdom (`WIS`)** scores. This attribute reflects a character's overall alertness and their ability to perceive and interpret their surroundings. It plays a vital role in various detection checks throughout the game, impacting a character's ability to notice details, spot hidden dangers, and understand the subtleties of their environment.

```text
Perception Base Score = Intellect Score (INT) + Wisdom Score (WIS)
```

The base score for Perception is calculated by adding the character's Intellect and Wisdom scores together. This combined value represents their innate sensory acuity, mental focus, and intuitive alertness. However, Perception is not used in isolation. In most situations, it is combined with specific skills to determine a character's success in different types of detection checks.

### 2. Default Detection Check (`Alertness`)

In most standard situations, where a character is simply trying to be aware of their surroundings and notice anything out of the ordinary, their **Perception Base Score (`INT + WIS`)** is combined with their **Alertness** skill:

```text
Active Detection Check = 2d10 + Perception Base (INT + WIS) + Alertness Skill Rank + Modifiers vs. CR (or Opposed Stealth)
Passive Perception CR  = 10 + Perception Base (INT + WIS) + Alertness Skill Rank
```

This represents general environmental alertness and the ability to spot visual, auditory, olfactory, or tactile sensory cues that indicate something important, concealed, or unusual.

### 3. Focused Perception Types

There are three additional, more specialized types of Perception checks that are used in specific situations:

* **Meta (`Attune`):** When dealing with Meta effects (such as magic, psychic powers, or other supernatural Resonance phenomena), the **Attune** skill is added to the **Perception Base Score (`INT + WIS`)**. This allows the character to detect and analyze these subtle energies, and utilize Metafocus-based sensory abilities.
* **Social (`Insight`):** When trying to "read" other characters and understand their intentions, the **Insight** skill is added to the **Perception Base Score (`INT + WIS`)**. This represents the ability to pick up on subtle social cues, micro-expressions, body language, and vocal tones to discern hidden emotions, motivations, and potential deceptions (typically opposed by the target's `Bluff` check).
* **Technical (`Knowledge [Technology]`):** When analyzing technology or using certain technological sensory devices and diagnostic arrays, the **Knowledge (Technology)** skill is added to the **Perception Base Score (`INT + WIS`)**. This reflects the character's understanding of how technology works and their ability to better identify its functions, strengths, and weaknesses.

### 4. Environmental & Situational Modifiers

The Architect may apply additional modifiers to Perception checks based on the specific circumstances of the situation. These modifiers reflect factors such as visibility, distance, ambient interference, the nature of the thing being detected, and any other relevant environmental or situational factors:

* **Distance:** `-1` penalty per `10 feet` of distance (or per sensor range increment in vehicular/starship scanning).
* **Dim Light / Partial Concealment:** `-2` to `-5` penalty on visual detection checks (mitigated or negated by *Low-Light Vision* or *Darksight*).
* **Total Darkness / Blinded:** Visual checks fail automatically unless the character possesses *Darksight*, *Blindsight*, *Echolocation*, or *Thermal Sight*.
* **Distracted / Focused Task:** `-5` penalty to passive and active checks while absorbed in a demanding Focused Task (`1.07.Mechanics.TimeAndFocus.md`).

#### Walkthrough Example: Multi-Modal Perception

> *A character with an **Intellect score of `+2`** and a **Wisdom score of `+1`** has a **Perception Base Score of `+3`** (`2 + 1 = +3`):*
> * *If they are trying to notice a hidden mechanical trap, they make an **Alertness** check with a base modifier of **`+3 + Alertness Rank`**.*
> * *However, if they are trying to locate an item using magical/metaphysical means, they make an **Attune** check with a base modifier of **`+3 + Attune Rank`** instead.*
> * *Similarly, a check for reading a tense social situation adds `+3` to **Insight** (`+3 + Insight Rank`), while checks for analyzing unfamiliar technology or sensor readings add `+3` to **Knowledge (Technology)** (`+3 + Knowledge [Technology] Rank`).*

## DISCREPANCY & RESTORATION LEDGER

* **DISC-105A (Unabridged Codex Perception Prose & Multi-Modal Example Restoration):** Restored the complete Codex `1.01 CHARACTER CREATION` prose for Perception (`lines 700–736`), Default Detection (`Alertness`), Focused Perception Types (`Attune`, `Insight`, `Knowledge [Technology]`), and the worked `+2 INT / +1 WIS` example.
* **DISC-105B (Active & Passive 2d10 Formula Standardization):** Standardized the Active Detection Roll (`2d10 + [INT + WIS] + Skill Rank + Mods vs. CR`) and Passive Perception threshold (`10 + [INT + WIS] + Skill Rank`).

