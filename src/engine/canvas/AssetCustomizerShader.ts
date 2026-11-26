/**
 * @file AssetCustomizerShader.ts
 * @description Translates AssetUnit VisualVariants customization (HSL/tint/contrast)
 * and dynamic stateTextures (pristine, damaged, destroyed, overgrown, corrupted)
 * into CSS filters (for DOM previews) and PixiJS ColorMatrixFilters (for 2D canvas sprites).
 */

import type { AssetUnit, VisualVariants } from '../../schemas/assetUnitSchema.ts';
import { resolveAssetTexture } from '../assets/assetVisualFallbacks.ts';

export type AssetVisualStateCondition =
  | 'pristine'
  | 'damaged'
  | 'destroyed'
  | 'overgrown'
  | 'corrupted';

export interface AssetStateResolutionContext {
  hpRatio?: number;
  condition?: AssetVisualStateCondition;
}

export function hasActiveCustomization(
  customization?: VisualVariants['customization']
): boolean {
  if (!customization) return false;
  const tint = (customization.tintColor || '#ffffff').toLowerCase();
  return (
    (tint !== '#ffffff' && tint !== '#fff') ||
    (customization.hueRotation ?? 0) !== 0 ||
    (customization.saturation ?? 1) !== 1 ||
    (customization.brightness ?? 1) !== 1 ||
    (customization.contrast ?? 1) !== 1
  );
}

export function parseTintHexToNumber(hex?: string): number {
  if (!hex || typeof hex !== 'string') return 0xffffff;
  const clean = hex.trim().replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return parseInt(expanded, 16);
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return parseInt(clean, 16);
  }
  return 0xffffff;
}

export function buildCssFilterFromCustomization(
  customization?: VisualVariants['customization']
): { filter?: string; tintOverlay?: string } {
  if (!hasActiveCustomization(customization) || !customization) {
    return {};
  }
  const hue = customization.hueRotation ?? 0;
  const sat = customization.saturation ?? 1;
  const bri = customization.brightness ?? 1;
  const con = customization.contrast ?? 1;
  const tint = (customization.tintColor || '#ffffff').toLowerCase();

  return {
    filter: `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bri}) contrast(${con})`,
    tintOverlay: tint !== '#ffffff' && tint !== '#fff' ? `${customization.tintColor}33` : undefined
  };
}

/**
 * Selects the best state texture (pristine/damaged/destroyed/overgrown/corrupted)
 * for an AssetUnit or falls back cleanly to its base texture / SVG fallback.
 */
export function resolveAssetStateTexture(
  unit: Pick<AssetUnit, 'visuals' | 'category' | 'name' | 'unit_id'>,
  state?: AssetStateResolutionContext
): string {
  const states = unit?.visuals?.stateTextures;
  if (states) {
    let targetKey: AssetVisualStateCondition | undefined = state?.condition;
    if (!targetKey && typeof state?.hpRatio === 'number') {
      if (state.hpRatio <= 0) targetKey = 'destroyed';
      else if (state.hpRatio < 0.5) targetKey = 'damaged';
      else targetKey = 'pristine';
    }
    if (targetKey && states[targetKey]) {
      return states[targetKey]!;
    }
    if (!targetKey && states.pristine) {
      return states.pristine;
    }
  }
  return resolveAssetTexture(unit as AssetUnit);
}

/**
 * Applies `VisualVariants.customization` tint and ColorMatrixFilter onto a PixiJS Sprite.
 */
export function applyAssetCustomizationToPixiSprite(
  sprite: any,
  customization?: VisualVariants['customization'],
  ColorMatrixFilterCtor?: new () => any
): void {
  if (!sprite) return;
  if (!hasActiveCustomization(customization) || !customization) {
    sprite.tint = 0xffffff;
    if (Array.isArray(sprite.filters) && sprite.filters.length > 0) {
      sprite.filters = [];
    }
    return;
  }

  sprite.tint = parseTintHexToNumber(customization.tintColor);

  const hue = customization.hueRotation ?? 0;
  const sat = customization.saturation ?? 1;
  const bri = customization.brightness ?? 1;
  const con = customization.contrast ?? 1;
  const needsMatrix = hue !== 0 || sat !== 1 || bri !== 1 || con !== 1;

  if (needsMatrix && typeof ColorMatrixFilterCtor === 'function') {
    const cmf = new ColorMatrixFilterCtor();
    if (hue !== 0 && typeof cmf.hue === 'function') {
      cmf.hue(hue, false);
    }
    if (sat !== 1 && typeof cmf.saturate === 'function') {
      cmf.saturate(sat - 1, true);
    }
    if (bri !== 1 && typeof cmf.brightness === 'function') {
      cmf.brightness(bri, true);
    }
    if (con !== 1 && typeof cmf.contrast === 'function') {
      cmf.contrast(con - 1, true);
    }
    sprite.filters = [cmf];
  } else if (Array.isArray(sprite.filters) && sprite.filters.length > 0) {
    sprite.filters = [];
  }
}
