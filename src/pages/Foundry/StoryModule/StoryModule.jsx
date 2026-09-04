/**
 * @file StoryModule.jsx
 * @description Adventure Development Environment (ADE) - Master Unified Story & Narrative Suite.
 * Consolidates the Story Drafting Canvas, full-screen Element Editor & Forge,
 * Granular Interactive Story Mode, OSR Two-Page Control Panel Studio, and Fiction Manuscript Studio.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Box, 
  LayoutGrid, 
  Feather, 
  FolderOpen,
  Sparkles,
  Printer
} from 'lucide-react';
import ScenarioPane from './ScenarioPane';
import ElementForge from '../ElementForge/ElementForge';
import ControlPanelStudio from './workspaces/ControlPanelStudio';
import ManuscriptStudio from './workspaces/ManuscriptStudio';
import InteractiveStoryStudio from './workspaces/InteractiveStoryStudio';
import AdventurePrintModal from './workspaces/AdventurePrintModal';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import { useStory } from '../../../context/CampaignContext';

export default function StoryModule({ defaultView = 'scenarios' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyIdParam = searchParams.get('storyId');
  const viewParam = searchParams.get('view');
  const { openStory, universeState, elementsCatalog } = useStory();

  // Mode switcher state: 'scenarios' | 'elements' | 'interactive' | 'control-panel' | 'manuscript'
  const [activeView, setActiveView] = useState(() => {
    return viewParam || defaultView || 'scenarios';
  });

  // Story Project catalog modal & Print modal
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (storyIdParam) {
      openStory(storyIdParam);
    }
  }, [storyIdParam, openStory]);

  useEffect(() => {
    if (viewParam && viewParam !== activeView) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  const handleSwitchView = (newView) => {
    setActiveView(newView);
    const newParams = new URLSearchParams(searchParams);
    if (newView === 'scenarios') {
      newParams.delete('view');
    } else {
      newParams.set('view', newView);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Find active scenario node for format studios
  const activeNode = useMemo(() => {
    const scenarios = universeState?.scenarios || [];
    const activeId = universeState?.activeScenarioId;

    const findNode = (nodes) => {
      if (!Array.isArray(nodes)) return null;
      for (const n of nodes) {
        if (n.id === activeId) return n;
        if (n.children && n.children.length > 0) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(scenarios) || scenarios[0] || null;
  }, [universeState]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative">
      {/* ── CONSOLIDATED STUDIO & MODE NAVIGATION BAR ── */}
      <nav className="h-10 px-4 bg-[#0a0d14] border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 select-none z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs">
          {/* Brand Indicator */}
          <div className="flex items-center gap-1.5 mr-2 font-mono shrink-0">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-bold text-xs tracking-wider uppercase hidden xl:inline">
              ADE
            </span>
          </div>

          {/* View 1: Scenarios & Story Canvas */}
          <button
            type="button"
            onClick={() => handleSwitchView('scenarios')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'scenarios'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Interactive Story Outline & Rich-Text Manuscript Canvas"
          >
            <BookOpen size={13} className="text-cyan-400" />
            <span>Scenarios</span>
          </button>

          {/* View 2: Consolidated Element Editor & Forge */}
          <button
            type="button"
            onClick={() => handleSwitchView('elements')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'elements'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Consolidated Element Forge & Compendium Database"
          >
            <Box size={13} className="text-amber-400" />
            <span>Element Editor</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
              {elementsCatalog?.length || 0}
            </span>
          </button>

          {/* View 3: Granular Interactive Story Studio */}
          <button
            type="button"
            onClick={() => handleSwitchView('interactive')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'interactive'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Granular Interactive Story Mode with Gated 1-2 Paragraph AI Beats & Decision Gates"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            <span>Interactive Story</span>
          </button>

          {/* View 4: OSR Two-Page Control Panel Studio */}
          <button
            type="button"
            onClick={() => handleSwitchView('control-panel')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'control-panel'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="OSR 2-Page Control Panel Spread with Read-Alouds and Threat Matrices"
          >
            <LayoutGrid size={13} className="text-emerald-400" />
            <span>Control Panel</span>
          </button>

          {/* View 5: Minimalist Manuscript Studio */}
          <button
            type="button"
            onClick={() => handleSwitchView('manuscript')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'manuscript'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Minimalist Fiction Manuscript Studio with Word Count and POV Lock"
          >
            <Feather size={13} className="text-purple-400" />
            <span>Manuscript Studio</span>
          </button>
        </div>

        {/* Global Action Launchers */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700/80 rounded-lg font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print Fiction Book or OSR Adventure Module"
          >
            <Printer size={13} className="text-cyan-400" />
            <span className="hidden md:inline">Print & Publish</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCatalogOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Story Project Catalog & Roster"
          >
            <FolderOpen size={13} className="text-amber-400" />
            <span className="hidden sm:inline">ADE Roster</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN WORKSPACE VIEWPORT ── */}
      <div className="flex-1 overflow-hidden relative">
        {/* VIEW 1: SCENARIOS & CANVAS */}
        {activeView === 'scenarios' && (
          <ScenarioPane 
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onSwitchView={handleSwitchView}
            onSwitchTab={(tab) => {
              if (tab === 'map') navigate('/map-maker');
            }} 
          />
        )}

        {/* VIEW 2: CONSOLIDATED ELEMENT FORGE */}
        {activeView === 'elements' && (
          <ElementForge 
            onBackToStory={() => handleSwitchView('scenarios')}
          />
        )}

        {/* VIEW 3: GRANULAR INTERACTIVE STORY STUDIO */}
        {activeView === 'interactive' && (
          <InteractiveStoryStudio 
            activeNode={activeNode}
          />
        )}

        {/* VIEW 4: OSR CONTROL PANEL STUDIO */}
        {activeView === 'control-panel' && (
          <ControlPanelStudio 
            activeNode={activeNode}
          />
        )}

        {/* VIEW 5: FICTION MANUSCRIPT STUDIO */}
        {activeView === 'manuscript' && (
          <ManuscriptStudio 
            activeNode={activeNode}
          />
        )}
      </div>

      {/* Story Project Catalog / Dashboard Modal */}
      <FoundryLauncherModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        initialTab="stories"
      />

      {/* Print & Publishing Modal */}
      <AdventurePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        storyTitle={activeNode?.title || 'ADE Adventure'}
      />
    </div>
  );
}
