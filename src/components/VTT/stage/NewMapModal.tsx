/**
 * @file NewMapModal.tsx
 * @description Tactile Glass-Cockpit Modal for creating new maps, launching blank canvases,
 * picking starter encounter presets, or importing battlemap assets.
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Grid, 
  Sparkles, 
  Upload, 
  FileText, 
  X, 
  Check, 
  Rocket,
  Shield,
  Sun
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap, 
  createPlanetaryLandingZoneMap 
} from './defaultMaps';

export interface NewMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMap: (mapObj: any) => void;
  onOpenUvttModal?: () => void;
  onLoadMapJson?: (file: File) => void;
}

export const NewMapModal: React.FC<NewMapModalProps> = ({
  isOpen,
  onClose,
  onCreateMap,
  onOpenUvttModal,
  onLoadMapJson
}) => {
  const [activeTab, setActiveTab] = useState<'blank' | 'presets' | 'import'>('blank');

  // Blank Canvas Configuration
  const [mapTitle, setMapTitle] = useState('Tactical Sector');
  const [gridMode, setGridMode] = useState<'hex' | 'square'>('hex');
  const [gridSize] = useState<number>(70);
  const [dimensionPreset, setDimensionPreset] = useState<'compact' | 'standard' | 'large' | 'epic'>('standard');
  const [scaleTier, setScaleTier] = useState<string>('Encounter');

  const fileInputJsonRef = useRef<HTMLInputElement | null>(null);
  const fileInputImageRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const DIMENSION_PRESETS = {
    compact: { label: 'Compact (30 × 20)', w: 2100, h: 1400, desc: 'Fast skirmish or small interior' },
    standard: { label: 'Standard (40 × 30)', w: 2800, h: 2100, desc: 'Recommended for tactical encounters' },
    large: { label: 'Large (60 × 40)', w: 4200, h: 2800, desc: 'Multi-room base or airfield' },
    epic: { label: 'Epic (80 × 50)', w: 5600, h: 3500, desc: 'Massive battlefield or star system' }
  };

  const handleCreateBlank = (e: React.FormEvent) => {
    e.preventDefault();
    const dims = DIMENSION_PRESETS[dimensionPreset];
    const newMap = createBlankCanvas({
      title: mapTitle.trim() || 'Tactical Sector',
      gridType: gridMode,
      gridSize,
      width: dims.w,
      height: dims.h,
      scaleTier
    });

    AudioService.playCriticalChime(true);
    onCreateMap(newMap);
    onClose();
  };

  const handleLaunchPreset = (presetKey: 'derelict' | 'outpost' | 'landing') => {
    AudioService.playCriticalChime(true);
    let mapObj: any;
    if (presetKey === 'derelict') mapObj = createDerelictStarshipMap();
    else if (presetKey === 'outpost') mapObj = createResearchOutpostMap();
    else mapObj = createPlanetaryLandingZoneMap();

    onCreateMap(mapObj);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const w = Math.max(1400, Math.round(img.width));
        const h = Math.max(1050, Math.round(img.height));
        const mapName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        const newMap = createBlankCanvas({
          title: mapName,
          gridType: gridMode,
          gridSize: 70,
          width: w,
          height: h,
          scaleTier: 'Encounter',
          backgroundUrl: dataUrl
        });

        AudioService.playCriticalChime(true);
        onCreateMap(newMap);
        onClose();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLoadMapJson) {
      onLoadMapJson(file);
      onClose();
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-800 bg-[#0c121d] shrink-0">
          <div className="flex items-center gap-2 font-mono min-w-0">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)] shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-cyan-300 tracking-wider uppercase truncate">
              TACTICAL STAGE // MAP &amp; SCENE CREATOR
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#070b12] px-4 sm:px-5 gap-3 sm:gap-4 shrink-0 overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('blank')}
            className={`py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'blank'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_4px_12px_rgba(34,211,238,0.2)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid size={14} />
            <span>BLANK CANVAS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-amber-400 text-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.2)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>STARTER ENCOUNTERS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-purple-400 text-purple-300 shadow-[0_4px_12px_rgba(168,85,247,0.2)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={14} />
            <span>IMPORT / LOAD</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 font-sans text-xs">
          {activeTab === 'blank' && (
            <form onSubmit={handleCreateBlank} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase font-bold mb-1.5">
                  Sector Title / Codename
                </label>
                <input
                  type="text"
                  value={mapTitle}
                  onChange={(e) => setMapTitle(e.target.value)}
                  placeholder="e.g. Sector 04 - Derelict Outpost"
                  className="w-full bg-[#111726] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs outline-none transition-colors"
                  required
                />
              </div>

              {/* Grid Geometry Toggle */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold mb-1.5">
                  Coordinate Grid Geometry
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setGridMode('hex');
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      gridMode === 'hex'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-[#111726] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-xs">
                      <span>HEXAGONAL (FLAT-TOP)</span>
                      {gridMode === 'hex' && <Check size={14} className="text-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Standard Tangent tactical movement with uniform 6-way distance measurement.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setGridMode('square');
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      gridMode === 'square'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-[#111726] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-xs">
                      <span>ORTHOGONAL SQUARE</span>
                      {gridMode === 'square' && <Check size={14} className="text-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Ideal for modular interior corridors, rooms, and architectural floorplans.
                    </span>
                  </button>
                </div>
              </div>

              {/* Dimensions Presets */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold mb-1.5">
                  Playfield Canvas Dimensions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(DIMENSION_PRESETS) as Array<keyof typeof DIMENSION_PRESETS>).map((key) => {
                    const preset = DIMENSION_PRESETS[key];
                    const isSelected = dimensionPreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          setDimensionPreset(key);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-[#111726] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono font-bold text-[11px]">{preset.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{preset.w} × {preset.h}px</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scale Tier */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold mb-1.5">
                  Tactical Scale Tier
                </label>
                <select
                  value={scaleTier}
                  onChange={(e) => setScaleTier(e.target.value)}
                  className="w-full bg-[#111726] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none cursor-pointer"
                >
                  <option value="Encounter">Tactical Encounter (5ft / 1.5m per cell)</option>
                  <option value="Overland">Overland Operations (50ft / 15m per cell)</option>
                  <option value="Planetary">Planetary Topography (10km per cell)</option>
                  <option value="Sector">Interstellar Sector (1LY per cell)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>INITIALIZE BLANK CANVAS</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-slate-400 font-mono text-[11px]">
                Deploy a fully operational battle scenario with pre-configured walls, bulkheads, dynamic lights, terminals, and actor tokens:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* Preset 1: Derelict Starship */}
                <div className="p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/60 bg-[#111726]/80 flex items-center justify-between gap-4 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Rocket size={16} className="text-amber-400" />
                      <span className="font-mono font-bold text-sm text-slate-100">Derelict Starship Corridor</span>
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        Square Grid • Encounter
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Reinforced decking, motorized airlock bulkhead, fusion generator, tactical cover crates, and interactive computer console.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset('derelict')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs shrink-0 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                  >
                    DEPLOY SCENE
                  </button>
                </div>

                {/* Preset 2: Research Outpost */}
                <div className="p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/60 bg-[#111726]/80 flex items-center justify-between gap-4 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-emerald-400" />
                      <span className="font-mono font-bold text-sm text-slate-100">Research Outpost Beta</span>
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        Hex Grid • Encounter
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Cleanroom bio-lab, transparent observation glass, cryo-stasis pod, mainframe server rack, and automated ceiling turret.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset('outpost')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shrink-0 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                  >
                    DEPLOY SCENE
                  </button>
                </div>

                {/* Preset 3: Planetary Landing Zone */}
                <div className="p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/60 bg-[#111726]/80 flex items-center justify-between gap-4 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sun size={16} className="text-cyan-400" />
                      <span className="font-mono font-bold text-sm text-slate-100">Planetary Landing Zone</span>
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        Hex Grid • Overland
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Exterior volcanic landing pad, navigation beacon strobe, volatile fuel storage tanks, and perimeter perimeter marking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset('landing')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shrink-0 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                  >
                    DEPLOY SCENE
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Upload Battlemap Image */}
                <div className="p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-[#111726] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-sm text-cyan-300 mb-1">
                      <Upload size={16} />
                      <span>Battlemap Image (.png / .jpg)</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Upload any hand-drawn, Dungeondraft, or AI battlemap to serve as the background canvas plate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputImageRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/50 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    SELECT IMAGE FILE
                  </button>
                </div>

                {/* 2. Load Map File JSON */}
                <div className="p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 bg-[#111726] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-sm text-purple-300 mb-1">
                      <FileText size={16} />
                      <span>Tangent Map (.json)</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Load a previously saved Tangent VTT sector file containing walls, tokens, and lighting layers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputJsonRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/50 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    LOAD JSON FILE
                  </button>
                </div>
              </div>

              {/* 3. Universal VTT Import Button */}
              {onOpenUvttModal && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c121d] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-200">Universal VTT (.uvtt / .dd2vtt)</div>
                    <div className="text-[11px] text-slate-400">
                      Import Dungeondraft maps with automatic portalling for walls, doors, windows, and lights.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUvttModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    IMPORT UVTT
                  </button>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputImageRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={fileInputJsonRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMapModal;
