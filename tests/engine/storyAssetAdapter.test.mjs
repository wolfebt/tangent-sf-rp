/**
 * @file storyAssetAdapter.test.mjs
 * @description Unit Test Suite for ADE Story Asset Adapter (storyAssetAdapter.js).
 * Validates bidirectional transformation of narrative story components into:
 * 1. Stage VTT Tokens (biological vs synthetic vitals, armor/stamina DR)
 * 2. Stage Interactive Scene Objects (terminals, caches, doors, traps)
 * 3. Folio Operative Inventory Items (category resolution, TL, CP costs)
 * 4. Canonical Omnicortex DBM Documents (bestiary, weaponry, armoring, factions)
 * 5. Omnicortex DBM context synchronization
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adeElementToStageToken,
  adeElementToInteractiveObject,
  adeElementToFolioItem,
  adeElementToOmnicortexDoc,
  syncElementToOmnicortexDBM,
  pullElementFromOmnicortexDBM
} from '../../src/utils/storyAssetAdapter.js';

test('storyAssetAdapter: null/undefined safety', () => {
  assert.equal(adeElementToStageToken(null), null);
  assert.equal(adeElementToInteractiveObject(null), null);
  assert.equal(adeElementToFolioItem(null), null);
  assert.equal(adeElementToOmnicortexDoc(null), null);
  assert.equal(syncElementToOmnicortexDBM(null, {}), false);
  assert.equal(syncElementToOmnicortexDBM({}, null), false);
});

test('adeElementToStageToken: Biological Persona normalization', () => {
  const bioElement = {
    id: 'elem_operative_jax',
    title: 'Jax Vance',
    type: 'Persona',
    content: 'Veteran void marine operative.',
    fields: {
      species: 'Human',
      archetype: 'Soldier',
      health: '35',
      vitality: '25',
      armor_dr: '8',
      stamina_dr: '3',
      speed: '35',
      attacks: [{ name: 'Kinetic Carbine', damage: '2d10+4', range: 'Medium' }]
    }
  };

  const token = adeElementToStageToken(bioElement, { x: 100, y: 150 });
  assert.ok(token);
  assert.equal(token.character_doc_id, 'elem_operative_jax');
  assert.equal(token.name, 'Jax Vance');
  assert.equal(token.base_health, 35);
  assert.equal(token.base_vitality, 25);
  assert.equal(token.armor_dr, 8);
  assert.equal(token.stamina_dr, 3);
  assert.equal(token.is_synthetic, false);
  assert.equal(token.speed_ft, 35);
  assert.equal(token.x, 100);
  assert.equal(token.y, 150);
  assert.equal(token.attacks.length, 1);
  assert.equal(token.adeStoryElementId, 'elem_operative_jax');
});

test('adeElementToStageToken: Synthetic/Droid normalization', () => {
  const synthElement = {
    id: 'elem_combat_droid_mk4',
    title: 'Combat Droid MK-IV',
    type: 'Persona',
    fields: {
      species: 'Synthetic Chassis',
      structure: '75',
      armor_dr: '12',
      stamina_dr: '0'
    }
  };

  const token = adeElementToStageToken(synthElement);
  assert.ok(token);
  assert.equal(token.is_synthetic, true);
  assert.equal(token.base_structure, 75);
  assert.equal(token.armor_dr, 12);
  assert.equal(token.stamina_dr, 0);
  assert.equal(token.species, 'Synthetic Chassis');
});

test('adeElementToInteractiveObject: Item maps to loot cache with payload', () => {
  const itemElement = {
    id: 'elem_cache_crate',
    title: 'Encrypted Supply Cache',
    type: 'Item',
    content: 'Contains prototype pulse rifles.',
    fields: {
      itemCategory: 'weaponry',
      structure: '30',
      hackDc: '15'
    }
  };

  const obj = adeElementToInteractiveObject(itemElement, { x: 200, y: 200 });
  assert.ok(obj);
  assert.equal(obj.type, 'loot_cache');
  assert.equal(obj.objectType, 'loot_cache');
  assert.equal(obj.structure, 30);
  assert.equal(obj.hackDc, 15);
  assert.equal(obj.lootPayload.length, 1);
  assert.equal(obj.lootPayload[0].name, 'Encrypted Supply Cache');
  assert.equal(obj.lootPayload[0].category, 'weapons');
});

test('adeElementToInteractiveObject: Hazard maps to trap emitter', () => {
  const hazardElement = {
    id: 'elem_plasma_vent',
    title: 'Thermal Plasma Vent',
    type: 'Hazard',
    fields: {
      saveCr: '16',
      damageDice: '3d10+5',
      appliedCondition: 'Burning'
    }
  };

  const obj = adeElementToInteractiveObject(hazardElement);
  assert.ok(obj);
  assert.equal(obj.isTrap, true);
  assert.equal(obj.saveCr, 16);
  assert.equal(obj.damageDice, '3d10+5');
  assert.equal(obj.appliedCondition, 'Burning');
});

test('adeElementToFolioItem: Categorization and cost evaluation', () => {
  const weaponElem = {
    id: 'elem_plasma_lance',
    title: 'Plasma Lance',
    type: 'Item',
    fields: {
      itemCategory: 'Weaponry',
      damageDice: '2d10+6',
      'tech-level': '4',
      cost_cp: '15',
      weight: '4.5'
    }
  };

  const folioItem = adeElementToFolioItem(weaponElem);
  assert.ok(folioItem);
  assert.equal(folioItem.category, 'weapons');
  assert.equal(folioItem.damage, '2d10+6');
  assert.equal(folioItem.techLevel, 4);
  assert.equal(folioItem.cp, 15);
  assert.equal(folioItem.weight, 4.5);
  assert.equal(folioItem.source, 'ADE Story Foundry');
});

test('adeElementToOmnicortexDoc: Correct compendium category routing', () => {
  const personaDoc = adeElementToOmnicortexDoc({ type: 'Persona', title: 'Archon Malor' });
  assert.equal(personaDoc.category, 'bestiary');
  assert.equal(personaDoc.document.name, 'Archon Malor');

  const factionDoc = adeElementToOmnicortexDoc({ type: 'Faction', title: 'Dracon Dynasty' });
  assert.equal(factionDoc.category, 'factions');

  const armorDoc = adeElementToOmnicortexDoc({
    type: 'Item',
    title: 'Composite Weave',
    fields: { itemCategory: 'Armoring' }
  });
  assert.equal(armorDoc.category, 'armoring');
});

test('syncElementToOmnicortexDBM: Calls DBMContext saveItem cleanly', () => {
  let savedCategory = null;
  let savedDoc = null;

  const mockDbm = {
    saveItem: (cat, doc) => {
      savedCategory = cat;
      savedDoc = doc;
    }
  };

  const element = {
    id: 'elem_celestine_envoy',
    type: 'Species',
    title: 'Celestine Aeld',
    fields: { origin: 'Solar Citadel' }
  };

  const success = syncElementToOmnicortexDBM(element, mockDbm);
  assert.equal(success, true);
  assert.equal(savedCategory, 'species');
  assert.equal(savedDoc.name, 'Celestine Aeld');
  assert.equal(savedDoc.source, 'ADE Studio');
});

test('pullElementFromOmnicortexDBM: null/unlinked safety', () => {
  assert.equal(pullElementFromOmnicortexDBM(null, {}), null);
  assert.equal(pullElementFromOmnicortexDBM({}, null), null);
  assert.equal(pullElementFromOmnicortexDBM({ title: 'Unlinked' }, { weaponry: [] }), null);
});

test('pullElementFromOmnicortexDBM: pulls canonical record updates from DBM container', () => {
  const mockDbData = {
    weaponry: [
      {
        id: 'plasma-carbine-mk2',
        name: 'Plasma Carbine MK-II',
        description: 'Military-grade high energy plasma emitter with dual heat sinks.',
        damage: '3d10+6',
        range: 'Long',
        techLevel: 'TL-4'
      }
    ],
    factions: [
      {
        id: 'dracon-syndicate',
        name: 'Dracon Syndicate',
        concept: 'Underground cybernetic smuggling cartel.'
      }
    ]
  };

  const storyElement = {
    id: 'elem_old_plasma',
    title: 'Plasma Carbine',
    content: 'An older pulse rifle.',
    fields: {
      dbmRef: 'plasma-carbine-mk2',
      dbmCategory: 'weaponry'
    }
  };

  const updated = pullElementFromOmnicortexDBM(storyElement, mockDbData);
  assert.ok(updated);
  assert.equal(updated.title, 'Plasma Carbine MK-II');
  assert.equal(updated.content, 'Military-grade high energy plasma emitter with dual heat sinks.');
  assert.equal(updated.dbmSyncStatus, 'synced');
  assert.ok(updated.dbmLastSyncedAt);
  assert.equal(updated.fields.damage, '3d10+6');
  assert.equal(updated.fields.techLevel, 'TL-4');
  assert.equal(updated.fields.dbmRef, 'plasma-carbine-mk2');
});
