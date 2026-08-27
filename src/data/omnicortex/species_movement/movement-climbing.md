---
id: movement-climbing
name: Climbing Movement
category: species_movement
description: Climbing movement involves ascending or descending vertical surfaces, influenced by base speed and climb difficulty.
costs:
  bp: 2
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

# Climbing Movement

**Category**: Movement Modes & Paces  
**Base Climbing Speed**: Half walking speed on Easy surfaces (15 ft / round for Medium humanoid)  

## Overview
Climbing movement in Tangent involves ascending or descending vertical surfaces, and is influenced by a character's base speed which in turn is affected by the difficulty of the climb. Different climbing speeds are available, each with its own mechanics and effects.

## Surface Difficulty & Base Speed
- **Easy Climb (DC 10+)**: Half base walking speed (15 ft / rd).
- **Moderate Climb (DC 15+)**: Quarter base walking speed (7.5 ft / rd).
- **Difficult Climb (DC 20+)**: Tenth base walking speed (3 ft / rd).
*Difficulties may be modified by climbing gear, harness systems, and environmental conditions (ice, rain, slime).*

## Climbing Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Climbing & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Climbing** | Standard Surface Pace | 15 / 7.5 / 3 ft | Standard climb; requires check to avoid falling | **Athletics (Climbing)** vs Surface DC |
| **Scaling** | **1x Base Walk Speed** | 30 ft / rd | **-2 penalty** to subtle actions | **Athletics (Climbing)** at **-5 penalty** |
| **Fast Ascent** | **2x Base Walk Speed** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Climbing)** at **-10 penalty** |
| **Fast Descent** | **4x Base Walk Speed** | 120 ft / rd | Descends without injury; **-4 penalty** to actions | **DC 20 Athletics (Climbing)** or **-10 to check** |

## Fatigue, Falling & Holding On
- **Fatigue Checks**: Athletics (Climbing) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.
- **Holding On**: Failing a check requires an immediate check to hold on; failure begins a descent or fall (hopefully controlled via descent gear).
- **Check Frequency**: Checks are made each minute with a **cumulative -1 penalty** per check.
- **Climbing Feature**: Increases all Climbing Speeds without affecting penalties (Climbing at full Base Speed [1x], Scaling at **2x**, Fast Ascent at **3x**, and Fast Descent at **6x**).
