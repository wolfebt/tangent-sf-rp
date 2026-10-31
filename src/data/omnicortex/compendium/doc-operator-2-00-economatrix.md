---
id: "doc-operator-2-00-economatrix"
name: "2.00 ECONOMATRIX"
fileName: "2.00 ECONOMATRIX.md"
relPath: "operator/2.00 ECONOMATRIX.md"
isMasterDoc: true
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 222
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","2.00 economatrix","mechanics"]
updatedAt: "2026-10-31T11:30:42.650Z"
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
By strictly adhering to this calculation, all pricing debates are eliminated. An Architect values any new, homebrew, or precursor artifact instantly simply by assigning it a Crafting DC based on its operational complexity:
* **Ballistic Rifle (DC 15):** Standard machining. $\text{Value} = 10 \times 4^{(15/5)} = 640\text{ Credits}$.
* **Plasma Rifle (DC 20):** Advanced energy physics, containment magnetic coil. $\text{Value} = 10 \times 4^{(20/5)} = 2,560\text{ Credits}$.

The Plasma Rifle is inherently 4 times more valuable because it is one distinct tier (+5 DC) harder to manufacture.

---

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

* **[The Wealth Matrix & Liquid Interface](./economatrix/2.00.WealthAndLiquidity.md)** — *Starting Wealth Score, Financial Status Hierarchy, The Gap Rule, and Fence Rates*
* **[Crafting Engine & Master Valuation Tables](./economatrix/2.00.CraftingAndValuation.md)** — *Productivity Formula, Macro-Construction, DC-to-Credits Valuation Table, and UDU Hierarchy*
* **[Interstellar Trade & Mercantile Engine](./economatrix/2.00.InterstellarTrade.md)** — *World Trade Classifications, Commodities Matrix, Speculative Cargo Loop, and Macro-Economic Safeguards*

