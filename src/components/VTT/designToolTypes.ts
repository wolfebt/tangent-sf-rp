/**
 * @file designToolTypes.ts
 * @description Shared Architect VTT tool, stamp palette, and terrain biome constants/types.
 */

import type { AssetUnit } from '../../schemas/assetUnitSchema';

export type ArchitectDesignTool =
  | 'select'
  | 'pan'
  | 'wall'
  | 'curved_wall'
  | 'terrain'
  | 'fill'
  | 'pencil'
  | 'waypoint'
  | 'region'
  | 'object'
  | 'token'
  | 'text'
  | 'fog'
  | 'hazard'
  | 'light'
  | 'chunk'
  | 'ruler'
  | 'aoe'
  | 'eraser';

export interface PaletteItem {
  id: string;
  category: string;
  label: string;
  desc: string;
  type: string;
  subType?: string;
  icon: any;
  color: string;
  imageUrl?: string;
  assetUnit?: AssetUnit;
  defaultProps?: Record<string, any>;
}

export const BIOME_OPTIONS = [
  { id: 'deepSpace', label: 'Deep Space Void', color: '#030712', patternKey: 'deepSpaceVoid' },
  { id: 'waterOcean', label: 'Open Ocean / Water', color: '#1e3a8a', patternKey: 'waterOcean' },
  { id: 'grassland', label: 'Grassland / Plains', color: '#14532d', patternKey: 'grassland' },
  { id: 'forestCanopy', label: 'Forest / Jungle', color: '#052e16', patternKey: 'forestCanopy' },
  { id: 'desertSand', label: 'Desert Sand / Dunes', color: '#9a3412', patternKey: 'desertSand' },
  { id: 'volcanicLava', label: 'Volcanic Lava', color: '#450a0a', patternKey: 'volcanicLava' },
  { id: 'cyberGrid', label: 'Cyber Grid Floor', color: '#0f172a', patternKey: 'cyberGrid' },
  { id: 'toxicSludge', label: 'Toxic Sludge / Waste', color: '#1a2e05', patternKey: 'toxicSludge' }
];

export const PENCIL_COLOR_OPTIONS = [
  { color: '#22d3ee', label: 'Cyan' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#ef4444', label: 'Red' },
  { color: '#a855f7', label: 'Violet' },
  { color: '#ffffff', label: 'White' }
];
