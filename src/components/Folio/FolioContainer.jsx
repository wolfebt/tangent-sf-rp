import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { useDice } from '../../context/DiceContext';
import { Dices } from 'lucide-react';
import FolioSidebar from './FolioSidebar';
import IdentityTab from './tabs/IdentityTab';
import CoreStatsTab from './tabs/CoreStatsTab';
import SkillsTab from './tabs/SkillsTab';
import FeaturesTab from './tabs/FeaturesTab';
import AbilitiesTab from './tabs/AbilitiesTab';
import CombatTab from './tabs/CombatTab';
import PropertyTab from './tabs/PropertyTab';
import CombatGearTab from './tabs/CombatGearTab';
import NarrativeTab from './tabs/NarrativeTab';
import OtherTab from './tabs/OtherTab';
import MetaphysicsModal from './modals/MetaphysicsModal';
import EconomyModal from './modals/EconomyModal';
import ExperienceCodexModal from './modals/ExperienceCodexModal';
import KarmaCodexModal from './modals/KarmaCodexModal';
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
import { resolveMetaSkillForInvocation } from '../../utils/metaphysicsUtils';
import { FolioGuideModal } from './FolioGuideModal';
import GuidedCreatorModal from './modals/GuidedCreatorModal';
import { UserSettingsModal } from '../UserSettingsModal';
import RosterCatalogView from './views/RosterCatalogView';

const FolioContainer = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const { openDiceRoller } = useDice();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search && window.location.search.includes('id=')) {
      return 'identity';
    }
    return 'catalog';
  });
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
  const [isMetaphysicsOpen, setIsMetaphysicsOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState(null);

  const fileInputRef = useRef(null);

  const {
    characterData,
    updateField,
    handleAddItem,
    handleUpdateItem,
    handleAddSkill,
    handleDeleteSkill,
    handleAddSpecialization,
    handleUpdateSpecialization,
    handleDeleteSpecialization,
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
    applySpeciesAdjustments,
    isInActiveGame,
    activeGameSession,
    setInActiveGame,
    toggleActiveGameLock,
    applyGMConfirmedUpdate,
    isGMConfirmed,
    setIsGMConfirmed,
    isProtectedGameStat
  } = useFolio();

  const [isExperienceCodexOpen, setIsExperienceCodexOpen] = useState(false);
  const [isKarmaCodexOpen, setIsKarmaCodexOpen] = useState(false);

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
    } else if (key === 'skills' || key === 'skill') {
      const cleanName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const skillGroup = taggedData.group || taggedData.type || 'physical';
      const id = taggedData.id || `${skillGroup}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      handleAddSkill({
        name: cleanName,
        id,
        group: skillGroup,
        subcategory: taggedData.subcategory || taggedData.subtype || 'General',
        baseAttr: taggedData.baseAttr || 'attr-strength',
        rank: parseInt(taggedData.rank, 10) || 1
      });
    } else if (key === 'disciplines' || key === 'awakened') {
      const discName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const formattedName = discName.startsWith('Awakened:') ? discName : `Awakened: ${discName}`;
      const item = {
        id: taggedData.id || `awakened_${Date.now()}`,
        name: formattedName,
        cp: 3,
        type: 'Awakened',
        category: 'Awakened Discipline',
        description: taggedData.description || taggedData.desc || ''
      };
      handleAddItem('features', item);
    } else if (key === 'invocations') {
      const rawObj = typeof taggedData === 'object' ? taggedData : { name: taggedData };
      const resolved = resolveMetaSkillForInvocation(rawObj);
      const newInv = {
        ...rawObj,
        id: rawObj.id || `inv_${Date.now()}`,
        name: rawObj.name || rawObj.title || 'Invocation',
        category: 'invocations',
        type: 'Invocation',
        discipline: rawObj.discipline || resolved.discipline,
        subSkill: rawObj.subSkill || resolved.subSkill,
        baseSkillId: rawObj.baseSkillId || resolved.baseSkillId,
        rank: Math.min(10, Math.max(1, parseInt(rawObj.rank || 1, 10))),
        cp: 1,
        mod: parseInt(rawObj.mod || 0, 10)
      };
      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem('invocations', index, newInv);
      } else {
        const currentInvs = Array.isArray(characterData.invocations) ? characterData.invocations : [];
        const exists = currentInvs.some(i => (typeof i === 'object' ? (i.name || i.title) : i).toLowerCase() === newInv.name.toLowerCase());
        if (exists) {
          alert(`Invocation "${newInv.name}" is already known.`);
        } else {
          handleAddItem('invocations', newInv);
        }
      }
    } else if (index !== null && index !== undefined && index >= 0) {
      handleUpdateItem(key, index, taggedData);
    } else {
      handleAddItem(key, taggedData);
    }
  }, [updateField, handleAddItem, handleUpdateItem, handleAddSkill, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments]);

  // Handle Delete from Asset Modal
  const handleDeleteAssetItem = useCallback((key, index = null, itemData = null) => {
    if (!key) return;

    if (key.startsWith('char-')) {
      updateField(key, '');
    } else if (key === 'skills' || key === 'skill') {
      const id = itemData?.id;
      if (id && handleDeleteSkill) {
        handleDeleteSkill(id);
      }
    } else if (key === 'specializations') {
      const id = itemData?.id;
      if (id && handleDeleteSpecialization) {
        handleDeleteSpecialization(id);
      }
    } else {
      const currentList = Array.isArray(characterData[key]) ? [...characterData[key]] : [];
      let updatedList = [];
      if (index !== null && index !== undefined && index >= 0 && index < currentList.length) {
        updatedList = currentList.filter((_, idx) => idx !== index);
      } else if (itemData) {
        const targetId = itemData.id;
        const targetName = (itemData.name || itemData.title || '').trim().toLowerCase();
        updatedList = currentList.filter(item => {
          if (typeof item === 'object' && item !== null) {
            if (targetId && item.id === targetId) return false;
            if (targetName && (item.name || item.title || '').trim().toLowerCase() === targetName) return false;
          } else if (typeof item === 'string' && targetName) {
            if (item.trim().toLowerCase() === targetName) return false;
          }
          return true;
        });
      } else {
        updatedList = currentList;
      }
      updateField(key, updatedList);
    }
  }, [characterData, updateField, handleDeleteSkill, handleDeleteSpecialization]);

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
    } else if (key === 'skills' || key === 'skill') {
      const cleanName = typeof value === 'object' ? (value.name || value.title || '') : value;
      const skillGroup = value.group || value.type || 'physical';
      const id = value.id || `${skillGroup}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      handleAddSkill({
        name: cleanName,
        id,
        group: skillGroup,
        subcategory: value.subcategory || value.subtype || 'General',
        baseAttr: value.baseAttr || 'attr-strength',
        rank: parseInt(value.rank, 10) || 1
      });
    } else if (key === 'disciplines' || key === 'awakened') {
      const discName = typeof value === 'object' ? (value.name || value.title || '') : value;
      const formattedName = discName.startsWith('Awakened:') ? discName : `Awakened: ${discName}`;
      const item = {
        id: (typeof value === 'object' && value.id) ? value.id : `awakened_${Date.now()}`,
        name: formattedName,
        cp: 3,
        type: 'Awakened',
        category: 'Awakened Discipline',
        description: typeof value === 'object' ? (value.description || value.desc || '') : ''
      };
      handleAddItem('features', item);
    } else if (key === 'invocations') {
      const rawObj = typeof value === 'object' ? value : { name: value };
      const resolved = resolveMetaSkillForInvocation(rawObj);
      const newInv = {
        ...rawObj,
        id: rawObj.id || `inv_${Date.now()}`,
        name: rawObj.name || rawObj.title || 'Invocation',
        category: 'invocations',
        type: 'Invocation',
        discipline: rawObj.discipline || resolved.discipline,
        subSkill: rawObj.subSkill || resolved.subSkill,
        baseSkillId: rawObj.baseSkillId || resolved.baseSkillId,
        rank: Math.min(10, Math.max(1, parseInt(rawObj.rank || 1, 10))),
        cp: 1,
        mod: parseInt(rawObj.mod || 0, 10)
      };
      const itemObj = attachCreatorTag(newInv, userHandle, currentUser);
      const currentInvs = Array.isArray(characterData.invocations) ? characterData.invocations : [];
      const exists = currentInvs.some(i => (typeof i === 'object' ? (i.name || i.title) : i).toLowerCase() === newInv.name.toLowerCase());
      if (exists) {
        alert(`Invocation "${newInv.name}" is already known by this operative.`);
      } else {
        handleAddItem('invocations', itemObj);
      }
    } else {
      const rawObj = typeof value === 'object' 
        ? { id: value.id || `item_${Date.now()}`, ...value, name: value.name || value.title, description: value.description || '', cp: value.cp || 0, category: value.category || '' } 
        : { id: `item_${Date.now()}`, name: value, description: '', cp: 0 };
      const itemObj = attachCreatorTag(rawObj, userHandle, currentUser);
      handleAddItem(key, itemObj);
    }
  }, [updateField, handleAddItem, handleAddSkill, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments]);

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
    const handleOpenCatalog = () => {
      setActiveTab('catalog');
      setIsSidebarOpen(false);
    };
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
    window.addEventListener('open-folio-catalog', handleOpenCatalog);
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
      window.removeEventListener('open-folio-catalog', handleOpenCatalog);
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
          onOpenAugmentationsCatalog={() => handleOpenSelectorModal('augmentations', 'Augmentations', 'augmentations')}
          onOpenMetaphysicsModal={() => setIsMetaphysicsOpen(true)}
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
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => openDiceRoller({ label: `${characterData['char-name'] || 'Operative'} Check`, characterName: characterData['char-name'] || 'Operative' })}
              className="px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[11px] font-mono font-bold flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
              title="Open Dice Tray"
            >
              <Dices size={12} className="text-cyan-400" />
              <span>Dice</span>
            </button>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase truncate">
              {characterData['char-name'] || 'UNNAMED OPERATIVE'}
            </span>
          </div>
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

        {/* Active Game Session & Tactical Integrity Lock Banner */}
        {isInActiveGame && (
          <div className="bg-gradient-to-r from-[#081b2b] via-[#0c1829] to-[#121c2e] border-b-2 border-cyan-500/80 px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-cyan-200 shrink-0 shadow-[0_4px_25px_rgba(6,182,212,0.35)] ring-1 ring-cyan-500/40 z-30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] shrink-0">
                <span className="text-base animate-pulse">⚡</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    ACTIVE GAME ENGAGED
                  </span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="font-bold text-white uppercase truncate">
                    {activeGameSession?.gameName || 'VTT Tactical Campaign'}
                  </span>
                  {activeGameSession?.gmHandle && (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-700/50">
                      GM: @{activeGameSession.gmHandle}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-cyan-300/85 mt-0.5">
                  <strong>STATISTICS LOCKED:</strong> Game statistics are protected during live play. Adjustments require GM experience awards, karma updates, or VTT confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsExperienceCodexOpen(true)}
                className="px-2.5 py-1 bg-purple-950/90 hover:bg-purple-900 border border-purple-400 text-purple-200 font-bold rounded uppercase text-[10px] shadow-[0_0_10px_rgba(168,85,247,0.25)] transition-all flex items-center gap-1 cursor-pointer"
                title="Open Experience Codex for AP awards & spend validation"
              >
                <span>✨</span>
                <span>Experience / AP</span>
              </button>

              <button
                type="button"
                onClick={() => setIsKarmaCodexOpen(true)}
                className="px-2.5 py-1 bg-amber-950/90 hover:bg-amber-900 border border-amber-400 text-amber-200 font-bold rounded uppercase text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.25)] transition-all flex items-center gap-1 cursor-pointer"
                title="Open Karma Codex & Ledger"
              >
                <span>☸️</span>
                <span>Karma Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const reason = prompt("GM Override: Enter authorization note to enable/disable direct stat modifications during active session:");
                  if (reason !== null) {
                    setIsGMConfirmed(prev => !prev);
                  }
                }}
                className={`px-2.5 py-1 font-bold rounded uppercase text-[10px] border transition-all flex items-center gap-1 cursor-pointer ${
                  isGMConfirmed 
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="GM authorization override toggle"
              >
                <span>{isGMConfirmed ? '🔓 GM Override Active' : '🔒 GM Override'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleActiveGameLock()}
                className="px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded text-[10px] transition-colors"
                title="Toggle Active Game Status"
              >
                <span>Session Lock</span>
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
          {activeTab === 'catalog' && (
            <RosterCatalogView
              personaRoster={personaRoster}
              activeDocId={characterData['character-doc-id']}
              onSelectCharacter={(docId) => {
                switchRosterCharacter(docId);
                setActiveTab('identity');
              }}
              onNewCharacter={() => {
                handleNewCharacter();
                setActiveTab('identity');
              }}
              onGuidedCreator={() => {
                setIsGuidedCreatorOpen(true);
              }}
              onDuplicateCharacter={duplicateRosterCharacter}
              onDeleteCharacter={deleteRosterCharacter}
              onUpdateNote={updateRosterCharacterNote}
              onToggleVisibility={togglePersonaVisibility}
              onLoadPublicGallery={loadPublicPersonas}
              publicCatalog={publicCatalog}
              onSelectPublicPersona={(char) => {
                handleLoadCloud(char.id);
                setActiveTab('identity');
              }}
              onClonePublicPersona={(char) => {
                clonePublicPersona(char);
                setActiveTab('identity');
              }}
            />
          )}
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
              onOpenSelectorModal={handleOpenSelectorModal}
            />
          )}
          {(activeTab === 'features' || activeTab === 'abilities' || activeTab.startsWith('features-')) && (
            <FeaturesTab
              activeSection={
                activeTab === 'features-hindrances' ? 'hindrances' :
                activeTab === 'features-augmentations' ? 'augmentations' :
                activeTab === 'features-metaphysics' || activeTab === 'features-awakened' ? 'metaphysics' :
                activeTab === 'features-standard' ? 'features' :
                'all'
              }
              onOpenSelectorModal={handleOpenSelectorModal}
              onOpenAssetModal={handleOpenAssetModal}
              onOpenMetaphysicsModal={() => setIsMetaphysicsOpen(true)}
            />
          )}
          {activeTab === 'combat' && (
            <CombatTab
              onOpenSelectorModal={handleOpenSelectorModal}
              onOpenAssetModal={handleOpenAssetModal}
            />
          )}
          {(activeTab === 'property' || activeTab.startsWith('property-') || activeTab === 'combat-gear') && (
            <PropertyTab
              activeSection={activeTab.startsWith('property-') ? activeTab.replace('property-', '') : 'gear'}
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
        onDeleteAsset={handleDeleteAssetItem}
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
      <EconomyModal
        isOpen={isEconomyOpen}
        onClose={() => setIsEconomyOpen(false)}
        characterData={characterData}
        updateField={updateField}
        economyBreakdown={economyBreakdown}
      />
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        personaRoster={personaRoster}
        activeDocId={characterData['character-doc-id']}
        onSelectCharacter={(docId) => {
          switchRosterCharacter(docId);
          setActiveTab('identity');
          setIsRosterOpen(false);
        }}
        onNewCharacter={() => {
          handleNewCharacter();
          setActiveTab('identity');
          setIsRosterOpen(false);
        }}
        onDuplicateCharacter={duplicateRosterCharacter}
        onDeleteCharacter={deleteRosterCharacter}
        onUpdateNote={updateRosterCharacterNote}
        onToggleVisibility={togglePersonaVisibility}
        onLoadPublicGallery={loadPublicPersonas}
        publicCatalog={publicCatalog}
        onSelectPublicPersona={(char) => {
          handleLoadCloud(char.id);
          setActiveTab('identity');
          setIsRosterOpen(false);
        }}
        onClonePublicPersona={(char) => {
          clonePublicPersona(char);
          setActiveTab('identity');
          setIsRosterOpen(false);
        }}
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
      <MetaphysicsModal
        isOpen={isMetaphysicsOpen}
        onClose={() => setIsMetaphysicsOpen(false)}
      />
      <ExperienceCodexModal
        isOpen={isExperienceCodexOpen}
        onClose={() => setIsExperienceCodexOpen(false)}
        earnedAP={parseInt(characterData.earned_ap || 0, 10)}
        availableAP={parseInt(characterData.available_ap !== undefined ? characterData.available_ap : (characterData.earned_ap || 0), 10)}
        experienceDebt={parseInt(characterData.experience_debt || 0, 10)}
      />
      <KarmaCodexModal
        isOpen={isKarmaCodexOpen}
        onClose={() => setIsKarmaCodexOpen(false)}
      />
      {/* Print-only Folio Output */}
      <div className="hidden print:block">
        <PrintFolio characterData={characterData} />
      </div>
    </div>
  );
};

export default FolioContainer;
