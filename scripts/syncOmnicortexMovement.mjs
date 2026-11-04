import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import * as existingMovement from '../src/data/speciesMovementData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const movementDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesMovementData.js');

function syncMovement() {
  if (!fs.existsSync(movementDir)) {
    console.error(`Movement directory not found at: ${movementDir}`);
    process.exit(1);
  }

  const existingList = existingMovement.DEFAULT_SPECIES_MOVEMENT || [];
  const existingMap = new Map();
  const existingOrder = new Map();
  existingList.forEach((m, idx) => {
    if (m && m.id) {
      existingMap.set(m.id, m);
      existingOrder.set(m.id, idx);
    }
  });

  const files = fs.readdirSync(movementDir).filter(f => f.endsWith('.md')).sort();
  const compiledAll = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(movementDir, file), 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();
    const id = data.id || file.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};

    compiledAll.push({
      ...existing,
      ...data,
      id,
      name: data.name || existing.name || id,
      category: 'species_movement',
      description: data.description || existing.description || '',
      body
    });
  }

  compiledAll.sort((a, b) => {
    const idxA = existingOrder.has(a.id) ? existingOrder.get(a.id) : 9999;
    const idxB = existingOrder.has(b.id) ? existingOrder.get(b.id) : 9999;
    if (idxA !== idxB) return idxA - idxB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const classify = (item) => {
    const id = item.id || '';
    if (item.movement_tier) return item.movement_tier;
    if (item.classification === 'basic') return 'basic';
    if (item.classification === 'advanced') return 'advanced';
    if (item.classification === 'adjuster' || item.classification === 'modifier') return 'modifier';
    if (item.classification === 'pace' || item.classification === 'stage') return 'stage';
    if (id.startsWith('movement-')) return 'modifier';
    if (id.startsWith('pace-')) return 'stage';
    const adv = [
      'species_movement-flight',
      'species_movement-flight-basic',
      'species_movement-swimming',
      'species_movement-climbing',
      'species_movement-burrowing',
      'species_movement-flicker'
    ];
    return adv.includes(id) ? 'advanced' : 'basic';
  };

  const basicModes = compiledAll.filter(m => classify(m) === 'basic');
  const advancedModes = compiledAll.filter(m => classify(m) === 'advanced');
  const modifiers = compiledAll.filter(m => classify(m) === 'modifier');
  const stages = compiledAll.filter(m => classify(m) === 'stage');
  const groups = existingMovement.SPECIES_MOVEMENT_GROUPS || {
    basic: basicModes,
    advanced: advancedModes,
    modifiers,
    stages
  };

  const jsCode = `/**
 * Canonical Species Movement & Locomotion Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/species_movement/
 * Total Movement Entries: ${compiledAll.length}
 */

export const MOVEMENT_CLASSIFICATION_ORDER = ['basic', 'advanced', 'modifier', 'stage'];

export const BASIC_MOVEMENT_MODES = ${JSON.stringify(basicModes, null, 2)};

export const ADVANCED_MOVEMENT_MODES = ${JSON.stringify(advancedModes, null, 2)};

export const MOVEMENT_MODIFIERS = ${JSON.stringify(modifiers, null, 2)};

export const MOVEMENT_STAGES = ${JSON.stringify(stages, null, 2)};

export const SPECIES_MOVEMENT_BASE_MODES = [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES];
export const SPECIES_MOVEMENT_ADJUSTERS = MOVEMENT_MODIFIERS;
export const SPECIES_MOVEMENT_PACES = MOVEMENT_STAGES;
export const SPECIES_MOVEMENT_GROUPS = ${JSON.stringify(groups, null, 2)};

export const DEFAULT_SPECIES_MOVEMENT = ${JSON.stringify(compiledAll, null, 2)};
export const SPECIES_MOVEMENT_MODES = DEFAULT_SPECIES_MOVEMENT;

export const getMovementById = (id) => DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);

export const getMovementClassification = (itemOrId) => {
  if (!itemOrId) return 'basic';
  const id = typeof itemOrId === 'string' ? itemOrId : (itemOrId.id || '');
  const item = typeof itemOrId === 'object' ? itemOrId : DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);
  if (item?.movement_tier) return item.movement_tier;
  if (item?.classification) {
    if (item.classification === 'basic') return 'basic';
    if (item.classification === 'advanced') return 'advanced';
    if (item.classification === 'adjuster' || item.classification === 'modifier') return 'modifier';
    if (item.classification === 'pace' || item.classification === 'stage') return 'stage';
  }
  if (id.startsWith('species_movement-')) {
    const adv = ['species_movement-flight', 'species_movement-flight-basic', 'species_movement-swimming', 'species_movement-climbing', 'species_movement-burrowing', 'species_movement-flicker'];
    return adv.includes(id) ? 'advanced' : 'basic';
  }
  if (id.startsWith('movement-')) {
    return 'modifier';
  }
  if (id.startsWith('pace-')) {
    return 'stage';
  }
  return 'basic';
};

export const getMovementClassificationOrderIndex = (itemOrId) => {
  const cls = getMovementClassification(itemOrId);
  const idx = MOVEMENT_CLASSIFICATION_ORDER.indexOf(cls);
  return idx === -1 ? 99 : idx;
};
`;

  fs.writeFileSync(targetFile, jsCode, 'utf8');
  console.log(`Synced ${compiledAll.length} movement entries in ${targetFile}`);
}

syncMovement();
