---
id: 0-03-bastion-tactical-assistant-manual
name: 0.03 BASTION Tactical Assistant & Engine Manual
category: compendium
entry_type: Role Reference
parent: 0.00 SYSTEM ROLES & ARCHITECTURE
order: 3
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
- /roll [count]d[sides]+[mod]
- Examples:
  - /roll d20+6 — Standard attack or skill check.
  - /roll 2d10+4 — Heavy energy blaster damage roll.
  - /roll 3d6+2 — Kinetic slug thrower burst roll.

---

## 2. Core Resolution Formulas

BASTION evaluates mathematical equations across the three modules (**Omnicortex**, **Story Foundry**, and **Persona Folio**):

### Attack & Strike Calculation
\text{Total Strike} = d20 + \text{Skill Rank} + \text{Attribute Mod} + \text{Weapon Mod} + \text{Situational Mod}

### Armor Penetration & Effective Damage
\text{Effective Damage} = \text{Incoming Damage} - \max(0, \text{Armor DR} - \text{Armor Piercing (AP)})

### Metaphysic Potency
\text{Potency Score} = \text{Key Ability} + \text{Discipline Skill Level} + \text{Invocation Level} + 10 \text{ (or } d20 \text{)}

---

## 3. Database Schemas & Relational Integrity

BASTION enforces strict data validation across all DBM collections:
- **Relational Linking:** Items link to prerequisites, species link to inherent traits, and features link to skill requirements.
- **Bi-directional Sync:** Folio character sheets dynamically query Omnicortex DBM entries in real time.
