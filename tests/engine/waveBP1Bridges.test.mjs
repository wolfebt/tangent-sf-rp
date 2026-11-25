/**
 * @file waveBP1Bridges.test.mjs
 * @description Wave B (P1) Node Engine & Cross-System Bridge Regression Suite:
 *   1. formatCronicleContextForAIME includes workingMemory.ephemeralNotes, calendar.currentDate, and enforces maxTokens budgets
 *   2. resolveSchemaFieldValue resolves primary keys and falls back across aliasKeys
 *   3. pullElementFromOmnicortexDBM projects via projectOmnicortexRecordToAdeElement
 *   4. parseElementMarkdown maps Faction/Scene/Species/Metaphysics canonical schema keys
 *   5. customElementTemplateService saves/applies/deletes rich templates (content, guidance, assetHub, customFields, imageUrl, subcategories)
 *   6. PagedPdfCompiler & DocumentExporters honor selective section flags & printLayout
 *   7. VttModuleCompilerService scopes Personas to scenario/map links & compiles interactive Property/Hazard objects
 *   8. createDeltaFromCombatEvent routes stage-hazard-toggled to active location or timeline fallback
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { formatCronicleContextForAIME } from '../../src/services/cronicleService.js';
import { createDeltaFromCombatEvent } from '../../src/services/cronicleVttBridge.js';
import { resolveSchemaFieldValue } from '../../src/pages/Foundry/ElementForge/elementSchemas.js';
import { pullElementFromOmnicortexDBM } from '../../src/utils/storyAssetAdapter.js';
import { parseElementMarkdown } from '../../src/services/elementIngestionService.js';
import {
  saveCustomTemplate,
  applyCustomTemplate,
  deleteCustomTemplate
} from '../../src/services/customElementTemplateService.ts';
import { PagedPdfCompiler } from '../../src/engine/compilers/PagedPdfCompiler.ts';
import { compileToEpubBytes, compileToRtfString } from '../../src/engine/compilers/DocumentExporters.ts';
import { VttModuleCompilerService } from '../../src/services/vttModuleCompilerService.js';

test('1. formatCronicleContextForAIME includes ephemeralNotes, calendar.currentDate, and enforces maxTokens budget', () => {
  const longNote = 'Signal spike in orbital relay. '.repeat(80);
  const cronicle = {
    workingMemory: {
      immediateObjective: 'Reach Airlock 4',
      activeLocationId: 'loc_1',
      activePersonaIds: ['per_1'],
      ephemeralNotes: longNote
    },
    calendar: {
      currentDate: { eraName: 'AE', year: 412, month: 6, day: 19 }
    },
    locations: {
      loc_1: {
        name: 'Reactor Pier',
        current_geospatial_state: 'depressurized',
        environmental_hazards: ['hard_vacuum']
      }
    },
    personas: {
      per_1: {
        name: 'Commander Vale',
        role_in_story: 'Ally',
        current_condition_or_status: 'injured',
        relationship_to_party: 4
      }
    },
    timeline: Array.from({ length: 15 }, (_, i) => ({
      timestamp: `2026-01-01T00:0${i}:00Z`,
      summary: `Event #${i}: `.repeat(15)
    }))
  };

  const formatted = formatCronicleContextForAIME(cronicle, { maxTokens: 250 });
  assert.ok(formatted.includes('AE Year 412, Month 6, Day 19'));
  assert.ok(formatted.includes('WORKING MEMORY NOTES:'));
  assert.ok(formatted.includes('budget capped'));
});

test('2. createDeltaFromCombatEvent targets activeLocationId on stage-hazard-toggled and falls back to timeline', () => {
  const withLocation = createDeltaFromCombatEvent('stage-hazard-toggled', {
    objectId: 'haz_vent_1',
    hazardType: 'toxic_plasma',
    isActive: true,
    locationId: 'loc_dock_7'
  });
  assert.equal(withLocation.action, 'add_hazard');
  assert.equal(withLocation.entityId, 'loc_dock_7');

  const withoutLocation = createDeltaFromCombatEvent('stage-hazard-toggled', {
    objectId: 'haz_vent_2',
    hazardType: 'cryo_leak',
    isActive: false
  });
  assert.equal(withoutLocation.action, 'add_timeline_event');
  assert.equal(withoutLocation.entityId, 'haz_vent_2');
});

test('3. resolveSchemaFieldValue resolves primary key or aliasKeys cleanly', () => {
  assert.equal(
    resolveSchemaFieldValue({ summary: 'Fallback summary', oneLinePitch: 'Canonical pitch' }, { key: 'oneLinePitch', aliasKeys: ['summary'] }),
    'Canonical pitch'
  );
  assert.equal(
    resolveSchemaFieldValue({ summary: 'Legacy summary' }, { key: 'oneLinePitch', aliasKeys: ['summary'] }),
    'Legacy summary'
  );
});

test('4. pullElementFromOmnicortexDBM projects canonical Schema & Cortex fields', () => {
  const dbData = {
    species: [
      {
        id: 'sp_kitin',
        name: 'Kitin',
        parent_species: 'Genomatrix Collective',
        physiologyBiology: 'Chitinous four-armed hive scouts',
        homeworld: 'Vespera Prime',
        tech_level: 3
      }
    ]
  };
  const updated = pullElementFromOmnicortexDBM(
    { id: 'elem_1', type: 'Species', title: 'Kitin', dbmId: 'sp_kitin', dbmCategory: 'species', fields: { customTag: 'keep' } },
    dbData
  );
  assert.ok(updated);
  assert.equal(updated.dbmSyncStatus, 'synced');
  assert.equal(updated.fields.speciesName, 'Kitin');
  assert.equal(updated.fields.physicalDescription, 'Chitinous four-armed hive scouts');
  assert.equal(updated.fields.habitatOrigin, 'Vespera Prime');
  assert.equal(updated.fields.customTag, 'keep');
});

test('5. parseElementMarkdown aligns Faction and Scene labels with canonical ELEMENT_SCHEMAS keys', () => {
  const factionMd = `# Red Syndicate\n\n## Faction Development Fields\n* **Faction Name**: Red Syndicate\n* **Military Doctrine**: Rapid boarding frigates\n* **Foreign Relations**: Hostile to Combine\n* **Government Type**: Corporate Junta`;
  const parsedFaction = parseElementMarkdown(factionMd);
  assert.equal(parsedFaction.type, 'Faction');
  assert.equal(parsedFaction.fields.military_doctrine, 'Rapid boarding frigates');
  assert.equal(parsedFaction.fields.alliesEnemies, 'Hostile to Combine');
  assert.equal(parsedFaction.fields.government, 'Corporate Junta');

  const sceneMd = `# Dock Breach\n\n## Scene Development Fields\n* **Scene Title**: Dock Breach\n* **Mood & Atmosphere**: Claustrophobic alarms\n* **Tactical Beats**: 1. Cut seal 2. Neutralize sentries\n* **Read-Aloud Narration**: Frost lines the airlock gasket.`;
  const parsedScene = parseElementMarkdown(sceneMd);
  assert.equal(parsedScene.type, 'Scene');
  assert.equal(parsedScene.fields.moodAtmosphere, 'Claustrophobic alarms');
  assert.equal(parsedScene.fields.sceneBeats, '1. Cut seal 2. Neutralize sentries');
  assert.equal(parsedScene.fields.readAloud, 'Frost lines the airlock gasket.');
});

test('6. customElementTemplateService preserves content, guidance, assetHub, customFields, imageUrl & deletes cleanly', () => {
  const saved = saveCustomTemplate({
    id: 'tpl_plasma_blade',
    name: 'Plasma Blade Template',
    type: 'Property',
    content: '<p>Thermal plasma emitter.</p>',
    imageUrl: 'https://cdn.tangent.test/blade.webp',
    guidance: { genre: 'Cyberpunk', tone: 'Gritty' },
    assetHub: [{ assetId: 'rel_1', note: 'Syndicate issue' }],
    customFields: [{ id: 'cf_1', label: 'Cell Charge', value: '12 shots' }],
    attributes: { propertySubcategory: 'weaponry', itemCategory: 'weaponry', damage: '3d6 Plasma' },
    tags: ['melee']
  }, { id: 'story_tpl_test' });

  assert.equal(saved.template.content, '<p>Thermal plasma emitter.</p>');
  const applied = applyCustomTemplate(saved.template, {
    type: 'Property',
    attributes: { propertySubcategory: 'gear', itemCategory: 'gear' }
  });
  assert.equal(applied.attributes.propertySubcategory, 'weaponry');
  assert.equal(applied.content, '<p>Thermal plasma emitter.</p>');
  assert.equal(applied.guidance.genre, 'Cyberpunk');
  assert.equal(applied.assetHub.length, 1);
  assert.equal(applied.customFields.length, 1);
  assert.equal(applied.imageUrl, 'https://cdn.tangent.test/blade.webp');

  const remaining = deleteCustomTemplate('tpl_plasma_blade', { id: 'story_tpl_test' });
  assert.ok(!remaining.some(t => t.id === 'tpl_plasma_blade'));
});

test('7. PagedPdfCompiler & DocumentExporters honor selective section flags & novel printLayout', () => {
  const nodes = [
    {
      id: 'sc_1',
      title: 'Orbital Pier',
      summary: 'High-orbit stealth insertion.',
      content: '<p>Main prose paragraph here.</p>',
      fields: {
        readAloud: 'Boxed sensory briefing.',
        bulletPoints: ['Beat Alpha', 'Beat Beta'],
        threats: [{ name: 'Void Drone', tier: 'T-2', hp: 25, dr: '8', attack: 'Pulse +4' }]
      }
    }
  ];

  const { html } = PagedPdfCompiler.compileToPagedHtml(nodes, {
    includeSynopsis: false,
    includeProse: false,
    includeReadAloud: false,
    includeBeats: false,
    includeStatBlocks: false,
    printLayout: 'novel'
  });
  assert.ok(html.includes('single-column'));
  assert.ok(!html.includes('High-orbit stealth insertion.'));
  assert.ok(!html.includes('Main prose paragraph here.'));
  assert.ok(!html.includes('Boxed sensory briefing.'));
  assert.ok(!html.includes('Beat Alpha'));
  assert.ok(!html.includes('Void Drone'));

  const rtf = compileToRtfString(nodes, { includeProse: false, includeReadAloud: false });
  assert.ok(!rtf.includes('Main prose paragraph here.'));
  assert.ok(!rtf.includes('Boxed sensory briefing.'));

  const epubBytes = compileToEpubBytes(nodes, { includeSynopsis: false, includeStatBlocks: false });
  assert.ok(epubBytes instanceof Uint8Array && epubBytes.length > 100);
});

test('8. VttModuleCompilerService scopes Personas to scenario links and compiles interactive Property/Hazard objects', () => {
  const compiler = new VttModuleCompilerService();
  const { package: pkg } = compiler.compileScenarioForVtt({
    scenario: {
      id: 'sc_vault',
      title: 'Precursor Vault',
      linkedElements: ['per_linked', 'prop_console', 'haz_laser'],
      fields: {}
    },
    activeMap: { id: 'map_v', title: 'Vault Floor', tokens: [], objects: [], walls: [] },
    elementsCatalog: [
      { id: 'per_linked', title: 'Captain Sol', type: 'Persona', fields: { mcmTier: '3' } },
      { id: 'per_unlinked', title: 'Unrelated Baker', type: 'Persona', fields: { mcmTier: '1' } },
      { id: 'prop_console', title: 'Vault Console', type: 'Property', fields: { interactiveType: 'terminal', vttInteractionDC: '15' } },
      { id: 'haz_laser', title: 'Plasma Tripwire', type: 'Hazard', fields: { hazardCr: '16', isTrap: true } }
    ],
    operatorSafe: false
  });

  assert.ok(pkg.map.tokens.some(t => t.storyElementId === 'per_linked'));
  assert.ok(!pkg.map.tokens.some(t => t.storyElementId === 'per_unlinked'));
  assert.ok(pkg.map.objects.some(o => o.storyElementId === 'prop_console' && o.type === 'terminal' && o.dc === 15));
  assert.ok(pkg.map.objects.some(o => o.storyElementId === 'haz_laser' && o.isTrap === true));

  const { package: safePkg } = compiler.compileScenarioForVtt({
    scenario: { id: 'sc_vault', title: 'Precursor Vault', linkedElements: ['prop_console', 'haz_laser'] },
    activeMap: { id: 'map_v', title: 'Vault Floor', tokens: [], objects: [], walls: [] },
    elementsCatalog: [
      { id: 'prop_console', title: 'Vault Console', type: 'Property', fields: { interactiveType: 'terminal' } },
      { id: 'haz_laser', title: 'Plasma Tripwire', type: 'Hazard', fields: { hazardCr: '16', isTrap: true } }
    ],
    operatorSafe: true
  });
  assert.ok(safePkg.map.objects.some(o => o.storyElementId === 'prop_console'));
  assert.ok(!safePkg.map.objects.some(o => o.storyElementId === 'haz_laser'));
});
