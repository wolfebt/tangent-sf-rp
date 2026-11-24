import React from 'react';
import {
  MousePointer,
  Plus,
  Flame,
  Sun,
  Terminal,
  FolderOpen
} from 'lucide-react';
import { ChunkToolDrawerContent } from '../ChunkToolDrawerContent';
import { VttEventBus } from '../../../../../utils/vttEventBus';
import { PENCIL_COLORS, PENCIL_WIDTHS, TEXT_COLORS } from '../MapConstants';

export function ArchitectToolOptionsPanels({
  activeTool = 'select',
  currentMapScale = 'Planetary',
  customAssets = { terrains: [], objects: [] },
  selectedWallType = 'solid',
  setSelectedWallType,
  doorLockDc = 14,
  setDoorLockDc,
  selectedRegionType = 'roof_zone',
  setSelectedRegionType,
  selectedObjectType,
  setSelectedObjectType,
  selectedLightColor = '#f59e0b',
  setSelectedLightColor,
  selectedLightRadius = 180,
  setSelectedLightRadius,
  selectedLightAnimation = 'flicker',
  setSelectedLightAnimation,
  selectedTerrain,
  setSelectedTerrain,
  terrainWidth = 30,
  setTerrainWidth,
  filteredTerrains = [],
  searchQuery = '',
  setSearchQuery,
  filteredObjects = [],
  pencilColor = '#ef4444',
  setPencilColor,
  pencilWidth = 5,
  setPencilWidth,
  textLabelInput = 'Sector Alpha',
  setTextLabelInput,
  textColor = '#ffffff',
  setTextColor,
  textSize = 24,
  setTextSize,
  tokenType = 'standard',
  setTokenType,
  tokenLabelInput = 'Unit',
  setTokenLabelInput,
  onOpenOmnicortexLink,
  rulerSelectedPace = 'walk',
  setRulerSelectedPace,
  measurementUnit = 'meters',
  setMeasurementUnit,
  fogEnabled = false,
  setFogEnabled,
  onOpenAssetManager,
  onOpenHeroDrawer,
  onOpenOmnicortexDrawer,
  onOpenLandmassGenerator,
  selectedChunk,
  setSelectedChunk,
  chunkRotationDeg = 0,
  setChunkRotationDeg,
  chunkFlipX = false,
  setChunkFlipX,
  chunkFlipY = false,
  setChunkFlipY,
  chunkSettings,
  setChunkSettings,
  chunkSlotOverrides,
  setChunkSlotOverrides,
  magneticSnapEnabled = true,
  setMagneticSnapEnabled,
  onOpenChunkStudio
}) {
  switch (activeTool) {
    case 'chunk':
      return (
        <ChunkToolDrawerContent
          customChunks={customAssets?.chunks || []}
          selectedChunk={selectedChunk}
          onSelectChunk={setSelectedChunk}
          chunkRotationDeg={chunkRotationDeg}
          onSetChunkRotationDeg={setChunkRotationDeg}
          chunkFlipX={chunkFlipX}
          onSetChunkFlipX={setChunkFlipX}
          chunkFlipY={chunkFlipY}
          onSetChunkFlipY={setChunkFlipY}
          chunkSettings={chunkSettings}
          onSetChunkSettings={setChunkSettings}
          chunkSlotOverrides={chunkSlotOverrides}
          onSetChunkSlotOverrides={setChunkSlotOverrides}
          magneticSnapEnabled={magneticSnapEnabled}
          onSetMagneticSnapEnabled={setMagneticSnapEnabled}
          onOpenChunkStudio={onOpenChunkStudio}
        />
      );

    case 'wall':
    case 'curved_wall':
      return (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
            🧱 Wall & Barrier Type:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'solid', label: 'Solid Wall', color: 'border-slate-500 bg-slate-900 text-slate-200' },
              { id: 'door', label: 'Bulkhead Door', color: 'border-amber-500 bg-amber-950 text-amber-300' },
              { id: 'window', label: 'Window (LoS)', color: 'border-cyan-500 bg-cyan-950 text-cyan-300' },
              { id: 'ethereal', label: 'Ethereal / Meta', color: 'border-purple-500 bg-purple-950 text-purple-300' }
            ].map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWallType?.(w.id)}
                className={`py-1.5 px-2 text-xs rounded border text-center font-bold transition-all cursor-pointer ${
                  selectedWallType === w.id
                    ? `${w.color} shadow-[0_0_8px_rgba(34,211,238,0.4)] border-[#22d3ee]`
                    : 'border-[#0D5C63]/40 bg-[#0d1117] text-slate-400 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {selectedWallType === 'door' && (
            <div className="bg-[#0d1117] border border-[#0D5C63]/60 p-2 rounded-lg flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-bold uppercase text-[10px]">Cyber Hack DC:</span>
                <span className="text-white font-mono font-bold">{doorLockDc}</span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={doorLockDc}
                onChange={e => setDoorLockDc?.(Number(e.target.value))}
                className="accent-amber-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
              />
            </div>
          )}

          <span className="text-[10px] text-slate-400 italic mt-1">
            Click and drag on the canvas to place wall and barrier segments.
          </span>
        </div>
      );

    case 'region':
      return (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
            Scene Region Trigger Zone:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'roof_zone', label: 'Roof Canopy Cutout', desc: 'Reveals interior when tokens enter zone' },
              { id: 'hazard', label: 'Hazard Field Zone', desc: 'Deals environmental tick damage on enter' },
              { id: 'teleport_deck', label: 'Teleport / Airlock Pad', desc: 'Moves tokens to linked target coordinates' },
              { id: 'audio_zone', label: 'Spatial Audio Zone', desc: 'Crossfades ambient stems inside zone' }
            ].map((rz) => (
              <button
                key={rz.id}
                type="button"
                onClick={() => setSelectedRegionType?.(rz.id)}
                className={`py-1.5 px-2 text-xs rounded border text-left transition-all cursor-pointer ${
                  selectedRegionType === rz.id
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200'
                    : 'border-slate-800 bg-[#0d1117] text-slate-300 hover:border-cyan-500/40'
                }`}
              >
                <div className="font-bold">{rz.label}</div>
                <div className="text-[10px] text-slate-400">{rz.desc}</div>
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 italic">Click canvas to drop a 3×3 grid SceneRegion trigger zone.</span>
        </div>
      );

    case 'hazard':
      return (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-orange-400 font-bold tracking-wider flex items-center gap-1.5">
            <Flame size={12} className="text-orange-400" />
            <span>Environmental Hazards:</span>
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'hazard_plasma', label: 'Plasma Eruption', desc: '4d10 thermal burst hazard zone', color: '#f97316' },
              { id: 'hazard_gas', label: 'Corrosive Acid Gas', desc: 'Dissolves armor & forces Stamina saves', color: '#10b981' },
              { id: 'hazard_void', label: 'Void Mist Anomaly', desc: 'Slows movement and jams sensors', color: '#8b5cf6' },
              { id: 'hazard_radiation', label: 'Ionizing Radiation', desc: 'Persistent vitality degradation zone', color: '#eab308' }
            ].map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  setSelectedObjectType?.({
                    id: h.id,
                    label: h.label,
                    color: h.color,
                    shape: 'circle',
                    radius: 35,
                    hazard: h.label,
                    category: 'Hazards',
                    desc: h.desc
                  });
                }}
                className={`py-2 px-2.5 text-xs rounded border text-left transition-all cursor-pointer ${
                  selectedObjectType?.id === h.id
                    ? 'border-orange-400 bg-orange-950/80 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                    : 'border-slate-800 bg-[#0d1117]/80 text-slate-300 hover:border-orange-500/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                  <span className="font-bold">{h.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{h.desc}</div>
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 italic">Click on map canvas to stamp environmental hazard zone.</span>
        </div>
      );

    case 'light':
      return (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
            <Sun size={12} className="text-amber-400" />
            <span>Dynamic Light Source:</span>
          </span>
          <div className="bg-[#0d1117] border border-slate-800 p-2.5 rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-300 font-bold uppercase text-[10px]">Light Radius:</span>
              <span className="text-amber-200 font-mono font-bold">{selectedLightRadius}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={selectedLightRadius}
              onChange={e => setSelectedLightRadius?.(Number(e.target.value))}
              className="accent-amber-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
            />
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Animation:</span>
              <select
                value={selectedLightAnimation}
                onChange={e => setSelectedLightAnimation?.(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-amber-300 rounded p-1"
              >
                <option value="none">Static Steady</option>
                <option value="flicker">Flicker Torch</option>
                <option value="pulse">Pulse Glow</option>
                <option value="strobe">Strobe Alert</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { color: '#f59e0b', label: 'Torch' },
              { color: '#38bdf8', label: 'Cyan' },
              { color: '#ef4444', label: 'Red Alert' },
              { color: '#10b981', label: 'Emerald' }
            ].map(c => (
              <button
                key={c.color}
                type="button"
                onClick={() => setSelectedLightColor?.(c.color)}
                className={`py-1.5 px-1 rounded text-[10px] font-bold text-center border transition-all cursor-pointer ${
                  selectedLightColor === c.color ? 'border-white text-white shadow-sm' : 'border-transparent text-slate-400 hover:text-white'
                }`}
                style={{ backgroundColor: `${c.color}25` }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 italic">Click on map canvas to drop an illuminated dynamic light node.</span>
        </div>
      );

    case 'terrain':
      return (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
            Biome & Texture Palette:
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Brush Width:</span>
            <span className="font-mono text-cyan-300 font-bold">{terrainWidth}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={terrainWidth}
            onChange={e => setTerrainWidth?.(Number(e.target.value))}
            className="accent-cyan-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
          />
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredTerrains.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTerrain?.(t)}
                className={`p-1.5 rounded border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedTerrain?.id === t.id
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-[#0d1117]/80 text-slate-300 hover:border-cyan-500/50 hover:text-white'
                }`}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] font-bold truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'object':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
            Props & Structures:
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery?.(e.target.value)}
            placeholder="Search catalog..."
            className="bg-[#0d1117] border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-cyan-400"
          />
          <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-1">
            {filteredObjects.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedObjectType?.(o)}
                className={`p-1.5 rounded border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedObjectType?.id === o.id
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-200'
                    : 'border-slate-800 bg-[#0d1117] text-slate-300 hover:border-cyan-500/50'
                }`}
              >
                <span className="font-bold truncate">{o.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{o.category || 'Prop'}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'token':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Token Stamp Tool:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'link', label: 'Portal Link' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTokenType?.(mode.id)}
                className={`py-1 px-2 rounded border text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  tokenType === mode.id
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <label className="text-[10px] text-slate-400 font-bold uppercase">Token Label:</label>
          <input
            type="text"
            aria-label="Token label"
            value={tokenLabelInput}
            onChange={e => setTokenLabelInput?.(e.target.value)}
            className="bg-[#0d1117] border border-slate-800 text-white p-1.5 rounded text-xs outline-none focus:border-cyan-400"
          />
          {onOpenOmnicortexLink && (
            <button
              type="button"
              onClick={onOpenOmnicortexLink}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Terminal size={13} />
              <span>Link Omnicortex Statblock</span>
            </button>
          )}
          <span className="text-[10px] text-slate-400 italic">Click on map canvas to place new {tokenType === 'link' ? 'portal link' : 'standard'} token.</span>
        </div>
      );

    case 'pencil':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Freehand Pencil:</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {PENCIL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Pencil color ${c}`}
                onClick={() => setPencilColor?.(c)}
                className={`w-5 h-5 rounded-full border cursor-pointer ${pencilColor === c ? 'border-white ring-2 ring-cyan-400' : 'border-slate-700'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              aria-label="Pencil color"
              value={pencilColor}
              onChange={(e) => setPencilColor?.(e.target.value)}
              className="w-6 h-6 bg-slate-900 border border-slate-700 rounded cursor-pointer"
            />
          </div>
          <label className="text-[10px] text-slate-400 font-bold uppercase">Stroke Width: {pencilWidth}px</label>
          <div className="flex gap-1">
            {PENCIL_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setPencilWidth?.(w)}
                className={`flex-1 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                  pencilWidth === w ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
          <input
            type="range"
            aria-label="Pencil width"
            min="1"
            max="60"
            value={pencilWidth}
            onChange={(e) => setPencilWidth?.(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      );

    case 'text':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Map Text Label:</span>
          <input
            type="text"
            aria-label="Map text label"
            value={textLabelInput}
            onChange={(e) => setTextLabelInput?.(e.target.value)}
            placeholder="Label text..."
            className="bg-[#0d1117] border border-slate-800 text-white p-1.5 rounded text-xs outline-none focus:border-cyan-400"
          />
          <div className="flex flex-wrap gap-1.5 items-center">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Text color ${c}`}
                onClick={() => setTextColor?.(c)}
                className={`w-5 h-5 rounded-full border cursor-pointer ${textColor === c ? 'border-white ring-2 ring-cyan-400' : 'border-slate-700'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              aria-label="Text color"
              value={textColor}
              onChange={(e) => setTextColor?.(e.target.value)}
              className="w-6 h-6 bg-slate-900 border border-slate-700 rounded cursor-pointer"
            />
          </div>
          <label className="text-[10px] text-slate-400 font-bold uppercase">Font Size: {textSize}px</label>
          <input
            type="range"
            aria-label="Text size"
            min="12"
            max="64"
            step="2"
            value={textSize}
            onChange={(e) => setTextSize?.(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      );

    case 'ruler':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Locomotion Ruler:</span>
          <label className="text-[10px] text-slate-400 font-bold uppercase">Reference Pace:</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'walk', label: 'Walk' },
              { id: 'jog', label: 'Jog' },
              { id: 'run', label: 'Run' },
              { id: 'sprint', label: 'Sprint' }
            ].map((pace) => (
              <button
                key={pace.id}
                type="button"
                onClick={() => setRulerSelectedPace?.(pace.id)}
                className={`py-1 px-2 rounded border text-[10px] font-bold uppercase cursor-pointer ${
                  rulerSelectedPace === pace.id
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {pace.label}
              </button>
            ))}
          </div>
          <label className="text-[10px] text-slate-400 font-bold uppercase">Measurement Unit:</label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'meters', label: 'Meters (m)' },
              { id: 'feet', label: 'Feet (ft)' },
              { id: 'squares', label: 'Squares' }
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setMeasurementUnit?.(u.id)}
                className={`py-1 px-1.5 rounded border text-[10px] font-bold cursor-pointer ${
                  measurementUnit === u.id
                    ? 'bg-amber-950 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'fog':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Fog of War:</span>
          <button
            type="button"
            onClick={() => setFogEnabled?.(!fogEnabled)}
            className={`py-1.5 px-2.5 text-xs rounded border font-bold transition-all cursor-pointer ${
              fogEnabled
                ? 'bg-cyan-950 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                : 'bg-[#0d1117]/60 border-[#0D5C63]/40 text-slate-300 hover:border-[#22d3ee]/60'
            }`}
          >
            {fogEnabled ? 'Global Fog ACTIVE' : 'Enable Global Fog'}
          </button>
          <span className="text-[11px] text-slate-400 italic">Click & drag on canvas to paint darkness / revealed areas.</span>
        </div>
      );

    case 'eraser':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider">Eraser Active</span>
          <span className="text-[11px] text-slate-400 italic">Click any object, token, line, or text label to delete it instantly.</span>
        </div>
      );

    case 'pan':
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Viewport Pan (H)</span>
          <span className="text-[11px] text-slate-400 italic">Left-click drag anywhere on the canvas to pan. Hold Space from any tool to temporarily pan, or scroll to zoom.</span>
        </div>
      );

    case 'select':
      return (
        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
              <MousePointer size={12} className="text-cyan-400" />
              <span>Selection & Transform</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold">
              READY
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
              <span>🎯 Direct Canvas Inspector</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Click any token, wall, prop, or light on the canvas to inspect and modify. Click and drag across empty grid space to create a marquee selection box.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-cyan-300 font-bold tracking-wider flex items-center gap-1.5">
                <FolderOpen size={12} className="text-cyan-400" />
                <span>Map & Scene Controls</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">
                {currentMapScale}
              </span>
            </div>

            <button
              type="button"
              onClick={() => VttEventBus.emit('open-new-map-modal')}
              className="w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>+ NEW SCENE / BLANK CANVAS</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => VttEventBus.emit('load-preset-starship')}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🚀</span>
                <span className="font-bold truncate">Starship Map</span>
              </button>
              <button
                type="button"
                onClick={() => VttEventBus.emit('load-preset-outpost')}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🔬</span>
                <span className="font-bold truncate">Outpost Map</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Canvas Shortcuts:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">Marquee Box</span>
                <span className="text-slate-400 font-sans">Drag on empty space</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-amber-400 font-bold block">Duplicate</span>
                <span className="text-slate-400 font-sans">Ctrl + D</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-red-400 font-bold block">Delete Asset</span>
                <span className="text-slate-400 font-sans">Delete / Backspace</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold block">Nudge Grid</span>
                <span className="text-slate-400 font-sans">Arrow Keys (Shift: 50px)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cartography Catalogs:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {onOpenAssetManager && (
                <button
                  type="button"
                  onClick={onOpenAssetManager}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📦</span>
                  <span className="font-bold truncate">Asset Vault</span>
                </button>
              )}
              {onOpenHeroDrawer && (
                <button
                  type="button"
                  onClick={onOpenHeroDrawer}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>👤</span>
                  <span className="font-bold truncate">Folio Heroes</span>
                </button>
              )}
              {onOpenOmnicortexDrawer && (
                <button
                  type="button"
                  onClick={onOpenOmnicortexDrawer}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🤖</span>
                  <span className="font-bold truncate">Bestiary</span>
                </button>
              )}
              {onOpenLandmassGenerator && (
                <button
                  type="button"
                  onClick={onOpenLandmassGenerator}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🏔️</span>
                  <span className="font-bold truncate">Landmass Gen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col gap-2 text-[11px] text-slate-400 italic">
          <span>Select a cartography tool or layer from the rail to begin editing the map.</span>
        </div>
      );
  }
}
