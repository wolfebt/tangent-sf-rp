---
id: "0-03-bastion-tactical-assistant-manual"
name: "0.03 BASTION Tactical Assistant & Engine Manual"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 3
perspective: "both"
entry_type: "Core Engine Manual"
tl: 3
ml: 0
cost: 0
tags: ["compendium","core-engine-manual"]
updatedAt: "2026-09-02T09:16:58.894Z"
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

# 0.03 BASTION Tactical Assistant & Engine Manual

**BASTION** is the integrated Tactical AI Assistant, rules adjudication engine, and combat computation system for the Tangent Science Fantasy Roleplay suite.

---

## 1. System Architecture & Command Syntax

BASTION processes user directives, parses tactical encounters, calculates odds, and resolves dice commands:

### Dice Rolling Engine Syntax
- `/roll [count]d[sides]+[mod]`
- Examples:
  - `/roll d20+6` — Standard attack or skill check.
  - `/roll 2d10+4` — Heavy energy blaster damage roll.
  - `/roll 3d6+2` — Kinetic slug thrower burst roll.

---

## 2. Core Resolution Formulas

BASTION evaluates mathematical equations across the three modules (**Omnicortex**, **Story Foundry**, and **Persona Folio**):

### Attack & Strike Calculation
`Total Strike = d20 + Skill Rank + Attribute Mod + Weapon Mod + Situational Mod`

### Armor Penetration & Effective Damage
`Effective Damage = Incoming Damage - max(0, Armor DR - Armor Piercing (AP))`

### Metaphysic Potency
`Potency Score = Key Ability + Discipline Skill Level + Invocation Level + 10 (or d20)`

---

## 3. Database Schemas & Relational Integrity

BASTION enforces strict data validation across all DBM collections:
- **Relational Linking:** Items link to prerequisites, species link to inherent traits, and features link to skill requirements.
- **Bi-directional Sync:** Folio character sheets dynamically query Omnicortex DBM entries in real time.

## Game Mechanics Rules
```
Input: /roll 2d20kh1+5 -> Roll 2d20, Keep Highest 1, Add 5 (Advantage Check)
Damage Soak: EffectiveHP_Loss = max(1, RawDamage - max(0, TargetDR - WeaponAP))
```

## Gameplay Instructions
Type /roll in the BASTION chat bar to execute instant dice operations.
Ask BASTION for rule lookups, NPC generation, and combat odds analysis.

## Designer Notes
BASTION is strictly attuned to the Tangent SFF RPG rulebook and prioritizes mathematical precision.
