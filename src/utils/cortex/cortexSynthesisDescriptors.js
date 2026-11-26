/**
 * @file cortexSynthesisDescriptors.js
 * @description CRISP Visual Synthesis descriptor resolution for OmniCortex, Folio, and Story Module assets.
 */

import { DEFAULT_SYNTHESIS } from '../../data/synthesisData.js';
import { DEFAULT_OCCUPATIONS } from '../../data/occupationsData.js';

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

const mergedCustomSynthesisWeakCache = new WeakMap();
const defaultSynthesisRecordWeakCache = new WeakMap();
const customSynthesisRecordWeakCache = new WeakMap();

const mergeSynthesisCatalogs = (customSynthesis) => {
  const base = getEnrichedDefaultSynthesis();
  if (!Array.isArray(customSynthesis) || customSynthesis.length === 0) return base;
  const cachedMerged = mergedCustomSynthesisWeakCache.get(customSynthesis);
  if (cachedMerged) return cachedMerged;
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
  mergedCustomSynthesisWeakCache.set(customSynthesis, merged);
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
  let synthRecordCache = defaultSynthesisRecordWeakCache;
  if (hasCustomSynthesis) {
    synthRecordCache = customSynthesisRecordWeakCache.get(customSynthesis);
    if (!synthRecordCache) {
      synthRecordCache = new WeakMap();
      customSynthesisRecordWeakCache.set(customSynthesis, synthRecordCache);
    }
  }
  const cachedByCol = synthRecordCache.get(record);
  if (cachedByCol && cachedByCol.has(collectionKey)) {
    return cachedByCol.get(collectionKey);
  }
  const cacheAndReturn = (res) => {
    let map = synthRecordCache.get(record);
    if (!map) {
      map = new Map();
      synthRecordCache.set(record, map);
    }
    map.set(collectionKey, res);
    return res;
  };
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
    return cacheAndReturn(EMPTY_SYNTHESIS_RESULT);
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
    return cacheAndReturn(EMPTY_SYNTHESIS_RESULT);
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
    return cacheAndReturn(EMPTY_SYNTHESIS_RESULT);
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

  return cacheAndReturn({
    entries: allEntries,
    markdownSection,
    summaryText,
    architectureText,
    attireText,
    sceneryText,
    characterText
  });
}

export function appendSynthesisToContent(baseContent = '', markdownSection = '') {
  if (!markdownSection) return baseContent;
  const trimmed = String(baseContent || '').trim();
  if (!trimmed) return markdownSection;
  if (trimmed.includes('## Visual Synthesis & Aesthetic Descriptors')) return trimmed;
  return `${trimmed}\n\n${markdownSection}`;
}
