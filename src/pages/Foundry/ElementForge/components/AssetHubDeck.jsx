/**
 * @file AssetHubDeck.jsx
 * @description Layer 3: Asset Hub (The 'Who / What Else') for the AIME Creative Suite.
 * Contextual linking module that weaves individual elements into a compounding web of lore.
 * Supports:
 *   - 4 Importance Tiers: High, Typical, Low, Non-Informative
 *   - Directorial Annotations (The "Why")
 *   - Quick search & asset discovery
 */

import React, { useState, useMemo } from 'react';
import { getTypePillStyle, AIME_CORE_MODULES } from '../elementSchemas';
import { 
  Network, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Tag, 
  ShieldAlert,
  Flame,
  Layers,
  EyeOff
} from 'lucide-react';

export const IMPORTANCE_TIERS = [
  {
    id: 'high',
    label: 'High',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    description: 'Foreground focus. Dominates narrative generation and character conflict.'
  },
  {
    id: 'typical',
    label: 'Typical',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
    description: 'Core background context. Provides essential world and situational grounding.'
  },
  {
    id: 'low',
    label: 'Low',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    description: 'Subtle nuance. Mentioned as ambient texture, subtle iconography, or easter eggs.'
  },
  {
    id: 'non_informative',
    label: 'Non-Informative',
    badgeClass: 'bg-slate-900/90 text-slate-400 border-slate-700/60',
    description: 'Reference only. Kept linked for organization but excluded from prompt synthesis.'
  }
];

export { normalizeLinkedAssets } from './assetHubUtils.js';

export default function AssetHubDeck({
  assetHub = [],
  onChangeAssetHub,
  availableElements = [],
  currentElementId = null,
  isCollapsedByDefault = false
}) {
  const [isOpen, setIsOpen] = useState(!isCollapsedByDefault);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const normalizedHub = useMemo(() => {
    return normalizeLinkedAssets(assetHub, availableElements);
  }, [assetHub, availableElements]);

  const linkedIds = useMemo(() => {
    return new Set(normalizedHub.map(a => a.assetId));
  }, [normalizedHub]);

  // Elements available to be linked (excluding self and already linked)
  const candidateElements = useMemo(() => {
    return availableElements.filter(el => {
      if (el.id === currentElementId) return false;
      if (linkedIds.has(el.id)) return false;
      if (typeFilter !== 'all' && el.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (el.title || el.name || '').toLowerCase().includes(q);
        const matchesType = (el.type || '').toLowerCase().includes(q);
        const matchesContent = (el.content || '').toLowerCase().includes(q);
        return matchesTitle || matchesType || matchesContent;
      }
      return true;
    });
  }, [availableElements, currentElementId, linkedIds, typeFilter, searchQuery]);

  const handleLinkElement = (elem) => {
    const newEntry = {
      assetId: elem.id,
      assetTitle: elem.title || elem.name || 'Untitled Asset',
      assetType: elem.type || 'Element',
      importance: 'typical',
      annotation: ''
    };
    onChangeAssetHub([...normalizedHub, newEntry]);
    setSearchQuery('');
  };

  const handleUnlinkAsset = (assetId) => {
    const updated = normalizedHub.filter(a => a.assetId !== assetId);
    onChangeAssetHub(updated);
  };

  const handleImportanceChange = (assetId, newImportance) => {
    const updated = normalizedHub.map(a => {
      if (a.assetId === assetId) {
        return { ...a, importance: newImportance };
      }
      return a;
    });
    onChangeAssetHub(updated);
  };

  const handleAnnotationChange = (assetId, newNote) => {
    const updated = normalizedHub.map(a => {
      if (a.assetId === assetId) {
        return { ...a, annotation: newNote };
      }
      return a;
    });
    onChangeAssetHub(updated);
  };

  return (
    <div className="border border-slate-800 rounded-2xl bg-[#090d16]/90 overflow-hidden shadow-lg font-mono">
      {/* Header Bar */}
      <div className="p-3.5 bg-gradient-to-r from-slate-950 via-[#0d1424] to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2.5 text-left flex-1 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-sm shadow-sm group-hover:bg-indigo-500/30 transition-colors">
            <Network size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                Layer 3: Asset Hub
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-bold">
                {normalizedHub.length} Linked
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
              Contextual linking web: Compound lore with importance rankings & directorial notes.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(prev => !prev)}
            className="px-2.5 py-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={12} />
            <span>Link Asset</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-slate-400 hover:text-white p-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 space-y-3">
          {/* Quick Asset Search Drawer */}
          {isSearchOpen && (
            <div className="p-3 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Search size={11} /> Find & Link Assets from Ecosystem
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, archetype, or keywords..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-400 text-xs text-white p-2 rounded-lg outline-none font-mono"
                  autoFocus
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs p-2 rounded-lg outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {AIME_CORE_MODULES.map(m => (
                    <option key={m.type} value={m.canonicalType}>
                      {m.icon} {m.type}
                    </option>
                  ))}
                  <option value="Faction">Faction</option>
                  <option value="Item">Item</option>
                </select>
              </div>

              {/* Candidate Results */}
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin pt-1">
                {candidateElements.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 italic">
                    {searchQuery ? 'No matching assets found.' : 'All available assets already linked.'}
                  </div>
                ) : (
                  candidateElements.slice(0, 10).map(elem => (
                    <div
                      key={elem.id}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getTypePillStyle(elem.type)}`}>
                          {elem.type}
                        </span>
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {elem.title || elem.name || 'Untitled'}
                        </span>
                        {elem.fields?.archetype && (
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            • {elem.fields.archetype}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLinkElement(elem)}
                        className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus size={10} /> Link
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Linked Assets List */}
          {normalizedHub.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-2">
              <Network size={28} className="text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                No Contextual Assets Linked
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto font-sans leading-relaxed">
                Import personas, locations, species, technologies, or philosophies to provide the AI with deep contextual awareness and prevent generic output.
              </p>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="mt-1 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus size={12} /> Link First Asset
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {normalizedHub.map((asset) => {
                const foundCatalogItem = availableElements.find(e => e.id === asset.assetId);

                return (
                  <div
                    key={asset.assetId}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition-all space-y-2.5"
                  >
                    {/* Top Row: Asset Identity & Importance Buttons */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${getTypePillStyle(asset.assetType)}`}>
                          {asset.assetType}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {asset.assetTitle}
                        </span>
                        {foundCatalogItem?.fields?.oneLinePitch && (
                          <span className="text-[10px] text-slate-400 italic truncate max-w-xs hidden md:inline">
                            — "{foundCatalogItem.fields.oneLinePitch}"
                          </span>
                        )}
                      </div>

                      {/* Importance Tier Pills */}
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        {IMPORTANCE_TIERS.map(tier => {
                          const isActive = asset.importance === tier.id;
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => handleImportanceChange(asset.assetId, tier.id)}
                              title={tier.description}
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                isActive 
                                  ? tier.badgeClass 
                                  : 'text-slate-500 hover:text-slate-300 bg-transparent'
                              }`}
                            >
                              {tier.label}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnlinkAsset(asset.assetId)}
                        title="Unlink Asset from this element"
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Directorial Annotation Input (The "Why") */}
                    <div className="flex items-center gap-2 bg-[#0c111c] border border-slate-800/90 rounded-lg p-1.5 focus-within:border-indigo-500/70 transition-colors">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider shrink-0 px-1">
                        Directorial Note:
                      </span>
                      <input
                        type="text"
                        value={asset.annotation || ''}
                        onChange={(e) => handleAnnotationChange(asset.assetId, e.target.value)}
                        placeholder="Explain the connection (e.g. 'Source of their ethical rift', 'Subconscious fear trigger')..."
                        className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none font-sans"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
