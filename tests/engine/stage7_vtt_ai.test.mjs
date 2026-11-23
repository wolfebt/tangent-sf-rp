/**
 * @file stage7_vtt_ai.test.mjs
 * @description Automated Verification Suite for Stage 7 / VTT AI Extensions:
 * - Phase 1: Hybrid 4-Tier Transport Cascade in VertexAIGateway & Omnicortex RAG + Mandate Grounding in AimeAgent
 * - Phase 2: 7-Tool DBMFunctionRegistry Inter-AI Tool Calling Dispatcher
 * - Phase 3 & 4: Autonomous Adversary Tactical Turn Executor (BastionAgent.executeAdversaryTurn) & Co-GM Whisper Pacing
 * - Phase 5: Real-Time Neuro-Symbolic Combat Narration (AimeAgent.narrateCombatStrike)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { VertexAIGateway } from '../../src/engine/ai/VertexAIGateway.ts';
import { AimeAgent } from '../../src/engine/ai/AimeAgent.ts';
import { BastionAgent } from '../../src/engine/ai/BastionAgent.ts';
import { DBMFunctionRegistry } from '../../src/engine/ai/DBMFunctionRegistry.ts';
import { useEngineStore, selectAllFusedTokens } from '../../src/engine/state/VolatileSharder.ts';
import { adjudicateActionCheck, formatMandateForPrompt } from '../../src/services/ade/adeEngineBridge.ts';
import {
  setInMemoryFirebaseIdToken,
  getInMemoryFirebaseIdToken
} from '../../src/utils/firebaseTokenStore.js';

test('Phase 1: VertexAIGateway 4-tier hybrid cascade & AimeAgent Omnicortex RAG + Mandate assembly', async () => {
  const response = await VertexAIGateway.generateContent('Describe the docking bay tactical layout.', {
    systemInstruction: 'You are AIME.',
    responseMimeType: 'text/plain'
  });

  assert.equal(response.success, true);
  assert.equal(typeof response.text, 'string');
  assert.ok(response.text.length > 10);
  assert.ok(['local_llama', 'local_ollama', 'cloud_proxy', 'client_gemini', 'simulation'].includes(response.provider));

  // Verify AimeAgent.assemblePrompt injects Omnicortex RAG and AdeStructuralMandate
  const mandate = adjudicateActionCheck({
    actorName: 'Kaelen Vance',
    actionDescription: 'Hack the blast door security console',
    skillName: 'Computers',
    attributeScore: 16,
    skillRank: 3,
    difficultyCr: 15,
    rollOverride: { d1: 8, d2: 7 }
  });

  const prompt = AimeAgent.assemblePrompt('Kaelen slices the blast door interlock.', {
    projectName: 'Deep Space Anomaly',
    activeSceneTitle: 'Hangar Deck 4',
    ragQuery: '2d10 dual resolution opposed defense',
    mandate
  });

  assert.ok(prompt.includes('OMNICORTEX'), 'Should inject Omnicortex RAG header');
  assert.ok(prompt.includes('STRUCTURAL MANDATE'), 'Should inject Neuro-Symbolic Structural Mandate');

  // Verify streamMandatedBeat streams chunks via AsyncGenerator
  const streamedChunks = [];
  for await (const chunk of AimeAgent.streamMandatedBeat(
    'Kaelen overrides the bulkhead.',
    mandate,
    { projectName: 'Deep Space Anomaly' }
  )) {
    streamedChunks.push(chunk);
  }
  assert.ok(streamedChunks.length > 0, 'streamMandatedBeat should emit chunks');
  assert.ok(streamedChunks.join('').trim().length > 10);
});

test('Phase 2: DBMFunctionRegistry registers and executes canonical Stage 7 tools', async () => {
  const declarations = DBMFunctionRegistry.getDeclarations();
  assert.ok(declarations.length >= 7, 'Should expose at least 7 canonical Stage 7 tool declarations');

  const toolNames = declarations.map((d) => d.name);
  const requiredTools = [
    'query_bastion_for_statblock',
    'calculate_combat_odds',
    'resolve_called_shot',
    'evaluate_economatrix_acquisition',
    'query_omnicortex_rag',
    'synthesize_adversary_tactic',
    'evaluate_combat_pacing_whisper'
  ];
  for (const reqTool of requiredTools) {
    assert.ok(toolNames.includes(reqTool), `Missing required tool: ${reqTool}`);
  }

  // 1. query_bastion_for_statblock
  const statRes = await DBMFunctionRegistry.executeToolCall({
    name: 'query_bastion_for_statblock',
    args: { concept: 'Vanguard Enforcer', species: 'Synthetic', techLevel: 4 }
  });
  assert.equal(statRes.validation.isValid, true);
  assert.equal(statRes.validation.totalBpSpent, 150);

  // 2. calculate_combat_odds with tactical modifiers
  const oddsRes = await DBMFunctionRegistry.executeToolCall({
    name: 'calculate_combat_odds',
    args: {
      attackBonus: 6,
      targetDefense: 15,
      damageFormula: '2d10+4',
      armorDr: 6,
      rangeBracketId: 'short',
      coverTypeId: 'partial',
      hasHighGround: true,
      isFlanked: true
    }
  });
  assert.equal(typeof oddsRes.hitProbabilityPercent, 'number');
  assert.ok(oddsRes.tacticalModifiersSummary.length > 0);

  // 3. resolve_called_shot (canonical optics penalty is -5 per 3.00 COMBAT.md)
  const shotRes = await DBMFunctionRegistry.executeToolCall({
    name: 'resolve_called_shot',
    args: { targetLocation: 'optics', incomingDamage: 28, armorDr: 6, targetMaxHp: 30 }
  });
  assert.equal(shotRes.attackPenalty, -5);
  assert.ok(shotRes.netDamage > 0);
  assert.ok(shotRes.traumaEffect.includes('Blindness'));

  // 4. evaluate_economatrix_acquisition
  const econRes = await DBMFunctionRegistry.executeToolCall({
    name: 'evaluate_economatrix_acquisition',
    args: { itemCostDc: 15, wealthScore: 10 }
  });
  assert.equal(econRes.goldenRuleVerified, true);
  assert.equal(econRes.isAutoBuy, false);
  assert.ok(econRes.liquidityGapCredits > 0);

  // 5. query_omnicortex_rag
  const ragRes = await DBMFunctionRegistry.executeToolCall({
    name: 'query_omnicortex_rag',
    args: { query: 'Economatrix TSC wealth decay', topK: 3 }
  });
  assert.ok(ragRes.vectorChunks.length > 0);

  // 6. synthesize_adversary_tactic
  const tacticRes = await DBMFunctionRegistry.executeToolCall({
    name: 'synthesize_adversary_tactic',
    args: {
      adversary: { id: 'enemy-1', name: 'Sniper Unit', archetype: 'Artillery Sniper', current_hp: 40, base_hp: 40 },
      heroes: [{ id: 'hero-1', name: 'Kaelen', is_persona: true, current_hp: 25, base_hp: 60, armor_dr: 4 }]
    }
  });
  assert.equal(tacticRes.tactic.roleKey, 'sniper');
  assert.equal(tacticRes.tactic.targetId, 'hero-1');

  // 7. evaluate_combat_pacing_whisper
  const pacingRes = await DBMFunctionRegistry.executeToolCall({
    name: 'evaluate_combat_pacing_whisper',
    args: {
      tokens: [
        { id: 'hero-1', name: 'Kaelen', is_persona: true, current_health: 5, base_health: 30 },
        { id: 'enemy-1', name: 'SecBot', is_persona: false, current_health: 30, base_health: 30 }
      ],
      roundNumber: 3,
      executeCardId: 'reinforcement_incursion'
    }
  });
  assert.equal(pacingRes.pacing.pacingState, 'crisis');
  assert.ok(pacingRes.mutation.spawnedTokens.length >= 2);
});

test('Phase 3 & 5: BastionAgent.executeAdversaryTurn & AimeAgent.narrateCombatStrike on live Stage store', async () => {
  const store = useEngineStore.getState();

  // Load 1 Hero Persona and 1 Hostile Bruiser into the Stage engine store
  store.loadStaticEntitiesBatch([
    {
      id: 'hero-kaelen',
      name: 'Kaelen Vance',
      species: 'Human',
      archetype: 'Infiltrator',
      size_modifier: 0,
      base_hp: 60,
      base_vitality: 30,
      base_health: 30,
      armor_dr: 4,
      speed_ft: 30,
      avatar_url: '',
      is_persona: true
    },
    {
      id: 'adv-juggernaut',
      name: 'Shock Juggernaut',
      species: 'Cyborg',
      archetype: 'Heavy Bruiser',
      size_modifier: 1,
      base_hp: 60,
      base_vitality: 30,
      base_health: 30,
      armor_dr: 8,
      speed_ft: 30,
      avatar_url: '',
      is_persona: false
    }
  ]);

  // Position Hero at (140, 140) and Adversary at (350, 140) (15ft apart)
  useEngineStore.getState().updatePosition('hero-kaelen', 140, 140);
  useEngineStore.getState().updatePosition('adv-juggernaut', 350, 140);

  // Execute autonomous turn with high roll override to guarantee hit
  const turnReport = await BastionAgent.executeAdversaryTurn('adv-juggernaut', {
    rollOverride: { d1: 9, d2: 8 },
    weaponType: 'plasma',
    baseRawDamage: 24
  });

  assert.equal(turnReport.success, true);
  assert.equal(turnReport.adversaryId, 'adv-juggernaut');
  assert.equal(turnReport.targetId, 'hero-kaelen');
  assert.ok(turnReport.movement.distanceMovedFt > 0, 'Bruiser should advance toward target');
  assert.equal(turnReport.attackRoll.isHit, true, 'Roll 9+8 + bonus vs CR 15 should hit');
  assert.ok(turnReport.damageDealt > 0, 'Should deal net damage after Armor DR + CON soak');
  assert.ok(turnReport.tacticalBark.length > 0, 'Should include a tactical bark');
  assert.ok(turnReport.aimeNarration.length > 0, 'Should include AIME combat strike narration');

  // Verify hero vitality/HP decreased in live Zustand store
  const updatedTokens = selectAllFusedTokens(useEngineStore.getState());
  const updatedHero = updatedTokens.find((t) => t.id === 'hero-kaelen');
  assert.ok(updatedHero.current_hp < 60, 'Hero HP on Stage should be reduced by adversary strike');

  // Verify BastionAgent.evaluateEncounterBalance
  const balance = BastionAgent.evaluateEncounterBalance(2);
  assert.equal(typeof balance.tensionScore, 'number');
  assert.ok(Array.isArray(balance.suggestedCards));

  // Verify miss / fumble & non-existent adversary edge cases
  const fumbleReport = await BastionAgent.executeAdversaryTurn('adv-juggernaut', {
    rollOverride: { d1: 1, d2: 1 },
    weaponType: 'kinetic',
    baseRawDamage: 24
  });
  assert.equal(fumbleReport.success, true);
  assert.equal(fumbleReport.attackRoll.isCriticalFumble, true);
  assert.equal(fumbleReport.attackRoll.isHit, false);
  assert.equal(fumbleReport.damageDealt, 0);

  assert.throws(
    () => BastionAgent.executeAdversaryTurn('non-existent-id', {}),
    /not found on The Stage/
  );
});

async function withMockAiEnv({ fetchImpl, localStorageData = {}, firebaseToken = 'mock.firebase.jwt.token' }, fn) {
  const prevFetch = globalThis.fetch;
  const hasLocalStorage = Object.prototype.hasOwnProperty.call(globalThis, 'localStorage');
  const prevLocalStorage = globalThis.localStorage;
  const prevToken = getInMemoryFirebaseIdToken();
  const calls = [];

  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return fetchImpl(String(url), init, calls.length);
  };
  globalThis.localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(localStorageData, k) ? localStorageData[k] : null),
    setItem: (k, v) => { localStorageData[k] = String(v); },
    removeItem: (k) => { delete localStorageData[k]; }
  };
  setInMemoryFirebaseIdToken(firebaseToken);

  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = prevFetch;
    if (hasLocalStorage) {
      globalThis.localStorage = prevLocalStorage;
    } else {
      delete globalThis.localStorage;
    }
    setInMemoryFirebaseIdToken(prevToken || '');
  }
}

test('Phase 6: VertexAIGateway 4-tier transport, executeWithTools multi-turn loop, and mandated simulation', async () => {
  // 1. Tier 2 Cloud Proxy: markdown fence stripping & gemini-1.5-flash -> gemini-2.5-flash normalization
  await withMockAiEnv(
    {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Here is telemetry:\n```json\n{"tacticalStatus":"nominal","sectorThreat":3}\n```' }]
              }
            }
          ]
        })
      })
    },
    async (calls) => {
      const res = await VertexAIGateway.generateContent('Assess sector status', {
        model: 'gemini-1.5-flash',
        responseMimeType: 'application/json'
      });
      assert.equal(res.success, true);
      assert.equal(res.isSimulated, false);
      assert.equal(res.provider, 'cloud_proxy');
      assert.deepEqual(res.data, { tacticalStatus: 'nominal', sectorThreat: 3 });
      const sentBody = JSON.parse(calls[0].init.body);
      assert.equal(sentBody.model, 'gemini-2.5-flash');
    }
  );

  // 2. Tier 1 Local Llama vs multimodal inlineData skip to Cloud Proxy
  await withMockAiEnv(
    {
      fetchImpl: async (url) => {
        if (url.includes('localhost:8080')) {
          return { ok: true, status: 200, json: async () => ({ content: 'Local llama sector briefing.' }) };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'Cloud Vision processed image.' }] } }]
          })
        };
      }
    },
    async (calls) => {
      const textLocal = await VertexAIGateway.generateContent('Briefing', {
        localEndpoint: 'http://localhost:8080'
      });
      assert.equal(textLocal.provider, 'local_llama');
      assert.equal(textLocal.text, 'Local llama sector briefing.');

      const multimodalVision = await VertexAIGateway.generateContent('Inspect battlemap', {
        localEndpoint: 'http://localhost:8080',
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Analyze walls' },
              { inlineData: { mimeType: 'image/png', data: 'iVBORw0KGgo=' } }
            ]
          }
        ]
      });
      assert.equal(multimodalVision.provider, 'cloud_proxy');
      assert.ok(calls[1].url.includes('/geminiProxy'), 'Multimodal inlineData should bypass text-only Tier 1 local LLM');
    }
  );

  // 3. Multi-turn VertexAIGateway.executeWithTools (functionCall -> toolExecutor -> functionResponse)
  await withMockAiEnv(
    {
      fetchImpl: async (_url, _init, callIdx) => {
        if (callIdx === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        functionCall: {
                          name: 'resolve_called_shot',
                          args: { targetLocation: 'optics', incomingDamage: 24, armorDr: 4, targetMaxHp: 30 }
                        }
                      }
                    ]
                  }
                }
              ]
            })
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Optics shattered; -5 strike penalty and Sensor Blindness applied.' }]
                }
              }
            ]
          })
        };
      }
    },
    async (calls) => {
      const decls = DBMFunctionRegistry.getDeclarations();
      const execRes = await VertexAIGateway.executeWithTools(
        'Evaluate a called shot to optics for 24 kinetic damage vs DR 4',
        decls,
        (call) => DBMFunctionRegistry.executeToolCall(call)
      );
      assert.equal(execRes.success, true);
      assert.equal(execRes.isSimulated, false);
      assert.equal(execRes.toolCalls.length, 1);
      assert.equal(execRes.toolCalls[0].name, 'resolve_called_shot');
      assert.equal(execRes.toolCalls[0].result.attackPenalty, -5);
      assert.ok(execRes.text.includes('Optics shattered'));
      const followUpBody = JSON.parse(calls[1].init.body);
      assert.equal(followUpBody.contents[1].role, 'model');
      assert.equal(followUpBody.contents[2].role, 'user');
      assert.equal(followUpBody.contents[2].parts[0].functionResponse.name, 'resolve_called_shot');
    }
  );

  // 4. Mandated Tier 4 fallbackSimulation honors formatMandateForPrompt
  await withMockAiEnv(
    {
      fetchImpl: async () => {
        throw new TypeError('Offline mock');
      },
      firebaseToken: ''
    },
    async () => {
      const mandate = adjudicateActionCheck({
        actorName: 'Kaelen',
        actionDescription: 'Hack the airlock console',
        skillName: 'Computers',
        attributeScore: 16,
        skillRank: 4,
        difficultyCr: 15,
        rollOverride: { d1: 9, d2: 7 }
      });
      const prompt = formatMandateForPrompt(mandate);
      const simRes = await VertexAIGateway.generateContent(prompt, { responseMimeType: 'text/plain' });
      assert.equal(simRes.isSimulated, true);
      assert.equal(simRes.provider, 'simulation');
      assert.ok(simRes.text.includes('AIME MANDATED BEAT'));
      assert.ok(simRes.text.includes('EXECUTE_SUCCESS'));
      assert.ok(simRes.text.includes('Kaelen successfully accomplishes'));
    }
  );
});
