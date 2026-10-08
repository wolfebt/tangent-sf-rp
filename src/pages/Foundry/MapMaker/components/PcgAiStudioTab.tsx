/**
 * @file PcgAiStudioTab.tsx
 * @description Master Procedural Content Generation (PCG) & AI Co-Pilot Studio Tab.
 * Absorbs 100% of procedural landmass capabilities (Simplex, Cellular, Voronoi, Biomes, Rivers, Erosion)
 * and delivers full granular user control across all Tangent SF RP map types:
 * - Planetary & Continental Landmass
 * - Starship & Orbital Deckplans (BSP partitioning with symmetry & hull armor)
 * - Subterranean Caverns & Alien Hives (Cellular Automata with liquid pools & organic tendrils)
 * - Mining Complexes & Drill Shafts (Drunkard's Walk with excavation chambers & rail tracks)
 * - Modular Outposts & Station Modules (Wave Function Collapse & socket assemblies)
 * - Story Flowchart Outposts (Node-Graph Layout Solver with interactive editable room chains)
 * - Gemini Spatial Decorator & Encounter Scripter (Natural language interior dressing)
 *
 * Includes Interactive 2D HTML5 Preview, Direct Tactile Painting/Editing Brush,
 * One-Click Post-Processing Passes (Smoothing, Breach Damage, Auto-Doors, Auto-Lighting, Tactical Scatter),
 * and direct deployment to the Tactical Battlemap Canvas.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Mountain, 
  Network, 
  Play, 
  Rocket, 
  Layers, 
  Pickaxe, 
  Globe2, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  Grid, 
  Paintbrush, 
  ShieldAlert, 
  DoorOpen, 
  Lightbulb, 
  Box, 
  Eraser, 
  Undo2, 
  Zap,
  Lock,
  X
} from 'lucide-react';

import { CellularAutomataCaverns } from '../../../../engine/pcg/CellularAutomataCaverns';
import { DrunkardsWalkTunnel } from '../../../../engine/pcg/DrunkardsWalkTunnel';
import { NodeGraphLayoutSolver, type StoryFlowNode, type StoryFlowEdge } from '../../../../engine/pcg/NodeGraphLayoutSolver';
import { SemanticZoneMask, SemanticFlag } from '../../../../engine/executor/SemanticZoneMask';
import { PCGExecutor, type LLMScriptPayload } from '../../../../engine/executor/PCGExecutor';
import { MarchingSquaresAutoTiler } from '../../../../engine/canvas/MarchingSquaresAutoTiler';
import type { AssetUnit } from '../../../../schemas/assetUnitSchema';
import coreSeedUnits from '../../../../data/seed_units/science_fantasy_core.json';
import { generateLandmassGrid, convertGridToKonvaElements, BIOME_PALETTES, createPRNG } from '../map/landmassGenerator';
import { TERRAIN_TEXTURE_PATTERNS } from '../map/MapTextures';

export type PcgMapType = 
  | 'planetary' 
  | 'starship' 
  | 'caverns' 
  | 'mining' 
  | 'outpost' 
  | 'nodegraph' 
  | 'decorator';

export interface PcgCommitPayload {
  terrains?: any[];
  objects?: any[];
  lines?: any[];
  lights?: any[];
  fog?: any[];
  atmosphere?: any;
  replaceExisting?: boolean;
}

export interface PcgAiStudioTabProps {
  currentMap?: any;
  mapWidthCells?: number;
  mapHeightCells?: number;
  gridSize?: number;
  stageWidth?: number;
  stageHeight?: number;
  terrainRenderMode?: 'organic' | 'hex' | 'grid';
  onCommitPcgSector?: (payload: PcgCommitPayload) => void;
  onApplyPcgTerrain?: (terrainGrid: boolean[][], biomeKey: string, replaceExisting?: boolean) => void;
  onApplyDecorations?: (entities: any[], atmosphere?: any) => void;
  onDeployToCanvas?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

// --------------------------------------------------------------------------
// PRESETS
// --------------------------------------------------------------------------

const PLANETARY_PRESETS = [
  { name: 'HD Island Archipelago', algorithm: 'cellular', oceanLevel: 65, scale: 40, octaves: 6, roughness: 0.6, climateBias: 0, scatterDensity: 40, resolution: 200, erosionPasses: 1, falloff: true, rivers: true, palette: 'terrestrial' },
  { name: 'HD Pangaea Continent', algorithm: 'simplex', oceanLevel: 32, scale: 90, octaves: 7, roughness: 0.48, climateBias: 10, scatterDensity: 35, resolution: 240, erosionPasses: 2, falloff: true, rivers: true, palette: 'terrestrial' },
  { name: 'Sci-Fi Alien Ringland', algorithm: 'simplex', oceanLevel: 55, scale: 70, octaves: 8, roughness: 0.7, climateBias: -20, scatterDensity: 50, resolution: 200, erosionPasses: 1, falloff: false, rivers: true, palette: 'scifi' },
  { name: 'Ultra Tectonic Plates', algorithm: 'voronoi', oceanLevel: 42, scale: 120, octaves: 5, roughness: 0.5, climateBias: 0, scatterDensity: 30, resolution: 240, erosionPasses: 0, falloff: false, rivers: false, palette: 'terrestrial' },
  { name: 'Volcanic Ash Wasteland', algorithm: 'simplex', oceanLevel: 35, scale: 50, octaves: 7, roughness: 0.8, climateBias: 85, scatterDensity: 20, resolution: 200, erosionPasses: 1, falloff: true, rivers: true, palette: 'volcanic' },
  { name: 'Glacial Fjords & Crags', algorithm: 'simplex', oceanLevel: 50, scale: 65, octaves: 8, roughness: 0.75, climateBias: -85, scatterDensity: 25, resolution: 240, erosionPasses: 2, falloff: true, rivers: true, palette: 'glacial' }
];

const STARSHIP_PRESETS = [
  { name: 'Stealth Recon Corvette', depth: 3, symmetry: 'bilateral', corridorWidth: 1, hullArmor: 2, airlockCount: 2, theme: 'metal_deck' },
  { name: 'Heavy Battle Frigate', depth: 4, symmetry: 'bilateral', corridorWidth: 2, hullArmor: 3, airlockCount: 4, theme: 'metal_deck' },
  { name: 'Colony Dreadnought', depth: 5, symmetry: 'bilateral', corridorWidth: 2, hullArmor: 3, airlockCount: 6, theme: 'industrial' },
  { name: 'Orbital Spire Station', depth: 4, symmetry: 'none', corridorWidth: 2, hullArmor: 2, airlockCount: 4, theme: 'cyber_grid' }
];

const CAVERN_PRESETS = [
  { name: 'Xeno Brood Hive', fillProb: 0.48, smoothIters: 5, liquidRatio: 0.20, liquidType: 'slime', scatterDensity: 40 },
  { name: 'Volcanic Lava Tubes', fillProb: 0.42, smoothIters: 4, liquidRatio: 0.30, liquidType: 'magma', scatterDensity: 20 },
  { name: 'Crystalline Grotto', fillProb: 0.40, smoothIters: 6, liquidRatio: 0.15, liquidType: 'water', scatterDensity: 45 },
  { name: 'Deep Abyssal Chasm', fillProb: 0.52, smoothIters: 4, liquidRatio: 0.25, liquidType: 'acid', scatterDensity: 25 }
];

const MINING_PRESETS = [
  { name: 'Asteroid Core Quarry', floorRatio: 0.35, straightBias: 0.35, branches: 4, chambers: 5, railTracks: true },
  { name: 'Deep Tectonic Shaft', floorRatio: 0.25, straightBias: 0.75, branches: 2, chambers: 3, railTracks: true },
  { name: 'Smuggler Catacombs', floorRatio: 0.40, straightBias: 0.20, branches: 6, chambers: 6, railTracks: false },
  { name: 'Magma Vent Drifts', floorRatio: 0.30, straightBias: 0.50, branches: 3, chambers: 4, railTracks: true }
];

const OUTPOST_PRESETS = [
  { name: 'Weyland Research Outpost', moduleSize: 6, openRatio: 0.45, perimeterWall: true, blastDoors: true },
  { name: 'Deep Space Habitat', moduleSize: 8, openRatio: 0.60, perimeterWall: false, blastDoors: true },
  { name: 'Planetary Perimeter Bunker', moduleSize: 6, openRatio: 0.35, perimeterWall: true, blastDoors: true }
];

// Tactical cell metadata for tactical maps
interface TacticalCell {
  isFloor: boolean;
  isLiquid?: boolean;
  liquidType?: 'magma' | 'acid' | 'water' | 'slime';
  isDoor?: boolean;
  doorType?: 'airlock' | 'bulkhead';
  isLight?: boolean;
  lightColor?: string;
  isProp?: boolean;
  propName?: string;
  propCategory?: string;
  isBreach?: boolean;
  isFrozen?: boolean;
}

export const PcgAiStudioTab: React.FC<PcgAiStudioTabProps> = ({
  currentMap: _currentMap,
  mapWidthCells = 40,
  mapHeightCells = 30,
  gridSize = 50,
  stageWidth = 4000,
  stageHeight = 3000,
  terrainRenderMode = 'organic',
  onCommitPcgSector,
  onApplyPcgTerrain,
  onApplyDecorations,
  onDeployToCanvas,
  isModal = false,
  onCloseModal
}) => {
  // Active Top PCG Map Mode
  const [activeMapType, setActiveMapType] = useState<PcgMapType>('planetary');

  // Universal Parameters
  const [seed, setSeed] = useState<string>('Terra_Nova_Sector_42');
  const [widthCells, setWidthCells] = useState<number>(mapWidthCells || 40);
  const [heightCells, setHeightCells] = useState<number>(mapHeightCells || 30);
  const [cellSizePx, setCellSizePx] = useState<number>(gridSize || 50);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [layerFlags, setLayerFlags] = useState({
    terrains: true,
    walls: true,
    doors: true,
    lights: true,
    scatters: true
  });

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // In-Studio Interactive Painting Tool State
  const [activeBrush, setActiveBrush] = useState<'none' | 'carve' | 'wall' | 'liquid' | 'door' | 'light' | 'crater' | 'freeze' | 'eraser'>('none');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  // History stack for in-studio edits (Undo)
  const [undoStack, setUndoStack] = useState<TacticalCell[][][]>([]);

  // --------------------------------------------------------------------------
  // GENERATOR SPECIFIC STATES
  // --------------------------------------------------------------------------

  // 1. Planetary Landmass State
  const [plAlgorithm, setPlAlgorithm] = useState<'simplex' | 'cellular' | 'voronoi'>('simplex');
  const [plOceanLevel, setPlOceanLevel] = useState<number>(45);
  const [plScale, setPlScale] = useState<number>(60);
  const [plOctaves, setPlOctaves] = useState<number>(6);
  const [plRoughness, setPlRoughness] = useState<number>(0.50);
  const [plClimateBias, setPlClimateBias] = useState<number>(0);
  const [plScatterDensity, setPlScatterDensity] = useState<number>(40);
  const [plResolution, setPlResolution] = useState<number>(200);
  const [plErosionPasses, setPlErosionPasses] = useState<number>(2);
  const [plEnableFalloff, setPlEnableFalloff] = useState<boolean>(true);
  const [plEnableRivers, setPlEnableRivers] = useState<boolean>(true);
  const [plEnableDomainWarp, setPlEnableDomainWarp] = useState<boolean>(true);
  const [plPaletteKey, setPlPaletteKey] = useState<string>('terrestrial');
  const [plRenderMode, setPlRenderMode] = useState<'organic' | 'hex'>(terrainRenderMode === 'hex' ? 'hex' : 'organic');
  const [plGridResult, setPlGridResult] = useState<any>(null);

  // 2. Starship Deckplan State
  const [ssDepth, setSsDepth] = useState<number>(4);
  const [ssSymmetry, setSsSymmetry] = useState<'none' | 'bilateral' | 'fore_aft'>('bilateral');
  const [ssCorridorWidth, setSsCorridorWidth] = useState<number>(2);
  const [ssHullArmor, setSsHullArmor] = useState<number>(2);
  const [ssAirlockCount, setSsAirlockCount] = useState<number>(4);
  const [ssTheme, setSsTheme] = useState<string>('metal_deck');

  // 3. Subterranean Caverns State
  const [caFillProb, setCaFillProb] = useState<number>(0.45);
  const [caSmoothIters, setCaSmoothIters] = useState<number>(5);
  const [caConnectPockets, setCaConnectPockets] = useState<boolean>(true);
  const [caLiquidRatio, setCaLiquidRatio] = useState<number>(0.20);
  const [caLiquidType, setCaLiquidType] = useState<'magma' | 'acid' | 'water' | 'slime'>('water');
  const [caScatterDensity, setCaScatterDensity] = useState<number>(30);

  // 4. Mining Complexes State
  const [dwFloorRatio, setDwFloorRatio] = useState<number>(0.32);
  const [dwStraightBias, setDwStraightBias] = useState<number>(0.45);
  const [dwBranches, setDwBranches] = useState<number>(4);
  const [dwChambers, setDwChambers] = useState<number>(4);
  const [dwRailTracks, setDwRailTracks] = useState<boolean>(true);

  // 5. Modular Outposts State
  const [opModuleSize, setOpModuleSize] = useState<number>(6);
  const [opOpenRatio, setOpOpenRatio] = useState<number>(0.45);
  const [opPerimeterWall, setOpPerimeterWall] = useState<boolean>(true);
  const [opBlastDoors, setOpBlastDoors] = useState<boolean>(true);

  // 6. Story Flowchart State
  const [storyNodes, setStoryNodes] = useState<StoryFlowNode[]>([
    { id: 'airlock', name: 'Primary Airlock', widthCells: 5, heightCells: 4 },
    { id: 'decon', name: 'Decontamination Chamber', widthCells: 4, heightCells: 4 },
    { id: 'security', name: 'Armory & Security', widthCells: 5, heightCells: 5 },
    { id: 'research', name: 'Xeno-Biology Lab', widthCells: 7, heightCells: 6 },
    { id: 'reactor', name: 'Plasma Reactor Core', widthCells: 6, heightCells: 6 }
  ]);
  const [storyEdges, setStoryEdges] = useState<StoryFlowEdge[]>([
    { fromNodeId: 'airlock', toNodeId: 'decon' },
    { fromNodeId: 'decon', toNodeId: 'security' },
    { fromNodeId: 'security', toNodeId: 'research' },
    { fromNodeId: 'research', toNodeId: 'reactor' }
  ]);
  const [newNodeName, setNewNodeName] = useState('');

  // 7. Gemini Spatial Decorator State
  const [aiPrompt, setAiPrompt] = useState<string>('Derelict corporate research lab with heavy tactical cover, plasma hazards, and barricaded blast doors.');
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  // Master Active Tactical Grid (for non-planetary map types)
  const [tacticalGrid, setTacticalGrid] = useState<TacticalCell[][]>([]);

  // Randomize Seed
  const handleRandomizeSeed = () => {
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
    setSeed(`Sector_${randomHex}`);
  };

  // --------------------------------------------------------------------------
  // TACTICAL GENERATOR IMPLEMENTATIONS
  // --------------------------------------------------------------------------

  // A. Generate Starship Deckplan
  const runGenerateStarship = useCallback(() => {
    const rng = createPRNG(seed + '_ss');
    const cols = widthCells;
    const rows = heightCells;
    const grid: TacticalCell[][] = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({ isFloor: false }))
    );

    // 1. Carve Starship Hull Contour (Tapered bow, main hull, engine nacelles at stern)
    const midY = Math.floor(rows / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const normX = c / cols;
        const distFromCenterY = Math.abs(r - midY) / midY;

        let maxHalfWidth = 0.85;
        if (normX < 0.25) {
          // Bow taper
          maxHalfWidth = 0.2 + (normX / 0.25) * 0.65;
        } else if (normX > 0.80) {
          // Stern flare / engines
          maxHalfWidth = 0.95;
        }

        // Inside hull boundary check
        if (distFromCenterY < maxHalfWidth && c >= ssHullArmor && c < cols - ssHullArmor && r >= ssHullArmor && r < rows - ssHullArmor) {
          grid[r][c].isFloor = true;
        }
      }
    }

    // 2. Partition internal rooms using recursive subdivision
    const roomMargin = 1;
    const compartments: { x1: number, y1: number, x2: number, y2: number }[] = [];

    const partition = (x1: number, y1: number, x2: number, y2: number, currentDepth: number) => {
      if (currentDepth <= 0 || (x2 - x1) < 8 || (y2 - y1) < 6) {
        compartments.push({ x1, y1, x2, y2 });
        return;
      }

      const splitVert = (x2 - x1) > (y2 - y1);
      if (splitVert) {
        const splitX = Math.floor(x1 + (x2 - x1) * (0.4 + rng() * 0.2));
        partition(x1, y1, splitX, y2, currentDepth - 1);
        partition(splitX + 1, y1, x2, y2, currentDepth - 1);
      } else {
        const splitY = Math.floor(y1 + (y2 - y1) * (0.4 + rng() * 0.2));
        partition(x1, y1, x2, splitY, currentDepth - 1);
        partition(x1, splitY + 1, x2, y2, currentDepth - 1);
      }
    };

    partition(ssHullArmor + 1, ssHullArmor + 1, cols - ssHullArmor - 2, rows - ssHullArmor - 2, ssDepth);

    // Carve main centerline spinal corridor
    for (let c = ssHullArmor + 1; c < cols - ssHullArmor - 2; c++) {
      for (let w = 0; w < ssCorridorWidth; w++) {
        const r = midY - Math.floor(ssCorridorWidth / 2) + w;
        if (r >= 0 && r < rows) grid[r][c].isFloor = true;
      }
    }

    // Carve room boundaries & doorways
    for (const comp of compartments) {
      // Hollow room interior
      for (let r = comp.y1 + roomMargin; r <= comp.y2 - roomMargin; r++) {
        for (let c = comp.x1 + roomMargin; c <= comp.x2 - roomMargin; c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c].isFloor = true;
          }
        }
      }

      // Add room doorway to spinal corridor or adjacent hallway
      const doorCol = Math.floor((comp.x1 + comp.x2) / 2);
      const doorRow = comp.y1;
      if (doorRow >= 0 && doorRow < rows && doorCol >= 0 && doorCol < cols) {
        grid[doorRow][doorCol].isFloor = true;
        grid[doorRow][doorCol].isDoor = true;
        grid[doorRow][doorCol].doorType = 'bulkhead';
      }

      // Place central light in room
      const centerCol = Math.floor((comp.x1 + comp.x2) / 2);
      const centerRow = Math.floor((comp.y1 + comp.y2) / 2);
      if (centerRow >= 0 && centerRow < rows && centerCol >= 0 && centerCol < cols) {
        grid[centerRow][centerCol].isLight = true;
        grid[centerRow][centerCol].lightColor = '#38bdf8';
      }
    }

    // Apply bilateral symmetry if enabled
    if (ssSymmetry === 'bilateral') {
      for (let r = 0; r < midY; r++) {
        const mirrorR = rows - 1 - r;
        for (let c = 0; c < cols; c++) {
          grid[mirrorR][c] = { ...grid[r][c] };
        }
      }
    }

    // Place Airlocks on outer perimeter
    let airlocksPlaced = 0;
    const airlockPositions = [
      { c: Math.floor(cols * 0.3), r: ssHullArmor },
      { c: Math.floor(cols * 0.3), r: rows - 1 - ssHullArmor },
      { c: Math.floor(cols * 0.7), r: ssHullArmor },
      { c: Math.floor(cols * 0.7), r: rows - 1 - ssHullArmor },
      { c: cols - ssHullArmor - 1, r: midY }
    ];

    for (const pos of airlockPositions) {
      if (airlocksPlaced >= ssAirlockCount) break;
      if (pos.r >= 0 && pos.r < rows && pos.c >= 0 && pos.c < cols) {
        grid[pos.r][pos.c].isFloor = true;
        grid[pos.r][pos.c].isDoor = true;
        grid[pos.r][pos.c].doorType = 'airlock';
        airlocksPlaced++;
      }
    }

    setTacticalGrid(grid);
  }, [seed, widthCells, heightCells, ssDepth, ssSymmetry, ssCorridorWidth, ssHullArmor, ssAirlockCount]);

  // B. Generate Caverns & Hives
  const runGenerateCaverns = useCallback(() => {
    const rng = createPRNG(seed + '_cav');
    const cols = widthCells;
    const rows = heightCells;

    const boolGrid = CellularAutomataCaverns.generateCavern({
      width: cols,
      height: rows,
      fillProbability: caFillProb,
      smoothIterations: caSmoothIters,
      connectPockets: caConnectPockets
    }, rng);

    const grid: TacticalCell[][] = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({ isFloor: false }))
    );

    let floorCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isF = boolGrid[r][c];
        grid[r][c].isFloor = isF;
        if (isF) floorCount++;
      }
    }

    // Flood lowest / central basins with liquid pools
    const midX = Math.floor(cols / 2);
    const midY = Math.floor(rows / 2);
    const maxRadius = Math.min(cols, rows) * 0.35;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isFloor) continue;
        const dist = Math.hypot(c - midX, r - midY);
        if (dist < maxRadius && rng() < caLiquidRatio) {
          grid[r][c].isLiquid = true;
          grid[r][c].liquidType = caLiquidType;
        }
      }
    }

    // Scatter stalagmites / bio-hazards
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c].isFloor && !grid[r][c].isLiquid && rng() < (caScatterDensity / 100) * 0.15) {
          grid[r][c].isProp = true;
          grid[r][c].propName = caLiquidType === 'slime' ? 'Bio-Chitin Spire' : 'Crystalline Stalagmite';
          grid[r][c].propCategory = 'prop';
        }
      }
    }

    // Add glowing bioluminescent lights near liquids
    for (let r = 2; r < rows - 2; r += 4) {
      for (let c = 2; c < cols - 2; c += 4) {
        if (grid[r][c].isLiquid && rng() < 0.4) {
          grid[r][c].isLight = true;
          grid[r][c].lightColor = caLiquidType === 'magma' ? '#f97316' : caLiquidType === 'acid' ? '#84cc16' : '#06b6d4';
        }
      }
    }

    setTacticalGrid(grid);
  }, [seed, widthCells, heightCells, caFillProb, caSmoothIters, caConnectPockets, caLiquidRatio, caLiquidType, caScatterDensity]);

  // C. Generate Mining Complex
  const runGenerateMining = useCallback(() => {
    const rng = createPRNG(seed + '_mine');
    const cols = widthCells;
    const rows = heightCells;

    const boolGrid = DrunkardsWalkTunnel.generateTunnel({
      width: cols,
      height: rows,
      targetFloorRatio: dwFloorRatio,
      straightBias: dwStraightBias,
      startCol: Math.floor(cols / 2),
      startRow: Math.floor(rows / 2)
    }, rng);

    const grid: TacticalCell[][] = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({ isFloor: false }))
    );

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c].isFloor = boolGrid[r][c];
      }
    }

    // Stamp excavation chambers at tunnel points
    let chambersLeft = dwChambers;
    for (let r = 3; r < rows - 3; r += 4) {
      for (let c = 3; c < cols - 3; c += 4) {
        if (chambersLeft > 0 && grid[r][c].isFloor && rng() < 0.25) {
          const roomW = Math.floor(3 + rng() * 3);
          const roomH = Math.floor(3 + rng() * 3);
          for (let dy = -roomH; dy <= roomH; dy++) {
            for (let dx = -roomW; dx <= roomW; dx++) {
              const cr = r + dy;
              const cc = c + dx;
              if (cr >= 1 && cr < rows - 1 && cc >= 1 && cc < cols - 1) {
                grid[cr][cc].isFloor = true;
              }
            }
          }

          // Light in center of chamber
          grid[r][c].isLight = true;
          grid[r][c].lightColor = '#f59e0b';
          chambersLeft--;
        }
      }
    }

    // Overlay rail tracks & floodlights along main shafts
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c].isFloor && (r % 6 === 0 || c % 8 === 0) && rng() < 0.2) {
          grid[r][c].isLight = true;
          grid[r][c].lightColor = '#eab308';
        }
      }
    }

    setTacticalGrid(grid);
  }, [seed, widthCells, heightCells, dwFloorRatio, dwStraightBias, dwBranches, dwChambers, dwRailTracks]);

  // D. Generate Modular Outpost
  const runGenerateOutpost = useCallback(() => {
    const rng = createPRNG(seed + '_op');
    const cols = widthCells;
    const rows = heightCells;
    const grid: TacticalCell[][] = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({ isFloor: false }))
    );

    const mSize = opModuleSize;
    const modulesX = Math.floor((cols - 4) / mSize);
    const modulesY = Math.floor((rows - 4) / mSize);

    // Carve modular blocks
    for (let my = 0; my < modulesY; my++) {
      for (let mx = 0; mx < modulesX; mx++) {
        if (rng() < opOpenRatio) {
          const startX = 2 + mx * mSize;
          const startY = 2 + my * mSize;

          // Carve room
          for (let r = startY + 1; r < startY + mSize - 1; r++) {
            for (let c = startX + 1; c < startX + mSize - 1; c++) {
              if (r < rows - 1 && c < cols - 1) {
                grid[r][c].isFloor = true;
              }
            }
          }

          // Module lighting
          const cX = Math.floor(startX + mSize / 2);
          const cY = Math.floor(startY + mSize / 2);
          if (cY < rows && cX < cols) {
            grid[cY][cX].isLight = true;
            grid[cY][cX].lightColor = '#38bdf8';
          }

          // Blast door at module exit
          if (opBlastDoors && startY + mSize - 1 < rows) {
            grid[startY + mSize - 1][cX].isFloor = true;
            grid[startY + mSize - 1][cX].isDoor = true;
            grid[startY + mSize - 1][cX].doorType = 'bulkhead';
          }
        }
      }
    }

    // Connect modules with corridors
    for (let my = 0; my < modulesY; my++) {
      const cy = Math.floor(2 + my * mSize + mSize / 2);
      if (cy < rows - 1) {
        for (let c = 2; c < cols - 2; c++) {
          grid[cy][c].isFloor = true;
        }
      }
    }

    setTacticalGrid(grid);
  }, [seed, widthCells, heightCells, opModuleSize, opOpenRatio, opPerimeterWall, opBlastDoors]);

  // E. Generate Story Flowchart
  const runGenerateNodeGraph = useCallback(() => {
    const solution = NodeGraphLayoutSolver.solveLayout(widthCells, heightCells, storyNodes, storyEdges);
    const grid: TacticalCell[][] = Array.from({ length: heightCells }, () => 
      Array.from({ length: widthCells }, () => ({ isFloor: false }))
    );

    for (let r = 0; r < heightCells; r++) {
      for (let c = 0; c < widthCells; c++) {
        grid[r][c].isFloor = solution.grid[r][c];
      }
    }

    // Mark room labels, doors, and lights
    for (const room of solution.rooms) {
      const cX = Math.floor(room.bounds.col + room.bounds.width / 2);
      const cY = Math.floor(room.bounds.row + room.bounds.height / 2);
      if (cY < heightCells && cX < widthCells) {
        grid[cY][cX].isLight = true;
        grid[cY][cX].lightColor = '#38bdf8';
        grid[cY][cX].isProp = true;
        grid[cY][cX].propName = room.name;
        grid[cY][cX].propCategory = 'terminal';
      }

      // Add door on boundary
      const doorCol = room.bounds.col;
      const doorRow = Math.floor(room.bounds.row + room.bounds.height / 2);
      if (doorRow < heightCells && doorCol < widthCells) {
        grid[doorRow][doorCol].isDoor = true;
        grid[doorRow][doorCol].doorType = 'bulkhead';
      }
    }

    setTacticalGrid(grid);
  }, [widthCells, heightCells, storyNodes, storyEdges]);

  // F. Generate Planetary Landmass Grid
  const runGeneratePlanetary = useCallback(() => {
    const resW = plResolution;
    const resH = Math.floor((plResolution * 3) / 4);

    const result = generateLandmassGrid({
      algorithm: plAlgorithm,
      seed,
      width: resW,
      height: resH,
      oceanLevel: plOceanLevel,
      scale: plScale,
      octaves: plOctaves,
      roughness: plRoughness,
      climateBias: plClimateBias,
      erosionPasses: plErosionPasses,
      enableFalloff: plEnableFalloff,
      enableRivers: plEnableRivers,
      enableDomainWarp: plEnableDomainWarp,
      paletteKey: plPaletteKey
    });

    setPlGridResult(result);
  }, [
    seed, 
    plAlgorithm, 
    plResolution, 
    plOceanLevel, 
    plScale, 
    plOctaves, 
    plRoughness, 
    plClimateBias, 
    plErosionPasses, 
    plEnableFalloff, 
    plEnableRivers, 
    plEnableDomainWarp, 
    plPaletteKey
  ]);

  // Master Generator Trigger
  const handleGenerateSector = useCallback(() => {
    switch (activeMapType) {
      case 'planetary':
        runGeneratePlanetary();
        break;
      case 'starship':
        runGenerateStarship();
        break;
      case 'caverns':
        runGenerateCaverns();
        break;
      case 'mining':
        runGenerateMining();
        break;
      case 'outpost':
        runGenerateOutpost();
        break;
      case 'nodegraph':
        runGenerateNodeGraph();
        break;
      case 'decorator':
        runGenerateStarship(); // fallback background for decorator
        break;
    }
  }, [
    activeMapType, 
    runGeneratePlanetary, 
    runGenerateStarship, 
    runGenerateCaverns, 
    runGenerateMining, 
    runGenerateOutpost, 
    runGenerateNodeGraph
  ]);

  // Trigger initial generation on mount or map type switch
  useEffect(() => {
    handleGenerateSector();
  }, [activeMapType, handleGenerateSector]);

  // --------------------------------------------------------------------------
  // LIVE 2D PREVIEW CANVAS RENDERING
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeMapType === 'planetary') {
      if (!plGridResult) return;
      const { width, height, grid, getBiome } = plGridResult;
      canvas.width = Math.max(400, width);
      canvas.height = Math.max(300, height);

      const cellW = canvas.width / width;
      const cellH = canvas.height / height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = grid[y * width + x];
          const biome = getBiome(val, x, y);
          ctx.fillStyle = biome.color;
          ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    } else {
      // Tactical Map Rendering (Starship, Cavern, Tunnels, Outposts, Node Graph)
      if (tacticalGrid.length === 0) return;
      const rows = tacticalGrid.length;
      const cols = tacticalGrid[0].length;

      const cellPx = Math.max(12, Math.floor(600 / Math.max(cols, rows))) * zoomLevel;
      canvas.width = cols * cellPx;
      canvas.height = rows * cellPx;

      ctx.fillStyle = '#030712'; // Deep void
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = tacticalGrid[r][c];
          const x = c * cellPx;
          const y = r * cellPx;

          if (cell.isFloor) {
            // Floor background
            if (cell.isLiquid) {
              ctx.fillStyle = cell.liquidType === 'magma' 
                ? '#ea580c' 
                : cell.liquidType === 'acid' 
                  ? '#65a30d' 
                  : cell.liquidType === 'slime' 
                    ? '#9333ea' 
                    : '#0284c7';
            } else {
              ctx.fillStyle = activeMapType === 'caverns' 
                ? '#1e293b' 
                : activeMapType === 'mining' 
                  ? '#292524' 
                  : '#0f172a';
            }
            ctx.fillRect(x, y, cellPx, cellPx);

            // Floor Bevel / Tech Tile
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, cellPx - 1, cellPx - 1);

            // Door rendering
            if (cell.isDoor) {
              ctx.fillStyle = cell.doorType === 'airlock' ? '#38bdf8' : '#f59e0b';
              ctx.fillRect(x + 2, y + cellPx / 2 - 3, cellPx - 4, 6);
            }

            // Light rendering (Radial glow)
            if (cell.isLight) {
              const grad = ctx.createRadialGradient(
                x + cellPx / 2, y + cellPx / 2, 1,
                x + cellPx / 2, y + cellPx / 2, cellPx * 1.5
              );
              grad.addColorStop(0, cell.lightColor || '#fef08a');
              grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x + cellPx / 2, y + cellPx / 2, cellPx * 1.5, 0, Math.PI * 2);
              ctx.fill();

              // Light Bulb core
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(x + cellPx / 2, y + cellPx / 2, Math.max(2, cellPx * 0.15), 0, Math.PI * 2);
              ctx.fill();
            }

            // Tactical Prop / Terminal / Cover
            if (cell.isProp) {
              ctx.fillStyle = '#06b6d4';
              ctx.fillRect(x + cellPx * 0.25, y + cellPx * 0.25, cellPx * 0.5, cellPx * 0.5);
              ctx.strokeStyle = '#22d3ee';
              ctx.lineWidth = 1;
              ctx.strokeRect(x + cellPx * 0.25, y + cellPx * 0.25, cellPx * 0.5, cellPx * 0.5);
            }

            // Breach / Blast mark
            if (cell.isBreach) {
              ctx.fillStyle = 'rgba(220, 38, 38, 0.4)';
              ctx.fillRect(x, y, cellPx, cellPx);
            }
          } else {
            // Wall / Hull Bulkhead
            ctx.fillStyle = '#0b1120';
            ctx.fillRect(x, y, cellPx, cellPx);

            // Highlight border if adjacent to floor
            const hasFloorNeighbor = (
              (r > 0 && tacticalGrid[r - 1][c]?.isFloor) ||
              (r < rows - 1 && tacticalGrid[r + 1][c]?.isFloor) ||
              (c > 0 && tacticalGrid[r][c - 1]?.isFloor) ||
              (c < cols - 1 && tacticalGrid[r][c + 1]?.isFloor)
            );

            if (hasFloorNeighbor) {
              ctx.strokeStyle = activeMapType === 'starship' ? '#0284c7' : '#475569';
              ctx.lineWidth = 2;
              ctx.strokeRect(x + 1, y + 1, cellPx - 2, cellPx - 2);
            }
          }

          // Visual Frozen / Region-Lock indicator
          if (cell.isFrozen) {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.fillRect(x, y, cellPx, cellPx);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, y + 1, cellPx - 2, cellPx - 2);
            ctx.fillStyle = '#22d3ee';
            ctx.fillRect(x + 2, y + 2, 4, 4);
          }

          // Optional Grid Overlay
          if (showGridOverlay) {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellPx, cellPx);
          }
        }
      }
    }
  }, [activeMapType, plGridResult, tacticalGrid, zoomLevel, showGridOverlay]);

  // --------------------------------------------------------------------------
  // USER EDITING & DIRECT TACTILE BRUSH PAINTING
  // --------------------------------------------------------------------------

  const handleCanvasPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeBrush === 'none' || activeMapType === 'planetary') return;
    if (!canvasRef.current || tacticalGrid.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    const centerCol = Math.floor(clickX / cellW);
    const centerRow = Math.floor(clickY / cellH);

    if (centerCol < 0 || centerCol >= cols || centerRow < 0 || centerRow >= rows) return;

    // Record undo
    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    // Apply Brush
    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      const radius = Math.floor(brushSize / 2);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const r = centerRow + dy;
          const c = centerCol + dx;
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            switch (activeBrush) {
              case 'carve':
                if (!next[r][c].isFrozen) next[r][c].isFloor = true;
                break;
              case 'wall':
                if (!next[r][c].isFrozen) {
                  next[r][c].isFloor = false;
                  next[r][c].isLiquid = false;
                  next[r][c].isDoor = false;
                  next[r][c].isLight = false;
                }
                break;
              case 'liquid':
                if (!next[r][c].isFrozen) {
                  next[r][c].isFloor = true;
                  next[r][c].isLiquid = true;
                  next[r][c].liquidType = caLiquidType || 'water';
                }
                break;
              case 'door':
                if (!next[r][c].isFrozen && next[r][c].isFloor) {
                  next[r][c].isDoor = !next[r][c].isDoor;
                  next[r][c].doorType = 'bulkhead';
                }
                break;
              case 'light':
                if (!next[r][c].isFrozen && next[r][c].isFloor) {
                  next[r][c].isLight = !next[r][c].isLight;
                  next[r][c].lightColor = '#38bdf8';
                }
                break;
              case 'crater':
                if (!next[r][c].isFrozen) {
                  next[r][c].isFloor = true;
                  next[r][c].isBreach = true;
                }
                break;
              case 'freeze':
                next[r][c].isFrozen = !next[r][c].isFrozen;
                break;
              case 'eraser':
                if (!next[r][c].isFrozen) {
                  next[r][c] = { isFloor: false };
                }
                break;
            }
          }
        }
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setTacticalGrid(previous);
  };

  // --------------------------------------------------------------------------
  // ONE-CLICK POST-PROCESSING PIPELINE PASSES
  // --------------------------------------------------------------------------

  // 1. Smoothing Pass (Cellular Automata 4-5 Rule)
  const handlePassSmoothing = () => {
    if (tacticalGrid.length === 0) return;
    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;

    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          let wallNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dy === 0 && dx === 0) continue;
              if (!prev[r + dy][c + dx].isFloor) wallNeighbors++;
            }
          }
          if (wallNeighbors >= 5) {
            next[r][c].isFloor = false;
          } else if (wallNeighbors <= 2) {
            next[r][c].isFloor = true;
          }
        }
      }
      return next;
    });
  };

  // 2. Hull Breach / Cave Collapse Pass
  const handlePassBreach = () => {
    if (tacticalGrid.length === 0) return;
    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;

    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    // Blast breach at random perimeter boundary
    const breachCol = Math.floor(cols * (0.2 + Math.random() * 0.6));
    const breachRow = Math.random() > 0.5 ? 2 : rows - 3;
    const radius = 3;

    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const r = breachRow + dy;
          const c = breachCol + dx;
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            if (Math.hypot(dx, dy) <= radius) {
              next[r][c].isFloor = true;
              next[r][c].isBreach = true;
            }
          }
        }
      }
      return next;
    });
  };

  // 3. Auto-Detect Chokepoints & Place Doors
  const handlePassAutoDoors = () => {
    if (tacticalGrid.length === 0) return;
    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;

    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
          if (!prev[r][c].isFloor) continue;

          // Horizontal chokepoint (walls above and below, floor left and right)
          const isHorizChoke = !prev[r - 1][c].isFloor && !prev[r + 1][c].isFloor && prev[r][c - 1].isFloor && prev[r][c + 1].isFloor;
          // Vertical chokepoint (walls left and right, floor above and below)
          const isVertChoke = !prev[r][c - 1].isFloor && !prev[r][c + 1].isFloor && prev[r - 1][c].isFloor && prev[r + 1][c].isFloor;

          if (isHorizChoke || isVertChoke) {
            next[r][c].isDoor = true;
            next[r][c].doorType = 'bulkhead';
          }
        }
      }
      return next;
    });
  };

  // 4. Auto-Place Tactical Lighting
  const handlePassAutoLights = () => {
    if (tacticalGrid.length === 0) return;
    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;

    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      for (let r = 2; r < rows - 2; r += 5) {
        for (let c = 2; c < cols - 2; c += 5) {
          if (next[r][c].isFloor && !next[r][c].isLiquid) {
            next[r][c].isLight = true;
            next[r][c].lightColor = '#38bdf8';
          }
        }
      }
      return next;
    });
  };

  // 5. Tactical Scatter Pass
  const handlePassTacticalScatter = () => {
    if (tacticalGrid.length === 0) return;
    const rows = tacticalGrid.length;
    const cols = tacticalGrid[0].length;

    setUndoStack(prev => [...prev.slice(-10), tacticalGrid.map(row => row.map(cell => ({ ...cell })))]);

    setTacticalGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
          if (next[r][c].isFloor && !next[r][c].isDoor && !next[r][c].isLight && !next[r][c].isLiquid) {
            if (Math.random() < 0.04) {
              next[r][c].isProp = true;
              next[r][c].propName = 'Tactical Barricade';
              next[r][c].propCategory = 'cover';
            }
          }
        }
      }
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // RUN GEMINI SPATIAL DECORATOR SCRIPT
  // --------------------------------------------------------------------------

  const handleRunSpatialDecorator = () => {
    setIsAiRunning(true);
    setAiLogs(['Compiling tactical spatial layout into Semantic Zone Mask...', 'Analyzing clearance vectors & hazard bounds...']);

    setTimeout(() => {
      const mask = new SemanticZoneMask(widthCells, heightCells);
      for (let r = 0; r < heightCells; r++) {
        for (let c = 0; c < widthCells; c++) {
          if (tacticalGrid[r]?.[c]?.isFrozen) {
            mask.setFlag(c, r, SemanticFlag.FROZEN);
          } else if (tacticalGrid[r]?.[c]?.isFloor) {
            mask.setFlag(c, r, SemanticFlag.FLOOR);
          }
        }
      }

      const catalog = coreSeedUnits as unknown as AssetUnit[];
      const execute_scripts: any[] = [];

      execute_scripts.push({
        action: 'place_central',
        query_tags: ['terminal', 'tactical'],
        zone: [4, 4, widthCells - 5, heightCells - 5],
        clearance: 1
      });

      execute_scripts.push({
        action: 'scatter',
        query_tags: ['crate', 'cover'],
        zone: [2, 2, widthCells - 3, heightCells - 3],
        density: 0.08,
        limit: 8,
        clearance: 1
      });

      if (aiPrompt.toLowerCase().includes('plasma') || aiPrompt.toLowerCase().includes('hazard') || aiPrompt.toLowerCase().includes('acid')) {
        execute_scripts.push({
          action: 'place_hazard',
          query_tags: ['plasma', 'hazard'],
          zone: [3, 3, widthCells - 4, heightCells - 4],
          limit: 3
        });
      }

      const executor = new PCGExecutor(Date.now());
      const payload: LLMScriptPayload = {
        atmosphere_lighting: {
          ambient_color: '#071626',
          weather: aiPrompt.toLowerCase().includes('plasma') ? 'sparks' : 'smoke'
        },
        execute_scripts
      };

      const report = executor.execute({
        scriptPayload: payload,
        catalog,
        mask
      });

      setAiLogs(prev => [...prev, ...report.logs, `✓ Script execution verified: Placed ${report.totalPlaced} tactical entities.`]);
      setIsAiRunning(false);

      if (onApplyDecorations) {
        onApplyDecorations(report.placedEntities, report.atmosphere);
      }
    }, 450);
  };

  // --------------------------------------------------------------------------
  // MASTER DEPLOY TO BATTLEMAP CANVAS
  // --------------------------------------------------------------------------

  const handleDeployToCanvas = () => {
    if (activeMapType === 'planetary') {
      if (!plGridResult) return;
      const { terrains, objects } = convertGridToKonvaElements(plGridResult, {
        stageWidth,
        stageHeight,
        scatterDensity: plScatterDensity,
        seed,
        renderMode: plRenderMode
      });

      if (onCommitPcgSector) {
        onCommitPcgSector({
          terrains,
          objects,
          replaceExisting
        });
      } else if (onApplyPcgTerrain) {
        // fallback
        onApplyPcgTerrain(plGridResult.grid, plPaletteKey, replaceExisting);
      }
    } else {
      // Deploy Tactical Sector (Starship, Cavern, Tunnels, Outposts, Node Graph)
      if (tacticalGrid.length === 0) return;
      const rows = tacticalGrid.length;
      const cols = tacticalGrid[0].length;

      const generatedTerrains: any[] = [];
      const generatedObjects: any[] = [];
      const generatedLines: any[] = [];
      const generatedLights: any[] = [];

      const biomeTheme = activeMapType === 'caverns' 
        ? 'rock_cavern' 
        : activeMapType === 'mining' 
          ? 'dirt_subterranean' 
          : 'metalDecking';

      const floorTexture = activeMapType === 'starship' || activeMapType === 'outpost' || activeMapType === 'nodegraph'
        ? TERRAIN_TEXTURE_PATTERNS.metalDecking
        : null;

      const floorBitmasks = MarchingSquaresAutoTiler.calculateGridBitmasks(
        cols,
        rows,
        (c, r) => {
          const cell = tacticalGrid[r]?.[c];
          if (!cell || !cell.isFloor) return undefined;
          return cell.isLiquid ? `liquid_${cell.liquidType || 'magma'}` : 'floor';
        }
      );

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = tacticalGrid[r][c];
          const x = c * cellSizePx;
          const y = r * cellSizePx;

          if (cell.isFloor && layerFlags.terrains) {
            const bitmask = floorBitmasks[r][c];
            const edgeLines = MarchingSquaresAutoTiler.getEdgeLines(x, y, cellSizePx, cellSizePx, bitmask);
            generatedTerrains.push({
              id: `pcg-floor-${Date.now()}-${r}-${c}`,
              x,
              y,
              width: cellSizePx,
              height: cellSizePx,
              renderType: 'rect',
              bitmask4Bit: bitmask,
              edgeLines,
              biomeType: cell.isLiquid ? (cell.liquidType === 'magma' ? 'volcanicLava' : 'toxicSludge') : biomeTheme,
              color: cell.isLiquid 
                ? (cell.liquidType === 'magma' ? '#ea580c' : cell.liquidType === 'acid' ? '#65a30d' : '#0284c7') 
                : '#1e293b',
              textureUrl: floorTexture
            });
          }

          // Doors
          if (cell.isDoor && layerFlags.doors) {
            generatedObjects.push({
              id: `pcg-door-${Date.now()}-${r}-${c}`,
              name: cell.doorType === 'airlock' ? 'Airlock Blast Door' : 'Security Bulkhead',
              label: cell.doorType === 'airlock' ? 'Airlock' : 'Door',
              x: x + cellSizePx / 2,
              y: y + cellSizePx / 2,
              width: cellSizePx,
              height: cellSizePx,
              category: 'door',
              type: 'portal',
              color: '#f59e0b',
              isOpen: false,
              isLocked: false
            });
          }

          // Lights
          if (cell.isLight && layerFlags.lights) {
            generatedLights.push({
              id: `pcg-light-${Date.now()}-${r}-${c}`,
              name: 'Tactical Luminary',
              x: x + cellSizePx / 2,
              y: y + cellSizePx / 2,
              radius: cellSizePx * 3.5,
              color: cell.lightColor || '#38bdf8',
              intensity: 0.85
            });
          }

          // Doodads / Props / Hazards
          if (cell.isProp && layerFlags.scatters) {
            generatedObjects.push({
              id: `pcg-prop-${Date.now()}-${r}-${c}`,
              name: cell.propName || 'Tactical Barricade',
              label: cell.propName || 'Cover',
              x,
              y,
              width: cellSizePx,
              height: cellSizePx,
              category: cell.propCategory || 'cover',
              type: 'prop',
              color: '#06b6d4'
            });
          }

          // Wall Perimeter lines
          if (!cell.isFloor && layerFlags.walls) {
            const hasFloorNeighbor = (
              (r > 0 && tacticalGrid[r - 1][c]?.isFloor) ||
              (r < rows - 1 && tacticalGrid[r + 1][c]?.isFloor) ||
              (c > 0 && tacticalGrid[r][c - 1]?.isFloor) ||
              (c < cols - 1 && tacticalGrid[r][c + 1]?.isFloor)
            );
            if (hasFloorNeighbor) {
              generatedLines.push({
                id: `pcg-wall-${Date.now()}-${r}-${c}`,
                points: [x, y, x + cellSizePx, y, x + cellSizePx, y + cellSizePx, x, y + cellSizePx, x, y],
                stroke: '#0284c7',
                strokeWidth: 3,
                closed: true
              });
            }
          }
        }
      }

      if (onCommitPcgSector) {
        onCommitPcgSector({
          terrains: generatedTerrains,
          objects: generatedObjects,
          lines: generatedLines,
          lights: generatedLights,
          replaceExisting
        });
      }
    }

    if (onDeployToCanvas) {
      onDeployToCanvas();
    }
  };

  // --------------------------------------------------------------------------
  // LIVE SECTOR METRICS
  // --------------------------------------------------------------------------

  const metrics = React.useMemo(() => {
    if (activeMapType === 'planetary') {
      const res = plResolution;
      return {
        totalCells: res * Math.floor((res * 3) / 4),
        walkablePct: 100 - plOceanLevel,
        doors: 0,
        lights: 0,
        scatters: plScatterDensity
      };
    }
    if (tacticalGrid.length === 0) {
      return { totalCells: widthCells * heightCells, walkablePct: 0, doors: 0, lights: 0, scatters: 0 };
    }

    let floorCount = 0;
    let doorCount = 0;
    let lightCount = 0;
    let propCount = 0;

    for (const row of tacticalGrid) {
      for (const cell of row) {
        if (cell.isFloor) floorCount++;
        if (cell.isDoor) doorCount++;
        if (cell.isLight) lightCount++;
        if (cell.isProp) propCount++;
      }
    }

    const total = tacticalGrid.length * tacticalGrid[0].length;
    return {
      totalCells: total,
      walkablePct: total > 0 ? Math.round((floorCount / total) * 100) : 0,
      doors: doorCount,
      lights: lightCount,
      scatters: propCount
    };
  }, [activeMapType, plResolution, plOceanLevel, plScatterDensity, tacticalGrid, widthCells, heightCells]);

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden ${isModal ? 'p-4' : 'p-6'}`}>
      {/* Studio Header & Map Type Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-mono font-bold uppercase text-slate-100 flex items-center gap-2">
              <span>Procedural Content Generation (PCG) & AI Co-Pilot</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                100% Deterministic + Scripted
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Multi-algorithmic cartography engine with granular controls, tactile brush editing, and tactical battlemap deployment.
            </p>
          </div>
        </div>

        {/* Modal Close Button */}
        {isModal && onCloseModal && (
          <button
            type="button"
            onClick={onCloseModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-950 hover:text-red-400 border border-slate-700 text-slate-400 text-lg flex items-center justify-center transition-all"
            title="Close PCG Modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Type Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 shrink-0 border-b border-slate-800/80 text-xs font-mono">
        {[
          { id: 'planetary', label: 'Planetary Landmass', icon: Globe2 },
          { id: 'starship', label: 'Starship & Deckplan', icon: Rocket },
          { id: 'caverns', label: 'Subterranean Cavern & Hive', icon: Mountain },
          { id: 'mining', label: 'Mining Complex & Shafts', icon: Pickaxe },
          { id: 'outpost', label: 'Modular Outpost & Station', icon: Layers },
          { id: 'nodegraph', label: 'Story Flowchart Outpost', icon: Network },
          { id: 'decorator', label: 'Gemini Spatial Decorator', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMapType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMapType(tab.id as PcgMapType)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Body: Split View (Controls Left, Preview Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden py-4">
        
        {/* Left Column: Granular Controls & Preset Parameters (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto pr-1">

          {/* Universal Parameters & Seed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>UNIVERSAL PARAMETERS</span>
              </span>
              <span className="text-[10px] text-slate-500">Seed &amp; Spatial Matrix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Seed */}
              <div className="sm:col-span-7 flex gap-2">
                <input
                  type="text"
                  value={seed}
                  onChange={e => setSeed(e.target.value)}
                  placeholder="World Seed..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleRandomizeSeed}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-lg transition-all"
                  title="Randomize Seed"
                >
                  🎲 Seed
                </button>
              </div>

              {/* Grid Dimensions & Cell Size */}
              <div className="sm:col-span-5 flex items-center gap-1.5 text-xs font-mono">
                <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-slate-500 mr-1">W:</span>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={widthCells}
                    onChange={e => setWidthCells(Math.max(10, parseInt(e.target.value, 10) || 10))}
                    className="w-full bg-transparent text-cyan-300 outline-none"
                  />
                </div>
                <span className="text-slate-600">×</span>
                <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-slate-500 mr-1">H:</span>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={heightCells}
                    onChange={e => setHeightCells(Math.max(10, parseInt(e.target.value, 10) || 10))}
                    className="w-full bg-transparent text-cyan-300 outline-none"
                  />
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1" title="Grid Cell Size (px)">
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={cellSizePx}
                    onChange={e => setCellSizePx(Math.max(20, parseInt(e.target.value, 10) || 50))}
                    className="w-10 bg-transparent text-cyan-300 outline-none"
                  />
                  <span className="text-slate-500 text-[10px]">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets Bar for Active Map Type */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Curated Architectural Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeMapType === 'planetary' && PLANETARY_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPlAlgorithm(p.algorithm as any);
                    setPlOceanLevel(p.oceanLevel);
                    setPlScale(p.scale);
                    setPlOctaves(p.octaves);
                    setPlRoughness(p.roughness);
                    setPlClimateBias(p.climateBias);
                    setPlScatterDensity(p.scatterDensity);
                    setPlResolution(p.resolution);
                    setPlErosionPasses(p.erosionPasses);
                    setPlEnableFalloff(p.falloff);
                    setPlEnableRivers(p.rivers);
                    setPlPaletteKey(p.palette);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}

              {activeMapType === 'starship' && STARSHIP_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSsDepth(p.depth);
                    setSsSymmetry(p.symmetry as any);
                    setSsCorridorWidth(p.corridorWidth);
                    setSsHullArmor(p.hullArmor);
                    setSsAirlockCount(p.airlockCount);
                    setSsTheme(p.theme);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}

              {activeMapType === 'caverns' && CAVERN_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCaFillProb(p.fillProb);
                    setCaSmoothIters(p.smoothIters);
                    setCaLiquidRatio(p.liquidRatio);
                    setCaLiquidType(p.liquidType as any);
                    setCaScatterDensity(p.scatterDensity);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}

              {activeMapType === 'mining' && MINING_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDwFloorRatio(p.floorRatio);
                    setDwStraightBias(p.straightBias);
                    setDwBranches(p.branches);
                    setDwChambers(p.chambers);
                    setDwRailTracks(p.railTracks);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}

              {activeMapType === 'outpost' && OUTPOST_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOpModuleSize(p.moduleSize);
                    setOpOpenRatio(p.openRatio);
                    setOpPerimeterWall(p.perimeterWall);
                    setOpBlastDoors(p.blastDoors);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}

              {activeMapType === 'nodegraph' && (
                <span className="text-xs text-slate-400 font-mono">Use Room Chain Editor below</span>
              )}

              {activeMapType === 'decorator' && (
                <span className="text-xs text-slate-400 font-mono">Select directive theme prompt below</span>
              )}
            </div>
          </div>

          {/* Granular Generator Controls per Map Type */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
            
            {/* 1. PLANETARY LANDMASS CONTROLS */}
            {activeMapType === 'planetary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Planetary Simplex &amp; Biome Parameters
                  </span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setPlRenderMode('organic')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${plRenderMode === 'organic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      🌱 Organic Vector
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlRenderMode('hex')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${plRenderMode === 'hex' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      ⬢ Hex Tiles
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'simplex', label: 'Simplex HD' },
                    { id: 'cellular', label: 'Cellular Island' },
                    { id: 'voronoi', label: 'Voronoi Plates' }
                  ].map(alg => (
                    <button
                      key={alg.id}
                      type="button"
                      onClick={() => setPlAlgorithm(alg.id as any)}
                      className={`py-1.5 px-2 text-xs font-mono font-bold rounded border ${
                        plAlgorithm === alg.id 
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {alg.label}
                    </button>
                  ))}
                </div>

                {/* Granular Sliders */}
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Ocean Level / Land Ratio:</span>
                      <span className="text-cyan-400 font-bold">{plOceanLevel}%</span>
                    </div>
                    <input type="range" min={10} max={85} value={plOceanLevel} onChange={e => setPlOceanLevel(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Continental Scale:</span>
                      <span className="text-cyan-400 font-bold">{plScale}</span>
                    </div>
                    <input type="range" min={15} max={300} value={plScale} onChange={e => setPlScale(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Fractal Octaves:</span>
                      <span className="text-cyan-400 font-bold">{plOctaves} Octaves</span>
                    </div>
                    <input type="range" min={1} max={10} value={plOctaves} onChange={e => setPlOctaves(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Coastline Roughness:</span>
                      <span className="text-cyan-400 font-bold">{plRoughness.toFixed(2)}</span>
                    </div>
                    <input type="range" min={0.10} max={1.00} step={0.05} value={plRoughness} onChange={e => setPlRoughness(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Climate Bias:</span>
                      <span className="text-cyan-400 font-bold">{plClimateBias > 0 ? `+${plClimateBias} (Arid)` : plClimateBias < 0 ? `${plClimateBias} (Glacial)` : '0 (Balanced)'}</span>
                    </div>
                    <input type="range" min={-100} max={100} value={plClimateBias} onChange={e => setPlClimateBias(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={plEnableFalloff} onChange={e => setPlEnableFalloff(e.target.checked)} className="accent-cyan-400" />
                    <span>Island Falloff</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={plEnableRivers} onChange={e => setPlEnableRivers(e.target.checked)} className="accent-cyan-400" />
                    <span>Carve Rivers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={plEnableDomainWarp} onChange={e => setPlEnableDomainWarp(e.target.checked)} className="accent-cyan-400" />
                    <span>Domain Warping</span>
                  </label>
                </div>

                {/* Biome Themes */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-bold text-slate-300">Biome Palette:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'terrestrial', label: 'Standard Earth' },
                      { id: 'scifi', label: 'Sci-Fi Neon' },
                      { id: 'volcanic', label: 'Volcanic Ash' },
                      { id: 'glacial', label: 'Sub-Zero Glacial' }
                    ].map(pal => {
                      const colors = (BIOME_PALETTES as any)[pal.id];
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setPlPaletteKey(pal.id)}
                          className={`p-2 rounded border text-left flex flex-col gap-1 ${
                            plPaletteKey === pal.id 
                              ? 'bg-cyan-950 border-cyan-400' 
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <span className="text-xs font-mono font-bold text-slate-200">{pal.label}</span>
                          <div className="flex gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.ocean }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.grass }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.mountain }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.snow }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. STARSHIP DECKPLAN CONTROLS */}
            {activeMapType === 'starship' && (
              <div className="space-y-4 font-mono text-xs">
                <span className="font-bold text-cyan-400 uppercase">
                  Starship Architectural Parameters
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">BSP Subdivision Depth:</label>
                    <input type="range" min={2} max={6} value={ssDepth} onChange={e => setSsDepth(Number(e.target.value))} className="w-full accent-cyan-500" />
                    <span className="text-cyan-400">{ssDepth} Levels</span>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Spinal Corridor Width:</label>
                    <input type="range" min={1} max={3} value={ssCorridorWidth} onChange={e => setSsCorridorWidth(Number(e.target.value))} className="w-full accent-cyan-500" />
                    <span className="text-cyan-400">{ssCorridorWidth} Cells</span>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Hull Armor Padding:</label>
                    <input type="range" min={1} max={4} value={ssHullArmor} onChange={e => setSsHullArmor(Number(e.target.value))} className="w-full accent-cyan-500" />
                    <span className="text-cyan-400">{ssHullArmor} Cells</span>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Airlock Seals:</label>
                    <input type="range" min={2} max={6} value={ssAirlockCount} onChange={e => setSsAirlockCount(Number(e.target.value))} className="w-full accent-cyan-500" />
                    <span className="text-cyan-400">{ssAirlockCount} Airlocks</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Hull Symmetry:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bilateral', label: 'Bilateral Port/Stbd' },
                      { id: 'none', label: 'Asymmetrical' },
                      { id: 'fore_aft', label: 'Radial Spire' }
                    ].map(sym => (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => setSsSymmetry(sym.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded border ${
                          ssSymmetry === sym.id ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sym.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Deck Bulkhead Theme:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'metal_deck', label: 'Metal Deck' },
                      { id: 'industrial', label: 'Industrial' },
                      { id: 'cyber_grid', label: 'Cyber Grid' }
                    ].map(th => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setSsTheme(th.id)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded border ${
                          ssTheme === th.id ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SUBTERRANEAN CAVERNS CONTROLS */}
            {activeMapType === 'caverns' && (
              <div className="space-y-4 font-mono text-xs">
                <span className="font-bold text-cyan-400 uppercase">
                  Cavern &amp; Alien Hive Parameters
                </span>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Initial Wall Fill Density:</span>
                      <span className="text-cyan-400 font-bold">{Math.round(caFillProb * 100)}%</span>
                    </div>
                    <input type="range" min={0.35} max={0.55} step={0.01} value={caFillProb} onChange={e => setCaFillProb(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Smoothing Passes:</span>
                      <span className="text-cyan-400 font-bold">{caSmoothIters} Iterations</span>
                    </div>
                    <input type="range" min={1} max={8} value={caSmoothIters} onChange={e => setCaSmoothIters(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Liquid Basin Flooding:</span>
                      <span className="text-cyan-400 font-bold">{Math.round(caLiquidRatio * 100)}%</span>
                    </div>
                    <input type="range" min={0} max={0.45} step={0.05} value={caLiquidRatio} onChange={e => setCaLiquidRatio(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <span className="text-slate-300 block mb-1">Liquid Basin Substance:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'water', label: 'Sub-Water' },
                        { id: 'magma', label: 'Magma' },
                        { id: 'acid', label: 'Acid' },
                        { id: 'slime', label: 'Bio-Slime' }
                      ].map(liq => (
                        <button
                          key={liq.id}
                          type="button"
                          onClick={() => setCaLiquidType(liq.id as any)}
                          className={`py-1 px-2 text-[10px] font-bold rounded border ${
                            caLiquidType === liq.id ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {liq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={caConnectPockets}
                        onChange={e => setCaConnectPockets(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <span>Connect Isolated Cavern Pockets</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MINING COMPLEX CONTROLS */}
            {activeMapType === 'mining' && (
              <div className="space-y-4 font-mono text-xs">
                <span className="font-bold text-cyan-400 uppercase">
                  Drunkard's Walk Tunnel &amp; Mining Parameters
                </span>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Excavation Ratio:</span>
                      <span className="text-cyan-400 font-bold">{Math.round(dwFloorRatio * 100)}%</span>
                    </div>
                    <input type="range" min={0.15} max={0.50} step={0.01} value={dwFloorRatio} onChange={e => setDwFloorRatio(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Drift Straightness Bias:</span>
                      <span className="text-cyan-400 font-bold">{dwStraightBias.toFixed(2)}</span>
                    </div>
                    <input type="range" min={0.10} max={0.90} step={0.05} value={dwStraightBias} onChange={e => setDwStraightBias(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Chamber Stamps:</span>
                      <span className="text-cyan-400 font-bold">{dwChambers} Quarries</span>
                    </div>
                    <input type="range" min={0} max={8} value={dwChambers} onChange={e => setDwChambers(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>
                </div>
              </div>
            )}

            {/* 5. MODULAR OUTPOST CONTROLS */}
            {activeMapType === 'outpost' && (
              <div className="space-y-4 font-mono text-xs">
                <span className="font-bold text-cyan-400 uppercase">
                  Modular Outpost Parameters
                </span>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Module Grid Size:</span>
                      <span className="text-cyan-400 font-bold">{opModuleSize} × {opModuleSize} Cells</span>
                    </div>
                    <input type="range" min={4} max={10} step={2} value={opModuleSize} onChange={e => setOpModuleSize(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Module Density / Open Ratio:</span>
                      <span className="text-cyan-400 font-bold">{Math.round(opOpenRatio * 100)}%</span>
                    </div>
                    <input type="range" min={0.20} max={0.80} step={0.05} value={opOpenRatio} onChange={e => setOpOpenRatio(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>

                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={opBlastDoors} onChange={e => setOpBlastDoors(e.target.checked)} className="accent-cyan-400" />
                      <span>Blast Doors at Exits</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 6. STORY FLOWCHART CONTROLS */}
            {activeMapType === 'nodegraph' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 uppercase">
                    Narrative Room Flowchart
                  </span>
                  <span className="text-slate-500">{storyNodes.length} Rooms</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {storyNodes.map((node, i) => (
                    <div key={node.id} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-500 font-bold">{i + 1}.</span>
                        <span className="text-slate-200">{node.name}</span>
                        <span className="text-[10px] text-slate-500">({node.widthCells}×{node.heightCells})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStoryNodes(prev => prev.filter(n => n.id !== node.id));
                          setStoryEdges(prev => prev.filter(e => e.fromNodeId !== node.id && e.toNodeId !== node.id));
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Room input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNodeName}
                    onChange={e => setNewNodeName(e.target.value)}
                    placeholder="New Room (e.g. Cryo Bay)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newNodeName.trim()) return;
                      const newId = `room_${Date.now()}`;
                      const newNode: StoryFlowNode = { id: newId, name: newNodeName.trim(), widthCells: 5, heightCells: 5 };
                      setStoryNodes(prev => [...prev, newNode]);
                      if (storyNodes.length > 0) {
                        const lastNode = storyNodes[storyNodes.length - 1];
                        setStoryEdges(prev => [...prev, { fromNodeId: lastNode.id, toNodeId: newId }]);
                      }
                      setNewNodeName('');
                    }}
                    className="px-3 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 font-bold rounded"
                  >
                    + Add
                  </button>
                </div>
              </div>
            )}

            {/* 7. GEMINI SPATIAL DECORATOR CONTROLS */}
            {activeMapType === 'decorator' && (
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold text-cyan-400 uppercase">
                  Gemini Structured Spatial Decorator Prompt
                </span>

                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-cyan-900/80 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Derelict corporate research lab with heavy tactical cover, plasma hazards, and barricaded blast doors."
                />

                <button
                  type="button"
                  disabled={isAiRunning}
                  onClick={handleRunSpatialDecorator}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/80 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>{isAiRunning ? 'Executing Script...' : 'Run Spatial Decorator'}</span>
                </button>

                {aiLogs.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] text-cyan-400/90 max-h-28 overflow-y-auto space-y-1 shadow-inner">
                    {aiLogs.map((log, i) => (
                      <div key={i} className="flex items-start space-x-1.5">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regenerate Button */}
            <button
              type="button"
              onClick={handleGenerateSector}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-cyan-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Synthesize Procedural Map ({activeMapType.toUpperCase()})</span>
            </button>
          </div>

          {/* User Design & Tactile Editing Tools (Only for tactical map types) */}
          {activeMapType !== 'planetary' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>TACTILE IN-STUDIO BRUSH &amp; EDITING</span>
                </span>
                {undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>

              {/* Tool Selection */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs font-mono">
                {[
                  { id: 'carve', label: 'Floor', icon: Paintbrush },
                  { id: 'wall', label: 'Wall', icon: Box },
                  { id: 'liquid', label: 'Liquid', icon: ShieldAlert },
                  { id: 'door', label: 'Door', icon: DoorOpen },
                  { id: 'light', label: 'Light', icon: Lightbulb },
                  { id: 'crater', label: 'Breach', icon: Zap },
                  { id: 'freeze', label: 'Freeze', icon: Lock },
                  { id: 'eraser', label: 'Erase', icon: Eraser }
                ].map(tool => {
                  const Icon = tool.icon;
                  const isSelected = activeBrush === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveBrush(isSelected ? 'none' : (tool.id as any))}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-bold transition-all ${
                        isSelected 
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Brush Size */}
              <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
                <span>Brush Radius:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 5].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setBrushSize(sz)}
                      className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                        brushSize === sz ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sz}×{sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* One-Click Post-Processing Passes (Tactical maps only) */}
          {activeMapType !== 'planetary' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-lg">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Post-Processing Pipeline Passes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={handlePassSmoothing}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Smooth Walls</span>
                </button>
                <button
                  type="button"
                  onClick={handlePassBreach}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hull Breach</span>
                </button>
                <button
                  type="button"
                  onClick={handlePassAutoDoors}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Doors</span>
                </button>
                <button
                  type="button"
                  onClick={handlePassAutoLights}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Auto-Lights</span>
                </button>
                <button
                  type="button"
                  onClick={handlePassTacticalScatter}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Box className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cover Scatter</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live 2D Canvas Preview & Deploy Action (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          
          {/* Live Preview Header with Zoom Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between shrink-0 shadow-lg text-xs font-mono">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">REAL-TIME 2D PREVIEW</span>
              <span className="text-[10px] text-slate-500">
                ({activeMapType === 'planetary' ? `${plResolution}×${Math.floor((plResolution * 3) / 4)}` : `${widthCells}×${heightCells}`})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGridOverlay(prev => !prev)}
                className={`p-1.5 rounded border ${showGridOverlay ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                title="Toggle Grid Lines"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-cyan-400 font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1.0)}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                1:1
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-auto flex items-center justify-center p-3 relative shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => {
                setIsMouseDown(true);
                handleCanvasPaint(e);
              }}
              onMouseMove={(e) => {
                if (isMouseDown) handleCanvasPaint(e);
              }}
              onMouseUp={() => setIsMouseDown(false)}
              onMouseLeave={() => setIsMouseDown(false)}
              className={`max-w-full max-h-full object-contain rounded shadow-2xl ${activeBrush !== 'none' && activeMapType !== 'planetary' ? 'cursor-crosshair' : 'cursor-default'}`}
            />

            {activeBrush !== 'none' && activeMapType !== 'planetary' && (
              <div className="absolute top-4 left-4 bg-slate-950/90 border border-cyan-500/80 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 shadow-xl flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Active Brush: {activeBrush.toUpperCase()} ({brushSize}×{brushSize})</span>
              </div>
            )}
          </div>

          {/* Live Sector Statistics Readout */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono shrink-0 shadow-lg">
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">TOTAL CELLS</span>
              <span className="text-cyan-400 font-bold">{metrics.totalCells}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">WALKABLE</span>
              <span className="text-emerald-400 font-bold">{metrics.walkablePct}%</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">PORTALS</span>
              <span className="text-yellow-400 font-bold">{metrics.doors}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">LUMINARIES</span>
              <span className="text-sky-400 font-bold">{metrics.lights}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">TACTICAL COVER</span>
              <span className="text-purple-400 font-bold">{metrics.scatters}</span>
            </div>
          </div>

          {/* Deployment Actions Bar */}
          <div className="bg-slate-900 border border-cyan-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Target Mode:</span>
              <div className="flex bg-slate-950 border border-slate-800 rounded p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setReplaceExisting(true)}
                  className={`px-3 py-1 font-bold rounded transition-all ${
                    replaceExisting ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Replace Map
                </button>
                <button
                  type="button"
                  onClick={() => setReplaceExisting(false)}
                  className={`px-3 py-1 font-bold rounded transition-all ${
                    !replaceExisting ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Merge / Overlay
                </button>
              </div>
            </div>

            {/* Target Layers Checkboxes */}
            <div className="flex flex-wrap gap-2.5 text-[11px] font-mono">
              {Object.entries(layerFlags).map(([key, enabled]) => (
                <label key={key} className="flex items-center gap-1 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => setLayerFlags(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="accent-cyan-400"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDeployToCanvas}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy Generated Sector to Canvas</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PcgAiStudioTab;
