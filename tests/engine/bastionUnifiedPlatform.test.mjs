import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BASTION_ROLES,
  resolveBastionSessionState,
  resolveBastionThreadKey,
  filterEpistemicRecords,
  buildMultiGroupPromptEnvelope,
} from '../../src/services/bastionSessionService.js';
import {
  loadCompendiumSeedDataset,
  queryOmnicortexRAG,
  isArchitectRestrictedChunk,
} from '../../src/services/omnicortexVectorRag.ts';
import {
  hasAvailableAiTransport,
  parseRollCommand,
  composeBastionSystemPrompt,
  sendBastionChatMessage,
} from '../../src/services/bastionService.js';
import { DBMFunctionRegistry } from '../../src/engine/ai/DBMFunctionRegistry.ts';
import { BastionAgent } from '../../src/engine/ai/BastionAgent.ts';
import { VertexAIGateway } from '../../src/engine/ai/VertexAIGateway.ts';

const MOCK_UNIVERSE = {
  id: 'camp-horizon',
  projectName: 'Horizon Rift Campaign',
  authorUid: 'uid-gm-1',
};

const MOCK_GROUPS = [
  {
    id: 'grp-alpha',
    name: 'Vanguard Squad Alpha',
    campaignId: 'camp-horizon',
    currentLocation: 'Orbital Spindle Dock 4',
    members: {
      'uid-gm-1': { role: 'gm', displayName: 'GM Core' },
      'uid-p1': { role: 'player', displayName: 'Player One' },
    },
    enrolledPersonas: {
      'p-lyra': {
        personaId: 'p-lyra',
        ownerUid: 'uid-p1',
        name: 'Lyra Vance',
        archetype: 'Operative',
        species: 'Human',
        tl: 4,
        ml: 2,
      },
    },
  },
  {
    id: 'grp-bravo',
    name: 'Recon Team Bravo',
    campaignId: 'camp-horizon',
    currentLocation: 'Subterranean Vault B',
    members: {
      'uid-gm-1': { role: 'gm', displayName: 'GM Core' },
      'uid-p2': { role: 'player', displayName: 'Player Two' },
    },
    enrolledPersonas: {
      'p-korr': {
        personaId: 'p-korr',
        ownerUid: 'uid-p2',
        name: 'Korr Stone',
        archetype: 'Sentinel',
        species: 'Lithoid',
        tl: 3,
        ml: 3,
      },
    },
  },
  {
    id: 'grp-other-campaign',
    name: 'Unrelated Side Group',
    campaignId: 'camp-other',
    members: { 'uid-p9': { role: 'player' } },
  },
];

test('Multi-group campaign resolution, Architect lens, and Operator Preview epistemic scoping', () => {
  const architectState = resolveBastionSessionState({
    currentUser: { uid: 'uid-gm-1' },
    authState: { isAdmin: true },
    universeState: MOCK_UNIVERSE,
    groups: MOCK_GROUPS,
    routePath: '/foundry',
    previewConfig: { enabled: false, focusGroupId: 'all' },
  });

  assert.equal(architectState.effectiveRole, BASTION_ROLES.ARCHITECT);
  assert.equal(architectState.isArchitect, true);
  assert.equal(architectState.isOperatorPreview, false);
  assert.equal(architectState.isMultiGroupSession, true);
  assert.equal(architectState.sessionGroups.length, 2);
  assert.ok(architectState.voice.pronouns.includes('we'));
  assert.ok(architectState.epistemicScopes.includes('architect'));

  const multiEnvelope = buildMultiGroupPromptEnvelope(architectState);
  assert.ok(multiEnvelope.includes('Vanguard Squad Alpha'));
  assert.ok(multiEnvelope.includes('Recon Team Bravo'));
  assert.ok(!multiEnvelope.includes('Unrelated Side Group'));

  // Enable Development Operator Preview scoped to Squad Alpha + Lyra Vance
  const previewAlpha = resolveBastionSessionState({
    currentUser: { uid: 'uid-gm-1' },
    authState: { isAdmin: true },
    universeState: MOCK_UNIVERSE,
    groups: MOCK_GROUPS,
    routePath: '/foundry',
    previewConfig: {
      enabled: true,
      previewGroupId: 'grp-alpha',
      previewPersonaId: 'p-lyra',
    },
  });

  assert.equal(previewAlpha.effectiveRole, BASTION_ROLES.OPERATOR);
  assert.equal(previewAlpha.isOperator, true);
  assert.equal(previewAlpha.isOperatorPreview, true);
  assert.equal(previewAlpha.focusedGroup?.id, 'grp-alpha');
  assert.equal(previewAlpha.activePersona?.name, 'Lyra Vance');
  assert.ok(previewAlpha.voice.pronouns.includes('you'));
  assert.ok(!previewAlpha.epistemicScopes.includes('architect'));
  assert.ok(previewAlpha.epistemicScopes.includes('group:grp-alpha'));
  assert.ok(!previewAlpha.epistemicScopes.includes('group:grp-bravo'));

  // Enable Operator Preview scoped to Squad Bravo
  const previewBravo = resolveBastionSessionState({
    currentUser: { uid: 'uid-gm-1' },
    authState: { isAdmin: true },
    universeState: MOCK_UNIVERSE,
    groups: MOCK_GROUPS,
    routePath: '/foundry',
    previewConfig: {
      enabled: true,
      previewGroupId: 'grp-bravo',
      previewPersonaId: 'p-korr',
    },
  });

  // Verify strict thread isolation across Architect, Preview Alpha, and Preview Bravo
  const archKey = resolveBastionThreadKey(architectState);
  const alphaKey = resolveBastionThreadKey(previewAlpha);
  const bravoKey = resolveBastionThreadKey(previewBravo);
  assert.notEqual(archKey, alphaKey);
  assert.notEqual(alphaKey, bravoKey);
  assert.notEqual(archKey, bravoKey);

  // Verify epistemic record filtering blocks Architect secrets & Squad Bravo intel from Squad Alpha
  const sampleRecords = [
    { id: 'r1', visibility: 'public', title: 'Public Starport Map' },
    { id: 'r2', visibility: 'architect', title: 'GM Ambush Trigger' },
    { id: 'r3', groupId: 'grp-alpha', title: 'Squad Alpha Briefing' },
    { id: 'r4', groupId: 'grp-bravo', title: 'Squad Bravo Secret Clue' },
  ];

  const visibleToAlpha = filterEpistemicRecords(sampleRecords, previewAlpha);
  assert.deepEqual(
    visibleToAlpha.map((r) => r.id),
    ['r1', 'r3']
  );

  const visibleToArchitect = filterEpistemicRecords(sampleRecords, architectState);
  assert.equal(visibleToArchitect.length, 4);
});

test('Omnicortex Vector RAG excludes [Architect Notes & Railguards] for Operators while serving Architects', async () => {
  await loadCompendiumSeedDataset();

  const opResults = queryOmnicortexRAG('architect notes railguards negative keywords exclusions', 10, {
    role: 'operator',
  });
  for (const { chunk } of opResults) {
    assert.equal(
      isArchitectRestrictedChunk(chunk),
      false,
      `Operator RAG leaked restricted chunk: ${chunk.id}`
    );
  }

  const archResults = queryOmnicortexRAG('architect notes railguards negative keywords exclusions', 10, {
    role: 'architect',
  });
  assert.ok(
    archResults.some(({ chunk }) => isArchitectRestrictedChunk(chunk)),
    'Architect RAG should retrieve Architect-restricted directives, railguards, and designer notes'
  );
});

test('Linguistic consistency: Operators receive direct "you" framing and Architects receive partnered "we" framing', async () => {
  const opPrompt = composeBastionSystemPrompt({
    role: 'operator',
    intent: 'QUICK_RULING',
  });
  assert.ok(opPrompt.includes('"you" / "your"'));
  assert.ok(opPrompt.includes('NEVER address the user as "Architect"'));

  const archSession = resolveBastionSessionState({
    currentUser: { uid: 'uid-gm-1' },
    authState: { isAdmin: true },
    universeState: MOCK_UNIVERSE,
    groups: MOCK_GROUPS,
    routePath: '/stage',
  });
  const archPrompt = composeBastionSystemPrompt({
    role: 'architect',
    intent: 'MULTI_GROUP_ORCHESTRATION',
    sessionState: archSession,
  });
  assert.ok(archPrompt.includes('"we" / "us" / "our"'));
  assert.ok(archPrompt.includes('Vanguard Squad Alpha'));

  // Verify offline deterministic chat responses strictly honor "you" vs "we"
  const opReply = await sendBastionChatMessage({
    prompt: 'Explain combat crits and fumbles',
    role: 'operator',
    apiKey: '',
  });
  assert.equal(opReply.role, 'operator');
  assert.match(opReply.text, /\byou(r)?\b/i);
  assert.doesNotMatch(opReply.text, /\bGreetings, ARCHITECT\b/i);

  const archReply = await sendBastionChatMessage({
    prompt: 'Explain combat crits and fumbles',
    role: 'architect',
    sessionState: archSession,
    apiKey: '',
  });
  assert.equal(archReply.role, 'architect');
  assert.match(archReply.text, /\b(we|our|us)\b/i);
});

test('Transport detector unblocks Local LLM and authenticated Cloud Proxy without raw API key', () => {
  const prevStorage = globalThis.localStorage;
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  try {
    assert.equal(hasAvailableAiTransport(''), false);
    assert.equal(hasAvailableAiTransport('AIza-test-key'), true);

    store.set('tangent_llm_settings', JSON.stringify({ provider: 'local', localEndpoint: 'http://127.0.0.1:8080' }));
    assert.equal(hasAvailableAiTransport(''), true);

    store.clear();
    store.set('firebaseIdToken', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock');
    assert.equal(hasAvailableAiTransport(''), true);
  } finally {
    globalThis.localStorage = prevStorage;
  }
});

test('parseRollCommand supports Advantage (3d10kh2), Disadvantage (3d10kl2), Crit (+10), and Fumble (-10)', () => {
  const advRoll = parseRollCommand('/roll 2d10+4 adv vs 15', {
    diceOverride: [2, 9, 7],
  });
  assert.equal(advRoll.success, true);
  assert.equal(advRoll.advantageState, 'advantage');
  assert.deepEqual(advRoll.rolls, [9, 7]);
  assert.equal(advRoll.total, 20);
  assert.equal(advRoll.effectiveTotal, 20);

  const disRoll = parseRollCommand('/roll 2d10+4 dis vs 15', {
    diceOverride: [2, 9, 7],
  });
  assert.equal(disRoll.advantageState, 'disadvantage');
  assert.deepEqual(disRoll.rolls, [2, 7]);
  assert.equal(disRoll.total, 13);

  const critRoll = parseRollCommand('/roll 2d10+4 vs 20', {
    diceOverride: [10, 10],
  });
  assert.equal(critRoll.isCrit, true);
  assert.equal(critRoll.total, 24); // Preserves natural sum + mod invariant
  assert.equal(critRoll.effectiveTotal, 34); // Applies canonical +10 Crit bonus
  assert.ok(critRoll.degreeDetails.includes('+1 Karma'));
  assert.ok(!critRoll.outcomeText.includes('Focus Point'));

  const fumbleRoll = parseRollCommand('/roll 2d10+8 vs 15', {
    diceOverride: [1, 1],
  });
  assert.equal(fumbleRoll.isFumble, true);
  assert.equal(fumbleRoll.total, 10);
  assert.equal(fumbleRoll.effectiveTotal, -2); // Flat -10 rolled dice + 8 mod = -2
  assert.ok(!fumbleRoll.outcomeText.includes('Strain Tick'));
});

test('DBMFunctionRegistry enforces canonical EUFT Economatrix, Armor Mitigation modes, CP Ledger, and Role Gating', async () => {
  const econ18 = await DBMFunctionRegistry.executeToolCall({
    name: 'evaluate_economatrix_acquisition',
    args: { itemCr: 18, wealthScore: 15 },
  });
  assert.equal(econ18.itemCreditValue, 1472);
  assert.equal(econ18.pristineMaterialCredits, 736);

  const econ32 = await DBMFunctionRegistry.executeToolCall({
    name: 'evaluate_economatrix_acquisition',
    args: { itemCr: 32, wealthScore: 20 },
  });
  assert.equal(econ32.itemCreditValue, 71680);

  const dimArmor = await DBMFunctionRegistry.executeToolCall({
    name: 'calculate_armor_mitigation',
    args: {
      incomingDamage: 25,
      armorLayers: [10, 6, 5],
      staminaToughness: 2,
      stackingMode: 'diminishing_returns',
    },
  });
  // 10 + ceil(6/5)=2 + ceil(5/5)=1 => 13 Armor DR + 2 Stamina = 15 DR => 10 final damage
  assert.equal(dimArmor.effectiveArmorDr, 13);
  assert.equal(dimArmor.finalDamage, 10);

  const singleArmor = await DBMFunctionRegistry.executeToolCall({
    name: 'calculate_armor_mitigation',
    args: {
      incomingDamage: 25,
      armorLayers: [10, 6, 5],
      staminaToughness: 2,
      stackingMode: 'single_highest',
    },
  });
  assert.equal(singleArmor.effectiveArmorDr, 10);
  assert.equal(singleArmor.finalDamage, 13);

  const ledger = await DBMFunctionRegistry.executeToolCall({
    name: 'audit_operator_cp_ledger',
    args: {
      attributes: { strength: 4, agility: 2, stamina: 1, intellect: 1, wisdom: 0, charisma: 0 },
      skills: { Firearms: 12, Stealth: 5 },
      specializations: [{ name: 'Sniping', rank: 3, parentSkill: 'Stealth' }],
    },
  });
  assert.equal(ledger.isCompliant, false);
  assert.ok(ledger.warnings.some((v) => v.includes('Rank 11')));
  assert.ok(ledger.warnings.some((v) => v.includes('requires parent Base Skill')));

  // Verify Operator role cannot see or invoke Architect-only tools
  const opDecls = DBMFunctionRegistry.getDeclarations('operator');
  assert.equal(
    opDecls.some((d) => d.name === 'synthesize_adversary_tactic'),
    false
  );
  const blocked = await DBMFunctionRegistry.executeToolCall(
    { name: 'synthesize_adversary_tactic', args: { adversaryId: 'adv-1' } },
    { role: 'operator' }
  );
  assert.equal(blocked.blocked, true);
});

test('BastionAgent 150-CP validator respects Rank 11 Creation Cap and never dumps uncapped ranks', async () => {
  const statblock = await BastionAgent.generateStatblock('Tactical Breacher', 'Human', 3);
  assert.equal(statblock.validation.totalBpSpent, 150);
  for (const [skillName, rank] of Object.entries(statblock.draft.skills || {})) {
    assert.ok(
      rank <= 11,
      `Expected skill ${skillName} (${rank}) to respect Creation Cap 11`
    );
  }
});
