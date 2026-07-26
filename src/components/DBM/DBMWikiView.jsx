import React, { useState, useMemo } from 'react';

export const DBMWikiView = ({
  currentConfig,
  handleCreateNew,
  currentItems,
  handleOpenItem
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

  return (
    <div className="flex-1 flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full">
      {/* LEFT PANEL: Directory Tree Navigation */}
      <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Rules Codex</span>
            <button
              onClick={handleCreateNew}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] uppercase rounded shadow transition-colors"
            >
              + New Article
            </button>
          </div>
          <input
            type="text"
            placeholder="Search codex articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded text-xs outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {(!currentItems || currentItems.length === 0) ? (
            <div className="p-6 text-center text-slate-500 italic text-xs">
              No rules codex articles found.
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

      {/* RIGHT PANEL: Article Viewer / Content Display */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-slate-900">
        {activeArticle ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header & Controls */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                {activeArticle.parent && (
                  <span className="text-xs text-cyan-400/80 uppercase font-mono tracking-wider block mb-1">
                    Codex / {activeArticle.parent}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white tracking-wide uppercase">{activeArticle.name}</h1>
              </div>

              <button
                onClick={() => handleOpenItem(activeArticle, true)}
                className="px-4 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded text-xs font-bold uppercase transition-colors"
              >
                ✏️ Edit Article
              </button>
            </div>

            {/* Main Content Body */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-lg text-slate-200 text-sm leading-relaxed space-y-4 shadow-inner">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                Article Description
              </h3>
              <div className="whitespace-pre-line text-slate-300 font-sans">
                {renderWikiContent(activeArticle.description) || <em className="text-slate-500">No article text available.</em>}
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
