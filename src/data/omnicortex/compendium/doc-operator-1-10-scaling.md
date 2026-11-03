---
id: "doc-operator-1-10-scaling"
name: "1.10 SCALING"
fileName: "1.10 SCALING.md"
relPath: "operator/1.10 SCALING.md"
isMasterDoc: true
masterDocId: "doc-operator-1-10-scaling"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 219
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","1.10 scaling","mechanics"]
updatedAt: "2026-11-02T22:49:16.555Z"
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

# **1.10 SCALING**

The Tangent **Scaling System** determines how a creature, mecha, vehicle, structure, or starship's physical size modifies its attributes, weapon damage dice, Structure Points (SP), movement speeds, weapon ranges, carrying capacity, Strength, Defense, and Stealth.

---

## **1. Overview & Core Scaling Principles**

* **Size Categories:** Creatures, mecha, and objects are classified into 14 universal size categories—from **Miniscule** (`< 1 inch`) and **Medium** (`4 to 8 ft`, the humanoid `x1` baseline) up to **Mega Colossal** (`1 Mile+`, `x320` scale)—that govern their physical dimensions and scaling modifiers.
* **Scaling Modifiers:** Applied directly to **Weapon Damage Dice, Movement Speeds, Area of Effect, Ranges, and Carrying Capacity**. For example, a **Gargantuan** creature or mecha has a `x10` Scaling Modifier, multiplying its base weapon dice, speed, ranges, and carrying capacity by `10`.
* **Strength, Combat & Stealth Modifiers:** Larger entities possess higher **Strength Modifiers** (adjusting average Strength due to mass) but negative **Combat Modifiers** (adjusting Attack and Defense relative to opponent size) and negative **Stealth Modifiers** (reflecting how difficult it is to conceal a massive silhouette).

### **Scaling in Combat**

1. **No Arbitrary Damage Reduction by Size:** Damage is **NOT** divided when a smaller attacker hits a larger target. Instead, larger targets naturally possess proportionally increased **Structure Points (SP)** and heavier **Armor Damage Reduction (DR)** from their frame and plating.
2. **Attack Rolls & Reach:** An attacker's size adjusts their Strike and Defense via the relative **Combat Modifier** (Section 4) and grants extended **Natural Reach** (`10 ft` for Large up to `25 ft` for Colossal).
3. **Damage & Structure:** The number of Weapon Damage Dice and biological/unlisted Structure Points are multiplied by the **Scaling Modifier**.
4. **Mecha & Vehicle Scale Multiplier Rule (Matrix Audit Retrofit):**
   * **Pre-Calculated Vehicle/Mecha SP:** In the vehicular and mecha catalogs (`2.00 ECONOMATRIX.md` and `../architect/99. TECHNOLOGY.md`), the **Structure Points (SP)** listed in vehicle size tables are **already pre-calculated** for the chassis's size. During play, apply the active **Scaling Multiplier ONLY to weapon damage dice, movement speed, area, and range**—do not multiply a vehicle's listed SP a second time.
   * **Hangar & Garaging Rule (`1 Mount = 1 Scale Multiplier`):** Stowing or garaging a scaled vehicle/mecha inside a larger carrier or base requires hangar capacity equal to **1 Mount per `x1` Scale Multiplier**:
     * *Medium (`x1`):* `1 Mount`
     * *Large (`x2`):* `2 Mounts`
     * *Huge (`x5`):* `5 Mounts`
     * *Gargantuan (`x10`):* `10 Mounts` (`1 Module`)
     * *Colossal (`x20`):* `20 Mounts` (`2 Modules`)

---

## **2. Meta-Tech & Chassis-Mounted Invocations (Magi-Tech / Psi-Tech)**

When a **Meta-Tech device** (`../architect/metaphysics/99.Metaphysics.MetaTechMatrix.md`) is installed into a vehicle, mecha, or starship **Mount** or **Module**, it draws upon the massive reactor core and emitters of the host chassis:

* **The Rule:** The device applies the **Scaling Multiplier of the Host Chassis** to **all numerical parameters of the Invocation**, including **Damage Dice, Range, and Area of Effect**:

```text
Final Invocation Damage Dice = Base Invocation Damage Dice * Chassis Scaling Multiplier
```

* **Example:** A Huge (`x5` scale) Mecha channels a *Fireball (Energy: Elemental Burst)* Invocation (`5d6` base damage). Projected through the Huge Mecha's emitters, the invocation expands to **`25d6` damage** (`5d6 * 5`), and its **Range and Blast Radius are multiplied by `5`**. *(Note: Saving Throw Challenge Ratings [CRs] and non-spatial status conditions remain unchanged by size).*

---

## **3. MASTER SIZE & SCALING TABLE**

| Size Category | Scaling Modifier\* | Strength Modifier | Combat Modifier (Def/Atk) | Stealth Modifier | Height / Length | Typical Weight | Natural Reach |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Miniscule** | `-5ds` (`1/12`) | `-32` | `+32` | `+20` | `< 1 in` | `< 1 oz` | `1 in` |
| **Fine** | `-4ds` (`1/6`) | `-16` | `+16` | `+16` | `< 6 in` | `< 1/8 lb` | `6 in` |
| **Diminutive** | `-3ds` (`1/3`) | `-8` | `+8` | `+12` | `< 1 ft` | `< 1 lb` | `1 ft` |
| **Tiny** | `-2ds` (`1/2`) | `-4` | `+4` | `+8` | `< 2 ft` | `< 8 lbs` | `2 ft` |
| **Small** | `-1ds` (`2/3`) | `-2` | `+2` | `+4` | `< 4 ft` | `< 60 lbs` | `3 ft` |
| ***Medium*** | ***`x1` (Base)*** | ***`+0`*** | ***`+0`*** | ***`+0`*** | ***`4 to 8 ft`*** | ***`60 to 500 lbs`*** | ***`5 ft`*** |
| **Large** | `x2` | `+2` | `-2` | `-4` | `8 to 16 ft` | `500 lbs to 2 Tons` | `10 ft` |
| **Huge** | `x5` | `+4` | `-4` | `-8` | `16 to 32 ft` | `2 to 16 Tons` | `15 ft` |
| **Gargantuan** | `x10` | `+8` | `-8` | `-16` | `32 to 64 ft` | `16 to 125 Tons` | `20 ft` |
| **Colossal** | `x20` | `+16` | `-16` | `-32` | `64 to 128 ft` | `125 to 1,000 Tons` | `25 ft` |
| **Enormous\*\*** | `x40` | `+32` | `-32` | Impossible (`NO`) | `128 to 512 ft` | `1K to 16K Tons` | `—` |
| **Titanic\*\*** | `x80` | `+64` | `-64` | Impossible (`NO`) | `512 to 1,024 ft` | `16K to 144K Tons` | `—` |
| **Super Gargantuan\*\*** | `x160` | `+128` | `-128` | Impossible (`NO`) | `1,024 to 5,280 ft` | `144K to 50M Tons` | `—` |
| **Mega Colossal\*\*** | `x320` | `+256` | `-256` | Impossible (`NO`) | `1 Mile+` | `50M Tons+` | `—` |

* **\* Sub-Medium Die Step Reductions (`-1ds` to `-5ds`):** Each `-1ds` lowers the weapon damage die size by one step along the progression chain: `d12 -> d10 -> d8 -> d6 -> d4 -> d3 -> d2 -> 1 point minimum`.
* **\*\* Starship Scale (`Enormous+` — Proximity Damage):** Modifiers at `x40` to `x320` scale are extreme against Medium targets. Overwhelming attacks from capital ships vaporize small/personal-scale targets in the direct blast and **ALSO inflict `1/10th` (`10 percent`) Indirect Proximity Damage** (concussive overblast, thermal wash, and shrapnel debris) to all targets not directly hit within a radius equal to **half (`1/2`) the attacker's Size Strength Modifier in feet** (in addition to any normal area of effect).
  * *Example:* A **Titanic** (`x80` damage multiplier, `+64` Strength Modifier) capital warship fires on a planetary colony—vaporizing small targets in the direct impact zone with `x80` damage and dealing **one-tenth (`1/10`) of that total damage across a `32 ft` radius** (`64 / 2 = 32 ft`) from overblast and debris.

### **Quick-Reference Tactical Scale Summary**

* **Medium (`x1` Scale):** Human size, `< 8 ft`, `< 500 lbs` (`1 Socket` personal gear scale).
* **Large (`x2` Scale):** Power Loader / Heavy Enforcer / Graa, `< 16 ft`, `< 2 Tons` (`2 Mounts` garage space).
* **Huge (`x5` Scale):** Tactical Striker Mecha / Main Battle Tank, `< 32 ft`, `< 16 Tons` (`5 Mounts` garage space).
* **Gargantuan (`x10` Scale):** Siege Walker / Heavy Dropship, `< 64 ft`, `< 125 Tons` (`10 Mounts = 1 Module` garage space).
* **Colossal (`x20` Scale):** Super-Heavy Titan / Corvette, `< 128 ft`, `< 1,000 Tons` (`20 Mounts = 2 Modules` garage space).

---

## **4. Relative Combat Modifiers Between Non-Medium Combatants**

The **Combat Modifier** shown in the Master Table is based on engaging a **Medium (`+0`)** target. Because Combat Modifiers are fluid based on the relative sizes of the Attacker and Defender, use the following rules when neither combatant is Medium:

### **A. Larger than Medium Attacker**

1. **If the Target is Smaller than Medium (Opposite Sides of Medium):**
   * Subtract the Target's Combat Modifier from the Attacker's Combat Modifier:
   * `Relative Combat Modifier = Attacker's Combat Modifier - Target's Combat Modifier`
   * *Example:* A **Large** creature (`Combat Modifier -2`) attacks a **Small** creature (`Combat Modifier +2`). The actual Combat Modifier for the attack is **`-4`** (`-2 - 2 = -4`), granting the Small creature a significant defensive advantage.
2. **If the Target is Larger than Medium (Same Side of Medium):**
   * Divide the Attacker's Combat Modifier by the Defender's Combat Modifier:
   * `Relative Combat Modifier = Attacker's Combat Modifier / Target's Combat Modifier`
   * *Example:* A **Huge** creature (`Combat Modifier -4`) attacks a **Large** creature (`Combat Modifier -2`). The actual Combat Modifier for the attack is **`-2`** (`-4 / -2 = -2`, applied as a `-2` penalty to the larger attacker), granting the Large creature a moderate advantage.

### **B. Smaller than Medium Attacker**

1. **If the Target is Larger than Medium (Opposite Sides of Medium):**
   * Subtract the Target's Combat Modifier from the Attacker's Combat Modifier:
   * `Relative Combat Modifier = Attacker's Combat Modifier - Target's Combat Modifier`
   * *Example:* A **Small** creature (`Combat Modifier +2`) attacks a **Large** creature (`Combat Modifier -2`). The actual Combat Modifier for the attack is **`+4`** (`2 - [-2] = +4`), granting the Small creature a significant accuracy advantage against the larger target.
2. **If the Target is Smaller than Medium (Same Side of Medium):**
   * Divide the Attacker's Combat Modifier by the Defender's Combat Modifier:
   * `Relative Combat Modifier = Attacker's Combat Modifier / Target's Combat Modifier`
   * *Example:* A **Tiny** creature (`Combat Modifier +4`) attacks a **Small** creature (`Combat Modifier +2`). The actual Combat Modifier for the attack is **`+2`** (`4 / 2 = +2`), granting the Tiny creature a moderate advantage.

---

## **5. DISCREPANCY & RESTORATION LEDGER**

* **DISC-311 (1.10 Scaling Full Prose & Matrix Audit Mecha Scale Retrofit):** Restored 100% of the introductory sections, examples, and Relative Combat Modifier breakdowns from `/_ _ TANGENT RP CODEX _ _/1.10 SCALING` and `/game rules/operator/1.10 SCALING.md`, normalized `Save DCs` -> `Save CRs`, and integrated the canonical **Rule 12 Mecha Scale Multiplier & Garaging Retrofit** (vehicle table SP is pre-calculated; apply Scale Multiplier only to damage, speed, and range; Garaging: `1 Mount = 1 Scale Multiplier`).

