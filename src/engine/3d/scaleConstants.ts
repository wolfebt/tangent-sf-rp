/**
 * @file scaleConstants.ts
 * @description Canonical Stage 3D world scale constants matching 5ft encounter grid cells.
 * 1 tactical 5ft cell = 70 world units => 14 world units per foot.
 */

export const CELL_SIZE_WORLD = 70;
export const CELL_SIZE_FT = 5;
export const WORLD_UNITS_PER_FOOT = CELL_SIZE_WORLD / CELL_SIZE_FT; // 14
export const DEFAULT_WALL_HEIGHT_FT = 10;
export const DEFAULT_WALL_HEIGHT_WORLD = DEFAULT_WALL_HEIGHT_FT * WORLD_UNITS_PER_FOOT; // 140

export function feetToWorldUnits(ft: number): number {
  return (Number(ft) || 0) * WORLD_UNITS_PER_FOOT;
}

export function worldUnitsToFeet(units: number): number {
  return (Number(units) || 0) / WORLD_UNITS_PER_FOOT;
}
