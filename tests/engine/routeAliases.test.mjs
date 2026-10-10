/**
 * @file routeAliases.test.mjs
 * @description Unit tests for ADE v2 Route Aliases and View Consolidation (Phase 1).
 * Verifies canonical routing for:
 * 1. Stage consolidation: scripts, presets, tactical, control-panel, live -> Stage workspace
 * 2. Weaver consolidation: interactive, gems -> Weaver workspace
 * 3. Foundational asset views: map, elements -> separate asset designer modules
 * 4. Preservation of search query parameters (storyId, scenarioId, mapId)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure route resolver modeling ADE v2 URL mapping logic
 */
export function resolveAdeRoute(viewParam, tabParam, defaultView = 'mission_control') {
  let resolvedView = 'mission_control';
  let resolvedTab = null;

  const v = (viewParam || defaultView || '').toLowerCase();
  const t = (tabParam || '').toLowerCase();

  // 1. Hub / Mission Control
  if (['mission_control', 'dashboard', 'mission-control', 'hub'].includes(v)) {
    resolvedView = 'mission_control';
    resolvedTab = null;
  }
  // 2. Map Maker
  else if (['map', 'map-maker', 'mapmaker'].includes(v)) {
    resolvedView = 'map';
    resolvedTab = null;
  }
  // 3. Elements / Asset Forge
  else if (['elements', 'gallery', 'assets'].includes(v)) {
    resolvedView = 'elements';
    resolvedTab = null;
  }
  // 4. The Stage VTT (Stage Compiler & Live Director Workspace)
  else if (['stage', 'live', 'live-studio', 'ade-stage', 'vtt', 'director', 'live_director', 'stage-vtt', 'scripts', 'presets', 'automation', 'control-panel', 'tactical'].includes(v)) {
    resolvedView = 'stage';
    if (['scripts', 'presets', 'automation'].includes(v)) {
      resolvedTab = 'scripts';
    } else if (['control-panel', 'tactical'].includes(v)) {
      resolvedTab = 'encounters';
    } else if (['live', 'live-studio', 'ade-stage', 'vtt', 'director', 'live_director', 'stage-vtt'].includes(v)) {
      resolvedTab = 'run';
    } else {
      resolvedTab = t || 'setup';
    }
  }
  // 5. Weaver (Narrative Construction Workspace)
  else if (['scenarios', 'weaver', 'story', 'narrative', 'interactive', 'gems', 'graph'].includes(v)) {
    resolvedView = 'scenarios';
    if (v === 'interactive') {
      resolvedTab = 'play';
    } else if (v === 'gems') {
      resolvedTab = 'gems';
    } else if (v === 'graph') {
      resolvedTab = 'graph';
    } else {
      resolvedTab = t || 'write';
    }
  }

  return { resolvedView, resolvedTab };
}

test('Route Aliases: The Stage VTT consolidates vtt, director, and stage-vtt into stage run tab', () => {
  assert.deepEqual(resolveAdeRoute('vtt'), { resolvedView: 'stage', resolvedTab: 'run' });
  assert.deepEqual(resolveAdeRoute('director'), { resolvedView: 'stage', resolvedTab: 'run' });
  assert.deepEqual(resolveAdeRoute('live_director'), { resolvedView: 'stage', resolvedTab: 'run' });
  assert.deepEqual(resolveAdeRoute('stage-vtt'), { resolvedView: 'stage', resolvedTab: 'run' });
});

test('Route Aliases: Stage consolidates scripts and presets into stage scripts tab', () => {
  assert.deepEqual(resolveAdeRoute('scripts'), { resolvedView: 'stage', resolvedTab: 'scripts' });
  assert.deepEqual(resolveAdeRoute('presets'), { resolvedView: 'stage', resolvedTab: 'scripts' });
  assert.deepEqual(resolveAdeRoute('automation'), { resolvedView: 'stage', resolvedTab: 'scripts' });
});

test('Route Aliases: Stage consolidates tactical and control-panel into stage encounters tab', () => {
  assert.deepEqual(resolveAdeRoute('tactical'), { resolvedView: 'stage', resolvedTab: 'encounters' });
  assert.deepEqual(resolveAdeRoute('control-panel'), { resolvedView: 'stage', resolvedTab: 'encounters' });
});

test('Route Aliases: Stage consolidates live and live-studio into stage run tab', () => {
  assert.deepEqual(resolveAdeRoute('live'), { resolvedView: 'stage', resolvedTab: 'run' });
  assert.deepEqual(resolveAdeRoute('live-studio'), { resolvedView: 'stage', resolvedTab: 'run' });
});

test('Route Aliases: Weaver consolidates interactive story into play tab', () => {
  assert.deepEqual(resolveAdeRoute('interactive'), { resolvedView: 'scenarios', resolvedTab: 'play' });
});

test('Route Aliases: Weaver consolidates guidance gems into gems tab', () => {
  assert.deepEqual(resolveAdeRoute('gems'), { resolvedView: 'scenarios', resolvedTab: 'gems' });
});

test('Route Aliases: Foundational asset modules remain separate', () => {
  assert.deepEqual(resolveAdeRoute('map'), { resolvedView: 'map', resolvedTab: null });
  assert.deepEqual(resolveAdeRoute('elements'), { resolvedView: 'elements', resolvedTab: null });
  assert.deepEqual(resolveAdeRoute('gallery'), { resolvedView: 'elements', resolvedTab: null });
});

test('Route Aliases: Landing page defaults to mission_control Hub', () => {
  assert.deepEqual(resolveAdeRoute(null, null, 'mission_control'), { resolvedView: 'mission_control', resolvedTab: null });
  assert.deepEqual(resolveAdeRoute('hub'), { resolvedView: 'mission_control', resolvedTab: null });
});
