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
    description: 'Parse raw species and sub-species text into flat, self-contained Firestore JSON documents with embedded parent lineage lore.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX SPECIES PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, hierarchical RPG lore and mechanical text into a flat, self-contained JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing "Species" and "Sub-species" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every species/sub-species must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Common name of the specific sub-species, e.g., 'Dar' or 'Alterian')",
    "formalTitle": "String (The formal or cultural title)",
    "parentLineage": "String (The overarching species group, e.g., 'Aulurans' or 'Aeld')",
    "summary": "String (A 1-2 sentence elevator pitch of the species)",
    "socialStigma": "String (e.g., 'Xeno (-2)')",
    "homeworld": "String (e.g., 'Aquatica' or 'Various')",
    "techLevel": "String (e.g., '4')",
    "metaLevel": "String (e.g., '3+')",
    "prerequisites": "String (The BP Cost, e.g., '27 BP')",
    "type": "String (Classification, e.g., 'Humanoid (Feline)')",
    "size": "String (e.g., 'Medium (5 to 6ft)')",
    "movement": "String (e.g., '40ft Groundspeed')",
    "traits": "String (Unique physical or biological quirks not listed as features)",
    "attributeModifiers": "String (e.g., '+1 Agi, +1 Int')",
    "skillModifiers": "String (e.g., '+10 Skills')",
    "bonusFeatures": "String (Inherent granted features)",
    "recommendedFeatures": "String (List of suggested features)",
    "disciplinesAndSpecialAbilities": "String (Specific magical, psychic, or unique mechanics)",
    "fullLore": "String (Comprehensive history, culture, and philosophy)",
    "profileAndVisualSemiotics": "String (Aesthetic, architectural, and visual motifs)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Self-Contained Documents (Crucial):** Embed parent lineage lore, visual semiotics, and base traits directly into the \`fullLore\`, \`profileAndVisualSemiotics\`, and \`traits\` fields of each sub-species.
2. **BP Cost:** Map Build Point (BP) cost directly to \`prerequisites\`.
3. **Data Aggregation:** Combine scattered lore paragraphs into \`fullLore\` and \`profileAndVisualSemiotics\`.
4. **Clean Formatting:** Strip unnecessary markdown syntax (asterisks, stray table pipes \`|\`) from JSON string values.
5. **Formatting Standard:** All mathematical/scientific notation, attributes, and formulas must use text and not be LaTeX-style syntax (no inline $ and display $$).
6. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW SPECIES TEXT HERE]`,
    expectedKeys: [
      'name', 'formalTitle', 'parentLineage', 'summary', 'socialStigma', 'homeworld',
      'techLevel', 'metaLevel', 'prerequisites', 'type', 'size', 'movement', 'traits',
      'attributeModifiers', 'skillModifiers', 'bonusFeatures', 'recommendedFeatures',
      'disciplinesAndSpecialAbilities', 'fullLore', 'profileAndVisualSemiotics'
    ],
    sampleItem: {
      name: "Dar",
      formalTitle: "Dar Auluran",
      parentLineage: "Aulurans",
      summary: "Agile, felinoid hunters adept at covert reconnaissance in urban and canopy environments.",
      socialStigma: "Xeno (-2)",
      homeworld: "Auluria",
      techLevel: "3",
      metaLevel: "1",
      prerequisites: "25 BP",
      type: "Humanoid (Feline)",
      size: "Medium (5 to 6ft)",
      movement: "40ft Groundspeed, 20ft Climb",
      traits: "Low-Light Vision, Retractable Claws",
      attributeModifiers: "+1 Agi, +1 Int",
      skillModifiers: "+10 Stealth, +5 Perception",
      bonusFeatures: "Catfall, Silent Step",
      recommendedFeatures: "Nightstalker, Ambush Specialist",
      disciplinesAndSpecialAbilities: "Kinetic Attunement",
      fullLore: "The Dar are one of the core lineages of the Auluran race...",
      profileAndVisualSemiotics: "Sleek biometric harnesses with subdued matte carbon plating."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT B: FEATURE PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'features',
    code: 'PROMPT B',
    label: 'Features (Feats)',
    matrixId: 'features',
    targetCollection: 'features',
    icon: Sparkles,
    color: '#eab308',
    description: 'Parse rulebook character features and feats into structured mechanical records with boolean flags for multiple selection and staging.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX FEATURE PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Features" (or Feats) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects. 

**JSON SCHEMA:**
Every feature must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the feature)",
    "type": "String (e.g., Ability, Combat, Discipline, General, Karma, Skill, Special)",
    "description": "String (The flavorful description of the feature)",
    "techLevel": "String or null (If applicable, e.g., 'TL 3+')",
    "metaLevel": "String or null (If applicable)",
    "prerequisites": "String (List of required stats, skills, or features)",
    "modifiers": "String (A brief summary of the mechanical numeric bonuses)",
    "gameMechanics": "String (The detailed rules of how the feature works in play)",
    "notes": "String (Any additional edge cases, restrictions, or table notes)",
    "isMultipleSelection": true,
    "isStaged": false
  }
]

**PARSING HEURISTICS & RULES:**
1. **Boolean Flags:** 
   - If marked "[Multiple]" or "Multiple", set \`"isMultipleSelection": true\`. Otherwise, \`false\`.
   - If marked "[Ranked]" or "Ranked", set \`"isStaged": true\`. Otherwise, \`false\`.
2. **Null Values:** Use JSON \`null\` for missing levels (do not use string "null").
3. **Data Separation:** Separate flavor (\`description\`) from rules (\`gameMechanics\`). Summarize numeric bonus in \`modifiers\`.
4. **Clean Formatting:** Remove markdown bold/italics from inside strings. No LaTeX $ symbols.
5. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW FEATURE TEXT HERE]`,
    expectedKeys: [
      'name', 'type', 'description', 'techLevel', 'metaLevel', 'prerequisites',
      'modifiers', 'gameMechanics', 'notes', 'isMultipleSelection', 'isStaged'
    ],
    sampleItem: {
      name: "Point Blank Shot",
      type: "Combat",
      description: "Mastery of close-quarters firearm combat and tactical snap-aiming.",
      techLevel: "TL 2+",
      metaLevel: null,
      prerequisites: "Agi 12+, Firearms 4+",
      modifiers: "+2 Ranged Attack within 15ft, +1 Damage",
      gameMechanics: "When making ranged attacks against targets within 15ft, you do not suffer close-combat penalties.",
      notes: "Applies to pistols, shotguns, and compact carbines.",
      isMultipleSelection: false,
      isStaged: false
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT C: SKILL PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'skills',
    code: 'PROMPT C',
    label: 'Skills & Vocations',
    matrixId: 'skills',
    targetCollection: 'skills',
    icon: BookOpen,
    color: '#38bdf8',
    description: 'Parse RPG skill documentation into standardized skill records categorized by Physical, Mental, Social, Combat, and Metafocus.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX SKILL PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw RPG skill documentation into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing "Skills" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every skill must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the skill, e.g., 'Acrobatics' or 'Computers')",
    "type": "String (Physical, Mental, Social, Combat, Metafocus)",
    "subtype": "String or null (e.g., Knowledge, Vocation, Manipulation, Expression, Archaic, Modern, Advanced)",
    "isSpecialization": false,
    "description": "String (The narrative summary and purpose of the skill)",
    "techLevel": "String or null (If applicable)",
    "metaLevel": "String or null (If applicable)",
    "gameMechanics": "String (DCs, checks, opposed rolls, and mechanical effects)",
    "notes": "String (Specialties, attributes, governing stats, or special riders)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Classification:** Categorize strictly under \`type\` and sub-categorize nested lists under \`subtype\` (e.g., Knowledge or Vocation skills get subtype: "Knowledge").
2. **Specializations:** Base skills should have \`"isSpecialization": false\`, with specialized branches noted in the \`notes\` field.
3. **Clean Formatting:** Escape strings properly and remove markdown styling. No LaTeX math syntax.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW SKILL TEXT HERE]`,
    expectedKeys: [
      'name', 'type', 'subtype', 'isSpecialization', 'description',
      'techLevel', 'metaLevel', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Cybernetics Engineering",
      type: "Mental",
      subtype: "Vocation",
      isSpecialization: false,
      description: "The design, surgical installation, calibration, and diagnostic repair of neural cyberware and mechanical prosthetics.",
      techLevel: "TL 3+",
      metaLevel: null,
      gameMechanics: "Standard check DC 15 to calibrate; DC 20 to install node socket; DC 25 to repair severe neural damage.",
      notes: "Governing attribute: Intelligence. Synergizes with Medicine and Electronics."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT D: DISADVANTAGE PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'disadvantages',
    code: 'PROMPT D',
    label: 'Disadvantages',
    matrixId: 'disadvantages',
    targetCollection: 'disadvantages',
    icon: AlertOctagon,
    color: '#ef4444',
    description: 'Parse character flaws, social stigmas, physical impairments, and mental afflictions with CP/BP refund tracking.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX DISADVANTAGE PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Disadvantages" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every disadvantage must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the disadvantage)",
    "description": "String (The flavorful description of the disadvantage)",
    "techLevel": "String or null (If applicable)",
    "metaLevel": "String or null (If applicable)",
    "prerequisites": "String or null (List of required stats, skills, features, or disadvantages to take this)",
    "modifiers": "String or null (A brief summary of the mechanical numeric penalties or effects)",
    "cpRefunded": "String (The amount of Character Points/Build Points refunded, e.g., '10 CP')",
    "gameMechanics": "String (The detailed rules of how the disadvantage affects play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, prerequisites, modifiers, or notes (do not use string "null").
2. **Data Separation:** Separate flavor (\`description\`) from rules (\`gameMechanics\`). Summarize numeric penalties in \`modifiers\`.
3. **CP Refunded:** Map the Character Point/Build Point refund value directly to \`cpRefunded\`.
4. **Clean Formatting:** Escape strings properly and remove markdown bold/italics from inside JSON string values.
5. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW DISADVANTAGE TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'techLevel', 'metaLevel', 'prerequisites',
      'modifiers', 'cpRefunded', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Neural Feedback Vulnerability",
      description: "Severe physiological sensitivity to electronic warfare pulses and psionic shock.",
      techLevel: "TL 3+",
      metaLevel: null,
      prerequisites: "Must have at least 2 cybernetic implants",
      modifiers: "-4 to saves vs EMP and Psionic Overload",
      cpRefunded: "10 CP",
      gameMechanics: "Whenever subject takes electric or psionic damage, roll Willpower save DC 15 or become stunned for 1 round.",
      notes: "Can be alleviated with Faraday cranial plating."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT E: FACTION PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'factions',
    code: 'PROMPT E',
    label: 'Factions & Societies',
    matrixId: 'factions',
    targetCollection: 'factions',
    icon: Building,
    color: '#3b82f6',
    description: 'Structured ingestion of rich narrative, sociological, economic, military, and visual semiotic faction data across 38 standardized fields.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX FACTION PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character 'Factions' from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every faction must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the faction)",
    "description": "String (The flavorful description of the faction)",
    "society": "String or null (Description of the faction's society)",
    "prerequisites": "String or null (Prerequisites to join or associate with the faction)",
    "attributeModifiers": "String or null (Inherent or bonus pool attribute modifiers)",
    "skillModifiers": "String or null (Inherent or bonus pool skill modifiers)",
    "featureModifiers": "String or null (Inherent or bonus pool feature modifiers)",
    "disciplinesAndSpecialAbilities": "String or null (Disciplines and special abilities associated with the faction)",
    "modifiers": "String or null (Other mechanical modifiers or penalties)",
    "attitude": "String or null (The overall attitude or behavioral guidelines of the faction)",
    "goals": "String or null (The goals and objectives of the faction)",
    "socialStrengths": "String or null (Social strengths of the faction)",
    "socialWeaknesses": "String or null (Social weaknesses of the faction)",
    "socialArchetype": "String or null (The social archetype classification)",
    "techLevel": "String or null (Technical/Technology level of the faction)",
    "metaLevel": "String or null (Meta/Power level of the faction)",
    "wealthModifiers": "String or null (Wealth or credit-related modifiers)",
    "colloquialisms": "String or null (Slang, jargon, or common terms used by the faction)",
    "symbolSigil": "String or null (Description of the faction's symbol or sigil)",
    "drivingMandate": "String or null (The faction's core driving mandate)",
    "motto": "String or null (The faction's official motto)",
    "coreBeliefs": "String or null (The core philosophy or beliefs of the faction)",
    "socialStructure": "String or null (The social structure or hierarchy)",
    "viewOfOutsiders": "String or null (How the faction views and treats non-members)",
    "lawAndOrder": "String or null (The level and nature of law, order, and discipline)",
    "governmentType": "String or null (Type of government or administration)",
    "leadership": "String or null (How leadership is structured or who the current leaders are)",
    "succession": "String or null (How power or leadership is passed on)",
    "primaryExports": "String or null (Major goods, services, or resources exported)",
    "economicModel": "String or null (The type of economy or financial system)",
    "militaryDoctrine": "String or null (The military philosophy and strategies)",
    "keyUnits": "String or null (Prominent or special units within their military/organization)",
    "navalAssets": "String or null (Naval, space fleet, or vehicular assets)",
    "designLanguage": "String or null (Aesthetic design principles for their gear and technology)",
    "architecture": "String or null (The architectural style of their buildings and stations)",
    "gearAesthetic": "String or null (The visual style of their gear, armor, and weapons)",
    "lightingMood": "String or null (The characteristic lighting and atmosphere of their spaces)",
    "imagePrompt": "String or null (An AI art prompt to visually represent the faction)",
    "gameMechanicsAndNotes": "String or null (Rules mechanics, system notes, or table-specific details)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, prerequisites, modifiers, or attributes (do not use string 'null').
2. **Data Separation:** Keep cultural, political, and world-building details separated strictly into their respective fields.
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line string values using \\n if necessary, and remove markdown bold/italics. No LaTeX syntax.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW FACTIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'society', 'prerequisites', 'attributeModifiers',
      'skillModifiers', 'featureModifiers', 'disciplinesAndSpecialAbilities', 'modifiers',
      'attitude', 'goals', 'socialStrengths', 'socialWeaknesses', 'socialArchetype',
      'techLevel', 'metaLevel', 'wealthModifiers', 'colloquialisms', 'symbolSigil',
      'drivingMandate', 'motto', 'coreBeliefs', 'socialStructure', 'viewOfOutsiders',
      'lawAndOrder', 'governmentType', 'leadership', 'succession', 'primaryExports',
      'economicModel', 'militaryDoctrine', 'keyUnits', 'navalAssets', 'designLanguage',
      'architecture', 'gearAesthetic', 'lightingMood', 'imagePrompt', 'gameMechanicsAndNotes'
    ],
    sampleItem: {
      name: "Aegis Directorate",
      description: "A high-tech paramilitary security syndicate governing several core trade jump-gates.",
      society: "Militaristic Meritocracy",
      prerequisites: "Tactics 4+, Law 2+",
      attributeModifiers: "+1 Int, +1 End",
      skillModifiers: "+10 Tactics, +5 Firearms",
      featureModifiers: "Security Clearance Tier 2",
      disciplinesAndSpecialAbilities: null,
      modifiers: "+2 to Law and Diplomacy checks with Corporate factions",
      attitude: "Disciplined, cautious, contract-bound",
      goals: "Maintain unconditional control over orbital trade corridors",
      socialStrengths: "Unmatched logistics and legal protection",
      socialWeaknesses: "Bureaucratic inertia and rigid protocol",
      socialArchetype: "Militaristic",
      techLevel: "4",
      metaLevel: "0",
      wealthModifiers: "+2 Wealth Score",
      colloquialisms: "Clearance-bound, Black-tape, Gate-keeper",
      symbolSigil: "A stylized geometric bastion shield with an orbital vector ring",
      drivingMandate: "Securing the conduits of civilization through precision enforcement",
      motto: "Vigilance is the First Duty",
      coreBeliefs: "Order precedes prosperity; chaos is an economic liability",
      socialStructure: "Tiered executive council commanding field marshals and sector directors",
      viewOfOutsiders: "Untrusted contractors until verified by biometrics",
      lawAndOrder: "Extremely strict martial code with instant biometric tribunal",
      governmentType: "Corporate Martial Directory",
      leadership: "High Director Vance Thorne and the Directorate Board",
      succession: "Meritocratic board appointment based on operational efficiency",
      primaryExports: "Security frames, jump-gate enforcement, tactical logistics",
      economicModel: "Corporate Mercantilism with automated toll levies",
      militaryDoctrine: "Rapid orbital drop-pod deployment combined with autonomous defense grids",
      keyUnits: "Aegis Gatewardens, Orbital Valkyrie Drop Teams",
      navalAssets: "Aegis Bastion-Class Battle Cruisers and automated patrol corvettes",
      designLanguage: "Hexagonal matte black armor, hazard amber warning glyphs, chamfered steel",
      architecture: "Brutalist void stations with heavy angular blast shielding",
      gearAesthetic: "Heavy modular exosuits with integrated biometric transponders",
      lightingMood: "Deep industrial amber emergency lighting contrasting cool slate blues",
      imagePrompt: "Sci-fi corporate security officer in heavy black and amber powered armor, standing inside a massive orbital space station command deck",
      gameMechanicsAndNotes: "Members gain automatic access to Directorate munitions at a 20% discount."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT F: OCCUPATION PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'occupations',
    code: 'PROMPT F',
    label: 'Occupations',
    matrixId: 'occupations',
    targetCollection: 'occupations',
    icon: Briefcase,
    color: '#f97316',
    description: 'Parse character occupational archetypes, skill bonuses, inherent traits, and career prerequisites.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX OCCUPATION PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Occupations" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every occupation must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the occupation)",
    "description": "String (The flavorful description of the occupation)",
    "prerequisites": "String or null (Prerequisites required to enter the occupation)",
    "trait": "String or null (Unique biological, physical, or behavioral traits associated with this occupation)",
    "attributeModifiers": "String or null (Inherent or bonus pool attribute modifiers)",
    "skillModifiers": "String or null (Inherent or bonus pool skill modifiers)",
    "featureModifiers": "String or null (Inherent or bonus pool feature modifiers)",
    "disciplinesAndSpecialAbilities": "String or null (Disciplines and special abilities associated with the occupation)",
    "modifiers": "String or null (Other mechanical modifiers or penalties)",
    "gameMechanics": "String (The detailed rules of how the occupation affects play)",
    "techLevel": "String or null (Technical/Technology level of the occupation)",
    "metaLevel": "String or null (Meta/Power level of the occupation)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, prerequisites, modifiers, traits, or attributes (do not use string 'null').
2. **Data Separation:** Keep cultural, narrative, and mechanical details separated strictly into their respective fields. Separate flavor (\`description\`) from rules (\`gameMechanics\`).
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line string values using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW OCCUPATIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'prerequisites', 'trait', 'attributeModifiers',
      'skillModifiers', 'featureModifiers', 'disciplinesAndSpecialAbilities',
      'modifiers', 'gameMechanics', 'techLevel', 'metaLevel', 'notes'
    ],
    sampleItem: {
      name: "Void Salvager",
      description: "Hardened zero-G specialists who recover derelict starships and high-tech salvage in deep space.",
      prerequisites: "Agi 11+, Zero-G Movement 3+",
      trait: "Adapted to Low-G decompression",
      attributeModifiers: "+1 Agi, +1 End",
      skillModifiers: "+10 Zero-G Operations, +10 Heavy Machinery",
      featureModifiers: "Debris Sight, Vacuum Tolerance",
      disciplinesAndSpecialAbilities: null,
      modifiers: "+2 to salvage appraisal and cutting torch DC",
      gameMechanics: "Ignores disorientation penalties when operating in zero-gravity environments.",
      techLevel: "3",
      metaLevel: "0",
      notes: "Starts with standard EVA suit and plasma cutting rig."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT G: INVOCATIONS & SPECIAL ABILITIES PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'invocations',
    code: 'PROMPT G',
    label: 'Invocations & Special Abilities',
    matrixId: 'invocation',
    targetCollection: 'invocations',
    icon: Zap,
    color: '#a855f7',
    description: 'Parse psionic invocations, metaphysical powers, disciplines, casting times, critical success/failure effects, and strain costs.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX INVOCATIONS & SPECIAL ABILITIES PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing "Invocations & Special Abilities" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every invocation must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the invocation or ability)",
    "description": "String (The flavorful description)",
    "discipline": "String or null (Associated discipline)",
    "metaSkill": "String or null (Associated meta skill)",
    "area": "String or null (Area of effect)",
    "effect": "String or null (Description of the effect)",
    "range": "String or null (Range of the ability)",
    "target": "String or null (Target of the ability)",
    "prerequisites": "String or null (List of required stats, skills, or features)",
    "modifiers": "String or null (Summary of mechanical numeric modifiers)",
    "criticalSuccessEffect": "String or null (Effect on critical success)",
    "criticalFailureEffect": "String or null (Effect on critical failure)",
    "designDC": "String or null (Design Difficulty Class)",
    "gameMechanics": "String (Detailed rules of the ability)",
    "techLevel": "String or null (Technical level)",
    "metaLevel": "String or null (Meta level)",
    "actionCost": "String or null (Cost in actions)",
    "castTime": "String or null (Casting time)",
    "duration": "String or null (Duration of the effect)",
    "strainFocusCost": "String or null (Cost in strain or focus)",
    "notes": "String or null (Any additional edge cases or restrictions)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing fields (do not use string "null").
2. **Data Separation:** Keep narrative descriptions separate from rules mechanics.
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW INVOCATIONS/ABILITIES TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'discipline', 'metaSkill', 'area', 'effect',
      'range', 'target', 'prerequisites', 'modifiers', 'criticalSuccessEffect',
      'criticalFailureEffect', 'designDC', 'gameMechanics', 'techLevel',
      'metaLevel', 'actionCost', 'castTime', 'duration', 'strainFocusCost', 'notes'
    ],
    sampleItem: {
      name: "Quantum Warp Lance",
      description: "A focused beam of spacetime distortion that pierces kinetic and thermal barriers.",
      discipline: "spatial_distortion",
      metaSkill: "Metaphysics",
      area: "Line (5ft wide, 60ft long)",
      effect: "Kinetic & Spacetime tearing",
      range: "60 ft",
      target: "All targets in line",
      prerequisites: "ML 2+, Spatial Attunement",
      modifiers: "+4 to armor penetration",
      criticalSuccessEffect: "Target armor is bypassed entirely and target is displaced 10ft backwards.",
      criticalFailureEffect: "Caster suffers 1d6 Strain damage and becomes disoriented for 1 round.",
      designDC: "18",
      gameMechanics: "Deals 3d8 Force damage to all creatures in the line. Reflex save DC 16 for half damage.",
      techLevel: "0",
      metaLevel: "2",
      actionCost: "2 AP",
      castTime: "Standard Action",
      duration: "Instantaneous",
      strainFocusCost: "3 Strain",
      notes: "Ignores conventional energy shields."
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
    color: '#06b6d4',
    description: 'Parse cybernetic implants, bioware upgrades, nanite systems, node/socket budgets, and surgical difficulty classes.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX AUGMENTATIONS PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Augmentations" from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every augmentation must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the augmentation)",
    "augmentationCategory": "String or null (e.g., Cybernetics, Bioware, Nanotech)",
    "location": "String or null (Anatomical slot or location, e.g., 'Head' or 'Arms')",
    "description": "String (The flavorful description)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "nodeCost": "String or null (Node cost if applicable)",
    "socketCost": "String or null (Socket cost if applicable)",
    "nodeOrSocket": "String or null (Node / socket status)",
    "bpCost": "String or null (BP or Build Point cost)",
    "structurePoints": "String or null (Structure points adjustment)",
    "damageResist": "String or null (Damage resistance modifiers)",
    "stigma": "String or null (Social stigma or physical changes)",
    "craftingDC": "String or null (Crafting Difficulty Class)",
    "classification": "String or null (Classification type)",
    "creator": "String or null (Manufacturer, creator, or origin faction)",
    "design": "String or null (Design and visual appearance)",
    "component": "String or null (Required components or parts)",
    "prerequisites": "String or null (List of required stats, skills, other augmentations, or features)",
    "modifiers": "String or null (A brief summary of mechanical numeric bonuses or penalties)",
    "criticalSuccessEffect": "String or null (Effect on critical success during installation/use)",
    "criticalFailureEffect": "String or null (Effect on critical failure during installation/use)",
    "gameMechanics": "String (The detailed rules of how the augmentation affects play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, prerequisites, modifiers, costs, or effects (do not use string "null").
2. **Data Separation:** Separate flavor (\`description\`) and visual cues (\`design\`) from rules (\`gameMechanics\`).
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW AUGMENTATIONS TEXT HERE]`,
    expectedKeys: [
      'name', 'augmentationCategory', 'location', 'description', 'techLevel',
      'metaLevel', 'nodeCost', 'socketCost', 'nodeOrSocket', 'bpCost',
      'structurePoints', 'damageResist', 'stigma', 'craftingDC', 'classification',
      'creator', 'design', 'component', 'prerequisites', 'modifiers',
      'criticalSuccessEffect', 'criticalFailureEffect', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Reflex Velocity Coprocessor",
      augmentationCategory: "Cybernetics",
      location: "Head",
      description: "Sub-cranial neural coprocessor that intercepts spinal signals to accelerate combat reaction speed.",
      techLevel: "3",
      metaLevel: "0",
      nodeCost: "10 Nodes",
      socketCost: "1 Socket",
      nodeOrSocket: "Node",
      bpCost: "2 BP",
      structurePoints: "+5 SP",
      damageResist: "+0 DR",
      stigma: "Minor (Subtle metallic nape port)",
      craftingDC: "20",
      classification: "Neural Acceleration",
      creator: "Syndicate Cybernetics",
      design: "Gold-plated micro-bus visible behind the left ear",
      component: "Neural lace, superconducting bus",
      prerequisites: "Endurance 10+",
      modifiers: "+2 Initiative, +1 Reaction Defense",
      criticalSuccessEffect: "User gains 1 bonus reaction per combat encounter.",
      criticalFailureEffect: "Neural overload causes 2d6 bio-shock damage and migraines.",
      gameMechanics: "Provides +2 to all Initiative rolls and allows dodging as an immediate reaction with +1 bonus.",
      notes: "Compatible with Cyber-Eyes and Smart-Link optics."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT I: GEAR PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'gear',
    code: 'PROMPT I',
    label: 'Gear & Equipment',
    matrixId: 'equipment',
    targetCollection: 'gear',
    icon: Package,
    color: '#eab308',
    description: 'Parse field equipment, survival tools, electronics, scanners, and kits with socket counts, EPR ratings, and supply dice.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX GEAR PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Gear" (equipment, weapons, tools, armor, etc.) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every gear item must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the gear)",
    "gearCategory": "String or null (e.g., Weapons, Armor, Tools, Electronics)",
    "sizeCategory": "String or null (e.g., Small, Medium, Large)",
    "manufacturer": "String or null (Origin company, faction, or creator)",
    "baseDC": "String or null (Base Difficulty Class for use)",
    "craftingDC": "String or null (Difficulty Class to construct or repair)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "creditCost": "String or null (Value in credits, e.g., '150 Credits')",
    "weight": "String or null (Weight, e.g., '2 lbs' or 'Light')",
    "totalSockets": "String or null (Number of total sockets for upgrades)",
    "structurePoints": "String or null (Structure points adjustment)",
    "damageResist": "String or null (Damage resistance modifiers)",
    "workspaceScale": "String or null (Workspace scale category if applicable)",
    "processorRating": "String or null (Rating of electronic/computing gear)",
    "softwareLevel": "String or null (Level of software programs/OS if applicable)",
    "eprRating": "String or null (Environmental Protection Rating)",
    "supplyDie": "String or null (Supply rating/die size, e.g., 'd6')",
    "metaTechType": "String or null (Classification of meta-tech)",
    "invocationRank": "String or null (Rank of tied magical/psychic abilities)",
    "socketsUsed": "String or null (Number of sockets occupied natively)",
    "scaleTier": "String or null (Scale tier, e.g., 'Personal' or 'Vehicle')",
    "dailyCharges": "String or null (Number of uses/charges per day)",
    "passiveEnhancements": "String or null (Passive bonuses granted by carrying/wearing)",
    "description": "String (The flavorful description)",
    "availability": "String or null (Legality, rarity, or availability code)",
    "prerequisites": "String or null (Requirements to use or equip)",
    "modifiers": "String or null (A brief summary of mechanical numeric bonuses or penalties)",
    "gameMechanics": "String (The detailed rules of how the gear functions in play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, costs, weights, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor (\`description\`) from rules (\`gameMechanics\`). Summarize passive benefits in \`passiveEnhancements\` and numeric bonuses in \`modifiers\`.
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW GEAR TEXT HERE]`,
    expectedKeys: [
      'name', 'gearCategory', 'sizeCategory', 'manufacturer', 'baseDC', 'craftingDC',
      'techLevel', 'metaLevel', 'creditCost', 'weight', 'totalSockets', 'structurePoints',
      'damageResist', 'workspaceScale', 'processorRating', 'softwareLevel', 'eprRating',
      'supplyDie', 'metaTechType', 'invocationRank', 'socketsUsed', 'scaleTier',
      'dailyCharges', 'passiveEnhancements', 'description', 'availability', 'prerequisites',
      'modifiers', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Omnidirectional Spectral Scanner",
      gearCategory: "Electronics",
      sizeCategory: "Small",
      manufacturer: "Horizon Sensing Group",
      baseDC: "15",
      craftingDC: "15",
      techLevel: "3",
      metaLevel: "0",
      creditCost: "640 Credits",
      weight: "1.5 kg",
      totalSockets: "4",
      structurePoints: "10",
      damageResist: "2",
      workspaceScale: "Belt",
      processorRating: "2",
      softwareLevel: "1",
      eprRating: "2",
      supplyDie: "d6",
      metaTechType: null,
      invocationRank: null,
      socketsUsed: "1",
      scaleTier: "Personal",
      dailyCharges: "20",
      passiveEnhancements: "+2 Perception vs hidden items",
      description: "Handheld sensory array capable of infrared, electromagnetic, and life-sign detection.",
      availability: "Common",
      prerequisites: "Perception 10+",
      modifiers: "+2 to Scan & Investigate checks",
      gameMechanics: "Provides active 360-degree detection up to 100 meters through light barriers.",
      notes: "Battery life lasts 8 hours on continuous scanning."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT J: WEAPONRY PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'weaponry',
    code: 'PROMPT J',
    label: 'Weaponry',
    matrixId: 'weaponry',
    targetCollection: 'weaponry',
    icon: Crosshair,
    color: '#ef4444',
    description: 'Parse tactical firearms, melee weapons, heavy ordnance, damage profiles, armor penetration (AP), and firing modes.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX WEAPONRY PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Weaponry" (weapons, firearms, melee weapons, etc.) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every weapon must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the weapon)",
    "description": "String (The flavorful description)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "cost": "String or null (Value in credits, e.g., '500 Credits')",
    "availability": "String or null (Legality, rarity, or availability code)",
    "designDC": "String or null (Difficulty Class to design/craft)",
    "size": "String or null (e.g., Small, Medium, Large)",
    "weight": "String or null (Weight, e.g., '4 lbs')",
    "quality": "String or null (e.g., Standard, Exceptional)",
    "durability": "String or null (Durability rating or stats)",
    "prerequisites": "String or null (Requirements to use or equip)",
    "skill": "String or null (Required governing skill, e.g., 'Rifles')",
    "special": "String or null (Special weapon properties or rules)",
    "area": "String or null (Area of effect if applicable)",
    "effect": "String or null (Primary hit effects)",
    "range": "String or null (Range bands, e.g., '50/100/300')",
    "target": "String or null (Target restrictions or types)",
    "origin": "String or null (Faction or planetary origin)",
    "creator": "String or null (Manufacturer or designer company)",
    "classification": "String or null (Weapon group classification)",
    "damage": "String or null (Damage rating/die, e.g., '3d6')",
    "damageType": "String or null (Type of damage, e.g., 'Thermal', 'Kinetic')",
    "critical": "String or null (Critical parameters)",
    "penetration": "String or null (Armor penetration rating)",
    "ammunitionCapacity": "String or null (Ammo capacity and type, e.g., '30 (Cell)')",
    "powerSource": "String or null (Power source/battery type)",
    "sockets": "String or null (Number of modular sockets)",
    "weaponDowngrades": "String or null (Inherent or potential downgrades)",
    "factionSkin": "String or null (Faction aesthetic modifications or variants)",
    "modules": "String or null (Compatible or pre-installed modules)",
    "design": "String or null (Visual aesthetic and ergonomics description)",
    "accuracy": "String or null (Accuracy modifier or rating)",
    "modes": "String or null (Firing modes, e.g., 'Single', 'Burst', 'Auto')",
    "rateOfFire": "String or null (Rate of fire stats)",
    "criticalScore": "String or null (Required roll for critical, e.g., '19-20')",
    "criticalEffect": "String or null (Narrative effect on critical hit)",
    "criticalSuccessEffect": "String or null (Mechanical critical success effects)",
    "criticalFailureEffect": "String or null (Mechanical critical failure/fumble effects)",
    "wielding": "String or null (Hands required, e.g., '1-Handed' or '2-Handed')",
    "components": "String or null (Integrated components)",
    "componentSlots": "String or null (Available component slots)",
    "modifiers": "String or null (Summary of mechanical numeric bonuses or penalties)",
    "gameMechanics": "String (The detailed rules of how the weapon functions in play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON \`null\` for missing levels, prerequisites, modifiers, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor ("description", "design") from rules ("gameMechanics"). Summarize numeric bonuses/penalties in "modifiers".
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW WEAPONRY TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'techLevel', 'metaLevel', 'cost', 'availability',
      'designDC', 'size', 'weight', 'quality', 'durability', 'prerequisites',
      'skill', 'special', 'area', 'effect', 'range', 'target', 'origin',
      'creator', 'classification', 'damage', 'damageType', 'critical',
      'penetration', 'ammunitionCapacity', 'powerSource', 'sockets',
      'weaponDowngrades', 'factionSkin', 'modules', 'design', 'accuracy',
      'modes', 'rateOfFire', 'criticalScore', 'criticalEffect',
      'criticalSuccessEffect', 'criticalFailureEffect', 'wielding', 'components',
      'componentSlots', 'modifiers', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Viper Tactical Plasma Carbine",
      description: "Bullpup energy rifle engineered for shipboard boarding operations and close-quarters suppression.",
      techLevel: "3",
      metaLevel: "0",
      cost: "1280 Credits",
      availability: "Restricted",
      designDC: "18",
      size: "Medium",
      weight: "3.2 kg",
      quality: "Standard",
      durability: "30",
      prerequisites: "Firearms 3+",
      skill: "Rifles",
      special: "Thermal Melt on sustained fire",
      area: null,
      effect: "Superheated plasma burns",
      range: "30/60/120 ft",
      target: "Single Target",
      origin: "Aegis Directorate",
      creator: "Viper Armaments",
      classification: "Ranged (Energy)",
      damage: "3d8",
      damageType: "Thermal",
      critical: "19-20 / x2",
      penetration: "4 AP",
      ammunitionCapacity: "30 (Standard Plasma Cell)",
      powerSource: "Type-3 Energy Cell",
      sockets: "3",
      weaponDowngrades: null,
      factionSkin: "Aegis Matte Black",
      modules: "Smart-Link Holo-Sight, Recoil Compensator",
      design: "Ergonomic thumbhole stock with illuminated ammo readout",
      accuracy: "+1",
      modes: "Single, 3-Round Burst",
      rateOfFire: "3",
      criticalScore: "19-20",
      criticalEffect: "Target armor suffers permanent -2 DR shred.",
      criticalSuccessEffect: "Inflicts 1d6 ongoing burn damage for 2 rounds.",
      criticalFailureEffect: "Plasma coil overheats, weapon disabled for 1 round.",
      wielding: "Two-Handed",
      components: "Magnetic accelerator, plasma focus lens",
      componentSlots: "3",
      modifiers: "+1 Attack with Smart-Link",
      gameMechanics: "Firing in 3-Round burst grants +2 to damage on a successful hit.",
      notes: "Cell replacement requires 1 AP."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT K: ARMORING PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'armoring',
    code: 'PROMPT K',
    label: 'Armoring & Protective Gear',
    matrixId: 'armor',
    targetCollection: 'armoring',
    icon: Shield,
    color: '#f59e0b',
    description: 'Parse tactical armor, powered exoskeletons, hazard suits, shields, DR ratings, coverage zones, and mobility penalties.',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX ARMORING PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Armoring" (armor, suits, shields, protective gear) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every armor item must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the armor/shield)",
    "description": "String (The flavorful description)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "cost": "String or null (Value in credits, e.g., '1000 Credits')",
    "availability": "String or null (Legality, rarity, or availability code)",
    "designDC": "String or null (Difficulty Class to design/craft)",
    "size": "String or null (e.g., Medium, Large)",
    "weight": "String or null (Weight, e.g., '15 lbs')",
    "quality": "String or null (e.g., Standard, Exceptional)",
    "durability": "String or null (Durability rating or stats)",
    "prerequisite": "String or null (Requirements to use or equip)",
    "skill": "String or null (Required governing skill, e.g., 'Armor Proficiency')",
    "origin": "String or null (Faction or planetary origin)",
    "creator": "String or null (Manufacturer or designer company)",
    "design": "String or null (Visual aesthetic and ergonomics description)",
    "classification": "String or null (Armor group classification, e.g., 'Light', 'Heavy')",
    "material": "String or null (Primary composition material, e.g., 'Plasteel')",
    "bodyLocations": "String or null (Body parts covered, e.g., 'Full Body', 'Torso')",
    "modules": "String or null (Compatible or pre-installed modules)",
    "coverage": "String or null (Protection coverage rating/type)",
    "maxDexBonus": "String or null (Maximum dexterity/agility bonus allowed)",
    "mobilityPenalty": "String or null (Movement or skill penalties from wearing)",
    "factionSkin": "String or null (Faction aesthetic modifications or variants)",
    "armorDowngrades": "String or null (Inherent or potential downgrades)",
    "carriedShield": "String or null (Shield-specific properties if applicable)",
    "category": "String or null (e.g., Shield, Powered Armor, Environmental Suit)",
    "resistance": "String or null (Damage resistances or environmental protections)",
    "criticalSuccessEffect": "String or null (Mechanical critical success effects)",
    "criticalFailureEffect": "String or null (Mechanical critical failure/fumble effects)",
    "componentSlots": "String or null (Available component slots)",
    "modes": "String or null (Operational modes, e.g., 'Active', 'Passive')",
    "modifiers": "String or null (Summary of mechanical numeric bonuses or penalties)",
    "gameMechanics": "String (The detailed rules of how the armor functions in play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON null for missing levels, prerequisites, modifiers, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor ("description", "design") from rules ("gameMechanics"). Summarize numeric bonuses/penalties in "modifiers".
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW ARMORING TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'techLevel', 'metaLevel', 'cost', 'availability',
      'designDC', 'size', 'weight', 'quality', 'durability', 'prerequisite',
      'skill', 'origin', 'creator', 'design', 'classification', 'material',
      'bodyLocations', 'modules', 'coverage', 'maxDexBonus', 'mobilityPenalty',
      'factionSkin', 'armorDowngrades', 'carriedShield', 'category', 'resistance',
      'criticalSuccessEffect', 'criticalFailureEffect', 'componentSlots', 'modes',
      'modifiers', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Apex Heavy Carapace Exosuit",
      description: "Powered heavy combat suit constructed of layered ceramite-titanium composite with servomotor assist.",
      techLevel: "3",
      metaLevel: "0",
      cost: "2560 Credits",
      availability: "Military",
      designDC: "20",
      size: "Medium",
      weight: "18 kg",
      quality: "Standard",
      durability: "60",
      prerequisite: "End 12+, Heavy Armor Proficiency",
      skill: "Heavy Armor",
      origin: "Aegis Directorate",
      creator: "Aegis Defense",
      design: "Interlocking angular plates with sealed internal atmospheric circulation",
      classification: "Heavyweight",
      material: "Ceramite Titanium Composite",
      bodyLocations: "Full Body (Head, Torso, Arms, Legs)",
      modules: "Hydraulic Jump Servos, Auto-Injectors",
      coverage: "Reinforced",
      maxDexBonus: "+1",
      mobilityPenalty: "-2",
      factionSkin: "Aegis Matte Slate",
      armorDowngrades: null,
      carriedShield: "None",
      category: "Powered Armor",
      resistance: "DR 12 (Kinetic), DR 8 (Thermal), Vacuum Sealed",
      criticalSuccessEffect: "Deflects incoming kinetic projectile completely.",
      criticalFailureEffect: "Hydraulic lock causes -2 to Agility for 1 round.",
      componentSlots: "4",
      modes: "Standard, Overdrive (+2 Str, high power drain)",
      modifiers: "+2 Strength checks, -2 Stealth checks",
      gameMechanics: "Absorbs 12 kinetic and 8 thermal damage before applying to HP. Provides full vacuum and toxic hazard protection for 24 hours.",
      notes: "Requires 1 Standard Power Cell every 24 hours."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT L: MECHA PARSER
  // ─────────────────────────────────────────────────────────────────────────────
  {
    key: 'mecha',
    code: 'PROMPT L',
    label: 'Mecha & Heavy Frames',
    matrixId: 'mecha',
    targetCollection: 'mecha',
    icon: Bot,
    color: '#f59e0b',
    description: 'Parse piloted battle frames, combat walkers, dropships, hardpoints, propulsion systems, and variable form technology (VFT).',
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX MECHA PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Mecha" (frames, giant robots, piloted suits) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every mecha must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the mecha)",
    "operationDomain": "String or null (e.g., Space, Atmospheric, Amphibious, Ground)",
    "sizeCategory": "String or null (e.g., Light, Medium, Heavy, Colossal)",
    "bodyType": "String or null (e.g., Bipedal, Quadrupedal, Treaded, Vehicular)",
    "manufacturer": "String or null (Origin company, faction, or creator)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "creditCost": "String or null (Value in credits, e.g., '120,000 Credits')",
    "craftingDC": "String or null (Difficulty Class to design, build, or repair)",
    "structurePoints": "String or null (Structure points adjustment)",
    "damageResist": "String or null (Damage resistance modifiers)",
    "totalMounts": "String or null (Available hardpoints/weapon mounts, e.g., '2 Shoulder, 2 Arm')",
    "primaryPropulsion": "String or null (Propulsion system, e.g., 'Fusion Thrusters', 'Heavy Treads')",
    "armorPlating": "String or null (Type of integrated armor plating)",
    "installedModules": "String or null (Pre-installed software, utility, or support modules)",
    "coreComponents": "String or null (Essential engine, reactor, or cockpit specs)",
    "variableForm": "String or null (Details of transformation modes if applicable)",
    "pilotMod": "String or null (Modifiers applied to the pilot's attributes/skills)",
    "handlingMod": "String or null (Handling, maneuverability, or steering modifiers)",
    "description": "String (The flavorful description)",
    "availability": "String or null (Legality, rarity, or availability code)",
    "prerequisites": "String or null (Requirements to pilot, equip, or construct)",
    "modifiers": "String or null (A brief summary of mechanical numeric bonuses or penalties)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON null for missing levels, prerequisites, modifiers, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor ("description") from rules ("notes", "installedModules"). Summarize numeric bonuses/penalties in "modifiers".
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW MECHA TEXT HERE]`,
    expectedKeys: [
      'name', 'operationDomain', 'sizeCategory', 'bodyType', 'manufacturer',
      'techLevel', 'metaLevel', 'creditCost', 'craftingDC', 'structurePoints',
      'damageResist', 'totalMounts', 'primaryPropulsion', 'armorPlating',
      'installedModules', 'coreComponents', 'variableForm', 'pilotMod',
      'handlingMod', 'description', 'availability', 'prerequisites', 'modifiers', 'notes'
    ],
    sampleItem: {
      name: "Vanguard Mk-VI Stryker Frame",
      operationDomain: "Ground / Atmospheric Drop",
      sizeCategory: "Medium",
      bodyType: "Bipedal Walker",
      manufacturer: "Ironclad Industrial FrameWorks",
      techLevel: "3",
      metaLevel: "0",
      creditCost: "40,960 Credits",
      craftingDC: "30",
      structurePoints: "150 SP",
      damageResist: "DR 15",
      totalMounts: "2 Shoulder Hardpoints, 2 Arm Mounts",
      primaryPropulsion: "Bipedal Myomer Legs with Vector Thrusters",
      armorPlating: "Reinforced Plasteel Reactive Armor",
      installedModules: "Fire-Control Sensor Suite, ECM Jammer",
      coreComponents: "Compact Fusion Reactor (Rating 4), Sealed Cockpit",
      variableForm: "None",
      pilotMod: "+2 Gunnery, +1 Sensor Ops",
      handlingMod: "+0 Handling",
      description: "Agile medium assault frame optimized for urban fire support and breach tactics.",
      availability: "Military / Mercenary License",
      prerequisites: "Mecha Operation 3+, Gunnery 2+",
      modifiers: "+15 Base Speed on flat terrain",
      notes: "Includes auto-eject capsule for the pilot."
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

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing character "Architecture" (structures, buildings, bases, outposts) from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every architecture must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the architecture/structure)",
    "architecturalStyle": "String or null (e.g., Brutalist, Gothic, High-Tech)",
    "footprintSize": "String or null (Footprint size or area)",
    "heightClass": "String or null (e.g., Low-Rise, Sky-Scraper)",
    "stories": "String or null (Number of stories or levels)",
    "frameConfiguration": "String or null (Frame configuration and structure materials)",
    "environmentalModifiers": "String or null (Environmental protections or modifiers)",
    "mobilityPropulsion": "String or null (Mobility or propulsion systems if mobile)",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "creditCost": "String or null (Value in credits)",
    "structurePoints": "String or null (Structure points adjustment)",
    "damageResist": "String or null (Damage resistance modifiers)",
    "totalModules": "String or null (Total module slots or capacity)",
    "craftingDC": "String or null (Difficulty Class to design, build, or repair)",
    "securityLevel": "String or null (Integrated security rating or level)",
    "primaryPurpose": "String or null (Primary purpose or function)",
    "description": "String (The flavorful description)",
    "installedFacilities": "String or null (Details of integrated facilities or modules)",
    "installedHardpoints": "String or null (Defense hardpoints or weapon mounts)",
    "coreInternals": "String or null (Reactor, life support, or engine specifications)",
    "prerequisites": "String or null (Requirements to build, acquire, or occupy)",
    "modifiers": "String or null (A brief summary of mechanical numeric bonuses or penalties)",
    "gameMechanics": "String (The detailed rules of how the architecture functions in play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON null for missing levels, prerequisites, modifiers, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor ("description", "architecturalStyle") from rules ("gameMechanics"). Summarize numeric bonuses/penalties in "modifiers".
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW ARCHITECTURE TEXT HERE]`,
    expectedKeys: [
      'name', 'architecturalStyle', 'footprintSize', 'heightClass', 'stories',
      'frameConfiguration', 'environmentalModifiers', 'mobilityPropulsion',
      'techLevel', 'metaLevel', 'creditCost', 'structurePoints', 'damageResist',
      'totalModules', 'craftingDC', 'securityLevel', 'primaryPurpose',
      'description', 'installedFacilities', 'installedHardpoints', 'coreInternals',
      'prerequisites', 'modifiers', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Aegis Spire Orbital Station",
      architecturalStyle: "Cyber-Industrial",
      footprintSize: "Colossal",
      heightClass: "Skyscraper",
      stories: "120",
      frameConfiguration: "Reinforced Titanium Spaceframe with Magnetic Clamps",
      environmentalModifiers: "Vacuum Sealed, Radiation Shielded",
      mobilityPropulsion: "Orbital Station-Keeping Thrusters",
      techLevel: "4",
      metaLevel: "0",
      creditCost: "5,000,000 Credits",
      structurePoints: "10,000 SP",
      damageResist: "DR 30",
      totalModules: "32 Modules",
      craftingDC: "35",
      securityLevel: "High Security (Tier 3)",
      primaryPurpose: "Trade Nexus and Orbital Defense Citadel",
      description: "A colossal modular space station serving as the gateway to the primary jump-gate.",
      installedFacilities: "Automated Drydock, Hydroponics Bay, Quantum Sensor Array, Medical Trauma Core",
      installedHardpoints: "8 Heavy Railgun Turrets, 12 Point Defense Lasers",
      coreInternals: "Dual Tokamak Fusion Cores with Redundant Cryo Coolant Loops",
      prerequisites: "Corporate Sovereignty License",
      modifiers: "+4 to sensor detection across orbital perimeter",
      gameMechanics: "Provides docking berths for up to 20 starships with automated repair cycles.",
      notes: "Maintains independent artificial gravity at 1.0G."
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
    promptText: `# SYSTEM INSTRUCTIONS: OMNICORTEX OTHER PARSER

**ROLE:** You are an expert data engineer and RPG system archivist. Your job is to parse raw, unformatted RPG rulebook text into a strict, clean JSON schema optimized for a NoSQL Firebase/Firestore database.

**TASK:** I will provide you with raw text detailing miscellaneous items, general rules, or "Other" entities from the Tangent SF RP system. You must extract this information and output a perfectly formatted JSON array of objects.

**JSON SCHEMA:**
Every item must strictly adhere to the following schema. Do not add or remove keys.

[
  {
    "name": "String (Name of the item/entity)",
    "description": "String (The flavorful description)",
    "cost": "String or null (Value in credits, e.g., '50 Credits')",
    "weight": "String or null (Weight description, e.g., '1 lb')",
    "techLevel": "String or null (Technical/Technology level)",
    "metaLevel": "String or null (Meta/Power level)",
    "availability": "String or null (Legality, rarity, or availability code)",
    "prerequisites": "String or null (Requirements to use, equip, or acquire)",
    "modifiers": "String or null (A brief summary of mechanical numeric bonuses or penalties)",
    "gameMechanics": "String (The detailed rules of how it functions in play)",
    "notes": "String or null (Any additional edge cases, restrictions, or table notes)"
  }
]

**PARSING HEURISTICS & RULES:**
1. **Null Values:** Use JSON null for missing levels, prerequisites, modifiers, ratings, or stats (do not use string "null").
2. **Data Separation:** Separate flavor ("description") from rules ("gameMechanics"). Summarize numeric bonuses/penalties in "modifiers".
3. **Clean Formatting:** Escape strings properly, preserve paragraph structures as single-line strings using \\n if necessary, and remove markdown bold/italics. No LaTeX.
4. **Output Requirement:** Output ONLY the valid JSON block.

**INPUT TEXT:**
[INSERT RAW OTHER TEXT HERE]`,
    expectedKeys: [
      'name', 'description', 'cost', 'weight', 'techLevel', 'metaLevel',
      'availability', 'prerequisites', 'modifiers', 'gameMechanics', 'notes'
    ],
    sampleItem: {
      name: "Emergency Atmospheric Scrubbing Canister",
      description: "Pressurized chemical canister that neutralizes toxic air and restores breathable oxygen in sealed compartments.",
      cost: "75 Credits",
      weight: "0.8 kg",
      techLevel: "2",
      metaLevel: "0",
      availability: "Everywhere",
      prerequisites: "None",
      modifiers: "Neutralizes ambient toxic gas within 1 round",
      gameMechanics: "Cleanses up to 500 cubic feet of toxic air for 4 hours.",
      notes: "Single-use disposable unit."
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

    // Check for missing expected keys
    const itemKeys = Object.keys(item);
    const missingKeys = dataset.expectedKeys.filter(k => !itemKeys.includes(k));
    if (missingKeys.length > 0) {
      warnings.push(`Item "${item.name}" is missing ${missingKeys.length} schema fields (${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}).`);
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
