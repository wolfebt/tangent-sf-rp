import { TERRAIN_TEXTURE_PATTERNS, PRESET_OBJECT_SPRITES } from './MapTextures';

export function getBiomeTextureUrl(biomeType) {
  if (!biomeType) return null;
  if (['ocean', 'abyssal', 'deepOcean', 'shallowWater', 'river'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.waterOcean;
  if (['grass', 'plains'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.grassland;
  if (['forest', 'jungle', 'bioluminescent'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.forestCanopy;
  if (['beach', 'desert', 'savanna'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.desertSand;
  if (['volcanic', 'lava', 'magma', 'ash'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.volcanicLava;
  if (['snow', 'ice', 'polar', 'tundra', 'glacial'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.iceSheet;
  if (['mountain', 'highPeaks', 'crags', 'hills'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.topographicContour;
  if (['scifi', 'cyber', 'ecumenopolis'].includes(biomeType)) return TERRAIN_TEXTURE_PATTERNS.cyberGrid;
  return null;
}

/**
 * Procedural Landmass & World Generator Engine for Story Foundry Map Maker
 * Extreme Detail Engine supporting 2D Simplex/Perlin noise with Domain Warping,
 * Cellular Automata, Voronoi Tectonic Plates, Procedural River Network Carving,
 * 12-tier biomes, and master catalog asset scattering.
 */

export function createPRNG(seedInput) {
  let seed = 0;
  if (typeof seedInput === 'number') {
    seed = seedInput;
  } else if (typeof seedInput === 'string') {
    for (let i = 0; i < seedInput.length; i++) {
      seed = (seed << 5) - seed + seedInput.charCodeAt(i);
      seed |= 0;
    }
  }
  if (seed === 0) seed = 123456789;

  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class SimplexNoise2D {
  constructor(randomFn) {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = Math.floor(randomFn() * 256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = (this.perm[i] % 12);
    }
  }

  noise2D(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const grad3 = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];

    let n0 = 0, n1 = 0, n2 = 0;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj]];
      n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

export const BIOME_PALETTES = {
  terrestrial: {
    abyssal: '#020617',
    deepOcean: '#0f172a',
    ocean: '#1d4ed8',
    shallowWater: '#3b82f6',
    beach: '#d97706',
    grass: '#15803d',
    forest: '#047857',
    hills: '#3f6212',
    mountain: '#4b5563',
    highPeaks: '#334155',
    snow: '#f8fafc',
    river: '#60a5fa'
  },
  scifi: {
    abyssal: '#030712',
    deepOcean: '#050b14',
    ocean: '#0284c7',
    shallowWater: '#38bdf8',
    beach: '#c026d3',
    grass: '#059669',
    forest: '#0d9488',
    hills: '#0f766e',
    mountain: '#475569',
    highPeaks: '#334155',
    snow: '#e0f2fe',
    river: '#818cf8'
  },
  volcanic: {
    abyssal: '#050505',
    deepOcean: '#09090b',
    ocean: '#451a03',
    shallowWater: '#78350f',
    beach: '#9a3412',
    grass: '#b45309',
    forest: '#c2410c',
    hills: '#881337',
    mountain: '#3f3f46',
    highPeaks: '#27272a',
    snow: '#71717a',
    river: '#ef4444'
  },
  glacial: {
    abyssal: '#032b43',
    deepOcean: '#0c4a6e',
    ocean: '#0284c7',
    shallowWater: '#38bdf8',
    beach: '#7dd3fc',
    grass: '#0284c7',
    forest: '#0f766e',
    hills: '#155e75',
    mountain: '#64748b',
    highPeaks: '#475569',
    snow: '#ffffff',
    river: '#a5f3fc'
  }
};

export function generateLandmassGrid(options) {
  const {
    algorithm = 'simplex',
    seed = 'StoryFoundry',
    width = 300,
    height = 225,
    oceanLevel = 45,
    scale = 80,
    octaves = 8,
    roughness = 0.5,
    climateBias = 0,
    erosionPasses = 2,
    enableFalloff = true,
    enableRivers = true,
    enableDomainWarp = true,
    paletteKey = 'terrestrial'
  } = options;

  const rng = createPRNG(seed);
  const simplex = new SimplexNoise2D(rng);
  const grid = new Float32Array(width * height);
  const isRiverGrid = new Uint8Array(width * height);

  const seaLevelThreshold = oceanLevel / 100;

  // Step 1: Multi-Octave Noise with Domain Warping
  if (algorithm === 'simplex') {
    const scaleFactor = Math.max(5, scale);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sampleX = x;
        let sampleY = y;

        if (enableDomainWarp) {
          const warpAmp = 18;
          const warpX = simplex.noise2D(x * 0.008 + 12.3, y * 0.008 + 45.6) * warpAmp;
          const warpY = simplex.noise2D(x * 0.008 + 78.9, y * 0.008 + 32.1) * warpAmp;
          sampleX += warpX;
          sampleY += warpY;
        }

        let total = 0;
        let frequency = 1 / scaleFactor;
        let amplitude = 1;
        let maxValue = 0;

        for (let o = 0; o < octaves; o++) {
          const sx = sampleX * frequency;
          const sy = sampleY * frequency;
          const val = (simplex.noise2D(sx, sy) + 1) / 2;
          total += val * amplitude;
          maxValue += amplitude;

          amplitude *= roughness;
          frequency *= 2.15;
        }

        let normHeight = total / maxValue;

        if (enableFalloff) {
          const nx = (x / width) * 2 - 1;
          const ny = (y / height) * 2 - 1;
          const distFromCenter = Math.sqrt(nx * nx + ny * ny);
          const falloff = Math.max(0, 1 - Math.pow(distFromCenter, 1.95));
          normHeight = normHeight * (0.2 + 0.8 * falloff);
        }

        grid[y * width + x] = normHeight;
      }
    }
  } else if (algorithm === 'cellular') {
    for (let i = 0; i < grid.length; i++) {
      grid[i] = rng() < (1 - seaLevelThreshold) ? 0.8 : 0.2;
    }

    const passes = Math.max(2, Math.min(10, octaves + 2));
    for (let p = 0; p < passes; p++) {
      const copy = new Float32Array(grid);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let wallCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (copy[(y + dy) * width + (x + dx)] > 0.5) wallCount++;
            }
          }
          grid[y * width + x] = wallCount >= 5 ? 0.8 : 0.2;
        }
      }
    }
  } else if (algorithm === 'voronoi') {
    const numPoints = Math.max(10, Math.floor(scale / 2.5));
    const points = [];
    for (let p = 0; p < numPoints; p++) {
      points.push({
        x: rng() * width,
        y: rng() * height,
        height: rng()
      });
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let minDist1 = Infinity, minDist2 = Infinity;
        let closestPoint = points[0];

        for (let i = 0; i < points.length; i++) {
          const dx = points[i].x - x;
          const dy = points[i].y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist1) {
            minDist2 = minDist1;
            minDist1 = dist;
            closestPoint = points[i];
          } else if (dist < minDist2) {
            minDist2 = dist;
          }
        }

        const boundaryDist = (minDist2 - minDist1) / scale;
        grid[y * width + x] = Math.min(1, closestPoint.height * 0.7 + boundaryDist * 0.5);
      }
    }
  }

  // Step 2: Hydraulic Erosion Passes
  for (let ep = 0; ep < erosionPasses; ep++) {
    const copy = new Float32Array(grid);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const avg = (
          copy[(y - 1) * width + x] +
          copy[(y + 1) * width + x] +
          copy[y * width + (x - 1)] +
          copy[y * width + (x + 1)] +
          copy[y * width + x] * 2
        ) / 6;
        grid[y * width + x] = avg;
      }
    }
  }

  // Step 3: Procedural River Networks
  if (enableRivers) {
    const numRivers = Math.max(3, Math.floor(width / 20));
    for (let r = 0; r < numRivers; r++) {
      let rx = Math.floor(rng() * (width - 6)) + 3;
      let ry = Math.floor(rng() * (height - 6)) + 3;

      if (grid[ry * width + rx] > seaLevelThreshold + 0.18) {
        for (let step = 0; step < 180; step++) {
          isRiverGrid[ry * width + rx] = 1;
          if (grid[ry * width + rx] <= seaLevelThreshold) break;

          let lowestVal = grid[ry * width + rx];
          let nextX = rx, nextY = ry;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = rx + dx;
              const ny = ry + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nval = grid[ny * width + nx];
                if (nval < lowestVal) {
                  lowestVal = nval;
                  nextX = nx;
                  nextY = ny;
                }
              }
            }
          }

          if (nextX === rx && nextY === ry) break;
          rx = nextX;
          ry = nextY;
        }
      }
    }
  }

  // Step 4: 12-Tier Biome Classification
  const palette = BIOME_PALETTES[paletteKey] || BIOME_PALETTES.terrestrial;
  const climateOffset = climateBias / 200;

  const getBiome = (val, x, y) => {
    if (isRiverGrid[y * width + x]) {
      return { type: 'river', color: palette.river, isWater: true, isRiver: true };
    }

    if (val < seaLevelThreshold - 0.18) return { type: 'abyssal', color: palette.abyssal, isWater: true };
    if (val < seaLevelThreshold - 0.06) return { type: 'deepOcean', color: palette.deepOcean, isWater: true };
    if (val < seaLevelThreshold) return { type: 'ocean', color: palette.ocean, isWater: true };
    if (val < seaLevelThreshold + 0.03) return { type: 'shallowWater', color: palette.shallowWater, isWater: true };
    if (val < seaLevelThreshold + 0.07) return { type: 'beach', color: palette.beach, isLand: true };

    const landVal = (val - seaLevelThreshold) / (1 - seaLevelThreshold);
    const adjustedVal = landVal + climateOffset;

    if (adjustedVal > 0.82) return { type: 'snow', color: palette.snow, isMountain: true };
    if (adjustedVal > 0.68) return { type: 'highPeaks', color: palette.highPeaks, isMountain: true };
    if (adjustedVal > 0.52) return { type: 'mountain', color: palette.mountain, isMountain: true };
    if (adjustedVal > 0.38) return { type: 'hills', color: palette.hills, isLand: true };
    if (adjustedVal > 0.20) return { type: 'forest', color: palette.forest, isVegetation: true };
    return { type: 'grass', color: palette.grass, isLand: true };
  };

  return {
    width,
    height,
    grid,
    seaLevelThreshold,
    getBiome,
    paletteKey
  };
}

export function smoothPointsChaikin(pts, iterations = 2) {
  if (!pts || pts.length < 6) return pts;
  let current = pts;
  for (let it = 0; it < iterations; it++) {
    const next = [];
    const len = current.length;
    for (let i = 0; i < len; i += 2) {
      const x1 = current[i];
      const y1 = current[i + 1];
      const nextIdx = (i + 2) % len;
      const x2 = current[nextIdx];
      const y2 = current[nextIdx + 1];

      const qx = 0.75 * x1 + 0.25 * x2;
      const qy = 0.75 * y1 + 0.25 * y2;
      const rx = 0.25 * x1 + 0.75 * x2;
      const ry = 0.25 * y1 + 0.75 * y2;

      next.push(qx, qy, rx, ry);
    }
    current = next;
  }
  return current;
}

export function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function quantizePaletteColors(imgData, paletteRgbList) {
  const data = imgData.data;
  const numColors = paletteRgbList.length;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let minDist = Infinity;
    let bestR = r, bestG = g, bestB = b;

    for (let c = 0; c < numColors; c++) {
      const pr = paletteRgbList[c][0];
      const pg = paletteRgbList[c][1];
      const pb = paletteRgbList[c][2];

      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const dist = dr * dr + dg * dg + db * db;

      if (dist < minDist) {
        minDist = dist;
        bestR = pr;
        bestG = pg;
        bestB = pb;
        if (dist === 0) break;
      }
    }

    data[i] = bestR;
    data[i + 1] = bestG;
    data[i + 2] = bestB;
  }
}

export function convertGridToKonvaElements(gridData, options) {
  const {
    stageWidth = 4000,
    stageHeight = 3000,
    scatterDensity = 50,
    seed = 'StoryFoundry',
    renderMode = 'organic' // 'organic' (default smooth vector) or 'hex' (discrete hex grid)
  } = options;

  const { width, height, grid, getBiome } = gridData;
  const cellW = stageWidth / width;
  const cellH = stageHeight / height;
  const rng = createPRNG(seed + '_objects');

  const terrains = [];
  const objects = [];

  if (renderMode === 'hex') {
    // Discrete Hex Tile Grid Rendering
    const hexRadius = Math.max(8, cellW * 0.9);
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    // Step across hex grid coordinates
    const gridCols = Math.floor(stageWidth / hexWidth);
    const gridRows = Math.floor(stageHeight / (hexHeight * 0.75));

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        let posX = c * hexWidth + hexWidth / 2;
        if (r % 2 !== 0) posX += hexWidth / 2;
        let posY = r * hexHeight * 0.75 + hexRadius;

        // Map stage pos back to grid heightmap index
        const gx = Math.min(width - 1, Math.max(0, Math.floor((posX / stageWidth) * width)));
        const gy = Math.min(height - 1, Math.max(0, Math.floor((posY / stageHeight) * height)));
        const val = grid[gy * width + gx];
        const biome = getBiome(val, gx, gy);

        terrains.push({
          id: `hex_tile_${r}_${c}_` + Math.random().toString(36).substr(2, 4),
          renderType: 'hexTile',
          x: posX,
          y: posY,
          radius: hexRadius,
          color: biome.color,
          textureUrl: getBiomeTextureUrl(biome.type),
          biomeType: biome.type
        });

        // Sparse object scattering on hexes
        if (rng() < (scatterDensity / 100) * 0.12) {
          if (biome.isVegetation) {
            objects.push({
              id: 'obj_foliage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              x: posX,
              y: posY,
              type: 'foliageTreeTrunk',
              color: '#15803d',
              radius: Math.max(6, hexRadius * 0.5),
              shape: 'circle',
              hideLabel: true
            });
          } else if (biome.isMountain) {
            objects.push({
              id: 'obj_crag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              x: posX,
              y: posY,
              type: 'naturalBoulder',
              color: '#475569',
              radius: Math.max(6, hexRadius * 0.5),
              shape: 'hexagon',
              hideLabel: true
            });
          }
        }
      }
    }
  } else {
    // Organic Vector Contours (Default) - Bilinear Heightmap Interpolation (Smooth Curves + 100% Crisp Biome Colors, 0% Grey Borders)
    if (typeof document !== 'undefined') {
      const midWidth = Math.min(stageWidth, width * 5);
      const midHeight = Math.min(stageHeight, height * 5);

      const midCanvas = document.createElement('canvas');
      midCanvas.width = midWidth;
      midCanvas.height = midHeight;
      const mctx = midCanvas.getContext('2d');

      const imgData = mctx.createImageData(midWidth, midHeight);
      const data = imgData.data;

      // Color RGB cache
      const colorRgbCache = {};
      const getRgb = (hex) => {
        if (!colorRgbCache[hex]) colorRgbCache[hex] = hexToRgb(hex);
        return colorRgbCache[hex];
      };

      // Bilinear heightmap interpolation: evaluates smooth elevation & biome for every pixel directly
      const scaleX = (width - 1) / midWidth;
      const scaleY = (height - 1) / midHeight;

      for (let py = 0; py < midHeight; py++) {
        const gy = py * scaleY;
        const y0 = Math.floor(gy);
        const y1 = Math.min(height - 1, y0 + 1);
        const ty = gy - y0;
        const row0 = y0 * width;
        const row1 = y1 * width;

        for (let px = 0; px < midWidth; px++) {
          const gx = px * scaleX;
          const x0 = Math.floor(gx);
          const x1 = Math.min(width - 1, x0 + 1);
          const tx = gx - x0;

          // Bilinear heightmap interpolation
          const h00 = grid[row0 + x0];
          const h10 = grid[row0 + x1];
          const h01 = grid[row1 + x0];
          const h11 = grid[row1 + x1];

          const h0 = h00 + (h10 - h00) * tx;
          const h1 = h01 + (h11 - h01) * tx;
          const val = h0 + (h1 - h0) * ty;

          const biome = getBiome(val, Math.round(gx), Math.round(gy));
          const [r, g, b] = getRgb(biome.color);

          // Subtle micro-stipple texture grain (zero global wave ripples)
          let texMod = 0;
          const bType = biome.type || '';
          if (bType.includes('forest') || bType.includes('jungle')) {
            texMod = ((px * 13 + py * 29) % 7 < 3) ? 10 : -8;
          } else if (bType.includes('grass') || bType.includes('plains')) {
            texMod = ((px * 31 + py * 47) % 7 < 3) ? 8 : -6;
          } else if (bType.includes('mountain') || bType.includes('highPeaks') || bType.includes('crags')) {
            texMod = ((px * 19 + py * 37) % 5 < 2) ? 12 : -10;
          } else if (bType.includes('desert') || bType.includes('sand') || bType.includes('beach')) {
            texMod = ((px * 23 + py * 41) % 9 < 4) ? 7 : -5;
          } else if (bType.includes('volcanic') || bType.includes('lava')) {
            texMod = ((px * 17 + py * 31) % 6 < 3) ? 14 : -10;
          } else if (bType.includes('snow') || bType.includes('ice')) {
            texMod = ((px ^ py) % 9 === 0) ? 15 : -4;
          }

          const idx = (py * midWidth + px) * 4;
          data[idx] = Math.min(255, Math.max(0, Math.round(r + texMod)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(g + texMod)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(b + texMod)));
          data[idx + 3] = 255;
        }
      }

      mctx.putImageData(imgData, 0, 0);

      // Upscale crisp to stage dimensions
      const hiResCanvas = document.createElement('canvas');
      hiResCanvas.width = stageWidth;
      hiResCanvas.height = stageHeight;
      const hctx = hiResCanvas.getContext('2d');

      hctx.imageSmoothingEnabled = false;
      hctx.drawImage(midCanvas, 0, 0, stageWidth, stageHeight);

      const dataUrl = hiResCanvas.toDataURL('image/png');

      terrains.push({
        id: 'terrain_canvas_' + Date.now(),
        renderType: 'canvasImage',
        imageUrl: dataUrl,
        x: 0,
        y: 0,
        width: stageWidth,
        height: stageHeight,
        biomeType: 'organicMap'
      });

      // Moderate clean object scattering without text clutter
      for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 3) {
          const val = grid[y * width + x];
          const biome = getBiome(val, x, y);
          const densityFactor = scatterDensity / 100;

          if (rng() < 0.05 * densityFactor) {
            const objX = x * cellW + cellW / 2;
            const objY = y * cellH + cellH / 2;

            if (biome.isVegetation) {
              objects.push({
                id: 'obj_foliage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                x: objX,
                y: objY,
                type: 'foliageTreeTrunk',
                color: '#15803d',
                radius: Math.max(6, cellW * 0.8),
                shape: 'circle',
                hideLabel: true
              });
            } else if (biome.isMountain) {
              objects.push({
                id: 'obj_crag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                x: objX,
                y: objY,
                type: 'naturalBoulder',
                color: '#475569',
                radius: Math.max(6, cellW * 0.7),
                shape: 'hexagon',
                hideLabel: true
              });
            } else if (biome.type === 'beach' && rng() < 0.1 * densityFactor) {
              objects.push({
                id: 'obj_settlement_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                x: objX,
                y: objY,
                type: 'sprawlMegacity',
                label: 'Coastal Arcology',
                scaleTarget: 'Regional',
                imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity,
                color: '#0284c7',
                width: Math.max(20, cellW * 1.8),
                height: Math.max(20, cellH * 1.8),
                shape: 'hexagon'
              });
            }
          }
        }
      }
    }
  }

  return { terrains, objects };
}

