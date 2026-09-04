/**
 * @file entityHydrator.js
 * @description Resolves relational entity references (Species, Factions, Origins, Occupations, Weapons, Gear)
 * from Story Foundry element fields against local Omnicortex datasets, compendium seed, and user catalogs.
 */

import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_WEAPONRY } from '../data/weaponryData.js';
import { DEFAULT_ARMORING } from '../data/armoringData.js';
import compendiumSeed from '../data/compendiumSeed.json';

/**
 * Standardizes comparison strings
 */
function normalizeStr(str) {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds an entity in a given catalog by ID, name, or title
 */
function findInCatalog(catalog, identifier) {
  if (!catalog || !Array.isArray(catalog) || !identifier) return null;
  const target = normalizeStr(identifier);
  if (!target) return null;

  // Exact ID match
  const byId = catalog.find(item => item && item.id && normalizeStr(item.id) === target);
  if (byId) return byId;

  // Name or Title match
  const byName = catalog.find(item => {
    if (!item) return false;
    const nameMatch = item.name && normalizeStr(item.name) === target;
    const titleMatch = item.title && normalizeStr(item.title) === target;
    return nameMatch || titleMatch;
  });
  if (byName) return byName;

  // Soft fuzzy inclusion match
  return catalog.find(item => {
    if (!item) return false;
    const normName = normalizeStr(item.name || item.title || '');
    return normName && (normName.includes(target) || target.includes(normName));
  }) || null;
}

/**
 * Resolves a single entity from available catalogs
 */
export function resolveEntity(category, identifier, customCatalog = []) {
  if (!identifier) return null;

  // 1. Check user custom catalog first
  if (customCatalog && customCatalog.length > 0) {
    const customMatch = findInCatalog(customCatalog, identifier);
    if (customMatch) return { ...customMatch, _source: 'user_catalog' };
  }

  // 2. Check compiled Omnicortex static datasets
  let staticCatalog = null;
  switch (category) {
    case 'factions':
    case 'faction':
      staticCatalog = DEFAULT_FACTIONS;
      break;
    case 'species':
      staticCatalog = DEFAULT_SPECIES;
      break;
    case 'origins':
    case 'origin':
      staticCatalog = DEFAULT_ORIGINS;
      break;
    case 'occupations':
    case 'occupation':
      staticCatalog = DEFAULT_OCCUPATIONS;
      break;
    case 'weaponry':
    case 'weapons':
      staticCatalog = DEFAULT_WEAPONRY;
      break;
    case 'armoring':
    case 'armor':
      staticCatalog = DEFAULT_ARMORING;
      break;
    default:
      break;
  }

  if (staticCatalog) {
    const staticMatch = findInCatalog(staticCatalog, identifier);
    if (staticMatch) return { ...staticMatch, _source: 'omnicortex_static' };
  }

  // 3. Check Compendium Seed articles as fallback
  const compendiumMatch = findInCatalog(compendiumSeed, identifier);
  if (compendiumMatch) {
    return { ...compendiumMatch, _source: 'compendium_seed' };
  }

  return null;
}

/**
 * Hydrates all relational entity references on an active Story Element
 * @param {Object} element - The active story element node
 * @param {Array} customCatalog - The user's independent elements catalog
 * @returns {Object} Structured hydrated entity data and formatted prompt summary
 */
export function hydrateElementEntities(element, customCatalog = []) {
  if (!element || typeof element !== 'object') {
    return { hydrated: {}, summary: '' };
  }

  const fields = element.fields || {};
  const hydrated = {};

  // Resolve Faction
  const factionId = fields['char-faction'] || fields['linkedFaction'] || fields['faction'];
  if (factionId) {
    const rawFaction = resolveEntity('factions', factionId, customCatalog);
    if (rawFaction) {
      hydrated.faction = {
        name: rawFaction.name || rawFaction.title || factionId,
        techLevel: rawFaction.tech_level ?? rawFaction.tl ?? 3,
        metaLevel: rawFaction.meta_level ?? rawFaction.ml ?? 0,
        mandate: rawFaction.driving_mandate || rawFaction.mandate || '',
        archetype: rawFaction.archetype || rawFaction.faction_type || '',
        capitalWorld: rawFaction.capital_world || '',
        skillPackage: rawFaction.skill_package || [],
        description: rawFaction.description || ''
      };
    }
  }

  // Resolve Species
  const speciesId = fields['char-species'] || fields['species'];
  if (speciesId) {
    const rawSpecies = resolveEntity('species', speciesId, customCatalog);
    if (rawSpecies) {
      hydrated.species = {
        name: rawSpecies.name || rawSpecies.title || speciesId,
        lineage: rawSpecies.parent_species || rawSpecies.lineage || '',
        size: rawSpecies.size || 'Medium',
        stigma: rawSpecies.stigma || '',
        traits: Array.isArray(rawSpecies.trait) ? rawSpecies.trait : (rawSpecies.traits ? [rawSpecies.traits] : []),
        modifiers: rawSpecies.inherent_attribute_modifiers || {},
        description: rawSpecies.description || ''
      };
    }
  }

  // Resolve Origin
  const originId = fields['char-origin'] || fields['origin'];
  if (originId) {
    const rawOrigin = resolveEntity('origins', originId, customCatalog);
    if (rawOrigin) {
      hydrated.origin = {
        name: rawOrigin.name || rawOrigin.title || originId,
        description: rawOrigin.description || '',
        skillPackage: rawOrigin.skill_package || []
      };
    }
  }

  // Resolve Occupation
  const occuId = fields['char-occu'] || fields['occupation'];
  if (occuId) {
    const rawOccu = resolveEntity('occupations', occuId, customCatalog);
    if (rawOccu) {
      hydrated.occupation = {
        name: rawOccu.name || rawOccu.title || occuId,
        description: rawOccu.description || '',
        skillPackage: rawOccu.skill_package || []
      };
    }
  }

  // Resolve Gear or Weaponry if present
  const gearRefs = fields['gear'] || fields['weaponry'] || fields['armoring'];
  if (gearRefs) {
    const gearList = Array.isArray(gearRefs) ? gearRefs : [gearRefs];
    hydrated.gear = gearList.map(g => {
      const resolved = resolveEntity('weaponry', g, customCatalog) || resolveEntity('armoring', g, customCatalog);
      if (resolved) {
        return {
          name: resolved.name || resolved.title || g,
          techLevel: resolved.tech_level ?? resolved.tl ?? 3,
          metaLevel: resolved.meta_level ?? resolved.ml ?? 0,
          description: resolved.description || ''
        };
      }
      return { name: String(g) };
    });
  }

  const summary = formatHydratedContext(hydrated);
  return { hydrated, summary };
}

/**
 * Formats hydrated entity attributes into a concise prompt context block
 */
export function formatHydratedContext(hydrated) {
  if (!hydrated || Object.keys(hydrated).length === 0) return '';

  const lines = ['[RESOLVED RPG ENTITY STATBLOCKS & CANONICAL LORE]:'];

  if (hydrated.faction) {
    const f = hydrated.faction;
    let fLine = `- Faction: ${f.name} (Tech Level: TL ${f.techLevel} | Meta Level: ML ${f.metaLevel})`;
    if (f.archetype) fLine += ` [Archetype: ${f.archetype}]`;
    if (f.mandate) fLine += `\n  * Driving Mandate: "${f.mandate}"`;
    if (f.capitalWorld) fLine += `\n  * Capital World: ${f.capitalWorld}`;
    if (f.description) fLine += `\n  * Doctrine & Aesthetic: ${f.description.slice(0, 180)}...`;
    lines.push(fLine);
  }

  if (hydrated.species) {
    const s = hydrated.species;
    let sLine = `- Species: ${s.name}`;
    if (s.lineage) sLine += ` (Lineage: ${s.lineage} | Size: ${s.size})`;
    if (s.stigma) sLine += `\n  * Social Stigma: ${s.stigma}`;
    if (s.traits && s.traits.length > 0) sLine += `\n  * Inherent Traits: ${s.traits.slice(0, 4).join(', ')}`;
    if (s.description) sLine += `\n  * Physiology & Nature: ${s.description.slice(0, 180)}...`;
    lines.push(sLine);
  }

  if (hydrated.origin) {
    const o = hydrated.origin;
    lines.push(`- Origin / Habitat: ${o.name}${o.description ? ` (${o.description.slice(0, 120)}...)` : ''}`);
  }

  if (hydrated.occupation) {
    const oc = hydrated.occupation;
    lines.push(`- Occupation / Calling: ${oc.name}${oc.description ? ` (${oc.description.slice(0, 120)}...)` : ''}`);
  }

  if (hydrated.gear && hydrated.gear.length > 0) {
    const gearSummaries = hydrated.gear.map(g => `${g.name}${g.techLevel !== undefined ? ` [TL ${g.techLevel}]` : ''}`);
    lines.push(`- Equipment & Arsenal: ${gearSummaries.join(', ')}`);
  }

  return lines.join('\n');
}

export default {
  resolveEntity,
  hydrateElementEntities,
  formatHydratedContext
};
