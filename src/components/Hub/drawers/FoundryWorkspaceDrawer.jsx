import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Database, Map, Sparkles, Maximize2, X, List } from 'lucide-react';
import StoryModule from '../../../pages/Foundry/StoryModule/StoryModule';
import ElementForge from '../../../pages/Foundry/ElementForge/ElementForge';
import MapMaker from '../../../pages/Foundry/MapMaker/MapMaker';
import AIME from '../../../pages/Foundry/AIME/AIME';
import { AudioService } from '../../../services/audioService';

const TOOL_CONFIG = {
  scenarios: {
    title: 'SCENARIO ARCHITECT & CAMPAIGN TREE',
    subtitle: 'Campaign nodes, tactical story branches, and scenario outlines.',
    icon: BookOpen,
    color: 'purple',
    path: '/foundry/story',
    badge: 'STORY WEAVER',
    catalogDrawer: 'foundry-scenarios'
  },
  elements: {
    title: 'ELEMENT FORGE DATABASE',
    subtitle: 'Species, factions, items, tech, and narrative element builder.',
    icon: Database,
    color: 'emerald',
    path: '/foundry/elements',
    badge: 'ELEMENT FORGE',
    catalogDrawer: 'foundry-elements'
  },
  maps: {
    title: 'TACTICAL MAP MAKER & VTT',
    subtitle: 'Battlemap editor, fog of war, tokens, and tactical combat grid.',
    icon: Map,
    color: 'cyan',
    path: '/foundry/map-maker',
    badge: 'VTT ENGINE',
    catalogDrawer: 'foundry-maps'
  },
  aime: {
    title: 'AIME CREATIVE ENGINE',
    subtitle: 'AI narrative co-writer, brainstorm generator, and idea cards.',
    icon: Sparkles,
    color: 'cyan',
    path: '/foundry/aime',
    badge: 'AIME SUITE',
    catalogDrawer: 'foundry-aime'
  }
};

export const FoundryWorkspaceDrawer = ({ tool = 'scenarios', onClose, onOpenDrawer }) => {
  const navigate = useNavigate();
  const config = TOOL_CONFIG[tool] || TOOL_CONFIG.scenarios;
  const Icon = config.icon;

  const handleOpenFullBrowser = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate(config.path);
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2 select-none">
      {/* Top Banner Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-purple-500/50 shadow-md shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
            <Icon size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider truncate">
                {config.title}
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold shrink-0">
                {config.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenDrawer && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenDrawer(config.catalogDrawer);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Return to Catalog List"
            >
              <List size={12} className="text-purple-400" />
              <span>CATALOG</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenFullBrowser}
            className="px-2.5 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            title={`Open ${config.title} in Full Browser View (${config.path})`}
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">FULL BROWSER VIEW</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Foundry Drawer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Tool Workspace */}
      <div className="flex-1 min-h-[520px] max-h-[calc(100vh-280px)] rounded-xl border border-slate-800/90 overflow-hidden bg-[#0d1117]/95 shadow-inner">
        {tool === 'scenarios' && <StoryModule />}
        {tool === 'elements' && <ElementForge />}
        {tool === 'maps' && <MapMaker />}
        {tool === 'aime' && <AIME />}
      </div>
    </div>
  );
};

export default FoundryWorkspaceDrawer;
