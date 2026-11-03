---
id: "doc-architect-99-tech-equipment-systemsandmastercrafting"
name: "Tech (Equipment): Systems, Biotech & Mastercrafting"
fileName: "99.Tech.Equipment.SystemsAndMastercrafting.md"
relPath: "architect/technology/equipment/99.Tech.Equipment.SystemsAndMastercrafting.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 35
perspective: "architect"
entry_type: "Tech Matrix (equipment)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.equipment.systemsandmastercrafting","matrix"]
updatedAt: "2026-11-02T22:49:14.710Z"
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

# **EQUIPMENT SYSTEMS, BIOTECH & MASTERCRAFTING**

## **Offensive and Defensive Hardware Systems**

The Equipment Matrix provides a unified structure for the creation, classification, and modification of weapons and armor. Moving beyond simple item lists, the matrix defines the "DNA" of combat gear—its component parts, resource requirements, and capacity for evolution through Sockets.

### **Weapon Anatomy and Scaling Mechanics**

Every weapon in the Tangent system is defined by a standard Stat Block detailing its Core Identity (Name, Classification, Size Category, Tech Level), Combat Statistics (Damage, Range, Penetration), and Logistics (Ammunition, Bulk, Sockets, Craft CR).

A critical component of the Tangent combat engine is the replacement of arbitrary "type-based" multipliers with "size-based" logic, determined by the Scaling Modifier.

* **Damage and Pre-Calculated Structure:** Weapon damage dice are strictly multiplied by the active **Scale Multiplier**. A Huge creature/vehicle (x5 Scaling) deals five times the base damage dice with its weapons, while its Structure Points (SP) in the Size Table are pre-calculated. Importantly, no damage is arbitrarily reduced due to a target being a larger size; larger targets simply possess proportionally increased Structure Points and Damage Resistance to absorb the impact.
* **Distance and Area:** Movement speed, weapon ranges, and area-of-effect parameters are multiplied by the Scale Multiplier.
* **Starship Proximity Damage:** At Enormous scales (x40) and above, weapons are so overwhelmingly powerful that they utilize Proximity Damage. Overwhelming attacks from capital ships often vaporize small targets instantly and deal 1/10th indirect damage (splash effect, debris) to small targets not directly hit, within a radius equal to half the attacker's Strength Modifier in feet.
* **Relative Combat Modifiers:** The Combat Modifier adjusts a creature's Agility, Attack, and Defense scores based on the relative size of their opponent. When a Large attacker targets a Small defender, the attacker suffers a significant penalty (subtracting the target's modifier from their own), reflecting the difficulty of hitting a nimble, diminutive target with massive weaponry. Conversely, when a Tiny attacker targets a Small defender, they gain a moderate advantage.

### **Protective Equipment and Armor Construction**

Armor serves as a destructible resource—a second skin with its own structural integrity, socket capacity, and resistance tier. Armor construction is defined by three primary factors:

* **Chassis Class (Base Matrix):** Dictates the base capacity for integrated Sockets, structural integrity (SP), and maximum agility. Classes range from Light (Clothing/Mesh, 1 Socket, 10 SP) to Heavy (Assault Shells, 4 Sockets, 40 SP) to Powered Exoskeletons (6+ Sockets, 120 SP).
* **Coverage (Layer Scaling):** A multiplier applied to the Chassis Class based on how much of the body is protected. Partial coverage (vests/greaves) halves SP and Sockets, while Bulwark coverage (excessive layering) doubles SP but halves Socket capacity and severely restricts mobility.
* **Materials (Tech Level):** Dictates the base Damage Resistance (DR) percentage and applies a final multiplier to the Structure Points. TL 1 Iron offers 50% DR and a x0. SP multiplier, whereas TL 4 Nanocarbon offers 125% DR and a x2. SP multiplier.
* **Armor Layering Cap:** DR does not stack across biological, cybernetic, and wearable domains; only the single highest DR applies.

Armor modules can be installed into Sockets to radically alter operational capability. Common modules include Ablative Foam (emergency SP restoration), Cloaking devices (+20 Stealth while stationary), Enviro-Seals (hermetic vacuum protection), and Grav-Chutes (inertial dampeners negating falling damage). Personal Field Generators (Shields) provide a regenerative buffer of Ablative Points (AP), requiring 2 Sockets and granting 20 AP that recharges at 5 AP per round.

## **Meta-Tech Integration: Synthesizing Science and Sorcery**

In the Tangent Universe, the divide between science and sorcery is treated purely as a matter of origin, not effect. Meta-Tech represents the engineering necessary to accommodate reality-warping patterns within physical Sockets. This integration is governed by the Meta-Conversion capacity system, which utilizes the UDU hierarchy.

The type of UDU capacity used (Socket, Mount, or Module) dictates the Operational Scale of the effect, while the Power Level is determined by the Skill Rank installed during creation.

| PHYSICAL UNIT | OPERATIONAL SCALE | CAPACITY LIMIT FOR INVOCATIONS |
| :--- | :--- | :--- |
| 1 Socket | Personal Scale | Holds up to Rank 10 (Trained Effect) |
| 2 Sockets | Personal Scale | Holds up to Rank 20 (Master Effect) |
| 3 Sockets | Personal Scale | Holds up to Rank 30 (Pinnacle Effect) |
| 1 Mount | Vehicle Scale | Holds any Rank up to Pinnacle (Rank 30) |
| 1 Module | Strategic Scale | Holds any Rank up to Pinnacle (Rank 30) |

The Principle of Scale dictates that an Invocation installed in a Mount is fundamentally more potent than the identical spell in a Socket. A Rank 10 Teleport installed in a personal suit (1 Socket) moves an individual 5 miles; the same Rank 10 Teleport installed in a Mecha (1 Mount) moves a 10-ton vehicle 25 miles.

### **Passive Enhancement vs. Active Imbuement**

Meta-Tech serves three distinct engineering goals:

1. **Enhancement (Passive):** The application of Matter or Energy disciplines to permanently improve the physical properties of a device. These effects are "Always On" and do not require an action to activate. Examples include an *Energy Sheath* (adding +1d6 elemental damage to a blade), *Ghost-Strike* (allowing a weapon to phase through physical DR), or *Featherweight* (altering local gravity to make armor count as a lighter weight category). Each Socket allocated to an Enhancement increases the item's Crafting CR by +5, effectively quadrupling its market value.
2. **Imbuement (Active):** Hard-coding a specific metaphysical Invocation (spell) into a machine, allowing a non-Awakened user to cast the effect via a physical trigger. The device's statistics become fixed constants based on the engineering quality. The Crafting CR for an Imbuement is calculated as `15 + Invocation Rank + TL Modifier (TL3: +0, TL4: +2, TL5: +5)`.
3. **Interface (Symbiotic):** Devices that amplify the user's natural metaphysical skills. When an Awakened user channels through an Amplifier (such as an Elemental Focus Cannon taking up 1 Mount), the Invocation's output is multiplied by the Chassis Scale. A spell cast through a Huge Mecha (x5 Scale) deals five times the damage and expands its area of effect proportionately.

Meta-Tech fabrication requires highly specialized conductive materials—such as Aetherium for active Imbuements or Resonance Crystals for passive Enhancements—which are extremely rare and always constitute 50% of the item's exorbitant final value.

## **Specialized Gear and Utility Ecosystems**

Beyond combat and architecture, the Equipment Matrix codifies the rules for exploration, survival, and computational problem-solving, ensuring that all gear interfaces seamlessly with core gameplay loops.

### **Advanced Grown Technologies (Biotech Protocols)**

Factions utilizing grown biotechnology subvert traditional battery mechanics, requiring distinct operational rules. Grown tech is subject to three core protocols:

1. **Symbiosis (Bonding):** Living gear must genetically and bio-electrically "bond" with a host over a 24-hour attunement period. Failure to attune results in a persistent -2 operational penalty across all checks.
2. **Sustenance (Feeding):** Grown technology cannot be recharged via a power grid; it requires nutrient consumption. Minor items (Diminutive/Tiny size) feed harmlessly on the user's waste heat and dead skin flakes. Heavy weapons and armor must be fully submerged in a Nutrient Solution (costing 10 Cr per dose) once per week, lest they degrade and gain the "Broken" (Starving) condition.
3. **Bio-Repair:** Damage to living gear is healed via Medicine or Xenobiology checks rather than Engineering. A healthy host naturally facilitates the automatic regeneration of 1 Structure Point per hour for their bonded equipment.

**Specific Factional Innovations:**

1. **Empathic Carapace (Auluran):** Reactive armor that adapts when struck by energy (Fire/Cold/Elec), granting DR +5 against that specific energy type for the remainder of the Scene.
2. **Chorist Node (Auluran):** A grown neural-graft transceiver. Allows Telepathy (1 mile radius) with other Node users and grants Advantage on Empathy checks.
3. **Sunglass Laminates (Alterian):** Crystalline structures grown from silica and light. Acts as a solar capacitor, recharging energy weapons automatically in sunlight.
4. **Hive-Resin (Kitin):** A secreted construction material lighter than plasteel but self-sealing. Structures grant +2 to Stealth (sound dampening) inside them.

### **Programmable Matter and Utility Devices**

Beyond the organic growth of the Auluran, high-tech factions utilize advanced material science for everyday utility. Programmable Matter, often referred to as "Picotech" (TL 4, CR 25), consists of a canister of smart sand or fluid metal that can be commanded to reshape into any Simple tool, requiring user instruction to shift forms. Visual utility is provided by Image Projectors, which scale from TL 2 (CR 5) units projecting 2D images with sound, up to TL 3 (CR 10) Holo Emitters capable of projecting localized 3D holograms.

### **Computational Assets and Software Systems**

Computers and digital decks are defined by their Processor Rating (PR). A Basic Processor (TL 3, CR 10) operates at PR 0, capable only of simple calculations and data storage. Advanced Processors (TL 5, CR 25) reach PR 4 and can host robust Persona AIs, possessing pseudo-intelligence and a Charisma score equal to their PR.

Computers run specialized software to aid users. **Expert Software** (ranging from CR 10 to CR 30) grants a direct +1 to +5 Aid Bonus to specific Skill checks. **Operation Software** allows a user to automatically "Take 10" on specific skill checks when the software is active, critically reducing the risk of catastrophic failure during routine high-stakes operations, such as orbital astrogation or systemic hacking.

### **Surveillance and Communications**

Information gathering and transmission are categorized into three distinct operational spheres. Passive Sensors range from simple TL 2 (CR 5) Rangefinders and Cameras to TL 3 (CR 10) Holo-Cams. Comm Units dictate connection scale: Audio/Visual radios (TL 2, CR 5) handle standard comms, Holographic transceivers (TL 3, CR 10) project 3D representations, and Telepathic arrays (TL 4/5, CR 25) allow for planetary-scale communication requiring the Telepathy skill. To protect this data, Counter-Intel gear includes TL 2 (CR 10) Scrambler Units and advanced TL 4 (CR 20) Encryption Suites.

### **Vocation Tools and Facilities**

Vocation tools provide direct Equipment Bonuses to relevant skill checks, scaling rapidly with the facility's volumetric footprint and the number of users supported:

* **Basic Tools:** A portable belt or pack (CR 5) that requires Trained skill but offers no intrinsic bonus, supporting 1 user.
* **Full Set:** A semi-portable caddy (CR 10) requiring Trained skill, granting a +2 Equipment Bonus and supporting 2 users.
* **Shop/Lab:** A dedicated room (CR 20) requiring Expert skill, granting a +4 Equipment Bonus and supporting 5 users.
* **Facility:** A building or campus (CR 30) requiring Master skill, granting a +6 Equipment Bonus and supporting 10 or more users.

Specific tool systems integrate directly into this hierarchy. Diagnostics Systems and Databases grant scaling bonuses (+2 at TL 3, +4 at TL 4, and +6 at TL 5) to Repair and Knowledge checks respectively. Multi-Tools replicate non-powered tools at TL 3 (CR 10), powered tools at TL 4 (CR 15, +2 Bonus), and become fully polymorphic at TL 5 (CR 25, +4 Bonus).

Medical tools follow these exact scaling rules. A Field Surgery Pack acts as a basic kit (Tiny, CR 10) granting a +2 Equipment Bonus to Medicine checks. A Portable Nurse is a TL 3 unit running Expert Software that acts as an automated secondary aid. An Autodoc is a TL 4 (CR 20) fully autonomous robotic surgeon capable of running Operation Software independently. **Operating Theaters** are Medium-sized room installations (CR 20) granting a +4 Equipment Bonus. Finally, a Medical Lab requires a Facility-sized architectural Module (CR 30), granting a +6 Equipment Bonus and capable of supporting multiple trauma patients simultaneously.

### **Environmental and Survival Gear**

Exploration equipment interfaces directly with the core survival mechanics, specifically the degradation and restoration of the Supply Die. Advanced purifiers and survival canteens allow characters to actively restore degraded Supply Dice in the field without returning to civilization.

To mitigate extreme climates, explorers utilize **Enviro Fields**, a TL 3 (CR 15) deployable generator that establishes a 20ft radius of Environmental Protection Rating (EPR) 1, shielding occupants from hostile weather and extreme temperatures. For vertical traversal, climbing gear scales significantly by era: Standard gear (TL 2, CR 5) relies on ropes and pitons, Improved gear (TL 3, CR 10) grants a +1 bonus per Athletics skill stage, and Electro-Adhesive grips (TL 4, CR 15) allow a user to automatically Take 10 on climb checks. At the apex of traversal technology, **Grav Attenuators**, a TL 5 (CR 25) mobility device, grant a user Advantage on all climbing and traversal checks by entirely dampening localized gravity.

## **Equipment Modification and Mastercrafting**

Equipment in Tangent is inherently modular, capable of evolving alongside the character through the utilization of Sockets. Weapons, armor, and utility gear possess a baseline number of Sockets derived from their Size Category (e.g., a Tiny pistol holds 1 Socket, a Medium rifle holds 4 Sockets, a Large heavy weapon holds 6).

A Socket allows for the installation of optics, barrel attachments, biometric locks, or payload alterations. Installing a Sniper Scope consumes 1 Socket and increases Range Increment by 50% while penalizing short-range strikes. Installing an Under-barrel Grenade launcher consumes 2 Sockets.

* **Standard Upgrades:** Each mundane module costs its listed Socket amount and increases the Crafting CR by +5 (or +10 for TL4/TL5 items).
* **Mastercrafting (Bonus Sockets):** High-quality manufacturing allows armor to exceed standard Socket limits. For every 5 points an Acquisition or Crafting check exceeds the item's Base CR, the item gains 1 Bonus Socket (up to a maximum of 1 per TL of the item).
* **Socket Compression:** If a build requires more capacity, advanced engineering can compress the hardware at a severe premium:
  * *Efficient Design:* -25% Socket cost (Round up). Adds +5 CR.
  * *Miniaturized:* -50% Socket cost (Round up). Requires Tech Level +1 over item base. Adds +10 CR.
  * *Integrated:* 0 Sockets (Fused to chassis). Cannot be removed. Adds +5 CR.

## **Conclusion: The Synthesized Material Reality**

The Tangent Equipment Matrix resolves the chaos of standard RPG inventory management and the historical failures of linear game economies by replacing arbitrary item lists with a highly scalable, mathematically rigorous taxonomy. By anchoring every physical asset—from the lowest-tier scavenger's blade to a highly synchronized Mekan Polymatter array—to the Universal Displacement Unit (Sockets) and the exponential value scaling of the Tangent Standard Curve, the matrix creates a seamless continuity of physics, logistics, and economics.

Through the explicit division of internal biological alterations (Scale 0/Nodes) and external material acquisition (Scale 1/Sockets), both players and game designers possess a definitive, irrefutable source of truth. An item's Tech Level, Material Composition, Manufacturer Skin, and Meta-Tech Sockets are not mere flavor text; they are explicit mechanical vectors that profoundly dictate the item's utility, its acquisition path, and its narrative footprint within the galaxy. This matrix ensures that the material reality of the Tangent universe is as robust, adaptable, and meticulously engineered as the technology it seeks to simulate.

#### ***Works cited***

> 1. ***99 - ARCHITECTURAL***
> 2. ***99 - MECHA***
> 3. ***99 - EQUIPMENT***
> 4. ***99 - ECONOMY AND WEALTH***
> 5. ***99 - AUGMENTATIONS MATRIX***
> 6. ***99 - PROTECTIVE EQUIPMENT***
> 7. ***99 - WEAPONRY***
> 8. ***99 - SCALING***
> 9. ***99 - TECHNOLOGY***
> 10. ***99 - META-TECH***

### EUFT & Matrix Systems Audit Retrofits (Canonical Reference)

* **Tangent Standard Curve (Base CR Intervals of 5):** `Value (Credits) = 10 * 4 ^ (CR / 5)`.
* **Linear Micro-Modifiers (+1 to +4 CR):** Non-multiple-of-5 CR adjustments apply linear multipliers to the nearest base 5-CR tier rather than exponential compounding:
  * **+1 CR:** `x1.3` (+30% Base Value)
  * **+2 CR:** `x1.75` (+75% Base Value)
  * **+3 CR:** `x2.3` (+130% Base Value)
  * **+4 CR:** `x3.0` (+200% Base Value)
  * **-1 CR (Flaw):** `x0.75` (-25% Base Value)
* **Crafting Material & Scrap Ratio:** Pristine raw materials cost **50%** of an item's total Credit Value. Unrefined **Scavenged Scrap** retains **10%** value, requiring **5x the item's Credit Value** in raw scrap mass to satisfy the 50% crafting material threshold.
* **Armor Layering Cap:** Damage Resistance (DR) does not stack across biological, cybernetic, and wearable domains; only the single highest applicable DR applies against an incoming damage source.
* **Mecha Scale Multiplier & Garaging:** Structure Points (SP) in vehicle size tables are pre-calculated; apply the active **Scale Multiplier** only to weapon damage, movement speed, and range during tactical play. For garaging in ships and bases, **1 Mount = 1 Scale Multiplier** (`10 Mounts = 1 Module`; e.g., Medium x1 = 1 Mount / 0.1 Modules; Large x2 = 2 Mounts / 0.2 Modules; Huge x5 = 5 Mounts / 0.5 Modules; Gargantuan x10 = 10 Mounts / 1 Module; Colossal x20 = 20 Mounts / 2 Modules).


---

## DISCREPANCY & RESTORATION LEDGER (DISC-551)

* **Target Path:** `architect/technology/equipment/99.Tech.Equipment.SystemsAndMastercrafting.md`
* **Primary Sources Reconciled:** `/_ _ TANGENT RP CODEX _ _/99 - EQUIPMENT` & `/game rules/architect/technology/equipment/99.Tech.Equipment.SystemsAndMastercrafting.md` (`1jaULjTBbAE5QbPQpI9n2QUaJo1yHHCL-`)
* **Restoration & Normalization Log:**
  * Restored 100% of canonical prose, engineering tables, component catalogs, and structural mechanics without truncation.
  * Applied all 12 Mandatory Mechanical Normalization Rules globally (`2d10` vs. `CR`, `CP` economy, `AGI`/`STA` attributes, canonical skill nomenclature `Alertness`/`Insight`/`Knowledge (Language)`/`Vocation (Handler)`, and EUFT Linear Micro-Modifiers + 10% Scrap Ratio + Armor Layering Cap + Mecha Scale Multiplier `1 Mount = 1 Scale Multiplier`).
  * Restored Offensive and Defensive Hardware Systems, Weapon Anatomy & Scaling (enforcing pre-calculated SP in vehicle tables and active Scale Multiplier on damage, speed, and range), Protective Equipment & Armor Construction (enforcing Armor Layering Cap), Meta-Tech Integration, Specialized Gear & Biotech Protocols, Equipment Modification & Mastercrafting, and Works Cited.

