/**
 * @file elementPlaybooks.js
 * @description Declarative 5-Family Adaptive Playbooks, Structured Blueprints,
 * Non-Destructive Field Merger, and Readiness / Resonance Evaluators for Element Forge.
 * Covers all 17 canonical ELEMENT_TYPES without orphan states or irrelevant UI clutter.
 */

import {
  ELEMENT_TYPES,
  ELEMENT_SCHEMAS,
  SCENARIO_GUIDE_MODULES,
  normalizeElementType
} from '../elementSchemas.js';
import { AIME_CANONICAL_GEMS, EXTENDED_GEMS } from '../../StoryModule/guidanceGemsConfig.js';

/**
 * Canonical 5-Stage Spine definitions shared across Element Forge.
 * Stage 3 & Stage 4 titles/controls dynamically adapt per ElementPlaybookFamily.
 */
export const GUIDED_ELEMENT_STAGE_IDS = ['spark', 'lens', 'traits', 'tactical', 'web'];

/**
 * Quick 1-Click Stylistic Lens Combos for Stage 2 (Layer 1 Guidance).
 */
export const QUICK_STYLE_COMBOS = [
  {
    id: 'cyber_noir',
    label: 'Cyber-Noir Grit',
    icon: '🌃',
    desc: 'Rain-slicked neon intrigue, cynical tone, sharp sensory focus.',
    guidance: {
      genre: 'Sci-Fi',
      tone: 'Cynical',
      pacing: 'Slow-burn',
      pov: 'Third Person Limited',
      literaryDevices: ['Metaphor', 'Foreshadowing'],
      structure: 'In Medias Res',
      Mood: 'Cyber-Noir'
    },
    keywords: 'neon, cybernetic, rain-slicked, syndicate, shadowy'
  },
  {
    id: 'tactical_mil_sf',
    label: 'Hard Tactical SF',
    icon: '🎯',
    desc: 'Kinetic military precision, urgent pacing, operational clarity.',
    guidance: {
      genre: 'Action',
      tone: 'Serious',
      pacing: 'Urgent',
      pov: 'Third Person Limited',
      literaryDevices: ['Irony'],
      structure: 'Linear',
      Mood: 'High-Octane & Kinetic'
    },
    keywords: 'ballistic, breach, telemetry, zero-g, kinetic, tactical'
  },
  {
    id: 'precursor_mystery',
    label: 'Precursor Enigma',
    icon: '💠',
    desc: 'Uncanny ancient relics, cosmic awe, deliberate atmospheric dread.',
    guidance: {
      genre: 'Mystery',
      tone: 'Formal',
      pacing: 'Meditative',
      pov: 'Third Person Omniscient',
      literaryDevices: ['Symbolism', 'Foreshadowing'],
      structure: 'Non-linear',
      Mood: 'Eerie & Uncanny'
    },
    keywords: 'progenitor, monolith, crystalline, anomaly, ancient'
  },
  {
    id: 'psionic_opera',
    label: 'High Science-Fantasy',
    icon: '✨',
    desc: 'Mythic scale blending interstellar tech with awakened metaphysics.',
    guidance: {
      genre: 'Adventure',
      tone: 'Hopeful',
      pacing: 'Fast-paced',
      pov: 'Third Person Limited',
      literaryDevices: ['Symbolism', 'Metaphor'],
      structure: 'Episodic',
      Mood: 'Epic & Heroic'
    },
    keywords: 'psionic, aether, starship, dynasty, awakened'
  },
  {
    id: 'void_horror',
    label: 'Derelict Survival',
    icon: '💀',
    desc: 'Claustrophobic bulkheads, failing life support, unseen predators.',
    guidance: {
      genre: 'Horror',
      tone: 'Pessimistic',
      pacing: 'Slow-burn',
      pov: 'Second Person',
      literaryDevices: ['Foreshadowing', 'Personification'],
      structure: 'In Medias Res',
      Mood: 'Paranoiac & Claustrophobic'
    },
    keywords: 'vacuum, bio-hazard, flickering, decompression, quarantine'
  }
];

/**
 * Upgraded Archetype Blueprints: preserves all 10 SCENARIO_GUIDE_MODULES (for Quick Markdown Dump)
 * while adding structured seedGuidance + seedFields + additional blueprints so all 5 families are covered.
 */
export const ARCHETYPE_BLUEPRINTS = [
  ...SCENARIO_GUIDE_MODULES.map((mod) => {
    const defaultsByMod = {
      sg_encounter: {
        summary: 'High-stakes tactical combat & environmental hazard encounter.',
        seedGuidance: { genre: 'Action', tone: 'Serious', pacing: 'Urgent', Mood: 'High-Octane & Kinetic' },
        seedFields: {
          moodAtmosphere: 'Strobing emergency bulkheads, crossfire lanes, unstable reactor conduits.',
          sceneBeats: '1. Perimeter Detection & Contact\n2. Hazard Escalation (Round 3)\n3. Objective Breach or Exfil'
        }
      },
      sg_npc: {
        summary: 'Detailed operational contact, rival, or adversary with motives and MCM readiness.',
        seedGuidance: { genre: 'Sci-Fi', tone: 'Cynical', pacing: 'Steady', Mood: 'Cyber-Noir' },
        seedFields: {
          archetype: 'Shadow Broker / Sector Fixer',
          roleInStory: 'Quest Giver / Ambiguous Ally',
          mcmDesignation: 'Neutral',
          mcmChassis: 'Socialite',
          mcmRole: 'Tactical / Commando'
        }
      },
      sg_location: {
        summary: 'Multi-zone location spec with sensory acoustics, security, and read-aloud narration.',
        seedGuidance: { genre: 'Sci-Fi', tone: 'Serious', pacing: 'Slow-burn', Mood: 'Atmospheric & Immersive' },
        seedFields: {
          moodAtmosphere: 'Pressurized industrial hum, ozone tang, shadowed catwalks.',
          sceneBeats: '1. Outer Airlock Approach\n2. Central Atrium Discovery\n3. Vault Security Trigger'
        }
      },
      sg_item: {
        summary: 'Prototype tech device or precursor relic calibrated for the Tangent Economatrix.',
        seedGuidance: { genre: 'Sci-Fi', tone: 'Formal', pacing: 'Steady' },
        seedFields: {
          itemCategory: 'Gear',
          rarity: 'Prototype',
          'tech-level': '4'
        }
      },
      sg_clue: {
        summary: 'Forensic, cybernetic, or physical lead gated by 2d10 analysis checks.',
        seedGuidance: { genre: 'Mystery', tone: 'Serious', pacing: 'Slow-burn' },
        seedFields: {
          locationFound: 'Encrypted datapad / crime scene terminal',
          analysisSkill: 'Slicing / Perception',
          analysisCr: '15'
        }
      },
      sg_storyarc: {
        summary: 'Multi-milestone campaign arc with faction conflict and escalating stakes.',
        seedGuidance: { genre: 'Adventure', tone: 'Serious', pacing: 'Fast-paced', structure: 'Linear' },
        seedFields: {
          tags: 'Campaign Arc, Faction Conflict, Milestones'
        }
      },
      sg_handout: {
        summary: 'In-universe intercepted comms log, corporate dossier, or decrypted cipher.',
        seedGuidance: { genre: 'Thriller', tone: 'Formal', pov: 'First Person' },
        seedFields: {
          tags: 'Handout, Intercepted Comms, Operator Prop'
        }
      },
      sg_faction: {
        summary: 'Syndicate, megacorp, or sovereign order with public vs. hidden agendas.',
        seedGuidance: { genre: 'Sci-Fi', tone: 'Cynical', Mood: 'Tense & Suspenseful' },
        seedFields: {
          motto: 'Order Through Superior Telemetry',
          'tech-level': '3'
        }
      },
      sg_mapspec: {
        summary: 'Tactical sector specification with cover lanes, elevation, and lighting zones.',
        seedGuidance: { genre: 'Action', tone: 'Serious', pacing: 'Urgent' },
        seedFields: {
          tags: 'Grid-Hex, Tactical Sector, Dynamic Lighting'
        }
      },
      sg_custom: {
        summary: 'Flexible worldbuilding codex entry with dynamic lorebook trigger support.',
        seedGuidance: { genre: 'Sci-Fi', tone: 'Formal' },
        seedFields: {
          category: 'Lorebook Dossier',
          customDataType: 'Lore'
        }
      }
    };
    const extra = defaultsByMod[mod.id] || {};
    return {
      ...mod,
      summary: extra.summary || `${mod.category} blueprint for ${mod.elementType}.`,
      seedGuidance: extra.seedGuidance || { genre: 'Sci-Fi', tone: 'Serious' },
      seedFields: extra.seedFields || {},
      seedTags: `Blueprint, ${mod.category}, ${mod.name}`
    };
  }),
  {
    id: 'bp_world_frontier',
    name: 'Frontier Star Sector',
    category: 'World',
    elementType: 'World',
    icon: '🪐',
    summary: 'Contested border system with trade corridors, resource wars, and precursor ruins.',
    promptTemplate: 'Design a Frontier Star Sector world bible titled "{title}". Include orbital geography, major competing factions, unique physics/anomalies, and timeline of colonization.',
    seedGuidance: { genre: 'Sci-Fi', tone: 'Serious', Mood: 'Wonder & Exploration' },
    seedFields: { 'tech-level': '3', 'meta-level': '3' },
    seedTags: 'Frontier, Star Sector, World Anvil'
  },
  {
    id: 'bp_setting_hub',
    name: 'Orbital Trade Station / Hub',
    category: 'World',
    elementType: 'Setting',
    icon: '🛰️',
    summary: 'Bustling multi-species port of call with black markets, docking bays, and faction embassies.',
    promptTemplate: 'Architect a detailed Setting Guide for "{title}". Include districts, architecture, demographics, sensory atmosphere, and hidden smuggler caches.',
    seedGuidance: { genre: 'Sci-Fi', tone: 'Cynical', Mood: 'Cyber-Noir' },
    seedFields: { functionPurpose: 'Freeport Trading Hub & Neutral Diplomatic Anchor' },
    seedTags: 'Station, Hub, Setting Architect'
  },
  {
    id: 'bp_species_xeno',
    name: 'Sentient Xenobiology Lineage',
    category: 'Entities',
    elementType: 'Species',
    icon: '🧬',
    summary: 'Playable or NPC alien/synthetic species with physiology, culture, and innate traits.',
    promptTemplate: 'Create a canonical Species dossier for "{title}". Include evolutionary habitat, anatomy, sensory perception, innate abilities, and role in galactic society.',
    seedGuidance: { genre: 'Sci-Fi', tone: 'Formal', Mood: 'Wonder & Exploration' },
    seedFields: { classification: 'Organic Xenomorph / Sapient Lineage', 'tech-level': '3' },
    seedTags: 'Species, Xenobiology, Lineage'
  },
  {
    id: 'bp_tech_system',
    name: 'Breakthrough Tech Paradigm',
    category: 'Items',
    elementType: 'Technology',
    icon: '⚙️',
    summary: 'Foundational technology defining power sources, societal disruption, and vulnerabilities.',
    promptTemplate: 'Specify a Technology Forge dossier for "{title}". Include Tech Level, power mechanism, battlefield/civilian impact, and engineering failure modes.',
    seedGuidance: { genre: 'Sci-Fi', tone: 'Serious' },
    seedFields: { techLevel: 'TL-4 Hard-Light / Nanotech' },
    seedTags: 'Technology, Engineering, TL-4'
  },
  {
    id: 'bp_philosophy_creed',
    name: 'Metaphysical Order / Creed',
    category: 'Lorebook',
    elementType: 'Philosophy',
    icon: '📜',
    summary: 'Belief system, machine cult, or psionic doctrine with tenets, rituals, and schisms.',
    promptTemplate: 'Write a Philosophy Scribe codex for "{title}". Include core tenet, cosmology, moral code, sacred iconography, and political influence.',
    seedGuidance: { genre: 'Sci-Fi', tone: 'Formal', literaryDevices: ['Symbolism'] },
    seedFields: {},
    seedTags: 'Philosophy, Creed, Doctrine'
  }
];

/**
 * Playbook lookup dictionary across all 17 canonical ELEMENT_TYPES.
 */
const PLAYBOOK_MAP = {
  // Family 1: Entities & Beings
  Persona: {
    family: 'entity',
    familyLabel: 'Entity & Operative',
    pitchKey: 'oneLinePitch',
    pitchLabel: 'One-Line Character Pitch',
    pitchPlaceholder: 'e.g. Disgraced orbital trauma surgeon running black-market cyberware clinics...',
    stage3Title: 'Character Traits & Psychology',
    stage3Subtitle: 'Appearance, motivations, history, flaws, and narrative prose.',
    stage4Title: 'MCM Statblock & Autonomous VTT Routine',
    stage4Subtitle: 'Calibrate Threat Tier, Canonical v6 Vitals (30/30 or 60 SP), Loadout & VTT AI.',
    dbmCategories: ['archetypes', 'species', 'factions', 'occupations'],
    supportsSituationalModifier: true
  },
  Species: {
    family: 'entity',
    familyLabel: 'Xenobiology & Lineage',
    pitchKey: 'roleInWorld',
    pitchLabel: 'Core Evolutionary / Galactic Niche',
    pitchPlaceholder: 'e.g. Silicon-based void navigators attuned to gravitational shear...',
    stage3Title: 'Xenobiology, Habitat & Culture',
    stage3Subtitle: 'Anatomy, innate powers, diet, evolutionary origin, and societal role.',
    stage4Title: 'Physiology & Setting Baseline',
    stage4Subtitle: 'Configure Organic vs. Synthetic structure baseline and default Tech/Meta Levels.',
    dbmCategories: ['species']
  },
  Faction: {
    family: 'entity',
    familyLabel: 'Faction & Syndicate',
    pitchKey: 'coreIdentity',
    pitchLabel: 'Core Identity & Mandate',
    pitchPlaceholder: 'e.g. A clandestine merchant choir monopolizing jump-gate telemetry...',
    stage3Title: 'Ideology, Governance & Resources',
    stage3Subtitle: 'Public vs. hidden agendas, leadership structure, territory, and assets.',
    stage4Title: 'Faction Power, Tiers & Clock Seed',
    stage4Subtitle: 'Set Faction Tech/Meta Levels, default disposition, and campaign clock goal.',
    dbmCategories: ['factions']
  },

  // Family 2: Locations & Stages
  Setting: {
    family: 'location',
    familyLabel: 'Location & Architecture',
    pitchKey: 'functionPurpose',
    pitchLabel: 'Primary Function & High Concept',
    pitchPlaceholder: 'e.g. A subterranean geothermal refinery suspended above an acid sea...',
    stage3Title: 'Geography, Demographics & Sensory Details',
    stage3Subtitle: 'Spatial architecture, inhabitants, acoustics, climate, and hidden landmarks.',
    stage4Title: 'Environmental Hazards & Paired Sector Map',
    stage4Subtitle: 'Bind atmospheric rules, hazard Challenge Ratings, and VTT tactical maps.',
    dbmCategories: [],
    supportsSituationalModifier: true
  },
  Scene: {
    family: 'location',
    familyLabel: 'Narrative & Tactical Scene',
    pitchKey: 'moodAtmosphere',
    pitchLabel: 'Dramatic Tension & Scene Hook',
    pitchPlaceholder: 'e.g. High-tension hostage exchange under failing mag-lev station strobes...',
    stage3Title: 'Stage Details, Props & Sensory Texture',
    stage3Subtitle: 'Location slugline, sights/sounds/smells, interactive props, and prose.',
    stage4Title: 'Sequential Scene Beats & Read-Aloud',
    stage4Subtitle: 'Author VTT stage beats, Architect read-aloud box, weather, and map link.',
    dbmCategories: []
  },
  Encounter: {
    family: 'location',
    familyLabel: 'Tactical Encounter',
    pitchKey: 'setup',
    pitchLabel: 'Encounter Trigger & Setup',
    pitchPlaceholder: 'e.g. Security bulkhead locks down as cloaked stalkers drop from gantry vents...',
    stage3Title: 'Setup, Stakes & Resolution Paths',
    stage3Subtitle: 'Encounter type, opening conditions, tactical terrain, and victory/retreat outcomes.',
    stage4Title: 'Encounter Mechanics, CR & Beats',
    stage4Subtitle: 'Calibrate 2d10 Challenge Ratings, round timers, hazards, and paired map.',
    dbmCategories: []
  },
  Map: {
    family: 'location',
    familyLabel: 'Tactical Sector Spec',
    pitchKey: 'summary',
    pitchLabel: 'Sector Layout Concept',
    pitchPlaceholder: 'e.g. Multi-elevation starship CIC bridge with destructible holo-consoles...',
    stage3Title: 'Terrain, Cover & Lighting Specification',
    stage3Subtitle: 'Biomes, chokepoints, elevation shifts, and architectural notes.',
    stage4Title: 'Grid Calibration & Map Pairing',
    stage4Subtitle: 'Configure grid scale, atmospheric preset, and link to Map Architect.',
    dbmCategories: []
  },

  // Family 3: Relics, Gear & Tech
  Item: {
    family: 'relic',
    familyLabel: 'Equipment, Relic & Ordnance',
    pitchKey: 'properties',
    pitchLabel: 'Signature Property / Concept',
    pitchPlaceholder: 'e.g. Phase-tuned monofilament blade thathum-resonates near psionic rifts...',
    stage3Title: 'Item Lore, Form & Properties',
    stage3Subtitle: 'Category, rarity, passive capabilities, visual craftsmanship, and history.',
    stage4Title: 'BASTION Economatrix & Rules Calibration',
    stage4Subtitle: 'Calibrate Tech/Meta Level, EUFT Cost/Craft CR ↔ Credits, and active 2d10 mechanics.',
    dbmCategories: ['weaponry', 'armoring', 'gear', 'augmentations'],
    supportsSituationalModifier: true
  },
  Technology: {
    family: 'relic',
    familyLabel: 'Technology & Engineering',
    pitchKey: 'functionPurpose',
    pitchLabel: 'Core Technological Function',
    pitchPlaceholder: 'e.g. Zero-point micro-capacitors enabling portable hard-light barriers...',
    stage3Title: 'Mechanism, Impact & Drawbacks',
    stage3Subtitle: 'Power source, societal/economic impact, inventor history, and failure modes.',
    stage4Title: 'Tech Tier & Economatrix Benchmark',
    stage4Subtitle: 'Anchor canonical Tech Level (TL 0–5), Meta Level, and complexity CR.',
    dbmCategories: ['augmentations', 'gear', 'weaponry']
  },

  // Family 4: Macro-Lore & Doctrines
  World: {
    family: 'macro',
    familyLabel: 'World & Planetary Bible',
    pitchKey: 'corePremise',
    pitchLabel: 'Core Premise / High Concept',
    pitchPlaceholder: 'e.g. A tidally locked ocean world where cities ride migratingleviathan shells...',
    stage3Title: 'Cosmology, Factions & History Timeline',
    stage3Subtitle: 'Major powers, historical cataclysms, unique physics, and planetary geography.',
    stage4Title: 'World Tier Constants & Story Flags',
    stage4Subtitle: 'Establish planetary Tech/Meta Level baselines and global story state keys.',
    dbmCategories: ['factions', 'species']
  },
  Universe: {
    family: 'macro',
    familyLabel: 'Universe & Metaphysics',
    pitchKey: 'designation',
    pitchLabel: 'Universe Designation & Pitch',
    pitchPlaceholder: 'e.g. Post-Singularity spiral arm governed by the Threefold Astral Compact...',
    stage3Title: 'Ontological Premise & Universal Laws',
    stage3Subtitle: 'Foundational metaphysics, laws of causality, and cosmic origin.',
    stage4Title: 'Universal Constants & Tier Ceilings',
    stage4Subtitle: 'Define baseline Tech/Meta ceilings across campaigns in this universe.',
    dbmCategories: []
  },
  Philosophy: {
    family: 'macro',
    familyLabel: 'Philosophy, Creed & Order',
    pitchKey: 'coreTenets',
    pitchLabel: 'Central Tenet / Guiding Truth',
    pitchPlaceholder: 'e.g. Consciousness is an electromagnetic debt that must be returned to the Void...',
    stage3Title: 'Tenets, Rituals, Ethics & Iconography',
    stage3Subtitle: 'Doctrines, daily practices, sacred symbols, cosmology, and societal influence.',
    stage4Title: 'Metaphysical Resonance & Doctrinal Scope',
    stage4Subtitle: 'Set associated Meta Level affinity, taboos, and faction alignment hooks.',
    dbmCategories: ['invocations', 'features']
  },
  'Story Arc': {
    family: 'macro',
    familyLabel: 'Campaign Story Arc',
    pitchKey: 'summary',
    pitchLabel: 'Arc Logline & Premise',
    pitchPlaceholder: 'e.g. A three-act race to stop the Syndicate from unsealing Orbital Vault Nine...',
    stage3Title: 'Objective, Antagonist & Resolution',
    stage3Subtitle: 'Driving goal, primary opposing force, linked faction, and climax stakes.',
    stage4Title: 'Arc Milestones & Story Flag Triggers',
    stage4Subtitle: 'Define pivotal milestone beats and global story flags unlocked across play.',
    dbmCategories: ['factions']
  },
  Adventure: {
    family: 'macro',
    familyLabel: 'Adventure Module Brief',
    pitchKey: 'hook',
    pitchLabel: 'Inciting Adventure Hook',
    pitchPlaceholder: 'e.g. An automated distress beacon broadcasts the squad\'s own encrypted voiceprints...',
    stage3Title: 'Hook, Objective, Stakes & Resolution',
    stage3Subtitle: 'How operators are drawn in, core mission goal, failure consequences, and endings.',
    stage4Title: 'Recommended Party Tier & Pacing Beats',
    stage4Subtitle: 'Calibrate Threat Tier range, baseline CR, and act progression.',
    dbmCategories: ['factions']
  },

  // Family 5: Investigative & Epistemic Props
  Clue: {
    family: 'epistemic',
    familyLabel: 'Investigative Clue & Lead',
    pitchKey: 'information',
    pitchLabel: 'Core Secret / Information Revealed',
    pitchPlaceholder: 'e.g. Telemetry logs proving the airlock was cycled from inside the VIP quarters...',
    stage3Title: 'Discovery Context & Operator Deduction',
    stage3Subtitle: 'Where/how discovered, forensic details, and intended player conclusion.',
    stage4Title: '2d10 Analysis Check & Epistemic Gate',
    stage4Subtitle: 'Set Investigation/Slicing Skill, Target CR, and +5 High-Degree bonus intel.',
    dbmCategories: []
  },
  Handout: {
    family: 'epistemic',
    familyLabel: 'In-Universe Operator Handout',
    pitchKey: 'summary',
    pitchLabel: 'Document Format & Summary',
    pitchPlaceholder: 'e.g. Partially redacted Entari Combine quarantine order recovered from Deck 4...',
    stage3Title: 'Document Text & In-Universe Framing',
    stage3Subtitle: 'Compose the transmission transcript, dossier header, and visual wear.',
    stage4Title: 'Decryption CR & Clearance Notes',
    stage4Subtitle: 'Optional cipher/translation CR check and private Architect annotations.',
    dbmCategories: []
  },
  Custom: {
    family: 'epistemic',
    familyLabel: 'Custom Codex & System Entry',
    pitchKey: 'oneLinePitch',
    pitchLabel: 'One-Line Concept / Summary',
    pitchPlaceholder: 'e.g. Sector-wide neural static anomaly triggered during solar flares...',
    stage3Title: 'Custom Classification & Lore Body',
    stage3Subtitle: 'Domain tag, detailed specification, in-universe source, and confidential notes.',
    stage4Title: 'Custom Properties & Mechanical Hooks',
    stage4Subtitle: 'Optional structured JSON properties, CR benchmark, and story flag hooks.',
    dbmCategories: []
  }
};

/**
 * Returns the resolved ElementPlaybookConfig for any element type string.
 */
export function getPlaybookForType(rawType = 'Persona') {
  const canonicalType = normalizeElementType(rawType);
  const found = PLAYBOOK_MAP[canonicalType] || PLAYBOOK_MAP.Custom;
  return {
    ...found,
    elementType: ELEMENT_TYPES.includes(canonicalType) ? canonicalType : 'Custom'
  };
}

/**
 * Returns the canonical field key used for Stage 1's One-Line Pitch input.
 */
export function getPitchFieldKey(rawType = 'Persona') {
  return getPlaybookForType(rawType).pitchKey;
}

/**
 * Tabs excluded from Stage 3 because they belong to Stage 2 (Guidance),
 * Stage 4 (Tactical/VTT Mechanics), or Stage 5 (Lorebook & Triggers).
 */
const NON_STAGE3_TABS = new Set([
  'Modular Assembly (MCM)',
  'Relations & Scripting',
  'Mechanics: Vitals',
  'Mechanics: JSON',
  'Mechanics',
  'Tactical & Beats',
  'Lorebook & Triggers',
  'Dynamic Lorebook',
  'Guidance & Directives'
]);

/**
 * Returns the structured schema fields appropriate for Stage 3 (Objective Reality & Lore).
 */
export function getCoreSchemaFieldsForStage3(rawType = 'Persona') {
  const canonicalType = normalizeElementType(rawType);
  const schema = ELEMENT_SCHEMAS[canonicalType] || ELEMENT_SCHEMAS.Custom || [];
  return schema.filter((f) => !f.tab || !NON_STAGE3_TABS.has(f.tab));
}

/**
 * Splits a comma/semicolon/newline list into clean string chips.
 */
export function parseChipKeywords(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((v) => String(v || '').trim()).filter(Boolean);
  }
  return String(val)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Non-destructive merge helper for AI-proposed traits.
 * Empty fields are populated directly; non-empty fields with different values
 * are preserved untouched and returned as `diffs` so the Architect retains 100% authority.
 */
export function mergeNonDestructiveTraits(currentFields = {}, proposedFields = {}, schemaFields = []) {
  const mergedFields = { ...currentFields };
  const appliedKeys = [];
  const diffs = [];

  const labelMap = new Map(schemaFields.map((f) => [f.key, f.label || f.key]));

  for (const [key, rawProposed] of Object.entries(proposedFields || {})) {
    if (rawProposed === undefined || rawProposed === null) continue;
    const proposedStr = typeof rawProposed === 'object'
      ? JSON.stringify(rawProposed)
      : String(rawProposed).trim();
    if (!proposedStr) continue;

    const existingVal = currentFields[key];
    const existingStr = existingVal !== undefined && existingVal !== null
      ? String(existingVal).trim()
      : '';

    if (!existingStr) {
      mergedFields[key] = proposedStr;
      appliedKeys.push(key);
    } else if (existingStr !== proposedStr) {
      diffs.push({
        key,
        label: labelMap.get(key) || key,
        currentValue: existingStr,
        proposedValue: proposedStr
      });
    }
  }

  return { mergedFields, appliedKeys, diffs };
}

/**
 * Maps an active module's `creativeState.gems` string list (and optional active scenario guidance)
 * into the structured `AimeGuidanceSettings` object consumed by `AimeGuidanceDeck`.
 */
export function inheritGuidanceFromModuleGems(
  moduleGems = [],
  scenarioGuidance = null,
  currentGuidance = {}
) {
  const next = { ...(currentGuidance || {}) };

  if (scenarioGuidance && typeof scenarioGuidance === 'object') {
    for (const [k, v] of Object.entries(scenarioGuidance)) {
      if (v !== undefined && v !== null && v !== '') {
        next[k] = v;
      }
    }
  }

  const devicesSet = new Set(
    Array.isArray(next.literaryDevices) ? next.literaryDevices : []
  );

  for (const rawGem of Array.isArray(moduleGems) ? moduleGems : []) {
    const str = String(rawGem || '').trim();
    if (!str) continue;

    // Support both "Genre: Sci-Fi" and bare "Sci-Fi"
    const colonIdx = str.indexOf(':');
    const cleanVal = colonIdx >= 0 ? str.slice(colonIdx + 1).trim() : str;

    if (AIME_CANONICAL_GEMS.Genre.includes(cleanVal)) next.genre = cleanVal;
    else if (AIME_CANONICAL_GEMS.Tone.includes(cleanVal)) next.tone = cleanVal;
    else if (AIME_CANONICAL_GEMS.Pacing.includes(cleanVal)) next.pacing = cleanVal;
    else if (AIME_CANONICAL_GEMS['Point of View'].includes(cleanVal)) next.pov = cleanVal;
    else if (AIME_CANONICAL_GEMS['Literary Devices'].includes(cleanVal)) devicesSet.add(cleanVal);
    else if (AIME_CANONICAL_GEMS.Structure.includes(cleanVal)) next.structure = cleanVal;
    else {
      for (const [extCategory, options] of Object.entries(EXTENDED_GEMS)) {
        if (Array.isArray(options) && options.includes(cleanVal)) {
          next[extCategory] = cleanVal;
        }
      }
    }
  }

  if (devicesSet.size > 0) {
    next.literaryDevices = Array.from(devicesSet);
  }

  return next;
}

/**
 * Evaluates Stage-by-Stage completion status, 0–100% Readiness Score,
 * Resonant Keywords, and Negative Keyword Railguard Conflicts.
 */
export function computeGuidedElementReadiness(draft = {}) {
  const type = normalizeElementType(draft.type || 'Persona');
  const playbook = getPlaybookForType(type);
  const fields = draft.fields || {};
  const guidance = draft.guidance || {};
  const assetHub = Array.isArray(draft.assetHub) ? draft.assetHub : [];
  const title = String(draft.title || '').trim();
  const pitchVal = String(fields[playbook.pitchKey] || fields.summary || fields.oneLinePitch || '').trim();
  const cleanContent = String(draft.content || '').replace(/<[^>]*>?/gm, ' ').trim();

  // Stage 1: Spark & Canon
  let sparkStatus = 'empty';
  if (title && (pitchVal || fields.dbmRef)) sparkStatus = 'complete';
  else if (title || pitchVal) sparkStatus = 'partial';

  // Stage 2: Directorial Lens
  const activeGemCount = [
    guidance.genre || guidance.Genre,
    guidance.tone || guidance.Tone,
    guidance.pacing || guidance.Pacing,
    guidance.pov || guidance.POV || guidance['Point of View'],
    Array.isArray(guidance.literaryDevices) && guidance.literaryDevices.length > 0 ? 'dev' : '',
    guidance.structure || guidance.Structure,
    guidance.Mood,
    fields.keywords
  ].filter(Boolean).length;
  const lensStatus = activeGemCount >= 2 ? 'complete' : activeGemCount === 1 ? 'partial' : 'optional';

  // Stage 3: Core Traits & Prose
  const stage3Fields = getCoreSchemaFieldsForStage3(type);
  const filledStage3Count = stage3Fields.filter((f) => {
    const v = fields[f.key];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }).length;
  const requiredTraitsTarget = Math.min(3, Math.max(1, stage3Fields.length));
  let traitsStatus = 'empty';
  if (filledStage3Count >= requiredTraitsTarget || (filledStage3Count >= 1 && cleanContent.length >= 80)) {
    traitsStatus = 'complete';
  } else if (filledStage3Count > 0 || cleanContent.length > 0) {
    traitsStatus = 'partial';
  }

  // Stage 4: Tactical / VTT Calibration (Family-specific)
  let tacticalStatus = 'optional';
  if (playbook.family === 'entity' && type === 'Persona') {
    if (fields.mcmTier && (fields.health || fields.defense)) tacticalStatus = 'complete';
    else if (fields.mcmChassis || fields.mcmRole || fields['char-species']) tacticalStatus = 'partial';
  } else if (playbook.family === 'relic') {
    if ((fields.techLevel || fields['tech-level']) && (fields.costCr || fields.mechanic)) tacticalStatus = 'complete';
    else if (fields.techLevel || fields['tech-level'] || fields.rarity) tacticalStatus = 'partial';
  } else if (playbook.family === 'location') {
    if (fields.sceneBeats || fields.readAloud || fields.pairedMapId || fields.weatherPreset) tacticalStatus = 'complete';
  } else if (playbook.family === 'epistemic') {
    if (fields.analysisCr || fields.analysisSkill || fields.gmNotes) tacticalStatus = 'complete';
  } else if (playbook.family === 'macro') {
    if (fields['tech-level'] || fields['meta-level'] || fields.storyFlagKey) tacticalStatus = 'complete';
  }

  // Stage 5: Web, Lorebook & Art
  const hasTriggers = Boolean(String(fields.primaryTriggers || '').trim());
  const hasLinks = assetHub.length > 0;
  const hasArt = Boolean(String(draft.imageUrl || '').trim());
  let webStatus = 'optional';
  if ((hasTriggers && hasLinks) || (hasTriggers && hasArt) || (hasLinks && hasArt)) {
    webStatus = 'complete';
  } else if (hasTriggers || hasLinks || hasArt) {
    webStatus = 'partial';
  }

  // Weighted Readiness Score (0–100)
  let score = 0;
  if (sparkStatus === 'complete') score += 30;
  else if (sparkStatus === 'partial') score += 15;

  if (lensStatus === 'complete') score += 15;
  else if (lensStatus === 'partial') score += 8;

  if (traitsStatus === 'complete') score += 30;
  else if (traitsStatus === 'partial') score += 15;

  if (tacticalStatus === 'complete') score += 15;
  else if (tacticalStatus === 'partial') score += 8;

  if (webStatus === 'complete') score += 10;
  else if (webStatus === 'partial') score += 5;

  // Resonance & Railguard Scanning
  const textCorpus = [
    title,
    cleanContent,
    ...Object.entries(fields)
      .filter(([k]) => k !== 'keywords' && k !== 'negative_keywords')
      .map(([, v]) => (typeof v === 'string' ? v : ''))
  ]
    .join(' ')
    .toLowerCase();

  const positiveKw = parseChipKeywords(fields.keywords);
  const negativeKw = parseChipKeywords(fields.negative_keywords);

  const resonantKeywords = positiveKw.filter(
    (kw) => kw.length > 2 && textCorpus.includes(kw.toLowerCase())
  );
  const railguardConflicts = negativeKw.filter(
    (nk) => nk.length > 2 && textCorpus.includes(nk.toLowerCase())
  );

  const completedPillars = [];
  const suggestions = [];

  if (sparkStatus === 'complete') completedPillars.push('Identity & Pitch');
  else suggestions.push(`Add a title and ${playbook.pitchLabel.toLowerCase()} in Stage 1.`);

  if (lensStatus === 'complete') completedPillars.push('Directorial Lens');
  else suggestions.push('Select Genre & Tone Gems (or inherit Module Gems) in Stage 2.');

  if (traitsStatus === 'complete') completedPillars.push('Core Traits');
  else suggestions.push('Populate at least 3 core reality traits or lore prose in Stage 3.');

  if (tacticalStatus === 'complete') completedPillars.push('BASTION / VTT');
  else suggestions.push(`Calibrate ${playbook.stage4Title} in Stage 4.`);

  if (webStatus === 'complete') completedPillars.push('Lorebook & Web');
  else suggestions.push('Generate Lorebook triggers or link resonant assets in Stage 5.');

  return {
    score: Math.min(100, score),
    stages: {
      spark: sparkStatus,
      lens: lensStatus,
      traits: traitsStatus,
      tactical: tacticalStatus,
      web: webStatus
    },
    completedPillars,
    suggestions,
    resonantKeywords,
    railguardConflicts
  };
}
