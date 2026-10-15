import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_RULES_COMPENDIUM,
  loadCompendiumSeedDataset,
  queryOmnicortexRAG,
  formatRagContextForBastion
} from '../../src/services/omnicortexVectorRag.ts';
import {
  synthesizeCharacterWithBastion
} from '../../src/services/bastionCharacterEngine.js';
import {
  queryRulebook,
  searchRulesFtsAsync
} from '../../src/services/rulebookRagService.js';
import {
  BastionAgent
} from '../../src/engine/ai/BastionAgent.ts';
import {
  DBMFunctionRegistry
} from '../../src/engine/ai/DBMFunctionRegistry.ts';
import {
  CANONICAL_WHISPER_CARDS,
  analyzeCombatPacing,
  executeWhisperCardAction
} from '../../src/services/bastionWhisperService.js';
import {
  resolveCortexMenu
} from '../../src/components/UI/ContextMenu/resolvers/cortexResolver.js';
import {
  generateSelectiveFields
} from '../../src/services/bastionService.js';

test('BASTION AI Pipelines — End-to-End Remediation & Verification Suite', async (t) => {

  await t.test('P0-1: Omnicortex Vector RAG preserves embedding dimensions and foundational chunk retrieval after Compendium Seed expansion', async () => {
    const initialCount = CANONICAL_RULES_COMPENDIUM.length;
    const initialDim = CANONICAL_RULES_COMPENDIUM[0]?.embedding?.length || 0;
    assert.ok(initialDim > 100, `Initial embedding dimension should be > 100, got ${initialDim}`);

    const preQuery = queryOmnicortexRAG('2d10 dual resolution opposed defense ties', 5);
    assert.ok(preQuery.length > 0, 'Pre-seed query should return results');
    assert.ok(
      preQuery.some(r => r.chunk.id === 'rule-combat-dual-resolution'),
      'Pre-seed query should retrieve rule-combat-dual-resolution'
    );

    await loadCompendiumSeedDataset();
    assert.ok(
      CANONICAL_RULES_COMPENDIUM.length > initialCount,
      `Compendium should expand after seed load (${initialCount} -> ${CANONICAL_RULES_COMPENDIUM.length})`
    );

    const expandedDim = CANONICAL_RULES_COMPENDIUM[0]?.embedding?.length || 0;
    assert.ok(
      expandedDim > initialDim,
      `Vocabulary/embedding dimension should expand (${initialDim} -> ${expandedDim})`
    );

    // Every single chunk (foundational + seeded) must have an embedding matching expandedDim
    for (const chunk of CANONICAL_RULES_COMPENDIUM) {
      assert.ok(Array.isArray(chunk.embedding), `Chunk ${chunk.id} missing embedding array`);
      assert.equal(
        chunk.embedding.length,
        expandedDim,
        `Chunk ${chunk.id} embedding length (${chunk.embedding.length}) != expandedDim (${expandedDim})`
      );
    }

    // Foundational combat rules must still be retrievable via cosine similarity after seed load
    const postQuery = queryOmnicortexRAG('2d10 dual resolution opposed defense defender wins ties cr 15', 5);
    const dualResMatch = postQuery.find(r => r.chunk.id === 'rule-combat-dual-resolution');
    assert.ok(dualResMatch, 'Foundational rule-combat-dual-resolution must remain retrievable after seed expansion');
    assert.ok(dualResMatch.chunk.text.includes('DEFENDER WINS ALL TIES'), 'Dual resolution chunk must state DEFENDER WINS ALL TIES');
    assert.ok(dualResMatch.chunk.text.includes('CR 15'), 'Dual resolution chunk must document Unopposed CR 15 baseline');

    const contextBlock = formatRagContextForBastion(postQuery);
    assert.ok(contextBlock.includes('CANONICAL OMNICORTEX RULES'), 'RAG context block header should be present');
  });

  await t.test('P0-2: Context Menu Cortex Resolver & Selective Autofill Bridge', async () => {
    let capturedPromptPayload = null;
    const menuItems = resolveCortexMenu(
      {
        subcategory: 'species',
        entityId: 'ursan_01',
        entityData: { id: 'ursan_01', name: 'Ursan' }
      },
      {},
      {
        executeBastionPrompt: (payload) => {
          capturedPromptPayload = payload;
        }
      }
    );

    const autofillItem = menuItems.find(item => item.id === 'bastion-autofill-fields');
    assert.ok(autofillItem, 'resolveCortexMenu must include bastion-autofill-fields action');
    autofillItem.onClick();

    assert.ok(capturedPromptPayload, 'Clicking autofill item must invoke executeBastionPrompt');
    assert.equal(capturedPromptPayload.isAutofill, true);
    assert.equal(capturedPromptPayload.applyTarget, 'autofill', 'Autofill payload must specify applyTarget: autofill');
    assert.equal(capturedPromptPayload.applyLabel, 'Apply to Entry', 'Autofill payload must provide Apply to Entry label');

    // Verify generateSelectiveFields supports ContextMenuContext legacy & canonical parameter keys
    // and deterministic character synthesis hook without requiring external network calls
    const charSelectiveRes = await generateSelectiveFields({
      targetFields: ['stats', 'mechanics', 'fivePillars', 'vitals'],
      editFormData: { name: 'Vanguard Kael', species: 'Ursan', archetype: 'Soldier' },
      customInstruction: 'Frontline heavy infantry breacher',
      currentConfig: { label: 'Character' }
    });

    assert.equal(charSelectiveRes.success, true, 'generateSelectiveFields should succeed for deterministic character stat fields');
    assert.ok(charSelectiveRes.generated, 'generateSelectiveFields must return .generated object');
    assert.ok(charSelectiveRes.data, 'generateSelectiveFields must also alias .data for ContextMenuContext compatibility');
    assert.equal(charSelectiveRes.generated.vitals.health, 30, 'Synthesized character vitals.health must be 30');
    assert.equal(charSelectiveRes.generated.vitals.vitality, 30, 'Synthesized character vitals.vitality must be 30');
  });

  await t.test('P1-1: Deterministic 5-Pillar Character Engine enforces canonical 30 VP / 30 HP / 60 SP pools', () => {
    const ursanVanguard = synthesizeCharacterWithBastion({
      prompt: 'Ursan heavy assault breacher and frontline tank',
      preferredSpecies: 'Ursan',
      preferredArchetype: 'The Sentinel'
    });

    assert.ok(ursanVanguard && ursanVanguard.character, 'Synthesized character should be returned');
    assert.equal(ursanVanguard.character.health, 30, 'Biological Health Pool must be flat 30 HP (Stamina grants Toughness DR, not HP)');
    assert.equal(ursanVanguard.character.vitality, 30, 'Vitality Pool must be flat 30 VP');
    assert.equal(ursanVanguard.character.structure, 60, 'Structure Pool must be flat 60 SP');
    assert.ok(ursanVanguard.character['attr-stamina'] >= 1, 'Ursan Sentinel should have positive Stamina');
    assert.equal(ursanVanguard.rulesLedger.startingBP, 150, 'Total CP/BP target must be 150');
  });

  await t.test('P1-1: Rulebook RAG Service returns canonical v6 rules and bridges with Omnicortex Vector RAG', async () => {
    const vitalityRules = queryRulebook('vitality health structure pool 30 60');
    assert.ok(vitalityRules.length > 0);
    const damagePoolRule = vitalityRules.find(r => r.id === 'damage_pools');
    assert.ok(damagePoolRule, 'Should retrieve damage_pools rule');
    assert.ok(damagePoolRule.content.includes('30'), 'damage_pools must reference 30 VP/HP');
    assert.ok(damagePoolRule.content.includes('60'), 'damage_pools must reference 60 Structure Pool');

    const karmaRules = queryRulebook('karma i got this second wind by will alone');
    const karmaChunk = karmaRules.find(r => r.id === 'karma_system');
    assert.ok(karmaChunk, 'Should retrieve karma_system rule');
    assert.ok(karmaChunk.content.includes('I Got This'), 'Karma rule must list canonical "I Got This" action');
    assert.ok(karmaChunk.content.includes('By Will Alone'), 'Karma rule must list canonical "By Will Alone" action');

    const ftsResults = await searchRulesFtsAsync('synthetic structure damage', null, 5);
    assert.ok(ftsResults.length > 0);
    assert.equal(ftsResults[0].id, 'damage_pools');
  });

  await t.test('P0-3 & P1-2: BastionAgent & DBMFunctionRegistry 5-Pillar Statblock & Called Shot integration', async () => {
    const result = await BastionAgent.generateStatblock(
      'Felid cyber-infiltrator with stealth optics',
      'Felid',
      3
    );

    assert.ok(result && result.draft, 'BastionAgent.generateStatblock should return a valid draft and validation');
    assert.equal(result.validation.totalBpSpent, 150, 'Statblock must balance to exactly 150 BP');
    assert.equal(result.validation.isValid, true, 'Statblock BP validation must be valid');
    assert.equal(result.draft.vitals.vitality, 30, 'Statblock vitals.vitality must be canonical 30');
    assert.equal(result.draft.vitals.health, 30, 'Statblock vitals.health must be canonical 30');
    assert.equal(result.draft.vitals.structure, 60, 'Statblock vitals.structure must be canonical 60');
    assert.ok(result.draft.pillars && result.draft.pillars.species, 'Statblock should include 5-Pillar metadata');

    const toolStatblockRes = await DBMFunctionRegistry.executeToolCall({
      name: 'query_bastion_for_statblock',
      args: {
        concept: 'Canid tactical officer',
        species: 'Canid',
        techLevel: 3
      }
    });
    assert.ok(toolStatblockRes.statblock);
    assert.equal(toolStatblockRes.validation.totalBpSpent, 150);
    assert.equal(toolStatblockRes.validation.isValid, true);

    const calledShotRes = await DBMFunctionRegistry.executeToolCall({
      name: 'resolve_called_shot',
      args: {
        targetLocation: 'head',
        incomingDamage: 16,
        armorDr: 4,
        targetMaxHp: 30
      }
    });
    assert.equal(calledShotRes.netDamage, 12);
    assert.equal(calledShotRes.attackPenalty, -2, 'Head called shot must carry -2 strike penalty');
    assert.equal(calledShotRes.disabledThreshold, 10, '1/3 of 30 HP is 10 HP');
    assert.equal(calledShotRes.destroyedThreshold, 20, '2/3 of 30 HP is 20 HP');
    assert.equal(calledShotRes.limbStatus, 'DISABLED');
    assert.equal(calledShotRes.saveRequired, 'Reason Save vs Damage');
  });

  await t.test('P2-1: Bastion Whisper Service executes deterministic VTT mechanical mutations', () => {
    const initialTokens = [
      { id: 'hero_1', name: 'Kael', linkedHeroId: 'h1', health: { current: 8, max: 30 }, karma: 1, conditions: [] },
      { id: 'enemy_1', name: 'SecBot', isEnemy: true, health: { current: 25, max: 30 }, conditions: [] }
    ];

    // 1. Reinforcement Incursion spawns 2 adversary tokens
    const dropPodAction = executeWhisperCardAction('reinforcement_incursion', initialTokens, 2);
    assert.equal(dropPodAction.cardId, 'reinforcement_incursion');
    assert.equal(dropPodAction.spawnedTokens.length, 2);
    assert.equal(dropPodAction.updatedTokens.length, 4);
    assert.equal(dropPodAction.encounterMutation.type, 'SPAWN_REINFORCEMENTS');

    // 2. Environmental Surge creates a hazard zone and applies Smoke Cover (+2 DC)
    const hazardAction = executeWhisperCardAction('environmental_surge', initialTokens, 3);
    assert.ok(hazardAction.hazardZone);
    assert.equal(hazardAction.hazardZone.damagePerRound, 4);
    assert.equal(hazardAction.hazardZone.coverBonusDc, 2);
    assert.ok(hazardAction.updatedTokens[0].conditions.includes('Smoke Cover (+2 DC)'));

    // 3. Heroic Inspiration grants +1 Karma to heroes and -2 Defense DC to enemies
    const inspirationAction = executeWhisperCardAction('heroic_inspiration', initialTokens, 4);
    assert.equal(inspirationAction.partyKarmaDelta, 1);
    assert.equal(inspirationAction.enemyDefenseDelta, -2);
    const updatedHero = inspirationAction.updatedTokens.find(t => t.id === 'hero_1');
    const updatedEnemy = inspirationAction.updatedTokens.find(t => t.id === 'enemy_1');
    assert.equal(updatedHero.karma, 2);
    assert.equal(updatedEnemy.defenseDcBonus, -2);
  });
});
