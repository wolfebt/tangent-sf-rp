/**
 * @file scenarioTreeEngine.js
 * @description Pure algorithmic engine for recursive scenario & element tree operations
 * in the Tangent Adventure Development Environment (ADE).
 * 
 * Provides:
 * - Tree searching and pathing (findNodeInTree, getBreadcrumbPath, calculateNodeDepth)
 * - Cycle & descendant safety (isDescendant, canReparent)
 * - Safe node removal & parent insertion (removeNodeFromTree, insertNodeIntoParent)
 * - Hierarchy reordering & reparenting (moveNodeInTree, reorderNodeSiblings, reorderRelativeNode)
 * - Tree flattening & projection (flattenTree)
 */

/**
 * Recursively search a tree for a node with the given ID.
 * @param {Array<object>} nodes 
 * @param {string} id 
 * @returns {object|null}
 */
export function findNodeInTree(nodes, id) {
  if (!Array.isArray(nodes) || !id) return null;
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children && n.children.length > 0) {
      const found = findNodeInTree(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Checks if searchId is an existing descendant of any node in the list.
 * @param {Array<object>} nodes 
 * @param {string} searchId 
 * @returns {boolean}
 */
export function isDescendant(nodes, searchId) {
  if (!Array.isArray(nodes) || !searchId) return false;
  for (const n of nodes) {
    if (n.id === searchId) return true;
    if (n.children && n.children.length > 0) {
      if (isDescendant(n.children, searchId)) return true;
    }
  }
  return false;
}

/**
 * Checks if reparenting a node under targetParentId is valid (i.e. not self or descendant).
 * @param {Array<object>} rootNodes 
 * @param {string} nodeId 
 * @param {string|null} targetParentId 
 * @returns {boolean}
 */
export function canReparent(rootNodes, nodeId, targetParentId) {
  if (!nodeId) return false;
  if (!targetParentId) return true; // Moving to root is always structurally valid
  if (nodeId === targetParentId) return false; // Cannot be parent of oneself

  const node = findNodeInTree(rootNodes, nodeId);
  if (!node) return false;

  // Cannot move a node inside one of its own children/descendants
  if (node.children && isDescendant(node.children, targetParentId)) {
    return false;
  }
  return true;
}

/**
 * Calculates the 0-indexed depth of a node in the tree. Returns -1 if not found.
 * @param {Array<object>} nodes 
 * @param {string} targetId 
 * @param {number} currentDepth 
 * @returns {number}
 */
export function calculateNodeDepth(nodes, targetId, currentDepth = 0) {
  if (!Array.isArray(nodes) || !targetId) return -1;
  for (const n of nodes) {
    if (n.id === targetId) return currentDepth;
    if (n.children && n.children.length > 0) {
      const depth = calculateNodeDepth(n.children, targetId, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
}

/**
 * Returns an array of node titles leading to targetId, or null if not found.
 * @param {Array<object>} nodes 
 * @param {string} targetId 
 * @param {Array<string>} currentPath 
 * @returns {Array<string>|null}
 */
export function getBreadcrumbPath(nodes, targetId, currentPath = []) {
  if (!Array.isArray(nodes) || !targetId) return null;
  for (const n of nodes) {
    const newPath = [...currentPath, n.title || 'Untitled'];
    if (n.id === targetId) return newPath;
    if (n.children && n.children.length > 0) {
      const found = getBreadcrumbPath(n.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Returns an array of node objects { id, title } leading to targetId, or null if not found.
 * @param {Array<object>} nodes 
 * @param {string} targetId 
 * @param {Array<{ id: string, title: string }>} currentPath 
 * @returns {Array<{ id: string, title: string }>|null}
 */
export function getBreadcrumbNodePath(nodes, targetId, currentPath = []) {
  if (!Array.isArray(nodes) || !targetId) return null;
  for (const n of nodes) {
    const newPath = [...currentPath, { id: n.id, title: n.title || 'Untitled' }];
    if (n.id === targetId) return newPath;
    if (n.children && n.children.length > 0) {
      const found = getBreadcrumbNodePath(n.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively removes a node by ID and returns { cleanedNodes, removedNode }.
 * Immutable operation.
 * @param {Array<object>} nodes 
 * @param {string} targetId 
 * @returns {{ cleanedNodes: Array<object>, removedNode: object|null }}
 */
export function removeNodeFromTree(nodes, targetId) {
  if (!Array.isArray(nodes) || !targetId) {
    return { cleanedNodes: nodes || [], removedNode: null };
  }

  let removedNode = null;

  function removeRecursive(list) {
    const result = [];
    for (const item of list) {
      if (item.id === targetId) {
        removedNode = item;
        // Exclude from result
      } else {
        const itemCopy = { ...item };
        if (itemCopy.children && itemCopy.children.length > 0) {
          itemCopy.children = removeRecursive(itemCopy.children);
        }
        result.push(itemCopy);
      }
    }
    return result;
  }

  const cleanedNodes = removeRecursive(nodes);
  return { cleanedNodes, removedNode };
}

/**
 * Inserts a node into a target parent, or at the root level if targetParentId is null.
 * Immutable operation.
 * @param {Array<object>} nodes 
 * @param {string|null} targetParentId 
 * @param {object} nodeToInsert 
 * @returns {Array<object>}
 */
export function insertNodeIntoParent(nodes, targetParentId, nodeToInsert) {
  if (!nodeToInsert) return nodes || [];
  if (!targetParentId) {
    return [...(nodes || []), nodeToInsert];
  }

  function insertRecursive(list) {
    return list.map(item => {
      if (item.id === targetParentId) {
        return {
          ...item,
          children: [...(item.children || []), nodeToInsert]
        };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: insertRecursive(item.children)
        };
      }
      return item;
    });
  }

  return insertRecursive(nodes || []);
}

/**
 * Moves a node to a new parent or to root level, preventing circular hierarchy corruption.
 * @param {Array<object>} rootNodes 
 * @param {string} nodeId 
 * @param {string|null} targetParentId 
 * @returns {Array<object>}
 */
export function moveNodeInTree(rootNodes, nodeId, targetParentId) {
  if (!Array.isArray(rootNodes) || !nodeId) return rootNodes;
  if (!canReparent(rootNodes, nodeId, targetParentId)) {
    return rootNodes;
  }

  const { cleanedNodes, removedNode } = removeNodeFromTree(rootNodes, nodeId);
  if (!removedNode) return rootNodes;

  return insertNodeIntoParent(cleanedNodes, targetParentId, removedNode);
}

/**
 * Reorders a node up or down among its immediate siblings.
 * @param {Array<object>} rootNodes 
 * @param {string} nodeId 
 * @param {'up'|'down'} direction 
 * @returns {Array<object>}
 */
export function reorderNodeSiblings(rootNodes, nodeId, direction) {
  if (!Array.isArray(rootNodes) || !nodeId) return rootNodes;

  function reorderInArray(nodes) {
    const idx = nodes.findIndex(n => n.id === nodeId);
    if (idx !== -1) {
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= nodes.length) return nodes;
      const newNodes = [...nodes];
      const [moved] = newNodes.splice(idx, 1);
      newNodes.splice(targetIdx, 0, moved);
      return newNodes;
    }
    return nodes.map(node => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: reorderInArray(node.children)
        };
      }
      return node;
    });
  }

  return reorderInArray(rootNodes);
}

/**
 * Reorders a node relative to another target node ('above' or 'below') anywhere in the tree.
 * @param {Array<object>} rootNodes 
 * @param {string} draggedId 
 * @param {string} targetId 
 * @param {'above'|'below'} pos 
 * @returns {Array<object>}
 */
export function reorderRelativeNode(rootNodes, draggedId, targetId, pos = 'below') {
  if (!Array.isArray(rootNodes) || !draggedId || !targetId) return rootNodes;
  if (draggedId === targetId) return rootNodes;

  // Prevent moving into descendant
  const dragged = findNodeInTree(rootNodes, draggedId);
  if (dragged?.children && isDescendant(dragged.children, targetId)) {
    return rootNodes;
  }

  const { cleanedNodes, removedNode } = removeNodeFromTree(rootNodes, draggedId);
  if (!removedNode) return rootNodes;

  function insertNode(nodes) {
    const idx = nodes.findIndex(n => n.id === targetId);
    if (idx !== -1) {
      const insertAt = pos === 'above' ? idx : idx + 1;
      const result = [...nodes];
      result.splice(insertAt, 0, removedNode);
      return result;
    }
    return nodes.map(n => ({
      ...n,
      children: n.children && n.children.length > 0 ? insertNode(n.children) : n.children
    }));
  }

  return insertNode(cleanedNodes);
}

/**
 * Recursively flattens a tree into an array of nodes with full parentPath annotations.
 * @param {Array<object>} nodes 
 * @param {string} parentPath 
 * @returns {Array<object>}
 */
export function flattenTree(nodes, parentPath = '') {
  if (!Array.isArray(nodes)) return [];
  const list = [];

  function traverse(listNodes, currentPath) {
    listNodes.forEach(node => {
      const title = (node.title && node.title.trim()) ? node.title.trim() : `Untitled ${node.type || 'Element'}`;
      list.push({
        ...node,
        parentPath: currentPath
      });
      if (node.children && node.children.length > 0) {
        const nextPath = currentPath ? `${currentPath} ❯ ${title}` : title;
        traverse(node.children, nextPath);
      }
    });
  }

  traverse(nodes, parentPath);
  return list;
}

/**
 * Transactional in-memory history manager for scenario and element trees.
 * Supports push, undo, redo, and stack limits.
 */
export class TreeHistoryManager {
  constructor(initialTree = [], maxDepth = 30) {
    this.past = [];
    this.present = Array.isArray(initialTree) ? JSON.parse(JSON.stringify(initialTree)) : [];
    this.future = [];
    this.maxDepth = maxDepth;
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  push(newTree) {
    if (!Array.isArray(newTree)) return;
    const clonedPresent = JSON.parse(JSON.stringify(this.present));
    this.past.push(clonedPresent);
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.present = JSON.parse(JSON.stringify(newTree));
    this.future = [];
  }

  undo() {
    if (!this.canUndo) return null;
    const previous = this.past.pop();
    this.future.unshift(JSON.parse(JSON.stringify(this.present)));
    this.present = previous;
    return JSON.parse(JSON.stringify(this.present));
  }

  redo() {
    if (!this.canRedo) return null;
    const next = this.future.shift();
    this.past.push(JSON.parse(JSON.stringify(this.present)));
    this.present = next;
    return JSON.parse(JSON.stringify(this.present));
  }

  reset(initialTree = []) {
    this.past = [];
    this.present = Array.isArray(initialTree) ? JSON.parse(JSON.stringify(initialTree)) : [];
    this.future = [];
  }
}
