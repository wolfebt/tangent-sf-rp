/**
 * @file AssetCustomizerShader.ts
 * @description WebGL / PixiJS and CSS shader filter utilities for dynamically tinting and mutating map assets.
 */

import type { AssetUnit, VisualVariants } from '../../schemas/assetUnitSchema.ts';

export interface ShaderUniforms {
  uTint: [number, number, number, number]; // RGBA normalized (0.0 - 1.0)
  uHueRotation: number;                    // Radians
  uSaturation: number;                     // 0.0 - 3.0
  uBrightness: number;                     // 0.0 - 2.0
  uContrast: number;                       // 0.0 - 2.0
}

export class AssetCustomizerShader {
  /**
   * Converts a hex color string to normalized RGBA tuple [0..1, 0..1, 0..1, 1.0].
   */
  public static hexToNormalizedRgba(hex: string): [number, number, number, number] {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    return [r, g, b, 1.0];
  }

  /**
   * Compiles asset customization options into WebGL uniform parameters.
   */
  public static compileUniforms(customization?: VisualVariants['customization']): ShaderUniforms {
    const tintColor = customization?.tintColor || '#ffffff';
    const hueRotationDeg = customization?.hueRotation ?? 0;
    const saturation = customization?.saturation ?? 1.0;
    const brightness = customization?.brightness ?? 1.0;
    const contrast = customization?.contrast ?? 1.0;

    return {
      uTint: this.hexToNormalizedRgba(tintColor),
      uHueRotation: (hueRotationDeg * Math.PI) / 180, // Convert to radians for GLSL
      uSaturation: saturation,
      uBrightness: brightness,
      uContrast: contrast
    };
  }

  /**
   * Generates a CSS filter string for HTML/DOM previews.
   */
  public static toCssFilterString(customization?: VisualVariants['customization']): string {
    if (!customization) return 'none';
    const hue = customization.hueRotation ?? 0;
    const sat = customization.saturation ?? 1.0;
    const bri = customization.brightness ?? 1.0;
    const con = customization.contrast ?? 1.0;

    return `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bri}) contrast(${con})`;
  }

  /**
   * Resolves the current active texture path for an asset based on dynamic in-game damage/condition.
   */
  public static resolveStateTexture(
    asset: AssetUnit,
    state: { currentHp?: number; maxHp?: number; isCorrupted?: boolean; isOvergrown?: boolean }
  ): string {
    const stateTextures = asset.visuals.stateTextures;
    if (!stateTextures) return asset.visuals.baseTexture || asset.visuals.thumbnail;

    if (state.isCorrupted && stateTextures.corrupted) {
      return stateTextures.corrupted;
    }
    if (state.isOvergrown && stateTextures.overgrown) {
      return stateTextures.overgrown;
    }

    if (state.currentHp !== undefined && state.maxHp !== undefined && state.maxHp > 0) {
      const ratio = state.currentHp / state.maxHp;
      if (ratio <= 0 && stateTextures.destroyed) {
        return stateTextures.destroyed;
      }
      if (ratio < 0.5 && stateTextures.damaged) {
        return stateTextures.damaged;
      }
    }

    return stateTextures.pristine || asset.visuals.baseTexture || asset.visuals.thumbnail;
  }
}
