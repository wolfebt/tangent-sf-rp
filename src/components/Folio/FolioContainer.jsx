import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import FolioSidebar from './FolioSidebar';
import IdentityTab from './tabs/IdentityTab';
import CoreStatsTab from './tabs/CoreStatsTab';
import SkillsTab from './tabs/SkillsTab';
import AbilitiesTab from './tabs/AbilitiesTab';
import CombatGearTab from './tabs/CombatGearTab';
import NarrativeTab from './tabs/NarrativeTab';
import OtherTab from './tabs/OtherTab';
import EconomyModal from './modals/EconomyModal';
import AddSkillModal from './modals/AddSkillModal';
import CustomSelectorModal from './modals/CustomSelectorModal';
import AssetModal from './modals/AssetModal';
import ConfirmationModal from './modals/ConfirmationModal';
import PreviewModal from './modals/PreviewModal';
import RosterModal from './modals/RosterModal';
import BastionDrawer from './BastionDrawer';
import PrintFolio from './print/PrintFolio';
import { attachCreatorTag } from '../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';
import { FolioGuideModal } from './FolioGuideModal';
import GuidedCreatorModal from './modals/GuidedCreatorModal';
import { UserSettingsModal } from '../UserSettingsModal';

const FolioContainer = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal States
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [addSkillModalMode, setAddSkillModalMode] = useState('skill');
  const [availableSkillsForModal, setAvailableSkillsForModal] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetModalConfig, setAssetModalConfig] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isGuidedCreatorOpen, setIsGuidedCreatorOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState(null);

  const fileInputRef = useRef(null);

  const {
    characterData,
    updateField,
    handleAddItem,
    handleUpdateItem,
    handleAddSkill,
    handleAddSpecialization,
    handleNewCharacter,
    handleSaveLocal,
    handleLoadLocal,
    handleExportAsStoryElement,
    triggerSave,
    handleLoadCloud,
    computeSpentCP,
    economyBreakdown,
    personaRoster,
    saveCurrentToRoster,
    switchRosterCharacter,
    deleteRosterCharacter,
    duplicateRosterCharacter,
    cloudSaveStatus,
    lastSavedTime,
    updateRosterCharacterNote,
    isReadOnly,
    clonePublicPersona,
    togglePersonaVisibility,
    loadPublicPersonas,
    publicCatalog,
    applyArchetypeChassis,
    applySpeciesAdjustments
  } = useFolio();

  const handleDeleteCurrentCharacter = useCallback(() => {
    const charName = characterData['char-name'] || 'Unnamed Operative';
    if (!confirmTypedDeletion(charName, 'operative persona sheet')) return;
    const activeDocId = characterData['character-doc-id'];
    deleteRosterCharacter(activeDocId);
    setIsDeleteConfirmOpen(false);
  }, [characterData, deleteRosterCharacter]);

  const handleOpenAddSkillModal = useCallback((mode = 'skill', skillsList = []) => {
    setAddSkillModalMode(mode);
    setAvailableSkillsForModal(skillsList);
    setIsAddSkillOpen(true);
  }, []);

  // Open Asset Modal helper
  const handleOpenAssetModal = useCallback((key, title, mode = 'create', itemIndex = null, initialData = null) => {
    setAssetModalConfig({ key, title, mode, itemIndex, initialData });
    setIsAssetModalOpen(true);
  }, []);

  // Handle Save / Select from Asset Modal
  const handleSaveAssetItem = useCallback((key, data, index = null) => {
    const taggedData = attachCreatorTag(data, userHandle, currentUser);

    if (key.startsWith('char-')) {
      const name = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      updateField(key, name);

      // Auto-apply species inherent traits & adjustments if present
      if (key === 'char-species' && typeof taggedData === 'object' && applySpeciesAdjustments) {
        applySpeciesAdjustments(taggedData);
      }

      // Auto-prompt archetype 80 CP chassis if present
      if (key === 'char-archetype' && typeof taggedData === 'object') {
        const autoApply = window.confirm(`Selected Archetype "${name}". Would you like to apply the 80 CP Archetype Pre-Build (+3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Features)?`);
        if (autoApply && applyArchetypeChassis) {
          applyArchetypeChassis(taggedData);
        }
      }
    } else if (index !== null && index !== undefined && index >= 0) {
      handleUpdateItem(key, index, taggedData);
    } else {
      handleAddItem(key, taggedData);
    }
  }, [updateField, handleAddItem, handleUpdateItem, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments]);

  // Open Selector Modal helper
  const handleOpenSelectorModal = useCallback((key, title, browsePath, filterCategory = null, filterCategoryExclude = null) => {
    setSelectorConfig({ key, title, browsePath, filterCategory, filterCategoryExclude });
    setIsSelectorOpen(true);
  }, []);

  const handleSelectItem = useCallback((key, value) => {
    if (key.startsWith('char-')) {
      const name = typeof value === 'object' ? (value.name || value.title || '') : value;
      updateField(key, name);

      // Auto-apply Omnicortex species inherent traits & adjustments if present
      if (key === 'char-species' && typeof value === 'object' && applySpeciesAdjustments) {
        applySpeciesAdjustments(value);
      }

      // Auto-prompt archetype 80 CP chassis if present
      if (key === 'char-archetype' && typeof value === 'object') {
        const autoApply = window.confirm(`Selected Archetype "${name}". Would you like to apply the 80 CP Archetype Pre-Build (+3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Features)?`);
        if (autoApply && applyArchetypeChassis) {
          applyArchetypeChassis(value);
        }
      }
    } else {
      const rawObj = typeof value === 'object' 
        ? { id: value.id || `item_${Date.now()}`, ...value, name: value.name || value.title, description: value.description || '', cp: value.cp || 0, category: value.category || '' } 
        : { id: `item_${Date.now()}`, name: value, description: '', cp: 0 };
      const itemObj = attachCreatorTag(rawObj, userHandle, currentUser);
      handleAddItem(key, itemObj);
    }
  }, [updateField, handleAddItem, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleLoadLocal(file);
  };

  const handleCloudLoadPrompt = () => {
    const docId = prompt("Enter Persona Document ID to load from Cloud:", characterData['character-doc-id'] || '');
    if (docId && docId.trim()) {
      handleLoadCloud(docId.trim());
    }
  };

  // Wire Top-level GlobalHUD header custom events to Folio modal state
  useEffect(() => {
    const handleOpenEconomy = () => setIsEconomyOpen(true);
    const handleToggleBastion = () => setIsBastionOpen(prev => !prev);
    const handleOpenRoster = () => setIsRosterOpen(true);
    const handleOpenGuide = () => setIsGuideOpen(true);
    const handleOpenNewChar = () => setIsConfirmOpen(true);
    const handleOpenGuidedCreator = () => setIsGuidedCreatorOpen(true);
    const handleOpenDeleteChar = () => setIsDeleteConfirmOpen(true);
    const handleOpenClearChar = () => setIsConfirmOpen(true);
    const handleOpenPreview = () => setIsPreviewOpen(true);
    const handleTriggerLoadLocal = () => fileInputRef.current?.click();

    window.addEventListener('open-folio-economy', handleOpenEconomy);
    window.addEventListener('toggle-folio-bastion', handleToggleBastion);
    window.addEventListener('open-folio-roster', handleOpenRoster);
    window.addEventListener('open-folio-guide', handleOpenGuide);
    window.addEventListener('open-folio-new-character', handleOpenNewChar);
    window.addEventListener('open-folio-guided-creator', handleOpenGuidedCreator);
    window.addEventListener('open-folio-delete-character', handleOpenDeleteChar);
    window.addEventListener('open-folio-clear-character', handleOpenClearChar);
    window.addEventListener('open-folio-preview', handleOpenPreview);
    window.addEventListener('trigger-folio-load-local', handleTriggerLoadLocal);

    return () => {
      window.removeEventListener('open-folio-economy', handleOpenEconomy);
      window.removeEventListener('toggle-folio-bastion', handleToggleBastion);
      window.removeEventListener('open-folio-roster', handleOpenRoster);
      window.removeEventListener('open-folio-guide', handleOpenGuide);
      window.removeEventListener('open-folio-new-character', handleOpenNewChar);
      window.removeEventListener('open-folio-guided-creator', handleOpenGuidedCreator);
      window.removeEventListener('open-folio-delete-character', handleOpenDeleteChar);
      window.removeEventListener('open-folio-clear-character', handleOpenClearChar);
      window.removeEventListener('open-folio-preview', handleOpenPreview);
      window.removeEventListener('trigger-folio-load-local', handleTriggerLoadLocal);
    };
  }, []);

  return (
    <div className="flex h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative">
      {/* Hidden File Input for Loading Files */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* Mobile Sidebar Overlay Toggle */}
      <div className={`fixed inset-0 z-40 bg-black/60 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar Navigation */}
      <div className={`fixed md:relative z-40 h-full transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <FolioSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            triggerSave();
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          charName={characterData['char-name']}
          onOpenRoster={() => setIsRosterOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117] min-w-0">
        {/* Mobile Navigation Opener */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#121824] border-b border-slate-800">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-2.5 py-1 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-xs font-bold flex items-center gap-1.5"
          >
            <span>&#9776;</span>
            <span className="uppercase font-mono">Sections</span>
          </button>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase truncate">
            {characterData['char-name'] || 'UNNAMED OPERATIVE'}
          </span>
        </div>

        {/* Public Read-Only Banner */}
        {isReadOnly && (
          <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-amber-200 shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">🌐</span>
              <span>
                <strong>PUBLIC READ-ONLY VIEW:</strong> Operative Sheet by <strong className="text-amber-400">{characterData.authorHandle || characterData['char-name'] || 'Community Creator'}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clonePublicPersona}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded uppercase shadow text-[11px] transition-colors flex items-center gap-1"
              >
                <span>➕</span> Clone to My Roster
              </button>
            </div>
          </div>
        )}

        {/* Over-Budget Alert Banner */}
        {(() => {
          const startingCP = parseInt(characterData['starting-cp'] || 150, 10);
          const spentCP = computeSpentCP();
          const remainingCP = startingCP - spentCP;
          const isOver = spentCP > startingCP;

          if (!isOver) return null;

          return (
            <div className="sticky top-0 z-30 bg-red-950/95 border-b border-red-500/80 px-4 py-2.5 flex items-center justify-between backdrop-blur-md text-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.35)] ring-1 ring-red-500/50">
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse">⚠️</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-red-300">
                      CP OVER BUDGET ALERT: -{Math.abs(remainingCP)} CP DEFICIT
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-red-900 border border-red-400 text-red-100 rounded font-mono font-bold uppercase tracking-wider">
                      Sheet Illegal
                    </span>
                  </div>
                  <span className="text-[11px] text-red-200/90">
                    Character point expenditure ({spentCP} CP) exceeds the starting budget of {startingCP} CP.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEconomyOpen(true)}
                className="px-3 py-1 bg-red-900/80 hover:bg-red-800 border border-red-400 text-xs font-bold text-red-100 uppercase tracking-wider transition-colors shadow-sm shrink-0 rounded cursor-pointer"
              >
                Inspect Budget
              </button>
            </div>
          );
        })()}

        {/* Tab Content Display with ample padding to prevent viewport cutoff */}
        <div className="flex-1 overflow-y-auto relative p-3 sm:p-5 pb-24" onBlur={triggerSave}>
          {activeTab === 'identity' && (
            <IdentityTab
              onOpenSelectorModal={handleOpenSelectorModal}
              onOpenAssetModal={handleOpenAssetModal}
            />
          )}
          {activeTab === 'core-stats' && (
            <CoreStatsTab />
          )}
          {activeTab === 'skills' && (
            <SkillsTab
              onOpenAddSkillModal={handleOpenAddSkillModal}
            />
          )}
          {activeTab === 'abilities' && (
            <AbilitiesTab
              onOpenSelectorModal={handleOpenSelectorModal}
              onOpenAssetModal={handleOpenAssetModal}
            />
          )}
          {activeTab === 'combat-gear' && (
            <CombatGearTab
              onOpenSelectorModal={handleOpenSelectorModal}
              onOpenAssetModal={handleOpenAssetModal}
            />
          )}
          {activeTab === 'narrative' && (
            <NarrativeTab />
          )}
          {activeTab === 'other' && (
            <OtherTab />
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        personaRoster={personaRoster}
        activeDocId={characterData['character-doc-id']}
        onSelectCharacter={switchRosterCharacter}
        onNewCharacter={handleNewCharacter}
        onDuplicateCharacter={duplicateRosterCharacter}
        onDeleteCharacter={deleteRosterCharacter}
        onUpdateNote={updateRosterCharacterNote}
        onToggleVisibility={togglePersonaVisibility}
        onLoadPublicGallery={loadPublicPersonas}
        publicCatalog={publicCatalog}
        onSelectPublicPersona={(userUid, docId) => {
          window.history.pushState({}, '', `${window.location.pathname}?user=${userUid}&id=${docId}`);
          window.location.reload();
        }}
        onClonePublicPersona={clonePublicPersona}
      />
      <EconomyModal
        isOpen={isEconomyOpen}
        onClose={() => setIsEconomyOpen(false)}
        characterData={characterData}
        updateField={updateField}
        economyBreakdown={economyBreakdown}
      />
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        onAddSkill={handleAddSkill}
        onAddSpecialization={handleAddSpecialization}
        availableSkills={availableSkillsForModal}
        initialMode={addSkillModalMode}
      />
      <CustomSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        modalConfig={selectorConfig}
        onSelectItem={handleSelectItem}
        onOpenAssetModal={handleOpenAssetModal}
      />
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        modalConfig={assetModalConfig}
        onSaveAsset={handleSaveAssetItem}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleNewCharacter}
        title="Reset Persona Sheet"
        message="Are you sure you want to start a new character? Unsaved changes will be cleared."
      />
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCurrentCharacter}
        title="Delete Operative Persona"
        message={`Are you sure you want to permanently delete character "${characterData['char-name'] || 'Unnamed Operative'}" from your roster and clear this sheet?`}
      />
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        characterData={characterData}
      />
      <BastionDrawer
        isOpen={isBastionOpen}
        onClose={() => setIsBastionOpen(false)}
      />
      <FolioGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <GuidedCreatorModal
        isOpen={isGuidedCreatorOpen}
        onClose={() => setIsGuidedCreatorOpen(false)}
      />
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      {/* Print-only Folio Output */}
      <div className="hidden print:block">
        <PrintFolio characterData={characterData} />
      </div>
    </div>
  );
};

export default FolioContainer;
