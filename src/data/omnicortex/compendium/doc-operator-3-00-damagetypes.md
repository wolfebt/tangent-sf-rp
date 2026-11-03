---
id: "doc-operator-3-00-damagetypes"
name: "3.00 Damage Types"
fileName: "3.00.DamageTypes.md"
relPath: "operator/combat/3.00.DamageTypes.md"
isMasterDoc: false
masterDocId: "doc-operator-3-00-combat"
category: "operator_rule"
parent: "doc-operator-3-00-combat"
order: 237
perspective: "operator"
entry_type: "Combat Module"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","combat","3.00.damagetypes","mechanics"]
updatedAt: "2026-11-03T10:29:33.825Z"
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

# **3.00.04 DAMAGE TYPES & CRITICAL INJURY MATRIX**

Tangent categorizes all offensive trauma into three overarching families—**Energy**, **Kinetic**, and **Variative (Elemental, Planar & Psychic)**—comprising **23 distinct Damage Types**. Each damage type interacts uniquely with armor resistances, environmental conditions, and anatomical hit locations.

---

## **1. MASTER DAMAGE TYPE CLASSIFICATION TABLE**

| Damage Family | Damage Type | Primary Trauma & Critical Effect | Typical Weapon / Environmental Sources |
| :--- | :--- | :--- | :--- |
| **Energy** | **Pyro / Fire** | Thermal combustion & blistering; **Ignites** (`1/2` dmg for 2 rnds) on Crit. | Flamethrowers, plasma weapons, incendiary rounds, *Energy: Elemental*. |
| **Energy** | **Cryo / Cold** | Cellular freezing & frostbite; **Slows / Freezes** (`Speed 0`, brittle) on Crit. | Cryo-jets, endothermic grenades, cryo-blades, deep space exposure. |
| **Energy** | **Spectral / Phase** | Dimensional phase disruption; **bypasses physical cover & Armor DR**. | Phase blades, tachyon lances, spirit weapons, rift anomalies. |
| **Energy** | **Sonic / Sound** | Acoustic resonance & rupture; **ignores physical Armor DR & Stuns** on Crit. | Sonic blasters, concussive screamers, Lapis dragon breath. |
| **Energy** | **Voltic / Electrical** | Neural/electronic surge; **`x2` vs. drones/shields & Stuns** on Crit. | Arc rifles, shock batons, railguns, EMPs, Cuprum breath. |
| **Energy** | **Corrosive / Disintegration** | Molecular dissolution; **`1/2` dmg for 2 rnds & degrades Armor `-2 DR`**. | Acid sprayers, disintegrator beams, nanite swarms, Verdant breath. |
| **Energy** | **Ra-D / Radiation** | Ionizing cellular necrosis; **Fortitude Save or `-1 STA` drain**. | Particle beams, neutron weapons, breached fission cores, solar flares. |
| **Energy** | **Force Pulse / Disruption** | Pure kinetic-field repulsion; **ignores `1/2` Armor DR + Knockback**. | Repulsor cannons, disruptor rifles, *Energy: Force* invocations. |
| **Kinetic** | **Blunt** | Crushing impact & bone fracture; **`+1` Stun CR** on Weapon Focus. | Hammers, clubs, maces, power fists, unarmed strikes. |
| **Kinetic** | **Slashing** | Laceration & limb severing; **inflicts `Bleed 1+`** on Crit. | Swords, axes, machetes, vibro-blades, monomolecular blades, claws. |
| **Kinetic** | **Piercing** | Deep armor perforation; **`+1` Penetration** & vital organ strikes. | Spears, arrows, flechettes, gauss rifles, railguns, sniper rounds. |
| **Kinetic** | **Concussive / Impact** | High-velocity shockwave; **splits 50/50 between Vitality and Health**. | Explosives, artillery shells, falling damage, vehicular crashes, siege weapons. |
| **Kinetic** | **Bleed** | Ongoing circulatory depletion; **bypasses Armor DR and Stamina Toughness**. | Serrated blades, shrapnel, critical slashing/piercing wounds. |
| **Variative (Elemental)** | **Radiant / Light** | Photonic searing; **Blinds optics/eyes (`1d4` rnds)** on Crit. | Lasers, flashbangs, *Sunburst*, photokinesis, solar invocations. |
| **Variative (Elemental)** | **Umbral / Shadow** | Entropic light-draining cold; **Entangles in clinging shadow** on Crit. | Dark energy weapons, Kovian shadow-tech, *Illusion: Shadow*. |
| **Variative (Elemental)** | **Air Elemental** | Barometric shear & **gale knockback (`10 ft` per Stage)**. | Compressed air cannons, vortex generators, aerokinesis. |
| **Variative (Elemental)** | **Fire Elemental** | Living primordial flame; **bypasses mundane fire resistance**. | Pyromancy, fire elemental evocation, primordial dragonfire. |
| **Variative (Elemental)** | **Earth Elemental** | Tectonic crushing, tremors & **knockdown (Prone)**. | Seismic weapons, gravity crushers, geokinesis, earth elementals. |
| **Variative (Elemental)** | **Water Elemental** | Hydrostatic crushing, **knockback & drowning pressure**. | High-pressure water cannons, water vortex generators, hydrokinesis. |
| **Variative (Planar/Mind)** | **Celestial** | Empyreal Syntropic judgment; **`x2` damage vs. Undead/Fiends & Banishes**. | Consecrated relics, holy water, divine light invocations. |
| **Variative (Planar/Mind)** | **Infernal** | Cthonic Dissonant hellfire; **corrupts healing until cleansed**. | Infernal pacts, cthonic relics, Stygian corruption. |
| **Variative (Planar/Mind)** | **Dimensional** | Spatial shearing & warp displacement; **ignores all physical Armor DR**. | Interdimensional cannons, reality anchors, rift tears, *Dimension* phase-strikes. |
| **Variative (Planar/Mind)** | **Psyche / Mental** | Direct synaptic trauma; **bypasses physical Armor DR** *(mitigated by Willpower)*. | Neural disruptors, psychic amplifiers, *Mental: Projection*, psionic blasts. |

---

## **2. ENERGY DAMAGE TYPES**

### **1. Pyro / Fire Damage**

This damage type focuses on burning and incinerating targets, causing immediate pain and potential long-term thermal trauma. It is particularly effective against flammable materials and creatures vulnerable to heat. Fire damage often inflicts ongoing **Burning** damage, and critical hits ignite the target, causing additional damage over time (`1/2` initial damage for 2 rounds).

* **Metaphysical:**
  * *Pyrokinesis:* The ability to create and control fire with the mind—including conjuring flames, shaping them into walls or projectiles, and directing their intensity.
  * *Fire Evocation:* Summoning fire elementals or spirits to fight on your behalf, unleashing fire attacks while remaining resistant or immune to thermal damage.
  * *Fire Enchantments:* Imbuing weapons or objects with fire magic to ignite targets on contact, deal bonus Pyro damage, or grant thermal protection.
* **Archaic Tech:**
  * *Torches, Arrows, and Grenades:* Torches for melee, flammable-tipped arrows for ranged strikes, and clay grenades filled with incendiary pitch.
  * *Primitive Flamethrowers:* Project a stream of ignited fuel in a cone or line, effective at close range and causing widespread panic.
  * *Fire Traps:* Pits filled with flammable oil or mechanisms that ignite when triggered.
* **Modern Tech:**
  * *Flamethrowers:* Infantry or vehicle-mounted units with greater range, accuracy, and fuel compression for area denial.
  * *Incendiary Rounds:* Firearm ammunition designed to ignite upon impact, setting targets ablaze.
  * *Fire Bombs:* Explosive devices filled with incendiary gel to damage structures and clear bunkers.
* **Advanced Tech:**
  * *Laser Weapons:* High-energy coherent light beams focused to ignite targets with pinpoint precision and range.
  * *Plasma Weapons:* Project superheated ionized plasma, dealing devastating Pyro damage and melting through armor (often with shorter ranges or cooling cycles).
  * *Energy Pulse Weapons:* Emit pulses of intense thermal energy across single, burst, or spray firing modes.
* **Additional Notes:** Characters can use Pyro weapons to target vulnerable fuel cells or create environmental fire hazards that control battlefield movement.

### **2. Cryo / Cold Damage**

This damage type focuses on freezing and chilling targets—causing immediate pain, slowing movement, and inducing frostbite, hypothermia, or structural embrittlement. Critical hits can **Freeze** the target (`Speed 0`, vulnerable to Blunt and Sonic shattering).

* **Metaphysical:**
  * *Cryokinesis:* Creating and controlling cold and ice with the mind—conjuring chilling blasts, forming ice barriers, or coating surfaces in slick frost.
  * *Ice Evocation:* Summoning ice elementals or spirits resistant to cold that unleash freezing attacks.
  * *Cold Enchantments:* Imbuing weapons or armor with cryo-magic to freeze targets on contact or shield against extreme cold.
* **Archaic Tech:**
  * *Alchemical Cold Grenades:* Vessels filled with endothermic reagents that release intense localized cold upon shattering.
  * *Environmental Ice and Snow:* Utilizing natural blizzards, avalanches, and ice hazards.
* **Modern Tech:**
  * *Cryo-Grenades and Mines:* Release blasts of supercooled gas or shrapnel to disable vehicles, freeze mechanisms, or incapacitate infantry.
  * *Cryo-Guns:* Fire projectiles filled with cryogenic agents, causing structural embrittlement on impact.
  * *Cryo-Sprayers:* Project a continuous stream of liquid nitrogen/helium to create frozen barriers or slow enemy waves.
* **Advanced Tech:**
  * *Cryo-Lasers:* High-energy endothermic beams that rapidly extract thermal energy, inducing structural failure in mechanical or biological systems.
  * *Cryo-Blades:* Melee weapons with supercooled edges or cryogenic chambers that weaken and shatter metal armor on contact.
  * *Cryo-Mines:* Proximity devices that flash-freeze targets in choke points.

### **3. Spectral / Phase Damage**

Also known as incorporeal or ghost damage, **Spectral / Phase Damage** bypasses physical armor and directly affects the target's essence or internal life force. It is uniquely effective against incorporeal entities (ghosts, spirits, phased creatures) while also harming corporeal beings by disrupting internal bio-energies and **ignoring physical Armor Damage Resistance (DR)**.

* **Metaphysical:**
  * *Phasing:* Shifting between corporeal and incorporeal states to pass through solid matter, avoid physical strikes, and attack a target's internal form.
  * *Ghostly Touch:* Attacks that pass unimpeded through armor to drain life force, induce terror, or disrupt concentration.
  * *Spirit Weapons:* Conjuring blades or blasts of pure spiritual energy that strike directly at the target's essence.
* **Archaic Tech:**
  * *Blessed Weapons:* Arms imbued via sacred rituals to harm incorporeal beings and bypass mundane armor.
  * *Ghost-Banishing Artifacts:* Wards and relics that weaken or repel phased entities.
* **Modern Tech:**
  * *Phase Disruptors:* Emit fields or projectiles that destabilize phase states, forcing incorporeal beings into corporeal vulnerability.
  * *Ghost-Detecting Equipment:* Resonance sensors capable of tracking non-corporeal signatures.
* **Advanced Tech:**
  * *Phase Rifles:* Fire projectiles that shift out of phase to bypass external armor before re-materializing inside the target.
  * *Phase Blades:* Melee weapons whose edges flicker across dimensional phases, passing through plate armor to strike vital organs or internal circuitry.
  * *Phase Fields:* Personal or vehicular generators that phase the user through solid obstacles or disrupt enemy phase-tech.

### **4. Sonic / Sound Damage**

Utilizes high-decibel acoustic waves and resonant vibrations to harm targets—causing mild disorientation, ruptured eardrums, severe internal organ trauma, or molecular shattering of rigid materials. Sonic damage **ignores most physical Armor DR** and disrupts delicate electronics and communications.

* **Metaphysical:**
  * *Sonokinesis:* Generating focused sonic blasts, subtle auditory disorientation, or complex acoustic constructs with the mind.
  * *Sound Evocation:* Summoning acoustic elementals or constructs of pure resonant sound.
  * *Sonic Enchantments:* Imbuing weapons to emit shattering vibrations on impact or erecting acoustic barriers.
* **Archaic Tech:**
  * *War Horns and Drums:* Produce disorienting low-frequency booms that demoralize foes and disrupt formation coordination.
  * *Whistling Projectiles:* Arrows and bolts carved to emit piercing shrieks that distract and disorient targets.
* **Modern Tech:**
  * *Sonic Grenades and Mines:* Release concussive acoustic bursts that rupture eardrums, induce vertigo, and stun targets.
  * *Sonic Cannons and Blasters:* Emit focused acoustic beams capable of incapacitating or killing targets via internal cavitation trauma.
  * *Sonic Emitters and Disruptors:* Generate continuous frequencies that jam communications and induce severe nausea.
* **Advanced Tech:**
  * *Sonic Lasers (Masers / Grasers):* Coherent acoustic/microwave beams that sever molecular bonds with surgical precision.
  * *Sonic Shields and Barriers:* Standing-wave acoustic fields that deflect projectiles and absorb kinetic shock.
  * *Sonic Cloaking and Stealth Devices:* Active phase-cancellation arrays that silence footsteps, thrusters, and gunfire completely.

### **5. Voltic / Electrical Damage**

Delivers high-voltage electrical shocks and plasma arcs—causing immediate pain, disrupting biological nervous systems (**Stunned** condition), and overloading electronic circuits and energy shields (`x2` damage against unhardened drones, shields, and electronics).

* **Metaphysical:**
  * *Electrokinesis:* Generating lightning arcs, manipulating electrical currents, disable electronic locks, or powering devices mentally.
  * *Electricity Evocation:* Summoning storm elementals or living lightning constructs.
  * *Electrical Enchantments:* Imbuing weapons to shock targets on contact or shield against electrical discharges.
* **Archaic Tech:**
  * *Leyden Jars:* Early electrostatic capacitors capable of discharging a localized shock on contact.
* **Modern Tech:**
  * *Stun Guns and Tasers:* Deliver high-voltage, low-amperage shocks to incapacitate nervous systems non-lethally.
  * *Electrical Projectiles:* Taser rounds and electro-flechettes effective against cybernetically augmented foes or powered armor.
  * *Electrical Traps and Mines:* Electrified grids and proximity mines used for perimeter security.
* **Advanced Tech:**
  * *Railguns:* Use electromagnetic Lorentz forces to accelerate slugs to hypersonic speeds while delivering a residual Voltic surge on impact.
  * *Electrical Cannons and Arc Blasters:* Project sustained lightning arcs that chain between conductive targets and overload internal power plants.
  * *Electrical Fields and Barriers:* High-voltage plasma screens that vaporize incoming ordnance.
  * *EMP (Electromagnetic Pulse) Devices:* Wide-area bursts that disable unshielded electronics, cybernetics, and vehicles across a battlefield.

### **6. Corrosive / Disintegration Damage**

Breaks down and dissolves a target's physical structure at the chemical or molecular level. Highly effective against armor, flesh, and fortifications, Corrosive damage **degrades Target Armor DR (`-2 DR` per hit)** and inflicts ongoing dissolution damage (`1/2` damage for 2 rounds), with critical hits causing structural collapse or total disintegration.

* **Metaphysical:**
  * *Acid Manipulation:* Conjuring and shaping corrosive fluids or entropy fields to dissolve locks, armor, or barriers.
  * *Acid Evocation:* Summoning corrosive oozes or elemental entities.
  * *Corrosive Enchantments:* Imbuing blades or projectiles to eat through armor on contact.
* **Archaic Tech:**
  * *Alchemical Acids:* Thrown glass flasks of vitriol or caustic bases that splash across armor and flesh.
  * *Natural Acids:* Monster bile, digestive enzymes, and venomous plant extracts applied to weapons.
* **Modern Tech:**
  * *Acid Grenades and Bombs:* Detonate into pressurized caustic mist that melts armor plating and organic tissue.
  * *Acid Guns and Launchers:* Fire capsules of concentrated fluoroantimonic/industrial acid to weaken structural weak points.
  * *Acid Sprayers and Projectors:* Heavy chemical hoses that dissolve fortifications and deny corridors.
* **Advanced Tech:**
  * *Molecular Acid Weapons:* Hyper-reactive compounds that sever molecular bonds instantaneously, bypassing conventional DR.
  * *Corrosive Energy (Disintegrator) Weapons:* Directed beams that strip atomic electrons, reducing targets to fine ash.
  * *Nanite-Based Corrosive Swarms:* Programmable grey-goo micro-swarms that infiltrate armor seams and consume target materials from within.

### **7. Ra-D / Radiation Damage**

Harnesses ionizing radiation (alpha, beta, gamma, and neutron emissions) to shred cellular DNA and induce lattice defects in electronics. Causes immediate cellular necrosis alongside long-term **Radiation Sickness (`-1 Stamina` drain on a failed Fortitude Save)**. Particularly lethal against unshielded biological targets and unhardened processors.

* **Metaphysical:**
  * *Radiokinesis:* Mentally generating ionizing rays, sensing fissile materials, or accelerating radioactive decay and transmutation.
  * *Radiation Evocation:* Summoning stellar or nuclear elemental entities that project radioactive auras.
  * *Radiation Enchantments:* Imbuing weapons with necrotic isotope energy or warding suits against cosmic radiation.
* **Archaic Tech:**
  * *Crude Radioactive Materials:* Unrefined pitchblende or meteoric isotopes used in poison traps (carrying severe self-exposure risk).
* **Modern Tech:**
  * *Radiological Weapons:* Area-denial devices dispersing radioactive isotopes.
  * *Radiation Guns & Grenades:* Emit focused ionizing bursts that create contaminated hazard zones and weaken defenders over time.
* **Advanced Tech:**
  * *Neutron Weapons:* High-energy particle beams that penetrate thick hull plating to kill biological crews while leaving structures intact.
  * *Gamma-Ray Lasers (Grasers):* Coherent gamma beams causing instantaneous cellular breakdown and acute radiation trauma.
  * *Radiation Emitters:* Continuous field generators used to sterilize boarding corridors or weaken entrenched forces.

### **8. Force Pulse / Disruption Damage**

Disrupts the fundamental kinetic and molecular forces holding matter together, delivering pure concussive repulsion or destabilizing atomic lattices. Force Pulse damage **ignores `1/2` of the Target's Armor DR** and frequently inflicts knockback or structural shattering on critical hits.

* **Metaphysical:**
  * *Disruption Field:* Creating localized fields that weaken molecular bonds to breach walls or shatter weapons.
  * *Force Manipulation (*Energy: Force*):* Directing gravity, inertia, and telekinetic repulsion to hurl enemies or deflect ordnance.
  * *Disruptive Enchantments:* Imbuing weapons with kinetic-field amplifiers that bypass half of physical armor.
* **Archaic Tech:**
  * *Crude Disruption Devices:* Unstable alchemical/resonance catalysts that release erratic kinetic shockwaves.
* **Modern Tech:**
  * *Disruptor Pistols and Rifles:* Fire bolts of cohesive force energy that weaken molecular integrity and make armor brittle.
  * *Disruption Grenades and Mines:* Release concentrated force waves to breach bulkheads and scatter formations.
  * *Disruption Fields:* Localized barriers that disintegrate incoming physical matter.
* **Advanced Tech:**
  * *Disruptor Cannons and Beam Weapons:* Capital and vehicular mounts capable of tearing apart hulls and fortifications.
  * *Disruptor Shields:* Defensive fields that destabilize and shatter incoming kinetic slugs and missiles.
  * *Molecular Disruptors:* Precision arrays tuned to the resonant frequency of specific alloys, crumbling enemy weapons or armor without harming surrounding matter.

---

## **3. KINETIC DAMAGE TYPES**

### **9. Blunt Damage**

Focuses on crushing and bruising targets through high-mass impact—causing widespread trauma, fractured bones, internal bleeding, and concussions. Blunt weapons gain **+1 to Stun CR** with *Weapon Focus* and excel at buckling rigid plate armor and smashing machinery.

* **Archaic Tech:** *Clubs and Staves* (wood, bone, or iron-shod), *Maces and Flails* (hinged or flanged metal heads designed to crush armor), and *Hammers and War Picks*.
* **Modern Tech:** *Shock Batons and Truncheons*, *Telescopic Batons*, and weighted *Impact Weapons*.
* **Advanced Tech:** *Power Fists and Augmented Gauntlets* (hydraulic/servo-assisted), *Force Hammers and Kinetic Mallets* (amplified by micro-thrusters or repulsor fields), and *Gravity Weapons* that crush targets under localized G-loads.

### **10. Slashing Damage**

Focuses on cutting, hacking, and shearing targets—causing wide lacerations, severe **Bleed** trauma on critical hits, and potential limb severing. Particularly devastating against unarmored or lightly armored targets and exposed joints.

* **Archaic Tech:** *Axes and Hatchets* (heavy chopping power), *Swords* (curved scimitars/katanas for slicing; longswords/greatswords for cleaving), and *Sickles and Scythes* (sweeping hooks).
* **Modern Tech:** *Machetes and Kukris*, *Chain Weapons* (segmented chain-whips, kusarigama, and motorized chainswords), and *Vibroblades* (high-frequency ultrasonic blades that slice through ballistic weave and plating).
* **Advanced Tech:** *Monomolecular Blades* (single-atom-thick edges that slice through heavy armor with surgical precision), *Energy Swords* (contained blades of pure photonic/force energy that cauterize wounds), and *Plasma Swords* (superheated magnetic loops that melt through bulkhead steel).

### **11. Piercing Damage**

Focuses on puncturing and perforating targets—concentrating kinetic energy into a narrow point to punch deep into vital organs or exploit seams in heavy armor (`+1 Penetration` bonus).

* **Archaic Tech:** *Arrows and Crossbow Bolts* (bodkin and broadhead), *Spears and Lances* (infantry reach and mounted couched charges), and *Daggers and Stilettos* (concealable blades for armor gaps).
* **Modern Tech:** *Rifle Bayonets*, *Flechettes* (fin-stabilized sub-caliber darts), and *Armor-Piercing (AP) Ammunition* (tungsten-carbide or depleted-uranium cores).
* **Advanced Tech:** *Gauss Rifles and Coilguns* (electromagnetic induction accelerators), *Needle Guns* (silent high-velocity micro-darts delivering neurotoxins), and *Railguns* (conductive-armature hyper-velocity penetrators).

### **12. Concussive / Impact Damage**

Represents massive, full-body kinetic shockwaves from sources larger than the target's body—such as high falls, vehicular collisions, and high-explosive blast waves. **Concussive Damage is divided equally (50/50) between Vitality and Health** whenever the character attempts to mitigate or evade the impact (regardless of whether the check succeeds), and typically **ignores half or all of physical Armor DR**:

* **Archaic Tech:**
  * *Crashing:* High-impact collisions with large objects or mounts *(Half DR if wearing Hard Armor without a Crash Suit option; Force Field DR is half effective)*.
  * *Falling Damage:* Inflicted when falling from beyond one's own height *(Ignores DR of physical armor and force fields; mitigated only by Acrobatics, Grav-Chutes, or flight)*.
  * *Siege Weapons:* Catapults, trebuchets, and battering rams *(Half DR if Hard Armor; Force Field DR is half effective)*.
* **Modern Tech:**
  * *Explosives:* Fragmentation/HE grenades, demolition charges, artillery shells, and landmines *(Half DR of Hard Armor without a Blast Suit option; Force Field DR is half effective)*.
* **Advanced Tech:**
  * *Gravity Weapons:* Localized gravitic implosion projectors *(Ignores physical Armor DR; Force Field DR is half effective)*.
  * *Weaponized Force Fields:* Repulsor rams and kinetic crushers *(Ignores solid physical Armor DR; Force Field DR is fully effective)*.

### **13. Bleed Damage**

**Bleed** is an ongoing circulatory trauma effect triggered by critical hits or specialized serrated/shrapnel weapons (primarily Slashing and Piercing). A bleeding target suffers **`1d4` (or weapon-rated `Bleed X`) direct Health/Vitality damage at the start of each of their turns**, completely **bypassing Armor DR and Stamina Base Toughness** until halted via a **Knowledge (Medicine) Check (`CR 10–15`)**, a trauma patch, or metaphysical healing.

---

## **4. VARIATIVE I: ELEMENTAL DAMAGE TYPES**

### **14. Radiant / Light Damage**

Harnesses coherent photonic energy and solar radiance to sear targets, induce temporary or permanent **Blindness** (`1d4` rounds on Crit), disrupt optical sensors, and dispel darkness/shadow effects. Particularly lethal to subterranean or shadow-bound entities with light sensitivity.

* **Metaphysical:** *Photokinesis* (generating blinding flashes, laser-like beams, and hard-light barriers), *Light Evocation* (summoning solar/luminous elementals), and *Light Enchantments* (weapons that blaze with searing daylight).
* **Archaic Tech:** *Polished Mirrors and Solar Reflectors* and *Alchemical Flare Lamps*.
* **Modern Tech:** *Flashbangs and Stun Grenades* and *High-Intensity Arc Searchlights*.
* **Advanced Tech:** *High-Energy Laser Arrays*, *Photonic Particle Beams*, and *Offensive Holographic Overload Projectors*.

### **15. Umbral / Shadow Damage**

Taps into primal darkness and entropic negative energy—draining warmth and vitality, obscuring vision, inducing dread, and solidifying shadows into tangible tendrils that **Entangle** targets on a critical hit.

* **Metaphysical:** *Umbrokinesis* (*Illusion: Shadow* — solidifying shadow-stuff into blades, snares, and cloaks), *Shadow Evocation* (summoning dark spirits and shadow hounds), and *Shadow Enchantments* (weapons that drink ambient light and siphon vitality).
* **Archaic Tech:** *Alchemical Darkness Powders* and *Shadow-Ward Traps*.
* **Modern Tech:** *Disorienting Strobe Arrays* and *Active Optical Camouflage*.
* **Advanced Tech:** *Dark-Energy / Kovian Umbral Projectors* and *Zero-Point Shadow Fields* that absorb all electromagnetic radiation within their radius.

### **16. Air Elemental Damage**

Harnesses barometric shear, cyclonic winds, and atmospheric pressure gradients—delivering concussive gale blasts, **knocking targets back (`10 ft` per Stage) or Prone**, disrupting flight stability, and creating localized vacuum pockets that suffocate targets.

* **Metaphysical:** *Aerokinesis* (generating wind blasts, vacuum spheres, and hurricane barriers), *Air Evocation* (summoning wind elementals and sylphs), and *Air Enchantments* (weapons that release concussive gale shockwaves on impact).
* **Archaic Tech:** *Giant Bellows* and *Canyon Wind-Funnel Traps*.
* **Modern Tech:** *Compressed Air Cannons* and *Barometric Disruptors*.
* **Advanced Tech:** *Vortex Generators* (creating localized micro-tornadoes) and *Atmospheric Pressure-Wave Emitters*.

### **17. Fire Elemental Damage**

Channels the living, primordial essence of elemental flame (*distinct from mundane thermal combustion*), burning with spiritual and resonant intensity that **bypasses standard mundane thermal insulation** and ignites targets with living fire.

* **Metaphysical:** *Primordial Pyrokinesis*, *Fire Elemental Evocation* (summoning true Salamanders and elemental fire-kin), and *Elemental Fire Enchantments*.
* **Archaic / Modern / Advanced Tech:** *Aetherite-Catalyzed Incendiaries*, *Draconic Flame Projectors*, and *Resonance-Infused Plasma Lances*.

### **18. Earth Elemental Damage**

Channels tectonic mass, seismic shockwaves, and crystalline stone—crushing targets under shifting rock, triggering localized earthquakes that **knock combatants Prone**, and pelting foes with petrifying mineral shards.

* **Metaphysical:** *Geokinesis* (causing rockslides, raising stone walls, and altering ground density), *Earth Evocation* (summoning earth elementals and stone golems), and *Earth Enchantments* (weapons weighted with tectonic density).
* **Archaic Tech:** *Stone-Hurling Siege Engines (Catapults/Trebuchets)* and *Deadfall Rock Traps*.
* **Modern Tech:** *Pattern-Detonated Seismic Charges* and *Heavy Excavation Rams*.
* **Advanced Tech:** *Tectonic Resonance Inducers (Seismic Weapons)* and *High-G Mass Drivers*.

### **19. Water Elemental Damage**

Harnesses hydrostatic pressure, crashing tidal surges, and abyssal currents—bludgeoning targets with high-pressure water jets, sweeping combatants off their feet, and inducing **drowning / hydrostatic crush** trauma.

* **Metaphysical:** *Hydrokinesis* (shaping high-pressure lances, tidal waves, and aqueous spheres), *Water Evocation* (summoning water elementals and nereids), and *Water Enchantments*.
* **Archaic Tech:** *Hydraulic Sluice Traps* and *Pressurized Water Pumps*.
* **Modern Tech:** *High-Pressure Riot/Industrial Water Cutters* and *Hydro-Acoustic Disruptors*.
* **Advanced Tech:** *Maelstrom Vortex Projectors* and *Abyssal Hydrostatic Pressure Emitters*.

---

## **5. VARIATIVE II: PLANAR & PSYCHIC DAMAGE TYPES**

### **20. Celestial Damage**

Embodies empyreal Syntropic order, divine judgment, and the pure radiance of higher planes. Celestial damage deals **double (`x2`) damage to Undead, Fiends, and Dissonant entities**, bypasses unholy Damage Reduction, and frequently carries secondary effects that **banish** extraplanar entities, dispel corruption, or heal allies.

* **Metaphysical:** *Divine Light Manipulation*, *Celestial Evocation* (calling archons or empyreal spirits), and *Holy Enchantments* (*Smite* and consecrated blades).
* **Archaic Tech:** *Consecrated Relics and Blessed Weapons* and *Sanctified Holy Water*.
* **Modern / Advanced Tech:** *Syntropic Resonance Projectors* and *Aetherium-Cored Sanctification Arrays* that amplify divine harmonic frequencies.

### **21. Infernal Damage**

Channels the corrupting, entropic Dissonance of the cthonic/infernal planes—blending hellfire with spiritual blight that sears both body and soul. Particularly effective against celestial/empyreal beings and those bound by infernal pacts. **Infernal wounds resist normal healing** until cleansed via *Restore* or *Exorcism*, and critical hits can inflict spiritual taint or Stygian memory erosion.

* **Metaphysical:** *Infernal Evocation* (summoning fiends and cthonic entities), *Infernal Pacts & Curses*, and *Hellfire Enchantments*.
* **Archaic Tech:** *Cthonic Relics* and *Sacrificial Ritual Implements*.
* **Modern / Advanced Tech:** *Dissonance-Core Disruptors* and *Stygian Entropy Cannons* tapping into corrupted dimensional rifts.

### **22. Dimensional Damage**

Manipulates and shears the fabric of spacetime itself—tearing at a target's physical form across dimensional boundaries, phasing subsections of matter into adjacent planes, or banishing targets into the Astral/Void. Dimensional damage **ignores all physical Armor DR** and is devastating against phase-shifting or extradimensional entities.

* **Metaphysical:** *Dimensional Rift Creation*, *Dimensional Displacement* (*Dimension: Teleport* offensive telefrag/shearing), and *Reality Manipulation*.
* **Archaic Tech:** *Precursor Dimensional Artifacts* and *Planar Binding Circles*.
* **Modern Tech:** *Phase-Lock Disruptors* and *Experimental Spatial Displacers*.
* **Advanced Tech:** *Interdimensional Rift Cannons*, *Reality Anchors* (locking local spacetime to prevent teleportation while crushing phased entities), and *Pocket-Dimension Collapse Grenades*.

### **23. Psyche / Mental Damage**

Targets the mind, ego, and synaptic pathways directly rather than the physical body. **Psyche / Mental Damage completely bypasses physical Armor DR** (mitigated instead by **Willpower Saves**, *Mind Barrier*, and psychic shielding). Inflicts confusion, terror, synaptic pain, memory loss, or unconsciousness.

* **Metaphysical:** *Psychic Assault / Mental Blast* (*Mental: Projection*), *Emotional Manipulation* (projecting overwhelming terror, despair, or rage), and *Mental Intrusion / Psychic Vampirism*.
* **Archaic Tech:** *Psychoactive Ritual Incense* and *Cursed Neural Idols*.
* **Modern Tech:** *Infrasonic/Subliminal Stress Inducers* and *Neuro-Scramblers*.
* **Advanced Tech:** *Psychic Resonance Amplifiers (Psi-Crowns)*, *Direct Neural Disruptors*, and *Hard-Wired Mind Control Arrays*.

