---
id: "doc-architect-02-economy-interstellartrade"
name: "Economy: Interstellar Trade & Commerce"
fileName: "02.Economy.InterstellarTrade.md"
relPath: "architect/economy/02.Economy.InterstellarTrade.md"
isMasterDoc: false
masterDocId: "doc-architect-02-economy-and-wealth"
category: "architect_matrix"
parent: "doc-architect-02-economy-and-wealth"
order: 4
perspective: "architect"
entry_type: "Economic Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","economy","02.economy.interstellartrade","matrix"]
updatedAt: "2026-11-02T22:49:10.821Z"
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

# **02.01 INTERSTELLAR TRADE & MERCANTILE FRAMEWORK**

## **1. ECONOMIC FRAMEWORK: RESOURCES AND TRADE**

In the Tangent universe, economics is warfare by other means. Trade routes are the arteries of civilization, and commodities are the blood that fuels the expansion of empires. Whether moving legitimate freight for the Syndicate or smuggling Aether-dust through a Coalition blockade, the flow of goods defines the rise and fall of planetary powers.

This section provides the complete mechanics for planetary trade classifications, commodity exchange, speculative cargo trading, and the dangerous allure of the gray and black markets, underpinned by the **Tangent Economic Unified Field Theory (EUFT)**.

---

### **1.1. Trade Classifications and Codes**

Worlds are assigned classification tags (`99. MODULAR PLANETARY MATRIX.md`) that govern supply and demand, creating an interdependent web of commerce across star systems. A savvy trader knows that a world's classification is a roadmap to profit.

#### **1.1.1. World Codes & Market Modifiers**

| Code | Classification | Requirements (TWP Logic) | Primary Exports | Market Modifiers & Opportunities |
| :---: | :--- | :--- | :--- | :--- |
| **Ag** | **Agricultural** | Atmos 4–9, Hydro 4–8, Pop 5–7 | Foodstuffs, Textiles, Bio-matter, Timber | **Food:** `-50%` Cost. **Ind:** `+20%` Cost. High demand for Machinery and Tech to maintain automated harvesters. |
| **As** | **Asteroid** | Size 0, Atmos 0, Hydro 0 | Ores, Crystals, Zero-G Tech | **Minerals:** `-40%` Cost. **Food:** `+50%` Cost. Desperate for organics and luxury entertainment to combat isolation. |
| **Ba** | **Barren** | Pop 0, Gov 0, Law 0 | Salvage, Artifacts | **All Goods:** Unavailable (Scavenge only). High demand for Survival Gear among xeno-archaeologists. |
| **De** | **Desert** | Hydro 0 | Silica, Solar Energy, Artifacts, Salt | **Water:** `+100%` Cost. **Survival Gear:** Premium. Prime market for water-reclamation tech and cooling units. |
| **Fl** | **Fluid Oceans** | Atmos 10+ (Exotic), Hydro 1+ | Chemical Compounds, Fuel | **Chems:** `-30%` Cost. **Machinery:** `+20%` Cost. Corrosive atmosphere creates constant demand for replacement parts and alloys. |
| **Ga** | **Garden** | Size 5+, Atmos 4–9, Hydro 4–8 | Luxuries, Art, Biologicals | **Luxuries:** `-20%` Cost. **High Tech:** Standard. Hub for tourism; high demand for exotic foods and high-status items. |
| **Hi** | **High Pop** | Pop 9+ | Manufactured Goods, Information | **Manuf:** `-10%` Cost. **Food:** `+20%` Cost. Voracious appetite for raw materials and food; produces cheap consumer electronics. |
| **Ht** | **High Tech** | TL 4+ (Tangent Stellar/Galactic) | Computers, Medical, Cybernetics, Ships | **High Tech:** `-10%` Cost. **Raw Mats:** `+30%` Cost. Exports advanced weaponry and medical pods; imports rare minerals for manufacturing. |
| **Ic** | **Ice-Capped** | Atmos 0–1, Hydro 1+ | Water (Ice), Superconductors, Cryo-Tech | **Water:** Cheap (`-50%`). **Heat Gear:** Premium. Exports coolant and pure water; desperate for fusion cells and thermal insulation. |
| **In** | **Industrial** | Atmos 0–2/4/7/9, Pop 9+ | Weapons, Vehicles, Modules, Electronics | **Ind Goods:** `-20%` Cost. **Food:** `+30%` Cost. The forge of the sector; imports vast quantities of metal and workforce sustenance. |
| **Lo** | **Low Pop** | Pop 1–3 | Raw Materials | **All Manufactured:** `+50%` Cost (Scarcity). Dependent on trade for advanced tools; exports raw, unprocessed resources. |
| **Lt** | **Low Tech** | Pre-Industrial (`TL 2` or less) | Handmade Goods, Raw Resources | **High Tech:** Unavailable or `+200%` Cost. High value placed on off-world "magic" (tech); exports exotic, hand-crafted curios. |
| **Na** | **Non-Ag** | Too dry/barren for farming | Textiles (Synthetic), Processed Ore | **Textiles:** Standard. **Food:** `+10%` Cost. Often factory worlds or prison colonies; relies on imported synthetic foodstuffs. |
| **Ni** | **Non-Ind** | Pop 4–6 | Raw Materials | **Manuf:** `+10%` Cost. Service economies or developing worlds; high demand for off-world entertainment and luxury. |
| **Po** | **Poor** | Lacking resources / viable land | Scrap, Labor | **Labor:** Cheap. **All Goods:** `+10%` Cost. Exports cheap workforce contracts; desperate for basic medical supplies. |
| **Ri** | **Rich / Mining** | Economic powerhouse / Rare minerals | Luxuries, Advanced Tech, Ores, Crystals | **Luxuries:** Standard. **Raw Mats:** `-30%` Cost. High disposable income; prime market for exotic art, pets, and illegal vices. |
| **Va** | **Vacuum** | Atmos 0 | Salvage, Zero-G Goods, Ores | **Air/Water:** `+100%` Cost. **Zero-G Gear:** Cheap. Dependent on life-support imports; exports refined isotopes and vacuum-welded hulls. |
| **Wa** | **Water World** | Hydro 10 (`A`) | Seafood, Hydrogen, Algae, Deuterium | **Food:** `-20%` Cost. **Land Goods:** `+50%` Cost. Exports protein paste base; imports metals and wood, which are luxury items here. |

#### **1.1.2. Trade Route Dynamics: The Cluster Theory**

Planetary economies rarely exist in isolation; they form **Trade Clusters**—symbiotic loops between neighboring star systems. Identifying these loops is the foundation of building a mercantile empire:

* **The Survival Loop (`Ag <-> In`):** The most common interstellar trade route. Industrial worlds (`In`) manufacture the tractors, harvesters, and atmospheric processors that Agricultural worlds (`Ag`) need, while `Ag` worlds export the gigatons of grain and bio-matter required to feed the Industrial workforce.
  * *Route Risk:* Low piracy (heavily patrolled by faction navies), low profit margins per ton, massive volume.
* **The Extraction Chain (`As / Ri <-> Ht`):** Asteroid belts (`As`) and rich Mining worlds (`Ri`) strip-mine rare isotopes and ores to feed High Tech (`Ht`) orbital foundries. In return, `Ht` worlds supply the advanced mining lasers, grav-plates, and industrial cybernetics needed to survive the mines.
  * *Route Risk:* High piracy (high-value compact cargo), moderate-to-high profit margins.
* **The Life Support Run (`Ic / Wa <-> De / Va`):** Hauling glacial ice, deuterium, and breathable volatiles from Ice (`Ic`) or Water (`Wa`) worlds to arid Desert (`De`) or airless Vacuum (`Va`) colonies. This is a critical lifeline route; any disruption causes immediate humanitarian and industrial crises.
  * *Route Risk:* Variable; frequently subsidized by government or corporate retainer contracts.

---

### **1.2. Commodities & Exchange Matrix**

While the **Wealth Matrix** handles personal equipment, bulk trade goods (**Commodities**) form the backbone of the speculative shipping market. Prices listed below represent the **Base Galactic Average per Ton (`10 Sockets / 1 Mount = ~100 kg`; `1 Module = ~10 Tons`)**:

| Category | Trade Good | Base Cost / Ton | Description & Tangent Setting Flavor |
| :--- | :--- | :---: | :--- |
| **Essential** | **Foodstuffs** | **500 Cr** | Bulk grain, algae paste, or dehydrated rations. Essential for station survival. *Example: Karkinos Grains.* |
| **Essential** | **Water (Ice)** | **250 Cr** | Pure glacial ice or cometary fragments. Vital for desert/barren worlds. *Example: Krias Glacial Bricks.* |
| **Essential** | **Textiles** | **1,000 Cr** | Synthetic polymers, spider-silk from Rakne farms, or standard cotton. *Example: Rakne Silk.* |
| **Industrial** | **Polymers** | **4,000 Cr** | Raw plastics, rapid-print resin, and synthetic rubber used in 3D printing and construction. |
| **Industrial** | **Chemicals** | **5,000 Cr** | Fertilizers, industrial acids, and refined starship fuel (Liquid Hydrogen). *Example: Volatile Acids.* |
| **Industrial** | **Metals (Common)** | **7,000 Cr** | Steel, Aluminum, Copper used for construction and basic hulls. *Example: Durasteel Beams.* |
| **Industrial** | **Metals (Rare)** | **25,000 Cr** | Titanium, Tungsten, Platinum, Iridium used for high-end components. *Example: Iridium Ore.* |
| **Tech** | **Machinery** | **15,000 Cr** | Heavy mining drills, atmospheric scrubbers, vehicle replacement parts. *Example: Mekan Drill-Heads.* |
| **Tech** | **Electronics** | **30,000 Cr** | Sensor arrays, comms relays, consumer devices. *Example: Syndicate Data-Pads.* |
| **Tech** | **High Tech** | **50,000 Cr** | Grav-plates, fusion cores, medical pods. High value, low mass. *Example: Ascendancy Psi-Nodes.* |
| **Luxury** | **Luxuries** | **100,000 Cr** | Artwork, vintage wines, rare spices, actual paper books. *Example: Alterian Sun-Wine.* |
| **Luxury** | **Biologics** | **75,000 Cr** | Gene-seed, cloned organs, exotic pets (or their DNA). *Example: Auluran Graft-Seeds.* |
| **Restricted** | **Weaponry** | **40,000 Cr** | Small arms crates, vehicle turrets, explosives *(Law Level restrictions apply)*. *Example: Mag-Rail Rifles.* |
| **Restricted** | **Armor** | **35,000 Cr** | Plasteel plating, powered suit servos *(Law Level restrictions apply)*. *Example: Legionnaire Plate.* |

---

### **1.3. Exchange Mechanics: Speculative Cargo**

Players operating as "Free Traders" or Corporate Factors generate profit by exploiting the price differential between **Supply (Source)** and **Demand (Destination)** worlds. The core speculative loop combines market assessment, negotiation, transport logistics, and brokerage.

#### **The Speculation Loop: Worked Example**

*Captain Vance wants to run a speculative cargo of **Rare Metals** from an **Asteroid Belt (`As`)** to a **High Tech (`Ht`)** world:*
1. **Assessment:** Vance rolls **Vocation (Merchant / Appraisal) or Barter (`CR 15`)** (`2d10 + INT + Skill`). Success! He learns that Asteroid miners are currently flooding the local exchange, dropping Rare Metal prices to **60% of base**.
2. **Purchase:** He buys **10 tons** of Rare Metals. Base cost is `25,000 Cr/ton`. With the `-40%` Asteroid modifier and current surplus, he pays only **`15,000 Cr/ton`** (`Total investment: 150,000 Cr`).
3. **Transport:** He plots a jump through the sector and evades a pirate corsair patrol in the outer belt.
4. **Liquidation:** Arriving at the High Tech (`Ht`) foundry world, he rolls **Barter / Vocation (Merchant — Broker)**. A **Critical Success (`Natural 20`)**! The High Tech world normally pays `+30%` for raw materials, but Vance triggers an urgent bidding war between two Syndicate sub-corporations, selling at **200% of base value (`50,000 Cr/ton`)**.
   * **Total Sale:** `500,000 Cr` | **Net Profit:** **`350,000 Cr`** (before jump fuel/docking overhead).

#### **Step-by-Step Speculative Trading Procedure**

1. **Market Assessment (`Appraisal / Barter CR 15`):** Identify a profitable trade vector. A successful `2d10 + Intellect + Barter / Vocation (Merchant)` check (`CR 15`) reveals current market variances in the target system:
   * *Success:* Reveals accurate local buy/sell modifiers and active Trade Events.
   * *Failure:* Market telemetry is obscured or outdated (`1d6` days old).
2. **Acquisition (Purchase at Source World):**
   * *Base Price:* Modified by the Source World's Trade Codes (e.g., `-50%` for Foodstuffs on `Ag` worlds).
   * *Negotiation:* A successful **Diplomacy**, **Barter**, or **Bluff** check (`CR 15–20`) lowers the purchase price by an additional **5% to 10%**.
3. **Transport (Logistics to Destination World):**
   * *Operating Expenses:* Starship fuel, jump-gate tolls, docking fees, and crew wages typically consume **~10% of base cargo value per interstellar jump**.
   * *Piracy & Customs Risk:* Encounter frequency and threat tier scale with total cargo value; high-value shipments attract organized corsairs and strict customs inspections.
4. **Liquidation (Brokerage at Destination World):**
   * *Broker Check:* Roll `2d10 + Intellect/Charisma + Barter / Vocation (Merchant)` vs. **Market CR (Base `CR 15`)**:
     * **Success:** Sell at **Destination Market Price + `10% to 20%` profit margin**.
     * **Critical Success (`Natural 20` or beat CR by 10+):** Bidding war ensues! Sell at **Destination Market Price + `50%` profit margin**.
     * **Failure:** Local market saturation; sell at flat **Destination Market Price** (breaking even or taking a minor loss after 10% transport overhead).
     * **Critical Failure (`Natural 2` or fail CR by 10+):** Sudden market crash, punitive tariff hike, or quarantine embargo; forced to sell at a **`-20%` loss** (or haul the cargo to another system).

#### **Market Volatility & Dynamic Trade Events (`1d6`)**

The interstellar economy is dynamic. Architects can roll `1d6` (or trigger narrative events) to shift system scarcity:

| `1d6` Roll | Trade Event | Mechanical Effect on System Market |
| :---: | :--- | :--- |
| **1** | **Blockade / Embargo** | Import/Export Halt. Prices for **Essential** and **Restricted (Weaponry/Armor)** goods **triple (`x3`)**. Black Market flourishes. |
| **2** | **Famine / Blight** | Agricultural Collapse. **Foodstuffs** cost **`x5`**. Demand and prices for **Biologics** increase (`+50%`). |
| **3** | **Tech Boom** | Innovation Spike. **High Tech** and **Electronics** purchase prices **drop by `-50%`** (Surplus export opportunity). |
| **4** | **War Declaration** | Military Mobilization. **Metals (Common/Rare)**, **Weaponry**, and **Armor** demand spikes (**`x2` price**). |
| **5** | **Resource Discovery** | Mining Rush. Local **Raw Material / Ore** prices **crash (`-50%`)**, while **Machinery** demand rises (`+50%`). |
| **6** | **Trade Festival** | Free Trade Charter. Sector tariffs suspended; **+2 Bonus** to all Negotiation, Barter, and Broker checks this week. |

---

### **1.4. The Gray and Black Markets**

Not all commerce is legal. While the **Gray Market** deals in legal commodities traded off-ledger to evade imperial tariffs and corporate excise taxes, the **Black Market** operates in the shadows of high-Law systems (`Law Level 6+`), offering massive returns at the risk of asset seizure and imprisonment.

#### **Contraband Categories**

* **Combat Drugs & Neuro-Stims:** Adrenal boosters, pain-suppressors, and illegal psionic enhancers (`Base Value: 20,000 Cr / kg`). *High demand on Industrial, Penal, and War-torn worlds.*
* **Unshackled Sentient AI Cores:** Autonomous TL 4–5 synthetic intelligence cores (`Base Value: 500,000 Cr / unit`). *Strictly outlawed by the Dracon Dynasty and Coalition; covertly prized by the Syndicate and Mekan Collective.*
* **Progenitor & Xeno-Artifacts:** Precursor relics or non-sanctioned alien biotech (`Base Value: Variable / CR 30–60+`). *Heresy/contraband in Impyrium space; coveted by savants, collectors, and syndicate labs.*
* **Restricted Mil-Spec Ordnance:** Heavy plasma artillery, disruptors, nanite weapons, and WMDs (`Base Value: 2x Legal Weaponry`).

#### **Smuggling Mechanics**

1. **The Blockade / Customs Run:** Slipping contraband past orbital patrols requires an opposed **Piloting + Bluff (or Stealth) Check vs. System Authority Sensor Scans**. The Authority's scan CR is determined by the starport's **Law Level** (`CR 10 + Law Level`).
2. **Concealment & Countermeasures:**
   * Installing **Shielded Cargo Holds** (`TL 4`) imposes **Disadvantage** on authority sensor scan checks.
   * **Forged Manifests** (`Computers` or `Thievery [Forgery]` vs. Customs `Investigation`) grant a **+2 to +4 synergy bonus** to the smuggling check.
3. **Finding a Fence:** Liquidating contraband requires a **Streetwise Check (`CR 15 + Law Level Modifier`)** to locate a trustworthy buyer without triggering an enforcement sting. *(Per Liquidity Drag, stolen goods sell to a fence at `20%–25%` of base value, whereas scarce banned commodities demanded by a black-market buyer command `100%–300%` of base value).*
4. **Consequences of Interdiction:**
   * **Law Level 8+ (High Security):** Immediate vessel impoundment, cargo confiscation, and criminal sentencing.
   * **Law Level 5–7 (Moderate Security):** Customs officials may be swayed via a **Bribe** (`10% to 20%` of cargo value) paired with a successful **Diplomacy** or **Bluff** check.

---

### **1.5. Logistics, UDU Cargo Capacity & Commercial Contracts**

Tangent integrates cargo logistics directly into the **Universal Displacement Unit (UDU)** capacity hierarchy (`10 Nodes = 1 Socket | 10 Sockets = 1 Mount | 10 Mounts = 1 Module`):

#### **1. UDU Cargo Scaling**

* **1 Socket (`Tier 1` — Personal Unit):** Holds **~1 kg** of compact, high-value goods (combat drugs, cut Aetherite gems, data-crystals, personal sidearms). *(10 Nodes = 1 Socket).*
* **1 Mount (`Tier 2` — Vehicular Unit):** Holds **~100 kg** (weapon crates, spare mech actuators, field rations). *(10 Sockets = 1 Mount; 10 Mounts = 1 Ton of bulk cargo).*
* **1 Module (`Tier 3` — Starship / Architectural Unit):** Holds **~10 Tons** of bulk freight (raw ore containers, agricultural bulk, or garaged vehicles: **1 Mount holds 1 Scale Multiplier of vehicle**, so a 1-Module [10-Mount] bay holds ten Medium `x1` vehicles or two Huge `x5` mechs). Most dedicated freighter cargo bays provide **10 to 50+ Modules** (`100 to 500+ Tons`) of capacity depending on hull size.

#### **2. Standard Freight & Courier Contracts**

Unlike speculative trading (where the crew buys cargo with their own capital), **Freight Contracts** involve hauling a client's cargo for a guaranteed flat fee:

* **Bulk Commercial Freight:** Low risk, steady return—pays a flat **1,000 Credits per Ton per Parsec/Jump**. Failure to deliver on schedule results in bond forfeiture and Reputation loss.
* **High-Priority Mail / Data Courier:** Carrying encrypted diplomatic pouches, corporate black-boxes, or urgent medical biologics. Requires a fast ship and high security—pays **5,000 Credits per delivery** (plus hazard bonuses), and frequently attracts rival espionage teams or corsairs.

#### **3. Commercial Passenger Passage**

Transporting passengers provides reliable revenue per jump for vessels equipped with appropriate Life Support and Stateroom Modules:

* **Low Passage (`1,000 Cr` per Berth):** Cryogenic suspension berth (frozen sleep). Requires minimal space and life support, but carries a minor risk of **"Thaw Sickness"** (`Fortitude Save CR 10` upon revival without a shipboard Medic, inflicting temporary Fatigue on a failure).
* **Mid Passage (`5,000 Cr` per Cabin):** Standard private or double stateroom with basic shipboard meals and recreational access.
* **High Passage (`10,000 Cr` per Suite):** Luxury stateroom suite demanding high-quality cuisine, steward service, and security escort.

