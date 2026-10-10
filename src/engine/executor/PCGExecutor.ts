/**
 * @file PCGExecutor.ts
 * @description The PCG Script Executor Engine.
 * Translates structured LLM intent and PCG scripting directives into deterministic
 * spatial placements on the tactical battlemap canvas.
 */

import type { AssetUnit } from '../../schemas/assetUnitSchema.ts';
import { SemanticZoneMask, SemanticFlag } from './SemanticZoneMask.ts';
import { CollisionClearanceTester } from './CollisionClearanceTester.ts';
import { PCGPromptAnalyzer } from './PCGPromptAnalyzer.ts';

export type ScriptAction =
  | 'place_central'
  | 'scatter'
  | 'place_hazard'
  | 'wall_perimeter'
  | 'inject_lights'
  | 'barricade_doors'
  | 'scorch_bulkheads'
  | 'scatter_cover'
  | 'scatter_clutter';

export interface ScriptDirective {
  action: ScriptAction;
  query_tags: string[];
  zone?: [number, number, number, number]; // [minCol, minRow, maxCol, maxRow]
  density?: number;                        // Desired coverage (0.01 to 0.5)
  limit?: number;                          // Maximum instances to place
  clearance?: number;                      // Minimum doorway clearance in cells
  // Extended high-specificity properties
  color?: string;
  radius?: number;
  animation?: 'steady' | 'flicker' | 'pulse';
  intensity?: number;
  doorType?: 'blast_door' | 'bulkhead' | 'airlock' | 'security';
  isBarricaded?: boolean;
  isLocked?: boolean;
  decalType?: 'carbon_scoring' | 'scorch' | 'breach' | 'debris';
}

export interface AtmosphereLightingDirective {
  ambient_color?: string;
  weather?: 'none' | 'sparks' | 'smoke' | 'acid_rain' | 'spores';
}

export interface LLMScriptPayload {
  atmosphere_lighting?: AtmosphereLightingDirective;
  execute_scripts: ScriptDirective[];
}

export interface PlacedEntity {
  id: string;
  unit_id: string;
  unit_name: string;
  category: string;
  col: number;
  row: number;
  width: number;
  height: number;
  rotationDegrees: number;
  scale: number;
  zIndexLayer: string;
  isHazard?: boolean;
  hazardDamage?: string;
  isCover?: boolean;
  coverRating?: 'half' | 'three_quarter' | 'full';
  isLight?: boolean;
  lightColor?: string;
  lightRadius?: number;
  lightAnimation?: 'steady' | 'flicker' | 'pulse';
  isDoor?: boolean;
  doorType?: string;
  isBarricaded?: boolean;
  isLocked?: boolean;
  isDecal?: boolean;
  decalType?: string;
}

export interface PlacedLightEmitter {
  col: number;
  row: number;
  color: string;
  radius: number;
  animation: 'steady' | 'flicker' | 'pulse';
  intensity: number;
}

export interface PlacedDoorSpecification {
  col: number;
  row: number;
  doorType: string;
  isBarricaded: boolean;
  isLocked: boolean;
}

export interface BulkheadScorchSpecification {
  col: number;
  row: number;
  decalType: string;
}

export interface ExecutionReport {
  success: boolean;
  totalPlaced: number;
  placedEntities: PlacedEntity[];
  atmosphere?: AtmosphereLightingDirective;
  lights: PlacedLightEmitter[];
  doors: PlacedDoorSpecification[];
  bulkheadScorches: BulkheadScorchSpecification[];
  logs: string[];
}

export class PCGExecutor {
  private rng: () => number;

  constructor(seed: number = 42) {
    this.rng = this.createPRNG(seed);
  }

  private createPRNG(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Filters the available asset catalog by matching tags or category.
   */
  public filterCatalog(catalog: AssetUnit[], tags: string[]): AssetUnit[] {
    if (!tags || tags.length === 0) return catalog;
    const lowerTags = tags.map(t => t.toLowerCase());

    const matches = catalog.filter(unit => {
      const unitCat = unit.category.toLowerCase();
      const unitTags = unit.tags.map(t => t.toLowerCase());
      const unitName = unit.name.toLowerCase();

      return lowerTags.some(tag => 
        unitCat.includes(tag) ||
        unitTags.some(ut => ut.includes(tag)) ||
        unitName.includes(tag)
      );
    });

    return matches.length > 0 ? matches : catalog;
  }

  /**
   * Analyzes a natural language prompt with high specificity and executes spatial directives.
   */
  public compileAndExecute(params: {
    prompt: string;
    catalog: AssetUnit[];
    mask: SemanticZoneMask;
    zone?: [number, number, number, number];
  }): ExecutionReport {
    const { prompt, catalog, mask, zone = [0, 0, mask.width - 1, mask.height - 1] } = params;
    const analysis = PCGPromptAnalyzer.analyze(prompt, zone);
    const report = this.execute({
      scriptPayload: analysis.payload,
      catalog,
      mask,
      defaultZone: zone
    });

    report.logs.unshift(...analysis.summary.map(s => `[Prompt Analysis] ${s}`));
    return report;
  }

  /**
   * Executes a complete batch of structured script directives against the stage.
   */
  public execute(params: {
    scriptPayload: LLMScriptPayload;
    catalog: AssetUnit[];
    mask: SemanticZoneMask;
    defaultZone?: [number, number, number, number];
  }): ExecutionReport {
    const { scriptPayload, catalog, mask, defaultZone = [0, 0, mask.width - 1, mask.height - 1] } = params;
    const placedEntities: PlacedEntity[] = [];
    const lights: PlacedLightEmitter[] = [];
    const doors: PlacedDoorSpecification[] = [];
    const bulkheadScorches: BulkheadScorchSpecification[] = [];
    const logs: string[] = [];

    let entityCounter = 0;

    for (const directive of scriptPayload.execute_scripts) {
      const zone = directive.zone || defaultZone;
      const candidates = this.filterCatalog(catalog, directive.query_tags);

      switch (directive.action) {
        case 'place_central': {
          if (candidates.length === 0) {
            logs.push(`Warning: No assets matched query tags [${directive.query_tags.join(', ')}]`);
            continue;
          }
          const unit = candidates[Math.floor(this.rng() * candidates.length)];
          const [uW, uH] = unit.dimensions;
          const [minC, minR, maxC, maxR] = zone;

          const targetCol = Math.floor((minC + maxC - uW + 1) / 2);
          const targetRow = Math.floor((minR + maxR - uH + 1) / 2);

          const clearance = directive.clearance ?? unit.scatter_rules?.clearance_radius_cells ?? 1;
          const test = CollisionClearanceTester.testPlacement(mask, targetCol, targetRow, uW, uH, {
            clearanceRadiusCells: clearance,
            allowHazardOverlap: false,
            allowCoverOverlap: false
          });

          if (test.allowed) {
            entityCounter++;
            const entity: PlacedEntity = {
              id: `entity_${entityCounter}_${unit.unit_id}`,
              unit_id: unit.unit_id,
              unit_name: unit.name,
              category: unit.category,
              col: targetCol,
              row: targetRow,
              width: uW,
              height: uH,
              rotationDegrees: 0,
              scale: 1.0,
              zIndexLayer: unit.vtt_properties.z_index_layer,
              isCover: true,
              coverRating: 'half'
            };
            placedEntities.push(entity);

            const flag = unit.vtt_properties.blocks_movement ? SemanticFlag.COVER : SemanticFlag.FLOOR;
            mask.fillRect(targetCol, targetRow, targetCol + uW - 1, targetRow + uH - 1, flag);
            logs.push(`Placed central ${unit.name} at (${targetCol}, ${targetRow})`);
          } else {
            logs.push(`Could not place central ${unit.name}: ${test.reason}`);
          }
          break;
        }

        case 'scatter':
        case 'scatter_cover':
        case 'scatter_clutter': {
          if (candidates.length === 0) {
            logs.push(`Warning: No assets matched query tags [${directive.query_tags.join(', ')}]`);
            continue;
          }
          const [minC, minR, maxC, maxR] = zone;
          const zoneArea = Math.max(1, (maxC - minC + 1) * (maxR - minR + 1));
          const density = directive.density ?? 0.08;
          const maxLimit = directive.limit ?? Math.max(1, Math.floor(zoneArea * density));

          let placedCount = 0;
          let attempts = 0;
          const maxAttempts = maxLimit * 15;

          while (placedCount < maxLimit && attempts < maxAttempts) {
            attempts++;
            const unit = candidates[Math.floor(this.rng() * candidates.length)];
            const [uW, uH] = unit.dimensions;

            let c: number;
            let r: number;

            if (unit.scatter_rules?.avoid_center) {
              const pickHorizontal = this.rng() > 0.5;
              if (pickHorizontal) {
                c = this.rng() > 0.5 ? minC : Math.max(minC, maxC - uW + 1);
                r = minR + Math.floor(this.rng() * (maxR - minR - uH + 2));
              } else {
                r = this.rng() > 0.5 ? minR : Math.max(minR, maxR - uH + 1);
                c = minC + Math.floor(this.rng() * (maxC - minC - uW + 2));
              }
            } else {
              c = minC + Math.floor(this.rng() * (maxC - minC - uW + 2));
              r = minR + Math.floor(this.rng() * (maxR - minR - uH + 2));
            }

            const clearance = directive.clearance ?? unit.scatter_rules?.clearance_radius_cells ?? 1;
            const test = CollisionClearanceTester.testPlacement(mask, c, r, uW, uH, {
              clearanceRadiusCells: clearance,
              allowHazardOverlap: false,
              allowCoverOverlap: false
            });

            if (test.allowed) {
              entityCounter++;
              let rotation = 0;
              if (unit.scatter_rules?.allow_rotation) {
                const rotations = [0, 90, 180, 270];
                rotation = rotations[Math.floor(this.rng() * rotations.length)];
              }

              let scale = 1.0;
              if (unit.scatter_rules?.scale_variance) {
                const [minScale, maxScale] = unit.scatter_rules.scale_variance;
                scale = Number((minScale + this.rng() * (maxScale - minScale)).toFixed(2));
              }

              const isCover = directive.action === 'scatter_cover' || unit.tags.some(t => t.includes('cover') || t.includes('barricade'));

              placedEntities.push({
                id: `entity_${entityCounter}_${unit.unit_id}`,
                unit_id: unit.unit_id,
                unit_name: unit.name,
                category: unit.category,
                col: c,
                row: r,
                width: uW,
                height: uH,
                rotationDegrees: rotation,
                scale,
                zIndexLayer: unit.vtt_properties.z_index_layer,
                isCover,
                coverRating: isCover ? 'half' : undefined
              });

              mask.fillRect(c, r, c + uW - 1, r + uH - 1, isCover ? SemanticFlag.COVER : SemanticFlag.FLOOR);
              placedCount++;
            }
          }
          logs.push(`Scattered ${placedCount} ${directive.action === 'scatter_cover' ? 'cover' : 'clutter'} entities across zone [${zone.join(', ')}]`);
          break;
        }

        case 'place_hazard': {
          const [minC, minR, maxC, maxR] = zone;
          const hazardUnits = candidates.filter(c => c.category === 'hazard' || c.vtt_properties.hazard);
          const unit = (hazardUnits.length > 0 ? hazardUnits : candidates)[0];
          if (!unit) continue;
          const [uW, uH] = unit.dimensions;

          const limit = directive.limit ?? 2;
          let placed = 0;
          let attempts = 0;

          while (placed < limit && attempts < limit * 10) {
            attempts++;
            const c = minC + Math.floor(this.rng() * (maxC - minC - uW + 2));
            const r = minR + Math.floor(this.rng() * (maxR - minR - uH + 2));

            const test = CollisionClearanceTester.testPlacement(mask, c, r, uW, uH, {
              clearanceRadiusCells: 1,
              allowHazardOverlap: false
            });

            if (test.allowed) {
              entityCounter++;
              placedEntities.push({
                id: `hazard_${entityCounter}_${unit.unit_id}`,
                unit_id: unit.unit_id,
                unit_name: unit.name,
                category: 'hazard',
                col: c,
                row: r,
                width: uW,
                height: uH,
                rotationDegrees: 0,
                scale: 1.0,
                zIndexLayer: unit.vtt_properties.z_index_layer,
                isHazard: true,
                hazardDamage: unit.vtt_properties.hazard?.damageFormula || '2d6 plasma'
              });

              mask.fillRect(c, r, c + uW - 1, r + uH - 1, SemanticFlag.HAZARD);
              placed++;
            }
          }
          logs.push(`Placed ${placed} hazard anomalies`);
          break;
        }

        case 'wall_perimeter': {
          const [minC, minR, maxC, maxR] = zone;
          const wallUnits = candidates.filter(c => c.category === 'wall_portal');
          const unit = wallUnits.length > 0 ? wallUnits[0] : (candidates[0] || { unit_id: 'wall_default', name: 'Bulkhead', category: 'wall_portal', vtt_properties: { z_index_layer: 'interactive_objects' } } as any);

          let wallsPlaced = 0;

          const placeWallAt = (col: number, row: number) => {
            if (mask.hasFlag(col, row, SemanticFlag.DOORWAY)) return;
            if (mask.hasFlag(col, row, SemanticFlag.WALL)) return;

            entityCounter++;
            placedEntities.push({
              id: `wall_${entityCounter}_${unit.unit_id}`,
              unit_id: unit.unit_id,
              unit_name: unit.name,
              category: 'wall_portal',
              col,
              row,
              width: 1,
              height: 1,
              rotationDegrees: 0,
              scale: 1.0,
              zIndexLayer: unit.vtt_properties.z_index_layer
            });
            mask.setFlag(col, row, SemanticFlag.WALL);
            wallsPlaced++;
          };

          for (let c = minC; c <= maxC; c++) {
            placeWallAt(c, minR);
            placeWallAt(c, maxR);
          }
          for (let r = minR + 1; r < maxR; r++) {
            placeWallAt(minC, r);
            placeWallAt(maxC, r);
          }
          logs.push(`Constructed perimeter wall enclosure with ${wallsPlaced} segments`);
          break;
        }

        // ────────────────────────────────────────────────────────────────────
        // HIGH PROMPT SPECIFICITY DIRECTIVES: LIGHTS, BARRICADED DOORS, SCORCH
        // ────────────────────────────────────────────────────────────────────

        case 'inject_lights': {
          const [minC, minR, maxC, maxR] = zone;
          const color = directive.color || '#f59e0b';
          const animation = directive.animation || 'steady';
          const radius = directive.radius || 3.5;
          const intensity = directive.intensity ?? 0.85;
          const limit = directive.limit || 5;

          // Find candidate walkable floor cells
          const candidateCells: Array<[number, number]> = [];
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (mask.hasFlag(c, r, SemanticFlag.FLOOR) && !mask.hasFlag(c, r, SemanticFlag.WALL) && !mask.hasFlag(c, r, SemanticFlag.FROZEN)) {
                candidateCells.push([c, r]);
              }
            }
          }

          if (candidateCells.length === 0) {
            logs.push('Could not inject luminaries: No valid floor cells in target zone');
            break;
          }

          let placedLights = 0;
          const placedCoords: Array<[number, number]> = [];

          // Sort or bias candidates near doorways or room center
          candidateCells.sort(() => this.rng() - 0.5);

          for (const [c, r] of candidateCells) {
            if (placedLights >= limit) break;

            // Maintain distance between placed luminaries
            const tooClose = placedCoords.some(([pc, pr]) => Math.hypot(c - pc, r - pr) < 3.5);
            if (tooClose && placedCoords.length > 0) continue;

            entityCounter++;
            placedEntities.push({
              id: `light_${entityCounter}`,
              unit_id: 'prop_tactical_luminary',
              unit_name: animation === 'flicker' ? 'Flickering Warning Luminary' : (animation === 'pulse' ? 'Pulsing Warning Strobe' : 'Tactical Luminary'),
              category: 'light',
              col: c,
              row: r,
              width: 1,
              height: 1,
              rotationDegrees: 0,
              scale: 1.0,
              zIndexLayer: 'dynamic_fx',
              isLight: true,
              lightColor: color,
              lightRadius: radius,
              lightAnimation: animation
            });

            lights.push({
              col: c,
              row: r,
              color,
              radius,
              animation,
              intensity
            });

            placedCoords.push([c, r]);
            placedLights++;
          }

          logs.push(`Injected ${placedLights} ${animation} luminaries [Color: ${color}, Radius: ${radius}]`);
          break;
        }

        case 'barricade_doors': {
          const [minC, minR, maxC, maxR] = zone;
          const doorType = directive.doorType || 'blast_door';
          const isBarricaded = directive.isBarricaded ?? true;
          const isLocked = directive.isLocked ?? true;
          const limit = directive.limit || 4;

          const doorwayCoords: Array<[number, number]> = [];

          // 1. Scan for explicit doorway flags
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (mask.hasFlag(c, r, SemanticFlag.DOORWAY)) {
                doorwayCoords.push([c, r]);
              }
            }
          }

          // 2. If no doorways explicitly flagged, detect chokepoints between walls
          if (doorwayCoords.length === 0) {
            for (let r = minR + 1; r < maxR; r++) {
              for (let c = minC + 1; c < maxC; c++) {
                if (mask.hasFlag(c, r, SemanticFlag.FLOOR)) {
                  const horizontalChoke = mask.hasFlag(c, r - 1, SemanticFlag.WALL) && mask.hasFlag(c, r + 1, SemanticFlag.WALL);
                  const verticalChoke = mask.hasFlag(c - 1, r, SemanticFlag.WALL) && mask.hasFlag(c + 1, r, SemanticFlag.WALL);
                  if (horizontalChoke || verticalChoke) {
                    doorwayCoords.push([c, r]);
                    mask.setFlag(c, r, SemanticFlag.DOORWAY);
                  }
                }
              }
            }
          }

          let doorsPlaced = 0;
          for (const [c, r] of doorwayCoords) {
            if (doorsPlaced >= limit) break;

            entityCounter++;
            placedEntities.push({
              id: `door_${entityCounter}`,
              unit_id: isBarricaded ? 'door_barricaded_blast_door' : 'door_security_bulkhead',
              unit_name: isBarricaded ? 'Barricaded Blast Door' : 'Reinforced Bulkhead Door',
              category: 'door',
              col: c,
              row: r,
              width: 1,
              height: 1,
              rotationDegrees: 0,
              scale: 1.0,
              zIndexLayer: 'interactive_objects',
              isDoor: true,
              doorType,
              isBarricaded,
              isLocked
            });

            doors.push({
              col: c,
              row: r,
              doorType,
              isBarricaded,
              isLocked
            });

            // If barricaded, also place physical cover right at or adjacent to the doorway inside
            if (isBarricaded) {
              const neighborOffsets = [[0, 1], [0, -1], [1, 0], [-1, 0]];
              for (const [dx, dy] of neighborOffsets) {
                const nc = c + dx;
                const nr = r + dy;
                if (mask.isInBounds(nc, nr) && mask.hasFlag(nc, nr, SemanticFlag.FLOOR) && !mask.hasFlag(nc, nr, SemanticFlag.COVER)) {
                  entityCounter++;
                  placedEntities.push({
                    id: `barricade_cover_${entityCounter}`,
                    unit_id: 'prop_tactical_barricade_01',
                    unit_name: 'Tactical Blast Barricade',
                    category: 'doodad',
                    col: nc,
                    row: nr,
                    width: 1,
                    height: 1,
                    rotationDegrees: dx !== 0 ? 90 : 0,
                    scale: 1.0,
                    zIndexLayer: 'interactive_objects',
                    isCover: true,
                    coverRating: 'three_quarter'
                  });
                  mask.setFlag(nc, nr, SemanticFlag.COVER);
                  break;
                }
              }
            }

            doorsPlaced++;
          }

          logs.push(`Configured ${doorsPlaced} ${doorType} portals (Barricaded: ${isBarricaded}, Locked: ${isLocked})`);
          break;
        }

        case 'scorch_bulkheads': {
          const [minC, minR, maxC, maxR] = zone;
          const decalType = directive.decalType || 'carbon_scoring';
          const limit = directive.limit || 8;

          // Find wall/bulkhead cells that share an edge with a walkable floor cell
          const bulkheadCandidates: Array<[number, number]> = [];
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (mask.hasFlag(c, r, SemanticFlag.WALL)) {
                const hasFloorNeighbor = (
                  (r > 0 && mask.hasFlag(c, r - 1, SemanticFlag.FLOOR)) ||
                  (r < mask.height - 1 && mask.hasFlag(c, r + 1, SemanticFlag.FLOOR)) ||
                  (c > 0 && mask.hasFlag(c - 1, r, SemanticFlag.FLOOR)) ||
                  (c < mask.width - 1 && mask.hasFlag(c + 1, r, SemanticFlag.FLOOR))
                );
                if (hasFloorNeighbor) {
                  bulkheadCandidates.push([c, r]);
                }
              }
            }
          }

          // If no wall cells found (e.g. cavern floor grid), target floor perimeter
          if (bulkheadCandidates.length === 0) {
            for (let r = minR; r <= maxR; r++) {
              for (let c = minC; c <= maxC; c++) {
                if (mask.hasFlag(c, r, SemanticFlag.FLOOR)) {
                  bulkheadCandidates.push([c, r]);
                }
              }
            }
          }

          bulkheadCandidates.sort(() => this.rng() - 0.5);

          let placedScorches = 0;
          for (const [c, r] of bulkheadCandidates) {
            if (placedScorches >= limit) break;

            entityCounter++;
            placedEntities.push({
              id: `scorch_${entityCounter}`,
              unit_id: 'decal_bulkhead_carbon_scoring_01',
              unit_name: decalType === 'carbon_scoring' ? 'Carbon Scoring on Bulkhead' : (decalType === 'breach' ? 'Structural Blast Breach' : 'Plasma Scorch Mark'),
              category: 'decal',
              col: c,
              row: r,
              width: 1,
              height: 1,
              rotationDegrees: Math.floor(this.rng() * 4) * 90,
              scale: Number((0.85 + this.rng() * 0.35).toFixed(2)),
              zIndexLayer: 'background_map',
              isDecal: true,
              decalType
            });

            bulkheadScorches.push({
              col: c,
              row: r,
              decalType
            });

            placedScorches++;
          }

          logs.push(`Applied ${placedScorches} ${decalType} markings along bulkheads`);
          break;
        }
      }
    }

    return {
      success: true,
      totalPlaced: placedEntities.length,
      placedEntities,
      atmosphere: scriptPayload.atmosphere_lighting,
      lights,
      doors,
      bulkheadScorches,
      logs
    };
  }

  /**
   * Applies execution report results directly to a tactical grid matrix.
   * Enables immediate tactile visual feedback on the in-studio canvas.
   */
  public static applyToTacticalGrid(
    grid: Array<Array<{
      isFloor: boolean;
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
      isLiquid?: boolean;
      liquidType?: 'magma' | 'acid' | 'water' | 'slime';
      isFrozen?: boolean;
    }>>,
    report: ExecutionReport
  ): typeof grid {
    const rows = grid.length;
    if (rows === 0) return grid;
    const cols = grid[0].length;

    // Clone grid
    const next = grid.map(row => row.map(cell => ({ ...cell })));

    // 1. Apply Doors
    for (const d of report.doors) {
      if (d.row >= 0 && d.row < rows && d.col >= 0 && d.col < cols) {
        if (!next[d.row][d.col].isFrozen) {
          next[d.row][d.col].isFloor = true;
          next[d.row][d.col].isDoor = true;
          next[d.row][d.col].doorType = d.doorType === 'airlock' ? 'airlock' : 'bulkhead';
          next[d.row][d.col].isBarricaded = d.isBarricaded;
        }
      }
    }

    // 2. Apply Lights
    for (const lt of report.lights) {
      if (lt.row >= 0 && lt.row < rows && lt.col >= 0 && lt.col < cols) {
        if (!next[lt.row][lt.col].isFrozen) {
          next[lt.row][lt.col].isLight = true;
          next[lt.row][lt.col].lightColor = lt.color;
          next[lt.row][lt.col].lightAnimation = lt.animation;
        }
      }
    }

    // 3. Apply Bulkhead Scorches
    for (const sc of report.bulkheadScorches) {
      if (sc.row >= 0 && sc.row < rows && sc.col >= 0 && sc.col < cols) {
        if (!next[sc.row][sc.col].isFrozen) {
          next[sc.row][sc.col].isBreach = true;
          next[sc.row][sc.col].isCarbonScoring = true;
        }
      }
    }

    // 4. Apply Placed Cover / Props
    for (const entity of report.placedEntities) {
      if (entity.isLight || entity.isDoor || entity.isDecal) continue;
      const r = entity.row;
      const c = entity.col;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        if (!next[r][c].isFrozen) {
          next[r][c].isProp = true;
          next[r][c].propName = entity.unit_name;
          next[r][c].propCategory = entity.isCover ? 'cover' : entity.category;
        }
      }
    }

    return next;
  }
}
