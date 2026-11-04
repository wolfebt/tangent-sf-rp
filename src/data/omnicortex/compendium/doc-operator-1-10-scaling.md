---
id: "doc-operator-1-10-scaling"
name: "1.10 SCALING"
fileName: "1.10 SCALING.md"
relPath: "operator/1.10 SCALING.md"
isMasterDoc: true
masterDocId: "doc-operator-1-10-scaling"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 220
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","1.10 scaling","mechanics"]
updatedAt: "2026-11-04T09:33:29.359Z"
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
## Overview & Mechanical Authority Block

* **Canonical Archive Path:** `/game_rules/operator/1.10 SCALING.md`
* **Codex Source Reference:** `/_ _ TANGENT RP CODEX _ _/1.10 SCALING (File ID: 1xbjLAz3kV1rZkY2gKrzpYgzi0jHSG2PUn0VlDRetKwU)`
* **Mechanical Authority (`/game_rules` Wins):**
* **Pre-Calculated Vehicle & Mecha SP Rule (Rule 12):** Vehicle and Mecha Structure Points (`SP`) in the size/chassis tables are **already pre-calculated** for their scale. Apply the **Scale Multiplier ONLY to weapon damage dice, movement speed, area of effect, and range**—never multiply vehicle table SP a second time.
* **Garaging & Hangar Conversion (`1 Mount = 1 Scale Multiplier`):** Garaging a vehicle/mecha requires `1 Mount` per `x1` Scale Multiplier (`Medium x1 = 1 Mount`, `Large x2 = 2 Mounts`, `Huge x5 = 5 Mounts`, `Gargantuan x10 = 10 Mounts / 1 Module`, `Colossal x20 = 20 Mounts / 2 Modules`).
* **Difficulty Nomenclature:** Uses **Saving Throw Challenge Ratings (`Save CRs`)** across all chassis and invocation rules.
* **Textual Completeness (`_ _ TANGENT RP CODEX _ _` Wins):** 100% of original lore paragraphs, examples, tables, and rules entries restored verbatim with zero redactions, ellipses, or placeholders.

---

## Part I — Alignment & Summary Matrix Table

### **1. Master Size & Scaling Table (14 Universal Size Categories)**

| Size Category | Scaling Modifier\* | Strength Modifier | Combat Modifier (Def/Atk) | Stealth Modifier | Height / Length | Typical Weight | Natural Reach | Hangar / Garaging Space (`1 Mount = 1x Scale`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Miniscule** | `-5ds` (`1/12`) | `-32` | `+32` | `+20` | `< 1 in` | `< 1 oz` | `1 in` | `< 1 Node` |
| **Fine** | `-4ds` (`1/6`) | `-16` | `+16` | `+16` | `< 6 in` | `< 1/8 lb` | `6 in` | `1 Node` |
| **Diminutive** | `-3ds` (`1/3`) | `-8` | `+8` | `+12` | `< 1 ft` | `< 1 lb` | `1 ft` | `2 Nodes` |
| **Tiny** | `-2ds` (`1/2`) | `-4` | `+4` | `+8` | `< 2 ft` | `< 8 lbs` | `2 ft` | `5 Nodes` |
| **Small** | `-1ds` (`2/3`) | `-2` | `+2` | `+4` | `< 4 ft` | `< 60 lbs` | `3 ft` | `5 Sockets` (`0.5 Mounts`) |
| ***Medium*** | ***`x1` (Base)*** | ***`+0`*** | ***`+0`*** | ***`+0`*** | ***`4 to 8 ft`*** | ***`60 to 500 lbs`*** | ***`5 ft`*** | ***`1 Mount` (`10 Sockets`)*** |
| **Large** | `x2` | `+2` | `-2` | `-4` | `8 to 16 ft` | `500 lbs to 2 Tons` | `10 ft` | `2 Mounts` (`0.2 Modules`) |
| **Huge** | `x5` | `+4` | `-4` | `-8` | `16 to 32 ft` | `2 to 16 Tons` | `15 ft` | `5 Mounts` (`0.5 Modules`) |
| **Gargantuan** | `x10` | `+8` | `-8` | `-16` | `32 to 64 ft` | `16 to 125 Tons` | `20 ft` | `10 Mounts` (`1.0 Module`) |
| **Colossal** | `x20` | `+16` | `-16` | `-32` | `64 to 128 ft` | `125 to 1,000 Tons` | `25 ft` | `20 Mounts` (`2.0 Modules`) |
| **Enormous\*\*** | `x40` | `+32` | `-32` | Impossible (`NO`) | `128 to 512 ft` | `1K to 16K Tons` | `—` | `40 Mounts` (`4.0 Modules`) |
| **Titanic\*\*** | `x80` | `+64` | `-64` | Impossible (`NO`) | `512 to 1,024 ft` | `16K to 144K Tons` | `—` | `80 Mounts` (`8.0 Modules`) |
| **Super Gargantuan\*\*** | `x160` | `+128` | `-128` | Impossible (`NO`) | `1,024 to 5,280 ft` | `144K to 50M Tons` | `—` | `160 Mounts` (`16.0 Modules`) |
| **Mega Colossal\*\*** | `x320` | `+256` | `-256` | Impossible (`NO`) | `1 Mile+` | `50M Tons+` | `—` | `320 Mounts` (`32.0 Modules`) |

---

## Part II — Complete Unabridged Profiles & Rules Entries

### **1. Unabridged Scaling System Overview & Core Principles**

**This scaling system determines how a creature, mecha, vehicle, structure, or object's physical size affects its attributes and abilities.**

#### **Size Categories**

Creatures, mecha, and objects are classified into 14 universal size categories (e.g., *Tiny, Medium, Huge, Gargantuan, Colossal*) that determine their general physical dimensions and scaling modifiers.

#### **Scaling Modifiers**

These modifiers are applied to various attributes and abilities based on size. For example, a **Gargantuan** creature or chassis has a `x10` scaling modifier, meaning its weapon damage dice, movement speed, area of effect, ranges, and carrying capacity are multiplied by `10`.

#### **Strength and Combat Modifiers**

Size also affects Strength and Combat abilities. Larger creatures generally have higher **Strength Modifiers** (the adjustment to average Strength due to size) but lower effective Agility and Defense relative to smaller opponents due to their mass and silhouette, represented by the **Combat Modifier** (the adjustment from size to Agility as well as Attack and Defense in relation to the size of the opponent).

#### **Stealth Modifier**

Larger creatures and vehicles are generally much easier to spot and track on sensors, reflected in their negative **Stealth Modifiers** (and total impossibility of conventional Stealth at `Enormous` starship scale and above).

#### **Special Rules for Starships (`Enormous+` Proximity Damage)**

Starship-scale entities (`Enormous`, `Titanic`, `Super Gargantuan`, and `Mega Colossal`) have additional rules, including **Indirect Proximity Damage** to smaller targets:
* **\* Sub-Medium Die Step Reductions (`-1ds` to `-5ds`):** `-1 / -2 / -3 / -4 / -5 ds` lower the weapon damage die side value accordingly along the progression chain: `d12 -> d10 -> d8 -> d6 -> d4 -> d3 -> d2 -> 1 point minimum`.
* **\*\* Starship Scale (`Enormous+` — Proximity Damage):** Modifiers are extreme against Medium targets. Overwhelming attacks from capital ships often simply vaporize small targets in the direct blast and **ALSO deal `1/10` (`10%`) Indirect Proximity Damage** (splash effect, concussive overblast, thermal wash, and shrapnel debris) to targets not directly hit within a radius equal to **half (`1/2`) the attacker's Size Strength Modifier in feet**, in addition to any normal area of effect of the attack.
  * *Example:* A **Titanic** capital warship (`x80` damage multiplier, `+64` Strength Modifier) fires on a planetary colony—the blast vaporizes small targets in the direct impact zone with an `x80` damage multiple and **also deals one-tenth (`1/10`) of that total damage across a `32 ft` radius** (`64 / 2 = 32 ft`) from overblast and debris, in addition to any area effect of the weapon.

---

### **2. Scaling in Combat & The Canonical Vehicle/Mecha SP Rule**

**Damage is NOT reduced due to a target being a larger size.** Larger targets naturally possess proportionally increased **Structure Points (SP)** and heavier **Armor Damage Reduction (DR)** from their heavier frame and armor plating:

1. **Attack Rolls & Reach:** The Attacker's size adjusts attack rolls relative to the target's size via the **Combat Modifier** (Section 4), and larger creatures/mecha gain extended **Natural Reach** (`10 ft` for Large up to `25 ft` for Colossal).
2. **Damage and Structure (Biological/Unlisted vs. Pre-Calculated Vehicle Tables):**
   * **Biological Creatures & Unlisted Objects:** For raw biological creatures or generic objects not drawn from a pre-calculated vehicle table, the number of Weapon Damage Dice and baseline Structure Points are multiplied by the **Scaling Modifier**, meaning larger creatures deal significantly more damage and are considerably tougher.
   * **Pre-Calculated Vehicle & Mecha Table SP (`/game_rules` Mechanical Authority):** In the vehicular and mecha catalogs (`operator/2.00 EQUIPMENT.md`, `architect/99. TECHNOLOGY.md`, and `architect/technology/mecha/`), the **Structure Points (SP) listed in vehicle and mecha size tables are ALREADY pre-calculated for that chassis size**. During play, **apply the active Scale Multiplier ONLY to weapon damage dice, movement speed, area of effect, and weapon range—NEVER multiply a vehicle or mecha's table SP a second time by the Scale Multiplier.**
3. **Defense:** The **Combat Modifier** adjusts a creature or vehicle's Defense and Strike scores based on its size relative to its target.
4. **Distance & Speed:** Movement speeds, weapon ranges, and areas of effect are multiplied by the **Scaling Modifier**, allowing larger entities to cover more ground and engage across vast distances.
5. **Hangar & Garaging Conversion (`1 Mount = 1 Scale Multiplier`):** Stowing or garaging a scaled vehicle or mecha inside a carrier or architectural structure requires hangar bay capacity equal to **`1 Mount` per `x1` Scale Multiplier** (`10 Mounts = 1 Module`):
   * ***Medium (`x1` Scale):*** Human size, `< 8 ft`, `< 500 lbs` — requires **`1 Mount`** (`0.1 Modules`).
   * ***Large (`x2` Scale):*** `< 16 ft`, `< 2 Tons` — requires **`2 Mounts`** (`0.2 Modules`).
   * ***Huge (`x5` Scale):*** `< 32 ft`, `< 16 Tons` — requires **`5 Mounts`** (`0.5 Modules`).
   * ***Gargantuan (`x10` Scale):*** `< 64 ft`, `< 125 Tons` — requires **`10 Mounts`** (`1.0 Module`).
   * ***Colossal (`x20` Scale):*** `< 128 ft`, `< 1,000 Tons` — requires **`20 Mounts`** (`2.0 Modules`).

---

### **3. Meta-Tech (Magi-Tech, Psi-Tech) & Chassis-Mounted Invocations**

When a **Meta-Tech device** (`../architect/metaphysics/99.Metaphysics.MetaTechMatrix.md`) is installed into a vehicle, mecha, or starship **Mount** or **Module**, it utilizes the massive power core and emitters of the host vehicle.

* **The Rule:** The device applies the **Scaling Multiplier of the Host Chassis** to **ALL numerical spatial and potency parameters of the Invocation**, including **Damage Dice, Range, and Area of Effect**:

```text
(Base Invocation Damage Dice) x (Chassis Scale Multiplier) = Final Invocation Damage Dice
```

#### **Example**

A **Huge** creature or mecha with a `x5` scaling modifier deals five times (`x5`) the **BASE DAMAGE DICE** with its weapons, has its **MOVEMENT SPEEDS** and **RANGES** multiplied by five (`x5`) (while a biological creature multiplies unlisted SP by `x5`, and a manufactured Huge Mecha uses its pre-calculated Huge table SP directly), and has its Defense score adjusted based on the relative **Combat Modifier**.

This multiplier applies to **Meta-Tech and Invocations** as well when generated by a chassis of this size: for example, a *Fireball (Energy: Elemental Burst)* Invocation (`5d6` base damage) projected from a **Huge Mecha (`x5` Scale)** deals **`x5` Damage** (`5d6` expanded to **`25d6` damage**), and its **Range and Blast Radius are multiplied by `5`**—while **Saving Throw Challenge Ratings (`Save CRs`)** and non-spatial status effect values that would not be altered by physical size remain unchanged.

---

### **4. Relative Combat Modifiers Between Non-Medium Combatants**

***Shown Combat Modifiers in the Master Size Table are based on attacking or defending against a Medium-sized (`+0`) target; modifiers are fluid based on Attacker and Defender sizes.***

#### **A. Larger than Medium Attacker**

1. **If the Target is Smaller than Medium (Opposite Sides of Medium):**
   * Subtract the Target's Combat Modifier from the Attacker's Combat Modifier to determine the actual Modifier:
   * `Actual Combat Modifier = Attacker's Combat Modifier - Target's Combat Modifier`
   * *Example:* A **Large** creature (`Combat Modifier -2`) attacks a **Small** creature (`Combat Modifier +2`). The actual Combat Modifier for the attack is **`-4`** (`-2 - 2 = -4`), granting the Small creature a significant advantage.
2. **If the Target is Larger than Medium (but Smaller than the Attacker — Same Side of Medium):**
   * Divide the Attacker's Combat Modifier by the Defender's Combat Modifier (applied as a negative penalty to the larger attacker, or positive bonus to the smaller defender):
   * `Actual Combat Modifier = -|Attacker's Combat Modifier / Defender's Combat Modifier|`
   * *Example:* A **Huge** creature (`Combat Modifier -4`) attacks a **Large** creature (`Combat Modifier -2`). The actual Combat Modifier for the attack is **`-2`** (`-4 / -2 = -2`), granting the Large creature a moderate advantage.

#### **B. Smaller than Medium Attacker**

1. **If the Target is Larger than Medium (Opposite Sides of Medium):**
   * Subtract the Target's Combat Modifier from the Attacker's Combat Modifier to determine the actual Modifier:
   * `Actual Combat Modifier = Attacker's Combat Modifier - Target's Combat Modifier`
   * *Example:* A **Small** creature (`Combat Modifier +2`) attacks a **Large** creature (`Combat Modifier -2`). The actual Combat Modifier for the attack is **`+4`** (`2 - (-2) = +4`), granting the Small creature a significant accuracy advantage despite its smaller size.
2. **If the Target is Smaller than Medium (but Larger than the Attacker — Same Side of Medium):**
   * Divide the Attacker's Combat Modifier by the Defender's Combat Modifier:
   * `Actual Combat Modifier = Attacker's Combat Modifier / Defender's Combat Modifier`
   * *Example:* A **Tiny** creature (`Combat Modifier +4`) attacks a **Small** creature (`Combat Modifier +2`). The actual Combat Modifier for the attack is **`+2`** (`4 / 2 = +2`), granting the Tiny creature a moderate advantage.

---

## Part III — Discrepancy & Restoration Ledger

* **DISC-311A (Unabridged Codex Section & Example Restoration):** Restored 100% of the original headings (`Size Categories`, `Scaling Modifiers`, `Strength and Combat Modifiers`, `Stealth Modifier`, `Special Rules for Starships`, `Scaling in Combat`, `Meta-Tech`, `Example`, and `Relative Combat Modifiers`) and quick-reference scale callouts from Codex `1.10 SCALING`.
* **DISC-311B (Rule 12 Pre-Calculated Vehicle SP & Garaging Normalization):** Enforced the canonical distinction between biological/unlisted SP scaling and pre-calculated Vehicle/Mecha table SP (Scale Multiplier applies only to weapon damage, movement speed, area, and range), integrated the `1 Mount = 1 Scale Multiplier` garaging rule, and normalized `Save DCs` to `Save CRs`.

