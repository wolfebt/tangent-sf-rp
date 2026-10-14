---
id: special-uncanny-sense
name: Uncanny Sense
category: features
feature_category: Special
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: Acute Sense (in the corresponding sense)
description: >-
  The character’s senses are so sharp they verge on precognition. It is nearly
  impossible to hide from them.
costs:
  cp: 3
  bp: 3
modifiers:
  - target: mental-general-alertness
    type: check_advantage
    value: 1
    mode: conditional
    isSituational: true
    condition: Checks relying on chosen acute sense
    description: >-
      Advantage on Awareness checks relying on chosen sense (Roll 3d10, take
      best 2)
keywords: 'uncanny sense, special, special-feature, uncanny, feature:, awareness'
negative_keywords: 'incompetent, untrained, vulnerable'
cost_cp: 3
mechanic: You roll all **Awareness Checks** using the chosen sense with **Advantage**.
---
# Uncanny Sense

**Category**: Special Features  
**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  
**Prerequisite**: Acute Sense (in the corresponding sense)

## Description
The character’s senses are so sharp they verge on precognition. It is nearly impossible to hide from them.

## Mechanics & Benefit
You roll all **Awareness Checks** using the chosen sense with **Advantage**.
