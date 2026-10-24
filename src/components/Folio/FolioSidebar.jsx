import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  Camera,
  ChevronDown, 
  ChevronRight,
  Lock,
  Pin,
  Save,
  X
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';

/**
 * Navigation items configuration for Persona Folio
 */
const NAVIGATION_ITEMS = [
  { id: 'identity', label: 'Identity', sublabel: 'Dossier & Bio', railLabel: 'IDENTITY', icon: User },
  { id: 'core-stats', label: 'Core Stats', sublabel: 'Attributes & Vitals', railLabel: 'STATS', icon: Activity },
  { id: 'skills', label: 'Skills', sublabel: 'Trained Proficiencies', railLabel: 'SKILLS', icon: Award },
  { 
    id: 'features', 
    label: 'Aspects', 
    sublabel: 'Traits & Metaphysics',
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
  { id: 'combat', label: 'Combat', sublabel: 'Vitals, Actions & Defense', railLabel: 'COMBAT', icon: Crosshair },
  { id: 'companions', label: 'Companions & Cohorts', sublabel: 'Droids, Pets & Retinue', railLabel: 'COHORTS', icon: Bot },
  { 
    id: 'property', 
    label: 'Property', 
    sublabel: 'Weapons, Armor & Gear',
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
  { id: 'narrative', label: 'Narrative', sublabel: 'Background & Logs', railLabel: 'NARRATIVE', icon: BookOpen },
  { id: 'media', label: 'Visuals', sublabel: 'Portraits, Tokens & Imagery', railLabel: 'VISUALS', icon: Camera },
  { id: 'other', label: 'Notes', sublabel: 'Dossier Scratchpad', railLabel: 'NOTES', icon: FileText }
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
  onClose,
  isMobileOpen = false
}) => {
  const { isLocked, isPlayerOverride } = useFolio() || {};
  
  // Hover & Pin States for Collapsible Rail Drawer Architecture
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('tangent_folio_nav_pinned') === 'true';
    } catch {
      return false;
    }
  });

  // Expansion state for parents with children (Aspects & Property)
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    property: true
  });

  const togglePin = (e) => {
    e?.stopPropagation?.();
    const next = !isPinned;
    AudioService.playTerminalBeep(next ? 1250 : 950, 0.02);
    setIsPinned(next);
    try {
      localStorage.setItem('tangent_folio_nav_pinned', String(next));
    } catch {}
  };

  // Purely autocollapse when not hovered/pinned; lock open when isPinned; open on hover or mobile drawer
  const isExpanded = isPinned || isHovered || isMobileOpen;

  const toggleExpand = (id, e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1000, 0.02);
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

    // Autocollapse if unpinned
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }

    if (onClose && typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSelectChild = (child, parentId) => {
    AudioService.playTerminalBeep(1300, 0.02);
    if (viewMode === 'play' && setViewMode) {
      setViewMode('builder');
    }
    setActiveTab(child.id);

    // Autocollapse if unpinned
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }

    if (onClose && typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* In-Flow Sizing Anchor (prevents center workspace layout shifts while hovering, reserves space when pinned or collapsed) */}
      <div
        className={`shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
          isPinned ? 'w-56 sm:w-60' : 'w-14 sm:w-16'
        }`}
        aria-hidden="true"
      />

      <nav
        aria-label="Folio Navigation Rail"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredItem(null);
        }}
        className={`absolute top-0 bottom-0 left-0 h-full bg-[#070a12]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-start py-2 px-1 select-none font-sans transition-all duration-200 ease-out ${
          isExpanded 
            ? 'w-56 sm:w-60 shadow-[12px_0_35px_rgba(0,0,0,0.85)] border-slate-700/80 z-40' 
            : 'w-14 sm:w-16 shadow-lg z-30'
        }`}
      >
        {/* Navigation Items and Character Brand Header */}
        <div className="flex flex-col items-stretch gap-0.5 sm:gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
          {/* Expanded Drawer Mini Header with Pin Option */}
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1 mb-1 border-b border-cyan-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100 h-7' : 'opacity-0 h-0 p-0 mb-0 border-b-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest truncate">
                FOLIO
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                DOSSIER
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                NAV
              </span>
              <button
                type="button"
                onClick={togglePin}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                }`}
                title={isPinned ? "Unpin Rail (Auto-collapse on exit)" : "Pin Rail (Lock open)"}
                aria-label={isPinned ? "Unpin Rail" : "Pin Rail"}
              >
                <Pin size={11} className={`transition-transform duration-200 ${isPinned ? 'rotate-45 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`} />
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(900, 0.02);
                    onClose();
                  }}
                  className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Guide Rail"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Top Brand Persona Banner Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              if (onSave) onSave();
              setActiveTab('catalog');
              if (!isPinned) {
                setIsHovered(false);
                setHoveredItem(null);
              }
              if (onClose) onClose();
            }}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-[1.02] ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            }`}
            title={isExpanded ? undefined : `Active Persona: ${charName || 'Unnamed Persona'} • Click for Catalog`}
          >
            <div className="relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/40 bg-cyan-950/60">
              <User size={16} className="text-cyan-400 group-hover:text-cyan-300" />
              {isLocked && !isPlayerOverride && (
                <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  <Lock size={8} />
                </span>
              )}
            </div>

            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight text-cyan-300">
                  {charName || 'PERSONA'}
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold shrink-0">
                  CATALOG
                </span>
              </div>
              <span className="text-[9px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                Dossier Profile
              </span>
            </div>
          </button>

          <div className="w-full h-px bg-slate-800/60 my-0.5 shrink-0" />

          {/* Navigation Items with Labels to Right of Icon */}
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isParentActive = activeTab === item.id || (hasChildren && item.children.some(c => activeTab === c.id));
            const isSectionExpanded = Boolean(expandedSections[item.id]);

            return (
              <div key={item.id} className="flex flex-col w-full shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectNav(item)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItem({ item, rect });
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                    isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                  } ${
                    isParentActive
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                  }`}
                  title={isExpanded ? undefined : `${item.label} • ${item.sublabel || item.railLabel}`}
                >
                  {/* Active Indicator Bar */}
                  {isParentActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}

                  {/* Icon Container */}
                  <div className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isParentActive
                      ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                      : 'border-transparent text-slate-400 group-hover:text-cyan-400'
                  }`}>
                    <Icon
                      size={16}
                      className={isParentActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400 transition-colors'}
                    />

                    {item.id === 'identity' && (isLocked && !isPlayerOverride) && (
                      <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                        <Lock size={8} />
                      </span>
                    )}

                    {hasChildren && isParentActive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
                    )}
                  </div>

                  {/* Label to Right of Icon (Hidden when collapsed, revealed on hover or when pinned) */}
                  <div
                    className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                      isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                          isParentActive ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                      {hasChildren && (
                        <div
                          onClick={(e) => toggleExpand(item.id, e)}
                          className="p-1 text-slate-400 hover:text-cyan-300 transition-colors rounded hover:bg-slate-800/80"
                          title={isSectionExpanded ? "Collapse sub-sections" : "Expand sub-sections"}
                        >
                          {isSectionExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                      {item.sublabel || item.railLabel}
                    </span>
                  </div>
                </button>

                {/* Sub-sections Accordion (Only displayed when expanded and section is open) */}
                {hasChildren && isExpanded && isSectionExpanded && (
                  <div className="ml-3 pl-2 border-l border-cyan-500/20 flex flex-col gap-0.5 my-0.5">
                    {item.children.map((child) => {
                      const isChildActive = activeTab === child.id;
                      const ChildIcon = child.icon;

                      const isMetaphysics = child.id === 'features-metaphysics';
                      const isAugmentations = child.id === 'features-augmentations';
                      const isHindrances = child.id === 'features-hindrances';

                      const activeChildClass = isMetaphysics
                        ? 'bg-purple-950/70 text-purple-200 border-purple-500/50 shadow-sm'
                        : isAugmentations
                        ? 'bg-pink-950/70 text-pink-200 border-pink-500/50 shadow-sm'
                        : isHindrances
                        ? 'bg-rose-950/70 text-rose-200 border-rose-500/50 shadow-sm'
                        : 'bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-sm';

                      const childIconColor = isChildActive
                        ? (isMetaphysics ? 'text-purple-300' : isAugmentations ? 'text-pink-300' : isHindrances ? 'text-rose-300' : 'text-cyan-300')
                        : 'text-slate-500 group-hover:text-slate-300';

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleSelectChild(child, item.id)}
                          className={`group w-full h-7 sm:h-7.5 px-2 rounded-lg text-[10.5px] font-mono tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer border ${
                            isChildActive
                              ? `${activeChildClass} font-bold`
                              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChildIcon size={12} className={childIconColor} />
                            <span className="truncate uppercase text-[10px] font-semibold">{child.label}</span>
                          </div>
                          {isChildActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Launch Save to Cloud Action */}
        {onSave && (
          <div className="pt-1.5 mt-auto border-t border-slate-800/80 shrink-0 w-full">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onSave();
              }}
              disabled={saveStatus === 'saving'}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  item: {
                    label: saveStatus === 'saved' ? 'Cloud Synced' : saveStatus === 'saving' ? 'Saving to Cloud...' : 'Save to Cloud',
                    sublabel: 'Persist dossier to Roster & Cloud Vault'
                  },
                  rect
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                isExpanded ? 'px-2 justify-between' : 'px-1 justify-center'
              } ${
                saveStatus === 'saving'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                  : saveStatus === 'saved'
                  ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 hover:bg-cyan-950/70 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
              }`}
              title={isExpanded ? undefined : `Save to Cloud (${saveStatus === 'saved' ? 'Synced' : saveStatus})`}
              aria-label="Save to Cloud"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  saveStatus === 'saved'
                    ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                    : 'border-cyan-500/40 bg-cyan-950/60 text-cyan-400'
                }`}>
                  <Save size={15} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
                </div>
                {isExpanded && (
                  <div className="flex flex-col text-left min-w-0 truncate">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200 group-hover:text-white truncate">
                      Save to Cloud
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Terran Net Synced' : 'Sync to Roster'}
                    </span>
                  </div>
                )}
              </div>
              {isExpanded && saveStatus === 'saved' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] mr-1 shrink-0" />
              )}
            </button>
          </div>
        )}


        {/* Topmost Portal Tooltip */}
        {hoveredItem && !isExpanded && typeof document !== 'undefined' && createPortal(
          <div
            role="tooltip"
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-cyan-500/40 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block select-none"
            style={{
              left: `${hoveredItem.rect.right + 10}px`,
              top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
              transform: 'translateY(-50%)',
              zIndex: 999999
            }}
          >
            <div className="text-cyan-300 font-bold">{hoveredItem.item.label}</div>
            <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">
              {hoveredItem.item.sublabel || hoveredItem.item.railLabel}
            </div>
            {hoveredItem.item.children && (
              <div className="text-[8.5px] text-cyan-400/80 font-normal mt-0.5">
                {hoveredItem.item.children.length} Sub-sections
              </div>
            )}
          </div>,
          document.body
        )}
      </nav>
    </>
  );
};

export default React.memo(FolioSidebar);
