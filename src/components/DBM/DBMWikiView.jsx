import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useItemInteractions } from '../../utils/interactionUtils';
import { ChevronDown, ChevronRight, BookOpen, Layers, Search, Sparkles, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const TreeArticleItem = ({ item, isSelected, childrenCount, onSelect, onOpenEdit, className, prefix = '📜 ' }) => {
  const interactions = useItemInteractions({
    onSelect,
    onOpenEdit,
    delay: 1500
  });

  return (
    <button
      {...interactions}
      className={className}
      title="Single-click to view article. Double-click (or long press 1.5s+ on mobile) to edit."
    >
      <span className="truncate pr-1 flex items-center gap-1.5 min-w-0">
        <span className="shrink-0 text-slate-400">{prefix}</span>
        <span className="truncate">{item.name}</span>
      </span>
      {childrenCount > 0 && (
        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono shrink-0">
          {childrenCount}
        </span>
      )}
    </button>
  );
};

const getSectionIcon = (sectionName = '') => {
  const s = sectionName.toUpperCase();
  if (s.includes('FACTION')) return '👥';
  if (s.includes('ORIGIN')) return '🌐';
  if (s.includes('OCCUPATION')) return '🎯';
  if (s.includes('FEATURE')) return '🛡️';
  if (s.includes('HINDRANCE')) return '⚠️';
  if (s.includes('COMBAT')) return '⚔️';
  if (s.includes('METAPHYSIC')) return '🔮';
  if (s.includes('SPECIES')) return '🧬';
  if (s.includes('PROPERTY') || s.includes('GEAR') || s.includes('WEAPON')) return '📦';
  return '📁';
};

export const DBMWikiView = ({
  currentConfig,
  handleCreateNew,
  currentItems,
  handleOpenItem,
  isAdmin = true,
  handleDeleteEntry
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (secName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [secName]: !prev[secName]
    }));
  };

  // Build hierarchical parent/child and section-grouped article tree
  const { sections, childMap, allArticlesFlat } = useMemo(() => {
    const items = currentItems || [];
    const itemMap = new Map();
    items.forEach(item => {
      if (item.id) itemMap.set(item.id, item);
      if (item.name) itemMap.set(item.name.toLowerCase(), item);
    });

    const children = {};
    const sectionMap = {};
    const standalone = [];

    items.forEach(item => {
      const p = (item.parent || '').trim();
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

      // Otherwise parent is a Section Name (e.g. "3.00 COMBAT", "1.04 FACTIONS")
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

    // Build section list
    const sectionEntries = Object.keys(sectionMap)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(secName => ({
        name: secName,
        isSection: true,
        items: sectionMap[secName],
        count: sectionMap[secName].length
      }));

    if (standalone.length > 0) {
      sectionEntries.push({
        name: 'General Lore & Standalone Articles',
        isSection: true,
        isGeneral: true,
        items: standalone,
        count: standalone.length
      });
    }

    return {
      sections: sectionEntries,
      childMap: children,
      allArticlesFlat: items
    };
  }, [currentItems]);

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();

    return sections.map(sec => {
      const matchingItems = sec.items.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const descMatch = (item.description || item.body || '').toLowerCase().includes(q);
        const typeMatch = (item.entry_type || '').toLowerCase().includes(q);
        const noteMatch = (item.note || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(item.tags)
          ? item.tags.some(t => String(t).toLowerCase().includes(q))
          : typeof item.tags === 'string' && item.tags.toLowerCase().includes(q);
        return nameMatch || descMatch || typeMatch || noteMatch || tagMatch;
      });

      return {
        ...sec,
        items: matchingItems,
        count: matchingItems.length
      };
    }).filter(sec => sec.items.length > 0);
  }, [sections, searchQuery]);

  // Active selected article object
  const activeArticle = useMemo(() => {
    if (!allArticlesFlat || allArticlesFlat.length === 0) return null;
    if (selectedArticleId) {
      const found = allArticlesFlat.find(item => item.id === selectedArticleId || item.name === selectedArticleId);
      if (found) return found;
    }
    // Default to first article in first section, or first flat article
    for (const sec of sections) {
      if (sec.items && sec.items.length > 0) {
        return sec.items[0];
      }
    }
    return allArticlesFlat[0];
  }, [allArticlesFlat, selectedArticleId, sections]);

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
            onClick={() => {
              if (targetItem) {
                setSelectedArticleId(targetItem.id);
              } else {
                alert(`Wiki article "${targetName}" does not exist yet.`);
              }
            }}
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
            onClick={() => {
              if (targetItem) {
                setSelectedArticleId(targetItem.id);
              } else {
                alert(`Wiki article "${targetName}" does not exist yet.`);
              }
            }}
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
        <div className="fixed inset-0 z-50 bg-[#0d1117]/98 backdrop-blur-md flex flex-col overflow-hidden font-sans p-3 sm:p-6 md:hidden">
          <div className="bg-[#0d1117] border border-cyan-500/50 rounded-xl w-full h-full shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            {/* Mobile Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-cyan-400/90 uppercase font-mono tracking-wider">
                    {currentConfig?.label || 'Compendium'}
                  </span>
                  {activeArticle.parent && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      / {activeArticle.parent}
                    </span>
                  )}
                  {activeArticle.entry_type && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono uppercase">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 space-y-4 text-xs sm:text-sm text-slate-200">
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
            </div>

            {/* Close Button at Bottom */}
            <div className="sticky bottom-0 bg-slate-950 border-t border-cyan-900/60 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
              <button
                onClick={() => setSelectedArticleId(null)}
                className="w-full max-w-xs py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>✕</span> Close Article
              </button>
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
            {isAdmin && (
              <button
                onClick={handleCreateNew}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] uppercase rounded shadow transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>New Article</span>
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${allArticlesFlat.length} articles...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-8 pr-7 py-1.5 rounded-lg text-xs outline-none focus:border-cyan-500 font-mono shadow-inner"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Hierarchical Article Directory Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {(!allArticlesFlat || allArticlesFlat.length === 0) ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No articles found in {currentConfig?.label || 'compendium'}.
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No articles match "{searchQuery}".
            </div>
          ) : (
            filteredSections.map(sec => {
              const isCollapsed = Boolean(collapsedSections[sec.name]) && !searchQuery.trim();
              const secIcon = getSectionIcon(sec.name);

              return (
                <div key={sec.name} className="bg-slate-900/40 rounded-lg border border-slate-800/80 overflow-hidden">
                  {/* Section Folder Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.name)}
                    className="w-full text-left px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/80 transition-colors flex items-center justify-between border-b border-slate-800/60 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </span>
                      <span className="text-sm shrink-0">{secIcon}</span>
                      <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider truncate">
                        {sec.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-300 font-bold shrink-0">
                      {sec.count}
                    </span>
                  </button>

                  {/* Section Child Items */}
                  {!isCollapsed && (
                    <div className="p-1 space-y-0.5">
                      {sec.items.map(item => {
                        const isSelected = activeArticle?.id === item.id;
                        const children = childMap[item.id] || childMap[item.name?.toLowerCase()] || [];

                        return (
                          <div key={item.id || item.name} className="flex flex-col">
                            <TreeArticleItem
                              item={item}
                              isSelected={isSelected}
                              childrenCount={children.length}
                              prefix="• "
                              onSelect={() => setSelectedArticleId(item.id)}
                              onOpenEdit={() => isAdmin && handleOpenItem(item, true)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-950 border border-cyan-500/70 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.25)] font-bold'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                              }`}
                            />

                            {/* Render Child Sub-Articles (if article has sub-children) */}
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
                                      onSelect={() => setSelectedArticleId(child.id)}
                                      onOpenEdit={() => isAdmin && handleOpenItem(child, true)}
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
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>{sections.length} Section Folders</span>
          <span className="text-cyan-400 font-bold">{allArticlesFlat.length} Articles</span>
        </div>
      </aside>

      {/* RIGHT PANEL: Article Viewer / Content Display (Desktop Side-by-Side) */}
      <main className="flex flex-col flex-1 max-md:hidden overflow-y-auto p-6 lg:p-8 bg-slate-900/95">
        {activeArticle ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header & Controls */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    {currentConfig?.label || 'Compendium'}
                  </span>
                  {activeArticle.parent && (
                    <span className="text-xs font-mono text-amber-400">
                      / {activeArticle.parent}
                    </span>
                  )}
                  {activeArticle.entry_type && (
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono uppercase font-bold">
                      {activeArticle.entry_type}
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
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic p-12">
            <p className="mb-4">Select an article from the directory tree on the left to view.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DBMWikiView;
