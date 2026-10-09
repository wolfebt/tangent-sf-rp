---
id: "2-06-financial-status-hierarchy"
name: "2.06 The 12-Tier Financial Status Hierarchy"
category: "compendium"
parent: "2.00 ECONOMATRIX & TECHNOLOGY"
order: 6
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-2","economatrix","financial-status","lifestyle","core-rule"]
updatedAt: "2026-10-09T07:59:56.717Z"
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

# 2.06 The 12-Tier Financial Status Hierarchy

The financial position of any individual, operative, or faction in Tangent is mapped onto the **12-Tier Financial Status Hierarchy**, providing both an Auto-Buy purchase ceiling and narrative lifestyle boundaries.

---

## The Master 12-Tier Status Table

| Wealth Score | Wealth Status | Auto-Buy Limit | Lifestyle Description |
| :---: | :--- | :---: | :--- |
| **0** | **Indebted** | 0 Cr | Debt slavery, indentured bond, or debtor prison. |
| **1 – 4** | **Impoverished** | 10 – 30 Cr | Homeless / squatter. Scavenges for food and survival scrap. |
| **5 – 9** | **Struggling** | 40 – 150 Cr | Shared room in slum arcology. Processed synthetic rations. |
| **10 – 14** | **Middle Class** | 160 – 600 Cr | Private apartment, steady wage, civilian consumer vehicle. |
| **15 – 19** | **Affluent** | 640 – 2,500 Cr | High-end condo, quality personal transport, dining luxury. |
| **20 – 29** | **Wealthy** | 2,500 – 40,000 Cr | Large estate, private security/servants, minor corporate investor. |
| **30 – 39** | **Hegemon** | 41K – 650K Cr | Skyscraper penthouse, owns small corporations, private shuttles. |
| **40 – 49** | **Industrialist** | 650K – 10M Cr | Megacorporate executive, owns starships (Corvettes / Transports). |
| **50 – 59** | **Dynastic** | 10M – 167M Cr | Planetary nobility, oligarch, owns orbital stations and orbital arrays. |
| **60 – 69** | **System Lord** | 167M – 2.6B Cr | Rules a solar system or trade hub. Commands capital ships. |
| **70 – 79** | **Sector Ruler** | 2.6B – 42B Cr | Rules a star cluster. Personal flagship is a Dreadnought. |
| **80+** | **Faction Ruler** | 42B+ Cr | Galactic sovereign / Emperor. Economy operates on post-scarcity command. |

## Game Mechanics Rules
```
FinancialTier = getFinancialTier(WealthScore)
AutoBuyLimit = 10 * Math.pow(4, WealthScore / 5)
```

## Gameplay Instructions
Cross-reference operative Wealth Score against the hierarchy to describe accommodations, social leverage, and default accommodations during downtime.

## Designer Notes
Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.
