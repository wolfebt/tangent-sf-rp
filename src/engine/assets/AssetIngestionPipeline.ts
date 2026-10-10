/**
 * @file AssetIngestionPipeline.ts
 * @description Ingestion pipeline for importing, validating, and formatting external map assets
 * into canonical AssetUnits.
 */

import { 
  type AssetUnit, 
  type AssetCategory, 
  createDefaultAssetUnit, 
  validateAssetUnit 
} from '../../schemas/assetUnitSchema.ts';
import type { SlicedFrame } from './SpriteSheetSlicer.ts';

export interface RawAssetInput {
  name: string;
  category: AssetCategory;
  treePath?: string[];
  tags?: string[];
  dimensions?: [number, number];
  imageDataUrl?: string;
  thumbnailUrl?: string;
  autoTile?: 'none' | 'marching_squares_4bit' | 'marching_squares_8bit' | 'wang_tiles';
  vttProperties?: Partial<AssetUnit['vtt_properties']>;
  provenance?: {
    source?: 'preset' | 'custom_upload' | 'dlc_pack' | 'omnicortex_dbm';
    author?: string;
    packId?: string;
    license?: string;
  };
}

export interface IngestionArchetype {
  id: string;
  label: string;
  description: string;
  category: AssetCategory;
  defaultTags: string[];
  vttProperties: Partial<AssetUnit['vtt_properties']>;
}

export const INGESTION_ARCHETYPES: IngestionArchetype[] = [
  {
    id: 'generic_prop',
    label: 'Standard Prop / Scenery',
    description: 'Non-blocking or decorative visual object with zero tactical penalties.',
    category: 'doodad',
    defaultTags: ['prop', 'scenery', 'custom'],
    vttProperties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'interactive_objects'
    }
  },
  {
    id: 'tactical_cover',
    label: 'Tactical Cover Barricade',
    description: 'Impassable barrier providing half-cover and structural damage absorption.',
    category: 'doodad',
    defaultTags: ['cover', 'barricade', 'tactical', 'defense'],
    vttProperties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'interactive_objects',
      doodad: {
        cover: 'half_cover',
        isDestructible: true,
        isContainer: false,
        structureHp: 30,
        armorDr: { kinetic: 4, energy: 2 }
      }
    }
  },
  {
    id: 'interactive_terminal',
    label: 'Interactive Data Terminal',
    description: 'Computers or control stations that run scripts when operatives interact.',
    category: 'doodad',
    defaultTags: ['terminal', 'console', 'interactive', 'hackable'],
    vttProperties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'interactive_objects',
      trigger: {
        enabled: true,
        triggerType: 'interact',
        triggerRadiusFt: 5,
        saveType: 'Tech (INT)',
        saveDc: 14,
        appliedCondition: 'none',
        damageType: 'plasma',
        disarmDc: 12,
        detectionDc: 10,
        sfx: 'terminal_access_chime',
        gmSecretNotes: 'Contains encrypted flight log manifests and sub-level override codes.',
        oneShot: false
      },
      script: {
        enabled: true,
        autorun: false,
        executionHook: 'on_interact',
        sourceCode: `// Terminal Interactive Script
const check = Dice.check2d10(2, 14);
if (check.success) {
  StoryFlags.set("terminal_hacked", true);
  StoryFlags.set("security_level", 2);
} else {
  StoryFlags.set("alarm_tripped", true);
}
return check;`,
        timeoutMs: 500
      }
    }
  },
  {
    id: 'proximity_mine',
    label: 'Proximity Explosive Mine',
    description: 'Concealed ordnance detonating on proximity with Reflex saving throw and burning.',
    category: 'hazard',
    defaultTags: ['mine', 'explosive', 'trap', 'plasma', 'hazard'],
    vttProperties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'interactive_objects',
      hazard: {
        hazardType: 'plasma_leak',
        damageFormula: '2d10+4 plasma',
        triggerTiming: 'on_enter'
      },
      trigger: {
        enabled: true,
        triggerType: 'proximity',
        triggerRadiusFt: 8,
        saveType: 'Reflex (AGI)',
        saveDc: 15,
        damageFormula: '2d10+4',
        damageType: 'plasma',
        appliedCondition: 'Burning',
        disarmDc: 14,
        detectionDc: 15,
        sfx: 'plasma_detonation_boom',
        gmSecretNotes: 'Military-grade anti-personnel plasma mine armed on the deck.',
        oneShot: true
      },
      script: {
        enabled: true,
        autorun: true,
        executionHook: 'on_trigger',
        sourceCode: `// Detonation Trauma Evaluation
const trauma = Trauma.evaluateCalledShot("leg_right", 18, 2);
StoryFlags.set("mine_detonated", true);
return trauma;`,
        timeoutMs: 500
      }
    }
  },
  {
    id: 'bulkhead_door',
    label: 'Reinforced Bulkhead Door',
    description: 'Sliding plasteel or titanium portal that blocks movement and line-of-sight.',
    category: 'wall_portal',
    defaultTags: ['door', 'bulkhead', 'portal', 'security'],
    vttProperties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'interactive_objects',
      wallPortal: {
        wallType: 'blast_bulkhead',
        isDoor: true,
        doorType: 'sliding',
        doorState: 'closed',
        blocksLight: true,
        blocksSensors: true,
        blocksMovement: true,
        soundMuffleFactor: 0.8
      },
      trigger: {
        enabled: true,
        triggerType: 'interact',
        triggerRadiusFt: 5,
        saveType: 'none',
        saveDc: 0,
        appliedCondition: 'none',
        damageType: 'plasma',
        sfx: 'door_hydraulic_whoosh',
        oneShot: false
      }
    }
  },
  {
    id: 'light_luminary',
    label: 'Tactical Light Luminary',
    description: 'Dynamic light emitter casting bright/dim radius with shadow casting.',
    category: 'doodad',
    defaultTags: ['light', 'lamp', 'illumination', 'beacon'],
    vttProperties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'interactive_objects',
      dynamicLighting: {
        emits: true,
        color: '#38bdf8',
        intensity: 1.2,
        radiusBrightFt: 15,
        radiusDimFt: 30,
        castsShadows: true,
        animation: 'pulse'
      }
    }
  },
  {
    id: 'biohazard_vent',
    label: 'Pressurized Toxic Vent',
    description: 'Hazardous exhaust pipe venting caustic neurotoxins requiring Fortitude saves.',
    category: 'hazard',
    defaultTags: ['hazard', 'gas', 'acid', 'toxic', 'vent'],
    vttProperties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'interactive_objects',
      hazard: {
        hazardType: 'biohazard_spore',
        damageFormula: '1d10+4 chemical',
        triggerTiming: 'on_turn_start'
      },
      trigger: {
        enabled: true,
        triggerType: 'proximity',
        triggerRadiusFt: 10,
        saveType: 'Fortitude (STA)',
        saveDc: 14,
        damageFormula: '1d10+4',
        damageType: 'chemical',
        appliedCondition: 'Poisoned',
        disarmDc: 13,
        detectionDc: 12,
        sfx: 'gas_leak_hiss',
        oneShot: false
      }
    }
  },
  {
    id: 'terrain_surface',
    label: 'Terrain Biome Surface Tile',
    description: 'Ground plane texture with 4-bit marching squares auto-tiling and friction.',
    category: 'terrain_brush',
    defaultTags: ['terrain', 'floor', 'biome', 'ground'],
    vttProperties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'background_map',
      terrain: {
        material: 'metal_deck',
        movementCost: 1.0,
        slipperyFriction: 1.0,
        footstepSfxCategory: 'footstep_metal'
      }
    }
  }
];

export class AssetIngestionPipeline {
  /**
   * Sanitizes a human-readable name into a deterministic unit_id.
   * e.g., "Rusty Metal Floor 01" -> "ter_rusty_metal_floor_01"
   */
  public static generateUnitId(name: string, category: AssetCategory): string {
    const prefixMap: Record<AssetCategory, string> = {
      terrain_brush: 'ter',
      doodad: 'prop',
      wall_portal: 'wall',
      hazard: 'hazard',
      vehicle: 'veh',
      token: 'tok',
      creature: 'creature'
    };

    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const prefix = prefixMap[category] || 'asset';
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${prefix}_${cleanName || 'custom'}_${randomSuffix}`;
  }

  /**
   * Ingests a single raw asset into a validated AssetUnit.
   */
  public static ingestSingleAsset(input: RawAssetInput): { success: boolean; asset?: AssetUnit; error?: string } {
    if (!input.name || !input.name.trim()) {
      return { success: false, error: 'Asset name cannot be empty.' };
    }

    const unitId = this.generateUnitId(input.name, input.category);
    const treePath = input.treePath && input.treePath.length > 0 
      ? input.treePath 
      : ['Custom Uploads', input.category.toUpperCase()];

    const rawUnit = createDefaultAssetUnit({
      unit_id: unitId,
      name: input.name.trim(),
      category: input.category,
      tree_path: treePath,
      tags: input.tags || [input.category, 'custom'],
      dimensions: input.dimensions || [1, 1],
      provenance: {
        source: input.provenance?.source || 'custom_upload',
        author: input.provenance?.author || 'User',
        packId: input.provenance?.packId,
        license: input.provenance?.license || 'Custom',
        dateAdded: new Date().toISOString()
      },
      visuals: {
        thumbnail: input.thumbnailUrl || input.imageDataUrl || '',
        baseTexture: input.imageDataUrl || '',
        variants: [],
        auto_tile: input.autoTile || (input.category === 'terrain_brush' ? 'marching_squares_4bit' : 'none')
      },
      vtt_properties: {
        blocks_movement: input.vttProperties?.blocks_movement ?? (input.category === 'wall_portal' || input.category === 'vehicle'),
        blocks_vision: input.vttProperties?.blocks_vision ?? (input.category === 'wall_portal'),
        z_index_layer: input.vttProperties?.z_index_layer || (input.category === 'terrain_brush' ? 'background_map' : 'interactive_objects'),
        ...input.vttProperties
      }
    });

    const validation = validateAssetUnit(rawUnit);
    if (!validation.success) {
      return { success: false, error: validation.error?.message || 'Failed schema validation.' };
    }

    return { success: true, asset: validation.data };
  }

  /**
   * Batch ingests multiple sliced frames into a series of AssetUnits.
   */
  public static ingestSlicedFrames(
    baseName: string,
    category: AssetCategory,
    treePath: string[],
    frames: SlicedFrame[],
    tags: string[] = []
  ): AssetUnit[] {
    const assets: AssetUnit[] = [];

    frames.forEach((frame, idx) => {
      const frameName = `${baseName} ${idx + 1}`;
      const result = this.ingestSingleAsset({
        name: frameName,
        category,
        treePath,
        tags: [...tags, 'sliced_frame'],
        imageDataUrl: frame.dataUrl,
        thumbnailUrl: frame.dataUrl
      });

      if (result.success && result.asset) {
        assets.push(result.asset);
      }
    });

    return assets;
  }
}
