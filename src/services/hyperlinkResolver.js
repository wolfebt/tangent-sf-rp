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
import compendiumSeedData from '../data/compendiumSeed.json' with { type: 'json' };

/**
 * Platform Section dictionary with aliases, paths, badges, and descriptions.
 */
export const SECTION_REGISTRY = {
  folio: {
    key: 'folio',
    aliases: ['folio', 'persona', 'persona folio', 'character sheet', 'operative sheet', 'sheet', 'operative', 'operatives', 'roster'],
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

  // 1. Exact match against section key or official full label
  for (const section of Object.values(SECTION_REGISTRY)) {
    if (section.key === cleanTerm || section.label.toLowerCase() === cleanTerm) {
      return section;
    }
  }

  // 2. Exact match against defined aliases
  for (const section of Object.values(SECTION_REGISTRY)) {
    if (section.aliases.some(alias => alias.toLowerCase() === cleanTerm)) {
      return section;
    }
  }

  // 3. Whole phrase check: only if cleanTerm contains the full official section label (e.g. "view persona folio")
  for (const section of Object.values(SECTION_REGISTRY)) {
    const fullLabel = section.label.toLowerCase();
    if (fullLabel.length > 5 && cleanTerm.includes(fullLabel)) {
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
 * Searches dbData.compendium (with compendiumSeedData fallback) for a rulebook / compendium article by name, fileName, id, or clean title.
 */
export function matchCompendiumEntry(term, dbData = {}) {
  if (!term) return null;
  const clean = term.trim().toLowerCase().replace(/\.md$/i, '');
  const list = (Array.isArray(dbData?.compendium) && dbData.compendium.length > 0)
    ? dbData.compendium
    : (Array.isArray(compendiumSeedData) ? compendiumSeedData : []);

  if (list.length === 0) return null;

  // 1. Exact match on name, id, fileName (without .md), or stripped title (e.g. "1.01 CHARACTER CREATION" -> "CHARACTER CREATION")
  let found = list.find(item => {
    const name = (item.name || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
    const strippedName = name.replace(/^[\d.a-z_-]+\s*([—\-:]\s*)?/i, '').trim();
    return name === clean || id === clean || fn === clean || strippedName === clean;
  });
  if (found) return found;

  // 2. Prefix match on rule code (e.g. "1.01" or "01.01" matching master "1.01 CHARACTER CREATION")
  const codeMatch = clean.match(/^0?(\d+\.\d+)/);
  if (codeMatch) {
    const code = codeMatch[1];
    found = list.find(item => {
      const name = (item.name || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      return (name.startsWith(code + ' ') || id.includes(code.replace('.', '-'))) && 
             (item.isMasterDoc || item.masterDocId === item.id || item.parent?.includes('SOURCE OF TRUTH'));
    });
    if (found) return found;
  }

  // 3. Substring match on name or fileName or stripped title
  if (clean.length >= 3) {
    found = list.find(item => {
      const name = (item.name || '').toLowerCase();
      const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
      const strippedName = name.replace(/^[\d.a-z_-]+\s*([—\-:]\s*)?/i, '').trim();
      return name.includes(clean) || fn.includes(clean) || (clean.length >= 4 && strippedName.includes(clean));
    });
    if (found) return found;
  }

  return null;
}

/**
 * Assembles all available options (rules entry default, associated platform tools, sub-rules, parent rules)
 * for a compendium article.
 */
export function getAvailableOptionsForCompendium(item, dbData = {}) {
  const options = [];
  const list = (Array.isArray(dbData?.compendium) && dbData.compendium.length > 0)
    ? dbData.compendium
    : (Array.isArray(compendiumSeedData) ? compendiumSeedData : []);

  const primaryTitle = item.name || item.title || item.fileName || item.id;
  const isArch = item.perspective === 'architect' || item.id?.startsWith('doc-architect-');

  // 1. Primary Default Option: The full rules entry
  options.push({
    id: item.id || 'default-rule',
    title: primaryTitle,
    label: `${primaryTitle} (Rules Entry)`,
    sublabel: isArch ? 'Master Architect Rulebook Document' : 'Master Operator Rulebook Document',
    url: `/compendium?article=${encodeURIComponent(item.id)}`,
    targetType: 'compendium',
    badge: 'RULES ENTRY (DEFAULT)',
    icon: 'BookOpen',
    isDefault: true,
    description: item.description || ''
  });

  const normId = (item.id || '').toLowerCase();
  const normName = (item.name || '').toLowerCase();
  const normTags = Array.isArray(item.tags) ? item.tags.map(t => String(t).toLowerCase()) : [];

  // 2. Associated Platform Tools / Sections (Cross-Module Integration)
  if (
    normId.includes('character-creation') || 
    normId.includes('1-01') || 
    normName.includes('character creation') ||
    normTags.includes('character_creation') ||
    normTags.includes('1.01 character creation')
  ) {
    options.push({
      id: 'section-folio',
      title: 'Persona Folio',
      label: 'Persona Folio (Builder)',
      sublabel: 'Interactive Operative Character Sheet & Builder',
      url: '/folio',
      targetType: 'section',
      badge: 'PLATFORM BUILDER',
      icon: 'User'
    });
  }

  if (
    normId.includes('combat') || 
    normId.includes('3-00') || 
    normName.includes('combat') ||
    normTags.includes('combat')
  ) {
    options.push({
      id: 'section-stage',
      title: 'Tactical VTT Stage',
      label: 'Tactical VTT Stage',
      sublabel: 'Interactive Battlemap, Grid, Tokens & Action Deck',
      url: '/stage',
      targetType: 'section',
      badge: 'TACTICAL CANVAS',
      icon: 'Compass'
    });
  }

  if (
    normId.includes('species') || 
    normName.includes('species') ||
    normTags.includes('species')
  ) {
    options.push({
      id: 'section-codex-species',
      title: 'Terran Codex — Species',
      label: 'Codex: Species Directory',
      sublabel: 'Biological Profiles, Traits & Heritage',
      url: '/codex?category=species',
      targetType: 'codex',
      badge: 'CODEX DIRECTORY',
      icon: 'Database'
    });
    options.push({
      id: 'section-folio-species',
      title: 'Persona Folio',
      label: 'Persona Folio (Select Species)',
      sublabel: 'Apply Species Traits in Character Folio',
      url: '/folio',
      targetType: 'section',
      badge: 'FOLIO BUILDER',
      icon: 'User'
    });
  }

  if (
    normId.includes('occupation') || 
    normName.includes('occupation') ||
    normTags.includes('occupations')
  ) {
    options.push({
      id: 'section-codex-occupations',
      title: 'Terran Codex — Occupations',
      label: 'Codex: Occupations Directory',
      sublabel: 'Career Skill Packages & Features',
      url: '/codex?category=occupations',
      targetType: 'codex',
      badge: 'CODEX DIRECTORY',
      icon: 'Database'
    });
  }

  if (
    normId.includes('faction') || 
    normName.includes('faction') ||
    normTags.includes('factions')
  ) {
    options.push({
      id: 'section-codex-factions',
      title: 'Terran Codex — Factions',
      label: 'Codex: Factions Matrix',
      sublabel: 'Galactic Allegiances, Influence & Assets',
      url: '/codex?category=factions',
      targetType: 'codex',
      badge: 'CODEX DIRECTORY',
      icon: 'Database'
    });
  }

  if (
    normId.includes('economatrix') || 
    normId.includes('2-00') || 
    normName.includes('economy') ||
    normName.includes('equipment') ||
    normTags.includes('economy')
  ) {
    options.push({
      id: 'section-codex-weaponry',
      title: 'Terran Codex — Armory & Gear',
      label: 'Codex: Arsenal & Equipment',
      sublabel: 'Weapons, Armor, Augmentations & Tech Levels',
      url: '/codex?category=weaponry',
      targetType: 'codex',
      badge: 'CODEX DIRECTORY',
      icon: 'Database'
    });
  }

  if (
    normId.includes('architect') || 
    normId.includes('modular') ||
    normName.includes('architect') ||
    normTags.includes('architect')
  ) {
    options.push({
      id: 'section-foundry',
      title: 'Story Foundry / ADE',
      label: 'Story Foundry / ADE',
      sublabel: 'Adventure Development Environment & Scenarios',
      url: '/foundry',
      targetType: 'section',
      badge: 'PLATFORM ADE',
      icon: 'Sparkles'
    });
  }

  // 3. Child Sub-Rules / Modules (if this is a master or parent doc)
  const childDocs = list.filter(c => 
    c.id !== item.id && 
    (c.parent === item.id || c.masterDocId === item.id)
  );

  for (const child of childDocs) {
    const rawChildName = child.name || child.title || child.fileName || child.id;
    const cleanLabel = rawChildName.replace(/^[\d.a-z_-]+\s*([—\-:]\s*)?/i, '').trim() || rawChildName;
    options.push({
      id: child.id,
      title: rawChildName,
      label: cleanLabel,
      sublabel: child.entry_type || 'Sub-Rule Module',
      url: `/compendium?article=${encodeURIComponent(child.id)}`,
      targetType: 'compendium',
      badge: 'SUB-RULE',
      icon: 'FileText',
      description: child.description || ''
    });
  }

  // 4. Parent Rule and Siblings (if this is a child rule)
  if (item.parent && item.parent !== item.id) {
    const parentDoc = list.find(p => p.id === item.parent || p.name === item.parent);
    if (parentDoc && parentDoc.id !== item.id) {
      const pName = parentDoc.name || parentDoc.title || parentDoc.id;
      options.push({
        id: `parent-${parentDoc.id}`,
        title: pName,
        label: pName,
        sublabel: 'Parent Master Rulebook',
        url: `/compendium?article=${encodeURIComponent(parentDoc.id)}`,
        targetType: 'compendium',
        badge: 'PARENT RULE',
        icon: 'BookOpen'
      });

      const siblings = list.filter(s => 
        s.id !== item.id && 
        s.id !== parentDoc.id && 
        (s.parent === parentDoc.id || s.masterDocId === parentDoc.id)
      );
      for (const sib of siblings) {
        const rawSibName = sib.name || sib.title || sib.id;
        const cleanSibLabel = rawSibName.replace(/^[\d.a-z_-]+\s*([—\-:]\s*)?/i, '').trim() || rawSibName;
        options.push({
          id: sib.id,
          title: rawSibName,
          label: cleanSibLabel,
          sublabel: sib.entry_type || 'Sibling Module',
          url: `/compendium?article=${encodeURIComponent(sib.id)}`,
          targetType: 'compendium',
          badge: 'RELATED MODULE',
          icon: 'FileText'
        });
      }
    }
  }

  return options;
}

/**
 * Assembles available options for a Platform Section.
 */
export function getAvailableOptionsForPlatformSection(section, dbData = {}) {
  const options = [];
  const list = (Array.isArray(dbData?.compendium) && dbData.compendium.length > 0)
    ? dbData.compendium
    : (Array.isArray(compendiumSeedData) ? compendiumSeedData : []);

  options.push({
    id: `section-${section.key}`,
    title: section.label,
    label: section.label,
    sublabel: 'Primary Platform Application',
    url: section.url,
    targetType: 'section',
    badge: 'PLATFORM SECTION (DEFAULT)',
    icon: section.icon || 'Compass',
    isDefault: true
  });

  if (section.key === 'folio') {
    const charRule = list.find(c => c.id === 'doc-operator-1-01-character-creation' || (c.name || '').includes('1.01 CHARACTER CREATION'));
    if (charRule) {
      options.push({
        id: charRule.id,
        title: charRule.name || '1.01 CHARACTER CREATION',
        label: '1.01 Character Creation Rules',
        sublabel: 'Canonical 150 CP Creation Protocol',
        url: `/compendium?article=${encodeURIComponent(charRule.id)}`,
        targetType: 'compendium',
        badge: 'RULES ENTRY',
        icon: 'BookOpen'
      });
    }
    options.push({
      id: 'folio-roster',
      title: 'Hero Roster Drawer',
      label: 'Operative Roster',
      sublabel: 'View and switch active operatives',
      url: '/folio',
      targetType: 'section',
      badge: 'ROSTER',
      icon: 'Users'
    });
  }

  if (section.key === 'stage') {
    const combatRule = list.find(c => c.id === 'doc-operator-3-00-combat' || (c.name || '').includes('3.00 COMBAT'));
    if (combatRule) {
      options.push({
        id: combatRule.id,
        title: combatRule.name || '3.00 COMBAT',
        label: '3.00 Combat Rules',
        sublabel: 'Initiative, Action Economy & Resolution',
        url: `/compendium?article=${encodeURIComponent(combatRule.id)}`,
        targetType: 'compendium',
        badge: 'RULES ENTRY',
        icon: 'BookOpen'
      });
    }
  }

  if (section.key === 'codex') {
    options.push({
      id: 'codex-species',
      title: 'Species Catalog',
      label: 'Species Directory',
      sublabel: 'Explore all extraterrestrial & synthetic species',
      url: '/codex?category=species',
      targetType: 'codex',
      badge: 'CATALOG',
      icon: 'Database'
    });
    options.push({
      id: 'codex-weapons',
      title: 'Weaponry & Armory',
      label: 'Armory Directory',
      sublabel: 'Ballistic, energy & exotic weapons',
      url: '/codex?category=weaponry',
      targetType: 'codex',
      badge: 'CATALOG',
      icon: 'Database'
    });
  }

  return options;
}

/**
 * Helper to format a matched Compendium article into a resolved hyperlink target with available options.
 */
export function buildCompendiumResolution(item, displayLabel, dbData = {}) {
  const title = item.name || item.title || item.fileName || item.id;
  const rawDesc = (item.description || item.body || '').replace(/^#+\s+.*$/gm, '').replace(/[*_`>#|]/g, ' ').replace(/\s+/g, ' ').trim();
  const previewDesc = rawDesc ? rawDesc.slice(0, 260) + (rawDesc.length > 260 ? '…' : '') : 'Canonical rule document from the Tangent Compendium.';
  const isArch = item.perspective === 'architect' || item.id?.startsWith('doc-architect-');
  const options = getAvailableOptionsForCompendium(item, dbData);

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
    actionLabel: 'Open Rules Entry',
    rawEntity: item,
    options
  };
}

/**
 * Helper to format a matched Platform Section into a resolved target with available options.
 */
export function buildSectionResolution(section, displayLabel, dbData = {}) {
  const options = getAvailableOptionsForPlatformSection(section, dbData);
  return {
    targetType: 'section',
    title: section.label,
    displayLabel,
    url: section.url,
    badge: section.badge,
    description: section.description,
    tags: section.tags,
    colorTheme: section.colorTheme,
    icon: section.icon,
    exists: true,
    actionLabel: 'Jump to Section',
    rawEntity: section,
    options
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
      return buildSectionResolution(matchedSection, displayLabel, dbData);
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
      return buildCompendiumResolution(matchedComp, displayLabel, dbData);
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
  // Priority 1: Check Compendium Rules if identifier looks like a rule code or master compendium ID
  const looksLikeRuleCode = /^(\d+\.\d+|doc-operator-|doc-architect-|rule-|0\d+\.)/i.test(identifier.trim());
  if (looksLikeRuleCode) {
    const matchedCompFirst = matchCompendiumEntry(identifier, dbData);
    if (matchedCompFirst) {
      return buildCompendiumResolution(matchedCompFirst, displayLabel, dbData);
    }
  }

  // Priority 2: Check Platform Section
  const matchedSection = matchPlatformSection(identifier);
  if (matchedSection) {
    return buildSectionResolution(matchedSection, displayLabel, dbData);
  }

  // Priority 3: Check Elements Catalog
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

  // Priority 5: Check Compendium Rules (general title/topic fallback e.g. "Character Creation" or "Vehicular Combat")
  const matchedCompFallback = matchCompendiumEntry(identifier, dbData);
  if (matchedCompFallback) {
    return buildCompendiumResolution(matchedCompFallback, displayLabel, dbData);
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

