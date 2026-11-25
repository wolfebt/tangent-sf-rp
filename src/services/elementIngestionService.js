/**
 * Tangent SF RP - Element File Ingestion & Serialization Service
 * Implements 1-to-1 parity with docs/- ELEMENTS.md for all 9 canonical types:
 * Faction, Persona, Philosophy, Scene, Setting, Species, Technology, Universe, World
 * (plus standard adventure elements: Adventure, Story Arc, Encounter, Item, Clue, Handout, Map).
 */

import { ELEMENT_SCHEMAS, ELEMENT_TYPES, normalizeElementType } from '../pages/Foundry/ElementForge/elementSchemas.js';

// Canonical type mappings from header or key signatures
const TYPE_DETECTION_PATTERNS = [
  { type: 'Faction', regex: /Faction Development Fields|Faction Name/i },
  { type: 'Persona', regex: /Persona Development Fields|Character Portrait|Role in Story|Character Archetype/i },
  { type: 'Metaphysics', regex: /Metaphysics Development Fields|Metaphysics Subcategory|Invocation \/ Discipline \/ Power Name|Governing Meta Skill/i },
  { type: 'Philosophy', regex: /Philosophy Development Fields|Core Tenet & Guiding Question|Guiding Question/i },
  { type: 'Scene', regex: /Scene Development Fields|Scene Title \/ Working Name|Opening Beat & Inciting Event/i },
  { type: 'Setting', regex: /Setting Development Fields|Setting Name|Primary Conflict \/ Tension/i },
  { type: 'Species', regex: /Species Development Fields|Species Name|Homeworld \/ Plane of Origin|Sentience Level/i },
  { type: 'Property', regex: /Property Development Fields|Property Subcategory/i },
  { type: 'Technology', regex: /Technology Development Fields|Technology Name|Core Function & Readiness/i },
  { type: 'Universe', regex: /Universe Development Fields|Universe Name \/ Designation|Ontological Premise/i },
  { type: 'World', regex: /World Development Fields|World Name|Core Premise \/ High Concept/i },
  { type: 'Encounter', regex: /Encounter Type|Setup|Resolution|Mechanics/i },
  { type: 'Item', regex: /Item Category|Rarity|Attunement/i },
  { type: 'Adventure', regex: /Adventure Module|Hook|Stakes/i },
  { type: 'Story Arc', regex: /Story Arc|Key Antagonist/i },
  { type: 'Clue', regex: /Clue|Information Revealed/i },
  { type: 'Handout', regex: /Handout/i },
  { type: 'Custom', regex: /Custom Development Fields|Custom Element|Custom Codex|User Defined Info|Codex Entry/i }
];

// Title field keys across canonical types
const NAME_KEYS = [
  'faction name', 'name', 'character name', 'full name',
  'setting name', 'world name', 'species name', 'technology name',
  'philosophy name', 'invocation / discipline / power name', 'invocation name', 'discipline name',
  'universe name / designation', 'universe name',
  'scene title / working name', 'scene title', 'title', 'element name'
];

/**
 * Normalizes bullet label to camelCase key for element.fields
 */
function normalizeFieldKey(label) {
  return label
    .replace(/[^\w\s]/gi, '')
    .trim()
    .split(/\s+/)
    .map((word, idx) => (idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('');
}

/**
 * Strips raw template instructions (parenthesized e.g. / examples) if no real user data was entered
 */
function cleanFieldValue(rawVal) {
  if (!rawVal) return '';
  const trimmed = rawVal.trim();
  // Check if value is solely in parentheses like "(Include official names and common slang/aliases)" or "(e.g., ...)"
  if (/^\([^)]+\)$/.test(trimmed) && (trimmed.includes('e.g.') || trimmed.includes('Include') || trimmed.includes('Description') || trimmed.includes('How '))) {
    return '';
  }
  return trimmed;
}

/**
 * Parses markdown into structured YAML frontmatter, headers, and bullet field map
 */
export function parseElementMarkdown(markdownContent, fileName = '') {
  if (!markdownContent || typeof markdownContent !== 'string') {
    throw new Error('Invalid markdown content provided to parseElementMarkdown.');
  }

  let text = markdownContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const metadata = {};
  
  // 1. Extract YAML Frontmatter if present
  if (text.startsWith('---')) {
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (fmMatch) {
      const frontmatterBlock = fmMatch[1].trim();
      text = text.slice(fmMatch[0].length).trim();
      const lines = frontmatterBlock.split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const rawVal = line.slice(colonIdx + 1).trim();
          let parsedVal = rawVal.replace(/^['"]|['"]$/g, '');
          if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
            try {
              parsedVal = JSON.parse(rawVal);
            } catch {
              parsedVal = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
          } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
            try {
              parsedVal = JSON.parse(rawVal);
            } catch (_) {
              parsedVal = rawVal.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            }
          }
          metadata[key] = parsedVal;
        }
      }
    }
  }

  // 2. Detect Element Type
  let detectedType = metadata.type || '';
  if (!detectedType) {
    for (const pattern of TYPE_DETECTION_PATTERNS) {
      if (pattern.regex.test(text)) {
        detectedType = pattern.type;
        break;
      }
    }
  }

  // Fallback to filename hints
  if (!detectedType && fileName) {
    const lowerName = fileName.toLowerCase();
    for (const type of ELEMENT_TYPES) {
      if (lowerName.includes(type.toLowerCase())) {
        detectedType = type;
        break;
      }
    }
  }

  if (!detectedType) {
    detectedType = 'Custom';
  }

  // 3. Extract Headings and Bullets
  const lines = text.split('\n');
  const extractedFields = {};
  const rawSections = [];
  let currentSection = 'Overview';
  let extractedName = metadata.name || metadata.title || '';
  let extractedSummary = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section headers (### or ####)
    const sectionMatch = line.match(/^#{2,4}\s+\*{0,2}(?:\d+\\?\.?\s*)?([^*#]+)\*{0,2}/);
    if (sectionMatch && !line.includes('Development Fields')) {
      currentSection = sectionMatch[1].trim();
      rawSections.push({ title: currentSection, line: i });
      continue;
    }

    // Detect bullet key-values: * **Key:** Value or * **Key**: Value
    const bulletMatch = line.match(/^[\*\-]\s+\*\*([^*:]+?):?\*\*:?\s*(.*)$/);
    if (bulletMatch) {
      const label = bulletMatch[1].trim();
      let value = bulletMatch[2].trim();

      // If value is empty or continuation on next line
      const nextTrimmed = i + 1 < lines.length ? lines[i + 1].trim() : '';
      if (!value && nextTrimmed && !nextTrimmed.startsWith('*') && !nextTrimmed.startsWith('#') && !nextTrimmed.startsWith('-')) {
        value = nextTrimmed;
        i++;
      }

      const cleanVal = cleanFieldValue(value);
      const lowerLabel = label.toLowerCase();
      const camelKey = normalizeFieldKey(label);

      // Check if this is the name/title
      if (!extractedName && NAME_KEYS.some(k => lowerLabel.includes(k))) {
        extractedName = cleanVal;
      }

      // Check if this is the core identity/summary
      if (!extractedSummary && (lowerLabel.includes('core identity') || lowerLabel.includes('one-sentence summary') || lowerLabel.includes('high concept'))) {
        extractedSummary = cleanVal;
      }

      // Store in fields
      extractedFields[camelKey] = cleanVal;
      // Also map standard schema aliases
      mapSchemaAliases(detectedType, lowerLabel, cleanVal, extractedFields);
    }
  }

  // Check top header for name if not found in bullets
  if (!extractedName) {
    const topH1 = lines.find(l => l.startsWith('# ') && !l.includes('Development Fields'));
    if (topH1) {
      extractedName = topH1.replace(/^#\s+/, '').replace(/\*\*/g, '').trim();
    }
  }

  // Fallback name from filename
  if (!extractedName && fileName) {
    extractedName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  const parseJsonMeta = (val, fallback) => {
    if (typeof val !== 'string') return val ?? fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  let extractedContent = '';
  const narrativeIdx = lines.findIndex((l) => /^###\s+\*{0,2}Narrative Prose & Lore\*{0,2}$/i.test(l.trim()));
  if (narrativeIdx !== -1) {
    const proseLines = [];
    for (let j = narrativeIdx + 1; j < lines.length; j++) {
      if (/^#{1,3}\s+/.test(lines[j].trim())) break;
      proseLines.push(lines[j]);
    }
    extractedContent = proseLines.join('\n').trim();
  }

  // Build full Tangent Element object
  const canonicalType = detectedType === 'Technology' ? 'Technology' : normalizeElementType(detectedType);
  const resolvedDescription = extractedSummary || extractedFields.summary || extractedFields.coreIdentity || extractedFields.description || '';
  const guidance = parseJsonMeta(metadata.guidanceJson, {});
  const assetHub = parseJsonMeta(metadata.assetHubJson, []);
  const customFields = parseJsonMeta(metadata.customFieldsJson, []);

  const element = {
    id: metadata.id || `elem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: extractedName || `Untitled ${canonicalType}`,
    title: extractedName || metadata.title || `Untitled ${canonicalType}`,
    type: canonicalType,
    ...(metadata.imageUrl ? { imageUrl: metadata.imageUrl } : {}),
    ...(metadata.propertySubcategory ? { propertySubcategory: metadata.propertySubcategory } : {}),
    ...(metadata.metaphysicsSubcategory ? { metaphysicsSubcategory: metadata.metaphysicsSubcategory } : {}),
    ...(metadata.personaSubcategory ? { personaSubcategory: metadata.personaSubcategory } : {}),
    description: resolvedDescription,
    content: extractedContent || resolvedDescription || '',
    fields: extractedFields,
    ...(Object.keys(guidance || {}).length > 0 ? { guidance } : {}),
    ...(Array.isArray(assetHub) && assetHub.length > 0 ? { assetHub } : {}),
    ...(Array.isArray(customFields) && customFields.length > 0 ? { customFields } : {}),
    sourceFile: fileName || `${canonicalType.toLowerCase()}-${(extractedName || 'element').toLowerCase().replace(/\s+/g, '-')}.md`,
    ingestedAt: new Date().toISOString(),
    dbmSyncStatus: metadata.dbmSyncStatus || 'standalone',
    tags: metadata.tags ? (Array.isArray(metadata.tags) ? metadata.tags : metadata.tags.split(',').map(t => t.trim())) : []
  };

  return element;
}

/**
 * Maps common ELEMENTS.md bullet labels to canonical elementSchemas keys
 */
function mapSchemaAliases(type, lowerLabel, val, fields) {
  if (lowerLabel.includes('core identity')) fields.coreIdentity = val;

  if (type === 'Faction') {
    if (lowerLabel.includes('public slogan') || lowerLabel.includes('motto')) fields.motto = val;
    if (lowerLabel.includes('core ideology')) fields.ideology = val;
    if (lowerLabel.includes('primary goal') || lowerLabel.includes('agenda')) fields.goals = val;
    if (lowerLabel.includes('government type') || lowerLabel === 'government') fields.government = val;
    if (lowerLabel.includes('leadership structure')) {
      fields.leadership = val;
      if (!fields.government) fields.government = val;
    }
    if (lowerLabel.includes('laws & justice')) fields.laws = val;
    if (lowerLabel.includes('scope of influence') || lowerLabel.includes('territory')) fields.territory = val;
    if (lowerLabel.includes('military strength') || lowerLabel.includes('military doctrine') || lowerLabel.includes('key units')) {
      fields.military = val;
      fields.military_doctrine = val;
    }
    if (lowerLabel.includes('economic strength') || lowerLabel.includes('primary industries')) fields.resources = val;
    if (lowerLabel.includes('social hierarchy') || lowerLabel.includes('culture & traditions')) fields.culture = val;
    if (lowerLabel.includes('allies') || lowerLabel.includes('enemies') || lowerLabel.includes('foreign relations') || lowerLabel.includes('diplomatic posture')) {
      fields.relations = val;
      fields.alliesEnemies = val;
    }
    if (lowerLabel.includes('founding story') || lowerLabel.includes('founders')) fields.history = val;
  }
  
  if (type === 'Persona') {
    if (lowerLabel.includes('role in story')) {
      fields.role = val;
      fields.roleInStory = val;
    }
    if (lowerLabel.includes('character archetype') || lowerLabel === 'archetype') {
      fields['char-concept'] = val;
      fields.archetype = val;
    }
    if (lowerLabel.includes('core motivation') || lowerLabel.includes('goals & motivations')) {
      fields['char-motive'] = val;
      fields.goalsMotivations = val;
    }
    if (lowerLabel.includes('full name') || lowerLabel === 'name') {
      fields['char-name'] = val;
      fields.name = val;
    }
    if (lowerLabel.includes('age')) fields['char-age'] = val;
    if (lowerLabel.includes('gender')) fields['char-gender'] = val;
    if (lowerLabel.includes('physical description') || lowerLabel.includes('appearance')) {
      fields.appearance = val;
      fields.physicalDescription = val;
    }
    if (lowerLabel.includes('height')) fields['char-height'] = val;
    if (lowerLabel.includes('weight')) fields['char-weight'] = val;
    if (lowerLabel.includes('threat tier') || lowerLabel.includes('mcm tier')) fields.mcmTier = val;
    if (lowerLabel.includes('tactical role') || lowerLabel.includes('mcm role')) fields.mcmRole = val;
    if (lowerLabel.includes('chassis array') || lowerLabel.includes('mcm chassis')) fields.mcmChassis = val;
  }

  if (type === 'Scene') {
    if (lowerLabel.includes('scene goal') || lowerLabel.includes('scene purpose')) fields.scenePurpose = val;
    if (lowerLabel.includes('beginning state') || lowerLabel.includes('ending state')) fields.stateChange = val;
    if (lowerLabel.includes('sensory') || lowerLabel.includes('sounds') || lowerLabel.includes('smells')) fields.sensoryDetails = val;
    if (lowerLabel.includes('atmosphere') || lowerLabel.includes('mood')) {
      fields.atmosphere = val;
      fields.moodAtmosphere = val;
    }
    if (lowerLabel.includes('weather')) fields.weather = val;
    if (lowerLabel.includes('key object') || lowerLabel.includes('interactivity')) fields.keyObjects = val;
    if (lowerLabel.includes('read-aloud') || lowerLabel.includes('read aloud')) fields.readAloud = val;
    if (lowerLabel.includes('scene beat') || lowerLabel.includes('tactical beats')) fields.sceneBeats = val;
    if (lowerLabel.includes('opening beat')) fields.openingBeat = val;
    if (lowerLabel.includes('rising action') || lowerLabel.includes('climax')) fields.risingAction = val;
  }

  if (type === 'Setting') {
    if (lowerLabel.includes('setting name')) fields.settingName = val;
    if (lowerLabel.includes('scale')) fields.scale = val;
    if (lowerLabel.includes('genre') && (lowerLabel.includes('tech') || lowerLabel.includes('level'))) fields.genreTech = val;
    if (lowerLabel.includes('core concept') || lowerLabel.includes('function & purpose')) {
      fields.coreConcept = val;
      fields.functionPurpose = val;
    }
    if (lowerLabel.includes('primary conflict')) fields.primaryConflict = val;
    if (lowerLabel.includes('climate')) {
      fields.climate = val;
      fields.climateWeather = val;
    }
    if (lowerLabel.includes('terrain') || lowerLabel.includes('geography & architecture')) {
      fields.terrain = val;
      fields.geographyArchitecture = val;
    }
  }

  if (type === 'Species') {
    if (lowerLabel.includes('homeworld') || lowerLabel.includes('habitat')) {
      fields.homeworld = val;
      fields.habitatOrigin = val;
    }
    if (lowerLabel.includes('sentience')) fields.sentience = val;
    if (lowerLabel.includes('general description') || lowerLabel.includes('physiology')) {
      fields.description = val;
      fields.physicalDescription = val;
    }
    if (lowerLabel.includes('anatomy') || lowerLabel.includes('appearance')) {
      fields.appearance = val;
      if (!fields.physicalDescription) fields.physicalDescription = val;
    }
    if (lowerLabel.includes('inherent abilities') || lowerLabel.includes('inherent traits')) {
      fields.abilities = val;
      fields.abilitiesPowers = val;
    }
    if (lowerLabel.includes('culture') || lowerLabel.includes('diet') || lowerLabel.includes('psychology')) fields.behaviorDiet = val;
    if (lowerLabel.includes('role in galactic') || lowerLabel.includes('role in world')) fields.roleInWorld = val;
    if (lowerLabel.includes('weaknesses')) fields.weaknesses = val;
  }

  if (type === 'Property') {
    if (lowerLabel.includes('subcategory')) fields.propertySubcategory = val;
    if (lowerLabel.includes('function') || lowerLabel.includes('purpose')) fields.functionPurpose = val;
    if (lowerLabel.includes('aesthetic') || lowerLabel.includes('manufacturer')) fields.aestheticForm = val;
    if (lowerLabel.includes('damage')) fields.damage = val;
    if (lowerLabel.includes('range')) fields.range = val;
    if (lowerLabel.includes('location') || lowerLabel.includes('coverage')) fields.location = val;
    if (lowerLabel.includes('power source') || lowerLabel.includes('mechanism')) fields.mechanismPowerSource = val;
    if (lowerLabel.includes('mechanic') || lowerLabel.includes('rule')) fields.mechanic = val;
    if (lowerLabel.includes('rarity') || lowerLabel.includes('availability')) fields.rarity = val;
    if (lowerLabel.includes('weaknesses') || lowerLabel.includes('vulnerabilities')) fields.weaknesses = val;
    if (lowerLabel.includes('provenance') || lowerLabel.includes('creator')) fields.originContext = val;
  }

  if (type === 'Metaphysics') {
    if (lowerLabel.includes('subcategory') || lowerLabel.includes('category')) fields.metaphysicsSubcategory = val;
    if (lowerLabel.includes('meta skill')) {
      fields.skill = val;
      fields.meta_skill = val;
    }
    if (lowerLabel.includes('discipline') || lowerLabel.includes('sphere')) fields.discipline = val;
    if (lowerLabel.includes('difficulty') || lowerLabel.includes('design dc')) fields.design_dc = val;
    if (lowerLabel.includes('cast time') || lowerLabel.includes('activation')) fields.cast_time = val;
    if (lowerLabel.includes('range') || lowerLabel.includes('area')) fields.range_area = val;
    if (lowerLabel.includes('cost') || lowerLabel.includes('focus') || lowerLabel.includes('strain') || lowerLabel.includes('backlash')) {
      fields.costs = val;
      fields.strainBacklash = val;
    }
    if (lowerLabel.includes('mechanic') || lowerLabel.includes('effect')) fields.mechanic = val;
  }

  if (type === 'Technology') {
    if (lowerLabel.includes('core function') || lowerLabel.includes('function')) {
      fields.function = val;
      fields.functionPurpose = val;
    }
    if (lowerLabel.includes('power source') || lowerLabel.includes('power')) {
      fields.power = val;
      fields.mechanismPowerSource = val;
    }
    if (lowerLabel.includes('key components') || lowerLabel.includes('components')) fields.components = val;
    if (lowerLabel.includes('inventor') || lowerLabel.includes('origin')) {
      fields.origin = val;
      fields.originContext = val;
    }
    if (lowerLabel.includes('strengths, weaknesses') || lowerLabel.includes('weaknesses')) fields.weaknesses = val;
  }

  if (type === 'Philosophy') {
    if (lowerLabel.includes('core tenet') || lowerLabel.includes('tenet')) fields.tenet = val;
    if (lowerLabel.includes('category')) fields.category = val;
    if (lowerLabel.includes('cosmology')) fields.cosmology = val;
    if (lowerLabel.includes('free will')) fields.freeWill = val;
    if (lowerLabel.includes('truth')) fields.truth = val;
    if (lowerLabel.includes('ethics')) fields.ethics = val;
    if (lowerLabel.includes('society')) fields.society = val;
    if (lowerLabel.includes('rituals')) fields.rituals = val;
  }

  if (type === 'Universe') {
    if (lowerLabel.includes('designation')) fields.designation = val;
    if (lowerLabel.includes('ontological')) fields.ontological = val;
    if (lowerLabel.includes('laws of physics')) fields.lawsPhysics = val;
    if (lowerLabel.includes('nature of magic')) fields.natureMagic = val;
    if (lowerLabel.includes('cosmological')) fields.cosmological = val;
    if (lowerLabel.includes('creation')) fields.creation = val;
    if (lowerLabel.includes('entities')) fields.entities = val;
    if (lowerLabel.includes('inter-planar') || lowerLabel.includes('interplanar')) fields.interplanar = val;
    if (lowerLabel.includes('central question')) fields.centralQuestion = val;
  }

  if (type === 'World') {
    if (lowerLabel.includes('high concept') || lowerLabel.includes('core premise')) fields.highConcept = val;
    if (lowerLabel.includes('laws of physics') || lowerLabel.includes('cosmology')) fields.laws = val;
    if (lowerLabel.includes('magic system') || lowerLabel.includes('magic')) fields.magic = val;
    if (lowerLabel.includes('star system') || lowerLabel.includes('planets')) fields.starSystem = val;
    if (lowerLabel.includes('continents') || lowerLabel.includes('oceans')) fields.continents = val;
    if (lowerLabel.includes('cataclysms') || lowerLabel.includes('fallen empires')) fields.cataclysms = val;
    if (lowerLabel.includes('species') || lowerLabel.includes('sentient')) fields.species = val;
    if (lowerLabel.includes('demographics')) fields.demographics = val;
    if (lowerLabel.includes('tech level')) fields.techLevel = val;
    if (lowerLabel.includes('pantheons') || lowerLabel.includes('gods')) fields.pantheons = val;
    if (lowerLabel.includes('themes')) fields.themes = val;
    if (lowerLabel.includes('inspirations')) fields.inspirations = val;
  }

  if (type === 'Custom') {
    if (lowerLabel.includes('category') || lowerLabel.includes('domain')) fields.category = val;
    if (lowerLabel.includes('summary') || lowerLabel.includes('pitch')) fields.summary = val;
    if (lowerLabel.includes('description') || lowerLabel.includes('details')) fields.description = val;
    if (lowerLabel.includes('tags') || lowerLabel.includes('keywords')) fields.tags = val;
  }

  // Shared Dynamic Lorebook & Trigger keys across all types
  if (lowerLabel.includes('primary trigger')) fields.primaryTriggers = val;
  if (lowerLabel.includes('secondary trigger')) fields.secondaryTriggers = val;
  if (lowerLabel.includes('trigger logic')) fields.triggerLogic = val;
  if (lowerLabel.includes('speaker code filter') || lowerLabel.includes('speaker filter')) fields.speakerFilter = val;
  if (lowerLabel.includes('regular expression') || lowerLabel.includes('trigger regex')) fields.triggerRegex = val;
  if (lowerLabel.includes('scan priority')) fields.loreScanPriority = val ? Number(val) || val : val;
  if (lowerLabel.includes('token budget')) fields.loreBudgetTokens = val ? Number(val) || val : val;
  if (lowerLabel.includes('flag requirement') || lowerLabel.includes('require condition')) fields.loreRequireCondition = val;
  if (lowerLabel.includes('flag suppression') || lowerLabel.includes('suppress condition')) fields.loreSuppressCondition = val;
}

/**
 * Exports a Tangent element object into canonical Markdown adhering to docs/- ELEMENTS.md
 */
export function exportElementToMarkdown(element) {
  if (!element || !element.type) {
    throw new Error('Invalid element provided for markdown export.');
  }

  const { id, description, content, fields = {}, tags = [], dbmSyncStatus, guidance, assetHub, customFields } = element;
  const type = element.type === 'Technology' ? 'Technology' : normalizeElementType(element.type);
  const resolvedName = element.name || element.title || 'Untitled';
  const escYaml = (v) => String(v ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const formatFieldVal = (v) => {
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };
  const lines = [];

  // 1. YAML Frontmatter
  lines.push('---');
  lines.push(`id: "${escYaml(id)}"`);
  lines.push(`name: "${escYaml(resolvedName)}"`);
  lines.push(`type: "${escYaml(type)}"`);
  lines.push(`dbmSyncStatus: "${escYaml(dbmSyncStatus || 'standalone')}"`);
  if (element.imageUrl) lines.push(`imageUrl: "${escYaml(element.imageUrl)}"`);
  if (element.propertySubcategory) lines.push(`propertySubcategory: "${escYaml(element.propertySubcategory)}"`);
  if (element.metaphysicsSubcategory) lines.push(`metaphysicsSubcategory: "${escYaml(element.metaphysicsSubcategory)}"`);
  if (element.personaSubcategory) lines.push(`personaSubcategory: "${escYaml(element.personaSubcategory)}"`);
  if (guidance && typeof guidance === 'object' && Object.keys(guidance).length > 0) {
    lines.push(`guidanceJson: "${escYaml(JSON.stringify(guidance))}"`);
  }
  if (Array.isArray(assetHub) && assetHub.length > 0) {
    lines.push(`assetHubJson: "${escYaml(JSON.stringify(assetHub))}"`);
  }
  if (Array.isArray(customFields) && customFields.length > 0) {
    lines.push(`customFieldsJson: "${escYaml(JSON.stringify(customFields))}"`);
  }
  const tagList = Array.isArray(tags)
    ? tags
    : (typeof tags === 'string' && tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
  if (tagList.length > 0) {
    lines.push(`tags: [${tagList.map(t => `"${escYaml(t)}"`).join(', ')}]`);
  }
  lines.push(`exportedAt: "${new Date().toISOString()}"`);
  lines.push('---');
  lines.push('');

  // 2. Canonical Title Header
  lines.push(`# **${type} Development Fields**`);
  lines.push('');
  lines.push(`## ${resolvedName}`);
  lines.push('');
  if (description) {
    lines.push(`*${description}*`);
    lines.push('');
  }

  // 3. Render Fields grouped by Schema Tabs or Default Sections
  const schema = ELEMENT_SCHEMAS[type] || [];
  const renderedKeys = new Set();
  if (schema.length > 0) {
    const tabs = [...new Set(schema.map(f => f.tab))];
    for (const tab of tabs) {
      lines.push(`### **${tab}**`);
      lines.push('');
      const tabFields = schema.filter(f => f.tab === tab);
      for (const field of tabFields) {
        renderedKeys.add(field.key);
        renderedKeys.add(normalizeFieldKey(field.label));
        const candidateKeys = [
          field.key,
          normalizeFieldKey(field.label),
          ...(Array.isArray(field.aliasKeys) ? field.aliasKeys : [])
        ];
        let val = '';
        for (const ck of candidateKeys) {
          const candidate = fields[ck];
          if (candidate !== undefined && candidate !== null && candidate !== '') {
            val = formatFieldVal(candidate);
            renderedKeys.add(ck);
            break;
          }
        }
        lines.push(`* **${field.label}:** ${val}`);
      }
      lines.push('');
    }
  }

  // 4. Render any additional unmapped fields so ZERO data is lost
  const unmappedKeys = Object.keys(fields).filter(k => !renderedKeys.has(k));

  if (unmappedKeys.length > 0) {
    lines.push('### **Extended & Dynamic Attributes**');
    lines.push('');
    for (const key of unmappedKeys) {
      const rawVal = fields[key];
      const val = formatFieldVal(rawVal);
      // Format camelCase key into readable label
      const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      lines.push(`* **${formattedLabel}:** ${val}`);
    }
    lines.push('');
  }

  if (content && String(content).trim()) {
    lines.push('### **Narrative Prose & Lore**');
    lines.push('');
    lines.push(String(content).trim());
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Validates an element against its schema and calculates completeness
 */
export function validateElementAgainstSchema(element) {
  if (!element || !element.type) {
    return { valid: false, completenessScore: 0, missingRequired: ['type'], fieldCount: 0 };
  }

  const schema = ELEMENT_SCHEMAS[element.type] || [];
  if (schema.length === 0) {
    return { valid: true, completenessScore: 100, missingRequired: [], fieldCount: Object.keys(element.fields || {}).length };
  }

  let filledCount = 0;
  const missingRequired = [];
  const hasVal = (v) => v !== undefined && v !== null && String(v).trim().length > 0;

  for (const field of schema) {
    const fObj = element.fields || {};
    let val = hasVal(fObj[field.key]) ? fObj[field.key] : fObj[normalizeFieldKey(field.label)];
    if (!hasVal(val) && field.aliasKeys && Array.isArray(field.aliasKeys)) {
      for (const ak of field.aliasKeys) {
        if (hasVal(fObj[ak])) {
          val = fObj[ak];
          break;
        }
      }
    }
    if (hasVal(val)) {
      filledCount++;
    } else if (field.required) {
      missingRequired.push(field.label);
    }
  }

  const completenessScore = Math.min(100, Math.round((filledCount / schema.length) * 100));

  return {
    valid: missingRequired.length === 0,
    completenessScore,
    missingRequired,
    fieldCount: filledCount,
    totalSchemaFields: schema.length
  };
}

/**
 * Triggers a browser download of the element markdown file
 */
export function downloadElementMarkdownFile(element) {
  if (typeof window === 'undefined' || !element) return;
  const markdown = exportElementToMarkdown(element);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (element.name || element.title || 'element').toLowerCase().replace(/[^a-z0-9]/gi, '-');
  link.href = url;
  link.download = `${element.type.toLowerCase()}-${safeName}.tangent-element.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Batch ingests multiple files (from drag & drop or file picker)
 */
export async function batchIngestElementFiles(fileList) {
  const results = [];
  for (const file of fileList) {
    try {
      const content = await file.text();
      const element = parseElementMarkdown(content, file.name);
      const validation = validateElementAgainstSchema(element);
      results.push({
        success: true,
        fileName: file.name,
        element,
        validation
      });
    } catch (err) {
      results.push({
        success: false,
        fileName: file.name,
        error: err.message
      });
    }
  }
  return results;
}
