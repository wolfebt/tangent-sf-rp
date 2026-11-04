---
id: "doc-operator-1-01-restanddying"
name: "1.01 Rest & Dying"
fileName: "1.01.RestAndDying.md"
relPath: "operator/character_creation/1.01.RestAndDying.md"
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
tags: ["operator","core-rules","modular-rule","character_creation","1.01.restanddying","mechanics"]
updatedAt: "2026-11-04T09:33:29.380Z"
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

# 1.01.09 REST, DEATH & DYING

## **Mechanical Summary Matrix**| Rest / Mortality State | Duration / Threshold | Mechanical Recovery / Resolution | Interruption / Failure Consequence |
| :--- | :---: | :--- | :--- |
| **Full Rest** *(Biological)* | `6–8 Hours` Sleep | `100% Vitality & Essence` \| `+5 + STA Health` \| Resets `1/Day` abilities | Interrupted by combat; Karma never resets via rest. |
| **Full Rest** *(Exceptions)* | `Light Rest` / `4-Hr Trance` | Synthetics, Fae, and Kitin refresh via Light Rest; Alterians and Mondi meditate. | Maintains dim environmental alertness during meditation. |
| **Light Rest: Nap / Meditation** | `1 Hour` *(Up to 4/Day)* | Restores `10 + STA Vitality`, `Key Attr Essence`, removes `Exhausted`, resets short cooldowns. | Strenuous activity degrades **Nap -> Lounging**. |
| **Light Rest: Lounging** | `2 Hours` *(Up to 4/Day)* | Same recovery as Nap while permitting casual observation, light recreation, and eating. | Strenuous activity degrades **Lounging -> Light Duty**. |
| **Light Rest: Light Duty** | `3 Hours` *(Up to 4/Day)* | Same recovery as Nap while permitting routine watch, light recreation, and minimal labor. | Strenuous activity degrades **Light Duty -> Not Rested**. |
| **Mortality State (Death's Door)** | `0 Health` & `0 Vitality` | Unconscious, Prone, Comatose \| `Stability Points = STA + 5` (`-1` per turn; `CR 15 Medicine` stabilizes). | Instant death at `0 Stability` or single hit `>= STA Score`. |
| **Revivification** | `TL 5 Tech` / `Order Meta` | Returns character from clinical death at `1 Health` with **Exhausted** condition. | **Loses ALL Karma Points** + suffers **`-5 Experience Debt`**. |

### 1. Rest & Resource Management

In-game features or abilities that require rest add a layer of strategy and resource management to gameplay. Players must balance using these abilities with resting to ensure they are available when needed. This can be particularly challenging in fast-paced missions or during intense battles, where players may be tempted to overuse their abilities without considering the consequences.

The need for rest has a significant impact on gameplay. For example, players may have to choose between using a powerful ability in the heat of battle or saving it for later, knowing that they will need to rest before they can use it again. This leads to meaningful decisions and strategic trade-offs. Players must carefully consider the risks and rewards of using their abilities, as well as the impact it will have on their character's overall Health, Vitality, and Essence reserves.

Rest mechanics also encourage roleplaying opportunities. Players need to find safe places to rest, such as starship quarters, frontier inns, or fortified campsites, and take time to relax and recover. This provides opportunities for character development and interaction, as players can talk to NPCs, learn new information, or take a breather from the action. Rest mechanics help create a more immersive and believable game world, as players must take into account their character's physical and mental needs.

### 2. Full Rest (`6 to 8 Hours` / Species Physiological Exceptions)

The typical sleep cycle for most sentient biological species ranges from **6 to 8 hours**. This allows their bodies and minds to rest and recharge, preparing them for the following day's activities (`100%` Vitality and Essence restoration, `+5 + Stamina Score` Health recovery, and reset of daily abilities; Karma Points reset only at the start of a game session). However, there are physiological exceptions to this general rule:

* **Synthetics, Fae, and Insectoid (`Kitin`) Species:** Synthetics, Fae, and Insect species possess unique physiological attributes that enable them to function without traditional sleep. These species have evolved or been engineered to require minimal rest, and a brief period of **Light Rest** is sufficient for them to fully refresh and maintain their energy levels.
* **Alterians and Mondi (Meditative Trance):** In contrast, **Alterians** and **Mondi**, while technically not sleeping, engage in meditations throughout the day. This is considered **Light Rest**, where they enter a state of deep contemplation and reflection. During this relaxing state, their minds and bodies find solace, allowing them to recharge and maintain their mental and physical well-being.

The ability of these species to function without extended periods of traditional sleep demonstrates how life flourishes in various forms across the galaxy, each with its own unique set of requirements and characteristics.

### 3. Light Rest (Up to `4 Times per Day`)

A nap or light rest period is a short period of little or no activity that effectively resets encounter traits or features, restores `10 + Stamina Score` Vitality (minimum `5`) and `Key Attribute Modifier` Essence (minimum `1`), and clears `Fatigue/Exhaustion`. It can be performed **up to four times a day**.

The time needed to count as a **Light Rest** depends on the activity level of the character:

1. **Nap or Meditation (`1 Hour`):**
   * This is the most restful period and is ideal for resetting traits or features.
   * During this time, it is important to do nothing else but rest, sleep, or relax.
2. **Lounging (`2 Hours`):**
   * This type of rest period is less intensive than a nap or meditation, but still provides the full Light Rest benefit upon completion.
   * Casual observation, light recreation, and non-laborious activities are allowed during this time.
3. **Light Duty (`3 Hours`):**
   * This type of rest period is the least restful, but still counts as a Light Rest period once completed.
   * Light recreation, casual work, routine watch duty, and minimal labor activities are allowed during this time.

* **Activity Degradation Rule:** Any activities more strenuous than those listed above count against rest. This includes combat, physical labor, intense exercise, and mentally demanding tasks. Each time a strenuous activity is performed during a rest window, it **worsens the rest category by one step** (e.g., **Nap -> Lounging -> Light Duty -> Not Rested**).

### 4. Death & Dying (The Unified Mortality State)

Death is a state reached when a character loses all their Health points and their physiological stability collapses. This can occur due to combat injuries, environmental hazards, or other detrimental effects. However, in Tangent, characters have **Vitality Points** that provide a primary buffer against death.

#### 1. Health vs. Vitality

* **Vitality (`Base 30 + 5 per 1 CP`):** Vitality represents physical endurance, luck, and minor bruising. This is a track of non-lethal damage (never scaled by Stamina).
* **Health (`Base 30 + 5 per 1 CP`):** Health represents physical trauma and structural life force. It is lost from lethal Critical Hits or after Vitality is completely depleted (`0`).

#### 2. The Threshold of Death & The Unified Mortality State

When a character takes damage that reduces them to **0 Health**, the following sequence occurs:

1. **`0 Health` (Incapacitated):** The character falls **Unconscious** immediately. They drop anything they are holding and fall **Prone**. Any excess non-lethal damage is applied to Vitality (if any remains).
2. **Death's Door (The Unified Mortality State):** If **Health is `0`** and **Vitality is depleted (`0`)**, the character enters the **"Death's Door" (Mortality State)** sequence:
   * **Condition:** The character is **Comatose / Unconscious** and severely wounded.
   * **Stability Points & The Clock (`Stamina Score + 5`):** The dying character enters the Mortality State with **Stability Points equal to `Stamina Score + 5`**, losing **1 Stability Point per round** at the start of each turn (or in gritty fast-bleed scenes, having a raw clock of `Stamina Score` rounds, minimum `1` round, to receive medical aid) unless they self-stabilize by rolling a **Fortitude Save (`CR 10 + 1 per round spent dying`)** and succeeding by `5` or more.
   * **Stabilization (`CR 15 Medicine`):** A successful **Knowledge (Medicine) (`CR 15`)** check or the application of healing Metaphysics (*Entropy: Order*) or advanced trauma tech immediately stops the clock. The character remains unconscious at `0 Health` (until healed to `1+ Health`), but is no longer dying.
   * **Death (`0 Stability`):** If the clock runs out (`Stability Points` reach `0`), the character **dies permanently**.
   * **Massive Damage:** If the character takes damage equal to or greater than their **Stamina (`STA`) score** in a single hit while at Death's Door, they **die instantly**.

### 5. Revivification & The High Cost of Dying

**Revivification** is the return-from-the-dead option. It is rare, involves high-level Metaphysics (*Entropy: Order — Revivify*) or Tech (**Tech Level 5** medical resuscitation), and carries a heavy toll—known as **"The High Cost of Dying."**

* **Penalties of Revivification:**
  * **Total Karma Loss:** A revived character immediately **loses ALL remaining Karma Points** (`Karma Pool drops to 0`).
  * **Experience Debt (`-5 AP/CP Debt`):** They suffer a **-5 Experience Debt** due to the profound physiological and metaphysical trauma. This is taken either as an immediate `-5 CP` reduction in a trait (or traits) or as a `-5 AP` reduction in accumulated/future experience awards until the debt is paid in full.

