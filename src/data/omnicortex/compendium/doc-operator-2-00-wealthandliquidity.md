---
id: "doc-operator-2-00-wealthandliquidity"
name: "2.00 The Wealth Matrix & Liquid Interface"
fileName: "2.00.WealthAndLiquidity.md"
relPath: "operator/economatrix/2.00.WealthAndLiquidity.md"
isMasterDoc: false
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "doc-operator-2-00-economatrix"
order: 221
perspective: "operator"
entry_type: "Economatrix Catalog"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","economatrix","2.00.wealthandliquidity","mechanics"]
updatedAt: "2026-11-02T22:49:20.114Z"
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

# **2.00.07 THE WEALTH MATRIX & LIQUID INTERFACE**

## **3. The Wealth Matrix: Integrating Character Points and Status**

The Wealth Matrix serves as the translation layer between the character’s intrinsic potential (Character Points) and their extrinsic economic power (Wealth Score). In many point-buy systems like GURPS or Mutants & Masterminds, wealth is a distinct advantage purchased separately from skills. Tangent integrates this by treating Wealth Score (WS) as a status attribute that dictates purchasing thresholds.

  

### **3. Wealth Score as Purchasing Power**

The Wealth Score in Tangent is not a pool of points to be depleted, but a static rating of economic leverage. It represents credit rating, salary, investments, and social capital. Its function is tethered directly to the Crafting CR of items.

**The Golden Rule of Tangent Wealth:**

A character may automatically purchase any item with a Crafting CR equal to or less than their Wealth Score without depleting their liquid Credits or reducing their Wealth Score.

This unifies the system: **Purchase CR = Crafting CR.**

This elegant alignment resolves the disconnect found in 2d10 Modern, where Purchase CR is a separate derived stat often disjointed from the item's creation rules. In Tangent, if you are rich enough to buy a thing (WS), you are theoretically rich enough to fund its creation.

  

### **3. The Expanded Financial Status Hierarchy**

This table defines the social and economic power of a character based on their Wealth Score. It scales from the destitute to the rulers of interstellar empires.

**Column Definitions:**

  - **Wealth Score (WS):** The Target CR the character can "Take 10" on for purchasing. It is the primary attribute derived from CP investment.
  - **Financial Status:** The socio-economic label applied to the character in the game world.
  - **CP Cost:** The cost in Character Character Points to acquire this status at creation. Costs scale non-linearly to represent the exponential utility of wealth.
  - **Purchasing Limit (Liquid Cap):** The maximum Credit value of a single item the character can purchase automatically without rolling or dipping into savings. This aligns with the item's Crafting CR.
  - **Net Worth (Est):** The theoretical total value of the character's assets (land, stocks, ships, favor). This is usually 100x–1000x their liquid purchasing limit and is used for collateral on loans.
  - **Lifestyle Description:** What the character's daily life looks like and what assets they likely maintain.

  

#### **Table 3.2: Extended Financial Status Hierarchy**

|  |  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: | :-: |
| **Wealth Score (WS)** | **Financial Status** | **CP Cost** | **Purchasing Limit (Auto-Buy)** | **Estimated Net Worth** | **Lifestyle Description** |
| **0** | Indebted | \-5 (Flaw) | 0 Cr | Negative | Debt slavery or prison. Zero assets. Survival depends on others. |
| **1 - 4** | Impoverished | 0 | 10 - 30 Cr | \\\< 500 Cr | Homeless or squatter. Scavenges for food/scrap. Possessions are improvised. |
| **5 - 9** | Struggling | 2 | 40 - 150 Cr | \\\~2,000 Cr | Shared room in a slum. Public transit only. Eating processed rations. |
| **10 - 14** | Middle Class | 5 | 160 - 600 Cr | \\\~25,000 Cr | Private apartment, steady wage. Consumer vehicle. Can afford occasional luxuries. |
| **15 - 19** | Affluent | 10 | 640 - 2,500 Cr | \\\~200,000 Cr | High-end condo or small house. Quality personal vehicle. Access to professional services. |
| **20 - 29** | Wealthy | 20 | 2,500 - 40,000 Cr | \\\~5 Million Cr | Large estate, multiple vehicles. Staff of servants. Minor corporate investor or local celebrity. |
| **30 - 39** | Hegemon | 35 | 41K - 650K Cr | \\\~100 Million Cr | Skyscraper penthouse. Owns a small corporation. Personal security detail. Travels via private shuttle. |
| **40 - 49** | Industrialist | 50 | 650K - 10M Cr | \\\~2 Billion Cr | Megacorp executive. Owns starships (Corvettes). Can influence planetary law. |
| **50 - 59** | Dynastic | 70 | 10M - 167M Cr | \\\~50 Billion Cr | Minor nobility or Megacorp CEO. Owns space stations or orbital habitats. Commands private fleets. |
| **60 - 69** | System Lord | 95 | 167M - 2.6B Cr | \\\~500 Billion Cr | Rules a solar system. Can fund planetary colonization. Owns capital ships (Cruisers) personally. |
| **70 - 79** | Sector Ruler | 125 | 2.6B - 42B Cr | \\\~10 Trillion Cr | Rules a cluster of stars. Can terraform planets. Personal flagship is a Dreadnought. |
| **80+** | Faction Ruler | 160 | 42B - 600B+ Cr | \\\~1 Quadrillion Cr | Emperor/god-king. Economy is post-scarcity. Builds megastructures (Dyson Spheres, Ringworlds). |

**Note on Scaling:**

  - The jump from Wealthy (WS 20) to Hegemon (WS 30) represents the transition from "Person with Money" to "Person with Assets."
  - The jump from Dynastic (WS 50) to System Lord (WS 60) represents the transition from "Personal Wealth" to "State Power." At WS 60+, the character's wealth is effectively the GDP of a nation-state.

  

### **3. Dynamic Wealth Adjustment**

Wealth Score is not static. It can be damaged or improved.

  - **Wealth Damage:** Major failures, legal sanctions, or "burning assets" can lower WS.
  - **Wealth Growth:** Investing large sums of liquid Credits (Loot) can raise WS.

Growth Formula: To raise WS from X to X+1, one must invest Credits equal to the difference in value between the two tiers.

This provides a "Gold Sink" for players, allowing them to retire from adventuring by slowly building their passive Wealth Score.

  
  

## **4. The Liquid Interface: Credits and Transaction Mechanics**

While Wealth Score handles the macro-economy (lifestyle, upkeep, standard gear), Credits handle the micro-economy (loot, bribes, rare artifacts, gap purchasing). A purely abstract system (like 2d10 Modern) often feels unsatisfying because players enjoy the tactile reward of finding "money". Tangent hybridizes the two.

  

### **4. The Liquidity Gap**

A common issue in point-buy wealth systems is the "infinite money" loop. If I have Wealth Score 20, and I can buy CR 20 items for free, can I buy 10,000 Plasma Rifles and sell them?

Tangent prevents this via **The Liquidity Constraint**.

  

Rule 1: The Personal Use Limit

Wealth Score covers items for personal use or reasonable team support. Bulk acquisition triggers a "Strain Check" or requires a specialized "Logistics" skill check.

  

Rule 2: Purchasing Above Wealth (The Gap Rule)

When a character wants an item with a CR higher than their Wealth Score, they cannot simply buy it. They must bridge the gap with liquid Credits.

Cost_{Liquid} = Value(Item_{CR}) - Value(WealthScore)

  

**Scenario:**

  - Character: Wealth Score 15 (Purchasing Power: 640 Cr).
  - Target: Stealth Suit (Craft CR 18).
  - Valuation:
      
      - CR 15 Value = 640 Cr.
      - CR 20 Value = 2,560 Cr.
      - To find CR 18, we interpolate: 10 \\times 4^{(18/5)} \\approx 1,470 Cr.
  - The Cost: 1,470 - 640 = 830 Credits.

The character uses their WS to cover the "base" lifestyle cost but must dip into their liquid savings (Loot) to cover the 830 Credit difference. This keeps Loot relevant at all levels of play.

  

### **4. Liquidity Drag (Selling Items)**

To further prevent the "buy free / sell for cash" loop, we introduce Liquidity Drag.

In real-world economics and RPG simulations like Recettear or EVE Online, the "Buy" price and "Sell" price are never identical due to friction (fencing effort, market saturation, legality).

Rule 3: The Fence Rate

Items sold by players yield only a fraction of their theoretical Value, typically 20-50%, depending on the legality and the buyer’s Interest.

  - Legal Goods: Sold at 50%.
  - Black Market / Stolen: Sold at 20-25%.
  - Scrap: Sold at 10%.

Since materials to craft an item typically cost 50% of the item's value (standard RPG balance), a character who buys materials and crafts an item to sell it at 50% value makes zero profit. Profit is only possible if:

1.  They Scavenge materials (Time cost, 0 Credit cost).
2.  They have a "Merchant" ability raising the sell percentage to 60%+.

This effectively creates a functioning economy where crafting is for utility, not infinite wealth generation.


### **Determining Starting Wealth Score (Background & Training Integration)**

`Starting Wealth Score (WS) = Occupation Base + Origin Modifier + Faction Modifier + Tech Level Modifier + Skill Ranks Bonus`

* **Occupations Wealth Base:** Representative (6), Entertainer (5), Merchant (5), Adept (4), Criminal (4), Builder (3), Scholar (3), Specialist (3), Agent (2), Citizen (2), Drifter (1), Scout (1), Soldier (1).
* **Origins Modifiers:** Leisure (+3), Enlightened (+2), Industrial (+2), Research (+2), Aquatic (+1), Spacer (+1), Urban (+1), Agricultural (+0), Colony (+0), Hostile (+0), Militaristic (+0).
* **Factions Modifiers:** Mekan Collective (+6 Specialized), Radiant Impyrium (+5), Ascendancy (+4), Syndicate (+4), Alterian Enclave (+3), Entari Combine (+3), Impyrium Dominion (+3), Auluran/Kitin (+2), Dracon Dynasty (+2), Coalition (+0), Outworlds (+0).
* **Tech Level Modifiers:** TL 0 (-4), TL 1 (-2), TL 2 (+0), TL 3 (+2), TL 4 (+4), TL 5 (+8).
* **Vocation & Trade Skill Stage Bonus:** Novice (+1 WS), Trained (+2 WS), Expert (+3 WS), Master (+4 WS), Grand Master (+5 WS), Pinnacle (+6 WS); +1 WS per associated secondary trade skill at Rank 6+; x2 bonus for professional Expression, Medicine, or Metafocus Discipline practitioners.
* **Wealth Check & Cycle Debt Financing (`2d10 + WS vs. Item Cost CR`):** When acquiring an item whose Crafting CR exceeds the character's Wealth Score (`Liquidity Gap = Value[Item CR] - Value[Character WS]`), the operator may either pay the Liquidity Gap directly in liquid Credits or pass a Wealth Check (`2d10 + WS vs. Item CR`) to finance the Liquidity Gap as Cycle Debt due on the next financial rollover (unpaid debt imposes a -2 WS Delinquent Debt penalty).

---

# **The Liquidity Gap and Friction Mechanics**

A common failure point in abstract wealth systems is the "infinite money loop," where players attempt to use their passive Wealth Score to acquire high-value items for free and immediately sell them for infinite cash. Tangent mitigates this via strict friction mechanics, ensuring "Loot" (liquid Credits) remains a vital gameplay reward at all tiers.

**The Liquidity Constraint (The Gap Rule):** When a character seeks an item with a CR exceeding their Wealth Score, their passive income cannot cover the transaction. They must bridge the gap with liquid Credits. The required liquid cost is calculated by subtracting the Credit value of the character's Wealth Score from the Credit value of the desired item's CR.

For example, if an Affluent character (WS 15, Auto-Buy Limit \~640 Cr) wishes to purchase an advanced Stealth Suit (CR 18, Value \~1,470 Cr), the character applies their WS 15 leverage to cover the base lifestyle cost, leaving a remainder of 830 Credits that must be paid in liquid cash from their adventuring savings.

**Liquidity Drag (The Fence Rate):** To further prevent market abuse, the economy imposes Liquidity Drag. In real-world economics and RPG simulations, the "Buy" price and "Sell" price are never identical due to fencing effort, market saturation, and legality. The Sell Price of an item is heavily reduced:

  - Legal goods sell at 50% of Total Value.
  - Black market or stolen goods sell at 20-25%.
  - Scrap sells at 10%.

Because the raw materials required to craft an item also cost 50% of the item's Total Value, a character who buys materials and crafts an item for immediate resale operates at a 0% profit margin. Profit is only possible through adventuring, scavenging materials for free, or utilizing specialized merchant skills.

---

## **DISCREPANCY & RESTORATION LEDGER**
* **DISC-411 (Wealth Matrix & Liquid Interface Full Restoration):** Restored 100% of Sections 3 and 4 and The Liquidity Gap and Friction Mechanics from `/_ _ TANGENT RP CODEX _ _/2.00 ECONOMATRIX` (Lines 81–221 and 477–495) alongside the Starting Wealth Score derivation tables and Cycle Debt Financing mechanics.

