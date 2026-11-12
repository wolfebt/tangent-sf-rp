import test from 'node:test';
import assert from 'node:assert/strict';

import { categoryConfig } from '../../DBM/categoryConfig.js';
import { CODEX_MATRICES, getMatrixById } from '../../../pages/Codex/codexConfig.js';
import { getMatrixIdForAssetKey } from '../../../pages/Codex/codexAssetBridge.js';
import { getGuidanceForDataset } from '../../../pages/Codex/codexDatasetGuidance.js';
import {
  resolveStudioPlaybook,
  normalizeStudioDomainKey,
  evaluateStepReadiness,
  SOCIETY_SPHERE_KEYS,
  DEV_PARAMETER_KEYS,
  SPECIES_SUBSCHEMA_KEYS,
  WORLD_ELEMENT_KEYS,
  RULES_DOCUMENT_KEYS
} from './studioPlaybooks.js';
import {
  resolveCatalogForDomain,
  findComparableCortexExemplars,
  computeCortexStepBenchmarks,
  findReverseCortexDependencies,
  buildSeedFromExemplar
} from './intelligence/cortexExemplarService.js';
import {
  computeCanonicalTscCredits,
  computeCanonicalEssenceCost,
  computeDeterministicCalibrationDiffs
} from './intelligence/studioStepAiService.js';
import { queryStudioStepContext } from '../../../services/omnicortexVectorRag.ts';

const VALID_VIEW_TYPES = new Set([
  'blueprint_specs',
  'configurator',
  'suite_workflow',
  'final_review'
]);

test('All 84+ Omnicortex categoryConfig keys map to valid Codex matrices, guidance, and Guided Studio Playbooks', () => {
  const categoryKeys = Object.keys(categoryConfig);
  assert.ok(
    categoryKeys.length >= 84,
    `Expected at least 84 categoryConfig keys, found ${categoryKeys.length}`
  );

  for (const key of categoryKeys) {
    const matrixId = getMatrixIdForAssetKey(key);
    assert.ok(matrixId, `Expected getMatrixIdForAssetKey('${key}') to return a non-empty matrixId`);

    const matrix = getMatrixById(matrixId);
    assert.ok(matrix, `Expected getMatrixById('${matrixId}') for category '${key}' to resolve a valid matrix`);

    const guidance = getGuidanceForDataset(key) || getGuidanceForDataset(matrix.id);
    assert.ok(guidance, `Expected dataset guidance for '${key}' (matrix '${matrix.id}')`);

    const playbook = resolveStudioPlaybook(key, matrix);
    assert.ok(playbook, `Expected resolveStudioPlaybook('${key}') to return a playbook`);
    assert.ok(playbook.id, `Playbook for '${key}' must have an id`);
    assert.ok(playbook.family, `Playbook for '${key}' must declare a playbook family`);
    assert.ok(
      Array.isArray(playbook.steps) && playbook.steps.length >= 3,
      `Playbook for '${key}' must define at least 3 steps, got ${playbook.steps?.length}`
    );

    playbook.steps.forEach((step, idx) => {
      assert.equal(
        step.stepNumber,
        idx + 1,
        `Playbook '${playbook.id}' step ${idx} must have sequential stepNumber ${idx + 1}`
      );
      assert.ok(
        VALID_VIEW_TYPES.has(step.viewType),
        `Playbook '${playbook.id}' step '${step.id}' has unsupported viewType '${step.viewType}'`
      );

      const readinessEmpty = evaluateStepReadiness(step, {}, {}, null);
      assert.ok(
        ['valid', 'partial', 'empty', 'warning', 'error'].includes(readinessEmpty.status),
        `Invalid readiness status '${readinessEmpty.status}' on '${playbook.id}.${step.id}'`
      );

      const readinessNamed = evaluateStepReadiness(
        step,
        { name: 'Test Canonical Asset', description: 'Baseline specification', mechanic: 'CR 15 check' },
        {},
        { status: 'valid', hasUnaccountedItems: false }
      );
      assert.ok(['valid', 'partial', 'empty', 'warning', 'error'].includes(readinessNamed.status));
    });
  }
});

test('All CODEX_MATRICES resolve valid Playbooks and contain zero stale configurator names', () => {
  assert.ok(Array.isArray(CODEX_MATRICES) && CODEX_MATRICES.length > 0);

  for (const matrix of CODEX_MATRICES) {
    assert.notEqual(
      matrix.customComponent,
      'InvocationCalculator',
      `Matrix '${matrix.id}' still references stale 'InvocationCalculator'`
    );

    const playbook = resolveStudioPlaybook(matrix.id, matrix);
    assert.ok(playbook && playbook.steps.length >= 3, `Matrix '${matrix.id}' failed playbook resolution`);
  }

  const specialAbilitiesMatrix = getMatrixById('special_abilities');
  assert.equal(specialAbilitiesMatrix?.customComponent, 'InvocationParameterConfigurator');
});

test('Domain key Sets use Set membership accurately across sub-schemas, world, society, rules, and dev keys', () => {
  assert.equal(SOCIETY_SPHERE_KEYS.has('society_commerce'), true);
  assert.equal(DEV_PARAMETER_KEYS.has('critical_effect'), true);
  assert.equal(SPECIES_SUBSCHEMA_KEYS.has('species_lineage'), true);
  assert.equal(SPECIES_SUBSCHEMA_KEYS.has('species'), false);
  assert.equal(WORLD_ELEMENT_KEYS.has('philosophy'), true);
  assert.equal(RULES_DOCUMENT_KEYS.has('conditions'), true);

  assert.equal(normalizeStudioDomainKey('weapons'), 'weaponry');
  assert.equal(normalizeStudioDomainKey('armor'), 'armoring');
  assert.equal(normalizeStudioDomainKey('species_lineage'), 'species_lineage');
});

test('Canonical BASTION deterministic math matches Tangent v6 TSC & Essence formulas', () => {
  // Tangent Standard Curve: 10 * 4^floor(CR/5) * [1.0, 1.3, 1.75, 2.3, 3.0][CR % 5]
  assert.equal(computeCanonicalTscCredits(0), 10);
  assert.equal(computeCanonicalTscCredits(18), 1472); // 10 * 64 * 2.3 = 1472
  assert.equal(computeCanonicalTscCredits(20), 2560); // 10 * 256 * 1.0 = 2560
  assert.equal(computeCanonicalTscCredits(32), 71680); // 10 * 4096 * 1.75 = 71680

  // Canonical Metaphysics Essence Cost: ceil(CR / 5)
  assert.equal(computeCanonicalEssenceCost(1), 1);
  assert.equal(computeCanonicalEssenceCost(5), 1);
  assert.equal(computeCanonicalEssenceCost(18), 4);

  // Deterministic Hardware Calibration Diffs (non-destructive proposedValue payload)
  const weaponDiffs = computeDeterministicCalibrationDiffs(
    { name: 'Valkyrie Pulse Rifle', craft_dc: 18, price: 100 },
    'weaponry',
    { final_dc: 18 }
  );
  const priceDiff = weaponDiffs.find((d) => d.field === 'price');
  assert.ok(priceDiff, 'Expected deterministic TSC price diff when price != 1472');
  assert.equal(priceDiff.proposedValue, 1472);

  // Deterministic Invocation Essence Calibration Diffs
  const invDiffs = computeDeterministicCalibrationDiffs(
    { name: 'Void Lance', base_dc: 18, focus_cost: 1 },
    'invocations',
    { final_dc: 18 }
  );
  const essenceDiff = invDiffs.find((d) => d.field === 'focus_cost');
  assert.ok(essenceDiff, 'Expected deterministic Essence/Focus cost diff when focus_cost != 4');
  assert.equal(essenceDiff.proposedValue, 4);
});

test('Cortex Exemplar, Peer Benchmark, Reverse Dependency, Seeder & Step RAG operate deterministically', () => {
  const mockDbData = {
    weaponry: [
      { id: 'w1', name: 'Aegis Laser Carbine', tech_level: 4, craft_dc: 15, price: 640, damage: '2d8 Energy' },
      { id: 'w2', name: 'Helios Plasma Rifle', tech_level: 4, craft_dc: 18, price: 1472, damage: '3d8 Plasma' },
      { id: 'w3', name: 'Primitive Slugger', tech_level: 1, craft_dc: 10, price: 160, damage: '1d10 Kinetic' }
    ],
    factions: [
      {
        id: 'f1',
        name: 'Solaris Hegemony',
        signature_gear: ['Helios Plasma Rifle'],
        skill_package: [{ skill: 'Firearms', points: 4 }]
      }
    ]
  };

  const catalog = resolveCatalogForDomain('weapons', mockDbData);
  assert.equal(catalog.length, 3);

  const exemplars = findComparableCortexExemplars(
    { id: 'draft_1', name: 'Nova Carbine', tech_level: 4 },
    'weaponry',
    mockDbData,
    5
  );
  assert.ok(exemplars.length >= 2);
  assert.equal(exemplars[0].item.tech_level, 4);

  const benchmarks = computeCortexStepBenchmarks(exemplars, 'weaponry', catalog.length);
  assert.equal(benchmarks.catalogCount, 3);
  assert.ok(Array.isArray(benchmarks.metrics) && benchmarks.metrics.length > 0);

  const seed = buildSeedFromExemplar(exemplars[0].item, { id: 'draft_new_1', name: '' });
  assert.equal(seed.id, 'draft_new_1', 'Seed must preserve current draft id and never copy exemplar id');
  assert.equal(seed.tech_level, 4);

  const reverseDeps = findReverseCortexDependencies(
    { id: 'w2', name: 'Helios Plasma Rifle' },
    'weaponry',
    mockDbData
  );
  assert.equal(reverseDeps.totalCount, 1);
  assert.equal(reverseDeps.sampleMatches[0].name, 'Solaris Hegemony');

  const rag = queryStudioStepContext({
    query: 'weaponry UDU sockets penetration TSC credits',
    domainKey: 'weaponry',
    tags: ['udu', 'penetration', 'tsc'],
    dbData: mockDbData,
    topK: 3
  });
  assert.ok(Array.isArray(rag.ruleCitations));
  assert.ok(Array.isArray(rag.entityCitations));
});
