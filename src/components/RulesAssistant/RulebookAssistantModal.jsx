import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  BookMarked,
  Copy,
  Check,
  Send,
  Sparkles,
  X,
  ExternalLink,
  Tag,
  Shield,
  Zap,
  Activity,
  Coins,
  Rocket
} from 'lucide-react';
import { queryRulebook, RULEBOOK_CORPUS } from '../../services/rulebookRagService';
import { AudioService } from '../../services/audioService';

export default function RulebookAssistantModal({
  isOpen,
  onClose,
  initialQuery = '',
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Filtered / Searched Rule Results
  const results = useMemo(() => {
    let res = queryRulebook(searchQuery);
    if (selectedCategory !== 'all') {
      res = res.filter(r => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    return res;
  }, [searchQuery, selectedCategory]);

  const handleCopy = (entry) => {
    const text = `📖 **[${entry.source} · p.${entry.page}] ${entry.topic}**\n\n${entry.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    AudioService.playTerminalBeep(980, 0.05);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBroadcast = (entry) => {
    if (onBroadcastToChat) {
      const text = `📖 **[RULEBOOK ADJUDICATION: ${entry.topic.toUpperCase()}]**\n*Source: ${entry.source}, Page ${entry.page}*\n\n${entry.content}`;
      onBroadcastToChat(text);
      AudioService.playTerminalBeep(1040, 0.08);
      onClose();
    }
  };

  const categories = [
    { id: 'all', label: 'All Rules', icon: BookOpen },
    { id: 'combat', label: 'Combat & Resolution', icon: Shield },
    { id: 'health', label: 'Health & Damage', icon: Activity },
    { id: 'metaphysics', label: 'Metaphysics', icon: Zap },
    { id: 'economy', label: 'Economatrix', icon: Coins },
    { id: 'vehicles', label: 'Starships & Vehicles', icon: Rocket }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] bg-[#0c1018] border-2 border-indigo-500/70 rounded-2xl shadow-[0_0_45px_rgba(99,102,241,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-indigo-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-indigo-300 flex items-center gap-2">
                Semantic Rulebook Assistant &amp; `/askrule` Index
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  44 RULEBOOKS INDEXED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instant rule adjudications with cited rulebook sources, pages, and official mechanics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-col gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules (e.g. nonlethal damage, massive damage, cover dc, starship bridge, economatrix)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-indigo-200 placeholder-slate-500 focus:border-indigo-400 outline-none font-medium transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSel = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No matching rulebook entries found for "{searchQuery}". Try searching keywords like "Vitality", "Cover", "Karma", or "Starship".
            </div>
          ) : (
            results.map(entry => {
              const isCopied = copiedId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col gap-2.5 text-xs shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-indigo-300">{entry.topic}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {entry.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] text-amber-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{entry.source}, Page {entry.page}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Tag className="w-3 h-3" />
                      <span>{entry.keywords.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(entry)}
                        className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy Rule'}</span>
                      </button>

                      {onBroadcastToChat && (
                        <button
                          type="button"
                          onClick={() => handleBroadcast(entry)}
                          className="px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Broadcast</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
