/**
 * @file ArchitectDesignPalette.tsx
 * @description In-Situ Architect Design Studio & Asset Palette for The Stage.
 * Expands the Stage with comprehensive 2D Map Maker toolbars and authoring functions:
 * Point-to-point wall drawing, organic and hex terrain painting, tactical sketching,
 * text labeling, prop/hazard stamping, and direct launch buttons for Landmass Generator,
 * UVTT import, Folio Hero drawer, Omnicortex catalog, and Asset Manager.
 */

import React, { useState } from 'react';
import { 
  Shield, 
  DoorClosed, 
  Terminal, 
  Box, 
  Flame, 
  Biohazard, 
  Sparkles, 
  Zap, 
  X, 
  MousePointer, 
  Cpu, 
  Bot, 
  Users,
  Eye,
  Edit3,
  Layers,
  Type,
  Compass,
  FolderOpen,
  Upload,
  Eraser,
  Shuffle,
  CheckSquare,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  PaintBucket,
  Lightbulb,
  ImageIcon,
  Minus
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { 
  type AtmosphericWeatherType, 
  ATMOSPHERIC_PRESETS, 
  LIGHT_PRESETS, 
  type LightAnimationType 
} from '../../engine/vision/LightSourceManager';

export type ArchitectDesignTool = 
  | 'select' 
  | 'wall' 
  | 'terrain' 
  | 'fill'
  | 'pencil' 
  | 'object' 
  | 'token' 
  | 'text' 
  | 'hazard' 
  | 'light'
  | 'ruler' 
  | 'eraser';

export interface PaletteItem {
  id: string;
  category: string;
  label: string;
  desc: string;
  type: string;
  subType?: string;
  icon: any;
  color: string;
  defaultProps?: Record<string, any>;
}

export const ARCHITECT_ITEMS: PaletteItem[] = [
  // 1. Walls & Bulkheads
  {
    id: 'wall_solid',
    category: 'walls',
    label: 'Solid Titanium Wall',
    desc: 'Impassable, fully opaque physical wall segment (70px).',
    type: 'wall',
    subType: 'solid',
    icon: Shield,
    color: '#06b6d4',
    defaultProps: { length: 70, isDynamic: false }
  },
  {
    id: 'wall_bulkhead',
    category: 'walls',
    label: 'Blast Bulkhead / Door',
    desc: 'Dynamic airlock door. Can be toggled open/closed or sliced.',
    type: 'wall',
    subType: 'door',
    icon: DoorClosed,
    color: '#f59e0b',
    defaultProps: { length: 70, isDynamic: true, isOpen: false }
  },
  {
    id: 'wall_window',
    category: 'walls',
    label: 'Reinforced Glass Window',
    desc: 'Allows line of sight, blocks physical movement and kinetic shots.',
    type: 'wall',
    subType: 'window',
    icon: Eye,
    color: '#38bdf8',
    defaultProps: { length: 70, isDynamic: false, isTransparent: true }
  },
  {
    id: 'wall_ethereal',
    category: 'walls',
    label: 'Ethereal / Meta Barrier',
    desc: 'Energy shield permitting vision but absorbing metaphysics.',
    type: 'wall',
    subType: 'ethereal',
    icon: Sparkles,
    color: '#a855f7',
    defaultProps: { length: 70, isDynamic: false, isTransparent: true }
  },

  // 2. Interactive Objects
  {
    id: 'obj_terminal',
    category: 'objects',
    label: 'Mainframe Slicing Terminal',
    desc: 'Encrypted console linked to Story Foundry narrative clues.',
    type: 'object',
    subType: 'terminal',
    icon: Terminal,
    color: '#3b82f6',
    defaultProps: { name: 'Mainframe Datapad', storyElementId: 'clue-data-nexus' }
  },
  {
    id: 'obj_munitions_crate',
    category: 'objects',
    label: 'Omnicortex Munitions Crate',
    desc: 'Secure loot container with plasma grenades and power cells.',
    type: 'object',
    subType: 'loot_container',
    icon: Box,
    color: '#f59e0b',
    defaultProps: { name: 'Munitions Crate', storyElementId: 'gear-munitions' }
  },
  {
    id: 'obj_power_generator',
    category: 'objects',
    label: 'Substation Power Core',
    desc: 'High-voltage reactor core. Explodes on critical damage.',
    type: 'object',
    subType: 'generator',
    icon: Zap,
    color: '#eab308',
    defaultProps: { name: 'Fusion Reactor', explosive: true }
  },
  {
    id: 'obj_med_station',
    category: 'objects',
    label: 'Cyber-Medic Trauma Station',
    desc: 'Automated triage unit restoring vitality and stabilizing wounds.',
    type: 'object',
    subType: 'med_station',
    icon: HeartCrossIcon,
    color: '#10b981',
    defaultProps: { name: 'Medical Station', healAmount: 15 }
  },

  // 3. Tactical Cover & Props
  {
    id: 'prop_half_crate',
    category: 'props',
    label: 'Low Cover Cargo Crate',
    desc: 'Grants Half Cover (+2 Defense / -2 Attack) against line of sight.',
    type: 'prop',
    subType: 'half_cover',
    icon: Box,
    color: '#64748b',
    defaultProps: { coverType: 'half', coverMod: -2 }
  },
  {
    id: 'prop_high_barricade',
    category: 'props',
    label: 'Reinforced Concrete Barricade',
    desc: 'Grants 3/4 Cover (+5 Defense / -5 Attack) against strikes.',
    type: 'prop',
    subType: 'three_quarters_cover',
    icon: Shield,
    color: '#475569',
    defaultProps: { coverType: 'three_quarters', coverMod: -5 }
  },
  {
    id: 'prop_fuel_barrel',
    category: 'props',
    label: 'Volatile Fuel Cylinder',
    desc: 'Provides half cover; detonates for 4d10 AoE fire damage if breached.',
    type: 'prop',
    subType: 'explosive_barrel',
    icon: Flame,
    color: '#dc2626',
    defaultProps: { coverType: 'half', isExplosive: true }
  },

  // 4. Environmental Hazards
  {
    id: 'hazard_plasma',
    category: 'hazards',
    label: 'Plasma Fire Eruption',
    desc: 'Extreme thermal hazard dealing continuous fire damage.',
    type: 'hazard',
    subType: 'plasma_fire',
    icon: Flame,
    color: '#f97316',
    defaultProps: { radius: 75, hazardType: 'plasma_fire' }
  },
  {
    id: 'hazard_gas',
    category: 'hazards',
    label: 'Corrosive Acid Gas',
    desc: 'Dissolves armor plating and forces Stamina saves.',
    type: 'hazard',
    subType: 'corrosive_gas',
    icon: Biohazard,
    color: '#10b981',
    defaultProps: { radius: 85, hazardType: 'corrosive_gas' }
  },
  {
    id: 'hazard_void',
    category: 'hazards',
    label: 'Void Mist Anomaly',
    desc: 'Slows movement to half speed and scrambles sensors.',
    type: 'hazard',
    subType: 'void_mist',
    icon: Sparkles,
    color: '#8b5cf6',
    defaultProps: { radius: 80, hazardType: 'void_mist' }
  },

  // 5. Spawner Units
  {
    id: 'spawn_drone',
    category: 'spawner',
    label: 'Recon Combat Drone',
    desc: 'Fast reconnaissance unit (TL3, 20 HP, 5 DR, 45ft speed).',
    type: 'token',
    subType: 'drone',
    icon: Bot,
    color: '#22d3ee',
    defaultProps: { base_hp: 20, armor_dr: 5, speed_ft: 45, is_persona: false }
  },
  {
    id: 'spawn_mech',
    category: 'spawner',
    label: 'Vanguard Assault Mech',
    desc: 'Heavy combat walker (TL4, 120 HP, 35 DR, 25ft speed, Large size).',
    type: 'token',
    subType: 'mech',
    icon: Cpu,
    color: '#a855f7',
    defaultProps: { base_hp: 120, armor_dr: 35, speed_ft: 25, size_modifier: 2, is_persona: false }
  },
  {
    id: 'spawn_infiltrator',
    category: 'spawner',
    label: 'Operative Infiltrator',
    desc: 'Standard human operative (TL3, 40 HP, 12 DR, 35ft speed).',
    type: 'token',
    subType: 'persona',
    icon: Users,
    color: '#10b981',
    defaultProps: { base_hp: 40, armor_dr: 12, speed_ft: 35, is_persona: true }
  }
];

function HeartCrossIcon(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M12 7v6"/>
      <path d="M9 10h6"/>
    </svg>
  );
}

export const BIOME_OPTIONS = [
  { id: 'deepSpace', label: 'Deep Space Void', color: '#030712', patternKey: 'deepSpaceVoid' },
  { id: 'waterOcean', label: 'Open Ocean / Water', color: '#1e3a8a', patternKey: 'waterOcean' },
  { id: 'grassland', label: 'Grassland / Plains', color: '#14532d', patternKey: 'grassland' },
  { id: 'forestCanopy', label: 'Forest / Jungle', color: '#052e16', patternKey: 'forestCanopy' },
  { id: 'desertSand', label: 'Desert Sand / Dunes', color: '#9a3412', patternKey: 'desertSand' },
  { id: 'volcanicLava', label: 'Volcanic Lava', color: '#450a0a', patternKey: 'volcanicLava' },
  { id: 'cyberGrid', label: 'Cyber Grid Floor', color: '#0f172a', patternKey: 'cyberGrid' },
  { id: 'toxicSludge', label: 'Toxic Sludge / Waste', color: '#1a2e05', patternKey: 'toxicSludge' }
];

export const PENCIL_COLOR_OPTIONS = [
  { color: '#22d3ee', label: 'Cyan' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#ef4444', label: 'Red' },
  { color: '#a855f7', label: 'Violet' },
  { color: '#ffffff', label: 'White' }
];

export interface ArchitectDesignPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: ArchitectDesignTool;
  setActiveTool: (tool: ArchitectDesignTool) => void;
  selectedStamp: PaletteItem | null;
  onSelectStamp: (stamp: PaletteItem | null) => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  activeMapTitle?: string;
  wallsCount: number;
  objectsCount: number;
  hazardsCount: number;
  terrainsCount?: number;
  linesCount?: number;
  textsCount?: number;
  lightsCount?: number;
  // Wall Sub-options
  selectedWallType: string;
  setSelectedWallType: (type: string) => void;
  doorLockDc: number;
  setDoorLockDc: (dc: number) => void;
  wallConstructionMode?: 'single' | 'chain' | 'room';
  setWallConstructionMode?: (mode: 'single' | 'chain' | 'room') => void;
  // Selection Context
  selectedAssetIds?: string[];
  onBatchDelete?: () => void;
  onBatchDuplicate?: () => void;
  onBatchNudge?: (dx: number, dy: number) => void;
  onDeselectAll?: () => void;
  // Randomization Jitter
  randomizeRotation?: boolean;
  setRandomizeRotation?: (v: boolean) => void;
  randomizeScale?: boolean;
  setRandomizeScale?: (v: boolean) => void;
  // Atmosphere & Lighting
  atmosphericWeather?: AtmosphericWeatherType;
  setAtmosphericWeather?: (w: AtmosphericWeatherType) => void;
  selectedLightColor?: string;
  setSelectedLightColor?: (c: string) => void;
  selectedLightRadius?: number;
  setSelectedLightRadius?: (r: number) => void;
  selectedLightAnimation?: LightAnimationType;
  setSelectedLightAnimation?: (a: LightAnimationType) => void;
  // Terrain Sub-options
  selectedTerrainId: string;
  setSelectedTerrainId: (id: string) => void;
  terrainBrushWidth: number;
  setTerrainBrushWidth: (w: number) => void;
  terrainRenderMode: 'organic' | 'hex';
  setTerrainRenderMode: (mode: 'organic' | 'hex') => void;
  // Pencil Sub-options
  pencilColor: string;
  setPencilColor: (c: string) => void;
  pencilWidth: number;
  setPencilWidth: (w: number) => void;
  // Text Sub-options
  textLabelInput: string;
  setTextLabelInput: (t: string) => void;
  textColor: string;
  setTextColor: (c: string) => void;
  textSize: number;
  setTextSize: (s: number) => void;
  // Ruler Sub-options
  rulerAvailableAp: number;
  setRulerAvailableAp: (ap: number) => void;
  // Modal Openers
  onOpenLandmassModal: () => void;
  onOpenUvttModal: () => void;
  onOpenAssetManager: () => void;
  onOpenHeroDrawer: () => void;
  onOpenOmnicortexDrawer: () => void;
  onOpenHazmatModal: () => void;
  onOpenLayersPanel: () => void;
  onOpenUnderlayModal?: () => void;
}

export const ArchitectDesignPalette: React.FC<ArchitectDesignPaletteProps> = ({
  isOpen,
  onClose,
  activeTool,
  setActiveTool,
  selectedStamp,
  onSelectStamp,
  gridSnap,
  onToggleGridSnap,
  activeMapTitle = 'Tactical Sector',
  wallsCount,
  objectsCount,
  hazardsCount,
  terrainsCount = 0,
  linesCount = 0,
  textsCount = 0,
  lightsCount = 0,
  selectedWallType,
  setSelectedWallType,
  doorLockDc,
  setDoorLockDc,
  wallConstructionMode = 'single',
  setWallConstructionMode,
  selectedAssetIds = [],
  onBatchDelete,
  onBatchDuplicate,
  onBatchNudge,
  onDeselectAll,
  randomizeRotation = false,
  setRandomizeRotation,
  randomizeScale = false,
  setRandomizeScale,
  atmosphericWeather = 'clear',
  setAtmosphericWeather,
  selectedLightColor = '#f59e0b',
  setSelectedLightColor,
  selectedLightRadius = 180,
  setSelectedLightRadius,
  selectedLightAnimation = 'flicker',
  setSelectedLightAnimation,
  selectedTerrainId,
  setSelectedTerrainId,
  terrainBrushWidth,
  setTerrainBrushWidth,
  terrainRenderMode,
  setTerrainRenderMode,
  pencilColor,
  setPencilColor,
  pencilWidth,
  setPencilWidth,
  textLabelInput,
  setTextLabelInput,
  textColor,
  setTextColor,
  textSize,
  setTextSize,
  rulerAvailableAp,
  setRulerAvailableAp,
  onOpenLandmassModal,
  onOpenUvttModal,
  onOpenAssetManager,
  onOpenHeroDrawer,
  onOpenOmnicortexDrawer,
  onOpenHazmatModal,
  onOpenLayersPanel,
  onOpenUnderlayModal
}) => {
  const [stampCategory, setStampCategory] = useState<'walls' | 'objects' | 'hazards' | 'props' | 'spawner'>('walls');
  const [isMinimized, setIsMinimized] = useState(false);
  const [toolCategory, setToolCategory] = useState<'all' | 'construct' | 'dressing' | 'annotate'>('all');

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-amber-500/60 rounded-2xl px-3.5 py-2 shadow-2xl font-mono text-slate-100 animate-in fade-in duration-150 select-none">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        <span className="text-xs font-bold text-amber-300">
          STUDIO: <span className="uppercase text-white font-bold">{activeTool}</span>
        </span>
        <button
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setIsMinimized(false);
          }}
          className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
        >
          EXPAND
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Exit Architect Mode"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  const currentCategoryStamps = ARCHITECT_ITEMS.filter(i => i.category === stampCategory);

  const handleToolChange = (tool: ArchitectDesignTool) => {
    AudioService.playTerminalBeep(1200, 0.02);
    setActiveTool(tool);
    if (tool !== 'object' && tool !== 'hazard' && tool !== 'token') {
      onSelectStamp(null);
    }
  };

  const handleStampSelect = (item: PaletteItem) => {
    AudioService.playTerminalBeep(1300, 0.03);
    if (selectedStamp?.id === item.id) {
      onSelectStamp(null);
    } else {
      onSelectStamp(item);
      if (item.type === 'object') setActiveTool('object');
      else if (item.type === 'hazard') setActiveTool('hazard');
      else if (item.type === 'token') setActiveTool('token');
      else if (item.type === 'wall') setActiveTool('wall');
    }
  };

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
    AudioService.playTerminalBeep(1100, 0.02);
  };

  const ALL_TOOLS: { id: ArchitectDesignTool; label: string; icon: any; category: 'construct' | 'dressing' | 'annotate'; hotkey?: string }[] = [
    { id: 'select', label: 'Select', icon: MousePointer, category: 'annotate', hotkey: 'V' },
    { id: 'wall', label: 'Wall', icon: Shield, category: 'construct', hotkey: 'W' },
    { id: 'terrain', label: 'Terrain', icon: Layers, category: 'construct', hotkey: 'T' },
    { id: 'fill', label: 'Flooring', icon: PaintBucket, category: 'construct', hotkey: 'F' },
    { id: 'pencil', label: 'Sketch', icon: Edit3, category: 'annotate', hotkey: 'P' },
    { id: 'light', label: 'Light', icon: Lightbulb, category: 'dressing', hotkey: 'L' },
    { id: 'object', label: 'Object', icon: Terminal, category: 'dressing', hotkey: 'O' },
    { id: 'token', label: 'Token', icon: Bot, category: 'dressing' },
    { id: 'text', label: 'Text', icon: Type, category: 'annotate' },
    { id: 'hazard', label: 'Hazard', icon: Flame, category: 'dressing' },
    { id: 'ruler', label: 'Ruler', icon: Compass, category: 'annotate', hotkey: 'R' },
    { id: 'eraser', label: 'Eraser', icon: Eraser, category: 'annotate', hotkey: 'E' }
  ];

  const filteredTools = toolCategory === 'all' 
    ? ALL_TOOLS 
    : ALL_TOOLS.filter(t => t.category === toolCategory);

  return (
    <aside className="fixed bottom-3 right-3 z-50 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col font-mono text-slate-100 overflow-hidden select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* ── Studio Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-cyan-500/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            ARCHITECT DESIGN STUDIO
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Atmospheric Environment Selector */}
          {setAtmosphericWeather && (
            <select
              value={atmosphericWeather}
              onChange={(e) => setAtmosphericWeather(e.target.value as AtmosphericWeatherType)}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-300 border border-cyan-500/40 focus:outline-none cursor-pointer"
              title="Global Atmospheric Environment / Shader Preset"
            >
              {Object.values(ATMOSPHERIC_PRESETS).map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onToggleGridSnap}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
              gridSnap 
                ? 'bg-amber-950/80 text-amber-300 border-amber-600' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Grid Snapping (70px cell)"
          >
            SNAP {gridSnap ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              setIsMinimized(true);
            }}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Minimize Design Palette"
          >
            <Minus size={15} />
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close Design Palette (Resume Play Mode)"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Primary Tool Switcher Bar (Categorized) ── */}
      <div className="px-3 pt-2 pb-1.5 bg-slate-950/40 border-b border-slate-800 shrink-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
            Tool Category:
          </span>
          <span className="text-[9px] text-amber-400 font-bold uppercase">
            {activeTool.toUpperCase()} ARMED
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 mb-2 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[9.5px]">
          {[
            { id: 'all', label: 'All (12)' },
            { id: 'construct', label: 'Construct' },
            { id: 'dressing', label: 'Dressing' },
            { id: 'annotate', label: 'Annotate' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setToolCategory(cat.id as any);
              }}
              className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer font-bold ${
                toolCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tool Grid */}
        <div className="grid grid-cols-6 gap-1 text-[10px]">
          {filteredTools.map(t => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleToolChange(t.id as ArchitectDesignTool)}
                className={`py-1.5 px-0.5 rounded-lg border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title={`${t.label}${t.hotkey ? ` (${t.hotkey})` : ''}`}
              >
                <Icon size={12} />
                <span className="text-[8px] uppercase truncate max-w-full">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contextual Selection Inspector Bar ── */}
      {selectedAssetIds && selectedAssetIds.length > 0 && (
        <div className="mx-3 mt-2 p-2 bg-sky-950/80 border border-sky-500/50 rounded-xl space-y-1.5 shadow-[0_0_12px_rgba(56,189,248,0.25)] animate-in fade-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
              <CheckSquare size={13} /> {selectedAssetIds.length} Asset{selectedAssetIds.length > 1 ? 's' : ''} Selected
            </span>
            <button
              onClick={onDeselectAll}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear (Esc)
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onBatchDuplicate}
              className="flex-1 py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-400 rounded text-[10px] font-bold text-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy size={11} /> Duplicate
            </button>
            <button
              onClick={onBatchDelete}
              className="flex-1 py-1 px-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 rounded text-[10px] font-bold text-red-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Delete (Del)"
            >
              <Trash2 size={11} /> Delete
            </button>
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-700 rounded p-0.5 shrink-0">
              <button
                onClick={() => onBatchNudge?.(0, -10)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                title="Nudge Up"
              >
                <ArrowUp size={10} />
              </button>
              <button
                onClick={() => onBatchNudge?.(0, 10)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                title="Nudge Down"
              >
                <ArrowDown size={10} />
              </button>
              <button
                onClick={() => onBatchNudge?.(-10, 0)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                title="Nudge Left"
              >
                <ArrowLeft size={10} />
              </button>
              <button
                onClick={() => onBatchNudge?.(10, 0)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                title="Nudge Right"
              >
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scrollable Body: Tool Subpanel & Catalogs ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* SUBPANEL 1: WALL TOOL */}
        {activeTool === 'wall' && (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Shield size={13} /> Wall Construction
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Shift: 15° Snap</span>
            </div>

            {/* Geometric Wall Construction Mode Switcher */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Geometry Mode:
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {[
                  { id: 'single', label: 'Single Wall' },
                  { id: 'chain', label: 'Polywall Chain' },
                  { id: 'room', label: 'Chamber Room' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setWallConstructionMode?.(m.id as any)}
                    className={`py-1 px-1 rounded-lg border font-bold transition-all text-center cursor-pointer ${
                      wallConstructionMode === m.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'solid', label: 'Solid Wall', color: 'border-cyan-500 bg-cyan-950/70 text-cyan-300' },
                { id: 'door', label: 'Bulkhead Door', color: 'border-amber-500 bg-amber-950/70 text-amber-300' },
                { id: 'window', label: 'Window (LoS)', color: 'border-sky-400 bg-sky-950/70 text-sky-300' },
                { id: 'ethereal', label: 'Ethereal Barrier', color: 'border-purple-500 bg-purple-950/70 text-purple-300' }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWallType(w.id)}
                  className={`py-1.5 px-2 text-xs rounded-lg border font-bold transition-all text-center cursor-pointer ${
                    selectedWallType === w.id
                      ? `${w.color} shadow-[0_0_8px_rgba(6,182,212,0.4)]`
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {selectedWallType === 'door' && (
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400 font-bold uppercase text-[10px]">Cyber Hack DC:</span>
                  <span className="text-white font-bold">{doorLockDc}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={doorLockDc}
                  onChange={(e) => setDoorLockDc(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            )}
            <p className="text-[10px] text-slate-400 italic">
              Click and drag across the canvas to draw wall segments. Automatically integrates into BVH raycasting tree.
            </p>
          </div>
        )}

        {/* SUBPANEL 2: TERRAIN BRUSH */}
        {activeTool === 'terrain' && (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <Layers size={13} /> Terrain Painting Brush
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTerrainRenderMode('organic')}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase cursor-pointer ${
                    terrainRenderMode === 'organic' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Organic
                </button>
                <button
                  onClick={() => setTerrainRenderMode('hex')}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase cursor-pointer ${
                    terrainRenderMode === 'hex' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Hex
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Brush Width:</span>
                <span className="text-emerald-400 font-bold">{terrainBrushWidth}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={terrainBrushWidth}
                onChange={(e) => setTerrainBrushWidth(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {BIOME_OPTIONS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedTerrainId(b.id)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedTerrainId === b.id
                      ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: b.color }} />
                  <span className="truncate text-[11px]">{b.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Click and drag on the Stage to paint organic biomes or click hex cells to fill tiles.
            </p>
          </div>
        )}

        {/* SUBPANEL 2B: ROOM FLOORING FILL BUCKET */}
        {activeTool === 'fill' && (
          <div className="bg-slate-950/70 border border-amber-500/40 rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <PaintBucket size={13} /> Room Floor Fill Bucket
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-Click Fill</span>
            </div>

            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Decking / Floor Material:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {BIOME_OPTIONS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedTerrainId(b.id)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedTerrainId === b.id
                      ? 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: b.color }} />
                  <span className="truncate text-[11px]">{b.label}</span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              Click anywhere inside an enclosed 4-wall chamber or room enclosure. The floodfill engine will automatically detect chamber boundaries and generate a precision floor polygon.
            </p>
          </div>
        )}

        {/* SUBPANEL 2C: POINT & CONE LIGHTING FIXTURES */}
        {activeTool === 'light' && (
          <div className="bg-slate-950/70 border border-yellow-500/40 rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-yellow-300 uppercase flex items-center gap-1.5">
                <Lightbulb size={13} /> Placeable Light Sources
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Click to Place</span>
            </div>

            {/* Light Presets */}
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Light Fixture Presets:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {LIGHT_PRESETS.map((lp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLightColor?.(lp.color);
                    setSelectedLightRadius?.(lp.radius);
                    setSelectedLightAnimation?.(lp.animation);
                    AudioService.playTerminalBeep(1250, 0.02);
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedLightColor === lp.color && selectedLightAnimation === lp.animation
                      ? 'border-yellow-400 bg-yellow-950/80 text-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: lp.color }} />
                  <span className="truncate text-[10px]">{lp.label}</span>
                </button>
              ))}
            </div>

            {/* Radius Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Illumination Radius:</span>
                <span className="text-yellow-400 font-bold">{selectedLightRadius}px ({Math.round(selectedLightRadius / 70 * 5)}ft)</span>
              </div>
              <input
                type="range"
                min="60"
                max="450"
                step="10"
                value={selectedLightRadius}
                onChange={(e) => setSelectedLightRadius?.(Number(e.target.value))}
                className="w-full accent-yellow-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Animation Selector */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Light Animation Modulation:
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {(['none', 'flicker', 'pulse', 'strobe', 'emergency'] as const).map(anim => (
                  <button
                    key={anim}
                    onClick={() => setSelectedLightAnimation?.(anim)}
                    className={`py-1 px-1 rounded-lg border font-bold capitalize transition-all text-center cursor-pointer ${
                      selectedLightAnimation === anim
                        ? 'border-yellow-400 bg-yellow-950/70 text-yellow-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Click anywhere on the Stage to place an omni light emitter. Casts 2D raycast shadows against BVH walls.
            </p>
          </div>
        )}

        {/* SUBPANEL 3: PENCIL SKETCH */}
        {activeTool === 'pencil' && (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
            <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Edit3 size={13} /> Freehand Tactical Pencil
            </span>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Stroke Color:</span>
              <div className="flex items-center gap-2">
                {PENCIL_COLOR_OPTIONS.map(c => (
                  <button
                    key={c.color}
                    onClick={() => setPencilColor(c.color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      pencilColor === c.color ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Line Width:</span>
                <span className="text-amber-400 font-bold">{pencilWidth}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="2"
                value={pencilWidth}
                onChange={(e) => setPencilWidth(Number(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* SUBPANEL 4: TEXT LABEL */}
        {activeTool === 'text' && (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
            <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
              <Type size={13} /> Tactical Text Annotation
            </span>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Label Text:
              </label>
              <input
                type="text"
                value={textLabelInput}
                onChange={(e) => setTextLabelInput(e.target.value)}
                placeholder="e.g. Sector Alpha Airlock"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold">Color:</span>
              <div className="flex items-center gap-1.5">
                {PENCIL_COLOR_OPTIONS.map(c => (
                  <button
                    key={c.color}
                    onClick={() => setTextColor(c.color)}
                    className={`w-4 h-4 rounded-full border ${textColor === c.color ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Font Size:</span>
                <span className="text-sky-400 font-bold">{textSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="2"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Click anywhere on the Stage to place this text label.
            </p>
          </div>
        )}

        {/* SUBPANEL 5: RULER */}
        {activeTool === 'ruler' && (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
            <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <Compass size={13} /> Tactical Waypoint Ruler
            </span>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Action Point (AP) Pool:</span>
                <span className="text-cyan-400 font-bold">{rulerAvailableAp} AP</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={rulerAvailableAp}
                onChange={(e) => setRulerAvailableAp(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Measures dynamic movement distance against selected operative speed and terrain hazards.
            </p>
          </div>
        )}

        {/* SUBPANEL 6: ERASER */}
        {activeTool === 'eraser' && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 space-y-1.5">
            <span className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
              <Eraser size={13} /> Tactical Eraser Active
            </span>
            <p className="text-[10px] text-slate-300">
              Click on any wall, interactive object, terrain polygon, sketch line, or text label to permanently remove it from this sector.
            </p>
          </div>
        )}

        {/* ── STAMP PALETTE (FOR OBJECTS, PROPS, HAZARDS, SPAWNERS) ── */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Stamp & Prop Library:
            </span>
            <div className="flex gap-1">
              {(['walls', 'objects', 'hazards', 'props', 'spawner'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.01);
                    setStampCategory(tab);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                    stampCategory === tab 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'spawner' ? 'Units' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Randomization Jitter Accelerators */}
          <div className="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800 text-[9px] text-slate-300">
            <span className="flex items-center gap-1 text-slate-400 font-bold">
              <Shuffle size={10} className="text-amber-400" /> Scatter Jitter:
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomizeRotation}
                  onChange={(e) => setRandomizeRotation?.(e.target.checked)}
                  className="rounded accent-amber-400 cursor-pointer w-3 h-3"
                />
                <span>Angle (±15°)</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomizeScale}
                  onChange={(e) => setRandomizeScale?.(e.target.checked)}
                  className="rounded accent-amber-400 cursor-pointer w-3 h-3"
                />
                <span>Size (±15%)</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {currentCategoryStamps.map(item => {
              const Icon = item.icon;
              const isSelected = selectedStamp?.id === item.id;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => handleStampSelect(item)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900'
                  }`}
                >
                  <div 
                    className="p-1.5 rounded-lg shrink-0 mt-0.5" 
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{item.label}</h4>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-bold uppercase">
                          ARMED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── EXTERNAL MODAL LAUNCHERS ── */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Cartography & Foundry Tools:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenLandmassModal();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Landmass Gen</span>
            </button>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenUvttModal();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload size={13} />
              <span>Import UVTT</span>
            </button>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenHeroDrawer();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users size={13} />
              <span>Folio Hero Roster</span>
            </button>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenOmnicortexDrawer();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-purple-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu size={13} />
              <span>Omnicortex Catalog</span>
            </button>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenAssetManager();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen size={13} />
              <span>Texture Manager</span>
            </button>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenHazmatModal();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-orange-500/40 text-orange-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Biohazard size={13} />
              <span>Hazmat Volumes</span>
            </button>

            {onOpenUnderlayModal && (
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  onOpenUnderlayModal();
                }}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-sky-500/40 text-sky-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer col-span-2"
              >
                <ImageIcon size={13} />
                <span>Blueprint Underlay Calibration</span>
              </button>
            )}

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenLayersPanel();
              }}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer col-span-2"
            >
              <Layers size={13} />
              <span>Compositor Layers Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer Telemetry & Stats ── */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span className="truncate">Sector: <strong className="text-slate-200">{activeMapTitle}</strong></span>
        <div className="flex gap-2">
          <span>Walls: <strong className="text-cyan-400">{wallsCount}</strong></span>
          <span>Objects: <strong className="text-amber-400">{objectsCount}</strong></span>
          <span>Terrains: <strong className="text-emerald-400">{terrainsCount}</strong></span>
          <span>Hazards: <strong className="text-orange-400">{hazardsCount}</strong></span>
          <span>Lights: <strong className="text-yellow-400">{lightsCount}</strong></span>
          <span>Lines: <strong className="text-sky-400">{linesCount}</strong></span>
          <span>Texts: <strong className="text-purple-400">{textsCount}</strong></span>
        </div>
      </div>
    </aside>
  );
};
