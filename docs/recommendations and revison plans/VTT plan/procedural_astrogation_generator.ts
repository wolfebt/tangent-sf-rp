/**
 * @file AstrogationGenerator.ts
 * @description Stage 4.5: Procedural universe mapping.
 * Generates stellar coordinates via Poisson Disk Sampling to create organic clusters 
 * (avoiding artificial grid patterns) and utilizes Kruskal's Minimum Spanning Tree (MST) 
 * to calculate optimal, non-intersecting Translux hyperlanes for space travel.
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
   * This guarantees stars are densely packed but never overlap within a minimum radius.
   */
  public generateStarField(width: number, height: number, minRadius: number): StarSystem[] {
    const cellSize = minRadius / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid: (StarSystem | null)[][] = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(null));
    
    const activeList: StarSystem[] = [];
    const stars: StarSystem[] = [];
    
    // Seed the first star in the center of the sector
    const startStar: StarSystem = {
      id: `star_${0}`,
      x: width / 2,
      y: height / 2,
      name: `Core System`,
      techLevel: Math.floor(Math.random() * 6) // TL 0-5
    };
    
    this.insertToGrid(startStar, grid, cellSize);
    activeList.push(startStar);
    stars.push(startStar);
    
    let starCount = 1;

    // Generate remaining stars radially outward
    while (activeList.length > 0) {
      const activeIndex = Math.floor(Math.random() * activeList.length);
      const currentStar = activeList[activeIndex];
      let pointFound = false;

      // Try up to 30 times to place a valid neighbor star
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * minRadius + minRadius; // Between R and 2R
        const newX = currentStar.x + Math.cos(angle) * dist;
        const newY = currentStar.y + Math.sin(angle) * dist;

        if (this.isValidPlacement(newX, newY, width, height, minRadius, grid, cellSize)) {
          const newStar: StarSystem = {
            id: `star_${starCount++}`,
            x: newX,
            y: newY,
            name: `System-${starCount}`,
            techLevel: Math.floor(Math.random() * 6)
          };
          
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
    grid[gridX][gridY] = star;
  }

  private isValidPlacement(x: number, y: number, width: number, height: number, minRadius: number, grid: (StarSystem | null)[][], cellSize: number): boolean {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;

    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const searchRadius = 2; // Search neighboring grid cells

    for (let i = Math.max(0, gridX - searchRadius); i <= Math.min(grid.length - 1, gridX + searchRadius); i++) {
      for (let j = Math.max(0, gridY - searchRadius); j <= Math.min(grid[0].length - 1, gridY + searchRadius); j++) {
        const neighbor = grid[i][j];
        if (neighbor) {
          const dx = neighbor.x - x;
          const dy = neighbor.y - y;
          if (dx * dx + dy * dy < minRadius * minRadius) {
            return false; // Too close to an existing star
          }
        }
      }
    }
    return true;
  }

  /**
   * Generates the primary FTL trade routes connecting all stars without cycles.
   * Utilizes Kruskal's Minimum Spanning Tree algorithm.
   */
  public generateHyperlanes(stars: StarSystem[]): Hyperlane[] {
    const allEdges: Hyperlane[] = [];
    const mstLanes: Hyperlane[] = [];
    
    // 1. Calculate all possible connections (O(N^2) brute force for simplicity here, 
    //    though Delaunay triangulation is used in production to limit initial edges)
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

    // 2. Sort edges by distance (shortest first)
    allEdges.sort((a, b) => a.distance - b.distance);

    // 3. Disjoint Set (Union-Find) initialization for cycle detection
    const parent: Record<string, string> = {};
    stars.forEach(star => parent[star.id] = star.id);

    const find = (i: string): string => {
      if (parent[i] === i) return i;
      return find(parent[i]);
    };

    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      parent[rootI] = rootJ;
    };

    // 4. Kruskal's execution
    for (const edge of allEdges) {
      const sourceRoot = find(edge.sourceId);
      const targetRoot = find(edge.targetId);

      // If they don't form a cycle, add to the hyperlane network
      if (sourceRoot !== targetRoot) {
        mstLanes.push(edge);
        union(sourceRoot, targetRoot);
      }
      
      // Early exit if we've connected all stars
      if (mstLanes.length === stars.length - 1) break;
    }

    return mstLanes;
  }
}