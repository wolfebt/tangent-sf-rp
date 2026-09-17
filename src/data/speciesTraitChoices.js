/**
 * Canonical Trait Choice Registry & Resolver for Tangent SF RP
 * 
 * Provides structured choice definitions and Omnicortex-derived options
 * for traits that require player selection (Skills, Features, Energy Types,
 * Environments, Natural Weapons, Sensory Modes, Vocations, etc.).
 */

import { ALL_CANONICAL_SKILLS } from './skillsData';
import { DEFAULT_FEATURES } from './featuresData';

// ── 1. CANONICAL BASTION CHOICE CATALOGS ──

export const ENERGY_DAMAGE_TYPES = [
  { id: 'energy-pyro', name: 'Pyro / Thermal', category: 'Energy', icon: '🔥', desc: 'Fire, intense heat, molten slag, and plasma discharge.' },
  { id: 'energy-cryo', name: 'Cryo / Cold', category: 'Energy', icon: '❄️', desc: 'Sub-zero freezing, liquid nitrogen, and absolute zero entropy.' },
  { id: 'energy-voltic', name: 'Voltic / Electricity', category: 'Energy', icon: '⚡', desc: 'Lightning, high-voltage arc, galvanic charge, and electromagnetic shock.' },
  { id: 'energy-corrosive', name: 'Corrosive / Acid', category: 'Chemical', icon: '🧪', desc: 'Caustic acids, bio-corrosives, enzymatic dissolution, and chemical burn.' },
  { id: 'energy-sonic', name: 'Sonic / Acoustic', category: 'Energy', icon: '🔊', desc: 'Concussive pressure waves, destructive resonant frequencies, and deafening blasts.' },
  { id: 'energy-radiation', name: 'Radiation', category: 'Hazard', icon: '☢️', desc: 'Ionizing gamma particles, fallout radiation, and cosmic stellar exposure.' },
  { id: 'energy-astral', name: 'Astral / Psionic', category: 'Metaphysical', icon: '🔮', desc: 'Mental trauma, psychic mindfire, and ethereal soul disruptors.' },
  { id: 'energy-warp', name: 'Warp / Void', category: 'Metaphysical', icon: '🌌', desc: 'Entropic dimensional decay, void matter, and anomalies.' },
  { id: 'energy-toxic', name: 'Toxic / Bio-Hazard', category: 'Chemical', icon: '☣️', desc: 'Neurotoxins, organic venoms, necrotic spores, and virulent pathogens.' },
  { id: 'energy-kinetic', name: 'Kinetic / Physical', category: 'Physical', icon: '💥', desc: 'Ballistic velocity, hyper-velocity impacts, shrapnel, and concussive force.' }
];

export const ENVIRONMENT_TYPES = [
  { id: 'env-arctic', name: 'Arctic / Glacial', category: 'Cold', icon: '🏔️', desc: 'Permanent permafrost, sub-zero tundra, blizzards, and glacial ice shelves.' },
  { id: 'env-desert', name: 'Desert / Hyper-Arid', category: 'Heat', icon: '🏜️', desc: 'Extreme arid temperatures, sand dunes, solar radiation, and water scarcity.' },
  { id: 'env-aquatic', name: 'Aquatic / Ocean Trench', category: 'Water', icon: '🌊', desc: 'Submerged pelagic waters, oceanic reefs, tidal currents, and deep trench pressure.' },
  { id: 'env-subterranean', name: 'Subterranean / Underdark', category: 'Earth', icon: '🕳️', desc: 'Pitch-black caverns, tight tunnels, seismic tremors, and toxic cavern gas.' },
  { id: 'env-forest', name: 'Forest / Dense Jungle', category: 'Verdant', icon: '🌲', desc: 'Canopy biomes, tangled undergrowth, high humidity, and predatory biodiversity.' },
  { id: 'env-mountain', name: 'Mountain / Alpine Crag', category: 'Altitude', icon: '⛰️', desc: 'High altitude, sheer cliffs, scree slopes, thin atmosphere, and low oxygen.' },
  { id: 'env-volcanic', name: 'Volcanic / Pyroclastic', category: 'Extreme', icon: '🌋', desc: 'Active magma flows, searing volcanic ash, sulfur vents, and toxic fallout.' },
  { id: 'env-vacuum', name: 'Zero-G / Orbital Vacuum', category: 'Exotic', icon: '🛰️', desc: 'Microgravity, hard vacuum exposure, orbital decompression, and cosmic rays.' },
  { id: 'env-toxic-swamp', name: 'Toxic Mire / Acid Bog', category: 'Hazard', icon: '☣️', desc: 'Corrosive peat bogs, acidic miasma, swamp gases, and biological rot.' },
  { id: 'env-radiation', name: 'Radiation Wasteland', category: 'Hazard', icon: '☢️', desc: 'Scorched nuclear ruins, irradiated dust storms, and ionizing hot zones.' },
  { id: 'env-urban', name: 'Urban / Sprawl Arcology', category: 'Civilized', icon: '🏙️', desc: 'Dense megacity ruins, industrial smog, tight alleys, and electrified conduits.' }
];

export const TERRAIN_TYPES = [
  { id: 'terr-arctic', name: 'Tundra & Ice Sheets', category: 'Cold', icon: '❄️', desc: 'Slick ice fields, permafrost, and snow drifts.' },
  { id: 'terr-desert', name: 'Dunes & Salt Flats', category: 'Arid', icon: '☀️', desc: 'Shifting sands, rocky badlands, and scorched flats.' },
  { id: 'terr-aquatic', name: 'Marine & Freshwater', category: 'Aquatic', icon: '💧', desc: 'Reefs, deep water, rivers, and coastal shallows.' },
  { id: 'terr-forest', name: 'Woodlands & Rainforest', category: 'Verdant', icon: '🌳', desc: 'Thickets, ancient forest floors, and roots.' },
  { id: 'terr-mountain', name: 'Crags & Scree Slopes', category: 'Highland', icon: '🧗', desc: 'Steep inclines, loose talus, and rocky ledges.' },
  { id: 'terr-plains', name: 'Grassland & Savanna', category: 'Open', icon: '🌾', desc: 'Open steppes, prairie, and long visibility.' },
  { id: 'terr-subterranean', name: 'Caves & Catacombs', category: 'Enclosed', icon: '🦇', desc: 'Stalactite chambers, fissures, and underground ruins.' },
  { id: 'terr-urban', name: 'Metropolis & Industrial Ruins', category: 'Constructed', icon: '🏢', desc: 'Rooftops, crumbling corridors, and factory floors.' },
  { id: 'terr-zero-g', name: 'Derelict Vessels & Asteroid Belts', category: 'Orbital', icon: '🚀', desc: 'Zero-G bulkheads, debris fields, and docking clamps.' }
];

export const NATURAL_WEAPON_FORMS = [
  { id: 'nat-claws', name: 'Retractable Claws', damageType: 'Slashing', damageDice: '1d6', property: 'Finesse, Light', icon: '🐾', desc: 'Razor-sharp keratin or chitin talons capable of tearing flesh and armor seams.' },
  { id: 'nat-fangs', name: 'Predatory Fangs / Bite', damageType: 'Piercing', damageDice: '1d6', property: 'Grab, Close-Quarters', icon: '🦷', desc: 'Elongated canines or serrated mandibles designed for latching and crushing.' },
  { id: 'nat-horns', name: 'Gore Horns / Crest', damageType: 'Piercing', damageDice: '1d6', property: 'Charge (+2 Dmg on sprint)', icon: '🦏', desc: 'Dense cranial horns or osseous battering rams used on tactical charges.' },
  { id: 'nat-tail', name: 'Prehensile Tail Lash', damageType: 'Bludgeoning', damageDice: '1d6', property: 'Reach, Trip Advantage', icon: '🦎', desc: 'Muscular, whip-like tail capable of tripping opponents or bludgeoning.' },
  { id: 'nat-spikes', name: 'Defensive Quills / Spines', damageType: 'Piercing', damageDice: '1d6', property: 'Reflect 2 Piercing on melee contact', icon: '🦔', desc: 'Barbed spines lining shoulders, back, or forearms that punish melee attackers.' },
  { id: 'nat-tentacles', name: 'Constricting Tentacles', damageType: 'Bludgeoning', damageDice: '1d6', property: 'Grapple Advantage, Reach', icon: '🐙', desc: 'Flexible muscular tendrils that snare, pull, and constrict hostile targets.' },
  { id: 'nat-talons', name: 'Raptor Foot Talons', damageType: 'Slashing', damageDice: '1d6', property: 'Aerial Dive Advantage', icon: '🦅', desc: 'Powerful raptorial foot talons optimized for snatching during flight or leaper leaps.' }
];

export const SENSORY_VISION_MODES = [
  { id: 'sense-darkvision', name: 'Darkvision (60 ft)', category: 'Vision', icon: '👁️', desc: 'See in absolute darkness in monochrome greyscale up to 60 feet without light.' },
  { id: 'sense-thermal', name: 'Thermal Vision (Infrared)', category: 'Vision', icon: '🌡️', desc: 'Perceive infrared heat radiation, detecting living beings, running engines, and cloaked units.' },
  { id: 'sense-etheric', name: 'Etheric / Astral Sight', category: 'Psionic', icon: '✨', desc: 'Perceive spiritual auras, psionic energy trails, and incorporeal anomalies.' },
  { id: 'sense-electro', name: 'Electromagnetic Reception', category: 'Sensor', icon: '⚡', desc: 'Detect active circuits, data cables, powered power armor, and artificial cybernetics.' },
  { id: 'sense-sonar', name: 'Sonar / Echolocation (60 ft)', category: 'Acoustic', icon: '🦇', desc: 'Emit micro-clicks to map three-dimensional geometry, functioning normally while completely blinded.' },
  { id: 'sense-tremor', name: 'Tremorsense (30 ft)', category: 'Kinetic', icon: '👣', desc: 'Detect minute seismic vibrations traveling through solids, rock, or structural flooring.' },
  { id: 'sense-scent', name: 'Analytical Olfactory Scent', category: 'Chemical', icon: '👃', desc: 'Differentiate individual chemical signatures, trace pheromones, and track quarries by scent.' },
  { id: 'sense-lowlight', name: 'Superior Low-Light Vision', category: 'Vision', icon: '🌙', desc: 'See twice as far as baseline humans in starlight, moonlight, and dim shadows.' }
];

export const VOCATION_TYPES = [
  { id: 'voc-armorer', name: 'Armorer & Metallurgy', icon: '🛡️', desc: 'Forging ballistic plate, shield generator calibration, and hardening alloys.' },
  { id: 'voc-weaponsmith', name: 'Weaponsmithing & Gunsmithing', icon: '⚔️', desc: 'Barrel rifling, energy capacitor tuning, blade honing, and firearm fabrication.' },
  { id: 'voc-cybernetics', name: 'Cybernetics & Bionics', icon: '🦾', desc: 'Neural interface alignment, limb installation, socket repair, and dermal plating.' },
  { id: 'voc-robotics', name: 'Robotics & Dronecraft', icon: '🤖', desc: 'Automated logic programming, drone chassis welding, and actuator calibration.' },
  { id: 'voc-starship', name: 'Starship Engineering', icon: '🚀', desc: 'Warp drive tuning, reactor coolant balancing, hull welding, and thruster diagnostics.' },
  { id: 'voc-genetics', name: 'Bio-Engineering & Genetics', icon: '🧬', desc: 'Gene sequencing, clone vat monitoring, organic tissue grafting, and bioreactor culture.' },
  { id: 'voc-chemistry', name: 'Chemical Synthesis & Pharma', icon: '🧪', desc: 'Stim crafting, antitoxin formulation, explosive compounding, and medical serums.' },
  { id: 'voc-architecture', name: 'Architecture & Fortifications', icon: '🏛️', desc: 'Structural stress analysis, blast door design, trenching, and bunker construction.' },
  { id: 'voc-crypto', name: 'Cryptography & Infiltration Tools', icon: '🔐', desc: 'Cipher matrix cracking, bypass hardware creation, and digital counter-measures.' }
];

export const DRAGON_BREATH_SHAPES = [
  { id: 'shape-cone-30', name: '30-foot Cone', icon: '📐', desc: 'Spreads out in a wide 30 ft cone hitting multiple clustered adversaries.' },
  { id: 'shape-line-60', name: '60-foot Line', icon: '📏', desc: 'Fires in a focused 5 ft wide, 60 ft long piercing line of devastating energy.' }
];

// ── 2. EXPLICIT TRAIT CHOICE CONFIGURATION REGISTRY ──

export const TRAIT_CHOICE_DEFINITIONS = {
  // Energy Resistances & Immunities
  'trait-energy-resist': {
    choiceType: 'energy_type',
    title: 'Select Energy Resistance Type',
    prompt: 'Choose one damage type to gain DR 10 against (per BASTION rules):',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#f59e0b'
  },
  'trait-energy-immunity': {
    choiceType: 'energy_type',
    title: 'Select Energy Immunity Type',
    prompt: 'Choose one damage type to gain complete immunity against (Req: Sta 2, DR 20):',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#eab308'
  },
  'trait-energy-absorption': {
    choiceType: 'energy_type',
    title: 'Select Energy Absorption Type',
    prompt: 'Choose one damage type to heal 20% of ignored damage from (Req: Energy Immunity):',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#10b981'
  },

  // Environmental & Terrains
  'trait-adapted': {
    choiceType: 'environment',
    title: 'Select Environmental Adaptation',
    prompt: 'Choose one planetary environment regime to suffer zero penalties or environmental damage from:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#38bdf8'
  },
  'trait-bonded-terrain': {
    choiceType: 'terrain',
    title: 'Select Bonded Terrain',
    prompt: 'Choose one terrain type to gain +2 dodge bonus to Armor Class within:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#34d399'
  },
  'trait-camouflage': {
    choiceType: 'terrain',
    title: 'Select Camouflage Favored Terrain',
    prompt: 'Choose one terrain type to gain +4 racial bonus on Stealth checks within:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#a3e635'
  },
  'trait-terrain-expert': {
    choiceType: 'terrain',
    title: 'Select Terrain Expertise',
    prompt: 'Choose one terrain type for tactical survival efficiency:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#38bdf8'
  },

  // Skills
  'trait-focused-study': {
    choiceType: 'skill',
    title: 'Select Focused Study Skill',
    prompt: 'Gain Skill Focus in a skill of your choice (select 1 skill from Omnicortex):',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#a855f7'
  },
  'trait-shards-of-the-past': {
    choiceType: 'skills_two',
    title: 'Select Shards of the Past Skills',
    prompt: 'Pick two skills representing memories of past lives to gain a +2 racial bonus on both:',
    maxSelections: 2,
    allowMultiple: false,
    badgeColor: '#c084fc'
  },
  'trait-skill-bonus': {
    choiceType: 'skill',
    title: 'Select Racial Skill Bonus',
    prompt: 'Select a primary skill to grant a +2 racial bonus:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#818cf8'
  },
  'trait-adaptive-skill-set': {
    choiceType: 'skill',
    title: 'Select Adaptive Skill Focus',
    prompt: 'Select a skill to allocate your 4-point adaptive training pool towards:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#c084fc'
  },

  // Features / Bonus Feats
  'trait-bonus-feature': {
    choiceType: 'feature',
    title: 'Select Bonus Species Feature',
    prompt: 'Select one extra feature from the Omnicortex features database:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#a855f7'
  },
  'trait-static-bonus-feat': {
    choiceType: 'feature',
    title: 'Select Bonus Feat',
    prompt: 'Choose one feat with no prerequisites to grant to all members of this species:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#ec4899'
  },
  'trait-adaptive-features': {
    choiceType: 'feature',
    title: 'Select Adaptive Feature Slot',
    prompt: 'Select a feature configured for your adaptive morphology:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#d946ef'
  },
  'trait-synthetic-exotic-opt': {
    choiceType: 'feature',
    title: 'Select Synthetic Exotic Option',
    prompt: 'Select a racial trait or special feature integrated into your synthetic chassis:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#06b6d4'
  },

  // Natural Weapons & Combat
  'trait-natural-weapons': {
    choiceType: 'natural_weapon',
    title: 'Select Natural Weapon Form',
    prompt: 'Choose a primary natural weapon attack form (Claw, Fang, Horn, Tail Lash, or Spines):',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#f43f5e'
  },
  'trait-bodyform-weapons': {
    choiceType: 'natural_weapon',
    title: 'Select Bodyform Weapon Attack',
    prompt: 'Shapechange to gain a primary natural weapon attack form:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#fb7185'
  },

  // Sensory & Vision
  'trait-dragon-eyes': {
    choiceType: 'vision_sense',
    title: 'Select Dragon Eyes Sensory Discipline',
    prompt: 'Choose one vision enhancement from the Low-Light & Thermal vision line:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#fbbf24'
  },
  'trait-blind-sense': {
    choiceType: 'vision_sense',
    title: 'Select Blind Sense Discipline',
    prompt: 'Sense unseen objects in a 30 ft Radius or Cone of 60 ft (select acoustic, tremor, or thermal sense):',
    maxSelections: 1,
    allowMultiple: false,
    badgeColor: '#38bdf8'
  },

  // Vocations & Crafts
  'trait-craftsman': {
    choiceType: 'vocation',
    title: 'Select Craftsman Vocation',
    prompt: 'Gain +2 bonus to fabrication and design in a specific vocation:',
    maxSelections: 1,
    allowMultiple: true,
    badgeColor: '#f97316'
  },

  // Dragon Breath
  'trait-dragon-breath': {
    choiceType: 'dragon_breath',
    title: 'Configure Dragon Breath Weapon',
    prompt: 'Select energy delivery type and area of effect for your breath weapon:',
    maxSelections: 1,
    allowMultiple: false,
    badgeColor: '#ef4444'
  }
};

// ── 3. CHOICE CONFIGURATION RESOLVER & DETECTOR ──

/**
 * Checks whether a given trait requires an interactive choice upon selection.
 * Inspects explicit mappings first, then falls back to heuristics on description text.
 * 
 * @param {string|object} traitOrId - Trait object or ID string
 * @returns {object|null} Choice configuration object, or null if no choice needed
 */
export function getTraitChoiceConfig(traitOrId) {
  if (!traitOrId) return null;
  const id = typeof traitOrId === 'object' ? (traitOrId.id || traitOrId.name) : String(traitOrId);
  const cleanId = String(id).toLowerCase().trim();

  // 1. Direct match in definitions
  if (TRAIT_CHOICE_DEFINITIONS[cleanId]) {
    return { ...TRAIT_CHOICE_DEFINITIONS[cleanId], traitId: cleanId };
  }

  // 2. Trait object with explicit metadata
  if (typeof traitOrId === 'object') {
    if (traitOrId.choice_type || traitOrId.choiceType) {
      return {
        choiceType: traitOrId.choice_type || traitOrId.choiceType,
        title: traitOrId.choice_title || `Configure ${traitOrId.name || 'Trait'}`,
        prompt: traitOrId.choice_prompt || 'Make a selection for this trait:',
        maxSelections: traitOrId.max_selections || 1,
        allowMultiple: Boolean(traitOrId.is_multiple || traitOrId.allowMultiple),
        traitId: cleanId
      };
    }

    // 3. Keyword heuristic on description & mechanics
    const text = `${traitOrId.name || ''} ${traitOrId.desc || ''} ${traitOrId.description || ''} ${traitOrId.mechanics || ''}`.toLowerCase();

    if (/chosen type|energy damage|energy resist/i.test(text) && (text.includes('pyro') || text.includes('dr ') || text.includes('resist'))) {
      return {
        choiceType: 'energy_type',
        title: `Select Energy Type for ${traitOrId.name}`,
        prompt: 'Choose one damage type to apply this trait towards:',
        maxSelections: 1,
        allowMultiple: text.includes('multiple'),
        traitId: cleanId
      };
    }

    if (/set environment|environment type|favored terrain/i.test(text)) {
      return {
        choiceType: text.includes('terrain') ? 'terrain' : 'environment',
        title: `Select Environment for ${traitOrId.name}`,
        prompt: 'Choose an environment or terrain type to apply this trait towards:',
        maxSelections: 1,
        allowMultiple: text.includes('multiple'),
        traitId: cleanId
      };
    }

    if (/specific vocation|chosen vocation/i.test(text)) {
      return {
        choiceType: 'vocation',
        title: `Select Vocation for ${traitOrId.name}`,
        prompt: 'Select the specific vocation trade for this bonus:',
        maxSelections: 1,
        allowMultiple: text.includes('multiple'),
        traitId: cleanId
      };
    }

    if (/skill of their choice|skill of choice|choose a skill/i.test(text)) {
      return {
        choiceType: 'skill',
        title: `Select Skill for ${traitOrId.name}`,
        prompt: 'Select a skill from the Omnicortex to apply this trait towards:',
        maxSelections: 1,
        allowMultiple: text.includes('multiple'),
        traitId: cleanId
      };
    }

    if (/pick two skills|choose two skills/i.test(text)) {
      return {
        choiceType: 'skills_two',
        title: `Select 2 Skills for ${traitOrId.name}`,
        prompt: 'Select two skills from the Omnicortex to gain this bonus:',
        maxSelections: 2,
        allowMultiple: false,
        traitId: cleanId
      };
    }
  }

  return null;
}

// ── 4. DYNAMIC OMNICORTEX OPTIONS RESOLVER ──

/**
 * Resolves the array of selectable options for a given choiceType,
 * drawing dynamically from Omnicortex datasets (skills, features, damage types, etc.).
 * 
 * @param {string} choiceType - The category of choice
 * @param {object} [context] - Context containing skills, features, or DBM databases
 * @returns {Array<object>} Formatted option items
 */
export function getOptionsForChoiceType(choiceType, context = {}) {
  const { dbData = null } = context;

  switch (choiceType) {
    case 'energy_type':
      return ENERGY_DAMAGE_TYPES;

    case 'environment':
      return ENVIRONMENT_TYPES;

    case 'terrain':
      return TERRAIN_TYPES;

    case 'natural_weapon':
      return NATURAL_WEAPON_FORMS;

    case 'vision_sense':
      return SENSORY_VISION_MODES;

    case 'vocation':
      return VOCATION_TYPES;

    case 'dragon_breath':
      return ENERGY_DAMAGE_TYPES.filter(e => ['energy-pyro', 'energy-cryo', 'energy-voltic', 'energy-corrosive', 'energy-sonic', 'energy-astral'].includes(e.id));

    case 'skill':
    case 'skills_two': {
      // 1. Gather all canonical skills
      const skillMap = new Map();
      ALL_CANONICAL_SKILLS.forEach(s => {
        const id = s.id || `skill-${s.name.toLowerCase().replace(/\s+/g, '-')}`;
        skillMap.set(id, {
          id,
          name: s.name,
          category: s.group ? (s.group.charAt(0).toUpperCase() + s.group.slice(1)) : 'General',
          icon: s.group === 'physical' ? '🏃' : (s.group === 'mental' ? '🧠' : (s.group === 'combat' ? '⚔️' : '✨')),
          desc: s.description || `Base attribute: ${s.baseAttr || 'None'}`
        });
      });

      // 2. Merge any DBM custom skills
      const customSkills = dbData?.skill || dbData?.skills || [];
      customSkills.forEach(s => {
        const id = s.id || `skill-${s.name.toLowerCase().replace(/\s+/g, '-')}`;
        if (!skillMap.has(id)) {
          skillMap.set(id, {
            id,
            name: s.name,
            category: s.category || 'Custom',
            icon: '⚡',
            desc: s.description || 'Omnicortex skill proficiency.'
          });
        }
      });

      return Array.from(skillMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    case 'feature': {
      // Gather canonical features
      const featMap = new Map();
      DEFAULT_FEATURES.forEach(f => {
        const id = f.id || `feat-${f.name.toLowerCase().replace(/\s+/g, '-')}`;
        featMap.set(id, {
          id,
          name: f.name,
          category: f.category || 'Feature',
          icon: '⭐',
          desc: f.description || f.desc || f.mechanics || `${f.cp || 1} CP Feature`
        });
      });

      // Merge DBM features
      const customFeats = dbData?.feature || dbData?.features || [];
      customFeats.forEach(f => {
        const id = f.id || `feat-${f.name.toLowerCase().replace(/\s+/g, '-')}`;
        if (!featMap.has(id)) {
          featMap.set(id, {
            id,
            name: f.name,
            category: f.category || 'Custom',
            icon: '✨',
            desc: f.description || 'Custom Omnicortex feature.'
          });
        }
      });

      return Array.from(featMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    default:
      return [];
  }
}
