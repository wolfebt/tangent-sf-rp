---
id: 3-09-health-vitality-mortality-trauma
name: '3.09 Health, Vitality, Mortality & Trauma (0 Health Rules)'
category: compendium
entry_type: Core Rule
parent: 3.00 COMBAT
order: 9
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
# 3.09 Health, Vitality, Mortality & Trauma (DEATH & DYING)

Death is a state reached when a character loses all their health points. This can occur due to combat injuries, environmental hazards, or other detrimental effects. However, in Tangent, there's a nuance to this: characters have Vitality Points that provide a buffer against death. Tangent does not use Hit Points (HP).

---

## THE MECHANICS OF DYING

### 1. Health vs. Vitality
- **Vitality represents stamina, luck, and minor bruising. This is a track of nonlethal damage.** It is lost first.
- **Health represents physical trauma and structural integrity. It is lost from lethal damage or after Vitality is depleted** (or from Critical Hits).
- **Concussive Damage (Falls, Explosions, Crashes):** Divided equally (50% Vitality / 50% Health) if any defensive reduction is attempted, regardless of success.
- **Structure (Synthetics & Constructs):** Possess no Vitality buffer. All damage is sustained directly by Structure Points (`SP = Vitality + Health`).

---

### 2. The Threshold of Death
When a character takes damage that reduces them to 0 Health, the following sequence occurs:

#### 0 Health (Incapacitated)
The character falls unconscious immediately. They drop anything they are holding and fall Prone. Any excess damage is applied to Vitality (if any remains).

#### Death's Door
If Health is 0 and Vitality is depleted (0), the character enters the **"Death's Door"** state.
- **Condition:** The character is **Comatose** and severely wounded.
- **The Clock:** The character has a number of rounds equal to their **Stamina Score** to receive medical aid (Minimum 1 round).
- **Stabilization:** A successful **Medicine (DC 15)** check or the application of healing magic/tech stops the clock. The character remains unconscious but is no longer dying.
- **Death:** If the clock runs out, the character dies permanently.
- **Massive Damage:** If the character takes damage equal to or greater than their STA score in a single hit while at Death's Door, they die instantly.

---

### 3. Revivification ("The High Cost of Dying")
This is the return from the dead option. It is generally rare, involves high-level Metaphysics or Tech (TL5), and carries a heavy toll—known as "The High Cost of Dying."

#### Penalties:
- A revived character loses **ALL** remaining Karma Points.
- They suffer a **-5 Experience Debt** due to the trauma. This is taken as a reduction in a trait (or Traits) or as a reduction in accumulated/future experience until the debt is paid.
