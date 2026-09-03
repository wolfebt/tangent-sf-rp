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
  Dices
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useDice } from '../../context/DiceContext';

const NAVIGATION_ITEMS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'core-stats', label: 'Core Stats', icon: Activity },
  { id: 'skills', label: 'Skills', icon: Award },
  { 
    id: 'features', 
    label: 'Features', 
    icon: Sparkles,
    children: [
      { id: 'features-standard', label: 'Standard Features', icon: Sparkles, section: 'features' },
      { id: 'features-metaphysics', label: 'Metaphysics / Awakened', icon: Zap, section: 'metaphysics' },
      { id: 'features-augmentations', label: 'Augmentations', icon: Cpu, section: 'augmentations' },
      { id: 'features-hindrances', label: 'Hindrances', icon: AlertTriangle, section: 'hindrances' }
    ]
  },
  { id: 'combat', label: 'Combat', icon: Crosshair },
  { 
    id: 'property', 
    label: 'Property', 
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
  { id: 'narrative', label: 'Narrative', icon: BookOpen },
  { id: 'other', label: 'Notes', icon: FileText }
];

export const FolioSidebar = ({ 
  activeTab, 
  setActiveTab, 
  charName, 
  onOpenRoster,
  onOpenAugmentationsCatalog,
  onOpenMetaphysicsModal 
}) => {
  const { openDiceRoller, isDiceOpen, closeDiceRoller } = useDice();
  // Expansion state for parents with children
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

    // Auto-expand section if collapsed when landing on hub
    if (item.children && !expandedSections[item.id]) {
      setExpandedSections(prev => ({ ...prev, [item.id]: true }));
    }

    setActiveTab(item.id);
  };

  const handleSelectChild = (child, parentId) => {
    AudioService.playTerminalBeep(1300, 0.02);
    setActiveTab(child.id);
  };

  return (
    <aside className="w-64 sm:w-72 bg-[#0a0d14]/90 backdrop-blur-xl border-r border-[#0D5C63]/50 p-3 flex flex-col h-full shrink-0 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Operative Dossier Header Banner */}
      <div className="px-2 py-1.5 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          FOLIO DOSSIER
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
          OPERATIVE v2.0
        </span>
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
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-between group border cursor-pointer ${
                  isParentActive
                    ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
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
                  <span className="truncate uppercase text-[11px] font-semibold">{item.label}</span>
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

                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelectChild(child, item.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono font-bold tracking-wider transition-all duration-150 flex items-center justify-between group cursor-pointer border ${
                          isChildActive
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-sm'
                            : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ChildIcon size={12} className={isChildActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
                          <span className="truncate uppercase text-[10px]">{child.label}</span>
                        </div>

                        {isChildActive && (
                          <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
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
