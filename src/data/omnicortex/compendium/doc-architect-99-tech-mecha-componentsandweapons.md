---
id: "doc-architect-99-tech-mecha-componentsandweapons"
name: "99. Tech (Mecha): Components, VFT & Weapons"
fileName: "99.Tech.Mecha.ComponentsAndWeapons.md"
relPath: "architect/technology/mecha/99.Tech.Mecha.ComponentsAndWeapons.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 38
perspective: "architect"
entry_type: "Tech Matrix (mecha)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.mecha.componentsandweapons","matrix"]
updatedAt: "2026-10-14T06:04:05.765Z"
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

# **MECHA COMPONENTS, VFT & WEAPONS CATALOG**

### **Component Engineering (CR Tables)**

In the Tangent Matrix, the Crafting Challenge Rating (CR) determines both the complexity of manufacturing a component and its market value (Wealth Rating).

&nbsp;

**NOTE: BASE STAT BLOCKS & SCALED VALUES** The statistics listed in the tables below represent the **Base Stat Block** (x1 Scale equivalent) for each component. To determine the actual operational values for a specific Mecha, you must scale the component to the Mecha's frame.

* **Capacity Cost:** Weapons and Modules explicitly scale to the host. (e.g., A weapon integrated into a Huge x5 Mecha consumes the listed base Mounts, but occupies Mount space *of that scale*).  
* **Armor Mount Scaling:** The Mount cost of armor strictly equals the Mecha's Scaling Modifier multiplied by the base material cost.

#### 

#### **1.1 Propulsion Systems**

Propulsion DCs are modified by Tech Level (TL) and Size Category. The Base Speed is multiplied by the Mecha's Scaling Modifier to determine final Tactical Speed.

&nbsp;

**GROUND SYSTEMS**

| SYSTEM TYPE | TL | CR | MOUNTS | SPEED | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Standard Wheels/Treads | 2 | 10 | 0 | 40 ft/rnd | Reliable, cheap. \-2 to Agility checks. |
| Independent Suspension | 2 | 15 | 1 | 40 ft/rnd | Ignores light terrain penalties. |
| Omni-Wheels / Spheres | 4 | 20 | 1 | 40 ft/rnd | Allows lateral movement (strafing). |

&nbsp;

**WALKER SYSTEMS**

| SYSTEM TYPE | TL | CR | MOUNTS | SPEED | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Bipedal Hydraulics | 2 | 15 | 1 | 20 ft/rnd | Slow, stable. Industrial use. |
| Bipedal Myomer (Standard) | 3 | 20 | 1 | 30 ft/rnd | Human-like movement. Standard Speed. |
| Quadruped / Hexapedal | 3 | 22 | 2 | 40 ft/rnd | \+4 Stability, Increased Load Capacity. |
| Reverse-Joint (High Agility) | 4 | 25 | 2 | 40 ft/rnd | \+10ft Base Speed, \+2 Jump checks. |

&nbsp;

**AERO & FLIGHT**

| SYSTEM TYPE | TL | CR | MOUNTS | SPEED | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Rotor / Propeller Lift | 2 | 15 | 1 | 60 ft/rnd | Loud, vulnerable to atmosphere. |
| Vectored Thrust (Jet) | 3 | 20 | 2 | 90 ft/rnd | High speed, fuel intensive. |
| Anti-Gravity / Repulsorlift | 4 | 30 | 2 | 80 ft/rnd | Silent, ignore terrain, hover capability. |
| Gravitonic Flight (Orbital) | 5 | 40 | 3 | 200+ ft/rnd | Space-capable, inertial dampening. |

&nbsp;

**AQUATIC**

| SYSTEM TYPE | TL | CR | MOUNTS | SPEED | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Ballast & Propeller | 2 | 15 | 1 | 30 ft/rnd | Standard sub-surface movement. |
| Hydro-Jet / Supercavitation | 3 | 20 | 2 | 60 ft/rnd | High speed underwater. |

#### 

#### **1.2 Armor Plating & Defense**

In Tier 2 Mecha engineering, there is a strict delineation between the **Frame** (Chassis) and the **Shell** (Armor). The Frame (Size Category & Body Type defined in Steps 1 & 2\) dictates the total Structure Points (SP) and UDU Capacity (Mounts) of the vehicle. The Shell (Armor Plating & Shields) provides **Damage Resistance (DR)** and **Ablative Points (AP)** but does **not** provide baseline SP or capacity.

*Combat Integrity Note:* When a vehicle is reduced to 50% SP, or suffers a Critical Hit, roll on the System Failure table.

**Coverage (Layer Scaling):** The Mount cost of armoring a vehicle scales with its size. The base Mount cost of armor must equal the Mecha's **Scaling Modifier** (e.g., Armoring a Huge x5 Mecha with standard plating consumes exactly 5 Mounts). Heavier armors multiply this cost further. Armor CR is calculated per "Layer" or Upgrade.

&nbsp;

**PHYSICAL PLATING**

| ARMOR TYPE | TL | CR | EFFECT (DR) | MOUNTS |
| :---- | :---- | :---- | :---- | :---- |
| Industrial Steel Plate | 2 | 12 | DR 5 | 1 x Scale Modifier |
| Ceramic Composite | 3 | 18 | DR 10 | 2 x Scale Modifier |
| Reactive Armor (Explosive) | 3 | 20 | DR 15 (Single Use vs Kinetic) | 1 x Scale Modifier |
| Nanocarbon Weave | 4 | 25 | DR 15 (Lightweight) | 1 x Scale Modifier |
| Adamantine / Neutronium | 5 | 35 | DR 30 (Heavy) | 4 x Scale Modifier |

&nbsp;

**ENERGY SHIELDS**

| ARMOR TYPE | TL | CR | EFFECT (DR) | MOUNTS |
| :---- | :---- | :---- | :---- | :---- |
| Deflector Screen (Ray Shield) | 3 | 22 | DR 10 vs Energy only | 2 x Scale Modifier |
| Kinetic Barrier | 4 | 25 | DR 10 vs Physical only | 2 x Scale Modifier |
| Omnishield Generator | 4 | 30 | DR 15 vs All | 3 x Scale Modifier |
| Hard-Light Hex Shield | 5 | 35 | DR 20 \+ Regenerates | 3 x Scale Modifier |

&nbsp;

**SPECIALTY COATINGS**

| ARMOR TYPE | TL | CR | EFFECT (DR) | MOUNTS&nbsp; |
| :---- | :---- | :---- | :---- | :---- |
| Stealth Coating (Radar Absorbent) | 3 | 20 | \+4 Stealth vs Sensors | 0 |
| Thermal Dispersion | 3 | 18 | \+4 Stealth vs Thermal | 0 |
| Psionic Ward Lattice | ML 3 | 28 | DR 10 vs Psionic/Magic | 1 x Scale Modifier |

#### 

#### **1.3 Modules (Systems & Utility)**

Modules represent major installed rooms or functional blocks, typically for Size Large and above.

**OPERATIONAL & TACTICAL**

| MODULE NAME | TL | CR | FUNCTION | MOUNTS |
| :---- | :---- | :---- | :---- | :---- |
| Cockpit (Standard) | 2 | 10 | Basic manual controls. | 2 |
| Cockpit (Neural Link) | 4 | 25 | \+2 Initiative/Reflex. Direct brain interface. | 2 |
| Life Support (Environmental) | 3 | 15 | Sealed vs Vacuum/Poison. 24hr air. | 1 |
| Ejection System | 3 | 15 | Saves pilot on destruction. | 1 |
| Targeting Computer (Basic) | 3 | 15 | \+1 to Attack Rolls. | 1 |
| Targeting Computer (AI) | 4 | 25 | \+2 Attack, Auto-track targets. Replaces Crew need. | 1 |
| Sensor Suite (Radar/Lidar) | 3 | 15 | Range 5 miles. Detect movement. | 1 |
| Sensor Suite (Omni-Scan) | 4 | 25 | Range Orbit. Detect Life/Energy/Structure. | 2 |
| ECM / Jammer | 3 | 18 | Scrambles comms/missiles (CR 15 check). | 2 |

&nbsp;

**UTILITY**

| MODULE NAME | TL | CR | FUNCTION | MOUNTS |
| :---- | :---- | :---- | :---- | :---- |
| Cargo Bay (Expandable) | 2 | 10 | Converts Mounts to Tonnage. | 2+ |
| Repair Drones (Auto-Doc) | 4 | 28 | Restores 1d10 Structure/minute. | 2 |
| Fabricator (Nano-Forge) | 5 | 40 | Creates ammo/items in the field. | 4 |

#### 

#### **1.4 Components (Core Internals)**

| COMPONENT | TL | CR | NOTES |
| :---- | :---- | :---- | :---- |
| Internal Combustion Engine | 2 | 12 | Requires liquid fuel. Loud. |
| High-Capacity Batteries | 3 | 15 | Silent. Limited range. |
| Micro-Fusion Reactor | 3 | 22 | Infinite duration (years). Volatile breach. |
| Antimatter Core | 4 | 30 | Massive energy output. Catastrophic breach. |
| Zero-Point Energy Node | 5 | 35 | Infinite power. No heat signature. |
| Hydraulic Servos | 2 | 10 | \+2 Strength for lifting. |
| Myomer Musculature | 3 | 18 | \+4 Strength, silent operation. |
| Gyroscopic Stabilizers | 3 | 15 | Advantage on Balance/stability checks. |

### 

### 

### ---

### **Variable Form Technology (VFT)**

Variable Form Technology allows units to reconfigure their physical chassis to adapt to combat conditions, specifically bridging the gap between high-mobility vehicle modes, static defensive structures, and versatile biomimetic (humanoid/animal) forms.

**1\. VFT Tech Level Progression** The efficiency, speed, and method of these transformations are strictly gated by Tech Level (TL).

* **TL3: Mechanical Articulation (The "Hard" Shift):** Hydraulic actuators and sliding rails. Slow (Full Round Action), vulnerable during shift.  
* **TL4: Programmable Matter (The "Fluid" Shift):** "Smart-Matter" composites. Rapid (Movement Action), can occur mid-maneuver.  
* **TL5: Polymatter & Holophotonics (The "State" Shift):** Sub-atomic rearrangement or hard-light projection. Near Instantaneous (Swift Action).

**2\. Alternate Form Classifications**

* **Form Type A: Structural Integration (Bastion Mode):** Transformation from a mobile vehicle/mech into a static defensive emplacement. \+100% Armor, \-100% Speed.  
* **Form Type B: Biomimetic Configuration (Mecha/Beast Mode):** Transformation from a vehicle into a humanoid or animalistic form for terrain traversal. Gains Melee, Dodge/Evasion, \-50% Armor.  
* **Form Type C: Vehicular Configuration (Interceptor Mode):** Transformation into a streamlined vehicle for rapid transit. Optimized for Speed and Momentum.

**3\. VFT Design & Cost Protocols**

* **Multi-Form Efficiency:** 10% reduction of total available mounts for each EXTRA FORM.  
* **Differential Costing:** The most expensive design is the foundation price. ALL forms and functions prices are totaled for each form separately for credit value, apply a 20% reduction to the cost of additional forms and then summarize the values for WS total.

### 

### 

### ---

### **Meta-Tech Integration: Synthesizing Science and Sorcery**

In the Tangent Universe, the divide between science and sorcery is treated purely as a matter of origin, not effect. Meta-Tech represents the engineering necessary to accommodate reality-warping patterns within physical Sockets and Mounts. This integration is governed by the Meta-Conversion capacity system, which utilizes the Universal Displacement Unit (UDU) hierarchy. The type of UDU capacity used (Socket, Mount, or Module) dictates the Operational Scale of the effect, while the Power Level is determined by the Skill Rank installed during creation.

| PHYSICAL UNIT | OPERATIONAL SCALE | CAPACITY LIMIT FOR INVOCATIONS |
| :---- | :---- | :---- |
| 1 Socket | Personal Scale | Holds up to Rank 10 (Trained Effect) |
| 2 Sockets | Personal Scale | Holds up to Rank 20 (Master Effect) |
| 3 Sockets | Personal Scale | Holds up to Rank 30 (Pinnacle Effect) |
| 1 Mount | Vehicle Scale | Holds any Rank up to Pinnacle (Rank 30\) |
| 1 Module | Strategic Scale | Holds any Rank up to Pinnacle (Rank 30\) |

&nbsp;

### 

### ---

The **Principle of Scale** dictates that an Invocation installed in a Mount is fundamentally more potent than the identical spell in a Socket. A Rank 10 Teleport installed in a personal suit (1 Socket) moves an individual 5 miles; the same Rank 10 Teleport installed in a Mecha (1 Mount) moves a 10-ton vehicle 25 miles.

**Passive Enhancement vs. Active Imbuement** Meta-Tech fabrication requires highly specialized conductive materials—such as Aetherium for active Imbuements or Resonance Crystals for passive Enhancements—which are extremely rare and always constitute 50% of the item's exorbitant final value. It serves three distinct engineering goals:

* **Enhancement (Passive):** The application of Matter or Energy disciplines to permanently improve the physical properties of a device. These effects are "Always On" and do not require an action to activate. Examples include an Energy Sheath (adding \+1d6 elemental damage to a blade), Ghost-Strike (allowing a weapon to phase through physical DR), or Featherweight (altering local gravity to make armor count as a lighter weight category). Each UDU Slot allocated to an Enhancement increases the item's Crafting CR by \+5, effectively quadrupling its market value.  
* **Imbuement (Active):** Hard-coding a specific metaphysical Invocation (spell) into a machine, allowing a non-Awakened user to cast the effect via a physical trigger. The device's statistics become fixed constants based on the engineering quality. The Crafting CR for an Imbuement is calculated as: 15 \+ Invocation Rank \+ TL Modifier (TL3: \+0, TL4: \+2, TL5: \+5). (Example: A "Blink Suit" imbued with a Rank 10 Teleport at TL 4 occupies 1 UDU slot and possesses a Craft CR of 27).  
* **Consumable Modifier:** If a Meta-Tech module is designed for a single use (e.g., a one-time emergency planar shift that burns out the crystals), the final Meta-Tech CR is reduced by 10\.  
* **Interface (Symbiotic):** Devices that amplify an Awakened user's natural metaphysical skills. When an Awakened user channels through an Amplifier (such as an Elemental Focus Cannon taking up 1 Mount), the Invocation's output is multiplied by the Chassis Scale. A spell cast through a Huge Mecha (x5 Scale) deals five times the damage and expands its area of effect proportionately.

### 

### 

### ---

### **Combat & Damage Mechanics: Offensive and Defensive Hardware Systems**

The Equipment Matrix provides a unified structure for the creation, classification, and modification of weapons and armor. Moving beyond simple item lists, the matrix defines the "DNA" of combat gear—its component parts, resource requirements, and capacity for evolution through Sockets and Mounts.

**1\. Weapon Anatomy and Scaling Mechanics** Every weapon in the Tangent system is defined by a standard Stat Block detailing its Core Identity (Name, Classification, Size Category, Tech Level), Combat Statistics (Damage, Range, Penetration), and Logistics (Ammunition, Bulk, Mounts/Sockets, Craft CR).

A critical component of the Tangent combat engine is the replacement of arbitrary "type-based" multipliers with "size-based" logic, determined by the Scaling Modifier. This scaling system determines how a creature or object's size affects its interaction with the world:

* **Damage and Structure:** Weapon damage dice are strictly multiplied by the Scaling Modifier. A Huge mecha (x5 Scaling) deals five times the base damage dice with its weapons, and its Structure Points are multiplied by five. Importantly, no damage is arbitrarily reduced due to a target being a larger size; larger targets simply possess proportionally increased Structure Points and Damage Reduction to absorb the impact.  
* **Distance and Area:** Movement speed, weapon ranges, and area-of-effect parameters are multiplied by the Scaling Modifier.  
* **Starship Proximity Damage:** At Enormous scales (x40) and above, weapons are so overwhelmingly powerful that they utilize Proximity Damage. Overwhelming attacks from capital ships often vaporize small targets instantly and deal 1/10th indirect damage (splash effect, debris) to small targets not directly hit, within a radius equal to half the attacker's Strength Modifier in feet.  
* **Relative Combat Modifiers:** The Combat Modifier adjusts an entity's Agility, Attack, and Defense scores based on the relative size of their opponent. When a Large attacker targets a Small defender, the attacker suffers a significant penalty (subtracting the target's modifier from their own), reflecting the difficulty of hitting a nimble, diminutive target with massive weaponry. Conversely, when a Tiny attacker targets a Small defender, they gain a moderate advantage.

**2\. Targeting Sub-Systems (Called Shots)**

* **Penalty:** \-5 Strike.  
* **Threshold:** \> 10% of Vehicle's Total SP in a single hit disables the system.

### 

### ---

### **Mecha Weapons Catalog**

Mecha weapons are significantly larger than personal arms. They are classified by UDU capacity usage (Size) and Damage Output.

**NOTE: BASE STAT BLOCKS & SCALED VALUES** The statistics listed in the tables below represent the **Base Stat Block** (x1 Scale equivalent) for each weapon. To determine the actual operational values for a specific Mecha, you must multiply the Base Damage and Base Range by the Mecha's **Scaling Modifier**. (e.g., A Huge Mecha with a x5 Scale Modifier firing a Base 2d10 Vulcan Minigun will roll 10d10 total damage).

* **Scale Rule (Siege Warfare):** All damage listed is applied to Structure Points. As per core rules, Heavy Weapons (Explosive and Energy classifications) deal **Double Damage** when targeting stationary architectural structures and modules. If used against personal-scale targets (infantry), damage is massive (GM Discretion: typically Instant Death or x10 damage).  
* **Mounts:** 1 Weapon typically occupies a specific number of "Mount Slots" on the chassis. Many weapons may be carried or externally mounted if the mecha form allows and will not take internal mounts. One-handed use is limited to a device of 1 to 3 mount slots in size.

#### 

#### **2.1 BALLISTIC WEAPONRY (KINETIC / EXPLOSIVE)**

Reliable, heavy, requires ammunition. *Note: Explosive tags trigger Siege Warfare rules vs Structures.*

| WEAPON NAME | TL | CR | MOUNTS | DAMAGE | RANGE | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **LIGHT MOUNTS** |  |  |  |  |  |  |
| Vulcan Minigun | 3 | 15 | 1 | 2d10 Ballistic | 2,000ft | Auto-Fire, Anti-Infantry |
| Light Autocannon | 3 | 18 | 2 | 3d10 Ballistic | 3,000ft | Burst Fire |
| Anti-Tank Guided Missile (Pod) | 3 | 18 | 2 | 4d8 Explosive | 1 Mile | Homing, Ammo: 4\. (Siege dmg) |
| **HEAVY MOUNTS** |  |  |  |  |  |  |
| Heavy Railgun (Linear Cannon) | 3 | 25 | 4 | 4d10 Kinetic | 2 Miles | Penetration (Ignores 10 DR) |
| Siege Howitzer | 2 | 20 | 5 | 5d10 Explosive | 5 Miles | Arcing Fire. (Siege dmg) |
| MAC (Magnetic Accel. Cannon) | 4 | 30 | 6 | 6d10 Kinetic | Line of Sight | "Structure Killer" |
| **SUPER-HEAVY (TITAN)** |  |  |  |  |  |  |
| Mass Driver | 4 | 40 | 10 | 10d10 Kinetic | Orbital | City-Block Damage |

#### 

#### **2.2 ENERGY WEAPONRY**

No ammo required (draws from reactor), high heat, versatile effects. *Note: Energy tags trigger Siege Warfare rules vs Structures.*

| WEAPON NAME | TL | CR | MOUNTS | DAMAGE | RANGE | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **LIGHT MOUNTS** |  |  |  |  |  |  |
| Pulse Laser Battery | 3 | 18 | 1 | 2d8 Energy | 3,000ft | Accurate (+1 to Hit) |
| Plasma Flamer | 3 | 20 | 2 | 3d6 Thermal | Cone (100ft) | Ignores DR, Overheat risk |
| Ion Blaster | 3 | 18 | 1 | 1d10 Ion | 1,500ft | Dmg x2 vs Shields/Synthetics |
| **HEAVY MOUNTS** |  |  |  |  |  |  |
| Heavy Particle Beam | 4 | 28 | 4 | 5d8 Energy | Line (2,000ft) | Melts Armor (-2 DR to target) |
| PPC (Particle Projector) | 4 | 30 | 5 | 4d10 Lightning | 4,000ft | EMP Effect (Stuns Systems) |
| Tachyon Lance | 5 | 35 | 4 | 4d12 Exotic | Line of Sight | Ignores Shields |
| **SUPER-HEAVY (TITAN)** |  |  |  |  |  |  |
| Nova Cannon | 5 | 45 | 12 | 12d10 Thermal | 10 Miles | Blast Radius 500ft |

#### 

#### **2.3 MELEE WEAPONRY (LARGE SCALE)**

Used by walkers and exoskeleton suits. Requires Strength checks.

| WEAPON NAME | TL | CR | MOUNTS | DAMAGE | REACH | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **BASIC** |  |  |  |  |  |  |
| Pneumatic Fist / Ram | 2 | 12 | 1 | 2d8 Bludgeon | Touch | Knockback. x2 dmg to structures. |
| Industrial Chainsaw | 2 | 15 | 2 | 3d10 Slashing | Touch | Sundering (Destroys Armor) |
| **ADVANCED** |  |  |  |  |  |  |
| Vibro-Blade (Sword/Axe) | 3 | 20 | 2 | 4d8 Slashing | Reach | High Crit Range (19-20) |
| Thermal Lance (Pile Bunker) | 3 | 22 | 2 | 5d10 Piercing | Touch | Single Shot spike, penetration |
| Arc-Whip (Monofilament) | 4 | 25 | 1 | 3d8 Slashing | 30ft | Entangle / Trip |
| **ENERGY MELEE** |  |  |  |  |  |  |
| Beam Saber | 4 | 28 | 2 | 5d8 Energy | Reach | Penetrating \- Ignores 10 DR |
| Gravity Hammer | 5 | 35 | 3 | 6d10 Force | Reach | Knockback and AoE Shockwave |

#### 

#### **2.4 SPECIALIZED & AUXILIARY SYSTEMS**

| WEAPON NAME | TL | CR | MOUNTS | EFFECT | NOTES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Smoke/Chaff Launcher | 2 | 12 | 1 | Obscures Vision | Reaction Action |
| Mining Drill Laser | 3 | 18 | 2 | 3d6 Thermal | Tool. Dmg x2 vs Stationary Objects |
| Tractor Beam | 4 | 25 | 2 | Immobilize Target | Str vs Str check to hold |
| Drone Hive (Swarm) | 4 | 30 | 4 | Deploys 1d4 Drones | Drones have independent actions |

### 

### 

### ---

