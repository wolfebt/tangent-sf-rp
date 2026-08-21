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
  Crosshair 
} from 'lucide-react';

/**
 * 12 Core Guided Development Matrix Definitions for the CODEX Suite.
 * Designed to serve as a robust, extensible foundation for in-game content creation
 * and direct synchronization with the Omnicortex database.
 */
export const CODEX_MATRICES = [
  {
    id: 'architecture',
    name: 'ARCHITECTURE',
    label: 'Architecture Matrix',
    icon: Building2,
    color: '#38bdf8', // Sky Cyan
    theme: 'cyan',
    targetCollection: 'architecture',
    altCollection: 'society_architecture',
    description: 'Design orbital stations, planetary facilities, structural blueprints, tactical fortifications, and megastructures.',
    category: 'Property & Infrastructure',
    badge: 'Structural Matrix',
    defaultValues: {
      name: '',
      style: 'Cyber-Industrial',
      scale: 'Installation / Facility',
      tl: 3,
      ml: 0,
      cost: 250000,
      durability: 500,
      power_grid: 'Standard Fusion Matrix',
      security_level: 'High Security (Tier 3)',
      primary_purpose: 'Tactical Outpost',
      design_dc: '16',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Structure / Blueprint Name', type: 'text', required: true, placeholder: 'E.g., Aegis Spire Orbital Station' },
      { name: 'style', label: 'Architectural Style', type: 'select', options: ['Cyber-Industrial', 'Brutalist Voidcraft', 'Neo-Gothic High Arcology', 'Bio-Organic Crystalline', 'Nomadic Prefab Modular', 'Ancient Hyper-Structure', 'Subterranean Bunker Complex'] },
      { name: 'scale', label: 'Scale & Footprint', type: 'select', options: ['Tactical Room / Bunker', 'Single Installation / Facility', 'Multi-Block Complex', 'Orbital Citadel / Starport', 'Planetary Arcology', 'System Megastructure'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'cost', label: 'Credit Construction Cost', type: 'number' },
      { name: 'durability', label: 'Structural Durability / HP', type: 'number' },
      { name: 'power_grid', label: 'Power & Life Support Matrix', type: 'text', placeholder: 'E.g., Geothermal Tap / Void Siphon Core' },
      { name: 'security_level', label: 'Security & Access Protocols', type: 'select', options: ['Open / Civilian Access', 'Restricted Standard', 'High Security (Tier 3)', 'Black-Site Military Matrix', 'Quantum Encrypted Quarantine'] },
      { name: 'primary_purpose', label: 'Primary Purpose / Function', type: 'text', placeholder: 'E.g., Weapons R&D, Mining Refinery, Defense Citadel' },
      { name: 'design_dc', label: 'Engineering / Design DC', type: 'text' },
      { name: 'description', label: 'Design & Visual Overview', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Tactical Mechanics & Environmental Rules', type: 'textarea' },
      { name: 'note', label: 'Architect / GM Notes', type: 'textarea' }
    ],
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
    color: '#10b981', // Emerald
    theme: 'emerald',
    targetCollection: 'armoring',
    description: 'Engineer tactical combat suits, powered exoskeletons, energy deflector shielding, and hazard environmental gear.',
    category: 'Combat & Defense',
    badge: 'Defense Matrix',
    defaultValues: {
      name: '',
      tl: 3,
      ml: 0,
      cost: 1500,
      weight: 12,
      durability: 80,
      quality: 'Standard',
      classification: ['Tactical Exosuit'],
      material: ['Plasteel Composite'],
      resistance: ['Kinetic', 'Energy'],
      component_slots: 3,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Armor / Suit Name', type: 'text', required: true, placeholder: 'E.g., Apex Heavy Carapace Exosuit' },
      { name: 'quality', label: 'Crafting Quality', type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'cost', label: 'Credit Cost', type: 'number' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'durability', label: 'Armor Durability / Deflection Points', type: 'number' },
      { name: 'component_slots', label: 'Component Slots', type: 'number' },
      { name: 'description', label: 'Overview & Aesthetic', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage Reduction & Rules', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#06b6d4', // Cyan
    theme: 'cyan',
    targetCollection: 'augmentations',
    description: 'Fabricate cybernetic implants, neural coprocessors, bioware enhancements, subdermal armor, and nanite systems.',
    category: 'Transhuman Enhancements',
    badge: 'Cyberware Matrix',
    defaultValues: {
      name: '',
      type: 'Cyberware',
      location: ['Subdermal'],
      tech_level: 3,
      meta_level: 0,
      cost: 2500,
      cr: 2,
      cp: 5,
      design_dc: '14',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Augmentation Name', type: 'text', required: true, placeholder: 'E.g., Reflex Velocity Coprocessor' },
      { name: 'type', label: 'Augmentation Class', type: 'select', options: ['Cyberware', 'Bioware', 'Nanotech Colony', 'Neural Interface', 'Genetic Splice', 'Meta-Somatic Graft'] },
      { name: 'location', label: 'Body Location / Installation Node', type: 'select', options: ['Cranial / Neural', 'Ocular / Sensory', 'Torso / Internal Organ', 'Subdermal / Skeletal', 'Limb / Motor Control', 'Full Body Systemic'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'cost', label: 'Credit Cost', type: 'number' },
      { name: 'cp', label: 'Character Point (CP) Cost', type: 'number' },
      { name: 'cr', label: 'Cyber-Rejection / Cyberware Strain (CR)', type: 'number' },
      { name: 'design_dc', label: 'Surgical Installation / Design DC', type: 'text' },
      { name: 'description', label: 'Physiological Overview', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'In-Game Combat & Stat Mechanics', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    archetypes: [
      { name: 'Sub-Vocal Combat Link', prompt: 'Neural implant allowing instant encrypted telepathic coordination with squad members.' },
      { name: 'Thermal Camouflage Dermal Layer', prompt: 'Subdermal nanite layer that adjusts body surface temperature to match ambient surroundings.' },
      { name: 'Overclocked Adrenal Gland', prompt: 'Bioware stimulant pump granting extra actions in combat with high post-adrenaline fatigue.' }
    ]
  },
  {
    id: 'companion',
    name: 'COMPANION',
    label: 'Companion Matrix',
    icon: HeartHandshake,
    color: '#ec4899', // Pink
    theme: 'pink',
    targetCollection: 'features',
    altCollection: 'compendium',
    description: 'Synthesize combat drones, cyber-beasts, AI sub-minds, genetically engineered familiars, and robotic guardians.',
    category: 'Entities & Constructs',
    badge: 'Construct Matrix',
    defaultValues: {
      name: '',
      companion_type: 'Tactical Combat Drone',
      size: 'Small',
      tech_level: 3,
      meta_level: 0,
      vitality: 25,
      armor_rating: 12,
      control_method: 'Neural Link / Voice Directive',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Companion / Unit Name', type: 'text', required: true, placeholder: 'E.g., Sentinel-IV Micro-Recon Drone' },
      { name: 'companion_type', label: 'Companion Type', type: 'select', options: ['Tactical Combat Drone', 'AI Sub-Mind / Digital Familiar', 'Bio-Engineered Beast', 'Cyber-Canine / Scout Hound', 'Security Automaton', 'Meta-Symbiote'] },
      { name: 'size', label: 'Size Category', type: 'select', options: ['Diminutive', 'Small', 'Medium', 'Large', 'Huge'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'vitality', label: 'Vitality / Hit Points', type: 'number' },
      { name: 'armor_rating', label: 'Armor / Deflection Rating', type: 'number' },
      { name: 'control_method', label: 'Control / Sync Interface', type: 'text', placeholder: 'E.g., Sub-vocal headset, Neural sync, Autonomous AI' },
      { name: 'description', label: 'Physical Profile & Personality Subroutine', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Command Directives & Combat Actions', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    archetypes: [
      { name: 'Hover Recon Drone', prompt: 'Compact floating quadcopter drone equipped with thermal optics and laser designator.' },
      { name: 'Cybernetic War Hound', prompt: 'Canine beast with titanium reinforced jaw, subdermal plating, and scent tracking algorithms.' },
      { name: 'Holographic AI Persona', prompt: 'Portable sub-mind entity stored on a holocron data-core offering tactical hacking analysis.' }
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
    defaultValues: {
      name: '',
      category: 'Electronics',
      tl: 3,
      ml: 0,
      cost: 450,
      weight: 1.5,
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
      { name: 'cost', label: 'Credit Cost', type: 'number' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'availability', label: 'Market Availability', type: 'select', options: ['Everywhere', 'Common', 'Uncommon', 'Rare', 'Restricted / Military', 'Black Market Only'] },
      { name: 'description', label: 'Item Overview & Components', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Rules, Battery Life & Roll Modifiers', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#8b5cf6', // Purple
    theme: 'purple',
    targetCollection: 'invocations',
    description: 'Weave psionic powers, meta-abilities, psychic spells, dimensional anomalies, telekinesis, and consciousness rites.',
    category: 'Meta-Abilities & Psionics',
    badge: 'Psi Matrix',
    defaultValues: {
      name: '',
      discipline: 'Telekinesis',
      meta_skill: 'Metaconcentration',
      tech_level: 0,
      meta_level: 2,
      design_dc: '15',
      area: ['Single Target'],
      effect: ['Kinetic Strike'],
      range: ['Medium (30m)'],
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Invocation / Power Name', type: 'text', required: true, placeholder: 'E.g., Quantum Warp Lance' },
      { name: 'discipline', label: 'Psionic Discipline', type: 'select', options: ['Telekinesis', 'Telepathy', 'Clairvoyance', 'Pyrokinesis', 'Chronos-Distortion', 'Biometabolism', 'Void-Attunement'] },
      { name: 'meta_skill', label: 'Required Meta Skill', type: 'text', placeholder: 'E.g., Metapsychology, Will Focus' },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'tech_level', label: 'Tech Level Requirement (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'design_dc', label: 'Manifestation DC / Check', type: 'text' },
      { name: 'range', label: 'Range & Vector', type: 'select', options: ['Self / Touch', 'Close (10m)', 'Medium (30m)', 'Long (100m)', 'Sightline / Planetary'] },
      { name: 'description', label: 'Sensory & Manifestation Description', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage, Duration, Strain & Save Rules', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#ef4444', // Red / Crimson
    theme: 'red',
    targetCollection: 'mecha',
    description: 'Construct combat walkers, mobile battle armors, titan frames, dropships, hover-tanks, and assault chassis.',
    category: 'Vehicles & Heavy Frames',
    badge: 'Heavy Mech Matrix',
    defaultValues: {
      name: '',
      classification: ['Medium Assault Mech'],
      control: 'Pilot',
      tl: 4,
      ml: 0,
      cost: 150000,
      height: 7.5,
      weight: 18000,
      durability: 450,
      speed: '75 km/h',
      personnel: '1 Pilot',
      cargo: '500 kg',
      component_slots: 6,
      design_dc: '20',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Mecha / Chassis Designation', type: 'text', required: true, placeholder: 'E.g., Vanguard Mk-VI Stryker Frame' },
      { name: 'control', label: 'Control & Piloting Interface', type: 'select', options: ['Pilot (Direct Cockpit)', 'Neural Link Pilot', 'Remote Uplink Rig', 'Autonomous AI Core', 'Multi-Crew (Pilot + Gunner)'] },
      { name: 'tl', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'ml', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'cost', label: 'Credit Cost', type: 'number' },
      { name: 'height', label: 'Chassis Height (meters)', type: 'number' },
      { name: 'weight', label: 'Chassis Mass (kg)', type: 'number' },
      { name: 'durability', label: 'Hull Integrity / Armor Points', type: 'number' },
      { name: 'speed', label: 'Max Ground / Flight Speed', type: 'text', placeholder: 'E.g., 90 km/h ground, 350 km/h boost' },
      { name: 'component_slots', label: 'Hardpoint Weapon / Component Slots', type: 'number' },
      { name: 'description', label: 'Chassis Profile & Engineering Specs', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Armor Ratings, Maneuverability & Systems', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#eab308', // Yellow / Gold
    theme: 'yellow',
    targetCollection: 'gear',
    altCollection: 'compendium',
    description: 'Devise psi-amplifiers, void-drive resonators, anomalous artifacts, ether batteries, and quantum catalyst devices.',
    category: 'Experimental Meta-Science',
    badge: 'Artifact Matrix',
    defaultValues: {
      name: '',
      tech_level: 4,
      meta_level: 3,
      resonance_rating: 'Tier 3 Active Resonance',
      energy_source: 'Void-Crystalline Siphon',
      attunement_required: true,
      cost: 12000,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Meta-Tech Device / Artifact Name', type: 'text', required: true, placeholder: 'E.g., Chrono-Harmonic Resonance Engine' },
      { name: 'resonance_rating', label: 'Resonance Stability', type: 'select', options: ['Tier 1 Stable Catalyst', 'Tier 2 Harmonic Flow', 'Tier 3 Active Resonance', 'Tier 4 Volatile Flux', 'Tier 5 Singularity Cascade'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'energy_source', label: 'Exotic Energy Source', type: 'text', placeholder: 'E.g., Quantum Singularity Core, Psionic Crystal Matrix' },
      { name: 'attunement_required', label: 'Requires Psionic / Meta Attunement', type: 'boolean' },
      { name: 'cost', label: 'Estimated Value / Cost', type: 'number' },
      { name: 'description', label: 'Anomalous Phenomena & Appearance', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Activation Triggers, Backlash & Effects', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#0284c7', // Deep Cyan / Blue
    theme: 'blue',
    targetCollection: 'compendium',
    altCollection: 'features',
    description: 'Assemble NPC archetypes, tactical adversary templates, security squads, mercenary bosses, and synth droids.',
    category: 'NPCs & Operative Templates',
    badge: 'Archetype Matrix',
    defaultValues: {
      name: '',
      role: 'Combat Specialist',
      threat_level: 'Elite (Tier 3)',
      tech_level: 3,
      meta_level: 1,
      attributes: 'STR 14, AGI 16, STA 14, INT 12, WIS 10, CHA 11',
      equipment_loadout: 'Tactical Exosuit, Plasma Rifle, EMP Grenades',
      key_skills: 'Small Arms 5, Athletics 4, Tactical Command 3',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Operative / Archetype Name', type: 'text', required: true, placeholder: 'E.g., Syndicate Ghost Infiltrator' },
      { name: 'role', label: 'Tactical Role', type: 'select', options: ['Combat Specialist', 'Heavy Breacher', 'Cyber Infiltrator / Hacker', 'Psi-Sniper', 'Tactical Field Commander', 'Bioweapon Assassin', 'Drone Operator'] },
      { name: 'threat_level', label: 'Threat Rating', type: 'select', options: ['Minion / Civilian (Tier 1)', 'Standard Operative (Tier 2)', 'Elite Specialist (Tier 3)', 'Apex Squad Leader (Tier 4)', 'Boss / Nemesis (Tier 5)'] },
      { name: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'attributes', label: 'Primary Attributes Summary', type: 'text', placeholder: 'E.g., STR 15, AGI 16, STA 14, INT 12, WIS 10, CHA 12' },
      { name: 'key_skills', label: 'Core Skills & Bonuses', type: 'text', placeholder: 'E.g., Infiltration 6, Ballistics 5, Stealth 5' },
      { name: 'equipment_loadout', label: 'Standard Equipment Loadout', type: 'text', placeholder: 'E.g., Silent Carbine, Stealth Armor, Flashbangs' },
      { name: 'description', label: 'Appearance, Behavioral AI & Motives', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Combat Behaviors, Special Traits & Loot', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#14b8a6', // Teal
    theme: 'teal',
    targetCollection: 'compendium',
    description: 'Map star systems, planetary biomes, orbital stations, atmospheric conditions, hazardous zones, and alien ecologies.',
    category: 'Cosmology & Worldbuilding',
    badge: 'Planetary Matrix',
    defaultValues: {
      name: '',
      planet_type: 'Terrestrial Bio-World',
      atmosphere: 'Breathable (Oxygen-Rich)',
      gravity: '1.0 G (Standard)',
      tech_level: 3,
      dominant_faction: 'Colonial Trade Union',
      settlements: 'Nova Prime (Arcology Capital), Outpost 99',
      hazards: 'Corrosive Dust Storms, Solar Flares',
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Planet / Celestial Body Name', type: 'text', required: true, placeholder: 'E.g., Valerius-9 Arcology Prime' },
      { name: 'planet_type', label: 'Celestial Classification', type: 'select', options: ['Terrestrial Bio-World', 'Ecumenopolis (City Planet)', 'Barren Wasteland', 'Volcanic Forge World', 'Ocean World / Aquatic Depths', 'Ice Giant Sub-Surface', 'Asteroid Mining Cluster', 'Orbital Habitat Mega-Ring'] },
      { name: 'atmosphere', label: 'Atmospheric Conditions', type: 'select', options: ['Breathable (Standard)', 'Breathable (Oxygen-Rich)', 'Thin / Requires Filter', 'Toxic / Hazardous Gases', 'Corrosive Acidic Atmosphere', 'Zero Atmosphere / Vacuum'] },
      { name: 'gravity', label: 'Surface Gravity', type: 'select', options: ['Microgravity / Zero-G', 'Low Gravity (0.3 - 0.7 G)', 'Standard (1.0 G)', 'Heavy Gravity (1.3 - 2.0 G)', 'Crushing Gravity (> 2.5 G)'] },
      { name: 'tech_level', label: 'Civilization Tech Level (TL 0-5)', type: 'number', min: 0, max: 5 },
      { name: 'dominant_faction', label: 'Controlling Faction / Authority', type: 'text', placeholder: 'E.g., Sol-Centauri Syndicate' },
      { name: 'settlements', label: 'Major Settlements & Starports', type: 'text', placeholder: 'E.g., Neon Reach Spire, Port Meridian' },
      { name: 'hazards', label: 'Planetary Hazards & Flora/Fauna', type: 'text', placeholder: 'E.g., Bioluminescent predators, tectonic rifts' },
      { name: 'description', label: 'Planetary Panorama & Climate Lore', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Environmental Survival Rules & DC Modifiers', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#a855f7', // Purple-Pink
    theme: 'purple',
    targetCollection: 'species',
    description: 'Engineer alien lifeforms, genetic mutants, synthetic chassis races, uplifted animals, and meta-human bloodlines.',
    category: 'Biological & Synthetic Lineages',
    badge: 'Species Matrix',
    defaultValues: {
      name: '',
      type: ['Humanoid'],
      size: ['Medium'],
      movement: ['Bipedal Ground'],
      bonus_attribute_points: 0,
      bonus_skills: 2,
      cp: 0,
      description: '',
      mechanic: '',
      note: ''
    },
    fields: [
      { name: 'name', label: 'Species / Lineage Name', type: 'text', required: true, placeholder: 'E.g., Vesperian Void-Stalkers' },
      { name: 'size', label: 'Size Category', type: 'select', options: ['Diminutive', 'Small', 'Medium', 'Large', 'Huge'] },
      { name: 'movement', label: 'Primary Locomotion', type: 'select', options: ['Bipedal Ground', 'Quadrupedal Sprint', 'Avian / Gliding Wings', 'Aquatic Propulsion', 'Low-Gravity Levitation', 'Serpentine Slither'] },
      { name: 'bonus_attribute_points', label: 'Bonus Attribute Points', type: 'number' },
      { name: 'bonus_skills', label: 'Bonus Allotted Skill Points', type: 'number' },
      { name: 'cp', label: 'Total CP Cost Modifier', type: 'number' },
      { name: 'description', label: 'Physiology, Culture & Evolutionary Origin', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Inherent Racial Traits, Senses & Weaknesses', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
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
    color: '#f97316', // Orange
    theme: 'orange',
    targetCollection: 'weaponry',
    description: 'Forge kinetic firearms, energy blasters, plasma cutters, monofilament melee blades, and heavy ordnance.',
    category: 'Tactical Armaments',
    badge: 'Armament Matrix',
    defaultValues: {
      name: '',
      skill: 'Small Arms',
      tl: 3,
      ml: 0,
      cost: 1200,
      weight: 3.2,
      accuracy: 0,
      ap: 2,
      modes: ['Semi-Auto', 'Burst'],
      attack_rate: '3 rounds/sec',
      critical_score: '19-20',
      wielding: 'Two-Handed',
      component_slots: 2,
      design_dc: '15',
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
      { name: 'cost', label: 'Credit Cost', type: 'number' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'ap', label: 'Armor Piercing (AP)', type: 'number' },
      { name: 'critical_score', label: 'Critical Threat Range', type: 'text', placeholder: 'E.g., 19-20 (x2)' },
      { name: 'component_slots', label: 'Attachment Slots', type: 'number' },
      { name: 'design_dc', label: 'Manufacturing / Design DC', type: 'text' },
      { name: 'description', label: 'Weapon Aesthetics, Mechanism & Caliber', type: 'textarea', aiEnabled: true },
      { name: 'mechanic', label: 'Damage Dice, Range Bands & Special Effects', type: 'textarea' },
      { name: 'note', label: 'Architect Notes', type: 'textarea' }
    ],
    archetypes: [
      { name: 'Magnetic Rail Pistol', prompt: 'Compact sidearm firing hyper-velocity flechettes capable of punching through reinforced plasteel.' },
      { name: 'Plasma Arc Rifle', prompt: 'Assault energy rifle that fires superheated ionized plasma bolts with lingering thermal burn.' },
      { name: 'High-Frequency Vibro-Katana', prompt: 'Monofilament composite blade oscillating at ultrasonic frequencies to slice through heavy armor.' }
    ]
  }
];

export const getMatrixById = (id) => {
  return CODEX_MATRICES.find(m => m.id === id) || CODEX_MATRICES[0];
};
