/**
 * @file CatalogSearchFilter.tsx
 * @description Fast search and faceted filter bar for the Left Module Catalog.
 * Supports quick string filtering, faceted tags (#maps, #hero, #clue, #item),
 * and input clearing.
 */

import React from 'react';
import { Search, X, Hash } from 'lucide-react';

export interface CatalogSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterTag: string | null;
  onSelectFilterTag: (tag: string | null) => void;
  placeholder?: string;
  totalCount?: number;
}

const QUICK_TAGS = ['#maps', '#hero', '#npc', '#clue', '#item'];

export const CatalogSearchFilter: React.FC<CatalogSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  activeFilterTag,
  onSelectFilterTag,
  placeholder = 'Search catalog...',
  totalCount
}) => {
  return (
    <div className="p-2 border-b border-slate-800/80 bg-[#0a0e14] shrink-0 space-y-1.5 select-none font-sans">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search size={13} className="absolute left-2.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-7 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500/80 focus:outline-none text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Faceted Filter Tag Pills */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-[10px] font-mono">
        {QUICK_TAGS.map((tag) => {
          const isSelected = activeFilterTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectFilterTag(isSelected ? null : tag)}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-0.5 shrink-0 ${
                isSelected
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 font-bold'
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Hash size={9} />
              <span>{tag.replace('#', '')}</span>
            </button>
          );
        })}

        {totalCount !== undefined && (
          <span className="ml-auto text-[9.5px] text-slate-500 shrink-0 font-bold">
            {totalCount} items
          </span>
        )}
      </div>
    </div>
  );
};

export default CatalogSearchFilter;
