---
id: rule-metaphysics-casting-checks
name: 'Metaphysic Checks, Difficulty & Critical Outcomes'
category: rules
description: >-
  Base DCs (5–35), Free-Casting vs Codified Invocations, Take 10 operational safety,
  Critical Success (+30), Critical Mistake (-10), Energy Surge, Fizzle, and Strain.
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

# Metaphysic Checks, Difficulty & Critical Outcomes

**Category**: Core Metaphysics & Adjudication Rules  

Metaphysical actions are resolved through the distinct interplay of the **Attune Check** (drawing and targeting energy) and the **Discipline Check** (shaping severity, magnitude, and damage).

---

## 1. Free-Casting vs. Codified Invocations

### Free-Casting (Spontaneous)
- Involves narrating an improvised effect within the thematic sphere of the character's active Discipline.
- **Process**:
  1. Make an **Attune check** to draw and channel energy (sets resistance DC or attack roll).
  2. Make a **Discipline check** to determine severity, magnitude, and area.
- **Risks**: High volatility; Essence is consumed upfront, and failures inflict Internalized Strain.

### Invocations (Codified)
- Represents perfected, rote muscle memory etched into neural pathways.
- **Bonus**: Invocation Levels are added directly to the Discipline Skill checks they are based on *(Invocations are considered Discipline Specializations)*.
- **Operational Safety**: The user effectively **"Takes 10"** by default on the Discipline check:
  $$\text{Default Potency} = \text{Key Ability Mod} + \text{Discipline Skill Level} + \text{Invocation Level} + 10$$
- A roll (using $2d10$ instead of 10) may still be voluntarily attempted if a higher result is desired.

---

## 2. Metaphysic Checks & Difficulty Scale

Base DC for activating a Metafocus Discipline or Invocation:
- **Very Easy (DC 5)**: Safe Quiet Area, Sanctum, Laboratory, Library. (0 Essence)
- **Easy (DC 10)**: Casual, Non-Hostile Environment, Walking, Passenger in Vehicle. (0 Essence)
- **Average (DC 15)**: Very Active or Hostile Environment, Vigorous Movement, Combat. (1 Essence)
- **Difficult (DC 20)**: Extreme Activity, Crashing, Uncontrolled Fall. (2 Essence)
- **Very Difficult (DC 25)**: High-Intensity Chaos, Environmental Catastrophes. (3 Essence)
- **Nearly Impossible (DC 30)**: Legendary Feats, Global Reality Shifts. (4 Essence)
- **Miraculous (DC 35)**: Progenitor-tier interactions (rarely for PCs). (5 Essence)

---

## 3. Criticals, Surges & Failures

| Outcome | Trigger / Condition | Mechanical Effect |
| :--- | :--- | :--- |
| **Critical Success** | Natural 20 / Double 10s | **+30 bonus to the check** and a dramatic, transcendent improvement of the effect. |
| **Critical Mistake** | Natural 1 / Double 1s | **-10 penalty to the check** and a disastrous metaphysical backfire (GM's call). |
| **Energy Surge** | Attune Check $\le 0$ | Uncontrolled energy surge (wrong target, collateral area, unintended consequence); **Essence cost is doubled**. |
| **Fizzle / Transposition** | Discipline Check $\le 0$ | Effect produces unintended results, ranging from a dramatic fizzle to transposed energy states. |
| **Internalized Strain** | Check Failure | Inflicts **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). Cannot be soaked by Armor DR or Stamina. |
| **Fumble** | Severe Fumble | Requires an immediate check to see if the caster suffers the full effect themselves. |
