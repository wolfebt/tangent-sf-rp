---
id: "doc-operator-1-01-vitalityhealthstructure"
name: "1.01 Vitality, Health & Structure"
fileName: "1.01.VitalityHealthStructure.md"
relPath: "operator/character_creation/1.01.VitalityHealthStructure.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 9
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.vitalityhealthstructure","mechanics"]
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

# 1.01.06 VITALITY, HEALTH & STRUCTURE

* **Focus Statement:** Canonical integrity pool rules establishing **Base 30 Vitality** and **Base 30 Health** for biological characters (**Base 60 Structure Points [SP]** for Synthetics/Constructs), strict `+5 points per 1 CP` progression, **Zero Stamina Pool Scaling**, **Stamina Modifier as Base Toughness**, and the **50/50 Concussive Damage Split**.

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

| Integrity Pool / Rule | Starting Base (`0 CP`) | CP Purchase Rate | Suggested Starting Max | Core Mechanical Behavior |
| :--- | :---: | :---: | :---: | :--- |
| **Vitality** *(Biological)* | **30 Vitality** | `+5 Vitality` per `1 CP` | **60 Vitality** *(6 CP)* | Non-lethal buffer absorbing grazing hits, fatigue, and physical stress; depletes before Health. |
| **Health** *(Biological)* | **30 Health** | `+5 Health` per `1 CP` | **60 Health** *(6 CP)* | Physical body and life force; takes overflow damage at `0 Vitality` and Critical Hits. At `0 Health`, enters Mortality State. |
| **Structure (`SP`)** *(Synthetics / Constructs)* | **60 SP** *(Vit + Hea)* | `+5 SP` per `1 CP` | **120 SP** *(12 CP)* | Combined structural integrity pool (`SP = Vitality + Health`) for Synthetics, FBCs, constructs, oozes, and undead. |
| **Stamina Base Toughness** | `STA Modifier` | `+5 CP` per `+1 STA` | Species / Creation Cap | Reduces wound damage **point-for-point** after single-domain Armor DR. **NEVER adds to Vitality or Health.** |
| **Concussive Damage** | `50% Vit / 50% Hea` | — | — | Falls, explosions, and crashes divide net damage equally (`50/50`) between Vitality and Health when mitigated. |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Overview & The Role of the Stamina Score (Base Toughness)

In Tangent, a character's ability to endure and recover from damage is represented by **Vitality** and **Health** (or **Structure Points [SP]** for Synthetics and others with non-typical physiology). Each of these pools plays a crucial role in determining how much damage a character can sustain and how they recover from injuries.

* **Stamina Score (Base Toughness & Zero Stamina Pool Scaling):** While the **Stamina (`STA`)** Ability Score **does not directly grant extra Vitality or Health points under any circumstance**, it determines the character's **Base Toughness** to reduce the damage taken from wounds, **point-for-point** (subtracted after Armor Damage Resistance [`DR`]), making high-Stamina characters more resilient overall. Stamina also governs **Fortitude Saving Throws** and sets the character's Mortality State **Stability Points (`Stamina Score + 5`)**.

### 2. Starting Values, CP Progression & Maximums

* **Starting Values and Maximums (`Base 30 + 5 per 1 CP`):** Biological characters begin with a flat base of **30 points in both Vitality and Health** at `0 CP`. These pools can be increased strictly by spending **Character Points (CP)** during character creation or advancement at a rate of **+5 points in either Vitality or Health for 1 CP** (`+5 Vitality = 1 CP`; `+5 Health = 1 CP`), with a suggested starting maximum of **60 points each** (`6 CP` invested in Vitality and `6 CP` in Health).
* **Structure Calculation (`Base 60 SP + 5 SP per 1 CP`):** Structure is calculated by combining the character's Vitality and Health (`SP = Vitality + Health`, starting at **Base 60 SP** and increasing by **+5 SP per 1 CP**, with a suggested starting maximum of **120 SP**) for characters with non-typical anatomy such as Synthetics, Full Body Conversions (`FBCs`), Constructs, Elementals, Golems, Oozes, and Undead.

### 3. Falling Damage, Explosions & Crashes (Concussive Damage)

**Concussive Damage** is unique in that it is heavily traumatic yet dispersed over the entire body:

* **The 50/50 Concussive Split:** Concussive damage is **divided equally (`50/50`) between Vitality and Health** if the character actively attempts to reduce or evade the damage (such as rolling a Reflex Save, Acrobatics check, or Piloting check), regardless of whether the attempt is successful or fails. This reflects the simultaneous potential for both non-lethal shock/bruising and lethal internal injuries from falls, explosions, vehicular crashes, and blast overpressure.
* **Secondary Impact Hazards:** This `50/50` split applies strictly to the concussive force itself and **does not include** any additional localized damage taken from what the character may fall into or strike—such as impaling spikes, jagged debris, acid, or molten lava—which are resolved normally.

### 4. Pool Definitions

#### A. Vitality (`Base 30 + 5 per 1 CP`)

This pool represents a character's overall physical resilience, luck, reflexes, and ability to withstand non-lethal damage. It acts as a primary buffer, absorbing damage from sources like pummeling, grazing strikes, falls, environmental hazards, and other forms of harm that are not immediately life-threatening. Vitality is also depleted by exhaustion, movement fatigue, and other forms of physical stress. Only when a character's **Vitality is completely depleted (`0`)** does subsequent damage overflow and start to affect their **Health** (except on Critical Hits or effects that explicitly bypass Vitality).
* **Starting Score:** **30 Vitality**, increased strictly by **+5 points per 1 CP** (never scaled by Stamina).

#### B. Health (`Base 30 + 5 per 1 CP`)

This pool represents a character's physical body, structural tissues, life force, and ability to survive lethal attacks. Damage to Health comes from overflow trauma after Vitality is depleted, Critical Hits (`Natural 20`), severe localized injuries, and other sources that directly threaten a character's life. When a character's **Health reaches zero (`0`)**, they fall unconscious/incapacitated and enter the **Mortality State** (`1.01.RestAndDying.md`).
* **Starting Score:** **30 Health**, increased strictly by **+5 points per 1 CP** (never scaled by Stamina).

#### C. Structure (`Base 60 SP + 5 SP per 1 CP`)

This pool applies to inanimate objects, vehicles, mecha, constructs, and creatures with non-standard anatomies, such as **Synthetics, Full Body Conversions (`FBCs`), mecha, elementals, golems, oozes, and undead**. It measures their structural integrity and functions similarly to Health, but without a separate Vitality buffer. Damage to Structure can impair subsystem functionality, reduce operational effectiveness at `50% SP`, or ultimately lead to total destruction at `0 SP`.
* **Starting Score:** Calculate the character's Vitality and Health scores and combine them for their **Structure Score (`Base 60 SP`, increased by `+5 SP per 1 CP`)**.

## DISCREPANCY & RESTORATION LEDGER

* **DISC-106A (Unabridged Codex Pool & Concussive Damage Prose Restoration):** Restored the complete Codex `1.01 CHARACTER CREATION` text (`lines 737–765`) covering Stamina Score (Base Toughness), Starting Values and Maximums, Falling Damage/Explosions/Crashes (Concussive Damage), Vitality, Health, and Structure.
* **DISC-106B (Zero Stamina Scaling & CP Currency Enforcement):** Enforced `Base 30 Vitality / 30 Health` (`Base 60 SP`) scaled exclusively at `+5 points per 1 CP` with Zero Stamina Pool Scaling (`Stamina Mod = Base Toughness`).

