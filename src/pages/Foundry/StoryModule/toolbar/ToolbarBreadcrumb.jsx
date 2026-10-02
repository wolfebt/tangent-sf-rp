import React from 'react';
import { BookOpen, GitBranch, Target, Box } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export default function ToolbarBreadcrumb({
  activeView,
  onSwitchView,
  activeNode
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs shadow-inner">
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.02);
          onSwitchView?.('mission_control');
        }}
        className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-200 font-bold hidden sm:inline flex items-center gap-1 cursor-pointer transition-colors"
        title="Return to ADE Hub (Mission Control)"
      >
        <span>⤺</span> HUB
      </button>
      <span className="text-slate-700 hidden sm:inline">/</span>
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-200">
        {activeView === 'scenarios' && (
          <>
            <BookOpen size={12} className="text-cyan-400" />
            <span className="text-cyan-300">Story Weaver</span>
          </>
        )}
        {activeView === 'interactive' && (
          <>
            <span className="text-purple-400">⚡</span>
            <span className="text-purple-300">Interactive Play</span>
          </>
        )}
        {activeView === 'graph' && (
          <>
            <GitBranch size={12} className="text-purple-400" />
            <span className="text-purple-300">Story Graph</span>
          </>
        )}
        {activeView === 'control-panel' && (
          <>
            <Target size={12} className="text-amber-400" />
            <span className="text-amber-300">Tactical Spread</span>
          </>
        )}
        {(activeView === 'elements' || activeView === 'gallery') && (
          <>
            <Box size={12} className="text-emerald-400" />
            <span className="text-emerald-300">The Gallery</span>
          </>
        )}
      </div>
      {activeNode && (
        <>
          <span className="text-slate-700 hidden md:inline">•</span>
          <span className="text-slate-400 font-normal truncate max-w-[140px] lg:max-w-[220px] hidden md:inline text-[11px]">
            {activeNode.title || 'Untitled Scenario'}
          </span>
        </>
      )}
    </div>
  );
}
