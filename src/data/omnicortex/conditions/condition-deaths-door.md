---
id: condition-deaths-door
name: Death's Door
category: conditions
description: Health is 0 and Vitality is 0. Comatose and severely wounded. Has rounds equal to Stamina score to be stabilized.
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

# Death's Door

**Category**: Tactical Conditions & Status Effects

## Mechanics & Debuffs
If Health is 0 and Vitality is depleted (0), the character enters the **"Death's Door"** state.

- **Condition:** The character is **Comatose** and severely wounded.
- **The Clock:** The character has a number of rounds equal to their **Stamina Score** to receive medical aid (Minimum 1 round).
- **Stabilization:** A successful **Medicine (DC 15)** check or the application of healing magic/tech stops the clock. The character remains unconscious but is no longer dying.
- **Death:** If the clock runs out, the character dies permanently.
- **Massive Damage:** If the character takes damage equal to or greater than their STA score in a single hit while at Death's Door, they die instantly.
