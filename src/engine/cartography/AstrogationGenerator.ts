/**
 * @file AstrogationGenerator.ts
 * @description Stage 4.5: Procedural universe and sector mapping.
 * Generates stellar coordinates via Poisson Disk Sampling to create organic clusters 
 * (avoiding artificial grid patterns) and utilizes Kruskal's Minimum Spanning Tree (MST) 
 * to calculate optimal, non-intersecting Translux hyperlanes for space travel on the Stage.
 */

export interface StarSystem {
  id: string;
  x: number;
  y: number;
  name: string;
  techLevel: number;
}

export interface Hyperlane {
  sourceId: string;
  targetId: string;
  distance: number;
}

export class AstrogationGenerator {
  /**
   * Generates a field of stars using Poisson Disk Sampling.
   */
  public generateStarField(width: number, height: number, minRadius: number): StarSystem[] {
    const cellSize = minRadius / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid: (StarSystem | null)[][] = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(null));
    
    const activeList: StarSystem[] = [];
    const stars: StarSystem[] = [];
    
    const startStar: StarSystem = {
      id: 'star_0',
      x: width / 2,
      y: height / 2,
      name: 'Core System',
      techLevel: 3
    };
    
    this.insertToGrid(startStar, grid, cellSize);
    activeList.push(startStar);
    stars.push(startStar);
    
    let starCount = 1;

    while (activeList.length > 0) {
      const activeIndex = Math.floor(Math.random() * activeList.length);
      const currentStar = activeList[activeIndex];
      let pointFound = false;

      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * minRadius + minRadius;
        const newX = currentStar.x + Math.cos(angle) * dist;
        const newY = currentStar.y + Math.sin(angle) * dist;

        if (this.isValidPlacement(newX, newY, width, height, minRadius, grid, cellSize)) {
          const newStar: StarSystem = {
            id: `star_${starCount}`,
            x: newX,
            y: newY,
            name: `System-${starCount}`,
            techLevel: Math.floor(Math.random() * 6)
          };
          starCount++;
          
          this.insertToGrid(newStar, grid, cellSize);
          activeList.push(newStar);
          stars.push(newStar);
          pointFound = true;
          break;
        }
      }

      if (!pointFound) {
        activeList.splice(activeIndex, 1);
      }
    }

    return stars;
  }

  private insertToGrid(star: StarSystem, grid: (StarSystem | null)[][], cellSize: number) {
    const gridX = Math.floor(star.x / cellSize);
    const gridY = Math.floor(star.y / cellSize);
    if (gridX >= 0 && gridX < grid.length && gridY >= 0 && gridY < grid[0].length) {
      grid[gridX][gridY] = star;
    }
  }

  private isValidPlacement(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    minRadius: number, 
    grid: (StarSystem | null)[][], 
    cellSize: number
  ): boolean {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;

    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const searchRadius = 2;

    for (let i = Math.max(0, gridX - searchRadius); i <= Math.min(grid.length - 1, gridX + searchRadius); i++) {
      for (let j = Math.max(0, gridY - searchRadius); j <= Math.min(grid[0].length - 1, gridY + searchRadius); j++) {
        const neighbor = grid[i][j];
        if (neighbor) {
          const dx = neighbor.x - x;
          const dy = neighbor.y - y;
          if (dx * dx + dy * dy < minRadius * minRadius) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Generates hyperlane network connecting stars without cycles using Kruskal's MST.
   */
  public generateHyperlanes(stars: StarSystem[]): Hyperlane[] {
    if (stars.length <= 1) return [];

    const allEdges: Hyperlane[] = [];
    const mstLanes: Hyperlane[] = [];
    
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        allEdges.push({
          sourceId: stars[i].id,
          targetId: stars[j].id,
          distance: Math.sqrt(dx * dx + dy * dy)
        });
      }
    }

    allEdges.sort((a, b) => a.distance - b.distance);

    const parent: Record<string, string> = {};
    stars.forEach(star => { parent[star.id] = star.id; });

    const find = (i: string): string => {
      if (parent[i] === i) return i;
      return find(parent[i]);
    };

    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      parent[rootI] = rootJ;
    };

    for (const edge of allEdges) {
      const sourceRoot = find(edge.sourceId);
      const targetRoot = find(edge.targetId);

      if (sourceRoot !== targetRoot) {
        mstLanes.push(edge);
        union(sourceRoot, targetRoot);
      }
      
      if (mstLanes.length === stars.length - 1) break;
    }

    return mstLanes;
  }
}
