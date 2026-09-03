/**
 * @file ArchitectDesignPalette.tsx
 * @description In-Situ Architect Design Drawer & Asset Palette for The Stage.
 * Enables live dragging-and-dropping and click-to-stamp placement of walls,
 * bulkheads, terminals, loot containers, hazards, and NPC tokens directly onto the stage.
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
  Grid, 
  X, 
  MousePointer, 
  Cpu, 
  Bot, 
  Users,
  Eye
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export type ArchitectPaletteTab = 'walls' | 'objects' | 'hazards' | 'props' | 'spawner';

export interface PaletteItem {
  id: string;
  category: ArchitectPaletteTab;
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

  // 3. Environmental Hazards
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

  // 4. Tactical Cover & Props
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

export interface ArchitectDesignPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStamp: PaletteItem | null;
  onSelectStamp: (stamp: PaletteItem | null) => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  activeMapTitle?: string;
  wallsCount: number;
  objectsCount: number;
  hazardsCount: number;
}

export const ArchitectDesignPalette: React.FC<ArchitectDesignPaletteProps> = ({
  isOpen,
  onClose,
  selectedStamp,
  onSelectStamp,
  gridSnap,
  onToggleGridSnap,
  activeMapTitle = 'Tactical Sector',
  wallsCount,
  objectsCount,
  hazardsCount
}) => {
  const [activeTab, setActiveTab] = useState<ArchitectPaletteTab>('walls');

  if (!isOpen) return null;

  const currentItems = ARCHITECT_ITEMS.filter(i => i.category === activeTab);

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    AudioService.playTerminalBeep(1100, 0.02);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleItemClick = (item: PaletteItem) => {
    AudioService.playTerminalBeep(1250, 0.03);
    if (selectedStamp?.id === item.id) {
      onSelectStamp(null);
    } else {
      onSelectStamp(item);
    }
  };

  return (
    <div className="absolute top-20 left-4 w-80 bg-slate-950/95 backdrop-blur-xl border-2 border-amber-500/80 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.25)] z-[120] flex flex-col font-mono text-slate-200 select-none overflow-hidden max-h-[82vh] animate-scaleUp">
      
      {/* Header Banner */}
      <div className="p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div>
            <h3 className="text-xs font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
              <span>🛠️</span> ARCHITECT PALETTE
            </h3>
            <span className="text-[9px] text-amber-400/80 block truncate max-w-[170px]">
              {activeMapTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleGridSnap}
            className={`px-2 py-1 rounded text-[9.5px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              gridSnap 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="Snap placements to 70px / 5ft Grid"
          >
            <Grid size={11} /> {gridSnap ? 'SNAP ON' : 'FREE'}
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Design Palette"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Mode Instructions Banner */}
      <div className="bg-amber-950/40 px-3 py-1.5 border-b border-amber-500/20 text-[9px] text-amber-200/90 flex items-center justify-between">
        <span>💡 Drag & drop or click an asset to stamp.</span>
        <span className="font-bold text-amber-400 font-mono">SIM PAUSED</span>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-5 p-1.5 bg-slate-900/90 border-b border-slate-800 text-[10px] gap-1">
        {[
          { id: 'walls', label: 'WALLS', icon: Shield },
          { id: 'objects', label: 'OBJS', icon: Terminal },
          { id: 'hazards', label: 'HAZARD', icon: Flame },
          { id: 'props', label: 'COVER', icon: Box },
          { id: 'spawner', label: 'UNITS', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                setActiveTab(tab.id as any);
              }}
              className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={12} />
              <span className="text-[8.5px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stamp Indicator */}
      {selectedStamp && (
        <div className="px-3 py-1.5 bg-cyan-950/60 border-b border-cyan-500/40 text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <MousePointer size={11} className="animate-bounce" />
            <span>Stamp Armed: <strong className="text-white">{selectedStamp.label}</strong></span>
          </div>
          <button
            onClick={() => onSelectStamp(null)}
            className="text-[9px] text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Items Scroll Area */}
      <div className="p-2 space-y-1.5 overflow-y-auto flex-1 max-h-[340px]">
        {currentItems.map(item => {
          const Icon = item.icon;
          const isArmed = selectedStamp?.id === item.id;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => handleItemClick(item)}
              className={`p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                isArmed
                  ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: `${item.color}20`, borderColor: item.color, color: item.color }}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.label}</span>
                </div>
                {isArmed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold uppercase">
                    ARMED
                  </span>
                )}
              </div>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Map Telemetry Footer */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[9.5px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Walls: <strong className="text-cyan-400 font-mono">{wallsCount}</strong></span>
          <span>Objs: <strong className="text-blue-400 font-mono">{objectsCount}</strong></span>
          <span>Hazards: <strong className="text-orange-400 font-mono">{hazardsCount}</strong></span>
        </div>
        <span className="text-[8.5px] text-emerald-400 font-bold">BVH SYNC ACTIVE</span>
      </div>

    </div>
  );
};

export default ArchitectDesignPalette;
