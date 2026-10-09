---
id: "0-08-2d10-resolution-system"
name: "0.08 2d10 Resolution System & Probability Mechanics"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 8
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-0","resolution-system","2d10","core-rules","probability"]
updatedAt: "2026-10-09T08:18:00.000Z"
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

# 0.08 2d10 Resolution System & Probability Mechanics

The **Tangent Science Fantasy Role Playing System** resolves all active checks, skill tests, opposed contests, and combat attack rolls using a **2d10 triangular probability bell curve**.

---

## I. The Core Check Formula

$$\mathbf{Check\ Total = 2d10 + Skill\ Rank + Attribute\ Modifier + Situational\ Modifiers}$$

* **Skill Rank:** Trained skill expertise (Rank 0 Untrained to 30 Pinnacle+).
* **Attribute Modifier:** Physical or mental governing ability score (-5 to +10).
* **Situational Modifiers:** Gear bonuses, environmental cover, range penalties, or tactical conditions.

Success is determined against a target **Challenge Rating (CR)** or **Defense**:

$$\mathbf{Success\ Condition:\ Check\ Total \ge Target\ CR\ (or\ Defense)}$$

---

## II. Target Difficulty Classes (Challenge Ratings)

| Difficulty | Target CR | Operational Context |
| :--- | :---: | :--- |
| **Simple** | **CR 0** | Zero-stress routine action; basic civilian operation. |
| **Routine** | **CR 5** | Highway vehicle operation; everyday professional task. |
| **Challenging** | **CR 10** | Standard operational field task; picking a commercial mag-lock. |
| **Hard** | **CR 15** | Bypassing hardened military encryption; emergency field surgery. |
| **Severe** | **CR 20** | Evasive starship piloting through an active asteroid field under fire. |
| **Heroic** | **CR 25** | Breaching an air-gapped Megacorp AI mainframe; stabilizing a blown reactor. |
| **Epic** | **CR 30** | Deciphering ancient precursor stargate protocols; dead-stick dreadnought atmospheric landing. |
| **Miraculous** | **CR 35+** | Deific or reality-bending intervention; sealing cosmic dimensional rifts. |

---

## III. Degrees of Success & Margin of Success (MoS)

$$\mathbf{Margin\ of\ Success\ (MoS) = Check\ Total - Target\ CR}$$

* **Critical Success (Natural 20):** Rolling two 10s. Regardless of baseline DC, adds an automatic **+10 bonus** to the total check, plus bonus damage or tactical triumph.
* **Overwhelming Success (MoS $\ge$ +10):** Superior mastery; halves required task time or yields bonus tactical assets.
* **Standard Success (MoS 0 to +9):** Goal accomplished cleanly without complication.
* **Standard Failure (MoS -1 to -9):** Objective not met, or succeeded with a setback.
* **Catastrophic Failure (MoS $\le$ -10):** Disastrous failure; equipment jams, alerts security, or deals self-trauma.
* **Critical Failure / Fumble (Natural 2):** Rolling two 1s. Imposes a flat **-10 penalty** to the check, plus severe narrative setbacks.

---

## IV. 2d10 Triangular Probability Distribution

Rolling 2d10 produces 100 possible combinations clustering around the median **11.0**:

| Roll Total | Combinations | Percentage Chance | Cumulative Chance (Roll $\ge$ X) |
| :---: | :---: | :---: | :---: |
| **2** | 1 | **1%** | **100%** |
| **3** | 2 | **2%** | **99%** |
| **4** | 3 | **3%** | **97%** |
| **5** | 4 | **4%** | **94%** |
| **6** | 5 | **5%** | **90%** |
| **7** | 6 | **6%** | **85%** |
| **8** | 7 | **7%** | **79%** |
| **9** | 8 | **8%** | **72%** |
| **10** | 9 | **9%** | **64%** |
| **11** | 10 | **10%** | **55%** |
| **12** | 9 | **9%** | **45%** |
| **13** | 8 | **8%** | **36%** |
| **14** | 7 | **7%** | **28%** |
| **15** | 6 | **6%** | **21%** |
| **16** | 5 | **5%** | **15%** |
| **17** | 4 | **4%** | **10%** |
| **18** | 3 | **3%** | **6%** |
| **19** | 2 | **2%** | **3%** |
| **20** | 1 | **1%** | **1%** |

* **64% of all rolls land between 8 and 14**, providing reliable consistency for trained operatives and eliminating wild swinginess.

---

## V. Advantage & Disadvantage: The Expanding d10 Dice Pool

* **Advantage (+1d10 Pool):** Roll 3d10, keep highest 2. Average shifts to **13.5** (+2.5 average benefit).
* **Disadvantage (-1d10 Pool):** Roll 3d10, keep lowest 2. Average drops to **8.5** (-2.5 average penalty).

### Advantage Stacking (+1 to +5 Extra Dice)
| Dice Pool | State | Average Roll | Fumble (2) Chance | Critical (20) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | 11.0 | 1.00% | 1.00% |
| **3d10** | +1 Advantage | ~13.5 | 0.10% | 2.80% |
| **4d10** | +2 Advantage | ~14.9 | 0.01% | 5.23% |
| **5d10** | +3 Advantage | ~15.8 | < 0.01% | 8.15% |
| **6d10** | +4 Advantage | ~16.5 | < 0.01% | 11.43% |
| **7d10** | +5 Advantage | ~17.0 | < 0.01% | 14.97% |

### Disadvantage Stacking (+1 to +5 Extra Dice)
| Dice Pool | State | Average Roll | Fumble (2) Chance | Critical (20) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | 11.0 | 1.00% | 1.00% |
| **3d10** | +1 Disadvantage | ~8.5 | 2.80% | 0.10% |
| **4d10** | +2 Disadvantage | ~7.1 | 5.23% | 0.01% |
| **5d10** | +3 Disadvantage | ~6.2 | 8.15% | < 0.01% |
| **6d10** | +4 Disadvantage | ~5.5 | 11.43% | < 0.01% |
| **7d10** | +5 Disadvantage | ~5.0 | 14.97% | < 0.01% |

---

## VI. Passive Competence: "Taking 10"

Under non-threatening, low-stress conditions, operatives can choose to **Take 10** rather than roll:

$$\mathbf{Check\ Total = 10 + Skill\ Rank + Attribute\ Modifier}$$

This ensures that routine procedures by qualified professionals never fail due to bad luck.
