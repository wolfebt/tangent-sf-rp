---
id: rule-metafocus-damage
name: 'Metafocus: Invocations & Damage Resolution'
category: rules
description: >-
  The universal potency calculation, damage scaling per stage, Attune attack rolls,
  and opposed Counter Effect resolution.
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

# Metafocus: Invocations & Damage Resolution

**Category**: Core Metaphysics & Combat Rules  

## 1. The Potency & Severity Calculation
The potency of any metaphysical effect is calculated as follows:

$$\text{Potency Score} = [\text{Key Ability} + \text{Discipline Skill Level} + \text{Invocation Level} + 10 \text{ (or } 2d10 \text{)}]$$

- **Attune Check**: Used to determine the Difficulty of the Resistance of an Effect or the Evasion of an Attack.
- **Discipline Check**: Used to determine the severity of Effects and/or Damage.

---

## 2. Damage Calculation
- **Standard Scaling**: **1d6 per Stage achieved** with the check (after all modifiers).
  - Novice (Stage 1): 1d6
  - Trained (Stage 2): 2d6
  - Expert (Stage 3): 3d6
  - Master (Stage 4): 4d6
  - Pinnacle (Stage 5): 5d6
- **Discipline Exception**: Specific Disciplines, like **Force** (under Energy), utilize **d8s** as a specific exception (`1d8 per Stage`), but `d6` is the standard across all other disciplines.

---

## 3. Meta Combat & Attack Resolution
- **Attack Roll**: **Attune** is used for the Attack Roll.
- **Target Defense**: Target defense is treated similarly to physical or ranged attacks (Evasion / Reflex / Will depending on effect type).
- **Damage, Range & Factors**: Determined by the level of the active Metafocus Skill and Invocation.

---

## 4. Counter Effect (Nullification)
A defender may actively attempt to nullify an incoming metaphysical effect:

- **Step 1 (Attune Opposed)**: **Attune** is rolled by both Attacker and Defender.
- **Step 2 (Opposed Metafocus Check)**: If the Defender achieves a higher success on the Attune check, they may immediately make an **Opposed Metafocus Skill check** against the incoming effect.
- **Resolution**:
  - If the **Attacker succeeds** the opposed check, the Effect resolves normally.
  - If the **Defender wins**, the incoming Effect is completely **countered and nullified**.
