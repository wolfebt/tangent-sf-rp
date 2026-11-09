---
id: "doc-architect-02-economy-and-wealth"
name: "ECONOMY AND WEALTH"
fileName: "02 ECONOMY AND WEALTH.md"
relPath: "architect/02 ECONOMY AND WEALTH.md"
isMasterDoc: true
masterDocId: "doc-architect-02-economy-and-wealth"
category: "architect_matrix"
parent: "5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)"
order: 2
perspective: "architect"
entry_type: "Architect Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","source-of-truth","02 economy and wealth","matrix"]
updatedAt: "2026-11-08T20:27:25.721Z"
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

# **02 ECONOMY AND WEALTH**

## Overview & Mechanical Authority Block

Every rule, formula, and procedural matrix in this master compendium is governed by these canonical **Tangent SF RP** mechanical invariants:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.
* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep the highest 2 dice) or Disadvantage (keep the lowest 2 dice). Opposing stacks cancel 1-for-1.
* **Critical Hit & Fumble Resolution:** Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19`, `18`) equals `Rolled Dice + 10` (`20 -> 30`, `19 -> 29`) + `2x Base Weapon Damage Dice` + `Weapon/Elemental Critical Effect`. Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3`, `4`) converts the rolled dice into a flat `-10` (`Base Score - 10`) + `Situational Complication`.
* **Character Point (CP) Economy:** `150 CP` starting Operator budget divided into an **80-CP Archetype Chassis** (`15 CP` Primary Attribute at `+3`, `10 CP` Secondary Attribute at `+2`, `24 CP` for 4 Essential Skills at Rank 6, `18 CP` for 6 Supporting Skills at Rank 3, and `13 CP` for 2 Signature Traits at `1 CP` each plus 3 Recommended Core Features at `9 CP`) and a **70-CP Customization Budget**.
* **Background Skill Ranks:** `60 Background Skill Ranks` allocated at `0 CP` as `20 SP Faction` + `20 SP Origin` + `20 SP Occupation`, alongside `4 Recommended Features` (`-1 CP` discount: `2 CP` instead of `3 CP`, minimum `1 CP`) and `4 Traits` at `0 CP` (`Extra Traits = 1 CP` each).
* **Universal Straight Pricing:** `+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, and `1 CP` per `1` Skill Rank (`5 CP` per `5` Skill Ranks) across all creation, species, companion, and bestiary packages.
* **Vitality, Health & Structure Pools (Zero Stamina Scaling):** Biological characters start with **Base 30 Vitality** and **Base 30 Health**; Synthetic/Construct entities combine both into **Base 60 Structure Points (SP)**. Pools scale strictly at **`+5 points per 1 CP`** spent (Suggested Max: `60` each / `120 SP`; **NEVER scaled by Stamina**). Stamina Modifier subtracts point-for-point from incoming damage as **Base Toughness** after Armor DR (`Diminishing Returns Armor Stacking`: use the single highest DR across bio, cyber, and worn armor, plus `+1 DR` per stage of 5 [`0 = +0`, `1–5 = +1`, `6–10 = +2`, `11–15 = +3`, etc.] calculated separately for each additional layer).
* **Personal Hindrance Cap:** Standard personal character hindrances have a `+10 CP` maximum limit; **Species-level hindrances and cybernetic Stigmas do NOT count toward the 10-point standard hindrance limit**.
* **Economic Unified Field Theory (EUFT) & UDU Hierarchy:** Base 5-CR intervals follow `Value (Credits) = 10 * 4^(CR / 5)` modified by Linear Micro-Modifiers (`+1 CR = x1.30`, `+2 CR = x1.75`, `+3 CR = x2.30`, `+4 CR = x3.00`, `-1 CR Flaw = x0.75`). Pristine crafting materials cost `50%` of Credit Value; Scavenged Scrap retains `10%` value (`5x Item Credit Value` in unrefined scrap mass). UDU capacity scales at `10 Usable Nodes (Tier 0) = 1 Socket (Tier 1)`, `10 Sockets = 1 Mount (Tier 2)`, and `10 Mounts = 1 Module (Tier 3)` (`Garaging: 1 Mount = 1 Scale Multiplier`; vehicle table SP is pre-calculated).

## Part I — Alignment & Summary Matrix Table

| Section / Subsystem | Canonical Reference | Core Mathematical Formula / Invariant |
| :--- | :--- | :--- |
| **1. Tangent Standard Curve** | `02 ECONOMY AND WEALTH.md` | `Value (Cr) = 10 * 4^(CR / 5)` (`x4` value multiplier per `+5 CR` tier step) |
| **2. Linear Micro-Modifiers** | `02.Economy.UnifiedFieldTheory.md` | `+1 CR = x1.30`, `+2 CR = x1.75`, `+3 CR = x2.30`, `+4 CR = x3.00`, `-1 Flaw = x0.75` |
| **3. Wealth Score & Gap Rule** | `02 ECONOMY AND WEALTH.md` | Auto-buy when `Item CR <= WS`; `Liquidity Gap = Value(Item CR) - Value(WS)` |
| **4. Material & Fence Ratios** | `02.Economy.UnifiedFieldTheory.md` | Pristine Materials = `50%` Value; Scrap = `10%` (`5x` mass); Fence Rate = `50%` Legal / `20–25%` Black Market |
| **5. Interstellar Trade** | `02.Economy.InterstellarTrade.md` | `Daily PP = (Craft Check - 10) * Tool Mult * Crew`; Speculative Cargo & UDU Freight |

## Part II — Complete Unabridged Profiles & Rules Entries

## **1. Introduction: The Economic Dissonance in Roleplaying Games**

In the architecture of tabletop roleplaying games (TTRPGs), particularly those spanning the ambitious breadth of Science Fiction and Fantasy (SciFi-Fantasy), the economic subsystem often suffers from a critical narrative-mechanical dissonance. Game Masters and players frequently encounter a jarring reality: the rules governing the creation of an item (Crafting) and the rules governing the acquisition of that item via currency (Purchasing) appear to exist in separate universes. A plasma rifle might require a legendary feat of engineering to construct in a workshop, yet be available in a local market for the price of a few rations; conversely, a simple durability modification might cost a king's ransom in credits while requiring only a trivial skill check to weld onto a chassis.

This document establishes a **Unified Economic Field Theory (EUFT)** for the **Tangent** RPG system. The objective is to create a seamless, bidirectional mathematical bridge between **Complexity** (represented by the **Challenge Rating [CR]** of crafting), **Value** (represented by liquid **Credits**), and **Buying Power** (represented by an abstract **Wealth Score [WS]**).

The following analysis synthesizes a broad spectrum of RPG mechanics—from the granular accounting of *Pathfinder 2e* and *Traveller* to the abstract wealth systems of *Modern Tabletop Systems*, *Mutants & Masterminds*, and *Rogue Trader*—to propose a bespoke algorithmic solution for Tangent. This framework accommodates the technological stratification of the setting, scaling effortlessly from Stone Age (TL 0) primitives to Galactic Age (TL 5) post-scarcity entities, without collapsing under the weight of exponential inflation or spreadsheet bookkeeping.

### **2. Theoretical Framework: The Valuation Vector**

To ensure Crafting CR directly correlates to item value, we abandon the traditional design paradigm of assigning arbitrary prices based on perceived combat utility (the "Game Balance" approach) in favor of a "Simulationist Complexity" approach. In the Tangent universe, the cost of an object is a direct function of the difficulty required to manipulate matter and energy into that specific configuration.

* **The Failure of Linear Scaling:** A linear relationship (`Value = CR * 100`) fails to capture the economic reality of a multi-tier technological universe. If a `CR 10` pistol costs `1,000 Credits`, a `CR 40` starship component would cost `4,000 Credits`—an absurdity that allows a street-level mercenary to buy a battlecruiser after looting four riflemen.
* **The Tangent Standard Curve (TSC):** Through stress-testing RPG economies, we establish a **Base-4 Exponential Scaling per 5 CR** (`Value = 10 * 4^(CR / 5)`). Every `+5` increase in Challenge Rating represents a full **Tier Step** in complexity, multiplying the economic value of the asset by **4x**.

### **The Tangent Standard Curve (TSC)**

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, cost scaling in the Tangent universe must be exponential. The market price of every physical asset within the Tangent galaxy is generated using the **Tangent Standard Curve (TSC)** formula:

Value (Credits) = 10 * 4 ^ (CR / 5)

This formula dictates that an item's value in Credits equals a baseline value of **10 Credits** (representing the simplest manufactured good or raw scrap metal at **CR 0**) multiplied by a growth factor of **4**, raised to the power of the item's **Crafting Challenge Rating (CR) divided by 5**. The growth factor of 4 ensures that value inherently quadruples across every tier interval of `+5 CR`.

By strictly adhering to this calculation, arbitrary pricing debates are eliminated. This mathematical rigidity allows Architects to value any new, homebrew, or precursor artifact instantly simply by assigning it a Crafting CR based on its operational complexity.

#### **The Master Valuation Table**

| Craft CR | Complexity | Value (Credits) | Examples (Sci-Fi / Fantasy) |
| :---: | :---: | :---: | :--- |
| **0** | **Scrap** | **10 Cr** | Raw ore, ration bar, wooden club. |
| **5** | **Simple** | **40 Cr** | Knife, backpack, basic clothing, bandages. |
| **10** | **Standard** | **160 Cr** | Pistol, sword, light armor, commlink. |
| **15** | **Advanced** | **640 Cr** | Rifle, plate mail, medkit, hacking tool. |
| **20** | **Expert** | **2,560 Cr** | Plasma weapon, full environmental suit, masterwork gear. |
| **25** | **Master** | **10,240 Cr** | Cybernetic limb, hoverbike, magic ring, heavy weapon. |
| **30** | **Grandmaster** | **40,960 Cr** | Power armor, golem, personal shuttle, rare artifact. |
| **35** | **Heroic** | **163,840 Cr** | AI Core, fighter jet, small starship hull. |
| **40** | **Legendary** | **655,360 Cr** | Corvette-class ship, legendary artifact, fortress. |
| **45** | **Mythic** | **2,621,440 Cr** | Frigate, resurrection chamber, moon base module. |
| **50** | **Transcendent** | **10,485,760 Cr (~10.5 MCr)** | Dreadnought, planetary shield generator. |

#### **The Micro-Modifier Valuation Rule (Linear Multipliers for `+1` to `+4` CR)**

The exponential formula `Value = 10 * 4 ^ (CR / 5)` is strictly used for Base Chassis and Items at integer intervals of 5 (`CR 0, 5, 10, 15, 20`). When applying minor upgrades (Sockets, Frame modifiers, Flaws, or Faction Skins) that add or subtract **1 to 4 points** to the final CR, do **not** calculate fractional exponents at the table. Instead, multiply the Base Credit Value by the corresponding flat **Linear Micro-Modifier Multiplier**:

* **`+1 CR` Upgrade:** Multiply Base Value by **`x1.3` (+30%)**
* **`+2 CR` Upgrade:** Multiply Base Value by **`x1.75` (+75%)**
* **`+3 CR` Upgrade:** Multiply Base Value by **`x2.3` (+130%)**
* **`+4 CR` Upgrade:** Multiply Base Value by **`x3.0` (+200%)**
* **`-1 CR` Flaw:** Multiply Base Value by **`x0.75` (-25%)**

### **Wealth Score and Purchasing Power**

Character economic power is quantified by the **Wealth Score (WS)**—a static rating of economic leverage representing credit rating, active investments, salary, prestige, and social capital. While the *Augmentations Matrix* utilizes Character Points (CP) for biological tolerance, the *Equipment Matrix* utilizes Wealth Score for material acquisition, translating a character's background and CP investment into extrinsic economic power.

* **The Golden Rule of Tangent Wealth:** A character may automatically purchase any personal-use item with a Crafting CR equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score (`Purchase CR = Crafting CR`).

#### **Starting Wealth Score Calculation**

Composite score summing a character's income, prestige, credit, and savings, determined at creation by adding one choice from each background category plus Vocation skill bonuses:

Starting Wealth Score (WS) = Occupation Base + Origin Modifier + Faction Modifier + Tech Level Modifier + Vocation Skill Bonus

| Occupation | Wealth Base | Occupation | Wealth Base |
| :--- | :---: | :--- | :---: |
| **Adept** | 4 | **Merchant** | 5 |
| **Agent** | 2 | **Representative** | 6 |
| **Builder** | 3 | **Scholar** | 3 |
| **Citizen** | 2 | **Scout** | 1 |
| **Criminal** | 4 | **Soldier** | 1 |
| **Drifter** | 1 | **Specialist** | 3 |
| **Entertainer** | 5 | | |

| Origin | Modifier | Origin | Modifier |
| :--- | :---: | :--- | :---: |
| **Agricultural** | +0 | **Industrial** | +2 |
| **Aquatic** | +1 | **Leisure** | +3 |
| **Colony** | +0 | **Militaristic** | +0 |
| **Enlightened** | +2 | **Research** | +2 |
| **Hostile** | +0 | **Spacer** | +1 |
| **Urban** | +1 | **Others / Custom** | +0 to +3 |

| Faction | Modifier | Faction | Modifier |
| :--- | :---: | :--- | :---: |
| **Alterian Enclave** | +3 | **Impyrium Dominion** | +3 |
| **Auluran / Kitin** | +2 | **Radiant Impyrium** | +5 |
| **Ascendancy** | +4 *(3–4)* | **Mekan Collective** | +6 *(Special)* |
| **Coalition** | +0 | **Syndicate** | +4 |
| **Dracon Dynasty** | +2 | **Outworlds / Independent** | +0 |
| **Entari Combine** | +3 | **Others / Custom** | +0 to +3 |

| Tech Level (TL) | Era | Wealth Modifier |
| :---: | :--- | :---: |
| **TL 0** | Stone Age (Primitive) | -4 |
| **TL 1** | Metal Age (Industrial) | -2 |
| **TL 2** | Data Age (Digital) | +0 |
| **TL 3** | Space Age (Stellar Baseline) | +2 |
| **TL 4** | Stellar Age (Enhanced) | +4 |
| **TL 5** | Galactic Age (Advanced) | +8 |

#### **Skill Ranks in Trade & Vocations**

* **Primary Vocation Skill:** Bonus of **+1 WS per Skill Stage** of the primary **Vocation** skill actively practiced to earn money.
* **Associated Trade Skills:** One additional supporting skill at **Rank 6+ (Trained)** may be counted to aid in trade per Ranking Stage of the Primary Vocation skill, granting **+1 WS per associated skill**.

| Skill Ranking Stage | Wealth Bonus |
| :--- | :---: |
| **Novice (`Ranks 1–5`)** | **+1 WS** |
| **Trained (`Ranks 6–10`)** | **+2 WS** |
| **Expert (`Ranks 11–15`)** | **+3 WS** |
| **Master (`Ranks 16–19`)** | **+4 WS** |
| **Pinnacle (`Rank 20+`)** | **+5 WS** |

* **Expression (Performance) Skills:** When practiced professionally, grant **double (`x2`)** the listed stage bonuses.
* **Knowledge (Medicine) Skill:** Used as a Practicing Physician grants **double (`x2`)** the typical bonus (and **triple [`x3`] or more** in high-demand frontier or crisis sectors).
* **Piloting, Combat Skills, and Others:** May also be used like Vocation skills if regular mercenary, security, or transport employment is maintained—paying standard (`x1`) to double (`x2`) depending on trade hazard.
* **Metafocus Discipline Skills:** Generally a high-value commodity paying **double (`x2`)** the listed stage bonuses.
* *Adjustments to Wealth Bonus should be made for any skills the character is paid to practice that require specialized training. Menial or untrained workers receive the base pay of their society's Middle Class for practicing a trade, with reduced pay for lower castes and impoverished classes.*

#### **Expanded Financial Status Hierarchy**

| Wealth Status | Auto-Buy Limit | Lifestyle Description |
| :--- | :---: | :--- |
| **0 (Indebted)** | 0 Cr | Debt slavery or prison. Zero assets. |
| **1 – 4 (Impoverished)** | 10 – 30 Cr | Homeless / Squatter. Scavenges for food and scrap. |
| **5 – 9 (Struggling)** | 40 – 150 Cr | Shared room in slum. Public transit; processed rations. |
| **10 – 14 (Middle Class)** | 160 – 600 Cr | Private apartment, steady wage. Consumer vehicle. |
| **15 – 19 (Affluent)** | 640 – 2,500 Cr | High-end condo. Quality personal vehicle. |
| **20 – 29 (Wealthy)** | 2,500 – 40,000 Cr | Large estate, servants. Minor corporate investor. |
| **30 – 39 (Hegemon)** | 41K – 650K Cr | Skyscraper penthouse. Owns small corporation and private shuttle. |
| **40 – 49 (Industrialist)** | 650K – 10M Cr | Megacorp executive. Owns starships (Corvettes). |
| **50 – 59 (Dynastic)** | 10M – 167M Cr | Minor nobility or Megacorp CEO. Owns space stations and private fleets. |
| **60 – 69 (System Lord)** | 167M – 2.6B Cr | Rules a solar system. Owns capital ships (Cruisers). |
| **70 – 79 (Sector Ruler)** | 2.6B – 42B Cr | Rules a stellar cluster. Personal flagship is a Dreadnought. |
| **80+ (Faction Ruler)** | 42B+ Cr | Sovereign Emperor. Economy is post-scarcity; builds Dyson-scale megastructures. |

### **The Liquidity Gap and Friction Mechanics**

A common failure point in abstract wealth systems is the "infinite money loop," where players attempt to use their passive Wealth Score to acquire high-value items for free and immediately resell them for infinite cash. Tangent mitigates this via strict friction mechanics, ensuring "Loot" (liquid Credits) remains a vital gameplay reward at all tiers.

#### **1. The Liquidity Constraint (The Gap Rule & Wealth Check Financing)**

When a character seeks an item with a Crafting CR exceeding their Wealth Score, their passive income cannot automatically cover the full transaction. The difference is the **Liquidity Gap**, calculated by subtracting the Credit value of the character's Wealth Score from the Credit value of the desired item's CR:

Liquidity Gap (Credits) = Value(Item CR) - Value(Character Wealth Score)

To acquire the item, the character may either:

1. **Roll a Wealth Check (`2d10 + WS` vs. Item Cost CR):** On a successful Wealth Check, the character purchases the item on credit, **incurring a Debt of the Liquidity Gap difference** to be paid off on the next financial cycle (month, pay schedule, or mission cycle). When the character's wealth rolls over, they normally pay off the debt (or part of it), unless an issue arises—in which case the unpaid debt remains with delinquent repercussions (`-2 WS` delinquent debt penalty, interest accrual, or creditor enforcement).
2. **Pay Liquid Credits Directly:** Pay the Liquidity Gap difference directly from liquid Credits with zero debt incurred.

* *Example:* If an Affluent character (**WS 15**, Purchasing Power `640 Cr`) wishes to purchase an advanced Stealth Suit (**CR 18**, Value `~1,470 Cr`), the character applies their WS 15 leverage to cover the base `640 Cr`, leaving a **Liquidity Gap of `830 Credits`** that is either paid in liquid cash or financed as a cycle debt via a successful **CR 18 Wealth Check**.

#### **2. Liquidity Drag (The Fence Rate) & The Crafting Material Ratio**

To further prevent market abuse, the economy imposes **Liquidity Drag**. In real-world economics and RPG simulations, the "Buy" price and "Sell" price are never identical due to fencing effort, market saturation, and legality. The Sell Price of an item is heavily reduced:

* **Legal Goods:** Sell at **50%** of Total Value *(up to 60%+ with specialized Merchant abilities)*.
* **Black Market or Stolen Goods:** Sell at **20% to 25%** of Total Value.
* **Scrap:** Sells at **10%** of Total Value.

**The Crafting Material Ratio (`50% Pristine` vs. `10% Scrap`):**
* **Purchased Pristine Materials (`50%` Value):** Buying the pristine raw materials required to craft an item costs exactly **50% of the item's Total Credit Value**. Because legal goods also sell at 50% of Total Value, a character who buys materials and crafts an item for immediate resale operates at a **0% profit margin**. Profit is only possible through adventuring, scavenging materials for free, or utilizing specialized merchant skills.
* **Scavenged Scrap Materials (`10%` Value / `5x` Mass Requirement):** Unrefined scavenged scrap holds only **10% of its original Credit Value**. Therefore, to craft an item purely from scavenged scrap without paying cash for pristine materials, the crafter must refine **5 times (`5x`) the item's Total Credit Value in unrefined scrap mass** (`10% of 5x = 50% material requirement`; e.g., building a `1,000 Cr` rifle from scrap requires `5,000 Cr` worth of unrefined battlefield salvage).

## **The Productivity Engine and Macro-Economics**

Because the Tangent Standard Curve dictates that value scales exponentially, a linear crafting system (e.g., generating 50 credits of value per day) would require literal centuries to build high-end assets, ending campaigns before items are finished. Tangent solves the "Time vs. Cost" paradox through the **Productivity Engine**, converting effort into **Productivity Points (PP)**.

### **The Productivity Formula**

To craft an item, the creator must accumulate a **Target PP** equal exactly to the item's **Credit Value**. Daily progress is generated based on the crafter's skill variance and the tier of their infrastructure:

Daily Progress (PP) = (Craft Check Result - 10) * Tool Tier Multiplier * Crew Size

The **Tool Tier Multiplier** is the critical variable that allows construction timelines to scale exponentially alongside item value:

* **Tier 0 (Improvised):** `x1 Multiplier` — Bare hands, stone tools, field expedient repairs.
* **Tier 1 (Basic):** `x10 Multiplier` — Handheld power tools, garage kit, basic smithy.
* **Tier 2 (Advanced):** `x50 Multiplier` — Professional machine shop, shipboard engineering bay, alchemist lab.
* **Tier 3 (Industrial):** `x200 Multiplier` — Automated factory lines, major ritual circle *(Requires minimum 10-worker Labor Pool; solitary crafter daily PP is capped at `Vocation Skill Rank * 100`)*.
* **Tier 4 (Nanoforge):** `x1,000 Multiplier` — Molecular assembly swarms.
* **Bio (Cultivation):** `x1,000 Multiplier` — Hyper-Growth Vats (Auluran/Kitin) where items are grown in accelerated nutrient tanks *(Requires `Knowledge [Medicine / Nature]` and `Vocation [Engineer]` checks)*.
* **Tier 5 (Genesis):** `x5,000 Multiplier` — Thought-responsive Polymatter loom, Holophotonics, or Wish-level metaphysical fabrication *(Requires minimum 100-worker Labor Pool or sovereign infrastructure)*.

Under this engine, a Mastercraft Titan Mech Suit (**CR 30**, Target PP = `40,960`) would take a hobbyist with Basic Tools (`x10`, check 20 = `100 PP/day`) **409.6 days** to build. However, an advanced engineer utilizing a Nanoforge (`x1,000`, check 40 = `30,000 PP/day`) can materialize the identical Mech Suit in **1.4 days**.

### **Macro-Scale Construction and Faction Labor Pools**

For astronomical projects like a **Dreadnought** (**CR 50**, Value `~10.5 Million Cr`) or a **Titanic Arcology** (**CR 60+**, Value `~167 Million Cr`), individual crafting is physically impossible. Factions utilize **Labor Pools** to execute macro-scale construction, where total Daily PP output is the sum of individual workers:

* A shipyard employing **1,000 engineers** (average Craft check 15) operating **Industrial (`x200`)** tools generates `1,000 * [(15 - 10) * 200] = 1,000,000 PP per day`, completing a CR 50 capital ship in roughly **10.5 days**.
* This macro-economic logic drives factional warfare: maintaining these shipyards requires an uninterrupted flow of massive liquid capital (**5.25 Million Cr** in raw materials per Dreadnought), forcing factions to fight for territorial resources to keep their production engines fed.

## **9. Conclusion**

The Tangent Economic Matrix succeeds by establishing a rigid, deterministic mathematical backbone (`Value = f(CR)`) while providing flexible gameplay interfaces (**Wealth Score** for lifestyle and standard gear, **Credits** for loot and gap financing):

* **Crafting CR** is the prime mover of the material economy: it dictates **Value**.
* **Value** dictates the **Time (`Target PP`)** required to build and the **Wealth (`WS`)** required to buy.
* **Character Points (`CP`)** and **Vocation Skills** allow players to invest in this system, gaining exponential returns on Purchasing Power that parallel the exponential returns of Combat and Metaphysical power across campaign tiers.

This unified architecture avoids linear crafting bottlenecks, closes infinite-money resale loops, and scales seamlessly from street-level scavenging to Dyson-scale empire building.

## **10. Action: Retrofit Directive for Item Entries**

**Critical Rule:** Every item Stat Block across the Codex MUST include both a **Wealth Score / Crafting CR** and a **Credit Value (`Cr`)**.

### **The Base Value & Liquidity Gap Formulas**

All items lacking a specific credit value are calculated using the Tangent Standard Curve based on Crafting CR:

Base Value (Credits)    = 10 * 4 ^ (Base CR / 5)
Micro-Modifier Value    = Base Value * Multiplier (+1 CR = x1.3 | +2 CR = x1.75 | +3 CR = x2.3 | +4 CR = x3.0 | -1 CR = x0.75)
Cash Cost (Liquidity)   = Item Credit Value - Value(Player's Wealth Score Tier)

## **Addendum: Quick Reference Formulas**

* **Base Item Value (`Cr`):** `10 * 4 ^ (CR / 5)`
* **Linear Micro-Modifiers (`+1` to `+4` CR):** `+1 CR = x1.3 (+30%)` | `+2 CR = x1.75 (+75%)` | `+3 CR = x2.3 (+130%)` | `+4 CR = x3.0 (+200%)` | `-1 CR Flaw = x0.75 (-25%)`
* **Pristine Material Cost:** `50%` of Item Credit Value
* **Scavenged Scrap Ratio:** Scrap holds `10%` value (requires **`5x` Item Credit Value** in unrefined scrap mass to meet the `50%` material requirement)
* **Crafting Time (`Days`):** `Item Credit Value / [(Craft Check Result - 10) * Tool Tier Multiplier * Crew Size]`
* **Liquidity Gap (`Cash / Financed Debt`):** `Cost = Value(Item CR) - Value(Character WS)`
* **Permanent WS Increase Cost:** `Value(Target WS) - Value(Current WS)`

# **ARCHITECT ECONOMY DIRECTORY INDEX**

Detailed interstellar trade mechanics and the complete Tangent Economic Unified Field Theory (EUFT) design protocol are organized in the `./economy/` directory:

* **[Interstellar Trade & Mercantile Framework](./economy/02.Economy.InterstellarTrade.md)** — *Trade Classifications & Planetary Codes, Cluster Theory, Commodities & Exchange Matrix, Speculative Cargo Procedure, Gray/Black Markets, and UDU Cargo Capacity*
* **[Tangent Economic Unified Field Theory (EUFT Protocol)](./economy/02.Economy.UnifiedFieldTheory.md)** — *Valuation Vector, Tangent Standard Curve, Micro-Modifier Multipliers, Extended Financial Status Hierarchy, Liquidity Gap/Drag, Crafting Engine, UDU Hierarchy, Macro-Economics, and Stress Testing*

## Part III — Discrepancy & Restoration Ledger

* **DISC-109 (Bottom-Half Restoration of 02 ECONOMY AND WEALTH.md):** Restored the truncated bottom half from `/game rules` (`1mwgC0IyCIO9yyt1p4efKahgvGDllUtgB`) and `02 ECONOMY AND WEALTH` (`1Lig_qGsgKG3jaWyaMXaAVVzM4H_wO4zjHFek_Zd52mQ`), including Macro-Scale Construction & Faction Labor Pools, Section 9 (`Conclusion`), Section 10 (`Action: Retrofit Directive for Item Entries`), the `Addendum: Quick Reference Formulas`, and the `ARCHITECT ECONOMY DIRECTORY INDEX`.
* **DISC-110 (EUFT Audit Retrofits):** Integrated the Linear Micro-Modifier Multipliers (`+1 CR = x1.3`, `+2 CR = x1.75`, `+3 CR = x2.3`, `+4 CR = x3.0`, `-1 CR = x0.75`) and the `50% Pristine` vs. `10% Scrap` (`5x` unrefined scrap mass) Crafting Material Ratio across both `02 ECONOMY AND WEALTH.md` and `02.Economy.UnifiedFieldTheory.md`.
* **DISC-111 (Nomenclature & LaTeX Normalization):** Replaced all legacy `CR` with `CR`, `CP` with `CP`, `Intelligence` with `Intellect`, `Deception` with `Bluff`, and stripped all LaTeX `	imes` / `
rac` markup.

