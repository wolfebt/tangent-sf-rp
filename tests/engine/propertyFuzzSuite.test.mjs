/**
 * @file propertyFuzzSuite.test.mjs
 * @description Deterministic Property-Based & fast-check Generative Fuzzing Test Suite.
 * Verifies mathematical, geometric, and schema invariants across 1,500+ generated inputs:
 * 1. Dice Engine Clamping, Monotonicity & Exact PMF Probability Conservation (sum === 1.0)
 * 2. Omnicortex & Cross-Module Schema Normalization Idempotency & Hardware Economy Isolation
 * 3. 2D Raycast Vision Polygon Stability under Random/Degenerate Wall Topologies
 * 4. Folio & Story Foundry Zod Schema Fuzzing & Boundary Clamping
 * 5. fast-check Shrinking Property Assertions across Dice, Schema Adapters, and Raycast Geometry
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
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

test('fast-check Shrinking Properties: Dice Monotonicity, Schema Idempotency & Raycast Geometry', () => {
  // 1. fast-check: Higher flat modifier never decreases successChance for identical DC & advantage
  fc.assert(
    fc.property(
      fc.integer({ min: -5, max: 5 }),
      fc.integer({ min: -20, max: 30 }),
      fc.integer({ min: 1, max: 20 }),
      fc.integer({ min: 5, max: 35 }),
      (advantageDice, baseMod, deltaMod, targetDC) => {
        const lowOdds = calculateRollOdds('2d10', {
          advantageDice,
          flatModifier: baseMod,
          targetDC
        });
        const highOdds = calculateRollOdds('2d10', {
          advantageDice,
          flatModifier: baseMod + deltaMod,
          targetDC
        });
        return highOdds.successChance + 1e-9 >= lowOdds.successChance;
      }
    ),
    { numRuns: 100 }
  );

  // 2. fast-check: normalizeOmnicortexItem is idempotent and isolates hardware economy for arbitrary records
  const categoryArb = fc.constantFrom(
    'species', 'factions', 'origins', 'occupations', 'invocations',
    'weaponry', 'armoring', 'augmentations', 'gear', 'mecha'
  );
  const costValArb = fc.oneof(
    fc.integer({ min: -100, max: 1000 }),
    fc.double({ noNaN: false }),
    fc.string(),
    fc.constant(null),
    fc.constant(undefined)
  );

  fc.assert(
    fc.property(
      categoryArb,
      fc.record({
        id: fc.oneof(fc.string(), fc.constant(null), fc.constant('')),
        name: fc.oneof(fc.string(), fc.constant(null)),
        bp: costValArb,
        credits: costValArb,
        node_cost: costValArb,
        socket_cost: costValArb
      }),
      (category, rawRecord) => {
        const first = normalizeOmnicortexItem(rawRecord, category);
        const second = normalizeOmnicortexItem(first, category);
        const costsMatch = JSON.stringify(first.costs) === JSON.stringify(second.costs);
        const economyIsolated = isPropertyCategory(category)
          ? Number.isFinite(first.costs.credits)
          : first.costs.credits === undefined && first.costs.nodes === undefined && first.costs.sockets === undefined;
        return Number.isFinite(first.costs.bp) && costsMatch && economyIsolated;
      }
    ),
    { numRuns: 150 }
  );

  // 3. fast-check: Raycast visibility polygon produces finite even-length coordinate tuples
  const wallArb = fc.record({
    p1: fc.record({ x: fc.integer({ min: 0, max: 500 }), y: fc.integer({ min: 0, max: 500 }) }),
    p2: fc.record({ x: fc.integer({ min: 0, max: 500 }), y: fc.integer({ min: 0, max: 500 }) }),
    type: fc.constantFrom('solid', 'door', 'window', 'ethereal'),
    isOpen: fc.boolean()
  });

  fc.assert(
    fc.property(
      fc.record({ x: fc.integer({ min: 50, max: 450 }), y: fc.integer({ min: 50, max: 450 }) }),
      fc.array(wallArb, { minLength: 0, maxLength: 8 }),
      (origin, walls) => {
        const poly = computeVisibilityPolygon(origin, walls, { maxRadius: 200, bounds: { width: 500, height: 500 } });
        return Array.isArray(poly) && poly.length % 2 === 0 && poly.every((c) => Number.isFinite(c));
      }
    ),
    { numRuns: 60 }
  );
});

test('fast-check Shrinking Properties: DiceASTParser & BVHBuilder Spatial/Cover Invariants', async () => {
  const { DiceASTParser } = await import('../../src/engine/math/DiceASTParser.ts');
  const { BVHBuilder } = await import('../../src/engine/vision/BVHBuilder.ts');

  const parser = new DiceASTParser();

  // 1. DiceASTParser: Any generated XdY + Z expression evaluates within [X + Z, X*Y + Z]
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 2, max: 20 }),
      fc.integer({ min: -25, max: 50 }),
      (count, sides, bonus) => {
        const expr = bonus >= 0 ? `${count}d${sides} + ${bonus}` : `${count}d${sides} - ${Math.abs(bonus)}`;
        const result = parser.evaluateExpression(expr);
        const minPossible = count * 1 + bonus;
        const maxPossible = count * sides + bonus;
        return (
          Number.isFinite(result.total) &&
          result.total >= minPossible &&
          result.total <= maxPossible
        );
      }
    ),
    { numRuns: 150 }
  );

  // Verify keep-highest (kh1), keep-lowest (kl1), exploding (!), and parenthesized expressions
  const khResult = parser.evaluateExpression('(2d10kh1 + 4) * 2');
  assert.ok(khResult.total >= 10 && khResult.total <= 28, `Expected kh1 expression in [10, 28], got ${khResult.total}`);
  const klResult = parser.evaluateExpression('2d10kl1 + 3');
  assert.ok(klResult.total >= 4 && klResult.total <= 13);

  // 2. BVHBuilder: Spatial tree construction, GPU float flattening, door toggling, and LoS cover invariants
  const bvhWallArb = fc.record({
    id: fc.uuid(),
    p1: fc.record({ x: fc.integer({ min: 0, max: 1000 }), y: fc.integer({ min: 0, max: 1000 }) }),
    p2: fc.record({ x: fc.integer({ min: 0, max: 1000 }), y: fc.integer({ min: 0, max: 1000 }) }),
    isDynamic: fc.boolean(),
    isOpen: fc.boolean(),
    isTransparent: fc.boolean()
  });

  fc.assert(
    fc.property(
      fc.array(bvhWallArb, { minLength: 1, maxLength: 20 }),
      fc.record({ x: fc.integer({ min: 50, max: 950 }), y: fc.integer({ min: 50, max: 950 }) }),
      fc.record({ x: fc.integer({ min: 50, max: 950 }), y: fc.integer({ min: 50, max: 950 }) }),
      (walls, attacker, target) => {
        const bvh = new BVHBuilder();
        bvh.build(walls);

        // Radius covering entire 1000x1000 stage must return all active (non-open, non-transparent) walls
        const activeExpected = walls.filter((w) => !w.isOpen && !w.isTransparent);
        const queriedAll = bvh.queryRadius(500, 500, 1500);
        if (queriedAll.length !== activeExpected.length) return false;

        // GPU buffer must have 4 floats per wall
        const gpuFloats = bvh.flattenForGPU(queriedAll);
        if (gpuFloats.length !== queriedAll.length * 4) return false;

        // Cover calculation must return valid canonical cover tier and modifier
        const cover = bvh.calculateLineOfSightCover(attacker, target, 22);
        const validCoverMap = {
          none: 0,
          half: -2,
          three_quarters: -5,
          total: -100
        };
        return (
          Object.prototype.hasOwnProperty.call(validCoverMap, cover.coverType) &&
          cover.coverMod === validCoverMap[cover.coverType] &&
          cover.rayHitsCount >= 0 &&
          cover.rayHitsCount <= 3
        );
      }
    ),
    { numRuns: 80 }
  );
});

