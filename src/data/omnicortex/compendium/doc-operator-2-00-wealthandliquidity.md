---
id: "doc-operator-2-00-wealthandliquidity"
name: "2.00 The Wealth Matrix & Liquid Interface"
fileName: "2.00.WealthAndLiquidity.md"
relPath: "operator/economatrix/2.00.WealthAndLiquidity.md"
isMasterDoc: false
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "doc-operator-2-00-economatrix"
order: 223
perspective: "operator"
entry_type: "Economatrix Catalog"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","economatrix","2.00.wealthandliquidity","mechanics"]
updatedAt: "2026-10-31T11:30:42.711Z"
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

# **THE WEALTH MATRIX & LIQUID INTERFACE**

## **3. The Wealth Matrix: Integrating Character Points and Status**

The Wealth Matrix serves as the translation layer between a character’s intrinsic potential (Character Points) and their extrinsic economic leverage (Wealth Score). Wealth Score (WS) is not a consumable pool of points to be depleted, but a static rating of economic leverage representing credit rating, active investments, salary, and social capital.

### **3.1 The Golden Rule of Tangent Wealth**

> **A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score.**

$$\mathbf{\text{Purchase DC} = \text{Crafting DC}}$$

This aligns the abstraction of "lifestyle" with the concrete math of item acquisition. If an operator is wealthy enough to possess an item, their passive income and credit lines absorb its upkeep and acquisition automatically.

### **3.2 Determining Starting Wealth Score**

A character's starting Wealth Score is derived from their identity choices during character creation:

$$\mathbf{\text{Starting Wealth Score (WS)}} = \text{Occupation Base} + \text{Origin Modifier} + \text{Faction Modifier} + \text{Tech Level Modifier} + \text{Skill Ranks Bonus}$$

#### **1. Occupations Wealth Base**
| Occupation | Base WS | Occupation | Base WS |
| :--- | :---: | :--- | :---: |
| **Adept** | 4 | **Merchant** | 5 |
| **Agent** | 2 | **Representative** | 6 |
| **Builder** | 3 | **Scholar** | 3 |
| **Citizen** | 2 | **Scout** | 1 |
| **Criminal** | 4 | **Soldier** | 1 |
| **Drifter** | 1 | **Specialist** | 3 |
| **Entertainer** | 5 | | |

#### **2. Origins Modifiers**
| Origin | WS Modifier | Origin | WS Modifier |
| :--- | :---: | :--- | :---: |
| **Agricultural** | +0 | **Leisure** | +3 |
| **Aquatic** | +1 | **Militaristic** | +0 |
| **Colony** | +0 | **Research** | +2 |
| **Enlightened** | +2 | **Spacer** | +1 |
| **Industrial** | +2 | **Urban** | +1 |
| **Others / Custom** | +0 to +3 | | |

#### **3. Factions Modifiers**
| Faction | WS Modifier | Faction | WS Modifier |
| :--- | :---: | :--- | :---: |
| **Alterian Combine** | +3 | **Entari Sovereignty** | +3 |
| **Auluran / Kitin** | +2 | **Impyrium** | +3 |
| **Ascendancy** | +4 | **Mekan Assembly** | +6 (Specialized) |
| **Coalition** | +0 | **Syndicate Compact** | +4 |
| **Dynasty** | +2 | **Outworlds / Independent** | +0 |
| **Others / Custom** | +0 to +3 | | |

#### **4. Tech Level (TL) Modifiers**
| Tech Level | Era | WS Modifier |
| :---: | :--- | :---: |
| **TL 0** | Stone Age (Primitive) | -4 |
| **TL 1** | Metal Age (Industrial) | -2 |
| **TL 2** | Data Age (Digital) | +0 |
| **TL 3** | Space Age (Stellar Baseline) | +2 |
| **TL 4** | Stellar Age (Galactic / Warp) | +4 |
| **TL 5** | Cosmic Age (Singularity / Genesis) | +8 |

#### **5. Skill Ranks in Trade & Vocations**
Characters practicing a vocation or trade receive +1 WS per skill stage:
* **Stage Bonus:** Novice (Rank 1–5): +1 WS | Trained (Rank 6–10): +2 WS | Expert (Rank 11–15): +3 WS | Master (Rank 16–19): +4 WS | Pinnacle (Rank 20): +5 WS.
* **Secondary Trade Skill:** An additional skill of Rank 6+ aiding in commerce/trade may be counted per stage of the primary skill, granting an additional +1 WS per associated skill.
* **Specialized Profession Multipliers:**
  * **Performance Skills:** Double listed bonus when practiced professionally (+2 to +10 WS).
  * **Medicine (Practicing Physician):** Double listed bonus (+2 to +10 WS; triple in medical scarcity zones).
  * **Discipline Skills:** Metaphysical talents command premium commodification, doubling listed bonuses (+2 to +10 WS).
  * **Piloting & Combat Skills:** Standard to double bonus when regular commercial or mercenary employment is maintained.
* *Untrained / Menial Workers:* Receive the baseline Middle Class pay of their society, adjusted downward for lower castes or impoverished regions.

### **3.3 The Extended Financial Status Hierarchy**

| Wealth Score (WS) | Financial Status | Auto-Buy Limit | Est. Net Worth | Lifestyle Description |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Indebted** | 0 Cr | Negative | Debt slavery or prison. Zero assets. Survival depends on others. |
| **1 – 4** | **Impoverished** | 10 – 30 Cr | < 500 Cr | Homeless or squatter. Scavenges for food/scrap. Possessions are improvised. |
| **5 – 9** | **Struggling** | 40 – 150 Cr | ~2,000 Cr | Shared room in a slum. Public transit only. Eating processed rations. |
| **10 – 14** | **Middle Class** | 160 – 600 Cr | ~25,000 Cr | Private apartment, steady wage. Consumer vehicle. Affords occasional luxuries. |
| **15 – 19** | **Affluent** | 640 – 2,500 Cr | ~200,000 Cr | High-end condo or small house. Quality personal vehicle. Professional services. |
| **20 – 29** | **Wealthy** | 2.5K – 40K Cr | ~5 Million Cr | Large estate, multiple vehicles. Staff of servants. Minor corporate investor. |
| **30 – 39** | **Hegemon** | 41K – 650K Cr | ~100 Million Cr | Skyscraper penthouse. Owns small corporation. Personal security detail. Private shuttle. |
| **40 – 49** | **Industrialist** | 650K – 10M Cr | ~2 Billion Cr | Megacorp executive. Owns starships (Corvettes). Influences planetary law. |
| **50 – 59** | **Dynastic** | 10M – 167M Cr | ~50 Billion Cr | Nobility or megacorp CEO. Owns orbital habitats/stations. Commands private fleets. |
| **60 – 69** | **System Lord** | 167M – 2.6B Cr | ~500 Billion Cr | Rules a solar system. Can fund planetary colonization. Owns capital ships (Cruisers). |
| **70 – 79** | **Sector Ruler** | 2.6B – 42B Cr | ~10 Trillion Cr | Rules a cluster of stars. Can terraform planets. Personal flagship is a Dreadnought. |
| **80+** | **Faction Ruler** | 42B – 600B+ Cr | ~1 Quadrillion Cr | Emperor / god-king. Post-scarcity economy. Constructs megastructures. |

### **3.4 Dynamic Wealth Adjustment (The Gold Sink)**
Wealth Score is dynamic. It can be damaged by major legal sanctions or loss of infrastructure, or elevated through capital investment:
* **Growth Formula:** To raise Wealth Score from $X$ to $X+1$, an operator must invest liquid Credits equal to the difference in value between the two tiers:
  $$\text{Investment Cost} = \text{Value}(WS_{X+1}) - \text{Value}(WS_X)$$
This provides a permanent endgame sink for adventuring capital, allowing characters to transition from mercenaries to sector hegemons.

---

## **4. The Liquid Interface: Credits and Friction Mechanics**

While Wealth Score handles macro-economic upkeep, lifestyle, and standard equipment, liquid **Credits** handle micro-economic transactions (loot, bribes, rare black-market curios, and gap purchasing).

### **4.1 The Liquidity Gap (The Gap Rule)**
A common failure point in abstract wealth systems is the "infinite money loop," where players auto-buy high-value gear and sell it for infinite liquid cash. Tangent eliminates this through two concrete mechanics:

**Rule 1: The Personal Use Limit**
Wealth Score covers items acquired for personal use or direct team operational needs. Bulk acquisition triggers an Administrative / Strain Check or requires specialized Merchant and Logistics credentials.

**Rule 2: The Liquidity Gap & Wealth Check Credit Financing**
When a character desires an item with a Crafting DC higher than their Wealth Score, passive financial leverage cannot automatically cover the full transaction. The difference between the item's value and the character's Wealth Score purchasing power is the **Liquidity Gap**:

$$\mathbf{\text{Liquidity Gap}} = \text{Value}(\text{Item DC}) - \text{Value}(\text{Character WS})$$

To acquire an item with a Liquidity Gap, the character has two options:
1. **Wealth Check & Cycle Debt Financing ($\mathbf{2\text{d}10 + \text{WS}}$ vs. $\mathbf{\text{Item Cost DC}}$):**
   * On a **successful Wealth Check**, the character leverages their credit lines to purchase the item and **incurs a Debt equal to the Liquidity Gap difference** to be paid off on the **next financial cycle** (month, pay schedule, or mission cycle).
   * **Wealth Cycle Rollover:** When the character's wealth rolls over on the next cycle, they normally pay off the debt (or part of it, up to their cycle WS purchasing power), unless they choose not to pay or encounter a financial/narrative issue—in which case the remaining debt persists on their ledger with **repercussions** (imposing a **$-2\text{ WS}$ Delinquent Debt penalty** and creditor escalation).
2. **Direct Liquid Credit Payment:**
   * The character immediately pays the **Liquidity Gap** out of their liquid Credit reserves (`Credits`) with no roll required and zero debt incurred.

*Scenario:*
* Character: Wealth Score 15 (Purchasing Power: ~640 Cr).
* Target: Advanced Stealth Suit (Craft DC 18).
* Valuation: DC 15 = 640 Cr; DC 18 $\approx 10 \times 4^{(18/5)} \approx 1,470\text{ Cr}$.
* Liquidity Gap: $1,470 - 640 = \mathbf{830\text{ Credits}}$.

The character uses their WS 15 leverage to cover the baseline 640 Cr threshold, either paying 830 Credits directly from liquid savings or passing a DC 18 Wealth Check ($2\text{d}10 + 15$) to finance the 830 Cr difference as a cycle debt due next rollover.

### **4.2 Liquidity Drag (The Fence Rate)**
To prevent market abuse, the economy imposes Liquidity Drag. The purchase price and resale price of goods are never identical:
* **Legal Goods:** Resell at **50%** of Total Value.
* **Black Market / Stolen Goods:** Resell at **20% – 25%** of Total Value.
* **Scrap / Salvage:** Resell at **10%** of Total Value.

Because raw materials required to fabricate an item also cost **50% of the item's Total Value**, an operator who purchases raw materials and crafts an item for immediate open-market resale operates at a **0% profit margin**. Profit is only possible through adventuring, scavenging raw materials for free (0 Cr cost), or utilizing specialized Merchant feats to elevate fence rates to 60%+.

---

