/**
 * @file pcgGridHelpers.ts
 * @description Pure grid transformation & theme helpers for PcgAiStudioTab
 *   (Starship fore_aft/bilateral symmetry + deck themes, Mining branch tunnels + rail tracks,
 *   and Modular Outpost perimeter wall rings).
 */

export interface PcgTacticalCellLike {
  isFloor: boolean;
  isLiquid?: boolean;
  liquidType?: 'magma' | 'acid' | 'water' | 'slime';
  isDoor?: boolean;
  doorType?: 'airlock' | 'bulkhead';
  isBarricaded?: boolean;
  isLight?: boolean;
  lightColor?: string;
  lightAnimation?: 'steady' | 'flicker' | 'pulse';
  isProp?: boolean;
  propName?: string;
  propCategory?: string;
  isBreach?: boolean;
  isCarbonScoring?: boolean;
  isFrozen?: boolean;
  deckTheme?: string;
}

export const STARSHIP_THEME_STYLES: Record<string, { floorColor: string; lightColor: string; biomeType: string }> = {
  metal_deck: { floorColor: '#1e293b', lightColor: '#38bdf8', biomeType: 'metal_deck' },
  industrial: { floorColor: '#292524', lightColor: '#f59e0b', biomeType: 'industrial' },
  cyber_grid: { floorColor: '#0f172a', lightColor: '#22d3ee', biomeType: 'cyber_grid' }
};

export function resolveStarshipThemeStyle(theme: string) {
  return STARSHIP_THEME_STYLES[theme] ?? STARSHIP_THEME_STYLES.metal_deck!;
}

/**
 * Applies bilateral (port/starboard) or fore_aft (bow/stern) symmetry across a starship grid
 * and stamps the selected deckTheme + theme light color onto floor cells.
 */
export function applyStarshipSymmetryAndTheme<T extends PcgTacticalCellLike>(
  grid: T[][],
  symmetry: 'none' | 'bilateral' | 'fore_aft',
  theme: string
): T[][] {
  const rows = grid.length;
  const cols = rows > 0 ? (grid[0]?.length ?? 0) : 0;
  if (rows === 0 || cols === 0) return grid;

  const themeStyle = resolveStarshipThemeStyle(theme);
  const midY = Math.floor(rows / 2);
  const midX = Math.floor(cols / 2);

  if (symmetry === 'bilateral') {
    for (let r = 0; r < midY; r++) {
      const mirrorR = rows - 1 - r;
      for (let c = 0; c < cols; c++) {
        grid[mirrorR]![c] = { ...grid[r]![c]! };
      }
    }
  } else if (symmetry === 'fore_aft') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < midX; c++) {
        const mirrorC = cols - 1 - c;
        grid[r]![mirrorC] = { ...grid[r]![c]! };
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]![c]!;
      if (cell.isFloor) {
        cell.deckTheme = theme;
        if (cell.isLight) {
          cell.lightColor = themeStyle.lightColor;
        }
      }
    }
  }

  return grid;
}

/**
 * Carves secondary drift branch tunnels and optional mining rail track props + corridor floodlights.
 */
export function applyMiningBranchesAndRails<T extends PcgTacticalCellLike>(
  grid: T[][],
  branchesCount: number,
  includeRailTracks: boolean,
  rng: () => number
): T[][] {
  const rows = grid.length;
  const cols = rows > 0 ? (grid[0]?.length ?? 0) : 0;
  if (rows < 4 || cols < 4) return grid;

  const floorSeeds: Array<{ r: number; c: number }> = [];
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (grid[r]?.[c]?.isFloor) {
        floorSeeds.push({ r, c });
      }
    }
  }

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  const targetBranches = Math.max(0, Math.floor(branchesCount));
  for (let b = 0; b < targetBranches && floorSeeds.length > 0; b++) {
    const seed = floorSeeds[Math.floor(rng() * floorSeeds.length)]!;
    const dir = dirs[Math.floor(rng() * dirs.length)]!;
    const len = 4 + Math.floor(rng() * 5);
    let r = seed.r;
    let c = seed.c;

    for (let step = 0; step < len; step++) {
      r += dir.dr;
      c += dir.dc;
      if (r < 1 || r >= rows - 1 || c < 1 || c >= cols - 1) break;
      const cell = grid[r]![c]!;
      cell.isFloor = true;
      if (step === len - 1) {
        cell.isLight = true;
        cell.lightColor = '#f59e0b';
      }
    }
  }

  if (includeRailTracks) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const cell = grid[r]![c]!;
        if (!cell.isFloor) continue;
        const onHorizontalRail = r % 4 === 0 && grid[r]?.[c - 1]?.isFloor && grid[r]?.[c + 1]?.isFloor;
        const onVerticalRail = c % 6 === 0 && grid[r - 1]?.[c]?.isFloor && grid[r + 1]?.[c]?.isFloor;
        if ((onHorizontalRail || onVerticalRail) && !cell.isProp) {
          cell.isProp = true;
          cell.propName = 'Mining Rail Track';
          cell.propCategory = 'rail_track';
        }
        if ((r % 6 === 0 || c % 8 === 0) && rng() < 0.2) {
          cell.isLight = true;
          cell.lightColor = '#eab308';
        }
      }
    }
  }

  return grid;
}

/**
 * Enforces or omits a sealed perimeter security ring around a modular outpost grid.
 */
export function applyOutpostPerimeterWall<T extends PcgTacticalCellLike>(
  grid: T[][],
  enforcePerimeter: boolean,
  modulesY: number,
  moduleSize: number
): T[][] {
  const rows = grid.length;
  const cols = rows > 0 ? (grid[0]?.length ?? 0) : 0;
  if (rows < 4 || cols < 4) return grid;

  if (enforcePerimeter) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const onOuterRing = r === 1 || r === rows - 2 || c === 1 || c === cols - 2;
        if (onOuterRing) {
          const cell = grid[r]![c]!;
          cell.isFloor = false;
          cell.isDoor = false;
        }
      }
    }

    // Place perimeter gate airlocks where main module corridors meet the outer ring
    for (let my = 0; my < modulesY; my++) {
      const cy = Math.floor(2 + my * moduleSize + moduleSize / 2);
      if (cy > 1 && cy < rows - 2) {
        const leftGate = grid[cy]![1]!;
        leftGate.isFloor = true;
        leftGate.isDoor = true;
        leftGate.doorType = 'airlock';

        const rightGate = grid[cy]![cols - 2]!;
        rightGate.isFloor = true;
        rightGate.isDoor = true;
        rightGate.doorType = 'airlock';
      }
    }
  } else {
    // Open-access corridors extend cleanly through the outer perimeter boundary
    for (let my = 0; my < modulesY; my++) {
      const cy = Math.floor(2 + my * moduleSize + moduleSize / 2);
      if (cy >= 0 && cy < rows) {
        for (let c = 0; c < cols; c++) {
          grid[cy]![c]!.isFloor = true;
        }
      }
    }
  }

  return grid;
}
