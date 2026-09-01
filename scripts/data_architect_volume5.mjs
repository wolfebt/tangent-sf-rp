export const architectVolume5Articles = [
  {
    id: "5-01-architectural-construction-matrix",
    name: "5.01 Architectural Construction Matrix & Structural Mechanics",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "5.00 WORLDBUILDING & ARCHITECTURE",
    order: 1,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-5", "architecture", "construction", "udu"],
    description: `# 5.01 Architectural Construction Matrix & Structural Mechanics

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
$$\\text{Value (Credits)} = 10 \\times 4^{(\\text{DC} / 5)}$$`,
    mechanic: `1 Module = 10 Mounts = 100 Sockets = 10,000 UDU
Room Volume: 1 Module = 400 sq ft (20x20x10 ft)
Wall Breach DC = 10 + (TL * 5)
Base Value = 10 * 4^(Crafting_DC / 5) Credits`,
    guide: `1. Calculate total building footprint in 20x20 ft Modules.
2. Allocate Modules between interior rooms and defensive Mounts (1 Module = 10 Mounts).
3. Determine wall material TL to establish base DR and breach DC.`,
    note: `Land value is governed by planetary population and law level modifiers.`
  },
  {
    id: "5-02-mecha-engineering-matrix",
    name: "5.02 Mecha & Heavy Vehicle Engineering Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "5.00 WORLDBUILDING & ARCHITECTURE",
    order: 2,
    perspective: "both",
    tl: 4,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-5", "mecha", "vehicles", "engineering"],
    description: `# 5.02 Mecha & Heavy Vehicle Engineering Matrix

Mecha and heavy armored fighting vehicles (AFVs) provide mobile tactical superiority across planetary warzones.

---

## I. Frame Classes & Chassis Architecture
| Frame Class | Size Scale | Base Structure Points | Hardpoints (Mounts) | Base Tactical Speed | Typical Role |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Light Scout** | Large (15 ft) | 120 Structure | 4 Mounts | 90 ft / round (18 kph) | Recon, skirmishing, electronic warfare. |
| **Medium Striker** | Huge (25 ft) | 250 Structure | 8 Mounts | 60 ft / round (12 kph) | Mainline combat, tactical flexibility. |
| **Heavy Siege** | Gargantuan (40 ft) | 500 Structure | 14 Mounts | 45 ft / round (9 kph) | Heavy artillery, frontline breakthrough. |
| **Super-Heavy Titan**| Colossal (65+ ft) | 1,200 Structure | 24 Mounts | 30 ft / round (6 kph) | City assault, orbital defense, flag units. |

---

## II. Power Cores & Hardpoint Allocations
- **Chemical / Combustion Core (TL2-3):** Low cost, high thermal signature, limited operational range (8 hours).
- **Fusion Reactor Core (TL3-4):** Standard military power, balanced output, 30-day continuous runtime.
- **Antimatter / Zero-Point Core (TL4-5):** High energy surplus, powers heavy energy shields and jump jets indefinitely.

---

## III. Hardpoint Sub-systems (1 Mount per Unit)
- **Kinetic Autocannon (Mount):** 4d10 Kinetic damage, AP 8, Range 300m.
- **Heavy Particle Beam (2 Mounts):** 6d12 Energy/Thermal damage, AP 15, Range 500m.
- **Assault Shield Emitter (1 Mount):** +20 Structure shielding buffer (refreshes 5 pts/round).
- **Jump Jet Thrusters (2 Mounts):** Grants 120 ft flight burst for 1 round.`,
    mechanic: `Mecha Defense TN = 10 + Pilot Agility + Piloting Skill - Frame Size Penalty.
Structure Damage Soak: Direct Armor DR -> Structure Points (Synthetics/Vehicles have no Vitality).`,
    guide: `Operators with the Piloting (Mecha) skill can pilot frames; untrained pilots suffer -5 to all tactical checks.`,
    note: `Critical hits against Mecha roll on the Internal Subsystem Failure Table (Cockpit, Reactor, Actuators).`
  },
  {
    id: "5-03-planetary-design-world-matrix",
    name: "5.03 Planetary Design & Universal World Profile (UWP) Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "5.00 WORLDBUILDING & ARCHITECTURE",
    order: 3,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-5", "planetary", "worldbuilding", "uwp"],
    description: `# 5.03 Planetary Design & Universal World Profile (UWP) Matrix

Architects utilize the Universal World Profile system to generate star systems, planetary environments, atmospheric pressures, and civilization metrics.

---

## I. Atmosphere Classification Matrix
| Code | Atmosphere Type | Environmental Pressure | Required Breathing Gear | Survival Check |
| :---: | :--- | :---: | :--- | :--- |
| **0** | **Vacuum / Airless** | 0.00 atm | Full Sealed Void Suit + O2 | Instant asphyxiation without suit. |
| **1** | **Trace Atmosphere** | 0.01 – 0.09 atm | Full Pressure Suit + Respirator | Fortitude DC 25 per min. |
| **2** | **Very Thin** | 0.10 – 0.42 atm | Oxygen Mask / Compressor | Fortitude DC 15 (hypoxia). |
| **3** | **Thin (Breathable)** | 0.43 – 0.70 atm | None (Acclimatization needed) | Athletics -2 until acclimatized. |
| **4** | **Standard (Earth-like)**| 0.71 – 1.49 atm | None | Standard Baseline. |
| **5** | **Dense Atmosphere** | 1.50 – 2.49 atm | Filter Mask (High N2/CO2) | None. |
| **6** | **Corrosive / Toxic** | 1.00 – 5.00 atm | Hazmat Sealed Suit + Scrubbers | 2d6 Acid/Toxin damage per round exposed. |
| **7** | **Invasive Super-Dense** | 5.00+ atm | Armored Diving Frame | Extreme crushing pressure. |

---

## II. Planetary Biomes & Hydrographics
- **Hydrographics Code 0-10:** Percentage of planetary surface covered in liquid oceans ($0 = 0\\%\\text{ Desert World}, 5 = 50\\%\\text{ Earth-like}, 10 = 100\\%\\text{ Ocean World}$).
- **Primary Biomes:** Arcology Megacity, Agri-World Plains, Death World Jungle, Volcanic Wasteland, Glacial Tundra, Subterranean Caverns, Asteroid Belt Swarm.

---

## III. Law & Government Levels (0 to 10)
- **Law 0 (Anarchy):** No laws; open carry of heavy military artillery; black market transactions dominate.
- **Law 5 (Standard Civil):** Concealed sidearms permitted with license; combat armor restricted in civic centers.
- **Law 10 (Totalitarian Police State):** All weapons, cybernetics, and private communication strictly banned.`,
    mechanic: `Universal World Profile Syntax: [Starport]-[Size]-[Atmosphere]-[Hydro]-[Population]-[Gov]-[Law]-[Tech]-[Meta]
Example: B-7-4-5-8-5-4-3-1 (Class B Starport, Standard Atmosphere, 50% Water, 100 Million Pop, TL3, ML1)`,
    guide: `Roll or select codes for each metric when creating new star systems for campaigns.`,
    note: `Planetary Tech Level dictates local equipment availability and repair part costs.`
  },
  {
    id: "5-04-companions-drones-matrix",
    name: "5.04 Companions, Combat Drones & Mounts Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "5.00 WORLDBUILDING & ARCHITECTURE",
    order: 4,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-5", "companions", "drones", "mounts"],
    description: `# 5.04 Companions, Combat Drones & Mounts Matrix

Companions encompass autonomous combat drones, biological hunting beasts, familiar spirits, and mechanized transports that operate alongside heroes.

---

## I. Companion Archetype Classes
| Companion Class | Control Link | Base HP / Structure | Attack Profile | Special Function |
| :--- | :--- | :---: | :--- | :--- |
| **Recon Drone** | Neural / Comms Link | 15 Structure | Stun Dart (1d6 Non-lethal) | 360-degree thermal sensor, stealth flight (+6). |
| **Combat War-Hound**| Verbal / Pheromonal | 35 Health | Bite (2d6+2 Kinetic, Trip) | Scent tracking (DC 10), takedown grapple. |
| **Security Automaton**| Data Uplink | 60 Structure | Integrated Blaster (2d8 Energy) | Bodyguard reaction (absorbs hit for master). |
| **Aetheric Familiar** | Psionic Resonance | 20 Health | Mind Shock (1d10 Psychic) | Telepathic relay, extends master spell range +30m. |
| **Cyber-Steed Mount**| Saddle Rig / Neural | 80 Structure | Trample (2d10 Impact) | Ground Pace 90 ft / round, carrying capacity 300kg. |

---

## II. Command & Action Economy
- **Direct Command (1 Action):** Master spends 1 action to command companion to execute a specialized maneuver or attack.
- **Autonomous Sub-routine:** If uncommanded, companion executes default defensive posture or returns to master's side.
- **Loyalty & Morale Checks:** Biological companions make Will/Loyalty checks (DC 15) when reduced below 50% Health or facing supernatural terror.`,
    mechanic: `Companion Initiative = Master Initiative - 2 (acts immediately following master).
Drone Control Radius: Standard Comms = 500m; Neural Link = Line of Sight.`,
    guide: `Equip combat drones with socket mods (extra sensor packages, suppressed thrusters, reinforced plating).`,
    note: `Destroyed synthetic drones can be repaired via Mechanics DC 15; dead biological beasts require revivification or cloning.`
  },
  {
    id: "2-06-economic-unified-theory-eut",
    name: "2.06 Economic Unified Theory (EUT) & Macro-Trade Routes",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 6,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economy", "eut", "trade"],
    description: `# 2.06 Economic Unified Theory (EUT) & Macro-Trade Routes

The Tangent Economic Unified Theory establishes an absolute mathematical link between difficulty of production (**Crafting DC**), planetary market supply/demand, interstellar freight tariffs, and item valuations.

---

## I. The Master Valuation Equation
All goods, structures, starships, and cybernetics adhere to the **Tangent Standard Value Curve**:
$$\\text{Value (Credits)} = 10 \\times 4^{(\\text{DC} / 5)}$$

| Crafting DC | Item / Asset Class Benchmark | Canonical Credit Value |
| :---: | :--- | :---: |
| **DC 0** | Raw scrap, basic rations, matchsticks | **10 Cr** |
| **DC 5** | Knife, flashlight, civilian radio | **40 Cr** |
| **DC 10** | Standard kinetic pistol, light flak vest | **160 Cr** |
| **DC 15** | Military assault rifle, combat vac-suit | **640 Cr** |
| **DC 20** | Plasma cannon, powered combat armor | **2,560 Cr** |
| **DC 25** | Light combat mecha frame, neural cyber-rig | **10,240 Cr** |
| **DC 30** | Modular orbital habitat room, scout shuttle | **40,960 Cr** |
| **DC 35** | Armed corvette starship hull, heavy industrial core | **163,840 Cr** |
| **DC 40** | Star destroyer spinal railgun, planetary defense node | **655,360 Cr** |
| **DC 50** | Capital starship hull, orbital station superstructure | **10,485,760 Cr** |

---

## II. Interstellar Trade Modifiers
- **Source Origin Surplus:** -25% to -50% purchase price at primary manufacturing hub.
- **Fringe World Scarcity:** +50% to +200% price markup on high-tech goods (TL4+) in outer rim sectors.
- **Black Market / Contraband:** +100% markup; requires Streetwise / Underworld check vs Law Level DC.`,
    mechanic: `Item Value = 10 * 4^(DC / 5) Credits
Raw Material Crafting Cost = 50% of Base Market Value
Freight Tariff = 100 Cr per UDU Module per Parsec`,
    guide: `Use the master valuation curve to determine fair pricing for custom player inventions and black market contracts.`,
    note: `All prices in the DBM equipment and weaponry databases derive directly from this exponential curve.`
  }
];
