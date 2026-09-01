---
id: "0-05-glossary-core-metrics-physics"
name: "0.05 Glossary, Core Metrics & UDU Physics Hierarchy"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 5
perspective: "both"
entry_type: "System Glossary"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-0","glossary","core-rule"]
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

# 0.05 Glossary, Core Metrics & UDU Physics Hierarchy

## I. Core Metrics (The Math)
| Term | Domain | Definition | Range / Limit |
| :--- | :--- | :--- | :--- |
| **Rank** | Skills | Numerical training level in a skill. | 0 (Untrained) to 30 (Pinnacle) |
| **Score** | Attributes | Raw modifier of an Attribute (e.g. Strength +2). | -5 to +10 (Caps vary by Species/Tier) |
| **BP** | Creation | **Build Points**. Character creation currency. | Standard: 150 BP |
| **AP** | Progression | **Award Points**. Experience points spent 1-for-1 like BP ($1\text{ AP} = 1\text{ BP}$). | Standard: 1-3 AP/session |
| **DC** | Mechanics | **Difficulty Class**. Target number to meet or exceed. | 0 (Simple) to 40+ (Godlike) |
| **Karma** | Resources | Heroic meta-currency pool for rerolls. | Base 3. Refreshes per Session. |
| **Tier** | Scale | Power scale for items, adversaries, and zones. | Tier 0 (Civilian) to Tier 5 (Cosmic) |

---

## II. Physics & Capacity (The UDU System)
Standard Metric: **1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 UDU**

| Unit | Scale Domain | Physical Equivalency | Practical Application |
| :--- | :--- | :--- | :--- |
| **Node** | Augmentations | 10 grams / 0.1 Socket | Cybernetic neural chips, micro-implants, sensor nodes. |
| **Socket** | Gear & Weapons | 1 kilogram / 1 Mod | Weapon scopes, armor plates, battery capacitors, gear modules. |
| **Mount** | Mecha & Vehicles | 100 kilograms / 10 Sockets | Heavy vehicle cannons, jump jets, reinforced shielding. |
| **Module** | Architecture & Ships | 10 metric tons / 10 Mounts | Prefab habitats, starship staterooms, medbays, cargo bays. |

---

## III. Survival & Combat Metrics
| Term | Domain | Definition | Range / Limit |
| :--- | :--- | :--- | :--- |
| **Vitality** | Integrity | Physical stamina, luck, and kinetic shielding. Absorbs initial damage. | Base 30 + (5 × Sta) + (5 per BP). Recovers fast. |
| **Health** | Integrity | Structural biological life force. Damage here is lethal trauma. | Base 30 + (5 × Sta) + (5 per BP). Recovers slow. |
| **Structure** | Integrity | Structural durability equivalent for Synthetics, Mecha, and Objects. | Varies by Chassis / Size. |
| **DR** | Defense | Damage Reduction. Subtracted from incoming damage before Vitality loss. | 0 (Clothing) to 60+ (Capital Ship) |
| **Defense** | Combat | Target number to hit a character (Passive). | 10 + Agility + Defense Skill + Mods |
| **Stigma** | Social | Reaction penalty resulting from prejudice or xenophobia. | Variable penalty to social checks. |

## Game Mechanics Rules
```
1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 UDU
Essence Pool = (STR + AGI + STA + INT + WIS + CHA) + Attune Rank
Crafting Value Formula: Value = 10 * 4^(DC / 5) Credits
```

## Gameplay Instructions
Reference this glossary for canonical term definitions, formulas, and math ranges.

## Designer Notes
All modules, apps, and calculators strictly adhere to these UDU capacity and attribute formulas.
