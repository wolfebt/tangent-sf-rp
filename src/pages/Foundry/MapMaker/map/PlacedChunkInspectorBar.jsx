/**
 * @file PlacedChunkInspectorBar.jsx
 * @description Post-Placement Chunk Instance Inspector Bar rendered when any element belonging
 * to a PlacedChunkInstance is selected on the MapMaker canvas.
 * Supports non-destructive in-place 90° CW North-Side Rotation, Horizontal/Vertical Flips,
 * Live Adjustable Assigned Properties (powerState, securityTier, conditionState, biomeThemeOverride),
 * Unpack / Explode to Tiles, and Save Instance as Custom Chunk Variant.
 */

import React from 'react';
import {
  Blocks,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Compass,
  Sliders,
  Unlock,
  Copy,
  Trash2
} from 'lucide-react';
import {
  CHUNK_POWER_STATES,
  CHUNK_CONDITION_STATES,
  CHUNK_BIOME_THEMES
} from '../../../../schemas/mapChunkSchema';

export const PlacedChunkInspectorBar = ({
  chunkInstance,
  onRetransformInstance,
  onExplodeInstance,
  onSaveInstanceAsBlueprint,
  onDeleteInstance
}) => {
  if (!chunkInstance) return null;

  const settings = chunkInstance.settings || {
    powerState: 'nominal',
    securityTier: 2,
    conditionState: 'pristine',
    biomeThemeOverride: 'chunk_default'
  };

  return (
    <div className="relative z-[81] bg-[#0f172a]/95 px-3 py-1.5 border-b border-emerald-500/50 flex items-center justify-between text-xs gap-2 flex-wrap text-slate-200 backdrop-blur-md font-mono">
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Chunk Instance Identity Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-bold text-[11px]">
          <Blocks size={13} className="text-emerald-400" />
          <span>{chunkInstance.name}</span>
          <span className="text-emerald-400/80 text-[10px]">
            ({chunkInstance.effectiveWidthCells}×{chunkInstance.effectiveHeightCells})
          </span>
        </div>

        {/* North-Side Compass Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500/60 text-amber-300 font-bold text-[10px]">
          <Compass size={11} className="text-amber-400" />
          <span>
            North: {chunkInstance.northSide}{' '}
            {chunkInstance.northSide === 'N'
              ? '▲'
              : chunkInstance.northSide === 'E'
              ? '▶'
              : chunkInstance.northSide === 'S'
              ? '▼'
              : '◀'}
          </span>
        </div>

        {/* In-Place D4 Transform Controls (90° CW Rotate & H/V Flip) */}
        <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
          <button
            type="button"
            onClick={() =>
              onRetransformInstance(chunkInstance.instanceId, {
                rotationDeg: ((chunkInstance.rotationDeg + 90) % 360)
              })
            }
            className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-500 hover:text-black text-amber-200 border border-amber-500/50 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Rotate Placed Chunk 90° Clockwise (North -> East -> South -> West)"
          >
            <RotateCw size={11} />
            <span>+90° CW ({chunkInstance.rotationDeg}°)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onRetransformInstance(chunkInstance.instanceId, {
                flipX: !chunkInstance.flipX
              })
            }
            className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              chunkInstance.flipX
                ? 'bg-cyan-600 text-white border-cyan-300'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Flip Placed Chunk Horizontally"
          >
            <FlipHorizontal size={11} />
            <span>Flip H</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onRetransformInstance(chunkInstance.instanceId, {
                flipY: !chunkInstance.flipY
              })
            }
            className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              chunkInstance.flipY
                ? 'bg-cyan-600 text-white border-cyan-300'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Flip Placed Chunk Vertically"
          >
            <FlipVertical size={11} />
            <span>Flip V</span>
          </button>
        </div>

        {/* Live Adjustable Assigned Properties */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
          <Sliders size={11} className="text-cyan-400" />
          <span className="text-[10px] text-slate-400">Power:</span>
          <select
            value={settings.powerState}
            onChange={(e) =>
              onRetransformInstance(chunkInstance.instanceId, {
                settings: { ...settings, powerState: e.target.value }
              })
            }
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-amber-300"
          >
            {CHUNK_POWER_STATES.map((ps) => (
              <option key={ps} value={ps}>
                {ps.toUpperCase()}
              </option>
            ))}
          </select>

          <span className="text-[10px] text-slate-400 ml-1">Sec Tier:</span>
          <select
            value={settings.securityTier}
            onChange={(e) =>
              onRetransformInstance(chunkInstance.instanceId, {
                settings: { ...settings, securityTier: Number(e.target.value) }
              })
            }
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-cyan-300"
          >
            {[1, 2, 3, 4, 5].map((lv) => (
              <option key={lv} value={lv}>
                LV {lv}
              </option>
            ))}
          </select>

          <span className="text-[10px] text-slate-400 ml-1">State:</span>
          <select
            value={settings.conditionState}
            onChange={(e) =>
              onRetransformInstance(chunkInstance.instanceId, {
                settings: { ...settings, conditionState: e.target.value }
              })
            }
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-emerald-300"
          >
            {CHUNK_CONDITION_STATES.map((cs) => (
              <option key={cs} value={cs}>
                {cs.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <span className="text-[10px] text-slate-400 ml-1">Theme:</span>
          <select
            value={settings.biomeThemeOverride}
            onChange={(e) =>
              onRetransformInstance(chunkInstance.instanceId, {
                settings: { ...settings, biomeThemeOverride: e.target.value }
              })
            }
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
          >
            {CHUNK_BIOME_THEMES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Action Buttons: Save Variant, Unpack/Explode, Delete Chunk */}
      <div className="flex items-center gap-1.5">
        {onSaveInstanceAsBlueprint && (
          <button
            type="button"
            onClick={() => onSaveInstanceAsBlueprint(chunkInstance)}
            className="px-2 py-0.5 rounded bg-purple-950/90 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Save this transformed/configured chunk instance as a new Custom Blueprint"
          >
            <Copy size={11} />
            <span>Save Variant</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onExplodeInstance(chunkInstance.instanceId)}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          title="Unpack / Explode this chunk into standalone map tiles, walls, and objects"
        >
          <Unlock size={11} />
          <span>Unpack to Tiles</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteInstance(chunkInstance.instanceId)}
          className="px-2 py-0.5 rounded bg-rose-950/90 hover:bg-rose-800 border border-rose-500/60 text-rose-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          title="Delete entire placed chunk instance"
        >
          <Trash2 size={11} />
          <span>Delete Chunk</span>
        </button>
      </div>
    </div>
  );
};
export default PlacedChunkInspectorBar;
