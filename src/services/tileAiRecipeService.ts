/**
 * @file tileAiRecipeService.ts
 * @description Natural-Language Prompt-to-Recipe Engine for the HIFI CHROMA
 * Micro-Tile Synthesizer. Combines an instant (<2ms) deterministic semantic
 * parser with optional Gemini Flash structured JSON refinement via bastionService.
 */

import {
  HIFI_CHROMA_TILE_PRESETS,
  type TileOutputMode,
  type TileProceduralFamily,
  type TileSynthesisRecipe
} from '../engine/assets/MicroTileSynthesizer.ts';
import type { AssetCategory } from '../schemas/assetUnitSchema.ts';
import { fetchGeminiContent, getGeminiApiKey } from './bastionService.js';

/**
 * Deterministic string hash to generate a reproducible seed from any user prompt.
 */
function hashPromptToSeed(prompt: string): number {
  let h = 2166136261;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 90000) + 1000;
}

/**
 * Formats a clean title-case name from a user prompt.
 */
function formatRecipeNameFromPrompt(prompt: string): string {
  const cleaned = prompt
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return cleaned || 'Custom Synthesized Tile';
}

/**
 * Instant (<2ms) deterministic semantic prompt-to-recipe translator.
 * Maps natural-language architectural, biome, color, and hazard keywords
 * to a complete `TileSynthesisRecipe` with canonical Tangent 2d10 VTT mechanics.
 */
export function parsePromptToTileRecipeSync(
  prompt: string,
  baseRecipe?: TileSynthesisRecipe
): TileSynthesisRecipe {
  const raw = (prompt || '').trim();
  const lower = raw.toLowerCase();

  // 1. Start from the closest canonical preset or provided baseRecipe
  let matchedPreset: TileSynthesisRecipe =
    baseRecipe || HIFI_CHROMA_TILE_PRESETS[0];

  if (/grate|grating|catwalk|mesh|sub-?floor|conduit/i.test(lower)) {
    matchedPreset =
      /plasma|glow|neon|conduit|acid/i.test(lower)
        ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t005_plasma_conduit_grate')!
        : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t003_diamond_grating')!;
  } else if (/cryo|ice|glacier|frost|frozen|snow|permafrost/i.test(lower)) {
    matchedPreset = /deck|hull|chamber|metal/i.test(lower)
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t088_frosted_cryo_deck')!
      : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t085_fractured_glacier_ice')!;
  } else if (/magma|lava|volcan|molten|slag|fire|thermal/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t101_magma_basalt_crust')!;
  } else if (/acid|corrosive|vat|toxic|chemical|sludge|biohazard/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t104_corrosive_acid_vat')!;
  } else if (/plasma|reactor|overload|vent|arc/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t108_overload_plasma_vent')!;
  } else if (/xeno|hive|myceli|biopunk|chitin|flesh|spore|alien/i.test(lower)) {
    matchedPreset = /chitin|resin|spore/i.test(lower)
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t068_chitin_hive_resin')!
      : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t065_biolum_mycelium')!;
  } else if (/asphalt|cyber|street|road|sidewalk|ferrocrete|urban|plaza|marble/i.test(lower)) {
    matchedPreset = /marble|plaza|corporate|brass|gold/i.test(lower)
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t032_imperial_plaza_marble')!
      : /neon|wet|rain|asphalt/i.test(lower)
        ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t025_wet_asphalt_neon')!
        : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t027_ferrocrete_sidewalk')!;
  } else if (/wasteland|desert|sand|regolith|alkali|canyon|basalt|dirt|mud|cracked/i.test(lower)) {
    matchedPreset = /rad|nuclear|trinitite|slag/i.test(lower)
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t053_radioactive_slag_glass')!
      : /mars|red|oxide|iron/i.test(lower)
        ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t047_martian_iron_regolith')!
        : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t045_cracked_alkali_pan')!;
  } else if (/crater|splatter|ichor|blood|decal|barricade|cover|prop|stencil/i.test(lower)) {
    matchedPreset = /ichor|blood|acid|splatter/i.test(lower)
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_decal_xeno_ichor')!
      : /barricade|aegis|shield|cover/i.test(lower)
        ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_decal_barricade_stamp')!
        : HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_decal_blast_crater')!;
  } else if (/rust|corroded|derelict|scrap/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t013_corroded_rust_deck')!;
  } else if (/clean|med|sterile|hex|lab/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t006_cleanroom_hex')!;
  } else if (/cargo|hazard|stripe|chevron/i.test(lower)) {
    matchedPreset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === 'preset_t002_cargo_hazard_bay')!;
  }

  // Deep clone matched preset
  const recipe: TileSynthesisRecipe = JSON.parse(JSON.stringify(matchedPreset));
  recipe.id = `synth_${Date.now()}`;
  if (raw.length > 0) {
    recipe.name = formatRecipeNameFromPrompt(raw);
    recipe.seed = hashPromptToSeed(raw);
  }

  // 2. Output mode & Category overrides
  if (/auto-?tile|marching|4-?bit|wall set|transition/i.test(lower)) {
    recipe.outputMode = 'marching_squares_4bit';
    recipe.geometry.transparentBg = true;
    if (/wall|bulkhead/i.test(lower)) {
      recipe.category = 'wall_portal';
      recipe.vtt.blocksMovement = true;
      recipe.vtt.blocksVision = true;
      recipe.vtt.cover = 'full_cover';
    }
  } else if (/decal|overlay|stamp|splatter|crater/i.test(lower)) {
    recipe.outputMode = 'decal_overlay';
    recipe.family = 'tactical_decal_prop';
    recipe.geometry.transparentBg = true;
  }

  // 3. Color & Chroma overrides
  if (/rust|corroded|oxidized|copper/i.test(lower)) {
    recipe.palette.primary = '#3D2314';
    recipe.palette.secondary = '#7C2D12';
    recipe.palette.accent = '#D97706';
    recipe.ligneClaire.weathering = Math.max(0.75, recipe.ligneClaire.weathering);
  }
  if (/acid|toxic|green|venom|bio/i.test(lower)) {
    recipe.palette.accent = '#A3E635';
    recipe.palette.glow = '#4ADE80';
    recipe.ligneClaire.emissiveStrength = Math.max(0.75, recipe.ligneClaire.emissiveStrength);
  }
  if (/plasma|cyan|electric|arc|cobalt/i.test(lower)) {
    recipe.palette.accent = '#38BDF8';
    recipe.palette.glow = '#00F5D4';
    recipe.ligneClaire.emissiveStrength = Math.max(0.8, recipe.ligneClaire.emissiveStrength);
  }
  if (/magma|lava|molten|ember|flame|fire/i.test(lower)) {
    recipe.palette.accent = '#F97316';
    recipe.palette.glow = '#FACC15';
    recipe.ligneClaire.emissiveStrength = Math.max(0.9, recipe.ligneClaire.emissiveStrength);
  }
  if (/void|psionic|purple|violet|magenta|corrupt/i.test(lower)) {
    recipe.palette.primary = '#1E1B4B';
    recipe.palette.secondary = '#4C1D95';
    recipe.palette.accent = '#E879F9';
    recipe.palette.glow = '#D946EF';
    recipe.ligneClaire.emissiveStrength = Math.max(0.8, recipe.ligneClaire.emissiveStrength);
  }
  if (/blood|crimson|gore|sanguine/i.test(lower)) {
    recipe.palette.secondary = '#7F1D1D';
    recipe.palette.accent = '#EF4444';
    recipe.palette.glow = '#F87171';
  }
  if (/gold|brass|imperial|gilded/i.test(lower)) {
    recipe.palette.accent = '#EAB308';
    recipe.palette.glow = '#FEF08A';
  }

  // 4. Ligne Claire & Geometry overrides
  if (/hazard|chevron|warning|stripe/i.test(lower)) {
    recipe.ligneClaire.hazardStripes = true;
  }
  if (/heavy ink|bold|comic|moebius|cross-?hatch/i.test(lower)) {
    recipe.ligneClaire.inkWeight = 2.8;
    recipe.ligneClaire.crossHatchDensity = 0.7;
  }
  if (/clean|pristine|sterile|polished/i.test(lower)) {
    recipe.ligneClaire.weathering = 0.05;
    recipe.ligneClaire.crossHatchDensity = 0.15;
  }
  if (/shattered|cracked|broken|ruined|damaged/i.test(lower)) {
    recipe.geometry.irregularity = Math.max(0.8, recipe.geometry.irregularity);
    recipe.ligneClaire.weathering = Math.max(0.75, recipe.ligneClaire.weathering);
  }

  // 5. Canonical Tangent 2d10 VTT Mechanics inference
  if (/acid|corrosive|toxic|magma|lava|plasma|radiation|radioactive|hazard|spore|fire/i.test(lower)) {
    recipe.vtt.isHazard = true;
    recipe.vtt.emitsLight = true;
    recipe.vtt.lightRadiusBrightFt = 10;
    recipe.vtt.lightRadiusDimFt = 20;

    if (/acid|corrosive|toxic/i.test(lower)) {
      recipe.vtt.hazardType = 'acid_corrosive';
      recipe.vtt.material = 'acid_corrosive';
      recipe.vtt.damageFormula = '2d10+2 acid';
      recipe.vtt.saveAttribute = 'Reflex (AGI)';
      recipe.vtt.saveDc = 14;
    } else if (/magma|lava|fire|thermal|molten/i.test(lower)) {
      recipe.vtt.hazardType = 'thermal_fire';
      recipe.vtt.material = 'plasma_fluid';
      recipe.vtt.damageFormula = '2d10+4 thermal';
      recipe.vtt.saveAttribute = 'Reflex (AGI)';
      recipe.vtt.saveDc = 15;
    } else if (/rad|nuclear|trinitite/i.test(lower)) {
      recipe.vtt.hazardType = 'radiation_leak';
      recipe.vtt.damageFormula = '1d10+3 radiation';
      recipe.vtt.saveAttribute = 'Fortitude (STA)';
      recipe.vtt.saveDc = 14;
    } else if (/spore|biohazard|xeno/i.test(lower)) {
      recipe.vtt.hazardType = 'biohazard_spore';
      recipe.vtt.material = 'organic_flesh';
      recipe.vtt.damageFormula = '1d10+2 chemical';
      recipe.vtt.saveAttribute = 'Fortitude (STA)';
      recipe.vtt.saveDc = 13;
    } else {
      recipe.vtt.hazardType = 'plasma_leak';
      recipe.vtt.material = 'plasma_fluid';
      recipe.vtt.damageFormula = '2d10+4 plasma';
      recipe.vtt.saveAttribute = 'Reflex (AGI)';
      recipe.vtt.saveDc = 15;
    }
  }

  if (/ice|slick|frosted|glacier|oil/i.test(lower)) {
    recipe.vtt.material = 'ice_slick';
    recipe.vtt.slipperyFriction = 0.35;
    recipe.vtt.movementCost = 1.5;
  }

  return recipe;
}

const TILE_RECIPE_SYSTEM_PROMPT = `You are the HIFI CHROMA Cartographic Shader Architect for the Tangent Science Fantasy Roleplaying Game (2d10 system).
Convert the user's natural language map tile description into a JSON object matching the TileSynthesisRecipe overrides.
Return ONLY valid JSON with these fields:
{
  "name": "string (concise descriptive tile title)",
  "family": "industrial_deck | grating_catwalk | urban_cyber | wasteland_regolith | xeno_biopunk | cryo_glacial | volcanic_hazard | tactical_decal_prop",
  "outputMode": "seamless_single | marching_squares_4bit | decal_overlay",
  "category": "terrain_brush | doodad | hazard | wall_portal",
  "palette": {
    "primary": "#RRGGBB",
    "secondary": "#RRGGBB",
    "accent": "#RRGGBB",
    "ink": "#RRGGBB (deep dark ink outline color, e.g. #0D1117)",
    "glow": "#RRGGBB"
  },
  "geometry": {
    "scale": 1..6,
    "subdivision": 1..5,
    "irregularity": 0.0..1.0,
    "bevelDepth": 0.0..1.0,
    "gapWidth": 1..6
  },
  "ligneClaire": {
    "inkWeight": 1.0..3.5,
    "crossHatchDensity": 0.0..1.0,
    "zenithalContrast": 0.3..1.0,
    "weathering": 0.0..1.0,
    "hazardStripes": boolean,
    "emissiveStrength": 0.0..1.0
  },
  "vtt": {
    "material": "metal_deck | stone_masonry | dirt_packed | sand_loose | water_shallow | water_deep | ice_slick | organic_flesh | plasma_fluid | acid_corrosive | glass_translucent",
    "movementCost": 1 | 1.5 | 2,
    "slipperyFriction": 0.2..1.2,
    "cover": "none | quarter_cover | half_cover | three_quarters | full_cover",
    "blocksMovement": boolean,
    "blocksVision": boolean,
    "emitsLight": boolean,
    "lightRadiusBrightFt": number,
    "lightRadiusDimFt": number,
    "isHazard": boolean,
    "hazardType": "thermal_fire | acid_corrosive | plasma_leak | radiation_leak | biohazard_spore | vacuum",
    "damageFormula": "2d10+X <type> (must use Tangent 2d10 dice notation)",
    "saveAttribute": "Reflex (AGI) | Fortitude (STA) | Tech (INT) | Will (WIL)",
    "saveDc": number
  }
}`;

/**
 * Synthesizes a `TileSynthesisRecipe` from a natural-language prompt.
 * Always computes the instant deterministic semantic recipe first, then optionally
 * refines palette, Ligne Claire shader parameters, and 2d10 VTT stats via Gemini Flash
 * if an API key or local inference endpoint is available.
 */
export async function synthesizeTileRecipeFromPrompt(
  prompt: string,
  baseRecipe?: TileSynthesisRecipe,
  options: { preferAi?: boolean } = {}
): Promise<{ recipe: TileSynthesisRecipe; source: 'gemini_flash' | 'semantic_engine' }> {
  const baseline = parsePromptToTileRecipeSync(prompt, baseRecipe);

  if (options.preferAi === false || !prompt || !prompt.trim()) {
    return { recipe: baseline, source: 'semantic_engine' };
  }

  const apiKey = getGeminiApiKey();
  const preferredPlatform =
    (typeof localStorage !== 'undefined' && localStorage.getItem('aiPlatform')) || 'gemini';
  const hasLocalOrProxy =
    preferredPlatform === 'custom' ||
    preferredPlatform === 'local' ||
    (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('firebaseIdToken')));

  if (!apiKey && !hasLocalOrProxy) {
    return { recipe: baseline, source: 'semantic_engine' };
  }

  try {
    const response = await fetchGeminiContent(apiKey, {
      systemInstruction: {
        parts: [{ text: TILE_RECIPE_SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a HIFI CHROMA Ligne Claire map tile recipe for: "${prompt.trim()}"`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { recipe: baseline, source: 'semantic_engine' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validFamilies: TileProceduralFamily[] = [
      'industrial_deck',
      'grating_catwalk',
      'urban_cyber',
      'wasteland_regolith',
      'xeno_biopunk',
      'cryo_glacial',
      'volcanic_hazard',
      'tactical_decal_prop'
    ];
    const validModes: TileOutputMode[] = [
      'seamless_single',
      'marching_squares_4bit',
      'decal_overlay'
    ];
    const validCategories: AssetCategory[] = [
      'terrain_brush',
      'doodad',
      'hazard',
      'wall_portal',
      'token',
      'creature',
      'vehicle'
    ];

    const merged: TileSynthesisRecipe = {
      ...baseline,
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : baseline.name,
      family: validFamilies.includes(parsed.family) ? parsed.family : baseline.family,
      outputMode: validModes.includes(parsed.outputMode) ? parsed.outputMode : baseline.outputMode,
      category: validCategories.includes(parsed.category) ? parsed.category : baseline.category,
      palette: {
        primary: parsed.palette?.primary || baseline.palette.primary,
        secondary: parsed.palette?.secondary || baseline.palette.secondary,
        accent: parsed.palette?.accent || baseline.palette.accent,
        ink: parsed.palette?.ink || baseline.palette.ink,
        glow: parsed.palette?.glow || baseline.palette.glow
      },
      geometry: {
        ...baseline.geometry,
        ...(parsed.geometry || {})
      },
      ligneClaire: {
        ...baseline.ligneClaire,
        ...(parsed.ligneClaire || {})
      },
      vtt: {
        ...baseline.vtt,
        ...(parsed.vtt || {})
      }
    };

    return { recipe: merged, source: 'gemini_flash' };
  } catch (err) {
    console.warn('[TileAiRecipeService] Falling back to deterministic semantic recipe:', err);
    return { recipe: baseline, source: 'semantic_engine' };
  }
}
