import React, { useState, useMemo } from 'react';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { AudioService } from '../../services/audioService';
import {
  Database,
  Search,
  Grid,
  List,
  Filter,
  Layers,
  Sparkles,
  Shield,
  Swords,
  Zap,
  Flame,
  Rocket,
  Compass,
  Building,
  Users,
  Eye,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Tag,
  BookOpen,
  ArrowUpDown,
  ExternalLink,
  Cpu,
  Globe,
  SlidersHorizontal,
  X
} from 'lucide-react';

// Domain Category Groupings for the Omnicortex Catalog Browser
export const OMNICORTEX_DOMAINS = [
  {
    id: 'species_domain',
    label: 'Species & Lineages',
    icon: '🧬',
    color: 'purple',
    categories: [
      { key: 'species', label: 'Species & Lineages', icon: '🧬' },
      { key: 'species_type', label: 'Species Types', icon: '🔬' },
      { key: 'species_size', label: 'Species Sizes', icon: '📐' },
      { key: 'species_movement', label: 'Movement Modes', icon: '🏃' },
      { key: 'trait', label: 'Species Traits', icon: '✨' },
      { key: 'disadvantages', label: 'Species Disadvantages', icon: '⚠️' }
    ]
  },
  {
    id: 'factions_domain',
    label: 'Factions & Societies',
    icon: '👑',
    color: 'emerald',
    categories: [
      { key: 'factions', label: 'Factions & Megacorps', icon: '👑' },
      { key: 'societies', label: 'Societies Master', icon: '🏛️' },
      { key: 'society_agriculture', label: 'Society: Agriculture', icon: '🌾' },
      { key: 'society_architecture', label: 'Society: Architecture', icon: '🏙️' },
      { key: 'society_biotechnology', label: 'Society: Biotechnology', icon: '🧬' },
      { key: 'society_commerce', label: 'Society: Commerce', icon: '💰' },
      { key: 'society_communication', label: 'Society: Communication', icon: '📡' },
      { key: 'society_devices', label: 'Society: Devices', icon: '📱' },
      { key: 'society_education', label: 'Society: Education', icon: '🎓' },
      { key: 'society_energy', label: 'Society: Energy', icon: '⚡' },
      { key: 'society_manufacturing', label: 'Society: Manufacturing', icon: '🏗️' },
      { key: 'society_materials', label: 'Society: Materials', icon: '🔬' },
      { key: 'society_medicine', label: 'Society: Medicine', icon: '💉' },
      { key: 'society_society', label: 'Society: Structure', icon: '⚖️' },
      { key: 'society_synthetics', label: 'Society: Synthetics', icon: '🤖' },
      { key: 'society_weaponry', label: 'Society: Weaponry', icon: '⚔️' }
    ]
  },
  {
    id: 'character_domain',
    label: 'Origins, Occupations & Archetypes',
    icon: '👤',
    color: 'cyan',
    categories: [
      { key: 'archetypes', label: 'Archetype Spheres', icon: '🌟' },
      { key: 'origins', label: 'Origins & Backgrounds', icon: '🌐' },
      { key: 'occupations', label: 'Occupations & Vocations', icon: '🎯' }
    ]
  },
  {
    id: 'capabilities_domain',
    label: 'Skills & Features',
    icon: '📊',
    color: 'blue',
    categories: [
      { key: 'skills', label: 'Skills & Disciplines', icon: '📊' },
      { key: 'features', label: 'Features & Talents', icon: '🛡️' }
    ]
  },
  {
    id: 'metaphysics_domain',
    label: 'Metaphysics & Invocations',
    icon: '🔮',
    color: 'amber',
    categories: [
      { key: 'invocations', label: 'Invocations (Spells)', icon: '🔮' },
      { key: 'special_abilities', label: 'Special Abilities', icon: '⚡' },
      { key: 'disciplines', label: 'Disciplines', icon: '📜' },
      { key: 'area', label: 'Area Patterns', icon: '🌐' },
      { key: 'effect', label: 'Effect Profiles', icon: '💥' },
      { key: 'range', label: 'Range Categories', icon: '🎯' },
      { key: 'target', label: 'Target Specs', icon: '🎯' }
    ]
  },
  {
    id: 'augmentations_domain',
    label: 'Augmentations & Cyberware',
    icon: '🦾',
    color: 'rose',
    categories: [
      { key: 'augmentations', label: 'Augmentations (Cyberware)', icon: '🦾' },
      { key: 'augmentation_type', label: 'Augmentation Types', icon: '🧬' },
      { key: 'body_location', label: 'Body Locations', icon: '🫀' }
    ]
  },
  {
    id: 'armory_domain',
    label: 'Armory & Property',
    icon: '⚔️',
    color: 'amber',
    categories: [
      { key: 'weaponry', label: 'Weaponry & Ordinance', icon: '⚔️' },
      { key: 'armoring', label: 'Armoring & Shields', icon: '🛡️' },
      { key: 'gear', label: 'Gear & Electronics', icon: '🎒' },
      { key: 'mecha', label: 'Mecha & Vehicles', icon: '🤖' },
      { key: 'architecture', label: 'Architecture & Facilities', icon: '🏛️' },
      { key: 'other', label: 'Other Property', icon: '📦' },
      { key: 'gear_category', label: 'Gear Categories', icon: '🏷️' },
      { key: 'availability', label: 'Availability Ratings', icon: '🛒' },
      { key: 'material', label: 'Materials & Composites', icon: '🧱' },
      { key: 'resistance', label: 'Defense Resistances', icon: '🛡️' },
      { key: 'mode', label: 'Firing & Combat Modes', icon: '🔄' },
      { key: 'special', label: 'Weapon Specials', icon: '⭐' },
      { key: 'component', label: 'Components & Modules', icon: '🧩' },
      { key: 'classification', label: 'Classifications', icon: '🗂️' },
      { key: 'creator', label: 'Manufacturers & Forges', icon: '🏭' },
      { key: 'design', label: 'Blueprints & Designs', icon: '📜' }
    ]
  },
  {
    id: 'bestiary_domain',
    label: 'Modular Characters & Bestiary',
    icon: '👾',
    color: 'red',
    categories: [
      { key: 'modular_characters', label: 'Modular Characters & Threats', icon: '👾' },
      { key: 'critical_effect', label: 'Critical Effects Matrix', icon: '💥' },
      { key: 'critical_success_effect', label: 'Critical Success Effects', icon: '🌟' },
      { key: 'critical_failure_effect', label: 'Critical Failure Effects', icon: '⚠️' }
    ]
  },
  {
    id: 'world_domain',
    label: 'Cosmology & World Design',
    icon: '🌌',
    color: 'indigo',
    categories: [
      { key: 'planetary_design', label: 'Planetary Specs (UWP)', icon: '🪐' },
      { key: 'universe', label: 'Universe & Multiverse', icon: '🌌' },
      { key: 'setting', label: 'Settings & Locations', icon: '📍' },
      { key: 'philosophy', label: 'Philosophies & Religions', icon: '⚖️' },
      { key: 'technology', label: 'Technology Profiles', icon: '💡' },
      { key: 'economatrix', label: 'Economatrix Commodities', icon: '💎' },
      { key: 'scene', label: 'AIME Scenes & Beats', icon: '🎬' }
    ]
  },
  {
    id: 'system_domain',
    label: 'Core Rules & Prerequisite Matrices',
    icon: '⚙️',
    color: 'slate',
    categories: [
      { key: 'prerequisite', label: 'Prerequisites Gates', icon: '📋' },
      { key: 'modifier', label: 'Universal Modifiers Matrix', icon: '⚙️' }
    ]
  }
];

export const OmnicortexCatalogView = ({
  dbData = {},
  onOpenItem,
  onOpenWikiArticle
}) => {
  const [activeCategoryKey, setActiveCategoryKey] = useState('species');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [collapsedDomains, setCollapsedDomains] = useState({});
  const [copiedItemId, setCopiedItemId] = useState(null);

  // Facet filter states
  const [selectedTL, setSelectedTL] = useState('all'); // 'all' | 0..5
  const [selectedML, setSelectedML] = useState('all'); // 'all' | 0..5
  const [selectedLineage, setSelectedLineage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Compute total asset counts across all Omnicortex collections
  const totalOmnicortexAssets = useMemo(() => {
    let count = 0;
    Object.keys(dbData).forEach(k => {
      if (k !== 'compendium' && Array.isArray(dbData[k])) {
        count += dbData[k].length;
      }
    });
    return count;
  }, [dbData]);

  // Current category config
  const activeConfig = categoryConfig[activeCategoryKey] || {
    label: activeCategoryKey.toUpperCase(),
    fields: { name: { type: 'text' }, description: { type: 'textarea' } }
  };

  // Get raw items for active category
  const rawItems = useMemo(() => {
    return Array.isArray(dbData[activeCategoryKey]) ? dbData[activeCategoryKey] : [];
  }, [dbData, activeCategoryKey]);

  // Get all items across all collections (for global search)
  const allConsolidatedItems = useMemo(() => {
    const list = [];
    Object.entries(dbData).forEach(([catKey, catItems]) => {
      if (catKey !== 'compendium' && Array.isArray(catItems)) {
        catItems.forEach(item => {
          if (item && (item.name || item.title)) {
            list.push({
              ...item,
              _categoryKey: catKey,
              _categoryLabel: categoryConfig[catKey]?.label || catKey.toUpperCase()
            });
          }
        });
      }
    });
    return list;
  }, [dbData]);

  // Extract unique filter options for active category
  const { availableTypes, availableLineages } = useMemo(() => {
    const types = new Set();
    const lineages = new Set();

    rawItems.forEach(item => {
      if (item.parent_species) lineages.add(item.parent_species);
      if (item.lineage) lineages.add(item.lineage);

      if (item.type) {
        if (Array.isArray(item.type)) item.type.forEach(t => types.add(String(t)));
        else types.add(String(item.type));
      }
      if (item.category) types.add(String(item.category));
      if (item.subtype) types.add(String(item.subtype));
      if (item.sphere) types.add(String(item.sphere));
    });

    return {
      availableTypes: Array.from(types).sort(),
      availableLineages: Array.from(lineages).sort()
    };
  }, [rawItems]);

  // Filter items based on active filters, search query, and global/local scope
  const filteredItems = useMemo(() => {
    const sourceList = isGlobalSearch ? allConsolidatedItems : rawItems;
    const q = searchQuery.toLowerCase().trim();

    return sourceList.filter(item => {
      // Search term filter
      if (q) {
        const nameMatch = (item.name || item.title || '').toLowerCase().includes(q);
        const descMatch = (item.description || item.body || item.note || item.mechanic || '').toLowerCase().includes(q);
        const lineageMatch = (item.parent_species || item.lineage || '').toLowerCase().includes(q);
        const typeMatch = item.type && (Array.isArray(item.type)
          ? item.type.some(t => String(t).toLowerCase().includes(q))
          : String(item.type).toLowerCase().includes(q));
        const categoryMatch = (item.category || item._categoryLabel || '').toLowerCase().includes(q);
        const tagMatch = item.tags && (Array.isArray(item.tags)
          ? item.tags.some(t => String(t).toLowerCase().includes(q))
          : String(item.tags).toLowerCase().includes(q));
        const homeworldMatch = (item.homeworld || '').toLowerCase().includes(q);
        const damageMatch = (item.damage || '').toLowerCase().includes(q);
        const weaponClassMatch = (item.classification || '').toLowerCase().includes(q);

        if (!nameMatch && !descMatch && !lineageMatch && !typeMatch && !categoryMatch && !tagMatch && !homeworldMatch && !damageMatch && !weaponClassMatch) {
          return false;
        }
      }

      // Tech Level (TL) filter
      if (selectedTL !== 'all') {
        const tlVal = item.tech_level !== undefined ? item.tech_level : item.tl;
        if (tlVal === undefined || Number(tlVal) !== Number(selectedTL)) {
          return false;
        }
      }

      // Meta Level (ML) filter
      if (selectedML !== 'all') {
        const mlVal = item.meta_level !== undefined ? item.meta_level : item.ml;
        if (mlVal === undefined || Number(mlVal) !== Number(selectedML)) {
          return false;
        }
      }

      // Lineage filter
      if (selectedLineage !== 'all') {
        const lin = item.parent_species || item.lineage;
        if (!lin || lin !== selectedLineage) return false;
      }

      // Type / Category filter
      if (selectedType !== 'all') {
        const itemType = item.type;
        const itemCat = item.category;
        const itemSub = item.subtype;
        const itemSphere = item.sphere;

        const matches = (
          (Array.isArray(itemType) && itemType.includes(selectedType)) ||
          itemType === selectedType ||
          itemCat === selectedType ||
          itemSub === selectedType ||
          itemSphere === selectedType
        );
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
  }, [isGlobalSearch, allConsolidatedItems, rawItems, searchQuery, selectedTL, selectedML, selectedLineage, selectedType]);

  const toggleDomainCollapse = (domainId) => {
    setCollapsedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const handleCopyWikiLink = (e, item) => {
    e.stopPropagation();
    const linkText = `[[${item.name || item.title}]]`;
    navigator.clipboard?.writeText(linkText);
    setCopiedItemId(item.id || item.name);
    AudioService.playTerminalBeep(1300, 0.02);
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  const handleSelectCategory = (catKey) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveCategoryKey(catKey);
    setIsGlobalSearch(false);
    setSelectedTL('all');
    setSelectedML('all');
    setSelectedLineage('all');
    setSelectedType('all');
  };

  return (
    <div className="flex-1 flex bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden h-full relative shadow-xl select-none">
      {/* LEFT PANEL: Omnicortex Domain & Category Tree */}
      <aside className="w-72 lg:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Database size={14} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  OMNICORTEX
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Game Asset Catalog
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
              {totalOmnicortexAssets.toLocaleString()} Assets
            </span>
          </div>

          {/* Quick Category / Global Search Filter Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setIsGlobalSearch(false)}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all ${
                !isGlobalSearch
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(52,211,153,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Category ({rawItems.length})
            </button>
            <button
              onClick={() => setIsGlobalSearch(true)}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                isGlobalSearch
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <span>🌐</span> All ({allConsolidatedItems.length})
            </button>
          </div>
        </div>

        {/* Domain Groupings Scrollable Tree */}
        <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-1.5">
          {OMNICORTEX_DOMAINS.map(domain => {
            const isCollapsed = Boolean(collapsedDomains[domain.id]);
            const totalDomainCount = domain.categories.reduce((acc, c) => acc + (dbData[c.key]?.length || 0), 0);

            return (
              <div key={domain.id} className="bg-slate-900/40 rounded-lg border border-slate-800/80 overflow-hidden">
                {/* Domain Group Header */}
                <button
                  type="button"
                  onClick={() => toggleDomainCollapse(domain.id)}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-850 transition-colors flex items-center justify-between border-b border-slate-800/60 group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    </span>
                    <span className="text-sm shrink-0">{domain.icon}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-emerald-300 uppercase tracking-wide truncate">
                      {domain.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-300 font-bold shrink-0">
                    {totalDomainCount}
                  </span>
                </button>

                {/* Categories inside Domain */}
                {!isCollapsed && (
                  <div className="p-1 space-y-0.5">
                    {domain.categories.map(cat => {
                      const isSelected = activeCategoryKey === cat.key && !isGlobalSearch;
                      const count = dbData[cat.key]?.length || 0;

                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleSelectCategory(cat.key)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)] font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                            <span className="text-xs shrink-0">{cat.icon}</span>
                            <span className="truncate">{cat.label}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                            isSelected ? 'bg-emerald-900 text-emerald-200 font-bold' : 'bg-slate-800 text-slate-400'
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

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>{OMNICORTEX_DOMAINS.length} Domains</span>
          <span className="text-emerald-400 font-bold">Read-Only Catalog</span>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL: Asset Browser & Inspector View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/90">
        {/* Top Filter & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Active Category Title & Badges */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">
                {isGlobalSearch ? '🌐' : (OMNICORTEX_DOMAINS.flatMap(d => d.categories).find(c => c.key === activeCategoryKey)?.icon || '📁')}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono truncate">
                    {isGlobalSearch ? 'GLOBAL ASSET SEARCH' : (categoryConfig[activeCategoryKey]?.label || activeCategoryKey.toUpperCase())}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    {filteredItems.length} {filteredItems.length === 1 ? 'Entry' : 'Entries'}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                    READ-ONLY REFERENCE
                  </span>
                </div>
              </div>
            </div>

            {/* Controls: View Mode & Filter Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                  showFilters || selectedTL !== 'all' || selectedML !== 'all' || selectedLineage !== 'all' || selectedType !== 'all'
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Toggle Advanced Filters"
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
                {(selectedTL !== 'all' || selectedML !== 'all' || selectedLineage !== 'all' || selectedType !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <Grid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Table Directory View"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 pointer-events-none" size={14} />
            <input
              type="text"
              placeholder={isGlobalSearch ? "Global Search all species, weapons, cybernetics, spells, lore..." : `Search within ${activeConfig.label || 'category'} by name, stat, tag, keyword...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-8 py-2 rounded-lg text-xs outline-none focus:border-emerald-500 font-mono shadow-inner transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-sm px-1"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Collapsible Advanced Filters Tray */}
          {showFilters && (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-3 text-xs font-mono animate-in fade-in duration-150">
              {/* Tech Level (TL) Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold">Tech Level:</span>
                <select
                  value={selectedTL}
                  onChange={e => setSelectedTL(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-emerald-500"
                >
                  <option value="all">All TL (0-5)</option>
                  <option value="0">TL 0 (Primitive)</option>
                  <option value="1">TL 1 (Industrial)</option>
                  <option value="2">TL 2 (Digital)</option>
                  <option value="3">TL 3 (Interstellar)</option>
                  <option value="4">TL 4 (Advanced Fusion)</option>
                  <option value="5">TL 5 (Precursor / Exotic)</option>
                </select>
              </div>

              {/* Meta Level (ML) Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold">Meta Level:</span>
                <select
                  value={selectedML}
                  onChange={e => setSelectedML(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-emerald-500"
                >
                  <option value="all">All ML (0-5)</option>
                  <option value="0">ML 0 (Mundane)</option>
                  <option value="1">ML 1 (Latent)</option>
                  <option value="2">ML 2 (Awakened)</option>
                  <option value="3">ML 3 (Adept)</option>
                  <option value="4">ML 4 (Master)</option>
                  <option value="5">ML 5 (Ascendant)</option>
                </select>
              </div>

              {/* Lineage Filter (if available) */}
              {availableLineages.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-bold">Lineage:</span>
                  <select
                    value={selectedLineage}
                    onChange={e => setSelectedLineage(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Lineages</option>
                    {availableLineages.map(lin => (
                      <option key={lin} value={lin}>{lin}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type / Subtype Filter (if available) */}
              {availableTypes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-bold">Type/Category:</span>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Types</option>
                    {availableTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Filters Button */}
              {(selectedTL !== 'all' || selectedML !== 'all' || selectedLineage !== 'all' || selectedType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTL('all');
                    setSelectedML('all');
                    setSelectedLineage('all');
                    setSelectedType('all');
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 rounded text-xs font-bold transition-colors ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Area: Card Grid vs Table Directory View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono italic text-xs border border-dashed border-slate-800 rounded-xl max-w-md mx-auto my-8">
              <Database size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-slate-400 mb-1">No Omnicortex assets found.</p>
              <p>Try clearing your search query or adjusting your filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredItems.map(item => {
                const name = item.name || item.title || 'Unnamed Asset';
                const catKey = item._categoryKey || activeCategoryKey;
                const catLabel = item._categoryLabel || categoryConfig[catKey]?.label || catKey.toUpperCase();
                const tl = item.tech_level !== undefined ? item.tech_level : item.tl;
                const ml = item.meta_level !== undefined ? item.meta_level : item.ml;
                const cp = item.cp !== undefined ? item.cp : (item.bp !== undefined ? item.bp : item.cost_cp);
                const damage = item.damage;
                const dr = item.dr || item.armor;
                const sp = item.sp || item.hp;
                const costCredits = item.costs?.credits || item.cost || item.price;
                const lineage = item.parent_species || item.lineage;
                const type = Array.isArray(item.type) ? item.type.join(', ') : item.type;
                const isCopied = copiedItemId === (item.id || item.name);

                return (
                  <div
                    key={item.id || item.name}
                    onClick={() => onOpenItem(item, catKey)}
                    className="bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-pointer"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded font-mono font-bold tracking-tight uppercase">
                              {catLabel}
                            </span>
                            {lineage && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-950/80 text-purple-300 border border-purple-500/40 rounded font-mono font-bold">
                                {lineage}
                              </span>
                            )}
                            {type && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 text-slate-300 border border-slate-700 rounded font-mono">
                                {type}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 uppercase tracking-wide transition-colors font-sans truncate">
                            {name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyWikiLink(e, item)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors shrink-0"
                          title="Copy [[Wiki Link]] reference"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3 font-sans">
                        {item.description || item.body || item.mechanic || item.note || <em className="text-slate-600">No description available.</em>}
                      </p>
                    </div>

                    {/* Stats & Meta Footer Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tl !== undefined && tl !== null && (
                          <span className="text-cyan-400 font-bold">TL {tl}</span>
                        )}
                        {ml !== undefined && ml !== null && (
                          <span className="text-amber-400 font-bold">ML {ml}</span>
                        )}
                        {cp !== undefined && cp !== null && (
                          <span className="text-emerald-400 font-bold">{cp} CP</span>
                        )}
                        {damage && (
                          <span className="text-rose-400 font-bold">⚔️ {damage}</span>
                        )}
                        {dr && (
                          <span className="text-blue-400 font-bold">🛡️ DR {dr}</span>
                        )}
                        {sp && (
                          <span className="text-emerald-300 font-bold">SP {sp}</span>
                        )}
                        {costCredits && (
                          <span className="text-amber-300 font-bold">{costCredits} Cr</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-500 group-hover:text-emerald-400 text-[10px] font-bold uppercase transition-colors">
                        <span>Inspect</span>
                        <Eye size={12} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Directory View */
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 shadow-md">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-bold">Name</th>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Type / Lineage</th>
                    <th className="p-3 font-bold text-center">TL</th>
                    <th className="p-3 font-bold text-center">ML</th>
                    <th className="p-3 font-bold text-center">Cost / CP</th>
                    <th className="p-3 font-bold">Description</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredItems.map(item => {
                    const name = item.name || item.title || 'Unnamed';
                    const catKey = item._categoryKey || activeCategoryKey;
                    const catLabel = item._categoryLabel || categoryConfig[catKey]?.label || catKey.toUpperCase();
                    const tl = item.tech_level !== undefined ? item.tech_level : item.tl;
                    const ml = item.meta_level !== undefined ? item.meta_level : item.ml;
                    const cp = item.cp !== undefined ? item.cp : (item.bp !== undefined ? item.bp : item.cost_cp);
                    const costCredits = item.costs?.credits || item.cost || item.price;
                    const lin = item.parent_species || item.lineage || item.type || item.category || '—';
                    const isCopied = copiedItemId === (item.id || item.name);

                    return (
                      <tr
                        key={item.id || item.name}
                        onClick={() => onOpenItem(item, catKey)}
                        className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                      >
                        <td className="p-3 font-bold text-white group-hover:text-emerald-300 whitespace-nowrap">
                          {name}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            {catLabel}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {Array.isArray(lin) ? lin.join(', ') : String(lin)}
                        </td>
                        <td className="p-3 text-center text-cyan-400 font-bold whitespace-nowrap">
                          {tl !== undefined && tl !== null ? tl : '—'}
                        </td>
                        <td className="p-3 text-center text-amber-400 font-bold whitespace-nowrap">
                          {ml !== undefined && ml !== null ? ml : '—'}
                        </td>
                        <td className="p-3 text-center text-emerald-400 font-bold whitespace-nowrap">
                          {cp !== undefined && cp !== null ? `${cp} CP` : (costCredits ? `${costCredits} Cr` : '—')}
                        </td>
                        <td className="p-3 text-slate-400 truncate max-w-xs font-sans">
                          {item.description || item.body || item.note || '—'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyWikiLink(e, item)}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800"
                              title="Copy [[Wiki Link]]"
                            >
                              {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenItem(item, catKey)}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold uppercase flex items-center gap-1"
                            >
                              <Eye size={11} />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OmnicortexCatalogView;
