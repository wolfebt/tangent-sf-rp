import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { useDice } from '../../context/DiceContext';
import { Lock, Unlock, Copy, AlertTriangle, ShieldCheck, FileText, CheckCircle2, Save, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Toast } from '../UI/Toast';
import { useToast, showToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { FolioSidebar } from './FolioSidebar';
import IdentityTab from './tabs/IdentityTab';
import CoreStatsTab from './tabs/CoreStatsTab';
import SkillsTab from './tabs/SkillsTab';
import FeaturesTab from './tabs/FeaturesTab';
import CombatTab from './tabs/CombatTab';
import CompanionsTab from './tabs/CompanionsTab';
import PropertyTab from './tabs/PropertyTab';
import NarrativeTab from './tabs/NarrativeTab';
import MediaTab from './tabs/MediaTab';
import OtherTab from './tabs/OtherTab';
import AddSkillModal from './modals/AddSkillModal';
import ConfirmationModal from './modals/ConfirmationModal';
import { attachCreatorTag } from '../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';
import { resolveMetaSkillForInvocation } from '../../utils/metaphysicsUtils';
import { getEnrichedAugmentationData } from '../../data/augmentationsData';
import { getEnrichedHindranceData } from '../../data/speciesDisadvantagesData';
import { enrichItemWithModifiers } from '../../engines/tangentModifierEngine';
import { AudioService } from '../../services/audioService';
import { getFolioTombstones, isFolioPersonaDeleted, isPersonaEmptyTemplate } from '../../utils/personaValidationUtils';
import RosterCatalogView from './views/RosterCatalogView';
import TacticalPlayView from './views/TacticalPlayView';
import { BreadcrumbNav } from '../UI/BreadcrumbNav';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// Lazy Loaded Heavy Modals & Drawers (Optimized Cold-Load Code Splitting with Stale Chunk Recovery)
const CustomSelectorModal = lazyWithRetry(() => import('./modals/CustomSelectorModal'));
const AssetModal = lazyWithRetry(() => import('./modals/AssetModal'));
const MetaphysicsModal = lazyWithRetry(() => import('./modals/MetaphysicsModal'));
const GuidedCreatorModal = lazyWithRetry(() => import('./modals/GuidedCreatorModal'));
const PrintFolio = lazyWithRetry(() => import('./print/PrintFolio'));
const EconomyModal = lazyWithRetry(() => import('./modals/EconomyModal'));
const RosterModal = lazyWithRetry(() => import('./modals/RosterModal'));
const BastionDrawer = lazyWithRetry(() => import('./BastionDrawer'));
const FolioGuideModal = lazyWithRetry(() => import('./FolioGuideModal'));
const UserSettingsModal = lazyWithRetry(() => import('../UserSettingsModal'));
const TrackedModificationsModal = lazyWithRetry(() => import('./modals/TrackedModificationsModal'));
const PreviewModal = lazyWithRetry(() => import('./modals/PreviewModal'));

const FolioContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const confirm = useConfirm();
  const { openDiceRoller, isDiceOpen, closeDiceRoller } = useDice();
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
  const tabScrollContainerRef = useRef(null);
  const lastSyncedSearchRef = useRef(null);

  const {
    activeTab: rawActiveTab,
    setActiveTab,
    isCharacterSelected,
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
    togglePersonaNetworkEngaged,
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
    isProtectedGameStat,
    isLocked,
    folioPhase,
    isReadyForVTT,
    allowPlayerOverride,
    isPlayerOverride,
    isFolioLockedOut,
    lockPersona,
    unlockPersona,
    clonePersonaVariant,
    revertTrackedModification,
    trackedModifications,
    viewMode,
    setViewMode,
    togglePersonaVttLock
  } = useFolio();

  const activeTab = (typeof rawActiveTab === 'string' && rawActiveTab) ? rawActiveTab : 'identity';

  const [isTrackedModsOpen, setIsTrackedModsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Synchronize viewMode with Persona Locking lifecycle
  useEffect(() => {
    if (isLocked) {
      setViewMode('play');
    }
  }, [isLocked, setViewMode]);

  useEffect(() => {
    const handleSetViewMode = (e) => {
      if (e?.detail) setViewMode(e.detail);
    };
    window.addEventListener('set-folio-view-mode', handleSetViewMode);
    return () => window.removeEventListener('set-folio-view-mode', handleSetViewMode);
  }, [setViewMode]);

  // Global Event Listener for Economy Modal
  useEffect(() => {
    const handleOpenEconomy = () => setIsEconomyOpen(true);
    window.addEventListener('open-folio-economy', handleOpenEconomy);
    return () => window.removeEventListener('open-folio-economy', handleOpenEconomy);
  }, []);

  // Seamless navigation helper that synchronizes active tab and character with browser history
  const handleSelectTab = useCallback((newTab, newCharId = null, pushHistory = true, shouldSave = true) => {
    if (shouldSave && newTab !== 'catalog') {
      triggerSave();
    }
    const charId = newCharId || characterData?.['character-doc-id'] || characterData?.id;
    const searchParams = new URLSearchParams(location.search);

    if (newTab === 'catalog') {
      searchParams.set('tab', 'catalog');
      searchParams.delete('char');
    } else {
      searchParams.set('tab', newTab);
      if (charId) {
        searchParams.set('char', charId);
      }
    }

    const newSearch = `?${searchParams.toString()}`;
    lastSyncedSearchRef.current = newSearch;
    if (location.search !== newSearch) {
      if (pushHistory) {
        navigate({ pathname: location.pathname, search: newSearch });
      } else {
        navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
      }
    }
    setActiveTab?.(newTab);
    setIsSidebarOpen(false);
    if (viewMode === 'play' && newTab !== 'combat') {
      setViewMode('builder');
    }
    if (tabScrollContainerRef.current) {
      tabScrollContainerRef.current.scrollTop = 0;
    }
  }, [triggerSave, characterData, location.search, location.pathname, navigate, setActiveTab, viewMode, setViewMode]);

  // Hotkeys Alt + 1-9 / 0 to switch Folio dossier tabs
  useEffect(() => {
    const FOLIO_TAB_KEYS = {
      '1': 'identity',
      '2': 'core-stats',
      '3': 'skills',
      '4': 'features',
      '5': 'combat',
      '6': 'companions',
      '7': 'property',
      '8': 'narrative',
      '9': 'media',
      '0': 'other'
    };
    const handleFolioTabHotkeys = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const digit = e.key && FOLIO_TAB_KEYS[e.key] ? e.key : (e.code?.startsWith('Digit') ? e.code.replace('Digit', '') : null);
      const targetTab = digit ? FOLIO_TAB_KEYS[digit] : null;
      if (targetTab) {
        e.preventDefault();
        AudioService?.playTerminalBeep?.(1100, 0.02);
        handleSelectTab(targetTab);
      }
    };
    window.addEventListener('keydown', handleFolioTabHotkeys);
    return () => window.removeEventListener('keydown', handleFolioTabHotkeys);
  }, [handleSelectTab]);

  // Synchronize activeTab and character selection with URL query parameter (e.g. /folio?tab=catalog or /folio?char=123&tab=skills)
  useEffect(() => {
    if (lastSyncedSearchRef.current === location.search) return;
    lastSyncedSearchRef.current = location.search;

    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const charParam = params.get('char');
    const curDocId = characterData?.['character-doc-id'] || characterData?.id;

    if (charParam && charParam !== curDocId) {
      const tombstones = getFolioTombstones();
      if (!isFolioPersonaDeleted(charParam, tombstones)) {
        switchRosterCharacter?.(charParam);
      }
    }

    if (tabParam) {
      const validTabs = [
        'catalog', 'identity', 'core-stats', 'stats', 'skills',
        'features', 'features-standard', 'features-traits', 'features-hindrances', 'features-augmentations', 'features-metaphysics', 'features-awakened',
        'abilities', 'combat', 'companions',
        'property', 'property-weaponry', 'property-armoring', 'property-gear', 'property-mech', 'property-architecture', 'property-other', 'property-vehicles', 'property-wealth', 'combat-gear',
        'narrative', 'media', 'visuals', 'other'
      ];
      if (validTabs.includes(tabParam)) {
        const resolvedTab = tabParam === 'stats' ? 'core-stats' : tabParam;
        if (resolvedTab !== activeTab) {
          setActiveTab?.(resolvedTab);
        }
      }
    }
  }, [location.search, characterData, switchRosterCharacter, activeTab, setActiveTab]);

  const handleSelectCharacter = useCallback((docId, targetTab = 'identity') => {
    switchRosterCharacter(docId);
    handleSelectTab(targetTab, docId, true);
  }, [switchRosterCharacter, handleSelectTab]);

  const handleReturnToCatalog = useCallback(() => {
    handleSelectTab('catalog', null, true, false);
  }, [handleSelectTab]);

  const handleCreateNewBlankCharacter = useCallback(async ({ saveCurrent = true } = {}) => {
    const curDocId = characterData?.['character-doc-id'] || characterData?.id;
    if (saveCurrent && curDocId && !isPersonaEmptyTemplate(characterData)) {
      try {
        await saveCurrentToRoster?.(characterData);
      } catch (e) {
        console.warn('Could not auto-save current persona before creating new blank:', e);
      }
    }

    const newDocId = handleNewCharacter?.();
    if (newDocId) {
      handleSelectTab('identity', newDocId, true, false);
    } else {
      handleSelectTab('identity', null, true, false);
    }
  }, [characterData, saveCurrentToRoster, handleNewCharacter, handleSelectTab]);

  const handleFolioBack = useCallback(() => {
    if (viewMode === 'play') {
      setViewMode('builder');
      return;
    }
    if (activeTab?.startsWith('features-')) {
      handleSelectTab('features');
      return;
    }
    if (activeTab?.startsWith('property-') || activeTab === 'combat-gear') {
      handleSelectTab('property');
      return;
    }
    if (activeTab !== 'catalog') {
      handleReturnToCatalog();
      return;
    }
    navigate('/');
  }, [viewMode, setViewMode, activeTab, handleSelectTab, handleReturnToCatalog, navigate]);

  const getFolioBreadcrumbs = useCallback(() => {
    const crumbs = [
      { label: 'Tangent RP', to: '/' },
      {
        label: 'Folio',
        to: '/folio?tab=catalog',
        onClick: activeTab !== 'catalog' ? () => handleReturnToCatalog() : undefined
      }
    ];

    if (activeTab === 'catalog') {
      crumbs.push({
        label: 'Persona Catalog',
        active: true,
        badge: personaRoster?.length ? `${personaRoster.length}` : undefined
      });
      return crumbs;
    }

    const charName = characterData?.['char-name'] || 'Persona';
    const charDocId = characterData?.['character-doc-id'] || characterData?.id;

    crumbs.push({
      label: charName,
      onClick: activeTab !== 'identity' ? () => handleSelectTab('identity', charDocId) : undefined,
      active: activeTab === 'identity' && viewMode !== 'play',
      badge: characterData?.['char-archetype'] || undefined,
      className: 'hidden md:flex'
    });

    if (viewMode === 'play') {
      crumbs.push({
        label: 'Tactical VTT Sheet',
        active: true,
        color: 'text-amber-400',
        badge: 'LIVE'
      });
      return crumbs;
    }

    if (activeTab === 'identity') {
      return crumbs;
    }

    const tabHierarchyMap = {
      'core-stats': { parent: null, label: 'Core Attributes' },
      'skills': { parent: null, label: 'Skills & Masteries' },
      'features': { parent: null, label: 'Aspects Hub & Overview' },
      'features-standard': { parent: 'features', parentLabel: 'Aspects', label: 'Standard Features' },
      'features-traits': { parent: 'features', parentLabel: 'Aspects', label: 'Traits' },
      'features-hindrances': { parent: 'features', parentLabel: 'Aspects', label: 'Hindrances' },
      'features-augmentations': { parent: 'features', parentLabel: 'Aspects', label: 'Augmentations' },
      'features-metaphysics': { parent: 'features', parentLabel: 'Aspects', label: 'Metaphysics' },
      'features-awakened': { parent: 'features', parentLabel: 'Aspects', label: 'Awakened Disciplines' },
      'abilities': { parent: null, label: 'Special Abilities' },
      'combat': { parent: null, label: 'Tactical & Combat' },
      'companions': { parent: null, label: 'Companions & Units' },
      'property': { parent: null, label: 'Property & Assets Hub' },
      'property-gear': { parent: 'property', parentLabel: 'Property', label: 'Equipment & Gear' },
      'combat-gear': { parent: 'property', parentLabel: 'Property', label: 'Combat Gear' },
      'property-vehicles': { parent: 'property', parentLabel: 'Property', label: 'Vehicles & Starships' },
      'property-wealth': { parent: 'property', parentLabel: 'Property', label: 'Finances & Wealth' },
      'narrative': { parent: null, label: 'Narrative & Background' },
      'media': { parent: null, label: 'Visual Dossier & Media' },
      'visuals': { parent: null, label: 'Visual Dossier & Media' },
      'other': { parent: null, label: 'Notes & Log' }
    };

    const tabInfo = tabHierarchyMap[activeTab];
    if (tabInfo) {
      if (tabInfo.parent) {
        crumbs.push({
          label: tabInfo.parentLabel || 'Hub',
          onClick: () => handleSelectTab(tabInfo.parent, charDocId)
        });
      }
      crumbs.push({
        label: tabInfo.label,
        active: true
      });
    } else {
      crumbs.push({
        label: activeTab,
        active: true
      });
    }

    return crumbs;
  }, [activeTab, handleReturnToCatalog, personaRoster, characterData, viewMode, handleSelectTab]);

  const handleManualSave = useCallback(async () => {
    if (saveCurrentToRoster) {
      const res = await saveCurrentToRoster();
      const charName = res?.name || characterData['char-name'] || 'Persona';
      setToast({
        type: 'success',
        title: 'Persona Folio Saved',
        message: `Dossier "${charName}" saved to Roster and Cloud Storage.`
      });
    }
  }, [saveCurrentToRoster, characterData]);

  const handleDeleteCurrentCharacter = useCallback(async () => {
    const charName = characterData['char-name'] || 'Unnamed Persona';
    if (!(await confirmTypedDeletion(charName, 'persona sheet'))) return;
    const activeDocId = characterData['character-doc-id'] || characterData.id;
    deleteRosterCharacter(activeDocId || characterData);
    setIsDeleteConfirmOpen(false);
    handleReturnToCatalog();
  }, [characterData, deleteRosterCharacter, handleReturnToCatalog]);

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

      // Auto-prompt archetype 80 CP chassis if present
      if (key === 'char-archetype' && typeof taggedData === 'object') {
        (async () => {
          const autoApply = await confirm({
            title: 'Apply Archetype Chassis',
            message: `Selected Archetype "${name}". Would you like to apply the 80 CP Archetype Pre-Build (+3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Traits)?`,
            confirmLabel: 'Apply 80 CP Pre-Build',
            danger: false
          });
          if (autoApply && applyArchetypeChassis) {
            applyArchetypeChassis(taggedData);
          } else {
            updateField(key, name);
          }
        })();
      } else {
        updateField(key, name);
      }
    } else if (key === 'skills' || key === 'skill') {
      const cleanName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const skillGroup = taggedData.group || taggedData.type || 'physical';
      const id = taggedData.id || `${skillGroup}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const cleanId = id.replace(/^[a-z]+-/, '');
      const existingRank = characterData?.[`skill-${id}-rank`] !== undefined 
        ? characterData[`skill-${id}-rank`] 
        : (characterData?.[`skill-${cleanId}-rank`] !== undefined 
          ? characterData[`skill-${cleanId}-rank`] 
          : (taggedData.rank !== undefined ? parseInt(taggedData.rank, 10) : 1));

      handleAddSkill({
        name: cleanName,
        id,
        group: skillGroup,
        subcategory: taggedData.subcategory || taggedData.subtype || 'General',
        baseAttr: taggedData.baseAttr || characterData?.[`skill-${id}-base`] || characterData?.[`skill-${cleanId}-base`] || 'attr-strength',
        rank: existingRank
      });

      if (taggedData.description) {
        updateField(`skill-${id}-description`, taggedData.description);
        if (cleanId !== id) updateField(`skill-${cleanId}-description`, taggedData.description);
      }

      showToast({
        type: 'success',
        title: 'Skill Dataset Updated',
        text: `Successfully updated "${cleanName}" in Omnicortex database and active persona folio.`
      });
    } else if (key === 'features' || key === 'feature') {
      const cleanName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const featCategory = taggedData.category || taggedData.type || 'General';
      const featId = taggedData.id || `feature-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      
      const acqType = taggedData.acquisition_type || (
        taggedData.multi && taggedData.staged ? 'Multi/Staged' :
        taggedData.staged ? 'Staged' :
        taggedData.multi ? 'Multiple' : 'Basic'
      );
      const isMulti = acqType === 'Multiple' || acqType === 'Multi/Staged';
      const isStaged = acqType === 'Staged' || acqType === 'Multi/Staged';

      const newFeature = {
        ...(typeof taggedData === 'object' ? taggedData : {}),
        id: featId,
        name: cleanName,
        category: featCategory,
        type: (taggedData.type || featCategory || 'general').toLowerCase(),
        acquisition_type: acqType,
        multi: isMulti,
        staged: isStaged,
        is_multiple: isMulti,
        is_ranked: isStaged,
        rank: taggedData.rank || 1,
        max_rank: taggedData.max_rank || (isStaged ? 5 : undefined),
        modifier_options: taggedData.modifier_options || {
          enabled: false,
          mode: 'single',
          value: 2,
          options: []
        },
        selected_option_id: taggedData.selected_option_id || '',
        cp: taggedData.cp !== undefined ? Number(taggedData.cp) : 3,
        description: taggedData.description || '',
        mechanic: taggedData.mechanic || taggedData.mechanics || '',
        prerequisites: taggedData.prerequisites || taggedData.prerequisite || 'None',
        modifiers: Array.isArray(taggedData.modifiers) ? taggedData.modifiers : []
      };

      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem('features', index, newFeature);
      } else {
        const currentFeatures = Array.isArray(characterData?.features) ? characterData.features : [];
        const existingIdx = currentFeatures.findIndex(f => {
          const fId = (typeof f === 'object' ? f.id : '').toLowerCase();
          const fName = (typeof f === 'object' ? (f.name || f.title) : f).toLowerCase();
          return (featId && fId === featId.toLowerCase()) || (cleanName && fName === cleanName.toLowerCase());
        });

        if (existingIdx >= 0) {
          handleUpdateItem('features', existingIdx, newFeature);
        } else {
          handleAddItem('features', newFeature);
        }
      }

      showToast({
        type: 'success',
        title: 'Feature Dataset Updated',
        text: `Successfully updated "${cleanName}" in Omnicortex database and active persona folio.`
      });
    } else if (key === 'traits' || key === 'trait') {
      const cleanName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const traitType = taggedData.trait_type || taggedData.type || 'Species Trait';
      const traitTier = taggedData.trait_tier || 'Basic';
      const classification = taggedData.classification || 'Physical';
      const traitId = taggedData.id || `trait-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      const newTrait = {
        ...(typeof taggedData === 'object' ? taggedData : {}),
        id: traitId,
        name: cleanName,
        category: 'traits',
        trait_type: traitType,
        trait_tier: traitTier,
        classification,
        type: classification,
        cp: taggedData.cp !== undefined ? Number(taggedData.cp) : 1,
        bp: taggedData.bp !== undefined ? Number(taggedData.bp) : (taggedData.cp !== undefined ? Number(taggedData.cp) : 1),
        description: taggedData.description || taggedData.desc || '',
        mechanic: taggedData.mechanic || taggedData.mechanics || '',
        note: taggedData.note || taggedData.notes || '',
        notes: taggedData.notes || taggedData.note || '',
        rules: taggedData.rules || taggedData.special_rules || `${traitTier} ${traitType} (${taggedData.cp || 1} CP).`,
        modifiers: Array.isArray(taggedData.modifiers) ? taggedData.modifiers : []
      };

      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem('traits', index, newTrait);
      } else {
        const currentTraits = Array.isArray(characterData?.traits) ? characterData.traits : [];
        const existingIdx = currentTraits.findIndex(t => {
          const tId = (typeof t === 'object' ? t.id : '').toLowerCase();
          const tName = (typeof t === 'object' ? (t.name || t.title) : t).toLowerCase();
          return (traitId && tId === traitId.toLowerCase()) || (cleanName && tName === cleanName.toLowerCase());
        });

        if (existingIdx >= 0) {
          handleUpdateItem('traits', existingIdx, newTrait);
        } else {
          handleAddItem('traits', newTrait);
        }
      }

      showToast({
        type: 'success',
        title: 'Trait Dataset Updated',
        text: `Successfully updated "${cleanName}" in Omnicortex database and active persona folio.`
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
    } else if (key === 'invocations' || key === 'invocation') {
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
        rank: Math.min(10, Math.max(1, parseInt(rawObj.rank || rawObj.level || 1, 10))),
        cp: 1,
        mod: parseInt(rawObj.mod || 0, 10)
      };
      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem('invocations', index, newInv);
      } else {
        const currentInvs = Array.isArray(characterData.invocations) ? characterData.invocations : [];
        const existingIdx = currentInvs.findIndex(i => {
          const iId = (typeof i === 'object' ? i.id : '').toLowerCase();
          const iName = (typeof i === 'object' ? (i.name || i.title) : i).toLowerCase();
          return (newInv.id && iId === newInv.id.toLowerCase()) || (newInv.name && iName === newInv.name.toLowerCase());
        });
        if (existingIdx >= 0) {
          handleUpdateItem('invocations', existingIdx, newInv);
        } else {
          handleAddItem('invocations', newInv);
        }
      }
      showToast({
        type: 'success',
        title: 'Invocation Dataset Updated',
        text: `Successfully updated "${newInv.name}" in Omnicortex database and active persona folio.`
      });
    } else if (key === 'augmentations' || key === 'augmentation' || key === 'cyberware' || key === 'cybernetics' || key === 'bioware') {
      const newAug = getEnrichedAugmentationData(taggedData);
      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem('augmentations', index, newAug);
      } else {
        const currentAugs = Array.isArray(characterData.augmentations) ? characterData.augmentations : [];
        const existingIdx = currentAugs.findIndex(a => {
          const aId = (typeof a === 'object' ? a.id : '').toLowerCase();
          const aName = (typeof a === 'object' ? (a.name || a.title) : a).toLowerCase();
          return (newAug.id && aId === newAug.id.toLowerCase()) || (newAug.name && aName === newAug.name.toLowerCase());
        });
        if (existingIdx >= 0) {
          handleUpdateItem('augmentations', existingIdx, newAug);
        } else {
          handleAddItem('augmentations', newAug);
        }
      }
      showToast({
        type: 'success',
        title: 'Augmentation Dataset Updated',
        text: `Successfully updated "${newAug.name}" in Omnicortex database and active persona folio.`
      });
    } else if (key === 'disadvantages' || key === 'disadvantage' || key === 'hindrances' || key === 'hindrance' || key === 'species_disadvantages') {
      const cleanName = typeof taggedData === 'object' ? (taggedData.name || taggedData.title || '') : taggedData;
      const targetCol = (key === 'hindrances' || key === 'hindrance') ? 'hindrances' : 'disadvantages';
      const enrichedHind = getEnrichedHindranceData(taggedData);
      
      if (index !== null && index !== undefined && index >= 0) {
        handleUpdateItem(targetCol, index, enrichedHind);
      } else {
        const currentList = Array.isArray(characterData[targetCol]) ? characterData[targetCol] : [];
        const existingIdx = currentList.findIndex(h => {
          const hId = (typeof h === 'object' ? h.id : '').toLowerCase();
          const hName = (typeof h === 'object' ? (h.name || h.title) : h).toLowerCase();
          return (enrichedHind.id && hId === enrichedHind.id.toLowerCase()) || (cleanName && hName === cleanName.toLowerCase());
        });
        if (existingIdx >= 0) {
          handleUpdateItem(targetCol, existingIdx, enrichedHind);
        } else {
          handleAddItem(targetCol, enrichedHind);
        }
      }
      showToast({
        type: 'success',
        title: 'Hindrance Dataset Updated',
        text: `Successfully updated "${cleanName}" in Omnicortex database and active persona folio.`
      });
    } else if (index !== null && index !== undefined && index >= 0) {
      handleUpdateItem(key, index, taggedData);
    } else {
      handleAddItem(key, taggedData);
    }
  }, [updateField, handleAddItem, handleUpdateItem, handleAddSkill, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments, characterData]);

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
      const targetColKey = (key === 'feature') ? 'features' : (key === 'trait' ? 'traits' : (key === 'invocation' ? 'invocations' : ((key === 'augmentation' || key === 'cyberware' || key === 'cybernetics' || key === 'bioware') ? 'augmentations' : ((key === 'hindrance' || key === 'disadvantage' || key === 'species_disadvantages') ? 'disadvantages' : key))));
      const currentList = Array.isArray(characterData[targetColKey]) ? [...characterData[targetColKey]] : [];
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
      updateField(targetColKey, updatedList);
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

      // Auto-prompt archetype 80 CP chassis if present
      if (key === 'char-archetype' && typeof value === 'object') {
        (async () => {
          const autoApply = await confirm({
            title: 'Apply Archetype Chassis',
            message: `Selected Archetype "${name}". Would you like to apply the 80 CP Archetype Pre-Build (+3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Traits)?`,
            confirmLabel: 'Apply 80 CP Pre-Build',
            danger: false
          });
          if (autoApply && applyArchetypeChassis) {
            applyArchetypeChassis(value);
          } else {
            updateField(key, name);
          }
        })();
      } else {
        updateField(key, name);
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
        showToast({ type: 'warn', title: 'Invocation Already Known', text: `Invocation "${newInv.name}" is already known by this persona.` });
      } else {
        handleAddItem('invocations', itemObj);
      }
    } else {
      let rawObj = typeof value === 'object' 
        ? { id: value.id || `item_${Date.now()}`, ...value, name: value.name || value.title, description: value.description || '', cp: value.cp || 0, category: value.category || '' } 
        : { id: `item_${Date.now()}`, name: value, description: '', cp: 0 };
      
      if (['features', 'traits', 'hindrances', 'disadvantages'].includes(key)) {
        rawObj = enrichItemWithModifiers(rawObj);
      }
      
      const itemObj = attachCreatorTag(rawObj, userHandle, currentUser);
      handleAddItem(key, itemObj);
    }
  }, [updateField, handleAddItem, handleAddSkill, userHandle, currentUser, applyArchetypeChassis, applySpeciesAdjustments, confirm]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleLoadLocal(file);
  };

  const handleCloudLoadPrompt = async () => {
    const res = await confirm({
      title: 'Load Persona from Cloud',
      message: 'Enter Persona Document ID to load from Terran Net cloud vault:',
      inputLabel: 'Persona Document ID',
      inputValue: characterData['character-doc-id'] || '',
      confirmLabel: 'Load Persona'
    });
    const docId = typeof res === 'object' ? res?.value : (typeof res === 'string' ? res : '');
    if (docId && docId.trim()) {
      handleLoadCloud(docId.trim());
    }
  };

  // Wire Top-level GlobalHUD header custom events to Folio modal state
  useEffect(() => {
    const handleOpenEconomy = () => setIsEconomyOpen(true);
    const handleToggleBastion = () => setIsBastionOpen(prev => !prev);
    const handleOpenCatalog = () => {
      handleReturnToCatalog();
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

    const handleTriggerSave = () => handleManualSave();

    const handleOpenAssetEvent = (e) => {
      const { key = 'skills', title = 'Asset Matrix', mode = 'edit', itemIndex = null, initialData = null } = e.detail || {};
      setIsSelectorOpen(false);
      handleOpenAssetModal(key, title, mode, itemIndex, initialData);
    };

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
    window.addEventListener('trigger-folio-save', handleTriggerSave);
    window.addEventListener('open-folio-asset', handleOpenAssetEvent);

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
      window.removeEventListener('trigger-folio-save', handleTriggerSave);
      window.removeEventListener('open-folio-asset', handleOpenAssetEvent);
    };
  }, [handleManualSave, handleOpenAssetModal]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative">
      {/* Hidden File Input for Loading Files */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* Breadcrumb Navigation & Workspace Controls Bar (Across Top) */}
      <BreadcrumbNav
        items={getFolioBreadcrumbs()}
        onBack={handleFolioBack}
        showBack={!isCharacterSelected || activeTab === 'catalog'}
        backTitle={
          viewMode === 'play'
            ? 'Return to Folio Builder'
            : activeTab?.startsWith('features-')
            ? 'Return to Aspects Hub & Overview'
            : (activeTab?.startsWith('property-') || activeTab === 'combat-gear')
            ? 'Return to Property Hub'
            : activeTab !== 'catalog'
            ? 'Return to Persona Catalog'
            : 'Return to Tangent SF RP Dashboard'
        }
        leftSlot={
          isCharacterSelected ? (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setIsSidebarOpen(prev => !prev);
              }}
              className={`min-h-[28px] px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer select-none border font-mono font-bold text-[11px] uppercase tracking-wider active:scale-95 touch-manipulation md:hidden shrink-0 shadow-xs ${
                isSidebarOpen
                  ? 'bg-cyan-500/25 border-cyan-300 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900/95 hover:bg-cyan-950/80 border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
              }`}
              title={isSidebarOpen ? 'Close Folio Guide Rail' : 'Open Folio Guide Rail'}
              aria-label={isSidebarOpen ? 'Close Folio Guide Rail' : 'Open Folio Guide Rail'}
            >
              {isSidebarOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} className="text-cyan-400" />}
              <span>Rail</span>
            </button>
          ) : null
        }
        rightSlot={
          isCharacterSelected && activeTab !== 'catalog' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  handleManualSave();
                }}
                disabled={cloudSaveStatus === 'saving'}
                className={`min-h-[26px] px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border select-none ${
                  cloudSaveStatus === 'saving'
                    ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 animate-pulse'
                    : cloudSaveStatus === 'error'
                    ? 'bg-red-950/70 border-red-500/60 text-red-300 hover:bg-red-900/60'
                    : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                }`}
                title={
                  cloudSaveStatus === 'saving'
                    ? 'Auto-syncing Persona to Cloud Vault...'
                    : cloudSaveStatus === 'saved'
                    ? `Auto-Synced (${lastSavedTime ? new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Synced'}) — Click to force sync`
                    : cloudSaveStatus === 'error'
                    ? 'Cloud Sync Error — Click to retry'
                    : 'Auto-Saved to Local Roster (Click to force sync)'
                }
                aria-label="Cloud Sync Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  cloudSaveStatus === 'saving'
                    ? 'bg-amber-400 animate-ping'
                    : cloudSaveStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                }`} />
                <span>
                  {cloudSaveStatus === 'saving'
                    ? 'Syncing...'
                    : cloudSaveStatus === 'error'
                    ? 'Retry Sync'
                    : cloudSaveStatus === 'offline'
                    ? 'Local Synced'
                    : 'Synced'}
                </span>
              </button>
            </div>
          ) : null
        }
      />

      {/* Main Workspace Layout with Folio Guide Rail and Content */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile Sidebar Overlay Backdrop when expanded */}
        {isCharacterSelected && isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation (Guide Rail moved down under breadcrumb trail) */}
        {isCharacterSelected && (
          <FolioSidebar
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeTab={activeTab}
            setActiveTab={(tab) => handleSelectTab(tab)}
            charName={characterData['char-name']}
            onOpenRoster={() => setIsRosterOpen(true)}
            onOpenAugmentationsCatalog={() => handleOpenSelectorModal('augmentations', 'Augmentations', 'augmentations')}
            onOpenMetaphysicsModal={() => setIsMetaphysicsOpen(true)}
            onSave={handleManualSave}
            saveStatus={cloudSaveStatus}
            onClose={() => setIsSidebarOpen(false)}
            isMobileOpen={isSidebarOpen}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117] min-w-0">
          {/* Public Read-Only Banner */}
        {isReadOnly && (
          <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-amber-200 shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">🌐</span>
              <span>
                <strong>PUBLIC READ-ONLY VIEW:</strong> Persona Sheet by <strong className="text-amber-400">{characterData.authorHandle || characterData['char-name'] || 'Community Creator'}</strong>.
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
        {isCharacterSelected && (() => {
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
        <div
          ref={tabScrollContainerRef}
          className={`flex-1 overflow-y-auto relative p-2.5 sm:p-5 pb-32 sm:pb-20 ${(viewMode === 'play' || viewMode === 'preview') ? 'scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : ''}`}
          onBlur={() => {
            if (activeTab !== 'catalog') {
              triggerSave();
            }
          }}
        >
          {activeTab === 'catalog' ? (
            <RosterCatalogView
              personaRoster={personaRoster}
              activeDocId={characterData['character-doc-id']}
              onToggleVttLock={togglePersonaVttLock}
              onSelectCharacter={(docId) => {
                handleSelectCharacter(docId, 'identity');
              }}
              onNewCharacter={() => {
                handleCreateNewBlankCharacter({ saveCurrent: true });
              }}
              onGuidedCreator={() => {
                setIsGuidedCreatorOpen(true);
              }}
              onDuplicateCharacter={duplicateRosterCharacter}
              onDeleteCharacter={deleteRosterCharacter}
              onUpdateNote={updateRosterCharacterNote}
              onToggleVisibility={togglePersonaVisibility}
              onToggleNetworkEngaged={togglePersonaNetworkEngaged}
              onLoadPublicGallery={loadPublicPersonas}
              publicCatalog={publicCatalog}
              onSelectPublicPersona={(char) => {
                handleLoadCloud(char.id);
                handleSelectTab('identity', char.id);
              }}
              onClonePublicPersona={(char) => {
                clonePublicPersona(char);
                handleSelectTab('identity');
              }}
            />
          ) : (viewMode === 'play' || viewMode === 'preview') ? (
            <TacticalPlayView 
              onSwitchToBuilder={() => setViewMode('builder')} 
              isPreview={!isLocked}
              onLockSheet={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                if (lockPersona) {
                  const ok = lockPersona();
                  if (ok) setViewMode('play');
                }
              }}
            />
          ) : (
            <>
              {activeTab === 'identity' && (
                <IdentityTab
                  onOpenSelectorModal={handleOpenSelectorModal}
                  onOpenAssetModal={handleOpenAssetModal}
                  onReturnToCatalog={handleReturnToCatalog}
                />
              )}
              {activeTab === 'core-stats' && (
                <CoreStatsTab />
              )}
              {activeTab === 'skills' && (
                <SkillsTab
                  onOpenAddSkillModal={handleOpenAddSkillModal}
                  onOpenSelectorModal={handleOpenSelectorModal}
                  onOpenAssetModal={handleOpenAssetModal}
                />
              )}
              {(activeTab === 'features' || activeTab?.startsWith('features-') || activeTab === 'abilities') && (
                <FeaturesTab
                  activeSection={
                    activeTab === 'features' ? 'overview' :
                    activeTab === 'features-traits' ? 'traits' :
                    activeTab === 'features-hindrances' ? 'hindrances' :
                    activeTab === 'features-augmentations' ? 'augmentations' :
                    activeTab === 'features-metaphysics' || activeTab === 'features-awakened' ? 'metaphysics' :
                    activeTab === 'features-standard' ? 'features' :
                    'overview'
                  }
                  onBackToHub={() => handleSelectTab('features')}
                  onNavigate={(tabId) => handleSelectTab(tabId)}
                  onOpenSelectorModal={handleOpenSelectorModal}
                  onOpenAssetModal={handleOpenAssetModal}
                  onOpenMetaphysicsModal={() => setIsMetaphysicsOpen(true)}
                />
              )}
              {activeTab === 'combat' && (
                <CombatTab
                  onOpenSelectorModal={handleOpenSelectorModal}
                  onOpenAssetModal={handleOpenAssetModal}
                  onSwitchToTactical={() => setViewMode('play')}
                />
              )}
              {activeTab === 'companions' && (
                <CompanionsTab />
              )}
              {(activeTab === 'property' || activeTab?.startsWith('property-') || activeTab === 'combat-gear') && (
                <PropertyTab
                  activeSection={
                    activeTab === 'property'
                      ? 'all'
                      : activeTab === 'combat-gear'
                      ? 'gear'
                      : (activeTab?.replace('property-', '') || 'all')
                  }
                  onBackToHub={() => handleSelectTab('property')}
                  onNavigate={(tabId) => handleSelectTab(tabId)}
                  onOpenSelectorModal={handleOpenSelectorModal}
                  onOpenAssetModal={handleOpenAssetModal}
                />
              )}
              {activeTab === 'narrative' && (
                <NarrativeTab />
              )}
              {(activeTab === 'media' || activeTab === 'visuals') && (
                <MediaTab />
              )}
              {activeTab === 'other' && (
                <OtherTab />
              )}
            </>
          )}
        </div>
      </div>
      </div>

      {/* Modals & Drawers */}
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        onAddSkill={handleAddSkill}
        onAddSpecialization={handleAddSpecialization}
        availableSkills={availableSkillsForModal}
        initialMode={addSkillModalMode}
      />
      {isSelectorOpen && (
        <React.Suspense fallback={null}>
          <CustomSelectorModal
            isOpen={isSelectorOpen}
            onClose={() => setIsSelectorOpen(false)}
            modalConfig={selectorConfig}
            onSelectItem={handleSelectItem}
            onOpenAssetModal={handleOpenAssetModal}
          />
        </React.Suspense>
      )}
      {isAssetModalOpen && (
        <React.Suspense fallback={null}>
          <AssetModal
            isOpen={isAssetModalOpen}
            onClose={() => setIsAssetModalOpen(false)}
            modalConfig={assetModalConfig}
            onSaveAsset={handleSaveAssetItem}
            onDeleteAsset={handleDeleteAssetItem}
          />
        </React.Suspense>
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          await handleCreateNewBlankCharacter({ saveCurrent: false });
        }}
        title="Reset Persona Sheet"
        message="Are you sure you want to start a new character? Unsaved changes will be cleared."
      />
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCurrentCharacter}
        title="Delete Persona"
        message={`Are you sure you want to permanently delete character "${characterData['char-name'] || 'Unnamed Persona'}" from your roster and clear this sheet?`}
      />

      {/* Code-Split Heavy Modals & Drawers */}
      <React.Suspense fallback={null}>
        {isEconomyOpen && (
          <EconomyModal
            isOpen={isEconomyOpen}
            onClose={() => setIsEconomyOpen(false)}
            characterData={characterData}
            updateField={updateField}
            economyBreakdown={economyBreakdown}
          />
        )}
        {isPreviewOpen && (
          <PreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            characterData={characterData}
          />
        )}
        {isRosterOpen && (
          <RosterModal
            isOpen={isRosterOpen}
            onClose={() => setIsRosterOpen(false)}
            personaRoster={personaRoster}
            activeDocId={characterData['character-doc-id']}
            onToggleVttLock={togglePersonaVttLock}
            onSelectCharacter={(docId) => {
              handleSelectCharacter(docId, 'identity');
              setIsRosterOpen(false);
            }}
            onNewCharacter={() => {
              handleCreateNewBlankCharacter({ saveCurrent: true });
              setIsRosterOpen(false);
            }}
            onGuidedCreator={() => {
              setIsGuidedCreatorOpen(true);
            }}
            onDuplicateCharacter={duplicateRosterCharacter}
            onDeleteCharacter={deleteRosterCharacter}
            onUpdateNote={updateRosterCharacterNote}
            onToggleVisibility={togglePersonaVisibility}
            onToggleNetworkEngaged={togglePersonaNetworkEngaged}
            onLoadPublicGallery={loadPublicPersonas}
            publicCatalog={publicCatalog}
            onSelectPublicPersona={(char) => {
              handleLoadCloud(char.id);
              handleSelectTab('identity', char.id);
              setIsRosterOpen(false);
            }}
            onClonePublicPersona={(char) => {
              clonePublicPersona(char);
              handleSelectTab('identity');
              setIsRosterOpen(false);
            }}
          />
        )}
        {isBastionOpen && (
          <BastionDrawer
            isOpen={isBastionOpen}
            onClose={() => setIsBastionOpen(false)}
          />
        )}
        {isGuideOpen && (
          <FolioGuideModal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        )}
        {isGuidedCreatorOpen && (
          <GuidedCreatorModal
            isOpen={isGuidedCreatorOpen}
            onClose={() => setIsGuidedCreatorOpen(false)}
            onCharacterCreated={(createdDocId) => {
              if (createdDocId) {
                switchRosterCharacter(createdDocId);
              }
              handleSelectTab('identity', createdDocId);
            }}
          />
        )}
        {isSettingsOpen && (
          <UserSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
        {isMetaphysicsOpen && (
          <MetaphysicsModal
            isOpen={isMetaphysicsOpen}
            onClose={() => setIsMetaphysicsOpen(false)}
          />
        )}
        {isTrackedModsOpen && (
          <TrackedModificationsModal
            isOpen={isTrackedModsOpen}
            onClose={() => setIsTrackedModsOpen(false)}
            modifications={trackedModifications}
            onRevert={(modId) => revertTrackedModification(modId)}
          />
        )}
        {/* Print-only Folio Output */}
        <div className="hidden print:block">
          <PrintFolio characterData={characterData} />
        </div>
      </React.Suspense>

      {/* Save & System Notification Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FolioContainer;
