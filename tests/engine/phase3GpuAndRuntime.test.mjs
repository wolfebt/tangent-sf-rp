import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TacticalCameraRig } from '../../src/engine/3d/TacticalCameraRig.ts';
import {
  ATMOSPHERIC_PRESETS as ENGINE_ATMOSPHERIC_PRESETS,
  isKnownAtmosphericPreset,
  normalizeAtmosphericPresetKey,
  resolveAtmosphericPreset
} from '../../src/engine/vision/LightSourceManager.ts';
import { ATMOSPHERIC_PRESETS as WORKBENCH_ATMOSPHERIC_PRESETS } from '../../src/pages/Foundry/PresetsAndScripts/constants/atmosphericPresets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

test('Phase 3 Camera Rig: TacticalCameraRig initializes at 1:1 and updates aspect ratio via updateAspect()', () => {
  const rig = new TacticalCameraRig({ mode: 'tactical', initialDistance: 800 });
  assert.equal(rig.camera.aspect, 1);

  const widescreenAspect = 1920 / 1080;
  rig.updateAspect(widescreenAspect);
  assert.ok(Math.abs(rig.camera.aspect - widescreenAspect) < 1e-6);
});

test('Phase 3 Atmospheric Presets: resolves canonical LightSourceManager, PresetsAndScripts workbench, and EnvironmentTab weather IDs', () => {
  for (const key of Object.keys(ENGINE_ATMOSPHERIC_PRESETS)) {
    assert.equal(isKnownAtmosphericPreset(key), true);
    const resolved = resolveAtmosphericPreset(key);
    assert.equal(resolved.id, key);
  }

  for (const preset of WORKBENCH_ATMOSPHERIC_PRESETS) {
    assert.equal(isKnownAtmosphericPreset(preset.id), true, `Expected workbench preset "${preset.id}" to resolve`);
    const resolved = resolveAtmosphericPreset(preset.id);
    assert.notEqual(resolved.id, 'clear');
    assert.ok(resolved.tintAlpha > 0 || resolved.fogDensity > 0);
  }

  for (const envWeatherId of ['acid_rain', 'electrical_storm', 'toxic_haze', 'radiation_leak', 'vacuum_breach']) {
    assert.equal(isKnownAtmosphericPreset(envWeatherId), true, `Expected EnvironmentTab weather "${envWeatherId}" to resolve`);
    const resolved = resolveAtmosphericPreset(envWeatherId);
    assert.notEqual(resolved.id, 'clear');
  }

  assert.equal(isKnownAtmosphericPreset('unknown_bogus_weather'), false);
  assert.equal(normalizeAtmosphericPresetKey('unknown_bogus_weather'), 'clear');
  assert.equal(resolveAtmosphericPreset(undefined).id, 'clear');
});

test('Phase 3 Firebase Storage Rules: enforces owner-scoped ADE raster media uploads and default deny', () => {
  const rulesPath = path.join(projectRoot, 'storage.rules');
  const rulesText = fs.readFileSync(rulesPath, 'utf8');

  assert.match(rulesText, /match \/users\/\{userId\}\/ade\/\{assetCategory\}\/\{fileName\}/);
  assert.match(rulesText, /request\.auth\.uid == userId/);
  assert.match(rulesText, /\^\(story_media\|maps\|elements\|tokens\|handouts\)\$/);
  assert.match(rulesText, /request\.resource\.size <= 5 \* 1024 \* 1024/);
  assert.match(rulesText, /image\/\(webp\|png\|jpeg\)/);
  assert.doesNotMatch(rulesText, /svg/);
  assert.match(rulesText, /match \/\{allPaths=\*\*\}\s*\{\s*allow read, write: if false;/);
});
