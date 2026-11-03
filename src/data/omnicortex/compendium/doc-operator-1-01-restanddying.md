---
id: "doc-operator-1-01-restanddying"
name: "1.01 Rest & Dying"
fileName: "1.01.RestAndDying.md"
relPath: "operator/character_creation/1.01.RestAndDying.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 12
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.restanddying","mechanics"]
updatedAt: "2026-11-02T22:49:18.274Z"
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

# **1.01.09 REST, DEATH & DYING**

## **1. REST & RESOURCE MANAGEMENT**

In-game features, Essence pools, and physical buffers that require rest add a vital layer of tactical resource management to gameplay. Operators must balance expending powerful abilities in the heat of battle against conserving reserves for subsequent encounters, while seeking secure locations—such as starship berths, frontier inns, or fortified camps—to recuperate, interact with companions, and plan their next move.

---

## **2. FULL REST (`6–8 Hours` Sleep / Species Exceptions)**

* **Standard Biological Sleep Cycle:** The typical Full Rest cycle for most sentient biological species ranges from **6 to 8 hours** of uninterrupted sleep, recharging body and mind for the following day.
* **Mechanical Recovery:**
  * **Vitality & Essence Pools:** Restored to **100% Maximum**.
  * **Health Pool:** Restores **`5 + Stamina Score` Health** (minimum 1 Health; doubled by the *Fast Heal* Feature or continuous *Knowledge [Medicine]* care).
  * **Daily Abilities:** Resets all `1/Day` traits, features, and invocations. *(Note: Karma Points reset only at the start of each game session, never via rest).*
* **Physiological Exceptions:**
  * **Synthetics, Fae, and Insectoid (Kitin) Species:** Possess unique physiological architectures that function without traditional sleep. A brief **Light Rest** period is sufficient for them to refresh their operational cycles and maintain energy levels.
  * **Alterians and Mondi (Trance / Meditation):** While not sleeping in the human sense, Alterians and Mondi enter a state of deep, conscious contemplation and meditation (`4 hours`, or meditative Light Rest intervals throughout the day) that provides the full restorative benefits of sleep while remaining dimly aware of their surroundings.

---

## **3. LIGHT REST (UP TO 4 TIMES PER DAY)**

A **Light Rest** is a short period of minimal physical and mental exertion that restores **Vitality (`10 + Stamina Score`, minimum 5)**, recovers **Essence (`Key Attribute Modifier`, minimum 1)**, removes **Fatigue/Exhaustion**, and resets encounter/short-cooldown traits and features. It may be performed **up to four times per day**.

The duration required to qualify as a Light Rest depends on the character's activity level:

1. **Nap or Meditation (`1 Hour`):**
   * The most restorative Light Rest option, ideal for rapidly resetting traits, features, and Vitality.
   * During this hour, the character must do nothing else except rest, sleep, or meditate.
2. **Lounging (`2 Hours`):**
   * Less intensive than a dedicated nap, but equally effective once completed.
   * Allows casual observation, eating, light conversation, and non-laborious recreation.
3. **Light Duty (`3 Hours`):**
   * The longest Light Rest tier, allowing operators to remain productive while recovering.
   * Permits light recreation, routine watch duty, basic gear maintenance, and minimal-labor tasks.

* **Interruption & Degradation Rule:** Any activity more strenuous than those listed above—including combat, physical labor, intense exercise, or mentally taxing crafting/research—interrupts rest. Each time a strenuous activity is performed during a rest window, it **worsens the rest category by one step** (`Nap [1 hr] -> Lounging [2 hrs] -> Light Duty [3 hrs] -> Not Rested`).

---

## **4. DEATH & DYING (THE UNIFIED MORTALITY STATE)**

Death is the terminal state reached when a character's physical integrity collapses from lethal combat injuries or environmental hazards.

### **1. Vitality vs. Health**

* **Vitality (`Base 30 + 5/CP`):** Represents physical endurance, luck, and minor bruising (non-lethal damage buffer).
* **Health (`Base 30 + 5/CP`):** Represents physical trauma and structural life force, depleted by Critical Hits or overflow damage once Vitality reaches `0`.

### **2. Entering the Mortality State (`0 Health` / Death's Door)**

When a character takes damage that reduces their **Health to `0`** (with Vitality at `0`), they enter the **Mortality State (Death's Door)**:

* **Unconscious & Incapacitated:** The character immediately falls **Prone**, drops held items, and is **Unconscious / Comatose** and **Incapacitated** (unless possessing the *Diehard* Feature).
* **Stability Threshold (`Stamina Score + 5`):** A dying character possesses a **Stability Points** pool equal to their **`Stamina Score + 5`** (representing their physiological reserve at Death's Door; in gritty lethal variants, the raw clock is `Stamina Score` rounds, minimum 1 round).
* **Bleeding Out (`-1 Stability Point` per Turn):** At the start of each of the character's turns in the Mortality State, they roll a **Fortitude Stabilization Save (`CR 10 + 1 per round spent dying`)**:
  * **Success by 5 or more:** The character **self-stabilizes** and stops Bleeding Out.
  * **Failure:** The character suffers **1 point of Stability Damage** (losing 1 Stability Point / sliding `-1` closer to death).
* **Stabilization & Recovery:** The character immediately stops Bleeding Out and is stabilized if they receive any magical/metaphysical healing (*Entropy: Order*) or if an ally succeeds on a **Knowledge (Medicine) Check (`CR 15`)** (or applies a *Trauma Patch*). A stabilized character remains unconscious at `0 Health` until they recover at least 1 Health.
* **Massive Damage Instant Death:** If a character at Death's Door (`0 Health`) suffers damage from a single attack equal to or greater than their **Stamina Score** (or `10 + Stamina Score`), they die instantly.
* **Death (`0 Stability Points`):** If a character's **Stability Points** are reduced to **`0`** before they are stabilized, the character **dies permanently**.

---

## **5. REVIVIFICATION & THE HIGH COST OF DYING**

Returning a deceased character from the dead is rare, requiring high-level Metaphysics (*Entropy: Order — Revivify*, `4.00.Entropy.md`) or advanced Tech Level 4–5 medical infrastructure (*Resurrection Chamber / Trans-Cerebral Pod*, `2.00.CraftingAndValuation.md`), and carries a heavy toll known as **The High Cost of Dying**:

1. **Total Karma Depletion:** A revived character immediately **loses ALL remaining Karma Points** for the current session.
2. **Experience Debt (`-5 AP Debt`):** The trauma of death and resuscitation inflicts a **-5 Experience Debt (-5 Award Points / CP)**. This debt is either deducted immediately as a permanent reduction in one or more character traits/ranks or recorded as a `-5 AP` deficit that consumes the next 5 Award Points the character earns until the debt is paid in full.
3. **Post-Revival Exhaustion:** The character returns at `1 Health` (or `1 Health per Stage` of the revival effect) and suffers the **Exhausted** condition until they complete a **Full Rest**.

