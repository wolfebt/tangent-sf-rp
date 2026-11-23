/**
 * @file phase13CartographyAndMedia.test.mjs
 * @description Phase 13 unit & integration tests for Bezier wall tessellation/expansion,
 * OffscreenCanvas worker export fallback, authenticated Gemini Image Proxy client service,
 * and Custom Element Blueprint Templates CRUD.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  tessellateBezierWall,
  expandWallsForGeometry
} from '../../src/schemas/vttWallSchema.js';
import { exportMapWithWorker } from '../../src/services/mapWorkerExportService.ts';
import {
  generateConceptArt,
  buildImageProxyUrl
} from '../../src/services/artistHubImageService.ts';
import {
  listCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  applyCustomTemplate
} from '../../src/services/customElementTemplateService.ts';

test('Phase 13 Cartography: tessellateBezierWall & expandWallsForGeometry handle straight and curved walls', () => {
  const straight = { id: 'w-straight', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 }, type: 'solid' };
  const curved = {
    id: 'w-curved',
    p1: { x: 0, y: 0 },
    p2: { x: 100, y: 0 },
    bezierControl: { x: 50, y: -40 },
    type: 'solid',
    blocksLight: true
  };

  const segments = tessellateBezierWall(curved.p1, curved.bezierControl, curved.p2, 8);
  assert.equal(segments.length, 8);
  assert.deepEqual(segments[0].p1, { x: 0, y: 0 });
  assert.deepEqual(segments[segments.length - 1].p2, { x: 100, y: 0 });
  // Midpoint reaches quadratic curve bulge at t=0.5: 0.25*0 + 0.5*(-40) + 0.25*0 = -20
  assert.equal(segments[3].p2.y, -20);

  const expanded = expandWallsForGeometry([straight, curved], 6);
  assert.equal(expanded.length, 1 + 6);
  assert.equal(expanded[0].id, 'w-straight');
  assert.equal(expanded[1].id, 'w-curved_seg_0');
  assert.equal(expanded[1].blocksLight, true);
});

test('Phase 13 Worker Export: exportMapWithWorker cleanly falls back in headless runtime', async () => {
  const res = await exportMapWithWorker({
    widthCells: 10,
    heightCells: 8,
    pixelsPerGrid: 50,
    terrains: [{ renderType: 'rect', x: 0, y: 0, width: 50, height: 50, color: '#0f172a', softEdge: true }],
    walls: [{ id: 'w1', p1: { x: 0, y: 0 }, p2: { x: 100, y: 50 }, bezierControl: { x: 50, y: 10 } }],
    lights: [{ x: 120, y: 120, radius: 140, color: '#f59e0b' }],
    format: 'image/png'
  });

  assert.equal(res.usedWorker, false);
  assert.ok(typeof res.fallbackReason === 'string' && res.fallbackReason.length > 0);
  assert.ok(res.dataUrl.startsWith('data:image/'));
});

test('Phase 13 Image Service: buildImageProxyUrl & generateConceptArt validate auth, prompt & parse response', async () => {
  const url = buildImageProxyUrl();
  assert.ok(url.includes('geminiImageProxy'));

  await assert.rejects(
    () => generateConceptArt({ prompt: '   ', idToken: 'tok-1' }),
    /cannot be empty/i
  );

  await assert.rejects(
    () => generateConceptArt({ prompt: 'A'.repeat(4001), idToken: 'tok-1' }),
    /4000 characters/i
  );

  await assert.rejects(
    () => generateConceptArt({ prompt: 'Sci-fi airlock corridor', idToken: '' }),
    /ID token is required/i
  );

  let sentHeaders = null;
  let sentBody = null;
  const result = await generateConceptArt({
    prompt: 'Orbital marine helmet HUD concept sheet',
    model: 'imagen-3.0-generate-002',
    aspectRatio: '16:9',
    idToken: 'firebase-id-token-xyz',
    appCheckToken: 'appcheck-123',
    persistToStorage: true,
    userId: 'user-77',
    fileName: 'marine_hud',
    fetchFn: async (_endpoint, init) => {
      sentHeaders = init.headers;
      sentBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          mimeType: 'image/png',
          imageBase64: 'AAABBBCCC=',
          model: 'imagen-3.0-generate-002'
        })
      };
    },
    uploadAssetFn: async (dataUrl, opts) => {
      assert.equal(dataUrl, 'data:image/png;base64,AAABBBCCC=');
      assert.equal(opts.assetCategory, 'elements');
      assert.equal(opts.userId, 'user-77');
      return { url: 'https://storage.example/elements/marine_hud.png', offloaded: true };
    }
  });

  assert.equal(sentHeaders.Authorization, 'Bearer firebase-id-token-xyz');
  assert.equal(sentHeaders['x-firebase-appcheck'], 'appcheck-123');
  assert.equal(sentBody.aspectRatio, '16:9');
  assert.equal(result.dataUrl, 'data:image/png;base64,AAABBBCCC=');
  assert.equal(result.storageUrl, 'https://storage.example/elements/marine_hud.png');
  assert.equal(result.model, 'imagen-3.0-generate-002');
});

test('Phase 13 Custom Templates: CRUD persistence and non-destructive draft merging', () => {
  const universeState = { customTemplates: [] };

  const saved = saveCustomTemplate(
    {
      id: 'tpl-void-marine',
      name: 'Void Marine Template',
      type: 'Persona',
      description: 'Orbital boarding specialist',
      attributes: { armor: 'Powered Exo-Rig', cr: 16 },
      tags: ['Marine', 'Orbital']
    },
    universeState,
    (next) => {
      universeState.customTemplates = next;
    }
  );

  assert.equal(saved.template.id, 'tpl-void-marine');
  const listed = listCustomTemplates(universeState);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, 'Void Marine Template');

  const mergedDraft = applyCustomTemplate(listed[0], {
    title: 'Corporal Reyes',
    attributes: { callsign: 'Valkyrie' },
    tags: ['Squad Alpha']
  });
  assert.equal(mergedDraft.title, 'Corporal Reyes');
  assert.equal(mergedDraft.type, 'Persona');
  assert.equal(mergedDraft.attributes.armor, 'Powered Exo-Rig');
  assert.equal(mergedDraft.attributes.callsign, 'Valkyrie');
  assert.ok(mergedDraft.tags.includes('Marine'));
  assert.ok(mergedDraft.tags.includes('Squad Alpha'));

  deleteCustomTemplate('tpl-void-marine', universeState, (next) => {
    universeState.customTemplates = next;
  });
  assert.equal(listCustomTemplates(universeState).length, 0);
});
