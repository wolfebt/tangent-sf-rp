/**
 * @file phase16SotaHardening.test.mjs
 * @description Phase 16 SOTA Architecture & Hardening Verification Suite:
 *   1. JSX/TS AST static linter catches duplicate props, duplicate keys, duplicate bindings, conditional hooks & Konva imports
 *   2. compendiumSeedLoader hydrates synchronously on Node (>= 250 articles) & zero source files statically/dynamically import compendiumSeed.json
 *   3. adeStore synchronizes activePillar when setActiveView is dispatched
 *   4. MapMaker PixiJS v8 helpers & landmass grid conversion alias parity + zero Konva imports under src/
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { lintSourceCode, runStaticCheck } from '../../scripts/lintJsxStaticCheck.mjs';
import {
  getCachedCompendiumSeed,
  isCompendiumSeedReady,
  loadCompendiumSeed
} from '../../src/utils/compendiumSeedLoader.js';
import { useADEStore, derivePillarForView } from '../../src/pages/Foundry/store/adeStore.ts';
import {
  parseHexColor,
  computeWallStrokeStyle,
  computeRulerPaceStats
} from '../../src/pages/Foundry/MapMaker/pixi/mapMakerPixiHelpers.ts';
import {
  convertGridToMapElements,
  convertGridToKonvaElements
} from '../../src/pages/Foundry/MapMaker/map/landmassGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

test('Phase 16.1: JSX/TS static AST linter catches duplicate props, keys, bindings, conditional hooks & Konva imports', () => {
  const dupPropIssues = lintSourceCode(
    `export function Demo() { return <div id="a" id="b" />; }`,
    'Demo.jsx'
  );
  assert.ok(dupPropIssues.some((i) => i.rule === 'duplicate-jsx-prop'));

  const dupKeyIssues = lintSourceCode(
    `export const cfg = { alpha: 1, alpha: 2 };`,
    'cfg.js'
  );
  assert.ok(dupKeyIssues.some((i) => i.rule === 'duplicate-object-key'));

  const dupBindIssues = lintSourceCode(
    `const x = 1; const x = 2; export default x;`,
    'bind.js'
  );
  assert.ok(dupBindIssues.some((i) => i.rule === 'duplicate-binding'));

  const condHookIssues = lintSourceCode(
    `export function Bad({ flag }) { if (flag) { useEffect(() => {}); } return null; }`,
    'Bad.jsx'
  );
  assert.ok(condHookIssues.some((i) => i.rule === 'conditional-hook'));

  const konvaIssues = lintSourceCode(
    `import { Stage } from 'react-konva'; export const X = Stage;`,
    'Legacy.jsx',
    { checkKonva: true }
  );
  assert.ok(konvaIssues.some((i) => i.rule === 'no-konva-import'));

  const cleanIssues = lintSourceCode(
    `export function Good({ title }) { const [val] = useState(title); return <div title={val} />; }`,
    'Good.jsx'
  );
  assert.equal(cleanIssues.length, 0);

  const fullAudit = runStaticCheck({ checkKonva: true });
  assert.equal(fullAudit.issues.length, 0, `Unexpected src issues: ${JSON.stringify(fullAudit.issues)}`);
  assert.ok(fullAudit.filesScanned >= 800);
});

test('Phase 16.2: compendiumSeed static-asset offload preserves Node sync access & eliminates src JSON imports', async () => {
  assert.equal(isCompendiumSeedReady(), true);
  const syncSeed = getCachedCompendiumSeed();
  assert.ok(Array.isArray(syncSeed) && syncSeed.length >= 250, `Expected >= 250 compendium articles, got ${syncSeed.length}`);

  const asyncSeed = await loadCompendiumSeed();
  assert.equal(asyncSeed.length, syncSeed.length);

  assert.equal(
    fs.existsSync(path.join(projectRoot, 'public', 'data', 'compendiumSeed.json')),
    true,
    'public/data/compendiumSeed.json static asset must exist'
  );

  const srcFiles = walkFiles(path.join(projectRoot, 'src')).filter((f) => /\.(js|jsx|ts|tsx)$/i.test(f));
  const jsonImporters = srcFiles.filter((f) => {
    const txt = fs.readFileSync(f, 'utf8');
    return /(?:import|from)\s*(?:\([^)]*|[^;]*['"])[^'"]*compendiumSeed\.json/.test(txt);
  });
  assert.deepEqual(jsonImporters, [], `No src module should bundle compendiumSeed.json directly: ${jsonImporters.join(', ')}`);
});

test('Phase 16.3: adeStore setActiveView synchronizes activePillar deterministically', () => {
  const store = useADEStore.getState();

  assert.equal(derivePillarForView('map'), 'maps');
  assert.equal(derivePillarForView('scenarios'), 'narrative');
  assert.equal(derivePillarForView('stage'), 'stage');
  assert.equal(derivePillarForView('scripts'), 'scripts');
  assert.equal(derivePillarForView('elements'), 'assets');

  store.setActiveView('map');
  assert.equal(useADEStore.getState().activePillar, 'maps');

  store.setActiveView('scenarios');
  assert.equal(useADEStore.getState().activePillar, 'narrative');

  store.setActiveView('mission_control');
  assert.equal(useADEStore.getState().activePillar, 'mission_control');
});

test('Phase 16.4: MapMaker PixiJS v8 migration helpers, landmass alias & zero Konva footprint', () => {
  assert.equal(parseHexColor('#22d3ee'), 0x22d3ee);
  assert.equal(parseHexColor('#0f0'), 0x00ff00);

  const lockedDoorStyle = computeWallStrokeStyle({ type: 'door', isLocked: true, isOpen: false }, false);
  assert.equal(lockedDoorStyle.isDoor, true);
  assert.equal(lockedDoorStyle.strokeColor, '#f59e0b');
  assert.equal(lockedDoorStyle.strokeWidth, 6);

  const openDoorStyle = computeWallStrokeStyle({ type: 'door', doorState: 'open', isOpen: true }, true);
  assert.equal(openDoorStyle.isOpen, true);
  assert.equal(openDoorStyle.strokeColor, '#22d3ee');
  assert.deepEqual(openDoorStyle.dash, [6, 6]);

  const pace = computeRulerPaceStats([{ x: 0, y: 0 }], { x: 200, y: 0 }, 40);
  assert.ok(pace);
  assert.equal(pace.totalDistanceMeters, 10);
  assert.equal(pace.paceTier, 'WALK (30ft)');

  assert.equal(convertGridToKonvaElements, convertGridToMapElements);

  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies?.konva, undefined);
  assert.equal(pkg.dependencies?.['react-konva'], undefined);
});
