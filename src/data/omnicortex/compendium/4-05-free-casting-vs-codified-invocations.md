---
id: "4-05-free-casting-vs-codified-invocations"
name: "4.05 Free-Casting vs. Codified Invocations"
category: "compendium"
parent: "4.00 METAPHYSICS"
order: 5
perspective: "both"
entry_type: "Core Rule"
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

# 4.05 Free-Casting vs. Codified Invocations

Adepts can manifest metaphysical phenomena through two fundamentally distinct methodologies: **Spontaneous Free-Casting** and **Codified Invocations**.

---

## Comparison Matrix

| Feature | Codified Invocations | Spontaneous Free-Casting |
| :--- | :--- | :--- |
| **Preparation** | Rote muscle memory etched into neural pathways | Improvised on the fly in real-time narrative |
| **Operational Safety** | **Takes 10 by default** on Discipline check | Must roll $d20$ for every step |
| **Potency Bonus** | **+ Invocation Level added to Discipline check** | No Invocation Level bonus added |
| **Essence Cost** | Scaled strictly to environmental Base DC (0 to 5) | Paid upfront; cost doubled on Attune $\le 0$ |
| **Volatility / Risk** | Highly reliable; minimal backfire risk | **High volatility; failure inflicts Internalized Strain** |
| **Tactical Role** | Battle-tested combat strikes, shields, and teleports | Creative problem-solving and narrative utility |

---

## The Potency Calculation Formula

$$\text{Potency Score} = [\text{Key Ability} + \text{Discipline Skill Level} + \text{Invocation Level} + 10 \text{ (or } d20 \text{)}]$$

- **Attune Check**: Used to determine the Difficulty of the Resistance of an Effect or the Evasion of an Attack.
- **Discipline Check**: Used to determine the severity of Effects and/or Damage.

---

## Metaphysic Checks & Environmental Difficulty

The Base DC for activating an Invocation or Discipline depends on the local operational stress:
- **Very Easy (DC 5)**: Safe Quiet Area, Sanctum, Laboratory, Library. (0 Essence)
- **Easy (DC 10)**: Casual, Non-Hostile Environment, Walking, Passenger in Vehicle. (0 Essence)
- **Average (DC 15)**: Very Active or Hostile Environment, Vigorous Movement, Combat. (1 Essence)
- **Difficult (DC 20)**: Extreme Activity, Crashing, Uncontrolled Fall. (2 Essence)
- **Very Difficult (DC 25)**: High-Intensity Chaos, Environmental Catastrophes. (3 Essence)
- **Nearly Impossible (DC 30)**: Legendary Feats, Global Reality Shifts. (4 Essence)
- **Miraculous (DC 35)**: Progenitor-tier interactions (rarely for PCs). (5 Essence)

---

## Criticals, Surges & Failure Table

- **Critical Success (Natural 20 / Double 10s)**: **+30 bonus to the check** and a dramatic, miraculous improvement of the effect.
- **Critical Mistake (Natural 1 / Double 1s)**: **-10 penalty to the check** and a disastrous backfire (Architect's call).
- **Energy Surge (Attune Check $\le 0$)**: An Attune check resulting in 0 or less becomes an uncontrolled energy surge (wrong target, area effect, collateral damage); **Essence cost for that increment is doubled**.
- **Fizzle / Transposition (Discipline Check $\le 0$)**: Causes an unintended effect, from a dramatic fizzle to transposed elemental energy.
- **Internalized Strain (Failure)**: Failing a check deals **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). This is painful strain from Channeling and cannot be absorbed by Stamina or Armor.
- **Fumble**: Requires a check to see if the caster suffers the effect themselves.

## Game Mechanics Rules
```
CodifiedPotency = KeyMod + DisciplineRank + InvocationLevel + 10 (or d20)
InternalizedStrain = floor(FailureMargin / 5) * 1 NonLethal HP
EnergySurge = Attune <= 0 -> EssenceCost * 2
```

## Gameplay Instructions
Use codified invocations with Take 10 during chaotic gunfights; save spontaneous free-casting for out-of-combat problem solving.

## Designer Notes
Internalized Strain damages biological or synthetic vitality directly and bypasses all Armor DR.
