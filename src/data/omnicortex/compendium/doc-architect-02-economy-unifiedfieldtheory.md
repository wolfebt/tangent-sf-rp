---
id: "doc-architect-02-economy-unifiedfieldtheory"
name: "02 Economy: Economic Unified Field Theory"
fileName: "02.Economy.UnifiedFieldTheory.md"
relPath: "architect/economy/02.Economy.UnifiedFieldTheory.md"
isMasterDoc: false
masterDocId: "doc-architect-02-economy-and-wealth"
category: "architect_matrix"
parent: "doc-architect-02-economy-and-wealth"
order: 2
perspective: "architect"
entry_type: "Economic Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","economy","02.economy.unifiedfieldtheory","matrix"]
updatedAt: "2026-10-14T06:04:05.816Z"
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

# **The Tangent Economic Unified Field Theory: A Design Protocol for the Tangent SciFi Fantasy RPG**

## 

## **1\. Introduction: The Economic Dissonance in Roleplaying Games**

The design of economic systems within tabletop roleplaying games (RPGs) has historically suffered from a fundamental fracture between narrative ambition and mechanical execution. In the context of the Tangent SciFi Fantasy RPG, the objective is to synthesize a coherent economic engine that unifies character creation resources (Character Points or CP), abstract purchasing power (Wealth Score), liquid currency (Credits), and the mechanics of creation (Crafting DC). This unification is not merely an aesthetic choice but a structural necessity to prevent the "economic dissonance" that plagues legacy systems.  
Economic dissonance arises when the different currencies of a game—time, experience, gold, and crafting effort—fail to exchange at consistent rates. In Dungeons & Dragons 3.5 and Pathfinder, for example, the cost to craft an item is derived from its market price, which is often assigned arbitrarily by designers based on utility rather than complexity. This leads to ludonarrative failures where a high-level adventurer can slay a dragon in six seconds but requires years to forge a suit of armor that is statistically necessary for their survival. Conversely, systems like d20 Modern or Mutants & Masterminds utilize abstract Wealth Scores to streamline bookkeeping, yet often struggle to integrate the granular rewards of "loot" that drive player motivation in dungeon-crawling scenarios.  
This report proposes a singular, mathematically rigorous solution: **The Tangent Economic Matrix**. By establishing the Crafting Difficulty Class (DC) as the "Prime Mover" of the economy, we ensure that the value of an object is a direct, non-arbitrary derivative of the complexity required to create it. This approach aligns the simulationist desire for a logical world (harder things cost more) with the gamist need for balanced progression (investment in CP yields proportional economic power).  
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

## **3\. The Wealth Matrix: Integrating Character Points and Status**

The Wealth Matrix serves as the translation layer between the character’s intrinsic potential (Character Points) and their extrinsic economic power (Wealth Score). In many point-buy systems like GURPS or Mutants & Masterminds, wealth is a distinct advantage purchased separately from skills. Tangent integrates this by treating Wealth Score (WS) as a status attribute that dictates purchasing thresholds.

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

* **Wealth Score (WS):** The target DC the character can "Take 10" on for purchasing. It is the primary attribute derived from CP investment.  
* **Financial Status:** The socio-economic label applied to the character in the game world.  
* **CP Cost:** The cost in Character Character Points to acquire this status at creation. Costs scale non-linearly to represent the exponential utility of wealth.  
* **Purchasing Limit (Liquid Cap):** The maximum Credit value of a single item the character can purchase automatically without rolling or dipping into savings. This aligns with the item's Crafting DC.  
* **Net Worth (Est):** The theoretical total value of the character's assets (land, stocks, ships, favor). This is usually 100x–1000x their liquid purchasing limit and is used for collateral on loans.  
* **Lifestyle Description:** What the character's daily life looks like and what assets they likely maintain.

#### 

#### **Table 3.2: Extended Financial Status Hierarchy**

| Wealth Score (WS) | Financial Status | CP Cost | Purchasing Limit (Auto-Buy) | Estimated Net Worth | Lifestyle Description |
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

