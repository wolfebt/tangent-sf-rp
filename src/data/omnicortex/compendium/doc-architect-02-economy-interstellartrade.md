---
id: "doc-architect-02-economy-interstellartrade"
name: "02 Economy: Interstellar Trade & Commerce"
fileName: "02.Economy.InterstellarTrade.md"
relPath: "architect/economy/02.Economy.InterstellarTrade.md"
isMasterDoc: false
masterDocId: "doc-architect-02-economy-and-wealth"
category: "architect_matrix"
parent: "doc-architect-02-economy-and-wealth"
order: 3
perspective: "architect"
entry_type: "Economic Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","economy","02.economy.interstellartrade","matrix"]
updatedAt: "2026-10-14T06:04:05.815Z"
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

