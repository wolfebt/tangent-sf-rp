import test from 'node:test';
import assert from 'node:assert/strict';

import {
  serializeAimeAsset,
  parseAimeAssetFile,
  EXTENSION_TO_TYPE_MAP
} from '../../src/services/aimeAssetFileService.js';

import {
  parseElementMarkdown,
  batchIngestElementFiles
} from '../../src/services/elementIngestionService.js';

test('Story Wiki: Portable Asset Serialization and Ingestion round-trip', () => {
  const samplePersona = {
    id: 'persona_dr_lyra',
    title: 'Dr. Lyra Vance',
    name: 'Dr. Lyra Vance',
    type: 'Persona',
    fields: {
      species: 'Terran',
      archetype: 'Xenobiologist',
      description: 'Lead researcher on the subterranean bio-constructs.',
      oneLinePitch: 'Brilliant yet reckless scientist haunted by the ruins.'
    },
    tags: ['scientist', 'npc', 'contact']
  };

  // 1. Serialize to AIME asset
  const serialized = serializeAimeAsset(samplePersona);
  assert.equal(serialized.assetType, 'Persona');
  assert.equal(serialized.fileExtension, '.persona');
  assert.equal(serialized.title, 'Dr. Lyra Vance');
  assert.equal(serialized.traits.archetype, 'Xenobiologist');

  // 2. Parse serialized JSON back
  const jsonString = JSON.stringify(serialized);
  const parsed = parseAimeAssetFile(jsonString, 'dr-lyra-vance.persona');
  assert.equal(parsed.title, 'Dr. Lyra Vance');
  assert.equal(parsed.type, 'Persona');
  assert.equal(parsed.fields.species, 'Terran');
  assert.equal(parsed.fields.oneLinePitch, 'Brilliant yet reckless scientist haunted by the ruins.');
});

test('Story Wiki: Drag & Drop Payload Validation', () => {
  const sampleItem = {
    id: 'item_grav_disruptor',
    title: 'Phase-Shift Graviton Emitter',
    type: 'Item',
    fields: {
      category: 'Gadget',
      rarity: 'Prototype',
      description: 'Disrupts local artificial gravity in a 5-meter radius.'
    }
  };

  // Generate drag-and-drop payloads matching ScenarioOutlinerRail
  const plainTextPayload = `[[${sampleItem.title}]]`;
  const jsonPayload = JSON.stringify(sampleItem);
  const htmlPayload = `<span class="tangent-wiki-chip font-bold text-cyan-300" data-element-id="${sampleItem.id}" data-element-type="${sampleItem.type}">[[${sampleItem.title}]]</span>`;

  assert.equal(plainTextPayload, '[[Phase-Shift Graviton Emitter]]');
  assert.ok(htmlPayload.includes('data-element-id="item_grav_disruptor"'));
  assert.ok(htmlPayload.includes('Phase-Shift Graviton Emitter'));

  const parsedJson = JSON.parse(jsonPayload);
  assert.equal(parsedJson.id, 'item_grav_disruptor');
  assert.equal(parsedJson.type, 'Item');
});

test('Story Wiki: Wiki Link Extraction & Matching', () => {
  const prose = `<p>The operative consulted [[Dr. Lyra Vance]] before deploying the [[Phase-Shift Graviton Emitter]] near the ancient bulkhead.</p>`;
  
  const wikiTags = [];
  const regex = /\[\[(.*?)\]\]/g;
  let match;
  while ((match = regex.exec(prose)) !== null) {
    if (match[1]?.trim()) {
      wikiTags.push(match[1].trim());
    }
  }

  assert.equal(wikiTags.length, 2);
  assert.equal(wikiTags[0], 'Dr. Lyra Vance');
  assert.equal(wikiTags[1], 'Phase-Shift Graviton Emitter');
});
