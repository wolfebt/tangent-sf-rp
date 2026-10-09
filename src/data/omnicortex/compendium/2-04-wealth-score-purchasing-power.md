---
id: "2-04-wealth-score-purchasing-power"
name: "2.04 Wealth Score, Purchasing Power & The Golden Rule"
category: "compendium"
parent: "2.00 ECONOMATRIX & TECHNOLOGY"
order: 4
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-2","economatrix","wealth-score","golden-rule","core-rule"]
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

# 2.04 Wealth Score, Purchasing Power & The Golden Rule

Character economic power is quantified by the **Wealth Score (WS)**, a static rating of economic leverage representing credit rating, active investments, salary, and social capital. While Build Points (BP) govern biological tolerance for augmentations, the Equipment Framework utilizes Wealth Score for material acquisition, translating a character's intrinsic potential into extrinsic economic power.

---

## 1. The Golden Rule of Tangent Wealth

> [!IMPORTANT]
> **The Golden Rule:** A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score ($$	ext{Purchase DC} le 	ext{Wealth Score}$$).

This aligns the abstraction of "lifestyle" with the concrete math of item acquisition: **Purchase DC = Crafting DC**.

---

## 2. Calculating Starting Wealth Score

A character's starting Wealth Score is determined by summing the following foundational components:

$$	ext{Starting WS} = 	ext{Occupation Base} + 	ext{Origin Modifier} + 	ext{Faction Modifier} + 	ext{TL Modifier} + 	ext{Skill Rank Bonuses}$$

### A. Occupation Base
| Occupation | Wealth Base |
| :--- | :---: |
| **Adept** | 4 |
| **Agent** | 2 |
| **Builder** | 3 |
| **Citizen** | 2 |
| **Criminal** | 4 |
| **Drifter** | 1 |
| **Entertainer** | 5 |
| **Merchant** | 5 |
| **Representative** | 6 |
| **Scholar** | 3 |
| **Scout** | 1 |
| **Soldier** | 1 |
| **Specialist** | 3 |

### B. Origin Modifiers
| Origin | Modifier |
| :--- | :---: |
| **Agricultural** | +0 |
| **Aquatic** | +1 |
| **Colony** | +0 |
| **Enlightened** | +2 |
| **Industrial** | +2 |
| **Leisure** | +3 |
| **Militaristic** | +0 |
| **Research** | +2 |
| **Spacer** | +1 |
| **Urban** | +1 |
| **Others** | 0 to +3 |

### C. Faction Modifiers
| Faction | Modifier |
| :--- | :---: |
| **Alterian** | +3 |
| **Auluran** | +2 |
| **Ascendancy** | +3 |
| **Coalition** | +0 |
| **Dynasty** | +2 |
| **Entari** | +3 |
| **Impyrium** | +3 |
| **Mekan** | +6 (Special) |
| **Syndicate** | +4 |
| **Outworlds** | +0 |
| **Others** | 0 to +3 |

### D. Technology Level (TL) Modifiers
| Tech Level | Modifier |
| :--- | :---: |
| **TL 0** | -4 |
| **TL 1** | -2 |
| **TL 2** | +0 |
| **TL 3** | +2 |
| **TL 4** | +4 |
| **TL 5** | +8 |

### E. Vocation & Practiced Skill Ranks
- **Primary Vocation Skill:** +1 Wealth bonus per rank stage (Novice 1–5: +1, Trained 6–10: +2, Expert 11–15: +3, Master 16–19: +4, Pinnacle 20: +5).
- **Secondary Aiding Skills (Rank 6+):** +1 Wealth per associated skill practiced in trade.
- **High-Demand Careers:** Performance skills, Practicing Physicians (Medicine), and high-commodity Metaphysical Disciplines award double standard bonuses.

## Game Mechanics Rules
```
WealthScore = OccupationBase + OriginMod + FactionMod + TLMod + VocationBonuses
AutoBuy Condition: ItemCraftingDC <= WealthScore (Zero liquid credit spend).
```

## Gameplay Instructions
1. Calculate your Wealth Score on the Persona Folio.
2. Cross-reference an item's Crafting DC with your Wealth Score.
3. If DC <= WS, auto-acquire the item for your inventory.
4. If DC > WS, calculate liquid credit shortfall via the Liquidity Gap Rule.

## Designer Notes
Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.
