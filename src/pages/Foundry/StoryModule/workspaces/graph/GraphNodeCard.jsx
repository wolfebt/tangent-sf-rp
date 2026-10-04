/**
 * @file GraphNodeCard.jsx
 * @description Glassmorphic scenario node card for ADE Story Graph.
 * Visualizes narrative units (Acts, Scenes, Encounters, Choices, Climaxes) with
 * semantic styling, interactive ports, linked map indicators, scene beats, and fast actions.
 */

import React from 'react';
import { 
  Map as MapIcon, 
  Flag, 
  Crosshair, 
  BookOpen, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Circle, 
  Layers, 
  Sliders, 
  Zap,
  MoreVertical,
  Copy
} from 'lucide-react';
import { getNodeTypeConfig } from './graphUtils';

export const GraphNodeCard = ({
  node,
  pos,
  nodeWidth = 290,
  isSelected = false,
  isPlayheadCurrent = false,
  isPlayheadTraversed = false,
  isConnecting = false,
  linkedMap = null,
  density = 'detailed',
  isHighlighted = true,
  isDimmed = false,
  onSelect,
  onMouseDown,
  onStartConnection,
  onCompleteConnection,
  onOpenWeaver,
  onOpenPlay,
  onPanStage,
  onAddBranch,
  onDelete,
  onDuplicate,
  onOpenInspector
}) => {
  if (!node || !pos) return null;

  const typeConfig = getNodeTypeConfig(node.type);
  const rawBeats = node.fields?.sceneBeats || '';
  const beatsArr = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);
  const choicesCount = (node.fields?.choices?.length || 0) + (node.fields?.connections?.length || 0);

  // Dynamic Border & Shadow classes
  let cardClasses = 'bg-[#090e1a]/95 border-slate-800 hover:border-slate-650';
  if (isPlayheadCurrent) {
    cardClasses = 'bg-emerald-950/90 border-emerald-400 ring-4 ring-emerald-400/60 shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-pulse';
  } else if (isSelected) {
    cardClasses = `bg-[#0f172a]/95 ${typeConfig.selectedBorderClass}`;
  } else if (isPlayheadTraversed) {
    cardClasses = 'bg-[#08121f]/90 border-emerald-600/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
  }

  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: `${nodeWidth}px`,
        opacity: isDimmed ? 0.35 : 1
      }}
      className={`node-card absolute pointer-events-auto rounded-2xl border transition-all cursor-default flex flex-col backdrop-blur-md shadow-2xl select-none group font-sans ${cardClasses}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(node);
      }}
    >
      {/* ── CARD HEADER (DRAG HANDLE) ── */}
      <div
        onMouseDown={(e) => onMouseDown && onMouseDown(e, node)}
        className="p-2.5 px-3 border-b border-slate-800/80 bg-slate-950/70 rounded-t-2xl flex items-center justify-between cursor-move"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Status Dot / Playhead Pulse */}
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isPlayheadCurrent
                ? 'bg-emerald-400 animate-ping'
                : isSelected
                ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                : ''
            }`}
            style={{ backgroundColor: !isPlayheadCurrent && !isSelected ? typeConfig.dotColor : undefined }}
          />

          {/* Title */}
          <span className="text-[11.5px] font-mono font-bold text-slate-100 truncate uppercase tracking-wide">
            {node.title || 'Untitled Scenario'}
          </span>
        </div>

        {/* Type Badge */}
        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider flex items-center gap-1 ${typeConfig.badgeClass}`}
        >
          <span>{typeConfig.icon}</span>
          <span>{node.type || 'Scene'}</span>
        </span>
      </div>

      {/* ── CARD BODY (DETAILED VS COMPACT) ── */}
      {density === 'detailed' ? (
        <div className="p-3 space-y-2.5 font-mono text-xs flex-1">
          {/* Linked Tactical Map Sector Badge */}
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-400 flex items-center gap-1.5 truncate max-w-[170px]">
              <MapIcon size={12} className="text-cyan-400 shrink-0" />
              <span className="truncate">
                {linkedMap?.title || 'No Linked Sector'}
              </span>
            </span>

            {linkedMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPanStage) onPanStage(node);
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1 text-[9px] cursor-pointer shadow-xs"
                title="Pan Stage battlemap to this sector"
              >
                <Crosshair size={10} />
                <span>Pan Stage</span>
              </button>
            )}
          </div>

          {/* Telemetry Chips (Waypoints, Beats, Choices) */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Flag size={11} className="text-amber-400" />
              <span>{linkedMap?.waypoints?.length || 0} Waypoints</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-400">⚡</span>
              <span>{choicesCount} Choices</span>
            </span>
            <span>•</span>
            <span>{beatsArr.length} Beats</span>
          </div>

          {/* Scene Beats Checklist Preview */}
          {beatsArr.length > 0 ? (
            <div className="space-y-1 pt-0.5">
              {beatsArr.slice(0, 2).map((beat, bIdx) => (
                <div
                  key={bIdx}
                  className="flex items-start gap-1.5 text-[10px] text-slate-300 font-sans leading-tight truncate"
                >
                  <Circle size={9} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className="truncate">{beat}</span>
                </div>
              ))}
              {beatsArr.length > 2 && (
                <div className="text-[9px] text-slate-500 italic font-mono pl-4">
                  +{beatsArr.length - 2} more scene beats...
                </div>
              )}
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-slate-950/50 border border-slate-850 text-[10px] text-slate-400 line-clamp-2 italic leading-relaxed font-sans">
              {node.content?.replace(/<[^>]*>/g, '').slice(0, 75) || 'No narrative briefing written yet...'}
            </div>
          )}
        </div>
      ) : (
        /* Compact Mode */
        <div className="p-2 px-3 font-mono text-[10.5px] text-slate-400 flex items-center justify-between">
          <span className="truncate max-w-[180px]">
            {linkedMap ? `📍 ${linkedMap.title}` : `${beatsArr.length} beats • ${choicesCount} choices`}
          </span>
          <span className="text-slate-500 text-[9px]">{choicesCount} ➔</span>
        </div>
      )}

      {/* ── CARD FOOTER ACTIONS ── */}
      <div className="p-2 px-3 border-t border-slate-800/80 bg-slate-950/50 rounded-b-2xl flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          {/* Jump to Weaver */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenWeaver) onOpenWeaver(node);
            }}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold transition-colors"
            title="Open in Story Weaver Editor"
          >
            <BookOpen size={11} />
            <span>Weaver</span>
          </button>

          {/* Jump to Interactive Play */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenPlay) onOpenPlay(node);
            }}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-bold transition-colors"
            title="Launch Interactive Play from this Scenario"
          >
            <Play size={10} />
            <span>Play</span>
          </button>
        </div>

        {/* Action Button Cluster */}
        <div className="flex items-center gap-1">
          {/* Inspect / Properties */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenInspector) onOpenInspector(node);
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-750 transition-colors cursor-pointer"
            title="Open Node Properties Inspector"
          >
            <Sliders size={11} />
          </button>

          {/* Add Connected Branch Node */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddBranch) onAddBranch(node);
            }}
            className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-750 transition-colors cursor-pointer"
            title="Add connected branch node"
          >
            <Plus size={11} />
          </button>

          {/* Duplicate Node */}
          {onDuplicate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node);
              }}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750 transition-colors cursor-pointer"
              title="Duplicate scenario node"
            >
              <Copy size={11} />
            </button>
          )}

          {/* Delete Node */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(node);
            }}
            className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-750 transition-colors cursor-pointer"
            title="Delete scenario node"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* ── OUTPUT CONNECTION PORT (RIGHT EDGE) ── */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onStartConnection) onStartConnection(e, node.id);
        }}
        className="node-port absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center cursor-crosshair hover:scale-135 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.6)] z-20 group/port"
        title="Drag wire to connect to another node"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-300 group-hover/port:bg-white" />
      </div>

      {/* ── INPUT CONNECTION RECEIVER TARGET (LEFT EDGE) ── */}
      {isConnecting && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onCompleteConnection) onCompleteConnection(e, node.id);
          }}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center cursor-pointer animate-ping hover:scale-135 transition-transform z-20 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          title="Click to complete connection wire here"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-300" />
        </div>
      )}
    </div>
  );
};

export default React.memo(GraphNodeCard);
