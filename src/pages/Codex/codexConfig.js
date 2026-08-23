import { 
  Building2, 
  Shield, 
  Cpu, 
  HeartHandshake, 
  Package, 
  Sparkles, 
  Bot, 
  Zap, 
  Users, 
  Globe, 
  Dna, 
  Crosshair,
  TrendingUp,
  Boxes,
  Database
} from 'lucide-react';

/**
 * Standard default computed outputs configuration for formula-driven matrices.
 */
export const DEFAULT_COMPUTED_OUTPUTS = [
  {
    id: 'credit_value',
    label: 'Market Value',
    icon: 'Coins',
    engine: 'econ',
    fn: 'calculateCreditValue',
    inputField: 'craft_dc',
    format: 'credits',
    color: '#f59e0b'
  },
  {
    id: 'material_cost',
    label: 'Material Cost (50%)',
    icon: 'Hammer',
    engine: 'econ',
    fn: 'calculateMaterialCost',
    inputField: '_credit_value',
    format: 'credits',
    color: '#10b981'
  },
  {
    id: 'ws_threshold',
    label: 'Wealth Score Required',
    icon: 'TrendingUp',
    engine: 'econ',
    fn: 'getWSFromDC',
    inputField: 'craft_dc',
    format: 'status_badge',
    color: '#38bdf8'
  },
  {
    id: 'complexity_tier',
    label: 'Complexity Tier',
    icon: 'Layers',
    engine: 'econ',
    fn: 'getComplexityTier',
    inputField: 'craft_dc',
    format: 'badge',
    color: '#a855f7'
  },
  {
    id: 'crafting_time',
    label: 'Crafting Duration',
    icon: 'Clock',
    engine: 'econ',
    fn: 'calculateAllCraftingTiers',
    inputField: '_credit_value',
    format: 'time_table'
  }
];

/**
 * Standard compute-on-save helper generating persistent _computed metadata.
 */
export const createStandardComputeOnSave = (uduTier = 'Socket', uduCount = 1) => (formState, engines) => {
  const dc = Number(formState.craft_dc ?? formState.design_dc ?? formState.dc ?? 0) || 0;
  const creditValue = engines.econ.calculateCreditValue(dc);
  const status = engines.econ.getFinancialStatus(dc);

  return {
    credit_value: creditValue,
    material_cost: engines.econ.calculateMaterialCost(creditValue),
    ws_threshold: dc,
    financial_status: status?.name || 'Standard',
    complexity_tier: engines.econ.getComplexityTier(dc),
    crafting_days: engines.econ.calculateAllCraftingTiers(creditValue),
    udu_displacement: { tier: uduTier, count: uduCount },
    computed_at: new Date().toISOString()
  };
};

/**
 * 14 Core Guided Development Matrix Definitions for the CODEX Suite.
 * Designed to serve as a robust, extensible foundation for in-game content creation
 * with real-time reactive formulas and Omnicortex database synchronization.
 */
export const CODEX_MATRICES = [
  {
    id: 'architecture',
    name: 'ARCHITECTURE',
    label: 'Architecture Matrix',
    icon: Building2,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'architecture',
    altCollection: 'society_architecture',
    description: 'Design orbital stations, planetary facilities, structural blueprints, tactical fortifications, and megastructures.',
    category: 'Property & Infrastructure',
    badge: 'Structural Matrix',
    customComponent: 'ArchitectureBlueprintConfigurator',
    defaultValues: {
      name: '',
      style: 'Cyber-Industrial',
      footprint: 'Large',
      height_class: 'Single',
      stories: 1,
      tl: 3,
      ml: 0,
      environment: 'Standard',
      specialized_modules: [],
      workforce_workers: 10,
      workforce_skill: 15,
      tool_tier: 'industrial',
      base_dc: 18,
      craft_dc: 18,
      durability: 200,
      cost: 2560,
      power_grid: 'Standard Fusion Matrix',
      security_level: 'High Security (Tier 3)',
      primary_purpose: 'Tactical Outpost',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Structure / Blueprint Name', type: 'text', required: true, placeholder: 'E.g., Aegis Spire Orbital Station' },
      { name: 'style', label: 'Architectural Style', type: 'select', options: ['Cyber-Industrial', 'Brutalist Voidcraft', 'Neo-Gothic High Arcology', 'Bio-Organic Crystalline', 'Nomadic Prefab Modular', 'Ancient Hyper-Structure', 'Subterranean Bunker Complex'] },
      { name: 'footprint', label: 'Scale & Footprint', type: 'select', options: ['Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'SuperGargantuan', 'MegaColossal'] },
      { name: 'height_class', label: 'Verticality & Stories', type: 'select', options: ['Single', 'Duplex', 'MultiStory', 'MidRise', 'HighRise', 'Skyscraper'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Architecture / Engineering DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'], helpText: 'Determines structural credit construction value via TSC' },
      { name: 'cost', label: 'Credit Construction Cost (Override)', type: 'number' },
      { name: 'durability', label: 'Structural Durability / HP', type: 'number' },
      { name: 'power_grid', label: 'Power & Life Support Matrix', type: 'text', placeholder: 'E.g., Geothermal Tap / Void Siphon Core' },
      { name: 'security_level', label: 'Security & Access Protocols', type: 'select', options: ['Open / Civilian Access', 'Restricted Standard', 'High Security (Tier 3)', 'Black-Site Military Matrix', 'Quantum Encrypted Quarantine'] },
      { name: 'primary_purpose', label: 'Primary Purpose / Function', type: 'text', placeholder: 'E.g., Weapons R&D, Mining Refinery, Defense Citadel' },
      { name: 'description', label: 'Design & Visual Overview', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Tactical Mechanics & Environmental Rules', type: 'textarea' },
      { name: 'note', label: 'Architect / GM Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'module_budget', label: 'Module Capacity', type: 'udu', tier: 'Module', maxField: 'durability', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.complex?.computeArchitectureStats) {
        return engines.complex.computeArchitectureStats(formData);
      }
      return createStandardComputeOnSave('Module', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Orbital Defense Citadel', prompt: 'An orbital planetary defense installation equipped with automated railguns and particle shielding.' },
      { name: 'Cyberpunk Arcology', prompt: 'A massive 200-story self-sustaining city complex owned by a ruthless mega-corporation with tiered access zones.' },
      { name: 'Ancient Alien Relic Vault', prompt: 'A subterranean ruin of forgotten meta-technology protected by gravity puzzles and energy barriers.' }
    ]
  },
  {
    id: 'armor',
    name: 'ARMOR',
    label: 'Armor Matrix',
    icon: Shield,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'armoring',
    description: 'Engineer tactical combat suits, powered exoskeletons, energy deflector shielding, and hazard environmental gear.',
    category: 'Combat & Defense',
    badge: 'Defense Matrix',
    customComponent: 'ArmorCoverageSelector',
    defaultValues: {
      name: '',
      size: 'Mediumweight',
      category: 'Mediumweight',
      coverage: 'Standard',
      body_locations: ['Torso', 'Head', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'],
      modules: [],
      downgrades: [],
      carried_shield: 'None',
      faction_skin: 'Syndicate',
      tl: 3,
      ml: 0,
      base_dc: 15,
      craft_dc: 15,
      durability: 20,
      dr_rating: 10,
      cost: 640,
      weight: 12,
      quality: 'Standard',
      component_slots: 4,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Armor / Suit Designation', type: 'text', required: true, placeholder: 'E.g., Apex Heavy Carapace Exosuit' },
      { name: 'quality', label: 'Crafting Quality', type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Crafting / Armor DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'], helpText: 'Determines base armor valuation via Tangent Standard Curve' },
      { name: 'durability', label: 'Base Durability / Structure Points (SP)', type: 'number' },
      { name: 'dr_rating', label: 'Base Damage Resistance (DR)', type: 'number' },
      { name: 'weight', label: 'Total Weight (kg)', type: 'number' },
      { name: 'cost', label: 'Credit Cost (Override)', type: 'number' },
      { name: 'description', label: 'Overview & Aesthetic', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage Reduction & Rules', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'socket_budget', label: 'Armor Socket Budget', type: 'udu', tier: 'Socket', maxField: 'component_slots', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.items?.computeArmorStats) {
        return engines.items.computeArmorStats(formData);
      }
      return createStandardComputeOnSave('Socket', 4)(formData, engines);
    },
    archetypes: [
      { name: 'Nano-Weave Infiltration Suit', prompt: 'Lightweight stealth bodysuit with active cloaking mesh and kinetic shock dampening.' },
      { name: 'Heavy Juggernaut Powered Frame', prompt: 'Heavy powered assault exoskeleton with magnetic clamp boots, auto-injectors, and heavy plate.' },
      { name: 'Psionic Aegis Shroud', prompt: 'Meta-attuned ceremonial weave capable of deflecting telepathic assaults and warping projectile paths.' }
    ]
  },
  {
    id: 'augmentations',
    name: 'AUGMENTATIONS',
    label: 'Augmentations Matrix',
    icon: Cpu,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'augmentations',
    description: 'Fabricate cybernetic implants, neural coprocessors, bioware enhancements, subdermal armor, and nanite systems.',
    category: 'Transhuman Enhancements',
    badge: 'Cyberware Matrix',
    customComponent: 'AugmentationNodeConfigurator',
    defaultValues: {
      name: '',
      category: 'body_mod',
      location: 'Torso',
      tech_level: 3,
      meta_level: 0,
      craft_dc: 20,
      nodes_consumed: 10,
      installed_mods_count: 1,
      is_fbc: false,
      fbc_package: 'Civilian',
      is_pseudo: false,
      bp_cost: 2,
      durability: 20,
      cost: 2560,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Augmentation Name', type: 'text', required: true, placeholder: 'E.g., Reflex Velocity Coprocessor' },
      { name: 'category', label: 'Augmentation Category', type: 'select', options: ['fashionware', 'synth_limb', 'hand_foot', 'limb_upgrade', 'exotic_limb', 'body_mod', 'sensory', 'brain', 'tl4_bioware', 'tl5_nanotech', 'fbc', 'pseudo', 'meta_aug'] },
      { name: 'location', label: 'Body Slot Location', type: 'select', options: ['Head', 'Torso', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg', 'Systemic'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Surgical / Design DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'] },
      { name: 'nodes_consumed', label: 'Node Displacement (UDU Nodes)', type: 'number', min: 0, max: 200 },
      { name: 'bp_cost', label: 'Build Point (BP) Bio-Tolerance', type: 'number' },
      { name: 'durability', label: 'Structure Points (SP)', type: 'number' },
      { name: 'cost', label: 'Credit Cost (Override)', type: 'number' },
      { name: 'description', label: 'Physiological Overview', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'In-Game Combat & Stat Mechanics', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'node_budget', label: 'Anatomical Node Budget', type: 'udu', tier: 'Node', maxField: 'nodes_consumed', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.complex?.computeAugmentationStats) {
        return engines.complex.computeAugmentationStats(formData);
      }
      return createStandardComputeOnSave('Node', 10)(formData, engines);
    },
    archetypes: [
      { name: 'Sub-Vocal Combat Link', prompt: 'Neural implant allowing instant encrypted telepathic coordination with squad members.' },
      { name: 'Thermal Camouflage Dermal Layer', prompt: 'Subdermal nanite layer that adjusts body surface temperature to match ambient surroundings.' },
      { name: 'Overclocked Adrenal Gland', prompt: 'Bioware stimulant pump granting extra actions in combat with high post-adrenaline fatigue.' }
    ]
  },
  {
    id: 'equipment',
    name: 'EQUIPMENT',
    label: 'Equipment Matrix',
    icon: Package,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'gear',
    description: 'Assemble field tools, medical tech, comms gear, scanners, electronic warfare decks, and exploration kits.',
    category: 'Gear & Utilities',
    badge: 'Equipment Matrix',
    customComponent: 'EquipmentCategoryConfigurator',
    defaultValues: {
      name: '',
      category: 'Electronics',
      size: 'Small',
      base_dc: 15,
      craft_dc: 15,
      workspace_scale: 'Belt',
      computer_pr: 1,
      software_level: 0,
      epr_rating: 0,
      supply_die: 'None',
      faction_skin: 'Syndicate',
      tl: 3,
      ml: 0,
      cost: 640,
      weight: 1.5,
      component_slots: 4,
      availability: 'Common',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Equipment / Item Name', type: 'text', required: true, placeholder: 'E.g., Omnidirectional Spectral Scanner' },
      { name: 'category', label: 'Gear Category', type: 'select', options: ['Electronics', 'Medical & Pharma', 'Surveillance & Recon', 'Survival & Environmental', 'Tactical Utility', 'Data & Infiltration', 'Maintenance & Tools'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Crafting DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'], helpText: 'Determines item market value via TSC formula' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'cost', label: 'Credit Cost (Override)', type: 'number' },
      { name: 'availability', label: 'Market Availability', type: 'select', options: ['Everywhere', 'Common', 'Uncommon', 'Rare', 'Restricted / Military', 'Black Market Only'] },
      { name: 'description', label: 'Item Overview & Components', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Rules, Battery Life & Roll Modifiers', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'socket_budget', label: 'Socket Budget', type: 'udu', tier: 'Socket', maxField: 'component_slots', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.items?.computeEquipmentStats) {
        return engines.items.computeEquipmentStats(formData);
      }
      return createStandardComputeOnSave('Socket', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Med-Injector Hypo-Gun', prompt: 'Rapid pressurized trauma injector loaded with coagulant stimulants and cellular repair gel.' },
      { name: 'Quantum Cyberdeck Rig', prompt: 'Hardened handheld cybernetic deck with multi-frequency uplink jack and ICE-breaking firmware.' },
      { name: 'Grav-Grapple Tether', prompt: 'Wrist-mounted magnetic grapple cable capable of lifting 300kg with built-in repulsor descent.' }
    ]
  },
  {
    id: 'invocation',
    name: 'INVOCATION',
    label: 'Invocation Matrix',
    icon: Sparkles,
    color: '#a855f7', // Purple
    theme: 'purple',
    targetCollection: 'invocations',
    description: 'Weave psionic powers, meta-abilities, psychic spells, dimensional anomalies, telekinesis, and consciousness rites.',
    category: 'Meta-Abilities & Psionics',
    badge: 'Psi Matrix',
    customComponent: 'InvocationParameterConfigurator',
    defaultValues: {
      name: '',
      discipline: 'telekinesis',
      baseDifficulty: 'Standard',
      baseDifficultyVal: 15,
      time: 'StandardAction',
      range: 'Medium',
      area: 'SingleTarget',
      duration: 'Instant',
      otherModifiers: [],
      scalingType: 'energyDamage',
      tech_level: 0,
      meta_level: 2,
      craft_dc: 15,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Invocation / Power Name', type: 'text', required: true, placeholder: 'E.g., Quantum Warp Lance' },
      { name: 'discipline', label: 'Psionic Discipline', type: 'select', options: ['telekinesis', 'telepathy', 'pyrokinesis', 'chronos', 'biometabolism', 'void_attunement', 'cryo', 'voltic', 'spatial_distortion', 'clairvoyance'] },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'tech_level', label: 'Tech Level Requirement (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Manifestation DC / Check', type: 'number', min: 0, max: 80 },
      { name: 'description', label: 'Sensory & Manifestation Description', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage, Duration, Strain & Save Rules', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.entities?.computeInvocationStats) {
        return engines.entities.computeInvocationStats(formData);
      }
      return createStandardComputeOnSave('Node', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Kinetic Shockwave Blast', prompt: 'A radial telekinetic pulse that knocks back enemies and shatters light barriers.' },
      { name: 'Neural Synaptic Jammer', prompt: 'Telepathic strike that overwhelms the target brain with sensory noise causing disorientation.' },
      { name: 'Sub-Atomic Pyre Siphon', prompt: 'Ignites localized atmospheric gases into blue plasma fire using raw thermal mental excitation.' }
    ]
  },
  {
    id: 'mecha',
    name: 'MECHA',
    label: 'Mecha Matrix',
    icon: Bot,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'mecha',
    description: 'Construct combat walkers, mobile battle armors, titan frames, dropships, hover-tanks, and assault chassis.',
    category: 'Vehicles & Heavy Frames',
    badge: 'Heavy Mech Matrix',
    customComponent: 'MechaChassisConfigurator',
    defaultValues: {
      name: '',
      domain: 'Military Ground',
      size: 'Medium',
      frame: 'Humanoid',
      propulsion: 'biped_myomer',
      armor_plating: [],
      installed_modules: [],
      components: [],
      vft_mode: 'None',
      pilot_agility: 0,
      tl: 3,
      ml: 0,
      base_dc: 22,
      craft_dc: 30,
      durability: 50,
      cost: 40960,
      speed: '30 ft/rnd',
      component_slots: 5,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Mecha / Chassis Designation', type: 'text', required: true, placeholder: 'E.g., Vanguard Mk-VI Stryker Frame' },
      { name: 'domain', label: 'Operational Domain', type: 'select', options: ['Personal Mobility', 'Civilian', 'Utility & Industrial', 'Military Ground', 'Aircraft & Atmospheric', 'Spacecraft & Interstellar', 'Watercraft & Submersible', 'Power Armor & Walkers'] },
      { name: 'size', label: 'Chassis Size Category', type: 'select', options: ['Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'SuperGargantuan', 'MegaColossal'] },
      { name: 'frame', label: 'Body Frame Configuration', type: 'select', options: ['Creature', 'Humanoid', 'Industrial', 'Personal', 'Platform', 'Racing', 'Walker', 'Winged'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Engineering / Fabrication DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'] },
      { name: 'cost', label: 'Credit Cost (Override)', type: 'number' },
      { name: 'durability', label: 'Hull Integrity / Structure Points (SP)', type: 'number' },
      { name: 'speed', label: 'Max Tactical Speed', type: 'text', placeholder: 'E.g., 40 ft/rnd (90 km/h)' },
      { name: 'component_slots', label: 'Hardpoint Mount Slots', type: 'number' },
      { name: 'description', label: 'Chassis Profile & Engineering Specs', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Armor Ratings, Maneuverability & Systems', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'mount_budget', label: 'Hardpoint Mount Budget', type: 'udu', tier: 'Mount', maxField: 'component_slots', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.complex?.computeMechaStats) {
        return engines.complex.computeMechaStats(formData);
      }
      return createStandardComputeOnSave('Mount', 5)(formData, engines);
    },
    archetypes: [
      { name: 'High-Mobility Bipedal Scout', prompt: 'Agile 5-meter walker with jump jets, sniper hardpoint, and electronic countermeasures.' },
      { name: 'Heavy Siege Titan', prompt: 'Massive 12-meter quad-legged armored artillery mech capable of anchoring into bedrock.' },
      { name: 'Atmospheric Drop Frame', prompt: 'Heavy armored exo-frame designed for orbital drop insertions with thruster deceleration.' }
    ]
  },
  {
    id: 'meta-tech',
    name: 'META-TECH',
    label: 'Meta-Tech Matrix',
    icon: Zap,
    color: '#a855f7', // Purple
    theme: 'purple',
    targetCollection: 'gear',
    altCollection: 'compendium',
    description: 'Devise psi-amplifiers, void-drive resonators, anomalous artifacts, ether batteries, and quantum catalyst devices.',
    category: 'Experimental Meta-Science',
    badge: 'Artifact Matrix',
    customComponent: 'MetaTechImbuementConfigurator',
    defaultValues: {
      name: '',
      enhancement_type: 'Active',
      base_item_dc: 15,
      invocation_rank: 10,
      tech_level: 3,
      meta_level: 2,
      sockets_used: 1,
      scale_tier: 'Personal',
      passive_mods: [],
      daily_charges: null,
      craft_dc: 25,
      cost: 12000,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Meta-Tech Device / Artifact Name', type: 'text', required: true, placeholder: 'E.g., Chrono-Harmonic Resonance Engine' },
      { name: 'enhancement_type', label: 'Enhancement Architecture', type: 'select', options: ['Passive', 'Active', 'Consumable', 'Amplifier'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Attunement / Synthesis DC', type: 'number', min: 0, max: 80 },
      { name: 'description', label: 'Anomalous Phenomena & Appearance', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Activation Triggers, Backlash & Effects', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'socket_budget', label: 'Attachment Socket Budget', type: 'udu', tier: 'Socket', maxField: 'sockets_used', color: '#a855f7' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.entities?.computeMetaTechStats) {
        return engines.entities.computeMetaTechStats(formData);
      }
      return createStandardComputeOnSave('Socket', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Psionic Focus Glaive', prompt: 'A melee staff housing a raw resonance crystal that channels the wielder psychic willpower into energy arcs.' },
      { name: 'Phase-Shift Cloaking Belt', prompt: 'A wearable device that blinks the user out of standard spacetime for fractions of a second.' },
      { name: 'Void-Siphon Containment Battery', prompt: 'A heavy cylindrical energy canister containing captured dark-matter radiation.' }
    ]
  },
  {
    id: 'modular-characters',
    name: 'MODULAR CHARACTERS',
    label: 'Modular Characters Matrix',
    icon: Users,
    color: '#3b82f6', // Blue
    theme: 'blue',
    targetCollection: 'modular_characters',
    altCollection: 'features',
    description: 'Assemble NPC archetypes, tactical adversary templates, security squads, mercenary bosses, and synth droids.',
    category: 'NPCs & Operative Templates',
    badge: 'Archetype Matrix',
    customComponent: 'ModularStatBlockConfigurator',
    defaultValues: {
      name: '',
      threatTier: 3,
      threat_tier: 3,
      competencyRole: 'Tank',
      role: 'Tank',
      designation: 'Adversary',
      bossType: 'Standard',
      boss_type: 'Standard',
      sizeCategory: 'Medium',
      size: 'Medium',
      isSynthetic: false,
      tacticalBehaviors: ['Defensive Anchor'],
      tech_level: 3,
      meta_level: 1,
      craft_dc: 20,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Operative / Archetype Name', type: 'text', required: true, placeholder: 'E.g., Syndicate Ghost Infiltrator' },
      { name: 'threatTier', label: 'Threat Tier (0-20)', type: 'number', min: 0, max: 20 },
      { name: 'competencyRole', label: 'Competency Role', type: 'select', options: ['Tank', 'Bruiser', 'Striker', 'Assassin', 'Sniper', 'Gunslinger', 'Blaster', 'Controller', 'Buffer', 'Healer', 'Commander', 'Summoner'] },
      { name: 'designation', label: 'Designation', type: 'select', options: ['Adversary', 'Ally', 'Companion', 'Neutral'] },
      { name: 'bossType', label: 'Chassis Type / Multiplier', type: 'select', options: ['Minion', 'Standard', 'Boss', 'Mastermind'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Encounter / Threat DC', type: 'number', min: 0, max: 80 },
      { name: 'description', label: 'Appearance, Behavioral AI & Motives', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Combat Behaviors, Special Traits & Loot', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.entities?.computeModularCharacterStats) {
        return engines.entities.computeModularCharacterStats(formData);
      }
      return createStandardComputeOnSave('Mount', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Cyber-Yakuza Enforcer', prompt: 'Heavy augmented street muscle with dermal plating, sub-dermal blades, and shotgun.' },
      { name: 'Corpo Black-Ops Assassin', prompt: 'Silent operative equipped with thermal cloak, silenced needle pistol, and monomolecular garrote.' },
      { name: 'Renegade Psi-Warmaster', prompt: 'Dangerous psychic commander who bends enemy minds while leading an automated drone squad.' }
    ]
  },
  {
    id: 'planetary-design',
    name: 'PLANETARY DESIGN',
    label: 'Planetary Design Matrix',
    icon: Globe,
    color: '#10b981', // Green / Emerald
    theme: 'emerald',
    targetCollection: 'planetary_design',
    description: 'Map star systems, planetary biomes, orbital stations, atmospheric conditions, hazardous zones, and alien ecologies.',
    category: 'Cosmology & Worldbuilding',
    badge: 'Planetary Matrix',
    customComponent: 'PlanetaryDesignConfigurator',
    defaultValues: {
      name: '',
      starClass: 'G',
      orbitalZone: 'BioZone',
      size: 6,
      atmosphere: 4,
      hydrography: 6,
      population: 7,
      starport: 'C',
      government: 4,
      lawLevel: 4,
      techLevel: 3,
      tl: 3,
      metaLevel: 1,
      ml: 1,
      dominant_faction: 'Independent',
      planet_type: 'Terrestrial Bio-World',
      craft_dc: 20,
      domainRatings: {},
      settlements: 'Nova Prime (Arcology Capital), Outpost 99',
      hazards: 'Corrosive Dust Storms, Solar Flares',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Planet / Celestial Body Name', type: 'text', required: true, placeholder: 'E.g., Valerius-9 Arcology Prime' },
      { name: 'planet_type', label: 'Celestial Classification', type: 'select', options: ['Terrestrial Bio-World', 'Ecumenopolis (City Planet)', 'Barren Wasteland', 'Volcanic Forge World', 'Ocean World / Aquatic Depths', 'Ice Giant Sub-Surface', 'Asteroid Mining Cluster', 'Orbital Habitat Mega-Ring'] },
      { name: 'dominant_faction', label: 'Controlling Faction / Authority', type: 'text', placeholder: 'E.g., Sol-Centauri Syndicate' },
      { name: 'craft_dc', label: 'Survey / Hazard DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'] },
      { name: 'settlements', label: 'Major Settlements & Starports', type: 'text', placeholder: 'E.g., Neon Reach Spire, Port Meridian' },
      { name: 'hazards', label: 'Planetary Hazards & Flora/Fauna', type: 'text', placeholder: 'E.g., Bioluminescent predators, tectonic rifts' },
      { name: 'description', label: 'Planetary Panorama & Climate Lore', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Environmental Survival Rules & DC Modifiers', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.planetary?.computePlanetaryStats) {
        return engines.planetary.computePlanetaryStats(formData);
      }
      return createStandardComputeOnSave('Module', 10)(formData, engines);
    },
    archetypes: [
      { name: 'Cyberpunk Ecumenopolis', prompt: 'A planet-spanning metropolis shrouded in perpetual acid smog and neon holograms.' },
      { name: 'Frozen Ocean Satellite', prompt: 'An icy moon with subterranean warm oceans harboring gargantuan bioluminescent lifeforms.' },
      { name: 'Derelict Mining Asteroid', prompt: 'A hollowed-out asteroid base with failing artificial gravity and rogue autonomous drill-drones.' }
    ]
  },
  {
    id: 'species',
    name: 'SPECIES',
    label: 'Species Matrix',
    icon: Dna,
    color: '#10b981', // Green / Emerald
    theme: 'emerald',
    targetCollection: 'species',
    description: 'Engineer alien lifeforms, genetic mutants, synthetic chassis races, uplifted animals, and meta-human bloodlines.',
    category: 'Biological & Synthetic Lineages',
    badge: 'Species Matrix',
    customComponent: 'SpeciesTraitSelector',
    defaultValues: {
      name: '',
      species_type: 'Humanoid',
      type: 'Humanoid',
      size: 'Medium',
      movement_modes: ['normal'],
      movement: 'normal',
      budget_level: 'Standard',
      bonus_str: 0,
      bonus_agi: 0,
      bonus_sta: 0,
      bonus_int: 0,
      bonus_wis: 0,
      bonus_cha: 0,
      skill_bundles: 0,
      traits: [],
      disadvantages: [],
      craft_dc: 15,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Species / Lineage Name', type: 'text', required: true, placeholder: 'E.g., Vesperian Void-Stalkers' },
      { name: 'budget_level', label: 'Budget Tier', type: 'select', options: ['Standard', 'Advanced', 'Monster'] },
      { name: 'species_type', label: 'Species Chassis Type', type: 'select', options: ['Aberration', 'Animal', 'Beast', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'] },
      { name: 'size', label: 'Size Category', type: 'select', options: ['Diminutive', 'Small', 'Medium', 'Large', 'Huge'] },
      { name: 'craft_dc', label: 'Genetic Complexity DC', type: 'number', min: 0, max: 80 },
      { name: 'description', label: 'Physiology, Culture & Evolutionary Origin', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Inherent Racial Traits, Senses & Weaknesses', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'species_bp', label: 'Species Build Points', type: 'custom', max: 20, unit: 'BP', color: '#10b981' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.entities?.computeSpeciesStats) {
        return engines.entities.computeSpeciesStats(formData);
      }
      return createStandardComputeOnSave('Node', 20)(formData, engines);
    },
    archetypes: [
      { name: 'Cyber-Symbiotic Android', prompt: 'Sentient synthetic humanoid chassis engineered for extreme void operations with modular limbs.' },
      { name: 'Chitinous Alien Stalker', prompt: 'Insectoid sentient predator species with compound thermal vision and natural chameleon camouflage.' },
      { name: 'Silicon-Based Energy Entity', prompt: 'Crystalline humanoid beings that feed on electrical currents and communicate through light pulses.' }
    ]
  },
  {
    id: 'weaponry',
    name: 'WEAPONRY',
    label: 'Weaponry Matrix',
    icon: Crosshair,
    color: '#f59e0b', // Amber
    theme: 'amber',
    targetCollection: 'weaponry',
    description: 'Forge kinetic firearms, energy blasters, plasma cutters, monofilament melee blades, and heavy ordnance.',
    category: 'Tactical Armaments',
    badge: 'Armament Matrix',
    customComponent: 'WeaponModStacker',
    defaultValues: {
      name: '',
      type: 'Kinetic',
      skill: 'Small Arms',
      size: 'Medium',
      wielding: 'Two-Handed',
      scale_multiplier: 1,
      modifications: [],
      downgrades: [],
      capacity_upgrade: 'typical',
      faction_skin: 'Syndicate',
      meta_ranks: 0,
      tl: 3,
      ml: 0,
      base_dc: 20,
      craft_dc: 20,
      cost: 2560,
      weight: 3.2,
      ap: 2,
      accuracy: 0,
      critical_score: '19-20',
      component_slots: 4,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Weapon Name / Model', type: 'text', required: true, placeholder: 'E.g., ARC-9 Plasma Burst Carbine' },
      { name: 'skill', label: 'Associated Combat Skill', type: 'select', options: ['Small Arms', 'Heavy Weapons', 'Energy Weapons', 'Melee Weapons', 'Exotic Weapons', 'Gunnery'] },
      { name: 'wielding', label: 'Wielding Configuration', type: 'select', options: ['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted / Heavy Tripod'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Crafting DC', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'], helpText: 'Determines weapon credit market value via Tangent Standard Curve' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'ap', label: 'Armor Piercing (AP)', type: 'number' },
      { name: 'critical_score', label: 'Critical Threat Range', type: 'text', placeholder: 'E.g., 19-20 (x2)' },
      { name: 'cost', label: 'Credit Cost (Override)', type: 'number' },
      { name: 'description', label: 'Weapon Aesthetics, Mechanism & Caliber', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage Dice, Range Bands & Special Effects', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    budgets: [
      { id: 'socket_budget', label: 'Attachment Socket Budget', type: 'udu', tier: 'Socket', maxField: 'component_slots', color: '#f59e0b' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: (formData, engines) => {
      if (engines?.items?.computeWeaponStats) {
        return engines.items.computeWeaponStats(formData);
      }
      return createStandardComputeOnSave('Socket', 1)(formData, engines);
    },
    archetypes: [
      { name: 'Magnetic Rail Pistol', prompt: 'Compact sidearm firing hyper-velocity flechettes capable of punching through reinforced plasteel.' },
      { name: 'Plasma Arc Rifle', prompt: 'Assault energy rifle that fires superheated ionized plasma bolts with lingering thermal burn.' },
      { name: 'High-Frequency Vibro-Katana', prompt: 'Monofilament composite blade oscillating at ultrasonic frequencies to slice through heavy armor.' }
    ]
  },
  {
    id: 'economatrix',
    name: 'ECONOMATRIX',
    label: 'Economatrix Suite',
    icon: TrendingUp,
    color: '#94a3b8', // Light Grey / Slate
    theme: 'slate',
    viewType: 'dashboard',
    targetCollection: 'economatrix',
    description: 'Master economic reference suite, trade route simulator, currency converter, and standard curve calculator.',
    category: 'System Reference & Calculators',
    badge: 'Economic Engine',
    defaultValues: {
      name: 'System Economic Reference Profile',
      craft_dc: 20,
      description: 'System Economic Reference Profile and market analysis parameters.'
    },
    fields: [
      { name: 'name', label: 'Reference / Profile Name', type: 'text', required: true, placeholder: 'E.g., Core Sector Trade Profile' },
      { name: 'craft_dc', label: 'Standard Curve DC (0-80)', type: 'number', min: 0, max: 80, triggers: ['credit_value', 'material_cost', 'ws_threshold', 'complexity_tier', 'crafting_time'] },
      { name: 'description', label: 'Economic Notes & Observations', type: 'textarea' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: createStandardComputeOnSave('Socket', 1)
  },
  {
    id: 'factions',
    name: 'FACTIONS',
    label: 'Faction Framework',
    icon: Users,
    color: '#3b82f6', // Blue
    theme: 'blue',
    targetCollection: 'factions',
    description: 'Design comprehensive sociological, economic, and military factions to populate the universe.',
    category: 'World Building',
    badge: 'Sociology Matrix',
    defaultValues: {
      name: '',
      archetype: 'Militaristic',
      tl: 3,
      wealth_modifier: 0,
      description: '',
      colloquialisms: '',
      symbol_sigil: '',
      driving_mandate: '',
      motto: '',
      core_beliefs: '',
      social_structure: '',
      outsider_view: '',
      law_order: '',
      government_type: '',
      leadership: '',
      succession: '',
      primary_exports: '',
      economic_model: '',
      military_doctrine: '',
      key_units: '',
      naval_assets: '',
      design_language: '',
      architecture: '',
      gear_aesthetic: '',
      lighting_mood: '',
      image_prompt: '',
      inherent_features: [],
      specific_skill_bonuses: []
    },
    fields: [
      { name: 'name', label: 'Faction Name', type: 'text', required: true, placeholder: 'E.g., Free Worlds Coalition' },
      { name: 'archetype', label: 'Archetype', type: 'select', options: ['Militaristic', 'Corporate / Mercantile', 'Religious / Cult', 'Technological', 'Criminal / Syndicate', 'Exploration / Academic', 'Agrarian / Colony', 'Isolationist / Alien'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'wealth_modifier', label: 'Wealth Modifier', type: 'number' },
      { name: 'description', label: 'General Overview', type: 'textarea' },
      { name: 'colloquialisms', label: 'Colloquialisms / Slang', type: 'text' },
      { name: 'symbol_sigil', label: 'Symbol / Sigil', type: 'text' },
      { name: 'driving_mandate', label: 'Driving Mandate', type: 'textarea' },
      { name: 'motto', label: 'Motto', type: 'text' },
      { name: 'core_beliefs', label: 'Core Beliefs', type: 'textarea' },
      { name: 'social_structure', label: 'Social Structure', type: 'textarea' },
      { name: 'outsider_view', label: 'View on Outsiders', type: 'textarea' },
      { name: 'law_order', label: 'Law & Order', type: 'textarea' },
      { name: 'government_type', label: 'Government Type', type: 'text' },
      { name: 'leadership', label: 'Leadership', type: 'text' },
      { name: 'succession', label: 'Succession Rules', type: 'text' },
      { name: 'primary_exports', label: 'Primary Exports', type: 'text' },
      { name: 'economic_model', label: 'Economic Model', type: 'text' },
      { name: 'military_doctrine', label: 'Military Doctrine', type: 'textarea' },
      { name: 'key_units', label: 'Key Units', type: 'textarea' },
      { name: 'naval_assets', label: 'Naval Assets', type: 'textarea' },
      { name: 'design_language', label: 'Design Language', type: 'textarea' },
      { name: 'architecture', label: 'Architecture', type: 'textarea' },
      { name: 'gear_aesthetic', label: 'Gear Aesthetic', type: 'textarea' },
      { name: 'lighting_mood', label: 'Lighting / Mood', type: 'textarea' },
      { name: 'image_prompt', label: 'AI Image Prompt Guidance', type: 'textarea' }
    ],
    computedOutputs: [], // Or add custom computed if needed
    computeOnSave: (formData, engines) => formData, // Just pass through, maybe we compute something?
    archetypes: [
      { name: 'Corporate Hegemony', prompt: 'A massive interplanetary conglomerate that acts as a sovereign nation.' },
      { name: 'Warrior Nomads', prompt: 'A fleet-based culture of proud warriors who rely on raiding.' }
    ]
  },
  {
    id: 'technology',
    name: 'TECHNOLOGY',
    label: 'Technology Codex',
    icon: Boxes,
    color: '#94a3b8', // Light Grey / Slate
    theme: 'slate',
    viewType: 'dashboard',
    targetCollection: 'technology',
    description: 'Tech Level encyclopedia, domain capability charts, schematic repositories, and adaptive material references.',
    category: 'System Reference & Calculators',
    badge: 'Tech Engine',
    defaultValues: {
      name: 'Technological Domain Reference Profile',
      tl: 3,
      craft_dc: 20,
      description: 'Technological Domain Reference Profile and civilization capabilities.'
    },
    fields: [
      { name: 'name', label: 'Technology Profile Designation', type: 'text', required: true, placeholder: 'E.g., Singularity Era Materials Matrix' },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'craft_dc', label: 'Technological Complexity DC', type: 'number', min: 0, max: 80 },
      { name: 'description', label: 'Technical Specifications & Domain Capabilities', type: 'textarea' }
    ],
    computedOutputs: DEFAULT_COMPUTED_OUTPUTS,
    computeOnSave: createStandardComputeOnSave('Socket', 1)
  },
  {
    id: 'ingestion-engine',
    name: 'DATA INGESTION',
    label: 'Omnicortex Ingestion Engine',
    icon: Database,
    color: '#f59e0b', // Amber
    theme: 'amber',
    viewType: 'dashboard',
    targetCollection: 'compendium',
    description: 'Bulk parse and inject external markdown data, tables, and raw text into the Omnicortex structured database.',
    category: 'System Reference & Calculators',
    badge: 'Admin Tool',
    customComponent: 'CodexIngestionEngine'
  }
];

export const HARDWARE_MATRIX_IDS = ['architecture', 'armor', 'augmentations', 'equipment', 'mecha', 'weaponry'];
export const CHARACTER_MATRIX_IDS = ['modular-characters', 'companion'];
export const PLANETARY_SPECIES_MATRIX_IDS = ['planetary-design', 'species'];
export const META_MATRIX_IDS = ['invocation', 'meta-tech'];
export const SYSTEM_MATRIX_IDS = ['economatrix', 'technology'];

// Backwards-compatible aliases
export const ENTITY_MATRIX_IDS = CHARACTER_MATRIX_IDS;
export const WORLD_MATRIX_IDS = PLANETARY_SPECIES_MATRIX_IDS;

export const getMatrixById = (id) => {
  return CODEX_MATRICES.find(m => m.id === id) || CODEX_MATRICES[0];
};

