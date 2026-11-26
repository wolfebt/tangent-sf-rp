import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import {
  ELEMENT_TYPES,
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  getTypePillStyle,
  getElementFileExtension,
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory
} from './elementSchemas';
import { useAdeStore } from '../store/adeStore';
import EditElementModal from './EditElementModal';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout';
import { AudioService } from '../../../services/audioService';
import { Sparkles, Palette, BookOpen, Plus, Search, Wand2, X, Upload, Download, Database, RefreshCw, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { ElementCardActions } from './components/ElementCardActions';
import { DbmBulkPinModal } from './components/DbmBulkPinModal';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import DOMPurify from 'dompurify';
import { downloadElementMarkdownFile } from '../../../services/elementIngestionService.js';
import { downloadAimeAssetFile, downloadAimeAssetBundle, batchIngestAimeFiles } from '../../../services/aimeAssetFileService.js';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { pullElementFromOmnicortexDBM } from '../../../utils/storyAssetAdapter.js';
import {
  buildUnifiedAdeCatalog,
  ADE_TYPE_TO_CORTEX_COLLECTIONS,
  CORTEX_BACKED_ADE_TYPES,
  projectOmnicortexRecordToAdeElement
} from '../../../utils/cortexAdeAssetBridge.js';
import { persistAdeElement } from '../../../utils/adeElementPersistence.js';
import { buildArtistConceptPatch } from '../../../services/artistHubFramework';

const EMPTY_ARRAY = [];
const EMPTY_OBJ = {};
const PAGE_BATCH_SIZE = 48;

export const ElementForge = ({ onBackToStory, activeType: propActiveType, onSelectType, hideSidebar = false }) => {
  const navigate = useNavigate();
  const { elementsCatalog, updateSavedElement, deleteSavedElement, toggleElementVisibility, loadPublicElements, universeState, activeScenarioId, isStoryReadOnly = false } = useCampaign();
  const { isAdmin = false } = useAuth() || {};
  const storeActiveElementType = useAdeStore((state) => state.activeElementType);
  const setStoreActiveElementType = useAdeStore((state) => state.setActiveElementType);
  const activePropertySubcategory = useAdeStore((state) => state.activePropertySubcategory || 'all');
  const setActivePropertySubcategory = useAdeStore((state) => state.setActivePropertySubcategory);
  const activePersonaSource = useAdeStore((state) => state.activePersonaSource || 'all');
  const setActivePersonaSource = useAdeStore((state) => state.setActivePersonaSource);
  const activeMetaphysicsSubcategory = useAdeStore((state) => state.activeMetaphysicsSubcategory || 'all');
  const setActiveMetaphysicsSubcategory = useAdeStore((state) => state.setActiveMetaphysicsSubcategory);
  
  const [localActiveType, setLocalActiveType] = useState(ELEMENT_TYPES[0]);
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'module' | 'cortex'
  const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc' | 'name_desc' | 'updated' | 'origin'
  const activeType = normalizeElementType(propActiveType || storeActiveElementType || localActiveType || ELEMENT_TYPES[0]);

  const setActiveType = (nextType) => {
    const normalized = normalizeElementType(nextType);
    setLocalActiveType(normalized);
    setSourceFilter('all');
    if (setStoreActiveElementType) setStoreActiveElementType(normalized);
    if (onSelectType) onSelectType(normalized);
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState('guided');
  const [modalInitialSeedTab, setModalInitialSeedTab] = useState('spark');
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('tangent_ade_forge_view_mode') || 'card';
    } catch {
      return 'card';
    }
  });
  const handleSetViewMode = (nextMode) => {
    setViewMode(nextMode);
    try {
      localStorage.setItem('tangent_ade_forge_view_mode', nextMode);
    } catch {
      // ignore storage errors
    }
  };
  const [isAimeFlyoutOpen, setIsAimeFlyoutOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processImportFiles = async (files) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before importing assets.' });
      return;
    }
    const results = await batchIngestAimeFiles(files);
    let count = 0;
    for (const res of results) {
      if (res.success && res.element) {
        const cleanFields = { ...(res.element.fields || {}) };
        delete cleanFields.dbmRef;
        delete cleanFields.dbmId;
        delete cleanFields.dbmCategory;
        const normalizedType = normalizeElementType(res.element.type);
        const techSub =
          res.element.type === 'Technology' && !res.element.propertySubcategory && !cleanFields.propertySubcategory
            ? 'technology'
            : undefined;
        if (techSub) {
          cleanFields.propertySubcategory = techSub;
        }
        const normalizedElem = {
          ...res.element,
          type: normalizedType,
          ...(techSub ? { propertySubcategory: techSub } : {}),
          fields: cleanFields,
          dbmSyncStatus: 'standalone'
        };
        delete normalizedElem.isCortexAsset;
        delete normalizedElem.isFolioPersona;
        delete normalizedElem.isPinnedToModule;
        delete normalizedElem.folioDocId;
        delete normalizedElem.dbmId;
        delete normalizedElem.dbmCategory;
        delete normalizedElem.dbmRef;
        const saved = await updateSavedElement(normalizedElem.id, normalizedElem);
        if (saved !== false && saved !== null) count++;
      }
    }
    if (count > 0) {
      showToast({ type: 'success', text: `Ingested ${count} AIME portable asset(s)!` });
    } else {
      showToast({ type: 'warning', text: 'No valid element files could be ingested.' });
    }
  };

  // Omnicortex DBM & Persona Folio Live State
  const { dbData = EMPTY_OBJ, saveEntry, deleteEntry: dbmDeleteEntry } = useDBM() || EMPTY_OBJ;
  const {
    roster: folioRoster = EMPTY_ARRAY,
    personaRoster = EMPTY_ARRAY,
    publicPersonas = EMPTY_ARRAY,
    publicCatalog = EMPTY_ARRAY,
    saveCurrentToRoster,
    switchRosterCharacter
  } = useFolio() || EMPTY_OBJ;
  const liveFolioRoster = useMemo(
    () => (Array.isArray(folioRoster) && folioRoster.length > 0 ? folioRoster : (Array.isArray(personaRoster) ? personaRoster : EMPTY_ARRAY)),
    [folioRoster, personaRoster]
  );
  const livePublicPersonas = useMemo(
    () => (Array.isArray(publicPersonas) && publicPersonas.length > 0 ? publicPersonas : (Array.isArray(publicCatalog) ? publicCatalog : EMPTY_ARRAY)),
    [publicPersonas, publicCatalog]
  );

  const [isDbmImportOpen, setIsDbmImportOpen] = useState(false);
  const [selectedDbmIds, setSelectedDbmIds] = useState(new Set());
  const [dbmSearchTerm, setDbmSearchTerm] = useState('');

  // Discover matching DBM canonical records for the active element type (for bulk Story Module pinning)
  const matchingDbmItems = useMemo(() => {
    if (!dbData) return EMPTY_ARRAY;
    const cols = ADE_TYPE_TO_CORTEX_COLLECTIONS[activeType] || EMPTY_ARRAY;
    const items = [];
    for (const col of cols) {
      for (const entry of dbData[col] || EMPTY_ARRAY) {
        if (!entry || typeof entry !== 'object') continue;
        items.push({
          ...entry,
          dbmCategory: col,
          title: entry.name || entry.title || entry.factionName || entry.speciesName || 'Cortex Asset'
        });
      }
    }
    return items;
  }, [dbData, activeType]);

  const handleImportSelectedDbm = async () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before pinning DBM entries.' });
      return;
    }
    if (selectedDbmIds.size === 0) return;
    const itemsToImport = matchingDbmItems.filter(item => selectedDbmIds.has(item.id));
    let count = 0;
    for (const item of itemsToImport) {
      const projected = projectOmnicortexRecordToAdeElement(item, item.dbmCategory) || {};
      const resolvedType = projected.type || activeType;
      const newElem = {
        ...projected,
        id: `elem_dbm_${item.dbmCategory}_${item.id || Date.now()}`,
        title: projected.title || item.title || item.name || 'Omnicortex Element',
        type: resolvedType,
        ...(resolvedType === 'Property' && !projected.propertySubcategory ? { propertySubcategory: item.dbmCategory } : {}),
        ...(resolvedType === 'Metaphysics' && !projected.metaphysicsSubcategory ? { metaphysicsSubcategory: item.dbmCategory } : {}),
        ...(resolvedType === 'Persona' && item.dbmCategory === 'modular_characters' ? { personaSubcategory: 'mcm' } : {}),
        content: projected.content || item.description || item.concept || item.notes || item.summary || '',
        dbmSyncStatus: 'synced',
        dbmCategory: item.dbmCategory,
        dbmId: item.id,
        fields: {
          dbmRef: item.id,
          dbmId: item.id,
          dbmCategory: item.dbmCategory,
          ...(resolvedType === 'Property' ? { propertySubcategory: projected.propertySubcategory || item.dbmCategory } : {}),
          ...(resolvedType === 'Metaphysics' ? { metaphysicsSubcategory: projected.metaphysicsSubcategory || item.dbmCategory } : {}),
          ...item,
          ...(projected.fields || {})
        }
      };
      const saved = await updateSavedElement(newElem.id, newElem);
      if (saved !== false && saved !== null) count++;
    }
    showToast({ type: 'success', text: `Pinned ${count} ${activeType} element(s) from OmniCortex into Story Module!` });
    setSelectedDbmIds(new Set());
    setIsDbmImportOpen(false);
  };

  const handleRefreshAllDbmLinks = async () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before refreshing pinned elements.' });
      return;
    }
    const linked = (elementsCatalog || EMPTY_ARRAY).filter(el => el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId);
    if (linked.length === 0) {
      showToast({ type: 'info', text: 'No DBM-linked elements found in this Story Module.' });
      return;
    }
    let updatedCount = 0;
    for (const el of linked) {
      const updated = pullElementFromOmnicortexDBM(el, dbData);
      if (updated) {
        await updateSavedElement(updated.id, updated);
        updatedCount++;
      }
    }
    showToast({ type: 'success', text: `Refreshed ${updatedCount} element(s) with canonical OmniCortex DBM records!` });
  };

  // Unified Cortex + Codex + Folio + MCM + Story Module Catalog
  const unifiedCatalog = useMemo(
    () =>
      buildUnifiedAdeCatalog({
        elementsCatalog: elementsCatalog || EMPTY_ARRAY,
        dbData,
        folioRoster: liveFolioRoster,
        publicPersonas: livePublicPersonas
      }),
    [elementsCatalog, dbData, liveFolioRoster, livePublicPersonas]
  );

  // Pre-group elements by canonical type in a single pass so tab switching is an O(1) Map lookup
  const elementsByTypeMap = useMemo(() => {
    const map = new Map();
    for (const t of ELEMENT_TYPES) {
      map.set(t, []);
    }
    for (const el of unifiedCatalog) {
      const t = normalizeElementType(el.type);
      let bucket = map.get(t);
      if (!bucket) {
        bucket = [];
        map.set(t, bucket);
      }
      bucket.push(el);
    }
    return map;
  }, [unifiedCatalog]);

  const typeElements = useMemo(
    () => elementsByTypeMap.get(activeType) || EMPTY_ARRAY,
    [elementsByTypeMap, activeType]
  );

  // Precompute source & subcategory counts in a single pass over typeElements
  const filterCounts = useMemo(() => {
    let cortex = 0;
    let modulePinned = 0;
    let moduleLocal = 0;
    let publicShared = 0;
    const propertySub = {};
    const personaSub = {};
    const metaphysicsSub = {};

    for (const e of typeElements) {
      if (e.isCortexAsset || e.isFolioPersona) cortex++;
      else moduleLocal++;
      if (e.isPinnedToModule) modulePinned++;
      if (e.isPublic) publicShared++;

      if (activeType === 'Property') {
        const sub = e.propertySubcategory || inferPropertySubcategory(e);
        propertySub[sub] = (propertySub[sub] || 0) + 1;
      } else if (activeType === 'Persona') {
        const pSub = e.personaSubcategory || (e.isFolioPersona ? 'folio' : e.dbmCategory === 'modular_characters' ? 'mcm' : 'story');
        personaSub[pSub] = (personaSub[pSub] || 0) + 1;
      } else if (activeType === 'Metaphysics') {
        const mSub = e.metaphysicsSubcategory || inferMetaphysicsSubcategory(e);
        metaphysicsSub[mSub] = (metaphysicsSub[mSub] || 0) + 1;
      }
    }
    return { cortex, modulePinned, moduleLocal, publicShared, propertySub, personaSub, metaphysicsSub };
  }, [typeElements, activeType]);

  // Filter & sort elements by source scope, subcategory, search term, and sort order
  const filteredElements = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const isCortexType = CORTEX_BACKED_ADE_TYPES.has(activeType);
    const list = typeElements.filter((el) => {
      if (sourceFilter === 'module') {
        if (isCortexType ? !el.isPinnedToModule : (el.isCortexAsset || el.isFolioPersona)) return false;
      }
      if (sourceFilter === 'cortex' && isCortexType && !el.isCortexAsset && !el.isFolioPersona) return false;
      if (sourceFilter === 'public' && !el.isPublic) return false;

      if (activeType === 'Property' && activePropertySubcategory !== 'all') {
        const sub = el.propertySubcategory || inferPropertySubcategory(el);
        if (sub !== activePropertySubcategory) return false;
      }

      if (activeType === 'Persona' && activePersonaSource !== 'all') {
        const pSub = el.personaSubcategory || (el.isFolioPersona ? 'folio' : el.dbmCategory === 'modular_characters' ? 'mcm' : 'story');
        if (pSub !== activePersonaSource) return false;
      }

      if (activeType === 'Metaphysics' && activeMetaphysicsSubcategory !== 'all') {
        const mSub = el.metaphysicsSubcategory || inferMetaphysicsSubcategory(el);
        if (mSub !== activeMetaphysicsSubcategory) return false;
      }

      if (q) {
        const haystack = el.searchHaystack || [
          el.title,
          el.name,
          el.dbmCategory,
          el.propertySubcategory,
          el.metaphysicsSubcategory,
          el.fields?.oneLinePitch,
          el.fields?.summary,
          el.fields?.archetype,
          el.fields?.discipline,
          el.fields?.faction_type,
          el.fields?.tags,
          el.fields?.keywords,
          el.content
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sortBy === 'name_desc') {
      return [...list].sort((a, b) => String(b.title || b.name || '').localeCompare(String(a.title || a.name || '')));
    }
    if (sortBy === 'updated') {
      return [...list].sort((a, b) => {
        const tsA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
        const tsB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
        if (tsB !== tsA) return tsB - tsA;
        return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''));
      });
    }
    if (sortBy === 'origin') {
      const originRank = (el) =>
        el.isPinnedToModule ? 0 : (!el.isCortexAsset && !el.isFolioPersona ? 1 : el.isFolioPersona ? 2 : 3);
      return [...list].sort((a, b) => {
        const rankDiff = originRank(a) - originRank(b);
        if (rankDiff !== 0) return rankDiff;
        return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''));
      });
    }
    return [...list].sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')));
  }, [typeElements, sourceFilter, activeType, activePropertySubcategory, activePersonaSource, activeMetaphysicsSubcategory, searchTerm, sortBy]);

  // Progressive windowed rendering for large catalogs (e.g., Property 800+, Metaphysics 200+)
  const [visibleLimit, setVisibleLimit] = useState(PAGE_BATCH_SIZE);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setVisibleLimit(PAGE_BATCH_SIZE);
  }, [activeType, sourceFilter, activePropertySubcategory, activePersonaSource, activeMetaphysicsSubcategory, searchTerm]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || visibleLimit >= filteredElements.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleLimit((prev) => Math.min(prev + PAGE_BATCH_SIZE, filteredElements.length));
        }
      },
      { rootMargin: '320px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleLimit, filteredElements.length]);

  const visibleElements = useMemo(
    () => (filteredElements.length > visibleLimit ? filteredElements.slice(0, visibleLimit) : filteredElements),
    [filteredElements, visibleLimit]
  );

  const handleTogglePinToModule = async (el, e) => {
    if (e) e.stopPropagation();
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before pinning or unpinning elements.' });
      return;
    }
    AudioService.playTerminalBeep(1160, 0.025);

    if (el.isPinnedToModule && (el.isCortexAsset || el.isFolioPersona)) {
      const targetModuleId = el.moduleElementId || el.id;
      const ok = await deleteSavedElement(targetModuleId);
      if (ok !== false) {
        showToast({
          type: 'info',
          text: `Unpinned "${el.title || el.name}" from active Story Module (Cortex/Folio asset preserved).`
        });
      }
      return;
    }

    const pinId = el.moduleElementId || `pin_${el.id}`;
    const cleanSource = { ...el };
    delete cleanSource.cortexRaw;
    delete cleanSource.searchHaystack;
    delete cleanSource.previewText;
    delete cleanSource.personaData;
    delete cleanSource.vttUnitData;

    const pinnedElem = {
      ...cleanSource,
      id: pinId,
      moduleElementId: pinId,
      type: normalizeElementType(el.type),
      isPinnedToModule: true,
      dbmSyncStatus: el.isCortexAsset ? 'synced' : (el.dbmSyncStatus || 'standalone'),
      fields: {
        ...(el.fields || {}),
        ...(el.dbmId ? { dbmRef: el.dbmId, dbmId: el.dbmId, dbmCategory: el.dbmCategory } : {})
      },
      updatedAt: new Date().toISOString()
    };
    const saved = await updateSavedElement(pinnedElem.id, pinnedElem);
    if (saved !== false && saved !== null) {
      showToast({
        type: 'success',
        text: `Pinned "${pinnedElem.title || pinnedElem.name}" into active Story Module!`
      });
    }
  };

  const activeScenario = useMemo(() => {
    const list = universeState?.scenarios || [];
    const targetId = activeScenarioId || universeState?.activeScenarioId;
    const findNode = (nodes) => {
      for (const n of nodes || []) {
        if (n.id === targetId) return n;
        if (n.children?.length) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(list) || list[0] || null;
  }, [universeState, activeScenarioId]);

  const handleCreateNew = () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before creating elements.' });
      return;
    }
    AudioService.playTerminalBeep(1180, 0.03);
    setModalInitialMode('guided');
    setModalInitialSeedTab('spark');
    const seedSubcategory =
      activeType === 'Property'
        ? (activePropertySubcategory !== 'all' ? activePropertySubcategory : 'gear')
        : undefined;
    const seedPersonaTrack =
      activeType === 'Persona'
        ? (activePersonaSource !== 'all' ? activePersonaSource : 'story')
        : undefined;
    const seedMetaphysicsSub =
      activeType === 'Metaphysics'
        ? (activeMetaphysicsSubcategory !== 'all' ? activeMetaphysicsSubcategory : 'invocations')
        : undefined;
    setSelectedElement({
      id: `elem_${Date.now()}`,
      title: '',
      type: activeType,
      ...(seedSubcategory ? { propertySubcategory: seedSubcategory } : {}),
      ...(seedPersonaTrack ? { personaSubcategory: seedPersonaTrack } : {}),
      ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {}),
      content: '',
      fields: {
        ...(seedSubcategory ? { propertySubcategory: seedSubcategory, itemCategory: seedSubcategory } : {}),
        ...(seedPersonaTrack ? { personaSubcategory: seedPersonaTrack } : {}),
        ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {})
      }
    });
    setIsEditModalOpen(true);
  };

  const handleOpenBlueprints = () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before seeding blueprints.' });
      return;
    }
    AudioService.playTerminalBeep(1240, 0.03);
    setModalInitialMode('guided');
    setModalInitialSeedTab('blueprint');
    const seedSubcategory =
      activeType === 'Property'
        ? (activePropertySubcategory !== 'all' ? activePropertySubcategory : 'gear')
        : undefined;
    const seedMetaphysicsSub =
      activeType === 'Metaphysics'
        ? (activeMetaphysicsSubcategory !== 'all' ? activeMetaphysicsSubcategory : 'invocations')
        : undefined;
    setSelectedElement({
      id: `elem_${Date.now()}`,
      title: '',
      type: activeType,
      ...(seedSubcategory ? { propertySubcategory: seedSubcategory } : {}),
      ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {}),
      content: '',
      fields: {
        ...(seedSubcategory ? { propertySubcategory: seedSubcategory, itemCategory: seedSubcategory } : {}),
        ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {})
      }
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (el) => {
    setModalInitialMode('sheet');
    setModalInitialSeedTab('spark');
    setSelectedElement({
      ...el,
      type: normalizeElementType(el.type)
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedElement, options = {}) => {
    const res = await persistAdeElement({
      element: updatedElement,
      elementsCatalog,
      updateSavedElement,
      saveEntry,
      saveCurrentToRoster,
      showToast,
      isStoryReadOnly: Boolean(isStoryReadOnly),
      fromEditModal: true,
      isAdmin: Boolean(isAdmin)
    });
    if (!res) return null;
    if (options?.closeAfter !== false) {
      setIsEditModalOpen(false);
      setSelectedElement(null);
    }
    return res;
  };

  const handleDeleteAsset = async (el) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before deleting module elements.' });
      return false;
    }
    const targetModuleId = el.moduleElementId || el.id;
    const inModule = (elementsCatalog || []).some(e => e.id === el.id || e.id === el.moduleElementId);
    if (!inModule && (el.isCortexAsset || el.isFolioPersona || el.fields?.dbmRef || el.dbmRef || el.dbmId)) {
      return false;
    }
    return await deleteSavedElement(targetModuleId);
  };

  const handleOpenFolioAsset = (el) => {
    if (el?.folioDocId && typeof switchRosterCharacter === 'function') {
      switchRosterCharacter(el.folioDocId);
    }
    navigate('/folio');
  };

  const handleOpenCodexAsset = (el) => {
    if (el?.codexMatrixId) {
      navigate(`/codex?matrix=${el.codexMatrixId}`);
    }
  };

  const handlePullDbmAsset = async (el) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before pulling DBM updates.' });
      return;
    }
    const updated = pullElementFromOmnicortexDBM(el, dbData);
    if (updated) {
      await updateSavedElement(updated.id, updated);
      showToast({ type: 'success', text: `Pulled canonical updates from DBM for ${updated.title}!` });
    } else {
      showToast({ type: 'warning', text: `No matching record found in Omnicortex DBM for ${el.title}.` });
    }
  };

  const handleExportAimeAsset = (el) => {
    downloadAimeAssetFile(el);
    showToast({
      type: 'success',
      text: `Exported ${el.title || el.name} as portable ${getElementFileExtension(el.type, el.propertySubcategory)} asset!`
    });
  };

  const handleExportMarkdownAsset = (el) => {
    downloadElementMarkdownFile({ ...el, name: el.title || el.name });
    showToast({ type: 'info', text: `Exported ${el.title || el.name} to ELEMENTS.md markdown.` });
  };

  const handleDeleteDraftAsset = async (el) => {
    const targetName = el.title || 'Untitled Element';
    if (await confirmTypedDeletion(targetName, (el.type || 'story element').toLowerCase())) {
      await handleDeleteAsset(el);
    }
  };

  return (
    <div 
      className="flex h-full w-full overflow-hidden bg-[#0a0a0e] text-slate-100 font-sans relative select-none"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await processImportFiles(Array.from(e.dataTransfer.files));
        }
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-black/85 border-2 border-dashed border-amber-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in pointer-events-none">
          <Sparkles size={48} className="text-amber-400 animate-pulse mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            Drop Portable AIME Assets Here
          </h3>
          <p className="text-xs text-amber-200/80 max-w-md">
            Instantly ingest .persona, .property, .setting, .world, .species, .tech, .item, .philosophy, .scene, or .aime bundles into your project.
          </p>
        </div>
      )}

      {/* Forge Glow Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Left Sidebar for Element Types (only shown when standalone outside ADE Nav Rail) */}
      {!hideSidebar && (
        <aside className="w-64 h-full bg-[#0d1117]/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col shrink-0 p-4 gap-2 overflow-y-auto relative z-10">
          <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest px-2 mb-2 border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Element Types</span>
          </div>
          
          {ELEMENT_TYPES.map(type => {
            const isActive = activeType === type;
            return (
              <button
                key={type}
                onClick={() => { setActiveType(type); setSearchTerm(''); }}
                className={`w-full text-left px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-between group border ${
                  isActive
                    ? `${getTypePillStyle(type)} shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30`
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                <span className="truncate">{type}</span>
              </button>
            );
          })}
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 relative z-10">
        {/* Header Bar */}
        <div className="relative z-30 flex flex-wrap justify-between items-center mb-6 shrink-0 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg gap-4">
          <div className="flex items-center gap-3">
            {onBackToStory && (
              <button
                type="button"
                onClick={onBackToStory}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Return to Story Scenarios Canvas"
              >
                <span>←</span>
                <span>Story Canvas</span>
              </button>
            )}
            <select
              value={activeType}
              onChange={(e) => {
                setActiveType(e.target.value);
                setSearchTerm('');
              }}
              aria-label="Select Element Category"
              className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border cursor-pointer outline-none ${getTypePillStyle(activeType)}`}
              title="Switch Element Category (or use the ELEMENT FORGE branches in the left studio rail)"
            >
              {ELEMENT_TYPES.map((type) => (
                <option key={type} value={type} className="bg-slate-950 text-slate-200 font-mono">
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-wider uppercase">
                {activeType} Elements
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Search & View Mode Switcher (Folio-style) */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto min-w-0 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder={`Search ${activeType.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors font-mono"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('card')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'card' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Card Grid View"
                  aria-label="Card Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Table Directory View"
                  aria-label="Table Directory View"
                >
                  <List size={14} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort elements"
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-300 outline-none cursor-pointer shrink-0"
                title="Sort elements"
              >
                <option value="name_asc">Sort: A → Z</option>
                <option value="name_desc">Sort: Z → A</option>
                <option value="updated">Sort: Updated</option>
                <option value="origin">Sort: Module First</option>
              </select>
            </div>

            {/* Standard Primary Create Button */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transform hover:-translate-y-0.5 whitespace-nowrap border border-amber-500/50 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>Create {activeType}</span>
            </button>

            {/* Consolidated Forge Actions Pulldown */}
            <div className="relative z-40" ref={actionsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsActionsMenuOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={isActionsMenuOpen}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Forge Actions, Creative AI Tools, Ingestion & Canon Sync"
              >
                <Wand2 size={13} className="text-cyan-400" />
                <span className="uppercase text-slate-100 font-bold">Actions</span>
                <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>

              {isActionsMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar bg-[#0b101b]/98 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] py-1.5 z-[100] text-xs font-mono divide-y divide-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Group 1: AI Studio & Blueprints */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                      AI Studio &amp; Blueprints
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        handleOpenBlueprints();
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-cyan-300">Blueprints &amp; Guides</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">AIME</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsArtistHubOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-purple-950/60 text-slate-200 hover:text-purple-200 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-purple-300">Artist Hub</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-500/30">Art</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsAimeFlyoutOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-slate-200 hover:text-amber-200 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-amber-300">AIME {activeType} Guidance</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">AI</span>
                    </button>
                  </div>

                  {/* Group 2: Portable Asset I/O */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                      Portable Asset I/O
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-850 text-slate-200 hover:text-cyan-300 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Upload size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-cyan-300">Import Assets</span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">.aime / .md</span>
                    </button>

                    <button
                      type="button"
                      disabled={filteredElements.length === 0}
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        downloadAimeAssetBundle(filteredElements, `${activeType.toLowerCase()}_compendium`);
                        showToast({ type: 'success', text: `Exported ${filteredElements.length} ${activeType} elements to .aime bundle!` });
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-850 text-slate-200 hover:text-amber-300 flex items-center justify-between gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                      title={`Export all ${filteredElements.length} ${activeType} elements as portable .aime bundle`}
                    >
                      <div className="flex items-center gap-2">
                        <Download size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-amber-300">Export .aime Bundle</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {filteredElements.length}
                      </span>
                    </button>
                  </div>

                  {/* Group 3: Omnicortex Canon DBM */}
                  {((matchingDbmItems && matchingDbmItems.length > 0) || (elementsCatalog || []).some(el => el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId)) && (
                    <div className="py-1">
                      <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                        Omnicortex Canon DBM
                      </div>

                      {matchingDbmItems && matchingDbmItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            setIsDbmImportOpen(true);
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                          title={`Import existing canonical ${activeType} entries from Omnicortex DBM`}
                        >
                          <div className="flex items-center gap-2">
                            <Database size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-slate-200 group-hover:text-cyan-300">DBM Sync</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                            {matchingDbmItems.length}
                          </span>
                        </button>
                      )}

                      {(elementsCatalog || []).some(el => el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId) && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            handleRefreshAllDbmLinks();
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-teal-950/60 text-slate-200 hover:text-teal-300 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                          title="Refresh all DBM-linked elements with latest canon updates"
                        >
                          <div className="flex items-center gap-2">
                            <RefreshCw size={13} className="text-teal-400 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-slate-200 group-hover:text-teal-300">Refresh Canon</span>
                          </div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-400 border border-teal-500/30">Sync</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden input for asset import triggered via Actions Pulldown */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".persona,.property,.metaphysics,.item,.setting,.world,.species,.tech,.philosophy,.scene,.aime,.json,.md,.markdown"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  await processImportFiles(Array.from(e.target.files));
                }
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* Consolidated Source & Subcategory Filter Bars */}
        <div className="mb-4 flex flex-col gap-2 shrink-0 relative z-20">
          {/* Row 1: Source Scope Filter (Cortex / Folio / Story Module / Public) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 uppercase font-bold text-[10px] mr-1">Source:</span>
              {[
                { id: 'all', label: `All ${activeType}`, count: typeElements.length },
                ...(CORTEX_BACKED_ADE_TYPES.has(activeType)
                  ? [
                      { id: 'cortex', label: activeType === 'Persona' ? 'OmniCortex & Folio' : 'OmniCortex / Codex', count: filterCounts.cortex },
                      { id: 'module', label: 'Pinned in Story Module', count: filterCounts.modulePinned }
                    ]
                  : [
                      { id: 'module', label: 'Story Module', count: filterCounts.moduleLocal }
                    ]),
                { id: 'public', label: 'Public / Shared', count: filterCounts.publicShared || 0 }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1080, 0.02);
                    if (opt.id === 'public' && typeof loadPublicElements === 'function') {
                      loadPublicElements();
                    }
                    setSourceFilter(opt.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    sourceFilter === opt.id
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300">{opt.count}</span>
                </button>
              ))}
            </div>

            <span className="text-[10px] text-slate-400 hidden lg:inline">
              Showing <strong className="text-amber-300">{filteredElements.length}</strong> unified asset{filteredElements.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Row 2A: Property Subcategory Filter Pills */}
          {activeType === 'Property' && (
            <div className="flex flex-wrap items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/20 border border-amber-500/25 font-mono text-[11px]">
              <span className="text-amber-400/90 uppercase font-bold text-[10px] mr-1">Property Subcategory:</span>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (setActivePropertySubcategory) setActivePropertySubcategory('all');
                }}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer ${
                  activePropertySubcategory === 'all'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({typeElements.length})
              </button>
              {PROPERTY_SUBCATEGORIES.map((sub) => {
                const count = filterCounts.propertySub[sub.id] || 0;
                const active = activePropertySubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      if (setActivePropertySubcategory) setActivePropertySubcategory(sub.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.shortLabel}</span>
                    <span className="text-[9px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Row 2B: Persona Source Track Filter Pills */}
          {activeType === 'Persona' && (
            <div className="flex flex-wrap items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 font-mono text-[11px]">
              <span className="text-purple-300 uppercase font-bold text-[10px] mr-1">Persona Track:</span>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (setActivePersonaSource) setActivePersonaSource('all');
                }}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer ${
                  activePersonaSource === 'all'
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({typeElements.length})
              </button>
              {PERSONA_SUBCATEGORIES.map((sub) => {
                const count = filterCounts.personaSub[sub.id] || 0;
                const active = activePersonaSource === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      if (setActivePersonaSource) setActivePersonaSource(sub.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                    <span className="text-[9px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Row 2C: Metaphysics Subcategory Filter Pills */}
          {activeType === 'Metaphysics' && (
            <div className="flex flex-wrap items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-950/20 border border-violet-500/25 font-mono text-[11px]">
              <span className="text-violet-300 uppercase font-bold text-[10px] mr-1">Metaphysics Subcategory:</span>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (setActiveMetaphysicsSubcategory) setActiveMetaphysicsSubcategory('all');
                }}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer ${
                  activeMetaphysicsSubcategory === 'all'
                    ? 'bg-violet-950/90 border-violet-400 text-violet-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({typeElements.length})
              </button>
              {METAPHYSICS_SUBCATEGORIES.map((sub) => {
                const count = filterCounts.metaphysicsSub[sub.id] || 0;
                const active = activeMetaphysicsSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      if (setActiveMetaphysicsSubcategory) setActiveMetaphysicsSubcategory(sub.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-violet-950/90 border-violet-400 text-violet-200 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                    <span className="text-[9px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 relative z-0">
          {filteredElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="text-4xl mb-4 opacity-50">📂</div>
              <p className="text-sm">No {activeType} elements found.</p>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleCreateNew}
                  className="text-cyan-400 hover:text-cyan-300 underline text-xs font-bold cursor-pointer"
                >
                  Launch Guided Forge
                </button>
                <span className="text-slate-600">•</span>
                <button 
                  onClick={handleOpenBlueprints}
                  className="text-amber-400 hover:text-amber-300 underline text-xs font-bold cursor-pointer"
                >
                  Seed from Blueprints &amp; Guides
                </button>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-6">
                  {visibleElements.map(el => {
                    const subLabel =
                      el.type === 'Property'
                        ? (el.propertySubcategory || inferPropertySubcategory(el)).toUpperCase()
                        : el.type === 'Metaphysics'
                        ? (el.metaphysicsSubcategory || inferMetaphysicsSubcategory(el)).toUpperCase()
                        : el.type === 'Persona'
                        ? (el.isFolioPersona ? 'FOLIO' : el.dbmCategory === 'modular_characters' ? 'MCM' : 'STORY')
                        : (el.dbmCategory ? el.dbmCategory.toUpperCase() : '');
                    const previewPitch = el.fields?.oneLinePitch || el.fields?.summary || el.previewText || '';

                    return (
                    <div 
                      key={el.id} 
                      className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/80 hover:shadow-[0_8px_24px_rgba(245,158,11,0.1)] transition-colors duration-150 flex flex-col justify-between group cursor-pointer"
                      onClick={() => handleEdit(el)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="text-base font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1 tracking-wide">
                            {el.title || el.name || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {subLabel && (
                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-300 border border-slate-700/80 uppercase font-bold">
                                {subLabel}
                              </span>
                            )}
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                              el.isFolioPersona
                                ? 'bg-purple-950/80 text-purple-200 border-purple-500/50 shadow-sm'
                                : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId || el.dbmSyncStatus === 'synced')
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                                : el.dbmSyncStatus === 'local_override'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}>
                              {el.isFolioPersona
                                ? '🪪 Folio'
                                : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId || el.dbmSyncStatus === 'synced')
                                ? '⚡ Cortex'
                                : el.dbmSyncStatus === 'local_override'
                                ? '▲ Override'
                                : '○ Module'}
                            </span>
                          </div>
                        </div>
                        
                        {previewPitch && (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {previewPitch}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 mt-3 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono truncate max-w-[115px]">
                          {el.isPinnedToModule ? '📌 In Module' : el.isFolioPersona ? 'Folio Roster' : el.isCortexAsset ? 'OmniCortex' : 'Module Draft'}
                        </span>
                        <ElementCardActions
                          el={el}
                          variant="card"
                          isStoryReadOnly={isStoryReadOnly}
                          onTogglePin={handleTogglePinToModule}
                          onOpenFolio={handleOpenFolioAsset}
                          onOpenCodex={handleOpenCodexAsset}
                          onPullFromDbm={handlePullDbmAsset}
                          onExportAime={handleExportAimeAsset}
                          onExportMarkdown={handleExportMarkdownAsset}
                          onDeleteDraft={handleDeleteDraftAsset}
                          onEdit={handleEdit}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                /* Table Directory View (Folio-matched) */
                <div className="bg-[#121722]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs text-slate-300">
                      <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Asset Name</th>
                          <th className="py-3 px-4">Subcategory</th>
                          <th className="py-3 px-4">Summary / Pitch</th>
                          <th className="py-3 px-4">Source</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {visibleElements.map(el => {
                          const subLabel =
                            el.type === 'Property'
                              ? (el.propertySubcategory || inferPropertySubcategory(el)).toUpperCase()
                              : el.type === 'Metaphysics'
                              ? (el.metaphysicsSubcategory || inferMetaphysicsSubcategory(el)).toUpperCase()
                              : el.type === 'Persona'
                              ? (el.isFolioPersona ? 'FOLIO' : el.dbmCategory === 'modular_characters' ? 'MCM' : 'STORY')
                              : (el.dbmCategory ? el.dbmCategory.toUpperCase() : (el.type || activeType).toUpperCase());
                          const previewPitch = el.fields?.oneLinePitch || el.fields?.summary || el.previewText || '';

                          return (
                            <tr
                              key={el.id}
                              onClick={() => handleEdit(el)}
                              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            >
                              <td className="py-3 px-4 font-bold text-white uppercase group-hover:text-amber-300 transition-colors whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {el.isPinnedToModule && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Pinned in Active Story Module" />
                                  )}
                                  <span className="truncate max-w-[240px]">{el.title || el.name || 'Untitled'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-300 border border-slate-700/80 uppercase font-bold">
                                  {subLabel || activeType}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 max-w-md">
                                <div className="line-clamp-1 text-[11px]">
                                  {previewPitch || '—'}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                                  el.isFolioPersona
                                    ? 'bg-purple-950/80 text-purple-200 border-purple-500/50 shadow-sm'
                                    : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId || el.dbmSyncStatus === 'synced')
                                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                                    : el.dbmSyncStatus === 'local_override'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                                }`}>
                                  {el.isFolioPersona
                                    ? '🪪 Folio'
                                    : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId || el.dbmSyncStatus === 'synced')
                                    ? '⚡ Cortex'
                                    : el.dbmSyncStatus === 'local_override'
                                    ? '▲ Override'
                                    : '○ Module'}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-[10px] text-slate-400 uppercase tracking-wider">
                                {el.isPinnedToModule ? '📌 In Module' : el.isFolioPersona ? 'Folio Roster' : el.isCortexAsset ? 'OmniCortex' : 'Module Draft'}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <ElementCardActions
                                  el={el}
                                  variant="table"
                                  isStoryReadOnly={isStoryReadOnly}
                                  onTogglePin={handleTogglePinToModule}
                                  onOpenFolio={handleOpenFolioAsset}
                                  onOpenCodex={handleOpenCodexAsset}
                                  onPullFromDbm={handlePullDbmAsset}
                                  onExportAime={handleExportAimeAsset}
                                  onExportMarkdown={handleExportMarkdownAsset}
                                  onDeleteDraft={handleDeleteDraftAsset}
                                  onEdit={handleEdit}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {visibleLimit < filteredElements.length && (
                <div ref={loadMoreRef} className="flex justify-center pb-8 pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit((prev) => Math.min(prev + PAGE_BATCH_SIZE, filteredElements.length))}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs font-mono font-bold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Show More ({filteredElements.length - visibleElements.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Artist Hub Modal */}
      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
          onApplyAsset={async (asset) => {
            if (isStoryReadOnly) {
              showToast?.({ type: 'warning', text: 'Read-only story: unlock or clone this project before applying Artist Hub art.' });
              return;
            }
            const seedSubcategory =
              activeType === 'Property'
                ? (activePropertySubcategory !== 'all' ? activePropertySubcategory : 'gear')
                : undefined;
            const seedPersonaTrack =
              activeType === 'Persona'
                ? (activePersonaSource !== 'all' ? activePersonaSource : 'story')
                : undefined;
            const seedMetaphysicsSub =
              activeType === 'Metaphysics'
                ? (activeMetaphysicsSubcategory !== 'all' ? activeMetaphysicsSubcategory : 'invocations')
                : undefined;
            const newId = `elem_${Date.now()}`;
            const title =
              asset?.sections?.subject?.trim()?.slice(0, 60) ||
              searchTerm?.trim() ||
              `${activeType} Concept`;
            const baseElem = {
              id: newId,
              title,
              type: activeType,
              ...(seedSubcategory ? { propertySubcategory: seedSubcategory } : {}),
              ...(seedPersonaTrack ? { personaSubcategory: seedPersonaTrack } : {}),
              ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {}),
              content: asset?.prompt || '',
              fields: {
                ...(seedSubcategory ? { propertySubcategory: seedSubcategory, itemCategory: seedSubcategory } : {}),
                ...(seedPersonaTrack ? { personaSubcategory: seedPersonaTrack } : {}),
                ...(seedMetaphysicsSub ? { metaphysicsSubcategory: seedMetaphysicsSub } : {})
              },
              createdAt: new Date().toISOString()
            };
            const nextElem = {
              ...baseElem,
              ...buildArtistConceptPatch(baseElem, asset, { fillContent: true })
            };
            const persisted = await persistAdeElement({
              element: nextElem,
              elementsCatalog,
              updateSavedElement,
              saveEntry,
              saveCurrentToRoster,
              showToast,
              isStoryReadOnly: Boolean(isStoryReadOnly),
              fromEditModal: false,
              isAdmin: Boolean(isAdmin)
            });
            if (persisted) {
              showToast?.({
                type: 'success',
                text: `Saved Artist Hub concept "${title}" to ${activeType} Forge.`
              });
            }
          }}
          initialPrompt={searchTerm ? `${searchTerm}` : ''}
          elementContext={{ type: activeType }}
        />
      )}

      {/* AIME Guidance Flyout */}
      {isAimeFlyoutOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeFlyoutOpen}
          onClose={() => setIsAimeFlyoutOpen(false)}
          targetType={activeType === 'Persona' ? 'Persona' : 'Story'}
          contextData={{
            category: activeType,
            catalogCount: filteredElements.length,
            sampleTitles: filteredElements.slice(0, 5).map(e => e.title)
          }}
        />
      )}

      {/* Omnicortex DBM Bulk Pin Modal (Read-only copy into Story Module) */}
      <DbmBulkPinModal
        isOpen={isDbmImportOpen}
        onClose={() => setIsDbmImportOpen(false)}
        activeType={activeType}
        matchingDbmItems={matchingDbmItems}
        elementsCatalog={elementsCatalog}
        searchTerm={dbmSearchTerm}
        onChangeSearchTerm={setDbmSearchTerm}
        selectedIds={selectedDbmIds}
        onChangeSelectedIds={setSelectedDbmIds}
        isStoryReadOnly={isStoryReadOnly}
        onImportSelected={handleImportSelectedDbm}
      />

      {/* Edit Modal (Dual-Mode Guided + Sheet Studio) */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedElement(null);
          }}
          element={selectedElement}
          onSave={handleSave}
          onDelete={(id) => (selectedElement ? handleDeleteAsset(selectedElement) : deleteSavedElement(id))}
          onDeleteCortex={
            isAdmin && typeof dbmDeleteEntry === 'function'
              ? (el) => dbmDeleteEntry(el?.dbmId || el?.fields?.dbmId || el?.fields?.dbmRef, el?.dbmCategory || el?.fields?.dbmCategory)
              : undefined
          }
          initialMode={modalInitialMode}
          initialSeedTab={modalInitialSeedTab}
          activeScenario={activeScenario}
        />
      )}
    </div>
  );
};

export default ElementForge;
