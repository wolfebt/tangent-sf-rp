---
id: "1-10-movement-locomotion-codex"
name: "1.10 Movement Rules, Tactical Paces & Fatigue"
category: "compendium"
parent: "1.00 CHARACTER CREATION & PROFILES"
order: 10
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-1","movement","core-rule"]
updatedAt: "2026-09-01T20:54:33.509Z"
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

# 1.10 Movement Rules, Tactical Paces & Fatigue

Locomotion in Tangent encompasses five primary modes: **Ground, Flying, Swimming, Climbing, and Burrowing**.

---

## 1. Ground Movement Paces (Medium Baseline: 30 ft / Round [6 kph])
| Pace | Multiplier | Medium Speed | Subtlety / Action Mod | Check & Fatigue Trigger |
| :--- | :---: | :---: | :---: | :--- |
| **Walk** | **1x** | 30 ft / rd | Baseline | None |
| **Jog** | **2x** | 60 ft / rd | **-2 penalty** | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft *(150 ft)* | **-4 penalty** | Athletics DC 10+ (every min, cum. -1) |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft *(210 ft)* | **-8 penalty** | Athletics DC 15+ (every min, cum. -1) |
| **Crawl** | **1/2x** | 15 ft / rd | **+2 stealth**; Prone | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 stealth**; Prone | None |

---

## 2. Flying Movement (Medium Baseline: 60 ft / Round)
| Maneuver | Multiplier | Medium Speed | Subtlety Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Flight** | **1x Fly (2x Walk)** | 60 ft / rd | Baseline | None |
| **Sail** | **2x Fly (4x Walk)** | 120 ft / rd | **-2 penalty** | None |
| **Surge / Soar** | **4x Fly (8x Walk)** | 240 ft *(300 ft with Soar)* | **-4 penalty** | Acrobatics DC 10+ (cum. -1/min) |
| **Diving** | **2x Current** | Up to 480+ ft | **-4 penalty** | Acrobatics DC 15+ |
| **Gliding** | Maintains speed, drops 1ft / 5ft horiz | 60 ft / rd | **+2 bonus** | Acrobatics DC 10+ |
| **Hover / Descent** | **1/2 Fly or less** | 30 ft or static | Baseline | Acrobatics DC 15+ |

- **High Ground Tactical Advantage:** Flying above ground targets grants **+2 Strike / +2 Crit**.
- **Aerial Rams:** Deal **+1d per Flight Stage + 1 Impact Damage per 10 ft of speed** to all colliding entities.

---

## 3. Swimming, Climbing & Burrowing Paces
- **Swimming:** Standard 15 ft / rd (1/2 walk). Glide (30 ft), Stroke (60 ft), Treading (7.5 ft).
- **Climbing:** Scaling (30 ft at -5 check), Fast Ascent (60 ft at -10 check), Fast Descent (120 ft, DC 20).
- **Burrowing:** Standard 7.5 ft / rd (1/4 walk). Tunneling (15 ft, -2 mod), Excavation (3.75 ft).

---

## 4. Movement Fatigue Rules
- **Sprint Trigger:** 5 consecutive combat rounds of sprinting forces a **Stamina Fortitude Check (DC 15)**.
- **Hurried Travel Trigger:** 10 minutes of hurried pace forces a **Stamina Fortitude Check (DC 15)**.
- **Failure:** Incurs **5 points of non-lethal Vitality damage** (+1 pt per 5 points missed below DC).
- **Depletion to Exhaustion:** At 0 Vitality, takes **2 Health damage** and gains the **Exhausted condition** (-2 to all active checks, half speed) until taking a Light Rest.

## Game Mechanics Rules
```
Base Pace: 30 ft / 6-sec round.
Sprint: 6x base pace.
Fatigue Check: Fortitude DC 15 after 5 rounds of sprint or 10 min of hurried march.
```

## Gameplay Instructions
Track tactical movement speeds on grid hexes (1 square = 5 ft).

## Designer Notes
Encumbrance reduces base pace by 5 to 15 ft depending on armor weight.
