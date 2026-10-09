---
id: "2-05-tangent-standard-curve-tsc"
name: "2.05 Tangent Standard Curve (TSC) & Master Valuation Table"
category: "compendium"
parent: "2.00 ECONOMATRIX & TECHNOLOGY"
order: 5
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-2","economatrix","tsc","pricing","core-rule"]
updatedAt: "2026-10-09T07:59:56.716Z"
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

# 2.05 Tangent Standard Curve (TSC) & Master Valuation Table

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, the cost scaling must be exponential. The market price of every physical asset within the Tangent galaxy is generated using the **Tangent Standard Curve (TSC)** formula.

---

## 1. The Core TSC Formula

$$	ext{Value in Credits} = 10 	imes 4^{left(rac{	ext{DC}}{5}ight)}$$

- **Baseline:** 10 Credits (simplest manufactured scrap at DC 0).
- **Growth Factor:** Multiplies by 4 across every 5 DC complexity interval.
- **Mathematical Rigidity:** Eliminates all pricing debates. Any new item or precursor artifact is valued instantly by assigning a Crafting DC.

---

## 2. The Master Valuation Table

| DC | Complexity | Value (Credits) | Examples (Sci-Fi / Fantasy) |
| :---: | :---: | :---: | :--- |
| **0** | **Scrap** | **10 Cr** | Raw ore, ration bar, wooden club |
| **5** | **Simple** | **40 Cr** | Knife, backpack, basic clothing, bandages |
| **10** | **Standard** | **160 Cr** | Pistol, sword, light armor, commlink |
| **15** | **Advanced** | **640 Cr** | Rifle, plate mail, medkit, hacking tool |
| **20** | **Expert** | **2,560 Cr** | Plasma weapon, full environmental suit, masterwork gear |
| **25** | **Master** | **10,240 Cr** | Cybernetic limb, hoverbike, magic ring, heavy weapon |
| **30** | **Grandmaster** | **40,960 Cr** | Power armor, golem, personal shuttle, rare artifact |
| **35** | **Heroic** | **163,840 Cr** | AI Core, fighter jet, small starship hull |
| **40** | **Legendary** | **655,360 Cr** | Corvette-class ship, legendary artifact, fortress |
| **45** | **Mythic** | **2,621,440 Cr** | Frigate, resurrection chamber, moon base module |
| **50** | **Transcendent**| **10.5 MCr** | Dreadnought, planetary shield generator |

## Game Mechanics Rules
```
ItemValue = 10 * Math.pow(4, CraftingDC / 5)
```

## Gameplay Instructions
Use Crafting DC to directly compute base purchase price and material cost (50% of value).

## Designer Notes
Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.
