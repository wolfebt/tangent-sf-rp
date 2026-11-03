import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

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

// 1. Weaponry Sync & Cost Backfill
function syncWeaponry() {
  const dir = path.join(omniRoot, 'weaponry');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const tl = data.tech_level !== undefined ? parseInt(data.tech_level, 10) : (parseInt(data.tl || 2, 10) || 2);
    const craftDc = data.craft_cr !== undefined
      ? parseInt(data.craft_cr, 10)
      : (data.craft_dc !== undefined ? parseInt(data.craft_dc, 10) : (data.cr !== undefined ? parseInt(data.cr, 10) : (data.dc !== undefined ? parseInt(data.dc, 10) : (5 + tl * 5))));
    const designCr = data.design_cr ?? data.design_dc ?? craftDc;
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) || (data.cost > 0 ? data.cost : null) || tscCredits(craftDc);
    const bp = data.costs?.cp ?? data.costs?.bp ?? 0;

    const itemObj = {
      ...data,
      id,
      name,
      category: 'weaponry',
      weapon_type: data.weapon_type || data.classification || 'Ranged',
      damage: data.damage || data.damage_dice || '2d6',
      damage_type: data.damage_type || 'Kinetic',
      range: data.range || '50ft',
      rate_of_fire: data.rate_of_fire || data.rof || 'Single',
      ammo: data.ammo || data.ammunition || '-',
      ammunition: data.ammunition || data.ammo || '-',
      tech_level: tl,
      craft_cr: craftDc,
      craft_dc: craftDc,
      design_cr: designCr,
      design_dc: designCr,
      cost: credits,
      costs: {
        cp: data.costs?.cp ?? bp,
        bp,
        credits,
        nodes: data.costs?.nodes || 0,
        sockets: data.costs?.sockets || 0,
        strain: 0,
        focus: 0,
        ap: data.costs?.ap || 1
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      description: data.description || '',
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
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const tl = data.tech_level !== undefined ? parseInt(data.tech_level, 10) : (parseInt(data.tl || 2, 10) || 2);
    const craftDc = data.craft_cr !== undefined
      ? parseInt(data.craft_cr, 10)
      : (data.craft_dc !== undefined ? parseInt(data.craft_dc, 10) : (data.design_cr !== undefined ? parseInt(data.design_cr, 10) : (data.design_dc !== undefined ? parseInt(data.design_dc, 10) : (5 + tl * 5))));
    const designCr = data.design_cr ?? data.design_dc ?? craftDc;
    const credits = (data.costs?.credits > 0 ? data.costs.credits : null) || (data.cost > 0 ? data.cost : null) || tscCredits(craftDc);
    const bp = data.costs?.cp ?? data.costs?.bp ?? 0;

    const itemObj = {
      ...data,
      id,
      name,
      collection: 'armoring',
      category: data.category || 'Mediumweight',
      armor_class: data.armor_class || data.category || 'Mediumweight',
      armor_type: data.armor_type || data.category || 'Body Armor',
      dr: data.dr ?? data.damage_reduction ?? 5,
      sp: data.sp ?? data.durability ?? 15,
      durability: data.durability ?? data.sp ?? 15,
      tech_level: tl,
      craft_cr: craftDc,
      craft_dc: craftDc,
      design_cr: designCr,
      design_dc: designCr,
      cost: credits,
      costs: {
        cp: data.costs?.cp ?? bp,
        bp,
        credits,
        nodes: data.costs?.nodes || 0,
        sockets: data.costs?.sockets || 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      description: data.description || '',
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
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const name = data.name || data.title || id;

    const itemObj = {
      ...data,
      id,
      name,
      category: 'augmentations',
      augmentation_type: data.augmentation_type || data.type || 'Cybernetic',
      stage: data.stage || 'Standard',
      body_location: data.body_location || data.location || 'General',
      tech_level: data.tech_level ?? 3,
      costs: data.costs || { bp: 1, credits: 640, nodes: 1, sockets: 0, strain: 0, focus: 0, ap: 0 },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      description: data.description || '',
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
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || f.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const level = parseInt(data.level || data.tier || 1, 10) || 1;
    const strain = data.costs?.strain || (level * 2);
    const focus = data.costs?.focus || level;
    const bp = data.costs?.bp || (level * 2);

    const itemObj = {
      id,
      name,
      category: 'invocations',
      discipline: data.discipline || 'Metaphysics',
      level,
      range: data.range || '30 ft',
      duration: data.duration || 'Instantaneous',
      area: data.area || 'Single Target',
      costs: {
        bp,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain,
        focus,
        ap: 2
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      recommended_species: Array.isArray(data.recommended_species) ? data.recommended_species : [],
      recommended_factions: Array.isArray(data.recommended_factions) ? data.recommended_factions : [],
      recommended_origins: Array.isArray(data.recommended_origins) ? data.recommended_origins : [],
      recommended_occupations: Array.isArray(data.recommended_occupations) ? data.recommended_occupations : [],
      keywords: typeof data.keywords === 'string' ? data.keywords.trim() : (Array.isArray(data.keywords) ? data.keywords.join(', ') : ''),
      negative_keywords: typeof data.negative_keywords === 'string' ? data.negative_keywords.trim() : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : ''),
      description: data.description || '',
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
`;

  fs.writeFileSync(path.join(staticDataRoot, 'invocationsData.js'), outputCode, 'utf8');
  console.log(`Successfully synced ${items.length} invocations to invocationsData.js`);
}

syncWeaponry();
syncArmoring();
syncAugmentations();
syncInvocations();
