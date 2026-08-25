import React, { useState } from 'react';
import { categoryConfig, DEVELOPMENT_FIELDS_GROUPS, DEVELOPMENT_FIELDS_REGISTRY } from './categoryConfig';
import { useDBM } from '../../context/DBMContext';
import { useAuth } from '../../context/AuthContext';
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
  Compass,
  Wrench,
  ChevronRight,
  FolderKanban
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
  navigateToCategory,
  isAdmin: propIsAdmin
}) => {
  const auth = useAuth() || {};
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : Boolean(auth.isAdmin);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDevGroups, setExpandedDevGroups] = useState({
    system: true,
    species_anatomy: true,
    metaphysics_combat: true,
    equipment_crafting: true,
    societies_spheres: true
  });
  const [isDevSectionExpanded, setIsDevSectionExpanded] = useState(true);

  const { dbData } = useDBM() || {};

  const toggleGroup = (groupId) => {
    setExpandedDevGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getCategoryCount = (catKey, config) => {
    if (!dbData) return 0;
    if (config?.isParent && config?.subItems) {
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

  // Filtered Developer Fields (only when in Dev Mode)
  const filteredDevFields = DEVELOPMENT_FIELDS_REGISTRY.filter(field => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      field.label.toLowerCase().includes(term) ||
      field.key.toLowerCase().includes(term) ||
      (field.desc && field.desc.toLowerCase().includes(term))
    );
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
          placeholder={isAdmin ? "Filter sections & dev fields..." : "Filter categories..."}
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

        {/* DEVELOPER REFERENCE FIELDS (Dev Mode Only - Strictly invisible to view mode) */}
        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-amber-900/40 flex flex-col gap-1.5">
            {/* Developer Section Master Header */}
            <button
              type="button"
              onClick={() => setIsDevSectionExpanded(!isDevSectionExpanded)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/40 transition-colors text-left group"
            >
              <span className="text-[11px] font-mono font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench size={13} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                DEVELOPER FIELDS
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {filteredDevFields.length}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-amber-400 transition-transform duration-200 ${isDevSectionExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Developer Groups Accordion List */}
            {isDevSectionExpanded && (
              <div className="flex flex-col gap-1 pl-1">
                {DEVELOPMENT_FIELDS_GROUPS.map(group => {
                  const groupFields = filteredDevFields.filter(f => f.group === group.id);
                  if (groupFields.length === 0) return null;
                  const isGroupExpanded = Boolean(expandedDevGroups[group.id]) || Boolean(searchTerm.trim());
                  const groupTotalCount = groupFields.reduce((sum, f) => sum + (dbData?.[f.key]?.length || 0), 0);

                  return (
                    <div key={group.id} className="flex flex-col gap-0.5 my-0.5">
                      {/* Group Header Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          <span>{group.icon}</span>
                          <span className="truncate">{group.label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {groupTotalCount > 0 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {groupTotalCount}
                            </span>
                          )}
                          <ChevronRight
                            size={11}
                            className={`transition-transform duration-200 ${isGroupExpanded ? 'rotate-90 text-amber-400' : 'text-slate-600'}`}
                          />
                        </div>
                      </button>

                      {/* Group Items */}
                      {isGroupExpanded && (
                        <div className="pl-2 flex flex-col gap-0.5 border-l border-amber-500/30 ml-2.5 my-0.5">
                          {groupFields.map(field => {
                            const isFieldActive = currentKey === field.key || activeCategory === field.key;
                            const count = dbData?.[field.key]?.length || 0;

                            return (
                              <button
                                key={field.key}
                                type="button"
                                onClick={() => {
                                  AudioService.playTerminalBeep(1100, 0.02);
                                  navigateToCategory(field.key);
                                }}
                                className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono font-medium tracking-wide transition-all flex items-center justify-between group border ${
                                  isFieldActive
                                    ? 'bg-amber-950/60 text-amber-200 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold'
                                    : 'bg-slate-900/20 text-slate-400 border-slate-800/40 hover:text-amber-300 hover:bg-slate-800/60 hover:border-amber-500/30'
                                }`}
                                title={field.desc || field.label}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 truncate">
                                  <span className="text-xs shrink-0">{field.icon}</span>
                                  <span className="truncate">{field.label}</span>
                                </div>
                                {count > 0 && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                                    isFieldActive
                                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                                      : 'bg-slate-800/80 text-slate-400 group-hover:text-amber-300'
                                  }`}>
                                    {count}
                                  </span>
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
            )}
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`}></span>
          {isAdmin ? 'OMNICORTEX DEV MODE' : 'OMNICORTEX CORE'}
        </span>
        <span className="text-slate-600">{isAdmin ? 'ARCHITECT v2.0' : 'v2.0'}</span>
      </div>
    </aside>
  );
};

export default DBMSidebar;

