---
id: rule-flying-ram-impact-damage
name: Aerial Ramming & Kinetic Impact Rules
category: rules
description: Damage calculations for aerial collisions and flyer ram attacks.
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

# Aerial Ramming & Kinetic Impact Rules

**Category**: Tactical Combat & Movement  

## Ramming Formula
\text{Aerial Ram Damage} = +1d \text{ per Flight Stage} + 1 \text{ Impact Damage per 10 ft of Movement Speed}

- **Flight Stages**:
  - Flight (Stage 1): +1d damage
  - Sail (Stage 2): +2d damage
  - Surge / Soar (Stage 3): +3d damage
  - Dive (Stage 4): +4d damage
- **Mutual Damage**: Damage applies to ALL involved parties (Attacker and Target(s)).
- **Crash Rules**: Standard crash, structural damage, and stability checks also apply.
