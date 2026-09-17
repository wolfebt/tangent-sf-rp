---
id: "0-06-system-scaling-matrix"
name: "0.06 System Scaling & 14-Tier Size Categories Matrix"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 6
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
tags: ["compendium","volume-0","scaling","size-categories","core-rule","1.10-scaling"]
updatedAt: "2026-09-15T07:48:15.249Z"
costs:
  bp: 0
modifiers: []
---

# 0.06 System Scaling & 14-Tier Size Categories Matrix

This scaling system determines how a creature or object's size affects its attributes, weapon damage dice, speed, ranges, stealth, and defense abilities.

---

## 1. The Master 14-Tier Size Matrix

| SIZE CATEGORY | SCALING MODIFIER* | STRENGTH MODIFIER | COMBAT MODIFIER | STEALTH MODIFIER | HEIGHT / LENGTH | WEIGHT | REACH |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Miniscule** | -5ds (1/12) | -32 | +32 | +20 | < 1 in | < 1 oz | 1 in |
| **Fine** | -4ds (1/6) | -16 | +16 | +16 | < 6 in | < ⅛ lb | 6 in |
| **Diminutive** | -3ds (1/3) | -8 | +8 | +12 | < 1 ft | < 1 lb | 1 ft |
| **Tiny** | -2ds (1/2) | -4 | +4 | +8 | < 2 ft | < 8 lbs | 2 ft |
| **Small** | -1ds (2/3) | -2 | +2 | +4 | < 4 ft | < 60 lbs | 3 ft |
| **Medium** | **(Base)** | **+/-0** | **+/-0** | **+/-0** | **< 8 ft** | **< 500 lbs** | **5 ft** |
| **Large** | x2 | +2 | -2 | -4 | < 16 ft | < 2 tons | 10 ft |
| **Huge** | x5 | +4 | -4 | -8 | < 32 ft | < 16 tons | 15 ft |
| **Gargantuan** | x10 | +8 | -8 | -16 | < 64 ft | < 125 tons | 20 ft |
| **Colossal** | x20 | +16 | -16 | -32 | < 128 ft | < 1K tons | 25 ft |
| **Enormous **** | x40 | +32 | -32 | NO | < 512 ft | < 16K tons | — |
| **Titanic **** | x80 | +64 | -64 | NO | < 1,024 ft | < 144K tons | — |
| **Super Gargantuan **** | x160 | +128 | -128 | NO | < 5,280 ft | < 50M tons | — |
| **Mega Colossal **** | x320 | +256 | -256 | NO | 1 Mile+ | 50M tons+ | — |

*** Die Steps (-1 to -5 ds):** Lowers the die side value accordingly:  
d10 &rarr; d8, d8 &rarr; d6, d6 &rarr; d4, d4 &rarr; d3, d3 &rarr; d2, d2 &rarr; 1 point minimum.  
Scaling Multipliers are applied to **Weapon Dice, Speed, Area, Ranges, and Carrying Capacity**.

**** Starship Scale (Enormous+):** Modifiers are extreme vs. Medium targets.  
- **Proximity Damage:** Overwhelming attacks from capital ships often simply vaporize small targets in the direct blast and **ALSO deal 1/10 Indirect Damage** (splash effect, debris, etc.) to targets not directly hit (within a radius equal to half the Strength Modifier in feet).  
*(Example: A Titanic capital ship fires on a colony—the blast vaporizes small targets with an x80 damage multiplier and deals one-tenth of that damage to a 32-ft radius for overblast and debris).*

---

## 2. Scaling in Tactical Combat

Damage is **NOT** reduced due to a target being a larger size. Larger targets possess proportionally increased Structure Points (SP) and Damage Reduction (DR) from heavier frames and armor plating:

1. **Attack Rolls:** The attacker's size does not directly modify attack rolls, but larger creatures gain reach advantages.
2. **Damage & Structure:** Weapon Dice, Structure Points, Speeds, and Ranges are multiplied by the Scaling Modifier.
3. **Defense:** The Combat Modifier adjusts Defense based on relative size.
4. **Distance:** Speed and weapon ranges scale directly with size.

---

## 3. Relative Size Combat Calculations

Shown Combat Modifiers are calibrated against Medium targets; relative modifiers are fluid:

### Larger Attacker vs Smaller Target
- **Target is Smaller than Medium:** Subtract target's Combat Modifier from attacker's Combat Modifier:  
  $$\text{Actual Modifier} = \text{Attacker Mod} - \text{Target Mod}$$  
  *(Example: Large [-2] attacks Small [+2]: $-2 - 2 = -4$, granting Small significant advantage).*
- **Target is Larger than Medium (but smaller than attacker):** Divide attacker's Combat Modifier by defender's:  
  $$\text{Actual Modifier} = \text{Attacker Mod} / \text{Defender Mod}$$  
  *(Example: Huge [-4] attacks Large [-2]: $-4 / -2 = -2$, granting Large moderate advantage).*

### Smaller Attacker vs Larger Target
- **Target is Larger than Medium:** Subtract target's Combat Modifier from attacker's Combat Modifier:  
  $$\text{Actual Modifier} = \text{Attacker Mod} - \text{Target Mod}$$  
  *(Example: Small [+2] attacks Large [-2]: $2 - (-2) = +4$, granting Small a +4 attack advantage).*
- **Target is Smaller than Medium (but larger than attacker):** Divide attacker's Combat Modifier by defender's:  
  $$\text{Actual Modifier} = \text{Attacker Mod} / \text{Defender Mod}$$  
  *(Example: Tiny [+4] attacks Small [+2]: $4 / 2 = +2$, granting Tiny moderate advantage).*

---

## 4. Meta-Tech & Invocation Chassis Scaling

When a Meta-Tech device is installed into a vehicle Mount or Module, it draws power from the host vehicle's reactor core:
$$\text{Final Invocation Parameter} = \text{Base Value} \times \text{Chassis Scale Multiplier}$$
*(Applies to Damage Dice, Range, and Area. Save DCs remain unaffected).*

## Game Mechanics Rules
```
Scaling Multiplier: Weapon Dice, Speed, Range, Area * Multiplier.
Proximity Splash: Capital Ship blast deals 1/10 damage in radius of (Strength Mod / 2) feet.
Relative Combat Mod: Fluid opposed modifier based on relative Attacker and Defender size tiers.
Meta-Tech Scaling: Final Damage Dice = Base Damage Dice * Chassis Scale Multiplier.
```

## Gameplay Instructions
Refer to 1.10 SCALING.md in docs/game rules/operator/ for complete sizing tables and starship proximity parameters.

## Designer Notes
Canonical Tangent SF RP 14-Tier Size Scaling System verbatim from 1.10 SCALING.md.
