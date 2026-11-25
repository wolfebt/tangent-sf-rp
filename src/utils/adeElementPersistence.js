/**
 * @file adeElementPersistence.js
 * @description Unified ADE element persistence router across Persona Folio,
 * OmniCortex (DBM), and Story Module catalogs without duplicate Firestore writes.
 *
 * Security & Canon Policy:
 *  - Nothing outside EditElementModal with Admin clearance (`fromEditModal && isAdmin`)
 *    may mutate canonical OmniCortex DBM collections; non-admin or non-modal edits save
 *    purely as Campaign-local overrides (`local_override`) in `elementsCatalog`.
 *  - Read-only stories (`isStoryReadOnly`) reject writes cleanly.
 *  - Imported / user-supplied IDs are sanitized against Firestore path traversal (`/` / `..`).
 */

import { normalizeElementType } from '../pages/Foundry/ElementForge/elementSchemas.js';
import {
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload,
  convertPersonaElementToFolio
} from './cortexAdeAssetBridge.js';

/**
 * Sanitizes an ADE element document ID so untrusted imported IDs cannot inject
 * Firestore collection/document path separators or parent segments.
 */
export function sanitizeElementDocId(rawId) {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/\.\.+/g, '_')
    .replace(/[/\\]+/g, '_')
    .replace(/\s+/g, '_');
  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  return cleaned;
}

/**
 * Persists an ADE element to its canonical store(s) and syncs module pins cleanly.
 */
export async function persistAdeElement({
  element,
  elementsCatalog = [],
  updateSavedElement,
  saveEntry,
  saveCurrentToRoster,
  showToast,
  isStoryReadOnly = false,
  fromEditModal,
  isAdmin,
  allowOmnicortexMutation
} = {}) {
  if (!element || typeof element !== 'object') return null;

  if (isStoryReadOnly) {
    showToast?.({
      type: 'warning',
      text: 'Read-only story: unlock or clone this project before saving elements.'
    });
    return null;
  }

  const resolvedId = sanitizeElementDocId(element.id);
  const normalized = {
    ...element,
    id: resolvedId,
    type: normalizeElementType(element.type)
  };

  const findExistingModuleElement = () =>
    (elementsCatalog || []).find(
      (e) =>
        e &&
        (e.id === normalized.id ||
          (normalized.moduleElementId && e.id === normalized.moduleElementId))
    );

  // 1. Persona Folio Character Synchronization
  if (
    normalized.type === 'Persona' &&
    (normalized.isFolioPersona ||
      normalized.personaSubcategory === 'folio' ||
      normalized.fields?.personaSubcategory === 'folio')
  ) {
    if (typeof saveCurrentToRoster !== 'function') {
      showToast?.({
        type: 'error',
        text: `Cannot save "${normalized.title || 'Persona'}": Persona Folio roster handler is unavailable.`
      });
      return null;
    }

    let savedFolioDocId = null;
    const folioPayload = convertPersonaElementToFolio(normalized);
    if (folioPayload) {
      const rosterRes = await saveCurrentToRoster(folioPayload);
      if (
        rosterRes === null ||
        rosterRes === undefined ||
        rosterRes === false ||
        rosterRes?.ok === false ||
        rosterRes?.success === false
      ) {
        showToast?.({
          type: 'error',
          text: `Failed to save "${normalized.title || 'Persona'}" to Persona Folio Roster (persona may be deleted or unavailable).`
        });
        return null;
      }
      const savedObj = typeof rosterRes === 'object' ? rosterRes : null;
      savedFolioDocId =
        savedObj?.['character-doc-id'] ||
        savedObj?.id ||
        folioPayload?.['character-doc-id'] ||
        folioPayload?.id ||
        null;
      if (!savedObj?.ownerUid) {
        showToast?.({
          type: 'success',
          text: `Saved "${normalized.title || 'Persona'}" to Persona Folio Roster!`
        });
      }
    }

    const existingPersonaNode = findExistingModuleElement();
    if (normalized.isPinnedToModule || existingPersonaNode) {
      const targetModuleId = existingPersonaNode?.id || normalized.moduleElementId || normalized.id;
      if (typeof updateSavedElement === 'function') {
        const modSaved = await updateSavedElement(targetModuleId, {
          ...normalized,
          id: targetModuleId
        });
        if (modSaved === false || modSaved === null) {
          showToast?.({
            type: 'error',
            text: `Failed to sync pinned module copy for "${normalized.title || 'Persona'}".`
          });
          return null;
        }
      }
      return {
        ...normalized,
        id: targetModuleId
      };
    }
    const canonicalFolioId = savedFolioDocId
      ? (String(savedFolioDocId).startsWith('folio_persona_')
        ? String(savedFolioDocId)
        : `folio_persona_${savedFolioDocId}`)
      : normalized.id;
    return {
      ...normalized,
      id: canonicalFolioId,
      isFolioPersona: true,
      ...(savedFolioDocId ? { folioDocId: savedFolioDocId } : {})
    };
  }

  // 2. OmniCortex / Codex Consolidated Asset Persistence
  const targetCortexCollection = resolveTargetCortexCollection(normalized);
  const hasGateFlags = fromEditModal !== undefined || isAdmin !== undefined;
  const canMutateOmnicortex =
    allowOmnicortexMutation !== undefined
      ? Boolean(allowOmnicortexMutation)
      : hasGateFlags
      ? Boolean(fromEditModal && isAdmin)
      : true;

  if (targetCortexCollection) {
    if (!canMutateOmnicortex) {
      // Strict OmniCortex Protection: non-admins or non-Edit-Modal callers NEVER alter OmniCortex;
      // persist purely as a Campaign-local override in elementsCatalog.
      const existingModuleNode = findExistingModuleElement();
      const targetModuleId = existingModuleNode?.id || normalized.moduleElementId || normalized.id;
      const resolvedDbmId =
        normalized.dbmId ||
        normalized.fields?.dbmId ||
        normalized.fields?.dbmRef ||
        normalized.cortexRaw?.id ||
        (String(normalized.id || '').startsWith(`cortex_${targetCortexCollection}_`)
          ? String(normalized.id).slice(`cortex_${targetCortexCollection}_`.length)
          : normalized.id);
      const localOverrideRecord = {
        ...normalized,
        id: targetModuleId,
        isPinnedToModule: true,
        dbmCategory: targetCortexCollection,
        dbmId: resolvedDbmId,
        dbmSyncStatus: 'local_override',
        fields: {
          ...(normalized.fields || {}),
          dbmRef: resolvedDbmId,
          dbmId: resolvedDbmId,
          dbmCategory: targetCortexCollection
        }
      };
      if (typeof updateSavedElement === 'function') {
        const savedLocal = await updateSavedElement(targetModuleId, localOverrideRecord);
        if (savedLocal === false || savedLocal === null) {
          showToast?.({
            type: 'error',
            text: `Failed to save local override for "${normalized.title || 'Asset'}".`
          });
          return null;
        }
      }
      showToast?.({
        type: 'warning',
        text: `Saved "${normalized.title || 'Asset'}" as a Campaign-local override (OmniCortex canon edits require Admin access inside Edit Modal).`
      });
      return localOverrideRecord;
    }

    if (typeof saveEntry === 'function') {
      const consolidated = consolidateAdeElementToCortexPayload(normalized, {
        targetCollection: targetCortexCollection
      });
      if (consolidated) {
        const res = await saveEntry(consolidated.payload, consolidated.targetCollection);
        if (res === false || res?.ok === false || res?.success === false) {
          showToast?.({
            type: 'error',
            text: `Failed to save "${normalized.title || 'Asset'}" to OmniCortex (${consolidated.targetCollection}).`
          });
          return null;
        }

        if (res?.localOnly || res?.permissionDenied) {
          const existingModuleNode = findExistingModuleElement();
          const targetModuleId = existingModuleNode?.id || normalized.moduleElementId || normalized.id;
          const localOverrideRecord = {
            ...normalized,
            id: targetModuleId,
            isPinnedToModule: true,
            dbmCategory: consolidated.targetCollection,
            dbmId: consolidated.payload.id,
            dbmSyncStatus: 'local_override',
            fields: {
              ...(normalized.fields || {}),
              dbmRef: consolidated.payload.id,
              dbmId: consolidated.payload.id,
              dbmCategory: consolidated.targetCollection
            }
          };
          if (typeof updateSavedElement === 'function') {
            const savedLocal = await updateSavedElement(targetModuleId, localOverrideRecord);
            if (savedLocal === false || savedLocal === null) return null;
          }
          showToast?.({
            type: 'warning',
            text: `Saved "${normalized.title || 'Asset'}" as a Campaign-local override (Omnicortex cloud writes require Architect/Admin permissions).`
          });
          return localOverrideRecord;
        }

        showToast?.({
          type: 'success',
          text: `Consolidated "${normalized.title || 'Asset'}" to OmniCortex (${consolidated.targetCollection})!`
        });
        const existingModuleNode = findExistingModuleElement();
        if (normalized.isPinnedToModule || existingModuleNode) {
          const targetModuleId = existingModuleNode?.id || normalized.moduleElementId || normalized.id;
          const syncedPin = {
            ...normalized,
            id: targetModuleId,
            dbmCategory: consolidated.targetCollection,
            dbmId: consolidated.payload.id,
            dbmSyncStatus: 'synced',
            fields: {
              ...(normalized.fields || {}),
              dbmRef: consolidated.payload.id,
              dbmId: consolidated.payload.id,
              dbmCategory: consolidated.targetCollection
            }
          };
          if (typeof updateSavedElement === 'function') {
            const savedPin = await updateSavedElement(targetModuleId, syncedPin);
            if (savedPin === false || savedPin === null) return null;
          }
          return syncedPin;
        }
        const canonicalCortexId = `cortex_${consolidated.targetCollection}_${consolidated.payload.id}`;
        return {
          ...normalized,
          id: canonicalCortexId,
          isCortexAsset: true,
          dbmCategory: consolidated.targetCollection,
          dbmId: consolidated.payload.id,
          dbmSyncStatus: 'synced',
          fields: {
            ...(normalized.fields || {}),
            dbmRef: consolidated.payload.id,
            dbmId: consolidated.payload.id,
            dbmCategory: consolidated.targetCollection
          }
        };
      }
    }
  }

  // 3. Campaign-Scoped Narrative Elements
  const existingModuleNode = findExistingModuleElement();
  const targetModuleId = existingModuleNode?.id || normalized.moduleElementId || normalized.id;
  if (typeof updateSavedElement === 'function') {
    const modSaved = await updateSavedElement(targetModuleId, {
      ...normalized,
      id: targetModuleId
    });
    if (modSaved === false || modSaved === null) {
      showToast?.({
        type: 'error',
        text: `Failed to save "${normalized.title || 'Element'}" to Story Module.`
      });
      return null;
    }
  }
  return {
    ...normalized,
    id: targetModuleId
  };
}
