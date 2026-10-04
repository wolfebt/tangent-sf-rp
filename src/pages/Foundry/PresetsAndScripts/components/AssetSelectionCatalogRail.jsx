/**
 * @file AssetSelectionCatalogRail.jsx
 * @description Dynamic Asset Selection Catalog Rail for Pillar 3: Presets & Scripts Studio.
 * Replaces overcrowded horizontal slider pills with a clean left-side horizontal menu
 * and adjacent asset feed with instant search and status filters.
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Bot, 
  ShieldAlert, 
  Map as MapIcon, 
  Swords, 
  Box, 
  Cpu, 
  Sparkles,
  CheckCircle2,
  CircleDashed,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CATALOG_CATEGORIES } from '../utils/assetAggregator';
import { AudioService } from '../../../../services/audioService';

export const AssetSelectionCatalogRail = ({
  assets = [],
  selectedAssetId = null,
  onSelectAsset,
  activeCategory = 'all',
  onSelectCategory,
  onCreateNewMacro,
  onNavigateToForge
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'scripted' | 'unassigned'

  // Category counts computation
  const categoryCounts = useMemo(() => {
    const counts = {
      all: assets.length,
      personas: 0,
      props_traps: 0,
      maps: 0,
      encounters: 0,
      items: 0,
      macros: 0
    };
    assets.forEach(a => {
      if (counts[a.catalogCategory] !== undefined) {
        counts[a.catalogCategory]++;
      }
    });
    return counts;
  }, [assets]);

  // Current active category meta
  const selectedCategoryObj = useMemo(() => {
    return CATALOG_CATEGORIES.find(c => c.id === activeCategory) || CATALOG_CATEGORIES[0];
  }, [activeCategory]);

  // Filtered assets based on category, search, and status
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Category filter
      if (activeCategory !== 'all' && asset.catalogCategory !== activeCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'scripted' && !asset.isScripted) return false;
      if (statusFilter === 'unassigned' && asset.isScripted) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = asset.title.toLowerCase().includes(query);
        const matchesRole = (asset.role || '').toLowerCase().includes(query);
        const matchesDesc = (asset.description || '').toLowerCase().includes(query);
        const matchesSummary = (asset.scriptSummary || '').toLowerCase().includes(query);
        return matchesTitle || matchesRole || matchesDesc || matchesSummary;
      }
      return true;
    });
  }, [assets, activeCategory, statusFilter, searchQuery]);

  const handleCategoryClick = (catId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    onSelectCategory?.(catId);
  };

  const handleAssetClick = (asset) => {
    AudioService.playTerminalBeep(980, 0.03);
    onSelectAsset?.(asset);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'personas': return <Bot size={13} className="text-purple-400" />;
      case 'props_traps': return <ShieldAlert size={13} className="text-rose-400" />;
      case 'maps': return <MapIcon size={13} className="text-cyan-400" />;
      case 'encounters': return <Swords size={13} className="text-amber-400" />;
      case 'items': return <Box size={13} className="text-emerald-400" />;
      case 'macros': return <Cpu size={13} className="text-fuchsia-400" />;
      default: return <Layers size={13} className="text-slate-400" />;
    }
  };

  return (
    <aside
      aria-label="Module Asset Selection Catalog"
      className="w-full lg:w-[460px] xl:w-[490px] h-full flex bg-[#080d16] border-r border-slate-800 shrink-0 select-none overflow-hidden font-sans shadow-lg"
    >
      {/* ── LEFT-SIDE HORIZONTAL CATEGORY MENU (No Horizontal Sliders) ── */}
      <nav
        aria-label="Asset Categories Menu"
        className="w-44 sm:w-48 shrink-0 h-full border-r border-slate-800/90 bg-[#070a12]/98 flex flex-col justify-between p-2 select-none overflow-y-auto no-scrollbar font-sans"
      >
        <div className="space-y-1">
          {/* Header */}
          <div className="px-2 py-1.5 mb-1 flex items-center justify-between border-b border-slate-800/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Layers size={13} className="text-purple-400" />
              <span>Categories</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">
              {assets.length}
            </span>
          </div>

          {/* Stack of Horizontal Menu Item Buttons */}
          {CATALOG_CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.countKey] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent hover:border-slate-800/80'
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isSelected && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                )}

                {/* Left: Icon & Label */}
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <span className={`text-xs font-mono font-bold tracking-wider truncate ${
                    isSelected ? 'text-purple-200' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {cat.label}
                  </span>
                </div>

                {/* Right: Numerical Badge Count */}
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                  isSelected 
                    ? 'bg-purple-900/80 text-purple-200 border-purple-400/50' 
                    : 'bg-slate-950 text-slate-500 border-slate-800 group-hover:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu Footer Quick Actions */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          {activeCategory === 'macros' && (
            <button
              type="button"
              onClick={onCreateNewMacro}
              className="w-full py-1.5 px-2 rounded-lg bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/50 text-[10px] font-mono font-bold text-fuchsia-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>+ New Macro</span>
            </button>
          )}

          {onNavigateToForge && (
            <button
              type="button"
              onClick={onNavigateToForge}
              className="w-full py-1 px-2 text-[10px] font-mono text-slate-500 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Asset Forge</span>
              <span>↗</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── RIGHT SUB-COLUMN: SEARCH, STATUS CHIPS & ASSET FEED ── */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-[#080d16]">
        {/* Header Bar */}
        <div className="p-3 border-b border-slate-800 bg-[#0c121e] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-mono font-bold text-slate-300 truncate uppercase">
                {selectedCategoryObj?.label || 'All Assets'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ({filteredAssets.length})
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in category..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs font-mono text-slate-200 placeholder:text-slate-500 outline-none focus:border-purple-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter Chips: ALL | SCRIPTED | UNASSIGNED */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'scripted', label: 'Scripted' },
              { id: 'unassigned', label: 'Unassigned' }
            ].map(sf => (
              <button
                key={sf.id}
                type="button"
                onClick={() => setStatusFilter(sf.id)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  statusFilter === sf.id
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Asset Feed */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="text-2xl opacity-40">🔍</div>
              <p className="text-xs font-mono text-slate-400">
                No module assets match your filter criteria.
              </p>
              {(searchQuery || statusFilter !== 'all' || activeCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    onSelectCategory?.('all');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            filteredAssets.map(asset => {
              const isSelected = asset.id === selectedAssetId;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 group ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Header Row: Title & Script Status */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{getCategoryIcon(asset.catalogCategory)}</span>
                      <span className="font-bold text-xs text-white truncate group-hover:text-purple-200 transition-colors">
                        {asset.title}
                      </span>
                    </div>

                    <span className={`shrink-0 text-[9px] font-mono px-1.5 py-0.2 rounded-full border flex items-center gap-1 ${
                      asset.isScripted
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}>
                      {asset.isScripted ? (
                        <>
                          <CheckCircle2 size={9} className="text-emerald-400" />
                          <span>Scripted</span>
                        </>
                      ) : (
                        <>
                          <CircleDashed size={9} className="text-slate-500" />
                          <span>Idle</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Sub-label & Summary */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate max-w-[140px] text-slate-400">
                      {asset.role ? `${asset.role}` : asset.type}
                      {asset.tier ? ` · ${asset.tier}` : ''}
                    </span>
                    <span className="text-[9.5px] truncate max-w-[120px] text-cyan-400/90">
                      {asset.scriptSummary}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-800/80 bg-[#090e18] text-[10px] font-mono text-slate-500 truncate">
          💡 Click an asset to open its automation workbench.
        </div>
      </div>
    </aside>
  );
};

export default AssetSelectionCatalogRail;
