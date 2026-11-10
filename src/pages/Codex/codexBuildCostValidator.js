/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TANGENT SF RP — RULES CODEX BUILD COST & VALUE CHECKING ENGINE
 * Universal validator and breakdown calculator integrated into every Cortex
 * catalog and Asset Studio for designing assets and verifying build costs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  calculateCreditValue,
  calculateMaterialCost,
  resolveItemCostDC,
  getComplexityTier
} from '../../engines/tangentEconEngine.js';
import { validateAssetValuation } from '../../engines/tangentScalingEngine.js';
import {
  calculateSpeciesBP,
  calculateInvocationDC
} from '../../engines/tangentEntityEngines.js';
import {
  SPECIES_TYPES,
  SPECIES_SIZES,
  SPECIES_MOVEMENT_BASE_MODES,
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_MODES,
  resolveMovementId,
  SPECIES_DISADVANTAGES,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE,
  EQUIPMENT_SIZES,
  WORKSPACE_SCALES,
  EPR_RATINGS,
  WEAPON_SIZES,
  WEAPON_MODIFICATIONS,
  WEAPON_CAPACITY_UPGRADES,
  WEAPON_DOWNGRADES,
  ARMOR_COVERAGE,
  ARMOR_MATERIALS,
  ARMOR_MODULES,
  ARMOR_DOWNGRADES,
  MANUFACTURER_SKINS,
  MECHA_SIZES,
  MECHA_FRAMES,
  MECHA_PROPULSION,
  MECHA_ARMOR_TYPES,
  MECHA_MODULES,
  MECHA_COMPONENTS,
  MECHA_WEAPONS,
  VFT_MODES,
  ARCHITECTURE_FOOTPRINTS,
  HEIGHT_CLASSES,
  ARCHITECTURE_FRAME_TYPES,
  ARCHITECTURE_MATERIALS,
  ENVIRONMENTAL_MODIFIERS,
  ARCHITECTURE_FACILITIES
} from '../../engines/tangentConstants.js';
import {
  calculateEquipmentDC,
  calculateWeaponDC,
  calculateArmorDC
} from '../../engines/tangentItemEngines.js';
import {
  resolveMechaFrameKey,
  calculateMechaDC,
  calculateArchitectureDC,
  deriveHeightClassFromStories
} from '../../engines/tangentComplexEngines.js';
import { DEFAULT_SPECIES } from '../../data/speciesData.js';
import { DEFAULT_SPECIES_TYPES } from '../../data/speciesTypesData.js';
import { DEFAULT_SPECIES_TRAITS } from '../../data/speciesTraitsData.js';
import { DEFAULT_FEATURES } from '../../data/featuresData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../../data/speciesDisadvantagesData.js';
import { isPropertyCategory } from '../../utils/tangentSchemaAdapters.js';

export const calculateInvocationFocus = (dcOrData) => {
  const dc = typeof dcOrData === 'number'
    ? dcOrData
    : Number(
        typeof calculateInvocationDC === 'function'
          ? (calculateInvocationDC(dcOrData)?.totalDC ?? calculateInvocationDC(dcOrData))
          : 15
      ) || 15;
  return Math.max(1, Math.ceil(dc / 5));
};

const toCleanString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    const joined = val
      .map(item => toCleanString(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }
  if (typeof val === 'object') {
    const label = val.name || val.title || val.label || val.skill || val.attribute || val.id || '';
    if (label) {
      const bonus = val.bonus ?? val.value ?? val.points;
      return bonus !== undefined && bonus !== null && bonus !== ''
        ? `${toCleanString(label, '')} (${Number(bonus) >= 0 ? '+' : ''}${bonus})`
        : toCleanString(label, fallback);
    }
    try {
      const entries = Object.entries(val)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}: ${toCleanString(v, '')}`);
      return entries.join(', ') || fallback;
    } catch {
      return fallback;
    }
  }
  return String(val) || fallback;
};

const parseList = (val) => {
  if (Array.isArray(val)) return val.map(item => toCleanString(item, '')).filter(Boolean);
  if (typeof val === 'string') return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (val && typeof val === 'object') {
    return Object.entries(val)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${toCleanString(v, '')}`);
  }
  return [];
};

const formatSignedCP = (val) => {
  const num = Number(val || 0);
  if (num > 0) return `+${num} CP`;
  if (num < 0) return `${num} CP`;
  return '0 CP';
};

const splitTopLevelCommas = (str = '') => {
  const tokens = [];
  let cur = '';
  let depth = 0;
  for (const ch of String(str || '')) {
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      if (cur.trim()) tokens.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) tokens.push(cur.trim());
  return tokens;
};

const MATRIX_SYNONYM_GROUPS = [
  ['telepathy', 'telepathic', 'mind', 'speech'],
  ['darksight', 'dark', 'sight'],
  ['sleepless', 'sleep', 'immune', 'torpor'],
  ['mutation', 'bodyform'],
  ['martial', 'arts', 'defensive', 'training'],
  ['swim', 'swimming', 'swimmer', 'aquatic'],
  ['climb', 'climbing', 'climber'],
  ['ungulate', 'digitigrade', 'ungulated'],
  ['multidextrous', 'additional', 'limbs', 'arms', 'filaments'],
  ['echolocation', 'blindsense', 'blindsight', 'blind', 'sense'],
  ['non', 'typical', 'anatomy', 'living'],
  ['vampiric', 'flaw', 'negative', 'energy', 'affinity'],
  ['rage', 'frenzy'],
  ['status', 'benefit'],
  ['memory', 'photographic', 'perfect'],
  ['sense', 'evil', 'uncontrolled'],
  ['limbless', 'armless'],
  ['fast', 'quick'],
  ['jumper', 'leaper'],
  ['specialized', 'senses', 'water'],
  ['corporeal', 'semi'],
  ['acclimation', 'adaptation', 'bodyform'],
  ['communications', 'remote', 'links', 'telepathic', 'mind', 'speech'],
  ['resin', 'weaver', 'secretion'],
  ['skeleton', 'skeletal', 'chitin', 'armor'],
  ['pheromones', 'pheromonal'],
  ['zombification', 'host'],
  ['honey', 'paper', 'webbing'],
  ['psionic', 'static', 'interference'],
  ['atmosphere', 'variant', 'adapted', 'adaptive'],
  ['teleportal', 'gating', 'psionic'],
  ['homing', 'water', 'sense'],
  ['fortitude', 'hardy']
];

const normMatrixWords = (s = '') =>
  String(s || '')
    .toLowerCase()
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      w =>
        w.length >= 3 &&
        ![
          'base', 'traits', 'trait', 'feature', 'features',
          'species', 'special', 'ability', 'choice', 'the', 'and', 'for', 'with'
        ].includes(w)
    );

const expandMatrixWords = (words) => {
  const set = new Set(words);
  for (const w of words) {
    for (const grp of MATRIX_SYNONYM_GROUPS) {
      if (grp.includes(w)) grp.forEach(g => set.add(g));
    }
  }
  return set;
};

/**
 * Extracts all itemized cost entries for a Species or Lineage entry,
 * separating formula-accounted items from items unaccounted for by calculateSpeciesBP.
 *
 * @param {object} data - Species / Lineage document
 * @param {object} [precomputedBpData] - Optional result of calculateSpeciesBP(data)
 * @returns {object} { costItems, accountedItems, unaccountedItems, baselineItems, hasUnaccountedItems }
 */
export function extractSpeciesBuildCostItems(data = {}, precomputedBpData = null) {
  const bpData = precomputedBpData || calculateSpeciesBP(data);
  const bd = bpData?.breakdown || {};
  const it = bpData?.itemized || {};

  const computedCP = Number(bpData?.totalBPUsed ?? 0);
  const rawStoredCP = data.cp ?? data.costs?.cp ?? data.bp ?? data.costs?.bp;
  const hasExplicitCP = rawStoredCP !== undefined && rawStoredCP !== null && rawStoredCP !== '';
  const storedCP = hasExplicitCP ? Number(rawStoredCP) : computedCP;
  const isStoredSynced = !hasExplicitCP || storedCP === computedCP;

  const accountedItems = [];
  const unaccountedItems = [];
  const baselineItems = [];

  const allSpeciesTypes = [
    ...Object.values(SPECIES_TYPES || {}),
    ...(Array.isArray(DEFAULT_SPECIES_TYPES) ? DEFAULT_SPECIES_TYPES : [])
  ];
  const allTraitsCatalog = (DEFAULT_SPECIES_TRAITS && DEFAULT_SPECIES_TRAITS.length > 0)
    ? DEFAULT_SPECIES_TRAITS
    : [...(SPECIES_TRAITS_BASIC || []), ...(SPECIES_TRAITS_ADVANCED || []), ...(SPECIES_TRAITS_ELITE || [])];
  const allFeaturesCatalog = Array.isArray(DEFAULT_FEATURES) ? DEFAULT_FEATURES : [];
  const allDisadsCatalog = [
    ...(Array.isArray(SPECIES_DISADVANTAGES) ? SPECIES_DISADVANTAGES : []),
    ...(Array.isArray(DEFAULT_SPECIES_DISADVANTAGES) ? DEFAULT_SPECIES_DISADVANTAGES : [])
  ];
  const allMoveModes = [
    ...(Array.isArray(SPECIES_MOVEMENT_BASE_MODES) ? SPECIES_MOVEMENT_BASE_MODES : []),
    ...(Array.isArray(SPECIES_MOVEMENT_ADJUSTERS) ? SPECIES_MOVEMENT_ADJUSTERS : []),
    ...(Array.isArray(SPECIES_MOVEMENT_MODES) ? SPECIES_MOVEMENT_MODES : [])
  ];

  // Parse Mechanical Summary Matrix row in data.body if present
  const matrixLines = String(data.body || '')
    .split('\n')
    .filter(l => l.trim().startsWith('|') && !l.includes('---') && !l.includes('Species / Subspecies'));
  const matrixCols = (matrixLines[0] || '').split('|').map(c => c.trim()).filter(Boolean);

  // ── 1. CHASSIS TYPE(S) ────────────────────────────────────────────────────
  const rawTypeArr = Array.isArray(data.type)
    ? data.type
    : (data.type || data.species_type ? [data.type || data.species_type] : []);

  if (rawTypeArr.length > 0) {
    const primaryRawType = rawTypeArr[0];
    const cleanPrimaryType = String(typeof primaryRawType === 'object' ? (primaryRawType?.name || primaryRawType?.id) : primaryRawType)
      .replace(/^species_type-/, '')
      .trim()
      .toLowerCase();
    const matchedPrimaryType = allSpeciesTypes.find(
      t =>
        String(t.id || '').replace(/^species_type-/, '').toLowerCase() === cleanPrimaryType ||
        String(t.name || '').toLowerCase() === cleanPrimaryType
    );

    if (!matchedPrimaryType && cleanPrimaryType) {
      const matrixChassisMatch = (matrixCols[1] || '').match(/\(([+-]?\d+)\s*CP\)/i);
      const fallbackCP = matrixChassisMatch ? Number(matrixChassisMatch[1]) : 0;
      const prettyRawType = cleanPrimaryType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      unaccountedItems.push({
        category: 'Chassis',
        label: `Chassis: ${prettyRawType}`,
        cost: fallbackCP,
        formattedCost: `${formatSignedCP(fallbackCP)} (Unaccounted)`,
        unaccounted: true,
        status: 'warning',
        note: `Unrecognized chassis type '${prettyRawType}' (formula fell back to Humanoid 0 CP)`
      });
    } else {
      const typeCost = Number(bd.typeBP ?? it.type?.bp ?? 0);
      const typeName = it.type?.name || matchedPrimaryType?.name || 'Humanoid';
      if (typeCost !== 0) {
        accountedItems.push({
          category: 'Chassis',
          label: `Chassis: ${typeName}`,
          cost: typeCost,
          formattedCost: formatSignedCP(typeCost),
          unaccounted: false,
          status: 'valid',
          note: 'Species biological/synthetic chassis'
        });
      } else {
        baselineItems.push({
          category: 'Chassis',
          label: `Chassis: ${typeName}`,
          cost: 0,
          formattedCost: '0 CP',
          unaccounted: false,
          status: 'valid',
          note: 'Baseline chassis (0 CP)'
        });
      }
    }

    // Check secondary types in type[] (which act as secondary taxonomy tags when stored CP matches formula)
    for (let i = 1; i < rawTypeArr.length; i += 1) {
      const extraRaw = rawTypeArr[i];
      const cleanExtra = String(typeof extraRaw === 'object' ? (extraRaw?.name || extraRaw?.id) : extraRaw)
        .replace(/^species_type-/, '')
        .trim()
        .toLowerCase();
      const matchedExtra = allSpeciesTypes.find(
        t =>
          String(t.id || '').replace(/^species_type-/, '').toLowerCase() === cleanExtra ||
          String(t.name || '').toLowerCase() === cleanExtra
      );
      const extraCost = Number(matchedExtra?.bp ?? matchedExtra?.cp ?? 0);
      const extraName = matchedExtra?.name || cleanExtra.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (isStoredSynced || extraCost === 0) {
        baselineItems.push({
          category: 'Chassis',
          label: `Secondary Taxonomy: ${extraName}`,
          cost: 0,
          formattedCost: '0 CP',
          unaccounted: false,
          status: 'valid',
          note: 'Secondary chassis classification tag'
        });
      } else {
        unaccountedItems.push({
          category: 'Chassis',
          label: `Secondary Chassis: ${extraName}`,
          cost: extraCost,
          formattedCost: `${formatSignedCP(extraCost)} (Unaccounted)`,
          unaccounted: true,
          status: 'warning',
          note: 'Secondary chassis type in type[] not counted by formula'
        });
      }
    }
  } else if (data.base_chassis && Number(bd.typeBP || 0) === 0) {
    const baseChassisStr = String(data.base_chassis).trim();
    const cpMatch = baseChassisStr.match(/\(([+-]?\d+(?:[–-]\d+)?)\s*CP\)/i);
    const parsedCP = cpMatch ? Number(cpMatch[1].split(/[–-]/)[0]) : 0;
    if (parsedCP !== 0) {
      unaccountedItems.push({
        category: 'Chassis',
        label: `Chassis: ${baseChassisStr.replace(/\s*\(.*?\)/, '').trim()}`,
        cost: parsedCP,
        formattedCost: `${formatSignedCP(parsedCP)} (Unaccounted)`,
        unaccounted: true,
        status: 'warning',
        note: 'Lineage base_chassis text not parsed by formula'
      });
    } else {
      baselineItems.push({
        category: 'Chassis',
        label: `Chassis: ${baseChassisStr.replace(/\s*\(.*?\)/, '').trim() || 'Humanoid'}`,
        cost: 0,
        formattedCost: '0 CP',
        unaccounted: false,
        status: 'valid',
        note: 'Baseline chassis (0 CP)'
      });
    }
  }

  // ── 2. PHYSICAL SIZE ──────────────────────────────────────────────────────
  const rawSizeArr = Array.isArray(data.size)
    ? data.size
    : (data.size || data.species_size ? [data.size || data.species_size] : []);

  if (rawSizeArr.length > 0) {
    const primaryRawSize = rawSizeArr[0];
    const cleanPrimarySize = String(typeof primaryRawSize === 'object' ? (primaryRawSize?.name || primaryRawSize?.id) : primaryRawSize)
      .replace(/^species_size-/, '')
      .trim()
      .toLowerCase();
    const matchedPrimarySize = Object.values(SPECIES_SIZES || {}).find(
      s => s.id.toLowerCase() === cleanPrimarySize || s.name.toLowerCase() === cleanPrimarySize
    );

    if (!matchedPrimarySize && cleanPrimarySize) {
      const prettyRawSize = cleanPrimarySize.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      unaccountedItems.push({
        category: 'Size',
        label: `Size: ${prettyRawSize}`,
        cost: 0,
        formattedCost: '0 CP (Unaccounted)',
        unaccounted: true,
        status: 'warning',
        note: `Unrecognized size category '${prettyRawSize}' (formula fell back to Medium 0 CP)`
      });
    } else {
      const sizeCost = Number(bd.sizeBP ?? it.size?.bp ?? 0);
      const sizeName = it.size?.name || matchedPrimarySize?.name || 'Medium';
      if (sizeCost !== 0) {
        accountedItems.push({
          category: 'Size',
          label: `Size: ${sizeName}`,
          cost: sizeCost,
          formattedCost: formatSignedCP(sizeCost),
          unaccounted: false,
          status: 'valid',
          note: 'Physical scale modifier'
        });
      } else {
        baselineItems.push({
          category: 'Size',
          label: `Size: ${sizeName}`,
          cost: 0,
          formattedCost: '0 CP',
          unaccounted: false,
          status: 'valid',
          note: 'Standard Medium scale (0 CP)'
        });
      }
    }

    for (let i = 1; i < rawSizeArr.length; i += 1) {
      const extraSizeRaw = rawSizeArr[i];
      const cleanExtraSize = String(typeof extraSizeRaw === 'object' ? (extraSizeRaw?.name || extraSizeRaw?.id) : extraSizeRaw)
        .replace(/^species_size-/, '')
        .trim()
        .toLowerCase();
      const matchedExtraSize = Object.values(SPECIES_SIZES || {}).find(
        s => s.id.toLowerCase() === cleanExtraSize || s.name.toLowerCase() === cleanExtraSize
      );
      const extraSizeCost = Number(matchedExtraSize?.bp ?? 0);
      const extraSizeName = matchedExtraSize?.name || cleanExtraSize.replace(/\b\w/g, c => c.toUpperCase());
      unaccountedItems.push({
        category: 'Size',
        label: `Alternate Size: ${extraSizeName}`,
        cost: extraSizeCost,
        formattedCost: `${formatSignedCP(extraSizeCost)} (Unaccounted)`,
        unaccounted: true,
        status: 'warning',
        note: 'Secondary size category in size[] not counted by formula'
      });
    }
  }

  // ── 3. LOCOMOTION & MOVEMENT MODES ────────────────────────────────────────
  const itemizedMoveList = Array.isArray(it.movement) ? it.movement : [];
  const accountedMoveIds = new Set();

  itemizedMoveList.forEach(m => {
    if (m.id) accountedMoveIds.add(String(m.id).toLowerCase());
    (m.adjusters || []).forEach(adj => {
      if (adj.id) accountedMoveIds.add(String(adj.id).toLowerCase());
    });
    const mCost = Number(m.bp || 0);
    if (mCost !== 0) {
      accountedItems.push({
        category: 'Movement',
        label: `Movement: ${m.name || m.mode}${m.finalSpeed ? ` (${m.finalSpeed} ft)` : ''}`,
        cost: mCost,
        formattedCost: formatSignedCP(mCost),
        unaccounted: false,
        status: 'valid',
        note: `${m.mode || 'Locomotion'} pace`
      });
    } else {
      baselineItems.push({
        category: 'Movement',
        label: `Movement: ${m.name || m.mode}${m.finalSpeed ? ` (${m.finalSpeed} ft)` : ''}`,
        cost: 0,
        formattedCost: '0 CP',
        unaccounted: false,
        status: 'valid',
        note: 'Baseline locomotion (0 CP)'
      });
    }
  });

  const rawMoveInput = data.movementModes || data.movement_modes || data.movement || [];
  const rawMoveArr = Array.isArray(rawMoveInput) ? rawMoveInput : [rawMoveInput];
  rawMoveArr.forEach(mItem => {
    if (!mItem) return;
    const rawId = typeof mItem === 'object' ? (mItem.id || mItem.name || '') : String(mItem);
    const resolvedId = typeof resolveMovementId === 'function' ? resolveMovementId(rawId) : rawId;
    const cleanId = resolvedId.toLowerCase().replace(/^species_movement-/, '').replace(/^movement-/, '').replace(/-/g, '_');
    const rawLower = rawId.toLowerCase().trim();
    const resolvedLower = resolvedId.toLowerCase().trim();
    if (['normal', 'bipedal', 'standard', 'species_movement-bipedal'].includes(rawLower)) return;

    const matchedMove = allMoveModes.find(b => {
      const bId = (b.id || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const bBaseName = bName.replace(/\s*\(.*\)/, '').trim();
      return (
        bId === rawLower ||
        bId === resolvedLower ||
        bId === cleanId ||
        bName === rawLower ||
        bBaseName === rawLower ||
        bName === resolvedLower ||
        bBaseName === resolvedLower
      );
    });

    if (!matchedMove) {
      unaccountedItems.push({
        category: 'Movement',
        label: `Movement: ${rawId.replace(/^species_movement-/, '').replace(/-/g, ' ')}`,
        cost: 0,
        formattedCost: '0 CP (Unaccounted)',
        unaccounted: true,
        status: 'warning',
        note: 'Unrecognized movement mode not matched by formula'
      });
    } else if (!accountedMoveIds.has(String(matchedMove.id).toLowerCase())) {
      const mBp = Number(matchedMove.bp ?? matchedMove.cp ?? 0);
      if (mBp !== 0) {
        unaccountedItems.push({
          category: 'Movement',
          label: `Movement: ${matchedMove.name}`,
          cost: mBp,
          formattedCost: `${formatSignedCP(mBp)} (Unaccounted)`,
          unaccounted: true,
          status: 'warning',
          note: `Overwritten ${matchedMove.target_mode || 'Ground'} locomotion mode not counted by formula`
        });
      }
    }
  });

  // ── 4. ATTRIBUTES & ATTRIBUTE POOLS ───────────────────────────────────────
  const itemizedAttrs = Array.isArray(it.attributes) ? it.attributes : [];
  itemizedAttrs.forEach(a => {
    const aCost = Number(a.bp ?? a.cp ?? 0);
    if (aCost === 0) return;
    if (a.isPool) {
      accountedItems.push({
        category: 'Attr Pool',
        label: `Flexible Attribute Pool (${a.value > 0 ? `+${a.value}` : a.value})`,
        cost: aCost,
        formattedCost: formatSignedCP(aCost),
        unaccounted: false,
        status: 'valid',
        note: '5 CP per +1 flexible attribute point'
      });
    } else {
      accountedItems.push({
        category: 'Attribute',
        label: `${a.attr} ${a.value > 0 ? `+${a.value}` : a.value}`,
        cost: aCost,
        formattedCost: formatSignedCP(aCost),
        unaccounted: false,
        status: 'valid',
        note: 'Inherent attribute modifier (5 CP / pt)'
      });
    }
  });

  // Check if Matrix Col 2 has any attribute modifiers not accounted in itemizedAttrs (only when stored CP differs from formula)
  if (matrixCols[2] && !isStoredSynced) {
    const attrTokens = splitTopLevelCommas(matrixCols[2]);
    attrTokens.forEach(tok => {
      if (/^or\b/i.test(tok) || tok.toLowerCase().includes('(or ')) return;
      const m = tok.match(/([+-]\d+)\s+([A-Za-z]+).*?\[([+-]?\d+)\s*CP\]/i);
      if (m) {
        const val = Number(m[1]);
        const attrName = m[2].toUpperCase();
        const cp = Number(m[3]);
        const isAny = attrName.startsWith('ANY') || attrName.startsWith('PHYSICAL') || attrName.startsWith('MENTAL');
        const matched = itemizedAttrs.some(
          a =>
            (isAny && a.isPool && Number(a.bp) === cp) ||
            (!isAny && String(a.attr).startsWith(attrName.slice(0, 3)) && Number(a.bp) === cp)
        );
        if (!matched) {
          unaccountedItems.push({
            category: 'Attribute',
            label: `${attrName} ${val > 0 ? `+${val}` : val}`,
            cost: cp,
            formattedCost: `${formatSignedCP(cp)} (Unaccounted)`,
            unaccounted: true,
            status: 'warning',
            note: 'In codex matrix but missing/different in formula modifiers'
          });
        }
      }
    });
  }

  // ── 5. SKILL POOLS & SPECIFIC SKILL BONUSES ───────────────────────────────
  const skillsCost = Number(bd.skillsBP ?? it.skills?.bp ?? 0);
  const skillPoints = Number(it.skills?.points ?? skillsCost);
  if (skillsCost !== 0) {
    accountedItems.push({
      category: 'Skills',
      label: `Skill Pool (+${skillPoints} SP)`,
      cost: skillsCost,
      formattedCost: formatSignedCP(skillsCost),
      unaccounted: false,
      status: 'valid',
      note: `${it.skills?.bundles || Math.floor(skillPoints / 5)} bundle(s) • 1 CP per SP`
    });
  }

  // Check specific_skill_bonuses & inherent skill modifiers (ignored by calculateSpeciesBP)
  const modsArray = Array.isArray(data.modifiers) ? data.modifiers : [];
  const rawSpecSkills = [
    ...(Array.isArray(data.specific_skill_bonuses) ? data.specific_skill_bonuses : []),
    ...modsArray
      .filter(m => m && m.type === 'skill' && m.mode === 'inherent')
      .map(m => ({ skill: m.target || m.name, bonus: m.value ?? m.bonus ?? 1 }))
  ];
  const seenSpecSkills = new Set();
  rawSpecSkills.forEach(sk => {
    const skName = typeof sk === 'object' ? (sk.skill || sk.name || sk.id || '') : String(sk || '');
    const cleanSk = skName.trim();
    if (!cleanSk || seenSpecSkills.has(cleanSk.toLowerCase())) return;
    seenSpecSkills.add(cleanSk.toLowerCase());
    const bonusVal = typeof sk === 'object' ? Number(sk.bonus ?? sk.value ?? 1) : 1;
    unaccountedItems.push({
      category: 'Skills',
      label: `Skill Bonus: ${cleanSk} ${bonusVal >= 0 ? `+${bonusVal}` : bonusVal}`,
      cost: bonusVal,
      formattedCost: `${formatSignedCP(bonusVal)} (Unaccounted)`,
      unaccounted: true,
      status: 'warning',
      note: 'Innate specific skill bonus not included in formula'
    });
  });

  // ── 6. SPECIES BIOLOGICAL TRAITS ──────────────────────────────────────────
  const itemizedTraits = Array.isArray(it.traits) ? it.traits : [];
  itemizedTraits.forEach(t => {
    const tCost = Number(t.bp ?? t.cp ?? 0);
    const rawId = String(t.id || '').toLowerCase();
    const rawName = String(t.name || '').toLowerCase();
    const isInCatalog = allTraitsCatalog.some(cat => {
      if (!cat) return false;
      const cId = String(cat.id || '').toLowerCase();
      const cName = String(cat.name || '').toLowerCase();
      return cId === rawId || cName === rawName || cName.includes(rawName) || rawName.includes(cName);
    });

    if (!isInCatalog && rawId !== 'custom_trait') {
      unaccountedItems.push({
        category: 'Trait',
        label: `Trait: ${t.name || t.id}`,
        cost: tCost,
        formattedCost: `${formatSignedCP(tCost)} (Unaccounted)`,
        unaccounted: true,
        status: 'warning',
        note: 'Trait not found in canonical catalog (fallback 1 CP)'
      });
    } else if (tCost !== 0) {
      accountedItems.push({
        category: 'Trait',
        label: `Trait: ${t.name}`,
        cost: tCost,
        formattedCost: formatSignedCP(tCost),
        unaccounted: false,
        status: 'valid',
        note: `${t.tier || 'Species'} Trait`
      });
    }
  });

  // Check flexible trait pool (bonus_traits) ignored by calculateSpeciesBP
  const bonusTraitCount = Number(data.bonus_traits ?? 0);
  if (bonusTraitCount > 0) {
    unaccountedItems.push({
      category: 'Trait Pool',
      label: `Bonus Trait Pool (+${bonusTraitCount} Trait${bonusTraitCount > 1 ? 's' : ''})`,
      cost: bonusTraitCount,
      formattedCost: `${formatSignedCP(bonusTraitCount)} (Unaccounted)`,
      unaccounted: true,
      status: 'warning',
      note: 'Flexible bonus trait pool not included in formula'
    });
  }

  // Check string inherent_traits on SPECIES_LINEAGES when itemizedTraits is empty
  if (typeof data.inherent_traits === 'string' && data.inherent_traits.trim() && itemizedTraits.length === 0) {
    const lineageTokens = splitTopLevelCommas(data.inherent_traits);
    lineageTokens.forEach(tok => {
      const m = tok.match(/^(.*?)\s*\[([+-]?\d+(?:[–-]\d+)?)\s*CP\]/i);
      if (m) {
        const label = m[1].trim();
        const cpVal = Number(m[2].split(/[–-]/)[0]);
        unaccountedItems.push({
          category: 'Lineage Trait',
          label,
          cost: cpVal,
          formattedCost: `${formatSignedCP(cpVal)} (Unaccounted)`,
          unaccounted: true,
          status: 'warning',
          note: 'Lineage inherent_traits text not parsed by formula'
        });
      }
    });
  }

  // ── 7. INHERENT FEATURES & BONUS FEATURE POOL ─────────────────────────────
  const itemizedFeatures = Array.isArray(it.features) ? it.features : [];
  const accountedFeatureIds = new Set();

  itemizedFeatures.forEach(f => {
    const fCost = Number(f.bp ?? f.cp ?? 0);
    if (f.id) accountedFeatureIds.add(String(f.id).toLowerCase());
    if (f.isPool) {
      if (fCost !== 0) {
        accountedItems.push({
          category: 'Feature Pool',
          label: f.name || `Feature Pool (+${f.count || 1})`,
          cost: fCost,
          formattedCost: formatSignedCP(fCost),
          unaccounted: false,
          status: 'valid',
          note: '3 CP per flexible feature'
        });
      }
      return;
    }

    const fIdLower = String(f.id || '').toLowerCase();
    const fNameLower = String(f.name || '').toLowerCase();
    const matchedFeat = allFeaturesCatalog.find(
      cat =>
        cat &&
        (String(cat.id || '').toLowerCase() === fIdLower ||
          String(cat.name || '').toLowerCase() === fNameLower)
    );

    if (!matchedFeat) {
      unaccountedItems.push({
        category: 'Feature',
        label: `Feature: ${f.name || f.id}`,
        cost: fCost,
        formattedCost: `${formatSignedCP(fCost)} (Unaccounted)`,
        unaccounted: true,
        status: 'warning',
        note: 'Feature not found in canonical catalog (fallback 3 CP)'
      });
    } else if (fCost !== 0) {
      accountedItems.push({
        category: 'Feature',
        label: `Feature: ${f.name}`,
        cost: fCost,
        formattedCost: formatSignedCP(fCost),
        unaccounted: false,
        status: 'valid',
        note: 'Inherent species feature'
      });
    }
  });

  // Check if any raw inherent_features were skipped by calculateSpeciesBP
  const rawInherentFeats = Array.isArray(data.inherent_features) ? data.inherent_features : [];
  rawInherentFeats.forEach(rf => {
    const rfStr = typeof rf === 'object' ? (rf.id || rf.name || '') : String(rf || '');
    const lowerRf = rfStr.toLowerCase().trim();
    if (!lowerRf || lowerRf.startsWith('trait-') || lowerRf.includes('trait')) return;
    const isCounted = itemizedFeatures.some(
      f => !f.isPool && (String(f.id || '').toLowerCase() === lowerRf || String(f.name || '').toLowerCase() === lowerRf)
    );
    if (!isCounted) {
      unaccountedItems.push({
        category: 'Feature',
        label: `Feature: ${rfStr}`,
        cost: 3,
        formattedCost: '+3 CP (Unaccounted)',
        unaccounted: true,
        status: 'warning',
        note: 'Inherent feature skipped by formula deduplication'
      });
    }
  });

  // ── 8. DISADVANTAGES / FLAWS ──────────────────────────────────────────────
  const itemizedDisads = Array.isArray(it.disadvantages) ? it.disadvantages : [];
  itemizedDisads.forEach(d => {
    const refVal = Math.abs(Number(d.refundBP ?? d.cp_refund ?? 0));
    if (refVal !== 0) {
      accountedItems.push({
        category: 'Flaw',
        label: `Flaw: ${d.name}`,
        cost: -refVal,
        formattedCost: formatSignedCP(-refVal),
        unaccounted: false,
        status: 'valid',
        note: 'Species disadvantage CP rebate'
      });
    } else {
      unaccountedItems.push({
        category: 'Flaw',
        label: `Flaw: ${d.name || d.id}`,
        cost: 0,
        formattedCost: '0 CP (Unaccounted)',
        unaccounted: true,
        status: 'warning',
        note: 'Disadvantage has 0 CP rebate in formula'
      });
    }
  });

  // Check if any raw disadvantages were unmatched and dropped by calculateSpeciesBP
  const rawDisList = [
    ...(Array.isArray(data.disadvantages) ? data.disadvantages : []),
    ...(Array.isArray(data.inherent_disadvantages) ? data.inherent_disadvantages : []),
    ...(Array.isArray(data.hindrances) ? data.hindrances : []),
    ...(Array.isArray(data.flaws) ? data.flaws : [])
  ];
  rawDisList.forEach(rd => {
    const rdId = typeof rd === 'object' ? (rd.id || rd.name || '') : String(rd || '');
    const cleanRd = rdId.toLowerCase().trim().replace(/^disadvantage-species-/, '').replace(/^disadvantage-/, '').replace(/^hindrance-/, '').replace(/-/g, '_');
    if (!cleanRd) return;
    const isMatched = itemizedDisads.some(
      d => String(d.id || '').toLowerCase() === cleanRd || String(d.name || '').toLowerCase() === rdId.toLowerCase().trim()
    );
    if (!isMatched) {
      unaccountedItems.push({
        category: 'Flaw',
        label: `Flaw: ${rdId}`,
        cost: 0,
        formattedCost: '0 CP (Unaccounted)',
        unaccounted: true,
        status: 'warning',
        note: 'Disadvantage not found in catalog (ignored by formula)'
      });
    }
  });

  // ── 9. SOCIAL STIGMA REBATE ───────────────────────────────────────────────
  const stigmaRefund = Math.abs(Number(bd.stigmaRefund ?? it.stigma?.refundBP ?? 0));
  const rawStigmaText = String(data.social_stigma || data.stigma || it.stigma?.text || '').trim();
  const hasRealStigma = Boolean(rawStigmaText && rawStigmaText !== 'None' && !rawStigmaText.toLowerCase().startsWith('none'));

  if (stigmaRefund > 0) {
    accountedItems.push({
      category: 'Stigma',
      label: `Stigma: ${rawStigmaText || 'Social Stigma'}`,
      cost: -stigmaRefund,
      formattedCost: formatSignedCP(-stigmaRefund),
      unaccounted: false,
      status: 'valid',
      note: 'Social Stigma CP rebate'
    });
  } else if (hasRealStigma) {
    unaccountedItems.push({
      category: 'Stigma',
      label: `Stigma: ${rawStigmaText}`,
      cost: 0,
      formattedCost: '0 CP (Unaccounted)',
      unaccounted: true,
      status: 'warning',
      note: 'Social Stigma text yielded 0 CP rebate in formula'
    });
  }

  // ── 10. NON-STANDARD MODIFIERS ────────────────────────────────────────────
  modsArray.forEach(m => {
    if (!m || typeof m !== 'object') return;
    if (m.mode === 'recommended') return;
    if (['attribute', 'skill', 'feature', 'disadvantage'].includes(m.type)) return;
    const modVal = Number(m.value ?? m.bonus ?? 0);
    unaccountedItems.push({
      category: 'Modifier',
      label: `${m.type || 'Modifier'}: ${m.target || m.name || 'Custom'} (${modVal >= 0 ? `+${modVal}` : modVal})`,
      cost: 0,
      formattedCost: '0 CP (Unaccounted)',
      unaccounted: true,
      status: 'warning',
      note: `Modifier type '${m.type}' is not priced by the species formula`
    });
  });

  // ── 11. MECHANICAL SUMMARY MATRIX ITEMS UNACCOUNTED BY FORMULA ────────────
  if (matrixCols[4] && !isStoredSynced) {
    const featTokens = splitTopLevelCommas(matrixCols[4]);
    const accountedPool = [
      ...itemizedTraits.map(t => ({ name: t.name, cp: t.bp, used: false })),
      ...itemizedFeatures.map(f => ({ name: f.name, cp: f.bp, used: false })),
      ...itemizedDisads.map(d => ({ name: d.name, cp: -d.refundBP, used: false })),
      ...(Number(bd.sizeBP || 0) !== 0 ? [{ name: `${it.size?.name || ''} Size`, cp: bd.sizeBP, used: false }] : []),
      ...itemizedMoveList.filter(m => Number(m.bp || 0) !== 0).map(m => ({ name: m.name, cp: m.bp, used: false }))
    ];

    featTokens.forEach(tok => {
      const cpMatches = [...tok.matchAll(/\[([+-]?\d+(?:[–-]\d+)?)\s*CP(?:\s*optional)?\]/gi)];
      if (cpMatches.length === 0) return;
      const lastMatch = cpMatches[cpMatches.length - 1];
      const cpNum = Number(lastMatch[1].split(/[–-]/)[0]);
      if (cpNum === 0) return;
      const cleanTok = tok.replace(/\[.*?\]/g, '').trim();
      const lowerTok = cleanTok.toLowerCase();

      // Skip composite lineage headers that are expanded into individual traits in the formula
      if (lowerTok.startsWith('kitin base') && itemizedTraits.some(t => String(t.name).includes('Torpor'))) return;
      if (lowerTok.startsWith('aeld base') && itemizedTraits.some(t => String(t.name).includes('Aeld'))) return;
      if (lowerTok.startsWith('asi base') && itemizedTraits.some(t => String(t.name).includes('Asi'))) return;
      if (lowerTok.startsWith('auluran base') && itemizedTraits.some(t => String(t.name).includes('Auluran'))) return;
      if (lowerTok.startsWith('synthetic base') && itemizedTraits.some(t => String(t.name).includes('Synthetic Base'))) return;
      if (lowerTok.startsWith('progenitor heritage') && itemizedTraits.some(t => String(t.name).includes('Progenitor'))) return;
      if ((lowerTok.includes('feature') || lowerTok.includes('features')) && /^\+\d+/.test(lowerTok) && itemizedFeatures.some(f => f.isPool)) return;
      if ((lowerTok.includes('diminutive') || lowerTok.includes('tiny') || lowerTok.includes('small') || lowerTok.includes('large') || lowerTok.includes('huge')) && Number(bd.sizeBP || 0) > 0) return;
      if ((lowerTok.includes('flight') || lowerTok.includes('flicker')) && (itemizedMoveList.some(m => Number(m.bp || 0) > 0) || itemizedTraits.some(t => String(t.name).toLowerCase().includes('flight')))) return;
      if (lowerTok.includes('swarm body') && rawTypeArr.length > 1) return;

      const tokWords = expandMatrixWords(normMatrixWords(cleanTok));
      const matchIdx = accountedPool.findIndex(item => {
        if (item.used) return false;
        const itemWords = normMatrixWords(item.name);
        return itemWords.some(iw => tokWords.has(iw));
      });

      if (matchIdx !== -1) {
        accountedPool[matchIdx].used = true;
      } else {
        unaccountedItems.push({
          category: 'Matrix Item',
          label: cleanTok,
          cost: cpNum,
          formattedCost: `${formatSignedCP(cpNum)} (Unaccounted)`,
          unaccounted: true,
          status: 'warning',
          note: 'Listed with cost in Codex Matrix but unaccounted by formula'
        });
      }
    });
  }

  // ── 12. STORED CP VS FORMULA CP VARIANCE ──────────────────────────────────
  if (hasExplicitCP && storedCP !== computedCP) {
    const delta = storedCP - computedCP;
    unaccountedItems.push({
      category: 'CP Variance',
      label: `Stored CP Variance (${storedCP} CP stored vs ${computedCP} CP formula)`,
      cost: delta,
      formattedCost: `${formatSignedCP(delta)} (Unaccounted)`,
      unaccounted: true,
      status: 'warning',
      note: 'Difference between stored CP and formula-computed CP'
    });
  }

  const costItems = [...accountedItems, ...unaccountedItems];

  return {
    costItems: costItems.length > 0 ? costItems : baselineItems,
    accountedItems,
    unaccountedItems,
    baselineItems,
    hasUnaccountedItems: unaccountedItems.length > 0
  };
}

/**
 * Extracts itemized build DC / cost breakdown and any credit or formula DC discrepancies
 * for Property assets (Equipment/Gear, Mecha/Vehicles, Weaponry, Armoring, Augmentations, Architecture, Other).
 */
export function extractPropertyBuildCostItems({
  data = {},
  key = 'equipment',
  craftDC = 15,
  expectedCredits = 640,
  materialCost = 320,
  enteredCredits = 640,
  hasExplicitCost = false,
  valuation = {},
  capacityItem = null,
  isOverCapacity = false,
  complexityTier = 'Expert'
} = {}) {
  const accountedItems = [];
  const unaccountedItems = [];
  const baselineItems = [];
  let formulaDC = null;
  let formulaSummaryNote = '';

  const tlNum = Number(data.tl ?? data.tech_level ?? 3);
  const mlNum = Number(data.ml ?? data.meta_level ?? 0);

  if (key === 'mecha' || key === 'vehicles') {
    const sizeKey = data.size || 'Medium';
    const sizeDef = MECHA_SIZES[sizeKey] || MECHA_SIZES.Medium;
    const hasExplicitBase = data.base_dc !== undefined && data.base_dc !== null && data.base_dc !== '';
    const baseDC = hasExplicitBase ? Number(data.base_dc) : Number(sizeDef.baseCR ?? sizeDef.baseDC ?? 22);

    accountedItems.push({
      category: 'Chassis',
      label: `Chassis Size: ${sizeKey}`,
      value: `+${sizeDef.baseDC} DC`,
      cost: sizeDef.baseDC,
      status: 'valid',
      note: `${sizeDef.structure} Base SP • ${sizeDef.scale} Scale • ${sizeDef.mounts} Mounts`
    });

    if (hasExplicitBase && baseDC !== sizeDef.baseDC) {
      const baseDiff = baseDC - sizeDef.baseDC;
      accountedItems.push({
        category: 'Chassis',
        label: `Base DC Override (${baseDC})`,
        value: `${baseDiff >= 0 ? '+' : ''}${baseDiff} DC`,
        cost: baseDiff,
        status: 'valid',
        note: `Configured Base DC ${baseDC} vs ${sizeKey} Default DC ${sizeDef.baseDC}`
      });
    }

    const resolvedFrameKey = resolveMechaFrameKey(
      data.frame || data.frame_type,
      data.classification || data.category,
      data.name
    );
    const frameDef = MECHA_FRAMES[resolvedFrameKey] || MECHA_FRAMES.Humanoid;
    const rawFrameStr = toCleanString(data.frame || data.frame_type, '');
    const frameLabel = rawFrameStr && rawFrameStr.toLowerCase() !== resolvedFrameKey.toLowerCase()
      ? `${resolvedFrameKey} (${rawFrameStr})`
      : resolvedFrameKey;

    if (frameDef.complexityDC !== 0) {
      accountedItems.push({
        category: 'Frame',
        label: `Frame Configuration: ${frameLabel}`,
        value: `${frameDef.complexityDC >= 0 ? '+' : ''}${frameDef.complexityDC} DC`,
        cost: frameDef.complexityDC,
        status: 'valid',
        note: `Handling ${frameDef.handlingMod >= 0 ? '+' : ''}${frameDef.handlingMod} • ${frameDef.description}`
      });
    } else {
      baselineItems.push(`Frame: ${frameLabel} (0 DC)`);
    }

    const tlMod = tlNum <= 2 ? -5 : tlNum === 3 ? 0 : tlNum === 4 ? 5 : 10;
    if (tlMod !== 0) {
      accountedItems.push({
        category: 'Tech Level',
        label: `Tech Level: TL ${tlNum}`,
        value: `${tlMod >= 0 ? '+' : ''}${tlMod} DC`,
        cost: tlMod,
        status: 'valid',
        note: `Canonical Mecha TL ${tlNum} Base CR modifier`
      });
    } else {
      baselineItems.push('Tech Level: TL 3 (0 DC)');
    }

    const propKey = data.propulsion || data.propulsion_type;
    if (propKey) {
      const propDef = Array.isArray(MECHA_PROPULSION)
        ? MECHA_PROPULSION.find(p => p.id === propKey || p.name === propKey)
        : null;
      if (propDef) {
        if (propDef.dcMod !== 0) {
          accountedItems.push({
            category: 'Propulsion',
            label: `Propulsion: ${propDef.name}`,
            value: `Comp CR ${10 + propDef.dcMod}`,
            cost: propDef.dcMod,
            status: 'valid',
            note: `${propDef.speed} • ${propDef.mounts} Mount(s)`
          });
        } else {
          baselineItems.push(`Propulsion: ${propDef.name} (0 DC)`);
        }
      }
    }

    const armorList = Array.isArray(data.armor) ? data.armor : (Array.isArray(data.armor_types) ? data.armor_types : []);
    armorList.forEach(armItem => {
      const armId = typeof armItem === 'string' ? armItem : armItem?.id;
      const armDef = Array.isArray(MECHA_ARMOR_TYPES)
        ? MECHA_ARMOR_TYPES.find(a => a.id === armId || a.name === armId)
        : null;
      if (armDef) {
        accountedItems.push({
          category: 'Armor',
          label: `Hull Armor: ${armDef.name}`,
          value: `Comp CR ${10 + armDef.dcMod}`,
          cost: armDef.dcMod,
          status: 'valid',
          note: `${armDef.effect} (TL ${armDef.tl})`
        });
      }
    });

    const moduleList = Array.isArray(data.modules) ? data.modules : (Array.isArray(data.installed_modules) ? data.installed_modules : []);
    moduleList.forEach(modItem => {
      const modId = typeof modItem === 'string' ? modItem : modItem?.id;
      const modDef = Array.isArray(MECHA_MODULES)
        ? MECHA_MODULES.find(m => m.id === modId || m.name === modId)
        : null;
      if (modDef) {
        if (modDef.dcMod !== 0) {
          accountedItems.push({
            category: 'Module',
            label: `Mecha Module: ${modDef.name}`,
            value: `Comp CR ${10 + modDef.dcMod}`,
            cost: modDef.dcMod,
            status: 'valid',
            note: `${modDef.function} (${modDef.mounts} Mounts)`
          });
        } else {
          baselineItems.push(`Module: ${modDef.name} (0 DC)`);
        }
      }
    });

    const compList = Array.isArray(data.components) ? data.components : [];
    compList.forEach(compItem => {
      const compId = typeof compItem === 'string' ? compItem : compItem?.id;
      const compDef = Array.isArray(MECHA_COMPONENTS)
        ? MECHA_COMPONENTS.find(c => c.id === compId || c.name === compId)
        : null;
      if (compDef) {
        if (compDef.dcMod !== 0) {
          accountedItems.push({
            category: 'Component',
            label: `Core Component: ${compDef.name}`,
            value: `Comp CR ${10 + compDef.dcMod}`,
            cost: compDef.dcMod,
            status: 'valid',
            note: compDef.notes
          });
        } else {
          baselineItems.push(`Component: ${compDef.name} (0 DC)`);
        }
      }
    });

    const vftKey = data.vft_mode || data.vftMode;
    if (vftKey && vftKey !== 'None' && VFT_MODES[vftKey] && VFT_MODES[vftKey].dcMod !== 0) {
      const vDef = VFT_MODES[vftKey];
      accountedItems.push({
        category: 'VFT',
        label: `Variable Form Tech: ${vDef.name}`,
        value: `+${vDef.dcMod} DC`,
        cost: vDef.dcMod,
        status: 'valid',
        note: vDef.notes || vDef.actionCost
      });
    }

    const skinKey = data.faction_skin || data.skin;
    if (skinKey && MANUFACTURER_SKINS[skinKey]) {
      const sDef = MANUFACTURER_SKINS[skinKey];
      if (sDef.dcMod !== 0) {
        accountedItems.push({
          category: 'Skin',
          label: `Manufacturer Skin: ${sDef.name}`,
          value: `${sDef.dcMod >= 0 ? '+' : ''}${sDef.dcMod} DC`,
          cost: sDef.dcMod,
          status: 'valid',
          note: sDef.trait
        });
      } else {
        baselineItems.push(`Skin: ${sDef.name} (0 DC)`);
      }
    }

    formulaDC = calculateMechaDC({
      baseDC: hasExplicitBase ? baseDC : undefined,
      size: sizeKey,
      frame: data.frame || data.frame_type || 'Humanoid',
      classification: data.classification || data.category || '',
      name: data.name || '',
      propulsion: propKey || 'wheels',
      armor: armorList,
      modules: moduleList,
      components: compList,
      weapons: Array.isArray(data.weapons) ? data.weapons : [],
      vftMode: vftKey || 'None',
      tl: tlNum,
      skin: skinKey
    });

    const fParts = [
      `${sizeKey} (${sizeDef.baseDC} DC)`,
      `${resolvedFrameKey} (${frameDef.complexityDC >= 0 ? '+' : ''}${frameDef.complexityDC} DC)`,
      `TL ${tlNum} (${tlMod >= 0 ? '+' : ''}${tlMod} DC)`
    ];
    formulaSummaryNote = `Mecha Forge Formula: ${fParts.join(' + ')} = DC ${formulaDC} (${calculateCreditValue(formulaDC).toLocaleString()} Cr) vs Stored DC ${craftDC} (${expectedCredits.toLocaleString()} Cr)`;
  } else if (key === 'gear' || key === 'equipment') {
    const sizeKey = data.size || 'Small';
    const sizeDef = EQUIPMENT_SIZES[sizeKey] || EQUIPMENT_SIZES.Small;
    const rawBase = data.base_cr ?? data.base_dc;
    const hasExplicitBase = rawBase !== undefined && rawBase !== null && rawBase !== '';
    const baseDC = hasExplicitBase ? Number(rawBase) : sizeDef.defaultDC;

    accountedItems.push({
      category: 'Chassis',
      label: `Equipment Size: ${sizeKey}`,
      value: `+${sizeDef.defaultDC} DC`,
      cost: sizeDef.defaultDC,
      status: 'valid',
      note: `${sizeDef.capacityDisplay} • Mass ${sizeDef.mass} • ${sizeDef.sp} SP`
    });

    if (hasExplicitBase && baseDC !== sizeDef.defaultDC) {
      const baseDiff = baseDC - sizeDef.defaultDC;
      accountedItems.push({
        category: 'Chassis',
        label: `Base Complexity Adjustment (Base DC ${baseDC})`,
        value: `${baseDiff >= 0 ? '+' : ''}${baseDiff} DC`,
        cost: baseDiff,
        status: 'valid',
        note: `Configured Base DC ${baseDC} vs ${sizeKey} Default DC ${sizeDef.defaultDC}`
      });
    }

    const wsScale = data.workspace_scale;
    if (wsScale && wsScale !== 'None' && WORKSPACE_SCALES[wsScale]) {
      const wsDef = WORKSPACE_SCALES[wsScale];
      if (wsDef.dcMod !== 0) {
        accountedItems.push({
          category: 'Workspace',
          label: `Workspace Scale: ${wsDef.name}`,
          value: `+${wsDef.dcMod} DC`,
          cost: wsDef.dcMod,
          status: 'valid',
          note: wsDef.description
        });
      } else {
        baselineItems.push(`Workspace: ${wsDef.name} (0 DC)`);
      }
    }

    const compPR = data.computer_pr;
    if (compPR !== undefined && compPR !== null && compPR !== '' && Number(compPR) > 0) {
      const prNum = Number(compPR);
      accountedItems.push({
        category: 'Computing',
        label: `Computer Processing Rating (PR ${prNum})`,
        value: `+${prNum * 5} DC`,
        cost: prNum * 5,
        status: 'valid',
        note: `+5 DC per PR tier (PR ${prNum})`
      });
    }

    const softLvl = Number(data.software_level || 0);
    if (softLvl > 0) {
      accountedItems.push({
        category: 'Computing',
        label: `Software Intrusion/Defense (Rank ${softLvl})`,
        value: `+${softLvl * 5} DC`,
        cost: softLvl * 5,
        status: 'valid',
        note: `+5 DC per Software Rank`
      });
    }

    const epr = Number(data.epr_rating || 0);
    if (epr > 0 && EPR_RATINGS[epr]) {
      accountedItems.push({
        category: 'Protection',
        label: `Environmental Protection: ${EPR_RATINGS[epr].name}`,
        value: `+${EPR_RATINGS[epr].dcMod} DC`,
        cost: EPR_RATINGS[epr].dcMod,
        status: 'valid',
        note: EPR_RATINGS[epr].description
      });
    }

    const metaSocks = Number(data.meta_sockets || 0);
    if (metaSocks > 0) {
      accountedItems.push({
        category: 'Meta-Tech',
        label: `Meta-Tech Sockets (${metaSocks})`,
        value: `+${metaSocks * 5} DC`,
        cost: metaSocks * 5,
        status: 'valid',
        note: `+5 DC per Meta Socket`
      });
    }

    const skinKey = data.skin || data.faction_skin;
    if (skinKey && MANUFACTURER_SKINS[skinKey]) {
      const sDef = MANUFACTURER_SKINS[skinKey];
      if (sDef.dcMod !== 0) {
        accountedItems.push({
          category: 'Skin',
          label: `Manufacturer Skin: ${sDef.name}`,
          value: `${sDef.dcMod >= 0 ? '+' : ''}${sDef.dcMod} DC`,
          cost: sDef.dcMod,
          status: 'valid',
          note: sDef.trait
        });
      } else {
        baselineItems.push(`Skin: ${sDef.name} (0 DC)`);
      }
    }

    if (data.is_rare) {
      accountedItems.push({
        category: 'Rarity',
        label: 'Regional Rarity',
        value: '+5 DC',
        cost: 5,
        status: 'valid',
        note: 'Restricted / Rare availability modifier'
      });
    }

    baselineItems.push(`Tech Level: TL ${tlNum} (0 DC)`);
    if (data.category) baselineItems.push(`Category: ${data.category}`);

    formulaDC = calculateEquipmentDC({
      baseDC,
      size: sizeKey,
      workspaceScale: wsScale,
      computerPR: compPR,
      softwareLevel: softLvl,
      eprRating: epr,
      skin: skinKey,
      metaSockets: metaSocks,
      isRare: !!data.is_rare
    });

    const eqParts = [`Base DC (${baseDC})`];
    if (wsScale && WORKSPACE_SCALES[wsScale]?.dcMod) eqParts.push(`Workspace ${wsScale} (+${WORKSPACE_SCALES[wsScale].dcMod} DC)`);
    if (compPR !== undefined && compPR !== null && Number(compPR) > 0) eqParts.push(`Computer PR ${compPR} (+${Number(compPR) * 5} DC)`);
    if (softLvl > 0) eqParts.push(`Software Lvl ${softLvl} (+${softLvl * 5} DC)`);
    if (epr > 0 && EPR_RATINGS[epr]?.dcMod) eqParts.push(`EPR ${epr} (+${EPR_RATINGS[epr].dcMod} DC)`);
    if (metaSocks > 0) eqParts.push(`Meta Sockets (+${metaSocks * 5} DC)`);
    if (skinKey && MANUFACTURER_SKINS[skinKey]?.dcMod) eqParts.push(`${skinKey} (${MANUFACTURER_SKINS[skinKey].dcMod} DC)`);
    if (data.is_rare) eqParts.push(`Rare (+5 DC)`);
    formulaSummaryNote = `Equipment Forge Formula: ${eqParts.join(' + ')} = DC ${formulaDC} (${calculateCreditValue(formulaDC).toLocaleString()} Cr) vs Stored DC ${craftDC} (${expectedCredits.toLocaleString()} Cr)`;
  } else if (key === 'weaponry' || key === 'weapons') {
    const sizeKey = data.size || 'Medium';
    const rawBase = data.base_cr ?? data.base_dc;
    const hasExplicitBase = rawBase !== undefined && rawBase !== null && rawBase !== '';
    const baseDC = hasExplicitBase ? Number(rawBase) : craftDC;

    accountedItems.push({
      category: 'Chassis',
      label: `Weapon Chassis (${data.classification || data.weapon_type || sizeKey})`,
      value: `+${baseDC} DC`,
      cost: baseDC,
      status: 'valid',
      note: `Damage: ${data.damage || '1d6'} (${data.damage_type || 'Kinetic'}) • Size: ${sizeKey} • TL ${tlNum}`
    });

    if (Array.isArray(data.modifications)) {
      data.modifications.forEach(mod => {
        if (typeof mod === 'object' && mod !== null) {
          const dcMod = Number(mod.dcMod ?? mod.dc_modifier ?? 0);
          accountedItems.push({
            category: 'Modification',
            label: `Weapon Mod: ${mod.name || mod.id || 'Mod'}`,
            value: `${dcMod >= 0 ? '+' : ''}${dcMod} DC`,
            cost: dcMod,
            status: 'valid',
            note: mod.effect || `${mod.sockets ?? 1} Socket(s)`
          });
        } else if (typeof mod === 'string') {
          const found = WEAPON_MODIFICATIONS.find(m => m.id === mod || m.name === mod);
          if (found) {
            accountedItems.push({
              category: 'Modification',
              label: `Weapon Mod: ${found.name}`,
              value: `+${found.dcMod} DC`,
              cost: found.dcMod,
              status: 'valid',
              note: `${found.effect} (${found.sockets} Socket${found.sockets === 1 ? '' : 's'})`
            });
          }
        }
      });
    }

    if (Array.isArray(data.downgrades)) {
      data.downgrades.forEach(dw => {
        const dwId = typeof dw === 'string' ? dw : dw?.id;
        const found = WEAPON_DOWNGRADES.find(d => d.id === dwId || d.name === dwId);
        if (found) {
          accountedItems.push({
            category: 'Downgrade',
            label: `Weapon Flaw: ${found.name}`,
            value: `${found.dcMod} DC`,
            cost: found.dcMod,
            status: 'valid',
            note: found.effect
          });
        }
      });
    }

    const capKey = data.capacity_upgrade || 'typical';
    if (capKey && capKey !== 'typical') {
      const capDef = WEAPON_CAPACITY_UPGRADES.find(c => c.id === capKey || c.name === capKey);
      if (capDef && capDef.dcMod !== 0) {
        accountedItems.push({
          category: 'Capacity',
          label: `Ammo Capacity: ${capDef.name}`,
          value: `+${capDef.dcMod} DC`,
          cost: capDef.dcMod,
          status: 'valid',
          note: `x${capDef.multiplier} Ammunition Capacity`
        });
      }
    } else {
      baselineItems.push('Capacity: Standard (0 DC)');
    }

    const metaRanks = Number(data.meta_ranks || 0);
    if (metaRanks > 0) {
      accountedItems.push({
        category: 'Meta-Tech',
        label: `Invocation / Meta Ranks (${metaRanks})`,
        value: `+${metaRanks * 5} DC`,
        cost: metaRanks * 5,
        status: 'valid',
        note: '+5 DC per Meta Rank'
      });
    }

    const skinKey = data.faction_skin || data.skin;
    if (skinKey && MANUFACTURER_SKINS[skinKey]) {
      const sDef = MANUFACTURER_SKINS[skinKey];
      if (sDef.dcMod !== 0) {
        accountedItems.push({
          category: 'Skin',
          label: `Manufacturer Skin: ${sDef.name}`,
          value: `${sDef.dcMod >= 0 ? '+' : ''}${sDef.dcMod} DC`,
          cost: sDef.dcMod,
          status: 'valid',
          note: sDef.trait
        });
      } else {
        baselineItems.push(`Skin: ${sDef.name} (0 DC)`);
      }
    }

    formulaDC = calculateWeaponDC({
      baseDC,
      modifications: data.modifications || [],
      downgrades: data.downgrades || [],
      capacityUpgrade: capKey,
      skin: skinKey,
      metaRanks,
      tl: tlNum,
      isRare: !!data.is_rare
    });
  } else if (key === 'armoring' || key === 'armor') {
    const sizeKey = data.size || data.armor_class || data.category || 'Mediumweight';
    const covKey = data.coverage || 'Standard';
    const covDef = ARMOR_COVERAGE[covKey] || ARMOR_COVERAGE.Standard;
    const matDef = ARMOR_MATERIALS[tlNum] || ARMOR_MATERIALS[3];
    const rawBase = data.base_cr ?? data.base_dc ?? data.baseDC;
    const hasExplicitBase = rawBase !== undefined && rawBase !== null && rawBase !== '';

    accountedItems.push({
      category: 'Chassis',
      label: `Armor Chassis (${sizeKey})`,
      value: `DC ${hasExplicitBase ? Number(rawBase) : craftDC}`,
      cost: hasExplicitBase ? Number(rawBase) : craftDC,
      status: 'valid',
      note: `DR ${data.dr ?? 10} • SP ${data.sp ?? data.durability ?? 20} • Coverage: ${covDef.name}`
    });

    if (hasExplicitBase && covDef.dcMod !== 0) {
      accountedItems.push({
        category: 'Coverage',
        label: `Coverage Mode: ${covDef.name}`,
        value: `${covDef.dcMod >= 0 ? '+' : ''}${covDef.dcMod} DC`,
        cost: covDef.dcMod,
        status: 'valid',
        note: covDef.description
      });
    } else {
      baselineItems.push(`Coverage: ${covDef.name}`);
    }

    baselineItems.push(`Material: TL ${tlNum} ${matDef.name}`);

    if (Array.isArray(data.modules)) {
      data.modules.forEach(mod => {
        const modId = typeof mod === 'string' ? mod : mod?.id;
        const found = ARMOR_MODULES.find(m => m.id === modId || m.name === modId);
        if (found) {
          accountedItems.push({
            category: 'Module',
            label: `Armor Module: ${found.name}`,
            value: `+${found.dcMod} DC`,
            cost: found.dcMod,
            status: 'valid',
            note: `${found.effect} (${found.sockets} Socket${found.sockets === 1 ? '' : 's'})`
          });
        }
      });
    }

    if (hasExplicitBase) {
      formulaDC = calculateArmorDC({
        baseDC: Number(rawBase),
        size: sizeKey,
        coverage: covKey,
        modules: data.modules || [],
        downgrades: data.downgrades || [],
        skin: data.faction_skin || data.skin,
        isRare: !!(data.is_rare ?? data.isRare)
      });
    }
  } else if (key === 'augmentations' || key === 'augmentation') {
    const augType = toCleanString(data.augmentation_type || data.type, 'Cybernetic');
    const loc = toCleanString(data.body_location || data.location, 'Torso');
    const nodes = Number(data.nodes ?? data.node_cost ?? data.costs?.nodes ?? 1);
    accountedItems.push({
      category: 'Implant',
      label: `${augType} Implant (${loc})`,
      value: `DC ${craftDC}`,
      cost: craftDC,
      status: 'valid',
      note: `Anatomical Allocation: ${nodes}/200 Nodes • Tech Level: TL ${tlNum}`
    });
    if (data.stigma) baselineItems.push(`Stigma: ${data.stigma}`);
  } else if (key === 'architecture') {
    const footprintKey = data.footprint || data.scale || data.size || 'Large';
    const fpDef = ARCHITECTURE_FOOTPRINTS[footprintKey] || ARCHITECTURE_FOOTPRINTS.Large;
    const heightKey = deriveHeightClassFromStories(data.stories, data.height_class || 'Single');
    const hDef = HEIGHT_CLASSES[heightKey] || HEIGHT_CLASSES.Single;
    const frameKey = data.frame_type || data.frame || 'Standard';
    const archFrameDef = ARCHITECTURE_FRAME_TYPES[frameKey] || ARCHITECTURE_FRAME_TYPES.Standard;
    const envKey = data.environment || 'Standard';
    const envDef = ENVIRONMENTAL_MODIFIERS[envKey] || ENVIRONMENTAL_MODIFIERS.Standard;

    accountedItems.push({
      category: 'Structure',
      label: `Structural Blueprint (${footprintKey} • ${hDef.name})`,
      value: `DC ${craftDC}`,
      cost: craftDC,
      status: 'valid',
      note: `Frame: ${archFrameDef.name} • SP ${(data.sp ?? fpDef.baseSP).toLocaleString()} • DR ${data.dr ?? 15} • Env: ${envDef.name}`
    });
    baselineItems.push(`Tech Level: TL ${tlNum}`);
    if (data.security_level) baselineItems.push(`Security: ${data.security_level}`);
  } else {
    accountedItems.push({
      category: 'Valuation',
      label: `Base Fabrication / Design DC (${complexityTier})`,
      value: `DC ${craftDC}`,
      cost: craftDC,
      status: 'valid',
      note: `Tech Level: TL ${tlNum}${mlNum > 0 ? ` • Meta Level: ML ${mlNum}` : ''}`
    });
  }

  // Always include the Canonical TSC Valuation & Material rows in accountedItems
  accountedItems.push({
    category: 'Valuation',
    label: `Canonical TSC Value (DC ${craftDC})`,
    value: `${expectedCredits.toLocaleString()} Cr`,
    cost: expectedCredits,
    status: 'valid',
    note: `10 × 4^(DC/5) EUFT step table • Required Wealth Score: WS ${craftDC}`
  });

  accountedItems.push({
    category: 'Materials',
    label: 'Raw Material Cost (50%)',
    value: `${materialCost.toLocaleString()} Cr`,
    cost: materialCost,
    status: 'valid',
    note: 'Required fabrication & salvage materials baseline (50% TSC)'
  });

  if (capacityItem && !isOverCapacity) {
    accountedItems.push({
      category: 'Capacity',
      label: capacityItem.label,
      value: capacityItem.value,
      cost: 0,
      status: 'valid',
      note: capacityItem.note
    });
  }

  // 1. Check for Stored Credit Cost vs Canonical TSC Credit Cost Discrepancy
  if (hasExplicitCost && enteredCredits !== expectedCredits) {
    const creditDelta = enteredCredits - expectedCredits;
    const deltaSign = creditDelta >= 0 ? '+' : '';
    const continuousApprox = Math.round(10 * Math.pow(4, craftDC / 5));
    const isContinuousRounding = enteredCredits === continuousApprox;
    const noteText = isContinuousRounding
      ? `Stored price (${enteredCredits.toLocaleString()} Cr) uses continuous 10×4^(${craftDC}/5) rounding instead of canonical EUFT step table (${expectedCredits.toLocaleString()} Cr at DC ${craftDC})`
      : `Stored price is ${enteredCredits.toLocaleString()} Cr (${valuation?.ratio ?? 1}x TSC); canonical EUFT value at DC ${craftDC} is ${expectedCredits.toLocaleString()} Cr (${valuation?.status || 'Mismatch'})`;

    unaccountedItems.push({
      category: 'Cost Discrepancy',
      label: 'Credit Cost Discrepancy (Stored vs Canonical TSC)',
      value: `${enteredCredits.toLocaleString()} Cr ≠ ${expectedCredits.toLocaleString()} Cr (${deltaSign}${creditDelta.toLocaleString()} Cr)`,
      cost: creditDelta,
      status: 'warning',
      note: noteText
    });
  }

  // 2. Check for Forge Protocol Formula DC vs Stored Craft DC Discrepancy
  if (formulaDC !== null && Number.isFinite(formulaDC) && craftDC !== formulaDC) {
    const dcDelta = craftDC - formulaDC;
    const dcDeltaSign = dcDelta >= 0 ? '+' : '';
    const formulaCredits = calculateCreditValue(formulaDC);
    unaccountedItems.push({
      category: 'Formula Discrepancy',
      label: `Forge Formula DC Discrepancy (Stored DC ${craftDC} vs Formula DC ${formulaDC})`,
      value: `${dcDeltaSign}${dcDelta} DC (${expectedCredits.toLocaleString()} Cr vs ${formulaCredits.toLocaleString()} Cr)`,
      cost: dcDelta,
      status: 'warning',
      note: formulaSummaryNote || `Canonical Forge Formula computes DC ${formulaDC} (${formulaCredits.toLocaleString()} Cr), whereas item is stored at DC ${craftDC} (${expectedCredits.toLocaleString()} Cr)`
    });
  }

  // 3. Check for Over-Capacity Discrepancy
  if (isOverCapacity && capacityItem) {
    unaccountedItems.push({
      category: 'Capacity Discrepancy',
      label: capacityItem.label,
      value: capacityItem.value,
      cost: 0,
      status: 'error',
      note: capacityItem.note
    });
  }

  return {
    costItems: [...accountedItems, ...unaccountedItems],
    accountedItems,
    unaccountedItems,
    baselineItems,
    hasUnaccountedItems: unaccountedItems.length > 0,
    formulaDC,
    formulaCredits: formulaDC !== null ? calculateCreditValue(formulaDC) : expectedCredits
  };
}

/**
 * Evaluates an asset's build cost, budget allocation, and canonical rules compliance
 * for any Cortex catalog or Rules Codex matrix.
 *
 * @param {object} data - The asset record or studio formData
 * @param {string} categoryOrMatrixId - Cortex collection key or Codex matrix ID
 * @param {object} [computedValues={}] - Optional pre-computed values from useComputedState
 * @returns {object} Comprehensive build cost & value check report
 */
export function evaluateAssetBuildCost(data = {}, categoryOrMatrixId = 'equipment', computedValues = {}) {
  const key = String(categoryOrMatrixId || 'equipment').toLowerCase().trim();
  const isProp = isPropertyCategory(key) || [
    'weaponry', 'weapons', 'armoring', 'armor', 'gear', 'equipment',
    'augmentations', 'augmentation', 'mecha', 'vehicles', 'architecture',
    'other', 'other_property', 'meta-tech', 'economatrix'
  ].includes(key);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PROPERTY CATALOGS (TSC Credit Value, Craft DC, Material Cost, UDU/Slots)
  // ─────────────────────────────────────────────────────────────────────────
  if (isProp) {
    const rawDC =
      data.craft_dc ??
      data.design_dc ??
      computedValues?.craft_dc ??
      computedValues?.design_dc ??
      data.dc ??
      resolveItemCostDC(data);
    const craftDC = (rawDC !== undefined && rawDC !== null && rawDC !== '' && !Number.isNaN(Number(rawDC)))
      ? Number(rawDC)
      : 15;

    const expectedCredits = calculateCreditValue(craftDC);
    const materialCost = calculateMaterialCost(expectedCredits);
    const complexityTier = getComplexityTier(craftDC);

    const rawEnteredCost = data.costs?.credits ?? data.cost ?? data.credits ?? data.price;
    const hasExplicitCost = rawEnteredCost !== undefined && rawEnteredCost !== null && rawEnteredCost !== '';
    const enteredCredits = hasExplicitCost ? Number(rawEnteredCost) : expectedCredits;

    const valuation = validateAssetValuation(craftDC, enteredCredits);

    // Slot / Socket / Node / Hardpoint / Module capacity check
    let capacityItem = null;
    let isOverCapacity = false;

    if (key === 'weaponry' || key === 'weapons') {
      const sumSocketList = (list) => list.reduce((sum, mod) => {
        if (typeof mod === 'number') return sum + mod;
        if (mod && typeof mod === 'object') {
          return sum + Number(mod.sockets ?? mod.socket_cost ?? mod.slots ?? 1);
        }
        return sum + 1;
      }, 0);
      const modSockets = Array.isArray(data.modifications)
        ? sumSocketList(data.modifications)
        : Number(data.modifications_sockets ?? 0);
      const metaModsList = data.meta_tech_mods || data.meta_modifications || data.meta_tech;
      const metaSockets = Array.isArray(metaModsList)
        ? sumSocketList(metaModsList)
        : Number(data.meta_tech_sockets ?? data.meta_sockets ?? 0);
      const modsUsed = modSockets + metaSockets;
      const rawSocketsField = data.sockets && typeof data.sockets === 'object' ? data.sockets.max : data.sockets;
      const maxSockets = Number(rawSocketsField ?? data.component_slots ?? computedValues?.sockets ?? 4);
      isOverCapacity = modsUsed > maxSockets;
      capacityItem = {
        label: 'Tactical Socket Capacity',
        value: `${modsUsed} / ${maxSockets} Sockets`,
        target: `Max ${maxSockets}`,
        status: isOverCapacity ? 'error' : 'valid',
        note: isOverCapacity
          ? `Exceeds chassis socket limit (Tech: ${modSockets}, Meta-Tech: ${metaSockets})`
          : `Within socket budget (Tech: ${modSockets}${metaSockets ? `, Meta-Tech: ${metaSockets}` : ''})`
      };
    } else if (key === 'armoring' || key === 'armor') {
      const dr = Number(data.dr ?? data.damage_reduction ?? computedValues?.total_dr ?? 4);
      const def = Number(data.defense ?? data.defense_bonus ?? 1);
      capacityItem = {
        label: 'Protection Profile (DR / DEF)',
        value: `DR ${dr} • DEF +${def}`,
        target: `TL ${data.tl ?? data.tech_level ?? 3}`,
        status: 'valid',
        note: `Coverage: ${toCleanString(data.coverage, 'Torso')} • Stacking: Highest DR + +1 per stage of 5`
      };
    } else if (key === 'augmentations' || key === 'augmentation') {
      const rawTier = toCleanString(data.tier || data.stage || data.augmentation_stage || data.augmentation_tier, 'Basic');
      const isExtreme = /extreme|tier\s*3|stage\s*3/i.test(rawTier);
      const isHeavy = /heavy|advanced|tier\s*2|stage\s*2/i.test(rawTier);
      const canonicalTierLabel = isExtreme
        ? 'Extreme (9 CP / 18 CP Credit)'
        : isHeavy
          ? 'Heavy (6 CP / 12 CP Credit)'
          : 'Basic (3 CP / 6 CP Credit)';
      const expectedTierCP = isExtreme ? 9 : isHeavy ? 6 : 3;
      const modCredit = isExtreme ? 18 : isHeavy ? 12 : 6;
      const nodes = Number(data.nodes ?? data.node_cost ?? data.anatomical_nodes ?? 1);
      const cpCost = Number(data.costs?.cp ?? data.cp ?? data.bp ?? expectedTierCP);
      const isOrganic = /bioware|organic|genetic|biological/i.test(toCleanString(data.augmentation_type || data.type || data.category, ''));
      const resonancePenalty = isOrganic ? 0 : Math.floor(nodes / 20);
      isOverCapacity = nodes > 200;
      capacityItem = {
        label: 'Augmentation Tier & 200-Node Grid',
        value: `${canonicalTierLabel} • ${nodes}/200 Nodes (${cpCost} CP)`,
        target: toCleanString(data.body_location || data.location, '200 Anatomical Nodes'),
        status: isOverCapacity ? 'error' : 'valid',
        note: `Mod Credit: ${modCredit} CP • Cyber-Occultism Resonance Penalty: -${resonancePenalty} (-1 per 20 inorganic Nodes)`
      };
    } else if (key === 'mecha' || key === 'vehicles') {
      const mountsUsed = Array.isArray(data.hardpoint_assignments) ? data.hardpoint_assignments.length : (Array.isArray(data.modifications) ? data.modifications.length : 0);
      const maxMounts = Number(data.hardpoints ?? computedValues?.max_hardpoints ?? 6);
      isOverCapacity = mountsUsed > maxMounts;
      capacityItem = {
        label: 'Frame Hardpoint Allocation',
        value: `${mountsUsed} / ${maxMounts} Mounts`,
        target: toCleanString(data.size, 'Huge'),
        status: isOverCapacity ? 'error' : 'valid',
        note: isOverCapacity ? 'Exceeds frame hardpoints' : 'Hardpoints within hull limit'
      };
    } else if (key === 'architecture') {
      const modsUsed = Array.isArray(data.installed_modules) ? data.installed_modules.length : 0;
      const maxMods = Number(data.module_capacity ?? computedValues?.max_modules ?? 10);
      isOverCapacity = modsUsed > maxMods;
      capacityItem = {
        label: 'Facility Module Capacity',
        value: `${modsUsed} / ${maxMods} Modules`,
        target: toCleanString(data.size, 'Large'),
        status: isOverCapacity ? 'error' : 'valid',
        note: isOverCapacity ? 'Exceeds structural footprint' : 'Within facility footprint'
      };
    } else {
      const udu = Number(data.udu_volume ?? data.weight ?? computedValues?.udu_cost ?? 1);
      capacityItem = {
        label: 'Volumetric Displacement (UDU)',
        value: `${udu} UDU`,
        target: 'Encumbrance',
        status: 'valid',
        note: udu <= 0.2 ? 'Pocket Item' : udu <= 1 ? 'Standard Bulk' : 'Heavy / Mount Cargo'
      };
    }

    const itemized = extractPropertyBuildCostItems({
      data,
      key,
      craftDC,
      expectedCredits,
      materialCost,
      enteredCredits,
      hasExplicitCost,
      valuation,
      capacityItem,
      isOverCapacity,
      complexityTier
    });

    const isCostSynced = !hasExplicitCost || enteredCredits === expectedCredits;
    const isDCSynced = itemized.formulaDC === null || craftDC === itemized.formulaDC;
    const isBalanced = isCostSynced && isDCSynced && !isOverCapacity;
    const status = isOverCapacity
      ? 'error'
      : (!isBalanced ? 'warning' : 'valid');

    const creditDiff = enteredCredits - expectedCredits;
    const creditDiffSign = creditDiff >= 0 ? '+' : '';
    const dcDiff = itemized.formulaDC !== null ? craftDC - itemized.formulaDC : 0;
    const dcDiffSign = dcDiff >= 0 ? '+' : '';

    const statusLabel = isOverCapacity
      ? '⚠ OVER SLOT CAPACITY'
      : (!isCostSynced && !isDCSynced)
        ? `⚠ COST & DC DISCREPANCY (DC ${craftDC} vs ${itemized.formulaDC} • ${creditDiffSign}${creditDiff.toLocaleString()} Cr)`
        : !isCostSynced
          ? (valuation?.status && valuation.status !== 'Accurate Standard Curve'
            ? `⚠ ${String(valuation.status).toUpperCase()} (${valuation.ratio ?? 0}x TSC)`
            : `⚠ TSC COST DISCREPANCY (${creditDiffSign}${creditDiff.toLocaleString()} Cr vs EUFT)`)
          : !isDCSynced
            ? `⚠ FORMULA DC DISCREPANCY (DC ${craftDC} vs ${itemized.formulaDC} [${dcDiffSign}${dcDiff} DC])`
            : '✓ TSC COST VERIFIED';

    const breakdown = [
      {
        label: 'Crafting / Design DC',
        value: `DC ${craftDC}`,
        target: complexityTier,
        status: isDCSynced ? 'valid' : 'warning',
        note: isDCSynced
          ? `Required Wealth Score: WS ${craftDC}`
          : `Stored DC ${craftDC} vs Formula DC ${itemized.formulaDC} (${dcDiffSign}${dcDiff} DC)`
      },
      {
        label: 'Canonical TSC Value',
        value: `${expectedCredits.toLocaleString()} Cr`,
        target: '10 × 4^(DC/5)',
        status: 'valid',
        note: `Standard market value at DC ${craftDC}`
      },
      {
        label: 'Configured Credit Cost',
        value: `${enteredCredits.toLocaleString()} Cr`,
        target: `${expectedCredits.toLocaleString()} Cr`,
        status: isCostSynced ? 'valid' : 'warning',
        note: isCostSynced
          ? 'Matches canonical TSC credit curve'
          : `Expected ${expectedCredits.toLocaleString()} Cr at DC ${craftDC} (${creditDiffSign}${creditDiff.toLocaleString()} Cr)`
      },
      {
        label: 'Raw Material Cost (50%)',
        value: `${materialCost.toLocaleString()} Cr`,
        target: '50% TSC',
        status: 'valid',
        note: 'Required fabrication/salvage materials'
      }
    ];

    if (capacityItem) {
      breakdown.push(capacityItem);
    }

    const targetSyncDC = !isDCSynced && itemized.formulaDC !== null ? itemized.formulaDC : craftDC;
    const targetSyncCredits = calculateCreditValue(targetSyncDC);

    return {
      title: 'TSC Build Cost & Valuation',
      isProperty: true,
      hasItemizedBreakdown: true,
      unit: 'Cr',
      primaryCostLabel: `${enteredCredits.toLocaleString()} Cr`,
      primaryValue: `${enteredCredits.toLocaleString()} Cr`,
      secondaryLabel: !isDCSynced && itemized.formulaDC !== null
        ? `DC ${craftDC} (Formula: DC ${itemized.formulaDC}) • WS ${craftDC}`
        : `DC ${craftDC} • WS ${craftDC}`,
      expectedValue: expectedCredits,
      actualValue: enteredCredits,
      craftDC,
      formulaDC: itemized.formulaDC,
      formulaCredits: itemized.formulaCredits,
      materialCost,
      requiredWS: craftDC,
      complexityTier,
      status,
      statusLabel,
      summary: statusLabel,
      formulaSummary: 'Credit Value = 10 × 4^(Craft DC / 5) | Material = 50% | WS = DC',
      breakdown,
      costItems: itemized.costItems,
      accountedItems: itemized.accountedItems,
      unaccountedItems: itemized.unaccountedItems,
      baselineItems: itemized.baselineItems,
      hasUnaccountedItems: itemized.hasUnaccountedItems,
      syncPatch: !isBalanced ? {
        field: 'cost',
        value: targetSyncCredits,
        secondaryField: 'craft_dc',
        secondaryValue: targetSyncDC,
        extraPatch: {
          design_dc: targetSyncDC
        },
        label: !isDCSynced
          ? `Sync to Formula DC ${targetSyncDC} (${targetSyncCredits.toLocaleString()} Cr)`
          : `Sync to ${targetSyncCredits.toLocaleString()} Cr (DC ${targetSyncDC})`
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SPECIES CATALOG (Dynamic CP Cost — Non-Property, Zero Credit/Wealth)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'species' || key === 'char-species' || key === 'lineages' || key === 'species_lineage') {
    const bpData = calculateSpeciesBP(data);
    const computedCP = Number(bpData?.totalBPUsed ?? 0);
    const rawStoredCP = data.cp ?? data.costs?.cp ?? data.bp ?? data.costs?.bp;
    const hasExplicitCP = rawStoredCP !== undefined && rawStoredCP !== null && rawStoredCP !== '';
    const storedCP = hasExplicitCP ? Number(rawStoredCP) : computedCP;
    const isSynced = !hasExplicitCP || storedCP === computedCP;

    const itemization = extractSpeciesBuildCostItems(data, bpData);
    const {
      costItems,
      accountedItems,
      unaccountedItems,
      baselineItems,
      hasUnaccountedItems
    } = itemization;

    // Canonical Species Budget Tiers: 12–25 CP (Standard), 25–47 CP (Advanced/Greater), 50–120 CP (Apex/Exotic)
    const speciesTierLabel = computedCP >= 50
      ? 'Apex / Exotic Lineage (50–120 CP)'
      : computedCP >= 25
        ? 'Greater / Advanced Lineage (25–47 CP)'
        : 'Standard Lineage (12–25 CP)';
    const isWithinCanonicalBands = (computedCP >= 12 && computedCP <= 47) || (computedCP >= 50 && computedCP <= 120);

    const status = isSynced && !hasUnaccountedItems ? 'valid' : 'warning';
    const primaryCostLabel = `${computedCP} CP`;
    const statusLabel = !isSynced
      ? `⚠ STORED ${storedCP} CP ≠ ${computedCP} CP`
      : hasUnaccountedItems
        ? `⚠ ${computedCP} CP (${unaccountedItems.length} UNACCOUNTED)`
        : `✓ ${computedCP} CP VERIFIED (${speciesTierLabel.split(' (')[0].toUpperCase()})`;

    const bd = bpData?.breakdown || {};
    const it = bpData?.itemized || {};
    const rawTypeDisplay = it.type?.name || (Array.isArray(data.type) ? data.type[0] : (data.species_type || data.type || data.base_chassis || 'Humanoid'));
    const cleanTypeDisplay = toCleanString(rawTypeDisplay, 'Humanoid').replace(/^species_type-/, '').replace(/\b\w/g, c => c.toUpperCase());
    const rawSizeDisplay = it.size?.name || (Array.isArray(data.size) ? data.size[0] : (data.size || 'Medium'));
    const cleanSizeDisplay = toCleanString(rawSizeDisplay, 'Medium').replace(/^species_size-/, '').replace(/\b\w/g, c => c.toUpperCase());

    const typeCPVal = Number(bd.typeBP ?? it.type?.bp ?? 0);
    const sizeCPVal = Number(bd.sizeBP ?? it.size?.bp ?? 0);
    const moveCPVal = Number(bd.movementBP ?? 0);
    const fixedAttrCPVal = Number(bd.fixedAttributeBP ?? 0);
    const poolAttrCPVal = Number(bd.attributePoolBP ?? 0);
    const totalAttrCPVal = Number(bd.attributeBP ?? (fixedAttrCPVal + poolAttrCPVal));
    const skillsCPVal = Number(bd.skillsBP ?? it.skills?.bp ?? 0);
    const grantedFeatCPVal = Number(bd.grantedFeaturesBP ?? 0);
    const poolFeatCPVal = Number(bd.featurePoolBP ?? 0);
    const totalFeatCPVal = Number(bd.featuresBP ?? (grantedFeatCPVal + poolFeatCPVal));
    const traitsCPVal = Number(bd.traitsBP ?? 0);
    const disadRefundVal = Number(bd.disadvantagesRefund ?? 0);
    const stigmaRefundVal = Number(bd.stigmaRefund ?? it.stigma?.refundBP ?? 0);
    const totalRebateVal = disadRefundVal + stigmaRefundVal;

    const attrSummaryNote = Array.isArray(it.attributes) && it.attributes.length > 0
      ? it.attributes.map(a => `${a.attr} ${a.value > 0 ? `+${a.value}` : a.value} (${formatSignedCP(a.bp)})`).join(', ')
      : `Inherent: ${fixedAttrCPVal} CP | Pool: ${poolAttrCPVal} CP`;

    const featSummaryNote = Array.isArray(it.features) && it.features.length > 0
      ? it.features.map(f => `${f.name} (${formatSignedCP(f.bp)})`).join(', ')
      : '0 inherent or pool features';

    const traitSummaryNote = Array.isArray(it.traits) && it.traits.length > 0
      ? it.traits.map(t => `${t.name} (${formatSignedCP(t.bp)})`).join(', ')
      : '0 traits configured';

    const flawSummaryNote = [
      ...(Array.isArray(it.disadvantages) ? it.disadvantages.map(d => `${d.name} (-${d.refundBP} CP)`) : []),
      ...(stigmaRefundVal > 0 ? [`Stigma: ${it.stigma?.text || data.stigma || 'Active'} (-${stigmaRefundVal} CP)`] : [])
    ].join(', ') || 'None (0 CP)';

    const breakdown = [
      {
        label: 'Canonical Lineage Budget Tier',
        value: `${computedCP} CP`,
        target: '12–25 | 25–47 | 50–120 CP',
        status: isWithinCanonicalBands ? 'valid' : 'warning',
        note: speciesTierLabel
      },
      {
        label: `Chassis Type (${cleanTypeDisplay})`,
        value: formatSignedCP(typeCPVal),
        target: 'Chassis',
        status: 'valid',
        note: 'Base biological/synthetic taxonomy'
      },
      {
        label: `Physical Size (${cleanSizeDisplay})`,
        value: formatSignedCP(sizeCPVal),
        target: 'Scale',
        status: 'valid',
        note: 'Volumetric scale modifier'
      },
      {
        label: 'Locomotion & Movement',
        value: formatSignedCP(moveCPVal),
        target: 'Paces',
        status: 'valid',
        note: bpData?.speedsFormatted || 'Ground 30 ft'
      },
      {
        label: 'Inherent & Pool Attributes',
        value: formatSignedCP(totalAttrCPVal),
        target: '+5 CP / +1',
        status: 'valid',
        note: attrSummaryNote
      },
      {
        label: 'Skill Bundles & Bonuses',
        value: formatSignedCP(skillsCPVal),
        target: '+5 CP / 5 SP',
        status: 'valid',
        note: `${it.skills?.points ?? 0} SP (${it.skills?.bundles ?? 0} bundles)`
      },
      {
        label: 'Inherent & Bonus Features',
        value: formatSignedCP(totalFeatCPVal),
        target: '3 CP / Feat',
        status: 'valid',
        note: featSummaryNote
      },
      {
        label: 'Species Biological Traits',
        value: formatSignedCP(traitsCPVal),
        target: '1 / 2 / 4 CP',
        status: 'valid',
        note: traitSummaryNote
      },
      {
        label: 'Flaws & Social Stigma Rebates',
        value: totalRebateVal > 0 ? `-${totalRebateVal} CP` : '0 CP',
        target: 'Rebate',
        status: 'valid',
        note: flawSummaryNote
      },
      ...unaccountedItems.map(u => ({
        label: `⚠ Unaccounted (${u.category}): ${u.label}`,
        value: u.formattedCost,
        target: 'Unaccounted by Formula',
        status: 'warning',
        unaccounted: true,
        note: u.note
      }))
    ];

    const warnings = unaccountedItems.map(u => `Unaccounted by formula: ${u.label} (${u.formattedCost}) — ${u.note}`);

    const canonicalSeed = Array.isArray(DEFAULT_SPECIES)
      ? DEFAULT_SPECIES.find(
          s =>
            (data.id && String(s.id).toLowerCase() === String(data.id).toLowerCase()) ||
            (data.name && String(s.name).toLowerCase() === String(data.name).toLowerCase())
        )
      : null;
    const targetCP = canonicalSeed?.cp ?? computedCP;
    const extraPatch = (!isSynced || hasUnaccountedItems)
      ? (canonicalSeed
          ? {
              type: canonicalSeed.type,
              species_type: canonicalSeed.species_type || canonicalSeed.type,
              size: canonicalSeed.size,
              species_size: canonicalSeed.species_size || canonicalSeed.size,
              movement: canonicalSeed.movement,
              movement_modes: canonicalSeed.movement_modes || canonicalSeed.movement,
              traits: canonicalSeed.traits,
              trait: canonicalSeed.traits,
              species_traits: canonicalSeed.species_traits || canonicalSeed.traits,
              inherent_traits: [],
              recommended_traits: canonicalSeed.recommended_traits || [],
              disadvantages: canonicalSeed.disadvantages || [],
              hindrances: canonicalSeed.hindrances || [],
              inherent_disadvantages: [],
              flaws: [],
              modifiers: canonicalSeed.modifiers || [],
              inherent_attribute_modifiers: canonicalSeed.inherent_attribute_modifiers || [],
              attribute_modifiers: canonicalSeed.inherent_attribute_modifiers || [],
              attributes: null,
              bonus_str: 0,
              bonus_agi: 0,
              bonus_sta: 0,
              bonus_int: 0,
              bonus_wis: 0,
              bonus_cha: 0,
              bonus_attribute_points: canonicalSeed.bonus_attribute_points ?? 0,
              bonus_attribute_points_physical: 0,
              bonus_attribute_points_mental: 0,
              bonus_attribute_points_primary: 0,
              bonus_attribute_points_sub: 0,
              specific_skill_bonuses: canonicalSeed.specific_skill_bonuses || [],
              bonus_skills: canonicalSeed.bonus_skills ?? 0,
              bonus_skill_points: canonicalSeed.bonus_skills ?? 0,
              skillPoints: canonicalSeed.bonus_skills ?? 0,
              skill_points: canonicalSeed.bonus_skills ?? 0,
              skillBundles: 0,
              skill_bundles: 0,
              bonus_skill_choices: canonicalSeed.bonus_skill_choices || [],
              inherent_features: canonicalSeed.inherent_features || [],
              bonus_features: canonicalSeed.bonus_features ?? 0,
              bonus_feature_points: canonicalSeed.bonus_features ?? 0,
              feature_pool: canonicalSeed.bonus_features ?? 0,
              bonus_feature_choices: canonicalSeed.bonus_feature_choices || [],
              bonus_traits: 0,
              recommended_features: canonicalSeed.recommended_features || [],
              stigma: canonicalSeed.stigma || 'None',
              social_stigma: canonicalSeed.social_stigma || canonicalSeed.stigma || 'None'
            }
          : {
              species_traits: Array.isArray(data.traits) && data.traits.length > 0 ? data.traits : (data.species_traits || []),
              specific_skill_bonuses: []
            })
      : undefined;

    return {
      title: key === 'species_lineage' || key === 'lineages' ? 'Lineage CP Cost Breakdown' : 'Species CP Cost Breakdown',
      isProperty: false,
      isSpecies: true,
      unit: 'CP',
      primaryCostLabel,
      primaryValue: primaryCostLabel,
      secondaryLabel: `${cleanTypeDisplay} • ${cleanSizeDisplay} • ${bpData?.speedsFormatted || 'Ground 30 ft'}`,
      expectedValue: computedCP,
      actualValue: storedCP,
      status,
      statusLabel,
      summary: statusLabel,
      formulaSummary: 'Species CP = Chassis + Size + Movement + Attributes (+5 CP/pt) + Skills (+5 CP/5 SP) + Features (3 CP) + Traits (1/2/4 CP) − Flaws',
      costItems,
      accountedItems,
      unaccountedItems,
      baselineItems,
      hasUnaccountedItems,
      warnings,
      breakdown,
      syncPatch: (!isSynced || hasUnaccountedItems) ? {
        field: 'cp',
        value: targetCP,
        secondaryField: 'bp',
        secondaryValue: targetCP,
        ...(extraPatch ? { extraPatch } : {}),
        label: !isSynced
          ? `Sync Stored CP (${storedCP} → ${targetCP} CP)`
          : `Reconcile & Sync Species (${targetCP} CP)`
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ARCHETYPES CATALOG (80 CP Thematic Chassis — BASTION 1.02)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'archetypes' || key === 'archetype') {
    const priAttr = toCleanString(data.primary_attribute, 'Intellect');
    const secAttr = toCleanString(data.secondary_attribute, 'Wisdom');
    const hasDistinctAttrs = Boolean(priAttr && secAttr && priAttr !== secAttr);

    const skills = parseList(data.essential_skills);
    const traits = parseList(data.signature_traits || data.traits);
    const recFeats = parseList(data.recommended_features || data.signature_features);
    const recOccs = parseList(data.recommended_occupations);
    const recOrigins = parseList(data.recommended_origins);

    const skillsValid = skills.length >= 3;
    const traitsValid = traits.length >= 2 || recFeats.length >= 3;
    const chassisCP = Number(data.cp_chassis || data.bp_chassis || 80);
    const isComplete = hasDistinctAttrs && skillsValid && traitsValid;

    return {
      title: 'Archetype 80 CP Chassis',
      isProperty: false,
      unit: 'CP',
      primaryCostLabel: `${chassisCP} CP Chassis`,
      primaryValue: `${chassisCP} CP Chassis`,
      secondaryLabel: `${priAttr} +3 / ${secAttr} +2 • ${skills.length} Skills`,
      expectedValue: 80,
      actualValue: chassisCP,
      status: isComplete && chassisCP === 80 ? 'valid' : 'warning',
      statusLabel: isComplete && chassisCP === 80 ? '✓ 80 CP CHASSIS VERIFIED' : '⚠ CHASSIS INCOMPLETE',
      summary: isComplete && chassisCP === 80 ? '✓ 80 CP CHASSIS VERIFIED' : '⚠ CHASSIS INCOMPLETE',
      formulaSummary: '15 CP Primary + 10 CP Secondary + 24 CP Essential Skills + 18 CP Supporting Skills + 13 CP Signature Traits & Core Features = 80 CP',
      breakdown: [
        {
          label: 'Primary Attribute (+3)',
          value: `${priAttr} (15 CP)`,
          target: '15 CP',
          status: priAttr ? 'valid' : 'warning',
          note: '3 Ranks × 5 CP = 15 CP'
        },
        {
          label: 'Secondary Attribute (+2)',
          value: `${secAttr} (10 CP)`,
          target: '10 CP',
          status: hasDistinctAttrs ? 'valid' : 'warning',
          note: hasDistinctAttrs ? '2 Ranks × 5 CP = 10 CP' : 'Should be distinct from Primary'
        },
        {
          label: 'Essential & Supporting Skills (42 CP)',
          value: `${skills.length} Skills (42 CP)`,
          target: '24 CP Essential + 18 CP Supporting',
          status: skillsValid ? 'valid' : 'warning',
          note: '4 Essential Trained @ Rank 6 (24 CP) + 6 Supporting Novice @ Rank 3 (18 CP) = 42 CP'
        },
        {
          label: 'Signature Traits & Recommended Core Features (13 CP)',
          value: `${traits.length} Traits • ${recFeats.length} Features (13 CP)`,
          target: '2 CP Traits + 9 CP Features + 2 CP Rounding',
          status: traitsValid ? 'valid' : 'warning',
          note: '2 Signature Traits (2 CP) + 3 Core Features (9 CP) + 2 CP Chassis Rounding = 13 CP'
        },
        {
          label: 'Pillar Synergies',
          value: `${recOccs.length} Careers • ${recOrigins.length} Origins`,
          target: 'Synergy Links',
          status: 'valid',
          note: `Sphere: ${toCleanString(data.sphere, 'Unassigned')}`
        }
      ],
      syncPatch: chassisCP !== 80 ? {
        field: 'cp_chassis',
        value: 80,
        label: 'Sync Chassis to 80 CP'
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ORIGINS & OCCUPATIONS (20 SP Skill Pool + 2 Free Pillar Traits)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'origins' || key === 'origin' || key === 'occupations' || key === 'occupation') {
    const isOrigin = key.startsWith('origin');
    const spPool = Number(data.skill_points ?? 20);
    const skills = parseList(isOrigin ? data.society_skills : data.professional_skills);
    const traits = parseList(data.traits);
    const recFeats = parseList(data.recommended_features || data.features);

    const isPoolValid = spPool === 20;
    const hasEnoughSkills = skills.length >= 1;
    const hasEnoughTraits = traits.length >= 2;
    const allValid = isPoolValid && hasEnoughSkills && hasEnoughTraits;

    return {
      title: `${isOrigin ? 'Origin' : 'Occupation'} 20 SP Pillar`,
      isProperty: false,
      unit: 'SP',
      primaryCostLabel: `${spPool} SP Pool`,
      primaryValue: `${spPool} SP Pool`,
      secondaryLabel: `${skills.length} Skills • ${traits.length} Traits`,
      expectedValue: 20,
      actualValue: spPool,
      status: allValid ? 'valid' : 'warning',
      statusLabel: allValid ? '✓ 20 SP PILLAR VERIFIED' : '⚠ CHECK POOL / TRAITS',
      summary: allValid ? '✓ 20 SP PILLAR VERIFIED' : '⚠ CHECK POOL / TRAITS',
      formulaSummary: `${isOrigin ? 'Society' : 'Professional'} Skills = 20 SP Pool | 2 Free Traits (+1 CP extra) | Recommended Features = -1 CP Discount`,
      breakdown: [
        {
          label: `${isOrigin ? 'Society' : 'Professional'} Skill Pool`,
          value: `${spPool} SP`,
          target: '20 SP',
          status: isPoolValid ? 'valid' : 'warning',
          note: 'Canonical 20 SP allocation in Persona Folio'
        },
        {
          label: `Eligible ${isOrigin ? 'Society' : 'Career'} Skills`,
          value: `${skills.length} Skills`,
          target: '6–12 Skills',
          status: hasEnoughSkills ? 'valid' : 'warning',
          note: skills.slice(0, 4).join(', ') || 'No skills listed'
        },
        {
          label: `Selectable ${isOrigin ? 'Homeworld' : 'Occupational'} Traits`,
          value: `${traits.length} Traits`,
          target: 'Min 2 Free',
          status: hasEnoughTraits ? 'valid' : 'warning',
          note: 'First 2 selected are 0 CP; extras cost 1 CP'
        },
        {
          label: 'Recommended Features (-1 CP)',
          value: `${recFeats.length} Features`,
          target: '-1 CP Discount',
          status: 'valid',
          note: 'Reduces feature cost from 3 CP to 2 CP'
        }
      ],
      syncPatch: !isPoolValid ? {
        field: 'skill_points',
        value: 20,
        label: 'Sync Skill Pool to 20 SP'
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FEATURES CATALOG (3 CP Standard Talent Cost — BASTION 1.04)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'features' || key === 'feature') {
    const cpCost = Number(data.cp ?? data.costs?.cp ?? 3);
    const discountedCP = Math.max(1, cpCost - 1);
    const acqType = toCleanString(data.type, 'Basic');
    const modsCount = Array.isArray(data.modifiers) ? data.modifiers.length : 0;
    const hasBenefit = Boolean(toCleanString(data.benefit || data.description || data.mechanic, ''));
    const isStandardCP = cpCost >= 1 && cpCost <= 10;

    const featStatusLabel = cpCost === 3 && hasBenefit
      ? '✓ 3 CP STANDARD VERIFIED'
      : isStandardCP && hasBenefit
        ? `✓ ${cpCost} CP TIER VERIFIED`
        : '⚠ CHECK CP / BENEFIT';

    return {
      title: 'Feature CP Cost Check',
      isProperty: false,
      unit: 'CP',
      primaryCostLabel: `${cpCost} CP`,
      primaryValue: `${cpCost} CP`,
      secondaryLabel: `${acqType} • ${discountedCP} CP Pillar Discount`,
      expectedValue: 3,
      actualValue: cpCost,
      status: isStandardCP && hasBenefit ? 'valid' : 'warning',
      statusLabel: featStatusLabel,
      summary: featStatusLabel,
      formulaSummary: 'Standard Feature = 3 CP (2 CP Pillar Recommended Discount) | Acquisition: Basic, Multiple, Staged, Multi/Staged',
      breakdown: [
        {
          label: 'Feature CP Cost',
          value: `${cpCost} CP (${discountedCP} CP Discounted)`,
          target: '3 CP Standard (2 CP Pillar Discount)',
          status: isStandardCP ? 'valid' : 'warning',
          note: '3 CP Standard; discounted by -1 CP (to 2 CP) when recommended by Character Pillar'
        },
        {
          label: 'Acquisition Progression',
          value: acqType,
          target: 'Model',
          status: 'valid',
          note: 'Basic (Once), Multiple, Staged, or Multi/Staged'
        },
        {
          label: 'Structured Modifiers',
          value: `${modsCount} Active`,
          target: 'Folio Engine',
          status: 'valid',
          note: hasBenefit ? 'Benefit rules text defined' : 'Missing benefit rules text'
        }
      ],
      syncPatch: !isStandardCP ? {
        field: 'cp',
        value: 3,
        label: 'Set Canonical 3 CP Cost'
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. TRAITS CATALOG — Separate Species Traits ('trait') from Pillar Traits ('traits')
  // ─────────────────────────────────────────────────────────────────────────
  switch (key) {
    case 'trait':
    case 'species_traits': {
      const canonicalTrait = Array.isArray(DEFAULT_SPECIES_TRAITS)
        ? DEFAULT_SPECIES_TRAITS.find(
            t =>
              (data.id && String(t.id).toLowerCase() === String(data.id).toLowerCase()) ||
              (data.name && String(t.name).toLowerCase() === String(data.name).toLowerCase())
          )
        : null;
      const rawTier = toCleanString(data.trait_tier || data.tier || data.type || data.category, 'Basic (1 CP)');
      const tierCP = /elite|4\s*cp/i.test(rawTier) ? 4 : /advanced|2\s*cp/i.test(rawTier) ? 2 : 1;
      const expectedCP = (canonicalTrait && Number.isFinite(Number(canonicalTrait.cp)))
        ? Number(canonicalTrait.cp)
        : tierCP;
      const actualCP = Number(data.cp ?? data.cost_cp ?? data.bp ?? expectedCP);
      const isMatched = actualCP === expectedCP;

      const traitStatusLabel = isMatched ? `✓ ${actualCP} CP (${rawTier.toUpperCase()})` : `⚠ TIER MISMATCH (EXP ${expectedCP} CP)`;
      return {
        title: 'Species Trait Tier CP Check',
        isProperty: false,
        unit: 'CP',
        primaryCostLabel: `${actualCP} CP`,
        primaryValue: `${actualCP} CP`,
        secondaryLabel: `${rawTier}`,
        expectedValue: expectedCP,
        actualValue: actualCP,
        status: isMatched ? 'valid' : 'warning',
        statusLabel: traitStatusLabel,
        summary: traitStatusLabel,
        formulaSummary: 'Species Traits: Basic = 1 CP | Advanced = 2 CP | Elite = 4 CP',
        breakdown: [
          {
            label: 'Species Trait Tier (data.trait_tier)',
            value: rawTier,
            target: `${expectedCP} CP`,
            status: 'valid',
            note: 'Basic (1 CP), Advanced (2 CP), or Elite (4 CP)'
          },
          {
            label: 'Configured CP Cost',
            value: `${actualCP} CP`,
            target: `${expectedCP} CP`,
            status: isMatched ? 'valid' : 'warning',
            note: isMatched ? 'Matches canonical Species Trait tier cost' : `Expected ${expectedCP} CP for ${rawTier}`
          }
        ],
        syncPatch: !isMatched ? {
          field: 'cp',
          value: expectedCP,
          label: `Sync to ${expectedCP} CP (${rawTier})`
        } : null
      };
    }

    case 'traits':
    case 'pillar_traits': {
      const rawTier = toCleanString(data.trait_tier || data.tier || data.type || data.category, 'Pillar (1 CP)');
      const expectedCP = 1;
      const actualCP = Number(data.cp ?? data.cost_cp ?? data.bp ?? 1);
      const isMatched = actualCP === expectedCP;

      const pillarStatusLabel = isMatched ? `✓ 1 CP PILLAR TRAIT VERIFIED` : `⚠ PILLAR TRAIT EXP 1 CP (GOT ${actualCP} CP)`;
      return {
        title: 'Pillar Trait CP Check',
        isProperty: false,
        unit: 'CP',
        primaryCostLabel: `${actualCP} CP`,
        primaryValue: `${actualCP} CP`,
        secondaryLabel: rawTier,
        expectedValue: 1,
        actualValue: actualCP,
        status: isMatched ? 'valid' : 'warning',
        statusLabel: pillarStatusLabel,
        summary: pillarStatusLabel,
        formulaSummary: 'Pillar Traits (Origin, Occupational, Faction, Archetype Signature) = Flat 1 CP',
        breakdown: [
          {
            label: 'Pillar Trait Classification',
            value: rawTier,
            target: '1 CP Flat',
            status: 'valid',
            note: 'Origin, Occupational, Faction, or Archetype Signature Trait'
          },
          {
            label: 'Configured CP Cost',
            value: `${actualCP} CP`,
            target: '1 CP',
            status: isMatched ? 'valid' : 'warning',
            note: isMatched ? 'Matches canonical 1 CP Pillar Trait cost' : 'Pillar Traits always cost 1 CP'
          }
        ],
        syncPatch: !isMatched ? {
          field: 'cp',
          value: 1,
          label: 'Sync Pillar Trait to 1 CP'
        } : null
      };
    }
    default:
      break;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. DISADVANTAGES CATALOG (Species Disadvantage vs. Multi-Tier Personal Hindrances 1–10 CP Cap)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'disadvantages' || key === 'disadvantage' || key === 'species_disadvantages') {
    const disadvType = toCleanString(
      data.disadvantage_type || (key === 'species_disadvantages' ? 'Species Disadvantage' : data.type || data.category),
      'Personal Hindrance'
    );
    const isSpeciesDisadv = /species\s*disadvantage|species\s*flaw|biological\s*flaw/i.test(disadvType) || key === 'species_disadvantages';
    const severityClass = toCleanString(data.classification || data.severity, isSpeciesDisadv ? 'Species Disadvantage' : 'Minor');
    const rawRebate = Number(data.cp_granted ?? data.cp ?? data.refundCP ?? (isSpeciesDisadv ? 2 : 2));
    const absRebate = Math.abs(rawRebate) || 2;
    const withinCap = isSpeciesDisadv ? (absRebate >= 1 && absRebate <= 6) : (absRebate >= 1 && absRebate <= 10);

    return {
      title: isSpeciesDisadv ? 'Species Disadvantage Rebate' : 'Personal Hindrance CP Rebate',
      isProperty: false,
      unit: 'CP',
      primaryCostLabel: `-${absRebate} CP Rebate`,
      primaryValue: `-${absRebate} CP Rebate`,
      secondaryLabel: `${disadvType} • ${severityClass}`,
      expectedValue: -absRebate,
      actualValue: rawRebate,
      status: withinCap ? 'valid' : 'warning',
      statusLabel: withinCap ? `✓ -${absRebate} CP REBATE VERIFIED` : `⚠ EXCEEDS 1–10 CP HINDRANCE CAP`,
      summary: withinCap ? `✓ -${absRebate} CP REBATE VERIFIED` : `⚠ EXCEEDS 1–10 CP HINDRANCE CAP`,
      formulaSummary: 'Species Disadvantage = -2 CP Rebate | Personal Hindrance = Multi-Tier (Minor / Major / Severe, 1–10 CP Max Cap) | Quirk = 1 CP',
      breakdown: [
        {
          label: 'Disadvantage Type (data.disadvantage_type)',
          value: disadvType,
          target: isSpeciesDisadv ? 'Species Disadvantage' : 'Personal Hindrance (1–10 CP Cap)',
          status: 'valid',
          note: `Severity Classification: ${severityClass}`
        },
        {
          label: 'CP Rebate / Refund Value',
          value: `-${absRebate} CP`,
          target: isSpeciesDisadv ? '-2 CP Standard' : '1–10 CP Cap',
          status: withinCap ? 'valid' : 'warning',
          note: isSpeciesDisadv
            ? 'Reduces Species Package CP cost'
            : 'Personal Hindrances grant 1–10 CP total rebate across Minor, Major, and Severe tiers'
        }
      ],
      syncPatch: null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. INVOCATIONS & SPECIAL ABILITIES (5-Step Invocation Matrix & Essence = ceil(CR / 5))
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'invocations' || key === 'invocation' || key === 'disciplines' || key === 'special_abilities') {
    const isDisc = key === 'disciplines' || /discipline/i.test(toCleanString(data.category, ''));
    const ml = Number(data.ml ?? data.meta_level ?? 1);
    const calcResult = calculateInvocationDC(data);
    const resolvedCalcDC = typeof calcResult === 'number' ? calcResult : calcResult?.totalDC;
    const expectedDC = Number(computedValues?.manifestation_dc ?? resolvedCalcDC ?? (10 + ml * 5));
    const expectedFocus = Number(computedValues?.focus_cost ?? calculateInvocationFocus(expectedDC));
    const actualFocus = Number(data.focus_cost ?? data.essence_cost ?? expectedFocus);
    const cpUnlock = isDisc ? 3 : Number(data.cp ?? 1);
    const discName = toCleanString(data.discipline || data.school, 'Mental');
    const focusName = toCleanString(data.focus, 'Telepathy');

    const invCostLabel = isDisc ? `${cpUnlock} CP School` : `CR ${expectedDC} • ${actualFocus} Essence`;
    const invStatusLabel = isDisc ? '✓ 3 CP DISCIPLINE VERIFIED' : `✓ CR ${expectedDC} (${actualFocus} ESSENCE) VALID`;
    return {
      title: isDisc ? 'Discipline Unlock Cost' : '5-Step Invocation Matrix Check',
      isProperty: false,
      unit: 'CP',
      primaryCostLabel: invCostLabel,
      primaryValue: invCostLabel,
      secondaryLabel: `${discName} (${focusName}) • ML ${ml}`,
      expectedValue: cpUnlock,
      actualValue: cpUnlock,
      status: 'valid',
      statusLabel: invStatusLabel,
      summary: invStatusLabel,
      formulaSummary: '5-Step Invocation Matrix CR = Base (10) + Effect + Target + Area + Range + Duration | Essence = ceil(CR / 5)',
      breakdown: [
        {
          label: 'Canonical Discipline & Focus',
          value: `${discName} • ${focusName} (${cpUnlock} CP)`,
          target: isDisc ? '3 CP School' : '1 CP Invocation',
          status: 'valid',
          note: '6 Canonical Disciplines (Dimension, Energy, Entropy, Illusion, Matter, Mental) & 12 Foci'
        },
        {
          label: '5-Step Invocation Matrix CR',
          value: `CR ${expectedDC}`,
          target: '2d10 + Meta Skill + Wisdom',
          status: 'valid',
          note: `Range: ${toCleanString(data.range, 'Short')} | Area: ${toCleanString(data.area, 'Single')} | Target: ${toCleanString(data.target, 'Individual')}`
        },
        {
          label: 'Essence / Focus Expenditure (ceil(CR / 5))',
          value: `${actualFocus} Essence`,
          target: `${expectedFocus} Essence (ceil(${expectedDC}/5))`,
          status: actualFocus === expectedFocus ? 'valid' : 'warning',
          note: `Duration: ${toCleanString(data.duration, 'Instantaneous')}`
        }
      ],
      syncPatch: (!isDisc && data.focus_cost !== undefined && actualFocus !== expectedFocus) ? {
        field: 'focus_cost',
        value: expectedFocus,
        label: `Sync Essence/Focus to ${expectedFocus} (ceil(CR / 5))`
      } : null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. SKILLS CATALOG (1 SP/Rank, Governing Attribute & 6 Mastery Stages Rank 1–30)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'skills' || key === 'skill') {
    const attr = toCleanString(
      data.governing_attribute || data.baseAttr || data.attribute,
      'Intellect'
    ).replace(/^attr-/, '').toUpperCase();
    const group = toCleanString(data.group || data.category || data.subtype, 'General');
    const specs = parseList(data.specialties || data.specializations);

    return {
      title: 'Skill SP & 6 Mastery Stages Check',
      isProperty: false,
      unit: 'SP',
      primaryCostLabel: '1 SP / Rank (1–30)',
      primaryValue: '1 SP / Rank (1–30)',
      secondaryLabel: `${attr} • ${group}`,
      expectedValue: 1,
      actualValue: 1,
      status: 'valid',
      statusLabel: '✓ 6 MASTERY STAGES (RANK 1–30) VERIFIED',
      summary: '✓ 6 MASTERY STAGES (RANK 1–30) VERIFIED',
      formulaSummary: '2d10 + Governing Attribute + Skill Rank vs. CR | 6 Mastery Stages (Rank 1–30, Pinnacle 26–30 Advantage) | Specialty = +2 Bonus',
      breakdown: [
        {
          label: 'Governing Attribute',
          value: attr,
          target: '2d10 + Attr + Rank',
          status: 'valid',
          note: `Skill Group: ${group}`
        },
        {
          label: '6 Mastery Stages (Rank 1–30)',
          value: 'Novice (1–5) → Pinnacle (26–30)',
          target: 'Pinnacle 26–30 Advantage',
          status: 'valid',
          note: 'Novice 1–5, Trained 6–10, Expert 11–15, Master 16–20, Grandmaster 21–25, Pinnacle 26–30 (Advantage)'
        },
        {
          label: 'Defined Specializations (+2)',
          value: `${specs.length} Specialties`,
          target: 'Focus Options',
          status: 'valid',
          note: specs.slice(0, 4).join(', ') || 'Standard skill checks'
        }
      ],
      syncPatch: null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. FACTIONS CATALOG (20 SP Skill Package, 2 Faction Traits, 10 Recommended Features, -4 to +8 WS)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'factions' || key === 'faction' || key === 'societies') {
    const tl = data.tl ?? data.tech_level ?? 3;
    const ml = data.ml ?? data.meta_level ?? 1;
    const rawWealthStr = String(data.wealth_modifier ?? 0);
    const wmMatch = rawWealthStr.match(/[+-]?\d+/);
    const wealthMod = wmMatch ? Number(wmMatch[0]) : 0;
    const isWealthValid = wealthMod >= -4 && wealthMod <= 8;
    const factionTraits = parseList(data.traits || data.faction_traits);
    const recFeats = parseList(data.recommended_features);
    const skillPkgText = toCleanString(data.skill_package || data.skills, '');
    const hasSkillPkg = Boolean(skillPkgText);

    return {
      title: 'Faction Package Check',
      isProperty: false,
      unit: 'SP',
      primaryCostLabel: '20 SP Package',
      primaryValue: '20 SP Package',
      secondaryLabel: `TL ${tl} • ML ${ml} • WS ${wealthMod >= 0 ? `+${wealthMod}` : wealthMod}`,
      expectedValue: 20,
      actualValue: 20,
      status: isWealthValid ? 'valid' : 'warning',
      statusLabel: hasSkillPkg && isWealthValid ? '✓ FACTION PACKAGE VERIFIED' : '✓ TL/ML PROFILE READY',
      summary: hasSkillPkg && isWealthValid ? '✓ FACTION PACKAGE VERIFIED' : '✓ TL/ML PROFILE READY',
      formulaSummary: 'Faction Package = 20 SP Skill Package + 2 Faction Traits + 10 Recommended Features (-1 CP) + Wealth Modifier (-4 to +8 WS)',
      breakdown: [
        {
          label: 'Civilization Tech, Meta & Wealth Modifier',
          value: `TL ${tl} / ML ${ml} • WS ${wealthMod >= 0 ? `+${wealthMod}` : wealthMod}`,
          target: '-4 to +8 WS',
          status: isWealthValid ? 'valid' : 'warning',
          note: 'Wealth Modifier range: -4 to +8 WS'
        },
        {
          label: 'Operator Skill Package (20 SP)',
          value: hasSkillPkg ? 'Configured (20 SP)' : 'Default 20 SP',
          target: '20 SP Pool',
          status: 'valid',
          note: skillPkgText || '20 SP distributed across faction skills'
        },
        {
          label: 'Faction Traits (2 Traits)',
          value: `${factionTraits.length} Faction Traits`,
          target: '2 Faction Traits',
          status: factionTraits.length >= 2 ? 'valid' : 'warning',
          note: factionTraits.slice(0, 4).join(', ') || '2 Faction Traits (1 CP value each)'
        },
        {
          label: 'Recommended Features (-1 CP)',
          value: `${recFeats.length} / 10 Features`,
          target: '10 Recommended (-1 CP)',
          status: 'valid',
          note: recFeats.slice(0, 4).join(', ') || 'Up to 10 Recommended Features (-1 CP discount)'
        }
      ],
      syncPatch: null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10B. COMPANIONS & FAMILIARS CATALOG (MCM Section 9)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'companions' || key === 'companion') {
    const compType = toCleanString(data.companion_type, 'Synthetic / Drone Companion');
    const formPkg = toCleanString(data.form_package, 'Quadruped');
    const funcPkgs = parseList(data.function_packages);
    const compRank = Number(data.companion_rank ?? 1);
    const cpCost = Number(data.cp ?? (compRank * 3));

    return {
      title: 'Companion & Familiar Package Check',
      isProperty: false,
      unit: 'CP',
      primaryCostLabel: `${cpCost} CP (Rank ${compRank})`,
      primaryValue: `${cpCost} CP (Rank ${compRank})`,
      secondaryLabel: `${compType} • ${formPkg}`,
      expectedValue: cpCost,
      actualValue: cpCost,
      status: 'valid',
      statusLabel: `✓ RANK ${compRank} COMPANION VERIFIED`,
      summary: `✓ RANK ${compRank} COMPANION VERIFIED`,
      formulaSummary: 'Companion Package = Form Package + Function Packages + Companion Rank (1–5) Scaling',
      breakdown: [
        {
          label: 'Chassis & Form Package',
          value: `${compType} (${formPkg})`,
          target: 'Form Chassis',
          status: 'valid',
          note: `Size: ${toCleanString(data.size, 'Small')} | Owner Tier: ${data.owner_tier ?? 1}`
        },
        {
          label: 'Installed Function Packages',
          value: `${funcPkgs.length} Packages`,
          target: 'Role Modules',
          status: 'valid',
          note: funcPkgs.join(', ') || 'Scout / Recon'
        }
      ],
      syncPatch: null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. MODULAR CHARACTERS / THREATS (Threat Tier 0–20)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'modular_characters' || key === 'modular-characters') {
    const tier = Number(data.tier ?? data.threat_tier ?? 3);
    const role = toCleanString(data.role || data.competency_role, 'Striker');
    const desig = toCleanString(data.designation || data.boss_type, 'Standard');

    return {
      title: 'Threat Scaling Check',
      isProperty: false,
      unit: 'Tier',
      primaryCostLabel: `Threat Tier ${tier}`,
      primaryValue: `Threat Tier ${tier}`,
      secondaryLabel: `${role} • ${desig}`,
      expectedValue: tier,
      actualValue: tier,
      status: 'valid',
      statusLabel: `✓ TIER ${tier} THREAT VERIFIED`,
      summary: `✓ TIER ${tier} THREAT VERIFIED`,
      formulaSummary: 'Threat Scaling = Tier (0–20) × Competency Role × Designation Multiplier',
      breakdown: [
        {
          label: 'Threat Tier & Designation',
          value: `Tier ${tier} (${desig})`,
          target: '0–20 Scale',
          status: 'valid',
          note: `Tactical Role: ${role}`
        },
        {
          label: 'Derived Combat Vitals',
          value: `HP ${computedValues?.max_health ?? data.health ?? (20 + tier * 5)} • DEF ${computedValues?.defense_dc ?? data.defense ?? (12 + tier)}`,
          target: 'Auto-Scaled',
          status: 'valid',
          note: `Attack Mod: +${computedValues?.attack_bonus ?? (tier + 2)}`
        }
      ],
      syncPatch: null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 12. PLANETARY DESIGN & SPECIES SUB-COMPONENTS (Fallback Non-Property)
  // ─────────────────────────────────────────────────────────────────────────
  if (key === 'planets' || key === 'planetary-design' || key === 'planetary_design' || key === 'world') {
    const tl = data.tl ?? data.tech_level ?? 3;
    const starport = toCleanString(data.starport || data.starport_class, 'Class C');
    const worldType = toCleanString(data.world_type || data.classification, 'Terrestrial');
    return {
      title: 'Universal World Profile Check',
      isProperty: false,
      unit: 'TL',
      primaryCostLabel: `TL ${tl} • ${starport}`,
      primaryValue: `TL ${tl} • ${starport}`,
      secondaryLabel: worldType,
      expectedValue: tl,
      actualValue: tl,
      status: 'valid',
      statusLabel: '✓ UWP WORLD PROFILE VALID',
      summary: '✓ UWP WORLD PROFILE VALID',
      formulaSummary: 'Universal World Profile (UWP) = Starport + Gravity + Atmosphere + BioZone + TL/Law Level',
      breakdown: [
        {
          label: 'Biome & Starport Class',
          value: `${worldType} (${starport})`,
          target: 'UWP Standard',
          status: 'valid',
          note: `Gravity: ${toCleanString(data.gravity, '1.0G')} | Atmosphere: ${toCleanString(data.atmosphere, 'Breathable')}`
        }
      ],
      syncPatch: null
    };
  }

  // Species Sub-Catalogs (species_type, species_size, species_movement) or generic CP entries
  const subCP = Number(data.cp ?? data.bp ?? data.cost_cp ?? 0);
  return {
    title: 'Component CP Cost Check',
    isProperty: false,
    unit: 'CP',
    primaryCostLabel: `${subCP >= 0 ? subCP : subCP} CP`,
    primaryValue: `${subCP >= 0 ? subCP : subCP} CP`,
    secondaryLabel: toCleanString(data.type || data.category, key.replace(/_/g, ' ').toUpperCase()),
    expectedValue: subCP,
    actualValue: subCP,
    status: 'valid',
    statusLabel: `✓ ${subCP} CP COMPONENT VALID`,
    summary: `✓ ${subCP} CP COMPONENT VALID`,
    formulaSummary: 'Component CP Cost integrates directly into the Species / Persona CP architecture.',
    breakdown: [
      {
        label: 'Component Build Cost',
        value: `${subCP} CP`,
        target: 'Package Weight',
        status: 'valid',
        note: toCleanString(data.description, 'Canonical rules component')
      }
    ],
    syncPatch: null
  };
}

export default evaluateAssetBuildCost;
