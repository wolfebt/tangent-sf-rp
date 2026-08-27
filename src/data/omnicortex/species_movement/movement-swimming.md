---
id: movement-swimming
name: Swimming Movement
category: species_movement
description: Swimming movement in Tangent is typically half base walking speed (15 ft / round for Medium humanoids).
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

# Swimming Movement

**Category**: Movement Modes & Paces  
**Base Swimming Speed**: Typically half walking speed (15 ft per 6-second round [1.83 mph / 3 kph] for Medium humanoid)  

## Overview
Swimming movement in Tangent is determined by a character's base speed, typically half their walking speed. It features different paces with varying speeds and tactical effects.

## Swimming Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / rd | Standard pace; no modifiers apply | None |
| **Glide** | **2x Swim (1x Walk)** | 30 ft / rd | **-2 penalty** to subtlety, stealth, or precision | **Athletics (Swimming) DC 10+** |
| **Stroke** | **4x Swim (2x Walk)** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Swimming) DC 15+** |
| **Treading** | **1/2 Swim or less** | 7.5 ft / rd | Possible **+2 bonus** to actions | **Athletics (Swimming) DC 5+** |

## Fatigue & Aquatic Hazards
- **Fatigue Checks**: Athletics (Swimming) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.
- **Treading Water Requirement**: Treading water is required if Swimming cannot be maintained; otherwise, the character begins to submerge and risk drowning.
- **Check Frequency**: Checks are made each minute (or less depending on current/turbulence) with a **cumulative -1 penalty** per check.
- **Swimming Feature**: Increases all Swimming Speeds without affecting penalties (Swimming at full Base Speed [1x walk = 30 ft], Glide at **2x** [60 ft], and Stroke at **3x** [90 ft]).
