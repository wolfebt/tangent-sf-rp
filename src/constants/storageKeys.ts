/**
 * @file storageKeys.ts
 * @description Centralized localStorage and sessionStorage key definitions for Tangent SFF RP.
 */

export const STORAGE_KEYS = {
  ADE_LAYOUT_PREFS: 'tangent_ade_layout_prefs',
  VTT_BEATS: (scenarioId: string) => `tangent_vtt_beats_${scenarioId}`,
  COLLAPSED_CATEGORIES: 'tangent_story_foundry_collapsed_categories',
  LAST_ACTIVE_MODULE: 'tangent_last_active_story_id',
  DICE_HISTORY: 'tangent_dice_history',
  COMM_DOCK_STATE: 'tangent_comm_dock_open',
  CATALOG_VIEW_MODE: 'tangent_catalog_view_mode'
} as const;

