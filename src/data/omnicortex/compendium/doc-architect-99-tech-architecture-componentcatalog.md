---
id: "doc-architect-99-tech-architecture-componentcatalog"
name: "99. Tech (Architecture): Component Engineering Catalog"
fileName: "99.Tech.Architecture.ComponentCatalog.md"
relPath: "architect/technology/architecture/99.Tech.Architecture.ComponentCatalog.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 41
perspective: "architect"
entry_type: "Tech Matrix (architecture)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.architecture.componentcatalog","matrix"]
updatedAt: "2026-10-14T06:04:05.759Z"
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

# **ARCHITECTURAL COMPONENT ENGINEERING CATALOG**

## **IX. COMPONENT ENGINEERING CATALOG (CR Tables)**

> **NOTE ON SCALED VALUES:** To determine the actual operational values for a specific Structure, you must scale the component to the Structure's Frame (e.g., Huge is x5 Scale).

* **Capacity Cost:** Facilities and Armor explicitly scale to the host if they provide a scaled effect. If a Shield Generator requires "2 x Scale Modifier" Mounts, a Huge (x5) structure requires 10 Mounts (1 full Module) to install it.

### 

### **9.1 Hardpoints: Armor Plating & Energy Shields (Uses MOUNTS)**

In Tier 3 Architectural engineering, there is a strict delineation between the Frame (Chassis) and the Shell (Armor). The Frame dictates the total Structure Points (SP). The Shell provides Damage Resistance (DR). Armor CR is calculated per "Layer".

&nbsp;

**PHYSICAL PLATING**

| Armor Type | TL | CR | Effect (DR) | Capacity Cost (Mounts) |
| :---- | :---- | :---- | :---- | :---- |
| Industrial Steel Plate | 2 | 12 | DR 5 | 1 x Scale Modifier |
| Ceramic Composite | 3 | 18 | DR 10 | 2 x Scale Modifier |
| Reactive Armor (Explosive) | 3 | 20 | DR 15 (Single Use vs Kinetic) | 1 x Scale Modifier |
| Nanocarbon Weave | 4 | 25 | DR 15 (Lightweight) | 1 x Scale Modifier |
| Adamantine / Neutronium | 5 | 35 | DR 30 (Heavy) | 4 x Scale Modifier |

&nbsp;

**ENERGY SHIELDS**

| Armor Type | TL | CR | Effect (DR) | Capacity Cost (Mounts) |
| :---- | :---- | :---- | :---- | :---- |
| Deflector Screen (Ray Shield) | 3 | 22 | DR 10 vs Energy only | 2 x Scale Modifier |
| Kinetic Barrier | 4 | 25 | DR 10 vs Physical only | 2 x Scale Modifier |
| Omnishield Generator | 4 | 30 | DR 15 vs All | 3 x Scale Modifier |
| Hard-Light Hex Shield | 5 | 35 | DR 20 \+ Regenerates | 3 x Scale Modifier |

&nbsp;

**SPECIALTY COATINGS**

| Armor Type | TL | CR | Effect (DR) | Capacity Cost (Mounts) |
| :---- | :---- | :---- | :---- | :---- |
| Stealth Coating (Radar Absorbent) | 3 | 20 | \+4 Stealth vs Sensors | 0 |
| Thermal Dispersion | 3 | 18 | \+4 Stealth vs Thermal | 0 |
| Psionic Ward Lattice | ML 3 | 28 | DR 10 vs Psionic/Magic | 1 x Scale Modifier |

### 

### **9.2 Hardpoints: Structural Weaponry & Defenses (Uses MOUNTS)**

Structural weapon emplacements function as automated base defenses, heavy siege batteries, or planetary defense cannons.

* **Scale Rule:** Multiply the Base Damage and Base Range by the Structure's Scaling Modifier (e.g., A Huge Outpost with a x5 Scale Modifier firing a Base 2d10 Vulcan Minigun will roll 10d10 total damage).

&nbsp;

**BALLISTIC WEAPONRY (KINETIC)**

| Weapon Name | TL | CR | Mounts | Damage | Range | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Vulcan Minigun (Light) | 3 | 15 | 1 | 2d10 Ballistic | 2,000ft | Auto-Fire, Anti-Infantry |
| Light Autocannon (Light) | 3 | 18 | 2 | 3d10 Ballistic | 3,000ft | Burst Fire |
| ATGM Pod (Light) | 3 | 18 | 2 | 4d8 Explosive | 1 Mile | Homing, Ammo: 4 |
| Heavy Railgun (Heavy) | 3 | 25 | 4 | 4d10 Kinetic | 2 Miles | Penetration (Ignores 10 DR) |
| Siege Howitzer (Heavy) | 2 | 20 | 5 | 5d10 Explosive | 5 Miles | Arcing Fire (Indirect) |
| MAC Cannon (Heavy) | 4 | 30 | 6 | 6d10 Kinetic | Line of Sight | "Structure Killer" |
| Mass Driver (Titan) | 4 | 40 | 10 | 10d10 Kinetic | Orbital | Planetary Defense |

&nbsp;

**ENERGY WEAPONRY**

| Weapon Name | TL | CR | Mounts | Damage | Range | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Pulse Laser Battery (Light) | 3 | 18 | 1 | 2d8 Energy | 3,000ft | Accurate (+1 to Hit) |
| Plasma Flamer (Light) | 3 | 20 | 2 | 3d6 Thermal | Cone (100ft) | Ignores DR, Overheat risk |
| Ion Blaster (Light) | 3 | 18 | 1 | 1d10 Ion | 1,500ft | Dmg x2 vs Shields/Synthetics |
| Heavy Particle Beam (Heavy) | 4 | 28 | 4 | 5d8 Energy | Line (2,000ft) | Melts Armor (-2 DR to target) |
| PPC Projector (Heavy) | 4 | 30 | 5 | 4d10 Lightning | 4,000ft | EMP Effect (Stuns Systems) |
| Tachyon Lance (Heavy) | 5 | 35 | 4 | 4d12 Exotic | Line of Sight | Ignores Shields |
| Nova Cannon (Titan) | 5 | 45 | 12 | 12d10 Thermal | 10 Miles | Orbital Defense (WMD) |

&nbsp;

**INDUSTRIAL & CLOSE-PROXIMITY DEFENSES**

| Weapon Name | TL | CR | Mounts | Damage | Reach | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Hydraulic Siege Ram | 2 | 12 | 1 | 2d8 Bludgeon | Touch | Knockback. x2 dmg to structures. |
| Industrial Harvester Saw | 2 | 15 | 2 | 3d10 Slashing | Touch | Sundering (Destroys Armor) |
| Vibro-Cleaver (Defense Arm) | 3 | 20 | 2 | 4d8 Slashing | Reach | High Crit Range (19-20) |
| Thermal Lance (Pile Bunker) | 3 | 22 | 2 | 5d10 Piercing | Touch | Single Shot spike, penetration |
| Arc-Whip (Perimeter) | 4 | 25 | 1 | 3d8 Slashing | 30ft | Entangle / Trip intruding vehicles |
| Plasma Beam Emitter | 4 | 28 | 2 | 5d8 Energy | Reach | Penetrating \- Ignores 10 DR |
| Grav-Hammer Array | 5 | 35 | 3 | 6d10 Force | Reach | Knockback and AoE Shockwave |

### 

### **9.3 Hardpoints: Sensors & Aux Systems (Uses MOUNTS)**

| System Name | TL | CR | Function | Mounts |
| :---- | :---- | :---- | :---- | :---- |
| Passive Sensor Array | 2 | 5 | Rangefinders and external Cameras. | 5 |
| Sensor Suite (Radar/Lidar) | 3 | 15 | Range 5 miles. Detects movement. | 10 (1 Module) |
| Sensor Suite (Omni-Scan) | 4 | 25 | Range Orbit. Detects Life/Energy/Structure. | 20 (2 Modules) |
| Comm Array (A/V Radio) | 2 | 5 | Standard audio/visual planetary comms. | 5 |
| Scrambler Unit | 2 | 10 | Protects local comms from basic slicing. | 5 |
| ECM / Advanced Encryption | 4 | 20 | Scrambles comms/missiles (CR 15+ check to slice). | 20 (2 Modules) |
| Automated Targeting Base | 3 | 15 | \+1 to base Automated Defense attacks. | 10 (1 Module) |
| Smoke/Chaff Launcher | 2 | 12 | Obscures Vision (Reaction Action to incoming fire). | 1 |
| Tractor Beam | 4 | 25 | Immobilize Target (Str vs Str check to hold vessels). | 2 |
| Drone Hive (Swarm Bay) | 4 | 30 | Deploys 1d4 Automated point-defense drones. | 4 |

### 

### **9.4 Facilities: Living & Social (Uses MODULES)**

| Module Name | TL | CR | Function | Modules |
| :---- | :---- | :---- | :---- | :---- |
| Capsule / Coffin Block | 3 | 22 | Ultra-high density (20 pods). Morale: Poor. | 1 |
| Barracks | 1 | 12 | High-density bunks (12 troops). | 2 |
| Standard Hab-Unit | 2 | 16 | Studio apartment (1-2 people). | 1 |
| Luxury Suite | 3 | 25 | High-status (2,000 sq ft). \+1 Morale. | 4 |
| Mess Hall | 1 | 12 | Kitchen/Seating for 40\. | 2 |
| Lounge / Bar | 1 | 12 | Social hub. \+2 Diplomacy/Gather Info. | 2 |
| Holodeck | 4 | 35 | Hard-light sim room. Training XP bonus. | 2 |
| Sanctuary / Shrine | 1 | 10 | Meditation space. \+1 Willpower after rest. | 1 |

### 

### **9.5 Facilities: Vocation, Core & Logistics (Uses MODULES)**

| Module Name | TL | CR | Function | Modules |
| :---- | :---- | :---- | :---- | :---- |
| Command Center / Bridge | 2 | 10 | Basic manual controls and tactical oversight. | 2 |
| Neural-Link Ops Center | 4 | 25 | \+2 Initiative/Tactics. Direct brain interface. | 2 |
| Dedicated Shop / Lab | Varies | 20 | \+4 Equipment Bonus to relevant checks (5 users). | 1 |
| Full Facility Campus | Varies | 30 | \+6 Equipment Bonus to relevant checks (10+ users). | 4+ |
| Diagnostic Mainframe | 3-5 | 15+ | Scaling bonuses (+2 at TL3, \+4 at TL4, \+6 at TL5) to Repair. | 1 |
| Database Archives | 3-4 | 15+ | Scaling bonuses (+2 at TL3, \+4 at TL4) to Knowledge. | 1 |
| Fabricator Workshop | 3 | 25 | 50% reduced Crafting time for personal items. | 2 |
| Fabricator (Nano-Forge) | 5 | 40 | Creates complex ammo/items automatically in the field. | 4 |
| Server Farm | 3 | 24 | AI hosting. \+2 Computing defense. | 2 |
| Secure Vault | 3 | 30 | Reinforced (DR 30 walls). CR 30 Break/Hack to enter. | 1 |
| Brig / Detention Center | 3 | 24 | 10 Cells with force fields. | 4 |
| Cargo Bay (Expandable) | 2 | 10 | Converts Modules to bulk Tonnage (1,000 tons). | 2+ |
| Garage Bay | 2 | 14 | Stores 2 Large Ground Vehicles safely. | 1 |
| Hangar Bay (Small) | 3 | 24 | Stores 1 Huge Aircraft/Starfighter. | 4 |
| Hangar Bay (Large) | 3 | 28 | Stores 1 Gargantuan Shuttle or dropship. | 10 |

### 

### **9.6 Facilities: Medical & Hazard Mitigation (Uses MODULES)**

| Module Name | TL | CR | Function | Modules |
| :---- | :---- | :---- | :---- | :---- |
| Life Support (Environmental) | 3 | 15 | Sealed vs Vacuum/Poison. 24hr emergency air. | 1 |
| Base Purification Plant | 3 | 20 | Advanced recyclers. Actively restores degraded Supply Dice. | 2 |
| Enviro-Dome Generator | 3 | 15 | 20ft radius of Environmental Protection Rating (EPR) 1\. | 1 |
| Emergency Evacuation Bunker | 3 | 15 | Saves key personnel on structural destruction. | 1 |
| Autodoc Station | 4 | 20 | Autonomous robotic surgeon (runs Operation Software). | 1 |
| Operating Theater | Varies | 20 | \+4 Equipment Bonus to Medicine checks. | 1 |
| Medical Lab (Facility) | Varies | 30 | \+6 Equipment Bonus. Supports multiple trauma patients. | 4+ |
| Repair Drones (Auto-Doc) | 4 | 28 | Restores 1d10 Structure Points/minute to the building. | 2 |
| Vertical Traversal Rails | 4 | 15 | Advanced elevator shafts (Take 10 on climb). | 0.5 |
| Grav-Attenuator Shafts | 5 | 25 | Dampens gravity. Advantage on traversal/rapid movement. | 1 |

### 

### **9.7 Core Internals (Generators & Infrastructure)**

| Component | TL | CR | Notes |
| :---- | :---- | :---- | :---- |
| Internal Combustion Generator | 2 | 12 | Requires liquid fuel. Loud, creates heavy exhaust. |
| High-Capacity Battery Bank | 3 | 15 | Silent. Limited operational duration if cut off. |
| Micro-Fusion Reactor | 3 | 22 | Infinite duration (years). Volatile breach risk. |
| Antimatter Core | 4 | 30 | Massive energy output. Catastrophic breach if destroyed. |
| Zero-Point Energy Node | 5 | 35 | Infinite power. No heat signature. |
| Hydraulic Servos | 2 | 10 | Infrastructure for heavy moving parts (blast doors/elevators). |
| Myomer Musculature | 3 | 18 | Infrastructure for mobile structures. Silent operation. |
| Gyroscopic Stabilizers | 3 | 15 | Advantage on structural stability checks (earthquakes/impacts). |

## 

## 

## ---

