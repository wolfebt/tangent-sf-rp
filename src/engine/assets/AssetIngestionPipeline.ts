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
  vttProperties?: Partial<AssetUnit['vtt_properties']>;
  provenance?: {
    source?: 'preset' | 'custom_upload' | 'dlc_pack' | 'omnicortex_dbm';
    author?: string;
    packId?: string;
    license?: string;
  };
}

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
        auto_tile: input.category === 'terrain_brush' ? 'marching_squares_4bit' : 'none'
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
