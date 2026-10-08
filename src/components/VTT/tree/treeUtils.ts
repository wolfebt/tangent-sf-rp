/**
 * @file treeUtils.ts
 * @description Pure TypeScript utility functions for hierarchical asset tree generation.
 */

import type { AssetUnit } from '../../../schemas/assetUnitSchema';

export interface TreeNode {
  name: string;
  fullPath: string[];
  children: Map<string, TreeNode>;
  items: AssetUnit[];
}

/**
 * Builds a hierarchical tree from a flat array of AssetUnits
 */
export function buildAssetTree(assets: AssetUnit[]): TreeNode {
  const root: TreeNode = {
    name: 'Root',
    fullPath: [],
    children: new Map(),
    items: []
  };

  for (const asset of assets) {
    let current = root;
    const path = asset.tree_path && asset.tree_path.length > 0 ? asset.tree_path : ['Unsorted'];

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (!current.children.has(segment)) {
        current.children.set(segment, {
          name: segment,
          fullPath: path.slice(0, i + 1),
          children: new Map(),
          items: []
        });
      }
      current = current.children.get(segment)!;
    }

    current.items.push(asset);
  }

  return root;
}

/**
 * Recursively counts all descendant items under a tree node
 */
export function countDescendantItems(node: TreeNode): number {
  let count = node.items.length;
  for (const child of node.children.values()) {
    count += countDescendantItems(child);
  }
  return count;
}
