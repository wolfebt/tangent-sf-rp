---
id: "doc-operator-2-00-economatrix"
name: "2.00 ECONOMATRIX"
fileName: "2.00 ECONOMATRIX.md"
relPath: "operator/2.00 ECONOMATRIX.md"
isMasterDoc: true
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 205
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","2.00 economatrix","mechanics"]
updatedAt: "2026-10-14T05:53:10.306Z"
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

# **2.00 ECONOMATRIX: TANGENT ECONOMIC UNIFIED FIELD THEORY (EUFT)**

**A Design Protocol and Operational Guide for the Tangent SciFi Fantasy RPG**

---

## **1. The Economic Dissonance in Roleplaying Games**

The design of economic systems within tabletop roleplaying games (RPGs) has historically suffered from a fundamental fracture between narrative ambition and mechanical execution. In the context of the Tangent SciFi Fantasy RPG, the objective is to synthesize a coherent economic engine that unifies character creation resources (Character Points or CP), abstract purchasing power (Wealth Score), liquid currency (Credits), and the mechanics of creation (Crafting DC). This unification is not merely an aesthetic choice but a structural necessity to prevent the "economic dissonance" that plagues legacy systems.

Economic dissonance arises when the different currencies of a game—time, experience, gold, and crafting effort—fail to exchange at consistent rates. In legacy fantasy systems, for example, the cost to craft an item is derived from its market price, often assigned arbitrarily by designers based on utility rather than complexity. This leads to ludonarrative failures where a high-level adventurer can slay a dragon in six seconds but requires years to forge a suit of armor that is statistically necessary for their survival. Conversely, systems that utilize abstract Wealth Scores to streamline bookkeeping often struggle to integrate the tactile rewards of "loot" that drive player motivation in exploratory and dungeon-crawling scenarios.

This framework establishes a singular, mathematically rigorous solution: **The Tangent Economic Matrix**. By establishing the Crafting Difficulty Class (DC) as the "Prime Mover" of the economy, we ensure that the value of an object is a direct, non-arbitrary derivative of the complexity required to create it. This approach aligns the simulationist desire for a logical world (harder things cost more) with the gamist need for balanced progression (investment in CP yields proportional economic power).

---

## **2. Theoretical Framework: The Valuation Vector**

To ensure Crafting DC directly correlates to item value, Tangent posits that **Complexity Determines Value**. The market price of an item is simply the societal aggregate of the skill (DC) and infrastructure required to produce it.

### **2.1 The Failure of Linear Scaling**
In legacy systems, a recurring failure point is linear or shallow geometric scaling. In heroic fantasy, a +1 sword costs 2,000 gp and a +2 sword costs 8,000 gp ($Bonus^2 \times 1,000$). While functional for narrow fantasy, this curve breaks down in SciFi environments. The difference in complexity between a handgun and a starship is not quadratic; it is logarithmic. A starship is not just a larger firearm; it represents orders-of-magnitude leaps in engineering difficulty, life-support metallurgy, and power generation.

If linear or shallow curves are applied to a SciFi setting, players accumulate personal wealth that trivializes planetary economies, or starship prices become so astronomical that personal gear becomes mathematically irrelevant.

### **2.2 The Tangent Standard Curve (TSC)**
To encompass the breadth of the Tangent setting—ranging from basic survival gear to orbital megastructures—the relationship between Crafting DC and Value must be exponential. We define the Tangent Standard Curve (TSC) via the function:

$$V = V_{\text{base}} \times \beta^{\frac{\text{DC} - \text{DC}_{\text{base}}}{S}}$$

Where:
* $V$ is the Market Value in Credits.
* $V_{\text{base}}$ is the baseline value of the simplest manufactured good or scrap metal (DC 0) = **10 Credits**.
* $\beta$ is the Growth Factor = **4** (value quadruples across every tier).
* $S$ is the Scale Interval = **5 DC** (every +5 DC increment).

The simplified canonical formula is:

$$\mathbf{\text{Value (Credits)}} = 10 \times 4^{(\text{DC} / 5)}$$

This curve ensures that small increases in difficulty (representing technological breakthroughs or magical tiers) result in predictable, exponential increases in value.

```
DC  0 (Scrap)        : 10 Credits
DC  5 (Simple)       : 40 Credits
DC 10 (Standard)     : 160 Credits
DC 15 (Advanced)     : 640 Credits
DC 20 (Expert)       : 2,560 Credits
DC 25 (Master)       : 10,240 Credits
DC 30 (Grandmaster)  : 40,960 Credits
DC 35 (Heroic)       : 163,840 Credits
DC 40 (Legendary)    : 655,360 Credits
DC 45 (Mythic)       : 2,621,440 Credits
DC 50 (Transcendent) : 10,485,760 Credits (~10.5 MCr)
```

### **2.3 The Coherence of DC-Derived Pricing**
By strictly adhering to this calculation, all pricing debates are eliminated. A Game Master values any new, homebrew, or precursor artifact instantly simply by assigning it a Crafting DC based on its operational complexity:
* **Ballistic Rifle (DC 15):** Standard machining. $\text{Value} = 10 \times 4^{(15/5)} = 640\text{ Credits}$.
* **Plasma Rifle (DC 20):** Advanced energy physics, containment magnetic coil. $\text{Value} = 10 \times 4^{(20/5)} = 2,560\text{ Credits}$.

The Plasma Rifle is inherently 4 times more valuable because it is one distinct tier (+5 DC) harder to manufacture.

---

## **3. The Wealth Matrix: Integrating Character Points and Status**

The Wealth Matrix serves as the translation layer between a character’s intrinsic potential (Character Points) and their extrinsic economic leverage (Wealth Score). Wealth Score (WS) is not a consumable pool of points to be depleted, but a static rating of economic leverage representing credit rating, active investments, salary, and social capital.

### **3.1 The Golden Rule of Tangent Wealth**

> **A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score.**

$$\mathbf{\text{Purchase DC} = \text{Crafting DC}}$$

This aligns the abstraction of "lifestyle" with the concrete math of item acquisition. If an operative is wealthy enough to possess an item, their passive income and credit lines absorb its upkeep and acquisition automatically.

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
* **Growth Formula:** To raise Wealth Score from $X$ to $X+1$, an operative must invest liquid Credits equal to the difference in value between the two tiers:
  $$\text{Investment Cost} = \text{Value}(WS_{X+1}) - \text{Value}(WS_X)$$
This provides a permanent endgame sink for adventuring capital, allowing characters to transition from mercenaries to sector hegemons.

---

## **4. The Liquid Interface: Credits and Friction Mechanics**

While Wealth Score handles macro-economic upkeep, lifestyle, and standard equipment, liquid **Credits** handle micro-economic transactions (loot, bribes, rare black-market curios, and gap purchasing).

### **4.1 The Liquidity Gap (The Gap Rule)**
A common failure point in abstract wealth systems is the "infinite money loop," where players auto-buy high-value gear and sell it for infinite liquid cash. Tangent eliminates this through two concrete mechanics:

**Rule 1: The Personal Use Limit**
Wealth Score covers items acquired for personal use or direct team operational needs. Bulk acquisition triggers an Administrative / Strain Check or requires specialized Merchant and Logistics credentials.

**Rule 2: The Liquidity Gap**
When a character desires an item with a Crafting DC higher than their Wealth Score, passive financial leverage cannot cover the transaction. They must bridge the difference with liquid Credits:

$$\mathbf{\text{Liquid Cost}} = \text{Value}(\text{Item DC}) - \text{Value}(\text{Character WS})$$

*Scenario:*
* Character: Wealth Score 15 (Purchasing Power: ~640 Cr).
* Target: Advanced Stealth Suit (Craft DC 18).
* Valuation: DC 15 = 640 Cr; DC 18 $\approx 10 \times 4^{(18/5)} \approx 1,470\text{ Cr}$.
* Cash Required: $1,470 - 640 = \mathbf{830\text{ Credits}}$.

The character uses their WS 15 leverage to cover the baseline lifestyle threshold, paying 830 Credits from savings to secure the item.

### **4.2 Liquidity Drag (The Fence Rate)**
To prevent market abuse, the economy imposes Liquidity Drag. The purchase price and resale price of goods are never identical:
* **Legal Goods:** Resell at **50%** of Total Value.
* **Black Market / Stolen Goods:** Resell at **20% – 25%** of Total Value.
* **Scrap / Salvage:** Resell at **10%** of Total Value.

Because raw materials required to fabricate an item also cost **50% of the item's Total Value**, an operative who purchases raw materials and crafts an item for immediate open-market resale operates at a **0% profit margin**. Profit is only possible through adventuring, scavenging raw materials for free (0 Cr cost), or utilizing specialized Merchant feats to elevate fence rates to 60%+.

---

## **5. The Crafting Engine: Complexity as Gameplay**

Because the Tangent Standard Curve dictates that value scales exponentially, a linear crafting system (e.g., generating 50 credits of value per day) would require centuries to build high-end assets. Tangent solves the "Time vs. Cost" paradox through the **Productivity Engine**, converting effort into **Productivity Points (PP)**.

### **5.1 The Productivity Formula**
* **Item Complexity (Target PP):** Equal to the item's Credit Value ($\text{Target PP} = \text{Value in Credits}$).
* **Crafter Daily Progress (PP):** Calculated from the crafter's Skill Check Result and the Tool Tier Multiplier:

$$\mathbf{\text{Daily Progress (PP)}} = (\text{Craft Check Result} - 10) \times \text{Tier Multiplier}$$

$$\mathbf{\text{Crafting Duration (Days)}} = \frac{\text{Target PP}}{\text{Daily Progress (PP)}}$$

#### **Table 5.1: Production Tool Tiers**
| Tier | Tools Required | Multiplier | Narrative Equivalent |
| :---: | :--- | :---: | :--- |
| **0** | **Improvised** | **x1** | Bare hands, stone tools, cave workshop. |
| **1** | **Basic** | **x10** | Garage kit, basic smithy, handheld power tools. |
| **2** | **Advanced** | **x50** | Professional machine shop, alchemist laboratory. |
| **3** | **Industrial** | **x200** | Automated factory line, major metaphysical circle. |
| **4** | **Nanoforge** | **x1,000** | Molecular assemblers, swarm fabrication vats. |
| **Bio** | **Cultivation** | **x1,000** | Hyper-Growth Vats (accelerated nutrient cloning). |
| **5** | **Genesis** | **x5,000** | Polymatter loom, holophotonics, wish-level fabrication. |

### **5.2 Solving the "Decades" Problem: Titan Mech Suit Example**
Target: Titan Mech Suit (Craft DC 30, Value = 40,960 Credits, Target PP = 40,960).
* **Scenario A (Hobbyist with Basic Tools):** Check Result 20, Tools Basic (x10).
  $$\text{Daily PP} = (20 - 10) \times 10 = 100\text{ PP/Day} \implies 40,960 / 100 = \mathbf{409.6\text{ Days}}$$
* **Scenario B (Master Engineer in Advanced Shop):** Check Result 35, Tools Advanced (x50).
  $$\text{Daily PP} = (35 - 10) \times 50 = 1,250\text{ PP/Day} \implies 40,960 / 1,250 \approx \mathbf{32.8\text{ Days}}$$
* **Scenario C (Apex Operative with Nanoforge):** Check Result 40, Tools Nanoforge (x1,000).
  $$\text{Daily PP} = (40 - 10) \times 1,000 = 30,000\text{ PP/Day} \implies 40,960 / 30,000 \approx \mathbf{1.36\text{ Days}}$$

### **5.3 Macro-Scale Construction and Faction Labor Pools**
For astronomical projects like a Dreadnought (DC 50, Value ~10.5 MCr) or a Titanic Arcology (DC 60, Value ~167 MCr), individual crafting is physically impossible. Factions utilize **Labor Pools**:
* A shipyard employs 1,000 engineers operating Industrial (x200) tools.
* Average engineering check: 15.
* Output per worker: $(15 - 10) \times 200 = 1,000\text{ PP/Day}$.
* Total Shipyard Output: $1,000 \times 1,000 = \mathbf{1,000,000\text{ PP/Day}}$.
* Construction Time for Dreadnought ($10,485,760\text{ PP}$): $10,485,760 / 1,000,000 \approx \mathbf{10.5\text{ Days}}$.

This macro-economic logic drives factional warfare: maintaining continuous shipyard production requires 5.25 Million Credits in raw materials every 10 days, forcing empires to secure territorial mining claims and trade conduits.

---

## **6. Comprehensive Reference Tables**

### **Table 6.1: The Master Valuation Table (DC to Credits)**

| Craft DC | Complexity | Value (Credits) | Examples (SciFi / Fantasy) |
| :---: | :--- | :---: | :--- |
| **0** | **Scrap** | 10 | Raw ore, ration bar, wooden club. |
| **5** | **Simple** | 40 | Combat knife, backpack, basic clothing, trauma bandage. |
| **10** | **Standard** | 160 | Ballistic pistol, vibro-sword, light armor, commlink. |
| **15** | **Advanced** | 640 | Assault rifle, plasteel armor, medkit, hacking deck. |
| **20** | **Expert** | 2,560 | Plasma rifle, sealed environmental suit, masterwork focus. |
| **25** | **Master** | 10,240 | Cybernetic limb, repulsor hoverbike, railgun, psi-amp. |
| **30** | **Grandmaster** | 40,960 | Titan power armor, tactical combat golem, personal shuttle. |
| **35** | **Heroic** | 163,840 | Sentient AI Core, aerospace fighter jet, starship hull module. |
| **40** | **Legendary** | 655,360 | Corvette-class starship, precursor artifact, fortress redoubt. |
| **45** | **Mythic** | 2,621,440 | Frigate-class warship, resurrection chamber, orbital drydock. |
| **50** | **Transcendent** | 10,485,760 | Dreadnought flagship, planetary shield generator grid. |
| **60** | **Precursor** | 167.7 MCr | Planetary terraformer, dark-matter stellar siphon. |
| **80** | **Megastructure**| 42.9 BCr | Dyson swarm cluster, orbital ringworld anchor. |

### **Table 6.2: Universal Displacement Unit (UDU) Hierarchy**

| Tier | Unit Name | Scale Context | Max Mass | Ratio / Capacity |
| :---: | :--- | :--- | :---: | :--- |
| **Tier 0** | **Node** | Augmentation / Micro Option | < 10 g | 10 Nodes = 1 Socket |
| **Tier 1** | **Socket** | Personal Base Unit (Guns, Decks) | < 1 kg | 10 Sockets = 1 Mount |
| **Tier 2** | **Mount** | Mecha / Heavy Vehicle Hardpoint | < 100 kg | 10 Mounts = 1 Module |
| **Tier 3** | **Module** | Capital Ship / Architecture Facility | < 10 Tons | Bulk installation / hangar |

---

## **7. Economy and Trade: Interstellar Mercantile Engine**

In the Tangent universe, economics is warfare by other means. Trade routes are the arteries of civilization, and commodities fuel the expansion of star-nations.

### **7.1 World Trade Classifications and Market Modifiers**

Planetary systems possess trade codes that influence local supply and demand:

| Code | Classification | Requirements (TWP) | Primary Exports | Market Modifiers & Opportunities |
| :---: | :--- | :--- | :--- | :--- |
| **Ag** | Agricultural | Atmos 4-9, Hydro 4-8, Pop 5-7 | Foodstuffs, Bio-matter, Timber | **Food:** -50% Cost. **Machinery:** +20% Cost. High demand for harvesters. |
| **As** | Asteroid | Size 0, Atmos 0, Hydro 0 | Ores, Crystals, Zero-G Alloys | **Minerals:** -40% Cost. **Food:** +50% Cost. Hungry for organics and luxuries. |
| **Ba** | Barren | Pop 0, Gov 0, Law 0 | Salvage, Precursor Artifacts | **All Goods:** Unavailable (scavenge only). High survival gear premium. |
| **De** | Desert | Hydro 0 | Silica, Solar Energy, Salt | **Water:** +100% Cost. Premium market for atmospheric condensers. |
| **Fl** | Fluid Oceans | Atmos 10+ (Exotic), Hydro 1+ | Chemical Compounds, Fuel | **Chems:** -30% Cost. **Machinery:** +20% Cost due to corrosive seas. |
| **Ga** | Garden | Size 5+, Atmos 4-9, Hydro 4-8 | Luxuries, Fine Art, Biologics | **Luxuries:** -20% Cost. High demand for exotic delicacies and prestige items. |
| **Hi** | High Population | Pop 9+ | Manufactured Goods, Electronics | **Manufactured:** -10% Cost. **Food:** +20% Cost. Consumes raw minerals. |
| **Ht** | High Tech | TL 4+ | Computers, Cybernetics, Ships | **High Tech:** -10% Cost. **Raw Mats:** +30% Cost for precision manufacturing. |
| **Ic** | Ice-Capped | Atmos 0-1, Hydro 1+ | Glacial Water, Superconductors | **Water:** Cheap. **Thermal Gear:** Premium. Exports heavy coolant. |
| **In** | Industrial | Atmos 0-2/4/7/9, Pop 9+ | Weapons, Vehicles, Modules | **Industrial:** -20% Cost. **Food:** +30% Cost. Massive resource appetite. |
| **Lo** | Low Population | Pop 1-3 | Raw Resources | **Manufactured:** +50% Cost (scarcity). Exports unrefined materials. |
| **Lt** | Low Tech | TL 2 or less | Handcrafted Curios, Raw Ore | **High Tech:** Unavailable or +200% Cost. Exports unique cultural items. |
| **Na** | Non-Agricultural| Arid or sterile soil | Synthetic Polymers, Ore | **Food:** +10% Cost. Dependent on imported nutrition paste. |
| **Ni** | Non-Industrial | Pop 4-6 | Unprocessed Minerals | **Manufactured:** +10% Cost. Service economies seeking luxury goods. |
| **Po** | Poor | Resource-depleted | Scrap, Manual Labor | **Labor:** Cheap. **All Manufactured:** +10% Cost. Desperate for medicine. |
| **Ri** | Rich / Mining | Economic powerhouse | Luxuries, Precious Metals | **Raw Mats:** -30% Cost. High disposable income; buys luxury art and tech. |
| **Va** | Vacuum | Atmos 0 | Isotopes, Vacuum Alloys | **Air/Water:** +100% Cost. Dependent on enclosed environmental support. |
| **Wa** | Water World | Hydro 10 | Seafood, Hydrogen, Deuterium | **Food:** -20% Cost. **Land Commodities (Metals/Wood):** +50% Cost. |

### **7.2 Trade Route Dynamics (The Cluster Loops)**
* **The Survival Loop ($\text{Ag} \leftrightarrow \text{In}$):** Industrial worlds manufacture harvesters; agricultural worlds feed factory workforces. Heavy patrols, low piracy, tight margins, high volume.
* **The Extraction Chain ($\text{As}/\text{Ri} \leftrightarrow \text{Ht}$):** Asteroids feed foundries with raw iridium; high-tech worlds return mining lasers and cybernetics. Moderate margins, high piracy threat.
* **The Life Support Run ($\text{Ic}/\text{Wa} \leftrightarrow \text{De}/\text{Va}$):** Moving water and hydrogen to arid colonies. Highly volatile; disruptions cause acute crises.

### **7.3 Commodities & Exchange Matrix**

Prices represent the galactic baseline average per metric ton:

| Category | Trade Good | Base Cost/Ton | Tangent Setting Context |
| :--- | :--- | :---: | :--- |
| **Essential** | **Foodstuffs** | 500 Cr | Bulk algae paste, Karkinos grains, dehydrated rations. |
| **Essential** | **Water (Ice)** | 250 Cr | Glacial bricks from Krias; critical for desert habs. |
| **Essential** | **Textiles** | 1,000 Cr | Synthetic ballistic polymers or Rakne spider-silk. |
| **Industrial**| **Polymers** | 4,000 Cr | Rapid-print resin and structural elastomers. |
| **Industrial**| **Chemicals** | 5,000 Cr | Industrial acids, fertilizer, refined liquid hydrogen. |
| **Industrial**| **Metals (Common)** | 7,000 Cr | Durasteel beams, structural copper, aluminum. |
| **Industrial**| **Metals (Rare)** | 25,000 Cr | Titanium, platinum, iridium for hyperdrive coils. |
| **Tech** | **Machinery** | 15,000 Cr | Mekan drill-heads, atmospheric scrubbers, turbine modules. |
| **Tech** | **Electronics** | 30,000 Cr | Sensor arrays, comms repeaters, Syndicate datapads. |
| **Tech** | **High Tech** | 50,000 Cr | Fusion reactor cores, grav-plates, Ascendancy psi-nodes. |
| **Luxury** | **Luxuries** | 100,000 Cr | Alterian sun-wine, rare spices, fine art, physical books. |
| **Luxury** | **Biologics** | 75,000 Cr | Auluran graft-seeds, cloned organs, exotic gene-lines. |
| **Restricted**| **Weaponry** | 40,000 Cr | Mil-spec mag-rail crates, vehicle ordnance, explosives. |
| **Restricted**| **Armor** | 35,000 Cr | Legionnaire plasteel plate, powered suit servos. |

### **7.4 Speculative Cargo Exchange Loop**

Operatives operating as independent traders execute a 4-step mercantile loop:
1. **Market Assessment (Appraisal Check):** An Intelligence + Appraisal check (DC 15) reveals price variances and temporary supply shocks in the sector.
2. **Acquisition (Purchase):** Cargo is purchased at the Source World, applying world trade modifiers (e.g. -50% for Food on Ag worlds) and Charisma negotiation checks (lowering costs by 5%–10%).
3. **Transport (Logistics):** Moving goods incurs operational fuel, docking fees, and crew maintenance (roughly 10% of cargo value per hyperlane jump), along with hazard encounter checks.
4. **Liquidation (Broker Check):** At the Destination World, the operative rolls Intelligence + Broker vs. Market DC 15:
   * *Critical Success (Natural 20 / Margin $\ge 10$):* Bidding war ensues; sell at **+50%** above market price.
   * *Success:* Sell at market price plus **10%–20%** profit margin.
   * *Failure:* Market saturation; sell at base market price (break even or minor loss after expenses).
   * *Critical Failure:* Tariff spike, embargo, or market collapse; sell at **-20%** net loss.

#### **Market Volatility Events (d6)**
* **1 — Blockade / Embargo:** Import/export halts; Essential goods and Weaponry triple in price (x3).
* **2 — Famine / Blight:** Agri-world collapse; Foodstuffs cost x5; Biologics demand spikes.
* **3 — Tech Boom:** Innovation spike; High Tech and Electronics prices drop by 50% (surplus).
* **4 — War Declaration:** Military mobilization; Metals, Weaponry, and Armor costs double (x2).
* **5 — Resource Discovery:** Mining rush; raw ore prices crash locally (-50%); Machinery demand surges.
* **6 — Trade Festival:** Free-trade charter; tariffs waived; +2 bonus to all Negotiation and Broker checks.

### **7.5 Gray and Black Markets**
On worlds with Law Level 6+, restricted contraband carries immense profit:
* **Combat Stims:** 20,000 Cr / kg (High demand on Industrial and war worlds).
* **Unshackled Sentient AI Cores:** 500,000 Cr / unit (Banned in Impyrium; prized by Syndicate).
* **Precursor Xeno-Relics:** Variable (Coveted by researchers; illicit under Coalition charters).
* **Smuggling Checks:** Pilot + Deception vs. Starport Security Sensor DC. Shielded cargo holds impose Disadvantage on security scans.

---

## **8. Stress Testing, Edge Cases, and Macro-Economics**

### **8.1 The "Infinite Wealth" Exploit**
A high-level party cannot flood a backwater settlement with 100 crafted Plasma Rifles. Every settlement has an Economic Absorption Limit based on its population and Wealth Score. Selling bulk assets requires a Mercantile DC that increases with volume:
* Sell 1 rifle: DC 10 (Routine local merchant).
* Sell 10 rifles: DC 20 (Requires corporate broker or regional military contractor).
* Sell 100 rifles: DC 40 (Requires interstellar syndicate or planetary defense ministry).

### **8.2 The Precursor Artifact Problem**
When characters uncover an alien artifact, the GM assigns its value using the Tangent Standard Curve based on its functional magnitude:
* Planetary Climate Stabilizer: DC 60 $\implies 10 \times 4^{(60/5)} \approx \mathbf{167.7\text{ Million Credits}}$.
Such assets cannot be liquidated at a typical market; finding a buyer with Hegemon or Dynastic status (WS 50+) forms an entire diplomatic, political, or heist campaign arc.

### **8.3 Party Wealth Pooling**
* **Liquid Credits:** Characters may freely pool liquid cash (loot) to purchase high-value assets.
* **Wealth Score:** Wealth Score is personal extrinsic leverage. Four Middle Class operatives (WS 10) cannot add their scores together to claim WS 40 status. To acquire high-DC assets, they must utilize the Liquidity Gap rule and pay the remaining cash cost from pooled savings.

---

## **9. Action Directive & Quick Reference Formulas**

* **Item Credit Value (Cr):** $10 \times 4^{(\text{DC} / 5)}$
* **Raw Material Cost:** $50\%$ of Market Credit Value
* **Daily Crafting Progress (PP):** $(\text{Skill Check} - 10) \times \text{Tool Multiplier}$
* **Crafting Duration (Days):** $\text{Target PP} / \text{Daily PP}$
* **Liquidity Gap (Cash Cost):** $\text{Item Value} - \text{Auto-Buy Limit}(\text{WS})$
* **Fence Rates:** Legal $50\%$, Black Market $20\%\text{--}25\%$, Scrap $10\%$
* **Wealth Advancement Cost:** $\text{Value}(WS_{\text{target}}) - \text{Value}(WS_{\text{current}})$

&nbsp;

---

---

# **ECONOMATRIX CATALOG DIRECTORY INDEX**

Detailed equipment, architecture, augmentation, armor, vehicle, and weapon modification catalogs are organized into modular documents in the `./economatrix/` directory:

* **[Architecture & Facilities](./economatrix/2.00.Architecture.md)** — *Residential, commercial, industrial, military, scientific, and exotic megastructures + Specialized Module Catalog*
* **[Armor & Protective Systems](./economatrix/2.00.Armor.md)** — *Light, Medium, Heavy, Superheavy, Powered Armor, Magi-Tech, Psi-Tech, and Polymatter/Holophotonic suits*
* **[Augmentations & Cybernetics](./economatrix/2.00.Augmentations.md)** — *Chassis node limits, fashionware, synth limbs, body/sensory/brain mods, TL4-TL5 enhancements, Full Body Conversion (FBC), and Pseudo-Cybernetics*
* **[General Equipment & Systems](./economatrix/2.00.Equipment.md)** — *Biotech/holographic gear, Computer Framework, Medical Framework, Surveillance & Communications, Survival Gear, and Vocation Tools*
* **[Mecha & Vehicles](./economatrix/2.00.Mecha.md)** — *Personal mobility, light/heavy vehicles, starfighters, and mechanized walkers/suits*
* **[Weapon Modifications](./economatrix/2.00.WeaponModifications.md)** — *Weapon upgrades, capacity enhancements, and tactical downgrades*

