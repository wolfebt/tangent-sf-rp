/**
 * @file customFolderService.js
 * @description Manages user-created custom folders, item assignments, and custom ordering
 * for personas and story projects in Tangent SF RP.
 * Persists to localStorage and StorageService with reactive window event broadcasting.
 */

import { StorageService } from './storageService';

const FOLDERS_KEY = 'tangent_custom_folders';
const ASSIGNMENTS_KEY = 'tangent_custom_folder_assignments';
const ORDERS_KEY = 'tangent_custom_folder_orders';
const FOLDERS_EVENT = 'tangent-folders-updated';

export const FOLDER_COLORS = [
  { name: 'Cyan', hex: '#22d3ee' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Teal', hex: '#14b8a6' }
];

/**
 * Dispatches a reactive update event to notify listeners
 */
function notifyUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FOLDERS_EVENT));
  }
}

/**
 * Retrieves all user custom folders
 * @returns {Array<{ id: string, name: string, color: string, targetType: string, createdAt: string, updatedAt: string, sortOrder: number }>}
 */
export function getFolders() {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[CustomFolderService] Failed to read folders:', e);
  }
  return [];
}

/**
 * Persists folders list
 */
export function saveFolders(folders) {
  try {
    const data = Array.isArray(folders) ? folders : [];
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(data));
    StorageService.setItem(FOLDERS_KEY, data).catch(() => {});
    notifyUpdate();
  } catch (e) {
    console.warn('[CustomFolderService] Failed to save folders:', e);
  }
}

/**
 * Creates a new custom folder
 */
export function createFolder(name, targetType = 'all', color = '#22d3ee') {
  const folders = getFolders();
  const newFolder = {
    id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name?.trim() || 'Untitled Folder',
    color: color || '#22d3ee',
    targetType: targetType || 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortOrder: folders.length
  };
  const updated = [...folders, newFolder];
  saveFolders(updated);
  return newFolder;
}

/**
 * Updates a folder's properties (name, color, targetType, sortOrder)
 */
export function updateFolder(folderId, updates) {
  const folders = getFolders();
  const updated = folders.map(f => {
    if (f.id === folderId) {
      return {
        ...f,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
  saveFolders(updated);
  return updated.find(f => f.id === folderId) || null;
}

/**
 * Deletes a folder and safely unassigns any items mapped to it
 */
export function deleteFolder(folderId) {
  const folders = getFolders().filter(f => f.id !== folderId);
  saveFolders(folders);

  // Unassign all items belonging to this deleted folder
  const assignments = getItemFolderAssignments();
  let changed = false;
  const newAssignments = { ...assignments };
  Object.keys(newAssignments).forEach(itemId => {
    if (newAssignments[itemId] === folderId) {
      delete newAssignments[itemId];
      changed = true;
    }
  });
  if (changed) {
    saveItemFolderAssignments(newAssignments);
  }

  // Remove ordering cache for this folder
  const orders = getAllFolderOrders();
  if (orders[folderId]) {
    delete orders[folderId];
    saveAllFolderOrders(orders);
  }

  notifyUpdate();
  return true;
}

/**
 * Retrieves the item -> folderId map
 * @returns {Record<string, string>}
 */
export function getItemFolderAssignments() {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('[CustomFolderService] Failed to read assignments:', e);
  }
  return {};
}

/**
 * Persists the item -> folderId map
 */
export function saveItemFolderAssignments(assignments) {
  try {
    const data = assignments && typeof assignments === 'object' ? assignments : {};
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(data));
    StorageService.setItem(ASSIGNMENTS_KEY, data).catch(() => {});
    notifyUpdate();
  } catch (e) {
    console.warn('[CustomFolderService] Failed to save assignments:', e);
  }
}

/**
 * Assigns an item (persona or story ID) to a specific folder
 * Pass null or empty string to unassign (move to Root/Unfiled)
 */
export function assignItemToFolder(itemId, folderId) {
  if (!itemId) return;
  const assignments = getItemFolderAssignments();
  const prevFolderId = assignments[itemId];
  
  if (!folderId) {
    delete assignments[itemId];
  } else {
    assignments[itemId] = folderId;
  }
  saveItemFolderAssignments(assignments);

  // Update order in new folder if assigned
  if (folderId && folderId !== prevFolderId) {
    const currentOrder = getFolderItemOrder(folderId);
    if (!currentOrder.includes(itemId)) {
      setFolderItemOrder(folderId, [...currentOrder, itemId]);
    }
  }
}

/**
 * Removes an item assignment (moves to Unfiled)
 */
export function removeItemFromFolder(itemId) {
  assignItemToFolder(itemId, null);
}

/**
 * Retrieves all folder item order arrays
 * @returns {Record<string, string[]>}
 */
export function getAllFolderOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return {};
}

/**
 * Persists all folder item order arrays
 */
export function saveAllFolderOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders || {}));
    StorageService.setItem(ORDERS_KEY, orders || {}).catch(() => {});
    notifyUpdate();
  } catch (e) {}
}

/**
 * Gets custom item order for a specific folder (or 'root')
 */
export function getFolderItemOrder(folderId = 'root') {
  const orders = getAllFolderOrders();
  return Array.isArray(orders[folderId]) ? orders[folderId] : [];
}

/**
 * Sets custom item order for a specific folder (or 'root')
 */
export function setFolderItemOrder(folderId = 'root', itemIds = []) {
  const orders = getAllFolderOrders();
  orders[folderId] = itemIds;
  saveAllFolderOrders(orders);
}

/**
 * Moves an item up or down in the custom manual order within a folder
 */
export function moveItemInFolder(folderId = 'root', itemId, direction = 'up', allFolderItems = []) {
  let order = getFolderItemOrder(folderId);
  
  // If order list doesn't include all current items, initialize it with all items
  const allIds = allFolderItems.map(item => item.id || item['character-doc-id']);
  const missing = allIds.filter(id => !order.includes(id));
  order = [...order.filter(id => allIds.includes(id)), ...missing];

  const idx = order.indexOf(itemId);
  if (idx === -1) return;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= order.length) return;

  const updatedOrder = [...order];
  const [moved] = updatedOrder.splice(idx, 1);
  updatedOrder.splice(targetIdx, 0, moved);

  setFolderItemOrder(folderId, updatedOrder);
}

/**
 * Sorts an array of items (personas or stories) according to custom order or standard criteria
 * @param {Array} items - List of story or persona objects
 * @param {string} sortBy - 'custom' | 'recent' | 'name_asc' | 'name_desc'
 * @param {string} folderId - Current folder ID context for custom ordering
 * @param {string} idField - 'id' for stories, 'character-doc-id' for personas
 * @returns {Array} Sorted items array
 */
export function sortContentItems(items, sortBy = 'custom', folderId = 'root', idField = 'id') {
  if (!Array.isArray(items)) return [];
  const list = [...items];

  if (sortBy === 'name_asc') {
    return list.sort((a, b) => {
      const nameA = (a.projectName || a['char-name'] || a.name || a.title || '').toLowerCase();
      const nameB = (b.projectName || b['char-name'] || b.name || b.title || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  if (sortBy === 'name_desc') {
    return list.sort((a, b) => {
      const nameA = (a.projectName || a['char-name'] || a.name || a.title || '').toLowerCase();
      const nameB = (b.projectName || b['char-name'] || b.name || b.title || '').toLowerCase();
      return nameB.localeCompare(nameA);
    });
  }

  if (sortBy === 'recent') {
    return list.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  }

  // Custom manual order
  if (sortBy === 'custom') {
    const order = getFolderItemOrder(folderId);
    if (order.length === 0) {
      // Default to recently updated if no custom order defined yet
      return list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }
    return list.sort((a, b) => {
      const idA = a[idField] || a.id;
      const idB = b[idField] || b.id;
      const idxA = order.indexOf(idA);
      const idxB = order.indexOf(idB);
      if (idxA === -1 && idxB === -1) {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  return list;
}

/**
 * Hydrates local caches from StorageService asynchronously
 */
export async function hydrateFolderStorage() {
  try {
    const [folders, assignments, orders] = await Promise.all([
      StorageService.getItem(FOLDERS_KEY),
      StorageService.getItem(ASSIGNMENTS_KEY),
      StorageService.getItem(ORDERS_KEY)
    ]);
    if (Array.isArray(folders) && folders.length > 0) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    }
    if (assignments && typeof assignments === 'object') {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    }
    if (orders && typeof orders === 'object') {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
    notifyUpdate();
  } catch (e) {
    console.warn('[CustomFolderService] Hydration failed:', e);
  }
}

export const FOLDERS_UPDATE_EVENT = FOLDERS_EVENT;
