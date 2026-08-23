import React, { useState } from 'react';
import { categoryConfig } from './categoryConfig';
import { useDBM } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';
import { 
  BookOpen, 
  Dna, 
  Users, 
  Globe, 
  Crosshair, 
  Sparkles, 
  Shield, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  Package, 
  Layers, 
  Bot, 
  Building2, 
  Search, 
  ChevronDown, 
  Landmark, 
  HelpCircle,
  Compass 
} from 'lucide-react';

const CATEGORY_ICONS = {
  compendium: BookOpen,
  species: Dna,
  factions: Users,
  origins: Globe,
  occupations: Crosshair,
  archetypes: Compass,
  skills: Sparkles,
  features: Shield,
  disadvantages: AlertTriangle,
  invocations: Sparkles,
  special_abilities: Zap,
  augmentations: Cpu,
  personal_property: Package,
  gear: Package,
  weaponry: Crosshair,
  armoring: Shield,
  mecha: Bot,
  architecture: Building2,
  other: Layers,
  societies: Landmark,
  user_guide: HelpCircle
};

export const DBMSidebar = ({
  mainCategories,
  activeCategory,
  currentKey,
  navigateToCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { dbData } = useDBM() || {};

  const getCategoryCount = (catKey, config) => {
    if (!dbData) return 0;
    if (config.isParent && config.subItems) {
      return config.subItems.reduce((acc, subKey) => {
        const list = dbData[subKey] || [];
        return acc + (Array.isArray(list) ? list.length : 0);
      }, 0);
    }
    const list = dbData[catKey] || [];
    return Array.isArray(list) ? list.length : 0;
  };

  const filteredCategories = mainCategories.filter(catKey => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const config = categoryConfig[catKey];
    if (config?.label?.toLowerCase().includes(term)) return true;
    if (config?.subItems?.some(s => s.toLowerCase().includes(term))) return true;
    if (config?.subcategories && Object.keys(config.subcategories).some(s => s.toLowerCase().includes(term))) return true;
    return false;
  });

  return (
    <aside className="w-64 sm:w-72 h-full bg-[#0a0d14]/90 backdrop-blur-xl border border-[#0D5C63]/50 rounded-xl flex flex-col shrink-0 p-3 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Categories Header Banner */}
      <div className="px-1 py-1 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" />
            OMNICORTEX SECTIONS
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            {mainCategories.length} Categories
          </span>
        </div>
      </div>

      {/* Quick Search Filter */}
      <div className="relative shrink-0 my-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter categories..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors shadow-inner"
        />
        <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
      </div>

      {/* Category List Menu */}
      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto pr-1 pb-2">
        {filteredCategories.map(catKey => {
          const config = categoryConfig[catKey];
          if (!config) return null;
          const isActive = activeCategory === catKey || categoryConfig[activeCategory]?.parent === catKey;
          const Icon = CATEGORY_ICONS[catKey] || Layers;
          const count = getCategoryCount(catKey, config);

          return (
            <div key={catKey} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  navigateToCategory(catKey);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-between group border ${
                  isActive
                    ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
                }`}
                title={config.label}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-cyan-300'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="truncate uppercase text-[11px] font-semibold">{config.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold transition-colors ${
                      isActive 
                        ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-300'
                    }`}>
                      {count}
                    </span>
                  )}
                  {(config.isParent || config.subcategories) && (
                    <ChevronDown 
                      size={13} 
                      className={`transition-transform duration-200 ${isActive ? 'text-cyan-400 rotate-180' : 'text-slate-500'}`} 
                    />
                  )}
                </div>
              </button>

              {/* Parent subItems rendering (e.g. Personal Property -> Gear, Weaponry, Armoring...) */}
              {config.isParent && isActive && config.subItems && (
                <div className="pl-3 my-1 flex flex-col gap-1 border-l-2 border-cyan-500/40 ml-3.5">
                  {config.subItems.map(subKey => {
                    const subConfig = categoryConfig[subKey];
                    if (!subConfig) return null;
                    const isSubActive = currentKey === subKey || activeCategory === subKey;
                    const SubIcon = CATEGORY_ICONS[subKey] || Layers;
                    const subCount = dbData?.[subKey]?.length || 0;

                    return (
                      <button
                        key={subKey}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          navigateToCategory(subKey);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between group border ${
                          isSubActive
                            ? 'bg-cyan-900/50 text-cyan-200 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isSubActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/50 text-slate-400 group-hover:text-cyan-300'}`}>
                            <SubIcon size={12} />
                          </div>
                          <span className="truncate font-semibold">{subConfig.label}</span>
                        </div>
                        {subCount > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${isSubActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800/80 text-slate-400'}`}>
                            {subCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Direct inline subcategories rendering */}
              {!config.isParent && config.subcategories && isActive && (
                <div className="pl-3 my-1 flex flex-col gap-1 border-l-2 border-cyan-500/40 ml-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      navigateToCategory(catKey, null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between group border ${
                      currentKey === catKey
                        ? 'bg-cyan-900/50 text-cyan-200 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                        : 'bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <span>Overview</span>
                  </button>
                  {Object.keys(config.subcategories).map(subKey => {
                    const subConfig = config.subcategories[subKey];
                    if (!subConfig) return null;
                    const isSubActive = currentKey === subKey;
                    return (
                      <button
                        key={subKey}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          navigateToCategory(catKey, subKey);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between group border ${
                          isSubActive
                            ? 'bg-cyan-900/50 text-cyan-200 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{subConfig.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          OMNICORTEX CORE
        </span>
        <span className="text-slate-600">v2.0</span>
      </div>
    </aside>
  );
};

export default DBMSidebar;

