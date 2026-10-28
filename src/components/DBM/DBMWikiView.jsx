import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useItemInteractions } from '../../utils/interactionUtils';
import { useDBM } from '../../context/DBMContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showToast } from '../../context/ToastContext';
import { 
  Users, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  Search, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Cpu, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  Globe, 
  Briefcase, 
  Tag, 
  GraduationCap, 
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  ChevronsDownUp,
  ArrowDown10,
  ArrowDownAZ
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { RingedPlanetLogo } from '../UI/RingedPlanetLogo';
import { USER_GUIDE_SECTIONS } from '../Guide/userGuideData';
import { UserGuideView } from '../Guide/UserGuideView';

const TreeArticleItem = ({
  item,
  isSelected,
  childrenCount,
  isExpanded,
  onToggleExpand,
  onSelect,
  onOpenEdit,
  className,
  prefix = '📜 ',
  subtitle = null,
  showChevronSlot = false
}) => {
  const interactions = useItemInteractions({
    onSelect,
    onOpenEdit,
    delay: 1500
  });

  const isPrimaryFaction = item.entry_type?.toLowerCase().includes('primary');
  const isGenericTemplate = item.entry_type?.toLowerCase().includes('generic');
  const hasChildren = childrenCount > 0;

  return (
    <div className="flex items-center gap-0.5 w-full min-w-0">
      {hasChildren && onToggleExpand ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id);
          }}
          className="w-[21px] h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
          title={isExpanded ? 'Collapse Sub-Articles' : `Expand ${childrenCount} Sub-Articles`}
          aria-label={isExpanded ? 'Collapse Sub-Articles' : 'Expand Sub-Articles'}
        >
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
      ) : showChevronSlot ? (
        <span
          onClick={onSelect}
          className="w-[21px] h-6 shrink-0 cursor-pointer"
          aria-hidden="true"
        />
      ) : null}
      <button
        {...interactions}
        className={className}
        title="Single-click to view article. Double-click (or long press 1.5s+ on mobile) to edit."
      >
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 text-slate-400">{prefix}</span>
            <span className="truncate">{item.name}</span>
          </div>
          {subtitle && (
            <span className="text-[9.5px] font-mono text-slate-400/90 truncate pl-4 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPrimaryFaction && (
            <span className="text-[8px] px-1 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded font-mono font-bold tracking-tight">
              PRIMARY
            </span>
          )}
          {isGenericTemplate && (
            <span className="text-[8px] px-1 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded font-mono font-bold tracking-tight">
              GENERIC
            </span>
          )}

        </div>
      </button>
    </div>
  );
};

const HierarchicalArticleNode = ({
  item,
  depth = 0,
  activeTab,
  activeArticle,
  childMap,
  descendantCountMap,
  expandedArticles,
  onToggleExpand,
  onSelectArticle,
  onOpenEdit,
  isAdmin,
  sortArticles,
  sortMode
}) => {
  const isSelected = activeArticle?.id === item.id;
  const rawChildren = childMap[item.id] || [];
  const children = useMemo(() => sortArticles(rawChildren, sortMode), [rawChildren, sortArticles, sortMode]);
  const totalDescendants = descendantCountMap[item.id] || children.length;
  const isExpanded = Boolean(expandedArticles[item.id]);

  const prefix = depth === 0
    ? (activeTab === 'operator' ? '📘 ' : '🏛️ ')
    : children.length > 0
    ? '📂 '
    : '↳ ';

  return (
    <div className="flex flex-col">
      <TreeArticleItem
        item={item}
        isSelected={isSelected}
        childrenCount={totalDescendants}
        isExpanded={isExpanded}
        onToggleExpand={children.length > 0 ? onToggleExpand : null}
        showChevronSlot={true}
        prefix={prefix}
        onSelect={() => {
          onSelectArticle(item);
          if (children.length > 0 && !expandedArticles[item.id]) {
            onToggleExpand(item.id);
          }
        }}
        onOpenEdit={() => isAdmin && onOpenEdit(item)}
        className={`flex-1 min-w-0 text-left px-2 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer border ${
          depth === 0 ? 'text-xs font-semibold' : 'text-[11px] font-medium'
        } ${
          isSelected
            ? activeTab === 'operator'
              ? 'bg-emerald-950/85 border-emerald-500/80 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold'
              : 'bg-amber-950/85 border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
            : depth === 0
            ? 'text-slate-200 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-800/80'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-transparent'
        }`}
      />

      {children.length > 0 && isExpanded && (
        <div
          className={`pl-2.5 my-0.5 flex flex-col gap-0.5 border-l-2 ml-3 ${
            activeTab === 'operator' ? 'border-emerald-500/30' : 'border-amber-500/30'
          }`}
        >
          {children.map(child => (
            <HierarchicalArticleNode
              key={child.id || child.name}
              item={child}
              depth={depth + 1}
              activeTab={activeTab}
              activeArticle={activeArticle}
              childMap={childMap}
              descendantCountMap={descendantCountMap}
              expandedArticles={expandedArticles}
              onToggleExpand={onToggleExpand}
              onSelectArticle={onSelectArticle}
              onOpenEdit={onOpenEdit}
              isAdmin={isAdmin}
              sortArticles={sortArticles}
              sortMode={sortMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getSectionIcon = (sectionName = '') => {
  const s = sectionName.toUpperCase();
  if (s.includes('SOURCE OF TRUTH') || s.includes('OPERATOR CORE')) return '📘';
  if (s.includes('ARCHITECT & MODULAR') || s.includes('ARCHITECT MATRICES')) return '🏛️';
  if (s.includes('SYSTEM') || s.includes('MANUAL')) return '⚙️';
  if (s.includes('CHARACTER CREATION')) return '👤';
  if (s.includes('SECONDARY FACTION') || s.includes('GENERIC') || s.includes('25 TEMPLATES')) return '🏛️';
  if (s.includes('PRIMARY FACTION') || s.includes('FACTION')) return '👑';
  if (s.includes('ORIGIN')) return '🌐';
  if (s.includes('OCCUPATION')) return '🎯';
  if (s.includes('SKILL')) return '📊';
  if (s.includes('FEATURE')) return '🛡️';
  if (s.includes('HINDRANCE')) return '⚠️';
  if (s.includes('COMBAT') || s.includes('TACTICAL')) return '⚔️';
  if (s.includes('METAPHYSIC')) return '🔮';
  if (s.includes('ECONOMATRIX') || s.includes('TECHNOLOGY')) return '📦';
  if (s.includes('WORLDBUILDING') || s.includes('ARCHITECTURE')) return '🏗️';
  if (s.includes('BESTIARY') || s.includes('ADVERSARY')) return '👾';
  if (s.includes('SPECIES')) return '🧬';
  return '📁';
};

const CANONICAL_SECTION_ALIASES = {
  '1.00 CHARACTER CREATION & ECONOMY': '1.00 CHARACTER CREATION & PROFILES',
  '1.04 PRIMARY FACTIONS (MAJOR POLITIES)': '1.04 FACTIONS & GALACTIC POLITIES',
  '4.00 METAPHYSICS': '4.00 METAPHYSICS & REALITY MANIPULATION',
  '4.00 METAPHYSICS & DISCIPLINES': '4.00 METAPHYSICS & REALITY MANIPULATION'
};

const SUBSECTION_PARENT_MAP = {
  '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)': '1.04 FACTIONS & GALACTIC POLITIES'
};

const CollapsibleSectionNode = ({
  section,
  level = 0,
  expandedSections,
  toggleSection,
  activeArticle,
  onSelectArticle,
  onOpenEdit,
  isAdmin,
  childMap,
  isSearching
}) => {
  const isExpanded = isSearching || Boolean(expandedSections[section.id]);
  const secIcon = getSectionIcon(section.name);
  const hasSubsections = section.subsections && section.subsections.length > 0;
  const hasDirectItems = section.items && section.items.length > 0;

  const isRoot = level === 0;
  const isSub = level === 1;
  const isTruthSec = section.name?.toUpperCase().includes('SOURCE OF TRUTH') || section.name?.toUpperCase().includes('OPERATOR CORE') || section.name?.toUpperCase().includes('ARCHITECT & MODULAR');

  return (
    <div className={`overflow-hidden transition-all ${
      isTruthSec
        ? 'bg-sky-950/30 rounded-lg border border-sky-500/60 mb-2 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
        : isRoot
        ? 'bg-slate-900/40 rounded-lg border border-slate-800/80 mb-1.5'
        : isSub
        ? 'ml-2 my-1 rounded-md border border-slate-800/70 bg-slate-950/70'
        : 'ml-2.5 my-1 rounded border border-slate-800/50 bg-slate-950/90'
    }`}>
      {/* Section Header Button */}
      <button
        type="button"
        onClick={() => toggleSection(section.id)}
        className={`w-full text-left transition-colors flex items-center justify-between border-b group cursor-pointer ${
          isTruthSec
            ? 'px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900/80 border-sky-500/50'
            : isRoot
            ? 'px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/80 border-slate-800/60'
            : isSub
            ? 'px-2 py-1.5 bg-slate-950/90 hover:bg-slate-900 border-slate-800/50'
            : 'px-2 py-1 bg-slate-950 hover:bg-slate-900/90 border-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <span className={`transition-colors ${
            isTruthSec ? 'text-sky-300 group-hover:text-white' : isRoot ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-amber-400'
          }`}>
            {isExpanded ? <ChevronDown size={isRoot ? 13 : 12} /> : <ChevronRight size={isRoot ? 13 : 12} />}
          </span>
          <span className={`${isRoot ? 'text-sm' : 'text-xs'} shrink-0`}>{secIcon}</span>
          <span className={`truncate font-mono font-bold uppercase tracking-wider ${
            isTruthSec
              ? 'text-xs text-sky-200 group-hover:text-white font-extrabold'
              : isRoot
              ? 'text-xs text-cyan-300 group-hover:text-cyan-200'
              : isSub
              ? 'text-[11px] text-amber-300/90 group-hover:text-amber-200'
              : 'text-[10px] text-slate-300 group-hover:text-slate-100'
          }`}>
            {section.name.replace(/\s*\(SOURCE OF TRUTH\)/gi, '')}
          </span>
        </div>

        <span
          className={`font-mono font-bold shrink-0 ${
            isTruthSec
              ? 'text-[10px] px-1.5 py-0.2 rounded bg-sky-900/90 text-sky-200 border border-sky-400/50'
              : isRoot
              ? 'text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-300'
              : isSub
              ? 'text-[9px] px-1 py-0.2 rounded bg-amber-950/60 text-amber-300/90 border border-amber-500/30'
              : 'text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800'
          }`}
          title={`${section.directCount} direct article${section.directCount === 1 ? '' : 's'}${hasSubsections ? `, ${section.totalCount} total in section` : ''}`}
        >
          {section.totalCount}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`p-1 space-y-0.5 ${!isRoot ? 'border-l-2 border-slate-800/80 ml-1.5' : ''}`}>
          {/* Direct Articles */}
          {hasDirectItems && section.items.map(item => {
            const isSelected = activeArticle?.id === item.id;
            const children = childMap[item.id] || childMap[item.name?.toLowerCase()] || [];

            return (
              <div key={item.id || item.name} className="flex flex-col">
                <TreeArticleItem
                  item={item}
                  isSelected={isSelected}
                  childrenCount={children.length}
                  prefix="• "
                  onSelect={() => onSelectArticle(item)}
                  onOpenEdit={() => isAdmin && onOpenEdit(item)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 border border-cyan-500/70 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.25)] font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                />

                {/* Sub-articles */}
                {children.length > 0 && (
                  <div className="pl-3 my-0.5 flex flex-col gap-0.5 border-l-2 border-cyan-500/30 ml-3">
                    {children.map(child => {
                      const isChildSelected = activeArticle?.id === child.id;
                      return (
                        <TreeArticleItem
                          key={child.id || child.name}
                          item={child}
                          isSelected={isChildSelected}
                          childrenCount={0}
                          prefix="↳ "
                          onSelect={() => onSelectArticle(child)}
                          onOpenEdit={() => isAdmin && onOpenEdit(child)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                            isChildSelected
                              ? 'text-cyan-200 font-bold bg-cyan-900/50 border border-cyan-500/50'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Nested Subsections */}
          {hasSubsections && section.subsections.map(sub => (
            <CollapsibleSectionNode
              key={sub.id}
              section={sub}
              level={level + 1}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              activeArticle={activeArticle}
              onSelectArticle={onSelectArticle}
              onOpenEdit={onOpenEdit}
              isAdmin={isAdmin}
              childMap={childMap}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DBMWikiView = ({
  currentConfig,
  handleCreateNew,
  currentItems,
  handleOpenItem,
  isAdmin = true,
  handleDeleteEntry,
  handleDuplicateEntry
}) => {
  const confirm = useConfirm();
  const [selectedArticleId, setSelectedArticleId] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('article') || urlParams.get('id') || null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.innerWidth < 768 ? false : localStorage.getItem('compendium_rail_drawer_open') !== 'false';
    } catch {
      return true;
    }
  });

  const OP_PARENT = '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)';
  const ARCH_PARENT = '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)';

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'operator';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('guide') || urlParams.get('tab') === 'guide') {
        return 'guide';
      }
      const saved = localStorage.getItem('compendium_active_tab');
      return (saved === 'architect' || saved === 'guide') ? saved : 'operator';
    } catch {
      return 'operator';
    }
  });

  const [activeGuideSectionId, setActiveGuideSectionId] = useState(() => {
    if (typeof window === 'undefined') return 'intro';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gParam = urlParams.get('guide');
      if (gParam && USER_GUIDE_SECTIONS.some(s => s.id === gParam)) {
        return gParam;
      }
      return localStorage.getItem('compendium_active_guide_section') || 'intro';
    } catch {
      return 'intro';
    }
  });

  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);

  const sortMode = 'order';

  const [expandedSections, setExpandedSections] = useState({
    [OP_PARENT]: true,
    [ARCH_PARENT]: true
  });

  const [expandedArticles, setExpandedArticles] = useState({});

  const toggleDrawer = () => {
    AudioService?.playTerminalBeep?.(1050, 0.02);
    setIsDrawerOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('compendium_rail_drawer_open', String(next));
      } catch {}
      return next;
    });
  };

  const toggleSection = (secId) => {
    setExpandedSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  const toggleArticleExpand = useCallback((articleId) => {
    if (!articleId) return;
    AudioService?.playTerminalBeep?.(1080, 0.015);
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  }, []);

  // Build hierarchical Source of Truth section trees (Operator & Architect)
  const {
    sections,
    childMap,
    descendantCountMap,
    itemByIdMap,
    allArticlesFlat,
    articleAncestorsMap,
    allSectionIds
  } = useMemo(() => {
    const rawItems = currentItems || [];

    // Strictly keep only canonical 1.00 Operator and 5.00 Architect articles (excluding legacy architect archetypes)
    const sourceOfTruthItems = rawItems
      .filter(item => {
        const id = (item.id || '').toLowerCase();
        const sub = (item.subfolder || item.relPath || '').toLowerCase();
        if (
          id.startsWith('doc-architect-99-archetypes') ||
          sub.startsWith('architect/archetypes') ||
          (id.startsWith('doc-architect-') && (item.name || '').toUpperCase().includes('ARCHETYPES'))
        ) {
          return false;
        }
        return id.startsWith('doc-operator-') || id.startsWith('doc-architect-');
      })
      .map(item => {
        const id = (item.id || '').toLowerCase();
        const isArchItem = id.startsWith('doc-architect-') || item.perspective === 'architect' || item.category === 'architect_matrix';
        if (isArchItem && item.name) {
          const cleanName = item.name.replace(/^(?:02|99\.?|\d+(?:\.\d+)*\.?)\s*[-—:]?\s*/, '').trim();
          if (cleanName && cleanName !== item.name) {
            return { ...item, name: cleanName };
          }
        }
        return item;
      });

    const itemMap = new Map();
    sourceOfTruthItems.forEach(item => {
      if (item.id) {
        itemMap.set(item.id, item);
        itemMap.set(item.id.toLowerCase(), item);
      }
      if (item.name) itemMap.set(item.name.toLowerCase(), item);
    });

    const children = {};
    const sectionMap = {
      [OP_PARENT]: [],
      [ARCH_PARENT]: []
    };

    sourceOfTruthItems.forEach(item => {
      let p = (item.parent || '').trim();

      // Check if parent is an actual parent article in the compendium
      const parentArticle = (p !== OP_PARENT && p !== ARCH_PARENT)
        ? (itemMap.get(p) || itemMap.get(p.toLowerCase()))
        : null;

      if (parentArticle && parentArticle.id !== item.id) {
        if (!children[parentArticle.id]) children[parentArticle.id] = [];
        children[parentArticle.id].push(item);
        return;
      }

      if (p !== OP_PARENT && p !== ARCH_PARENT) {
        if (item.id?.startsWith('doc-architect-') || item.category === 'architect_matrix' || item.perspective === 'architect') {
          p = ARCH_PARENT;
        } else {
          p = OP_PARENT;
        }
      }

      if (!sectionMap[p]) sectionMap[p] = [];
      sectionMap[p].push(item);
    });

    // Compute recursive descendant count for each parent article
    const descCounts = {};
    const countDescendants = (artId, visited = new Set()) => {
      if (visited.has(artId)) return 0;
      visited.add(artId);
      const direct = children[artId] || [];
      let total = direct.length;
      for (const ch of direct) {
        total += countDescendants(ch.id, visited);
      }
      descCounts[artId] = total;
      return total;
    };
    sourceOfTruthItems.forEach(item => {
      if (item.id && children[item.id]) {
        countDescendants(item.id);
      }
    });

    // Exactly 2 canonical root sections
    const rootSections = [
      {
        id: OP_PARENT,
        name: OP_PARENT,
        isSection: true,
        items: sectionMap[OP_PARENT] || [],
        subsections: [],
        directCount: (sectionMap[OP_PARENT] || []).length,
        totalCount: sourceOfTruthItems.filter(i => i.id?.startsWith('doc-operator-') || i.perspective === 'operator').length,
        count: (sectionMap[OP_PARENT] || []).length
      },
      {
        id: ARCH_PARENT,
        name: ARCH_PARENT,
        isSection: true,
        items: sectionMap[ARCH_PARENT] || [],
        subsections: [],
        directCount: (sectionMap[ARCH_PARENT] || []).length,
        totalCount: sourceOfTruthItems.filter(i => i.id?.startsWith('doc-architect-') || i.perspective === 'architect' || i.category === 'architect_matrix').length,
        count: (sectionMap[ARCH_PARENT] || []).length
      }
    ].filter(sec => sec.totalCount > 0);

    const ancestorsMap = {};
    const allSecIds = rootSections.map(s => s.id);
    sourceOfTruthItems.forEach(item => {
      const chain = [];
      let curr = item;
      const seen = new Set();
      while (curr && curr.parent && !seen.has(curr.parent)) {
        seen.add(curr.parent);
        const parentArt = itemMap.get(curr.parent) || itemMap.get(String(curr.parent).toLowerCase());
        if (parentArt && parentArt.id !== curr.id) {
          chain.unshift(parentArt.id);
          curr = parentArt;
        } else {
          break;
        }
      }
      ancestorsMap[item.id] = chain;
    });

    return {
      sections: rootSections,
      childMap: children,
      descendantCountMap: descCounts,
      itemByIdMap: itemMap,
      allArticlesFlat: sourceOfTruthItems,
      articleAncestorsMap: ancestorsMap,
      allSectionIds: allSecIds
    };
  }, [currentItems]);

  // Separate all articles cleanly into Operator and Architect
  const operatorArticles = useMemo(() => {
    return (allArticlesFlat || []).filter(item => {
      const p = (item.parent || '').trim();
      const id = (item.id || '').toLowerCase();
      return p === OP_PARENT || id.startsWith('doc-operator-') || item.perspective === 'operator';
    });
  }, [allArticlesFlat]);

  const architectArticles = useMemo(() => {
    return (allArticlesFlat || []).filter(item => {
      const p = (item.parent || '').trim();
      const id = (item.id || '').toLowerCase();
      return p === ARCH_PARENT || id.startsWith('doc-architect-') || item.category === 'architect_matrix' || item.perspective === 'architect';
    });
  }, [allArticlesFlat]);

  // Top-level root master articles for tree view
  const operatorMasterArticles = useMemo(() => {
    return operatorArticles.filter(item => {
      const p = (item.parent || '').trim();
      return p === OP_PARENT || item.isMasterDoc || !itemByIdMap.has(p);
    });
  }, [operatorArticles, itemByIdMap]);

  const architectMasterArticles = useMemo(() => {
    return architectArticles.filter(item => {
      const p = (item.parent || '').trim();
      return p === ARCH_PARENT || item.isMasterDoc || !itemByIdMap.has(p);
    });
  }, [architectArticles, itemByIdMap]);

  const opCount = operatorArticles.length;
  const archCount = architectArticles.length;

  // Sorting helper: Canonical numerical order vs Alphabetical A-Z
  const sortArticles = useCallback((items, mode) => {
    const list = [...(items || [])];
    if (mode === 'alpha') {
      list.sort((a, b) => {
        const titleA = (a.name || '').replace(/^[\d.]+\s*[-—:]?\s*/, '').trim().toLowerCase();
        const titleB = (b.name || '').replace(/^[\d.]+\s*[-—:]?\s*/, '').trim().toLowerCase();
        return titleA.localeCompare(titleB);
      });
    } else {
      list.sort((a, b) => {
        const orderA = Number(a.order);
        const orderB = Number(b.order);
        const hasOrderA = !isNaN(orderA) && a.order !== undefined && a.order !== null;
        const hasOrderB = !isNaN(orderB) && b.order !== undefined && b.order !== null;
        if (hasOrderA && hasOrderB && orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true });
      });
    }
    return list;
  }, []);

  // Tab Switching Handler
  const handleTabClick = (tabKey) => {
    AudioService?.playTerminalBeep?.(1150, 0.02);
    setActiveTab(tabKey);
    try {
      localStorage.setItem('compendium_active_tab', tabKey);
    } catch {}

    // Ensure drawer is open when switching/clicking tabs
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
      try {
        localStorage.setItem('compendium_rail_drawer_open', 'true');
      } catch {}
    }

    if (tabKey === 'guide') {
      return;
    }

    // If currently selected article is not in the new tab, select the first master article of the new tab
    const targetArticles = tabKey === 'operator' ? operatorArticles : architectArticles;
    const isCurrentInTab = targetArticles.some(a => a.id === activeArticle?.id);
    if (!isCurrentInTab && targetArticles.length > 0) {
      const sorted = sortArticles(targetArticles, sortMode);
      if (sorted.length > 0) {
        setSelectedArticleId(sorted[0].id);
      }
    }
  };

  // Filtered Guide sections when activeTab === 'guide'
  const filteredGuideSections = useMemo(() => {
    if (!searchQuery.trim()) return USER_GUIDE_SECTIONS;
    const q = searchQuery.toLowerCase().trim();
    return USER_GUIDE_SECTIONS.filter(sec => {
      const titleMatch = (sec.title || '').toLowerCase().includes(q) || (sec.fullTitle || '').toLowerCase().includes(q);
      const badgeMatch = (sec.badge || '').toLowerCase().includes(q);
      const leadMatch = (sec.lead || '').toLowerCase().includes(q);
      const sixWMatch = sec.sixW?.some(w => w.toLowerCase().includes(q));
      const sectionMatch = sec.sections?.some(s => s.heading?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q));
      return titleMatch || badgeMatch || leadMatch || sixWMatch || sectionMatch;
    });
  }, [searchQuery]);

  // Active articles for the selected tab
  const currentTabRawArticles = useMemo(() => {
    return activeTab === 'operator' ? operatorArticles : architectArticles;
  }, [activeTab, operatorArticles, architectArticles]);

  const currentTabMasterArticles = useMemo(() => {
    const rawMasters = activeTab === 'operator' ? operatorMasterArticles : architectMasterArticles;
    return sortArticles(rawMasters, sortMode);
  }, [activeTab, operatorMasterArticles, architectMasterArticles, sortMode, sortArticles]);

  const sortedCurrentTabArticles = useMemo(() => {
    return sortArticles(currentTabRawArticles, sortMode);
  }, [currentTabRawArticles, sortMode, sortArticles]);

  const filteredTabArticles = useMemo(() => {
    if (!searchQuery.trim()) return sortedCurrentTabArticles;
    const q = searchQuery.toLowerCase().trim();
    return sortedCurrentTabArticles.filter(item => {
      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const fileMatch = (item.fileName || '').toLowerCase().includes(q);
      const descMatch = (item.description || item.body || '').toLowerCase().includes(q);
      const typeMatch = (item.entry_type || '').toLowerCase().includes(q);
      const noteMatch = (item.note || '').toLowerCase().includes(q);
      const tagMatch = Array.isArray(item.tags)
        ? item.tags.some(t => String(t).toLowerCase().includes(q))
        : typeof item.tags === 'string' && item.tags.toLowerCase().includes(q);
      return nameMatch || fileMatch || descMatch || typeMatch || noteMatch || tagMatch;
    });
  }, [sortedCurrentTabArticles, searchQuery]);

  // Check if search matches items in the other tab
  const otherTabMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const otherArticles = activeTab === 'operator' ? architectArticles : operatorArticles;
    return otherArticles.filter(item => {
      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const fileMatch = (item.fileName || '').toLowerCase().includes(q);
      const descMatch = (item.description || item.body || '').toLowerCase().includes(q);
      const typeMatch = (item.entry_type || '').toLowerCase().includes(q);
      return nameMatch || fileMatch || descMatch || typeMatch;
    });
  }, [searchQuery, activeTab, operatorArticles, architectArticles]);

  const desktopContentRef = useRef(null);
  const mobileContentRef = useRef(null);

  // Handle article selection and auto-sync activeTab with the selected article
  const handleSelectArticle = (itemOrId) => {
    if (!itemOrId) return;
    const item = typeof itemOrId === 'string'
      ? (allArticlesFlat || []).find(a => a.id === itemOrId || a.name === itemOrId)
      : itemOrId;
    if (!item) return;

    setSelectedArticleId(item.id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }

    // Auto-expand ancestor folders for this article
    const ancestors = articleAncestorsMap[item.id] || [];
    if (ancestors.length > 0) {
      setExpandedArticles(prev => {
        const next = { ...prev };
        ancestors.forEach(ancId => {
          next[ancId] = true;
        });
        return next;
      });
    }

    // Auto-sync activeTab with the selected article
    const itemPerspective = (item.parent === ARCH_PARENT || item.id?.startsWith('doc-architect-') || item.category === 'architect_matrix' || item.perspective === 'architect')
      ? 'architect'
      : 'operator';

    if (activeTab !== itemPerspective) {
      setActiveTab(itemPerspective);
      try {
        localStorage.setItem('compendium_active_tab', itemPerspective);
      } catch {}
    }
  };

  // Resolve relative markdown links (e.g. ./species/Aeld/1.03.Aeld.Alterian.md) and [[wiki:...]] links to Compendium articles
  const resolveMarkdownHrefToArticle = useCallback((href) => {
    if (!href || typeof href !== 'string') return null;
    const trimmed = href.trim();
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return null;

    if (trimmed.startsWith('wiki:')) {
      const rawTarget = trimmed.replace('wiki:', '').trim();
      const targetName = rawTarget.toLowerCase().replace(/\.md$/i, '');
      // 1. Exact match on name, id, fileName, or stripped title
      const exact = (allArticlesFlat || []).find(item => {
        const n = (item.name || '').toLowerCase();
        const id = (item.id || '').toLowerCase();
        const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
        const stripped = n.replace(/^[\d.a-z_-]+\s*[—\-:]\s*/i, '').trim();
        return n === targetName || id === targetName || fn === targetName || stripped === targetName;
      });
      if (exact) return exact;

      // 2. Substring match on name or fileName
      if (targetName.length >= 3) {
        return (allArticlesFlat || []).find(item => {
          const n = (item.name || '').toLowerCase();
          const fn = (item.fileName || '').toLowerCase().replace(/\.md$/i, '');
          return n.includes(targetName) || fn.includes(targetName);
        }) || null;
      }
      return null;
    }

    // Strip hash/query and decode URI
    const withoutHash = decodeURIComponent(trimmed.split('#')[0].split('?')[0]).replace(/\\/g, '/');
    if (!withoutHash.toLowerCase().endsWith('.md')) return null;

    const baseFileName = withoutHash.split('/').pop().toLowerCase();
    const cleanRel = withoutHash.replace(/^(\.\/|\.\.\/)+/, '').toLowerCase();
    const slugCandidate = baseFileName.replace(/\.md$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    return (allArticlesFlat || []).find(item => {
      if (item.fileName && item.fileName.toLowerCase() === baseFileName) return true;
      if (item.relPath && item.relPath.toLowerCase().endsWith(cleanRel)) return true;
      if (item.id && (item.id.toLowerCase().endsWith(`-${slugCandidate}`) || item.id.toLowerCase() === slugCandidate)) return true;
      return false;
    }) || null;
  }, [allArticlesFlat]);

  const handleJumpToArticle = (targetName) => {
    const raw = (targetName || '').trim();
    const mdResolved = resolveMarkdownHrefToArticle(raw.startsWith('wiki:') ? raw : `wiki:${raw}`) || resolveMarkdownHrefToArticle(raw);
    if (mdResolved) {
      handleNavigateArticle(mdResolved);
      return;
    }
    const q = raw.toLowerCase();
    const targetItem = (allArticlesFlat || []).find(item => {
      const n = (item.name || '').toLowerCase();
      const fn = (item.fileName || '').toLowerCase();
      return n === q || fn === q || n.endsWith(` ${q}`) || n.includes(q);
    });
    if (targetItem) {
      handleNavigateArticle(targetItem);
    } else {
      showToast({
        type: 'info',
        title: 'Article Not Found',
        text: `Wiki article "${targetName}" does not exist yet.`
      });
    }
  };

  const handleCopyBracketLink = (article) => {
    if (!article) return;
    const bracketStr = `[[${article.name}]]`;
    navigator.clipboard?.writeText(bracketStr);
    AudioService?.playTerminalBeep?.(1350, 0.02);
    showToast({
      type: 'success',
      title: 'Bracket Hyperlink Copied',
      text: `Copied ${bracketStr} to clipboard.`
    });
  };

  // Active selected article object
  const activeArticle = useMemo(() => {
    if (!allArticlesFlat || allArticlesFlat.length === 0) return null;
    if (selectedArticleId) {
      const found = allArticlesFlat.find(item => item.id === selectedArticleId || item.name === selectedArticleId);
      if (found) return found;
    }
    // Default to first article of active tab
    const tabArticles = activeTab === 'operator' ? operatorMasterArticles : architectMasterArticles;
    if (tabArticles && tabArticles.length > 0) {
      const sorted = sortArticles(tabArticles, sortMode);
      return sorted[0] || tabArticles[0];
    }
    return allArticlesFlat[0];
  }, [allArticlesFlat, selectedArticleId, activeTab, operatorMasterArticles, architectMasterArticles, sortMode, sortArticles]);

  // Keep activeTab and ancestor expansion in sync when activeArticle changes
  useEffect(() => {
    if (activeArticle && activeTab !== 'guide') {
      const itemPerspective = (activeArticle.parent === ARCH_PARENT || activeArticle.id?.startsWith('doc-architect-') || activeArticle.category === 'architect_matrix' || activeArticle.perspective === 'architect')
        ? 'architect'
        : 'operator';
      if (activeTab !== itemPerspective) {
        setActiveTab(itemPerspective);
      }

      const ancestors = articleAncestorsMap[activeArticle.id] || [];
      if (ancestors.length > 0) {
        setExpandedArticles(prev => {
          const needsUpdate = ancestors.some(id => !prev[id]);
          if (!needsUpdate) return prev;
          const next = { ...prev };
          ancestors.forEach(id => {
            next[id] = true;
          });
          return next;
        });
      }
    }
  }, [activeArticle?.id, activeTab, articleAncestorsMap]);

  // Expand All / Collapse All handler for the active tab's parent articles
  const expandableTabParentIds = useMemo(() => {
    return (currentTabRawArticles || [])
      .filter(a => (childMap[a.id] || []).length > 0)
      .map(a => a.id);
  }, [currentTabRawArticles, childMap]);

  const areAllTabParentsExpanded = useMemo(() => {
    if (expandableTabParentIds.length === 0) return false;
    return expandableTabParentIds.every(id => Boolean(expandedArticles[id]));
  }, [expandableTabParentIds, expandedArticles]);

  const toggleExpandAllTabArticles = () => {
    AudioService?.playTerminalBeep?.(1080, 0.02);
    const shouldExpand = !areAllTabParentsExpanded;
    setExpandedArticles(prev => {
      const next = { ...prev };
      expandableTabParentIds.forEach(id => {
        next[id] = shouldExpand;
      });
      return next;
    });
  };

  // Sequential reading order within the active tab
  const currentIndex = useMemo(() => {
    if (!activeArticle || !sortedCurrentTabArticles.length) return -1;
    return sortedCurrentTabArticles.findIndex(a => a.id === activeArticle.id);
  }, [activeArticle, sortedCurrentTabArticles]);

  const prevArticle = currentIndex > 0 ? sortedCurrentTabArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < sortedCurrentTabArticles.length - 1 ? sortedCurrentTabArticles[currentIndex + 1] : null;

  // Cross-tab continuous reading bridging
  const crossTabPrev = useMemo(() => {
    if (activeTab === 'guide') {
      const gIndex = USER_GUIDE_SECTIONS.findIndex(s => s.id === activeGuideSectionId);
      if (gIndex > 0) {
        return USER_GUIDE_SECTIONS[gIndex - 1];
      }
      // If at start of Guide (Intro), link back to last Architect article!
      if (architectArticles.length > 0) {
        const sortedArch = sortArticles(architectArticles, sortMode);
        return sortedArch[sortedArch.length - 1] || null;
      }
      return null;
    }
    if (prevArticle) return prevArticle;
    if (activeTab === 'architect' && operatorArticles.length > 0 && !searchQuery.trim()) {
      const sortedOp = sortArticles(operatorArticles, sortMode);
      return sortedOp[sortedOp.length - 1] || null;
    }
    return null;
  }, [prevArticle, activeTab, operatorArticles, architectArticles, activeGuideSectionId, sortMode, sortArticles, searchQuery]);

  const crossTabNext = useMemo(() => {
    if (activeTab === 'guide') {
      const gIndex = USER_GUIDE_SECTIONS.findIndex(s => s.id === activeGuideSectionId);
      if (gIndex >= 0 && gIndex < USER_GUIDE_SECTIONS.length - 1) {
        return USER_GUIDE_SECTIONS[gIndex + 1];
      }
      return null;
    }
    if (nextArticle) return nextArticle;
    if (activeTab === 'operator' && architectArticles.length > 0 && !searchQuery.trim()) {
      const sortedArch = sortArticles(architectArticles, sortMode);
      return sortedArch[0] || null;
    }
    // If at end of Architect tab, transition seamlessly to User Guide Intro!
    if (activeTab === 'architect' && !searchQuery.trim()) {
      return USER_GUIDE_SECTIONS[0]; // Transition to User Guide Intro!
    }
    return null;
  }, [nextArticle, activeTab, architectArticles, sortMode, sortArticles, searchQuery, activeGuideSectionId]);

  const currentPrevArticle = prevArticle || crossTabPrev;
  const currentNextArticle = nextArticle || crossTabNext;

  const handleNavigateArticle = (targetArticle) => {
    if (!targetArticle) return;
    if (targetArticle.id && USER_GUIDE_SECTIONS.some(s => s.id === targetArticle.id)) {
      setActiveTab('guide');
      setActiveGuideSectionId(targetArticle.id);
      if (typeof window !== 'undefined' && window.innerWidth < 768) setIsDrawerOpen(false);
      try {
        localStorage.setItem('compendium_active_tab', 'guide');
        localStorage.setItem('compendium_active_guide_section', targetArticle.id);
      } catch {}
      return;
    }
    handleSelectArticle(targetArticle);
    if (desktopContentRef.current) {
      desktopContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mobileContentRef.current) {
      mobileContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation shortcuts (Alt+ArrowLeft / Alt+ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentPrevArticle) handleNavigateArticle(currentPrevArticle);
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentNextArticle) handleNavigateArticle(currentNextArticle);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPrevArticle, currentNextArticle]);

  const isFullRulebook = useMemo(() => {
    if (!activeArticle) return false;
    if (activeArticle.isMasterDoc !== undefined) {
      return Boolean(activeArticle.isMasterDoc);
    }
    return activeArticle.parent === OP_PARENT || activeArticle.parent === ARCH_PARENT;
  }, [activeArticle]);

  const activeAncestorDocs = useMemo(() => {
    if (!activeArticle) return [];
    const ids = articleAncestorsMap[activeArticle.id] || [];
    return ids.map(id => itemByIdMap.get(id)).filter(Boolean);
  }, [activeArticle, articleAncestorsMap, itemByIdMap]);

  const matchingMasterDoc = useMemo(() => {
    if (!activeArticle || !allArticlesFlat || isFullRulebook) return null;

    if (activeArticle.masterDocId && activeArticle.masterDocId !== activeArticle.id) {
      const byMasterId = itemByIdMap.get(activeArticle.masterDocId);
      if (byMasterId) return byMasterId;
    }
    if (activeArticle.parent && activeArticle.parent !== activeArticle.id) {
      const byParentId = itemByIdMap.get(activeArticle.parent);
      if (byParentId) return byParentId;
    }

    const id = activeArticle.id || '';
    const parent = (activeArticle.parent || '').toLowerCase();

    let targetDocId = null;
    if (id.startsWith('3-') || parent.includes('combat')) targetDocId = 'doc-operator-3-00-combat';
    else if (id.startsWith('1-04') || parent.includes('faction')) targetDocId = 'doc-operator-1-04-factions';
    else if (id.startsWith('1-05') || parent.includes('origin')) targetDocId = 'doc-operator-1-05-origins';
    else if (id.startsWith('1-06') || parent.includes('occupation')) targetDocId = 'doc-operator-1-06-occupations';
    else if (id.startsWith('1-07') || parent.includes('skill')) targetDocId = 'doc-operator-1-07-skills';
    else if (id.startsWith('1-08') || parent.includes('feature')) targetDocId = 'doc-operator-1-08-features';
    else if (id.startsWith('1-09') || parent.includes('hindrance')) targetDocId = 'doc-operator-1-09-hindrances';
    else if (id.startsWith('1-10') || parent.includes('scaling')) targetDocId = 'doc-operator-1-10-scaling';
    else if (id.startsWith('2-') || parent.includes('economatrix') || parent.includes('wealth')) targetDocId = 'doc-operator-2-00-economatrix';
    else if (id.startsWith('4-') || parent.includes('metaphysic')) targetDocId = 'doc-operator-4-00-metaphysics';
    else if (id.startsWith('1-01') || parent.includes('character creation')) targetDocId = 'doc-operator-1-01-character-creation';
    else if (id.startsWith('1-02') || parent.includes('archetype')) targetDocId = 'doc-operator-1-02-archetypes';
    else if (id.startsWith('1-03') || parent.includes('species')) targetDocId = 'doc-operator-1-03-species';
    else if (id.startsWith('0-') || parent.includes('manual') || parent.includes('system')) targetDocId = 'doc-operator-1-00-introduction';
    else if (id.startsWith('5-') || parent.includes('architect') || parent.includes('worldbuilding')) targetDocId = 'doc-architect-99-technology';

    if (targetDocId && targetDocId !== activeArticle.id) {
      return itemByIdMap.get(targetDocId) || null;
    }
    return null;
  }, [activeArticle, allArticlesFlat, isFullRulebook, itemByIdMap]);

  const activeParentDoc = useMemo(() => {
    if (!activeArticle || !activeArticle.parent) return null;
    const pDoc = itemByIdMap.get(activeArticle.parent);
    if (pDoc && pDoc.id !== activeArticle.id && pDoc.id !== matchingMasterDoc?.id) {
      return pDoc;
    }
    return null;
  }, [activeArticle, itemByIdMap, matchingMasterDoc]);

  const activeDirectChildren = useMemo(() => {
    if (!activeArticle) return [];
    const list = childMap[activeArticle.id] || [];
    return sortArticles(list, sortMode);
  }, [activeArticle, childMap, sortArticles, sortMode]);

  // Pre-process inter-wiki links [[Article Name]] and [[Display Label|Target]]
  const preProcessWikiText = (text) => {
    if (!text) return '';
    return text
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, label, target) => `[${label.trim()}](wiki:${target.trim()})`)
      .replace(/\[\[([^\]]+)\]\]/g, (_, target) => `[${target.trim()}](wiki:${target.trim()})`);
  };

  // Render Inter-Wiki Links for plain text notes / mechanics
  const renderWikiContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\[[^\]]+\]\])/g);

    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const inner = part.slice(2, -2).trim();
        const [labelPart, targetPart] = inner.includes('|') ? inner.split('|').map(s => s.trim()) : [inner, inner];
        const targetName = targetPart || labelPart;
        const displayLabel = labelPart || targetName;
        const targetItem = resolveMarkdownHrefToArticle(`wiki:${targetName}`);

        return (
          <button
            key={i}
            onClick={() => handleJumpToArticle(targetName)}
            className="text-cyan-400 hover:text-cyan-200 font-bold underline px-1 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30 transition-all cursor-pointer inline-block"
            title={targetItem ? `Jump to article "${targetItem.name}"` : `Jump to "${targetName}"`}
          >
            📖 {displayLabel}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const MarkdownComponents = {
    a: ({ node, href, children, ...props }) => {
      const targetArticle = resolveMarkdownHrefToArticle(href);
      if (targetArticle) {
        return (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateArticle(targetArticle);
            }}
            className="text-cyan-300 hover:text-white font-bold underline px-1.5 py-0.5 bg-cyan-950/60 hover:bg-cyan-900/80 rounded border border-cyan-500/40 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
            title={`Open Compendium Article: ${targetArticle.name}`}
          >
            <span>📖</span>
            <span>{children}</span>
          </button>
        );
      }
      if (href && href.startsWith('wiki:')) {
        const targetName = href.replace('wiki:', '').trim();
        return (
          <button
            type="button"
            onClick={() => handleJumpToArticle(targetName)}
            className="text-cyan-400 hover:text-cyan-200 font-bold underline px-1.5 py-0.5 bg-cyan-950/60 rounded border border-cyan-500/40 transition-all cursor-pointer inline-block shadow-sm"
            title={`Jump to article "${targetName}"`}
          >
            📖 {children}
          </button>
        );
      }
      return <a href={href} className="text-cyan-400 hover:text-cyan-200 underline font-semibold transition-colors" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4 pb-2 border-b border-slate-700/80 uppercase tracking-wide font-sans" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-cyan-300 mt-5 mb-3 uppercase tracking-wide" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-amber-300 mt-4 mb-2 uppercase tracking-wider" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-sm font-bold text-slate-200 mt-3 mb-1 uppercase tracking-wider" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-slate-300" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1.5 text-slate-300" {...props} />,
    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
    p: ({node, ...props}) => <p className="my-3 leading-relaxed text-slate-300" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyan-500/80 bg-cyan-950/30 pl-4 py-2 my-3 italic text-cyan-200 rounded-r" {...props} />,
    hr: ({node, ...props}) => <hr className="my-6 border-slate-800" {...props} />,
    table: ({node, ...props}) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-cyan-900/60 shadow-md">
        <table className="w-full text-left border-collapse text-xs" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => (
      <thead className="bg-slate-950 text-cyan-300 uppercase tracking-wider font-mono border-b border-cyan-800/60 text-[11px]" {...props} />
    ),
    th: ({node, ...props}) => (
      <th className="p-2.5 font-bold border-r border-slate-800 last:border-r-0 whitespace-nowrap" {...props} />
    ),
    tbody: ({node, ...props}) => (
      <tbody className="divide-y divide-slate-800/60 bg-slate-900/80" {...props} />
    ),
    tr: ({node, ...props}) => (
      <tr className="hover:bg-slate-800/50 transition-colors even:bg-slate-950/40" {...props} />
    ),
    td: ({node, ...props}) => (
      <td className="p-2.5 text-slate-300 border-r border-slate-800/40 last:border-r-0 font-sans leading-snug" {...props} />
    ),
    code: ({node, inline, ...props}) => inline 
      ? <code className="bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs border border-cyan-900/50" {...props} />
      : <code className="block bg-slate-950 p-4 rounded-lg border border-cyan-900/50 overflow-x-auto text-xs my-4 font-mono text-amber-200 leading-relaxed shadow-inner" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />
  };

  const articleBodyText = activeArticle ? (activeArticle.description || activeArticle.body || '') : '';

  return (
    <div className="flex-1 flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full relative shadow-xl">
      {/* Mobile / Narrow View Guide Section Modal Overlay */}
      {false && isMobileGuideOpen && activeTab === 'guide' && (
        <div className="fixed inset-0 z-[200] bg-[#0d1117]/98 backdrop-blur-md flex flex-col overflow-hidden font-sans p-3 sm:p-6 pt-12 md:hidden">
          <div className="bg-[#0d1117] border border-cyan-500/50 rounded-xl w-full h-full shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <RingedPlanetLogo size={18} />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">USER GUIDE</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileGuideOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none px-2 transition-colors cursor-pointer"
                title="Close Guide"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <UserGuideView
                activeSectionId={activeGuideSectionId}
                onSelectSection={(id) => {
                  setActiveGuideSectionId(id);
                }}
                onNavigate={(target) => {
                  handleNavigateArticle(target);
                }}
                prevItem={currentPrevArticle}
                nextItem={currentNextArticle}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile / Narrow View Full Article Modal Overlay */}
      {false && selectedArticleId && activeArticle && (
        <div className="fixed inset-0 z-[200] bg-[#0d1117]/98 backdrop-blur-md flex flex-col overflow-hidden font-sans p-3 sm:p-6 pt-12 md:hidden">
          <div className="bg-[#0d1117] border border-cyan-500/50 rounded-xl w-full h-full shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            {/* Mobile Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[10px] text-cyan-400/90 uppercase font-mono tracking-wider">
                    {currentConfig?.label || 'Compendium'}
                  </span>
                  {activeArticle.parent && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      / {activeArticle.parent.replace(/\s*\(SOURCE OF TRUTH\)/gi, '')}
                    </span>
                  )}
                  {activeArticle.perspective && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border ${
                      activeArticle.perspective === 'operator'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                        : activeArticle.perspective === 'architect'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {activeArticle.perspective === 'operator' ? '👤 OPERATOR' : activeArticle.perspective === 'architect' ? '🏛️ ARCHITECT' : 'CORE'}
                    </span>
                  )}
                  {activeArticle.entry_type && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border ${
                      activeArticle.entry_type.toLowerCase().includes('primary')
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                        : activeArticle.entry_type.toLowerCase().includes('generic')
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}>
                      {activeArticle.entry_type}
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-wide truncate">
                  {activeArticle.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin ? (
                  <button
                    onClick={() => handleOpenItem(activeArticle, true)}
                    className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded text-xs font-bold uppercase transition-colors"
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenItem(activeArticle, false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded text-xs font-bold uppercase transition-colors"
                  >
                    👁️ Details
                  </button>
                )}
                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold leading-none px-2 transition-colors"
                  title="Close Article"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Mobile Main Content Body */}
            <div ref={mobileContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 space-y-4 text-xs sm:text-sm text-slate-200">
              {matchingMasterDoc && (
                <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/80 border border-cyan-500/60 p-3 sm:p-4 rounded-lg flex items-center justify-between gap-3 shadow-md">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                      <span>📖</span> Quick Reference Snippet
                    </div>
                    <div className="text-xs text-slate-200 truncate mt-0.5">
                      Full complete rulebook: <strong className="text-cyan-300">{matchingMasterDoc.name}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectArticle(matchingMasterDoc.id)}
                    className="shrink-0 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/60 rounded text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer"
                  >
                    Open Rulebook ➔
                  </button>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-lg space-y-3 shadow-inner">
                <div className="text-slate-300 font-sans leading-relaxed">
                  {articleBodyText ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {preProcessWikiText(articleBodyText)}
                    </ReactMarkdown>
                  ) : <em className="text-slate-500">No article text available.</em>}
                </div>
              </div>

              {activeArticle.mechanic && (
                <div className="bg-slate-950 border border-amber-500/40 p-4 sm:p-5 rounded-lg text-xs space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span>⚙️</span> Game Mechanics Rules
                  </h4>
                  <div className="text-amber-200 font-mono whitespace-pre-line bg-slate-900 p-3 rounded border border-slate-800">
                    {renderWikiContent(activeArticle.mechanic)}
                  </div>
                </div>
              )}

              {activeArticle.guide && (
                <div className="bg-slate-950 border border-cyan-500/40 p-4 sm:p-5 rounded-lg text-xs space-y-2">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider">📖 Gameplay Instructions</h4>
                  <div className="text-cyan-200 whitespace-pre-line">{renderWikiContent(activeArticle.guide)}</div>
                </div>
              )}

              {activeArticle.note && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs italic text-slate-400">
                  <span className="font-bold text-slate-300 not-italic uppercase block mb-1">Designer Notes:</span>
                  {renderWikiContent(activeArticle.note)}
                </div>
              )}

              {/* In-flow Mobile Pagination Links */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                {currentPrevArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(currentPrevArticle)}
                    className="flex-1 flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-900 border border-cyan-900/60 hover:border-cyan-500/50 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} className="text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Previous</div>
                      <div className="text-[11px] font-bold text-white truncate">{currentPrevArticle.name}</div>
                    </div>
                  </button>
                ) : <div className="flex-1" />}

                {currentNextArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(currentNextArticle)}
                    className="flex-1 flex items-center justify-end gap-2 p-2.5 bg-slate-950 hover:bg-slate-900 border border-cyan-900/60 hover:border-cyan-500/50 rounded-lg text-right transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Next</div>
                      <div className="text-[11px] font-bold text-white truncate">{currentNextArticle.name}</div>
                    </div>
                    <ArrowRight size={14} className="text-cyan-400 shrink-0" />
                  </button>
                ) : <div className="flex-1" />}
              </div>
            </div>

            {/* Mobile Modal Footer Navigation Bar: Previous (bottom left), Close (center), Next (bottom right) */}
            <div className="sticky bottom-0 bg-slate-950 border-t border-cyan-900/60 p-2.5 flex items-center justify-between gap-2 shrink-0 shadow-lg">
              {/* Bottom Left: Previous Arrow */}
              {currentPrevArticle ? (
                <button
                  type="button"
                  onClick={() => handleNavigateArticle(currentPrevArticle)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-bold font-mono transition-colors active:scale-95 shadow-sm cursor-pointer"
                  title={`Previous: ${currentPrevArticle.name}`}
                >
                  <ArrowLeft size={14} />
                  <span className="hidden xs:inline truncate max-w-[70px]">Prev</span>
                </button>
              ) : (
                <div className="w-9 xs:w-16" />
              )}

              {/* Center: Close Article */}
              <button
                type="button"
                onClick={() => setSelectedArticleId(null)}
                className="flex-1 max-w-[140px] py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>✕</span> Close
              </button>

              {/* Bottom Right: Next Arrow */}
              {currentNextArticle ? (
                <button
                  type="button"
                  onClick={() => handleNavigateArticle(currentNextArticle)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-bold font-mono transition-colors active:scale-95 shadow-sm cursor-pointer"
                  title={`Next: ${currentNextArticle.name}`}
                >
                  <span className="hidden xs:inline truncate max-w-[70px]">Next</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="w-9 xs:w-16" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* DUAL-LAYER RAIL DRAWER */}
      {/* 1. Slim Guidance Rail (Always visible, w-13 sm:w-14) */}
      <aside className="w-13 sm:w-14 bg-slate-950 border-r border-slate-800/90 flex flex-col items-center py-2.5 px-1 select-none shrink-0 z-20 gap-2">
        {/* Drawer Open/Close Toggle Button */}
        <button
          type="button"
          onClick={toggleDrawer}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isDrawerOpen 
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800' 
              : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
          }`}
          title={isDrawerOpen ? "Collapse Compendium Drawer" : "Expand Compendium Drawer"}
          aria-label={isDrawerOpen ? "Collapse Compendium Drawer" : "Expand Compendium Drawer"}
        >
          {isDrawerOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>

        <div className="w-8 h-[1px] bg-slate-800 my-0.5" />

        {/* 1.00 Operator Rail Tab Button (Emerald Theme) */}
        <button
          type="button"
          onClick={() => handleTabClick('operator')}
          className={`group relative w-11 sm:w-12 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border min-h-[52px] ${
            activeTab === 'operator'
              ? 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
          }`}
          title={`1.00 Operator Core Rules (${operatorMasterArticles.length} chapters, ${opCount} total articles)`}
          aria-label="1.00 Operator Core Rules"
        >
          {/* Active Left Indicator Bar */}
          {activeTab === 'operator' && (
            <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          )}

          {/* Icon Box */}
          <div className={`relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center border transition-all ${
            activeTab === 'operator'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400'
          }`}>
            <span className="text-sm leading-none">📘</span>
          </div>

          {/* Label */}
          <span className={`font-mono text-[9px] uppercase tracking-wider text-center mt-1 leading-tight select-none transition-colors ${
            activeTab === 'operator'
              ? 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]'
              : 'text-emerald-400/70 group-hover:text-emerald-200'
          }`}>
            OPER
          </span>
        </button>

        {/* 5.00 Architect Rail Tab Button (Amber Theme) */}
        <button
          type="button"
          onClick={() => handleTabClick('architect')}
          className={`group relative w-11 sm:w-12 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border min-h-[52px] ${
            activeTab === 'architect'
              ? 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
          }`}
          title={`5.00 Architect & Modular Matrices (${architectMasterArticles.length} matrices, ${archCount} total articles)`}
          aria-label="5.00 Architect & Modular Matrices"
        >
          {/* Active Left Indicator Bar */}
          {activeTab === 'architect' && (
            <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}

          {/* Icon Box */}
          <div className={`relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center border transition-all ${
            activeTab === 'architect'
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400'
          }`}>
            <span className="text-sm leading-none">🏛️</span>
          </div>

          {/* Label */}
          <span className={`font-mono text-[9px] uppercase tracking-wider text-center mt-1 leading-tight select-none transition-colors ${
            activeTab === 'architect'
              ? 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]'
              : 'text-amber-400/70 group-hover:text-amber-200'
          }`}>
            ARCH
          </span>
        </button>

        <div className="flex-1" />

        {/* User Guide Rail Tab Button (Anchored at bottom of Guide Rail) */}
        <button
          type="button"
          onClick={() => handleTabClick('guide')}
          className={`group relative w-11 sm:w-12 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border min-h-[52px] ${
            activeTab === 'guide'
              ? 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
          }`}
          title={`Comprehensive User Guide (${USER_GUIDE_SECTIONS.length} sections)`}
          aria-label="Comprehensive User Guide"
        >
          {/* Active Left Indicator Bar */}
          {activeTab === 'guide' && (
            <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}

          {/* Icon Box with Ringed Planet Icon */}
          <div className={`relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center border transition-all ${
            activeTab === 'guide'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400'
          }`}>
            <RingedPlanetLogo size={18} />
          </div>

          {/* Label */}
          <span className={`font-mono text-[9px] uppercase tracking-wider text-center mt-1 leading-tight select-none transition-colors ${
            activeTab === 'guide'
              ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(6,182,212,0.7)]'
              : 'text-cyan-400/70 group-hover:text-cyan-200'
          }`}>
            GUIDE
          </span>
        </button>
      </aside>

      {/* 2. Expandable Directory Drawer (Filtered strictly to activeTab) */}
      <aside
        className={`transition-all duration-200 ease-in-out bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden ${
          isDrawerOpen
            ? 'w-full md:w-80 lg:w-88'
            : 'w-0 border-r-0 pointer-events-none'
        }`}
      >
        <div className="w-full md:w-80 lg:w-88 flex flex-col h-full shrink-0">
          {/* Drawer Top Header */}
          <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-950/90 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none shrink-0">
                  {activeTab === 'operator' ? '📘' : activeTab === 'architect' ? '🏛️' : <RingedPlanetLogo size={18} />}
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider font-mono truncate ${
                      activeTab === 'operator' ? 'text-emerald-300' : activeTab === 'architect' ? 'text-amber-300' : 'text-cyan-300'
                    }`}>
                      {activeTab === 'operator' ? 'OPERATOR RULES' : activeTab === 'architect' ? 'ARCHITECT MATRICES' : 'USER GUIDE'}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border shrink-0 ${
                      activeTab === 'operator'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : activeTab === 'architect'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                    }`}>
                      {activeTab === 'guide' ? filteredGuideSections.length : currentTabRawArticles.length}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono text-slate-400 truncate">
                    {activeTab === 'operator'
                      ? `1.00 Player Core (${operatorMasterArticles.length} Chapters)`
                      : activeTab === 'architect'
                      ? `5.00 World & Modular (${architectMasterArticles.length} Matrices)`
                      : 'Platform & System Manual'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {activeTab !== 'guide' && expandableTabParentIds.length > 0 && !searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={toggleExpandAllTabArticles}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    title={areAllTabParentsExpanded ? 'Collapse All Sub-Sections' : 'Expand All Sub-Sections'}
                  >
                    {areAllTabParentsExpanded ? <ChevronsDownUp size={15} /> : <ChevronsUpDown size={15} />}
                  </button>
                )}
                {isAdmin && activeTab !== 'guide' && (
                  <button
                    onClick={handleCreateNew}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] uppercase rounded shadow transition-colors flex items-center gap-1 cursor-pointer"
                    title="Create New Article"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleDrawer}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Collapse Drawer"
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
            </div>

            {/* Search Row: Search input + Sort Mode button */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'guide'
                      ? `Search ${USER_GUIDE_SECTIONS.length} User Guide sections...`
                      : `Search ${currentTabRawArticles.length} ${activeTab === 'operator' ? 'Operator' : 'Architect'} articles...`
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 text-white pl-8 pr-7 py-1.5 rounded-lg text-xs outline-none focus:border-cyan-500 font-mono shadow-inner transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs px-1 cursor-pointer"
                    title="Clear Search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Article / Section List Strictly for Active Tab */}
          <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-1">
            {activeTab === 'guide' ? (
              filteredGuideSections.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic text-xs">
                  No User Guide sections match "{searchQuery}".
                </div>
              ) : (
                filteredGuideSections.map((sec) => {
                  const isSelected = activeGuideSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        AudioService?.playTerminalBeep?.(1100, 0.02);
                        setActiveGuideSectionId(sec.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) setIsDrawerOpen(false);
                        try {
                          localStorage.setItem('compendium_active_guide_section', sec.id);
                        } catch {}
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-950/85 border-cyan-500/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {sec.id === 'intro' ? (
                          <RingedPlanetLogo size={14} className="shrink-0" />
                        ) : (
                          <span className="text-cyan-400 font-mono text-[10px] w-4 shrink-0 font-bold">
                            {sec.num}.
                          </span>
                        )}
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                        {sec.badge}
                      </span>
                    </button>
                  );
                })
              )
            ) : (!currentTabRawArticles || currentTabRawArticles.length === 0) ? (
              <div className="p-8 text-center text-slate-500 italic text-xs">
                No articles found in {activeTab === 'operator' ? 'Operator Core Rules' : 'Architect Matrices'}.
              </div>
            ) : filteredTabArticles.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="text-slate-500 italic text-xs">
                  No {activeTab === 'operator' ? 'Operator' : 'Architect'} articles match "{searchQuery}".
                </div>
                {otherTabMatches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleTabClick(activeTab === 'operator' ? 'architect' : 'operator');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md transition-all ${
                      activeTab === 'operator'
                        ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900/80'
                        : 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
                    }`}
                  >
                    <span>Switch to {activeTab === 'operator' ? 'Architect' : 'Operator'} ({otherTabMatches.length} match{otherTabMatches.length === 1 ? '' : 'es'})</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            ) : searchQuery.trim() ? (
              filteredTabArticles.map((item) => {
                const isSelected = activeArticle?.id === item.id;
                const ancestors = (articleAncestorsMap[item.id] || [])
                  .map(ancId => itemByIdMap.get(ancId)?.name)
                  .filter(Boolean);
                const breadcrumbLabel = ancestors.length > 0 ? ancestors.join(' › ') : null;

                return (
                  <TreeArticleItem
                    key={item.id || item.name}
                    item={item}
                    isSelected={isSelected}
                    childrenCount={descendantCountMap[item.id] || 0}
                    prefix={item.isMasterDoc ? (activeTab === 'operator' ? '📘 ' : '🏛️ ') : '📄 '}
                    subtitle={breadcrumbLabel}
                    onSelect={() => handleSelectArticle(item)}
                    onOpenEdit={() => isAdmin && handleOpenItem(item, true)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? activeTab === 'operator'
                          ? 'bg-emerald-950/85 border-emerald-500/80 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold'
                          : 'bg-amber-950/85 border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-800/80'
                    }`}
                  />
                );
              })
            ) : (
              currentTabMasterArticles.map((masterItem) => (
                <HierarchicalArticleNode
                  key={masterItem.id || masterItem.name}
                  item={masterItem}
                  depth={0}
                  activeTab={activeTab}
                  activeArticle={activeArticle}
                  childMap={childMap}
                  descendantCountMap={descendantCountMap}
                  expandedArticles={expandedArticles}
                  onToggleExpand={toggleArticleExpand}
                  onSelectArticle={handleSelectArticle}
                  onOpenEdit={(target) => handleOpenItem(target, true)}
                  isAdmin={isAdmin}
                  sortArticles={sortArticles}
                  sortMode={sortMode}
                />
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono flex items-center justify-between shrink-0">
            <span className={activeTab === 'operator' ? 'text-emerald-400/90 font-bold' : activeTab === 'architect' ? 'text-amber-400/90 font-bold' : 'text-cyan-400/90 font-bold'}>
              {activeTab === 'operator' ? 'OPERATOR RULES' : activeTab === 'architect' ? 'ARCHITECT MATRICES' : 'USER GUIDE'}
            </span>
            <span className="text-slate-400">
              {activeTab === 'guide' ? 'TOPICS (0-10)' : sortMode === 'order' ? 'CANONICAL (1-9)' : 'ALPHABETICAL (A-Z)'}
            </span>
            <span className="text-cyan-400 font-bold">
              {activeTab === 'guide' ? `${filteredGuideSections.length} / ${USER_GUIDE_SECTIONS.length}` : `${filteredTabArticles.length} / ${currentTabRawArticles.length}`}
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: Article Viewer / Content Display (Desktop Side-by-Side) */}
      <div className={`flex flex-col flex-1 ${isDrawerOpen ? 'max-md:hidden' : ''} relative h-full overflow-hidden`}>
        {activeTab === 'guide' ? (
          <UserGuideView
            activeSectionId={activeGuideSectionId}
            onSelectSection={(id) => {
              setActiveGuideSectionId(id);
              try {
                localStorage.setItem('compendium_active_guide_section', id);
              } catch {}
            }}
            onNavigate={handleNavigateArticle}
            prevItem={currentPrevArticle}
            nextItem={currentNextArticle}
          />
        ) : (
          <main ref={desktopContentRef} className="flex flex-col flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 bg-slate-900/95 scroll-smooth">
          {activeArticle ? (
            <div className="w-full space-y-6">
              {/* Header & Controls */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {!isDrawerOpen && (
                      <button
                        type="button"
                        onClick={toggleDrawer}
                        className="mr-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono font-bold shadow-sm"
                        title="Open Compendium Rail Drawer"
                      >
                        <PanelLeftOpen size={13} />
                        <span>DRAWER</span>
                      </button>
                    )}
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      {currentConfig?.label || 'Compendium'}
                    </span>
                    {activeAncestorDocs.length > 0 ? (
                      activeAncestorDocs.map(anc => (
                        <React.Fragment key={anc.id}>
                          <span className="text-xs font-mono text-slate-600">/</span>
                          <button
                            type="button"
                            onClick={() => handleNavigateArticle(anc)}
                            className="text-xs font-mono text-amber-400 hover:text-amber-200 underline cursor-pointer transition-colors"
                            title={`Jump to parent section: ${anc.name}`}
                          >
                            {anc.name}
                          </button>
                        </React.Fragment>
                      ))
                    ) : activeArticle.parent ? (
                      <span className="text-xs font-mono text-amber-400">
                        / {activeArticle.parent.replace(/\s*\(SOURCE OF TRUTH\)/gi, '')}
                      </span>
                    ) : null}
                    {activeArticle.perspective && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${
                        activeArticle.perspective === 'operator'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                          : activeArticle.perspective === 'architect'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {activeArticle.perspective === 'operator' ? '👤 OPERATOR' : activeArticle.perspective === 'architect' ? '🏛️ ARCHITECT' : 'CORE (ALL)'}
                      </span>
                    )}
                    {activeArticle.entry_type && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${
                        activeArticle.entry_type.toLowerCase().includes('primary')
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                          : activeArticle.entry_type.toLowerCase().includes('generic')
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        {activeArticle.entry_type}
                      </span>
                    )}
                    {activeArticle.relPath && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                        {activeArticle.relPath}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-wide uppercase font-sans">
                    {activeArticle.name}
                  </h1>
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyBracketLink(activeArticle)}
                      className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title={`Copy Bracket Hyperlink [[${activeArticle.name}]]`}
                    >
                      <Copy size={12} />
                      <span>[[Link]]</span>
                    </button>
                    <button
                      onClick={() => handleOpenItem(activeArticle, true)}
                      className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit size={13} />
                      <span>Edit Article</span>
                    </button>
                    {handleDuplicateEntry && (
                      <button
                        onClick={() => handleDuplicateEntry(activeArticle)}
                        className="px-3.5 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Duplicate Article"
                      >
                        <Copy size={13} />
                        <span>Duplicate</span>
                      </button>
                    )}
                    {handleDeleteEntry && (
                      <button
                        onClick={() => handleDeleteEntry(activeArticle)}
                        className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Delete Article"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyBracketLink(activeArticle)}
                      className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title={`Copy Bracket Hyperlink [[${activeArticle.name}]]`}
                    >
                      <Copy size={12} />
                      <span>[[Link]]</span>
                    </button>
                    <button
                      onClick={() => handleOpenItem(activeArticle, false)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                      👁️ View Details
                    </button>
                  </div>
                )}
              </div>

              {/* Master Doc / Parent Hierarchy Banner */}
              {(matchingMasterDoc || activeParentDoc) && (
                <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/80 border border-cyan-500/60 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <span>📘</span> Modular Rulebook Section
                    </div>
                    <div className="text-sm text-slate-200">
                      Part of{' '}
                      {matchingMasterDoc && (
                        <strong className="text-cyan-300">{matchingMasterDoc.name}</strong>
                      )}
                      {activeParentDoc && (
                        <>
                          {' '}› <strong className="text-amber-300">{activeParentDoc.name}</strong>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeParentDoc && (
                      <button
                        type="button"
                        onClick={() => handleNavigateArticle(activeParentDoc)}
                        className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/70 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <span>↑ {activeParentDoc.name}</span>
                      </button>
                    )}
                    {matchingMasterDoc && (
                      <button
                        type="button"
                        onClick={() => handleNavigateArticle(matchingMasterDoc)}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/70 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-md hover:shadow-cyan-500/20 flex items-center gap-2"
                      >
                        <span>Open Chapter Index</span>
                        <span>➔</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Child Sub-Articles Quick Directory Bar (when viewing a Master Doc or Lineage Parent) */}
              {activeDirectChildren.length > 0 && (
                <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <span>📂</span>
                      <span>Modular Sub-Documents in {activeArticle.name} ({activeDirectChildren.length})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {activeDirectChildren.map(sub => {
                      const subChildrenCount = descendantCountMap[sub.id] || 0;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleNavigateArticle(sub)}
                          className="text-left px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                        >
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                            {subChildrenCount > 0 ? '📂 ' : '📄 '}
                            {sub.name}
                          </span>
                          {subChildrenCount > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 shrink-0">
                              {subChildrenCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main Content Body */}
              <div className="bg-slate-950 border border-slate-800/90 p-4 sm:p-6 lg:p-7 rounded-xl text-slate-200 text-sm leading-relaxed shadow-inner">
                <div className="text-slate-300 font-sans">
                  {articleBodyText ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {preProcessWikiText(articleBodyText)}
                    </ReactMarkdown>
                  ) : (
                    <div className="p-8 text-center text-slate-500 italic">
                      No article body content available.
                    </div>
                  )}
                </div>
              </div>

              {/* Game Mechanics Box */}
              {activeArticle.mechanic && !activeArticle.mechanic.startsWith('See full canonical text') && (
                <div className="bg-slate-950 border border-amber-500/40 p-5 rounded-xl text-xs space-y-2 shadow-md">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm">
                    <span>⚙️</span> Game Mechanics (BASTION Rules)
                  </h4>
                  <div className="text-amber-200 font-mono whitespace-pre-line bg-slate-900/90 p-4 rounded-lg border border-slate-800">
                    {renderWikiContent(activeArticle.mechanic)}
                  </div>
                </div>
              )}

              {/* Guide Box */}
              {activeArticle.guide && !activeArticle.guide.includes('in the game rules library for complete') && (
                <div className="bg-slate-950 border border-cyan-500/40 p-5 rounded-xl text-xs space-y-2 shadow-md">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span>📖</span> Gameplay Instructions
                  </h4>
                  <div className="text-cyan-200 whitespace-pre-line bg-slate-900/90 p-4 rounded-lg border border-slate-800">
                    {renderWikiContent(activeArticle.guide)}
                  </div>
                </div>
              )}

              {/* Notes Box */}
              {activeArticle.note && !activeArticle.note.includes('Complete, unabridged source of truth') && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs italic text-slate-400">
                  <span className="font-bold text-slate-300 not-italic uppercase block mb-1 font-mono text-[11px]">
                    Architect Notes:
                  </span>
                  {renderWikiContent(activeArticle.note)}
                </div>
              )}

              {/* Architect Guidance & AI Reference Directives */}
              {(Boolean(activeArticle.keywords) || 
                Boolean(activeArticle.negative_keywords) ||
                (Array.isArray(activeArticle.recommended_species) && activeArticle.recommended_species.length > 0) ||
                (Array.isArray(activeArticle.recommended_factions) && activeArticle.recommended_factions.length > 0) || 
                (Array.isArray(activeArticle.recommended_origins) && activeArticle.recommended_origins.length > 0) || 
                (Array.isArray(activeArticle.recommended_occupations) && activeArticle.recommended_occupations.length > 0) ||
                (Array.isArray(activeArticle.recommended_skills) && activeArticle.recommended_skills.length > 0) ||
                (Array.isArray(activeArticle.recommended_features) && activeArticle.recommended_features.length > 0)) && (
                <div className="bg-slate-950/90 border border-emerald-500/30 p-4 rounded-xl text-xs space-y-3 shadow-md">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono uppercase tracking-wider text-[11px]">
                    <Sparkles size={13} className="text-emerald-400" />
                    <span>Architect Guidance & AI Directives (Operator & BASTION Reference)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {Array.isArray(activeArticle.recommended_species) && activeArticle.recommended_species.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-sky-300 uppercase">
                          <Users size={11} className="text-sky-400" />
                          <span>Recommended Species</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeArticle.recommended_species.map(sp => (
                            <span key={sp} className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-[10px] font-mono">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(activeArticle.recommended_factions) && activeArticle.recommended_factions.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-sky-300 uppercase">
                          <Flag size={11} className="text-sky-400" />
                          <span>Recommended Factions</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeArticle.recommended_factions.map(f => (
                            <span key={f} className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-[10px] font-mono">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(activeArticle.recommended_origins) && activeArticle.recommended_origins.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-300 uppercase">
                          <Globe size={11} className="text-emerald-400" />
                          <span>Recommended Origins</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeArticle.recommended_origins.map(o => (
                            <span key={o} className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-[10px] font-mono">
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(activeArticle.recommended_occupations) && activeArticle.recommended_occupations.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 uppercase">
                          <Briefcase size={11} className="text-amber-400" />
                          <span>Recommended Occupations</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeArticle.recommended_occupations.map(oc => (
                            <span key={oc} className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-200 text-[10px] font-mono">
                              {oc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {((Array.isArray(activeArticle.recommended_skills) && activeArticle.recommended_skills.length > 0) || 
                    (Array.isArray(activeArticle.recommended_features) && activeArticle.recommended_features.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {Array.isArray(activeArticle.recommended_skills) && activeArticle.recommended_skills.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 uppercase">
                            <GraduationCap size={11} className="text-cyan-400" />
                            <span>Recommended Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activeArticle.recommended_skills.map(sk => (
                              <span key={sk} className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(activeArticle.recommended_features) && activeArticle.recommended_features.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-violet-300 uppercase">
                            <Zap size={11} className="text-violet-400" />
                            <span>Recommended Features</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activeArticle.recommended_features.map(feat => (
                              <span key={feat} className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-500/30 text-violet-200 text-[10px] font-mono">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(activeArticle.keywords || activeArticle.negative_keywords) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {activeArticle.keywords && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-purple-300 uppercase">
                            <Tag size={11} className="text-purple-400" />
                            <span>Guidance Keywords (Directives)</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {String(activeArticle.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).map(kw => (
                              <span key={kw} className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-[10px] font-mono">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeArticle.negative_keywords && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-900/40 space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-300 uppercase">
                            <ShieldAlert size={11} className="text-rose-400" />
                            <span>Negative Keywords (Railguards)</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {String(activeArticle.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).map(kw => (
                              <span key={kw} className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/30 text-rose-200 text-[10px] font-mono">
                                ✕ #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* In-flow Desktop Pagination Card at Bottom of Article */}
              <div className="pt-8 pb-4 border-t border-slate-800/80 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                {currentPrevArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(currentPrevArticle)}
                    className="group flex items-center gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-left max-w-sm w-full sm:w-auto shadow-md"
                    title={`Previous: ${currentPrevArticle.name}`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      <ArrowLeft size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Previous Article</div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                        {currentPrevArticle.name}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="opacity-0 pointer-events-none hidden sm:block w-32" />
                )}

                {/* Progress indicator */}
                {currentIndex >= 0 && (
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest text-center">
                    Article {currentIndex + 1} of {currentTabRawArticles.length} ({activeTab === 'operator' ? 'Operator' : 'Architect'})
                  </div>
                )}

                {currentNextArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(currentNextArticle)}
                    className="group flex items-center justify-end gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-right max-w-sm w-full sm:w-auto shadow-md"
                    title={`Next: ${currentNextArticle.name}`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Next Article</div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                        {currentNextArticle.name}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                ) : (
                  <div className="opacity-0 pointer-events-none hidden sm:block w-32" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic p-12">
              <p className="mb-4">Select an article from the directory tree on the left to view.</p>
            </div>
          )}
        </main>
        )}

        {/* Floating Quick Navigation Controls: Bottom Left & Bottom Right */}
        {activeTab !== 'guide' && activeArticle && (
          <div className="pointer-events-none absolute bottom-5 left-6 right-6 flex items-center justify-between z-20">
            {/* Bottom Left: Previous Arrow */}
            {currentPrevArticle ? (
              <button
                type="button"
                onClick={() => handleNavigateArticle(currentPrevArticle)}
                className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/95 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-200 cursor-pointer group active:scale-95"
                title={`Previous Article: ${currentPrevArticle.name} (Alt+Left)`}
              >
                <div className="p-1.5 rounded-lg bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500/30 group-hover:-translate-x-0.5 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Previous</span>
                  <span className="text-xs font-bold text-cyan-200 group-hover:text-white max-w-[160px] lg:max-w-[220px] truncate">
                    {currentPrevArticle.name}
                  </span>
                </div>
              </button>
            ) : <div />}

            {/* Bottom Right: Next Arrow */}
            {currentNextArticle ? (
              <button
                type="button"
                onClick={() => handleNavigateArticle(currentNextArticle)}
                className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/95 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-200 cursor-pointer group active:scale-95 ml-auto"
                title={`Next Article: ${currentNextArticle.name} (Alt+Right)`}
              >
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Next</span>
                  <span className="text-xs font-bold text-cyan-200 group-hover:text-white max-w-[160px] lg:max-w-[220px] truncate">
                    {currentNextArticle.name}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500/30 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight size={16} />
                </div>
              </button>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  );
};

export default DBMWikiView;
