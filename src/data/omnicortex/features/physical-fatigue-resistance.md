---
id: physical-fatigue-resistance
name: Fatigue Resistance
category: features
feature_category: Physical
cost_bp: 2
is_ranked: false
is_multiple: false
prerequisites: Robust Physiology or Inexhaustible Stamina
description: >-
  Metabolic efficiency and lactic acid recycling grant Advantage on all Fatigue
  checks and double the duration between required endurance checks.
costs:
  cp: 2
  bp: 2
modifiers:
  - target: physical-endurance
    type: save_advantage
    value: 1
    mode: conditional
    isSituational: true
    condition: Resisting fatigue and physical exhaustion
    description: >-
      Advantage on all checks and saves to resist fatigue and exhaustion (Roll
      3d10, take best 2)
keywords: 'fatigue-resistance, stamina, endurance, advantage, builder, infantry, murex'
negative_keywords: 'exhausted, frail, low-stamina'
cost_cp: 2
---

# Fatigue Resistance

**Category**: Physical Features  
**Cost**: 2 CP  
**Prerequisites**: Robust Physiology or Inexhaustible Stamina  

## Description
The organism possesses highly optimized metabolic pathways that rapidly process and recycle lactic acid, preventing cellular exhaustion during prolonged manual labor or forced marches.

## Mechanics & Benefit
- **Endurance Advantage**: All saving throws and ability checks made to resist fatigue, exhaustion, environmental heat/cold exertion, or starvation/dehydration intervals are made with **Advantage**.
- **Extended Interval Time**: The duration required between successive fatigue checks (e.g., forced marching, extended labor, sleep deprivation) is **doubled**.
