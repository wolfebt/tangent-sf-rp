/**
 * @file routeRedirectsAndDeepLinks.test.mjs
 * @description Unit tests for Route Normalization, Deep-Linking & Parameter Preservation (Phase 1).
 * Verifies:
 * 1. Search-preserving redirect path resolution logic across legacy ADE aliases
 * 2. Parameter preservation under complex query strings (multiple params, special chars)
 * 3. Verification of relocated useWaypointEngine module accessibility
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSearchPreservingTarget,
  buildFoundryRedirectTarget
} from '../../src/components/routing/redirectTargets.js';

/**
 * SearchPreservingRedirect target resolution (shared implementation in src/components/routing/redirectTargets.js)
 */
const resolveSearchPreservingTarget = buildSearchPreservingTarget;

test('Route Normalization: Search preservation retains single parameter', () => {
  const result = resolveSearchPreservingTarget('/foundry/map', '?mapId=sector-omega-9');
  assert.equal(result, '/foundry/map?mapId=sector-omega-9');
});

test('Route Normalization: Search preservation retains multiple parameters and flags', () => {
  const search = '?mapId=sec_42&scenarioId=sc_alpha&tab=stage&debug=true';
  const result = resolveSearchPreservingTarget('/foundry/map', search);
  assert.equal(result, '/foundry/map?mapId=sec_42&scenarioId=sc_alpha&tab=stage&debug=true');
});

test('Route Normalization: Empty search returns clean canonical path without trailing question mark', () => {
  assert.equal(resolveSearchPreservingTarget('/foundry/map', ''), '/foundry/map');
  assert.equal(resolveSearchPreservingTarget('/foundry/map', null), '/foundry/map');
  assert.equal(resolveSearchPreservingTarget('/foundry/map', '?'), '/foundry/map');
});

test('Route Normalization: Canonical mapping table coverage', () => {
  const routes = [
    { from: '/map-maker', to: '/foundry/map', param: '?mapId=sec_1' },
    { from: '/mapmaker', to: '/foundry/map', param: '?mapId=sec_2' },
    { from: '/foundry/map-maker-legacy', to: '/foundry/map', param: '?mapId=sec_3' },
    { from: '/roster', to: '/folio', param: '?char=jax' },
  ];

  for (const r of routes) {
    const resolved = resolveSearchPreservingTarget(r.to, r.param);
    assert.equal(resolved, `${r.to}${r.param}`);
  }
});

test('Route Normalization: live-studio aliases resolve to Stage Run in a single hop', () => {
  // /live-studio, /ade-stage, /foundry/live, /foundry/live-studio-standalone all use FoundryRouteRedirect(stage, run)
  const stageRun = { view: 'stage', tab: 'run' };
  assert.equal(buildFoundryRedirectTarget(stageRun, ''), '/foundry?view=stage&tab=run');
  assert.equal(
    buildFoundryRedirectTarget(stageRun, '?scenarioId=sc_3'),
    '/foundry?scenarioId=sc_3&view=stage&tab=run'
  );
});

test('Route Normalization: FoundryRouteRedirect never overwrites existing view/tab deep-link params', () => {
  // Matches the previous two-hop behaviour of /ade-stage?tab=stage -> /foundry/live?tab=stage -> /foundry?tab=stage&view=stage
  assert.equal(
    buildFoundryRedirectTarget({ view: 'stage', tab: 'run' }, '?tab=stage'),
    '/foundry?tab=stage&view=stage'
  );
  assert.equal(
    buildFoundryRedirectTarget({ view: 'stage', tab: 'run' }, '?view=scenarios&tab=graph'),
    '/foundry?view=scenarios&tab=graph'
  );
});

test('Route Normalization: mission_control is the Foundry default and omits the view param', () => {
  assert.equal(buildFoundryRedirectTarget({ view: 'mission_control' }, ''), '/foundry');
  assert.equal(buildFoundryRedirectTarget({ view: 'mission_control' }, '?scenarioId=a'), '/foundry?scenarioId=a');
  assert.equal(buildFoundryRedirectTarget({ view: 'elements' }, ''), '/foundry?view=elements');
});

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

test('Module Relocation: useWaypointEngine exists in canonical hooks directory and legacy directory is gone', () => {
  const hookPath = fileURLToPath(new URL('../../src/pages/Foundry/hooks/useWaypointEngine.js', import.meta.url));
  assert.ok(fs.existsSync(hookPath), 'useWaypointEngine.js must exist in canonical hooks directory');
  
  const legacyPath = fileURLToPath(new URL('../../src/pages/Foundry/LiveStudio', import.meta.url));
  assert.equal(fs.existsSync(legacyPath), false, 'Legacy LiveStudio directory must be removed');
});

import { isAdeLiveStudioRoute, isAdeHubRoute, isStoryFoundryRoute } from '../../src/constants/routes.js';

// Adapter over the shared implementation used by <FoundryRouteRedirect /> (src/components/routing/redirectTargets.js)
function resolveFoundryRouteRedirect(view, tab, search = '') {
  return buildFoundryRedirectTarget({ view, tab }, search);
}

test('FoundryRouteRedirect: correctly normalizes sub-routes into canonical /foundry URLs', () => {
  assert.equal(
    resolveFoundryRouteRedirect('scenarios', 'stage', '?scenarioId=sec_1&mapId=map_1'),
    '/foundry?scenarioId=sec_1&mapId=map_1&view=scenarios&tab=stage'
  );
  assert.equal(
    resolveFoundryRouteRedirect('scenarios', null, ''),
    '/foundry?view=scenarios'
  );
  assert.equal(
    resolveFoundryRouteRedirect('interactive', null, ''),
    '/foundry?view=interactive'
  );
  assert.equal(
    resolveFoundryRouteRedirect('mission_control', null, ''),
    '/foundry'
  );
  assert.equal(
    resolveFoundryRouteRedirect('control-panel', null, ''),
    '/foundry?view=control-panel'
  );
  assert.equal(
    resolveFoundryRouteRedirect('elements', null, ''),
    '/foundry?view=elements'
  );
  assert.equal(
    resolveFoundryRouteRedirect('scripts', null, ''),
    '/foundry?view=scripts'
  );
  assert.equal(
    resolveFoundryRouteRedirect('graph', null, ''),
    '/foundry?view=graph'
  );
});

test('ADE HUD route matchers: search query parameters correctly disambiguate sub-studios', () => {
  assert.equal(isAdeHubRoute('/foundry', false, ''), true);
  assert.equal(isAdeHubRoute('/foundry', false, '?view=mission_control'), true);
  assert.equal(isAdeHubRoute('/foundry', false, '?view=scenarios'), false);
  assert.equal(isAdeHubRoute('/foundry', false, '?view=scenarios&tab=stage'), false);

  assert.equal(isStoryFoundryRoute('/foundry', false, '?view=scenarios'), true);
  assert.equal(isStoryFoundryRoute('/foundry', false, ''), false);
  assert.equal(isStoryFoundryRoute('/foundry', false, '?view=scenarios&tab=stage'), false);

  assert.equal(isAdeLiveStudioRoute('/foundry', '?tab=stage'), true);
  assert.equal(isAdeLiveStudioRoute('/foundry', '?view=scenarios&tab=stage'), true);
  assert.equal(isAdeLiveStudioRoute('/foundry', '?view=scenarios'), false);
  assert.equal(isAdeLiveStudioRoute('/foundry', ''), false);
});

