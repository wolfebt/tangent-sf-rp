/**
 * @file cortexAdeAssetBridge.js
 * @description Unified bidirectional projection & consolidation bridge connecting:
 *   1. OmniCortex Database (`DBMContext.dbData`) & Codex Studio (`CODEX_MATRICES`)
 *   2. Persona Folio (`FolioContext.roster` / `personaRoster` / `publicPersonas`)
 *   3. Modular Character Matrix (`dbData.modular_characters`)
 *   4. ADE Story Module (`CampaignContext.elementsCatalog`)
 *
 * Ensures Cortex assets have full, live representation in ADE (`ElementForge`, `ADENavRail`,
 * Weaver, MapMaker, Asset Hub, and VTT Stage) and consolidates ADE-authored fields directly
 * back into canonical OmniCortex collections without lossy duplication.
 */

import {
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory
} from '../pages/Foundry/ElementForge/elementSchemas.js';
import {
  convertFolioToPersonaElement,
  convertPersonaElementToFolio,
  convertMcmToFolioPersona,
  convertFolioToMcmRecord,
  buildVttUnitFromPersona
} from './personaBridge.js';
import { DEFAULT_SYNTHESIS } from '../data/synthesisData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';

export const CORTEX_PROPERTY_COLLECTIONS = PROPERTY_SUBCATEGORIES.map(s => s.dbmCollection);
export const CORTEX_METAPHYSICS_COLLECTIONS = METAPHYSICS_SUBCATEGORIES.map(s => s.dbmCollection);

export const COLLECTION_TO_ADE_TYPE = {
  species: 'Species',
  factions: 'Faction',
  weaponry: 'Property',
  armoring: 'Property',
  augmentations: 'Property',
  gear: 'Property',
  mecha: 'Property',
  architecture: 'Property',
  technology: 'Property',
  other: 'Property',
  modular_characters: 'Persona',
  planetary_design: 'World',
  world: 'World',
  universe: 'Universe',
  setting: 'Setting',
  scene: 'Scene',
  philosophy: 'Philosophy',
  invocations: 'Metaphysics',
  disciplines: 'Metaphysics',
  special_abilities: 'Metaphysics'
};

export const ADE_TYPE_TO_CORTEX_COLLECTIONS = {
  Persona: ['modular_characters'],
  Species: ['species'],
  Faction: ['factions'],
  Property: CORTEX_PROPERTY_COLLECTIONS,
  Metaphysics: CORTEX_METAPHYSICS_COLLECTIONS,
  World: ['planetary_design', 'world'],
  Universe: ['universe'],
  Setting: ['setting'],
  Scene: ['scene'],
  Philosophy: ['philosophy']
};

export const COLLECTION_TO_CODEX_MATRIX = {
  species: 'species',
  factions: 'factions',
  weaponry: 'weaponry',
  armoring: 'armor',
  augmentations: 'augmentations',
  gear: 'equipment',
  mecha: 'mecha',
  architecture: 'architecture',
  technology: 'technology',
  other: 'other',
  modular_characters: 'modular-characters',
  planetary_design: 'planetary-design',
  invocations: 'invocation'
};

export const CORTEX_BACKED_ADE_TYPES = new Set(Object.keys(ADE_TYPE_TO_CORTEX_COLLECTIONS));

// ═══════════════════════════════════════════════════════════════════════════
// CRISP VISUAL SYNTHESIS DESCRIPTOR RESOLVER (Embedded Within Parent Assets)
// ═══════════════════════════════════════════════════════════════════════════

const FACTION_LABEL_TO_SYNTHESIS_IDS = {
  IMPYRIUM: ['faction-impyrium', 'faction-radiant-impyrium'],
  SYNDICATE: ['faction-syndicate'],
  DYNASTY: ['faction-dracon-dynasty', 'faction-dynasty', 'faction-draconian-order'],
  OUTWORLDS: ['faction-outworlds'],
  COALITION: ['faction-coalition'],
  AULURAN: ['faction-auluran-clans', 'faction-auluran'],
  'ALTERIAN ENCLAVE': ['faction-alterian-enclave', 'faction-silvermoon-vanguard', 'faction-aeld-providence'],
  ASCENDANCY: ['faction-ascendancy'],
  'ENTARI COMBINE': ['faction-entari-combine'],
  MEKAN: ['faction-mekan'],
  'KITIN COLLECTIVE (THE STAR HIVE)': ['faction-kitin-collective']
};

let cachedOccupationFactionBlocks = null;
function getOccupationFactionBlocksMap() {
  if (cachedOccupationFactionBlocks) return cachedOccupationFactionBlocks;
  cachedOccupationFactionBlocks = new Map();
  for (const occ of Array.isArray(DEFAULT_OCCUPATIONS) ? DEFAULT_OCCUPATIONS : []) {
    const text = occ?.full_text || '';
    const secIdx = text.indexOf('Occupation Character Visual Synthesis');
    if (secIdx === -1) continue;
    const tail = text.slice(secIdx);
    const regex = /\*\s+\*\*([A-Z\s()]+?):\*\*\s*\n([\s\S]*?)(?=\n\*\s+\*\*[A-Z\s()]+?:\*\*|$)/g;
    let m;
    while ((m = regex.exec(tail)) !== null) {
      const facLabel = m[1].trim();
      const block = m[2]
        .replace(/\s+/g, ' ')
        .replace(/^\*\s+\*\*/, '')
        .replace(/\*\s+\*\*/g, ' | ')
        .replace(/\*\*/g, '')
        .trim();
      const facIds = FACTION_LABEL_TO_SYNTHESIS_IDS[facLabel] || [];
      for (const fId of facIds) {
        cachedOccupationFactionBlocks.set(`${occ.id}:${fId}`, {
          factionLabel: facLabel,
          occupationName: occ.name,
          description: `Occupation: ${occ.name} | Faction: ${facLabel} | ${block}`
        });
      }
    }
  }
  return cachedOccupationFactionBlocks;
}

let cachedEnrichedDefaultSynthesis = null;
function getEnrichedDefaultSynthesis() {
  if (cachedEnrichedDefaultSynthesis) return cachedEnrichedDefaultSynthesis;
  const occBlocks = getOccupationFactionBlocksMap();
  cachedEnrichedDefaultSynthesis = (Array.isArray(DEFAULT_SYNTHESIS) ? DEFAULT_SYNTHESIS : []).map(entry => {
    if (entry?.synthesis_type === 'occupation_character' && entry.occupation_id && entry.faction_id) {
      const rich = occBlocks.get(`${entry.occupation_id}:${entry.faction_id}`);
      if (rich && (!entry.description || entry.description.includes('High-fidelity cinematic character concept'))) {
        return {
          ...entry,
          description: rich.description
        };
      }
    }
    return entry;
  });
  return cachedEnrichedDefaultSynthesis;
}

const EMPTY_SYNTHESIS_RESULT = Object.freeze({
  entries: [],
  markdownSection: '',
  summaryText: '',
  architectureText: '',
  attireText: '',
  sceneryText: '',
  characterText: ''
});

const NON_SYNTHESIS_COLLECTIONS = new Set([
  'invocations',
  'disciplines',
  'special_abilities',
  'philosophy',
  'universe',
  'scene'
]);

let cachedDefaultSynthesisIndex = null;
function getDefaultSynthesisIndex() {
  if (cachedDefaultSynthesisIndex) return cachedDefaultSynthesisIndex;
  const catalog = getEnrichedDefaultSynthesis();
  const archByFaction = new Map();
  const attireByFaction = new Map();
  const sceneryByFaction = new Map();
  const sceneryByOrigin = new Map();
  const charByFaction = new Map();
  const charByOccupation = new Map();

  const pushMap = (map, key, item) => {
    if (!key) return;
    let bucket = map.get(key);
    if (!bucket) {
      bucket = [];
      map.set(key, bucket);
    }
    bucket.push(item);
  };

  for (const s of catalog) {
    const sType = s.synthesis_type || '';
    const sFac = String(s.faction_id || '').trim().toLowerCase();
    const sOrig = String(s.origin_id || '').trim().toLowerCase();
    const sOcc = String(s.occupation_id || '').trim().toLowerCase();

    if (sType === 'faction_architecture') {
      pushMap(archByFaction, sFac, s);
    } else if (sType === 'faction_attire') {
      pushMap(attireByFaction, sFac, s);
    } else if (sType === 'origin_scenery') {
      pushMap(sceneryByFaction, sFac, s);
      pushMap(sceneryByOrigin, sOrig, s);
    } else if (sType === 'occupation_character') {
      pushMap(charByFaction, sFac, s);
      pushMap(charByOccupation, sOcc, s);
    }
  }

  cachedDefaultSynthesisIndex = {
    archByFaction,
    attireByFaction,
    sceneryByFaction,
    sceneryByOrigin,
    charByFaction,
    charByOccupation
  };
  return cachedDefaultSynthesisIndex;
}

const mergeSynthesisCatalogs = (customSynthesis) => {
  const base = getEnrichedDefaultSynthesis();
  if (!Array.isArray(customSynthesis) || customSynthesis.length === 0) return base;
  const occBlocks = getOccupationFactionBlocksMap();
  const seen = new Set();
  const merged = [];
  for (const item of [...customSynthesis, ...base]) {
    if (!item || typeof item !== 'object') continue;
    const key = String(item.id || item.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (item.synthesis_type === 'occupation_character' && item.occupation_id && item.faction_id) {
      const rich = occBlocks.get(`${item.occupation_id}:${item.faction_id}`);
      if (rich && (!item.description || item.description.includes('High-fidelity cinematic character concept'))) {
        merged.push({ ...item, description: rich.description });
        continue;
      }
    }
    merged.push(item);
  }
  return merged;
};

export function resolveSynthesisFactionIds(rawRef) {
  if (!rawRef) return [];
  const list = Array.isArray(rawRef) ? rawRef : [rawRef];
  const resolved = new Set();

  for (const item of list) {
    const str = String(typeof item === 'object' && item !== null ? (item.id || item.name || '') : item)
      .trim()
      .toLowerCase();
    if (!str) continue;

    if (str.startsWith('faction-') || str.startsWith('fac_')) {
      resolved.add(str);
    }
    if (str.includes('alterian') || str.includes('silvermoon') || str.includes('celestine')) {
      resolved.add('faction-alterian-enclave');
    }
    if (str.includes('aeld-providence') || str.includes('aeld providence')) {
      resolved.add('faction-alterian-enclave');
      resolved.add('faction-kovian-tribunal');
      resolved.add('faction-vajar');
      resolved.add('faction-dracon-dynasty');
      resolved.add('faction-dynasty');
    }
    if (str.includes('ascendancy')) {
      resolved.add('faction-ascendancy');
    }
    if (str.includes('auluran')) {
      resolved.add('faction-auluran-clans');
      resolved.add('faction-auluran');
    }
    if (str.includes('coalition') || str.includes('independent worlds')) {
      resolved.add('faction-coalition');
    }
    if (str.includes('dracon') || str.includes('dynasty')) {
      resolved.add('faction-dracon-dynasty');
      resolved.add('faction-dynasty');
    }
    if (str.includes('entari') || str.includes('combine')) {
      resolved.add('faction-entari-combine');
    }
    if (str.includes('impyrium')) {
      resolved.add('faction-impyrium');
      resolved.add('faction-radiant-impyrium');
    }
    if (str.includes('kovian') || str.includes('tribunal')) {
      resolved.add('faction-kovian-tribunal');
    }
    if (str.includes('mekan')) {
      resolved.add('faction-mekan');
    }
    if (str.includes('outworld')) {
      resolved.add('faction-outworlds');
    }
    if (str.includes('syndicate') || str.includes('incorporated planetary')) {
      resolved.add('faction-syndicate');
    }
    if (str.includes('vajar')) {
      resolved.add('faction-vajar');
    }
    if (str.includes('kitin') || str.includes('star hive')) {
      resolved.add('faction-kitin-collective');
    }
  }

  return Array.from(resolved);
}

export function resolveSynthesisOriginIds(rawRef) {
  if (!rawRef) return [];
  const list = Array.isArray(rawRef) ? rawRef : [rawRef];
  const resolved = new Set();

  for (const item of list) {
    const str = String(typeof item === 'object' && item !== null ? (item.id || item.name || '') : item)
      .trim()
      .toLowerCase();
    if (!str) continue;

    if (str.startsWith('origin-')) resolved.add(str);
    if (/\b(agricultural|agri|farm|pastoral|biosphere)\b/.test(str)) resolved.add('origin-agricultural');
    if (/\b(aquatic|ocean|oceanic|submerged|pelagic|water)\b/.test(str)) resolved.add('origin-aquatic');
    if (/\b(colony|frontier|outpost|borderland)\b/.test(str)) resolved.add('origin-colony');
    if (/\b(enlightened|sanctuary|monastery|temple|arcane)\b/.test(str)) resolved.add('origin-enlightened');
    if (/\b(hostile|death world|extreme|wasteland|storm-lashed|toxic)\b/.test(str)) resolved.add('origin-hostile');
    if (/\b(industrial|foundry|forge|shipyard|factory|mining)\b/.test(str)) resolved.add('origin-industrial');
    if (/\b(leisure|resort|paradise|pleasure)\b/.test(str)) resolved.add('origin-leisure');
    if (/\b(militaristic|military|stronghold|fortress|bastion|citadel|garrison)\b/.test(str)) resolved.add('origin-militaristic');
    if (/\b(research|science|laboratory|observatory|archive)\b/.test(str)) resolved.add('origin-research');
    if (/\b(spacer|orbital|station|deep void|zero-g|starship|asteroid)\b/.test(str)) resolved.add('origin-spacer');
    if (/\b(urban|sprawl|arcology|core world|metropolis|capital)\b/.test(str)) resolved.add('origin-urban');
  }

  return Array.from(resolved);
}

export function resolveSynthesisOccupationIds(rawRef) {
  if (!rawRef) return [];
  const list = Array.isArray(rawRef) ? rawRef : [rawRef];
  const resolved = new Set();

  for (const item of list) {
    const str = String(typeof item === 'object' && item !== null ? (item.id || item.name || '') : item)
      .trim()
      .toLowerCase();
    if (!str) continue;

    if (str.startsWith('occupation-')) resolved.add(str);
    if (/\b(adept|psionic|mystic|mage|shaman|monk|blaster|controller|visionary)\b/.test(str)) resolved.add('occupation-adept');
    if (/\b(agent|operative|spy|assassin|bounty|detective|sniper|infiltrator|ghost)\b/.test(str)) resolved.add('occupation-agent');
    if (/\b(builder|engineer|mechanic|architect|armorer|artificer)\b/.test(str)) resolved.add('occupation-builder');
    if (/\b(citizen|civilian|colonist)\b/.test(str)) resolved.add('occupation-citizen');
    if (/\b(criminal|pirate|smuggler|thief|enforcer|syndicate)\b/.test(str)) resolved.add('occupation-criminal');
    if (/\b(drifter|nomad|scavenger|wanderer)\b/.test(str)) resolved.add('occupation-drifter');
    if (/\b(entertainer|performer|artist|bard)\b/.test(str)) resolved.add('occupation-entertainer');
    if (/\b(merchant|trader|broker|quartermaster)\b/.test(str)) resolved.add('occupation-merchant');
    if (/\b(representative|diplomat|commander|officer|envoy|noble)\b/.test(str)) resolved.add('occupation-representative');
    if (/\b(scholar|scientist|researcher|medic|doctor|surgeon|healer|savant)\b/.test(str)) resolved.add('occupation-scholar');
    if (/\b(scout|explorer|ranger|pilot|pathfinder)\b/.test(str)) resolved.add('occupation-scout');
    if (/\b(soldier|trooper|vanguard|warrior|tank|bruiser|striker|gunslinger|sentinel)\b/.test(str)) resolved.add('occupation-soldier');
    if (/\b(specialist|slicer|hacker|technician|operator|buffer)\b/.test(str)) resolved.add('occupation-specialist');
  }

  return Array.from(resolved);
}

/**
 * Resolves and formats the matching CRISP Visual Synthesis descriptors for a parent asset
 * so that synthesis descriptions live directly inside the content and aesthetic fields of the asset.
 */
export function resolveSynthesisDescriptorsForAsset(record, collectionKey, customSynthesis = []) {
  if (!record || typeof record !== 'object') {
    return EMPTY_SYNTHESIS_RESULT;
  }

  const hasCustomSynthesis = Array.isArray(customSynthesis) && customSynthesis.length > 0;
  if (
    !hasCustomSynthesis &&
    NON_SYNTHESIS_COLLECTIONS.has(collectionKey) &&
    !record.faction_id &&
    !record.faction &&
    !record.origin_id &&
    !record.origin &&
    !record.occupation_id &&
    !record.occupation
  ) {
    return EMPTY_SYNTHESIS_RESULT;
  }

  const rawId = String(record.id || record.dbmId || '').trim().toLowerCase();
  const rawName = String(record.name || record.title || record['char-name'] || '').trim().toLowerCase();

  const factionIds = resolveSynthesisFactionIds([
    collectionKey === 'factions' ? rawId : '',
    collectionKey === 'factions' ? rawName : '',
    record.faction_id,
    record.faction,
    record['char-faction'],
    record.faction_skin,
    record.style,
    record.factionArchetype,
    record.dominant_faction,
    record.societiesGovernance,
    record.creator,
    ...(Array.isArray(record.recommended_factions) ? record.recommended_factions : [record.recommended_factions])
  ]);

  const originIds = resolveSynthesisOriginIds([
    record.origin_id,
    record.origin,
    record['char-origin'],
    record.habitat,
    record.environment,
    record.world,
    record.homeworld,
    record.planetaryGeography,
    record.geography,
    record.highConcept,
    ...(Array.isArray(record.recommended_origins) ? record.recommended_origins : [record.recommended_origins])
  ]);

  const occupationIds = resolveSynthesisOccupationIds([
    record.occupation_id,
    record.occupation,
    record['char-occu'],
    record.competencyRole,
    record.role,
    record.sphere,
    record['char-archetype'],
    ...(Array.isArray(record.recommended_occupations) ? record.recommended_occupations : [record.recommended_occupations])
  ]);

  if (!hasCustomSynthesis && factionIds.length === 0 && originIds.length === 0 && occupationIds.length === 0) {
    return EMPTY_SYNTHESIS_RESULT;
  }

  const facSet = new Set(factionIds);
  const origSet = new Set(originIds);
  const occSet = new Set(occupationIds);

  const archEntries = [];
  const attireEntries = [];
  const sceneryEntries = [];
  const characterEntries = [];
  const otherEntries = [];

  if (!hasCustomSynthesis) {
    const idx = getDefaultSynthesisIndex();
    for (const fId of factionIds) {
      const aList = idx.archByFaction.get(fId);
      if (aList) archEntries.push(...aList);
      const tList = idx.attireByFaction.get(fId);
      if (tList) attireEntries.push(...tList);
      if (collectionKey === 'factions') {
        const sList = idx.sceneryByFaction.get(fId);
        if (sList) sceneryEntries.push(...sList);
        const cList = idx.charByFaction.get(fId);
        if (cList) characterEntries.push(...cList);
      }
    }
    if (collectionKey !== 'factions') {
      for (const oId of originIds) {
        const sList = idx.sceneryByOrigin.get(oId);
        if (sList) {
          for (const s of sList) {
            const sFac = String(s.faction_id || '').trim().toLowerCase();
            if (facSet.size === 0 || (sFac && facSet.has(sFac))) {
              sceneryEntries.push(s);
            }
          }
        }
      }
      for (const ocId of occupationIds) {
        const cList = idx.charByOccupation.get(ocId);
        if (cList) {
          for (const s of cList) {
            const sFac = String(s.faction_id || '').trim().toLowerCase();
            if (facSet.size === 0 || (sFac && facSet.has(sFac))) {
              characterEntries.push(s);
            }
          }
        }
      }
    }
  } else {
    const catalog = mergeSynthesisCatalogs(customSynthesis);
    for (const s of catalog) {
      const tId = String(s.target_id || s.asset_id || s.element_id || '').trim().toLowerCase();
      const sFac = String(s.faction_id || '').trim().toLowerCase();
      if ((tId && (tId === rawId || tId === rawName)) || (sFac && sFac === rawId)) {
        otherEntries.push(s);
      }
      const sType = s.synthesis_type || '';
      const sOrig = String(s.origin_id || '').trim().toLowerCase();
      const sOcc = String(s.occupation_id || '').trim().toLowerCase();

      if (sType === 'faction_architecture' && sFac && facSet.has(sFac)) {
        archEntries.push(s);
      } else if (sType === 'faction_attire' && sFac && facSet.has(sFac)) {
        attireEntries.push(s);
      } else if (sType === 'origin_scenery') {
        if (collectionKey === 'factions' && sFac && facSet.has(sFac)) {
          sceneryEntries.push(s);
        } else if (origSet.size > 0 && sOrig && origSet.has(sOrig)) {
          if (facSet.size === 0 || (sFac && facSet.has(sFac))) {
            sceneryEntries.push(s);
          }
        }
      } else if (sType === 'occupation_character') {
        if (collectionKey === 'factions' && sFac && facSet.has(sFac)) {
          characterEntries.push(s);
        } else if (occSet.size > 0 && sOcc && occSet.has(sOcc)) {
          if (facSet.size === 0 || (sFac && facSet.has(sFac))) {
            characterEntries.push(s);
          }
        }
      }
    }
  }

  // Deduplicate within each bucket and cap large matrix lists cleanly
  const uniq = (arr) => {
    const seen = new Set();
    return arr.filter(x => {
      const k = x?.id || x?.name;
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const uArch = uniq(archEntries);
  const uAttire = uniq(attireEntries);
  const uScenery = uniq(sceneryEntries).slice(0, collectionKey === 'factions' ? 11 : 4);
  const uChar = uniq(characterEntries).slice(0, collectionKey === 'factions' ? 13 : 4);
  const uOther = uniq(
    otherEntries.filter(
      x => !uArch.includes(x) && !uAttire.includes(x) && !uScenery.includes(x) && !uChar.includes(x)
    )
  );

  const allEntries = [...uArch, ...uAttire, ...uScenery, ...uChar, ...uOther];
  if (allEntries.length === 0) {
    return EMPTY_SYNTHESIS_RESULT;
  }

  const architectureText = uArch.map(e => e.description || e.crisp_prompt || '').filter(Boolean).join('\n');
  const attireText = uAttire.map(e => e.description || e.crisp_prompt || '').filter(Boolean).join('\n');
  const sceneryText = uScenery.map(e => e.description || e.crisp_prompt || '').filter(Boolean).join('\n');
  const characterText = uChar.map(e => e.description || e.crisp_prompt || '').filter(Boolean).join('\n');
  const otherText = uOther.map(e => e.description || e.crisp_prompt || '').filter(Boolean).join('\n');

  const lines = ['## Visual Synthesis & Aesthetic Descriptors'];
  if (uArch.length > 0) {
    lines.push('### Architectural Keyframe Synthesis');
    for (const e of uArch) {
      lines.push(`- **${e.name}:** ${e.description}${e.crisp_prompt ? ` *(Prompt: \`${e.crisp_prompt}\`)*` : ''}`);
    }
  }
  if (uAttire.length > 0) {
    lines.push('### Attire, Uniforms & Livery Synthesis');
    for (const e of uAttire) {
      lines.push(`- **${e.name}:** ${e.description}${e.crisp_prompt ? ` *(Prompt: \`${e.crisp_prompt}\`)*` : ''}`);
    }
  }
  if (uScenery.length > 0) {
    lines.push('### Habitat & Origin Scenery Synthesis');
    for (const e of uScenery) {
      lines.push(`- **${e.name}:** ${e.description}`);
    }
  }
  if (uChar.length > 0) {
    lines.push('### Character & Occupational Visual Synthesis');
    for (const e of uChar) {
      lines.push(`- **${e.name}:** ${e.description}`);
    }
  }
  if (uOther.length > 0) {
    for (const e of uOther) {
      lines.push(`- **${e.name}:** ${e.description}`);
    }
  }

  const markdownSection = lines.join('\n');
  const summaryText = [architectureText, attireText, sceneryText, characterText, otherText]
    .filter(Boolean)
    .join('\n');

  return {
    entries: allEntries,
    markdownSection,
    summaryText,
    architectureText,
    attireText,
    sceneryText,
    characterText
  };
}

function appendSynthesisToContent(baseContent = '', markdownSection = '') {
  if (!markdownSection) return baseContent;
  const trimmed = String(baseContent || '').trim();
  if (!trimmed) return markdownSection;
  if (trimmed.includes('## Visual Synthesis & Aesthetic Descriptors')) return trimmed;
  return `${trimmed}\n\n${markdownSection}`;
}

const toText = (val) => {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) {
    return val
      .map(item => (typeof item === 'object' && item !== null ? (item.name || item.label || item.id || '') : String(item)))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch (_) {
      return '';
    }
  }
  return String(val);
};

const pickLorebookFieldsFromRecord = (record = {}) => ({
  oneLinePitch: record.oneLinePitch || '',
  primaryTriggers: toText(record.primaryTriggers),
  secondaryTriggers: toText(record.secondaryTriggers),
  triggerRegex: record.triggerRegex || '',
  loreSnippet: record.loreSnippet || '',
  loreScanPriority: record.loreScanPriority !== undefined ? String(record.loreScanPriority) : (record.injectionPriority !== undefined ? String(record.injectionPriority) : ''),
  loreBudgetTokens: record.loreBudgetTokens !== undefined ? String(record.loreBudgetTokens) : '',
  loreSuppressCondition: record.loreSuppressCondition || '',
  loreRequireCondition: record.loreRequireCondition || record.conditionExpression || '',
  keywords: toText(record.keywords),
  negative_keywords: toText(record.negative_keywords)
});

function buildPlainTextPreview(rawContent = '') {
  if (!rawContent) return '';
  const slice = String(rawContent).slice(0, 260);
  return slice
    .replace(/<[^>]*>/g, ' ')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

function buildSearchHaystack(el) {
  return [
    el.title,
    el.name,
    el.dbmCategory,
    el.propertySubcategory,
    el.metaphysicsSubcategory,
    el.fields?.oneLinePitch,
    el.fields?.summary,
    el.fields?.archetype,
    el.fields?.discipline,
    el.fields?.faction_type
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const projectedCortexWeakCache = new WeakMap();
const projectedFolioWeakCache = new WeakMap();

/**
 * Projects a single OmniCortex / Codex record into a canonical ADE ElementRecord,
 * embedding any matching CRISP Visual Synthesis descriptors directly into the asset's content and fields.
 */
export function projectOmnicortexRecordToAdeElement(record, collectionKey, options = {}) {
  if (!record || typeof record !== 'object' || !collectionKey) return null;

  const hasCustomSynth = Array.isArray(options.synthesisCatalog) && options.synthesisCatalog.length > 0;
  if (!hasCustomSynth) {
    const byCol = projectedCortexWeakCache.get(record);
    if (byCol && byCol.has(collectionKey)) {
      return byCol.get(collectionKey);
    }
  }

  const rawId = String(record.id || record.name || '').trim();
  if (!rawId) return null;

  const adeType = COLLECTION_TO_ADE_TYPE[collectionKey] || 'Custom';
  const title = String(record.name || record.title || 'Untitled Cortex Asset').trim();
  const codexMatrixId = COLLECTION_TO_CODEX_MATRIX[collectionKey] || null;
  const baseLorebook = pickLorebookFieldsFromRecord(record);
  const synthesis = resolveSynthesisDescriptorsForAsset(record, collectionKey, options.synthesisCatalog);

  let fields = {
    ...baseLorebook,
    dbmCategory: collectionKey,
    dbmId: rawId,
    ...(synthesis.summaryText ? { visualSynthesis: synthesis.summaryText } : {})
  };

  let sourceOrigin = 'omnicortex';
  let propertySubcategory = undefined;
  let personaSubcategory = undefined;
  let metaphysicsSubcategory = undefined;

  if (collectionKey === 'species') {
    fields = {
      ...fields,
      speciesName: title,
      parent_species: toText(record.parent_species),
      classification: toText(record.type || record.species_type || 'Humanoid'),
      size: toText(record.size || 'Medium'),
      oneLinePitch: record.oneLinePitch || toText(record.stigma) || '',
      physicalDescription: record.physiologyBiology || record.description || record.body || synthesis.summaryText || '',
      abilitiesPowers: record.mechanic || toText(record.trait) || toText(record.inherent_features) || '',
      behaviorDiet: record.cultureSociety || record.dietaryLifecycle || '',
      habitatOrigin: record.homeworld || synthesis.sceneryText || '',
      roleInWorld: record.roleInSetting || '',
      cp: String(record.cp ?? 0),
      tech_level: String(record.tech_level ?? 3),
      meta_level: String(record.meta_level ?? 0),
      movement: toText(record.movement),
      dbmSpeciesRef: rawId
    };
  } else if (collectionKey === 'factions') {
    fields = {
      ...fields,
      name: title,
      faction_type: toText(record.faction_type),
      archetype: toText(record.archetype),
      oneLinePitch: record.oneLinePitch || record.driving_mandate || '',
      motto: record.motto || record.symbol_sigil || '',
      description: record.description || synthesis.summaryText || '',
      ideology: record.core_beliefs || record.attitude || '',
      goals: record.publicAgenda || record.goals || record.driving_mandate || '',
      government: [record.government_type, record.leadership].filter(Boolean).join(' — '),
      alliesEnemies: record.alliesEnemies || record.relationship_to_others || record.outsider_view || '',
      territory: record.territoriesAssets || record.capital_world || '',
      resources: [record.primary_exports, record.economic_model].filter(Boolean).join(' | '),
      military_doctrine: record.military_doctrine || record.key_units || '',
      architecture: record.architecture || synthesis.architectureText || '',
      gear_aesthetic: record.gear_aesthetic || synthesis.attireText || '',
      design_language: record.design_language || [synthesis.architectureText, synthesis.attireText].filter(Boolean).join(' | ') || '',
      tech_level: String(record.tech_level ?? record.tl ?? 3),
      meta_level: String(record.meta_level ?? record.ml ?? 0),
      prominent_species: toText(record.prominent_species),
      mechanic: record.mechanic || '',
      dbmFactionRef: rawId
    };
  } else if (CORTEX_PROPERTY_COLLECTIONS.includes(collectionKey)) {
    propertySubcategory = collectionKey;
    const resolvedDc = record.craft_dc ?? record.design_dc ?? record.base_dc ?? '';
    const resolvedCost = record.costs?.credits ?? record.cost ?? '';
    const synthAesthetic = collectionKey === 'architecture'
      ? (synthesis.architectureText || synthesis.sceneryText || synthesis.summaryText)
      : (synthesis.attireText || synthesis.architectureText || synthesis.summaryText);
    fields = {
      ...fields,
      name: title,
      propertySubcategory: collectionKey,
      itemCategory: collectionKey,
      oneLinePitch: record.oneLinePitch || '',
      techLevel: String(record.tech_level ?? record.tl ?? 3),
      metaLevel: String(record.meta_level ?? record.ml ?? 0),
      rarity: toText(record.availability || record.quality || 'Standard'),
      functionPurpose: record.description || record.primary_purpose || '',
      aestheticForm: record.aestheticForm || toText(record.faction_skin || record.style || '') || synthAesthetic || '',
      craft_dc: resolvedDc !== '' ? String(resolvedDc) : '',
      cost: resolvedCost !== '' ? String(resolvedCost) : '',
      weight: record.weight !== undefined ? String(record.weight) : '',
      mechanic: record.mechanic || '',
      damage: toText(record.damage),
      range: toText(record.range),
      ap: record.ap !== undefined ? String(record.ap) : '',
      dr: (record.dr ?? record.dr_rating) !== undefined ? String(record.dr ?? record.dr_rating) : '',
      sp: (record.sp ?? record.durability) !== undefined ? String(record.sp ?? record.durability) : '',
      nodes_consumed: (record.nodes_consumed ?? record.nodes) !== undefined ? String(record.nodes_consumed ?? record.nodes) : '',
      location: toText(record.location || record.body_locations || record.coverage || record.footprint || record.frame),
      mechanismPowerSource: record.mechanismPowerSource || toText(record.power_source || record.propulsion),
      socialEconomicImpact: record.societalImpact || record.socialEconomicImpact || '',
      weaknesses: record.limitationsCosts || record.weaknesses || '',
      originContext: record.originHistory || toText(record.creator || record.origin),
      interactiveType: record.interactiveType || 'none',
      vttInteractionDC: record.vttInteractionDC !== undefined ? String(record.vttInteractionDC) : '',
      lootTable: record.lootTable || ''
    };
  } else if (collectionKey === 'modular_characters') {
    sourceOrigin = 'mcm';
    personaSubcategory = 'mcm';
    const mcmFolioPersona = convertMcmToFolioPersona(record, { targetFolio: false });
    const convertedEl = convertFolioToPersonaElement(mcmFolioPersona, { id: `cortex_${collectionKey}_${rawId}` });
    const tier = mcmFolioPersona?.mcmTier ?? record.threatTier ?? record.threat_tier ?? 3;
    const role = mcmFolioPersona?.mcmRole || record.competencyRole || record.role || 'Tank';
    const bossType = mcmFolioPersona?.mcmBossType || record.bossType || record.boss_type || 'Standard';
    const designation = mcmFolioPersona?.mcmDesignation || record.designation || 'Adversary';
    fields = {
      ...(convertedEl?.fields || {}),
      ...fields,
      name: title,
      'char-name': title,
      'char-species': mcmFolioPersona?.['char-species'] || record.species || 'Human',
      'char-archetype': mcmFolioPersona?.['char-archetype'] || record.archetype || 'Everyman',
      'char-origin': mcmFolioPersona?.['char-origin'] || record.origin || '',
      'char-occu': mcmFolioPersona?.['char-occu'] || record.occupation || role,
      'char-faction': mcmFolioPersona?.['char-faction'] || record.faction || '',
      'char-size': mcmFolioPersona?.['char-size'] || record.size_category || record.size || 'Medium',
      archetype: `${bossType} ${role}`.trim(),
      oneLinePitch: record.oneLinePitch || `${designation} • Tier ${tier} ${role}`,
      physicalDescription: record.appearance || record.description || synthesis.characterText || synthesis.attireText || synthesis.summaryText || '',
      personalityMannerisms: record.voiceMannerisms || record.mannerisms || '',
      goalsMotivations: record.motivationsGoals || record['char-motive'] || '',
      roleInStory: designation,
      relationships: record.relationships || record.keyRelationships || '',
      mcmTier: String(tier),
      mcmDesignation: designation,
      mcmChassis: bossType,
      mcmBossType: bossType,
      mcmRole: role,
      isSynthetic: Boolean(mcmFolioPersona?.isSynthetic ?? record.isSynthetic),
      health: String(mcmFolioPersona?.health ?? record.healthPoints ?? record.health ?? 30),
      vitality: String(mcmFolioPersona?.vitality ?? record.vitalityPoints ?? record.vitality ?? 30),
      structure: String(mcmFolioPersona?.structure ?? record.structurePoints ?? record.structure_points ?? 60),
      armorDR: String(mcmFolioPersona?.armor_dr ?? record.armorDR ?? record.expected_dr ?? 0),
      defense_dc: String(mcmFolioPersona?.defense_dc ?? record.defense_dc ?? 12),
      attack_bonus: String(mcmFolioPersona?.attack_bonus ?? record.attack_bonus ?? 4),
      actions: String(mcmFolioPersona?.actions_per_round ?? record.actions_per_round ?? 2),
      speed: String(mcmFolioPersona?.speed_ft ?? 30),
      'tech-level': String(mcmFolioPersona?.['tech-level'] ?? record.tech_level ?? 3),
      'magic-level': String(mcmFolioPersona?.['magic-level'] ?? record.meta_level ?? 1),
      vttScript: record.npcRoutine || record.vttScript || '',
      mechanic: record.mechanic || ''
    };
  } else if (collectionKey === 'planetary_design' || collectionKey === 'world') {
    fields = {
      ...fields,
      worldName: title,
      corePremise: record.highConcept || record.oneLinePitch || record.description || '',
      majorFactions: record.societiesGovernance || record.dominant_faction || record.factionArchetype || record.culture || '',
      historyTimeline: record.historicalTimeline || '',
      cosmologyPhysics: record.physicsMetaphysics || record.quirks || record.hazards || '',
      starSystem: record.starClass ? `Star Class ${record.starClass} • ${record.orbitalZone || 'BioZone'} • Starport ${record.starport || 'C'}` : '',
      continents: record.planetaryGeography || record.geography || record.settlements || synthesis.sceneryText || '',
      themes: record.adventureHooks || ''
    };
  } else if (collectionKey === 'universe') {
    fields = {
      ...fields,
      designation: record.oneLinePitch || `${title}${record.scale ? ` (${record.scale})` : ''}`,
      ontological: record.cosmologyDimensions || record.description || '',
      lawsPhysics: record.fundamentalLaws || record.laws_of_physics || ''
    };
  } else if (collectionKey === 'setting') {
    fields = {
      ...fields,
      settingName: title,
      parentWorld: toText(record.world),
      geographyArchitecture: record.architecturalLayout || record.description || synthesis.architectureText || synthesis.sceneryText || '',
      populationDemographics: record.inhabitantsDenizens || record.inhabitants || '',
      functionPurpose: record.oneLinePitch || '',
      sensoryDetails: record.sensoryAtmosphere || synthesis.sceneryText || synthesis.summaryText || '',
      landmarksSecrets: [record.pointsOfInterest || record.points_of_interest, record.secretsPlotHooks].filter(Boolean).join('\n')
    };
  } else if (collectionKey === 'scene') {
    fields = {
      ...fields,
      sceneName: title,
      location: record.setting_location || '',
      sensoryDetails: record.sensoryDetails || synthesis.sceneryText || '',
      moodAtmosphere: record.lightingAtmosphere || record.dramatic_hook || '',
      keyObjects: record.rewards_loot || record.participants || '',
      sceneBeats: record.sceneBeats || record.description || '',
      readAloud: record.readAloud || ''
    };
  } else if (collectionKey === 'philosophy') {
    fields = {
      ...fields,
      philosophyName: title,
      coreTenets: record.coreDogmaTenets || record.description || '',
      ritualsPractices: record.ritualsPractices || record.practices || '',
      symbolsIconography: record.symbolsIconography || '',
      influenceSociety: record.institutionalStructure || '',
      ethics: record.moralCodeTaboos || '',
      cosmology: record.cosmologyWorldview || record.origin || ''
    };
  } else if (CORTEX_METAPHYSICS_COLLECTIONS.includes(collectionKey)) {
    metaphysicsSubcategory = collectionKey;
    const costParts = [];
    if (record.costs && typeof record.costs === 'object') {
      if (record.costs.ap) costParts.push(`${record.costs.ap} AP`);
      if (record.costs.strain) costParts.push(`${record.costs.strain} Strain`);
      if (record.costs.focus) costParts.push(`${record.costs.focus} Focus`);
      if (record.costs.bp) costParts.push(`${record.costs.bp} BP`);
    }
    fields = {
      ...fields,
      name: title,
      metaphysicsSubcategory: collectionKey,
      discipline: toText(record.discipline || ''),
      oneLinePitch: record.oneLinePitch || record.description || record.mechanic || '',
      description: record.description || '',
      meta_skill: toText(record.meta_skill || record.discipline_skills || ''),
      meta_level: String(record.meta_level ?? record.ml ?? 1),
      design_dc: record.design_dc !== undefined && record.design_dc !== null ? String(record.design_dc) : '',
      cast_time: record.cast_time || '',
      duration: record.duration || '',
      range: toText(record.range),
      area: toText(record.area),
      target: toText(record.target),
      effect: toText(record.effect),
      mechanic: record.mechanic || '',
      strainBacklash: record.strainBacklash || costParts.join(', ') || '',
      manifestationSensory: record.manifestationSensory || '',
      originLore: record.originLore || record.note || ''
    };
  }

  const summaryText =
    record.oneLinePitch ||
    record.description ||
    record.driving_mandate ||
    record.core_concept ||
    record.mechanic ||
    '';

  const baseContent = record.body || record.full_text || (summaryText ? `<p>${summaryText}</p>` : '');
  const enrichedContent = appendSynthesisToContent(baseContent, synthesis.markdownSection);
  const previewText = fields.oneLinePitch || fields.summary || buildPlainTextPreview(summaryText || baseContent);

  const isMcmCollection = collectionKey === 'modular_characters';
  const mcmPersonaData = isMcmCollection ? convertMcmToFolioPersona(record, { targetFolio: false }) : null;

  const projected = {
    id: `cortex_${collectionKey}_${rawId}`,
    title,
    name: title,
    type: adeType,
    ...(propertySubcategory ? { propertySubcategory } : {}),
    ...(personaSubcategory ? { personaSubcategory } : {}),
    ...(metaphysicsSubcategory ? { metaphysicsSubcategory } : {}),
    sourceOrigin,
    isCortexAsset: true,
    isMcmPersona: isMcmCollection,
    isLockedForVtt: isMcmCollection ? true : false,
    isReadyForVtt: isMcmCollection ? true : false,
    isPinnedToModule: false,
    dbmCategory: collectionKey,
    dbmId: rawId,
    codexMatrixId,
    imageUrl: record.imageUrl || record.avatarUrl || mcmPersonaData?.imageUrl || '',
    content: record.content || record.narrativeProse || mcmPersonaData?.content || enrichedContent,
    previewText,
    customFields: Array.isArray(record.customFields)
      ? record.customFields
      : (Array.isArray(mcmPersonaData?.customFields) ? mcmPersonaData.customFields : []),
    guidance: record.guidance || mcmPersonaData?.guidance || {
      genre: '',
      tone: '',
      pacing: '',
      pov: '',
      literaryDevices: [],
      structure: ''
    },
    fields,
    ...(mcmPersonaData ? {
      personaData: mcmPersonaData,
      vttUnitData: mcmPersonaData.vttUnitData
    } : {}),
    assetHub: Array.isArray(record.assetHub)
      ? record.assetHub
      : (Array.isArray(mcmPersonaData?.assetHub) ? mcmPersonaData.assetHub : []),
    tags: Array.isArray(record.tags)
      ? record.tags
      : (record.keywords ? String(record.keywords).split(',').map(s => s.trim()).filter(Boolean) : []),
    cortexRaw: record,
    updatedAt: record.updatedAt || null
  };
  projected.searchHaystack = buildSearchHaystack(projected);

  if (!hasCustomSynth) {
    let byCol = projectedCortexWeakCache.get(record);
    if (!byCol) {
      byCol = new Map();
      projectedCortexWeakCache.set(record, byCol);
    }
    byCol.set(collectionKey, projected);
  }

  return projected;
}

/**
 * Projects a Persona Folio character record into a live ADE Persona element,
 * embedding matching CRISP Visual Synthesis descriptors (occupation, faction attire, origin scenery) into its content and fields.
 */
export function projectFolioPersonaToAdeElement(folioChar, options = {}) {
  if (!folioChar || typeof folioChar !== 'object') return null;
  const hasCustomSynth = Array.isArray(options.synthesisCatalog) && options.synthesisCatalog.length > 0;
  if (!hasCustomSynth && projectedFolioWeakCache.has(folioChar)) {
    return projectedFolioWeakCache.get(folioChar);
  }

  const docId = String(folioChar['character-doc-id'] || folioChar.id || '').trim();
  const charName = String(folioChar['char-name'] || folioChar.name || folioChar.title || '').trim();
  if (!docId && !charName) return null;

  const stableId = `folio_persona_${docId || charName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const converted = convertFolioToPersonaElement(folioChar, { id: stableId });
  if (!converted) return null;

  const species = folioChar['char-species'] || '';
  const occu = folioChar['char-occu'] || '';
  const faction = folioChar['char-faction'] || '';
  const archetype = folioChar['char-archetype'] || folioChar['char-concept'] || '';
  const autoPitch = [species, occu, faction ? `(${faction})` : ''].filter(Boolean).join(' • ');
  const synthesis = resolveSynthesisDescriptorsForAsset(folioChar, 'folio', options.synthesisCatalog);
  const enrichedContent = appendSynthesisToContent(converted.content || '', synthesis.markdownSection);
  const resolvedPitch = folioChar.summary || folioChar['char-concept'] || autoPitch || 'Persona Folio Character Sheet';
  const vttUnitData = converted.vttUnitData || buildVttUnitFromPersona(folioChar, { uniqueInstance: false });

  const projected = {
    ...converted,
    id: stableId,
    title: charName || converted.title,
    name: charName || converted.title,
    type: 'Persona',
    personaSubcategory: 'folio',
    sourceOrigin: 'folio',
    isFolioPersona: true,
    isCortexAsset: false,
    isPinnedToModule: false,
    folioDocId: docId || stableId,
    isLockedForVtt: Boolean(folioChar.is_locked || folioChar.is_ready_for_vtt || folioChar.folio_phase === 'locked'),
    isReadyForVtt: true,
    vttUnitData,
    content: enrichedContent,
    previewText: resolvedPitch,
    fields: {
      ...(converted.fields || {}),
      name: charName || converted.title,
      archetype: archetype || converted.fields?.archetype || 'Folio Operator',
      oneLinePitch: resolvedPitch,
      physicalDescription: folioChar.appearance || folioChar['char-style'] || synthesis.characterText || synthesis.attireText || synthesis.summaryText || '',
      personalityMannerisms: folioChar.mannerisms || folioChar.personalityType || '',
      backgroundHistory: folioChar.backstory || '',
      goalsMotivations: folioChar['char-motive'] || folioChar.goals || '',
      roleInStory: folioChar.role || 'Operative / Protagonist',
      relationships: folioChar.keyRelationships || '',
      ...(synthesis.summaryText ? { visualSynthesis: synthesis.summaryText } : {})
    }
  };
  projected.searchHaystack = buildSearchHaystack(projected);

  if (!hasCustomSynth) {
    projectedFolioWeakCache.set(folioChar, projected);
  }

  return projected;
}

/**
 * Normalizes a campaign-local ADE element (e.g. migrating legacy 'Item' or 'Technology' to 'Property'),
 * and embeds any matching CRISP Visual Synthesis descriptors into its content and fields.
 */
export function normalizeStoryModuleElement(el, options = {}) {
  if (!el || typeof el !== 'object') return null;
  const rawType = el.type || 'Custom';
  const canonicalType = normalizeElementType(rawType);
  const next = {
    ...el,
    originalType: el.originalType || rawType,
    type: canonicalType,
    sourceOrigin: el.sourceOrigin || 'module',
    isPinnedToModule: true
  };

  if (canonicalType === 'Property') {
    const subcat = inferPropertySubcategory({ ...el, originalType: rawType });
    next.propertySubcategory = subcat;
    next.fields = {
      ...(el.fields || {}),
      propertySubcategory: el.fields?.propertySubcategory || subcat
    };
  } else if (canonicalType === 'Persona') {
    const inferredPersonaSub =
      el.personaSubcategory && el.personaSubcategory !== 'archetypes'
        ? el.personaSubcategory
        : (el.folioDocId || el.personaData ? 'folio' : (el.dbmCategory === 'modular_characters' ? 'mcm' : 'story'));
    next.personaSubcategory = inferredPersonaSub;
    if (!next.personaData || typeof next.personaData !== 'object') {
      next.personaData = inferredPersonaSub === 'mcm'
        ? convertMcmToFolioPersona(next, { targetFolio: false })
        : convertPersonaElementToFolio(next);
    }
    next.vttUnitData = next.vttUnitData || buildVttUnitFromPersona(next.personaData || next, { uniqueInstance: false });
    next.isReadyForVtt = true;
  } else if (canonicalType === 'Metaphysics') {
    const metaSub = inferMetaphysicsSubcategory({ ...el, originalType: rawType });
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: el.fields?.metaphysicsSubcategory || metaSub
    };
  } else if (canonicalType === 'Philosophy' && CORTEX_METAPHYSICS_COLLECTIONS.includes(el.dbmCategory || el.fields?.dbmCategory)) {
    // Auto-migrate any previously pinned invocation/discipline/special_ability record out of Philosophy into Metaphysics
    const metaSub = el.dbmCategory || el.fields?.dbmCategory;
    next.type = 'Metaphysics';
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: metaSub
    };
  }

  const synthContextKey =
    canonicalType === 'Faction'
      ? 'factions'
      : canonicalType === 'Property'
      ? (next.propertySubcategory || 'gear')
      : canonicalType.toLowerCase();
  const synthesis = resolveSynthesisDescriptorsForAsset(
    { ...next, ...(next.fields || {}) },
    synthContextKey,
    options.synthesisCatalog
  );
  if (synthesis.markdownSection) {
    next.content = appendSynthesisToContent(next.content || '', synthesis.markdownSection);
    next.fields = {
      ...(next.fields || {}),
      visualSynthesis: next.fields?.visualSynthesis || synthesis.summaryText
    };
  }

  next.previewText = next.fields?.oneLinePitch || next.fields?.summary || buildPlainTextPreview(next.content);
  next.searchHaystack = buildSearchHaystack(next);

  return next;
}

let lastUnifiedCache = {
  elementsCatalog: null,
  dbData: null,
  folioRoster: null,
  publicPersonas: null,
  result: null
};

/**
 * Builds the deduplicated, unified ADE asset catalog combining:
 *   1. Story Module (`elementsCatalog`)
 *   2. OmniCortex / Codex (`dbData`)
 *   3. Persona Folio (`folioRoster` + `publicPersonas`)
 */
export function buildUnifiedAdeCatalog({
  elementsCatalog = [],
  dbData = {},
  folioRoster = [],
  publicPersonas = []
} = {}) {
  if (
    lastUnifiedCache.result &&
    lastUnifiedCache.elementsCatalog === elementsCatalog &&
    lastUnifiedCache.dbData === dbData &&
    lastUnifiedCache.folioRoster === folioRoster &&
    lastUnifiedCache.publicPersonas === publicPersonas
  ) {
    return lastUnifiedCache.result;
  }

  const synthesisCatalog = Array.isArray(dbData?.synthesis) ? dbData.synthesis : [];
  const normalizedModuleElements = (Array.isArray(elementsCatalog) ? elementsCatalog : [])
    .map(el => normalizeStoryModuleElement(el, { synthesisCatalog }))
    .filter(Boolean);

  // Index Story Module pins by (dbmCategory:dbmId), (folioDocId), and element ID
  const pinnedByCortexKey = new Map();
  const pinnedByFolioId = new Map();
  const pinnedById = new Map();
  const consumedModuleIds = new Set();

  for (const modEl of normalizedModuleElements) {
    if (modEl.id) {
      pinnedById.set(modEl.id, modEl);
    }
    const dbmCat = modEl.dbmCategory || modEl.fields?.dbmCategory;
    const dbmId = modEl.dbmId || modEl.fields?.dbmId || modEl.fields?.dbmRef || modEl.dbmRef || modEl.fields?.dbmSpeciesRef || modEl.fields?.dbmFactionRef;
    if (dbmCat && dbmId) {
      pinnedByCortexKey.set(`${String(dbmCat).toLowerCase()}:${String(dbmId).toLowerCase()}`, modEl);
    }
    const fId = modEl.folioDocId || modEl.personaData?.['character-doc-id'];
    if (fId) {
      pinnedByFolioId.set(String(fId).toLowerCase(), modEl);
    }
  }

  const unified = [];

  // 1. Project Persona Folio characters (deduplicated across roster + publicPersonas)
  const seenFolioIds = new Set();
  const combinedFolio = [
    ...(Array.isArray(folioRoster) ? folioRoster : []),
    ...(Array.isArray(publicPersonas) ? publicPersonas : [])
  ];

  for (const folioChar of combinedFolio) {
    if (!folioChar || typeof folioChar !== 'object') continue;
    const fKey = String(folioChar['character-doc-id'] || folioChar.id || folioChar['char-name'] || '').trim().toLowerCase();
    if (!fKey || seenFolioIds.has(fKey)) continue;
    seenFolioIds.add(fKey);

    const projected = projectFolioPersonaToAdeElement(folioChar, { synthesisCatalog });
    if (!projected) continue;

    const pinned = pinnedByFolioId.get(String(projected.folioDocId).toLowerCase()) ||
      pinnedById.get(projected.id);

    if (pinned) {
      consumedModuleIds.add(pinned.id);
      unified.push({
        ...projected,
        ...pinned,
        id: pinned.id,
        moduleElementId: pinned.id,
        type: 'Persona',
        personaSubcategory: 'folio',
        sourceOrigin: 'folio',
        isFolioPersona: true,
        isPinnedToModule: true,
        folioDocId: projected.folioDocId,
        personaData: folioChar,
        content: pinned.content || projected.content,
        previewText: pinned.previewText || projected.previewText,
        fields: {
          ...projected.fields,
          ...(pinned.fields || {})
        }
      });
    } else {
      unified.push(projected);
    }
  }

  // 2. Project all OmniCortex / Codex collections mapped to ADE categories
  const cortexCollections = Object.keys(COLLECTION_TO_ADE_TYPE);
  for (const colKey of cortexCollections) {
    const records = Array.isArray(dbData?.[colKey]) ? dbData[colKey] : [];
    for (const rec of records) {
      const projected = projectOmnicortexRecordToAdeElement(rec, colKey, { synthesisCatalog });
      if (!projected) continue;

      const lookupKey = `${colKey.toLowerCase()}:${String(projected.dbmId).toLowerCase()}`;
      const pinned = pinnedByCortexKey.get(lookupKey) ||
        pinnedById.get(projected.id);

      if (pinned) {
        consumedModuleIds.add(pinned.id);
        unified.push({
          ...projected,
          ...pinned,
          id: pinned.id,
          moduleElementId: pinned.id,
          type: projected.type,
          ...(projected.propertySubcategory ? { propertySubcategory: projected.propertySubcategory } : {}),
          ...(projected.personaSubcategory ? { personaSubcategory: projected.personaSubcategory } : {}),
          ...(projected.metaphysicsSubcategory ? { metaphysicsSubcategory: projected.metaphysicsSubcategory } : {}),
          sourceOrigin: projected.sourceOrigin,
          isCortexAsset: true,
          isPinnedToModule: true,
          dbmCategory: colKey,
          dbmId: projected.dbmId,
          codexMatrixId: projected.codexMatrixId,
          cortexRaw: rec,
          content: pinned.content || projected.content,
          previewText: pinned.previewText || projected.previewText,
          fields: {
            ...projected.fields,
            ...(pinned.fields || {})
          }
        });
      } else {
        unified.push(projected);
      }
    }
  }

  // 3. Append remaining Story Module elements (Story Arcs, Adventures, Encounters, Clues, Handouts, Maps, Custom, Story Personas, etc.)
  for (const modEl of normalizedModuleElements) {
    if (!consumedModuleIds.has(modEl.id)) {
      unified.push(modEl);
    }
  }

  lastUnifiedCache = {
    elementsCatalog,
    dbData,
    folioRoster,
    publicPersonas,
    result: unified
  };

  return unified;
}

/**
 * Resolves the canonical OmniCortex collection key for an ADE element if it belongs to Cortex.
 * Returns null for purely campaign-scoped narrative structures (Story Arc, Adventure, Encounter, Clue, Handout, Map, Custom)
 * or Folio-backed Personas.
 */
export function resolveTargetCortexCollection(element) {
  if (!element || typeof element !== 'object') return null;
  const canonicalType = normalizeElementType(element.type || '');
  const fields = element.fields || {};

  if (canonicalType === 'Persona') {
    if (element.isFolioPersona || element.sourceOrigin === 'folio' || element.personaSubcategory === 'folio') {
      return null; // Managed via FolioContext / personaBridge
    }
    if (
      element.dbmCategory === 'modular_characters' ||
      element.sourceOrigin === 'mcm' ||
      element.personaSubcategory === 'mcm' ||
      fields.mcmTier !== undefined ||
      fields.mcmRole !== undefined
    ) {
      return 'modular_characters';
    }
    return null; // Narrative Story Persona stays in Story Module unless opted into MCM
  }

  if (canonicalType === 'Species') return 'species';
  if (canonicalType === 'Faction') return 'factions';
  if (canonicalType === 'Property') return inferPropertySubcategory(element);
  if (canonicalType === 'Metaphysics') return inferMetaphysicsSubcategory(element);
  if (canonicalType === 'World') {
    return element.dbmCategory === 'planetary_design' || fields.starClass ? 'planetary_design' : 'world';
  }
  if (canonicalType === 'Universe') return 'universe';
  if (canonicalType === 'Setting') return 'setting';
  if (canonicalType === 'Scene') {
    return 'scene';
  }
  if (canonicalType === 'Philosophy') {
    return 'philosophy';
  }

  return null;
}

/**
 * Consolidates an ADE element (including all AIME 3-Tier, Lorebook, and tactical fields)
 * into a lossless OmniCortex entry payload ready for `DBMContext.saveEntry(payload, targetCollection)`.
 */
export function consolidateAdeElementToCortexPayload(element, options = {}) {
  if (!element || typeof element !== 'object') return null;

  const targetCollection = options.targetCollection || resolveTargetCortexCollection(element);
  if (!targetCollection) return null;

  const fields = element.fields || {};
  const rawBase = element.cortexRaw && typeof element.cortexRaw === 'object' ? element.cortexRaw : {};
  const cleanTitle = String(
    element.title ||
    element.name ||
    fields.name ||
    fields.speciesName ||
    fields.worldName ||
    fields.settingName ||
    fields.philosophyName ||
    fields.sceneName ||
    rawBase.name ||
    'Untitled Asset'
  ).trim();

  const resolvedId = String(
    element.dbmId ||
    fields.dbmId ||
    rawBase.id ||
    (String(element.id || '').startsWith(`cortex_${targetCollection}_`)
      ? String(element.id).slice(`cortex_${targetCollection}_`.length)
      : '') ||
    element.id ||
    `cortex_${Date.now()}`
  ).trim();

  const commonConsolidated = {
    ...rawBase,
    id: resolvedId,
    name: cleanTitle,
    title: cleanTitle,
    imageUrl: element.imageUrl || rawBase.imageUrl || '',
    guidance: element.guidance || fields.guidance || rawBase.guidance || undefined,
    assetHub: Array.isArray(element.assetHub) ? element.assetHub : (rawBase.assetHub || []),
    oneLinePitch: fields.oneLinePitch ?? rawBase.oneLinePitch ?? '',
    primaryTriggers: fields.primaryTriggers ?? rawBase.primaryTriggers ?? '',
    secondaryTriggers: fields.secondaryTriggers ?? rawBase.secondaryTriggers ?? '',
    triggerRegex: fields.triggerRegex ?? rawBase.triggerRegex ?? '',
    loreSnippet: fields.loreSnippet ?? rawBase.loreSnippet ?? '',
    injectionPriority: Number(fields.loreScanPriority ?? fields.injectionPriority ?? rawBase.injectionPriority ?? 5) || 5,
    conditionExpression: fields.loreRequireCondition ?? fields.conditionExpression ?? rawBase.conditionExpression ?? '',
    keywords: fields.keywords ?? rawBase.keywords ?? '',
    negative_keywords: fields.negative_keywords ?? rawBase.negative_keywords ?? '',
    updatedAt: new Date().toISOString()
  };

  if (targetCollection === 'species') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        parent_species: fields.parent_species || rawBase.parent_species || 'Independent',
        stigma: fields.stigma || fields.oneLinePitch || rawBase.stigma || '',
        homeworld: fields.habitatOrigin || fields.homeworld || rawBase.homeworld || '',
        description: fields.physicalDescription || fields.description || rawBase.description || '',
        physiologyBiology: fields.physicalDescription || fields.physiologyBiology || rawBase.physiologyBiology || '',
        cultureSociety: fields.behaviorDiet || fields.cultureSociety || rawBase.cultureSociety || '',
        roleInSetting: fields.roleInWorld || fields.roleInSetting || rawBase.roleInSetting || '',
        mechanic: fields.abilitiesPowers || fields.mechanic || rawBase.mechanic || '',
        size: fields.size || rawBase.size || 'Medium',
        cp: Number(fields.cp ?? rawBase.cp ?? 0) || 0,
        tech_level: Number(fields.tech_level ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields.meta_level ?? rawBase.meta_level ?? 0) || 0
      }
    };
  }

  if (targetCollection === 'factions') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        faction_type: fields.faction_type || rawBase.faction_type || 'Major Polity',
        archetype: fields.archetype || rawBase.archetype || '',
        driving_mandate: fields.oneLinePitch || fields.driving_mandate || rawBase.driving_mandate || '',
        motto: fields.motto || rawBase.motto || '',
        description: fields.description || rawBase.description || '',
        core_beliefs: fields.ideology || fields.core_beliefs || rawBase.core_beliefs || '',
        publicAgenda: fields.goals || fields.publicAgenda || rawBase.publicAgenda || '',
        goals: fields.goals || rawBase.goals || '',
        government_type: fields.government || fields.government_type || rawBase.government_type || '',
        alliesEnemies: fields.alliesEnemies || rawBase.alliesEnemies || '',
        relationship_to_others: fields.alliesEnemies || rawBase.relationship_to_others || '',
        capital_world: fields.territory || fields.capital_world || rawBase.capital_world || '',
        territoriesAssets: fields.territory || fields.territoriesAssets || rawBase.territoriesAssets || '',
        primary_exports: fields.resources || rawBase.primary_exports || '',
        military_doctrine: fields.military_doctrine || rawBase.military_doctrine || '',
        architecture: fields.architecture || rawBase.architecture || '',
        gear_aesthetic: fields.gear_aesthetic || rawBase.gear_aesthetic || '',
        design_language: fields.design_language || rawBase.design_language || '',
        prominent_species: fields.prominent_species || rawBase.prominent_species || '',
        tech_level: Number(fields.tech_level ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields.meta_level ?? rawBase.meta_level ?? 0) || 0,
        mechanic: fields.mechanic || rawBase.mechanic || ''
      }
    };
  }

  if (CORTEX_PROPERTY_COLLECTIONS.includes(targetCollection)) {
    const dcVal = Number(fields.craft_dc ?? rawBase.craft_dc ?? rawBase.design_dc ?? 15) || 15;
    const costVal = fields.cost !== undefined && fields.cost !== ''
      ? Number(fields.cost)
      : (rawBase.costs?.credits ?? rawBase.cost ?? 0);

    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        propertySubcategory: targetCollection,
        tech_level: Number(fields.techLevel ?? fields.tech_level ?? rawBase.tech_level ?? 3) || 0,
        meta_level: Number(fields.metaLevel ?? fields.meta_level ?? rawBase.meta_level ?? 0) || 0,
        availability: fields.rarity || fields.availability || rawBase.availability || 'Common',
        description: fields.functionPurpose || fields.description || rawBase.description || '',
        aestheticForm: fields.aestheticForm || rawBase.aestheticForm || '',
        craft_dc: dcVal,
        design_dc: dcVal,
        cost: costVal,
        costs: {
          ...(rawBase.costs || {}),
          credits: costVal
        },
        weight: fields.weight !== undefined && fields.weight !== '' ? Number(fields.weight) : (rawBase.weight ?? 1),
        mechanic: fields.mechanic || rawBase.mechanic || '',
        ...(fields.damage ? { damage: fields.damage } : {}),
        ...(fields.range ? { range: fields.range } : {}),
        ...(fields.ap !== undefined && fields.ap !== '' ? { ap: Number(fields.ap) } : {}),
        ...(fields.dr !== undefined && fields.dr !== '' ? { dr: Number(fields.dr) } : {}),
        ...(fields.sp !== undefined && fields.sp !== '' ? { sp: Number(fields.sp), durability: Number(fields.sp) } : {}),
        ...(fields.nodes_consumed !== undefined && fields.nodes_consumed !== '' ? { nodes_consumed: Number(fields.nodes_consumed), nodes: Number(fields.nodes_consumed) } : {}),
        ...(fields.location ? { location: fields.location } : {}),
        mechanismPowerSource: fields.mechanismPowerSource || rawBase.mechanismPowerSource || '',
        societalImpact: fields.socialEconomicImpact || fields.societalImpact || rawBase.societalImpact || '',
        limitationsCosts: fields.weaknesses || fields.limitationsCosts || rawBase.limitationsCosts || '',
        originHistory: fields.originContext || fields.originHistory || rawBase.originHistory || '',
        interactiveType: fields.interactiveType || rawBase.interactiveType || 'none',
        vttInteractionDC: fields.vttInteractionDC ? Number(fields.vttInteractionDC) : (rawBase.vttInteractionDC ?? undefined),
        lootTable: fields.lootTable || rawBase.lootTable || ''
      }
    };
  }

  if (targetCollection === 'modular_characters') {
    const folioEquivalent = convertPersonaElementToFolio(element) || convertMcmToFolioPersona({ ...rawBase, ...fields, title: cleanTitle });
    const fullMcmPayload = convertFolioToMcmRecord(folioEquivalent, { id: resolvedId }) || {};
    const tier = Number(fields.mcmTier ?? fullMcmPayload.threatTier ?? rawBase.threatTier ?? 3);
    const role = fields.mcmRole || fullMcmPayload.competencyRole || rawBase.competencyRole || 'Tank';
    const bossType = fields.mcmBossType || fields.mcmChassis || fullMcmPayload.bossType || rawBase.bossType || 'Standard';
    const designation = fields.mcmDesignation || fields.roleInStory || fullMcmPayload.designation || rawBase.designation || 'Adversary';
    return {
      targetCollection,
      payload: {
        ...fullMcmPayload,
        ...commonConsolidated,
        threatTier: isNaN(tier) ? 3 : tier,
        threat_tier: isNaN(tier) ? 3 : tier,
        competencyRole: role,
        competency_role: role,
        role,
        designation,
        bossType,
        boss_type: bossType,
        isSynthetic: Boolean(fields.isSynthetic ?? fullMcmPayload.isSynthetic ?? rawBase.isSynthetic),
        vitality: Number(fields.vitality ?? fullMcmPayload.vitality ?? rawBase.vitalityPoints ?? 30) || 0,
        vitalityPoints: Number(fields.vitality ?? fullMcmPayload.vitality ?? rawBase.vitalityPoints ?? 30) || 0,
        health: Number(fields.health ?? fullMcmPayload.health ?? rawBase.healthPoints ?? 30) || 0,
        healthPoints: Number(fields.health ?? fullMcmPayload.health ?? rawBase.healthPoints ?? 30) || 0,
        structure_points: Number(fields.structure ?? fullMcmPayload.structure_points ?? rawBase.structurePoints ?? 60) || 60,
        structurePoints: Number(fields.structure ?? fullMcmPayload.structure_points ?? rawBase.structurePoints ?? 60) || 60,
        expected_dr: Number(fields.armorDR ?? fullMcmPayload.expected_dr ?? rawBase.armorDR ?? 0) || 0,
        armorDR: Number(fields.armorDR ?? fullMcmPayload.expected_dr ?? rawBase.armorDR ?? 0) || 0,
        tech_level: Number(fields['tech-level'] ?? fullMcmPayload.tech_level ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields['magic-level'] ?? fullMcmPayload.meta_level ?? rawBase.meta_level ?? 1) || 0,
        appearance: fields.physicalDescription || fields.appearance || fullMcmPayload.appearance || rawBase.appearance || '',
        voiceMannerisms: fields.personalityMannerisms || fields.mannerisms || fullMcmPayload.mannerisms || rawBase.voiceMannerisms || '',
        motivationsGoals: fields.goalsMotivations || fields['char-motive'] || fullMcmPayload['char-motive'] || rawBase.motivationsGoals || '',
        relationships: fields.relationships || fields.keyRelationships || fullMcmPayload.keyRelationships || rawBase.relationships || '',
        npcRoutine: fields.vttScript || fields.npcRoutine || rawBase.npcRoutine || '',
        description: fields.summary || fields.physicalDescription || rawBase.description || '',
        mechanic: fields.mechanic || rawBase.mechanic || '',
        personaData: folioEquivalent,
        vttUnitData: fullMcmPayload.vttUnitData
      }
    };
  }

  if (targetCollection === 'planetary_design' || targetCollection === 'world') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        highConcept: fields.corePremise || fields.oneLinePitch || rawBase.highConcept || '',
        description: fields.corePremise || rawBase.description || '',
        planetaryGeography: fields.continents || rawBase.planetaryGeography || '',
        geography: fields.continents || rawBase.geography || '',
        societiesGovernance: fields.majorFactions || rawBase.societiesGovernance || '',
        culture: fields.majorFactions || rawBase.culture || '',
        historicalTimeline: fields.historyTimeline || rawBase.historicalTimeline || '',
        physicsMetaphysics: fields.cosmologyPhysics || rawBase.physicsMetaphysics || ''
      }
    };
  }

  if (targetCollection === 'universe') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        description: fields.ontological || rawBase.description || '',
        cosmologyDimensions: fields.ontological || rawBase.cosmologyDimensions || '',
        laws_of_physics: fields.lawsPhysics || rawBase.laws_of_physics || '',
        fundamentalLaws: fields.lawsPhysics || rawBase.fundamentalLaws || ''
      }
    };
  }

  if (targetCollection === 'setting') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        world: fields.parentWorld || rawBase.world || '',
        description: fields.geographyArchitecture || rawBase.description || '',
        architecturalLayout: fields.geographyArchitecture || rawBase.architecturalLayout || '',
        sensoryAtmosphere: fields.sensoryDetails || rawBase.sensoryAtmosphere || '',
        inhabitants: fields.populationDemographics || rawBase.inhabitants || '',
        inhabitantsDenizens: fields.populationDemographics || rawBase.inhabitantsDenizens || '',
        points_of_interest: fields.landmarksSecrets || rawBase.points_of_interest || '',
        pointsOfInterest: fields.landmarksSecrets || rawBase.pointsOfInterest || ''
      }
    };
  }

  if (targetCollection === 'scene') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        setting_location: fields.location || rawBase.setting_location || '',
        sensoryDetails: fields.sensoryDetails || rawBase.sensoryDetails || '',
        lightingAtmosphere: fields.moodAtmosphere || rawBase.lightingAtmosphere || '',
        rewards_loot: fields.keyObjects || rawBase.rewards_loot || '',
        sceneBeats: fields.sceneBeats || rawBase.sceneBeats || '',
        description: fields.sceneBeats || rawBase.description || '',
        readAloud: fields.readAloud || rawBase.readAloud || ''
      }
    };
  }

  if (targetCollection === 'philosophy') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        description: fields.coreTenets || rawBase.description || '',
        coreDogmaTenets: fields.coreTenets || rawBase.coreDogmaTenets || '',
        practices: fields.ritualsPractices || rawBase.practices || '',
        ritualsPractices: fields.ritualsPractices || rawBase.ritualsPractices || '',
        moralCodeTaboos: fields.ethics || rawBase.moralCodeTaboos || '',
        origin: fields.cosmology || rawBase.origin || '',
        cosmologyWorldview: fields.cosmology || rawBase.cosmologyWorldview || ''
      }
    };
  }

  if (CORTEX_METAPHYSICS_COLLECTIONS.includes(targetCollection)) {
    const mlVal = Number(
      String(fields.meta_level ?? fields['meta-level'] ?? fields.metaLevel ?? rawBase.meta_level ?? 1).replace(/[^0-9.-]/g, '')
    ) || 0;
    const designDcVal =
      fields.design_dc !== undefined && fields.design_dc !== ''
        ? String(fields.design_dc)
        : (rawBase.design_dc !== undefined ? String(rawBase.design_dc) : '');
    const toListIfText = (val, fallback) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
      return fallback ?? [];
    };

    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        metaphysicsSubcategory: targetCollection,
        description: fields.description || fields.oneLinePitch || rawBase.description || '',
        mechanic: fields.mechanic || rawBase.mechanic || '',
        ...(targetCollection === 'disciplines'
          ? {
              discipline_skills: toListIfText(fields.meta_skill, rawBase.discipline_skills)
            }
          : {
              discipline: fields.discipline || fields.meta_skill || rawBase.discipline || '',
              meta_skill: fields.meta_skill || fields.discipline || rawBase.meta_skill || '',
              meta_level: mlVal,
              design_dc: designDcVal,
              cast_time: fields.cast_time || rawBase.cast_time || '',
              duration: fields.duration || rawBase.duration || '',
              range: toListIfText(fields.range, rawBase.range),
              area: toListIfText(fields.area, rawBase.area),
              target: toListIfText(fields.target, rawBase.target),
              effect: toListIfText(fields.effect, rawBase.effect)
            }),
        strainBacklash: fields.strainBacklash || rawBase.strainBacklash || '',
        manifestationSensory: fields.manifestationSensory || rawBase.manifestationSensory || '',
        originLore: fields.originLore || rawBase.originLore || ''
      }
    };
  }

  return {
    targetCollection,
    payload: commonConsolidated
  };
}

/**
 * Returns the unified Persona listing composed from:
 *  - Persona Folio Roster & Public Personas (`folio`)
 *  - Modular Character Matrix (`dbData.modular_characters` -> `mcm`)
 *  - Story Module Personas (`elementsCatalog` -> `story` / `mcm` / `folio`)
 * Every returned Persona is guaranteed to include `personaData` and `vttUnitData`.
 */
export function buildUnifiedPersonaList({
  elementsCatalog = [],
  dbData = {},
  folioRoster = [],
  publicPersonas = []
} = {}) {
  const catalog = buildUnifiedAdeCatalog({
    elementsCatalog,
    dbData,
    folioRoster,
    publicPersonas
  });
  return catalog.filter((el) => el && el.type === 'Persona');
}

export {
  convertPersonaElementToFolio,
  convertMcmToFolioPersona,
  convertFolioToMcmRecord,
  buildVttUnitFromPersona
};
