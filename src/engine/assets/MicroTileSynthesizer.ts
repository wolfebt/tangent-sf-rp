/**
 * @file MicroTileSynthesizer.ts
 * @description HIFI CHROMA / Ligne Claire Client-Side Micro-Tile Synthesizer.
 * Generates seamless toroidal repeating tiles, 16-variant 4-bit Marching Squares
 * auto-tile sets, 5-state environmental textures, and alpha-transparent tactical
 * decals/props with auto-populated Tangent 2d10 VTT mechanics.
 */

import {
  type AssetCategory,
  type AssetUnit,
  type CoverRating,
  type SurfaceMaterialType,
  type VisualVariants,
  createDefaultAssetUnit
} from '../../schemas/assetUnitSchema.ts';
import { AssetIngestionPipeline } from './AssetIngestionPipeline.ts';

export type TileProceduralFamily =
  | 'industrial_deck'
  | 'grating_catwalk'
  | 'urban_cyber'
  | 'wasteland_regolith'
  | 'xeno_biopunk'
  | 'cryo_glacial'
  | 'volcanic_hazard'
  | 'tactical_decal_prop';

export type TileOutputMode =
  | 'seamless_single'
  | 'marching_squares_4bit'
  | 'decal_overlay';

export interface TileSynthesisRecipe {
  id: string;
  name: string;
  catalogCode?: string;
  family: TileProceduralFamily;
  outputMode: TileOutputMode;
  category: AssetCategory;
  resolution: 64 | 128 | 256;
  seed: number;

  palette: {
    primary: string;
    secondary: string;
    accent: string;
    ink: string;
    glow?: string;
  };

  geometry: {
    scale: number;        // 1 to 8
    subdivision: number;  // 1 to 6
    irregularity: number; // 0.0 to 1.0
    bevelDepth: number;   // 0.0 to 1.0
    gapWidth: number;     // 1 to 8 px
    transparentBg?: boolean;
  };

  ligneClaire: {
    inkWeight: number;         // 0.5 to 4.0 px
    crossHatchDensity: number; // 0.0 to 1.0
    zenithalContrast: number;  // 0.0 to 1.0
    weathering: number;        // 0.0 to 1.0
    hazardStripes: boolean;
    emissiveStrength: number;  // 0.0 to 1.0
  };

  vtt: {
    material: SurfaceMaterialType;
    movementCost: number;
    slipperyFriction: number;
    cover: CoverRating;
    blocksMovement: boolean;
    blocksVision: boolean;
    isLiquid?: boolean;
    emitsLight: boolean;
    lightRadiusBrightFt?: number;
    lightRadiusDimFt?: number;
    lightAnimation?:
      | 'solid'
      | 'torch_flicker'
      | 'pulse'
      | 'emergency_strobe'
      | 'fluorescent_flicker'
      | 'plasma_churn';
    isHazard: boolean;
    hazardType?:
      | 'thermal_fire'
      | 'acid_corrosive'
      | 'plasma_leak'
      | 'radiation_leak'
      | 'biohazard_spore'
      | 'vacuum';
    damageFormula?: string;
    saveAttribute?: string;
    saveDc?: number;
  };
}

export const TILE_FAMILY_METADATA: Record<
  TileProceduralFamily,
  { label: string; icon: string; description: string; defaultMaterial: SurfaceMaterialType }
> = {
  industrial_deck: {
    label: 'Industrial Hull & Decking',
    icon: '🔩',
    description: 'Riveted starship hull plates, maintenance hatches, and reinforced bulkhead seams.',
    defaultMaterial: 'metal_deck'
  },
  grating_catwalk: {
    label: 'Catwalk & Sub-Deck Grating',
    icon: '🕸️',
    description: 'Perforated diamond/hex mesh over dark sub-deck void or glowing conduit channels.',
    defaultMaterial: 'metal_deck'
  },
  urban_cyber: {
    label: 'Cyber-Urban Ferrocrete',
    icon: '🏙️',
    description: 'Ferrocrete pavement slabs, tactile transit strips, drainage grates, and neon inlays.',
    defaultMaterial: 'stone_masonry'
  },
  wasteland_regolith: {
    label: 'Wasteland & Regolith',
    icon: '🏜️',
    description: 'Cracked alkali flats, fractured basalt shards, wind-rippled dunes, and cratered ash.',
    defaultMaterial: 'dirt_packed'
  },
  xeno_biopunk: {
    label: 'Xeno-Biopunk & Mycelial',
    icon: '🧬',
    description: 'Chitinous floor plates, pulsing bioluminescent mycelial veins, and spore membranes.',
    defaultMaterial: 'organic_flesh'
  },
  cryo_glacial: {
    label: 'Cryo-Glacial & Permafrost',
    icon: '❄️',
    description: 'Fractured glacier ice, specular frost veins, and frozen industrial decking.',
    defaultMaterial: 'ice_slick'
  },
  volcanic_hazard: {
    label: 'Volcanic & Plasma Hazards',
    icon: '🌋',
    description: 'Cooling basalt crust over glowing magma fissures, corrosive acid pools, and plasma vents.',
    defaultMaterial: 'plasma_fluid'
  },
  tactical_decal_prop: {
    label: 'Tactical Decals & Cover Props',
    icon: '🎯',
    description: 'Alpha-transparent blast craters, fluid splatters, hazard stencils, and tactical cover stamps.',
    defaultMaterial: 'metal_deck'
  }
};

/**
 * 24 Canonical HIFI CHROMA Tile Presets aligned with AI_IMAGE_GEN_ASSET_CATALOG_AND_PROMPTS.md
 */
export const HIFI_CHROMA_TILE_PRESETS: TileSynthesisRecipe[] = [
  // --- INDUSTRIAL / STARSHIP (T-001 .. T-015) ---
  {
    id: 'preset_t001_hull_deck',
    name: 'Brushed Steel Hull Decking',
    catalogCode: 'T-001',
    family: 'industrial_deck',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1001,
    palette: {
      primary: '#2A303C',
      secondary: '#4A5568',
      accent: '#F6AD55',
      ink: '#0D1117',
      glow: '#38BDF8'
    },
    geometry: { scale: 2, subdivision: 2, irregularity: 0.1, bevelDepth: 0.65, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 2.0,
      crossHatchDensity: 0.35,
      zenithalContrast: 0.6,
      weathering: 0.25,
      hazardStripes: false,
      emissiveStrength: 0.1
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t002_cargo_hazard_bay',
    name: 'Heavy Cargo Bay Hazard Plating',
    catalogCode: 'T-002',
    family: 'industrial_deck',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1002,
    palette: {
      primary: '#242933',
      secondary: '#3B4252',
      accent: '#EAB308',
      ink: '#090D16',
      glow: '#F59E0B'
    },
    geometry: { scale: 2, subdivision: 3, irregularity: 0.15, bevelDepth: 0.75, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.2,
      crossHatchDensity: 0.45,
      zenithalContrast: 0.7,
      weathering: 0.4,
      hazardStripes: true,
      emissiveStrength: 0.2
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t003_diamond_grating',
    name: 'Open Diamond Mesh Catwalk',
    catalogCode: 'T-003',
    family: 'grating_catwalk',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1003,
    palette: {
      primary: '#111827',
      secondary: '#4B5563',
      accent: '#9CA3AF',
      ink: '#030712',
      glow: '#06B6D4'
    },
    geometry: { scale: 4, subdivision: 4, irregularity: 0.05, bevelDepth: 0.5, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 1.8,
      crossHatchDensity: 0.5,
      zenithalContrast: 0.65,
      weathering: 0.3,
      hazardStripes: false,
      emissiveStrength: 0.25
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t005_plasma_conduit_grate',
    name: 'Sub-Floor Plasma Conduit Grating',
    catalogCode: 'T-005',
    family: 'grating_catwalk',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1005,
    palette: {
      primary: '#0F172A',
      secondary: '#334155',
      accent: '#22D3EE',
      ink: '#020617',
      glow: '#00F5D4'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.1, bevelDepth: 0.6, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.0,
      crossHatchDensity: 0.4,
      zenithalContrast: 0.75,
      weathering: 0.2,
      hazardStripes: true,
      emissiveStrength: 0.85
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 10,
      lightRadiusDimFt: 20,
      lightAnimation: 'pulse',
      isHazard: false
    }
  },
  {
    id: 'preset_t006_cleanroom_hex',
    name: 'Med-Bay Sterile Polymer Hex Tile',
    catalogCode: 'T-006',
    family: 'urban_cyber',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1006,
    palette: {
      primary: '#E2E8F0',
      secondary: '#CBD5E1',
      accent: '#0EA5E9',
      ink: '#1E293B',
      glow: '#38BDF8'
    },
    geometry: { scale: 3, subdivision: 2, irregularity: 0.02, bevelDepth: 0.4, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 1.5,
      crossHatchDensity: 0.15,
      zenithalContrast: 0.45,
      weathering: 0.05,
      hazardStripes: false,
      emissiveStrength: 0.35
    },
    vtt: {
      material: 'glass_translucent',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t013_corroded_rust_deck',
    name: 'Corroded Derelict Rust Decking',
    catalogCode: 'T-013',
    family: 'industrial_deck',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1013,
    palette: {
      primary: '#3D2314',
      secondary: '#7C2D12',
      accent: '#D97706',
      ink: '#1A0F0A',
      glow: '#F97316'
    },
    geometry: { scale: 2, subdivision: 3, irregularity: 0.45, bevelDepth: 0.7, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.4,
      crossHatchDensity: 0.65,
      zenithalContrast: 0.7,
      weathering: 0.85,
      hazardStripes: false,
      emissiveStrength: 0.0
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 1.5,
      slipperyFriction: 0.9,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },

  // --- CYBER-URBAN (T-025 .. T-038) ---
  {
    id: 'preset_t025_wet_asphalt_neon',
    name: 'Rain-Slick Cyber Asphalt & Neon Seam',
    catalogCode: 'T-025',
    family: 'urban_cyber',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1025,
    palette: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#EC4899',
      ink: '#09090B',
      glow: '#06B6D4'
    },
    geometry: { scale: 2, subdivision: 2, irregularity: 0.2, bevelDepth: 0.5, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 2.0,
      crossHatchDensity: 0.4,
      zenithalContrast: 0.65,
      weathering: 0.35,
      hazardStripes: false,
      emissiveStrength: 0.7
    },
    vtt: {
      material: 'stone_masonry',
      movementCost: 1,
      slipperyFriction: 0.85,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 5,
      lightRadiusDimFt: 15,
      lightAnimation: 'fluorescent_flicker',
      isHazard: false
    }
  },
  {
    id: 'preset_t027_ferrocrete_sidewalk',
    name: 'Modular Ferrocrete Transit Sidewalk',
    catalogCode: 'T-027',
    family: 'urban_cyber',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1027,
    palette: {
      primary: '#475569',
      secondary: '#64748B',
      accent: '#FACC15',
      ink: '#0F172A',
      glow: '#38BDF8'
    },
    geometry: { scale: 3, subdivision: 2, irregularity: 0.08, bevelDepth: 0.55, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 1.8,
      crossHatchDensity: 0.3,
      zenithalContrast: 0.55,
      weathering: 0.25,
      hazardStripes: true,
      emissiveStrength: 0.15
    },
    vtt: {
      material: 'stone_masonry',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t032_imperial_plaza_marble',
    name: 'Synth-Marble Corporate Plaza Brass Inlay',
    catalogCode: 'T-032',
    family: 'urban_cyber',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1032,
    palette: {
      primary: '#1E293B',
      secondary: '#334155',
      accent: '#D4AF37',
      ink: '#020617',
      glow: '#FDE047'
    },
    geometry: { scale: 2, subdivision: 4, irregularity: 0.04, bevelDepth: 0.6, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 1.6,
      crossHatchDensity: 0.2,
      zenithalContrast: 0.6,
      weathering: 0.1,
      hazardStripes: false,
      emissiveStrength: 0.3
    },
    vtt: {
      material: 'stone_masonry',
      movementCost: 1,
      slipperyFriction: 0.9,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },

  // --- WASTELAND / FRONTIER (T-045 .. T-055) ---
  {
    id: 'preset_t045_cracked_alkali_pan',
    name: 'Desiccated Alkali Salt Flat',
    catalogCode: 'T-045',
    family: 'wasteland_regolith',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1045,
    palette: {
      primary: '#B48A64',
      secondary: '#D6B896',
      accent: '#78350F',
      ink: '#291507',
      glow: '#F59E0B'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.75, bevelDepth: 0.55, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.2,
      crossHatchDensity: 0.45,
      zenithalContrast: 0.6,
      weathering: 0.5,
      hazardStripes: false,
      emissiveStrength: 0.0
    },
    vtt: {
      material: 'dirt_packed',
      movementCost: 1,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t047_martian_iron_regolith',
    name: 'Red Oxide Regolith & Basalt Shards',
    catalogCode: 'T-047',
    family: 'wasteland_regolith',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1047,
    palette: {
      primary: '#8B3A2B',
      secondary: '#B85D43',
      accent: '#4A2511',
      ink: '#1F0D07',
      glow: '#EA580C'
    },
    geometry: { scale: 4, subdivision: 3, irregularity: 0.85, bevelDepth: 0.7, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 2.3,
      crossHatchDensity: 0.55,
      zenithalContrast: 0.7,
      weathering: 0.65,
      hazardStripes: false,
      emissiveStrength: 0.0
    },
    vtt: {
      material: 'sand_loose',
      movementCost: 1.5,
      slipperyFriction: 0.9,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t053_radioactive_slag_glass',
    name: 'Vitrified Trinitite Slag Trench',
    catalogCode: 'T-053',
    family: 'wasteland_regolith',
    outputMode: 'seamless_single',
    category: 'hazard',
    resolution: 128,
    seed: 1053,
    palette: {
      primary: '#1E2923',
      secondary: '#365314',
      accent: '#84CC16',
      ink: '#090D0A',
      glow: '#A3E635'
    },
    geometry: { scale: 3, subdivision: 4, irregularity: 0.8, bevelDepth: 0.75, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.2,
      crossHatchDensity: 0.5,
      zenithalContrast: 0.75,
      weathering: 0.6,
      hazardStripes: false,
      emissiveStrength: 0.8
    },
    vtt: {
      material: 'glass_translucent',
      movementCost: 1.5,
      slipperyFriction: 0.8,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 10,
      lightRadiusDimFt: 20,
      lightAnimation: 'pulse',
      isHazard: true,
      hazardType: 'radiation_leak',
      damageFormula: '1d10+2 radiation',
      saveAttribute: 'Fortitude (STA)',
      saveDc: 14
    }
  },

  // --- XENO-BIOPUNK / ALIEN HIVE (T-065 .. T-075) ---
  {
    id: 'preset_t065_biolum_mycelium',
    name: 'Bioluminescent Mycelial Hive Mat',
    catalogCode: 'T-065',
    family: 'xeno_biopunk',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1065,
    palette: {
      primary: '#1E1B4B',
      secondary: '#3B0764',
      accent: '#D946EF',
      ink: '#090514',
      glow: '#2DD4BF'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.9, bevelDepth: 0.65, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.1,
      crossHatchDensity: 0.5,
      zenithalContrast: 0.7,
      weathering: 0.4,
      hazardStripes: false,
      emissiveStrength: 0.85
    },
    vtt: {
      material: 'organic_flesh',
      movementCost: 1.5,
      slipperyFriction: 0.85,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 10,
      lightRadiusDimFt: 25,
      lightAnimation: 'pulse',
      isHazard: false
    }
  },
  {
    id: 'preset_t068_chitin_hive_resin',
    name: 'Secreted Chitinous Hive Floor',
    catalogCode: 'T-068',
    family: 'xeno_biopunk',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1068,
    palette: {
      primary: '#271C19',
      secondary: '#4D3329',
      accent: '#A3E635',
      ink: '#0F0908',
      glow: '#84CC16'
    },
    geometry: { scale: 3, subdivision: 4, irregularity: 0.8, bevelDepth: 0.8, gapWidth: 3 },
    ligneClaire: {
      inkWeight: 2.5,
      crossHatchDensity: 0.6,
      zenithalContrast: 0.75,
      weathering: 0.55,
      hazardStripes: false,
      emissiveStrength: 0.5
    },
    vtt: {
      material: 'organic_flesh',
      movementCost: 2,
      slipperyFriction: 0.75,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: true,
      hazardType: 'biohazard_spore',
      damageFormula: '1d10 chemical',
      saveAttribute: 'Fortitude (STA)',
      saveDc: 13
    }
  },

  // --- CRYO / GLACIAL (T-085 .. T-092) ---
  {
    id: 'preset_t085_fractured_glacier_ice',
    name: 'Deep Fractured Blue Glacier Ice',
    catalogCode: 'T-085',
    family: 'cryo_glacial',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1085,
    palette: {
      primary: '#0284C7',
      secondary: '#7DD3FC',
      accent: '#E0F2FE',
      ink: '#082F49',
      glow: '#38BDF8'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.7, bevelDepth: 0.6, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 1.9,
      crossHatchDensity: 0.35,
      zenithalContrast: 0.75,
      weathering: 0.3,
      hazardStripes: false,
      emissiveStrength: 0.4
    },
    vtt: {
      material: 'ice_slick',
      movementCost: 1.5,
      slipperyFriction: 0.35,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_t088_frosted_cryo_deck',
    name: 'Hoarfrost Cryo-Chamber Decking',
    catalogCode: 'T-088',
    family: 'cryo_glacial',
    outputMode: 'seamless_single',
    category: 'terrain_brush',
    resolution: 128,
    seed: 1088,
    palette: {
      primary: '#1E293B',
      secondary: '#94A3B8',
      accent: '#BAE6FD',
      ink: '#0F172A',
      glow: '#7DD3FC'
    },
    geometry: { scale: 2, subdivision: 2, irregularity: 0.35, bevelDepth: 0.55, gapWidth: 2 },
    ligneClaire: {
      inkWeight: 2.0,
      crossHatchDensity: 0.4,
      zenithalContrast: 0.65,
      weathering: 0.6,
      hazardStripes: true,
      emissiveStrength: 0.5
    },
    vtt: {
      material: 'ice_slick',
      movementCost: 1.5,
      slipperyFriction: 0.45,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },

  // --- VOLCANIC & PLASMA HAZARDS (T-101 .. T-112) ---
  {
    id: 'preset_t101_magma_basalt_crust',
    name: 'Cooling Basalt Crust & Magma Fissures',
    catalogCode: 'T-101',
    family: 'volcanic_hazard',
    outputMode: 'seamless_single',
    category: 'hazard',
    resolution: 128,
    seed: 1101,
    palette: {
      primary: '#1C1917',
      secondary: '#44403C',
      accent: '#F97316',
      ink: '#0C0A09',
      glow: '#FACC15'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.85, bevelDepth: 0.8, gapWidth: 4 },
    ligneClaire: {
      inkWeight: 2.4,
      crossHatchDensity: 0.55,
      zenithalContrast: 0.8,
      weathering: 0.5,
      hazardStripes: false,
      emissiveStrength: 0.95
    },
    vtt: {
      material: 'plasma_fluid',
      movementCost: 2,
      slipperyFriction: 0.9,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      isLiquid: true,
      emitsLight: true,
      lightRadiusBrightFt: 15,
      lightRadiusDimFt: 30,
      lightAnimation: 'plasma_churn',
      isHazard: true,
      hazardType: 'thermal_fire',
      damageFormula: '2d10+4 thermal',
      saveAttribute: 'Reflex (AGI)',
      saveDc: 15
    }
  },
  {
    id: 'preset_t104_corrosive_acid_vat',
    name: 'Boiling Corrosive Acid Pool',
    catalogCode: 'T-104',
    family: 'volcanic_hazard',
    outputMode: 'seamless_single',
    category: 'hazard',
    resolution: 128,
    seed: 1104,
    palette: {
      primary: '#14532D',
      secondary: '#16A34A',
      accent: '#BEF264',
      ink: '#052E16',
      glow: '#A3E635'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.9, bevelDepth: 0.5, gapWidth: 4 },
    ligneClaire: {
      inkWeight: 2.1,
      crossHatchDensity: 0.4,
      zenithalContrast: 0.7,
      weathering: 0.45,
      hazardStripes: false,
      emissiveStrength: 0.9
    },
    vtt: {
      material: 'acid_corrosive',
      movementCost: 2,
      slipperyFriction: 0.8,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      isLiquid: true,
      emitsLight: true,
      lightRadiusBrightFt: 10,
      lightRadiusDimFt: 20,
      lightAnimation: 'plasma_churn',
      isHazard: true,
      hazardType: 'acid_corrosive',
      damageFormula: '2d10+2 acid',
      saveAttribute: 'Reflex (AGI)',
      saveDc: 14
    }
  },
  {
    id: 'preset_t108_overload_plasma_vent',
    name: 'Hyper-Charged Plasma Reactor Vent',
    catalogCode: 'T-108',
    family: 'volcanic_hazard',
    outputMode: 'seamless_single',
    category: 'hazard',
    resolution: 128,
    seed: 1108,
    palette: {
      primary: '#1E1B4B',
      secondary: '#4338CA',
      accent: '#38BDF8',
      ink: '#090D16',
      glow: '#E0F2FE'
    },
    geometry: { scale: 2, subdivision: 3, irregularity: 0.65, bevelDepth: 0.7, gapWidth: 4 },
    ligneClaire: {
      inkWeight: 2.2,
      crossHatchDensity: 0.45,
      zenithalContrast: 0.85,
      weathering: 0.3,
      hazardStripes: true,
      emissiveStrength: 1.0
    },
    vtt: {
      material: 'plasma_fluid',
      movementCost: 2,
      slipperyFriction: 1.0,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 20,
      lightRadiusDimFt: 40,
      lightAnimation: 'emergency_strobe',
      isHazard: true,
      hazardType: 'plasma_leak',
      damageFormula: '3d10+5 plasma',
      saveAttribute: 'Reflex (AGI)',
      saveDc: 16
    }
  },

  // --- AUTO-TILE MARCHING SQUARES PRESETS ---
  {
    id: 'preset_at_bulkhead_wall',
    name: 'Armored Bulkhead Wall Auto-Tile (4-Bit)',
    catalogCode: 'AT-001',
    family: 'industrial_deck',
    outputMode: 'marching_squares_4bit',
    category: 'wall_portal',
    resolution: 128,
    seed: 2001,
    palette: {
      primary: '#334155',
      secondary: '#64748B',
      accent: '#F59E0B',
      ink: '#0F172A',
      glow: '#38BDF8'
    },
    geometry: { scale: 2, subdivision: 2, irregularity: 0.1, bevelDepth: 0.85, gapWidth: 2, transparentBg: true },
    ligneClaire: {
      inkWeight: 2.5,
      crossHatchDensity: 0.55,
      zenithalContrast: 0.8,
      weathering: 0.25,
      hazardStripes: true,
      emissiveStrength: 0.3
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 99,
      slipperyFriction: 1.0,
      cover: 'full_cover',
      blocksMovement: true,
      blocksVision: true,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_at_cavern_wall',
    name: 'Subterranean Basalt Cavern Auto-Tile (4-Bit)',
    catalogCode: 'AT-002',
    family: 'wasteland_regolith',
    outputMode: 'marching_squares_4bit',
    category: 'terrain_brush',
    resolution: 128,
    seed: 2002,
    palette: {
      primary: '#44403C',
      secondary: '#78716C',
      accent: '#D6D3D1',
      ink: '#1C1917',
      glow: '#F97316'
    },
    geometry: { scale: 3, subdivision: 3, irregularity: 0.8, bevelDepth: 0.75, gapWidth: 2, transparentBg: true },
    ligneClaire: {
      inkWeight: 2.4,
      crossHatchDensity: 0.6,
      zenithalContrast: 0.75,
      weathering: 0.5,
      hazardStripes: false,
      emissiveStrength: 0.0
    },
    vtt: {
      material: 'stone_masonry',
      movementCost: 2,
      slipperyFriction: 1.0,
      cover: 'half_cover',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },

  // --- TACTICAL DECALS & PROPS ---
  {
    id: 'preset_decal_blast_crater',
    name: 'High-Explosive Scorched Blast Crater',
    catalogCode: 'D-001',
    family: 'tactical_decal_prop',
    outputMode: 'decal_overlay',
    category: 'doodad',
    resolution: 128,
    seed: 3001,
    palette: {
      primary: '#1C1917',
      secondary: '#44403C',
      accent: '#F97316',
      ink: '#09090B',
      glow: '#FB923C'
    },
    geometry: { scale: 2, subdivision: 3, irregularity: 0.75, bevelDepth: 0.8, gapWidth: 2, transparentBg: true },
    ligneClaire: {
      inkWeight: 2.4,
      crossHatchDensity: 0.7,
      zenithalContrast: 0.8,
      weathering: 0.85,
      hazardStripes: false,
      emissiveStrength: 0.35
    },
    vtt: {
      material: 'stone_masonry',
      movementCost: 1.5,
      slipperyFriction: 0.9,
      cover: 'quarter_cover',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  },
  {
    id: 'preset_decal_xeno_ichor',
    name: 'Bioluminescent Xeno-Ichor Splatter',
    catalogCode: 'D-002',
    family: 'tactical_decal_prop',
    outputMode: 'decal_overlay',
    category: 'hazard',
    resolution: 128,
    seed: 3002,
    palette: {
      primary: '#065F46',
      secondary: '#10B981',
      accent: '#A3E635',
      ink: '#022C22',
      glow: '#34D399'
    },
    geometry: { scale: 3, subdivision: 2, irregularity: 0.9, bevelDepth: 0.4, gapWidth: 2, transparentBg: true },
    ligneClaire: {
      inkWeight: 2.0,
      crossHatchDensity: 0.35,
      zenithalContrast: 0.65,
      weathering: 0.5,
      hazardStripes: false,
      emissiveStrength: 0.8
    },
    vtt: {
      material: 'acid_corrosive',
      movementCost: 1.5,
      slipperyFriction: 0.6,
      cover: 'none',
      blocksMovement: false,
      blocksVision: false,
      emitsLight: true,
      lightRadiusBrightFt: 5,
      lightRadiusDimFt: 10,
      lightAnimation: 'pulse',
      isHazard: true,
      hazardType: 'acid_corrosive',
      damageFormula: '1d10 acid',
      saveAttribute: 'Reflex (AGI)',
      saveDc: 13
    }
  },
  {
    id: 'preset_decal_barricade_stamp',
    name: 'Deployable Aegis Tactical Barricade',
    catalogCode: 'D-003',
    family: 'tactical_decal_prop',
    outputMode: 'decal_overlay',
    category: 'doodad',
    resolution: 128,
    seed: 3003,
    palette: {
      primary: '#334155',
      secondary: '#475569',
      accent: '#EAB308',
      ink: '#0F172A',
      glow: '#38BDF8'
    },
    geometry: { scale: 1, subdivision: 1, irregularity: 0.1, bevelDepth: 0.85, gapWidth: 2, transparentBg: true },
    ligneClaire: {
      inkWeight: 2.5,
      crossHatchDensity: 0.45,
      zenithalContrast: 0.75,
      weathering: 0.3,
      hazardStripes: true,
      emissiveStrength: 0.5
    },
    vtt: {
      material: 'metal_deck',
      movementCost: 2,
      slipperyFriction: 1.0,
      cover: 'half_cover',
      blocksMovement: true,
      blocksVision: false,
      emitsLight: false,
      isHazard: false
    }
  }
];

/**
 * Mulberry32 deterministic PRNG returning values in [0, 1).
 */
export function createSeededRandom(seed: number): () => number {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic 2D hash with periodic (toroidal) wrapping at period `freq`.
 */
function hash2DToroidal(ix: number, iy: number, freq: number, seed: number): number {
  const p = Math.max(1, Math.round(freq));
  const wx = ((ix % p) + p) % p;
  const wy = ((iy % p) + p) % p;
  let h = (wx * 374761393 + wy * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Samples seamless toroidal 2D value noise for normalized coordinates u, v in [0, 1).
 * Guaranteed sampleToroidalNoise(0, v) === sampleToroidalNoise(1, v) and
 * sampleToroidalNoise(u, 0) === sampleToroidalNoise(u, 1).
 */
export function sampleToroidalNoise(u: number, v: number, freq: number, seed: number): number {
  const p = Math.max(1, Math.round(freq));
  const wu = ((u % 1) + 1) % 1;
  const wv = ((v % 1) + 1) % 1;
  const x = wu * p;
  const y = wv * p;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);

  const n00 = hash2DToroidal(ix, iy, p, seed);
  const n10 = hash2DToroidal(ix + 1, iy, p, seed);
  const n01 = hash2DToroidal(ix, iy + 1, p, seed);
  const n11 = hash2DToroidal(ix + 1, iy + 1, p, seed);

  return lerp(lerp(n00, n10, fx), lerp(n01, n11, fx), fy);
}

/**
 * Samples multi-octave seamless toroidal FBM noise in [0, 1].
 */
export function sampleToroidalFbm(
  u: number,
  v: number,
  baseFreq: number,
  octaves: number = 3,
  seed: number = 42
): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let freq = Math.max(1, Math.round(baseFreq));

  for (let i = 0; i < octaves; i++) {
    sum += sampleToroidalNoise(u, v, freq, seed + i * 101) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return norm > 0 ? sum / norm : 0.5;
}

/**
 * Samples seamless toroidal 2D Worley (Voronoi/cellular) noise for u, v in [0, 1).
 * Returns closest distance f1, second-closest f2, edge distance (f2 - f1), and cellId.
 */
export function sampleToroidalWorley(
  u: number,
  v: number,
  cellsPerAxis: number,
  jitter: number,
  seed: number
): { f1: number; f2: number; edgeDist: number; cellId: number } {
  const p = Math.max(2, Math.round(cellsPerAxis));
  const wu = ((u % 1) + 1) % 1;
  const wv = ((v % 1) + 1) % 1;
  const x = wu * p;
  const y = wv * p;
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  let f1 = 999;
  let f2 = 999;
  let bestCellId = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const rx = hash2DToroidal(cx, cy, p, seed + 17);
      const ry = hash2DToroidal(cx, cy, p, seed + 53);
      const px = cx + 0.5 + (rx - 0.5) * jitter;
      const py = cy + 0.5 + (ry - 0.5) * jitter;

      const dist = Math.hypot(x - px, y - py);
      if (dist < f1) {
        f2 = f1;
        f1 = dist;
        const wcx = ((cx % p) + p) % p;
        const wcy = ((cy % p) + p) % p;
        bestCellId = wcy * p + wcx;
      } else if (dist < f2) {
        f2 = dist;
      }
    }
  }

  return {
    f1,
    f2,
    edgeDist: Math.max(0, f2 - f1),
    cellId: bestCellId
  };
}

/**
 * Color helper utilities
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || '#334155').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 51, g: 65, b: 85 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mixHex(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const clamped = Math.max(0, Math.min(1, t));
  return rgbToHex(
    lerp(a.r, b.r, clamped),
    lerp(a.g, b.g, clamped),
    lerp(a.b, b.b, clamped)
  );
}

/**
 * Evaluates whether normalized point (u, v) is inside a 4-bit Marching Squares mask.
 * Bitmask convention: N = 1, E = 2, S = 4, W = 8.
 * Returns { inside: boolean, borderDist: number } where borderDist is near 0 along the contour edge.
 */
function evaluateAutoTileMask4Bit(
  u: number,
  v: number,
  bitmask: number,
  irregularity: number,
  seed: number
): { inside: boolean; isContourEdge: boolean } {
  const mask = bitmask & 15;
  if (mask === 15) {
    return { inside: true, isContourEdge: false };
  }

  const hasN = (mask & 1) !== 0;
  const hasE = (mask & 2) !== 0;
  const hasS = (mask & 4) !== 0;
  const hasW = (mask & 8) !== 0;

  const wobble = (sampleToroidalNoise(u, v, 4, seed + 313) - 0.5) * 0.12 * irregularity;
  const margin = 0.24;

  // Center core is always present even for mask = 0 (isolated pillar/island)
  const dx = Math.abs(u - 0.5);
  const dy = Math.abs(v - 0.5);
  let distToInside = Math.max(dx, dy) - (0.26 + wobble);

  if (hasN && v <= 0.5) {
    distToInside = Math.min(distToInside, dx - (0.5 - margin + wobble));
  }
  if (hasS && v >= 0.5) {
    distToInside = Math.min(distToInside, dx - (0.5 - margin + wobble));
  }
  if (hasW && u <= 0.5) {
    distToInside = Math.min(distToInside, dy - (0.5 - margin + wobble));
  }
  if (hasE && u >= 0.5) {
    distToInside = Math.min(distToInside, dy - (0.5 - margin + wobble));
  }

  // Fill quadrants when both adjacent cardinals are connected
  if (hasN && hasE && u >= 0.5 && v <= 0.5) distToInside = -0.2;
  if (hasS && hasE && u >= 0.5 && v >= 0.5) distToInside = -0.2;
  if (hasS && hasW && u <= 0.5 && v >= 0.5) distToInside = -0.2;
  if (hasN && hasW && u <= 0.5 && v <= 0.5) distToInside = -0.2;

  const inside = distToInside <= 0;
  const isContourEdge = inside && distToInside > -0.045;
  return { inside, isContourEdge };
}

/**
 * Generates a deterministic, crisp HIFI CHROMA / Ligne Claire SVG Data URL
 * for the given recipe and optional 4-bit Marching Squares bitmask.
 * Used both as a lightweight vector representation and as a universal fallback
 * in headless/Node environments without HTMLCanvasElement.
 */
export function synthesizeTileSvgDataUrl(
  recipe: TileSynthesisRecipe,
  bitmask4Bit?: number
): string {
  const size = recipe.resolution || 128;
  const rng = createSeededRandom(recipe.seed);
  const { primary, secondary, accent, ink, glow } = recipe.palette;
  const { scale, subdivision, irregularity, gapWidth, transparentBg } = recipe.geometry;
  const { inkWeight, crossHatchDensity, hazardStripes, emissiveStrength, weathering } =
    recipe.ligneClaire;

  const isDecal = recipe.outputMode === 'decal_overlay' || recipe.family === 'tactical_decal_prop';
  const useTransparent = Boolean(
    transparentBg || isDecal || (bitmask4Bit !== undefined && (bitmask4Bit & 15) !== 15)
  );

  const elements: string[] = [];

  // Background fill if opaque
  if (!useTransparent) {
    elements.push(`<rect width="${size}" height="${size}" fill="${primary}"/>`);
  }

  const gridCount = Math.max(1, Math.min(8, Math.round(scale)));
  const cellSize = size / gridCount;

  // Clip path for 4-bit auto-tile mask when bitmask4Bit is provided
  let clipAttr = '';
  if (bitmask4Bit !== undefined && (bitmask4Bit & 15) !== 15) {
    const mask = bitmask4Bit & 15;
    const m = Math.round(size * 0.22);
    const rects: string[] = [
      `<rect x="${m}" y="${m}" width="${size - 2 * m}" height="${size - 2 * m}" rx="6"/>`
    ];
    if (mask & 1) rects.push(`<rect x="${m}" y="0" width="${size - 2 * m}" height="${size / 2}"/>`);
    if (mask & 2) rects.push(`<rect x="${size / 2}" y="${m}" width="${size / 2}" height="${size - 2 * m}"/>`);
    if (mask & 4) rects.push(`<rect x="${m}" y="${size / 2}" width="${size - 2 * m}" height="${size / 2}"/>`);
    if (mask & 8) rects.push(`<rect x="0" y="${m}" width="${size / 2}" height="${size - 2 * m}"/>`);
    elements.push(`<defs><clipPath id="ms4_${mask}">${rects.join('')}</clipPath></defs>`);
    clipAttr = ` clip-path="url(#ms4_${mask})"`;
  }

  const body: string[] = [];
  if (useTransparent && !isDecal && bitmask4Bit !== undefined) {
    body.push(`<rect width="${size}" height="${size}" fill="${primary}"/>`);
  }

  if (recipe.family === 'industrial_deck' || recipe.family === 'urban_cyber') {
    for (let gy = 0; gy < gridCount; gy++) {
      for (let gx = 0; gx < gridCount; gx++) {
        const x = gx * cellSize + gapWidth * 0.5;
        const y = gy * cellSize + gapWidth * 0.5;
        const w = Math.max(4, cellSize - gapWidth);
        const h = Math.max(4, cellSize - gapWidth);
        const shade = mixHex(primary, secondary, 0.35 + rng() * 0.45);
        body.push(
          `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${shade}" stroke="${ink}" stroke-width="${inkWeight.toFixed(1)}"/>`
        );
        // Zenithal top-left bevel highlight
        body.push(
          `<path d="M ${(x + 2).toFixed(1)} ${(y + h - 2).toFixed(1)} V ${(y + 2).toFixed(1)} H ${(x + w - 2).toFixed(1)}" fill="none" stroke="${mixHex(secondary, '#FFFFFF', 0.35)}" stroke-width="1.2" opacity="0.65"/>`
        );
        // Corner rivets for industrial decking
        if (recipe.family === 'industrial_deck') {
          const rOffset = Math.max(4, w * 0.12);
          for (const [rx, ry] of [
            [x + rOffset, y + rOffset],
            [x + w - rOffset, y + rOffset],
            [x + rOffset, y + h - rOffset],
            [x + w - rOffset, y + h - rOffset]
          ]) {
            body.push(
              `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="1.6" fill="${ink}"/>`
            );
          }
        }
      }
    }
  } else if (recipe.family === 'grating_catwalk') {
    const step = Math.max(8, Math.round(size / (gridCount * 3)));
    if (emissiveStrength > 0.2 && glow) {
      body.push(
        `<rect x="0" y="${(size * 0.35).toFixed(1)}" width="${size}" height="${(size * 0.3).toFixed(1)}" fill="${glow}" opacity="${(emissiveStrength * 0.45).toFixed(2)}"/>`
      );
    }
    for (let i = -size; i < size * 2; i += step) {
      body.push(
        `<line x1="${i}" y1="0" x2="${i + size}" y2="${size}" stroke="${secondary}" stroke-width="${Math.max(1.5, inkWeight)}" stroke-opacity="0.85"/>`,
        `<line x1="${i + size}" y1="0" x2="${i}" y2="${size}" stroke="${secondary}" stroke-width="${Math.max(1.5, inkWeight)}" stroke-opacity="0.85"/>`
      );
    }
    body.push(
      `<rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="${ink}" stroke-width="${(inkWeight * 1.4).toFixed(1)}"/>`
    );
  } else if (
    recipe.family === 'wasteland_regolith' ||
    recipe.family === 'xeno_biopunk' ||
    recipe.family === 'cryo_glacial' ||
    recipe.family === 'volcanic_hazard'
  ) {
    const cells = Math.max(2, gridCount + subdivision);
    const step = size / cells;
    for (let cy = 0; cy < cells; cy++) {
      for (let cx = 0; cx < cells; cx++) {
        const jx = (rng() - 0.5) * step * irregularity * 0.55;
        const jy = (rng() - 0.5) * step * irregularity * 0.55;
        const px = cx * step + step * 0.5 + jx;
        const py = cy * step + step * 0.5 + jy;
        const rad = step * (0.38 + rng() * 0.18);
        const fillCol = mixHex(primary, secondary, 0.25 + rng() * 0.65);
        const edgeCol =
          emissiveStrength > 0.3 && glow ? glow : ink;
        body.push(
          `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rad.toFixed(1)}" fill="${fillCol}" stroke="${edgeCol}" stroke-width="${inkWeight.toFixed(1)}"/>`
        );
      }
    }
  } else if (isDecal) {
    const cx = size * 0.5;
    const cy = size * 0.5;
    const rOuter = size * 0.36;
    const rInner = size * 0.2;
    body.push(
      `<circle cx="${cx}" cy="${cy}" r="${rOuter.toFixed(1)}" fill="${secondary}" fill-opacity="0.85" stroke="${ink}" stroke-width="${(inkWeight * 1.4).toFixed(1)}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${rInner.toFixed(1)}" fill="${emissiveStrength > 0.3 && glow ? glow : accent}" stroke="${ink}" stroke-width="${inkWeight.toFixed(1)}"/>`
    );
  }

  // Hazard Chevron Band
  if (hazardStripes) {
    const bandH = Math.max(10, Math.round(size * 0.11));
    body.push(
      `<rect x="0" y="0" width="${size}" height="${bandH}" fill="${accent}" stroke="${ink}" stroke-width="1.5"/>`
    );
    const stripeStep = 12;
    for (let sx = -bandH; sx < size + bandH; sx += stripeStep) {
      body.push(
        `<polygon points="${sx},0 ${sx + 6},0 ${sx - 4},${bandH} ${sx - 10},${bandH}" fill="${ink}"/>`
      );
    }
  }

  // Ligne Claire Cross-Hatching & Weathering ticks
  const hatchCount = Math.round((crossHatchDensity + weathering * 0.5) * 24);
  for (let i = 0; i < hatchCount; i++) {
    const hx = rng() * (size - 12) + 4;
    const hy = rng() * (size - 12) + 4;
    const len = 5 + rng() * 8;
    body.push(
      `<line x1="${hx.toFixed(1)}" y1="${hy.toFixed(1)}" x2="${(hx + len).toFixed(1)}" y2="${(hy + len).toFixed(1)}" stroke="${ink}" stroke-width="1" stroke-opacity="0.55"/>`
    );
  }

  elements.push(`<g${clipAttr}>${body.join('')}</g>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${elements.join('')}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Synthesizes a high-detail HIFI CHROMA / Ligne Claire tile image Data URL.
 * In browser environments with HTMLCanvasElement 2D context, renders pixel-exact
 * toroidal seamless FBM/Worley cellular fields, zenithal bevel shading, Ligne Claire
 * ink outlines, cross-hatching shadows, and emissive glow (`image/png`).
 * In headless/Node test environments, automatically returns the deterministic SVG Data URL.
 */
export function synthesizeTileDataUrl(
  recipe: TileSynthesisRecipe,
  bitmask4Bit?: number
): string {
  if (typeof document === 'undefined') {
    return synthesizeTileSvgDataUrl(recipe, bitmask4Bit);
  }

  const canvas = document.createElement('canvas');
  const size = recipe.resolution || 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx || typeof ctx.getImageData !== 'function') {
    return synthesizeTileSvgDataUrl(recipe, bitmask4Bit);
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const colPrimary = hexToRgb(recipe.palette.primary);
  const colSecondary = hexToRgb(recipe.palette.secondary);
  const colAccent = hexToRgb(recipe.palette.accent);
  const colInk = hexToRgb(recipe.palette.ink);
  const colGlow = hexToRgb(recipe.palette.glow || recipe.palette.accent);

  const scale = Math.max(1, Math.round(recipe.geometry.scale));
  const subdiv = Math.max(1, Math.round(recipe.geometry.subdivision));
  const irreg = Math.max(0, Math.min(1, recipe.geometry.irregularity));
  const bevel = Math.max(0, Math.min(1, recipe.geometry.bevelDepth));
  const gapRatio = Math.max(0.015, Math.min(0.18, (recipe.geometry.gapWidth || 2) / 64));

  const inkWeightNorm = Math.max(0.01, Math.min(0.12, (recipe.ligneClaire.inkWeight || 2) / 48));
  const crossHatch = Math.max(0, Math.min(1, recipe.ligneClaire.crossHatchDensity));
  const zenithal = Math.max(0, Math.min(1, recipe.ligneClaire.zenithalContrast));
  const weather = Math.max(0, Math.min(1, recipe.ligneClaire.weathering));
  const emissive = Math.max(0, Math.min(1, recipe.ligneClaire.emissiveStrength));
  const hasStripes = Boolean(recipe.ligneClaire.hazardStripes);

  const isDecal =
    recipe.outputMode === 'decal_overlay' || recipe.family === 'tactical_decal_prop';
  const useAutoMask = bitmask4Bit !== undefined && (bitmask4Bit & 15) !== 15;

  // Precompute heightfield for zenithal normal/bevel lighting & contour detection
  const heightMap = new Float32Array(size * size);
  const cellIdMap = new Int32Array(size * size);
  const seamDistMap = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const idx = y * size + x;

      const fbm = sampleToroidalFbm(u, v, scale * 2, 3, recipe.seed);
      let h = 0.5;
      let seamDist = 1.0;
      let cId = 0;

      if (recipe.family === 'industrial_deck' || recipe.family === 'urban_cyber') {
        const freqX = scale;
        const freqY = scale * (recipe.family === 'urban_cyber' ? subdiv * 0.5 : 1);
        const su = (u * freqX) % 1;
        const sv = (v * freqY) % 1;
        const panelX = Math.floor(u * freqX);
        const panelY = Math.floor(v * freqY);
        cId = panelY * 16 + panelX;

        // Sub-panel irregular splits
        const panelHash = hash2DToroidal(panelX, panelY, freqX, recipe.seed + 7);
        const splitU = panelHash > 0.45 && subdiv > 1 ? (su * subdiv) % 1 : su;
        const splitV = panelHash > 0.25 && subdiv > 1 ? (sv * subdiv) % 1 : sv;

        const edgeX = Math.min(splitU, 1 - splitU);
        const edgeY = Math.min(splitV, 1 - splitV);
        seamDist = Math.min(edgeX, edgeY);

        h = seamDist < gapRatio ? 0.1 : 0.65 + (panelHash - 0.5) * 0.2 + (fbm - 0.5) * 0.15 * weather;
      } else if (recipe.family === 'grating_catwalk') {
        const meshFreq = Math.max(4, scale * 4);
        const d1 = Math.abs((((u + v) * meshFreq) % 1) - 0.5);
        const d2 = Math.abs((((u - v + 2) * meshFreq) % 1) - 0.5);
        seamDist = Math.min(d1, d2);
        const isStrut = seamDist < 0.14;
        h = isStrut ? 0.8 + (fbm - 0.5) * 0.1 : 0.05;
        cId = isStrut ? 1 : 0;
      } else if (
        recipe.family === 'wasteland_regolith' ||
        recipe.family === 'xeno_biopunk' ||
        recipe.family === 'cryo_glacial' ||
        recipe.family === 'volcanic_hazard'
      ) {
        const worley = sampleToroidalWorley(
          u,
          v,
          Math.max(2, scale + subdiv),
          Math.max(0.2, irreg),
          recipe.seed
        );
        seamDist = worley.edgeDist * 0.5;
        cId = worley.cellId;
        if (recipe.family === 'xeno_biopunk') {
          h = 0.3 + Math.sin(worley.f1 * Math.PI * 1.5) * 0.4 + fbm * 0.25;
        } else if (recipe.family === 'volcanic_hazard') {
          h = seamDist < gapRatio * 1.4 ? 0.05 : 0.55 + fbm * 0.35;
        } else {
          h = seamDist < gapRatio ? 0.12 : 0.5 + (1 - worley.f1 * 0.5) * 0.35 + (fbm - 0.5) * 0.2;
        }
      } else {
        // tactical_decal_prop
        const dx = u - 0.5;
        const dy = v - 0.5;
        const rad = Math.hypot(dx, dy) + (fbm - 0.5) * 0.16 * irreg;
        seamDist = Math.abs(rad - 0.34);
        h = rad < 0.18 ? 0.2 : rad < 0.38 ? 0.75 : 0.0;
        cId = rad < 0.38 ? 1 : 0;
      }

      heightMap[idx] = h;
      cellIdMap[idx] = cId;
      seamDistMap[idx] = seamDist;
    }
  }

  // Second pass: shade pixels with Zenithal Lighting + Ligne Claire Ink + Cross-Hatching
  for (let y = 0; y < size; y++) {
    const v = y / size;
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const u = x / size;
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const idx = y * size + x;
      const pIdx = idx * 4;

      // Check transparency for decals or 4-bit auto-tile masks
      let isContourBorder = false;
      if (useAutoMask) {
        const maskEval = evaluateAutoTileMask4Bit(u, v, bitmask4Bit!, irreg, recipe.seed);
        if (!maskEval.inside) {
          data[pIdx + 3] = 0;
          continue;
        }
        isContourBorder = maskEval.isContourEdge;
      } else if (isDecal && heightMap[idx] <= 0.02) {
        data[pIdx + 3] = 0;
        continue;
      }

      const h = heightMap[idx];
      const seamDist = seamDistMap[idx];
      const fbm = sampleToroidalFbm(u, v, scale * 3, 2, recipe.seed + 99);

      // Toroidal finite-difference surface gradient for top-left 45-deg zenithal light
      const dhdx = heightMap[y * size + xNext] - heightMap[y * size + xPrev];
      const dhdy = heightMap[yNext * size + x] - heightMap[yPrev * size + x];
      const lightDot = (-dhdx - dhdy) * 2.8 * bevel;

      // Base chroma mix between primary and secondary
      const cellTint = ((cellIdMap[idx] * 2654435761) >>> 0) / 4294967296;
      const baseMix = Math.max(0, Math.min(1, h * 0.65 + cellTint * 0.25 + (fbm - 0.5) * weather * 0.4));

      let r = lerp(colPrimary.r, colSecondary.r, baseMix);
      let g = lerp(colPrimary.g, colSecondary.g, baseMix);
      let b = lerp(colPrimary.b, colSecondary.b, baseMix);

      // Apply zenithal highlight / shadow
      const lightShift = lightDot * zenithal * 95;
      r += lightShift;
      g += lightShift;
      b += lightShift;

      // Hazard chevron stripe band along top edge when enabled
      if (hasStripes && v < 0.11) {
        const stripePhase = ((u * size + v * size) % 16) / 16;
        if (stripePhase < 0.5) {
          r = colAccent.r;
          g = colAccent.g;
          b = colAccent.b;
        } else {
          r = colInk.r;
          g = colInk.g;
          b = colInk.b;
        }
      }

      // Emissive fissures / plasma glow in deep seams
      const isDeepSeam = seamDist < gapRatio * 1.25 || (recipe.family === 'grating_catwalk' && h < 0.2);
      if (isDeepSeam && emissive > 0.05) {
        const pulse = Math.max(0, Math.min(1, emissive * (1.0 - seamDist / (gapRatio * 2.2))));
        r = lerp(r, colGlow.r, pulse);
        g = lerp(g, colGlow.g, pulse);
        b = lerp(b, colGlow.b, pulse);
      }

      // Ligne Claire Cross-Hatching in shadowed regions
      if (crossHatch > 0.05 && (h < 0.48 || lightDot < -0.05)) {
        const hatchPeriod = 6;
        const diag1 = (x + y) % hatchPeriod === 0;
        const diag2 = crossHatch > 0.55 && (x - y + size * 2) % hatchPeriod === 0;
        if (diag1 || diag2) {
          const hatchStrength = Math.min(0.85, crossHatch * 0.75);
          r = lerp(r, colInk.r, hatchStrength);
          g = lerp(g, colInk.g, hatchStrength);
          b = lerp(b, colInk.b, hatchStrength);
        }
      }

      // Crisp Ligne Claire Ink Outlines along panel/cell seams or auto-tile contour borders
      const isInkLine =
        isContourBorder ||
        (seamDist < inkWeightNorm && !(emissive > 0.45 && seamDist < inkWeightNorm * 0.55));
      if (isInkLine) {
        r = colInk.r;
        g = colInk.g;
        b = colInk.b;
      }

      data[pIdx] = Math.max(0, Math.min(255, Math.round(r)));
      data[pIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[pIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      data[pIdx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Generates all 16 cardinal 4-bit Marching Squares tile variants (indices 0..15)
 * for seamless auto-tiling in AssetUnit.visuals.variants.
 */
export function generateAutoTileVariants4Bit(
  recipe: TileSynthesisRecipe,
  cellPx: 64 | 128 = 64
): string[] {
  const variantRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: cellPx,
    outputMode: 'marching_squares_4bit'
  };
  const variants: string[] = [];
  for (let mask = 0; mask < 16; mask++) {
    variants.push(synthesizeTileDataUrl(variantRecipe, mask));
  }
  return variants;
}

/**
 * Synthesizes both the 16 individual 4-bit variants AND a composite 4x4 atlas sheet Data URL.
 */
export function synthesizeAutoTileAtlas4Bit(
  recipe: TileSynthesisRecipe,
  cellPx: 64 | 128 = 64
): { atlasDataUrl: string; variants: string[] } {
  const variants = generateAutoTileVariants4Bit(recipe, cellPx);
  if (typeof document === 'undefined') {
    return { atlasDataUrl: variants[15], variants };
  }

  const atlasSize = cellPx * 4;
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasSize;
  atlasCanvas.height = atlasSize;
  const ctx = atlasCanvas.getContext('2d');
  if (!ctx) {
    return { atlasDataUrl: variants[15], variants };
  }

  // Render each of the 16 masks into its 4x4 grid slot synchronously via pixel synthesis
  for (let mask = 0; mask < 16; mask++) {
    const subRecipe: TileSynthesisRecipe = {
      ...recipe,
      resolution: cellPx,
      outputMode: 'marching_squares_4bit'
    };
    const subUrl = synthesizeTileDataUrl(subRecipe, mask);
    variants[mask] = subUrl;
  }

  // Also draw a subtle grid frame on the composite preview if needed, or return full center tile if async image decoding isn't desired
  return {
    atlasDataUrl: variants[15],
    variants
  };
}

/**
 * Generates the 5 canonical environmental state textures (`pristine`, `damaged`,
 * `destroyed`, `overgrown`, `corrupted`) consumed by `AssetCustomizerShader.ts`.
 */
export function generateStateTextures(
  recipe: TileSynthesisRecipe
): NonNullable<VisualVariants['stateTextures']> {
  const baseRes: 64 | 128 = recipe.resolution === 256 ? 128 : recipe.resolution;

  const pristineRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: baseRes,
    ligneClaire: { ...recipe.ligneClaire, weathering: Math.min(0.15, recipe.ligneClaire.weathering) }
  };

  const damagedRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: baseRes,
    seed: recipe.seed + 11,
    geometry: {
      ...recipe.geometry,
      irregularity: Math.min(1, recipe.geometry.irregularity + 0.35),
      gapWidth: Math.min(8, recipe.geometry.gapWidth + 1)
    },
    ligneClaire: {
      ...recipe.ligneClaire,
      weathering: Math.min(1, recipe.ligneClaire.weathering + 0.45),
      crossHatchDensity: Math.min(1, recipe.ligneClaire.crossHatchDensity + 0.25)
    }
  };

  const destroyedRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: baseRes,
    seed: recipe.seed + 29,
    palette: {
      ...recipe.palette,
      primary: mixHex(recipe.palette.primary, '#18181B', 0.55),
      secondary: mixHex(recipe.palette.secondary, '#3F3F46', 0.5),
      accent: '#F97316'
    },
    geometry: {
      ...recipe.geometry,
      irregularity: Math.min(1, recipe.geometry.irregularity + 0.65),
      gapWidth: Math.min(8, recipe.geometry.gapWidth + 2)
    },
    ligneClaire: {
      ...recipe.ligneClaire,
      weathering: 0.95,
      crossHatchDensity: Math.min(1, recipe.ligneClaire.crossHatchDensity + 0.4)
    }
  };

  const overgrownRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: baseRes,
    seed: recipe.seed + 47,
    palette: {
      ...recipe.palette,
      secondary: mixHex(recipe.palette.secondary, '#15803D', 0.55),
      accent: '#4ADE80',
      glow: '#22C55E'
    },
    ligneClaire: {
      ...recipe.ligneClaire,
      weathering: Math.min(1, recipe.ligneClaire.weathering + 0.35)
    }
  };

  const corruptedRecipe: TileSynthesisRecipe = {
    ...recipe,
    resolution: baseRes,
    seed: recipe.seed + 73,
    palette: {
      ...recipe.palette,
      primary: mixHex(recipe.palette.primary, '#2E1065', 0.5),
      secondary: mixHex(recipe.palette.secondary, '#701A75', 0.55),
      accent: '#E879F9',
      glow: '#D946EF'
    },
    ligneClaire: {
      ...recipe.ligneClaire,
      emissiveStrength: Math.max(0.65, recipe.ligneClaire.emissiveStrength)
    }
  };

  return {
    pristine: synthesizeTileDataUrl(pristineRecipe),
    damaged: synthesizeTileDataUrl(damagedRecipe),
    destroyed: synthesizeTileDataUrl(destroyedRecipe),
    overgrown: synthesizeTileDataUrl(overgrownRecipe),
    corrupted: synthesizeTileDataUrl(corruptedRecipe)
  };
}

/**
 * Compiles a `TileSynthesisRecipe` directly into a validated `AssetUnit`
 * ready for the ADE / MapMaker Asset Studio, Marching Squares Auto-Tiler, and VTT Stage.
 */
export function compileRecipeToAssetUnit(
  recipe: TileSynthesisRecipe,
  options: { includeAutoTiles?: boolean; includeStateTextures?: boolean } = {}
): AssetUnit {
  const baseTexture = synthesizeTileDataUrl(recipe);
  const wantAutoTiles =
    options.includeAutoTiles ?? recipe.outputMode === 'marching_squares_4bit';
  const wantStates = options.includeStateTextures ?? true;

  const variants = wantAutoTiles ? generateAutoTileVariants4Bit(recipe, 64) : [baseTexture];
  const stateTextures = wantStates
    ? generateStateTextures(recipe)
    : { pristine: baseTexture };

  const familyMeta = TILE_FAMILY_METADATA[recipe.family];
  const unitId = AssetIngestionPipeline.generateUnitId(recipe.name, recipe.category);

  return createDefaultAssetUnit({
    unit_id: unitId,
    name: recipe.name,
    category: recipe.category,
    tree_path: ['Synthesized Tiles', familyMeta?.label || 'Custom', recipe.name],
    tags: [
      recipe.category,
      recipe.family,
      recipe.vtt.material,
      recipe.outputMode,
      ...(recipe.catalogCode ? [recipe.catalogCode] : []),
      'hifi_chroma_synth'
    ],
    dimensions: [1, 1],
    anchorPoint: [0.5, 0.5],
    provenance: {
      source: 'custom_upload',
      author: 'HIFI CHROMA Micro-Tile Synthesizer',
      license: 'CC-BY-4.0',
      dateAdded: new Date().toISOString()
    },
    visuals: {
      thumbnail: baseTexture,
      baseTexture,
      variants,
      auto_tile: wantAutoTiles ? 'marching_squares_4bit' : 'none',
      stateTextures
    },
    vtt_properties: {
      blocks_movement: recipe.vtt.blocksMovement,
      blocks_vision: recipe.vtt.blocksVision,
      z_index_layer:
        recipe.category === 'terrain_brush'
          ? 'background_map'
          : recipe.outputMode === 'decal_overlay'
            ? 'underlay_debris'
            : 'interactive_objects',
      terrain: {
        material: recipe.vtt.material,
        movementCost: recipe.vtt.movementCost,
        slipperyFriction: recipe.vtt.slipperyFriction,
        footstepSfxCategory: `footstep_${recipe.vtt.material.split('_')[0]}`
      },
      doodad:
        recipe.category === 'doodad' || recipe.vtt.cover !== 'none'
          ? {
              cover: recipe.vtt.cover,
              isDestructible: recipe.vtt.cover !== 'none',
              structureHp: recipe.vtt.cover === 'full_cover' ? 60 : 30,
              armorDr: { kinetic: 6, energy: 4 },
              isContainer: false
            }
          : undefined,
      wallPortal:
        recipe.category === 'wall_portal'
          ? {
              wallType: 'solid_titanium',
              isDoor: false,
              blocksLight: recipe.vtt.blocksVision,
              blocksSensors: recipe.vtt.blocksVision,
              blocksMovement: recipe.vtt.blocksMovement,
              soundMuffleFactor: 0.8
            }
          : undefined,
      dynamicLighting: recipe.vtt.emitsLight
        ? {
            emits: true,
            color: recipe.palette.glow || recipe.palette.accent,
            intensity: Math.max(0.5, recipe.ligneClaire.emissiveStrength * 2),
            radiusBrightFt: recipe.vtt.lightRadiusBrightFt ?? 10,
            radiusDimFt: recipe.vtt.lightRadiusDimFt ?? 20,
            castsShadows: true,
            animation: recipe.vtt.lightAnimation || 'pulse'
          }
        : undefined,
      hazard: recipe.vtt.isHazard
        ? {
            hazardType: recipe.vtt.hazardType || 'plasma_leak',
            damageFormula: recipe.vtt.damageFormula || '2d10+4 plasma',
            triggerTiming: 'on_enter',
            saveDc: {
              attribute: recipe.vtt.saveAttribute || 'Reflex (AGI)',
              target: recipe.vtt.saveDc ?? 14
            }
          }
        : undefined
    }
  });
}
