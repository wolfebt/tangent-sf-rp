/**
 * @file CatalogNodeItem.tsx
 * @description Outliner Node Row representing a single campaign element in the Left Catalog.
 * Features drag handle for stage canvas dropping, inline player visibility toggle,
 * title, subtitle metadata, and spawn action button.
 */

import React from 'react';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Plus
} from 'lucide-react';

export interface CatalogNodeItemProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ReactNode;
  iconColor?: string;
  isVisibleToPlayers?: boolean;
  isSelected?: boolean;
  dragPayload?: Record<string, any>;
  onClick?: () => void;
  onToggleVisibility?: () => void;
  onSpawn?: () => void;
}

export const CatalogNodeItem: React.FC<CatalogNodeItemProps> = ({
  title,
  subtitle,
  badge,
  icon,
  iconColor = 'text-cyan-400',
  isVisibleToPlayers = true,
  isSelected = false,
  dragPayload,
  onClick,
  onToggleVisibility,
  onSpawn
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (dragPayload) {
      e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
      e.dataTransfer.setData('tangent/type', dragPayload.type || 'entity');
      e.dataTransfer.effectAllowed = 'copyMove';
    }
  };

  return (
    <div
      draggable={!!dragPayload}
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`group relative px-2 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 flex items-center justify-between gap-1.5 select-none ${
        dragPayload ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isSelected
          ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
          : 'bg-slate-950/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300'
      }`}
    >
      {/* Left: Drag Handle & Entity Icon */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <div 
          className="text-slate-600 group-hover:text-slate-400 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
          title="Drag and drop onto The Stage"
        >
          <GripVertical size={13} />
        </div>

        {/* Category-Themed Entity Icon */}
        <div className={`shrink-0 ${iconColor}`}>
          {icon}
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold truncate text-slate-200 group-hover:text-slate-100">
              {title}
            </span>
            {badge && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Player Visibility Toggle (Eye) */}
        {onToggleVisibility && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              isVisibleToPlayers
                ? 'text-slate-400 hover:text-cyan-300'
                : 'text-red-400/80 hover:text-red-300'
            }`}
            title={isVisibleToPlayers ? "Visible to Players (Click to Hide)" : "Hidden from Players (Click to Reveal)"}
          >
            {isVisibleToPlayers ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        )}

        {/* Quick Spawn to Stage Button */}
        {onSpawn && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSpawn();
            }}
            className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
            title="Deploy entity directly to viewport center"
          >
            <Plus size={11} />
          </button>
        )}

        {isSelected && (
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default CatalogNodeItem;
