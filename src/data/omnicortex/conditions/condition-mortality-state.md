---
id: condition-mortality-state
name: Mortality State (0 HP)
category: conditions
description: >-
  When Health reaches 0, character falls Prone, is Incapacitated, and enters the
  Bleeding Out state.
costs:
  bp: 0
modifiers: []
---
# The Mortality State (0 Hit Points)

**Category**: Tactical Conditions & Status Effects

## Mechanics & Conditions
When a character's Health Points reach 0, they immediately enter the **Mortality State**:
- **Unconscious and Incapacitated**: Immediately falls Prone and is Incapacitated.
- **Bleeding Out**: Suffers 1 point of Stability Damage at the beginning of each turn.
- **Stability Threshold**: Stability Points equal **Constitution Score + 5**.
- **Death**: Reaching 0 Stability Points results in permanent death.
- **Stabilization**: Magical healing or a successful **Medicine Check (DC 15)** stops the Bleeding Out state.
