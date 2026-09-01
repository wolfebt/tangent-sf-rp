---
id: "3-00-03-attack-defense-modifiers"
name: "3.00.03 Attack & Defense Modifiers (Size, Range, Movement)"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 4
perspective: "architect"
entry_type: "Combat Matrix"
tl: 3
ml: 0
cost: 0
tags: ["compendium","combat-matrix"]
updatedAt: "2026-09-01T20:54:33.508Z"
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

# 3.00.03 Attack & Defense Modifiers (Size, Range, Movement)

Complete reference matrices for target size modifiers, weapon range brackets, moving targets, and moving attackers.

---

## 1. Target Size Modifiers Matrix

| Size | Modifier (Target DC) |
| :--- | :---: |
| **Miniscule** | **-32** |
| **Fine** | **-16** |
| **Diminutive** | **-8** |
| **Tiny** | **-4** |
| **Small** | **-2** |
| **Medium** | **0** |
| **Large** | **+2** |
| **Huge** | **+4** |
| **Gargantuan** | **+8** |
| **Colossal** | **+16** |

---

## 2. Range Brackets & Reach Matrix

| Category | Modifier (DC) | Range Bracket |
| :--- | :---: | :--- |
| **Melee** * | **0 (15)** | WITHIN REACH |
| **Point Blank** ** | **+5 (10)** | WITHIN REACH |
| **Short** | **0 (15)** | Base Range Listed |
| **Medium** | **-5 (20)** | 2x Base Range |
| **Long** | **-10 (25)** | Up to 5x Base Range |
| **Extreme** | **-15 (30)** | Up to 10x Base Range |

\* **Melee Reach by Size**: Tiny and Smaller 2 ft, Small and Medium 5 ft, Large and Huge 10 ft.  
\*\* **Point Blank Rule**: For Ballistic and Energy Weapons, shots striking at Point Blank inflict **Damage with Advantage** (rolling damage dice twice and taking highest result) in addition to the listed **+5 Strike bonus**.

---

## 3. Moving Targets & Attackers Tactical Matrix

| Category | Rule | Defender | Attacker | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **MOVING TARGETS** | Running Penalty | — | -2 Attack | Applies to ranged attacks. |
| | Distance-Based (20+ ft) | +2 Defense | — | For movement 20+ feet in a round. |
| | Distance-Based (40+ ft) | +4 Defense | — | For movement 40+ feet in a round. |
| | Total Defense / Dodge | +4 Defense | — | Requires an action to focus on evasion (moving at base speed). |
| | Opportunity Attacks | Provoke AoO | Attack of Opportunity | Defender's movement triggers the attack. |
| **MOVING ATTACKERS** | Ranged Attack Penalty (Running) | — | -2 Attack | For attackers moving quickly (running). |
| | Mounted Movement (Double Move) | — | -4 Attack | Firing ranged weapon from mount moving double speed. |
| | Mounted Movement (Running/Quad) | — | -8 Attack | Firing ranged weapon from mount moving quadruple speed. |
| | Aiming Bonus | — | +2 per round up to AGIx2 + 2 | Requires 'Aim' move action; cannot move before shooting. |
| | Charging | -2 Defense | -2 Attack | Must move at least 10 feet in straight line toward an enemy. |
| **MOVEMENT & ACTION** | Iterative Attacks | — | 1 Attack Action | If moving more than a 5-foot step. |
| | Difficult Terrain | x1/2 Movement | x1/2 Speed, -2 Attacks | -4 to Attacks if Movement reduced to 1/4. Jarring motion. |
| | Range Increments | — | -2 cumulative per category | Common ranged combat modifier. |

## Game Mechanics Rules
```
TargetDC = 15 + SizeMod + RangePenalty + MoveMod
Point Blank: +5 Strike & Roll Damage with Advantage
Iterative limit: Moving > 5ft restricts to 1 attack action
```

## Gameplay Instructions
Consult this table whenever resolving ranged attacks against moving, distant, or unusual sized targets.

## Designer Notes
All Range Penalties are Doubled during automatic fire.
