/**
 * @file propertyFuzzSuite.test.mjs
 * @description Deterministic Property-Based & Generative Fuzzing Test Suite.
 * Verifies mathematical, geometric, and schema invariants across 1,000+ generated inputs:
 * 1. Dice Engine Clamping, Monotonicity & Exact PMF Probability Conservation (sum === 1.0)
 * 2. Omnicortex & Cross-Module Schema Normalization Idempotency & Hardware Economy Isolation
 * 3. 2D Raycast Vision Polygon Stability under Random/Degenerate Wall Topologies
 * 4. Folio & Story Foundry Zod Schema Fuzzing & Boundary Clamping
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { executeTangentRoll, calculateRollOdds, getDiceDistribution, resolveCheck } from '../../src/services/diceService.js';
import { normalizeOmnicortexItem, isPropertyCategory } from '../../src/utils/tangentSchemaAdapters.js';
import {
  dbmItemToFoundryElement,
  foundryElementToDbmItem,
  folioCharacterToFoundryPersona
} from '../../src/schemas/sharedSchemas.js';
import { computeVisibilityPolygon, isPointVisible } from '../../src/services/raycastVisionService.js';
import { specializationItemSchema, traitItemSchema, inventoryItemSchema } from '../../src/components/Folio/schema.js';
import { ELEMENT_TYPES, getElementFileExtension } from '../../src/pages/Foundry/ElementForge/elementSchemas.js';

/**
 * Mulberry32 deterministic PRNG so fuzz failures are 100% reproducible
 */
function createSeededRng(seed = 0x7A46E47) {
  let state = seed >>> 0;
  return {
    nextFloat() {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(min, max) {
      return Math.floor(this.nextFloat() * (max - min + 1)) + min;
    },
    pick(arr) {
      return arr[this.nextInt(0, arr.length - 1)];
    }
  };
}

test('Property Fuzz [diceService]: 500 randomized roll configurations never yield NaN and strictly obey clamping bounds', () => {
  const rng = createSeededRng(101);
  const validOutcomes = [
    'Critical Success',
    'Overwhelming Success',
    'Success',
    'Failure',
    'Catastrophic Failure',
    'Critical Failure'
  ];

  for (let i = 0; i < 500; i++) {
    const rawAdvantage = rng.nextInt(-50, 50);
    const rawModifier = rng.nextInt(-500, 500);
    const rawCritRange = rng.nextInt(-10, 20);
    const rawFumbleRange = rng.nextInt(-10, 20);
    const dc = rng.nextInt(-20, 100);

    const roll = executeTangentRoll(rawAdvantage, rawModifier, rawCritRange, rawFumbleRange);

    assert.ok(Number.isFinite(roll.finalTotal), `Roll finalTotal must be finite on iteration ${i}`);
    assert.ok(roll.advantageDice >= -5 && roll.advantageDice <= 5, `Advantage must clamp to [-5, 5], got ${roll.advantageDice}`);
    assert.ok(roll.appliedModifier >= -20 && roll.appliedModifier <= 70, `Modifier must clamp to [-20, 70], got ${roll.appliedModifier}`);
    assert.equal(roll.keptDice.length, 2, 'Must always keep exactly 2 d10s');
    assert.equal(roll.dicePool.length, 2 + Math.abs(roll.advantageDice), 'Pool size must equal 2 + |clampedAdvantage|');

    const check = resolveCheck(roll, dc);
    assert.ok(Number.isFinite(check.margin));
    assert.ok(validOutcomes.includes(check.outcome), `Unexpected outcome: ${check.outcome}`);
  }
});

test('Property Fuzz [calculateRollOdds & getDiceDistribution]: Exact PMF probability distribution sums to 1.0 across all advantage & crit configurations', () => {
  const rng = createSeededRng(202);

  for (let i = 0; i < 150; i++) {
    const advantageDice = rng.nextInt(-5, 5);
    const flatModifier = rng.nextInt(-20, 50);
    const targetDC = rng.nextInt(0, 45);
    const critRangeSize = rng.nextInt(1, 5);
    const fumbleRangeSize = rng.nextInt(1, 5);

    const odds = calculateRollOdds('2d10', {
      advantageDice,
      flatModifier,
      targetDC,
      critRangeSize,
      fumbleRangeSize
    });

    assert.ok(Number.isFinite(odds.successChance), 'successChance must be finite');
    assert.ok(odds.successChance >= 0 && odds.successChance <= 1, `successChance out of [0,1]: ${odds.successChance}`);
    assert.ok(odds.critChance >= 0 && odds.critChance <= 1);
    assert.ok(odds.fumbleChance >= 0 && odds.fumbleChance <= 1);

    const pmf = getDiceDistribution(2, 10, 2, advantageDice);
    const totalProb = Object.values(pmf).reduce((acc, p) => acc + p, 0);
    assert.ok(
      Math.abs(totalProb - 1.0) < 1e-6,
      `PMF distribution probabilities must sum to 1.0, got ${totalProb}`
    );
  }
});

test('Property Fuzz [Schema Adapters]: 300 fuzzed Omnicortex & Cross-Module payloads preserve idempotency and hardware economy isolation', () => {
  const rng = createSeededRng(303);
  const categories = [
    'species', 'factions', 'origins', 'occupations', 'invocations', 'features',
    'weaponry', 'armoring', 'augmentations', 'gear', 'mecha', 'architecture', null, undefined, ''
  ];
  const weirdValues = [null, undefined, '', '0', '-15', '42', NaN, Infinity, -Infinity, {}, [], '12 credits', 0, 25];

  for (let i = 0; i < 300; i++) {
    const category = rng.pick(categories);
    const fuzzedInput = {
      id: rng.pick(['', 'item-1', null, undefined]),
      name: rng.pick(['Plasma Blade', '', null, undefined, 12345]),
      category,
      bp: rng.pick(weirdValues),
      cp: rng.pick(weirdValues),
      credits: rng.pick(weirdValues),
      node_cost: rng.pick(weirdValues),
      socket_cost: rng.pick(weirdValues),
      strain: rng.pick(weirdValues)
    };

    const norm1 = normalizeOmnicortexItem(fuzzedInput, category);
    const norm2 = normalizeOmnicortexItem(norm1, category);

    assert.ok(norm1 && typeof norm1 === 'object');
    assert.ok(Number.isFinite(norm1.costs.bp), 'Normalized BP cost must always be a finite number');
    assert.deepEqual(norm1.costs, norm2.costs, 'normalizeOmnicortexItem must be idempotent on repeated passes');

    if (isPropertyCategory(category)) {
      assert.ok(Number.isFinite(norm1.costs.credits), 'Property category must have finite credits cost');
      assert.ok(Number.isFinite(norm1.costs.nodes), 'Property category must have finite nodes cost');
      assert.ok(Number.isFinite(norm1.costs.sockets), 'Property category must have finite sockets cost');
    } else {
      assert.equal(norm1.costs.credits, undefined, `Non-property category "${category}" must NOT leak credits economy`);
      assert.equal(norm1.costs.nodes, undefined, `Non-property category "${category}" must NOT leak nodes economy`);
      assert.equal(norm1.costs.sockets, undefined, `Non-property category "${category}" must NOT leak sockets economy`);
    }

    // Cross-module round-trip fuzzing
    const foundryEl = dbmItemToFoundryElement(fuzzedInput, String(category || 'compendium'));
    const roundTripDbm = foundryElementToDbmItem(foundryEl);
    assert.ok(typeof foundryEl.id === 'string' && foundryEl.id.length > 0);
    assert.ok(typeof roundTripDbm.id === 'string' && roundTripDbm.id.length > 0);

    const personaEl = folioCharacterToFoundryPersona({
      'char-name': rng.pick(['Vance', '', null]),
      'char-species': rng.pick(['Human', 'Mekan Synthetic', 'Construct', null])
    });
    assert.equal(personaEl.type, 'Persona');
  }
});

test('Property Fuzz [Raycast Vision & Zod Schemas]: Degenerate wall segments and out-of-range specialization ranks never fail', () => {
  const rng = createSeededRng(404);
  const options = { maxRadius: 300, bounds: { width: 1000, height: 1000 } };

  for (let i = 0; i < 50; i++) {
    const walls = [];
    const wallCount = rng.nextInt(1, 12);
    for (let w = 0; w < wallCount; w++) {
      const x1 = rng.nextInt(0, 1000);
      const y1 = rng.nextInt(0, 1000);
      const isZeroLen = rng.nextFloat() < 0.2;
      walls.push({
        p1: { x: x1, y: y1 },
        p2: { x: isZeroLen ? x1 : rng.nextInt(0, 1000), y: isZeroLen ? y1 : rng.nextInt(0, 1000) },
        type: rng.pick(['solid', 'door', 'window', 'ethereal']),
        isOpen: rng.nextFloat() < 0.3
      });
    }

    const origin = { x: rng.nextInt(50, 950), y: rng.nextInt(50, 950) };
    const poly = computeVisibilityPolygon(origin, walls, options);
    assert.ok(Array.isArray(poly), 'Visibility polygon must return an array of flat coordinates');
    assert.equal(poly.length % 2, 0, 'Flat coordinate array must have an even length');
    for (const coord of poly) {
      assert.ok(Number.isFinite(coord), 'Polygon vertex coordinates must never be NaN');
    }

    const target = { x: rng.nextInt(50, 950), y: rng.nextInt(50, 950) };
    const vis = isPointVisible(origin, target, walls);
    assert.equal(typeof vis, 'boolean');
  }

  // Folio Zod schema clamping fuzz
  for (let r = -50; r <= 50; r += 5) {
    const parsedSpec = specializationItemSchema.parse({ name: 'Pistols', rank: String(r), mod: '-3' });
    assert.ok(parsedSpec.rank >= 0 && parsedSpec.rank <= 10, `Specialization rank must clamp to [0, 10], got ${parsedSpec.rank}`);
    assert.equal(parsedSpec.mod, -3);
  }

  assert.ok(traitItemSchema.safeParse('Quick Reflexes').success);
  assert.ok(inventoryItemSchema.safeParse({ name: 'Medkit', qty: '3', weight: '1.5' }).success);

  // Verify all 24 ELEMENT_TYPES map to valid dot-extensions
  for (const elType of ELEMENT_TYPES) {
    const ext = getElementFileExtension(elType);
    assert.ok(ext.startsWith('.') && ext.length >= 2, `Element type "${elType}" must map to a valid extension, got "${ext}"`);
  }
});
