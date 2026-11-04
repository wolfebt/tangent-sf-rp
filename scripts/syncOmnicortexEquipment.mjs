import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_WEAPONRY } from '../src/data/weaponryData.js';
import { DEFAULT_ARMORING } from '../src/data/armoringData.js';
import { DEFAULT_AUGMENTATIONS } from '../src/data/augmentationsData.js';
import { DEFAULT_INVOCATIONS } from '../src/data/invocationsData.js';
import { DEFAULT_GEAR } from '../src/data/gearData.js';
import { DEFAULT_MECHA } from '../src/data/mechaData.js';
import { DEFAULT_ARCHITECTURE } from '../src/data/architectureData.js';
import { DEFAULT_OTHER_PROPERTY } from '../src/data/otherPropertyData.js';
import { DEFAULT_SYNTHESIS } from '../src/data/synthesisData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const omniRoot = path.join(projectRoot, 'src', 'data', 'omnicortex');
const staticDataRoot = path.join(projectRoot, 'src', 'data');

// Canonical EUFT Linear Micro-Modifiers: Base_5 = floor(CR / 5) * 5; Value = round((10 * 4^(Base_5 / 5)) * MicroMod)
const EUFT_MICRO_MODIFIERS = { 0: 1.00, 1: 1.30, 2: 1.75, 3: 2.30, 4: 3.00 };
function tscCredits(cr) {
  const numCr = Number(cr) || 0;
  if (numCr < 0) return 10;
  const intCr = Math.round(numCr);
  const base5 = Math.floor(intCr / 5) * 5;
  const offset = intCr - base5;
  const baseCredits = 10 * Math.pow(4, base5 / 5);
  const mult = EUFT_MICRO_MODIFIERS[offset] ?? Math.pow(4, offset / 5);
  return Math.round(baseCredits * mult);
}

function buildLookupMap(arr) {
  const map = new Map();
  for (const item of (arr || [])) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return map;
}

// 1. Weaponry Sync & Cost Backfill
function syncWeaponry() {
  const dir = path.join(omniRoot, 'weaponry');
  const existingMap = buildLookupMap(DEFAULT_WEAPONRY);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const tl = data.tech_level !== undefined
      ? parseInt(data.tech_level, 10)
      : (data.tl !== undefined ? parseInt(data.tl, 10) : (existing.tech_level ?? 2));
    const craftDc = data.craft_cr !== undefined
      ? parseInt(data.craft_cr, 10)
      : (data.craft_dc !== undefined
        ? parseInt(data.craft_dc, 10)
        : (data.cr !== undefined
          ? parseInt(data.cr, 10)
          : (data.dc !== undefined ? parseInt(data.dc, 10) : (existing.craft_dc ?? (5 + tl * 5)))));
    const designCr = data.design_cr ?? data.design_dc ?? existing.design_dc ?? craftDc;
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);
    const bp = data.costs?.cp ?? data.costs?.bp ?? existing.costs?.cp ?? 0;

    const itemObj = {
      ...existing,
      ...data,
      id,
      name,
      category: 'weaponry',
      weapon_type: data.weapon_type || data.classification || existing.weapon_type || 'Ranged',
      damage: data.damage || data.damage_dice || existing.damage || '2d6',
      damage_type: data.damage_type || existing.damage_type || 'Kinetic',
      range: data.range || existing.range || '50ft',
      rate_of_fire: data.rate_of_fire || data.rof || existing.rate_of_fire || 'Single',
      ammo: data.ammo || data.ammunition || existing.ammo || '-',
      ammunition: data.ammunition || data.ammo || existing.ammunition || '-',
      tech_level: tl,
      craft_cr: craftDc,
      craft_dc: craftDc,
      design_cr: designCr,
      design_dc: designCr,
      cost: credits,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        cp: data.costs?.cp ?? bp,
        bp,
        credits,
        nodes: data.costs?.nodes ?? existing.costs?.nodes ?? 0,
        sockets: data.costs?.sockets ?? existing.costs?.sockets ?? 0,
        strain: 0,
        focus: 0,
        ap: data.costs?.ap ?? existing.costs?.ap ?? 1
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Weaponry Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/weaponry/
 * Total Weapons: ${items.length}
 */

export const DEFAULT_WEAPONRY = ${JSON.stringify(items, null, 2)};
export const getWeaponById = (id) => DEFAULT_WEAPONRY.find(w => w.id === id);
`;

  fs.writeFileSync(path.join(staticDataRoot, 'weaponryData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} weaponry items to weaponryData.js`);
}

// 2. Armoring Sync
function syncArmoring() {
  const dir = path.join(omniRoot, 'armoring');
  const existingMap = buildLookupMap(DEFAULT_ARMORING);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const tl = data.tech_level !== undefined
      ? parseInt(data.tech_level, 10)
      : (data.tl !== undefined ? parseInt(data.tl, 10) : (existing.tech_level ?? 2));
    const craftDc = data.craft_cr !== undefined
      ? parseInt(data.craft_cr, 10)
      : (data.craft_dc !== undefined
        ? parseInt(data.craft_dc, 10)
        : (data.design_cr !== undefined
          ? parseInt(data.design_cr, 10)
          : (data.design_dc !== undefined ? parseInt(data.design_dc, 10) : (existing.craft_dc ?? (5 + tl * 5)))));
    const designCr = data.design_cr ?? data.design_dc ?? existing.design_dc ?? craftDc;
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);
    const bp = data.costs?.cp ?? data.costs?.bp ?? existing.costs?.cp ?? 0;

    const itemObj = {
      ...existing,
      ...data,
      id,
      name,
      collection: 'armoring',
      category: data.category || existing.category || 'Mediumweight',
      armor_class: data.armor_class || data.category || existing.armor_class || 'Mediumweight',
      armor_type: data.armor_type || data.category || existing.armor_type || 'Body Armor',
      dr: data.dr ?? data.damage_reduction ?? existing.dr ?? 5,
      sp: data.sp ?? data.durability ?? existing.sp ?? 15,
      durability: data.durability ?? data.sp ?? existing.durability ?? 15,
      tech_level: tl,
      craft_cr: craftDc,
      craft_dc: craftDc,
      design_cr: designCr,
      design_dc: designCr,
      cost: credits,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        cp: data.costs?.cp ?? bp,
        bp,
        credits,
        nodes: data.costs?.nodes ?? existing.costs?.nodes ?? 0,
        sockets: data.costs?.sockets ?? existing.costs?.sockets ?? 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Armoring Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/armoring/
 * Total Armor Items: ${items.length}
 */

export const DEFAULT_ARMORING = ${JSON.stringify(items, null, 2)};
export const getArmorById = (id) => DEFAULT_ARMORING.find(a => a.id === id);
`;

  fs.writeFileSync(path.join(staticDataRoot, 'armoringData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} armor items to armoringData.js`);
}

// 3. Augmentations Sync
function syncAugmentations() {
  const dir = path.join(omniRoot, 'augmentations');
  const existingMap = buildLookupMap(DEFAULT_AUGMENTATIONS);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const stage = data.stage || existing.stage || 'Standard';

    // Extract explicit **Nodes:** N from body if not defined in frontmatter
    let parsedBodyNodes = undefined;
    const nodesMatch = body.match(/\*\*Nodes:\*\*\s*(\d+)/i);
    if (nodesMatch) {
      parsedBodyNodes = parseInt(nodesMatch[1], 10);
    }
    const resolvedNodes = data.nodes !== undefined
      ? data.nodes
      : (data.costs?.nodes !== undefined
        ? data.costs.nodes
        : (parsedBodyNodes !== undefined ? parsedBodyNodes : (existing.nodes ?? (stage === 'Negligible' ? 0 : 1))));

    const baseCosts = data.costs || existing.costs || { bp: stage === 'Negligible' ? 0 : 1, credits: 640, nodes: resolvedNodes, sockets: 0, strain: 0, focus: 0, ap: 0 };

    const itemObj = {
      ...existing,
      ...data,
      id,
      name,
      category: 'augmentations',
      augmentation_type: data.augmentation_type || data.type || existing.augmentation_type || 'Cybernetic',
      stage,
      nodes: resolvedNodes,
      body_location: data.body_location || data.location || existing.body_location || 'General',
      tech_level: data.tech_level ?? existing.tech_level ?? 3,
      costs: {
        ...baseCosts,
        nodes: baseCosts.nodes !== undefined ? baseCosts.nodes : resolvedNodes
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Augmentations Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/augmentations/
 * Total Augmentations: ${items.length}
 */

export const DEFAULT_AUGMENTATIONS = ${JSON.stringify(items, null, 2)};
export const getAugmentationById = (id) => DEFAULT_AUGMENTATIONS.find(a => a.id === id);
export const getEnrichedAugmentationData = (item) => {
  if (!item) return null;
  const key = (item.id || item.name || '').toString().toLowerCase().trim();
  const match = DEFAULT_AUGMENTATIONS.find(
    a => a.id.toLowerCase() === key || (a.name && a.name.toLowerCase() === key)
  );
  return match ? { ...match, ...item } : item;
};
`;

  fs.writeFileSync(path.join(staticDataRoot, 'augmentationsData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} augmentations to augmentationsData.js`);
}

// 4. Invocations Sync & Cost Backfill
function syncInvocations() {
  const dir = path.join(omniRoot, 'invocations');
  const existingMap = buildLookupMap(DEFAULT_INVOCATIONS);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const level = parseInt(data.level || data.tier || existing.level || 1, 10) || 1;
    const strain = data.costs?.strain || existing.costs?.strain || (level * 2);
    const focus = data.costs?.focus || existing.costs?.focus || level;
    const bp = data.costs?.bp || existing.costs?.bp || (level * 2);

    const itemObj = {
      ...existing,
      ...data,
      id,
      name,
      category: 'invocations',
      discipline: data.discipline || existing.discipline || 'Metaphysics',
      level,
      range: data.range || existing.range || '30 ft',
      duration: data.duration || existing.duration || 'Instantaneous',
      area: data.area || existing.area || 'Single Target',
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        bp,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain,
        focus,
        ap: data.costs?.ap ?? existing.costs?.ap ?? 2
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      recommended_species: Array.isArray(data.recommended_species) ? data.recommended_species : (existing.recommended_species || []),
      recommended_factions: Array.isArray(data.recommended_factions) ? data.recommended_factions : (existing.recommended_factions || []),
      recommended_origins: Array.isArray(data.recommended_origins) ? data.recommended_origins : (existing.recommended_origins || []),
      recommended_occupations: Array.isArray(data.recommended_occupations) ? data.recommended_occupations : (existing.recommended_occupations || []),
      keywords: typeof data.keywords === 'string'
        ? data.keywords.trim()
        : (Array.isArray(data.keywords) ? data.keywords.join(', ') : (existing.keywords || '')),
      negative_keywords: typeof data.negative_keywords === 'string'
        ? data.negative_keywords.trim()
        : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : (existing.negative_keywords || '')),
      description: data.description || existing.description || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Invocations Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/invocations/
 * Total Invocations: ${items.length}
 */

export const DEFAULT_INVOCATIONS = ${JSON.stringify(items, null, 2)};
export const getInvocationById = (id) => DEFAULT_INVOCATIONS.find(i => i.id === id);

/**
 * Enriches an invocation object with all canonical metadata (category, discipline,
 * level, range, duration, area, manifestation_dc, focus_cost, description, mechanic,
 * costs, keywords, negative_keywords, recommendations, modifiers)
 * for Codex Matrix editing, Folio sheet rendering, or Omnicortex DBM inspection.
 */
export const getEnrichedInvocationData = (invocation) => {
  if (!invocation) return null;
  const rawId = (invocation.id || '').toString().trim();
  const cleanId = rawId.replace(/^(invocation|inv)-/i, '').toLowerCase();
  const rawName = (invocation.name || invocation.title || '').toString().trim().toLowerCase();

  const canonical = DEFAULT_INVOCATIONS.find(i => {
    const iId = (i.id || '').toString().trim().toLowerCase();
    const iCleanId = iId.replace(/^(invocation|inv)-/i, '');
    const iName = (i.name || i.title || '').toString().trim().toLowerCase();
    return (rawId && iId === rawId.toLowerCase()) ||
           (cleanId && iCleanId === cleanId) ||
           (rawName && iName === rawName);
  });

  const name = invocation.name || invocation.title || canonical?.name || canonical?.title || 'Invocation';
  const id = invocation.id || canonical?.id || \`invocation-\${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\`;
  const discipline = invocation.discipline || canonical?.discipline || 'Entropy';
  const category = 'invocations';
  const level = invocation.level !== undefined ? Number(invocation.level) : (canonical?.level !== undefined ? Number(canonical.level) : (invocation.rank ? Number(invocation.rank) : 1));
  const range = invocation.range || canonical?.range || 'Medium';
  const duration = invocation.duration || canonical?.duration || 'Instantaneous';
  const area = invocation.area || canonical?.area || 'Single Target';
  const description = invocation.description || canonical?.description || invocation.desc || canonical?.desc || '';
  const mechanic = invocation.mechanic || invocation.mechanics || canonical?.mechanic || canonical?.mechanics || canonical?.body || '';
  const note = invocation.note || invocation.notes || canonical?.note || canonical?.notes || '';
  const keywords = invocation.keywords || canonical?.keywords || '';
  const negative_keywords = invocation.negative_keywords || canonical?.negative_keywords || '';
  const manifestation_dc = invocation.manifestation_dc || invocation.baseDC || canonical?.manifestation_dc || canonical?.baseDC || 15;
  const focus_cost = invocation.focus_cost || canonical?.focus_cost || 2;
  const isSpecialAbility = Boolean(invocation.isSpecialAbility || canonical?.isSpecialAbility);
  const foundationAttribute = invocation.foundationAttribute || canonical?.foundationAttribute || 'attr-intellect';
  const rank = invocation.rank !== undefined ? Number(invocation.rank) : level;
  const cp = invocation.cp !== undefined ? Number(invocation.cp) : 1;

  return {
    ...(canonical || {}),
    ...invocation,
    id,
    name,
    category,
    discipline,
    level,
    range,
    duration,
    area,
    description,
    desc: description,
    mechanic,
    mechanics: mechanic,
    note,
    notes: note,
    keywords,
    negative_keywords,
    manifestation_dc,
    baseDC: manifestation_dc,
    focus_cost,
    isSpecialAbility,
    foundationAttribute,
    rank,
    cp,
    costs: {
      bp: 2,
      cp: 1,
      credits: 0,
      nodes: 0,
      sockets: 0,
      strain: 2,
      focus: focus_cost,
      ap: 2,
      ...(canonical?.costs || {}),
      ...(invocation.costs || {})
    },
    recommended_species: Array.isArray(invocation.recommended_species) ? invocation.recommended_species : (canonical?.recommended_species || []),
    recommended_factions: Array.isArray(invocation.recommended_factions) ? invocation.recommended_factions : (canonical?.recommended_factions || []),
    recommended_origins: Array.isArray(invocation.recommended_origins) ? invocation.recommended_origins : (canonical?.recommended_origins || []),
    recommended_occupations: Array.isArray(invocation.recommended_occupations) ? invocation.recommended_occupations : (canonical?.recommended_occupations || []),
    modifiers: Array.isArray(invocation.modifiers) ? invocation.modifiers : (canonical?.modifiers || [])
  };
};
`;

  fs.writeFileSync(path.join(staticDataRoot, 'invocationsData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} invocations to invocationsData.js`);
}

// 5. Gear Sync
function syncGear() {
  const dir = path.join(omniRoot, 'gear');
  if (!fs.existsSync(dir)) return;
  const existingMap = buildLookupMap(DEFAULT_GEAR);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const tl = data.tech_level !== undefined
      ? parseInt(data.tech_level, 10)
      : (data.tl !== undefined ? parseInt(data.tl, 10) : (existing.tech_level ?? 2));
    const craftDc = data.craft_dc !== undefined
      ? parseInt(data.craft_dc, 10)
      : (data.design_dc !== undefined ? parseInt(data.design_dc, 10) : (existing.craft_dc ?? (5 + tl * 5)));
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);

    const itemObj = {
      ...existing,
      ...data,
      id,
      category: 'gear',
      name,
      cost: credits,
      craft_dc: craftDc,
      design_dc: data.design_dc ?? existing.design_dc ?? craftDc,
      base_dc: data.base_dc ?? existing.base_dc ?? craftDc,
      tech_level: tl,
      meta_level: data.meta_level ?? existing.meta_level ?? 0,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        cp: data.costs?.cp ?? existing.costs?.cp ?? 0,
        bp: data.costs?.bp ?? existing.costs?.bp ?? 0,
        credits
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      mechanic: data.mechanic || existing.mechanic || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Gear Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/gear/
 * Total Gear Items: ${items.length}
 */

export const DEFAULT_GEAR = ${JSON.stringify(items, null, 2)};
export const getGearById = (id) => DEFAULT_GEAR.find(g => g.id === id);
`;

  fs.writeFileSync(path.join(staticDataRoot, 'gearData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} gear items to gearData.js`);
}

// 6. Mecha Sync
function syncMecha() {
  const dir = path.join(omniRoot, 'mecha');
  if (!fs.existsSync(dir)) return;
  const existingMap = buildLookupMap(DEFAULT_MECHA);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const tl = data.tech_level !== undefined
      ? parseInt(data.tech_level, 10)
      : (data.tl !== undefined ? parseInt(data.tl, 10) : (existing.tech_level ?? 3));
    const craftDc = data.craft_dc !== undefined
      ? parseInt(data.craft_dc, 10)
      : (data.design_dc !== undefined ? parseInt(data.design_dc, 10) : (existing.craft_dc ?? 20));
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);

    const itemObj = {
      ...existing,
      ...data,
      id,
      category: 'mecha',
      name,
      cost: credits,
      craft_dc: craftDc,
      design_dc: data.design_dc ?? existing.design_dc ?? craftDc,
      tech_level: tl,
      meta_level: data.meta_level ?? existing.meta_level ?? 0,
      sp: data.sp ?? existing.sp ?? 60,
      dr: data.dr ?? existing.dr ?? 10,
      durability: data.durability ?? data.sp ?? existing.durability ?? 60,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        cp: data.costs?.cp ?? existing.costs?.cp ?? 0,
        bp: data.costs?.bp ?? existing.costs?.bp ?? 0,
        credits
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      mechanic: data.mechanic || existing.mechanic || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Mecha & Vehicles Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/mecha/ (2.00.Mecha.md)
 * Total Mecha Items: ${items.length}
 */

export const DEFAULT_MECHA = ${JSON.stringify(items, null, 2)};
export const getMechaById = (id) => DEFAULT_MECHA.find(m => m.id === id);
`;

  fs.writeFileSync(path.join(staticDataRoot, 'mechaData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} mecha items to mechaData.js`);
}

// 7. Architecture Sync
function syncArchitecture() {
  const dir = path.join(omniRoot, 'architecture');
  if (!fs.existsSync(dir)) return;
  const existingMap = buildLookupMap(DEFAULT_ARCHITECTURE);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const tl = data.tech_level !== undefined
      ? parseInt(data.tech_level, 10)
      : (data.tl !== undefined ? parseInt(data.tl, 10) : (existing.tech_level ?? 3));
    const craftDc = data.craft_dc !== undefined
      ? parseInt(data.craft_dc, 10)
      : (data.design_dc !== undefined ? parseInt(data.design_dc, 10) : (existing.craft_dc ?? 25));
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);

    const itemObj = {
      ...existing,
      ...data,
      id,
      category: 'architecture',
      name,
      cost: credits,
      craft_dc: craftDc,
      design_dc: data.design_dc ?? existing.design_dc ?? craftDc,
      tech_level: tl,
      meta_level: data.meta_level ?? existing.meta_level ?? 0,
      sp: data.sp ?? existing.sp ?? 500,
      dr: data.dr ?? existing.dr ?? 10,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        cp: data.costs?.cp ?? existing.costs?.cp ?? 0,
        bp: data.costs?.bp ?? existing.costs?.bp ?? 0,
        credits
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) ? data.modifications : (existing.modifications || []),
      description: data.description || existing.description || '',
      mechanic: data.mechanic || existing.mechanic || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Architecture & Facilities Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/architecture/
 * Total Architecture Items: ${items.length}
 */

export const DEFAULT_ARCHITECTURE = ${JSON.stringify(items, null, 2)};
export const getArchitectureById = (id) => DEFAULT_ARCHITECTURE.find(a => a.id === id);
`;

  fs.writeFileSync(path.join(staticDataRoot, 'architectureData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} architecture items to architectureData.js`);
}

// 8. Other Property (Commodities, Consumables, Raw Materials, Power Cells) Sync
function syncOtherProperty() {
  const dir = path.join(omniRoot, 'other_property');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    // Bootstrap Markdown source files from DEFAULT_OTHER_PROPERTY so they are 100% Markdown-backed
    for (const item of (DEFAULT_OTHER_PROPERTY || [])) {
      const { body: existingBody, ...frontmatter } = item;
      const mdBody = existingBody || `# ${item.name}\n\n${item.description || ''}\n\n**Mechanics:** ${item.mechanic || ''}\n\n${item.notes ? `**Notes:** ${item.notes}` : ''}`.trim();
      const mdContent = matter.stringify(`${mdBody}\n`, frontmatter);
      fs.writeFileSync(path.join(dir, `${item.id}.md`), mdContent, 'utf8');
    }
  }

  const existingMap = buildLookupMap(DEFAULT_OTHER_PROPERTY);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) return;

  const existingOrder = new Map((DEFAULT_OTHER_PROPERTY || []).map((o, idx) => [o.id, idx]));
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const name = data.name || data.title || existing.name || id;
    const craftDc = data.craft_dc ?? existing.craft_dc ?? 0;
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) ||
      (data.cost > 0 ? data.cost : null) ||
      (existing.cost > 0 ? existing.cost : null) ||
      tscCredits(craftDc);

    const itemObj = {
      ...existing,
      ...data,
      id,
      name,
      category: data.category || existing.category || 'other',
      cost: credits,
      craft_dc: craftDc,
      design_dc: data.design_dc ?? existing.design_dc ?? craftDc,
      costs: {
        ...(existing.costs || {}),
        ...(data.costs || {}),
        credits
      },
      description: data.description || existing.description || '',
      mechanic: data.mechanic || existing.mechanic || '',
      body
    };

    items.push(itemObj);
  }

  items.sort((a, b) => {
    const idxA = existingOrder.has(a.id) ? existingOrder.get(a.id) : 9999;
    const idxB = existingOrder.has(b.id) ? existingOrder.get(b.id) : 9999;
    if (idxA !== idxB) return idxA - idxB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const outputCode = `/**
 * Canonical Other Property Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/other_property/
 * Commodities, Consumables, Raw Materials, Ammunition, Power Cells, Trade Goods & Meta-Tech Catalysts
 * Total Other Property Items: ${items.length}
 */

export const DEFAULT_OTHER_PROPERTY = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(path.join(staticDataRoot, 'otherPropertyData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} other property items to otherPropertyData.js`);
}

// 9. CRISP Visual Synthesis Profiles Sync
function syncSynthesis() {
  const dir = path.join(omniRoot, 'synthesis');
  if (!fs.existsSync(dir)) return;
  const existingMap = buildLookupMap(DEFAULT_SYNTHESIS);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};

    const codeBlockMatch = body.match(/```(?:text)?\s*([\s\S]*?)```/);
    const extractedPrompt = codeBlockMatch ? codeBlockMatch[1].trim() : '';

    const itemObj = {
      ...existing,
      ...data,
      id,
      name: data.name || data.title || existing.name || id,
      category: 'synthesis',
      synthesis_type: data.synthesis_type || existing.synthesis_type || 'visual_synthesis',
      description: data.description || existing.description || '',
      mechanic: data.mechanic || extractedPrompt || existing.mechanic || body,
      crisp_prompt: data.crisp_prompt !== undefined ? data.crisp_prompt : (extractedPrompt || existing.crisp_prompt || ''),
      body,
      costs: data.costs || existing.costs || { cp: 0, bp: 0 },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (existing.modifiers || [])
    };

    items.push(itemObj);
  }

  items.sort((a, b) => (a.id || '').localeCompare(b.id || ''));

  const outputCode = `/**
 * Canonical CRISP Visual Synthesis & Keyframe Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/synthesis/
 * Total Synthesis Profiles: ${items.length}
 */

export const DEFAULT_SYNTHESIS = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(path.join(staticDataRoot, 'synthesisData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} synthesis profiles to synthesisData.js`);
}

syncWeaponry();
syncArmoring();
syncAugmentations();
syncInvocations();
syncGear();
syncMecha();
syncArchitecture();
syncOtherProperty();
syncSynthesis();
