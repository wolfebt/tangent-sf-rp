/**
 * @file adeElementPersistence.js
 * @description Unified ADE element persistence router across Persona Folio,
 * OmniCortex (DBM), and Story Module catalogs without duplicate Firestore writes.
 */

import { normalizeElementType } from '../pages/Foundry/ElementForge/elementSchemas.js';
import {
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload,
  convertPersonaElementToFolio
} from './cortexAdeAssetBridge.js';

/**
 * Persists an ADE element to its canonical store(s) and syncs module pins cleanly.
 */
export async function persistAdeElement({
  element,
  elementsCatalog = [],
  updateSavedElement,
  saveEntry,
  saveCurrentToRoster,
  showToast
} = {}) {
  if (!element || typeof element !== 'object') return null;

  const resolvedId = element.id || `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
    if (typeof saveCurrentToRoster === 'function') {
      const folioPayload = convertPersonaElementToFolio(normalized, normalized.personaData || {});
      if (folioPayload) {
        const rosterRes = await saveCurrentToRoster(folioPayload);
        if (rosterRes === false || rosterRes?.ok === false || rosterRes?.success === false) {
          showToast?.({
            type: 'error',
            text: `Failed to save "${normalized.title || 'Persona'}" to Persona Folio Roster.`
          });
          return null;
        }
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
        await updateSavedElement(targetModuleId, {
          ...normalized,
          id: targetModuleId
        });
      }
    }
    return normalized;
  }

  // 2. OmniCortex / Codex Consolidated Asset Persistence
  const targetCortexCollection = resolveTargetCortexCollection(normalized);
  if (targetCortexCollection && typeof saveEntry === 'function') {
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
          await updateSavedElement(targetModuleId, localOverrideRecord);
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
          await updateSavedElement(targetModuleId, syncedPin);
        }
        return syncedPin;
      }
      return {
        ...normalized,
        dbmCategory: consolidated.targetCollection,
        dbmId: consolidated.payload.id,
        dbmSyncStatus: 'synced'
      };
    }
  }

  // 3. Campaign-Scoped Narrative Elements
  const existingModuleNode = findExistingModuleElement();
  const targetModuleId = existingModuleNode?.id || normalized.moduleElementId || normalized.id;
  if (typeof updateSavedElement === 'function') {
    await updateSavedElement(targetModuleId, {
      ...normalized,
      id: targetModuleId
    });
  }
  return {
    ...normalized,
    id: targetModuleId
  };
}
