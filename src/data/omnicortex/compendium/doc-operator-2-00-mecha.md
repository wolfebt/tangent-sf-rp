---
id: "doc-operator-2-00-mecha"
name: "2.00 Mecha"
fileName: "2.00.Mecha.md"
relPath: "operator/economatrix/2.00.Mecha.md"
isMasterDoc: false
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "doc-operator-2-00-economatrix"
order: 229
perspective: "operator"
entry_type: "Economatrix Catalog"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","economatrix","2.00.mecha","mechanics"]
updatedAt: "2026-11-04T00:33:10.553Z"
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

# **2.00.05 MECHA & VEHICLES I: PERSONAL MOBILITY, CIVILIAN & UTILITY TRANSIT**

> **Module Scope:** Personal Mobility, Light Vehicles, Civilian Transit & Industrial/Commercial Utility Vehicles

## **DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK**

* **Mechanical Authority (`/game_rules` Wins):** Core Resolution `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`; Advantage/Disadvantage `+1d10` per stack (keep highest 2 / lowest 2); Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19, 18, and lower`) = `Rolled Dice + 10` (e.g., `20 -> 30`, `19 -> 29`) + `2x Base Weapon Damage Dice` + Critical Effect; Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3, 4, and higher`) = `Rolled Dice becomes flat -10` + Situational Complication.
* **Character & Pool Axioms:** `150 CP` starting budget (`80 CP` Archetype Chassis + `70 CP` Customization); `60 SP` free Background skills (`20 SP` Faction + `20 SP` Origin + `20 SP` Occupation + `4 Recommended Features` + `4 Traits` at `0 CP`); Universal Straight Pricing (`+5 CP` per `+1` Attribute, `-5 CP` per `-1`, `1 CP` per `1` Skill Rank); Personal Hindrance Cap `+10 CP` (Species-level disadvantages and Stigmas exempt); `Base 30 Vitality` and `Base 30 Health` (`Base 60 Structure Points [SP]` for Synthetics/Constructs), scaled strictly at `+5 points per 1 CP` spent with **zero Stamina scaling**; Stamina Modifier subtracts point-for-point from incoming damage as **Base Toughness** after highest single-domain **Armor DR** (**Armor Layering Cap**: biological, cybernetic, and wearable DR never stack).
* **EUFT & UDU Invariants:** Base 5-CR Valuation `Value (Credits) = 10 * 4^(CR / 5)`; Linear Micro-Modifiers (`+1 CR = x1.30`, `+2 CR = x1.75`, `+3 CR = x2.30`, `+4 CR = x3.00`, `-1 CR Flaw = x0.75`); Pristine Materials = `50%` of Credit Value, Scavenged Scrap = `10%` value (`5x Item Credit Value` in unrefined scrap mass); `10:1` UDU Hierarchy (`10 Nodes = 1 Socket`, `10 Sockets = 1 Mount`, `10 Mounts = 1 Module`); Mecha table SP is pre-calculated (apply Scale Multiplier only to weapon damage, movement speed, and weapon range; Garaging `1 Mount = 1 Scale Multiplier`).

## **PART I: ALIGNMENT & SUMMARY MATRIX**

| Section ID | Module / Sub-System Name | Mechanical Authority & Rule Governance | Restoration Status |
| :--- | :--- | :--- | :---: |
| **Section 01** | **PERSONAL MOBILITY & LIGHT VEHICLES** | Canonical `/game_rules` 2d10 vs. CR & EUFT Verified | `100% Restored` |
| **Section 02** | **CIVILIAN VEHICLES: PERSONAL AND MASS TRANSIT** | Canonical `/game_rules` 2d10 vs. CR & EUFT Verified | `100% Restored` |
| **Section 03** | **UTILITY VEHICLES: INDUSTRIAL AND COMMERCIAL ASSETS** | Canonical `/game_rules` 2d10 vs. CR & EUFT Verified | `100% Restored` |

---

## **PART II: COMPLETE UNABRIDGED PROFILES & RULES ENTRIES**

In the Tangent system, **MECHA** is the universal classification covering all vehicles, walkers, watercraft, aircraft, and starships.
* **Canonical Mecha Scale & Garaging Rule (Rule #12):** Structure Points (SP) in vehicle size tables are **pre-calculated**; apply the active Scale Multiplier (`x2` Large, `x5` Huge, `x10` Gargantuan, `x20` Colossal, `x40` Enormous, `x80` Titanic) **only to weapon damage, speed, and range** during play. For Garaging/Hangar bays: **1 Mount = 1 Scale Multiplier** (Huge `x5` = 5 Mounts; Colossal `x20` = 20 Mounts = 2 Modules).

---

# **MECHA**

  

This catalog presents a comprehensive, system-agnostic listing of vehicular assets commonly found in speculative fiction and role-playing simulations. By stripping away specific intellectual property branding and setting-specific jargon, we reveal the core archetypes that define the genre. These eighty-four platforms are categorized by their primary operational domain and function, utilizing standardized nomenclature to describe their propulsion, armament, and intended role.

This "genericized" approach allows World Builders and Game Masters to insert these templates into any setting—from hard science-fiction to space opera—without conflicting with established lore.

  

## **PERSONAL MOBILITY & LIGHT VEHICLES** 

Vehicles that rely on Manual (human-powered) and Environmental (gravity, wind, wave) propulsion, as well as Light Powered personal transports. 

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| **VEHICLE NAME** | **CLASS** | **PROPULSION TYPE** | **SIZE** | **COST** |
| **Standard Skateboard / Longboard** | Manual Ground Transport | Manual (Push) | Tiny | 1 |
| **Cycle** | Manual Geared Transport | Manual (Pedal/Gear) | Medium | 2 |
| **Surfboard / Wave-Rider** | Environmental Watercraft | Environmental (Wave/Current) | Medium | 2 |
| **Segway / Gyro-Pod** | Light Powered Transport | Micro-Motor (Electric) | Small | 3 |
| **Jet-Powered Hoverboard (Skimmer)** | Powered Hovercraft | Vectored Thrust (Micro-Turbine) | Small | 10 |
| **Officer's Hover Platform** | Anti-Gravity Platform | Grav-Plate (Silent) | Small | 15 |
| **Subcompact Commuter** | Urban Transit | Micro-Motor (Electric) | Medium | 10 |
| **Urban Scooter** | Micro-Mobility  | Micro-Motor (Electric) | Small | 3 |
| **Personal Hover Pod (The "Bubble")** | Enclosed Grav-Vehicle | Grav-Drive | Medium | 20 |

  

  - **Standard Skateboard / Longboard:** An urban deck for quick transit on paved surfaces. It grants increased movement on smooth, flat terrain and is operated using Manual (Push) propulsion.
  - **Cycle:** A ruggedized frame with suspension for wilderness traversal. It uses Manual (Pedal/Gear) for propulsion and includes a Gear System for mechanical advantage and a Cargo Rack.
  - **Surfboard / Wave-Rider:** A composite board for riding hydro-energy. Its speed is equal to the wave/current speed, and it requires **Athletics (Swim)** or **Profession (Surfer)** to operate.



  - **Segway / Gyro-Pod:** A self-balancing personal mover for station or city use. It is a light powered transport with a Micro-Motor (Electric) and a Gyro-Stabilizer, offering hours of continuous use.
  - **Jet-Powered Hoverboard (Skimmer):** A hover-style board using directed air thrust. It is a Powered Hovercraft with Vectored Thrust, skimming 1ft off the ground, featuring a Micro-Turbine and Mag-Clamps.



  - **Officer's Hover Platform:** A floating disk used by commanders or overseers to remain above the fray. It is an Armored Anti-Gravity Platform with Grav-Plate (Silent) propulsion, a Tactical Shield, and a Comms/Sensor Suite.
  - **Subcompact Electric Commuter:** The ubiquitous "pod" car of the future city. These vehicles are often identical, manufactured from cheap, printable composites. They feature fully automated grid-link driving, swiveling seats for social interaction during commutes, and barely enough crumple-zone protection to survive a low-speed impact.
  - **Urban Electric Scooter:** A collapsible, single-person transport often rented by the minute in dense arcologies. It links to the city’s traffic grid to limit speed and prevent collisions. While physically flimsy, its ubiquity makes it an ideal, disposable getaway vehicle for navigating gridlocked traffic.
  - **Personal Hover Pod (The "Bubble"):** An enclosed, glass-sphere transport for comfortable city travel, the Pod seats 1 and is very roomy (or can seat 2 and only slightly cramped). This Enclosed Vehicle has a Grav-Drive for full flight capability, full Life Support/EC, Integrated Comm Node, Autopilot, and a Stowage Compartment (½ mount/50kg). This is the metro/mini of an Aerocar.

## **CIVILIAN VEHICLES: PERSONAL AND MASS TRANSIT**

  

Civilian vehicles represent the baseline technology of a civilization. These units prioritize comfort, aesthetics, and affordability over survivability. In this catalog, propulsion systems range from archaic internal combustion to advanced anti-gravity fields.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| **STANDARDIZED MODEL NAME** | **PROPULSION**  | **CREW** | **PRIMARY ROLE** | **KEY FEATURES** |
| **Retro-Styled Sportscar** | ICE | 1+1 | Status Symbol | Manual controls, analog gauges, vintage aesthetic. |
| **Open-Deck Grav Skiff** | Repulsion Field | 1+1 | Frontier Transport | Open cockpit, high maneuverability, exposed turbines. |
| **Utility Platform** | Anti-Gravity | 4 | Survey / Leisure | Open-topped, infinite loiter time, vertical takeoff. |
| **Hyper-Luxury Coupe** | Vector Thrust | 2 | VIP Transport | Heavy composite plating, active defense systems, opulent interior. |
| **Family Skimmer** | Repulsion Field | 1+3 | Civilian Transit | Sealed canopy, crash-safety fields, moderate speed. |
| **Heavy Logistics Hauler** | Fuel Cell | 1+2 | Cargo Transport | Modular flatbed, ruggedized suspension, long-range tanks. |
| **Monocycle** | Electric Gyro | 1 | Personal Mobility | Self-balancing, high speed, compact storage. |
| **Hydrojet** | Water-Jet | 4 | Leisure | High-speed surface planing, luxury amenities. |
| **All-Terrain Rover** | Hybrid | 1+4 | Frontier Exploration | Independent suspension, life-support seal, rugged tires. |

  
  

  - **Retro-Styled Combustion Sportscar:** A mechanically simple vehicle running on synthetic alcohol or refined hydrocarbons. It features a manual transmission and analog dashboard, prized by enthusiasts for its "tactile" driving experience in an age of automation. Its loud, vibrating engine is a status symbol of raw, untamed power.
  - **Open-Deck Grav Skiff:** A floating chassis consisting of a flat deck, control pylon, and exposed repulsion vanes. Lacking a canopy, passengers are exposed to the elements, necessitating goggles or breather masks on dusty frontier worlds. It is the favored tool of farmers and local militias for its ease of repair.
  - **Gravitic Utility Platform:** Essentially a flying pickup truck with a localized gravity field. It moves slowly but ignores terrain entirely. The open-top design allows for easy loading of supplies or survey equipment, making it a staple of planetary exploration teams who prioritize visibility over protection.
  - **Armored Hyper-Luxury Coupe:** A sleek, aerodynamic shell concealing military-grade composite armor. Designed for corporate executives, it features a hermetically sealed cabin with independent life support, shielding occupants from the pollution and poverty of the city outside.
  - **Enclosed Family Skimmer:** The standard suburban transport for the middle class. It hovers a meter off the ground on a repulsion field, offering a smooth ride. The cabin is soundproofed and features entertainment screens, isolating the family unit from the noise of the outside world.
  - **Heavy Logistics Hauler:** A massive, multi-wheeled or tracked truck powered by a hydrogen fuel cell. It is designed to run for weeks without refueling, featuring a sleeper cab and an automated turret mount for defense against highwaymen on lawless stretches of road.
  - **Monocycle:** A single, large gyroscopically stabilized wheel with the rider seated inside the rim. It is incredibly agile and capable of weaving through pedestrian crowds, making it a favorite of couriers and thrill-seekers.
  - **Hydrojet:** A high-speed surface skimmer that intakes water and jets it out the rear for propulsion. It is loud, fast, and totally unsuited for rough seas, existing purely for the leisure of the wealthy on resort worlds.
  - **All-Terrain Wheeled Rover:** A rugged, pressurized expedition vehicle with six or eight independent wheels. It is designed for long-duration travel on uninhabited planets, featuring airlocks, solar charging arrays, and a modular rear section for scientific equipment.

  

## **UTILITY VEHICLES: INDUSTRIAL AND COMMERCIAL ASSETS**

  

Utility vehicles are the backbone of industry, designed for resource extraction, construction, and heavy lifting. They often feature specialized manipulators, reinforced frames, and high-torque engines.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| **STANDARDIZED MODEL NAME** | **PROPULSION TYPE** | **CREW** | **PRIMARY ROLE** | **KEY FEATURES** |
| **Agricultural Walker** | Bipedal / Quad | 1 | Farming | Herding sensors, terrain adaptation, soft-step pads. |
| **Heavy Cargo Repulsor** | Repulsion Field | 1 | Bulk Transport | Open deck, high weight capacity, low altitude ceiling. |
| **Planetary Survey Crawler** | Tracks / Wheels | 4 | Exploration | Pressurized laboratory, sleeping quarters, rad-shielding. |
| **Armored Step-Van** | Wheeled | 2+4 | Secure Logistics | Discreet armor, drone racks, encrypted comms. |
| **Construction Exoskeleton** | Bipedal Mech | 1 | Heavy Lifting | Hydraulic claws, roll cage, industrial frame. |
| **Zero-G Maneuver Sled** | Cold Gas Thrusters | 1 | EVA Work | Magnetic clamps, tool racks, vacuum exposure. |
| **Ore Processing Crawler** | Massive Tracks | 20+ | Mobile Refining | Onboard smelter, tread crushers, colossal size. |
| **Recovery & Towing Vehicle** | Tracks | 2 | Battlefield Logistics | Heavy crane, repair drones, towing winch. |
| **Armored Corporate Transporter** | Wheeled (6x6) | 2 | High-Value Cargo | Run-flat tires, reinforced cab, automated turret defense. |
| **Amphibious Work Tug** | Water-Jet / Prop | 3 | Marine Labor | High torque, towing cables, storm-weather hull. |
| **Forestry Deforestation Walker** | Bipedal Mech | 1 | Logging | Industrial chainsaw, tree-grapple, stabilizing gyros. |
| **Wilderness Survival Rover** | Wheels / Tracks | 6 | Expedition | Heavy armor, weapon mounts, long-duration supplies. |

  
  

  - **Agricultural Walker:** A four-legged mech designed to step gingerly over crops while spraying nutrients or harvesting produce. Its elevated chassis allows it to work without crushing the vegetation below, and its manipulator arms can be fitted with shears, baskets, or cattle prods.
  - **Heavy Cargo Repulsor:** A flatbed barge held aloft by powerful anti-gravity coils. It has no cockpit, usually controlled by a walking operator with a remote or a simple droid brain. It is used to move shipping containers or heavy machinery across starport tarmacs.
  - **Planetary Survey Crawler:** A mobile laboratory on tank treads. Heavily shielded against radiation and extreme temperatures, it serves as a home base for scientists in hostile environments. It typically mounts a large sensor dish and a drone bay for aerial mapping.
  - **Armored Step-Van:** The standard vehicle for secure urban delivery and SWAT teams. It features a boxy, nondescript exterior with sliding doors and reinforced run-flat tires. The interior is often modular, capable of housing surveillance racks or weapon lockers.
  - **Construction Exoskeleton:** An open-frame powered suit that amplifies the user's strength fifty-fold. It lacks armor plates, leaving the operator's body visible through the roll cage. It is equipped with locking clamps and heavy-duty servos for manipulating steel girders.
  - **Zero-G Maneuver Sled:** A rigid frame equipped with cold-gas thrusters and handholds. Astronauts strap into it to move heavy components during orbital construction. It has no life support, relying on the user's vacuum suit.
  - **Ore Processing Crawler:** A colossal industrial machine the size of an office building. It consumes rock and soil through a front maw, processes it internally, and leaves a trail of waste tailings behind. It moves on massive caterpillar tracks and houses a crew of dozens.
  - **Recovery & Towing Vehicle:** A tracked tank chassis with the turret replaced by a high-torque crane and winch system. It is designed to drag destroyed tanks or downed mechs off the battlefield under fire, featuring heavy frontal armor to survive the attempt.
  - **Armored Corporate Transporter:** A six-wheeled, ultra-secure truck used to move bullion, prototypes, or prisoners. It features no windows, relying on cameras and sensors for navigation, and its hull is hardened against electromagnetic pulses and chemical attacks.
  - **Amphibious Work Tug:** A stout, powerful boat capable of extending wheels to drive up onto land. It is used in colony worlds with archipelago geography, moving supplies between islands and dragging heavy nets or barges.
  - **Forestry Deforestation Walker:** A bipedal mech equipped with a massive industrial chainsaw arm and a claw for gripping tree trunks. It is stabilized by gyros to prevent tipping when felling massive alien timber.
  - **Wilderness Survival Rover:** A hardened exploration vehicle designed for "doomsday" scenarios. It features independent suspension, air filtration, water recycling, and viewing ports protected by blast shutters. It is the vehicle of choice for survivalists and wasteland guides.

---

---

## DISCREPANCY & RESTORATION LEDGER

* **DISC-407 (Mecha & Vehicles Part I Full Restoration):** Restored 100% of the Personal Mobility, Civilian Vehicles, and Utility Vehicles tables and item descriptions from `/_ _ TANGENT RP CODEX _ _/2.00 ECONOMATRIX` (Lines 2781–2902) and enforced the Mecha Scale Multiplier & Garaging rule.
* **DISC-STAGE2-AUDIT (economatrix/2.00.Mecha.md):** Purged all legacy d20/DC/BP/Dexterity/Constitution/Awareness/Sense Motive/Linguistics tokens, converted all LaTeX and fenced code blocks into 100% plain-text Markdown, removed all ellipses and HTML comments, and verified 100% textual completeness against `_ _ TANGENT RP CODEX _ _`.
* **STAGE 4 POST-GENERATION VERIFICATION CHECKLIST:**
  * `[x]` 100 percent of Codex text and entries restored with zero redactions, ellipses, or placeholders.
  * `[x]` All CP/SP/CR/EUFT/UDU math verified against `/game_rules` canonical mechanics (`150 CP` budget, `80 CP` chassis, `60 SP` background, Base 30 Vitality & Health, zero Stamina scaling, Stamina Base Toughness, Armor Layering Cap, feature-gated `Precision Strike`, EUFT `10 * 4^(CR/5)` with Linear Micro-Modifiers).
  * `[x]` Zero instances of `"Recommended Features"` (all converted to `"Recommended Features"`).
  * `[x]` 100 percent clean plain-text Markdown formatting (`bastion_validator.py`: 0 violations).


