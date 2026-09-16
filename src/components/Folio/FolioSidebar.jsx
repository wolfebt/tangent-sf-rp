import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Award, 
  Sparkles, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  Crosshair, 
  Briefcase, 
  Sword, 
  Shield, 
  Package, 
  Bot, 
  Building2, 
  Layers, 
  BookOpen, 
  FileText,
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Dices,
  Lock,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useDice } from '../../context/DiceContext';
import { useFolio } from '../../context/FolioContext';

const NAVIGATION_ITEMS = [
  { id: 'identity', label: 'Identity', railLabel: 'IDENTITY', icon: User },
  { id: 'core-stats', label: 'Core Stats', railLabel: 'STATS', icon: Activity },
  { id: 'skills', label: 'Skills', railLabel: 'SKILLS', icon: Award },
  { 
    id: 'features', 
    label: 'Features & Traits', 
    railLabel: 'FEATURES',
    icon: Sparkles,
    children: [
      { id: 'features-standard', label: 'Standard Features', icon: Sparkles, section: 'features' },
      { id: 'features-traits', label: 'Traits', icon: Award, section: 'traits' },
      { id: 'features-metaphysics', label: 'Metaphysics / Awakened', icon: Zap, section: 'metaphysics' },
      { id: 'features-augmentations', label: 'Augmentations', icon: Cpu, section: 'augmentations' },
      { id: 'features-hindrances', label: 'Hindrances', icon: AlertTriangle, section: 'hindrances' }
    ]
  },
  { id: 'combat', label: 'Combat', railLabel: 'COMBAT', icon: Crosshair },
  { id: 'companions', label: 'Companions & Cohorts', railLabel: 'COHORTS', icon: Bot },
  { 
    id: 'property', 
    label: 'Property', 
    railLabel: 'PROPERTY',
    icon: Briefcase,
    children: [
      { id: 'property-weaponry', label: 'Weaponry', icon: Sword, section: 'weaponry' },
      { id: 'property-armoring', label: 'Armoring', icon: Shield, section: 'armoring' },
      { id: 'property-gear', label: 'Gear', icon: Package, section: 'gear' },
      { id: 'property-mech', label: 'Mech', icon: Bot, section: 'mech' },
      { id: 'property-architecture', label: 'Architecture', icon: Building2, section: 'architecture' },
      { id: 'property-other', label: 'Other', icon: Layers, section: 'other' }
    ]
  },
  { id: 'narrative', label: 'Narrative', railLabel: 'NARRATIVE', icon: BookOpen },
  { id: 'other', label: 'Notes', railLabel: 'NOTES', icon: FileText }
];

export const FolioSidebar = ({ 
  activeTab, 
  setActiveTab, 
  charName, 
  onOpenRoster,
  onOpenAugmentationsCatalog,
  onOpenMetaphysicsModal,
  onSave,
  saveStatus,
  viewMode = 'builder',
  setViewMode
}) => {
  const { openDiceRoller, isDiceOpen, closeDiceRoller } = useDice();
  const { isLocked, isPlayerOverride } = useFolio() || {};
  
  // Support toggle between compact Guidance Rail and Expanded Sidebar
  const [isRailMode, setIsRailMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280;
    }
    return false;
  });

  // Expansion state for parents with children in expanded mode
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    property: true
  });

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectNav = (item) => {
    AudioService.playTerminalBeep(1100, 0.02);

    // If switching to builder tabs while in tactical play mode, return to builder view
    if (viewMode === 'play' && item.id !== 'catalog' && setViewMode) {
      setViewMode('builder');
    }

    // Auto-expand section if collapsed when landing on hub
    if (item.children && !expandedSections[item.id]) {
      setExpandedSections(prev => ({ ...prev, [item.id]: true }));
    }

    setActiveTab(item.id);
  };

  const handleSelectChild = (child, parentId) => {
    AudioService.playTerminalBeep(1300, 0.02);
    if (viewMode === 'play' && setViewMode) {
      setViewMode('builder');
    }
    setActiveTab(child.id);
  };

  // ── 1. COMPACT GUIDANCE RAIL MODE ──
  if (isRailMode) {
    return (
      <aside 
        className="w-18 sm:w-20 bg-[#070a12]/95 backdrop-blur-xl border-r border-cyan-500/30 py-2 px-1 flex flex-col items-center justify-between h-full shrink-0 select-none relative z-20 font-sans shadow-xl"
        aria-label="Folio Guidance Rail"
      >
        {/* Top Header / Expand Toggle */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setIsRailMode(false);
            }}
            className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
            title="Expand Full Folio Drawer"
          >
            <PanelLeftOpen size={15} />
          </button>

          <div className="w-8 h-px bg-slate-800/80 my-0.5" />

          {/* Navigation Items with Labels */}
          <nav className="flex flex-col items-center gap-1 w-full overflow-y-auto no-scrollbar">
            {NAVIGATION_ITEMS.map((item) => {
              const hasChildren = Array.isArray(item.children) && item.children.length > 0;
              const isParentActive = activeTab === item.id || (hasChildren && item.children.some(c => activeTab === c.id));
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative group w-full">
                  <button
                    type="button"
                    onClick={() => handleSelectNav(item)}
                    className={`relative w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                      isParentActive
                        ? 'bg-gradient-to-b from-cyan-500/25 to-blue-950/40 text-cyan-200 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                    }`}
                    title={item.label}
                  >
                    {/* Active Left Indicator */}
                    {isParentActive && (
                      <span className="absolute -left-1 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    )}

                    {/* Icon */}
                    <div className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                      <Icon
                        size={17}
                        className={isParentActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400 transition-colors'}
                      />
                      {item.id === 'identity' && (isLocked && !isPlayerOverride) && (
                        <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                          <Lock size={9} />
                        </span>
                      )}
                    </div>

                    {/* Visible Monospace Label */}
                    <span
                      className={`font-mono text-[8.5px] uppercase tracking-wider text-center mt-0.5 truncate max-w-full leading-tight ${
                        isParentActive
                          ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.railLabel || item.label}
                    </span>
                  </button>

                  {/* Submenu Flyout on Hover */}
                  <div className="absolute left-full ml-2.5 top-0 min-w-[170px] p-1.5 rounded-xl bg-[#0c1017] border border-slate-700 text-slate-100 font-mono shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 hidden md:block">
                    <div className="text-cyan-300 font-bold text-xs px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                      <span>{item.label}</span>
                      {hasChildren && <span className="text-[9px] text-cyan-400/80">SUB-SECTIONS</span>}
                    </div>

                    {hasChildren && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {item.children.map((child) => {
                          const isChildActive = activeTab === child.id;
                          const ChildIcon = child.icon;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleSelectChild(child, item.id)}
                              className={`w-full text-left px-2 py-1 rounded-lg text-[10.5px] flex items-center gap-2 cursor-pointer transition-colors ${
                                isChildActive
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              <ChildIcon size={12} />
                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Dice Tray Quick Launch */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-slate-800/80 mt-auto">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.03);
              if (isDiceOpen) {
                closeDiceRoller();
              } else {
                openDiceRoller({ label: `${charName || 'Operative'} Check`, characterName: charName || 'Operative', autoRoll: false });
              }
            }}
            className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              isDiceOpen
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-cyan-950/40 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40'
            }`}
            title={isDiceOpen ? "Close Dice Tray" : "Open Dice Tray"}
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <Dices size={16} className={isDiceOpen ? 'text-amber-400' : 'text-cyan-400'} />
            </div>
            <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
              DICE
            </span>
          </button>
        </div>
      </aside>
    );
  }

  // ── 2. EXPANDED SIDEBAR MODE ──
  return (
    <aside className="w-64 sm:w-72 bg-[#12161f]/95 backdrop-blur-xl border-r border-cyan-500/30 p-3 flex flex-col h-full shrink-0 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Operative Dossier Header Banner */}
      <div className="px-2 py-1.5 border-b border-cyan-500/30 shrink-0 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          FOLIO DOSSIER
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            v2.1
          </span>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setIsRailMode(true);
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Switch to Compact Guidance Rail"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
      </div>

      {/* Tabs & Children Navigation List */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
        {NAVIGATION_ITEMS.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const isParentActive = activeTab === item.id || (hasChildren && item.children.some(c => activeTab === c.id));
          const isExpanded = Boolean(expandedSections[item.id]);
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex flex-col gap-0.5">
              {/* Parent Nav Button */}
              <div
                onClick={() => handleSelectNav(item)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-150 flex items-center justify-between group cursor-pointer border select-none ${
                  isParentActive
                    ? 'bg-cyan-950/70 text-cyan-200 border-cyan-400/80 shadow-md font-bold'
                    : 'bg-[#161922]/50 text-slate-300 border-transparent hover:text-white hover:bg-[#161922] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isParentActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-cyan-300'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="truncate uppercase text-[11px] font-semibold">
                    {item.label}
                  </span>
                  {item.id === 'identity' && (isLocked && !isPlayerOverride) && (
                    <span 
                      className="p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.3)]"
                      title="Dossier Locked & Set for VTT"
                    >
                      <Lock size={11} className="text-cyan-400" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {activeTab === item.id && hasChildren && (
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      HUB
                    </span>
                  )}
                  {isParentActive && !hasChildren && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(item.id, e)}
                      className="p-1 text-slate-500 hover:text-cyan-300 transition-colors rounded"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Children Sub-Menu */}
              {hasChildren && isExpanded && (
                <div className="ml-5 pl-2.5 border-l border-cyan-900/40 flex flex-col gap-1 py-1 my-0.5">
                  {item.children.map((child) => {
                    const isChildActive = activeTab === child.id;
                    const ChildIcon = child.icon;

                    // Dedicated color schemas per child category
                    const isMetaphysics = child.id === 'features-metaphysics';
                    const isAugmentations = child.id === 'features-augmentations';
                    const isHindrances = child.id === 'features-hindrances';

                    const activeClass = isMetaphysics
                      ? 'bg-purple-950/70 text-purple-200 border-purple-500/50 shadow-sm'
                      : isAugmentations
                      ? 'bg-pink-950/70 text-pink-200 border-pink-500/50 shadow-sm'
                      : isHindrances
                      ? 'bg-rose-950/70 text-rose-200 border-rose-500/50 shadow-sm'
                      : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-sm';

                    const iconClass = isChildActive
                      ? (isMetaphysics ? 'text-purple-400' : isAugmentations ? 'text-pink-400' : isHindrances ? 'text-rose-400' : 'text-cyan-400')
                      : 'text-slate-500 group-hover:text-slate-300';

                    const dotClass = isMetaphysics
                      ? 'bg-purple-400 shadow-[0_0_4px_rgba(168,85,247,0.8)]'
                      : isAugmentations
                      ? 'bg-pink-400 shadow-[0_0_4px_rgba(219,39,119,0.8)]'
                      : isHindrances
                      ? 'bg-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                      : 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]';

                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelectChild(child, item.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono font-bold tracking-wider transition-all duration-150 flex items-center justify-between group cursor-pointer border ${
                          isChildActive
                            ? activeClass
                            : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ChildIcon size={12} className={iconClass} />
                          <span className="truncate uppercase text-[10px]">{child.label}</span>
                        </div>

                        {isChildActive && (
                          <span className={`w-1 h-1 rounded-full ${dotClass}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Launch Buttons: Dice Roller */}
      <div className="pt-2 border-t border-slate-800/80 shrink-0 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1400, 0.03);
            if (isDiceOpen) {
              closeDiceRoller();
            } else {
              openDiceRoller({ label: `${charName || 'Operative'} Check`, characterName: charName || 'Operative', autoRoll: false });
            }
          }}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            isDiceOpen
              ? 'bg-amber-950/60 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-cyan-950/40 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-sm'
          }`}
          title={isDiceOpen ? "Close Dice Tray" : "Open Tangent Dice Tray"}
        >
          <div className="flex items-center gap-2">
            <Dices size={14} className={isDiceOpen ? 'text-amber-400' : 'text-cyan-400'} />
            <span>Dice Tray</span>
          </div>
          <span className={`text-[10px] font-mono font-bold ${isDiceOpen ? 'text-amber-400' : 'text-cyan-400'}`}>
            {isDiceOpen ? 'ACTIVE' : '2d10'}
          </span>
        </button>
      </div>

      {/* Footer System Status */}
      <div className="pt-1.5 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          FOLIO CORE
        </span>
        <span className="text-slate-600">v2.1</span>
      </div>
    </aside>
  );
};

export default React.memo(FolioSidebar);
