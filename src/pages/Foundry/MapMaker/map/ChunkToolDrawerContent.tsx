/**
 * @file ChunkToolDrawerContent.tsx
 * @description Shared Chunk Stamp Tool Drawer UI for ArchitectConsoleRail and MapToolsPanel.
 * Provides searchable MapChunkBlueprint selection, 90° CW North-Side Rotation & H/V Flip controls,
 * Magnetic Socket Snap toggle, Pre-Placement Adjustable Assigned Properties, and Construction Point Slot overrides.
 */

import React, { useState, useMemo } from 'react';
import {
  Blocks,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Compass,
  Sliders,
  Sparkles,
  Magnet,
  Cpu
} from 'lucide-react';
import {
  type MapChunkBlueprint,
  CHUNK_CATEGORIES,
  CHUNK_CATEGORY_LABELS,
  CHUNK_POWER_STATES,
  CHUNK_CONDITION_STATES,
  CHUNK_BIOME_THEMES,
  type ChunkAdjustableSettings,
  type ChunkSlotOverride
} from '../../../../schemas/mapChunkSchema';
import { transformChunkBlueprint } from '../../../../services/mapChunkCompilerService';
import { getChunksForScale } from './MapAssetCatalog';

export interface ChunkToolDrawerContentProps {
  customChunks?: MapChunkBlueprint[];
  selectedChunk: MapChunkBlueprint | null;
  onSelectChunk: (chunk: MapChunkBlueprint) => void;
  chunkRotationDeg: 0 | 90 | 180 | 270;
  onSetChunkRotationDeg: (deg: 0 | 90 | 180 | 270) => void;
  chunkFlipX: boolean;
  onSetChunkFlipX: (flip: boolean) => void;
  chunkFlipY: boolean;
  onSetChunkFlipY: (flip: boolean) => void;
  chunkSettings: ChunkAdjustableSettings;
  onSetChunkSettings: (settings: ChunkAdjustableSettings) => void;
  chunkSlotOverrides: Record<string, ChunkSlotOverride>;
  onSetChunkSlotOverrides: (overrides: Record<string, ChunkSlotOverride>) => void;
  magneticSnapEnabled?: boolean;
  onSetMagneticSnapEnabled?: (enabled: boolean) => void;
  onOpenChunkStudio?: () => void;
}

export const ChunkToolDrawerContent: React.FC<ChunkToolDrawerContentProps> = ({
  customChunks = [],
  selectedChunk,
  onSelectChunk,
  chunkRotationDeg = 0,
  onSetChunkRotationDeg,
  chunkFlipX = false,
  onSetChunkFlipX,
  chunkFlipY = false,
  onSetChunkFlipY,
  chunkSettings,
  onSetChunkSettings,
  chunkSlotOverrides = {},
  onSetChunkSlotOverrides,
  magneticSnapEnabled = true,
  onSetMagneticSnapEnabled,
  onOpenChunkStudio
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allChunks = useMemo(() => {
    return getChunksForScale('All', categoryFilter, customChunks) as MapChunkBlueprint[];
  }, [categoryFilter, customChunks]);

  const filteredChunks = useMemo(() => {
    if (!searchQuery.trim()) return allChunks;
    const q = searchQuery.toLowerCase();
    return allChunks.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [allChunks, searchQuery]);

  const activeChunk = selectedChunk || filteredChunks[0] || allChunks[0] || null;

  const transformedPreview = useMemo(() => {
    if (!activeChunk) return null;
    return transformChunkBlueprint(activeChunk, chunkRotationDeg, chunkFlipX, chunkFlipY);
  }, [activeChunk, chunkRotationDeg, chunkFlipX, chunkFlipY]);

  const internalSlots = useMemo(() => {
    if (!activeChunk) return [];
    return activeChunk.constructionPoints.filter((cp) => cp.kind === 'internal_slot');
  }, [activeChunk]);

  const perimeterSockets = useMemo(() => {
    if (!transformedPreview) return [];
    return transformedPreview.constructionPoints.filter((cp) => cp.kind === 'perimeter_socket');
  }, [transformedPreview]);

  return (
    <div className="flex flex-col gap-3 font-mono text-xs">
      {/* Header & Launch Chunk Forge Studio */}
      <div className="flex items-center justify-between pb-1.5 border-b border-cyan-900/50">
        <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
          <Blocks size={13} className="text-cyan-400" />
          <span>Map Chunk / Prefab Stamp</span>
        </span>
        {onOpenChunkStudio && (
          <button
            type="button"
            onClick={onOpenChunkStudio}
            className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            title="Create or Edit Map Chunk Blueprints in the Chunk Forge Studio"
          >
            <Sparkles size={11} />
            <span>Chunk Forge</span>
          </button>
        )}
      </div>

      {/* 1. D4 Orientation (90° CW North-Side Rotation) & H/V Flip Bar */}
      <div className="p-2.5 rounded-lg bg-slate-950/95 border border-amber-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
            <Compass size={12} className="text-amber-400" />
            <span>Orientation & Flip (D4)</span>
          </span>
          {transformedPreview && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/50 text-[10px] font-bold">
              North: {transformedPreview.northSide}{' '}
              {transformedPreview.northSide === 'N'
                ? '▲'
                : transformedPreview.northSide === 'E'
                ? '▶'
                : transformedPreview.northSide === 'S'
                ? '▼'
                : '◀'}{' '}
              ({transformedPreview.widthCells}×{transformedPreview.heightCells})
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() =>
              onSetChunkRotationDeg(((chunkRotationDeg + 90) % 360) as 0 | 90 | 180 | 270)
            }
            className="py-1.5 px-2 rounded bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/60 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Rotate 90° Clockwise (Hotkey: R)"
          >
            <RotateCw size={12} />
            <span>+90° ({chunkRotationDeg}°)</span>
          </button>

          <button
            type="button"
            onClick={() => onSetChunkFlipX(!chunkFlipX)}
            className={`py-1.5 px-2 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              chunkFlipX
                ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Horizontal Flip across East/West (Hotkey: X)"
          >
            <FlipHorizontal size={12} />
            <span>Flip H {chunkFlipX ? 'ON' : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => onSetChunkFlipY(!chunkFlipY)}
            className={`py-1.5 px-2 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              chunkFlipY
                ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Vertical Flip across North/South (Hotkey: Y)"
          >
            <FlipVertical size={12} />
            <span>Flip V {chunkFlipY ? 'ON' : ''}</span>
          </button>
        </div>

        {onSetMagneticSnapEnabled && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Magnet size={11} className="text-emerald-400" />
              <span>Magnetic Socket Snap & Door Weld:</span>
            </span>
            <button
              type="button"
              onClick={() => onSetMagneticSnapEnabled(!magneticSnapEnabled)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${
                magneticSnapEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              {magneticSnapEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Search & Category Filter */}
      <div className="space-y-1.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chunks (airlock, corridor, reactor...)"
          className="w-full px-2 py-1.5 rounded bg-[#0d1117] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-2 py-1 rounded bg-[#0d1117] border border-slate-800 text-[11px] text-slate-300"
        >
          <option value="All">All Prefab Categories ({allChunks.length})</option>
          {CHUNK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CHUNK_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Chunk Blueprint Catalog List */}
      <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
        {filteredChunks.map((chunk) => {
          const isSel = activeChunk?.chunkId === chunk.chunkId;
          return (
            <button
              key={chunk.chunkId}
              type="button"
              onClick={() => {
                onSelectChunk(chunk);
                onSetChunkSettings({
                  ...chunk.defaultSettings,
                  customParameters: { ...(chunk.defaultSettings?.customParameters || {}) }
                });
                onSetChunkSlotOverrides({});
              }}
              className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                isSel
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'bg-[#0d1117]/90 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {chunk.thumbnailUrl && (
                <img
                  src={chunk.thumbnailUrl}
                  alt={chunk.name}
                  className="w-11 h-11 rounded border border-slate-700 bg-slate-950 object-contain shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate">{chunk.name}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <span className="text-cyan-300 font-bold">
                    {chunk.widthCells}×{chunk.heightCells}
                  </span>
                  <span>•</span>
                  <span>{chunk.constructionPoints.length} CPs</span>
                  <span>•</span>
                  <span>{chunk.walls.length} Walls</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Pre-Placement Adjustable Assigned Properties */}
      {activeChunk && (
        <div className="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
              <Sliders size={11} />
              <span>Assigned Chunk Properties</span>
            </span>
            <span className="text-[9px] text-slate-400">
              {perimeterSockets.length} Sockets • {internalSlots.length} Slots
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[9px] uppercase text-slate-400">Power State</label>
              <select
                value={chunkSettings?.powerState || 'nominal'}
                onChange={(e) =>
                  onSetChunkSettings({
                    ...chunkSettings,
                    powerState: e.target.value as any
                  })
                }
                className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-amber-300"
              >
                {CHUNK_POWER_STATES.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] uppercase text-slate-400">Condition</label>
              <select
                value={chunkSettings?.conditionState || 'pristine'}
                onChange={(e) =>
                  onSetChunkSettings({
                    ...chunkSettings,
                    conditionState: e.target.value as any
                  })
                }
                className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-emerald-300"
              >
                {CHUNK_CONDITION_STATES.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 items-center">
            <div>
              <label className="block text-[9px] uppercase text-slate-400">
                Security Tier: LV {chunkSettings?.securityTier ?? 2}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={chunkSettings?.securityTier ?? 2}
                onChange={(e) =>
                  onSetChunkSettings({
                    ...chunkSettings,
                    securityTier: Number(e.target.value)
                  })
                }
                className="w-full accent-cyan-400 h-1.5"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase text-slate-400">Biome Theme</label>
              <select
                value={chunkSettings?.biomeThemeOverride || 'chunk_default'}
                onChange={(e) =>
                  onSetChunkSettings({
                    ...chunkSettings,
                    biomeThemeOverride: e.target.value
                  })
                }
                className="w-full px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-200"
              >
                {CHUNK_BIOME_THEMES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Construction Point Hardpoint Overrides */}
          {internalSlots.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
              <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Cpu size={10} className="text-cyan-400" />
                <span>Construction Point Hardpoints:</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {internalSlots.map((slot) => {
                  const ov = chunkSlotOverrides[slot.id] || {};
                  const isDisabled = Boolean(ov.disabled);
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-1.5 rounded bg-slate-900/90 border border-slate-800 text-[10px]"
                    >
                      <label className="flex items-center gap-1.5 truncate cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!isDisabled}
                          onChange={(e) =>
                            onSetChunkSlotOverrides({
                              ...chunkSlotOverrides,
                              [slot.id]: { ...ov, disabled: !e.target.checked }
                            })
                          }
                        />
                        <span className={isDisabled ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {slot.defaultAssetLabel || slot.label}
                        </span>
                      </label>
                      <span className="text-[9px] text-cyan-400 shrink-0 ml-1">
                        DC {(slot.assignedProperties?.hackDc || 14) + ((chunkSettings?.securityTier ?? 2) - 1) * 2}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <span className="text-[10px] text-slate-400 italic">
        Hover on canvas to preview chunk footprint & North compass. Click to stamp; press R to rotate 90° CW, X/Y to flip.
      </span>
    </div>
  );
};
export default ChunkToolDrawerContent;
