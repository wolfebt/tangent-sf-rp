import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CODEX_MATRICES, 
  HARDWARE_MATRIX_IDS, 
  CHARACTER_MATRIX_IDS, 
  PLANETARY_SPECIES_MATRIX_IDS, 
  META_MATRIX_IDS, 
  SYSTEM_MATRIX_IDS 
} from './codexConfig';
import { useDBM } from '../../context/DBMContext';
import { 
  Search, 
  BookOpen, 
  Package, 
  Users, 
  Globe, 
  Sparkles, 
  Layers, 
  ChevronDown 
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

// Group configuration definitions and theme color mappings
const GROUP_DEFINITIONS = [
  {
    key: 'hardware',
    title: 'HARDWARE & STRUCTURES',
    icon: Package,
    ids: HARDWARE_MATRIX_IDS,
    theme: {
      color: '#f59e0b',
      borderClass: 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)] ring-amber-500/20',
      bgGradient: 'from-amber-950/20 via-slate-900/40 to-slate-950/70',
      headerText: 'text-amber-300',
      headerIcon: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBtnClass: 'bg-amber-950/60 text-amber-200 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30',
      activeIconBoxClass: 'bg-amber-500/20 text-amber-300',
      activeCountClass: 'bg-amber-400/20 text-amber-300 border border-amber-500/30',
      hoverIconBoxClass: 'group-hover:text-amber-300',
      hoverCountClass: 'group-hover:text-amber-300'
    }
  },
  {
    key: 'characters',
    title: 'CHARACTERS & COMPANIONS',
    icon: Users,
    ids: CHARACTER_MATRIX_IDS,
    theme: {
      color: '#3b82f6',
      borderClass: 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.08)] ring-blue-500/20',
      bgGradient: 'from-blue-950/20 via-slate-900/40 to-slate-950/70',
      headerText: 'text-blue-300',
      headerIcon: 'text-blue-400',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      activeBtnClass: 'bg-blue-950/60 text-blue-200 border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/30',
      activeIconBoxClass: 'bg-blue-500/20 text-blue-300',
      activeCountClass: 'bg-blue-400/20 text-blue-300 border border-blue-500/30',
      hoverIconBoxClass: 'group-hover:text-blue-300',
      hoverCountClass: 'group-hover:text-blue-300'
    }
  },
  {
    key: 'planetary',
    title: 'PLANETARY, SPECIES & FACTIONS',
    icon: Globe,
    ids: PLANETARY_SPECIES_MATRIX_IDS,
    theme: {
      color: '#10b981',
      borderClass: 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)] ring-emerald-500/20',
      bgGradient: 'from-emerald-950/20 via-slate-900/40 to-slate-950/70',
      headerText: 'text-emerald-300',
      headerIcon: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBtnClass: 'bg-emerald-950/60 text-emerald-200 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30',
      activeIconBoxClass: 'bg-emerald-500/20 text-emerald-300',
      activeCountClass: 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/30',
      hoverIconBoxClass: 'group-hover:text-emerald-300',
      hoverCountClass: 'group-hover:text-emerald-300'
    }
  },
  {
    key: 'metaphysics',
    title: 'METAPHYSICS',
    icon: Sparkles,
    ids: META_MATRIX_IDS,
    theme: {
      color: '#a855f7',
      borderClass: 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.08)] ring-purple-500/20',
      bgGradient: 'from-purple-950/20 via-slate-900/40 to-slate-950/70',
      headerText: 'text-purple-300',
      headerIcon: 'text-purple-400',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      activeBtnClass: 'bg-purple-950/60 text-purple-200 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/30',
      activeIconBoxClass: 'bg-purple-500/20 text-purple-300',
      activeCountClass: 'bg-purple-400/20 text-purple-300 border border-purple-500/30',
      hoverIconBoxClass: 'group-hover:text-purple-300',
      hoverCountClass: 'group-hover:text-purple-300'
    }
  },
  {
    key: 'systems',
    title: 'SYSTEM SUITES',
    icon: Layers,
    ids: SYSTEM_MATRIX_IDS,
    theme: {
      color: '#94a3b8',
      borderClass: 'border-slate-500/40 shadow-[0_0_15px_rgba(148,163,184,0.08)] ring-slate-500/20',
      bgGradient: 'from-slate-800/20 via-slate-900/40 to-slate-950/70',
      headerText: 'text-slate-200',
      headerIcon: 'text-slate-300',
      badgeClass: 'bg-slate-700/50 text-slate-200 border-slate-500/40',
      activeBtnClass: 'bg-slate-800/70 text-slate-100 border-slate-400/70 shadow-[0_0_15px_rgba(148,163,184,0.2)] ring-1 ring-slate-400/30',
      activeIconBoxClass: 'bg-slate-700/60 text-slate-200',
      activeCountClass: 'bg-slate-700/60 text-slate-200 border border-slate-500/40',
      hoverIconBoxClass: 'group-hover:text-slate-200',
      hoverCountClass: 'group-hover:text-slate-200'
    }
  }
];

export const CodexSidebar = ({ activeMatrixId, onSelectMatrix, onCloseMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { dbData } = useDBM() || {};

  // Accordion open/close state for all 5 groups (all expanded by default)
  const [openSections, setOpenSections] = useState({
    hardware: true,
    characters: true,
    planetary: true,
    metaphysics: true,
    systems: true
  });

  // Ensure active matrix's parent section is opened whenever activeMatrixId changes
  useEffect(() => {
    if (!activeMatrixId) return;
    const parentGroup = GROUP_DEFINITIONS.find(g => g.ids.includes(activeMatrixId));
    if (parentGroup && !openSections[parentGroup.key]) {
      setOpenSections(prev => ({ ...prev, [parentGroup.key]: true }));
    }
  }, [activeMatrixId]);

  const toggleSection = (key) => {
    AudioService.playTerminalBeep(900, 0.02);
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter matrices by user search query
  const filteredMatrices = CODEX_MATRICES.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.label.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term)
    );
  });

  const renderMatrixButton = (matrix, groupTheme) => {
    const isActive = matrix.id === activeMatrixId;
    const Icon = matrix.icon;
    
    // Compute item count from Omnicortex database collections
    const primaryCollection = dbData?.[matrix.targetCollection] || [];
    const count = primaryCollection.length;

    return (
      <button
        key={matrix.id}
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.02);
          onSelectMatrix(matrix.id);
        }}
        className={`w-full text-left px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-between group border cursor-pointer ${
          isActive
            ? groupTheme.activeBtnClass
            : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
        }`}
        title={matrix.description}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isActive 
                ? groupTheme.activeIconBoxClass 
                : `bg-slate-800/60 text-slate-400 ${groupTheme.hoverIconBoxClass}`
            }`}
            style={{ color: isActive ? matrix.color : undefined }}
          >
            <Icon size={14} />
          </div>
          <span className="truncate uppercase text-[11px] font-semibold">{matrix.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {count > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold transition-colors ${
              isActive 
                ? groupTheme.activeCountClass 
                : `bg-slate-800/80 text-slate-400 ${groupTheme.hoverCountClass}`
            }`}>
              {count}
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderAccordionBlock = (group) => {
    const matricesInGroup = filteredMatrices
      .filter(m => group.ids.includes(m.id))
      .sort((a, b) => group.ids.indexOf(a.id) - group.ids.indexOf(b.id));

    if (matricesInGroup.length === 0) return null;

    const isSearchActive = !!searchTerm.trim();
    const isOpen = isSearchActive || !!openSections[group.key];
    const Icon = group.icon;

    return (
      <div 
        key={group.key}
        className={`rounded-2xl border ${group.theme.borderClass} bg-gradient-to-b ${group.theme.bgGradient} p-1.5 flex flex-col gap-1.5 ring-1 relative transition-all duration-200`}
      >
        {/* Accordion Header Button */}
        <button
          type="button"
          onClick={() => toggleSection(group.key)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon size={14} className={`${group.theme.headerIcon} shrink-0`} />
            <span className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-wider ${group.theme.headerText} uppercase truncate`}>
              {group.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${group.theme.badgeClass}`}>
              {matricesInGroup.length}
            </span>
            <ChevronDown 
              size={14} 
              className={`${group.theme.headerText} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Collapsible Accordion Content */}
        {isOpen && (
          <div className="flex flex-col gap-1 pt-0.5 pb-0.5 px-0.5">
            {matricesInGroup.map(m => renderMatrixButton(m, group.theme))}
          </div>
        )}
      </div>
    );
  };

  // Fallback for unclassified matrices
  const allGroupedIds = GROUP_DEFINITIONS.flatMap(g => g.ids);
  const unclassifiedMatrices = filteredMatrices.filter(m => !allGroupedIds.includes(m.id));

  return (
    <aside className="w-64 sm:w-72 h-full bg-[#0a0d14]/90 backdrop-blur-xl border-r border-[#0D5C63]/50 flex flex-col shrink-0 p-3 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Header Banner Subtitle */}
      <div className="px-1 py-1 shrink-0 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={12} className="text-amber-400" />
            CODEX MATRICES
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
              {CODEX_MATRICES.length}
            </span>
            {onCloseMenu && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  onCloseMenu();
                }}
                className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-300 transition-colors"
                title="Collapse Menu Drawer (◀)"
              >
                <ChevronRight size={13} className="rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative shrink-0 my-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter matrices..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors shadow-inner"
        />
        <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
      </div>

      {/* Matrix Accordion List */}
      <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto pr-1">
        {/* Render 5 Accordion Blocks */}
        {GROUP_DEFINITIONS.map(renderAccordionBlock)}

        {/* Fallback for unclassified matrices */}
        {unclassifiedMatrices.length > 0 && (
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-2 flex flex-col gap-1">
            <div className="px-2 pt-0.5 pb-1 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              OTHER MATRICES
            </div>
            {unclassifiedMatrices.map(m => renderMatrixButton(m, GROUP_DEFINITIONS[4].theme))}
          </div>
        )}

        {/* Empty State when Search yields no results */}
        {filteredMatrices.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            No matrices match "{searchTerm}"
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          OMNICORTEX SYNC
        </span>
        <span className="text-slate-600">v2.0</span>
      </div>
    </aside>
  );
};

export default CodexSidebar;
