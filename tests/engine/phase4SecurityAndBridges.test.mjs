/**
 * @file phase4SecurityAndBridges.test.mjs
 * @description Phase 4 regression tests covering runtime sandbox containment, compiler/SVG/UVTT XSS
 *   sanitization, operator export redaction, BASTION authority gating, and ADE <-> Cortex / Folio bridges.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import { PagedPdfCompiler } from '../../src/engine/compilers/PagedPdfCompiler.ts';
import { synthesizeTileSvgDataUrl } from '../../src/engine/assets/MicroTileSynthesizer.ts';
import { renderChunkThumbnailDataUrl } from '../../src/services/mapChunkCompilerService.ts';
import { FoundryVttJsonExporterService } from '../../src/engine/compilers/FoundryVttJsonExporter.ts';
import { parseUniversalVtt } from '../../src/services/uvttImportService.js';
import { resolveAssetTexture } from '../../src/engine/assets/assetVisualFallbacks.ts';
import { buildSanitizedOperatorPackagePayload } from '../../src/services/modulePackageService.js';
import {
  projectOmnicortexRecordToAdeElement,
  consolidateAdeElementToCortexPayload
} from '../../src/utils/cortexAdeAssetBridge.js';
import {
  convertFolioToPersonaElement,
  convertPersonaElementToFolio,
  sendMcmToFolioRoster
} from '../../src/utils/personaBridge.js';
import { ModifierService } from '../../src/services/modifierService.ts';
import { exportElementToMarkdown } from '../../src/services/elementIngestionService.js';
import { BASTION_ROLES, resolveBastionSessionState } from '../../src/services/bastionSessionService.js';

function decodeSvgDataUrl(dataUrl) {
  assert.equal(typeof dataUrl, 'string');
  assert.match(dataUrl, /^data:image\/svg\+xml/i);
  const commaIdx = dataUrl.indexOf(',');
  assert.ok(commaIdx > 0, 'Expected SVG data URL payload delimiter');
  const header = dataUrl.slice(0, commaIdx).toLowerCase();
  const body = dataUrl.slice(commaIdx + 1);
  return header.includes(';base64')
    ? Buffer.from(body, 'base64').toString('utf8')
    : decodeURIComponent(body);
}

test('Phase 4.1 QuickJSSandbox: blocks constructor RCE escape, StoryFlags __proto__ pollution, and Dice.roll DoS', async () => {
  const sandbox = new QuickJSSandbox();

  await assert.rejects(
    async () =>
      sandbox.execute("return items['con'+'structor']['con'+'structor']('return process')();", {
        items: []
      }),
    /Security Violation|Macro Execution Error|disallowed|TypeError|Cannot/i
  );

  await assert.rejects(
    async () =>
      sandbox.execute("return items['con'+'structor']['con'+'structor']('return 1+1')();", {
        items: []
      }),
    /Security Violation|Macro Execution Error|disallowed|TypeError|Cannot/i
  );

  await assert.rejects(
    async () => sandbox.execute("StoryFlags.set('__proto__', { polluted: true });"),
    /Security Violation/i
  );

  const storyFlags = {};
  const protoResult = await sandbox.execute(
    "StoryFlags.set('__' + 'proto__', { polluted: true }); StoryFlags.set('safeFlag', 7); return StoryFlags.get('__' + 'proto__') === null && StoryFlags.has('__' + 'proto__') === false;",
    { storyFlags }
  );
  assert.equal(protoResult, true);
  assert.equal(({}).polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(storyFlags, '__proto__'), false);
  assert.equal(storyFlags.safeFlag, 7);

  const rolls = await sandbox.execute('return Dice.roll(50000, 10);');
  assert.ok(Array.isArray(rolls));
  assert.ok(rolls.length <= 1000, `Expected Dice.roll length capped <= 1000, got ${rolls.length}`);
  assert.equal(rolls.length, 1000);
});

test('Phase 4.2 PagedPdfCompiler: escapes </style> in CSS string and strips <svg>/<img onerror> in SSR fallback', () => {
  const result = PagedPdfCompiler.compileToPagedHtml(
    [
      {
        id: 'node-xss',
        title: 'Briefing <script>alert(1)</script>',
        content: '<p>Safe intro</p><svg onload="alert(1)"><circle /></svg><img src="x" onerror="alert(2)">',
        fields: {
          readAloud: 'Read me <script>steal()</script>'
        }
      }
    ],
    {
      adventureTitle: 'Evil </style><script>alert(1)</script>',
      authorName: 'Tester'
    }
  );

  assert.ok(result.html.includes('\\3c /style\\3e '), 'Expected </style> escaped inside @bottom-left CSS string');
  assert.equal(result.html.includes('</style><script>'), false);
  assert.equal(result.html.includes('<script>'), false);
  assert.equal(result.html.includes('<svg'), false);
  assert.equal(result.html.includes('<img'), false);
  assert.equal(result.html.includes('onload='), false);
  assert.equal(result.html.includes('onerror='), false);
  assert.ok(result.html.includes('&lt;script&gt;steal()&lt;/script&gt;'));
  assert.ok(result.html.includes('Safe intro'));
});

test('Phase 4.3 SVG Synthesizers: neutralize injected SVG attribute payloads in tile and chunk thumbnails', () => {
  const tileUrl = synthesizeTileSvgDataUrl({
    id: 'tile-xss',
    seed: 1337,
    resolution: 64,
    archetype: 'plating',
    palette: {
      primary: '" onload="alert(1)',
      secondary: '#1e293b',
      accent: '#38bdf8',
      ink: '#0f172a',
      glow: '#22d3ee'
    }
  });
  const tileSvg = decodeSvgDataUrl(tileUrl);
  assert.equal(tileSvg.includes('onload='), false);
  assert.equal(tileSvg.includes('" onload="'), false);

  const chunkUrl = renderChunkThumbnailDataUrl({
    widthCells: 4,
    heightCells: 4,
    tiles: [{ col: 0, row: 0, color: '" onload="alert(1)' }],
    walls: [],
    assets: []
  });
  const chunkSvg = decodeSvgDataUrl(chunkUrl);
  assert.equal(chunkSvg.includes('onload='), false);
  assert.equal(chunkSvg.includes('" onload="'), false);
});

test('Phase 4.4 FoundryVttJsonExporter: escapes <script> in scenario title and Journal HTML', () => {
  const exporter = new FoundryVttJsonExporterService();
  const { pack } = exporter.exportToFoundryJson({
    packageId: 'phase4-xss-check',
    title: 'Safe Module',
    scenarios: [
      {
        id: 'scene-1',
        title: '<script>alert(1)</script>Airlock',
        content: '<p>Hold</p><script>stealTokens()</script>',
        fields: {
          readAloud: '<script>pwn()</script>'
        }
      }
    ],
    elements: [],
    maps: []
  });

  assert.equal(pack.journals.length, 1);
  const journalHtml = pack.journals[0].pages[0].text.content;
  assert.equal(journalHtml.includes('<script>'), false);
  assert.ok(journalHtml.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(journalHtml.includes('&lt;script&gt;stealTokens()&lt;/script&gt;'));
});

test('Phase 4.5 UVTT & Asset Fallbacks: rejects unsafe SVG data URIs and javascript: visual URLs', () => {
  const parsed = parseUniversalVtt(
    {
      format: 0.3,
      resolution: { map_size: { x: 8, y: 8 }, pixels_per_grid: 50 },
      image: 'data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>',
      portals: [],
      line_of_sight: []
    },
    'BadUvttMap'
  );
  assert.equal(parsed.terrains.length, 0);

  const resolvedFromSvgScript = resolveAssetTexture({
    unit_id: 'prop_custom_xss',
    category: 'Prop',
    visuals: {
      baseTexture: 'data:image/svg+xml;utf8,<svg><script>alert(1)</script></svg>',
      thumbnail: 'javascript:alert(1)'
    }
  });
  assert.equal(typeof resolvedFromSvgScript, 'string');
  assert.equal(resolvedFromSvgScript.toLowerCase().startsWith('javascript:'), false);
  assert.equal(resolvedFromSvgScript.toLowerCase().includes('<script'), false);
});

test('Phase 4.6 buildSanitizedOperatorPackagePayload: strips secrets/threats/creativeState/secretWalls and recomputes stats while keeping Handout theSecret', () => {
  const sanitized = buildSanitizedOperatorPackagePayload(
    {
      id: 'univ-1',
      projectName: 'Orbital Heist',
      scenarios: [
        {
          id: 'sc-1',
          title: 'Docking Bay',
          gmSecrets: 'Top level ambush note',
          threats: [{ name: 'Security Mech' }],
          fields: {
            readAloud: 'The airlock hisses open.',
            gmSecrets: 'Concealed turret behind bulkhead B',
            threats: 'Turret x2'
          }
        }
      ],
      creativeState: {
        secretTwist: 'The patron is the villain',
        storyOutline: 'Outline'
      },
      maps: [
        {
          id: 'map-1',
          title: 'Hangar',
          walls: [
            { id: 'w-pub', p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 }, type: 'wall' },
            { id: 'w-sec', p1: { x: 0, y: 5 }, p2: { x: 10, y: 5 }, type: 'secret_door', isSecret: true, hackDc: 24 }
          ],
          tokens: [
            { id: 'tok-hero', type: 'hero' },
            { id: 'tok-hidden', type: 'enemy', isPlayerVisible: false }
          ]
        }
      ]
    },
    [
      {
        id: 'handout-1',
        type: 'Handout',
        title: 'Encrypted Manifest',
        fields: {
          theSecret: 'Cargo container 9 holds cryo-cells',
          gmSecrets: 'Architect-only follow-up'
        }
      }
    ]
  );

  assert.equal(sanitized.scenarios[0].gmSecrets, undefined);
  assert.equal(sanitized.scenarios[0].threats, undefined);
  assert.equal(sanitized.scenarios[0].fields.gmSecrets, undefined);
  assert.equal(sanitized.scenarios[0].fields.threats, undefined);
  assert.equal(sanitized.scenarios[0].fields.readAloud, 'The airlock hisses open.');

  assert.equal(sanitized.creativeState?.secretTwist, undefined);
  assert.equal(sanitized.maps[0].walls.length, 2);
  assert.equal(sanitized.maps[0].walls[0].id, 'w-pub');
  assert.equal(sanitized.maps[0].walls[1].id, 'w-sec');
  assert.equal(sanitized.maps[0].walls[1].type, 'solid');
  assert.equal(sanitized.maps[0].walls[1].isSecret, false);
  assert.equal(sanitized.maps[0].walls[1].hackDc, undefined);
  assert.equal(sanitized.maps[0].tokens.length, 1);
  assert.equal(sanitized.maps[0].tokens[0].id, 'tok-hero');

  assert.equal(sanitized.manifest.stats.totalWalls, 2);
  assert.equal(sanitized.manifest.stats.totalTokens, 1);
  assert.equal(sanitized.manifest.stats.totalElements, 1);

  assert.equal(sanitized.elements[0].fields.theSecret, 'Cargo container 9 holds cryo-cells');
  assert.equal(sanitized.elements[0].fields.gmSecrets, undefined);
});

test('Phase 4.7 cortexAdeAssetBridge: round-trips Lorebook/Stage fields and overwrites stale MCM rawBase stats', () => {
  const settingRecord = {
    id: 'set-spindle',
    name: 'Spindle Station',
    description: 'Zero-G trading ring',
    pairedMapId: 'map_spindle_01',
    weatherPreset: 'vacuum_breach',
    climateWeather: 'Hard vacuum external ring',
    triggerLogic: 'AND_ALL',
    speakerFilter: 'Dockmaster',
    loreAutoInject: true,
    loreScanPriority: 42
  };

  const projectedSetting = projectOmnicortexRecordToAdeElement(settingRecord, 'setting');
  assert.equal(projectedSetting.fields.triggerLogic, 'AND_ALL');
  assert.equal(projectedSetting.fields.speakerFilter, 'Dockmaster');
  assert.equal(projectedSetting.fields.loreAutoInject, true);
  assert.equal(projectedSetting.fields.pairedMapId, 'map_spindle_01');
  assert.equal(projectedSetting.fields.weatherPreset, 'vacuum_breach');

  const consolidatedSetting = consolidateAdeElementToCortexPayload({
    ...projectedSetting,
    cortexRaw: settingRecord
  });
  assert.equal(consolidatedSetting.targetCollection, 'setting');
  assert.equal(consolidatedSetting.payload.triggerLogic, 'AND_ALL');
  assert.equal(consolidatedSetting.payload.speakerFilter, 'Dockmaster');
  assert.equal(consolidatedSetting.payload.loreAutoInject, true);
  assert.equal(consolidatedSetting.payload.pairedMapId, 'map_spindle_01');
  assert.equal(consolidatedSetting.payload.weatherPreset, 'vacuum_breach');

  const mcmElementExplicit = {
    id: 'mcm-unit-1',
    type: 'Persona',
    title: 'Vanguard Frame',
    dbmCategory: 'modular_characters',
    cortexRaw: {
      id: 'mcm-unit-1',
      name: 'Old Name',
      structure_points: 10,
      structurePoints: 10,
      defense_dc: 9,
      attack_bonus: 1,
      actions_per_round: 1,
      healthPoints: 5,
      vitalityPoints: 5
    },
    fields: {
      'char-name': 'Vanguard Frame',
      mcmTier: '4',
      mcmRole: 'Tank',
      mcmBossType: 'Elite',
      structurePoints: '48',
      defense_dc: '17',
      attack_bonus: '9',
      actions: '3',
      health: '32',
      vitality: '34'
    }
  };

  const consolidatedExplicit = consolidateAdeElementToCortexPayload(mcmElementExplicit);
  assert.equal(consolidatedExplicit.targetCollection, 'modular_characters');
  assert.equal(consolidatedExplicit.payload.structure_points, 48);
  assert.equal(consolidatedExplicit.payload.structurePoints, 48);
  assert.equal(consolidatedExplicit.payload.defense_dc, 17);
  assert.equal(consolidatedExplicit.payload.attack_bonus, 9);
  assert.equal(consolidatedExplicit.payload.actions_per_round, 3);
  assert.equal(consolidatedExplicit.payload.healthPoints, 32);
  assert.equal(consolidatedExplicit.payload.vitalityPoints, 34);

  const mcmElementDerived = {
    id: 'mcm-unit-2',
    type: 'Persona',
    title: 'Bastion Brute',
    dbmCategory: 'modular_characters',
    cortexRaw: {
      id: 'mcm-unit-2',
      name: 'Old Brute',
      structure_points: 1,
      defense_dc: 1,
      attack_bonus: 0,
      actions_per_round: 1
    },
    fields: {
      'char-name': 'Bastion Brute',
      mcmTier: '4',
      mcmRole: 'Tank',
      mcmBossType: 'Elite'
    }
  };

  const consolidatedDerived = consolidateAdeElementToCortexPayload(mcmElementDerived);
  assert.equal(consolidatedDerived.targetCollection, 'modular_characters');
  assert.notEqual(consolidatedDerived.payload.structure_points, 1);
  assert.notEqual(consolidatedDerived.payload.defense_dc, 1);
  assert.notEqual(consolidatedDerived.payload.attack_bonus, 0);
});

test('Phase 4.8 personaBridge: Folio rename/Core Traits survive round-trip and sendMcmToFolioRoster honors openInFolio: false', () => {
  const initialFolio = {
    'character-doc-id': 'folio-kaelen',
    'char-name': 'Kaelen Voss',
    'char-archetype': 'Infiltrator',
    'char-species': 'Human',
    summary: 'Initial pitch',
    appearance: 'Initial scar description',
    'attr-strength': 2,
    'attr-agility': 4,
    'attr-intellect': 3,
    'attr-wisdom': 2
  };

  const personaElement = convertFolioToPersonaElement(initialFolio, { storyId: 'story-1' });
  const editedElement = {
    ...personaElement,
    title: 'Kaelen Vane',
    fields: {
      ...personaElement.fields,
      oneLinePitch: 'Updated ex-operative pitch',
      physicalDescription: 'Silver cybernetic left jaw'
    }
  };

  const roundTrippedFolio = convertPersonaElementToFolio(editedElement);
  assert.equal(roundTrippedFolio['character-doc-id'], 'folio-kaelen');
  assert.equal(roundTrippedFolio['char-name'], 'Kaelen Vane');
  assert.equal(roundTrippedFolio.summary, 'Updated ex-operative pitch');
  assert.equal(roundTrippedFolio.appearance, 'Silver cybernetic left jaw');

  const store = new Map([
    ['personaFolioData', '{"char-name":"Existing Active Hero"}']
  ]);
  const prevLocalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    }
  };

  try {
    sendMcmToFolioRoster(
      {
        id: 'mcm-scout',
        name: 'Recon Scout',
        competencyRole: 'Scout',
        threatTier: 2
      },
      { openInFolio: false }
    );
    const savedRoster = JSON.parse(store.get('personaRoster') || '[]');
    assert.equal(savedRoster.some((p) => p['char-name'] === 'Recon Scout'), true);
    assert.equal(store.get('personaFolioData'), '{"char-name":"Existing Active Hero"}');
    assert.equal(store.has('tangent_pending_folio_import'), false);
  } finally {
    if (prevLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = prevLocalStorage;
    }
  }
});

test('Phase 4.9 ModifierService & elementIngestionService: Array tags and title + numeric 0 export safely', () => {
  const mod = ModifierService.createModifierFromItem({
    id: 'item-array-tags',
    type: 'Property',
    title: 'Psi Resonance Core',
    fields: {
      tags: ['psi', 'relic'],
      properties: 'Amplifies telekinetic bursts'
    }
  });
  assert.equal(mod.category, 'metaphysic');

  const md = exportElementToMarkdown({
    id: 'prop-zero',
    type: 'Property',
    title: 'Zero-G Thruster',
    fields: {
      techLevel: 0,
      dr: 0
    }
  });
  assert.ok(md.includes('Zero-G Thruster'));
  assert.equal(md.includes('Untitled Element'), false);
  assert.match(md, /\*\*Tech Level \(TL 0-5\):\*\*\s*0\b/);
  assert.match(md, /\*\*Damage Resistance \(DR\):\*\*\s*0\b/);
});

test('Phase 4.10 bastionSessionService: denies Architect authority on read-only/foreign stories and grants it to owners/admins', () => {
  const foreignDenied = resolveBastionSessionState({
    currentUser: { uid: 'uid-visitor' },
    authState: { isGM: false, isAdmin: false, hasCloudAdminAccess: false },
    universeState: { id: 'story-foreign', creatorId: 'uid-author', projectName: 'Foreign Realm' },
    isStoryReadOnly: true,
    routePath: '/foundry'
  });
  assert.equal(foreignDenied.isArchitect, false);
  assert.equal(foreignDenied.effectiveRole, BASTION_ROLES.OPERATOR);

  const ownerAllowed = resolveBastionSessionState({
    currentUser: { uid: 'uid-author' },
    authState: { isGM: false, isAdmin: false, hasCloudAdminAccess: false },
    universeState: { id: 'story-owned', creatorId: 'uid-author', projectName: 'Owned Realm' },
    isStoryReadOnly: false,
    routePath: '/foundry'
  });
  assert.equal(ownerAllowed.isArchitect, true);
  assert.equal(ownerAllowed.effectiveRole, BASTION_ROLES.ARCHITECT);

  const adminAllowed = resolveBastionSessionState({
    currentUser: { uid: 'uid-admin' },
    authState: { isAdmin: true, hasCloudAdminAccess: true },
    universeState: { id: 'story-any', creatorId: 'uid-author', projectName: 'Any Realm' },
    isStoryReadOnly: false,
    routePath: '/foundry'
  });
  assert.equal(adminAllowed.isArchitect, true);
  assert.equal(adminAllowed.effectiveRole, BASTION_ROLES.ARCHITECT);
});
