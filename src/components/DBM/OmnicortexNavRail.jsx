import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Dna, 
  Users, 
  Globe, 
  Crosshair, 
  Compass, 
  Sparkles, 
  Shield, 
  AlertTriangle, 
  Bot, 
  Landmark, 
  Flame, 
  Zap, 
  Package, 
  Search, 
  X, 
  Boxes, 
  Wrench, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { 
  DEVELOPMENT_FIELDS_GROUPS, 
  DEVELOPMENT_FIELDS_REGISTRY,
  isDevelopmentField,
  getDevelopmentField
} from './categoryConfig';

/**
 * @file OmnicortexNavRail.jsx
 * @description Standardized secondary vertical navigation rail representing the Omnicortex Section Menu.
 * Replaces the former bulky text sidebar drawer with a modern, high-density GuidanceRail-compliant
 * navigation rail (w-18 sm:w-20, domain colors, live badges, portal tooltips, active glowing bars).
 */

const SECTION_THEMES = {
  purple: {
    iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400 group-hover:text-purple-300',
    activeBox: 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    activeBtn: 'bg-purple-950/70 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    activeLabel: 'text-purple-300 font-extrabold [text-shadow:0_0_8px_rgba(168,85,247,0.7)]',
    bar: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badge: 'bg-purple-500 text-white'
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:text-emerald-300',
    activeBox: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    activeBtn: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    activeLabel: 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badge: 'bg-emerald-500 text-black'
  },
  cyan: {
    iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:text-cyan-300',
    activeBox: 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]',
    activeBtn: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    activeLabel: 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.7)]',
    bar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    badge: 'bg-cyan-500 text-black'
  },
  blue: {
    iconBox: 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-400 group-hover:text-blue-300',
    activeBox: 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    activeBtn: 'bg-blue-950/70 border-blue-400/80 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    activeLabel: 'text-blue-300 font-extrabold [text-shadow:0_0_8px_rgba(59,130,246,0.7)]',
    bar: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    badge: 'bg-blue-500 text-white'
  },
  amber: {
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:text-amber-300',
    activeBox: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    activeBtn: 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    activeLabel: 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]',
    bar: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badge: 'bg-amber-500 text-black'
  },
  yellow: {
    iconBox: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 group-hover:bg-yellow-500/20 group-hover:border-yellow-400 group-hover:text-yellow-300',
    activeBox: 'bg-yellow-500/25 border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    activeBtn: 'bg-yellow-950/70 border-yellow-400/80 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
    activeLabel: 'text-yellow-300 font-extrabold [text-shadow:0_0_8px_rgba(234,179,8,0.7)]',
    bar: 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]',
    badge: 'bg-yellow-500 text-black'
  },
  rose: {
    iconBox: 'bg-rose-500/10 border-rose-500/30 text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-400 group-hover:text-rose-300',
    activeBox: 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    activeBtn: 'bg-rose-950/70 border-rose-400/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    activeLabel: 'text-rose-300 font-extrabold [text-shadow:0_0_8px_rgba(244,63,94,0.7)]',
    bar: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    badge: 'bg-rose-500 text-white'
  },
  orange: {
    iconBox: 'bg-orange-500/10 border-orange-500/30 text-orange-400 group-hover:bg-orange-500/20 group-hover:border-orange-400 group-hover:text-orange-300',
    activeBox: 'bg-orange-500/25 border-orange-400 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    activeBtn: 'bg-orange-950/70 border-orange-400/80 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    activeLabel: 'text-orange-300 font-extrabold [text-shadow:0_0_8px_rgba(249,115,22,0.7)]',
    bar: 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    badge: 'bg-orange-500 text-black'
  },
  red: {
    iconBox: 'bg-red-500/10 border-red-500/30 text-red-400 group-hover:bg-red-500/20 group-hover:border-red-400 group-hover:text-red-300',
    activeBox: 'bg-red-500/25 border-red-400 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    activeBtn: 'bg-red-950/70 border-red-400/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    activeLabel: 'text-red-300 font-extrabold [text-shadow:0_0_8px_rgba(239,68,68,0.7)]',
    bar: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    badge: 'bg-red-500 text-white'
  },
  indigo: {
    iconBox: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-400 group-hover:text-indigo-300',
    activeBox: 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    activeBtn: 'bg-indigo-950/70 border-indigo-400/80 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    activeLabel: 'text-indigo-300 font-extrabold [text-shadow:0_0_8px_rgba(99,102,241,0.7)]',
    bar: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]',
    badge: 'bg-indigo-500 text-white'
  }
};

/**
 * 16 Canonical Omnicortex Sections
 */
export const OMNICORTEX_SECTIONS = [
  {
    id: 'species',
    label: 'Species & Lineages',
    shortLabel: 'SPECIES',
    icon: Dna,
    colorTheme: 'purple',
    sublabel: 'Lineages, Sizes, Movement & Traits'
  },
  {
    id: 'factions',
    label: 'Factions & Megacorps',
    shortLabel: 'FACTIONS',
    icon: Users,
    colorTheme: 'emerald',
    sublabel: 'Societies, Polities & Megacorps'
  },
  {
    id: 'origins',
    label: 'Origins & Backgrounds',
    shortLabel: 'ORIGINS',
    icon: Globe,
    colorTheme: 'cyan',
    sublabel: 'Homeworlds & Upbringing'
  },
  {
    id: 'occupations',
    label: 'Occupations & Vocations',
    shortLabel: 'CAREERS',
    icon: Crosshair,
    colorTheme: 'blue',
    sublabel: 'Professions & Skill Allocations'
  },
  {
    id: 'archetypes',
    label: 'Archetype Spheres',
    shortLabel: 'ARCHETYPES',
    icon: Compass,
    colorTheme: 'purple',
    sublabel: 'Core 80 BP Chassis & Spheres'
  },
  {
    id: 'skills',
    label: 'Skills & Disciplines',
    shortLabel: 'SKILLS',
    icon: Sparkles,
    colorTheme: 'blue',
    sublabel: 'Physical, Mental & Social Disciplines'
  },
  {
    id: 'features',
    label: 'Features & Talents',
    shortLabel: 'FEATURES',
    icon: Shield,
    colorTheme: 'emerald',
    sublabel: 'Combat, General, Meta & Exotic'
  },
  {
    id: 'disadvantages',
    label: 'Disadvantages & Quirks',
    shortLabel: 'DISADV',
    icon: AlertTriangle,
    colorTheme: 'amber',
    sublabel: 'Biological Stigmas & Complications'
  },
  {
    id: 'modular_characters',
    label: 'Modular Characters & Threats',
    shortLabel: 'THREATS',
    icon: Bot,
    colorTheme: 'red',
    sublabel: 'Bestiary Statblocks & NPCs'
  },
  {
    id: 'world_design',
    label: 'World Design & Cosmology',
    shortLabel: 'WORLD',
    icon: Landmark,
    colorTheme: 'indigo',
    isParent: true,
    subItems: ['planetary_design', 'universe', 'setting', 'philosophy', 'scene'],
    sublabel: 'Planetary Specs, Universe & Settings'
  },
  {
    id: 'invocations',
    label: 'Invocations (Spells)',
    shortLabel: 'MAGIC',
    icon: Flame,
    colorTheme: 'amber',
    sublabel: 'Disciplines, Ranges & Strain'
  },
  {
    id: 'special_abilities',
    label: 'Special Abilities',
    shortLabel: 'ABILITIES',
    icon: Zap,
    colorTheme: 'yellow',
    sublabel: 'Supernatural Powers & Exotic Actions'
  },
  {
    id: 'personal_property',
    label: 'Property & Armory',
    shortLabel: 'PROPERTY',
    icon: Package,
    colorTheme: 'orange',
    isParent: true,
    subItems: ['gear', 'weaponry', 'armoring', 'augmentations', 'mecha', 'architecture', 'other'],
    sublabel: 'Gear, Weapons, Armor, Augmentations'
  }
];

export const OmnicortexNavRail = ({
  activeSectionKey = 'species',
  onSelectSection = () => {},
  dbData = {},
  isAdmin = false,
  onOpenDevFields = null,
  onOpenUserGuide = null,
  isMobileOpen = false,
  onCloseMobile = null
}) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Developer Fields Flyout State
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [devSearchTerm, setDevSearchTerm] = useState('');
  const [expandedDevGroups, setExpandedDevGroups] = useState({
    system: true,
    species_anatomy: false,
    metaphysics_combat: false,
    equipment_crafting: false,
    societies_spheres: false
  });

  const toggleDevGroup = (groupId) => {
    AudioService.playTerminalBeep(900, 0.02);
    setExpandedDevGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const isDevFieldActive = useMemo(() => {
    return isDevelopmentField(activeSectionKey);
  }, [activeSectionKey]);

  // When a developer field is active, automatically ensure the vertical panel is open and its group is expanded
  useEffect(() => {
    if (isDevFieldActive) {
      setIsDevPanelOpen(true);
      const activeDevField = getDevelopmentField(activeSectionKey);
      if (activeDevField?.group) {
        setExpandedDevGroups(prev => ({
          ...prev,
          [activeDevField.group]: true
        }));
      }
    }
  }, [isDevFieldActive, activeSectionKey]);

  // Compute total asset count across all collections
  const totalAssetsCount = useMemo(() => {
    return Object.keys(dbData).reduce((sum, key) => {
      if (key === 'compendium') return sum;
      return sum + (Array.isArray(dbData[key]) ? dbData[key].length : 0);
    }, 0);
  }, [dbData]);

  // Compute count for each section
  const getSectionCount = (section) => {
    if (section.isParent && Array.isArray(section.subItems)) {
      return section.subItems.reduce((acc, subKey) => {
        const list = dbData[subKey];
        return acc + (Array.isArray(list) ? list.length : 0);
      }, (Array.isArray(dbData[section.id]) ? dbData[section.id].length : 0));
    }
    const list = dbData[section.id];
    return Array.isArray(list) ? list.length : 0;
  };

  const handleItemClick = (section) => {
    AudioService.playTerminalBeep(1150, 0.02);
    onSelectSection(section.id, section);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}
      <nav
        aria-label="Omnicortex Secondary Navigation Rail"
        className={`w-18 sm:w-20 shrink-0 h-full bg-[#070a12]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2 sm:py-2.5 px-1 select-none z-40 md:z-20 font-sans shadow-lg transition-transform duration-300 fixed md:relative ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      {/* Main 16 Omnicortex Sections Scroll Area */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center gap-1 overflow-y-auto no-scrollbar py-0.5">
        {OMNICORTEX_SECTIONS.map((section) => {
          const isItemActive = activeSectionKey === section.id || 
            (section.isParent && Array.isArray(section.subItems) && section.subItems.includes(activeSectionKey));
          
          const themeKey = section.colorTheme || 'cyan';
          const theme = SECTION_THEMES[themeKey] || SECTION_THEMES.cyan;
          const Icon = section.icon;
          const count = getSectionCount(section);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleItemClick(section)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: section.label,
                  sublabel: section.sublabel,
                  count,
                  subItems: section.subItems,
                  theme,
                  rect
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative w-full py-1 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border ${
                isItemActive
                  ? theme.activeBtn
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
              }`}
              title={`${section.label} (${count} records)`}
            >
              {/* Active Left Glowing Indicator Bar */}
              {isItemActive && (
                <span className={`absolute -left-1 top-2 bottom-2 w-1 rounded-r-full ${theme.bar}`} />
              )}

              {/* Icon Container with Badge */}
              <div
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  isItemActive ? theme.activeBox : theme.iconBox
                }`}
              >
                <Icon size={16} />

                {/* Record Counter Badge */}
                {count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full font-mono text-[8px] font-bold flex items-center justify-center shadow-sm ${theme.badge}`}
                  >
                    {count > 999 ? `${Math.floor(count / 1000)}k` : count}
                  </span>
                )}
              </div>

              {/* Monospace Visible Label Underneath */}
              <span
                className={`font-mono text-[8px] sm:text-[8.5px] uppercase tracking-wider text-center mt-1 truncate max-w-full px-0.5 leading-tight select-none ${
                  isItemActive ? theme.activeLabel : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {section.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Section: Codex Launcher & Architect Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-1.5 border-t border-slate-800/80 shrink-0">
        {/* Rules Codex Matrices Quick Launcher */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1200, 0.03);
            navigate('/codex');
          }}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredItem({
              label: 'RULES CODEX MATRICES',
              sublabel: 'Guided Matrix Builders',
              desc: 'Switch to the step-by-step Rules Codex builder suite (/codex)',
              rect
            });
          }}
          onMouseLeave={() => setHoveredItem(null)}
          className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white transition-all cursor-pointer shadow-sm"
          title="Open Rules Codex (/codex)"
        >
          <Boxes size={15} />
        </button>

        {/* Master Developer Access Fields Button (Admin Only) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              setIsDevPanelOpen(prev => !prev);
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                label: 'DEVELOPER FIELDS',
                sublabel: '5 Groups · 43 Schema Tables',
                desc: 'Toggle the Developer Fields drawer for Core Rules, Tech, Economy, Anatomy, Metaphysics, Crafting, and Spheres',
                rect
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
              isDevFieldActive || isDevPanelOpen
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/50 text-amber-300 hover:text-amber-100'
            }`}
            title="Developer Fields (43 Schema Tables)"
          >
            <Wrench size={15} className={isDevPanelOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
          </button>
        )}

        {/* System User Guide Button */}
        {onOpenUserGuide && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              onOpenUserGuide();
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                label: 'USER GUIDE',
                sublabel: 'Omnicortex Documentation',
                desc: 'View comprehensive documentation for Omnicortex data management',
                rect
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Omnicortex User Guide"
          >
            <HelpCircle size={15} />
          </button>
        )}
      </div>

      {/* Floating Portal Tooltip */}
      {hoveredItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed pointer-events-none z-[9999] px-2.5 py-1.5 rounded-lg bg-[#0d121c]/95 border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-xs animate-in fade-in zoom-in-95 duration-100 font-sans select-none"
            style={{
              top: Math.max(8, Math.min(window.innerHeight - 80, hoveredItem.rect.top + hoveredItem.rect.height / 2 - 25)),
              left: hoveredItem.rect.right + 10
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                {hoveredItem.label}
              </span>
              {hoveredItem.count !== undefined && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 font-bold">
                  {hoveredItem.count}
                </span>
              )}
            </div>
            {hoveredItem.sublabel && (
              <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                {hoveredItem.sublabel}
              </div>
            )}
            {hoveredItem.desc && (
              <div className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {hoveredItem.desc}
              </div>
            )}
            {hoveredItem.subItems && (
              <div className="text-[9px] text-amber-300/80 font-mono mt-1">
                Sub-items: {hoveredItem.subItems.join(', ')}
              </div>
            )}
          </div>,
          document.body
        )}
    </nav>

      {/* ── DEVELOPER FIELDS VERTICAL MENU (Strictly Dev Mode) ── */}
      {isAdmin && isDevPanelOpen && (
        <aside
          className="fixed md:relative z-30 md:z-10 top-0 bottom-0 left-18 sm:left-20 md:left-0 w-72 sm:w-80 bg-[#080d18]/98 backdrop-blur-2xl border-r border-amber-500/40 shadow-[12px_0_35px_rgba(0,0,0,0.85)] flex flex-col p-3 select-none font-sans animate-in slide-in-from-left-4 duration-200 shrink-0 h-full"
        >
          {/* Header Banner - Matching Screenshot media_1790164338449.png */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/60 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
            <div className="flex items-center gap-2">
              <Wrench size={15} className="text-amber-400" />
              <span className="font-mono text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                DEVELOPER FIELDS
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                {DEVELOPMENT_FIELDS_REGISTRY.length}
              </span>
              <button
                type="button"
                onClick={() => setIsDevPanelOpen(false)}
                className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Developer Fields Panel"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Quick Search Filter */}
          <div className="relative shrink-0 my-2">
            <input
              type="text"
              value={devSearchTerm}
              onChange={(e) => setDevSearchTerm(e.target.value)}
              placeholder="Filter developer fields..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-amber-500/30 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors shadow-inner"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-amber-500/60 pointer-events-none" />
            {devSearchTerm && (
              <button
                type="button"
                onClick={() => setDevSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* 5 Developer Groups Accordion (Exact match to media_1790164338449.png) */}
          <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto pr-1">
            {DEVELOPMENT_FIELDS_GROUPS.map(group => {
              const groupFields = DEVELOPMENT_FIELDS_REGISTRY.filter(f => {
                if (f.group !== group.id) return false;
                if (!devSearchTerm.trim()) return true;
                const term = devSearchTerm.toLowerCase();
                return f.label.toLowerCase().includes(term) || f.key.toLowerCase().includes(term) || (f.desc && f.desc.toLowerCase().includes(term));
              });

              if (groupFields.length === 0) return null;

              const isExpanded = Boolean(expandedDevGroups[group.id]) || Boolean(devSearchTerm.trim());
              const totalGroupCount = groupFields.reduce((acc, f) => {
                const list = dbData[f.key];
                return acc + (Array.isArray(list) ? list.length : 0);
              }, 0);

              const isGroupActive = groupFields.some(f => f.key === activeSectionKey);

              return (
                <div key={group.id} className="flex flex-col gap-1 rounded-xl bg-slate-950/50 border border-slate-800/80 p-1">
                  {/* Group Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleDevGroup(group.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isGroupActive
                        ? 'bg-amber-950/50 border border-amber-500/50 text-amber-300'
                        : 'text-slate-300 hover:text-amber-300 hover:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="text-sm shrink-0">{group.icon}</span>
                      <span className="truncate">{group.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                        {totalGroupCount}
                      </span>
                      <ChevronRight
                        size={12}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-amber-400' : 'text-slate-500'}`}
                      />
                    </div>
                  </button>

                  {/* Sub-Fields List */}
                  {isExpanded && (
                    <div className="pl-2 pr-1 pb-1 flex flex-col gap-0.5 border-l border-amber-500/30 ml-3 mt-0.5">
                      {groupFields.map(field => {
                        const isFieldActive = activeSectionKey === field.key;
                        const count = Array.isArray(dbData[field.key]) ? dbData[field.key].length : 0;

                        return (
                          <button
                            key={field.key}
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1100, 0.02);
                              onSelectSection(field.key);
                              if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-mono font-medium tracking-wide transition-all flex items-center justify-between group border cursor-pointer ${
                              isFieldActive
                                ? 'bg-amber-950/70 text-amber-200 border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
                                : 'bg-slate-900/30 text-slate-400 border-transparent hover:text-amber-200 hover:bg-slate-900/80 hover:border-amber-500/30'
                            }`}
                            title={field.desc || field.label}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="text-xs shrink-0">{field.icon}</span>
                              <span className="truncate">{field.label}</span>
                            </div>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                              isFieldActive
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 group-hover:text-amber-300'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          {onOpenDevFields && (
            <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  onOpenDevFields();
                }}
                className="w-full py-1.5 px-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 hover:text-white rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Full Schema Manager Modal</span>
                <ExternalLink size={11} />
              </button>
            </div>
          )}
        </aside>
      )}
    </>
  );
};

export default OmnicortexNavRail;
