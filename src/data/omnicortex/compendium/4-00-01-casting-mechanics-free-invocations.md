---
id: "4-00-01-casting-mechanics-free-invocations"
name: "4.00.01 Casting Mechanics (Free-Casting vs Invocations)"
category: "compendium"
parent: "4.00 METAPHYSICS & REALITY MANIPULATION"
order: 2
perspective: "operator"
entry_type: "Metaphysics Rule"
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

# 4.00.01 Casting Mechanics (Free-Casting vs Invocations)

Practitioners of Metaphysics can manipulate reality through two distinct methodologies: **Spontaneous Free-Casting** and **Codified Invocations**.

---

## 1. The Potency Calculation Formula

$$\text{Potency Score} = [\text{Key Ability} + \text{Discipline Skill Level} + \text{Invocation Level} + 10 \text{ (or } d20 \text{)}]$$

- **Attune Check**: Used to determine the Difficulty of the Resistance of an Effect or the Evasion of an Attack.
- **Discipline Check**: Used to determine the severity of Effects and/or Damage.

---

## 2. Codified Invocations (Operational Safety)
- Invocations represent rote muscle memory etched into neural pathways.
- **Bonus**: Invocation Levels are added directly to the Discipline Skill checks they are based on *(Invocations are considered Discipline Specializations)*.
- **Operational Safety**: The user effectively **"Takes 10"** by default on the Discipline check:
  $$\text{Default Potency} = \text{Key Ability Mod} + \text{Discipline Skill Level} + \text{Invocation Level} + 10$$
  *(A roll using d20 may still be attempted if a better result is desired).*

---

## 3. Spontaneous Free-Casting
- Involves a narrative of the effect within the confines of the Discipline’s level.
- **Process**: Make an Attune check to draw/channel energy (sets DC/Attack), followed by a Discipline Skill check for severity.
- **Risks**: High volatility; Essence is spent upfront, and failure inflicts Internalized Strain.

---

## 4. Criticals, Surges & Failures
- **Critical Success**: **+30 bonus to the check** and dramatic improvement of the effect.
- **Critical Mistake**: **-10 to the check** and disastrous backfire (Architect's call).
- **Energy Surge (Attune $\le 0$)**: Uncontrolled energy surge (wrong target, collateral area); **Essence cost is doubled**.
- **Fizzle / Transposition (Discipline $\le 0$)**: Dramatic fizzle to transposed energy.
- **Internalized Strain (Failure)**: Failing a check deals **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). Cannot be soaked by Stamina or Armor.
- **Fumble**: Requires a check to see if the caster suffers the effect themselves.

## Game Mechanics Rules
```
CodifiedPotency = KeyMod + DisciplineRank + InvocationLevel + 10 (or d20)
InternalizedStrain = floor(FailureMargin / 5) * 1 NonLethal HP
EnergySurge = Attune <= 0 -> EssenceCost * 2
```

## Gameplay Instructions
Use codified invocations for reliable Take 10 operational safety in combat; use free-casting for flexible narrative problem solving.

## Designer Notes
Internalized Strain cannot be absorbed by Stamina or Armor DR, representing direct biological strain.
