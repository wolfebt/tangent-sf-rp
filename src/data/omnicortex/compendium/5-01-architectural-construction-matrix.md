---
id: "5-01-architectural-construction-matrix"
name: "5.01 Architectural Construction Matrix & Structural Mechanics"
category: "compendium"
parent: "5.00 WORLDBUILDING & ARCHITECTURE"
order: 1
perspective: "both"
entry_type: "Architect Codex"
tl: 3
ml: 0
cost: 0
tags: ["compendium","volume-5","architecture","construction","udu"]
updatedAt: "2026-09-01T20:54:33.509Z"
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

# 5.01 Architectural Construction Matrix & Structural Mechanics

The Tangent Construction System allows players and GMs to design, build, and manage structures ranging from simple outposts to sprawling orbital arcologies. Structures are defined by three primary factors: **Footprint** (Base Size), **Verticality** (Height), and **Materials** (Tech Level).

---

## I. The Universal Scale: Modules vs. Mounts (The 10:1 Ratio)
To maintain mathematical consistency across personal inventory, vehicular engineering, and base construction, Tangent relies on the **Universal Displacement Unit (UDU)** hierarchy:

| Scale Category | Architectural Application | Physical Equivalency | Integration Ratio |
| :--- | :--- | :--- | :--- |
| **Tier 1: Socket** | Personal gear, micro-circuits, ammo. | 1 kg / 10 Nodes | 1 Mount = 10 Sockets |
| **Tier 2: Mount** | Hardpoints: Armor plates, defense turrets, shields. | 100 kg / 10 Sockets | 1 Module = 10 Mounts |
| **Tier 3: Module** | Facilities: Rooms, generator bays, medbays, hangars. | 10 tons / 400 sq ft (20x20 ft) | Master Room Unit |

> [!IMPORTANT]
> **The 10:1 Integration Rule:**
> **1 Module equals 10 Usable Mounts.** When constructing a base or starship, an architect can dedicate a full Module to an internal room (e.g. Barracks, Medbay), or partition that Module into 10 Mounts to mount exterior defense turrets, reinforced blast armor, and shield generators.

---

## II. Structural Categories & Material Hardness
| Tech Level | Primary Material Class | Base Wall DR | Structural Integrity / 10x10 Section | Fire / Breach DC |
| :---: | :--- | :---: | :---: | :---: |
| **TL 0** | Timber, Adobe, Chiseled Stone | DR 3 | 25 HP | DC 12 |
| **TL 1** | Cast Iron, Masonry, Riveted Steel | DR 6 | 50 HP | DC 16 |
| **TL 2** | Reinforced Concrete, Structural Steel | DR 10 | 100 HP | DC 20 |
| **TL 3** | Carbon-Plasteel Composites | DR 18 | 200 HP | DC 25 |
| **TL 4** | Densified Hyper-Alloys & Grav-Plating | DR 30 | 400 HP | DC 30 |
| **TL 5** | Hard-Light Lattices & Quantum Laminated Bulkheads | DR 50 | 800 HP | DC 35+ |

---

## III. Construction Economic Formula
The complexity of a structure (**Crafting DC**) directly dictates its monetary market value via the Tangent Standard Curve:
$$\text{Value (Credits)} = 10 \times 4^{(\text{DC} / 5)}$$

## Game Mechanics Rules
```
1 Module = 10 Mounts = 100 Sockets = 10,000 UDU
Room Volume: 1 Module = 400 sq ft (20x20x10 ft)
Wall Breach DC = 10 + (TL * 5)
Base Value = 10 * 4^(Crafting_DC / 5) Credits
```

## Gameplay Instructions
1. Calculate total building footprint in 20x20 ft Modules.
2. Allocate Modules between interior rooms and defensive Mounts (1 Module = 10 Mounts).
3. Determine wall material TL to establish base DR and breach DC.

## Designer Notes
Land value is governed by planetary population and law level modifiers.
