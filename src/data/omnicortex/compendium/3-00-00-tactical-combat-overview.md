---
id: "3-00-00-tactical-combat-overview"
name: "3.00.00 Tactical Combat Engine Overview"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 1
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","core-rule"]
updatedAt: "2026-09-02T09:16:58.894Z"
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

# 3.00.00 Tactical Combat Engine Overview

The Tangent Combat System uses a **2d10 dice system** that factors in character skills, abilities, and situational modifiers. Combat actions are determined by Skill Rank, with higher Ranks unlocking additional actions per turn.

---

## 1. The Core Attack Roll Formula

$$\text{Attack Roll} = 2d10 + \text{Skill Rank} + \text{Attribute Mod} + \text{Situational Modifiers} \quad \text{vs.} \quad \text{Target Defense (DC)}$$

- **Dual 10s (Natural 20)**: Critical Success (evaluated as 30).
- **Dual 1s (Natural 2)**: Critical Fumble (evaluated as -10).

---

## 2. Opposed vs. Unopposed Combat Checks

### Opposed Attack Check (Active Target)
- When targeting an active, aware opponent:
  $$\text{Defender's Agility} + \text{Defense Skill} + \text{Situational Mods} \quad \text{vs.} \quad \text{Attacker's Ability} + \text{Combat Skill} + \text{Bonuses}$$
- **Attacker wins**: A strike or success.
- **Defender wins**: The attacker misses or an unsuccessful action.
- > [!IMPORTANT]
  > **THE GOLDEN RULE OF TANGENT COMBAT: DEFENDER WINS ALL TIES.**

### Unopposed Attack Check (Stationary / Surprised Target)
- Target is not defending, surprised, or stationary.
- Attacker rolls: $\text{Attacker's Ability} + \text{Combat Skill} + \text{Bonuses}$ vs. **CR 15 (Average)** for a typical medium-size target within short range (modified for target's Size, Range, and Movement).

## Game Mechanics Rules
```
Opposed: Attacker (2d10 + Skill + Attr + Mod) vs Defender (Agility + Defense Skill + Mod) [Defender wins ties]
Unopposed: Attacker Roll vs CR 15 + SizeMod + RangeMod + MoveMod
```

## Gameplay Instructions
On your turn in combat: declare target, choose weapon, roll 2d10 attack check against target's defense roll or static DC.

## Designer Notes
Defender wins ties on all opposed checks, emphasizing defensive positioning and reactive cover.
