---
id: "doc-architect-99-tech-armor-economyandexemplars"
name: "99. Tech (Armor): Armor Economy & Exemplars"
fileName: "99.Tech.Armor.EconomyAndExemplars.md"
relPath: "architect/technology/armor/99.Tech.Armor.EconomyAndExemplars.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 31
perspective: "architect"
entry_type: "Tech Matrix (armor)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.armor.economyandexemplars","matrix"]
updatedAt: "2026-10-14T06:04:05.777Z"
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

# **ARMOR ECONOMY & ICONIC EXEMPLARS**

### ***V. UNIFIED ECONOMY & EXCHANGE***

#### **The Universal Displacement Unit and the Tier 1 Protocol**

To ensure absolute mathematical consistency across personal inventory, vehicular engineering, and architectural design, the Matrix relies upon the Universal Displacement Unit (UDU) hierarchy. The UDU system is the spatial foundation of the Tangent universe, dictating capacity limits from the microscopic to the cosmic.

The *99 \- Augmentations Matrix* establishes **Nodes** as Tier 0\. A Node represents less than 10 grams of mass, serving as the granular unit for internal biological strain and cybernetic installation. The Equipment Matrix operates strictly at Tier 1 and above, bypassing biological strain entirely. The absolute floor for external equipment is the **Socket**.

#### **The Socket: The Foundation of Tier 1**

A Socket represents the fundamental unit of personal-scale spatial displacement, equating to less than 1 kilogram (2.2 lbs) of mass or functional complexity. The Socket dictates a character's carrying capacity, the number of modifications a weapon chassis can support, and the granular integration of external components.

A Standard Fit means a Socket accepts 1 standard modification, attachment, or component. However, items may also feature a single **Minor Option** (e.g., a laser sight, cosmetic light, or concealed pocket) which utilizes negligible bulk and does not consume a Socket.

The UDU hierarchy scales exponentially from this baseline to accommodate larger entities and structures without relying on disjointed conversion tables. While preserving physical displacement metrics of 10 g, 1 kg, 100 kg, and 10 tons, the matrix introduces a consistent 10:1 integration bottleneck across all tiers:

* **Scale Ratio \= 101**

Just as biological protocols dictate that only 10 Nodes are actively usable per 1 Socket, this bottleneck is replicated at macro scales: a Mount allows for exactly 10 Usable Sockets, and a Module allows for exactly 10 Usable Mounts.

| SCALE CATEGORY | DEFINITION AND CAPACITY | INTEGRATION BOTTLENECK |
| :---- | :---- | :---- |
| **Tier 0: Nodes (Implant Scale)** | Represents less than 10 g of mass. | 10 Usable Nodes \= 1 Socket |
| **Tier 1: Socket (Personal)** | Baseline unit for handheld gear, weapon mods, and armor hardpoints. Maximum 1 kg displacement. | — |
| **Tier 2: Mount (Mecha/Vehicle)** | Baseline unit for vehicular weapons, engines, and heavy cargo. Maximum 100 kg displacement. | 1 Mount \= 10 Usable Sockets |
| **Tier 3: Module (Architecture)** | Baseline unit for structural rooms, capital hangars, and planetary facilities. Maximum 10 Tons displacement. | 1 Module \= 10 Usable Mounts |

This strict hierarchy ensures seamless cross-scale integration. A Mecha (Tier 2\) or Structure (Tier 3\) can store or equip personal-scale items (Tier 1\) taking up mathematically accurate space. While a single vehicle Mount designated as a utility bay possesses 100 kg of volumetric displacement, its active capacity is capped at precisely 10 Usable Sockets worth of personal equipment. Furthermore, garaging rules remain consistent: storing a Medium-sized vehicle requires 0.1 Modules of architectural space, while a Huge Mecha requires exactly 1 full Module.

#### **The Tangent Standard Economics**

The most significant advancement in the Equipment Matrix is the complete eradication of economic dissonance—the persistent fracture between narrative wealth and the mechanical reality of crafting and acquiring gear. In legacy RPG systems, crafting cost is derived from arbitrary retail prices based on perceived combat utility rather than engineering complexity. This produces linear pricing models that fail in science-fiction settings; a starship is not merely a very large rifle, but an order-of-magnitude leap in manufacturing sophistication.

Tangent Standard Economics posits a singular, mathematically rigorous principle: **Complexity Determines Value**. The market price of an item is simply the societal aggregate of skill (Crafting CR) and time required to produce it.

#### **The Tangent Standard Curve (TSC)**

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, cost scaling must be exponential:

* **Value (Credits) \= 10 \* 4^(CR / 5\)**

This formula dictates that an item's value in Credits equals a baseline value of 10 Credits (representing scrap metal or raw ore at CR 0\) multiplied by a growth factor of 4, raised to the power of the item's Crafting CR divided by 5\. The growth factor ensures value inherently quadruples across every tier interval of 5 CR.

#### **The Master Valuation Table**

| Craft CR | COMPLEXITY | VALUE (CREDITS) | EXAMPLES (SCIFI / FANTASY) |
| :---- | :---- | :---- | :---- |
| **0** | **Scrap** | 10 | Raw ore, ration bar, wooden club. |
| **5** | **Simple** | 40 | Knife, backpack, basic clothing, bandages. |
| **10** | **Standard** | 160 | Pistol, sword, light armor, commlink. |
| **15** | **Expert** | 640 | Rifle, plate mail, medkit, hacking tool. |
| **20** | **Advanced** | 2,560 | Plasma weapon, full environmental suit, masterwork gear. |
| **25** | **Master** | 10,240 | Cybernetic limb, hoverbike, magic ring, heavy weapon. |
| **30** | **Grandmaster** | 40,960 | Power armor, golem, personal shuttle, rare artifact. |
| **35** | **Heroic** | 163,840 | AI Core, fighter jet, small starship hull. |
| **40** | **Legendary** | 655,360 | Corvette-class ship, legendary artifact, planetary fortress. |
| **45** | **Mythic** | 2,621,440 | Frigate, resurrection chamber, moon base module. |
| **50** | **Transcendent** | 10,485,760 | Dreadnought, planetary shield generator. |

#### **The Productivity Engine and Macro-Economics**

Because the Tangent Standard Curve dictates exponential scaling, a linear crafting system would require literal centuries to build high-end assets. Tangent solves the "Time vs. Cost" paradox through the Productivity Engine, converting effort into Productivity Points (PP).

##### **The Productivity Formula**

To craft an item, the creator must accumulate a Target PP equal exactly to the item's Credit Value:

* **Target PP \= Credit Value**  
* **Daily PP \= (Craft Check Result \- 10\) \* Tool Tier Multiplier**

The Tool Tier Multiplier is the critical scaling variable:

* **Tier 0 (Improvised):** x1 Multiplier. Bare hands, stone tools.  
* **Tier 1 (Basic):** x10 Multiplier. Handheld power tools, garage kit.  
* **Tier 2 (Advanced):** x50 Multiplier. Professional machine shop.  
* **Tier 3 (Industrial):** x200 Multiplier. Automated factory lines.  
* **Tier 4 (Nanoforge):** x1,000 Multiplier. Molecular assembly swarms.  
* **Bio (Cultivation):** x1,000 Multiplier. Accelerated nutrient tanks (Auluran/Kitin). Requires Medicine/Nature and Engineering checks.  
* **Tier 5 (Genesis):** x5,000 Multiplier. Polymatter loom, holophotonics, metaphysical fabrication.

*Example:* A Mastercraft Titan Mech Suit (CR 30, Target PP \= 40,960) would take an artisan with Basic Tools (x10) over 400 days to complete. An advanced engineer utilizing a Nanoforge (x1,000) with a high check result can materialize the identical Mech Suit in less than two days.

##### **Macro-Scale Construction and Faction Labor Pools**

For monumental projects like a Dreadnought (CR 50, Value \~10.5 Million Cr), individual crafting is impossible. Factions utilize collective Labor Pools:

* **Daily PP (Total) \= Sum of all individual Daily PP**

A shipyard employing 1,000 engineers operating Industrial (x200) tools generates 1,000,000 PP per day, completing a capital warship in roughly 10.5 days.

#### **Wealth Score and Purchasing Power**

Character economic leverage is quantified by the Wealth Score (WS), a static rating of economic standing representing credit rating, active investments, stipend, and social capital.

> **The Golden Rule of Tangent Wealth:**

> A character may automatically purchase any item with a Crafting CR equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score:

> **Purchase CR \<= Wealth Score (WS)**

##### **Expanded Financial Status Hierarchy**

| WEALTH STATUS | AUTO-BUY LIMIT | LIFESTYLE DESCRIPTION |
| :---- | :---- | :---- |
| **0 (Indebted)** | 0 Cr | Debt slavery, servitude, or carceral internment. |
| **1 – 4 (Impoverished)** | 10 – 30 Cr | Squatter / homeless. Scavenges daily for sustenance. |
| **5 – 9 (Struggling)** | 40 – 150 Cr | Shared pod in slum district. Synthetic processed rations. |
| **10 – 14 (Middle Class)** | 160 – 600 Cr | Private apartment, steady corporate wage, consumer groundcar. |
| **15 – 19 (Affluent)** | 640 – 2,500 Cr | High-end high-rise condo, luxury personal vehicle, domestic drone. |
| **20 – 29 (Wealthy)** | 2,500 – 40,000 Cr | Large private estate, servant cadre, minor corporate investor. |
| **30 – 39 (Hegemon)** | 41K – 650K Cr | Skyscraper penthouse, planetary estate, owns mid-sized corporation. |
| **40 – 49 (Industrialist)** | 650K – 10M Cr | Megacorp executive director, fleet owner (Corvettes / Frigates). |
| **50 – 59 (Dynastic)** | 10M – 167M Cr | System nobility, owns orbital space stations and extraction moons. |
| **60 – 69 (System Lord)** | 167M – 2.6B Cr | Rules entire solar system, commands capital battlefleets. |
| **70 – 79 (Sector Ruler)** | 2.6B – 42B Cr | Sovereign ruler of star cluster, flagship is a super-dreadnought. |
| **80+ (Faction Ruler)** | 42B+ Cr | Galactic Emperor / Hegemon. Post-scarcity personal economics. |

#### **The Liquidity Gap and Friction Mechanics**

To prevent infinite exploit loops, Tangent applies strict friction mechanics:

##### **1\. The Liquidity Constraint (The Gap Rule)**

When an item's Crafting CR exceeds the character's Wealth Score, passive income cannot cover the total purchase. The character must bridge the difference with liquid Credits:

* **Cost (Liquid) \= Value(Item CR) \- Value(Wealth Score)**

##### **2\. Liquidity Drag (The Fence Rate)**

Sell prices are heavily discounted:

* **Legal goods:** Sell at 50% of Total Market Value.  
* **Black market or stolen goods:** Sell at 20% to 25% of Total Market Value.  
* **Scrap metal / salvaged components:** Sell at 10% of Total Market Value.

### ***VI. SPECIAL SUITS & ICONIC EXEMPLARS***

These factory-spec and faction-custom armors serve as benchmarks for field operatives.

#### **1\. Dragoon Armor (Draconic Knights of the Dynasty)**

Forged specifically for the hereditary champions and knight-commanders of the Draconic Dynasty. Each suit features ornate, heat-treated scales shaped from plasteel-aether alloys, emblazoned with personalized draconic crests.

* **Chassis Base:** Full Body Armor (Standard Sealed, TL 3/4).  
* **Defensive Stats:** DR 15 (All Locations), 40 SP.  
* **Movement Penalties:** None (masterfully counter-balanced).  
* **Hierarchical Mastercraft Sockets:**  
  * **Knight-Acolyte:** 4 Custom Sockets.  
  * **Knight-Sergeant:** 5 Custom Sockets.  
  * **Knight-Officer:** 6 Custom Sockets.  
* **Dynastic Variants:**  
  * *Stealth Bodysuit Variant:* DR 10 (All Locations), \-1 Socket, grants \+5 bonus to Stealth checks.  
  * *Heavy Assault Variant:* DR 20 (All Locations), \-1 Socket, engineered joints completely negate base Mobility and Movement penalties.

#### **2\. Syndicate Drop Marine Battlesuit**

Designed exclusively for Syndicate shock-assault infantry dropped from low orbit in unpowered kinetic drop-pods—effectively transforming the wearer into a guided gravity bomb.

* **Chassis Base:** Battle Suit (Bulwark Coverage, TL 3/4).  
* **Defensive Stats:** DR 25 (All Locations), 80 SP.  
* **Pre-Installed Integrated Systems (Fully Occupied Chassis):**  
  * **Full Environmental Seal (TL 3):** Indefinite life support cycle with emergency sealants.  
  * **Tactical Computer (TL 3):** \+2 Initiative, \+2 Perception, \+1 Combat Actions.  
  * **Exoskeleton Servos (TL 3):** \+2 Strength enhancement.  
  * **Kinetic Damper (TL 3):** Doubles DR vs crash and falling impacts; grants full DR vs direct explosives.  
  * **Flexible Weave (TL 2):** Specifically offsets \-1 Mobility and \-5 Movement. Combined with the Exoskeleton Servos (+2 Str), all default Bulwark penalties (-2 Mobility, \-10 Movement) are entirely neutralized.  
* **Socket Balance:** 0 Available Sockets in standard production line. Exceeding this baseline requires a complete Mastercraft redesign and reconstruction.


## Game Mechanics Rules
```
See full canonical text in architect/technology/armor/99.Tech.Armor.EconomyAndExemplars.md
```

## Gameplay Instructions
Refer to architect/technology/armor/99.Tech.Armor.EconomyAndExemplars.md in the game rules library for complete architectural tables and system parameters.

## Designer Notes
Canonical Tangent SF RP rulebook reference from architect/technology/armor/99.Tech.Armor.EconomyAndExemplars.md. Complete, unabridged source of truth.
