---
id: "1-01-05-death-dying-revivification"
name: "1.01.05 Death, Dying & Revivification"
category: "compendium"
parent: "1.00 CHARACTER CREATION & ECONOMY"
order: 6
perspective: "operator"
entry_type: "Operator Rule"
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

# 1.01.05 Death, Dying & Revivification

In Tangent, characters are protected by a two-tiered health buffer, but lethal trauma requires swift medical intervention.

---

## 1. The Threshold of Death

When a character's Health drops to **0 HP**:
1. **Incapacitation:** The character immediately falls unconscious, drops held items, and gains the **Prone** condition.
2. **Death's Door:** If both Health and Vitality are at 0, the character is dying and enters a comatose state.
3. **The Death Clock:** The character has a number of rounds equal to their **Stamina Score** (Minimum 1 round) to receive medical aid.
4. **Stabilization:** A successful **Medicine check (DC 15)** or trauma nanite injection halts the death clock.
5. **Massive Damage:** Taking damage equal to or exceeding their Stamina score in a single hit while at Death's Door causes instant death.

---

## 2. Revivification ("The High Cost of Dying")

Returning a character from the dead requires advanced TL5 medical clone synthesis or high-tier ML5 Metaphysics:
- **Penalties:** The revived character loses all remaining Karma Points and incurs a **-5 Experience Debt** until repaid through heroic gameplay.

## Game Mechanics Rules
```
DeathClock_Rounds = max(1, StaminaScore)
Stabilization_DC = Medicine DC 15
Revive_Penalty = Lose All Karma + 5 XP Debt
```

## Gameplay Instructions
Allies should prioritize stabilizing downed teammates within their Stamina round window.

## Designer Notes
Revivification should be a rare, momentous narrative arc rather than a routine transaction.
