/**
 * @file MapContextAggregator.ts
 * @description Translates active stage state, rooms, semantic zones, and existing props into
 * token-efficient JSON and prompt matrices for LLM spatial scripting (Gemini 1.5/2.0).
 */

import { SemanticZoneMask } from '../executor/SemanticZoneMask.ts';

export interface RoomDefinition {
  id: string;
  minCol: number;
  minRow: number;
  maxCol: number;
  maxRow: number;
  roomType?: string;
  tags?: string[];
}

export interface PlacedItemStub {
  id: string;
  unit_id: string;
  col: number;
  row: number;
  tags?: string[];
}

export interface AggregatedRoomContext {
  id: string;
  bounds: [number, number, number, number]; // [minCol, minRow, maxCol, maxRow]
  type: string;
  area: number;
  zoneSummary: {
    floorCells: number;
    hazardCells: number;
    coverCells: number;
    wallCells: number;
    doorCells: number;
    frozenCells: number;
  };
  connectedDoors: Array<{ col: number; row: number; status?: string }>;
  existingItemCount: number;
}

export interface AggregatedMapContext {
  map_dimensions: [number, number];
  theme: string;
  totalRooms: number;
  rooms: AggregatedRoomContext[];
  globalHazardDensity: number;
  doors: Array<{ col: number; row: number; status?: string }>;
}

export class MapContextAggregator {
  /**
   * Aggregates the stage spatial state into structured contextual data.
   */
  public static aggregate(params: {
    width: number;
    height: number;
    theme?: string;
    rooms?: RoomDefinition[];
    doors?: Array<{ col: number; row: number; status?: string }>;
    mask: SemanticZoneMask;
    placedItems?: PlacedItemStub[];
  }): AggregatedMapContext {
    const {
      width,
      height,
      theme = 'Science Fantasy Installation',
      rooms = [],
      doors = [],
      mask,
      placedItems = []
    } = params;

    const aggregatedRooms: AggregatedRoomContext[] = rooms.map(room => {
      const summary = mask.getZoneSummary(room.minCol, room.minRow, room.maxCol, room.maxRow);
      const area = (room.maxCol - room.minCol + 1) * (room.maxRow - room.minRow + 1);

      // Detect doors touching or within 1 cell of this room
      const connectedDoors = doors.filter(d => 
        d.col >= room.minCol - 1 && d.col <= room.maxCol + 1 &&
        d.row >= room.minRow - 1 && d.row <= room.maxRow + 1
      );

      // Count items currently in this room
      const existingItems = placedItems.filter(item =>
        item.col >= room.minCol && item.col <= room.maxCol &&
        item.row >= room.minRow && item.row <= room.maxRow
      );

      return {
        id: room.id,
        bounds: [room.minCol, room.minRow, room.maxCol, room.maxRow],
        type: room.roomType || 'standard_chamber',
        area,
        zoneSummary: {
          floorCells: summary.floorCells,
          hazardCells: summary.hazardCells,
          coverCells: summary.coverCells,
          wallCells: summary.wallCells,
          doorCells: summary.doorCells,
          frozenCells: summary.frozenCells
        },
        connectedDoors,
        existingItemCount: existingItems.length
      };
    });

    const fullSummary = mask.getZoneSummary(0, 0, width - 1, height - 1);
    const globalHazardDensity = fullSummary.totalCells > 0
      ? Number((fullSummary.hazardCells / fullSummary.totalCells).toFixed(3))
      : 0;

    return {
      map_dimensions: [width, height],
      theme,
      totalRooms: aggregatedRooms.length,
      rooms: aggregatedRooms,
      globalHazardDensity,
      doors
    };
  }

  /**
   * Generates a token-optimized prompt for LLM decoration scripting.
   */
  public static buildSpatialPrompt(context: AggregatedMapContext, userIntent?: string): string {
    const jsonContext = JSON.stringify(context, null, 2);
    return `
You are the Tactical Interior Decorator and Spatial Scripting Engine for Tangent SF RP.
Your mission is to examine the provided tactical battlemap context and emit structured placement scripts to decorate, balance tactical cover, and set environmental ambiance.

Active Map Context:
${jsonContext}

User Directive:
${userIntent || 'Decorate the facility with appropriate tactical cover, interactive consoles, and thematic props.'}

Guidelines:
1. Provide appropriate lighting ambiance and weather effects.
2. Emit an array of "execute_scripts" targeting specific rooms or zones:
   - "place_central": For prominent centerpieces (consoles, holo-tables, reactors, generators).
   - "scatter": For tactical cover, crates, debris, or specimen canisters along edges or walls.
   - "place_hazard": For plasma breaches, acid pools, or radiation zones.
   - "wall_perimeter": For bulkheads or security partitions.
3. Use query_tags such as ["cover", "terminal", "machinery", "hazard", "tech", "crate"] to match the AssetUnit catalog.
`;
  }

  /**
   * Returns the canonical JSON Schema for Gemini structured output.
   */
  public static getStructuredResponseSchema(): object {
    return {
      type: 'object',
      properties: {
        atmosphere_lighting: {
          type: 'object',
          properties: {
            ambient_color: { type: 'string' },
            weather: { type: 'string', enum: ['none', 'sparks', 'smoke', 'acid_rain', 'spores'] }
          },
          required: ['ambient_color', 'weather']
        },
        execute_scripts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['place_central', 'scatter', 'place_hazard', 'wall_perimeter'] },
              query_tags: { type: 'array', items: { type: 'string' } },
              zone: { 
                type: 'array', 
                items: { type: 'number' },
                description: '[minCol, minRow, maxCol, maxRow] bounds' 
              },
              density: { type: 'number', description: 'Percentage coverage (0.05 to 0.4)' },
              limit: { type: 'number', description: 'Maximum items to place' }
            },
            required: ['action', 'query_tags']
          }
        }
      },
      required: ['atmosphere_lighting', 'execute_scripts']
    };
  }
}
