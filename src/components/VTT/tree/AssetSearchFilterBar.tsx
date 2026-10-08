/**
 * @file AssetSearchFilterBar.tsx
 * @description Search and Category Filter Toolbar for the Universal Asset Tree.
 */

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ASSET_CATEGORIES, type AssetCategory } from '../../../schemas/assetUnitSchema';

export interface AssetSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: AssetCategory | 'all';
  onCategoryChange: (category: AssetCategory | 'all') => void;
  provenanceFilter: 'all' | 'preset' | 'custom_upload';
  onProvenanceChange: (prov: 'all' | 'preset' | 'custom_upload') => void;
}

const CATEGORY_LABELS: Record<AssetCategory | 'all', string> = {
  all: 'All',
  terrain_brush: 'Terrain',
  doodad: 'Props',
  wall_portal: 'Portals',
  hazard: 'Hazards',
  vehicle: 'Vehicles',
  creature: 'Creatures',
  token: 'Tokens'
};

export const AssetSearchFilterBar: React.FC<AssetSearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  provenanceFilter,
  onProvenanceChange
}) => {
  return (
    <div className="flex flex-col space-y-2 p-2 bg-slate-900/90 border-b border-cyan-900/40">
      {/* Search Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by name, ID, or #tag..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 text-slate-400 hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-900/50'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          All
        </button>

        {ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-900/50'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Provenance Filter Toggle */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
        <span className="flex items-center space-x-1">
          <Filter className="w-3 h-3 text-cyan-400" />
          <span>Source:</span>
        </span>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => onProvenanceChange('all')}
            className={`px-1.5 py-0.5 rounded ${provenanceFilter === 'all' ? 'text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Any
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onProvenanceChange('preset')}
            className={`px-1.5 py-0.5 rounded ${provenanceFilter === 'preset' ? 'text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Core Presets
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onProvenanceChange('custom_upload')}
            className={`px-1.5 py-0.5 rounded ${provenanceFilter === 'custom_upload' ? 'text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            User Custom
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetSearchFilterBar;
