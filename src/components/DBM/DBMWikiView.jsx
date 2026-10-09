import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useItemInteractions } from '../../utils/interactionUtils';
import { useDBM } from '../../context/DBMContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showToast } from '../../context/ToastContext';
import { ChevronDown, ChevronRight, BookOpen, Layers, Search, Sparkles, Plus, Edit, Trash2, Copy, ExternalLink, RefreshCw, UserCheck, ShieldAlert, Cpu, ArrowLeft, ArrowRight } from 'lucide-react';

const TreeArticleItem = ({ item, isSelected, childrenCount, onSelect, onOpenEdit, className, prefix = '📜 ' }) => {
  const interactions = useItemInteractions({
    onSelect,
    onOpenEdit,
    delay: 1500
  });

  const isPrimaryFaction = item.entry_type?.toLowerCase().includes('primary');
  const isGenericTemplate = item.entry_type?.toLowerCase().includes('generic');
  const isFullMaster = (item.description?.length > 15000) || item.tags?.includes('source-of-truth') || item.id?.startsWith('doc-') || item.id?.endsWith('-master');

  return (
    <button
      {...interactions}
      className={className}
      title="Single-click to view article. Double-click (or long press 1.5s+ on mobile) to edit."
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
        <span className="shrink-0 text-slate-400">{prefix}</span>
        <span className="truncate">{item.name}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isFullMaster && (
          <span className="text-[8px] px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded font-mono font-bold tracking-tight">
            FULL
          </span>
        )}
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
        {childrenCount > 0 && (
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono shrink-0">
            {childrenCount}
          </span>
        )}
      </div>
    </button>
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
            {section.name}
          </span>
          {isTruthSec && (
            <span className="text-[8px] px-1 py-0.2 rounded bg-sky-900 text-sky-300 border border-sky-400/60 font-mono font-bold tracking-tight shrink-0 hidden sm:inline">
              SOURCE OF TRUTH
            </span>
          )}
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
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [perspectiveFilter, setPerspectiveFilter] = useState('all'); // 'operator' | 'architect' | 'all'
  const [expandedSections, setExpandedSections] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  const { syncCanonicalCompendium } = useDBM() || {};

  const handleSyncCloud = async () => {
    if (!syncCanonicalCompendium) return;
    const ok = await confirm({
      title: 'Sync Canonical Rulebook',
      message: 'Sync all 71 canonical rulebook articles to Firestore cloud collection? This will overwrite or update seed documents in the database.',
      danger: true,
      confirmLabel: 'Sync Rulebook'
    });
    if (ok) {
      setIsSyncing(true);
      try {
        await syncCanonicalCompendium();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const toggleSection = (secId) => {
    setExpandedSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  // Build hierarchical parent/child and section-grouped article tree with nested subsections
  const { sections, childMap, allArticlesFlat, articleAncestorsMap, allSectionIds } = useMemo(() => {
    const items = currentItems || [];
    const itemMap = new Map();
    items.forEach(item => {
      if (item.id) itemMap.set(item.id, item);
      if (item.name) itemMap.set(item.name.toLowerCase(), item);
    });

    const children = {};
    const sectionMap = {};
    const standalone = [];

    // Filter items by perspective if selected
    const perspectiveItems = items.filter(item => {
      if (perspectiveFilter === 'all') return true;
      const p = (item.perspective || 'both').toLowerCase();
      if (perspectiveFilter === 'operator') return p === 'operator' || p === 'both';
      if (perspectiveFilter === 'architect') return p === 'architect' || p === 'both';
      return true;
    });

    perspectiveItems.forEach(item => {
      let p = (item.parent || '').trim();
      if (CANONICAL_SECTION_ALIASES[p]) {
        p = CANONICAL_SECTION_ALIASES[p];
      }

      if (!p || p === '-- Select --') {
        standalone.push(item);
        return;
      }

      // Check if parent is an actual article
      const parentArticle = itemMap.get(p) || itemMap.get(p.toLowerCase());
      if (parentArticle && parentArticle.id !== item.id) {
        if (!children[parentArticle.id]) children[parentArticle.id] = [];
        children[parentArticle.id].push(item);
        return;
      }

      // Otherwise parent is a Section Name
      if (!sectionMap[p]) sectionMap[p] = [];
      sectionMap[p].push(item);
    });

    // Sort standalone items
    standalone.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || (a.name || '').localeCompare(b.name || ''));

    // Sort items in each section
    Object.keys(sectionMap).forEach(secKey => {
      sectionMap[secKey].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || (a.name || '').localeCompare(b.name || ''));
    });

    // Sort sub-articles
    Object.keys(children).forEach(pKey => {
      children[pKey].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || (a.name || '').localeCompare(b.name || ''));
    });

    // Build all section nodes
    const sectionNodes = {};
    Object.keys(sectionMap).forEach(secName => {
      sectionNodes[secName] = {
        id: secName,
        name: secName,
        isSection: true,
        items: sectionMap[secName],
        subsections: []
      };
    });

    // Connect subsections to parents
    const rootSections = [];
    Object.keys(sectionNodes).forEach(secName => {
      const node = sectionNodes[secName];
      const parentName = SUBSECTION_PARENT_MAP[secName];
      if (parentName && sectionNodes[parentName]) {
        sectionNodes[parentName].subsections.push(node);
      } else {
        rootSections.push(node);
      }
    });

    // Compute recursive counts and sort subsections
    function finalizeNode(node) {
      node.subsections.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      node.subsections.forEach(finalizeNode);
      const subCount = node.subsections.reduce((acc, sub) => acc + sub.totalCount, 0);
      node.directCount = node.items.length;
      node.totalCount = node.directCount + subCount;
      node.count = node.totalCount;
    }

    rootSections.sort((a, b) => {
      const aIsTruth = a.name.includes('SOURCE OF TRUTH') || a.name.includes('OPERATOR CORE') || a.name.includes('ARCHITECT & MODULAR');
      const bIsTruth = b.name.includes('SOURCE OF TRUTH') || b.name.includes('OPERATOR CORE') || b.name.includes('ARCHITECT & MODULAR');
      if (aIsTruth && !bIsTruth) return -1;
      if (!aIsTruth && bIsTruth) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
    rootSections.forEach(finalizeNode);

    if (standalone.length > 0) {
      rootSections.push({
        id: 'General Lore & Standalone Articles',
        name: 'General Lore & Standalone Articles',
        isSection: true,
        isGeneral: true,
        items: standalone,
        subsections: [],
        directCount: standalone.length,
        totalCount: standalone.length,
        count: standalone.length
      });
    }

    // Build article ancestors map and list of all section IDs
    const ancestorsMap = {};
    const allSecIds = [];
    const traverseAncestors = (nodeList, path = []) => {
      nodeList.forEach(node => {
        allSecIds.push(node.id);
        const currentPath = [...path, node.id];
        (node.items || []).forEach(item => {
          ancestorsMap[item.id] = currentPath;
          if (item.name) ancestorsMap[item.name.toLowerCase()] = currentPath;
        });
        if (node.subsections && node.subsections.length > 0) {
          traverseAncestors(node.subsections, currentPath);
        }
      });
    };
    traverseAncestors(rootSections);

    return {
      sections: rootSections,
      childMap: children,
      allArticlesFlat: perspectiveItems,
      articleAncestorsMap: ancestorsMap,
      allSectionIds: allSecIds
    };
  }, [currentItems, perspectiveFilter]);

  // Filtered sections for search (recursive search matching)
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();

    const filterNode = (node) => {
      const matchingItems = (node.items || []).filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const descMatch = (item.description || item.body || '').toLowerCase().includes(q);
        const typeMatch = (item.entry_type || '').toLowerCase().includes(q);
        const noteMatch = (item.note || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(item.tags)
          ? item.tags.some(t => String(t).toLowerCase().includes(q))
          : typeof item.tags === 'string' && item.tags.toLowerCase().includes(q);
        return nameMatch || descMatch || typeMatch || noteMatch || tagMatch;
      });

      const matchingSubsections = (node.subsections || [])
        .map(sub => filterNode(sub))
        .filter(Boolean);

      if (matchingItems.length === 0 && matchingSubsections.length === 0) {
        return null;
      }

      const subCount = matchingSubsections.reduce((acc, sub) => acc + sub.totalCount, 0);
      return {
        ...node,
        items: matchingItems,
        subsections: matchingSubsections,
        directCount: matchingItems.length,
        totalCount: matchingItems.length + subCount,
        count: matchingItems.length + subCount
      };
    };

    return sections.map(sec => filterNode(sec)).filter(Boolean);
  }, [sections, searchQuery]);

  const desktopContentRef = useRef(null);
  const mobileContentRef = useRef(null);

  // Handle article selection and auto-expansion of ancestor sections
  const handleSelectArticle = (itemOrId) => {
    if (!itemOrId) return;
    const item = typeof itemOrId === 'string'
      ? (allArticlesFlat || []).find(a => a.id === itemOrId || a.name === itemOrId)
      : itemOrId;
    if (!item) return;
    setSelectedArticleId(item.id);
    const ancestors = articleAncestorsMap[item.id] || (item.name && articleAncestorsMap[item.name.toLowerCase()]) || [];
    if (ancestors.length > 0) {
      setExpandedSections(prev => {
        const next = { ...prev };
        ancestors.forEach(secId => { next[secId] = true; });
        return next;
      });
    }
  };

  const handleJumpToArticle = (targetName) => {
    const targetItem = (allArticlesFlat || []).find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (targetItem) {
      handleSelectArticle(targetItem);
    } else {
      showToast({
        type: 'info',
        title: 'Article Not Found',
        text: `Wiki article "${targetName}" does not exist yet.`
      });
    }
  };

  const handleExpandAll = () => {
    const exp = {};
    (allSectionIds || []).forEach(id => { exp[id] = true; });
    setExpandedSections(exp);
  };

  const handleCollapseAll = () => {
    setExpandedSections({});
  };

  // Active selected article object
  const activeArticle = useMemo(() => {
    if (!allArticlesFlat || allArticlesFlat.length === 0) return null;
    if (selectedArticleId) {
      const found = allArticlesFlat.find(item => item.id === selectedArticleId || item.name === selectedArticleId);
      if (found) return found;
    }
    // Helper to find first available article in nested hierarchy
    const findFirstArticle = (nodeList) => {
      for (const node of nodeList) {
        if (node.items && node.items.length > 0) return node.items[0];
        if (node.subsections && node.subsections.length > 0) {
          const found = findFirstArticle(node.subsections);
          if (found) return found;
        }
      }
      return null;
    };
    return findFirstArticle(sections) || allArticlesFlat[0];
  }, [allArticlesFlat, selectedArticleId, sections]);

  // Flatten articles in exact sequential reading order according to the section hierarchy
  const orderedArticles = useMemo(() => {
    const list = [];
    const visited = new Set();
    const activeTree = searchQuery.trim() ? filteredSections : sections;

    const traverse = (nodeList) => {
      for (const node of nodeList) {
        if (node.items && node.items.length > 0) {
          for (const item of node.items) {
            if (!visited.has(item.id)) {
              visited.add(item.id);
              list.push(item);
            }
            const subChildren = childMap[item.id] || (item.name && childMap[item.name.toLowerCase()]) || [];
            for (const child of subChildren) {
              if (!visited.has(child.id)) {
                visited.add(child.id);
                list.push(child);
              }
            }
          }
        }
        if (node.subsections && node.subsections.length > 0) {
          traverse(node.subsections);
        }
      }
    };

    traverse(activeTree);

    // If not searching, ensure any remaining articles from allArticlesFlat are included
    if (!searchQuery.trim()) {
      for (const item of allArticlesFlat) {
        if (!visited.has(item.id)) {
          visited.add(item.id);
          list.push(item);
        }
      }
    }

    return list;
  }, [sections, filteredSections, searchQuery, childMap, allArticlesFlat]);

  const currentIndex = useMemo(() => {
    if (!activeArticle || !orderedArticles.length) return -1;
    return orderedArticles.findIndex(a => a.id === activeArticle.id);
  }, [activeArticle, orderedArticles]);

  const prevArticle = currentIndex > 0 ? orderedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < orderedArticles.length - 1 ? orderedArticles[currentIndex + 1] : null;

  const handleNavigateArticle = (targetArticle) => {
    if (!targetArticle) return;
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
      if (e.altKey && e.key === 'ArrowLeft' && prevArticle) {
        e.preventDefault();
        handleNavigateArticle(prevArticle);
      } else if (e.altKey && e.key === 'ArrowRight' && nextArticle) {
        e.preventDefault();
        handleNavigateArticle(nextArticle);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevArticle, nextArticle]);

  const isFullRulebook = useMemo(() => {
    if (!activeArticle) return false;
    const len = (activeArticle.description || activeArticle.body || '').length;
    return len > 15000 ||
      activeArticle.tags?.includes('source-of-truth') ||
      activeArticle.id?.startsWith('doc-') ||
      activeArticle.id?.endsWith('-master') ||
      activeArticle.id?.endsWith('-codex');
  }, [activeArticle]);

  const matchingMasterDoc = useMemo(() => {
    if (!activeArticle || !allArticlesFlat || isFullRulebook) return null;

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
    else if (id.startsWith('1-03') || parent.includes('species')) targetDocId = 'doc-operator-1-03-species-work';
    else if (id.startsWith('0-') || parent.includes('manual') || parent.includes('system')) targetDocId = 'doc-operator-1-00-introduction';
    else if (id.startsWith('5-') || parent.includes('architect') || parent.includes('worldbuilding')) targetDocId = 'doc-architect-99-technology';

    if (targetDocId && targetDocId !== activeArticle.id) {
      return allArticlesFlat.find(a => a.id === targetDocId) || null;
    }
    return null;
  }, [activeArticle, allArticlesFlat, isFullRulebook]);

  // Pre-process inter-wiki links [[Article Name]]
  const preProcessWikiText = (text) => {
    if (!text) return '';
    return text.replace(/\[\[([^\]]+)\]\]/g, '[$1](wiki:$1)');
  };

  // Render Inter-Wiki Links for plain text notes / mechanics
  const renderWikiContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\[[^\]]+\]\])/g);

    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const targetName = part.slice(2, -2).trim();
        const targetItem = (allArticlesFlat || []).find(item => item.name.toLowerCase() === targetName.toLowerCase());

        return (
          <button
            key={i}
            onClick={() => handleJumpToArticle(targetName)}
            className="text-cyan-400 hover:text-cyan-200 font-bold underline px-1 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30 transition-all cursor-pointer inline-block"
            title={targetItem ? `Jump to article "${targetName}"` : `Article "${targetName}" not found`}
          >
            📖 {targetName}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const MarkdownComponents = {
    a: ({ node, href, children, ...props }) => {
      if (href && href.startsWith('wiki:')) {
        const targetName = href.replace('wiki:', '').trim();
        const targetItem = (allArticlesFlat || []).find(item => item.name.toLowerCase() === targetName.toLowerCase());
        return (
          <button
            onClick={() => handleJumpToArticle(targetName)}
            className="text-cyan-400 hover:text-cyan-200 font-bold underline px-1.5 py-0.5 bg-cyan-950/60 rounded border border-cyan-500/40 transition-all cursor-pointer inline-block shadow-sm"
            title={targetItem ? `Jump to article "${targetName}"` : `Article "${targetName}" not found`}
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
      {/* Mobile / Narrow View Full Article Modal Overlay */}
      {selectedArticleId && activeArticle && (
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
                      / {activeArticle.parent}
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
                  {isFullRulebook && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-sm animate-pulse">
                      📘 FULL RULEBOOK ({Math.round(articleBodyText.length / 1000)}k chars)
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
                {prevArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(prevArticle)}
                    className="flex-1 flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-900 border border-cyan-900/60 hover:border-cyan-500/50 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} className="text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Previous</div>
                      <div className="text-[11px] font-bold text-white truncate">{prevArticle.name}</div>
                    </div>
                  </button>
                ) : <div className="flex-1" />}

                {nextArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(nextArticle)}
                    className="flex-1 flex items-center justify-end gap-2 p-2.5 bg-slate-950 hover:bg-slate-900 border border-cyan-900/60 hover:border-cyan-500/50 rounded-lg text-right transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Next</div>
                      <div className="text-[11px] font-bold text-white truncate">{nextArticle.name}</div>
                    </div>
                    <ArrowRight size={14} className="text-cyan-400 shrink-0" />
                  </button>
                ) : <div className="flex-1" />}
              </div>
            </div>

            {/* Mobile Modal Footer Navigation Bar: Previous (bottom left), Close (center), Next (bottom right) */}
            <div className="sticky bottom-0 bg-slate-950 border-t border-cyan-900/60 p-2.5 flex items-center justify-between gap-2 shrink-0 shadow-lg">
              {/* Bottom Left: Previous Arrow */}
              {prevArticle ? (
                <button
                  type="button"
                  onClick={() => handleNavigateArticle(prevArticle)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-bold font-mono transition-colors active:scale-95 shadow-sm cursor-pointer"
                  title={`Previous: ${prevArticle.name}`}
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
              {nextArticle ? (
                <button
                  type="button"
                  onClick={() => handleNavigateArticle(nextArticle)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-bold font-mono transition-colors active:scale-95 shadow-sm cursor-pointer"
                  title={`Next: ${nextArticle.name}`}
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

      {/* LEFT PANEL: Directory Tree Navigation */}
      <aside className="w-full md:w-84 lg:w-96 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/90">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentConfig?.label || 'Compendium'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                {allArticlesFlat.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  onClick={handleSyncCloud}
                  disabled={isSyncing}
                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] uppercase rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                  title="Sync all 71 canonical rulebook articles to Firestore database"
                >
                  <RefreshCw size={11} className={isSyncing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleCreateNew}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] uppercase rounded shadow transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} />
                  <span>New</span>
                </button>
              )}
            </div>
          </div>

          {/* Perspective Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setPerspectiveFilter('operator')}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                perspectiveFilter === 'operator'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(52,211,153,0.25)]'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
              title="Player-facing rules, character creation, major primary factions, skills, features & spells"
            >
              <span>👤</span> Operator
            </button>
            <button
              onClick={() => setPerspectiveFilter('architect')}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                perspectiveFilter === 'architect'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Game Master rules, worldbuilding, generic templates, combat matrices & Bastion engine"
            >
              <span>🏛️</span> Architect
            </button>
            <button
              onClick={() => setPerspectiveFilter('all')}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all ${
                perspectiveFilter === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({currentItems?.length || 0})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${allArticlesFlat.length} articles...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-8 pr-7 py-1.5 rounded-lg text-xs outline-none focus:border-cyan-500 font-mono shadow-inner"
            />
               {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tree Action Controls (Expand/Collapse All) */}
          <div className="flex items-center justify-between px-0.5 pt-0.5 text-[10px] font-mono">
            <span className="uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <span>VOLUMES</span>
              <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-[9px] font-bold">
                {sections.length}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer text-[9px] font-semibold"
                title="Expand All Volumes & Subsections"
              >
                + Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition-colors cursor-pointer text-[9px] font-semibold"
                title="Collapse All Volumes & Subsections"
              >
                − Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Hierarchical Article Directory Tree */}
        <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-1">
          {(!allArticlesFlat || allArticlesFlat.length === 0) ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No articles found in {currentConfig?.label || 'compendium'}.
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No articles match "{searchQuery}".
            </div>
          ) : (
            filteredSections.map(sec => (
              <CollapsibleSectionNode
                key={sec.id}
                section={sec}
                level={0}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                activeArticle={activeArticle}
                onSelectArticle={handleSelectArticle}
                onOpenEdit={handleOpenItem}
                isAdmin={isAdmin}
                childMap={childMap}
                isSearching={Boolean(searchQuery.trim())}
              />
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>{sections.length} Volumes / Sections</span>
          <span className="text-cyan-400 font-bold">{allArticlesFlat.length} Articles</span>
        </div>
      </aside>

      {/* RIGHT PANEL: Article Viewer / Content Display (Desktop Side-by-Side) */}
      <div className="flex flex-col flex-1 max-md:hidden relative h-full overflow-hidden">
        <main ref={desktopContentRef} className="flex flex-col flex-1 overflow-y-auto p-6 lg:p-8 pb-28 bg-slate-900/95 scroll-smooth">
          {activeArticle ? (
            <div className="w-full space-y-6">
              {/* Header & Controls */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      {currentConfig?.label || 'Compendium'}
                    </span>
                    {activeArticle.parent && (
                      <span className="text-xs font-mono text-amber-400">
                        / {activeArticle.parent}
                      </span>
                    )}
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
                    {isFullRulebook && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        📘 FULL UNABRIDGED SOURCE OF TRUTH ({Math.round(articleBodyText.length / 1000)}k chars)
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
                  <button
                    onClick={() => handleOpenItem(activeArticle, false)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold uppercase transition-colors"
                  >
                    👁️ View Details
                  </button>
                )}
              </div>

              {/* Master Doc Cross-Reference Banner */}
              {matchingMasterDoc && (
                <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/80 border border-cyan-500/60 p-4 rounded-xl flex items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <span>📘</span> Summary Excerpt / Quick Reference
                    </div>
                    <div className="text-sm text-slate-200">
                      You are viewing a modular section. The complete unabridged rulebook is available in <strong className="text-cyan-300">{matchingMasterDoc.name}</strong> ({Math.round(((matchingMasterDoc.description || matchingMasterDoc.body || '').length) / 1000)}k chars).
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectArticle(matchingMasterDoc.id)}
                    className="shrink-0 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/70 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-md hover:shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <span>Open Full Rulebook</span>
                    <span>➔</span>
                  </button>
                </div>
              )}

              {/* Main Content Body */}
              <div className="bg-slate-950 border border-slate-800/90 p-6 lg:p-7 rounded-xl text-slate-200 text-sm leading-relaxed shadow-inner">
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
              {activeArticle.mechanic && (
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
              {activeArticle.guide && (
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
              {activeArticle.note && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs italic text-slate-400">
                  <span className="font-bold text-slate-300 not-italic uppercase block mb-1 font-mono text-[11px]">
                    Architect Notes:
                  </span>
                  {renderWikiContent(activeArticle.note)}
                </div>
              )}

              {/* In-flow Desktop Pagination Card at Bottom of Article */}
              <div className="pt-8 pb-4 border-t border-slate-800/80 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(prevArticle)}
                    className="group flex items-center gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-left max-w-sm w-full sm:w-auto shadow-md"
                    title={`Previous: ${prevArticle.name}`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      <ArrowLeft size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Previous Article</div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                        {prevArticle.name}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="opacity-0 pointer-events-none hidden sm:block w-32" />
                )}

                {/* Progress indicator */}
                {currentIndex >= 0 && (
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest text-center">
                    Article {currentIndex + 1} of {orderedArticles.length}
                  </div>
                )}

                {nextArticle ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateArticle(nextArticle)}
                    className="group flex items-center justify-end gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-right max-w-sm w-full sm:w-auto shadow-md"
                    title={`Next: ${nextArticle.name}`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Next Article</div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                        {nextArticle.name}
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

        {/* Floating Quick Navigation Controls: Bottom Left & Bottom Right */}
        {activeArticle && (
          <div className="pointer-events-none absolute bottom-5 left-6 right-6 flex items-center justify-between z-20">
            {/* Bottom Left: Previous Arrow */}
            {prevArticle ? (
              <button
                type="button"
                onClick={() => handleNavigateArticle(prevArticle)}
                className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/95 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-200 cursor-pointer group active:scale-95"
                title={`Previous Article: ${prevArticle.name} (Alt+Left)`}
              >
                <div className="p-1.5 rounded-lg bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500/30 group-hover:-translate-x-0.5 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Previous</span>
                  <span className="text-xs font-bold text-cyan-200 group-hover:text-white max-w-[160px] lg:max-w-[220px] truncate">
                    {prevArticle.name}
                  </span>
                </div>
              </button>
            ) : <div />}

            {/* Bottom Right: Next Arrow */}
            {nextArticle ? (
              <button
                type="button"
                onClick={() => handleNavigateArticle(nextArticle)}
                className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/95 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-200 cursor-pointer group active:scale-95 ml-auto"
                title={`Next Article: ${nextArticle.name} (Alt+Right)`}
              >
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Next</span>
                  <span className="text-xs font-bold text-cyan-200 group-hover:text-white max-w-[160px] lg:max-w-[220px] truncate">
                    {nextArticle.name}
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
