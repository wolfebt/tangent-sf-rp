---
id: rule-movement-fatigue-exhaustion
name: Movement Fatigue & Exhaustion System
category: rules
description: Fatigue check triggers, non-lethal vitality loss, and progression to exhaustion.
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

# Movement Fatigue & Exhaustion System

**Category**: Core Resolution & Survival Rules  

## Trigger & Saving Throw
- **Combat Sprint Trigger**: Sprinting for **5 consecutive rounds** in tactical combat forces a **Stamina-based Fortitude Check (DC 15)**.
- **Hurried Travel Trigger**: Hurried or forced-march travel for **10 minutes** forces a **Stamina-based Fortitude Check (DC 15)**.

## Failure Consequences
- **Vitality Damage**: On a failure, take **5 points of non-lethal Vitality damage**.
- **Exhaustion Trigger**: If Vitality is fully depleted, the character takes **2 points of physical Health damage** and immediately gains the **Exhausted** condition (-2 to all active checks and half movement speed).
- **Recovery**: The Exhausted condition persists until the character takes a **Light Rest (Nap)**.
