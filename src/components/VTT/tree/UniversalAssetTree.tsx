/**
 * @file UniversalAssetTree.tsx
 * @description Dynamic, path-based hierarchical tree viewer for Tangent SF map assets.
 * Recursively parses `AssetUnit.tree_path` to build collapsible folder accordions
 * without hardcoded category limitations.
 */

import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Layers, 
  Users, 
  Biohazard, 
  Shield, 
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import type { AssetUnit, AssetCategory } from '../../../schemas/assetUnitSchema';
import { buildAssetTree, countDescendantItems, type TreeNode } from './treeUtils.ts';

export interface UniversalAssetTreeProps {
  assets: AssetUnit[];
  selectedUnitId?: string;
  onSelectUnit?: (unit: AssetUnit) => void;
  searchQuery?: string;
  categoryFilter?: AssetCategory | 'all';
}

function getCategoryIcon(category: AssetCategory) {
  switch (category) {
    case 'terrain_brush':
      return Layers;
    case 'doodad':
      return Box;
    case 'token':
    case 'creature':
      return Users;
    case 'hazard':
      return Biohazard;
    case 'vehicle':
      return Truck;
    case 'wall_portal':
      return Shield;
    default:
      return Sparkles;
  }
}

export const UniversalAssetTree: React.FC<UniversalAssetTreeProps> = ({
  assets,
  selectedUnitId,
  onSelectUnit,
  searchQuery = '',
  categoryFilter = 'all'
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Environments', 'Props']));

  // Filter assets by search query and category
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Category check
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) {
        return false;
      }
      // Query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesId = asset.unit_id.toLowerCase().includes(q);
        const matchesTag = asset.tags.some(t => t.toLowerCase().includes(q));
        const matchesPath = asset.tree_path.some(p => p.toLowerCase().includes(q));
        return matchesName || matchesId || matchesTag || matchesPath;
      }
      return true;
    });
  }, [assets, searchQuery, categoryFilter]);

  // Construct hierarchical tree from filtered assets
  const treeRoot = useMemo(() => buildAssetTree(filteredAssets), [filteredAssets]);

  const toggleFolder = (pathKey: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) {
        next.delete(pathKey);
      } else {
        next.add(pathKey);
      }
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const sortedSubfolders = Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div key={node.fullPath.join('/')} className="space-y-0.5">
        {sortedSubfolders.map(subNode => {
          const pathKey = subNode.fullPath.join('/');
          const isExpanded = expandedFolders.has(pathKey) || Boolean(searchQuery.trim());
          const totalItemCount = countDescendantItems(subNode);

          return (
            <div key={pathKey} className="text-xs">
              <button
                type="button"
                onClick={() => toggleFolder(pathKey)}
                style={{ paddingLeft: `${depth * 12 + 6}px` }}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-colors text-left group"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="font-mono font-medium truncate">{subNode.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {totalItemCount}
                </span>
              </button>

              {isExpanded && (
                <div className="border-l border-slate-800/80 ml-3">
                  {renderNode(subNode, depth + 1)}
                </div>
              )}
            </div>
          );
        })}

        {/* Leaf Items */}
        {node.items.map(item => {
          const isSelected = selectedUnitId === item.unit_id;
          const CategoryIcon = getCategoryIcon(item.category);

          return (
            <div
              key={item.unit_id}
              style={{ paddingLeft: `${depth * 12 + 16}px` }}
              onClick={() => onSelectUnit?.(item)}
              className={`flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200 shadow-sm shadow-cyan-900/40'
                  : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <CategoryIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-mono font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[9px] font-mono text-slate-500 bg-slate-900/80 px-1 py-0.5 rounded border border-slate-800">
                  {item.dimensions[0]}x{item.dimensions[1]}
                </span>
                {item.vtt_properties.dynamicLighting?.emits && (
                  <span title="Illuminated">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 select-none overflow-y-auto custom-scrollbar p-2">
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <Info className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs font-mono">No matching assets found.</p>
        </div>
      ) : (
        renderNode(treeRoot)
      )}
    </div>
  );
};

export default UniversalAssetTree;
