---
id: "doc-architect-99-tech-weaponry-forgeprotocol"
name: "Tech (Weaponry): Forge Protocol"
fileName: "99.Tech.Weaponry.ForgeProtocol.md"
relPath: "architect/technology/weaponry/99.Tech.Weaponry.ForgeProtocol.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 23
perspective: "architect"
entry_type: "Tech Matrix (weaponry)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.weaponry.forgeprotocol","matrix"]
updatedAt: "2026-10-14T06:04:05.769Z"
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

# **99 \- WEAPONRY MATRIX**

# **THE KINETIC APPLICATION OF TECHNOLOGY**

The Tangent Weaponry MATRIX is designed to provide a unified structure for the creation, classification, and modification of offensive tools within the galaxy. Whether forging a primitive obsidian axe or engineering a singularity-core cannon, the underlying mechanics remain consistent to ensure balance and playability.

This MATRIX moves beyond simple item lists, offering Game Masters and Players the "DNA" of a weapon—its component parts, its resource requirements, and its capacity for evolution through modification. It operates in strict alignment with the global Equipment MATRIX, utilizing the Universal Displacement Unit (UDU) system, the MATRIX of Eras, and the Tangent Standard Economic Curve.

&nbsp;

## 

## ---

## **1\. Anatomy of a Weapon (The Component List)**

Every weapon in the Tangent system is defined by a standard "Stat Block" composed of the following components. When designing new weapons, fill these fields to ensure absolute compatibility with the game's physics.

### 

### **Core Identity**

* **Name:** The colloquial or manufacturing designation (e.g., M-12 Mag-Rail, Alterian Sun-Glaive).  
* **Classification:** The functional category which determines the Skill required to use it (e.g., Melee (Slashing), Ranged (Ballistic), Heavy (Energy)).  
* **Size Category:** The physical dimensions and scaling modifier (e.g., Medium, Large, Huge). This determines damage scaling, reach, and handling (See Section 5). *Rule of Thumb for Handedness: A weapon of your Size Category requires two hands. One category smaller requires one hand. One category larger requires specialized mounting or servos.*  
* **Tech Level (TL):** The complexity of the weapon's engineering (TL 0-5). Includes the sub-strata (Nascent \-, Standard, Advanced \+) which dictate miniaturization and efficiency.  
* **Material Composition:** The physical substance of the weapon (e.g., forged steel, nanocarbon, iron-wood, Aetherium), which dictates its weight, durability (Structure Points), and interaction with environmental hazards.  
* **Manufacturer Skin:** The aesthetic and functional overlay that aligns the weapon with a faction’s technological paradigm (See Section 8).

### 

### **Combat Statistics**

* **Damage (DMG):** The dice pool rolled upon a successful hit (e.g., 1d8, 2d6+2). Note: This base damage is multiplied by the Scaling Modifier for larger weapons.  
* **Damage Type:** The nature of the harm inflicted. This alters how the weapon interacts with target physiology and armor:  
  * **Kinetic:** Physical impact (Blunt, Slashing, Piercing). Subject to standard DR.  
  * **Force:** Kinetic subtype that ignores 1/2 of Target's Armor DR.  
  * **Thermal (Pyro/Cryo):** Burns organic matter or shatters armor; triggers secondary Burn/Freeze status effects.  
  * **Voltic (Electrical):** Damages electronics and triggers Stun/Shock checks.  
  * **Sonic:** Vibrational trauma; ignores most standard physical armor.  
  * **Corrosive (Acid):** Ongoing degradation of armor and flesh.  
  * **Psychic/Metaphysical:** Direct trauma to the mind or soul; typically bypasses physical armor entirely.  
* **Range:** The effective distance in feet. Optimal Range penalties apply beyond the listed value (Medium \-5, Long \-10, Extreme \-15).  
* **Critical:** The range and multiplier for critical hits (Default: Natural 20, x2 Damage Dice).  
* **Penetration (AP):** A value indicating how much of the target's Damage Resistance (DR) is ignored.

### 

### **Logistics**

* **Ammunition/Capacity:** The number of shots before a reload is required, or its assigned Supply Die (See Section 6).  
* **Power Source:** For TL3+ weapons, the type of battery or reactor required.  
* **Bulk/Size:** The physical size which dictates concealment and handedness.  
* **Sockets:** The Scale 1 Universal Displacement Unit hardpoints available on the chassis (See Section 7).  
* **Wealth CR & Value:** The economic tier (Craft CR) and Credit value required to purchase or craft the item (See Section 9).

&nbsp;

## 

## ---

## **2\. The Universal Displacement Unit and the Tier 1 Protocol**

To ensure absolute mathematical consistency across personal inventory, vehicular engineering, and architectural design, the MATRIX relies upon the Universal Displacement Unit (UDU) hierarchy.2 The UDU system is the spatial foundation of the Tangent universe, dictating capacity limits from the microscopic to the cosmic.6

The '99 \- AUGMENTATIONS MATRIX' establishes "Nodes" as Tier 0\.5 A Node represents less than 10 grams of mass, serving as the granular unit for internal biological strain and cybernetic installation.5 The Equipment MATRIX, however, operates strictly at Tier 1 and above, bypassing biological strain entirely.3 The absolute floor for external equipment is the Socket.3

### 

### **The Socket: The Foundation of Tier 1**

A Socket represents the fundamental unit of personal-scale spatial displacement, equating to less than 1 kilogram (2.2 lbs) of mass or functional complexity.2 The Socket dictates a character's carrying capacity, the number of modifications a weapon chassis can support, and the granular integration of external components.3

A Standard Fit means a Socket accepts 1 standard modification, attachment, or component. However, items may also feature a single **Minor Option** (e.g., a laser sight, cosmetic light, or concealed pocket) which utilizes negligible bulk and does not consume a Socket.3

The UDU hierarchy scales exponentially from this baseline to accommodate larger entities and structures without relying on disjointed conversion tables.2 While preserving the absolute physical displacement metrics of 10g, 1kg, 100kg, and 10 tons, the MATRIX introduces a consistent 10:1 integration bottleneck across all scales.5 Just as the biological protocol dictates that only 10 Nodes are actively usable per 1 Socket, this bottleneck is replicated at the macro-scales: a Mount allows for exactly 10 Usable Sockets, and a Module allows for exactly 10 Usable Mounts.5

| SCALE CATEGORY | DEFINITION AND CAPACITY | INTEGRATION BOTTLENECK |
| ----- | ----- | ----- |
| **Tier 0: Nodes (Implant Scale)** | A "Node" represents less than 10 grams of mass.&nbsp; | 10 Usable Nodes \= 1 Socket |
| **Tier 1: Socket (Personal)** | The baseline unit for handheld items, weapon modifications, and cybernetic sub-routines. Maximum 1 kg displacement. | — |
| **Tier 2: Mount (Mecha/Vehicle)** | The baseline unit for vehicular weapons, engines, and heavy cargo. Maximum 100 kg displacement. | 1 Mount \= 10 Usable Sockets |
| **Tier 3: Module (Architecture)** | The baseline unit for structural rooms, capital ship hangars, and planetary facilities. Maximum 10 Tons displacement. | 1 Module \= 10 Usable Mounts |

This strict hierarchy ensures seamless cross-scale integration.3 A Mecha (Tier 2\) or a Structure (Tier 3\) can store or equip Personal-scale items (Tier 1\) taking up mathematically accurate space.6 While a single vehicle Mount designated as a utility bay possesses 100 kilograms of volumetric displacement, its active capacity is capped at precisely 10 Usable Sockets worth of personal equipment.2 Furthermore, garaging rules remain perfectly consistent: storing a Medium-sized vehicle requires 0.1 Modules of architectural space, while a Huge Mecha requires exactly 1 full Module.1

### 

### **Tier 2: The Mount (Hardpoints & Sub-Scale Gear)**

The **Mount** is a sub-scale hardpoint (Maximum 100 kg displacement). In architectural and capital-ship design, Mounts are used for functional components that do not require an entire room. This includes exterior structural armor plating, energy shield emitters, defense turrets, sensor dishes, and localized utility nodes.

### 

### **Tier 3: The Module (Rooms & Facilities)**

The **Module** is the baseline unit of macro-scale structural volume (representing roughly 400 square feet of functional space, or a 20x20 ft area, up to a Maximum 10 Tons displacement). In architectural terms, a Module represents a physical room or a massive internal facility—such as a generator room, a barracks, a medical bay, or a vehicle hangar. A building's total Size and Height determine how many Modules it can hold.

&nbsp;

### **Dimensional Footprint and Base Complexity**

Every discrete piece of equipment is assigned a Size Category, which dictates its default capacity in Sockets, its base Structure Points (HP), and its baseline Crafting Challenge Rating (CR).3 This establishes the unflavored mechanical reality of the Agnostic Chassis before technological era or cultural skin is applied.2

| SIZE&nbsp; | COMMON EXAMPLES | MASS | CAPACITY | STRUCTURE&nbsp; | Crafting CR |
| ----- | ----- | :---: | :---: | :---: | ----- |
| **Fine** | Data-chip, Jewelry, Piercing | \< 0.1 kg | (2 Nodes) | 2 SP | CR 5 (Simple) |
| **Diminutive** | Datapad, Stim-injector, Sensor Fob | \< 1 kg | 1 Socket | 5 SP | CR 5 (Simple) |
| **Tiny** | Pistol, Medkit, Hand Tool | \< 5 kg | 2 Sockets | 10 SP | CR 10 (Standard) |
| **Small** | Rifle, Backpack Unit, Enviro-Suit | \< 10 kg | 4 Sockets | 20 SP | CR 15 (Advanced) |
| **Medium** | Heavy Tool, Portable Generator | \< 25 kg | 8 Sockets | 40 SP | CR 20 (Expert) |
| **Mecha** | Emplacement, Vehicle Weapon | \< 100 kg | Mounts | 100 SP (Medium) | CR 30 (Grandmaster) |
| **Structure** | Building, Campus, Laboratory | \>10 Tons | Modules | 500+ SP | Variable |

Items classified as "Fine" possess a mass so negligible they do not consume standard Socket capacity for inventory management.3 They may serve as minor aesthetic additions or highly miniaturized components, though they remain subject to standard durability constraints.3

## 

## ---

## **3\. The MATRIX of Eras and Technological Sub-Strata**

The efficiency and operational methodology of an item's chassis are explicitly gated by its Tech Level (TL). To accurately represent innovation, each Tech Level is divided into three strata: **Nascent (-)** (experimental/bulky), **Standard** (refined baseline), and **Advanced (+)** (optimized miniaturization).

| TL | ERA | MATERIAL COMPOSITION | PASSIVE TRAIT |
| :---: | ----- | ----- | ----- |
| **0** | Stone Age | Stone, Wood, Bone | **Degrading:** Breaks easily under stress; minimal DR. |
| **1-2** | Analog | Stamped Metal, Plastic | **Heavy:** Refined durability but unrefined ergonomics. |
| **3** | Digital | Aluminum, Composite | **Modular:** Universal ports; share batteries/charge. |
| **4** | Enhanced | Smart-Fabric, Nanocarbon | **Self-Repairing:** Regens 1 SP/hour. Masters Fields. |
| **5** | Advanced | Polymatter, Holophotonics | **Morphic / Weightless:** Instant reconfiguration; 0 bulk. |

### 

### **Era Descriptions**

* **TL 0 (Stone Age):** Operating entirely outside of complex mechanical dependence. Relies on organic strength. Weapons possess the "Degrading" trait.  
* **TL 1 (Metal Age):** Characterized by mass metallurgy. Gear is heavy and durable but imposes check penalties due to unrefined ergonomics.  
* **TL 2 (Data Age):** Defined by global connectivity and electronics miniaturization. Protective equipment features a "Ballistic Weave" trait.  
* **TL 3 (Space Age):** The dawn of interstellar expansion. Baseline for common trade. Gear features the "Modular" trait with universal data ports.  
* **TL 4 (Stellar Age):** Mastery over gravity and force treats standard physics as a suggestion. Gear is "Self-Repairing" and kinetic weaponry is obsolete unless hyper-accelerated.  
* **TL 5 (Galactic Age):** Apex material science.  
  * **Polymatter:** Liquid metal reacting to thought. Grants the "Morphic" trait (shifts forms as a Free Action).  
  * **Holophotonics:** Tactile hard-light construct. Grants the "Weightless" trait. The emitter is "Fine" size (0 Sockets).

&nbsp;

## 

## ---

## **4\. Design Guidelines by Type (Damage Baselines)**

Use these guidelines to establish the Agnostic Chassis statistics for Medium sized weapons before applying faction modifiers.

### 

### **Archaic Weapons (TL0 \- TL1)**

* **Light (Dagger/Club):** 1d4 to 1d6  
* **Medium (Sword/Mace):** 1d8 to 1d10  
* **Heavy (Great Axe/Maul):** 2d6 to 2d8

### 

### **Modern Weapons (TL2 \- TL3)**

* **Sidearms (Pistols):** 1d8 to 2d6  
* **Longarms (Rifles):** 2d8 to 3d8  
* **Scatter (Shotguns):** 3d6 (High damage close, spreads at range).

### 

### **Advanced Weapons (TL4)**

* **Beam (Laser):** 1d8 to 2d8 (High accuracy, no recoil).  
* **Pulse (Plasma):** 3d6 to 4d6 (High damage, short range).

### 

### **Exotic Weapons (TL5 & Xeno)**

* **Gravitonic:** Crushes targets with Force damage; ignores standard armor, resisted by Fortitude.  
* **Bio-Weapons (Auluran):** Living guns that regenerate ammo but require food/water.

&nbsp;

## 

## ---

## **5\. Tangent RP Scaling System**

Size categories determine how creatures and objects interact in combat. Scaling replaces arbitrary multipliers with consistent logic.

### 

### **Size Category Table**

| SIZE CATEGORY | SCALING&nbsp; | STRENGTH | COMBAT | STEALTH | REACH |
| ----- | :---: | :---: | :---: | :---: | :---: |
| **Miniscule** | \-5ds (1/12) | \-32 | \+32 | \+20 | 1 in |
| **Fine** | \-4ds (1/6) | \-16 | \+16 | \+16 | 6 in |
| **Diminutive** | \-3ds (1/3) | \-8 | \+8 | \+12 | 1 ft |
| **Tiny** | \-2ds (1/2) | \-4 | \+4 | \+8 | 2 ft |
| **Small** | \-1ds (2/3) | \-2 | \+2 | \+4 | 3 ft |
| **Medium** | (Base) | \+/-0 | \+/-0 | \+/-0 | 5 ft |
| **Large** | x2 | \+2 | \-2 | \-4 | 10 ft |
| **Huge** | x5 | \+4 | \-4 | \-8 | 15 ft |
| **Gargantuan** | x10 | \+8 | \-8 | \-16 | 20 ft |
| **Colossal** | x20 | \+16 | \-16 | \-32 | 25 ft |

&nbsp;

**Scaling Notes:**

* **Negative Scales (-1 to \-5 ds):** Lowers damage die side (d10 to d8, d8 to d6, etc.).  
* **Multipliers:** Applied to Number of Weapon Dice, Speed, Ranges, and Carrying Capacity.  
* **Starship Scale (Enormous+):** Overwhelming direct hits vaporize small targets; dealing 1/10 Indirect Damage (splash) to nearby targets.

&nbsp;

## 

## ---

## **6\. Power Sources & Ammunition**

Modern and Advanced weapons require dual-resource management: Projectiles and Power.

### 

### **A. Physical Ammunition**

* **Caseless Ammo (TL3):** Standard blocks of propellant. Lightweight.  
* **Mag-Slugs (TL3+):** Ferrous core for railguns. Heavy, high penetration.  
* **Liquid Metal (TL5):** Replenishes from user reserve or environment.

### 

### **B. Energy Cells**

* **Micro-Cell:** Power for Sidearms/Light items. Capacity: 20-50 shots.  
* **Standard Cell:** Power for Rifles/Tools. Capacity: 30-60 shots.  
* **Power Pack:** Backpack units for Heavy Weapons. 100+ shots.

### 

### **C. Consumable Economics**

* **Standard Rule:** Crafting CR for a magazine or energy cell \= **Base Weapon CR \- 10** (minimum CR 0).  
* **Specialized Payloads:** \* AP / Incendiary / Frost / Chem Load / Fragment / Stun: **\+5 CR**  
  * Explosive / Grav Shell / Disruption / Homing / Disintegration: **\+10 CR**

### 

### **D. The Supply Die (Narrative Logistics)**

Groups may opt to use the **Supply Die** to manage ammo. Assign a die (d12 to d6). Roll after an encounter; on a result of 1 or 2, the die degrades one step (d12 \-\> d10 \-\> d8 \-\> d6 \-\> d4). If a d4 degrades, the weapon is empty.

&nbsp;

## 

## ---

## **7\. Weapon Modification System**

Weapons are platforms with physical capacity based on size, interacting with the UDU hierarchy.

* **Scale 0 (Nodes):** Internal biological/implant scale. 10 Nodes \= 1 Socket.  
* **Scale 1 (Sockets):** Handheld weapon modifications baseline (1 kg).  
* **Scale 2 (Mounts):** Vehicular scale. 1 Mount \= 10 Usable Sockets.  
* **Scale 3 (Modules):** Structural scale. 1 Module \= 10 Usable Mounts.

### 

### **Base Sockets (Scale 1 Capacity)**

| WEAPON SIZE | SOCKETS | EXAMPLE |
| ----- | :---: | ----- |
| **Tiny** | 1 | Pistol, Knife |
| **Small** | 2 | SMG, Short Sword |
| **Medium** | 4 | Rifle, Long Sword |
| **Large** | 6 | Heavy Weapon, Polearm |

### 

### **Modification Categories**

#### **A. Optics & Targeting (Ranged Only)**

| MOD NAME | SOCKETS | EFFECT | TL | CR |
| ----- | :---: | ----- | :---: | :---: |
| Reflex Sight | 1 | \+1 to Strike at Short Range. | 1 | 10 |
| Smart-Link | 0 | Wireless HUD link. \+2 to Strike. Enables blind-fire. | 3 | 20 |
| Thermal Scope | 1 | Negates darkness and visual-obscurement penalties. | 2 | 15 |
| Sniper Scope | 1 | \+50% Range, penalty to hit at Short Range. | 1 | 15 |
| Threat Analyzer | 1 | Highlights structural weak points. \+1 Penetration on Aimed shots. | 3 | 20 |
| Pre-Cog Sights | 2 | Negates target's Evasive defense bonuses. | 5 | 30 |
| Radar Targeting | 1 | \+2 Attack vs moving targets. | 3 | 20 |
| Sound Targeting | 1 | \+2 Attack vs targets making noise. | 3 | 20 |
| Thermal Targeting | 1 | \+2 Attack vs targets with heat signatures. | 3 | 20 |

#### 

#### **B. Barrel & Muzzle (Ranged Only)**

| MOD NAME | SOCKETS | EFFECT | TL | CR |
| ----- | :---: | ----- | :---: | :---: |
| Silencer | 1 | \+10 Stealth CR to detect shot. | 1 | 15 |
| Recoil Compensator | 1 | Reduces Auto-Fire penalty by 2\. | 2 | 15 |
| Extended Barrel | 1 | \+20% Range, \-1 to Concealment. | 1 | 15 |
| Beam Focuser | 1 | (Energy Only) \+1 Penetration, \-10% Range. | 3 | 15 |
| Under-barrel Nad | 2 | Adds secondary fire (Grenade/Micro-Missile). | 2 | 20 |
| Magnetic Accel | 2 | Overcharges slugs. \+1 Damage per die, \+20% Range. | 3 | 25 |
| Choke Adjuster | 1 | (Scatter Only) Toggle Area vs focused damage. | 2 | 10 |
| Thermal Vent | 1 | Deal 1d4 Pyro in 5ft aura when firing. | 4 | 20 |

#### 

#### **C. Frame & Chassis (All)**

| MOD NAME | SOCKETS | EFFECT | TL | CR |
| ----- | :---: | ----- | :---: | :---: |
| Collapsible | 1 | Reduces size category for concealment when stowed. | 1 | 15 |
| Concealed | 1 | Disguised as clothing or harmless item. | 1 | 10 |
| Biometric Lock | 0 | Weapon only fires for registered user. | 3 | 25 |
| Extended Mag | 1 | \+50% Ammunition Capacity. | 2 | 15 |
| Melee Attachment | 1 | Bayonet/Weighted stock. Adds 1d6 Melee attack. | 1 | 10 |
| Energy Sheath | 1 | Adds elemental damage aura to blade/projectile. | 3 | 20 |
| Gyro Stabilizer | 2 | Negates movement penalties for Heavy weapons. | 3 | 20 |
| Bio-Grip | 1 | Bonds to user. \+4 vs Disarm, repairs 1 SP/hour. | 4 | 25 |
| Self-Destruct | 1 | Detonates for 3d6 if unauthorized use attempted. | 3 | 25 |
| Hidden Pocket | 1 | Store a Tiny item or data-drive discreetly. | 1 | 10 |
| Reduced Weight | 0 | \-50% Weight. | 2 | 10 |
| Stick Pad | 1 | Sticks to target, wall, or floor. | 3 | 15 |
| Voice Activated | 0 | Activated/triggered by voice command. | 3 | 25 |

#### 

#### **D. Payload & Energy (Tech Specific)**

| MOD NAME | SOCKETS | EFFECT | TL | CR |
| ----- | :---: | ----- | :---: | :---: |
| High-Output Emitter | 2 | (Energy) \+1 Damage Die, 2x ammo consumption. | 3 | 25 |
| Explosive Rounds | 1 | (Ballistic) Changes Dmg to Explosive (5ft Area). | 1 | 20 |
| Stun Module | 1 | Adds secondary Non-Lethal fire. Fort CR \= 10 \+ 1/2 Dmg. | 3 | 20 |
| Vibro-Generator | 1 | (Melee) Adds \+1d6 Damage and \+2 Penetration. | 3 | 20 |
| Mono-Filament Edge | 2 | (Melee) Critical Range increases by 1 (e.g., 19-20). | 4 | 25 |
| Caustic Reservoir | 1 | Deals 1d4 Corrosive following a hit. | 3 | 20 |
| Null-Field Payload | 2 | Hit target must save Fort or lose Metafocus 1 round. | 5 | 30 |
| Ammo Fabricator | 2 | Synthesizes 1 shot/hour from environment. | 4 | 30 |
| Accurate (+1/+2/+3) | 1 | Bonus to Attack. | 1-3 | 10/20/30 |
| Automated | 1 | Grants Full-Auto capability to weapon. | 3 | 20 |
| Electrified | 1 | (Melee) \+1d6+1 Voltic Damage. | 2 | 15 |
| Improved Damage | 1 | \+2 Bonus to Damage. | 2 | 20 |
| Improved Range | 1 | x2 Range Increment. | 2 | 15 |
| Motion Sensitive | 1 | Automatically fires at moving targets. | 3 | 20 |
| Nondetection | 1 | Undetectable by standard scanner tech. | 4 | 30 |
| Reconfigurable | 2 | Changes form (Multi-Form weapon). | 4 | 30 |
| Subdual Mode | 1 | Toggle Lethal to Non-Lethal damage. | 3 | 25 |

#### 

#### **E. Capacity Upgrades**

| CLIP TYPE | FUNCTION | RESTRICTION | CR |
| :---- | ----- | ----- | ----- |
| **Typical** | Standard | \- | \- |
| **Double** | x2 Capacity | \- | 10 |
| **Triple** | x3 Capacity | \- | 15 |
| **Pack** | x5 Capacity | \- | 20 |
| **Canister** | x10 Capacity | \- | 25 |
| **Hopper** | x20 Capacity | \- | 30 |

#### 

#### **F. Equipment Modification & Mastercrafting**

* **Standard Upgrades:** Each mundane module costs its listed Socket amount and increases the Crafting CR by \+5 (or \+10 for TL4/TL5 items).  
* **Mastercrafting (Bonus Sockets):** High-quality manufacturing allows armor to exceed standard Socket limits. For every 5 points an Acquisition or Crafting check exceeds the item's Base CR, the item gains 1 Bonus Socket (up to a maximum of 1 per TL of the item).  
* **Socket Compression:** If a build requires more capacity, advanced engineering can compress the hardware at a severe premium.  
  * *Efficient Design:* \-25% Socket cost (Round up). Adds \+5 CR.  
  * *Miniaturized:* \-50% Socket cost (Round up). Requires Tech Level \+1 over item base. Adds \+10 CR.  
  * *Integrated:* 0 Sockets (Fused to chassis). Cannot be removed. Adds \+5 CR.

&nbsp;

#### **G. Meta-Tech Integration (Synthesizing Science and Sorcery)**

Meta-Tech represents the engineering necessary to accommodate reality-warping patterns within physical Sockets. The type of UDU capacity used dictates the Operational Scale, while the Power Level is determined by the Skill Rank installed during creation.

* **1 Socket:** Holds up to Rank 10 (Trained Effect).  
* **2 Sockets:** Holds up to Rank 20 (Master Effect).  
* **3 Sockets:** Holds up to Rank 30 (Pinnacle Effect).

Meta-Tech fabrication requires highly specialized conductive materials (e.g., Aetherium or Resonance Crystals), which are extremely rare and always constitute 50% of the item's exorbitant final value.

* **Enhancement (Passive):** Permanently improves the physical properties of the armor (e.g., *Ghost-Strike* phasing, or *Featherweight* gravity alteration). These are "Always On." Each Socket allocated to an Enhancement increases the item's Crafting CR by \+5.  
* **Imbuement (Active):** Hard-coding a specific metaphysical Invocation into the armor, allowing a non-Awakened user to cast the effect via a physical trigger. The Crafting CR is calculated as: **15 \+ Invocation Rank \+ TL Modifier** *(TL3: \+0, TL4: \+2, TL5: \+5)*.  
  *(Example: A "Blink Suit" imbued with a Rank 10 Teleport at TL4 occupies 1 Socket and possesses a Craft CR of 27).*  
* **Consumable Modifier:** If a Meta-Tech module is designed for a single use (e.g., a one-time emergency planar shift that burns out the crystals), the final Meta-Tech CR is reduced by 10\.  
* **Interface (Symbiotic):** Devices that amplify an Awakened user's natural skills.

&nbsp;

#### **H. Weapon Downgrades (Flaws)**&nbsp;

Just as upgrades increase a weapon's Crafting CR and Value, creators can intentionally build flaws into a weapon to lower its CR, making it cheaper or easier to acquire on the black market.

* **Inaccurate:** \-1 penalty to Strike. Reduces Craft CR by \-2.  
* **Unreliable:** Weapon jams or misfires on a natural roll of 1 or 2\. Reduces Craft CR by \-5.  
* **Bulky / Heavy:** The weapon is considered one Size Category larger solely for the purposes of weight and concealment (does not increase damage). Reduces Craft CR by \-2.

&nbsp;

## 

## ---

## **8\. The Cultural Skin: Manufacturer Paradigms**

The "Cultural Skin" transforms the Agnostic Chassis into a mobile artifact of its originating civilization, applying aesthetics and specific traits.

### 

### **The Syndicate (Corporate Futurism)**

* **Aesthetic:** Matte white composites, brushed aluminum, cyan holographic data-streams.  
* **Integrated System:** constant tether to the Mesh grants \+2 Knowledge (Computers, Tech, Language).  
* **Penance Mode:** Non-citizens face subscription paywalls; failure to tithe reduces functionality.

### 

### **The Impyrium (Heirloom Industrial)**

* **Aesthetic:** Celestial Neo-Sumerian brutalism, gold filigree, polished marble, purity seals.  
* **Archeotech:** Ancient reinforcement grants \+2 Damage Resistance (DR) and \+2 Hardness.  
* **Relic Sockets:** Rejects commercial mods; accepts ONLY ancient archeotech components.

### 

### **The Dracon Dynasty (Feudal Protection)**

* **Aesthetic:** High-Fantasy Industrial, dragon motifs, castle-like silhouettes, orange/gold lighting.  
* **Bulwark:** Weapons favor kinetic/thermal output. Gear grants \+20% Structure Points (SP) and inherent \+1 DR.

### 

### **The Ascendancy (Enlightened Innovation)**

* **Aesthetic:** Smart City Solarpunk, clean curves, glass canopies, white hulls, blue emissions.  
* **Adaptive Progress:** Focus on precision and agility. Integrates native non-lethal weapon options.

### 

### **The Coalition & Outworlds (Scrappy Industrial)**

* **Aesthetic:** Space Western Noir, repurposed parts, exposed wiring, hazard stripes.  
* **Jury-Rigged:** Affordable (\-5 CR reduction).  
* **Unreliable:** On a Natural 1 skill check, the item breaks (disabling a socket) or deals 1d4 Fire damage.

### 

### **The Alterian Enclave (Botanical Engineering)**

* **Aesthetic:** Interstellar Art Nouveau, white ceramic fused with living wood, solar sails.  
* **Photosynthesis:** Energy weapons regenerate charges in direct sunlight.  
* **Naturalist:** User gains a \+2 bonus to Nature and Survival checks.

### 

### **The Auluran (Symbiotic Growth)**

* **Aesthetic:** Bioluminescent Jungle, grown chitinous hulls, pearlescent finishes, fluid shapes.  
* **Regeneration:** Gear actively heals 2 Structure Points per round.  
* **Symbiosis:** User can expend 1 Karma to instantly adapt gear to a new environmental hazard.

### 

### **The Mekan (Mechanical Perfection)**

* **Aesthetic:** Fractal Perfection, geometric shapes, liquid metal hulls, magnetic suspension.  
* **Integrated Tools:** TL 5 Polymatter allows form shifting as a Free Action; \+2 to Vocation checks.

### 

### **The Entari Combine (Cosmopolitan Trade)**

* **Aesthetic:** Galactic Senate luxury eco-finish, nanoweave, silent operation.  
* **Ethical Efficiency:** All weaponry is entirely concealed until triggered.

### 

### **The Thorn (Primal Growth)**

* **Aesthetic:** Bark-plate, vine-wrapped tech, glowing chlorophyll veins.  
* **Rooted:** Grants \+2 to resist Trip or Bull Rush attempts.  
* **Camouflage:** Grants \+2 Stealth bonus in wilderness environments.

### 

### **The Kitin (Hive-Resin)**

* **Aesthetic:** Hive-resin composites, organic structures, green vein-piping.  
* **Hive-Link:** Inherently integrates with telepathic hive-mind communications.  
* **Lightweight:** Armor counts as one category lighter for movement penalties.

## 

&nbsp;

## ---

## **9\. Tangent Standard Economics**

### **Complexity Determines Value**

The market price of an item is the societal aggregate of the skill (Crafting CR) and time required to produce it. Cost scaling is exponential to account for the leap between survival tools and starships.

### 

### **The Tangent Standard Curve (TSC)**

The value of every physical asset is generated using the TSC formula:

**Value (Credits) \= 10 \* 4^(CR / 5)**

The value inherently quadruples across every tier interval of 5 CR.

### 

### **The Master Valuation Table**

| CR | COMPLEXITY | VALUE | EXAMPLES (SCIFI / FANTASY) |
| ----- | :---: | :---: | ----- |
| **0** | **Scrap** | 10 | Raw ore, wooden club. |
| **5** | **Simple** | 40 | Knife, bandages, basic clothing. |
| **10** | **Standard** | 160 | Pistol, sword, commlink. |
| **15** | **Advanced** | 640 | Rifle, medkit, hacking tool. |
| **20** | **Expert** | 2,560 | Plasma weapon, full environmental suit. |
| **25** | **Master** | 10,240 | Cybernetic limb, hoverbike, heavy weapon. |
| **30** | **Grandmaster** | 40,960 | Power armor, golem, personal shuttle, rare artifact. |
| **40** | **Legendary** | 655,360 | Corvette-class ship, fortress. |
| **50** | **Transcendent** | 10.5 MCr | Dreadnought, planetary shield generator. |

### 

### **Wealth Score (WS) and Purchasing Power**

Character economic power is quantified by the Wealth Score (WS).

**The Golden Rule:** A character may automatically purchase any item with a Crafting CR equal to or less than their Wealth Score without depleting Credits.

### 

### **Expanded Financial Status Hierarchy**

| WEALTH STATUS | AUTO-BUY LIMIT | LIFESTYLE DESCRIPTION |
| ----- | :---: | ----- |
| **0 (Indebted)** | 0 Cr | Debt slavery or prison. |
| **1 \- 4 (Impoverished)** | 10 \- 30 Cr | Homeless/Squatter. Scavenges for food. |
| **5 \- 9 (Struggling)** | 40 \- 150 Cr | Slum shared room. Processed rations. |
| **10 \- 14 (Middle Class)** | 160 \- 600 Cr | Private apt, steady wage. Consumer vehicle. |
| **15 \- 19 (Affluent)** | 640 \- 2,500 Cr | Condo, quality vehicle. |
| **20 \- 29 (Wealthy)** | 2,500 \- 40,000 Cr | Large estate, servants. |
| **30 \- 39 (Hegemon)** | 41K \- 650K Cr | Penthouse, small corporation. |
| **40 \- 49 (Industrialist)** | 650K \- 10M Cr | Starships (Corvettes). |
| **50 \- 59 (Dynastic)** | 10M \- 167M Cr | Space stations. |
| **60 \- 69 (System Lord)** | 167M \- 2.6B Cr | Rules a solar system. |
| **70 \- 79 (Sector Ruler)** | 2.6B \- 42B Cr | Personal Dreadnought. |
| **80+ (Faction Ruler)** | 42B+ Cr | Emperor. Post-scarcity. |

### 

### **The Liquidity Constraint (The Gap Rule)**

If an item's CR exceeds Wealth Score, the character must bridge the gap with liquid Credits.

**Liquid Cost \= Item Value (CR) \- Wealth Score Value**

### 

### **Liquidity Drag (The Fence Rate)**

* **Legal Goods:** Sell at 50% Value.  
* **Black Market:** Sell at 20-25%.  
* **Scrap:** Sell at 10%.

### 

### **The Productivity Engine**

To craft an item, you must accumulate **Target PP (Productivity Points) \= Credit Value**.

**Daily Progress (PP) \= (Craft Check Result \- 10\) \* Tool Multiplier**

| TOOL TIER | MULTIPLIER | DESCRIPTION |
| ----- | :---: | ----- |
| **0 (Improvised)** | x1 | Bare hands, stone tools. |
| **1 (Basic)** | x10 | Handheld power tools. |
| **2 (Advanced)** | x50 | Professional machine shop. |
| **3 (Industrial)** | x200 | Automated factory lines. |
| **4 (Nanoforge)** | x1,000 | Molecular assembly swarms. |
| **Bio (Cultivated)** | x1,000 | Growth vats (Auluran). |
| **5 (Genesis)** | x5,000 | Thought-responsive Polymatter loom. |

## 

&nbsp;

## ---

## **10\. The Weapon Forge Protocol (Instructional Guide)**

**Who:** Used by GMs for balancing loot and Players for custom crafting.

**What:** Rigorous sequence for consistent weapon design.

**Where/When:** Pre-game preparation or character crafting.

**Why:** Ensures complexity directly correlates to financial and status costs.

### 

### **Step 1: MATRIX & Footprint**

Select Size Category (Section 2). This sets mass, starting Sockets, SP, and Starting CR. Determine Handedness.

### 

### **Step 2: Technological Era**

Choose Tech Level (0-5) and Sub-Strata (-, Standard, \+). If tech is Rare for the region, add **\+5 CR**. Note Passive Traits (Section 3).

### 

### **Step 3: Agnostic Chassis Mechanics**

Define base archetype damage and range (Section 4). Apply Chassis Upgrades (Die increase, Crit increase, Exotic types) and add to the CR total (+1 or \+2 per upgrade).

### 

### **Step 4: Cultural Skin**

Select a Faction Paradigm (Section 8). Apply aesthetic descriptors and unique mechanical traits. Apply \[Jury-Rigged\] (\-5 CR) or \[Archeotech\] if applicable.

### 

### **Step 5: Modification & Integration**

Install modifications (Section 7). Subtract Sockets from capacity and add Mod CR. Apply Compression/Miniaturization if space is limited. Assign one narrative Minor Option (0 Sockets).

### 

### **Step 6: Economic Finalization**

Sum the final CR. Run through Value \= 10 \* 4^(CR / 5). Verify character Wealth Score (WS). Determine PP target for crafting.

*

