---
id: skill-steady
name: Steady
category: features
feature_category: Skill
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: None
description: The character has excellent balance and steady hands.
costs:
  cp: 3
  bp: 3
modifiers:
  - target: Reflex
    type: save
    value: 1
    mode: inherent
    description: +1 on Reflex Checks
  - target: physical-acrobatics
    type: skill
    value: 2
    mode: conditional
    isSituational: true
    condition: Balancing and ledge navigation
    description: +2 to Acrobatics (Balancing)
  - target: physical-athletics
    type: skill
    value: 2
    mode: conditional
    isSituational: true
    condition: Hull and rock climbing
    description: +2 to Athletics (Climbing)
keywords: 'steady, skill, special-feature, excellent, balance'
negative_keywords: 'incompetent, untrained, vulnerable'
cost_cp: 3
mechanic: >-
  Gain a **\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing)
  and a **\+1 Bonus** to **Reflex** checks.
---
# Steady

**Category**: Skill Features  
**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  
**Prerequisite**: None

## Description
The character has excellent balance and steady hands.

## Mechanics & Benefit
Gain a **\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\+1 Bonus** to **Reflex** checks.
