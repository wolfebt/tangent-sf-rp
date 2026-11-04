---
id: "doc-operator-3-00-vehicularcombat"
name: "3.00 Vehicular Combat"
fileName: "3.00.VehicularCombat.md"
relPath: "operator/combat/3.00.VehicularCombat.md"
isMasterDoc: false
masterDocId: "doc-operator-3-00-combat"
category: "operator_rule"
parent: "doc-operator-3-00-combat"
order: 239
perspective: "operator"
entry_type: "Combat Module"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","combat","3.00.vehicularcombat","mechanics"]
updatedAt: "2026-11-04T09:33:29.393Z"
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

# **3.00.05 VEHICULAR COMBAT**

In the Tangent universe, vehicular combat is not a separate minigame; it is a direct scale escalation of the core **2d10 resolution engine**. Whether piloting a nimble hover-bike through a cyberpunk undercity, striding across a battlefield in a bipedal combat walker, or commanding a gargantuan void-cruiser in orbit, the tactical loop remains identical: **Action, Reaction, Consequence**.

---

## **I. OPERATIONAL FUNDAMENTALS**

### **1. The Tactical Round & Crew Action Economy**

Vehicular combat operates on the standard **6-second Combat Round**, with all crew members acting on the **Pilot's Initiative Count** while tracking their own personal Actions (governed by their individual Skill Stages):

* **Vehicular Initiative (Determined by the Pilot):**
  > **Pilot Initiative = 2d10 + Pilot's Agility Modifier + Alertness Skill Rank + Vehicle Handling Modifier**
  * *Handling Modifier:* An intrinsic statistic of the vehicle chassis (`2.00.Mecha.md` / `99.Technology.MechaMatrix.md`)—for example, an agile Interceptor Fighter has `+4`, while a ponderous Capital Ship has `-4`.
* **The Crew Turn (Multi-Operator Platforms):**
  * **Pilot:** Controls vehicle **Movement**, **Evasive Maneuvers (Defense)**, **Ramming**, and **Fixed Forward Weapons** (firing within a 45-degree forward arc).
  * **Gunner(s):** Control **Turrets** (360-degree arc), **Pintle-mounted weapons**, and **Missile batteries** (`2d10 + Agility/Intellect + Combat [Heavy Weapons / Heavy Energy] + Targeting Computer Bonus`). Gunners act on the Pilot's Initiative count using their own Action pool.
  * **Engineer / System Operator:** Manages **Shield distribution**, **Sensor Locks** (`Computers` / `Knowledge [Technology]`), **Electronic Warfare**, and emergency **Jury-Rig repairs** (`Vocation [Mechanic / Engineer]`).
  * **Commander:** Issues tactical orders (`Leadership` / Coordinated Assist) to grant `+2` to `+4` bonuses to Pilot, Gunner, or Engineer checks.

### **2. Scale & Relative Size Modifiers (`1.10 SCALING.md`)**

The most critical factor in vehicular warfare is **Scale**. A holdout pistol cannot scratch a main battle tank, and a dreadnought's spinal battery cannot easily track a lone infantryman:

* **David vs. Goliath (Small Attacker vs. Large Vehicle):** Small targets firing at Large vehicles gain a positive **Relative Combat Modifier to Hit** (e.g., `+4` against a Huge `x5` Mecha), but personal-scale weapons must still overcome the vehicle's heavy **Damage Resistance (DR)**.
* **Goliath vs. David (Large Vehicle vs. Small Target):** Large vehicle weapons suffer the negative **Relative Combat Modifier to Hit** nimble personal targets (Tracking Penalty, unless using Area-of-Effect blast ordnance or point-defense arrays), while inflicting **Scaled Damage** (`Base Weapon Dice * Active Scale Multiplier`).
* **Mecha Scale Multiplier Rule (No Double-Dipping SP):** Structure Points (`SP`) listed in vehicle and mecha size tables (`Medium 50 SP`, `Large 100 SP`, `Huge 250 SP`, `Gargantuan 500 SP`, `Colossal 1,000 SP`) are **already pre-calculated** for their scale. Never multiply table SP by the Scale Multiplier a second time; apply the active **Scale Multiplier** strictly to **weapon damage dice, movement speed, and weapon range** during play.

---

## **II. DOMAINS OF WAR**

### **1. Land (Terrestrial & Walker)**

Combat defined by **Terrain**, **Elevation**, and **Cover**:

* **Cover & Hull-Down Positioning:** Vehicles use buildings, ridges, and wreckage for Cover (`+4` to `+10` Defense bonus). A **Hull-Down** position (only the turret exposed above a ridge) grants **+4 Defense**.
* **Ramming:** A high-impact collision maneuver:
  * *Attack:* The Pilot rolls an opposed **Piloting Check vs. Target Defense / Reflex**.
  * *Damage:* Inflicts **`1d10` Blunt/Concussive damage per 10 feet of current Speed** (multiplied by the ramming vehicle's Scale Multiplier). **Both vehicles take this damage**, though the heavier/larger vehicle takes **half (`1/2`) damage**.
* **Walker Mechanics:** Bipedal and quadrupedal mecha can execute **Melee Stomp** and **Grapple** attacks against infantry or rival walkers (`Piloting` or `Unarmed/Melee` skill) and step over vertical obstacles that block wheeled or tracked vehicles.

### **2. Nautical (Surface & Submerged)**

Combat defined by **Depth** and **Acoustic Detection**:

* **Sonar & Sensors:** Underwater visual range is near zero. Combat relies on **System Ops (`Computers` / `Knowledge [Technology]`)** sensor checks against target `Stealth` to acquire a **Target Lock**. Without an active Lock, all attacks beyond Point Blank are rolled at **Disadvantage**.
* **Depth Bands:**
  * *Surface:* Standard atmospheric and aquatic operation.
  * *Periscope / Shallow Depth:* Grants concealment against surface and aerial observers.
  * *Deep / Abyssal:* Extreme hydrostatic pressure; hull breaches at Deep depth are catastrophic, flooding compartments for `1d6` Crushing/Drowning damage per round until bulkheads are sealed.

### **3. Atmospheric (Aerial Dogfighting)**

Combat defined by **Altitude**, **Airspeed**, and **Energy Management**:

* **The Dogfight (Pilot vs. Pilot):** When two aircraft or aerospace fighters engage at close range, they enter a **Dogfight**:
  * *Mechanic:* Opposed **Piloting Checks (`2d10 + AGI + Piloting + Handling`)** at the start of the round.
  * *Winner:* Gains **Advantage** on all attack rolls against the loser this turn and dictates relative positioning (securing **Tail / Flank** position).
  * *Loser:* Counts as **Flat-Footed** (losing Agility/Active Defense) against the Winner until they break the lock.
* **Stalling:** Non-VTOL/non-grav aircraft flying slower than their minimum **Stall Speed** must pass a **Piloting Check (`CR 20`)** or stall and begin falling in an uncontrolled dive.

### **4. Interstellar (Space & Vector Combat)**

Combat defined by **Newtonian Vectors**, **Thermal Signatures**, and **3D Distance**:

* **Newtonian Drift ("Running Silent"):** In zero-G vacuum, a vessel continues coasting along its last momentum vector without expending fuel. A Pilot can cut main thrusters to drift silently (**Stealth** / "Running Cold") while rotating the hull on reaction thrusters to fire along any vector, imposing **Disadvantage** on enemy sensor lock checks.
* **Heat Signatures:** Firing high-energy weapons, charging jump drives, or lighting main fusion thrusters flares the vessel's thermal signature:
  * *Mechanic:* **Passive Sensors** detect flared ships automatically within line of sight. **Active Sensors (Ping)** are required to lock onto "Cold" drifting ships (whichsimultaneously reveals the pinging ship's location).
* **Starship Proximity Damage (`x40` Enormous Scale & Above):** Capital-ship weaponry is so overwhelmingly powerful that near-misses and point-impact shockwaves deal **1/10th splash/concussive damage** to fighter- or personal-scale targets within a blast radius equal to half the weapon's scale multiplier in feet.

---

## **III. COMBAT INTERACTIONS**

### **1. Pilot vs. Pilot (Vehicle vs. Vehicle)**

The duel of machines:

* **Evasive Maneuvers (Standard Action):** The Pilot trades their offensive Attack action to weave aggressively, imposing **Disadvantage** on all incoming attacks against the vehicle until the Pilot's next turn.
* **Jinking (Reaction):** A Reaction to being fired upon. The Pilot spends 1 Reaction to roll `2d10 + AGI + Piloting + Handling` against the incoming Attack Roll. Success negates the hit, but reduces the vehicle's available movement speed by **50%** on its next turn.
* **Fixed vs. Turret Mounts:**
  * *Fixed Weapons:* Fire in a **45-degree forward arc**; require the Pilot to orient the entire vehicle toward the target.
  * *Turrets:* Fire across a **360-degree arc**; operated by Gunners independently of the vehicle's facing and movement vector.

### **2. Gunner vs. Mecha (Infantry vs. Vehicle)**

The asymmetry of scale:

* **The Armor Threshold:** Vehicles possess heavy **Damage Resistance (DR)**. Small arms (pistols, standard rifles) often cannot penetrate:
  * *Rule:* If an attack's raw damage does not exceed the vehicle's **Armor DR**, the shot ricochets harmlessly (**No effect / Glancing Blow**).
* **Called Shots (Targeting Weak Points — `-5` Strike):** Infantry can bypass heavy hull plating by targeting optical sensors, exposed tracks, knee actuators, or exhaust vents:
  * *Mechanic:* Attack at a **`-5` Strike penalty**. On a hit, **ignore 50% of the vehicle's Armor DR** OR force a targeted subsystem check (e.g., immobilizing a track or blinding a sensor pod).
* **Boarding (Infantry Hull Assault):** A daring operator can clamber onto a slow-moving or stationary vehicle:
  * *Mechanic:* Roll an **Athletics Check vs. Vehicle Speed / Defense CR**. Success places the operator directly *on* the hull—bypassing relative Scale tracking penalties on subsequent attacks and allowing direct placement of breaching/demolition charges against hatches or vents.

### **3. Gunner vs. Structure (Siege Warfare)**

Demolition and fortification breaching:

* **Static Defense (`CR 5`):** Stationary buildings and fortifications have **0 Agility** and an effective **Static Defense of `CR 5`**, making them automatic hits under normal combat conditions.
* **Hardness (DR) & Architectural Modules:** Buildings are constructed in structural **Modules** (e.g., a 10 ft x 10 ft reinforced wall section; `2.00.Architecture.md`).
* **Siege Damage (`2x` Damage):** Heavy Weapons (Explosive, Demolitions, Heavy Energy, and Siege ordnance) deal **Double (`2x`) Damage** against stationary structures.
* **Breaching & Collapse:**
  * **0 SP (Breach):** Reducing an architectural Module to **`0 SP`** blasts open a **Breach** (hole) large enough for infantry or small walkers to pass through.
  * **-50% Max SP (Structural Collapse):** Reducing a Module to **`-50%` of its Maximum SP** triggers a **Collapse** of that section and any unsupported overhead floors.

---

## **IV. DAMAGE, SYSTEM FAILURE & CATASTROPHE**

Vehicles do not simply fall unconscious; they degrade, lose subsystems, burn, and detonate.

### **1. Damage Thresholds**

* **Glancing Blow (`Damage <= DR`):** Incoming damage does not exceed the vehicle's Armor DR. The shot bounces off (**0 SP lost**).
* **Penetrating Hit (`Damage > DR`):** Incoming damage exceeds Armor DR. Subtract DR from the damage and deduct the remainder from the vehicle's **Structure Points (SP)**.
* **Critical Hit (`Natural 20` or `Attack >= Defense + 10`) / `50% SP` Threshold:** Whenever a vehicle suffers a **Critical Hit** (or beat Defense by 10+) OR when its Structure Points drop to **50% of Maximum SP**, roll on the **System Failure Table** below (`1d6` Fast Play Table or `1d10` Expanded Tactical Table).

### **2. Vehicular System Failure Tables (`1d6` Fast & `1d10` Tactical)**

#### **A. Fast Play System Failure Table (`1d6`)**

1. **Motive System:** Maximum Speed is reduced by **50%** (treads thrown, wing clipped, leg actuator sheared).
2. **Weapon System:** One random weapon mount is **Disabled / Jammed** until repaired.
3. **Sensor / Comms:** Optics and radar blinded or silenced; **Disadvantage** on all targeting rolls beyond Point Blank.
4. **Crew Compartment:** Penetrating trauma! Pilot/Crew inside take **half (`1/2`) of the net damage** dealt to the vehicle.
5. **Power Plant:** Vehicle vents smoke and plasma fire, suffering **`1d6` Pyro/Burn damage per turn** (ignoring DR).
6. **Catastrophic Leak:** Fuel cell or reactor core goes critical! The vehicle **explodes in `1d4` rounds** unless an Engineer passes an emergency **Vocation (Mechanic/Engineer) or Knowledge (Technology) Check (`CR 20`)**.

#### **B. Expanded Tactical Subsystem Failure Table (`1d10`)**

| `1d10` Roll | Struck Subsystem | Mechanical Consequence *(Field Repair: Vocation [Mechanic/Engineer] `CR 20`)* |
| :---: | :--- | :--- |
| **1** | **Reactor / Power Core** | Power fluctuation! Vehicle is **Dazed** (1 Action only) for 1 round; a second Reactor hit triggers a **Core Meltdown in `1d4` rounds**. |
| **2 – 3** | **Propulsion / Thrusters** | Motive systems damaged: **Maximum Speed is halved (`1/2`)** and **Handling suffers `-2`**. |
| **4 – 5** | **Armor / Hull Breach** | Structural plating sheared: **Armor DR is permanently reduced by `-5`** (and cabin decompresses in vacuum or floods at depth). |
| **6 – 7** | **Primary Weapon Mount** | One random weapon hardpoint is **Disabled** until repaired. |
| **8** | **Sensors & Comms Array** | Electronics blinded: All ranged attacks beyond Short Range suffer **Disadvantage** (`-5` Alertness/Sensors). |
| **9** | **Shield / Gyro Stabilizer** | Energy shields collapse to **`0 AP`** (or unshielded vehicle suffers `-4` Handling and must pass a **CR 15 Piloting check** or spin out). |
| **10** | **Cockpit / Crew Compartment** | Penetrating trauma! **Half (`1/2`) of the net damage** bypasses the hull and strikes the Pilot/Crew directly. |

### **3. Destruction & Catastrophic Explosion**

* **0 SP (Disabled):** The vehicle grinds to a halt and all primary systems go offline. The chassis remains intact and can be repaired during downtime.
* **Negative SP `> 50%` of Max SP (Destroyed):** When negative SP exceeds half of the vehicle's maximum SP (i.e., `-50% Max SP`), the chassis is reduced to a total wreck (**Scrap value `10%` only**).
* **Catastrophic Explosion:** If a vehicle is reduced to Destroyed status (`-50% Max SP`) by **Pyro/Fire, Energy, or Explosive/Concussive** damage (or a Reactor Meltdown), its power plant and munitions detonate:
  * **Blast Radius:** **`10 feet` per Size Category** above Miniscule.
  * **Explosion Damage:** **`1d6` Concussive/Pyro damage per `10 SP` of the vehicle's Maximum Structure** (Reflex Save `CR 15` for half damage; splits 50/50 between Vitality and Health).

