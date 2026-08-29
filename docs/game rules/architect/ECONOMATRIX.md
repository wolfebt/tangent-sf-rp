# **Tangent \- Economic Unified Theory**

# **Tangent \- Economic Unified Theory**

# **A Design Protocol for the Tangent SciFi Fantasy RPG**

## 

## **1\. Introduction: The Economic Dissonance in Roleplaying Games**

The design of economic systems within tabletop roleplaying games (RPGs) has historically suffered from a fundamental fracture between narrative ambition and mechanical execution. In the context of the Tangent SciFi Fantasy RPG, the objective is to synthesize a coherent economic engine that unifies character creation resources (Build Points or BP), abstract purchasing power (Wealth Score), liquid currency (Credits), and the mechanics of creation (Crafting DC). This unification is not merely an aesthetic choice but a structural necessity to prevent the "economic dissonance" that plagues legacy systems.  
Economic dissonance arises when the different currencies of a game—time, experience, gold, and crafting effort—fail to exchange at consistent rates. In Dungeons & Dragons 3.5 and Pathfinder, for example, the cost to craft an item is derived from its market price, which is often assigned arbitrarily by designers based on utility rather than complexity. This leads to ludonarrative failures where a high-level adventurer can slay a dragon in six seconds but requires years to forge a suit of armor that is statistically necessary for their survival. Conversely, systems like d20 Modern or Mutants & Masterminds utilize abstract Wealth Scores to streamline bookkeeping, yet often struggle to integrate the granular rewards of "loot" that drive player motivation in dungeon-crawling scenarios.  
This report proposes a singular, mathematically rigorous solution: **The Tangent Economic Matrix**. By establishing the Crafting Difficulty Class (DC) as the "Prime Mover" of the economy, we ensure that the value of an object is a direct, non-arbitrary derivative of the complexity required to create it. This approach aligns the simulationist desire for a logical world (harder things cost more) with the gamist need for balanced progression (investment in BP yields proportional economic power).  
The following analysis draws upon a broad spectrum of RPG mechanics—from the granular accounting of Traveller starship economics to the abstract point-buy of GURPS—to construct a robust system capable of handling the immense scale variance inherent in a SciFi Fantasy setting, where players may trade both iron daggers and faster-than-light dreadnoughts.

## 

## 

## **2\. Theoretical Framework: The Valuation Vector**

To ensure Crafting DC directly correlates to item value, we must abandon the traditional design paradigm where price is determined by utility balance and crafting is a secondary derivation. Instead, Tangent posits that **Complexity Determines Value**. The market price of an item is simply the societal aggregate of the skill (DC) and time required to produce it.

### 

### **2.1 The Failure of Linear Scaling**

In analyzing legacy systems, a recurring failure point is linear or shallow geometric scaling. In Pathfinder, a \+1 sword costs 2,000 gp, and a \+2 sword costs 8,000 gp. The progression is quadratic (Bonus^2 \\times 1,000). While functional for heroic fantasy, this curve breaks down in SciFi environments. The difference in complexity between a handgun and a starship is not quadratic; it is logarithmic. A starship is not just "a very big gun"; it represents an order-of-magnitude leap in engineering difficulty.  
If we apply linear or shallow curves to a SciFi setting, we encounter the Traveller dilemma: players accumulate personal wealth that trivializes planetary economies, or starship prices become so astronomical that personal gear becomes mathematically irrelevant.

### 

### **2.2 The Tangent Standard Curve (TSC)**

To encompass the breadth of the Tangent setting—ranging from survival gear to orbital megastructures—the relationship between Crafting DC and Value must be exponential. We define the Tangent Standard Curve (TSC) via the following function:  
V \= V\_{base} \\times \\beta^{\\frac{DC \- DC\_{base}}{S}}  
Where:

* V is the Market Value in Credits.  
* V\_{base} is the baseline value of the simplest manufactured good (DC 0).  
* \\beta is the Growth Factor.  
* S is the Scale Interval (the DC step required to trigger the growth factor).

Through stress-testing various RPG economies, specifically looking at the "Wealth by Level" expectations in d20 systems versus the exponential costs of Traveller hulls, we derive optimal constants for Tangent:

* V\_{base} \= 10 Credits (The cost of a meal or scrap metal).  
* \\beta \= 4 (Value quadruples).  
* S \= 5 (Every \+5 DC increment).

The simplified formula becomes:  
**Value \= 10 \\times 4^{(DC / 5)}**  
This curve ensures that small increases in difficulty (representing technological breakthroughs or magical tiers) result in massive increases in value, accurately simulating the gap between mundane and advanced technology.

### 

### **2.3 The Coherence of DC-Derived Pricing**

By strictly adhering to this formula, we eliminate pricing debates. If a designer introduces a "Plasma Rifle," they do not guess its price. They determine its complexity relative to a "Ballistic Rifle."

* **Ballistic Rifle:** Standard machining. DC 15\.  
  * V \= 10 \\times 4^{(15/5)} \= 10 \\times 64 \= 640 Credits.  
* **Plasma Rifle:** Advanced energy physics, rare materials. DC 20\.  
  * V \= 10 \\times 4^{(20/5)} \= 10 \\times 256 \= 2,560 Credits.

The Plasma Rifle is inherently 4 times more valuable because it is one distinct tier (+5 DC) harder to manufacture. This creates a predictable, logical economy where Crafting DC is the DNA of the market.

## 

## 

## **3\. The Wealth Matrix: Integrating Build Points and Status**

The Wealth Matrix serves as the translation layer between the character’s intrinsic potential (Build Points) and their extrinsic economic power (Wealth Score). In many point-buy systems like GURPS or Mutants & Masterminds, wealth is a distinct advantage purchased separately from skills. Tangent integrates this by treating Wealth Score (WS) as a status attribute that dictates purchasing thresholds.

### 

### **3.1 Wealth Score as Purchasing Power**

The Wealth Score in Tangent is not a pool of points to be depleted, but a static rating of economic leverage. It represents credit rating, salary, investments, and social capital. Its function is tethered directly to the Crafting DC of items.  
**The Golden Rule of Tangent Wealth:**  
> A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting their liquid Credits or reducing their Wealth Score.  
This unifies the system: **Purchase DC \= Crafting DC.**  
This elegant alignment resolves the disconnect found in d20 Modern, where Purchase DC is a separate derived stat often disjointed from the item's creation rules. In Tangent, if you are rich enough to buy a thing (WS), you are theoretically rich enough to fund its creation.

### 

### **3.2 The Expanded Financial Status Hierarchy**

This table defines the social and economic power of a character based on their Wealth Score. It scales from the destitute to the rulers of interstellar empires.  
**Column Definitions:**

* **Wealth Score (WS):** The target DC the character can "Take 10" on for purchasing. It is the primary attribute derived from BP investment.  
* **Financial Status:** The socio-economic label applied to the character in the game world.  
* **BP Cost:** The cost in Character Build Points to acquire this status at creation. Costs scale non-linearly to represent the exponential utility of wealth.  
* **Purchasing Limit (Liquid Cap):** The maximum Credit value of a single item the character can purchase automatically without rolling or dipping into savings. This aligns with the item's Crafting DC.  
* **Net Worth (Est):** The theoretical total value of the character's assets (land, stocks, ships, favor). This is usually 100x–1000x their liquid purchasing limit and is used for collateral on loans.  
* **Lifestyle Description:** What the character's daily life looks like and what assets they likely maintain.

  #### 

  #### **Table 3.2: Extended Financial Status Hierarchy**

| Wealth Score (WS) | Financial Status | BP Cost | Purchasing Limit (Auto-Buy) | Estimated Net Worth | Lifestyle Description |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **0** | Indebted | \-5 (Flaw) | 0 Cr | Negative | Debt slavery or prison. Zero assets. Survival depends on others. |
| **1 \- 4** | Impoverished | 0 | 10 \- 30 Cr | \< 500 Cr | Homeless or squatter. Scavenges for food/scrap. Possessions are improvised. |
| **5 \- 9** | Struggling | 2 | 40 \- 150 Cr | \~2,000 Cr | Shared room in a slum. Public transit only. Eating processed rations. |
| **10 \- 14** | Middle Class | 5 | 160 \- 600 Cr | \~25,000 Cr | Private apartment, steady wage. Consumer vehicle. Can afford occasional luxuries. |
| **15 \- 19** | Affluent | 10 | 640 \- 2,500 Cr | \~200,000 Cr | High-end condo or small house. Quality personal vehicle. Access to professional services. |
| **20 \- 29** | Wealthy | 20 | 2,500 \- 40,000 Cr | \~5 Million Cr | Large estate, multiple vehicles. Staff of servants. Minor corporate investor or local celebrity. |
| **30 \- 39** | Hegemon | 35 | 41K \- 650K Cr | \~100 Million Cr | Skyscraper penthouse. Owns a small corporation. Personal security detail. Travels via private shuttle. |
| **40 \- 49** | Industrialist | 50 | 650K \- 10M Cr | \~2 Billion Cr | Megacorp executive. Owns starships (Corvettes). Can influence planetary law. |
| **50 \- 59** | Dynastic | 70 | 10M \- 167M Cr | \~50 Billion Cr | Minor nobility or Megacorp CEO. Owns space stations or orbital habitats. Commands private fleets. |
| **60 \- 69** | System Lord | 95 | 167M \- 2.6B Cr | \~500 Billion Cr | Rules a solar system. Can fund planetary colonization. Owns capital ships (Cruisers) personally. |
| **70 \- 79** | Sector Ruler | 125 | 2.6B \- 42B Cr | \~10 Trillion Cr | Rules a cluster of stars. Can terraform planets. Personal flagship is a Dreadnought. |
| **80+** | Faction Ruler | 160 | 42B \- 600B+ Cr | \~1 Quadrillion Cr | Emperor/god-king. Economy is post-scarcity. Builds megastructures (Dyson Spheres, Ringworlds). |

**Note on Scaling:**

* The jump from Wealthy (WS 20\) to Hegemon (WS 30\) represents the transition from "Person with Money" to "Person with Assets."  
* The jump from Dynastic (WS 50\) to System Lord (WS 60\) represents the transition from "Personal Wealth" to "State Power." At WS 60+, the character's wealth is effectively the GDP of a nation-state.

### 

### **3.3 Dynamic Wealth Adjustment**

Wealth Score is not static. It can be damaged or improved.

* **Wealth Damage:** Major failures, legal sanctions, or "burning assets" can lower WS.  
* **Wealth Growth:** Investing large sums of liquid Credits (Loot) can raise WS.

Growth Formula: To raise WS from X to X+1, one must invest Credits equal to the difference in value between the two tiers.  
This provides a "Gold Sink" for players, allowing them to retire from adventuring by slowly building their passive Wealth Score.

## 

## 

## **4\. The Liquid Interface: Credits and Transaction Mechanics**

While Wealth Score handles the macro-economy (lifestyle, upkeep, standard gear), Credits handle the micro-economy (loot, bribes, rare artifacts, gap purchasing). A purely abstract system (like d20 Modern) often feels unsatisfying because players enjoy the tactile reward of finding "money". Tangent hybridizes the two.

### 

### **4.1 The Liquidity Gap**

A common issue in point-buy wealth systems is the "infinite money" loop. If I have Wealth Score 20, and I can buy DC 20 items for free, can I buy 10,000 Plasma Rifles and sell them?  
Tangent prevents this via **The Liquidity Constraint**.

Rule 1: The Personal Use Limit  
Wealth Score covers items for personal use or reasonable team support. Bulk acquisition triggers a "Strain Check" or requires a specialized "Logistics" skill check.

Rule 2: Purchasing Above Wealth (The Gap Rule)  
When a character wants an item with a DC higher than their Wealth Score, they cannot simply buy it. They must bridge the gap with liquid Credits.  
Cost\_{Liquid} \= Value(Item\_{DC}) \- Value(WealthScore)

**Scenario:**

* Character: Wealth Score 15 (Purchasing Power: 640 Cr).  
* Target: Stealth Suit (Craft DC 18).  
* Valuation:  
  * DC 15 Value \= 640 Cr.  
  * DC 20 Value \= 2,560 Cr.  
  * To find DC 18, we interpolate: 10 \\times 4^{(18/5)} \\approx 1,470 Cr.  
* The Cost: 1,470 \- 640 \= 830 Credits.

The character uses their WS to cover the "base" lifestyle cost but must dip into their liquid savings (Loot) to cover the 830 Credit difference. This keeps Loot relevant at all levels of play.

### 

### **4.2 Liquidity Drag (Selling Items)**

To further prevent the "buy free / sell for cash" loop, we introduce Liquidity Drag.  
In real-world economics and RPG simulations like Recettear or EVE Online, the "Buy" price and "Sell" price are never identical due to friction (fencing effort, market saturation, legality).  
Rule 3: The Fence Rate  
Items sold by players yield only a fraction of their theoretical Value, typically 20-50%, depending on the legality and the buyer’s Interest.

* Legal Goods: Sold at 50%.  
* Black Market / Stolen: Sold at 20-25%.  
* Scrap: Sold at 10%.

Since materials to craft an item typically cost 50% of the item's value (standard RPG balance), a character who buys materials and crafts an item to sell it at 50% value makes zero profit. Profit is only possible if:

1. They Scavenge materials (Time cost, 0 Credit cost).  
2. They have a "Merchant" ability raising the sell percentage to 60%+.

This effectively creates a functioning economy where crafting is for utility, not infinite wealth generation.

## 

## 

## **5\. The Crafting Engine: Complexity as Gameplay**

The Tangent crafting system must solve the "Time vs. Cost" paradox. In Pathfinder, high-value items take so long to craft that the campaign often ends before the item is finished. In Tangent, because Value scales exponentially, Crafting Speed must also scale exponentially to keep pace.

### 

### **5.1 The Productivity Formula**

We introduce Productivity Points (PP).

* **Item Complexity (Target PP):** Equal to the Item's Credit Value. (e.g., DC 20 item requires 2,560 PP).  
* **Crafter Output:** determined by Skill Check and Tier Multiplier.

Daily\\ Progress (PP) \= (Craft\\ Check\\ Result \- 10\) \\times Tier\\ Multiplier

#### 

#### **Table 5.1: The Production Tiers**

| TECH TIER | TOOLS REQUIRED | MULTIPLIER | NARRATIVE EQUIVALENT |
| :---: | :---: | :---: | ----- |
| **0** | **Improvised** | x1 | Stone tools, bare hands, cave. |
| **1** | **Basic** | x10 | Garage kit, basic smithy, handheld tools. |
| **2** | **Advanced** | x50 | Professional workshop, machine shop, alchemist lab. |
| **3** | **Industrial** | x200 | Automated factory line, major magical circle. |
| **4** | **Nanoforge** | x1,000 | Molecular assemblers, Wish-level fabrication. |
| **5** |  **Genesis** | x5,000 | Polymatter loom, Holophotonics or metaphysical fabrication. |
| **Bio**  | **Cultivation** | x1,000 | Hyper-Growth Vats where items are grown. |

### 

### **5.2 Solving the "Decades" Problem**

Let us test the math on a high-level item: The Titan Mech Suit (Craft DC 30).

* **Value:** 10 \\times 4^{(30/5)} \= 10 \\times 4096 \= 40,960 Credits.  
* **Target PP:** 40,960.

**Scenario A: The Hobbyist (Pathfinder Style)**

* Skill Check: 20\.  
* Tools: Basic (x10).  
* Daily Progress: (20-10) \\times 10 \= 100 PP.  
* Time: 40,960 / 100 \= 409.6 Days.  
* *Result: Realistic for a hobbyist in a garage.*

**Scenario B: The Master Engineer (Tangent Style)**

* Skill Check: 35 (High level, buffs).  
* Tools: Advanced Workshop (x50).  
* Daily Progress: (35-10) \\times 50 \= 1,250 PP.  
* Time: 40,960 / 1,250 \\approx 33 Days.  
* *Result: A month of downtime. Reasonable for a major campaign upgrade.*

**Scenario C: The Nanoforge (Endgame)**

* Skill Check: 40\.  
* Tools: Nanoforge (x1,000).  
* Daily Progress: (40-10) \\times 1,000 \= 30,000 PP.  
* Time: 40,960 / 30,000 \\approx 1.4 Days.  
* *Result: High-level characters with high-level infrastructure can print mechs over a weekend.*

This exponential scaling of "Tier Multipliers" counters the exponential growth of "Item Value," ensuring that crafting remains a viable gameplay option from level 1 to level 20\.

## 

## 

## **6\. Comprehensive Reference Tables**

The following tables serve as the GM's primary interface for the Tangent Economic Matrix.

#### 

#### **Table 6.1: The Master Valuation Table (DC to Credits)**

| CRAFT DC | COMPLEXITY | VALUE (CREDITS) | EXAMPLES (SCIFI / FANTASY) |
| :---: | :---: | :---: | ----- |
| **0** | Scrap | 10 | Raw ore, ration bar, wooden club. |
| **5** | Simple | 40 | Knife, backpack, basic clothing, bandages. |
| **10** | Standard | 160 | Pistol, sword, light armor, commlink. |
| **15** | Expert | 640 | Rifle, plate mail, medkit, hacking tool. |
| **20** | Advanced | 2,560 | Plasma weapon, full environmental suit, masterwork gear. |
| **25** | Master | 10,240 | Cybernetic limb, hoverbike, magic ring, heavy weapon. |
| **30** | Grandmaster | 40,960 | Power armor, golem, personal shuttle, rare artifact. |
| **35** | Heroic | 163,840 | AI Core, fighter jet, small starship hull. |
| **40** | Legendary | 655,360 | Corvette-class ship, legendary artifact, fortress. |
| **45** | Mythic | 2,621,440 | Frigate, resurrection chamber, moon base module. |
| **50** | Transcendent | 10,485,760 | Dreadnought, planetary shield generator. |

*Note: Values are derived from* 10 \\times 4^{(DC/5)}*. Intermediate values can be interpolated or rounded for ease of play.*

#### 

#### **Table 6.2: Wealth Score Purchasing Guidelines**

| WEALTH SCORE | LIFESTYLE | CAN AUTO-PURCHASE (DC) | NEEDS LIQUIDITY FOR (DC) |
| :---- | :---- | :---- | :---- |
| **5 (Struggling)** | Rations, Hostels | DC 5 (Simple) | DC 10 (Standard) |
| **10 (Middle)** | Apts, Consumer goods | DC 10 (Standard) | DC 15 (Advanced) |
| **15 (Affluent)** | High-end tech, luxury | DC 15 (Advanced) | DC 20 (Expert) |
| **20 (Wealthy)** | Military gear, security | DC 20 (Expert) | DC 25 (Master) |
| **25 (Tycoon)** | Vehicles, Cybernetics | DC 25 (Master) | DC 30 (Grandmaster) |
| **30 (Hegemon)** | Heavy Mechs, Property | DC 30 (Grandmaster) | DC 35 (Heroic) |

## 

#### **6.3 Universal Displacement Unit (UDU) Hierarchy**

To ensure compatibility between the microscopic (Cybernetics) and the macroscopic (Capital Ships), Tangent utilizes a strict three-tier capacity system.

| TIER | UNIT NAME | SCALE CONTEXT |
| :---: | :---: | ----- |
| **Tier 0** | **Node** | Augmentations/Micro Unit (Cybernetic options). \<10g. 10 Nodes usable per Socket. |
| **Tier 1** | **Socket** | Personal Base Unit (Guns, Computers). \<1kg |
| **Tier 2** | **Mount** | Mecha / Vehicle. \<100k. 10 Sockets usable. |
| **Tier 3** | **Module** | Architectural / Capital. \<10tons. 10 Mounts usable. |

## **7\. Macro-Economics: Factions and Starships**

A robust SciFi RPG must handle economics beyond the personal scale. How does a faction build a fleet?

### 

### **7.1 The "Resource Unit" Abstraction**

When dealing with items of DC 40+ (Starships, Stations), tracking individual Credits becomes cumbersome. Following the Traveller model of "Resource Units" (RU) or "Megacredits", we can simplify the math.

* 1 MegaCredit (MCr) \= 1,000,000 Credits.  
* A DC 50 Dreadnought costs \~10.5 MCr.

### 

### **7.2 Cooperative Crafting (Industrial Scale)**

An individual cannot craft a Dreadnought. The "Time" required would be centuries.  
**Faction Crafting Rule:**

* Factions utilize Labor Pools.  
* A Shipyard employs 1,000 workers.  
* Each worker contributes to the "Daily Progress" (PP).  
* Total Daily PP \= \\sum (Individual\\ PP).

**Example:** Building the Dreadnought (Value 10,485,760).

* **Shipyard:** 1,000 Workers (Skill check avg 15).  
* **Tools:** Industrial (x200).  
* **Per Worker Output:** (15-10) \\times 200 \= 1,000 PP/Day.  
* **Total Shipyard Output:** 1,000 \\times 1,000 \= 1,000,000 PP/Day.  
* **Construction Time:** 10.5 Days.

This confirms that the Tangent math holds up at the macro scale. A major shipyard can churn out a capital ship every two weeks, provided they have the 5.25 Million Credits (50% material cost) to fund it. This creates strategic gameplay: Factions fight not just for territory, but for the Credits (resources) to keep their shipyards fed.

## 

## 

## **8\. Stress Testing and Edge Cases**

### 

### **8.1 The "Infinite Wealth" Exploit**

**Scenario:** A high-level party pools their money to buy a Nanoforge (x1,000 multiplier) and tries to flood the market with Plasma Rifles (DC 20).  
**The Check:** The economy is not a bottomless pit. Selling items requires a Buyer.  
**Market Saturation:** Each settlement has a "Wealth Limit" (similar to Skyrim shopkeepers or D\&D settlement caps). A village cannot buy 100 Plasma Rifles. A metropolis can, but prices will crash (Supply/Demand).  
**GM Tool:** The GM imposes a "Mercantile DC" to find buyers for bulk goods. The DC increases with the quantity sold.

* Sell 1 Rifle: DC 10 (Easy).  
* Sell 10 Rifles: DC 20 (Hard).  
* Sell 100 Rifles: DC 40 (Impossible without contacts).

### 

### **8.2 The "Artifact" Problem**

Scenario: Players find a Precursor Artifact. What is it worth?  
Resolution: The GM assigns a Craft DC based on its function.

* Does it kill gods? DC 60\.  
* Value: 10 \\times 4^{(60/5)} \= 10 \\times 4^{12} \\approx 167 Million Credits.

The players now have an asset worth a planetary GDP. They cannot sell it at a pawn shop (no buyer has that Wealth Score). They must find a Hegemon tier buyer, turning the "sale" into a campaign arc involving diplomacy, intrigue, and heist defense.

### 

### **8.3 Party Pooling**

Can a party of 4 "Middle Class" (WS 10\) characters combine funds to buy a "Wealthy" (WS 20\) item?

* **Liquid Credits:** Yes. They can pool loot.  
* **Wealth Score:** No. Wealth Score is personal status. Four middle managers do not equal one CEO. They cannot combine their WS to auto-purchase a tank. They must use the Gap Rule and pay cash.

## 

## 

## **9\. Conclusion**

The Tangent Economic Matrix succeeds by establishing a rigid, mathematical backbone (Value \= f(DC)) while allowing for flexible gameplay interfaces (Wealth Score for lifestyle, Credits for loot).

* **Crafting DC** is the absolute truth of the universe. It dictates **Value**.  
* **Value** dictates the **Time** required to build and the **Wealth** required to buy.  
* **Build Points** allow players to invest in this system, gaining exponential returns on Purchasing Power, paralleling the exponential returns of Combat Power in a leveling RPG.

This system avoids the pitfalls of linear crafting times, resolves the abstraction issues of wealth scores, and scales effortlessly from the street level to the starship level. It provides the Tangent SciFi Fantasy RPG with an economy that is consistent, exploitable only through gameplay effort, and robust enough to support years of campaign escalation.

## 

## 

## **10\. Action: Retrofit Directive for Item Entries**

**Critical Rule:** Every item Stat Block MUST include both a Wealth Score (WS) and a Credit Value (Cr).

### 

### 

### **The Base Value Formula**

All items lacking a specific credit value must be recalculated using this Framework formula based on Crafting DC:  
Value (Credits) \= 10 \\times 4^{(DC/5)}  
**Logic:** Players with a Wealth Score lower than the Item's WS must pay the difference in Cash or secure other credit.  
**Formula:**  
Cash\\ Cost \= (Item\\ Value) \- (Value\\ of\\ Player's\\ Wealth\\ Score\\ Tier)

## 

## **Addendum: Quick Reference Formulas**

* **Value (Cr):** 10 \\times 4^{(DC/5)}  
* **Material Cost:** 50% of Value.  
* **Crafting Time (Days):** Value / ((Skill \- 10\) \\times ToolMultiplier)  
* **Liquidity Gap:** Cost \= Value\_{Item} \- Value\_{WS}  
* **WS Increase Cost:** Value(TargetWS) \- Value(CurrentWS)

---

### 

# **The Liquidity Gap and Friction Mechanics**

A common failure point in abstract wealth systems is the "infinite money loop," where players attempt to use their passive Wealth Score to acquire high-value items for free and immediately sell them for infinite cash.4 Tangent mitigates this via strict friction mechanics, ensuring "Loot" (liquid Credits) remains a vital gameplay reward at all tiers.4  
**The Liquidity Constraint (The Gap Rule):** When a character seeks an item with a DC exceeding their Wealth Score, their passive income cannot cover the transaction.4 They must bridge the gap with liquid Credits.3 The required liquid cost is calculated by subtracting the Credit value of the character's Wealth Score from the Credit value of the desired item's DC.4  
For example, if an Affluent character (WS 15, Auto-Buy Limit \~640 Cr) wishes to purchase an advanced Stealth Suit (DC 18, Value \~1,470 Cr), the character applies their WS 15 leverage to cover the base lifestyle cost, leaving a remainder of 830 Credits that must be paid in liquid cash from their adventuring savings.4  
**Liquidity Drag (The Fence Rate):** To further prevent market abuse, the economy imposes Liquidity Drag.4 In real-world economics and RPG simulations, the "Buy" price and "Sell" price are never identical due to fencing effort, market saturation, and legality.4 The Sell Price of an item is heavily reduced:

* Legal goods sell at 50% of Total Value.4  
* Black market or stolen goods sell at 20-25%.4  
* Scrap sells at 10%.4

Because the raw materials required to craft an item also cost 50% of the item's Total Value, a character who buys materials and crafts an item for immediate resale operates at a 0% profit margin.4 Profit is only possible through adventuring, scavenging materials for free, or utilizing specialized merchant skills.4

## 

## 

## ---

# **The Productivity Engine and Macro-Economics**

Because the Tangent Standard Curve dictates that value scales exponentially, a linear crafting system (e.g., generating 50 credits of value per day) would require literal centuries to build high-end assets, ending campaigns before items are finished.4 Tangent solves the "Time vs. Cost" paradox through the Productivity Engine, converting effort into Productivity Points (PP).4

### 

### **The Productivity Formula**

To craft an item, the creator must accumulate a Target PP equal exactly to the item's Credit Value.4 Daily progress is generated based on the crafter's skill variance and the tier of their infrastructure.4 A creator's Daily Progress in Productivity Points is calculated by taking their Craft Check Result, subtracting 10, and multiplying that number by the tool's Tier Multiplier.4  
The Tool Tier Multiplier is the critical variable that allows the timeline to scale exponentially alongside the item's value 4:

* **Tier 0 (Improvised):** x1 Multiplier. Bare hands, stone tools.4  
* **Tier 1 (Basic):** x10 Multiplier. Handheld power tools, garage kit.4  
* **Tier 2 (Advanced):** x50 Multiplier. Professional machine shop.4  
* **Tier 3 (Industrial):** x200 Multiplier. Automated factory lines.4  
* **Tier 4 (Nanoforge):** x1,000 Multiplier. Molecular assembly swarms.4  
* **Bio (Cultivation):** x1,000 Multiplier. Hyper-Growth Vats (Auluran/Kitin) where items are grown in accelerated nutrient tanks. Requires Medicine/Nature and Engineering checks.3  
* **Tier 5 (Genesis):** x5,000 Multiplier. Thought-responsive Polymatter loom, Holophotonics or Wish-level metaphysical fabrication.3

Under this engine, a Mastercraft Titan Mech Suit (DC 30, Target PP \= 40,960) would take a hobbyist with Basic Tools (x10) over 409 days to build.4 However, an advanced engineering character utilizing a Nanoforge (x1,000) with a high check result can materialize the identical Mech Suit in less than two days.4

### 

### **Macro-Scale Construction and Faction Labor Pools**

For astronomical projects like a Dreadnought (DC 50, Value \~10.5 Million Cr) or a Titanic Arcology (DC 60+, Value \~167 Million Cr), individual crafting is physically impossible.1 Factions utilize **Labor Pools** to execute macro-scale construction.4 The Daily PP output is simply the sum of individual workers.4  
A shipyard employing 1,000 engineers operating Industrial (x200) tools can generate 1,000,000 PP per day, completing a capital ship in roughly 10.5 days.4 This macro-economic logic drives factional warfare; maintaining these shipyards requires an uninterrupted flow of massive liquid capital (5.25 Million Cr in raw materials per ship), forcing factions to fight for territorial resources to keep their production engines fed.4

---

# **Economy and Trade**

## **1\. Economic Framework: Resources and Trade**

In the Tangent universe, economics is warfare by other means. Trade routes are the arteries of civilization, and commodities are the blood that fuels the expansion of empires. Whether moving legitimate freight for the Syndicate or smuggling Aether-dust through a Coalition blockade, the flow of goods defines the rise and fall of planetary powers.

This section provides the mechanics for commodity exchange, cargo speculation, and the dangerous allure of the black market, underpinned by the **Tangent Economic Unified Field Theory**.

### **1.1. Trade Classifications and Codes**

Worlds are assigned tags that influence supply and demand, creating a web of interdependence between systems. A savvy trader knows that a world's classification is a roadmap to profit.

#### **1.1.1. World Codes & Market Modifiers**

| Code | Classification | Requirements (TWP Logic) | Primary Exports | Market Modifiers & Opportunities |
| :---- | :---- | :---- | :---- | :---- |
| **Ag** | Agricultural | Atmos 4-9, Hydro 4-8, Pop 5-7 | Foodstuffs, Textiles, Bio-matter, Timber | **Food:** \-50% Cost. **Ind:** \+20% Cost. High demand for Machinery and Tech to maintain automated harvesters. |
| **As** | Asteroid | Size 0, Atmos 0, Hydro 0 | Ores, Crystals, Zero-G Tech | **Minerals:** \-40% Cost. **Food:** \+50% Cost. Desperate for organics and luxury entertainment to combat isolation. |
| **Ba** | Barren | Pop 0, Gov 0, Law 0 | Salvage, Artifacts | **All Goods:** Unavailable. Scavenge only. High demand for Survival Gear among xeno-archaeologists. |
| **De** | Desert | Hydro 0 | Silica, Solar Energy, Artifacts, Salt | **Water:** \+100% Cost. **Survival Gear:** Premium. Prime market for water-reclamation tech and cooling units. |
| **Fl** | Fluid Oceans | Atmos 10+ (Exotic), Hydro 1+ | Chemical Compounds, Fuel | **Chems:** \-30% Cost. **Machinery:** \+20% Cost. Corrosive atmosphere creates constant demand for replacement parts and alloys. |
| **Ga** | Garden | Size 5+, Atmos 4-9, Hydro 4-8 | Luxuries, Art, Biologicals | **Luxuries:** \-20% Cost. **High Tech:** Standard. Often a hub for tourism; high demand for exotic foods and high-status items. |
| **Hi** | High Pop | Pop 9+ | Manufactured Goods, Information | **Manuf:** \-10% Cost. **Food:** \+20% Cost. Voracious appetite for raw materials and food; produces cheap consumer electronics. |
| **Ht** | High Tech | TL 12+ (standard) or TL 4+ (Tangent) | Computers, Medical, Cybernetics, Ships | **High Tech:** \-10% Cost. **Raw Mats:** \+30% Cost. Exports advanced weaponry and medical pods; imports rare minerals for manufacturing. |
| **Ic** | Ice-Capped | Atmos 0-1, Hydro 1+ | Water (Ice), Superconductors, Cryo-Tech | **Water:** Cheap. **Heat Gear:** Premium. Exports coolant and pure water; desperate for fusion cells and thermal insulation. |
| **In** | Industrial | Atmos 0-2/4/7/9, Pop 9+ | Weapons, Vehicles, Modules, Electronics | **Ind Goods:** \-20% Cost. **Food:** \+30% Cost. The forge of the sector. Imports vast quantities of metal and workforce sustenance. |
| **Lo** | Low Pop | Pop 1-3 | Raw Materials | **All Manufactured:** \+50% Cost (Scarcity). Dependent on trade for advanced tools; exports raw, unprocessed resources. |
| **Lt** | Low Tech | Pre-industrial (TL2 or less) | Handmade Goods, Raw Resources | **High Tech:** Unavailable or \+200% Cost. High value placed on off-world "magic" (tech); exports exotic, hand-crafted curios. |
| **Na** | Non-Ag | Too dry/barren for farming | Textiles (Synthetic), Processed Ore | **Textiles:** Standard. **Food:** \+10% Cost. Often factory worlds or prison colonies; relies on imported synthetic foodstuffs. |
| **Ni** | Non-Ind | Pop 4-6 | Raw Materials | **Manuf:** \+10% Cost. Service economies or developing worlds; high demand for off-world entertainment and luxury. |
| **Po** | Poor | Lacking resources/viable land | Scrap, Labor | **Labor:** Cheap. **All Goods:** \+10% Cost. Exports cheap workforce contracts; desperate for basic medical supplies. |
| **Ri** | Rich / Mining | Economic powerhouse / Rare minerals | Luxuries, Advanced Tech, Ores, Crystals | **Luxuries:** Standard. **Raw Mats:** \-30% Cost. High disposable income; prime market for exotic art, pets, and illegal vices. |
| **Va** | Vacuum | Atmos 0 | Salvage, Zero-G Goods, Ores | **Air/Water:** \+100% Cost. **Zero-G Gear:** Cheap. Dependent on life-support imports; exports refined isotopes and vacuum-welded hulls. |
| **Wa** | Water World | Hydro 10 (A) | Seafood, Hydrogen, Algae, Deuterium | **Food:** \-20% Cost. **Land Goods:** \+50% Cost. Exports protein paste base; imports metals and wood, which are luxury items here. |

#### **1.1.2. Trade Route Dynamics: The Cluster Theory**

Planetary economies rarely exist in a vacuum. They form **Trade Clusters**—symbiotic relationships between neighboring systems. Identifying these loops is the first step to building a mercantile empire.

* **The Survival Loop (Ag ↔ In):** The most common route. Industrial worlds (In) produce the tractors and harvesters that Agricultural worlds (Ag) need, while Ag worlds provide the gigatons of grain required to feed the Industrial workforce.  
  * *Route Risk:* Low piracy (heavily patrolled), low profit margins, high volume.  
* **The Extraction Chain (As/Ri ↔ Ht):** Asteroid belts (As) and Mining worlds (Ri) strip-mine raw materials to feed High Tech (Ht) foundries. In return, Ht worlds supply the advanced mining lasers, gravity plating, and cybernetics needed to survive the mines.  
  * *Route Risk:* High piracy (valuable cargo), moderate margins.  
* **The Life Support Run (Ic/Wa ↔ De/Va):** Moving water and oxygen from Ice (Ic) or Water (Wa) worlds to Desert (De) or Vacuum (Va) colonies. This is often a lifeline route; disruption here causes immediate humanitarian crises.  
  * *Route Risk:* Variable. Often subsidized by government contracts.

### **1.2. Commodities & Exchange Matrix**

While the Wealth Matrix handles personal gear, bulk trade goods (Commodities) form the backbone of the speculative market. Prices listed below are the **Base Galactic Average**.

| Category | Trade Good | Base Cost/Ton | Description & Tangent Flavor |
| :---- | :---- | :---- | :---- |
| **Essential** | Foodstuffs | 500 cr | Bulk grain, algae paste, or dehydrated rations. Essential for station survival. *Example: Karkinos Grains.* |
| **Essential** | Water (Ice) | 250 cr | Pure glacial ice or cometary fragments. Vital for desert/barren worlds. *Example: Krias Glacial Bricks.* |
| **Essential** | Textiles | 1,000 cr | Synthetic polymers, spider-silk from Rakne farms, or standard cotton. *Example: Rakne Silk.* |
| **Industrial** | Polymers | 4,000 cr | Raw plastics, rapid-print resin, and synthetic rubber. Used in 3D printing and construction. |
| **Industrial** | Chemicals | 5,000 cr | Fertilizers, industrial acids, and refined starship fuel (Hydrogen). *Example: Volatile Acids.* |
| **Industrial** | Metals (Common) | 7,000 cr | Steel, Aluminum, Copper. Used for construction and basic hulls. *Example: Durasteel beams.* |
| **Industrial** | Metals (Rare) | 25,000 cr | Titanium, Tungsten, Platinum. Used for high-end components. *Example: Iridium ore.* |
| **Tech** | Machinery | 15,000 cr | Heavy mining drills, atmospheric scrubbers, vehicle parts. *Example: Mekan Drill-Heads.* |
| **Tech** | Electronics | 30,000 cr | Sensor arrays, comms relays, consumer devices. *Example: Syndicate Data-Pads.* |
| **Tech** | High Tech | 50,000 cr | Grav-plates, fusion cores, medical pods. High value, low mass. *Example: Ascendancy Psi-Nodes.* |
| **Luxury** | Luxuries | 100,000 cr | Artwork, vintage wines, rare spices, actual paper books. *Example: Alterian Sun-Wine.* |
| **Luxury** | Biologics | 75,000 cr | Gene-seed, cloned organs, exotic pets (or their DNA). *Example: Auluran Graft-Seeds.* |
| **Restricted** | Weaponry | 40,000 cr | Small arms crates, vehicle turrets, explosives. (Law Level restrictions apply). *Example: Mag-Rail Rifles.* |
| **Restricted** | Armor | 35,000 cr | Plasteel plating, powered suit servos. *Example: Legionnaire Plate.* |

### **1.4. Exchange Mechanics: Speculative Cargo**

Players acting as "Free Traders" or Corporate Agents generate profit by exploiting the price gap between Supply (Source) and Demand (Destination) worlds. The core loop involves risk assessment, negotiation, and logistics.

#### **The Speculation Loop: An Example**

*Captain Vance wants to run a cargo of Rare Metals from the Asteroid Belt (As) to a High Tech (Ht) world.*

* **Assessment:** Vance rolls **Appraisal (DC 15\)**. Success\! He knows the Asteroid miners are flooding the market, dropping prices to 60% of base.  
* **Purchase:** He buys 10 tons of Rare Metals. Base cost is 25,000 cr/ton. With the \-40% Asteroid modifier and current fluctuation, he pays only 15,000 cr/ton. Total investment: 150,000 cr.  
* **Transport:** He dodges a pirate patrol in the Belt (Risk).  
* **Liquidation:** Arriving at the Ht world, he rolls **Broker**. A critical success\! The High Tech world usually pays \+30% for raw mats, but Vance triggers a bidding war. He sells at 200% of base value (50,000 cr/ton). Total Sale: 500,000 cr. Profit: 350,000 cr.

  #### **Step-by-Step Procedure:**

1. **Market Assessment (Appraisal):** The character must identify a profitable route. A successful **Appraisal (Int)** check (DC 15\) reveals the current market variance of a system.  
   * *Success:* Reveal accurate prices and any temporary modifiers.  
   * *Failure:* Prices are obscured or outdated (1d6 days old).  
2. **Acquisition (Purchase):** Cargo is purchased at the **Source World**.  
   * *Base Price:* Modified by the World Trade Codes (e.g., \-50% for Food on Ag worlds).  
   * *Negotiation:* A successful **Diplomacy** or **Bluff** check can lower the purchase price by an additional 5-10%.  
3. **Transport (Logistics):** The journey to the **Destination World**.  
   * *Expenses:* Fuel, docking fees, and crew wages must be factored in (approx. 10% of cargo value per jump).  
   * *Risk:* Random encounters (Pirates, Customs) increase with the value of the cargo. High-value cargo attracts high-level threats.  
4. **Liquidation (Brokerage):** Selling the goods at the destination.  
   * *Broker Check:* Roll Intelligence \+ Broker vs. Market DC (Base 15).  
   * *Success:* Sell at **Market Price** \+ 10-20% profit margin.  
   * *Critical Success:* Bidding war ensues. Sell at \+50% profit.  
   * *Failure:* Market saturation. Sell at **Market Price** (break even or minor loss after expenses).  
   * *Critical Failure:* Market crash, tariff hike, or embargo. Sell at \-20% loss.

   #### **Market Volatility & Trade Events**

The economy is not static. GMs may introduce events that drastically alter scarcity.

| d6 | Event | Effect on Market |
| :---- | :---- | :---- |
| **1** | Blockade / Embargo | Import/Export Halt. Prices for **Essential** and **Weapons** triple (x3). Black Market flourishes. |
| **2** | Famine / Blight | Agri-Collapse. **Foodstuffs** cost x5. **Biologics** demand increases. |
| **3** | Tech Boom | Innovation Spike. **High Tech** and **Electronics** prices drop by 50% (Surplus). |
| **4** | War Declaration | Military Buildup. **Metals**, **Weaponry**, and **Armor** demand spikes (x2 cost). |
| **5** | Resource Discovery | Mining Rush. **Raw Materials** prices crash locally (-50%). **Machinery** demand rises. |
| **6** | Trade Festival | Free Trade Zone. Tariffs suspended. \+2 Bonus to all Negotiation/Broker checks this week. |

### **1.5. The Gray and Black Markets**

Not all trade is legal. The **Black Market** operates in the shadows of high-Law worlds (Law 6+), offering immense profit at the risk of imprisonment or seizure. While the Grey Market deals in legal goods sold without tax (avoiding tariffs), the Black Market deals in goods that are explicitly banned.

#### **Contraband Categories:**

* **Combat Drugs:** Stimulants, pain-suppressors. (Value: 20k/kg). *High demand on Industrial and War-torn worlds.*  
* **Sentient AI Cores:** Unshackled artificial intelligence. (Value: 500k/unit). *Strictly banned by the Dynasty and Coalition; highly prized by the Syndicate.*  
* **Xeno-Artifacts:** Progenitor tech or non-sanctioned alien relics. (Value: Variable/High). *Illegal in Impyrium space; coveted by researchers and collectors.*  
* **Restricted Weaponry:** Mil-spec WMDs or disruptors. (Value: 2x Legal Weapons).

  #### **Smuggling Mechanics:**

* **The Run:** Moving goods requires a Pilot \+ Deception check vs. System Authority scans. The DC is determined by the Starport Law Level.  
* **Concealment:** Ships can install "Shielded Cargo Holds" (TL4) to impose Disadvantage on scan checks. False manifests (Forgery) can also grant bonuses.  
* **The Fence:** Selling contraband requires a Streetwise check to find a buyer without alerting the authorities.  
* **Consequences:** Getting caught in a Law 8+ system results in immediate ship impoundment and imprisonment. In Law 5-7, bribes (10-20% cargo value) may work to smooth things over.

### **1.6. Logistics and Cargo Capacity**

Understanding capacity is vital for any hauler. Tangent uses the **Universal Displacement Unit (UDU)** system, where cargo space is measured in **Slots** or **Tons**.

#### **Cargo Scaling:**

* **1 Slot (Personal):** Can hold \~1kg of small goods (Drugs, Gems, Data).  
* **1 Mount (Vehicle):** Can hold \~100kg (Crates of weapons, spare parts). 100 Sockets  
* **1 Module (Starship/Structure):** Can hold \~10 Tons (Bulk ore, vehicles, containers). 100 Mounts  
* *Note:* Most freighter capacities are listed in **Modules**. A "Cargo Bay" system usually provides 10-50 Modules of space depending on ship size.

  #### **Freight Contracts:**

Unlike speculation, Freight involves carrying someone else's goods for a flat fee. It is lower risk but lower reward (Standard: 1,000 cr per ton / per parsec). Failure to deliver results in reputation loss and penalties.

* **Mail/Courier:** High-priority data or small packages. Requires high speed and high security. (Standard: 5,000 cr per delivery). Often targeted by pirates looking for intel.

  #### **Passenger Liners:**

Transporting people is a steady income source but requires Life Support modules.

* **Low Passage:** Cryo-berth (frozen). Cheap (1,000 cr). Risk of "thaw sickness." Minimum space required.  
* **Mid Passage:** Standard cabin. (5,000 cr). Requires food and basic comfort.  
* **High Passage:** Luxury suite. (10,000 cr). Demands high-quality service and entertainment.

# **The Tangent Standard Curve (TSC)**

# **ECONOMATRIX**

### **The Tangent Standard Curve (TSC)**

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, the cost scaling must be exponential.4 The market price of every physical asset within the Tangent galaxy is generated using the Tangent Standard Curve (TSC) formula. This formula dictates that an item's value in Credits equals a baseline value of 10 Credits (representing the simplest manufactured good or scrap metal at DC 0\) multiplied by a growth factor of 4, raised to the power of the item's Crafting DC divided by 5\.4 The growth factor of 4 ensures that value inherently quadruples across every tier interval of 5 DC.4  
By strictly adhering to this calculation, all pricing debates are eliminated. This mathematical rigidity allows Game Masters to value any new, homebrew, or precursor artifact instantly simply by assigning it a Crafting DC based on its operational complexity.4

**The Master Valuation Table:**

| DC | COMPLEXITY | VALUE (CREDITS) | EXAMPLES (SCIFI / FANTASY) |
| :---: | :---: | :---: | ----- |
| **0** | **Scrap** | 10 | Raw ore, ration bar, wooden club. |
| **5** | **Simple** | 40 | Knife, backpack, basic clothing, bandages. |
| **10** | **Standard** | 160 | Pistol, sword, light armor, commlink. |
| **15** | **Advanced** | 640 | Rifle, plate mail, medkit, hacking tool. |
| **20** | **Expert** | 2,560 | Plasma weapon, full environmental suit, masterwork gear. |
| **25** | **Master** | 10,240 | Cybernetic limb, hoverbike, magic ring, heavy weapon. |
| **30** | **Grandmaster** | 40,960 | Power armor, golem, personal shuttle, rare artifact. |
| **35** | **Heroic** | 163,840 | AI Core, fighter jet, small starship hull. |
| **40** | **Legendary** | 655,360 | Corvette-class ship, legendary artifact, fortress. |
| **45** | **Mythic** | 2,621,440 | Frigate, resurrection chamber, moon base module. |
| **50** | **Transcendent** | 10.5 MCr | Dreadnought, planetary shield generator. |

### 

### 

### ---

### **Wealth Score and Purchasing Power**

Character economic power is quantified by the Wealth Score (WS), a static rating of economic leverage representing credit rating, active investments, salary, and social capital.4 The '99 \- AUGMENTATIONS FRAMEWORK' utilizes Build Points (BP) for biological tolerance; the Equipment Framework utilizes Wealth Score for material acquisition, translating a character's intrinsic potential (BP invested at character creation) into extrinsic economic power.4  
The integration of WS and the TSC operates on **The Golden Rule of Tangent Wealth**: A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score.4 This aligns the abstraction of "lifestyle" with the concrete math of item acquisition: Purchase DC \= Crafting DC.4

Composite score summing a characters income, prestige, endebtments, credit, savings, etc

Starting Wealth determined by adding the following categories   
(One choice from each category from character design)

| OCCUPATIONS | Wealth Base |
| :---- | :---- |
| Adept | 4 |
| Agent  | 2 |
| Builder | 3 |
| Citizen  | 2 |
| Criminal  | 4 |
| Drifter  | 1 |
| Entertainer  | 5 |
| Merchant  | 5 |
| Representative | 6 |
| Scholar  | 3 |
| Scout  | 1 |
| Soldier  | 1 |
| Specialist | 3 |

| ORIGINS | Modifier |
| :---- | :---- |
| Agricultural | 0 |
| Aquatic | 1 |
| Colony | 0 |
| Enlightened | 2 |
| Industrial | 2 |
| Leisure | 3 |
| Militaristic | 0 |
| Research | 2 |
| Spacer | 1 |
| Urban | 1 |
| OTHERS | 0 to 3 |

| FACTIONS | Modifier |
| :---- | :---- |
| Alterian | 3 |
| Auluran | 2 |
| Ascendancy | 4 |
| Coalition | 0 |
| Dynasty | 2 |
| Entari | 3 |
| Impyrium | 3 |
| Mekan | 6 (Special) |
| Syndicate | 4 |
| Outworlds | 0 |
| OTHERS | 0 to \+3 |

| T L | Modifier |
| :---- | :---- |
| 0 | \-4 |
| 1 | \-2 |
| 2 |  0 |
| 3 | \+2 |
| 4 | \+4 |
| 5 | \+8 |

**SKILL RANKS**  
Bonus of \+1 per each stage of the primary **Vocation** skill which is being practiced to earn money.  
An additional Skill of level 6+ may be accounted to aid in Trade per each of the Primary Skill’s Ranking stage, with a bonus of \+1 Wealth per associated skill

| Skill Ranking | Bonus |
| :---- | :---- |
| Novice (1-5) | \+1 |
| Trained (6-10) | \+2 |
| Expert (11-15) | \+3 |
| Master (16-19) | \+4 |
| Pinnacle (20) | \+5 |

**Performance Skills** when professionally done will have double listed bonuses

**Medicine Skill** used as a Practicing Physician will be double the typical bonus (likely triple or more in some areas).

**Piloting, Combat Skills and others** may also be used like Vocation skills if regular employment using them is available \- paying typical to double depending on trade

**Discipline Skills** is generally high commodity paying double listed bonuses

*Adjustments to Wealth Bonus should be made for any skills the character may be paid for that requires training.* 

*Menial or untrained workers will receive the base pay of their societies' Middle Class for practicing a trade, with less pay to the lower castes and impoverished classes of society.*

**Expanded Financial Status Hierarchy:**

| WEALTH STATUS | AUTO-BUY LIMIT | LIFESTYLE DESCRIPTION |
| ----- | ----- | ----- |
| **0 (Indebted)** | 0 Cr | Debt slavery or prison. |
| **1 \- 4 (Impoverished)** | 10 \- 30 Cr | Homeless/Squatter. Scavenges for food. |
| **5 \- 9 (Struggling)** | 40 \- 150 Cr | Shared room in slum. Processed rations. |
| **10 \- 14 (Middle Class)** | 160 \- 600 Cr | Private apt, steady wage. Consumer vehicle. |
| **15 \- 19 (Affluent)** | 640 \- 2,500 Cr | High-end condo. Quality personal vehicle. |
| **20 \- 29 (Wealthy)** | 2,500 \- 40,000 Cr | Large estate, servants. Minor corporate investor. |
| **30 \- 39 (Hegemon)** | 41K \- 650K Cr | Skyscraper penthouse. Owns small corporation. |
| **40 \- 49 (Industrialist)** | 650K \- 10M Cr | Megacorp exec. Owns starships (Corvettes). |
| **50 \- 59 (Dynastic)** | 10M \- 167M Cr | Minor nobility. Owns space stations. |
| **60 \- 69 (System Lord)** | 167M \- 2.6B Cr | Rules a solar system. Owns capital ships. |
| **70 \- 79 (Sector Ruler)** | 2.6B \- 42B Cr | Rules a cluster. Personal flagship is a Dreadnought. |
| **80+ (Faction Ruler)** | 42B+ Cr | Emperor. Economy is post-scarcity. |

### 

# **ARCHITECTURE**

# **ARCHITECTURE**

## 

## **RESIDENTIAL AND HABITATION ARCHITECTURES**

Residential architecture is the foundational texture of any civilization. It reflects the tension between population density and individual comfort.

### 

### **NATIVE LONGHOUSE / COMMUNAL SHELTER**

* **Footprint:** Medium (80x80 ft)  
* **Height:** Single Story (High Vaulted Ceiling)  
* **Tech Level:** 0 (Primitive)  
* **Style:** Native / Survivalist

**STATISTICS:**

* **Structure Points:** 400 SP (800 Base x 1 Height x 0.5 Material)  
* **Damage Resist:** 2 (Flammable)  
* **Total Modules:** 25  
* **Wealth Cost:** 18  
* **Cost:** 1,470 Cr

GENERIC DESCRIPTION:  
A large, elongated single-story structure constructed from heavy timber ribs and tightly woven thatch or treated animal hides. It serves as the central hub for a clan or extended family unit, prioritizing heat retention and communal living over privacy. The interior is dominated by a central hearth, with smoke venting through gaps in the high roof.  
**MODULE CONFIGURATION (25 Modules):**

* **Communal Living (10):** Open sleeping areas with furs/mats for 40 people.  
* **Central Hearth (5):** Cooking fire and heating (Primitive Power/Life Support).  
* **Storage (5):** Dried food stores, tools, hides.  
* **Shrine (2):** Dedicated space for ancestral worship or totem (+1 Morale).  
* **Elder's Quarters (3):** Partitioned area for leadership.

### 

### **COLONIAL PREFAB MODULE**

* **Footprint:** Small (40x40 ft)  
* **Height:** Single Story  
* **Tech Level:** 3 (Interstellar)  
* **Style:** Frontier / Modular

**STATISTICS:**

* **Structure Points:** 500 SP (250 Base x 1 Height x 2.0 Material)  
* **Damage Resist:** 12 (Plasteel / Composite)  
* **Total Modules:** 10  
* **Wealth Cost:** 20  
* **Cost:** 2,560 Cr

GENERIC DESCRIPTION:  
The ubiquitous "Lego brick" of galactic expansion. This structure is a standardized, mass-produced habitat module designed for rapid deployment. The geometry is usually a hexagonal or rectangular prism with chamfered edges to deflect wind. Walls are made of multi-layered insulating composites.  
**MODULE CONFIGURATION (10 Modules):**

* **Life Support (2):** Air recycling and thermal regulation.  
* **Bunks (2):** Fold-out sleeping for 4-6 colonists.  
* **Galley/Mess (2):** Nutrient paste dispensers and water reclamation.  
* **Comms Array (1):** Planetary uplink.  
* **Airlock (1):** Decontamination and pressure seal.  
* **Storage (2):** Survival gear and EVA suits.

### 

### **ARCOLOGY HAB-BLOCK / MEGASTRUCTURE**

* **Footprint:** Gargantuan (District sized base)  
* **Height:** Skyscraper (40+ Floors)  
* **Tech Level:** 4 (Stellar)  
* **Style:** Urban / Megastructure

**STATISTICS:**

* **Structure Points:** 7,500,000 SP (50,000 Base x 50 SP Mult x 3.0 Material)  
* **Damage Resist:** 18 (Nanocarbon)  
* **Total Modules:** 250,000+ (2,500 Base x 100 Module Mult)  
* **Wealth Cost:** 80+  
* **Cost:** 42,949,672,960 Cr

GENERIC DESCRIPTION:  
A self-contained city-in-a-building, designed to house millions. The architecture utilizes the "Modular Hive" geometry, where residential units are slotted into a massive structural lattice. The structure is so large it requires internal weather control and mass transit systems.  
**MODULE CONFIGURATION (Sample District):**

* **Residential Grid:** 10,000 "Coffin" units and 5,000 Family units.  
* **Hydroponics:** Industrial algae vats for oxygen and food.  
* **Law Enforcement:** Precinct houses and drone hives.  
* **Transit:** Mag-lev spine and grav-lift shafts.  
* **Commercial:** Internal malls and bazaars.

## 

## 

## **COMMERCIAL AND TRADE INFRASTRUCTURE**

### 

### **TRANSIT HUB / SPACEPORT TERMINAL**

* **Footprint:** Huge (500x500 ft)  
* **Height:** Multi-Story (Terminal building)  
* **Tech Level:** 3 (Standard Galactic)  
* **Style:** Commercial / Transit

**STATISTICS:**

* **Structure Points:** 60,000 SP (10,000 Base x 3 SP Mult x 2.0 Material)  
* **Damage Resist:** 12  
* **Total Modules:** 2,000 (500 Base x 4 Module Mult)  
* **Wealth Cost:** 50  
* **Cost:** 10,485,760 Cr

GENERIC DESCRIPTION:  
A sprawling transit hub defined by the "Atrium Tower" geometry. It features a central vaulted hall where travelers congregate, surrounded by check-in counters, customs gates, and cargo processing zones.  
**MODULE CONFIGURATION (2,000 Modules):**

* **Hangar Bays (1,000):** Landing pads and pressurized hangars for small to medium freighters.  
* **Cargo Warehousing (500):** Automated storage and retrieval systems.  
* **Commercial Concourse (300):** Duty-free shops, bars, and hotels.  
* **Admin/Control (100):** Air traffic control, customs, and security.  
* **Fueling Systems (100):** Unrefined fuel pumps and storage tanks.

### 

### **BLACK MARKET / BAZAAR**

* **Footprint:** Medium (80x80 ft \- spread out)  
* **Height:** Single Story  
* **Tech Level:** 2 (Scavenged)  
* **Style:** Outlaw / Scavenger

**STATISTICS:**

* **Structure Points:** 1,200 SP (800 Base x 1 SP Mult x 1.5 Material)  
* **Damage Resist:** 8 (Patchwork Metal)  
* **Total Modules:** 25  
* **Wealth Cost:** 25 (High value due to illegal goods)  
* **Cost:** 10,240 Cr

GENERIC DESCRIPTION:  
A chaotic "Bazaar Labyrinth" of narrow passages covered by a patchwork of irregular, overlapping awnings and domes. Stalls are built from repurposed shipping containers and crashed ship fuselages.  
**MODULE CONFIGURATION (25 Modules):**

* **Stalls (15):** Individual vendors selling illicit tech, drugs, or information.  
* **Hidden Storage (4):** Smuggling compartments under the floor.  
* **Gambling Den (2):** A backroom for cards or dice.  
* **Safe Room (4):** Heavily armored panic room for the market boss.

## 

## 

## **INDUSTRIAL AND EXTRACTION FACILITIES**

### 

### **ORBITAL ALLOY FOUNDRY**

* **Footprint:** Large (200x200 ft \- Zero-G)  
* **Height:** Duplex (High Bay)  
* **Tech Level:** 4 (Nanofabrication)  
* **Style:** Heavy Industry

**STATISTICS:**

* **Structure Points:** 11,250 SP (2,500 Base x 1.5 SP Mult x 3.0 Material)  
* **Damage Resist:** 18 (Heat Shielding)  
* **Total Modules:** 200 (100 Base x 2 Module Mult)  
* **Wealth Cost:** 60  
* **Cost:** 167,772,160 Cr

GENERIC DESCRIPTION:  
A zero-gravity industrial complex orbiting a star or resource-rich planet. It features the "Smelter Array" geometry—rows of blast furnaces and magnetic crucibles linked by vacuum-sealed conveyor tubes.  
**MODULE CONFIGURATION (200 Modules):**

* **Smelting Floor (100):** Magnetic containment crucibles for molten metal.  
* **Fabrication (50):** Nano-lathes and rolling mills for hull plating.  
* **Docking (20):** Heavy cargo airlocks for ore haulers.  
* **Power (20):** Solar collection arrays or fusion reactors.  
* **Cooling (10):** Liquid nitrogen/helium heat exchanges.

### 

### **DEEP CORE MINE / DRILL SITE**

* **Footprint:** Large (200x200 ft)  
* **Height:** Subterranean (Counts as Single Story for mechanics)  
* **Tech Level:** 3 (Laser/Plasma Drills)  
* **Style:** Extraction

**STATISTICS:**

* **Structure Points:** 5,000 SP (2,500 Base x 1 Height x 2.0 Material)  
* **Damage Resist:** 12  
* **Total Modules:** 100  
* **Wealth Cost:** 35  
* **Cost:** 163,840 Cr

GENERIC DESCRIPTION:  
An "inverted" architecture consisting of a spiraling ramp cut into the earth. The center is dominated by a massive laser or plasma drill that vaporizes rock, venting molten slag to the surface.  
**MODULE CONFIGURATION (100 Modules):**

* **Drilling Rig (40):** The primary laser/plasma cutter.  
* **Processing (30):** Mineral separation and washing.  
* **Elevator/Lift (10):** High-speed transit for materials.  
* **Power (20):** Dedicated generators for the drill.

## 

## 

## **MILITARY AND DEFENSIVE FORTIFICATIONS**

### 

### **FORWARD OPERATING BASE**

* **Footprint:** Large (200x200 ft)  
* **Height:** Single Story (Bunker style)  
* **Tech Level:** 3 (Reinforced Ceramics/Plasteel)  
* **Style:** Militaristic / Colony

**STATISTICS:**

* **Structure Points:** 6,000 SP (2,500 Base x 1 Height x 2.0 Material \+ 20% Bulwark Bonus)  
* **Damage Resist:** 17 (12 Base \+ 5 Hardened Armor)  
* **Total Modules:** 90 (100 Base \- 10 sacrificed for Hardened Armor)  
* **Wealth Cost:** 32  
* **Cost:** 71,316 Cr

GENERIC DESCRIPTION:  
A heavily fortified military outpost designed to hold ground. It features high walls of prefabricated ferro-concrete slabs topped with razor wire and automated turret nests. The geometry is the "Chevron Barracks" or "Star-Fort" to maximize enfilade fire angles.  
**MODULE CONFIGURATION (90 Modules):**

* **Command (10):** CIC, Comms Relay.  
* **Garrison (30):** Barracks for 100 soldiers, Mess Hall, Armory.  
* **Support (20):** Med Bay, Garage for Tanks.  
* **Defenses (30):** Shield Generator, Heavy Turret Hardpoints, Perimeter Sensors.

### 

### **PLANETARY SHIELD GENERATOR**

* **Footprint:** Medium (80x80 ft)  
* **Height:** Mid-Rise (Emitter Spire)  
* **Tech Level:** 4 (Force Fields)  
* **Style:** Defensive

**STATISTICS:**

* **Structure Points:** 19,200 SP (800 Base x 8 SP Mult x 3.0 Material)  
* **Damage Resist:** 50 (Active Shielding)  
* **Total Modules:** 250 (25 Base x 10 Module Mult)  
* **Wealth Cost:** 55  
* **Cost:** 41,943,040 Cr

GENERIC DESCRIPTION:  
A "Geodesic Shield Generator" geometry—a perfect sphere composed of hundreds of triangular facets, resting on a tripod of heavy pylons. It projects a hemispherical energy barrier capable of withstanding orbital bombardment.  
**MODULE CONFIGURATION (250 Modules):**

* **Emitter Array (150):** Projectors for the force field.  
* **Power Core (80):** Dedicated antimatter or singularity reactor.  
* **Cooling (20):** Massive heat exchangers to prevent meltdown.

## 

## 

## **SCIENTIFIC AND MEDICAL FACILITIES**

### 

### **ORBITAL RESEARCH STATION**

* **Footprint:** Small (40x40 ft)  
* **Height:** Multi-Story (5 Floors)  
* **Tech Level:** 4 (Smart-Glass/Composites)  
* **Style:** Scientific / High-Tech

**STATISTICS:**

* **Structure Points:** 2,250 SP (250 Base x 3 SP Mult x 3.0 Material)  
* **Damage Resist:** 18  
* **Total Modules:** 40 (10 Base x 4 Module Mult)  
* **Wealth Cost:** 28  
* **Cost:** 23,525 Cr

GENERIC DESCRIPTION:  
A central vertical core from which several horizontal laboratory modules extend outward into the void like branches. This layout isolates volatile experiments from the main structure.  
**MODULE CONFIGURATION (40 Modules):**

* **Labs (20):** Biology, Physics, and Engineering suites.  
* **Containment (10):** Sealed rooms with negative pressure and force fields.  
* **Server Core (5):** Data processing and AI hosting.  
* **Living (5):** Quarters for resident scientists.

### 

### **CYBER-CLINIC / STREET DOC**

* **Footprint:** Tiny (20x20 ft)  
* **Height:** Single Story  
* **Tech Level:** 3 (Medical Tech)  
* **Style:** Medical / Underground

**STATISTICS:**

* **Structure Points:** 200 SP (100 Base x 1 Height x 2.0 Material)  
* **Damage Resist:** 12  
* **Total Modules:** 4  
* **Wealth Cost:** 12  
* **Cost:** 279 Cr

GENERIC DESCRIPTION:  
A small, specialized medical facility. In lower sectors (Entropism style), it is a "Ripperdoc" clinic—a rusted dentist's chair surrounded by oily surgical tools and flickering fluorescent lights.  
**FACTION STYLES:**

* **Syndicate ("The Upgrade Node"):** A clean, white room with an automated surgical arm.  
* **Coalition ("The Chop Shop"):** Located in a shipping container. The surgeon uses a heavy industrial laser.

## 

## 

## **INFRASTRUCTURE AND UTILITY**

### 

### **FUSION POWER PLANT**

* **Footprint:** Large (200x200 ft)  
* **Height:** Multi-Story (Cooling Towers)  
* **Tech Level:** 3 (Fusion)  
* **Style:** Utility

**STATISTICS:**

* **Structure Points:** 15,000 SP (2,500 Base x 3 SP Mult x 2.0 Material)  
* **Damage Resist:** 12 (Radiation Shielding)  
* **Total Modules:** 400 (100 Base x 4 Module Mult)  
* **Wealth Cost:** 45  
* **Cost:** 2,621,440 Cr

GENERIC DESCRIPTION:  
A massive toroidal reactor core surrounded by magnetic containment rings. The "Cooling Hypertowers" (gargantuan hyperboloid structures) dominate the skyline, venting non-toxic steam.  
**MODULE CONFIGURATION (400 Modules):**

* **Reactor Core (200):** The magnetic confinement chamber.  
* **Turbines (100):** Converting heat to electricity.  
* **Control Room (50):** Heavily shielded monitoring station.  
* **Cooling (50):** Liquid sodium or water pumps.

## 

## 

## **EXOTIC AND MEGASTRUCTURES**

### 

### **ORBITAL HABITAT**

* **Footprint:** Colossal (Miles long)  
* **Height:** N/A (Rotating Cylinder)  
* **Tech Level:** 4-5 (Megastructure Engineering)  
* **Style:** Macro-Structuralism

**STATISTICS:**

* **Structure Points:** 1,000,000+  
* **Wealth Cost:** 80+

GENERIC DESCRIPTION:  
A massive cylindrical space settlement that rotates to create artificial gravity. The interior features a "Horizon-less" perspective, where the ground curves upward into the sky.

### 

### **CRYSTAL SANCTUM / FLOATING SPIRE**

* **Footprint:** Small (40x40 ft base)  
* **Height:** Skyscraper (50 Floors)  
* **Tech Level:** 5 (Psycho-Reactive Crystal)  
* **Style:** Alterian (Resonance)

**STATISTICS:**

* **Structure Points:** 62,500 SP (250 Base x 50 SP Mult x 5.0 Material)  
* **Damage Resist:** 25 (Adaptive)  
* **Total Modules:** 1,000 (10 Base x 100 Module Mult)  
* **Wealth Cost:** 60  
* **Cost:** 167,772,160 Cr

GENERIC DESCRIPTION:  
A towering spire of translucent, psycho-reactive crystal floating above the ground. The architecture defies gravity, with detached rings and floating buttresses held in place by psionic fields.  
**MODULE CONFIGURATION (1,000 Modules):**

* **Focus Chamber (100):** Massive amplification crystal (+4 to Meta Skills).  
* **Archives (400):** Crystalline data storage of eons of history.  
* **Training Halls (200):** Dojos for mental and physical perfection.  
* **Levitation Core (100):** Keeps the structure afloat.  
* **Defenses (100):** Psionic Projection Arrays (Mental/Illusion Discipline Attacks).

## 

## 

## **Conclusion**

By separating the "Skeleton" (Geometric Form and Stats) from the "Skin" (Faction Aesthetics), the Tangent system allows for an infinite variety of locations. A simple "Medium Building" becomes a Tribal Longhouse in a primitive setting, a Scrap-Hall in a scavenger setting, or a Crystal Sanctum in a high-fantasy setting. This framework ensures that every building in the game world is mechanically sound, narratively consistent, and visually distinct.

## 

## **ADDENDUM \- CRITICAL RULES & TERMINOLOGY**

### 

### **TERMINOLOGY: MODULES (ROOM UNITS)**

In architectural contexts, the term **"Slots"** has been replaced with **"Modules"**. A Module represents a standardized unit of space or functionality within a structure.

### 

### **SPECIALIZED MODULE CATALOG**

The following modules are standardized specialized units available for installation in compatible structures.

| Module Type | Cost (Cr) | Function |
| :---- | :---- | :---- |
| **Med-Bay** | 5,000 | Counts as "Sterile Environment". Grants \+2 to Medical checks. |
| **Armory** | 2,000 | Secure storage. Holds 50 Slots of gear. Security Grade 3 locks. |
| **Holo-Deck** | 10,000 | Simulates environments. XP gain from training here is \+10%. |
| **Workshop** | 3,000 | Contains Engineering Tools. Reduces Crafting Time by 25%. |
| **Brig** | 1,500 | Holding cell. Forcefield walls (Structure 30). |

# **ARMOR**

# **ARMOR**

## 

## **Civilian and Concealable Wear (Light Grade)**

*Maps to **Clothing** and **Reinforced Clothing**. minimal bulk, designed for social integration.*

### 

### **Synth-Leather "Jack"**

Description: A textured bodysuit or jacket made from chemically treated synthetic leather. Common among spacers and urban youth.  
Stat Block:

* **ARMOR TYPE:** Clothing, Reinforced  
* **TL/ML:** TL 2 / ML 0  
* **DR:** 5  
* **SP:** 10  
* **Penalties:** None  
* **Locations Covered:** Torso, Arms  
* **Special Functions / Modifiers:** **Civilian Grade** (Legal in all jurisdictions).  
* **Wealth / Craft DC:** Wealth 1 / DC 10  
* **Slots:** 2

### 

### **Ballistic Mesh**

Description: Standard street-wear lined with a flexible network of plastic or metal alloys. Looks like rough civilian clothing but stops small arms.  
Stat Block:

* **ARMOR TYPE:** Clothing, Reinforced  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 5  
* **SP:** 10  
* **Penalties:** None  
* **Locations Covered:** Torso, Legs  
* **Special Functions / Modifiers:** **Concealable** (Detectable only with physical inspection).  
* **Wealth / Craft DC:** Wealth 2 / DC 10  
* **Slots:** 2

### 

### **Nanofiber "Cloth" Suit**

Description: Tailored from advanced ballistic cloth (TL 4). Absorbs kinetic energy and spreads impact. Indistinguishable from high-end business wear.  
Stat Block:

* **ARMOR TYPE:** Clothing, Reinforced  
* **TL/ML:** TL 4 / ML 0  
* **DR:** 5  
* **SP:** 10  
* **Penalties:** None  
* **Locations Covered:** Torso, Arms, Legs  
* **Special Functions / Modifiers:** **High Fashion** (+1 to Etiquette/Style checks); **Concealable**.  
* **Wealth / Craft DC:** Wealth 4 / DC 10  
* **Slots:** 2

---

## **Tactical & Enforcement (Medium Grade)**

*Maps to **Armored Vests**, **Jackets**, and **Coats**. Offers significant protection for specific locations.*

### 

### **Security Vest (Standard)**

Description: A semi-rigid vest made of ceramic plates over a kevlar weave. Standard issue for police and private security.  
Stat Block:

* **ARMOR TYPE:** Armored Vest  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 10  
* **SP:** 20  
* **Penalties:** None  
* **Locations Covered:** Torso  
* **Special Functions / Modifiers:** **Hardened** (Immune to Critical Hits from small arms).  
* **Wealth / Craft DC:** Wealth 3 / DC 10  
* **Slots:** 2

### 

### **Scout Suit / Infiltration Coat**

Description: A matte-black armored long coat or bodysuit using sound-dampening polymers. Covers vital areas while allowing free movement.  
Stat Block:

* **ARMOR TYPE:** Armored Long Coat  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 10  
* **SP:** 20  
* **Penalties:** None  
* **Locations Covered:** Torso, Arms, Legs  
* **Special Functions / Modifiers:** **Stealthy** (+2 to Stealth checks).  
* **Wealth / Craft DC:** Wealth 4 / DC 12  
* **Slots:** 4

### 

### **Heavy Tactical Helmet**

Description: Full-face protection with integrated comms and sensors.  
Stat Block:

* **ARMOR TYPE:** Helmet, Heavy  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 15  
* **SP:** 15  
* **Penalties:** \-2 Sight/Hearing (unless compensated by sensors)  
* **Locations Covered:** Head  
* **Special Functions / Modifiers:** **Sensor Suite** (Can house HUD/Comms).  
* **Wealth / Craft DC:** Wealth 2 / DC 12  
* **Slots:** 1

---

## **Military Hard Suits (Heavy Grade)**

*Maps to **Full Body Armor**. Complete environmental seal and combat protection.*

### 

### **Infantry Plate (Trooper Armor)**

Description: Rigid composite plating covering the entire body, mounted on a sealed bodysuit. The standard for most military forces (Coalition, Dynasty).  
Stat Block:

* **ARMOR TYPE:** Full Body Armor  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 15  
* **SP:** 40  
* **Penalties:** None  
* **Locations Covered:** All (Head, Torso, Arms, Legs)  
* **Special Functions / Modifiers:** **Environmental Seal** (6 hours air).  
* **Wealth / Craft DC:** Wealth 4 / DC 18  
* **Slots:** 6

### 

### **Survival "Hard-Suit"**

Description: Ruggedized plating over a pressurized under-suit, designed for hostile environments (vacuum, toxic atmosphere).  
Stat Block:

* **ARMOR TYPE:** Full Body Armor  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 15  
* **SP:** 40  
* **Penalties:** None  
* **Locations Covered:** All  
* **Special Functions / Modifiers:** **Full Environmental** (Immune to gas/vacuum, 24hr Life Support).  
* **Wealth / Craft DC:** Wealth 3 / DC 18  
* **Slots:** 6

### 

### **Composite Combat Shell (Entari/Syndicate)**

Description: Advanced molded ceramics that offer superior deflection. Sleek, sealed, and expensive.  
Stat Block:

* **ARMOR TYPE:** Full Body Armor, Heavy  
* **TL/ML:** TL 4 / ML 0  
* **DR:** 20  
* **SP:** 50  
* **Penalties:** \-1 Mobility, \-5 Movement  
* **Locations Covered:** All  
* **Special Functions / Modifiers:** **Refractive Coating** (+2 Defense vs Lasers/Beams).  
* **Wealth / Craft DC:** Wealth 5 / DC 22  
* **Slots:** 8

---

## **Assault & Siege Gear (Superheavy Grade)**

*Maps to **Battle Suits**. Maximum protection for heavy weapons specialists.*

### 

### **Heavy Assault Plate (Juggernaut)**

Description: Thick slabs of ablative armor and plasteel. Turns the wearer into a walking tank.  
Stat Block:

* **ARMOR TYPE:** Battle Suit (S. Heavy)  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 30  
* **SP:** 80  
* **Penalties:** \-2 Mobility, \-10 Movement  
* **Locations Covered:** All  
* **Special Functions / Modifiers:** **Anchor** (Advantage on checks to resist being knocked down).  
* **Wealth / Craft DC:** Wealth 5 / DC 25  
* **Slots:** 10

### 

### **EOD / Hazard Shell**

Description: Extremely bulky armor designed for bomb disposal or plasma leaks.  
Stat Block:

* **ARMOR TYPE:** Battle Suit (S. Heavy)  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 30  
* **SP:** 80  
* **Penalties:** \-2 Mobility, \-10 Movement  
* **Locations Covered:** All  
* **Special Functions / Modifiers:** **Blast Shielding** (Explosive/Area damage reduced by 50%).  
* **Wealth / Craft DC:** Wealth 5 / DC 25  
* **Slots:** 10

---

## **Powered Armor & Exoskeletons (Powered Grade)**

*Maps to **Exoskeleton Battlesuits**. Motorized frames that provide massive durability.*

### 

### **Utility Exoskeleton (Loader)**

Description: An open-frame hydraulic skeleton used for cargo loading. Offers no environmental protection but massive durability.  
Stat Block:

* **ARMOR TYPE:** Exoskeleton Battlesuit  
* **TL/ML:** TL 3 / ML 0  
* **DR:** 40  
* **SP:** 120  
* **Penalties:** Varies (Powered)\*  
* **Locations Covered:** All (Frame covers body)  
* **Special Functions / Modifiers:** **Hydraulic Strength** (Set Strength to 18/+4, Lifting Capacity x2).  
* **Wealth / Craft DC:** Wealth 4 / DC 30  
* **Slots:** 15

### 

### **Battle Suit (Standard PA)**

Description: A sealed, armored suit with myomer-muscle underlay. The apex of personal protection.  
Stat Block:

* **ARMOR TYPE:** Exoskeleton Battlesuit  
* **TL/ML:** TL 4 / ML 0  
* **DR:** 40  
* **SP:** 120  
* **Penalties:** Varies (Powered)\*  
* **Locations Covered:** All  
* **Special Functions / Modifiers:** **Augmented Strength** (+4 Str). **Full Life Support**. **HUD Link**.  
* **Wealth / Craft DC:** Wealth 6 / DC 30  
* **Slots:** 15

Here is the expansion for **Section 02.01**, adding **Subsection G: Exotic & Variant Protection**.  
This section covers the specialized technologies found in specific factions (Auluran Biotech, Mekan Polymatter, Alterian Magi-Tech, etc.). These items often trade raw durability for unique, active abilities or regeneration.

---

## **Exotic & Variant Protection (Advanced)**

*Equipment utilizing alternative sciences such as Biology, Psionics, Magic, or Advanced Physics. These items often require specific proficiencies or biological interfaces.*

## 

Bio-Technology (Organic)  
*Grown rather than built. Common among Aulurans and deep-space survivalists. These suits are living organisms that bond with the host.*

### 

### **Symbiotic "Second Skin"**

Description: A semi-translucent, living membrane that bonds to the wearer's epidermis. It regulates temperature, filters toxins, and seals wounds instantly.  
Stat Block:

* **ARMOR TYPE:** Light Armor (Biotech)  
* **TL/ML:** TL 4 / ML 0  
* **DR:** 8 (Adaptive Flesh)  
* **SP:** 25 (Living Tissue)  
* **Penalties:** None  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Regeneration** (Restores 1 SP per minute); **Diagnosis** (+2 to Fortitude saves vs Disease/Poison).  
* **Wealth / Craft DC:** Wealth 5 / DC 20 (Medicine/Biotech)  
* **Slots:** 2 (Grown Nodes)

### 

### **Chitinous Carapace (Warrior Strain)**

Description: Heavy, interlocking plates of bio-ceramic bone and insectoid chitin grown over a muscular underlay. It looks monstrous but offers superior environmental adaptation.  
Stat Block:

* **ARMOR TYPE:** Full Body Armor (Biotech)  
* **TL/ML:** TL 4 / ML 0  
* **DR:** 20 (Hardened Bone)  
* **SP:** 60 (Dense Chitin)  
* **Penalties:** \-1 Mobility  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Sealed** (Water/Vacuum breathing for 4 hours); **Camouflage** (Changes color to match environment, \+2 Stealth).  
* **Wealth / Craft DC:** Wealth 6 / DC 25 (Biotech)  
* **Slots:** 6 (Bio-Sacks/Weapon Mounts)

---

## **Magi-Tech (Arcane)**

*Manufactured by the Alterian Enclave or ancient progenitors. These items fuse circuitry with ley-lines and runes.*

### 

### **Warded Weave Robes**

Description: High-quality ballistic cloth embroidered with threads of conductive gold and Aetherium. The runes flare with light when struck, dispersing energy.  
Stat Block:

* **ARMOR TYPE:** Reinforced Clothing (Arcane)  
* **TL/ML:** TL 3 / ML 3  
* **DR:** 5 (Physical) / 10 (Energy/Magic)  
* **SP:** 15 (Enchanted Fabric)  
* **Penalties:** None  
* **Locations Covered:** Torso, Arms, Legs  
* **Special Functions / Modifiers:** **Spell Resistance** (+2 Defense vs Metaphysic Attacks); **Focus** (Counts as a Masterwork Tool for Spellcasting).  
* **Wealth / Craft DC:** Wealth 5 / DC 22 (Arcana/Tailoring)  
* **Slots:** 3 (Talisman Pockets)

### 

### **Runeguard Plate**

Description: Ancient ceramic or stone-composite armor etched with glowing defensive sigils. It is heavy but resonates with the wearer's aura.  
Stat Block:

* **ARMOR TYPE:** Battle Suit (Heavy)  
* **TL/ML:** TL 3 / ML 4  
* **DR:** 25 (Runed Stone)  
* **SP:** 70 (Reinforced)  
* **Penalties:** \-2 Mobility, \-5 Movement  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Aegis** (Wearer can spend 1 Karma to double DR against a single attack).  
* **Wealth / Craft DC:** Wealth 8 / DC 30 (Metacraft)  
* **Slots:** 6 (Crystal Sockets)

---

## **Psi-Tech (Psionic)**

*Favored by the Ascendancy and Impyrium Inquisitors. These armors react to the wearer's mental state.*

### 

### **Crystalline Body-Glove**

Description: A tight, shimmering suit made of flexible psycho-reactive crystals. It is nearly weightless but turns rigid instantly upon impact.  
Stat Block:

* **ARMOR TYPE:** Light Armor (Psionic)  
* **TL/ML:** TL 4 / ML 2  
* **DR:** 10 (Reactive Crystal)  
* **SP:** 30 (Shatter-Resistant)  
* **Penalties:** None  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Mental Hardening** (+2 Willpower saves); **Psi-Link** (Can operate hands-free via thought).  
* **Wealth / Craft DC:** Wealth 7 / DC 25 (Psionics/Engineering)  
* **Slots:** 4 (Psi-Amp Mounts)

### 

### **Inquisitor's Mind-Plate**

Description: Heavy composite armor laced with psychic dampeners and sensory boosters. Designed to hunt rogue psychics and entities.  
Stat Block:

* **ARMOR TYPE:** Full Body Armor (Heavy)  
* **TL/ML:** TL 4 / ML 3  
* **DR:** 22 (Psycho-Conductive Alloy)  
* **SP:** 55 (Dense)  
* **Penalties:** \-1 Mobility  
* **Locations Covered:** Full Body (Closed Helm)  
* **Special Functions / Modifiers:** **Null-Field** (Wearer gains DR 10 vs Psionic Damage specifically); **Terror** (+2 Intimidate).  
* **Wealth / Craft DC:** Wealth 8 / DC 28  
* **Slots:** 6 (Integrated restraints/weapons)

---

## **Advanced Physics (Mekan/Tech 5\)**

*The cutting edge of science, utilizing programmable matter and hard light.*

### 

### **Polymatter "Liquid" Suit**

Description: A suit composed of millions of nanites suspended in a silver fluid. It flows over the wearer like water and can reshape itself on command.  
Stat Block:

* **ARMOR TYPE:** Variable (Light to Medium)  
* **TL/ML:** TL 5 / ML 0  
* **DR:** 15 (Fluid Impact Absorption)  
* **SP:** 40 (Self-Repairing Cloud)  
* **Penalties:** None  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Morph** (Can change appearance/color to mimic any clothing or uniform as a Standard Action); **Concealment** (+4 to Hide items inside the suit).  
* **Wealth / Craft DC:** Wealth 10 / DC 35 (Nanotech)  
* **Slots:** 4 (Universal Ports \- can reshape to fit any module)

### 

### **Holophotonic Emitter Harness**

Description: A lightweight harness that projects a suit of "Hard Light" armor only when combat begins. When inactive, the wearer appears unarmored.  
Stat Block:

* **ARMOR TYPE:** Light Armor (Projected)  
* **TL/ML:** TL 5 / ML 0  
* **DR:** 20 (Force Field)  
* **SP:** N/A (Uses Energy/Battery Life)  
* **Penalties:** 0 (Weightless)  
* **Locations Covered:** Full Body  
* **Special Functions / Modifiers:** **Instant Don/Doff** (Armor appears/vanishes instantly); **Glow** (Stealth impossible while active unless "Dark Light" upgrade is installed).  
* **Wealth / Craft DC:** Wealth 12 / DC 30 (Physics)  
* **Slots:** 2 (Emitter nodes)

# **AUGMENTATIONS**

# **AUGMENTATIONS**

In the Tangent universe, the definition of "self" is fluid. The body is an agnostic chassis—upgradable, interchangeable, and capable of profound evolution. This catalog unifies the mechanics of Cybernetics (Replacements), Bioware (Enhancements), and Nanoware into a single framework governed by Tech Levels (TL), Build Points (BP), and the Node System.

## 

## ---

## **1\. Introduction & Mechanics Overview**

The augmentation system provides a progression from basic prosthetics to god-like nanotech manipulation.

### 

### **1.1 The Economy of Self**

1. **Build Points (BP)**: Represents neurological and biological capacity. Standard mods cost 2 BP. Specialized traits or simple options cost 1 BP.  
2. **Nodes**: Represents the physical mass and room available in a limb or organ. If a body part's Node capacity is exceeded, the part malfunctions or suffers structural failure. Typically, Structure Points (SP) are matched 1-to-1 with Node Capacity.  
3. **Sockets**: Standardized hardpoints for modular gear and internal upgrades. Limb-based sockets are often pre-determined by the chassis. 1 Socket uses 10 Nodes worth of modifications.  
4. **Credits (Cr)**: The financial cost of hardware and surgery. Calculated via the formula: Value \= 10 \* 4^(DC/5).

### 

### **1.2 Tech Level (TL) Progression**

* **TL 1-2**: Primitive/Functional replacements. Often 0 BP (Prosthetic).  
* **TL 3 (Standard)**: Parity with biology. The galactic baseline.  
* **TL 4 (Enhanced)**: Bioware/Seamless. Mechanic: Immune to disablement from Massive Damage.  
* **TL 5 (Advanced)**: Nanotech/Metaphysical. Mechanic: Costs 1/2 BP (minimum 1).

## 

## ---

## **2\. Chassis Capacity (Node Limits)**

| BODY PART | NODES |
| ----- | :---: |
| **Head** | 10 |
| **Torso** | 50 |
| **Arms (Each)** | 30 |
| **Legs (Each)** | 40 |

## 

## ---

## **3\. The Civilian Standard (Fashionware & Utilities)**

**TL 3+ | 0 BP Cost | 0 Nodes**  
These modifications are so prevalent they are considered basic personal choices. They do not require the Augmented Feature.

| AUGMENT | EFFECT/DESCRIPTION | DC | COST (CR) |
| ----- | ----- | :---: | :---: |
| **ID Chip** | Subdermal identity, licenses, and banking. | 5 | 40 |
| **Skinwatch** | Subdermal LED timepiece and calendar. | 5 | 40 |
| **Shift-tacts** | Color-changing or patterned contact lenses. | 5 | 40 |
| **Light Tattoo** | Bioluminescent or animated decorative tattoos. | 5 | 40 |
| **Contraceptive Implant** | Regulates fertility with perfect reliability. | 5 | 40 |
| **Magnetic Piercings** | Subdermal anchors for modular jewelry. | 5 | 40 |
| **Cyber-Vox** | Basic voice synthesizer. Replicates digital tones. | 5 | 40 |
| **Comm Implant** | Internal radio/data link (continental range). | 10 | 160 |
| **Biomonitor** | Vitals readout. \+2 to Resist Torture/Drugs. | 10 | 160 |
| **ChemSkins** | Color and pattern changing skin tints. | 10 | 160 |
| **Tech-Hair** | Color/light emitting hair; styleable via app. | 10 | 160 |
| **Turn-On Nails** | Nails that change color, length, or pattern. | 10 | 160 |
| **Endocrine Tuner** | Regulates mood and minor hormonal imbalances. | 10 | 160 |
| **Subdermal Pocket** | 2x4 inch concealed pocket for data chips. | 10 | 160 |
| **Diagnostic Scanner** | Medical scanner embedded in finger or palm. | 10 | 160 |
| **Holo-Tattoos** | Subdermal projectors for floating 3D holograms. | 15 | 640 |
| **Nu-Tek TVSkin** | Skin acts as a programmable vidscreen. | 15 | 640 |
| **Nano Groomers** | Automated skin, hair, and hygiene maintenance. | 15 | 640 |

## 

## ---

## **4\. Prosthetic & Replacement Structures**

This category covers the replacement of limbs and organs with synthetic counterparts. These define the character's physical chassis.

### 

### **4.1 Synth Limbs & Structural Integrity (TL 3\)**

Structure Points (SP) are matched 1-to-1 with Node Capacity, except for vital housings which receive a Hardening Multiplier of x2.

| COMPONENT | SP | NODES | DC | COST (CR) |
| ----- | :---: | :---: | :---: | :---: |
| **Hand** | 5 | 5 | 16 | 844 |
| **Forearm\*** | 10 | 10 *(**15** total)* | 20 | 2,560 |
| **Full Arm Assembly** | 30 | *(**30** total)* | 25 | 10,240 |
|     ***Upper Arm\*\**** | *15* | *15* | *22* | *4,457* |
| **Foot** | 5 | 5 | 15 | 640 |
| **Lower Leg\*** | 15 | 15 *(**20** total)* | 18 | 1,470 |
| **Full Leg Assembly** | 40 | *(**40** total)* | 25 | 10,240 |
|     ***Upper Leg (Thigh)\*\**** | *20* | *20* | *22* | *4,457* |
| **Synth Organ** | Internal | 5 | 20 | 2,560 |
| **Prosthetic Cranium** | 20 (x2\*\*\*) | 10 | 25 | 10,240 |
| **Prosthetic Torso** | 100 (x2\*\*\*) | 50 | 30 | 40,960 |

*\*Forearm and Lower Leg include Socket capacity for the attached Hand/Foot segments.*  
*\*\*Installation of an Upper Arm or Upper Leg prosthetic is entailed in the full limb assembly (separate entry for Upper Arm/Leg is for reference).*  
*\*\*\*Adjustment in Structure Points due to reinforcement of critical areas. Prosthetic Cranium, Prosthetic Torso and replacement of ALL Limbs are required for Full Body Conversion (FBC).*

### 

### **4.2 External Mounting Hardpoints (External Sockets)**

Characters may attach external mounts for augmentations onto their frame without (or in addition to) limb replacement.

* **Cost**: 1 BP (Biological) and \+2 Wealth DC to the gear's base DC.  
* **Benefit**: Adds 1 Socket (or 10 Nodes) to the chosen location. Also certain devices may be detachable (+2 DC design cost).  
* **Limit**: A location cannot host more External Sockets than half its base Node capacity.

### 

### **4.3 Hand & Foot Options (1 BP Per Option)**

| OPTION | EFFECT | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Hammer Fist** | 1d8 Blunt Unarmed Damage. | 2 | 15 | 640 |
| **Blade Fist / Claws** | 1d8 Slashing; Retractable. | 1 | 15 | 640 |
| **Spike Fist / Needle** | 1d8 Piercing; can link to Poison Sac. | 1 | 15 | 640 |
| **Shock-Knuckles** | 1d6 Voltic \+ Stun chance. | 2 | 15 | 640 |
| **Tool Hand** | Multi-purpose or \+2 Vocation bonus. | 2 | 15 | 640 |
| **Weapon Hand** | Non-retractable weapon replacement. | 0 | 10 | 160 \+ Wpn |
| **Climbing Claws** | \+2 to Athletics (Climbing). | 1 | 15 | 640 |
| **Grappler Hand** | 50m monocable with multi-grapple. | 3 | 20 | 2,560 |
| **Cybersnake / Whip** | 10ft reach; 2d6 Slashing damage. | 4 | 20 | 2,560 |
| **Gripper Foot** | Reduce movement penalties by half. | 1 | 15 | 640 |
| **Prehensile Foot** | Usable as off-hand (-2 penalty). | 2 | 20 | 2,560 |
| **Skate Foot** | Integrated wheels; Run speed \+50%. | 3 | 15 | 640 |
| **Web Foot** | Swim Speed \+50%. | 2 | 15 | 640 |

### 

### **4.4 Limb Upgrades (1 BP Per Upgrade)**

| AUGMENT | EFFECT | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Armor Plating** | Tiered DR 10 / 20 / 40\. | 5 | 15 | \+15% Base |
| **Hydraulic Rams** | \+2/+4/+6 Strength for Grapple/Damage only. | 8 | 25 | 10,240 |
| **Forearm Shield** | Collapsible shield (Small/Large/Tower). | 3 | 15 | 640+ |
| **Forearm Weapon** | Retractable 1H weapon. | 2 | 15 | 640 \+ Wpn |
| **Magnetic Grip** | Electro-magnets; can walk on metal hulls. | 2 | 15 | 640 |
| **Quick-Change Mount** | Swap modular hands/tools as a Swift Action. | 1 | 15 | 640 |
| **Smuggling Compartment** | Hidden storage for Tiny items. | 1 | 15 | 640 |
| **Reinforced Frame** | \+25% Structure Points to limb. | 2 | 15 | \+25% Base |
| **Shielding** | Full EMP shielding for limb. | 1 | 15 | \+25% Base |
| **Sectional Joint** | Limb can detach (requires CPU). | 3 | 20 | 2,560 |
| **Telescoping Limb** | Grants \+5ft Reach. | 4 | 20 | 2,560 |
| **Micro-Missile Launcher** | Holds 4 mini-missiles (Arm/Shoulder). | 5 | 25 | 10,240 |
| **Skinlike / Synthskin** | Looks real (DC 25 Awareness to spot). | 0 | 25 | 10,240 |
| **Jump Boost (Legs)** | \+10 to Jump checks (Requires Pair). | 4 | 20 | 2,560 |
| **Speed Boost (Legs)** | \+10/+20/+30 Ground Move (Requires Pair). | 5 | 25 | 10,240+ |

### 

### **4.5 Exotic Limbs (TL 4\)**

| AUGMENT | MODIFIER | NODES |
| ----- | ----- | :---: |
| **Synth Tentacle** | As Synth Arm, \+100% Cost, \+10 DC. | 15 |
| **Digitigrade Leg** | As Synth Leg, \+25% Cost. | 15 |
| **Insectoid Limb** | As Synth Arm/Leg, \+50% Cost, \+5 DC. | 12 |
| **Synth Wing** | As Leg (Grants Flight), \+100% Cost, \+5 DC. | 20 |

## 

## ---

## **5\. Body Modifications (TL 3\)**

**Standard BP Cost: 2 BP | Torso/Internal Integration**

### 

### **5.1 Integrated Cybernetic Armor**

These protection layers represent integrated subdermal plating or dermal weaves that mirror the defensive capabilities of external protective equipment. ONE OPTION ONLY.

| TIER | COVERAGE  | NODES | SP | DR |
| ----- | ----- | :---: | :---: | :---: |
| **Light** | Flight suit, Leathers, Synths | 5 | 10 | 10 |
| **Medium** | Riot gear, Chain, Tactical Vest | 10 | 20 | 20 |
| **Heavy** | Plate, EOD Suit, Assault Shell | 20 | 40 | 40 |
| **Superheavy** | Dreadnought Plate, Heavy Shock | 25 | 80 | 80 |
| **Powered** | Hydraulic Frame, Mecha-Suit | 30+\* | 120 | 120 |

*\*30 from torso and 5 from other locations. Powered armor increases external socket capacity total by 3 (typically torso-back/shoulders).*

**5.2 Core Systems, Implants and Options**

| AUGMENT | EFFECT/DESCRIPTION | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Air Supply** | Internal compressed air; 60 mins of Oxygen. | 5 | 15 | 640 |
| **Anti-Shock** | Electricity Resistance 10, Augments impervious to EMP. | 4 | 20 | 2,560 |
| **Bionic Enhancement** | \+1/+2/+3 Stamina. | 10 | 25 | 10,240 / Bns |
| **Body Weapons** | Retractable Fangs or Claws (Organic or Synth). | 2 | 20 | 2,560 |
| **Hollow Fangs** | 1d4 Piercing. Wired directly to a Poison Sac. | 1 | 15 | 640 |
| **Breathing Filter** | Smoke/Gas filtration (Advantage vs airborne). | 2 | 15 | 640 |
| **Advanced Comm Unit** | Coded transceiver (Planetary range/Network). | 1 | 15 | 640 |
| **Dermal Armor** | See Integrated Cybernetic Armor (Section 5.1). | Var | 20 | 2,560 per Rnk |
| **Disguise System** | Feature Alteration Implant; As Alter Form. | 5 | 20 | 2,560 |
| **Enhanced Antibody** | \+100% Heal Rate, Infection Checks w/ Adv. | 5 | 20 | 2,560 |
| **Extra Shoulders** | Mount 2 extra cyber arms under main (Heavy). | 20 | 25 | 10,240 |
| **Fortified Skeleton** | DR 10, \+1 Strength, DR 20 vs falls. | 15 | 30 | 40,960 |
| **Frictionless Skin** | Excretes polymer. Advantage to escape grapple. | 3 | 20 | 2,560 |
| **Gills** | Breathe in water indefinitely (Restricted). | 5 | 20 | 2,560 |
| **Injector Unit** | 2 mini-injectors with 4 doses each. | 2 | 15 | 640 |
| **Internal Gyroscope** | Always know up/down. Adv on Balance. | 2 | 15 | 640 |
| **Muscle/Bone Weave** | Advanced myomer integration. \+1/+2/+3 Str. | 12 | 25 | 10,240 / Bns |
| **Nutrient Processor** | Extract nutrition from any organic. 1/4 rations. | 4 | 15 | 640 |
| **Poison Gland/Sac** | Holds 8 doses of toxin. | 3 | 20 | 2,560 |
| **Radiation Shielding** | Internal lead/polymer. Adv vs Radiation. | 5 | 20 | 2,560 |
| **Redundant Organs** | Advantage on Fortitude saves vs Critical Hits. | 10 | 25 | 10,240 |
| **Reinforced Chassis** | Heavy: Synth Limbs (all), Str 3, Sta 3, DR 40\. | 40 | 30 | 40,960 |
| **Skull Plating** | Head armor. 1 Critical Hit to Normal/day. | 4 | 15 | 640 |
| **Stabilizer** | Automatically Stabilize from dying. | 3 | 20 | 2,560 |
| **Tail** | Decorative or Prehensile (-4 Str, \-2 Dex). | 5 | 15/20 | 640 / 2,560 |
| **Trauma Response** | Auto-administers meds; Heals 1d6. | 4 | 20 | 2,560 |
| **Water Refiltration** | Triples survival time without water. | 3 | 15 | 640 |

## 

## ---

## **6\. Sensory Modifications (TL 3\)**

**Standard BP Cost: 2 BP**

| AUGMENT | EFFECT | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Nightvision** | Night Vision 60ft. | 2 | 15 | 640 |
| **Ocular Drone** | Cyber-eye detaches to act as remote spy cam. | 3 | 25 | 10,240 |
| **Targeting** | Sync to Smart Link. \+2 Ranged Attack. | 1 | 20 | 2,560 |
| **Thermograph** | See IR and heat patterns. | 2 | 20 | 2,560 |
| **Radar / Sonar** | Grants Blindsense 30ft. | 3 | 25 | 10,240 |
| **Sensory Recorder** | Records all 5 sensations (SimStim). | 2 | 25 | 10,240 |
| **Anti-Flare** | Counter Bright-Light Blindness. | 1 | 10 | 160 |
| **Flash-Comp** | Advanced strobe immunity. | 1 | 15 | 640 |
| **Image Enhance** | \+2 Sight Awareness checks. | 1 | 15 | 640 |
| **Micro-optics** | Microscopic Vision. | 1 | 15 | 640 |
| **Teleoptic** | Telescopic zoom. Range penalties 1/2. | 1 | 15 | 640 |
| **Tracking Scanner** | Retinal crosshairs. Move penalties 1/2. | 1 | 20 | 2,560 |
| **Amplified Hearing** | \+2 Hearing Awareness checks. | 1 | 15 | 640 |
| **Bug Detector** | Sweep 30ft for active transmissions. | 1 | 15 | 640 |
| **Frequency Scanner** | Wide-band radio and mesh scanner. | 1 | 15 | 640 |
| **Scrambler** | Military grade encryption. | 1 | 20 | 2,560 |
| **Sound Damper** | Immune to loud noise/deafening. | 1 | 10 | 160 |
| **Voice Disguiser** | Perfect mimicry; \+4 Bluff (Audio). | 1 | 15 | 640 |

## 

## ---

## **7\. Brain Modifications (TL 3\)**

**Standard BP Cost: 2 BP**

| AUGMENT | EFFECT | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Neural Processor** | Foundation for CPU mods; \+1 Logic. | 3 | 15 | 640 |
| **Ghost Jack** | Interface for digitized consciousness chips. | 2 | 25 | 10,240 |
| **Mech Link** | Mind-to-machine. \+1 to \+5 Pilot skills. | 2 | 20 | 2,560 |
| **Nerve Hardwire** | Overclocks the nervous system. \+1/+2/+3 Agility. | 5 | 25 | 10,240 / Bns |
| **Reflex Co-Proc** | Advantage on Reflex Saves vs hazards. | 3 | 20 | 2,560 |
| **Digital Encephalon** | Rolling backup of memory. | 2 | 20 | 2,560 |
| **Skill Circuitry** | \+2/+4/+6 to one skill (Reprogrammable). | 1 | 15 | 640 / Bns |
| **Behavioral Inhibitor** | Forcibly blocks specific programmed actions. | 1 | 15 | 640 |
| **Control Chips** | Circuits for emotional/mental control. | 1 | 20 | 2,560 |
| **Data Bank** | Secure storage for 1,000+ Yottabytes. | 1 | 15 | 640 |
| **Deadman's Switch** | Trigger signal/bomb upon heart stopping. | 1 | 15 | 640 |
| **Pain Filter** | Counters Sense of Pain / Negate Wound penalty. | 2 | 15 | 640 |
| **Sensory Shunt** | Selectively turn off specific physical senses. | 1 | 15 | 640 |
| **Translator Implant** | Contains most Languages/Dialects. | 1 | 10 | 160 |

## 

## ---

## **8\. TL4 Enhanced Augmentations**

**Immune to Massive Damage/EMP | Standard BP Cost: 2 BP**

| AUGMENT | EFFECT | NODES | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Body Conversion** | Non-Typical Anatomy \+ Synth chassis use. | 30 | 30 | 40,960 |
| **Chameleon Skin** | Active camo-weave. \+4 Stealth (Stationary). | 4 | 25 | 10,240 |
| **Dermal Weave** | \+10 DR, \+100% Base Heal Rate. | 10 | 25 | 10,240 |
| **Kinetic Shield** | Absorbs 40 dmg before recharge. | 10 | 30 | 40,960 |
| **Trans-Cerebral** | Brain transplant into other body/system. | 5 | 30 | 40,960 |
| **Adrenaline Shield** | 10 temp Vitality when hit (Free action). | 5 | 20 | 2,560 |
| **Alterable Bioform** | As Alter Form. | 5 | 25 | 10,240 |
| **Bodyform Nodes** | Grants Bodyform Feature: Multiple (Sta). | 10 | 25 | 10,240 |
| **Inertial Nullifier** | Treat falls as 50ft less. | 5 | 25 | 10,240 |
| **Myomer Weave** | Extreme strength without bulk. \+4 Might. | 15 | 25 | 10,240 |
| **Nerve Splicing** | Damaged nerves reroute; Immune to paralysis. | 5 | 25 | 10,240 |
| **Pheromone Emitters** | Advantage on Charm/Diplomacy checks. | 3 | 25 | 10,240 |
| **PicoSurgeons** | Grants Fast Heal Feature. | 8 | 25 | 10,240 |
| **NuGenic Nodes** | Longevity / DNA Cleanse / Bio-Renewal. | 10 | 30 | 40,960 |
| **Accelerator** | \+4 Initiative (stacks with Improved Init). | 2 | 25 | 10,240 |
| **Data Archive** | As Jack of all Trades Feature. | 2 | 25 | 10,240 |
| **Ego Overlay** | Grants specific Persona Skill Ranks and traits. | 2 | 25 | 10,240 |
| **Synaptic Accelerator** | Push past bio-limits. \+1 Action Point 1/day. | 3 | 25 | 10,240 |
| **XR Imager** | Terahertz radiation. See thru objects to 10ft. | 3 | 30 | 40,960 |
| **Anti-Stun Implant** | Immune to Stun conditions. | 1 | 25 | 10,240 |
| **Biotech Emulator** | Use Biotechnology as if Psychic. | 2 | 20 | 2,560 |
| **Body Computer** | Take 10 on Computer at Advantage / Half time. | 2 | 25 | 10,240 |
| **Empathic Attune** | \+1/+2/+3 Charisma. | 5 | 25 | 10,240 / Bns |
| **Feature Circuit** | Gain 1 feature (reprogrammable): Limited. | 1 | 20 | 2,560 |
| **Nootropic Enhancer** | \+1/+2/+3 Intelligence. | 5 | 25 | 10,240 / Bns |
| **Psychotropic Act** | \+1/+2/+3 Wisdom. | 5 | 25 | 10,240 / Bns |
| **Rage Implant** | Adrenal override. Grants the Rage feature. | 2 | 20 | 2,560 |
| **Smart Link** | Wireless Mech Link with \+2 Gear bonus. | 1 | 20 | 2,560 |
| **Cyber Jack** | Operate over Comm: Smart Link, Comm Implant. | 2 | 20 | 2,560 |
| **Surrogate Uplink** | Virtually Remote a Synthetic Body. | 2 | 25 | 10,240 |
| **Skill Plexus** | Socket for 4 Skill Circuits. | 3 | 25 | 2,560+ |
| **Synaptic Mask** | Checks vs Mental Effects at Advantage. | 2 | 25 | 10,240 |
| **Laser (Eye)** | 2d6 Energy damage with 20ft range. | 2 | 25 | 10,240 |
| **Optical Camo** | Advanced total spectrum cloaking. | 5 | 30 | 40,960 |

## 

## ---

## **9\. TL5 Advanced Augmentations**

**Apex Technology | Standard BP Cost: 1 BP (1/2 Cost)**

| AUGMENT | EFFECT | BP | DC | COST (CR) |
| ----- | ----- | :---: | :---: | :---: |
| **Matter Recon Forge** | Resurrects from single cell in 1d4 days. | 5 | 40 | 655,360 |
| **Phase Shift Gen** | Temporary intangibility to bypass matter. | 4 | 35 | 163,840 |
| **Aether-Node** | Access 1 Metafocus (No Awakened req). | 4 | 35 | 163,840 |
| **Digitized Consc** | Consciousness migrated to another form. | 8 | 35 | 163,840 |
| **Psi Implant** | Awakened (Mental); Grants 100 Essence. | 4 | 30 | 40,960 |
| **Temporal Stutter** | Extra turn (Time Stop) 1/day. | 6 | 35 | 163,840 |
| **Gravity Attenuator** | Changes ground plane, Climb \+20, Jump \+10. | 1 | 25 | 10,240 |
| **Quantum Storage** | Dimensional pocket; stores up to 100kg. | 1 | 30 | 40,960 |
| **Programmable Bio** | As Alter Form (Advanced). | 1 | 25 | 10,240 |
| **Distortion Field** | Blur (10 Min) or Invisibility (1 Min). | 1 | 30 | 40,960 |
| **Holophotonic Gear** | Implanted Holophotonic Emitter. | 1 | 20 | 2,560 |
| **Feat Plexus** | Socket for 4 Feature Circuits. | 4 | 25 | 10,240 |
| **Interface Sliver** | Dedicated Cyberjack for 1 Mecha. | 1 | 15 | 640 |
| **Polymatter Struct** | Morphic Implant or Replacement (limited). | 0 | 0 | \+25% Cost |
| **Polymatter Surg** | Grants Fast Heal and Regeneration Features. | 4 | 30 | 40,960 |

## 

## ---

## **10\. Full Body Conversion (FBC)**

FBC is the total migration of consciousness into a synthetic frame.

### 

### **10.1 FBC Profile (Standard Humanoid)**

| METRIC | OPTIMIZED VALUE |
| ----- | :---: |
| **Total Nodes** | **200 Nodes** (10 Head, 50 Torso, 60 Arms, 80 Legs) |
| **Total Structure** | **260 SP** (20 Head, 100 Torso, 60 Arms, 80 Legs) |

### 

### **10.2 FBC Package Tiers**

| PACKAGE TIER | BP COST (BIO) | COST (CR) | TOTAL SP | DR |
| ----- | :---: | :---: | :---: | :---: |
| **Civilian Shell** (Light) | 10 | 100,000 | 260 | 10 |
| **Industrial / Combat** (Heavy) | 10 | 250,000 | 260 | 40 |
| **Mekan Apex (TL 5\)** (Powered) | 5 | 1,000,000 | 260 | 120 |

## 

## ---

## **11\. Stigma Threshold**

* **Minor (1-3 Mods)**: \-2 to social checks with non-augmented.  
* **Moderate (4-6 Mods)**: \-4 to social checks; restricted from Naturalist zones.  
* **Severe (7+ or FBC)**: Treated as an object or "Severe Xeno."

## 

## ---

## **12\. Pseudo-Cybernetics (Wearable Augmentation)**

Non-permanent, external harnesses that provide mechanical advantages without surgery.   
*Though a consideration within the Equipment category \- due to the complexity and personal integration of using the pseudo-cybernetics it is within the Augmentation category for purchase and treated as an Augmentations in most respects. Including the use of Augmentation upgrades and modification options. For the purpose of game mechanics use the more favorable ruling, for the character, of equipment vs augmentation if questionable.*

### 

### **12.1 Mechanics of the Wearable**

* **Capacity**: Pseudo-cybernetics provide their own internal Node capacity for hosting mods. These are external frames; mods are installed into the item's chassis.  
* **Node Calculation**: Set to approximately **Half** the comparable anatomical location. A full body shell provides 100 nodes. **Note: Node capacities for Gauntlets and Sabatons are per item, not a total for the pair.**  
* **Standard Interface**: Wearables (0 BP) require an **Interface Port** (Internal or External) to sync with neural impulses. Without a port, the item suffers \-2 to all associated checks, checks at disadvantage or it is not usable at all, in addition to any security options.  
* **Limitations**: One wearable item per primary body location. External sockets cannot exceed 1 per 10 Nodes of base capacity.

| AUGMENT | LOCATION | NODES | DC | COST (CR) | DESCRIPTION |
| ----- | :---: | :---: | :---: | :---: | ----- |
| **Smart Goggles** | Head | 5 | 10 | 160 | Image Enhance, HUD, and Zoom. |
| **Exo-Harness** | Torso | 20 | 15 | 640 | Strength & Armor frame. \+1 Strength, DR 10\. |
| **Servo-Arm** | Torso (Back) | 10 | 20 | 2,560 | Manipulator for weapon/tool use. Often paired. |
| **Shoulder Mount** | Torso (Shoulder) | 10 | 15 | 640 | Independent ranged weapon mounting. Smart. |
| **Weapon Servo Rig** | Torso (Side) | 10 | 15 | 640 | Side/back harness for 2H heavy weapons. |
| **Battle Gauntlet** | Lower Arm | 10 (Each) | 5 | 40 | 1d6 Blunt. DR 10\. Single or pair. |
| **Sabatons** | Lower Legs | 10 (Each) | 10 | 160 | 2d6 Blunt. DR 10\. Movement mods must match. |
| **Cyber-Mecha Shell** | Full Body | 100\* | 40 | 655,360 | Wearable shell. Synth Strength. Provides DR 80\. |
| **Load-Lifter Rig** | Full Body | 60\*\* | 30 | 40,960 | Industrial Frame. Synth Strength. |

\***100 Nodes** (10 Head, 50 Torso, 15 Full Arms (Each), 20 Full Legs (Each, though any Movement modification must match to function)) as well as each section able to support 1 External Mount Socket (or 10 Nodes) hard point PER location.  
\*\*60 Nodes (6 Head, 30 Torso, 10 each Arm, 12 each Leg)

# **EQUIPMENT**

# **EQUIPMENT**

This document provides full specifications for Gear, Computers, Medical Systems, Surveillance, Survival, and Vocation Tools. All items utilize the **Universal Chassis System** and **Valuation Curve** defined in the Master Framework.  
**Valuation Key:**

* **DC 5 (Simple):** 40 Cr  
* **DC 10 (Standard):** 160 Cr  
* **DC 15 (Advanced):** 640 Cr  
* **DC 20 (Expert):** 2,560 Cr  
* **DC 25 (Master):** 10,240 Cr

## 

## 

## **1\. Gear & Utility Tech**

General purpose equipment for traversal, interaction, and protection.

### 

### **1.1 Biotech & Programmable Matter**

**Biotech Device (Generic Chassis)**

* **TL:** 4 (Smart/Biotech)  
* **Size:** Tiny  
* **Acquisition DC:** 20 (Expert)  
* **Value:** 2,560 Cr  
* **Function:** Grown rather than built.  
* **Mechanic:** Possesses the **Regeneration** trait (Regenerates 1 HP/hour). If the user has the **Xenobiology** skill (Trained), they can "feed" the device organic matter to repair it instantly (1d4 HP).

**Programmable Matter Device (Picotech)**

* **TL:** 4 (Smart)  
* **Size:** Diminutive  
* **Acquisition DC:** 25 (Master)  
* **Value:** 10,240 Cr  
* **Function:** A canister of "smart sand" or fluid metal.  
* **Mechanic:** With an **Electronics (Trained)** check, the user can reshape this item into any **Simple (T1)** tool or object of Tiny size or smaller.  
* **\[Morphic\]:** Can store up to 3 "Blueprints" to shift between as a Free Action.

### 

### **1.2 Holographic Systems**

**Image Projector**

* **TL:** 2 (Analog/Digital)  
* **Acquisition DC:** 5 (Simple)  
* **Value:** 40 Cr  
* **Function:** Projects a static or looped 2-Dimensional image on a flat surface. Includes a basic speaker. Obvious fake (Perception DC 10).

**Holo Emitter**

* **TL:** 3 (Digital)  
* **Acquisition DC:** 10 (Standard)  
* **Value:** 160 Cr  
* **Function:** Projects a high-fidelity 3-Dimensional image and binaural sound within a **Close (10m)** area.  
* **Mechanic:** Grants \+2 to **Deception** checks if used to create a distraction.

**Holophotonic Projector (Hard Light)**

* **TL:** 5 (Meta)  
* **Acquisition DC:** 30 (Grandmaster)  
* **Value:** \~41,000 Cr  
* **Function:** Creates "Interactive Hard Light" objects with mass and texture.  
* **Mechanic:** Can create cover (HP 20), simple furniture, or bridges. Dissolves if powered down.

### 

### **1.3 Environmental Protection**

**Enviro Suit**

* **TL:** 3 (Digital)  
* **Acquisition DC:** 15 (Advanced)  
* **Value:** 640 Cr  
* **Function:** Full body containment.  
* **Mechanic:** Provides **EPR 3** (Vacuum/Radiation). Uses a **Supply Die (d10)** for Oxygen/Power.

**Smart Suit**

* **TL:** 4 (Smart)  
* **Acquisition DC:** 20 (Expert)  
* **Value:** 2,560 Cr  
* **Function:** Nanotech weave that adapts to threats.  
* **Mechanic:** Automatically identifies Environmental Hazards. As a Reaction, adapts resistance to provide **EPR 4** against specific threats (Heat, Cold, Acid).

### 

### **1.4 Mundane & Personal Items**

**Backpack / Storage Unit**

* **TL:** 1  
* **DC:** 5  
* **Value:** 40 Cr  
* **Mechanic:** Increases carrying capacity (Slots) by 2\.

**Clothing (Standard)**

* **TL:** 2  
* **DC:** 2  
* **Value:** 10 \- 20 Cr  
* **Function:** Durable synthetic street clothes.

**Clothing (High Fashion)**

* **TL:** 3  
* **DC:** 15  
* **Value:** 640 Cr  
* **Function:** Status symbol. Grants \+1 to Social checks in high society.

**Glow-Rod / Flashlight**

* **TL:** 2  
* **DC:** 2  
* **Value:** 10 Cr  
* **Function:** Illuminates 20ft radius.

**Restraints**

* **Zip (TL2):** DC 2 (5 Cr). Str DC 20 to break. Single use.  
* **Mag (TL3):** DC 10 (160 Cr). Str DC 25 / Hack DC 20 to open. Reusable.

## 

## 

## **2\. Computer Framework**

Cyberdecks and Comms are defined by their **Processor Rating (PR)**.

### 

### **2.1 Processors (The Engine)**

| Item | TL | PR | DC | Value | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Datapad** | 3 | 0 | 5 | 40 Cr | Standard tablet. Access local info/maps. |
| **Basic Processor** | 3 | 0 | 10 | 160 Cr | Can run simple scripts. No AI. |
| **Upgraded Processor** | 4 | 2 | 15 | 640 Cr | Capable of running **Expert Software**. |
| **Advanced Processor** | 5 | 4 | 25 | 10,240 Cr | Capable of running **True AI**. |

### 

### **2.2 Software (The Capability)**

**Expert Software**

* **Requirement:** PR 2+  
* **DC:** Varies (10 to 30\)  
* **Mechanic:** Grants an **Aid Bonus** (+1 to \+5) to a **specific** Skill Check.  
  * \+1 Bonus: DC 10 (160 Cr)  
  * \+2 Bonus: DC 15 (640 Cr)  
  * \+3 Bonus: DC 20 (2,560 Cr)

**Operation Software**

* **Requirement:** PR 0+  
* **Function:** Automation (Takes 10).  
  * **Basic (Rank 5):** DC 10 (160 Cr).  
  * **Intermediate (Rank 10):** DC 15 (640 Cr).  
  * **Advanced (Rank 15):** DC 20 (2,560 Cr).

## 

## 

## **3\. Medical Framework**

### 

### **3.1 Automated Care**

**Auto-Doc Unit**

* **TL:** 4  
* **Acquisition DC:** 20 (Expert)  
* **Value:** 2,560 Cr  
* **Function:** Robotic surgery pod.  
* **Mechanic:** Runs **Operation Software (Medicine)** at **Intermediate Level** (Skill 10). Stabilizes and treats wounds autonomously.

**Portable Nurse (Drone)**

* **TL:** 4  
* **Acquisition DC:** 15 (Advanced)  
* **Value:** 640 Cr  
* **Function:** Hovering triage assistant.  
* **Mechanic:** Runs **Expert Software (Medicine)**. Grants **\+2 Aid Bonus** to a PC making a Medicine check.

**Regen-Tank**

* **TL:** 4  
* **Acquisition DC:** 25 (Master)  
* **Value:** 10,240 Cr  
* **Function:** Submersion bacta-tank.  
* **Mechanic:** Heals 1 HP/Hour; regrows limbs during extended rest.

### 

### **3.2 Medical Consumables**

**Trauma Patch**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Function:** Slap-patch. Instantly stabilizes Dying character. Stops Bleeding. 1 Use.

**Med-Gel**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Function:** Bio-foam sealant. Heals 1d6 HP instantly. 1 Use.

**Stim-Shot**

* **TL:** 3  
* **DC:** 5  
* **Value:** 40 Cr  
* **Function:** Removes **Exhausted** or **Dazed** for 1 hour. "Crash" (-2 to rolls) afterwards.

### 

### **3.3 Medical Facilities (Vocation Tools)**

**First Aid Kit**

* **Type:** Basic Tool  
* **DC:** 5  
* **Value:** 40 Cr  
* **Effect:** Allows Medicine checks without "Improvised Tool" penalty.

**Medkit (Full)**

* **Type:** Kit  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** \+1 Bonus to Medicine checks. 5 Uses.

**Field Surgery / Clinic**

* **Type:** Semi-Portable/Room  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** **\+2 Bonus**. Requires **Trained (Rank 6+)**.

**Operating Theater / Hospital**

* **Type:** Facility  
* **DC:** 20  
* **Value:** 2,560 Cr  
* **Effect:** **\+4 Bonus**. Requires **Expert (Rank 11+)**.

## 

## 

## **4\. Surveillance & Communications**

### 

### **4.1 Sensors**

**Passive Sensors (Camera/Mic/Rangefinder)**

* **TL:** 2  
* **DC:** 5  
* **Value:** 40 Cr  
* **Effect:** Captures audio/visual data.

**Hand Scanner (Tricorder)**

* **TL:** 3  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Active Sensor. Detects Bio/Rad/Geo signatures within 50ft.

**Holo-Cam**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** Captures 3D volumetric data for AR reconstruction.

### 

### **4.2 Communication Units**

**Comm-Link (Audio)**

* **TL:** 2  
* **DC:** 5  
* **Value:** 40 Cr  
* **Range:** 1-mile (Planetary with Satellite).

**Comm Unit (Holographic)**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Range:** Projects caller's avatar.

**Comm Unit (Telepathic)**

* **TL:** 4/5 (Biotech)  
* **DC:** 25  
* **Value:** 10,240 Cr  
* **Effect:** Silent, un-jammable. Requires **Telepathy** skill.

**Satellite Uplink**

* **TL:** 2  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** Removes range limits on Comms.

## 

## 

## **5\. Survival Gear**

### 

### **5.1 Resource Management**

**Rations (Dehydrated)**

* **TL:** 2  
* **DC:** 0  
* **Value:** 10 Cr  
* **Effect:** 1 Day of food. Restores Supply Die.

**Water Purifier**

* **TL:** 2  
* **DC:** 5  
* **Value:** 40 Cr  
* **Effect:** Converts tainted water into safe water.

**Thermal Blanket**

* **TL:** 2  
* **DC:** 2  
* **Value:** 20 Cr  
* **Effect:** Advantage on Survival checks vs. Cold.

**Enviro-Tent**

* **TL:** 3  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Hermetic shelter for 4\. Protects against toxic atmosphere.

**Enviro Field Generator**

* **TL:** 3  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Projects 20ft radius dome. EPR 1\. DR 1 vs Ranged.

**Rebreather / Air Mask**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** Filters toxins (EPR 2). 2 hours internal oxygen.

### 

### **5.2 Climbing & Mobility**

**Climbing Gear (Standard)**

* **TL:** 2  
* **DC:** 5  
* **Value:** 40 Cr  
* **Effect:** Rope/pitons. Negates climbing penalty.

**Mag-Boots**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** Walk on metal in Zero-G. Half speed.

**Grav-Chute**

* **TL:** 4  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Anti-grav harness. Negates falling damage.

**Climbing Gear (Advanced/Grav)**

* **TL:** 5  
* **DC:** 25  
* **Value:** 10,240 Cr  
* **Effect:** Advantage on Athletics checks.

## 

## 

## **6\. Vocation Tools**

### 

### **6.1 Diagnostic & Repair Systems**

**Basic Tool Kit**

* **TL:** 2  
* **DC:** 5  
* **Value:** 40 Cr  
* **Effect:** Required for basic Engineering checks.

**Mechanics Kit (Powered)**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** \+1 Bonus to Repair.

**Fusion Cutter**

* **TL:** 3  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Heavy plasma torch. 1d10 Structure Damage/round.

**Diagnostic System (Stationary)**

* **TL:** 4  
* **DC:** 20  
* **Value:** 2,560 Cr  
* **Effect:** **\+4 Bonus** to Repair. Requires **Trained (Rank 6+)**.

### 

### **6.2 Databases**

**Standard Database (TL3)**

* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** \+2 Bonus to Knowledge.

**Upgraded Database (TL4)**

* **DC:** 20  
* **Value:** 2,560 Cr  
* **Effect:** \+4 Bonus. Requires **Trained**.

### 

### **6.3 Multi-Tools**

**Multi-Tool**

* **TL:** 3  
* **DC:** 10  
* **Value:** 160 Cr  
* **Effect:** Replicates any non-powered hand tool.

**Omni-Tool (Programmable)**

* **TL:** 4  
* **DC:** 15  
* **Value:** 640 Cr  
* **Effect:** Replicates powered tools. **\+2 Bonus** to Engineering.

**Polymorphic Liquid Metal (Advanced)**

* **TL:** 5  
* **DC:** 25  
* **Value:** 10,240 Cr  
* **Effect:** Can become any tool/scanner. **\+4 Bonus**.

### 

### **6.4 Facility Scaling (The Workspace)**

Bonuses apply based on the scale of the workshop.

* **Basic (Belt):** DC 5 (40 Cr). No Bonus.  
* **Full Set (Cart):** DC 10 (160 Cr). \+2 Bonus.  
* **Shop/Lab (Room):** DC 20 (2,560 Cr). \+4 Bonus.  
* **Building (Factory):** DC 30 (41,000 Cr). \+6 Bonus.  
* **Facility (Campus):** DC 40 (650,000 Cr). \+8 Bonus.

# **MECHA**

# **MECHA**

## 

This catalog presents a comprehensive, system-agnostic listing of vehicular assets commonly found in speculative fiction and role-playing simulations. By stripping away specific intellectual property branding and setting-specific jargon, we reveal the core archetypes that define the genre. These eighty-four platforms are categorized by their primary operational domain and function, utilizing standardized nomenclature to describe their propulsion, armament, and intended role.  
This "genericized" approach allows World Builders and Game Masters to insert these templates into any setting—from hard science-fiction to space opera—without conflicting with established lore.

## **PERSONAL MOBILITY & LIGHT VEHICLES** 

Vehicles that rely on Manual (human-powered) and Environmental (gravity, wind, wave) propulsion, as well as Light Powered personal transports. 

| VEHICLE NAME | CLASS | PROPULSION TYPE | SIZE | COST |
| ----- | ----- | ----- | ----- | :---: |
| **Standard Skateboard / Longboard** | Manual Ground Transport | Manual (Push) | Tiny | 1 |
| **Cycle** | Manual Geared Transport | Manual (Pedal/Gear) | Medium | 2 |
| **Surfboard / Wave-Rider** | Environmental Watercraft | Environmental (Wave/Current) | Medium | 2 |
| **Segway / Gyro-Pod** | Light Powered Transport | Micro-Motor (Electric) | Small | 3 |
| **Jet-Powered Hoverboard (Skimmer)** | Powered Hovercraft | Vectored Thrust (Micro-Turbine) | Small | 10 |
| **Officer's Hover Platform** | Anti-Gravity Platform | Grav-Plate (Silent) | Small | 15 |
| **Subcompact Commuter** | Urban Transit | Micro-Motor (Electric) | Medium | 10 |
| **Urban Scooter** | Micro-Mobility  | Micro-Motor (Electric) | Small | 3 |
| **Personal Hover Pod (The "Bubble")** | Enclosed Grav-Vehicle | Grav-Drive | Medium | 20 |

* **Standard Skateboard / Longboard:** An urban deck for quick transit on paved surfaces. It grants increased movement on smooth, flat terrain and is operated using Manual (Push) propulsion.  
* **Cycle:** A ruggedized frame with suspension for wilderness traversal. It uses Manual (Pedal/Gear) for propulsion and includes a Gear System for mechanical advantage and a Cargo Rack.  
* **Surfboard / Wave-Rider:** A composite board for riding hydro-energy. Its speed is equal to the wave/current speed, and it requires **Athletics (Swim)** or **Profession (Surfer)** to operate.  
* **Segway / Gyro-Pod:** A self-balancing personal mover for station or city use. It is a light powered transport with a Micro-Motor (Electric) and a Gyro-Stabilizer, offering hours of continuous use.  
* **Jet-Powered Hoverboard (Skimmer):** A hover-style board using directed air thrust. It is a Powered Hovercraft with Vectored Thrust, skimming 1ft off the ground, featuring a Micro-Turbine and Mag-Clamps.  
* **Officer's Hover Platform:** A floating disk used by commanders or overseers to remain above the fray. It is an Armored Anti-Gravity Platform with Grav-Plate (Silent) propulsion, a Tactical Shield, and a Comms/Sensor Suite.  
* **Subcompact Electric Commuter:** The ubiquitous "pod" car of the future city. These vehicles are often identical, manufactured from cheap, printable composites. They feature fully automated grid-link driving, swiveling seats for social interaction during commutes, and barely enough crumple-zone protection to survive a low-speed impact.  
* **Urban Electric Scooter:** A collapsible, single-person transport often rented by the minute in dense arcologies. It links to the city’s traffic grid to limit speed and prevent collisions. While physically flimsy, its ubiquity makes it an ideal, disposable getaway vehicle for navigating gridlocked traffic.  
* **Personal Hover Pod (The "Bubble"):** An enclosed, glass-sphere transport for comfortable city travel, the Pod seats 1 and is very roomy (or can seat 2 and only slightly cramped). This Enclosed Vehicle has a Grav-Drive for full flight capability, full Life Support/EC, Integrated Comm Node, Autopilot, and a Stowage Compartment (½ mount/50kg). This is the metro/mini of an Aerocar.

## ---

**CIVILIAN VEHICLES: PERSONAL AND MASS TRANSIT**

Civilian vehicles represent the baseline technology of a civilization. These units prioritize comfort, aesthetics, and affordability over survivability. In this catalog, propulsion systems range from archaic internal combustion to advanced anti-gravity fields.

| STANDARDIZED MODEL NAME | PROPULSION  | CREW | PRIMARY ROLE | KEY FEATURES |
| :---- | :---- | :---- | :---- | :---- |
| **Retro-Styled Sportscar** | ICE | 1+1 | Status Symbol | Manual controls, analog gauges, vintage aesthetic. |
| **Open-Deck Grav Skiff** | Repulsion Field | 1+1 | Frontier Transport | Open cockpit, high maneuverability, exposed turbines. |
| **Utility Platform** | Anti-Gravity | 4 | Survey / Leisure | Open-topped, infinite loiter time, vertical takeoff. |
| **Hyper-Luxury Coupe** | Vector Thrust | 2 | VIP Transport | Heavy composite plating, active defense systems, opulent interior. |
| **Family Skimmer** | Repulsion Field | 1+3 | Civilian Transit | Sealed canopy, crash-safety fields, moderate speed. |
| **Heavy Logistics Hauler** | Fuel Cell | 1+2 | Cargo Transport | Modular flatbed, ruggedized suspension, long-range tanks. |
| **Monocycle** | Electric Gyro | 1 | Personal Mobility | Self-balancing, high speed, compact storage. |
| **Hydrojet** | Water-Jet | 4 | Leisure | High-speed surface planing, luxury amenities. |
| **All-Terrain Rover** | Hybrid | 1+4 | Frontier Exploration | Independent suspension, life-support seal, rugged tires. |

* **Retro-Styled Combustion Sportscar:** A mechanically simple vehicle running on synthetic alcohol or refined hydrocarbons. It features a manual transmission and analog dashboard, prized by enthusiasts for its "tactile" driving experience in an age of automation. Its loud, vibrating engine is a status symbol of raw, untamed power.  
* **Open-Deck Grav Skiff:** A floating chassis consisting of a flat deck, control pylon, and exposed repulsion vanes. Lacking a canopy, passengers are exposed to the elements, necessitating goggles or breather masks on dusty frontier worlds. It is the favored tool of farmers and local militias for its ease of repair.  
* **Gravitic Utility Platform:** Essentially a flying pickup truck with a localized gravity field. It moves slowly but ignores terrain entirely. The open-top design allows for easy loading of supplies or survey equipment, making it a staple of planetary exploration teams who prioritize visibility over protection.  
* **Armored Hyper-Luxury Coupe:** A sleek, aerodynamic shell concealing military-grade composite armor. Designed for corporate executives, it features a hermetically sealed cabin with independent life support, shielding occupants from the pollution and poverty of the city outside.  
* **Enclosed Family Skimmer:** The standard suburban transport for the middle class. It hovers a meter off the ground on a repulsion field, offering a smooth ride. The cabin is soundproofed and features entertainment screens, isolating the family unit from the noise of the outside world.  
* **Heavy Logistics Hauler:** A massive, multi-wheeled or tracked truck powered by a hydrogen fuel cell. It is designed to run for weeks without refueling, featuring a sleeper cab and an automated turret mount for defense against highwaymen on lawless stretches of road.  
* **Monocycle:** A single, large gyroscopically stabilized wheel with the rider seated inside the rim. It is incredibly agile and capable of weaving through pedestrian crowds, making it a favorite of couriers and thrill-seekers.  
* **Hydrojet:** A high-speed surface skimmer that intakes water and jets it out the rear for propulsion. It is loud, fast, and totally unsuited for rough seas, existing purely for the leisure of the wealthy on resort worlds.  
* **All-Terrain Wheeled Rover:** A rugged, pressurized expedition vehicle with six or eight independent wheels. It is designed for long-duration travel on uninhabited planets, featuring airlocks, solar charging arrays, and a modular rear section for scientific equipment.

## 

## ---

 **UTILITY VEHICLES: INDUSTRIAL AND COMMERCIAL ASSETS**

Utility vehicles are the backbone of industry, designed for resource extraction, construction, and heavy lifting. They often feature specialized manipulators, reinforced frames, and high-torque engines.

| STANDARDIZED MODEL NAME | PROPULSION TYPE | CREW | PRIMARY ROLE | KEY FEATURES |
| :---- | :---- | :---- | :---- | :---- |
| **Agricultural Walker** | Bipedal / Quad | 1 | Farming | Herding sensors, terrain adaptation, soft-step pads. |
| **Heavy Cargo Repulsor** | Repulsion Field | 1 | Bulk Transport | Open deck, high weight capacity, low altitude ceiling. |
| **Planetary Survey Crawler** | Tracks / Wheels | 4 | Exploration | Pressurized laboratory, sleeping quarters, rad-shielding. |
| **Armored Step-Van** | Wheeled | 2+4 | Secure Logistics | Discreet armor, drone racks, encrypted comms. |
| **Construction Exoskeleton** | Bipedal Mech | 1 | Heavy Lifting | Hydraulic claws, roll cage, industrial frame. |
| **Zero-G Maneuver Sled** | Cold Gas Thrusters | 1 | EVA Work | Magnetic clamps, tool racks, vacuum exposure. |
| **Ore Processing Crawler** | Massive Tracks | 20+ | Mobile Refining | Onboard smelter, tread crushers, colossal size. |
| **Recovery & Towing Vehicle** | Tracks | 2 | Battlefield Logistics | Heavy crane, repair drones, towing winch. |
| **Armored Corporate Transporter** | Wheeled (6x6) | 2 | High-Value Cargo | Run-flat tires, reinforced cab, automated turret defense. |
| **Amphibious Work Tug** | Water-Jet / Prop | 3 | Marine Labor | High torque, towing cables, storm-weather hull. |
| **Forestry Deforestation Walker** | Bipedal Mech | 1 | Logging | Industrial chainsaw, tree-grapple, stabilizing gyros. |
| **Wilderness Survival Rover** | Wheels / Tracks | 6 | Expedition | Heavy armor, weapon mounts, long-duration supplies. |

### 

### 

* **Agricultural Walker:** A four-legged mech designed to step gingerly over crops while spraying nutrients or harvesting produce. Its elevated chassis allows it to work without crushing the vegetation below, and its manipulator arms can be fitted with shears, baskets, or cattle prods.  
* **Heavy Cargo Repulsor:** A flatbed barge held aloft by powerful anti-gravity coils. It has no cockpit, usually controlled by a walking operator with a remote or a simple droid brain. It is used to move shipping containers or heavy machinery across starport tarmacs.  
* **Planetary Survey Crawler:** A mobile laboratory on tank treads. Heavily shielded against radiation and extreme temperatures, it serves as a home base for scientists in hostile environments. It typically mounts a large sensor dish and a drone bay for aerial mapping.  
* **Armored Step-Van:** The standard vehicle for secure urban delivery and SWAT teams. It features a boxy, nondescript exterior with sliding doors and reinforced run-flat tires. The interior is often modular, capable of housing surveillance racks or weapon lockers.  
* **Construction Exoskeleton:** An open-frame powered suit that amplifies the user's strength fifty-fold. It lacks armor plates, leaving the operator's body visible through the roll cage. It is equipped with locking clamps and heavy-duty servos for manipulating steel girders.  
* **Zero-G Maneuver Sled:** A rigid frame equipped with cold-gas thrusters and handholds. Astronauts strap into it to move heavy components during orbital construction. It has no life support, relying on the user's vacuum suit.  
* **Ore Processing Crawler:** A colossal industrial machine the size of an office building. It consumes rock and soil through a front maw, processes it internally, and leaves a trail of waste tailings behind. It moves on massive caterpillar tracks and houses a crew of dozens.  
* **Recovery & Towing Vehicle:** A tracked tank chassis with the turret replaced by a high-torque crane and winch system. It is designed to drag destroyed tanks or downed mechs off the battlefield under fire, featuring heavy frontal armor to survive the attempt.  
* **Armored Corporate Transporter:** A six-wheeled, ultra-secure truck used to move bullion, prototypes, or prisoners. It features no windows, relying on cameras and sensors for navigation, and its hull is hardened against electromagnetic pulses and chemical attacks.  
* **Amphibious Work Tug:** A stout, powerful boat capable of extending wheels to drive up onto land. It is used in colony worlds with archipelago geography, moving supplies between islands and dragging heavy nets or barges.  
* **Forestry Deforestation Walker:** A bipedal mech equipped with a massive industrial chainsaw arm and a claw for gripping tree trunks. It is stabilized by gyros to prevent tipping when felling massive alien timber.  
* **Wilderness Survival Rover:** A hardened exploration vehicle designed for "doomsday" scenarios. It features independent suspension, air filtration, water recycling, and viewing ports protected by blast shutters. It is the vehicle of choice for survivalists and wasteland guides.

## 

## ---

**MILITARY GROUND VEHICLES: COMBAT PLATFORMS**

Designed for war, these vehicles prioritize firepower, armor, and tactical mobility. They range from rapid-response skimmers to city-leveling siege tanks.

| STANDARDIZED MODEL NAME | CHASSIS TYPE | WEAPONRY FOCUS | OPERATIONAL ROLE |
| ----- | ----- | ----- | ----- |
| **Main Battle Tank (Standard)** | Tracked | Kinetic Cannon | Frontline Assault / Attrition |
| **Advanced Grav-Tank** | Anti-Gravity | Particle Beam | Maneuver Warfare / Pop-up Attack |
| **Behemoth Wheeled Fortress** | Multi-Wheel (10x10) | Missiles / Turrets | Mobile Command / Breakthrough |
| **Combined-Arms Heavy Tank** | Tracked | Energy & Missiles | General Purpose Combat |
| **Riot Suppression Transport** | Wheeled (6x6) | Water/Sonic Cannon | Urban Security / Heavy APC |
| **Heavy Urban APC** | Wheeled (8x8) | Autocannon | Troop Transport / Pacification |
| **Mechanized Infantry Carrier** | Tracked | Laser / Bolter | Amphibious Assault / Fire Support |
| **Rapid Strike Hover-Tank** | Repulsion Field | Beam Cannons | Fast Attack / Flanking |
| **Short-Range Siege Tank** | Tracked | Massive Bore Cannon | Urban Demolition / Bunker Busting |
| **Arachnid Support Walker** | Multi-Legged | Railguns | Difficult Terrain Support |
| **Light Wheeled APC** | Wheeled (4x4) | Light Autocannon | Infantry Mobility / Patrol |
| **Mobile Command Fortress** | Tracked | Railguns / Lasers | Forward Operating Base / Fear Factor |

### 

### 

* **Main Battle Tank (Standard):** A low-profile tracked vehicle mounting a massive kinetic cannon. It prioritizes frontal armor and hull-down positioning. Its design has remained largely unchanged for centuries because it is cheap, reliable, and effective at holding ground.  
* **Advanced Grav-Tank:** A floating fortress that moves effortlessly over water, mud, and mines. It is armed with energy weapons (plasma or particle beams) that require massive heatsinks. Its mobility allows it to strafe enemies like a fighter jet while staying close to the ground.  
* **Behemoth Wheeled Fortress:** A ten-wheeled mobile command center. It is too heavy for most bridges, so it relies on crushing its own path. It bristles with defensive turrets and carries a complement of troops, serving as a rallying point for an entire offensive.  
* **Combined-Arms Heavy Tank:** A versatile tracked tank equipped with a mix of missiles for long-range engagement and lasers for point defense. It is designed to operate without infantry support, handling aircraft and light vehicles independently.  
* **Riot Suppression Transport:** A six-wheeled armored truck equipped with water cannons, sonic screamers, and tear gas launchers. It is designed to intimidate civilians and disperse crowds without using lethal force, though it can plow through barricades if necessary.  
* **Heavy Urban APC:** An eight-wheeled carrier with thick all-around armor to protect against RPGs fired from rooftops. It features firing ports for the passengers and a remote weapon station on the roof. It is optimized for navigating narrow city streets.  
* **Mechanized Infantry Carrier:** A tracked vehicle designed to deliver a squad of soldiers into the heart of combat. It mounts a medium-caliber autocannon to suppress enemy infantry while its ramp drops. It is amphibious, capable of river crossings.  
* **Rapid Strike Hover-Tank:** A fast, fragile skimmer armed with a high-caliber beam cannon. It relies on speed and evasion rather than armor. It is designed to flank enemy lines, deliver a devastating shot to the rear armor, and flee before retaliation.  
* **Short-Range Siege Tank:** A specialized vehicle mounting a massive bore cannon or demolition charge launcher. Its range is extremely short, but it can level a bunker or collapse a building in a single shot. It is heavily armored to survive close-quarters urban fighting.  
* **Arachnid Support Walker:** A multi-legged tank that can climb vertical surfaces or navigate rubble fields impossible for tracks. It is armed with rapid-fire railguns and serves as a mobile fire-support platform for mountain troops.  
* **Light Wheeled APC:** A 4x4 armored car, similar to a Humvee but up-armored for sci-fi combat. It is fast, air-droppable, and used for reconnaissance or patrolling pacified areas.  
* **Mobile Command Fortress:** A tracked super-heavy vehicle that houses a tactical operations center. It has powerful communications arrays to coordinate fleet movements and is protected by point-defense lasers and heavy shielding.

## 

## ---

**AIRCRAFT: ATMOSPHERIC DOMINANCE**

These vehicles operate primarily within a planet's atmosphere, ranging from low-altitude gunships to high-speed interceptors.

| STANDARDIZED MODEL NAME | FLIGHT SYSTEM | CREW | PRIMARY ROLE | KEY FEATURES |
| ----- | ----- | ----- | ----- | ----- |
| **Civilian VTOL Aerodyne** | Vectored Thrust | 1+3 | Urban Transport | Vertical landing, hovering, luxury interior. |
| **Armored Grav-Gunship** | Gravitic / Jet | 2 | Close Air Support | Heavy armor, "nap of the earth" flight profile. |
| **Troop Insertion VTOL** | Twin-Engine Jet | 2+12 | Assault Transport | Door gunners, grav-chute deployment, hovering. |
| **Atmospheric Interceptor** | Repulsor / Airbrake | 2 | Air Superiority | Harpoon tow-cables, high agility, fragile hull. |
| **Gravitic APC** | Anti-Gravity | 2+14 | Orbital Drop | Vacuum sealed, re-entry capable, heavy shields. |
| **Conventional Attack Rotorcraft** | Rotor / Tail Rotor | 2 | Anti-Armor | Guided missiles, chin-turret, stealth coating. |
| **Security Rotor-Drone** | Remote / AI | 0 | Surveillance | VTOL, spotlight, non-lethal gas dispensers. |
| **Heavy Lift Transport** | Ducted Fans | 3 | Mech Deployment | Heavy cargo clamps, VTOL, vulnerable to AA. |
| **Hover-Jet Gunship** | Jet / Hover | 2 | Reconnaissance | Hybrid flight mode, railguns, high speed. |
| **Infantry Support Gunship** | Repulsorlift | 2+30 | Multi-Role Assault | Ball turrets, missile racks, open troop bay. |
| **Urban Pacification Aerodyne** | Vectored Thrust | 2+8 | SWAT/Police | Miniguns, loudhailers, heavy armor plating. |
| **Supersonic Hover-Bike** | Jet / Hover | 1 | Interceptor | Exposed rider, missile pods, extreme speed. |

### 

### 

* **Civilian VTOL Aerodyne:** A luxury flying car using ducted fans or jet thrusters. It is capable of vertical takeoff and landing, allowing it to dock at skyscraper landing pads. It is the primary mode of transport for the upper class in vertical cities.  
* **Armored Grav-Gunship:** A floating tank that operates in the atmosphere. It uses anti-gravity to loiter silently behind buildings before popping up to unleash a barrage of missiles. It is heavily armored against ground fire.  
* **Troop Insertion VTOL:** A twin-engine jet transport with swiveling thrusters. It carries a squad of infantry and deploys them via fast-rope or gravity chutes. It is equipped with door guns to clear the landing zone.  
* **Atmospheric Interceptor:** A dedicated fighter jet designed to destroy other aircraft. It is incredibly fast but cannot hover. It relies on long-range missiles and electronic warfare to dominate the sky.  
* **Gravitic APC:** An enclosed troop transport that uses gravity drives to drop from orbit directly onto the battlefield. It is sealed against vacuum and reentry heat, allowing it to serve as a boarding craft for starships as well.  
* **Conventional Attack Rotorcraft:** A helicopter gunship with stealth faceting to reduce its radar signature. It is cheaper and quieter than jet VTOLs, making it ideal for counter-insurgency operations and surprise attacks.  
* **Security Rotor-Drone:** A remote-controlled helicopter roughly the size of a motorcycle. It carries a spotlight, cameras, and a light machine gun or taser. It patrols corporate perimeters tirelessly.  
* **Heavy Lift Transport:** A massive aircraft with four tilting ducted fans. It is designed to pick up tanks or mechs and ferry them to the front lines. It is slow and vulnerable, requiring fighter escorts.  
* **Hover-Jet Gunship:** A hybrid aircraft that can hover on fans for ground support or engage afterburners for supersonic flight. It is a "jack of all trades" aircraft used by marines.  
* **Infantry Support Gunship:** A flying gun platform that circles the battlefield, raining down fire from ball turrets and side-mounted cannons. It is designed to break infantry waves and destroy light vehicles.  
* **Urban Pacification Aerodyne:** A police VTOL equipped with loudspeakers, searchlights, and non-lethal gas dispensers. It is heavily armored to withstand small arms fire from street gangs.  
* **Supersonic Hover-Bike:** A jet engine with a seat. It hovers on a magnetic field and uses the jet for forward thrust. It is incredibly dangerous to pilot, used by scouts and adrenaline junkies.

## 

## ---

**SPACECRAFT: INTERSTELLAR ASSETS**

Vessels designed for the void, ranging from single-pilot fighters to massive capital ships.

| STANDARDIZED MODEL NAME | TONNAGE/CLASS | PROPULSION | OPERATIONAL ROLE |
| ----- | ----- | ----- | ----- |
| **Wedge-Scout Courier** | 100-Ton | FTL / Maneuver | Exploration / Mail |
| **Fast Tramp Freighter** | Light Freighter | Hyperdrive | Smuggling / Cargo |
| **Standard Free Trader** | 200-Ton | FTL / Fusion | Commerce / Transport |
| **Multi-Role Starfighter** | Single-Seat | Ion / Hyperdrive | Space Superiority |
| **Heavy Assault Dropship** | Trans-Atmospheric | Fusion Torch | Marine Deployment |
| **Planetary Assault Carrier** | DropShip | Fusion Rocket | Mech/Tank Transport |
| **Hard-Science Shuttle** | Passenger | Chemical / Nuclear | Orbital Transfer |
| **Mass-Produced Swarm Fighter** | Single-Seat | Ion Engines | Swarm Attack / Patrol |
| **Frontier Battlecruiser** | 1200-Ton | Jump Drive | System Defense / Colonial |
| **Industrial Utility Shuttle** | Modular | Plasma Thruster | Cargo Loading / Mining |
| **Retro-Fitted Habitat Ship** | Capital Barge | Solar/Fusion | Nomadic Colony |
| **Capital-Class Warship** | Heavy Cruiser | FTL / Antimatter | Fleet Command / Bombardment |

### 

### 

* **Wedge-Scout Courier:** A small, angular ship designed for one or two crew. It consists mostly of engines and sensors. It is used to map new systems or deliver high-priority data packets. It is rugged, cramped, and fast.  
* **Fast Tramp Freighter:** A beat-up, highly modified light cargo ship. It sacrifices cargo space for larger engines and hidden smuggling compartments. It is the favored vessel of independent captains operating on the fringe of the law.  
* **Standard Free Trader:** A blocky, utilitarian ship designed to carry standard cargo containers. It is slow and defenseless, relying on patrolled trade lanes. It is the "18-wheeler" of space commerce.  
* **Multi-Role Starfighter:** A single-seat combat craft capable of atmospheric and space flight. It carries lasers for dogfighting and torpedoes for attacking capital ships. It usually has an FTL drive for independent operation.  
* **Heavy Assault Dropship:** A brick-like ship designed to survive orbital insertion under fire. It carries a platoon of soldiers or a light vehicle. It has thick thermal shielding and point-defense guns to intercept missiles.  
* **Planetary Assault Carrier:** A massive DropShip designed to land an entire company of mechs or tanks. It is essentially a flying building that lands on the planet surface to deploy its army.  
* **Hard-Science Shuttle:** An un-aerodynamic craft that never enters an atmosphere, ferrying passengers between orbital stations. It relies on efficient ion engines and rotates to provide artificial gravity.  
* **Mass-Produced Swarm Fighter:** A cheap, fragile fighter with no FTL drive and no shields. It is designed to be deployed in hundreds from a carrier, overwhelming enemies with sheer numbers.  
* **Frontier Battlecruiser:** A warship designed for long patrols in lawless space. It has large fuel tanks, repair bays, and enough firepower to bully pirates or enforce customs laws.  
* **Industrial Utility Shuttle:** A boxy craft equipped with manipulator arms and towing clamps. It is used to load cargo onto larger ships or repair satellites.  
* **Retro-Fitted Habitat Ship:** An old cargo hauler or asteroid mining ship converted into a mobile home for a nomadic clan. It is a patchwork of modules, greenhouses, and living quarters.  
* **Capital-Class Warship:** A city-sized vessel capable of orbital bombardment. It carries wings of fighters and thousands of crew. Its main gun can crack tectonic plates.

## 

## ---

**WATERCRAFT: NAUTICAL VESSELS**

Vehicles designed for liquid environments, from surface oceans to deep-pressure abysses.

| STANDARDIZED MODEL NAME | HULL TYPE | ROLE | SPECIAL CAPABILITIES |
| ----- | ----- | ----- | ----- |
| **Super-Heavy Submersible** | Carrier Sub | Mobile Base | Launch bays for fighters, nuclear power. |
| **Stealth Interceptor Boat** | Hydrofoil | Smuggling | Radar-absorbent materials, high speed. |
| **Deep-Sea Industrial Sub** | Reinforced Sphere | Mining | High-pressure manipulator arms, floodlights. |
| **Bio-Engineered Submersible** | Organic | Transport | Grown hull, silent propulsion, fragile. |
| **Bluewater Artillery Cruiser** | Displacement | Fire Support | Long-range artillery, cruise missiles. |
| **Scientific Exploration Sub** | Modular | Survey | Laboratory modules, specimen collection. |
| **Cloaked Torpedo Skiff** | Planing Hull | Ambush | Active camouflage / Invisibility field. |
| **Heavy Patrol Cutter** | Catamaran | Coast Guard | Anti-piracy weapons, boarding ramps. |
| **Silent Running Cargo Sub** | Submersible | Logistics | Magneto-hydrodynamic drive (caterpillar). |
| **Coastal Bombardment Monitor** | Shallow Draft | Area Denial | Heavy armor, mech-class weaponry. |
| **Exo-Oceanic Explorer** | Universal Sub | Xenology | Methane/Ammonia resistant seals. |
| **Hyper-Velocity Submersible** | Supercavitating | SpecOps | Travels inside gas bubble for extreme speed. |

### 

### 

* **Super-Heavy Submersible:** A submarine the size of an aircraft carrier. It serves as a mobile underwater base, launching smaller subs and aircraft from pressurized bays. It uses nuclear reactors to stay submerged for years.  
* **Stealth Interceptor Boat:** A sleek, radar-absorbent hydrofoil used for smuggling or special forces insertion. It rides high above the water on foils to achieve incredible speeds.  
* **Deep-Sea Industrial Sub:** A spherical, reinforced pressure vessel with mechanical arms and floodlights. It crawls along the ocean floor mining manganese nodules or repairing undersea cables.  
* **Bio-Engineered Submersible:** A vessel grown from genetically modified coral or chitin. It uses water jets for silent propulsion and can heal minor damage over time.  
* **Bluewater Artillery Cruiser:** A surface ship armed with railguns and missiles capable of hitting targets hundreds of miles inland. It serves as mobile artillery for coastal invasions.  
* **Scientific Exploration Sub:** A modular research vessel equipped with laboratories and specimen tanks. It has large viewing ports and advanced sonar for mapping the unknown depths of alien oceans.  
* **Cloaked Torpedo Skiff:** A small, fast boat that uses holographic projectors or active camouflage to blend into the ocean surface. It is designed for ambush attacks on larger vessels.  
* **Heavy Patrol Cutter:** A rugged coast guard vessel designed to weather alien storms. It is armed with water cannons and light deck guns to fight pirates and rescue stranded sailors.  
* **Silent Running Cargo Sub:** A massive underwater freighter that uses magnetohydrodynamic (caterpillar) drives to move silently. It is used to transport high-value cargo without risk of piracy.  
* **Coastal Bombardment Monitor:** A shallow-draft barge with heavy armor and a single massive gun. It is designed to patrol river deltas and provide close fire support.  
* **Exo-Oceanic Explorer:** A specialized submarine designed for non-water oceans (liquid methane, ammonia). It is sealed against extreme cold and chemical corrosion.  
* **Hyper-Velocity Submersible:** A military sub that creates a gas bubble around itself (supercavitation) to travel underwater at the speed of an aircraft. It is blind while moving and must stop to use sonar.

## 

## ---

**POWER ARMOR, MECHS, AND WALKERS**

Bipedal and humanoid combat platforms that bridge the gap between infantry and armor.

| STANDARDIZED MODEL NAME | CLASS | PROPULSION | PRIMARY ARMAMENT |
| ----- | ----- | ----- | ----- |
| **Modular Heavy Battle Walker** | 75-Ton Mech | Bipedal | LR Missiles / Lasers |
| **Heavy Railgun Platform** | Power Armor | Anchored Biped | Sonic Boom Railgun |
| **General Purpose Light Mecha** | 4-Meter Walker | Biped/Treads | Autocannon / Rocket Pod |
| **Super-Heavy Siege Walker** | Colossal | Quadrupedal | Heavy Turbolasers |
| **Cybernetic Life-Support Walker** | Dreadnought | Bipedal | Power Claws / Cannons |
| **Tactical Stealth Exosuit** | Heavy Infantry | Bipedal | Thermo-Optic Camo |
| **Flight-Capable Assault Armor** | Power Armor | Jet/Winged | Railgun / Mini-Missiles |
| **Super-Heavy Assault Mech** | 100-Ton Mech | Bipedal | Massive Autocannon |
| **Bipedal Recon Walker** | Light Walker | Bipedal | Chin-Mounted Blasters |
| **Light Terrain Walker** | Scout Walker | Bipedal | Multi-Laser / Flamer |
| **Standard Infantry Walker** | Medium Walker | Bipedal | Rifle / Grenade Launcher |
| **Powered Boarding Exoskeleton** | Heavy Infantry | Bipedal | Fusion Gun / Gravity Boots |

### 

### 

* **Modular Heavy Battle Walker:** A 10-meter tall bipedal war machine. It features modular hardpoints on its arms and torso, allowing it to swap between missiles, lasers, and autocannons depending on the mission.  
* **Heavy Railgun Platform:** A human-sized power armor suit with a massive railgun mounted on the shoulder or back. It has hydraulic anchors in the legs to stabilize the recoil when firing.  
* **General Purpose Light Mecha:** A 4-meter tall walker that bridges the gap between infantry and heavy armor. It is agile, capable of skating on ground treads, and wields a giant rifle like a soldier.  
* **Super-Heavy Siege Walker:** A colossal four-legged walker that moves slowly and inexorably. It mounts capital-ship grade weaponry and is used to break the most fortified defensive lines.  
* **Cybernetic Life-Support Walker:** A combat chassis that permanently houses a critically injured pilot. The walker *is* the pilot's body, heavily armored and armed with brutal melee weapons or short-range cannons.  
* **Tactical Stealth Exosuit:** A slim, form-fitting power armor equipped with optical camouflage and sound-dampening systems. It enhances the wearer's strength and speed without adding bulk, used by assassins and spies.  
* **Flight-Capable Assault Armor:** A power armor suit with integrated jump jets or wings. It can fly short distances to flank enemies or drop from the sky directly into combat.  
* **Super-Heavy Assault Mech:** A 100-ton bipedal monster designed to draw fire. It is covered in thick ablative armor and carries enough weaponry to level a city block. It is the anchor of any battle line.  
* **Bipedal Recon Walker:** A light, fast walker with chicken-leg reverse joints. It carries advanced sensors and light defensive guns. Its job is to spot the enemy and run away.  
* **Light Terrain Walker:** An open-topped walker used by scouts or colonial militia. It is cheap, rugged, and capable of navigating dense forests or swamps where tanks would get stuck.  
* **Standard Infantry Walker:** The "grunt" of the mech world. Mass-produced, reliable, and armed with a standard loadout of lasers and missiles. It is versatile but unremarkable.  
* **Powered Boarding Exoskeleton:** A heavy suit designed for fighting inside spaceships. It has magnetic boots, breaching charges, and heavy shielding to protect the wearer in tight corridors and vacuum.

# **WEAPON MODIFICATIONS**

# **WEAPON MODIFICATIONS**

# 

## **UPGRADES**

| UPGRADE | FUNCTION | RESTRICTION | DC |
| :---- | :---- | :---- | :---: |
| Accurate | \+1/+2/+3 to Attack | None | 10/20/30 |
| Automated | Auto-Fire | \- | 20 |
| Collapsable | Concealed in clothing or worn item | None | 15 |
| Concealed | Reduce detection | None | 10 |
| Electrified | 1d6+1 Voltic | Melee | 15 |
| Improved Damage | \+2 Damage | None | 20 |
| Improved Range | x2 Range increment | Ranged | 15 |
| Motion Sensitive | Fires at moving targets | TL3, Ranged | 20 |
| Nondetection | Undetectable | TL4 | 30 |
| Reconfigurable | Changes form | Multi-Form weapon | 30 |
| Radar Targeting | \+2 Attack vs moving targets | TL3, Ranged | 20 |
| Reduced Weight | \-50% Weight | None | 10 |
| Sound Targeting | \+2 Attack vs targets making noise | TL3, Ranged | 20 |
| Stick Pad | Sticks to Target (or Floor or Wall) | TL3 | 15 |
| Subdual Mode | Lethal to Non-Lethal option | TL3 | 25 |
| Thermal Targeting | \+2 to Attack targets with heat signatures | TL3, Ranged | 20 |
| Voice Activated | Activated by voice command | TL3 | 25 |

## **CAPACITY UPGRADES**

| CLIP TYPE | FUNCTION | RESTRICTION | DC |
| :---- | :---- | :---- | :---: |
| Typical | Standard for Weapon  | \- | \- |
| Double | x2 Capacity | \- | 10 |
| Triple | x3 Capacity | \- | 15 |
| Pack | x5 Capacity | \- | 20 |
| Canister | x10 Capacity | \- | 25 |
| Hopper | x20 Capacity | \- | 30 |

## **WEAPON DOWNGRADES**

| DOWNGRADE | FUNCTION | RESTRICTION | DC |
| :---- | :---- | :---- | :---: |
| Decreased Range | ½ Range Increment | Ranged Weapons | \-5 |
| Disposable | Single Use | \- | \- |
| Increased Size | Reduced Concealability | \- | \-5 |
| Increased Weight | \+50% to weight | \- | \-5 |
| Reduced Accuracy | \-1 Attack | \- | \-5 |
| Reduced Damage | Reduce damage die by one stage | \- | \-5 |

# 

