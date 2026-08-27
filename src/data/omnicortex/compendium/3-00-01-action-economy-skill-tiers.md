---
id: "3-00-01-action-economy-skill-tiers"
name: "3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 2
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

# 3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)

Combat capability is defined by the **Skill Tier**. As a character gains Ranks, they gain additional actions and Focus Strike bonuses per turn.

---

## Master Skill Tier Action Table

| Rank Range | Actions | Benchmark / Title | Focus Bonus |
| :--- | :--- | :--- | :---: |
| **0** | **Full Round Action** | Untrained | — |
| **1 – 5** | **1st action** at base score | Novice / Studied | **+2** |
| **6 – 10** | **2nd action** at base score -5 | Professional / Trained | **+3** |
| **11 – 15** | **3rd action** at base score -10 | Expert | **+4** |
| **16 – 20** | **4th action** at base score -15 | Master | **+5** |
| **21 – 25** | **5th action** at base score -20 | Grand Master | **+6** |
| **26 – 30** | **6th action** at base score -25 | Pinnacle | **+7** |

---

## Multiple Active Defenses

- A character may attack with as many actions as the used skill allows.
- They may also make as many **Active Defense** checks as allowed based on their Defense Skill Rank.
- **Subsequent Defense Penalty**: All consecutive active defense checks after the first reaction suffer a cumulative **-5 penalty** (1st defense: base; 2nd defense: -5; 3rd defense: -10; 4th defense: -15, etc.).

## Game Mechanics Rules
```
Actions: Rank 1-5 (1 act @ +0), Rank 6-10 (2 acts @ -5), Rank 11-15 (3 acts @ -10), Rank 16-20 (4 acts @ -15), Rank 21-25 (5 acts @ -20), Rank 26-30 (6 acts @ -25)
Active Defense Penalty: (DefenseReactionIndex - 1) * -5
```

## Gameplay Instructions
Declare your primary action on your turn. Higher ranks allow additional strikes with cumulative -5 penalties.

## Designer Notes
Focus Strike bonus adds directly to all attack rolls made with dedicated weapons in that skill.
