import React, { useState } from 'react';
import { 
  User, 
  Users,
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
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';

const NAVIGATION_ITEMS = [
  { id: 'identity', label: 'Identity', railLabel: 'IDENTITY', icon: User },
  { id: 'core-stats', label: 'Core Stats', railLabel: 'STATS', icon: Activity },
  { id: 'skills', label: 'Skills', railLabel: 'SKILLS', icon: Award },
  { 
    id: 'features', 
    label: 'Aspects', 
    railLabel: 'ASPECTS',
    icon: Sparkles,
    children: [
      { id: 'features-standard', label: 'Standard Features', subLabel: 'STD FEAT', icon: Sparkles, section: 'features' },
      { id: 'features-traits', label: 'Traits', subLabel: 'TRAITS', icon: Award, section: 'traits' },
      { id: 'features-metaphysics', label: 'Metaphysics / Awakened', subLabel: 'META', icon: Zap, section: 'metaphysics' },
      { id: 'features-augmentations', label: 'Augmentations', subLabel: 'AUGS', icon: Cpu, section: 'augmentations' },
      { id: 'features-hindrances', label: 'Hindrances', subLabel: 'HINDR', icon: AlertTriangle, section: 'hindrances' }
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
      { id: 'property-weaponry', label: 'Weaponry', subLabel: 'WEAP', icon: Sword, section: 'weaponry' },
      { id: 'property-armoring', label: 'Armoring', subLabel: 'ARMOR', icon: Shield, section: 'armoring' },
      { id: 'property-gear', label: 'Gear', subLabel: 'GEAR', icon: Package, section: 'gear' },
      { id: 'property-mech', label: 'Mech', subLabel: 'MECH', icon: Bot, section: 'mech' },
      { id: 'property-architecture', label: 'Architecture', subLabel: 'ARCH', icon: Building2, section: 'architecture' },
      { id: 'property-other', label: 'Other', subLabel: 'OTHER', icon: Layers, section: 'other' }
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
  setViewMode,
  onClose
}) => {
  const { isLocked, isPlayerOverride } = useFolio() || {};
  
  // Support toggle between compact Guidance Rail and Expanded Sidebar
  const [isRailMode, setIsRailMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return false; // Mobile: rail is expanded by default when Folio opens
      }
      return window.innerWidth < 1280;
    }
    return false;
  });

  // Expansion state for parents with children in expanded mode
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    property: true
  });

  // Collapsible toggle state for companion secondary sub-rail in guidance rail mode
  const [isSubRailCollapsed, setIsSubRailCollapsed] = useState(false);

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
    if (item.children) {
      setIsSubRailCollapsed(false);
      if (!expandedSections[item.id]) {
        setExpandedSections(prev => ({ ...prev, [item.id]: true }));
      }
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

  // Determine active parent and whether companion sub-rail is applicable
  const activeParent = NAVIGATION_ITEMS.find(item => 
    item.id === activeTab || (item.children && item.children.some(c => activeTab === c.id))
  );
  const hasSubRail = Boolean(activeParent && Array.isArray(activeParent.children) && activeParent.children.length > 0);

  // ── 1. COMPACT GUIDANCE RAIL MODE (WITH COLLAPSIBLE COMPANION SUB-RAIL) ──
  if (isRailMode) {
    return (
      <div className="flex h-full shrink-0 relative select-none">
        {/* Primary Guidance Rail */}
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
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.02);
                if (onSave) onSave();
                setActiveTab('catalog');
                if (onClose) onClose();
              }}
              className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
              title="Return to Persona Catalog / Dossiers"
            >
              <Users size={15} />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  onClose();
                }}
                className="md:hidden w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close Guide Rail"
              >
                <X size={14} />
              </button>
            )}

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
                        {hasChildren && isParentActive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
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

                    {/* Submenu Flyout on Hover (only if sub-rail is collapsed or inactive) */}
                    {(!hasSubRail || isSubRailCollapsed || !isParentActive) && (
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
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Companion Secondary Sub-Rail for Sections with Children */}
        {hasSubRail && !isSubRailCollapsed && (
          <aside 
            className="w-16 sm:w-18 bg-[#0a0f1d]/95 backdrop-blur-xl border-r border-cyan-500/20 py-2 px-1 flex flex-col items-center justify-between h-full shrink-0 select-none relative z-15 font-sans shadow-xl animate-in fade-in duration-150"
            aria-label={`${activeParent.label} Sub-Rail`}
          >
            <div className="flex flex-col items-center gap-1.5 w-full">
              {/* Header with Title and Collapse Toggle */}
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-cyan-400 truncate" title={`${activeParent.label} Sub-Rail`}>
                  {activeParent.railLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setIsSubRailCollapsed(true);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Collapse Sub-Rail"
                >
                  <ChevronLeft size={13} />
                </button>
              </div>

              <div className="w-full h-px bg-slate-800/80 my-0.5" />

              {/* Child Sub-Rail Items */}
              <nav className="flex flex-col items-center gap-1 w-full overflow-y-auto no-scrollbar">
                {/* HUB Button to view the parent overview */}
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setActiveTab(activeParent.id);
                  }}
                  className={`w-full py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer select-none mb-1 border ${
                    activeTab === activeParent.id
                      ? 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={`${activeParent.label} Hub`}
                >
                  <Layers size={14} className={activeTab === activeParent.id ? 'text-cyan-300' : 'text-slate-500'} />
                  <span className="font-mono text-[8px] uppercase tracking-wider mt-0.5 font-bold">HUB</span>
                </button>

                {activeParent.children.map((child) => {
                  const isChildActive = activeTab === child.id;
                  const ChildIcon = child.icon;

                  const isMetaphysics = child.id === 'features-metaphysics';
                  const isAugmentations = child.id === 'features-augmentations';
                  const isHindrances = child.id === 'features-hindrances';

                  const activeBg = isMetaphysics
                    ? 'bg-purple-950/70 border-purple-500/70 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : isAugmentations
                    ? 'bg-pink-950/70 border-pink-500/70 text-pink-200 shadow-[0_0_10px_rgba(219,39,119,0.3)]'
                    : isHindrances
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'bg-gradient-to-b from-cyan-500/25 to-blue-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]';

                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleSelectChild(child, activeParent.id)}
                      className={`relative w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border ${
                        isChildActive
                          ? `${activeBg} font-bold`
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent hover:border-slate-800'
                      }`}
                      title={child.label}
                    >
                      {isChildActive && (
                        <span className="absolute -left-1 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                      )}
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                        <ChildIcon
                          size={15}
                          className={isChildActive ? 'text-cyan-300' : 'text-slate-400 hover:text-cyan-300'}
                        />
                      </div>
                      <span className={`font-mono text-[7.5px] uppercase tracking-wider text-center mt-0.5 truncate max-w-full leading-tight ${
                        isChildActive ? 'text-cyan-300 font-extrabold' : 'text-slate-400'
                      }`}>
                        {child.subLabel || child.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Collapsed Secondary Rail Re-Expand Button */}
        {hasSubRail && isSubRailCollapsed && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              setIsSubRailCollapsed(false);
            }}
            className="absolute -right-3.5 top-16 z-30 w-4 h-9 bg-slate-900 hover:bg-cyan-950 border border-cyan-500/50 hover:border-cyan-400 rounded-r flex items-center justify-center text-cyan-400 hover:text-cyan-200 transition-all shadow-lg cursor-pointer"
            title={`Expand ${activeParent.label} sub-rail`}
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    );
  }

  // ── 2. EXPANDED SIDEBAR MODE ──
  return (
    <aside className="w-64 sm:w-72 bg-[#12161f]/95 backdrop-blur-xl border-r border-cyan-500/30 p-3 flex flex-col h-full shrink-0 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Persona Name Banner - Triggers Catalog */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1150, 0.02);
          if (onSave) onSave();
          setActiveTab('catalog');
          if (onClose) onClose();
        }}
        className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/40 transition-all cursor-pointer group shrink-0 min-w-0"
        title="Active Persona — Click to Open Persona Catalog"
      >
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1">
            <Users size={11} />
            <span>Persona Dossier</span>
          </span>
          <span className="text-[9px] font-mono text-slate-500 group-hover:text-cyan-300 transition-colors flex items-center gap-0.5">
            <span>Catalog</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </span>
        </div>
        <h2
          className="m-0 text-[1.3rem] sm:text-[1.6rem] font-black leading-tight tracking-tight uppercase text-[#22d3ee] group-hover:text-cyan-200 transition-colors break-words"
          style={{
            WebkitTextStroke: '1px #c0c0c0',
            paintOrder: 'stroke fill'
          }}
        >
          {charName || 'Unnamed Persona'}
        </h2>
      </button>

      {/* Persona Dossier Header Banner */}
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
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Switch to Compact Guidance Rail"
          >
            <PanelLeftClose size={13} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                onClose();
              }}
              className="md:hidden p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Guide Rail"
            >
              <X size={13} />
            </button>
          )}
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

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
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
