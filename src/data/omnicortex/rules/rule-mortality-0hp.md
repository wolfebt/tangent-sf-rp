---
id: rule-mortality-0hp
name: The Mortality State (0 Hit Points)
category: rules
description: >-
  At 0 HP: Prone, Incapacitated, Bleeding Out (1 Stability Damage/turn),
  Stability Threshold = CON + 5, Death at 0 Stability.
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
# The Mortality State (0 Hit Points)

**Category**: Core Combat Rules & Tables

When a character's Health Points reach 0, they immediately enter the **Mortality State**:
1. **Unconscious and Incapacitated**: The character immediately falls Prone and is Incapacitated.
2. **Bleeding Out**: At the beginning of the character's turn, they suffer **1 point of Stability Damage**.
3. **Stability Threshold**: A character has a Stability Points total equal to their **Constitution Score + 5**.
4. **Death**: If a character's Stability Points are reduced to 0, they are considered dead.
5. **Stabilization and Recovery**: The character stops Bleeding Out and is stabilized if they receive any magical healing or a successful **Medicine Check (DC 15)** is made to aid them.
