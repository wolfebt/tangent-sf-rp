---
id: "2-07-liquidity-gap-and-friction-mechanics"
name: "2.07 The Liquidity Gap & Market Friction Mechanics"
category: "compendium"
parent: "2.00 ECONOMATRIX & TECHNOLOGY"
order: 7
perspective: "both"
entry_type: "Core Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-2","economatrix","liquidity-gap","fence-rate","core-rule"]
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

# 2.07 The Liquidity Gap & Market Friction Mechanics

To prevent the "infinite money loop" (where players attempt to use abstract Wealth Score to auto-acquire items for free and immediately liquidate them for cash), Tangent enforces rigorous friction mechanics.

---

## 1. The Liquidity Constraint (The Gap Rule)

When a character seeks an item with a Crafting DC exceeding their Wealth Score ($$	ext{Item DC} > 	ext{WS}$$), their passive income cannot cover the transaction entirely. They must bridge the gap with liquid Credits:

$$	ext{Liquid Cash Cost} = 	ext{Market Value}(	ext{Item DC}) - 	ext{Auto-Buy Limit}(	ext{Wealth Score})$$

### Practical Example
An **Affluent operative** (WS 15, Auto-Buy Limit ~640 Cr) wishes to acquire an advanced **Stealth Suit** (DC 18, Value ~1,470 Cr):
1. WS 15 leverage covers the baseline lifestyle allocation (640 Cr).
2. The remaining shortfall ($$1,470 - 640 = 830	ext{ Credits}$$) must be paid in liquid cash from adventuring reserves.

---

## 2. Liquidity Drag (The Fence Rate)

To further prevent economic exploits, resale prices reflect real-world market friction, fencing effort, and legality:

| Sale Channel | Resale Percentage | Notes |
| :--- | :---: | :--- |
| **Legal Commercial Exchange** | **50% of Total Value** | Standard vendor liquidation rate |
| **Black Market / Fenced Stolen Goods** | **20% – 25% of Total Value** | High risk, untraceable cash |
| **Raw Scrap / Salvage** | **10% of Total Value** | Bulk unprocessed material |

### Anti-Arbitrage Crafting Balance
Because raw materials required to craft an item cost **50% of the item's Total Value**, an operative who buys raw materials and crafts an item for immediate resale operates at **0% profit margin**. Legitimate commercial profit requires adventuring, field scavenging, or specialized merchant trade skills.

## Game Mechanics Rules
```
CashShortfall = Math.max(0, Value(ItemDC) - Value(WealthScore))
ResaleValue = TotalValue * (isLegal ? 0.50 : (isBlackMarket ? 0.25 : 0.10))
```

## Gameplay Instructions
Apply the Liquidity Gap whenever an item's Crafting DC exceeds player Wealth Score.

## Designer Notes
Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.
