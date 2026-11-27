/**
 * @file phase35Hotfixes.test.mjs
 * @description Phase 3.5 pre-commit hotfix regression tests covering:
 *   - Cortex Metaphysics ML-3 / ML-0 parsing without negative-sign corruption
 *   - Spectator owner UID replacement for 'local' / 'system' placeholders
 *   - NVectorCalculator.crossProduct 3D basis math & greatCircleDistance
 *   - adeElementPersistence aborting module pin sync when saveEntry returns false
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { consolidateAdeElementToCortexPayload } from '../../src/utils/cortexAdeAssetBridge.js';
import { sanitizeMapForSpectator } from '../../src/utils/spectatorSanitizer.js';
import { NVectorCalculator, DEFAULT_PLANETARY_RADIUS_KM } from '../../src/engine/cartography/NVectorCalculator.ts';
import { persistAdeElement } from '../../src/utils/adeElementPersistence.js';

test('Phase 3.5.1: Metaphysics meta_level parses "ML-3" as 3 and "ML-0" as 0 (never -3)', () => {
  const ml3 = consolidateAdeElementToCortexPayload({
    id: 'elem_meta_3',
    type: 'Metaphysics',
    metaphysicsSubcategory: 'invocations',
    title: 'Phase Lance',
    fields: { meta_level: 'ML-3' }
  });
  assert.equal(ml3.targetCollection, 'invocations');
  assert.equal(ml3.payload.meta_level, 3);

  const ml0 = consolidateAdeElementToCortexPayload({
    id: 'elem_meta_0',
    type: 'Metaphysics',
    metaphysicsSubcategory: 'invocations',
    title: 'Static Spark',
    fields: { metaLevel: 'ML-0' }
  });
  assert.equal(ml0.payload.meta_level, 0);
});

test('Phase 3.5.2: sanitizeMapForSpectator replaces "local"/"system" owner placeholders with authenticated uid while preserving real cloud owners', () => {
  const localMap = {
    id: 'map_local',
    title: 'Local Sector',
    authorUid: 'local',
    creatorId: 'system'
  };
  const sanitizedLocal = sanitizeMapForSpectator(localMap, { uid: 'user_abc_123' });
  assert.equal(sanitizedLocal.authorUid, 'user_abc_123');
  assert.equal(sanitizedLocal.creatorId, 'user_abc_123');

  const cloudMap = {
    id: 'map_cloud',
    title: 'Cloud Sector',
    authorUid: 'owner_xyz_789',
    creatorId: 'owner_xyz_789'
  };
  const sanitizedCloud = sanitizeMapForSpectator(cloudMap, { uid: 'admin_other_uid' });
  assert.equal(sanitizedCloud.authorUid, 'owner_xyz_789');
  assert.equal(sanitizedCloud.creatorId, 'owner_xyz_789');
});

test('Phase 3.5.3: NVectorCalculator.crossProduct computes true 3D cross product and accurate greatCircleDistance', () => {
  const calc = new NVectorCalculator();

  const i = { x: 1, y: 0, z: 0 };
  const j = { x: 0, y: 1, z: 0 };
  const k = { x: 0, y: 0, z: 1 };

  assert.deepEqual(calc.crossProduct(i, j), k);
  assert.deepEqual(calc.crossProduct(j, k), i);
  assert.deepEqual(calc.crossProduct(k, i), j);

  const a = { x: 0.25, y: -0.6, z: 0.75 };
  const b = { x: -0.4, y: 0.8, z: 0.45 };
  const c = calc.crossProduct(a, b);
  assert.ok(Math.abs(calc.dotProduct(c, a)) < 1e-12);
  assert.ok(Math.abs(calc.dotProduct(c, b)) < 1e-12);

  // 90-degree equatorial arc should equal (PI / 2) * R
  const eqDist = calc.greatCircleDistance(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 90 }
  );
  const expectedQuarterCircumference = (Math.PI / 2) * DEFAULT_PLANETARY_RADIUS_KM;
  assert.ok(Math.abs(eqDist - expectedQuarterCircumference) < 1e-6);
});

test('Phase 3.5.4: persistAdeElement aborts module pin sync and returns null when OmniCortex saveEntry returns false', async () => {
  let updatedSavedCalled = 0;
  const toasts = [];

  const result = await persistAdeElement({
    element: {
      id: 'elem_weapon_fail',
      type: 'Property',
      propertySubcategory: 'weaponry',
      title: 'Broken Blaster',
      isPinnedToModule: true,
      fields: { techLevel: 'TL-3' }
    },
    elementsCatalog: [{ id: 'elem_weapon_fail', title: 'Broken Blaster' }],
    fromEditModal: true,
    isAdmin: true,
    saveEntry: async () => false,
    updateSavedElement: async () => {
      updatedSavedCalled += 1;
    },
    showToast: (t) => toasts.push(t)
  });

  assert.equal(result, null);
  assert.equal(updatedSavedCalled, 0);
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0].type, 'error');
});
