/**
 * @file crdtCollabService.js
 * @description Collaborative Real-Time CRDT Service for Tangent ADE.
 * Manages shared Y.Doc structures, peer-to-peer merging, and real-time
 * synchronization for Story Foundry manuscripts, scene outlines, and tactical states.
 */

import * as Y from 'yjs';
import { YjsProviderBridge } from '../engine/network/YjsProviderBridge.ts';

// Singleton shared Y.Doc with garbage collection enabled
const sharedDoc = new Y.Doc({ gc: true });

let activeBridge = null;
const statusListeners = new Set();

/**
 * Returns the underlying shared Y.Doc singleton.
 * @returns {Y.Doc}
 */
export function getSharedDoc() {
  return sharedDoc;
}

/**
 * Retrieves the Y.Text structure for a specific scenario manuscript prose.
 * @param {string} scenarioId 
 * @returns {Y.Text}
 */
export function getScenarioProseText(scenarioId) {
  if (!scenarioId) return sharedDoc.getText('scenario_prose_default');
  return sharedDoc.getText(`scenario_prose_${scenarioId}`);
}

/**
 * Retrieves the shared Y.Map containing all scenario manuscripts metadata.
 * @returns {Y.Map<any>}
 */
export function getScenarioManuscriptsMap() {
  return sharedDoc.getMap('scenario_manuscripts');
}

/**
 * Synchronizes the Y.Text document for a scenario with initial content if not already populated.
 * @param {string} scenarioId 
 * @param {string} initialContent 
 * @returns {{ yText: Y.Text, currentContent: string }}
 */
export function syncScenarioProse(scenarioId, initialContent = '') {
  const yText = getScenarioProseText(scenarioId);
  
  if (yText.length === 0 && initialContent) {
    sharedDoc.transact(() => {
      yText.insert(0, initialContent);
    }, 'initial-sync');
  }

  return {
    yText,
    currentContent: yText.toString()
  };
}

/**
 * Updates the shared Y.Text manuscript prose with incremental prefix/suffix diffing
 * so concurrent peer edits to disjoint sections merge without overwriting.
 * @param {string} scenarioId 
 * @param {string} newContent 
 * @param {string} origin 
 */
export function updateScenarioProse(scenarioId, newContent, origin = 'local') {
  if (newContent === undefined || newContent === null) return;
  const yText = getScenarioProseText(scenarioId);
  const currentStr = yText.toString();
  const nextStr = String(newContent);

  if (currentStr === nextStr) return;

  let start = 0;
  const minLen = Math.min(currentStr.length, nextStr.length);
  while (start < minLen && currentStr.charCodeAt(start) === nextStr.charCodeAt(start)) {
    start++;
  }
  let oldEnd = currentStr.length;
  let newEnd = nextStr.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    currentStr.charCodeAt(oldEnd - 1) === nextStr.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }

  sharedDoc.transact(() => {
    if (oldEnd > start) {
      yText.delete(start, oldEnd - start);
    }
    if (newEnd > start) {
      yText.insert(start, nextStr.slice(start, newEnd));
    }
  }, origin);
}

/**
 * Subscribes a listener to changes in a scenario's manuscript prose.
 * @param {string} scenarioId 
 * @param {(text: string, event: Y.YTextEvent) => void} callback 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToScenarioProse(scenarioId, callback) {
  const yText = getScenarioProseText(scenarioId);
  
  const observer = (event, transaction) => {
    // Only fire if origin is NOT local or if explicitly needed
    callback(yText.toString(), event, transaction);
  };

  yText.observe(observer);

  return () => {
    yText.unobserve(observer);
  };
}

/**
 * Connects the shared Y.Doc to a LiveKit Room via YjsProviderBridge.
 * @param {any} room LiveKit room instance
 * @returns {YjsProviderBridge|null}
 */
export function attachLiveKitBridge(room) {
  if (!room) return null;
  if (activeBridge?.room === room) {
    return activeBridge;
  }
  if (activeBridge) {
    activeBridge.disconnect();
    activeBridge = null;
  }

  try {
    // Dedicated 0x11 / 0x12 prefix isolation keeps StoryWeaver prose channels separate from Stage VTT
    activeBridge = new YjsProviderBridge(room, sharedDoc, {
      updatePrefix: 0x11,
      syncStep1Prefix: 0x12
    });
    if (room?.state === 'connected') {
      activeBridge.sendSyncStep1?.();
    }
    notifyStatusListeners();
    return activeBridge;
  } catch (err) {
    console.warn('[crdtCollabService] Failed to attach LiveKit room to Yjs bridge:', err);
    return null;
  }
}

/**
 * Disconnects the active LiveKit bridge if connected.
 */
export function detachLiveKitBridge() {
  if (activeBridge) {
    activeBridge.disconnect();
    activeBridge = null;
    notifyStatusListeners();
  }
}

/**
 * Returns current real-time collaboration status.
 * @returns {{ isConnected: boolean, peerCount: number, doc: Y.Doc }}
 */
export function getCollabStatus() {
  const isConnected = Boolean(activeBridge);
  const remoteMap = activeBridge?.room?.remoteParticipants;
  const peerNames = [];
  if (remoteMap && typeof remoteMap.forEach === 'function') {
    remoteMap.forEach((p) => {
      const label = p?.name || p?.identity;
      if (label) peerNames.push(String(label));
    });
  } else if (Array.isArray(remoteMap)) {
    remoteMap.forEach((p) => {
      const label = p?.name || p?.identity;
      if (label) peerNames.push(String(label));
    });
  }
  const remoteCount = activeBridge?.room?.remoteParticipants?.size;
  return {
    isConnected,
    peerCount: isConnected ? (typeof remoteCount === 'number' ? remoteCount + 1 : 1) : 0,
    peerNames,
    doc: sharedDoc
  };
}

/**
 * Subscribes to collaboration connection / status changes.
 * @param {(status: { isConnected: boolean, peerCount: number }) => void} listener 
 * @returns {() => void}
 */
export function onCollabStatusChange(listener) {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

function notifyStatusListeners() {
  const status = getCollabStatus();
  statusListeners.forEach(fn => {
    try {
      fn(status);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Exports binary state vector update for P2P sync testing and serialization.
 * @returns {Uint8Array}
 */
export function exportCollabUpdate() {
  return Y.encodeStateAsUpdate(sharedDoc);
}

/**
 * Applies a binary state vector update from a peer.
 * @param {Uint8Array} update 
 * @param {any} origin 
 */
export function applyCollabUpdate(update, origin = 'network') {
  Y.applyUpdate(sharedDoc, update, origin);
}

export default {
  getSharedDoc,
  getScenarioProseText,
  getScenarioManuscriptsMap,
  syncScenarioProse,
  updateScenarioProse,
  subscribeToScenarioProse,
  attachLiveKitBridge,
  detachLiveKitBridge,
  getCollabStatus,
  onCollabStatusChange,
  exportCollabUpdate,
  applyCollabUpdate
};
