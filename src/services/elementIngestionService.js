/**
 * Tangent SF RP - Element File Ingestion & Serialization Service
 * Implements 1-to-1 parity with docs/- ELEMENTS.md for all 9 canonical types:
 * Faction, Persona, Philosophy, Scene, Setting, Species, Technology, Universe, World
 * (plus standard adventure elements: Adventure, Story Arc, Encounter, Item, Clue, Handout, Map).
 */

import { ELEMENT_SCHEMAS, ELEMENT_TYPES } from '../pages/Foundry/ElementForge/elementSchemas.js';

// Canonical type mappings from header or key signatures
const TYPE_DETECTION_PATTERNS = [
  { type: 'Faction', regex: /Faction Development Fields|Faction Name/i },
  { type: 'Persona', regex: /Persona Development Fields|Character Portrait|Role in Story|Character Archetype/i },
  { type: 'Philosophy', regex: /Philosophy Development Fields|Core Tenet & Guiding Question|Guiding Question/i },
  { type: 'Scene', regex: /Scene Development Fields|Scene Title \/ Working Name|Opening Beat & Inciting Event/i },
  { type: 'Setting', regex: /Setting Development Fields|Setting Name|Primary Conflict \/ Tension/i },
  { type: 'Species', regex: /Species Development Fields|Species Name|Homeworld \/ Plane of Origin|Sentience Level/i },
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
  'philosophy name', 'universe name / designation', 'universe name',
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
    const endMatch = text.indexOf('\n---', 3);
    if (endMatch !== -1) {
      const frontmatterBlock = text.slice(3, endMatch).trim();
      text = text.slice(endMatch + 4).trim();
      const lines = frontmatterBlock.split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const rawVal = line.slice(colonIdx + 1).trim();
          let parsedVal = rawVal.replace(/^['"]|['"]$/g, '');
          if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
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

    // Detect bullet key-values: * **Key:** Value or - **Key:** Value
    const bulletMatch = line.match(/^[\*\-]\s+\*\*([^*:]+):?\*\*\s*(.*)$/);
    if (bulletMatch) {
      const label = bulletMatch[1].trim();
      let value = bulletMatch[2].trim();

      // If value is empty or continuation on next line
      if (!value && i + 1 < lines.length && !lines[i + 1].trim().startsWith('*') && !lines[i + 1].trim().startsWith('#')) {
        value = lines[i + 1].trim();
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

  // Build full Tangent Element object
  const element = {
    id: metadata.id || `elem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: extractedName || `Untitled ${detectedType}`,
    title: extractedName || metadata.title || `Untitled ${detectedType}`,
    type: detectedType,
    description: extractedSummary || extractedFields.summary || extractedFields.coreIdentity || extractedFields.description || '',
    fields: extractedFields,
    sourceFile: fileName || `${detectedType.toLowerCase()}-${(extractedName || 'element').toLowerCase().replace(/\s+/g, '-')}.md`,
    ingestedAt: new Date().toISOString(),
    dbmSyncStatus: metadata.dbmSyncStatus || 'unlinked',
    tags: metadata.tags ? (Array.isArray(metadata.tags) ? metadata.tags : metadata.tags.split(',').map(t => t.trim())) : []
  };

  return element;
}

/**
 * Maps common ELEMENTS.md bullet labels to canonical elementSchemas keys
 */
function mapSchemaAliases(type, lowerLabel, val, fields) {
  if (lowerLabel.includes('core identity')) fields.coreIdentity = val;
  if (lowerLabel.includes('public slogan') || lowerLabel.includes('motto')) fields.motto = val;
  if (lowerLabel.includes('core ideology')) fields.ideology = val;
  if (lowerLabel.includes('primary goal') || lowerLabel.includes('agenda')) fields.goals = val;
  if (lowerLabel.includes('government type')) fields.government = val;
  if (lowerLabel.includes('leadership structure')) fields.leadership = val;
  if (lowerLabel.includes('laws & justice')) fields.laws = val;
  if (lowerLabel.includes('scope of influence') || lowerLabel.includes('territory')) fields.territory = val;
  if (lowerLabel.includes('military strength') || lowerLabel.includes('key units')) fields.military = val;
  if (lowerLabel.includes('economic strength') || lowerLabel.includes('primary industries')) fields.resources = val;
  if (lowerLabel.includes('social hierarchy') || lowerLabel.includes('culture & traditions')) fields.culture = val;
  if (lowerLabel.includes('allies') || lowerLabel.includes('enemies') || lowerLabel.includes('foreign relations')) fields.relations = val;
  if (lowerLabel.includes('founding story') || lowerLabel.includes('founders')) fields.history = val;
  
  if (type === 'Persona') {
    if (lowerLabel.includes('role in story')) fields.role = val;
    if (lowerLabel.includes('character archetype')) fields['char-concept'] = val;
    if (lowerLabel.includes('core motivation')) fields['char-motive'] = val;
    if (lowerLabel.includes('full name') || lowerLabel === 'name') fields['char-name'] = val;
    if (lowerLabel.includes('age')) fields['char-age'] = val;
    if (lowerLabel.includes('gender')) fields['char-gender'] = val;
    if (lowerLabel.includes('physical description') || lowerLabel.includes('appearance')) fields.appearance = val;
    if (lowerLabel.includes('height')) fields['char-height'] = val;
    if (lowerLabel.includes('weight')) fields['char-weight'] = val;
    if (lowerLabel.includes('threat tier') || lowerLabel.includes('mcm tier')) fields.mcmTier = val;
    if (lowerLabel.includes('tactical role') || lowerLabel.includes('mcm role')) fields.mcmRole = val;
    if (lowerLabel.includes('chassis array') || lowerLabel.includes('mcm chassis')) fields.mcmChassis = val;
  }

  if (type === 'Scene') {
    if (lowerLabel.includes('scene goal') || lowerLabel.includes('scene purpose')) fields.scenePurpose = val;
    if (lowerLabel.includes('beginning state') || lowerLabel.includes('ending state')) fields.stateChange = val;
    if (lowerLabel.includes('atmosphere')) fields.atmosphere = val;
    if (lowerLabel.includes('weather')) fields.weather = val;
    if (lowerLabel.includes('opening beat')) fields.openingBeat = val;
    if (lowerLabel.includes('rising action') || lowerLabel.includes('climax')) fields.risingAction = val;
  }

  if (type === 'Setting') {
    if (lowerLabel.includes('setting name')) fields.settingName = val;
    if (lowerLabel.includes('scale')) fields.scale = val;
    if (lowerLabel.includes('genre') && (lowerLabel.includes('tech') || lowerLabel.includes('level'))) fields.genreTech = val;
    if (lowerLabel.includes('core concept')) fields.coreConcept = val;
    if (lowerLabel.includes('primary conflict')) fields.primaryConflict = val;
    if (lowerLabel.includes('climate')) fields.climate = val;
    if (lowerLabel.includes('terrain')) fields.terrain = val;
  }

  if (type === 'Species') {
    if (lowerLabel.includes('homeworld')) fields.homeworld = val;
    if (lowerLabel.includes('sentience')) fields.sentience = val;
    if (lowerLabel.includes('general description')) fields.description = val;
    if (lowerLabel.includes('anatomy') || lowerLabel.includes('appearance')) fields.appearance = val;
    if (lowerLabel.includes('inherent abilities')) fields.abilities = val;
    if (lowerLabel.includes('weaknesses')) fields.weaknesses = val;
  }

  if (type === 'Technology') {
    if (lowerLabel.includes('core function') || lowerLabel.includes('function')) fields.function = val;
    if (lowerLabel.includes('power source') || lowerLabel.includes('power')) fields.power = val;
    if (lowerLabel.includes('key components') || lowerLabel.includes('components')) fields.components = val;
    if (lowerLabel.includes('inventor') || lowerLabel.includes('origin')) fields.origin = val;
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
}

/**
 * Exports a Tangent element object into canonical Markdown adhering to docs/- ELEMENTS.md
 */
export function exportElementToMarkdown(element) {
  if (!element || !element.type) {
    throw new Error('Invalid element provided for markdown export.');
  }

  const { id, name, type, description, fields = {}, tags = [], dbmSyncStatus } = element;
  const lines = [];

  // 1. YAML Frontmatter
  lines.push('---');
  lines.push(`id: "${id}"`);
  lines.push(`name: "${name}"`);
  lines.push(`type: "${type}"`);
  lines.push(`dbmSyncStatus: "${dbmSyncStatus || 'unlinked'}"`);
  if (tags && tags.length > 0) {
    lines.push(`tags: [${tags.map(t => `"${t}"`).join(', ')}]`);
  }
  lines.push(`exportedAt: "${new Date().toISOString()}"`);
  lines.push('---');
  lines.push('');

  // 2. Canonical Title Header
  lines.push(`# **${type} Development Fields**`);
  lines.push('');
  lines.push(`## ${name}`);
  lines.push('');
  if (description) {
    lines.push(`*${description}*`);
    lines.push('');
  }

  // 3. Render Fields grouped by Schema Tabs or Default Sections
  const schema = ELEMENT_SCHEMAS[type] || [];
  if (schema.length > 0) {
    const tabs = [...new Set(schema.map(f => f.tab))];
    for (const tab of tabs) {
      lines.push(`### **${tab}**`);
      lines.push('');
      const tabFields = schema.filter(f => f.tab === tab);
      for (const field of tabFields) {
        const val = fields[field.key] || fields[normalizeFieldKey(field.label)] || '';
        lines.push(`* **${field.label}:** ${val}`);
      }
      lines.push('');
    }
  }

  // 4. Render any additional unmapped fields so ZERO data is lost
  const schemaKeys = new Set(schema.map(s => s.key));
  const schemaLabels = new Set(schema.map(s => normalizeFieldKey(s.label)));
  const unmappedKeys = Object.keys(fields).filter(k => !schemaKeys.has(k) && !schemaLabels.has(k));

  if (unmappedKeys.length > 0) {
    lines.push('### **Extended & Dynamic Attributes**');
    lines.push('');
    for (const key of unmappedKeys) {
      const val = typeof fields[key] === 'object' ? JSON.stringify(fields[key], null, 2) : fields[key];
      // Format camelCase key into readable label
      const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      lines.push(`* **${formattedLabel}:** ${val}`);
    }
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

  for (const field of schema) {
    let val = element.fields && (element.fields[field.key] || element.fields[normalizeFieldKey(field.label)]);
    if (!val && field.aliasKeys && Array.isArray(field.aliasKeys) && element.fields) {
      for (const ak of field.aliasKeys) {
        if (element.fields[ak]) {
          val = element.fields[ak];
          break;
        }
      }
    }
    if (val && String(val).trim().length > 0) {
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
  const safeName = (element.name || 'element').toLowerCase().replace(/[^a-z0-9]/gi, '-');
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
