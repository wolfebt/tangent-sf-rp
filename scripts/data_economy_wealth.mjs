export const economyAndWealthArticles = [
  {
    id: "2-04-wealth-score-purchasing-power",
    name: "2.04 Wealth Score, Purchasing Power & The Golden Rule",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 4,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economatrix", "wealth-score", "golden-rule", "core-rule"],
    description: `# 2.04 Wealth Score, Purchasing Power & The Golden Rule

Character economic power is quantified by the **Wealth Score (WS)**, a static rating of economic leverage representing credit rating, active investments, salary, and social capital. While Build Points (BP) govern biological tolerance for augmentations, the Equipment Framework utilizes Wealth Score for material acquisition, translating a character's intrinsic potential into extrinsic economic power.

---

## 1. The Golden Rule of Tangent Wealth

> [!IMPORTANT]
> **The Golden Rule:** A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score ($$\text{Purchase DC} \le \text{Wealth Score}$$).

This aligns the abstraction of "lifestyle" with the concrete math of item acquisition: **Purchase DC = Crafting DC**.

---

## 2. Calculating Starting Wealth Score

A character's starting Wealth Score is determined by summing the following foundational components:

$$\text{Starting WS} = \text{Occupation Base} + \text{Origin Modifier} + \text{Faction Modifier} + \text{TL Modifier} + \text{Skill Rank Bonuses}$$

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
- **High-Demand Careers:** Performance skills, Practicing Physicians (Medicine), and high-commodity Metaphysical Disciplines award double standard bonuses.`,
    mechanic: `WealthScore = OccupationBase + OriginMod + FactionMod + TLMod + VocationBonuses
AutoBuy Condition: ItemCraftingDC <= WealthScore (Zero liquid credit spend).`,
    guide: `1. Calculate your Wealth Score on the Persona Folio.
2. Cross-reference an item's Crafting DC with your Wealth Score.
3. If DC <= WS, auto-acquire the item for your inventory.
4. If DC > WS, calculate liquid credit shortfall via the Liquidity Gap Rule.`,
    note: `Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.`
  },
  {
    id: "2-05-tangent-standard-curve-tsc",
    name: "2.05 Tangent Standard Curve (TSC) & Master Valuation Table",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 5,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economatrix", "tsc", "pricing", "core-rule"],
    description: `# 2.05 Tangent Standard Curve (TSC) & Master Valuation Table

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, the cost scaling must be exponential. The market price of every physical asset within the Tangent galaxy is generated using the **Tangent Standard Curve (TSC)** formula.

---

## 1. The Core TSC Formula

$$\text{Value in Credits} = 10 \times 4^{\left(\frac{\text{DC}}{5}\right)}$$

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
| **50** | **Transcendent**| **10.5 MCr** | Dreadnought, planetary shield generator |`,
    mechanic: `ItemValue = 10 * Math.pow(4, CraftingDC / 5)`,
    guide: `Use Crafting DC to directly compute base purchase price and material cost (50% of value).`,
    note: `Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.`
  },
  {
    id: "2-06-financial-status-hierarchy",
    name: "2.06 The 12-Tier Financial Status Hierarchy",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 6,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economatrix", "financial-status", "lifestyle", "core-rule"],
    description: `# 2.06 The 12-Tier Financial Status Hierarchy

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
| **80+** | **Faction Ruler** | 42B+ Cr | Galactic sovereign / Emperor. Economy operates on post-scarcity command. |`,
    mechanic: `FinancialTier = getFinancialTier(WealthScore)
AutoBuyLimit = 10 * Math.pow(4, WealthScore / 5)`,
    guide: `Cross-reference operative Wealth Score against the hierarchy to describe accommodations, social leverage, and default accommodations during downtime.`,
    note: `Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.`
  },
  {
    id: "2-07-liquidity-gap-and-friction-mechanics",
    name: "2.07 The Liquidity Gap & Market Friction Mechanics",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 7,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economatrix", "liquidity-gap", "fence-rate", "core-rule"],
    description: `# 2.07 The Liquidity Gap & Market Friction Mechanics

To prevent the "infinite money loop" (where players attempt to use abstract Wealth Score to auto-acquire items for free and immediately liquidate them for cash), Tangent enforces rigorous friction mechanics.

---

## 1. The Liquidity Constraint (The Gap Rule)

When a character seeks an item with a Crafting DC exceeding their Wealth Score ($$\text{Item DC} > \text{WS}$$), their passive income cannot cover the transaction entirely. They must bridge the gap with liquid Credits:

$$\text{Liquid Cash Cost} = \text{Market Value}(\text{Item DC}) - \text{Auto-Buy Limit}(\text{Wealth Score})$$

### Practical Example
An **Affluent operative** (WS 15, Auto-Buy Limit ~640 Cr) wishes to acquire an advanced **Stealth Suit** (DC 18, Value ~1,470 Cr):
1. WS 15 leverage covers the baseline lifestyle allocation (640 Cr).
2. The remaining shortfall ($$1,470 - 640 = 830\text{ Credits}$$) must be paid in liquid cash from adventuring reserves.

---

## 2. Liquidity Drag (The Fence Rate)

To further prevent economic exploits, resale prices reflect real-world market friction, fencing effort, and legality:

| Sale Channel | Resale Percentage | Notes |
| :--- | :---: | :--- |
| **Legal Commercial Exchange** | **50% of Total Value** | Standard vendor liquidation rate |
| **Black Market / Fenced Stolen Goods** | **20% – 25% of Total Value** | High risk, untraceable cash |
| **Raw Scrap / Salvage** | **10% of Total Value** | Bulk unprocessed material |

### Anti-Arbitrage Crafting Balance
Because raw materials required to craft an item cost **50% of the item's Total Value**, an operative who buys raw materials and crafts an item for immediate resale operates at **0% profit margin**. Legitimate commercial profit requires adventuring, field scavenging, or specialized merchant trade skills.`,
    mechanic: `CashShortfall = Math.max(0, Value(ItemDC) - Value(WealthScore))
ResaleValue = TotalValue * (isLegal ? 0.50 : (isBlackMarket ? 0.25 : 0.10))`,
    guide: `Apply the Liquidity Gap whenever an item's Crafting DC exceeds player Wealth Score.`,
    note: `Verbatim from docs/game rules/architect/02 ECONOMY AND WEALTH.md.`
  }
];
