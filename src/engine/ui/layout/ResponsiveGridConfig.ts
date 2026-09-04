/**
 * @file ResponsiveGridConfig.ts
 * @description Stage 6 UI Glass Cockpit layout configuration and responsive constraints.
 * Provides breakpoints, column spans, widget dimension bounds (minW: 280px equivalent),
 * and pre-configured workspace presets.
 */

export interface GridBreakpointConfig {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

export interface GridColsConfig {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

export interface WidgetLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
}

export type LayoutPresetType = 'combat' | 'architect' | 'director' | 'minimal';

export const RESPONSIVE_BREAKPOINTS: GridBreakpointConfig = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

export const RESPONSIVE_COLS: GridColsConfig = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

export const DEFAULT_ROW_HEIGHT = 42;

/**
 * Standard widget sizing bounds.
 * At 12 columns on 1200px width, 1 column = ~100px.
 * MinW = 3 corresponds to ~300px, satisfying the >= 280px requirement.
 */
export const WIDGET_CONSTRAINTS = {
  vitals: { minW: 3, minH: 4, maxW: 5, maxH: 8 },
  actionBar: { minW: 4, minH: 3, maxW: 12, maxH: 6 },
  combatTracker: { minW: 3, minH: 6, maxW: 6, maxH: 14 },
  mechaFoundry: { minW: 4, minH: 6, maxW: 8, maxH: 14 },
  inspector: { minW: 3, minH: 6, maxW: 6, maxH: 14 },
  aimeCoPilot: { minW: 3, minH: 6, maxW: 7, maxH: 16 },
  notes: { minW: 3, minH: 4, maxW: 6, maxH: 12 },
  modalWidget: { minW: 4, minH: 6, maxW: 10, maxH: 16 }
};

/**
 * Pre-defined cockpit layout presets.
 */
export const COCKPIT_LAYOUT_PRESETS: Record<LayoutPresetType, WidgetLayoutItem[]> = {
  combat: [
    { i: 'vitals', x: 0, y: 0, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'actionBar', x: 3, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'combatTracker', x: 9, y: 0, w: 3, h: 10, minW: 3, minH: 6 }
  ],
  architect: [
    { i: 'inspector', x: 9, y: 0, w: 3, h: 12, minW: 3, minH: 6 },
    { i: 'notes', x: 0, y: 0, w: 3, h: 6, minW: 3, minH: 4 }
  ],
  director: [
    { i: 'aimeCoPilot', x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 6 },
    { i: 'combatTracker', x: 0, y: 0, w: 3, h: 8, minW: 3, minH: 6 },
    { i: 'notes', x: 0, y: 8, w: 3, h: 4, minW: 3, minH: 4 }
  ],
  minimal: [
    { i: 'vitals', x: 0, y: 0, w: 3, h: 4, minW: 3, minH: 3 }
  ]
};

/**
 * Validates whether a layout item conforms to minimum bounds (>= 280px equivalent).
 */
export function validateLayoutItem(item: WidgetLayoutItem, totalCols: number = 12, screenWidth: number = 1200): boolean {
  const colWidth = screenWidth / totalCols;
  const estimatedPixelWidth = item.w * colWidth;
  return estimatedPixelWidth >= 270; // 10px leeway for grid margins
}

export const ResponsiveGridConfig = {
  breakpoints: RESPONSIVE_BREAKPOINTS,
  cols: RESPONSIVE_COLS,
  rowHeight: DEFAULT_ROW_HEIGHT,
  constraints: WIDGET_CONSTRAINTS,
  presets: COCKPIT_LAYOUT_PRESETS,
  validateLayoutItem
};

export default ResponsiveGridConfig;
