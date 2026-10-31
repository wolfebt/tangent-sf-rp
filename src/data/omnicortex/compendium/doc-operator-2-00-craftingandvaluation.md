---
id: "doc-operator-2-00-craftingandvaluation"
name: "2.00 Crafting Engine & Valuation Tables"
fileName: "2.00.CraftingAndValuation.md"
relPath: "operator/economatrix/2.00.CraftingAndValuation.md"
isMasterDoc: false
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "doc-operator-2-00-economatrix"
order: 224
perspective: "operator"
entry_type: "Economatrix Catalog"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","economatrix","2.00.craftingandvaluation","mechanics"]
updatedAt: "2026-10-31T11:30:42.698Z"
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

# **THE CRAFTING ENGINE & MASTER VALUATION TABLES**

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
* **Scenario C (Apex Operator with Nanoforge):** Check Result 40, Tools Nanoforge (x1,000).
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

