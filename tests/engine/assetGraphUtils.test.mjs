/**
 * @file assetGraphUtils.test.mjs
 * @description Unit tests for the connection-first Asset Interconnection Graph engine:
 * verifies zero unconnected clutter, scenario deduplication, multi-source connection synthesis,
 * smart lore discovery, ego-network focus filtering, and non-overlapping topological layout.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  buildCatalogAssets,
  extractConfirmedConnections,
  discoverSmartLoreSuggestions,
  filterVisibleGraph,
  computeIntelligentAssetLayout
} from '../../src/pages/Foundry/Weaver/tabs/assetGraphUtils.js';

test('assetGraphUtils: deduplicates activeNode and filters foreign Scenario clones from elementsCatalog', () => {
  const activeNode = { id: 'scen-main', title: 'Universe Overview', type: 'Scenario', content: '' };
  const scenariosTree = [activeNode];
  const elementsCatalog = [
    // Duplicate of activeNode saved in elementsCatalog
    { id: 'scen-main', title: 'Universe Overview', type: 'Scenario' },
    // Foreign project scenarios saved in elementsCatalog
    { id: 'scen-foreign-1', title: 'test Overview', type: 'Scenario' },
    { id: 'scen-foreign-2', title: 'New Story Module', type: 'Story Module' },
    // Genuine world elements
    { id: 'fac-entari', title: 'Entari Combine', type: 'Faction', fields: { description: 'Interstellar trade combine' } },
    { id: 'loc-mekan', title: 'Mekan Prime', type: 'World', fields: { corePremise: 'Synthetic logic world' } },
    { id: 'per-olivia', title: 'Director Olivia', type: 'Persona', fields: { oneLinePitch: 'Fleet intelligence chief' } }
  ];

  const { catalogAssets } = buildCatalogAssets({
    scenariosTree,
    elementsCatalog,
    mapsCatalog: [],
    universeMaps: [],
    rawLinks: [],
    activeNode
  });

  assert.equal(catalogAssets.length, 4, 'Includes 1 active scenario + 3 genuine world elements');
  assert.equal(catalogAssets.filter((a) => a.id === 'scen-main').length, 1, 'No duplicate active scenario');
  assert.ok(!catalogAssets.some((a) => a.id === 'scen-foreign-1'), 'Excludes unlinked foreign scenario');
});

test('assetGraphUtils: 0 connections yields 0 visible nodes instead of dumping 50+ catalog orphans', () => {
  const activeNode = { id: 'scen-main', title: 'Universe Overview', type: 'Scenario', content: '' };
  const elementsCatalog = Array.from({ length: 55 }, (_, idx) => ({
    id: `elem-${idx}`,
    title: `Catalog Asset ${idx}`,
    type: idx % 2 === 0 ? 'Faction' : 'Persona',
    fields: {}
  }));

  const { catalogAssets, scenariosFlat } = buildCatalogAssets({
    scenariosTree: [activeNode],
    elementsCatalog,
    activeNode
  });

  const confirmedConnections = extractConfirmedConnections({
    catalogAssets,
    rawLinks: [],
    scenariosFlat
  });

  const { visibleNodes, visibleLinks } = filterVisibleGraph({
    catalogAssets,
    confirmedConnections,
    scopeMode: 'connected'
  });

  assert.equal(confirmedConnections.length, 0);
  assert.equal(visibleNodes.length, 0, 'Never dumps unconnected catalog items onto canvas');
  assert.equal(visibleLinks.length, 0);
});

test('assetGraphUtils: synthesizes Manual, Asset Hub, Prose [[Wiki]], and Schema links cleanly', () => {
  const scenariosTree = [
    {
      id: 'scen-1',
      title: 'Docking Bay Ambush',
      type: 'Scene',
      content: 'Operators meet [[Director Olivia]] inside the hangar.',
      mapId: 'map-dock'
    }
  ];

  const elementsCatalog = [
    {
      id: 'per-olivia',
      title: 'Director Olivia',
      type: 'Persona',
      assetHub: [{ assetId: 'fac-entari', importance: 'high', annotation: 'Covert handler' }],
      fields: { rivalTarget: 'Admiral Rache' }
    },
    { id: 'per-rache', title: 'Admiral Rache', type: 'Persona', fields: {} },
    { id: 'fac-entari', title: 'Entari Combine', type: 'Faction', fields: {} },
    { id: 'loc-city', title: 'Kitty City', type: 'Setting', fields: { parentWorld: 'Planet Entari' } },
    { id: 'loc-planet', title: 'Planet Entari', type: 'World', fields: {} },
    { id: 'orphan-item', title: 'Unlinked Relic', type: 'Item', fields: {} }
  ];

  const mapsCatalog = [{ id: 'map-dock', title: 'Sector 9 Hangar' }];
  const rawLinks = [
    { id: 'link-1', source: 'fac-entari', target: 'loc-planet', type: 'custodian_of', note: 'Home sector' }
  ];

  const { catalogAssets, scenariosFlat } = buildCatalogAssets({
    scenariosTree,
    elementsCatalog,
    mapsCatalog,
    rawLinks
  });

  const confirmed = extractConfirmedConnections({ catalogAssets, rawLinks, scenariosFlat });

  // Expected connections:
  // 1. manual: fac-entari -> loc-planet
  // 2. asset_hub: per-olivia -> fac-entari
  // 3. prose: scen-1 -> per-olivia
  // 4. schema mapId: scen-1 -> map-dock
  // 5. schema rivalTarget: per-olivia -> per-rache
  // 6. schema parentWorld: loc-city -> loc-planet
  assert.equal(confirmed.length, 6);

  const { visibleNodes } = filterVisibleGraph({
    catalogAssets,
    confirmedConnections: confirmed,
    scopeMode: 'connected'
  });

  assert.ok(!visibleNodes.some((n) => n.id === 'orphan-item'), 'Unlinked Relic stays off the graph');
  assert.equal(visibleNodes.length, 7, 'Shows only the 7 connected nodes');

  // Test 1-Hop Focus Hub around Director Olivia
  const focus1 = filterVisibleGraph({
    catalogAssets,
    confirmedConnections: confirmed,
    scopeMode: 'focus',
    focusNodeId: 'per-olivia',
    hopDepth: 1
  });
  const focusIds = new Set(focus1.visibleNodes.map((n) => n.id));
  assert.deepEqual(
    focusIds,
    new Set(['per-olivia', 'scen-1', 'fac-entari', 'per-rache']),
    '1-Hop Focus Hub isolates Director Olivia and her 3 direct connections'
  );
});

test('assetGraphUtils: discovers high-confidence Smart Lore Suggestions without short-name noise', () => {
  const { catalogAssets } = buildCatalogAssets({
    scenariosTree: [],
    elementsCatalog: [
      { id: 'sp-mekan', title: 'Mekan Synthetic', type: 'Species', fields: { habitatOrigin: 'Originated on Mekan Prime' } },
      { id: 'w-mekan', title: 'Mekan Prime', type: 'World', fields: {} },
      { id: 'junk', title: 'ds', type: 'Persona', fields: { description: 'short test name' } }
    ]
  });

  const suggestions = discoverSmartLoreSuggestions({ catalogAssets, confirmedConnections: [] });
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].source, 'sp-mekan');
  assert.equal(suggestions[0].target, 'w-mekan');
  assert.equal(suggestions[0].type, 'located_in');
});

test('assetGraphUtils: computeIntelligentAssetLayout produces zero overlapping cards across clusters', () => {
  const nodes = Array.from({ length: 10 }, (_, i) => ({
    id: `n-${i}`,
    title: `Asset Node ${i}`,
    category: i === 0 ? 'Scenario' : i % 2 === 0 ? 'Faction' : 'Persona',
    isScenario: i === 0
  }));

  // Star cluster (n-0 connected to n-1..n-7) + separate 2-node island (n-8 <-> n-9)
  const links = [
    ...Array.from({ length: 7 }, (_, i) => ({ id: `l-${i}`, source: 'n-0', target: `n-${i + 1}` })),
    { id: 'l-island', source: 'n-8', target: 'n-9' }
  ];

  const positions = computeIntelligentAssetLayout({
    nodes,
    links,
    focalNodeId: 'n-0',
    savedPositions: {}
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = positions[nodes[i].id];
      const b = positions[nodes[j].id];
      assert.ok(a && b, 'Every node receives valid coordinates');
      const overlapX = CARD_WIDTH - Math.abs(a.x - b.x);
      const overlapY = CARD_HEIGHT - Math.abs(a.y - b.y);
      assert.ok(!(overlapX > 0 && overlapY > 0), `Cards ${nodes[i].id} and ${nodes[j].id} must not overlap`);
    }
  }
});
