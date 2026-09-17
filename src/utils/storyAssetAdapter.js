/**
 * @file storyAssetAdapter.js
 * @description Master bidirectional adapter for ADE Story Components, The Stage VTT assets,
 * Folio Operative inventories, and canonical Omnicortex DBM collections.
 */

import { v4 as uuidv4 } from 'uuid';
import { OBJECT_TYPES } from '../services/interactiveObjectService';
import { TRAP_TYPES } from '../services/reactiveVttService';

/**
 * Normalizes an ADE story component element into a Stage VTT Token / Static Entity.
 * Used when deploying Personas, NPCs, or Bestiary units onto the map.
 */
export function adeElementToStageToken(element, position = { x: 350, y: 350 }) {
  if (!element) return null;

  const fields = element.fields || {};
  const isSyn = String(fields['char-species'] || fields.species || '').toLowerCase().includes('synthetic') ||
                String(element.title || '').toLowerCase().includes('droid') ||
                String(element.title || '').toLowerCase().includes('mech');

  const health = parseInt(fields.health || fields['base-hp'] || fields.hp || 30, 10);
  const vitality = parseInt(fields.vitality || 30, 10);
  const structure = parseInt(fields.structure || (isSyn ? 60 : 30), 10);
  const armorDr = parseInt(fields.armor_dr || fields.dr || 6, 10);
  const staminaDr = parseInt(fields.stamina_dr || 2, 10);

  const attacks = Array.isArray(fields.attacks) ? fields.attacks : [];

  return {
    id: `token-${element.id || uuidv4()}-${Date.now()}`,
    character_doc_id: element.id,
    name: element.title || element.name || 'Operative Asset',
    image_url: element.imageUrl || element.image || null,
    icon: element.icon || (element.type === 'Persona' ? '🧙‍♂️' : '👾'),
    base_hp: health,
    base_vitality: vitality,
    base_health: health,
    base_structure: structure,
    current_hp: health,
    current_vitality: vitality,
    current_structure: structure,
    is_synthetic: isSyn,
    tech_level: parseInt(fields['tech-level'] || fields.techLevel || 3, 10),
    armor_dr: armorDr,
    stamina_dr: staminaDr,
    size_modifier: 0,
    speed_ft: parseInt(fields.speed || 30, 10),
    species: fields['char-species'] || fields.species || (isSyn ? 'Synthetic' : 'Human'),
    archetype: fields['char-concept'] || fields.archetype || 'Operative',
    is_persona: element.type === 'Persona',
    role: fields.role || 'Combatant',
    attacks,
    adeStoryElementId: element.id,
    storySummary: element.content || fields.summary || '',
    dialogueHook: fields.plotHooks || fields.dialogue || element.content || '',
    x: position.x,
    y: position.y
  };
}

/**
 * Normalizes an ADE story component element into a Stage Interactive Scene Object.
 * Used for Smart Props (terminals, bulkheads, caches, power nodes, clues, hazards).
 */
export function adeElementToInteractiveObject(element, position = { x: 400, y: 300 }) {
  if (!element) return null;

  const fields = element.fields || {};
  const elemType = element.type || 'Custom';
  let objectType = 'security_terminal';
  let icon = '💻';

  if (elemType === 'Item') {
    objectType = 'loot_cache';
    icon = '📦';
  } else if (elemType === 'Clue' || elemType === 'Handout') {
    objectType = 'clue_pad';
    icon = '📜';
  } else if (elemType === 'Encounter' || elemType === 'Hazard') {
    objectType = 'trap_emitter';
    icon = '⚠️';
  } else if (fields.propType) {
    objectType = fields.propType;
  }

  const baseConfig = OBJECT_TYPES[objectType] || OBJECT_TYPES.security_terminal;

  return {
    id: `obj-${element.id || uuidv4()}-${Date.now()}`,
    name: element.title || 'Interactive Node',
    label: element.title || 'Interactive Node',
    type: objectType,
    objectType,
    icon: element.icon || icon || baseConfig.icon,
    x: position.x,
    y: position.y,
    width: 60,
    height: 60,
    structure: parseInt(fields.structure || baseConfig.maxStructure || 20, 10),
    maxStructure: parseInt(fields.structure || baseConfig.maxStructure || 20, 10),
    hackDc: parseInt(fields.hackDc || baseConfig.hackDc || 13, 10),
    strengthDc: parseInt(fields.strengthDc || baseConfig.strengthDc || 16, 10),
    clueText: fields.information || fields.conclusion || element.content || '',
    description: element.content || fields.description || baseConfig.description || '',
    doorState: objectType === 'blast_door' ? 'closed' : undefined,
    isHacked: false,
    adeStoryElementId: element.id,
    lootPayload: elemType === 'Item' ? [adeElementToFolioItem(element)] : (fields.lootPayload || []),
    // Reactive hazard attributes if applicable
    isTrap: elemType === 'Hazard' || !!fields.isTrap,
    trapType: fields.trapType || 'proximity_plasma_mine',
    saveCr: parseInt(fields.saveCr || 14, 10),
    damageDice: fields.damageDice || '2d10',
    baseDamage: parseInt(fields.baseDamage || 15, 10),
    appliedCondition: fields.appliedCondition || 'Burning'
  };
}

/**
 * Normalizes an ADE story component element into a Folio-compatible inventory item.
 * Used when an operative persona loots or picks up an item from the stage.
 */
export function adeElementToFolioItem(element) {
  if (!element) return null;

  const fields = element.fields || {};
  const rawCat = (fields.itemCategory || fields.category || 'gear').toLowerCase();

  let targetCategory = 'gear';
  if (['weapon', 'weapons', 'weaponry'].includes(rawCat)) {
    targetCategory = 'weapons';
  } else if (['armor', 'armoring', 'shield', 'shields'].includes(rawCat)) {
    targetCategory = 'armoring';
  } else if (['mecha', 'vehicle'].includes(rawCat)) {
    targetCategory = 'mecha';
  }

  const cp = parseInt(fields.cost_cp || fields.cp || fields.cost || 5, 10);
  const tl = parseInt(fields['tech-level'] || fields.techLevel || fields.tl || 3, 10);

  return {
    id: element.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: element.title || element.name || 'Omnicortex Artifact',
    category: targetCategory,
    categoryKey: targetCategory,
    damage: fields.damage || fields.damageDice || (targetCategory === 'weapons' ? '2d10+2' : ''),
    score: fields.attackScore || fields.score || '+4',
    armor: parseInt(fields.armor_dr || fields.armor || (targetCategory === 'armoring' ? 6 : 0), 10),
    resistance: parseInt(fields.resistance || fields.armor_dr || 0, 10),
    weight: parseFloat(fields.weight || fields.wt || 1),
    techLevel: tl,
    cp,
    cost: cp,
    rarity: fields.rarity || 'Field Issue',
    description: element.content || fields.properties || fields.description || '',
    notes: fields.mechanic || fields.history || '',
    adeStoryElementId: element.id,
    source: 'ADE Story Foundry'
  };
}

/**
 * Converts an ADE element into an Omnicortex DBM document format.
 */
export function adeElementToOmnicortexDoc(element) {
  if (!element) return null;

  const fields = element.fields || {};
  let category = 'gear';

  if (element.type === 'Persona') {
    category = 'bestiary';
  } else if (element.type === 'Faction') {
    category = 'factions';
  } else if (element.type === 'Species') {
    category = 'species';
  } else if (element.type === 'Clue' || element.type === 'Handout' || element.type === 'Philosophy') {
    category = 'compendium';
  } else if (element.type === 'Item') {
    const raw = (fields.itemCategory || '').toLowerCase();
    if (raw.includes('weapon')) category = 'weaponry';
    else if (raw.includes('armor')) category = 'armoring';
    else category = 'gear';
  }

  return {
    category,
    document: {
      id: element.id || `omni_${Date.now()}`,
      name: element.title || 'Omnicortex Entity',
      body: element.content || '',
      description: element.content || fields.summary || '',
      ...fields,
      source: 'ADE Studio'
    }
  };
}

/**
 * Saves or updates an ADE element into Omnicortex DBM via DBMContext.
 */
export function syncElementToOmnicortexDBM(element, dbmContext) {
  if (!element || !dbmContext || typeof dbmContext.saveItem !== 'function') return false;

  const mapped = adeElementToOmnicortexDoc(element);
  if (!mapped) return false;

  dbmContext.saveItem(mapped.category, mapped.document);
  return true;
}
