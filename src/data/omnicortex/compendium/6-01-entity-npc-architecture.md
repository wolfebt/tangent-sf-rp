---
id: "6-01-entity-npc-architecture"
name: "6.01 Universal Entity & NPC Adversary Architecture"
category: "compendium"
parent: "6.00 BESTIARY & ADVERSARY MATRICES"
order: 1
perspective: "architect"
entry_type: "Architect Codex"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-6","bestiary","npc","entities"]
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

# 6.01 Universal Entity & NPC Adversary Architecture

Architects can assemble balanced NPC adversaries and tactical threats using the **3-Tier Threat Matrix**:

---

## The 3-Tier Threat Matrix
| Threat Classification | Hit Points / Structure | Armor DR | Attack Bonus | Actions / Round | Tactical Role |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Minion / Grunt** | **10 – 15 HP** | 0 – 2 DR | +2 to +4 | **1 Action** | Swarm units, corporate security guards, pirates. Defeated by 1 solid hit. |
| **Elite / Enforcer** | **35 – 60 HP** | 4 – 8 DR | +6 to +10 | **2 – 3 Actions** | Squad leaders, veteran shock troopers, bounty hunters, alpha predators. |
| **Boss / Arch-Nemesis**| **120 – 300+ HP** | 10 – 20 DR | +12 to +18 | **3 – 4 Actions** | Planetary warlords, ancient bio-horrors, dread cyber-titans. Focus Strike +6. |

---

## Universal Entity Statblock Template
Every entity record in Tangent specifies:
- **Identity & Tier:** Name, Threat Tier (Minion/Elite/Boss), Size Category.
- **Attributes Array:** STR, AGI, STA, INT, WIS, CHA (+0 to +10).
- **Combat Stats:** Vitality, Health, Armor DR, Passive Defense, Initiative Mod.
- **Offensive Actions:** Weapons, strike bonuses, damage dice, special conditions (Stun, Burn, Bleed).
- **Special Features:** Legendary reactions, resistance traits, psionic auras, damage immunities.

## Game Mechanics Rules
```
Minion Overkill Rule: Excess damage dealt beyond a minion's max HP carries over to an adjacent minion in reach.
Boss Legendary Action: Bosses receive 1 out-of-turn Legendary Reaction at the end of any player's turn.
```

## Gameplay Instructions
Use minion squads to provide tactical pressure while elites and bosses command the objective.

## Designer Notes
NPC stats should be simplified for quick table tracking—omit unneeded skills.
