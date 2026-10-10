import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  GitBranch, 
  Target, 
  Box, 
  Layers, 
  FolderTree, 
  Map as MapIcon, 
  Sparkles, 
  Hammer, 
  FileText, 
  Zap, 
  Sliders, 
  Tv2, 
  Cpu,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';
import { getBreadcrumbNodePath } from '../../../../utils/scenarioTreeEngine';

export default function ToolbarBreadcrumb({
  activeView = 'scenarios',
  scenarioWorkspaceTab = 'write',
  stageWorkspaceTab = 'setup',
  activeNode = null,
  activeElement = null,
  storyTitle = null,
  scenarios = null,
  onSwitchView,
  onSelectScenarioWorkspaceTab,
  onSelectScenario,
  onBack,
  className = ''
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    AudioService.playTerminalBeep(900, 0.02);
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Determine view label & icon
  const getViewDetails = () => {
    switch (activeView) {
      case 'scenarios':
      case 'weaver':
        return { label: 'Story Weaver', icon: FolderTree, color: 'text-cyan-400' };
      case 'interactive':
        return { label: 'Interactive Play', icon: Zap, color: 'text-purple-400' };
      case 'graph':
        return { label: 'Story Graph', icon: GitBranch, color: 'text-purple-400' };
      case 'control-panel':
      case 'tactical':
        return { label: 'Tactical Spread', icon: Target, color: 'text-amber-400' };
      case 'elements':
      case 'gallery':
      case 'assets':
        return { label: 'Story Elements', icon: Hammer, color: 'text-emerald-400' };
      case 'map':
      case 'map-maker':
        return { label: 'Map Architect', icon: MapIcon, color: 'text-indigo-400' };
      case 'stage':
      case 'vtt':
        return { label: 'Stage VTT', icon: Sparkles, color: 'text-purple-400' };
      case 'mission_control':
      default:
        return { label: 'Mission Control', icon: Layers, color: 'text-cyan-400' };
    }
  };

  // Determine sub-tab label
  const getTabLabel = () => {
    if (activeView === 'scenarios') {
      if (scenarioWorkspaceTab === 'play') return 'Play Mode';
      if (scenarioWorkspaceTab === 'graph') return 'Story Graph';
      if (scenarioWorkspaceTab === 'gems') return 'Guidance Gems';
      if (scenarioWorkspaceTab === 'write') return 'Manuscript';
      return scenarioWorkspaceTab;
    }
    if (activeView === 'stage') {
      if (stageWorkspaceTab === 'run') return 'Live Director';
      if (stageWorkspaceTab === 'encounters') return 'Encounter Spread';
      if (stageWorkspaceTab === 'scripts') return 'Scripts & Automation';
      if (stageWorkspaceTab === 'setup') return 'Compiler';
      return stageWorkspaceTab;
    }
    return null;
  };

  // Compute hierarchical path of scenario nodes if available
  const scenarioNodePath = useMemo(() => {
    if (!scenarios || !activeNode?.id) return null;
    return getBreadcrumbNodePath(scenarios, activeNode.id);
  }, [scenarios, activeNode?.id]);

  const viewDetails = getViewDetails();
  const tabLabel = getTabLabel();
  const ViewIcon = viewDetails.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs shadow-inner min-h-[32px] select-none ${className}`}>
      {/* Back button */}
      <button
        type="button"
        onClick={handleBack}
        className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0 active:scale-95 group"
        title="Back to previous page / tab (History)"
        aria-label="Back"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Crumb 1: Story Foundry Root */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.02);
          if (onSwitchView) onSwitchView('mission_control');
          else navigate('/foundry');
        }}
        className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
        title="Return to Story Foundry Mission Control"
      >
        <Layers size={11} className="text-cyan-400" />
        <span className="font-bold uppercase tracking-wider hidden sm:inline">Foundry</span>
      </button>

      {/* Crumb 2: Story Project Title (if present) */}
      {storyTitle && (
        <>
          <ChevronRight size={10} className="text-slate-600 shrink-0" />
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('scenarios', 'write');
            }}
            className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer font-semibold truncate max-w-[120px] md:max-w-[160px]"
            title={`Active Project: ${storyTitle}`}
          >
            {storyTitle}
          </button>
        </>
      )}

      {/* Crumb 3: Active Workspace View */}
      {activeView !== 'mission_control' && (
        <>
          <ChevronRight size={10} className="text-slate-600 shrink-0" />
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView(activeView);
            }}
            className={`flex items-center gap-1 transition-colors cursor-pointer font-bold uppercase tracking-wider ${
              !activeNode && !activeElement && (!tabLabel || tabLabel === 'Manuscript')
                ? 'text-cyan-200 font-extrabold'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
            title={`Workspace: ${viewDetails.label}`}
          >
            <ViewIcon size={12} className={viewDetails.color} />
            <span className="truncate max-w-[130px]">{viewDetails.label}</span>
          </button>
        </>
      )}

      {/* Crumb 4: Tab / Mode (if non-default) */}
      {tabLabel && tabLabel !== 'Manuscript' && (
        <>
          <ChevronRight size={10} className="text-slate-600 shrink-0" />
          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[10px] uppercase tracking-wider truncate max-w-[100px]">
            {tabLabel}
          </span>
        </>
      )}

      {/* Crumb 5: Scenario Hierarchy or Single Node / Element */}
      {scenarioNodePath && scenarioNodePath.length > 0 ? (
        scenarioNodePath.map((item, idx) => {
          const isLeaf = idx === scenarioNodePath.length - 1;
          return (
            <React.Fragment key={item.id}>
              <ChevronRight size={10} className="text-slate-600 shrink-0" />
              {isLeaf ? (
                <div className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-bold text-[11px] truncate max-w-[140px] md:max-w-[200px] shadow-xs">
                  <FileText size={10} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    if (onSelectScenario) onSelectScenario(item.id);
                  }}
                  className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer truncate max-w-[110px]"
                  title={`Select ${item.title}`}
                >
                  {item.title}
                </button>
              )}
            </React.Fragment>
          );
        })
      ) : activeNode ? (
        <>
          <ChevronRight size={10} className="text-slate-600 shrink-0" />
          <div className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-bold text-[11px] truncate max-w-[140px] md:max-w-[200px] shadow-xs">
            <FileText size={10} className="text-cyan-400 shrink-0" />
            <span className="truncate">{activeNode.title || 'Untitled Scenario'}</span>
          </div>
        </>
      ) : null}

      {activeElement && !activeNode && (
        <>
          <ChevronRight size={10} className="text-slate-600 shrink-0" />
          <div className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-bold text-[11px] truncate max-w-[140px] md:max-w-[200px] shadow-xs">
            <Hammer size={10} className="text-emerald-400 shrink-0" />
            <span className="truncate">{activeElement.name || 'Untitled Element'}</span>
          </div>
        </>
      )}
    </div>
  );
}
