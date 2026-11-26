/**
 * @file cortexAdeAssetBridge.js
 * @description Facade re-exporting the modularized OmniCortex <-> Persona Folio <-> ADE bridge.
 */

export {
  CORTEX_PROPERTY_COLLECTIONS,
  CORTEX_METAPHYSICS_COLLECTIONS,
  COLLECTION_TO_ADE_TYPE,
  ADE_TYPE_TO_CORTEX_COLLECTIONS,
  COLLECTION_TO_CODEX_MATRIX,
  CORTEX_BACKED_ADE_TYPES
} from './cortex/cortexCollectionMaps.js';

export {
  resolveSynthesisFactionIds,
  resolveSynthesisOriginIds,
  resolveSynthesisOccupationIds,
  resolveSynthesisDescriptorsForAsset
} from './cortex/cortexSynthesisDescriptors.js';

export {
  projectOmnicortexRecordToAdeElement,
  projectFolioPersonaToAdeElement,
  normalizeStoryModuleElement,
  buildUnifiedAdeCatalog,
  buildUnifiedPersonaList
} from './cortex/cortexToAdeProjector.js';

export {
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload
} from './cortex/adeToCortexConsolidator.js';

export {
  convertPersonaElementToFolio,
  convertMcmToFolioPersona,
  convertFolioToMcmRecord,
  buildVttUnitFromPersona
} from './personaBridge.js';
