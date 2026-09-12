---
id: "doc-architect-99-technology-armor-matrix"
name: "99. TECHNOLOGY, ARMOR MATRIX — 99 \- ARMOR MATRIX"
category: "architect_matrix"
parent: "5.00 ARCHITECT & MODULAR MATRICES"
order: 90
perspective: "architect"
entry_type: "Architect Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","99. technology, armor matrix","matrix"]
updatedAt: "2026-09-12T08:23:46.550Z"
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

# **99 \- ARMOR MATRIX**

# **THE MATERIAL MITIGATION OF TRAUMA**

### ***The Intersection of Personal Defense and Narrative Identity***

In the Tangent system, armor is more than a deduction from incoming damage; it is the immediate physical interface between a character and a hostile universe. Just as architecture defines the macro-scale of a faction's power, armor defines the micro-scale of individual survival and cultural expression.

In speculative fiction, a suit of armor tells a story. The battered, hydraulic-hissing plate of an Outworlds scavenger speaks of scarcity and ingenuity. The silent, seamless nanoweave of an Entari operative speaks of wealth and precision. Mechanically, armor serves as a destructible resource—a second skin with its own structural integrity, socket capacity for upgrades, and resistance tier.

This report establishes the Tangent Armor Matrix, aligning personal defense mechanics with the overarching global Equipment Matrix. It strictly delineates the creation process into two layers: the **Agnostic Chassis** (the physics-compliant engineering skeleton) and the **Cultural Skin** (the aesthetic and functional overlay of a faction). It utilizes Structure Points (SP), Damage Resistance (DR), and Universal Displacement Unit Sockets (UDU) to create a unified system for everything from primitive hide leathers to metaphysical hard-light shells.

### ***I. ANATOMY OF ARMOR (The Component List)***

Every suit of armor or protective garment in the Tangent system is defined by a standard Stat Block. When designing new armor, these fields ensure absolute compatibility with the game's physics:

* **Weight Class:** The chassis classification (Accessory, Light Device, Lightweight, Mediumweight, Heavyweight, Superheavy/Powered), establishing base mass, socket capacity, and structural integrity.  
* **Coverage:** How much of the body is protected (Partial, Standard, Sealed, Reinforced, Bulwark).  
* **Damage Resistance (DR):** The flat amount of damage subtracted from incoming attacks before affecting Health or Structure Points.  
* **Structure Points (SP):** The structural integrity of the armor itself. When reduced to 0, the armor is breached or disabled.  
* **Max Dex / Mobility Penalty:** The maximum Agility modifier the wearer can apply to their Defense Score, or flat penalties to physical skills.  
* **Movement Penalty:** Flat deductions applied to all forms of movement (Walk, Jog, Run, Sprint, Climb, Swim, Fly).  
* **Protected Locations:** Specific anatomical hit locations covered by the chassis: Head (H), Torso (T), Arms (A), and Legs (L).  
* **Socket Capacity (UDU):** The number of available localized hardpoints or weaves for integrating modifications (Tier 1 UDU).  
* **Tech Level (TL):** The era of the materials used (TL 0 to TL 5).  
* **Crafting DC:** The difficulty class required to manufacture the item, dictating its final market price based on the Tangent Standard Curve.

#### **Anatomical Baseline & Sizing Adjustments**

All standard armor entries, stat blocks, and catalog baselines are engineered for a standard **Medium-sized bipedal humanoid** (one head, one torso, two arms, two legs). When tailoring or manufacturing armor for creatures of different size categories, non-humanoid biologies, or unusual limb structures, apply the following scaling rules:

##### **1\. Creature Size Scaling**

* **Diminutive / Tiny:** Mass is 0.25x standard; Craft DC \-2; Sockets and DR/SP baseline remain identical.  
* **Small:** Mass is 0.5x standard; Craft DC \-1; Sockets and DR/SP baseline remain identical.  
* **Medium:** Standard baseline (1.0x Mass, \+0 Craft DC, standard stats).  
* **Large:** Mass is 2.0x standard; Craft DC \+2; Base SP increases by \+25% due to expanded physical volume.  
* **Huge:** Mass is 4.0x standard; Craft DC \+4; Base SP increases by \+50%.  
* **Gargantuan / Colossal:** Mass is 8.0x+ standard; Craft DC \+6 to \+10; Base SP increases by \+100%.

##### **2\. Morphological & Limb Variations**

* **Additional Limbs (Quadrupeds, Centauroids, Hexapods, Extra Arms):** Armor must protect extra biological surface area. Each additional pair of functional limbs or major appendage (e.g., armored tail, wings) increases armor mass by \+20% and adds \+1 to Craft DC.  
* **Non-Humanoid Forms (Serpentine, Avian, Radial, Amorphous):** Adapting armor patterns to exotic anatomies increases design complexity (+2 Craft DC for custom native fabrication, or \+4 Craft DC when modifying existing humanoid plate).  
* **Natural Armor Integration:** If a species possesses natural armor (such as scales or chitin), worn armor DR layers over natural DR according to standard Layering Protocols, unless the species trait specifies free stacking.

#### **Physical Restraints & Strength Mitigation**

Heavy armoring inevitably encumbers the operative. Tangent quantifies this encumbrance through two distinct mechanical penalties:

1. **Mobility Penalty:** Applies directly to Acrobatics, Athletics, Stealth, and fine physical manipulation checks. It does *not* apply to Combat Attack rolls or Defense checks.  
   * *Strength Counter:* If the wearer's Strength modifier is at least **double** the Mobility Penalty, the penalty is completely ignored.  
2. **Movement Penalty:** Applies directly as a flat deduction to all forms of movement speed (Walk, Run, Sprint, Fly).  
   * *Strength Counter:* Exceptional physical power counters this drag: **Strength 2** negates a \-5 Movement Penalty, and **Strength 4** negates up to a \-10 Movement Penalty.

#### **Armor Layering & Secondary Stacking Protocols**

Operating in extreme environments or hot combat zones frequently tempts operatives to layer secondary armor over or under a primary suit (e.g., wearing an Armored Vest under an Armored Jacket or over an Enviro-Suit). While this stacks protection, the compounding mass severely degrades kinetic performance.

* **Stacking Benefit:** Wearing a secondary set of armor combines its flat DR with the primary armor for overlapping locations.  
* **Compounding Penalties:** All baseline penalties of both suits combine, plus severe layering friction penalties based on the secondary armor's DR and coverage:  
  * **Secondary DR 10:** Imposes **\-1 Mobility** (if Upper Body/Torso) and **\-5 Movement** (if Lower Body/Legs).  
  * **Secondary DR 15:** Imposes **\-2 Mobility** (if Upper Body/Torso) and **\-10 Movement** (if Lower Body/Legs).  
  * **Secondary DR 20+:** Imposes **\-4 Mobility** (if Upper Body/Torso) and **\-20 Movement** (if Lower Body/Legs).  
* **Exemptions:** Armor DR granted by internal Cybernetic Augmentations, Subdermal Plating, or Metaphysical Wards stacks freely and does *not* trigger layering penalties unless explicitly stated.  
* **Option Invalidation:** Certain installed option modules (e.g., Reactive Camouflage, Holo-Distortion, or External Sensors) become completely non-functional if covered by a secondary outer garment.

### ***II. THE DESIGN PROTOCOL (Step-by-Step Construction)***

To construct a piece of custom armor, follow these six steps. This ensures the equipment is mathematically sound and fits within the galactic economy.

#### **Step 1: Establish the Agnostic Chassis (Mass & Capacity Class)**

Every discrete piece of protective equipment is assigned a Weight Class Chassis, dictating its default capacity in Sockets, its base Structure Points (SP), and its baseline Crafting Difficulty Class (DC) for a standard Medium humanoid.

| CHASSIS CLASS | COMMON EXAMPLES | MASS | CAPACITY | BASE SP | MAX DEX | BASE CRAFT DC |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Accessory** | Jewelry, Data-chip, Piercing | \< 0.1 kg | (2 Nodes) | 2 SP | \+6 | DC 5 |
| **Light Device** | Datapad, Sensor Fob, Bracer | \< 1 kg | 1 Socket | 5 SP | \+6 | DC 5 |
| **Lightweight** | Vests, Padded Liners, Stealth Mesh | \< 5 kg | 2 Sockets | 10 SP | \+5 | DC 10 |
| **Mediumweight** | Tactical Jackets, Long Coats, Combat Rigs | \< 10 kg | 4 Sockets | 20 SP | \+4 | DC 15 |
| **Heavyweight** | Full Body Plate, Heavy Enclosed Armor | \< 25 kg | 8 Sockets | 40 SP | \+2 | DC 20 |
| **Superheavy / Mecha** | Powered Battlesuits, Exoskeletons | \< 100 kg | 1 Mount  (10 Sockets) | 100 SP | \+0 | DC 30 |

*Items classified as Accessories possess a mass so negligible they do not consume standard Socket capacity for inventory management, though they remain subject to standard durability constraints.*

#### **Step 2: Define Coverage (Layer Scaling)**

Apply a Coverage Modifier to the Chassis Class to represent the form factor:

* **Total Sockets** \= Base Sockets \* Socket Multiplier (Round down, minimum 1\)  
* **Total SP** \= Base SP \* SP Multiplier  
* **Total Craft DC** \= Base Craft DC \+ DC Modifier

| COVERAGE | DESCRIPTION | SOCKET MULT | SP MULT | MOBILITY MOD | DC MOD |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Partial** | Vest or Greaves only. Protects vital organs. | x0.5 | x0.5 | None | \-2 |
| **Standard** | Full suit. Complete limb and torso coverage. | x1.0 | x1.0 | \+0 | \+0 |
| **Sealed** | Hermetic seal with helmet and environmental gaskets. | x1.0 | x1.0 | None | \+4 |
| **Reinforced** | Up-armored plates and ablative over-layers. | x1.0 | x1.5 | \-1 Mobility / \-5 Move | \+6 |
| **Bulwark** | Excessive layering sacrificing mobility for defense. | x0.8 | x2.0 | \-2 Mobility / \-10 Move | \+10 |

#### **Step 3: Select Materials & Tech Level (TL)**

Technology Level (TL) dictates the Damage Resistance (DR), inherent passive traits, and applies a final multiplier to the armor's overall durability (SP).

* **Final SP** \= (Base SP \* Coverage SP Mult) \* Material SP Mult

| TL | ERA | COMMON MATERIAL | DR BASE | SP MULT | PASSIVE TRAIT / MECHANICS |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **0** | **Stone Age** | Hide, Bone, Wood | 25% (DR 0-5) | x0.25 | **Degrading:** Breaks easily under sustained stress. |
| **1** | **Metal Age** | Iron, Steel, Plate | 50% (DR 5-10) | x0.5 | **Heavy:** Imposes significant physical check (-1) penalties. |
| **2** | **Data Age** | Kevlar, Ceramic, Alloy | 75% (DR 10-15) | x1.0 | **Ballistic Weave:** Highly resists piercing kinetic trauma. |
| **3** | **Space Age** | Plasteel, Impact Gel | 100% (DR 15-20) | x1.5 | **Modular:** Universal ports; vacuum-ready hermetic seals. |
| **4** | **Stellar Age** | Nanocarbon, Phase-Shift | 125% (DR 20-25) | x2.0 | **Self-Repairing:** Regenerates 1 SP/hour. |
| **5** | **Galactic Age** | Polymatter, Hard-Light | 150% (DR 30+) | x2.5 | **Morphic / Weightless:** Instant reconfiguration. |

#### **Step 4: Integrate Systems & Sockets**

Equipment in Tangent is modular, capable of evolving alongside the character through Sockets. Armor provides a baseline number of Sockets derived from its Weight Class and Coverage (typically averaging 1 Socket per 5 base DR). Installing upgrades consumes these sockets and increases the Crafting DC.

##### **1\. Equipment Modification & Mastercrafting**

* **Standard Upgrades:** Each mundane module costs its listed Socket amount and increases the Crafting DC by \+5 (or \+10 for TL 4 / TL 5 items).  
* **Mastercrafting (Bonus Sockets):** High-quality manufacturing allows armor to exceed standard Socket limits. For every 5 points an Acquisition or Crafting check exceeds the item's base DC, the item gains 1 Bonus Socket (up to a maximum of 1 per TL of the item, twice the base sockets for standard armor, or a maximum of 2 bonus sockets for Clothing). Each bonus slot adds \+5 to the base Craft DC.  
* **Socket Compression:** If a build requires more capacity, advanced engineering can compress hardware at a severe premium:  
  * *Efficient Design:* \-25% Socket cost (round up). Adds \+5 DC.  
  * *Miniaturized:* \-50% Socket cost (round up). Requires Tech Level \+1 over item base. Adds \+10 DC.  
  * *Integrated:* 0 Sockets (fused directly into chassis). Cannot be removed. Adds \+5 DC.

##### **2\. Meta-Tech Integration (Synthesizing Science and Sorcery)**

Meta-Tech represents the engineering necessary to accommodate reality-warping patterns within physical Sockets:

* **1 Socket:** Holds up to Rank 10 (Trained Effect).  
* **2 Sockets:** Holds up to Rank 20 (Master Effect).  
* **3 Sockets:** Holds up to Rank 30 (Pinnacle Effect).

Meta-Tech fabrication requires rare conductive materials (e.g., Aetherium or Resonance Crystals) that constitute 50% of the item's final material cost.

* **Enhancement (Passive):** Permanently improves the physical properties of the armor (e.g., *Ghost-Strike* phasing, *Featherweight* gravity alteration). Always On. Each Socket allocated increases Crafting DC by \+5.  
* **Imbuement (Active):** Hard-codes an Invocation into the armor, allowing a non-Awakened user to trigger the effect.  
  * **Craft DC** \= 15 \+ Invocation Rank \+ TL Modifier (TL 3: \+0, TL 4: \+2, TL 5: \+5)  
* **Consumable Modifier:** If designed for single use (e.g., emergency burnout planar shift), reduce the final Meta-Tech DC by 10\.  
* **Interface (Symbiotic):** Amplifies an Awakened user's natural casting pool or focus.

##### **3\. Comprehensive Socket Module Catalog**

| MODULE NAME | EFFECT & MECHANICS | SOCKETS | DC / TL |
| :---- | :---- | :---- | :---- |
| **Ablative Foam** | Emergency deployment. Restores 10 SP or seals a vacuum breach. Single use. | 1 | DC \+5 TL 3 |
| **Auto-Injector** | Stabilizes wearer if Health \< 0\. Holds 2 doses. Auto or manual trigger. | 1 | DC \+5 TL 3 |
| **Biometric Lock** | Armor locks rigid if worn by unauthorized user. DC 25 Hacking to bypass. | 0 | DC \+5 TL 4 |
| **Cloaking** | Visual Invisibility. \+10 Stealth (Moving) / \+20 (Still). Combat hide at \-10. | 2 | DC \+10 TL 4 |
| **Collapsible** | Fully retracts into fist-sized bracer/pack. Standard Action to equip/stow. | 1 (DR \<= 10\) 2 (DR 15-20) 3 (Battlesuit) | DC \+10 TL 4 |
| **Comm Suite / HUD** | Audio/Visual radio (TL 2), Holo transceivers (TL 3), or Telepathic link (TL 4/5). | 0 | DC \+5 TL 3 |
| **Energy Shielding** | Grants Energy Resistance 10 (or 20 for Heavy, DC \+10). Purchased per type. | 1 | DC \+5 TL 3 |
| **Enviro-Field** | Projects a 20 ft radius environmental shield protecting from weather/elements. | 2 | DC \+10 TL 3 |
| **Enviro-Seal (Basic)** | Hermetic suit seal. 2-day O2 supply, air scrubbers, water recycling. | 2 | DC \+5 TL 3 |
| **Enviro-Seal (Indefinite)** | Closed-cycle life support; indefinite atmospheric and pressure immunity. | 2 | DC \+10 TL 4 |
| **Exo Servos** | Kinetic enhancement actuators. Increases wearer Strength by \+2 / \+4 / \+6. | 1 / 2 / 3 | DC \+5 / 10 / 15 TL 3 |
| **Expert Software** | Dedicated AI coprocessor. Grants \+1 to \+5 bonus to designated Skill checks. | 1 | DC \+10 TL 3 |
| **Flexible Weave** | Joint counter-balancing. Negates \-1 Mobility or \-5 Movement per installation. | 1 | DC \+5 TL 2 |
| **Flight Pack** | True Flight at Speed \= Base Speed \* 2\. Vectored (TL 3), Force (TL 4), Grav (TL 5). | 2 | DC \+10 TL 3+ |
| **Flight System Extension** | Dedicated power reservoir granting 2 full hours continuous flight time. | 1 | DC \+5 TL 3 |
| **Grav Attenuator** | Advantage on traversal/climbing checks by dampening local gravity field. | 1 | DC \+10 TL 5 |
| **Grav-Chute** | Inertial dampener. Completely negates falling damage via slow descent. | 1 | DC \+5 TL 4 |
| **Hardened Circuits** | EMP shielding. Full immunity to EMP, Ion disruption, and low-tier scans. | 1 | DC \+5 TL 3 |
| **Hidden Weapon** | Concealed, retractable weapon housing (Archaic, Modern, or Advanced weapon). | 1 | DC \+5 TL 3 |
| **Holo-Distortion** | Visual blur field. Ranged attacks against wearer suffer 20% miss chance. | 1 | DC \+10 TL 4 |
| **Improved Toughness** | Increases base DR up to \+50% (+2 DC per \+1 DR). Each \+10 DR adds \-1 Mob or \-5 Move. | 1 | Variable TL 2 |
| **Kinetic Damper** | Accelerator suit cushioning. Doubles DR vs Crashes/Falling; full DR vs Explosives. | 1 | DC \+5 TL 3 |
| **Picotech Canister** | Programmable matter. Reshapes into any Simple tool (DC 25). | 1 | DC \+15 TL 4 |
| **Portable Nurse** | Automated medical sub-routine. Grants \+2 to Medicine checks. | 1 | DC \+5 TL 3 |
| **Reactive Camouflage** | Chameleon surface blending. \+10 Stealth (+20 Still). No Jog/Run/Sprint at TL 3 (TL 4 upgrade). | 1 | DC \+10 TL 3&nbsp; |
| **Reflective Shell** | Ablative mirror coating. Counters up to 10 Laser Penetration (15 at TL 4). | 1 | DC \+5 TL 3 |
| **Resilient Alloy** | High-density shock weave. Reduces incoming Ballistic Penetration by 50%. | 1 | DC \+5 TL 3 |
| **Self-Repairing** | Nanite reservoir. Regenerates 1 Structure Point (SP) per hour. | 1 | DC \+10 TL 4 |
| **Sensor Stealth** | Sensor baffle netting. Imposes \-20 penalty to locate wearer with mundane sensors. | 1 | DC \+10 TL 3 |
| **Shield Generator** | Integrates personal force field unit directly into armor chassis (see Section IV). | 2 | DC \+10 TL 4 |
| **Tactical Computer** | Threat analyzer. Grants \+2 Initiative, \+2 Perception, \+1 Combat Actions (Atk/Def/Man). | 1 | DC \+10 TL 3 |
| **Variable Form** | Dynamic chromatic mesh. Changes appearance, style, and color (+5 Static Camo). | 1 | DC \+10 TL 4 |

#### **Step 5: The Cultural Skin & Flaws**

Apply the narrative and aesthetic flavor of the manufacturing faction.

##### **Advanced Grown Technologies (Biotech Protocols)**

Factions utilizing grown biotechnology (Auluran, Thorn) subvert traditional power systems:

* **Symbiosis (Bonding):** Living armor must genetically and bio-electrically bond with a host over 24 hours. Failure to attune results in a persistent \-2 operational penalty to all checks while worn.  
* **Sustenance (Feeding):** Grown armor feeds on user waste heat for minor suits, but heavy suits require submersion in Nutrient Solution (10 Cr/dose) weekly, or they gain the **Broken (Starving)** condition.  
* **Bio-Repair:** Healed via Medicine or Xenobiology checks rather than Engineering. A healthy host facilitates automatic regeneration of 1 SP/hour for bonded suits.

##### **Faction-Specific Armor Traits**

* **Alterian Enclave (The Resonant):** Sunglass Laminates. Solar crystalline capacitors. *Bonus:* \+1 Focus/Meta checks while worn.  
* **Auluran (The Husk):** Empathic Carapace. Adapts when struck by energy (Fire/Cold/Electricity), granting DR \+5 against that specific damage type for the remainder of the Scene.  
* **Coalition (The Rig):** Riveted ballistic dusters. *Bonus:* Rugged (+1 SP multiplier), but Cumbersome (-1 Max Dex).  
* **Entari Combine (The Operator):** Seamless nanoweave. *Bonus:* Modular. Swap Sockets in 1 hour instead of days.  
* **Impyrium (The Relic):** Baroque blast-plate. *Bonus:* Ancient Engineering (+2 DR, gains an Archeotech socket that cannot accept modern modules).  
* **Kitin (Hive-Resin):** Acoustically absorbent secreted resin. *Bonus:* \+2 to Stealth checks.  
* **Outworlds (The Scavenger):** Welded scrap and custom tags. *Bonus/Flaw:* Cheap (-5 Craft DC), but Unreliable (a Natural 1 on defense disables an installed socket).  
* **Syndicate (The Ghost):** Mirror-chrome corporate ergonomics. *Bonus:* Integrated System (+2 to Computer and Tech Vocation checks).

##### **Voluntary Downgrades**

Players may accept functional flaws to reduce Crafting DC by 5 (reducing cost exponentially):

* **Bulky:** Increases chassis mass footprint, further restricting Max Dex.  
* **Tethered:** Requires an external, heavy power umbilical cable.  
* **Limited Usage:** Imposes a strict depletion die or short battery lifespan.

#### **Step 6: Economic Finalization**

Calculate the final Crafting DC and Market Value:

1. **Lock the Final DC:** Sum Base Chassis DC \+ Coverage Mod \+ Sockets Used Modifiers \- Downgrades.  
2. **Determine Market Value:** Run the final Crafting DC through the Tangent Standard Curve formula:  
   * **Value (Credits) \= 10 \* 4^(DC / 5\)**  
3. **Fabrication Phase:** Crafting requires a Vocation (Armorsmith) or Knowledge (Engineering) check against the Final DC. Manufacturing time is tracked by the **Productivity Engine** (Target PP \= Credit Value).

### ***III. STANDARD ARMOR CATALOG***

Baseline military, industrial, and civilian armor configurations found across the galaxy. All catalog entries are calibrated for standard **Medium-sized bipedal humanoids**. (For other species sizes or limb layouts, apply the Anatomical Baseline modifiers in Section I).

#### **LIGHT ARMOR**

| ARMOR TYPE | DR | SP | PENALTY | LOCATIONS | CRAFT DC | BASE SOCKETS |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Jewelry (Accessory)** | 0 | 2 | None | None | 5 | 2 Nodes |
| **Clothing (Standard)** | 0 | 5 | None | Torso, Arms, Legs | 5 | 1 |
| **Clothing, Reinforced** | 5 | 7 | None | Torso, Arms, Legs | 10 | 1 |
| **Helmet** | 10 | 10 | None | Head | 10 | 1 |
| **Utility Harness** | 0 | 5 | None | Torso | 5 | 1 |
| **Stealth Suit** | 5 | 10 | None | All (H, T, A, L) | 14 | 2 |

#### **MEDIUM ARMOR**

| ARMOR TYPE | DR | SP | PENALTY | LOCATIONS | CRAFT DC | BASE SOCKETS |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Helmet, Heavy** | 15 | 10 | \-2 Sight/Hearing Perception | Head | 12 | 2 |
| **Armored Vest (Partial)** | 10 | 10 | None | Torso | 10 | 2 |
| **Armored Pants (Partial)** | 10 | 10 | None | Legs | 12 | 2 |
| **Armored Jacket (Standard)** | 10 | 20 | None | Torso, Arms | 12 | 4 |
| **Armored Long Coat** | 10 | 25 | None | Torso, Arms, Legs | 12 | 4 |
| **Armored Jacket, Heavy** | 15 | 40 | \-1 Mobility | Torso, Arms | 15 | 4 |
| **Armored Long Coat, Heavy** | 15 | 40 | \-1 Mobility | Torso, Arms, Legs | 15 | 4 |
| **Armored Pants, Heavy** | 15 | 20 | \-5 Movement | Legs | 15 | 4 |

#### **HEAVY ARMOR**

| ARMOR TYPE | DR | SP | PENALTY | LOCATIONS | CRAFT DC | BASE SOCKETS |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Full Body Armor (Sealed)** | 15 | 40 | None | All (H, T, A, L) | 18 | 8 |
| **Full Body Armor, Heavy** | 20 | 60 | \-1 Mobility \-5 Movement | All (H, T, A, L) | 22 | 8 |

#### **SUPERHEAVY & POWERED ARMOR**

| ARMOR TYPE | DR | SP | PENALTY | LOCATIONS | CRAFT DC | BASE SOCKETS |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Battle Suit (Heavy Assault)** | 25 | 80 | \-2 Mobility \-10 Movement | All (H, T, A, L) | 25 | 6 |
| **Battle Suit (Bulwark)** | 30 | 80 | \-2 Mobility \-10 Movement | All (H, T, A, L) | 30 | 6 |
| **Exoskeleton Battlesuit** | 40 | 100 | Varies (Powered/Exo) | All (H, T, A, L) | 30 | 1 Mount (10) |

### ***IV. FIELD GENERATORS & CARRIED SHIELDS***

Personal defense extends beyond rigid physical plates. Tactical doctrines incorporate deflector shields, reactive energy screens, and physical deflection bulwarks.

#### **Part 1: Field Generators (Energy Shields & Screens)**

Field Generators project cohesive envelopes of energy, gravimetric repulsion, or solid-light geometry around the user, protecting all hit locations uniformly unless noted otherwise.

##### **Core Field Mechanics**

* **Pre-Ablative DR:** Fields provide a flat Damage Resistance rating. When hit, incoming damage is reduced by the field's DR *before* remaining damage is deducted from the field's Ablative Points (AP).  
* **Ablative Buffer:** AP absorbs damage before the wearer's physical armor DR or Health is affected. When AP reaches 0, the field collapses and shuts down.  
* **Penetration Nullification:** Fields completely neutralize the armor penetration values of Ballistic and Energy weapons (except Disruptors).  
* **Critical Hit Immunity:** The Ablative Layer of a field **cannot** suffer Critical Damage from any mundane or standard energy attack. Only Disruptors can score a Critical Strike against a field, increasing damage directly to the AP pool.  
* **Ammunition & Energy Special Effects:** Secondary ammunition effects (e.g., thermal incendiary, neurotoxin darts, cryo-freeze, emp tags) do not trigger if the field absorbs the attack without being fully breached.  
* **Single Field Limit:** While a character may wear multiple inactive units (e.g., on a harness or belt), only **one** Field Generator may be active at any time.  
* **Installation:** Field Generators possess no internal option sockets of their own. They are carried as standalone belt/harness units or consume 2 Sockets when integrated directly into an armor chassis.

##### **1\. Baseline Field Generators (The 8 Standard Systems Updated)**

These eight core military, industrial, and personal protection systems form the foundation of field defensive doctrine throughout known space. All eight entries have been updated with complete Craft DCs, Tech Levels, and tactical profiles:

| FIELD DESIGNATION | TL | PROTECTION SCOPE | DR | AP | CRAFT DC | MECHANICAL PROFILE & TACTICAL PROPERTIES |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Enviro-Screen** | TL 3 | Full Spectrum | 1 | 5 | 10 | Vacuum and toxin isolation. Collapses instantly upon taking combat damage. |
| **Kinetic Barrier (Standard / Civilian)** | TL 3 | Kinetic / Ballistic | 10 | 20 | 10 | Absorbs high-velocity slugs. Completely bypassed by energy and slow melee attacks. |
| **Kinetic Barrier (Heavy)** | TL 4 | Kinetic / Ballistic | 15 | 30 | 15 | Military-grade kinetic deflection harness. Stops heavy slugs and high-velocity shrapnel. |
| **Energy Screen (Standard / Civilian)** | TL 3 | Energy / Fire | 10 | 20 | 10 | Disperses lasers and plasma. Completely bypassed by physical projectiles and melee strikes. |
| **Energy Screen (Heavy)** | TL 4 | Energy / Fire | 15 | 30 | 15 | Reinforced plasma refraction field. Absorbs heavy directed energy and particle beams. |
| **Force Field, Light** | TL 4 | All Sources | 10 | 20 | 15 | Standard personal belt generator providing complete omni-directional tactical protection. |
| **Force Field, Medium** | TL 5 | All Sources | 15 | 30 | 20 | Tactical combat rig. Faint hum and visual shimmer impose a \-1 penalty to Stealth checks. |
| **Force Field, Heavy** | TL 5 | All Sources | 20 | 40 | 25 | Heavy assault generator. Imposes \-2 to Stealth checks; requires Heavy or Powered Armor chassis to mount. |

##### **2\. Advanced & Specialized Field Systems (Additions to the Matrix)**

Engineered for specialized combat doctrines, high-threat environments, or spec-ops operations, these advanced field projectors expand upon the baseline eight units:

| FIELD DESIGNATION | TL | PROTECTION SCOPE | DR | AP | CRAFT DC | MECHANICAL PROFILE & TACTICAL PROPERTIES |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Repulsion Harness** | TL 3 | Kinetic | 5 | 30 | 18 | Missed melee attacks against user force the attacker to make a DC 12 Strength Save or be pushed 5 ft back. |
| **Riot Shield (Projected)** | TL 4 | 180° Frontal Arc | 15 | 40 | 22 | Directional force plane. Wielder can spend a Reaction to intercept and protect an adjacent ally. |
| **Distortion Field** | TL 4 | All Sources | 5 | 10 | 28 | Imposes a 20% Miss Chance (Concealment). Grants \+5 Stealth when stationary or moving slowly. |
| **Holo-Armor Field** | TL 5 | All Sources | 15 | 30 | 35 | Skin-tight solid light lattice. Melee attackers suffer 1d6 Energy damage upon contact. No Stealth penalty. |
| **Gravitic Dampener** | TL 5 | Split Spectrum | 20 Kin 10 Ene | 50 | 40 | Stops ballistic projectiles dead in flight. Grants complete immunity to knockback and forced movement. |
| **Adaptive Matrix** | TL 5 | Dynamic Spectrum | 10 (Base) 25 (Adapted) | 40 | 40 | Analyzing heuristic. Field DR increases to 25 against the last specific damage type sustained. |
| **Phase Shift Generator** | TL 5 | Phase Evasion | 0 | 15 | 45 | Reaction Phase Dodge (d20 \+ Agility vs attack roll); negates hit entirely. Costs 5 AP per dodge attempt. |

##### **Field Mastercrafting Protocols**

Precision tuning allows a skilled armorer to reinforce field harmonics during fabrication:

* **DR Improvement:** For every 2 points a Crafting check exceeds the Field's base DC, the field gains **\+1 DR**.  
* **AP Scaling:** Any increase to the field's DR automatically increases its Ablative Points by **\+2 AP per 1 point of DR gained**.  
* **Tech Level Caps:** The maximum DR increase is bounded by material science:  
  * **TL 3:** Maximum \+5 DR (+10 AP)  
  * **TL 4:** Maximum \+10 DR (+20 AP)  
  * **TL 5:** Maximum \+15 DR (+30 AP)

##### **Disruptor Weapon Vulnerability**

Disruptor weapons fire discordant energy phases calibrated to destabilize force geometries. Against Disruptor attacks:

1. The Field's DR is halved (or reduced to 0 for Light fields).  
2. Disruptors can score Critical Strikes directly against the field's AP pool.  
3. If an attack overpenetrates the AP pool, residual damage bypasses physical armor DR entirely.

#### **Part 2: Carried Shields (Physical Deflection)**

Carried shields provide an active **Block Bonus** added to the user's Defense Score against attacks from their front arc. They also feature integrated Option Sockets to accept defensive tactical modules.

| SHIELD TYPE | BLOCK BONUS | WEIGHT | CRAFT DC | SOCKET CAPACITY | NOTES & TACTICAL PROPERTIES |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Impromptu Shield** | \+1 | Varies | DC 0-5 | 0 Sockets | Makeshift barrier (table, hatch, door). Low durability. |
| **Buckler** | \+1 | 4 lb. (1.8 kg) | DC 6 | 1 Socket | Straps to forearm; leaves hand partially free for items. |
| **Shield, Small** | \+1 | 6 lb. (2.7 kg) | DC 5 | 1 Socket | Light melee skirmishing shield. |
| **Shield, Medium** | \+2 | 9 lb. (4.0 kg) | DC 6 | 2 Sockets | Standard balance of coverage and handling. |
| **Shield, Large** | \+2 | 12 lb. (5.5 kg) | DC 7 | 3 Sockets | Heavy infantry battle shield. High coverage. |
| **Shield, Riot** | \+3 | 10 lb. (4.5 kg) | DC 10 | 4 Sockets | Provides **Full Cover** when planted (Standard Action). |
| **Projected Energy Shield** | \+2 | 2 lb. (0.9 kg) | DC 16  (TL 4\) | 1 Socket | Wrist bracer emitter. Energy blade/shield is weightless. |

*Notes on Shield Systems:*

* **Option Integration:** Carried shields can install standard Socket Modules (e.g., Hardened Circuits, Biometric Locks, Tactical Computers, or Reflective Shells) subject to their socket capacity and standard Mastercrafting rules.  
* **Projected Shield Bracer:** The wrist bracer contains the 1 Option Socket; the projected energy plane itself cannot hold socket modules.

### ***V. UNIFIED ECONOMY & EXCHANGE***

#### **The Universal Displacement Unit and the Tier 1 Protocol**

To ensure absolute mathematical consistency across personal inventory, vehicular engineering, and architectural design, the Matrix relies upon the Universal Displacement Unit (UDU) hierarchy. The UDU system is the spatial foundation of the Tangent universe, dictating capacity limits from the microscopic to the cosmic.

The *99 \- Augmentations Matrix* establishes **Nodes** as Tier 0\. A Node represents less than 10 grams of mass, serving as the granular unit for internal biological strain and cybernetic installation. The Equipment Matrix operates strictly at Tier 1 and above, bypassing biological strain entirely. The absolute floor for external equipment is the **Socket**.

#### **The Socket: The Foundation of Tier 1**

A Socket represents the fundamental unit of personal-scale spatial displacement, equating to less than 1 kilogram (2.2 lbs) of mass or functional complexity. The Socket dictates a character's carrying capacity, the number of modifications a weapon chassis can support, and the granular integration of external components.

A Standard Fit means a Socket accepts 1 standard modification, attachment, or component. However, items may also feature a single **Minor Option** (e.g., a laser sight, cosmetic light, or concealed pocket) which utilizes negligible bulk and does not consume a Socket.

The UDU hierarchy scales exponentially from this baseline to accommodate larger entities and structures without relying on disjointed conversion tables. While preserving physical displacement metrics of 10 g, 1 kg, 100 kg, and 10 tons, the matrix introduces a consistent 10:1 integration bottleneck across all tiers:

* **Scale Ratio \= 101**

Just as biological protocols dictate that only 10 Nodes are actively usable per 1 Socket, this bottleneck is replicated at macro scales: a Mount allows for exactly 10 Usable Sockets, and a Module allows for exactly 10 Usable Mounts.

| SCALE CATEGORY | DEFINITION AND CAPACITY | INTEGRATION BOTTLENECK |
| :---- | :---- | :---- |
| **Tier 0: Nodes (Implant Scale)** | Represents less than 10 g of mass. | 10 Usable Nodes \= 1 Socket |
| **Tier 1: Socket (Personal)** | Baseline unit for handheld gear, weapon mods, and armor hardpoints. Maximum 1 kg displacement. | — |
| **Tier 2: Mount (Mecha/Vehicle)** | Baseline unit for vehicular weapons, engines, and heavy cargo. Maximum 100 kg displacement. | 1 Mount \= 10 Usable Sockets |
| **Tier 3: Module (Architecture)** | Baseline unit for structural rooms, capital hangars, and planetary facilities. Maximum 10 Tons displacement. | 1 Module \= 10 Usable Mounts |

This strict hierarchy ensures seamless cross-scale integration. A Mecha (Tier 2\) or Structure (Tier 3\) can store or equip personal-scale items (Tier 1\) taking up mathematically accurate space. While a single vehicle Mount designated as a utility bay possesses 100 kg of volumetric displacement, its active capacity is capped at precisely 10 Usable Sockets worth of personal equipment. Furthermore, garaging rules remain consistent: storing a Medium-sized vehicle requires 0.1 Modules of architectural space, while a Huge Mecha requires exactly 1 full Module.

#### **The Tangent Standard Economics**

The most significant advancement in the Equipment Matrix is the complete eradication of economic dissonance—the persistent fracture between narrative wealth and the mechanical reality of crafting and acquiring gear. In legacy RPG systems, crafting cost is derived from arbitrary retail prices based on perceived combat utility rather than engineering complexity. This produces linear pricing models that fail in science-fiction settings; a starship is not merely a very large rifle, but an order-of-magnitude leap in manufacturing sophistication.

Tangent Standard Economics posits a singular, mathematically rigorous principle: **Complexity Determines Value**. The market price of an item is simply the societal aggregate of skill (Crafting DC) and time required to produce it.

#### **The Tangent Standard Curve (TSC)**

Because the gap between a simple survival tool and a dimensional jump-gate is logarithmic, cost scaling must be exponential:

* **Value (Credits) \= 10 \* 4^(DC / 5\)**

This formula dictates that an item's value in Credits equals a baseline value of 10 Credits (representing scrap metal or raw ore at DC 0\) multiplied by a growth factor of 4, raised to the power of the item's Crafting DC divided by 5\. The growth factor ensures value inherently quadruples across every tier interval of 5 DC.

#### **The Master Valuation Table**

| CRAFT DC | COMPLEXITY | VALUE (CREDITS) | EXAMPLES (SCIFI / FANTASY) |
| :---- | :---- | :---- | :---- |
| **0** | **Scrap** | 10 | Raw ore, ration bar, wooden club. |
| **5** | **Simple** | 40 | Knife, backpack, basic clothing, bandages. |
| **10** | **Standard** | 160 | Pistol, sword, light armor, commlink. |
| **15** | **Expert** | 640 | Rifle, plate mail, medkit, hacking tool. |
| **20** | **Advanced** | 2,560 | Plasma weapon, full environmental suit, masterwork gear. |
| **25** | **Master** | 10,240 | Cybernetic limb, hoverbike, magic ring, heavy weapon. |
| **30** | **Grandmaster** | 40,960 | Power armor, golem, personal shuttle, rare artifact. |
| **35** | **Heroic** | 163,840 | AI Core, fighter jet, small starship hull. |
| **40** | **Legendary** | 655,360 | Corvette-class ship, legendary artifact, planetary fortress. |
| **45** | **Mythic** | 2,621,440 | Frigate, resurrection chamber, moon base module. |
| **50** | **Transcendent** | 10,485,760 | Dreadnought, planetary shield generator. |

#### **The Productivity Engine and Macro-Economics**

Because the Tangent Standard Curve dictates exponential scaling, a linear crafting system would require literal centuries to build high-end assets. Tangent solves the "Time vs. Cost" paradox through the Productivity Engine, converting effort into Productivity Points (PP).

##### **The Productivity Formula**

To craft an item, the creator must accumulate a Target PP equal exactly to the item's Credit Value:

* **Target PP \= Credit Value**  
* **Daily PP \= (Craft Check Result \- 10\) \* Tool Tier Multiplier**

The Tool Tier Multiplier is the critical scaling variable:

* **Tier 0 (Improvised):** x1 Multiplier. Bare hands, stone tools.  
* **Tier 1 (Basic):** x10 Multiplier. Handheld power tools, garage kit.  
* **Tier 2 (Advanced):** x50 Multiplier. Professional machine shop.  
* **Tier 3 (Industrial):** x200 Multiplier. Automated factory lines.  
* **Tier 4 (Nanoforge):** x1,000 Multiplier. Molecular assembly swarms.  
* **Bio (Cultivation):** x1,000 Multiplier. Accelerated nutrient tanks (Auluran/Kitin). Requires Medicine/Nature and Engineering checks.  
* **Tier 5 (Genesis):** x5,000 Multiplier. Polymatter loom, holophotonics, metaphysical fabrication.

*Example:* A Mastercraft Titan Mech Suit (DC 30, Target PP \= 40,960) would take an artisan with Basic Tools (x10) over 400 days to complete. An advanced engineer utilizing a Nanoforge (x1,000) with a high check result can materialize the identical Mech Suit in less than two days.

##### **Macro-Scale Construction and Faction Labor Pools**

For monumental projects like a Dreadnought (DC 50, Value \~10.5 Million Cr), individual crafting is impossible. Factions utilize collective Labor Pools:

* **Daily PP (Total) \= Sum of all individual Daily PP**

A shipyard employing 1,000 engineers operating Industrial (x200) tools generates 1,000,000 PP per day, completing a capital warship in roughly 10.5 days.

#### **Wealth Score and Purchasing Power**

Character economic leverage is quantified by the Wealth Score (WS), a static rating of economic standing representing credit rating, active investments, stipend, and social capital.

> **The Golden Rule of Tangent Wealth:**

> A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid Credits or reducing their baseline Wealth Score:

> **Purchase DC \<= Wealth Score (WS)**

##### **Expanded Financial Status Hierarchy**

| WEALTH STATUS | AUTO-BUY LIMIT | LIFESTYLE DESCRIPTION |
| :---- | :---- | :---- |
| **0 (Indebted)** | 0 Cr | Debt slavery, servitude, or carceral internment. |
| **1 – 4 (Impoverished)** | 10 – 30 Cr | Squatter / homeless. Scavenges daily for sustenance. |
| **5 – 9 (Struggling)** | 40 – 150 Cr | Shared pod in slum district. Synthetic processed rations. |
| **10 – 14 (Middle Class)** | 160 – 600 Cr | Private apartment, steady corporate wage, consumer groundcar. |
| **15 – 19 (Affluent)** | 640 – 2,500 Cr | High-end high-rise condo, luxury personal vehicle, domestic drone. |
| **20 – 29 (Wealthy)** | 2,500 – 40,000 Cr | Large private estate, servant cadre, minor corporate investor. |
| **30 – 39 (Hegemon)** | 41K – 650K Cr | Skyscraper penthouse, planetary estate, owns mid-sized corporation. |
| **40 – 49 (Industrialist)** | 650K – 10M Cr | Megacorp executive director, fleet owner (Corvettes / Frigates). |
| **50 – 59 (Dynastic)** | 10M – 167M Cr | System nobility, owns orbital space stations and extraction moons. |
| **60 – 69 (System Lord)** | 167M – 2.6B Cr | Rules entire solar system, commands capital battlefleets. |
| **70 – 79 (Sector Ruler)** | 2.6B – 42B Cr | Sovereign ruler of star cluster, flagship is a super-dreadnought. |
| **80+ (Faction Ruler)** | 42B+ Cr | Galactic Emperor / Hegemon. Post-scarcity personal economics. |

#### **The Liquidity Gap and Friction Mechanics**

To prevent infinite exploit loops, Tangent applies strict friction mechanics:

##### **1\. The Liquidity Constraint (The Gap Rule)**

When an item's Crafting DC exceeds the character's Wealth Score, passive income cannot cover the total purchase. The character must bridge the difference with liquid Credits:

* **Cost (Liquid) \= Value(Item DC) \- Value(Wealth Score)**

##### **2\. Liquidity Drag (The Fence Rate)**

Sell prices are heavily discounted:

* **Legal goods:** Sell at 50% of Total Market Value.  
* **Black market or stolen goods:** Sell at 20% to 25% of Total Market Value.  
* **Scrap metal / salvaged components:** Sell at 10% of Total Market Value.

### ***VI. SPECIAL SUITS & ICONIC EXEMPLARS***

These factory-spec and faction-custom armors serve as benchmarks for field operatives.

#### **1\. Dragoon Armor (Draconic Knights of the Dynasty)**

Forged specifically for the hereditary champions and knight-commanders of the Draconic Dynasty. Each suit features ornate, heat-treated scales shaped from plasteel-aether alloys, emblazoned with personalized draconic crests.

* **Chassis Base:** Full Body Armor (Standard Sealed, TL 3/4).  
* **Defensive Stats:** DR 15 (All Locations), 40 SP.  
* **Movement Penalties:** None (masterfully counter-balanced).  
* **Hierarchical Mastercraft Sockets:**  
  * **Knight-Acolyte:** 4 Custom Sockets.  
  * **Knight-Sergeant:** 5 Custom Sockets.  
  * **Knight-Officer:** 6 Custom Sockets.  
* **Dynastic Variants:**  
  * *Stealth Bodysuit Variant:* DR 10 (All Locations), \-1 Socket, grants \+5 bonus to Stealth checks.  
  * *Heavy Assault Variant:* DR 20 (All Locations), \-1 Socket, engineered joints completely negate base Mobility and Movement penalties.

#### **2\. Syndicate Drop Marine Battlesuit**

Designed exclusively for Syndicate shock-assault infantry dropped from low orbit in unpowered kinetic drop-pods—effectively transforming the wearer into a guided gravity bomb.

* **Chassis Base:** Battle Suit (Bulwark Coverage, TL 3/4).  
* **Defensive Stats:** DR 25 (All Locations), 80 SP.  
* **Pre-Installed Integrated Systems (Fully Occupied Chassis):**  
  * **Full Environmental Seal (TL 3):** Indefinite life support cycle with emergency sealants.  
  * **Tactical Computer (TL 3):** \+2 Initiative, \+2 Perception, \+1 Combat Actions.  
  * **Exoskeleton Servos (TL 3):** \+2 Strength enhancement.  
  * **Kinetic Damper (TL 3):** Doubles DR vs crash and falling impacts; grants full DR vs direct explosives.  
  * **Flexible Weave (TL 2):** Specifically offsets \-1 Mobility and \-5 Movement. Combined with the Exoskeleton Servos (+2 Str), all default Bulwark penalties (-2 Mobility, \-10 Movement) are entirely neutralized.  
* **Socket Balance:** 0 Available Sockets in standard production line. Exceeding this baseline requires a complete Mastercraft redesign and reconstruction.

&nbsp;

&nbsp;

## Game Mechanics Rules
```
See full canonical text in 99. TECHNOLOGY, ARMOR MATRIX.md
```

## Gameplay Instructions
Refer to 99. TECHNOLOGY, ARMOR MATRIX.md in the game rules library for complete architectural tables and system parameters.

## Designer Notes
Canonical Tangent SF RP rulebook reference from 99. TECHNOLOGY, ARMOR MATRIX.md.
