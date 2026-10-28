/**
 * @file ChunkStudioModal.tsx
 * @description Interactive Chunk Forge Studio Workbench for authoring, editing, and testing
 * reusable MapChunkBlueprints with Tiles, Bulkhead Walls/Doors, Multi-Cell Assets,
 * Perimeter Snap Sockets, Internal Construction Point Slots, Adjustable Assigned Properties,
 * and Live Dihedral (D4) 90° CW North-Side Rotation & Horizontal/Vertical Flip verification.
 */

import React, { useState, useMemo } from 'react';
import {
  Blocks,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Plus,
  Trash2,
  Copy,
  Save,
  Compass,
  Shield,
  Paintbrush,
  Box,
  Cpu,
  Sun,
  Plug,
  Sliders,
  Check,
  X,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  type MapChunkBlueprint,
  type ChunkCategory,
  type ChunkTileCell,
  CHUNK_CATEGORIES,
  CHUNK_CATEGORY_LABELS,
  CHUNK_POWER_STATES,
  CHUNK_CONDITION_STATES,
  CHUNK_BIOME_THEMES,
  SOCKET_TYPES,
  INTERNAL_SLOT_CATEGORIES,
  type CardinalEdge,
  type ChunkConstructionPoint,
  type ChunkPlacedAsset,
  createDefaultMapChunk
} from '../../../../schemas/mapChunkSchema';
import {
  transformChunkBlueprint,
  renderChunkThumbnailDataUrl
} from '../../../../services/mapChunkCompilerService';
import { SCIENCE_FANTASY_SEED_CHUNKS } from '../../../../data/seed_chunks/science_fantasy_chunks';
import {
  HIFI_CHROMA_TILE_PRESETS,
  synthesizeTileDataUrl,
  type TileSynthesisRecipe
} from '../../../../engine/assets/MicroTileSynthesizer';
import { synthesizeTileRecipeFromPrompt } from '../../../../services/tileAiRecipeService';
import { showToast } from '../../../../context/ToastContext';

export interface ChunkStudioModalProps {
  isOpen?: boolean;
  isEmbeddedTab?: boolean;
  initialChunk?: MapChunkBlueprint | null;
  customChunks?: MapChunkBlueprint[];
  onSaveChunk: (chunk: MapChunkBlueprint) => void;
  onDeleteChunk?: (chunkId: string) => void;
  onSelectChunkToStamp?: (
    chunk: MapChunkBlueprint,
    initialTransform?: { rotationDeg: 0 | 90 | 180 | 270; flipX: boolean; flipY: boolean }
  ) => void;
  onClose?: () => void;
}

type WorkbenchTool = 'tile' | 'wall' | 'asset' | 'socket' | 'slot' | 'light';

const TILE_PALETTE = [
  { id: 'steelGrating', label: 'Steel Grating', material: 'metal_deck', color: '#334155', isLiquid: false },
  { id: 'ceramicTile', label: 'Sterile Med-Tile', material: 'ceramic_tile', color: '#164e63', isLiquid: false },
  { id: 'stealthDeck', label: 'Stealth Acoustic Deck', material: 'acoustic_stealth', color: '#1e1b4b', isLiquid: false },
  { id: 'concretePad', label: 'Ferrocrete Pad', material: 'metal_deck', color: '#3f3f46', isLiquid: false },
  { id: 'hazardPad', label: 'Hazard Landing Pad', material: 'metal_deck', color: '#ca8a04', isLiquid: false },
  { id: 'alienBiomass', label: 'Chitin Bio-Resin', material: 'chitin_hive', color: '#365314', isLiquid: false },
  { id: 'iceSheet', label: 'Cryo-Frost Deck', material: 'arctic_ice', color: '#083344', isLiquid: false },
  { id: 'coolantTrench', label: 'Coolant Trench', material: 'metal_deck', color: '#0284c7', isLiquid: true, liquidType: 'water' as const },
  { id: 'acidPool', label: 'Corrosive Bile Pool', material: 'chitin_hive', color: '#84cc16', isLiquid: true, liquidType: 'acid' as const },
  { id: 'magmaVent', label: 'Molten Slag Channel', material: 'volcanic_basalt', color: '#dc2626', isLiquid: true, liquidType: 'magma' as const }
];

const ASSET_PRESETS = [
  { type: 'terminal', label: 'Tactical Console', shape: 'rect' as const, color: '#22d3ee', w: 1, h: 1, keepUpright: false },
  { type: 'holotable', label: 'Command Holotable', shape: 'circle' as const, color: '#38bdf8', w: 2, h: 2, keepUpright: true },
  { type: 'stasisPod', label: 'Cryo / Auto-Doc Pod', shape: 'rect' as const, color: '#22d3ee', w: 1, h: 2, keepUpright: false },
  { type: 'generator', label: 'Fusion Core Torus', shape: 'circle' as const, color: '#0ea5e9', w: 2, h: 2, keepUpright: true },
  { type: 'crate', label: 'Armored ISO Container', shape: 'rect' as const, color: '#0284c7', w: 2, h: 3, keepUpright: false },
  { type: 'supplyCrate', label: 'Supply Locker (1x1)', shape: 'rect' as const, color: '#f59e0b', w: 1, h: 1, keepUpright: false },
  { type: 'turret', label: 'Fixed Defense Emplacement', shape: 'hexagon' as const, color: '#ef4444', w: 1, h: 1, keepUpright: false }
];

export const ChunkStudioModal: React.FC<ChunkStudioModalProps> = ({
  isOpen = true,
  isEmbeddedTab = false,
  initialChunk = null,
  customChunks = [],
  onSaveChunk,
  onDeleteChunk,
  onSelectChunkToStamp,
  onClose
}) => {
  const allCatalogChunks = useMemo(() => {
    const customIds = new Set((customChunks || []).map((c) => c.chunkId));
    const seeds = SCIENCE_FANTASY_SEED_CHUNKS.filter((s) => !customIds.has(s.chunkId));
    return [...(customChunks || []), ...seeds];
  }, [customChunks]);

  const [workingChunk, setWorkingChunk] = useState<MapChunkBlueprint>(() => {
    if (initialChunk) return structuredClone ? structuredClone(initialChunk) : JSON.parse(JSON.stringify(initialChunk));
    return structuredClone
      ? structuredClone(SCIENCE_FANTASY_SEED_CHUNKS[0])
      : JSON.parse(JSON.stringify(SCIENCE_FANTASY_SEED_CHUNKS[0]));
  });

  const [categoryFilter, setCategoryFilter] = useState<ChunkCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<WorkbenchTool>('tile');
  const [customTileBrushes, setCustomTileBrushes] = useState<
    Array<{
      id: string;
      label: string;
      material: string;
      color: string;
      textureUrl?: string;
      isLiquid: boolean;
      liquidType?: 'water' | 'acid' | 'magma' | 'cryo';
      movementCost?: number;
    }>
  >([]);
  const allTileBrushes = useMemo(
    () => [...TILE_PALETTE, ...customTileBrushes],
    [customTileBrushes]
  );
  const [selectedTileBrush, setSelectedTileBrush] = useState<(typeof TILE_PALETTE)[number] & { textureUrl?: string; movementCost?: number }>(TILE_PALETTE[0]);
  const [eraseTileMode, setEraseTileMode] = useState(false);
  const [isChunkTileSynthOpen, setIsChunkTileSynthOpen] = useState(false);
  const [chunkSynthPrompt, setChunkSynthPrompt] = useState('');
  const [isChunkSynthLoading, setIsChunkSynthLoading] = useState(false);
  const [selectedWallType, setSelectedWallType] = useState<'solid' | 'door' | 'window' | 'one_way'>('solid');
  const [selectedAssetPreset, setSelectedAssetPreset] = useState(ASSET_PRESETS[0]);
  const [selectedSocketType, setSelectedSocketType] = useState<(typeof SOCKET_TYPES)[number]>('bulkhead_door');
  const [selectedSocketSpan, setSelectedSocketSpan] = useState<number>(2);
  const [selectedSlotCategory, setSelectedSlotCategory] = useState<(typeof INTERNAL_SLOT_CATEGORIES)[number]>('turret_hardpoint');

  // Selected item for Right Inspector
  const [selectedPointId, setSelectedPointId] = useState<string | null>(
    workingChunk.constructionPoints[0]?.id || null
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Live D4 Transformation Test Sandbox State
  const [previewRotationDeg, setPreviewRotationDeg] = useState<0 | 90 | 180 | 270>(0);
  const [previewFlipX, setPreviewFlipX] = useState<boolean>(false);
  const [previewFlipY, setPreviewFlipY] = useState<boolean>(false);

  const filteredCatalog = useMemo(() => {
    return allCatalogChunks.filter((c) => {
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (
        searchQuery.trim() &&
        !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(c.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [allCatalogChunks, categoryFilter, searchQuery]);

  // Transformed blueprint for live preview & verification
  const transformedPreview = useMemo(() => {
    return transformChunkBlueprint(
      workingChunk,
      previewRotationDeg,
      previewFlipX,
      previewFlipY
    );
  }, [workingChunk, previewRotationDeg, previewFlipX, previewFlipY]);

  const isPreviewTransformed =
    previewRotationDeg !== 0 || previewFlipX || previewFlipY;

  if (!isOpen && !isEmbeddedTab) return null;

  const handleSelectCatalogChunk = (chunk: MapChunkBlueprint) => {
    const clone = structuredClone ? structuredClone(chunk) : JSON.parse(JSON.stringify(chunk));
    setWorkingChunk(clone);
    setSelectedPointId(clone.constructionPoints[0]?.id || null);
    setSelectedAssetId(null);
    setPreviewRotationDeg(0);
    setPreviewFlipX(false);
    setPreviewFlipY(false);
  };

  const handleCreateNewBlankChunk = () => {
    const W = 6;
    const H = 6;
    const defaultTiles = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        defaultTiles.push({
          col: c,
          row: r,
          terrainTypeId: 'steelGrating',
          label: 'Steel Grating',
          material: 'metal_deck',
          color: '#334155',
          isLiquid: false,
          movementCost: 1,
          elevationOffsetFt: 0
        });
      }
    }
    const fresh = createDefaultMapChunk({
      chunkId: `chunk_custom_${Date.now()}`,
      name: 'New Tactical Module (6x6)',
      description: 'Custom modular map chunk with configurable tiles and construction points.',
      category: 'custom',
      scale: 'Interior',
      widthCells: W,
      heightCells: H,
      tiles: defaultTiles,
      walls: [
        { id: 'w_n', p1: { x: 0, y: 0 }, p2: { x: W, y: 0 }, type: 'solid', label: 'North Wall', breachHp: 120, maxBreachHp: 120, athleticsDc: 20, isSecret: false, cardinalEdge: 'north' },
        { id: 'w_e', p1: { x: W, y: 0 }, p2: { x: W, y: H }, type: 'solid', label: 'East Wall', breachHp: 120, maxBreachHp: 120, athleticsDc: 20, isSecret: false, cardinalEdge: 'east' },
        { id: 'w_s', p1: { x: 0, y: H }, p2: { x: W, y: H }, type: 'solid', label: 'South Wall', breachHp: 120, maxBreachHp: 120, athleticsDc: 20, isSecret: false, cardinalEdge: 'south' },
        { id: 'w_w', p1: { x: 0, y: 0 }, p2: { x: 0, y: H }, type: 'solid', label: 'West Wall', breachHp: 120, maxBreachHp: 120, athleticsDc: 20, isSecret: false, cardinalEdge: 'west' }
      ],
      isCustom: true
    });
    setWorkingChunk(fresh);
    setSelectedPointId(null);
    setSelectedAssetId(null);
    setPreviewRotationDeg(0);
    setPreviewFlipX(false);
    setPreviewFlipY(false);
    showToast({ type: 'info', text: 'Initialized new 6x6 blank chunk blueprint.' });
  };

  const handleDuplicateChunk = () => {
    const copy: MapChunkBlueprint = {
      ...(structuredClone ? structuredClone(workingChunk) : JSON.parse(JSON.stringify(workingChunk))),
      chunkId: `chunk_custom_${Date.now()}`,
      name: `${workingChunk.name} (Variant)`,
      isCustom: true,
      updatedAt: new Date().toISOString()
    };
    copy.thumbnailUrl = renderChunkThumbnailDataUrl(copy);
    setWorkingChunk(copy);
    onSaveChunk(copy);
    showToast({ type: 'success', text: `Created custom variant "${copy.name}".` });
  };

  const handleBakeTransformIntoBlueprint = () => {
    if (!isPreviewTransformed) return;
    const baked: MapChunkBlueprint = {
      ...transformedPreview,
      isCustom: true,
      updatedAt: new Date().toISOString()
    };
    baked.thumbnailUrl = renderChunkThumbnailDataUrl(baked);
    setWorkingChunk(baked);
    setPreviewRotationDeg(0);
    setPreviewFlipX(false);
    setPreviewFlipY(false);
    showToast({
      type: 'success',
      text: `Baked ${previewRotationDeg}° CW / Flip state into blueprint (North Side is now ${baked.northSide}).`
    });
  };

  const handleSynthesizeChunkTileBrush = (recipe: TileSynthesisRecipe, andFillAll = false) => {
    const texUrl = synthesizeTileDataUrl({ ...recipe, resolution: 128 });
    const newBrush = {
      id: `synth_${recipe.id}_${Date.now().toString(36)}`,
      label: `✨ ${recipe.name}`,
      material: recipe.vtt.material,
      color: recipe.palette.secondary || recipe.palette.primary,
      textureUrl: texUrl,
      isLiquid: Boolean(recipe.vtt.isLiquid),
      liquidType:
        recipe.vtt.hazardType === 'acid_corrosive'
          ? ('acid' as const)
          : recipe.vtt.hazardType === 'thermal_fire'
            ? ('magma' as const)
            : undefined,
      movementCost: recipe.vtt.movementCost || 1
    };
    setCustomTileBrushes((prev) => [...prev, newBrush]);
    setSelectedTileBrush(newBrush as any);
    setEraseTileMode(false);
    setIsChunkTileSynthOpen(false);

    if (andFillAll) {
      const W = workingChunk.widthCells;
      const H = workingChunk.heightCells;
      const nextTiles: ChunkTileCell[] = [];
      for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
          nextTiles.push({
            col: c,
            row: r,
            terrainTypeId: newBrush.id,
            label: newBrush.label,
            material: newBrush.material,
            color: newBrush.color,
            textureUrl: newBrush.textureUrl,
            isLiquid: newBrush.isLiquid,
            liquidType: newBrush.liquidType,
            movementCost: newBrush.movementCost,
            elevationOffsetFt: 0
          });
        }
      }
      setWorkingChunk((prev) => ({ ...prev, tiles: nextTiles }));
      showToast({ type: 'success', text: `Synthesized & filled chunk with "${recipe.name}"!` });
    } else {
      showToast({ type: 'success', text: `Added synthesized tile brush "${recipe.name}"!` });
    }
  };

  const handleChunkPromptSynth = async (andFillAll = false) => {
    if (!chunkSynthPrompt.trim()) return;
    setIsChunkSynthLoading(true);
    try {
      const { recipe } = await synthesizeTileRecipeFromPrompt(chunkSynthPrompt);
      handleSynthesizeChunkTileBrush(recipe, andFillAll);
      setChunkSynthPrompt('');
    } finally {
      setIsChunkSynthLoading(false);
    }
  };

  const handleFillFloorTiles = () => {
    const W = workingChunk.widthCells;
    const H = workingChunk.heightCells;
    const nextTiles: ChunkTileCell[] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        nextTiles.push({
          col: c,
          row: r,
          terrainTypeId: selectedTileBrush.id,
          label: selectedTileBrush.label,
          material: selectedTileBrush.material,
          color: selectedTileBrush.color,
          textureUrl: (selectedTileBrush as any).textureUrl,
          isLiquid: selectedTileBrush.isLiquid,
          liquidType: (selectedTileBrush as any).liquidType,
          movementCost: (selectedTileBrush as any).movementCost ?? (selectedTileBrush.isLiquid ? 2 : 1),
          elevationOffsetFt: 0
        });
      }
    }
    setWorkingChunk((prev) => ({ ...prev, tiles: nextTiles }));
  };

  // Cell click handler on the Workbench Grid (operates on base workingChunk when transform is reset, or auto-resets preview)
  const handleCellClick = (col: number, row: number) => {
    if (isPreviewTransformed) {
      showToast({
        type: 'info',
        text: 'Resetting preview transform to edit canonical blueprint coordinates (or click "Bake Transform" first).'
      });
      setPreviewRotationDeg(0);
      setPreviewFlipX(false);
      setPreviewFlipY(false);
      return;
    }

    if (activeTool === 'tile') {
      setWorkingChunk((prev) => {
        const filtered = prev.tiles.filter((t) => !(t.col === col && t.row === row));
        if (eraseTileMode) {
          return { ...prev, tiles: filtered };
        }
        return {
          ...prev,
          tiles: [
            ...filtered,
            {
              col,
              row,
              terrainTypeId: selectedTileBrush.id,
              label: selectedTileBrush.label,
              material: selectedTileBrush.material,
              color: selectedTileBrush.color,
              textureUrl: (selectedTileBrush as any).textureUrl,
              isLiquid: selectedTileBrush.isLiquid,
              liquidType: (selectedTileBrush as any).liquidType,
              movementCost: (selectedTileBrush as any).movementCost ?? (selectedTileBrush.isLiquid ? 2 : 1),
              elevationOffsetFt: 0
            }
          ]
        };
      });
      return;
    }

    if (activeTool === 'asset') {
      const existing = workingChunk.assets.find(
        (a) =>
          col >= a.col &&
          col < a.col + (a.widthCells || 1) &&
          row >= a.row &&
          row < a.row + (a.heightCells || 1)
      );
      if (existing) {
        setSelectedAssetId(existing.id);
        setSelectedPointId(null);
        return;
      }

      const wCells = Math.min(selectedAssetPreset.w, workingChunk.widthCells - col);
      const hCells = Math.min(selectedAssetPreset.h, workingChunk.heightCells - row);
      const newAsset: ChunkPlacedAsset = {
        id: `asset_${Date.now().toString(36)}`,
        col,
        row,
        widthCells: Math.max(1, wCells),
        heightCells: Math.max(1, hCells),
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: selectedAssetPreset.keepUpright,
        type: selectedAssetPreset.type,
        label: selectedAssetPreset.label,
        category: 'Objects',
        shape: selectedAssetPreset.shape,
        color: selectedAssetPreset.color,
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      };
      setWorkingChunk((prev) => ({
        ...prev,
        assets: [...prev.assets, newAsset]
      }));
      setSelectedAssetId(newAsset.id);
      setSelectedPointId(null);
      return;
    }

    if (activeTool === 'slot') {
      const existingSlot = workingChunk.constructionPoints.find(
        (cp) => cp.kind === 'internal_slot' && cp.col === col && cp.row === row
      );
      if (existingSlot) {
        setSelectedPointId(existingSlot.id);
        setSelectedAssetId(null);
        return;
      }

      const newSlot: ChunkConstructionPoint = {
        id: `slot_${Date.now().toString(36)}`,
        label: `${selectedSlotCategory.replace('_', ' ').toUpperCase()} (${col},${row})`,
        kind: 'internal_slot',
        col,
        row,
        slotCategory: selectedSlotCategory,
        footprintCells: [1, 1],
        defaultAssetId: selectedSlotCategory === 'turret_hardpoint' ? 'turret' : 'terminal',
        defaultAssetLabel:
          selectedSlotCategory === 'turret_hardpoint'
            ? 'Automated Defense Turret'
            : selectedSlotCategory === 'loot_cache'
            ? 'Supply Cache Locker'
            : selectedSlotCategory === 'hazard_emitter'
            ? 'Plasma Purge Emitter'
            : 'System Terminal Node',
        defaultShape: selectedSlotCategory === 'turret_hardpoint' ? 'hexagon' : 'rect',
        defaultColor:
          selectedSlotCategory === 'turret_hardpoint' || selectedSlotCategory === 'hazard_emitter'
            ? '#ef4444'
            : selectedSlotCategory === 'loot_cache'
            ? '#10b981'
            : '#22d3ee',
        rotationDeg: 0,
        arcFacingDeg: selectedSlotCategory === 'turret_hardpoint' ? 0 : undefined,
        allowOverride: true,
        assignedProperties: {
          isLocked: selectedSlotCategory === 'loot_cache',
          hackDc: 14,
          breachHp: 50,
          coverRating: 'half_cover',
          isArmed:
            selectedSlotCategory === 'turret_hardpoint' ||
            selectedSlotCategory === 'hazard_emitter',
          factionDesignation: 'Neutral'
        }
      };

      setWorkingChunk((prev) => ({
        ...prev,
        constructionPoints: [...prev.constructionPoints, newSlot]
      }));
      setSelectedPointId(newSlot.id);
      setSelectedAssetId(null);
      return;
    }

    if (activeTool === 'socket') {
      // Determine closest outer perimeter edge to (col, row)
      const W = workingChunk.widthCells;
      const H = workingChunk.heightCells;
      const distN = row;
      const distS = H - 1 - row;
      const distW = col;
      const distE = W - 1 - col;
      const minDist = Math.min(distN, distS, distW, distE);

      let edge: CardinalEdge = 'north';
      let cellOffset = col;
      if (minDist === distN) {
        edge = 'north';
        cellOffset = Math.min(W - selectedSocketSpan, col);
      } else if (minDist === distS) {
        edge = 'south';
        cellOffset = Math.min(W - selectedSocketSpan, col);
      } else if (minDist === distE) {
        edge = 'east';
        cellOffset = Math.min(H - selectedSocketSpan, row);
      } else {
        edge = 'west';
        cellOffset = Math.min(H - selectedSocketSpan, row);
      }
      cellOffset = Math.max(0, cellOffset);

      const existingSocket = workingChunk.constructionPoints.find(
        (cp) =>
          cp.kind === 'perimeter_socket' &&
          cp.edge === edge &&
          cp.cellOffset === cellOffset
      );
      if (existingSocket) {
        setSelectedPointId(existingSocket.id);
        setSelectedAssetId(null);
        return;
      }

      const newSocket: ChunkConstructionPoint = {
        id: `sock_${edge}_${Date.now().toString(36)}`,
        label: `${edge.toUpperCase()} ${selectedSocketType} Socket`,
        kind: 'perimeter_socket',
        col,
        row,
        edge,
        cellOffset,
        spanCells: selectedSocketSpan,
        socketType: selectedSocketType,
        autoSpawnDoor: true,
        defaultDoorType: selectedSocketType === 'airlock' ? 'airlock' : 'bulkhead',
        doorLockDc: 14,
        breachHp: 65,
        footprintCells: [1, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { hackDc: 14, breachHp: 65 }
      };

      setWorkingChunk((prev) => ({
        ...prev,
        constructionPoints: [...prev.constructionPoints, newSocket]
      }));
      setSelectedPointId(newSocket.id);
      setSelectedAssetId(null);
      return;
    }

    if (activeTool === 'light') {
      const existingLight = workingChunk.lights.find(
        (l) => l.col === col && l.row === row
      );
      if (existingLight) {
        setWorkingChunk((prev) => ({
          ...prev,
          lights: prev.lights.filter((l) => l.id !== existingLight.id)
        }));
        return;
      }
      setWorkingChunk((prev) => ({
        ...prev,
        lights: [
          ...prev.lights,
          {
            id: `light_${Date.now().toString(36)}`,
            col,
            row,
            offsetX: 0.5,
            offsetY: 0.5,
            radiusCells: 3.5,
            color: '#38bdf8',
            intensity: 0.85,
            animation: 'steady',
            label: `Luminaire (${col},${row})`
          }
        ]
      }));
      return;
    }

    if (activeTool === 'wall') {
      // Toggle 1-cell wall on top/north edge of clicked cell (or outer south/east if at boundary)
      const p1 = { x: col, y: row };
      const p2 = { x: col + 1, y: row };
      setWorkingChunk((prev) => {
        const existingIdx = prev.walls.findIndex(
          (w) =>
            (w.p1.x === p1.x && w.p1.y === p1.y && w.p2.x === p2.x && w.p2.y === p2.y) ||
            (w.p1.x === p2.x && w.p1.y === p2.y && w.p2.x === p1.x && w.p2.y === p1.y)
        );
        if (existingIdx >= 0) {
          const nextWalls = [...prev.walls];
          nextWalls.splice(existingIdx, 1);
          return { ...prev, walls: nextWalls };
        }
        return {
          ...prev,
          walls: [
            ...prev.walls,
            {
              id: `w_${Date.now().toString(36)}`,
              p1,
              p2,
              type: selectedWallType,
              doorState: selectedWallType === 'door' ? 'closed' : null,
              label: selectedWallType === 'door' ? 'Bulkhead Door' : 'Bulkhead Wall',
              breachHp: selectedWallType === 'door' ? 60 : 120,
              maxBreachHp: selectedWallType === 'door' ? 60 : 120,
              hackDc: selectedWallType === 'door' ? 14 : null,
              athleticsDc: 20,
              isSecret: false,
              cardinalEdge: row === 0 ? 'north' : undefined
            }
          ]
        };
      });
    }
  };

  const selectedPoint = workingChunk.constructionPoints.find((cp) => cp.id === selectedPointId) || null;
  const selectedAsset = workingChunk.assets.find((a) => a.id === selectedAssetId) || null;

  const updateSelectedPoint = (updates: Partial<ChunkConstructionPoint>) => {
    if (!selectedPointId) return;
    setWorkingChunk((prev) => ({
      ...prev,
      constructionPoints: prev.constructionPoints.map((cp) =>
        cp.id === selectedPointId ? { ...cp, ...updates } : cp
      )
    }));
  };

  const updateSelectedAsset = (updates: Partial<ChunkPlacedAsset>) => {
    if (!selectedAssetId) return;
    setWorkingChunk((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === selectedAssetId ? { ...a, ...updates } : a))
    }));
  };

  const handleSaveCurrentBlueprint = () => {
    const updated: MapChunkBlueprint = {
      ...workingChunk,
      isCustom: true,
      updatedAt: new Date().toISOString()
    };
    updated.thumbnailUrl = renderChunkThumbnailDataUrl(updated);
    setWorkingChunk(updated);
    onSaveChunk(updated);
    showToast({
      type: 'success',
      text: `Saved Map Chunk Blueprint "${updated.name}" (${updated.widthCells}x${updated.heightCells}).`
    });
  };

  const cellPx = Math.min(
    48,
    Math.max(
      26,
      Math.floor(420 / Math.max(transformedPreview.widthCells, transformedPreview.heightCells))
    )
  );
  const gridWidthPx = transformedPreview.widthCells * cellPx;
  const gridHeightPx = transformedPreview.heightCells * cellPx;

  const content = (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-cyan-900/60 shadow-md gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Blocks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-cyan-300">
                Chunk Forge Studio & Construction Point Workbench
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/50">
                Hybrid Chunk / Tile System
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Build reusable multi-tile prefabs with perimeter snap sockets, internal asset hardpoints, and D4 (90° CW + H/V Flip) transforms.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCreateNewBlankChunk}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Blank Chunk</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateChunk}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>Clone Variant</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCurrentBlueprint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-md shadow-emerald-950/60 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Blueprint</span>
          </button>

          {onSelectChunkToStamp && (
            <button
              type="button"
              onClick={() =>
                onSelectChunkToStamp(workingChunk, {
                  rotationDeg: previewRotationDeg,
                  flipX: previewFlipX,
                  flipY: previewFlipY
                })
              }
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-md shadow-cyan-950/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stamp on Map Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEmbeddedTab && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer"
              title="Close Chunk Studio"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Studio Body */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN (3 cols): Blueprint Catalog + Blueprint Dimensions/Metadata */}
        <div className="col-span-3 border-r border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Chunk Blueprint Library ({filteredCatalog.length})
              </span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chunks or tags..."
              className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-300 font-mono"
            >
              <option value="All">All Categories</option>
              {CHUNK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CHUNK_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Scrollable Blueprint List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredCatalog.map((item) => {
              const isSelected = item.chunkId === workingChunk.chunkId;
              return (
                <div
                  key={item.chunkId}
                  onClick={() => handleSelectCatalogChunk(item)}
                  className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded border border-slate-700 object-contain bg-slate-950 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-semibold truncate">{item.name}</div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                        <span>
                          {item.widthCells}×{item.heightCells}
                        </span>
                        <span>•</span>
                        <span>{item.constructionPoints.length} CPs</span>
                        {item.isCustom && (
                          <span className="px-1 rounded bg-purple-950 text-purple-300 border border-purple-700/50">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.isCustom && onDeleteChunk && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChunk(item.chunkId);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete custom chunk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Blueprint Metadata & Dimensions */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Blueprint Metadata & Footprint
            </div>
            <input
              type="text"
              value={workingChunk.name}
              onChange={(e) =>
                setWorkingChunk((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
              placeholder="Blueprint Name"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400">Category</label>
                <select
                  value={workingChunk.category}
                  onChange={(e) =>
                    setWorkingChunk((prev) => ({
                      ...prev,
                      category: e.target.value as ChunkCategory
                    }))
                  }
                  className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-200"
                >
                  {CHUNK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CHUNK_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">W (Cells)</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={workingChunk.widthCells}
                    onChange={(e) =>
                      setWorkingChunk((prev) => ({
                        ...prev,
                        widthCells: Math.max(2, Math.min(24, Number(e.target.value) || 6))
                      }))
                    }
                    className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">H (Cells)</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={workingChunk.heightCells}
                    onChange={(e) =>
                      setWorkingChunk((prev) => ({
                        ...prev,
                        heightCells: Math.max(2, Math.min(24, Number(e.target.value) || 6))
                      }))
                    }
                    className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (6 cols): Workbench Tool Ribbon + D4 Rotation/Flip Sandbox + Interactive Grid */}
        <div className="col-span-6 flex flex-col bg-[#070b12] overflow-hidden">
          {/* Workbench Tool Ribbon */}
          <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1">
              {[
                { id: 'tile', label: '1. Floor Tiles', icon: Paintbrush },
                { id: 'wall', label: '2. Walls/Doors', icon: Shield },
                { id: 'asset', label: '3. Fixed Assets', icon: Box },
                { id: 'socket', label: '4. Snap Sockets', icon: Plug },
                { id: 'slot', label: '5. Hardpoint Slots', icon: Cpu },
                { id: 'light', label: '6. Lights', icon: Sun }
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTool(t.id as WorkbenchTool)}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-tool options bar */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              {activeTool === 'tile' && (
                <>
                  <select
                    value={selectedTileBrush.id}
                    onChange={(e) => {
                      const found = allTileBrushes.find((p) => p.id === e.target.value);
                      if (found) setSelectedTileBrush(found as any);
                    }}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    {allTileBrushes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setEraseTileMode((v) => !v)}
                    className={`px-2 py-1 rounded border text-[11px] cursor-pointer ${
                      eraseTileMode
                        ? 'bg-rose-900 border-rose-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {eraseTileMode ? 'Eraser ON' : 'Paint Mode'}
                  </button>
                  <button
                    type="button"
                    onClick={handleFillFloorTiles}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] text-cyan-300 cursor-pointer"
                  >
                    Fill All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChunkTileSynthOpen((v) => !v)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-800 border border-purple-600 text-[11px] text-purple-200 font-semibold cursor-pointer"
                    title="Synthesize a custom HIFI CHROMA seamless tile brush for this chunk"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>+ Synth Tile</span>
                  </button>
                </>
              )}

              {activeTool === 'wall' && (
                <select
                  value={selectedWallType}
                  onChange={(e) => setSelectedWallType(e.target.value as any)}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-amber-300"
                >
                  <option value="solid">Solid Bulkhead Wall</option>
                  <option value="door">Interactive Door / Airlock</option>
                  <option value="window">Armored Viewport Window</option>
                  <option value="one_way">One-Way Smart Partition</option>
                </select>
              )}

              {activeTool === 'asset' && (
                <select
                  value={selectedAssetPreset.type}
                  onChange={(e) => {
                    const found = ASSET_PRESETS.find((p) => p.type === e.target.value);
                    if (found) setSelectedAssetPreset(found);
                  }}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-cyan-300"
                >
                  {ASSET_PRESETS.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.label} ({p.w}×{p.h})
                    </option>
                  ))}
                </select>
              )}

              {activeTool === 'socket' && (
                <>
                  <select
                    value={selectedSocketType}
                    onChange={(e) => setSelectedSocketType(e.target.value as any)}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-emerald-300"
                  >
                    {SOCKET_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSocketSpan}
                    onChange={(e) => setSelectedSocketSpan(Number(e.target.value))}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-emerald-300"
                  >
                    <option value={1}>Span: 1 Cell</option>
                    <option value={2}>Span: 2 Cells</option>
                  </select>
                </>
              )}

              {activeTool === 'slot' && (
                <select
                  value={selectedSlotCategory}
                  onChange={(e) => setSelectedSlotCategory(e.target.value as any)}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-cyan-300"
                >
                  {INTERNAL_SLOT_CATEGORIES.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Inline HIFI CHROMA Chunk Tile Synthesizer Bar */}
          {isChunkTileSynthOpen && (
            <div className="px-3 py-2.5 bg-slate-950 border-b border-purple-800/70 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <input
                  type="text"
                  value={chunkSynthPrompt}
                  onChange={(e) => setChunkSynthPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleChunkPromptSynth(false);
                    }
                  }}
                  placeholder="Describe chunk tile (e.g. 'rusted starship grate over glowing green acid', 'cryo frost deck')..."
                  className="flex-1 bg-slate-900 border border-purple-700/60 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => handleChunkPromptSynth(false)}
                  disabled={isChunkSynthLoading || !chunkSynthPrompt.trim()}
                  className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-semibold"
                >
                  {isChunkSynthLoading ? '...' : 'Add Brush'}
                </button>
                <button
                  type="button"
                  onClick={() => handleChunkPromptSynth(true)}
                  disabled={isChunkSynthLoading || !chunkSynthPrompt.trim()}
                  className="px-2.5 py-1 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white font-semibold"
                >
                  Synth & Fill All
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const preset = HIFI_CHROMA_TILE_PRESETS.find((p) => p.id === e.target.value);
                    if (preset) {
                      handleSynthesizeChunkTileBrush(preset, false);
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-cyan-300"
                >
                  <option value="" disabled>
                    Or Pick HIFI CHROMA Preset...
                  </option>
                  {HIFI_CHROMA_TILE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.catalogCode ? `[${preset.catalogCode}] ` : ''}{preset.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsChunkTileSynthOpen(false)}
                  className="text-slate-400 hover:text-white px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Live D4 Orientation & Flip Verification Bar */}
          <div className="px-3 py-2 bg-slate-950 border-b border-cyan-950 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Orientation & Symmetry Sandbox:
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
                North Side: {transformedPreview.northSide}{' '}
                {transformedPreview.northSide === 'N'
                  ? '▲ (Top)'
                  : transformedPreview.northSide === 'E'
                  ? '▶ (Right)'
                  : transformedPreview.northSide === 'S'
                  ? '▼ (Bottom)'
                  : '◀ (Left)'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Footprint: {transformedPreview.widthCells}×{transformedPreview.heightCells}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() =>
                  setPreviewRotationDeg(
                    ((previewRotationDeg + 90) % 360) as 0 | 90 | 180 | 270
                  )
                }
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-300 text-xs font-mono font-semibold cursor-pointer"
                title="Rotate 90° Clockwise (North -> East -> South -> West)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90° CW ({previewRotationDeg}°)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewFlipX((v) => !v)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-xs font-mono cursor-pointer ${
                  previewFlipX
                    ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Flip Chunk Horizontally (Mirror East <-> West)"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip H</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewFlipY((v) => !v)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-xs font-mono cursor-pointer ${
                  previewFlipY
                    ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Flip Chunk Vertically (Mirror North <-> South)"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Flip V</span>
              </button>

              {isPreviewTransformed && (
                <>
                  <button
                    type="button"
                    onClick={handleBakeTransformIntoBlueprint}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/60 text-emerald-200 text-[11px] font-mono cursor-pointer"
                    title="Permanently commit this rotated/flipped geometry into the blueprint"
                  >
                    <Check className="w-3 h-3" />
                    <span>Bake</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewRotationDeg(0);
                      setPreviewFlipX(false);
                      setPreviewFlipY(false);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                    title="Reset Sandbox Transform"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interactive SVG Grid Canvas */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto relative">
            <div className="relative p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-2xl">
              {/* North-Side Reference Compass Indicator Badge on whichever edge is currently North */}
              <div
                className={`absolute flex items-center justify-center pointer-events-none font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-lg ${
                  transformedPreview.northSide === 'N'
                    ? '-top-3 left-1/2 -translate-x-1/2'
                    : transformedPreview.northSide === 'S'
                    ? '-bottom-3 left-1/2 -translate-x-1/2'
                    : transformedPreview.northSide === 'E'
                    ? '-right-3 top-1/2 -translate-y-1/2'
                    : '-left-3 top-1/2 -translate-y-1/2'
                }`}
              >
                NORTH ({transformedPreview.northSide})
              </div>

              <svg
                width={gridWidthPx + 24}
                height={gridHeightPx + 24}
                viewBox={`-12 -12 ${gridWidthPx + 24} ${gridHeightPx + 24}`}
                className="overflow-visible"
              >
                {/* Base Grid Cells */}
                {Array.from({ length: transformedPreview.heightCells }).map((_, r) =>
                  Array.from({ length: transformedPreview.widthCells }).map((__, c) => {
                    const tile = transformedPreview.tiles.find(
                      (t) => t.col === c && t.row === r
                    );
                    return (
                      <g
                        key={`cell_${c}_${r}`}
                        onClick={() => handleCellClick(c, r)}
                        className="cursor-pointer group"
                      >
                        <rect
                          x={c * cellPx}
                          y={r * cellPx}
                          width={cellPx}
                          height={cellPx}
                          fill={tile ? tile.color : '#090d16'}
                          stroke="#1e293b"
                          strokeWidth={1}
                          className="group-hover:stroke-cyan-400 transition-colors"
                        />
                        {tile?.textureUrl && (
                          <image
                            href={tile.textureUrl}
                            x={c * cellPx}
                            y={r * cellPx}
                            width={cellPx}
                            height={cellPx}
                            preserveAspectRatio="none"
                            className="pointer-events-none"
                          />
                        )}
                        {tile?.isLiquid && (
                          <circle
                            cx={(c + 0.5) * cellPx}
                            cy={(r + 0.5) * cellPx}
                            r={cellPx * 0.18}
                            fill="#ffffff"
                            fillOpacity={0.25}
                          />
                        )}
                      </g>
                    );
                  })
                )}

                {/* Dynamic Light Emitter Radii */}
                {transformedPreview.lights.map((l) => {
                  const lx = (l.col + (l.offsetX ?? 0.5)) * cellPx;
                  const ly = (l.row + (l.offsetY ?? 0.5)) * cellPx;
                  return (
                    <g key={l.id} className="pointer-events-none">
                      <circle
                        cx={lx}
                        cy={ly}
                        r={Math.min(gridWidthPx, (l.radiusCells || 3) * cellPx * 0.45)}
                        fill={l.color || '#38bdf8'}
                        fillOpacity={0.14}
                        stroke={l.color || '#38bdf8'}
                        strokeDasharray="3,3"
                        strokeWidth={1}
                      />
                      <circle
                        cx={lx}
                        cy={ly}
                        r={5}
                        fill={l.color || '#38bdf8'}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </g>
                  );
                })}

                {/* Placed Multi-Cell Assets */}
                {transformedPreview.assets.map((asset) => {
                  const ax = asset.col * cellPx + 3;
                  const ay = asset.row * cellPx + 3;
                  const aw = (asset.widthCells || 1) * cellPx - 6;
                  const ah = (asset.heightCells || 1) * cellPx - 6;
                  const cx = (asset.col + (asset.widthCells || 1) / 2) * cellPx;
                  const cy = (asset.row + (asset.heightCells || 1) / 2) * cellPx;
                  const isSel = selectedAssetId === asset.id;

                  return (
                    <g
                      key={asset.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssetId(asset.id);
                        setSelectedPointId(null);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={ax}
                        y={ay}
                        width={aw}
                        height={ah}
                        rx={asset.shape === 'circle' ? Math.min(aw, ah) / 2 : 5}
                        fill={asset.color || '#38bdf8'}
                        fillOpacity={0.85}
                        stroke={isSel ? '#facc15' : '#0f172a'}
                        strokeWidth={isSel ? 2.5 : 1.5}
                      />
                      <text
                        x={cx}
                        y={cy + 3}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={9}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {(asset.label || '').slice(0, 10)}
                      </text>
                    </g>
                  );
                })}

                {/* Internal Construction Point Slots */}
                {transformedPreview.constructionPoints
                  .filter((cp) => cp.kind === 'internal_slot')
                  .map((cp) => {
                    const [fw, fh] = cp.footprintCells || [1, 1];
                    const cx = ((cp.col || 0) + fw / 2) * cellPx;
                    const cy = ((cp.row || 0) + fh / 2) * cellPx;
                    const r = Math.min(fw, fh) * cellPx * 0.36;
                    const isSel = selectedPointId === cp.id;

                    // Facing indicator line
                    const angleRad = (((cp.arcFacingDeg ?? cp.rotationDeg ?? 0) - 90) * Math.PI) / 180;
                    const fx = cx + Math.cos(angleRad) * (r + 8);
                    const fy = cy + Math.sin(angleRad) * (r + 8);

                    return (
                      <g
                        key={cp.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPointId(cp.id);
                          setSelectedAssetId(null);
                        }}
                        className="cursor-pointer"
                      >
                        <polygon
                          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
                          fill={cp.defaultColor || '#22d3ee'}
                          fillOpacity={0.9}
                          stroke={isSel ? '#facc15' : '#ffffff'}
                          strokeWidth={isSel ? 2.5 : 1.5}
                        />
                        <line
                          x1={cx}
                          y1={cy}
                          x2={fx}
                          y2={fy}
                          stroke="#facc15"
                          strokeWidth={2}
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fill="#020617"
                          fontSize={8}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          CP
                        </text>
                      </g>
                    );
                  })}

                {/* Walls, Doors, Windows, and One-Way Normal Arrows */}
                {transformedPreview.walls.map((w) => {
                  const x1 = w.p1.x * cellPx;
                  const y1 = w.p1.y * cellPx;
                  const x2 = w.p2.x * cellPx;
                  const y2 = w.p2.y * cellPx;
                  const stroke =
                    w.type === 'door'
                      ? '#f59e0b'
                      : w.type === 'window'
                      ? '#38bdf8'
                      : w.type === 'one_way'
                      ? '#a855f7'
                      : '#e2e8f0';
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.hypot(dx, dy) || 1;
                  // Normal vector for one_way wall
                  const nx = (-dy / len) * 8;
                  const ny = (dx / len) * 8;

                  return (
                    <g key={w.id} className="pointer-events-none">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={stroke}
                        strokeWidth={w.type === 'door' ? 5 : 4}
                        strokeDasharray={
                          w.type === 'door'
                            ? '6,3'
                            : w.type === 'window'
                            ? '3,3'
                            : undefined
                        }
                        strokeLinecap="round"
                      />
                      {w.type === 'one_way' && (
                        <line
                          x1={mx}
                          y1={my}
                          x2={mx + nx}
                          y2={my + ny}
                          stroke="#a855f7"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Perimeter Snap Sockets */}
                {transformedPreview.constructionPoints
                  .filter((cp) => cp.kind === 'perimeter_socket' && cp.edge)
                  .map((cp) => {
                    const offset = cp.cellOffset || 0;
                    const span = cp.spanCells || 1;
                    const W = transformedPreview.widthCells;
                    const H = transformedPreview.heightCells;
                    let sx = 0;
                    let sy = 0;
                    let sw = 12;
                    let sh = 12;

                    if (cp.edge === 'north') {
                      sx = offset * cellPx + 4;
                      sy = -6;
                      sw = span * cellPx - 8;
                      sh = 12;
                    } else if (cp.edge === 'south') {
                      sx = offset * cellPx + 4;
                      sy = H * cellPx - 6;
                      sw = span * cellPx - 8;
                      sh = 12;
                    } else if (cp.edge === 'east') {
                      sx = W * cellPx - 6;
                      sy = offset * cellPx + 4;
                      sw = 12;
                      sh = span * cellPx - 8;
                    } else {
                      sx = -6;
                      sy = offset * cellPx + 4;
                      sw = 12;
                      sh = span * cellPx - 8;
                    }

                    const isSel = selectedPointId === cp.id;
                    return (
                      <g
                        key={cp.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPointId(cp.id);
                          setSelectedAssetId(null);
                        }}
                        className="cursor-pointer"
                      >
                        <rect
                          x={sx}
                          y={sy}
                          width={Math.max(10, sw)}
                          height={Math.max(10, sh)}
                          rx={3}
                          fill="#10b981"
                          stroke={isSel ? '#facc15' : '#052e16'}
                          strokeWidth={isSel ? 2.5 : 1.5}
                        />
                      </g>
                    );
                  })}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols): Construction Point & Adjustable Properties Inspector */}
        <div className="col-span-3 border-l border-slate-800 bg-slate-900/60 flex flex-col overflow-y-auto p-3 space-y-4">
          {/* Section 1: Selected Construction Point OR Placed Asset Inspector */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-cyan-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Construction Point Inspector</span>
              </span>
              {(selectedPoint || selectedAsset) && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPoint) {
                      setWorkingChunk((prev) => ({
                        ...prev,
                        constructionPoints: prev.constructionPoints.filter(
                          (cp) => cp.id !== selectedPoint.id
                        )
                      }));
                      setSelectedPointId(null);
                    } else if (selectedAsset) {
                      setWorkingChunk((prev) => ({
                        ...prev,
                        assets: prev.assets.filter((a) => a.id !== selectedAsset.id)
                      }));
                      setSelectedAssetId(null);
                    }
                  }}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {selectedPoint ? (
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400">Point Label</label>
                  <input
                    type="text"
                    value={selectedPoint.label}
                    onChange={(e) => updateSelectedPoint({ label: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                {selectedPoint.kind === 'perimeter_socket' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Edge</label>
                        <select
                          value={selectedPoint.edge || 'north'}
                          onChange={(e) =>
                            updateSelectedPoint({ edge: e.target.value as CardinalEdge })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300"
                        >
                          <option value="north">North</option>
                          <option value="east">East</option>
                          <option value="south">South</option>
                          <option value="west">West</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Span Cells</label>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={selectedPoint.spanCells}
                          onChange={(e) =>
                            updateSelectedPoint({ spanCells: Math.max(1, Number(e.target.value) || 1) })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Door Lock DC</label>
                        <input
                          type="number"
                          value={selectedPoint.doorLockDc ?? 14}
                          onChange={(e) =>
                            updateSelectedPoint({ doorLockDc: Number(e.target.value) || 14 })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Breach HP</label>
                        <input
                          type="number"
                          value={selectedPoint.breachHp ?? 60}
                          onChange={(e) =>
                            updateSelectedPoint({ breachHp: Number(e.target.value) || 60 })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] text-slate-400">Default Spawned Asset Label</label>
                      <input
                        type="text"
                        value={selectedPoint.defaultAssetLabel || ''}
                        onChange={(e) =>
                          updateSelectedPoint({ defaultAssetLabel: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Facing Angle (°)</label>
                        <input
                          type="number"
                          step={45}
                          value={selectedPoint.rotationDeg || 0}
                          onChange={(e) =>
                            updateSelectedPoint({
                              rotationDeg: ((Number(e.target.value) % 360) + 360) % 360,
                              arcFacingDeg: ((Number(e.target.value) % 360) + 360) % 360
                            })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Cover Rating</label>
                        <select
                          value={selectedPoint.assignedProperties?.coverRating || 'half_cover'}
                          onChange={(e) =>
                            updateSelectedPoint({
                              assignedProperties: {
                                ...selectedPoint.assignedProperties,
                                coverRating: e.target.value as any
                              }
                            })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                        >
                          <option value="none">None</option>
                          <option value="quarter_cover">Quarter Cover</option>
                          <option value="half_cover">Half Cover (+2)</option>
                          <option value="three_quarters">3/4 Cover (+5)</option>
                          <option value="full_cover">Full Cover</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Hack / Disarm DC</label>
                        <input
                          type="number"
                          value={selectedPoint.assignedProperties?.hackDc ?? 14}
                          onChange={(e) =>
                            updateSelectedPoint({
                              assignedProperties: {
                                ...selectedPoint.assignedProperties,
                                hackDc: Number(e.target.value) || 14,
                                disarmDc: Number(e.target.value) || 14
                              }
                            })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Breach HP</label>
                        <input
                          type="number"
                          value={selectedPoint.assignedProperties?.breachHp ?? 50}
                          onChange={(e) =>
                            updateSelectedPoint({
                              assignedProperties: {
                                ...selectedPoint.assignedProperties,
                                breachHp: Number(e.target.value) || 50
                              }
                            })
                          }
                          className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : selectedAsset ? (
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400">Fixed Asset Label</label>
                  <input
                    type="text"
                    value={selectedAsset.label}
                    onChange={(e) => updateSelectedAsset({ label: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[10px] text-slate-400">W Cells</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={selectedAsset.widthCells}
                      onChange={(e) =>
                        updateSelectedAsset({ widthCells: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">H Cells</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={selectedAsset.heightCells}
                      onChange={(e) =>
                        updateSelectedAsset({ heightCells: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Rot (°)</label>
                    <input
                      type="number"
                      step={90}
                      value={selectedAsset.rotationDeg}
                      onChange={(e) =>
                        updateSelectedAsset({
                          rotationDeg: ((Number(e.target.value) % 360) + 360) % 360
                        })
                      }
                      className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300"
                    />
                  </div>
                </div>
                <label className="flex items-center space-x-2 text-[11px] text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedAsset.keepUpright)}
                    onChange={(e) => updateSelectedAsset({ keepUpright: e.target.checked })}
                  />
                  <span>Keep Upright When Chunk Rotates/Flips</span>
                </label>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-slate-400 py-2">
                Click any green Perimeter Socket, cyan Hardpoint Diamond, or Placed Asset on the grid to inspect and configure its properties.
              </div>
            )}
          </div>

          {/* Section 2: All Construction Points List */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Blueprint Construction Points ({workingChunk.constructionPoints.length})
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {workingChunk.constructionPoints.map((cp) => (
                <div
                  key={cp.id}
                  onClick={() => {
                    setSelectedPointId(cp.id);
                    setSelectedAssetId(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                    selectedPointId === cp.id
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cp.label}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      cp.kind === 'perimeter_socket'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-cyan-950 text-cyan-300'
                    }`}
                  >
                    {cp.kind === 'perimeter_socket' ? cp.edge : cp.slotCategory}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Default Adjustable Chunk Settings */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs font-mono">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Default Adjustable Chunk Properties
            </div>
            <div>
              <label className="block text-[10px] text-slate-400">Default Power State</label>
              <select
                value={workingChunk.defaultSettings.powerState}
                onChange={(e) =>
                  setWorkingChunk((prev) => ({
                    ...prev,
                    defaultSettings: {
                      ...prev.defaultSettings,
                      powerState: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
              >
                {CHUNK_POWER_STATES.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400">
                Default Security Tier (LV {workingChunk.defaultSettings.securityTier})
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={workingChunk.defaultSettings.securityTier}
                onChange={(e) =>
                  setWorkingChunk((prev) => ({
                    ...prev,
                    defaultSettings: {
                      ...prev.defaultSettings,
                      securityTier: Number(e.target.value)
                    }
                  }))
                }
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400">Condition</label>
                <select
                  value={workingChunk.defaultSettings.conditionState}
                  onChange={(e) =>
                    setWorkingChunk((prev) => ({
                      ...prev,
                      defaultSettings: {
                        ...prev.defaultSettings,
                        conditionState: e.target.value as any
                      }
                    }))
                  }
                  className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {CHUNK_CONDITION_STATES.map((cs) => (
                    <option key={cs} value={cs}>
                      {cs}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Biome Theme</label>
                <select
                  value={workingChunk.defaultSettings.biomeThemeOverride}
                  onChange={(e) =>
                    setWorkingChunk((prev) => ({
                      ...prev,
                      defaultSettings: {
                        ...prev.defaultSettings,
                        biomeThemeOverride: e.target.value
                      }
                    }))
                  }
                  className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {CHUNK_BIOME_THEMES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEmbeddedTab) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-7xl h-[90vh] rounded-xl border border-cyan-500/40 overflow-hidden shadow-2xl flex flex-col">
        {content}
      </div>
    </div>
  );
};
export default ChunkStudioModal;
