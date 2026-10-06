import React from 'react';
import { BookOpen, GitBranch, Target, Box } from 'lucide-react';

export default function ToolbarBreadcrumb({
  activeView,
  activeNode
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs shadow-inner">
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
            <span className="text-emerald-300">Story Elements</span>
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
