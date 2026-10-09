---
id: rule-economy-unified-field-theory
name: Tangent Economic Unified Field Theory (EUFT) & Crafting Productivity Engine
category: rules
description: Mathematical equivalence between Crafting DC and Purchase DC, Tangent Standard Curve (TSC), 50% material costs, tool tier multipliers, and cooperative macro manufacturing.
costs:
  bp: 0
modifiers: []
---

# Tangent Economic Unified Field Theory (EUFT) & Crafting Productivity Engine

**Category**: Core Economy & Manufacturing Systems  
**Core Reference**: `02 ECONOMY AND WEALTH.md` & `2.00 ECONOMATRIX.md`

---

## 1. The Golden Rule of Tangent Wealth
In the Tangent SF RP economy, the market credit cost of any finished item is mathematically identical to the skill check difficulty required to fabricate it:

$$\text{Crafting DC} = \text{Purchase DC}$$

Every item in the universe is mapped to a unified logarithmic curve known as the **Tangent Standard Curve (TSC)**:

$$\text{Credit Value (Cr)} = 10 \times 4^{(\text{DC} / 5)}$$

### Core Economic Axioms
1. **Universal Parity:** If an item requires a DC 20 skill check to manufacture, its baseline retail value across civilized space is exactly **2,560 Cr**.
2. **Material Cost Ratio:** Fabricating any item requires raw materials, feedstock, or salvaged components equal to **50% of its market credit value**. The remaining 50% represents the applied technical labor, refinement, and tooling.
3. **No Arbitrary Pricing:** GM and players never need to invent ad-hoc prices. Once an item's Crafting DC or complexity is established, its purchase cost and fabrication budget are fixed instantly.

---

## 2. Master Valuation Curve Benchmarks

| Crafting / Purchase DC | Market Credit Value | 50% Material Cost | Minimum Auto-Buy WS | Canonical Scale & Examples |
| :---: | :---: | :---: | :---: | :--- |
| **DC 0** | **10 Cr** | 5 Cr | WS 1 (Impoverished) | Basic field rations, glow-flare, standard battery cell |
| **DC 5** | **40 Cr** | 20 Cr | WS 2 (Impoverished) | Survival medkit, kinetic holdout pistol, encrypted comm-pad |
| **DC 10** | **160 Cr** | 80 Cr | WS 6 (Struggling) | Service rifle, rebreather mask, low-altitude micro-drone |
| **DC 15** | **640 Cr** | 320 Cr | WS 11 (Middle Class) | Military plasma sidearm, heavy composite tactical armor |
| **DC 20** | **2,560 Cr** | 1,280 Cr | WS 16 (Affluent) | Heavy powered exosuit, cybernetic arm replacement |
| **DC 25** | **10,240 Cr** | 5,120 Cr | WS 20 (Wealthy) | Repulsor speeder bike, neural interface cyberware rig |
| **DC 30** | **40,960 Cr** | 20,480 Cr | WS 21 (Wealthy) | Heavy armored combat APC, high-yield tactical defense turret |
| **DC 40** | **655,360 Cr** | 327,680 Cr | WS 31 (Hegemon) | Frontier scout starship hull, sub-orbital shuttlecraft |
| **DC 50** | **10,485,760 Cr** | 5,242,880 Cr | WS 41 (Industrialist) | Fleet destroyer escort, macro planetary mining platform |
| **DC 60** | **167,772,160 Cr** | 83,886,080 Cr | WS 51 (Dynastic) | Capital dreadnought, permanent orbital defense battery |
| **DC 70** | **2,684,354,560 Cr** | 1,342,177,280 Cr | WS 61 (System Lord) | Planetary terraforming grid, orbital shipyard spire |
| **DC 80** | **42,949,672,960 Cr** | 21,474,836,480 Cr | WS 71 (Sector Ruler) | Progenitor ring megastructure, Dyson swarm primary array |

---

## 3. The Crafting Productivity Engine
Manufacturing progress is measured in **Productivity Points (PP)**. 

### The Productivity Metric
* **Target Output:** An item is completed when accumulated Productivity Points equal or exceed its market credit value:
  $$\text{Target PP} = \text{Market Credit Value}$$
* **Daily Output (8-Hour Shift):** Progress achieved per standard workday is:
  $$\text{Daily PP} = \max(1, (\text{Crafting / Vocation Check} - 10) \times \text{Tool Multiplier})$$
* **Crafting Duration:**
  $$\text{Days Required} = \frac{\text{Target PP}}{\text{Daily PP}}$$

### Tool Tier Multipliers

| Tool Tier | Multiplier | Technological & Industrial Context |
| :--- | :---: | :--- |
| **TL 0 — Improvised** | $\times 1$ | Primitive stone tools, campfire forges, improvised field kits |
| **TL 1 — Basic** | $\times 10$ | Handheld power tools, garage repair kits, portable chemistry set |
| **TL 2 — Advanced** | $\times 50$ | Professional machine shop, dedicated alchemical laboratory |
| **TL 3 — Industrial** | $\times 200$ | Automated factory floor, assembly lines, municipal fabricators |
| **TL 4 — Nanoforge** | $\times 1,000$ | Molecular assemblers, picotech swarms, sub-atomic 3D looms |
| **Bio — Cultivation** | $\times 1,000$ | Hyper-growth biovats, tissue synthesizers (Medicine + Eng checks) |
| **TL 5 — Genesis** | $\times 5,000$ | Polymatter looms, holophotonic assemblers, orbital orbital drydocks |

---

## 4. Macro & Cooperative Manufacturing
When multiple artisans, engineers, or industrial workforces collaborate on a single mega-project (such as a starship, sky-crane, or orbital habitat):

$$\text{Combined Daily PP} = \text{Number of Workers} \times \text{Single Worker Daily PP}$$

* **Example:** 1,000 shipyard workers using Industrial tools ($\times 200$) with an average skill check of 15 generate:
  $$(15 - 10) \times 200 = 1,000\text{ PP/worker/day}$$
  $$1,000 \times 1,000 = 1,000,000\text{ PP/day}$$
* Constructing a **DC 50 Capital Dreadnought** ($10,485,760\text{ Cr/PP}$) requires:
  $$\frac{10,485,760}{1,000,000} \approx 10.5\text{ Workdays}$$
  *(With a required raw material budget of 5,242,880 Cr in alloys, cabling, and reactor cores).*

---

## 5. Salaried Labor & Downtime Earnings
For characters working salaried commissions or guild contracts where raw materials and shop tools are provided by clients:
* Daily credit earnings equal $(\text{Check} - 10) \times \text{Tool Multiplier}$ in economic value.
* Characters whose daily lifestyle and operational costs fall below their **Wealth Score Auto-Buy Limit** sustain their standard of living indefinitely without rolls or expenditure tracking.
