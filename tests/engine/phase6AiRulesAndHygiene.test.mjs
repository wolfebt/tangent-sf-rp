/**
 * @file phase6AiRulesAndHygiene.test.mjs
 * @description Phase 6 Verification Suite covering:
 * - CanonicalCombatMath & cross-engine parity across DamagePipeline, DBMFunctionRegistry,
 *   autoCombatResolver, adeEngineBridge, encounterSimService, and rulesAdjudicatorService.
 * - AI pipeline convergence (bastionService SSE + functionCalls, aimeService bare-node & linkedContextElements,
 *   superPromptSynthesizer v6 rules + elementsCatalog, MapWallingProcessor gemini-2.5-flash + inlineData + windows,
 *   cronicleService gemini-2.5-flash default & preferredModel forwarding).
 * - Security & Persistence fixes (spectatorSanitizer recursive redaction & fog/wall filtering,
 *   adeElementPersistence Persona failure check & moduleElementId key alignment).
 * - Codebase hygiene checks (_archive removal & package.json dependency placement).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CANONICAL_DEFAULT_DEFENSE_CR,
  CANONICAL_SIZE_TABLE,
  resolveTangent2d10Check,
  compute2d10HitOdds,
  calculateCrossDomainArmorDR,
  calculateDamageMitigation,
  routePoolDamage
} from '../../src/engine/rules/CanonicalCombatMath.ts';
import { DamagePipeline } from '../../src/engine/rules/DamagePipeline.ts';
import { DBMFunctionRegistry } from '../../src/engine/ai/DBMFunctionRegistry.ts';
import { resolveAutonomousAttack } from '../../src/services/autoCombatResolver.js';
import { adjudicateActionCheck } from '../../src/services/ade/adeEngineBridge.ts';
import { runMonteCarloEncounterSim } from '../../src/services/encounterSimService.js';
import {
  SIZE_MODIFIERS,
  computeTacticalAttackModifiers
} from '../../src/services/rulesAdjudicatorService.js';

import { fetchGeminiContent } from '../../src/services/bastionService.js';
import { formatContext } from '../../src/services/aimeService.js';
import {
  buildStaticRulesPrefix,
  synthesizeSuperPrompt
} from '../../src/services/superPromptSynthesizer.js';
import { MapWallingProcessor } from '../../src/engine/ai/MapWallingProcessor.ts';
import { extractNarrativeDeltas } from '../../src/services/cronicleService.js';

import { sanitizeMapForSpectator } from '../../src/utils/spectatorSanitizer.js';
import { persistAdeElement } from '../../src/utils/adeElementPersistence.js';

import {
  setInMemoryFirebaseIdToken,
  getInMemoryFirebaseIdToken
} from '../../src/utils/firebaseTokenStore.js';

test('CanonicalCombatMath & Cross-Engine Combat Parity', async () => {
  // 1. 2d10 Opposed vs Static tie rule, Nat 20 (+10), Nat 2 (flat -10)
  const tiedOpposed = resolveTangent2d10Check({
    d1: 5,
    d2: 5,
    modifier: 5,
    targetCR: CANONICAL_DEFAULT_DEFENSE_CR,
    isOpposed: true
  });
  assert.equal(tiedOpposed.total, 15);
  assert.equal(tiedOpposed.isSuccess, false, 'Defender wins ties in opposed combat');

  const tiedStatic = resolveTangent2d10Check({
    d1: 5,
    d2: 5,
    modifier: 5,
    targetCR: 15,
    isOpposed: false
  });
  assert.equal(tiedStatic.isSuccess, true, 'Static checks succeed on exact CR match');

  const nat20 = resolveTangent2d10Check({ d1: 10, d2: 10, modifier: 4, targetCR: 15, isOpposed: true });
  assert.equal(nat20.isCrit, true);
  assert.equal(nat20.effectiveDiceSum, 30);
  assert.equal(nat20.total, 34);

  const nat2 = resolveTangent2d10Check({ d1: 1, d2: 1, modifier: 12, targetCR: 5, isOpposed: false });
  assert.equal(nat2.isFumble, true);
  assert.equal(nat2.effectiveDiceSum, -10);
  assert.equal(nat2.total, 2);
  assert.equal(nat2.isSuccess, false);

  // 2. DBMFunctionRegistry vs CanonicalCombatMath odds & mitigation parity
  const oddsCanon = compute2d10HitOdds(5, 15, { isOpposed: true });
  const oddsTool = await DBMFunctionRegistry.executeToolCall({
    name: 'calculate_combat_odds',
    args: { attackBonus: 5, targetDefense: 15, armorDr: 4 }
  });
  assert.equal(oddsTool.hitProbabilityPercent, oddsCanon.hitProbabilityPercent);
  // 2d10 + 5 > 15 requires sum >= 11 (55) + double-tens >= 11 already counted -> 55 outcomes
  assert.equal(oddsTool.hitProbabilityPercent, 55);

  // 3. Mitigation order: Force halves DR before Penetration, Penetration clamped >= 0, dimensionality bypass, 0 Stamina floor
  const drStacked = calculateCrossDomainArmorDR([10, 8], 'diminishing_returns');
  assert.equal(drStacked, 12); // 10 + ceil(8/5) = 12

  const forceMit = calculateDamageMitigation({
    rawDamage: 20,
    armorLayers: [10],
    damageType: 'force',
    penetration: 2,
    staminaToughness: 4
  });
  // floor(10 / 2) = 5; 5 - 2 pen = 3 DR; 20 - 3 = 17 penetrating; 17 - 4 STA = 13 net
  assert.equal(forceMit.effectiveArmorDr, 3);
  assert.equal(forceMit.netDamage, 13);

  const dimMit = calculateDamageMitigation({
    rawDamage: 12,
    armorLayers: [15],
    damageType: 'dimensional',
    staminaToughness: 20
  });
  assert.equal(dimMit.effectiveArmorDr, 0, 'Dimensional bypasses physical DR');
  assert.equal(dimMit.netDamage, 0, 'Stamina floors damage to 0, never min 1');

  const negPen = calculateDamageMitigation({
    rawDamage: 12,
    armorLayers: [6],
    penetration: -5,
    staminaToughness: 0
  });
  assert.equal(negPen.effectiveArmorDr, 6, 'Negative penetration must clamp to 0');

  // DamagePipeline parity
  const dp = new DamagePipeline();
  const dpStrike = dp.resolveStrike(
    { rawDamage: 20, armorPenetration: 2, damageType: 'force', isCritical: false, isCalledShot: false },
    { armor_dr: 10 },
    [10],
    4,
    0,
    5
  );
  assert.equal(dpStrike.netDamage, forceMit.netDamage);

  // autoCombatResolver Defender Wins Ties & no spurious non-called-shot status
  const autoTie = resolveAutonomousAttack(
    { attackBonus: 3, attributeMod: 2, weaponDamage: 10 },
    { defenseDc: 15, armorDr: 2 },
    { diceOverride: [5, 5], isCalledShot: false }
  );
  assert.equal(autoTie.totalAttack, 15);
  assert.equal(autoTie.isHit, false, 'autoCombatResolver must apply Defender Wins Ties');
  assert.equal(autoTie.statusInflicted, null);

  // adeEngineBridge canonical Crit (+10) & retired skill aliases
  const adeCrit = adjudicateActionCheck({
    actionDescription: 'Hack console',
    operative: { name: 'Kaelen', attributes: { logic: 4 }, skills: { Slicing: 5 } },
    skillName: 'Computers',
    targetCR: 15,
    rollOverride: [10, 10]
  });
  assert.equal(adeCrit.systemIntent, 'CRITICAL_TRIUMPH');
  assert.equal(adeCrit.diceSummary?.totalCheck, 39); // 20 + 10 (crit) + 4 (logic) + 5 (Slicing alias)

  // encounterSimService canonical zero-damage soak & synthetic structure support
  const sim = runMonteCarloEncounterSim(
    [{ id: 'h1', hp: 30, armorDr: 20, toughness: 10, defense: 25, attackMod: 12, avgDamage: 20 }],
    [{ id: 'e1', hp: 10, armorDr: 0, toughness: 0, defense: 10, attackMod: 0, avgDamage: 4 }],
    20
  );
  assert.equal(sim.winRate, 100);

  // rulesAdjudicatorService 14-size table & directional signs
  assert.equal(SIZE_MODIFIERS.length, 14);
  assert.equal(CANONICAL_SIZE_TABLE.length, 14);
  const giant = SIZE_MODIFIERS.find((s) => s.id === 'enormous');
  const titanic = SIZE_MODIFIERS.find((s) => s.id === 'titanic');
  assert.equal(giant?.defenseMod, -32);
  assert.equal(titanic?.defenseMod, -64);

  const sizeDiff = computeTacticalAttackModifiers({
    attackerSizeId: 'medium',
    targetSizeId: 'large'
  });
  assert.equal(sizeDiff.netAttackMod, 2, 'Large target is +2 easier to hit than Medium');

  // routePoolDamage Vitality-first then Health overflow
  const poolRes = routePoolDamage({
    netDamage: 40,
    isSynthetic: false,
    isCritical: false,
    currentVitality: 30,
    currentHealth: 30,
    staminaScore: 4
  });
  assert.equal(poolRes.vitalityDamage, 30);
  assert.equal(poolRes.healthDamage, 10);
  assert.equal(poolRes.remainingVitality, 0);
  assert.equal(poolRes.remainingHealth, 20);
});

test('AI Pipeline Convergence: SSE tool parsing, AIME bare context, SuperPrompt v6, MapWalling inlineData, Cronicle model', async () => {
  const prevFetch = globalThis.fetch;
  const prevToken = getInMemoryFirebaseIdToken();

  try {
    // 1. bastionService.fetchGeminiContent SSE parses BOTH text chunks AND functionCall parts + trailing buffer
    const encoder = new TextEncoder();
    const ssePayload =
      'data: {"candidates":[{"content":{"parts":[{"text":"Checking odds... "}]}}]}\n\n' +
      'data: {"candidates":[{"content":{"parts":[{"functionCall":{"name":"resolve_called_shot","args":{"targetLocation":"optics","incomingDamage":20}}}]}}]}';

    globalThis.fetch = async (url) => {
      assert.ok(String(url).includes('streamGenerateContent?alt=sse'));
      return {
        ok: true,
        status: 200,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(ssePayload));
            controller.close();
          }
        })
      };
    };

    const chunks = [];
    const sseResult = await fetchGeminiContent(
      'AIzaFakeClientKey1234567890123456',
      {
        contents: [{ role: 'user', parts: [{ text: 'Attack optics' }] }],
        tools: [{ functionDeclarations: [{ name: 'resolve_called_shot' }] }]
      },
      {
        onStreamChunk: (piece) => chunks.push(piece)
      }
    );
    assert.deepEqual(chunks, ['Checking odds... ']);
    const sseParts = sseResult.candidates[0].content.parts;
    assert.equal(sseParts[0].text, 'Checking odds... ');
    assert.equal(sseParts[1].functionCall.name, 'resolve_called_shot');

    // 2. aimeService.formatContext accepts bare scenario nodes + linkedContextElements
    const bareScenario = {
      id: 'sc_dock',
      type: 'scenario',
      title: 'Orbital Drydock 9',
      content: 'Zero-G salvage operation.',
      fields: { oneLinePitch: 'Decommissioned freighter dock' }
    };
    const formattedBare = formatContext(bareScenario, 'Inspect the drydock');
    assert.ok(formattedBare.includes('Orbital Drydock 9'));
    assert.ok(formattedBare.includes('BASTION CANONICAL STATIC RULES PREFIX'));

    const formattedLinked = formatContext(
      {
        projectName: 'Voidfall',
        linkedContextElements: [
          {
            id: 'npc_1',
            type: 'Persona',
            title: 'Warden Korr',
            fields: { oneLinePitch: 'Cybernetic dockmaster' }
          }
        ]
      },
      'Describe the scene'
    );
    assert.ok(formattedLinked.includes('Warden Korr'));

    // 3. superPromptSynthesizer Canonical v6 rules & elementsCatalog resolution
    const prefix = buildStaticRulesPrefix({ campaignName: 'Exodus' });
    assert.ok(prefix.includes('Cross-Domain Diminishing Returns'));
    assert.ok(prefix.includes('ceil(Other Layer DR / 5)'));
    assert.ok(!prefix.includes('100% + Second Highest'));
    assert.ok(prefix.includes('-5 Optics/Sensors'));
    assert.ok(!prefix.includes('-3 Optics'));

    const synth = synthesizeSuperPrompt({
      activeNode: {
        id: 'scene_1',
        title: 'Airlock Ambush',
        assetHub: [{ assetId: 'asset_blade', assetType: 'Equipment', assetTitle: 'Plasma Edge', importance: 'high' }]
      },
      elementsCatalog: [
        { id: 'asset_blade', type: 'Equipment', title: 'Plasma Edge', fields: { functionPurpose: 'Monomolecular cutter' } }
      ],
      taskPrompt: 'Frame the ambush'
    });
    assert.ok(synth.includes('Monomolecular cutter'));

    // 4. MapWallingProcessor uses gemini-2.5-flash, attaches inlineData, and preserves 'window' walls
    const capturedRequests = [];
    setInMemoryFirebaseIdToken('mock.firebase.jwt.token');
    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init.body);
      capturedRequests.push({ url: String(url), body });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      detectedWalls: [
                        { x1: 0, y1: 0, x2: 1, y2: 0, type: 'solid' },
                        { x1: 0.2, y1: 0.5, x2: 0.4, y2: 0.5, type: 'window' },
                        { x1: 0.5, y1: 0.5, x2: 0.6, y2: 0.5, type: 'door' }
                      ]
                    })
                  }
                ]
              }
            }
          ]
        })
      };
    };

    const wallRes = await MapWallingProcessor.processMapWalling({
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      imageWidth: 1000,
      imageHeight: 1000
    });
    assert.equal(wallRes.success, true);
    assert.equal(capturedRequests[0].body.model, 'gemini-2.5-flash');
    const sentParts = capturedRequests[0].body.contents[0].parts;
    assert.ok(sentParts.some((p) => p.inlineData?.mimeType === 'image/png'));
    const windowWall = wallRes.walls.find((w) => w.wallType === 'window');
    assert.ok(windowWall, 'Window wallType must be preserved');
    assert.equal(windowWall.blocksLight, false);
    assert.equal(windowWall.blocksMovement, true);

    // 5. cronicleService defaults to gemini-2.5-flash and forwards model via preferredModel
    capturedRequests.length = 0;
    globalThis.fetch = async (_url, init) => {
      capturedRequests.push(JSON.parse(init.body));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '[]' }] } }]
        })
      };
    };

    await extractNarrativeDeltas({
      prose: 'Kaelen bandaged her shoulder and rebooted the reactor core carefully.',
      cronicle: { personas: { p1: { id: 'p1', name: 'Kaelen' } }, locations: {} }
    });
    assert.equal(capturedRequests[0].model, 'gemini-2.5-flash');
  } finally {
    globalThis.fetch = prevFetch;
    setInMemoryFirebaseIdToken(prevToken || '');
  }
});

test('Security & Persistence Fixes: spectatorSanitizer & adeElementPersistence', async () => {
  // 1. spectatorSanitizer recursive secret strip + fog/walls filtering + secret door mask
  const rawMap = {
    id: 'map_sec_1',
    title: 'Reactor Vault',
    authorUid: 'local',
    creatorId: 'system',
    tokens: [
      {
        id: 't_visible',
        name: 'Kaelen',
        gmNotes: 'Top secret',
        metadata: { architectNotes: 'Nested secret', hp: 30 },
        triggers: [{ id: 'tr1', script: 'dealDamage(99)', label: 'Alarm' }]
      },
      { id: 't_hidden', name: 'Sniper', isHidden: true },
      { id: 't_gm_layer', name: 'Boss', layer: 'gm' }
    ],
    fog: [
      { id: 'fog_vis', x: 0, y: 0 },
      { id: 'fog_snake', x: 10, y: 10, is_hidden: true },
      { id: 'fog_gm', x: 20, y: 20, layer: 'gm' }
    ],
    walls: [
      { id: 'w_secret_closed', type: 'door', isSecret: true, isOpen: false, properties: { lockDc: 22 } },
      { id: 'w_secret_open', type: 'door', isSecret: true, isOpen: true },
      { id: 'w_gm_only', type: 'solid', gmOnly: true },
      { id: 'w_invisible', type: 'solid', visible: false }
    ],
    objects: [
      { id: 'obj_safe', name: 'Crate', customFields: { secrets: 'Concealed panel', color: 'gray' } },
      { id: 'obj_trap', name: 'Laser Grid', isTrap: true }
    ]
  };

  const sanitized = sanitizeMapForSpectator(rawMap, { uid: 'gm_uid_42' });
  assert.equal(sanitized.authorUid, 'gm_uid_42');
  assert.equal(sanitized.tokens.length, 1);
  assert.equal(sanitized.tokens[0].gmNotes, undefined);
  assert.equal(sanitized.tokens[0].metadata.architectNotes, undefined);
  assert.equal(sanitized.tokens[0].metadata.hp, 30);
  assert.equal(sanitized.tokens[0].triggers[0].script, undefined);
  assert.equal(sanitized.tokens[0].triggers[0].label, 'Alarm');
  assert.equal(sanitized.fog.length, 1);
  assert.equal(sanitized.fog[0].id, 'fog_vis');
  assert.equal(sanitized.walls.length, 2);
  assert.equal(sanitized.walls[0].type, 'solid');
  assert.equal(sanitized.walls[0].isSecret, false);
  assert.equal(sanitized.walls[0].properties.lockDc, undefined);
  assert.equal(sanitized.walls[1].isSecret, true);
  assert.equal(sanitized.objects.length, 1);
  assert.equal(sanitized.objects[0].customFields.secrets, undefined);
  assert.equal(rawMap.tokens[0].metadata.architectNotes, 'Nested secret', 'Input map must stay unmutated');

  // 2. adeElementPersistence Branch 1 Persona failure check + Branch 2 moduleElementId alignment
  const toasts = [];
  const moduleUpdates = [];

  const failPersona = await persistAdeElement({
    element: {
      id: 'elem_p_1',
      type: 'Persona',
      title: 'Kaelen Vance',
      isFolioPersona: true,
      isPinnedToModule: true,
      personaData: { attributes: { might: 2 } }
    },
    saveCurrentToRoster: async () => ({ ok: false }),
    updateSavedElement: async (id, val) => moduleUpdates.push({ id, val }),
    showToast: (t) => toasts.push(t)
  });
  assert.equal(failPersona, null, 'Failed saveCurrentToRoster must abort and return null');
  assert.equal(moduleUpdates.length, 0, 'Failed saveCurrentToRoster must not sync module pin');
  assert.equal(toasts[0]?.type, 'error');

  const okPersona = await persistAdeElement({
    element: {
      id: 'persona_folio_1',
      moduleElementId: 'mod_elem_p1',
      type: 'Persona',
      title: 'Kaelen Vance',
      isFolioPersona: true
    },
    elementsCatalog: [{ id: 'mod_elem_p1', type: 'Persona', title: 'Old Title' }],
    saveCurrentToRoster: async () => true,
    updateSavedElement: async (id, val) => moduleUpdates.push({ id, val }),
    showToast: (t) => toasts.push(t)
  });
  assert.ok(okPersona);
  assert.equal(moduleUpdates[0].id, 'mod_elem_p1', 'Must update module catalog using moduleElementId key');

  const cortexUpdates = [];
  const syncedGear = await persistAdeElement({
    element: {
      id: 'cortex_gear_9',
      moduleElementId: 'mod_gear_9',
      type: 'Equipment',
      title: 'Plasma Lance',
      fields: { techLevel: 4, costCr: 20 }
    },
    elementsCatalog: [{ id: 'mod_gear_9', type: 'Equipment', title: 'Plasma Lance' }],
    saveEntry: async (payload) => ({ ok: true, id: payload.id }),
    updateSavedElement: async (id, val) => cortexUpdates.push({ id, val }),
    showToast: (t) => toasts.push(t)
  });
  assert.equal(syncedGear.id, 'mod_gear_9');
  assert.equal(syncedGear.dbmSyncStatus, 'synced');
  assert.equal(cortexUpdates[0].id, 'mod_gear_9');
  assert.equal(cortexUpdates[0].val.id, 'mod_gear_9');
});

test('Codebase Hygiene: dead archive deleted and script-only deps moved out of dependencies', () => {
  const rootDir = process.cwd();
  assert.equal(fs.existsSync(path.join(rootDir, 'src/pages/Foundry/_archive')), false, '_archive directory must be removed');
  assert.equal(fs.existsSync(path.join(rootDir, 'src/services/groupService.js')), false, 'groupService.js must be removed');
  assert.equal(fs.existsSync(path.join(rootDir, 'tsconfig.strict.json')), true, 'tsconfig.strict.json must exist');

  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  for (const dep of ['marked', '@google/genai', '@modelcontextprotocol/sdk', 'glob', 'gray-matter']) {
    assert.equal(pkg.dependencies[dep], undefined, `${dep} should not be in production dependencies`);
  }
  for (const devDep of ['@google/genai', '@modelcontextprotocol/sdk', 'glob', 'gray-matter']) {
    assert.ok(pkg.devDependencies[devDep], `${devDep} should remain in devDependencies for CLI scripts`);
  }
  assert.ok(pkg.scripts['typecheck:strict'], 'typecheck:strict script must exist');
});
