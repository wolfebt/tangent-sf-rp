import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HIFI_CHROMA_TILE_PRESETS,
  TILE_FAMILY_METADATA,
  sampleToroidalNoise,
  sampleToroidalFbm,
  sampleToroidalWorley,
  synthesizeTileSvgDataUrl,
  synthesizeTileDataUrl,
  generateAutoTileVariants4Bit,
  generateStateTextures,
  compileRecipeToAssetUnit
} from '../../src/engine/assets/MicroTileSynthesizer.ts';
import {
  parsePromptToTileRecipeSync,
  synthesizeTileRecipeFromPrompt
} from '../../src/services/tileAiRecipeService.ts';
import { validateAssetUnit } from '../../src/schemas/assetUnitSchema.ts';

test('MicroTileSynthesizer - Toroidal 2D noise and Worley fields wrap seamlessly across [0, 1] boundaries', () => {
  const seed = 1337;
  const freq = 4;

  for (const t of [0.0, 0.15, 0.37, 0.68, 0.92]) {
    // Horizontal wrap u=0 vs u=1
    const leftVal = sampleToroidalNoise(0.0, t, freq, seed);
    const rightVal = sampleToroidalNoise(1.0, t, freq, seed);
    assert.ok(
      Math.abs(leftVal - rightVal) < 1e-9,
      `Expected u=0 (${leftVal}) and u=1 (${rightVal}) to match at v=${t}`
    );

    // Vertical wrap v=0 vs v=1
    const topVal = sampleToroidalNoise(t, 0.0, freq, seed);
    const bottomVal = sampleToroidalNoise(t, 1.0, freq, seed);
    assert.ok(
      Math.abs(topVal - bottomVal) < 1e-9,
      `Expected v=0 (${topVal}) and v=1 (${bottomVal}) to match at u=${t}`
    );

    // FBM wrap
    const fbmLeft = sampleToroidalFbm(0.0, t, freq, 3, seed);
    const fbmRight = sampleToroidalFbm(1.0, t, freq, 3, seed);
    assert.ok(Math.abs(fbmLeft - fbmRight) < 1e-9);

    // Worley cellular wrap
    const wLeft = sampleToroidalWorley(0.0, t, freq, 0.75, seed);
    const wRight = sampleToroidalWorley(1.0, t, freq, 0.75, seed);
    assert.ok(
      Math.abs(wLeft.f1 - wRight.f1) < 1e-9,
      `Expected Worley f1 at u=0 (${wLeft.f1}) and u=1 (${wRight.f1}) to match`
    );
    assert.equal(wLeft.cellId, wRight.cellId);
  }
});

test('MicroTileSynthesizer - Synthesizes all canonical HIFI CHROMA presets into valid Data URLs', () => {
  assert.ok(HIFI_CHROMA_TILE_PRESETS.length >= 16, 'Expected canonical HIFI CHROMA presets');
  assert.equal(Object.keys(TILE_FAMILY_METADATA).length, 8, 'Expected 8 procedural tile families');

  for (const preset of HIFI_CHROMA_TILE_PRESETS) {
    const dataUrl = synthesizeTileDataUrl(preset);
    assert.ok(
      dataUrl.startsWith('data:image/'),
      `Expected valid data URL for preset ${preset.id}, got ${dataUrl.slice(0, 30)}`
    );

    const svgUrl = synthesizeTileSvgDataUrl(preset);
    assert.ok(svgUrl.startsWith('data:image/svg+xml;utf8,'));
  }
});

test('MicroTileSynthesizer - Generates 16 4-Bit Marching Squares auto-tile variants and 5 state textures', () => {
  const baseRecipe = HIFI_CHROMA_TILE_PRESETS[0];
  const variants = generateAutoTileVariants4Bit(baseRecipe, 64);
  assert.equal(variants.length, 16, 'Expected exactly 16 cardinal 4-bit Marching Squares variants');
  for (let mask = 0; mask < 16; mask++) {
    assert.ok(variants[mask].startsWith('data:image/'), `Variant ${mask} should be a valid Data URL`);
  }

  const states = generateStateTextures(baseRecipe);
  assert.ok(states.pristine?.startsWith('data:image/'));
  assert.ok(states.damaged?.startsWith('data:image/'));
  assert.ok(states.destroyed?.startsWith('data:image/'));
  assert.ok(states.overgrown?.startsWith('data:image/'));
  assert.ok(states.corrupted?.startsWith('data:image/'));
});

test('MicroTileSynthesizer - Compiles recipe into a schema-validated AssetUnit with VTT mechanics', () => {
  const magmaPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t101_magma_basalt_crust');
  assert.ok(magmaPreset);

  const unit = compileRecipeToAssetUnit(magmaPreset, {
    includeAutoTiles: true,
    includeStateTextures: true
  });

  const validation = validateAssetUnit(unit);
  assert.equal(validation.success, true, 'Compiled AssetUnit must pass Zod schema validation');
  assert.equal(unit.visuals.auto_tile, 'marching_squares_4bit');
  assert.equal(unit.visuals.variants.length, 16);
  assert.ok(unit.visuals.stateTextures?.pristine);
  assert.ok(unit.visuals.stateTextures?.corrupted);
  assert.equal(unit.vtt_properties.dynamicLighting?.emits, true);
  assert.equal(unit.vtt_properties.hazard?.hazardType, 'thermal_fire');
  assert.match(unit.vtt_properties.hazard?.damageFormula || '', /2d10/);
});

test('tileAiRecipeService - Parses natural-language prompts into recipes with Tangent 2d10 VTT stats', async () => {
  const acidGrate = parsePromptToTileRecipeSync(
    'rusted starship grate over glowing green corrosive acid pool'
  );
  assert.equal(acidGrate.family, 'grating_catwalk');
  assert.equal(acidGrate.vtt.isHazard, true);
  assert.equal(acidGrate.vtt.hazardType, 'acid_corrosive');
  assert.match(acidGrate.vtt.damageFormula || '', /d10/);
  assert.equal(acidGrate.vtt.emitsLight, true);

  const cryoIce = parsePromptToTileRecipeSync('cracked cryo glacier ice');
  assert.equal(cryoIce.family, 'cryo_glacial');
  assert.equal(cryoIce.vtt.material, 'ice_slick');
  assert.ok(cryoIce.vtt.slipperyFriction < 0.6);

  const wallAuto = parsePromptToTileRecipeSync('armored bulkhead wall auto-tile');
  assert.equal(wallAuto.outputMode, 'marching_squares_4bit');
  assert.equal(wallAuto.category, 'wall_portal');
  assert.equal(wallAuto.vtt.blocksMovement, true);

  const asyncRes = await synthesizeTileRecipeFromPrompt('volcanic molten lava fissure', undefined, {
    preferAi: false
  });
  assert.equal(asyncRes.source, 'semantic_engine');
  assert.equal(asyncRes.recipe.vtt.isHazard, true);
  assert.equal(asyncRes.recipe.vtt.hazardType, 'thermal_fire');
});
