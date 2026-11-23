/**
 * @file phase8Convergence.test.mjs
 * @description Phase 8 Convergence Gate covering Pair Author round-trips, CRONICLE alias resolution,
 *   Lorebook ReDoS guards, DAG auto-layout with cycles, MapMaker single-pass grid geometry,
 *   bounded LRU texture cache, Firebase Storage binary offloading, raycast vision walls, and VttEventBus.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  exportElementToMarkdown,
  parseElementMarkdown
} from '../../src/services/elementIngestionService.js';
import { hydrateModuleIntoCampaign } from '../../src/services/modulePackageService.js';
import { calculateAutoLayout } from '../../src/pages/Foundry/StoryModule/workspaces/graph/graphUtils.js';
import {
  compileTriggerRegex,
  scanDynamicLorebook
} from '../../src/services/lorebookScanner.ts';
import {
  createDefaultCronicleState,
  resolveCronicleEntityKey,
  applyCronicleDelta
} from '../../src/services/cronicleService.js';
import {
  computeVisibleGridBounds,
  drawSquareGridOnCanvas,
  drawHexGridOnCanvas
} from '../../src/pages/Foundry/MapMaker/map/gridGeometry.js';
import {
  buildAdeStoragePath,
  uploadAdeImageAsset,
  offloadMapBinaryFields
} from '../../src/services/adeMediaStorageService.js';
import {
  MAX_IMAGE_CACHE_SIZE,
  getLoadedImage,
  getImageCacheSize,
  clearImageCache
} from '../../src/pages/Foundry/MapMaker/map/MapTextures.js';
import {
  computeVisibilityPolygon,
  isPointVisible
} from '../../src/services/raycastVisionService.js';
import { VttEventBus } from '../../src/utils/vttEventBus.ts';

test('Phase 8.1a: elementIngestionService round-trips guidance, assetHub, customFields, subcategory, & narrative prose', () => {
  const original = {
    id: 'elem_p8_persona',
    title: 'Commander Kael',
    name: 'Commander Kael',
    type: 'Persona',
    personaSubcategory: 'Starship Officer',
    description: 'Veteran void navigator.',
    content: 'Kael survived the Keplar Rift ambush.\n\nArmed with a custom neural deck.',
    tags: ['vanguard', 'navigator'],
    guidance: { voice: 'Laconic, tactical', arcPrompt: 'Redemption under fire' },
    assetHub: [{ id: 'tok_kael_01', category: 'token' }],
    customFields: [{ label: 'Callsign', value: 'Specter-4', type: 'text' }],
    fields: {
      role: 'Supporting Cast',
      motivation: 'Protect the remaining refugees'
    }
  };

  const md = exportElementToMarkdown(original);
  assert.match(md, /### \*\*Narrative Prose & Lore\*\*/);
  assert.match(md, /guidanceJson:/);
  assert.match(md, /assetHubJson:/);
  assert.match(md, /customFieldsJson:/);

  const parsed = parseElementMarkdown(md, 'kael.md');
  assert.equal(parsed.type, 'Persona');
  assert.equal(parsed.personaSubcategory, 'Starship Officer');
  assert.deepEqual(parsed.guidance, original.guidance);
  assert.deepEqual(parsed.assetHub, original.assetHub);
  assert.deepEqual(parsed.customFields, original.customFields);
  assert.match(parsed.content, /Keplar Rift ambush/);
});

test('Phase 8.1b: modulePackageService hydrateModuleIntoCampaign restores creativeState and cronicle', () => {
  let restoredCreative = null;
  let restoredCronicle = null;

  const result = hydrateModuleIntoCampaign(
    {
      format: 'tangent-adventure-module',
      manifest: { version: '2.0.0' },
      scenarios: [{ id: 'sc_1', title: 'Opening Act', children: [] }],
      maps: [{ id: 'm_1', title: 'Docking Ring' }],
      elements: [{ id: 'e_1', title: 'Chief Engineer' }],
      creativeState: {
        gems: [{ id: 'gem_1', label: 'Noir Tension' }],
        storyOutline: 'Act 1 -> Act 2',
        beatSheet: 'Inciting signal'
      },
      cronicle: {
        version: 1,
        personas: { p1: { id: 'p1', name: 'Engineer' } },
        locations: {},
        timeline: []
      }
    },
    {
      addMap: () => {},
      addStory: () => {},
      addSavedElement: () => {},
      updateCreativeState: (cs) => { restoredCreative = cs; },
      updateCronicle: (cr) => { restoredCronicle = cr; },
      remapCollisions: false
    }
  );

  assert.equal(result.mapsImported, 1);
  assert.equal(result.scenariosImported, 1);
  assert.equal(result.elementsImported, 1);
  assert.equal(result.creativeStateRestored, true);
  assert.equal(result.cronicleRestored, true);
  assert.equal(restoredCreative.gems[0].label, 'Noir Tension');
  assert.equal(restoredCronicle.personas.p1.name, 'Engineer');
});

test('Phase 8.1c: graphUtils calculateAutoLayout handles cycles safely & preserves depth when links are empty', () => {
  const flatNodes = [
    { id: 'n1', depth: 0 },
    { id: 'n2', depth: 1 },
    { id: 'n3', depth: 2 }
  ];

  // Empty links preserves base tree depth
  const noLinkPos = calculateAutoLayout(flatNodes, [], 'horizontal');
  assert.equal(noLinkPos.n1.x < noLinkPos.n2.x, true);
  assert.equal(noLinkPos.n2.x < noLinkPos.n3.x, true);

  // Cyclic links must terminate without NaN or throwing
  const cyclicPos = calculateAutoLayout(
    flatNodes,
    [
      { sourceId: 'n1', targetId: 'n2' },
      { sourceId: 'n2', targetId: 'n3' },
      { sourceId: 'n3', targetId: 'n1' }
    ],
    'vertical'
  );
  for (const id of ['n1', 'n2', 'n3']) {
    assert.equal(Number.isFinite(cyclicPos[id].x), true);
    assert.equal(Number.isFinite(cyclicPos[id].y), true);
  }
});

test('Phase 8.1d: lorebookScanner rejects ReDoS nested quantifiers/overlong regexes and matches aliases', () => {
  assert.equal(compileTriggerRegex('(a+)+'), null);
  assert.equal(compileTriggerRegex('(.*)*'), null);
  assert.equal(compileTriggerRegex('x'.repeat(245)), null);
  assert.ok(compileTriggerRegex('/\\b(sector-7|helix)\\b/i') instanceof RegExp);

  const scan = scanDynamicLorebook({
    input: 'We docked at The Ghost Station before dawn.',
    catalog: [
      {
        id: 'elem_station',
        title: 'Helix Relay Outpost',
        type: 'Setting',
        aliases: ['Ghost Station', 'Relay-9'],
        content: 'Abandoned orbital listening post.'
      }
    ]
  });

  assert.equal(scan.injectedEntries.length, 1);
  assert.equal(scan.injectedEntries[0].id, 'elem_station');
  assert.match(scan.injectedEntries[0].triggerMatched, /Alias/i);
});

test('Phase 8.1e: cronicleService resolveCronicleEntityKey matches ID, sourceElementId, canonical name, & alias', () => {
  const cronicle = createDefaultCronicleState('Obsidian Orbit');
  cronicle.personas = {
    obsidian_kael: {
      id: 'obsidian_kael',
      sourceElementId: 'elem_kael_99',
      name: 'Commander Kael',
      aliases: ['Specter-4', 'Kael'],
      current_status: 'active',
      active_inventory: []
    }
  };

  assert.equal(resolveCronicleEntityKey(cronicle.personas, 'elem_kael_99'), 'obsidian_kael');
  assert.equal(resolveCronicleEntityKey(cronicle.personas, 'Commander Kael'), 'obsidian_kael');
  assert.equal(resolveCronicleEntityKey(cronicle.personas, 'Specter-4'), 'obsidian_kael');

  const updated = applyCronicleDelta(cronicle, {
    id: 'delta_1',
    entityId: 'Specter-4',
    action: 'add_item',
    value: 'Plasma Cutter'
  });
  assert.deepEqual(updated.personas.obsidian_kael.active_inventory, ['Plasma Cutter']);
});

test('Phase 8.2a: gridGeometry computes clamped viewport bounds and renders square & hex grids via Canvas2D', () => {
  const extremeBounds = computeVisibleGridBounds(
    { x: 0, y: 0, width: 500000, height: 500000, scale: 0.05 },
    50,
    2,
    300
  );
  assert.equal(extremeBounds.minCol >= -300 && extremeBounds.maxCol <= 300, true);
  assert.equal(extremeBounds.minRow >= -300 && extremeBounds.maxRow <= 300, true);

  let strokeCount = 0;
  let lineCount = 0;
  const mockCtx = {
    strokeStyle: '',
    lineWidth: 1,
    beginPath() {},
    moveTo() {},
    lineTo() { lineCount += 1; },
    closePath() {},
    stroke() { strokeCount += 1; }
  };

  drawSquareGridOnCanvas(mockCtx, { x: 0, y: 0, width: 400, height: 300, scale: 1 }, 50);
  assert.equal(strokeCount >= 2, true);
  assert.equal(lineCount > 0, true);

  const prevStrokes = strokeCount;
  drawHexGridOnCanvas(mockCtx, { x: 0, y: 0, width: 400, height: 300, scale: 1 }, 40);
  assert.equal(strokeCount > prevStrokes, true);
});

test('Phase 8.2b: adeMediaStorageService matches storage.rules paths, blocks XSS SVGs, & offloads large map binaries', async () => {
  const path = buildAdeStoragePath({
    userId: 'user_abc_123',
    assetCategory: 'maps',
    fileName: '../evil..name!!.png',
    contentType: 'image/webp'
  });
  assert.match(path, /^users\/user_abc_123\/ade\/maps\/[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/);

  const maliciousSvg = 'data:image/svg+xml;base64,' + Buffer.from('<svg><script>alert(1)</script></svg>').toString('base64');
  await assert.rejects(
    () => uploadAdeImageAsset(maliciousSvg, { userId: 'user_abc_123', assetCategory: 'tokens' }),
    /unsafe SVG/i
  );

  // Small inline image below threshold stays inline; distinct large data URIs offload via uploadFn & deduplicate duplicates
  const tinyPngDataUri = 'data:image/png;base64,' + Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString('base64');
  const heavyBgUri = 'data:image/png;base64,' + Buffer.alloc(4096, 65).toString('base64');
  const heavyTokenUri = 'data:image/png;base64,' + Buffer.alloc(4096, 66).toString('base64');

  const uploadedPaths = [];
  const offloadedMap = await offloadMapBinaryFields(
    {
      id: 'map_sector_7',
      backgroundUrl: heavyBgUri,
      underlayUrl: tinyPngDataUri,
      tokens: [
        { id: 't1', imageUrl: heavyTokenUri },
        { id: 't2', imageUrl: heavyTokenUri }
      ]
    },
    {
      userId: 'user_abc_123',
      inlineThresholdBytes: 512,
      uploadFn: async (storagePath) => {
        uploadedPaths.push(storagePath);
        return `https://firebasestorage.googleapis.com/v0/b/test/o/${encodeURIComponent(storagePath)}`;
      }
    }
  );

  assert.equal(uploadedPaths.length, 2);
  assert.match(offloadedMap.backgroundUrl, /^https:\/\/firebasestorage\.googleapis\.com/);
  assert.match(offloadedMap.tokens[0].imageUrl, /^https:\/\/firebasestorage\.googleapis\.com/);
  assert.equal(offloadedMap.tokens[1].imageUrl, offloadedMap.tokens[0].imageUrl);
  assert.equal(offloadedMap.underlayUrl, tinyPngDataUri);
});

test('Phase 8.2c: MapTextures enforces bounded 128-entry LRU eviction', () => {
  const prevWindow = globalThis.window;
  globalThis.window = {
    Image: class MockImage {
      constructor() {
        this.complete = true;
        this.crossOrigin = null;
      }
      set src(_v) {}
    }
  };

  try {
    clearImageCache();
    assert.equal(MAX_IMAGE_CACHE_SIZE, 128);
    for (let i = 0; i < MAX_IMAGE_CACHE_SIZE + 25; i++) {
      getLoadedImage(`https://example.com/tex_${i}.webp`);
    }
    assert.equal(getImageCacheSize(), MAX_IMAGE_CACHE_SIZE);
    clearImageCache();
    assert.equal(getImageCacheSize(), 0);
  } finally {
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
  }
});

test('Phase 8.2d: raycastVisionService supports legacy {x1,y1,x2,y2} walls and transparent breached doors', () => {
  const closedLegacyWall = { id: 'w1', type: 'solid', x1: 100, y1: -50, x2: 100, y2: 50 };
  assert.equal(isPointVisible({ x: 0, y: 0 }, { x: 200, y: 0 }, [closedLegacyWall]), false);

  const breachedDoor = { id: 'd1', type: 'door', doorState: 'breached', breachHp: 0, x1: 100, y1: -50, x2: 100, y2: 50 };
  assert.equal(isPointVisible({ x: 0, y: 0 }, { x: 200, y: 0 }, [breachedDoor]), true);

  const poly = computeVisibilityPolygon({ x: 50, y: 50 }, [closedLegacyWall], { maxRadius: 400 });
  assert.equal(Array.isArray(poly) && poly.length >= 6, true);
});

test('Phase 8.3: VttEventBus supports typed chat-message subscribe/emit/unsubscribe', () => {
  const prevWindow = globalThis.window;
  const target = new EventTarget();
  globalThis.window = target;

  try {
    const received = [];
    const unsub = VttEventBus.on('chat-message', (payload) => {
      received.push(payload);
    });
    VttEventBus.emit('chat-message', { sender: 'ARCHITECT', text: 'Sector live.', type: 'narration' });
    unsub();
    VttEventBus.emit('chat-message', { sender: 'ARCHITECT', text: 'Should not fire.', type: 'narration' });

    assert.equal(received.length, 1);
    assert.equal(received[0].sender, 'ARCHITECT');
    assert.equal(received[0].text, 'Sector live.');
  } finally {
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
  }
});
