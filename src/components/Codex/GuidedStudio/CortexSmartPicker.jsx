import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { resolveCatalogForDomain } from './intelligence/cortexExemplarService';
import { extractCategoryKeywords } from '../../../utils/pillarRecommendations';
import { normalizePrerequisiteString } from '../../../utils/prerequisiteEvaluator';
import {
  SKILL_SUBCATEGORY_FILTERS,
  SKILL_ATTRIBUTE_FILTERS,
  extractSkillAttributeCodes,
  resolvePrimarySkillAttrBadge
} from '../../../data/skillsData';

const SKILL_CATEGORY_TABS = [
  { id: 'all', label: 'All Skills' },
  { id: 'synergy', label: '★ Cortex Fit' },
  { id: 'groups', label: 'Skill Groups' },
  { id: 'physical', label: 'Physical' },
  { id: 'mental', label: 'Mental' },
  { id: 'social', label: 'Social' },
  { id: 'combat', label: 'Combat' },
  { id: 'meta', label: 'Metafocus' }
];

const FEATURE_CATEGORY_TABS = [
  { id: 'all', label: 'All Features' },
  { id: 'synergy', label: '★ Cortex Fit' },
  { id: 'Feature Groups', label: 'Feature Groups' },
  { id: 'General', label: 'General' },
  { id: 'Combat', label: 'Combat' },
  { id: 'Ability', label: 'Ability' },
  { id: 'Skill', label: 'Skill' },
  { id: 'Discipline', label: 'Discipline' },
  { id: 'Karma', label: 'Karma' },
  { id: 'Special', label: 'Special' }
];

const CATALOG_NOUN_BY_SOURCE = {
  skills: 'Skill Catalog',
  features: 'Feature Catalog',
  traits: 'Trait Catalog',
  trait: 'Species Trait Catalog',
  archetypes: 'Archetype Catalog',
  gear: 'Gear Catalog'
};

/**
 * CortexSmartPicker
 * Inline Omnicortex-aware catalog browser & relational selector replacing raw comma-separated inputs.
 * Provides an expandable categorized catalog grid (Skills, Features, Traits, Archetypes, Gear),
 * ranks catalog items by thematic/TL/ML synergy with the active draft, surfaces prerequisite badges,
 * launches the full Omnicortex modal bound to `targetField`, and supports both `array` and `csv` serialization.
 */
export const CortexSmartPicker = ({
  label,
  sourceCollection,
  source,
  targetField = '',
  alsoSyncFields = [],
  value,
  onChange,
  valueFormat = 'auto', // 'auto' | 'array' | 'csv'
  formData = {},
  dbData = {},
  isEditMode = true,
  onOpenPicker = null,
  onOpenFullModal = null,
  placeholder = 'Search Cortex or type custom entry...',
  helperText = '',
  maxRecommendations = 8,
  accentColor = '#06b6d4',
  defaultCatalogOpen = false,
  isDiscountedFeaturePool = false
}) => {
  const resolvedSource = sourceCollection || source || 'skills';
  const resolvedOpenPicker = onOpenPicker || onOpenFullModal || null;
  const catalogNoun = CATALOG_NOUN_BY_SOURCE[resolvedSource] || 'Cortex Catalog';

  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(defaultCatalogOpen);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [activeSubcategoryTab, setActiveSubcategoryTab] = useState('all');
  const [activeAttrTab, setActiveAttrTab] = useState('all');
  const [showAllCatalogItems, setShowAllCatalogItems] = useState(false);

  const effectiveFormat = useMemo(() => {
    if (valueFormat !== 'auto') return valueFormat;
    if (typeof value === 'string') return 'csv';
    return 'array';
  }, [valueFormat, value]);

  const selectedList = useMemo(() => {
    if (Array.isArray(value)) {
      return value
        .map((v) =>
          typeof v === 'object' && v !== null
            ? v.name || v.title || v.skill || v.id || ''
            : String(v)
        )
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [value]);

  const selectedLowerSet = useMemo(
    () => new Set(selectedList.map((s) => s.toLowerCase())),
    [selectedList]
  );

  const catalog = useMemo(
    () => resolveCatalogForDomain(resolvedSource, dbData),
    [resolvedSource, dbData]
  );

  const contextKeywords = useMemo(() => {
    try {
      const kws = extractCategoryKeywords(formData);
      if (kws instanceof Set) return Array.from(kws);
      if (Array.isArray(kws)) return kws;
    } catch {
      // Fallback keyword extraction
    }
    return `${formData.name || ''} ${formData.category || ''} ${formData.habitat || ''} ${formData.field || ''} ${formData.sphere || ''} ${formData.faction_type || ''} ${formData.description || ''}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4);
  }, [formData]);

  const enrichedCatalog = useMemo(() => {
    const draftTL = Number(formData.tech_level ?? formData.tl ?? 3);
    const items = [];

    for (const item of catalog) {
      if (!item || typeof item !== 'object') continue;
      const name = String(item.name || item.title || item.id || '').trim();
      if (!name) continue;

      const desc = String(item.mechanic || item.description || item.summary || '').trim();
      const groupKey = String(
        resolvedSource === 'features'
          ? item.category || item.group || item.type || 'General'
          : item.group || item.category || item.trait_type || item.sphere || item.type || ''
      ).trim();
      const subcategory = String(item.subcategory || item.subtype || '').trim();
      const governingAttr = String(item.governing_attribute || '').trim();
      const attrCodes =
        resolvedSource === 'skills'
          ? Array.isArray(item.attrCodes)
            ? item.attrCodes
            : extractSkillAttributeCodes(item)
          : [];
      const primaryAttrBadge =
        resolvedSource === 'skills'
          ? item.primaryAttrBadge || resolvePrimarySkillAttrBadge(item)
          : '';
      const hay = `${name} ${groupKey} ${subcategory} ${governingAttr} ${item.keywords || ''} ${desc}`.toLowerCase();

      let synergy = 0;
      for (const kw of contextKeywords) {
        if (kw && hay.includes(kw)) synergy += 3;
      }

      const itemTL = Number(item.tech_level ?? item.tl ?? NaN);
      if (!Number.isNaN(itemTL) && Math.abs(itemTL - draftTL) <= 1) {
        synergy += 1;
      }

      const rawPrereq = Array.isArray(item.prerequisite)
        ? item.prerequisite[0]
        : item.prerequisite || item.prerequisites || '';
      const cleanPrereq =
        rawPrereq && String(rawPrereq).toLowerCase() !== 'none'
          ? normalizePrerequisiteString(String(rawPrereq))
          : '';

      const isGroupItem = Boolean(item.isSkillGroup || item.isCategoryGroup);

      items.push({
        id: item.id || name,
        name,
        groupKey,
        subcategory,
        governingAttr,
        attrCodes,
        primaryAttrBadge,
        isGroupItem,
        categoryLabel: item.categoryLabel || subcategory || governingAttr || groupKey || item.tier || '',
        cp: item.cp ?? item.costs?.cp ?? item.costs?.bp ?? null,
        prereq: cleanPrereq,
        description: desc,
        hay,
        synergy
      });
    }

    items.sort((a, b) => {
      if (a.isGroupItem !== b.isGroupItem) return a.isGroupItem ? 1 : -1;
      return b.synergy - a.synergy || a.name.localeCompare(b.name);
    });
    return items;
  }, [catalog, contextKeywords, formData.tech_level, formData.tl, resolvedSource]);

  const drawerFilterStats = useMemo(() => {
    const byTab = {};
    const bySub = {};
    const byAttr = { STR: 0, AGI: 0, STA: 0, INT: 0, WIS: 0, CHA: 0 };
    let synergyCount = 0;

    for (const cand of enrichedCatalog) {
      const gLower = cand.groupKey.toLowerCase();
      byTab[gLower] = (byTab[gLower] || 0) + 1;
      if (cand.subcategory) {
        const subKey = `${gLower}:${cand.subcategory.toLowerCase()}`;
        bySub[subKey] = (bySub[subKey] || 0) + 1;
      }
      const inAttrScope =
        !cand.isGroupItem &&
        (activeCategoryTab === 'all' ||
          (activeCategoryTab === 'synergy' && cand.synergy >= 3) ||
          (gLower === activeCategoryTab.toLowerCase() &&
            (activeSubcategoryTab === 'all' ||
              cand.subcategory.toLowerCase() === activeSubcategoryTab.toLowerCase())));
      if (inAttrScope) {
        for (const code of cand.attrCodes) {
          if (byAttr[code] !== undefined) byAttr[code] += 1;
        }
      }
      if (!cand.isGroupItem && cand.synergy >= 3) {
        synergyCount += 1;
      }
    }
    return { byTab, bySub, byAttr, synergyCount };
  }, [enrichedCatalog, activeCategoryTab, activeSubcategoryTab]);

  const rankedCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrichedCatalog.filter((cand) => {
      if (selectedLowerSet.has(cand.name.toLowerCase())) return false;
      if (q && !cand.hay.includes(q)) return false;
      return true;
    });
  }, [enrichedCatalog, query, selectedLowerSet]);

  const filteredCatalogDrawerItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrichedCatalog.filter((cand) => {
      if (q && !cand.hay.includes(q)) return false;
      if (resolvedSource === 'skills' && activeAttrTab !== 'all') {
        if (!cand.attrCodes.includes(activeAttrTab)) return false;
      }
      if (activeCategoryTab === 'all') return true;
      if (activeCategoryTab === 'synergy') return !cand.isGroupItem && cand.synergy >= 3;
      if (resolvedSource === 'skills') {
        const g = cand.groupKey.toLowerCase();
        if (g !== activeCategoryTab.toLowerCase()) return false;
        if (activeSubcategoryTab !== 'all') {
          return cand.subcategory.toLowerCase() === activeSubcategoryTab.toLowerCase();
        }
        return true;
      }
      if (resolvedSource === 'features') {
        return cand.groupKey.toLowerCase() === activeCategoryTab.toLowerCase();
      }
      return cand.groupKey.toLowerCase().includes(activeCategoryTab.toLowerCase());
    });
  }, [
    enrichedCatalog,
    query,
    activeCategoryTab,
    activeSubcategoryTab,
    activeAttrTab,
    resolvedSource
  ]);

  const isFilteredView =
    activeCategoryTab !== 'all' ||
    activeSubcategoryTab !== 'all' ||
    activeAttrTab !== 'all' ||
    Boolean(query.trim());

  const visibleCatalogDrawerItems =
    isFilteredView || showAllCatalogItems
      ? filteredCatalogDrawerItems
      : filteredCatalogDrawerItems.slice(0, 30);

  const emitChange = (nextList) => {
    if (effectiveFormat === 'csv') {
      onChange(nextList.join(', '));
    } else {
      onChange(nextList);
    }
  };

  const handleAdd = (entryName) => {
    const clean = String(entryName || '').trim();
    if (!clean || selectedLowerSet.has(clean.toLowerCase())) return;
    emitChange([...selectedList, clean]);
    setQuery('');
  };

  const handleRemove = (entryName) => {
    emitChange(
      selectedList.filter((s) => s.toLowerCase() !== String(entryName).toLowerCase())
    );
  };

  const handleToggleEntry = (entryName) => {
    const clean = String(entryName || '').trim();
    if (!clean) return;
    if (selectedLowerSet.has(clean.toLowerCase())) {
      handleRemove(clean);
    } else {
      emitChange([...selectedList, clean]);
    }
  };

  const handleLaunchFullModal = () => {
    if (!resolvedOpenPicker) return;
    if (targetField) {
      resolvedOpenPicker({
        source: resolvedSource,
        target: targetField,
        label: label || catalogNoun,
        valueFormat: effectiveFormat,
        alsoSyncFields
      });
    } else {
      resolvedOpenPicker(resolvedSource);
    }
  };

  const topRecommendations = useMemo(
    () => rankedCandidates.filter((c) => c.synergy >= 3).slice(0, maxRecommendations),
    [rankedCandidates, maxRecommendations]
  );

  const categoryTabs =
    resolvedSource === 'skills'
      ? SKILL_CATEGORY_TABS
      : resolvedSource === 'features'
        ? FEATURE_CATEGORY_TABS
        : null;

  const showDiscountTag =
    isDiscountedFeaturePool ||
    (resolvedSource === 'features' &&
      (targetField === 'recommended_features' ||
        String(label || '').toLowerCase().includes('discount') ||
        String(label || '').toLowerCase().includes('recommended')));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>{label}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[9.5px] font-mono">
              {selectedList.length} selected
            </span>
          </label>
        )}

        {isEditMode && (
          <div className="flex flex-wrap items-center gap-1.5">
            {catalog.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCatalogOpen((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isCatalogOpen
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border-emerald-500/40 text-emerald-300'
                }`}
                title={`Browse interactive ${catalogNoun}`}
              >
                <BookOpen size={11} />
                <span>
                  {isCatalogOpen ? `Hide ${catalogNoun}` : `Browse ${catalogNoun} (${catalog.length})`}
                </span>
                {isCatalogOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}

            {resolvedOpenPicker && (
              <button
                type="button"
                onClick={handleLaunchFullModal}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                title={`Open full-screen Omnicortex ${catalogNoun} modal`}
              >
                <ExternalLink size={10} />
                <span>Full {catalogNoun}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[10.5px] text-slate-400 font-sans leading-snug">{helperText}</p>
      )}

      {/* Selected Chips */}
      <div className="min-h-[38px] p-2 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center gap-1.5">
        {selectedList.length === 0 ? (
          <span className="text-[11px] font-mono text-slate-500 px-1">None linked yet.</span>
        ) : (
          selectedList.map((entry) => (
            <span
              key={entry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border text-[11px] font-mono text-slate-100 shadow-sm"
              style={{ borderColor: `${accentColor}55` }}
            >
              <span>{entry}</span>
              {showDiscountTag && (
                <span className="text-[9px] text-emerald-400 font-mono">(-1 CP)</span>
              )}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemove(entry)}
                  className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title={`Remove ${entry}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Search & Quick-Add Input */}
      {isEditMode && (
        <div className="relative">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={query}
                onFocus={() => {
                  if (!isCatalogOpen) setIsDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 180)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!isCatalogOpen) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.preventDefault();
                    const exactMatch = rankedCandidates[0];
                    handleAdd(
                      exactMatch && query.length >= 2 ? exactMatch.name : query.trim()
                    );
                  }
                }}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {query.trim() && (
              <button
                type="button"
                onClick={() => handleAdd(query.trim())}
                className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown (when inline catalog drawer is collapsed) */}
          {!isCatalogOpen &&
            isDropdownOpen &&
            (query.trim().length > 0 || rankedCandidates.length > 0) && (
              <div className="absolute z-40 mt-1 w-full max-h-52 overflow-y-auto bg-slate-950/95 border border-slate-700/90 rounded-xl shadow-2xl p-1.5 space-y-0.5 backdrop-blur-md">
                {rankedCandidates.slice(0, 12).map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAdd(cand.name);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                        {cand.name}
                      </span>
                      {cand.synergy >= 3 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono shrink-0">
                          ★ Cortex Fit
                        </span>
                      )}
                      {cand.prereq && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-mono text-amber-300/90 truncate max-w-[160px]">
                          <ShieldAlert size={10} />
                          <span>{cand.prereq}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-400">
                      {cand.categoryLabel && <span>{cand.categoryLabel}</span>}
                      {showDiscountTag && cand.cp !== null ? (
                        <span className="text-emerald-300">
                          {Math.max(1, Number(cand.cp) - 1)} CP (-1)
                        </span>
                      ) : (
                        cand.cp !== null && (
                          <span className="text-amber-300">{cand.cp} CP</span>
                        )
                      )}
                    </div>
                  </button>
                ))}
                {rankedCandidates.length === 0 && query.trim() && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAdd(query.trim());
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-xs font-mono text-cyan-300 cursor-pointer"
                  >
                    + Add custom token "{query.trim()}"
                  </button>
                )}
              </div>
            )}
        </div>
      )}

      {/* Interactive Expandable Catalog Browser Drawer */}
      {isEditMode && isCatalogOpen && catalog.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-700/90 space-y-2.5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-300">
              <BookOpen size={12} className="text-emerald-400" />
              <span>Omnicortex {catalogNoun} Browser</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-normal">
                Click items to toggle selection ({filteredCatalogDrawerItems.length} matching)
              </span>
            </div>

            {showDiscountTag && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[9.5px] font-mono font-bold text-emerald-300">
                Recommended Folio Discount: -1 CP (3 CP → 2 CP)
              </span>
            )}
          </div>

          {categoryTabs && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1">
                {categoryTabs.map((tab) => {
                  const isActive = activeCategoryTab === tab.id;
                  const count =
                    tab.id === 'all'
                      ? enrichedCatalog.length
                      : tab.id === 'synergy'
                        ? drawerFilterStats.synergyCount
                        : drawerFilterStats.byTab[tab.id.toLowerCase()] || 0;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveCategoryTab(tab.id);
                        setActiveSubcategoryTab('all');
                        setShowAllCatalogItems(false);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              {resolvedSource === 'skills' && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {Array.isArray(SKILL_SUBCATEGORY_FILTERS[activeCategoryTab]) && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 mr-0.5">
                        Subcategory:
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSubcategoryTab('all')}
                        className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                          activeSubcategoryTab === 'all'
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All ({drawerFilterStats.byTab[activeCategoryTab.toLowerCase()] || 0})
                      </button>
                      {SKILL_SUBCATEGORY_FILTERS[activeCategoryTab].map((sub) => {
                        const subCount =
                          drawerFilterStats.bySub[
                            `${activeCategoryTab.toLowerCase()}:${sub.toLowerCase()}`
                          ] || 0;
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setActiveSubcategoryTab(sub)}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                              activeSubcategoryTab === sub
                                ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sub} ({subCount})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeCategoryTab !== 'groups' && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-0.5">
                        Ability:
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveAttrTab('all')}
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                          activeAttrTab === 'all'
                            ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All
                      </button>
                      {SKILL_ATTRIBUTE_FILTERS.map((attrCode) => (
                        <button
                          key={attrCode}
                          type="button"
                          onClick={() =>
                            setActiveAttrTab((prev) => (prev === attrCode ? 'all' : attrCode))
                          }
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                            activeAttrTab === attrCode
                              ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {attrCode} ({drawerFilterStats.byAttr[attrCode] || 0})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {visibleCatalogDrawerItems.length === 0 ? (
            <div className="py-3 text-center text-xs font-mono text-slate-500">
              No catalog entries match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {visibleCatalogDrawerItems.map((cand) => {
                const isSelected = selectedLowerSet.has(cand.name.toLowerCase());
                return (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => handleToggleEntry(cand.name)}
                    title={cand.description || cand.name}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400/80 text-emerald-100 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[11px] font-mono font-bold leading-tight flex items-center gap-1">
                        {isSelected ? (
                          <Check size={11} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Plus size={11} className="text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{cand.name}</span>
                      </span>
                      {showDiscountTag && cand.cp !== null ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 shrink-0">
                          {cand.isGroupItem ? 'GROUP (-1 CP)' : `${Math.max(1, Number(cand.cp) - 1)} CP`}
                        </span>
                      ) : cand.cp !== null ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-700 text-amber-300 shrink-0">
                          {cand.cp} CP
                        </span>
                      ) : cand.primaryAttrBadge ? (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            cand.isGroupItem
                              ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                              : 'bg-slate-950 border-slate-700 text-cyan-300'
                          }`}
                        >
                          {cand.primaryAttrBadge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[9.5px] font-mono text-slate-400">
                      <span className="truncate">
                        {cand.categoryLabel || cand.groupKey || 'Canonical'}
                      </span>
                      {cand.prereq && (
                        <span className="text-amber-300/90 truncate max-w-[110px]">
                          Req: {cand.prereq}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isFilteredView && filteredCatalogDrawerItems.length > 30 && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllCatalogItems((prev) => !prev)}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-300 cursor-pointer"
              >
                {showAllCatalogItems
                  ? 'Show Top 30 Entries'
                  : `Show All ${filteredCatalogDrawerItems.length} Entries`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Zero-Latency Cortex Synergy Suggestions */}
      {isEditMode && !isCatalogOpen && topRecommendations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mr-1">
            <Sparkles size={10} />
            <span>Cortex Suggested:</span>
          </span>
          {topRecommendations.map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => handleAdd(rec.name)}
              className="px-2 py-0.5 rounded-md bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/35 text-[10px] font-mono text-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
              title={
                rec.prereq
                  ? `Prerequisite: ${rec.prereq}`
                  : 'Recommended by Omnicortex Synergy Engine'
              }
            >
              <Plus size={9} />
              <span>{rec.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(CortexSmartPicker);
