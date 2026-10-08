/**
 * @file SemanticZoneMask.ts
 * @description 2D spatial byte-mask representing the functional semantic truth-map of the stage.
 * Used by PCG math engines, collision checkers, and LLM context aggregators.
 */

export const SemanticFlag = {
  EMPTY: 0x00,
  FLOOR: 0x01,      // Walkable open area
  WALL: 0x02,       // Impassable physical boundary
  HAZARD: 0x04,     // Damaging ground (acid, fire, plasma)
  COVER: 0x08,      // Half/Three-quarter cover
  DOORWAY: 0x10,    // Threshold / chokepoint
  FROZEN: 0x20      // Region-locked from procedural re-rolls
} as const;

export type SemanticFlag = typeof SemanticFlag[keyof typeof SemanticFlag];

export class SemanticZoneMask {
  public readonly width: number;
  public readonly height: number;
  private buffer: Uint8Array;

  constructor(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.buffer = new Uint8Array(this.width * this.height);
  }

  private getIndex(col: number, row: number): number {
    return row * this.width + col;
  }

  public isInBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  public setFlag(col: number, row: number, flag: SemanticFlag): void {
    if (!this.isInBounds(col, row)) return;
    this.buffer[this.getIndex(col, row)] |= flag;
  }

  public clearFlag(col: number, row: number, flag: SemanticFlag): void {
    if (!this.isInBounds(col, row)) return;
    this.buffer[this.getIndex(col, row)] &= ~flag;
  }

  public hasFlag(col: number, row: number, flag: SemanticFlag): boolean {
    if (!this.isInBounds(col, row)) return false;
    return (this.buffer[this.getIndex(col, row)] & flag) !== 0;
  }

  public getMask(col: number, row: number): number {
    if (!this.isInBounds(col, row)) return SemanticFlag.WALL;
    return this.buffer[this.getIndex(col, row)];
  }

  /**
   * Sets semantic flags across a rectangular region.
   */
  public fillRect(minCol: number, minRow: number, maxCol: number, maxRow: number, flag: SemanticFlag): void {
    const c1 = Math.max(0, Math.min(minCol, maxCol));
    const c2 = Math.min(this.width - 1, Math.max(minCol, maxCol));
    const r1 = Math.max(0, Math.min(minRow, maxRow));
    const r2 = Math.min(this.height - 1, Math.max(minRow, maxRow));

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        this.setFlag(c, r, flag);
      }
    }
  }

  /**
   * Checks if a rectangular footprint is completely clear of walls, hazards, and chokepoints.
   */
  public isFootprintClear(col: number, row: number, widthCells: number, heightCells: number): boolean {
    for (let r = row; r < row + heightCells; r++) {
      for (let c = col; c < col + widthCells; c++) {
        if (!this.isInBounds(c, r)) return false;
        const mask = this.getMask(c, r);
        if ((mask & SemanticFlag.WALL) !== 0) return false;
        if ((mask & SemanticFlag.DOORWAY) !== 0) return false;
        if ((mask & SemanticFlag.FROZEN) !== 0) return false;
      }
    }
    return true;
  }

  /**
   * Summarizes semantic zone distribution within a bounded room for LLM context generation.
   */
  public getZoneSummary(minCol: number, minRow: number, maxCol: number, maxRow: number): {
    totalCells: number;
    floorCells: number;
    hazardCells: number;
    coverCells: number;
    wallCells: number;
    doorCells: number;
    frozenCells: number;
  } {
    let floor = 0, hazard = 0, cover = 0, wall = 0, door = 0, frozen = 0;
    let total = 0;

    const c1 = Math.max(0, Math.min(minCol, maxCol));
    const c2 = Math.min(this.width - 1, Math.max(minCol, maxCol));
    const r1 = Math.max(0, Math.min(minRow, maxRow));
    const r2 = Math.min(this.height - 1, Math.max(minRow, maxRow));

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        total++;
        const mask = this.getMask(c, r);
        if (mask & SemanticFlag.FLOOR) floor++;
        if (mask & SemanticFlag.HAZARD) hazard++;
        if (mask & SemanticFlag.COVER) cover++;
        if (mask & SemanticFlag.WALL) wall++;
        if (mask & SemanticFlag.DOORWAY) door++;
        if (mask & SemanticFlag.FROZEN) frozen++;
      }
    }

    return {
      totalCells: total,
      floorCells: floor,
      hazardCells: hazard,
      coverCells: cover,
      wallCells: wall,
      doorCells: door,
      frozenCells: frozen
    };
  }
}
