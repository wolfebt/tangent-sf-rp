/**
 * ═══════════════════════════════════════════════════════════════════
 * TANGENT SF RP — CANONICAL CODEX DATASET GUIDANCE & SECTION MANUAL
 * Derived directly from BASTION Canonical Ruleset Master Catalog
 * (BASTION-RULE-CATALOG-MASTER-2026.09-REV2)
 * ═══════════════════════════════════════════════════════════════════
 */

export const DATASET_GUIDANCE = {
  weaponry: {
    id: 'weaponry',
    title: 'Tactical Weaponry Matrix',
    subtitle: 'Kinetic, Energy, Plasma & Melee Armament Design',
    category: 'Hardware & Armaments',
    isProperty: true,
    overview: 'All weapons in Tangent follow standard combat curves, damage dice scaling, armor piercing (AP) thresholds, and universal volumetric socket allocation. Standard crafting uses the Tangent Standard Curve (TSC).',
    canonicalRules: [
      { id: 'RULE-RES-01', title: '2d10 Dual Resolution', summary: 'Attacks roll 2d10 + Attribute Modifier + Skill Rank vs. Defender Agility + Defense Skill. Defender wins ties.' },
      { id: 'RULE-COMBAT-03', title: 'Armor Piercing (AP)', summary: 'AP reduces effective target Damage Reduction (DR) before applying damage.' },
      { id: 'RULE-ECON-01', title: 'Tangent Standard Curve (TSC)', summary: 'Credit Value = 10 * 4^(Craft DC / 5). Material Cost is exactly 50% of credit value.' }
    ],
    sections: [
      {
        id: 'frame',
        name: 'Chassis & Associated Skill',
        description: 'Defines the weapon wielding configuration and governing proficiency (Small Arms, Heavy Weapons, Energy Weapons, Melee Weapons, Gunnery).',
        tips: [
          'One-Handed: Compact profile, 1x recoil penalty, lower damage ceiling.',
          'Two-Handed: Shoulder-stocked or heavy grip, reduces recoil by 1, accommodates larger magazines and optics.',
          'Independent / Mounted: Heavy ordnance or bipod mount for zero recoil penalties when anchored.'
        ]
      },
      {
        id: 'combat_stats',
        name: 'Combat Mechanics & Damage Profile',
        description: 'Configure damage dice, armor piercing (AP), threat range, and firing modes (Single, Burst, Full-Auto).',
        tips: [
          'Kinetic: High AP, reliable against shields, affected by heavy composite plates.',
          'Plasma / Thermal: Deals bonus lingering thermal damage, high environmental stress.',
          'Critical Threat: Standard is Natural 20 (Double 10s). High-precision weapons can expand to 19-20.'
        ]
      },
      {
        id: 'sockets',
        name: 'Tactical Socket Allocation & UDU',
        description: 'Hardware capacity for optics, suppressors, extended magazines, and meta-tech imbuements.',
        tips: [
          'Size determines baseline sockets: Small (2), Medium (4), Large (6).',
          'Optics and muzzle devices consume 1 Socket each.',
          'Heavy experimental mods consume 2 Sockets.'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Economy & Manufacturing (Property / TSC)',
        description: 'Calculates the fabrication Difficulty Class, retail credit value, and salvage material costs.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC',
        tips: [
          'DC 10: Standard sidearm (160 Cr).',
          'DC 15: Advanced ballistic assault rifle (640 Cr).',
          'DC 20: Expert plasma rifle (2,560 Cr).'
        ]
      }
    ]
  },

  armor: {
    id: 'armor',
    title: 'Armor & Defensive Systems Matrix',
    subtitle: 'Protective Suits, Kinetic Shields & Hazardous Plating',
    category: 'Hardware & Protection',
    isProperty: true,
    overview: 'Armoring provides Damage Reduction (DR) across localized hit locations (Head, Torso, Arms, Legs), thermal insulation, and environmental seals against vacuum and radiation. Multiple worn layers follow the Diminishing Returns Armor Stacking Rule (Highest DR + +1 per stage of 5 [0=+0, 1-5=+1, 6-10=+2, 11-15=+3, etc.] calculated separately for each additional armor layer).',
    canonicalRules: [
      { id: 'RULE-COMBAT-04', title: 'Damage Reduction (DR)', summary: 'Flat subtractive damage absorption per hit location. Penetrating damage reduces Structure Points (SP) / Health.' },
      { id: 'RULE-COMBAT-05', title: 'Diminishing Returns Armor Stacking Rule', summary: 'Highest DR + +1 per stage of 5 [0=+0, 1-5=+1, 6-10=+2, 11-15=+3, etc.] calculated separately for each additional armor layer.' },
      { id: 'RULE-HAZ-01', title: 'Environmental Protection', summary: 'Seals protect against hard vacuum, extreme thermal shifts, toxic biomes, and radiation.' }
    ],
    sections: [
      {
        id: 'coverage',
        name: 'Hit Location Coverage Zones & Layer Stacking',
        description: 'Assign armor plating modules across Head, Torso, Left/Right Arm, and Left/Right Leg, and calculate layered DR via the Diminishing Returns Armor Stacking Rule.',
        tips: [
          'Full Rig: Uniform protection across all 6 hit locations, higher bulk/encumbrance.',
          'Vest / Carrier: Lightweight torso protection prioritizing agility and zero movement penalties.',
          'Diminishing Returns Armor Stacking: Highest DR + +1 per stage of 5 [0=+0, 1-5=+1, 6-10=+2, 11-15=+3, etc.] calculated separately for each additional armor layer.'
        ]
      },
      {
        id: 'seals',
        name: 'Environmental Seals & Hazard Defense',
        description: 'Active life support, radiation shielding, and vacuum integrity hours.',
        tips: [
          'Class I: Gas mask / particulate filter.',
          'Class II: 4-hour sealed internal atmospheric recycle.',
          'Class III: Full void-hardened EVA survival envelope with ablative thermal shielding.'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Fabrication & Durability (Property / TSC)',
        description: 'Manufacturing DC governs defense integrity and market value.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC',
        tips: [
          'DC 10: Lightweight Tactical Vest (160 Cr).',
          'DC 20: Heavyweight Plasteel Rig (2,560 Cr).',
          'DC 30: Superheavy / Mecha Powered Battlesuit (40,960 Cr).'
        ]
      }
    ]
  },

  augmentations: {
    id: 'augmentations',
    title: 'Augmentations & Cybernetics Matrix',
    subtitle: 'Prosthetic Nodes, Neural Uplinks & Bioware',
    category: 'Cybernetics & Bioware',
    isProperty: true,
    overview: 'Augmentations are manufactured cybernetic, bioware, or nanotech components installed into the 200 Anatomical Nodes chassis across 3 Augmentation Tiers (Basic 3 CP / 6 CP Credit, Heavy 6 CP / 12 CP Credit, Extreme 9 CP / 18 CP Credit). Inorganic replacements impose a Cyber-Occultism Resonance Penalty (-1 per 20 inorganic Nodes).',
    canonicalRules: [
      { id: 'RULE-AUG-01', title: '3 Augmentation Tiers & 200 Anatomical Nodes', summary: 'Basic (3 CP / 6 CP Credit), Heavy (6 CP / 12 CP Credit), and Extreme (9 CP / 18 CP Credit) across 200 Anatomical Nodes.' },
      { id: 'RULE-AUG-02', title: 'Cyber-Occultism Resonance Penalty', summary: 'Inorganic cybernetic installations impose a -1 Resonance Penalty per 20 inorganic Nodes.' },
      { id: 'RULE-AUG-03', title: 'Surgical Installation DC', summary: 'Medicine/Cybernetics check required for implantation. Surgical failure induces rejection trauma.' }
    ],
    sections: [
      {
        id: 'node_slots',
        name: '200 Anatomical Nodes & Body Location Allocation',
        description: 'Implant assignment across the 200 Anatomical Nodes (Cranial, Neural, Ocular, Torso, Arm, Leg, or Sub-dermal tissue).',
        tips: [
          'Cranial / Neural: Grants data-jacks, memory indexing, reflex triggers.',
          'Sub-Dermal: Dermal plasteel mesh granting natural DR without visual footprint.',
          'Prosthetic Limb: Structural replacement with integrated weapon or tool hardpoints.'
        ]
      },
      {
        id: 'augmentation_tiers',
        name: '3 Augmentation Tiers & Cyber-Occultism Resonance',
        description: 'Balance the 3 Augmentation Tiers (Basic 3 CP / 6 CP Credit, Heavy 6 CP / 12 CP Credit, Extreme 9 CP / 18 CP Credit), 200 Anatomical Nodes, and Cyber-Occultism Resonance Penalty (-1 per 20 inorganic Nodes).',
        tips: [
          '3 Augmentation Tiers: Basic 3 CP / 6 CP Credit, Heavy 6 CP / 12 CP Credit, Extreme 9 CP / 18 CP Credit.',
          'Cyber-Occultism Resonance Penalty: -1 penalty to metaphysical/psionic resonance per 20 inorganic Nodes.'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Fabrication & Surgical DC (Property / TSC)',
        description: 'Calculates hardware market value and surgical install difficulty.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC'
      }
    ]
  },

  equipment: {
    id: 'equipment',
    title: 'Equipment & Gear Matrix',
    subtitle: 'Electronics, Tools, Survival Gear & Personal Property',
    category: 'Hardware & Gear',
    isProperty: true,
    overview: 'Personal equipment encompasses tools, communication rigs, cyberdecks, power cells, medical injectors, and exploratory field gear.',
    canonicalRules: [
      { id: 'RULE-UDU-01', title: 'Universal Displacement Unit (UDU)', summary: 'Volumetric encumbrance standard. Pocket = 1/5 UDU, Bulk = 1 UDU, Mount = 5 UDU.' }
    ],
    sections: [
      {
        id: 'gear_classification',
        name: 'Category & Utility Function',
        description: 'Classify as Medical, Electronics, Surveillance, Survival, Exploration, or Power Supply.',
        tips: [
          'Power Cells: Standard Micro-Fusion, Chemical Battery, or Solar Recharging arrays.',
          'Consumables: Finite charges or single-use stimpacks.'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Manufacturing & Valuation (Property / TSC)',
        description: 'Fabrication DC and market valuation.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC'
      }
    ]
  },

  mecha: {
    id: 'mecha',
    title: 'Mecha & Heavy Frames Matrix',
    subtitle: 'Combat Walkers, Starships, Tanks & Mobile Frames',
    category: 'Vehicles & Heavy Frames',
    isProperty: true,
    overview: 'Mecha and vehicles represent heavy vehicular combat property. They feature volumetric Hull Structure Points (SP), propulsion modes, cockpit configurations, and hardpoint mounts.',
    canonicalRules: [
      { id: 'RULE-SCALE-01', title: 'Volumetric Scale Multiplier', summary: 'Vehicular scale (Large to MegaColossal) multiplies HP/SP and weapon impact.' },
      { id: 'RULE-HARDPOINT-01', title: 'Modular Mount Allocation', summary: 'Weapon and system mounts consume dedicated hardpoint capacity.' }
    ],
    sections: [
      {
        id: 'chassis',
        name: 'Chassis Scale & Body Frame',
        description: 'Chassis size category (Large, Huge, Gargantuan, Colossal) and configuration (Bipedal, Quadruped, Hover, Tracked, Starship).',
        tips: [
          'Large (10-15 ft): Bipedal scout or power suit.',
          'Huge (20-30 ft): Main battle walker or light dropship.',
          'Gargantuan (40+ ft): Heavy siege titan frame or gunship.'
        ]
      },
      {
        id: 'hardpoints',
        name: 'Hardpoints & Systems Budget',
        description: 'Mount heavy cannons, missile pods, ECM suites, and shield generators.'
      },
      {
        id: 'manufacturing',
        name: 'Shipyard / Factory Fabrication (Property / TSC)',
        description: 'Industrial assembly DC, hull structural credit cost, and build duration in shipyard days.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC'
      }
    ]
  },

  architecture: {
    id: 'architecture',
    title: 'Architecture & Real Property Matrix',
    subtitle: 'Planetary Facilities, Orbital Stations & Arcologies',
    category: 'Property & Infrastructure',
    isProperty: true,
    overview: 'True real property in Tangent SF RP. Encompasses tactical outposts, mining refineries, orbital docking hubs, underground bunkers, and planetary research arcologies.',
    canonicalRules: [
      { id: 'RULE-PROP-01', title: 'Real Property Construction', summary: 'Facilities require architectural design checks, workforce allocation, and foundation blueprints.' },
      { id: 'RULE-UDU-03', title: 'Module Displacement', summary: 'Facility rooms and specialized wings consume volumetric Module UDU capacity.' }
    ],
    sections: [
      {
        id: 'footprint',
        name: 'Scale, Footprint & Verticality',
        description: 'Total ground footprint (Small to MegaColossal) and vertical stories (Single, Duplex, HighRise, Skyscraper).',
        tips: [
          'Small / Single: Frontier survival cabin or listening post.',
          'Large / MultiStory: Tactical fortress, refinery, or orbital defense redoubt.',
          'Colossal / Skyscraper: Complete planetary arcology or starbase.'
        ]
      },
      {
        id: 'power_grid',
        name: 'Power Grid, Security & Modules',
        description: 'Reactor cores, quarantine bulkheads, turrets, comms arrays, and medical wings.'
      },
      {
        id: 'construction',
        name: 'Engineering & Construction Economics (Property / TSC)',
        description: 'Calculates total structural credit cost, workforce skill requirements, and construction days.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC'
      }
    ]
  },

  species: {
    id: 'species',
    title: 'Species & Lineages Matrix',
    subtitle: 'Biological, Genetic & Synthetic Lineage Architecture',
    category: 'Biological & Synthetic Lineages',
    isProperty: false, // NON-PROPERTY
    overview: 'Species define biological and cultural lineages. Species Character Point (CP) cost is dynamically calculated from the selected chassis, physical scale, movement modes, attributes, biological traits, and disadvantages. Species do NOT have fabrication costs or build DCs.',
    canonicalRules: [
      { id: 'RULE-CHAR-01', title: 'Dynamic Species CP Cost', summary: 'Species Character Point (CP) total is determined directly by the traits, chassis, and attributes added to the lineage.' },
      { id: 'RULE-CHAR-02', title: 'Trait & Disadvantage Balance', summary: 'Positive biological traits add to the CP cost; racial disadvantages and stigmas rebate CP.' }
    ],
    sections: [
      {
        id: 'chassis_type',
        name: 'Species Package Summary — Chassis, Biology, Traits, Pools & Flaws',
        description: 'Unified overview of the species chassis type, physical scale, locomotion modes, inherent attribute modifiers, attribute/skill/feature pools, biological traits (1, 2 & 4 CP), granted features, and flaw/stigma refunds.',
        tips: [
          'Chassis, Size, Movement, Attributes (+5 CP/pt), Skill Pools (+5 CP per +5 SP), Feature Pools (+3 CP/feature), and Traits (1, 2 & 4 CP) sum to the Species Package Cost.',
          'Disadvantages (Flaws) and Social Stigmas grant CP rebates that reduce the total Package Cost.'
        ]
      }
    ]
  },

  features: {
    id: 'features',
    title: 'Features & Talents Matrix',
    subtitle: 'Perks, Special Combat Abilities & Exotic Talents',
    category: 'Character Traits & Talents',
    isProperty: false, // NON-PROPERTY
    overview: 'Features and talents represent specialized training, biological mutations, or tactical perks purchased with Character Points (CP). They do NOT have credit values or manufacturing DCs.',
    canonicalRules: [
      { id: 'RULE-PROG-01', title: 'Character Point (CP) Progression', summary: 'Features cost between 1 and 10 CP based on power tier and mechanical impact.' },
      { id: 'RULE-PROG-02', title: 'Prerequisites & Gating', summary: 'Advanced features require minimum Attribute scores, Skill ranks, or Tier progressions.' }
    ],
    sections: [
      {
        id: 'classification',
        name: 'Feature Category & Tier',
        description: 'Classify as Combat, General, Skill, Karma, Meta, or Exotic talent.',
        tips: [
          'Combat: Affects tactical positioning, weapon handling, initiative, or called shots.',
          'Karma: Grants unique fate manipulation actions or bonus daily luck points.',
          'Skill: Expands specialization dice rolls or unlocks expert technical actions.'
        ]
      },
      {
        id: 'mechanics',
        name: 'Trigger Conditions & Rules Text',
        description: 'Define exact passive bonuses, activated triggers, resource costs, or cooldowns.',
        tips: [
          'Passive: Always active (e.g. +2 to Initiative checks).',
          'Triggered: Activates on specific events (e.g. when scoring a Critical Hit).'
        ]
      }
    ]
  },

  invocation: {
    id: 'invocation',
    title: 'Invocation & Psionics Matrix',
    subtitle: '6 Canonical Disciplines, 12 Foci & 5-Step Invocation Matrix',
    category: 'Meta-Abilities & Psionics',
    isProperty: false, // NON-PROPERTY
    hasSocketsAndUDU: false,
    hasModifications: false,
    hasCriticalDetails: true,
    overview: 'Invocations are psionic and metaphysical manifestations channeled through the 6 Canonical Disciplines (Dimension, Energy, Entropy, Illusion, Matter, Mental) and 12 Foci. Invocations do NOT have fabrication costs, physical sockets, or material requirements.',
    canonicalRules: [
      { id: 'RULE-META-01', title: 'Manifestation Resolution', summary: 'Casting check: 2d10 + Meta Skill Rank + Wisdom vs. 5-Step Invocation Matrix CR.' },
      { id: 'RULE-META-02', title: 'Essence / Focus Cost (ceil(CR / 5))', summary: 'Essence / Focus expenditure = ceil(CR / 5). Exceeding safe thresholds causes Overchannel Strain.' },
      { id: 'RULE-META-03', title: 'Critical Manifestation & Backlash', summary: 'Natural 20 achieves resonant surge; Natural 2 incurs psychic backlash.' }
    ],
    sections: [
      {
        id: 'discipline',
        name: 'Discipline, Focus & Power Tier',
        description: 'Governing Discipline (Dimension, Energy, Entropy, Illusion, Matter, Mental), Focus (12 Canonical Foci), and Meta Level (ML 0-6).',
        tips: [
          'ML 1: Minor cantrips and sensory enhancements (Essence/Focus = ceil(CR / 5)).',
          'ML 2-3: Standard tactical powers, kinetic blasts, mental shields.',
          'ML 4-6: Reality-bending phenomena, spatial rifts, mass temporal dilation.'
        ]
      },
      {
        id: 'manifestation_params',
        name: 'Targeting, Range, Area & Duration (5-Step Invocation Matrix)',
        description: 'Parameters defining Effect, Target, Area, Range, and Duration.',
        tips: [
          'Range: Personal/Touch, Short (30 ft), Medium (100 ft), Long (300 ft), Extreme.',
          'Area: Single Target, Line, Cone, Radial Burst, Emitted Aura.',
          'Duration: Instantaneous, Concentration, 1 Round, 1 Minute, Sustained.'
        ]
      },
      {
        id: 'critical_outcomes',
        name: 'Critical Details & Backlash Triggers',
        description: 'Resonant amplification triggers on natural criticals; mental backlash and strain on fumbles.',
        tips: [
          'Resonant Amplification: Double range, maximized damage, or free sustained duration.',
          'Backlash / Fumble: Psychic shock, loss of focus pool, involuntary sensory stun.'
        ]
      },
      {
        id: 'manifestation_dc',
        name: '5-Step Invocation Matrix CR & Essence Cost',
        description: 'Calculates the required manifestation CR and Essence/Focus cost.',
        formula: 'CR = Base (10) + Effect + Target + Area + Range + Duration | Essence = ceil(CR / 5)'
      }
    ]
  },

  factions: {
    id: 'factions',
    title: 'Societies & Factions Matrix',
    subtitle: 'Galactic Polities, Megacorporations & Syndicates',
    category: 'World Building',
    isProperty: false, // NON-PROPERTY
    hasSocketsAndUDU: false,
    hasModifications: false,
    hasCriticalDetails: false,
    overview: 'Factions represent the geopolitical, corporate, and ideological forces governing known sectors. They do NOT have build DCs, sockets, UDU displacement, or weapon upgrades.',
    canonicalRules: [
      { id: 'RULE-WORLD-01', title: 'Societal Paradigms', summary: 'Factions govern cultural skins, legal jurisdictions, trade tariffs, and military doctrines.' },
      { id: 'RULE-CHAR-03', title: 'Faction Character Integration', summary: 'Faction membership grants a 20-point Skill Package, recommended feature discounts, and signature origin perks.' }
    ],
    sections: [
      {
        id: 'character_mechanics',
        name: 'Operator Options & Character Mechanics',
        description: 'Faction Skill Package (20 Points Allocation), Recommended Features (1 CP Discount), and Bonus Features.',
        tips: [
          'Skill Package: 20-point distribution among faction-relevant skills (e.g., Bluff +4, Survival +3, Mechanics +3, Pilot +3).',
          'Recommended Features: Core traits associated with faction operatives, granted at 1 CP discount.',
          'Bonus Features: Special authority, racial, or background perks granted upon membership.'
        ]
      },
      {
        id: 'military_assets',
        name: 'Military Doctrine & Strategic Assets',
        description: 'Combat doctrine, key military units, void fleet assets, and proprietary tech/materials.',
        tips: [
          'Doctrine: High-firepower kinetic attrition, covert cyber warfare, or lightning void raids.',
          'Key Units: Named elite formations (e.g. Colonial Rangers, Federal Marshals).',
          'Naval Assets: Signature starship hulls and orbital platforms.'
        ]
      },
      {
        id: 'economic_model',
        name: 'Economic Model & Strategic Exports',
        description: 'Trade framework, primary export commodities, and wealth modifier scores.',
        tips: [
          'Exports: Heavy metals, Aetherite, Food rations, Industrial automation.',
          'Wealth Modifier: Score adjustments for faction operatives and worlds.'
        ]
      }
    ]
  },

  'modular-characters': {
    id: 'modular-characters',
    title: 'Modular Characters Matrix',
    subtitle: 'NPC Archetypes, Adversaries & Companion Templates',
    category: 'NPCs & Operator Templates',
    isProperty: false, // NON-PROPERTY
    overview: 'Modular character templates provide rapid archetype deployment for game masters. Characters have Threat Tiers (0-20) and combat roles, NOT fabrication costs.',
    canonicalRules: [
      { id: 'RULE-NPC-01', title: 'Threat Tier Standardization', summary: 'Threat Tier (0-20) scales baseline vitals (Health, Vitality) and attack modifiers.' }
    ],
    sections: [
      {
        id: 'role',
        name: 'Competency Role & Threat Tier',
        description: 'Tactical role (Tank, Striker, Assassin, Controller, Commander) and power tier (0-20).',
        tips: [
          'Minion: Fragile, single-hit vitals, acts in squads.',
          'Standard: Equal match for an individual operator.',
          'Boss: Multi-action economy, legendary resistance, enhanced vitals pool.'
        ]
      },
      {
        id: 'tactics',
        name: 'Tactical Behaviors & Special Loot',
        description: 'Combat AI routines, signature equipment, and narrative hooks.'
      }
    ]
  },

  'planetary-design': {
    id: 'planetary-design',
    title: 'Planetary Design Matrix',
    subtitle: 'Worlds, Biomes, Orbital Habitats & Cosmologies',
    category: 'Cosmology & Worldbuilding',
    isProperty: false, // NON-PROPERTY
    overview: 'Planetary design charts physical world specifications: star classes, atmospheric breathability, starport classifications, and environmental hazards.',
    canonicalRules: [
      { id: 'RULE-WORLD-02', title: 'Planetary Universal Profile', summary: 'World codes govern gravity, atmosphere, population, law level, and starport facilities.' }
    ],
    sections: [
      {
        id: 'classification',
        name: 'World Classification & Biome',
        description: 'Terrestrial Bio-World, Ecumenopolis, Volcanic Forge, Ocean Depth, or Ice Giant.',
        tips: [
          'BioZone: Habitable zone supporting standard organic life without pressure suits.',
          'Hazard Worlds: Require Class II/III environmental armor seals to survive.'
        ]
      },
      {
        id: 'civilization',
        name: 'Starport, Law Level & Settlements',
        description: 'Starport quality (Class A orbital mega-hub to Class E dirt strip) and legal restrictions.'
      }
    ]
  },

  economatrix: {
    id: 'economatrix',
    title: 'Economatrix Suite',
    subtitle: 'Standard Curves, Valuation & Trade Dynamics',
    category: 'System Reference & Calculators',
    isProperty: true,
    overview: 'Master reference suite for Tangent economics. Demonstrates the mathematical progression of the Tangent Standard Curve (TSC), Wealth Scores, and currency conversion.',
    canonicalRules: [
      { id: 'RULE-ECON-01', title: 'TSC Exponential Formula', summary: 'Credit Value = 10 * 4^(DC / 5). Material Cost is exactly 50%.' },
      { id: 'RULE-ECON-02', title: 'Wealth Score Ladder', summary: 'Wealth Scores (1-30) grant purchasing authority without tracking individual credits for trivial items.' }
    ],
    sections: [
      {
        id: 'standard_curve',
        name: 'Tangent Standard Curve (TSC)',
        description: 'Exponential valuation model mapping Crafting DC (0-80) to market prices.',
        formula: 'Credit Value = 10 * 4^(DC / 5)'
      }
    ]
  },

  technology: {
    id: 'technology',
    title: 'Technology Codex',
    subtitle: 'Tech Levels, Capability Trees & Material Science',
    category: 'System Reference & Calculators',
    isProperty: false,
    overview: 'System encyclopedia detailing technological development across civilization eras from TL0 (Stone Age) to TL5 (Singularity / Dimensional).',
    canonicalRules: [
      { id: 'RULE-TECH-01', title: 'Tech Level (TL) Standards', summary: 'TL0 Primitive, TL1 Industrial, TL2 Information, TL3 Interstellar, TL4 Quantum, TL5 Singularity.' }
    ],
    sections: [
      {
        id: 'tl_tiers',
        name: 'Tech Level Progression Ladder',
        description: 'Standard definitions and capability benchmarks for TL 0 through TL 5.'
      }
    ]
  },

  scaling: {
    id: 'scaling',
    title: 'Scaling Matrix & Sim',
    subtitle: '14-Tier Volumetric Size Categories & Fluid Mechanics',
    category: 'System Reference & Calculators',
    isProperty: false,
    overview: 'Universal 14-tier scale matrix governing size categories from Miniscule to MegaColossal, combat modifiers, and volumetric hit location defense.',
    canonicalRules: [
      { id: 'RULE-SCALE-02', title: '14 Size Tiers', summary: 'Miniscule, Fine, Diminutive, Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal, Enormous, Titanic, SuperGargantuan, MegaColossal.' }
    ],
    sections: [
      {
        id: 'size_tiers',
        name: 'Size Tier Characteristics',
        description: 'Physical dimensions, footprint, structure point multipliers, and attack modifiers against differing size classes.'
      }
    ]
  },

  archetypes: {
    id: 'archetypes',
    title: 'Archetypes Design Framework',
    subtitle: 'BASTION 1.02 — 80 CP Thematic Persona Chassis',
    category: 'Identity & Character Pillars',
    isProperty: false,
    overview: 'Archetypes define the 80 CP thematic foundation of a character across four Spheres (Sentinels, Operatives, Visionaries, Savants). Each archetype allocates +3 Primary Attribute (15 CP), +2 Secondary Attribute (10 CP), Skills (42 CP: 24 CP Essential + 18 CP Supporting), and Signature Traits & Recommended Core Features (13 CP: 2 CP Traits + 9 CP Features + 2 CP Chassis Rounding).',
    canonicalRules: [
      { id: 'RULE-ARCH-01', title: '80 CP Chassis Formula', summary: 'Primary Attr +3 (15 CP) + Secondary Attr +2 (10 CP) + Skills (42 CP: 24 CP Essential + 18 CP Supporting) + Signature Traits & Core Features (13 CP: 2 CP Traits + 9 CP Features + 2 CP Chassis Rounding) = 80 CP.' },
      { id: 'RULE-ARCH-02', title: 'Priority Skill Distribution', summary: '10 Archetype Skills: 4 Essential Skills (Rank 6 = 24 CP) + 6 Supporting Skills (Rank 3 = 18 CP) = 42 CP.' },
      { id: 'RULE-ARCH-03', title: 'Signature Feature Discount', summary: 'Archetype recommended features receive a -1 CP discount in the Persona Folio (2 CP instead of 3 CP).' }
    ],
    sections: [
      {
        id: 'attributes_sphere',
        name: 'Thematic Sphere & Primary/Secondary Attributes (25 CP)',
        description: 'Assign one of the 4 Spheres and designate the +3 Primary Attribute (15 CP) and +2 Secondary Attribute (10 CP).',
        formula: 'Primary (+3 = 15 CP) + Secondary (+2 = 10 CP) = 25 CP',
        tips: [
          'Sentinels: Stabilizers focused on protection, logistics, and endurance.',
          'Operatives: Artisans focused on action, adaptability, and tactical precision.',
          'Visionaries: Idealists focused on leadership, connection, and psionic/social influence.',
          'Savants: Rationals focused on engineering, science, and strategic mastery.'
        ]
      },
      {
        id: 'essential_skills',
        name: 'Essential & Supporting Skills Package (42 CP)',
        description: 'Define the 10 core skills that anchor the archetype (4 Essential Trained @ Rank 6 = 24 CP + 6 Supporting Novice @ Rank 3 = 18 CP).',
        formula: '4 × 6 SP (24 CP Essential) + 6 × 3 SP (18 CP Supporting) = 42 CP'
      },
      {
        id: 'signature_features',
        name: 'Signature Traits & Recommended Core Features (13 CP)',
        description: '2 Signature Traits (2 CP), 3 Recommended Core Features (9 CP budget; grants -1 CP discount in Folio), and 2 CP Chassis Rounding.',
        formula: '2 Traits (2 CP) + 3 Features (9 CP) + 2 CP Chassis Rounding = 13 CP | Total Chassis = 80 CP'
      }
    ]
  },

  origins: {
    id: 'origins',
    title: 'Origins & Homeworlds Design Framework',
    subtitle: 'BASTION 1.05 — 20 SP Society Pool & Environmental Traits',
    category: 'Identity & Character Pillars',
    isProperty: false,
    overview: 'Origins represent a persona’s formative homeworld or habitat environment. Each Origin provides a 20 Skill Point (SP) Society Skills pool, selectable Homeworld Traits (2 Free initially, +1 CP per extra), Recommended Features (-1 CP discount), and an EUFT Wealth Score modifier.',
    canonicalRules: [
      { id: 'RULE-ORIG-01', title: '20 SP Society Skills Pool', summary: 'Grants 20 Skill Points to distribute across the Origin’s listed Society Skills during character creation.' },
      { id: 'RULE-ORIG-02', title: 'Homeworld Trait Allocation', summary: 'Characters select 2 Origin Traits for 0 CP; additional Origin Traits cost 1 CP each.' },
      { id: 'RULE-ORIG-03', title: 'Recommended Feature Discount', summary: 'Features associated with the Origin cost -1 CP less (2 CP instead of 3 CP).' }
    ],
    sections: [
      {
        id: 'society_skills',
        name: 'Society Skills Package (20 SP Pool)',
        description: 'Curate 6 to 12 cultural and survival skills native to this habitat environment.',
        formula: 'Society Skill Pool = 20 SP (Creation Cap: Rank 11 / Recommended: Rank 6)'
      },
      {
        id: 'origin_traits',
        name: 'Selectable Homeworld Traits (2 Free / +1 CP Extra)',
        description: 'Define environmental adaptations and cultural conditioning traits (+2 situational bonus or specialized advantage).',
        formula: 'First 2 Traits = 0 CP | Additional Traits = 1 CP each'
      }
    ]
  },

  occupations: {
    id: 'occupations',
    title: 'Occupations & Careers Design Framework',
    subtitle: 'BASTION 1.06 — 20 SP Vocational Pool & Career Traits',
    category: 'Identity & Character Pillars',
    isProperty: false,
    overview: 'Occupations represent formal career training, guild service, and vocational history. Each Occupation grants a 20 Skill Point (SP) Professional Skills pool, selectable Occupational Traits (2 Free initially, +1 CP per extra), and Recommended Features (-1 CP discount).',
    canonicalRules: [
      { id: 'RULE-OCCU-01', title: '20 SP Professional Skills Pool', summary: 'Grants 20 Skill Points to allocate among the Occupation’s listed Professional Skills.' },
      { id: 'RULE-OCCU-02', title: 'Occupational Trait Allocation', summary: 'Select 2 Occupational Traits for 0 CP (including Common Traits: Background, Trade Tools, High Pay, Professionalism); extras cost 1 CP.' },
      { id: 'RULE-OCCU-03', title: 'Vocational Feature Discount', summary: 'Recommended career features receive a -1 CP discount (minimum 1 CP).' }
    ],
    sections: [
      {
        id: 'professional_skills',
        name: 'Professional Skills Package (20 SP Pool)',
        description: 'Specify 6 to 12 technical, combat, or social skills taught in this vocation.',
        formula: 'Professional Skill Pool = 20 SP (1 SP = 1 Rank)'
      },
      {
        id: 'career_traits_features',
        name: 'Occupational Traits & Recommended Features',
        description: 'Define signature career traits (1 CP value) and recommended feats (-1 CP discount).',
        formula: '2 Free Traits (0 CP) | Extra Trait = 1 CP | Recommended Feature = -1 CP Discount'
      }
    ]
  },

  skills: {
    id: 'skills',
    title: 'Skills & Specializations Design Framework',
    subtitle: 'BASTION 1.03 — 6 Mastery Stages (Rank 1–30) & Specialty Trees',
    category: 'Character Progression',
    isProperty: false,
    overview: 'Skills govern trained competency across Physical, Mental, Combat, Social, and Technical domains. Skill ranks cost 1 SP/CP per rank across 6 Mastery Stages (Rank 1–30), resolved via 2d10 + Governing Attribute + Skill Rank vs. CR, with Pinnacle Mastery (Rank 26–30) granting Advantage.',
    canonicalRules: [
      { id: 'RULE-SKILL-01', title: 'Linear 1 SP/CP Rank Cost', summary: 'Each Skill Rank costs 1 Skill Point (or 1 CP). Starting creation cap is Rank 11 (Expert); mastery progresses through Rank 30 (Pinnacle).' },
      { id: 'RULE-SKILL-02', title: '6 Mastery Stages (Rank 1–30)', summary: '2d10 + Governing Attribute + Skill Rank vs. CR across 6 Mastery Stages (Novice 1–5, Trained 6–10, Expert 11–15, Master 16–20, Grandmaster 21–25, Pinnacle 26–30 Advantage).' },
      { id: 'RULE-SKILL-03', title: 'Specializations (+2 Bonus)', summary: 'Specialties grant +2 to focused checks within the parent skill.' }
    ],
    sections: [
      {
        id: 'skill_taxonomy',
        name: 'Governing Attribute & Skill Group',
        description: 'Bind the skill to one of the 6 primary attributes (STR, AGI, STA, INT, WIS, CHA) and a functional skill group.',
        formula: 'Check = 2d10 + Governing Attribute + Skill Rank vs. CR (Pinnacle 26–30 Advantage)'
      }
    ]
  },

  trait: {
    id: 'trait',
    title: 'Traits Design Framework',
    subtitle: 'BASTION 1.01 / 1.05 / 1.06 — Biological & Pillar Traits',
    category: 'Character Traits & Genetics',
    isProperty: false,
    overview: 'Traits represent innate biological adaptations (Species Traits) or cultural/vocational conditioning (Origin & Occupation Traits). Species Traits scale across Basic (1 CP), Advanced (2 CP), and Elite (4 CP) tiers; Pillar Traits cost 1 CP.',
    canonicalRules: [
      { id: 'RULE-TRAIT-01', title: 'Tiered Build Cost (1 / 2 / 4 CP)', summary: 'Basic Species & Pillar Traits = 1 CP | Advanced Traits = 2 CP | Elite Traits = 4 CP.' },
      { id: 'RULE-TRAIT-02', title: 'Mechanical Scope', summary: '1 CP: +2 situational/skill bonus or minor sense. 2 CP: Constant resistance, natural weapon, or reroll. 4 CP: Major immunity, regeneration, or extra limb action.' }
    ],
    sections: [
      {
        id: 'trait_tier',
        name: 'Trait Tier & CP Valuation',
        description: 'Select Basic (1 CP), Advanced (2 CP), or Elite (4 CP) and configure structured modifiers.',
        formula: 'Basic = 1 CP | Advanced = 2 CP | Elite = 4 CP'
      }
    ]
  },

  disadvantages: {
    id: 'disadvantages',
    title: 'Disadvantages & Flaws Design Framework',
    subtitle: 'BASTION 1.01 / 1.07 — Biological Flaws & Personal Hindrances',
    category: 'Character Traits & Genetics',
    isProperty: false,
    overview: 'Disadvantages represent physiological vulnerabilities, psychological compulsions, or social stigmas that rebate Character Points (CP) during Species or Persona creation.',
    canonicalRules: [
      { id: 'RULE-DISADV-01', title: 'Species Flaw Rebate (-2 CP)', summary: 'Inherent species flaws rebate 2 CP each toward the 20 CP Species Package budget.' },
      { id: 'RULE-DISADV-02', title: 'Severity Tiers (3 / 6 / 9 CP)', summary: 'Personal character disadvantages grant 3 CP (Minor), 6 CP (Moderate), or 9 CP (Severe) rebates.' }
    ],
    sections: [
      {
        id: 'flaw_rebate',
        name: 'Severity Tier & CP Rebate Verification',
        description: 'Define the mechanical penalty or trigger condition and verify its CP rebate value.',
        formula: 'Species Flaw = -2 CP Rebate | Personal Disadvantage = 3 / 6 / 9 CP Rebate'
      }
    ]
  },

  species_type: {
    id: 'species_type',
    title: 'Species Chassis Types Design Framework',
    subtitle: 'BASTION 1.01 — Biological, Synthetic & Exotic Taxonomy',
    category: 'Biological & Synthetic Lineages',
    isProperty: false,
    overview: 'Species Chassis Types define the fundamental biology or construction of a lineage (Humanoid, Beast, Plant, Construct, Cybernetic, Aberration, Elemental, Ooze).',
    canonicalRules: [
      { id: 'RULE-CHASSIS-01', title: 'Chassis CP Cost', summary: 'Humanoid baseline costs 0 CP. Specialized chassis (Construct, Cybernetic, Elemental, etc.) carry inherent CP costs and physiological rules.' }
    ],
    sections: [
      {
        id: 'chassis_mechanics',
        name: 'Physiology, Vital Pools & Chassis CP Cost',
        description: 'Configure base CP cost, respiration/sustenance requirements, and inherent immunities or vulnerabilities.',
        formula: 'Humanoid = 0 CP | Exotic / Synthetic Chassis = Variable CP'
      }
    ]
  },

  species_size: {
    id: 'species_size',
    title: 'Species Size & Volumetric Scale Framework',
    subtitle: 'BASTION 1.01 — 14-Tier Physical Scale & Modifiers',
    category: 'Biological & Synthetic Lineages',
    isProperty: false,
    overview: 'Defines the physical scale tier of a lineage or entity, governing Attack/Defense size modifiers, Reach, Structure/Health multipliers, and locomotion speed scaling.',
    canonicalRules: [
      { id: 'RULE-SIZE-01', title: 'Size CP & Speed Scaling', summary: 'Medium is the 0 CP baseline (1x speed). Smaller sizes increase Defense; larger sizes increase Structure and Reach.' }
    ],
    sections: [
      {
        id: 'size_modifiers',
        name: 'Scale Modifiers, Speed Multiplier & CP Cost',
        description: 'Verify size tier index, CP cost, speed multiplier, and volumetric hit modifiers.',
        formula: 'Medium = 0 CP (1x Speed, +0 Hit/Def)'
      }
    ]
  },

  species_movement: {
    id: 'species_movement',
    title: 'Locomotion & Movement Modes Framework',
    subtitle: 'BASTION 1.01 — Base Modes, Paces & Speed Adjusters',
    category: 'Biological & Synthetic Lineages',
    isProperty: false,
    overview: 'Defines base locomotion modes (Ground, Flying, Swimming, Climbing, Burrowing) and speed adjusters that sum to a species’ tactical movement profile.',
    canonicalRules: [
      { id: 'RULE-MOVE-01', title: 'Additive Movement Math', summary: 'Normal Ground (30 ft) is 0 CP. Additional modes (Flight, Swim, Climb, Burrow) and speed adjusters add CP to the Species budget.' }
    ],
    sections: [
      {
        id: 'locomotion_cost',
        name: 'Base Speed, Target Mode & CP Cost',
        description: 'Configure base speed in feet, speed delta adjusters, and CP cost.',
        formula: 'Ground 30 ft = 0 CP | Specialized Modes & Speed Boosts = +1 to +4 CP'
      }
    ]
  },

  disciplines: {
    id: 'disciplines',
    title: 'Psionic & Meta-Disciplines Design Framework',
    subtitle: 'BASTION Chapter 5 — Awakened Schools & Resonance',
    category: 'Meta-Abilities & Psionics',
    isProperty: false,
    overview: 'Disciplines represent overarching schools of psionic or meta-dimensional mastery (Telekinesis, Telepathy, Pyrokinesis, Chronos, Biokinesis). Unlocking a Discipline costs 3 CP and grants access to its Invocations.',
    canonicalRules: [
      { id: 'RULE-DISC-01', title: '3 CP Discipline Unlock', summary: 'Acquiring a Meta-Discipline costs 3 CP and establishes the governing Focus Attribute and Meta Skill.' }
    ],
    sections: [
      {
        id: 'discipline_core',
        name: 'School, Focus Attribute & Governing Skill',
        description: 'Define the psionic school, key mental attribute (Wisdom, Intellect, Charisma), and resonance mechanics.',
        formula: 'Discipline Unlock = 3 CP | Associated Invocations = 1 CP each'
      }
    ]
  },

  other: {
    id: 'other',
    title: 'Commodities & Personal Property Framework',
    subtitle: 'BASTION Chapter 6 — Trade Goods, Materials & Curiosities',
    category: 'Hardware & Property',
    isProperty: true,
    overview: 'Encompasses raw industrial materials, trade commodities, luxury goods, rations, and miscellaneous physical property governed by the Tangent Standard Curve (TSC) and UDU volumetric encumbrance.',
    canonicalRules: [
      { id: 'RULE-ECON-01', title: 'Tangent Standard Curve (TSC)', summary: 'Credit Value = 10 * 4^(Craft DC / 5). Material Cost is 50% of market value.' },
      { id: 'RULE-UDU-01', title: 'Universal Displacement Unit (UDU)', summary: 'Tracks volumetric displacement from Pocket (0.2 UDU) to Bulk cargo.' }
    ],
    sections: [
      {
        id: 'commodity_valuation',
        name: 'Market Valuation & UDU Displacement (Property / TSC)',
        description: 'Calculate market price, crafting/procurement DC, Required Wealth Score (WS), and UDU cargo volume.',
        formula: 'Credit Value = 10 * 4^(DC / 5) | Material Cost = 50% | WS Required = DC'
      }
    ]
  }
};

// Map Cortex collection aliases directly so every Cortex component resolves its Rules Codex Design Framework
DATASET_GUIDANCE.armoring = DATASET_GUIDANCE.armor;
DATASET_GUIDANCE.gear = DATASET_GUIDANCE.equipment;
DATASET_GUIDANCE.invocations = DATASET_GUIDANCE.invocation;
DATASET_GUIDANCE.special_abilities = DATASET_GUIDANCE.invocation;
DATASET_GUIDANCE.modular_characters = DATASET_GUIDANCE['modular-characters'];
DATASET_GUIDANCE.companions = DATASET_GUIDANCE['modular-characters'];
DATASET_GUIDANCE.planets = DATASET_GUIDANCE['planetary-design'];
DATASET_GUIDANCE.planetary_design = DATASET_GUIDANCE['planetary-design'];
DATASET_GUIDANCE.world = DATASET_GUIDANCE['planetary-design'];
DATASET_GUIDANCE.traits = DATASET_GUIDANCE.trait;
DATASET_GUIDANCE.species_traits = DATASET_GUIDANCE.trait;
DATASET_GUIDANCE.species_disadvantages = DATASET_GUIDANCE.disadvantages;
DATASET_GUIDANCE.other_property = DATASET_GUIDANCE.other;

export const CODEX_DATASET_GUIDANCE = DATASET_GUIDANCE;

export const getGuidanceForDataset = (datasetKey) => {
  if (!datasetKey) return null;
  const key = String(datasetKey).toLowerCase().trim();
  return DATASET_GUIDANCE[key] || DATASET_GUIDANCE[key.replace(/_/g, '-')] || DATASET_GUIDANCE[key.replace(/-/g, '_')] || null;
};
