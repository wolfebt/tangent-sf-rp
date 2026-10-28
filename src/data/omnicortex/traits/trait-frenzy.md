---
id: trait-frenzy
name: Frenzy
trait_tier: Basic
trait_type: Species Trait
category: traits
costs:
  cp: 1
  bp: 1
description: '1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).'
modifiers:
  - target: attr-strength
    value: 2
    type: attribute
    mode: situational
    condition: During Frenzy
    description: +2 Strength during Frenzy
  - target: attr-stamina
    value: 2
    type: attribute
    mode: situational
    condition: During Frenzy
    description: +2 Stamina during Frenzy
  - target: defense-mod
    value: -2
    type: combat
    mode: situational
    condition: During Frenzy
    description: '-2 Defense during Frenzy'
---
# Frenzy

**Category**: TRAITS
**Tier**: Basic
**Type**: Species Trait
**CP Cost**: 1

## Description
Adrenaline-fueled berserker response triggered by physical trauma in combat.

## Mechanics & Benefit
1/day when taking damage, enter frenzy for 1 minute (+2 Con/Str, -2 AC)
