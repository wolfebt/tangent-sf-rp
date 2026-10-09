# **0.08 2d10 RESOLUTION SYSTEM**

## **Tangent Science Fantasy Role Playing System — Core Mechanics & Probability Analysis**

---

## **I. The Core Resolution Engine**

In the **Tangent Science Fantasy Role Playing System**, all active tests, skill checks, opposed contests, and combat attack rolls are resolved using a **2d10 bell-curve resolution engine**. 

Moving away from flat, swingy linear dice (like a single d20), Tangent utilizes two ten-sided dice (2d10) to produce a predictable triangular probability curve centered at **11.0**. This mathematically ensures that a character’s training, skill ranks, and physical or mental attributes reliably dictate their performance, while still preserving the tension and drama of chance.

### **1. The Standard Check Formula**
To resolve any check in Tangent, roll two ten-sided dice (2d10), add the operative's relevant Skill Rank, their governing Attribute Modifier, and any situational or equipment modifiers:

$$\mathbf{Check\ Total = 2d10 + Skill\ Rank + Attribute\ Modifier + Situational\ Modifiers}$$

* **Skill Rank:** The operative's direct training in the task (0 Untrained to 30 Pinnacle+).
* **Attribute Modifier:** The governing physical or mental score (-5 to +10).
* **Situational Modifiers:** Gear bonuses, environmental cover, range penalties, or tactical conditions.

### **2. Difficulty Classes & Challenge Ratings (CR)**
The final Check Total is compared to a target threshold set by the Architect (or target Defense in combat):

$$\mathbf{Success\ Condition:\ Check\ Total \ge Target\ CR\ (or\ Defense)}$$

| Difficulty Category | Target CR | Example Task Description |
| :--- | :---: | :--- |
| **Simple** | **CR 0** | Routine action under zero stress; unhurried operation of standard civilian tech. |
| **Routine** | **CR 5** | Driving an automated land-speeder along a paved hyperlane; everyday professional task. |
| **Challenging** | **CR 10** | Standard operational task under field conditions; picking a standard commercial mag-lock. |
| **Hard** | **CR 15** | Bypassing hardened military encryption; stabilizing a hemorrhaging operative during combat. |
| **Severe** | **CR 20** | Performing evasive starship maneuvers through a dense asteroid field under heavy fire. |
| **Heroic** | **CR 25** | Hacking a high-security Megacorp central AI core; repairing a breached reactor core in vacuum. |
| **Epic** | **CR 30** | Decrypting precursor cosmic monolith protocols; landing a burning dreadnought without thrusters. |
| **Miraculous** | **CR 35+** | Feats bordering on divine or reality-bending intervention; piercing ancient dimensional gateways. |

### **3. Degrees of Outcome & Margin of Success (MoS)**
Success in Tangent is not purely binary. The **Margin of Success (MoS)** determines the quality, speed, and narrative impact of the action:

$$\mathbf{Margin\ of\ Success = Check\ Total - Target\ CR}$$

* **Critical Success (Natural 20):** Rolling two 10s on the dice. Regardless of baseline DC, grants an automatic **+10 bonus** to the total check, plus bonus damage, tactical triumph, or exceptional narrative side-effects.
* **Overwhelming Success (MoS $\ge$ +10):** The operative surpasses the challenge with consummate mastery. Unlocks bonus advantages, halves required task time, or preserves consumable resources.
* **Standard Success (MoS 0 to +9):** The action accomplishes its intended goal cleanly.
* **Standard Failure (MoS -1 to -9):** The action fails to achieve the objective, or achieves it with a complication or setback.
* **Catastrophic Failure (MoS $\le$ -10):** The attempt fails disastrously. Triggers structural damage, weapon jams, alarms, or severe tactical vulnerability.
* **Critical Failure / Fumble (Natural 2):** Rolling two 1s on the dice. Imposes a flat **-10 penalty** to the check, plus severe narrative complications (e.g., dropping weapons, tripping, or granting enemies immediate reactions).

### **4. "Taking 10" (Passive Competence)**
In non-threatening, low-stress environments where an operative can focus without distraction, they may elect to **Take 10** instead of rolling 2d10:

$$\mathbf{Passive\ Check = 10 + Skill\ Rank + Attribute\ Modifier}$$

This guarantees consistent competence for trained operatives performing routine field duties.

---

## **II. Mathematical Probability Analysis: 2d10 vs. 1d20**

Switching from a single twenty-sided die (1d20) to two ten-sided dice (2d10) fundamentally changes the mathematical reality of table resolution. 

The core difference is moving from a **linear probability** (flat distribution) to a **triangular probability** (a bell curve).

### **1. 1d20: The Linear Baseline**
When you roll 1d20, every outcome from 1 to 20 has an equal chance of occurring.
* **Total Outcomes:** 20  
* **Average Roll:** 10.5  
* **Chance of any specific number:** Exactly 5%

### **2. 2d10: The Probability Breakdown**
When rolling 2d10, there are 100 possible combinations (10 x 10). Because multiple combinations add up to the middle numbers, results naturally cluster toward the average.
* **Total Combinations:** 100  
* **Average Roll:** 11.0  
* **Minimum Roll:** 2 (Rolling a 1 is impossible)

Here is the exact percentage chance of rolling each specific total on 2d10:

| Roll Total | Combinations | Example Pairs | Percentage Chance | Cumulative Chance (Roll $\ge$ X) |
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
In a standard 1d20 system, a +1 modifier to a roll always represents a flat **5% increase** in your chance of success, no matter how high or low the Difficulty Class (CR) is.

On a 2d10 bell curve, the value of a modifier fluctuates depending on where you are on the curve. A modifier that pushes your result across the "hump" of the bell curve (the middle numbers) is mathematically much more powerful than a modifier added at the extreme ends.

Consider how a +1 modifier changes your cumulative chance to hit specific target numbers:

| Base Roll Needed | Chance (2d10) | Chance with a +1 | Net % Gain | 1d20 Equivalent Gain |
| :---: | :---: | :---: | :---: | :---: |
| **18 (Hard)** | 6% | 10% | **+4%** | *Worse (+5%)* |
| **15 (Medium)** | 21% | 28% | **+7%** | **Better (+5%)** |
| **11 (Average)** | 55% | 64% | **+9%** | **Almost Double (+5%)** |
| **8 (Easy)** | 79% | 85% | **+6%** | **Better (+5%)** |

**Modifiers act as anchors for consistency:**
A +2 or +3 modifier in a 1d20 game makes you slightly better at everything. In a 2d10 game, a +2 or +3 makes an operative *incredibly reliable* at average tasks (yielding massive +15% to +20% swings in success rates) because it capitalizes on the fattest part of the bell curve.

Conversely, hitting very high CRs (18+) relies heavily on having substantial character skill and attribute modifiers, because getting "lucky" on the dice alone becomes statistically improbable.

---

### **2. Criticals and Fumbles: The 2 / 20 Baseline**
In a 1d20 system, the extremes (1 and 20) happen 5% of the time each (1 in 20 rolls).

In the Tangent 2d10 framework, rolling the absolute limits—a **2** or a **20**—serves as the strict baseline for fumbles and criticals, occurring only **1% of the time** (1 in 100 rolls). Furthermore, these extremes **replace the "automatic hit/miss" rule** with massive flat modifiers and added narrative effects:

* **Critical Hit (Natural 20):** Applies a **+10 bonus** to the total roll, alongside potential added effects or bonus critical damage.
* **Fumble (Natural 2):** Applies a **-10 penalty** to the total roll, alongside negative consequences (e.g., weapon malfunction, dropping equipment, or granting enemies an immediate reaction attack).

#### **The Danger of Expanding the Range**
Because the bell curve expands exponentially toward the center, the 2 and 20 thresholds must remain the firm baseline for critical effects. Features that increase the critical threat range (e.g., scoring a critical on 19–20) must be strictly constrained:

| Range Expansion | Fumble Range | Crit Range | Probability Chance | 1d20 Equivalent Rate |
| :---: | :---: | :---: | :---: | :---: |
| **Base (1 point)** | 2 | 20 | **1%** | *Extremely Rare (1 in 100)* |
| **2 points** | 2 to 3 | 19 to 20 | **3%** | *Below standard 1d20 (5%)* |
| **3 points** | 2 to 4 | 18 to 20 | **6%** | **~Standard 1d20 (5%)** |
| **4 points** | 2 to 5 | 17 to 20 | **10%** | **Expanded 1d20 (10%)** |
| **5 points** | 2 to 6 | 16 to 20 | **15%** | **Highly Expanded 1d20 (15%)** |

If threat ranges expand carelessly by 4 or 5 points, the math breaks down: a 5-point fumble range (2 to 6) captures a massive **15%** of all rolls. A game where 15% of actions receive a crushing -10 penalty and catastrophic failure ceases to reward player skill.

---

### **3. The Death of the "Swingy" Game**
Because **64% of all 2d10 rolls land between 8 and 14**, operatives will feel genuinely competent in their specialties. A trained operative will almost never fail an average check in their specialty, while high-tier obstacles remain formidable barriers that require tactical preparation, teamwork, and gear.

---

### **4. Advantage and Disadvantage: The Expanding d10 Pool**
Rather than rolling two separate sets of 2d10 (4d10, keep highest pair), Tangent utilizes a streamlined **Dice Pool Expansion: rolling 3d10 and keeping the highest (or lowest) two dice**.

#### **The Mathematical Shift**
* **Base 2d10 Average:** 11.0  
* **Advantage (+1d10 Pool, Keep Highest 2):** Average shifts to **13.5** (+2.5 bonus equivalent)  
* **Disadvantage (-1d10 Pool, Keep Lowest 2):** Average drops to **8.5** (-2.5 penalty equivalent)

#### **Stacking Advantage and Disadvantage (+1 to +5 Extra Dice)**
When tactical conditions stack multiple sources of Advantage or Disadvantage, the engine expands the dice pool up to +5 extra dice (capped at 7d10 keep 2):

##### **Advantage Stacking (Roll $2 + N$ d10, Keep Highest 2):**
| Dice Pool | State | Average Roll | Fumble (2) Chance | Critical (20) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | 11.0 | 1.00% | 1.00% |
| **3d10** | +1 Advantage | ~13.5 | 0.10% | 2.80% |
| **4d10** | +2 Advantage | ~14.9 | 0.01% | 5.23% |
| **5d10** | +3 Advantage | ~15.8 | < 0.01% | 8.15% |
| **6d10** | +4 Advantage | ~16.5 | < 0.01% | 11.43% |
| **7d10** | +5 Advantage | ~17.0 | < 0.01% | 14.97% |

##### **Disadvantage Stacking (Roll $2 + N$ d10, Keep Lowest 2):**
| Dice Pool | State | Average Roll | Fumble (2) Chance | Critical (20) Chance |
| :---: | :---: | :---: | :---: | :---: |
| **2d10** | Base Roll | 11.0 | 1.00% | 1.00% |
| **3d10** | +1 Disadvantage | ~8.5 | 2.80% | 0.10% |
| **4d10** | +2 Disadvantage | ~7.1 | 5.23% | 0.01% |
| **5d10** | +3 Disadvantage | ~6.2 | 8.15% | < 0.01% |
| **6d10** | +4 Disadvantage | ~5.5 | 11.43% | < 0.01% |
| **7d10** | +5 Disadvantage | ~5.0 | 14.97% | < 0.01% |

**Summary & Operational Takeaway:**
The expanding dice pool mechanic (+Xd10 / -Xd10) rewards tactical positioning, ambush, and preparation. It virtually eliminates catastrophic fumbles when operatives hold the tactical high ground (<0.01%), while allowing coordinated teams to reliably fish for critical triumphs (reaching ~15% at +5 Advantage).