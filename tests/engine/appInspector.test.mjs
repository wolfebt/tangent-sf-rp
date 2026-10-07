/**
 * @file appInspector.test.mjs
 * @description Regression tests for the app-inspector MCP tool handlers (scripts/mcp-app-inspector.mjs).
 * Covers: brace-aware route element parsing, staged diffstat correctness, and whole-word filename heuristics.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
process.env.APP_ROOT = ROOT;

const { toolHandlers, parseRouteSource, tokenizeFileName } = await import('../../scripts/mcp-app-inspector.mjs');

test('App Inspector: tokenizeFileName splits camelCase and separators into whole words', () => {
  assert.deepEqual(tokenizeFileName('useMapIngestion.ts'), ['use', 'map', 'ingestion']);
  assert.deepEqual(tokenizeFileName('speciesTypesData.js'), ['species', 'types', 'data']);
  assert.deepEqual(tokenizeFileName('vttWallSchema.test.mjs'), ['vtt', 'wall', 'schema', 'test']);
  assert.deepEqual(tokenizeFileName('migrate_omnicortex_schema.mjs'), ['migrate', 'omnicortex', 'schema']);
  assert.deepEqual(tokenizeFileName('FolioIdentityContext.jsx'), ['folio', 'identity', 'context']);
});

test('App Inspector: parseRouteSource extracts element component and props from nested JSX', () => {
  const src = `
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/comms" element={<NetworkRedirect defaultView="comms" />} />
      <Route path="/x" element={<Wrap cfg={{ a: 1 }} label="a > b" />} />
      <Route index element={<Home />} />
    </Routes>`;
  const routes = parseRouteSource(src);
  assert.deepEqual(routes, [
    { path: '/', element: 'Dashboard' },
    { path: '/comms', element: 'NetworkRedirect', props: 'defaultView="comms"' },
    { path: '/x', element: 'Wrap', props: 'cfg={{ a: 1 }} label="a > b"' }
  ]);
});

test('App Inspector: inspect_routes resolves real elements for App.jsx and FoundryApp.jsx', async () => {
  const res = await toolHandlers.inspect_routes({ includePages: false });
  assert.ok(res.reactAppRoutes.length > 0 && res.foundryRoutes.length > 0);
  const unspecified = [...res.reactAppRoutes, ...res.foundryRoutes].filter(r => r.element === 'unspecified');
  assert.deepEqual(unspecified, [], 'No route should report an unspecified element');

  const byPath = Object.fromEntries(res.reactAppRoutes.map(r => [r.path, r]));
  assert.equal(byPath['/'].element, 'Dashboard');
  assert.equal(byPath['/comms'].element, 'NetworkRedirect');
  assert.equal(byPath['/foundry/*'].element, 'FoundryApp');
  assert.equal(res.foundryRoutes.find(r => r.path === 'stage').element, 'ADEStage');
});

test('App Inspector: route-file heuristic ignores substring false positives and non-code files', async () => {
  const res = await toolHandlers.inspect_routes({ includePages: false });
  assert.ok(res.detectedRouteFiles.includes('src/constants/routes.js'));
  assert.ok(!res.detectedRouteFiles.some(f => f.endsWith('useMapIngestion.ts')), 'useMapIngestion must not match "api"');
  assert.ok(!res.detectedRouteFiles.some(f => f.endsWith('.md')), 'Markdown data files must be excluded');
});

test('App Inspector: schema heuristic ignores Identity/archetype substring matches', async () => {
  const res = await toolHandlers.inspect_models_and_schemas({ maxSnippetLength: 10 });
  const files = res.detectedSchemas.map(s => s.file);
  assert.ok(files.includes('src/pages/Foundry/ElementForge/elementSchemas.js'));
  assert.ok(files.includes('firestore.rules'));
  assert.ok(files.includes('src/schemas/vttWallSchema.js'));
  for (const fp of files) {
    assert.ok(!/Identity/.test(path.basename(fp)), `False positive on "entity" substring: ${fp}`);
  }
  assert.ok(!files.includes('src/data/archetypesData.js'), 'archetypesData must not match "types" substring');
});

test('App Inspector: fetch_workspace_diff stagedOnly reports the staged (--cached) diffstat', async () => {
  const res = await toolHandlers.fetch_workspace_diff({ stagedOnly: true });
  let expected = '';
  try {
    expected = execSync('git diff --cached --stat', { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return; // Not a git checkout; nothing to compare.
  }
  assert.equal(res.stagedOnly, true);
  assert.equal(res.diffStat || '', expected);
});
