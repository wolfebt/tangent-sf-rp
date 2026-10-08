/**
 * @file TangentPackager.ts
 * @description Bundles and extracts custom user asset collections into portable `.tangent-pack` archives.
 */

import { type AssetUnit, AssetUnitSchema } from '../../schemas/assetUnitSchema.ts';

export interface TangentPackManifest {
  format: 'tangent-pack';
  version: '1.0.0';
  packId: string;
  title: string;
  author: string;
  description: string;
  createdAt: string;
  assetCount: number;
  categories: string[];
  assets: AssetUnit[];
}

export class TangentPackager {
  /**
   * Bundles an array of AssetUnits into a formatted JSON string.
   */
  public static createPack(
    packId: string,
    title: string,
    author: string,
    description: string,
    assets: AssetUnit[]
  ): string {
    const categories = Array.from(new Set(assets.map(a => a.category)));

    const manifest: TangentPackManifest = {
      format: 'tangent-pack',
      version: '1.0.0',
      packId,
      title,
      author,
      description,
      createdAt: new Date().toISOString(),
      assetCount: assets.length,
      categories,
      assets
    };

    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Unpacks and validates a `.tangent-pack` JSON string.
   */
  public static unpackPack(jsonString: string): { 
    success: boolean; 
    manifest?: TangentPackManifest; 
    validAssets?: AssetUnit[]; 
    error?: string 
  } {
    try {
      const raw = JSON.parse(jsonString);

      if (raw.format !== 'tangent-pack') {
        return { success: false, error: 'Invalid file format. Expected tangent-pack manifest.' };
      }

      if (!Array.isArray(raw.assets)) {
        return { success: false, error: 'Malformed pack: assets must be an array.' };
      }

      const validAssets: AssetUnit[] = [];
      const errors: string[] = [];

      for (let i = 0; i < raw.assets.length; i++) {
        const item = raw.assets[i];
        const validation = AssetUnitSchema.safeParse(item);
        if (validation.success) {
          validAssets.push(validation.data);
        } else {
          errors.push(`Asset index ${i} (${item?.name || 'unknown'}): ${validation.error.message}`);
        }
      }

      const manifest: TangentPackManifest = {
        format: 'tangent-pack',
        version: raw.version || '1.0.0',
        packId: raw.packId || 'custom_pack',
        title: raw.title || 'Imported Pack',
        author: raw.author || 'Unknown',
        description: raw.description || '',
        createdAt: raw.createdAt || new Date().toISOString(),
        assetCount: validAssets.length,
        categories: Array.from(new Set(validAssets.map(a => a.category))),
        assets: validAssets
      };

      return {
        success: true,
        manifest,
        validAssets
      };
    } catch (e: any) {
      return { success: false, error: `Failed to parse pack JSON: ${e.message}` };
    }
  }
}
