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

