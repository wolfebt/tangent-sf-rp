# **0.08 2d10 RESOLUTION SYSTEM**

## **Tangent Science Fantasy Role Playing System — Core Mechanics & Probability Analysis**

* **Document Status:** Canonical Reference — Aligned with `docs/game_rules/00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md` (Nov 2026)
* **Mechanical Authority:** 2d10 Bell-Curve Resolution, Challenge Rating (CR) Ladder, Expanding d10 Pool Advantage/Disadvantage, and Deterministic Critical/Fumble Math.

---

## **I. The Core Resolution Engine**

In the **Tangent Science Fantasy Role Playing System**, all active tests, skill checks, opposed contests, saving throws, and combat attack rolls are resolved using a **2d10 bell-curve resolution engine**.

Moving away from flat, swingy linear dice, Tangent utilizes two ten-sided dice (`2d10`) to produce a predictable triangular probability curve centered at **11.0**. This mathematically ensures that an Operator's training, skill ranks, and physical or mental attributes reliably dictate their performance, while still preserving the tension and drama of chance.

### **1. The Standard Check Formula**

To resolve any check in Tangent, roll two ten-sided dice (`2d10`), add the Operator's relevant Skill Rank, their governing Attribute Modifier, and any situational or equipment modifiers:

```text
Check Total = 2d10 + Skill Rank + Attribute Modifier + Situational Modifiers
```

* **Skill Rank:** The Operator's direct training in the task (`0` Untrained to `30` Pinnacle+).
* **Attribute Modifier:** The governing physical or mental score (`-5` to `+10` across `STR`, `AGI`, `STA`, `INT`, `WIS`, `CHA`).
* **Situational Modifiers:** Gear bonuses, environmental cover, range penalties, or tactical conditions (ad-hoc modifiers clamped to `[-20, +20]` in the VTT Dice Engine).

### **2. Active & Passive Saving Throws**

Saving throws use a dedicated attribute-driven resolution formula across the six canonical defenses (**Might** [`STR`], **Reflex** [`AGI`], **Fortitude** [`STA`], **Reason** [`INT`], **Willpower** [`WIS`], and **Etiquette** [`CHA`]):

```text
Active Save = 2d10 + 2 + (2 * Attribute Modifier) + Feature Bonus
Passive Save CR = 12 + (2 * Attribute Modifier) + Feature Bonus
```

### **3. Challenge Ratings (CR)**

The final Check Total is compared to a static **Challenge Rating (CR)** set by the Architect (or opposed target Defense in combat):

```text
Success Condition: Check Total >= Target CR (or Defense)
```

| Difficulty Category | Target CR | Example Task Description |
| :--- | :---: | :--- |
| **Simple / Scrap** | **CR 0** | Routine action under zero stress; unhurried operation of standard civilian tech. |
| **Routine** | **CR 5** | Driving an automated land-speeder along a paved hyperlane; everyday professional task. |
| **Challenging** | **CR 10** | Standard operational task under field conditions; picking a standard commercial mag-lock. |
| **Hard** | **CR 15** | Bypassing hardened military encryption; stabilizing a dying Operator during combat (`CR 15 Medicine`). |
| **Severe** | **CR 20** | Performing evasive starship maneuvers through a dense asteroid field under heavy fire. |
| **Heroic** | **CR 25** | Hacking a high-security Syndicate central AI core; repairing a breached reactor core in vacuum. |
| **Epic** | **CR 30** | Decrypting Progenitor cosmic monolith protocols; landing a burning dreadnought without thrusters. |
| **Miraculous / Transcendent** | **CR 35 – 50+** | Feats bordering on reality-bending intervention; piercing ancient dimensional gateways. |

### **4. Degrees of Outcome & Margin of Success (MoS)**

Success in Tangent is not purely binary. The **Margin of Success (MoS)** determines the quality, speed, and narrative impact of the action:

```text
Margin of Success (MoS) = Check Total - Target CR
```

* **Critical Success (`Natural 20` or Expanded Threat Range `19`, `18`):** Rolling double-10s on `2d10` (or hitting an expanded threat threshold). Applies `Rolled Dice + 10` to the check score (e.g., `20 -> 30`, `19 -> 29`), plus `2x Base Weapon Damage Dice` and any applicable `Weapon/Elemental Critical Effect` in combat, or exceptional narrative triumph on skill checks.
* **Overwhelming Success (`MoS >= +10`):** The Operator surpasses the challenge with consummate mastery. Unlocks bonus tactical advantages, halves required task time, or preserves consumable resources.
* **Standard Success (`MoS 0 to +9`):** The action accomplishes its intended goal cleanly.
* **Standard Failure (`MoS -1 to -9`):** The action fails to achieve the objective, or achieves it with a complication or setback.
* **Catastrophic Failure (`MoS <= -10`):** The attempt fails disastrously. Triggers structural damage, alarms, or severe tactical vulnerability.
* **Critical Failure / Fumble (`Natural 2` or Expanded Fumble Range `3`, `4`):** Rolling double-1s on `2d10`. The rolled dice value becomes a **flat `-10` penalty** (`Base Score - 10`), accompanied by a **Situational Complication** (e.g., weapon jam, dropped equipment, or granting enemies an immediate reaction).

### **5. "Taking 10" (Passive Competence)**

In non-threatening, low-stress environments where an Operator can focus without distraction, they may elect to **Take 10** instead of rolling `2d10`:

```text
Passive Skill Check = 10 + Skill Rank + Attribute Modifier
```

This guarantees consistent competence for trained Operators performing routine field duties, whileDowntime Fabrication and Productivity checks compute daily output as `Daily PP = (Craft Check - 10) * Tool Tier Multiplier * Crew Size`.

---

## **II. Mathematical Probability Analysis: 2d10 vs. Linear Dice**

Using two ten-sided dice (`2d10`) rather than a single twenty-sided linear die fundamentally transforms table resolution from a **flat uniform distribution** to a **triangular bell curve**.

### **1. Single-Die Linear Baseline (Reference)**
On a flat 1–20 linear distribution, every outcome has an identical 5% probability:
* **Total Outcomes:** `20`
* **Average Roll:** `10.5`
* **Chance of any specific number:** `5.0%`

### **2. 2d10: The Triangular Probability Breakdown**
When rolling `2d10`, there are `100` possible ordered pairs (`10 * 10`). Because multiple pairs sum to the central values, results cluster reliably around **11.0**:
* **Total Combinations:** `100`
* **Average Roll:** `11.0`
* **Minimum Roll:** `2` (Rolling a `1` is impossible)

| Roll Total | Combinations | Example Pairs | Percentage Chance | Cumulative Chance (`Roll >= X`) |
| :---: | :---: | :--- | :---: | :---: |
| **2** | 1 | (1,1) | **1%** | **100%** |
| **3** | 2 | (1,2), (2,1) | **2%** | **99%** |
| **4** | 3 | (1,3), (2,2), (3,1) | **3%** | **97%** |
| **5** | 4 | (1,4), (2,3), etc. | **4%** | **94%** |
| **6** | 5 | (1,5), (2,4), etc. | **5%** | **90%** |
| **7** | 6 | (1,6), (2,5), etc. | **6%** | **85%** |
| **8** | 7 | (1,7), (2,6), etc. | **7%** | **79%** |
| **9** | 8 | (1,8), (2,7), etc. | **8%** | **72%** |
| **10** | 9 | (1,9), (2,8), etc. | **9%** | **64%** |
| **11** | 10 | (1,10), (2,9), etc. | **10%** | **55%** |
| **12** | 9 | (2,10), (3,9), etc. | **9%** | **45%** |
| **13** | 8 | (3,10), (4,9), etc. | **8%** | **36%** |
| **14** | 7 | (4,10), (5,9), etc. | **7%** | **28%** |
| **15** | 6 | (5,10), (6,9), etc. | **6%** | **21%** |
| **16** | 5 | (6,10), (7,9), etc. | **5%** | **15%** |
| **17** | 4 | (7,10), (8,9), etc. | **4%** | **10%** |
| **18** | 3 | (8,10), (9,9), (10,8) | **3%** | **6%** |
| **19** | 2 | (9,10), (10,9) | **2%** | **3%** |
| **20** | 1 | (10,10) | **1%** | **1%** |

---

## **III. TTRPG Game Design Implications**

### **1. The Outsized Impact of Modifiers**
In a linear system, a `+1` modifier always represents a flat **+5%** increase in success probability regardless of target CR.

On the `2d10` bell curve, the value of a modifier depends on where the required roll sits on the curve. A modifier that shifts an Operator across the central peak (`9` to `13`) yields nearly double the probability gain of a linear die:

| Base Roll Needed on 2d10 | Chance (`2d10`) | Chance with `+1` | Net % Gain | Linear Equivalent Gain |
| :---: | :---: | :---: | :---: | :---: |
| **18 (Hard)** | 6% | 10% | **+4%** | *Lower (+5%)* |
| **15 (Moderate-Hard)** | 21% | 28% | **+7%** | **Higher (+5%)** |
| **11 (Average)** | 55% | 64% | **+9%** | **Nearly Double (+5%)** |
| **8 (Routine)** | 79% | 85% | **+6%** | **Higher (+5%)** |

**Modifiers act as anchors for consistency:**
A `+2` or `+3` modifier in a `2d10` game makes an Operator *exceptionally reliable* at standard tasks (yielding `+15%` to `+20%` swings in success rates) because it capitalizes on the densest region of the distribution. Conversely, overcoming high Challenge Ratings (`CR 20+`) requires genuine investment in Skill Ranks, Attributes, and gear rather than lucky dice spikes.

---

### **2. Criticals and Fumbles: The 2 / 20 Baseline**
In the Tangent `2d10` framework, rolling the natural extremes—a **2** or a **20**—serves as the strict baseline for fumbles and criticals, occurring **1% of the time** (`1 in 100` rolls). Rather than automatic hits or misses that ignore total modifiers, these extremes apply deterministic score shifts plus tactical effects:

* **Critical Hit (`Natural 20`):** `Rolled Dice + 10` (`20 -> 30`) + `2x Base Weapon Damage Dice` + `Weapon/Elemental Critical Effect` (or `Precision Strike` multiplier up to `4x` when feature-gated).
* **Fumble (`Natural 2`):** `Rolled Dice becomes flat -10` (`Base Score - 10`) + `Situational Complication`.

#### **The Constraint on Threat Range Expansion**
Because the triangular distribution widens rapidly toward `11`, features or weapon properties that expand the critical threat range (`19–20`, `18–20`) scale non-linearly:

| Range Expansion | Fumble Range | Crit Range | Probability Chance | Rate Comparison |
| :---: | :---: | :---: | :---: | :--- |
| **Base (1 point)** | `2` | `20` | **1%** | *Rare (1 in 100)* |
| **2 points** | `2 to 3` | `19 to 20` | **3%** | *Controlled (3 in 100)* |
| **3 points** | `2 to 4` | `18 to 20` | **6%** | **Standard High-Crit Ceiling (6%)** |
| **4 points** | `2 to 5` | `17 to 20` | **10%** | *Extreme (10%)* |
| **5 points** | `2 to 6` | `16 to 20` | **15%** | *Uncapped Danger Zone (15%)* |

Per **BASTION Rule 04**, expanded threat ranges (`19`, `18`) always use the exact `Rolled Dice + 10` formula (`19 -> 29`, `18 -> 28`) and are strictly capped to preserve mathematical equilibrium.

---

### **3. The Death of the "Swingy" Game**
Because **64% of all `2d10` rolls land between `8` and `14`**, Operators feel genuinely competent in their core specialties. A trained Operator (`Rank 6` from the `80-CP Archetype Chassis`) will reliably clear field checks in their domain, while high-CR threats remain formidable barriers that reward tactical preparation, teamwork, and equipment synergy.

---

### **4. Advantage and Disadvantage: The Expanding d10 Pool**
Per **BASTION Rule 03**, Tangent utilizes **Dice Pool Expansion**: rolling `+1d10` per stack of Advantage (keeping the **highest 2 dice**) or `+1d10` per stack of Disadvantage (keeping the **lowest 2 dice**). Opposing stacks of Advantage and Disadvantage cancel `1-for-1` before rolling.

#### **The Mathematical Shift**
* **Base `2d10` Average:** `11.0`
* **Advantage (`3d10kh2`, Keep Highest 2):** Average shifts to **`13.5`** (`+2.5` bonus equivalent)
* **Disadvantage (`3d10kl2`, Keep Lowest 2):** Average drops to **`8.5`** (`-2.5` penalty equivalent)

#### **Stacking Advantage and Disadvantage (`+1` to `+5` Extra Dice)**
When tactical conditions stack multiple net sources of Advantage or Disadvantage, the pool expands up to `+5` extra dice (`7d10` keep 2):

##### **Advantage Stacking (`Roll (2 + N)d10`, Keep Highest 2):**
| Dice Pool | State | Average Roll | Fumble (`2`) Chance | Critical (`20`) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | `11.0` | `1.00%` | `1.00%` |
| **3d10kh2** | +1 Advantage | `~13.5` | `0.10%` | `2.80%` |
| **4d10kh2** | +2 Advantage | `~14.9` | `0.01%` | `5.23%` |
| **5d10kh2** | +3 Advantage | `~15.8` | `< 0.01%` | `8.15%` |
| **6d10kh2** | +4 Advantage | `~16.5` | `< 0.01%` | `11.43%` |
| **7d10kh2** | +5 Advantage | `~17.0` | `< 0.01%` | `14.97%` |

##### **Disadvantage Stacking (`Roll (2 + N)d10`, Keep Lowest 2):**
| Dice Pool | State | Average Roll | Fumble (`2`) Chance | Critical (`20`) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | `11.0` | `1.00%` | `1.00%` |
| **3d10kl2** | +1 Disadvantage | `~8.5` | `2.80%` | `0.10%` |
| **4d10kl2** | +2 Disadvantage | `~7.1` | `5.23%` | `0.01%` |
| **5d10kl2** | +3 Disadvantage | `~6.2` | `8.15%` | `< 0.01%` |
| **6d10kl2** | +4 Disadvantage | `~5.5` | `11.43%` | `< 0.01%` |
| **7d10kl2** | +5 Disadvantage | `~5.0` | `14.97%` | `< 0.01%` |

**Summary & Operational Takeaway:**
The expanding dice pool mechanic (`+Nd10` keep highest/lowest 2) rewards tactical positioning, ambush, and preparation. It virtually eliminates catastrophic fumbles when Operators hold the tactical high ground (`0.10%` at `+1 Advantage`, `< 0.01%` at `+3 Advantage`), while allowing coordinated teams to reliably generate critical triumphs.
