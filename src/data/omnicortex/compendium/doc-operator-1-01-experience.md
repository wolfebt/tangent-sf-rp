---
id: "doc-operator-1-01-experience"
name: "1.01 Experience"
fileName: "1.01.Experience.md"
relPath: "operator/character_creation/1.01.Experience.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 13
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.experience","mechanics"]
updatedAt: "2026-11-04T00:33:10.518Z"
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

# 1.01.10 EXPERIENCE & ADVANCEMENT

* **Focus Statement:** Complete campaign progression rules for **Award Points (`1 AP = 1 CP`)**, the mandatory **`+1` Increment Rule**, **Story Awards (`Chapter Completion` & `Worthy Goals/Villains`)**, **Session Awards (`Focused on Game` & `Roleplaying in Character`)**, **Epic Actions (`1–5 AP`)**, and the **4-Tier Operator Power Scale Table (`150 CP` to `450+ CP`)**.

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

| Award Category / Tier | AP Grant / CP Threshold | Award Frequency | Primary Mechanical & Campaign Purpose |
| :--- | :---: | :--- | :--- |
| **Exchange Rate & Increment** | `1 AP = 1 CP` (`Max +1 / Award`) | Every Award | Spends AP 1-for-1 like CP; **strictly caps any single Attribute, Skill, or Trait at `+1` per award**. |
| **Story: Chapter Completion** | `5 to 10 AP` | End of Chapter / Arc | Rewards arc completion based on length and complexity; paired with campaign downtime. |
| **Story: Worthy Goal / Villain** | `1, 2, or 3 AP` | Per Villain / Plot Goal | Rewards defeating major antagonists or resolving critical sub-plots (`1` minor, `2` major, `3` arc). |
| **Session: Focused on Game** | `0, 1, or 2 AP` | Post-Session | Rewards constructive engagement with mechanics, tactics, puzzles, and squad teamwork. |
| **Session: Roleplaying** | `0, 1, or 2 AP` | Post-Session | Rewards embodying the Operator's personality, culture, hindrances, and interpersonal bonds. |
| **Ad-Hoc: Epic Actions** | `1 to 5 AP` | Immediate / Post-Scene | Rewards extraordinary heroism, brilliant lateral plans, or stumping the Architect. |
| **Tier 1: Operative** | `150 – 199 CP` | Starting Campaign Tier | Trained specialists (`Rank 6–10`) handling localized planetary, station, or shipboard crises. |
| **Tier 2: Tactical** | `200 – 299 CP` | Veteran Campaign Tier | Expert strike teams (`Rank 11–15`) shaping planetary politics and system-wide conflicts. |
| **Tier 3: Strategic** | `300 – 449 CP` | Master Campaign Tier | Sector champions (`Rank 16–20`) altering the balance of power across star clusters. |
| **Tier 4: Mythic** | `450+ CP` | Paragon Campaign Tier | Galactic paragons (`Rank 21–30`) confronting existential and cosmic-scale threats. |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Award Points (`AP`), Exchange Rate & The Increment Rule

**Award Points (`AP`)** are awarded for the outstanding actions and achievements of characters and their players during the game. These points serve as a way to recognize and reward exceptional gameplay, encouraging players to engage in creative and immersive role-playing experiences.

These points are spent in the exact same manner as **Character Points (`CP`)** in character creation, on a **1-for-1 basis (`1 AP = 1 CP`)**, except that **Abilities, Skills, or other Traits may ONLY HAVE A `+1` POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD**:

* **Standard Award Pacing:** `1 to 3 Award Points (AP)` per Session based on pacing and achievements, plus Story Awards at chapter conclusions.
* **Exchange Rate (`1 AP = 1 CP`):**
  * **Attribute Score Increase (`+1`):** `5 AP`
  * **Vitality or Health Pool Increase (`+5` points):** `1 AP`
  * **Feature Purchase:** `3 AP` Standard / `2 AP` Recommended (`1 AP` minimum)
  * **Skill Rank Increase (`+1`):** `1 AP`
  * **Additional Origin / Occupation Trait:** `1 AP`
  * **Independent Attribute Save Bonus (`+1`):** `1 AP`
* **The Increment Rule (CRITICAL):** AP can be spent exactly like CP during creation, but **Abilities, Skills, or Traits may only be increased by `1` point per Experience Award** (and Vitality/Health by a single `+5` increment per award). A player cannot hoard and dump `10 AP` into a single skill instantly.

### 2. Story Awards (Chapter & Arc Milestones)

#### A. Chapter Completion (`5 to 10 AP`)

* **Award:** **5 to 10 AP** (based on the steps and the level of complexity involved, with longer and more complex chapters awarding more points).
* **Description:** This award is given when a chapter or major story arc is completed. It acknowledges the players' progress in the narrative and provides an opportunity for character development and reflection during downtime. This is a major story transition and typically marks a downtime period for the characters.

#### B. Overcoming Each Worthy Goal, Villain, or Plot (`1, 2, or 3 AP`)

* **Award:** **1, 2, or 3 AP** (depending on the level of difficulty; these are storyline elements, but may be awarded by session).
* **Description:** This award recognizes players' achievements in overcoming significant obstacles, defeating powerful villains, or unraveling complex plots. It highlights the importance of character growth and the resolution of conflicts.
* **Example:** For example, the Architect might award **5 AP** at the end of a short chapter for its completion and **2 AP** for defeating a major villain, which can be awarded at the chapter's end or at the end of individual sessions depending on the number of villains the Architect sends.

### 3. Session Awards (Post-Session Performance)

#### A. Proper Game Session & Focused on Game (`0, 1, or 2 AP`)

* **Award:** **0, 1, or 2 AP**.
* **Description:** This award recognizes players who approach the game with a constructive focus on gameplay mechanics and strategy. It encourages players to engage actively in combat encounters, puzzles, and other game-related challenges.

#### B. Roleplaying in Character (`0, 1, or 2 AP`)

* **Award:** **0, 1, or 2 AP**.
* **Description:** This award is given to players who immerse themselves in their characters' personalities and motivations, actively embodying them during roleplaying interactions. It encourages players to develop their characters' backstories and explore their relationships with other characters.
* **Example:** For instance, a player might receive **2 AP** for strategically leading the party in battle and **1 AP** for a memorable roleplaying interaction. These points are awarded once each post-session regardless of overall story progression.

### 4. Epic Actions, Good Ideas & Stumping the Architect (`1 to 5 AP`)

* **Award:** **1 to 5 AP** (Ad-hoc award determined by the Architect based on each situation; may be granted as a Session Award or Scenario Award).
* **Description:** These awards are given for exceptional moments during gameplay, such as epic actions that turn the tide of battle, creative solutions to complex problems, or surprising the Architect with unexpected twists. They encourage players to think outside the box and bring their imaginations to life.
* **Example:** For example, a player comes up with a complicated, ingenious idea that saves the city, the party, and the plot while making the Architect figure out how to adjudicate the rolls on the fly. Consider granting the character **5 AP** right after the dust settles. It happens!

The number of Award Points awarded may vary depending on the campaign and the desired pace of character progression. The experience system is designed to enhance the gaming experience by incentivizing players to engage in meaningful and immersive gameplay. By rewarding players for their efforts, the system fosters a sense of accomplishment and encourages players to continue exploring the Tangent universe.

### 5. The Power Scale Table (Operator Tiers by Total CP)

| Power Tier | Tier Designation | Total Character Points (CP) | Operational Scope & Narrative Benchmark |
| :---: | :--- | :---: | :--- |
| **Tier 1** | **Operative** | **150 – 199 CP** | **Starting Competence (`Trained / Rank 6–10`):** Proven specialists, frontier mercenaries, covert agents, and starship crews handling localized planetary or station crises. |
| **Tier 2** | **Tactical** | **200 – 299 CP** | **Veteran Mastery (`Expert / Rank 11–15`):** Elite strike teams, syndicate fixers, and knight-errants whose actions shape planetary politics and system-wide conflicts. |
| **Tier 3** | **Strategic** | **300 – 449 CP** | **Sector Champions (`Master / Rank 16–20`):** Legendary commanders, arch-savants, and high inquisitors capable of altering the balance of power across entire star clusters. |
| **Tier 4** | **Mythic** | **450+ CP** | **Galactic Paragons (`Grand Master to Pinnacle / Rank 21–30`):** Reality-shaping exemplars, sovereign rulers, and cosmic avatars confronting existential threats to the galaxy. |

## DISCREPANCY & RESTORATION LEDGER

* **DISC-110A (Unabridged Codex Experience Prose & Examples Restoration):** Restored 100% of the Codex `1.01 CHARACTER CREATION` prose (`lines 1200–1253`) covering Award Points, the `+1` Increment Rule, Story Awards, Session Awards, Epic Actions, and all worked examples, paired with the 4-Tier Power Scale Table (`Tier 1 Operative` through `Tier 4 Mythic`).
* **DISC-110B (CP Currency Normalization):** Normalized `1 AP = 1 Character Point (CP)` across all progression formulas.

