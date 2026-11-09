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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { 
  DEVELOPMENT_FIELDS_GROUPS, 
  DEVELOPMENT_FIELDS_REGISTRY,
  isDevelopmentField,
  getDevelopmentField
} from './categoryConfig';

export {
  DEVELOPMENT_FIELDS_GROUPS,
  DEVELOPMENT_FIELDS_REGISTRY,
  isDevelopmentField,
  getDevelopmentField
};

export const CANONICAL_SOCIETY_SPHERES = [
  { key: 'society_agriculture', label: 'Agriculture' },
  { key: 'society_architecture', label: 'Architecture' },
  { key: 'society_biotechnology', label: 'Biotechnology' },
  { key: 'society_commerce', label: 'Commerce' },
  { key: 'society_communication', label: 'Communication' },
  { key: 'society_computation', label: 'Computation' },
  { key: 'society_devices', label: 'Devices' },
  { key: 'society_education', label: 'Education' },
  { key: 'society_energy', label: 'Energy' },
  { key: 'society_manufacturing', label: 'Manufacturing' },
  { key: 'society_materials', label: 'Materials' },
  { key: 'society_medicine', label: 'Medicine' },
  { key: 'society_science', label: 'Science' },
  { key: 'society_society', label: 'Society & Governance' },
  { key: 'society_synthetic_intelligence', label: 'Synthetic Intelligence' },
  { key: 'society_synthetics', label: 'Synthetics' },
  { key: 'society_transportation', label: 'Transportation' },
  { key: 'society_weaponry', label: 'Weaponry' }
];

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
    idleLabel: 'text-purple-400/85 group-hover:text-purple-200',
    bar: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badge: 'bg-purple-500 text-white'
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:text-emerald-300',
    activeBox: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    activeBtn: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    activeLabel: 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]',
    idleLabel: 'text-emerald-400/85 group-hover:text-emerald-200',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badge: 'bg-emerald-500 text-black'
  },
  cyan: {
    iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:text-cyan-300',
    activeBox: 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]',
    activeBtn: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    activeLabel: 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.7)]',
    idleLabel: 'text-cyan-400/85 group-hover:text-cyan-200',
    bar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    badge: 'bg-cyan-500 text-black'
  },
  blue: {
    iconBox: 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-400 group-hover:text-blue-300',
    activeBox: 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    activeBtn: 'bg-blue-950/70 border-blue-400/80 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    activeLabel: 'text-blue-300 font-extrabold [text-shadow:0_0_8px_rgba(59,130,246,0.7)]',
    idleLabel: 'text-blue-400/85 group-hover:text-blue-200',
    bar: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    badge: 'bg-blue-500 text-white'
  },
  amber: {
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:text-amber-300',
    activeBox: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    activeBtn: 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    activeLabel: 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]',
    idleLabel: 'text-amber-400/85 group-hover:text-amber-200',
    bar: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badge: 'bg-amber-500 text-black'
  },
  yellow: {
    iconBox: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 group-hover:bg-yellow-500/20 group-hover:border-yellow-400 group-hover:text-yellow-300',
    activeBox: 'bg-yellow-500/25 border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    activeBtn: 'bg-yellow-950/70 border-yellow-400/80 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
    activeLabel: 'text-yellow-300 font-extrabold [text-shadow:0_0_8px_rgba(234,179,8,0.7)]',
    idleLabel: 'text-yellow-400/85 group-hover:text-yellow-200',
    bar: 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]',
    badge: 'bg-yellow-500 text-black'
  },
  rose: {
    iconBox: 'bg-rose-500/10 border-rose-500/30 text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-400 group-hover:text-rose-300',
    activeBox: 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    activeBtn: 'bg-rose-950/70 border-rose-400/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    activeLabel: 'text-rose-300 font-extrabold [text-shadow:0_0_8px_rgba(244,63,94,0.7)]',
    idleLabel: 'text-rose-400/85 group-hover:text-rose-200',
    bar: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    badge: 'bg-rose-500 text-white'
  },
  orange: {
    iconBox: 'bg-orange-500/10 border-orange-500/30 text-orange-400 group-hover:bg-orange-500/20 group-hover:border-orange-400 group-hover:text-orange-300',
    activeBox: 'bg-orange-500/25 border-orange-400 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    activeBtn: 'bg-orange-950/70 border-orange-400/80 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    activeLabel: 'text-orange-300 font-extrabold [text-shadow:0_0_8px_rgba(249,115,22,0.7)]',
    idleLabel: 'text-orange-400/85 group-hover:text-orange-200',
    bar: 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    badge: 'bg-orange-500 text-black'
  },
  red: {
    iconBox: 'bg-red-500/10 border-red-500/30 text-red-400 group-hover:bg-red-500/20 group-hover:border-red-400 group-hover:text-red-300',
    activeBox: 'bg-red-500/25 border-red-400 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    activeBtn: 'bg-red-950/70 border-red-400/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    activeLabel: 'text-red-300 font-extrabold [text-shadow:0_0_8px_rgba(239,68,68,0.7)]',
    idleLabel: 'text-red-400/85 group-hover:text-red-200',
    bar: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    badge: 'bg-red-500 text-white'
  },
  indigo: {
    iconBox: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-400 group-hover:text-indigo-300',
    activeBox: 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    activeBtn: 'bg-indigo-950/70 border-indigo-400/80 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    activeLabel: 'text-indigo-300 font-extrabold [text-shadow:0_0_8px_rgba(99,102,241,0.7)]',
    idleLabel: 'text-indigo-400/85 group-hover:text-indigo-200',
    bar: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]',
    badge: 'bg-indigo-500 text-white'
  }
};

export const SUB_SECTION_META = {
  trait: { label: 'Species Traits', shortLabel: 'SPECIES TRAITS', icon: Sparkles, color: '#c084fc' },
  invocations: { label: 'Invocations', shortLabel: 'INVOCATIONS', icon: Flame, color: '#fbbf24' },
  special_abilities: { label: 'Special Abilities', shortLabel: 'SPECIAL ABILITIES', icon: Zap, color: '#facc15' },
  gear: { label: 'Gear & Supplies', shortLabel: 'GEAR', icon: Package, color: '#fb923c' },
  weaponry: { label: 'Weaponry', shortLabel: 'WEAPONRY', icon: Crosshair, color: '#f87171' },
  armoring: { label: 'Armoring', shortLabel: 'ARMORING', icon: Shield, color: '#60a5fa' },
  augmentations: { label: 'Augmentations', shortLabel: 'AUGMENTS', icon: Zap, color: '#f472b6' },
  mecha: { label: 'Mecha & Vehicles', shortLabel: 'MECHA', icon: Bot, color: '#fbbf24' },
  architecture: { label: 'Architecture', shortLabel: 'ARCHITECT', icon: Landmark, color: '#34d399' },
  technology: { label: 'Technology & Schematics', shortLabel: 'TECH', icon: Zap, color: '#38bdf8' },
  other: { label: 'Other Property', shortLabel: 'OTHER', icon: Boxes, color: '#94a3b8' },
  modular_characters: { label: 'Threats & NPCs (MCM)', shortLabel: 'THREATS (MCM)', icon: Bot, color: '#f87171' },
  companions: { label: 'Companions & Familiars', shortLabel: 'COMPANIONS', icon: Bot, color: '#fb923c' },
  planetary_design: { label: 'Planetary Design', shortLabel: 'PLANETS', icon: Globe, color: '#818cf8' },
  world: { label: 'World Profiles', shortLabel: 'WORLDS', icon: Globe, color: '#818cf8' },
  universe: { label: 'Universe Rules', shortLabel: 'UNIVERSE', icon: Sparkles, color: '#818cf8' },
  setting: { label: 'Settings', shortLabel: 'SETTINGS', icon: Compass, color: '#818cf8' },
  philosophy: { label: 'Philosophy', shortLabel: 'PHILOSOPHY', icon: Flame, color: '#818cf8' },
  scene: { label: 'Scenes', shortLabel: 'SCENES', icon: Landmark, color: '#818cf8' }
};

/**
 * Canonical Omnicortex Sections
 */
export const OMNICORTEX_SECTIONS = [
  {
    id: 'species',
    label: 'Species & Lineages',
    shortLabel: 'SPECIES',
    icon: Dna,
    colorTheme: 'purple',
    subItems: ['trait'],
    sublabel: 'Lineages, Sizes, Movement & Species Traits'
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
    shortLabel: 'OCCUPATIONS',
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
    label: 'Character Features',
    shortLabel: 'FEATURES',
    icon: Shield,
    colorTheme: 'emerald',
    sublabel: '3 CP Ability, Combat, Discipline, General, Karma, Skill & Special'
  },
  {
    id: 'traits',
    label: 'Pillar Traits',
    shortLabel: 'TRAITS',
    icon: Sparkles,
    colorTheme: 'cyan',
    sublabel: 'Origins, Occupations, Archetypes & Factions'
  },
  {
    id: 'metaphysics',
    label: 'Invocations & Special Abilities',
    shortLabel: 'METAPHYSICS',
    icon: Flame,
    colorTheme: 'amber',
    isParent: true,
    subItems: ['invocations', 'special_abilities'],
    sublabel: 'Invocations, Disciplines & Special Abilities'
  },
  {
    id: 'personal_property',
    label: 'Property & Armory',
    shortLabel: 'PROPERTY',
    icon: Package,
    colorTheme: 'orange',
    isParent: true,
    subItems: ['gear', 'weaponry', 'armoring', 'augmentations', 'mecha', 'architecture', 'other'],
    sublabel: 'Gear, Weapons, Armor & Augments'
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
    isParent: true,
    subItems: [
      { key: 'modular_characters', label: 'Threats & NPCs (MCM)' },
      { key: 'companions', label: 'Companions & Familiars' }
    ],
    sublabel: 'Bestiary Statblocks, NPCs & Companions'
  },
  {
    id: 'world_design',
    label: 'World Design & Cosmology',
    shortLabel: 'WORLD',
    icon: Landmark,
    colorTheme: 'indigo',
    isParent: true,
    subItems: ['planetary_design', 'world', 'universe', 'setting', 'philosophy', 'scene'],
    sublabel: 'Planetary Specs, Universe & Settings'
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tangent_omnicortex_nav_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Developer Fields Flyout State
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);

  const toggleCollapse = (e) => {
    e?.stopPropagation?.();
    const next = isDevPanelOpen ? false : !isCollapsed;
    AudioService.playTerminalBeep(next ? 950 : 1250, 0.02);
    if (isDevPanelOpen) {
      setIsDevPanelOpen(false);
    }
    setIsCollapsed(next);
    setHoveredItem(null);
    try {
      localStorage.setItem('tangent_omnicortex_nav_collapsed', String(next));
    } catch {}
  };

  // Collapse to icons+labels when isCollapsed is true or when Dev Fields menu is open (on mobile viewports, isMobileOpen controls drawer)
  const isExpanded = !isDevPanelOpen && (!isCollapsed || (Boolean(isMobileOpen) && typeof window !== 'undefined' && window.innerWidth < 768));

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

  // Expandable Branch State for Parent Sections: collapsed unless the section (or one of its subItems) is selected
  const [expandedBranches, setExpandedBranches] = useState(() => {
    const initial = {};
    OMNICORTEX_SECTIONS.forEach(sec => {
      if (Array.isArray(sec.subItems) && sec.subItems.length > 0) {
        const subKeys = sec.subItems.map(s => (typeof s === 'object' ? s.key : s));
        initial[sec.id] = activeSectionKey === sec.id || subKeys.includes(activeSectionKey);
      }
    });
    return initial;
  });

  // Auto-expand only the active section's branch and collapse all other branches when activeSectionKey changes
  useEffect(() => {
    const next = {};
    OMNICORTEX_SECTIONS.forEach(sec => {
      if (Array.isArray(sec.subItems) && sec.subItems.length > 0) {
        const subKeys = sec.subItems.map(s => (typeof s === 'object' ? s.key : s));
        next[sec.id] = activeSectionKey === sec.id || subKeys.includes(activeSectionKey);
      }
    });
    setExpandedBranches(next);
  }, [activeSectionKey]);

  const toggleBranch = (sectionId, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(950, 0.02);
    setExpandedBranches(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Compute count for each section
  const getSectionCount = (section) => {
    if (section.isParent && Array.isArray(section.subItems)) {
      const seenKeys = new Set([section.id]);
      const baseCount = Array.isArray(dbData[section.id]) ? dbData[section.id].length : 0;
      return section.subItems.reduce((acc, sub) => {
        const subKey = typeof sub === 'object' ? sub.key : sub;
        if (seenKeys.has(subKey)) return acc;
        seenKeys.add(subKey);
        const list = dbData[subKey];
        return acc + (Array.isArray(list) ? list.length : 0);
      }, baseCount);
    }
    const list = dbData[section.id];
    return Array.isArray(list) ? list.length : 0;
  };

  const handleItemClick = (section) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (isDevPanelOpen) {
      setIsDevPanelOpen(false);
    }
    const hasSubItems = Array.isArray(section.subItems) && section.subItems.length > 0;
    if (hasSubItems) {
      if (activeSectionKey === section.id && !isDevPanelOpen) {
        setExpandedBranches(prev => ({ [section.id]: !prev[section.id] }));
      } else {
        setExpandedBranches({ [section.id]: true });
      }
    } else {
      setExpandedBranches({});
    }
    onSelectSection(section.id, section);
    setHoveredItem(null);
    if (onCloseMobile && !hasSubItems) onCloseMobile();
  };

  const handleSubItemClick = (subKey, parentSection) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (isDevPanelOpen) {
      setIsDevPanelOpen(false);
    }
    if (parentSection?.id) {
      setExpandedBranches({ [parentSection.id]: true });
    }
    onSelectSection(subKey, parentSection);
    setHoveredItem(null);
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
      {/* Desktop In-Flow Sizing Anchor (reserves full drawer width when expanded, compact icon+label rail width when collapsed) */}
      <div
        className={`hidden md:block shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
          isExpanded ? 'w-56 sm:w-60' : 'w-18 sm:w-20'
        }`}
        aria-hidden="true"
      />

      <nav
        aria-label="Omnicortex Navigation Rail"
        onMouseLeave={() => {
          setHoveredItem(null);
        }}
        className={`absolute top-0 bottom-0 left-0 h-full bg-[#070a12]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-between py-2 px-1 select-none z-40 font-sans transition-all duration-200 ease-out ${
          isExpanded 
            ? 'w-56 sm:w-60 shadow-[12px_0_35px_rgba(0,0,0,0.85)] border-slate-700/80' 
            : 'w-18 sm:w-20 shadow-lg'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header with Collapse / Expand Rail Toggle */}
        {isExpanded ? (
          <div className="w-full flex items-center justify-between px-2.5 py-1 mb-1 border-b border-slate-800/80 shrink-0 h-7 transition-all duration-200 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest truncate">
                OMNICORTEX
              </span>
              <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold shrink-0">
                SECTIONS
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
                title="Collapse Rail (Show Icons & Labels)"
                aria-label="Collapse Rail"
              >
                <PanelLeftClose size={13} />
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Navigation Rail"
                  aria-label="Close Navigation Rail"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center pb-1 mb-1 border-b border-slate-800/80 shrink-0 h-7">
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
              title="Expand Rail"
              aria-label="Expand Rail"
            >
              <PanelLeftOpen size={14} />
            </button>
          </div>
        )}

        {/* Main Omnicortex Sections Scroll Area */}
        <div className="flex-1 min-h-0 w-full flex flex-col items-stretch gap-0.5 sm:gap-1 overflow-y-auto no-scrollbar py-0.5">
          {OMNICORTEX_SECTIONS.map((section) => {
            const hasSubItems = Array.isArray(section.subItems) && section.subItems.length > 0;
            const subItemKeys = hasSubItems ? section.subItems.map(s => (typeof s === 'object' ? s.key : s)) : [];
            const isDirectActive = activeSectionKey === section.id;
            const isChildActive = hasSubItems && subItemKeys.includes(activeSectionKey);
            const isItemActive = isDirectActive || isChildActive;
            const isBranchOpen = hasSubItems && Boolean(expandedBranches[section.id]);

            const themeKey = section.colorTheme || 'cyan';
            const theme = SECTION_THEMES[themeKey] || SECTION_THEMES.cyan;
            const Icon = section.icon;
            const count = getSectionCount(section);

            return (
              <div key={section.id} className="flex flex-col gap-0.5 w-full shrink-0">
                <button
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
                  className={`group relative w-full rounded-xl flex transition-all cursor-pointer select-none border shrink-0 ${
                    isExpanded
                      ? 'h-8.5 sm:h-9 px-2 flex-row items-center justify-start'
                      : 'py-1.5 px-0.5 flex-col items-center justify-center min-h-[46px]'
                  } ${
                    isItemActive
                      ? theme.activeBtn
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                  }`}
                  title={isExpanded ? undefined : `${section.label} (${count} records)`}
                >
                  {/* Active Left Glowing Indicator Bar */}
                  {isItemActive && (
                    <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${theme.bar}`} />
                  )}

                  {/* Icon Container */}
                  <div
                    className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isItemActive ? theme.activeBox : theme.iconBox
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Collapsed Mode: Visible Section Name Underneath Icon */}
                  {!isExpanded && (
                    <span
                      className={`font-mono text-[8px] sm:text-[8.5px] font-bold uppercase tracking-tighter text-center mt-1 truncate max-w-full px-0.5 leading-tight select-none transition-colors ${
                        isItemActive ? theme.activeLabel : (theme.idleLabel || 'text-slate-300 group-hover:text-white')
                      }`}
                    >
                      {section.shortLabel}
                    </span>
                  )}

                  {/* Expanded Mode: Label & Descriptive Text to the Right of Icon */}
                  {isExpanded && (
                    <div className="flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden opacity-100 ml-2.5 max-w-[170px]">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                            isItemActive ? theme.activeLabel : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {section.shortLabel === 'DISADV' ? 'DISADVANTAGES' : section.shortLabel}
                        </span>
                        {hasSubItems && (
                          <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => toggleBranch(section.id, e)}
                            title={isBranchOpen ? 'Collapse branch' : 'Expand branch'}
                            className="p-0.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                          >
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${isBranchOpen ? 'rotate-180 text-cyan-300' : ''}`}
                            />
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                        {section.label}
                      </span>
                    </div>
                  )}
                </button>

                {/* Expanding Subcategory Tree Branch (Species -> Species Traits, Metaphysics -> Invocations & Special Abilities, Property -> Subcategories, World -> Subcategories) */}
                {hasSubItems && isBranchOpen && isExpanded && (
                  <div className="relative pl-2.5 ml-4 my-0.5 flex flex-col gap-1 border-l-2 border-slate-700/80">
                    {section.subItems.map((subItem) => {
                      const subKey = typeof subItem === 'object' ? subItem.key : subItem;
                      const customSubLabel = typeof subItem === 'object' ? subItem.label : null;
                      const subMeta = SUB_SECTION_META[subKey] || {
                        label: customSubLabel || subKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        shortLabel: (customSubLabel || subKey).replace(/_/g, ' ').toUpperCase(),
                        icon: Sparkles,
                        color: '#22d3ee'
                      };
                      const displayLabel = customSubLabel || subMeta.shortLabel || subMeta.label;
                      const SubIcon = subMeta.icon || Sparkles;
                      const isSubActive = activeSectionKey === subKey;
                      const subCount = Array.isArray(dbData[subKey]) ? dbData[subKey].length : 0;

                      return (
                        <button
                          key={subKey}
                          type="button"
                          onClick={() => handleSubItemClick(subKey, section)}
                          title={`${customSubLabel || subMeta.label} (${subCount} records)`}
                          className={`group/sub relative w-full px-2 py-1.5 rounded-lg text-left font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center justify-between gap-1.5 cursor-pointer border ${
                            isSubActive
                              ? `${theme.activeBtn} shadow-sm`
                              : 'bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-100 hover:bg-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          {/* Horizontal Branch Connector Tick */}
                          <span
                            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-0.5"
                            style={{ backgroundColor: isSubActive ? subMeta.color : 'rgba(148, 163, 184, 0.35)' }}
                          />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                                isSubActive ? 'border-cyan-400/70' : 'border-slate-800 bg-slate-950/60 group-hover/sub:border-slate-700'
                              }`}
                              style={isSubActive ? { background: `${subMeta.color}25`, borderColor: `${subMeta.color}80` } : {}}
                            >
                              <SubIcon
                                size={11}
                                style={{ color: isSubActive ? subMeta.color : undefined }}
                                className={isSubActive ? '' : 'text-slate-400 group-hover/sub:text-slate-200'}
                              />
                            </div>
                            <span
                              className="truncate"
                              style={isSubActive ? { color: subMeta.color } : {}}
                            >
                              {displayLabel}
                            </span>
                          </div>
                          {subCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-300 font-mono text-[8.5px] font-bold shrink-0">
                              {subCount}
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

        {/* Bottom Footer Section: Architect Tools */}
        <div className="flex flex-col items-center gap-1 w-full pt-1.5 border-t border-slate-800/80 shrink-0">
          {/* Master Developer Access Fields Button (Admin Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.02);
                setHoveredItem(null);
                setIsDevPanelOpen(prev => !prev);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: 'DEVELOPER FIELDS',
                  sublabel: `${DEVELOPMENT_FIELDS_GROUPS.length} Groups · ${DEVELOPMENT_FIELDS_REGISTRY.length} Schema Tables`,
                  desc: 'Toggle the Developer Fields drawer for Core Rules, Tech, Economy, Anatomy, Metaphysics, Crafting, and Spheres',
                  rect
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full rounded-xl flex transition-all cursor-pointer select-none border shrink-0 shadow-sm ${
                isExpanded
                  ? 'h-8.5 sm:h-9 px-2 flex-row items-center justify-start'
                  : 'py-1.5 px-0.5 flex-col items-center justify-center min-h-[46px]'
              } ${
                isDevFieldActive || isDevPanelOpen
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/50 text-amber-300 hover:text-amber-100'
              }`}
              title={isExpanded ? undefined : `Developer Fields (${DEVELOPMENT_FIELDS_REGISTRY.length} Schema Tables)`}
            >
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0">
                <Wrench size={15} className={isDevPanelOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
              </div>
              {!isExpanded && (
                <span className="font-mono text-[8px] sm:text-[8.5px] font-bold uppercase tracking-tighter text-center mt-1 truncate max-w-full px-0.5 leading-tight text-amber-300">
                  DEV FIELDS
                </span>
              )}
              {isExpanded && (
                <div className="flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden opacity-100 ml-2.5 max-w-[170px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10.5px] font-bold text-amber-300 uppercase tracking-wider truncate leading-tight">
                      DEV FIELDS
                    </span>
                    <span className="text-[8.5px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                      {DEVELOPMENT_FIELDS_REGISTRY.length}
                    </span>
                  </div>
                  <span className="text-[8.5px] text-amber-400/80 truncate font-mono leading-tight mt-0.5">
                    {DEVELOPMENT_FIELDS_GROUPS.length} Schema Groups
                  </span>
                </div>
              )}
            </button>
          )}

          {/* System User Guide Button */}
          {onOpenUserGuide && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setHoveredItem(null);
                if (isDevPanelOpen) {
                  setIsDevPanelOpen(false);
                }
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
              className={`w-full rounded-xl flex transition-all cursor-pointer select-none border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 ${
                isExpanded
                  ? 'h-8.5 sm:h-9 px-2 flex-row items-center justify-start'
                  : 'py-1.5 px-0.5 flex-col items-center justify-center min-h-[46px]'
              }`}
              title={isExpanded ? undefined : "Omnicortex User Guide"}
            >
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0">
                <HelpCircle size={15} />
              </div>
              {!isExpanded && (
                <span className="font-mono text-[8px] sm:text-[8.5px] font-bold uppercase tracking-tighter text-center mt-1 truncate max-w-full px-0.5 leading-tight text-slate-300">
                  USER GUIDE
                </span>
              )}
              {isExpanded && (
                <div className="flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden opacity-100 ml-2.5 max-w-[170px]">
                  <span className="font-mono text-[10.5px] font-bold text-slate-300 uppercase tracking-wider truncate leading-tight">
                    USER GUIDE
                  </span>
                  <span className="text-[8.5px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                    Documentation
                  </span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Floating Portal Tooltip for rich metadata */}
        {hoveredItem &&
          (!isExpanded || hoveredItem.desc || (hoveredItem.subItems && hoveredItem.subItems.length > 0)) &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed pointer-events-none z-[9999] px-2.5 py-1.5 rounded-lg bg-[#0d121c]/95 border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.85)] backdrop-blur-md max-w-xs animate-in fade-in zoom-in-95 duration-100 font-sans select-none"
              style={{
                top: Math.max(8, Math.min(window.innerHeight - 80, hoveredItem.rect.top + hoveredItem.rect.height / 2 - 25)),
                left: isExpanded ? Math.max(252, hoveredItem.rect.right + 12) : hoveredItem.rect.right + 10
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
                  Sub-items: {hoveredItem.subItems.map(s => (typeof s === 'object' ? (s.label || s.key) : s)).join(', ')}
                </div>
              )}
            </div>,
            document.body
          )}
      </nav>

      {/* ── DEVELOPER FIELDS VERTICAL MENU (Strictly Dev Mode) ── */}
      {isAdmin && isDevPanelOpen && (
        <aside
          className="absolute md:relative z-30 md:z-10 top-0 bottom-0 left-18 sm:left-20 md:left-0 w-72 sm:w-80 bg-[#080d18]/98 backdrop-blur-2xl border-r border-amber-500/40 shadow-[12px_0_35px_rgba(0,0,0,0.85)] flex flex-col p-3 select-none font-sans animate-in slide-in-from-left-4 duration-200 shrink-0 h-full"
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
