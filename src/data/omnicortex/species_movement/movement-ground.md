---
id: movement-ground
name: Ground Movement
category: species_movement
description: Ground movement in Tangent is based on a character's base walking speed (30 ft / 6 sec round for Medium biped humanoids).
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

# Ground Movement

**Category**: Movement Modes & Paces  
**Base Speed**: 30 ft per 6-second round (3.72 mph / 6 kph for Medium humanoid)  

## Overview
The character’s typical movement type (usually ground) and how fast they move is determined by species, modifiers such as features, traits, and other abilities can further alter speed as well as the terrain itself and any armor that may be worn.

## Ground Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Walk** | **1x (Base)** | 30 ft / rd | Default pace; no penalties | None |
| **Jog** | **2x** | 60 ft / rd | **-2 penalty** to subtlety, stealth, or precision | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft / rd *(150 ft)* | **-4 penalty** to subtle actions | **Athletics (DC 10+)** each minute |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft / rd *(210 ft)* | **-8 penalty** to subtle actions | **Athletics (DC 15+)** each minute |
| **Crawl** | **1/2x** | 15 ft / rd | **+2 bonus** to stealth; gains **Prone** condition | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 bonus** to stealth; gains **Prone** condition | None |

## Fatigue & Muscle Strain Mechanics
- **Check Trigger & Frequency**: Athletics checks are made every minute (or less depending on the situation) with a **cumulative -1 penalty** per consecutive check.
- **Failure Penalty**: On a failed check, take **1 point of non-lethal damage per 5 points missed** below the DC.
- **Continuing**: May continue movement on a successful **Will check** of the same difficulty.
- **Action Modifiers**: Modifiers apply to anything involving subtlety, stealth, precision, or similar actions.
- **Running Feature**: Increases the multiple of Running and Sprinting by 1 (to **5x / 7x**) without affecting the penalty.
