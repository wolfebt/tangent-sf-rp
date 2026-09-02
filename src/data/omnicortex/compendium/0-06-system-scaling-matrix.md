---
id: "0-06-system-scaling-matrix"
name: "0.06 System Scaling & Scale Tiers Matrix (Tier 0 to Tier 5)"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 6
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-0","scaling","tiers","core-rule"]
updatedAt: "2026-09-02T09:16:58.895Z"
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

# 0.06 System Scaling & Scale Tiers Matrix (Tier 0 to Tier 5)

Tangent scales combat, armor hardness, and weapon devastation across 6 distinct Scale Tiers:

---

## Scale Tier Classification Table
| Tier | Scale Domain | Benchmark Entities | Damage Multiplier vs Sub-Tier | Armor Hardness Multiplier |
| :---: | :--- | :--- | :---: | :---: |
| **Tier 0** | **Personal / Micro** | Operatives, civilian drones, cyber-pets, personal handguns. | **1x** (Baseline) | **1x** (Standard DR) |
| **Tier 1** | **Tactical / Light Vehicle**| Combat buggies, light support walkers, mounted heavy machine guns. | **2x** vs Tier 0 | **2x** Hardness |
| **Tier 2** | **Heavy Mecha / Armor** | Heavy combat mecha, main battle tanks, heavy defense turrets. | **5x** vs Tier 0 | **5x** Hardness |
| **Tier 3** | **Gunship / Small Vessel** | Dropships, corvettes, gunboats, planetary bunker emplacements. | **10x** vs Tier 0 | **10x** Hardness |
| **Tier 4** | **Capital Starship** | Cruisers, star destroyers, orbital defense stations. | **50x** vs Tier 0 | **50x** Hardness |
| **Tier 5** | **Super-Dreadnought / Cosmic**| World-ships, planetary battlestations, deific entities. | **250x** vs Tier 0 | **250x** Hardness |

---

## Cross-Tier Damage & Defense Rules
- **Attacking Downwards (Macro vs Micro):** Attacks deal massive scaling splash damage; personal targets hit by Tier 2+ weapons make Reflex saves to avoid instant vaporization.
- **Attacking Upwards (Micro vs Macro):** Small arms fire (Tier 0) cannot penetrate Tier 2+ Armor Hardness unless targeting dedicated weak points (Optics, exhaust vents, exposed cables) at **-10 penalty to strike**.

## Game Mechanics Rules
```
Cross-Tier Attack Formula: Effective Damage = (Raw Damage * Scale Multiplier) - Target Scale DR.
Weakpoint Strike: Called shot at -10 Strike ignores Scale Hardness.
```

## Gameplay Instructions
Do not pit foot operatives directly against capital starships without specialized anti-materiel heavy artillery.

## Designer Notes
Mecha combat operates primarily at Tier 2 scale.
