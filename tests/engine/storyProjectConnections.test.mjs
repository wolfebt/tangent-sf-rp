/**
 * @file storyProjectConnections.test.mjs
 * @description Wave SP-5 Node Engine & Service Regression Suite covering Story Project <-> Elements
 * Usability & Connections across Waves SP-1 through SP-4:
 *   1. Project-scoped StoryFlags (`useADEStore.setStoryScope`) & Custom Template isolation
 *   2. OmniCortex bridge protection against Scenario node writes (`resolveTargetCortexCollection`)
 *   3. Standalone module snapshots (`buildModulePackagePayload`, `buildSanitizedOperatorPackagePayload`, `hydrateModuleIntoCampaign`)
 *   4. Lorebook Scanner (`scanDynamicLorebook`) & SuperPrompt (`synthesizeSuperPrompt`) operator GM secret suppression + Property/Metaphysics + assetHub
 *   5. Scratchbook (`findElementsUsed`, `generateStoryScratchbook`) operator-safe secret stripping & assetHub parity
 *   6. Hyperlink Resolver (`resolveHyperlinkTarget`) alias, pipe, scenario chapter & operatorSafe filtering
 *   7. Asset Graph (`classifyAssetCategory`, `extractConfirmedConnections`) taxonomy + pipe syntax + assetHub parity
 *   8. PDF / EPUB / RTF Compilers (`PagedPdfCompiler`, `compileToEpubBytes`, `compileToRtfString`) hiding hidden/GM-only nodes
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { useADEStore } from '../../src/pages/Foundry/store/adeStore.ts';
import { listCustomTemplates, saveCustomTemplate } from '../../src/services/customElementTemplateService.ts';
import { resolveTargetCortexCollection, consolidateAdeElementToCortexPayload } from '../../src/utils/cortexAdeAssetBridge.js';
import { convertPersonaElementToFolio } from '../../src/utils/personaBridge.js';
import {
  buildModulePackagePayload,
  buildSanitizedOperatorPackagePayload,
  hydrateModuleIntoCampaign
} from '../../src/services/modulePackageService.js';
import { scanDynamicLorebook } from '../../src/services/lorebookScanner.ts';
import { synthesizeSuperPrompt } from '../../src/services/superPromptSynthesizer.js';
import { findElementsUsed, generateStoryScratchbook } from '../../src/pages/Foundry/StoryModule/scratchbookService.js';
import { resolveHyperlinkTarget } from '../../src/services/hyperlinkResolver.js';
import { buildCatalogAssets, classifyAssetCategory, extractConfirmedConnections } from '../../src/pages/Foundry/Weaver/tabs/assetGraphUtils.js';
import { PagedPdfCompiler } from '../../src/engine/compilers/PagedPdfCompiler.ts';
import { compileToEpubBytes, compileToRtfString } from '../../src/engine/compilers/DocumentExporters.ts';
import { applyCronicleDelta } from '../../src/services/cronicleService.js';
import { VttModuleCompilerService } from '../../src/services/vttModuleCompilerService.js';
import { aggregateModuleAssets } from '../../src/pages/Foundry/PresetsAndScripts/utils/assetAggregator.js';

test('1. useADEStore scopes storyFlags per project & customElementTemplateService isolates localStorage by story id', () => {
  const store = useADEStore.getState();
  store.setStoryScope('story_alpha');
  store.setStoryFlag('airlockOpened', true);
  assert.equal(useADEStore.getState().storyFlags.airlockOpened?.value, true);

  store.setStoryScope('story_beta');
  assert.equal(useADEStore.getState().storyFlags.airlockOpened, undefined);
  store.setStoryFlag('reactorCore', 'offline');

  store.setStoryScope('story_alpha');
  assert.equal(useADEStore.getState().storyFlags.airlockOpened?.value, true);
  assert.equal(useADEStore.getState().storyFlags.reactorCore, undefined);

  // Mock localStorage to verify customElementTemplateService scoping
  const mem = new Map();
  const prevStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k)
  };
  try {
    saveCustomTemplate({ id: 'tpl_a', name: 'Alpha Prop', type: 'Property' }, { id: 'story_alpha' });
    saveCustomTemplate({ id: 'tpl_b', name: 'Beta Hazard', type: 'Encounter' }, { id: 'story_beta' });

    const alphaList = listCustomTemplates({ id: 'story_alpha' });
    const betaList = listCustomTemplates({ id: 'story_beta' });
    assert.ok(alphaList.some((t) => t.id === 'tpl_a'));
    assert.ok(!alphaList.some((t) => t.id === 'tpl_b'));
    assert.ok(betaList.some((t) => t.id === 'tpl_b'));
    assert.ok(!betaList.some((t) => t.id === 'tpl_a'));
  } finally {
    if (prevStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = prevStorage;
    }
  }
});

test('2. resolveTargetCortexCollection blocks Scenario nodes from mapping into OmniCortex DBM collections', () => {
  const scenarioNode = {
    id: 'sc_node_1',
    title: 'Airlock Ambush',
    type: 'Encounter',
    isScenarioNode: true,
    dbmSyncStatus: 'standalone'
  };
  assert.equal(resolveTargetCortexCollection(scenarioNode), null);
});

test('3. modulePackageService embeds standalone referencedSnapshots and hydrates them strictly as local read-only snapshots', () => {
  const universeState = {
    id: 'story_standalone_test',
    projectName: 'Orbital Heist',
    scenarios: [
      {
        id: 'sc_public',
        title: 'Docking Bay 4',
        content: '<p>Public docking bay.</p><div class="ade-gm-secret">Secret turret trap</div>',
        linkedElements: ['cortex_wpn_arc'],
        assetHub: [{ assetId: 'folio_pc_kael', name: 'Kael' }]
      },
      {
        id: 'sc_gm_only',
        title: 'Hidden Vault',
        isGmOnly: true,
        content: '<p>Secret GM vault.</p>'
      }
    ],
    maps: [
      {
        id: 'map_bay4',
        title: 'Bay 4 Map',
        tokens: [{ id: 'tok_1', elementId: 'cortex_gm_boss', type: 'enemy', isPlayerVisible: false }],
        waypoints: [{ id: 'wp_1', elementId: 'cortex_wpn_arc', isPlayerVisible: true }]
      }
    ]
  };

  const localElements = [
    { id: 'elem_local_1', title: 'Local Clue', type: 'Clue', content: '<p>Keycard shard</p>' }
  ];

  const unifiedCatalog = [
    ...localElements,
    {
      id: 'cortex_wpn_arc',
      title: 'Arc Pistol',
      type: 'Property',
      isCortexAsset: true,
      isCortexSynced: true,
      cortexCollection: 'weaponry',
      dbmId: 'wpn_arc',
      content: '<p>Standard shock sidearm.</p><p class="ade-gm-secret">Backdoor kill-switch</p>',
      fields: { gmNotes: 'GM only overcharge flaw' }
    },
    {
      id: 'folio_pc_kael',
      title: 'Kael Voss',
      type: 'Persona',
      isFolioExternal: true,
      content: '<p>Chief Engineer.</p>'
    },
    {
      id: 'cortex_gm_boss',
      title: 'Syndicate Director',
      type: 'Persona',
      isGmOnly: true,
      isCortexAsset: true,
      content: '<p>Hidden final boss</p>'
    }
  ];

  // Architect package includes referencedSnapshots with transient external flags stripped
  const architectPkg = buildModulePackagePayload(universeState, localElements, { unifiedCatalog });
  assert.ok(Array.isArray(architectPkg.referencedSnapshots));
  const arcSnap = architectPkg.referencedSnapshots.find((s) => s.id === 'cortex_wpn_arc');
  const kaelSnap = architectPkg.referencedSnapshots.find((s) => s.id === 'folio_pc_kael');
  assert.ok(arcSnap);
  assert.ok(kaelSnap);
  assert.equal(arcSnap.isReadOnlySnapshot, true);
  assert.equal(arcSnap.dbmSyncStatus, 'standalone');
  assert.equal(arcSnap.isPublic, false);
  assert.equal(arcSnap.isCortexSynced, undefined);
  assert.equal(arcSnap.cortexCollection, undefined);
  assert.equal(kaelSnap.isFolioExternal, undefined);

  // Operator package drops GM-only scenarios/snapshots and strips ade-gm-secret + gmNotes
  const operatorPkg = buildSanitizedOperatorPackagePayload(universeState, localElements, { unifiedCatalog });
  assert.equal(operatorPkg.scenarios.length, 1);
  assert.equal(operatorPkg.scenarios[0].id, 'sc_public');
  assert.ok(!operatorPkg.scenarios[0].content.includes('Secret turret trap'));
  assert.ok(Array.isArray(operatorPkg.referencedSnapshots));
  assert.ok(!operatorPkg.referencedSnapshots.some((s) => s.id === 'cortex_gm_boss'));
  const opArcSnap = operatorPkg.referencedSnapshots.find((s) => s.id === 'cortex_wpn_arc');
  assert.ok(opArcSnap);
  assert.equal(opArcSnap.fields.gmNotes, undefined);
  assert.ok(!opArcSnap.content.includes('Backdoor kill-switch'));

  // Hydration imports local elements + referencedSnapshots strictly via addSavedElement
  const imported = [];
  const results = hydrateModuleIntoCampaign(operatorPkg, {
    addSavedElement: (el) => imported.push(el),
    existingElements: []
  });
  assert.equal(results.elementsImported, 1);
  assert.equal(results.snapshotsImported, 2);
  const hydratedArc = imported.find((e) => e.id === 'cortex_wpn_arc');
  assert.ok(hydratedArc);
  assert.equal(hydratedArc.isReadOnlySnapshot, true);
  assert.equal(hydratedArc.dbmSyncStatus, 'standalone');
});

test('4. lorebookScanner & superPromptSynthesizer expand Property/Metaphysics, merge assetHub/mapsCatalog, and strip GM secrets when excludeGmSecrets is true', () => {
  const catalog = [
    {
      id: 'el_prop_1',
      title: 'Aether Coil',
      type: 'Property',
      content: '<p>Resonant power cell.</p><div class="ade-gm-secret">Explodes if shaken</div>',
      fields: {
        keywords: 'coil, cell',
        negative_keywords: 'dud',
        gmNotes: 'Classified reactor leak'
      }
    },
    {
      id: 'el_gm_secret',
      title: 'Black Ops Order',
      type: 'Clue',
      isGmOnly: true,
      content: '<p>Assassin protocol</p>',
      fields: { keywords: 'coil' }
    }
  ];

  const scanRes = scanDynamicLorebook({
    input: 'Inspect the Resonant coil carefully.',
    catalog,
    excludeGmSecrets: true
  });
  assert.ok(scanRes.injectedEntries.some((e) => e.id === 'el_prop_1'));
  assert.ok(!scanRes.injectedEntries.some((e) => e.id === 'el_gm_secret'));
  assert.ok(!scanRes.formattedPromptContext.includes('Explodes if shaken'));
  assert.ok(!scanRes.formattedPromptContext.includes('Classified reactor leak'));

  const synth = synthesizeSuperPrompt({
    activeNode: {
      id: 'sc_1',
      title: 'Reactor Room',
      content: '<p>Engineers check the [Aether Coil] and [Black Ops Order].</p><span class="ade-gm-secret">Sabotage imminent</span>',
      assetHub: [{ assetId: 'el_prop_1', name: 'Aether Coil' }],
      mapId: 'map_rx',
      fields: {
        gmSecrets: 'Reactor kill-code 991',
        summary: 'Orbital cooling sector inspection'
      }
    },
    taskPrompt: 'Inspect the coil and [Black Ops Order].',
    elementsCatalog: catalog,
    mapsCatalog: [{ id: 'map_rx', title: 'Reactor Deck' }],
    excludeGmSecrets: true,
    operatorSafe: true
  });
  assert.equal(typeof synth, 'string');
  assert.ok(synth.length > 0);
  // Positively verify public text IS present so assertions cannot pass vacuously
  assert.ok(synth.includes('Engineers check the [Aether Coil]'));
  assert.ok(synth.includes('Orbital cooling sector inspection'));
  assert.ok(synth.includes('Resonant power cell'));
  // Verify GM secrets are stripped across Layer 2, Layer 3, Lorebook, and Bracket Resolver
  assert.ok(!synth.includes('Sabotage imminent'));
  assert.ok(!synth.includes('Reactor kill-code 991'));
  assert.ok(!synth.includes('Explodes if shaken'));
  assert.ok(!synth.includes('Classified reactor leak'));
  assert.ok(!synth.includes('"Black Ops Order"'));
  assert.ok(!synth.includes('Assassin protocol'));
});

test('5. scratchbookService finds linkedElements+assetHub safely, omits non-element containers, and hides GM secrets in operatorSafe mode', () => {
  const universeState = {
    projectName: 'Station Zero',
    scenarios: [
      {
        id: 'sc_1',
        title: 'Airlock Deck',
        type: 'Encounter',
        content: '<p>Sparks fly.</p><div class="ade-gm-secret">Hidden ambush team</div>',
        assetHub: [{ assetId: 'el_clue_1' }]
      },
      {
        id: 'sc_hidden',
        title: 'GM Backstage',
        isHidden: true,
        content: '<p>Secret GM outline</p>'
      }
    ]
  };
  const catalog = [
    { id: 'el_clue_1', title: 'Hull Weld Marks', type: 'Clue', content: '<p>Cutter traces</p>' },
    { id: 'el_secret_1', title: 'Mole Identity', type: 'Persona', isGmOnly: true, content: '<p>Commander Ray</p>' }
  ];

  const usedOp = findElementsUsed(universeState, catalog, { operatorSafe: true });
  assert.ok(usedOp.some((e) => e.id === 'el_clue_1'));
  assert.ok(!usedOp.some((e) => e.id === 'el_secret_1'));
  assert.ok(!usedOp.some((e) => e.id === 'sc_1')); // Encounter container is not a spurious element card

  const md = generateStoryScratchbook({
    universeState,
    elementsCatalog: catalog,
    operatorSafe: true
  });
  assert.ok(md.includes('Hull Weld Marks'));
  assert.ok(!md.includes('Hidden ambush team'));
  assert.ok(!md.includes('GM Backstage'));
  assert.ok(!md.includes('Mole Identity'));
});

test('6. hyperlinkResolver handles pipe labels, aliases, scenarios, and operatorSafe suppression', () => {
  const elementsCatalog = [
    {
      id: 'el_station',
      title: 'Station Vesper',
      type: 'Location',
      content: '<p>Freeport orbit.</p>',
      fields: { aliases: 'Vesper Hub, Freeport 9' }
    },
    {
      id: 'el_secret_lore',
      title: 'Project Eclipse',
      type: 'Clue',
      isGmOnly: true,
      content: '<p>Classified weapon</p>'
    }
  ];
  const scenarios = [{ id: 'sc_intro', title: 'Docking Sequence', type: 'Chapter' }];

  const aliasHit = resolveHyperlinkTarget('The Freeport|Freeport 9', { elementsCatalog, scenarios });
  assert.equal(aliasHit?.exists, true);
  assert.equal(aliasHit?.rawEntity?.id, 'el_station');

  const explicitPipeHit = resolveHyperlinkTarget('The Old Dock|Vesper Hub', { elementsCatalog, scenarios });
  assert.equal(explicitPipeHit?.exists, true);
  assert.equal(explicitPipeHit?.rawEntity?.id, 'el_station');

  const scenarioHit = resolveHyperlinkTarget('Chapter: Docking Sequence', { elementsCatalog, scenarios });
  assert.equal(scenarioHit?.exists, true);
  assert.equal(scenarioHit?.targetType, 'scenario');
  assert.equal(scenarioHit?.rawEntity?.id, 'sc_intro');

  const secretBlocked = resolveHyperlinkTarget('Project Eclipse', {
    elementsCatalog,
    scenarios,
    operatorSafe: true
  });
  assert.equal(secretBlocked?.exists, false);
});

test('7. assetGraphUtils classifies Property/Metaphysics/Encounter and extracts assetHub + pipe links', () => {
  assert.equal(classifyAssetCategory('Property'), 'Item');
  assert.equal(classifyAssetCategory('Metaphysics'), 'Lore');
  assert.equal(classifyAssetCategory('Encounter'), 'Scenario');

  const scenariosTree = [
    {
      id: 'sc_1',
      title: 'Orbital Rendezvous',
      type: 'Scene',
      content: '<p>Meets at [[Orbital Lounge|Vesper Spire]].</p>',
      assetHub: [{ assetId: 'el_b', name: 'Plasma Pistol' }]
    }
  ];
  const elementsCatalog = [
    {
      id: 'el_a',
      title: 'Agent Kael',
      type: 'Persona',
      content: '',
      assetHub: [{ assetId: 'el_b', name: 'Plasma Pistol' }]
    },
    {
      id: 'el_b',
      title: 'Plasma Pistol',
      type: 'Property',
      content: ''
    },
    {
      id: 'el_c',
      title: 'Vesper Spire',
      type: 'Location',
      content: ''
    }
  ];

  const { catalogAssets, scenariosFlat } = buildCatalogAssets({ scenariosTree, elementsCatalog });
  const links = extractConfirmedConnections({ catalogAssets, rawLinks: [], scenariosFlat });
  assert.ok(links.some((l) => l.source === 'el_a' && l.target === 'el_b'));
  assert.ok(links.some((l) => l.source === 'sc_1' && l.target === 'el_c'));
});

test('8. PagedPdfCompiler and DocumentExporters suppress isHidden and isGmOnly chapters when includeGmSecrets is false', () => {
  const nodes = [
    { id: 'n_pub', title: 'Public Briefing', content: '<p>Safe intro.</p>', fields: {} },
    { id: 'n_gm', title: 'Secret Boss Lair', isGmOnly: true, content: '<p>Trap details.</p>', fields: {} },
    { id: 'n_hid', title: 'Hidden Epilogue', isHidden: true, content: '<p>Spoiler.</p>', fields: {} }
  ];

  const { html } = PagedPdfCompiler.compileToPagedHtml(nodes, { includeGmSecrets: false, includeToc: true });
  assert.ok(html.includes('Public Briefing'));
  assert.ok(!html.includes('Secret Boss Lair'));
  assert.ok(!html.includes('Hidden Epilogue'));

  const rtf = compileToRtfString(nodes, { includeGmSecrets: false });
  assert.ok(rtf.includes('Public Briefing'));
  assert.ok(!rtf.includes('Secret Boss Lair'));
  assert.ok(!rtf.includes('Hidden Epilogue'));

  const epubBytes = compileToEpubBytes(nodes, { includeGmSecrets: false });
  assert.ok(epubBytes instanceof Uint8Array && epubBytes.byteLength > 0);
  const epubText = new TextDecoder().decode(epubBytes);
  assert.ok(epubText.includes('Public Briefing'));
  assert.ok(!epubText.includes('Secret Boss Lair'));
  assert.ok(!epubText.includes('Hidden Epilogue'));
});

test('9. cronicleService update_relationship supports exact mode:"set" without exponential drift and preserves additive deltas', () => {
  const initialCronicle = {
    personas: {
      kael: { id: 'kael', name: 'Kael', relationship_matrix: { aria: 20 } },
      aria: { id: 'aria', name: 'Aria', relationship_matrix: { kael: 20 } }
    },
    locations: {},
    timeline: [],
    pendingDeltas: []
  };

  // Absolute slider set mode
  const afterSet = applyCronicleDelta(initialCronicle, {
    id: 'd_set_1',
    entityId: 'kael',
    action: 'update_relationship',
    mode: 'set',
    target: 'aria',
    value: 35
  });
  assert.equal(afterSet.personas.kael.relationship_matrix.aria, 35);

  // Lowering positive affinity via slider set mode
  const afterLower = applyCronicleDelta(afterSet, {
    id: 'd_set_2',
    entityId: 'kael',
    action: 'update_relationship',
    mode: 'set',
    target: 'aria',
    value: -15
  });
  assert.equal(afterLower.personas.kael.relationship_matrix.aria, -15);

  // Additive NLP delta when mode is omitted
  const afterAdd = applyCronicleDelta(afterLower, {
    id: 'd_add_1',
    entityId: 'kael',
    action: 'update_relationship',
    target: 'aria',
    value: 10
  });
  assert.equal(afterAdd.personas.kael.relationship_matrix.aria, -5);
});

test('10. VttModuleCompilerService filters operatorSafe elements and disarms disabled vttScriptActive:"false" scripts across compiler & aggregator', () => {
  const elements = [
    {
      id: 'p_disabled',
      title: 'Disabled Guard',
      type: 'Persona',
      fields: {
        mcmTier: '2',
        vttScriptActive: 'false',
        vttScript: JSON.stringify({ type: 'patrol', behaviorProfile: 'sentinel' })
      }
    },
    {
      id: 'p_hidden_gm',
      title: 'Hidden Assassin',
      type: 'Persona',
      isGmOnly: true,
      fields: { mcmTier: '4' }
    }
  ];

  const compiler = new VttModuleCompilerService();
  const { package: pkg } = compiler.compileScenarioForVtt({
    scenario: { id: 'sc_1', title: 'Docking Bay' },
    activeMap: { id: 'map_1', title: 'Bay 1', walls: [], objects: [], tokens: [] },
    elementsCatalog: elements,
    options: { operatorSafe: true }
  });

  // Operator-safe filtering hides GM-only elements from stats & gallery
  assert.equal(pkg.manifest.stats.totalElements, 1);
  assert.equal(pkg.gallery.elements.length, 1);
  assert.ok(!pkg.gallery.elements.some((e) => e.id === 'p_hidden_gm'));

  // Disabled script stays disarmed (no parsed script and no fallback bark)
  const guardTok = pkg.map.tokens.find((t) => t.elementId === 'p_disabled');
  assert.ok(guardTok);
  assert.equal(guardTok.script, null);

  // Asset aggregator also marks disabled script as non-scripted
  const aggregated = aggregateModuleAssets({ elementsCatalog: elements, mapsCatalog: [], universeState: {} });
  const aggGuard = aggregated.find((a) => a.id === 'p_disabled');
  assert.ok(aggGuard);
  assert.equal(aggGuard.isScripted, false);
});

test('11. convertPersonaElementToFolio and consolidateAdeElementToCortexPayload preserve isPublic visibility', () => {
  const folio = convertPersonaElementToFolio(
    { id: 'elem_p1', title: 'Public Scout', type: 'Persona', isPublic: true, fields: {} },
    { isPublic: false }
  );
  assert.equal(folio.isPublic, true);

  const folioPrivate = convertPersonaElementToFolio(
    { id: 'elem_p2', title: 'Private Scout', type: 'Persona', isPublic: false, fields: {} },
    { isPublic: true }
  );
  assert.equal(folioPrivate.isPublic, false);

  const consolidated = consolidateAdeElementToCortexPayload({
    id: 'elem_w1',
    title: 'Shared Lance',
    type: 'Property',
    propertySubcategory: 'weaponry',
    isPublic: true,
    fields: {}
  });
  assert.equal(consolidated.payload.isPublic, true);
});
