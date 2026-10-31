---
id: rule-damage-calculation
name: Master Damage Formula & Resolution
category: rules
description: >-
  Weapon Die + Ability Mod + Precision Damage - Armor DR - Target STA = Total
  Damage. Active defense counters precision.
costs:
  cp: 0
  bp: 0
modifiers: []
---
# Master Damage Formula & Resolution

**Category**: Core Combat Rules & Tables

## The Damage Formula
$$\text{Total Damage} = (\text{Weapon Die Damage} + \text{Relevant Ability Mod} + \text{Precision Damage}) - (\text{Target Armor DR} + \text{Target STA Mod})$$

### Components
1. **Weapon Die Damage**: Base damage rolled from the weapon used or invocation cast.
2. **Relevant Ability**: Physical prowess or metaphysical potency added to damage (e.g. Strength, Agility, Intellect, Charisma, Wisdom).
3. **Precision Damage**: Bonus directly from the attacker's skill level (relative Combat or Focus Skill) and tactical advantages.
4. **Target's Armor DR**: Subtracted based on armor effectiveness against that specific damage type.
5. **Target's STA**: Target's Stamina modifier is subtracted, reflecting innate physiological resilience.

---

## Active Defense & Sneak Attack Modifiers
- **Active Defense Counter**: A target who is actively defending will reduce incoming damage by their **Defense score** (directly countering Precision Damage).
- **Sneak Attack Condition**: Sneak Attack damage is added **only if at least 1 point of damage affects the target** after Armor DR is penetrated, evaluated before the target's Stamina/STA modifier.
