/**
 * @file PCGExecutor.ts
 * @description The PCG Script Executor Engine.
 * Translates structured LLM intent and PCG scripting directives into deterministic
 * spatial placements on the tactical battlemap canvas.
 */

import type { AssetUnit } from '../../schemas/assetUnitSchema.ts';
import { SemanticZoneMask, SemanticFlag } from './SemanticZoneMask.ts';
import { CollisionClearanceTester } from './CollisionClearanceTester.ts';

export interface ScriptDirective {
  action: 'place_central' | 'scatter' | 'place_hazard' | 'wall_perimeter';
  query_tags: string[];
  zone?: [number, number, number, number]; // [minCol, minRow, maxCol, maxRow]
  density?: number;                        // Desired coverage (0.01 to 0.5)
  limit?: number;                          // Maximum instances to place
  clearance?: number;                      // Minimum doorway clearance in cells
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
}

export interface ExecutionReport {
  success: boolean;
  totalPlaced: number;
  placedEntities: PlacedEntity[];
  atmosphere?: AtmosphereLightingDirective;
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
    const logs: string[] = [];

    let entityCounter = 0;

    for (const directive of scriptPayload.execute_scripts) {
      const zone = directive.zone || defaultZone;
      const candidates = this.filterCatalog(catalog, directive.query_tags);

      if (candidates.length === 0) {
        logs.push(`Warning: No assets matched query tags [${directive.query_tags.join(', ')}]`);
        continue;
      }

      switch (directive.action) {
        case 'place_central': {
          const unit = candidates[Math.floor(this.rng() * candidates.length)];
          const [uW, uH] = unit.dimensions;
          const [minC, minR, maxC, maxR] = zone;

          // Target center
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
              zIndexLayer: unit.vtt_properties.z_index_layer
            };
            placedEntities.push(entity);

            // Mark mask
            const flag = unit.vtt_properties.blocks_movement ? SemanticFlag.COVER : SemanticFlag.FLOOR;
            mask.fillRect(targetCol, targetRow, targetCol + uW - 1, targetRow + uH - 1, flag);
            logs.push(`Placed central ${unit.name} at (${targetCol}, ${targetRow})`);
          } else {
            logs.push(`Could not place central ${unit.name}: ${test.reason}`);
          }
          break;
        }

        case 'scatter': {
          const [minC, minR, maxC, maxR] = zone;
          const zoneArea = (maxC - minC + 1) * (maxR - minR + 1);
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

            // If avoid_center is true, bias coordinates towards boundaries
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
                zIndexLayer: unit.vtt_properties.z_index_layer
              });

              mask.fillRect(c, r, c + uW - 1, r + uH - 1, SemanticFlag.COVER);
              placedCount++;
            }
          }
          logs.push(`Scattered ${placedCount} entities across zone [${zone.join(', ')}]`);
          break;
        }

        case 'place_hazard': {
          const [minC, minR, maxC, maxR] = zone;
          const hazardUnits = candidates.filter(c => c.category === 'hazard' || c.vtt_properties.hazard);
          const unit = (hazardUnits.length > 0 ? hazardUnits : candidates)[0];
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
          const unit = wallUnits.length > 0 ? wallUnits[0] : candidates[0];

          let wallsPlaced = 0;

          const placeWallAt = (col: number, row: number) => {
            if (mask.hasFlag(col, row, SemanticFlag.DOORWAY)) return; // Keep doors open
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

          // Top and Bottom rows
          for (let c = minC; c <= maxC; c++) {
            placeWallAt(c, minR);
            placeWallAt(c, maxR);
          }
          // Left and Right columns
          for (let r = minR + 1; r < maxR; r++) {
            placeWallAt(minC, r);
            placeWallAt(maxC, r);
          }
          logs.push(`Constructed perimeter wall enclosure with ${wallsPlaced} segments`);
          break;
        }
      }
    }

    return {
      success: true,
      totalPlaced: placedEntities.length,
      placedEntities,
      atmosphere: scriptPayload.atmosphere_lighting,
      logs
    };
  }
}
