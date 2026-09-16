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
      { id: 'RULE-ECON-01', title: 'Tangent Standard Curve (TSC)', summary: 'Credit Value = 10 * 1.5^(Craft DC - 10). Material Cost is exactly 50% of credit value.' }
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
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC',
        tips: [
          'DC 15: Military Issue sidearm (~57 Cr).',
          'DC 20: Advanced combat assault rifle (~437 Cr).',
          'DC 25: Mastercraft / Heavy ordnance plasma cannon (~3,325 Cr).'
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
    overview: 'Armoring provides Damage Reduction (DR) across localized hit locations (Head, Torso, Arms, Legs), thermal insulation, and environmental seals against vacuum and radiation.',
    canonicalRules: [
      { id: 'RULE-COMBAT-04', title: 'Damage Reduction (DR)', summary: 'Flat subtractive damage absorption per hit location. Penetrating damage reduces Structure Points (SP) / Health.' },
      { id: 'RULE-HAZ-01', title: 'Environmental Protection', summary: 'Seals protect against hard vacuum, extreme thermal shifts, toxic biomes, and radiation.' }
    ],
    sections: [
      {
        id: 'coverage',
        name: 'Hit Location Coverage Zones',
        description: 'Assign armor plating modules across Head, Torso, Left/Right Arm, and Left/Right Leg.',
        tips: [
          'Full Rig: Uniform protection across all 6 hit locations, higher bulk/encumbrance.',
          'Vest / Carrier: Lightweight torso protection prioritizing agility and zero movement penalties.',
          'Powered Exo-Plating: Hydraulic assist negates heavy armor agility penalties.'
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
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC',
        tips: [
          'DC 16: Tactical Flak Vest (~86 Cr).',
          'DC 22: Void-Hardened Plasteel Rig (~984 Cr).',
          'DC 28: Heavy Powered Battlesuit (~11,223 Cr).'
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
    overview: 'Augmentations are manufactured cybernetic or biotech components installed into body location slots. Each installation induces cybernetic Strain against maximum Essence.',
    canonicalRules: [
      { id: 'RULE-AUG-01', title: 'Cybernetic Strain & Essence', summary: 'Total augmentation Strain cannot exceed character Essence without risk of cyber-rejection.' },
      { id: 'RULE-AUG-02', title: 'Surgical Installation DC', summary: 'Medicine/Cybernetics check required for implantation. Surgical failure induces rejection trauma.' }
    ],
    sections: [
      {
        id: 'node_slots',
        name: 'Body Location Node & Slot Allocation',
        description: 'Implant assignment into Cranial, Neural, Ocular, Torso, Arm, Leg, or Sub-dermal tissue.',
        tips: [
          'Cranial / Neural: Grants data-jacks, memory indexing, reflex triggers. High essence cost.',
          'Sub-Dermal: Dermal plasteel mesh granting natural DR without visual footprint.',
          'Prosthetic Limb: Structural replacement with integrated weapon or tool hardpoints.'
        ]
      },
      {
        id: 'strain_essence',
        name: 'Strain & Essence Economy',
        description: 'Balance physiological load against organic vital stability.',
        tips: [
          'Military Grade: Lower strain cost due to high biocompatibility, but higher Craft DC and cost.',
          'Black-Market / Scrappy: High strain and rejection risk, but affordable fabrication.'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Fabrication & Surgical DC (Property / TSC)',
        description: 'Calculates hardware market value and surgical install difficulty.',
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC'
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
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC'
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
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC'
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
        formula: 'Credit Value = 10 * 1.5^(DC - 10) | Material Cost = 50% | WS Required = DC'
      }
    ]
  },

  species: {
    id: 'species',
    title: 'Species & Lineages Matrix',
    subtitle: 'Biological, Genetic & Synthetic Lineage Architecture',
    category: 'Biological & Synthetic Lineages',
    isProperty: false, // NON-PROPERTY
    overview: 'Species define biological and cultural lineages. Species creation uses a standardized 20 Character Point (CP) point-buy budget. Species do NOT have fabrication costs or build DCs.',
    canonicalRules: [
      { id: 'RULE-CHAR-01', title: 'Species 20 CP Budget Standard', summary: 'Standard playable species are engineered with an exact net balance of 20 Character Points (CP).' },
      { id: 'RULE-CHAR-02', title: 'Trait & Disadvantage Balance', summary: 'Positive biological traits cost CP; racial disadvantages rebate CP to expand trait allowances.' }
    ],
    sections: [
      {
        id: 'chassis_type',
        name: 'Chassis Type & Biology',
        description: 'Humanoid, Synthetic, Aberration, Beast, Elemental, or Plantigrade morphology.',
        tips: [
          'Size: Standard playable species are Medium. Small grants defense bonuses; Large grants Might bonuses.',
          'Movement: Standard terrestrial walking (30 ft/rnd), Aquatic, Burrowing, or Flight.'
        ]
      },
      {
        id: 'traits',
        name: 'Inherent Biological Traits & Flaws',
        description: 'Sensory advantages (Darkvision, Thermal), natural armor, elemental resistances, and physiological vulnerabilities.',
        tips: [
          'Traits consume points from the 20 CP budget.',
          'Disadvantages grant bonus CP (up to +10 CP max rebate) to balance expensive traits.'
        ]
      },
      {
        id: 'budget_balance',
        name: 'Point-Buy Balance Engine (20 CP Target)',
        description: 'Dynamic verification ensuring the species adheres to canonical Tangent balance guidelines.',
        formula: 'Net CP = Positive Traits (CP) - Disadvantage Rebates (CP) = Target 20 CP'
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
    subtitle: 'Disciplines, Psychic Spells & Meta-Abilities',
    category: 'Meta-Abilities & Psionics',
    isProperty: false, // NON-PROPERTY
    hasSocketsAndUDU: false,
    hasModifications: false,
    hasCriticalDetails: true,
    overview: 'Invocations are psionic manifestations channeled through mental disciplines (Telekinesis, Telepathy, Pyrokinesis, Chronos, etc.). Invocations do NOT have fabrication costs, physical sockets, or material requirements.',
    canonicalRules: [
      { id: 'RULE-META-01', title: 'Manifestation Resolution', summary: 'Casting check: 2d10 + Meta Skill Rank + Wisdom/Will vs. Manifestation DC.' },
      { id: 'RULE-META-02', title: 'Focus Points (FP) & Strain', summary: 'Focus expenditure powers invocations. Exceeding safe thresholds causes mental Strain.' },
      { id: 'RULE-META-03', title: 'Critical Manifestation & Backlash', summary: 'Natural 20 achieves resonant surge; Natural 2 incurs mental strain or psychic backlash.' }
    ],
    sections: [
      {
        id: 'discipline',
        name: 'Discipline & Power Tier',
        description: 'Governing discipline (Telekinesis, Telepathy, Pyrokinesis, Spatial Distortion) and Meta Level (ML 0-5).',
        tips: [
          'ML 1: Minor cantrips and sensory enhancements (Focus 1).',
          'ML 2-3: Standard tactical powers, kinetic blasts, mental shields (Focus 2-4).',
          'ML 4-5: Reality-bending phenomena, spatial rifts, mass temporal dilation (Focus 5+).'
        ]
      },
      {
        id: 'manifestation_params',
        name: 'Targeting, Range, Area & Duration',
        description: 'Parameters defining reach and spatial envelope.',
        tips: [
          'Range: Touch, Short (30 ft), Medium (100 ft), Long (300 ft), Extreme.',
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
        name: 'Manifestation DC & Focus Expenditure',
        description: 'Calculates the required manifestation check DC and focus cost.',
        formula: 'DC = Base CR (15) + (ML * 2) + Range/Area Modifiers | Focus = ML + 1'
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
        name: 'Player Options & Character Mechanics',
        description: 'Faction Skill Package (20 Points Allocation), Recommended Features (1 BP Discount), and Bonus Features.',
        tips: [
          'Skill Package: 20-point distribution among faction-relevant skills (e.g., Bluff +4, Survival +3, Mechanics +3, Pilot +3).',
          'Recommended Features: Core traits associated with faction operatives, granted at 1 BP discount.',
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
    category: 'NPCs & Operative Templates',
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
          'Standard: Equal match for an individual operative.',
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
      { id: 'RULE-ECON-01', title: 'TSC Exponential Formula', summary: 'Credit Value = 10 * 1.5^(DC - 10). Material Cost is exactly 50%.' },
      { id: 'RULE-ECON-02', title: 'Wealth Score Ladder', summary: 'Wealth Scores (1-30) grant purchasing authority without tracking individual credits for trivial items.' }
    ],
    sections: [
      {
        id: 'standard_curve',
        name: 'Tangent Standard Curve (TSC)',
        description: 'Exponential valuation model mapping Crafting DC (1-80) to market prices.',
        formula: 'Credit Value = 10 * 1.5^(DC - 10)'
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
  }
};

export const CODEX_DATASET_GUIDANCE = DATASET_GUIDANCE;

export const getGuidanceForDataset = (datasetKey) => {
  if (!datasetKey) return null;
  const key = datasetKey.toLowerCase();
  return DATASET_GUIDANCE[key] || null;
};
