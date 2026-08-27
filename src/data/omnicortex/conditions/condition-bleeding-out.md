---
id: condition-bleeding-out
name: Bleeding Out
category: conditions
description: >-
  At 0 Health, character loses 1 point of Stability Damage at start of turn
  until stabilized or dead at 0 Stability Points.
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
# Bleeding Out

**Category**: Tactical Conditions & Status Effects

## Mechanical Effect
At the beginning of the character's turn while at 0 Health, they suffer **1 point of Stability Damage**. If Stability Points reach 0, the character suffers **permanent death**.

## Stability Threshold
A character has a Stability Points total equal to their **Constitution Score + 5**.

## Cure / Removal
Stabilized if the character receives any magical healing or an ally makes a successful **Medicine Check (DC 15)**.
