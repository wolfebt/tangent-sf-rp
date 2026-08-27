/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CODEX PROMPT & SCHEMA REGISTRY — TANGENT SF RP / OMNICORTEX
 * Authoritative system prompts, JSON schemas, heuristics, and validation rules
 * for the 14 canonical Omnicortex database ingestion datasets.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { 
  Users, 
  Sparkles, 
  BookOpen, 
  AlertOctagon, 
  Building, 
  Briefcase, 
  Zap, 
  Cpu, 
  Package, 
  Crosshair, 
  Shield, 
  Bot, 
  Building2, 
  HelpCircle 
} from 'lucide-react';

/**
 * Strips LaTeX math notation ($...$ or $$...$$) and replaces with plain text.
 */
export function sanitizeMathAndMarkdown(text) {
  if (typeof text !== 'string') return text;
  return text
    // Replace display math $$...$$
    .replace(/\$\$(.*?)\$\$/g, '$1')
    // Replace inline math $...$
    .replace(/\$(.*?)\$/g, '$1')
    // Strip bold/italic markdown markers inside text values
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Clean trailing/leading spaces
    .trim();
}

/**
 * Recursively sanitizes strings in an object or array to ensure no LaTeX math or markdown formatting leaks in.
 */
export function sanitizePayloadStrings(data) {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string') {
    return sanitizeMathAndMarkdown(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayloadStrings(item));
  }
  if (typeof data === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = sanitizePayloadStrings(value);
    }
    return cleaned;
  }
  return data;
}

export const OMNICORTEX_DATASETS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT A: SPECIES PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'species',
    code: 'PROMPT A',
    label: 'Species & Sub-Species',
    matrixId: 'species',
    targetCollection: 'species',
    icon: Users,
    color: '#10b981',
    description: 'Parse raw species and sub-species text into self-contained, structured Firestore JSON documents with embedded parent taxon lore.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX SPECIES PARSER

**ROLE:** You are an expert data engineer, systems architect, and RPG archivist for the Tangent Science Fantasy Roleplaying Game (SFF RPG). Your task is to parse raw species and sub-species documentation into self-contained, canonical JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text and output ONLY a valid JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Common name of the specific sub-species, e.g., 'Dar' or 'Celestine')",
    "title": "String (Formal cultural or caste title, e.g., 'Dar (Auluran Hunter Caste)')",
    "parent_species": "String (Exact canonical lineage: 'Aeld', 'Asi (Fey Lineages)', 'Aulurans', 'Humans (Core & Variants)', 'Engineered Humans (Gen-E)', 'Kitin', 'Synthetics', 'Sha\\'nor & Void Lineages', 'Progenitors', 'Independent Xenotypes')",
    "description": "String (1-2 sentence elevator pitch of the species)",
    "stigma": "String (Reaction penalty, e.g., 'Xeno (-2)' or 'None')",
    "homeworld": "String (Origin planet or habitat, e.g., 'Aulura Prime')",
    "tech_level": 3,
    "meta_level": 1,
    "prerequisite": ["String (Any prerequisite or racial requirements)"],
    "type": ["species_type-humanoid"],
    "size": ["species_size-medium"],
    "movement": ["species_movement-bipedal"],
    "trait": ["String (Array of unique physiological trait names or IDs)"],
    "costs": {
      "bp": 25,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [
      { "target": "Agility", "type": "attribute", "value": 1, "mode": "inherent" },
      { "target": "Any Attribute", "type": "attribute", "value": 1, "mode": "bonus_pool" },
      { "target": "Martial Arts", "type": "skill", "value": 1, "mode": "inherent" },
      { "target": "General Skill Pool", "type": "skill", "value": 5, "mode": "bonus_pool" },
      { "target": "Climber", "type": "feature", "value": 1, "mode": "inherent" },
      { "target": "Apex Predator", "type": "feature", "value": 1, "mode": "choice_pool" }
    ],
    "body": "Markdown String (Comprehensive history, biology, culture, visual semiotics, and caste role. Self-contained; must embed parent taxon context)",
    "note": "String (Architect / GM rules notes or null)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Self-Contained Records:** Embed the parent species' foundational history and biology directly into the body field so the sub-species requires zero database joins.
2. **Numeric Types:** tech_level, meta_level, and costs.bp MUST be numbers, never strings.
3. **Structured Modifiers:** Dissect '+1 Agility, +1 Int, +5 Skills' into structured objects in modifiers. Valid types: attribute, skill, feature, discipline, combat. Valid modes: inherent, bonus_pool, choice_pool, recommended.
4. **No LaTeX:** Do not use $ or $$. Write standard text formulas.
5. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW SPECIES TEXT HERE]`,
    expectedKeys: [
      'name', 'title', 'parent_species', 'description', 'stigma', 'homeworld',
      'tech_level', 'meta_level', 'prerequisite', 'type', 'size', 'movement',
      'trait', 'costs', 'modifiers', 'body', 'note'
    ],
    sampleItem: {
      name: "Dar",
      title: "Dar (Auluran Hunter Caste)",
      parent_species: "Aulurans",
      description: "Feline, arboreal, and biologically sophisticated hunters and scouts wielding living symbiote weapons and prehensile limbs with lethal grace.",
      stigma: "Xeno (-2)",
      homeworld: "Aulura Prime",
      tech_level: 3,
      meta_level: 1,
      prerequisite: [],
      type: ["species_type-humanoid"],
      size: ["species_size-medium"],
      movement: ["species_movement-bipedal"],
      trait: ["Low Light Vision", "Prehensile Tail", "Natural Weapons"],
      costs: {
        bp: 25,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: [
        { target: "Agility", type: "attribute", value: 1, mode: "inherent" },
        { target: "Any Attribute", type: "attribute", value: 1, mode: "bonus_pool" },
        { target: "Martial Arts", type: "skill", value: 1, mode: "inherent" },
        { target: "General Skill Pool", type: "skill", value: 5, mode: "bonus_pool" },
        { target: "Climber", type: "feature", value: 1, mode: "inherent" },
        { target: "Apex Predator", type: "feature", value: 1, mode: "choice_pool" }
      ],
      body: "### Biology & Heritage\nThe Dar are an agile hunter sub-species of the Auluran taxon. Covered in fine short fur with elongated ears and reflective tapetum lucidum eyes, they excel in three-dimensional environments...",
      note: "Auluran base traits are natively embedded into the chassis."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT B: FEATURE PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'features',
    code: 'PROMPT B',
    label: 'Features & Feats',
    matrixId: 'features',
    targetCollection: 'features',
    icon: Sparkles,
    color: '#8b5cf6',
    description: 'Parse raw rulebook features, feats, perks, and mechanical traits into structured JSON documents with costs and mechanics.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX FEATURE PARSER

**ROLE:** You are an expert data engineer and RPG rules architect for Tangent SFF RPG. Your task is to parse raw rulebook features (feats/perks) into strict, canonical JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided feature text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the feature)",
    "type": "String (Exact enum: 'ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic', 'Special Ability')",
    "description": "String (Flavorful description and thematic narrative)",
    "tech_level": 0,
    "meta_level": 0,
    "prerequisite": ["String (Required attributes, skills, features, or level)"],
    "costs": {
      "bp": 5,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [
      { "target": "Target Name", "type": "feature", "value": 1, "mode": "inherent" }
    ],
    "mechanic": "String (Precise mechanical game rules, roll triggers, DCs, and dice formulas)",
    "note": "String or null (Architect notes, edge cases, stacking rules)",
    "multi": false,
    "staged": false
  }
]

**PARSING HEURISTICS & RULES:**
1. **Boolean Flags:**
   - If marked "[Multiple]", set "multi": true. Otherwise false.
   - If marked "[Ranked]" or "[Staged]", set "staged": true. Otherwise false.
2. **Data Separation:** Flavor belongs in description. Exact tabletop mechanics belong in mechanic.
3. **BP Cost:** Map point costs into costs.bp.
4. **No LaTeX:** Dice expressions must be plain text (e.g. 2d10+4).
5. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW FEATURE TEXT HERE]`,
    expectedKeys: [
      'name', 'type', 'description', 'tech_level', 'meta_level', 'prerequisite',
      'costs', 'modifiers', 'mechanic', 'note', 'multi', 'staged'
    ],
    sampleItem: {
      name: "Deadeye Focus",
      type: "combat",
      description: "Through rigorous breathing and target synchronization, you steady your aim even amid chaotic crossfire.",
      tech_level: 1,
      meta_level: 0,
      prerequisite: ["Firearms 3+", "Reflex 3+"],
      costs: {
        bp: 5,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 1,
        ap: 0
      },
      modifiers: [
        { target: "Accuracy", type: "combat", value: 2, mode: "inherent" }
      ],
      mechanic: "When you take the Aim action before firing a ranged weapon, you ignore partial cover penalties and add +2 to the attack roll.",
      note: "Does not stack with Smartlink targeting bonuses.",
      multi: false,
      staged: false
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT C: SKILL PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'skills',
    code: 'PROMPT C',
    label: 'Skills & Proficiencies',
    matrixId: 'skills',
    targetCollection: 'skills',
    icon: BookOpen,
    color: '#3b82f6',
    description: 'Parse raw skill documentation into strict JSON documents with classification, specializations, and mechanics.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX SKILL PARSER

**ROLE:** You are an expert data engineer and RPG system archivist for Tangent SFF RPG. Your task is to parse raw skill documentation into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the skill, e.g., 'Acrobatics', 'Astrogation')",
    "type": "String (Exact enum: 'mental', 'physical', 'social', 'combat', 'meta')",
    "subtype": "String or null (Exact enum: 'knowledge', 'vocation', 'manipulation', 'expression', 'archaic', 'modern', 'advanced' or null)",
    "is_specialization": false,
    "base_skill": "String or null (If specialization, name of parent skill, otherwise null)",
    "description": "String (Narrative summary and domain of competence)",
    "tech_level": 0,
    "meta_level": 0,
    "mechanic": "String (DCs, opposed check procedures, governing attributes, situational mods)",
    "note": "String or null (Common specialties, synergy riders, tool requirements)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Lowercase Enums:** type and subtype MUST be lowercase strings matching the allowed enums.
2. **Specializations:** Set is_specialization: true only if the entry is an explicit sub-branch of an existing parent skill.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW SKILL TEXT HERE]`,
    expectedKeys: [
      'name', 'type', 'subtype', 'is_specialization', 'base_skill',
      'description', 'tech_level', 'meta_level', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Astrogation",
      type: "mental",
      subtype: "vocation",
      is_specialization: false,
      base_skill: null,
      description: "Calculation of hyperspace trajectories, gravity well avoidance, and orbital mechanics.",
      tech_level: 3,
      meta_level: 0,
      mechanic: "Governing Attribute: Intellect (Logic). Standard DC 15 to compute safe jump coordinates through chartered corridors.",
      note: "Requires navigational computer or star charts."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT D: DISADVANTAGE PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'disadvantages',
    code: 'PROMPT D',
    label: 'Disadvantages & Hindrances',
    matrixId: 'disadvantages',
    targetCollection: 'disadvantages',
    icon: AlertOctagon,
    color: '#ef4444',
    description: 'Parse raw character disadvantages, handicaps, and hindrances into strict JSON documents with CP refunds and negative modifiers.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX DISADVANTAGE PARSER

**ROLE:** You are an expert data engineer and RPG system archivist for Tangent SFF RPG. Your task is to parse raw character disadvantages and hindrances into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the disadvantage)",
    "description": "String (Flavorful description and psychological/physical nature)",
    "tech_level": 0,
    "meta_level": 0,
    "prerequisite": ["String (Mutually exclusive traits or required conditions)"],
    "cp": 10,
    "costs": {
      "bp": -10,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [
      { "target": "Target Name", "type": "disadvantage", "value": -2, "mode": "inherent" }
    ],
    "mechanic": "String (Precise mechanical rules, penalty triggers, roleplay mandates)",
    "note": "String or null (Removability, GM notes, overcoming conditions)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Refunded Points:** cp is the positive integer value refunded. costs.bp MUST be the negative value (e.g. cp: 10, costs.bp: -10).
2. **Negative Modifiers:** Any penalty applied to rolls or pools should be recorded as a negative value in modifiers.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW DISADVANTAGE TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'tech_level', 'meta_level', 'prerequisite',
      'cp', 'costs', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Cybernetic Rejection",
      description: "Your immune system violently rejects foreign synthetic hardware and neuro-synaptic couplers.",
      tech_level: 0,
      meta_level: 0,
      prerequisite: [],
      cp: 10,
      costs: {
        bp: -10,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: [
        { target: "Max Cyberware Nodes", type: "disadvantage", value: -4, mode: "inherent" }
      ],
      mechanic: "Any cybernetic installation requires an opposed Fortitude check (DC 18) to avoid suffering 2d6 systemic bio-strain.",
      note: "Cannot be taken by Synthetic species."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT E: FACTION PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'factions',
    code: 'PROMPT E',
    label: 'Factions & Polities',
    matrixId: 'factions',
    targetCollection: 'factions',
    icon: Building,
    color: '#06b6d4',
    description: 'Parse raw faction documentation into comprehensive JSON documents covering culture, military doctrine, aesthetics, and societal structure.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX FACTION PARSER

**ROLE:** You are an expert worldbuilding archivist and data engineer for Tangent SFF RPG. Your task is to parse raw faction documentation into strict, comprehensive JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Faction Name)",
    "description": "String (High-level narrative overview and thematic summary)",
    "society": "String or null (Associated societal structure or planetary origin)",
    "prerequisite": ["String (Requirements to join or hold rank)"],
    "archetype": "String (Exact enum: 'Militaristic', 'Corporate / Mercantile', 'Religious / Cult', 'Technological', 'Criminal / Syndicate', 'Exploration / Academic', 'Agrarian / Colony', 'Isolationist / Alien')",
    "tech_level": 3,
    "meta_level": 0,
    "colloquialisms": "String (In-universe slang and terminology)",
    "symbol_sigil": "String (Description of emblem, crest, or heraldry)",
    "driving_mandate": "String (Core institutional objective)",
    "motto": "String (Official rallying cry or creed)",
    "core_beliefs": "String (Ideological foundation and worldview)",
    "social_structure": "String (Internal hierarchy and command authority)",
    "outsider_view": "String (Policy toward alien species and rival factions)",
    "law_order": "String (Disciplinary framework and internal justice)",
    "government_type": "String (Administrative model)",
    "leadership": "String (Key rulers, councilors, or commanding officers)",
    "succession": "String (Method of leadership transition)",
    "primary_exports": "String (Key goods, services, and raw commodities)",
    "economic_model": "String (Financial structure)",
    "military_doctrine": "String (Combat strategy and tactical philosophy)",
    "key_units": "String (Elite regiments, security details, or divisions)",
    "naval_assets": "String (Starships, fleet composition, and heavy armor)",
    "design_language": "String (Visual styling of hardware, bases, and technology)",
    "architecture": "String (Urban, station, and outpost architectural motifs)",
    "gear_aesthetic": "String (Uniforms, weaponry styling, armor silhouettes)",
    "lighting_mood": "String (Atmosphere, interior lighting, and visual tone)",
    "image_prompt": "String (Detailed AI art generation prompt representing the faction)",
    "attitude": "String (Default demeanor in diplomacy)",
    "goals": "String (Short-term and long-term strategic plans)",
    "social_strengths": "String (Institutional advantages)",
    "social_weaknesses": "String (Vulnerabilities, corruption, or blind spots)",
    "modifiers": [
      { "target": "Wealth Score", "type": "wealth", "value": 1, "mode": "inherent" }
    ],
    "mechanic": "String or null (Faction-specific mechanical bonuses or reputation tracks)",
    "note": "String or null (GM campaign hooks and secrets)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Snake Case Keys:** Use snake_case for all multi-word keys (e.g. driving_mandate, social_structure, symbol_sigil).
2. **Archetype Enum:** Restrict archetype to the 8 canonical options.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW FACTIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'society', 'prerequisite', 'archetype', 'tech_level',
      'meta_level', 'colloquialisms', 'symbol_sigil', 'driving_mandate', 'motto',
      'core_beliefs', 'social_structure', 'outsider_view', 'law_order',
      'government_type', 'leadership', 'succession', 'primary_exports',
      'economic_model', 'military_doctrine', 'key_units', 'naval_assets',
      'design_language', 'architecture', 'gear_aesthetic', 'lighting_mood',
      'image_prompt', 'attitude', 'goals', 'social_strengths', 'social_weaknesses',
      'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "The Obsidian Syndicate",
      description: "A shadowy inter-sector cartel controlling covert hyperspace routing, smuggling, and illicit bio-tech laboratories.",
      society: "Shadow Archipelago",
      prerequisite: ["Underworld Contact or Outlaw Trait"],
      archetype: "Criminal / Syndicate",
      tech_level: 3,
      meta_level: 1,
      colloquialisms: "The Deep Current, Ghost Cargo, Tithe-Keepers",
      symbol_sigil: "An eclipse silhouette bisected by an obsidian dagger",
      driving_mandate: "Monopolize covert transit and sub-space intelligence channels",
      motto: "What travels in shadow remains unbroken.",
      core_beliefs: "Sovereignty belongs to those who control the lines of supply.",
      social_structure: "Tiered syndics led by an anonymous Board of Shadows",
      outsider_view: "Tolerated as marks, clients, or unwitting pawns",
      law_order: "Lethal internal arbitration governed by blood pacts",
      government_type: "Cryptocratic Oligarchy",
      leadership: "The Arch-Syndic Council",
      succession: "Ascension by challenge or unanimous council decree",
      primary_exports: "Contraband, encrypted com-relays, cloned organs",
      economic_model: "Shadow credit exchanges and commodity barter",
      military_doctrine: "Precision ambushes, boarding actions, and electronic sabotage",
      key_units: "Ghost Corsairs, Null-Infiltrators",
      naval_assets: "Stealth corvettes and retrofitted deep-space haulers",
      design_language: "Matte carbon surfaces, angular stealth chasses, suppressed thermal exhausts",
      architecture: "Concealed hollowed-out asteroid docks and subterranean bases",
      gear_aesthetic: "Sealed black ballistic trenchcoats with HUD-integrated respirators",
      lighting_mood: "Low-intensity amber and UV emergency strips",
      image_prompt: "Cyberpunk syndicate operatives in matte-black tactical gear conferring around a holographic star map inside a dimly lit asteroid hangar, volumetric amber lighting, cinematic sci-fi.",
      attitude: "Cautious, calculating, and ruthless when crossed",
      goals: "Secure monopoly over the Rimward Trade Gates",
      social_strengths: "Unmatched informant network and untraceable wealth",
      social_weaknesses: "Pervasive paranoia and internal power struggles",
      modifiers: [
        { target: "Wealth Score", type: "wealth", value: 2, mode: "inherent" },
        { target: "Streetwise", type: "skill", value: 2, mode: "inherent" }
      ],
      mechanic: "Members gain access to black-market asset acquisition at standard cost.",
      note: "GM Note: Has infiltrated several port authorities."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT F: OCCUPATION PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'occupations',
    code: 'PROMPT F',
    label: 'Occupations & Careers',
    matrixId: 'occupations',
    targetCollection: 'occupations',
    icon: Briefcase,
    color: '#eab308',
    description: 'Parse raw character career and occupational documentation into strict JSON documents with skill modifiers and operational rules.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX OCCUPATION PARSER

**ROLE:** You are an expert data engineer and RPG system archivist for Tangent SFF RPG. Your task is to parse raw character occupation documentation into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the occupation)",
    "description": "String (Flavorful description of the professional role)",
    "prerequisite": ["String (Prerequisites to enter this occupation)"],
    "trait": ["String (Associated traits or professional perks)"],
    "tech_level": 3,
    "meta_level": 0,
    "modifiers": [
      { "target": "Firearms", "type": "skill", "value": 1, "mode": "inherent" },
      { "target": "General Skill Pool", "type": "skill", "value": 2, "mode": "choice_pool" }
    ],
    "mechanic": "String (Operational rules, resource access, and career perks)",
    "note": "String or null (Common contacts, starting gear packages, GM hooks)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Skill & Attribute Packages:** Convert granted vocational skills and attribute adjustments into discrete entries inside the modifiers array.
2. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW OCCUPATIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'prerequisite', 'trait', 'tech_level',
      'meta_level', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Void Marine",
      description: "Frontline zero-gravity breach and boarding specialists trained for ship-to-ship tactical actions.",
      prerequisite: ["Might 2+", "Stamina 2+"],
      trait: ["Zero-G Combatant"],
      tech_level: 3,
      meta_level: 0,
      modifiers: [
        { target: "Firearms", type: "skill", value: 2, mode: "inherent" },
        { target: "Armor Handling", type: "skill", value: 1, mode: "inherent" },
        { target: "Athletics", type: "skill", value: 1, mode: "inherent" }
      ],
      mechanic: "Suffers no penalties to movement or weapon recoil while operating in low or zero gravity.",
      note: "Standard issue includes sealed boarding vac-suit."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT G: INVOCATIONS & SPECIAL ABILITIES PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'invocations',
    code: 'PROMPT G',
    label: 'Invocations & Special Abilities',
    matrixId: 'invocations',
    targetCollection: 'invocations',
    icon: Zap,
    color: '#a855f7',
    description: 'Parse raw psionics, metaphysics, spells, and special abilities into structured JSON documents with AP, strain, focus, and critical effects.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX INVOCATION PARSER

**ROLE:** You are an expert data engineer and RPG rules architect for Tangent SFF RPG. Your task is to parse raw magical, psionic, and meta-ability documentation into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the invocation or special ability)",
    "description": "String (Narrative manifestation and sensory phenomenon)",
    "discipline": "String (Associated discipline, e.g., 'telekinesis', 'pyromancy', 'biomancy')",
    "meta_skill": "String (Governing skill, e.g., 'Metaphysics')",
    "area": ["String (Area pattern, e.g., 'Single Target', '10ft Radius Sphere', 'Cone')"],
    "effect": ["String (Effect type, e.g., 'Kinetic Force', 'Direct Damage', 'Barrier')"],
    "range": ["String (Range band, e.g., 'Touch', 'Short (30ft)', 'Extreme (1000m)')"],
    "target": ["String (Target restrictions, e.g., 'One Sophont', 'Unliving Matter')"],
    "prerequisite": ["String (Required Meta Level, discipline ranks, or feats)"],
    "design_dc": 18,
    "craft_dc": 18,
    "tech_level": 0,
    "meta_level": 2,
    "cast_time": "String (Action cost, e.g., '1 Action', 'Reaction', '10 Minutes')",
    "duration": "String (Duration of effect, e.g., 'Instant', 'Sustained (Concentration)', '1 Hour')",
    "critical_details": {
      "score": "20",
      "effect": ["String (Standard crit rider)"],
      "success_effect": ["String (Critical success manifestation)"],
      "failure_effect": ["String (Critical fumble or psychic backlash)"]
    },
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 2,
      "focus": 2,
      "ap": 2
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "modifiers": [
      { "target": "Target Name", "type": "discipline", "value": 1, "mode": "inherent" }
    ],
    "mechanic": "String (Exact combat mechanics, damage formulas, saves, DCs, opposed checks)",
    "note": "String or null (Synergies, failure consequences, material foci)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Resource Accounting:** Map action points to costs.ap, strain expenditure to costs.strain, and focus expenditure to costs.focus.
2. **Arrays for Patterns:** area, effect, range, target, and prerequisite MUST be arrays of strings.
3. **No LaTeX:** Write all damage and DC expressions as plain text (e.g. 2d8+3, DC 15 + ML).
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW INVOCATION TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'discipline', 'meta_skill', 'area', 'effect',
      'range', 'target', 'prerequisite', 'design_dc', 'craft_dc', 'tech_level',
      'meta_level', 'cast_time', 'duration', 'critical_details', 'costs',
      'sockets', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Kinetic Lance",
      description: "A focused pulse of compressed psionic force visible as an atmospheric distortion that pierces armor.",
      discipline: "telekinesis",
      meta_skill: "Metaphysics",
      area: ["Single Target"],
      effect: ["Kinetic Force", "Armor Piercing"],
      range: ["Medium (60ft)"],
      target: ["One Visible Target"],
      prerequisite: ["Meta Level 2+", "Telekinesis Rank 2"],
      design_dc: 18,
      craft_dc: 18,
      tech_level: 0,
      meta_level: 2,
      cast_time: "1 Action",
      duration: "Instant",
      critical_details: {
        score: "20",
        effect: ["Target is knocked prone"],
        success_effect: ["Double Damage and pushed back 15ft"],
        failure_effect: ["Psychic backlash deals 1d4 Focus burn to caster"]
      },
      costs: {
        bp: 0,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 1,
        focus: 2,
        ap: 2
      },
      sockets: {
        max: 0,
        used: 0,
        tier: "Socket",
        allocated: []
      },
      modifiers: [],
      mechanic: "Make a Metaphysics vs. Defense check. On hit, deals 3d8 Kinetic damage with AP 4.",
      note: "Can be overcharged for +1d8 per additional Focus point spent."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT H: AUGMENTATIONS PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'augmentations',
    code: 'PROMPT H',
    label: 'Augmentations & Cybernetics',
    matrixId: 'augmentations',
    targetCollection: 'augmentations',
    icon: Cpu,
    color: '#ec4899',
    description: 'Parse raw cyberware, bioware, nanotech, and anatomical augmentations into strict JSON documents with nodes, sockets, and stigma.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX AUGMENTATION PARSER

**ROLE:** You are an expert cybernetics data engineer and RPG system archivist for Tangent SFF RPG. Your task is to parse raw cyberware, bioware, and nanotech augmentations into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the augmentation)",
    "type": "String (Category, e.g., 'Cybernetics', 'Bioware', 'Nanotech', 'Gene-Craft')",
    "location": ["String (Body location: 'Head', 'Torso', 'Arms', 'Legs', 'Nervous System', 'Internal Organs', 'Subdermal')"],
    "description": "String (Flavorful description and visual appearance)",
    "tech_level": 3,
    "meta_level": 0,
    "design_dc": 20,
    "craft_dc": 20,
    "sp": 15,
    "dr": 2,
    "stigma": "String (Exact enum: 'None', 'Minor', 'Moderate', 'Severe')",
    "classification": ["String (Military, Civilian, Exotic)"],
    "creator": ["String (Origin corporation or faction)"],
    "design": ["String (Schematic or model designation)"],
    "component": ["String (Required modular components)"],
    "prerequisite": ["String (Prerequisites to install or support)"],
    "costs": {
      "bp": 4,
      "credits": 2500,
      "nodes": 2,
      "sockets": 1,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 1,
      "used": 1,
      "tier": "Socket",
      "allocated": []
    },
    "critical_details": {
      "score": "20",
      "effect": [],
      "success_effect": ["Optimized Integration (+1 to check)"],
      "failure_effect": ["Hardware Rejection (Take 1d6 Bio-Strain)"]
    },
    "modifiers": [
      { "target": "Might", "type": "attribute", "value": 1, "mode": "inherent" }
    ],
    "mechanic": "String (Active and passive mechanical rules, roll bonuses, power draw)",
    "note": "String or null (Maintenance requirements, EMP vulnerability, surgery notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Hardware Costs:** Map node footprint to costs.nodes, socket requirements to costs.sockets, and BP cost to costs.bp.
2. **Numeric Fields:** sp (Structure Points), dr (Damage Resistance), and design_dc MUST be numbers.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW AUGMENTATIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'type', 'location', 'description', 'tech_level', 'meta_level',
      'design_dc', 'craft_dc', 'sp', 'dr', 'stigma', 'classification',
      'creator', 'design', 'component', 'prerequisite', 'costs', 'sockets',
      'critical_details', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Subdermal Plasteel Weave",
      type: "Cybernetics",
      location: ["Subdermal", "Torso"],
      description: "A flexible mesh of plasteel fibers woven into the deep dermis to disperse kinetic trauma.",
      tech_level: 3,
      meta_level: 0,
      design_dc: 18,
      craft_dc: 18,
      sp: 20,
      dr: 2,
      stigma: "Minor",
      classification: ["Military"],
      creator: ["Aegis Biometics"],
      design: ["Mk-IV Ballistic Dermal Weave"],
      component: ["Flexible Plasteel Fiber", "Neuro-Sealant"],
      prerequisite: ["Stamina 2+"],
      costs: {
        bp: 4,
        credits: 3000,
        nodes: 1,
        sockets: 1,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 1,
        used: 1,
        tier: "Socket",
        allocated: []
      },
      critical_details: {
        score: "20",
        effect: [],
        success_effect: ["Deflection (+1 DR for 1 round)"],
        failure_effect: ["Torn mesh requires surgical repair"]
      },
      modifiers: [
        { target: "Damage Resist", type: "combat", value: 2, mode: "inherent" }
      ],
      mechanic: "Provides passive DR 2 against Kinetic and Ballistic damage. Invisible to casual inspection.",
      note: "Standard medical scanner detects synthetic subdermal density."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT I: GEAR PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'gear',
    code: 'PROMPT I',
    label: 'Gear & Apparatus',
    matrixId: 'gear',
    targetCollection: 'gear',
    icon: Package,
    color: '#64748b',
    description: 'Parse raw equipment, tools, survival kits, and electronics into strict JSON documents with weight, sockets, and credits.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX GEAR PARSER

**ROLE:** You are an expert data engineer and equipment cataloger for Tangent SFF RPG. Your task is to parse raw gear, electronics, tools, and survival equipment into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the item)",
    "category": "String (Gear category, e.g., 'Electronics', 'Medical', 'Surveillance', 'Tools', 'Survival', 'Field Gear')",
    "size": "String (Exact enum: 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Mecha', 'Structure')",
    "faction_skin": "String (Manufacturer or cultural aesthetic origin)",
    "base_dc": 12,
    "craft_dc": 16,
    "tech_level": 3,
    "meta_level": 0,
    "weight": 1.5,
    "sp": 10,
    "dr": 0,
    "workspace_scale": "String (Exact enum: 'Belt', 'Bench', 'Bay', 'Facility')",
    "computer_pr": 2,
    "software_level": 0,
    "epr_rating": 2,
    "supply_die": "String (Exact enum: 'None', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20')",
    "enhancement_type": "String (Exact enum: 'Passive', 'Active', 'Symbiotic')",
    "invocation_rank": 0,
    "scale_tier": "String (Exact enum: 'Personal', 'Vehicle', 'Strategic')",
    "daily_charges": 10,
    "description": "String (Flavorful description, operation, and aesthetic)",
    "availability": "String (Legality/rarity, e.g., 'Common', 'Restricted', 'Military', 'Black Market')",
    "prerequisite": ["String (Required skills or proficiencies)"],
    "costs": {
      "bp": 0,
      "credits": 250,
      "nodes": 0,
      "sockets": 2,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 2,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "modifications": [],
    "modifiers": [
      { "target": "Perception", "type": "skill", "value": 2, "mode": "inherent" }
    ],
    "mechanic": "String (Operational rules, sensor ranges, battery life, activated abilities)",
    "note": "String or null (Maintenance, recharge cycles, table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Weight in KG:** weight must be a positive float representing weight in kilograms.
2. **Supply Die:** Standard expendables use supply_die (e.g. d6, d8).
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW GEAR TEXT HERE]`,
    expectedKeys: [
      'name', 'category', 'size', 'faction_skin', 'base_dc', 'craft_dc',
      'tech_level', 'meta_level', 'weight', 'sp', 'dr', 'workspace_scale',
      'computer_pr', 'software_level', 'epr_rating', 'supply_die',
      'enhancement_type', 'invocation_rank', 'scale_tier', 'daily_charges',
      'description', 'availability', 'prerequisite', 'costs', 'sockets',
      'modifications', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Tactical Multispectral Scanner",
      category: "Surveillance",
      size: "Small",
      faction_skin: "Aegis Dynamics",
      base_dc: 12,
      craft_dc: 16,
      tech_level: 3,
      meta_level: 0,
      weight: 0.8,
      sp: 10,
      dr: 1,
      workspace_scale: "Belt",
      computer_pr: 2,
      software_level: 2,
      epr_rating: 3,
      supply_die: "None",
      enhancement_type: "Active",
      invocation_rank: 0,
      scale_tier: "Personal",
      daily_charges: 24,
      description: "Handheld scanner detecting thermal, electromagnetic, and biological life-signatures up to 200 meters.",
      availability: "Common",
      prerequisite: ["Sensors 1+"],
      costs: {
        bp: 0,
        credits: 450,
        nodes: 0,
        sockets: 2,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 2,
        used: 0,
        tier: "Socket",
        allocated: []
      },
      modifications: [],
      modifiers: [
        { target: "Perception", type: "skill", value: 2, mode: "inherent" }
      ],
      mechanic: "Active ping reveals hidden targets within 200m line of sight. Battery lasts 24 operational hours.",
      note: "Can be linked to smartlink HUD."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT J: WEAPONRY PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'weaponry',
    code: 'PROMPT J',
    label: 'Weaponry & Ordinance',
    matrixId: 'weaponry',
    targetCollection: 'weaponry',
    icon: Crosshair,
    color: '#dc2626',
    description: 'Parse raw weapons, firearms, energy rifles, and melee weapons into strict JSON documents with damage dice, AP, and firing modes.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX WEAPONRY PARSER

**ROLE:** You are an expert arms designer and data engineer for Tangent SFF RPG. Your task is to parse raw firearms, melee weapons, energy projectors, and tactical ordinance into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Weapon Name)",
    "description": "String (Tactical description, ergonomics, and aesthetic)",
    "tech_level": 3,
    "meta_level": 0,
    "availability": "String (e.g., 'Common', 'Restricted', 'Military', 'Illegal')",
    "design_dc": 18,
    "craft_dc": 18,
    "size": ["species_size-medium"],
    "weight": 3.2,
    "quality": "String (Exact enum: 'Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted')",
    "durability": 30,
    "prerequisite": ["String (Required strength, features, or proficiency)"],
    "skill": "String (Governing skill, e.g., 'Rifles', 'Heavy Ballistic', 'Blades', 'Unarmed')",
    "special": ["String (Weapon tags, e.g., 'Concealable', 'Silent', 'High Recoil', 'Stun')"],
    "area": ["String or null"],
    "effect": ["String or null"],
    "range": "String (Range bands, e.g., '30/60/150' or 'Melee')",
    "target": ["String (Target profile)"],
    "origin": ["String (Faction or planetary origin)"],
    "creator": ["String (Manufacturer)"],
    "classification": "String (Exact enum: 'Melee (Slashing)', 'Melee (Blunt)', 'Melee (Piercing)', 'Ranged (Ballistic)', 'Heavy (Ballistic)', 'Ranged (Energy)', 'Heavy (Energy)')",
    "damage": "String (Dice expression: '2d8+2', '3d6', '1d10')",
    "damage_type": "String (Exact enum: 'Kinetic', 'Force', 'Thermal (Pyro/Cryo)', 'Voltic (Electrical)', 'Sonic', 'Corrosive (Acid)', 'Psychic/Metaphysical')",
    "ap": 2,
    "ammunition": "String (Capacity and type, e.g., '30 (Standard Ballistic Magazine)', '10 (Heavy Power Cell)')",
    "power_source": "String (Standard Magazine, Power Cell, Chemical Reactor, None)",
    "faction_skin": "String (Manufacturer skin)",
    "design": ["String (Schematic design code)"],
    "accuracy": 0,
    "modes": ["String (Firing modes: 'Single', 'Burst', 'Auto', 'Suppression')"],
    "attack_rate": "String (Rate of fire, e.g., '1', '3', 'Burst 5')",
    "wielding": "String (Exact enum: 'One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted')",
    "component": ["String (Integrated scopes, muzzles, grips)"],
    "critical_details": {
      "score": "20",
      "effect": ["String (Critical hit effect)"],
      "success_effect": ["Double Damage"],
      "failure_effect": ["Weapon Jam / Misfire"]
    },
    "costs": {
      "bp": 0,
      "credits": 750,
      "nodes": 0,
      "sockets": 3,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 3,
      "used": 1,
      "tier": "Socket",
      "allocated": []
    },
    "modifications": [],
    "modifiers": [],
    "mechanic": "String (Full tactical rules, recoil effects, special attack options)",
    "note": "String or null (Maintenance, ammunition costs, GM notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Discrete Mechanical Fields:** Never combine damage and damage type into one string. damage is the dice string (e.g. 2d8), damage_type is the enum (e.g. Kinetic).
2. **Penetration:** Armor penetration rating is stored as a number in ap.
3. **No LaTeX:** Use plain text formulas.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW WEAPONRY TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'tech_level', 'meta_level', 'availability',
      'design_dc', 'craft_dc', 'size', 'weight', 'quality', 'durability',
      'prerequisite', 'skill', 'special', 'area', 'effect', 'range', 'target',
      'origin', 'creator', 'classification', 'damage', 'damage_type', 'ap',
      'ammunition', 'power_source', 'faction_skin', 'design', 'accuracy',
      'modes', 'attack_rate', 'wielding', 'component', 'critical_details',
      'costs', 'sockets', 'modifications', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Apex-7 Plasma Carbine",
      description: "Compact bullpup energy weapon firing superheated magnetic plasma bolts with high muzzle velocity.",
      tech_level: 3,
      meta_level: 0,
      availability: "Restricted",
      design_dc: 20,
      craft_dc: 20,
      size: ["species_size-medium"],
      weight: 3.5,
      quality: "Standard",
      durability: 35,
      prerequisite: ["Energy Weapons 2+"],
      skill: "Energy Weapons",
      special: ["Thermal Burn"],
      area: [],
      effect: [],
      range: "40/80/200",
      target: ["Single Target"],
      origin: ["Solari Foundries"],
      creator: ["Solari Ordnance"],
      classification: "Ranged (Energy)",
      damage: "3d8",
      damage_type: "Thermal (Pyro/Cryo)",
      ap: 3,
      ammunition: "24 (Standard Cell)",
      power_source: "Power Cell",
      faction_skin: "Standard",
      design: ["Apex-Series Mk-II"],
      accuracy: 1,
      modes: ["Single", "Burst"],
      attack_rate: "1",
      wielding: "Two-Handed",
      component: ["Holographic Sight"],
      critical_details: {
        score: "19-20",
        effect: ["Target ignited for 1d6 ongoing thermal damage"],
        success_effect: ["Double Damage and melts 1 point of armor DR"],
        failure_effect: ["Thermal vent overheat requires 1 round cool down"]
      },
      costs: {
        bp: 0,
        credits: 1100,
        nodes: 0,
        sockets: 3,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 3,
        used: 1,
        tier: "Socket",
        allocated: []
      },
      modifications: [],
      modifiers: [],
      mechanic: "Burst fire expends 3 rounds for +2 to attack roll or +1d8 damage.",
      note: "Cell replacement requires 1 AP."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT K: ARMORING PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'armoring',
    code: 'PROMPT K',
    label: 'Armoring & Protective Suits',
    matrixId: 'armoring',
    targetCollection: 'armoring',
    icon: Shield,
    color: '#2563eb',
    description: 'Parse raw armor, suits, ballistic vests, shields, and environmental protection into strict JSON documents with coverage and resistances.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX ARMORING PARSER

**ROLE:** You are an expert defense system engineer and data archivist for Tangent SFF RPG. Your task is to parse raw armor, suits, shields, and protective equipment into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Armor / Shield Name)",
    "description": "String (Aesthetic description, materials, and silhouette)",
    "tech_level": 3,
    "meta_level": 0,
    "availability": "String (e.g., 'Common', 'Restricted', 'Military')",
    "design_dc": 16,
    "craft_dc": 16,
    "size": ["species_size-medium"],
    "weight": 8.0,
    "quality": "String (Exact enum: 'Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted')",
    "durability": 50,
    "prerequisite": ["String (Armor proficiencies or minimum Might)"],
    "skill": "String (Governing skill, e.g., 'Armor Handling', 'Combat Defense')",
    "origin": ["String (Faction or planetary origin)"],
    "creator": ["String (Manufacturer)"],
    "design": ["String (Design model)"],
    "classification": ["String (Civilian, Ballistic, Sealed, Powered)"],
    "material": ["String (Materials: 'Plasteel', 'Ceramite', 'Titanium Mesh', 'Carbon Weave')"],
    "body_locations": ["String (Locations covered: 'Full Body', 'Torso', 'Head', 'Limbs')"],
    "coverage": "String (Exact enum: 'Partial', 'Standard', 'Sealed', 'Reinforced', 'Bulwark')",
    "max_dex": 4,
    "mobility_penalty": 0,
    "faction_skin": "String (Cultural skin)",
    "carried_shield": "String or null (If shield, describe shield profile)",
    "category": "String (Exact enum: 'Jewelry', 'Device', 'Lightweight', 'Mediumweight', 'Heavyweight', 'Mecha', 'Structure')",
    "resistance": ["String (Resistances granted: 'Kinetic', 'Thermal (Pyro/Cryo)', 'Voltic (Electrical)', 'Radiation', 'Toxic')"],
    "modes": ["String (Operational modes: 'Passive', 'Active Shielding', 'Emergency Power')"],
    "critical_details": {
      "score": "20",
      "effect": [],
      "success_effect": ["Deflection (Damage reduced to 0)"],
      "failure_effect": ["Armor Breach / Compromised Seal"]
    },
    "costs": {
      "bp": 0,
      "credits": 1200,
      "nodes": 0,
      "sockets": 4,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 4,
      "used": 1,
      "tier": "Socket",
      "allocated": []
    },
    "modifications": [],
    "modifiers": [
      { "target": "Damage Resist", "type": "combat", "value": 4, "mode": "inherent" }
    ],
    "mechanic": "String (Environmental seals, life support durations, kinetic dampening rules)",
    "note": "String or null (Maintenance, recharge protocols, sealed atmosphere limits)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Dexterity Limits:** max_dex and mobility_penalty MUST be numbers.
2. **Exact Coverage:** coverage must strictly be one of: Partial, Standard, Sealed, Reinforced, Bulwark.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW ARMORING TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'tech_level', 'meta_level', 'availability',
      'design_dc', 'craft_dc', 'size', 'weight', 'quality', 'durability',
      'prerequisite', 'skill', 'origin', 'creator', 'design', 'classification',
      'material', 'body_locations', 'coverage', 'max_dex', 'mobility_penalty',
      'faction_skin', 'carried_shield', 'category', 'resistance', 'modes',
      'critical_details', 'costs', 'sockets', 'modifications', 'modifiers',
      'mechanic', 'note'
    ],
    sampleItem: {
      name: "Aegis Reinforced Ballistic Suit",
      description: "Segmented composite ceramite plates over high-density ballistic weave with neck and groin gorgets.",
      tech_level: 3,
      meta_level: 0,
      availability: "Commercial",
      design_dc: 16,
      craft_dc: 16,
      size: ["species_size-medium"],
      weight: 7.5,
      quality: "Standard",
      durability: 45,
      prerequisite: ["Might 1+"],
      skill: "Armor Handling",
      origin: ["Aegis Defense Systems"],
      creator: ["Aegis Armor Core"],
      design: ["Mk-3 Tactical Rig"],
      classification: ["Ballistic"],
      material: ["Ceramite", "Ballistic Weave"],
      body_locations: ["Torso", "Limbs"],
      coverage: "Standard",
      max_dex: 3,
      mobility_penalty: 0,
      faction_skin: "Standard",
      carried_shield: null,
      category: "Mediumweight",
      resistance: ["Kinetic", "Thermal (Pyro/Cryo)"],
      modes: ["Passive"],
      critical_details: {
        score: "20",
        effect: [],
        success_effect: ["Deflects incoming critical hit to standard hit"],
        failure_effect: ["Ceramite plate cracks (-1 DR until repaired)"]
      },
      costs: {
        bp: 0,
        credits: 950,
        nodes: 0,
        sockets: 3,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 3,
        used: 0,
        tier: "Socket",
        allocated: []
      },
      modifications: [],
      modifiers: [
        { target: "Damage Resist", type: "combat", value: 3, mode: "inherent" }
      ],
      mechanic: "Provides passive DR 3 against Kinetic and DR 1 against Thermal damage.",
      note: "Standard sealed helmet available as modular add-on."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT L: MECHA PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'mecha',
    code: 'PROMPT L',
    label: 'Mecha & Combat Frames',
    matrixId: 'mecha',
    targetCollection: 'mecha',
    icon: Bot,
    color: '#ea580c',
    description: 'Parse raw mecha frames, giant robots, piloted walker suits, propulsion specs, and weapon hardpoints into strict JSON documents.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX MECHA PARSER

**ROLE:** You are an expert mecha engineer and data archivist for Tangent SFF RPG. Your task is to parse raw mecha, combat chassis, walkers, and powered exosuits into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Mecha Chassis Designation)",
    "domain": "String (Operational domain: 'Ground', 'Atmospheric', 'Vacuum / Orbital', 'Amphibious')",
    "size": "String (Exact enum: 'Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'Super Gargantuan', 'Mega Colossal')",
    "frame": "String (Exact enum: 'Creature', 'Humanoid', 'Industrial', 'Personal', 'Platform', 'Racing', 'Walker', 'Winged')",
    "faction_skin": "String (Manufacturer / Cultural aesthetic)",
    "tech_level": 3,
    "meta_level": 0,
    "craft_dc": 24,
    "sp": 150,
    "dr": 15,
    "propulsion": "String (Propulsion system: 'Bipedal Walker', 'Quad Treads', 'Ion Thrusters', 'Grav-Repulsor')",
    "armor_plating": ["String (Integrated composite armor specs)"],
    "vft_mode": "String (Variable Form Technology modes or 'None')",
    "pilot_agility": 0,
    "handling": 0,
    "description": "String (Chassis overview, cockpit ergonomics, aesthetic)",
    "availability": "String (Military, Commercial, Black Market)",
    "prerequisite": ["String (Mecha Piloting skill, Neural Interface feat)"],
    "costs": {
      "bp": 0,
      "credits": 250000,
      "nodes": 0,
      "sockets": 8,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 8,
      "used": 2,
      "tier": "Hardpoint",
      "allocated": []
    },
    "modifications": [],
    "modifiers": [],
    "mechanic": "String (Reactor output, cockpit life support, ejection protocols, movement speeds)",
    "note": "String or null (Maintenance cycles, fuel requirements, field repair DCs)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Hardpoint Sockets:** Frame mounting hardpoints are stored in sockets.max with tier 'Hardpoint'.
2. **Durability:** Structure Points (sp) and Damage Resistance (dr) must be numbers.
3. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW MECHA TEXT HERE]`,
    expectedKeys: [
      'name', 'domain', 'size', 'frame', 'faction_skin', 'tech_level',
      'meta_level', 'craft_dc', 'sp', 'dr', 'propulsion', 'armor_plating',
      'vft_mode', 'pilot_agility', 'handling', 'description', 'availability',
      'prerequisite', 'costs', 'sockets', 'modifications', 'modifiers',
      'mechanic', 'note'
    ],
    sampleItem: {
      name: "Centurion Mk-IV Assault Frame",
      domain: "Ground",
      size: "Large",
      frame: "Humanoid",
      faction_skin: "Aegis Industrial",
      tech_level: 3,
      meta_level: 0,
      craft_dc: 26,
      sp: 220,
      dr: 18,
      propulsion: "Bipedal Myomer Walker with Vector Jump Thrusters",
      armor_plating: ["Reactive Plasteel Laminate"],
      vft_mode: "None",
      pilot_agility: 0,
      handling: 1,
      description: "A 7-meter heavy frontline assault frame engineered for urban breach operations and sustained fire support.",
      availability: "Military License",
      prerequisite: ["Mecha Operation 2+", "Heavy Weapons 2+"],
      costs: {
        bp: 0,
        credits: 185000,
        nodes: 0,
        sockets: 6,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 6,
        used: 2,
        tier: "Hardpoint",
        allocated: []
      },
      modifications: [],
      modifiers: [],
      mechanic: "Jump thrusters allow 60ft vertical clearance or 120ft forward boost. Cockpit is fully sealed with 48-hour life support.",
      note: "Reactor core requires hydrogen cell replenishment every 120 hours."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT M: ARCHITECTURE PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'architecture',
    code: 'PROMPT M',
    label: 'Architecture & Megastructures',
    matrixId: 'architecture',
    targetCollection: 'architecture',
    icon: Building2,
    color: '#f59e0b',
    description: 'Parse orbital stations, planetary fortresses, arcologies, underground bunkers, security levels, and structural module capacity.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX ARCHITECTURE PARSER

**ROLE:** You are an expert structural engineer and architectural archivist for Tangent SFF RPG. Your task is to parse raw habitats, orbital stations, fortifications, and bases into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Structure Designation / Blueprint Name)",
    "style": "String (Architectural style, e.g., 'Brutalist', 'Gothic Arcology', 'Modular High-Tech')",
    "footprint": "String (Exact enum: 'Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'Super Gargantuan', 'Mega Colossal')",
    "height_class": "String (Exact enum: 'Single', 'Duplex', 'Multi-Story', 'Mid-Rise', 'High-Rise', 'Skyscraper')",
    "stories": 4,
    "frame": "String (Exact enum: 'Industrial', 'Standard', 'Elevated', 'Tower', 'Subterranean', 'Biomimetic', 'Dynamic', 'Palatial')",
    "environment": "String (Exact enum: 'Standard', 'Low Gravity', 'High Gravity', 'Vacuum / Toxic / Corrosive', 'Liquid (Aquatic)')",
    "propulsion": "String (Exact enum: 'None (Static)', 'Ground Crawler', 'Independent Suspension', 'Aquatic Flotilla', 'Supercavitation', 'Heavy Hover', 'Orbital Station-Keeping', 'Heavy VTOL System', 'Arcane Levitation', 'Aerial Grav-Spire')",
    "tech_level": 3,
    "meta_level": 0,
    "sp": 1000,
    "dr": 25,
    "design_dc": 22,
    "craft_dc": 22,
    "security_level": "String (Exact enum: 'Open', 'Restricted', 'High Security', 'Black-Site', 'Quarantine')",
    "primary_purpose": "String (Functional purpose: 'Refinery', 'Research Outpost', 'Orbital Citadel')",
    "description": "String (Architectural overview, layout, and visual aesthetic)",
    "prerequisite": ["String (Construction prerequisites or zoning)"],
    "costs": {
      "bp": 0,
      "credits": 1500000,
      "nodes": 0,
      "sockets": 16,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "sockets": {
      "max": 16,
      "used": 4,
      "tier": "Module",
      "allocated": []
    },
    "modifications": [],
    "modifiers": [],
    "mechanic": "String (Life support capacity, sensor coverage, shield generator output, hangar limits)",
    "note": "String or null (Integrated facilities, point defense hardpoints, core reactor specifications)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Module Capacity:** Facility modules (medical bays, hangars, barracks) are counted in sockets.max with tier 'Module'.
2. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW ARCHITECTURE TEXT HERE]`,
    expectedKeys: [
      'name', 'style', 'footprint', 'height_class', 'stories', 'frame',
      'environment', 'propulsion', 'tech_level', 'meta_level', 'sp', 'dr',
      'design_dc', 'craft_dc', 'security_level', 'primary_purpose',
      'description', 'prerequisite', 'costs', 'sockets', 'modifications',
      'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Aegis Spire Orbital Station",
      style: "Modular High-Tech",
      footprint: "Colossal",
      height_class: "Skyscraper",
      stories: 120,
      frame: "Standard",
      environment: "Vacuum / Toxic / Corrosive",
      propulsion: "Orbital Station-Keeping",
      tech_level: 4,
      meta_level: 0,
      sp: 12000,
      dr: 35,
      design_dc: 30,
      craft_dc: 30,
      security_level: "High Security",
      primary_purpose: "Trade Nexus and Orbital Defense Citadel",
      description: "A colossal modular space station serving as the primary logistics gateway to the sector jump-gate.",
      prerequisite: ["Orbital Charter License"],
      costs: {
        bp: 0,
        credits: 5000000,
        nodes: 0,
        sockets: 32,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: 32,
        used: 12,
        tier: "Module",
        allocated: []
      },
      modifications: [],
      modifiers: [],
      mechanic: "Houses 12,000 residents with full life support recycling. Docking ring handles up to 20 starships.",
      note: "Maintains independent point defense grid."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT N: OTHER PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'other',
    code: 'PROMPT N',
    label: 'Other & Miscellaneous',
    matrixId: 'other',
    targetCollection: 'other',
    icon: HelpCircle,
    color: '#94a3b8',
    description: 'Parse miscellaneous items, trade goods, generic commodities, consumable items, and general rules into clean JSON structures.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX OTHER / MISCELLANEOUS PARSER

**ROLE:** You are an expert data engineer and archivist for Tangent SFF RPG. Your task is to parse miscellaneous items, raw materials, commodities, trade goods, and system entities into strict JSON documents for the OMNICORTEX database.

**TASK:** Parse the provided text into a JSON array of objects adhering strictly to the schema below.

**JSON SCHEMA:**
[
  {
    "name": "String (Name of the item or entity)",
    "description": "String (Flavorful description and practical usage)",
    "weight": 1.0,
    "tech_level": 2,
    "meta_level": 0,
    "availability": "String (e.g., 'Common', 'Restricted', 'Exotic')",
    "prerequisite": ["String (Handling requirements or licenses)"],
    "costs": {
      "bp": 0,
      "credits": 50,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "mechanic": "String (Rules, shelf-life, consumption effects, trade utility)",
    "note": "String or null (Package sizes, cargo transport notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Numeric Integrity:** weight, tech_level, meta_level, and costs.credits MUST be numbers.
2. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW OTHER TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'weight', 'tech_level', 'meta_level',
      'availability', 'prerequisite', 'costs', 'modifiers', 'mechanic', 'note'
    ],
    sampleItem: {
      name: "Emergency Atmospheric Scrubbing Canister",
      description: "Pressurized chemical canister that neutralizes toxic air and restores breathable oxygen in sealed compartments.",
      weight: 0.8,
      tech_level: 2,
      meta_level: 0,
      availability: "Common",
      prerequisite: [],
      costs: {
        bp: 0,
        credits: 75,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: [],
      mechanic: "Cleanses up to 500 cubic feet of toxic air for 4 hours upon activation.",
      note: "Single-use disposable unit."
    }
  }
];

export const getDatasetByKey = (key) => {
  return OMNICORTEX_DATASETS.find(d => d.key === key) || OMNICORTEX_DATASETS[0];
};

/**
 * Validates a parsed JSON payload against the dataset's expected keys.
 * Returns { isValid, errors, warnings, validCount }
 */
export function validateDatasetPayload(datasetKey, parsedArray) {
  const dataset = getDatasetByKey(datasetKey);
  if (!Array.isArray(parsedArray)) {
    return {
      isValid: false,
      errors: ['Payload must be a valid JSON array of objects.'],
      warnings: [],
      validCount: 0
    };
  }

  const errors = [];
  const warnings = [];
  let validCount = 0;

  parsedArray.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} is not an object.`);
      return;
    }

    if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
      errors.push(`Item #${index + 1} is missing a valid 'name' property.`);
      return;
    }

    // Check for LaTeX math delimiters in string fields
    Object.entries(item).forEach(([k, v]) => {
      if (typeof v === 'string' && (v.includes('$$') || (v.includes('$') && !v.includes('Cr') && !v.includes('Credits')))) {
        warnings.push(`Item "${item.name}" field "${k}" contains potential LaTeX math markers ($). These will be automatically sanitized.`);
      }
    });

    // Flexible key checking: check whether item has modern keys or legacy keys
    const hasModernStructure = item.costs !== undefined || item.tech_level !== undefined;
    
    if (hasModernStructure) {
      // Validate modern fields
      if (item.tech_level !== undefined && typeof item.tech_level !== 'number') {
        warnings.push(`Item "${item.name}": 'tech_level' should be a number (got ${typeof item.tech_level}).`);
      }
      if (item.meta_level !== undefined && typeof item.meta_level !== 'number') {
        warnings.push(`Item "${item.name}": 'meta_level' should be a number (got ${typeof item.meta_level}).`);
      }
      if (item.costs && typeof item.costs !== 'object') {
        warnings.push(`Item "${item.name}": 'costs' should be a structured object map.`);
      }
    }

    validCount++;
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validCount
  };
}
