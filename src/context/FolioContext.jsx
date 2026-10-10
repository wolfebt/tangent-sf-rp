import React, { createContext, useContext, useMemo } from 'react';
import { 
  FolioIdentitySliceProvider, 
  useFolioIdentity, 
  FolioIdentityContext,
  DEFAULT_CHARACTER,
  sanitizeCharacterSkills
} from './folio/FolioIdentityContext';
import { 
  FolioStatsSliceProvider, 
  useFolioStats, 
  FolioStatsContext,
  PRIMARY_TO_SUB_ATTR,
  SUB_TO_PRIMARY_ATTR,
  ATTR_NAME_TO_ID,
  normalizeTraitName
} from './folio/FolioStatsContext';
import { 
  FolioInventorySliceProvider, 
  useFolioInventory, 
  FolioInventoryContext 
} from './folio/FolioInventoryContext';
import { 
  FolioVitalsSliceProvider, 
  useFolioVitals, 
  FolioVitalsContext 
} from './folio/FolioVitalsContext';
import { 
  FOLIO_TOMBSTONES_KEY, 
  getFolioTombstones, 
  addFolioTombstone, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate,
  getEffectiveUserHandle 
} from '../utils/personaValidationUtils';

// Re-export utility constants & helpers for backward compatibility
export { 
  DEFAULT_CHARACTER,
  sanitizeCharacterSkills,
  PRIMARY_TO_SUB_ATTR,
  SUB_TO_PRIMARY_ATTR,
  ATTR_NAME_TO_ID,
  normalizeTraitName,
  FOLIO_TOMBSTONES_KEY, 
  getFolioTombstones, 
  addFolioTombstone, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate,
  getEffectiveUserHandle 
};

// Re-export granular domain contexts and hooks
export {
  useFolioIdentity,
  FolioIdentityContext,
  FolioIdentitySliceProvider,
  useFolioStats,
  FolioStatsContext,
  FolioStatsSliceProvider,
  useFolioInventory,
  FolioInventoryContext,
  FolioInventorySliceProvider,
  useFolioVitals,
  FolioVitalsContext,
  FolioVitalsSliceProvider
};

// Primary Unified Facade Context
export const FolioContext = createContext(null);

export const useFolio = () => {
  const context = useContext(FolioContext);
  if (!context) {
    console.warn('[useFolio] Hook called outside of FolioProvider context. Returning fallback empty state.');
    return {};
  }
  return context;
};

// Internal Facade Assembly Provider
const FolioFacadeBridge = ({ children }) => {
  const identity = useFolioIdentity();
  const stats = useFolioStats();
  const inventory = useFolioInventory();
  const vitals = useFolioVitals();

  const value = useMemo(() => ({
    // ═══════════════════════════════════════════════════════════
    // FOLIO IDENTITY SLICE
    // ═══════════════════════════════════════════════════════════
    characterData: identity.characterData,
    setCharacterData: identity.setCharacterData,
    activeCharacter: identity.activeCharacter,
    activeHeroName: identity.activeCharacter?.name || identity.characterData?.['char-name'] || 'Operative',
    updateField: identity.updateField,
    activeTab: identity.activeTab,
    setActiveTab: identity.setActiveTab,
    viewMode: identity.viewMode,
    setViewMode: identity.setViewMode,
    isCharacterSelected: identity.isCharacterSelected,
    setIsCharacterSelected: identity.setIsCharacterSelected,
    personaRoster: identity.personaRoster,
    roster: identity.personaRoster,
    saveCurrentToRoster: identity.saveCurrentToRoster,
    switchRosterCharacter: identity.switchRosterCharacter,
    deleteRosterCharacter: identity.deleteRosterCharacter,
    duplicateRosterCharacter: identity.duplicateRosterCharacter,
    togglePersonaNetworkEngaged: identity.togglePersonaNetworkEngaged,
    togglePersonaVttLock: identity.togglePersonaVttLock,
    handleNewCharacter: identity.handleNewCharacter,
    handleSaveLocal: identity.handleSaveLocal,
    handleLoadLocal: identity.handleLoadLocal,
    handleLoadCloud: identity.handleLoadCloud,
    handleExportAsStoryElement: identity.handleExportAsStoryElement,
    triggerSave: identity.triggerSave,
    cloudSaveStatus: identity.cloudSaveStatus,
    lastSavedTime: identity.lastSavedTime,
    updateRosterCharacterNote: identity.updateRosterCharacterNote,
    applySpeciesAdjustments: identity.applySpeciesAdjustments,
    applyArchetypeChassis: identity.applyArchetypeChassis,
    applyOccupationAdjustments: identity.applyOccupationAdjustments,
    applyOriginAdjustments: identity.applyOriginAdjustments,
    applyFactionAdjustments: identity.applyFactionAdjustments,
    applyIdentitySelection: identity.applyIdentitySelection,
    applyGuidedCharacter: identity.applyGuidedCharacter,
    isLocked: identity.isLocked,
    folioPhase: identity.folioPhase,
    isReadyForVTT: identity.isReadyForVTT,
    allowPlayerOverride: identity.allowPlayerOverride,
    isPlayerOverride: identity.isPlayerOverride,
    isFolioLockedOut: identity.isFolioLockedOut,
    lockPersona: identity.lockPersona,
    unlockPersona: identity.unlockPersona,
    setPersonaAllowPlayerOverride: identity.setPersonaAllowPlayerOverride,
    clonePersonaVariant: identity.clonePersonaVariant,
    recordTrackedModification: identity.recordTrackedModification,
    reviewTrackedModification: identity.reviewTrackedModification,
    revertTrackedModification: identity.revertTrackedModification,
    applyVTTStatusConditions: identity.applyVTTStatusConditions,
    trackedModifications: identity.trackedModifications || identity.characterData?.tracked_modifications || [],

    // ═══════════════════════════════════════════════════════════
    // FOLIO STATS & ECONOMY SLICE
    // ═══════════════════════════════════════════════════════════
    computeSpentCP: stats.computeSpentCP,
    economyBreakdown: stats.economyBreakdown,
    derivedStats: stats.derivedStats,
    computedModifiers: stats.computedModifiers,
    saveMods: stats.saveMods || stats.computedModifiers?.saveMods,
    activeFeatureModifiers: stats.activeFeatureModifiers || stats.computedModifiers?.activeFeatureModifiers,
    activeTraitModifiers: stats.activeTraitModifiers || stats.computedModifiers?.activeTraitModifiers,
    activeHindranceModifiers: stats.activeHindranceModifiers || stats.computedModifiers?.activeHindranceModifiers,
    activeEquipmentModifiers: stats.activeEquipmentModifiers || stats.computedModifiers?.activeEquipmentModifiers,
    activeSkillModifiers: stats.activeSkillModifiers || stats.computedModifiers?.activeSkillModifiers,
    getSkillBreakdown: stats.getSkillBreakdown,
    getAttrMod: stats.getAttrMod,
    getAttrTotal: stats.getAttrTotal,
    getSubAttrBase: stats.getSubAttrBase,
    enabledMovementModes: stats.enabledMovementModes,
    calculateFullSpeciesCost: stats.calculateFullSpeciesCost,
    speciesComponentData: stats.speciesComponentData,
    allocatePoolSkillRank: stats.allocatePoolSkillRank,
    togglePoolTrait: stats.togglePoolTrait,
    removePoolTrait: stats.removePoolTrait,
    togglePoolFeature: stats.togglePoolFeature,
    removePoolFeature: stats.removePoolFeature,
    allocatePoolAttribute: stats.allocatePoolAttribute,
    handleAddSkill: stats.handleAddSkill,
    handleDeleteSkill: stats.handleDeleteSkill,
    handleAddSpecialization: stats.handleAddSpecialization,
    handleUpdateSpecialization: stats.handleUpdateSpecialization,
    handleDeleteSpecialization: stats.handleDeleteSpecialization,

    // ═══════════════════════════════════════════════════════════
    // FOLIO INVENTORY & COMPANIONS SLICE
    // ═══════════════════════════════════════════════════════════
    handleAddItem: inventory.handleAddItem,
    addItemToInventory: inventory.addItemToInventory,
    addAbility: inventory.addAbility,
    handleUpdateItem: inventory.handleUpdateItem,
    companions: inventory.companions || identity.characterData?.companions || [],
    handleAddCompanion: inventory.handleAddCompanion,
    handleUpdateCompanion: inventory.handleUpdateCompanion,
    handleDeleteCompanion: inventory.handleDeleteCompanion,
    handleToggleDeployCompanion: inventory.handleToggleDeployCompanion,
    publicCatalog: inventory.publicCatalog,
    togglePersonaVisibility: inventory.togglePersonaVisibility,
    clonePublicPersona: inventory.clonePublicPersona,

    // ═══════════════════════════════════════════════════════════
    // FOLIO VITALS, REST & TACTICAL LOCK SLICE
    // ═══════════════════════════════════════════════════════════
    updateCharacterHealth: vitals.updateCharacterHealth,
    updateCharacterVitality: vitals.updateCharacterVitality,
    updateCharacterStructure: vitals.updateCharacterStructure,
    updateCharacterHp: vitals.updateCharacterHp,
    applyCharacterDamage: vitals.applyCharacterDamage,
    stabilizeCharacter: vitals.stabilizeCharacter,
    advanceCharacterDeathTurn: vitals.advanceCharacterDeathTurn,
    revivifyCharacter: vitals.revivifyCharacter,
    awardExperience: vitals.awardExperience,
    payExperienceDebt: vitals.payExperienceDebt,
    experienceRules: vitals.experienceRules,
    deathAndDyingRules: vitals.deathAndDyingRules,
    takeCharacterRest: vitals.takeCharacterRest,
    resetDailyCharacterRests: vitals.resetDailyCharacterRests,
    updateCharacterKarma: vitals.updateCharacterKarma,
    awardCharacterKarma: vitals.awardCharacterKarma,
    resetCharacterKarma: vitals.resetCharacterKarma,
    awardPartyKarma: vitals.awardPartyKarma,
    awardPartyExperience: vitals.awardPartyExperience,
    spendKarma: vitals.spendKarma,
    gainKarma: vitals.gainKarma,
    resetKarmaToMax: vitals.resetKarmaToMax,
    spendPlotPoint: vitals.spendPlotPoint,
    gainPlotPoint: vitals.gainPlotPoint,
    isInActiveGame: vitals.isInActiveGame,
    activeGameSession: vitals.activeGameSession,
    setInActiveGame: vitals.setInActiveGame,
    toggleActiveGameLock: vitals.toggleActiveGameLock,
    applyGMConfirmedUpdate: vitals.applyGMConfirmedUpdate,
    isGMConfirmed: vitals.isGMConfirmed,
    setIsGMConfirmed: vitals.setIsGMConfirmed,
    isProtectedGameStat: vitals.isProtectedGameStat,
    isDynamicOperationalStat: vitals.isDynamicOperationalStat,
    isReadOnly: vitals.isReadOnly
  }), [identity, stats, inventory, vitals]);

  return (
    <FolioContext.Provider value={value}>
      {children}
    </FolioContext.Provider>
  );
};

// Complete Provider Tree
export const FolioProvider = ({ children }) => {
  return (
    <FolioIdentitySliceProvider>
      <FolioStatsSliceProvider>
        <FolioInventorySliceProvider>
          <FolioVitalsSliceProvider>
            <FolioFacadeBridge>
              {children}
            </FolioFacadeBridge>
          </FolioVitalsSliceProvider>
        </FolioInventorySliceProvider>
      </FolioStatsSliceProvider>
    </FolioIdentitySliceProvider>
  );
};

export default FolioProvider;
