import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const DBMWikiView = ({
  currentConfig,
  handleCreateNew,
  currentItems,
  handleOpenItem,
  isAdmin = true
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Active selected article object
  const activeArticle = useMemo(() => {
    if (!currentItems || currentItems.length === 0) return null;
    if (selectedArticleId) {
      const found = currentItems.find(item => item.id === selectedArticleId || item.name === selectedArticleId);
      if (found) return found;
    }
    return currentItems[0];
  }, [currentItems, selectedArticleId]);

  // Build hierarchical parent/child article tree
  const { topArticles, childMap } = useMemo(() => {
    const top = [];
    const children = {};

    (currentItems || []).forEach(item => {
      if (!item.parent || item.parent === '' || item.parent === '-- Select --') {
        top.push(item);
      } else {
        if (!children[item.parent]) children[item.parent] = [];
        children[item.parent].push(item);
      }
    });

    top.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.name.localeCompare(b.name));
    Object.keys(children).forEach(p => {
      children[p].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.name.localeCompare(b.name));
    });

    return { topArticles: top, childMap: children };
  }, [currentItems]);

  // Filtered articles for search
  const filteredTopArticles = topArticles.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
  });

  // Render Inter-Wiki Links [[Article Name]]
  const renderWikiContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\[[^\]]+\]\])/g);

    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const targetName = part.slice(2, -2).trim();
        const targetItem = (currentItems || []).find(item => item.name.toLowerCase() === targetName.toLowerCase());

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
            className="text-cyan-400 hover:text-cyan-200 font-bold underline px-1 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30 transition-all cursor-pointer"
            title={targetItem ? `Jump to article "${targetName}"` : `Article "${targetName}" not found`}
          >
            📖 {targetName}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const preProcessWikiText = (text) => {
    if (!text) return '';
    // Convert [[Article Name]] to markdown link [Article Name](wiki:Article Name)
    return text.replace(/\[\[([^\]]+)\]\]/g, '[$1](wiki:$1)');
  };

  const MarkdownComponents = {
    a: ({ node, href, children, ...props }) => {
      if (href && href.startsWith('wiki:')) {
        const targetName = href.replace('wiki:', '').trim();
        const targetItem = (currentItems || []).find(item => item.name.toLowerCase() === targetName.toLowerCase());
        return (
          <button
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
            📖 {children}
          </button>
        );
      }
      return <a href={href} className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4 pb-2 border-b border-slate-700" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-cyan-300 mt-5 mb-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-amber-300 mt-4 mb-2" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    p: ({node, ...props}) => <p className="my-3 leading-relaxed" {...props} />,
    code: ({node, inline, ...props}) => inline 
      ? <code className="bg-slate-800 text-cyan-200 px-1 py-0.5 rounded font-mono text-sm" {...props} />
      : <code className="block bg-slate-900 p-3 rounded border border-slate-700 overflow-x-auto text-sm my-3 font-mono text-amber-200" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />
  };

  return (
    <div className="flex-1 flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full relative">
      {/* Mobile / Narrow View Full Article Modal Overlay */}
      {selectedArticleId && activeArticle && (
        <div className="fixed inset-0 z-50 bg-[#0d1117]/95 backdrop-blur-md flex flex-col overflow-hidden font-sans p-3 sm:p-6 md:hidden">
          <div className="bg-[#0d1117] border border-cyan-500/50 rounded-xl w-full h-full shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                {activeArticle.parent && (
                  <span className="text-[10px] text-cyan-400/80 uppercase font-mono tracking-wider block">
                    {currentConfig?.label || 'Codex'} / {activeArticle.parent}
                  </span>
                )}
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

            {/* Main Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 space-y-4 text-xs sm:text-sm text-slate-200">
              <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                  Article Description
                </h3>
                <div className="text-slate-300 font-sans">
                  {activeArticle.description ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {preProcessWikiText(activeArticle.description)}
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

            {/* Compact Close Bar Fixed at Bottom under Content */}
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
      <aside className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{currentConfig?.label || 'Rules Codex'}</span>
            {isAdmin && (
              <button
                onClick={handleCreateNew}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] uppercase rounded shadow transition-colors"
              >
                + New Article
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder={`Search ${currentConfig?.label?.toLowerCase() || 'codex'} articles...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded text-xs outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {(!currentItems || currentItems.length === 0) ? (
            <div className="p-6 text-center text-slate-500 italic text-xs">
              No {currentConfig?.label?.toLowerCase() || 'rules codex'} articles found.
            </div>
          ) : (
            filteredTopArticles.map(item => {
              const isSelected = activeArticle?.id === item.id;
              const children = childMap[item.name] || childMap[item.id] || [];

              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => setSelectedArticleId(item.id)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>📜 {item.name}</span>
                    {children.length > 0 && (
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">
                        {children.length}
                      </span>
                    )}
                  </button>

                  {/* Render Child Sub-Tree */}
                  {children.length > 0 && (
                    <div className="pl-4 my-1 flex flex-col gap-1 border-l-2 border-cyan-500/30 ml-3">
                      {children.map(child => {
                        const isChildSelected = activeArticle?.id === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => setSelectedArticleId(child.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                              isChildSelected
                                ? 'text-cyan-300 font-bold bg-cyan-900/40 border border-cyan-500/40'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            ↳ {child.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT PANEL: Article Viewer / Content Display (Desktop Side-by-Side) */}
      <main className="hidden md:flex flex-1 flex-col overflow-y-auto p-8 bg-slate-900">
        {activeArticle ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header & Controls */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                {activeArticle.parent && (
                  <span className="text-xs text-cyan-400/80 uppercase font-mono tracking-wider block mb-1">
                    {currentConfig?.label || 'Codex'} / {activeArticle.parent}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white tracking-wide uppercase">{activeArticle.name}</h1>
              </div>

              {isAdmin ? (
                <button
                  onClick={() => handleOpenItem(activeArticle, true)}
                  className="px-4 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded text-xs font-bold uppercase transition-colors"
                >
                  ✏️ Edit Article
                </button>
              ) : (
                <button
                  onClick={() => handleOpenItem(activeArticle, false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded text-xs font-bold uppercase transition-colors"
                >
                  👁️ View Details
                </button>
              )}
            </div>

            {/* Main Content Body */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-lg text-slate-200 text-sm leading-relaxed space-y-4 shadow-inner">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                Article Description
              </h3>
              <div className="text-slate-300 font-sans">
                {activeArticle.description ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {preProcessWikiText(activeArticle.description)}
                  </ReactMarkdown>
                ) : <em className="text-slate-500">No article text available.</em>}
              </div>
            </div>

            {/* Game Mechanics Box */}
            {activeArticle.mechanic && (
              <div className="bg-slate-950 border border-amber-500/40 p-5 rounded-lg text-xs space-y-2">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>⚙️</span> Game Mechanics Rules
                </h4>
                <div className="text-amber-200 font-mono whitespace-pre-line bg-slate-900 p-3 rounded border border-slate-800">
                  {renderWikiContent(activeArticle.mechanic)}
                </div>
              </div>
            )}

            {/* Guide & Notes Box */}
            {activeArticle.guide && (
              <div className="bg-slate-950 border border-cyan-500/40 p-5 rounded-lg text-xs space-y-2">
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
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic p-12">
            <p className="mb-4">Select an article from the directory tree to view.</p>
          </div>
        )}
      </main>
    </div>
  );
};
