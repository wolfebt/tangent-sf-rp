---
id: rule-damage-calculation
name: Master Damage Formula & Resolution
category: rules
description: >-
  Weapon Die + Ability Mod + Precision Damage - Armor DR - Target CON = Total
  Damage. Active defense counters precision.
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
# Master Damage Formula & Resolution

**Category**: Core Combat Rules & Tables

## The Damage Formula
$$\text{Total Damage} = (\text{Weapon Die Damage} + \text{Relevant Ability Mod} + \text{Precision Damage}) - (\text{Target Armor DR} + \text{Target CON Mod})$$

### Components
1. **Weapon Die Damage**: Base damage rolled from the weapon used or invocation cast.
2. **Relevant Ability**: Physical prowess or metaphysical potency added to damage (e.g. Strength, Agility, Intelligence, Charisma, Wisdom).
3. **Precision Damage**: Bonus directly from the attacker's skill level (relative Combat or Focus Skill) and tactical advantages.
4. **Target's Armor DR**: Subtracted based on armor effectiveness against that specific damage type.
5. **Target's CON**: Target's Constitution modifier is subtracted, reflecting innate physiological resilience.

---

## Active Defense & Sneak Attack Modifiers
- **Active Defense Counter**: A target who is actively defending will reduce incoming damage by their **Defense score** (directly countering Precision Damage).
- **Sneak Attack Condition**: Sneak Attack damage is added **only if at least 1 point of damage affects the target** after Armor DR is penetrated, evaluated before the target's Stamina/CON modifier.
