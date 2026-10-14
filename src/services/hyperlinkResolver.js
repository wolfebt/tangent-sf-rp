/**
 * @file hyperlinkResolver.js
 * @description Centralized parser and multi-source resolution engine for bracket hyperlinks:
 *   [Target]
 *   [Display Label|Target]
 *   [[Wiki Links]]
 * Resolves against:
 *   1. Platform Sections (Folio, Codex, Compendium, Stage, Comms, Foundry, Teams, etc.)
 *   2. Elements Catalog (Story Foundry / Element Forge world elements)
 *   3. Codex & DBM Entries (Omnicortex datasets, species, weaponry, archetypes, etc.)
 */

import { ROUTES } from '../constants/routes.js';

/**
 * Platform Section dictionary with aliases, paths, badges, and descriptions.
 */
export const SECTION_REGISTRY = {
  folio: {
    key: 'folio',
    aliases: ['folio', 'persona', 'character', 'characters', 'sheet', 'operative', 'operatives'],
    label: 'Persona Folio',
    url: ROUTES.FOLIO || '/folio',
    badge: 'PLATFORM SECTION',
    description: 'Operative character sheet, stats, inventory, cybernetics, and personal log.',
    tags: ['Core', 'Character', 'Vitals'],
    colorTheme: 'emerald',
    icon: 'User'
  },
  codex: {
    key: 'codex',
    aliases: ['codex', 'omnicortex', 'lore', 'archives', 'terran codex'],
    label: 'Terran Codex',
    url: ROUTES.CODEX || '/codex',
    badge: 'PLATFORM SECTION',
    description: 'Omnicortex lore database, technological matrices, economy, and world archives.',
    tags: ['Database', 'Lore', 'Omnicortex'],
    colorTheme: 'amber',
    icon: 'BookOpen'
  },
  compendium: {
    key: 'compendium',
    aliases: ['compendium', 'rules', 'handbook', 'rulebook', 'mechanics', 'system'],
    label: 'Game Compendium',
    url: ROUTES.COMPENDIUM || '/compendium',
    badge: 'PLATFORM SECTION',
    description: 'Tangent 2d10 core rules, combat resolution tables, modifiers, and master index.',
    tags: ['Rules', 'Systems', '2d10'],
    colorTheme: 'emerald',
    icon: 'FileText'
  },
  stage: {
    key: 'stage',
    aliases: ['stage', 'vtt', 'battlemap', 'tactical', 'grid', 'live studio'],
    label: 'Tactical VTT Stage',
    url: ROUTES.STAGE || '/stage',
    badge: 'PLATFORM SECTION',
    description: 'Tactical Virtual Tabletop canvas, 2D/3D tokens, lighting, fog, and combat encounters.',
    tags: ['VTT', 'Encounter', 'Stage'],
    colorTheme: 'emerald',
    icon: 'Compass'
  },
  comms: {
    key: 'comms',
    aliases: ['comms', 'chat', 'network', 'frequency', 'docket', 'dockets', 'radio'],
    label: 'Terran Comms Net',
    url: ROUTES.COMMS || '/comms',
    badge: 'PLATFORM SECTION',
    description: 'Tactical fireteam comms, operational channels, whisper dockets, and audio streams.',
    tags: ['Comms', 'Network', 'Directives'],
    colorTheme: 'cyan',
    icon: 'Radio'
  },
  teams: {
    key: 'teams',
    aliases: ['teams', 'squad', 'squads', 'fireteam', 'group', 'groups'],
    label: 'Squad Operations',
    url: ROUTES.TEAMS || '/teams',
    badge: 'PLATFORM SECTION',
    description: 'Fireteam rosters, squad deployment directives, telemetry, and shared assets.',
    tags: ['Squads', 'Fireteam', 'Tactics'],
    colorTheme: 'cyan',
    icon: 'Users'
  },
  foundry: {
    key: 'foundry',
    aliases: ['foundry', 'ade', 'story foundry', 'adventure', 'scenarios'],
    label: 'Story Foundry / ADE',
    url: ROUTES.FOUNDRY || '/foundry',
    badge: 'PLATFORM SECTION',
    description: 'Adventure Development Environment (ADE), scenario outliner, and narrative engine.',
    tags: ['ADE', 'Story', 'Scenarios'],
    colorTheme: 'cyan',
    icon: 'Sparkles'
  },
  catalog: {
    key: 'catalog',
    aliases: ['catalog', 'elements', 'element forge', 'assets', 'entities'],
    label: 'Elements Catalog',
    url: '/foundry/catalog',
    badge: 'PLATFORM SECTION',
    description: 'Reusable story elements, factions, locations, NPCs, items, and narrative hooks.',
    tags: ['Catalog', 'Forge', 'Assets'],
    colorTheme: 'cyan',
    icon: 'Layers'
  },
  map: {
    key: 'map',
    aliases: ['map', 'mapmaker', 'cartography', 'maps', 'editor'],
    label: 'Foundry Map Maker',
    url: '/foundry/map',
    badge: 'PLATFORM SECTION',
    description: 'Grid cartography, wall occlusion geometry, asset placement, and zone designer.',
    tags: ['Maps', 'Cartography', 'Design'],
    colorTheme: 'cyan',
    icon: 'Map'
  },
  dbm: {
    key: 'dbm',
    aliases: ['dbm', 'matrix', 'database matrix', 'records'],
    label: 'Database Matrix (DBM)',
    url: ROUTES.DBM || '/dbm',
    badge: 'PLATFORM SECTION',
    description: 'Raw dataset records, collections management, and Firestore entity synchronizer.',
    tags: ['DBM', 'Data', 'Records'],
    colorTheme: 'amber',
    icon: 'Database'
  }
};

/**
 * Parses raw bracket token content like "Target", "Label|Target", or "Target|Label".
 * Supports single and double bracket syntax.
 *
 * @param {string} rawToken - e.g. "Laser Carbine", "Read Rules|section:compendium", "codex:Auluran"
 * @returns {{ displayLabel: string, targetSpec: string, prefix: string|null, identifier: string }}
 */
export function parseBracketToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    return { displayLabel: '', targetSpec: '', prefix: null, identifier: '' };
  }

  // Strip wrapping [ ] or [[ ]] if present
  let clean = rawToken.trim();
  while (clean.startsWith('[') && clean.endsWith(']')) {
    clean = clean.slice(1, -1).trim();
  }

  let displayLabel = clean;
  let targetSpec = clean;

  if (clean.includes('|')) {
    const parts = clean.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Check if left or right part contains an explicit prefix (e.g. section:, codex:, catalog:, compendium:, wiki:)
      const leftHasPrefix = /^(section|codex|catalog|folio|element|compendium|rule|rules|wiki):/i.test(parts[0]);
      const rightHasPrefix = /^(section|codex|catalog|folio|element|compendium|rule|rules|wiki):/i.test(parts[1]);

      if (rightHasPrefix && !leftHasPrefix) {
        // [Display Label|prefix:target]
        displayLabel = parts[0];
        targetSpec = parts[1];
      } else if (leftHasPrefix && !rightHasPrefix) {
        // [prefix:target|Display Label]
        targetSpec = parts[0];
        displayLabel = parts[1];
      } else {
        // Standard markdown/wiki convention: [Display Label|Target]
        displayLabel = parts[0];
        targetSpec = parts[1];
      }
    }
  }

  // Parse prefix if specified (e.g. "codex:Auluran" -> prefix: "codex", identifier: "Auluran")
  let prefix = null;
  let identifier = targetSpec;
  const prefixMatch = targetSpec.match(/^([a-z0-9_-]+):(.*)$/i);
  if (prefixMatch) {
    prefix = prefixMatch[1].toLowerCase();
    identifier = prefixMatch[2].trim();
  }

  return {
    displayLabel: displayLabel || identifier,
    targetSpec,
    prefix,
    identifier
  };
}

/**
 * Searches the SECTION_REGISTRY by alias or key.
 */
export function matchPlatformSection(term) {
  if (!term) return null;
  const cleanTerm = term.trim().toLowerCase();

  for (const section of Object.values(SECTION_REGISTRY)) {
    if (section.key === cleanTerm || section.aliases.some(alias => alias === cleanTerm)) {
      return section;
    }
  }

  // Fuzzy check: e.g. "persona folio" or "the codex"
  for (const section of Object.values(SECTION_REGISTRY)) {
    if (cleanTerm.includes(section.key) || section.aliases.some(alias => cleanTerm.includes(alias))) {
      return section;
    }
  }

  return null;
}

/**
 * Searches elementsCatalog for an element by title or id.
 */
export function matchElementsCatalog(term, elementsCatalog = []) {
  if (!term || !Array.isArray(elementsCatalog) || elementsCatalog.length === 0) return null;
  const clean = term.trim().toLowerCase();

  // 1. Exact title or id match
  let found = elementsCatalog.find(
    el => el.title?.toLowerCase() === clean || el.id?.toLowerCase() === clean || el.name?.toLowerCase() === clean
  );
  if (found) return found;

  // 2. Contains match
  found = elementsCatalog.find(
    el => (el.title && el.title.toLowerCase().includes(clean)) ||
          (clean.length > 3 && el.title && clean.includes(el.title.toLowerCase()))
  );
  return found || null;
}

/**
 * Searches dbData.compendium for a rulebook / compendium article by name, fileName, id, or clean title.
 */
export function matchCompendiumEntry(term, dbData = {}) {
  if (!term || !dbData || !Array.isArray(dbData.compendium) || dbData.compendium.length === 0) return null;
  const clean = term.trim().toLowerCase().replace(/\.md$/i, '');
  const list = dbData.compendium;

  // 1. Exact match on name, id, fileName (without .md), or stripped title
  let found = list.find(item => {
    const name = (item.name || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
    const strippedName = name.replace(/^[\d.a-z_-]+\s*[—\-:]\s*/i, '').trim();
    return name === clean || id === clean || fn === clean || strippedName === clean;
  });
  if (found) return found;

  // 2. Substring match on name or fileName
  if (clean.length >= 3) {
    found = list.find(item => {
      const name = (item.name || '').toLowerCase();
      const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
      return name.includes(clean) || fn.includes(clean);
    });
    if (found) return found;
  }

  return null;
}

/**
 * Helper to format a matched Compendium article into a resolved hyperlink target.
 */
function buildCompendiumResolution(item, displayLabel) {
  const title = item.name || item.title || item.fileName || item.id;
  const rawDesc = (item.description || item.body || '').replace(/^#+\s+.*$/gm, '').replace(/[*_`>#|]/g, ' ').replace(/\s+/g, ' ').trim();
  const previewDesc = rawDesc ? rawDesc.slice(0, 260) + (rawDesc.length > 260 ? '…' : '') : 'Canonical rule document from the Tangent Compendium.';
  const isArch = item.perspective === 'architect' || item.id?.startsWith('doc-architect-');
  return {
    targetType: 'compendium',
    title,
    displayLabel: displayLabel || title,
    url: `/compendium?article=${encodeURIComponent(item.id)}`,
    badge: isArch ? 'COMPENDIUM: ARCHITECT' : 'COMPENDIUM: OPERATOR',
    description: previewDesc,
    tags: [item.perspective?.toUpperCase() || 'RULEBOOK', item.entry_type, item.subfolder].filter(Boolean),
    colorTheme: isArch ? 'amber' : 'emerald',
    icon: 'BookOpen',
    exists: true,
    actionLabel: 'Open in Compendium',
    rawEntity: item
  };
}

/**
 * Searches dbData / Omnicortex datasets for an entry by name, title, or id.
 */
export function matchCodexEntry(term, dbData = {}) {
  if (!term || !dbData || typeof dbData !== 'object') return null;
  const clean = term.trim().toLowerCase();

  // Collections to prioritize
  const collections = [
    'species',
    'archetypes',
    'occupations',
    'weaponry',
    'armoring',
    'augmentations',
    'invocations',
    'gear',
    'features',
    'traits',
    'skills',
    'factions',
    'origins',
    'architecture',
    'society_architecture',
    'society_energy',
    'society_medicine',
    'society_materials',
    'society_synthetics'
  ];

  for (const colKey of collections) {
    const list = dbData[colKey];
    if (Array.isArray(list)) {
      const match = list.find(item => {
        const name = (item.name || item.title || item.label || item.id || '').toLowerCase();
        return name === clean;
      });
      if (match) {
        return { item: match, collection: colKey };
      }
    }
  }

  // Substring fallback
  for (const colKey of collections) {
    const list = dbData[colKey];
    if (Array.isArray(list)) {
      const match = list.find(item => {
        const name = (item.name || item.title || item.label || '').toLowerCase();
        return name.length > 2 && (name.includes(clean) || (clean.length > 3 && clean.includes(name)));
      });
      if (match) {
        return { item: match, collection: colKey };
      }
    }
  }

  return null;
}

/**
 * Master multi-source hyperlink resolver.
 *
 * @param {string} rawToken - e.g. "Laser Carbine", "Folio", "codex:Auluran", "Read Rules|section:compendium"
 * @param {Object} context
 * @param {Array} [context.elementsCatalog] - from useCampaign()
 * @param {Object} [context.dbData] - from useDBM()
 * @returns {Object} Structured resolution result
 */
export function resolveHyperlinkTarget(rawToken, { elementsCatalog = [], dbData = {} } = {}) {
  const { displayLabel, targetSpec, prefix, identifier } = parseBracketToken(rawToken);

  // 1. Handle EXPLICIT PREFIXES
  if (prefix === 'section') {
    const matchedSection = matchPlatformSection(identifier);
    if (matchedSection) {
      return {
        targetType: 'section',
        title: matchedSection.label,
        displayLabel,
        url: matchedSection.url,
        badge: matchedSection.badge,
        description: matchedSection.description,
        tags: matchedSection.tags,
        colorTheme: matchedSection.colorTheme,
        icon: matchedSection.icon,
        exists: true,
        actionLabel: 'Jump to Section',
        rawEntity: matchedSection
      };
    }
  }

  if (prefix === 'catalog' || prefix === 'element') {
    const matchedElement = matchElementsCatalog(identifier, elementsCatalog);
    if (matchedElement) {
      return {
        targetType: 'catalog',
        title: matchedElement.title || matchedElement.name || identifier,
        displayLabel,
        url: `/foundry?view=elements&id=${encodeURIComponent(matchedElement.id)}`,
        badge: `CATALOG: ${(matchedElement.type || 'ASSET').toUpperCase()}`,
        description: matchedElement.fields?.summary || matchedElement.fields?.description || matchedElement.description || 'No description available.',
        tags: [matchedElement.type || 'Element', ...(matchedElement.tags || [])],
        colorTheme: 'cyan',
        icon: 'Layers',
        exists: true,
        actionLabel: 'Inspect in Catalog',
        rawEntity: matchedElement
      };
    }
  }

  if (prefix === 'compendium' || prefix === 'rule' || prefix === 'rules' || prefix === 'wiki') {
    const matchedComp = matchCompendiumEntry(identifier, dbData);
    if (matchedComp) {
      return buildCompendiumResolution(matchedComp, displayLabel);
    }
  }

  if (prefix === 'codex') {
    const matchedCodex = matchCodexEntry(identifier, dbData);
    if (matchedCodex) {
      const { item, collection } = matchedCodex;
      const title = item.name || item.title || item.label || identifier;
      return {
        targetType: 'codex',
        title,
        displayLabel,
        url: `/codex?search=${encodeURIComponent(title)}`,
        badge: `CODEX: ${collection.toUpperCase().replace(/_/g, ' ')}`,
        description: item.description || item.summary || item.flavor || item.effect || 'Codex entry from Omnicortex archives.',
        tags: [collection, item.category, item.type].filter(Boolean),
        colorTheme: 'amber',
        icon: 'BookOpen',
        exists: true,
        actionLabel: 'View in Codex',
        rawEntity: item
      };
    }
  }

  // 2. AUTO-RESOLUTION (When no prefix or unknown prefix)
  // Priority 1: Check Platform Section
  const matchedSection = matchPlatformSection(identifier);
  if (matchedSection) {
    return {
      targetType: 'section',
      title: matchedSection.label,
      displayLabel,
      url: matchedSection.url,
      badge: matchedSection.badge,
      description: matchedSection.description,
      tags: matchedSection.tags,
      colorTheme: matchedSection.colorTheme,
      icon: matchedSection.icon,
      exists: true,
      actionLabel: 'Jump to Section',
      rawEntity: matchedSection
    };
  }

  // Priority 2: Check Elements Catalog
  const matchedElement = matchElementsCatalog(identifier, elementsCatalog);
  if (matchedElement) {
    return {
      targetType: 'catalog',
      title: matchedElement.title || matchedElement.name || identifier,
      displayLabel,
      url: `/foundry?view=elements&id=${encodeURIComponent(matchedElement.id)}`,
      badge: `CATALOG: ${(matchedElement.type || 'ASSET').toUpperCase()}`,
      description: matchedElement.fields?.summary || matchedElement.fields?.description || matchedElement.description || 'No description available.',
      tags: [matchedElement.type || 'Element', ...(matchedElement.tags || [])],
      colorTheme: 'cyan',
      icon: 'Layers',
      exists: true,
      actionLabel: 'Inspect in Catalog',
      rawEntity: matchedElement
    };
  }

  // Priority 3: Check Compendium Rules if identifier looks like a rule code or matches a Compendium article
  const looksLikeRuleCode = /^(\d+\.\d+|doc-operator-|doc-architect-)/i.test(identifier.trim());
  if (looksLikeRuleCode) {
    const matchedCompFirst = matchCompendiumEntry(identifier, dbData);
    if (matchedCompFirst) {
      return buildCompendiumResolution(matchedCompFirst, displayLabel);
    }
  }

  // Priority 4: Check Codex & Omnicortex DB
  const matchedCodex = matchCodexEntry(identifier, dbData);
  if (matchedCodex) {
    const { item, collection } = matchedCodex;
    const title = item.name || item.title || item.label || identifier;
    return {
      targetType: 'codex',
      title,
      displayLabel,
      url: `/codex?search=${encodeURIComponent(title)}`,
      badge: `CODEX: ${collection.toUpperCase().replace(/_/g, ' ')}`,
      description: item.description || item.summary || item.flavor || item.effect || 'Codex entry from Omnicortex archives.',
      tags: [collection, item.category, item.type].filter(Boolean),
      colorTheme: 'amber',
      icon: 'BookOpen',
      exists: true,
      actionLabel: 'View in Codex',
      rawEntity: item
    };
  }

  // Priority 5: Check Compendium Rules (general title/topic match)
  const matchedCompFallback = matchCompendiumEntry(identifier, dbData);
  if (matchedCompFallback) {
    return buildCompendiumResolution(matchedCompFallback, displayLabel);
  }

  // Priority 6: Fallback / Unresolved
  return {
    targetType: 'unresolved',
    title: identifier,
    displayLabel,
    url: `/codex?search=${encodeURIComponent(identifier)}`,
    badge: 'UNRESOLVED REFERENCE',
    description: `"${identifier}" was not found in active Sections, Elements Catalog, Compendium, or Codex database.`,
    tags: ['Unlinked'],
    colorTheme: 'slate',
    icon: 'HelpCircle',
    exists: false,
    actionLabel: 'Search in Codex',
    rawEntity: null
  };
}

/**
 * Extracts all bracketed tokens [item] and [[item]] from a string.
 *
 * @param {string} text
 * @returns {string[]} Array of unique raw bracket tokens (e.g. ["[Laser Carbine]", "[[Auluran]]"])
 */
export function extractBracketedTokens(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/\[\[[^\n\r\]]+\]\]|\[[^\n\r\]]+\]/g);
  if (!matches) return [];
  // Return unique bracket tokens
  return Array.from(new Set(matches.map(m => m.trim()))).filter(Boolean);
}

/**
 * Recursively collects all text strings from various input shapes
 * (strings, objects with fields/content/prompt/sceneBeats, arrays).
 */
function collectAllStrings(source, collected = []) {
  if (!source) return collected;
  if (typeof source === 'string') {
    collected.push(source);
    return collected;
  }
  if (Array.isArray(source)) {
    for (const item of source) {
      collectAllStrings(item, collected);
    }
    return collected;
  }
  if (typeof source === 'object') {
    if (typeof source.content === 'string') collected.push(source.content);
    if (typeof source.title === 'string') collected.push(source.title);
    if (typeof source.prompt === 'string') collected.push(source.prompt);
    if (typeof source.text === 'string') collected.push(source.text);
    if (typeof source.description === 'string') collected.push(source.description);
    if (typeof source.sceneBeats === 'string') collected.push(source.sceneBeats);
    if (typeof source.notes === 'string') collected.push(source.notes);
    if (source.fields && typeof source.fields === 'object') {
      for (const val of Object.values(source.fields)) {
        if (typeof val === 'string') collected.push(val);
      }
    }
  }
  return collected;
}

/**
 * Scans content for bracketed tokens [item] and resolves them into full
 * rich entity context descriptors for AI ingestion.
 *
 * @param {string|Object|Array} contentSource - Raw text or context objects
 * @param {Object} options
 * @param {Array} [options.elementsCatalog] - from useCampaign()
 * @param {Object} [options.dbData] - from useDBM()
 * @returns {Array<Object>} Resolved entity descriptors
 */
export function extractAndResolveBracketContext(contentSource, { elementsCatalog = [], dbData = {} } = {}) {
  const strings = collectAllStrings(contentSource);
  if (strings.length === 0) return [];

  const allTokens = new Set();
  for (const str of strings) {
    const tokens = extractBracketedTokens(str);
    for (const t of tokens) {
      allTokens.add(t);
    }
  }

  const resolvedEntities = [];
  const seenKeys = new Set();

  for (const token of allTokens) {
    const resolved = resolveHyperlinkTarget(token, { elementsCatalog, dbData });
    const dedupeKey = `${resolved.targetType}:${resolved.title?.toLowerCase()}`;
    if (!seenKeys.has(dedupeKey)) {
      seenKeys.add(dedupeKey);
      resolvedEntities.push(resolved);
    }
  }

  return resolvedEntities;
}

/**
 * Formats a list of resolved bracket entities into a comprehensive, authoritative
 * prompt context block for AI ingestion (AIME, Gemini, Local LLM).
 *
 * @param {Array<Object>} resolvedList - Output from extractAndResolveBracketContext
 * @returns {string} Formatted markdown prompt context
 */
export function formatBracketContextForAI(resolvedList = []) {
  if (!Array.isArray(resolvedList) || resolvedList.length === 0) {
    return '';
  }

  const lines = [
    '=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ===',
    'The author explicitly bracketed the following entities in their content/prompt using [brackets].',
    'You MUST ground your response in their canonical traits, lore, technological level, and narrative purpose:\n'
  ];

  for (const item of resolvedList) {
    if (item.targetType === 'catalog' && item.rawEntity) {
      const elem = item.rawEntity;
      const fields = elem.fields || {};
      lines.push(`• [CATALOG ASSET: ${(elem.type || 'ELEMENT').toUpperCase()}] "${item.title}"`);
      if (fields.oneLinePitch) lines.push(`  - Pitch: "${fields.oneLinePitch}"`);
      if (fields.summary || elem.description) lines.push(`  - Summary: ${fields.summary || elem.description}`);
      if (fields.functionPurpose) lines.push(`  - Function / Role: ${fields.functionPurpose}`);
      if (fields.corePremise) lines.push(`  - Core Premise: ${fields.corePremise}`);
      if (fields.coreTenets) lines.push(`  - Core Tenets: ${fields.coreTenets}`);
      if (fields.physicalDescription) lines.push(`  - Physical Description: ${fields.physicalDescription}`);
      if (fields.goalsMotivations) lines.push(`  - Goals & Motivations: ${fields.goalsMotivations}`);
      if (fields.strengthsFlaws) lines.push(`  - Flaws & Virtues: ${fields.strengthsFlaws}`);
      if (fields.techLevel !== undefined || fields['tech-level'] !== undefined) {
        lines.push(`  - Tech Level: TL ${fields.techLevel ?? fields['tech-level']}`);
      }
      if (fields.metaLevel !== undefined || fields['magic-level'] !== undefined) {
        lines.push(`  - Meta Level: ML ${fields.metaLevel ?? fields['magic-level']}`);
      }
      if (elem.content) {
        const cleanContent = elem.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        if (cleanContent) {
          lines.push(`  - Canonical Narrative Lore: ${cleanContent.slice(0, 400)}`);
        }
      }
      lines.push('');
    } else if (item.targetType === 'codex' && item.rawEntity) {
      const c = item.rawEntity;
      lines.push(`• [CODEX ARCHIVE: ${item.badge}] "${item.title}"`);
      if (item.description) lines.push(`  - Description: ${item.description}`);
      if (c.tl !== undefined || c.tech_level !== undefined) {
        lines.push(`  - Tech Level: TL ${c.tl ?? c.tech_level}`);
      }
      if (c.ml !== undefined || c.meta_level !== undefined) {
        lines.push(`  - Meta Level: ML ${c.ml ?? c.meta_level}`);
      }
      if (c.traits || c.trait) {
        const traits = Array.isArray(c.trait) ? c.trait : (Array.isArray(c.traits) ? c.traits : [c.traits || c.trait]);
        lines.push(`  - Inherent Traits: ${traits.filter(Boolean).slice(0, 5).join(', ')}`);
      }
      if (c.inherent_attribute_modifiers) {
        lines.push(`  - Attribute Modifiers: ${JSON.stringify(c.inherent_attribute_modifiers)}`);
      }
      if (c.damage || c.armor_dr || c.craft_dc || c.dc) {
        const stats = [
          c.damage ? `Damage: ${c.damage}` : '',
          c.armor_dr ? `Armor DR: ${c.armor_dr}` : '',
          (c.craft_dc || c.dc) ? `DC: ${c.craft_dc || c.dc}` : ''
        ].filter(Boolean);
        if (stats.length > 0) lines.push(`  - Mechanical Specs: ${stats.join(' | ')}`);
      }
      lines.push('');
    } else if (item.targetType === 'compendium' && item.rawEntity) {
      const comp = item.rawEntity;
      lines.push(`• [COMPENDIUM RULEBOOK: ${item.badge}] "${item.title}"`);
      if (comp.relPath) lines.push(`  - Source File: ${comp.relPath}`);
      if (comp.description) {
        const cleanRule = comp.description.replace(/\s+/g, ' ').trim();
        lines.push(`  - Canonical Rule Excerpt: ${cleanRule.slice(0, 600)}`);
      }
      lines.push('');
    } else if (item.targetType === 'section') {
      lines.push(`• [PLATFORM SECTION: ${item.title.toUpperCase()}] "${item.title}" (${item.url})`);
      lines.push(`  - Role in Platform: ${item.description}`);
      lines.push('');
    } else {
      // Unresolved
      lines.push(`• [SPECIFIED ENTITY REFERENCE] "${item.title}"`);
      lines.push(`  - Context: Explicitly framed by author in [brackets]. Maintain narrative consistency with this entity name.`);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

